# AI Cache Fix Prompts — "Always One Ahead" Architecture

Read `BSM_AI_CACHE_DIAGNOSTIC_2026-03-10.txt` first for full context. These 4 prompts fix the core reason AI scenarios aren't cached during gameplay.

**Run order: Prompt 1 → 2 → 3 → 4** (each builds on the previous)

---

## Prompt 1: Per-Position Fetching Lock + Cancel-on-Pick

```
Read BSM_AI_CACHE_DIAGNOSTIC_2026-03-10.txt for context. Then open index.jsx and make these changes:

CHANGE 1: Per-position fetching locks (replaces global boolean)

In prefetchAIScenario() (around line 11389-11429):
- Change the fetching check from `if (cacheRef.current.fetching) return` to a per-position check:
  ```
  if (!cacheRef.current.fetchingPositions) cacheRef.current.fetchingPositions = {}
  if (cacheRef.current.fetchingPositions[position]) return
  // Global concurrency limit: max 2 concurrent xAI calls
  const activeFetches = Object.values(cacheRef.current.fetchingPositions).filter(Boolean).length
  if (activeFetches >= 2) return
  ```
- Replace `cacheRef.current.fetching = true` with `cacheRef.current.fetchingPositions[position] = true`
- Replace `cacheRef.current.fetching = false` in the finally block with `cacheRef.current.fetchingPositions[position] = false`
- Keep the old `cacheRef.current.fetching` property updated too for backward compatibility: set it to `Object.values(cacheRef.current.fetchingPositions).some(Boolean)` after each change

CHANGE 2: Store per-position AbortControllers

Replace the module-level `_prefetchController` with a map:
```
const _prefetchControllers = {} // keyed by position
```
In prefetchAIScenario(), use `_prefetchControllers[position]` instead of `_prefetchController`.
In cancelPrefetch(), abort ALL controllers and clear the map.

CHANGE 3: Cancel wrong-position prefetch when player picks a position

Add a new function cancelPrefetchExcept(position):
```
function cancelPrefetchExcept(position) {
  for (const [pos, ctrl] of Object.entries(_prefetchControllers)) {
    if (pos !== position && ctrl) {
      ctrl.abort()
      delete _prefetchControllers[pos]
      if (aiCacheRef?.current?.fetchingPositions) {
        aiCacheRef.current.fetchingPositions[pos] = false
      }
      console.log("[BSM] Cancelled stale prefetch for", pos, "— player picked", position)
    }
  }
}
```

Call cancelPrefetchExcept(p) at the very start of startGame() (around line 12746), right before the triggerPrefetch definition. This ensures that when a player picks shortstop, any in-flight warm prefetch for pitcher is immediately cancelled, freeing up the xAI connection.

Also update the aiCacheRef initialization (wherever it's created with useRef) to include `fetchingPositions: {}` in the initial value.

Test: After these changes, console should show "Cancelled stale prefetch for pitcher — player picked shortstop" when player picks a different position than what warm prefetch targeted.
```

---

## Prompt 2: Delay Pool Fill + Explanation-Time Prefetch Guarantee

```
Read BSM_AI_CACHE_DIAGNOSTIC_2026-03-10.txt for context. Open index.jsx.

CHANGE 1: Don't fire fillLocalPool from triggerPrefetch

In the triggerPrefetch function (around line 12748-12760):
- REMOVE the setTimeout for fillLocalPool entirely (the one at 3000ms)
- Instead, add pool filling to the prefetchAIScenario .finally() block. After `cacheRef.current.fetchingPositions[position] = false`, add:
  ```
  // Fill pool in background after prefetch completes (not concurrently)
  const poolCount = _emptyPoolPositions.has(position) ? 2 : 1
  setTimeout(() => fillLocalPool(position, stats, poolCount), 2000)
  ```
  Note: you'll need to pass `stats` into prefetchAIScenario or capture it. The cleanest approach is to add it as an optional parameter, or use the stats that are already available in the scope where triggerPrefetch is defined.

Actually, a simpler approach: instead of modifying prefetchAIScenario's signature, just change triggerPrefetch to await the prefetch and then fill:
```
const triggerPrefetch = (position) => {
  // 1. Cache prefetch (immediate next play): 500ms delay
  setTimeout(async () => {
    if (!aiCacheRef.current.fetchingPositions?.[position] && !aiCacheRef.current.scenarios[position]?.scenario) {
      const nextConcept = sessionPlanRef.current?.[0]?.concept || null
      await prefetchAIScenario(position, stats, stats.cl || [], stats.recentWrong || [], stats.aiHistory || [], lastAiScenarioRef.current, nextConcept, aiCacheRef)
      // Pool fill AFTER prefetch completes — never concurrent
      const fillCount = _emptyPoolPositions.has(position) ? 2 : 1
      setTimeout(() => fillLocalPool(position, stats, fillCount), 2000)
    }
  }, 500)
}
```

CHANGE 2: Answer-submitted prefetch ignores fetching lock for same position

At the answer-submitted prefetch (around line 13189), change the condition from:
```
if(aiMode && !speedMode && !survivalMode && !realGameMode &&
   !aiCacheRef.current.scenarios?.[pos]?.scenario &&
   !aiCacheRef.current.fetching)
