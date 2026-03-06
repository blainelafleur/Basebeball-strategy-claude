# Baseball Strategy Master — AI Superpower Plan (Revised)

> **Goal**: Transform the AI from "a feature that works" into "the most badass AI brain in the baseball world" — the engine that makes BSM impossible to compete with.

**Date**: March 2026 (Revised after full codebase audit)
**Current State**: BRAIN v2.4.0, 539 handcrafted scenarios, xAI Grok via Cloudflare Worker (streaming, 30s timeout, error classification), dual pipeline (standard + agent with Plan→Generate→Grade), 21 knowledge maps, A/B testing framework (6 tests), QUALITY_FIREWALL (3 tiers), CONSISTENCY_RULES (10 checks), cross-player learning batch system, `enrichFeedback()` with contextual insights, `getSmartCoachLine()` with 25+ situation keys
**Target State**: A self-improving, deeply personalized baseball intelligence system that coaches every kid like a private hitting instructor who also happens to have a photographic memory of every MLB game ever played.

---

## WHAT'S ALREADY BUILT (Audit Results)

Before diving into what's new, here's what the full code audit revealed is **already implemented and working**. The previous version of this plan proposed several things that actually exist in code. Knowing this changes the roadmap significantly.

### Already Implemented — DO NOT REBUILD

| Feature | Location | Status |
|---------|----------|--------|
| Worker timeout + streaming + error classification | `worker/index.js` lines 1237-1284 | ✅ Deployed (30s AbortController, streaming passthrough, 5 error types) |
| `formatBrainForAI()` — RE24, count, steal, bunt, TTO, scoring prob, win prob, pitch types injected into AI prompts | `index.jsx` ~line 6200 | ✅ Live via `brain_data_level` A/B test |
| `formatBrainStats()` — comprehensive position-aware data injection with level context, vocab tiers, youth qualifiers | `index.jsx` ~line 6140 | ✅ Live |
| `enrichFeedback()` — generates 0-3 contextual insights using BRAIN data after each answer | `index.jsx` ~line 6100 | ✅ Live for Pro users |
| `getSmartCoachLine()` — 25+ situation-aware coaching lines (bases-loaded, high-leverage, dp-situation, etc.) | `index.jsx` ~line 6130 | ✅ Live (40% trigger rate for Pro) |
| QUALITY_FIREWALL with 3 tiers (6 hard rejects, 4 warnings, 3 suggestions) | `index.jsx` ~line 6390 | ✅ Live |
| CONSISTENCY_RULES with 10 cross-position checks (CR1-CR10) | `index.jsx` ~line 6719 | ✅ Live |
| `gradeScenario()` — 8-dimension scoring (role boundary, explanation quality, rate alignment, etc.) | `index.jsx` ~line 6653 | ✅ Live |
| Agent Pipeline: `planScenario()` → `buildAgentPrompt()` → `gradeAgentScenario()` | `index.jsx` lines 6897-7206 | ✅ Live via `agent_pipeline` A/B test (20% traffic) |
| KNOWLEDGE_BASE object with 6 methods for agent access | `index.jsx` ~line 6789 | ✅ Live |
| A/B testing framework with 6 tests (temperature, system prompt, bible injection, brain data level, few-shot count, agent pipeline) | `index.jsx` ~line 6845 | ✅ Live |
| Cross-player learning: `buildLearningContribution()` + batch flush to `/analytics/population-difficulty` | `index.jsx` ~line 7073 | ✅ Code exists, endpoint TBD |
| `aiMetrics` / `hcMetrics` — separate quality tracking for AI vs handcrafted | DEFAULT state | ✅ Live |
| BIBLE_PRINCIPLES injection (~200-400 words per position) | `bible_injection` A/B test | ✅ Live |
| Expanded few-shot (1-3 examples, position-matched + concept-matched) | `few_shot_count` A/B test | ✅ Live |
| Auto-fix rate-best alignment | `generateWithAgentPipeline()` line 7180 | ✅ Live |
| `sanitizeAIResponse()` — strips markdown fences, "Assistant:" prefixes | `index.jsx` ~line 6370 | ✅ Live |
| `getTeachingContext()` / `filterByReadiness()` — concept prerequisites and mastery-aware filtering | `index.jsx` ~line 6330 | ✅ Live |
| Flagged scenario avoidance — fetches player-flagged patterns to inject as "AVOID" | `generateAIScenario()` line 7241 | ✅ Live |

### What This Means for the Plan

The original plan's Pillar 2 (Computational Brain) is ~70% done. The agent pipeline (Pillar 5) is ~60% done. The feedback engine (Pillar 6) has scaffolding. **The biggest untouched areas are: adaptive coaching (Pillar 1), learning paths (Pillar 3), age intelligence (Pillar 4), and the experience layer (Pillar 7).** That's where the superpower lives.

---

## THE REAL GAPS (Post-Audit)

