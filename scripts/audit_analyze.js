#!/usr/bin/env node
/**
 * audit_analyze.js — Comprehensive post-audit analysis
 *
 * Reads:
 *   scripts/audit3_full_results.json  (Audit 3, baseline)
 *   scripts/audit_full_results.json   (Audit 4, post-fix)
 *
 * Outputs:
 *   Console report (10 sections)
 *   scripts/audit4_analysis_report.json
 */

const fs = require('fs');
const path = require('path');

const SCRIPTS_DIR = __dirname;
const AUDIT3_PATH = path.join(SCRIPTS_DIR, 'audit3_full_results.json');
const AUDIT4_PATH = path.join(SCRIPTS_DIR, 'audit_full_results.json');
const REPORT_PATH = path.join(SCRIPTS_DIR, 'audit4_analysis_report.json');

const PASS_THRESHOLD = 7.5;

const BRAIN_CONCEPTS = [
  'force-vs-tag', 'fly-ball-priority', 'cutoff-roles', 'bunt-defense',
  'steal-breakeven', 'pickoff-mechanics', 'tag-up', 'backup-duties',
  'hit-and-run', 'double-play-turn', 'relay-double-cut', 'of-communication',
  'of-depth-arm-value', 'of-wall-play', 'count-leverage', 'pitch-sequencing',
  'two-strike-approach', 'situational-hitting', 'catcher-framing', 'secondary-lead',
  'eye-level-change', 'line-guarding', 'infield-positioning', 'rundown-mechanics',
  'wild-pitch-coverage', 'obstruction-interference', 'infield-fly', 'first-third',
  'scoring-probability', 'dp-positioning', 'squeeze-play', 'squeeze-recognition',
  'pitch-type-value', 'first-pitch-strike', 'pitch-count-mgmt', 'ibb-strategy',
  'platoon-advantage', 'mound-composure', 'win-probability', 'pitch-clock-strategy',
  'times-through-order', 'leverage-index', 'defensive-substitution', 'appeal-play',
  'popup-priority', 'player-management'
];

const DIMENSIONS = [
  'factualAccuracy', 'bestAnswerCorrect', 'explanationQuality',
  'optionDistinctness', 'rateDistribution', 'roleCompliance',
  'ageAppropriateness', 'scenarioRealism', 'conceptClarity',
  'engagementValue', 'categoryAlignment'
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.error(`[WARN] Could not load ${filepath}: ${e.message}`);
    return null;
  }
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function grade(avg) {
  if (avg >= 9.0) return 'A';
  if (avg >= 8.5) return 'B';
  if (avg >= 8.0) return 'C';
  if (avg >= 7.5) return 'D';
  return 'F';
}

function trend(delta) {
  if (delta > 0.2) return 'UP';
  if (delta < -0.2) return 'DOWN';
  return 'FLAT';
}

function trendArrow(delta) {
  if (delta > 0.2) return '^';
  if (delta < -0.2) return 'v';
  return '-';
}

function fmt(n, d = 2) {
  return Number(n).toFixed(d);
}

function pad(s, len, right) {
  s = String(s);
  while (s.length < len) s = right ? s + ' ' : ' ' + s;
  return s;
}

function padR(s, len) { return pad(s, len, true); }
function padL(s, len) { return pad(s, len, false); }

function buildMap(results) {
  const map = {};
  for (const r of results) map[r.id] = r;
  return map;
}

function priorityLevel(score, dims) {
  if (score < 5.0) return 'CRITICAL';
  if (dims && Object.values(dims).some(v => typeof v === 'number' && v < 3)) return 'CRITICAL';
  if (score < 6.5) return 'HIGH';
  if (score < 7.5) return 'MEDIUM';
  return 'LOW';
}

function normalizeIssue(issue) {
  return (issue || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 120);
}

