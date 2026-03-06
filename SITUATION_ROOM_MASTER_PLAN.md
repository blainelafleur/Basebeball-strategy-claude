# Situation Room Master Plan
## Audit, Infrastructure Integration & Enhancement Roadmap

*Version 1.0 — March 5, 2026*

---

## Part 1: Audit of All 8 Existing Situation Sets

### Audit Methodology
Each situation set was checked against:
- **POS_PRINCIPLES** — Does each question align with the position's documented principles?
- **KNOWLEDGE_MAPS** — Do the scenarios match the non-negotiable assignments in CUTOFF_RELAY_MAP, BUNT_DEFENSE_MAP, FIRST_THIRD_MAP, RUNDOWN_MAP, DP_MAP, SQUEEZE_MAP, etc.?
- **BRAIN constant** — Are RE24 values, count data, steal break-even rates, and other statistics used correctly?
- **SCENARIO_BIBLE Quality Checklist** — All 30+ checks including structural integrity, educational quality, and consistency
- **Cross-Position Verification** — CR1-CR10 rules from the Bible

---

### SR1: Bases Loaded Jam ✅ PASS (Minor notes)
**Situation**: Bot 6, 1 out, count 1-2, runners 1-2-3, score 3-4 (down by one)

| Question | Position | ConceptTag | Verdict |
|----------|----------|------------|---------|
| sr1a | Pitcher | pitch-sequencing | ✅ PASS |
| sr1b | Catcher | dp-positioning | ✅ PASS |
| sr1c | Baserunner | baserunning-rates | ✅ PASS |

**Accuracy Check:**
- ✅ Pitcher pitching for ground-ball DP with low fastball matches POS_PRINCIPLES ("pitch for contact/ground balls when you need a DP") and BRAIN DP_MAP ("DP depth when runner on 1st, <2 outs")
- ✅ Catcher setting up low-and-away aligns with catcher principles ("field general calling pitches") and supports pitcher's DP strategy — positions are synergistic
- ✅ Baserunner reading the ball off the bat matches POS_PRINCIPLES ("read pitcher's first move, read ball off bat")
- ✅ Rates are well-differentiated: best answers at 88, wrong answers spread 5-25

