/**
 * ui.js — Beautiful CLI Display Helpers for AgentForge
 * 
 * Provides colorful, animated terminal output using chalk, ora, boxen,
 * and gradient-string. Each agent step type gets unique formatting.
 */

import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";
import gradient from "gradient-string";

// ─── Custom Color Palette ────────────────────────────────────────────────────

const colors = {
  brand:     chalk.hex("#6C63FF"),       // Purple brand
  start:     chalk.hex("#3B82F6"),       // Blue for START
  think:     chalk.hex("#06B6D4"),       // Cyan for THINK
  tool:      chalk.hex("#10B981"),       // Green for TOOL
  observe:   chalk.hex("#F59E0B"),       // Amber for OBSERVE
  output:    chalk.hex("#22C55E"),       // Green for OUTPUT
  error:     chalk.hex("#EF4444"),       // Red for errors
  dim:       chalk.hex("#6B7280"),       // Gray for dim text
  highlight: chalk.hex("#A78BFA"),       // Light purple
  white:     chalk.hex("#F9FAFB"),       // Almost white
};

// ─── Gradient Presets ────────────────────────────────────────────────────────

const brandGradient = gradient(["#6C63FF", "#3B82F6", "#06B6D4"]);
const successGradient = gradient(["#10B981", "#22C55E", "#34D399"]);

// ─── Spinner Instance ────────────────────────────────────────────────────────

let currentSpinner = null;

/**
 * Show the welcome banner when the CLI starts
 */
export function showWelcomeBanner() {
  const title = brandGradient.multiline([
    "    ╔═══════════════════════════════════════════════════════════╗",
    "    ║                                                         ║",
    "    ║       █████╗  ██████╗ ███████╗███╗   ██╗████████╗       ║",
    "    ║      ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝       ║",
    "    ║      ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║          ║",
    "    ║      ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║          ║",
    "    ║      ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║          ║",
    "    ║      ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝          ║",
    "    ║                                                         ║",
    "    ║         ███████╗ ██████╗ ██████╗  ██████╗ ███████╗      ║",
    "    ║         ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝      ║",
    "    ║         █████╗  ██║   ██║██████╔╝██║  ███╗█████╗        ║",
    "    ║         ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝        ║",
    "    ║         ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗      ║",
    "    ║         ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝      ║",
    "    ║                                                         ║",
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

  console.log(
    colors.dim("    ─────────────────────────────────────────────────────────\n")
  );
  console.log(
    colors.dim("    💡 Try: ") +
    colors.highlight.bold('"Clone the Scaler Academy website"') +
    colors.dim("  or  ") +
    colors.white.bold('"exit"') +
    colors.dim(" to quit\n")
  );
}

/**
 * Show the user input prompt
 */
export function showPrompt() {
  return colors.brand("  ▶ You: ");
}

/**
 * Display a START step
 */
export function displayStart(content) {
  console.log();
  console.log(colors.start("  🚀 ") + colors.start.bold("[START]") + colors.dim(" Understanding your request..."));
  console.log(colors.dim("     │"));
  console.log(colors.dim("     │  ") + colors.white(wrapText(content, 65)));
  console.log(colors.dim("     │"));
}

/**
 * Display a THINK step
 */
export function displayThink(content) {
  console.log(colors.think("  🧠 ") + colors.think.bold("[THINK]") + colors.dim(" Reasoning..."));
  console.log(colors.dim("     │"));
  console.log(colors.dim("     │  ") + chalk.italic(colors.think(wrapText(content, 65))));
  console.log(colors.dim("     │"));
}

/**
 * Display a TOOL step (before execution)
 */
export function displayToolCall(toolName, toolArgs) {
  console.log(colors.tool("  🔧 ") + colors.tool.bold("[TOOL]") + colors.dim(" Executing action..."));
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
 * Display an error message
 */
export function displayError(message) {
  console.log();
  console.log(colors.error("  ❌ ") + colors.error.bold("Error: ") + colors.error(message));
  console.log();
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
