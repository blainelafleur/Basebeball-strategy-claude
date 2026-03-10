# BSM AI Round 2 — Execution Prompts

> **Generated:** March 9, 2026
> **Source:** Live testing report (BSM_AI_Testing_Report.docx)
> **How to use:** Copy each prompt into Claude Code / Windsurf. Execute them in order (1→5). Each prompt is self-contained with the exact problem, file locations, line numbers, and what to change.

---

## Prompt 1 of 5: Fix Budget Cascade Failure (CRITICAL)

```
TASK: Fix the AI budget cascade failure in index.jsx.

PROBLEM: When the agent pipeline times out (75s), only ~15s remain from the 88s AI_BUDGET. The standard pipeline needs 60-70s for grok-4, so it ALWAYS fails after an agent timeout. This causes a guaranteed cascade: agent timeout → standard skipped → handcrafted fallback → circuit breaker opens. Testing showed 2 out of 5 AI attempts (40%) failed this way.

CONSOLE EVIDENCE:
- [BSM Agent] Pipeline failed: Timeout
- [BSM] Agent pipeline returned null, falling back to standard
- [BSM] Insufficient budget for standard pipeline after agent: 15s remaining, skipping to fallback
- [BSM] Circuit breaker OPENED — 2 consecutive failures

ROOT CAUSE (3 locations):

1. AI_BUDGET is too small at line ~12666:
   const AI_BUDGET=90000

2. Agent pipeline timeout defaults to 75000ms at line ~9473:
   async function generateWithAgentPipeline(position, stats, conceptsLearned, recentWrong, signal, targetConcept, aiHistory, flaggedAvoidText = "", previousScenario = null, timeoutMs = 75000) {

3. Budget gate at line ~9835 requires only 20s minimum, but grok-4 needs 60-70s:
   if (remainingBudget < 20000) {
     console.log("[BSM] Insufficient budget for standard pipeline after agent: " + Math.round(remainingBudget / 1000) + "s remaining, skipping to fallback")
     return { scenario: null, error: "timeout" }
   }

FIX — Option A (recommended, simplest):
- Change AI_BUDGET from 90000 to 180000 (180 seconds total)
- Change the budget gate minimum from 20000 to 65000 (so standard pipeline only runs if it has enough time)
- This gives the standard pipeline a full 65+ seconds after an agent timeout

FIX — Option B (more aggressive):
- Reduce agent timeout from 75000 to 45000 (45 seconds)
- Keep AI_BUDGET at 90000
- Change budget gate minimum from 20000 to 40000
- This gives 45s to the agent AND 40+ seconds for standard fallback

ALSO: At the agent budget calculation (line ~12813-12814):
   const agentBudget = budgetMs - (Date.now() - _aiFlowStart) - 2000
   if (!skipAgent && agentConfig.useAgent && agentBudget >= 10000) {
Ensure the agent doesn't start if it can't complete within 45s (or whatever timeout you choose) — change the >= 10000 check to >= timeoutMs.

IMPORTANT: The pre-fetch already uses an independent 100s budget with skipAgent=true (line ~12699: "Pre-fetch using independent budget: 100s"). Do NOT change pre-fetch behavior — that's working correctly.

TEST: After this change, trigger AI Coach's Challenge for Manager and Runner positions. Both should either:
(a) Complete via agent pipeline within budget, OR
(b) Fall back to standard pipeline with enough time to complete (60-70s)
The console should never show "Insufficient budget for standard pipeline" unless the total flow has genuinely been running for 180+ seconds.
```

---

## Prompt 2 of 5: Fix Agent Concept Targeting by Position (CRITICAL)

