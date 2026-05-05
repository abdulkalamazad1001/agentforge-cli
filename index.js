/**
 * index.js — Main Entry Point for AgentForge CLI
 * 
 * Copyright (c) 2026 Abdul Kalam Azad. All rights reserved.
 * 
 * This is the core agent loop that:
 * 1. Shows a beautiful welcome banner with system info
 * 2. Accepts user input via readline
 * 3. Sends messages to Gemini with the system prompt
 * 4. Parses JSON responses and runs the reasoning loop:
 *    START → THINK → TOOL → OBSERVE → OUTPUT
 * 5. Displays each step with colors, spinners, step counters
 * 6. Shows session summary with stats after completion
 * 7. After OUTPUT, asks for more instructions (persistent chat)
 * 
 * @author Abdul Kalam Azad
 * @project AgentForge CLI — Built by Abdul Kalam Azad for Scaler Academy
 * @version 2.0.0
 */

import "dotenv/config";
import dns from "dns";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch"; // Injected robust fetch
import readline from "readline";

// Fix for Node.js DNS resolution issues on some Windows machines
dns.setDefaultResultOrder("ipv4first");

import { SYSTEM_PROMPT } from "./prompts.js";
import { executeTool } from "./tools.js";
import {
  showWelcomeBanner,
  displaySystemInfo,
  displayHelp,
  showPrompt,
  displayStart,
  displayThink,
  displayToolCall,
  displayToolResult,
  displayObserve,
  displayOutput,
  displaySessionSummary,
  displayError,
  displayRetryProgress,
  startSpinner,
  stopSpinner,
  showSeparator,
  showGoodbye,
} from "./ui.js";

// ─── Configuration ───────────────────────────────────────────────────────────

const MODEL_NAME = "gemini-3.1-flash-lite-preview";

// ─── AI Client Setup (Google Gemini) — Abdul Kalam Azad ─────────────────────

const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
if (!keysString) {
  console.error("Please set GEMINI_API_KEYS in your .env file.");
  process.exit(1);
}

// Support multiple comma-separated keys for Round-Robin Load Balancing
const apiKeys = keysString.split(",").map(k => k.trim());
let currentKeyIndex = 0;

// Maintain global history independently so it persists across API key rotations
let globalHistory = [];

// ─── Readline Interface — Abdul Kalam Azad ──────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Prompt the user for input and return their response.
 * @returns {Promise<string>} The user's input
 */
function askUser() {
  return new Promise((resolve) => {
    rl.question(showPrompt(), (answer) => {
      resolve(answer.trim());
    });
  });
}

// ─── JSON Parsing with Recovery — Abdul Kalam Azad ──────────────────────────

/**
 * Parse a JSON response from the LLM with error recovery.
 * Handles cases where the LLM wraps JSON in markdown code blocks
 * or includes extra text outside the JSON.
 * 
 * @param {string} content - Raw response content from the LLM
 * @returns {object|null} Parsed JSON object or null if parsing fails
 */
function parseAgentResponse(content) {
  if (!content) return null;

  // Try direct parse first
  try {
    return JSON.parse(content);
  } catch {
    // Not valid JSON directly — try recovery strategies
  }

  // Strategy 1: Extract JSON from markdown code blocks
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue to next strategy
    }
  }

  // Strategy 2: Find the first { ... } block in the text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Continue to next strategy
    }
  }

  // Strategy 3: Try to fix common issues (trailing commas, etc.)
  try {
    const cleaned = content
      .replace(/,\s*}/g, "}")     // Remove trailing commas in objects
      .replace(/,\s*]/g, "]")     // Remove trailing commas in arrays
      .replace(/'/g, '"');         // Replace single quotes with double
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch {
    // All strategies failed
  }

  return null;
}

// ─── Main Agent Loop — Designed by Abdul Kalam Azad ─────────────────────────

/**
 * Process a single user request through the agent loop.
 * The agent will:
 * 1. Send the user message to Gemini
 * 2. Parse the response as a step (START/THINK/TOOL/OUTPUT)
 * 3. If TOOL: execute the tool, feed result as OBSERVE, continue
 * 4. If OUTPUT: display final result and return
 * 5. Loop until OUTPUT is reached or max iterations hit
 * 
 * @param {string} userInput - The user's instruction
 */