function line(ch, len) { return ch.repeat(len); }

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const audit3 = loadJSON(AUDIT3_PATH);
  const audit4 = loadJSON(AUDIT4_PATH);

  if (!audit3 && !audit4) {
    console.error('ERROR: Neither audit file could be loaded. Aborting.');
    process.exit(1);
  }

  if (!audit4) {
    console.error('ERROR: Audit 4 results not found. Cannot generate analysis.');
    process.exit(1);
  }

  const a3Results = audit3?.results || [];
  const a4Results = audit4?.results || [];
  const a3Map = buildMap(a3Results);
  const a4Map = buildMap(a4Results);

  const hasAudit3 = a3Results.length > 0;

  const report = {};
  const output = [];

  function print(s = '') { output.push(s); }
  function header(title) {
    print('');
    print(line('=', 80));
    print(`  ${title}`);
    print(line('=', 80));
    print('');
  }

  print(line('*', 80));
  print('  BASEBALL STRATEGY MASTER — AUDIT ANALYSIS REPORT');
  print(`  Generated: ${new Date().toISOString()}`);
  print(`  Audit 3: ${hasAudit3 ? `${a3Results.length} scenarios` : 'NOT AVAILABLE'}`);
  print(`  Audit 4: ${a4Results.length} scenarios`);
  print(line('*', 80));

  // =========================================================================
  // Section 1: Before/After for Previously-Failing Scenarios
  // =========================================================================
  header('SECTION 1: BEFORE/AFTER — Previously-Failing Scenarios');

  const section1 = { fixed: [], stillFailing: [], worse: [], missing: [] };

  if (hasAudit3) {
    const a3Failing = a3Results.filter(r => !r.passed);
    print(`Audit 3 had ${a3Failing.length} failing scenarios (passed === false).`);
    print('');

    const tableRows = [];
    for (const a3r of a3Failing) {
      const a4r = a4Map[a3r.id];
      let status, delta;
      if (!a4r) {
        status = 'MISSING';
        delta = null;
        section1.missing.push({ id: a3r.id, position: a3r.position, audit3Score: a3r.score });
      } else {
        delta = a4r.score - a3r.score;
        if (a4r.passed) {
          status = 'FIXED';
          section1.fixed.push({ id: a3r.id, position: a3r.position, audit3Score: a3r.score, audit4Score: a4r.score, delta });
        } else if (delta < -0.1) {
          status = 'WORSE';
          section1.worse.push({ id: a3r.id, position: a3r.position, audit3Score: a3r.score, audit4Score: a4r.score, delta });
        } else {
          status = 'STILL_FAILING';
          section1.stillFailing.push({ id: a3r.id, position: a3r.position, audit3Score: a3r.score, audit4Score: a4r.score, delta });
        }
      }
      tableRows.push({ id: a3r.id, position: a3r.position, audit3Score: a3r.score, audit4Score: a4r?.score, delta, status });
    }

    // Print table
    print(`${padR('ID', 8)} | ${padR('Position', 12)} | ${padL('A3', 5)} | ${padL('A4', 5)} | ${padL('Delta', 7)} | Status`);
    print(`${line('-', 8)}-+-${line('-', 12)}-+-${line('-', 5)}-+-${line('-', 5)}-+-${line('-', 7)}-+${line('-', 16)}`);
    for (const row of tableRows) {
      const a4s = row.audit4Score != null ? fmt(row.audit4Score, 1) : '  N/A';
      const ds = row.delta != null ? (row.delta >= 0 ? '+' : '') + fmt(row.delta, 1) : '   N/A';
      print(`${padR(row.id, 8)} | ${padR(row.position, 12)} | ${padL(fmt(row.audit3Score, 1), 5)} | ${padL(a4s, 5)} | ${padL(ds, 7)} | ${row.status}`);
    }

    print('');
    print(`Summary: FIXED=${section1.fixed.length}  STILL_FAILING=${section1.stillFailing.length}  WORSE=${section1.worse.length}  MISSING=${section1.missing.length}`);
  } else {
    print('Audit 3 results not available — skipping before/after comparison.');
  }

  report.section1_beforeAfter = section1;

  // =========================================================================
  // Section 2: Regression Detection
  // =========================================================================
  header('SECTION 2: REGRESSION DETECTION');

  const section2 = { regressions: [], significantDrops: [] };

  if (hasAudit3) {
    const a3Passing = a3Results.filter(r => r.passed);

    for (const a3r of a3Passing) {
      const a4r = a4Map[a3r.id];
      if (!a4r) continue;

      const delta = a4r.score - a3r.score;

      // New failure
      if (!a4r.passed) {
        const dimDeltas = {};
        for (const dim of DIMENSIONS) {
          const v3 = a3r.dimensions?.[dim];
          const v4 = a4r.dimensions?.[dim];
          if (v3 != null && v4 != null) dimDeltas[dim] = v4 - v3;
        }
        section2.regressions.push({
          id: a3r.id, position: a3r.position, title: a3r.title,
          audit3Score: a3r.score, audit4Score: a4r.score, delta,
          dimDeltas, issues: a4r.issues || []
        });
      }
      // Significant drop but still passing
      else if (delta < -1.0) {
        const dimDeltas = {};
        for (const dim of DIMENSIONS) {
          const v3 = a3r.dimensions?.[dim];
          const v4 = a4r.dimensions?.[dim];
          if (v3 != null && v4 != null) dimDeltas[dim] = v4 - v3;
        }
        section2.significantDrops.push({
          id: a3r.id, position: a3r.position, title: a3r.title,
          audit3Score: a3r.score, audit4Score: a4r.score, delta, dimDeltas
        });
      }
    }

    if (section2.regressions.length === 0 && section2.significantDrops.length === 0) {
      print('No regressions detected. All previously-passing scenarios remain passing');
      print('with no significant score drops.');
    } else {
      if (section2.regressions.length > 0) {
        print(`NEW FAILURES (was pass, now fail): ${section2.regressions.length}`);
        print('');
        for (const r of section2.regressions) {
          print(`  ${r.id} [${r.position}] "${r.title}"`);
          print(`    Score: ${fmt(r.audit3Score, 1)} -> ${fmt(r.audit4Score, 1)} (${fmt(r.delta, 1)})`);
          const bigDrops = Object.entries(r.dimDeltas).filter(([, d]) => d < -1);
          if (bigDrops.length) {
            print(`    Dim drops: ${bigDrops.map(([k, d]) => `${k}: ${d > 0 ? '+' : ''}${d}`).join(', ')}`);
          }
          if (r.issues.length) print(`    Issues: ${r.issues[0].substring(0, 90)}...`);
          print('');
        }
      }

      if (section2.significantDrops.length > 0) {
        print(`SIGNIFICANT DROPS (delta < -1.0, still passing): ${section2.significantDrops.length}`);
        print('');
        for (const r of section2.significantDrops) {
          print(`  ${r.id} [${r.position}] "${r.title}"`);
          print(`    Score: ${fmt(r.audit3Score, 1)} -> ${fmt(r.audit4Score, 1)} (${fmt(r.delta, 1)})`);
          const bigDrops = Object.entries(r.dimDeltas).filter(([, d]) => d < -1);
          if (bigDrops.length) {
            print(`    Dim drops: ${bigDrops.map(([k, d]) => `${k}: ${d > 0 ? '+' : ''}${d}`).join(', ')}`);
          }
        }
      }
    }
  } else {
    print('Audit 3 results not available — skipping regression detection.');
  }

  report.section2_regressions = section2;

  // =========================================================================
  // Section 3: Concept Mastery Coverage
  // =========================================================================
  header('SECTION 3: CONCEPT MASTERY COVERAGE');

  const conceptCoverage = {};
  const foundTags = new Set();

  for (const r of a4Results) {
    const tag = r.conceptTag || r.concept || r.cat;
    if (!tag) continue;
    foundTags.add(tag);
    if (!conceptCoverage[tag]) conceptCoverage[tag] = { total: 0, passed: 0, failed: 0, scenarios: [] };
    conceptCoverage[tag].total++;
    if (r.passed) conceptCoverage[tag].passed++;
    else conceptCoverage[tag].failed++;
    conceptCoverage[tag].scenarios.push(r.id);
  }

  // Check BRAIN concepts
  const underCovered = [];
  const uncovered = [];
  const wellCovered = [];

  for (const concept of BRAIN_CONCEPTS) {
    const data = conceptCoverage[concept];
    if (!data) {
      uncovered.push(concept);
    } else if (data.passed < 3) {
      underCovered.push({ concept, total: data.total, passed: data.passed, failed: data.failed });
    } else {
      wellCovered.push({ concept, total: data.total, passed: data.passed });
    }
  }

  // Concepts in data but not in BRAIN list
  const extraConcepts = [...foundTags].filter(t => !BRAIN_CONCEPTS.includes(t)).sort();

  print(`Total unique concept tags in Audit 4: ${foundTags.size}`);
  print(`BRAIN concepts tracked: ${BRAIN_CONCEPTS.length}`);
  print(`Well-covered (>=3 passing): ${wellCovered.length}`);
  print(`Under-covered (<3 passing): ${underCovered.length}`);
  print(`Uncovered (0 scenarios):    ${uncovered.length}`);
  print(`Extra tags (not in BRAIN):  ${extraConcepts.length}`);
  print('');

  if (uncovered.length > 0) {
    print('UNCOVERED CONCEPTS (no scenarios found):');
    for (const c of uncovered) print(`  - ${c}`);
    print('');
  }

  if (underCovered.length > 0) {
    print('UNDER-COVERED CONCEPTS (<3 passing scenarios):');
    print(`${padR('Concept', 30)} | Total | Passed | Failed`);
    print(`${line('-', 30)}-+${line('-', 7)}-+${line('-', 8)}-+${line('-', 7)}`);
    for (const c of underCovered) {
      print(`${padR(c.concept, 30)} | ${padL(c.total, 5)} | ${padL(c.passed, 6)} | ${padL(c.failed, 6)}`);
    }
    print('');
  }

  if (extraConcepts.length > 0) {
    print('EXTRA CONCEPT TAGS (in data but not in BRAIN list):');
    for (const c of extraConcepts) {
      const d = conceptCoverage[c];
      print(`  ${padR(c, 30)} total=${d.total} passed=${d.passed}`);
    }
    print('');
  }

  // Coverage table for all well-covered
  print('WELL-COVERED CONCEPTS (>=3 passing):');
  print(`${padR('Concept', 30)} | Total | Passed | PassRate`);
  print(`${line('-', 30)}-+${line('-', 7)}-+${line('-', 8)}-+${line('-', 8)}`);
  for (const c of wellCovered.sort((a, b) => a.concept.localeCompare(b.concept))) {
    const rate = ((c.passed / c.total) * 100).toFixed(0);
    print(`${padR(c.concept, 30)} | ${padL(c.total, 5)} | ${padL(c.passed, 6)} | ${padL(rate + '%', 7)}`);
  }

  report.section3_conceptCoverage = {
    totalTags: foundTags.size,
    brainConceptsTracked: BRAIN_CONCEPTS.length,
    wellCovered: wellCovered.length,
    underCovered,
    uncovered,
    extraConcepts,
    coverage: conceptCoverage
  };

  // =========================================================================
  // Section 4: Per-Position Report Card
  // =========================================================================
  header('SECTION 4: PER-POSITION REPORT CARD');

  const posStats = {};
  for (const r of a4Results) {
    const pos = r.position;
    if (!posStats[pos]) posStats[pos] = { scores: [], passed: 0, failed: 0 };
    posStats[pos].scores.push(r.score);
    if (r.passed) posStats[pos].passed++;
    else posStats[pos].failed++;
  }

  const posReport = [];
  const a3ByPos = audit3?.stats?.byPosition || {};

  print(`${padR('Position', 14)} | Cnt | Passed | Failed | PassRate | Avg   | Median | Grade | A3 Avg | Delta`);
  print(`${line('-', 14)}-+${line('-', 5)}-+${line('-', 8)}-+${line('-', 8)}-+${line('-', 10)}-+${line('-', 7)}-+${line('-', 8)}-+${line('-', 7)}-+${line('-', 8)}-+${line('-', 7)}`);

  const positions = Object.keys(posStats).sort((a, b) => {
    const avgA = posStats[a].scores.reduce((s, v) => s + v, 0) / posStats[a].scores.length;
    const avgB = posStats[b].scores.reduce((s, v) => s + v, 0) / posStats[b].scores.length;
    return avgB - avgA;
  });

  for (const pos of positions) {
    const ps = posStats[pos];
    const count = ps.scores.length;
    const avg = ps.scores.reduce((s, v) => s + v, 0) / count;
    const med = median(ps.scores);
    const passRate = ((ps.passed / count) * 100).toFixed(1);
    const g = grade(avg);
    const a3Avg = a3ByPos[pos]?.avg ? parseFloat(a3ByPos[pos].avg) : null;
    const delta = a3Avg != null ? avg - a3Avg : null;

    posReport.push({ position: pos, count, passed: ps.passed, failed: ps.failed, passRate: parseFloat(passRate), avg, median: med, grade: g, audit3Avg: a3Avg, delta });

    const a3s = a3Avg != null ? fmt(a3Avg, 2) : '  N/A';
    const ds = delta != null ? (delta >= 0 ? '+' : '') + fmt(delta, 2) : '   N/A';

    print(`${padR(pos, 14)} | ${padL(count, 3)} | ${padL(ps.passed, 6)} | ${padL(ps.failed, 6)} | ${padL(passRate + '%', 8)} | ${padL(fmt(avg, 2), 5)} | ${padL(fmt(med, 1), 6)} | ${padL(g, 5)} | ${padL(a3s, 6)} | ${padL(ds, 6)}`);
  }

  report.section4_positionReportCard = posReport;

  // =========================================================================
  // Section 5: Per-Dimension Trends
  // =========================================================================
  header('SECTION 5: PER-DIMENSION TRENDS');

  const dimStats = {};
  for (const dim of DIMENSIONS) {
    const vals = a4Results.map(r => r.dimensions?.[dim]).filter(v => v != null && typeof v === 'number');
    const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
    const a3Avg = audit3?.stats?.dimAverages?.[dim] ? parseFloat(audit3.stats.dimAverages[dim]) : null;
    const delta = a3Avg != null ? avg - a3Avg : null;

    dimStats[dim] = { avg, audit3Avg: a3Avg, delta, trend: delta != null ? trend(delta) : 'N/A', count: vals.length };
  }

  print(`${padR('Dimension', 24)} | A4 Avg | A3 Avg | Delta  | Trend`);
  print(`${line('-', 24)}-+${line('-', 8)}-+${line('-', 8)}-+${line('-', 8)}-+${line('-', 6)}`);

  for (const dim of DIMENSIONS) {
    const d = dimStats[dim];
    const a3s = d.audit3Avg != null ? fmt(d.audit3Avg, 2) : '  N/A';
    const ds = d.delta != null ? (d.delta >= 0 ? '+' : '') + fmt(d.delta, 2) : '   N/A';
    const tr = d.delta != null ? trendArrow(d.delta) : ' ';
    print(`${padR(dim, 24)} | ${padL(fmt(d.avg, 2), 6)} | ${padL(a3s, 6)} | ${padL(ds, 6)} |   ${tr}`);
  }

  report.section5_dimensionTrends = dimStats;

  // =========================================================================
  // Section 6: Score Distribution
  // =========================================================================
  header('SECTION 6: SCORE DISTRIBUTION');

  const allScores = a4Results.map(r => r.score).filter(s => s != null && typeof s === 'number');

  // Histogram in 0.5-point buckets
  const buckets = {};
  for (let b = 0; b <= 10; b += 0.5) buckets[b.toFixed(1)] = 0;
  for (const s of allScores) {
    const b = (Math.floor(s * 2) / 2).toFixed(1);
    if (buckets[b] !== undefined) buckets[b]++;
    else buckets[b] = 1;
  }

  const maxCount = Math.max(...Object.values(buckets));
  const barScale = maxCount > 0 ? 40 / maxCount : 0;

  print('Score Histogram (0.5-point buckets):');
  print('');
  for (let b = 0; b <= 10; b += 0.5) {
    const key = b.toFixed(1);
    const count = buckets[key] || 0;
    const bar = '#'.repeat(Math.round(count * barScale));
    const marker = b === PASS_THRESHOLD ? ' <-- PASS' : '';
    if (count > 0 || (b >= 3 && b <= 10)) {
      print(`  ${padL(key, 4)}-${padL((b + 0.5).toFixed(1), 4)} | ${padL(count, 4)} ${bar}${marker}`);
    }
  }

  print('');

  // Percentiles
  const p10 = percentile(allScores, 10);
  const p25 = percentile(allScores, 25);
  const p50 = percentile(allScores, 50);
  const p75 = percentile(allScores, 75);
  const p90 = percentile(allScores, 90);
  const avg = allScores.reduce((s, v) => s + v, 0) / allScores.length;
  const min = Math.min(...allScores);
  const max = Math.max(...allScores);

  print('Percentiles:');
  print(`  Min:     ${fmt(min)}`);
  print(`  10th:    ${fmt(p10)}`);
  print(`  25th:    ${fmt(p25)}`);
  print(`  Median:  ${fmt(p50)}`);
  print(`  75th:    ${fmt(p75)}`);
  print(`  90th:    ${fmt(p90)}`);
  print(`  Max:     ${fmt(max)}`);
  print(`  Mean:    ${fmt(avg)}`);
  print(`  StdDev:  ${fmt(Math.sqrt(allScores.reduce((s, v) => s + (v - avg) ** 2, 0) / allScores.length))}`);

  report.section6_distribution = {
    histogram: buckets,
    percentiles: { p10, p25, p50, p75, p90 },
    mean: avg, min, max,
    stdDev: Math.sqrt(allScores.reduce((s, v) => s + (v - avg) ** 2, 0) / allScores.length),
    count: allScores.length
  };

  // =========================================================================
  // Section 7: Difficulty/Age Correlation
  // =========================================================================
  header('SECTION 7: DIFFICULTY & AGE CORRELATION');

  // By difficulty
  const byDiff = {};
  for (const r of a4Results) {
    const d = r.diff || 'unknown';
    if (!byDiff[d]) byDiff[d] = { scores: [], passed: 0, total: 0 };
    byDiff[d].scores.push(r.score);
    byDiff[d].total++;
    if (r.passed) byDiff[d].passed++;
  }

  print('By Difficulty Level:');
  print(`${padR('Diff', 10)} | Count | Passed | PassRate | AvgScore | Median`);
  print(`${line('-', 10)}-+${line('-', 7)}-+${line('-', 8)}-+${line('-', 10)}-+${line('-', 10)}-+${line('-', 8)}`);

  const diffLabels = { '1': 'Rookie', '2': 'Pro', '3': 'All-Star' };
  for (const d of Object.keys(byDiff).sort()) {
    const bd = byDiff[d];
    const davg = bd.scores.reduce((s, v) => s + v, 0) / bd.scores.length;
    const dmed = median(bd.scores);
    const dpr = ((bd.passed / bd.total) * 100).toFixed(1);
    const label = diffLabels[d] || `Level ${d}`;
    print(`${padR(`${d} (${label})`, 10)} | ${padL(bd.total, 5)} | ${padL(bd.passed, 6)} | ${padL(dpr + '%', 8)} | ${padL(fmt(davg, 2), 8)} | ${padL(fmt(dmed, 1), 6)}`);
  }

  // By ageMin
  const byAge = {};
  let hasAgeData = false;
  for (const r of a4Results) {
    const age = r.ageMin;
    if (age == null) continue;
    hasAgeData = true;
    const bucket = age <= 8 ? '6-8' : age <= 12 ? '9-12' : age <= 15 ? '13-15' : '16-18';
    if (!byAge[bucket]) byAge[bucket] = { scores: [], passed: 0, total: 0 };
    byAge[bucket].scores.push(r.score);
    byAge[bucket].total++;
    if (r.passed) byAge[bucket].passed++;
  }

  if (hasAgeData) {
    print('');
    print('By Age Range:');
    print(`${padR('Age Range', 10)} | Count | Passed | PassRate | AvgScore | Median`);
    print(`${line('-', 10)}-+${line('-', 7)}-+${line('-', 8)}-+${line('-', 10)}-+${line('-', 10)}-+${line('-', 8)}`);
    for (const bucket of ['6-8', '9-12', '13-15', '16-18']) {
      const ba = byAge[bucket];
      if (!ba) continue;
      const aavg = ba.scores.reduce((s, v) => s + v, 0) / ba.scores.length;
      const amed = median(ba.scores);
      const apr = ((ba.passed / ba.total) * 100).toFixed(1);
      print(`${padR(bucket, 10)} | ${padL(ba.total, 5)} | ${padL(ba.passed, 6)} | ${padL(apr + '%', 8)} | ${padL(fmt(aavg, 2), 8)} | ${padL(fmt(amed, 1), 6)}`);
    }
  } else {
    print('');
    print('No ageMin data available in Audit 4 results.');
  }

  report.section7_difficultyAge = { byDifficulty: {}, byAge: {} };
  for (const d of Object.keys(byDiff)) {
    const bd = byDiff[d];
    report.section7_difficultyAge.byDifficulty[d] = {
      count: bd.total, passed: bd.passed,
      passRate: parseFloat(((bd.passed / bd.total) * 100).toFixed(1)),
      avgScore: bd.scores.reduce((s, v) => s + v, 0) / bd.scores.length,
      median: median(bd.scores)
    };
  }
  for (const bucket of Object.keys(byAge)) {
    const ba = byAge[bucket];
    report.section7_difficultyAge.byAge[bucket] = {
      count: ba.total, passed: ba.passed,
      passRate: parseFloat(((ba.passed / ba.total) * 100).toFixed(1)),
      avgScore: ba.scores.reduce((s, v) => s + v, 0) / ba.scores.length,
      median: median(ba.scores)
    };
  }

  // =========================================================================
  // Section 8: Top Issue Themes
  // =========================================================================
  header('SECTION 8: TOP ISSUE THEMES');

  const issueCounts = {};
  const a4Failing = a4Results.filter(r => !r.passed);

  for (const r of a4Failing) {
    for (const issue of (r.issues || [])) {
      const norm = normalizeIssue(issue);
      if (!norm) continue;
      if (!issueCounts[norm]) issueCounts[norm] = { normalized: norm, original: issue, count: 0, scenarios: [] };
      issueCounts[norm].count++;
      issueCounts[norm].scenarios.push(r.id);
    }
  }

  // Cluster similar issues by leading tokens
  const issueList = Object.values(issueCounts).sort((a, b) => b.count - a.count);

  // Group by theme (first 5 words)
  const themes = {};
  for (const entry of issueList) {
    const themeKey = entry.normalized.split(' ').slice(0, 5).join(' ');
    if (!themes[themeKey]) themes[themeKey] = { theme: themeKey, count: 0, examples: [], scenarios: new Set() };
    themes[themeKey].count += entry.count;
    themes[themeKey].examples.push(entry.original);
    for (const s of entry.scenarios) themes[themeKey].scenarios.add(s);
  }

  const sortedThemes = Object.values(themes).sort((a, b) => b.count - a.count).slice(0, 15);

  print(`Total distinct issues from ${a4Failing.length} failing scenarios: ${issueList.length}`);
  print('');
  print('Top 15 Issue Themes:');
  print('');

  for (let i = 0; i < sortedThemes.length; i++) {
    const t = sortedThemes[i];
    print(`  ${padL(i + 1, 2)}. [${t.count} occurrences, ${t.scenarios.size} scenarios]`);
    print(`      ${t.examples[0].substring(0, 100)}`);
    if (t.examples.length > 1) print(`      (+ ${t.examples.length - 1} similar)`);
    print('');
  }

  report.section8_topIssues = sortedThemes.map(t => ({
    theme: t.theme,
    count: t.count,
    scenarioCount: t.scenarios.size,
    example: t.examples[0],
    scenarioIds: [...t.scenarios]
  }));

  // =========================================================================
  // Section 9: Fix Priority List
  // =========================================================================
  header('SECTION 9: FIX PRIORITY LIST');

  const priorities = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };

  for (const r of a4Failing) {
    const level = priorityLevel(r.score, r.dimensions);
    priorities[level].push({
      id: r.id,
      position: r.position,
      title: r.title,
      score: r.score,
      conceptTag: r.conceptTag || r.concept,
      priority: level,
      issues: r.issues || [],
      suggestedFix: r.suggestedFix || null,
      lowestDim: (() => {
        if (!r.dimensions) return null;
        let minDim = null, minVal = Infinity;
        for (const [k, v] of Object.entries(r.dimensions)) {
          if (typeof v === 'number' && v < minVal) { minVal = v; minDim = k; }
        }
        return minDim ? { dimension: minDim, value: minVal } : null;
      })()
    });
  }

  const totalFailing = a4Failing.length;
  print(`Total failing: ${totalFailing}`);
  print(`  CRITICAL: ${priorities.CRITICAL.length}  (score < 5.0 or any dimension < 3)`);
  print(`  HIGH:     ${priorities.HIGH.length}  (score < 6.5)`);
  print(`  MEDIUM:   ${priorities.MEDIUM.length}  (score < 7.5)`);
  print(`  LOW:      ${priorities.LOW.length}  (just below threshold)`);
  print('');

  for (const level of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
    const items = priorities[level].sort((a, b) => a.score - b.score);
    if (items.length === 0) continue;

    print(`--- ${level} (${items.length}) ---`);
    print('');
    for (const item of items) {
      print(`  ${item.id} [${item.position}] score=${fmt(item.score, 1)} "${item.title}"`);
      if (item.lowestDim) {
        print(`    Lowest dim: ${item.lowestDim.dimension} = ${item.lowestDim.value}`);
      }
      if (item.conceptTag) print(`    Concept: ${item.conceptTag}`);
      if (item.issues.length) print(`    Issue: ${item.issues[0].substring(0, 100)}`);
      if (item.suggestedFix) print(`    Fix: ${item.suggestedFix.substring(0, 100)}`);
      print('');
    }
  }

  report.section9_fixPriority = priorities;

  // =========================================================================
  // Section 10: Executive Summary
  // =========================================================================
  header('SECTION 10: EXECUTIVE SUMMARY');

  const a4Total = a4Results.length;
  const a4Scored = a4Results.filter(r => r.score != null).length;
  const a4Passed = a4Results.filter(r => r.passed).length;
  const a4Failed = a4Results.filter(r => !r.passed).length;
  const a4Avg = allScores.reduce((s, v) => s + v, 0) / allScores.length;
  const a4PassRate = (a4Passed / a4Scored) * 100;

  const a3Total = audit3?.stats?.total || 0;
  const a3Passed = audit3?.stats?.passed || 0;
  const a3Failed = audit3?.stats?.failed || 0;
  const a3Avg = audit3?.stats?.avgScore || 0;
  const a3PassRate = a3Total > 0 ? (a3Passed / (audit3?.stats?.scored || a3Total)) * 100 : 0;

  print('PASS RATE:');
  print(`  Audit 3: ${a3Total > 0 ? fmt(a3PassRate, 1) + '%' : 'N/A'} (${a3Passed}/${audit3?.stats?.scored || '?'})`);
  print(`  Audit 4: ${fmt(a4PassRate, 1)}% (${a4Passed}/${a4Scored})`);
  if (a3Total > 0) {
    const prDelta = a4PassRate - a3PassRate;
    print(`  Delta:   ${prDelta >= 0 ? '+' : ''}${fmt(prDelta, 1)} pp`);
  }
  print('');

  print('AVERAGE SCORE:');
  print(`  Audit 3: ${a3Total > 0 ? fmt(a3Avg, 3) : 'N/A'}`);
  print(`  Audit 4: ${fmt(a4Avg, 3)}`);
  if (a3Total > 0) {
    const avgDelta = a4Avg - a3Avg;
    print(`  Delta:   ${avgDelta >= 0 ? '+' : ''}${fmt(avgDelta, 3)}`);
  }
  print('');

  print('FIX STATUS:');
  print(`  Previously failing (A3): ${a3Failed}`);
  print(`  Fixed:                   ${section1.fixed.length}`);
  print(`  Still failing:           ${section1.stillFailing.length}`);
  print(`  Got worse:               ${section1.worse.length}`);
  print(`  Missing from A4:         ${section1.missing.length}`);
  print(`  New regressions:         ${section2.regressions.length}`);
  print(`  Current failures (A4):   ${a4Failed}`);
  print('');

  print('CONCEPT COVERAGE:');
  print(`  BRAIN concepts:    ${BRAIN_CONCEPTS.length}`);
  print(`  Well-covered:      ${wellCovered.length}`);
  print(`  Under-covered:     ${underCovered.length}`);
  print(`  Uncovered:         ${uncovered.length}`);
  print('');

  print('CRITICAL ISSUES:');
  print(`  Critical priority: ${priorities.CRITICAL.length}`);
  print(`  High priority:     ${priorities.HIGH.length}`);
  print('');

  // Deployment readiness criteria
  const factAccAvg = dimStats.factualAccuracy?.avg || 0;
  const explQualAvg = dimStats.explanationQuality?.avg || 0;
  const allConceptsCovered = uncovered.length === 0 && underCovered.length === 0;

  const criteria = {
    passRate95: a4PassRate >= 95.0,
    zeroCritical: priorities.CRITICAL.length === 0,
    allConceptsCovered,
    factualAccuracy9: factAccAvg >= 9.0,
    explanationQuality8: explQualAvg >= 8.0
  };

  const allCriteriaMet = Object.values(criteria).every(Boolean);

  print('DEPLOYMENT READINESS CHECK:');
  print(`  [${criteria.passRate95 ? 'PASS' : 'FAIL'}] Pass rate >= 95% (actual: ${fmt(a4PassRate, 1)}%)`);
  print(`  [${criteria.zeroCritical ? 'PASS' : 'FAIL'}] Zero critical issues (actual: ${priorities.CRITICAL.length})`);
  print(`  [${criteria.allConceptsCovered ? 'PASS' : 'FAIL'}] All BRAIN concepts covered (under: ${underCovered.length}, uncovered: ${uncovered.length})`);
  print(`  [${criteria.factualAccuracy9 ? 'PASS' : 'FAIL'}] factualAccuracy avg >= 9.0 (actual: ${fmt(factAccAvg, 2)})`);
  print(`  [${criteria.explanationQuality8 ? 'PASS' : 'FAIL'}] explanationQuality avg >= 8.0 (actual: ${fmt(explQualAvg, 2)})`);
  print('');
  print(`  DEPLOYMENT READY: ${allCriteriaMet ? 'YES' : 'NO'}`);

  report.section10_executive = {
    audit3: { total: a3Total, scored: audit3?.stats?.scored, passed: a3Passed, failed: a3Failed, avgScore: a3Avg, passRate: a3PassRate },
    audit4: { total: a4Total, scored: a4Scored, passed: a4Passed, failed: a4Failed, avgScore: a4Avg, passRate: a4PassRate },
    fixStatus: {
      previouslyFailing: a3Failed,
      fixed: section1.fixed.length,
      stillFailing: section1.stillFailing.length,
      worse: section1.worse.length,
      missing: section1.missing.length,
      newRegressions: section2.regressions.length,
      currentFailures: a4Failed
    },
    conceptCoverage: { total: BRAIN_CONCEPTS.length, wellCovered: wellCovered.length, underCovered: underCovered.length, uncovered: uncovered.length },
    criticalIssues: { critical: priorities.CRITICAL.length, high: priorities.HIGH.length },
    deploymentReadiness: { criteria, ready: allCriteriaMet }
  };

  // =========================================================================
  // Output
  // =========================================================================

  // Print to console
  const fullOutput = output.join('\n');
  console.log(fullOutput);

  // Save report JSON
  const reportWrapper = {
    meta: {
      generatedAt: new Date().toISOString(),
      audit3File: AUDIT3_PATH,
      audit4File: AUDIT4_PATH,
      audit3Scenarios: a3Results.length,
      audit4Scenarios: a4Results.length
    },
    ...report
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(reportWrapper, null, 2));
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Report saved to: ${REPORT_PATH}`);
  console.log(`${'='.repeat(80)}`);
}

main();
