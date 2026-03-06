# AI Scenario Quality Improvement Plan

## Context

The app just upgraded from `grok-3-mini` to `grok-4` (xAI flagship). Scenarios are improving but still not at the quality bar of the 584 handcrafted ones. After a thorough audit of the entire AI pipeline (~2,500 lines of generation, validation, feedback, and grading code), I identified what's working and what still needs fixing.

**What's working well:** The 20+ post-generation validators (ROLE_VIOLATIONS, QUALITY_FIREWALL, CONSISTENCY_RULES, explanation scoring, dedup), the self-learning feedback loop (player flagging → server aggregation → prompt injection), the agent pipeline (Plan→Generate→Grade), A/B testing, few-shot examples, and knowledge maps.

**What's still broken (3 remaining root causes):**
1. **Prompt overload** — `formatBrainForAI()` dumps ALL RE24 data, ALL count data, ALL steal/bunt/TTO stats, ALL scoring probabilities into every prompt, regardless of concept. A cutoff-relay scenario gets pitch type data. The AI latches onto stats instead of coaching fundamentals.
2. **No concept weighting** — `getConceptWeight()` uses a flat base weight of 10 for all concepts. A shortstop is as likely to get a pitch-clock scenario as a cutoff-relay scenario. No "fundamentals first" gravity.
3. **Options lack strategic structure** — The AI invents 4 options from scratch. Often produces "4 slightly different throws" or strategically incoherent choices. No archetype guidance for what KINDS of options to generate.

**What NOT to do (over-engineered ideas from the strategic plan):**
- Don't build 150+ full Scenario Blueprints per position+concept — too much authoring, low ROI with grok-4
- Don't add a second AI call as a "Baseball Knowledge Validator" — doubles latency/cost
- Don't add another curriculum system on top of the existing LEARNING_PATHS + CONCEPT_GATES + prerequisites
- Don't restructure A/B testing — it works fine

---

## Phase 1: Concept Weighting + Option Archetypes (Biggest Impact)

### 1A. Add `CONCEPT_FUNDAMENTAL_WEIGHTS` constant + modify `getConceptWeight()`

**File:** `index.jsx` — add constant before line 8134, modify `getConceptWeight()` at line 8135

Add a lookup table mapping each position to its core concepts with weight multipliers (1x default, 1.5x secondary, 2-2.5x intermediate, 3x bread-and-butter). Example:

```
shortstop: cutoff-roles 3x, relay-double-cut 3x, double-play-turn 3x, fly-ball-priority 2.5x, bunt-defense 2x
batter: two-strike-approach 3x, count-leverage 3x, situational-hitting 2.5x
baserunner: tag-up 3x, force-vs-tag 3x, secondary-lead 2.5x, steal-breakeven 2x
```

All 12 positions + 3 special modes get entries. In `getConceptWeight()`, change `let weight = 10` to `let weight = 10 * (CONCEPT_FUNDAMENTAL_WEIGHTS[position]?.[tag] || 1)`.

**Impact:** Shortstop players get 3x more cutoff/relay scenarios vs. niche topics. Immediately fixes the "8-year-old gets pitch-clock scenario" problem. Works with all existing systems (mastery, age gates, prerequisites) unchanged.

### 1B. Add `OPTION_ARCHETYPES` constant + inject into `buildAgentPrompt()`

**File:** `index.jsx` — add constant near line 8130, inject into `buildAgentPrompt()` between tier1+qualityRules and tier2

For the ~25 highest-traffic position+concept combinations, define 4 option archetypes:
- **correct_fundamental** — the right play and why
- **common_kid_mistake** — what beginners actually do wrong (where learning happens)
- **sounds_smart_wrong** — a plausible-sounding wrong answer
- **clearly_wrong** — an option no experienced player would choose

