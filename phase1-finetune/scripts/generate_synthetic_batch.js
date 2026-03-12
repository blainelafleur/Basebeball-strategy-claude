#!/usr/bin/env node
/**
 * BSM Synthetic Data Generator v2
 *
 * Generates balanced baseball strategy scenarios via the multi-agent pipeline,
 * using 8+ golden examples as heavy few-shot references.
 * Forces strict JSON output — no markdown, no extra text.
 *
 * Usage:
 *   node scripts/generate_synthetic_batch.js 200        # generate 200 scenarios
 *   node scripts/generate_synthetic_batch.js 50 --fast   # skip multi-agent, use standard pipeline
 *   node scripts/generate_synthetic_batch.js 10 --dry    # plan only, don't call API
 */

const fs = require("fs");
const path = require("path");

// ── Config ──
const WORKER_URL = "https://bsm-ai-proxy.blafleur.workers.dev";
const MULTI_AGENT = "/v1/multi-agent";
const STANDARD = "/v1/chat/completions";
const CONCURRENCY = 3;
const RETRY_MAX = 2;
const RETRY_DELAY_MS = 5000;
const REQUEST_TIMEOUT_MS = 120000;
const FEW_SHOT_COUNT = 8; // minimum golden examples per prompt

const POSITIONS = [
  "pitcher", "catcher", "firstBase", "secondBase", "shortstop", "thirdBase",
  "leftField", "centerField", "rightField", "batter", "baserunner", "manager",
  "famous", "rules", "counts"
];

const DIFFICULTIES = [
  { name: "beginner", diff: 1 },
  { name: "intermediate", diff: 2 },
  { name: "advanced", diff: 3 }
];

const CONCEPTS = [
  "force-vs-tag", "cutoff-relay", "bunt-sacrifice", "hit-and-run", "double-play-turn",
  "pitch-sequencing", "count-leverage", "steal-breakeven", "backup-coverage",
  "rundown-technique", "pickoff-move", "pitch-clock-awareness", "wild-pitch-coverage",
  "squeeze-play", "infield-fly-rule", "outfield-communication", "popup-priority",
  "obstruction-interference", "tag-up-advance", "pitching-change", "intentional-walk",
  "shift-positioning", "baserunner-reads", "pre-pitch-positioning", "first-pitch-strike",
  "two-strike-approach", "pitch-recognition", "launch-angle", "spray-chart",
  "platoon-advantage", "times-through-order", "win-probability", "leverage-index",
  "run-expectancy", "pitch-tunneling", "defensive-indifference", "appeal-play",
  "balk-rules", "dropped-third-strike", "ground-rule-double", "fair-foul",
  "neighborhood-play", "batting-order", "lineup-construction", "bullpen-management",
  "defensive-alignment", "sign-sequences", "pace-of-play"
];

const ANIMATIONS = [
  "steal", "score", "hit", "throwHome", "doubleplay", "strike", "strikeout",
  "groundout", "flyout", "catch", "advance", "walk", "bunt", "safe", "freeze"
];

// ── Load golden examples for few-shot ──
function loadGoldenExamples() {
  const goldenPath = path.join(__dirname, "..", "golden_examples", "golden_examples.jsonl");
  if (!fs.existsSync(goldenPath)) {
    console.error("ERROR: golden_examples.jsonl not found at", goldenPath);
    process.exit(1);
  }
  const lines = fs.readFileSync(goldenPath, "utf8").trim().split("\n");
  return lines.map(l => JSON.parse(l));
}

// ── Build balanced generation plan ──
function buildPlan(count) {
  const plan = [];
  let idx = 0;
  while (plan.length < count) {
    const pos = POSITIONS[idx % POSITIONS.length];
    const diff = DIFFICULTIES[idx % DIFFICULTIES.length];
    const concept = CONCEPTS[idx % CONCEPTS.length];
    plan.push({ position: pos, difficulty: diff.name, diff: diff.diff, concept });
    idx++;
  }
  for (let i = plan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [plan[i], plan[j]] = [plan[j], plan[i]];
  }
  return plan;
}

