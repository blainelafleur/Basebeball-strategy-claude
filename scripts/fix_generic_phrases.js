#!/usr/bin/env node
/**
 * Remove generic filler phrases injected by earlier fix scripts.
 * These phrases add no teaching value and the CRITIC penalizes them.
 */
const fs = require('fs')
const path = require('path')

const INDEX_PATH = path.join(__dirname, '..', 'index.jsx')
let src = fs.readFileSync(INDEX_PATH, 'utf8')

const before = src.length
let count = 0

// Remove appended generic endings (these were added by fix_causal.js Strategy 3)
const genericEndings = [
  /, since this approach doesn't match the situation\./g,
  /, since it doesn't address the situation correctly\./g,
  /, since that gives you the best outcome in this situation\./g,
  /\. This is why this approach matters in this situation\./g,
]
for (const re of genericEndings) {
  const matches = src.match(re)
  if (matches) {
    count += matches.length
    src = src.replace(re, '.')
  }
}

// Fix ". The reason: X" fragments — merge back into previous sentence
// ". The reason: foo" → ", because foo"
let safety = 0
while (/\. The reason: /i.test(src) && safety < 500) {
  src = src.replace(/\. The reason: /i, ', because ')
  count++
  safety++
}

// Fix "The reason is " at sentence start that creates awkward flow
// Only fix if followed by lowercase (indicates mid-thought)
safety = 0
while (/\. The reason is (?=[a-z])/i.test(src) && safety < 500) {
  src = src.replace(/\. The reason is (?=[a-z])/i, ', because ')
  count++
  safety++
}

fs.writeFileSync(INDEX_PATH, src)
console.log(`Removed/fixed ${count} generic phrases`)
console.log(`File size: ${before} → ${src.length} (${src.length - before} chars)`)

// Verify
const remaining = (src.match(/doesn't match the situation|doesn't address the situation|The reason:/gi) || []).length
console.log(`Remaining problematic phrases: ${remaining}`)
