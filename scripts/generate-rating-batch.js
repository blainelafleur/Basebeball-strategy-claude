#!/usr/bin/env node
/**
 * Phase 1: Batch-generate scenarios for coach rating.
 *
 * Generates N scenarios via the multi-agent pipeline and saves them
 * as a JSON file ready for the rating tool.
 *
 * Usage:
 *   node scripts/generate-rating-batch.js [count] [position]
 *
 * Examples:
 *   node scripts/generate-rating-batch.js 20          # 20 random-position scenarios
 *   node scripts/generate-rating-batch.js 10 pitcher   # 10 pitcher scenarios
 *
 * Output: phase1-finetune/scenarios-to-rate-YYYY-MM-DD.json
 */

const fs = require("fs");
const path = require("path");

const WORKER_BASE = "https://bsm-ai-proxy.blafleur.workers.dev";
const MULTI_AGENT_URL = `${WORKER_BASE}/v1/multi-agent`;
const OUTPUT_DIR = path.join(__dirname, "..", "phase1-finetune");

const ALL_POSITIONS = [
  "pitcher", "catcher", "firstBase", "secondBase", "shortstop", "thirdBase",
  "leftField", "centerField", "rightField", "batter", "baserunner", "manager",
  "famous", "rules", "counts"
];

const CONTEXT_TEMPLATES = {
  beginner: { accuracy: 0.45, level: 2, context: "Beginner, just learning the position" },
  intermediate: { accuracy: 0.62, level: 8, context: "Intermediate, knows basics, working on situational play" },
  advanced: { accuracy: 0.80, level: 15, context: "Advanced, solid fundamentals, working on edge cases" },
  expert: { accuracy: 0.90, level: 22, context: "Expert, mastered most concepts" }
};

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateOne(position, diffKey) {
  const ctx = CONTEXT_TEMPLATES[diffKey];
  const t0 = Date.now();

  const res = await fetch(MULTI_AGENT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      position,
      difficulty: diffKey === "beginner" ? 1 : diffKey === "intermediate" ? 2 : 3,
      playerContext: { accuracy: ctx.accuracy, level: ctx.level },
      principles: ctx.context
    }),
    signal: AbortSignal.timeout(120000)
  });

  const data = await res.json();
  const elapsed = Date.now() - t0;

  if (!res.ok || !data.scenario) {
    return { success: false, error: data.error?.message || JSON.stringify(data.error || "Unknown error"), elapsed };
  }

  return {
    success: true,
    elapsed,
    scenario: data.scenario,
    critique: data.critique,
    pipeline: data.pipeline
  };
}

async function main() {
  const count = parseInt(process.argv[2]) || 20;
  const filterPosition = process.argv[3] || null;

  if (filterPosition && !ALL_POSITIONS.includes(filterPosition)) {
    console.error(`Unknown position: ${filterPosition}`);
    console.error(`Valid: ${ALL_POSITIONS.join(", ")}`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\nGenerating ${count} scenarios for rating...`);
  if (filterPosition) console.log(`  Position filter: ${filterPosition}`);
  console.log(`  Worker: ${WORKER_BASE}`);
  console.log("");

  const results = [];
  let successes = 0;
  let failures = 0;

  for (let i = 0; i < count; i++) {
    const position = filterPosition || pickRandom(ALL_POSITIONS);
    const diffKey = pickRandom(DIFFICULTIES);
    const label = `[${i + 1}/${count}] ${position} (${diffKey})`;

    process.stdout.write(`${label} ... `);

    try {
      const result = await generateOne(position, diffKey);

      if (result.success) {
        successes++;
        results.push({
          id: `rate_${Date.now()}_${i}`,
          position,
          difficulty: diffKey,
          scenario: result.scenario,
          critiqueScore: result.critique?.score || null,
          critiqueRubric: result.critique?.rubric || null,
          pipelineModel: result.pipeline?.model || "claude-opus-4",
          generatedAt: new Date().toISOString(),
          // Coach fills these in via the rating tool:
          ratings: null,
          preferredExplanation: null,
          coachComments: null
        });
        console.log(`OK "${result.scenario.title}" (${(result.elapsed / 1000).toFixed(1)}s, critique=${result.critique?.score || "?"})`);
      } else {
        failures++;
        console.log(`FAILED: ${result.error} (${(result.elapsed / 1000).toFixed(1)}s)`);
      }
    } catch (e) {
      failures++;
      console.log(`ERROR: ${e.message}`);
    }

    // Rate limit spacing: 15s between calls
    if (i < count - 1) {
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  // Save results
  const dateStr = new Date().toISOString().split("T")[0];
  const outFile = path.join(OUTPUT_DIR, `scenarios-to-rate-${dateStr}.json`);

  // Append to existing file if it exists
  let existing = [];
  if (fs.existsSync(outFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(outFile, "utf-8"));
      console.log(`\nAppending to existing file (${existing.length} previous scenarios)`);
    } catch (e) { /* start fresh */ }
  }

  const combined = [...existing, ...results];
  fs.writeFileSync(outFile, JSON.stringify(combined, null, 2));

  console.log(`\nDone: ${successes} generated, ${failures} failed`);
  console.log(`Saved ${combined.length} total scenarios to: ${outFile}`);
  console.log(`\nNext: Open phase1-finetune/rating-tool.html in a browser to rate them.`);
}

main().catch(e => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