// ── Pick 8+ few-shot examples (position-matched + diverse) ──
function pickFewShot(golden, position, diff) {
  const posMatch = golden.filter(g => g.cat === position);
  const diffMatch = golden.filter(g => g.diff === diff && g.cat !== position);
  const rest = golden.filter(g => g.cat !== position && g.diff !== diff);

  // Shuffle each pool
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  const selected = [];
  // At least 3 from same position (if available)
  selected.push(...shuffle(posMatch).slice(0, Math.min(4, posMatch.length)));
  // At least 2 from same difficulty but different position
  selected.push(...shuffle(diffMatch).slice(0, Math.min(3, diffMatch.length)));
  // Fill rest from diverse pool
  const need = FEW_SHOT_COUNT - selected.length;
  if (need > 0) {
    const remaining = shuffle(rest).filter(g => !selected.includes(g));
    selected.push(...remaining.slice(0, need));
  }
  // If still short (tiny golden set), pad from anything
  if (selected.length < FEW_SHOT_COUNT) {
    const all = shuffle(golden).filter(g => !selected.includes(g));
    selected.push(...all.slice(0, FEW_SHOT_COUNT - selected.length));
  }
  return selected.slice(0, FEW_SHOT_COUNT);
}

// ── Build the strict JSON-only prompt ──
function buildGenerationPrompt(task, fewShotExamples) {
  // Strip internal fields from few-shot examples
  const cleanExamples = fewShotExamples.map(ex => {
    const { generatedAt, pipeline, _judgeScore, _judgeDetails, coachScore, source, ...clean } = ex;
    return clean;
  });

  const examplesBlock = cleanExamples.map((ex, i) =>
    `EXAMPLE ${i + 1}:\n${JSON.stringify(ex)}`
  ).join("\n\n");

  return `Generate ONE baseball strategy scenario. Return ONLY a raw JSON object. No markdown. No backticks. No explanation before or after. Just the JSON.

POSITION: ${task.position}
DIFFICULTY: ${task.difficulty} (level ${task.diff})
CONCEPT: ${task.concept}

STRICT RULES:
1. Write description in 2nd person ("You are the ${task.position}...")
2. Exactly 4 options, exactly 1 best answer (index 0-3)
3. Exactly 4 explanations that teach WHY each choice is good or bad
4. Best answer explanation must be at least 40 words with causal reasoning ("because", "this means", "the reason")
5. All explanations must be at least 25 words
6. rates[best] must be 78-90
7. Exactly one tempting wrong answer with rate 42-65
8. Other wrong answers: rate 12-35
9. Sum of all 4 rates must be 170-190
10. All 4 options must start with different verbs and describe genuinely different actions
11. situation must include inning, outs, count, runners array, and score array
12. anim must be one of: ${ANIMATIONS.join(", ")}
13. diff must be ${task.diff}
14. Do NOT copy any example below — create a completely new scenario

REQUIRED JSON SHAPE:
{"id":"","title":"","diff":${task.diff},"cat":"${task.position}","conceptTag":"${task.concept}","description":"","situation":{"inning":"","outs":0,"count":"","runners":[],"score":[0,0]},"options":["","","",""],"best":0,"explanations":["","","",""],"rates":[0,0,0,0],"concept":"","anim":""}

Here are ${FEW_SHOT_COUNT} reference examples of PERFECT scenarios. Study their structure, depth, and quality:

${examplesBlock}

Now generate ONE new scenario. Start with { and end with }. No markdown. No backticks. No text. Just the JSON object.`;
}

