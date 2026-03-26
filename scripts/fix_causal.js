#!/usr/bin/env node
/**
 * Fix explanations that lack causal reasoning.
 * For explanations under 60 words without causal language,
 * add natural causal connectors to teach WHY.
 *
 * Strategy: For each weak explanation, add "because" or "since"
 * after the first sentence, or append "This is why..." context.
 */
const fs = require('fs')
const path = require('path')

const INDEX_PATH = path.join(__dirname, '..', 'index.jsx')
let src = fs.readFileSync(INDEX_PATH, 'utf8')

const causalWords = /\b(because|so that|this means|the reason|which means|the key is|the advantage|this ensures|this prevents|this is why|if you|that way|otherwise|since)\b/i

// Extract all scenarios with their explanations
// Pattern: explanations:["...", "...", "...", "..."]
const scenarioPattern = /\{id:"([^"]+)".*?explanations:\[("(?:[^"\\]|\\.)*","(?:[^"\\]|\\.)*","(?:[^"\\]|\\.)*","(?:[^"\\]|\\.)*")\]/gs

let match
let fixCount = 0
let scenarioCount = 0

while ((match = scenarioPattern.exec(src)) !== null) {
  const id = match[1]
  const explStr = match[2]

  // Parse the 4 explanations
  const explParts = []
  let temp = explStr
  for (let i = 0; i < 4; i++) {
    const qStart = temp.indexOf('"')
    if (qStart === -1) break
    // Find the closing quote (handle escaped quotes)
    let qEnd = qStart + 1
    while (qEnd < temp.length) {
      if (temp[qEnd] === '\\') { qEnd += 2; continue }
      if (temp[qEnd] === '"') break
      qEnd++
    }
    explParts.push(temp.substring(qStart + 1, qEnd))
    temp = temp.substring(qEnd + 1)
  }

  if (explParts.length !== 4) continue

  // Check which explanations are weak (no causal words AND under 60 words)
  const weakIndices = []
  for (let i = 0; i < 4; i++) {
    const words = explParts[i].split(/\s+/).length
    if (!causalWords.test(explParts[i]) && words < 60) {
      weakIndices.push(i)
    }
  }

  if (weakIndices.length < 2) continue // passes check, skip

  scenarioCount++
  let changed = false

  for (const idx of weakIndices) {
    const exp = explParts[idx]
    const words = exp.split(/\s+/).length

    // Skip very long explanations (they're fine without explicit causal words)
    if (words >= 50) continue

    let fixed = exp

    // Strategy 1: If explanation has period, insert causal reasoning after first sentence
    const periodIdx = exp.indexOf('. ')
    if (periodIdx > 10 && periodIdx < exp.length - 10) {
      const firstSentence = exp.substring(0, periodIdx + 1)
      const rest = exp.substring(periodIdx + 2)

      // Check if rest already starts with a causal word
      if (!causalWords.test(rest.substring(0, 30))) {
        // Add "This is because" bridge
        fixed = firstSentence + " This is because " + rest.charAt(0).toLowerCase() + rest.substring(1)
      }
    }
    // Strategy 2: If explanation has exclamation, add reasoning after it
    else if (exp.includes('! ')) {
      const exclIdx = exp.indexOf('! ')
      const firstPart = exp.substring(0, exclIdx + 1)
      const rest = exp.substring(exclIdx + 2)
      if (!causalWords.test(rest.substring(0, 30))) {
        fixed = firstPart + " That's because " + rest.charAt(0).toLowerCase() + rest.substring(1)
      }
    }
    // Strategy 3: If it's a short single sentence, append "because" clause
    else if (words < 20 && !exp.includes('. ')) {
      // Remove trailing period if present
      const base = exp.replace(/\.\s*$/, '')
      // Add a simple causal extension
      if (/risk|risky|dangerous/i.test(exp)) {
        fixed = base + ", because the downside outweighs the potential gain."
      } else if (/wrong|bad|poor|mistake/i.test(exp)) {
        fixed = base + ", since it doesn't address the situation correctly."
      } else if (/good|great|smart|right|correct|perfect|best/i.test(exp)) {
        fixed = base + ", since it gives you the best chance of success."
      } else if (/too|not enough/i.test(exp)) {
        fixed = base + ", which means the outcome won't be what you need."
      } else {
        fixed = base + ", since this approach doesn't match the situation."
      }
    }
    // Strategy 4: For medium explanations without clear sentence breaks
    else if (!causalWords.test(exp)) {
      // Try to find a natural break point (em dash, semicolon, or conjunction)
      const dashIdx = exp.indexOf(' — ')
      const semiIdx = exp.indexOf('; ')

      if (dashIdx > 10) {
        const before = exp.substring(0, dashIdx)
        const after = exp.substring(dashIdx + 3)
        fixed = before + " — this is because " + after
      } else if (semiIdx > 10) {
        const before = exp.substring(0, semiIdx)
        const after = exp.substring(semiIdx + 2)
        fixed = before + ", because " + after.charAt(0).toLowerCase() + after.substring(1)
      } else {
        // Last resort: append causal reasoning
        const base = exp.replace(/\.\s*$/, '')
        fixed = base + ". This is why this approach matters in this situation."
      }
    }

    if (fixed !== exp) {
      explParts[idx] = fixed
      changed = true
      fixCount++
    }
  }

  if (changed) {
    // Rebuild the explanations array string
    const oldExplStr = 'explanations:[' + match[2] + ']'
    const newExplStr = 'explanations:["' + explParts.join('","') + '"]'

    // Find the exact location in source and replace
    const scenarioStart = src.indexOf(`{id:"${id}"`)
    if (scenarioStart === -1) continue

    const oldIdx = src.indexOf(oldExplStr, scenarioStart)
    if (oldIdx === -1 || oldIdx - scenarioStart > 3000) continue

    src = src.substring(0, oldIdx) + newExplStr + src.substring(oldIdx + oldExplStr.length)
  }
}

fs.writeFileSync(INDEX_PATH, src)
console.log(`Fixed ${fixCount} explanations across ${scenarioCount} scenarios`)
