document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation ---
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  const views = document.querySelectorAll('.view');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${item.dataset.view}`).classList.add('active');
    });
  });

  // --- Settings ---
  const settingsBtn = document.getElementById('settings-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  const saveKeyBtn = document.getElementById('save-key');
  const apiKeyInput = document.getElementById('api-key');
  const keyStatus = document.getElementById('key-status');

  settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));
  chrome.storage.local.get(['geminiApiKey'], (result) => { if (result.geminiApiKey) apiKeyInput.value = result.geminiApiKey; });
  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) chrome.storage.local.set({ geminiApiKey: key }, () => {
      keyStatus.textContent = "Saved!"; keyStatus.style.color = "green"; setTimeout(() => settingsPanel.classList.add('hidden'), 1000);
    });
  });

  // ==========================================
  //  PART 1: LIVE CHAT FILTERING
  // ==========================================
  const toggleChatBtn = document.getElementById('toggleChatBtn');
  const chatStatus = document.getElementById('chat-status');
  const chatFeed = document.getElementById('feed');
  const chatSubTabs = document.querySelectorAll('#view-chat .sub-tab');
  
  let isMonitoring = false;
  let connectionTimeout;
  let currentChatFilter = 'ALL'; // State for the active filter

  // --- Sub-Tab Filtering Logic ---
  chatSubTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 1. Visual update
      chatSubTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // 2. State update
      currentChatFilter = tab.getAttribute('data-filter');

      // 3. Apply filter to existing cards
      applyChatFilter();
    });
  });

  function applyChatFilter() {
    const cards = chatFeed.querySelectorAll('.chat-card');
    cards.forEach(card => {
      if (currentChatFilter === 'ALL') {
        card.style.display = 'block';
      } else {
        // Check if card has the class corresponding to filter (question or note)
        if (card.classList.contains(currentChatFilter.toLowerCase())) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      }
    });
  }

  // --- Monitoring Logic ---
  toggleChatBtn.addEventListener('click', async () => {
    if (!isMonitoring) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url.includes("youtube.com")) { chatStatus.textContent = "Not YouTube"; return; }
      
      chatStatus.textContent = "Connecting to chat...";
      chatFeed.innerHTML = ""; 
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        function: startChatScraper
      });

      connectionTimeout = setTimeout(() => {
        if (!isMonitoring) {
           chatStatus.textContent = "Error: Chat not found. Is it open?";
           chatStatus.style.color = "red";
        }
      }, 3000);

    } else {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      toggleChatBtn.textContent = "🔴 Start Monitoring";
      toggleChatBtn.classList.remove('active-monitoring');
      chatStatus.textContent = "Stopped";
      chatStatus.style.color = "#888";
      isMonitoring = false;
      chrome.tabs.sendMessage(tab.id, { action: "STOP_CHAT_SCRAPER" });
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CHAT_FOUND") {
      clearTimeout(connectionTimeout);
      isMonitoring = true;
      toggleChatBtn.textContent = "⏹ Stop Monitoring";
      toggleChatBtn.classList.add('active-monitoring');
      chatStatus.textContent = "Active: Filtering...";
      chatStatus.style.color = "green";
    }
    if (request.action === "CHAT_BATCH" && isMonitoring) {
      processChatBatch(request.messages);
    }
  });

  async function processChatBatch(messages) {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey || messages.length === 0) return;

    const prompt = `
      You are a classroom moderator. Filter these live chat messages.
      Discard spam, emojis, greetings, and irrelevant chatter.
      Keep only:
      1. ACADEMIC QUESTIONS (User asking for clarification)
      2. USEFUL NOTES (User defining a term or summarizing)
      
      Return ONLY a JSON array. Format:
      [{"type": "QUESTION", "author": "Name", "text": "Message content"}, {"type": "NOTE", "author": "Name", "text": "Message content"}]
      
      If nothing is relevant, return [].
    `;
    const msgBlock = messages.map(m => `${m.author}: ${m.message}`).join("\n");

    try {
        const resultText = await callGemini(apiKey, prompt, msgBlock, "gemma-3-27b-it");
        const jsonMatch = resultText.match(/\[.*\]/s);
        if (jsonMatch) {
            const items = JSON.parse(jsonMatch[0]);
            items.forEach(item => addChatCard(item));
        }
    } catch (e) { console.error(e); }
  }

  function addChatCard(item) {
    const card = document.createElement('div');
    const typeClass = item.type.toLowerCase(); // 'question' or 'note'
    
    card.className = `chat-card ${typeClass}`;
    card.innerHTML = `
      <div class="card-header">
        <span class="badge ${typeClass}">${item.type}</span>
        <span class="author">${item.author}</span>
      </div>
      <div class="card-body">${item.text}</div>
    `;

    // Immediately hide if it doesn't match current filter
    if (currentChatFilter !== 'ALL' && currentChatFilter !== item.type) {
        card.style.display = 'none';
    }

    chatFeed.prepend(card);
  }

  // ==========================================
  //  PART 2: TRANSCRIPT ANALYSIS
  // ==========================================
  const analyzeBtn = document.getElementById('analyzeBtn');
  const analyzeStatus = document.getElementById('analyze-status');
  const summaryDiv = document.getElementById('summary-content');
  const timelineDiv = document.getElementById('timeline-content');
  const formulaDiv = document.getElementById('formula-content');
  const rawTranscriptDiv = document.getElementById('rawTranscript');

  analyzeBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) { analyzeStatus.textContent = "Missing API Key"; return; }

    analyzeStatus.textContent = "Extracting...";
    analyzeBtn.disabled = true;
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getTranscriptAuto,
    }, async (results) => {
      if (!results || !results[0] || !results[0].result.success) {
        analyzeStatus.textContent = "No Transcript found"; analyzeBtn.disabled = false; return;
      }
      
      const transcript = results[0].result.data;
      rawTranscriptDiv.textContent = transcript;
      analyzeStatus.textContent = "Thinking...";
      
      generateSummary(apiKey, transcript);
      generateTimeline(apiKey, transcript);
      generateFormulas(apiKey, transcript);
      
      analyzeBtn.disabled = false;
    });
  });

  async function generateSummary(key, text) {
    try {
        const html = await callGemini(key, "Summarize this video. Use HTML <ul>, <li>.", text, "gemini-3-flash-preview");
        summaryDiv.innerHTML = html;
    } catch(e) { summaryDiv.innerHTML = "Error: " + e.message; }
  }

  async function generateTimeline(key, text) {
    try {
        const raw = await callGemini(key, "Create timestamped TOC: '[MM:SS] - Topic'.", text, "gemini-3-flash-preview");
        timelineDiv.innerHTML = raw.replace(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g, (m, t) => `<span class="timestamp-link" data-time="${t}">${m}</span>`).replace(/\n/g, '<br>');
        addTimestampListeners();
    } catch(e) { timelineDiv.innerHTML = "Error"; }
  }

  async function generateFormulas(key, text) {
    try {
        const html = await callGemini(key, "Extract formulas/notes. Use HTML.", text, "gemini-3-flash-preview");
        formulaDiv.innerHTML = html;
    } catch(e) { formulaDiv.innerHTML = "Error"; }
  }

  // --- Helpers ---
  async function callGemini(key, systemPrompt, userText, model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const truncatedText = userText.substring(0, 45000);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\nInput:\n" + truncatedText }] }],
        safetySettings: [{ category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
  }

  function addTimestampListeners() {
    document.querySelectorAll('.timestamp-link').forEach(link => {
      link.addEventListener('click', async (e) => {
        const parts = e.target.getAttribute('data-time').split(':').map(Number);
        const sec = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 3600 + parts[1] * 60 + parts[2];
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({ target: { tabId: tab.id }, func: (s) => { document.querySelector('video').currentTime = s; }, args: [sec] });
      });
    });
  }
});

// --- Injected Scripts ---
function startChatScraper() {
  if (window.chatScraperInterval) clearInterval(window.chatScraperInterval);
  let chatBuffer = [];
  let lastSentTime = Date.now();

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "STOP_CHAT_SCRAPER") clearInterval(window.chatScraperInterval);
  });

  // Try to find chat container
  const chatContainer = document.querySelector('yt-live-chat-item-list-renderer #items');
  if (!chatContainer) return; 

  // Handshake
  chrome.runtime.sendMessage({ action: "CHAT_FOUND" });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName && node.tagName.toLowerCase().includes('text-message')) {
          const author = node.querySelector('#author-name')?.innerText || "Anon";
          const message = node.querySelector('#message')?.innerText || "";
          if (message) chatBuffer.push({ author, message });
        }
      });
    });
  });
  observer.observe(chatContainer, { childList: true });

  window.chatScraperInterval = setInterval(() => {
    const isTimeUp = (Date.now() - lastSentTime) >= 3000;
    if (chatBuffer.length > 0 && (chatBuffer.length >= 10 || isTimeUp)) {
        chrome.runtime.sendMessage({ action: "CHAT_BATCH", messages: [...chatBuffer] });
        chatBuffer = [];
        lastSentTime = Date.now();
    }
  }, 1000);
}

async function getTranscriptAuto() {
    try {
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const closePanel = async () => {
            const p = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]');
            if(p) { const b = p.querySelector('#visibility-button button') || p.querySelector('button[aria-label="Close"]'); if(b) b.click(); }
        };
        let segs = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (segs.length > 0) { const d = extractText(segs); await closePanel(); return d; }

        const more = document.querySelector('#expand');
        if (more) { more.click(); await sleep(500); }

        let btn = document.querySelector('ytd-video-description-transcript-section-renderer button') || document.querySelector('button[aria-label*="transcript"]');
        if (btn) {
            btn.click();
            for(let i=0; i<30; i++) { await sleep(100); segs = document.querySelectorAll('ytd-transcript-segment-renderer'); if(segs.length>0) break; }
        }
        segs = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (segs.length > 0) { const d = extractText(segs); await closePanel(); return d; }
        return { success: false, message: "No transcript." };

    } catch (e) { return { success: false, message: e.message }; }
    function extractText(dom) {
        let txt = ""; dom.forEach(s => { 
            txt += `[${s.querySelector('.segment-timestamp')?.innerText.trim()}] ${s.querySelector('.segment-text')?.innerText.trim()}\n`; 
        }); return { success: true, data: txt };
    }
}