// ── Generate one scenario ──
async function generateOne(task, golden, useFast) {
  const fewShot = pickFewShot(golden, task.position, task.diff);

  if (useFast) {
    const prompt = buildGenerationPrompt(task, fewShot);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const resp = await fetch(`${WORKER_URL}${STANDARD}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "grok-4",
          messages: [
            {
              role: "system",
              content: "You generate baseball strategy scenarios as raw JSON. CRITICAL RULES:\n1. Your ENTIRE response is a single JSON object — nothing else\n2. NEVER use markdown code fences (``` or ```json)\n3. NEVER add text, explanation, or commentary before or after the JSON\n4. Start your response with { and end with }\n5. The response must pass JSON.parse() directly with zero cleanup\n6. All string values must use standard double quotes, no smart quotes"
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2500
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text.slice(0, 200)}`);
      }

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || "";
      return parseScenarioJSON(content, task);
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  } else {
    // Multi-agent pipeline via Claude Opus
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const resp = await fetch(`${WORKER_URL}${MULTI_AGENT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: task.position,
          playerContext: `Generating synthetic training data. Target: ${task.concept}. Difficulty: ${task.difficulty}.`,
          positionRules: "",
          targetConcept: task.concept,
          maxRetries: 1
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text.slice(0, 200)}`);
      }

      const data = await resp.json();
      if (data.scenario) {
        return normalizeScenario(data.scenario, task, data.critique?.score);
      }
      throw new Error(data.error || "No scenario returned");
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  }
}

// ── Parse JSON from LLM response (strict — reject markdown) ──
function parseScenarioJSON(text, task) {
  let raw = text.trim();
  let jsonClean = true; // tracks if response was pure JSON

  // Detect markdown contamination
  const hadMarkdown = /```/.test(raw);
  if (hadMarkdown) {
    jsonClean = false;
    raw = raw.replace(/^```(?:json)?\s*/gm, "").replace(/```\s*$/gm, "").trim();
  }

  // Detect non-JSON preamble/epilogue
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");

  const before = raw.slice(0, start).trim();
  const after = raw.slice(end + 1).trim();
  if (before.length > 0 || after.length > 0) jsonClean = false;
  if (before.length > 20) throw new Error(`Non-JSON preamble: "${before.slice(0, 50)}..."`);
  if (after.length > 20) throw new Error(`Non-JSON epilogue: "${after.slice(0, 50)}..."`);

  const jsonStr = raw.slice(start, end + 1);
  const obj = JSON.parse(jsonStr);

  // Validate required fields exist with correct types
  const REQUIRED = {
    title: "string", description: "string", options: "array", best: "number",
    explanations: "array", rates: "array", concept: "string", anim: "string"
  };
  for (const [field, type] of Object.entries(REQUIRED)) {
    if (!(field in obj)) throw new Error(`Missing required field: ${field}`);
    if (type === "array" && !Array.isArray(obj[field])) throw new Error(`${field} must be array`);
    if (type !== "array" && typeof obj[field] !== type) throw new Error(`${field} must be ${type}`);
  }
  if (!obj.situation || typeof obj.situation !== "object") throw new Error("Missing situation object");

  const scenario = normalizeScenario(obj, task, null);
  scenario._jsonClean = jsonClean;
  return scenario;
}

// ── Normalize and validate scenario fields ──
function normalizeScenario(obj, task, critiqueScore) {
  const id = `syn_${task.position}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const scenario = {
    id,
    title: obj.title || "Untitled",
    diff: obj.diff || task.diff,
    cat: task.position,
    conceptTag: obj.conceptTag || task.concept,
    description: obj.description || "",
    situation: obj.situation || { inning: "Top 1", outs: 0, count: "0-0", runners: [], score: [0, 0] },
    options: obj.options || [],
    best: typeof obj.best === "number" ? obj.best : 0,
    explanations: obj.explanations || [],
    rates: obj.rates || [],
    concept: obj.concept || "",
    anim: ANIMATIONS.includes(obj.anim) ? obj.anim : "freeze",
    source: "synthetic",
    coachScore: critiqueScore || null,
    generatedAt: new Date().toISOString(),
    pipeline: task.useFast ? "standard" : "multi-agent"
  };

  // Fix rates
  if (scenario.rates.length === 4) {
    scenario.rates = fixRates(scenario.rates, scenario.best);
  }

  return scenario;
}

