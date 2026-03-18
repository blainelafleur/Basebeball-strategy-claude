#!/usr/bin/env node
/**
 * critic_audit.js — Self-Improving Scenario Quality Audit
 *
 * 4-stage pipeline that gets smarter as it runs:
 *
 *   Stage 1: CALIBRATE — 50 diverse scenarios scored with base CRITIC
 *   Stage 2: MINE      — Opus analyzes calibration patterns, generates new rules
 *   Stage 3: AUDIT     — All scenarios scored with ENHANCED CRITIC
 *   Stage 4: SYNTHESIZE — Produces QUALITY_FIREWALL code + fix recommendations
 *
 * Usage:
 *   ADMIN_KEY=your-key node scripts/critic_audit.js
 *   ADMIN_KEY=your-key node scripts/critic_audit.js --stage 3   # resume from stage 3
 *   ADMIN_KEY=your-key node scripts/critic_audit.js --stage 1 --sample=30  # smaller calibration
 *
 * Outputs (scripts/ directory):
 *   audit_calibration.json        — Stage 1 results (50 scenarios)
 *   audit_discovered_rules.json   — Stage 2 output (new validation rules)
 *   audit_enhanced_prompt.txt     — Stage 2 output (refined CRITIC prompt)
 *   audit_full_results.json       — Stage 3 results (all scenarios)
 *   audit_synthesis.json          — Stage 4 output (firewall upgrades + fixes)
 *   audit_firewall_rules.js       — Stage 4 output (code-ready QUALITY_FIREWALL additions)
 *
 * Cost estimate (Opus):
 *   Stage 1: 50 scenarios  × ~$0.05/ea  = ~$2.50
 *   Stage 2: 1 meta call                = ~$0.50
 *   Stage 3: 605 scenarios × ~$0.05/ea  = ~$30
 *   Stage 4: 1 synthesis call           = ~$1.00
 *   Total: ~$34
 */

const fs = require("fs");
const path = require("path");

// ─── Configuration ──────────────────────────────────────────────────────────

const ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) {
  console.error("ERROR: Set ADMIN_KEY environment variable");
  console.error("  Get it from: Cloudflare Dashboard → Workers → bsm-worker → Settings → Variables and Secrets");
  process.exit(1);
}

const WORKER_URL = process.env.WORKER_URL || "https://bsm-ai-proxy.blafleur.workers.dev";
const BATCH_SIZE = 3;           // conservative for Opus rate limits
const BATCH_DELAY_MS = 4000;    // 4s between batches (worker rate limits)
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 4000;
const CALIBRATION_SAMPLE = parseInt(process.argv.find(a => a.startsWith("--sample="))?.split("=")[1] || "50");
const START_STAGE = parseInt(process.argv.find(a => a.startsWith("--stage="))?.split("=")[1] || "1");

const ROOT = path.resolve(__dirname, "..");
const INDEX_JSX = path.join(ROOT, "index.jsx");
const SCRIPTS = __dirname;

// Output files
const CALIBRATION_FILE = path.join(SCRIPTS, "audit_calibration.json");
const DISCOVERED_RULES_FILE = path.join(SCRIPTS, "audit_discovered_rules.json");
const ENHANCED_PROMPT_FILE = path.join(SCRIPTS, "audit_enhanced_prompt.txt");
const FULL_RESULTS_FILE = path.join(SCRIPTS, "audit_full_results.json");
const SYNTHESIS_FILE = path.join(SCRIPTS, "audit_synthesis.json");
const FIREWALL_RULES_FILE = path.join(SCRIPTS, "audit_firewall_rules.js");

// ─── Base CRITIC Prompt (Stage 1) ───────────────────────────────────────────

