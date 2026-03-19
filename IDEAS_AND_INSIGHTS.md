# BSM Ideas & Insights Log
## A living document of ideas, patterns, and future directions discovered while building

**Started:** 2026-03-19
**Purpose:** Capture every idea that surfaces during planning, building, and debugging — even half-formed ones. The best features come from noticing patterns while doing other work.

---

## ACTIVE IDEAS (Worth Building Eventually)

### 1. Concept Skill Tree (Visual Prerequisite Graph)
**Discovered while:** Building the placement test and realizing the prerequisite graph in BRAIN.concepts is invisible to players.

The 48 concepts have a dependency graph (e.g., `relay-double-cut` requires `cutoff-roles`). This is currently used only for scenario filtering. If visualized as an RPG-style skill tree, it would:
- Create clear goals ("I need to master X to unlock Y")
- Show progress visually (lit-up nodes vs grayed-out)
- Make the mastery system feel like character progression
- Give parents a tangible view of what their kid is learning

**Implementation:** SVG tree layout, nodes colored by mastery state, tap to see concept description. Could group by domain (defense, baserunning, pitching, strategy).

### 2. Position DNA Radar Chart
**Discovered while:** Thinking about what 13-year-olds would screenshot and share with teammates.

After 20+ plays per position, generate a radar chart showing concept strengths:
```
Your Catcher DNA:
  Framing: 90%
  Game Calling: 45%
  Blocking: 80%
  Steal Defense: 60%
  Leadership: 70%
```

This creates identity ("I'm a 90% framing catcher"), is inherently shareable (screenshot-worthy), and shows exactly where to improve. Could be the "Player Card" export feature — a visual card with DNA chart, Baseball IQ, and key stats.

### 3. Concept-Relative Difficulty
**Discovered while:** Auditing why diff:1 scenarios feel patronizing to 13-year-olds.

A diff:2 scenario should be easy for someone who's mastered all its prerequisites but hard for someone who hasn't. The static diff:1/2/3 system treats all players the same. A future system could compute "effective difficulty" per player per scenario:
```
effectiveDiff = baseDiff - (prereqsMastered * 0.3)
```
A diff:2 relay scenario is effectively diff:1 for someone who mastered cutoff-roles, but effectively diff:2.5 for someone who hasn't.

### 4. Time-Weighted Spaced Repetition
**Discovered while:** Reviewing the mastery system during the playtest audit.

Current mastery: "3 consecutive correct" regardless of time. But 3 correct today is different from 3 correct spread across 3 months. The spaced repetition intervals exist (1→3→7→14→30 days) but the decay model isn't aggressive enough. A player who was "mastered" 60 days ago with no review should degrade faster.

**Future:** Implement Ebbinghaus forgetting curve — retention = e^(-t/S) where S is stability. Each correct review increases S. This is what Anki uses and it's proven.

### 5. "What Would You Do?" Free-Response Mode
**Discovered while:** Thinking about what would make Tyler (18, D1 catcher) a daily user.