```
TASK: Fix the agent pipeline's planScenario() function so it only selects concepts relevant to the requested position.

PROBLEM: The agent planner selects concepts from the WRONG position. Testing showed:
- Manager position → Agent planned: "When a runner takes a big lead, throw over to first" (a PITCHER concept)
- Runner position → Agent planned: "pitch-count-mgmt" (a PITCHER/CATCHER concept)
This wastes the entire budget generating an irrelevant scenario that will likely fail or be confusing.

ROOT CAUSE: In the planScenario() function starting at line ~9024, the degraded and learning concept paths do NOT filter by position:

Line ~9042-9044:
  const dueReview = getDueForReview(playerMasteryData)
  const degraded = dueReview.filter(c => c.state === 'degraded')     // ← NO POSITION FILTER
  const learning = dueReview.filter(c => c.state === 'learning')     // ← NO POSITION FILTER

The getDueForReview() function (line ~6387-6393) returns ALL concepts across ALL positions that are due for review. It has zero awareness of which position was requested.

In contrast, the "introduce new concept" branch at line ~9054 DOES filter correctly:
  const available = KNOWLEDGE_BASE.getConceptsForPosition(position)  // ← CORRECT

Similarly, the getPrereqGap() function at line ~9035 returns prerequisites regardless of position.

FIX: Add position filtering to the degraded and learning concept paths. After line 9042, filter both lists using KNOWLEDGE_BASE.getConceptsForPosition():

  const dueReview = getDueForReview(playerMasteryData)
  // FIX: Filter by position so we don't teach pitcher concepts to managers
  const positionConcepts = new Set(KNOWLEDGE_BASE.getConceptsForPosition(position).map(c => c.tag))
  const degraded = dueReview.filter(c => c.state === 'degraded' && positionConcepts.has(c.tag))
  const learning = dueReview.filter(c => c.state === 'learning' && positionConcepts.has(c.tag))

Also filter the prereqGap at line ~9036-9038:
  if (prereqGap && positionConcepts.has(prereqGap.gap)) {
    teachingGoal = "prerequisite"
    selectedConcept = prereqGap.gap
  }

VERIFY: KNOWLEDGE_BASE.getConceptsForPosition() is defined at line ~7973:
  getConceptsForPosition(position) {
    const domains = POS_CONCEPT_DOMAINS[position]
    if (!domains) return Object.keys(BRAIN.concepts)
    return Object.entries(BRAIN.concepts)
      .filter(([, c]) => !c.domain || domains.includes(c.domain))
      .map(([tag, c]) => ({ tag, ...c }))
  }

Make sure POS_CONCEPT_DOMAINS has entries for ALL 15 positions (pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, leftField, centerField, rightField, batter, baserunner, manager, famous, rules, counts). If any are missing, add appropriate domain mappings.

Also add a console log so we can verify the fix is working:
  console.log("[BSM Agent] Plan: filtered " + dueReview.length + " concepts to " + degraded.length + " degraded + " + learning.length + " learning for " + position)

TEST: Trigger AI Coach's Challenge for Manager and Runner. The console should show:
- Concepts that are actually relevant to that position
- NOT pitcher/catcher concepts like "throw over to first" or "pitch-count-mgmt"
```

---

## Prompt 3 of 5: Fix Coach Says Feedback Relevance (HIGH)

```
TASK: Make the "Coach Says" feedback aware of the scenario's concept/topic, not just the raw game situation numbers.

PROBLEM: The getSmartCoachLine() function (line ~6923) selects coach messages based ONLY on the game situation (runners, outs, count, score, inning). It completely ignores what the scenario is actually about. This causes mismatched feedback:

EXAMPLE: Pitcher scenario about HOLDING A RUNNER (throwing over to first base):
- Situation: runner on 1st, 0 outs
- Line 6981: `runners.includes(1) && outs < 2 && !runners.includes(3)` → key = "dp-situation"
- Coach says: "Double play situation — ground ball is the pitcher's best friend."
- This is WRONG — the scenario was about pickoff moves, NOT inducing ground balls for double plays.

The coach line priority cascade at lines 6979-6996 picks the FIRST matching situation key. Since "dp-situation" matches before any pickoff/holdrunner key, the coach always talks about double plays when there's a runner on 1st with < 2 outs, even when the scenario concept is about something completely different.

FIX: Add concept-awareness to getSmartCoachLine(). The function already receives `situation` — add a `concept` parameter and use it to influence key selection.

1. Change the function signature at line ~6923:
   function getSmartCoachLine(cat, situation, position, streak, isPro, stats, currentWrongStreak, concept = null)

2. Update the call site at line ~12860 to pass the scenario's concept:
   setCoachMsg(getSmartCoachLine(cat, sc.situation, pos, isOpt ? stats.str+1 : 0, stats.isPro, stats, newWrongStreak, sc.concept));

3. Inside the function, before the situation cascade (line ~6978), add concept-based overrides:
   // Concept-aware coach lines: if the scenario teaches a specific concept,
   // prefer a coach line related to that concept over generic situation lines
   if (concept) {
     const conceptLower = concept.toLowerCase()
     if (/pickoff|throw.over|hold.?runner|big.?lead/.test(conceptLower)) key = "pickoff-window"
     else if (/steal|stolen.?base/.test(conceptLower)) key = runners.length > 0 ? "steal-window" : null
     else if (/bunt|sacrifice/.test(conceptLower)) key = "squeeze-alert"
     else if (/double.?play|dp|turn.?two/.test(conceptLower)) key = "dp-situation"
     else if (/pitch.?count|fatigue|bullpen/.test(conceptLower)) key = "fatigue-warning"
     // ... add more concept→key mappings as needed
   }
   // Fall through to situation-based selection only if concept didn't match
   if (!key) {
     // existing situation cascade at lines 6979-6996
   }

4. Also check that the `_okPerspective(key)` filter at line 6976 is applied AFTER concept selection too. Currently it's defined but I don't see it being used as a gate before setting the key. Add:
   if (key && !_okPerspective(key)) key = null  // Don't show defense tips to batters

5. Add coach tips for concepts that don't have them yet. Check BRAIN.coaching.situational (line ~6241) for coverage of pickoff-window, hold-runner, etc. If "pickoff-window" isn't defined, add it:
   "pickoff-window": "Smart play checking the runner — keep them honest and shorten that lead."

TEST: Play a pitcher scenario about holding runners. Coach Says should reference holding/pickoff, NOT double plays. Play a batter scenario with runner on 1st — Coach should NOT say "DP situation" (that's a defensive tip shown to an offensive position).
```

