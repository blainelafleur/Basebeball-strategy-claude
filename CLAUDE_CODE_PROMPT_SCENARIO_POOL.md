# Claude Code Prompt — Community Scenario Pool System

This is a LARGE feature. Copy-paste the entire prompt below into Claude Code. It touches both `worker/index.js` (server) and `index.jsx` (client).

---

```
I need you to build a Community Scenario Pool system for Baseball Strategy Master. This is a 3-part system:

1. A server-side D1 database pool of AI-generated scenarios shared across ALL users
2. A client-side localStorage pool for unused pre-cached scenarios
3. A 3-tier retrieval pipeline: local cache → server pool → fresh AI generation

The goal: every time ANY user gets a high-quality AI scenario, it gets uploaded to a shared server pool. Over time this builds a massive library of quality-graded, community-tested scenarios that makes the app faster for everyone and creates an inventory moat no competitor can replicate.

Read BOTH files (index.jsx and worker/index.js) completely before making any changes.

═══════════════════════════════════════════════════════════════
PART 1: SERVER SIDE (worker/index.js)
═══════════════════════════════════════════════════════════════

STEP 1A — Add the D1 migration SQL as a comment near the other CREATE TABLE comments (around line 43-91). Add this block:

```sql
// Community Scenario Pool — shared across all users
// CREATE TABLE IF NOT EXISTS scenario_pool (
//   id TEXT PRIMARY KEY,
//   position TEXT NOT NULL,
//   difficulty INTEGER NOT NULL DEFAULT 2,
//   concept TEXT,
//   concept_tag TEXT,
//   title TEXT NOT NULL,
//   scenario_json TEXT NOT NULL,
//   quality_score REAL DEFAULT 0,
//   audit_score REAL DEFAULT 0,
//   times_served INTEGER DEFAULT 0,
//   times_correct INTEGER DEFAULT 0,
//   times_wrong INTEGER DEFAULT 0,
//   times_flagged INTEGER DEFAULT 0,
//   correct_rate REAL GENERATED ALWAYS AS (CASE WHEN times_served > 0 THEN CAST(times_correct AS REAL) / times_served ELSE 0 END) STORED,
//   flag_rate REAL GENERATED ALWAYS AS (CASE WHEN times_served > 0 THEN CAST(times_flagged AS REAL) / times_served ELSE 0 END) STORED,
//   source TEXT DEFAULT 'ai',
//   contributed_by TEXT,
//   created_at INTEGER NOT NULL,
//   last_served_at INTEGER,
//   retired INTEGER DEFAULT 0
// );
// CREATE INDEX IF NOT EXISTS idx_pool_position ON scenario_pool(position);
// CREATE INDEX IF NOT EXISTS idx_pool_pos_diff ON scenario_pool(position, difficulty);
// CREATE INDEX IF NOT EXISTS idx_pool_concept ON scenario_pool(concept_tag);
// CREATE INDEX IF NOT EXISTS idx_pool_quality ON scenario_pool(quality_score);
// CREATE INDEX IF NOT EXISTS idx_pool_retired ON scenario_pool(retired);
```

STEP 1B — Add a POST /scenario-pool/submit endpoint. Place it near the other handler functions (after handleScenarioGrade). Here's the handler:

```js
// POST /scenario-pool/submit — contribute a quality AI scenario to the shared pool
async function handlePoolSubmit(request, env, cors) {
  try {
    const body = await request.json();
    const { scenario, position, quality_score, audit_score, source } = body;

    if (!scenario || !position || !scenario.title) {
      return jsonResponse({ error: "Missing scenario, position, or title" }, 400, cors);
    }

    // Quality gate: only accept scenarios scoring >= 8.0
    if ((quality_score || 0) < 8.0) {
      return jsonResponse({ error: "Quality score too low for pool", min: 8.0, got: quality_score }, 400, cors);
    }

    // Generate stable pool ID from content hash (prevents exact duplicates)
    const hashInput = `${position}:${scenario.title}:${scenario.concept || ""}:${(scenario.options || []).join("|")}`;
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(hashInput));
    const poolId = "pool_" + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);

    // Check for duplicate
    const existing = await env.DB.prepare("SELECT id FROM scenario_pool WHERE id = ?").bind(poolId).first();
    if (existing) {
      // Update quality score if new score is higher
      await env.DB.prepare("UPDATE scenario_pool SET quality_score = MAX(quality_score, ?), audit_score = MAX(audit_score, ?) WHERE id = ?")
        .bind(quality_score || 0, audit_score || 0, poolId).run();
      return jsonResponse({ status: "duplicate_updated", id: poolId }, 200, cors);
    }

    // Strip fields that shouldn't be in the pool (user-specific data)
    const cleanScenario = {
      title: scenario.title,
      diff: scenario.diff,
      description: scenario.description,
      situation: scenario.situation,
      options: scenario.options,
      best: scenario.best,
      explanations: scenario.explanations,
      rates: scenario.rates,
      concept: scenario.concept,
      conceptTag: scenario.conceptTag || null,
      anim: scenario.anim || "freeze",
      explSimple: scenario.explSimple || null,
      explDepth: scenario.explDepth || null
    };

    await env.DB.prepare(`
      INSERT INTO scenario_pool (id, position, difficulty, concept, concept_tag, title, scenario_json, quality_score, audit_score, source, contributed_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      poolId,
      position,
      scenario.diff || 2,
      scenario.concept || "",
      scenario.conceptTag || "",
      scenario.title,
      JSON.stringify(cleanScenario),
      quality_score || 0,
      audit_score || 0,
      source || "ai",
      "anonymous",
      Date.now()
    ).run();

    console.log(`[BSM Pool] New scenario added: "${scenario.title}" (${position}, quality: ${quality_score})`);
    return jsonResponse({ status: "added", id: poolId }, 201, cors);
  } catch (e) {
    console.error("[BSM Pool] Submit error:", e.message);
    return jsonResponse({ error: e.message }, 500, cors);
  }
}
```

STEP 1C — Add a GET /scenario-pool/fetch endpoint:

```js
// GET /scenario-pool/fetch?position=X&difficulty=Y&concept=Z&exclude=id1,id2
async function handlePoolFetch(request, env, cors) {
  try {
    const url = new URL(request.url);
    const position = url.searchParams.get("position");
    const difficulty = parseInt(url.searchParams.get("difficulty") || "2");
    const conceptTag = url.searchParams.get("concept") || null;
    const exclude = (url.searchParams.get("exclude") || "").split(",").filter(Boolean);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "3"), 10);

    if (!position) {
      return jsonResponse({ error: "position required" }, 400, cors);
    }

    // Build query — prioritize: high quality, low flag rate, concept match
    let query = `
      SELECT id, scenario_json, quality_score, audit_score, times_served, correct_rate
      FROM scenario_pool
      WHERE position = ? AND difficulty = ? AND retired = 0
        AND (times_served < 3 OR flag_rate < 0.10)
    `;
    const params = [position, difficulty];

    // Exclude already-seen scenarios
    if (exclude.length > 0 && exclude.length <= 200) {
      query += ` AND id NOT IN (${exclude.map(() => "?").join(",")})`;
      params.push(...exclude);
    }

    // Prefer concept match if provided
    if (conceptTag) {
      query += ` ORDER BY CASE WHEN concept_tag = ? THEN 0 ELSE 1 END, quality_score DESC, RANDOM()`;
      params.push(conceptTag);
    } else {
      query += ` ORDER BY quality_score DESC, RANDOM()`;
    }

    query += ` LIMIT ?`;
    params.push(limit);

    const results = await env.DB.prepare(query).bind(...params).all();

    // Update times_served for returned scenarios
    if (results.results && results.results.length > 0) {
      const ids = results.results.map(r => r.id);
      // Non-blocking update
      env.DB.prepare(`UPDATE scenario_pool SET times_served = times_served + 1, last_served_at = ? WHERE id IN (${ids.map(() => "?").join(",")})`)
        .bind(Date.now(), ...ids).run().catch(() => {});
    }

    const scenarios = (results.results || []).map(r => {
      try {
        const sc = JSON.parse(r.scenario_json);
        sc.id = r.id; // use pool ID
        sc.isAI = true;
        sc.isPooled = true;
        sc.poolQuality = r.quality_score;
        return sc;
      } catch { return null; }
    }).filter(Boolean);

    return jsonResponse({
      scenarios,
      total: scenarios.length,
      pool_size: await env.DB.prepare("SELECT COUNT(*) as cnt FROM scenario_pool WHERE position = ? AND retired = 0").bind(position).first().then(r => r?.cnt || 0)
    }, 200, cors);
  } catch (e) {
    console.error("[BSM Pool] Fetch error:", e.message);
    return jsonResponse({ error: e.message }, 500, cors);
  }
}
```

STEP 1D — Add a POST /scenario-pool/feedback endpoint:

```js
// POST /scenario-pool/feedback — report outcome for a pool scenario
async function handlePoolFeedback(request, env, cors) {
  try {
    const { pool_id, correct, flagged } = await request.json();
    if (!pool_id) return jsonResponse({ error: "pool_id required" }, 400, cors);

    if (correct === true) {
      await env.DB.prepare("UPDATE scenario_pool SET times_correct = times_correct + 1 WHERE id = ?").bind(pool_id).run();
    } else if (correct === false) {
      await env.DB.prepare("UPDATE scenario_pool SET times_wrong = times_wrong + 1 WHERE id = ?").bind(pool_id).run();
    }
    if (flagged) {
      await env.DB.prepare("UPDATE scenario_pool SET times_flagged = times_flagged + 1 WHERE id = ?").bind(pool_id).run();
      // Auto-retire if flagged too many times
      await env.DB.prepare("UPDATE scenario_pool SET retired = 1 WHERE id = ? AND times_flagged >= 3 AND times_served >= 5 AND CAST(times_flagged AS REAL) / times_served > 0.15").bind(pool_id).run();
    }

    return jsonResponse({ status: "ok" }, 200, cors);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors);
  }
}
```

STEP 1E — Add a GET /scenario-pool/stats endpoint (for monitoring inventory):

```js
// GET /scenario-pool/stats — pool inventory overview
async function handlePoolStats(request, env, cors) {
  try {
    const byPosition = await env.DB.prepare(`
      SELECT position, difficulty, COUNT(*) as count,
        ROUND(AVG(quality_score), 1) as avg_quality,
        SUM(times_served) as total_served,
        ROUND(AVG(CASE WHEN times_served > 0 THEN CAST(times_correct AS REAL) / times_served ELSE 0 END), 2) as avg_correct_rate
      FROM scenario_pool WHERE retired = 0
      GROUP BY position, difficulty
      ORDER BY position, difficulty
    `).all();

    const total = await env.DB.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN retired = 1 THEN 1 ELSE 0 END) as retired FROM scenario_pool").first();

    return jsonResponse({
      total: total?.total || 0,
      retired: total?.retired || 0,
      active: (total?.total || 0) - (total?.retired || 0),
      by_position: byPosition.results || []
    }, 200, cors);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors);
  }
}
```

STEP 1F — Wire up the new endpoints in the worker's main router. Find the section where routes are matched (look for patterns like `if (path === "/analytics/scenario-grade"` or the main routing switch). Add these routes:

```js
    if (path === "/scenario-pool/submit" && request.method === "POST") {
      return await handlePoolSubmit(request, env, cors);
    }
    if (path === "/scenario-pool/fetch" && request.method === "GET") {
      return await handlePoolFetch(request, env, cors);
    }
    if (path === "/scenario-pool/feedback" && request.method === "POST") {
      return await handlePoolFeedback(request, env, cors);
    }
    if (path === "/scenario-pool/stats" && request.method === "GET") {
      return await handlePoolStats(request, env, cors);
    }
```

These routes should NOT require authentication (pool scenarios are anonymous community contributions). But they SHOULD be rate-limited. Apply the same RATE_LIMIT_AI check (10 req/min/IP) to the submit and feedback endpoints to prevent abuse.

═══════════════════════════════════════════════════════════════
PART 2: CLIENT SIDE — LOCAL POOL + SERVER POOL (index.jsx)
═══════════════════════════════════════════════════════════════

STEP 2A — Add a local scenario pool manager near the existing _aiCache (around line 9019). Insert BEFORE the _aiCache definition:

```js
// ═══════════════════════════════════════════════════════════════
// Community Scenario Pool — 3-tier retrieval system
// Tier 1: localStorage pool (unused pre-cached scenarios)
// Tier 2: Server pool (community-contributed quality scenarios)
// Tier 3: Fresh AI generation (fallback)
// ═══════════════════════════════════════════════════════════════
const LOCAL_POOL_KEY = "bsm_scenario_pool"
const LOCAL_POOL_MAX = 50 // max scenarios stored locally

function getLocalPool() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_POOL_KEY) || "[]")
  } catch { return [] }
}

function saveToLocalPool(scenario, position) {
  try {
    const pool = getLocalPool()
    // Dedup by title + position
    if (pool.some(p => p.scenario.title === scenario.title && p.position === position)) return
    pool.push({
      scenario,
      position,
      difficulty: scenario.diff || 2,
      conceptTag: scenario.conceptTag || "",
      quality: scenario.qualityGrade || 0,
      savedAt: Date.now()
    })
    // Trim to max, removing oldest first
    while (pool.length > LOCAL_POOL_MAX) pool.shift()
    localStorage.setItem(LOCAL_POOL_KEY, JSON.stringify(pool))
    console.log("[BSM Pool] Saved to local pool:", scenario.title, "(" + position + "). Pool size:", pool.length)
  } catch (e) {
    console.warn("[BSM Pool] Local save failed:", e.message)
  }
}

function consumeFromLocalPool(position, difficulty, excludeIds = []) {
  try {
    const pool = getLocalPool()
    const matchIdx = pool.findIndex(p =>
      p.position === position &&
      p.difficulty === difficulty &&
      !excludeIds.includes(p.scenario.id)
    )
    if (matchIdx === -1) return null
    const match = pool.splice(matchIdx, 1)[0]
    localStorage.setItem(LOCAL_POOL_KEY, JSON.stringify(pool))
    console.log("[BSM Pool] Consumed from local pool:", match.scenario.title)
    return match.scenario
  } catch { return null }
}

async function fetchFromServerPool(position, difficulty, conceptTag, excludeIds = []) {
  try {
    const params = new URLSearchParams({ position, difficulty: String(difficulty) })
    if (conceptTag) params.set("concept", conceptTag)
    if (excludeIds.length > 0 && excludeIds.length <= 100) {
      params.set("exclude", excludeIds.slice(0, 100).join(","))
    }
    const response = await Promise.race([
      fetch(WORKER_BASE + "/scenario-pool/fetch?" + params.toString()),
      new Promise((_, rej) => setTimeout(() => rej(new Error("pool-timeout")), 5000))
    ])
    if (!response.ok) return null
    const data = await response.json()
    if (data.scenarios && data.scenarios.length > 0) {
      console.log("[BSM Pool] Fetched from server pool:", data.scenarios.length, "scenarios. Pool size:", data.pool_size)
      return data.scenarios[0] // return best match
    }
    return null
  } catch (e) {
    console.warn("[BSM Pool] Server fetch failed:", e.message)
    return null
  }
}

function submitToServerPool(scenario, position, qualityScore, auditScore) {
  // Non-blocking — fire and forget
  if ((qualityScore || 0) < 8.0) return // only submit quality scenarios
  fetch(WORKER_BASE + "/scenario-pool/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenario,
      position,
      quality_score: qualityScore,
      audit_score: auditScore || 0,
      source: "ai"
    })
  }).then(r => r.json()).then(data => {
    if (data.status === "added") console.log("[BSM Pool] Contributed to server pool:", scenario.title)
    else if (data.status === "duplicate_updated") console.log("[BSM Pool] Updated existing pool entry:", scenario.title)
  }).catch(() => {})
}

function reportPoolFeedback(poolId, correct, flagged = false) {
  if (!poolId || !poolId.startsWith("pool_")) return // only for pool scenarios
  fetch(WORKER_BASE + "/scenario-pool/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pool_id: poolId, correct, flagged })
  }).catch(() => {})
}
```

STEP 2B — Upload quality scenarios to the server pool. Find the section in generateAIScenario() where the quality grade is computed and reported (around line 8873-8884, the section with "Level 2.2: Grade scenario quality"). AFTER the existing fetch to /analytics/scenario-grade, add:

```js
      // Upload to community pool if quality is high enough
      if (grade.score >= 80) {
        submitToServerPool(scenario, position, grade.score / 10, scenario.auditScore || 0)
      }
```

Note: grade.score is 0-100 in the grader, but the pool expects a quality_score in the range 0-10. So we pass `grade.score / 10`. The pool's quality gate is >= 8.0 which maps to grade >= 80.

STEP 2C — Save unused pre-cached scenarios to the local pool. Find the consumeCachedAI() function (around line 9040). The current code deletes the cached scenario when the user switches to a DIFFERENT position. We need to save it instead.

Find the _aiCache object and the consumeCachedAI function. The key change: when a user switches positions and we're about to overwrite the cache, save the old one to the local pool.

Find the prefetchAIScenario function (around line 9020). At the START of the function, before it starts fetching, check if there's an existing cached scenario for a DIFFERENT position and save it:

```js
async function prefetchAIScenario(position, stats, conceptsLearned, recentWrong, aiHistory) {
  if (_aiCache.fetching) return
  // Save existing cache for different position to local pool before overwriting
  if (_aiCache.scenario && _aiCache.position && _aiCache.position !== position) {
    saveToLocalPool(_aiCache.scenario.scenario, _aiCache.position)
    _aiCache.scenario = null
    _aiCache.position = null
  }
  if (_aiCache.scenario && _aiCache.position === position) return // already cached for this position
  // ... rest of function unchanged
```

Also find the aiCacheRef-based caching in the App component. Around lines 10443-10448 and 10475-10480, there are just-in-time precache calls that store to `aiCacheRef.current.scenarios[p]`. When a NEW scenario is about to overwrite an existing cached scenario for a DIFFERENT position, save the old one first.

Find the two .then() callbacks that look like:
  .then(result=>{if(result?.scenario){aiCacheRef.current.scenarios[p]=result;...}})

Add a check before overwriting — if there's already a cached scenario for this position that hasn't been used, save it to the local pool:
  .then(result=>{if(result?.scenario){
    // Save existing cache to local pool if being overwritten
    const existingCached = aiCacheRef.current.scenarios[p]
    if (existingCached?.scenario) saveToLocalPool(existingCached.scenario, p)
    aiCacheRef.current.scenarios[p]=result;...
  }})

STEP 2D — Wire up the 3-tier retrieval. Find the doAI async function (around line 10285). Currently it checks the aiCacheRef first, then falls through to live AI generation. We need to add local pool and server pool as intermediate tiers.

Find this block (around line 10289-10309):
```js
      const cachedResult=aiCacheRef.current.scenarios[p]
      if(cachedResult?.scenario){
        delete aiCacheRef.current.scenarios[p]
        const cachedSc=cachedResult.scenario
        console.log("[BSM] Using pre-cached AI scenario:", cachedSc.title)
        // ... rest of cached scenario handling
      }
```

AFTER this block (right after the `return` statement that ends the cached scenario block, around line 10308), and BEFORE the cooldown check (around line 10311), insert these two new tiers:

```js
      // Tier 1: Check local scenario pool
      const maxDiffForPos = (AGE_GROUPS.find(a=>a.id===stats.ageGroup)||AGE_GROUPS[2]).maxDiff
      const diffForPool = (stats.ps?.[p]?.p||0) > 0 ? ((stats.ps[p].c/stats.ps[p].p) > 0.75 ? Math.min(3,maxDiffForPos) : (stats.ps[p].c/stats.ps[p].p) > 0.5 ? Math.min(2,maxDiffForPos) : 1) : 1
      const excludePoolIds = [...(stats.cl || []), ...(stats.aiHistory || []).map(h => h.id)]
      const localPoolSc = consumeFromLocalPool(p, diffForPool, excludePoolIds)
      if (localPoolSc) {
        console.log("[BSM] Using local pool scenario:", localPoolSc.title)
        localPoolSc.isPooled = true
        setAiMode(true); setScreen("play")
        aiFailRef.current.consecutive = 0; aiFailRef.current.cooldownUntil = 0
        trackAnalyticsEvent("ai_scenario_generated", { pos: p, concept: localPoolSc.conceptTag || "", diff: localPoolSc.diff, source: "local_pool" }, { ageGroup: stats.ageGroup, isPro: stats.isPro })
        setStats(prev => {
          const entry = { id: localPoolSc.id, title: localPoolSc.title, position: p, diff: localPoolSc.diff, concept: localPoolSc.concept, conceptTag: localPoolSc.conceptTag || null, generatedAt: Date.now(), answered: false, correct: null, chosenIdx: null }
          const hist = [...(prev.aiHistory || []), entry].slice(-100)
          return { ...prev, aiHistory: hist }
        })
        setSc(localPoolSc)
        localPoolSc.options.forEach((_, i) => { setTimeout(() => setRi(i), 120 + i * 80) })
        return
      }

      // Tier 2: Check server community pool
      try {
        const serverPoolSc = await fetchFromServerPool(p, diffForPool, null, excludePoolIds)
        if (serverPoolSc) {
          console.log("[BSM] Using server pool scenario:", serverPoolSc.title)
          serverPoolSc.isPooled = true
          setAiMode(true); setScreen("play")
          aiFailRef.current.consecutive = 0; aiFailRef.current.cooldownUntil = 0
          trackAnalyticsEvent("ai_scenario_generated", { pos: p, concept: serverPoolSc.conceptTag || "", diff: serverPoolSc.diff, source: "server_pool" }, { ageGroup: stats.ageGroup, isPro: stats.isPro })
          setStats(prev => {
            const entry = { id: serverPoolSc.id, title: serverPoolSc.title, position: p, diff: serverPoolSc.diff, concept: serverPoolSc.concept, conceptTag: serverPoolSc.conceptTag || null, generatedAt: Date.now(), answered: false, correct: null, chosenIdx: null }
            const hist = [...(prev.aiHistory || []), entry].slice(-100)
            return { ...prev, aiHistory: hist }
          })
          setSc(serverPoolSc)
          serverPoolSc.options.forEach((_, i) => { setTimeout(() => setRi(i), 120 + i * 80) })
          return
        }
      } catch (e) {
        console.warn("[BSM] Server pool fetch failed, falling through to AI generation:", e.message)
      }

      // Tier 3: Fresh AI generation (existing code continues below)
```

STEP 2E — Report feedback on pool scenarios. Find the section where the user answers a scenario and the result is processed (search for where `correct` and `scenario.id` or `sc.id` are used together to update stats). There should be a handler that runs when the user selects an answer. In that handler, add:

```js
      // Report pool scenario feedback
      if (sc.isPooled && sc.id) {
        reportPoolFeedback(sc.id, isCorrect, false)
      }
```

Also find where scenarios get flagged by users (search for "flag-scenario" or "flagScenario"). In that handler, add:

```js
      // Report flag to pool
      if (sc.isPooled && sc.id) {
        reportPoolFeedback(sc.id, false, true)
      }
```

═══════════════════════════════════════════════════════════════
PART 3: VERIFICATION
═══════════════════════════════════════════════════════════════

After making all changes, verify:

1. WORKER ENDPOINTS:
   - Search worker/index.js for "handlePoolSubmit" — should exist
   - Search for "handlePoolFetch" — should exist
   - Search for "handlePoolFeedback" — should exist
   - Search for "handlePoolStats" — should exist
   - Search for "/scenario-pool/" in the router section — should have 4 routes

2. CLIENT FUNCTIONS:
   - Search index.jsx for "getLocalPool" — should exist
   - Search for "saveToLocalPool" — should exist
   - Search for "consumeFromLocalPool" — should exist
   - Search for "fetchFromServerPool" — should exist
   - Search for "submitToServerPool" — should exist
   - Search for "reportPoolFeedback" — should exist

3. INTEGRATION POINTS:
   - Search for "submitToServerPool" — should appear after gradeScenario in generateAIScenario
   - Search for "saveToLocalPool" — should appear in prefetchAIScenario (position switch save)
   - Search for "consumeFromLocalPool" — should appear in doAI function
   - Search for "fetchFromServerPool" — should appear in doAI function
   - Search for "reportPoolFeedback" — should appear where answers are processed and where scenarios are flagged

4. POOL CONFIG:
   - LOCAL_POOL_KEY = "bsm_scenario_pool"
   - LOCAL_POOL_MAX = 50
   - Quality gate for server submission: grade.score >= 80 (in grader scale) which equals quality_score >= 8.0 (in pool scale)
   - Server pool auto-retires scenarios with flag_rate > 15% after 5+ serves
   - Server pool fetch timeout: 5000ms (fast, non-blocking)

5. NO REGRESSIONS:
   - The existing _aiCache prefetch system still works (Tier 0: React ref cache)
   - The existing doAI flow still falls through to live AI generation if pools are empty (Tier 3)
   - localStorage key "bsm_v5" is NOT touched (pool uses separate key "bsm_scenario_pool")

IMPORTANT: After making all changes to worker/index.js, I need to:
1. Run the D1 migration SQL to create the scenario_pool table
2. Redeploy the worker with: cd worker && npx wrangler deploy
```
