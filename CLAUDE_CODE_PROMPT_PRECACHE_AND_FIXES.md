# Claude Code Prompt — Improve Pre-caching Timing + Fix Remaining Issues

## Issue 1: Pre-cache starts too late (user notices slow loads)

Currently, the AI prefetch triggers in `handleChoice()` (around line 10722-10724) — AFTER the user picks an answer. AI generation takes 20-30 seconds. If the user reads the explanation quickly and clicks "Next Challenge" in under 20 seconds, the prefetch isn't ready and they have to wait.

### Fix: Start prefetching when the scenario is SERVED, not after the user answers

This gives the full play duration (reading question + thinking + choosing + reading explanation) for the prefetch to complete — typically 30-60 seconds.

**Step 1a:** In the `doAI()` function, after EVERY path that successfully serves an AI scenario (Tiers 0, 1, 2, and 3), add a prefetch trigger. Find the pattern: each tier ends with `setSc(someScenario)` followed by the options reveal animation and `return`.

Add a helper function right before `doAI` starts (around line 10402):
```javascript
const triggerPrefetch = (position) => {
  if (!stats.isPro) return
  // Small delay so current scenario renders first
  setTimeout(() => {
    if (!_aiCache.fetching && !_aiCache.scenario) {
      prefetchAIScenario(position, stats, stats.cl || [], stats.recentWrong || [], stats.aiHistory || [])
    }
  }, 2000)
}
```

Then call `triggerPrefetch(p)` at the end of each tier's success block, right before the `return` statement:

**Tier 0 (pre-cache hit, around line 10427-10428):**
```javascript
cachedSc.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)})
triggerPrefetch(p)
return
```

**Tier 1 (local pool, around line 10450-10451):**
```javascript
localPoolSc.options.forEach((_, i) => { setTimeout(() => setRi(i), 120 + i * 80) })
triggerPrefetch(p)
return
```

**Tier 2 (server pool, around line 10471-10472):**
```javascript
serverPoolSc.options.forEach((_, i) => { setTimeout(() => setRi(i), 120 + i * 80) })
triggerPrefetch(p)
return
```

**Tier 3 (fresh AI, around line 10573-10574):**
```javascript
result.scenario.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
triggerPrefetch(p)
```
(No return here — it's the last path)

**Step 1b:** KEEP the existing prefetch trigger in `handleChoice()` (line 10722-10724) as a backup. It won't double-fetch because `prefetchAIScenario` checks `if (_aiCache.fetching) return` at the top. But change the condition to also check `!_aiCache.fetching && !_aiCache.scenario`:

Find (around line 10723):
```javascript
if(stats.isPro&&aiMode&&!speedMode&&!survivalMode&&!realGameMode&&!aiCacheRef.current.scenarios[pos]){
```

Replace with:
```javascript
if(stats.isPro&&aiMode&&!speedMode&&!survivalMode&&!realGameMode&&!aiCacheRef.current.scenarios[pos]&&!_aiCache.fetching&&!_aiCache.scenario){
```

This prevents the handleChoice trigger from interfering if the serve-time prefetch is already running.

---

## Issue 2: 504 Gateway Timeout still occurring

The console shows: `POST https://bsm-ai-proxy.blafleur.workers.dev/v1/chat/completions 504 (Gateway Timeout)`

This means the worker timeout increase from Prompt 6 (30s → 60s) may not have been deployed, OR Cloudflare's free tier enforces a hard 30-second cap regardless of what our code sets.

### Fix: No code change needed, but verify deployment

Run this in the worker directory:
```
cd worker && npx wrangler deploy
```

If 504s persist after deployment, Cloudflare Workers free tier has a hard 30-second CPU time limit. The fix would be to switch to streaming responses (not blocking), but that's a bigger change. For now, the retry logic handles 504s correctly — it retries up to 2x with the remaining time budget.

---

## Issue 3: Agent pipeline keeps failing grading (scores 48, 61, 67)

The agent pipeline variant generates scenarios that score below the 65 threshold. This is because the agent pipeline system prompt hasn't been upgraded yet.

### Fix: Run Prompt 7 from CLAUDE_CODE_PROMPTS_ROUND2.md

This prompt upgrades the agent pipeline's system prompt with the same GOLDEN RULE, OPTION RULES, and POSITION BOUNDARIES that fixed the standard pipeline. You should have this file already — open `CLAUDE_CODE_PROMPTS_ROUND2.md` and run Prompt 7.

---

## Issue 4: Title collision with handcrafted scenarios ("title Duplicate with f3")

The console shows: `AI scenario rejected: title Duplicate with f3`

This means the AI generated a scenario whose title matches an existing handcrafted centerField scenario (ID "f3"). The existing dedup check catches this and triggers a retry, which is correct behavior. But it wastes a generation attempt.

### Fix: Pass handcrafted titles to the AI prompt as exclusions

In `generateAIScenario()`, find where the anti-repetition instructions are built. There should be a section that tells the AI to avoid recent titles. Add handcrafted scenario titles for the current position.

Find where the system prompt or user prompt includes anti-repetition guidance (look for "avoid" or "recent" or "duplicate" in the prompt construction). Add this to the prompt context:

```javascript
// Get handcrafted titles for this position to avoid collisions
const handcraftedTitles = (SCENARIOS[position] || []).map(s => s.title).slice(0, 30)
```

Then include in the prompt: `\nDo NOT use any of these existing titles: ${handcraftedTitles.join(", ")}`

This is a minor optimization — the dedup catch already handles it. Only implement if you have time.

---

## Issue 5: _aiCache prefetch not used when pool scenarios are available

Currently the flow is: Tier 0 (aiCacheRef) → Tier 1 (local pool) → Tier 2 (server pool) → Tier 3 (consumeCachedAI from _aiCache → fresh AI).

When pool scenarios exist at Tiers 1-2, the prefetched fresh AI scenario in `_aiCache` is never consumed. It just sits there until the pool runs out. This is actually CORRECT behavior — pool scenarios are instant and free (no API call), so they should be preferred. When the pool is exhausted, the prefetch kicks in seamlessly.

### No fix needed — this is working as designed.

The prefetched scenario in `_aiCache` will eventually be consumed when:
- The pool runs out of un-served scenarios for this user
- OR the user switches positions (it gets saved to local pool)

---

## Verification After Changes

1. Test: Play 5+ centerField scenarios. Console should show:
   - First play: fresh AI generation (slow, 20-40s)
   - "Pre-fetching AI scenario for centerField" should appear IMMEDIATELY after the first scenario loads (within 2 seconds), not after answering
   - Second play: should use pre-cached scenario with "0ms" or near-instant
   - Subsequent plays: alternating between pool scenarios (instant) and pre-cached AI (near-instant)

2. The key improvement: "Pre-fetching AI scenario" log should appear RIGHT AFTER "AI scenario accepted" (2-second delay), not after the user answers.

3. No regressions: pool contributing, quality grades, title dedup, score mismatch detection should all continue working.

## Priority Order
1. **Issue 1 (precache timing)** — Most impactful for user experience
2. **Issue 3 (agent pipeline)** — Run Prompt 7 separately
3. **Issue 2 (504)** — Verify worker is deployed
4. **Issue 4 (title collision)** — Minor optimization, optional
