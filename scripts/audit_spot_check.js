#!/usr/bin/env node
/**
 * Spot-check re-audit of specific scenarios.
 * Reads failing IDs from audit_full_results.json, re-scores them with current index.jsx content.
 * Usage: ADMIN_KEY=xxx node scripts/audit_spot_check.js
 */
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const SCRIPTS = path.join(__dirname)
const ROOT = path.join(__dirname, '..')
const ADMIN_KEY = process.env.ADMIN_KEY
if (!ADMIN_KEY) { console.error('ADMIN_KEY required'); process.exit(1) }

const WORKER_URL = 'https://bsm-ai-proxy.blafleur.workers.dev/admin/audit-scenario'
const BATCH_SIZE = 3
const BATCH_DELAY = 4000
const MAX_RETRIES = 5

// Load enhanced prompt
const systemPrompt = fs.readFileSync(path.join(SCRIPTS, 'audit_enhanced_prompt.txt'), 'utf8')

// Load previous results to get failing IDs
const prevResults = JSON.parse(fs.readFileSync(path.join(SCRIPTS, 'audit_full_results.json'), 'utf8'))
const failIds = new Set(prevResults.results.filter(r => !r.passed && !r.error).map(r => r.id))
console.log(`Found ${failIds.size} failing scenarios to re-check`)

// Extract scenarios from index.jsx
const indexSrc = fs.readFileSync(path.join(ROOT, 'index.jsx'), 'utf8')

function extractScenarios(src) {
  const scenarios = []
  const positionPattern = /^\s*(pitcher|batter|baserunner|manager|catcher|famous|rules|counts|firstBase|secondBase|thirdBase|shortstop|leftField|centerField|rightField)\s*:\s*\[/gm
  let match
  while ((match = positionPattern.exec(src)) !== null) {
    const position = match[1]
    let depth = 1, i = match.index + match[0].length
    let objStart = -1
    while (i < src.length && depth > 0) {
      if (src[i] === '{' && objStart === -1) objStart = i
      if (src[i] === '{') depth++
      if (src[i] === '}') {
        depth--
        if (depth === 1 && objStart !== -1) {
          try {
            const objStr = src.substring(objStart, i + 1)
              .replace(/(\w+):/g, '"$1":')
              .replace(/'/g, '"')
              .replace(/,\s*}/g, '}')
              .replace(/,\s*]/g, ']')
            // Skip — too complex for JSON parse, use eval-like approach
          } catch(e) {}
          objStart = -1
        }
      }
      if (src[i] === '[') depth++
      if (src[i] === ']') depth--
      i++
    }
  }
  return scenarios
}

// Simpler extraction: use regex to find scenario objects by ID
function findScenario(src, id, position) {
  const idPattern = new RegExp(`\\{id:"${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`)
  const idx = src.indexOf(`{id:"${id}"`)
  if (idx === -1) return null

  // Find the end of this object by counting braces
  let depth = 0, i = idx
  while (i < src.length) {
    if (src[i] === '{') depth++
    if (src[i] === '}') { depth--; if (depth === 0) break }
    i++
  }
  const objStr = src.substring(idx, i + 1)

  // Extract fields with regex
  const get = (field) => {
    const m = objStr.match(new RegExp(`${field}:"([^"]*?)"`))
    return m ? m[1] : null
  }
  const getNum = (field) => {
    const m = objStr.match(new RegExp(`${field}:(\\d+)`))
    return m ? parseInt(m[1]) : null
  }
  const getArr = (field) => {
    const m = objStr.match(new RegExp(`${field}:\\[([^\\]]*?)\\]`))
    if (!m) return []
    return m[1].split(',').map(s => s.trim())
  }
  const getStrArr = (field) => {
    const m = objStr.match(new RegExp(`${field}:\\[("(?:[^"\\\\]|\\\\.)*"(?:,"(?:[^"\\\\]|\\\\.)*")*)\\]`))
    if (!m) return []
    const items = []
    const raw = m[1]
    let inStr = false, escaped = false, current = ''
    for (let c = 0; c < raw.length; c++) {
      if (escaped) { current += raw[c]; escaped = false; continue }
      if (raw[c] === '\\') { current += raw[c]; escaped = true; continue }
      if (raw[c] === '"') {
        if (!inStr) { inStr = true; continue }
        else { inStr = false; items.push(current); current = ''; continue }
      }
      if (inStr) current += raw[c]
    }
    return items
  }

  // Extract situation object
  const sitMatch = objStr.match(/situation:\{([^}]*)\}/)
  const situation = {}
  if (sitMatch) {
    const sitStr = sitMatch[1]
    const inningM = sitStr.match(/inning:"([^"]*)"/)
    if (inningM) situation.inning = inningM[1]
    const outsM = sitStr.match(/outs:(\d)/)
    if (outsM) situation.outs = parseInt(outsM[1])
    const countM = sitStr.match(/count:"([^"]*)"/)
    if (countM) situation.count = countM[1]
    const runnersM = sitStr.match(/runners:\[([^\]]*)\]/)
    situation.runners = runnersM ? runnersM[1].split(',').filter(s=>s.trim()).map(Number) : []
    const scoreM = sitStr.match(/score:\[([^\]]*)\]/)
    situation.score = scoreM ? scoreM[1].split(',').map(Number) : []
  }

  return {
    id: get('id'),
    title: get('title'),
    diff: getNum('diff'),
    cat: get('cat'),
    conceptTag: get('conceptTag'),
    ageMin: getNum('ageMin'),
    ageMax: getNum('ageMax'),
    description: get('description'),
    situation,
    options: getStrArr('options'),
    best: getNum('best'),
    explanations: getStrArr('explanations'),
    rates: getArr('rates').map(Number),
    concept: get('concept'),
    anim: get('anim'),
  }
}

