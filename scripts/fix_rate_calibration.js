#!/usr/bin/env node
/**
 * Fix rateCalibration warnings:
 * - Best rate should be 70-90 (not >90)
 * - Worst non-best rate should be <=35
 * While keeping rateSumRange satisfied (145-210).
 */
const fs = require('fs')
const path = require('path')

const INDEX_PATH = path.join(__dirname, '..', 'index.jsx')
let src = fs.readFileSync(INDEX_PATH, 'utf8')

const ratePattern = /\{id:"([^"]+)".*?best:(\d).*?rates:\[(\d+),(\d+),(\d+),(\d+)\]/gs
let match
let fixCount = 0

while ((match = ratePattern.exec(src)) !== null) {
  const [fullMatch, id, bestStr, r0, r1, r2, r3] = match
  const best = parseInt(bestStr)
  let rates = [parseInt(r0), parseInt(r1), parseInt(r2), parseInt(r3)]
  const sum = rates.reduce((a, b) => a + b, 0)

  let needsFix = false
  // Check: best rate > 90
  if (rates[best] > 90) needsFix = true
  // Check: best rate < 70
  if (rates[best] < 70) needsFix = true
  // Check: worst non-best > 35
  const nonBestRates = rates.filter((_, i) => i !== best)
  if (Math.min(...nonBestRates) > 35) needsFix = true

  if (!needsFix) continue

  const oldRates = [...rates]

  // Step 1: Cap best at 85 (safe middle of 70-90)
  if (rates[best] > 90) rates[best] = 85
  if (rates[best] < 70) rates[best] = 75

  // Step 2: Ensure at least one tempting wrong (35-45 range)
  // and worst non-best <= 35
  const nonBestIndices = [0, 1, 2, 3].filter(i => i !== best)

  // Sort non-best by current rate (descending) to assign: tempting, medium, low
  nonBestIndices.sort((a, b) => rates[b] - rates[a])

  // Assign target ranges: highest non-best = tempting (35-45), others lower
  const targets = [40, 25, 15] // tempting, medium, low
  for (let j = 0; j < nonBestIndices.length; j++) {
    const idx = nonBestIndices[j]
    // Try to keep relative ordering but within bounds
    let target = targets[j]
    rates[idx] = target
  }

  // Step 3: Check sum and adjust
  let newSum = rates.reduce((a, b) => a + b, 0)
  const TARGET = 170

  if (newSum !== TARGET) {
    const diff = TARGET - newSum
    // Adjust best rate to hit target (within 70-90)
    rates[best] += diff
    if (rates[best] > 90) {
      const excess = rates[best] - 85
      rates[best] = 85
      // Distribute excess to non-best
      for (let j = 0; j < nonBestIndices.length && excess > 0; j++) {
        const add = Math.min(Math.floor(excess / (3 - j)), 35 - rates[nonBestIndices[j]])
        if (add > 0) rates[nonBestIndices[j]] += add
      }
    }
    if (rates[best] < 70) {
      const deficit = 75 - rates[best]
      rates[best] = 75
      // Take from non-best
      for (let j = nonBestIndices.length - 1; j >= 0 && deficit > 0; j--) {
        const sub = Math.min(deficit, rates[nonBestIndices[j]] - 5)
        if (sub > 0) rates[nonBestIndices[j]] -= sub
      }
    }
  }

  // Ensure all within bounds
  rates = rates.map(r => Math.max(5, Math.min(90, r)))
  // Re-ensure best is highest
  const maxOther = Math.max(...rates.filter((_, i) => i !== best))
  if (rates[best] <= maxOther) rates[best] = Math.min(90, maxOther + 5)

  newSum = rates.reduce((a, b) => a + b, 0)

  // Only apply if we actually changed something AND still in sum range
  if (JSON.stringify(oldRates) !== JSON.stringify(rates) && newSum >= 145 && newSum <= 210) {
    const oldStr = `rates:[${oldRates.join(',')}]`
    const newStr = `rates:[${rates.join(',')}]`

    const scenarioStart = src.indexOf(`{id:"${id}"`)
    if (scenarioStart === -1) continue
    const rateIdx = src.indexOf(oldStr, scenarioStart)
    if (rateIdx === -1 || rateIdx - scenarioStart > 3000) continue

    src = src.substring(0, rateIdx) + newStr + src.substring(rateIdx + oldStr.length)
    fixCount++
  }
}

fs.writeFileSync(INDEX_PATH, src)
console.log(`Applied ${fixCount} rate calibration fixes`)
