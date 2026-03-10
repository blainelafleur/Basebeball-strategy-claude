# BSM AI Audit — Claude Code Fix Prompts

Run these in order. Each prompt is self-contained. Test after each one before moving to the next.

Reference: `BSM_AI_AUDIT_2026-03-10.txt` (full audit report)

**Updated 2026-03-10** after diagnostic logs from Prompt 1.1 revealed root causes:
- Circuit breaker is the #1 killer — one timeout opens it for 10 min, blocking ALL positions
- Server pool (D1) returns null for every position — pool is empty or misconfigured
- Local pool is empty for all positions — nothing is being saved to it
- `excludeIds count: 332` is suspiciously inflated — over-aggressive filtering
- Live generation works but takes 130s, which triggers timeout → circuit breaker cascade

---

## PRIORITY 1 — Critical (do these first)

### Prompt 1.1: Diagnose forceAI Fallback Rate ✅ DONE

Diagnostic logging deployed. Logs confirmed root causes listed above.

---

### Prompt 1.2: Fix Circuit Breaker Cascade (THE #1 PROBLEM)

```
CONTEXT FROM DIAGNOSTIC LOGS:

The [BSM DEBUG] logs from the AI Coach's Challenge reveal the #1 cause of the 69% fallback rate. Here's what happens:

1. User clicks ThirdBase → all pools empty → live generation starts → takes 130s → timeout
2. Timeout increments circuit breaker failures to 2
3. Circuit breaker OPENS for 10 minutes (openUntil: 5:03:41 PM)
4. User clicks Manager → pools empty → circuit breaker is OPEN → instant fallback to handcrafted
5. User clicks FirstBase → same thing → circuit breaker still open → instant fallback

One slow position kills AI for ALL positions for 10 minutes. This is why 69% of tests fell back.

Actual log evidence:
- ThirdBase: "FALLBACK to handcrafted | error: timeout | totalFlowTime: 130086ms"
- Manager (next click): "CIRCUIT BREAKER check | open: true | failures: 2 | openUntil: 5:03:41 PM"
- FirstBase (next click): Same circuit breaker block

TASK — Fix the circuit breaker to stop this cascade:

1. INCREASE FAILURE THRESHOLD: Change the circuit breaker from opening after 2 failures to opening after 4 failures. Currently at line ~12831: `if(_cbF.failures>=2)` — change to `>=4`. Two failures is way too aggressive for a feature where generation sometimes legitimately takes 60-90 seconds.

2. REDUCE OPEN DURATION: Change the 10-minute open window to 3 minutes. Currently at line ~12832: `_cbF.openUntil=Date.now()+10*60*1000` — change to `3*60*1000`. Ten minutes is an eternity for a kid playing.

3. MAKE CIRCUIT BREAKER PER-POSITION, NOT GLOBAL: This is the key fix. The current circuit breaker is global — one slow position blocks all positions. Refactor getCircuitBreaker()/updateCircuitBreaker() to store per-position state. If ThirdBase times out, only ThirdBase should be blocked, not Manager and FirstBase. The storage key should include the position (e.g., `bsm_cb_thirdBase`).

4. FIX THE AVG RESPONSE TIME BREAKER TOO: Log shows `avgResponseTime: 72s`. The threshold at line ~12789 opens the breaker if avg > 50s with 3+ samples. But 72s is normal for live generation! Either raise this threshold to 120s or remove the response-time breaker entirely (the failure-count breaker is sufficient).

5. ADD A RESET ON APP LOAD: When the app loads, clear all circuit breaker state. A stale breaker from a previous session shouldn't block a fresh one. Add this to the app initialization useEffect.

These changes should eliminate the cascade problem while still protecting against genuinely broken API states.
```

---

### Prompt 1.3: Fix Inflated Exclude List (332 IDs blocking local pool)