```
to:
```
if(aiMode && !speedMode && !survivalMode && !realGameMode &&
   !aiCacheRef.current.scenarios?.[pos]?.scenario) {
  // If a prefetch is already in-flight for THIS position, let it continue
  // If in-flight for a DIFFERENT position, cancel it and start one for current position
  if (aiCacheRef.current.fetchingPositions?.[pos]) {
    console.log("[BSM] Prefetch already in-flight for", pos, "— letting it continue")
  } else {
    // Cancel any stale prefetch for other positions
    if (typeof cancelPrefetchExcept === 'function') cancelPrefetchExcept(pos)
    const nextConcept = sessionPlanRef.current?.[0]?.concept || null
    prefetchAIScenario(pos, stats, stats.cl || [], stats.recentWrong || [], stats.aiHistory || [], lastAiScenarioRef.current, nextConcept, aiCacheRef)
  }
}
```

Test: After answering a scenario, console should show EITHER "Prefetch already in-flight for [pos]" OR a new prefetch starting. It should NEVER be silently blocked.
```

---

## Prompt 3: Extend Stale TTL + Smarter Circuit Breaker

```
Read BSM_AI_CACHE_DIAGNOSTIC_2026-03-10.txt for context. Open index.jsx.

CHANGE 1: Extend stale cache TTL from 5 minutes to 15 minutes

In consumeCachedAI() (around line 11468), change:
```
if (cached.timestamp && (Date.now() - cached.timestamp) > 300000) {
```
to:
```
if (cached.timestamp && (Date.now() - cached.timestamp) > 900000) { // 15 min — kids get distracted
```

Also update the log message on that line to say "(15min TTL)" instead of just the age.

In doAI() (around line 12784), change:
```
const cacheStale = cacheAge > 300000 // 5 minutes
```
to:
```
const cacheStale = cacheAge > 900000 // 15 minutes — generous for kids' app
```

CHANGE 2: Smarter circuit breaker

In the circuit breaker failure recording (around line 13042), change:
```
if(_cbF.failures>=4){
```
to:
```
if(_cbF.failures>=6){ // increased: 504s are transient, need more samples
```

In the circuit breaker cooldown (around line 13001-13003 and 13043-13044), change cooldown from 3 minutes to 90 seconds:
```
_cbS.openUntil=Date.now()+90*1000 // 90s cooldown (was 3 min)
```
and:
```
_cbF.openUntil=Date.now()+90*1000 // 90s cooldown (was 3 min)
```

CHANGE 3: Don't count prefetch failures toward circuit breaker

In prefetchAIScenario() (around line 11423), the catch block logs "Pre-fetch failed". This is fine. But make sure the circuit breaker update code (getCircuitBreaker/updateCircuitBreaker calls) is ONLY in the doAI() Tier 3 section, NOT in prefetchAIScenario or fillLocalPool. Verify this is already the case — if any circuit breaker recording exists in prefetch functions, remove it.

Test: After these changes, the circuit breaker should be much less trigger-happy. Console should show fewer "Circuit breaker OPENED" messages.
```

---

## Prompt 4: Warm Prefetch Optimization + Pool Fill Gating

```
Read BSM_AI_CACHE_DIAGNOSTIC_2026-03-10.txt for context. Open index.jsx.

CHANGE 1: Limit warm prefetch to just 1 position (not 5)

In the Pro warm prefetch (around line 12340-12354), change the logic:
- Only prefetch for the SINGLE most-played position (top5[0])
- Remove the fillLocalPool calls for positions 2-5 entirely
- This avoids 4-5 speculative xAI calls that will likely be wasted

Change from:
```
const top5=Object.entries(stats.ps).filter(([,v])=>v.p>=2).sort((a,b)=>b[1].p-a[1].p).slice(0,5).map(([k])=>k)
if(top5.length===0)return
console.log("[BSM DEBUG] Pro warm prefetch: top positions =",top5)
if(top5[0]&&!aiCacheRef.current.fetching&&!aiCacheRef.current.scenarios[top5[0]]?.scenario){
  prefetchAIScenario(top5[0],stats,stats.cl||[],stats.recentWrong||[],stats.aiHistory||[],null,null,aiCacheRef)
}
top5.slice(1).forEach(pos=>fillLocalPool(pos,stats))
```
to:
```
const top1=Object.entries(stats.ps).filter(([,v])=>v.p>=3).sort((a,b)=>b[1].p-a[1].p).slice(0,1).map(([k])=>k)
if(top1.length===0)return
console.log("[BSM DEBUG] Pro warm prefetch: top position =",top1[0])
if(!aiCacheRef.current.fetchingPositions?.[top1[0]]&&!aiCacheRef.current.scenarios[top1[0]]?.scenario){
  prefetchAIScenario(top1[0],stats,stats.cl||[],stats.recentWrong||[],stats.aiHistory||[],null,null,aiCacheRef)
}
// No pool fill on load — wait until player picks a position
```

Note: also increased the minimum plays threshold from 2 to 3, so warm prefetch only targets positions the player has genuinely committed to.

CHANGE 2: Only fill pools when NOT in active gameplay

Add a simple flag to track whether the player is in active play:
- In App(), add: `const inGameRef = useRef(false)`
- Set `inGameRef.current = true` at the start of startGame()
- Set `inGameRef.current = false` when returning to position select or home screen

Then in fillLocalPool, add a check at the top:
```
// Skip pool fill during active gameplay — prioritize cache prefetch
if (typeof inGameRef !== 'undefined' && inGameRef?.current) {
  console.log("[BSM Pool Fill] Skipped — player is in active gameplay, prioritizing cache")
  return
}
```

Actually, since fillLocalPool is a module-level function and inGameRef is inside App(), a cleaner approach is to pass an `inGame` parameter or use a module-level variable:
```
let _playerInGame = false // module-level
```
Set it in startGame and on return to home/position-select. Check it in fillLocalPool.

CHANGE 3: Update the fetching check in doAI()

In doAI() at the Tier 3 inner cache check (around line 12952-12953), make sure consumeCachedAI and the in-flight promise check use the new per-position fetching keys. The existing code should mostly work since it checks `aiCacheRef.current?.inFlightPromise?.[p]`, but verify that:
- The in-flight promise is stored by position (it already is at line 11406)
- The fetching flag check uses the new per-position version

Test the full flow:
1. Open app as Pro user
2. Watch console: warm prefetch should fire for ONLY 1 position
3. Pick a different position → "Cancelled stale prefetch" message
4. Play through first scenario (will be Tier 3 live generation with spinner)
5. After answering, see prefetch start
6. Click "Next Challenge" → should show "Consuming pre-cached scenario" (Tier 0 HIT!)
7. If not instant, should show "Pre-fetch in flight — awaiting" and serve within 15s
8. Third play onward should be consistently instant from cache
```

---

## Quick Reference: What Each Prompt Fixes

| Prompt | Issues Fixed | Key Changes |
|--------|-------------|-------------|
| 1 | Issue 2, 3 | Per-position locks, cancel-on-pick |
| 2 | Issue 4, 5 | Sequential prefetch→fill, explanation-time guarantee |
| 3 | Issue 6, 7 | 15-min TTL, relaxed circuit breaker |
| 4 | Issue 3 (extra) | Single warm prefetch, gameplay-aware pool fill |

Issue 1 (xAI response time) is a fundamental constraint that can't be "fixed" in code — it's mitigated by the combination of all other fixes ensuring the prefetch has enough time to complete during gameplay.
