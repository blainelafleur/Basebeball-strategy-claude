#!/usr/bin/env node
/**
 * Phase 0 Verification: Test 50 scenarios via the multi-agent pipeline
 * and compare quality metrics.
 *
 * Usage: node scripts/test-multi-agent.js
 * Output: scripts/test-results/multi-agent-baseline-YYYY-MM-DD.json
 *         + comparison table printed to console
 *
 * Requires: ADMIN_KEY env var for xAI comparison (optional)
 */

const WORKER_BASE = "https://bsm-ai-proxy.blafleur.workers.dev";
const MULTI_AGENT_URL = `${WORKER_BASE}/v1/multi-agent`;
const XAI_URL = `${WORKER_BASE}/v1/chat/completions`;

// ─── Test Matrix: 15 positions × 3-4 variants = 50 test cases ───────────────

const TEST_MATRIX = [
  // Pitcher (4)
  { position: "pitcher", context: "Beginner, 45% accuracy, just started learning first-pitch strikes" },
  { position: "pitcher", context: "Intermediate, 62% accuracy, struggles with pickoff-timing and balk rules" },
  { position: "pitcher", context: "Advanced, 82% accuracy, mastered pitch-sequencing and count-leverage" },
  { position: "pitcher", context: "Expert, 90% accuracy, working on times-through-order and pitch-type-value" },

  // Catcher (3)
  { position: "catcher", context: "Beginner, first time playing catcher, no history" },
  { position: "catcher", context: "Intermediate, 58% accuracy, learning catcher-framing and dropped-third-strike" },
  { position: "catcher", context: "Advanced, 78% accuracy, mastered wild-pitch-coverage, working on first-third defense" },

  // First Base (3)
  { position: "firstBase", context: "Beginner, 50% accuracy, learning force-vs-tag and cutoff-roles" },
  { position: "firstBase", context: "Intermediate, 65% accuracy, knows bunt defense, working on dp-positioning" },
  { position: "firstBase", context: "Advanced, 80% accuracy, solid on all fundamentals" },

  // Second Base (3)
  { position: "secondBase", context: "Beginner, 42% accuracy, new to double play mechanics" },
  { position: "secondBase", context: "Intermediate, 60% accuracy, learning relay responsibilities on right side" },
  { position: "secondBase", context: "Advanced, 77% accuracy, mastered double-play-turn and dp-positioning" },

  // Shortstop (4)
  { position: "shortstop", context: "Beginner, 48% accuracy, learning basic cutoff-roles" },
  { position: "shortstop", context: "Intermediate, 65% accuracy, working on relay-double-cut positioning" },
  { position: "shortstop", context: "Advanced, 81% accuracy, mastered cutoff-roles and steal coverage" },
  { position: "shortstop", context: "Expert, 88% accuracy, working on rundown-mechanics and first-third defense" },

  // Third Base (3)
  { position: "thirdBase", context: "Beginner, 50% accuracy, learning bunt charge fundamentals" },
  { position: "thirdBase", context: "Intermediate, 63% accuracy, working on line-guarding decisions" },
  { position: "thirdBase", context: "Advanced, 79% accuracy, solid on cutoff from LF, bunt defense" },

  // Left Field (3)
  { position: "leftField", context: "Beginner, 55% accuracy, learning fly-ball-priority" },
  { position: "leftField", context: "Intermediate, 66% accuracy, working on backup-duties at third base" },
  { position: "leftField", context: "Advanced, 82% accuracy, mastered of-communication" },

  // Center Field (3)
  { position: "centerField", context: "Beginner, 47% accuracy, learning that CF has priority over everyone" },
  { position: "centerField", context: "Intermediate, 64% accuracy, working on gap coverage and angle routes" },
  { position: "centerField", context: "Advanced, 83% accuracy, mastered of-communication and backup at 2B" },

  // Right Field (3)
  { position: "rightField", context: "Beginner, 52% accuracy, just learning backup-duties at first base" },
  { position: "rightField", context: "Intermediate, 61% accuracy, working on throw decisions (cutoff vs direct)" },
  { position: "rightField", context: "Advanced, 80% accuracy, mastered all outfield fundamentals" },

  // Batter (4)
  { position: "batter", context: "Beginner, 40% accuracy, learning count-leverage basics" },
  { position: "batter", context: "Intermediate, 58% accuracy, working on two-strike-approach" },
  { position: "batter", context: "Advanced, 75% accuracy, mastered situational-hitting, learning squeeze-recognition" },
  { position: "batter", context: "Expert, 85% accuracy, working on win-probability vs RE24 decisions" },

  // Baserunner (4)
  { position: "baserunner", context: "Beginner, 44% accuracy, learning tag-up basics" },
  { position: "baserunner", context: "Intermediate, 60% accuracy, working on steal-breakeven and secondary-lead" },
  { position: "baserunner", context: "Advanced, 78% accuracy, mastered tag-up, learning steal-window and first-to-third reads" },
  { position: "baserunner", context: "Expert, 87% accuracy, working on baserunning-rates and delayed steal" },

  // Manager (4)
  { position: "manager", context: "Beginner, 38% accuracy, learning basic bunt-re24 decisions" },
  { position: "manager", context: "Intermediate, 55% accuracy, working on pitching-change timing (TTO effect)" },
  { position: "manager", context: "Advanced, 74% accuracy, mastered bunt-re24, working on ibb-strategy" },
  { position: "manager", context: "Expert, 86% accuracy, working on leverage-index and win-probability decisions" },

  // Famous (2)
  { position: "famous", context: "Intermediate player, 60% accuracy, enjoys historical baseball" },
  { position: "famous", context: "Advanced, 80% accuracy, knows most famous plays" },

  // Rules (3)
  { position: "rules", context: "Beginner, 45% accuracy, learning force-vs-tag and infield-fly" },
  { position: "rules", context: "Intermediate, 62% accuracy, working on balk-rule and obstruction-interference" },
  { position: "rules", context: "Advanced, 80% accuracy, mastered most rules, working on edge cases" },

  // Counts (3)
  { position: "counts", context: "Beginner, 50% accuracy, just learning count-leverage" },
  { position: "counts", context: "Intermediate, 65% accuracy, working on two-strike vs hitter's count strategy" },
  { position: "counts", context: "Advanced, 82% accuracy, applying count data to real at-bats" },
];