**GAP 1: The AI generates scenarios but doesn't truly COACH.**
`enrichFeedback()` adds 0-3 contextual insights and `getSmartCoachLine()` fires 40% of the time — but there's no error classification, no follow-up sequences, no progressive deepening. When a kid gets a relay play wrong, the AI doesn't know if it was role confusion (they thought the pitcher should be cutoff) or priority error (they knew the SS was cutoff but threw to the wrong base). Without error diagnosis, the system can't prescribe the right remedy.

**GAP 2: Pre-calculated brain data goes INTO the prompt but doesn't VALIDATE the response.**
`formatBrainForAI()` injects RE24, count leverage, steal break-even, bunt delta, TTO, scoring probability, win probability, and pitch types into the prompt. The AI sees this data. But after the AI generates a scenario, nothing checks whether the "best" answer actually aligns with the injected numbers. The QUALITY_FIREWALL checks structural quality (rate sanity, explanation length, position boundaries) but not *strategic correctness against BRAIN data*. A scenario could recommend bunting when the RE24 delta is -0.19 and still pass all checks.

**GAP 3: Personalization is session-level, not journey-level.**
The agent's `planScenario()` checks degraded concepts, prerequisite gaps, and due-for-review items — this is real personalization. But it's reactive (responding to recent errors) not proactive (building a learning arc). There's no session planner, no concept sequencing across sessions, no multi-scenario arcs where play #3 builds on play #1.

**GAP 4: Age calibration uses vocabulary tiers but not concept gating.**
`formatBrainStats()` adjusts vocabulary (tier 1-5) and adds youth qualifiers ("at the youth level"), and the prompt says "NEVER use analytics jargon for diff:1." But there's no structural gate preventing a 7-year-old from seeing a suicide squeeze scenario or a TTO analysis. The vocabulary adapts; the strategic depth doesn't.

**GAP 5: The agent pipeline grades structure, not pedagogy.**
`gradeAgentScenario()` checks concept_mismatch, difficulty_mismatch, and title_duplicate on top of the standard 8-dimension `gradeScenario()`. But it doesn't ask: "Did this scenario actually TEACH what the plan intended?" or "Is the best answer provably correct given the situation's RE24?" The grading is about form, not function.

**GAP 6: Cross-player learning data is collected but not consumed.**
`buildLearningContribution()` and `flushLearningBatch()` send anonymized data to the worker. But there's no endpoint that reads this data to calibrate difficulty, detect population-level struggles, or feed insights back into prompt generation. The pipe is built; the water doesn't flow back.

**GAP 7: No coach persona or Baseball IQ — the experience is functional, not magical.**
The AI generates good scenarios with good explanations. But it doesn't have personality. There's no coach voice that adapts to the kid's age and streak. There's no "Baseball IQ" number that kids screenshot and share. The product works but doesn't create moments of delight.

---

## THE PLAN: 7 Pillars of AI Superpower

### PILLAR 1: The Coaching Engine (AI That Coaches, Not Just Quizzes)

**What exists**: `enrichFeedback()` generates contextual insights. `getSmartCoachLine()` triggers 40% of the time with situation-aware lines.

**What's missing**: Error classification, coaching follow-ups, progressive explanation depth.

**1A. Error Classification System** *(NEW — builds on enrichFeedback)*

When a player answers wrong, classify the error BEFORE showing feedback. This lives alongside `enrichFeedback()` but runs first to determine the error type:

```javascript
// Add to index.jsx after enrichFeedback() (~line 6130)
function classifyError(scenario, chosenIdx, bestIdx, position) {
  const chosenExpl = scenario.explanations[chosenIdx] || ""
  const bestExpl = scenario.explanations[bestIdx] || ""
  const concept = scenario.concept || ""

  // Priority order — first match wins
  if (/rule|illegal|balk|violation|not allowed/i.test(chosenExpl))
    return { type: "RULE_ERROR", remedy: "rule_focused", weight: 1.0 }
  if (/not.*job|wrong position|that's the|shouldn't be/i.test(chosenExpl))
    return { type: "ROLE_CONFUSION", remedy: "multi_position", weight: 0.9 }
  if (/RE24|run expectancy|percentage|break.even|analytics/i.test(bestExpl))
    return { type: "DATA_ERROR", remedy: "data_comparison", weight: 0.8 }
  if (/priority|first|before|instead|order/i.test(chosenExpl))
    return { type: "PRIORITY_ERROR", remedy: "priority_hierarchy", weight: 0.7 }

  const count = scenario.situation?.count
  if (count && count !== "-" && /count|0-2|3-0|hitter|pitcher/i.test(bestExpl))
    return { type: "COUNT_BLINDNESS", remedy: "count_scenario", weight: 0.7 }

  return { type: "SITUATIONAL_MISS", remedy: "general_review", weight: 0.5 }
}
```

**Where it wires in**: The answer handler (in `App()`, around line 4800 where `handleChoice` processes wrong answers) calls `classifyError()` and stores the result in `wrongCounts` alongside the existing spaced-repetition data. The error type influences what `planScenario()` selects next.

**1B. Coaching Follow-Up Offer** *(NEW)*

After a wrong answer + error classification, show a "Try Again?" button that generates a scenario targeting the same concept from a different angle. This is a simple UI addition — a button that calls `generateAIScenario()` with `targetConcept` set to the failed concept and a `remedyType` parameter that instructs the prompt to approach from the classified error's perspective.