const BASE_CRITIC_SYSTEM = `You are an expert baseball quality auditor for Baseball Strategy Master, an educational app teaching baseball strategy to kids ages 6-18.

You are evaluating HANDCRAFTED scenarios for quality. Be fair but strict — flag real issues, not nitpicks. Every issue you find helps improve the app for kids learning baseball.

EVALUATION CRITERIA (11 dimensions):

1. BASEBALL FACTUAL ACCURACY (weight: 3x)
   - Are all baseball facts, rules, statistics, and terminology correct?
   - Is the game situation physically possible? (valid outs 0-2, valid count 0-0 to 3-2, valid runners [1,2,3])
   - Is the score perspective correct? (Bot inning = HOME bats, Top inning = AWAY bats)
   - Would a real youth baseball coach agree with the correct answer?
   - Are cutoff/relay assignments correct? (3B cuts LF→home, 1B cuts CF/RF→home, SS relays left side, 2B relays right side)

2. BEST ANSWER IS GENUINELY BEST (weight: 3x)
   - Is the designated best answer truly the optimal strategic choice in this specific situation?
   - Could a reasonable baseball expert argue a different option is better?
   - Does the best answer match what MLB-level coaching would recommend?
   - Is the "best" option the best for ALL age groups, or only advanced players?

3. EXPLANATION QUALITY (weight: 2x)
   - Does each explanation specifically address THAT option (not a generic response)?
   - Do explanations teach the underlying PRINCIPLE, not just state "this is right/wrong"?
   - Do the 4 explanations cover 4 DIFFERENT teaching angles (not the same lesson repeated)?
   - Would a 10-year-old learn something meaningful from reading the best explanation?
   - Does the best explanation argue positively FOR the choice (not just against alternatives)?

4. OPTION DISTINCTNESS (weight: 1x)
   - Are all 4 options genuinely different strategic choices?
   - Is there at least one "tempting wrong answer" that a knowledgeable player might pick?
   - Are options phrased clearly enough that a kid understands what each one means?
   - Do options avoid "trick" wording designed to confuse rather than teach?

5. RATE DISTRIBUTION (weight: 1x)
   - Best option: 65-90 range
   - Tempting wrong: 40-65 range (at least one option)
   - Bad options: 10-35 range
   - Best option has the highest rate
   - No rate below 5 or above 95
   - Rates reflect realistic probability, not arbitrary numbers

6. POSITION/ROLE COMPLIANCE (weight: 1x)
   - Does the scenario match the position it's filed under?
   - Does the player's role match what that position actually does in real baseball?
   - Pitcher NEVER acts as cutoff man (pitcher backs up)
   - Catcher NEVER leaves home plate unguarded with runners in scoring position
   - Outfielders throw TO the relay man, never relay themselves
   - Manager scenarios involve DECISIONS, not physical plays
   - Baserunner scenarios involve RUNNING decisions, not fielding
   IMPORTANT: BSM uses 15 categories. In addition to the 12 standard baseball positions (pitcher, catcher, firstBase, secondBase, thirdBase, shortstop, leftField, centerField, rightField, batter, baserunner, manager), there are 3 knowledge categories:
   - 'famous': Historical plays that teach strategic principles through real baseball moments. Must teach strategy, not just trivia.
   - 'rules': Rule knowledge scenarios testing understanding of baseball rules with strategic implications.
   - 'counts': Count-specific strategy scenarios teaching pitch count leverage and decision-making.
   These are VALID categories. Do NOT penalize scenarios for being in these categories. Instead, verify the content matches the category purpose.

7. AGE APPROPRIATENESS (weight: 1x)
   - diff:1 (ages 6-8): Simple language, basic concepts, no advanced stats
   - diff:2 (ages 9-12): Moderate complexity, standard baseball terms
   - diff:3 (ages 13+): Advanced strategy, analytics references OK
   - Does vocabulary match difficulty level?

8. SCENARIO REALISM (weight: 1x)
   - Could this exact situation happen in a real baseball game?
   - Is the pressure/stakes described consistent with the inning/score?
   - Are the runner positions, outs, and count consistent with the description?

9. CONCEPT CLARITY (weight: 2x)
   - Does the scenario teach ONE clear concept (not 3 concepts muddled together)?
   - Is the conceptTag accurate for what the scenario actually teaches?
   - Would a player know what they learned after reading the feedback?

10. ENGAGEMENT & TEACHING VALUE (weight: 1x)
    - Is this scenario interesting/fun for a kid, or is it dry/boring?
    - Does it present a genuine decision (not an obvious answer)?
    - Does it teach something useful for actual baseball play?

11. CATEGORY-CONTENT ALIGNMENT (weight: 1x)
    - For standard positions: does the player's role match what that position does?
    - For 'famous': does it teach a strategic principle through history (not just trivia)?
    - For 'rules': does it test rule KNOWLEDGE (not physical ability)?
    - For 'counts': does it involve a specific pitch count situation?

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown:
{
  "score": 8.5,
  "passed": true,
  "issues": ["Issue 1", "Issue 2"],
  "strengths": ["Strength 1"],
  "dimensions": {
    "factualAccuracy": 9,
    "bestAnswerCorrect": 9,
    "explanationQuality": 7,
    "optionDistinctness": 8,
    "rateDistribution": 8,
    "roleCompliance": 10,
    "ageAppropriateness": 9,
    "scenarioRealism": 8,
    "conceptClarity": 9,
    "engagementValue": 8,
    "categoryAlignment": 9
  },
  "suggestedFix": "Optional: specific fix if score < 8"
}

SCORING:
- Score each dimension 1-10
- Overall = weighted average: factualAccuracy (3x), bestAnswerCorrect (3x), explanationQuality (2x), conceptClarity (2x), roleCompliance (1x), categoryAlignment (1x), all others (1x)
- passed = true if overall >= 7.5 AND no dimension below 5
- If score < 8, provide a suggestedFix with a specific actionable improvement

Be concise in issues — one sentence each, max 5 issues.
Include 1-2 strengths to acknowledge what the scenario does well.`;

// ─── Pattern Mining Prompt (Stage 2) ────────────────────────────────────────

