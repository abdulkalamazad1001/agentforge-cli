/**
 * ui.js — Beautiful CLI Display Helpers for AgentForge
 * 
 * Copyright (c) 2026 Abdul Kalam Azad. All rights reserved.
 * 
 * Provides colorful, animated terminal output using chalk, ora, boxen,
 * and gradient-string. Each agent step type gets unique formatting.
 * 
 * @author Abdul Kalam Azad
 * @project AgentForge CLI — Built by Abdul Kalam Azad for Scaler Academy
 */

import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";
import gradient from "gradient-string";

// ─── Custom Color Palette — Abdul Kalam Azad ──────────────────────────────────

const colors = {
  brand: chalk.hex("#6C63FF"),       // Purple brand
  start: chalk.hex("#3B82F6"),       // Blue for START
  think: chalk.hex("#06B6D4"),       // Cyan for THINK
  tool: chalk.hex("#10B981"),       // Green for TOOL
  observe: chalk.hex("#F59E0B"),       // Amber for OBSERVE
  output: chalk.hex("#22C55E"),       // Green for OUTPUT
  error: chalk.hex("#EF4444"),       // Red for errors
  dim: chalk.hex("#6B7280"),       // Gray for dim text
  highlight: chalk.hex("#A78BFA"),       // Light purple
  white: chalk.hex("#F9FAFB"),       // Almost white
  info: chalk.hex("#38BDF8"),       // Sky blue for info
  warn: chalk.hex("#FBBF24"),       // Yellow for warnings
};

// ─── Gradient Presets — Abdul Kalam Azad ──────────────────────────────────────

const brandGradient = gradient(["#6C63FF", "#3B82F6", "#06B6D4"]);
const successGradient = gradient(["#10B981", "#22C55E", "#34D399"]);
const fireGradient = gradient(["#F59E0B", "#EF4444", "#EC4899"]);

// ─── Spinner Instance ────────────────────────────────────────────────────────

let currentSpinner = null;

// ─── Step Emojis & Labels — Abdul Kalam Azad ────────────────────────────────

const STEP_CONFIG = {
  START: { emoji: "🚀", color: colors.start, label: "Understanding your request..." },
  THINK: { emoji: "🧠", color: colors.think, label: "Reasoning..." },
  TOOL: { emoji: "🔧", color: colors.tool, label: "Executing action..." },
  OBSERVE: { emoji: "👁️ ", color: colors.observe, label: "Result received" },
  OUTPUT: { emoji: "✅", color: colors.output, label: "Task Complete!" },
};

/**
 * Show the welcome banner when the CLI starts
 */
export function showWelcomeBanner() {
  const title = brandGradient.multiline([
    "    ╔═══════════════════════════════════════════════════════════╗",
    "    ║                                                           ║",
    "    ║       █████╗  ██████╗ ███████╗███╗   ██╗████████╗         ║",
    "    ║      ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝         ║",
    "    ║      ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║            ║",
    "    ║      ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║            ║",
    "    ║      ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║            ║",
    "    ║      ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝            ║",
    "    ║                                                           ║",
    "    ║         ███████╗ ██████╗ ██████╗  ██████╗ ███████╗        ║",
    "    ║         ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝        ║",
    "    ║         █████╗  ██║   ██║██████╔╝██║  ███╗█████╗          ║",
    "    ║         ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝          ║",
    "    ║         ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗        ║",
    "    ║         ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝        ║",
    "    ║                                                           ║",
    "    ╚═══════════════════════════════════════════════════════════╝",
  ].join("\n"));

  console.log("\n" + title);

  const subtitle = boxen(
    colors.white("  🤖  AI-Powered Web Development Agent  \n\n") +
    colors.dim("  Type your instructions and watch the agent think,  \n") +
    colors.dim("  plan, and build websites step by step.  \n\n") +
    colors.highlight("  Built for Scaler Academy  ") + colors.dim(" • ") +
    colors.highlight("  Powered by Abdul Kalam  "),
    {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 4, right: 4 },
      borderStyle: "round",
      borderColor: "#6C63FF",
    }
  );

  console.log(subtitle);
}

/**
 * Display system info bar on startup
 */
