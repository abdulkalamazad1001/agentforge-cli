# 🤖 AgentForge CLI

> **An AI-powered conversational CLI agent that clones the Scaler Academy website through intelligent multi-step reasoning.**

Built as an Assignment for **Scaler Academy** — demonstrating how AI agents can think, plan, and build real websites step by step.

**Powered by Abdul Kalam**

---

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-3.1_Flash_Lite-4285F4?style=for-the-badge&logo=google&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ What It Does

AgentForge is a **conversational CLI tool** that works like a mini Cursor/Windsurf right in your terminal:

1. **You type** a natural language instruction (e.g., *"Clone the Scaler Academy website"*)
2. **The agent thinks** — breaks the task into steps, plans the approach
3. **The agent acts** — creates files (HTML, CSS, JS) one at a time using tools
4. **The agent delivers** — opens the finished website in your browser

The entire process is **visible in the terminal** with colored output, animated spinners, and step-by-step reasoning.

---

## 🏗️ Architecture

```
AgentForge CLI/
├── index.js        # Main entry — interactive chat loop + agent reasoning
├── prompts.js      # System prompt with Scaler design knowledge
├── tools.js        # Tool definitions (createFile, createDirectory, openInBrowser)
├── ui.js           # CLI display helpers (chalk, ora, boxen, gradients)
├── package.json    # Dependencies and scripts
├── .env            # Gemini API keys (not committed)
├── .gitignore      # Ignores node_modules, .env, output/
└── README.md       # This file
```

---

## 🔄 How the Agent Loop Works

The agent follows a **structured reasoning loop** inspired by ReAct (Reasoning + Acting):

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│  START   │ ──▶ │  THINK  │ ──▶ │  TOOL   │ ──▶ │ OBSERVE  │ ──▶ │ OUTPUT  │
│          │     │ (×2-3)  │     │         │     │          │     │         │
│ Understand│    │ Reason  │     │ Execute │     │ See result│    │ Deliver │
│ the task │     │ & plan  │     │ action  │     │ & learn  │     │ to user │
└─────────┘     └────┬────┘     └─────────┘     └────┬─────┘     └─────────┘
                     │                                │
                     └────────────────────────────────┘
                              (loops back)
```

**Step Types:**
| Step | Purpose | Terminal Display |
|:---|:---|:---|
| 🚀 **START** | Acknowledge the user's request | Blue banner |
| 🧠 **THINK** | Reason about what to do next | Cyan italic text |
| 🔧 **TOOL** | Execute a file operation | Green with tool name |
| 👁️ **OBSERVE** | See the tool's result | Amber result text |
| ✅ **OUTPUT** | Final response to the user | Green boxed message |

---

## 🛠️ Available Tools

The agent has access to **3 purpose-built tools** for safe file operations:

| Tool | Description |
|:---|:---|
| `createFile(filePath, content)` | Creates a file with the given content |
| `createDirectory(dirPath)` | Creates a directory (nested support) |
| `openInBrowser(filePath)` | Opens the HTML file in the default browser |

> 💡 **Design Decision**: Instead of giving the agent a generic `executeCommand` tool (which could run anything), we provide **specific, safe tools**. This makes the agent more reliable and prevents accidental damage.

---

## ⚡ Resilience Features

AgentForge is built for **100% uptime** with production-grade reliability:

### 🔁 Round-Robin API Key Pool
- Supports **multiple Gemini API keys** via a comma-separated `GEMINI_API_KEYS` env var
- Cycles through keys on every request to distribute load across quota buckets
- Each key gets its own fresh `GoogleGenerativeAI` client instance

### 🛡️ Intelligent Auto-Retry with Exponential Backoff
- **10 automatic retries** on rate limit errors (429 / quota exceeded)
- Exponential backoff: 5s → 10s → 15s → 20s → 25s → 30s (capped)
- The agent **never crashes** from rate limits — it waits patiently and retries
- Auth errors (invalid key) fail fast immediately — no wasted retries

### 💬 Global Conversation History
- Chat history is maintained independently from API key rotation
- Context is seamlessly carried across key switches via deep-cloned history injection

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18 or higher
- A **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/agentforge-cli.git
cd agentforge-cli

# 2. Install dependencies
npm install

# 3. Set your Gemini API key(s)
# Single key:
echo "GEMINI_API_KEYS=your-key-here" > .env

# Multiple keys (for Round-Robin load balancing):
echo "GEMINI_API_KEYS=key1,key2,key3" > .env

# 4. Run the agent
npm start
```

### Usage

Once running, type your instruction:

```
▶ You: Clone the Scaler Academy website
```

The agent will:
1. Plan the website structure
2. Create `output/styles.css` with all Scaler styling
3. Create `output/index.html` with Header, Hero, and Footer
4. Create `output/script.js` for interactivity
5. Open the result in your browser

---

## 🎨 Generated Website Features

The cloned Scaler Academy website includes:

- **📌 Top Contact Bar** — Dark gradient with phone number and CTA
- **🧭 Sticky Header** — White navbar with SCALER ACADEMY logo and navigation
- **🦸 Hero Section** — Dark gradient with floating orbs, course info, and counselling form
- **📋 Course Overview** — 3 informational cards about the program
- **⭐ Key Highlights** — 6 colorful feature cards (blue, pink, green, purple, orange)
- **💼 Talk to Advisor** — Dark CTA section with benefits
- **📚 Curriculum** — Tabbed module list (Beginner / Intermediate / Advanced)
- **🔗 Footer** — Dark footer with links, socials, and copyright

**Design Quality:**
- Responsive (mobile + desktop)
- CSS animations (floating orbs, fade-in, hover effects)
- Google Fonts (Inter)
- Pixel-perfect color matching

---

## 🧰 Tech Stack

| Technology | Purpose |
|:---|:---|
| **Node.js** | Runtime environment |
| **Google Gemini 3.1 Flash Lite** | AI reasoning engine |
| **@google/generative-ai** | Official Gemini SDK |
| **chalk** | Colored terminal text |
| **ora** | Animated loading spinners |
| **boxen** | Boxed terminal messages |
| **gradient-string** | Gradient text effects |
| **dotenv** | Environment variable management |
| **node-fetch** | Robust HTTP fetch for API calls |

---

## 📁 Project Structure Explanation

| File | Lines | Purpose |
|:---|:---:|:---|
| `index.js` | ~350 | Main agent loop, Round-Robin key pool, auto-retry, JSON parsing, step handling |
| `prompts.js` | ~170 | System prompt with Scaler design knowledge and tool descriptions |
| `tools.js` | ~150 | File operation tools (createFile, createDirectory, openInBrowser) |
| `ui.js` | ~270 | Terminal display helpers (colors, spinners, boxes, formatting) |

---

## 🎬 Demo

> A 2-3 minute YouTube demo showing the CLI agent running live and the final output opening in the browser.
>
> **[Watch the Demo →](YOUR_YOUTUBE_LINK)**

---

## 📝 License

MIT License — feel free to use, modify, and share.

---

<p align="center">
  Built with ❤️ for <strong>Scaler Academy</strong> • <strong>Powered by Abdul Kalam</strong>
</p>