```
CONTEXT FROM DIAGNOSTIC LOGS:

The logs show `excludeIds count: 332` when checking the local pool. With only 100 servedIds and 91 servedTitles, where are the other 230+ exclusion IDs coming from?

Look at line ~12633 in doAI():
const allExcludeIds = [...new Set([...(stats.cl || []), ...(stats.aiHistory || []).map(h => h.id), ..._servedScenarioIds])]

This combines:
- stats.cl (completed scenario IDs — could be hundreds if the user has played a lot)
- stats.aiHistory (last 100 AI scenario IDs)
- _servedScenarioIds (session-level served IDs)

The problem: stats.cl contains IDs of HANDCRAFTED scenarios the user completed. These are being used to exclude from the AI LOCAL POOL, but local pool scenarios have completely different IDs (they start with "pool_"). Handcrafted IDs like "p_001" will never match pool IDs like "pool_abc123", so this isn't causing false exclusions — BUT it's making the Set unnecessarily huge.

More importantly, check consumeFromLocalPool() — search for "function consumeFromLocalPool" or "const consumeFromLocalPool". Verify:

1. What format are local pool scenario IDs? Do they start with "pool_"?
2. Is the exclude matching comparing the right ID format?
3. Is there a bug where the local pool is NEVER being populated? The logs show pool size: 0 for ALL positions. Search for "saveToLocalPool" — is it being called? Is localStorage actually writing?
4. Check the localStorage key used for the pool. Is it being read back correctly?

TASK:
1. Add a debug log in saveToLocalPool: console.log("[BSM DEBUG] saveToLocalPool called for", position, "title:", scenario.title, "pool size after save:", newSize)
2. Add a debug log in consumeFromLocalPool: console.log("[BSM DEBUG] consumeFromLocalPool for", position, "raw pool size:", rawSize, "after diff filter:", filteredSize, "after exclude filter:", finalSize)
3. On app load, add: console.log("[BSM DEBUG] Local pool inventory:", Object.fromEntries(ALL_POS.map(p => [p, getLocalPoolSize(p)])))
4. Check if saveToLocalPool is actually being called anywhere — it should be called when a pre-cached scenario is displaced by a new one (line ~12877) and when triggerPrefetch completes

If you find that saveToLocalPool is never called or localStorage is broken, fix it. If the pool IS being saved but consumeFromLocalPool can't find matches due to ID/diff filtering, loosen the filters.
```

---

### Prompt 1.4: Investigate Empty Server Pool (D1)

```
CONTEXT FROM DIAGNOSTIC LOGS:

The server pool (D1 community pool) returned null for every position tested:
- "Tier 2 SERVER POOL result: null (empty or no match)" — for thirdBase, manager, AND firstBase

This means the D1 database either has no scenarios stored, or the query is filtering everything out.

TASK: Investigate the server pool pipeline end-to-end.

1. Find fetchFromServerPool() in index.jsx. Read the function and understand:
   - What endpoint does it call? (Should be the Cloudflare Worker)
   - What parameters does it send? (position, difficulty, exclude IDs, exclude titles)
   - The logs show it sends poolExcludeIds: 13 and excludeTitles: 91. Are 91 excluded titles too aggressive?

2. Find the WORKER endpoint that handles server pool requests. Check worker/index.js for the pool fetch route. Understand:
   - What D1 query does it run?
   - Is there a table for pool scenarios? What's it called?
   - Does it have any data? (Use the Cloudflare MCP tools to query: mcp__21186333-89eb-4773-baed-2da59a623de2__d1_database_query)

3. Find where scenarios get WRITTEN to the server pool. Is there a "contribute to pool" flow where generated AI scenarios are saved back to D1? If this pipeline is broken or was never built, the pool will always be empty.

4. Report your findings. If the D1 table is empty, we need to decide: either build a pool seeding script or remove the server pool tier from the hot path (it adds latency for zero value if empty).

This is a RESEARCH task — investigate and report findings before making changes.
```

---

### Prompt 1.5: Add Scenario Deduplication

```
Read BSM_AI_AUDIT_2026-03-10.txt Section 2 (Test Matrix), rows 6-7.

PROBLEM: The Baserunner position served the exact same scenario "Steal Decision — Bad Count Changes Everything" twice in a row. The getSmartRecycle() function at line 12503 only avoids the LAST played scenario (lastScId), but doesn't check against recently served scenarios in the current session.

The doAI() fallback path at line 12843-12846 calls getSmartRecycle(p, src, lastScId) which can return any scenario the user got wrong or hasn't seen recently — but it doesn't know about scenarios served in the CURRENT session.

TASK: Fix getSmartRecycle() to also exclude scenarios served in the current session. Specifically:

1. Add a sessionServedRef (useRef([])) that tracks scenario IDs served in the current session
2. Push each served scenario ID onto sessionServedRef when setSc() is called in startGame()
3. In getSmartRecycle(), filter out any scenario whose ID is in sessionServedRef.current (in addition to the existing lastScId check)
4. Clear sessionServedRef on screen transitions back to "home"

Also check: the forceAI path already uses _servedScenarioIds and _servedScenarioTitles (module-level Sets) for AI scenarios, but the fallback path at line 12844 calls getSmartRecycle which doesn't consult these Sets. Make the fallback path respect _servedScenarioTitles too.

Keep changes minimal — this is a targeted dedup fix, not a refactor.
```

