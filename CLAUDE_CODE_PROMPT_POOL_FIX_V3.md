# Claude Code Prompt — Fix Pool Repeat-Serving (V3 — Title-Based Dedup)

## Root Cause (ACTUALLY found it this time)

When a fresh AI scenario is generated, it gets an ID like `ai_1709xxx_batter_2`. It's added to `_servedScenarioIds` with this ID. Then `submitToServerPool()` fires asynchronously and the server assigns a COMPLETELY DIFFERENT ID: `pool_a1b2c3d4e5f6g7h8` (SHA-256 hash of the content). The client never learns this pool ID.

On the next play:
- `poolExcludeIds` filters for IDs starting with `"pool_"` → the original `ai_` ID is filtered OUT
- Server pool returns the same scenario with its `pool_` ID
- `_servedScenarioIds.has("pool_xxx")` returns FALSE because it only contains `"ai_xxx"`
- Same scenario served again with a different ID

The same content has TWO different IDs and nothing catches the match.

## The Fix: Track Titles in Addition to IDs

Since a scenario can have different IDs but the TITLE stays the same, we add title-based dedup alongside ID-based dedup. This is simple, synchronous, and bulletproof.

---

### STEP 1: Add a title tracker next to the existing ID tracker

Find the `_servedScenarioIds` declaration (around line 9029):
```javascript
const _servedScenarioIds = new Set()
```

Add right after it:
```javascript
const _servedScenarioTitles = new Set()
```

---

### STEP 2: Update ALL places that add to _servedScenarioIds to also add the title

There are 4 places in `doAI()` that call `_servedScenarioIds.add()`. In EACH of them, add a corresponding `_servedScenarioTitles.add()` call right after. Match the variable names exactly as they appear in each block:

**2a. Tier 0 — Pre-cached scenario (around line 10417-10418):**
Find:
```javascript
if (_servedScenarioIds.size > 500) _servedScenarioIds.clear()
_servedScenarioIds.add(cachedSc.id)
```
Replace with:
```javascript
if (_servedScenarioIds.size > 500) { _servedScenarioIds.clear(); _servedScenarioTitles.clear() }
_servedScenarioIds.add(cachedSc.id)
_servedScenarioTitles.add(cachedSc.title)
```

**2b. Tier 1 — Local pool (around line 10442-10443):**
Find:
```javascript
if (_servedScenarioIds.size > 500) _servedScenarioIds.clear()
_servedScenarioIds.add(localPoolSc.id)
```
Replace with:
```javascript
if (_servedScenarioIds.size > 500) { _servedScenarioIds.clear(); _servedScenarioTitles.clear() }
_servedScenarioIds.add(localPoolSc.id)
_servedScenarioTitles.add(localPoolSc.title)
```

**2c. Tier 2 — Server pool (around line 10463-10464):**
Find:
```javascript
if (_servedScenarioIds.size > 500) _servedScenarioIds.clear()
_servedScenarioIds.add(serverPoolSc.id)
```
Replace with:
```javascript
if (_servedScenarioIds.size > 500) { _servedScenarioIds.clear(); _servedScenarioTitles.clear() }
_servedScenarioIds.add(serverPoolSc.id)
_servedScenarioTitles.add(serverPoolSc.title)
```

**2d. Tier 3 — Fresh AI (around line 10563-10564):**
Find:
```javascript
if (_servedScenarioIds.size > 500) _servedScenarioIds.clear()
_servedScenarioIds.add(result.scenario.id)
```
Replace with:
```javascript
if (_servedScenarioIds.size > 500) { _servedScenarioIds.clear(); _servedScenarioTitles.clear() }
_servedScenarioIds.add(result.scenario.id)
_servedScenarioTitles.add(result.scenario.title)
```

---

### STEP 3: Add title check to the server pool safety gate

Find the Tier 2 server pool check (around line 10457):
```javascript
if (serverPoolSc && !_servedScenarioIds.has(serverPoolSc.id)) {
```

Replace with:
```javascript
if (serverPoolSc && !_servedScenarioIds.has(serverPoolSc.id) && !_servedScenarioTitles.has(serverPoolSc.title)) {
```

This is the KEY fix — even if the IDs don't match (ai_xxx vs pool_xxx), the title match catches it.

---

### STEP 4: Add title check to the local pool safety gate

Find the Tier 1 local pool check (around line 10436):
```javascript
if (localPoolSc) {
```

Replace with:
```javascript
if (localPoolSc && !_servedScenarioTitles.has(localPoolSc.title)) {
```

If the local pool returns a scenario with a title we've already served, skip it and fall through.

---

### STEP 5: Add title check to the pre-cache (Tier 0)

Find the pre-cached scenario check (around line 10408):
```javascript
if(cachedResult?.scenario){
```

Replace with:
```javascript
if(cachedResult?.scenario && !_servedScenarioTitles.has(cachedResult.scenario.title)){
```

If the pre-cached scenario has a title we've already served (e.g., it was pre-generated while we were playing the same scenario from the pool), skip it and fall through to pool/fresh generation. Add an else after the existing block to clear the stale cache:

