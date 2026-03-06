# AI Scenario Generation — Strategic Improvement Plan

> **Goal**: Transform AI-generated scenarios from a D- to A+ quality — indistinguishable from what the smartest, most experienced baseball coach would teach.

> **Date**: March 4, 2026

---

## Executive Diagnosis

After a complete analysis of all 12,200+ lines of `index.jsx`, the Cloudflare Worker, the SCENARIO_BIBLE.md, and the BRAIN_KNOWLEDGE_SYSTEM.md, I've identified **7 root causes** for why the AI generation sounds like "a T-ball player with a stat brain" instead of a seasoned coach. The problems are not random — they form a pattern that compounds.

---

## The 7 Root Causes

### Root Cause 1: Prompt Overload — The AI Is Drowning in Data

**The Problem**: The prompt sent to Grok is absolutely massive. It contains RE24 tables, count data, scoring probabilities, pitch type data, steal break-even rates, bunt deltas, TTO effects, win probability, 19 knowledge maps, position principles, Bible principles, few-shot examples, real game feel data, decision windows, coaching voice, feedback patterns, prompt patches, mastery data, error patterns, age gates, A/B test configs, analytics rules, position-action boundaries, and deduplication history — all in a single prompt.

**Why This Hurts**: When you dump that much context on an LLM, it can't figure out what matters most. It latches onto the detailed statistical data (because it's precise and structured) and generates scenarios that revolve around edge-case statistical situations rather than the **fundamental coaching concepts** that matter. The AI doesn't know that the coaching voice and situational fundamentals should dominate — it treats every injected block equally.

**Evidence**: The `formatBrainForAI()` function alone produces a wall of RE24 tables, count data, steal percentages, bunt deltas, TTO effects, scoring probabilities, win probability tables, AND pitch type data. This is followed by "CALCULATED ANALYSIS" conclusions. Then the system prompt adds another 30+ lines of explanation rules, common mistakes, and variation requirements. The model is seeing a spreadsheet when it should be seeing a baseball field.

### Root Cause 2: Teaching Concept Selection Is Random

**The Problem**: When no target concept exists, `planScenario()` picks a random unseen concept. And in the standard pipeline, `getTeachingContext()` gives the AI a list of 5 unmastered concepts and says "teach one of these." The AI then picks whichever concept fits the statistical data it's already fixated on — usually the most exotic or unusual one.

**Why This Hurts**: Random concept selection + statistical overload = the AI gravitates toward niche analytical scenarios (steal break-even, bunt RE24 optimization, IBB calculus) instead of the **bread-and-butter fundamentals** that make up 80% of real baseball (cutoff relay alignment, backing up bases, two-strike approach, when to charge a bunt, fly ball priority).

**Evidence**: The SCENARIO_BIBLE has a beautifully organized knowledge hierarchy — fundamentals first, analytics second. But the AI prompt doesn't enforce this hierarchy. A first-time player is just as likely to get a scenario about TTO-driven pitching change decisions as they are about "where does the shortstop line up for a relay."

### Root Cause 3: The Few-Shot Examples Are Too Condensed

**The Problem**: The `buildAgentPrompt()` function condenses example scenarios to one line each: `"Title" (diff:X) — concept. Options: A | B | C | D (best=N)`. The standard pipeline's `getAIFewShot()` includes more detail but still truncates descriptions and explanations.

**Why This Hurts**: The handcrafted scenarios are **excellent** — they have vivid game descriptions, options that represent genuinely different strategic philosophies, and explanations that teach like a real coach. But the AI only sees skeletons of these examples. It doesn't absorb the coaching voice, the situational richness, or the explanation depth. It mimics the structure but not the soul.

**Evidence**: Compare a handcrafted catcher scenario description — "Runner on second, 1 out, 3-2 count on a strong left-handed pull hitter. Your pitcher has been living on the outside corner all night but just hung a slider. The batter fouled it straight back — he's ON the fastball." — vs. what the AI likely generates: "It's the 5th inning with a runner on second and 1 out. The count is 3-2."  The handcrafted version puts you IN the game. The AI version reads like a box score.

### Root Cause 4: Options Don't Represent Real Baseball Decisions