// ── Fix rates to meet golden requirements ──
function fixRates(rates, best) {
  const r = [...rates];

  if (r[best] < 78) r[best] = 78;
  if (r[best] > 90) r[best] = 90;

  const wrongIdx = [0, 1, 2, 3].filter(i => i !== best);
  wrongIdx.sort((a, b) => r[b] - r[a]);
  const temptingIdx = wrongIdx[0];
  const badIdx = wrongIdx.slice(1);

  if (r[temptingIdx] < 42) r[temptingIdx] = 42;
  if (r[temptingIdx] > 65) r[temptingIdx] = 65;

  for (const i of badIdx) {
    if (r[i] < 12) r[i] = 12;
    if (r[i] > 35) r[i] = 35;
  }

  let sum = r.reduce((a, b) => a + b, 0);
  if (sum < 170) {
    const bump = Math.min(170 - sum, 65 - r[temptingIdx]);
    r[temptingIdx] += bump;
    sum = r.reduce((a, b) => a + b, 0);
    if (sum < 170) {
      for (const i of badIdx) {
        const add = Math.min(170 - sum, 35 - r[i]);
        r[i] += add;
        sum = r.reduce((a, b) => a + b, 0);
        if (sum >= 170) break;
      }
    }
  } else if (sum > 190) {
    for (const i of badIdx) {
      const cut = Math.min(sum - 190, r[i] - 12);
      r[i] -= cut;
      sum = r.reduce((a, b) => a + b, 0);
      if (sum <= 190) break;
    }
    if (sum > 190) {
      const cut = Math.min(sum - 190, r[temptingIdx] - 42);
      r[temptingIdx] -= cut;
    }
  }

  return r;
}

// ── Structural validation (pre-filter, fast) ──
function validateStructure(sc) {
  const issues = [];
  if (!sc.title) issues.push("missing title");
  if (!sc.description || sc.description.length < 30) issues.push("description too short");
  if (!sc.concept) issues.push("missing concept");
  if (!sc.options || sc.options.length !== 4) issues.push("need exactly 4 options");
  if (!sc.explanations || sc.explanations.length !== 4) issues.push("need exactly 4 explanations");
  if (!sc.rates || sc.rates.length !== 4) issues.push("need exactly 4 rates");
  if (typeof sc.best !== "number" || sc.best < 0 || sc.best > 3) issues.push("best must be 0-3");
  if (!sc.situation) issues.push("missing situation");
  if (sc.situation && !sc.situation.inning) issues.push("situation missing inning");

  if (sc.options) {
    for (let i = 0; i < sc.options.length; i++) {
      if (!sc.options[i] || sc.options[i].length < 8) issues.push(`option ${i} too short`);
    }
  }
  if (sc.explanations) {
    for (let i = 0; i < sc.explanations.length; i++) {
      if (!sc.explanations[i] || sc.explanations[i].length < 20) issues.push(`explanation ${i} too short`);
    }
  }

  if (sc.rates && sc.rates.length === 4) {
    const best = sc.rates[sc.best];
    if (best < 78 || best > 90) issues.push(`best rate ${best} not in 78-90`);
    const wrong = sc.rates.filter((_, i) => i !== sc.best);
    if (!wrong.some(r => r >= 42 && r <= 65)) issues.push("no tempting wrong 42-65");
    const sum = sc.rates.reduce((a, b) => a + b, 0);
    if (sum < 170 || sum > 190) issues.push(`rate sum ${sum} not in 170-190`);
  }

  return issues;
}

