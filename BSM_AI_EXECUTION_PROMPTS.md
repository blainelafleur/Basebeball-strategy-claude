# BSM AI Execution Prompts

**Instructions:** Copy each prompt below into Windsurf/Claude Code one at a time, in order. Wait for each to complete before starting the next. Each prompt is self-contained with all the context needed for execution.

---

## PHASE 1: STOP THE BLEEDING (Day 1)

### Prompt 1.1 — Fix Worker Timeout

```
Read `worker/index.js` and find the `handleAIProxy` function (around line 1298-1345). The xAI API proxy has a 55-second abort timeout on line 1306:

    const timeout = setTimeout(() => controller.abort(), 55000);

This is causing 504 Gateway Timeouts because grok-4 needs 60-70 seconds to respond to our prompts. The Worker kills the connection before grok-4 finishes.

Make these changes to `worker/index.js`:

1. Change the abort timeout from 55000ms to 120000ms (120 seconds). This gives grok-4 plenty of headroom. Cloudflare Workers paid plan supports timeouts up to 30 minutes.

2. Fix the error message on line 1339 — it says "xAI timeout after 75s" but the actual timeout value is different. Update it to reflect the actual timeout value.

3. Add a response header `X-XAI-Timeout` that tells the client what the Worker's timeout is set to. Add it to both the success response (line 1332-1335) and the error responses.

Only modify `worker/index.js`. Do not touch `index.jsx`.
```

### Prompt 1.2 — Stop the Agent Cascade

```
Read `index.jsx` and find the `generateAIScenario` function (starts around line 9317). Look at the agent pipeline fallback logic around lines 9399-9420.

Currently, when the agent pipeline fails (times out after 75 seconds), the code falls through to the standard pipeline with whatever budget remains. If agent ate 70+ seconds of an original 75-second budget, the standard pipeline has <5 seconds — a guaranteed failure. Then the retry loop at lines 12193-12205 fires AGAIN, wasting more time on doomed calls.

Fix the fallback logic inside `generateAIScenario`:

1. After the agent pipeline catch block (around line 9418-9420), add a budget check BEFORE proceeding to the standard pipeline. Calculate remaining budget: `const remainingBudget = budgetMs - (Date.now() - _aiFlowStart)`. If `remainingBudget < 20000` (20 seconds), skip the standard pipeline entirely. Log: `"[BSM] Insufficient budget for standard pipeline after agent: " + Math.round(remainingBudget/1000) + "s remaining, skipping to fallback"`. Return `{ scenario: null, error: "timeout" }` so the caller goes straight to pool/handcrafted.

2. When proceeding to the standard pipeline, pass the ACTUAL remaining budget minus a 2-second buffer, not the original `budgetMs`. The fetch timeout on the standard pipeline call should use this reduced budget.

3. In the doAI retry loop (around lines 12193-12205), add an additional check: if `remaining < 20000`, break immediately instead of retrying. Currently it only checks `remaining < 8000` which is too aggressive — an 8-second API call has zero chance of succeeding with grok-4.

Do not change any other behavior. Just add budget-awareness to prevent doomed API calls.
```

### Prompt 1.3 — Fix Pre-fetch Race Condition

```
Read `index.jsx` and find the pre-fetch/cache system. Search for `prefetchAIScenario`, `consumeCachedAI`, `cancelPrefetch`, and `aiCacheRef`. Also look at the doAI function around line 12186-12206.

There's a race condition: when the user clicks play, if a pre-fetch is already in-flight but hasn't resolved yet, doAI starts a SECOND concurrent API call. Both calls hit xAI simultaneously, competing for rate limits.

Fix this:

1. In the `aiCacheRef` object (or wherever the cache state is stored), add an `inFlightPromise` field that stores the active pre-fetch Promise for each position. Set it when pre-fetch starts, clear it when it resolves or rejects.

2. In the doAI flow (around line 12188-12192), after checking `consumeCachedAI`, add a check: if `aiCacheRef.current.inFlightPromise?.[position]` exists, await it instead of calling `generateAIScenario` directly. Something like:

```javascript
// Check if pre-fetch is already in flight for this position
const inFlight = aiCacheRef.current.inFlightPromise?.[position]
if (inFlight) {
  console.log("[BSM] Pre-fetch in flight for", position, "— awaiting instead of duplicate call")
  try {
    const prefetchResult = await Promise.race([
      inFlight,
      new Promise((_, rej) => setTimeout(() => rej(new Error("prefetch-wait-timeout")), 30000))
    ])
    if (prefetchResult?.scenario) {
      result = prefetchResult
    }
  } catch (e) {
    console.log("[BSM] Pre-fetch await failed:", e.message, "— proceeding with fresh call")
  }
}
```

3. In `prefetchAIScenario`, store the promise and clean it up:

```javascript
const promise = generateAIScenario(...)
aiCacheRef.current.inFlightPromise = aiCacheRef.current.inFlightPromise || {}
aiCacheRef.current.inFlightPromise[position] = promise
promise.finally(() => {
  if (aiCacheRef.current.inFlightPromise?.[position] === promise) {
    delete aiCacheRef.current.inFlightPromise[position]
  }
})
```

Only modify the cache/pre-fetch logic. Do not change the AI generation functions themselves.
```

### Prompt 1.4 — Add Circuit Breaker

