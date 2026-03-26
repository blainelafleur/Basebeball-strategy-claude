#!/usr/bin/env node
/**
 * Fix grammatical fragments where "because/since" is followed by a bare verb.
 * e.g., "because keep him guessing" → "because you keep him guessing"
 *       "since throw a strike" → "since you need to throw a strike"
 */
const fs = require('fs')
const path = require('path')

const INDEX_PATH = path.join(__dirname, '..', 'index.jsx')
let src = fs.readFileSync(INDEX_PATH, 'utf8')

const verbs = 'keep|throw|make|get|put|hold|take|let|expand|attack|channel|adapt|watch|use|adjust|focus|set|stay|protect|just|drive|hit|wait|run|try|score|field|bunt|play|swing|think|trust|call|step|check|look|give|sit|stop|stand|pull|send|charge|sprint|tag|flip|fire|aim|catch|block|cover|read|move|turn|have|leave|add|bring|come|force|push|work|break|yOU'

// Pattern: "because/since" + bare verb (no "you/the/a/it/this/that/he/she/they/we/your/their" before verb)
const pattern = new RegExp(`(because|since) (${verbs})`, 'g')

let count = 0
src = src.replace(pattern, (match, conj, verb) => {
  count++
  // Fix capitalization issue
  if (verb === 'yOU') return `${conj} you`
  // Add "you" or "you need to" depending on the verb
  if (['don', 'just', 'not'].includes(verb)) return `${conj} you ${verb}`
  return `${conj} you ${verb}`
})

fs.writeFileSync(INDEX_PATH, src)
console.log(`Fixed ${count} grammar fragments (because/since + bare verb → + "you")`)

// Also fix "After all, adjust!." and similar
let src2 = fs.readFileSync(INDEX_PATH, 'utf8')
let count2 = 0
// Fix "After all, verb!" patterns that are fragments
src2 = src2.replace(/After all, (\w+)!\./g, (m, verb) => { count2++; return `After all, you should ${verb}.` })
// Fix "Remember, verb" that are fragments
src2 = src2.replace(/Remember, (\w+) /g, (m, verb) => {
  if (['the', 'a', 'an', 'your', 'this', 'that', 'it', 'when', 'if', 'even', 'every', 'once', 'in', 'on', 'at', 'not', 'you'].includes(verb.toLowerCase())) return m
  count2++
  return `Remember, you ${verb} `
})

fs.writeFileSync(INDEX_PATH, src2)
console.log(`Fixed ${count2} additional fragment patterns`)