// ── Run with concurrency limit ──
async function runPool(tasks, golden, useFast, concurrency) {
  const results = [];
  const failures = [];
  let completed = 0;
  const total = tasks.length;
  const startTime = Date.now();

  async function worker() {
    while (tasks.length > 0) {
      const task = tasks.shift();
      task.useFast = useFast;

      for (let attempt = 0; attempt <= RETRY_MAX; attempt++) {
        try {
          if (attempt > 0) await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));

          const scenario = await generateOne(task, golden, useFast);
          const issues = validateStructure(scenario);

          if (issues.length === 0) {
            results.push(scenario);
            completed++;
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = (completed / (elapsed / 60)).toFixed(1);
            const jsonTag = scenario._jsonClean === false ? " [md-cleanup]" : "";
            process.stdout.write(
              `\r  [${completed}/${total}] ${scenario.cat}/${scenario.conceptTag} "${scenario.title}"${jsonTag} (${elapsed}s, ${rate}/min)\n`
            );
            break;
          } else if (attempt === RETRY_MAX) {
            failures.push({ task, error: `Validation: ${issues.join(", ")}`, scenario });
            completed++;
            process.stdout.write(`\r  [${completed}/${total}] STRUCT_FAIL ${task.position}: ${issues[0]}\n`);
          }
        } catch (e) {
          if (attempt === RETRY_MAX) {
            failures.push({ task, error: e.message });
            completed++;
            process.stdout.write(`\r  [${completed}/${total}] FAILED ${task.position}: ${e.message.slice(0, 60)}\n`);
          }
        }
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return { results, failures };
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const count = parseInt(args.find(a => /^\d+$/.test(a)) || "100", 10);
  const useFast = args.includes("--fast");
  const dryRun = args.includes("--dry");

  console.log("=".repeat(60));
  console.log("  BSM SYNTHETIC DATA GENERATOR v2");
  console.log(`  Count: ${count} scenarios`);
  console.log(`  Pipeline: ${useFast ? "standard (xAI Grok)" : "multi-agent (Claude Opus)"}`);
  console.log(`  Few-shot: ${FEW_SHOT_COUNT} golden examples per prompt`);
  console.log(`  Concurrency: ${CONCURRENCY}`);
  console.log(`  Worker: ${WORKER_URL}`);
  console.log("=".repeat(60));

  const golden = loadGoldenExamples();
  console.log(`\nLoaded ${golden.length} golden examples`);

  const plan = buildPlan(count);
  const posCounts = {};
  const diffCounts = {};
  for (const t of plan) {
    posCounts[t.position] = (posCounts[t.position] || 0) + 1;
    diffCounts[t.difficulty] = (diffCounts[t.difficulty] || 0) + 1;
  }
  console.log("\nGeneration plan:");
  console.log("  Positions:", Object.entries(posCounts).map(([k, v]) => `${k}:${v}`).join(" "));
  console.log("  Difficulties:", Object.entries(diffCounts).map(([k, v]) => `${k}:${v}`).join(" "));

  if (dryRun) {
    console.log("\n--dry run, stopping here.");
    plan.slice(0, 5).forEach((t, i) => console.log(`  ${i + 1}. ${t.position} / ${t.concept} / ${t.difficulty}`));
    return;
  }

  console.log(`\nGenerating ${count} scenarios...\n`);
  const { results, failures } = await runPool([...plan], golden, useFast, CONCURRENCY);

  const date = new Date().toISOString().slice(0, 10);
  const outPath = path.join(__dirname, "..", `synthetic_batch_${date}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  // JSON compliance stats
  const cleanCount = results.filter(r => r._jsonClean !== false).length;
  const dirtyCount = results.filter(r => r._jsonClean === false).length;

  console.log("\n" + "=".repeat(60));
  console.log("  GENERATION COMPLETE");
  console.log("=".repeat(60));
  console.log(`  Generated: ${results.length} / ${count}`);
  console.log(`  Failed:    ${failures.length}`);
  console.log(`  JSON clean: ${cleanCount}/${results.length} (${((cleanCount / Math.max(results.length, 1)) * 100).toFixed(0)}%)`);
  if (dirtyCount > 0) console.log(`  JSON dirty: ${dirtyCount} (had markdown/extra text, cleaned)`);
  console.log(`  Saved to:  ${outPath}`);

  if (failures.length > 0) {
    const failLog = path.join(__dirname, "..", `synthetic_failures_${date}.json`);
    fs.writeFileSync(failLog, JSON.stringify(failures, null, 2));
    console.log(`  Failures:  ${failLog}`);
  }

  const resultPos = {};
  for (const r of results) resultPos[r.cat] = (resultPos[r.cat] || 0) + 1;
  console.log("\n  Position breakdown:");
  for (const [k, v] of Object.entries(resultPos).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${k}: ${v}`);
  }
}

main().catch(e => {
  console.error("\nFATAL:", e.message);
  process.exit(1);
});
