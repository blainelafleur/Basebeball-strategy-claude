# Baseball Strategy Master — Phase 2: Build the World's Best Baseball AI Brain
### A Sequenced Execution Plan (Like CLAUDE_PROJECT_PROMPTS.md, But Deeper)

---

## What Phase 1 Accomplished

The 10 prompts in `CLAUDE_PROJECT_PROMPTS.md` built the **foundation**:
- Knowledge hierarchy with 4 tiers (Rules → Data → Coaching → Situational)
- 19 authoritative knowledge maps injected into every AI prompt
- POS_PRINCIPLES for all 12 positions
- BRAIN constant with RE24, count data, stats, and concept graph
- Role violation detection
- Coach line system with facts, streaks, and situational lines
- Full consistency audit and data cross-reference table

That's the skeleton. Phase 2 builds the **muscles, nervous system, and memory**.

---

## What "Most Powerful Baseball AI Brain Ever Created" Actually Means

There are 5 dimensions to win on:

| Dimension | What It Means | Phase 1 Status |
|-----------|--------------|----------------|
| **Breadth** | Covers every real situation the game produces | ~70% — 19 maps, 394 scenarios |
| **Depth** | Explains the WHY with real data, not just rules | ~60% — RE24 exists, gaps remain |
| **Adaptivity** | Gets smarter from player behavior and errors | ~20% — spaced repetition only |
| **Age-calibration** | Perfect vocabulary and complexity for each age | ~40% — diff 1/2/3 tagging only |
| **Continuous improvement** | Self-audits, flags errors, updates with new data | ~15% — manual maintenance only |

Phase 2 attacks all 5 dimensions in sequence.

---

## Phase 2 Structure: 5 Modules, 20 Prompts

Each module has 4 targeted prompts you run sequentially in your Claude project. Each builds on the last. This mirrors the Phase 1 format exactly — paste into the project, run them in order, update both documents with the results.

---

## MODULE 1: Fill the Breadth Gaps (Prompts 1–4)
*Goal: Zero situations that real baseball produces that our system can't handle*

---

### Prompt 1 — "Map Every Situation the Game Produces"

```
I need to verify that our knowledge system covers every major situation
real baseball produces. Using the knowledge hierarchy in SCENARIO_BIBLE.md,
audit our 19 knowledge maps against this master list of game situations:

OFFENSIVE SITUATIONS:
- All 24 base-out states (0/1/2 outs × 8 base configurations)
- All 12 counts (0-0 through 3-2)
- Bunt decisions (sacrifice, safety squeeze, suicide squeeze)
- Hit and run
- Steal (1st, 2nd, 3rd, double steal 1st+2nd, delayed steal)
- Tag-up (all bases)
- First and third plays (offense)
- Pinch hit decisions
- Batting order construction

DEFENSIVE SITUATIONS:
- All cutoff/relay assignments (we have this — verify completeness)
- All bunt defense alignments
- All double play setups
- All pickoff plays (1B, 2B, 3B, daylight play, wheel play, fake-to-3rd rule)
- First and third defense
- Intentional walk
- Infield fly rule
- Obstruction vs interference (all 3 types)
- Shift decisions
- Infield in / corners in positions

PITCHING SITUATIONS:
- All count-based pitch selection logic
- Sequencing (tunneling, eye level, speed differential)
- Pitching change triggers (TTO, leverage, handedness)
- Pitch clock management
- Mound visit strategy
- Holding runners (all bases, all handedness combinations)

RULE-BASED SITUATIONS:
- Dropped third strike (all configurations)
- Balk (all 13 types per MLB rule 6.02)
- Infield fly (all configurations)
- Interference (batter, runner, catcher, umpire)
- Obstruction (Types A and B)
- Appeal plays
- Ground rule doubles
- Fan interference
- Batting out of order
- Pitch clock violations

For each situation, tell me:
1. Which of our 19 maps covers it (if any)
2. Coverage quality: FULL / PARTIAL / MISSING
3. If MISSING or PARTIAL: the exact content to add
4. Which document(s) to update

Prioritize: situations that appear in real games most often should be covered deepest.
```

---

### Prompt 2 — "Add the Balk Encyclopedia"

```
Our PICKOFF_MAP covers "NEVER fake to third then throw to first (balk since 2013)"
and the daylight play, but we have no comprehensive balk coverage.

Per MLB Official Rules 6.02 (Tier 1 — highest authority), there are 13 defined
balk types. Kids get called for balks constantly at every level, and they never
understand WHY.

Design a new BALK_MAP knowledge map:
1. All 13 balk types from MLB Rule 6.02, grouped by category:
   - Deceptive move balks (quick pitch, no stop, illegal motion)
   - Footwork balks (wrong step direction, step to non-occupied base)
   - Fake/throw sequence balks (fake to 1B from set, fake 3B→throw 1B)
   - Set position balks (not coming set, dropping ball, pitching from wrong position)
2. For each: plain English name, exact rule violation, WHY it's a balk (what deception it prevents), age-appropriate explanation
3. The "Stretch vs Windup" distinction (when each is legal)
4. Cardinal rules: what you can ALWAYS do legally vs what is ALWAYS illegal
5. MAP_RELEVANCE: which positions need this (P, C, BR, MGR — runners must know too)
6. MAP_AUDIT: self-check questions for AI scenarios

Format:
- SCENARIO_BIBLE.md Section 3.21 addition
- JavaScript constant BALK_MAP for index.jsx
- 3 sample scenarios (diff 1/2/3) that would use this map
```

