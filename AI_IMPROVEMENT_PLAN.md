# Baseball Strategy Master — AI System Improvement Plan

**Date:** March 6, 2026
**Source:** Combined audit from two independent reviews + live testing + D1 pool analysis
**Current Pool Status:** 23 scenarios across 6 positions (pitcher:11, batter:6, centerField:2, catcher:2, leftField:1, baserunner:1). Zero entries for: secondBase, shortstop, thirdBase, firstBase, rightField, manager.

---

## How to Use This Document

Each section below is a **self-contained prompt** you can paste directly into Claude Code. They are ordered by priority — complete them in sequence. Each prompt includes the problem, the fix, exact file locations, and verification steps.

After each prompt completes, **deploy and test** before moving to the next one. This avoids compounding issues.

---

## PROMPT 1: Fix Pre-Fetch Budget (Biggest UX Win)

```
Read index.jsx in the baseball-strategy-master folder.

PROBLEM: The pre-fetch system exists but almost always fails because it inherits leftover budget from the main AI generation flow. The main flow uses ~87s of the 160s AI_BUDGET, leaving pre-fetch only ~73s. The agent pipeline alone takes 60-75s, so pre-fetch times out and the standard pipeline fallback gets "insufficient budget: 0s". Players wait 60-75s for EVERY scenario instead of getting instant cache hits.

FIX — 3 changes:

1. Give prefetchAIScenario() its own independent budget.
   - Find the prefetchAIScenario function definition (around line 10687-10712). It currently calls generateAIScenario() WITHOUT passing a budgetMs parameter, which defaults to 75000.
   - Change the call to pass budgetMs: 100000 (100s) as the 9th parameter. This gives the agent pipeline a full attempt plus enough leftover for standard pipeline fallback.
   - Add this log at the top of prefetchAIScenario: console.log("[BSM] Pre-fetch using independent budget: 100s")

2. Reduce the prefetch delay from 2000ms to 500ms.
   - Find the triggerPrefetch function (around line 11966). It has setTimeout(..., 2000).
   - Change 2000 to 500. The 2s delay wastes generation time for no benefit.

3. Pass the lastAiScenario ref to prefetch to avoid title duplication.
   - In prefetchAIScenario's call to generateAIScenario(), it currently passes null for the lastScenario parameter (8th arg). Find lastAiScenarioRef in the App component and pass its .current value through to prefetchAIScenario so the AI knows what was just generated.
   - This means prefetchAIScenario needs an additional parameter: lastScenario. Thread it through from the call sites.

VERIFICATION: After changes, open the app, play a 2nd Base AI scenario. Console should show:
- "[BSM] Pre-fetch using independent budget: 100s"
- The pre-fetch agent pipeline should get a full 75s attempt
- If agent times out, standard pipeline should get ~25s (not 0s)
Do NOT change any other AI generation logic. Do NOT change the main doAI flow's budget.
```

---

## PROMPT 2: Fix Dual Cache + Ensure Pre-Cached Scenarios Are Consumed

```
Read index.jsx in the baseball-strategy-master folder.

PROBLEM: There are TWO separate caching systems that don't talk to each other:
1. _aiCache (module-level object, ~line 10686) — written by prefetchAIScenario(), read by consumeCachedAI()
2. aiCacheRef (React useRef, ~line 11413) — a position-keyed cache used by a just-in-time precache system around lines 12197-12234

This means pre-fetched scenarios can be missed. Additionally, consumeCachedAI() only matches on position (no concept matching), which is correct, but we need to verify the consumption is actually happening before fresh generation starts.

FIX — 4 changes:

1. Unify to a single cache. Remove the _aiCache module-level object entirely. Convert prefetchAIScenario() to accept aiCacheRef as a parameter and write to aiCacheRef.current.scenarios[position] instead of _aiCache.scenario. Convert consumeCachedAI() to read from aiCacheRef.current.scenarios[position] instead of _aiCache.

   The unified cache shape should be:
   aiCacheRef.current = {
     scenarios: { [position]: { scenario, timestamp } },
     generating: false,
     lastGenTime: 0,
     fetching: false  // moved from _aiCache.fetching
   }

2. Update consumeCachedAI to use the unified cache:
   function consumeCachedAI(position) {
     const cached = aiCacheRef.current?.scenarios?.[position]
     if (cached?.scenario) {
       const entry = cached.scenario
       aiCacheRef.current.scenarios[position] = null
       console.log("[BSM] Consuming pre-cached scenario for " + position + ": " + (entry.scenario?.title || "unknown"))
       return entry
     }
     console.log("[BSM] No pre-cached scenario available for " + position)
     return null
   }

3. In the doAI flow (around line 12108), verify consumeCachedAI(p) is called BEFORE any fresh generation attempt. The current code does this but uses the old _aiCache. Make sure it calls the updated version.

4. Add a cache-age check: if a pre-cached scenario is older than 5 minutes, discard it instead of serving stale content:
   if (cached?.scenario && cached?.timestamp && (Date.now() - cached.timestamp) < 300000) { ... }

IMPORTANT: Since prefetchAIScenario is a module-level function but aiCacheRef is inside the App component, you'll need to pass aiCacheRef into prefetchAIScenario as a parameter from the call sites. Both call sites (triggerPrefetch around line 11968 and the post-answer prefetch around line 12295) are inside App where aiCacheRef is accessible.

VERIFICATION: Play two AI scenarios in a row for the same position. After the first one loads, console should show the pre-fetch starting. When you start the second game, console should show "[BSM] Consuming pre-cached scenario for [position]: [title]" and the scenario should load near-instantly (no 60-75s wait).
```

