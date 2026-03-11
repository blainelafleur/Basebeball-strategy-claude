#!/usr/bin/env node
/**
 * Extract SCENARIOS, KNOWLEDGE_MAPS, POS_PRINCIPLES, AI_POS_PRINCIPLES,
 * and BRAIN data from index.jsx → worker/data/knowledge.json
 *
 * Usage: node scripts/extract-scenarios.js
 * Output: worker/data/knowledge.json
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INDEX_JSX = path.join(ROOT, "index.jsx");
const BIBLE_MD = path.join(ROOT, "SCENARIO_BIBLE.md");
const OUTPUT = path.join(ROOT, "worker", "data", "knowledge.json");

// Ensure output directory exists
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

const source = fs.readFileSync(INDEX_JSX, "utf-8");

// ─── 1. Extract SCENARIOS ────────────────────────────────────────────────────

function extractScenarios() {
  // The SCENARIOS object spans from "const SCENARIOS = {" to the matching "};"
  // We'll use a different approach: evaluate the scenarios block in a sandbox
  const scenariosStart = source.indexOf("const SCENARIOS = {");
  if (scenariosStart === -1) throw new Error("Could not find SCENARIOS in index.jsx");

  // Find the closing "};" — it's the first "};" at column 0 after scenariosStart
  let braceDepth = 0;
  let inString = false;
  let stringChar = null;
  let scenariosEnd = -1;

  for (let i = source.indexOf("{", scenariosStart); i < source.length; i++) {
    const ch = source[i];
    const prev = source[i - 1];

    if (inString) {
      if (ch === stringChar && prev !== "\\") inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === "{") braceDepth++;
    if (ch === "}") {
      braceDepth--;
      if (braceDepth === 0) {
        scenariosEnd = i + 1;
        break;
      }
    }
  }

  if (scenariosEnd === -1) throw new Error("Could not find end of SCENARIOS object");

  const scenariosCode = source.slice(source.indexOf("{", scenariosStart), scenariosEnd);

  // Evaluate the object using Function constructor (safe — it's our own code)
  let scenarios;
  try {
    scenarios = new Function(`return (${scenariosCode})`)();
  } catch (e) {
    throw new Error(`Failed to parse SCENARIOS: ${e.message}`);
  }

  // Flatten into array with position key
  const result = [];
  for (const [position, arr] of Object.entries(scenarios)) {
    if (!Array.isArray(arr)) continue;
    for (const s of arr) {
      result.push({
        id: s.id,
        position,
        title: s.title,
        description: s.description,
        options: s.options,
        best: s.best,
        explanations: s.explanations,
        rates: s.rates,
        diff: s.diff,
        concept: s.concept,
        conceptTag: s.conceptTag || null,
        anim: s.anim || null,
        cat: s.cat || null,
        ageMin: s.ageMin || null,
        ageMax: s.ageMax || null,
        situation: s.situation || null
      });
    }
  }

  console.log(`  Extracted ${result.length} scenarios across ${Object.keys(scenarios).length} positions`);
  return result;
}

// ─── 2. Extract KNOWLEDGE_MAPS ──────────────────────────────────────────────

function extractKnowledgeMaps() {
  const maps = {};
  const mapNames = [
    "CUTOFF_RELAY_MAP", "BUNT_DEFENSE_MAP", "FIRST_THIRD_MAP", "BACKUP_MAP",
    "RUNDOWN_MAP", "DP_POSITIONING_MAP", "HIT_RUN_MAP", "PICKOFF_MAP",
    "BALK_MAP", "APPEAL_PLAY_MAP", "PITCH_CLOCK_MAP", "WP_PB_MAP",
    "SQUEEZE_MAP", "INFIELD_FLY_MAP", "OF_COMMUNICATION_MAP",
    "PARK_ENVIRONMENT_MAP", "LEVEL_ADJUSTMENTS_MAP", "POPUP_PRIORITY_MAP",
    "OBSTRUCTION_INTERFERENCE_MAP", "TAGUP_SACRIFICE_FLY_MAP",
    "PITCHING_CHANGE_MAP", "INTENTIONAL_WALK_MAP", "LEGAL_SHIFT_MAP",
    "BASERUNNER_READS_MAP"
  ];

  for (const name of mapNames) {
    const marker = `  ${name}: \``;
    const startIdx = source.indexOf(marker);
    if (startIdx === -1) continue;

    const contentStart = startIdx + marker.length;
    const contentEnd = source.indexOf("`", contentStart);
    if (contentEnd === -1) continue;

    maps[name] = source.slice(contentStart, contentEnd);
  }

  // Also extract MAP_RELEVANCE (which positions each map applies to)
  const relevance = {};
  for (const name of mapNames) {
    const relMarker = `  ${name}:     [`;
    // Search in the relevance section (after the map definitions)
    const relSection = source.indexOf("// MAP_RELEVANCE") !== -1
      ? source.indexOf("// MAP_RELEVANCE")
      : source.indexOf(`${name}:     ['`);

    const relIdx = source.indexOf(`  ${name}:`, Math.max(0, relSection > -1 ? relSection : 0));
    if (relIdx === -1) continue;

    // Check this is in the relevance section (has array of position strings)
    const lineEnd = source.indexOf("\n", relIdx);
    const line = source.slice(relIdx, lineEnd);
    const arrMatch = line.match(/\[([^\]]+)\]/);
    if (arrMatch) {
      const positions = arrMatch[1].match(/'([^']+)'/g);
      if (positions) {
        relevance[name] = positions.map(p => p.replace(/'/g, ""));
      }
    }
  }

  console.log(`  Extracted ${Object.keys(maps).length} knowledge maps`);
  return { maps, relevance };
}

// ─── 3. Extract POS_PRINCIPLES ──────────────────────────────────────────────

function extractPrinciples(constName) {
  const marker = `const ${constName} = {`;
  const blockStart = source.indexOf(marker);
  if (blockStart === -1) return {};

  // Find the closing }
  let braceDepth = 0;
  let blockEnd = -1;
  for (let i = source.indexOf("{", blockStart); i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") braceDepth++;
    if (ch === "}") {
      braceDepth--;
      if (braceDepth === 0) { blockEnd = i + 1; break; }
    }
  }
  if (blockEnd === -1) return {};

  const block = source.slice(source.indexOf("{", blockStart), blockEnd);
  try {
    return new Function(`return (${block})`)();
  } catch (e) {
    console.warn(`  Warning: Could not parse ${constName}: ${e.message}`);
    return {};
  }
}

// ─── 4. Extract BRAIN stats ─────────────────────────────────────────────────

function extractBrainStats() {
  // Extract the stats portion of BRAIN
  const brainStart = source.indexOf("const BRAIN = { stats: {");
  if (brainStart === -1) return {};

  // RE24
  const re24Match = source.match(/RE24:\s*\{([^}]+)\}/);
  const re24 = {};
  if (re24Match) {
    const pairs = re24Match[1].match(/"([^"]+)":\[([^\]]+)\]/g);
    if (pairs) {
      for (const p of pairs) {
        const m = p.match(/"([^"]+)":\[([^\]]+)\]/);
        if (m) re24[m[1]] = m[2].split(",").map(Number);
      }
    }
  }

  // countData
  const countData = {};
  const countBlock = source.match(/countData:\s*\{([\s\S]*?)\},\s*\n\s*steal/);
  if (countBlock) {
    const entries = countBlock[1].match(/"(\d-\d)":\{([^}]+)\}/g);
    if (entries) {
      for (const e of entries) {
        const m = e.match(/"(\d-\d)":\{([^}]+)\}/);
        if (m) {
          const count = m[1];
          const props = {};
          const kvs = m[2].match(/(\w+):([^,}]+)/g);
          if (kvs) {
            for (const kv of kvs) {
              const [k, v] = kv.split(":");
              props[k.trim()] = v.trim().startsWith('"') ? v.trim().replace(/"/g, "") : parseFloat(v.trim()) || v.trim();
            }
          }
          countData[count] = props;
        }
      }
    }
  }

  // stealBreakEven
  const stealMatch = source.match(/stealBreakEven:\s*\{([^}]+)\}/);
  const stealBreakEven = {};
  if (stealMatch) {
    const pairs = stealMatch[1].match(/(\d):([0-9.]+)/g);
    if (pairs) {
      for (const p of pairs) {
        const [k, v] = p.split(":");
        stealBreakEven[k] = parseFloat(v);
      }
    }
  }

  // buntDelta
  const buntMatch = source.match(/buntDelta:\s*\{([^}]+)\}/);
  const buntDelta = {};
  if (buntMatch) {
    const pairs = buntMatch[1].match(/"([^"]+)":(-?[0-9.]+)/g);
    if (pairs) {
      for (const p of pairs) {
        const m = p.match(/"([^"]+)":(-?[0-9.]+)/);
        if (m) buntDelta[m[1]] = parseFloat(m[2]);
      }
    }
  }

  // ttoEffect
  const ttoMatch = source.match(/ttoEffect:\s*\[([^\]]+)\]/);
  const ttoEffect = ttoMatch ? ttoMatch[1].split(",").map(Number) : [];

  console.log(`  Extracted BRAIN stats: RE24 (${Object.keys(re24).length} states), countData (${Object.keys(countData).length} counts), stealBreakEven, buntDelta, ttoEffect`);
  return { RE24: re24, countData, stealBreakEven, buntDelta, ttoEffect };
}

// ─── 5. Extract BRAIN concepts ──────────────────────────────────────────────

function extractBrainConcepts() {
  const conceptsStart = source.indexOf("concepts: {", source.indexOf("const BRAIN"));
  if (conceptsStart === -1) return {};

  // Find closing }
  let depth = 0;
  let end = -1;
  for (let i = source.indexOf("{", conceptsStart); i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end === -1) return {};

  const block = source.slice(source.indexOf("{", conceptsStart), end);
  try {
    return new Function(`return (${block})`)();
  } catch (e) {
    console.warn(`  Warning: Could not parse BRAIN concepts: ${e.message}`);
    return {};
  }
}

// ─── 6. Read SCENARIO_BIBLE.md ──────────────────────────────────────────────

function readScenarioBible() {
  if (!fs.existsSync(BIBLE_MD)) {
    console.warn("  SCENARIO_BIBLE.md not found, skipping");
    return "";
  }
  return fs.readFileSync(BIBLE_MD, "utf-8");
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log("Extracting BSM knowledge from index.jsx...\n");

console.log("1. Scenarios:");
const scenarios = extractScenarios();

console.log("\n2. Knowledge Maps:");
const { maps, relevance } = extractKnowledgeMaps();

console.log("\n3. Position Principles:");
const posPrinciples = extractPrinciples("POS_PRINCIPLES");
console.log(`  Extracted ${Object.keys(posPrinciples).length} POS_PRINCIPLES`);
const aiPosPrinciples = extractPrinciples("AI_POS_PRINCIPLES");
console.log(`  Extracted ${Object.keys(aiPosPrinciples).length} AI_POS_PRINCIPLES`);

console.log("\n4. BRAIN Stats:");
const brainStats = extractBrainStats();

console.log("\n5. BRAIN Concepts:");
const brainConcepts = extractBrainConcepts();
console.log(`  Extracted ${Object.keys(brainConcepts).length} concepts`);

console.log("\n6. Scenario Bible:");
const scenarioBible = readScenarioBible();
console.log(`  Read ${scenarioBible.length} characters`);

// Build output
const knowledge = {
  extractedAt: new Date().toISOString(),
  scenarios,
  knowledgeMaps: maps,
  mapRelevance: relevance,
  posPrinciples,
  aiPosPrinciples,
  brainStats,
  brainConcepts,
  scenarioBible
};

// Write
fs.writeFileSync(OUTPUT, JSON.stringify(knowledge, null, 2));
const sizeMB = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2);
console.log(`\n✅ Written to ${OUTPUT} (${sizeMB} MB)`);
console.log(`   ${scenarios.length} scenarios, ${Object.keys(maps).length} maps, ${Object.keys(posPrinciples).length} principles, ${Object.keys(brainConcepts).length} concepts`);