---

### Prompt 3 — "Add the Appeal Play Encyclopedia"

```
Appeal plays are one of the most misunderstood rule situations in baseball —
and they're completely missing from our knowledge system.

Per MLB Official Rules 5.09(c) and 7.10 (Tier 1):
- Missing a base on a hit
- Leaving early on a tag-up
- Batting out of order
- These are all appeal plays — the defense must appeal or the infraction stands

Design a new APPEAL_PLAY_MAP:
1. All types of appeal plays with trigger situations
2. HOW to make a legal appeal (live ball, step off, throw to base)
3. Common mistakes that invalidate an appeal
4. Runner obligations that create appeal opportunities
5. Batting out of order in detail (who's called out, what counts, when the appeal window closes)
6. Why appeals exist (the principle of competitive advantage)

Also integrate with existing maps:
- TAGUP_SACRIFICE_FLY_MAP: add appeal play notes
- BASERUNNER_READS_MAP: add "touch every base" principle
- Cross-reference which existing scenarios should reference appeal play awareness

Format as SCENARIO_BIBLE.md Section 3.22 + JavaScript constant APPEAL_PLAY_MAP.
Include 3 scenario concepts that would use this map.
```

---

### Prompt 4 — "Complete the Baserunner Situation Library"

```
Our BASERUNNER_READS_MAP covers steal reads, tag-ups, and lead distances.
But baserunning has a dozen more high-value situations we don't cover:

1. THE DOUBLE STEAL (1st + 2nd simultaneously)
   - The "early" read: runner at 1B goes first, triggers throw to 2B, runner at 2B scores
   - The "delayed" version: both runners go on the throw back to the pitcher
   - When to attempt vs. when it's too risky

2. THE DELAYED STEAL
   - Timing the catcher's return throw to the pitcher
   - Reading infielder positioning (who's covering?)
   - Most effective with slow-returning catchers

3. FIRST TO THIRD ON A SINGLE
   - Which singles CAN lead to 1B→3B (ball to RF corner, ball hit behind runner)
   - Reading the outfielder's angle and glove position
   - The "round second aggressively, read the throw" technique
   - When NOT to try (elite RF arm, ball hit to shallow OF)

4. SCORING FROM SECOND ON A SINGLE
   - The standard is: score on ANY single to the outfield with 0-1 outs
   - Exception: ball to LF with a runner going to 3B = traffic jam → hold
   - Reading the coach's windmill vs. stop signs

5. THE RUNDOWN ESCAPE
   - Never run toward the base you came from if a runner is there
   - Make the fielder chase you as long as possible to let advancing runner score
   - When to surrender vs. fight the rundown

6. THIRD BASE READS
   - The "do or die" situation: 2 outs, any batted ball = go
   - Tag-up on shallow fly: go only if fielder has to come in hard and throw is long
   - Never make the third out at home on a close play if there's less than 2 outs

For each: add to BASERUNNER_READS_MAP with source citations, update
POS_PRINCIPLES for Baserunner, and propose 2 new scenario concepts per topic.
```

---

## MODULE 2: Deepen the Data Layer (Prompts 5–8)
*Goal: Every strategic claim backed by the strongest possible number*

---

### Prompt 5 — "Build BRAIN.data.matchupMatrix"

```
Our BRAIN.stats has RE24, count data, steal break-even, and pitch type run values.
But we're missing the data that drives the most important in-game decisions:
MATCHUP DATA.

Build a new BRAIN.data.matchupMatrix section covering:

1. PLATOON SPLITS (Tier 2 — FanGraphs/Baseball Reference)
   - LHP vs LHB / LHP vs RHB
   - RHP vs LHB / RHP vs RHB
   - BA, OBP, SLG, wOBA differentials (real MLB averages)
   - Which counts amplify platoon advantage (hint: 2-strike counts platoon most)
   - What the 18-point OPS advantage translates to in run expectancy terms

2. TTO (TIMES THROUGH THE ORDER) DATA
   - 1st time through: pitcher ERA baseline
   - 2nd time through: +15 pts OPS
   - 3rd time through: +30 pts OPS (already in BRAIN, verify and expand)
   - What drives TTO? (batters seeing pitch repertoire)
   - At what pitch count does the TTO effect typically kick in?

3. LEVERAGE INDEX THRESHOLDS
   - Definition: LI = 1.0 is average, 2.0 = twice as important
   - LI by inning/score/base-out state (key data points)
   - When to use your best reliever (LI threshold)
   - Why closer "save situation" rule is suboptimal (data: closer often enters non-peak LI)

4. WOBA BY PITCH TYPE AND COUNT COMBINATION
   - 4-seam fastball on 0-2 vs. 3-2 (very different results)
   - Which pitch types are most/least effective on first pitch
   - This drives game-calling decisions

Format as JavaScript object in BRAIN.data.matchupMatrix.
Add a getMatchupData() Brain API function.
Integrate into formatBrainStats() for manager and pitcher positions.
Cite every number with its source (FanGraphs, Baseball Reference, Statcast).
```

