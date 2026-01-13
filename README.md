#Changed UI a bit.

Focus Flow AI 🎓🚀

Cutting the Noise, Enhancing the Learning.

Focus Flow is a powerful Chrome Extension that transforms any YouTube video—especially live classes—into a focused, interactive learning environment. It uses Google's Gemini AI to filter out spam from live chats, summarize video content, generate formula sheets, and create smart timelines.

🚩 The Problem

Online learning is drowning in digital noise:

Live Stream Chaos: In live classes, critical academic queries are instantly buried by a flood of spam, emojis, and irrelevant chatter.

Wasted Time: Students spend hours scrubbing through long videos to find specific concepts or formulas.

Buried Insights: Valuable peer discussions are lost in the chaos of crowded comment sections.

💡 The Solution: Focus Flow

We built a lightweight, client-side browser extension that acts as a real-time study companion.

Key Features

💬 Live Class Filter (The Spam Killer):

Uses Gemini AI to monitor YouTube Live Chat in real-time.

Automatically filters out spam, greetings, and noise.

Surfaces only Academic Questions and Useful Notes in a clean side panel feed.

📝 Instant Summaries:

Uses Gemini 3 Flash (Preview) to read the video transcript and generate a structured bullet-point summary.

🕒 Smart Timeline:

Generates a clickable "Table of Contents" for the video, allowing students to jump to specific topics instantly.

📐 Formula & Note Extraction:

Automatically identifies and extracts formulas, code snippets, and key definitions into a dedicated cheat sheet.

🛠️ Tech Stack

Frontend: HTML5, CSS3, JavaScript

AI Models:

gemma-3-27b-it: Optimized for high-speed, low-latency text filtering (Live Chat).

Gemini 3 Flash (Preview): Used for deep reasoning and comprehensive analysis (Summaries/Notes).

Platform: Google Chrome Extension (Manifest V3)

APIs: Google Gemini API

🚀 Installation & Setup

Clone the Repository

git clone [https://github.com/your-username/focus-flow.git](https://github.com/your-username/focus-flow.git)


Get a Gemini API Key

Go to Google AI Studio.

Create a free API Key.

Load into Chrome

Open Chrome and go to chrome://extensions.

Enable Developer Mode (top right toggle).

Click Load Unpacked.

Select the folder where you cloned/downloaded this project.

Use It!

Open any YouTube video (or Live Stream).

Click the Focus Flow icon in your toolbar (pin it for easy access).

Open the side panel.

Paste your API Key in the settings (Gear icon).

Click "Start Monitoring" for live chat or "Analyze Video" for summaries.

📂 Project Structure

focus-flow/
├── manifest.json      # Extension configuration & permissions
├── sidepanel.html     # The main UI of the tool
├── sidepanel.js       # Core logic (AI calls, DOM manipulation)
├── background.js      # Service worker for Chrome events
├── styles.css         # Styling for the Focus Flow UI
└── icons/             # App icons


👥 Team CODEX

Nikhil Dubey

Arpit Raj

Mayank Verma

