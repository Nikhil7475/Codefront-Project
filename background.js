// background.js

// === CONFIGURATION ===

const GEMINI_MODEL = "gemma-3-27b-it"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Optimization: 50ms delay to stay safe within Free Tier limits
const FLUSH_DELAY = 50; 
const BATCH_SIZE = 2;    

let messageBuffer = [];
let flushTimer = null;
let userApiKey = null;

// === 1. STORAGE MANAGEMENT ===
chrome.storage.local.get(["gemini_api_key"], (result) => {
  if (result.gemini_api_key) {
    userApiKey = result.gemini_api_key;
    console.log("Background: API Key loaded.");
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.gemini_api_key) {
    userApiKey = changes.gemini_api_key.newValue;
    console.log("Background: API Key updated.");
  }
});

// === 2. MESSAGE ROUTING ===
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "NEW_CHAT_BATCH") {
    const cleanBatch = request.payload.filter(msg => isWorthsending(msg.message));
    if (cleanBatch.length > 0) {
      addToBuffer(cleanBatch);
    }
  }
  return true;
});

function isWorthsending(text) {
  if (!text) return false;
  const t = text.trim();
  if (t.length < 3) return false; // Skip "hi", "yo"
  // Skip pure emoji messages
  const noEmoji = t.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, "");
  if (noEmoji.trim().length === 0) return false;
  return true;
}

function addToBuffer(messages) {
  messageBuffer.push(...messages);
  if (messageBuffer.length >= BATCH_SIZE) {
    processBuffer();
    if (flushTimer) clearTimeout(flushTimer);
  }
  if (!flushTimer) {
    flushTimer = setTimeout(processBuffer, FLUSH_DELAY);
  }
}

// === 3. AI PROCESSING (With 503 Retry Logic) ===
async function processBuffer() {
  flushTimer = null;
  if (messageBuffer.length === 0) return;

  if (!userApiKey) {
    broadcastError("API Key missing. Please check extension settings.");
    return;
  }

  const batch = messageBuffer.splice(0, BATCH_SIZE);

  try {
    // Attempt the call
    const classification = await callGeminiWithRetry(batch);
    if (classification && classification.length) {
      broadcastResults(classification);
    }
  } catch (error) {
    console.error("AI Fatal Error:", error);
    // Return the messages to the buffer so we don't lose them
    messageBuffer.unshift(...batch); 
    broadcastError(`System Busy: ${error.message}. Retrying...`);
  }
}


async function callGeminiWithRetry(messages, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await callGemini(messages);
    } catch (error) {
     
      if (error.message.includes("503") || error.message.includes("500")) {
        console.warn(`Gemini 503 Overload (Attempt ${i+1}/${retries}). Waiting...`);
        // Exponential Backoff: Wait 2s, then 4s, then 8s
        await new Promise(r => setTimeout(r, 2000 * Math.pow(2, i)));
      } else {
        // If it's a 400 or 404 error, retry won't help. Throw immediately.
        throw error;
      }
    }
  }
  throw new Error("Service Unavailable (503) after 3 attempts");
}

async function callGemini(messages) {
  const minifiedMessages = messages.map((m) => ({
    id: m.id,
    text: m.message.substring(0, 150) // Cap length to save tokens
  }));

  const prompt = {
    contents: [{
      role: "user",
      parts: [{
        text: `
Classify these YouTube chat messages for a teacher.
Return JSON ONLY: list of { "id": "...", "type": "QUESTION | NOTE | NOISE" }
Input:
${JSON.stringify(minifiedMessages)}
`
      }]
    }]
  };

  const cleanKey = userApiKey ? userApiKey.trim() : "";
  const response = await fetch(`${API_URL}?key=${cleanKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prompt)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    // Throw error with status code so Retry Logic can see it
    throw new Error(`Gemini API Error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!aiText) throw new Error("Empty AI response");

  const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

  let results;
  try {
    results = JSON.parse(cleanJson);
  } catch (e) {
    throw new Error("Invalid JSON from AI");
  }

  return results
    .map((res) => {
      const original = messages.find((m) => m.id === res.id);
      return original ? { ...original, category: res.type } : null;
    })
    .filter((item) => item && item.category !== "NOISE");
}

// === 4. UI COMMUNICATION ===
function broadcastResults(results) {
  chrome.runtime.sendMessage({ type: "ANALYSIS_COMPLETE", data: results }).catch(() => {});
}

function broadcastError(msg) {
  chrome.runtime.sendMessage({ type: "ERROR", message: msg }).catch(() => {});
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
});