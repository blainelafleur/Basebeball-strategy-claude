#!/usr/bin/env node
/**
 * Batch AI Scenario Generator
 *
 * Generates 315 scenarios via the multi-agent pipeline:
 *   15 positions x 3 difficulty levels x 7 per combo = 315 attempts
 *
 * Estimated cost:
 *   315 requests x multi-agent pipeline (4 Claude calls/scenario x ~$0.15-0.50 each)
 *   = ~$140-160 total
 *
 * Estimated runtime:
 *   ~2.5 hours (315 requests, concurrency 2, 5s delay between batches,
 *   ~25-40s per pipeline call)
 *
 * Usage:
 *   node scripts/batch_generate.js
 *   node scripts/batch_generate.js --start 45    # Resume from combo index 45
 *   node scripts/batch_generate.js --dry-run     # Print matrix without calling API
 *
 * Output:
 *   scripts/batch_generated_YYYY-MM-DD.json   — successful scenarios
 *   scripts/batch_failures_YYYY-MM-DD.json    — failed attempts with error details
 */

const fs = require("fs");
const path = require("path");

// ─── Config ──────────────────────────────────────────────────────────────────

const WORKER_URL = "https://bsm-worker.blainelafleur.workers.dev/v1/multi-agent";
const CONCURRENCY = 2;
const BATCH_DELAY_MS = 5000;
const REQUEST_TIMEOUT_MS = 120_000;
const MAX_RETRIES = 1;
const SCENARIOS_PER_COMBO = 7;

// ─── Positions ───────────────────────────────────────────────────────────────

const POSITIONS = [
  "pitcher", "catcher", "firstBase", "secondBase", "shortstop",
  "thirdBase", "leftField", "centerField", "rightField",
  "batter", "baserunner", "manager", "famous", "rules", "counts"
];

const DIFFICULTIES = [1, 2, 3];

// Map difficulty to a representative player age
const DIFFICULTY_AGE = { 1: 10, 2: 12, 3: 14 };

// Map difficulty to a player context string
function buildPlayerContext(position, difficulty) {
  const age = DIFFICULTY_AGE[difficulty];
  const labels = { 1: "Rookie", 2: "Pro", 3: "All-Star" };
  const descriptions = {
    1: `Age ${age}, beginner, learning basic ${position} fundamentals. No prior scenarios completed.`,
    2: `Age ${age}, intermediate player, ~60% accuracy. Familiar with core concepts, working on situational decisions.`,
    3: `Age ${age}, advanced player, ~80% accuracy. Solid fundamentals, ready for analytics-informed strategy.`
  };
  return `${labels[difficulty]} difficulty (${descriptions[difficulty]})`;
}

// ─── Generation Matrix ───────────────────────────────────────────────────────