const MINING_SYSTEM = `You are analyzing quality audit results from Baseball Strategy Master, an educational baseball app for kids ages 6-18.

You've been given the results of auditing a calibration sample of scenarios. Your job is to:

1. DISCOVER PATTERNS — What systematic quality issues appear across multiple scenarios?
2. IDENTIFY BLIND SPOTS — What quality problems exist that the current evaluation criteria DON'T catch?
3. GENERATE NEW RULES — Create specific, testable validation rules that would catch issues the current criteria miss.
4. CREATE POSITION-SPECIFIC CRITERIA — What should be checked specifically for each position category?

Think like a baseball coaching expert AND a quality engineer. Look for:
- Factual errors that repeat across positions (e.g., wrong cutoff assignments)
- Explanation patterns that teach poorly (e.g., all 4 explanations saying the same thing differently)
- Situations that are physically impossible but passed the audit
- Teaching moments that are missed (explanation could teach more)
- Rate distributions that don't make strategic sense
- Position-specific actions that violate real baseball roles

OUTPUT FORMAT — respond with ONLY valid JSON:
{
  "systemicPatterns": [
    {"pattern": "Description of pattern", "frequency": "X of Y scenarios", "severity": "high|medium|low", "examples": ["id1", "id2"]}
  ],
  "blindSpots": [
    {"description": "What the current criteria miss", "proposedCheck": "How to catch this", "examples": ["id1"]}
  ],
  "newRules": [
    {"id": "rule_01", "name": "Rule Name", "description": "What to check", "appliesTo": ["all"|"pitcher"|"catcher"|etc], "checkType": "factual|structural|pedagogical|role", "severity": "reject|warn|suggest"}
  ],
  "positionSpecificCriteria": {
    "pitcher": ["Check 1", "Check 2"],
    "catcher": ["Check 1"],
    ...
  },
  "enhancedPromptAdditions": "Additional text to append to the CRITIC prompt for Stage 3, incorporating all discovered rules and checks. Make this comprehensive but concise.",
  "qualitySummary": {
    "overallHealth": "good|fair|poor",
    "strongestDimension": "dimension name",
    "weakestDimension": "dimension name",
    "estimatedIssueRate": "X% of scenarios likely have issues"
  }
}`;

// ─── Synthesis Prompt (Stage 4) ─────────────────────────────────────────────

const SYNTHESIS_SYSTEM = `You are synthesizing the complete quality audit of Baseball Strategy Master's 605 scenarios.

Your job is to produce THREE outputs:

1. QUALITY_FIREWALL IMPROVEMENTS — New validation rules that should be added to the app's client-side quality firewall (JavaScript). These should be specific, testable regex patterns or value checks.

2. FIX RECOMMENDATIONS — For each scenario that scored below 8.0, provide a specific fix. Group fixes by type (factual error, weak explanation, wrong best answer, rate issue, etc.)

3. VALIDATION FRAMEWORK UPGRADES — Improvements to the overall audit methodology for future use.

OUTPUT FORMAT — respond with ONLY valid JSON:
{
  "firewallRules": [
    {
      "name": "ruleName",
      "description": "What this rule checks",
      "appliesTo": ["all"|"pitcher"|etc],
      "implementation": "JavaScript code snippet for the check function",
      "tier": 1|2|3
    }
  ],
  "fixRecommendations": [
    {
      "scenarioId": "p1",
      "position": "pitcher",
      "currentScore": 6.5,
      "issueType": "factual|explanation|bestAnswer|rates|role|language",
      "specificFix": "Exact change to make",
      "priority": "critical|high|medium|low"
    }
  ],
  "frameworkUpgrades": [
    {
      "area": "Area of improvement",
      "currentGap": "What's missing now",
      "proposedEnhancement": "How to improve",
      "implementation": "How to implement this"
    }
  ],
  "overallAssessment": {
    "totalScenarios": 605,
    "passRate": "XX%",
    "avgScore": "X.X",
    "criticalIssues": 0,
    "highIssues": 0,
    "mediumIssues": 0,
    "topStrengths": ["strength1", "strength2"],
    "topWeaknesses": ["weakness1", "weakness2"],
    "goldStandardReady": true|false,
    "recommendation": "Summary recommendation"
  }
}`;

// ─── Extract Scenarios from index.jsx ───────────────────────────────────────