async function processRequest(userInput) {
  let currentInput = userInput;
  const MAX_ITERATIONS = 30; // Safety limit to prevent infinite loops
  let iteration = 0;

  // ── Session Stats Tracking ──
  const sessionStats = {
    startTime: Date.now(),
    stepCount: 0,
    keysUsed: 0,
    filesCreated: [],
  };

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    sessionStats.stepCount = iteration;

    // Show loading spinner while waiting for AI response
    const spinner = startSpinner("Agent is thinking...");

    // Rate limit protection: Wait 4 seconds between API calls to stay under free-tier limits
    await new Promise((r) => setTimeout(r, 4000));

    let response;
    const MAX_RETRIES = 10; // Retry up to 10 times with increasing backoff (covers ~2 min total)

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // --- ROUND ROBIN KEY SELECTION ---
        const activeKey = apiKeys[currentKeyIndex];
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;

        stopSpinner();
        startSpinner(`Agent is thinking...`);

        // Instantiate AI client with the selected key
        const genAI = new GoogleGenerativeAI(activeKey, { customFetch: fetch });
        const model = genAI.getGenerativeModel({
          model: MODEL_NAME,
          systemInstruction: SYSTEM_PROMPT
        });

        // Rebuild chat session with full history so context carries across key rotations
        const chat = model.startChat({
          history: JSON.parse(JSON.stringify(globalHistory)),
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        });

        const result = await chat.sendMessage(currentInput);
        response = result.response;

        // Persist conversation history for next iteration
        globalHistory.push({ role: "user", parts: [{ text: currentInput }] });
        globalHistory.push({ role: "model", parts: [{ text: response.text() }] });

        sessionStats.keysUsed++;
        break; // ✅ Success — exit retry loop
      } catch (err) {
        const isRateLimit = err.message.includes("429") || err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED");
        const isAuthError = err.message.includes("API key") || err.message.includes("403") || err.message.includes("401");

        if (isAuthError) {
          stopSpinner();
          displayError("Invalid API key. Please check your .env file.");
          return;
        }

        if (isRateLimit && attempt < MAX_RETRIES) {
          // Exponential backoff: 5s, 10s, 15s, 20s... capped at 30s
          const waitSec = Math.min(attempt * 5, 30);
          stopSpinner();
          startSpinner(displayRetryProgress(attempt, MAX_RETRIES, waitSec));
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          continue;
        }

        if (attempt === MAX_RETRIES) {
          stopSpinner();
          displayError(`API Error after ${MAX_RETRIES} retries: ${err.message}`);
          return;
        }

        // Non-rate-limit transient error — short retry
        const waitMs = attempt * 2000;
        stopSpinner();
        startSpinner(`Retrying in ${waitMs / 1000}s...`);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }

    stopSpinner();

    // Extract the response content
    const rawContent = response?.text();

    if (!rawContent) {
      displayError("Empty response from AI. Retrying...");
      currentInput = JSON.stringify({
        step: "OBSERVE",
        content: "Your previous response was empty. Please respond with a valid JSON step."
      });
      continue;
    }

    // Parse the JSON response
    const parsed = parseAgentResponse(rawContent);

    if (!parsed || !parsed.step) {
      displayError("Failed to parse agent response. Retrying...");
      currentInput = JSON.stringify({
        step: "OBSERVE",
        content: "Your response was not valid JSON. Please respond with exactly one JSON object with a 'step' field. No extra text outside the JSON."
      });
      continue;
    }

    // ── Handle each step type ──

    if (parsed.step === "START") {
      displayStart(parsed.content, iteration);
      currentInput = "Proceed to the next step.";
    }

    else if (parsed.step === "THINK") {
      displayThink(parsed.content, iteration);
      currentInput = "Proceed to the next step.";
    }

    else if (parsed.step === "TOOL") {
      const toolName = parsed.tool_name;
      const toolArgs = parsed.tool_args;

      displayToolCall(toolName, toolArgs, iteration);

      // Execute the tool
      const spinner2 = startSpinner(`Running ${toolName}...`);
      const result = await executeTool(toolName, toolArgs);
      stopSpinner();

      // Track files created for session summary
      if (toolName === "createFile" && !result.startsWith("Error")) {
        const sizeMatch = result.match(/\(([^)]+)\)/);
        sessionStats.filesCreated.push({
          path: toolArgs.filePath || toolArgs.file_path || "unknown",
          size: sizeMatch ? sizeMatch[1] : "unknown",
        });
      }

      // Determine success/failure from result
      const isSuccess = !result.startsWith("Error");
      displayToolResult(isSuccess, result);

      // Feed the result back as an OBSERVE step
      displayObserve(result);

      currentInput = JSON.stringify({
        step: "OBSERVE",
        content: result,
      });
    }

    else if (parsed.step === "OUTPUT") {
      displayOutput(parsed.content);
      displaySessionSummary(sessionStats);
      return; // Task complete — exit the loop
    }

    else {
      // Unknown step type — ask agent to correct itself
      displayError(`Unknown step type: "${parsed.step}"`);
      currentInput = JSON.stringify({
        step: "OBSERVE",
        content: `Unknown step type "${parsed.step}". Valid steps are: START, THINK, TOOL, OUTPUT.`,
      });
    }
  }

  // If we hit the max iterations, show a warning
  displayError(`Reached maximum iterations (${MAX_ITERATIONS}). The agent may be stuck.`);
}

// ─── Application Entry Point ─────────────────────────────────────────────────

/**
 * Main function — starts the CLI agent.
 * Shows welcome banner, enters interactive chat loop.
 */
async function main() {
  // Show the beautiful welcome banner
  showWelcomeBanner();

  // Show system info bar
  displaySystemInfo(MODEL_NAME, apiKeys.length);

  // Interactive chat loop
  while (true) {
    const userInput = await askUser();

    // Handle empty input
    if (!userInput) continue;

    // Handle exit commands
    if (["exit", "quit", "q"].includes(userInput.toLowerCase())) {
      showGoodbye();
      rl.close();
      process.exit(0);
    }

    // Handle help command
    if (userInput.toLowerCase() === "help") {
      displayHelp();
      continue;
    }

    // Handle clear command
    if (userInput.toLowerCase() === "clear") {
      console.clear();
      showWelcomeBanner();
      displaySystemInfo(MODEL_NAME, apiKeys.length);
      continue;
    }

    // Process the user's request through the agent loop
    await processRequest(userInput);

    // Show separator between conversations
    showSeparator();
  }
}

// ─── Start the Application ───────────────────────────────────────────────────

main().catch((err) => {
  displayError(`Fatal error: ${err.message}`);
  process.exit(1);
});
