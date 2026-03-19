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

### 8. Game Film Mode
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

### O1: The Quiz Format Ceiling
Both playtests converged on "feels like a quiz after 10 plays." The core loop (read→pick→read) is inherently limited. The ideas above (free response, multi-decision sequences, game film) all address this from different angles. The next major engagement leap requires breaking the 4-choice format.

### O2: Social is the Missing Multiplier
Every competitive player (Marcus, Tyler) wanted to compete against real people. The challenge-a-friend system is async and buried. Real-time head-to-head would be transformative but requires WebSocket infrastructure. A simpler step: weekly team leaderboards where coaches can see their team's aggregate performance.

### O3: The Brain is Underleveraged
The BRAIN constant has pitch count fatigue matrices, matchup data, park factors, wind effects — none of which the player ever sees directly. The "Show Data" button reveals fragments. A "Baseball Brain" section where players can EXPLORE the data (not just receive it passively) would be both educational and sticky.

### O4: Parents Are the Distribution Channel
One coach = 15 players = 30 parents. The parent report exists but is behind a math gate and looks like a grade school report card. If the parent report was a weekly EMAIL showing "Your child learned 3 new concepts this week, practiced for 45 minutes, and improved their Catcher DNA from 60% to 72% on game calling" — parents would forward that to other parents.

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