```
Read `index.jsx` and find the doAI flow (around line 12186). Also look at `aiFailRef` usage (search for `aiFailRef`).

There's already a basic cooldown (`aiFailRef.current.cooldownUntil`) that activates after 3 consecutive failures. But it doesn't track response times or prevent slow-but-successful calls from degrading the experience.

Add a proper circuit breaker using sessionStorage. Create it near the top of the doAI function:

1. Define a circuit breaker state manager (can be a simple object stored in a ref or sessionStorage):

```javascript
// Circuit breaker for AI calls
function getCircuitBreaker() {
  try {
    return JSON.parse(sessionStorage.getItem("bsm_circuit_breaker") || '{"responseTimes":[],"failures":0,"openUntil":0}')
  } catch { return { responseTimes: [], failures: 0, openUntil: 0 } }
}
function updateCircuitBreaker(cb) {
  try { sessionStorage.setItem("bsm_circuit_breaker", JSON.stringify(cb)) } catch {}
}
```

2. At the START of doAI, check if the circuit is open:

```javascript
const cb = getCircuitBreaker()
if (Date.now() < cb.openUntil) {
  console.log("[BSM] Circuit breaker OPEN — skipping AI, serving from pool/handcrafted. Reopens in", Math.round((cb.openUntil - Date.now()) / 1000), "s")
  // Skip AI entirely, go to fallback
  setAiMode(false); setAiFallback(true);
  const s = getSmartRecycle(p, src, lastScId);
  // ... (use existing fallback code)
  setTimeout(() => { setToast({e:"⚡",n:"AI Coach Warming Up",d:"Using curated scenarios while AI resets."}); setTimeout(()=>setToast(null),3500) }, 300)
  return
}
```

3. After a SUCCESSFUL AI call (around line 12210-12211), record the response time:

```javascript
const elapsed = Date.now() - _aiStartMs
cb.responseTimes = [...cb.responseTimes.slice(-4), elapsed] // Keep last 5
cb.failures = 0
cb.openUntil = 0
// If average response time > 50s, open circuit for 5 minutes
const avgTime = cb.responseTimes.reduce((a,b) => a+b, 0) / cb.responseTimes.length
if (cb.responseTimes.length >= 3 && avgTime > 50000) {
  cb.openUntil = Date.now() + 5 * 60 * 1000
  console.warn("[BSM] Circuit breaker OPENED — avg response time", Math.round(avgTime/1000), "s")
}
updateCircuitBreaker(cb)
```

4. After a FAILED AI call (around line 12240), record the failure:

```javascript
cb.failures++
if (cb.failures >= 2) {
  cb.openUntil = Date.now() + 10 * 60 * 1000 // 10 minute cooldown after 2 failures
  console.warn("[BSM] Circuit breaker OPENED — 2 consecutive failures")
}
updateCircuitBreaker(cb)
```

Put the circuit breaker helper functions near the other helper functions (around line 3050 area). Keep it simple and self-contained.
```

---

## PHASE 2: CLOSE THE FEEDBACK LOOPS (Week 1)

### Prompt 2.1 — A/B Test Analysis Endpoint

```
Read `worker/index.js`. Find the `handleABResults` function (around line 2013-2039). This endpoint only accepts POST requests to STORE A/B test results. There is NO GET endpoint to READ or ANALYZE results. This is a critical gap — data goes in, nothing comes out.

Add a new GET handler for `/analytics/ab-results` to the Worker. Here's what it needs to do:

1. Register the GET route in the main request handler (find the route dispatch logic, likely a large if/else chain). Map `GET /analytics/ab-results` to a new `handleABAnalysis` function.

2. Implement `handleABAnalysis`:

```javascript
async function handleABAnalysis(request, env, cors) {
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)
  try {
    const url = new URL(request.url)
    const testId = url.searchParams.get("test_id") // optional filter
    const days = parseInt(url.searchParams.get("days") || "30")
    const since = Date.now() - days * 24 * 60 * 60 * 1000

    const query = testId
      ? `SELECT test_id, variant_id, metric,
              COUNT(*) as sample_size,
              ROUND(AVG(value), 4) as avg_value,
              ROUND(SUM(value), 2) as total_value,
              MIN(timestamp) as first_seen,
              MAX(timestamp) as last_seen
         FROM ab_results
         WHERE timestamp > ? AND test_id = ?
         GROUP BY test_id, variant_id, metric
         ORDER BY test_id, metric, avg_value DESC`
      : `SELECT test_id, variant_id, metric,
              COUNT(*) as sample_size,
              ROUND(AVG(value), 4) as avg_value,
              ROUND(SUM(value), 2) as total_value,
              MIN(timestamp) as first_seen,
              MAX(timestamp) as last_seen
         FROM ab_results
         WHERE timestamp > ?
         GROUP BY test_id, variant_id, metric
         ORDER BY test_id, metric, avg_value DESC`

    const results = testId
      ? await db.prepare(query).bind(since, testId).all()
      : await db.prepare(query).bind(since).all()

    // Group by test and compute winners
    const tests = {}
    for (const row of (results.results || [])) {
      if (!tests[row.test_id]) tests[row.test_id] = { metrics: {} }
      if (!tests[row.test_id].metrics[row.metric]) tests[row.test_id].metrics[row.metric] = []
      tests[row.test_id].metrics[row.metric].push(row)
    }

    // Determine winners per metric
    const analysis = Object.entries(tests).map(([testId, data]) => {
      const metricAnalysis = Object.entries(data.metrics).map(([metric, variants]) => {
        const sorted = variants.sort((a, b) => b.avg_value - a.avg_value)
        const winner = sorted[0]
        const runnerUp = sorted[1]
        const totalSamples = variants.reduce((s, v) => s + v.sample_size, 0)
        // Simple significance check: need 50+ samples per variant
        const isSignificant = variants.every(v => v.sample_size >= 50)
        return {
          metric,
          winner: winner?.variant_id,
          winnerAvg: winner?.avg_value,
          runnerUpAvg: runnerUp?.avg_value,
          lift: runnerUp ? ((winner.avg_value - runnerUp.avg_value) / Math.max(runnerUp.avg_value, 0.001) * 100).toFixed(1) + "%" : "N/A",
          totalSamples,
          isSignificant,
          variants
        }
      })
      return { testId, metrics: metricAnalysis }
    })

    return jsonResponse({ analysis, queriedAt: new Date().toISOString(), dayRange: days }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
  }
}
```

3. Make sure CORS headers are applied properly for the GET request.

Only modify `worker/index.js`. Do not touch `index.jsx` yet.
```

### Prompt 2.2 — Wire Difficulty Calibration Into Standard Pipeline

