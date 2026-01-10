let currentFilter = "ALL";

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  setupSidebar();
  setupSubTabs();
  loadKey();
  setupSave();
});

/* SIDEBAR NAV */
function setupSidebar() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

      item.classList.add("active");
      document.getElementById("view-" + item.dataset.view).classList.add("active");
    });
  });
}

/* SUB FILTER */
function setupSubTabs() {
  document.querySelectorAll(".sub-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".sub-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      applyFilter();
    });
  });
}

/* CHAT LISTENER */
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === "ANALYSIS_COMPLETE") {
    render(msg.data);
  }
});

function render(items) {
  const feed = document.getElementById("feed");
  feed.querySelector(".empty-state")?.remove();

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = `chat-card ${item.category}`;
    card.dataset.category = item.category;

    card.innerHTML = `
      <div class="indicator-bar ${item.category}"></div>
      <div class="card-content">
        <b>${item.author}</b><br>${item.message}
      </div>
    `;

    if (currentFilter !== "ALL" && currentFilter !== item.category) {
      card.style.display = "none";
    }

    feed.prepend(card);
  });
}

function applyFilter() {
  document.querySelectorAll(".chat-card").forEach(card => {
    card.style.display =
      currentFilter === "ALL" || card.dataset.category === currentFilter
        ? "flex"
        : "none";
  });
}

/* API KEY */
function loadKey() {
  chrome.storage.local.get(["gemini_api_key"], res => {
    if (res.gemini_api_key) {
      document.getElementById("api-key").value = res.gemini_api_key;
    }
  });
}

function setupSave() {
  document.getElementById("save-key").addEventListener("click", () => {
    chrome.storage.local.set({
      gemini_api_key: document.getElementById("api-key").value.trim()
    });
  });
}
