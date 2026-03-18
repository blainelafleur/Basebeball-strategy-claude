#!/usr/bin/env node
/**
 * validate_firewall.js — Run QUALITY_FIREWALL.validate() on all handcrafted scenarios
 *
 * Extracts SCENARIOS, BRAIN, SEMANTIC_OVERLAPS, QUALITY_FIREWALL, and helper functions
 * from index.jsx, then runs every check on every scenario.
 *
 * Usage:
 *   node scripts/validate_firewall.js
 *
 * Exit code:
 *   0 — no Tier 1 failures
 *   1 — one or more Tier 1 failures found
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INDEX_JSX = path.join(ROOT, "index.jsx");

// ─── Robust balanced-delimiter extractor ────────────────────────────────────
// Handles strings, template literals, line/block comments, regex literals,
// and character classes inside regex — so braces in /regex{2}/ don't break
// the depth counter.
function extractBalanced(source, startIdx, openCh, closeCh) {
  let depth = 0;
  let i = startIdx;
  while (i < source.length) {
    const ch = source[i];
    // Line comment
    if (ch === "/" && source[i + 1] === "/") {
      const eol = source.indexOf("\n", i);
      i = eol === -1 ? source.length : eol + 1;
      continue;
    }
    // Block comment
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }
    // String literals (single/double quote)
    if (ch === '"' || ch === "'") {
      i++;
      while (i < source.length) {
        if (source[i] === "\\") { i += 2; continue; }
        if (source[i] === ch) { i++; break; }
        i++;
      }
      continue;
    }
    // Template literals
    if (ch === "`") {
      i++;
      while (i < source.length) {
        if (source[i] === "\\") { i += 2; continue; }
        if (source[i] === "`") { i++; break; }
        i++;
      }
      continue;
    }
    // Regex literal — detect by checking the preceding non-whitespace char
    if (ch === "/") {
      let j = i - 1;
      while (j >= 0 && /\s/.test(source[j])) j--;
      const prevCh = j >= 0 ? source[j] : "";
      const isRegex = "=({,;:!&|?[~^%+->".includes(prevCh) || prevCh === "" ||
        (j >= 5 && /(?:return|typeof|delete|void|throw|new|in)$/.test(source.slice(j - 5, j + 1)));
      if (isRegex) {
        i++; // skip opening /
        while (i < source.length) {
          if (source[i] === "\\") { i += 2; continue; }
          if (source[i] === "/") { i++; while (i < source.length && /[gimsuvy]/.test(source[i])) i++; break; }
          if (source[i] === "[") { // character class — skip to ]
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

// Find `const NAME = {` and return the balanced object literal.
function extractObject(source, constName) {
  const needle = `const ${constName} = {`;
  const start = source.indexOf(needle);
  if (start === -1) throw new Error(`Could not find '${needle}' in index.jsx`);
  return extractBalanced(source, source.indexOf("{", start), "{", "}");
}

// Find `const NAME = [` and return the balanced array literal.
function extractArray(source, constName) {
  const needle = `const ${constName} = [`;
  const start = source.indexOf(needle);
  if (start === -1) throw new Error(`Could not find '${needle}' in index.jsx`);
  return extractBalanced(source, source.indexOf("[", start), "[", "]");
}

// Find `function NAME(` and return the full function declaration.
function extractFunction(source, fnName) {
  const needle = `function ${fnName}(`;
  const start = source.indexOf(needle);
  if (start === -1) throw new Error(`Could not find 'function ${fnName}' in index.jsx`);
  const braceStart = source.indexOf("{", start);
  const body = extractBalanced(source, braceStart, "{", "}");
  return source.slice(start, braceStart) + body;
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log("Reading index.jsx...");
  const source = fs.readFileSync(INDEX_JSX, "utf-8");

  // 1. Extract SCENARIOS (reuses critic_audit.js approach)
  console.log("Extracting SCENARIOS...");
  const scenariosCode = extractObject(source, "SCENARIOS");
  let SCENARIOS;
  try { SCENARIOS = new Function(`return (${scenariosCode})`)(); }
  catch (e) { throw new Error(`Failed to parse SCENARIOS: ${e.message}`); }

  // Flatten into array with position metadata
  const scenarios = [];
  for (const [position, arr] of Object.entries(SCENARIOS)) {
    if (!Array.isArray(arr)) continue;
    for (const s of arr) {
      scenarios.push({ ...s, _position: position });
    }
  }
  console.log(`  Found ${scenarios.length} scenarios across ${Object.keys(SCENARIOS).length} positions`);

  // 2. Extract BRAIN (needed by brainContradiction check)
  console.log("Extracting BRAIN...");
  const brainCode = extractObject(source, "BRAIN");

  // 3. Extract helper functions (runnersKey, getRunExpectancy)
  console.log("Extracting helper functions...");
  const runnersKeyCode = extractFunction(source, "runnersKey");
  const getRunExpectancyCode = extractFunction(source, "getRunExpectancy");

  // 4. Extract SEMANTIC_OVERLAPS (needed by tier2.optionOverlap)
  console.log("Extracting SEMANTIC_OVERLAPS...");
  const semanticOverlapsCode = extractArray(source, "SEMANTIC_OVERLAPS");

  // 5. Extract QUALITY_FIREWALL
  console.log("Extracting QUALITY_FIREWALL...");
  const firewallCode = extractObject(source, "QUALITY_FIREWALL");

  // 6. Build a self-contained evaluation environment
  // We construct a function scope with all the dependencies, then return QUALITY_FIREWALL.
  console.log("Building evaluation environment...");
  const envCode = `
    const BRAIN = (${brainCode});
    const SEMANTIC_OVERLAPS = (${semanticOverlapsCode});
    ${runnersKeyCode}
    ${getRunExpectancyCode}
    const QUALITY_FIREWALL = (${firewallCode});
    return QUALITY_FIREWALL;
  `;

  let QUALITY_FIREWALL;
  try {
    QUALITY_FIREWALL = new Function(envCode)();
  } catch (e) {
    throw new Error(`Failed to build evaluation environment: ${e.message}`);
  }

  // Verify validate function exists
  if (typeof QUALITY_FIREWALL.validate !== "function") {
    throw new Error("QUALITY_FIREWALL.validate is not a function");
  }

  // 7. Run QUALITY_FIREWALL.validate() on every scenario
  console.log("\nRunning QUALITY_FIREWALL on all scenarios...\n");

  const tier1Failures = [];
  const tier2Warnings = [];
  const tier3Suggestions = [];
  const checkCounts = {};       // checkName -> count
  let totalChecked = 0;

  for (const scenario of scenarios) {
    const position = scenario._position;
    let result;
    try {
      result = QUALITY_FIREWALL.validate(scenario, position);
    } catch (e) {
      tier1Failures.push({
        id: scenario.id,
        position,
        check: "VALIDATE_ERROR",
        message: `validate() threw: ${e.message}`,
      });
      totalChecked++;
      continue;
    }

    totalChecked++;

    for (const fail of result.tier1Fails) {
      tier1Failures.push({ id: scenario.id, position, check: fail.check, message: fail.message });
      checkCounts[`T1:${fail.check}`] = (checkCounts[`T1:${fail.check}`] || 0) + 1;
    }
    for (const warn of result.tier2Warns) {
      tier2Warnings.push({ id: scenario.id, position, check: warn.check, message: warn.message });
      checkCounts[`T2:${warn.check}`] = (checkCounts[`T2:${warn.check}`] || 0) + 1;
    }
    for (const sug of result.tier3Suggestions) {
      tier3Suggestions.push({ id: scenario.id, position, check: sug.check, message: sug.message });
      checkCounts[`T3:${sug.check}`] = (checkCounts[`T3:${sug.check}`] || 0) + 1;
    }
  }

  // 8. Report
  console.log("=".repeat(70));
  console.log("QUALITY FIREWALL VALIDATION REPORT");
  console.log("=".repeat(70));
  console.log(`Total scenarios checked: ${totalChecked}`);
  console.log(`Tier 1 failures:         ${tier1Failures.length}${tier1Failures.length === 0 ? " (PASS)" : " (FAIL)"}`);
  console.log(`Tier 2 warnings:         ${tier2Warnings.length}${tier2Warnings.length < 50 ? " (within target)" : " (exceeds target of <50)"}`);
  console.log(`Tier 3 suggestions:      ${tier3Suggestions.length} (informational)`);
  console.log("=".repeat(70));

  // Tier 1 details
  if (tier1Failures.length > 0) {
    console.log("\n--- TIER 1 FAILURES (must fix) ---");
    for (const f of tier1Failures) {
      console.log(`  [${f.id}] ${f.position.padEnd(14)} ${f.check}: ${f.message}`);
    }
  }

  // Tier 2 details
  if (tier2Warnings.length > 0) {
    console.log("\n--- TIER 2 WARNINGS (should review) ---");
    for (const w of tier2Warnings) {
      console.log(`  [${w.id}] ${w.position.padEnd(14)} ${w.check}: ${w.message}`);
    }
  }

  // Tier 3 details
  if (tier3Suggestions.length > 0) {
    console.log("\n--- TIER 3 SUGGESTIONS (informational) ---");
    for (const s of tier3Suggestions) {
      console.log(`  [${s.id}] ${s.position.padEnd(14)} ${s.check}: ${s.message}`);
    }
  }

  // Summary counts by check name
  const sortedCounts = Object.entries(checkCounts).sort((a, b) => b[1] - a[1]);
  if (sortedCounts.length > 0) {
    console.log("\n--- SUMMARY BY CHECK ---");
    for (const [name, count] of sortedCounts) {
      console.log(`  ${name.padEnd(40)} ${count}`);
    }
  }

  console.log("\n" + "=".repeat(70));

  // Exit code
  if (tier1Failures.length > 0) {
    console.log(`RESULT: FAIL — ${tier1Failures.length} Tier 1 failure(s) found`);
    process.exit(1);
  } else {
    console.log("RESULT: PASS — no Tier 1 failures");
    process.exit(0);
  }
}

main();