Code location: Add to the feedback display section in `App()` (~line 5200 where explanations render).

**1C. Progressive Explanation Depth** *(NEW)*

Three-layer explanations the player can tap through. This is a UI change (add expand/collapse) plus a prompt change (ask for `explSimple`, `explWhy`, and `explData` fields). The handcrafted scenarios already have varying explanation depths — this formalizes it for AI scenarios.

- **Layer 1** (always shown): Simple what-happened statement (1-2 sentences)
- **Layer 2** (tap "Why?"): Strategic reasoning with coaching voice (2-3 sentences)
- **Layer 3** (tap "Data" — ages 12+ only): RE24, count data, break-even calculations

**Implementation note**: This requires changing the AI response JSON format from `explanations: [4 strings]` to `explanations: [4 objects with {simple, why, data}]`. This is a breaking change for AI scenarios only — handcrafted scenarios keep the current format, and the rendering code handles both shapes.

**Priority**: HIGH — This is the single biggest differentiation opportunity.

---

### PILLAR 2: The Computational Brain (AI That Calculates, Not Just Generates)

**What exists**: `formatBrainForAI()` injects RE24, count leverage, steal break-even, bunt delta, TTO, scoring prob, win prob, and pitch types into every AI prompt. `formatBrainStats()` adds even more position-aware context. The data IS going to the model.

**What's missing**: Post-generation validation that the AI's "best" answer actually aligns with the BRAIN data it was given.

**2A. Brain-Data Answer Validator** *(NEW — adds to QUALITY_FIREWALL)*

Add a new tier-1 check to QUALITY_FIREWALL that validates the best answer against computed BRAIN data:

```javascript
// Add to QUALITY_FIREWALL.tier1 (~line 6410)
brainContradiction: (s, pos) => {
  const sit = s.situation || {}
  const runners = sit.runners || []
  const outs = sit.outs ?? 0
  const bestOption = (s.options?.[s.best] || "").toLowerCase()
  const bestExpl = (s.explanations?.[s.best] || "").toLowerCase()
  const warnings = []

  // Check: Does best answer recommend bunting against the numbers?
  if (runners.length > 0 && outs < 2) {
    const rKey = runnersToKey(runners)
    const buntDelta = BRAIN.stats.buntDelta?.[`${rKey}_${outs}`]
    if (buntDelta && buntDelta < -0.15 && /bunt|sacrifice/i.test(bestOption)) {
      warnings.push(`Best answer is bunt but bunt delta is ${buntDelta}`)
    }
  }

  // Check: Does best answer recommend stealing against break-even?
  if (runners.includes(1) || runners.includes(2)) {
    if (/steal|go on first/i.test(bestOption)) {
      const breakEven = BRAIN.stats.stealBreakEven
      // Only flag if the explanation doesn't acknowledge the risk
      if (breakEven && !/risk|gamble|aggressive|break.even/i.test(bestExpl)) {
        warnings.push("Steal recommended without acknowledging break-even threshold")
      }
    }
  }

  return warnings.length > 0 ? warnings.join("; ") : null
}
```

**2B. Pre-Calculated Situation Facts in Prompt** *(ENHANCEMENT of formatBrainForAI)*

`formatBrainForAI()` currently dumps data tables. Enhance it to also include pre-calculated conclusions:

```javascript
// Add to formatBrainForAI() (~line 6200) after the data injection:
// CALCULATED ANALYSIS FOR THIS SITUATION:
const rKey = runnersToKey(situation.runners || [])
const outs = situation.outs ?? 0
const re24 = BRAIN.stats.RE24[rKey]?.[outs]
const scoringProbs = (situation.runners || []).map(b =>
  `runner on ${b}: ${BRAIN.stats.scoringProbability?.[b]?.[outs] || '?'}% chance to score`
).join(", ")
// Inject: "Current RE24: 0.71. Scoring chances: runner on 2nd: 63%."
// Then: "USE THESE NUMBERS to validate your correct answer."
```

This is a refinement of what already exists — the data is there, we just need to add the "so what" interpretation.

**Priority**: HIGH — This makes AI answers provably correct, not just "probably right."

---

### PILLAR 3: The Learning Architect (Personalized Concept Sequences)

**What exists**: `planScenario()` already checks degraded concepts, prerequisite gaps, due-for-review items, and introduces new concepts. `BRAIN.concepts` has a prerequisite graph. `getTeachingContext()` finds unmastered concepts. `filterByReadiness()` checks prerequisites.

**What's missing**: Multi-session learning paths, session-level planning, connected scenario arcs.

**3A. Learning Path Definitions** *(NEW)*

Define structured learning progressions that span multiple sessions:

