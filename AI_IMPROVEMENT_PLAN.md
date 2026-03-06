# Baseball Strategy Master — AI Scenario Quality Improvement Plan (REVISED)

**Date:** March 6, 2026
**Current Grade:** C+ (up from D-)
**Target Grade:** A-
**Sources:** Cowork audit (D1 database analysis, flagged scenario review, code review) + Claude Code audit (prompt architecture analysis, code-level review)

---

## Executive Summary

Two independent audits identified **overlapping but complementary problems**. Both agree the grok-4 upgrade was a big step forward (pool quality averaging 8.88/10) and the infrastructure is solid. But the AI still produces scenarios that feel like they were written by someone who *read about* baseball rather than someone who *coaches* it.

**Combined root causes (7 total):**

| # | Root Cause | Found By | Severity |
|---|-----------|----------|----------|
| 1 | Boilerplate explanation padding produces "confusing text" (69% of flags) | Cowork | HIGH |
| 2 | AI scenarios too easy — 69.6% correct vs 55.3% handcrafted | Cowork | HIGH |
| 3 | Prompt overload — ALL brain data dumped regardless of concept | Claude Code | HIGH |
| 4 | No concept weighting — flat base weight of 10 for all concepts | Claude Code | HIGH |
| 5 | Options lack strategic structure — "4 slightly different throws" | Claude Code | HIGH |
| 6 | Explanations sound like Wikipedia, not a coach | Cowork | MED-HIGH |
| 7 | Feedback loop disconnected — empty concept tags, no prompt patches, no weekly reports | Cowork | MED |

Both audits agree on **what NOT to do**: don't add a second AI validation call (doubles latency), don't build 150+ scenario blueprints (over-engineered), don't restructure A/B testing (it works fine), don't add another curriculum system on top of existing LEARNING_PATHS.

---

## Current State (D1 Database Evidence)

### Pool: 22 scenarios, avg quality 8.88/10
- Position distribution: pitcher 11, batter 6, catcher 2, centerField 2, leftField 1
- **10 of 15 positions have zero pool scenarios**
- 0 flags, 0 retirements in pool (only 18 have been served)

### Feedback: 16 flags from playtesting
- confusing_text: 11 (69%), wrong_answer: 3 (19%), unrealistic: 2 (12%)

### Learning Events: 70 plays tracked
- AI correct rate: **69.6%** vs handcrafted: **55.3%** — AI is 14pts too easy

### Feedback Loop: Disconnected
- 0 prompt patches active, 0 weekly reports generated, 1 total audit logged
- Every pool scenario has `concept_tag: ""` — adaptive learning loop broken

---

## The Plan (Merged & Prioritized)

### Phase 1: Concept Weighting + Brain Data Slimming (Week 1)
*From Claude Code audit — addresses root causes 3 & 4*

These are the highest-leverage, lowest-effort changes. They fix what the AI *sees* before it starts writing.

#### 1A. Add `CONCEPT_FUNDAMENTAL_WEIGHTS` + modify `getConceptWeight()`

Add a lookup table mapping each position to its core concepts with weight multipliers. Currently every concept has a flat weight of 10. With this change:

```
shortstop: cutoff-roles 3x, relay-double-cut 3x, double-play-turn 3x, fly-ball-priority 2.5x, bunt-defense 2x
batter: two-strike-approach 3x, count-leverage 3x, situational-hitting 2.5x
baserunner: tag-up 3x, force-vs-tag 3x, secondary-lead 2.5x, steal-breakeven 2x
pitcher: first-pitch-strike 3x, count-leverage 2.5x, pitch-sequencing 2x
catcher: pitch-calling 3x, steal-window 2.5x, first-third 2x
```

All 15 categories get entries. In `getConceptWeight()`, change `let weight = 10` to `let weight = 10 * (CONCEPT_FUNDAMENTAL_WEIGHTS[position]?.[tag] || 1)`.

**Impact:** Shortstop players get 3x more cutoff/relay scenarios vs. niche topics. Immediately fixes "8-year-old gets pitch-clock scenario" problem. One constant + one line change.