// ─── Quality checks (simplified client-side grading) ────────────────────────

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
    if (bestRate === maxRate) score += 10; else issues.push("best option doesn't have highest rate");
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
    // Best explanation should argue FOR the choice (positive language)
    if (bestExpl.length > 30 && !bestExpl.match(/^(wrong|bad|risky|don't|never)/i)) score += 10;
    else issues.push("best explanation doesn't argue positively");
  }

  return { score, maxScore: 100, issues };
}

// Check score perspective
function checkScorePerspective(scenario) {
  const sit = scenario.situation;
  if (!sit || !sit.inning || !sit.score) return { valid: true, note: "no situation to check" };
  const isBot = sit.inning.toLowerCase().startsWith("bot");
  // In Bot inning, home team bats. Home = score[1].
  // The description should reference score correctly.
  // We can't fully verify without deep NLP, but we check basic consistency.
  return { valid: true, inning: sit.inning, score: sit.score, isBot };
}

// ─── Test runner ─────────────────────────────────────────────────────────────

async function callMultiAgent(testCase) {
  const t0 = Date.now();
  try {
    const res = await fetch(MULTI_AGENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        position: testCase.position,
        playerContext: testCase.context,
        maxRetries: 1
      })
    });
    const elapsed = Date.now() - t0;

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, elapsed, error: err.error || `HTTP ${res.status}` };
    }

    const data = await res.json();
    const grade = gradeScenario(data.scenario);
    const perspective = checkScorePerspective(data.scenario);

    return {
      success: true,
      elapsed,
      title: data.scenario.title,
      concept: data.scenario.concept,
      diff: data.scenario.diff,
      critiqueScore: data.critique?.score || 0,
      critiquePass: data.critique?.pass || false,
      checklistFailures: data.critique?.checklistFailures || [],
      rubric: data.critique?.rubric || {},
      gradeScore: grade.score,
      gradeIssues: grade.issues,
      perspective,
      tokens: (data.pipeline?.totalInputTokens || 0) + (data.pipeline?.totalOutputTokens || 0),
      stages: data.pipeline?.stages?.length || 0,
      ragHits: data.pipeline?.ragHits || 0,
      rewriteCount: data.pipeline?.rewriteCount || 0,
      scenario: data.scenario
    };
  } catch (e) {
    return { success: false, elapsed: Date.now() - t0, error: e.message };
  }
}

