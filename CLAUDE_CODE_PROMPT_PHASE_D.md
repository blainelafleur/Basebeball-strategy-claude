# Claude Code Execution Prompt — AI Superpower Plan Phase D

Copy everything below the line into Claude Code:

---

Read `AI_SUPERPOWER_PLAN.md` — specifically **Phase D: Feedback Loop (Weeks 7-8)**. Phases A, B, and C are complete. Now execute Phase D, one task at a time.

## RULES (same as before)

1. **One task at a time.** Complete task 17 fully before starting task 18.
2. **After each task**, verify `preview.html` loads without console errors. If the app breaks, fix it before moving on.
3. **Commit after each working task** with a message like `feat: add population difficulty calibration (Pillar 6A)`.
4. **Single-file app** in `index.jsx`. Surgical edits only. Read 50 lines of context before editing any function.
5. **Worker changes** are in `worker/index.js`. Deploy with `cd worker && npx wrangler deploy` after worker changes.
6. **D1 database name is `bsm-accounts`**. Use this for any wrangler d1 commands.

## WHAT'S ALREADY BUILT (from Phases A-C)

- `classifyError()` / `classifyAndFeedback()` — error taxonomy
- `brainContradiction` in QUALITY_FIREWALL tier1
- `formatBrainForAI()` with pre-calculated situation conclusions
- Pedagogical grading in `gradeAgentScenario()`
- D1 `learning_events` table + `/analytics/learning-calibration` endpoint + dual-write in worker
- `CONCEPT_GATES` wired into `planScenario()` and `buildAgentPrompt()`
- `planSession()` — 8-scenario session planner with learning path integration
- `CONCEPT_SITUATIONS` — optimal game situations per concept
- "Try Again?" button on wrong answers
- `COACH_VOICES` — 3 personas (Rookie/Varsity/Scout) in both pipelines
- Age-adaptive prompt injection with forbidden concepts and strategic adjustments
- `LEARNING_PATHS` — 8 paths with 39 concept tags, wired into `planSession()`
- `getCurrentPath()` / `getNextInPath()` — learning path progression helpers
- Connected scenario arcs in agent pipeline
- `computeBaseballIQ()` — displayed on home screen and stats panel
- Streak-aware coaching with hot/cold streak detection and auto-remediation

## PHASE D TASKS (Do these in order)

### Task 17: Population Difficulty Calibration Endpoint (Pillar 6A)
**Goal**: Build a worker endpoint that reads `learning_events` data and returns concepts that are too hard or too easy across the player population.