```javascript
const LEARNING_PATHS = {
  "defensive_fundamentals": {
    sequence: ["ready-position", "fly-ball-tracking", "fly-ball-priority",
               "cutoff-basics", "relay-positioning", "relay-decision-making"],
    assessAt: [2, 4, 6], // Checkpoint assessments
    positions: ["firstBase", "secondBase", "shortstop", "thirdBase",
                "leftField", "centerField", "rightField"]
  },
  "baserunning_intelligence": {
    sequence: ["force-vs-tag", "lead-distance", "pitcher-reads-basic",
               "steal-timing", "secondary-leads", "pitcher-reads-advanced",
               "count-based-running"],
    assessAt: [3, 5, 7],
    positions: ["baserunner"]
  },
  "count_mastery": {
    sequence: ["strike-zone-basics", "ahead-behind-concept", "two-strike-approach",
               "hitters-count-aggression", "count-leverage-data"],
    assessAt: [2, 4],
    positions: ["batter", "pitcher", "catcher"]
  },
  // 5-8 more paths covering all strategic domains
}
```

**Where it wires in**: `planScenario()` (line 6897) currently picks concepts somewhat randomly from available unmastered items. With learning paths, the planner first checks: "Where is this player on their active path?" and selects the next concept in sequence. Falls back to current behavior if no path is active.

**3B. Session Planner** *(NEW)*

At the start of an AI session (first AI scenario request), compute an optimal 8-scenario sequence:

```javascript
function planSession(stats, position) {
  const plan = []
  const mastery = stats.masteryData || { concepts: {} }

  // 1. Remediation: any degraded concepts? (1-2 scenarios)
  const degraded = getDueForReview(mastery).filter(c => c.state === 'degraded')
  degraded.slice(0, 2).forEach(c =>
    plan.push({ type: "remediation", concept: c.tag }))

  // 2. Prerequisites: any gaps blocking progress? (1 scenario)
  const gaps = getPrereqGaps(mastery)
  if (gaps.length > 0)
    plan.push({ type: "prerequisite", concept: gaps[0].gap })

  // 3. Path progression: advance along current learning path (3-4 scenarios)
  const path = getCurrentPath(mastery, position)
  const next = getNextInPath(path, mastery, 4 - plan.length)
  next.forEach(c => plan.push({ type: "progression", concept: c }))

  // 4. Challenge: one scenario at the edge of ability (1 scenario)
  plan.push({ type: "challenge", concept: null }) // planScenario picks hardest unmastered

  // 5. Engagement: famous play or mixed-position (1 scenario)
  plan.push({ type: "engagement", concept: null })

  return plan.slice(0, 8)
}
```

**Where it wires in**: Store the session plan in a ref (`sessionPlanRef`). Each time `planScenario()` runs, it pops the next item from the session plan. When the plan is empty or the player switches positions, generate a new one.

**3C. Connected Scenario Arcs** *(NEW — agent pipeline enhancement)*

When the agent pipeline's `planScenario()` has a "progression" teaching goal, it can generate a follow-up that references the previous scenario's game state:

Add to `buildAgentPrompt()`:
```
PREVIOUS SCENARIO IN THIS ARC: "${previousScenario.title}" — the player saw: ${previousScenario.description.slice(0, 100)}...
BUILD ON THIS: Create a scenario in the SAME GAME, a few batters later, where the situation has evolved. Reference the earlier play if relevant.
```

This makes the AI feel like it's narrating a real game, not producing disconnected quizzes.

**Priority**: HIGH — This transforms random quizzing into structured learning.

---

### PILLAR 4: The Age Intelligence Layer (Strategy That Grows With the Player)

**What exists**: `formatBrainStats()` uses vocabulary tiers (1-5), youth qualifiers, and the prompt says "NEVER use analytics jargon for diff:1." The `diffGrad` system in DEFAULT state tracks per-position difficulty graduation for ages 6-8. `ageMin`/`ageMax` fields exist on handcrafted scenarios.

**What's missing**: Structural concept gating (not just vocabulary), age-appropriate strategic adjustments, and a dynamic vocabulary engine.

**4A. Concept Gating by Age Level** *(NEW)*

```javascript
const CONCEPT_GATES = {
  "tball_coachpitch": {  // Ages 5-8, diff:1
    allowed: ["ready-position", "fly-ball-tracking", "throw-to-base",
              "force-vs-tag-basic", "run-on-contact", "tag-up-basic",
              "strike-zone-basic", "batter-contact"],
    forbidden: ["RE24", "steal-break-even", "count-leverage", "TTO",
                "suicide-squeeze", "shift-rules", "pitch-clock",
                "platoon-advantage", "leverage-index"],
    adjustments: {
      stealing: "Almost always correct — catchers can't throw at this age",
      bunting: "Usually effective — fielders can't handle it",
      errors: "Expect lots — teach what to do AFTER errors"
    }
  },
  "youth_pitch": {  // Ages 8-11, diff:1-2
    allowed: [/* tball concepts + */ "steal-timing-basic", "lead-distance",
              "bunt-basics", "cutoff-basics", "backup-duties",
              "pitcher-reads-basic", "count-awareness", "two-strike-approach"],
    adjustments: {
      stealing: "Lower threshold (~60% break-even) due to catcher skill",
      bunting: "More effective than MLB level",
      pitchCount: "Youth limits: 50-75 pitches"
    }
  },
  "travel_middle": {  // Ages 11-14, diff:2-3
    allowed: ["ALL_BASIC_PLUS", "relay-positioning", "double-cuts",
              "hit-and-run", "squeeze-plays", "pickoff-moves",
              "pitch-sequencing", "count-leverage", "steal-break-even"],
    adjustments: {
      stealing: "Break-even closer to 65%",
      bunting: "Starting to resemble standard analysis"
    }
  },
  "high_school_plus": {  // Ages 14-18, diff:1-3
    allowed: ["ALL"],
    adjustments: {
      stealing: "Standard 72% break-even applies",
      bunting: "RE24 analysis fully applies"
    }
  }
}
```

