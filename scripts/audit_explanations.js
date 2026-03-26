#!/usr/bin/env node
/**
 * audit_explanations.js
 * Audits all scenario explanations in index.jsx for similarity and length issues.
 *
 * Usage: node scripts/audit_explanations.js
 */

const fs = require('fs');
const path = require('path');

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','to','of','in','for','on',
  'it','and','or','but','that','this','with','you','your','they'
]);

const SIMILARITY_THRESHOLD = 0.50;
const MIN_WORDS = 20;
const MAX_WORDS = 200;

// --- Tokenizer ---
function tokenize(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length > 0 && !STOP_WORDS.has(w));
}

// --- Jaccard similarity ---
function jaccard(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

// --- Word count ---
function wordCount(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// --- Extract scenarios from index.jsx ---
function extractScenarios(source) {
  const scenarios = [];

  // Match id fields - they appear as id:"XX" or id: "XX"
  // Then find the corresponding explanations array
  // Strategy: find each scenario block by locating id:"..." patterns,
  // then extract the explanations array that follows.

  // We'll use a regex to find all explanation arrays with their preceding id.
  // The id pattern: id:"..." or id: "..."
  // The explanations pattern: explanations:[...]

  // First, let's find all id + explanations pairs by scanning character by character
  // for robustness. We'll find each `id:` and then the next `explanations:[`.

  const idRegex = /id:\s*"([^"]+)"/g;
  let idMatch;
  const idPositions = [];

  while ((idMatch = idRegex.exec(source)) !== null) {
    idPositions.push({ id: idMatch[1], pos: idMatch.index });
  }

  for (let i = 0; i < idPositions.length; i++) {
    const { id, pos } = idPositions[i];
    // Search for explanations:[ between this id and the next id (or end of scenarios)
    const searchEnd = i + 1 < idPositions.length ? idPositions[i + 1].pos : pos + 5000;
    const searchSlice = source.substring(pos, searchEnd);

    const explMatch = searchSlice.match(/explanations:\s*\[/);
    if (!explMatch) continue;

    const explStart = pos + explMatch.index + explMatch[0].length;

    // Now extract the 4 strings from the array. They are quoted strings separated by commas.
    // Handle escaped quotes within strings.
    const explanations = [];
    let cursor = explStart;
    let inString = false;
    let currentStr = '';
    let escaped = false;
    let quoteChar = null;

    while (cursor < source.length && explanations.length < 4) {
      const ch = source[cursor];

      if (!inString) {
        if (ch === '"' || ch === "'") {
          inString = true;
          quoteChar = ch;
          currentStr = '';
        } else if (ch === ']') {
          break; // end of array
        }
      } else {
        if (escaped) {
          currentStr += ch;
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
          currentStr += ch;
        } else if (ch === quoteChar) {
          explanations.push(currentStr);
          inString = false;
          quoteChar = null;
        } else {
          currentStr += ch;
        }
      }
      cursor++;
    }

    if (explanations.length === 4) {
      scenarios.push({ id, explanations });
    }
  }

  return scenarios;
}

// --- Main ---
function main() {
  const indexPath = path.resolve(__dirname, '..', 'index.jsx');
  const source = fs.readFileSync(indexPath, 'utf-8');

  const scenarios = extractScenarios(source);

  const similarityIssues = [];
  const lengthIssues = [];

  for (const scenario of scenarios) {
    const { id, explanations } = scenario;
    const tokens = explanations.map(e => tokenize(e));

    // Pairwise similarity (6 pairs for 4 explanations)
    for (let a = 0; a < 4; a++) {
      for (let b = a + 1; b < 4; b++) {
        const sim = jaccard(tokens[a], tokens[b]);
        if (sim > SIMILARITY_THRESHOLD) {
          similarityIssues.push({
            id,
            pair: [a, b],
            similarity: sim,
            expA: explanations[a],
            expB: explanations[b]
          });
        }
      }
    }

    // Length checks
    for (let i = 0; i < 4; i++) {
      const wc = wordCount(explanations[i]);
      if (wc < MIN_WORDS) {
        lengthIssues.push({ id, index: i, words: wc, type: 'short', text: explanations[i] });
      } else if (wc > MAX_WORDS) {
        lengthIssues.push({ id, index: i, words: wc, type: 'long', text: explanations[i] });
      }
    }
  }

  // Collect unique scenario IDs with similarity issues
  const simScenarioIds = new Set(similarityIssues.map(i => i.id));
  const lenScenarioIds = new Set(lengthIssues.map(i => i.id));

  // --- Output ---
  console.log('=== EXPLANATION AUDIT ===');
  console.log(`Total scenarios: ${scenarios.length}`);
  console.log(`Scenarios with high-similarity pairs: ${simScenarioIds.size}`);
  console.log(`Scenarios with length violations: ${lenScenarioIds.size}`);

  if (similarityIssues.length > 0) {
    console.log('\n--- HIGH SIMILARITY ---');
    for (const issue of similarityIssues) {
      console.log(`[${issue.id}] pair (${issue.pair[0]},${issue.pair[1]}) similarity=${issue.similarity.toFixed(2)}`);
      console.log(`  exp[${issue.pair[0]}]: "${issue.expA.substring(0, 80)}${issue.expA.length > 80 ? '...' : ''}"`);
      console.log(`  exp[${issue.pair[1]}]: "${issue.expB.substring(0, 80)}${issue.expB.length > 80 ? '...' : ''}"`);
    }
  }

  if (lengthIssues.length > 0) {
    console.log('\n--- LENGTH VIOLATIONS ---');
    for (const issue of lengthIssues) {
      const label = issue.type === 'short' ? 'too short' : 'too long';
      console.log(`[${issue.id}] exp[${issue.index}]: ${issue.words} words (${label})`);
    }
  }

  if (similarityIssues.length === 0 && lengthIssues.length === 0) {
    console.log('\nNo issues found.');
  }
}

main();