export function displaySystemInfo(modelName, keyCount) {
  const nodeVersion = process.version;
  const infoLine = [
    colors.dim("    ┌─ "),
    colors.info("⚙ "),
    colors.dim("Model: ") + colors.white(modelName),
    colors.dim("  │  "),
    colors.dim("Node: ") + colors.white(nodeVersion),
    colors.dim(" ─┐"),
  ].join("");

  console.log(infoLine);
  console.log(
    colors.dim("    └────────────────────────────────────────────────────────────┘\n")
  );

  console.log(
    colors.dim("    💡 Try: ") +
    colors.highlight.bold('"Clone the Scaler Academy website"') +
    colors.dim("  or  ") +
    colors.white.bold('"help"') +
    colors.dim(" for commands\n")
  );
}

/**
 * Display the help menu
 */
export function displayHelp() {
  const helpContent =
    colors.white.bold("  📖 Available Commands\n\n") +
    colors.highlight("  clone <website>") + colors.dim("  — Ask the agent to clone any website\n") +
    colors.highlight("  build <desc>") + colors.dim("    — Build a custom website from a description\n") +
    colors.highlight("  help") + colors.dim("            — Show this help menu\n") +
    colors.highlight("  clear") + colors.dim("           — Clear the terminal\n") +
    colors.highlight("  exit / quit") + colors.dim("     — Exit AgentForge\n\n") +

    colors.white.bold("  💡 Example Prompts\n\n") +
    colors.dim('  • "Clone the Scaler Academy website"\n') +
    colors.dim('  • "Build a modern portfolio with dark mode"\n') +
    colors.dim('  • "Create a landing page for a SaaS product"\n') +
    colors.dim('  • "Build a restaurant website with a menu section"\n');

  const helpBox = boxen(helpContent, {
    padding: 1,
    margin: { top: 0, bottom: 1, left: 3, right: 3 },
    borderStyle: "round",
    borderColor: "#6C63FF",
    title: "HELP",
    titleAlignment: "center",
  });

  console.log(helpBox);
}

/**
 * Show the user input prompt
 */
export function showPrompt() {
  return colors.brand("  ▶ You: ");
}

/**
 * Display a step header with counter
 */
function stepHeader(stepType, stepNum) {
  const config = STEP_CONFIG[stepType] || STEP_CONFIG.THINK;
  const counter = stepNum ? colors.dim(` [Step ${stepNum}]`) : "";
  return config.color(` ${config.emoji} `) + config.color.bold(`[${stepType}]`) + counter + colors.dim(` ${config.label}`);
}

/**
 * Display a START step
 */
export function displayStart(content, stepNum) {
  console.log();
  console.log(stepHeader("START", stepNum));
  console.log(colors.dim("     │"));
  console.log(colors.dim("     │  ") + colors.white(wrapText(content, 65)));
  console.log(colors.dim("     │"));
}

/**
 * Display a THINK step
 */
export function displayThink(content, stepNum) {
  console.log(stepHeader("THINK", stepNum));
  console.log(colors.dim("     │"));
  console.log(colors.dim("     │  ") + chalk.italic(colors.think(wrapText(content, 65))));
  console.log(colors.dim("     │"));
}

/**
 * Display a TOOL step (before execution)
 */
export function displayToolCall(toolName, toolArgs, stepNum) {
  console.log(stepHeader("TOOL", stepNum));
  console.log(colors.dim("     │"));
  console.log(colors.dim("     │  → ") + colors.tool.bold(toolName) + colors.dim("(") + colors.highlight(truncate(formatArgs(toolArgs), 80)) + colors.dim(")"));
}

/**
 * Display tool result (after execution)
 */
export function displayToolResult(success, message) {
  if (success) {
    console.log(colors.dim("     │  ") + colors.output("✓ ") + colors.dim(message));
  } else {
    console.log(colors.dim("     │  ") + colors.error("✗ ") + colors.error(message));
  }
  console.log(colors.dim("     │"));
}

/**
 * Display an OBSERVE step
 */
