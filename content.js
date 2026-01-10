console.log("Classroom Focus AI: Content Script Loaded");

const SELECTORS = {
  chatContainer: "#items.yt-live-chat-item-list-renderer",
  messageTag: "yt-live-chat-text-message-renderer",
  authorName: "#author-name",
  messageBody: "#message",
  timestamp: "#timestamp"
};

let observer = null;
let currentChatNode = null;

// ================= ROBUST MONITORING =================

// Check every 2 seconds forever. If connection is lost, reconnect.
setInterval(() => {
  const chatNode = document.querySelector(SELECTORS.chatContainer);

  // If we found a chat node, and it's different from the one we have (or we have none)
  if (chatNode && chatNode !== currentChatNode) {
    console.log("Classroom Focus AI: New chat container found. Attaching...");
    currentChatNode = chatNode;
    attachObserver(chatNode);
  }
  
  // If the chat node we were watching is gone from the DOM
  if (currentChatNode && !document.body.contains(currentChatNode)) {
    console.log("Classroom Focus AI: Lost connection to chat. Resetting...");
    if (observer) observer.disconnect();
    currentChatNode = null;
    observer = null;
  }
}, 2000);

// ================= OBSERVER =================

function attachObserver(targetNode) {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutationsList) => {
    const newMessages = [];
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.tagName.toLowerCase() === SELECTORS.messageTag) {
            const parsed = extractMessageData(node);
            if (parsed) newMessages.push(parsed);
          }
        });
      }
    }

    if (newMessages.length > 0) {
      if (chrome.runtime?.id) {
        chrome.runtime.sendMessage({
          type: "NEW_CHAT_BATCH",
          payload: newMessages
        });
      }
    }
  });

  observer.observe(targetNode, { childList: true, subtree: true });
}

function extractMessageData(node) {
  try {
    const authorEl = node.querySelector(SELECTORS.authorName);
    const messageEl = node.querySelector(SELECTORS.messageBody);
    const timeEl = node.querySelector(SELECTORS.timestamp);
    
    if (!authorEl || !messageEl) return null;

    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      author: authorEl.innerText.trim(),
      message: messageEl.innerText.trim(),
      timestamp: timeEl ? timeEl.innerText.trim() : new Date().toLocaleTimeString()
    };
  } catch (e) { return null; }
}