**Where it wires in**: `planScenario()` line 6897 — after selecting a concept, check it against `CONCEPT_GATES[ageGroup].allowed`. If forbidden, pick a different concept. Also inject `adjustments` into the prompt so the AI knows that "stealing is almost always correct" for T-ball age players.

**4B. Age-Adaptive Prompt Injection** *(ENHANCEMENT of formatBrainStats)*

Add to the AI prompt (in `buildAgentPrompt()` or `formatBrainStats()`):

```
PLAYER AGE GROUP: ${ageGroup}
STRATEGIC ADJUSTMENTS FOR THIS AGE:
${Object.entries(CONCEPT_GATES[ageGroup].adjustments).map(([k,v]) => `- ${k}: ${v}`).join("\n")}
FORBIDDEN CONCEPTS: ${CONCEPT_GATES[ageGroup].forbidden?.join(", ") || "none"}
```

This ensures the AI generates age-appropriate strategy, not just age-appropriate vocabulary.

**Priority**: MEDIUM-HIGH — Critical for the 6-12 range where the app has the most growth potential.

---

### PILLAR 5: The Intelligent Agent Pipeline (AI That Reasons About Teaching)

**What exists**: Full Plan→Generate→Grade pipeline. `planScenario()` selects teaching goals, concepts, difficulty based on mastery data. `buildAgentPrompt()` constructs focused prompts. `gradeAgentScenario()` scores on 8 structural dimensions + concept/difficulty match.

**What's missing**: Pedagogical grading, brain-data validation in grading, and situation-optimal generation.

**5A. Pedagogical Grade Dimensions** *(ENHANCEMENT of gradeAgentScenario)*

Add pedagogical checks to `gradeAgentScenario()` (line 7026):

```javascript
// Add after existing agentDeductions checks (~line 7062):

// Does the best explanation actually TEACH the concept?
const bestExpl = scenario.explanations?.[scenario.best] || ""
if (bestExpl.length < 80) {
  grade.score -= 10
  agentDeductions.push("best_explanation_too_brief_for_teaching")
}

// Does it explain WHY (causal language)?
if (!/because|since|this means|the reason|so that|which is why/i.test(bestExpl)) {
  grade.score -= 5
  agentDeductions.push("missing_causal_reasoning_in_best_explanation")
}

// Brain-data contradiction check (from Pillar 2A)
const brainWarnings = QUALITY_FIREWALL.tier1.brainContradiction(scenario, plan.position)
if (brainWarnings) {
  grade.score -= 15
  agentDeductions.push("brain_contradiction: " + brainWarnings)
}
```

**5B. Situation-Optimal Generation** *(ENHANCEMENT of planScenario)*

When `planScenario()` selects a concept to teach, also compute the optimal game situation that best illustrates that concept:

```javascript
// Add to planScenario() after concept selection (~line 6934):
function getOptimalSituation(concept) {
  // Map concepts to their "teaching situation" — the base/out/count state
  // where the concept matters most
  const CONCEPT_SITUATIONS = {
    "force-vs-tag": { runners: [1, 2], outs: 1 }, // Multiple force possibilities
    "steal-timing": { runners: [1], outs: 0, count: "2-1" }, // Classic steal spot
    "sacrifice-bunt": { runners: [2], outs: 0 }, // Textbook bunt situation
    "relay-positioning": { runners: [2], outs: 0 }, // Ball to outfield, runner scoring
    "infield-fly": { runners: [1, 2], outs: 0 }, // Rule requires < 2 outs
    // ... map for all ~40 concepts
  }
  return CONCEPT_SITUATIONS[concept] || null
}
```

When an optimal situation is defined, inject it as a constraint: `"SET the game situation to: runners on ${runners}, ${outs} out(s), count ${count}. This situation is chosen because it best illustrates ${concept}."`

This prevents the AI from generating a steal scenario with bases empty or a bunt scenario with 2 outs.

**5C. Agent Pipeline Traffic Increase** *(CONFIG CHANGE)*

The agent pipeline is currently at 20% traffic (`agent_pipeline` A/B test, line 6888). Based on the fact that the pipeline includes planning, focused prompts, and grading, increase to 50% once Pillars 2A and 5A are added:

```javascript
agent_pipeline: {
  id: "agent_pipeline_v2",
  variants: [
    { id: "control", weight: 50, config: { useAgent: false } },
    { id: "agent", weight: 50, config: { useAgent: true } }
  ]
}
```

