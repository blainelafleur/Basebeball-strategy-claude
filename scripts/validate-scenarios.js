#!/usr/bin/env node
/**
 * BSM Scenario Validator
 * Parses index.jsx and validates all scenarios against quality rules.
 * Run: node scripts/validate-scenarios.js
 *
 * Checks:
 * - Required fields present on every scenario
 * - Data integrity (rates 0-100, best index valid, 4 options/explanations/rates)
 * - conceptTag coverage
 * - explSimple coverage
 * - Difficulty distribution per position
 * - Duplicate detection (by description text)
 * - Explanation quality (minimum length, no placeholders)
 * - Success rate logic (best option should have highest or near-highest rate)
 * - Age range validity
 */

const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '..', 'index.jsx');
const POSITIONS = [
  'pitcher','catcher','firstBase','secondBase','shortstop','thirdBase',
  'leftField','centerField','rightField','batter','baserunner','manager',
  'famous','rules','counts'
];

// ============================================================================
// PARSER: Extract scenarios from index.jsx
// ============================================================================
function extractScenarios(source) {
  const scenarios = {};
  let totalCount = 0;

  for (const pos of POSITIONS) {
    scenarios[pos] = [];

    // Find the position array in SCENARIOS object
    // Pattern: position_name: [ ... ]
    const posRegex = new RegExp(`${pos}\\s*:\\s*\\[`, 'g');
    const match = posRegex.exec(source);
    if (!match) {
      console.warn(`⚠️  Position "${pos}" not found in SCENARIOS object`);
      continue;
    }

    // Find all scenario objects within this position array
    // We look for {id:"..." patterns
    let startIdx = match.index + match[0].length;
    let bracketDepth = 1;
    let posEndIdx = startIdx;

    // Find the closing bracket of the position array
    for (let i = startIdx; i < source.length && bracketDepth > 0; i++) {
      if (source[i] === '[') bracketDepth++;
      if (source[i] === ']') bracketDepth--;
      posEndIdx = i;
    }

    const posBlock = source.substring(startIdx, posEndIdx);

    // Extract individual scenario objects using id field as anchor
    const idPattern = /\{id\s*:\s*["']([^"']+)["']/g;
    let idMatch;
    const idPositions = [];

    while ((idMatch = idPattern.exec(posBlock)) !== null) {
      idPositions.push({ id: idMatch[1], startIdx: idMatch.index });
    }

    // For each scenario, extract its fields
    for (let i = 0; i < idPositions.length; i++) {
      const scenarioStart = idPositions[i].startIdx;
      const scenarioEnd = i + 1 < idPositions.length ? idPositions[i + 1].startIdx : posBlock.length;
      const scenarioText = posBlock.substring(scenarioStart, scenarioEnd);

      const scenario = {
        id: idPositions[i].id,
        position: pos,
        _raw: scenarioText.substring(0, 200) // First 200 chars for debugging
      };

      // Extract key fields using patterns
      const strField = (name) => {
        const re = new RegExp(`${name}\\s*:\\s*["'\`]([^"'\`]*?)["'\`]`);
        const m = scenarioText.match(re);
        return m ? m[1] : null;
      };

      const numField = (name) => {
        const re = new RegExp(`${name}\\s*:\\s*(\\d+)`);
        const m = scenarioText.match(re);
        return m ? parseInt(m[1]) : null;
      };

      const arrayField = (name) => {
        const re = new RegExp(`${name}\\s*:\\s*\\[([^\\]]*?)\\]`);
        const m = scenarioText.match(re);
        if (!m) return null;
        // Parse array of numbers
        const nums = m[1].match(/\d+/g);
        return nums ? nums.map(Number) : [];
      };

      const stringArrayField = (name) => {
        // Count strings in array by finding the array brackets and counting quoted strings
        const re = new RegExp(`${name}\\s*:\\s*\\[`);
        const m = re.exec(scenarioText);
        if (!m) return null;

        let depth = 1;
        let arrStart = m.index + m[0].length;
        let arrEnd = arrStart;
        for (let j = arrStart; j < scenarioText.length && depth > 0; j++) {
          if (scenarioText[j] === '[') depth++;
          if (scenarioText[j] === ']') depth--;
          arrEnd = j;
        }
        const arrContent = scenarioText.substring(arrStart, arrEnd);
        // Count top-level strings by counting quote pairs that start after comma or start
        const strings = [];
        let inStr = false;
        let strStart = 0;
        let quoteChar = '';
        for (let j = 0; j < arrContent.length; j++) {
          if (!inStr && (arrContent[j] === '"' || arrContent[j] === "'")) {
            inStr = true;
            quoteChar = arrContent[j];
            strStart = j + 1;
          } else if (inStr && arrContent[j] === quoteChar && arrContent[j-1] !== '\\') {
            strings.push(arrContent.substring(strStart, j));
            inStr = false;
          }
        }
        return strings;
      };

      scenario.title = strField('title');
      scenario.diff = numField('diff');
      scenario.cat = strField('cat');
      scenario.conceptTag = strField('conceptTag');
      scenario.ageMin = numField('ageMin');
      scenario.ageMax = numField('ageMax');
      scenario.description = strField('description');
      scenario.best = numField('best');
      scenario.concept = strField('concept');
      scenario.anim = strField('anim');
      scenario.rates = arrayField('rates');
      scenario.options = stringArrayField('options');
      scenario.explanations = stringArrayField('explanations');
      scenario.hasExplSimple = scenarioText.includes('explSimple');

      scenarios[pos].push(scenario);
      totalCount++;
    }
  }

  return { scenarios, totalCount };
}

// ============================================================================
// VALIDATORS
// ============================================================================
function validate(scenarios, totalCount) {
  const errors = [];
  const warnings = [];
  const stats = {
    totalScenarios: totalCount,
    byPosition: {},
    byDifficulty: { 1: 0, 2: 0, 3: 0 },
    withConceptTag: 0,
    withoutConceptTag: 0,
    withExplSimple: 0,
    withoutExplSimple: 0,
    allIds: new Set(),
    duplicateIds: [],
    descriptionHashes: new Map(),
    duplicateDescriptions: []
  };

  for (const pos of POSITIONS) {
    const posScenarios = scenarios[pos] || [];
    stats.byPosition[pos] = posScenarios.length;

    const posDiffDist = { 1: 0, 2: 0, 3: 0 };

    for (const s of posScenarios) {
      // --- Required Fields ---
      const required = ['id', 'title', 'diff', 'description', 'best', 'concept'];
      for (const field of required) {
        if (s[field] === null || s[field] === undefined) {
          errors.push(`[${s.id || 'UNKNOWN'}] Missing required field: ${field} (position: ${pos})`);
        }
      }

      // --- Unique IDs ---
      if (s.id) {
        if (stats.allIds.has(s.id)) {
          errors.push(`[${s.id}] Duplicate scenario ID (position: ${pos})`);
          stats.duplicateIds.push(s.id);
        }
        stats.allIds.add(s.id);
      }

      // --- Options count ---
      if (s.options && s.options.length !== 4) {
        errors.push(`[${s.id}] Has ${s.options.length} options (expected 4)`);
      }
      if (!s.options) {
        errors.push(`[${s.id}] Missing options array`);
      }

      // --- Explanations count ---
      if (s.explanations && s.explanations.length !== 4) {
        errors.push(`[${s.id}] Has ${s.explanations.length} explanations (expected 4)`);
      }
      if (!s.explanations) {
        errors.push(`[${s.id}] Missing explanations array`);
      }

      // --- Rates validation ---
      if (s.rates) {
        if (s.rates.length !== 4) {
          errors.push(`[${s.id}] Has ${s.rates.length} rates (expected 4)`);
        }
        for (const r of s.rates) {
          if (r < 0 || r > 100) {
            errors.push(`[${s.id}] Rate out of range: ${r}`);
          }
        }
        // Best option should have highest or near-highest rate
        if (s.best !== null && s.rates.length === 4) {
          const bestRate = s.rates[s.best];
          const maxRate = Math.max(...s.rates);
          if (bestRate < maxRate - 5) {
            warnings.push(`[${s.id}] Best option (idx ${s.best}, rate ${bestRate}) is not the highest rate (max: ${maxRate})`);
          }
        }
      } else {
        errors.push(`[${s.id}] Missing rates array`);
      }

      // --- Best index valid ---
      if (s.best !== null && (s.best < 0 || s.best > 3)) {
        errors.push(`[${s.id}] Invalid best index: ${s.best} (must be 0-3)`);
      }

      // --- Difficulty ---
      if (s.diff && [1, 2, 3].includes(s.diff)) {
        stats.byDifficulty[s.diff]++;
        posDiffDist[s.diff]++;
      } else if (s.diff) {
        errors.push(`[${s.id}] Invalid difficulty: ${s.diff} (must be 1, 2, or 3)`);
      }

      // --- ConceptTag ---
      if (s.conceptTag) {
        stats.withConceptTag++;
      } else {
        stats.withoutConceptTag++;
        warnings.push(`[${s.id}] Missing conceptTag (position: ${pos})`);
      }

      // --- ExplSimple ---
      if (s.hasExplSimple) {
        stats.withExplSimple++;
      } else {
        stats.withoutExplSimple++;
      }

      // --- Age range ---
      if (s.ageMin && s.ageMax && s.ageMin > s.ageMax) {
        errors.push(`[${s.id}] Invalid age range: ageMin (${s.ageMin}) > ageMax (${s.ageMax})`);
      }

      // --- Explanation quality ---
      if (s.explanations) {
        for (let i = 0; i < s.explanations.length; i++) {
          const expl = s.explanations[i];
          if (expl && expl.split(' ').length < 8) {
            warnings.push(`[${s.id}] Short explanation (option ${i}): "${expl.substring(0, 50)}..." (${expl.split(' ').length} words)`);
          }
        }
      }

      // --- Duplicate descriptions ---
      if (s.description) {
        const descKey = s.description.toLowerCase().trim().substring(0, 100);
        if (stats.descriptionHashes.has(descKey)) {
          const existing = stats.descriptionHashes.get(descKey);
          warnings.push(`[${s.id}] Possible duplicate description with [${existing}]`);
          stats.duplicateDescriptions.push([s.id, existing]);
        }
        stats.descriptionHashes.set(descKey, s.id);
      }
    }

    // --- Difficulty distribution per position ---
    for (const diff of [1, 2, 3]) {
      if (posDiffDist[diff] === 0 && posScenarios.length > 5) {
        warnings.push(`[${pos}] No difficulty ${diff} scenarios (has ${posScenarios.length} total)`);
      }
    }
  }

  return { errors, warnings, stats };
}

// ============================================================================
// MAIN
// ============================================================================
function main() {
  console.log('🔍 BSM Scenario Validator\n');

  if (!fs.existsSync(INDEX_PATH)) {
    console.error(`❌ index.jsx not found at ${INDEX_PATH}`);
    process.exit(1);
  }

  const source = fs.readFileSync(INDEX_PATH, 'utf8');
  console.log(`📄 Read index.jsx (${(source.length / 1024).toFixed(0)} KB, ${source.split('\n').length} lines)\n`);

  // Parse scenarios
  console.log('📊 Parsing scenarios...');
  const { scenarios, totalCount } = extractScenarios(source);
  console.log(`   Found ${totalCount} scenarios across ${POSITIONS.length} positions\n`);

  // Validate
  console.log('✅ Running validation checks...\n');
  const { errors, warnings, stats } = validate(scenarios, totalCount);

  // Report
  console.log('═══════════════════════════════════════════');
  console.log('  SCENARIO VALIDATION REPORT');
  console.log('═══════════════════════════════════════════\n');

  console.log(`Total scenarios: ${stats.totalScenarios}`);
  console.log(`\nBy position:`);
  for (const pos of POSITIONS) {
    const count = stats.byPosition[pos] || 0;
    const bar = '█'.repeat(Math.floor(count / 3));
    console.log(`  ${pos.padEnd(14)} ${String(count).padStart(3)} ${bar}`);
  }

  console.log(`\nBy difficulty:`);
  console.log(`  Rookie (1):   ${stats.byDifficulty[1]}`);
  console.log(`  Pro (2):      ${stats.byDifficulty[2]}`);
  console.log(`  All-Star (3): ${stats.byDifficulty[3]}`);

  console.log(`\nConceptTag coverage: ${stats.withConceptTag}/${stats.totalScenarios} (${((stats.withConceptTag/stats.totalScenarios)*100).toFixed(1)}%)`);
  console.log(`ExplSimple coverage: ${stats.withExplSimple}/${stats.totalScenarios} (${((stats.withExplSimple/stats.totalScenarios)*100).toFixed(1)}%)`);

  if (stats.duplicateIds.length > 0) {
    console.log(`\n⚠️  Duplicate IDs: ${stats.duplicateIds.join(', ')}`);
  }

  console.log(`\n───────────────────────────────────────────`);
  console.log(`  ERRORS: ${errors.length}     WARNINGS: ${warnings.length}`);
  console.log(`───────────────────────────────────────────\n`);

  if (errors.length > 0) {
    console.log('❌ ERRORS (must fix):');
    errors.forEach(e => console.log(`   ${e}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length} total, showing first 30):`);
    warnings.slice(0, 30).forEach(w => console.log(`   ${w}`));
    if (warnings.length > 30) {
      console.log(`   ... and ${warnings.length - 30} more warnings`);
    }
    console.log('');
  }

  // Summary verdict
  const grade = errors.length === 0 ? (warnings.length < 20 ? '🟢 PASS' : '🟡 PASS WITH WARNINGS') : '🔴 FAIL';
  console.log(`\nVERDICT: ${grade}`);
  console.log(`  ${errors.length} errors, ${warnings.length} warnings`);
  console.log(`  conceptTag gap: ${stats.withoutConceptTag} scenarios need tags`);
  console.log(`  explSimple gap: ${stats.withoutExplSimple} scenarios need simple explanations`);

  // Write JSON report
  const reportPath = path.join(__dirname, 'validation-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    verdict: grade,
    totalScenarios: stats.totalScenarios,
    errors: errors.length,
    warnings: warnings.length,
    conceptTagCoverage: `${((stats.withConceptTag/stats.totalScenarios)*100).toFixed(1)}%`,
    explSimpleCoverage: `${((stats.withExplSimple/stats.totalScenarios)*100).toFixed(1)}%`,
    byPosition: stats.byPosition,
    byDifficulty: stats.byDifficulty,
    errorList: errors,
    warningList: warnings.slice(0, 50) // Cap at 50 for readability
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📝 Full report saved to: scripts/validation-report.json`);

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