Instead of 4 options, show a situation and let the player explain their reasoning via text or voice. AI evaluates the REASONING, not just the choice. This tests understanding at a depth that multiple choice can't:
- "I'd throw to second because..." (reveals they understand the force play)
- "I'd hold the ball because..." (reveals they're thinking about the runner on third)

The BRAIN data and Claude Opus pipeline could evaluate these responses today. This is the leap from quiz to coaching.

### 6. Multi-Decision Scenario Sequences
**Discovered while:** Reviewing catcher scenarios and realizing real plays involve 4-5 simultaneous decisions.

A relay play involves: who catches, where to throw, who cuts, who backs up, where runners go. Breaking one scenario into a 3-step sequence would deepen learning:
1. "Ball hit to right-center gap. Who cuts?" → shortstop
2. "Runner rounding second. Where does SS throw?" → home
3. "Who backs up home plate?" → pitcher

This tests the CHAIN of decisions, not just one isolated choice. Could be a new mode: "Play Breakdown."

### 7. Coach Persona Matching
**Discovered while:** Noticing that coach voice is age-based but engagement is personality-based.

Some kids respond to encouragement ("Great job!"), others to analysis ("The data shows..."), others to aspiration ("A real pro would..."). Currently the coach persona is fixed by age group. Track which coach messages correlate with continued play:
- If a player keeps playing after analytical messages → lean analytical
- If a player quits after analytical messages → switch to encouragement

This is A/B testing at the individual level.

### 8. Game Film Mode [SHIPPED 2026-03-19]
**Discovered while:** Thinking about the field visualization being underutilized.

After answering, ANIMATE the correct play on the SVG field in slow motion. Show the runner moving, the ball being thrown, the fielder shifting position. The player sees what the RIGHT answer looks like in motion. This bridges the gap between "knowing the answer" and "seeing the play."

The multi-stage animations we built in the graphics overhaul are the foundation for this. We'd need to map each scenario's correct answer to a custom animation sequence.

### 9. "Why Wrong" Taxonomy
**Discovered while:** Building the adaptive difficulty system and thinking about what "wrong" means.

Not all wrong answers are equal:
- **Knowledge gap:** Player doesn't know the rule/concept → needs teaching
- **Instinct override:** Player knows the right play but picks the exciting one → needs discipline coaching
- **Reading error:** Player misread the situation description → needs slower pacing
- **Careless:** Player was rushing (especially in Speed Round) → not a knowledge issue

Tracking which TYPE of wrong answer a player makes would allow much more targeted coaching. The option rates partially capture this (rate:40 = "reasonable but wrong" vs rate:10 = "completely off") but the taxonomy isn't explicit.

### 10. Seasonal Content Drops
**Discovered while:** Thinking about long-term retention beyond the first 2 weeks.

Baseball has natural content cycles:
- **Spring Training** (March): Fundamentals, conditioning decisions
- **Regular Season** (April-August): In-game strategy
- **Playoffs** (October): High-leverage situations, bullpen management
- **Offseason** (Nov-Feb): Rules knowledge, historical situations, preparation

Monthly content drops (20 new scenarios + a themed challenge) would give players a reason to return even after exhausting current content. AI generation makes this cheap.

---

## OBSERVATIONS (Patterns Noticed)

### O5: scoreScenarioForLearning Is the Real Difficulty Engine, But It Has Blind Spots
**Discovered while:** Deep-reading the weighted scenario selection system (lines 14097-14185).

The `scoreScenarioForLearning` function (6 factors, ~75 lines) is doing sophisticated work: spaced repetition priority, concept state weighting, wrong-answer boosting, session coherence, difficulty calibration, and prerequisite readiness. But it operates entirely at the **scenario selection** level -- it picks WHICH scenario to show. It never adjusts HOW a scenario is presented. The same diff:2 scenario renders identically whether the player is a first-timer or a veteran with 200 games played.

Specific blind spots:
- **No time-of-day awareness.** A kid playing at 6 AM before school vs 9 PM after practice has different cognitive bandwidth. The system treats them identically.
- **No session fatigue tracking.** Play #2 of a session and play #15 get the same difficulty. Cognitive load increases with each consecutive decision. The `sessionRef` tracks plays/correct but never feeds this back into scenario selection.
- **No domain transfer detection.** If a player masters `cutoff-roles` for catcher scenarios, the system doesn't recognize they likely understand cutoff concepts for outfield scenarios too. Each position is scored independently.
- **The "mastered" penalty is too harsh.** `stateScores={mastered:0}` means mastered concepts get zero concept-state priority. But mastered concepts presented in new situations (e.g., cutoff roles in a rare 1st-and-3rd play) provide legitimate challenge. The system conflates "mastered the concept" with "mastered every scenario containing that concept."

### O6: detectErrorPatterns Is Good But Thinks Like a Database, Not a Coach
**Discovered while:** Reading the 7 error patterns (lines 7088-7118) and thinking about what a real baseball coach watches for.

The current 7 patterns are all **content-based**: always bunts, never steals, count blindness, position confusion, force/tag confusion, priority inversion, RE24 resistance, late-game blindness. These are genuinely useful. But a coach watching a player also notices:

Patterns it SHOULD detect but doesn't:
- **"Anchor bias"** -- always picking option A (or always B). Some kids develop a positional preference in multiple choice. Track the distribution of chosen indices across sessions.
- **"Complexity avoidance"** -- consistently picking the shortest/simplest option text. The player is scanning for the "easiest" answer rather than reading all four.
- **"Overthinking"** -- consistently wrong on diff:1 but right on diff:2. The player second-guesses themselves on easy questions.
- **"Situation blindness"** -- getting the concept right when it appears in isolation but wrong when combined with game situation (e.g., knows force-vs-tag but fails when it comes up during a late-game scenario with pressure). The session history tracks `lateClose` but doesn't cross-reference it with concept accuracy.
- **"Position tunnel vision"** -- a player who plays 80% pitcher scenarios is missing the broader picture. The recommendation engine flags unplayed positions but doesn't detect narrowing interest.
- **"Explanation skip"** -- the `explanationReadTimeMs` is tracked for AI scenarios but not for handcrafted ones. If a player consistently skips explanations (advances in <2 seconds), they're not learning from mistakes.

### O7: The Prerequisite Graph Is a Hidden Gem That Could Power Everything
**Discovered while:** Tracing how `getPrereqGap` (line 7078) and `isConceptReady` (line 7389) interact with the 48-concept graph in BRAIN.concepts.

The prerequisite graph is currently used in three places: (1) `filterByReadiness` gates scenarios whose prereqs aren't mastered, (2) `getPrereqGap` identifies which prerequisite to route to after a failure, (3) `scoreScenarioForLearning` Factor 6 boosts concepts whose prereqs just mastered. But the graph contains richer information than any of these uses extract:

- **Depth in the graph = sophistication.** A concept 4 levels deep (e.g., `win-probability` requires `leverage-index` requires `bunt-re24` requires understanding RE24) is fundamentally harder than a root concept. This "graph depth" is never computed or used.
- **Breadth of prerequisites = cognitive load.** `relay-double-cut` requires `cutoff-roles` (one prereq) while concepts with 2-3 prereqs demand synthesizing multiple ideas. This predicts difficulty better than the static diff:1/2/3 rating.
- **Concept clusters emerge naturally.** The defense domain, baserunning domain, and strategy domain form distinct subgraphs. A player's "readiness" for a domain could be computed as "% of that domain's graph unlocked."

### O8: enrichFeedback Has Rich BRAIN Data That Never Feeds Back Into Adaptation
**Discovered while:** Reading enrichFeedback (lines 7540-7606) and counting the BRAIN functions it calls.

`enrichFeedback` calls `getRunExpectancy`, `getCountIntel`, `getPressure`, `evaluateBunt`, `evaluateSteal`, `getWinContext`, `evaluateDefensiveAlignment` -- all of which produce numeric outputs (RE24 values, pressure scores, win probability, leverage index). These are displayed to the player as insights. But NONE of this rich contextual data is stored in `sessionHistory` or used by `detectErrorPatterns` or `scoreScenarioForLearning`.

Example: if a player consistently gets high-pressure scenarios wrong (pressure >= 80) but aces low-pressure ones, that's a clear signal the system could use. The `getPressure` function already computes this. It just throws the value away after displaying it.

Similarly, `getPlayerDifficultyLevel` (line 14081) computes accuracy and can detect "ready_for_harder" or "too_hard" states -- but this function is defined and never called from the core game loop. It exists as dead code waiting to be wired in.

### O9: The Cold Start Problem Has a Partial Solution That Stops Too Early
**Discovered while:** Tracing a new player's first 20 games through the code.

The current cold-start handling:
- Games 1-5: `firstPlayDiversity` ensures no repeat concepts (line 14230). Placement test for ages 11+ on first position play. Age-based concept gates.
- Games 6+: Full weighted selection kicks in, but `scoreScenarioForLearning` returns mostly baseline scores because there's minimal mastery data, minimal wrongCounts, and minimal scenarioCalibration.

The gap: Games 6-20 are the **most critical retention window** and the system essentially runs on random selection with slight spaced-repetition biases. The session planner (`planSession`) only activates for AI scenarios (Pro users), meaning free-tier players in the critical retention window get zero session planning.

The placement test (lines 14278-14296) is smart -- 2 diff:1 + 2 diff:2 + 1 diff:3 scenarios to calibrate. But it only fires once per position and stores a single difficulty level. It doesn't create a "learning profile" that could inform the next 20 games.

### O10: Two Systems Fight Over Difficulty Without Talking to Each Other
**Discovered while:** Mapping all the places difficulty is determined.

There are at least 5 independent difficulty mechanisms:
1. **`maxDiff`** from AGE_GROUPS (hard cap: ages 6-8 get diff:1 only)
2. **`posGrad`** for ages 6-8 (per-position graduation to diff:2 after 5 plays at >70%)
3. **`placementDiff`** for ages 11+ (placement test sets starting difficulty)
4. **`scoreScenarioForLearning` Factor 5** (scenario calibration, sweet-spot targeting)
5. **`wrongStreak >= 3`** in the AI session planner (drops to remediation)
6. **`planSession`** type ordering (remediation -> prerequisite -> progression -> challenge)

These systems don't communicate. A player could be `placementDiff:3` (placed at hardest) but `wrongStreak:4` (failing badly) and the handcrafted scenario selector doesn't know about the wrong streak because it only checks `scoreScenarioForLearning`, which doesn't factor in streak data. The wrong-streak drop only applies to AI scenarios via the session planner.

### O11: The "Boredom" Signal Is Partially Captured but Never Used
**Discovered while:** Looking at `scoreAIScenario` (line 7222) and its response time analysis.

`scoreAIScenario` already identifies concerning patterns: `responseMs < 3000` (too fast, random clicking) and `explanationReadTimeMs < 1500` (skipped explanation). These are computed and stored in `aiHistory` for quality scoring. But this data is never used to adjust the player's experience in real-time:
- 3 consecutive <3s answers could trigger a "Hey, slow down and read!" coach message
- Consistently skipped explanations could trigger shorter, punchier explanation format
- A pattern of immediate-click-then-long-read on the explanation could indicate the player is using trial-and-error instead of thinking first

The `outcomeStartRef` timestamp (line 14776) captures when the outcome screen appears and is used to compute explanation read time for AI scenarios. But it's not captured for handcrafted scenarios, which means 85%+ of plays have no engagement timing data.

### O1: The Quiz Format Ceiling
Both playtests converged on "feels like a quiz after 10 plays." The core loop (read→pick→read) is inherently limited. The ideas above (free response, multi-decision sequences, game film) all address this from different angles. The next major engagement leap requires breaking the 4-choice format.

### O2: Social is the Missing Multiplier
Every competitive player (Marcus, Tyler) wanted to compete against real people. The challenge-a-friend system is async and buried. Real-time head-to-head would be transformative but requires WebSocket infrastructure. A simpler step: weekly team leaderboards where coaches can see their team's aggregate performance.

### O3: The Brain is Underleveraged
The BRAIN constant has pitch count fatigue matrices, matchup data, park factors, wind effects — none of which the player ever sees directly. The "Show Data" button reveals fragments. A "Baseball Brain" section where players can EXPLORE the data (not just receive it passively) would be both educational and sticky.

### O4: Parents Are the Distribution Channel
One coach = 15 players = 30 parents. The parent report exists but is behind a math gate and looks like a grade school report card. If the parent report was a weekly EMAIL showing "Your child learned 3 new concepts this week, practiced for 45 minutes, and improved their Catcher DNA from 60% to 72% on game calling" — parents would forward that to other parents.

---

## ADAPTIVE DIFFICULTY ENGINE: IDEAS & WARNINGS

### Idea A1: Unified Player State Vector (The Missing Abstraction)
**Priority: Foundational -- build this first, everything else depends on it.**

Right now, difficulty-relevant data lives in 6+ disconnected places: `wrongStreak`, `scenarioCalibration`, `masteryData.concepts`, `ps` (per-position stats), `wrongCounts`, and `sessionRef`. The adaptive engine needs a single computed object -- call it `playerState` -- that synthesizes all signals into one snapshot, recomputed every N plays:

```
playerState = {
  overallAccuracy: 0.62,         // last 30 plays
  sessionAccuracy: 0.50,         // this session only
  sessionLength: 8,              // plays this session
  wrongStreak: 2,                // current consecutive wrong
  bestStreak: 7,                 // session best
  cognitiveLoad: 'medium',       // derived from session length + time between plays
  engagementSignal: 'engaged',   // derived from response times + explanation reads
  conceptEdge: ['steal-breakeven', 'dp-positioning'],  // concepts at ZPD boundary
  frustrationRisk: 0.3,          // 0-1, derived from wrong streak + response time acceleration
  boredomRisk: 0.1,              // 0-1, derived from fast answers + skipped explanations
  readyForChallenge: true,       // 3+ correct on current difficulty
  pressurePerformance: -0.12,    // accuracy delta in high-pressure vs low-pressure scenarios
}
```

This object becomes the single input to all adaptation decisions. Every system reads from the same truth.

### Idea A2: Session Energy Curve (Don't Serve the Hardest Scenarios on Play #12)
**Insight from:** Observation O5 about session fatigue.

Cognitive research shows that decision quality follows a curve within a session: rising for the first few decisions (warm-up), peaking around plays 3-7, then gradually declining. The ideal session structure is:

- **Plays 1-2:** Warm-up. Serve a mastered concept at current difficulty. Get the player into flow with 80%+ expected accuracy. This is equivalent to a batter taking warm-up swings.
- **Plays 3-7:** Challenge zone. Serve learning/introduced concepts at the zone of proximal development. This is where real growth happens. Mix in the session planner's progression items.
- **Plays 8-12:** Sustained challenge, but watch for fatigue signals (increasing response time, declining accuracy). If accuracy drops below 40% in this window, ease off.
- **Plays 13+:** Cool-down. Return to mastered concepts for confidence, serve interesting "famous play" or "rules" scenarios for variety. Stop pushing new concepts.

Implementation: `scoreScenarioForLearning` gains a `sessionPhase` input derived from `sessionRef.current.plays`. Factor 2 (concept state priority) is modulated by phase -- "introduced" concepts get deprioritized in phases 1 and 4, boosted in phases 2-3.

### Idea A3: Micro-Difficulty Dimensions Beyond diff:1/2/3
**Insight from:** Question 6 about dimensions of difficulty.

The static diff:1/2/3 system collapses multiple difficulty axes into one number. An adaptive engine could manipulate these independently:

1. **Conceptual complexity** (how many concepts intersect in the scenario) -- already partially captured by the prerequisite graph depth.
2. **Option ambiguity** (how close the wrong answers' rates are to the correct answer) -- a scenario where the best rate is 85% and the runner-up is 60% is less ambiguous than one where they're 72% and 68%. This is already in the data (every scenario has `rates` for each option).
3. **Situation complexity** (how many game-state variables matter) -- bases empty + 0 outs is simpler than runners on 1st and 3rd + 1 out + late innings + 1-run game.
4. **Reading load** (character count of scenario text + options) -- genuinely matters for ages 6-10. Some diff:1 scenarios have twice the text of others.
5. **Time pressure** (relevant in Speed Round) -- already has age-adjusted timers but could adapt within a session based on accuracy.

The `scoreScenarioForLearning` function could compute an "effective difficulty" score using these dimensions and the player's profile, then target the sweet spot (40-70% expected accuracy) more precisely than the current 3-level system.

### Idea A4: Pressure Performance Profiling
**Insight from:** Observation O8 about enrichFeedback's unused data.

Store `getPressure(scenario.situation)` in each `sessionHistory` entry alongside `correct`. After 20+ plays with situation data, compute a "pressure performance curve":

```
pressurePerformance = {
  low (0-30):    72% accuracy   // calm situations
  medium (31-60): 65% accuracy  // some stakes
  high (61-80):   48% accuracy  // high stakes
  clutch (81+):   35% accuracy  // championship moments
}
```

This tells you something profound about the player that none of the current systems capture. A player who crumbles under pressure needs different training than one who thrives in it. The coach lines already adapt to pressure (`getSmartCoachLine` has hot/cold streak messages) but the scenario SELECTION doesn't consider whether this player needs more or fewer high-pressure scenarios.

**Implementation:** Add `pressure: getPressure(sc.situation)` to the `shEntry` object at line 14814. Then `detectErrorPatterns` gains a new pattern: `pressure-sensitivity` when high-pressure accuracy is 20+ points below low-pressure accuracy.

### Idea A5: The 3-Wrong Pivot (Already Half-Built)
**Insight from:** Observation O10 about disconnected difficulty systems.

The `wrongStreak >= 3` cold-streak handler (line 14493) only fires for AI scenarios in the session planner. But the cold-streak coach message fires for all scenarios (line 7627). The player HEARS "let's go back to basics" but the next handcrafted scenario is selected by `weightedPick` which has no idea about the wrong streak.

**Fix:** Pass `wrongStreak` into `scoreScenarioForLearning` as a 7th factor. When wrongStreak >= 3:
- Boost diff:1 scenarios by +25
- Boost "mastered" state concepts by +15 (confidence rebuilding)
- Penalize diff:3 and "unseen" concepts by -20
- Boost scenarios whose prerequisite is the concept the player just failed on

This connects the coach's words to the system's actions. When the coach says "let's slow down," the system actually slows down.

### Idea A6: Engagement-Responsive Explanation Length
**Insight from:** Observation O11 about the boredom/disengagement signals.

Track explanation read time for ALL scenarios (not just AI). The `outcomeStartRef` already records when the outcome screen appears. Add a simple computation when the player clicks "Next":

```
const readTimeMs = Date.now() - outcomeStartRef.current;
// Store in a rolling window of last 10 explanation read times
```

If the rolling average drops below 3 seconds, the player is skipping explanations. Possible responses:
- Switch to `explSimple` (shorter explanations) even for players outside the 6-10 age range
- Add a "Did you know?" callout with one surprising fact (breaking the pattern of skip-skip-skip)
- Increase the frequency of visual feedback (animations, field movement) over text
- In extreme cases, suggest the player try Speed Round (where skipping is normal)

### Idea A7: Frustration Detection and Rescue
**Insight from:** Question 7 about negative patterns.

Define a "frustration score" computed in real-time:
```
frustration = (wrongStreak * 0.3) + (recentAccuracy < 0.3 ? 0.3 : 0) + (responseTimeAccelerating ? 0.2 : 0) + (sameConceptWrongTwice ? 0.2 : 0)
```

When frustration > 0.6, trigger a "rescue" intervention:
1. Serve a guaranteed-easy scenario (diff:1, mastered concept) -- the baseball equivalent of a coach calling timeout
2. Show an encouraging coach message with a specific, actionable tip
3. If the player gets the rescue scenario right, show a streak-starter animation
4. Track that a rescue fired (to avoid firing too often -- max 1 per session)

When frustration > 0.8 AND session length > 8, show a gentle session-end suggestion: "Great practice today! Come back tomorrow when you're fresh." This is what a good coach does -- they don't let a frustrated player keep grinding.

### Idea A8: Cold Start Bootstrapping with "Baseball Background" Questions
**Insight from:** Observation O9 about the cold start gap in games 6-20.

The placement test (5 scenarios) is a good start but only covers one position. For the critical games 6-20 window, consider a 3-question "baseball background" survey during onboarding (after age selection):

1. "Do you play on a team?" (Yes/No/I used to) -- team players know fundamentals
2. "What position do you play?" (list) -- start them there for familiarity
3. "Have you heard of 'run expectancy'?" (Yes/Kinda/No) -- gauges analytics exposure

This costs 15 seconds of the player's time but gives the adaptive engine a starting point:
- Team player + position = start with that position's diff:2 scenarios
- Non-player = start with universals (batter, baserunner) at diff:1
- Analytics-aware = unlock data-heavy concepts faster

This is cheaper than inferring the same information over 20 games of play.

### Idea A9: Cross-Position Concept Transfer
**Insight from:** Observation O5 about domain transfer detection.

The same concept appears in multiple positions' scenario pools. `cutoff-roles` has scenarios in pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, leftField, centerField, rightField. If a player masters `cutoff-roles` by playing catcher scenarios, they understand the concept -- but the system treats their mastery as zero when they switch to shortstop.

The mastery system already tracks concepts globally (not per-position). But `filterByReadiness` and `scoreScenarioForLearning` don't factor in WHICH position the mastery was earned in. A smarter system would:
- Track concept mastery globally (already done)
- But when a concept appears in a NEW position for the first time, serve it at one difficulty level LOWER than the player's mastered level
- This tests "Can you apply cutoff knowledge from the catcher's perspective to the shortstop's perspective?" -- which is exactly what real coaches drill

### Idea A10: The "Why Did You Pick That?" Optional Reflection
**Insight from:** The gap between `classifyError` (which guesses WHY the player was wrong) and actual player reasoning.

After a wrong answer, before showing the explanation, optionally ask: "What made you pick that?" with 3-4 quick-tap options:
- "I wasn't sure about the rules"
- "I thought the situation called for it"
- "It seemed like the safest play"
- "I just guessed"

This takes 2 seconds and gives the adaptive engine a massive signal boost. A player who says "I just guessed" needs teaching. A player who says "I thought the situation called for it" has a reasoning error that needs different correction. The `ERROR_TAXONOMY` already classifies errors, but it classifies based on the ANSWER, not the player's REASONING.

**Implementation warning:** Only show this 20% of the time (not every wrong answer) to avoid fatigue. And only after the player has 10+ games (don't add friction to the onboarding window).

### Warnings: Things That Could Go Wrong With Adaptive Difficulty

**W1: The Difficulty Death Spiral.**
If the system detects a player is struggling and drops difficulty, the player might NOTICE the system "going easy on them" and feel patronized. Kids ages 11-15 are especially sensitive to this. The difficulty adjustments must be invisible -- present easier scenarios as equally legitimate challenges, not as "baby mode." The coach message framing matters enormously: "Let's focus on fundamentals" is good, "Let me give you an easier one" is devastating.

**W2: The Optimization Trap.**
An adaptive system that optimizes for 60% accuracy will, over time, give every player the same experience: medium difficulty forever. The player never feels the thrill of acing a hard scenario or the useful sting of a challenging failure. The system needs deliberate "stretch" moments (planned hard scenarios) and "confidence" moments (planned easy scenarios) even when the accuracy optimization says to stay in the middle.

**W3: Overfitting to Small Samples.**
With 8 free plays per day, the system gets very little data per session. Making aggressive difficulty adjustments based on 3-5 plays risks overfitting to noise. A player who misses 3 in a row might just be distracted, not struggling with the concepts. The `scenarioCalibration` requires 2+ attempts per scenario before adjusting -- good. But `wrongStreak >= 3` triggers remediation immediately. Consider a confidence threshold: only adjust if the signal is statistically meaningful (e.g., 5+ plays in the current session before session-level adjustments kick in).

**W4: localStorage Bloat.**
Every new tracking dimension adds to the `bsm_v5` localStorage object. `scenarioCalibration` already stores per-scenario performance for 644 scenarios. Adding per-scenario response times, pressure scores, and engagement metrics could push the localStorage size past browser limits (typically 5-10 MB). Consider: (1) Only store the last N plays' detailed data, (2) Compute and store aggregates rather than raw events, (3) Move to IndexedDB for heavy data (but this breaks the current simple persistence model).

**W5: The A/B Testing Interaction Problem.**
There are already 9 active A/B test configs. An adaptive difficulty engine adds another variable that interacts with all of them. If `ai_temperature` variant B produces harder scenarios AND the adaptive engine drops difficulty for struggling players, you can't tell which effect caused the change in engagement. Either: (1) treat adaptive difficulty as a single A/B test and hold other configs constant during rollout, or (2) accept that interaction effects will be uninterpretable and rely on long-term retention metrics instead of per-session measurements.

**W6: Age Group vs. Skill Level Tension.**
The current system uses age as a hard gate (6-8 year olds CANNOT see diff:3 scenarios, certain concepts are forbidden). But a talented 8-year-old who plays travel ball might be more skilled than a casual 14-year-old. The adaptive engine should never override age-based CONTENT gates (some concepts genuinely don't apply to younger leagues) but could relax DIFFICULTY gates based on demonstrated performance. The `posGrad` system does this narrowly for ages 6-8 -- consider extending it to all age groups.

---

## FUTURE ARCHITECTURE NOTES

### N1: The Single-File Ceiling
At 17,400 lines, index.jsx is pushing the limits of a single-file architecture. The adaptive difficulty system, concept skill tree, and position DNA would each add 200-400 lines. The Next.js port (Phase 3 on roadmap) becomes more urgent with each feature. Consider: what's the minimal extraction that buys the most headroom? (Answer: BRAIN + knowledge maps into a separate file loaded at startup.)

### N2: Real-Time Infrastructure
WebSocket support (for multiplayer, live coaching, team features) requires a different infrastructure model than the current request/response Worker. Cloudflare Durable Objects could handle this without leaving the Cloudflare ecosystem. Worth investigating when multiplayer becomes priority.

### N3: The 70B Model Opportunity
The fine-tuned 70B model is sitting on HuggingFace doing nothing. If wired in, it could power:
- Faster AI scenario generation (cheaper than Opus/Grok)
- The "What Would You Do?" free-response evaluation
- Coach persona generation (personalized coaching messages)
- Scenario difficulty calibration (AI rates how hard a scenario is for a specific player)

---

*This document grows with every build session. Ideas marked with [SHIPPED] when implemented.*