Monitor `aiMetrics` to compare agent vs standard scenario quality.

**Priority**: MEDIUM — The current pipeline works. These enhancements make it excellent.

---

### PILLAR 6: The Feedback & Improvement Engine (AI That Gets Smarter Over Time)

**What exists**: `buildLearningContribution()` and `flushLearningBatch()` collect anonymized per-answer data (concept, correct, difficulty, position, age group, level, session hash). `aiMetrics`/`hcMetrics` track AI vs handcrafted success rates separately. The worker has the `/analytics/population-difficulty` endpoint. `flaggedScenarios` collection in D1.

**What's missing**: Reading population data back into generation, automated difficulty calibration, prompt patches based on struggle patterns.

**6A. Population Difficulty Calibration Endpoint** *(NEW worker endpoint)*

Add to `worker/index.js`:

```javascript
// GET /analytics/difficulty-calibration
// Returns concepts with extreme correct rates (too easy or too hard)
async function handleDifficultyCalibration(request, env, cors) {
  const db = env.DB // D1 database
  const results = await db.prepare(`
    SELECT concept, position,
           COUNT(*) as attempts,
           ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100) as pct
    FROM learning_events
    WHERE timestamp > ?
    GROUP BY concept, position
    HAVING attempts >= 20
    ORDER BY pct ASC
  `).bind(Date.now() - 30 * 24 * 60 * 60 * 1000).all()

  // Flag concepts with < 30% or > 90% correct rate
  const calibrations = results.results
    .filter(r => r.pct < 30 || r.pct > 90)
    .map(r => ({
      concept: r.concept,
      position: r.position,
      rate: r.pct,
      adjustment: r.pct < 30 ? "too_hard" : "too_easy",
      attempts: r.attempts
    }))

  return new Response(JSON.stringify({ calibrations }), {
    headers: { ...cors, "Content-Type": "application/json" }
  })
}
```

**6B. Prompt Patches from Population Data** *(NEW)*

When `planScenario()` runs, optionally fetch calibration data (cached for 1 hour) and inject patches:

```javascript
// In planScenario() or buildAgentPrompt():
if (calibrationData?.find(c => c.concept === selectedConcept && c.adjustment === "too_hard")) {
  plan.promptPatch = `NOTE: ${selectedConcept} has a population mastery rate below 30%.
  Players find this concept very difficult. Make the correct answer more obvious than usual.
  The best explanation should be especially clear and use a concrete example.`
}
```

**6C. Learning Event Schema in D1** *(NEW — worker infrastructure)*

Create the D1 table to actually store the learning events that `flushLearningBatch()` sends:

```sql
CREATE TABLE learning_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_id TEXT,
  position TEXT NOT NULL,
  concept TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  is_correct BOOLEAN NOT NULL,
  is_ai BOOLEAN DEFAULT FALSE,
  session_hash TEXT,
  age_group TEXT DEFAULT '11-12',
  level INTEGER DEFAULT 1,
  timestamp INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_concept_ts ON learning_events(concept, timestamp);
CREATE INDEX idx_position_ts ON learning_events(position, timestamp);
```

**6D. A/B Test Result Collection** *(NEW worker endpoint)*

The client tracks A/B variant assignments but has no way to report outcomes to the server. Add:

```javascript
// POST /analytics/ab-results
// Receives: { testId, variantId, sessionHash, metric, value }
// Stores in D1 for later analysis via scripts/ab-analysis.js
```

**Priority**: MEDIUM — This is what makes the system self-improving over months.

---

### PILLAR 7: The Experience Layer (AI That Feels Magical)

**What exists**: `getSmartCoachLine()` with 25+ situation keys. Level-up celebrations. Achievement system. 10 field themes. Streak tracking.

**What's missing**: Coach persona, Baseball IQ score, streak-aware coaching, "Real Game" mode.

**7A. Coach Persona System** *(NEW)*

Three coaching voices based on age group:

- **Coach Rookie** (ages 6-10): High-five energy, simple analogies, celebrates everything
- **Coach Varsity** (ages 11-14): Teaching-focused, uses real player names, introduces stats gently
- **Coach Scout** (ages 15-18): Analytical peer, full stat vocabulary, game theory references

**Implementation**: Add a `coachVoice` parameter to the AI system prompt:

```javascript
const COACH_VOICES = {
  rookie: "You are Coach Rookie — an enthusiastic, encouraging youth baseball coach. Use simple words, exciting analogies ('like a superhero catching the bad guy!'), and celebrate effort. Never use statistics or advanced terms.",
  varsity: "You are Coach Varsity — a knowledgeable travel ball coach. Reference real MLB players as examples. Introduce statistics gently ('the numbers show...'). Be encouraging but also direct about mistakes.",
  scout: "You are Coach Scout — an analytical baseball mind. Use full statistical vocabulary. Reference game theory, RE24, leverage. Talk to the player like a peer analyst."
}
```

Also inject the voice into `getSmartCoachLine()` so the 40% coaching lines match the persona.

**7B. Baseball IQ Score** *(NEW)*

