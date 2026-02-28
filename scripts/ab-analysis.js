#!/usr/bin/env node
// Sprint E2: A/B Test Analysis — pulls analytics events and determines winners
// Usage: ADMIN_KEY=xxx WORKER_URL=https://bsm-ai-proxy.blafleur.workers.dev node scripts/ab-analysis.js

const WORKER = process.env.WORKER_URL || "https://bsm-ai-proxy.blafleur.workers.dev";
const KEY = process.env.ADMIN_KEY;

if (!KEY) {
  console.error("Set ADMIN_KEY environment variable");
  process.exit(1);
}

async function main() {
  console.log("Baseball Strategy Master — A/B Test Analysis");
  console.log("=".repeat(50));

  try {
    const res = await fetch(WORKER + "/analytics/summary", {
      headers: { "X-Admin-Key": KEY },
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("Error:", data.error);
      return;
    }

    const summary = data.summary || {};
    console.log("\nOverall Metrics:");
    console.log(`  Total Events: ${summary.totalEvents || 0}`);
    console.log(`  Unique Sessions: ${summary.uniqueSessions || 0}`);
    console.log(`  Pro Users: ${summary.proUsers || 0}`);

    // A/B tests are tracked via analytics events with variant field
    // This script provides the framework — populate with real event data
    console.log("\nActive A/B Tests:");
    console.log("  ai_temperature — Controls AI scenario creativity");
    console.log("  ai_system_prompt — Tests different AI prompt styles");
    console.log("\nNote: Wire up event aggregation from your analytics");
    console.log("pipeline to calculate conversion rates per variant.");
    console.log("\nTo determine a winner:");
    console.log("  1. Group scenario_answer events by ab_variant");
    console.log("  2. Compare: accuracy rate, session length, retention");
    console.log("  3. Run chi-squared test for statistical significance");
    console.log("  4. Need 100+ events per variant for reliable results");
  } catch (e) {
    console.error("Network error:", e.message);
  }
}

main();