---

### Prompt 6 — "Build BRAIN.data.parkFactors + Environmental"

```
Our system treats all situations equally regardless of park or environment.
But strategy should change based on context. Add:

1. PARK FACTOR PRINCIPLES (Tier 2 — Baseball Reference park factors)
   - What park factor means: 100 = neutral, >100 = hitter-friendly
   - How park factors affect: stolen base decisions, pitching approach, defensive positioning
   - General categories: extreme hitter parks, extreme pitcher parks, neutral
   - Rule of thumb: in a hitter's park, run expectancy for every state is slightly higher

2. INFIELD SURFACE EFFECTS
   - Grass vs. turf: turf = faster grounders = shifted positioning
   - Bunt defense: harder to play on turf (ball moves faster)
   - Infield depth adjustment: play a step deeper on turf

3. WEATHER/WIND EFFECTS
   - Wind out to CF: fly balls carry, outfield plays deeper, less aggressive bunt defense
   - Wind in from CF: balls die, outfield plays shallow, more running game
   - High altitude (Denver): ball carries ~10% farther
   - Humidity: negligible effect on ball flight (common myth)
   - Cold: ball is harder = less distance but harder to grip for pitchers

4. NIGHT VS. DAY
   - Day games in certain parks: sun field disadvantage for specific positions
   - How to use glove as sun shield

Format as BRAIN.data.parkAndEnvironment. Add principles to relevant POS_PRINCIPLES
(outfield, pitcher). Note these as Tier 4 (situational) since they adjust decisions
rather than mandate them. Propose 3 scenario concepts.
```

---

### Prompt 7 — "Build BRAIN.data.ageAndLevelAdjustments"

```
Our app teaches ages 6-18, but the BRAIN constant treats all decisions as
MLB-level optimal. A 9-year-old's baseball is very different from high school.

Build BRAIN.data.levelAdjustments:

1. LEVEL DEFINITIONS
   - T-Ball / Coach Pitch (ages 5-8): no stealing, bunting rare, focus on contact
   - Kid Pitch / Machine Pitch (ages 8-11): stealing introduced, basic positioning
   - Travel Ball 11-12: more complex strategy, leads introduced
   - Middle School (12-14): full strategy, pickoffs, bunts, shifts
   - High School (14-18): near-MLB strategy

2. STEAL BREAK-EVEN BY LEVEL
   - MLB: 72% break-even
   - High school: ~65% (lower run values per base)
   - Middle school: ~60% (pitchers wilder, more passed balls)
   - Youth: stealing is almost always correct because catchers can't throw

3. BUNT EFFECTIVENESS BY LEVEL
   - MLB: sacrifice bunt usually reduces RE (established)
   - High school: bunt can be MORE valuable (fielders less reliable at charging)
   - Youth: bunt is almost always effective (fielders can't handle the play)

4. CONCEPT UNLOCK THRESHOLDS
   - Which concepts should only appear for certain age/level combos
   - Map to BRAIN.concepts prerequisite graph
   - Example: "pitch tunneling" = high school+, "get a strike" = all ages

5. EXPLANATION VOCABULARY BY AGE
   - Ages 6-8: avoid stats entirely, use simple cause-effect ("throw strikes so the batter has to swing")
   - Ages 9-11: introduce simple stats (batting average, stolen base percentage)
   - Ages 12-14: introduce RE24 conceptually ("base and out state changes value")
   - Ages 15-18: full statistical vocabulary

Format with code that maps user's reported age/level to adjusted thresholds.
This becomes the personalization layer of the brain.
```

---

### Prompt 8 — "Audit and Complete Every BRAIN.stats Data Point"