Example for `"shortstop:cutoff-roles"`:
```
moment: "Extra-base hit to left side, runner advancing"
correct: "Sprint to relay position between OF and home"
kid_mistake: "Run to cover 2B instead of being the relay"
sounds_smart: "Back up another fielder"
clearly_wrong: "Stay near position and wait"
```

Inject as `OPTION BLUEPRINT` section in the prompt. The AI fills in specific language and game context — it does NOT copy these hints word-for-word.

Concepts without archetypes get no blueprint (the AI generates freely, which is fine for grok-4 on less common concepts).

**Impact:** Fixes the "4 slightly different throws" problem. Ensures every scenario has a genuine teaching moment (the kid mistake) and strategically distinct options.

### 1C. Make `formatBrainForAI()` concept-aware

**File:** `index.jsx` — modify `formatBrainForAI()` at line 7047, modify call site in `planScenario()` at line 8253

Add `targetConcept` as a third parameter. Create a `CONCEPT_DATA_RELEVANCE` mapping:
- RE24 data: only for `bunt-re24, steal-breakeven, ibb-strategy, scoring-probability, win-probability, situational-hitting`
- Count data: only for `count-leverage, two-strike-approach, first-pitch-strike, pitch-sequencing`
- Steal data: only for `steal-breakeven, secondary-lead, lead-distance`
- Bunt data: only for `bunt-re24, squeeze-play`
- Pitch type data: only for `pitch-sequencing, count-leverage`

Always include the compact TACTICAL RULES summary and CALCULATED ANALYSIS (those are useful and short). Skip the raw data tables for concepts that don't need them.

In `planScenario()` line 8253, pass `selectedConcept`:
```javascript
const brainData = KNOWLEDGE_BASE.getBrainDataForSituation(position, {}, selectedConcept)
```

**Impact:** A cutoff-relay scenario no longer gets RE24 tables, bunt deltas, or pitch type data. The prompt shrinks dramatically. The AI focuses on coaching instead of spreadsheets.

---

## Phase 2: Strategic Validation Checks

### 2A. Add 3 new checks to `QUALITY_FIREWALL.tier1`

**File:** `index.jsx` — add after line ~7282 in `QUALITY_FIREWALL.tier1`

**Check 1: `situationActionContradiction`** — Catches strategic impossibilities:
- DP recommended with 2 outs → reject
- Sacrifice bunt with 2 outs → reject
- Tag-up framing with 2 outs → reject (should be "run on contact")
- Infield fly referenced with 2 outs → reject
- Steal with 2 outs + 3+ run lead → reject

**Check 2: `principleContradiction`** — Catches position principle violations in the BEST answer:
- Pitcher as cutoff/relay → reject
- CF deferring to corner OF → reject
- Baserunner "yelling at" or "signaling" teammates → reject

**Check 3: `optionActionDiversity`** — Catches "4 of the same action":
- If all 4 options start with the same verb (throw/run/call/etc.) → reject with "all_options_same_action_verb"

### 2B. Pass `position` to `QUALITY_FIREWALL.validate()`

**File:** `index.jsx` — modify `validate()` at line ~7397, update call sites at lines ~9296 and ~9856

Currently `validate(scenario)` doesn't receive position. Change to `validate(scenario, position)` so the `principleContradiction` check can use it.

---

## Phase 3: Prompt Reorganization

### 3A. Concept-specific knowledge map injection

**File:** `index.jsx` — modify `planScenario()` at line 8250

Currently: `KNOWLEDGE_BASE.getKnowledgeMapsForPosition(position)` injects ALL maps for the position.

Change to: Only inject the ONE map matching the target concept via a `CONCEPT_MAP_RELEVANCE` lookup:
```
"cutoff-roles" → CUTOFF_RELAY_MAP
"bunt-defense" → BUNT_DEFENSE_MAP
"first-third" → FIRST_THIRD_MAP
"tag-up" → TAGUP_SACRIFICE_FLY_MAP
(concepts with no map → no map injection)
```