// Determine position for each failing ID from prev results
const failList = prevResults.results.filter(r => !r.passed && !r.error).map(r => ({
  id: r.id, position: r.position
}))

async function callWorker(scenario, retries = 0) {
  const body = JSON.stringify({ scenario, systemPrompt, maxTokens: 1024 })
  return new Promise((resolve, reject) => {
    const url = new URL(WORKER_URL)
    const req = https.request({
      hostname: url.hostname, path: url.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY, 'Content-Length': Buffer.byteLength(body) },
      timeout: 60000,
    }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 429 || res.statusCode >= 500) {
          if (retries < MAX_RETRIES) {
            const delay = 4000 * Math.pow(2, retries)
            console.log(`  Retry ${retries+1} in ${delay/1000}s (${res.statusCode})`)
            setTimeout(() => callWorker(scenario, retries+1).then(resolve).catch(reject), delay)
            return
          }
          reject(new Error(`HTTP ${res.statusCode} after ${MAX_RETRIES} retries`))
          return
        }
        try { resolve(JSON.parse(data)) } catch(e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
    req.write(body)
    req.end()
  })
}

async function main() {
  const results = []
  let passed = 0, failed = 0, errors = 0
  const startTime = Date.now()

  for (let i = 0; i < failList.length; i += BATCH_SIZE) {
    const batch = failList.slice(i, i + BATCH_SIZE)
    const promises = batch.map(async ({ id, position }) => {
      const scenario = findScenario(indexSrc, id, position)
      if (!scenario || !scenario.id) {
        console.log(`  [${id}] NOT FOUND`)
        return { id, position, error: 'not found' }
      }
      try {
        const startMs = Date.now()
        const response = await callWorker(scenario)
        const elapsedMs = Date.now() - startMs
        const result = response.result || response
        const score = result.score || 0
        const pass = result.passed !== undefined ? result.passed : score >= 7.5
        if (pass) passed++; else failed++
        return { id, position, score, passed: pass, issues: result.issues, dimensions: result.dimensions, suggestedFix: result.suggestedFix, elapsedMs }
      } catch(e) {
        errors++
        console.log(`  [${id}] ERROR: ${e.message}`)
        return { id, position, error: e.message }
      }
    })

    const batchResults = await Promise.all(promises)
    results.push(...batchResults)

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
    const remaining = Math.round((failList.length - i - BATCH_SIZE) / BATCH_SIZE * (BATCH_DELAY/1000 + 3))
    console.log(`[SPOT] ${Math.min(i + BATCH_SIZE, failList.length)}/${failList.length} | pass=${passed} fail=${failed} err=${errors} | ${elapsed}s elapsed, ~${remaining}s left`)

    if (i + BATCH_SIZE < failList.length) await new Promise(r => setTimeout(r, BATCH_DELAY))
  }

  // Save results
  const output = {
    meta: { timestamp: new Date().toISOString(), type: 'spot-check', scenarioCount: failList.length },
    stats: { total: failList.length, passed, failed, errors, passRate: (passed / (passed + failed) * 100).toFixed(1) + '%' },
    results: results.sort((a,b) => (a.score||0) - (b.score||0))
  }
  fs.writeFileSync(path.join(SCRIPTS, 'audit_spot_check_results.json'), JSON.stringify(output, null, 2))

  console.log('\n' + '='.join ? '=' : '='.repeat(70))
  console.log(`SPOT CHECK COMPLETE`)
  console.log(`Total: ${failList.length} | Passed: ${passed} (${output.stats.passRate}) | Failed: ${failed} | Errors: ${errors}`)
  console.log(`Results saved to scripts/audit_spot_check_results.json`)

  // Show still-failing
  const stillFailing = results.filter(r => r.passed === false).sort((a,b) => a.score - b.score)
  if (stillFailing.length > 0) {
    console.log(`\nSTILL FAILING (${stillFailing.length}):`)
    stillFailing.forEach(r => {
      console.log(`  ${r.id.padEnd(12)} ${r.position.padEnd(14)} score=${r.score}  ${(r.issues||[]).slice(0,1).join('')}`)
    })
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
