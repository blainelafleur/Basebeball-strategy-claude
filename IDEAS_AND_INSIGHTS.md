# BSM Ideas & Insights Log
## A living document of ideas, patterns, and future directions

**Started:** 2026-03-19 | **Last updated:** 2026-03-20

---

# PART 1: NOT YET BUILT (Future Ideas)

## Feature Ideas

### 1. Concept Skill Tree (Visual Prerequisite Graph)
The 48 concepts have a dependency graph invisible to players. Visualize as an RPG-style skill tree — lit-up nodes for mastered, grayed-out for locked. Creates goals, shows progress, gives parents tangible view of learning. Group by domain (defense, baserunning, pitching, strategy).

### 2. Position DNA Radar Chart
After 20+ plays per position, generate a shareable radar chart: "Your Catcher DNA: Framing 90%, Game Calling 45%, Blocking 80%." Creates identity, inherently screenshot-worthy, shows exactly where to improve. Could be the "Player Card" export.

### 3. Concept-Relative Difficulty
Compute `effectiveDiff = baseDiff - (prereqsMastered * 0.3)` so a diff:2 relay scenario is effectively diff:1 for someone who mastered cutoff-roles. Currently the static 1/2/3 treats all players the same.

### 4. Time-Weighted Spaced Repetition (Ebbinghaus)
Current mastery: "3 consecutive correct" regardless of time. Implement `retention = e^(-t/S)` where S is stability, increasing with each correct review. A player mastered 60 days ago with no review should degrade faster.

### 5. "What Would You Do?" Free-Response Mode
Show a situation, let the player explain their reasoning via text/voice. AI evaluates REASONING, not just choice. Tests understanding at a depth multiple-choice can't. BRAIN data + Claude pipeline could evaluate today.

### 6. Multi-Decision Scenario Sequences ("Play Breakdown")
Break one play into 3-step sequence: "Who cuts?" → "Where does SS throw?" → "Who backs up?" Tests the CHAIN of decisions, not just one isolated choice.

### 7. Coach Persona Matching
Track which coach messages correlate with continued play. Some kids respond to encouragement, others to analysis, others to aspiration. A/B testing at the individual level.

### 9. "Why Wrong" Taxonomy
Not all wrong answers are equal: knowledge gap, instinct override, reading error, careless. Track which TYPE of wrong answer to enable targeted coaching.

### 10. Seasonal Content Drops
Monthly: 20 new scenarios + themed challenge aligned to baseball calendar (Spring Training, Regular Season, Playoffs, Offseason). AI generation makes this cheap.

---

## Adaptive System Ideas (Not Yet Built)

### A1. Unified Player State Vector
Single computed object synthesizing all signals (accuracy, streaks, cognitive load, engagement, frustration risk, concept edge). Every system reads from one truth.

### A2. Session Energy Curve
Warm-up (plays 1-2) → Challenge zone (3-7) → Sustained (8-12) → Cool-down (13+). Modulate scenario selection by session phase.

### A3. Micro-Difficulty Dimensions
Beyond diff:1/2/3: option ambiguity (from rates data), situation complexity, reading load (char count), concept intersection count. Target 40-70% expected accuracy more precisely.

### A5. The 3-Wrong Pivot
Wire `wrongStreak` into `scoreScenarioForLearning` as a 7th factor. When wrongStreak>=3: boost diff:1 +25, boost mastered +15, penalize diff:3 -20. Connect coach words to system actions.

### A6. Engagement-Responsive Explanation Length
Track explanation read time for ALL scenarios. If rolling average <3s, player is skipping. Switch to shorter explSimple, add visual breaks, suggest Speed Round.

### A7. Frustration Detection and Rescue
Frustration score from wrongStreak + recentAccuracy + responseTimeAccelerating. At 0.6: serve guaranteed-easy scenario. At 0.8+: suggest session end. Max 1 rescue per session.

### A8. Cold Start Bootstrapping
3-question baseball background survey during onboarding: "Do you play on a team?" / "What position?" / "Have you heard of run expectancy?" Jumpstarts adaptive engine for games 6-20.

### A9. Cross-Position Concept Transfer
When mastered concept appears in NEW position, serve one difficulty level LOWER. Tests "Can you apply cutoff knowledge from catcher to shortstop?"

### A10. "Why Did You Pick That?" Reflection
After wrong answer (20% of the time, gp>10): quick-tap reason — "wasn't sure about rules" / "thought situation called for it" / "seemed safest" / "just guessed." Massive signal boost for 2 seconds of effort.

---

## Observations (System Blind Spots)

### O1: Quiz Format Ceiling
Core loop (read→pick→read) gets repetitive after 10 plays. Free response, multi-decision sequences, and game film address this from different angles.

### O2: Social is the Missing Multiplier
Every competitive player wants to compete against real people. Real-time head-to-head needs WebSocket (Cloudflare Durable Objects). Simpler step: weekly team leaderboards.

