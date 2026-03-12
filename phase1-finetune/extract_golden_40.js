#!/usr/bin/env node
/**
 * Extract 40 golden handcrafted scenarios from index.jsx
 * Uses audit-report.json to find Gold-tier (clientScore >= 95) scenario IDs,
 * then extracts full scenario objects from the SCENARIOS data in index.jsx.
 */

const fs = require('fs');
const path = require('path');

// Target distribution
const TARGET = {
  pitcher: 4, catcher: 3, firstBase: 3, secondBase: 3, shortstop: 3,
  thirdBase: 3, leftField: 2, centerField: 2, rightField: 2,
  batter: 4, baserunner: 4, manager: 3, famous: 1, rules: 2, counts: 1
};

// Difficulty targets: ~13 Rookie (1), ~14 Pro (2), ~13 All-Star (3)
const DIFF_TARGET = { 1: 13, 2: 14, 3: 13 };

// 1. Load audit report
const reportPath = path.join(__dirname, 'audit-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Get all gold-tier scenarios (clientScore >= 95), sorted by score desc then issueCount asc
const goldByPosition = {};
report.allResults
  .filter(r => r.clientScore >= 95)
  .sort((a, b) => b.clientScore - a.clientScore || a.issueCount - b.issueCount)
  .forEach(r => {
    if (!goldByPosition[r.position]) goldByPosition[r.position] = [];
    goldByPosition[r.position].push(r);
  });

// 2. Select scenario IDs meeting distribution + difficulty mix
const selected = [];
const diffCounts = { 1: 0, 2: 0, 3: 0 };

for (const [pos, count] of Object.entries(TARGET)) {
  const candidates = goldByPosition[pos] || [];
  if (candidates.length < count) {
    console.error(`WARNING: ${pos} has only ${candidates.length} gold scenarios, need ${count}`);
  }

  // First pass: pick score-100 with best diff distribution
  const picked = [];
  const remaining = [...candidates];

  // Try to get a good difficulty mix
  for (let diff = 1; diff <= 3; diff++) {
    const needed = Math.ceil(count / 3);
    const withDiff = remaining.filter(r => r.diff === diff);
    for (const r of withDiff) {
      if (picked.length >= count) break;
      if (diffCounts[diff] >= DIFF_TARGET[diff] + 2) continue; // allow slight overshoot
      picked.push(r);
      diffCounts[diff]++;
      remaining.splice(remaining.indexOf(r), 1);
    }
  }

  // Fill remaining slots from whatever's left
  while (picked.length < count && remaining.length > 0) {
    const r = remaining.shift();
    picked.push(r);
    diffCounts[r.diff]++;
  }

  selected.push(...picked.slice(0, count));
}

console.log(`Selected ${selected.length} scenarios`);
console.log('Difficulty distribution:', diffCounts);
console.log('By position:', Object.entries(TARGET).map(([p, c]) => {
  const actual = selected.filter(s => s.position === p).length;
  return `${p}:${actual}/${c}`;
}).join(' '));

const selectedIds = new Set(selected.map(s => s.id));

// 3. Parse scenarios from index.jsx
const jsxPath = path.join(__dirname, '..', 'index.jsx');
const jsx = fs.readFileSync(jsxPath, 'utf8');

// Find the SCENARIOS object - it starts around line 11 and goes to ~2800
// We need to extract individual scenario objects by their id
const scenarios = {};

// Map position names from audit report to SCENARIOS keys
const positionToKey = {
  pitcher: 'pitcher', catcher: 'catcher', firstBase: 'firstBase',
  secondBase: 'secondBase', shortstop: 'shortstop', thirdBase: 'thirdBase',
  leftField: 'leftField', centerField: 'centerField', rightField: 'rightField',
  batter: 'batter', baserunner: 'baserunner', manager: 'manager',
  famous: 'famous', rules: 'rules', counts: 'counts'
};

// Extract scenario objects using regex to find each scenario by id
for (const sel of selected) {
  const id = sel.id;
  // Find the scenario object in the JSX - look for id: "xxx" or id:"xxx"
  const idEscaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match from {id: "xxx" to the next }, accounting for nested objects/arrays
  // We need a more robust approach - find the opening { before id: "xxx"
  const idPattern = new RegExp(`id:\\s*["']${idEscaped}["']`);
  const idMatch = idPattern.exec(jsx);

  if (!idMatch) {
    console.error(`Could not find scenario id: ${id}`);
    continue;
  }

  // Walk backward to find the opening {
  let startIdx = idMatch.index;
  while (startIdx > 0 && jsx[startIdx] !== '{') startIdx--;

  // Walk forward counting braces and brackets to find the closing }
  let depth = 0;
  let endIdx = startIdx;
  let inString = false;
  let stringChar = '';

  for (let i = startIdx; i < jsx.length; i++) {
    const ch = jsx[i];
    const prev = i > 0 ? jsx[i - 1] : '';

    if (inString) {
      if (ch === stringChar && prev !== '\\') inString = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === '{' || ch === '[') depth++;
    if (ch === '}' || ch === ']') depth--;

    if (depth === 0) {
      endIdx = i;
      break;
    }
  }

  const objStr = jsx.substring(startIdx, endIdx + 1);

  // Convert JS object literal to JSON
  // Handle: unquoted keys, single quotes, trailing commas
  let jsonStr = objStr
    // Add quotes around unquoted keys (word followed by :)
    .replace(/(\s+)(\w+)\s*:/g, '$1"$2":')
    // Handle keys at start of object
    .replace(/\{(\w+)\s*:/g, '{"$1":')
    // Replace single quotes with double quotes (careful with contractions)
    // First, handle array/object values with single quotes
    .replace(/:\s*'([^']*)'/g, (match, p1) => {
      return ': "' + p1.replace(/"/g, '\\"') + '"';
    })
    // Handle single-quoted strings in arrays
    .replace(/\[\s*'([^']*)'/g, (match, p1) => {
      return '["' + p1.replace(/"/g, '\\"') + '"';
    })
    .replace(/,\s*'([^']*)'/g, (match, p1) => {
      return ',"' + p1.replace(/"/g, '\\"') + '"';
    })
    // Remove trailing commas before } or ]
    .replace(/,\s*([}\]])/g, '$1');

  try {
    const parsed = JSON.parse(jsonStr);
    // Add the cat field and extra fields
    parsed.cat = sel.position;
    parsed.source = 'handcrafted';
    parsed.coachScore = null;
    scenarios[id] = parsed;
  } catch (e) {
    console.error(`Failed to parse scenario ${id}: ${e.message}`);
    // Try with eval as fallback (it's our own trusted code)
    try {
      const parsed = eval('(' + objStr + ')');
      parsed.cat = sel.position;
      parsed.source = 'handcrafted';
      parsed.coachScore = null;
      scenarios[id] = parsed;
    } catch (e2) {
      console.error(`Eval also failed for ${id}: ${e2.message}`);
      console.error('First 200 chars:', objStr.substring(0, 200));
    }
  }
}

// 4. Write JSONL output
const outDir = path.join(__dirname, 'golden_examples');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'handcrafted_40.jsonl');

const lines = [];
for (const sel of selected) {
  const scenario = scenarios[sel.id];
  if (!scenario) {
    console.error(`Missing scenario data for ${sel.id}`);
    continue;
  }
  lines.push(JSON.stringify(scenario));
}

fs.writeFileSync(outPath, lines.join('\n') + '\n');
console.log(`\nWrote ${lines.length} scenarios to ${outPath}`);

// Verify
const diffCheck = { 1: 0, 2: 0, 3: 0 };
const posCheck = {};
lines.forEach(line => {
  const s = JSON.parse(line);
  diffCheck[s.diff]++;
  posCheck[s.cat] = (posCheck[s.cat] || 0) + 1;
});
console.log('Final difficulty distribution:', diffCheck);
console.log('Final position distribution:', posCheck);