```
Read `index.jsx`. The agent pipeline already injects calibration data into prompts (lines 9131-9141 in `generateWithAgentPipeline`). But the standard pipeline in `generateAIScenario` does NOT. Calibration data is fetched by `getCalibrationData()` (around line 8067) but only the agent pipeline uses it.

Wire calibration into the standard pipeline:

1. In `generateAIScenario` (around line 9396, right after `_aiFlowStart` is set and before the agent pipeline A/B check), fetch calibration data and build a calibration prompt patch:

```javascript
// Calibration injection for standard pipeline (matching agent pipeline behavior)
let calibrationText = ""
try {
  const calData = _calibrationCache.data || await getCalibrationData()
  if (calData && calData.length > 0) {
    const relevantCal = calData.filter(c => c.position === position || !c.position)
    const conceptMatch = targetConcept ? relevantCal.find(c => c.concept === targetConcept) : null
    const positionMatches = relevantCal.filter(c => c.position === position).slice(0, 3)

    if (conceptMatch) {
      calibrationText = conceptMatch.adjustment === "too_hard"
        ? `\nCALIBRATION: "${conceptMatch.concept}" has ${conceptMatch.correctRate}% accuracy across all players. This is very hard — make the correct answer more learnable. Use a clearer scenario and more instructive explanation.`
        : `\nCALIBRATION: "${conceptMatch.concept}" has ${conceptMatch.correctRate}% accuracy. This is too easy — add nuance. Include a tempting distractor that requires deeper understanding.`
    } else if (positionMatches.length > 0) {
      calibrationText = "\nPOSITION CALIBRATION DATA:\n" +
        positionMatches.map(c => `- "${c.concept}": ${c.correctRate}% accuracy (${c.adjustment})`).join("\n")
    }
  }
} catch (e) { /* non-blocking */ }
```

2. Inject `calibrationText` into the user prompt. Find where the prompt string is built (around line 9550-9570). Add `${calibrationText}` right after the `${weakAreas}` and `${masteryPrompt}` injections, on the same line where player context is added. It should go right before or after `${teachCtx}`.

Only modify `index.jsx`. Keep changes minimal — just add the calibration fetch and inject it into the prompt.
```

### Prompt 2.3 — Wire Error Patterns Into AI Prompts

```
Read `index.jsx`. Find the `detectErrorPatterns` function (around line 6353-6435 area, in the mastery system section). Also find where `_errorPatterns` is computed in `generateAIScenario` (around line 9487-9500).

Currently, `_errorPatterns` is detected and added to `masteryPrompt` (line 9497-9500), but only as a generic instruction. The actual pattern details (which specific concepts the player always picks wrong, which patterns they exhibit) are NOT forwarded to the AI with enough context to generate targeted remediation scenarios.

Enhance the error pattern injection:

1. In `generateAIScenario`, around where `_errorPatterns` is used (lines 9497-9500), replace the current injection with a richer version:

```javascript
if (_errorPatterns.length > 0) {
  // Inject ALL detected patterns, not just the first one
  const patternDetails = _errorPatterns.slice(0, 3).map(p => {
    let instruction = `DETECTED PATTERN: "${p.label}" — ${p.aiInstruction}`
    if (p.type === 'always_picks') {
      instruction += ` The player always picks "${p.alwaysPick}" for ${p.concept} scenarios. Create a scenario where "${p.alwaysPick}" is clearly the WRONG choice and explain why the correct alternative is better in this specific situation.`
    } else if (p.type === 'never_picks') {
      instruction += ` The player never considers "${p.neverPick}" for ${p.concept}. Create a scenario where "${p.neverPick}" IS the correct choice.`
    } else if (p.type === 'concept_blind') {
      instruction += ` The player consistently fails "${p.concept}" scenarios. Scaffold the difficulty — create a clear, approachable version of this concept with an especially helpful explanation.`
    }
    return instruction
  }).join("\n")
  masteryPrompt += `\n\nERROR PATTERN REMEDIATION (highest priority):\n${patternDetails}`
}
```

2. Verify that `detectErrorPatterns` returns objects with enough data. If the current return objects don't include `type`, `alwaysPick`, `neverPick`, or `concept` fields, add those fields to the function's return values based on what it detects.

Only modify `index.jsx`. Focus on making the error pattern data actionable in the AI prompt.
```

### Prompt 2.4 — Audit Score Feedback Loop

```
Read `worker/index.js`. Find the AI audit-related endpoints. Search for "ai_audit" and "scenario_grades" in the Worker code.

Currently, AI audit scores (from the self-audit second API call) are stored in the `ai_audits` D1 table, but there's no mechanism to aggregate weak spots and feed them back into generation.

Add a new endpoint and connect it to the client:

**In `worker/index.js`:**

1. Add a new GET endpoint: `/analytics/audit-insights`

```javascript
async function handleAuditInsights(request, env, cors) {
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)
  try {
    const url = new URL(request.url)
    const position = url.searchParams.get("position")
    const days = parseInt(url.searchParams.get("days") || "30")
    const since = Date.now() - days * 24 * 60 * 60 * 1000

    // Find position/concept combos with consistently low audit scores
    const query = position
      ? `SELECT position, concept,
              COUNT(*) as audit_count,
              ROUND(AVG(score), 2) as avg_score,
              MIN(score) as min_score,
              GROUP_CONCAT(DISTINCT feedback) as feedback_samples
         FROM ai_audits
         WHERE timestamp > ? AND position = ?
         GROUP BY position, concept
         HAVING audit_count >= 3 AND avg_score < 3.5
         ORDER BY avg_score ASC
         LIMIT 10`
      : `SELECT position, concept,
              COUNT(*) as audit_count,
              ROUND(AVG(score), 2) as avg_score,
              MIN(score) as min_score,
              GROUP_CONCAT(DISTINCT feedback) as feedback_samples
         FROM ai_audits
         WHERE timestamp > ?
         GROUP BY position, concept
         HAVING audit_count >= 3 AND avg_score < 3.5
         ORDER BY avg_score ASC
         LIMIT 20`

    const results = position
      ? await db.prepare(query).bind(since, position).all()
      : await db.prepare(query).bind(since).all()

    return jsonResponse({
      weakSpots: results.results || [],
      queriedAt: new Date().toISOString()
    }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
  }
}
```

2. Register the GET route in the main request dispatcher.

**In `index.jsx`:**

3. In `generateAIScenario`, in the setup phase (around lines 9322-9362 where feedback patterns and prompt patches are fetched), add a parallel fetch for audit insights:

Add to the `Promise.all` array:
```javascript
Promise.race([
  fetch(`${WORKER_BASE}/analytics/audit-insights?position=${encodeURIComponent(position)}&days=30`),
  new Promise((_, rej) => setTimeout(() => rej(new Error("audit-timeout")), 2000))
]).catch(() => null),
```

Then process the result:
```javascript
let auditInsightText = ""
if (auditRes?.ok) {
  const auditData = await auditRes.json()
  const weakSpots = auditData.weakSpots || []
  if (weakSpots.length > 0) {
    auditInsightText = "\nAI QUALITY WEAK SPOTS (from self-audit — these position/concept combos scored poorly):\n" +
      weakSpots.slice(0, 3).map(w => `- ${w.position}/${w.concept}: avg audit score ${w.avg_score}/5. Feedback: ${(w.feedback_samples || "").slice(0, 100)}`).join("\n") +
      "\nIMPROVE on these specific areas."
  }
}
```

4. Inject `auditInsightText` into the prompt string alongside `flaggedAvoidText`, `promptPatchText`, and `calibrationText`.

Note: The `ai_audits` table may not exist yet or may have different column names. Check the D1 schema first. If the table doesn't exist or has different columns, adjust the query accordingly. If there's no `ai_audits` table, create it:

```sql
CREATE TABLE IF NOT EXISTS ai_audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_id TEXT,
  position TEXT,
  concept TEXT,
  score REAL,
  feedback TEXT,
  timestamp INTEGER
)
```
```