### O3: Brain is Underleveraged
BRAIN has pitch count fatigue matrices, matchup data, park factors — player never sees directly. A "Baseball Brain" exploration section would be educational and sticky.

### O4: Parents Are the Distribution Channel
One coach = 15 players = 30 parents. Weekly parent EMAIL with concept trends, session time, position DNA changes would drive word-of-mouth.

### O5: Session Fatigue Not Tracked
Play #2 and play #15 get same difficulty. No time-of-day awareness. No domain transfer detection (mastering cutoff for catcher doesn't help when switching to shortstop). Mastered penalty too harsh (mastered:0 score).

### O6: Error Detection Thinks Like Database, Not Coach
Missing: anchor bias (always picks option A), complexity avoidance (picks shortest text), overthinking (wrong on easy, right on hard), situation blindness, position tunnel vision, explanation skip pattern.

### O7: Prerequisite Graph Depth = Sophistication
Graph depth never computed. Breadth of prerequisites = cognitive load. Domain subgraphs could power "readiness scores." Currently only used for filtering.

### O9: Cold Start Gap (Games 6-20)
Games 1-5 have diversity protection + placement. Games 6-20 run on essentially random weighted selection. Session planner only works for Pro/AI scenarios.

### O11: Boredom Signals Captured but Unused
responseMs<3000 and explanationReadTimeMs<1500 tracked for AI only (not 85%+ handcrafted plays). Could trigger coach nudge, shorter format, or Speed Round suggestion.

---

## Warnings (Adaptive System Risks)

- **W1: Death Spiral** — System drops difficulty, kid notices, feels patronized. Framing is critical.
- **W2: Optimization Trap** — Targeting 60% accuracy = medium forever. Need deliberate stretch + confidence moments.
- **W3: Small Sample Overfitting** — 8 plays/day is thin data. Don't adjust aggressively on 3 plays.
- **W4: localStorage Bloat** — Per-scenario tracking + new dimensions. Capped at 50 entries, ~59 bytes each = ~2.9KB. Fine.
- **W5: A/B Interaction** — 9 configs + adaptive difficulty = uninterpretable. Use long-term retention metrics.
- **W6: Age vs Skill Tension** — Talented 8yo may outperform casual 14yo. Don't override content gates, but relax difficulty gates.

---

## Architecture Notes

- **N1: Single-File Ceiling** — At ~17,900 lines. BRAIN + knowledge maps extraction buys most headroom.
- **N2: Real-Time Infrastructure** — Cloudflare Durable Objects for multiplayer/coaching when ready.
- **N3: 70B Model** — Sitting on HuggingFace. Could power: cheaper AI gen, free-response eval, coach personas, difficulty calibration.

---

## Visual System: Still Planned

### Play-by-Play Text Labels During Replay
Timed text annotations narrating the play: "Ground ball hit to infield" → "Fielder scoops cleanly" → "Throws to first" → "OUT!" Max 2 annotations per replay to avoid over-annotation.

### Fielder Repositioning Pre-Animation (E2)
Show fielders shifting to correct positions before play starts. Teaches pre-pitch positioning — a core concept with knowledge maps. 0.5s pre-animation phase.

### "What Happened Next" Continuation (E7)
After replay, briefly show downstream impact: after DP inning ends, after stolen base situation improves.

### Speed Control Slider
User controls 0.5x / 1x / 2x. Currently tap-to-pause exists. Slider would multiply SMIL durations through existing useLayoutEffect system.

### Scenario-Specific Animation Paths (AF5 Full Implementation)
Add `animVariant` field to scenario data: `anim:"groundout", animVariant:"5-3"` (SS to 1B). Currently the prop exists on Field but no scenarios use it yet beyond pitch types.

### `prefers-reduced-motion` Support
Show static field with game situation diagram instead of animation when user has motion reduction enabled. Required for WCAG compliance.

### Aria-Labels for Replay SVG
Add descriptive text for screen readers: "Animation showing runner stealing second base."

### Coach Film Voice Lines
Timed annotations like a coach talking during game film: "Watch the runner's jump..." "See how the throw beats him?" Per-animation-type phrases documented in QUICK WINS BUILD NOTES.

---

## enrichFeedback: Additional Patterns (8 Not Yet Implemented)

