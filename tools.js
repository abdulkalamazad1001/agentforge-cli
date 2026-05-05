/**
 * tools.js — Tool Definitions and Implementations for AgentForge
 * 
 * Copyright (c) 2026 Abdul Kalam Azad. All rights reserved.
 * 
 * Provides safe, file-operation tools that the AI agent can call:
 * - createFile: Creates a file with given content
 * - createDirectory: Creates a directory (with nested support)
 * - openInBrowser: Opens a file in the default browser
 * 
 * Each tool returns a result string that gets fed back to the agent
 * as an OBSERVE step.
 * 
 * @author Abdul Kalam Azad
 * @project AgentForge CLI
 */

import { writeFileSync, mkdirSync, existsSync, statSync } from "fs";
import { exec } from "child_process";
import { resolve, dirname } from "path";

// ─── Tool Registry — Abdul Kalam Azad ───────────────────────────────────────

/**
 * Map of tool names to their handler functions.
 * The agent references these names in its TOOL steps.
 */
export const toolMap = {
  createFile,
  createDirectory,
  openInBrowser,
};

/**
 * Tool descriptions to include in the system prompt.
 * These help the LLM understand what each tool does and how to call it.
 */
export const toolDescriptions = `
  Available Tools:
  
  1. createFile(filePath, content)
     - Creates a new file at the specified path with the given content
     - filePath: string — relative path like "output/index.html"
     - content: string — the full file content to write
     - Automatically creates parent directories if they don't exist
     - Returns confirmation with file size
  
  2. createDirectory(dirPath)
     - Creates a new directory at the specified path
     - dirPath: string — relative path like "output" or "output/assets"
     - Creates nested directories automatically (recursive)
     - Returns confirmation message
  
  3. openInBrowser(filePath)
     - Opens the specified HTML file in the user's default web browser
     - filePath: string — relative path to the HTML file like "output/index.html"
     - Works on Windows, macOS, and Linux
     - Returns confirmation message
`;

// ─── Tool Implementations — Abdul Kalam Azad ─────────────────────────────────

/**
 * Creates a file with the given content.
 * Automatically creates parent directories if they don't exist.
 * 
 * @param {string} filePath - Relative path for the file
 * @param {string} content - Content to write to the file
 * @returns {string} Result message
 */
function createFile(filePath, content) {
  try {
    const absolutePath = resolve(process.cwd(), filePath);
    const dir = dirname(absolutePath);

    // Create parent directories if they don't exist
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(absolutePath, content, "utf-8");

    const stats = statSync(absolutePath);
    const sizeKB = (stats.size / 1024).toFixed(1);

    return `File created successfully: ${filePath} (${sizeKB} KB)`;
  } catch (err) {
    return `Error creating file ${filePath}: ${err.message}`;
  }
}

/**
 * Creates a directory (with nested support).
 * 
 * @param {string} dirPath - Relative path for the directory
 * @returns {string} Result message
 */
function createDirectory(dirPath) {
  try {
    const absolutePath = resolve(process.cwd(), dirPath);

    if (existsSync(absolutePath)) {
      return `Directory already exists: ${dirPath}`;
    }

    mkdirSync(absolutePath, { recursive: true });
    return `Directory created successfully: ${dirPath}`;
  } catch (err) {
    return `Error creating directory ${dirPath}: ${err.message}`;
  }
}

/**
 * Opens a file in the user's default web browser.
 * Supports Windows, macOS, and Linux.
 * 
 * @param {string} filePath - Relative path to the file to open
 * @returns {Promise<string>} Result message
 */
function openInBrowser(filePath) {
  return new Promise((resolvePromise) => {
    try {
      const absolutePath = resolve(process.cwd(), filePath);

      if (!existsSync(absolutePath)) {
        resolvePromise(`Error: File not found — ${filePath}`);
        return;
      }

      // Detect OS and use the appropriate command
      const platform = process.platform;
      let cmd;

      if (platform === "win32") {
        cmd = `start "" "${absolutePath}"`;
      } else if (platform === "darwin") {
        cmd = `open "${absolutePath}"`;
      } else {
        cmd = `xdg-open "${absolutePath}"`;
      }

      exec(cmd, (error) => {
        if (error) {
          resolvePromise(`Error opening browser: ${error.message}`);
        } else {
          resolvePromise(`Opened ${filePath} in the default browser successfully`);
        }
      });
    } catch (err) {
      resolvePromise(`Error opening file: ${err.message}`);
    }
  });
}

/**
 * Execute a tool by name with the provided arguments.
 * Handles both object-style and string-style arguments.
 * 
 * @param {string} toolName - Name of the tool to execute
 * @param {*} toolArgs - Arguments to pass to the tool
 * @returns {Promise<string>} Result of the tool execution
 */
export async function executeTool(toolName, toolArgs) {
  const tool = toolMap[toolName];

  if (!tool) {
    return `Error: Unknown tool "${toolName}". Available tools: ${Object.keys(toolMap).join(", ")}`;
  }

  try {
    // Handle different argument formats the LLM might use
    if (typeof toolArgs === "object" && toolArgs !== null) {
      // Object-style: { filePath: "...", content: "..." }
      if (toolArgs.filePath && toolArgs.content !== undefined) {
        return await tool(toolArgs.filePath, toolArgs.content);
      }
      if (toolArgs.filePath) {
        return await tool(toolArgs.filePath);
      }
      if (toolArgs.dirPath) {
        return await tool(toolArgs.dirPath);
      }
      // Fallback: pass all values as positional args
      const values = Object.values(toolArgs);
      return await tool(...values);
    }

    // String-style: just a single argument
    return await tool(toolArgs);
  } catch (err) {
    return `Error executing ${toolName}: ${err.message}`;
  }
}