```
Review the Data Consistency Checks table in BRAIN_KNOWLEDGE_SYSTEM.md Section 9.
For each data point listed, verify or improve it:

1. VERIFY THESE SPECIFIC VALUES (look for post-2022 data where available):
   - RE24 values: are these 2015-2024 averages or older?
   - Count batting averages (.340 first pitch, .167 on 0-2, .400 on 2-0): source year?
   - Steal break-even 72%: this is a commonly cited figure — is it post-pitch-clock?
   - Pitch clock steal window -0.20s: sourced from what study?
   - TTO +30 pts: verify with post-2020 data (has this changed?)
   - Platoon edge 18 pts: verify with recent data

2. ADD THESE MISSING DATA POINTS:
   - Infield in GB success rate reduction: we have 58% vs 74%, but what is the
     run score probability difference?
   - Strikeout rate trends: K% in 2024 vs 2014 (context for "protect the zone" advice)
   - Walk rate by count (we have 3-0 at 48%, but need full table)
   - Hit by pitch rate: small but relevant for batters crowding the plate
   - BABIP by contact type: line drive ~.685, grounder ~.235, fly ball ~.130
   - Catcher framing run value: top framers save ~12-15 runs per season

3. FLAG ANYTHING THAT CHANGED POST-PITCH-CLOCK (2023+):
   The pitch clock changed baserunning windows, pickoff frequencies, and
   pitcher rhythm. Flag which BRAIN.stats values need a "post-2023" version.

For each verified or corrected value, output the exact JavaScript change to
make in BRAIN.stats, with source citation.
```

---

## MODULE 3: Build the Adaptive Learning Layer (Prompts 9–12)
*Goal: The system gets smarter the more someone plays*

---

### Prompt 9 — "Design the Mastery Tracking Schema"

```
Right now the app tracks which scenarios a player has seen and whether they
got them right or wrong (for spaced repetition). But a truly intelligent system
tracks CONCEPTS, not just scenarios.

Design a MASTERY_SCHEMA that tracks player understanding at the concept level:

1. CONCEPT MASTERY STATES
   - Unseen: concept not yet encountered
   - Introduced: seen once, answered correctly
   - Learning: seen 2+ times, mixed results
   - Mastered: correct 3+ times in a row across different scenarios
   - Degraded: was mastered, then answered wrong (needs re-introduction)

2. CONCEPT DEPENDENCY TRACKING
   Using BRAIN.concepts prerequisite graph, if a player fails a concept that has
   prerequisites, what should the system surface?
   - Example: player fails "relay positioning" → check if "cutoff basics" is mastered
   - If prereq not mastered → route to prereq first

3. ERROR PATTERN DETECTION
   - "Always bunts": player systematically over-selects bunt options
   - "Never steal": player never selects steal options even when correct
   - "Ignores count": player choices don't correlate with count data
   - "Position confusion": player assigns wrong fielder responsibilities
   Design 6-8 error patterns and what they indicate about conceptual gaps

4. ADAPTIVE PROMPT INJECTION
   When the AI generates a new scenario, what player mastery data should it
   receive to make the scenario optimally challenging?
   - Include: current weak concepts, mastered concepts to avoid over-testing
   - Include: error patterns to specifically address
   - Design the exact addition to the AI prompt template

5. SPACED REPETITION INTERVALS
   Using SM-2 or Leitner algorithm principles: what review intervals should apply?
   - Day 1 → Day 3 → Day 7 → Day 14 → Day 30 (standard spaced rep)
   - But for baseball: pre-season review mode (review everything before season starts)

Format the schema as a JavaScript object (MASTERY_SCHEMA) and the tracking
functions as Brain API additions. Show how it integrates with existing
smart recycling logic (Scenario Bible, Concept Re-teaching Policy section).
```

---

### Prompt 10 — "Design the Error Taxonomy and Feedback System"

```
When a player gets a scenario wrong, the current system gives them the correct
explanation. A smarter system tells them specifically WHAT TYPE of error they made
and addresses the root misconception.

Build an ERROR_TAXONOMY system:

1. ERROR CATEGORIES (with examples from our scenario types)
   a. RULE ERROR: player doesn't know the MLB rule
      - Example: says pitcher can be cutoff man
      - Response: cite the exact rule/principle
   
   b. DATA ERROR: player knows the rule but ignores the statistics
      - Example: bunts when RE24 says not to
      - Response: show the run expectancy comparison
   
   c. ROLE CONFUSION: player assigns the wrong responsibility to the wrong position
      - Example: says SS should cover first on a bunt
      - Response: show the position principle map
   
   d. PRIORITY ERROR: player knows both options but picks wrong priority
      - Example: corner outfielder calls off center fielder
      - Response: reinforce the fly ball priority hierarchy
   
   e. SITUATIONAL MISS: player knows the general rule but misapplied context
      - Example: steals on 3-0 count (catcher expecting it)
      - Response: explain situational awareness
   
   f. COUNT BLINDNESS: player ignores count in their decision
      - Example: aggressive approach on 1-2 count
      - Response: show count-based batting average data

2. FEEDBACK TEMPLATES
   For each error type: write a feedback template that:
   - Names the specific error type (age-appropriately)
   - Explains the correct principle
   - Cites the supporting data or rule
   - Gives a memorable anchor ("The relay man is ALWAYS an infielder — remember
     that the pitcher is sprinting to back up a base, not cut off a throw")

3. REMEDIATION ROUTING
   Map each error type to the concept tag it reveals as weak.
   Use this to populate the mastery schema from Prompt 9.

Format as ERROR_TAXONOMY JavaScript constant + feedback template strings
that can be injected into the AI prompt or used client-side.
```

---