### Prompt 2.5 — Grade-to-Pool Quality Bridge

```
Read `worker/index.js`. Find the scenario pool endpoints (`/scenario-pool/submit` around line 1691, `/scenario-pool/feedback` around line 1847) and the scenario grading storage.

Currently, scenarios have TWO separate quality signals that are never connected:
- `scenario_grades` table: generation-time quality score from gradeScenario() (0-100)
- `scenario_pool` table: player feedback (correct_count, wrong_count, flagged_count, flag_rate)

Add a composite quality endpoint that joins these:

1. Add a new GET endpoint: `/scenario-pool/quality-audit`

```javascript
async function handlePoolQualityAudit(request, env, cors) {
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)
  try {
    // Find scenarios where generation score is high but player feedback is poor (or vice versa)
    const results = await db.prepare(`
      SELECT p.id, p.position, p.concept, p.quality_score as pool_quality,
             p.served_count, p.correct_count, p.flagged_count,
             CASE WHEN p.served_count > 0
               THEN ROUND(100.0 * p.flagged_count / p.served_count, 1)
               ELSE 0 END as flag_rate,
             CASE WHEN p.served_count > 0
               THEN ROUND(100.0 * p.correct_count / p.served_count, 1)
               ELSE 0 END as accuracy_rate,
             g.score as generation_grade
      FROM scenario_pool p
      LEFT JOIN scenario_grades g ON p.scenario_hash = g.scenario_hash
      WHERE p.status = 'active' AND p.served_count >= 5
      ORDER BY flag_rate DESC
      LIMIT 50
    `).all()

    const rows = results.results || []

    // Flag mismatches: high gen score + high flag rate = prompt problem
    const mismatches = rows.filter(r =>
      r.generation_grade && r.generation_grade > 70 && r.flag_rate > 10
    )

    // Flag low performers for retirement
    const retireCandidates = rows.filter(r => r.flag_rate > 15 || r.accuracy_rate < 20)

    return jsonResponse({
      all: rows,
      mismatches,
      retireCandidates,
      total: rows.length,
      queriedAt: new Date().toISOString()
    }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
  }
}
```

2. Register the route.

3. Also, modify the existing `/scenario-pool/submit` handler: when a scenario is submitted to the pool, also store its generation grade (if available) in the `scenario_pool` record. Add a `generation_grade` column to the scenario_pool table if it doesn't exist:

```sql
ALTER TABLE scenario_pool ADD COLUMN generation_grade REAL DEFAULT NULL;
ALTER TABLE scenario_pool ADD COLUMN scenario_hash TEXT DEFAULT NULL;
```

4. In the submit handler, if the request body includes `generationGrade`, store it.

**In `index.jsx`:**

5. Find where scenarios are submitted to the server pool (search for `submitToServerPool`). When calling it, include the generation grade if available. The scenario object should already have `agentGrade` or a similar field from the grading step — pass it along.

Only modify the pool submission to include the grade data. Do not change the generation or grading logic.
```

---

## PHASE 3: BUILD THE KNOWLEDGE BASE (Weeks 2-3)

### Prompt 3.1 — Coverage Map Endpoint

```
Read `worker/index.js` and `index.jsx`. The goal is to build a coverage matrix showing how many validated scenarios exist for each (position, concept, difficulty) combination.

**In `worker/index.js`:**

1. Add a new GET endpoint: `/knowledge-base/coverage`

```javascript
async function handleKBCoverage(request, env, cors) {
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)
  try {
    // Count active pool scenarios by position/concept/difficulty
    const poolCoverage = await db.prepare(`
      SELECT position, concept, difficulty,
             COUNT(*) as pool_count,
             ROUND(AVG(quality_score), 2) as avg_quality,
             SUM(CASE WHEN served_count >= 50 AND quality_score >= 8.0
                  AND (flagged_count * 1.0 / MAX(served_count, 1)) < 0.15
                  THEN 1 ELSE 0 END) as gold_count,
             SUM(CASE WHEN served_count >= 5
                  AND (flagged_count * 1.0 / MAX(served_count, 1)) < 0.15
                  THEN 1 ELSE 0 END) as validated_count,
             MAX(created_at) as last_generated
      FROM scenario_pool
      WHERE status = 'active'
      GROUP BY position, concept, difficulty
      ORDER BY position, concept, difficulty
    `).all()

    const rows = poolCoverage.results || []

    // Define the full matrix
    const positions = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase",
                       "leftField","centerField","rightField","batter","baserunner","manager"]
    const difficulties = [1, 2, 3]

    // Get unique concepts from the data
    const concepts = [...new Set(rows.map(r => r.concept).filter(Boolean))]

    // Total possible cells
    const totalCells = positions.length * concepts.length * difficulties.length
    const coveredCells = rows.filter(r => r.pool_count > 0).length
    const goldCells = rows.filter(r => r.gold_count > 0).length

    return jsonResponse({
      coverage: rows,
      summary: {
        totalPossibleCells: totalCells,
        coveredCells,
        goldCells,
        coveragePercent: totalCells > 0 ? Math.round(100 * coveredCells / totalCells) : 0,
        goldPercent: totalCells > 0 ? Math.round(100 * goldCells / totalCells) : 0,
        positions: positions.length,
        uniqueConcepts: concepts.length,
        difficulties: difficulties.length
      },
      queriedAt: new Date().toISOString()
    }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
  }
}
```

2. Register the GET route.

Note: The `scenario_pool` table may not have `difficulty`, `concept`, or `quality_score` columns. Check the existing schema first. If columns are missing, add them:

```sql
ALTER TABLE scenario_pool ADD COLUMN difficulty INTEGER DEFAULT 2;
ALTER TABLE scenario_pool ADD COLUMN concept TEXT DEFAULT '';
```

Also ensure the pool submission handler stores these fields when scenarios are added.

Only modify `worker/index.js`.
```

