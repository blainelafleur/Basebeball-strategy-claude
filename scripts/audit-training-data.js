#!/usr/bin/env node
/**
 * Phase 1 Data Audit: Grade all handcrafted scenarios for training quality.
 *
 * Layer 1: Client-side gradeScenario() checks (free, instant)
 * Layer 2: Claude Opus rubric grading (optional, costs API credits)
 *
 * Usage:
 *   node scripts/audit-training-data.js              # Layer 1 only
 *   node scripts/audit-training-data.js --deep 50    # Layer 1 + Layer 2 on 50 worst
 *
 * Output: phase1-finetune/audit-report.json
 */

const fs = require("fs");
const path = require("path");

const KNOWLEDGE_PATH = path.join(__dirname, "..", "worker", "data", "knowledge.json");
const OUTPUT_DIR = path.join(__dirname, "..", "phase1-finetune");
const WORKER_BASE = "https://bsm-ai-proxy.blafleur.workers.dev";

// ─── Client-side grading (same as test-multi-agent.js) ───────────────────────

function gradeScenario(scenario) {
  let score = 0;
  const issues = [];

  // Structure checks (40 points)
  if (scenario.options?.length === 4) score += 10; else issues.push("not 4 options");
  if (typeof scenario.best === "number" && scenario.best >= 0 && scenario.best <= 3) score += 5; else issues.push("invalid best index");
  if (scenario.explanations?.length === 4) score += 10; else issues.push("not 4 explanations");
  if (scenario.rates?.length === 4) score += 5; else issues.push("not 4 rates");
  if (scenario.title && scenario.description) score += 5; else issues.push("missing title/description");
  if (scenario.concept) score += 5; else issues.push("missing concept");

  // Rate distribution (20 points)
  if (scenario.rates?.length === 4) {
    const bestRate = scenario.rates[scenario.best];
    const maxRate = Math.max(...scenario.rates);
    if (bestRate === maxRate) score += 10; else issues.push(`best option (idx ${scenario.best}, rate ${bestRate}) doesn't have highest rate (max ${maxRate})`);
    const sum = scenario.rates.reduce((a, b) => a + b, 0);
    if (sum >= 165 && sum <= 195) score += 5; else issues.push(`rate sum ${sum} outside 165-195`);
    const tempting = scenario.rates.filter((r, i) => i !== scenario.best && r >= 40 && r <= 65);
    if (tempting.length >= 1) score += 5; else issues.push("no tempting wrong answer (40-65)");
  }

  // Perspective check (15 points)
  const desc = (scenario.description || "") + " " + (scenario.options || []).join(" ");
  const thirdPerson = /\b(the pitcher|the catcher|the batter|the baserunner|the manager|the fielder|the outfielder|the infielder|the shortstop)\s+(should|needs to|decides|must|has to)\b/i;
  if (!thirdPerson.test(desc)) score += 15; else issues.push("3rd person perspective detected");

  // Position boundary checks (15 points)
  const posViolations = [];
  if (scenario.description?.match(/pitcher.*(cutoff|relay|cut.?off)/i)) posViolations.push("pitcher as cutoff");
  if (scenario.description?.match(/catcher.*(leaves|left|abandon).*(home|plate)/i)) posViolations.push("catcher leaves home");
  if (posViolations.length === 0) score += 15; else issues.push(...posViolations);

  // Explanation quality (10 points)
  if (scenario.explanations?.length === 4) {
    const bestExpl = scenario.explanations[scenario.best] || "";
    if (bestExpl.length > 30 && !bestExpl.match(/^(wrong|bad|risky|don't|never)/i)) score += 10;
    else issues.push("best explanation doesn't argue positively");
  }

  return { score, issues };
}

// ─── Additional quality checks ───────────────────────────────────────────────

function deeperChecks(scenario) {
  const issues = [];

  // Check explanation lengths — too short means low educational value
  if (scenario.explanations) {
    for (let i = 0; i < scenario.explanations.length; i++) {
      const expl = scenario.explanations[i];
      if (expl.length < 20) issues.push(`explanation ${i} too short (${expl.length} chars)`);
    }
    // Best explanation should be substantial
    const bestExpl = scenario.explanations[scenario.best];
    if (bestExpl && bestExpl.length < 40) issues.push(`best explanation only ${bestExpl.length} chars`);
  }

  // Check description length
  if (scenario.description && scenario.description.length < 30) {
    issues.push(`description too short (${scenario.description.length} chars)`);
  }

  // Check for duplicate option text
  if (scenario.options) {
    const optSet = new Set(scenario.options.map(o => o.toLowerCase().trim()));
    if (optSet.size < scenario.options.length) issues.push("duplicate options detected");
  }

  // Check rate values are reasonable
  if (scenario.rates) {
    const bestRate = scenario.rates[scenario.best];
    if (bestRate < 70) issues.push(`best rate only ${bestRate}% (should be 70-90)`);
    if (bestRate > 95) issues.push(`best rate ${bestRate}% unrealistically high`);
    const worstRate = Math.min(...scenario.rates);
    if (worstRate < 5) issues.push(`worst rate ${worstRate}% unrealistically low`);
  }

  // Check concept tag exists
  if (!scenario.conceptTag) issues.push("missing conceptTag");

  // Check difficulty is valid
  if (![1, 2, 3].includes(scenario.diff)) issues.push(`invalid difficulty: ${scenario.diff}`);

  return issues;
}

// ─── Layer 2: Claude Opus rubric grading ─────────────────────────────────────

async function claudeGrade(scenario, position) {
  const prompt = `Rate this baseball strategy scenario on 5 dimensions (1-10 each). Be strict — only rate 8+ if genuinely excellent.

Position: ${position}
Difficulty: ${scenario.diff}
Title: ${scenario.title}
Description: ${scenario.description}
Options: ${JSON.stringify(scenario.options)}
Best answer index: ${scenario.best}
Explanations: ${JSON.stringify(scenario.explanations)}
Success rates: ${JSON.stringify(scenario.rates)}
Concept: ${scenario.concept}

Rate each dimension 1-10:
1. factualAccuracy — Are all baseball rules, positions, and strategies correct?
2. explanationStrength — Does the best explanation teach WHY clearly?
3. ageAppropriateness — Does language match diff level? (1=ages 6-8, 2=ages 9-12, 3=ages 13+)
4. educationalValue — Does it teach a specific, useful baseball concept?
5. varietyDistinctness — Is the situation realistic and engaging?

Also list any factual errors or issues you find.

Respond in JSON only:
{"factualAccuracy":N,"explanationStrength":N,"ageAppropriateness":N,"educationalValue":N,"varietyDistinctness":N,"issues":["issue1","issue2"],"overall":N}`;

  try {
    const res = await fetch(`${WORKER_BASE}/v1/multi-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        position,
        difficulty: scenario.diff || 1,
        playerContext: { accuracy: 0.7, level: 10 },
        principles: "audit mode",
        _auditMode: true,
        _auditPrompt: prompt
      }),
      signal: AbortSignal.timeout(60000)
    });
    // This won't work directly — we need a dedicated audit endpoint
    // For now, use the Anthropic API directly through the worker
    return null;
  } catch (e) {
    return null;
  }
}

// Simple Claude grading via a minimal worker endpoint
async function claudeGradeViaWorker(scenario, position) {
  const body = {
    model: "claude-opus-4-20250514",
    max_tokens: 500,
    messages: [{
      role: "user",
      content: `You are a baseball strategy expert and educational content reviewer. Rate this scenario strictly on 5 dimensions (1-10).

Position: ${position} | Difficulty: ${scenario.diff} | Title: ${scenario.title}
Description: ${scenario.description}
Options: ${scenario.options.map((o, i) => `${i}: ${o}`).join(" | ")}
Best: ${scenario.best} | Rates: ${scenario.rates.join(",")}
Best explanation: ${scenario.explanations[scenario.best]}
Concept: ${scenario.concept}

Respond ONLY with JSON: {"fa":N,"es":N,"aa":N,"ev":N,"vd":N,"issues":[]}`
    }]
  };

  try {
    const res = await fetch(`${WORKER_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const match = text.match(/\{[^}]+\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (e) {
    return null;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const deepCount = process.argv.includes("--deep")
    ? parseInt(process.argv[process.argv.indexOf("--deep") + 1]) || 50
    : 0;

  console.log("\n📋 BSM Phase 1: Training Data Audit\n");

  // Load knowledge
  if (!fs.existsSync(KNOWLEDGE_PATH)) {
    console.error("Run 'node scripts/extract-scenarios.js' first to generate knowledge.json");
    process.exit(1);
  }
  const knowledge = JSON.parse(fs.readFileSync(KNOWLEDGE_PATH, "utf-8"));
  const scenarios = knowledge.scenarios;
  console.log(`Loaded ${scenarios.length} handcrafted scenarios\n`);

  // ── Layer 1: Client-side grading ──
  console.log("═══ LAYER 1: Structural & Quality Checks ═══\n");

  const results = [];
  const issueCountMap = {};

  for (const sc of scenarios) {
    const grade = gradeScenario(sc);
    const deeper = deeperChecks(sc);
    const allIssues = [...grade.issues, ...deeper];

    for (const issue of allIssues) {
      issueCountMap[issue] = (issueCountMap[issue] || 0) + 1;
    }

    results.push({
      id: sc.id,
      position: sc.position,
      title: sc.title,
      diff: sc.diff,
      concept: sc.concept,
      conceptTag: sc.conceptTag,
      clientScore: grade.score,
      issues: allIssues,
      issueCount: allIssues.length
    });
  }

  // Sort by score ascending (worst first)
  results.sort((a, b) => a.clientScore - b.clientScore || b.issueCount - a.issueCount);

  // Tier classification
  const tiers = {
    gold: results.filter(r => r.clientScore >= 95 && r.issueCount === 0),
    silver: results.filter(r => r.clientScore >= 80 && r.clientScore < 95),
    bronze: results.filter(r => r.clientScore >= 60 && r.clientScore < 80),
    reject: results.filter(r => r.clientScore < 60)
  };

  console.log("Tier breakdown:");
  console.log(`  🥇 Gold   (95+, no issues): ${tiers.gold.length} scenarios`);
  console.log(`  🥈 Silver (80-94):          ${tiers.silver.length} scenarios`);
  console.log(`  🥉 Bronze (60-79):          ${tiers.bronze.length} scenarios`);
  console.log(`  ❌ Reject (<60):            ${tiers.reject.length} scenarios`);

  console.log(`\nTop issues found:`);
  const sortedIssues = Object.entries(issueCountMap).sort((a, b) => b[1] - a[1]);
  for (const [issue, count] of sortedIssues.slice(0, 15)) {
    console.log(`  ${count}x — ${issue}`);
  }

  // Show worst scenarios
  console.log(`\n── Worst 20 scenarios (lowest client score) ──\n`);
  for (const r of results.slice(0, 20)) {
    console.log(`  [${r.clientScore}/100] ${r.position}/${r.id} "${r.title}"`);
    if (r.issues.length > 0) console.log(`           Issues: ${r.issues.join(", ")}`);
  }

  // Per-position breakdown
  console.log(`\n── Per-Position Quality ──\n`);
  const byPos = {};
  for (const r of results) {
    if (!byPos[r.position]) byPos[r.position] = { count: 0, scoreSum: 0, issueSum: 0, goldCount: 0 };
    byPos[r.position].count++;
    byPos[r.position].scoreSum += r.clientScore;
    byPos[r.position].issueSum += r.issueCount;
    if (r.clientScore >= 95 && r.issueCount === 0) byPos[r.position].goldCount++;
  }

  console.log("| Position     | Count | Avg Score | Gold | Avg Issues |");
  console.log("|-------------|-------|-----------|------|------------|");
  for (const [pos, data] of Object.entries(byPos).sort((a, b) => a[1].scoreSum / a[1].count - b[1].scoreSum / b[1].count)) {
    const avg = (data.scoreSum / data.count).toFixed(1);
    const avgIssues = (data.issueSum / data.count).toFixed(1);
    console.log(`| ${pos.padEnd(12)} | ${String(data.count).padStart(5)} | ${avg.padStart(9)} | ${String(data.goldCount).padStart(4)} | ${avgIssues.padStart(10)} |`);
  }

  // ── Layer 2: Claude Opus deep grading (optional) ──
  let deepResults = [];
  if (deepCount > 0) {
    console.log(`\n═══ LAYER 2: Claude Opus Deep Grading (${deepCount} worst scenarios) ═══\n`);

    const toGrade = results.slice(0, deepCount);
    for (let i = 0; i < toGrade.length; i++) {
      const r = toGrade[i];
      const sc = scenarios.find(s => s.id === r.id);
      process.stdout.write(`[${i + 1}/${deepCount}] ${r.position}/${r.id} ... `);

      const grade = await claudeGradeViaWorker(sc, r.position);
      if (grade) {
        const avg = ((grade.fa + grade.es + grade.aa + grade.ev + grade.vd) / 5).toFixed(1);
        console.log(`${avg}/10 (fa=${grade.fa} es=${grade.es} aa=${grade.aa} ev=${grade.ev} vd=${grade.vd})${grade.issues?.length > 0 ? ` Issues: ${grade.issues.join(", ")}` : ""}`);
        deepResults.push({ ...r, claudeGrade: grade, claudeAvg: parseFloat(avg) });
      } else {
        console.log("SKIP (API error)");
        deepResults.push({ ...r, claudeGrade: null });
      }

      if (i < toGrade.length - 1) await new Promise(r => setTimeout(r, 2000));
    }
  }

  // ── Save report ──
  const report = {
    auditedAt: new Date().toISOString(),
    totalScenarios: scenarios.length,
    tiers: {
      gold: tiers.gold.length,
      silver: tiers.silver.length,
      bronze: tiers.bronze.length,
      reject: tiers.reject.length
    },
    topIssues: sortedIssues.slice(0, 20),
    allResults: results,
    deepResults: deepResults.length > 0 ? deepResults : undefined,
    recommendation: {
      includeInSFT: tiers.gold.length + tiers.silver.length,
      excludeFromSFT: tiers.bronze.length + tiers.reject.length,
      needsReview: tiers.bronze.length,
      message: `Use ${tiers.gold.length + tiers.silver.length} Gold+Silver scenarios for SFT training. Review ${tiers.bronze.length} Bronze scenarios manually. Exclude ${tiers.reject.length} Reject scenarios.`
    }
  };

  const outFile = path.join(OUTPUT_DIR, "audit-report.json");
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  console.log(`\n═══ RECOMMENDATION ═══\n`);
  console.log(report.recommendation.message);
  console.log(`\nFull report saved to: ${outFile}`);
}

main().catch(e => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