### Prompt 11 — "Design the Coach Persona System"

```
Right now the coaching voice is generic. For ages 6-18, the coach's persona and
vocabulary should adapt to the player. Build a COACH_PERSONAS system:

1. THREE COACH PERSONAS (not just age-based — also style-based)

   COACH ROOKIE (ages 6-10, beginner):
   - Vocabulary: simple words, no stats, lots of analogies
   - Tone: hugely encouraging, celebrates every correct answer
   - Feedback style: "Great job! When the ball is hit to the outfield, the
     outfielder always calls it first because they're running toward the ball."
   - Never says: "Run expectancy," "leverage index," "wOBA"

   COACH VARSITY (ages 11-14, intermediate):
   - Vocabulary: introduces baseball terms, simple stats
   - Tone: encouraging but teaching-focused, uses real player names as examples
   - Feedback style: "Good instinct! Here's the data: stealing breaks even at 72%.
     With a slower catcher and a 3-1 count, you're well above that."
   - Uses: batting average, stolen base %, count leverage

   COACH SCOUT (ages 15-18, advanced):
   - Vocabulary: full baseball analytics
   - Tone: peer-to-peer, analytical, references real MLB decisions
   - Feedback style: "Right call. RE24 shows 0-2 with runner on 2nd: 1.07 runs.
     Expand the zone, induce weak contact — here's why that's higher EV than
     trying for the strikeout."
   - Uses: RE24, wOBA, LI, FIP, pitch tunnel concepts

2. PERSONA SELECTION LOGIC
   - Based on: player's age setting + their actual performance (if they're
     answering diff-3 questions correctly, upgrade their persona vocabulary)
   - Should auto-upgrade after X correct answers at current level

3. PERSONA INJECTION INTO AI PROMPT
   - Show exactly where in the AI prompt template to inject persona
   - Example: "Explain this scenario at a [PERSONA] level. [PERSONA_INSTRUCTIONS]"

4. COACH LINES BY PERSONA
   - Propose 5 new coach lines per persona for the COACHING.success,
     COACHING.warning, and COACHING.danger categories
   - These should sound distinctly different for each persona

Format as COACH_PERSONAS JavaScript constant + injection logic.
```

---

### Prompt 12 — "Design the Continuous Improvement Engine"

```
The most powerful brain doesn't just know things — it learns from what players
get wrong and gets better over time. Design the IMPROVEMENT_ENGINE:

1. SCENARIO QUALITY SCORING (automated)
   After every AI-generated scenario is played:
   - Track: answer distribution (if 90%+ pick option A, is the correct answer
     too obvious? If 5% pick the correct answer, is it too hard or poorly written?)
   - Flag scenarios where: correct answer rate < 20% (confusing) or > 90% (too easy)
   - Quality score = proximity to ideal 70% correct rate on first attempt

2. KNOWLEDGE GAP DETECTION (population-level)
   Across all players, which concepts have the lowest mastery rates?
   - These concepts need more scenarios, better explanations, or simpler prerequisites
   - Output: "Concept X has 35% mastery rate — need 3 more introductory scenarios"

3. EXPLANATION EFFECTIVENESS TRACKING
   - After getting an answer wrong and reading the explanation, does the player
     get it right next time?
   - Low explanation effectiveness = rewrite the explanation
   - Track by: position + concept + difficulty level

4. SCENARIO GENERATION FEEDBACK LOOP
   - Add a "Was this scenario confusing?" micro-feedback button
   - Track AI-generated scenarios that get reported
   - Pattern: if AI scenario about [topic] gets flagged 3+ times, add a guardrail
     to the AI prompt for that topic

5. ANNUAL KNOWLEDGE UPDATE PROTOCOL
   (Extends the Maintenance Protocol in SCENARIO_BIBLE.md Section 10)
   - What to check each off-season: new MLB rule changes, updated RE24 data,
     new Statcast metrics, coaching consensus shifts
   - Create a KNOWLEDGE_CHANGELOG format for documenting updates
   - Template for how to update BRAIN.stats with new season data

Format the improvement engine as both a SCENARIO_BIBLE.md Section 11 addition
(the policy/framework) and JavaScript constants/functions for index.jsx.
```

---

## MODULE 4: Expand the Scenario Universe (Prompts 13–16)
*Goal: 394 → 600+ scenarios with zero quality regression*

---

### Prompt 13 — "Fill the Position Imbalance"

```
Our scenario counts show a major imbalance (SCENARIO_BIBLE.md Appendix):
- Pitcher: 59, Batter: 58, Manager: 58 (these are rich)
- Catcher: 30 (decent)
- Shortstop: 16, CF: 16 (thin)
- All corner positions: 14-15 each (very thin)

The corner positions and secondary positions deserve more depth. Generate:

FOR EACH OF THESE POSITIONS: shortstop, second base, first base, third base,
left field, right field, center field

Identify the top 5 strategic concepts for that position that we DON'T yet have
a scenario for (check existing content in both documents).

Then produce the full scenario batch template (per Appendix B format) for:
- 5 new shortstop scenarios (focus: relay positioning, DP pivots, steal coverage, communication)
- 5 new second base scenarios (focus: DP pivot, relay, bunt coverage, hit-and-run reads)
- 5 new first base scenarios (focus: cutoff reads, scooping, pickoff tags, bunt defense)
- 5 new third base scenarios (focus: slow rollers, bunt crashes, line guarding, cutoff)

That's 20 new scenarios. Run the full Quality Checklist on all 20 before outputting.
```