---

### Prompt 1.6: Filter Fallback Difficulty for AI Coach's Challenge

```
Read BSM_AI_AUDIT_2026-03-10.txt Section 6 (Timeout/Fallback).

PROBLEM: When forceAI=true falls back to a handcrafted scenario (line 12843-12846), it calls getSmartRecycle(p, src, lastScId) where src = SCENARIOS[p]. This can return ANY difficulty including diff:1 (Rookie). During testing, the ThirdBase fallback served a 1-star Rookie scenario via AI Coach's Challenge — way too easy for a feature that's supposed to challenge Pro players.

TASK: When forceAI=true triggers the fallback path, filter the source scenarios to only include diff >= 2 before passing to getSmartRecycle. Specifically:

1. The fallback path is at lines 12843-12847 inside doAI()
2. The `src` variable used there comes from the startGame scope (line ~12575: const src = SCENARIOS[p] || [])
3. When in the forceAI fallback, create a filtered source: `const hardSrc = src.filter(s => s.diff >= 2)` and pass `hardSrc.length > 0 ? hardSrc : src` to getSmartRecycle instead of raw src

Also apply this same filter to the circuit breaker fallback (line 12689) and cooldown fallback (line 12700) — both also use getSmartRecycle with unfiltered src.

This is a 3-line change in 3 locations. Keep it minimal.
```

---

## PRIORITY 2 — High (do these next)

### Prompt 2.1: Overhaul Coach Line System

```
Read BSM_AI_AUDIT_2026-03-10.txt Section 5 (Coach Line Quality).

PROBLEM: Coach lines are the weakest element. Testing found:
- 33% are generic streak counters ("Four straight! Stay locked in!")
- 17% are duplicates across positions (same Babe Ruth line for Batter AND Baserunner)
- Context mismatch: Manager got "Make contact count!" (batting advice for a bullpen decision)
- 0% of lines were position-specific or educational

The getCoachLine() function is at line 11850. Current logic:
1. If Pro + streak >= 3: return streak line (these are the generic counters)
2. If Pro + 20% chance: return random fact
3. If Pro + 30% chance + position lines exist: return position-specific line
4. Else: return generic success/warning/danger line

The problem is streak lines (step 1) fire FIRST and override everything else when streak >= 3. And the position-specific lines only have a 30% chance even when they exist.

TASK: Refactor getCoachLine() with these changes:

1. FLIP THE PRIORITY ORDER: Check position-specific lines FIRST (70% chance, up from 30%), THEN facts (20%), THEN streak lines as last resort (10% when streak >= 5, not 3)
2. ADD CONCEPT-AWARE LINES: Accept a `concept` parameter. If concept is provided (e.g., "cutoff_relay", "double_play"), check for concept-specific coach lines before falling back to position lines
3. ADD A DEDUP GUARD: Accept a `recentLines` array parameter. Don't return any line that's in the last 5 recent lines. The caller should maintain this array in a ref.
4. FIX CONTEXT MATCHING: Position-specific lines for defensive positions (pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, leftField, centerField, rightField) should never include offensive advice. Position-specific lines for offensive positions (batter, baserunner) should never include defensive advice. Manager lines should be about decision-making, not playing.

Update the call sites where getCoachLine is invoked (search for "getCoachLine(" — there are ~2-3 call sites) to pass the new concept and recentLines parameters.

Add at least 3 new position-specific coach lines per defensive position that teach something real about that position's strategic role. Examples:
- Shortstop: "The shortstop is the captain of the infield. You just proved why."
- Catcher: "Catchers see the whole field. That's exactly the kind of read that wins games."
- Center field: "Center fielders have priority on every fly ball. You took charge like a pro."
```

### Prompt 2.2: Add Fallback User Notification