After the closing `return` of this Tier 0 block (around line 10428-10429), add:
```javascript
} else if (cachedResult?.scenario) {
  // Pre-cached scenario has already-served title — discard it
  delete aiCacheRef.current.scenarios[p]
  console.log("[BSM] Discarded pre-cached duplicate:", cachedResult.scenario.title)
}
```

So the full Tier 0 block becomes:
```javascript
if(cachedResult?.scenario && !_servedScenarioTitles.has(cachedResult.scenario.title)){
  // ... existing code that serves the cached scenario ...
  return
} else if (cachedResult?.scenario) {
  delete aiCacheRef.current.scenarios[p]
  console.log("[BSM] Discarded pre-cached duplicate:", cachedResult.scenario.title)
}
```

---

### STEP 6: Add title-based dedup to server-side pool fetch query

In `worker/index.js`, find the `handlePoolFetch` function. Add support for a `exclude_titles` parameter.

Find where the `exclude` parameter is parsed (around line 1696):
```javascript
const exclude = (url.searchParams.get("exclude") || "").split(",").filter(Boolean);
```

Add right after it:
```javascript
const excludeTitles = (url.searchParams.get("exclude_titles") || "").split("|").filter(Boolean);
```

Then find where the exclude NOT IN clause is added (around line 1714-1715):
```javascript
if (exclude.length > 0 && exclude.length <= 200) {
  query += ` AND id NOT IN (${exclude.map(() => "?").join(",")})`;
  params.push(...exclude);
}
```

Add right after that block:
```javascript
if (excludeTitles.length > 0 && excludeTitles.length <= 50) {
  query += ` AND title NOT IN (${excludeTitles.map(() => "?").join(",")})`;
  params.push(...excludeTitles);
}
```

---

### STEP 7: Send title exclusions from the client

In `fetchFromServerPool()` (around line 9078), the function signature currently is:
```javascript
async function fetchFromServerPool(position, difficulty, conceptTag, excludeIds = []) {
```

Change it to:
```javascript
async function fetchFromServerPool(position, difficulty, conceptTag, excludeIds = [], excludeTitles = []) {
```

Then find the URL params construction (around lines 9080-9084). After the exclude IDs block:
```javascript
if (excludeIds.length > 0) {
  params.set("exclude", excludeIds.slice(0, 100).join(","))
}
```

Add:
```javascript
if (excludeTitles.length > 0) {
  params.set("exclude_titles", excludeTitles.slice(0, 50).join("|"))
}
```

(Using `|` as delimiter since titles might contain commas)

---

### STEP 8: Pass titles to fetchFromServerPool in doAI()

Find the server pool fetch call in doAI() (around line 10456):
```javascript
const serverPoolSc = await fetchFromServerPool(p, diffForPool, null, poolExcludeIds)
```

Replace with:
```javascript
const serverPoolSc = await fetchFromServerPool(p, diffForPool, null, poolExcludeIds, [..._servedScenarioTitles])
```

---

## Summary of Changes

**Client (index.jsx):**
1. New `_servedScenarioTitles` Set declaration
2. 4 places: add `.add(title)` alongside existing `.add(id)` calls
3. Tier 0: title check + discard stale cache
4. Tier 1: title check on local pool
5. Tier 2: title check on server pool safety gate
6. `fetchFromServerPool`: new `excludeTitles` parameter → URL param
7. `doAI`: pass `_servedScenarioTitles` to server pool fetch

**Worker (worker/index.js):**
8. Parse `exclude_titles` query param
9. Add `AND title NOT IN (...)` to SQL query

## Verification

After changes:

1. Search index.jsx for `_servedScenarioTitles` — should appear:
   - 1 declaration (new Set())
   - 4 `.add()` calls (one per tier)
   - 3 `.has()` checks (Tier 0, Tier 1, Tier 2 safety gates)
   - 1 spread `[..._servedScenarioTitles]` in fetchFromServerPool call
   - 4 `.clear()` calls (paired with _servedScenarioIds.clear())

2. Search worker/index.js for `exclude_titles` — should appear in handlePoolFetch

3. Test: Play 5+ scenarios on "batter". Console should show:
   - Fresh AI scenarios generated and contributed to pool
   - Pool scenarios served BUT never the same title twice
   - After pool exhausted, falls through to fresh AI generation
   - "Discarded pre-cached duplicate" may appear (expected — means title dedup is working)

4. You should NEVER see the same scenario TITLE appear twice in a row, even if the IDs are different.

## IMPORTANT: After changing worker/index.js, redeploy: cd worker && npx wrangler deploy

## Other Errors Noticed in Console

These are separate from the pool bug but worth noting:

1. **Agent pipeline grades failing (46, 38)**: The agent pipeline system prompt still needs Prompt 7 from CLAUDE_CODE_PROMPTS_ROUND2.md. The grader correctly rejects these (score < 65) and falls back to standard pipeline. Run Prompt 7 when ready.

2. **503 Service Unavailable from xAI**: "The model is at capacity" — this is xAI's servers being overloaded. The retry logic handles it correctly (retries up to 2x with remaining time budget). No code fix needed.

3. **Self-audit timeout**: "audit-timeout" warnings are non-blocking and expected (5s timeout for a quick quality check). No fix needed.

4. **"Uncaught (in promise) Error: A listener indicated an asynchronous response..."**: This is a Chrome extension interference (preview.html context), not our code. Ignore it.