---

### Prompt 14 — "Build the Situational Mastery Scenarios"

```
Our most powerful scenarios are ones where the SAME situation can have
DIFFERENT correct answers depending on one variable. Design a set of
"Variable Mastery" scenario clusters — each cluster has 3-4 versions of
the same base situation with one variable changed:

CLUSTER 1: The Relay Read
- Version A: Runner at 2B, single to LF, no outs — relay home? (yes)
- Version B: Same, but 2 outs — relay home? (still yes — just get the out)
- Version C: Same, but runner is very slow — relay home? (cutoff and hold)
- Version D: Same, but elite LF arm throwing to cutoff 3B — lesson: hit cutoff always

CLUSTER 2: The Steal Decision
- Version A: Fast runner, slow catcher, 2-0 count — steal? (yes)
- Version B: Same, but 0-2 count — steal? (no — don't take bat out of hitter's hands)
- Version C: Same, but runner is first, nobody out, your best hitter up — steal? (no)
- Version D: Double steal with 1st+3rd — when to go?

CLUSTER 3: The Bunt Call
- Version A: Runner on 1st, 0 outs, up by 3 runs — bunt? (no — RE24)
- Version B: Same, but tied game, 9th inning, weak 8 hitter up — bunt? (situational yes)
- Version C: Same, but pitcher hitting in a NL-style game — bunt? (yes)
- Version D: Safety squeeze vs. suicide squeeze — what's the difference?

CLUSTER 4: The Infield Depth Decision
- Version A: Runner on 3rd, 0 outs, close game — infield in? (explain the tradeoff)
- Version B: Same, but up by 4 runs — infield in? (definitely no)
- Version C: Same, but it's your ace pitcher and you need 3 outs — normal depth
- Version D: Runner on 3rd, 2 outs — infield position? (normal — force play)

For each cluster, produce all versions as full scenarios with options, best answer,
explanations, and rates. These clusters become the highest-difficulty scenarios
in each position's pool.
```

---

### Prompt 15 — "Build the Famous Moments Expansion"

```
We have 10 "famous" scenarios. These are our highest-engagement scenarios
because they connect strategy to real history. Expand to 25.

For each new famous scenario, the format is:
- A real historical moment in MLB (or notable college/minor league) history
- The strategic decision that made it famous
- Present it as a scenario: "It's [Year]. You're [player]. [Situation]."
- 4 options including what actually happened
- Explanation tied to the strategic principle it teaches

15 NEW FAMOUS SCENARIOS covering:
1. Kirk Gibson 1988 WS Game 1 — situation hitting, count leverage, pinch hit decisions
2. Bill Buckner 1986 WS Game 6 — first base fundamentals (be humble — teach what happened)
3. Babe Ruth called shot 1932 — psychological factors, count situation
4. Derek Jeter flip play 2001 ALDS — backup duties (pitcher backing up)
5. Don Larsen perfect game 1956 — pitch sequencing, game plan
6. 2004 ALCS Red Sox comeback — bullpen management, leverage
7. Merkle's Boner 1908 — appeal play, touch every base
8. Jackie Robinson steal of home — reading the pitcher, aggressive baserunning
9. Willie Mays "The Catch" 1954 — CF priority, angles, communication
10. 2016 WS Game 7 Rajai Davis HR — closer misuse (leverage index lesson)
11. Pete Rose bowling over Fosse 1970 ASG — catcher blocking, obstruction
12. 1969 Mets Tom Seaver masterclass — pitch sequencing, working counts
13. 2011 WS Game 6 (Freese walk-off) — two-strike approach, protecting the plate
14. Nolan Ryan's no-hitters — pitch mix, count leverage
15. Lou Gehrig's consecutive games — positional consistency lesson (lighter touch)

For each: full scenario format per Appendix B, cite the historical source,
and identify the strategic concept it teaches and its concept tag.
```

---

### Prompt 16 — "Build the Rules Edge Cases Library"