function buildMatrix() {
  const matrix = [];
  for (const position of POSITIONS) {
    for (const difficulty of DIFFICULTIES) {
      for (let i = 0; i < SCENARIOS_PER_COMBO; i++) {
        matrix.push({
          position,
          difficulty,
          playerAge: DIFFICULTY_AGE[difficulty],
          index: i,
          label: `${position}/diff${difficulty}/#${i + 1}`
        });
      }
    }
  }
  return matrix;
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validateScenario(scenario) {
  const issues = [];

  // Required fields
  const required = ["id", "title", "options", "best", "explanations", "rates", "concept"];
  for (const field of required) {
    if (scenario[field] === undefined || scenario[field] === null) {
      issues.push(`missing required field: ${field}`);
    }
  }
  if (issues.length > 0) return { valid: false, issues };

  // Options: must be array of 4 distinct strings
  if (!Array.isArray(scenario.options) || scenario.options.length !== 4) {
    issues.push(`options must be array of 4, got ${Array.isArray(scenario.options) ? scenario.options.length : typeof scenario.options}`);
  } else {
    const unique = new Set(scenario.options.map(o => (o || "").trim().toLowerCase()));
    if (unique.size !== 4) {
      issues.push(`options not all distinct (${unique.size} unique out of 4)`);
    }
  }

  // Best index
  if (typeof scenario.best !== "number" || scenario.best < 0 || scenario.best > 3) {
    issues.push(`best index invalid: ${scenario.best}`);
  }

  // Explanations: must be array of 4, each >= 25 words
  if (!Array.isArray(scenario.explanations) || scenario.explanations.length !== 4) {
    issues.push(`explanations must be array of 4, got ${Array.isArray(scenario.explanations) ? scenario.explanations.length : typeof scenario.explanations}`);
  } else {
    for (let i = 0; i < 4; i++) {
      const wordCount = (scenario.explanations[i] || "").trim().split(/\s+/).filter(Boolean).length;
      if (wordCount < 25) {
        issues.push(`explanation[${i}] too short: ${wordCount} words (min 25)`);
      }
    }
  }

  // Rates: array of 4 numbers, best has highest, none < 5 or > 95, best >= 65
  if (!Array.isArray(scenario.rates) || scenario.rates.length !== 4) {
    issues.push(`rates must be array of 4, got ${Array.isArray(scenario.rates) ? scenario.rates.length : typeof scenario.rates}`);
  } else {
    const bestIdx = scenario.best;
    const bestRate = scenario.rates[bestIdx];
    const maxRate = Math.max(...scenario.rates);

    if (bestRate !== maxRate) {
      issues.push(`rates[best=${bestIdx}] (${bestRate}) is not the highest rate (${maxRate})`);
    }
    if (bestRate < 65) {
      issues.push(`best rate ${bestRate} is below 65`);
    }
    for (let i = 0; i < 4; i++) {
      if (scenario.rates[i] < 5) {
        issues.push(`rates[${i}] = ${scenario.rates[i]} is below 5`);
      }
      if (scenario.rates[i] > 95) {
        issues.push(`rates[${i}] = ${scenario.rates[i]} is above 95`);
      }
    }
  }

  // Concept: non-empty string
  if (typeof scenario.concept !== "string" || scenario.concept.trim().length === 0) {
    issues.push("concept is empty or not a string");
  }

  return { valid: issues.length === 0, issues };
}

// ─── API Call ────────────────────────────────────────────────────────────────

async function generateScenario(entry) {
  const body = {
    position: entry.position,
    playerContext: buildPlayerContext(entry.position, entry.difficulty),
    maxRetries: MAX_RETRIES
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const t0 = Date.now();
  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const elapsed = Date.now() - t0;

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      let errMsg;
      try {
        errMsg = JSON.parse(errBody).error || `HTTP ${res.status}`;
      } catch {
        errMsg = `HTTP ${res.status}: ${errBody.slice(0, 200)}`;
      }
      return { success: false, elapsed, error: errMsg };
    }

    const data = await res.json();
    if (!data.scenario) {
      return { success: false, elapsed, error: "Response missing scenario object" };
    }

    const validation = validateScenario(data.scenario);

    return {
      success: true,
      elapsed,
      scenario: data.scenario,
      critique: data.critique || null,
      pipeline: data.pipeline || null,
      validation
    };
  } catch (e) {
    const elapsed = Date.now() - t0;
    if (e.name === "AbortError") {
      return { success: false, elapsed, error: `Timeout after ${REQUEST_TIMEOUT_MS}ms` };
    }
    return { success: false, elapsed, error: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Concurrency helper ─────────────────────────────────────────────────────

async function runBatch(entries, onResult) {
  const results = [];
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(entry => generateScenario(entry)));

    for (let j = 0; j < batchResults.length; j++) {
      const entry = batch[j];
      const result = batchResults[j];
      result.entry = entry;
      results.push(result);
      onResult(result, results.length, entries.length);
    }

    // Delay between batches (skip after last batch)
    if (i + CONCURRENCY < entries.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }
  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const startFlag = args.indexOf("--start");
  const startIdx = startFlag !== -1 ? parseInt(args[startFlag + 1], 10) || 0 : 0;

  const matrix = buildMatrix();
  const total = matrix.length;
  const remaining = matrix.slice(startIdx);

  console.log(`\nBSM Batch Scenario Generator`);
  console.log(`  Total combos: ${POSITIONS.length} positions x ${DIFFICULTIES.length} difficulties x ${SCENARIOS_PER_COMBO}/combo = ${total}`);
  console.log(`  Starting at: #${startIdx + 1}`);
  console.log(`  Generating: ${remaining.length} scenarios`);
  console.log(`  Concurrency: ${CONCURRENCY}`);
  console.log(`  Batch delay: ${BATCH_DELAY_MS / 1000}s`);
  console.log(`  Request timeout: ${REQUEST_TIMEOUT_MS / 1000}s`);
  console.log(`  Max retries (server-side): ${MAX_RETRIES}`);
  console.log("");

  if (dryRun) {
    console.log("DRY RUN - Matrix preview (first 20 entries):\n");
    for (const entry of remaining.slice(0, 20)) {
      console.log(`  ${entry.label}  age=${entry.playerAge}  ctx="${buildPlayerContext(entry.position, entry.difficulty).slice(0, 60)}..."`);
    }
    if (remaining.length > 20) {
      console.log(`  ... and ${remaining.length - 20} more`);
    }
    process.exit(0);
  }

  const today = new Date().toISOString().slice(0, 10);
  const successPath = path.join(__dirname, `batch_generated_${today}.json`);
  const failurePath = path.join(__dirname, `batch_failures_${today}.json`);

  const successes = [];
  const failures = [];
  let validationPasses = 0;
  let validationFails = 0;
  const startTime = Date.now();

  console.log("-".repeat(90));

  const results = await runBatch(remaining, (result, done, total) => {
    const entry = result.entry;
    const pct = Math.round(done / total * 100);

    if (result.success) {
      const vPass = result.validation.valid;
      if (vPass) validationPasses++;
      else validationFails++;

      const critiqueScore = result.critique?.score ?? "?";
      const critiquePass = result.critique?.pass ? "PASS" : "FAIL";
      const vLabel = vPass ? "VALID" : "INVALID";
      const elapsed = (result.elapsed / 1000).toFixed(1);

      successes.push({
        label: entry.label,
        position: entry.position,
        difficulty: entry.difficulty,
        scenario: result.scenario,
        critique: result.critique,
        pipeline: result.pipeline,
        validation: result.validation,
        elapsed: result.elapsed
      });

      // Log every result
      const titleShort = (result.scenario.title || "untitled").slice(0, 40);
      console.log(
        `[${String(done).padStart(3)}/${total}] ${pct}%  ${entry.label.padEnd(24)} ` +
        `${elapsed}s  critique=${critiqueScore}/10 ${critiquePass}  ${vLabel}  "${titleShort}"`
      );
    } else {
      failures.push({
        label: entry.label,
        position: entry.position,
        difficulty: entry.difficulty,
        error: result.error,
        elapsed: result.elapsed
      });

      const elapsed = (result.elapsed / 1000).toFixed(1);
      console.log(
        `[${String(done).padStart(3)}/${total}] ${pct}%  ${entry.label.padEnd(24)} ` +
        `${elapsed}s  FAILED: ${result.error}`
      );
    }

    // Progress summary every 10 scenarios
    if (done % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      const rate = (done / ((Date.now() - startTime) / 1000)).toFixed(2);
      const eta = done < total
        ? (((total - done) / parseFloat(rate)) / 60).toFixed(0)
        : 0;
      console.log(
        `    --- Progress: ${successes.length} ok / ${failures.length} failed / ` +
        `${validationPasses} valid / ${validationFails} invalid | ` +
        `${elapsed}min elapsed | ~${rate} req/s | ETA ~${eta}min ---`
      );
    }
  });

  // ─── Final Summary ──────────────────────────────────────────────────────

  const totalElapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log("\n" + "=".repeat(90));
  console.log(`\nBATCH GENERATION COMPLETE\n`);
  console.log(`  Total attempted:     ${remaining.length}`);
  console.log(`  Successful:          ${successes.length} (${Math.round(successes.length / remaining.length * 100)}%)`);
  console.log(`  Failed:              ${failures.length}`);
  console.log(`  Validation passed:   ${validationPasses}`);
  console.log(`  Validation failed:   ${validationFails}`);
  console.log(`  Runtime:             ${totalElapsed} minutes`);

  if (successes.length > 0) {
    const avgElapsed = Math.round(successes.reduce((a, s) => a + s.elapsed, 0) / successes.length);
    const avgCritique = successes
      .filter(s => s.critique?.score != null)
      .reduce((a, s, _, arr) => a + s.critique.score / arr.length, 0)
      .toFixed(2);
    const critiquePassCount = successes.filter(s => s.critique?.pass).length;
    const totalTokens = successes.reduce((a, s) => {
      const p = s.pipeline || {};
      return a + (p.totalInputTokens || 0) + (p.totalOutputTokens || 0);
    }, 0);

    console.log(`  Avg response time:   ${(avgElapsed / 1000).toFixed(1)}s`);
    console.log(`  Avg critique score:  ${avgCritique}/10`);
    console.log(`  Critique pass rate:  ${critiquePassCount}/${successes.length} (${Math.round(critiquePassCount / successes.length * 100)}%)`);
    console.log(`  Total tokens used:   ${totalTokens.toLocaleString()}`);

    // Per-position breakdown
    console.log(`\n  Per-position breakdown:`);
    console.log(`  ${"Position".padEnd(14)} ${"Count".padEnd(7)} ${"Valid".padEnd(7)} ${"Critique".padEnd(10)} ${"Avg Time".padEnd(10)}`);
    console.log(`  ${"-".repeat(48)}`);

    const byPos = {};
    for (const s of successes) {
      if (!byPos[s.position]) byPos[s.position] = { count: 0, valid: 0, critiqueSum: 0, elapsedSum: 0 };
      byPos[s.position].count++;
      if (s.validation.valid) byPos[s.position].valid++;
      byPos[s.position].critiqueSum += s.critique?.score || 0;
      byPos[s.position].elapsedSum += s.elapsed;
    }
    for (const pos of POSITIONS) {
      const d = byPos[pos];
      if (!d) continue;
      const avgC = (d.critiqueSum / d.count).toFixed(1);
      const avgT = (d.elapsedSum / d.count / 1000).toFixed(1);
      console.log(`  ${pos.padEnd(14)} ${String(d.count).padEnd(7)} ${String(d.valid).padEnd(7)} ${(avgC + "/10").padEnd(10)} ${avgT + "s"}`);
    }
  }

  // ─── Save Results ───────────────────────────────────────────────────────

  const successOutput = {
    generatedAt: new Date().toISOString(),
    totalAttempted: remaining.length,
    totalSucceeded: successes.length,
    totalFailed: failures.length,
    validationPassed: validationPasses,
    validationFailed: validationFails,
    runtimeMinutes: parseFloat(totalElapsed),
    scenarios: successes.map(s => ({
      position: s.position,
      difficulty: s.difficulty,
      scenario: s.scenario,
      critiqueScore: s.critique?.score ?? null,
      critiquePass: s.critique?.pass ?? false,
      validationValid: s.validation.valid,
      validationIssues: s.validation.issues,
      elapsedMs: s.elapsed
    }))
  };

  fs.writeFileSync(successPath, JSON.stringify(successOutput, null, 2));
  console.log(`\n  Successes saved: ${successPath}`);

  if (failures.length > 0) {
    const failureOutput = {
      generatedAt: new Date().toISOString(),
      totalFailed: failures.length,
      failures: failures.map(f => ({
        position: f.position,
        difficulty: f.difficulty,
        label: f.label,
        error: f.error,
        elapsedMs: f.elapsed
      }))
    };
    fs.writeFileSync(failurePath, JSON.stringify(failureOutput, null, 2));
    console.log(`  Failures saved:  ${failurePath}`);
  }

  console.log("");
}

main().catch(e => {
  console.error("Batch generator failed:", e);
  process.exit(1);
});
