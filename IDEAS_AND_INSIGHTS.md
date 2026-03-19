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

---

## GAME FILM MODE INSIGHTS

**Date:** 2026-03-19
**Context:** Deep analysis of the Field component (lines 12630-13316), all 22 animation types, scenario-to-anim mapping, outcome screen layout, and educational design considerations for a "Game Film Mode" replay feature on the outcome screen.

---

### 1. ANIMATION TYPE AUDIT: What We Have and How Good It Is

The Field component renders 22 distinct animation types. They break into three quality tiers for replay purposes:

**TIER 1 -- "REPLAY-READY" (tell a clear visual story, multi-stage, already educational)**

| Anim | Count | What It Shows | Replay Quality |
|------|-------|---------------|----------------|
| `steal` (success) | ~35+ | Dust burst at 1B, runner sprints to 2B, catcher throw arrives late, slide dust, SAFE text | Excellent -- 4-stage sequence with timing tension (runner vs throw). A kid can SEE why stealing works. |
| `score` (success) | ~25+ | Dust at 3B, runner sprints home, slide dust, SAFE text | Good -- shows the race to home plate. Missing: the throw that was too late. |
| `doubleplay` (success) | ~15+ | Contact flash, ball to 2B, catch flash, relay to 1B, catch flash, DOUBLE PLAY text | Excellent -- the signature two-part throw is perfectly visualized. Best animation for replay. |
| `hit` (success) | ~75+ | Contact flash, ball trail + ball arc to outfield, dust at takeoff, runner to 1B, BASE HIT text | Good -- full sequence of contact-flight-baserunning. |
| `relay` | 0 in scenarios | OF to cutoff to home, three-stage throw with catch flashes | Excellent animation but ZERO scenarios use it. This is the "throw to the cutoff man" play that should be the most-used animation for outfield/infield scenarios. Major gap. |
| `squeeze` | 0 in scenarios | Runner from 3B + bunt dribble + outcome text | Good two-action animation, but unused in scenario data. |
| `groundout` (success) | ~50+ | Contact flash, ball bounces to fielder, dust at bounce, scoop flash, throw to 1B, catch flash, OUT text | Excellent -- 5-stage sequence showing the full defensive play. |

**TIER 2 -- "WATCHABLE" (show the key action but lack multi-stage storytelling)**

| Anim | Count | What It Shows | Replay Quality |
|------|-------|---------------|----------------|
| `strike`/`strikeout` (success) | ~65+/~15+ | Pitcher release flash, ball spin trail, ball to catcher, glove pop, POP text, STRIKE/STRUCK OUT text | Good -- shows pitch flight. Missing: pitch movement (curve, slider break). All pitches travel in a straight line. |
| `flyout` (success) | ~10+ | Contact flash, ball trail, ball arcs to OF, catch flash, CAUGHT text | Decent -- similar to `hit` but less exciting. The OF catch is the key moment. |
| `catch` (success) | ~60+ | Ball trail, ball drops to fielder, glove flash, GOT IT text | Simple -- just a ball arriving at a glove. No context about who threw it or why. |
| `bunt` (success) | ~30+ | Soft contact flash, ball dribbles forward, runner breaks for 1B, BUNT text | Good -- two-action (ball + runner) shows the sacrifice concept. |
| `throwHome` | ~40+ | Dashed throw trail from 2B to home, ball arrives, catch flash | Decent -- shows the throw path. Missing: the runner it is trying to beat. No narrative tension. |
| `advance` (success) | ~25+ | Dust at 1B, runner sprints to 2B, ADVANCING text | Simple -- just a runner moving. No context for WHY they advance. |
| `walk` (success) | ~8+ | Runner trots to 1B, BALL FOUR text | Minimal -- a slow jog. Not visually interesting but conceptually important. |
| `pickoff` | 0 in scenarios | Pitcher throws to 1B, dive-back dust, outcome text | Good animation, but unused. |
| `wildPitch` | 0 in scenarios | Ball past catcher, runner advances from 1B to 2B | Decent two-stage but unused. |
| `hitByPitch` | 0 in scenarios | Ball hits batter, impact flash, walk to 1B | Good animation but unused. |

**TIER 3 -- "ABSTRACT" (visual effect or symbol, not a physical play)**

