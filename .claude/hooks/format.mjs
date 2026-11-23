#!/usr/bin/env node
// PostToolUse hook: format a file with Prettier after Claude edits or writes it.
// Receives the hook payload as JSON on stdin. Never blocks the edit: any
// failure is ignored and the hook exits 0.
import { spawnSync } from "node:child_process";
import { relative } from "node:path";

const FORMATTABLE = /\.(astro|ts|tsx|js|mjs|jsx|vue|css|json|md)$/;
const SKIP = /(^|\/)(dist|node_modules|\.astro|\.checks)\//;

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const { tool_input, cwd } = JSON.parse(input);
    const file = tool_input?.file_path;
    if (!file || !FORMATTABLE.test(file)) return;
    const rel = relative(cwd ?? process.cwd(), file);
    if (rel.startsWith("..") || SKIP.test(rel) || rel === "package-lock.json")
      return;
    spawnSync("npx", ["prettier", "--write", "--ignore-unknown", file], {
      cwd: cwd ?? process.cwd(),
      stdio: "ignore",
      timeout: 20_000,
    });
  } catch {
    // never block an edit on formatting
  }
});