#### 1B. Make `formatBrainForAI()` concept-aware

Currently dumps ALL RE24, ALL count data, ALL steal/bunt/TTO stats into every prompt. A cutoff-relay scenario gets pitch type data it doesn't need.

Add `targetConcept` as a parameter. Create `CONCEPT_DATA_RELEVANCE` mapping:
- RE24 data → only for: bunt-re24, steal-breakeven, ibb-strategy, scoring-probability, situational-hitting
- Count data → only for: count-leverage, two-strike-approach, first-pitch-strike, pitch-sequencing
- Steal data → only for: steal-breakeven, secondary-lead, lead-distance
- Bunt data → only for: bunt-re24, squeeze-play
- Pitch type data → only for: pitch-sequencing, count-leverage

Always keep the compact TACTICAL RULES summary (useful and short). Skip the raw data tables for irrelevant concepts.

**Impact:** Prompt shrinks dramatically. The AI focuses on coaching instead of spreadsheets.

#### 1C. Concept-specific knowledge map injection

Currently `getKnowledgeMapsForPosition(position)` injects ALL maps for the position. Change to only inject the ONE map matching the target concept:
```
"cutoff-roles" → CUTOFF_RELAY_MAP
"bunt-defense" → BUNT_DEFENSE_MAP
"first-third" → FIRST_THIRD_MAP
"tag-up" → TAGUP_SACRIFICE_FLY_MAP
(concepts with no map → no map injection)
```

A batter scenario about two-strike-approach gets zero knowledge maps because it doesn't need one.

---

### Phase 2: Option Quality + Difficulty (Week 1)
*Merged from both audits — addresses root causes 2 & 5*

Both audits independently identified that wrong options are too obviously wrong and lack strategic structure. Claude Code's "option archetypes" approach and Cowork's "yellow option" requirement solve this from different angles — use both.

#### 2A. Add `OPTION_ARCHETYPES` for top 25 position+concept combos

For the highest-traffic combinations, define 4 option archetypes:
- **correct_fundamental** — the right play and why
- **common_kid_mistake** — what beginners actually do wrong (where learning happens)
- **sounds_smart_wrong** — a plausible-sounding wrong answer (the "yellow" option)
- **clearly_wrong** — an option no experienced player would choose

Example for `"shortstop:cutoff-roles"`:
```
moment: "Extra-base hit to left side, runner advancing"
correct: "Sprint to relay position between OF and home"
kid_mistake: "Run to cover 2B instead of being the relay"
sounds_smart: "Back up another fielder"
clearly_wrong: "Stay near position and wait"
```

Inject as `OPTION BLUEPRINT` section in the agent prompt. The AI fills in specific language and game context — it does NOT copy these hints word-for-word. Concepts without archetypes get no blueprint (grok-4 generates freely, which is fine for less common concepts).

#### 2B. Add "yellow option" requirement to agent prompt

Add to OPTION RULES:
```
CRITICAL OPTION RULE: At least ONE wrong option must be "acceptable but not optimal" (rate 45-65).
This is the YELLOW option — something a decent player might do that isn't terrible but isn't the best play.
DO NOT make all 3 wrong options obviously terrible. Real baseball decisions involve choosing between
two reasonable options, not picking the one sane choice among three absurd ones.
```

#### 2C. Tighten rate spreads in auto-fix

Ensure at least one option in the 45-60 "yellow zone":
```javascript
const yellowExists = rates.some((r, i) => i !== bestIdx && r >= 45 && r <= 65)
if (!yellowExists) {
  const sorted = rates.map((r, i) => ({r, i})).filter(x => x.i !== bestIdx).sort((a,b) => b.r - a.r)
  if (sorted.length > 0) rates[sorted[0].i] = 50 + Math.floor(Math.random() * 10)
}
```

#### 2D. Add difficulty + option diversity validation to grading