```
Our "rules" scenario pool (currently 8 scenarios) covers common rules.
Expand to 20 scenarios covering the rules that cause the most confusion
at youth, high school, and amateur levels:

PRIORITY RULES to add scenarios for:
1. Batting out of order — what happens, who's called out, when can it be appealed
2. Runner's lane interference — batter-runner running outside the lane to 1B
3. Catcher's interference — when catcher contacts batter's swing
4. Fan interference — what's a reviewable call, what's automatic dead ball
5. Ground rule double — all configurations (ball stuck in fence, fan reaches over, etc.)
6. Infield fly — all triggering conditions (less understood than people think)
7. Uncaught third strike with runner on 1B and <2 outs — batter is just out
8. Time play vs. force play at home — run doesn't count if third out is a force
9. Pinch runner rules — can original batter return? (no)
10. Designated hitter eligibility rules (post-2022 universal DH)
11. Pitch clock violations — batter vs. pitcher, who gets the penalty
12. Sticky stuff rules — enforcement process
13. Mound visit limits — when does a visit count

For each: full scenario format, Tier 1 source (MLB rule number), and
age-appropriate explanation. These scenarios should be diff 2-3 and
tagged with their concept ID.
```

---

## MODULE 5: Harden the System (Prompts 17–20)
*Goal: Bulletproof quality, zero regressions, self-maintaining*

---

### Prompt 17 — "Build the Automated Quality Firewall"

```
Right now our role violation detection (ROLE_VIOLATIONS regex) is the only
automated quality check. We need a comprehensive automated firewall.

Design QUALITY_FIREWALL — a set of automated checks that run on every
scenario (handcrafted or AI-generated) before it's accepted:

TIER 1 CHECKS (hard failures — reject the scenario):
1. Role violations: pitcher as cutoff, wrong cutoff assignment (extend ROLE_VIOLATIONS)
2. Fly ball priority violations: infielder has priority over outfielder
3. Force/tag errors: force described as tag or vice versa
4. Position impossibilities: catcher leaving home with RISP, SS covering 1B on bunt
5. Rule contradictions: anything contradicting MLB Official Rules

TIER 2 CHECKS (warnings — flag for human review):
6. Count inconsistency: scenario says "pitcher's count" but count is 2-1
7. RE24 contradiction: best answer contradicts clear RE24 guidance without explanation
8. Situation impossibility: e.g., "1 out in 1st inning" but scenario says "tying run"
9. Age-inappropriate vocabulary: advanced terms in diff-1 scenarios
10. Option overlap: two options are essentially the same choice

TIER 3 CHECKS (quality suggestions):
11. Explanation length: all 4 explanations should be roughly similar length
12. Concept teachability: does the best answer explanation actually explain WHY?
13. Success rate calibration: best answer should be 70-90%, worst should be <35%

For each check:
- Write the exact JavaScript validation function
- Define pass/fail/warn criteria
- Show where it integrates into the generateAIScenario() flow

Also: extend the MAP_AUDIT system (already in BRAIN_KNOWLEDGE_SYSTEM.md) to
include these checks as numbered audit items 30-40.
```

---

### Prompt 18 — "Build the Cross-Position Contradiction Detector"

```
With 394 scenarios across 15 position categories, contradictions can creep in.
A scenario about the catcher might describe a relay play differently than the
shortstop scenario about the same relay play.

Design a CONTRADICTION_DETECTOR system:

1. SCENARIO PAIRS THAT MUST AGREE
   Map out every pair of position scenarios that describe the same play from
   different angles. For each pair:
   - What they must agree on (the strategic outcome)
   - What they can legitimately differ on (each position's specific responsibility)
   
   Example pairs:
   - LF scenario about hitting cutoff ↔ 3B scenario about receiving the throw
   - SS relay scenario ↔ CF scenario about the same relay
   - Catcher pickoff call ↔ 1B pickoff reception scenario
   - Manager pitching change ↔ Pitcher being pulled scenario

2. CONSISTENCY RULES
   Define 10 multi-position consistency rules, e.g.:
   "If any position scenario describes the cutoff on a LF throw home as 3B,
    every other position scenario that references this same play must also
    identify 3B as the cutoff."

3. AUDIT QUERIES
   Write the actual cross-reference audit questions to run when adding a new scenario:
   - "Does this scenario reference a cutoff/relay assignment? If yes, verify
     it matches CUTOFF_RELAY_MAP exactly."
   - "Does this scenario reference fly ball priority? Verify it matches
     FLY_BALL_PRIORITY_MAP."
   - [8 more queries]

4. SCENARIO BIBLE SECTION UPDATE
   Add Section 9B: "Cross-Position Verification Protocol" with the 10 consistency
   rules and the audit queries as a standard operating procedure.

Output: the 10 consistency rules + audit queries as both a SCENARIO_BIBLE.md
section and a JavaScript CONSISTENCY_RULES constant.
```

---

### Prompt 19 — "Build the Living Document Update System"