- In `worker/index.js`, add a new route handler for `GET /analytics/difficulty-calibration`:
  ```javascript
  async function handleDifficultyCalibration(request, env, corsHeaders) {
    const db = env.DB
    if (!db) {
      return new Response(JSON.stringify({ error: "No database configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    try {
      // Find concepts with extreme correct rates in the last 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      const results = await db.prepare(`
        SELECT concept, position, difficulty,
               COUNT(*) as attempts,
               SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
               ROUND(AVG(CASE WHEN is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100) as pct
        FROM learning_events
        WHERE timestamp > ?
        GROUP BY concept, position, difficulty
        HAVING attempts >= 20
        ORDER BY pct ASC
      `).bind(thirtyDaysAgo).all()

      const calibrations = (results.results || [])
        .filter(r => r.pct < 30 || r.pct > 90)
        .map(r => ({
          concept: r.concept,
          position: r.position,
          difficulty: r.difficulty,
          correctRate: r.pct,
          attempts: r.attempts,
          adjustment: r.pct < 30 ? "too_hard" : "too_easy"
        }))

      return new Response(JSON.stringify({ calibrations, queriedAt: new Date().toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }
  }
  ```
- Wire this handler into the worker's router (find the URL routing section — look for other `/analytics/` routes).
- Deploy with `cd worker && npx wrangler deploy`.
- **Verify**: `curl https://your-worker-url/analytics/difficulty-calibration` should return `{ "calibrations": [], "queriedAt": "..." }` (empty until enough data accumulates).

### Task 18: Prompt Patches from Population Data (Pillar 6B)
**Goal**: When `planScenario()` runs, optionally fetch calibration data and inject prompt adjustments for concepts players struggle with.

- In `index.jsx`, add a cached fetch for calibration data:
  ```javascript
  let _calibrationCache = { data: null, fetchedAt: 0 }
  async function getCalibrationData() {
    const ONE_HOUR = 60 * 60 * 1000
    if (_calibrationCache.data && (Date.now() - _calibrationCache.fetchedAt) < ONE_HOUR) {
      return _calibrationCache.data
    }
    try {
      const res = await fetch(`${WORKER_BASE}/analytics/difficulty-calibration`)
      if (res.ok) {
        const json = await res.json()
        _calibrationCache = { data: json.calibrations || [], fetchedAt: Date.now() }
        return _calibrationCache.data
      }
    } catch (e) {
      console.warn("[BSM] Calibration fetch failed:", e.message)
    }
    return _calibrationCache.data || []
  }
  ```
- In `buildAgentPrompt()` (or `planScenario()`), if calibration data is available and the selected concept appears as `too_hard`:
  - Add to the plan: `promptPatch: "NOTE: This concept has a population mastery rate below 30%. Players find it very difficult. Make the correct answer more obvious than usual. The best explanation should be especially clear with a concrete example."`
  - Inject this patch into the prompt text
- If the concept is `too_easy`:
  - Add: `promptPatch: "NOTE: This concept has >90% correct rate. Increase the nuance — add a tempting distractor option that requires deeper understanding to distinguish from the correct answer."`
- The calibration fetch should be **non-blocking** — don't delay scenario generation waiting for it. Use whatever is in cache; if cache is empty, skip the patch.
- **Verify**: Mock the calibration response (temporarily hardcode a test concept as "too_hard") and verify the prompt includes the patch. Then remove the mock.

### Task 19: A/B Test Result Collection Endpoint (Pillar 6D)
**Goal**: The client tracks A/B variant assignments but can't report outcomes to the server. Build the endpoint.

- In `worker/index.js`, add a new route handler for `POST /analytics/ab-results`:
  ```javascript
  async function handleABResults(request, env, corsHeaders) {
    const db = env.DB
    if (!db) {
      return new Response(JSON.stringify({ error: "No database configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    try {
      const body = await request.json()
      const events = Array.isArray(body.events) ? body.events : [body]

      for (const event of events.slice(0, 50)) {
        await db.prepare(`
          INSERT INTO ab_results (test_id, variant_id, session_hash, metric, value, timestamp)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          event.testId || "",
          event.variantId || "",
          event.sessionHash || "",
          event.metric || "",
          event.value || 0,
          event.timestamp || Date.now()
        ).run()
      }

      return new Response(JSON.stringify({ stored: events.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }
  }
  ```
- Create the D1 table. Add a migration comment at the top of the handler or in a README:
  ```sql
  CREATE TABLE IF NOT EXISTS ab_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id TEXT NOT NULL,
    variant_id TEXT NOT NULL,
    session_hash TEXT,
    metric TEXT NOT NULL,
    value REAL DEFAULT 0,
    timestamp INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_ab_test ON ab_results(test_id, variant_id);
  ```
- Wire the handler into the worker's router.
- In `index.jsx`, add a function to report A/B outcomes:
  ```javascript
  function reportABResult(testId, variantId, metric, value) {
    const sessionHash = stats.sessionHash || analyticsSessionHash || "anon"
    try {
      fetch(`${WORKER_BASE}/analytics/ab-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId, variantId, sessionHash, metric, value, timestamp: Date.now() })
      }).catch(() => {}) // Fire and forget
    } catch (e) { /* silent */ }
  }
  ```
- Call `reportABResult()` after each AI scenario is graded — report the agent grade, whether the player got it correct, and the variant assignments. Find where AI scenario results are processed (near where `aiMetrics` is updated) and add the call there.
- Deploy the worker with `cd worker && npx wrangler deploy`.
- **Note for manual execution**: The D1 migration needs to be run:
  ```
  npx wrangler d1 execute bsm-accounts --command="CREATE TABLE IF NOT EXISTS ab_results (id INTEGER PRIMARY KEY AUTOINCREMENT, test_id TEXT NOT NULL, variant_id TEXT NOT NULL, session_hash TEXT, metric TEXT NOT NULL, value REAL DEFAULT 0, timestamp INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
  npx wrangler d1 execute bsm-accounts --command="CREATE INDEX IF NOT EXISTS idx_ab_test ON ab_results(test_id, variant_id);"
  ```
  Add this as a note in your commit message so Blaine knows to run it.
- **Verify**: Play an AI scenario and check network tab — a POST to `/analytics/ab-results` should fire. The worker should return `{ "stored": 1 }`.

### Task 20: Increase Agent Pipeline to 50% Traffic (Pillar 5C)
**Goal**: The agent pipeline is at 20%. Increase to 50% now that it has brain validation, pedagogical grading, session planning, and connected arcs.

- Find the `agent_pipeline` entry in `AB_TESTS` (search for `agent_pipeline` — it should be near the other A/B test definitions).
- Change the weights from 80/20 to 50/50:
  ```javascript
  agent_pipeline: {
    id: "agent_pipeline_v2", // Bump version to reset buckets
    variants: [
      { id: "control", weight: 50, config: { useAgent: false } },
      { id: "agent", weight: 50, config: { useAgent: true } }
    ]
  }
  ```
- **Verify**: Log the A/B variant assignment when AI scenarios generate. Over several attempts, roughly half should show `[BSM Agent]` pipeline logs.

### Task 21: Progressive Explanation Depth — 3-Layer UI (Pillar 1C)
**Goal**: After answering, show three expandable layers of explanation: Simple (always visible), Why (tap to expand), Data (for advanced players).

- This task has TWO parts: the AI response format change AND the UI rendering change.

**Part 1: AI Prompt Change**
- In `buildAgentPrompt()` and the standard `generateAIScenario()` prompt, change the explanation format instruction:
  - OLD: `"explanations":["Why A","Why B","Why C","Why D"]`
  - NEW: Each explanation should have a `simple` (1-2 sentences, always shown) and optionally `why` (2-3 sentences, strategic reasoning) and `data` (stats/numbers, ages 12+ only)
  - BUT: Don't break the JSON format. Instead, keep `explanations` as 4 strings but add a NEW field `explDepth` with the expanded versions:
    ```json
    "explDepth": [
      { "simple": "Short version", "why": "Strategic reasoning", "data": "RE24 = 0.71..." },
      { "simple": "Short version", "why": "Why this fails" },
      { "simple": "Short version", "why": "Why this is risky" },
      { "simple": "Short version", "why": "Why this doesn't work here" }
    ]
    ```
  - The `explanations` field stays as the fallback (backward compatible with handcrafted scenarios).
  - Add to the prompt: `"Also include 'explDepth' array with objects having 'simple' (1-2 sentences), 'why' (2-3 sentences strategic reasoning), and optionally 'data' (statistics, only for the best answer)."`

**Part 2: UI Rendering**
- Find where explanations are displayed after the player answers (look for where `scenario.explanations[chosenIdx]` or similar is rendered).
- If `scenario.explDepth` exists and has data for the current option:
  1. Show `explDepth[idx].simple` by default
  2. Show a "Why?" button/link that expands to show `explDepth[idx].why`
  3. For the BEST answer only, and only if the player's level suggests age 12+, show a "📊 Data" button that expands to show `explDepth[idx].data`
- If `explDepth` doesn't exist (handcrafted scenarios), fall back to showing `explanations[idx]` as today.
- Style the expand/collapse to match the existing UI. Use simple React state (`useState`) for the expand toggles.
- **Verify**: Generate an AI scenario, answer it, and verify:
  - The simple explanation shows immediately
  - A "Why?" toggle appears and expands to show deeper reasoning
  - For the best answer, a "📊 Data" toggle appears (if the AI included data)
  - Handcrafted scenarios still display correctly with the old format

## WHEN PHASE D IS DONE

Verify the full feedback loop:
1. Play 5+ AI scenarios — learning events should POST to the worker
2. Check `/analytics/difficulty-calibration` returns (even if empty)
3. Check network tab for `/analytics/ab-results` POST on each AI scenario
4. Verify ~50% of AI scenarios use the agent pipeline (console logs)
5. Verify 3-layer explanations work on AI scenarios and old format works on handcrafted

Then tell me you're ready for Phase E (the final phase).

Also: note any D1 migrations that Blaine needs to run manually (Task 19's `ab_results` table).
