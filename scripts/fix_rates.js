#!/usr/bin/env node
/**
 * Automatically fix rate sum distributions to be within 145-210 range.
 * Preserves: best answer has highest rate, relative ordering, spread.
 * Target sum: 175 (midpoint of CRITIC's 165-195 range).
 */
const fs = require('fs')
const path = require('path')

const INDEX_PATH = path.join(__dirname, '..', 'index.jsx')
let src = fs.readFileSync(INDEX_PATH, 'utf8')

// Find all scenarios with rates outside 145-210
const ratePattern = /(\{id:"([^"]+)".*?rates:\[(\d+),(\d+),(\d+),(\d+)\])/gs
let match
const fixes = []

while ((match = ratePattern.exec(src)) !== null) {
  const [fullMatch, , id, r0, r1, r2, r3] = match
  const rates = [parseInt(r0), parseInt(r1), parseInt(r2), parseInt(r3)]
  const sum = rates.reduce((a, b) => a + b, 0)

  if (sum >= 145 && sum <= 210) continue // already in range

  // Find best answer index from context
  const bestMatch = src.substring(Math.max(0, match.index - 50), match.index + fullMatch.length + 200)
    .match(/best:(\d)/)
  if (!bestMatch) continue
  const best = parseInt(bestMatch[1])

  // Target sum: 175 (midpoint of CRITIC's 165-195)
  const TARGET = 175
  const scale = TARGET / sum

  // Scale all rates
  let newRates = rates.map(r => Math.round(r * scale))

  // Ensure best is still highest
  const maxNonBest = Math.max(...newRates.filter((_, i) => i !== best))
  if (newRates[best] <= maxNonBest) {
    newRates[best] = maxNonBest + 5
  }

  // Ensure best >= 65 (rateSanity Tier 1 check)
  if (newRates[best] < 65) newRates[best] = 70

  // Ensure no rate below 5 or above 95
  newRates = newRates.map(r => Math.max(5, Math.min(95, r)))

  // Ensure at least one tempting wrong (40-65) — CRITIC item 14
  const nonBestRates = newRates.filter((_, i) => i !== best)
  const hasTempting = nonBestRates.some(r => r >= 35 && r <= 65)
  if (!hasTempting) {
    // Find the highest non-best and bump it to 40
    const highestNonBestIdx = newRates.reduce((maxIdx, r, i) =>
      i !== best && r > (newRates[maxIdx] || 0) ? i : maxIdx,
      best === 0 ? 1 : 0)
    if (newRates[highestNonBestIdx] < 35) newRates[highestNonBestIdx] = 40
  }

  // Ensure worst non-best < 50 (rateSanity Tier 1 check)
  for (let i = 0; i < 4; i++) {
    if (i !== best && newRates[i] >= 50) {
      newRates[i] = 45
    }
  }

  // Re-check best is still highest after adjustments
  const maxOther = Math.max(...newRates.filter((_, i) => i !== best))
  if (newRates[best] <= maxOther) {
    newRates[best] = maxOther + 5
  }

  // Adjust to hit target sum exactly
  let newSum = newRates.reduce((a, b) => a + b, 0)
  const diff = TARGET - newSum
  if (diff !== 0) {
    // Distribute difference across non-best rates
    const nonBestIndices = [0, 1, 2, 3].filter(i => i !== best)
    const perRate = Math.floor(Math.abs(diff) / 3)
    const remainder = Math.abs(diff) % 3
    for (let j = 0; j < nonBestIndices.length; j++) {
      const adj = perRate + (j < remainder ? 1 : 0)
      newRates[nonBestIndices[j]] += diff > 0 ? adj : -adj
      // Keep in bounds
      newRates[nonBestIndices[j]] = Math.max(5, Math.min(45, newRates[nonBestIndices[j]]))
    }
  }

  // Final sum check
  newSum = newRates.reduce((a, b) => a + b, 0)
  // Fine-tune best to hit target
  newRates[best] += (TARGET - newSum)
  newRates[best] = Math.max(65, Math.min(95, newRates[best]))

  const finalSum = newRates.reduce((a, b) => a + b, 0)

  fixes.push({
    id,
    oldRates: rates,
    newRates,
    oldSum: sum,
    newSum: finalSum,
    best
  })
}

console.log(`Found ${fixes.length} scenarios needing rate fixes`)

// Apply fixes
let applied = 0
for (const fix of fixes) {
  const oldStr = `rates:[${fix.oldRates.join(',')}]`
  const newStr = `rates:[${fix.newRates.join(',')}]`

  if (src.includes(oldStr)) {
    // Make sure we're replacing in the right scenario
    const idx = src.indexOf(`id:"${fix.id}"`)
    if (idx === -1) continue
    const rateIdx = src.indexOf(oldStr, idx)
    if (rateIdx === -1) continue
    // Only replace if the rates are within ~500 chars of the id (same scenario)
    if (rateIdx - idx > 2000) continue

    src = src.substring(0, rateIdx) + newStr + src.substring(rateIdx + oldStr.length)
    applied++
    console.log(`  [${fix.id}] ${fix.oldRates} (sum=${fix.oldSum}) → ${fix.newRates} (sum=${fix.newSum})`)
  }
}

fs.writeFileSync(INDEX_PATH, src)
console.log(`\nApplied ${applied} rate fixes`)
