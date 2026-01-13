
# 🌊 Focus Flow: From Chaos to Clarity
> **Team CODEX** | CodeFront 2.0 Hackathon Submission  
> **Theme:** Cutting the Noise, Enhancing the Learning


## 💡 The Problem
Online learning on platforms like YouTube is often drowning in digital noise. Students face three critical issues:
1.  **Live Stream Chaos:** Critical academic queries are buried instantly by a flood of spam and irrelevant messages.
2.  **Wasted Time:** Scrubbing through long videos to find a single key concept.
3.  **Buried Insights:** Valuable formulas and notes are lost in the chaos of content.

## 🚀 The Solution
**Focus Flow** is a comprehensive Chrome Extension that transforms any YouTube video into a focused, interactive learning environment. We leverage **Google Gemini (Flash & Pro models)** to filter noise, summarize content, and curate knowledge in real-time.

## 🤖 Google Technology Used
* **Google Gemini API:** The core intelligence engine of our extension. We use Gemini for:
    * **Real-time Chat Analysis:** Distinguishing between academic doubts and spam.
    * **Content Synthesis:** Generating concise summaries, timelines, and formula sheets directly from video transcripts.

---

## ⚙️ Key Features

### ✅ 1. Live Stream Focus (Powered by Gemini)
* **Smart Filtering:** A real-time side panel that captures live chat messages and filters them instantly.
* **AI Categorization:** Automatically tags messages as **"Questions"** (academic doubts) or **"Notes"** (useful definitions), discarding spam.
* **Status:** 🟢 **Fully Functional**

### ✅ 2. Instant Video Summary
* **Contextual Overview:** Generates a concise, bulleted text summary of the video content.
* **Interactive:** Fetches the video transcript automatically and processes it via Gemini 3 Flash preview.
* **Status:** 🟢 **Fully Functional**

### ✅ 3. Smart Timeline
* **Intelligent Navigation:** Automatically generates a timestamped "Table of Contents" (e.g., `[05:20] - Data Structures`).
* **Click-to-Seek:** Clicking a timestamp instantly jumps the video player to that exact moment.
* **Status:** 🟢 **Fully Functional**

### ✅ 4. Formula & Notes Extractor
* **Auto-Extraction:** Automatically detects and extracts mathematical formulas, code snippets, and important definitions into a clean "Cheat Sheet" format.
* **Status:** 🟢 **Fully Functional**

---

## 🛠️ Technical Implementation
* **Manifest Version:** V3
* **Architecture:** Chrome Side Panel
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend/AI:** Google Gemini API
* **Permissions:** `sidePanel`, `scripting`, `activeTab`, `storage`

### File Structure
* `manifest.json`: Configuration for Side Panel and permissions.
* `sidepanel.html` & `sidepanel.js`: The core application logic. It handles the API calls to Gemini and updates the UI.
* `background.js`: Manages the extension lifecycle and ensures the side panel opens only on YouTube.
* `styles.css`: Custom styling for a clean, dark-mode inspired UI.

---

## 📥 Installation & Setup

### Prerequisites
1.  **Google Chrome Browser**
2.  **Google Gemini API Key**: You need a free API key from [Google AI Studio](https://aistudio.google.com/).

### Steps to Run Locally
1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/Nikhil7475/Codefront-Project.git](https://github.com/Nikhil7475/Codefront-Project.git)
    ```
2.  **Load into Chrome**
    * Open Chrome and navigate to `chrome://extensions/`.
    * Toggle **Developer mode** (top right corner).
    * Click **Load unpacked**.
    * Select the `Codefront-Project` folder containing `manifest.json`.
3.  **Configure API Key**
    * Open a YouTube video.
    * Click the **Focus Flow extension icon** in the toolbar to open the Side Panel.
    * Click the **Settings (⚙️)** icon in the bottom navigation.
    * Paste your **Gemini API Key** and click **Save Key**.

### How to Use
1.  **For Live Chat Filtering:** Open a YouTube Live Stream, open the Focus Flow panel, and click **🔴 Start Monitoring**.
2.  **For Summaries/Notes:** Open any regular YouTube video with captions/transcript available, go to the **Summary** or **Formula** tab, and click **✨ Analyze Video**.

---

## 👨‍💻 Team CODEX
* **Nikhil Dubey**
* **Arpit Raj**
* **Mayank Verma**

---

*Built with ❤️ for CodeFront 2.0*
