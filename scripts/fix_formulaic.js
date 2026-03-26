#!/usr/bin/env node
/**
 * Replace formulaic "This is because" / "That's because" patterns
 * with natural alternatives. Rotates through multiple replacements
 * to avoid monotony.
 */
const fs = require('fs')
const path = require('path')

const INDEX_PATH = path.join(__dirname, '..', 'index.jsx')
let src = fs.readFileSync(INDEX_PATH, 'utf8')

// Natural alternatives that teach just as well
const replacements = [
  // For "This is because X" → just use "because" inline or rephrase
  { from: /\. This is because /g, to: [
    ", because ", ", since ", ". The reason: ", " — ", ", which means ",
  ]},
  { from: /\. That's because /g, to: [
    ", because ", ", since ", " — that's why ", " — ", ". After all, ",
  ]},
  { from: /This is because /g, to: [  // sentence start
    "The reason is ", "After all, ", "Since ", "Remember, ",
  ]},
  { from: /That's because /g, to: [
    "The reason is ", "After all, ", "Since ", "Remember, ",
  ]},
  // Also fix "this is because" (lowercase mid-sentence)
  { from: /this is because /g, to: [
    "since ", "because ", "as ", "given that ",
  ]},
  { from: /that's because /g, to: [
    "since ", "because ", "as ", "given that ",
  ]},
  // Fix "This is why" at start of sentence after period (less formulaic but still clunky)
  { from: /\. This is why /g, to: [
    " — that's why ", ", which is why ", ". And that's why ", ". So ",
  ]},
]

let totalFixes = 0

for (const rule of replacements) {
  let idx = 0
  const alts = rule.to
  let match

  // Use a while loop with indexOf to replace each occurrence with rotating alternatives
  const pattern = rule.from.source.replace(/\\/g, '\\')
  const flags = rule.from.flags.replace('g', '')
  const regex = new RegExp(rule.from.source, flags) // non-global for one-at-a-time

  let safety = 0
  while (regex.test(src) && safety < 2000) {
    const alt = alts[idx % alts.length]
    src = src.replace(regex, alt)
    idx++
    totalFixes++
    safety++
  }
}

fs.writeFileSync(INDEX_PATH, src)
console.log(`Replaced ${totalFixes} formulaic patterns with natural alternatives`)

// Verify
const remaining = (src.match(/This is because|That's because/gi) || []).length
console.log(`Remaining "This is because" / "That's because": ${remaining}`)