In `gradeAgentScenario`:
```javascript
// All wrong options too obvious
const wrongRates = scenario.rates?.filter((_, i) => i !== scenario.best) || []
if (wrongRates.every(r => r < 30)) { score -= 10; deductions.push('all_wrong_too_obvious') }
if (!wrongRates.some(r => r >= 45 && r <= 65)) { score -= 5; deductions.push('no_yellow_option') }
```

In `gradeScenario` section 4:
```javascript
// If all 4 options start with the same verb → -15
const verbs = scenario.options?.map(o => o.split(' ')[0].toLowerCase())
if (verbs && new Set(verbs).size === 1) { score -= 15; deductions.push('all_options_same_verb') }
```

---

### Phase 3: Explanation Quality + Coaching Voice (Week 1-2)
*From Cowork audit — addresses root causes 1 & 6*

#### 3A. Replace boilerplate padding with position-specific coaching closers

The auto-fix currently appends: *"In this situation with 2 outs... this decision has real consequences for the game."* This is the #1 cause of "confusing text" flags.

Replace with a `COACHING_CLOSERS` constant — 5-8 position-specific phrases per position that sound like a real coach:
```javascript
const COACHING_CLOSERS = {
  pitcher: [
    "Remember, every pitch is a chess move — think about what the runner expects.",
    "Your job on the mound is to control tempo and keep runners guessing.",
    "Trust your stuff and let your defense work behind you."
  ],
  catcher: [
    "You're the quarterback of the defense — every decision starts with you.",
    "Think one play ahead: where's the throw going if the runner breaks?",
    "Stay low, stay ready, and trust your arm."
  ],
  batter: [
    "The best hitters think before the pitch, not during it.",
    "Know what you're looking for before you step in the box.",
    "A good at-bat isn't always a hit — it's making the pitcher work."
  ],
  baserunner: [
    "Smart baserunning wins more games than fast baserunning.",
    "Read the situation before you commit — you can't undo a bad jump.",
    "The best baserunners make their decisions before the pitch."
  ],
  // ... all 15 positions
}
```

#### 3B. Add explanation quality rules + banned phrases to agent prompt

Add to AUDIT CHECKLIST in `buildAgentPrompt`:
```
- Explanations for WRONG answers must say what goes wrong specifically (e.g., "the runner advances to third" not "this could lead to problems")
- Explanations for the BEST answer must name the positive outcome (e.g., "you cut down the lead runner" not "this maintains defensive pressure")
- NEVER use these filler phrases: "this decision has real consequences", "maintaining defensive pressure", "this could lead to", "this approach fails by", "this action allows you to"
- Write like you're a coach talking to a player after the play: "Here's why that works..." or "The problem with that is..."
```

#### 3C. Add coaching voice contrast examples to prompt

In the agent prompt's examples section, add GOOD vs BAD explanation pairs:
```
EXPLANATION VOICE:
GOOD: "You throw to the cutoff man because he's lined up with home — if you try to throw all the way home from deep center, the ball bounces and the trail runner takes third. Trust the relay."
BAD: "Throwing to the cutoff man is the correct decision as it maintains proper relay alignment and prevents defensive breakdowns that could allow additional baserunner advancement."
```

#### 3D. Best explanation must reference 2+ situation elements (from Claude Code)

In `gradeScenario`, for the BEST answer's explanation, require references to at least 2 of: outs, inning, score, runners, count. Currently only checks for ANY situation reference. Strengthen to 2+, with -8 deduction if not met.

---

### Phase 4: Strategic Validation (Week 2)
*From Claude Code audit — addresses root cause 5 via prevention*

#### 4A. Add 3 new QUALITY_FIREWALL tier1 checks

**situationActionContradiction:**
- DP recommended with 2 outs → reject
- Sacrifice bunt with 2 outs → reject
- Tag-up framing with 2 outs → reject (should be "run on contact")
- Infield fly referenced with 2 outs → reject
- Steal with 2 outs + 3+ run lead → reject

**principleContradiction (needs position passed to validate()):**
- Pitcher as cutoff/relay → reject
- CF deferring to corner OF → reject
- Baserunner "yelling at" or "signaling" teammates → reject