### Prompt 3.2 — Background Batch Generation

```
Read `worker/index.js`. Find the existing `handleScheduled` cron handler (around line 2045). Also read the coverage endpoint you created in the previous prompt.

Add a batch generation system that can run as a Cron Trigger or be triggered manually via an admin endpoint.

1. Add a new POST endpoint: `/admin/batch-generate`

This endpoint is the batch generation controller. It:
- Calls `/knowledge-base/coverage` internally to find gaps
- Identifies the top N (default 10) highest-priority gaps (lowest coverage, most-played positions first)
- For each gap, calls the xAI API directly (since this runs server-side) to generate a scenario
- Each generated scenario goes through server-side validation (basic structural checks)
- Valid scenarios are inserted into `scenario_pool` with status 'new'

```javascript
async function handleBatchGenerate(request, env, cors) {
  if (!env.XAI_API_KEY) return jsonResponse({ error: "XAI_API_KEY not configured" }, 503, cors)

  const body = await request.json().catch(() => ({}))
  const batchSize = Math.min(body.count || 10, 25) // Max 25 per batch
  const targetPosition = body.position || null // Optional: focus on one position

  const results = []

  // Step 1: Get coverage gaps
  // (Query scenario_pool directly since we're in the Worker)
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)

  const positions = targetPosition ? [targetPosition] :
    ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase",
     "leftField","centerField","rightField","batter","baserunner","manager"]

  // Find positions with lowest pool counts
  const poolCounts = await db.prepare(`
    SELECT position, COUNT(*) as count
    FROM scenario_pool WHERE status = 'active'
    GROUP BY position
  `).all()

  const countMap = {}
  for (const r of (poolCounts.results || [])) countMap[r.position] = r.count

  // Sort positions by lowest coverage
  const sortedPositions = positions.sort((a, b) => (countMap[a] || 0) - (countMap[b] || 0))

  // Step 2: Generate scenarios
  for (let i = 0; i < batchSize; i++) {
    const position = sortedPositions[i % sortedPositions.length]

    try {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "grok-4",
          max_tokens: 2500,
          temperature: 0.5,
          messages: [
            { role: "system", content: `You are the world's most experienced baseball coach, teaching kids 6-18 via Baseball Strategy Master. OUTPUT: Respond with ONLY valid JSON. No markdown. GOLDEN RULE: Every scenario teaches ONE baseball concept. EXPLANATION RULES: 2-4 sentences each. BEST: action + WHY correct + positive result. WRONG: action + WHY fails + consequences. Player perspective ("you"). OPTION RULES: All 4 at SAME decision moment. Each specific, concrete, strategically distinct. Include one common kid mistake. POSITION BOUNDARIES: Only actions ${position} actually performs. score=[HOME,AWAY]. outs: 0-2. count: "B-S" or "-". runners must match description.` },
            { role: "user", content: `Create a baseball strategy scenario for position: ${position}. THE QUESTION MUST ASK: "What should the ${position.replace(/([A-Z])/g,' $1').trim().toLowerCase()} do?" All 4 options must be actions ONLY this position makes. Generate difficulty level ${(i % 3) + 1}. Return JSON with: title, description, options[4], best(0-3), explanations[4], rates[4], concept, conceptTag, diff(1-3), anim, situation{inning,outs,runners[],score[2],count}. The best option must have the highest rate (>=70). Include one yellow option (45-65 rate range).` }
          ]
        })
      })

      if (!response.ok) {
        results.push({ position, status: "api_error", code: response.status })
        continue
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ""

      // Basic parse validation
      try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const scenario = JSON.parse(cleaned)

        // Basic structural validation
        if (!scenario.title || !scenario.options || scenario.options.length !== 4 ||
            typeof scenario.best !== 'number' || !scenario.explanations ||
            scenario.explanations.length !== 4) {
          results.push({ position, status: "validation_failed", title: scenario.title })
          continue
        }

        // Store in pool
        const id = `batch_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
        await db.prepare(`
          INSERT INTO scenario_pool (id, position, concept, difficulty, scenario_json, quality_score, status, created_at, served_count, correct_count, flagged_count)
          VALUES (?, ?, ?, ?, ?, ?, 'new', ?, 0, 0, 0)
        `).bind(id, position, scenario.conceptTag || scenario.concept || '', scenario.diff || 2, JSON.stringify(scenario), 7.0, Date.now()).run()

        results.push({ position, status: "success", title: scenario.title, concept: scenario.conceptTag || scenario.concept, id })
      } catch (parseErr) {
        results.push({ position, status: "parse_error", error: parseErr.message })
      }
    } catch (fetchErr) {
      results.push({ position, status: "fetch_error", error: fetchErr.message })
    }
  }

  return jsonResponse({
    generated: results.filter(r => r.status === "success").length,
    failed: results.filter(r => r.status !== "success").length,
    results,
    timestamp: new Date().toISOString()
  }, 200, cors)
}
```

2. Register the POST route. Consider adding basic auth (check for a secret header) since this is an admin endpoint.

3. Wire it into the existing `handleScheduled` cron trigger so it runs automatically. Add a daily cron trigger to wrangler.toml:

In `worker/wrangler.toml`, add:
```toml
[triggers]
crons = ["0 6 * * *"]  # Daily at 6am UTC
```

In `handleScheduled`, add a call to batch generate with a small count (5-10 scenarios per day).

Only modify `worker/index.js` and `worker/wrangler.toml`.
```

### Prompt 3.3 — Pool Scenario Lifecycle

```
Read `worker/index.js`. Find the scenario pool endpoints (`/scenario-pool/submit`, `/scenario-pool/fetch`, `/scenario-pool/feedback`).

Currently, pool scenarios have a basic active/retired status. Implement a proper lifecycle: New → Validated → Gold → Retired.

1. Add a `tier` column to `scenario_pool` if it doesn't exist:

```sql
ALTER TABLE scenario_pool ADD COLUMN tier TEXT DEFAULT 'new';
```

2. Create a new endpoint: POST `/scenario-pool/promote` — runs the promotion logic:

```javascript
async function handlePoolPromotion(request, env, cors) {
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)
  try {
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

    // Promote: new → validated (5+ serves, <15% flag rate)
    const promoted = await db.prepare(`
      UPDATE scenario_pool SET tier = 'validated'
      WHERE tier = 'new' AND served_count >= 5
        AND (flagged_count * 1.0 / MAX(served_count, 1)) < 0.15
        AND status = 'active'
    `).run()

    // Promote: validated → gold (50+ serves, >70% positive, quality > 8.0, <10% flag rate)
    const golded = await db.prepare(`
      UPDATE scenario_pool SET tier = 'gold'
      WHERE tier = 'validated' AND served_count >= 50
        AND (correct_count * 1.0 / MAX(served_count, 1)) > 0.35
        AND (flagged_count * 1.0 / MAX(served_count, 1)) < 0.10
        AND quality_score >= 8.0
        AND status = 'active'
    `).run()

    // Demote/retire: flag rate > 15% OR stale (no interaction in 30 days)
    const retired = await db.prepare(`
      UPDATE scenario_pool SET tier = 'retired', status = 'retired'
      WHERE status = 'active' AND (
        (served_count >= 10 AND (flagged_count * 1.0 / MAX(served_count, 1)) > 0.15)
      )
    `).run()

    return jsonResponse({
      promoted: promoted.meta?.changes || 0,
      golded: golded.meta?.changes || 0,
      retired: retired.meta?.changes || 0,
      timestamp: new Date().toISOString()
    }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
  }
}
```

3. Modify the existing `/scenario-pool/fetch` handler to prioritize tiers. When serving scenarios, prefer gold > validated > new:

In the fetch query, add `ORDER BY CASE tier WHEN 'gold' THEN 1 WHEN 'validated' THEN 2 WHEN 'new' THEN 3 ELSE 4 END, quality_score DESC`.

4. Add the promotion to the existing `handleScheduled` cron trigger (run promotion daily alongside batch generation).

Only modify `worker/index.js`.
```

### Prompt 3.4 — Semantic Deduplication

```
Read `worker/index.js`. Find the `/scenario-pool/submit` handler.

Currently there's no deduplication — the pool can accumulate near-identical scenarios (same position, same concept, same inning, same runners). Add a lightweight semantic signature check.

In the `/scenario-pool/submit` handler, BEFORE inserting a new scenario:

1. Compute a semantic signature from the scenario data:

```javascript
// Semantic signature for dedup
function computeScenarioSignature(scenario) {
  const pos = scenario.position || scenario.cat || ''
  const concept = scenario.conceptTag || scenario.concept || ''
  const inningBucket = (() => {
    const inn = scenario.situation?.inning || ''
    const num = parseInt(inn.replace(/\D/g, '')) || 5
    if (num <= 3) return 'early'
    if (num <= 6) return 'mid'
    return 'late'
  })()
  const scoreDiff = (() => {
    const score = scenario.situation?.score || [0, 0]
    const diff = score[0] - score[1]
    if (diff > 2) return 'blowout-lead'
    if (diff > 0) return 'close-lead'
    if (diff === 0) return 'tied'
    if (diff > -3) return 'close-trail'
    return 'blowout-trail'
  })()
  const runners = (scenario.situation?.runners || []).sort().join('')
  return `${pos}|${concept}|${inningBucket}|${scoreDiff}|${runners}`
}
```

2. Check if a gold scenario with the same signature already exists:

```javascript
const signature = computeScenarioSignature(scenario)

// Check for existing high-quality scenario with same signature
const existing = await db.prepare(`
  SELECT id, quality_score, tier FROM scenario_pool
  WHERE scenario_signature = ? AND status = 'active' AND tier IN ('gold', 'validated')
  ORDER BY quality_score DESC LIMIT 1
`).bind(signature).first()

if (existing) {
  const newQuality = body.quality || body.generationGrade || 7.0
  // Only allow if new scenario is significantly better
  if (newQuality < existing.quality_score * 1.10) {
    return jsonResponse({
      accepted: false,
      reason: "duplicate_signature",
      existingId: existing.id,
      existingQuality: existing.quality_score
    }, 200, cors)
  }
  // If better, retire the old one
  await db.prepare(`UPDATE scenario_pool SET tier = 'replaced', status = 'retired' WHERE id = ?`).bind(existing.id).run()
}
```

3. Add `scenario_signature` column and store it:

```sql
ALTER TABLE scenario_pool ADD COLUMN scenario_signature TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_pool_signature ON scenario_pool(scenario_signature);
```

4. Store the signature when inserting. Update the INSERT statement in the submit handler.

Only modify `worker/index.js`.
```

---

## PHASE 4: PROMPT OPTIMIZATION ENGINE (Weeks 3-4)

### Prompt 4.1 — Prompt Versioning

```
Read `worker/index.js` and `index.jsx`.

Add prompt versioning: store the full prompt used for each generated scenario so we can correlate prompt variations with quality outcomes.

**In `worker/index.js`:**

1. Create a new table (add to the schema initialization or as a migration):

```sql
CREATE TABLE IF NOT EXISTS prompt_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_id TEXT,
  position TEXT,
  prompt_hash TEXT,
  system_message_length INTEGER,
  user_message_length INTEGER,
  injected_patches INTEGER DEFAULT 0,
  injected_calibration INTEGER DEFAULT 0,
  injected_error_patterns INTEGER DEFAULT 0,
  injected_audit_insights INTEGER DEFAULT 0,
  generation_grade REAL,
  pipeline TEXT DEFAULT 'standard',
  temperature REAL,
  model TEXT DEFAULT 'grok-4',
  timestamp INTEGER
);
CREATE INDEX IF NOT EXISTS idx_prompt_hash ON prompt_versions(prompt_hash);
```

2. Add a new POST endpoint: `/analytics/prompt-version`

```javascript
async function handlePromptVersion(request, env, cors) {
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)
  try {
    const body = await request.json()
    await db.prepare(`
      INSERT INTO prompt_versions (scenario_id, position, prompt_hash, system_message_length, user_message_length, injected_patches, injected_calibration, injected_error_patterns, injected_audit_insights, generation_grade, pipeline, temperature, model, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.scenarioId || '', body.position || '', body.promptHash || '',
      body.systemMessageLength || 0, body.userMessageLength || 0,
      body.injectedPatches || 0, body.injectedCalibration || 0,
      body.injectedErrorPatterns || 0, body.injectedAuditInsights || 0,
      body.generationGrade || 0, body.pipeline || 'standard',
      body.temperature || 0.4, body.model || 'grok-4', Date.now()
    ).run()
    return jsonResponse({ ok: true }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
  }
}
```

3. Register the route.

**In `index.jsx`:**

4. In `generateAIScenario`, AFTER a successful scenario is generated and graded, send prompt metadata to the new endpoint. Add this near where the scenario is returned (before the return statement):

```javascript
// Log prompt version for optimization analysis (non-blocking)
try {
  const promptHash = btoa(prompt.slice(0, 200) + (systemMsg || '').slice(0, 200)).slice(0, 40)
  fetch(WORKER_BASE + "/analytics/prompt-version", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenarioId: scenario.id,
      position,
      promptHash,
      systemMessageLength: (systemMsg || '').length,
      userMessageLength: prompt.length,
      injectedPatches: promptPatchText ? 1 : 0,
      injectedCalibration: calibrationText ? 1 : 0,
      injectedErrorPatterns: _errorPatterns.length > 0 ? 1 : 0,
      injectedAuditInsights: auditInsightText ? 1 : 0,
      generationGrade: scenario.agentGrade || grade?.score || 0,
      pipeline: scenario.scenarioSource || 'standard',
      temperature: aiTemp || 0.4,
    })
  }).catch(() => {})
} catch {}
```

5. Do the same in `generateWithAgentPipeline` for agent-pipeline scenarios.

Keep all logging non-blocking (fire and forget).
```