| Anim | Count | What It Shows | Replay Quality |
|------|-------|---------------|----------------|
| `safe` (success) | ~15+ | Slide dust, expanding green ring, SAFE text | Pure celebration effect. No ball, no throw, no context. |
| `freeze` (success) | ~30+ | Warning pulse ring, warning emoji, FREEZE text | Abstract warning. There is nothing physical to replay -- this represents a decision NOT to act. |
| `tag` | 0 in scenarios | Slide dust + tag flash at a fixed point | Minimal -- just a contact moment. |
| `popup` | 0 in scenarios | Contact flash, ball pops high then descends, catch flash, INFIELD FLY text | The ball path is physically interesting (high pop then return) but unused. |

**FAILURE ANIMATIONS (7 types):**
The code has explicit failure versions for: `strike/strikeout`, `steal`, `hit`, `groundout`, `flyout`, `bunt`, `score`. These show what goes WRONG (e.g., failed steal = runner gets tagged out, ball beats him). These are potentially MORE educational than success animations because they show consequences. Currently they only play when `outcome !== "success"` AND the anim prop is set. But due to the gating bug described below, they can never actually render in the current code.

---

### 2. CRITICAL FINDING: Animation Gating Bug

Line 16660: `anim={od?.isOpt?sc.anim:null}`

This means the Field component ONLY receives an animation type when the player chose the optimal answer (`od.isOpt === true`). If the player chose poorly, `anim` is `null` and no animation plays at all. This has two consequences:

1. **The 7 failure animations (steal-fail, hit-fail, etc.) can never render.** They require `outcome !== "success"` AND `anim` to be set, but the code nulls out `anim` for non-optimal choices.
2. **Game Film Mode's core purpose is to show the correct play when the player got it wrong.** The current gating logic is the exact opposite of what Game Film Mode needs. The replay must pass `sc.anim` to Field regardless of `od.isOpt`, with `outcome="success"` to trigger the success animation path.

---

### 3. SCENARIO-TO-ANIMATION COVERAGE

**Total handcrafted scenarios:** 644
**Every scenario has an `anim` field** -- no gaps in coverage.

**UNUSED ANIMATION TYPES (defined in code but zero scenarios reference them):**
- `relay` -- the multi-throw OF-to-cutoff-to-home play
- `pickoff` -- pitcher throws to base
- `squeeze` -- suicide/safety squeeze
- `wildPitch` -- ball gets past catcher
- `hitByPitch` -- batter gets plunked
- `tag` -- fielder applies tag
- `popup` -- infield fly

This is a significant gap. These 7 animations were added in "Sprint 5" but no scenarios were updated to reference them. The `relay` animation in particular is perfect for outfield/infield cutoff scenarios, which currently use generic `throwHome` or `catch` instead.

---

### 4. WHAT MAKES REAL BASEBALL REPLAYS EFFECTIVE (TV Broadcast Analysis)

When a broadcast shows a replay, it uses several techniques the current SVG system could approximate:

**Already possible with SVG:**
- **Slow motion:** Simply double/triple the SMIL `dur` values. A 0.5s throw becomes 1.5s. The spline easing curves would naturally look better at slow speed.
- **Trajectory lines:** Show the ball's full path as a dashed/dotted line before or during the animation. The `throwHome` animation already does this (line 13098: dashed trail from 2B to home). Extend to all ball-flight animations.
- **Circle highlights:** Draw a pulsing circle around the key player/base before the action begins. The `ring` prop on `Guy` already does this with a golden ring animation.
- **Text annotations:** "Watch the shortstop" or "See how the throw beats the runner" as timed text overlays during the replay. SVG `<text>` with SMIL timing.
- **Arrow overlays:** SVG `<path>` arrows showing ball direction or runner path, rendered as a preview before the animation starts.

**Harder but possible:**
- **Camera zoom:** Scale up a portion of the SVG viewport (change `viewBox` to zoom into the action area). Would require a container div with overflow:hidden and animated transform.
- **Ghost trail:** Show the runner's path as a translucent trail after they move. Some animations already do this (ball ghost trails).
- **Split-screen comparison:** Show "what you chose" (failure animation) next to "correct play" (success animation). Would require rendering two Field components side by side. Expensive on mobile.

**Not feasible in current SVG approach:**
- Multiple camera angles (would need 3D or pre-rendered alternatives)
- True slow-motion with frame interpolation (SMIL is inherently smooth)