**optionActionDiversity:**
- If all 4 options start with the same verb → reject with "all_options_same_action_verb"

#### 4B. Pass `position` to `QUALITY_FIREWALL.validate()`

Currently `validate(scenario)` doesn't receive position. Change to `validate(scenario, position)` at both call sites.

---

### Phase 5: Fix the Feedback Loop (Week 2)
*From Cowork audit — addresses root cause 7*

#### 5A. Populate concept_tag on pool submission

In the worker's `/pool/submit` handler, extract concept_tag from scenario JSON using a keyword-to-tag mapping:
```javascript
function extractConceptTag(conceptText) {
  if (!conceptText) return ''
  const TAG_MAP = {
    'steal': 'steal-window', 'pickoff': 'pickoff-mechanics',
    'first.?pitch': 'first-pitch-strike', 'count': 'count-leverage',
    'relay': 'relay-double-cut', 'cutoff': 'cutoff-alignment',
    'backup': 'backup-duties', 'bunt': 'bunt-defense',
    'double.?play': 'double-play-turn', 'force': 'force-vs-tag',
    'tag.?up': 'tag-up-rules', 'fly.?ball': 'fly-ball-priority',
    'pitch.?clock': 'pitch-clock-strategy',
  }
  for (const [pattern, tag] of Object.entries(TAG_MAP)) {
    if (new RegExp(pattern, 'i').test(conceptText)) return tag
  }
  return ''
}
```

#### 5B. Auto-generate prompt patches from feedback patterns

When a position+category combo reaches 3+ flags, auto-create a prompt patch with a 7-day expiry:
```javascript
const PATCH_TEMPLATES = {
  confusing_text: `QUALITY ALERT for ${position}: Players report confusing explanations. Write SHORT, CLEAR sentences. Start each with "You..." NO filler phrases.`,
  wrong_answer: `ACCURACY ALERT for ${position}: Players report wrong best answers. Double-check the best option against standard coaching consensus.`,
  unrealistic: `REALISM ALERT for ${position}: Players report unrealistic scenarios. Ensure the game situation could actually happen.`,
}
```

#### 5C. Fix weekly report cron

Verify `wrangler.toml` has `crons = ["0 6 * * 1"]` and the `scheduled` handler queries and writes to `weekly_ai_report`.

---

### Phase 6: Prompt Architecture Polish (Week 2-3)
*Merged from both audits*

#### 6A. Reorder prompt sections in `buildAgentPrompt()`

Current: tier1 → qualityRules → topics → brainData → examples → fewShot → avoid → context → voice → patch → template

New: tier1 → qualityRules → **archetypes** → examples → fewShot → topics → **brainData (slimmed)** → avoid → context → voice → patch → template

Key: Archetypes and examples BEFORE reference data. Brain data at the bottom, clearly secondary. Matches "Coaching > Game Context > Reference Data" hierarchy.

#### 6B. Wrong option design instruction

Add explicit guidance for what KIND of wrong options to generate:
```
WRONG OPTION DESIGN:
- One option: A common BEGINNER mistake — what someone who doesn't know the concept would try.
- One option: An EXPERIENCED player's mistake — sounds smart but is wrong in THIS situation. This is where real learning happens.
- One option: A PANIC reaction — what happens when a player doesn't think before acting.
```

#### 6C. Rotate few-shot examples per concept

Maintain 3-5 curated few-shot examples per position and rotate randomly instead of always showing the same one.

---

### Phase 7: Pool Growth (Week 3-4)
*From Cowork audit*

#### 7A. Seed pool for underserved positions
Batch-generate 5 scenarios each for the 10 missing positions, manually review, insert into D1.

#### 7B. Lower pool gate for underserved positions
When a position has < 3 pool scenarios, accept at quality_score >= 7.5 instead of 8.0.

---

## Priority Summary