---

## PROMPT 3: Connect Session Planner to Pre-Fetch (Concept-Aware Caching)

```
Read index.jsx in the baseball-strategy-master folder.

PROBLEM: prefetchAIScenario() passes null as the targetConcept to generateAIScenario(). The session planner (planSession()) creates an 8-scenario learning sequence with specific concepts, but prefetch ignores it entirely. So the pre-cached scenario may teach the wrong concept — the player's learning path says "teach dp-positioning" but the cache has a random concept.

FIX — 2 changes:

1. At the prefetch call sites, peek at the session plan to get the NEXT concept:
   - Find where prefetchAIScenario is called (around lines 11968 and 12295)
   - Before calling prefetch, check sessionPlanRef.current for the next planned item
   - Extract its concept and pass it to prefetchAIScenario as a new parameter: targetConcept

   Example at the call site:
   const nextConcept = sessionPlanRef.current?.[0]?.concept || null
   prefetchAIScenario(position, stats, conceptsLearned, recentWrong, aiHistory, lastScenario, nextConcept, cacheRef)

2. Thread targetConcept through prefetchAIScenario to generateAIScenario:
   - Add targetConcept parameter to prefetchAIScenario's signature
   - Pass it as the 6th argument to generateAIScenario (currently null)
   - Log it: console.log("[BSM] Pre-fetch targeting concept:", nextConcept || "any")

Option: Extract the concept at the call site and pass just the concept string (cleanest approach).

VERIFICATION: Play an AI scenario. Check console for:
- "[BSM] Pre-fetch targeting concept: [some-concept]" (not null/any)
- The pre-fetched scenario's concept should match what the session plan requested
```

---

## PROMPT 4: Lower Pool Quality Gate for Underserved Positions

```
Read index.jsx and worker/index.js in the baseball-strategy-master folder.

PROBLEM: The server pool has 23 scenarios but ZERO entries for 9 of 15 positions (secondBase, shortstop, thirdBase, firstBase, rightField, manager, rules, famous, counts). The quality gates are too strict for bootstrapping:
- Client-side submitToServerPool() has a hard gate at 7.5 (line ~10654)
- Server-side handlePoolSubmit() uses 7.5 for pools < 3, and 8.0 for pools >= 3 (line ~1706)
- Many AI scenarios grade 50-70 (quality 5.0-7.0) which play perfectly fine but never enter the pool

FIX — 4 changes:

1. Client-side gate in submitToServerPool() (index.jsx ~line 10654):
   Change the hard 7.5 gate to be position-aware. Define underserved positions:
   const UNDERSERVED = ['secondBase','shortstop','thirdBase','firstBase','rightField','manager','rules','famous','counts']
   For underserved positions, lower the gate to 6.5. For positions with good pool coverage, keep 7.5.

   if ((qualityScore || 0) < (UNDERSERVED.includes(position) ? 6.5 : 7.5)) {
     console.log("[BSM Pool] Skipped — quality too low:", qualityScore, "for", position)
     return
   }

2. Also update the clientPoolThreshold logic (~line 10013-10016) to match:
   Currently: combinedCount < 3 ? 65 : 75
   Change to: combinedCount < 5 ? 65 : 75
   This keeps the lower gate active until positions have at least 5 pool entries.

3. Server-side gate in handlePoolSubmit() (worker/index.js ~line 1706):
   Change: const qualityGate = (poolCount?.cnt || 0) < 3 ? 7.5 : 8.0
   To: const qualityGate = (poolCount?.cnt || 0) < 5 ? 6.5 : 7.5
   This matches the client-side logic and accepts grade-65+ scenarios for underserved positions.

4. Add error handling for pool submission failures. In submitToServerPool, the fetch call has no .catch(). Add:
   .catch(err => console.warn("[BSM Pool] Submission failed:", err.message))
   This prevents 504 Gateway Timeouts from throwing uncaught errors.

VERIFICATION:
- Play a 2nd Base AI scenario that grades 65-74 (quality 6.5-7.4)
- Console should show "[BSM Pool] Submitting to server pool: secondBase score: X.X"
- Should NOT show "Skipped — quality too low"
- After deploying the worker, the server should accept it (201 response, not 400)
Deploy the worker with: cd worker && npx wrangler deploy
```

