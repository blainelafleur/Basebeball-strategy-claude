#!/usr/bin/env node
/**
 * audit_preflight.js — Pre-audit health check
 *
 * Verifies the codebase is ready for an audit by checking:
 *   1. Scenario count matches expected (607), with per-position breakdown
 *   2. BRAIN concept coverage (every concept has >= 3 scenarios)
 *   3. Orphaned conceptTags (in scenarios but not in BRAIN.concepts)
 *   4. QUALITY_FIREWALL validation (Tier 1/2/3 counts)
 *   5. Rate sanity (sums 145-210, best has highest rate)
 *   6. Audit files exist (audit3_full_results.json, audit_enhanced_prompt.txt)
 *
 * Usage:
 *   node scripts/audit_preflight.js
 *
 * Exit code:
 *   0 — all checks pass
 *   1 — one or more checks failed
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INDEX_JSX = path.join(ROOT, "index.jsx");
const EXPECTED_TOTAL = 671;

// ─── Balanced-delimiter extractor (from validate_firewall.js) ────────────────
function extractBalanced(source, startIdx, openCh, closeCh) {
  let depth = 0;
  let i = startIdx;
  while (i < source.length) {
    const ch = source[i];
    if (ch === "/" && source[i + 1] === "/") {
      const eol = source.indexOf("\n", i);
      i = eol === -1 ? source.length : eol + 1;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const q = ch;
      i++;
      while (i < source.length) {
        if (source[i] === "\\") { i += 2; continue; }
        if (source[i] === q) { i++; break; }
        i++;
      }
      continue;
    }
    if (ch === "`") {
      i++;
      while (i < source.length) {
        if (source[i] === "\\") { i += 2; continue; }
        if (source[i] === "`") { i++; break; }
        i++;
      }
      continue;
    }
    if (ch === "/") {
      let j = i - 1;
      while (j >= 0 && /\s/.test(source[j])) j--;
      const prevCh = j >= 0 ? source[j] : "";
      const isRegex = "=({,;:!&|?[~^%+->".includes(prevCh) || prevCh === "" ||
        (j >= 5 && /(?:return|typeof|delete|void|throw|new|in)$/.test(source.slice(j - 5, j + 1)));
      if (isRegex) {
        i++;
        while (i < source.length) {
          if (source[i] === "\\") { i += 2; continue; }
          if (source[i] === "/") { i++; while (i < source.length && /[gimsuvy]/.test(source[i])) i++; break; }
          if (source[i] === "[") {
            i++;
            while (i < source.length && source[i] !== "]") { if (source[i] === "\\") i++; i++; }
            i++; continue;
          }
          i++;
        }
        continue;
      }
    }
    if (ch === openCh) depth++;
    if (ch === closeCh) { depth--; if (depth === 0) return source.slice(startIdx, i + 1); }
    i++;
  }
  throw new Error(`Unbalanced ${openCh}${closeCh} starting at index ${startIdx}`);
}

function extractObject(source, constName) {
  const needle = `const ${constName} = {`;
  const start = source.indexOf(needle);
  if (start === -1) throw new Error(`Could not find '${needle}' in index.jsx`);
  return extractBalanced(source, source.indexOf("{", start), "{", "}");
}

function extractArray(source, constName) {
  const needle = `const ${constName} = [`;
  const start = source.indexOf(needle);
  if (start === -1) throw new Error(`Could not find '${needle}' in index.jsx`);
  return extractBalanced(source, source.indexOf("[", start), "[", "]");
}

function extractFunction(source, fnName) {
  const needle = `function ${fnName}(`;
  const start = source.indexOf(needle);
  if (start === -1) throw new Error(`Could not find 'function ${fnName}' in index.jsx`);
  const braceStart = source.indexOf("{", start);
  const body = extractBalanced(source, braceStart, "{", "}");
  return source.slice(start, braceStart) + body;
}

// ─── Formatting helpers ─────────────────────────────────────────────────────
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function pass(label) { console.log(`  ${GREEN}PASS${RESET}  ${label}`); }
function fail(label) { console.log(`  ${RED}FAIL${RESET}  ${label}`); }
function warn(label) { console.log(`  ${YELLOW}WARN${RESET}  ${label}`); }
function header(title) {
  console.log();
  console.log(`${BOLD}${"=".repeat(70)}${RESET}`);
  console.log(`${BOLD}  ${title}${RESET}`);
  console.log(`${BOLD}${"=".repeat(70)}${RESET}`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  let failures = 0;

  console.log(`\n${BOLD}AUDIT PREFLIGHT CHECK${RESET}`);
  console.log(`Reading index.jsx...`);

  const source = fs.readFileSync(INDEX_JSX, "utf-8");

  // ── Extract SCENARIOS ──────────────────────────────────────────────────
  console.log("Extracting SCENARIOS...");
  const scenariosCode = extractObject(source, "SCENARIOS");
  let SCENARIOS;
  try { SCENARIOS = new Function(`return (${scenariosCode})`)(); }
  catch (e) { console.error(`Failed to parse SCENARIOS: ${e.message}`); process.exit(1); }

  const scenarios = [];
  const positionCounts = {};
  for (const [position, arr] of Object.entries(SCENARIOS)) {
    if (!Array.isArray(arr)) continue;
    positionCounts[position] = arr.length;
    for (const s of arr) {
      scenarios.push({ ...s, _position: position });
    }
  }

  // ── Extract BRAIN ──────────────────────────────────────────────────────
  console.log("Extracting BRAIN...");
  const brainCode = extractObject(source, "BRAIN");
  let BRAIN;
  try { BRAIN = new Function(`return (${brainCode})`)(); }
  catch (e) { console.error(`Failed to parse BRAIN: ${e.message}`); process.exit(1); }

  const brainConcepts = BRAIN.concepts ? Object.keys(BRAIN.concepts) : [];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 1: Scenario count
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  header("1. SCENARIO COUNT");

  const totalScenarios = scenarios.length;
  console.log(`  Total: ${totalScenarios} (expected: ${EXPECTED_TOTAL})\n`);

  // Print per-position counts in a compact table
  const positions = Object.keys(positionCounts).sort((a, b) => positionCounts[b] - positionCounts[a]);
  for (const pos of positions) {
    console.log(`    ${pos.padEnd(16)} ${String(positionCounts[pos]).padStart(4)}`);
  }
  console.log();

  if (totalScenarios === EXPECTED_TOTAL) {
    pass(`Scenario count matches expected (${EXPECTED_TOTAL})`);
  } else {
    fail(`Scenario count ${totalScenarios} does not match expected ${EXPECTED_TOTAL}`);
    failures++;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 2: BRAIN concept coverage
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  header("2. BRAIN CONCEPT COVERAGE");

  // Count scenarios per conceptTag
  const conceptCounts = {};
  for (const s of scenarios) {
    if (s.conceptTag) {
      conceptCounts[s.conceptTag] = (conceptCounts[s.conceptTag] || 0) + 1;
    }
  }

  console.log(`  BRAIN concepts defined: ${brainConcepts.length}\n`);

  const underCovered = [];
  const zeroCovered = [];
  for (const concept of brainConcepts.sort()) {
    const count = conceptCounts[concept] || 0;
    if (count === 0) {
      zeroCovered.push(concept);
    } else if (count < 3) {
      underCovered.push({ concept, count });
    }
  }

  if (zeroCovered.length > 0) {
    console.log(`  ${RED}Concepts with 0 scenarios (mastery impossible):${RESET}`);
    for (const c of zeroCovered) {
      console.log(`    - ${c}`);
    }
    console.log();
  }

  if (underCovered.length > 0) {
    console.log(`  ${YELLOW}Concepts with < 3 scenarios (mastery requires 3):${RESET}`);
    for (const { concept, count } of underCovered) {
      console.log(`    - ${concept}: ${count} scenario${count === 1 ? "" : "s"}`);
    }
    console.log();
  }

  const flaggedCount = zeroCovered.length + underCovered.length;
  if (flaggedCount === 0) {
    pass(`All ${brainConcepts.length} BRAIN concepts have >= 3 scenarios`);
  } else {
    fail(`${flaggedCount} BRAIN concept(s) have < 3 scenarios (${zeroCovered.length} with 0, ${underCovered.length} with 1-2)`);
    failures++;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 3: Orphaned conceptTags
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  header("3. ORPHANED CONCEPT TAGS");

  const brainConceptSet = new Set(brainConcepts);
  const orphanedTags = {};
  for (const s of scenarios) {
    if (s.conceptTag && !brainConceptSet.has(s.conceptTag)) {
      orphanedTags[s.conceptTag] = (orphanedTags[s.conceptTag] || 0) + 1;
    }
  }

  const orphanedKeys = Object.keys(orphanedTags).sort();
  if (orphanedKeys.length === 0) {
    pass("No orphaned conceptTags found");
  } else {
    warn(`${orphanedKeys.length} conceptTag(s) used in scenarios but not in BRAIN.concepts:`);
    for (const tag of orphanedKeys) {
      console.log(`    - "${tag}" (${orphanedTags[tag]} scenario${orphanedTags[tag] === 1 ? "" : "s"})`);
    }
    // Orphaned tags are noted but not a hard failure
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 4: QUALITY_FIREWALL validation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  header("4. QUALITY_FIREWALL VALIDATION");

  console.log("  Extracting firewall dependencies...");

  let QUALITY_FIREWALL;
  try {
    const runnersKeyCode = extractFunction(source, "runnersKey");
    const getRunExpectancyCode = extractFunction(source, "getRunExpectancy");
    const semanticOverlapsCode = extractArray(source, "SEMANTIC_OVERLAPS");
    const firewallCode = extractObject(source, "QUALITY_FIREWALL");

    const envCode = `
      const BRAIN = (${brainCode});
      const SEMANTIC_OVERLAPS = (${semanticOverlapsCode});
      ${runnersKeyCode}
      ${getRunExpectancyCode}
      const QUALITY_FIREWALL = (${firewallCode});
      return QUALITY_FIREWALL;
    `;
    QUALITY_FIREWALL = new Function(envCode)();
  } catch (e) {
    fail(`Could not build firewall environment: ${e.message}`);
    failures++;
    QUALITY_FIREWALL = null;
  }

  if (QUALITY_FIREWALL && typeof QUALITY_FIREWALL.validate === "function") {
    let tier1Count = 0;
    let tier2Count = 0;
    let tier3Count = 0;
    let errorCount = 0;

    for (const scenario of scenarios) {
      try {
        const result = QUALITY_FIREWALL.validate(scenario, scenario._position);
        tier1Count += result.tier1Fails.length;
        tier2Count += result.tier2Warns.length;
        tier3Count += result.tier3Suggestions.length;
      } catch (e) {
        errorCount++;
      }
    }

    console.log(`  Scenarios checked: ${scenarios.length}`);
    console.log(`  Tier 1 failures:   ${tier1Count}`);
    console.log(`  Tier 2 warnings:   ${tier2Count}`);
    console.log(`  Tier 3 suggestions:${tier3Count}`);
    if (errorCount > 0) console.log(`  Validation errors: ${errorCount}`);
    console.log();

    if (tier1Count === 0 && errorCount === 0) {
      pass("No Tier 1 failures or validation errors");
    } else {
      if (tier1Count > 0) fail(`${tier1Count} Tier 1 failure(s) found`);
      if (errorCount > 0) fail(`${errorCount} scenario(s) threw during validation`);
      failures++;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 5: Rate sanity
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  header("5. RATE SANITY");

  let rateFails = 0;
  const rateProblems = [];

  for (const s of scenarios) {
    const rates = s.rates;
    const best = s.best;
    if (!rates || !Array.isArray(rates) || rates.length !== 4) {
      rateProblems.push(`[${s.id}] Missing or malformed rates array`);
      rateFails++;
      continue;
    }
    if (best === undefined || best < 0 || best > 3) {
      rateProblems.push(`[${s.id}] Invalid best index: ${best}`);
      rateFails++;
      continue;
    }

    const sum = rates.reduce((a, b) => a + b, 0);
    if (sum < 145 || sum > 210) {
      rateProblems.push(`[${s.id}] Rate sum ${sum} outside 145-210 range (rates: [${rates.join(",")}])`);
      rateFails++;
    }

    // Best option should have the highest rate
    const maxRate = Math.max(...rates);
    if (rates[best] < maxRate) {
      rateProblems.push(`[${s.id}] Best (idx ${best}, rate ${rates[best]}) is not highest (max ${maxRate})`);
      rateFails++;
    }
  }

  if (rateProblems.length > 0 && rateProblems.length <= 20) {
    for (const p of rateProblems) {
      console.log(`    ${p}`);
    }
    console.log();
  } else if (rateProblems.length > 20) {
    for (const p of rateProblems.slice(0, 15)) {
      console.log(`    ${p}`);
    }
    console.log(`    ... and ${rateProblems.length - 15} more`);
    console.log();
  }

  if (rateFails === 0) {
    pass(`All ${scenarios.length} scenarios pass rate sanity (sum 145-210, best is highest)`);
  } else {
    fail(`${rateFails} scenario(s) failed rate sanity checks`);
    failures++;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 6: Audit files exist
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  header("6. AUDIT FILES");

  const auditResultsPath = path.join(ROOT, "scripts", "audit3_full_results.json");
  const auditPromptPath = path.join(ROOT, "scripts", "audit_enhanced_prompt.txt");

  const resultsExist = fs.existsSync(auditResultsPath);
  const promptExist = fs.existsSync(auditPromptPath);

  if (resultsExist) {
    const stat = fs.statSync(auditResultsPath);
    const size = (stat.size / 1024).toFixed(1);
    const modified = stat.mtime.toISOString().slice(0, 10);
    pass(`audit3_full_results.json exists (${size} KB, last modified ${modified})`);
  } else {
    fail("audit3_full_results.json not found in scripts/");
    failures++;
  }

  if (promptExist) {
    const stat = fs.statSync(auditPromptPath);
    const size = (stat.size / 1024).toFixed(1);
    const modified = stat.mtime.toISOString().slice(0, 10);
    pass(`audit_enhanced_prompt.txt exists (${size} KB, last modified ${modified})`);
  } else {
    fail("audit_enhanced_prompt.txt not found in scripts/");
    failures++;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FINAL VERDICT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log();
  console.log("=".repeat(70));
  if (failures === 0) {
    console.log(`${GREEN}${BOLD}PREFLIGHT RESULT: ALL CHECKS PASSED${RESET}`);
    console.log("Codebase is ready for audit.");
    console.log("=".repeat(70));
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}PREFLIGHT RESULT: ${failures} CHECK(S) FAILED${RESET}`);
    console.log("Fix the issues above before running the audit.");
    console.log("=".repeat(70));
    process.exit(1);
  }
}

main();