**Notes:**
- 🔸 sr1b option 4 "Call for a pitchout" with bases loaded — explanation correctly identifies this is nonsensical. Good teaching moment.
- 🔸 Count is 1-2 (pitcher's count) — could mention in sr1a that at 1-2 the pitcher has the edge (.180 BA per BRAIN.countData) making low fastball even more effective. Currently doesn't reference count leverage at all.
- 🔸 **Missing position opportunity**: No infielder question. With bases loaded DP, a question about middle infield DP positioning (from DP_MAP) would strengthen this set. Shortstop or second baseman positioning for the DP pivot would be natural.

**Missing Infrastructure References:**
- Could tie to BRAIN.stats.RE24["123"][1] = 1.59 (bases loaded, 1 out) vs RE24["---"][2] = 0.11 (empty, 2 outs after DP) to quantify the DP value
- conceptTag "pitch-sequencing" is a bit broad — "dp-ground-ball" or similar would be more precise

---

### SR2: Steal Attempt at Second ✅ PASS (Clean)
**Situation**: Top 4, 0 outs, count 1-1, runner on 1st, score 2-2

| Question | Position | ConceptTag | Verdict |
|----------|----------|------------|---------|
| sr2a | Pitcher | steal-window | ✅ PASS |
| sr2b | Catcher | steal-window | ✅ PASS |
| sr2c | Shortstop | steal-window | ✅ PASS |

**Accuracy Check:**
- ✅ Pitcher slide step (~1.2s vs ~1.5s delivery) matches BRAIN.stats.stealWindowMath perfectly
- ✅ Catcher quick transfer to shortstop side of bag aligns with POS_PRINCIPLES ("throwing out runners") and the steal mechanics in KNOWLEDGE_MAPS
- ✅ Shortstop break timing, straddle, low sweep tag — all match POS_PRINCIPLES and steal coverage assignments
- ✅ All three positions are correctly assigned roles per the steal defense system
- ✅ Rates well-differentiated (88 vs 8-25)

**Notes:**
- 🔸 sr2a option 4 "Hold the ball for 5+ seconds" — explanation mentions balk but doesn't cite the specific rule. Could reference pitch clock (20 seconds with runners per PITCH_CLOCK_MAP)
- 🔸 sr2c: The set correctly uses shortstop as coverage. With a RHB (implied by 1-1 count at the plate), 2B could also be the covering fielder depending on game plan. The scenario handles this by having the shortstop cover, which is the standard play.
- 🔸 **Strong set** — all three positions are genuinely interconnected. The slide step enables the catcher's quick throw enables the shortstop's timely arrival. This is exactly what Situation Room should feel like.

**Missing Infrastructure References:**
- Could quantify: BRAIN.stealBreakEven[0] = 0.72 (72% success needed with 0 outs)
- BRAIN.stealWindowMath: delivery(1.3s) + popTime(2.0s) = 3.3s window vs runner(3.3-3.5s). Slide step cuts to ~3.1s
- Could add BRAIN.popTimeData: elite 1.85s, average 2.0s, slow 2.15s

---

### SR3: Sacrifice Bunt Situation ✅ PASS (Strong, one minor issue)
**Situation**: Bot 7, 0 outs, count 0-0, runner on 1st, score 3-3 (tie game)

| Question | Position | ConceptTag | Verdict |
|----------|----------|------------|---------|
| sr3a | Pitcher | bunt-defense | ✅ PASS |
| sr3b | Third Base | bunt-defense | ✅ PASS |
| sr3c | First Base | bunt-defense | ✅ PASS |
| sr3d | Batter | bunt-re24 | ✅ PASS |

**Accuracy Check:**
- ✅ Pitcher throwing high fastball as anti-bunt pitch matches BUNT_DEFENSE_MAP exactly ("high fastball is the best anti-bunt pitch")
- ✅ Third baseman charging hard matches BUNT_DEFENSE_MAP R1 scenario: "3B charges"
- ✅ First baseman charging but covering first matches BUNT_DEFENSE_MAP: "1B charges" + "2B covers 1B"
- ✅ Batter bunting down first-base line (away from charging 3B) is correct sacrifice technique
- ✅ BUNT_DEFENSE_MAP assignments: P fields, 1B charges, 3B charges, 2B covers 1st, SS covers 2nd, C directs — the scenario uses P, 3B, 1B, and batter, which are the key actors

**Notes:**
- 🔸 sr3c best answer (index 2) is "Charge, but cover first if needed" at rate 88. The explanation says "charge aggressively but if someone else fields it, peel back to cover first." This is accurate per BUNT_DEFENSE_MAP. However, the map says "2B covers 1B" — the explanation could mention that the second baseman is rotating to first as backup. Currently doesn't mention 2B's role at all.
- 🔸 sr3d conceptTag is "bunt-re24" — good! Could reference BRAIN.buntDelta["1--"] = -0.23 (sacrifice bunt costs 0.23 expected runs from R1 only). The scenario implicitly acknowledges this is a sacrifice situation (tie game, late innings) where RE24 trade-off is justified by win probability.
- 🔸 This is the only 4-question set that works really well. The four perspectives (defense pitcher, defense 3B, defense 1B, offense batter) create a rich multi-angle view.

**Missing Infrastructure References:**
- BRAIN.buntDelta["1--"] = -0.23 runs (sacrifice bunt RE24 cost with R1)
- Could note that in tie game Bot 7, win probability makes the bunt more justified despite negative RE24
- BUNT_DEFENSE_MAP full assignment chain for R1 scenario

---

### SR4: Extra-Base Hit to the Gap ✅ PASS (One accuracy concern)
**Situation**: Top 5, 1 out, count "-", runner on 1st, score 1-2

| Question | Position | ConceptTag | Verdict |
|----------|----------|------------|---------|
| sr4a | Center Fielder | relay-double-cut | ✅ PASS |
| sr4b | Shortstop | relay-double-cut | ✅ PASS |
| sr4c | Baserunner | baserunning-rates | ✅ PASS |

**Accuracy Check:**
- ✅ CF hitting relay man in chest matches CUTOFF_RELAY_MAP: "hit the relay in the chest"
- ✅ SS as relay man on balls to right-center matches CUTOFF_RELAY_MAP: "Right side (RF-CF gap, RF line) lead relay=2B, trail=SS or 1B"
- ⚠️ **POTENTIAL ISSUE**: The scenario says the ball is in "right-center gap" and has the SS as relay man. But per CUTOFF_RELAY_MAP, on right-side hits, the **2B is the lead relay and SS is the trail**. The SS question (sr4b) says "Run to a spot between the outfielder and home plate" — which is the LEAD relay role. If this is a right-center gap hit, the 2B should be the lead relay, not the SS.
  - **HOWEVER**: The gap description could be interpreted as "center-left of right-center" where it's more center than right, in which case CUTOFF_RELAY_MAP says "Left side (LF line, LF-CF gap, deep CF) lead relay=SS, trail=2B" — and CF fielding it from center could qualify.
  - **RECOMMENDATION**: Clarify in the situation description whether the ball is to left-center or right-center. If right-center, swap SS to 2B as relay, or add the 2B as the relay and keep SS as trail. If left-center, change CF to "left-center field" or just "the gap" without specifying right.
- ✅ Baserunner rounding third and reading relay is correct per POS_PRINCIPLES

**Notes:**
- 🔸 The desc says "right-center gap" but uses SS as relay (should be 2B per map). This needs a fix — either change desc to "left-center" or change the relay position to 2B.
- 🔸 sr4a option 1 mentions "throw a rainbow to home plate" — great wrong-answer explanation of why long throws fail
- 🔸 **Missing position**: No second baseman question (covering bag or trail relay). No pitcher question (backup responsibilities per BACKUP_MAP: "Pitcher backs up HOME on ALL OF throws home")

**Required Fix:**
- Either change `desc` to say "left-center gap" (so SS as lead relay is correct), or
- Change sr4b to use "secondBase" position and adjust the relay role accordingly

---

### SR5: Full Count Showdown ✅ PASS (Clean)
**Situation**: Bot 8, 2 outs, count 3-2, runner on 2nd, score 5-5

| Question | Position | ConceptTag | Verdict |
|----------|----------|------------|---------|
| sr5a | Pitcher | count-leverage | ✅ PASS |
| sr5b | Batter | count-leverage | ✅ PASS |
| sr5c | Manager | win-probability | ✅ PASS |

**Accuracy Check:**
- ✅ Pitcher throwing best pitch at 3-2 matches POS_PRINCIPLES and BRAIN.countData["3-2"] (BA .230, neutral edge). "Trust your best pitch" is consensus coaching.
- ✅ Batter protecting the plate at 3-2 with 2 outs matches POS_PRINCIPLES ("two-strike approach: protect the plate"). The BRAIN.countData["3-2"] shows neutral edge — plate discipline is key.
- ✅ Manager sending runner on 3-2 with 2 outs is universally taught. Ball four advances him; contact gives head start; K ends inning regardless. No downside.
- ✅ sr5c correctly dismisses bunting with 2 outs (bunt out = end of inning) and IBB (putting more runners on is wrong)

**Notes:**
- 🔸 Could reference BRAIN.countData["3-2"]: BA .230, OBP .350, SLG .380, label "Full Count", edge "neutral"
- 🔸 sr5c rates [88,12,30,3] — the "hit-and-run" option at 30 is arguably too high since it's essentially the same as sending the runner at 3-2 but adds pressure to swing at ball four. Good nuance in the explanation.
- 🔸 Runner on 2B going on 3-2/2 outs is the "automatic runner" concept — well-taught here.

---

### SR6: Squeeze Play Alert ✅ PASS (Strong)
**Situation**: Bot 7, 1 out, count 1-1, runner on 3rd, score 2-3 (down by one)

| Question | Position | ConceptTag | Verdict |
|----------|----------|------------|---------|
| sr6a | Batter | squeeze-play | ✅ PASS |
| sr6b | Pitcher | squeeze-recognition | ✅ PASS |
| sr6c | Third Base | squeeze-recognition | ✅ PASS |

**Accuracy Check:**
- ✅ Batter squaring late and bunting everything matches SQUEEZE_MAP: "suicide squeeze: runner commits on FIRST MOVE, batter MUST bunt"
- ✅ Pitcher throwing high-and-tight to counter squeeze matches SQUEEZE_MAP: "high-tight" as defensive counter
- ✅ Third baseman as squeeze alarm (watching runner's lead/break) matches coaching consensus
- ✅ All explanations correctly distinguish safety squeeze from suicide squeeze
- ✅ The squeeze is legitimately on (R3, 1 out, down 1, late innings) — realistic scenario

**Notes:**
- 🔸 sr6a: correctly teaches that squaring early tips off the defense. Good emphasis on the timing element of suicide squeeze.
- 🔸 sr6b option 3 "Step off the rubber" gets rate 30 — good, it IS a legitimate counter but the explanation correctly notes you must do it before committing to home
- 🔸 SQUEEZE_MAP also notes "never suicide with 2 strikes (foul bunt = strikeout + runner dead)" — count is 1-1 here so not applicable, but this is a good concept that should be in a separate scenario or difficulty variant
- 🔸 **Missing position**: Catcher! The catcher's role in squeeze defense (jumping to catch high-tight pitch, applying tag to runner coming home) is a natural 4th question.

---

### SR7: Rundown Chaos ✅ PASS (Strong, excellent cross-position)
**Situation**: Top 3, 0 outs, runners 1st and 3rd, score 0-1

| Question | Position | ConceptTag | Verdict |
|----------|----------|------------|---------|
| sr7a | First Base | rundown-mechanics | ✅ PASS |
| sr7b | Shortstop | rundown-mechanics | ✅ PASS |
| sr7c | Baserunner (R3) | first-third | ✅ PASS |

**Accuracy Check:**
- ✅ First baseman chasing toward second while watching R3 matches RUNDOWN_MAP: "chase runner HARD BACK toward previous base" (in this case, chasing R1 toward 2B) and FIRST_THIRD_MAP: awareness of R3
- ✅ Shortstop closing the gap matches RUNDOWN_MAP: "move toward the incoming runner to close the gap for immediate tag"
- ✅ Runner on third going when throw goes toward second matches FIRST_THIRD_MAP: R3 breaks when fielder's momentum carries away from home
- ✅ RUNDOWN_MAP principles all present: chase hard, hold ball high, one throw maximum, don't pump-fake

**Notes:**
- 🔸 sr7a rates [88,15,10,20] — well-spread. Option 2 (run him back to first) at 15 correctly identifies the "reset to same situation" problem
- 🔸 sr7b concept of "closing the gap" is one of the most important rundown mechanics. Excellently taught here.
- 🔸 sr7c correctly uses FIRST_THIRD_MAP timing: go when ball moves away from you. Rate 88 for the correct answer, 25 for the "bluff" (reasonable alternative), 15 for "go immediately" (too reckless), 8 for "stay" (too passive). Well-calibrated.
- 🔸 **Missing position**: Catcher watching R3 and being ready for throw home. Also second baseman filling behind first baseman after the rundown starts. Per RUNDOWN_MAP: "2 fielders per base always."

---

### SR8: Tag-Up Play at the Warning Track ✅ PASS (Clean)
**Situation**: Bot 5, 1 out, runner on 3rd, score 1-2 (down by one)

| Question | Position | ConceptTag | Verdict |
|----------|----------|------------|---------|
| sr8a | Center Fielder | of-depth-arm-value | ✅ PASS |
| sr8b | Baserunner | tag-up | ✅ PASS |
| sr8c | Third Base Coach | tag-up | ✅ PASS |

**Accuracy Check:**
- ✅ CF catching cleanly + crow hop + throw home matches OF principles and TAGUP_SACRIFICE_FLY_MAP
- ✅ Baserunner reading depth and throw before committing matches POS_PRINCIPLES baserunner tag-up mechanics
- ✅ Third base coach reading catch depth, momentum, arm angle matches coaching principles
- ✅ Tag-up from third on a warning-track fly is RE-positive (BRAIN: tag-score from third = 88%)

**Notes:**
- 🔸 sr8c pos is "thirdBase" but cat is "manager" — this is the third base COACH, which is a manager role. The pos/cat mismatch is technically wrong (the third baseman is a fielder, the third base coach is a manager). Could cause confusion in position stats. **Recommend**: Change `pos` to "manager" or add a note that this is "3B Coach" not the "3B fielder."
- 🔸 Could reference BRAIN.baserunningRates.tagScoreFromThird = 0.88 (88% score rate on tag-ups from third)
- 🔸 TAGUP_SACRIFICE_FLY_MAP: "sac fly with R3 = RE-positive" — could cite RE24 change: R3/1out (0.98) to empty/2out (0.11) + 1 run scored (~1.11 total value vs 0.98 hold = positive)

---

## Audit Summary

### Overall Scorecard

| Set | Status | Critical Issues | Minor Notes | Missing Positions |
|-----|--------|-----------------|-------------|-------------------|
| SR1 | ✅ PASS | 0 | 2 | Infielder (SS/2B DP pivot) |
| SR2 | ✅ PASS | 0 | 1 | — (solid 3-position) |
| SR3 | ✅ PASS | 0 | 2 | SS (covering 2B/3B), Catcher (directing) |
| SR4 | ⚠️ PASS w/FIX | 1 (relay assignment) | 2 | 2B (relay/trail), Pitcher (backup) |
| SR5 | ✅ PASS | 0 | 1 | — (solid 3-position) |
| SR6 | ✅ PASS | 0 | 2 | Catcher (squeeze defense) |
| SR7 | ✅ PASS | 0 | 1 | Catcher, 2B (rundown coverage) |
| SR8 | ✅ PASS | 0 | 1 (pos/cat mismatch) | Cutoff man (1B), Pitcher (backup) |

### Required Fixes (Priority: CRITICAL)

**Fix 1: SR4 Relay Assignment Ambiguity**
The description says "right-center gap" but uses SS as lead relay. Per CUTOFF_RELAY_MAP, right-side relay = 2B leads. Either:
- Change `desc` to say "left-center gap" (makes SS correct), OR
- Change sr4b to `pos:"secondBase"` and adjust language

**Fix 2: SR8 Position/Category Mismatch**
sr8c has `pos:"thirdBase"` but `cat:"manager"`. The third base coach IS a manager role, not the third baseman. Options:
- Change `pos` to "manager" and adjust title to "Third Base Coach: Send or Hold?"
- This affects position stats tracking

### Patterns Found Across All Sets

1. **No BRAIN data references in explanations** — None of the 26 questions cite specific statistics (RE24 values, count BAs, steal break-even rates). The explanations are qualitatively correct but miss the quantitative teaching opportunity that the BRAIN constant enables.

2. **No knowledge map citations** — Explanations describe the correct actions but don't reference the authoritative source (CUTOFF_RELAY_MAP, BUNT_DEFENSE_MAP, etc.). Adding brief references would strengthen the educational value.

3. **Generic Teamwork Takeaway** — The debrief uses a 3-tier generic message based on score percentage, not a custom narrative per situation. Each situation should have a unique "How the Play Unfolded" story.

4. **No `debrief` or `teamworkTakeaway` fields** — These don't exist on the data objects. The results screen generates them dynamically. Adding per-situation debrief text would significantly improve educational quality.

5. **All questions are diff:2** — No difficulty variants. Kids ages 6-8 get the same difficulty as 18-year-olds.

6. **All conceptTags are narrow** — Each uses 1-2 concept tags. Could tie to the broader BRAIN.concepts prerequisite graph to guide learning paths.

7. **Missing positions per set** — Most sets cover 3 positions but miss 1-3 natural participant positions (see table above). Adding these would create richer 4-5 question sets for All-Star difficulty.

---

## Part 2: Infrastructure Integration Plan

### Current Knowledge Infrastructure (What Exists)

The app has a rich, sophisticated knowledge system that the Situation Room doesn't currently leverage:

| System | Location | Purpose | Used by Sit Room? |
|--------|----------|---------|-------------------|
| BRAIN constant | L5413 | RE24, count data, steal math, concepts, coaching | ❌ No |
| KNOWLEDGE_MAPS (25 maps) | L4574 | Position-specific authoritative assignments | ❌ No (scenarios align but don't reference) |
| POS_PRINCIPLES | L4287 | Position strategy rules | ❌ No (scenarios align but don't cite) |
| BIBLE_PRINCIPLES | L4326 | Enriched principles with knowledge tiers | ❌ No |
| AI_SCENARIO_TOPICS | L4492 | Topic guidance per position | ❌ No |
| AI_MAP_PRIORITY | L4520 | Primary map per position | ❌ No |
| AI_SCOPED_MAPS | L4534 | Position-filtered map excerpts | ❌ No |
| AI_FEW_SHOT_EXAMPLES | L4438 | Reference scenarios for AI | ❌ No |
| generateAIScenario() | L8357 | AI single-position generation | ❌ No |
| scoreAIScenario() | — | Quality validation firewall | ❌ No |
| Quality Firewall (9 layers) | L8765 | Role/premise/option/explanation validation | ❌ No |
| COACHING_VOICE | L5325 | Explanation tone guidance | ❌ No |
| DECISION_WINDOWS | L5364 | Temporal consistency of options | ❌ No |
| Mastery System | — | 5-state concept mastery tracking | ❌ No |
| Spaced Repetition | — | Review scheduling for degraded concepts | ❌ No |

**The Situation Room is an island.** It uses none of the infrastructure that makes the rest of the game intelligent. This is the #1 priority to fix.

### Integration Architecture

#### 2A. Add BRAIN References to All Existing Situation Sets

Every situation set should reference relevant BRAIN data in explanations. This is a content enrichment pass:

**SR1 (Bases Loaded):**
- sr1a: Add "RE24 with bases loaded, 1 out = 1.59. After a DP (empty, 2 outs) = 0.11. That's a 1.48 run swing!"
- sr1b: Reference DP_MAP positioning rules in explanation
- sr1c: Reference baserunning read rules from BASERUNNER_READS_MAP

**SR2 (Steal Attempt):**
- sr2a: Add "Slide step cuts delivery from ~1.5s to ~1.2s. With average pop time of 2.0s, that's 3.2s vs 3.5s to second base."
- sr2b: Reference BRAIN.popTimeData (elite 1.85s, average 2.0s)
- sr2c: Reference steal window math

**SR3 (Sacrifice Bunt):**
- sr3d: Add "Sacrifice bunts cost about 0.23 expected runs (RE24), but in a tie game late, win probability makes it worth it."
- sr3a-c: Reference BUNT_DEFENSE_MAP assignments explicitly

**SR4 (Gap Hit):**
- sr4a-b: Reference CUTOFF_RELAY_MAP double-cut assignments
- sr4c: Reference BRAIN.baserunningRates.firstToThird (28%, elite 45%)

**SR5 (Full Count):**
- sr5a-b: Reference BRAIN.countData["3-2"]: BA .230, OBP .350
- sr5c: Reference win probability framework for 3-2/2out/R2/tied game

**SR6 (Squeeze):**
- sr6a: Reference SQUEEZE_MAP timing rules
- sr6b: Reference defensive counter mechanics

**SR7 (Rundown):**
- sr7a-b: Reference RUNDOWN_MAP "one throw maximum" rule
- sr7c: Reference FIRST_THIRD_MAP timing rules

**SR8 (Tag-Up):**
- sr8a: Reference BRAIN.baserunningRates.tagScoreFromThird (88%)
- sr8b-c: Reference TAGUP_SACRIFICE_FLY_MAP RE24 analysis

#### 2B. Add Per-Situation Debrief Narratives

Add a `debrief` field to each situation set with a custom narrative explaining how all positions connect:

```javascript
// Example for SR1
debrief: "The pitcher threw a low fastball, and the catcher had already set up low-and-away — they were on the same page. The batter hit a grounder to short, who flipped to second for one, and the relay to first completed the double play. Meanwhile, the smart baserunner on third read the sharp grounder and held — if he'd run blindly, he'd have been the third out. Every position's decision connected: the pitcher's location, the catcher's setup, and the baserunner's patience all worked together to determine the outcome.",
teamworkTakeaway: "A double play only works when the pitcher pitches for grounders, the catcher calls for the right location, and the baserunner reads the ball before committing. One breakdown in the chain changes everything."
```

#### 2C. Add `synergy` Mapping for Cross-Position Coordination

Each situation set should define which answer combinations are "coordinated" vs "uncoordinated":

```javascript
// Example for SR1
synergy: {
  // [pitcherChoice, catcherChoice] → coordination bonus
  "0,0": 100,  // Both set up for DP ground ball — perfect coordination
  "0,1": 40,   // Pitcher goes low but catcher sets up high — mixed signals
  "1,0": 30,   // Pitcher goes high but catcher is low — disconnected
  "1,1": 60,   // Both aggressive for K — at least aligned
}
```

This enables the "Team Coordination Score" feature and teaches kids that ALIGNMENT matters, not just individual correctness.

#### 2D. Build generateAISituation() — AI Multi-Position Set Generation

Extend the existing `generateAIScenario()` pipeline to generate complete situation sets:

```javascript
async function generateAISituation(playerStats, masteryData) {
  // 1. Identify player's weak positions and unmastered concepts
  const weakPositions = getWeakPositions(playerStats);
  const dueConcepts = getDueForReview(masteryData);

  // 2. Select 3-4 positions that work together for a coherent situation
  const positionSet = selectCoherentPositions(weakPositions);

  // 3. Generate a shared game state
  const situation = generateGameState(positionSet, dueConcepts);

  // 4. For each position, generate a question using the existing pipeline
  const questions = [];
  for (const pos of positionSet) {
    const posPrompt = buildSituationPositionPrompt(pos, situation, positionSet);
    // Inject position-specific knowledge maps (AI_SCOPED_MAPS)
    // Inject relevant BRAIN data for the situation
    // Inject DECISION_WINDOWS to ensure temporal consistency
    const question = await callAI(posPrompt);

    // 5. Run position-specific quality firewall
    const valid = validateSituationQuestion(question, pos, situation);
    if (!valid) questions.push(getFallbackQuestion(pos, situation));
    else questions.push(question);
  }

  // 6. Cross-validate all questions for consistency
  validateCrossPosition(questions, situation);

  // 7. Generate debrief narrative
  const debrief = await generateDebrief(questions, situation);

  // 8. Generate synergy mappings
  const synergy = generateSynergyMap(questions);

  return { situation, questions, debrief, synergy };
}
```

**Key Prompt Additions for Situation Room AI:**
- DECISION_WINDOWS injection: All position questions must describe actions happening at the SAME MOMENT in the play
- Cross-position validation: Pitcher's pitch type must match catcher's setup; fielder's movement must match the play type
- Shared situation context: All positions see the same inning, outs, runners, score, count
- KNOWLEDGE_MAPS injection per position using AI_MAP_PRIORITY
- COACHING_VOICE for explanation tone
- REAL_GAME_SITUATIONS for authentic context

**Quality Firewall Extensions:**
- New Layer: Cross-position temporal consistency (all actions at same moment)
- New Layer: Position role alignment (no position doing another position's job)
- New Layer: Situation coherence (all questions reference same game state)
- New Layer: Debrief narrative validation (must reference all positions)

#### 2E. Connect to Mastery System

Link Situation Room performance to the existing mastery system:

- Track concept mastery from Situation Room answers (same conceptTag system)
- Feed Situation Room performance into practice recommendations
- Use mastery data to select difficulty-appropriate situation sets
- Degraded concepts trigger targeted Situation Room situations

#### 2F. Connect to Spaced Repetition

- Situation Room answers feed into `wrongCounts` tracking
- Concepts missed in Situation Room appear in recommended practice
- Situations the player struggled with resurface after appropriate interval

---

## Part 3: Enhancement Roadmap

### Phase 1: Foundation & Fixes (Sprint 1)

**1.1 Apply Audit Fixes**
- Fix SR4 relay assignment (change desc to "left-center gap" or change relay position to 2B)
- Fix SR8 pos/cat mismatch (change sr8c pos to "manager")
- Add BRAIN data references to all 26 existing question explanations
- Add per-situation `debrief` and `teamworkTakeaway` fields to all 8 sets

**1.2 Add Difficulty Tiers**
- Add `diff` field to SITUATION_SETS
- Create Rookie (diff:1) variants: 2 positions each, simpler language, use `explSimple`
- Create All-Star (diff:3) variants: 4-5 positions (add missing positions from audit), tighter rate differentials
- Target: 8 situations × 3 difficulties = 24 sets

**1.3 Add Situation Room State**
- Add `sitMastery` to DEFAULT state: `{ [setId]: { bestGrade, attempts, grades[], perfectCount } }`
- Add difficulty unlock logic (Rookie → Pro → All-Star)
- Add `sitTutorialDone` flag

**1.4 Picker Redesign**
- Group by situation with difficulty badges (☆☆☆)
- Show best grade and position breakdown per set
- Difficulty filter tabs: Rookie / Pro / All-Star
- Lock icons on locked difficulties

### Phase 2: New Content (Sprint 2)

**2.1 Write 12 New Situation Types at Pro Difficulty**
All new situations must follow SCENARIO_BIBLE quality checklist and reference appropriate KNOWLEDGE_MAPS.

| # | Situation | Positions | Primary Maps |
|---|-----------|-----------|-------------|
| 1 | Infield Fly Rule | umpire/rules, batter, baserunner | INFIELD_FLY_MAP |
| 2 | Hit and Run | batter, baserunner, 2B, SS | HIT_RUN_MAP |
| 3 | Intentional Walk Strategy | manager, pitcher, on-deck batter | INTENTIONAL_WALK_MAP, BRAIN.RE24 |
| 4 | Defensive Shift | manager, LF, SS, batter | LEGAL_SHIFT_MAP |
| 5 | Pitching Change | manager, reliever, catcher, batter | PITCHING_CHANGE_MAP, BRAIN.TTO |
| 6 | First-and-Third Double Steal | R1, R3, catcher, middle IF | FIRST_THIRD_MAP |
| 7 | Relay and Cutoff | OF, cutoff man, 3B, catcher | CUTOFF_RELAY_MAP |
| 8 | Pickoff Play | pitcher, 1B, baserunner | PICKOFF_MAP |
| 9 | Walk-Off Situation | pitcher, batter, runners, OF | BRAIN.winProb, BRAIN.RE24 |
| 10 | Error Recovery | SS, OF, pitcher (backup), baserunner | BACKUP_MAP |
| 11 | Wild Pitch/Passed Ball | catcher, pitcher, baserunner | WP_PB_MAP |
| 12 | Pop Fly Communication | CF, SS, 2B | OF_COMMUNICATION_MAP, POPUP_PRIORITY_MAP |

**2.2 Create Rookie and All-Star Variants of All 12**
- Target: 20 situations × 3 difficulties = 60 total sets, ~200+ questions

### Phase 3: Visual & UX Overhaul (Sprint 3)

**3.1 SituationHUD Component**
- Position progress dots (✅ done, 🔵 current, ⚪ upcoming)
- Mini game state display (inning, outs, runners)
- Current position highlight with emoji and color
- ~60px tall, persistent above play screen when sitMode=true

**3.2 Position Transition Animation**
- "Now you're the CATCHER" banner between questions
- Field view shifts to highlight current position
- 1-second transition animation using Field() component
- New animation type: "positionSwitch"

**3.3 Film Room Animated Debrief**
- Rename "How the Play Unfolded" to "Film Room" 🎬
- Step through each position's decision on the field SVG
- Position highlights → choice appears → ✅/❌ → field shows result
- Auto-advancing with progress bar, tap to pause/skip
- End with custom per-situation Teamwork Takeaway
- 1-line explanation per step (not paragraphs)

**3.4 Picker Board Redesign**
- Grid layout instead of vertical list
- Cards show: best grade, difficulty stars, position results
- Lock icons on unearned difficulties
- "Recommended" badge based on player's weak areas
- Sort: Newest, Hardest, Needs Practice

### Phase 4: Engagement & Progression (Sprint 4)

**4.1 Mastery Tiers**
- Bronze: Complete set (any grade)
- Silver: Grade B or better
- Gold: Grade A or better
- Diamond: Perfect on All-Star difficulty
- Visual progression on picker cards

**4.2 Situation Room Rank**
- Aggregate of all situation mastery tiers
- Titles: "Scout" → "Coordinator" → "Dugout Genius" → "Field General"
- Displayed on home screen Situation Room card

**4.3 Daily Situation**
- One rotating situation per day (date-based seed)
- Always Pro difficulty
- Streak tracking (consecutive daily plays)
- Exempt from daily play limit (like Daily Diamond)
- Different situation each day, cycles through all

**4.4 Team Coordination Score**
- Synergy mapping per situation set
- Score 0-100 based on how well choices work TOGETHER
- "Perfect Coordination" achievement for 100%
- Gauge visualization on results screen

**4.5 Speed Situation (Timed)**
- Toggle on intro screen
- 15-second timer per question
- Bonus XP for fast correct answers
- Timer visible in HUD
- Separate tracking from untimed

### Phase 5: AI & Social (Sprint 5)

**5.1 AI-Generated Situation Sets**
- Implement `generateAISituation()` (see Section 2D above)
- Uses player's weak positions and unmastered concepts
- Purple "AI" badge on generated situations
- 1-2 AI situations per session based on weaknesses
- Full quality firewall with cross-position validation
- Fallback to handcrafted if AI fails

**5.2 Challenge System Extension**
- "Challenge a Friend" after completing a Situation
- Friend plays same set, sees side-by-side comparison
- Per-position comparison: "You got Pitcher ✅, they got Catcher ✅"
- Reuse existing challenge link infrastructure

**5.3 Shareable Report Card**
- Canvas-rendered image: situation name, grade, position breakdown, coordination score
- Share button → clipboard or share link
- "Play at baseballstrategymaster.com" footer

**5.4 Practice Recommendations Integration**
- Missed positions in Situation Room → recommend position practice
- Aced Situation Room but weak in individual → suggest weak positions
- "Situation Room Recommended" badge when multi-position thinking would help

**5.5 Age-Appropriate Filtering**
- Use `ageMin`/`ageMax` at set level
- Rookie: ages 6-10
- Pro: ages 9-14
- All-Star: ages 12-18
- Uses `stats.ageGroup` from onboarding

**5.6 First-Time Tutorial**
- 3 steps: "One situation, many positions" → "Think like the whole team" → "Film Room connects it all"
- Uses existing tooltip system
- Sets `stats.sitTutorialDone` flag

---

## Part 4: Implementation Order for Claude Code

### Sprint 1: Foundation (1 session)
```
Tasks:
1. Fix SR4: Change desc to "left-center gap" OR change relay to 2B
2. Fix SR8: Change sr8c pos to "manager"
3. Add `debrief` and `teamworkTakeaway` fields to all 8 situation sets
4. Enrich all 26 question explanations with BRAIN data references
5. Add `diff` field to existing SITUATION_SETS (all currently diff:2)
6. Create Rookie (diff:1) variants of all 8 situations
7. Create All-Star (diff:3) variants of all 8 situations (add missing positions)
8. Add `sitMastery` to DEFAULT state
9. Update picker to show difficulty tabs and per-situation grades
10. Add difficulty unlock logic
```

### Sprint 2: New Content (1-2 sessions)
```
Tasks:
1. Write 12 new situation sets at Pro difficulty (see Phase 2 table)
2. Each set must reference appropriate KNOWLEDGE_MAPS
3. Each set must include BRAIN data in explanations
4. Each set must have custom debrief and teamworkTakeaway
5. Create Rookie and All-Star variants of each new set
6. Cross-check all content against SCENARIO_BIBLE quality checklist
7. Validate against POS_PRINCIPLES and BRAIN
```

### Sprint 3: Visual Overhaul (1 session)
```
Tasks:
1. Build SituationHUD component
2. Add position transition animation
3. Redesign picker as visual grid
4. Build Film Room animated debrief
5. Add synergy field to all situation sets
6. Build Team Coordination Score visualization
```

### Sprint 4: Engagement Features (1 session)
```
Tasks:
1. Implement Bronze/Silver/Gold/Diamond mastery tiers
2. Add Situation Room Rank with titles
3. Build Daily Situation mode
4. Add Speed Situation timed variant
5. Connect mastery system to Situation Room
6. Connect spaced repetition to Situation Room
```

### Sprint 5: AI & Social (1 session)
```
Tasks:
1. Implement generateAISituation()
2. Add cross-position quality firewall
3. Extend Challenge system for Situation Room
4. Build shareable Report Card
5. Connect to practice recommendations
6. Add age-appropriate filtering
7. Add first-time tutorial
```

---

## Key Design Principles

1. **Every question should feel connected** — Never like isolated scenarios stitched together
2. **Show, don't tell** — Animate the connections between positions instead of explaining them
3. **Reference the data** — Every explanation should teach the WHY with real numbers from BRAIN
4. **Use the infrastructure** — Every new feature must leverage existing knowledge maps, AI pipeline, and mastery system
5. **The Film Room is the educational payoff** — Invest the most polish here
6. **Living organism** — AI generation ensures infinite fresh content, synergy mappings teach coordination, mastery tracking drives replay value
7. **Difficulty should feel earned** — Unlocking All-Star after mastering Rookie feels rewarding
8. **Progression should be visible** — The picker should make you WANT to fill in all the stars

---

## Metrics to Track

- Situation Room plays per session
- Completion rate (start a set → finish all questions)
- Replay rate (same situation played more than once)
- Grade distribution across difficulty levels
- Film Room engagement (do players watch the whole thing or skip?)
- Team Coordination Score distribution
- Daily Situation streak length
- AI situation generation success rate
- Conversion from free → pro via Situation Room
- Position accuracy delta (does Situation Room improve individual position play?)