| # | Change | Root Causes | Impact | Effort | When |
|---|--------|-------------|--------|--------|------|
| 1 | 1A: Concept fundamental weights | 4 | **HUGE** | LOW | Week 1 |
| 2 | 1B: Concept-aware brain data | 3 | **HUGE** | MED | Week 1 |
| 3 | 2A: Option archetypes (top 25) | 5 | **HIGH** | MED | Week 1 |
| 4 | 3A: Replace boilerplate padding | 1 | **HIGH** | LOW | Week 1 |
| 5 | 2B: Yellow option requirement | 2 | **HIGH** | LOW | Week 1 |
| 6 | 3B: Banned phrases + explanation rules | 6 | **HIGH** | LOW | Week 1 |
| 7 | 3C: Coaching voice contrast examples | 6 | **HIGH** | LOW | Week 1 |
| 8 | 1C: Concept-specific map injection | 3 | **MED** | LOW | Week 1 |
| 9 | 2C: Rate spread auto-fix | 2 | **MED** | LOW | Week 1 |
| 10 | 2D: Difficulty + verb diversity grading | 2, 5 | **MED** | LOW | Week 1-2 |
| 11 | 3D: Best explanation 2+ refs | 6 | **MED** | LOW | Week 2 |
| 12 | 4A: 3 new firewall checks | 5 | **HIGH** | MED | Week 2 |
| 13 | 4B: Position to validate() | 5 | **MED** | LOW | Week 2 |
| 14 | 5A: Populate concept_tag | 7 | **MED** | LOW | Week 2 |
| 15 | 5B: Auto prompt patches | 7 | **MED** | MED | Week 2 |
| 16 | 5C: Fix weekly report cron | 7 | **LOW** | LOW | Week 2 |
| 17 | 6A: Reorder prompt sections | 3 | **MED** | LOW | Week 2-3 |
| 18 | 6B: Wrong option design instruction | 5 | **MED** | LOW | Week 2-3 |
| 19 | 6C: Rotate few-shot examples | 6 | **MED** | MED | Week 3 |
| 20 | 7A: Seed pool for missing positions | — | **MED** | HIGH | Week 3-4 |
| 21 | 7B: Lower pool gate for small positions | — | **LOW** | LOW | Week 3 |

---

## Expected Impact

**After Week 1 (Phases 1-3):**
- "Confusing text" flags: 69% → under 20%
- AI correct rate: 69.6% → 55-60% (closer to handcrafted)
- Prompt size: ~40% smaller (irrelevant data removed)
- Concept relevance: fundamentals get 3x more weight
- Options: strategically distinct with at least one "yellow" choice

**After Week 2 (Phases 4-5):**
- Strategic impossibilities (DP with 2 outs, etc.) auto-rejected
- Feedback loop generates prompt patches automatically
- Concept tracking works end-to-end

**After Week 3-4 (Phases 6-7):**
- Pool covers all 15 positions
- Prompt architecture optimized for coaching > data hierarchy
- Self-correcting quality via pool retirement + feedback patches

---

## What's Working Well (Don't Change)

1. **grok-4 upgrade** — dramatically better than grok-3-mini
2. **Agent pipeline architecture** — plan→generate→autofix→grade→fallback is sound
3. **QUALITY_FIREWALL** — correctly catches position violations, score mismatches, brain contradictions
4. **Cross-session dedup** — title seeding from localStorage working
5. **Score-description consistency check** — auto-fixing score arrays
6. **Three-tier serving** — cache → pool → fresh generation is right
7. **A/B testing** — works fine, don't restructure
8. **Feedback storage infrastructure** — all plumbing exists, just needs activation
9. **The 316 handcrafted scenarios** — excellent quality baseline, AI should learn from them

---

## What NOT to Do

- Don't build 150+ full scenario blueprints — too much authoring, low ROI with grok-4
- Don't add a second AI call as "Baseball Knowledge Validator" — doubles latency/cost
- Don't add another curriculum system on top of LEARNING_PATHS + CONCEPT_GATES
- Don't restructure A/B testing — it works fine
- Don't replace the agent pipeline — it's the right architecture, just needs better inputs