### Prompt 4.2 — Expand Option Archetypes

```
Read `index.jsx`. Find the `OPTION_ARCHETYPES` constant (around line 8449-8625). Currently there are only 25 (position:concept) archetype entries.

The full space is ~720 combinations (15 positions x 48 concepts). We need more archetypes to improve answer quality and diversity.

1. Expand OPTION_ARCHETYPES with at least 50 MORE entries covering the most common position/concept combinations. Focus on:
   - All positions for "cutoff relay" (it's a multi-position concept)
   - All positions for "bunt defense"
   - Pitcher for: pitch_selection, pitch_count, pickoff, pitching_from_stretch
   - Catcher for: framing, blocking, throw_to_base, pitchout
   - Batter for: hit_and_run, sacrifice_bunt, two_strike_approach, situational_hitting
   - Baserunner for: steal_timing, tag_up, lead_distance, first_to_third
   - Manager for: pitching_change, intentional_walk, defensive_positioning, pinch_hitter

Each archetype should follow the existing format:
```javascript
"position:concept": {
  moment: "Description of the decision moment",
  correct: "What the right answer looks like",
  kid_mistake: "What kids typically do wrong",
  sounds_smart: "An answer that sounds sophisticated but is wrong here",
  clearly_wrong: "An obviously bad choice"
}
```

Make sure every archetype reflects real baseball strategy. Use your knowledge of baseball to create realistic, educationally valuable archetypes. The `moment` field should describe a specific game situation where this decision matters.

Add the new archetypes to the existing OPTION_ARCHETYPES object. Do not remove any existing ones.
```