---

## PROMPT 5: Add Archetype Injection to Standard Pipeline

```
Read index.jsx in the baseball-strategy-master folder.

PROBLEM: OPTION_ARCHETYPES (25 position:concept combos, ~lines 8413-8507) provides structural guidance for creating strategically distinct options. But it's ONLY injected in buildAgentPrompt() (agent pipeline). When the agent pipeline times out and falls back to the standard pipeline, options lose this structural guidance, leading to "4 slightly different throws" scenarios.

FIX:

1. In generateAIScenario(), find where the standard pipeline builds its prompt (around lines 9495-9567 for the user message, and 9588-9627 for the system message).

2. Before the prompt construction, add archetype lookup:
   const archetypeKey = `${position}:${targetConcept || ''}`
   const archetype = OPTION_ARCHETYPES?.[archetypeKey]

3. If an archetype exists, inject it into the user prompt (NOT the system message — keep it in the user content where it's most visible to the model):

   const archetypeBlock = archetype ? `
   OPTION BLUEPRINT (structural guide, NOT literal text — create your own scenario but follow this option structure):
   Moment: ${archetype.moment}
   Option A (correct): ${archetype.correct}
   Option B (kid mistake): ${archetype.kid_mistake}
   Option C (sounds smart): ${archetype.sounds_smart}
   Option D (clearly wrong): ${archetype.clearly_wrong}
   ` : ''

4. Insert archetypeBlock into the prompt string, right after the POSITION RULES section and before the EXAMPLE section.

5. Log when archetype is applied:
   if (archetype) console.log("[BSM] Standard pipeline using archetype for", archetypeKey)

DO NOT modify buildAgentPrompt() or the agent pipeline. Only add archetypes to the standard pipeline's prompt construction.

VERIFICATION: To test, you'd need to force a standard pipeline fallback (agent timeout). The standard pipeline scenario should have more strategically diverse options when an archetype exists for that position:concept combo.
```

---

## PROMPT 6: Make getAIFewShot Concept-Aware

```
Read index.jsx in the baseball-strategy-master folder.

PROBLEM: getAIFewShot() (around line 4839) accepts a targetConcept parameter but completely ignores it. Selection is purely random by position group. A steal-breakeven scenario might get a bunt-defense few-shot example, reducing generation quality.

FIX:

1. Find getAIFewShot (around line 4839-4849). Currently it:
   - Maps position to a pool (pitcher, fielder, batter, baserunner, manager)
   - Randomly picks one example from that pool
   - Ignores targetConcept entirely

2. Create a concept-family mapping at the top of the function:
   const CONCEPT_FAMILIES = {
     'baserunning': ['steal-breakeven', 'steal-timing', 'lead-distance', 'tag-up', 'force-advance', 'baserunning-aggression'],
     'defense': ['cutoff-roles', 'relay-alignment', 'backup-responsibilities', 'dp-positioning', 'infield-positioning', 'of-depth-arm-value'],
     'pitching': ['pitch-selection', 'count-leverage', 'pitch-sequencing', 'pitch-location'],
     'batting': ['count-hitting', 'situational-hitting', 'hit-and-run', 'bunt-strategy', 'sacrifice-situations'],
     'game-management': ['bullpen-management', 'lineup-strategy', 'defensive-substitution', 'pinch-hit-timing']
   }

3. When targetConcept is provided:
   - Find which family it belongs to
   - Check if any few-shot examples in the pool have a matching concept family
   - If yes, prefer those examples (pick randomly among matches)
   - If no match, fall back to current random selection from the position pool

4. The matching should be loose — check if the example's concept string contains any keyword from the family, or if the family array includes the example's conceptTag.

5. Log the selection: console.log("[BSM] Few-shot selected:", example concept or title, "for target:", targetConcept || "any")

VERIFICATION: Check console logs during AI generation. When targetConcept is "steal-breakeven", the few-shot example should be from the baserunning family (not a random bunt-defense example).
```