```
Read BSM_AI_AUDIT_2026-03-10.txt Section 6 (Timeout/Fallback).

PROBLEM: When forceAI=true falls back to a handcrafted scenario, the user sees a "Practice" badge but gets NO explanation that AI generation failed. They clicked "AI Coach's Challenge" expecting an AI scenario and silently got a regular one.

CONTEXT: The doAI() fallback path at line 12843-12853 already sets a toast for some error types ("AI took too long", "AI service error", etc.), but only when result has an error property. When the circuit breaker is open (line 12688-12694) or cooldown is active (line 12697-12705), different toasts fire.

TASK: Improve the fallback notification for the forceAI path:

1. For the main fallback toast (line 12848-12853), change the message to be more user-friendly and encouraging. Instead of "AI unavailable. Using a handcrafted scenario." use "AI Coach is warming up! Here's a curated challenge while we prep your custom scenario."

2. Add a visual indicator: when aiFallback is true AND the scenario was triggered by forceAI, show a small dismissible banner above the scenario that says "AI scenario loading in background — next one will be custom!" (only if the prefetch was actually triggered via triggerPrefetch)

3. Make sure triggerPrefetch(p) is called in the fallback path too (it's currently only called on AI success at line 12820). This way the NEXT scenario from AI Coach's Challenge is more likely to have a cached AI scenario ready.

Keep the tone encouraging for kids ages 6-18. Never make it feel like something broke.
```

### Prompt 2.3: Improve AI Explanation Consistency

```
Read BSM_AI_AUDIT_2026-03-10.txt Section 7 (Explanation Quality).

TWO PROBLEMS FOUND:

Problem A: Catcher AI scenario "Lead-Off Strike Strategy" — the explanation for the correct answer discussed a DIFFERENT option instead of explaining why the chosen correct answer was best. This means the AI prompt doesn't consistently anchor explanations to the correct answer.

Problem B: Shortstop AI scenario "Double Play Pivot" — the explanation was only 1 sentence long. Way too thin for educational value.

TASK: Add post-generation validation in the QUALITY_FIREWALL (search for "QUALITY_FIREWALL" or "qualityFirewall" in index.jsx) to catch these:

1. EXPLANATION LENGTH CHECK: Each option's explanation (expl field in the scenario) must be at least 25 words. If the best answer's explanation is under 40 words, flag as quality failure and retry. Add this as a new Tier 1 check.

2. EXPLANATION COHERENCE CHECK: The best answer's explanation (the one at bestAnswer index) should contain at least one word from the best answer's option text. This is a basic sanity check that the explanation actually discusses the correct option, not a different one. Add as Tier 2 check.

3. Also update the AI prompt (search for the system prompt in generateAIScenario) to add this instruction: "CRITICAL: Each explanation must specifically argue for or against THAT option. The best answer explanation must clearly state why THIS choice is optimal, not why another option is wrong."

These are surgical additions to existing validation, not a rewrite.
```

---

## PRIORITY 3 — Medium (do these when P1/P2 are stable)

### Prompt 3.1: Improve Pre-Cache Reliability

```
Read BSM_AI_AUDIT_2026-03-10.txt Section 8 (Loading Performance).

PROBLEM: Only 2 of 9 positions had pool scenarios available during testing. Pre-caching should maintain at least 1 scenario per position, but pools were empty for pitcher (after 1st use), batter, baserunner, manager, firstBase, shortstop, thirdBase, and centerField.

CONTEXT: The app has 3 pre-cache mechanisms:
1. triggerPrefetch(p) — called after serving a scenario, pre-generates for the SAME position
2. Server pool (fetchFromServerPool) — pulls from D1 community pool
3. Local pool (consumeFromLocalPool / saveToLocalPool) — browser-side cache in localStorage

TASK: Improve pre-cache coverage:

1. ON APP LOAD: When a Pro user opens the app, trigger background pre-fetch for their top 3 most-played positions (from stats.ps). Use a staggered setTimeout (0s, 15s, 30s) to avoid hammering the API. Search for the useEffect that handles app initialization to find the right place.

2. AFTER SERVING ANY SCENARIO: The current triggerPrefetch only pre-caches for the position just played. Also pre-cache for the NEXT most likely position (based on play frequency in stats.ps). This gives better pool coverage across positions.

3. ADD POOL DEPTH LOGGING: On app load, log the local pool depth per position: console.log("[BSM Pool] Local pool inventory:", {pitcher: X, catcher: Y, ...}). This helps diagnose empty pools.

4. INCREASE LOCAL POOL CAPACITY: Search for the local pool save/consume functions. If there's a cap on stored scenarios per position, increase it from whatever it is to at least 3.

Keep pre-fetch calls lightweight — use skipAgent=true for speed (the existing triggerPrefetch likely already does this).
```