---

## PHASE 5: AUTONOMOUS LEARNING (Month 2+)

### Prompt 5.1 — Enhanced Weekly AI Report

```
Read `worker/index.js`. Find the `handleScheduled` function (around line 2045) and the `weekly_ai_report` table references.

Enhance the weekly cron job to generate a comprehensive AI quality report and auto-generate targeted prompt patches for the worst-performing areas.

Replace or enhance the existing `handleScheduled` with:

1. Aggregate these metrics from the past 7 days:
   - Generation success rate (successful / total attempts from analytics_events)
   - Average quality score from scenario_grades
   - Flag rate by position from scenario_feedback
   - A/B test results summary from ab_results
   - Knowledge base coverage delta (new Gold scenarios this week)

2. Identify the top 5 worst position/concept combos (highest flag rate + lowest quality)

3. Auto-generate a prompt patch for each of the top 3 worst combos:

```javascript
// Auto-generate patch
const patchText = `QUALITY ALERT for ${position}/${concept}: ${flagRate}% flag rate, ${avgQuality} avg quality over ${sampleSize} scenarios in the past week. Common issues: ${topFeedback}. REQUIREMENT: Double-check that all options are realistic for this position, explanations reference the specific game situation, and the correct answer has clear strategic reasoning.`

await db.prepare(`
  INSERT INTO prompt_patches (position, category, patch_text, confidence, created_at, expires_at, source)
  VALUES (?, ?, ?, ?, ?, ?, 'weekly_auto')
`).bind(position, concept, patchText, 0.8, now, now + 30 * 24 * 60 * 60 * 1000).run()
```

4. Store the full report in `weekly_ai_report` table:

```javascript
await db.prepare(`
  INSERT INTO weekly_ai_report (report_json, generated_at, week_start, week_end)
  VALUES (?, ?, ?, ?)
`).bind(JSON.stringify(report), now, weekAgo, now).run()
```

5. Add a GET endpoint `/admin/weekly-report` to retrieve the latest report.

Make sure the cron trigger in wrangler.toml includes the weekly schedule:
```toml
[triggers]
crons = ["0 6 * * *", "0 6 * * 1"]  # Daily at 6am + Monday at 6am
```

Only modify `worker/index.js` and `worker/wrangler.toml`.
```