---

## Prompt 4 of 5: Exclude Pre-Fetch Aborts from Circuit Breaker (MEDIUM)

```
TASK: Prevent navigation-triggered pre-fetch aborts from counting toward the circuit breaker failure threshold.

PROBLEM: When a user navigates away while a background pre-fetch is in progress, the AbortController fires and the pre-fetch fails with "ai_aborted: signal is aborted without reason". While the main game flow at line ~12762 correctly checks `if(ctrl?.signal.aborted)return` before updating state, the ERROR LOGGING at lines 12739-12745 still fires, and more importantly, the generateAIScenario() function returns { scenario: null, error: "timeout" } which the caller at line 12746 treats as a failure.

CONSOLE EVIDENCE:
- [BSM] AI generation failed: aborted signal is aborted without reason
- [BSM Error] ai_aborted: signal is aborted without reason
(These appeared twice during testing — once each for pitcher and batter pre-fetches)

The circuit breaker at lines 12747-12761 increments failures when `result?.scenario` is falsy:
  } else {
    aiFailRef.current.consecutive++;
    const _cbF = getCircuitBreaker()
    _cbF.failures++
    if (_cbF.failures >= 2) {
      _cbF.openUntil = Date.now() + 10*60*1000
      console.warn("[BSM] Circuit breaker OPENED — 2 consecutive failures")
    }

FIX: In the error/failure handling path, check if the abort was from navigation (not a real timeout) before incrementing failures.

1. In the generateAIScenario function, when catching the abort error, return a distinct error type:
   Instead of: return { scenario: null, error: "timeout" }
   Use:        return { scenario: null, error: signal?.aborted ? "aborted" : "timeout" }

2. In the failure handler at line ~12746, skip circuit breaker increment for aborts:
   } else {
     // Don't count user-navigation aborts as failures
     if (result?.error !== "aborted") {
       aiFailRef.current.consecutive++;
       const _cbF = getCircuitBreaker()
       _cbF.failures++
       if (_cbF.failures >= 2) {
         _cbF.openUntil = Date.now() + 10*60*1000
         console.warn("[BSM] Circuit breaker OPENED — 2 consecutive failures")
       }
       updateCircuitBreaker(_cbF)
     } else {
       console.log("[BSM] Abort detected (navigation) — not counting toward circuit breaker")
     }

3. Similarly, the pre-fetch function at line ~11226+ should catch aborts silently:
   } catch (e) {
     if (e.name === 'AbortError' || _prefetchController?.signal?.aborted) {
       console.log("[BSM] Pre-fetch cancelled (navigation)")
     } else {
       console.warn("[BSM] Pre-fetch failed:", e.message)
     }
   }

TEST: Start an AI scenario, then immediately click Back or switch positions before it loads. The console should show "Pre-fetch cancelled (navigation)" and the circuit breaker failure count should NOT increment. Then trigger 2 real AI failures (e.g., by temporarily setting a 5s timeout) — circuit breaker should still open correctly after 2 real failures.
```

---

## Prompt 5 of 5: Improve Option Overlap Detection for Semantic Similarity (LOW)

