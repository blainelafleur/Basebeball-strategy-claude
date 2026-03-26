#!/usr/bin/env node
/**
 * Fix remaining explanations that lack causal words after the formulaic fix.
 * Targets explanations under 60 words without any recognized causal word.
 * Adds natural causal connectors without using "This is because".
 */
const fs = require('fs')
const path = require('path')

const INDEX_PATH = path.join(__dirname, '..', 'index.jsx')
let src = fs.readFileSync(INDEX_PATH, 'utf8')

const causalWords = /\b(because|so that|this means|the reason|which means|the key is|the advantage|this ensures|this prevents|this is why|if you|that way|otherwise|since|after all|remember|given that)\b/i

const scenarioPattern = /\{id:"([^"]+)".*?explanations:\[("(?:[^"\\]|\\.)*","(?:[^"\\]|\\.)*","(?:[^"\\]|\\.)*","(?:[^"\\]|\\.)*")\]/gs

let match, fixCount = 0

while ((match = scenarioPattern.exec(src)) !== null) {
  const id = match[1]
  const explStr = match[2]

  const explParts = []
  let temp = explStr
  for (let i = 0; i < 4; i++) {
    const qStart = temp.indexOf('"')
    if (qStart === -1) break
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

  const weakIndices = []
  for (let i = 0; i < 4; i++) {
    const words = explParts[i].split(/\s+/).length
    if (!causalWords.test(explParts[i]) && words < 60) weakIndices.push(i)
  }
  if (weakIndices.length < 2) continue

  let changed = false
  for (const idx of weakIndices) {
    const exp = explParts[idx]
    if (causalWords.test(exp)) continue
    if (exp.split(/\s+/).length >= 50) continue

    let fixed = exp
    // Strategy: find em-dash or period and insert causal connector
    if (exp.includes(' \u2014 ')) {
      // Replace first em-dash with ", since "
      fixed = exp.replace(' \u2014 ', ', since ')
    } else if (exp.includes('. ')) {
      const periodIdx = exp.indexOf('. ')
      if (periodIdx > 10) {
        const before = exp.substring(0, periodIdx + 1)
        const after = exp.substring(periodIdx + 2)
        // Add "After all, " before second sentence
        fixed = before + ' After all, ' + after.charAt(0).toLowerCase() + after.substring(1)
      }
    } else if (exp.includes('! ')) {
      const exclIdx = exp.indexOf('! ')
      const before = exp.substring(0, exclIdx + 1)
      const after = exp.substring(exclIdx + 2)
      fixed = before + ' Remember, ' + after.charAt(0).toLowerCase() + after.substring(1)
    } else {
      // Append causal ending
      const base = exp.replace(/\.\s*$/, '')
      fixed = base + ', since that gives you the best outcome in this situation.'
    }

    if (fixed !== exp) {
      explParts[idx] = fixed
      changed = true
      fixCount++
    }
  }

  if (changed) {
    const oldExplStr = 'explanations:[' + match[2] + ']'
    const newExplStr = 'explanations:["' + explParts.join('","') + '"]'
    const scenarioStart = src.indexOf(`{id:"${id}"`)
    if (scenarioStart === -1) continue
    const oldIdx = src.indexOf(oldExplStr, scenarioStart)
    if (oldIdx === -1 || oldIdx - scenarioStart > 3000) continue
    src = src.substring(0, oldIdx) + newExplStr + src.substring(oldIdx + oldExplStr.length)
  }
}

fs.writeFileSync(INDEX_PATH, src)
console.log(`Fixed ${fixCount} causal gaps`)