A visible, dynamic number (50-160 scale, like IQ) that reflects strategic understanding:

```javascript
function computeBaseballIQ(stats) {
  const w = {
    conceptsMastered: 0.30,      // Breadth
    advancedDepth: 0.25,         // Depth on hard concepts
    consistency: 0.20,           // Don't just guess right once
    crossPosition: 0.15,         // Multiple positions
    errorRecovery: 0.10          // Learn from mistakes
  }

  const mastery = stats.masteryData?.concepts || {}
  const masteredCount = Object.values(mastery).filter(c => c.state === 'mastered').length
  const totalConcepts = Object.keys(BRAIN.concepts).length

  const breadth = Math.min(masteredCount / totalConcepts, 1.0)
  const depth = /* % of diff:3 concepts mastered */ 0
  const consistency = /* avg mastery stability score */ 0
  const crossPos = /* unique positions with >60% accuracy */ 0
  const recovery = /* % of wrong→retry→correct */ 0

  const raw = breadth * w.conceptsMastered + depth * w.advancedDepth
            + consistency * w.consistency + crossPos * w.crossPosition
            + recovery * w.errorRecovery

  return Math.round(50 + (raw * 110)) // Range: 50-160
}
```

Display prominently on the profile screen. This is the number kids will screenshot and share. Update after every answer.

**7C. Streak-Aware Coaching** *(ENHANCEMENT of getSmartCoachLine)*

Add streak awareness to the coaching line logic:

```javascript
// Add to getSmartCoachLine() (~line 6130):
if (currentStreak >= 5) {
  situations.push({
    key: "hot-streak",
    lines: [
      "🔥 Five in a row — you're locked in. Let me challenge you.",
      "You're seeing the game clearly right now. Time to level up."
    ]
  })
}
if (wrongStreak >= 3) {
  situations.push({
    key: "cold-streak",
    lines: [
      "Baseball is a game of adjustments. Let's slow down and rebuild.",
      "Even the best hitters go 0-for-3 sometimes. Let's find your swing."
    ]
  })
}
```

Also: when `wrongStreak >= 3`, auto-drop to a prerequisite concept (this is a `planScenario()` enhancement).

**7D. "Real Game" Mode** *(NEW — Phase 2)*

AI generates a full 9-inning game where decisions carry forward. This is the flagship Pro feature and biggest technical challenge. Design it in Phase 2 after Pillars 1-6 are solid.

Key design principles:
- Each inning = one scenario, but the situation evolves based on previous choices
- Wrong answers have consequences (runs score, runners advance)
- Right answers prevent damage or create opportunities
- Final score = your Baseball IQ for that game
- Shareable result card: "I managed a 5-3 win with a Baseball IQ of 134!"

**Priority**: HIGH for Baseball IQ and Coach Personas. MEDIUM for Real Game Mode (complex, save for Phase 2).

---

## EXECUTION ROADMAP

### Phase A: Foundation & Validation (Weeks 1-2)

| # | Task | Pillar | Effort | Impact |
|---|------|--------|--------|--------|
| 1 | Build error classification system (`classifyError`) | 1A | 4 hrs | HIGH |
| 2 | Add brain-data answer validator to QUALITY_FIREWALL | 2A | 3 hrs | HIGH |
| 3 | Enhance `formatBrainForAI()` with pre-calculated conclusions | 2B | 2 hrs | MEDIUM |
| 4 | Add pedagogical grading to `gradeAgentScenario()` | 5A | 3 hrs | MEDIUM |
| 5 | Create D1 `learning_events` table and wire `/analytics/population-difficulty` endpoint | 6C | 3 hrs | HIGH (enables Phase D) |
| 6 | Implement concept gating by age (`CONCEPT_GATES`) | 4A | 4 hrs | HIGH |

**Deliverable**: AI scenarios are provably correct, errors are classified, young kids don't see advanced concepts.

### Phase B: Coaching Intelligence (Weeks 3-4)

| # | Task | Pillar | Effort | Impact |
|---|------|--------|--------|--------|
| 7 | Build session planner (`planSession()`) | 3B | 5 hrs | HIGH |
| 8 | Add situation-optimal generation to `planScenario()` | 5B | 3 hrs | MEDIUM |
| 9 | Build coaching follow-up offer ("Try Again?" button) | 1B | 4 hrs | HIGH |
| 10 | Implement coach persona system (3 voices) | 7A | 3 hrs | HIGH |
| 11 | Add age-adaptive prompt injection | 4B | 2 hrs | MEDIUM |

**Deliverable**: AI feels like a coach with personality that plans sessions, not a random quiz generator.

### Phase C: Learning Architecture (Weeks 5-6)

| # | Task | Pillar | Effort | Impact |
|---|------|--------|--------|--------|
| 12 | Define learning path data structure (`LEARNING_PATHS`) | 3A | 4 hrs | HIGH |
| 13 | Wire learning paths into `planScenario()` | 3A | 3 hrs | HIGH |
| 14 | Build connected scenario arcs in agent pipeline | 3C | 5 hrs | MEDIUM |
| 15 | Implement Baseball IQ score | 7C | 4 hrs | HIGH (viral) |
| 16 | Add streak-aware coaching to `getSmartCoachLine()` | 7B | 2 hrs | MEDIUM |