```
TASK: Improve the Quality Firewall's ability to detect semantically similar options, not just word-overlap similar options.

PROBLEM: AI Scenario "Big Lead Throwover" had these options:
1. "Throw over to first" (marked as best answer, 85% rate)
2. "Step off the rubber" (acceptable, 60% rate)
3. "Quick-pitch to the plate" (bad, 25% rate)
4. "Ignore the runner and pitch" (bad, 15% rate)

The issue: "Throw over to first" and "Step off the rubber" describe the SAME PHYSICAL ACTION — you MUST step off the rubber before you can throw to first. They're not truly distinct options. But the current optionOverlap check at lines 7431-7444 only measures word overlap (shared words / min words). Since these options use completely different words, the overlap score is ~0% and the check passes.

The gradeScenario function at lines 7691-7699 has a similar word-based check with a 60% threshold.

CURRENT DETECTION (Tier 2, line ~7431):
  optionOverlap(scenario) {
    const opts = scenario.options || []
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const a = opts[i].toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/)
        const b = opts[j].toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/)
        const shared = a.filter(w => w.length > 3 && b.includes(w))
        const overlap = shared.length / Math.min(a.length, b.length)
        if (overlap > 0.7) return "Option overlap..."
      }
    }

FIX: Add a semantic equivalence check using a predefined set of baseball action synonyms/subsets. Create a SEMANTIC_OVERLAPS constant:

const SEMANTIC_OVERLAPS = [
  // Each array contains actions that are subsets/prerequisites of each other
  ["throw over to first", "pick off", "step off the rubber", "check the runner"],
  ["sacrifice bunt", "bunt the runner over", "lay down a bunt"],
  ["throw home", "throw to the plate", "fire home"],
  ["tag up", "advance after the catch", "score on the fly ball"],
  ["steal second", "take off for second", "go on the pitch"],
  ["take the pitch", "don't swing", "hold up", "watch it go by"],
  ["swing away", "look for your pitch", "sit on a fastball"],
  ["call time", "step out of the box", "ask for time"],
  ["intentional walk", "put him on", "walk him"],
  ["go to the bullpen", "bring in the reliever", "make a pitching change"],
  ["cover the bag", "get to the base", "be at the bag"],
  ["back up the throw", "back up the play", "get behind the throw"],
]

Then add a semantic check to the optionOverlap tier2 function:
  // After word-overlap check, also check semantic overlap
  for (const group of SEMANTIC_OVERLAPS) {
    const matching = []
    for (let i = 0; i < opts.length; i++) {
      const optLower = opts[i].toLowerCase()
      if (group.some(phrase => optLower.includes(phrase))) matching.push(i)
    }
    if (matching.length >= 2) {
      return "Semantic overlap: options " + matching.map(i=>i+1).join(" and ") + " describe related/identical actions: [" + group[0] + "]"
    }
  }

Also add to gradeScenario (line ~7691) for point deductions:
  // Semantic similarity check
  for (const group of SEMANTIC_OVERLAPS) {
    const matching = opts.map((o,i) => group.some(phrase => o.toLowerCase().includes(phrase)) ? i : -1).filter(i => i >= 0)
    if (matching.length >= 2) { score -= 15; deductions.push(`semantic_overlap_${matching.join('_')}`) }
  }

ALSO: Add the same check to the AI prompt itself. In the system prompt for AI scenario generation, add a rule:
"CRITICAL: Each option must describe a DISTINCT physical action. 'Step off the rubber' and 'throw over to first' are NOT distinct — stepping off IS part of throwing over. Options must represent genuinely different strategic choices."

TEST: Generate a pitcher AI scenario about holding runners. The 4 options should each describe a truly different action (e.g., "Throw to first", "Quick-pitch to the plate", "Ignore the runner", "Pitch from the stretch with a slide step"). "Step off the rubber" should NOT appear as a separate option from "Throw over to first."
```

---

## Execution Order

| # | Prompt | Priority | Impact |
|---|--------|----------|--------|
| 1 | Budget Cascade Fix | CRITICAL | Fixes 40% AI failure rate |
| 2 | Concept Targeting Fix | CRITICAL | Fixes wrong-position scenarios |
| 3 | Coach Says Relevance | HIGH | Fixes confusing feedback |
| 4 | Pre-Fetch Abort Handling | MEDIUM | Prevents false circuit breaks |
| 5 | Semantic Option Overlap | LOW | Better answer differentiation |

**After executing all 5:** Deploy to Cloudflare Pages, then test by clicking AI Coach's Challenge for Manager, Runner, and Pitcher. Verify:
- Manager/Runner no longer timeout (Prompt 1 fix)
- Manager/Runner get position-appropriate concepts (Prompt 2 fix)
- Coach Says matches the scenario topic, not just situation (Prompt 3 fix)
- Pre-fetch aborts don't trigger circuit breaker (Prompt 4 fix)