### Prompt 3.2: Add Loading Cancel Button

```
Read BSM_AI_AUDIT_2026-03-10.txt Section 8 (Loading Performance).

PROBLEM: Live AI generation takes 30-70 seconds. For a kids' app (ages 6-18), waits over 10 seconds feel broken. There's currently no way to skip to a handcrafted scenario during the wait.

CONTEXT: The loading screen shows when aiLoading is true. Search for "aiLoading" and "TAKING A LITTLE LONGER" in index.jsx to find the loading UI.

TASK: Add a "Skip to Practice Scenario" button that appears after 8 seconds of AI loading:

1. Add a timer state (e.g., aiLoadElapsed) that starts counting when aiLoading becomes true
2. After 8 seconds, show a button: "⏭️ Skip to Practice Scenario" styled as a subtle ghost button below the loading animation
3. When clicked: abort the in-flight AI request (abortRef.current.abort()), set aiLoading=false, and serve a handcrafted scenario via getSmartRecycle (with the diff >= 2 filter from prompt 1.6 if forceAI was true)
4. Show a brief encouraging toast: "No worries! Here's a handcrafted challenge."
5. Still trigger a background prefetch so the NEXT attempt is more likely to succeed

Match the existing app styling (dark theme, rounded buttons, amber/purple accent colors).
```

### Prompt 3.3: Verify "Something Off?" Feedback Button

```
Read BSM_AI_AUDIT_2026-03-10.txt Section 3 (AI Badge Accuracy), last note about the "Something off?" button.

TASK: Audit the "Something off?" feedback button for AI scenarios:

1. Search index.jsx for "Something off" or "somethingOff" or "feedback" related to AI scenarios
2. Verify it renders on ALL AI-generated scenarios (aiMode === true), not just some
3. Verify the click handler actually sends feedback somewhere (D1, analytics, etc.) — not just a no-op
4. If the button is missing for some AI scenarios or the handler is broken, fix it
5. If the feedback goes to D1/analytics, add the scenario title, position, and chosen answer to the payload so the feedback is actionable

This is an audit + fix task. Report what you find before making changes.
```

### Prompt 3.4: Fix Catcher Perspective Break

```
Read BSM_AI_AUDIT_2026-03-10.txt Section 7 (Explanation Quality).

PROBLEM: The Catcher AI scenario "Lead-Off Strike Strategy" used "What should the catcher do?" in its situation text instead of "What should you do?" This breaks the 2nd-person immersive perspective used throughout the app. All handcrafted scenarios use "you" perspective.

TASK: Add a perspective validation check to the AI scenario post-processing:

1. After an AI scenario is generated and parsed (search for where result.scenario is first constructed from the AI response), add a text replacement pass:
   - Replace "What should the [position] do?" with "What should you do?"
   - Replace "The [position] should" with "You should" in situation text
   - Replace "the [position] needs to" with "you need to" in situation text

2. Use a regex that handles all 15 position names (pitcher, catcher, first baseman, second baseman, shortstop, third baseman, left fielder, center fielder, right fielder, batter, baserunner, manager, etc.)

3. Also add this rule to the AI system prompt: "ALWAYS use second person ('you') when addressing the player. Never say 'What should the pitcher do?' — say 'What should you do?'"

This is a small text-processing addition, not a refactor.
```

---

## Running Order Checklist

```
[x] 1.1 — Diagnostic logging (DONE — revealed root causes)
[ ] 1.2 — Fix circuit breaker cascade (THE #1 PROBLEM)
[ ] 1.3 — Fix inflated exclude list + debug local pool
[ ] 1.4 — Investigate empty server pool (D1) — research task
[ ] 1.5 — Scenario deduplication
[ ] 1.6 — Fallback difficulty filter
[ ] 2.1 — Coach line overhaul
[ ] 2.2 — Fallback user notification
[ ] 2.3 — AI explanation validation
[ ] 3.1 — Pre-cache reliability
[ ] 3.2 — Loading cancel button
[ ] 3.3 — Feedback button audit
[ ] 3.4 — Perspective fix
```

**After all fixes: re-run the full AI audit (same 9 positions × 2 scenarios) to verify improvements.**
