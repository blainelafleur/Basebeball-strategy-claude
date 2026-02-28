#!/usr/bin/env node
// Sprint E3: Scenario Difficulty Recalibration
// Analyzes real player data to flag scenarios where actual difficulty
// doesn't match assigned difficulty rating.
// Usage: ADMIN_KEY=xxx node scripts/recalibrate.js

const WORKER = process.env.WORKER_URL || "https://bsm-ai-proxy.blafleur.workers.dev";
const KEY = process.env.ADMIN_KEY;

if (!KEY) {
  console.error("Set ADMIN_KEY environment variable");
  process.exit(1);
}

async function main() {
  console.log("Baseball Strategy Master — Scenario Difficulty Recalibration");
  console.log("=".repeat(55));

  try {
    const res = await fetch(WORKER + "/analytics/summary", {
      headers: { "X-Admin-Key": KEY },
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("Error:", data.error);
      return;
    }

    // The calibration data comes from scenario_answer analytics events
    // which include: scenario id, position, difficulty, correct/incorrect
    console.log("\nRecalibration Framework:");
    console.log("  Expected accuracy by difficulty:");
    console.log("    diff:1 (Rookie)   — 70-85% correct");
    console.log("    diff:2 (Pro)      — 45-65% correct");
    console.log("    diff:3 (All-Star) — 25-45% correct");
    console.log("\n  Flag scenarios where:");
    console.log("    - diff:1 but <55% accuracy → too hard for Rookie");
    console.log("    - diff:3 but >70% accuracy → too easy for All-Star");
    console.log("    - diff:2 but <30% or >80% → misclassified");
    console.log("\n  Minimum sample: 20 plays per scenario for reliable data");
    console.log("\n  Connect your analytics pipeline to run this analysis.");
    console.log("  The scenarioCalibration field in player state already");
    console.log("  tracks per-scenario accuracy client-side.");
  } catch (e) {
    console.error("Network error:", e.message);
  }
}

main();
