#!/usr/bin/env node
/**
 * BSM Synthetic Data Filter v3 — Thin wrapper around judge_scenario.js
 *
 * Usage:
 *   node scripts/filter_synthetic.js synthetic_batch_2026-03-12.json
 *   node scripts/filter_synthetic.js synthetic_batch_2026-03-12.json --threshold 7.5
 *   node scripts/filter_synthetic.js synthetic_batch_2026-03-12.json --dry
 *
 * This is now equivalent to:
 *   node scripts/judge_scenario.js <file> --add --threshold 8.0
 */

const { execFileSync } = require("child_process");
const path = require("path");

const args = process.argv.slice(2);

// Build judge args: pass through everything, ensure --add is present
const judgeArgs = [...args];
if (!judgeArgs.includes("--add") && !judgeArgs.includes("--dry")) {
  judgeArgs.push("--add");
}

const judgePath = path.join(__dirname, "judge_scenario.js");

try {
  execFileSync("node", [judgePath, ...judgeArgs], {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    timeout: 1200000, // 20 min max
  });
} catch (e) {
  process.exit(e.status || 1);
}