---

## PROMPT 7: Raise Agent Grading Threshold and Add Quality Logging

```
Read index.jsx in the baseball-strategy-master folder.

PROBLEM 1: gradeAgentScenario() passes scenarios at score >= 45 (line ~9043), while gradeScenario() requires >= 65. This 20-point gap lets mediocre agent scenarios through. The comment says the low threshold was set when grading raw (pre-fix) scenarios, but now auto-fixes are applied before grading, so the threshold can be raised.

PROBLEM 2: There's no aggregate quality logging. Individual [BSM Grade] logs exist but there's no summary view to quickly assess overall quality trends.

FIX — 2 changes:

1. Raise agent threshold from 45 to 55 (line ~9043):
   Change: grade.pass = grade.score >= 45
   To: grade.pass = grade.score >= 55

   This still gives 10 points of headroom below the standard pipeline's 65 (justified because agent scenarios get additional validation via the Grade tool call). Update the comment to explain the new threshold.

2. Add a quality summary log after each AI scenario is fully processed (accepted or rejected). Find where the final scenario decision is made (around lines 9990-10020 where [BSM Grade] is logged). Add a single summary line:

   console.log(`[BSM Quality] position=${position} concept=${scenario.conceptTag || scenario.concept || 'unknown'} source=${aiMode ? 'agent' : 'standard'} grade=${grade.score} pass=${grade.pass} cacheHit=${!!wasCached} elapsed=${Date.now() - flowStart}ms`)

   Where:
   - source = which pipeline generated it
   - cacheHit = whether it came from pre-cache or pool
   - elapsed = total time from when the user clicked play to scenario ready
   - flowStart should be captured at the start of the AI flow (use _aiFlowStart if it exists, or Date.now() as fallback)

VERIFICATION: Play 3 AI scenarios. Console should show [BSM Quality] logs with all fields populated. No agent scenarios should pass with grade below 55.
```

---

## PROMPT 8: Enable Pre-Fetch for Free Users (When Applicable)

```
Read index.jsx in the baseball-strategy-master folder.

PROBLEM: The triggerPrefetch function (around line 11964) has an early return: if (!stats.isPro) return. Free users who earn AI scenarios (remediation after wrong answers, or when handcrafted pool is exhausted in the future) get no pre-caching benefit and face the full 60-75s wait.

FIX:

1. In triggerPrefetch (around line 11964), remove the blanket Pro gate:
   Change: if (!stats.isPro) return
   To: // Allow prefetch for any user who just completed an AI scenario
        // The prefetch itself is free (no play count consumed)

2. BUT — only trigger prefetch if the user just played an AI scenario (not a handcrafted one). The prefetch call is already inside a condition that checks aiMode. Verify that this condition exists. If not, add a check:
   if (!aiMode) return  // Only prefetch after AI scenarios

3. This is a small change but removes an unnecessary gate. The prefetch doesn't consume a "play" — it just generates in the background. If the user never triggers another AI scenario, the cached result simply expires.

VERIFICATION: This is hard to test without a free account. Just verify the code change is correct — the isPro check is removed and the aiMode check remains.
```

---

## PROMPT 9: Add Concept-Match Bonus in Grading

```
Read index.jsx in the baseball-strategy-master folder.

PROBLEM: When we request a specific concept (e.g., "dp-positioning") via the session planner, the grading system doesn't reward scenarios that actually teach that concept. A scenario about bunt defense gets the same score as one about DP positioning, even though we specifically requested DP positioning. This means concept drift has no penalty.

FIX:

1. In gradeScenario() (around line 7572), find where the final score is calculated.

2. Add a concept-match bonus: if the scenario's conceptTag matches the requested targetConcept, award +3 bonus points (before capping at 100). If it doesn't match and a targetConcept was provided, apply a -3 penalty.

   To do this, gradeScenario needs to accept targetConcept as a parameter. Find all call sites of gradeScenario and thread targetConcept through. The main call sites are:
   - After standard pipeline generation
   - After agent pipeline generation (via gradeAgentScenario)

3. Add a deduction entry for concept drift:
   if (targetConcept && scenario.conceptTag && scenario.conceptTag !== targetConcept) {
     deductions.push('concept_drift_from_target')
     score -= 3
   } else if (targetConcept && scenario.conceptTag === targetConcept) {
     score += 3  // Bonus for on-target concept
   }

4. Log when concept match/mismatch occurs:
   console.log("[BSM Grade] Concept target:", targetConcept, "got:", scenario.conceptTag, targetConcept === scenario.conceptTag ? "(match +3)" : targetConcept ? "(drift -3)" : "(no target)")

VERIFICATION: Play an AI scenario where the session plan requests a specific concept. Check [BSM Grade] log for concept match/drift notation and the +3 or -3 adjustment.
```