### Prompt 5.2 — Scenario Evolution

```
Read `worker/index.js`.

Add a scenario evolution system that automatically refreshes stale scenarios and adjusts difficulty based on player accuracy trends.

1. Add a new POST endpoint: `/admin/evolve-scenarios`

This endpoint finds Gold scenarios whose player accuracy has drifted too high (>95%) or too low (<25%) over the last 30 days, and generates evolved variants.

```javascript
async function handleEvolveScenarios(request, env, cors) {
  if (!env.XAI_API_KEY) return jsonResponse({ error: "XAI_API_KEY not configured" }, 503, cors)
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)

  try {
    // Find Gold scenarios with accuracy drift
    const candidates = await db.prepare(`
      SELECT id, position, concept, difficulty, scenario_json, quality_score,
             served_count, correct_count,
             ROUND(100.0 * correct_count / MAX(served_count, 1), 1) as accuracy
      FROM scenario_pool
      WHERE tier = 'gold' AND status = 'active' AND served_count >= 30
        AND (
          (correct_count * 1.0 / MAX(served_count, 1)) > 0.95
          OR (correct_count * 1.0 / MAX(served_count, 1)) < 0.25
        )
      ORDER BY served_count DESC
      LIMIT 10
    `).all()

    const results = []
    for (const candidate of (candidates.results || []).slice(0, 5)) {
      const original = JSON.parse(candidate.scenario_json)
      const isTooEasy = candidate.accuracy > 95

      const prompt = `You are evolving an existing baseball scenario. The original scenario for ${candidate.position} about "${candidate.concept}" has become ${isTooEasy ? 'too easy (95%+ accuracy)' : 'too hard (<25% accuracy)'}.

ORIGINAL SCENARIO:
Title: ${original.title}
Description: ${original.description}
Situation: Inning ${original.situation?.inning}, ${original.situation?.outs} outs, runners on ${(original.situation?.runners || []).join(', ') || 'none'}, score ${(original.situation?.score || [0,0]).join('-')}

CREATE A VARIANT that keeps the same core concept but ${isTooEasy ? 'adds a realistic complication or edge case that requires deeper strategic thinking. Change the game situation (different inning, different score, different runners) to create a scenario where the obvious answer is actually wrong.' : 'simplifies the decision. Make the correct answer more discoverable. Use a game situation where the strategic reasoning is clearer. Provide an especially instructive explanation.'}

Change at least TWO of: inning, score differential, runner configuration, out count. Keep the same position and concept.

Return valid JSON with: title, description, options[4], best(0-3), explanations[4], rates[4], concept, conceptTag, diff(${isTooEasy ? Math.min(candidate.difficulty + 1, 3) : Math.max(candidate.difficulty - 1, 1)}), anim, situation{inning,outs,runners[],score[2],count}.`

      try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.XAI_API_KEY}` },
          body: JSON.stringify({ model: "grok-4", max_tokens: 2500, temperature: 0.5,
            messages: [
              { role: "system", content: "You are an expert baseball coach creating game strategy scenarios. Output ONLY valid JSON." },
              { role: "user", content: prompt }
            ]
          })
        })

        if (!response.ok) { results.push({ id: candidate.id, status: "api_error" }); continue }
        const data = await response.json()
        const text = data.choices?.[0]?.message?.content || ""
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const variant = JSON.parse(cleaned)

        if (variant.title && variant.options?.length === 4) {
          const newId = `evolved_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
          await db.prepare(`
            INSERT INTO scenario_pool (id, position, concept, difficulty, scenario_json, quality_score, tier, status, created_at, served_count, correct_count, flagged_count, evolved_from)
            VALUES (?, ?, ?, ?, ?, ?, 'new', 'active', ?, 0, 0, 0, ?)
          `).bind(newId, candidate.position, variant.conceptTag || variant.concept || candidate.concept, variant.diff || candidate.difficulty, JSON.stringify(variant), 7.0, Date.now(), candidate.id).run()

          results.push({ id: candidate.id, status: "evolved", newId, reason: isTooEasy ? "too_easy" : "too_hard" })
        }
      } catch (e) {
        results.push({ id: candidate.id, status: "error", error: e.message })
      }
    }

    return jsonResponse({ evolved: results.filter(r => r.status === "evolved").length, results }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
  }
}
```

2. Add `evolved_from` column to scenario_pool:
```sql
ALTER TABLE scenario_pool ADD COLUMN evolved_from TEXT DEFAULT NULL;
```

3. Register the route and add to the weekly cron trigger.

Only modify `worker/index.js`.
```

---

## POST-PHASE: DEPLOY & VERIFY

### Prompt — Deploy Worker Changes

```
All the Worker changes need to be deployed.

1. cd into the `worker/` directory
2. Run `npx wrangler deploy` to deploy the updated Worker
3. Run any D1 migrations needed. For each new column or table, run:
   `npx wrangler d1 execute bsm-db --command "ALTER TABLE scenario_pool ADD COLUMN tier TEXT DEFAULT 'new';"` (etc.)
4. Test the new endpoints:
   - `curl https://bsm-ai-proxy.blafleur.workers.dev/knowledge-base/coverage`
   - `curl https://bsm-ai-proxy.blafleur.workers.dev/analytics/ab-results`
   - `curl https://bsm-ai-proxy.blafleur.workers.dev/analytics/audit-insights`

Report the results of each test.

Do NOT modify any code. Just deploy and test.
```

---

## NOTES FOR EXECUTION

- **Run prompts in order.** Phase 1 must complete before Phase 2. Within each phase, prompts can sometimes run in parallel (noted above).
- **Test after each prompt.** Open `preview.html` locally and click "AI Coach's Challenge" to verify AI generation works after Phase 1 changes.
- **Deploy Worker after Phase 1.** The Worker timeout fix is the most critical change and should be deployed immediately.
- **Deploy Worker again after Phase 2-3.** These add new Worker endpoints.
- **Schema migrations.** Some prompts add columns to D1 tables. Run the ALTER TABLE statements via `wrangler d1 execute` before deploying code that uses them.
- **Don't forget CLAUDE.md.** After completing each phase, update CLAUDE.md's AI Integration section and BSM_PROJECT_CONTEXT.md per the Living Document Protocol.
