# Claude Code Prompt — Fix Server Pool Repeat-Serving Bug

## The Problem

After implementing the Community Scenario Pool, the app repeatedly serves the SAME pool scenario in an infinite loop. Console shows patterns like:
```
Contributed to server pool: Clock Control Tempo
Using server pool scenario: Clock Control Tempo
Using server pool scenario: Clock Control Tempo
Using server pool scenario: Clock Control Tempo
```

This happens because `excludePoolIds` is built from `stats.aiHistory`, but `setStats()` is asynchronous (React state batching). When `doAI()` runs again before React re-renders, `stats.aiHistory` is STALE — it doesn't contain the pool scenario ID that was just served. So the same ID isn't excluded and gets fetched again.

## The Fix: Session-Level Served Tracker

We need a module-level `Set` (outside React state) that gets updated SYNCHRONOUSLY when any pool/AI scenario is served. This bypasses React's async batching entirely.

---

### STEP 1: Add a module-level served tracker

Find this block near line 9028:
```javascript
const LOCAL_POOL_KEY = "bsm_scenario_pool"
const LOCAL_POOL_MAX = 50
```

Add BEFORE it (around line 9026):
```javascript
// Session-level tracker for served scenario IDs — bypasses React state batching
const _servedScenarioIds = new Set()
```

---

### STEP 2: Build excludePoolIds using BOTH React state AND the session tracker

In the `doAI` function, find the line that builds excludePoolIds. It looks like:
```javascript
const excludePoolIds = [...(stats.cl || []), ...(stats.aiHistory || []).map(h => h.id)]
```

Replace it with:
```javascript
const excludePoolIds = [...new Set([
  ...(stats.cl || []),
  ...(stats.aiHistory || []).map(h => h.id),
  ..._servedScenarioIds
])]
```

This merges three sources: completed handcrafted IDs, aiHistory IDs, AND the synchronous session tracker. The `new Set()` deduplicates.

---

### STEP 3: Update _servedScenarioIds immediately when ANY scenario is served

Find every place in `doAI()` where a scenario is served from cache, local pool, server pool, or fresh AI. There should be 4 blocks that call `setStats(prev => ...)` to add to aiHistory. In EACH of these blocks, add `_servedScenarioIds.add(scenarioId)` BEFORE the setStats call.

**3a. Tier 0 — Pre-cached scenario block:**
Find the block that starts with something like:
```javascript
const cachedResult = aiCacheRef.current.scenarios[p]
if (cachedResult?.scenario) {
```

Inside this block, right BEFORE the `setStats(prev => {` call, add:
```javascript
_servedScenarioIds.add(cachedSc.id)
```
(where `cachedSc` is the scenario variable used in that block — match the exact variable name used)

**3b. Tier 1 — Local pool scenario block:**
Find the block that handles `localPoolSc` (from `consumeFromLocalPool`). Right BEFORE the `setStats(prev => {` call, add:
```javascript
_servedScenarioIds.add(localPoolSc.id)
```

**3c. Tier 2 — Server pool scenario block:**
Find the block that handles `serverPoolSc` (from `fetchFromServerPool`). Right BEFORE the `setStats(prev => {` call, add:
```javascript
_servedScenarioIds.add(serverPoolSc.id)
```

**3d. Tier 3 — Fresh AI scenario block:**
Find the block at the end of `doAI()` where a freshly generated AI scenario is served. Right BEFORE its `setStats(prev => {` call, add:
```javascript
_servedScenarioIds.add(scenario.id)
```
(match the exact variable name — it might be `result.scenario.id` or just `scenario.id`)

---

### STEP 4: Also update _servedScenarioIds in the prefetch callback paths

Search for all `.then()` callbacks on prefetch promises (just-in-time precache). These are places where a prefetched result is immediately used. They also call `setStats` to add to aiHistory. Add `_servedScenarioIds.add()` there too.

Look for patterns like:
```javascript
.then(res => {
  if (res?.scenario) {
    // ... setStats to add to aiHistory
```

Add `_servedScenarioIds.add(res.scenario.id)` before the setStats call in each of these.

---

### STEP 5: Server-side safety — lower times_served threshold

In `worker/index.js`, find the `handlePoolFetch` function. Inside the SQL query, find:
```sql
AND (times_served < 3 OR flag_rate < 0.10)
```

Change `times_served < 3` to `times_served < 10`:
```sql
AND (times_served < 10 OR flag_rate < 0.10)
```

The `times_served < 3` was too aggressive for a small pool. The real dedup protection comes from the exclude list (Steps 2-4), not from capping serves. A good scenario can be served to many different users. The cap of 10 is just a safety net for truly overserved scenarios. The flag_rate check already handles quality issues.

---

### STEP 6: Client-side safety — fall through gracefully when pool returns same scenario

Add a final safety check in the server pool block in `doAI()`. After `fetchFromServerPool()` returns a scenario, verify it's not already in our exclude set:

Find the server pool handling block (Tier 2) that looks like:
```javascript
const serverPoolSc = await fetchFromServerPool(p, diffForPool, null, excludePoolIds)
if (serverPoolSc) {
```

Change the `if` condition to:
```javascript
if (serverPoolSc && !_servedScenarioIds.has(serverPoolSc.id)) {
```

This is a belt-and-suspenders check — even if the server returns a scenario we've already seen (race condition between times_served increment and concurrent requests), we skip it and fall through to fresh AI generation.

---

### STEP 7: Clear the session tracker on position switch or new session

Find where `_aiCache` is reset or cleared. There may be a block that handles position switching. Near any `_aiCache.scenario = null` or `_aiCache = {}` reset, you do NOT need to clear `_servedScenarioIds` — we WANT it to persist for the entire browser session so scenarios never repeat within a session.

However, to prevent `_servedScenarioIds` from growing unbounded in very long sessions, add a size cap. Find the `_servedScenarioIds` declaration you added in Step 1:
```javascript
const _servedScenarioIds = new Set()
```

Then in EACH place you do `_servedScenarioIds.add(id)` (all 4+ places from Steps 3-4), wrap it like:
```javascript
if (_servedScenarioIds.size > 500) _servedScenarioIds.clear()
_servedScenarioIds.add(scenarioId)
```

This caps at 500 served scenarios per session (way more than anyone would play), then resets. This prevents memory issues in extremely long sessions.

---

## Verification

After changes, verify:

1. Search index.jsx for `_servedScenarioIds` — should appear:
   - 1 declaration (`new Set()`)
   - 1 usage in `excludePoolIds` construction
   - 4+ places with `.add()` calls (one per tier + prefetch callbacks)
   - 1 place with `.has()` check (server pool safety gate in Step 6)

2. Search index.jsx for `excludePoolIds` — the construction should include `..._servedScenarioIds`

3. Search worker/index.js for `times_served` — the threshold should be `< 10`, not `< 3`

4. Test: Play 3 scenarios on the same position. Console should show:
   - First: "Fetched from server pool" or "Generated AI scenario"
   - Second: Should be a DIFFERENT scenario (not the same title)
   - Third: Should be yet another different scenario
   - You should NEVER see the same scenario title appear twice in a row

5. Check that these are NOT modified:
   - `_aiCache` structure (untouched)
   - `saveToLocalPool` logic (untouched)
   - `submitToServerPool` logic (untouched)
   - Any timeout values (untouched)

## IMPORTANT: After changing worker/index.js, redeploy with: cd worker && npx wrangler deploy