---

## PROMPT 10: Worker Timeout + Pool Submission Resilience

```
Read worker/index.js in the baseball-strategy-master/worker folder.

PROBLEM: Multiple 504 Gateway Timeouts appear in testing when:
1. AI generation takes close to 75s (the worker's abort timeout)
2. Pool submissions (POST to /scenario-pool/submit) fail silently or throw

FIX — 2 changes:

1. Increase the worker-side AI generation timeout from 75s to 90s.
   Find the setTimeout that creates the abort (search for "75000" or "setTimeout" near the fetch to xAI).
   Change 75000 to 90000. The client-side budget system already handles overall timeouts, so the worker just needs to not abort before the client does.

2. Add a response timeout for pool submission on the client side (index.jsx).
   In submitToServerPool(), wrap the fetch in a Promise.race with a 10-second timeout:

   const controller = new AbortController()
   const timeout = setTimeout(() => controller.abort(), 10000)
   fetch(WORKER_BASE + "/scenario-pool/submit", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ scenario, position, quality_score: qualityScore, audit_score: auditScore, source: "ai" }),
     signal: controller.signal
   })
   .then(r => {
     clearTimeout(timeout)
     if (r.ok) console.log("[BSM Pool] Submitted successfully for", position)
     else r.json().then(j => console.warn("[BSM Pool] Server rejected:", j.error, j.min, j.got))
   })
   .catch(err => {
     clearTimeout(timeout)
     console.warn("[BSM Pool] Submission failed:", err.message)
   })

   This is fire-and-forget — pool submission should NEVER block gameplay.

Deploy the worker after changes: cd worker && npx wrangler deploy

VERIFICATION: Play an AI scenario. Pool submission should complete within 10s or fail gracefully (no uncaught errors, no 504s blocking the UI).
```

---

## Execution Order Summary

| # | Prompt | Impact | Risk | Deploy? |
|---|--------|--------|------|---------|
| 1 | Pre-fetch budget fix | HIGH — eliminates 60-75s wait on 2nd+ game | LOW | Yes |
| 2 | Unify cache + consumption | HIGH — makes pre-fetch actually useful | MEDIUM | Yes |
| 3 | Session plan → pre-fetch concept | MEDIUM — correct concept in cache | LOW | Yes |
| 4 | Lower pool gates | MEDIUM — bootstraps empty positions | LOW | Yes + worker |
| 5 | Standard pipeline archetypes | MEDIUM — better fallback quality | LOW | Yes |
| 6 | Concept-aware few-shot | LOW-MEDIUM — marginal quality boost | LOW | Yes |
| 7 | Agent threshold + quality logging | LOW-MEDIUM — fewer bad scenarios + observability | LOW | Yes |
| 8 | Free user pre-fetch | LOW — small UX improvement | LOW | Yes |
| 9 | Concept-match grading bonus | LOW — nudges on-topic generation | LOW | Yes |
| 10 | Worker timeout + submission resilience | MEDIUM — eliminates 504s | LOW | Yes + worker |

**Recommended batches:**
- **Batch A (do first):** Prompts 1, 2, 3 — fixes the pre-caching system end-to-end
- **Batch B:** Prompts 4, 10 — fixes pool bootstrapping and worker reliability
- **Batch C:** Prompts 5, 6, 7 — quality improvements
- **Batch D:** Prompts 8, 9 — nice-to-haves

---

## Post-Implementation Testing Checklist

After all prompts are complete:

1. **Cache hit test**: Play 2 AI scenarios for same position back-to-back. Second should load in <5s.
2. **Concept alignment test**: Check [BSM Quality] logs — pre-cached scenario concept should match session plan.
3. **Pool growth test**: Play 5 scenarios for secondBase. Query D1 to verify new entries appear.
4. **Fallback test**: Play manager (usually times out agent). Standard pipeline should have archetype injection. Scenario should have diverse options.
5. **Quality bar test**: Check 10 [BSM Quality] logs. No agent scenarios below 55. Average should be 60+.
6. **No regressions**: Handcrafted scenarios, daily diamond, speed round, survival mode all still work normally.
