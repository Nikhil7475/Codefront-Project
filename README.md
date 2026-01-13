# 🌊 Focus Flow: From Chaos to Clarity
> **Team CODEX** | CodeFront 2.0 Hackathon Submission  
> **Theme:** Cutting the Noise, Enhancing the Learning


## 💡 The Problem
Online learning on platforms like YouTube is often drowning in digital noise. Students face three critical issues:
1.  **Live Stream Chaos:** Critical academic queries are buried instantly by a flood of spam and irrelevant messages.
2.  **Wasted Time:** Scrubbing through long videos to find a single key concept.
3.  **Buried Insights:** Valuable formulas and notes are lost in the chaos of content.

## 🚀 The Solution
**Focus Flow** is a Chrome Extension that transforms any YouTube video into a focused, interactive learning environment. We leverage **Google Gemini** to filter noise and curate knowledge in real-time.

## 🤖 Google Technology Used
* **Google Gemini API:** The core intelligence engine of our extension. We use Gemini to analyze live chat streams in real-time, intelligently distinguishing between academic doubts and general chatter/spam.

---

## ⚙️ Key Features

### ✅ 1. Live Stream Focus (Powered by Gemini)
* **Smart Filtering:** A real-time side panel that filters out spam and shows only valuable academic queries.
* **AI-Driven:** Uses Google Gemini to contextually understand and curate the chat feed.
* **Status:** 🟢 **Fully Functional & API Integrated**

### 🚧 2. Intelligent Learning Suite (UI Demonstration)
* **Instant Summaries:** A concise text overview of the video content.
* **Smart Timeline:** A timestamped "Table of Contents" to navigate complex topics.
* **Formula Sheet:** Automatically extracts formulas and short notes.
* **Status:**  **Frontend Prototype** (Demonstrates the vision for the full product ecosystem).

---

## 🛠️ Technical Implementation
* **Manifest Version:** V3
* **Architecture:** Chrome Side Panel API
* **Frontend:** HTML5, CSS3, JavaScript
* **Backend/AI:** Google Gemini API

### File Structure
* `manifest.json`: Configuration and permissions (Side Panel, ActiveTab, Scripting).
* `sidepanel.html` & `sidepanel.js`: The core UI and logic for the Gemini API integration.
* `content.js`: Handles interactions with the YouTube chat container.
* `background.js`: Manages extension lifecycle events.

---

## 📥 Installation & Setup

### Prerequisites
* Google Chrome Browser
* A Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))

### Steps to Run locally
1.  **Clone the Repository**
2.  **Load into Chrome**
    * Open Chrome and navigate to `chrome://extensions/`.
    * Toggle **Developer mode** (top right corner).
    * Click **Load unpacked**.
    * Select the `Codefront-Project` folder.
3.  **enter the API key in space provided at bottom of sidepanel interface**

### How to Use
1.  Open any YouTube video (specifically a Live Stream for the Chat feature).
2.  Click the **Focus Flow extension icon** in the toolbar (or pin it for easy access).
3.  The Side Panel will open.
4.  Select the **"Live"** tab to see Gemini filter the chat in real-time!
5.  Select Live chat in youtube chat section 

---

## 👨‍💻 Team CODEX
* **Nikhil Dubey**
* **Arpit Raj**
* **Mayank Verma**

---

*Built with ❤️ for CodeFront 2.0*