This means a batter scenario about two-strike-approach gets ZERO knowledge maps (because it doesn't need one). Dramatically reduces prompt size.

### 3B. Reorder prompt sections in `buildAgentPrompt()`

**File:** `index.jsx` — modify return at line 8438

Current order: tier1 → qualityRules → topics → brainData → examples → fewShot → avoid → context → voice → patch → template

New order: tier1 → qualityRules → **archetypes** → examples → fewShot → topics → **brainData (slimmed)** → avoid → context → voice → patch → template

Key change: Archetypes and examples BEFORE reference data. Brain data at the bottom, clearly secondary. This matches "Coaching Mandate > Game Context > Reference Data" without a massive refactor.

---

## Phase 4: Grading Polish

### 4A. Best explanation situation-reference check

**File:** `index.jsx` — enhance `gradeScenario()` at line ~7519

For the BEST answer's explanation, check it references at least 2 of: outs, inning, score, runners, count. Currently only checks for ANY situation reference. Strengthen to require 2+, with -8 deduction if not met.

### 4B. Option verb diversity check in grading

**File:** `index.jsx` — add to `gradeScenario()` section 4 at line ~7557

If all 4 options start with the same action verb, deduct -15. This catches "four throws to different bases" in grading (complementing the firewall check in 2A which hard-rejects).

---

## Priority & Effort Summary

| Phase | Changes | Root Causes | Impact | Effort |
|-------|---------|-------------|--------|--------|
| **Phase 1** | 1A: Concept weights, 1B: Option archetypes, 1C: Slim brain data | 2, 4, 7, 1 | **HUGE** | Medium |
| **Phase 2** | 2A-B: Strategic firewall checks | 6 | **HIGH** | Small |
| **Phase 3** | 3A: Concept-to-map, 3B: Prompt reorder | 1 | **MEDIUM** | Small |
| **Phase 4** | 4A-B: Explanation quality, option diversity | 1, 6 | **MEDIUM** | Small |

**Ship FIRST:** Phase 1A (concept weights) is one constant + one line change. Immediate impact. Then 1B (archetypes) for option quality. Then 1C (brain data slimming) to reduce prompt noise.

---

## Files Modified

| File | Changes |
|------|---------|
| `index.jsx` ~8130 | Add `CONCEPT_FUNDAMENTAL_WEIGHTS` constant |
| `index.jsx` ~8130 | Add `OPTION_ARCHETYPES` constant (~25 entries) |
| `index.jsx` 8135 | Modify `getConceptWeight()` to use fundamental weights |
| `index.jsx` 7047 | Modify `formatBrainForAI()` to accept `targetConcept`, add `CONCEPT_DATA_RELEVANCE` |
| `index.jsx` 8253 | Pass `selectedConcept` to brain data call |
| `index.jsx` ~7283 | Add 3 new `QUALITY_FIREWALL.tier1` checks |
| `index.jsx` ~7397 | Pass `position` to `QUALITY_FIREWALL.validate()` |
| `index.jsx` ~9296, ~9856 | Update validate() call sites with position |
| `index.jsx` 8250 | Concept-specific map injection + `CONCEPT_MAP_RELEVANCE` |
| `index.jsx` 8438 | Reorder prompt sections |
| `index.jsx` ~7519 | Enhance best explanation grading |
| `index.jsx` ~7557 | Add option verb diversity grading |

---

## Verification

After each phase, test by:
1. Open app, select a position (e.g., shortstop), click "AI Coach's Challenge"
2. Watch console for `[BSM Agent] Plan:` log — verify concept selection favors fundamentals
3. Verify generated scenario has 4 strategically distinct options (not 4 throws)
4. Verify explanations reference the specific game situation (outs, score, runners)
5. Verify no irrelevant stats in the prompt (check `[BSM] AI raw` console log for prompt size)
6. Play 5-10 AI scenarios across different positions — quality should feel coaching-grade
7. Test a position with an archetype (e.g., shortstop:cutoff-roles) and one without — both should work