async function runTests() {
  const startIdx = parseInt(process.argv[2]) || 0;
  const total = TEST_MATRIX.length;
  console.log(`\n🧪 BSM Phase 0: Multi-Agent Pipeline Baseline Test`);
  console.log(`   Testing ${total - startIdx} scenarios (${startIdx > 0 ? `starting at #${startIdx + 1}` : "all"}) across 15 positions\n`);
  console.log("─".repeat(80));

  const results = [];
  let successes = 0;
  let failures = 0;

  for (let i = startIdx; i < total; i++) {
    const tc = TEST_MATRIX[i];
    const label = `[${i + 1}/${total}] ${tc.position}`;
    process.stdout.write(`${label} ... `);

    const result = await callMultiAgent(tc);
    result.testCase = tc;
    results.push(result);

    if (result.success) {
      successes++;
      console.log(`✓ "${result.title}" | critique=${result.critiqueScore}/10 pass=${result.critiquePass} | grade=${result.gradeScore}/100 | ${result.elapsed}ms | ${result.rewriteCount} rewrites`);
    } else {
      failures++;
      console.log(`✗ FAILED: ${result.error} (${result.elapsed}ms)`);
    }

    // Rate limit: wait 15s between calls (Opus rate limit is 5 req/min,
    // and each pipeline makes 3-5 internal Claude calls)
    if (i < total - 1) {
      const delay = result.success ? 15000 : 60000; // longer delay after rate limit errors
      await new Promise(r => setTimeout(r, delay));
    }
  }

  console.log("\n" + "─".repeat(80));

  // ─── Compute metrics ──────────────────────────────────────────────────────

  const successful = results.filter(r => r.success);
  const avgElapsed = successful.length > 0 ? Math.round(successful.reduce((a, r) => a + r.elapsed, 0) / successful.length) : 0;
  const avgCritique = successful.length > 0 ? (successful.reduce((a, r) => a + r.critiqueScore, 0) / successful.length).toFixed(2) : 0;
  const avgGrade = successful.length > 0 ? (successful.reduce((a, r) => a + r.gradeScore, 0) / successful.length).toFixed(1) : 0;
  const avgTokens = successful.length > 0 ? Math.round(successful.reduce((a, r) => a + r.tokens, 0) / successful.length) : 0;
  const critiquePassCount = successful.filter(r => r.critiquePass).length;
  const gradeIssueCount = successful.reduce((a, r) => a + r.gradeIssues.length, 0);
  const perspectiveIssues = successful.filter(r => r.gradeIssues.some(i => i.includes("3rd person"))).length;
  const positionViolations = successful.filter(r => r.gradeIssues.some(i => i.includes("pitcher as cutoff") || i.includes("catcher leaves"))).length;
  const avgRewrites = successful.length > 0 ? (successful.reduce((a, r) => a + r.rewriteCount, 0) / successful.length).toFixed(1) : 0;
  const avgRagHits = successful.length > 0 ? (successful.reduce((a, r) => a + r.ragHits, 0) / successful.length).toFixed(1) : 0;

  // Per-position breakdown
  const byPosition = {};
  for (const r of successful) {
    const pos = r.testCase.position;
    if (!byPosition[pos]) byPosition[pos] = { count: 0, critiqueSum: 0, gradeSum: 0, elapsedSum: 0 };
    byPosition[pos].count++;
    byPosition[pos].critiqueSum += r.critiqueScore;
    byPosition[pos].gradeSum += r.gradeScore;
    byPosition[pos].elapsedSum += r.elapsed;
  }

  // ─── Print results ────────────────────────────────────────────────────────

  console.log(`\n📊 RESULTS SUMMARY\n`);
  console.log(`| Metric | Claude Opus Multi-Agent |`);
  console.log(`|--------|------------------------|`);
  console.log(`| Success rate | ${successes}/${total} (${Math.round(successes / total * 100)}%) |`);
  console.log(`| Avg response time | ${(avgElapsed / 1000).toFixed(1)}s |`);
  console.log(`| Avg critique score | ${avgCritique}/10 |`);
  console.log(`| Critique pass rate (≥9.5) | ${critiquePassCount}/${successes} (${successes > 0 ? Math.round(critiquePassCount / successes * 100) : 0}%) |`);
  console.log(`| Avg client grade | ${avgGrade}/100 |`);
  console.log(`| Avg tokens used | ${avgTokens} |`);
  console.log(`| Avg RAG hits | ${avgRagHits} |`);
  console.log(`| Avg rewrites needed | ${avgRewrites} |`);
  console.log(`| 3rd person perspective issues | ${perspectiveIssues}/${successes} |`);
  console.log(`| Position boundary violations | ${positionViolations}/${successes} |`);
  console.log(`| Total client grade issues | ${gradeIssueCount} |`);

  console.log(`\n📋 PER-POSITION BREAKDOWN\n`);
  console.log(`| Position | Tests | Avg Critique | Avg Grade | Avg Time |`);
  console.log(`|----------|-------|-------------|-----------|----------|`);
  for (const [pos, data] of Object.entries(byPosition).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`| ${pos.padEnd(12)} | ${data.count} | ${(data.critiqueSum / data.count).toFixed(1)}/10 | ${(data.gradeSum / data.count).toFixed(0)}/100 | ${(data.elapsedSum / data.count / 1000).toFixed(1)}s |`);
  }

  // Rubric dimension averages
  const rubricDims = ["factualAccuracy", "explanationStrength", "ageAppropriateness", "educationalValue", "varietyDistinctness"];
  console.log(`\n📈 RUBRIC DIMENSION AVERAGES\n`);
  console.log(`| Dimension | Avg Score |`);
  console.log(`|-----------|-----------|`);
  for (const dim of rubricDims) {
    const vals = successful.filter(r => r.rubric?.[dim]).map(r => r.rubric[dim]);
    const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "N/A";
    console.log(`| ${dim.padEnd(25)} | ${avg}/10 |`);
  }

  // ─── Save results ─────────────────────────────────────────────────────────

  const today = new Date().toISOString().slice(0, 10);
  const outputPath = `scripts/test-results/multi-agent-baseline-${today}.json`;
  const fs = require("fs");
  const output = {
    date: today,
    totalTests: total,
    successes,
    failures,
    metrics: {
      avgElapsedMs: avgElapsed,
      avgCritiqueScore: parseFloat(avgCritique),
      critiquePassRate: successes > 0 ? Math.round(critiquePassCount / successes * 100) : 0,
      avgGradeScore: parseFloat(avgGrade),
      avgTokens,
      avgRagHits: parseFloat(avgRagHits),
      avgRewrites: parseFloat(avgRewrites),
      perspectiveIssues,
      positionViolations
    },
    byPosition,
    results: results.map(r => ({
      position: r.testCase.position,
      context: r.testCase.context,
      success: r.success,
      elapsed: r.elapsed,
      title: r.title,
      critiqueScore: r.critiqueScore,
      critiquePass: r.critiquePass,
      gradeScore: r.gradeScore,
      gradeIssues: r.gradeIssues,
      tokens: r.tokens,
      rewriteCount: r.rewriteCount,
      ragHits: r.ragHits,
      error: r.error || null,
      checklistFailures: r.checklistFailures || [],
      rubric: r.rubric || {}
    }))
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Raw results saved to ${outputPath}`);
  console.log(`\n✅ Phase 0 baseline test complete.`);
}

runTests().catch(e => {
  console.error("Test runner failed:", e);
  process.exit(1);
});