From thought partner analysis of 14 total detectable patterns (6 shipped):
- Strategy mode blindness (fails when game shifts from RE24 to win-probability mode)
- Low-stakes coasting (aces easy scenarios, doesn't engage)
- Leverage-aware over-aggression (plays hero ball in clutch)
- RE24 ceiling confusion (wrong when RE24 > 2.0)
- Pressure crescendo (accuracy degrades as session progresses)
- Position × pressure interaction (great under pressure at batter, terrible at pitcher)
- Improvement under pressure over time (tracking growth)
- RE24 illiteracy (consistently wrong about run expectancy)

---

# PART 2: SHIPPED (Completed Features)

## Visual System — Full Overhaul (2026-03-19 to 2026-03-20)

### Quick Wins Shipped
- **QW1: Crowd reaction** — `crowdCheer` keyframe (faster bounce + scale), still on failure, opacity 0.85/0.5 dynamic
- **QW2: Auto-expand replay for wrong answers** — danger-only (rate<55), skips gp<3/speedMode/survival, scrollIntoView on mobile
- **QW3: Highlight ring on decision-maker** — Golden pulsing ring at key player coords per animation type, `data-spotlight` to skip slow-mode scaling
- **QW4: Trajectory dashed lines** — Faint dashed preview of ball path for hit/flyout/groundout/relay/DP/bunt, `data-spotlight` protected
- **QW5: Baseball sounds** — batCrack (1kHz bandpass noise), glovePop (500Hz), slideDust (pink noise sweep), umpSafe (rising tone), umpOut (descending tone)

### Core Improvements Shipped
- **CI1: Per-phase pacing** — Setup 2x, key moment 3.5x, resolution 2.5x. Short pulses 1.8x. Replaced uniform 2.5x.
- **CI2: Failure comparison mode** — "👻 Compare: See What Goes Wrong" button + GhostPhases overlay at 35% opacity
- **CI3: Full sound palette** — 6 baseball-specific sounds replacing generic UI tones in replay
- **CI4: Freeze scenario redesign** — Ghost runner starts, throw beats them, tag flash, "✗ OUT", "SMART — DON'T RUN INTO AN OUT!"
- **CI5: Guy() sprites** — All 10 mini-runner primitives replaced with full Guy() component (runner pose, team jerseys)

### Advanced Features Shipped
- **AF1: Animation-as-data architecture** — ANIM_DATA constant (11 types), AnimPhases renderer (7 phase types), gradual migration with inline SMIL fallback
- **AF2: Ghost runner comparison** — GhostPhases renderer + 3 failure animations (steal_fail, hit_fail, score_fail)
- **AF3: Pitch movement visualization** — Curveball (gravity easing, drops), slider (lateral break), changeup (float easing)
- **AF4: Contextual camera zoom** — ViewBox animates to action corridor per animation type, returns to full view after 2.5s
- **AF5: animVariant prop** — Field accepts animVariant for pitch type / position-specific paths
- **AF6: Tap-to-pause** — Pause/Play button using SVG.pauseAnimations() API
- **AF7: Decision tree overlay** — Branching outcome arrows fade in after replay (steal: SAFE vs OUT paths, etc.)
- **AF8: Highlight reel** — Last 10 correct plays saved to stats.highlights, "🎬 Highlights" button + Prev/Next player

### Infrastructure Shipped
- **EASE constants** — 8 named presets (runner, throw, launch, gravity, ground, float, flyArc, pulse). Zero raw keySplines strings in ANIM_DATA.
- **enrichFeedback data storage** — pressure, RE24, countEdge, leverageIndex, isLateClose stored per play in playContextHistory (last 50)
- **6 situational patterns** — pressure_choke, clutch_player, count_savvy, count_blind, late_game_fade, risp_panic
- **22 scenario animation remaps** — relay(6), pickoff(6), squeeze(2), wildPitch(2), popup(4), tag(1), hitByPitch(1)
- **Animation gate fix** — `anim={fo?sc.anim:null}` so failure animations render on wrong answers

## Game Film Mode — V1 + V2 (2026-03-19 to 2026-03-20)
- Replay button on outcome screen with field + Board + sound effects
- 2.5x slow mode via useLayoutEffect (per-phase: fast-slow-fast pacing)
- Smart runners (remove animated runner, keep others)
- Auto-expand for wrong answers (danger-only, gp>=3, scroll-to-view)
- All 18 visual features from VISUAL_SYSTEM_PLAN.md shipped

## Adaptive System Shipped (2026-03-19)
- Adaptive difficulty engine: per-position rolling accuracy → dynamic level adjustment
- Curated PLACEMENT_POOL: 12 positions × 3 difficulty tiers, hand-audited
- Placement test seeds adaptiveDiff level, ongoing play updates it
- Position cards show difficulty badges (⭐ Rookie / ⭐⭐ Varsity / ⭐⭐⭐ All-Star)

## Pre-Launch Shipped (2026-03-19)
- Onboarding: 8 taps → 3 taps, auto-starts first game
- 6 age groups with aspirational labels (Rising Rookie through College/Pro)
- Age vocabulary mapping bug fixed (13+ was getting tier 3)
- "scenarios" → "challenges" globally
- Placement test for 11+ (5 rapid-fire questions)
- Speed Round timer age-adjusted (30s for 6-8)
- Survival difficulty cap by age
- PLAY NEXT hero button, plays-remaining counter
- Daily missions (6 rotating), mastery bars on position cards
- 99 explSimple text quality fixes, kid-friendly concept names
- 25 promo codes seeded, All-Star naming standardized
- 14 QA bugs fixed across 2 audit rounds

---

*This document grows with every build session. Ideas marked when implemented.*