```
Our knowledge system should update itself. Design the LIVING_DOCUMENT_PROTOCOL
that keeps the brain current year after year with minimal manual effort.

1. ANNUAL UPDATE CHECKLIST (extend SCENARIO_BIBLE.md Section 10)
   Create a specific checklist for what to audit each January:
   - MLB rule changes: where to find them (mlb.com/official-rules), what to check
   - RE24 data refresh: FanGraphs RE24 table update process, how to modify BRAIN.stats
   - Statcast metric updates: new metrics added to Baseball Savant
   - Coaching consensus shifts: ABCA annual reports, USA Baseball updates
   - Historical scenario verification: did any "famous" scenarios get new analysis?
   - Pitch clock adjustments: how steal windows have changed since 2023

2. NEW SEASON SCENARIO AUDIT
   When a new MLB season produces notable strategic plays:
   - Template for converting a real 2024/2025 game situation into a scenario
   - How to verify it against existing scenarios for contradictions
   - Fast-track quality checklist for timely additions

3. VERSION CONTROL PHILOSOPHY
   - BRAIN_VERSION constant (already exists in BRAIN_KNOWLEDGE_SYSTEM.md?)
   - How to track which scenarios were updated in each version
   - KNOWLEDGE_CHANGELOG format (what changed, why, source, date)
   - Deprecation process: when a rule change makes a scenario wrong

4. COMMUNITY IMPROVEMENT PIPELINE
   - If coaches/players report an error, what's the intake process?
   - How to distinguish "I disagree" (opinion) from "this is factually wrong" (error)
   - Resolution flow: flag → verify against hierarchy → update if Tier 1-2 source supports

Format as SCENARIO_BIBLE.md Section 11 (Living Document Protocol) +
add KNOWLEDGE_CHANGELOG and BRAIN_VERSION tracking to BRAIN_KNOWLEDGE_SYSTEM.md.
```

---

### Prompt 20 — "The World's Best Baseball AI Brain — Final Integration Audit"

```
This is the capstone prompt. After running Prompts 1-19, perform the
definitive quality and completeness audit of the entire system.

1. COMPLETENESS SCORECARD
   Grade the system (A/B/C/D/F) on each dimension:
   - Breadth: what % of real baseball situations are covered?
   - Depth: what % of strategic claims have data backing?
   - Adaptivity: how well does the system personalize?
   - Age-calibration: how well does vocabulary/complexity scale?
   - Self-maintenance: how automated is quality control?

2. COMPETITOR BENCHMARKING (update from Phase 1 Prompt 10)
   Given all additions in Phase 2, re-score vs competitors.
   Where are we definitively best-in-class? Where are gaps?

3. KNOWLEDGE HIERARCHY STRESS TEST
   Take 10 of our most complex scenarios (one per position) and run them
   through the full 4-tier knowledge hierarchy verification:
   - Does any claim contradict MLB Rules? (Should be zero)
   - Does any claim contradict Tier 2 data? (Should be zero)
   - Are all Tier 3 coaching points sourced?
   - Are all Tier 4 situational judgments presented as options, not absolutes?

4. AI PROMPT STRESS TEST (update from Phase 1 Prompt 6)
   With all new maps and additions, re-run the devil's advocate test.
   What new failure modes exist? What new guardrails are needed?

5. THE FINAL BRAIN SPEC
   Produce a "What This Brain Knows" document — a complete readable summary
   of the full knowledge system for:
   - A parent wondering if the app is accurate
   - A high school coach evaluating the system
   - A developer wanting to understand what's in the code
   
   This becomes the marketing/credibility document AND the technical reference.
   Output it as a standalone section to add to SCENARIO_BIBLE.md as Appendix C.
```

---

## Execution Order and Time Estimates

| Priority | Module | Prompts | Why Now | Estimated Sessions |
|----------|--------|---------|---------|-------------------|
| 🔴 CRITICAL | Module 1: Breadth | 1-4 | Gaps create wrong answers | 4 sessions |
| 🔴 CRITICAL | Module 2: Data | 5-8 | All claims need sources | 4 sessions |
| 🟡 HIGH | Module 3: Adaptive | 9-12 | Drives re-engagement | 4 sessions |
| 🟡 HIGH | Module 4: Scenarios | 13-16 | More content = more value | 4 sessions |
| 🟢 IMPORTANT | Module 5: Hardening | 17-20 | Protects quality at scale | 4 sessions |

**Recommended sequence**: Run Module 1 and 2 first (foundation accuracy), then alternate Module 3 and 4 (growth), then Module 5 (hardening).

---

## How to Use This Plan

Exactly like you used `CLAUDE_PROJECT_PROMPTS.md`:

1. Open your Claude project with SCENARIO_BIBLE.md and BRAIN_KNOWLEDGE_SYSTEM.md loaded
2. Run each prompt as a new conversation
3. For each output:
   - Copy JavaScript constants → paste into index.jsx
   - Copy SCENARIO_BIBLE.md sections → paste into SCENARIO_BIBLE.md
   - Copy POS_PRINCIPLES updates → paste into both documents
4. After each session, update the audit log in SCENARIO_BIBLE.md with what changed
5. Every 5 prompts, run a mini-consistency check: "Do the last 5 additions contradict each other?"

---

## The North Star Metric

You'll know the brain is "world's best" when:

> A high school baseball coach reads any explanation in the app and says  
> *"That's exactly right, and I couldn't have said it better."*

Every prompt in this plan is pointed at that outcome.