function extractScenarios() {
  const source = fs.readFileSync(INDEX_JSX, "utf-8");
  const scenariosStart = source.indexOf("const SCENARIOS = {");
  if (scenariosStart === -1) throw new Error("Could not find SCENARIOS in index.jsx");

  let braceDepth = 0, inString = false, stringChar = null, scenariosEnd = -1;
  for (let i = source.indexOf("{", scenariosStart); i < source.length; i++) {
    const ch = source[i], prev = source[i - 1];
    if (inString) { if (ch === stringChar && prev !== "\\") inString = false; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { inString = true; stringChar = ch; continue; }
    if (ch === "{") braceDepth++;
    if (ch === "}") { braceDepth--; if (braceDepth === 0) { scenariosEnd = i + 1; break; } }
  }
  if (scenariosEnd === -1) throw new Error("Could not find end of SCENARIOS object");

  const scenariosCode = source.slice(source.indexOf("{", scenariosStart), scenariosEnd);
  let scenarios;
  try { scenarios = new Function(`return (${scenariosCode})`)(); }
  catch (e) { throw new Error(`Failed to parse SCENARIOS: ${e.message}`); }

  const result = [];
  for (const [position, arr] of Object.entries(scenarios)) {
    if (!Array.isArray(arr)) continue;
    for (const s of arr) {
      result.push({
        id: s.id, position, title: s.title || "", diff: s.diff,
        cat: s.cat || null, conceptTag: s.conceptTag || null,
        ageMin: s.ageMin || null, ageMax: s.ageMax || null,
        description: s.description, situation: s.situation || null,
        options: s.options, best: s.best, explanations: s.explanations,
        rates: s.rates, concept: s.concept, anim: s.anim || null,
      });
    }
  }
  return result;
}

// ─── Select Diverse Calibration Sample ──────────────────────────────────────

function selectCalibrationSample(scenarios, sampleSize) {
  // Stratified sample: proportional by position, all difficulties, mix of old/new IDs
  const byPosition = {};
  for (const s of scenarios) {
    (byPosition[s.position] = byPosition[s.position] || []).push(s);
  }

  const selected = [];
  const positions = Object.keys(byPosition);
  const perPosition = Math.max(2, Math.floor(sampleSize / positions.length));

  for (const pos of positions) {
    const arr = byPosition[pos];
    // Sort by difficulty, then pick evenly across difficulties
    const byDiff = { 1: [], 2: [], 3: [] };
    for (const s of arr) (byDiff[s.diff] = byDiff[s.diff] || []).push(s);

    let picked = 0;
    for (const diff of [1, 2, 3]) {
      if (picked >= perPosition) break;
      const pool = byDiff[diff] || [];
      const take = Math.min(Math.ceil(perPosition / 3), pool.length);
      // Pick evenly spaced from pool
      for (let i = 0; i < take && picked < perPosition; i++) {
        const idx = Math.floor((i / take) * pool.length);
        selected.push(pool[idx]);
        picked++;
      }
    }
  }

  // If we need more, fill randomly
  while (selected.length < sampleSize && selected.length < scenarios.length) {
    const remaining = scenarios.filter(s => !selected.includes(s));
    if (remaining.length === 0) break;
    selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }

  return selected.slice(0, sampleSize);
}

// ─── Worker API Call (routes through Cloudflare Worker → Anthropic) ──────

async function callWorker(endpoint, payload, retryCount = 0) {
  const response = await fetch(`${WORKER_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": ADMIN_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 429 || response.status === 529 || response.status >= 500) {
    if (retryCount >= MAX_RETRIES) throw new Error(`Worker error ${response.status} after ${MAX_RETRIES} retries`);
    const delay = response.headers.get("retry-after")
      ? parseInt(response.headers.get("retry-after"), 10) * 1000
      : BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
    console.log(`  Worker ${response.status}, retrying in ${(delay/1000).toFixed(0)}s (attempt ${retryCount+1}/${MAX_RETRIES})`);
    await sleep(delay);
    return callWorker(endpoint, payload, retryCount + 1);
  }

  if (response.status === 401) throw new Error("Unauthorized — check your ADMIN_KEY");

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Worker error ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(`Worker returned error: ${data.error}`);

  return { result: data.result, usage: data.usage || { input_tokens: 0, output_tokens: 0 } };
}

// Convenience: audit a single scenario
async function auditScenario(scenario, systemPrompt, maxTokens = 1024) {
  return callWorker("/admin/audit-scenario", { scenario, systemPrompt, maxTokens });
}

// Convenience: meta-analysis call (pattern mining, synthesis)
async function analyzeData(systemPrompt, data, maxTokens = 4096) {
  return callWorker("/admin/audit-analyze", { systemPrompt, data, maxTokens });
}

// ─── Batch Processor ────────────────────────────────────────────────────────

async function processBatch(scenarios, systemPrompt, label) {
  const results = [];
  let totalIn = 0, totalOut = 0, passed = 0, failed = 0, errors = 0;
  const startTime = Date.now();

  console.log(`\n  Processing ${scenarios.length} scenarios in batches of ${BATCH_SIZE}...\n`);

  for (let i = 0; i < scenarios.length; i += BATCH_SIZE) {
    const batch = scenarios.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (scenario) => {
        try {
          const startMs = Date.now();
          const { result, usage } = await auditScenario(scenario, systemPrompt, 1024);
          const elapsedMs = Date.now() - startMs;
          const tokenCost = ((usage.input_tokens || 0) / 1e6 * 15 + (usage.output_tokens || 0) / 1e6 * 75).toFixed(4);
          return {
            id: scenario.id, position: scenario.position, title: scenario.title,
            diff: scenario.diff, conceptTag: scenario.conceptTag,
            ageMin: scenario.ageMin, cat: scenario.cat,
            concept: scenario.concept,
            rateSum: (scenario.rates || []).reduce((a, b) => a + b, 0),
            score: result.score, passed: result.passed,
            issues: result.issues || [], strengths: result.strengths || [],
            dimensions: result.dimensions || {},
            suggestedFix: result.suggestedFix || null,
            usage, elapsedMs, tokenCost,
          };
        } catch (err) {
          return {
            id: scenario.id, position: scenario.position, title: scenario.title,
            diff: scenario.diff, conceptTag: scenario.conceptTag,
            ageMin: scenario.ageMin, cat: scenario.cat,
            concept: scenario.concept,
            rateSum: (scenario.rates || []).reduce((a, b) => a + b, 0),
            score: null, passed: null,
            issues: [`ERROR: ${err.message}`], strengths: [], dimensions: {},
            usage: { input_tokens: 0, output_tokens: 0 }, elapsedMs: 0, tokenCost: "0.0000",
            error: true,
          };
        }
      })
    );

    for (const settled of batchResults) {
      const r = settled.status === "fulfilled" ? settled.value : {
        id: "unknown", position: "unknown", title: "unknown", score: null, passed: null,
        issues: [`PROMISE_ERROR: ${settled.reason}`], strengths: [], dimensions: {},
        usage: { input_tokens: 0, output_tokens: 0 }, error: true,
      };
      results.push(r);
      totalIn += r.usage.input_tokens;
      totalOut += r.usage.output_tokens;
      if (r.error) errors++;
      else if (r.passed) passed++;
      else failed++;
    }

    const processed = Math.min(i + BATCH_SIZE, scenarios.length);
    const elapsed = Date.now() - startTime;
    const rate = processed / (elapsed / 1000);
    const eta = (scenarios.length - processed) / Math.max(rate, 0.01);
    console.log(
      `  [${label}] ${processed}/${scenarios.length} | ` +
      `pass=${passed} fail=${failed} err=${errors} | ` +
      `${formatDuration(elapsed)} elapsed, ~${formatDuration(eta * 1000)} left | ` +
      `$${((totalIn / 1e6 * 15) + (totalOut / 1e6 * 75)).toFixed(2)} spent`
    );

    if (i + BATCH_SIZE < scenarios.length) await sleep(BATCH_DELAY_MS);
  }

  return { results, totalIn, totalOut, passed, failed, errors, elapsed: Date.now() - startTime };
}

// ─── Compute Summary Stats ──────────────────────────────────────────────────

function computeStats(results) {
  const scored = results.filter(r => r.score !== null);
  const scores = scored.map(r => r.score);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const byPosition = {};
  for (const r of scored) {
    if (!byPosition[r.position]) byPosition[r.position] = { scores: [], passed: 0, failed: 0 };
    byPosition[r.position].scores.push(r.score);
    if (r.passed) byPosition[r.position].passed++; else byPosition[r.position].failed++;
  }

  const dimTotals = {}, dimCounts = {};
  for (const r of scored) {
    for (const [dim, val] of Object.entries(r.dimensions || {})) {
      dimTotals[dim] = (dimTotals[dim] || 0) + val;
      dimCounts[dim] = (dimCounts[dim] || 0) + 1;
    }
  }

  const issueCounts = {};
  for (const r of results) {
    for (const issue of (r.issues || []).filter(i => !i.startsWith("ERROR:") && !i.startsWith("PROMISE_ERROR:"))) {
      const norm = issue.toLowerCase().replace(/option \d/g, "option N").replace(/\bid\b.*$/g, "").trim();
      issueCounts[norm] = (issueCounts[norm] || 0) + 1;
    }
  }

  return {
    total: results.length,
    scored: scored.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => r.passed === false).length,
    errors: results.filter(r => r.error).length,
    avgScore: avg,
    minScore: scores.length ? Math.min(...scores) : 0,
    maxScore: scores.length ? Math.max(...scores) : 0,
    byPosition: Object.fromEntries(
      Object.entries(byPosition).sort(([,a],[,b]) => {
        const aAvg = a.scores.reduce((x,y) => x+y, 0) / a.scores.length;
        const bAvg = b.scores.reduce((x,y) => x+y, 0) / b.scores.length;
        return aAvg - bAvg;
      }).map(([pos, d]) => [pos, {
        count: d.scores.length,
        avg: (d.scores.reduce((a,b)=>a+b,0)/d.scores.length).toFixed(2),
        passed: d.passed, failed: d.failed
      }])
    ),
    dimAverages: Object.fromEntries(
      Object.entries(dimTotals).map(([d, t]) => [d, (t / dimCounts[d]).toFixed(2)])
    ),
    topIssues: Object.entries(issueCounts).sort((a,b) => b[1]-a[1]).slice(0, 20).map(([issue, count]) => ({ issue, count })),
    worstScenarios: scored.filter(r => !r.passed).sort((a,b) => (a.score||0) - (b.score||0)).slice(0, 30),
  };
}

// ─── Print Summary ──────────────────────────────────────────────────────────

function printSummary(stats, label, tokenIn, tokenOut, elapsed) {
  const inputCost = (tokenIn / 1e6) * 15;
  const outputCost = (tokenOut / 1e6) * 75;

  console.log("\n" + "=".repeat(70));
  console.log(`${label} SUMMARY`);
  console.log("=".repeat(70));
  console.log(`Scenarios:   ${stats.total} | Passed: ${stats.passed} (${(stats.passed/stats.scored*100).toFixed(1)}%) | Failed: ${stats.failed} | Errors: ${stats.errors}`);
  console.log(`Avg Score:   ${stats.avgScore.toFixed(2)} / 10 | Range: ${stats.minScore} - ${stats.maxScore}`);
  console.log(`Time:        ${formatDuration(elapsed)} | Cost: $${(inputCost+outputCost).toFixed(2)} (${tokenIn.toLocaleString()} in / ${tokenOut.toLocaleString()} out)`);

  console.log("\nBY POSITION:");
  console.log("  " + "Position".padEnd(16) + "Count".padStart(6) + "Avg".padStart(7) + "Pass".padStart(6) + "Fail".padStart(6));
  console.log("  " + "-".repeat(41));
  for (const [pos, d] of Object.entries(stats.byPosition)) {
    console.log(`  ${pos.padEnd(16)}${String(d.count).padStart(6)}${d.avg.padStart(7)}${String(d.passed).padStart(6)}${String(d.failed).padStart(6)}`);
  }

  console.log("\nDIMENSIONS:");
  for (const [dim, avg] of Object.entries(stats.dimAverages)) console.log(`  ${dim.padEnd(25)} ${avg}`);

  if (stats.topIssues.length) {
    console.log("\nTOP ISSUES:");
    for (const { issue, count } of stats.topIssues.slice(0, 10)) console.log(`  [${count}x] ${issue.slice(0, 75)}`);
  }

  if (stats.worstScenarios.length) {
    console.log("\nWORST SCENARIOS:");
    for (const s of stats.worstScenarios.slice(0, 10)) {
      console.log(`  ${s.id.padEnd(10)} ${s.position.padEnd(14)} score=${s.score}  ${s.title}`);
      for (const i of (s.issues||[]).slice(0, 2)) console.log(`    -> ${i.slice(0, 70)}`);
    }
  }
  console.log("=".repeat(70));
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function formatDuration(ms) {
  const s = Math.floor(ms/1000), m = Math.floor(s/60);
  return m > 0 ? `${m}m ${s%60}s` : `${s}s`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  BSM Self-Improving Quality Audit — Gold Standard Pipeline     ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const scenarios = extractScenarios();
  console.log(`Loaded ${scenarios.length} scenarios from ${new Set(scenarios.map(s=>s.position)).size} positions`);
  console.log(`Starting from Stage ${START_STAGE}\n`);

  let totalCost = 0;

  // ━━━ STAGE 1: CALIBRATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let calibrationResults;

  if (START_STAGE <= 1) {
    console.log("━".repeat(70));
    console.log("STAGE 1: CALIBRATION — Scoring diverse sample with base CRITIC");
    console.log("━".repeat(70));

    const sample = selectCalibrationSample(scenarios, CALIBRATION_SAMPLE);
    console.log(`Selected ${sample.length} scenarios (stratified by position + difficulty)`);

    const { results, totalIn, totalOut, elapsed } = await processBatch(sample, BASE_CRITIC_SYSTEM, "CALIBRATE");
    calibrationResults = results;
    const stats = computeStats(results);

    const output = { meta: { timestamp: new Date().toISOString(), model: "claude-opus-4-via-worker", sampleSize: sample.length, stage: 1 }, stats, results };
    fs.writeFileSync(CALIBRATION_FILE, JSON.stringify(output, null, 2));
    console.log(`\nSaved calibration results to ${CALIBRATION_FILE}`);

    printSummary(stats, "STAGE 1 CALIBRATION", totalIn, totalOut, elapsed);
    totalCost += (totalIn / 1e6 * 15) + (totalOut / 1e6 * 75);
  } else {
    console.log("Loading Stage 1 results from disk...");
    const loaded = JSON.parse(fs.readFileSync(CALIBRATION_FILE, "utf-8"));
    calibrationResults = loaded.results;
    console.log(`Loaded ${calibrationResults.length} calibration results`);
  }

  // ━━━ STAGE 2: PATTERN MINING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let discoveredRules, enhancedPromptAdditions;

  if (START_STAGE <= 2) {
    console.log("\n" + "━".repeat(70));
    console.log("STAGE 2: PATTERN MINING — Opus analyzes calibration to discover new rules");
    console.log("━".repeat(70));

    const miningInput = {
      calibrationSummary: computeStats(calibrationResults),
      sampleResults: calibrationResults.map(r => ({
        id: r.id, position: r.position, title: r.title, diff: r.diff,
        score: r.score, passed: r.passed,
        issues: r.issues, strengths: r.strengths,
        dimensions: r.dimensions, suggestedFix: r.suggestedFix,
      })),
      currentEvaluationCriteria: "11 dimensions: factualAccuracy, bestAnswerCorrect, explanationQuality, optionDistinctness, rateDistribution, roleCompliance, ageAppropriateness, scenarioRealism, conceptClarity, engagementValue, categoryAlignment",
    };

    console.log("  Sending calibration data to Opus for pattern analysis...");
    const { result, usage } = await analyzeData(MINING_SYSTEM, miningInput, 4096);
    discoveredRules = result;
    enhancedPromptAdditions = result.enhancedPromptAdditions || "";

    fs.writeFileSync(DISCOVERED_RULES_FILE, JSON.stringify(result, null, 2));
    console.log(`  Saved discovered rules to ${DISCOVERED_RULES_FILE}`);

    // Build enhanced prompt
    const enhancedPrompt = BASE_CRITIC_SYSTEM + "\n\n" +
      "═══ ADDITIONAL RULES DISCOVERED FROM CALIBRATION ═══\n\n" +
      enhancedPromptAdditions + "\n\n" +
      (result.newRules || []).map(r =>
        `RULE ${r.id}: ${r.name} [${r.severity}] — ${r.description} (applies to: ${r.appliesTo?.join(", ") || "all"})`
      ).join("\n") + "\n\n" +
      "POSITION-SPECIFIC CHECKS:\n" +
      Object.entries(result.positionSpecificCriteria || {}).map(([pos, checks]) =>
        `  ${pos}: ${checks.join("; ")}`
      ).join("\n");

    fs.writeFileSync(ENHANCED_PROMPT_FILE, enhancedPrompt);
    console.log(`  Saved enhanced CRITIC prompt to ${ENHANCED_PROMPT_FILE}`);

    const cost = (usage.input_tokens / 1e6 * 15) + (usage.output_tokens / 1e6 * 75);
    totalCost += cost;

    console.log(`\n  Discovered ${(result.newRules||[]).length} new rules, ${(result.blindSpots||[]).length} blind spots`);
    console.log(`  ${(result.systemicPatterns||[]).length} systemic patterns identified`);
    console.log(`  Quality health: ${result.qualitySummary?.overallHealth || "unknown"}`);
    console.log(`  Stage 2 cost: $${cost.toFixed(2)}`);
  } else {
    console.log("\nLoading Stage 2 results from disk...");
    discoveredRules = JSON.parse(fs.readFileSync(DISCOVERED_RULES_FILE, "utf-8"));
    enhancedPromptAdditions = discoveredRules.enhancedPromptAdditions || "";
    console.log(`Loaded ${(discoveredRules.newRules||[]).length} discovered rules`);
  }

  // ━━━ STAGE 3: FULL AUDIT WITH ENHANCED CRITIC ━━━━━━━━━━━━━━━━━━━━━━━━━
  let fullResults;

  if (START_STAGE <= 3) {
    console.log("\n" + "━".repeat(70));
    console.log("STAGE 3: FULL AUDIT — All scenarios with ENHANCED CRITIC");
    console.log("━".repeat(70));

    const enhancedPrompt = fs.readFileSync(ENHANCED_PROMPT_FILE, "utf-8");
    console.log(`Enhanced CRITIC prompt: ${enhancedPrompt.length} chars (base was ${BASE_CRITIC_SYSTEM.length} chars)`);
    console.log(`Added ${enhancedPrompt.length - BASE_CRITIC_SYSTEM.length} chars of discovered rules\n`);

    const { results, totalIn, totalOut, elapsed } = await processBatch(scenarios, enhancedPrompt, "AUDIT");
    fullResults = results;
    const stats = computeStats(results);

    const output = {
      meta: {
        timestamp: new Date().toISOString(), model: "claude-opus-4-via-worker",
        totalScenarios: scenarios.length, stage: 3,
        enhancedPromptChars: enhancedPrompt.length,
        discoveredRulesApplied: (discoveredRules.newRules||[]).length,
        auditVersion: 4,
        scenarioCount: scenarios.length,
        promptFile: "audit_enhanced_prompt.txt",
      },
      stats, results
    };
    fs.writeFileSync(FULL_RESULTS_FILE, JSON.stringify(output, null, 2));
    console.log(`\nSaved full results to ${FULL_RESULTS_FILE}`);

    printSummary(stats, "STAGE 3 FULL AUDIT", totalIn, totalOut, elapsed);
    totalCost += (totalIn / 1e6 * 15) + (totalOut / 1e6 * 75);
  } else {
    console.log("\nLoading Stage 3 results from disk...");
    const loaded = JSON.parse(fs.readFileSync(FULL_RESULTS_FILE, "utf-8"));
    fullResults = loaded.results;
    console.log(`Loaded ${fullResults.length} full audit results`);
  }

  // ━━━ STAGE 4: SYNTHESIS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (START_STAGE <= 4) {
    console.log("\n" + "━".repeat(70));
    console.log("STAGE 4: SYNTHESIS — Generating QUALITY_FIREWALL upgrades + fix list");
    console.log("━".repeat(70));

    const stats = computeStats(fullResults);

    // Prepare synthesis input: stats + all failing scenarios + discovered rules
    const failingScenarios = fullResults
      .filter(r => r.score !== null && r.score < 8.0)
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .map(r => ({
        id: r.id, position: r.position, title: r.title, diff: r.diff,
        score: r.score, issues: r.issues, dimensions: r.dimensions,
        suggestedFix: r.suggestedFix
      }));

    const synthesisInput = {
      auditStats: {
        total: stats.total, passed: stats.passed, failed: stats.failed,
        avgScore: stats.avgScore.toFixed(2),
        byPosition: stats.byPosition, dimAverages: stats.dimAverages,
        topIssues: stats.topIssues.slice(0, 15),
      },
      failingScenarios: failingScenarios.slice(0, 50), // top 50 worst
      totalFailing: failingScenarios.length,
      discoveredRules: (discoveredRules.newRules || []).slice(0, 20),
      systemicPatterns: (discoveredRules.systemicPatterns || []).slice(0, 10),
    };

    console.log(`  ${failingScenarios.length} scenarios below 8.0 threshold`);
    console.log("  Sending to Opus for synthesis...\n");

    const { result, usage } = await analyzeData(SYNTHESIS_SYSTEM, synthesisInput, 8192);

    fs.writeFileSync(SYNTHESIS_FILE, JSON.stringify(result, null, 2));
    console.log(`  Saved synthesis to ${SYNTHESIS_FILE}`);

    // Generate code-ready firewall rules
    const firewallCode = [
      "// Auto-generated QUALITY_FIREWALL additions from audit",
      `// Generated: ${new Date().toISOString()}`,
      `// Based on audit of ${stats.total} scenarios (${stats.passed} passed, ${stats.failed} failed)`,
      "",
      "const AUDIT_DISCOVERED_RULES = [",
      ...(result.firewallRules || []).map(r =>
        `  {\n    name: "${r.name}",\n    description: "${r.description}",\n    tier: ${r.tier},\n    appliesTo: ${JSON.stringify(r.appliesTo)},\n    check: ${r.implementation || "null"}\n  },`
      ),
      "];",
      "",
      "module.exports = { AUDIT_DISCOVERED_RULES };",
    ].join("\n");

    fs.writeFileSync(FIREWALL_RULES_FILE, firewallCode);
    console.log(`  Saved firewall rules to ${FIREWALL_RULES_FILE}`);

    const cost = (usage.input_tokens / 1e6 * 15) + (usage.output_tokens / 1e6 * 75);
    totalCost += cost;

    // Print final assessment
    const assessment = result.overallAssessment || {};
    console.log("\n" + "═".repeat(70));
    console.log("FINAL ASSESSMENT");
    console.log("═".repeat(70));
    console.log(`Pass Rate:        ${assessment.passRate || "N/A"}`);
    console.log(`Average Score:    ${assessment.avgScore || "N/A"}`);
    console.log(`Critical Issues:  ${assessment.criticalIssues || 0}`);
    console.log(`High Issues:      ${assessment.highIssues || 0}`);
    console.log(`Gold Standard:    ${assessment.goldStandardReady ? "YES" : "NOT YET"}`);
    console.log(`\nStrengths: ${(assessment.topStrengths || []).join(", ")}`);
    console.log(`Weaknesses: ${(assessment.topWeaknesses || []).join(", ")}`);
    console.log(`\nRecommendation: ${assessment.recommendation || "N/A"}`);

    console.log(`\nFix recommendations: ${(result.fixRecommendations || []).length} scenarios need fixes`);
    console.log(`Framework upgrades:  ${(result.frameworkUpgrades || []).length} proposed improvements`);
    console.log(`Firewall rules:      ${(result.firewallRules || []).length} new rules generated`);
  }

  // ━━━ DONE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log("\n" + "═".repeat(70));
  console.log(`PIPELINE COMPLETE — Total cost: $${totalCost.toFixed(2)}`);
  console.log("═".repeat(70));
  console.log("\nOutput files:");
  console.log(`  ${CALIBRATION_FILE}`);
  console.log(`  ${DISCOVERED_RULES_FILE}`);
  console.log(`  ${ENHANCED_PROMPT_FILE}`);
  console.log(`  ${FULL_RESULTS_FILE}`);
  console.log(`  ${SYNTHESIS_FILE}`);
  console.log(`  ${FIREWALL_RULES_FILE}`);
}

main().catch(err => { console.error("Fatal error:", err); process.exit(1); });