---

### 5. EDUCATIONAL DESIGN: Making Replay Teach, Not Just Entertain

The core question: a kid gets the answer wrong, taps "Watch the Play," and sees the correct play animated. What makes this a LEARNING moment?

**Principle 1: Show BEFORE and AFTER states.**
Before the animation starts, render the game situation (runners, fielder positions) as a static "freeze frame" with labels. After the animation, show the result state (runner safe at 2B, ball in glove at home). The contrast between states IS the lesson.

**Principle 2: Annotate the WHY, not just the WHAT.**
A ball flying from shortstop to first base is the WHAT. "The shortstop chose 1B because the force play is active" is the WHY. Timed text annotations during the replay ("Force at 1B!" appearing as the throw starts) bridge the gap. This directly uses the scenario's `explanation` text.

**Principle 3: Highlight the decision point.**
In every scenario, there is a moment of decision. Before the animation, briefly pulse/highlight the player who makes the choice (e.g., the outfielder who has to decide: throw to cutoff or throw home). This says "THIS is the person, THIS is the moment."

**Principle 4: Optional "wrong play" comparison.**
For the highest-learning-value scenarios (where the player picked the worst option, rate <= 25), consider an optional "See what happens if..." toggle that shows the failure animation. NOT default -- opt-in. This is the "What NOT to do" half of the lesson. The failure animations already exist in the code (7 types) but currently cannot render (see Finding #2).

**Principle 5: Match the coach line to the visual.**
The coach message on the outcome screen should reference what the player is about to see: "Watch how the double play turns -- the shortstop feeds the second baseman, who pivots and fires to first." This primes the player to look for specific elements.

---

### 6. OUTCOME SCREEN LAYOUT ANALYSIS

The outcome screen (lines 16712-16902) currently stacks:

1. Back button
2. Result emoji + header ("PERFECT STRATEGY!" etc.) + point badges
3. Coach line (for ages 11+)
4. "Your Choice" card with expandable explanation (has Why? / Show Data buttons)
5. "Best Strategy" card (only if player was wrong)
6. Try Again button (only if wrong, has plays remaining)
7. Key Concept card (delayed, with mastery progress)
8. Historical Note (famous plays only)
9. Explain More button (Pro only)
10. Brain Insights (ages 11+)
11. 70B Deep Analysis (if enabled)
12. AI flag button (AI scenarios only)
13. Next Challenge button
14. Pick Position / Challenge a Friend links
15. Pro upsell (every 5th game, non-Pro)

This is DENSE. On mobile, this is 4-6 scroll-lengths of content. Adding a full 400x310 SVG field replay would add significant height.

**Recommended placement for Game Film Mode:**

**Option A (Recommended): Collapsible replay between items 2 and 3.**
After the result header and before the explanation cards, insert a compact "Watch the Play" button. Tapping it expands an inline Field replay. This puts the visual BEFORE the text explanation, establishing a see-then-read learning flow. The field renders at ~60-70% size to save vertical space. A "Replay" button re-triggers the animation.

**Option B: Floating overlay.**
A "Watch Play" button that opens the Field as a modal/overlay on top of the outcome screen. Avoids layout disruption but feels disconnected from the learning flow. Harder to reference while reading the explanation below.

**Option C: Replace the result emoji.**
Instead of the static emoji (line 16716), render a tiny Field (200x155) with the animation. This is always visible, does not require a tap, and replaces something that is purely decorative. Risk: too small to see the action clearly on mobile.

**Recommendation: Option A with a twist.** Show the Field at reduced size (60% width) permanently -- no collapse needed -- but make the animation NOT auto-play. Show a static field with the game situation (runners, fielder positions) and a centered play button. Tapping plays the animation once. A small "Replay" button appears after. This avoids the accessibility concern of auto-playing animation, keeps the field small enough to not dominate, and gives the player agency.

---

### 7. WHICH SCENARIOS BENEFIT MOST FROM VISUAL REPLAY

**HIGH VALUE (physical action, clear spatial story):**
- All `steal` scenarios (~35+) -- runner vs throw is inherently visual tension
- All `doubleplay` scenarios (~15+) -- multi-throw sequence is the perfect replay
- All `score` scenarios (~25+) -- race to home plate
- All `relay`-type plays (currently using `throwHome` or `catch`) -- multi-player coordination
- `groundout` scenarios (~50+) -- ball path + throw to first shows defensive execution
- `bunt` scenarios (~30+) -- two simultaneous actions (ball + runner)
- `hit` scenarios (~75+) -- ball flight + baserunning

**MEDIUM VALUE (single action, still spatial):**
- `flyout` scenarios (~10+) -- ball arc to outfield
- `strike`/`strikeout` (~80+) -- pitch delivery (limited by straight-line path)
- `advance` scenarios (~25+) -- runner movement (context-dependent)
- `throwHome` scenarios (~40+) -- single throw (missing the runner it races)
- `catch` scenarios (~60+) -- ball arriving at fielder (missing context)
- `walk` scenarios (~8+) -- minimal visual (trot to 1B)

**LOW VALUE (abstract/mental decisions -- replay adds little):**
- `freeze` scenarios (~30+) -- the POINT is NOT moving. Showing a warning emoji does not teach.
- `safe` scenarios (~15+) -- pure celebration effect, no action to replay
- Manager scenarios about pitching changes, lineup decisions, emotional management -- no physical play to show
- Rules scenarios about obstruction, interference definitions -- need diagrams, not animations
- Counts scenarios about pitch selection strategy -- the count matters, not the animation

**Recommendation:** Show the replay button for ALL scenarios (consistent UI), but for abstract scenarios like `freeze` and `safe`, consider a static SVG diagram (arrows showing "runner stays" or "force play at second") instead of an animation.

---

### 8. PERFORMANCE, MOBILE, AND ACCESSIBILITY CONCERNS

**Performance:**
- The current animation system uses SMIL (SVG animations via `<animate>` and `<animateMotion>`). SMIL is GPU-accelerated in modern browsers and extremely lightweight. Adding a second Field render on the outcome screen doubles the SVG DOM but NOT the animation cost (the play-screen Field has already unmounted by the time the outcome screen shows).
- The `React.memo` wrapper on Field means it only re-renders when props change. A replay button changing a `replayKey` prop triggers a clean re-render.
- SMIL animations auto-start on mount. For opt-in replay, the Field would need to be conditionally mounted (not just hidden) so animations start on button press.

**Mobile:**
- The Field SVG renders at `maxWidth:420`. On a 375px iPhone screen, the 60% reduction (252px wide) is still legible for the major animations (ball flight, runner movement) but too small for text labels ("SAFE!", "OUT!").
- Recommendation: Hide the in-animation text labels on the replay Field and instead show the outcome as a text line below the field. This keeps the SVG clean at small sizes.
- Touch target: the "Watch Play" button must be at least 44x44px for WCAG compliance.

**Accessibility:**
- **Auto-play concern:** WCAG 2.1 SC 2.2.2 requires that auto-playing animation lasting more than 5 seconds can be paused. The longest animation (steal with slide) is ~1.3s total, well under the limit. However, for users with vestibular disorders, `prefers-reduced-motion` media query should disable the animation entirely and show a static diagram instead.
- **Color-only information:** The success (green) vs failure (red) color coding is already supplemented with text labels ("SAFE!", "OUT!"). No change needed for replay.
- **Screen reader:** The SVG field has no `aria-label` or descriptive text. For replay, add an `aria-label` describing the play: "Animation showing runner stealing second base. Catcher throws to second, runner is safe."
- **Keyboard:** The replay button should be focusable and activatable with Enter/Space.

---

### 9. THE BOARD COMPONENT AND GAME CONTEXT

The Board component (lines 13359-13365) renders: inning, score, count, and outs. It is compact (single row, monospace font) and already renders on the play screen below the Field.

For Game Film Mode, the Board should render ABOVE or INSIDE the replay Field, showing the full game situation. This provides context that makes the animation meaningful:
- "Bottom 7th, 2-1, runner on first, 1 out" + steal animation = "THAT'S why you steal here -- it is late, you are down, you need the tying run in scoring position"
- Without the Board, the steal animation is just "a runner ran to second base"

The Board already receives `sit` (the scenario's situation object) which has all needed data. Simply render `<Board sit={sc.situation}/>` above the replay Field.

---

### 10. FUTURE ENHANCEMENT IDEAS FOR THE VISUAL SYSTEM

**E1: Pitch Movement Visualization.**
Currently all pitches travel in a straight line from mound to plate. For `strike`/`strikeout` scenarios, the pitch type is often specified in the scenario text ("curveball in the dirt", "changeup low"). Render the pitch path as a curve: fastball = straight, curveball = downward arc, slider = lateral break, changeup = speed reduction (longer `dur`). This teaches pitch recognition visually.

**E2: Fielder Repositioning Before the Play.**
Before the main animation, show fielders shifting to their correct positions (e.g., shortstop moves to cover second for a steal, outfielder shades to the gap). This teaches pre-pitch positioning, which is a core concept with knowledge maps about it. A 0.5s pre-animation phase where one or two fielders slide to new positions.

**E3: Decision Tree Overlay.**
After the replay, show a branching overlay on the field: "If throw goes to 2B: OUT. If throw goes to 3B: runner advances. If hold ball: status quo." Arrows from the decision point to each outcome, color-coded green/yellow/red. This makes the option evaluation visual.

**E4: "Ghost Runner" for Failure Comparison.**
When showing the correct play, render the wrong play simultaneously as a transparent ghost. The real runner goes to second (solid), the ghost runner gets thrown out halfway (transparent, fading). The player sees BOTH outcomes overlaid. This is the split-screen comparison without needing two Field components.

**E5: Speed Control Slider.**
Let the player control replay speed: 0.5x (slow motion), 1x (normal), 2x (fast). Simply multiply all SMIL `dur` values by a factor. Young players (ages 6-8) might need 0.5x to follow the action; experienced players want 2x to quickly rewatch.

**E6: Tap-to-Pause Replay.**
Tap the field during animation to freeze-frame. Tap again to resume. This lets the player study a specific moment (e.g., the runner's lead when the pitcher throws over). Requires JavaScript control of SMIL animation state via `SVGAnimationElement.pauseAnimations()` / `unpauseAnimations()`.

**E7: "What Happened Next" Continuation.**
After the main animation, briefly show what happens NEXT in a real game: after the double play, the inning is over and the team jogs off the field. After the stolen base, the next pitch is shown (batter has a better situation). This connects the scenario decision to its downstream impact.

**E8: Crowd Reaction Integration.**
The crowd dots already have a sway animation. On success replays, make the crowd bounce faster/bigger. On failure, the crowd goes still. This adds atmosphere and makes the field feel alive during replay. Cheap to implement -- just vary the crowd animation parameters based on outcome.

**E9: Contextual Camera Zoom.**
For `steal` scenarios, zoom the viewBox to the 1B-2B corridor before the animation starts (viewBox="150 100 150 150"). For `hit` scenarios, zoom out to show the full outfield. Then animate the viewBox back to normal during the play. This focuses attention on where the action happens.

**E10: Replay Collection / Highlight Reel.**
Store the last 10 "correct play" replays. In the profile section, add a "Highlight Reel" that plays them back-to-back with the scenario title as a title card. This is inherently shareable (screen-record worthy) and gives the player a sense of accumulated knowledge. "Look at all these plays I learned."

---

### 11. IMMEDIATE ACTION ITEMS FOR THE MAIN AGENT

1. **Fix the animation gating on line 16660.** The replay Field on the outcome screen should ALWAYS pass `sc.anim` and `outcome="success"` to show the correct play, regardless of what the player chose. The current `od?.isOpt?sc.anim:null` gate blocks the very feature Game Film Mode needs.

2. **The replay should NOT auto-play.** Mount the Field only when the user taps "Watch the Play." Use a state variable (`showReplay`) and increment `ak` (animation key) to trigger fresh SMIL animations on each replay tap.

3. **Include the Board component** in the replay section to show game context (inning, score, count, outs).

4. **For `freeze` and `safe` animations, consider suppressing the replay button** or showing a static field diagram instead. These animations do not tell a spatial story.

5. **Add `prefers-reduced-motion` check.** If the user has reduced motion enabled, show a static field with the game situation instead of animation.

6. **Remap outfield/infield relay scenarios from `throwHome`/`catch` to `relay`.** The `relay` animation exists and is excellent, but zero scenarios use it. This is a scenario data fix, not a code fix.

7. **Consider the 7 unused animation types** (`relay`, `pickoff`, `squeeze`, `wildPitch`, `hitByPitch`, `tag`, `popup`) as a scenario data enrichment opportunity. Dozens of existing scenarios would be better served by these specific animations instead of their current generic ones.