**Deliverable**: Players follow structured learning paths with a visible Baseball IQ that grows.

### Phase D: Feedback Loop (Weeks 7-8)

| # | Task | Pillar | Effort | Impact |
|---|------|--------|--------|--------|
| 17 | Build population difficulty calibration endpoint | 6A | 4 hrs | MEDIUM |
| 18 | Implement prompt patches from population data | 6B | 3 hrs | MEDIUM |
| 19 | Build A/B test result collection endpoint | 6D | 3 hrs | MEDIUM |
| 20 | Increase agent pipeline to 50% traffic | 5C | 0.5 hrs | MEDIUM |
| 21 | Build progressive explanation depth (3-layer UI) | 1C | 5 hrs | HIGH |

**Deliverable**: The system learns from its player population and self-improves.

### Phase E: Polish & Magic (Weeks 9-10)

| # | Task | Pillar | Effort | Impact |
|---|------|--------|--------|--------|
| 22 | Design "Real Game" mode architecture | 7D | 6 hrs | HIGH (Pro feature) |
| 23 | Integration testing across all pillars | ALL | 4 hrs | CRITICAL |
| 24 | A/B test all new features (error classification, personas, Baseball IQ) | ALL | 3 hrs | HIGH |
| 25 | Polish Baseball IQ sharing card (screenshot-friendly) | 7C | 2 hrs | MEDIUM |

**Deliverable**: Feature-complete AI superpower system ready for user growth.

---

## WHAT THIS LOOKS LIKE WHEN IT'S DONE

**Today**: Kid picks shortstop, gets a random scenario, answers, sees green/yellow/red with 0-3 contextual insights, moves on.

**After this plan**: Kid picks shortstop. The session planner knows they mastered cutoff basics but failed relay positioning last Tuesday (ROLE_CONFUSION error — they thought the pitcher was the relay man). The AI generates a relay scenario at the right difficulty for their age (12), using an optimal game situation (runner on 2nd, 0 outs — where relay decisions matter most). Coach Varsity says: "This is exactly the play Javier Báez makes look easy. Let's see if you can read it like he does." The kid gets it wrong again — the error classifier catches it as the same ROLE_CONFUSION pattern and shows a three-layer explanation. Layer 1: "The shortstop is the relay man here because the ball was hit to left-center." Layer 2 (tap): "On any ball to the left side of the outfield, the shortstop lines up between the outfielder and the target base. The pitcher backs up the base in case of an overthrow — they're never the relay." Layer 3 (tap): "RE24 drops from 1.27 to 0.71 if the relay is clean and the runner holds at 2nd. A botched relay lets the run score." A "Try Again?" button appears. The next scenario is from the same "game" — now it's the 5th inning and the relay situation has evolved. Their Baseball IQ ticks up from 108 to 110.

That's not a quiz app. That's a coach.

---

## TECHNICAL NOTES

**Model**: The code uses `grok-4-1-fast-non-reasoning` (line 7135). This should be verified against xAI's current model list — xAI uses dots not hyphens in some model names. If the model is wrong, AI fails 100% of the time (see AI_FIX_PLAN.md for the diagnostic steps).

**Latency budget**: Standard pipeline: ~2-3s. Agent pipeline: ~4-5s. With enhanced planning and brain validation, budget for 5-7s on agent. Session planner pre-generates the next 2-3 scenarios during idle time to mask latency (use `prefetchAIScenario` infrastructure that already exists).

**Token budget**: Current prompt is ~537 tokens request, ~138 tokens response per scenario (~$0.000047/scenario per TOKEN_ANALYSIS.md). With pre-calculated facts and enhanced context, budget for ~800 tokens request. Still well under $0.001/scenario. The 3-layer explanation response format will increase response tokens to ~250. Total: under $0.0002/scenario.

**Storage**: All player data (error types, learning paths, Baseball IQ, session plans) lives in localStorage `bsm_v5`. Population analytics go to D1 via the worker. No new infrastructure needed — D1 and the worker endpoint scaffolding already exist.

**Backward compatibility**: Everything layers ON TOP of the existing system. Handcrafted scenarios (539) continue working exactly as they do today. AI improvements only affect AI-generated scenarios (Pro feature). Free users get error classification, coaching personas, and Baseball IQ on handcrafted scenarios.

**Key code locations for implementation**:
- Error classification: Wire into answer handler in `App()` (~line 4800)
- Brain validator: Add to `QUALITY_FIREWALL.tier1` (~line 6410)
- Session planner: New function, called from `doAI()` (~line 7527)
- Concept gating: Wire into `planScenario()` (~line 6926)
- Coach personas: Add to system prompt in `buildAgentPrompt()` (~line 7139)
- Baseball IQ: New function + UI addition in profile screen (~line 5400)
- Learning paths: New constant + wire into `planScenario()` (~line 6897)
- D1 table: `worker/index.js` migration + endpoint