export function displayObserve(content) {
  console.log(colors.observe("  👁️  ") + colors.observe.bold("[OBSERVE]") + colors.dim(" Result received"));
  console.log(colors.dim("     │"));
  console.log(colors.dim("     │  ") + colors.observe(wrapText(truncate(content, 150), 65)));
  console.log(colors.dim("     │"));
}

/**
 * Display the final OUTPUT step
 */
export function displayOutput(content) {
  console.log();
  const outputBox = boxen(
    colors.output.bold("  ✅ Task Complete!\n\n") +
    colors.white(wrapText(content, 55)),
    {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 3, right: 3 },
      borderStyle: "round",
      borderColor: "#22C55E",
      title: "OUTPUT",
      titleAlignment: "center",
    }
  );
  console.log(outputBox);
}

/**
 * Display session summary with stats
 */
export function displaySessionSummary(stats) {
  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  const filesLine = stats.filesCreated.map(f => {
    return colors.dim("     • ") + colors.white(f.path) + colors.dim(` (${f.size})`);
  }).join("\n");

  const summaryContent =
    colors.info.bold("  📊 Session Summary\n\n") +
    colors.dim("  ⏱  Time Elapsed:   ") + colors.white(`${elapsed}s\n`) +
    colors.dim("  🔄 Steps Taken:    ") + colors.white(`${stats.stepCount}\n`) +
    colors.dim("  📁 Files Created:  ") + colors.white(`${stats.filesCreated.length}\n`) +
    (stats.filesCreated.length > 0 ? "\n" + filesLine + "\n" : "");

  const summaryBox = boxen(summaryContent, {
    padding: 1,
    margin: { top: 0, bottom: 0, left: 3, right: 3 },
    borderStyle: "round",
    borderColor: "#38BDF8",
    title: "STATS",
    titleAlignment: "center",
  });
  console.log(summaryBox);
}

/**
 * Display an error message
 */
export function displayError(message) {
  console.log();
  console.log(colors.error("  ❌ ") + colors.error.bold("Error: ") + colors.error(message));
  console.log();
}

/**
 * Display a retry progress bar
 */
export function displayRetryProgress(attempt, maxRetries, waitSec) {
  const filled = Math.round((attempt / maxRetries) * 10);
  const empty = 10 - filled;
  const bar = colors.warn("█".repeat(filled)) + colors.dim("░".repeat(empty));
  return `⏳ Rate limited. Retrying in ${waitSec}s... [${bar}] (${attempt}/${maxRetries})`;
}

/**
 * Start a loading spinner
 */
export function startSpinner(text = "Agent is thinking...") {
  currentSpinner = ora({
    text: colors.dim(text),
    spinner: "dots12",
    color: "cyan",
    indent: 5,
  }).start();
  return currentSpinner;
}

/**
 * Stop the loading spinner
 */
export function stopSpinner() {
  if (currentSpinner) {
    currentSpinner.stop();
    currentSpinner = null;
  }
}

/**
 * Display a separator line
 */
export function showSeparator() {
  console.log(
    colors.dim("\n    ─────────────────────────────────────────────────────────\n")
  );
}

/**
 * Display goodbye message
 */
export function showGoodbye() {
  console.log();
  const goodbye = boxen(
    brandGradient("  Thanks for using AgentForge!  \n\n") +
    colors.dim("  Built with ❤️  for Scaler Academy  \n") +
    colors.highlight("  Powered by Abdul Kalam  "),
    {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 4, right: 4 },
      borderStyle: "round",
      borderColor: "#6C63FF",
    }
  );
  console.log(goodbye);
}

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Wrap text to a maximum width
 */
function wrapText(text, maxWidth) {
  if (!text) return "";
  const words = text.split(" ");
  let line = "";
  let result = "";

  for (const word of words) {
    if ((line + word).length > maxWidth) {
      result += line.trim() + "\n     │  ";
      line = "";
    }
    line += word + " ";
  }
  result += line.trim();
  return result;
}

/**
 * Truncate text with ellipsis
 */
function truncate(text, maxLen) {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + "...";
}

/**
 * Format tool arguments for display
 */
function formatArgs(args) {
  if (!args) return "";
  if (typeof args === "string") return `"${args}"`;
  if (typeof args === "object") {
    return JSON.stringify(args);
  }
  return String(args);
}