**The Problem**: The prompt tells the AI to create "4 options that are physical actions or decisions that ONLY this position makes" and warns against duplicates. But it doesn't teach the AI what real baseball decision trees look like. The AI doesn't understand that a catcher facing a runner on 2nd with signs being stolen has a finite set of real responses (change signs, pitch out, pitch to contact, vary location) — it invents plausible-sounding but strategically incoherent options.

**Why This Hurts**: The options end up being:
- Too similar (4 slightly different throws)
- Cross-position (fielder options that are really manager decisions)
- Strategically incoherent (options that no coach would ever consider in that situation)
- Missing the obvious right answer (the thing any experienced player would do isn't even listed)

**Evidence**: The `DECISION_WINDOWS` and `REAL_GAME_SITUATIONS` data are designed to fix this, but they're injected as additional context blocks rather than structuring how the AI thinks about options. The AI treats them as nice-to-have rather than as the blueprint for option construction.

### Root Cause 5: The Model Choice Is Suboptimal for This Task

**The Problem**: The app uses `grok-4-1-fast-non-reasoning` (xAI's Grok). This is a speed-optimized, non-reasoning model. Baseball strategy scenario creation is a reasoning-heavy task that requires:
1. Understanding a complex game situation
2. Identifying the correct strategic principle
3. Generating 4 meaningfully different options
4. Determining which is objectively best and why
5. Writing 4 distinct explanations that each reference the specific situation
6. Ensuring internal consistency (score matches description, options match the moment)

A non-reasoning model will pattern-match and generate plausible-sounding output rather than actually reasoning through the baseball logic.

**Why This Hurts**: The model produces scenarios that *look* right structurally but are strategically wrong when a real baseball person reads them. It's like having a student who can write a well-formatted essay but doesn't actually understand the subject.

### Root Cause 6: The Validation/Grading Is Too Structural, Not Strategic

**The Problem**: The `gradeAgentScenario()` and the quality firewall checks validate:
- JSON structure
- rates[best] is highest
- Role violations (regex-based)
- Score-description consistency
- That explanations exist

They do NOT validate:
- Whether the correct answer is actually correct baseball strategy
- Whether the options represent real strategic trade-offs
- Whether the explanations teach something meaningful
- Whether the scenario teaches a fundamental vs. an edge case

**Why This Hurts**: Scenarios that are structurally perfect but strategically wrong pass through to the player. The grading system is checking the formatting, not the baseball.

### Root Cause 7: No Concept Weighting System

**The Problem**: All concepts are treated equally. There's no priority system that says "cutoff alignment is 10x more important than pitch clock strategy for a shortstop" or "two-strike approach is the #1 concept for batters under 12."

**Why This Hurts**: The AI generates scenarios about niche topics as often as about fundamental ones. A 9-year-old gets a scenario about TTO effects when they should be learning about backing up bases.

---

## The Strategic Plan — 5 Pillars

### Pillar 1: Restructure the Prompt Architecture (THE BIGGEST WIN)

**Problem solved**: Root Causes 1, 3, 4

The current prompt is a flat wall of data. We need to restructure it into a **prioritized, layered architecture** where the AI knows exactly what matters most.

#### 1A: Create a "Scenario Blueprint" System

Instead of dumping all context and hoping the AI picks the right parts, we pre-compute a **scenario blueprint** before the prompt is even constructed. This blueprint specifies:

```javascript
const SCENARIO_BLUEPRINTS = {
  // For each position + concept combination, define:
  "shortstop:cutoff_alignment": {
    situation_template: {
      required_runners: [1], // or [1,2] — runner must be advancing
      required_outs: [0, 1], // not 2 outs (no relay needed)
      score_context: "close_game", // so the relay actually matters
      inning_range: [4, 8], // middle-to-late game
    },
    decision_moment: "Ball is hit to left-center gap. Runner is rounding second.",
    correct_principle: "SS is the relay man on balls hit to the left side. Line up between OF and home plate.",
    option_framework: {
      correct: "Sprint to relay position between LF and home, get in line",
      tempting_wrong: "Run to cover second base (common mistake — that's 2B's job here)",
      obviously_wrong: "Stay near shortstop position and wait",
      creative_wrong: "Run to back up third base (that's LF's job on infield plays)"
    },
    coaching_explanation: "On extra-base hits to the left side, the shortstop is ALWAYS the lead relay man. You line up between the outfielder and home plate so your catcher can direct you. The second baseman trails you as the backup relay. If you run to cover second instead, there's nobody to relay the throw and the runner scores easily."
  }
}
```

This completely changes the AI's job: instead of inventing a scenario from scratch, it's **filling in the details** of a pre-designed teaching moment. The blueprint ensures the fundamentals are correct; the AI adds the color and variety.

#### 1B: Implement a 3-Tier Prompt (Replace the Monolith)

```
TIER 1 — THE COACHING MANDATE (always included, position at top)
- What position is this
- What concept to teach
- The correct principle (1-2 sentences from SCENARIO_BIBLE)
- The decision moment template
- The option framework (correct, tempting-wrong, obvious-wrong)

TIER 2 — THE GAME CONTEXT (included, medium priority)
- 1-2 full handcrafted example scenarios (NOT condensed — full text)
- Coaching voice guidance
- Age-appropriate language level

TIER 3 — REFERENCE DATA (included at bottom, clearly marked as reference-only)
- Relevant knowledge map excerpt (1 map, not all 19)
- Brain data IF and ONLY IF the concept is analytics-driven
- Player personalization (accuracy, mastered concepts)
```

**Key change**: Tier 1 is SHORT and AUTHORITATIVE. It tells the AI exactly what to teach and how. The AI's job is to make it engaging, not to figure out what's correct.

#### 1C: Full-Fidelity Few-Shot Examples

Replace the condensed one-liners with **2 complete handcrafted scenarios** — full description, full options, full explanations. The AI needs to see what "coach quality" actually looks like, not a skeleton.

```javascript
function getFullFewShot(position, concept) {
  // Find 2 handcrafted scenarios that match position + concept
  // Return them COMPLETE — description, options, explanations, rates
  // This is worth the token cost — it's the single biggest quality lever
  const matches = SCENARIOS[position]
    .filter(s => s.concept?.toLowerCase().includes(concept?.toLowerCase()) ||
                 s.conceptTag === concept)
    .slice(0, 2);

  return matches.map(s => JSON.stringify({
    title: s.title,
    description: s.description,
    options: s.options,
    best: s.best,
    explanations: s.explanations,
    rates: s.rates,
    concept: s.concept,
    diff: s.diff,
    situation: s.situation
  }, null, 2)).join("\n\n");
}
```

### Pillar 2: Concept Priority & Curriculum System

**Problem solved**: Root Causes 2, 7

#### 2A: Create Weighted Concept Pools Per Position

Instead of random selection, define concept pools with weights:

```javascript
const CONCEPT_WEIGHTS = {
  shortstop: {
    // FUNDAMENTALS (70% of scenarios)
    "cutoff_alignment": 15,
    "relay_positioning": 15,
    "dp_feed": 12,
    "fly_ball_priority": 10,
    "steal_coverage": 10,
    "fielding_depth": 8,
    // INTERMEDIATE (25% of scenarios)
    "deep_hole_play": 6,
    "rundown_mechanics": 5,
    "first_third_defense": 5,
    "communication": 4,
    "bunt_coverage": 3,
    "positioning_adjustment": 2,
    // ADVANCED (5% of scenarios — only for high-mastery players)
    "pickoff_daylight": 2,
    "dp_positioning_shift": 2,
    "pitch_clock_steal": 1,
  },
  // ... same for every position
}
```

The selection function uses weighted random:
```javascript
function selectTeachingConcept(position, masteredConcepts, ageGroup) {
  const weights = CONCEPT_WEIGHTS[position];
  // Filter out mastered concepts (reduce weight by 80%, don't eliminate)
  // Filter out age-forbidden concepts entirely
  // Weight fundamentals higher for new players
  // Weighted random selection from remaining pool
}
```

#### 2B: "Fundamentals First" Curriculum Ladder

For each position, define a teaching progression:

```javascript
const CURRICULUM_LADDER = {
  shortstop: [
    // Level 1: Core fundamentals (must learn first)
    ["fielding_basics", "throwing_accuracy", "positioning"],
    // Level 2: Game awareness
    ["cutoff_alignment", "relay_positioning", "fly_ball_priority"],
    // Level 3: Complex plays
    ["dp_feed", "steal_coverage", "bunt_coverage"],
    // Level 4: Advanced
    ["first_third_defense", "rundown_mechanics", "deep_hole_play"],
    // Level 5: Elite
    ["pickoff_daylight", "dp_positioning_shift"]
  ]
}
```

The AI can only generate scenarios for concepts at or below the player's current ladder level. This prevents the "8-year-old gets a TTO scenario" problem.

### Pillar 3: Fix the Option Generation Problem

**Problem solved**: Root Cause 4

#### 3A: Decision Tree Templates

For every major concept, define the actual decision tree that a real player faces:

```javascript
const DECISION_TREES = {
  "catcher:signs_stolen": {
    moment: "You suspect the runner on 2nd is relaying your signs to the batter",
    real_options: [
      { action: "Switch to indicator system immediately", quality: "best", why: "Standard response — uses a predetermined indicator (e.g., 'second sign is live') so the runner can't decode" },
      { action: "Call a mound visit to change the sign sequence", quality: "good", why: "Works but costs a mound visit — save for when indicator system isn't working" },
      { action: "Keep throwing the same signs and vary location", quality: "poor", why: "Doesn't solve the problem — runner will keep relaying and batter adjusts" },
      { action: "Pitch out to catch the runner stealing", quality: "poor", why: "Treats the symptom, not the cause — sign-stealing is about pitch selection, not base-stealing" }
    ]
  },
  "shortstop:ball_hit_to_lf_gap": {
    moment: "Ball is driven into the left-center field gap, runner on first is going",
    real_options: [
      { action: "Sprint to relay position between LF and home plate", quality: "best", why: "SS is the lead relay man on all balls to the left side — line up with home plate" },
      { action: "Run to cover second base", quality: "poor", why: "2B covers second — you need to be the relay. Nobody else can do your job here" },
      { action: "Stay near your position and back up the play", quality: "poor", why: "There's no play to back up from SS position — you ARE the play" },
      { action: "Run to cover third base", quality: "poor", why: "3B covers third. Your job is the relay — without you, the throw from LF has no middle man" }
    ]
  }
}
```

**Critical**: These trees inject into the prompt as the **option framework**. The AI uses these as the strategic skeleton and adds game context, but it cannot invent options that contradict the tree.

#### 3B: Option Distinctness Validator

Add a post-generation check that verifies the 4 options represent genuinely different strategic decisions:

```javascript
function validateOptionDistinctness(options, position) {
  // Check 1: No two options should involve the same base/target
  // Check 2: No two options should be the same action verb
  // Check 3: At least one option should be a "wait/hold/don't act" type
  // Check 4: Options should span different strategic philosophies
  //          (aggressive vs. conservative vs. standard vs. wrong)
}
```

### Pillar 4: Upgrade the AI Model Strategy

**Problem solved**: Root Cause 5

#### 4A: Switch to a Reasoning Model

Replace `grok-4-1-fast-non-reasoning` with a model that can actually reason through baseball logic. Options in order of preference:

1. **`grok-4-1`** (reasoning variant) — Same API, likely minimal code change. The reasoning capability will dramatically improve strategic correctness.
2. **Claude Sonnet** (via Anthropic API) — Excellent at following complex instructions and maintaining consistency. Would need a new API integration.
3. **GPT-4o** — Strong at structured output and sports knowledge. Would need OpenAI API integration.

**The non-reasoning model is the single most impactful technical limitation.** Switching to a reasoning model (even a slightly slower one) will improve quality more than any prompt engineering.

#### 4B: Two-Pass Generation (If Model Switch Isn't Possible)

If you must keep the current model, use a two-pass approach:

```
Pass 1 (fast model): Generate the scenario structure
Pass 2 (same model, new prompt): "Review this scenario for baseball accuracy.
  Is the correct answer actually correct? Do the options make sense?
  Fix any errors and return the corrected JSON."
```

This forces the model to critique its own output, catching the most egregious errors.

### Pillar 5: Strategic Grading (Not Just Structural)

**Problem solved**: Root Cause 6

#### 5A: Baseball Knowledge Validator

Add a grading layer that checks strategic correctness, not just JSON structure:

```javascript
function gradeBaseballAccuracy(scenario, position) {
  const deductions = [];

  // 1. Check if correct answer matches the SCENARIO_BIBLE principle
  const principle = getBiblePrinciple(position, scenario.conceptTag);
  if (principle && !answerAligns(scenario.options[scenario.best], principle)) {
    deductions.push("Best answer contradicts position principle");
  }

  // 2. Check for cross-position violations (enhanced)
  const posActions = getPositionActions(position);
  scenario.options.forEach((opt, i) => {
    if (!isValidActionForPosition(opt, position, posActions)) {
      deductions.push(`Option ${i} is not a ${position} action`);
    }
  });

  // 3. Check situation-answer coherence
  if (scenario.situation.outs === 2 &&
      scenario.options[scenario.best].includes("double play")) {
    deductions.push("Can't turn a double play with 2 outs");
  }

  // 4. Check explanation-answer alignment
  if (explanationContradictsAnswer(scenario.explanations[scenario.best],
                                    scenario.options[scenario.best])) {
    deductions.push("Best explanation argues against best answer");
  }

  return { pass: deductions.length === 0, deductions };
}
```

#### 5B: Explanation Quality Scorer

```javascript
function scoreExplanationQuality(explanation, scenario, position) {
  let score = 0;

  // References the specific game situation (not generic)
  if (mentionsScore(explanation) || mentionsInning(explanation) ||
      mentionsRunners(explanation)) score += 2;

  // Explains WHY (cause-and-effect reasoning)
  if (containsCausalLanguage(explanation)) score += 2;

  // References a real consequence (not just "it's the right play")
  if (describesConsequence(explanation)) score += 2;

  // Uses coaching voice (not textbook voice)
  if (usesSecondPerson(explanation) && !usesJargon(explanation)) score += 1;

  // Minimum threshold: 4/7
  return score;
}
```

---

## Implementation Priority Order

| Phase | Changes | Impact | Effort |
|-------|---------|--------|--------|
| **Phase 1** (Do First) | Pillar 1B: 3-tier prompt, Pillar 1C: full few-shots, Pillar 4A: reasoning model | **HUGE** | Medium |
| **Phase 2** (Next) | Pillar 3A: decision tree templates, Pillar 2A: concept weights | **HIGH** | Medium |
| **Phase 3** (Then) | Pillar 1A: scenario blueprints, Pillar 5A: baseball grading | **HIGH** | High |
| **Phase 4** (Polish) | Pillar 2B: curriculum ladder, Pillar 5B: explanation scoring | **MEDIUM** | Medium |

---

## Phase 1 Detailed Implementation

### Step 1: Switch to Reasoning Model

In `generateAIScenario()` and `generateWithAgentPipeline()`, change:

```javascript
// FROM:
model: "grok-4-1-fast-non-reasoning"

// TO:
model: "grok-4-1"  // or whichever reasoning variant is available
```

Also increase `max_tokens` from 1800 to 2500 — the current limit causes truncation on complex scenarios with full `explDepth`.

### Step 2: Restructure the System Prompt

Replace the current 50+ line system prompt with a focused coaching mandate:

```javascript
const COACH_SYSTEM_PROMPT = `You are Coach Mike, the most experienced baseball coach in America — 30 years coaching from Little League to the pros. You teach by putting players in realistic game moments and asking "What do you do?"

YOUR COACHING PHILOSOPHY:
- Fundamentals win games. Teach the basics until they're automatic.
- Every scenario must teach ONE clear lesson that a coach would emphasize at practice.
- Options must represent real decisions a player at this position actually faces.
- The correct answer is what every experienced coach would teach — not an edge case, not a trick play.
- Explanations sound like a coach talking to a player on the field, not a statistics textbook.

RULES:
- Write like you're explaining to a young player standing on the field with you.
- All 4 options happen at the SAME moment in the game.
- The correct answer is the FUNDAMENTAL play — the thing you drill 100 times.
- ONE wrong option should be the common mistake kids actually make.
- ONE wrong option should be something that sounds smart but isn't.
- ONE wrong option should be clearly wrong (to help younger players).
- Response must be ONLY valid JSON. No markdown, no text outside the JSON.`
```

### Step 3: Restructure the User Prompt

Replace the current monolithic prompt with the 3-tier structure:

```javascript
function buildRestructuredPrompt(position, blueprint, examples, brainData, playerContext) {
  return `
=== TIER 1: YOUR COACHING ASSIGNMENT (MOST IMPORTANT) ===
Position: ${position}
Teach this concept: ${blueprint.concept_name}
The correct principle: ${blueprint.correct_principle}
Decision moment: "${blueprint.decision_moment}"
Option framework:
- CORRECT: ${blueprint.option_framework.correct}
- TEMPTING WRONG (common kid mistake): ${blueprint.option_framework.tempting_wrong}
- SOUNDS SMART BUT WRONG: ${blueprint.option_framework.obviously_wrong}
- CLEARLY WRONG: ${blueprint.option_framework.creative_wrong}

Use this framework as your guide. Create SPECIFIC options with game detail — don't copy these word-for-word.

=== TIER 2: QUALITY EXAMPLES (MATCH THIS LEVEL) ===
Here are two scenarios that represent the quality bar:

${examples}

Match the DESCRIPTION STYLE (vivid, in-the-game feel), OPTION STYLE (specific actions, not generic), and EXPLANATION STYLE (coaching voice, references the specific situation).

=== TIER 3: REFERENCE (consult if needed, do NOT dump into your scenario) ===
Player context: ${playerContext}
${brainData ? `Analytics reference: ${brainData}` : ''}

=== OUTPUT FORMAT ===
{json format specification here}
`
}
```

### Step 4: Build Initial Scenario Blueprints

Start with the 10 highest-priority concepts per position (70 total blueprints). These are the fundamentals that should make up the vast majority of AI scenarios:

**Pitcher** (10): First-pitch strikes, working ahead in the count, pitch selection by count, pickoff timing, fielding position (cover 1B), backing up home, stretch mechanics, pitch sequencing, pitching to contact vs. strikeouts, mound presence after errors.

**Catcher** (10): Pitch calling by count, blocking balls in dirt, framing, throwing mechanics on steals, pop-up priority, sign changing with R2, mound visit purpose, directing cutoff, WP/PB response, game calling (3-act at-bat).

**Shortstop** (10): Relay positioning (left side), cutoff to 3B, DP feed, steal coverage, fly ball priority vs. OF, deep hole play, bunt coverage, communication, positioning depth, rundown rotation.

**And so on for every position.**

Each blueprint gets the structure shown in Pillar 1A above. This is the most labor-intensive step but it's a one-time investment that permanently fixes quality.

---

## Expected Results

| Metric | Current (D-) | After Phase 1 | After Phase 2 | After All Phases |
|--------|-------------|---------------|---------------|-----------------|
| Correct answer is actually correct | ~60% | ~85% | ~92% | ~97% |
| Options feel like real baseball decisions | ~30% | ~70% | ~88% | ~95% |
| Explanations teach like a real coach | ~20% | ~65% | ~80% | ~92% |
| Scenarios teach fundamentals (not trivia) | ~40% | ~80% | ~90% | ~95% |
| Description puts you "in the game" | ~25% | ~60% | ~75% | ~90% |
| No strategic errors a coach would catch | ~50% | ~80% | ~90% | ~97% |

---

## Quick Wins (Can Do Today)

1. **Switch model from non-reasoning to reasoning** — Single line change, biggest quality lift
2. **Increase max_tokens from 1800 to 2500** — Prevents truncation of explanations
3. **Replace condensed few-shots with 2 full handcrafted scenarios** — Major quality signal improvement
4. **Cut the BRAIN data injection for non-analytical concepts** — Stop the stat brain from overwhelming coaching fundamentals
5. **Add to system prompt: "The correct answer is always the FUNDAMENTAL play — the thing you drill 100 times"** — Reorients the AI away from edge cases

---

## Summary

The AI isn't dumb — it's drowning. You've built an incredibly rich knowledge system (19 maps, RE24 tables, position principles, the whole SCENARIO_BIBLE). But you're pouring ALL of it into every prompt and asking a non-reasoning model to figure out what matters. The model does what LLMs do when overwhelmed: it latches onto the most distinctive data (the statistics) and generates scenarios that showcase that data, rather than teaching the fundamentals that the statistics are meant to support.

The fix is architectural, not incremental:
1. **Give the AI less data but more direction** (blueprints > data dumps)
2. **Use a model that can reason** (reasoning > pattern-matching)
3. **Show it what great looks like** (full examples > condensed skeletons)
4. **Control the curriculum** (weighted fundamentals > random concepts)
5. **Grade the baseball, not the JSON** (strategic validation > structural validation)

The handcrafted scenarios prove you know exactly what great looks like. The AI just needs to be pointed at that target with clear enough instructions that it can't miss.
