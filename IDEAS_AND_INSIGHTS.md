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

## Baseball Brain Build Review (TPA)

**Date:** 2026-03-20 | **Reviewer:** Thought Partner Agent | **Scope:** RE24 Explorer + Count Dashboard code review, remaining-tab prioritization, architecture recommendations

---

### 1. Code Review: Bugs, UX Issues, and Improvements

**CRITICAL BUG: useState inside conditional IIFE (lines 3008-3009, 3046-3050, 3180-3181)**

The Baseball Brain section uses `useState` inside a conditionally-rendered IIFE:
```js
{screen==="brain"&&(()=>{
  const[brainTab,setBrainTab]=useState("re24");  // line 3009
```
And nested further:
```js
{brainTab==="re24"&&(()=>{
  const[reRunners,setReRunners]=useState([]);     // line 3047
```

This violates React's Rules of Hooks. Hooks must be called at the top level of a component, never inside conditions. What will happen:
- When `screen` changes FROM "brain" to something else, those hooks disappear from the call order
- When `screen` changes BACK to "brain", React matches hooks by call order and will read stale/wrong state
- When switching between `brainTab==="re24"` and `brainTab==="counts"`, the nested hooks shift positions
- In practice, this may appear to work in dev mode but WILL produce unpredictable bugs (wrong state values, stale closures, React warnings in StrictMode)

**Fix:** Hoist ALL Brain-related `useState` calls to the top level of App(), alongside the other state declarations (lines 3-35). Gate the *rendering* conditionally, not the hook calls. Example:
```js
// At top of App(), with other useState calls:
const[brainTab,setBrainTab]=useState("re24");
const[reRunners,setReRunners]=useState([]);
const[reOuts,setReOuts]=useState(0);
const[reLastAction,setReLastAction]=useState(null);
const[rePrevRE,setRePrevRE]=useState(null);
const[selCount,setSelCount]=useState(null);
const[perspective,setPerspective]=useState("hitter");
```
This is the pattern the rest of the codebase uses (all 35+ useState calls at lines 3-35 are unconditional).

**BUG: Walk logic does not handle all force scenarios (line 3117-3118)**

The walk handler checks `if(nr.includes(1)&&nr.includes(2)&&nr.includes(3))` for bases-loaded, then handles 1st+2nd and 1st-only as separate force cases. But it misses the case where runners are on 2nd+3rd only (no runner on 1st). In that case, a walk should simply add a batter to 1st with no forcing. The current code handles this correctly by falling through to the else branch, BUT the inner logic `if(nr.includes(2)&&nr.includes(1))` would be false, and `if(nr.includes(1))` would also be false, so only `nr.push(1)` runs. This is correct, but fragile. The case of runners on 1st and 3rd is also missed as a special force case -- a walk should force the runner from 1st to 2nd but NOT advance the runner on 3rd. The current code maps `x===2?3:x` first (no-op if no runner on 2nd), then maps `x===1?2:x`, which correctly advances 1st to 2nd. So the logic is actually correct but hard to verify because it relies on ordering of map operations. Consider adding a comment or restructuring for clarity.

**BUG: reRunners.sort() mutates state in-place (line 3097)**

`reRunners.sort().map(...)` calls `Array.sort()` which mutates the original array. In React, directly mutating state can cause stale renders. Should be `[...reRunners].sort().map(...)`.

**BUG: Steal "caught" logic can produce wrong runner removal (line 3136)**

The caught-stealing filter: `reRunners.filter(r=>r>2||r!==Math.min(...reRunners.filter(x=>x<=2)))` is intended to remove the lead runner (the one attempting the steal). But if runners are on 1st and 2nd, `Math.min(...)` returns 1, so the runner on 1st is removed. But realistically, if both runners are stealing, the lead runner (2nd) would be the one caught. The logic should remove the runner closest to the base they're stealing, not the lowest-numbered base runner.

**UX: Outs selector interaction model is confusing (line 3083)**

The three out buttons show filled/empty circles. Clicking button index 0 when outs=0 sets outs to 0 (no change), clicking index 1 sets outs to 1, etc. But the visual `reOuts>=o+1` means button 0 is filled when outs >= 1, button 1 when outs >= 2. This is correct for display but the *click targets* don't match -- clicking the first circle sets outs to 0 (empty), not 1. The mapping `onClick={()=>{...setReOuts(o);...}}` where o is 0,1,2 means clicking the first ball sets outs to 0. This creates a confusing UX where clicking a "filled" ball doesn't toggle it off. Consider making the buttons toggle-style (tap filled ball to reduce outs, tap empty ball to add outs) or switch to a simple 0/1/2 numeric selector.

**UX: No number animation on RE24 value changes**

The plan calls for "smooth counting animation" on the RE24 number. Currently it snaps instantly. The `transition:"color .3s"` only animates the color, not the number itself. A `NumberAnimation` component (planned in shared infrastructure, ~30 lines) should be built before more tabs use animated numbers.

**UX: Mini diamond is small on mobile (180x140)**

At 180x140 CSS pixels, the tap targets for bases are only 12x12 SVG units, which may be too small for younger kids' fingers. The plan says "tap 1B, 2B, 3B to toggle runners" -- on a phone, these diamonds rotated 45 degrees create ~17px touch targets. Minimum recommended touch target is 44px (Apple HIG). Consider enlarging to at least 240x180, or adding invisible larger hit areas around each base.

**UX: Count Dashboard grid reads left-to-right for strikes, top-to-bottom for balls**

The grid `counts=[["0-0","1-0","2-0","3-0"],["0-1","1-1","2-1","3-1"],["0-2","1-2","2-2","3-2"]]` lays out balls on the X-axis and strikes on the Y-axis. This matches a standard count matrix. However, the arrangement means the "impossible" zone (e.g., you can't reach 3-0 from 0-2) isn't visually distinguished. The progression arrows (lines 3243-3255) partially address this, but the grid lacks any visual flow showing how counts connect. Consider adding subtle dotted lines between adjacent reachable counts.

**UX: Perspective toggle hidden for vocabTier < 3 (age 6-10)**

The hitter/pitcher toggle is hidden for younger players. But even 9-10 year olds benefit from perspective-taking ("think like the pitcher"). Consider showing it at vocabTier >= 2 with simplified language.

**MISSING: "Double" What-If button from plan**

The BASEBALL_BRAIN_PLAN.md specifies a "Double" button ("Clears bases, runners score per advancement rates"). This was not implemented. Only Single, Walk, K, Bunt, Steal, Sac Fly, and Double Play are present.

**MISSING: "Build Your Inning" sandbox mode from plan**

The plan calls for a full inning simulation with run tracking and "beat your best" competition. This is absent. This would significantly increase engagement and replayability.

**MISSING: Comparison mode from plan**

The plan specifies a side-by-side comparison for steal outcomes ("Left shows success path, right shows caught-stealing path"). Not implemented.

**MISSING: Count Journey animated mode from plan**

The plan calls for an animated at-bat walkthrough using pitch-by-pitch probabilities. Not implemented. This is a high-value teaching tool.

**MISSING: Count Heat Map animation from plan**

The plan describes a color-gradient heat map showing BA across all counts simultaneously. Not implemented.

**MINOR: rePrevRE state is set but never read in the UI (line 3050)**

`rePrevRE` is stored via `setRePrevRE(re24)` before every action, but never read anywhere in the render. This was likely intended for the number animation (showing the transition from old to new value). Remove or implement.

**MINOR: First-pitch deep dive numbers show raw decimals**

Line 3261: `Math.abs(fpv.strikeValue)` renders as "0.048" which is correct but the plan says "saves ~0.05 runs" for simplicity. For vocabTier 3, rounding to 2 decimals would be more readable.

---

### 2. Pattern Recommendations: Shared Components to Extract

Before building more tabs, extract these reusable pieces:

**P1. NumberAnimation component (~30 lines)**
Used by: RE24 Explorer (RE24 value), Count Dashboard (BA display), Win Probability (WP%), Steal Calculator (times), Matchup Analyzer (BA), Pitch Count (velocity).
Implementation: `useRef` + `requestAnimationFrame` loop that interpolates between old and new values over ~500ms with easing.

**P2. BrainSlider component (~40 lines)**
Used by: Steal Calculator (3 sliders), Pitch Count Tracker (pitch count needle), Win Probability (score diff + inning), Matchup Analyzer (pitch count), Park Factor Explorer (temperature).
A styled range input with: labeled ticks, preset snap points, value display, color theming per tab.

**P3. BrainDetailPanel component (~30 lines)**
Used by: Count Dashboard (count detail), RE24 Explorer (action result), Pitch Lab (pitch detail), Concept Map (node detail), Steal Calculator (pickoff panel).
A slide-up panel with: title bar, stats grid, teaching text, close button. Consistent border-radius, background, padding.

**P4. BrainStatBox component (~15 lines)**
Used by: Count Dashboard (BA/OBP/SLG/K%/BB% boxes), Matchup Analyzer (matchup stats), Pitch Lab (pitch stats), Pitch Count (velocity/ERA boxes).
A single stat display: big number, small label, color-coded background. Already hand-built at lines 3224-3227 -- extract and reuse.

**P5. AgeAdaptiveText helper function (~20 lines)**
Used by: Every tab for age-gated language.
`ageText(vocabTier, {young:"Hit!", mid:"Single", full:"Single (+0.62 RE24)"})` returns the appropriate string. Replaces dozens of inline ternaries.

**P6. BrainTeachingMoment component (~20 lines)**
Used by: Every tab for the "one sentence teaching moment" after interactions.
A styled card with: icon, text, optional deep link to another tab. Consistent style across all 11 tabs.

**P7. Top-level Brain state management**
Move all Brain useState calls to App() top level. Add a `brainState` object or individual states. This also enables persistence -- save `brainTab`, exploration progress, IQ score to localStorage alongside other `bsm_v5` data.

**Extraction priority order:** P7 (blocks everything), P1 (used by 6+ tabs), P4 (used by 4+ tabs), P5 (used by all tabs), P2 (used by 5+ tabs), P3, P6.

---

### 3. Prioritization: Which Tab to Build Next

Ranking the 9 remaining tabs by impact:

**Tier 1: Build immediately (highest ROI)**

**#1: Steal Calculator**
- WHY: Activates the MOST orphaned data (5 sections: stealWindow, popTime, timeToPlate, pickoffSuccess, pitchClockViolations = ~20 orphaned fields)
- ENGAGEMENT: The "race visualization" is inherently fun -- kids will experiment with slider combos for minutes
- CODE REUSE: BrainSlider component needed here serves 4 other tabs
- EDUCATIONAL: Teaches the most "aha" concept -- steal success is math, not just speed
- DIFFICULTY: Low (~200 lines, zero new data, clean data structure)
- CROSS-LINK: Connects naturally to RE24 Explorer (break-even from RE24) and Count Dashboard (steal on what counts?)

**#2: Pitch Lab**
- WHY: `pitchTypeData` is already well-structured (8 pitch types with movement, sequencing, best/worst counts, tunneling). `catcherFramingValue` is fully orphaned.
- ENGAGEMENT: The sequencing builder is a GAME -- call pitches, get scored. Kids will compete for high scores.
- EDUCATIONAL: Pitch sequencing is the #1 concept coaches want kids to learn
- DIFFICULTY: Medium (~350 lines, needs SVG pitch movement paths)
- RISK: SVG pitch trajectories are the hardest visual element to get right. Budget extra time.

**Tier 2: Build in Sprint 2**

**#3: Concept Map**
- WHY: 76 concepts with a full prerequisite graph already exist. This is the "RPG skill tree" that creates long-term goals.
- ENGAGEMENT: Mastery visualization is proven to drive retention in learning apps
- STICKINESS: "3 concepts ready to unlock!" creates return visits
- CODE REUSE: Tree layout algorithm is unique to this tab but mastery celebration reuses particle system
- DIFFICULTY: Medium-high (~300 lines, tree layout is algorithmically non-trivial on mobile)

**#4: Pitch Count Tracker**
- WHY: Activates `pitchCountThresholds` (fully orphaned) and `pitchCountMatrix` (fully orphaned). Youth pitch limits are directly relevant to every kid who pitches.
- ENGAGEMENT: The speedometer gauge visual is satisfying to drag
- PRACTICAL VALUE: Parents and coaches will use this. It's the most "real-world useful" tab.
- DIFFICULTY: Medium (~200 lines, gauge SVG needs clean implementation)

**Tier 3: Build in Sprint 3**

**#5: Win Probability** -- High educational value but abstract. Needs ~20 lines new data.
**#6: Matchup Analyzer** -- Activates 3 orphaned sections but age-gated to 11+.
**#7: Defensive Positioning Sandbox** -- Draggable fielders are technically complex but visually impressive.
**#8: Historical Moments** -- Needs ~60 lines new data. Highest narrative engagement but lowest data activation.
**#9: Park Factor Explorer** -- Needs ~30 lines new data. Interesting but least actionable for a kid.

---

### 4. Blind Spots

**What a baseball coach would catch:**

- **Bunt RE24 is misleading for youth.** The RE24 Explorer shows bunting always costs runs (based on MLB data). But at the youth level (ages 9-12), bunting is often RE-POSITIVE because fielding is unreliable. The BRAIN data even acknowledges this in `levelAdjustments.levels.travelMiddle.buntNote`. The RE24 Explorer should show age-adjusted bunt costs, or at minimum display a disclaimer: "At your level, bunting works better than these MLB numbers suggest."

- **Steal break-even is age-dependent.** `stealBreakEven[0]=0.72` is MLB. Youth leagues (no leads, passed ball steals only) have completely different math. `levelAdjustments.levels.youthPitch.stealBreakEven=0.50`. The RE24 Explorer and future Steal Calculator should use age-appropriate thresholds. Currently using MLB-only values for all ages.

- **Missing "run on contact with 2 outs" teaching.** `baserunningRates.run_on_contact_two_outs=1.00` (always run) is one of the most important youth coaching concepts. The RE24 Explorer should highlight this automatically when outs=2.

- **No connection to actual game situations.** After exploring RE24 or counts, there's no "Now play a scenario with this situation" button. The plan calls for this (Section 14.6: "Brain Tab -> Quiz Bridge") but it's easy to forget during build.

**What a UX designer for kids would catch:**

- **Tap targets too small.** The base diamonds (12x12 SVG units = ~17px) and out selector buttons (28x28 CSS px) are below the 44px minimum for mobile. Young kids (6-8) have even less fine motor precision.

- **Too much text for young players.** The Count Dashboard detail panel (lines 3213-3267) shows 6+ stat boxes, a paragraph of advice, progression arrows, AND a first-pitch deep dive for vocabTier >= 3. This is information overload for 11-12 year olds. Consider progressive disclosure: show 2-3 stats, "See more" expands.

- **No onboarding for Brain.** A first-time visitor to Baseball Brain sees a tab strip and the RE24 diamond. There's no tooltip, coach prompt, or guided first interaction saying "Tap a base to put a runner on!" The plan mentions Brain fact teasers on the home screen, but the Brain section itself needs a first-visit nudge.

- **Color alone distinguishes hitter/pitcher/neutral counts.** Kids with color vision deficiency (8% of boys) cannot tell green from red. Add a secondary indicator: icons, patterns, or text labels. The emoji faces for young players (line 3202) help, but older players lose this.

- **No haptic feedback on interactions.** Mobile devices support `navigator.vibrate()`. A subtle 10ms vibration on base toggle and "What If?" button taps would make the explorer feel more tangible. Free to implement, huge for engagement.

**What a data visualization expert would catch:**

- **RE24 number display lacks context.** "0.54" means nothing to most users. Need a contextual anchor: "0.54 expected runs -- about average for bases empty." Or a visual bar showing where 0.54 falls in the 0.11 to 2.29 range.

- **Count grid lacks visual hierarchy.** All 12 count cells are the same size. The plan says "cell size proportional to how often that count occurs." This is important -- 0-0 occurs in 100% of PAs, 3-2 occurs in ~15%. Size coding would teach frequency intuitively.

- **Delta display should use color AND direction.** The `+0.62` / `-0.23` badges use green/red color. Add an arrow icon (up/down) for accessibility and quicker parsing.

- **Full RE24 matrix (vocabTier >= 4) is hard to scan.** A heatmap with cell background gradients (green to red) would be far more scannable than colored numbers in a plain table.

---

### 5. Integration Opportunities Between Tabs

**Cross-tab links to build as you go:**

| From Tab | Link Trigger | To Tab | Pre-loaded State |
|---|---|---|---|
| RE24 Explorer, "Bunt" button | After seeing bunt RE24 cost | Count Dashboard | "On what counts does the batter bunt?" |
| RE24 Explorer, "Steal" button | After seeing break-even % | Steal Calculator | Pre-set outs from current RE24 state |
| Count Dashboard, any count | "What pitch should I throw here?" | Pitch Lab | Count pre-selected, pitch recommendations highlighted |
| Count Dashboard, 0-2/1-2 | "Best putaway pitches" | Pitch Lab | Filtered to `twoStrikePutaway` pitches |
| Pitch Lab, after sequence | "How does fatigue change this?" | Pitch Count Tracker | Pitch count from sequence length |
| Steal Calculator, break-even | "See the RE24 math" | RE24 Explorer | Runners + outs pre-set to steal scenario |
| Win Probability, RE24/WP divergence | "See the run expectancy" | RE24 Explorer | Matching runner/out state |
| Matchup Analyzer, "pull the pitcher" | "Check the fatigue numbers" | Pitch Count Tracker | Pitch count + TTO pre-loaded |
| Concept Map, any concept node | "Practice this concept" | Quiz (play screen) | Scenario filtered by concept |
| Historical Moments, any moment | "Explore the data" | RE24/WP/Steal tab | Game state from the moment |

**Implementation pattern:** Each tab's "What If?" or detail panel includes an optional `{deepLink:{tab:"steal",state:{outs:1}}}` object. A shared `navigateBrain(tab, state)` function sets `brainTab` and pre-loads state into the target tab's state variables. This requires all Brain state to be hoisted to App() level (see P7 above), which further reinforces that as the #1 priority fix.

**Bidirectional flow is key:** Every tab should both SEND and RECEIVE deep links. The quiz loop should link INTO Brain tabs (plan Section 14.1-14.5), and Brain tabs should link OUT to quizzes (plan Section 14.6). Building this infrastructure now (a `BrainDeepLink` component, ~25 lines) will compound across all 11 tabs.

**The "Brain IQ" unifier:** As tabs get built, track first-visit, interactions, and challenges per tab. The Baseball IQ score (plan Section 15.1) becomes the meta-reward that ties exploration across all tabs into a single progression metric. Add the IQ data structure to localStorage now, even before all tabs exist, so early adopters accumulate credit.

---

### Summary: Top 5 Action Items Before Next Build Session

1. **FIX HOOKS BUG** -- Hoist all Brain useState calls to App() top level. This is a blocking correctness issue.
2. **Extract BrainStatBox + AgeAdaptiveText** -- These two tiny components (~35 lines total) will be used by every subsequent tab.
3. **Build Steal Calculator next** -- Highest orphan-data activation, most fun interaction, creates BrainSlider component for 4 other tabs.
4. **Add "Build Your Inning" sandbox to RE24** -- The single highest-engagement feature missing from the MVP. Turns a reference tool into a game.
5. **Enlarge touch targets** -- Base diamonds to 24x24+ SVG units, outs buttons to 36x36+ CSS px. Critical for the target age range.

---

## Baseball Brain Gamification Review (TPA)

**Date:** 2026-03-20 | **Reviewer:** Thought Partner Agent | **Scope:** Quiz-to-Brain deep linking, gamification layer design, daily facts, achievements, cross-tab navigation, risk analysis, pro gating balance

---

### 1. Deep Link Mapping: enrichFeedback Insight -> Brain Tab

Each `enrichFeedback()` insight (lines 1050-1155 of `src/05_brain.js`) generates a specific insight type. Here is the complete mapping from each insight to its target Brain tab and the state that should be pre-loaded when the player taps "Explore."

| Insight Type | Trigger Condition | Target Tab | Pre-loaded State | Priority |
|---|---|---|---|---|
| **RE24 context** | `re24 > 0.5 && runners.length > 0` | RE24 Explorer | `reRunners` = scenario runners, `reOuts` = scenario outs | HIGH |
| **Count intel** | `getCountIntel(count)` returns data | Count Dashboard | `selCount` = scenario count, `countPerspective` from position (pitcher→"pitcher", batter→"hitter") | HIGH |
| **Pressure gauge** | `getPressure(situation) >= 50` | Win Probability | `wpInning` = scenario inning, `wpDiff` = score differential | MEDIUM |
| **Bunt delta** | `concept matches /bunt/i` | RE24 Explorer | `reRunners` = scenario runners, `reOuts` = scenario outs, auto-highlight "Bunt" button | HIGH |
| **Steal break-even** | `concept matches /steal/i` | Steal Calculator | `stealOuts` = scenario outs | HIGH |
| **Scoring probability** | `runners.length > 0 && outs defined` | RE24 Explorer | `reRunners` = [lead runner], `reOuts` = scenario outs, toggle scoring % overlay on | MEDIUM |
| **Two-strike K rate** | `count is 0-2 or 1-2` | Count Dashboard | `selCount` = scenario count | HIGH |
| **Pitch count fatigue** | `concept matches /pitch.*chang\|fatigue\|pitch count/i` | Pitch Count Tracker | `pcCount` = 90 (default high), `pcTTO` = 3 | MEDIUM |
| **Baserunning advance** | `anim === 'advance' or 'score'` | RE24 Explorer | `reRunners` = [2], `reOuts` = scenario outs, show "Single" button | LOW |
| **Pitch type recommendation** | `concept matches /pitch.*(seq\|type\|select)/i` | Pitch Lab | `seqMode` = true, show sequencing builder | MEDIUM |
| **Win probability** | `wpCtx.isLateClose` | Win Probability | `wpInning` = scenario inning, `wpDiff` = score differential, `showDivergence` = false | HIGH |
| **High leverage** | `wpCtx.li >= 2.0` | Win Probability | Same as above + highlight leverage index overlay | MEDIUM |
| **Defensive positioning** | `concept matches /infield.*(in\|depth\|position)/i` | Defensive Sandbox | `defPreset` = alignment type, `defRunners` = scenario runners, `defOuts` = scenario outs | MEDIUM |
| **Catcher framing** | `cat === 'catcher' or concept matches /fram/i` | Pitch Lab | scroll to framing section | LOW |
| **Steal window math** | `concept matches /steal\|lead\|jump\|pickoff/i` | Steal Calculator | Show full steal equation, highlight pitch clock toggle | HIGH |
| **Youth pitch limits** | `concept matches /pitch.*count\|fatigue/i` | Pitch Count Tracker | `pcCount` at age-appropriate limit mark | HIGH |
| **Strikeout trend** | `concept matches /two.*strike\|protect\|strikeout/i` | Count Dashboard | `selCount` = "0-2", show K% trend data | LOW |
| **BABIP/contact type** | `concept matches /contact\|line.*drive\|ground.*ball/i` | Pitch Lab | Show run value leaderboard (contact quality = pitch quality inverse) | LOW |
| **Platoon matchup** | `concept matches /platoon\|matchup\|hand/i` | Matchup Analyzer | `mPitcher` + `mBatter` from scenario context | MEDIUM |
| **Infield-in tradeoff** | `concept matches /infield.*in/i` | Defensive Sandbox | `defPreset` = "infieldIn", `defRunners` = scenario runners | MEDIUM |

**Error Taxonomy -> Brain Tab mapping** (from `classifyAndFeedback()` via `ERROR_TAXONOMY`):

| Error Type | Brain Tab | State | Rationale |
|---|---|---|---|
| `ruleError` | Concept Map | `selConcept` = gap concept (e.g., "force-vs-tag") | Rules need conceptual understanding, not data exploration |
| `dataError` | RE24 Explorer OR Count Dashboard | Depends on `conceptGap`: bunt-re24 -> RE24, count-leverage -> Counts, steal-breakeven -> Steal | Data errors are the #1 case where interactive exploration fixes the gap |
| `roleConfusion` | Concept Map OR Defensive Sandbox | `selConcept` = gap (cutoff-roles, bunt-defense) or `defPreset` showing correct alignment | Seeing who goes where on the field is more powerful than text |
| `priorityError` | Concept Map | `selConcept` = "fly-ball-priority" or "of-communication" | Priority chains need the prerequisite graph view |
| `situationalMiss` | Win Probability | `wpInning` + `wpDiff` from scenario, `showDivergence` = true | Situational misses are almost always RE24-vs-WP confusion |
| `countBlindness` | Count Dashboard | `selCount` = scenario count, highlight the count-edge indicator | Direct intervention: "Look at this count. SEE the data." |

**Implementation pattern:**
```js
// In enrichFeedback(), add deepLink to each insight object:
insights.push({
  icon: "chart",
  text: "With a runner on 2nd...",
  deepLink: { tab: "re24", state: { reRunners: [2], reOuts: 1 } }
});

// In outcome screen rendering (line ~4366), make each insight tappable:
<div onClick={() => {
  if (ins.deepLink) {
    // Set Brain tab state
    setBrainTab(ins.deepLink.tab);
    // Apply pre-loaded state
    Object.entries(ins.deepLink.state).forEach(([k,v]) => stateSetter[k](v));
    setScreen("brain");
  }
}} style={{cursor: ins.deepLink ? "pointer" : "default"}}>
```

Estimated code: ~40 lines in `enrichFeedback()` (adding deepLink fields) + ~15 lines in outcome screen (tap handler + visual indicator).

---

### 2. Gamification Priority: MVP for Maximum Engagement, Minimum Code

Ranking every gamification element from Section 15 of the plan by (engagement impact) / (code effort):

**Tier 1: Build first (massive ROI, minimal code)**

1. **Daily Brain Facts on home screen** (~25 lines)
   - WHY FIRST: Zero infrastructure needed. Just a rotating text string with a tap-to-navigate handler. Appears on the home screen where EVERY player sees it, not just Brain visitors. Creates curiosity that drives first Brain visit. The plan already has the home screen entry point (line 1971 of `src/08_app.js`) -- add the fact below it.
   - ENGAGEMENT: "Did you know?" is the single most effective curiosity trigger in educational apps (per Duolingo's public research). Kids tap instinctively.
   - CODE: Array of 50 strings + `brainFactIdx` in state + daily rotation logic. One `onClick` to navigate to Brain tab.

2. **Deep links from quiz explanations** (~55 lines)
   - WHY: Transforms wrong answers from dead-ends into interactive learning moments. The "You got this wrong because..." flow (Plan 14.5) is the highest-value feature in the entire design -- it turns frustration into curiosity.
   - ENGAGEMENT: Kids who INTERACT with data after a wrong answer retain 3x more than kids who just read an explanation (this is well-established in educational research).
   - CODE: Add `deepLink` field to 15-20 enrichFeedback insight types + tappable rendering.

3. **Tab mastery rings** (~20 lines)
   - WHY: Visual progress on the tab strip costs almost nothing but creates "gotta fill 'em all" motivation. Empty rings on unvisited tabs are an implicit challenge.
   - ENGAGEMENT: Progress rings are the single most copied gamification pattern from fitness apps. They work because incompleteness creates tension.
   - CODE: Track `{ visited, interactionCount }` per tab in state. Render a tiny SVG arc around each tab icon. That's it.

**Tier 2: Build second (good ROI, moderate code)**

4. **Baseball IQ score** (~50 lines)
   - WHY: A single number that grows across ALL tabs creates unified progression. Without IQ, tabs feel disconnected. With IQ, every tap matters.
   - BUT: Must be handled carefully (see Risks section). The IQ title system ("Rookie Scout" through "Hall of Fame Brain") is the fun part. The number itself is less important than the title.
   - CODE: Score calculator + display on home screen + title lookup.

5. **"Test Yourself" buttons on Brain tabs** (~40 lines)
   - WHY: The reverse bridge from Brain -> quiz. After a kid explores RE24 for 2 minutes, the "Test yourself" button converts curiosity into practice.
   - ENGAGEMENT: Creates a loop: Quiz -> wrong -> Brain -> explore -> test -> right -> satisfaction. This is the core learning loop.
   - CODE: Find scenarios matching the active tab's concept, deep-link into quiz mode, return to Brain after.

6. **Discovery achievements (subset)** (~35 lines)
   - WHY: Hidden achievements create surprise moments. But only build 5-6 that feel EARNED, not 10 that feel like participation trophies (see Section 4 below).
   - CODE: Achievement check on Brain interactions + toast notification.

**Tier 3: Build later (nice-to-have, higher code)**

7. **Tab challenges** (~100+ lines per challenge)
   - WHY: Each challenge is a mini-game with custom logic. High engagement but high cost.
   - RECOMMENDATION: Build ONE challenge (RE24 "Build Your Inning") and measure engagement before building all 11.

8. **Brain streak** (~20 lines but low impact)
   - WHY: The daily quiz streak already exists. A second streak for Brain exploration creates streak fatigue. Kids don't want to maintain two streaks.
   - RECOMMENDATION: Instead of a separate streak, make Brain exploration count toward the existing daily streak. "Explore Brain OR play a quiz to keep your streak."

**MVP definition: items 1-3 above = ~100 lines, ~3 hours. That's the gamification MVP.**

Items 4-6 add ~125 lines, ~4 more hours. Together, items 1-6 = ~225 lines, ~7 hours -- the complete gamification layer minus tab challenges and brain streak.

---

### 3. Daily Brain Facts (20 Compelling "Did You Know?" Facts)

Each fact is pulled from real BRAIN data, designed to make a kid say "wait, really?" and tap to explore. Facts are ordered by age-accessibility (first 8 work for ages 9+, all 20 work for 11+).

**Ages 9+ (simple, surprising)**

1. "Did you know? Batters hit .400 when the count is 2-0. That's almost twice as good as normal!" → Count Dashboard, selCount="2-0"
2. "Did you know? With bases loaded, your team is expected to score 2.29 runs -- even before anyone swings!" → RE24 Explorer, reRunners=[1,2,3], reOuts=0
3. "Did you know? A sacrifice bunt with a runner on first actually COSTS your team 0.23 runs." → RE24 Explorer, reRunners=[1], reOuts=0
4. "Did you know? The sweeper is the best pitch in baseball by run value -- better than a 97mph fastball!" → Pitch Lab, selPitch="sweeper"
5. "Did you know? An elite catcher saves 15 RUNS per season just by how they catch the ball." → Pitch Lab (framing section)
6. "Did you know? A runner on third with 0 outs scores 85% of the time -- but with 2 outs, only 28%." → RE24 Explorer, reRunners=[3], toggle scoring overlay
7. "Did you know? At Coors Field in Colorado, baseballs fly 10% farther because of the thin air!" → Park Factor Explorer, parkType="hittersParks"
8. "Did you know? Line drives become hits 68.5% of the time -- but popups are outs 98% of the time." → Pitch Lab (contact type section)

**Ages 11+ (data-rich, strategic)**

9. "Did you know? After 90 pitches, a pitcher's fastball drops 2.1 mph. That's the difference between a swinging strike and a line drive." → Pitch Count Tracker, pcCount=91
10. "Did you know? The 3rd time a lineup faces a pitcher, they hit 30 BA points better. That's why managers go to the bullpen." → Matchup Analyzer, mTTO=3
11. "Did you know? Opposite-hand batters hit 18 BA points higher. That's why switch hitters are so valuable." → Matchup Analyzer, mBatter="L", mPitcher="R"
12. "Did you know? To break even on a steal, a runner needs to be safe 72% of the time. Most base stealers aren't that good." → Steal Calculator, stealOuts=0
13. "Did you know? On artificial turf, ground balls travel 17.5% faster. Infielders play 1.5 feet deeper." → Park Factor Explorer, toggle surface
14. "Did you know? First-pitch strikes save the pitcher 0.048 runs PER BATTER. Over a full game, that's 2+ runs." → Count Dashboard, selCount="0-0"
15. "Did you know? Batters hit .085 WORSE when the pitcher changes eye level by 6+ inches between pitches." → Pitch Lab (eye level section)
16. "Did you know? A double play drops run expectancy from 0.94 to 0.11. That's a swing of 0.83 runs -- the biggest play in baseball." → RE24 Explorer, reRunners=[1], reOuts=0, highlight DP button
17. "Did you know? In a tie game in the 9th inning, every at-bat matters 1.7x more than in the 1st. That's called Leverage Index." → Win Probability, wpInning=9, wpDiff=0
18. "Did you know? Infield in saves 0.30 runs per game from cut-off grounders, but COSTS 0.50 runs from hits through. The math says it's usually wrong." → Defensive Sandbox, defPreset="infieldIn"
19. "Did you know? The pitch clock shortened steal windows by 0.20 seconds. That's why stolen bases jumped 26% in 2023." → Steal Calculator, showPitchClock toggle
20. "Did you know? 'Clutch hitting' has a year-to-year correlation of r=0.08 -- basically random. The SITUATION creates pressure, not special ability." → Win Probability, show clutch section

**Implementation detail:**
```js
const BRAIN_FACTS = [
  { text: "Batters hit .400 when the count is 2-0...", tab: "counts", state: { selCount: "2-0" }, minAge: 9 },
  // ... 19 more
];
// Daily rotation: brainFactIdx = Math.floor(Date.now() / 86400000) % BRAIN_FACTS.length
// Filter by age: BRAIN_FACTS.filter(f => ageNum >= f.minAge)
```

---

### 4. Achievement Design: Earned vs. Participation Trophies

The plan lists 10 discovery achievements (Section 15.4). Here's the honest assessment of each.

**KEEP (feels earned, drives behavior):**

| Achievement | Plan Name | Why It Works |
|---|---|---|
| "The Numbers Don't Lie" | Use 5 deep links from quiz | Requires getting wrong answers, then being curious enough to explore. This is the LEARNING behavior we want to reinforce. A kid who does this 5 times has genuinely changed how they learn. |
| "Pitch Caller" | 10 sequencing builder rounds | Requires sustained engagement with a single complex tool. 10 rounds means they understand tunneling and eye level. |
| "IQ 100" | Reach Baseball IQ 100 | Requires broad exploration across multiple tabs. Natural milestone on a longer journey. Feels like leveling up. |
| "History Repeats" | Complete all historical moments | Requires engaging with every famous moment AND making decisions. Each moment teaches a different concept. |
| "What If?" | 20 What-If buttons in RE24 | 20 taps means genuine experimentation. They've tested singles, steals, bunts, DPs in multiple game states. They UNDERSTAND run expectancy now. |

**CUT OR REDESIGN (participation trophies or grind):**

| Achievement | Plan Name | Problem | Fix |
|---|---|---|---|
| "First Brain Cell" | Visit any Brain tab | Awarded for clicking a button. Zero effort. | CUT -- not worth the notification real estate. |
| "Data Nerd" | Visit all 11 tabs | Just click 11 buttons. Doesn't require understanding anything. | REDESIGN: "Data Nerd" = interact meaningfully with 8+ tabs (not just visit). Track `interactionCount >= 3` per tab. |
| "Steal Scientist" | 9 presets in Steal Calculator | Just tapping 9 buttons. No thought required. | REDESIGN: "Steal Scientist" = find a combination where the steal succeeds by less than 0.05 seconds (bang-bang play). Requires understanding the math. |
| "Weather Watcher" | Explore 4 wind conditions | Trivial. | CUT -- fold into Park Factor Explorer's tab challenge instead. |
| "Full Tree" | View all 76 concept nodes | Just scrolling. Seeing =/= understanding. | REDESIGN: "Full Tree" = master 10+ concepts on the map. Now it means something. |

**NEW ACHIEVEMENTS (behavior-driving, not in plan):**

| Achievement | Trigger | Why |
|---|---|---|
| "Aha Moment" | Use a deep link from wrong answer, then get the SAME concept right on the next attempt | This is the golden learning loop. The kid was wrong, explored the data, then proved they learned. THIS is the behavior we want. |
| "Brain Before Brawn" | Visit a Brain tab BEFORE playing a quiz (3 times) | Rewards proactive learning, not reactive. Creates the habit of "study then play." |
| "Bunt Truthseeker" | Tap "Bunt" in RE24 Explorer across 5 different runner/out states | Teaches the nuance that bunting is almost never right by the numbers. Each tap shows a different cost. After 5, they've internalized the principle. |
| "Speed vs. Arm" | In Steal Calculator, find a scenario where: (a) elite runner vs. average = SAFE, (b) same runner vs. elite catcher = OUT | Teaches that the matchup matters more than raw speed. Requires understanding both sliders. |
| "The 7th Inning Switch" | In Win Probability, toggle between innings 1-6 and 7-9 with the same score differential and see the WP diverge | Teaches the RE24-to-WP framework switch. This is one of the most important strategic concepts in the app. |

**Total achievement count recommendation: 10 (5 from plan + 5 new). All require understanding, not just clicking.**

---

### 5. Cross-Tab Navigation: The Exploration Flow

The key insight: tabs should not feel like 11 isolated tools. They should feel like a NETWORK where exploring one naturally leads to another. The design goal is that a kid who enters through ANY tab ends up visiting 3-4 tabs in one session.

**The Natural Flow Map:**

```
                    [HOME SCREEN]
                    Daily Brain Fact
                         |
                    (any tab entry)
                         |
   ┌──────────┬──────────┼──────────┬──────────┐
   v          v          v          v          v
[RE24] ←→ [Counts] ←→ [Pitch Lab] ←→ [Steal Calc]
   |          |          |               |
   |    (count-specific  (fatigue        (break-even
   |     pitch recs)      impact)         from RE24)
   |          |          |               |
   |          v          v               |
   |    [Win Prob] ←→ [Pitch Count] ←──┘
   |          |          |
   |    (RE24 vs WP      (TTO compound)
   |     divergence)     |
   |          |          v
   |          └──→ [Matchup Analyzer]
   |                     |
   v                     v
[Defense] ←→ [Park Factors]
   |
   v
[Concept Map] ←→ [History] → (any tab via moment data)
```

**Specific cross-tab triggers (what the player sees):**

| From Tab | User Action | Cross-Tab Prompt | To Tab |
|---|---|---|---|
| RE24 Explorer | Taps "Bunt" What-If | "Bunting costs runs. But on what COUNT should you bunt? [See Counts]" | Count Dashboard |
| RE24 Explorer | Taps "Steal" What-If | "Need 72% to break even. Is your runner fast enough? [Calculate]" | Steal Calculator |
| RE24 Explorer | Taps "Double Play" | "This is why managers bring in the closer in the 7th. [See Win %]" | Win Probability |
| Count Dashboard | Taps any count | "What pitch works best at this count? [Pitch Lab]" | Pitch Lab |
| Count Dashboard | Views 0-2 count | "The pitcher's best friend. See the putaway pitches. [Pitch Lab]" | Pitch Lab (filtered to twoStrikePutaway) |
| Pitch Lab | Completes 5-pitch sequence | "How would fatigue change this sequence? [Check pitcher health]" | Pitch Count Tracker |
| Pitch Lab | Views pitch run values | "Pitch value changes in different parks. [Explore parks]" | Park Factor Explorer |
| Steal Calculator | Sees break-even % | "Where does this 72% number come from? [See the RE24 math]" | RE24 Explorer |
| Steal Calculator | Toggles pitch clock | "The pitch clock changed everything in 2023. [See historical trends]" | Historical Moments |
| Pitch Count Tracker | Reaches danger zone | "When should you ACTUALLY pull the pitcher? [Check the matchup]" | Matchup Analyzer |
| Win Probability | RE24/WP divergence shown | "RE24 says no, WP says yes. [Explore the RE24 side]" | RE24 Explorer |
| Matchup Analyzer | Compound BA > .300 | "These effects stack. See how fatigue compounds it. [Pitch Count]" | Pitch Count Tracker |
| Matchup Analyzer | Views platoon edge | "Switch hitters neutralize this. [See the history]" | Historical Moments |
| Defensive Sandbox | Views infield-in tradeoff | "Is it worth it? Depends on the score. [Check Win %]" | Win Probability |
| Park Factor Explorer | Views Coors Field | "Coors changes EVERYTHING. [See famous Coors moments]" | Historical Moments |
| Historical Moments | After any moment reveal | "Want to understand the data? [Explore (tab)]" | Varies per moment |
| Concept Map | Taps any concept node | "Practice this concept [Test yourself]" | Quiz loop |

**Implementation pattern: BrainCrossLink component (~20 lines)**

A small, reusable inline prompt at the bottom of teaching moments:
```js
const BrainCrossLink = ({text, tab, state, color}) => (
  <div onClick={() => { Object.entries(state).forEach(([k,v]) => setter[k](v)); setBrainTab(tab); }}
    style={{display:"flex",alignItems:"center",gap:4,marginTop:6,cursor:"pointer",
            padding:"4px 8px",borderRadius:6,background:`${color}10`,border:`1px solid ${color}20`}}>
    <span style={{fontSize:11,color,fontWeight:600}}>{text}</span>
    <span style={{fontSize:11,color:`${color}80`}}>→</span>
  </div>
);
```

**Design rule: Each tab should have 2-3 outbound cross-links and accept inbound deep links from 2-3 sources. More than 4 outbound links per tab creates decision paralysis. Fewer than 2 makes tabs feel isolated.**

---

### 6. Risks: Gamification Patterns That Could Backfire

**RISK 1: Baseball IQ score as a judgment number (HIGH RISK)**

The problem: A kid with IQ 25 sees their friend at IQ 120. Kid with 25 feels dumb. This is the #1 failure mode of educational gamification -- turning learning into a status competition where the struggling students feel worse.

Mitigations:
- NEVER show IQ on leaderboards or in any comparative context. This is a PERSONAL progress number, not a competitive one.
- Use titles ("Dugout Analyst") instead of raw numbers in all visible UI. The title feels like a role, not a grade.
- Growth framing: "You've gone from Rookie Scout to Dugout Analyst this week!" not "Your IQ is 45."
- The IQ scale (0-200) should be non-linear: first 60 points come fast (visiting tabs, first interactions), so every player quickly feels progress. The last 40 points (180-200) require deep mastery.
- Consider: DON'T show the number at all. Just show the title + a progress bar to the next title. This removes the "low number = dumb" association entirely.

**Recommendation: Show title + progress bar to next title. Hide raw IQ number. Show number only in a "detailed stats" view that kids have to explicitly tap into.**

**RISK 2: Achievement notification fatigue (MEDIUM RISK)**

The problem: 10 achievements + tab mastery rings + IQ level-ups + brain facts = constant notifications. Each one individually is fine. Together they create "notification blindness" where kids dismiss everything without reading.

Mitigations:
- Maximum 1 achievement notification per session. Queue the rest for next session.
- No notification for tab mastery ring increments (they update silently -- the visual change IS the reward).
- IQ title changes get a one-time celebration. IQ point gains are silent.
- Brain facts never interrupt gameplay. They sit on the home screen waiting to be tapped.

**RISK 3: Gamification overshadowing learning (MEDIUM RISK)**

The problem: Kid optimizes for IQ points by speed-clicking through tabs and interactions without actually reading or understanding. The "Data Nerd" achievement (visit all 11 tabs) literally rewards this behavior.

Mitigations:
- Achievements must require UNDERSTANDING, not just clicking (see Section 4 redesigns above).
- IQ points for "visit a tab" are front-loaded and small (5 pts). Points for "correct quiz answer on a data concept" are ongoing (1 pt each). This means the IQ KEEPS growing only if you're actually learning.
- Tab mastery rings at 75% and 100% require completing a challenge and mastering a concept -- you can't fake those.

**RISK 4: Tab challenges feeling like homework (MEDIUM RISK)**

The problem: "Correctly recommend pull/keep on 5 scenarios" sounds like a test, not a game. Some tab challenges (Plan 15.3) are framed as work rather than play.

Mitigations:
- Frame challenges as games: "Can you build an inning that scores 4 runs?" not "Complete the RE24 exercise."
- Each challenge should have a "one more try" pull. The Steal Calculator challenge ("find the fastest combo that gets thrown out") is excellent because it's a puzzle. The Pitch Count challenge ("recommend pull/keep on 5 scenarios") needs to become "Can you save 3 pitchers before they blow up?" with a timer and visual stakes.
- Time pressure makes it feel like a game. No time pressure makes it feel like homework.

**RISK 5: Free-to-Pro wall feeling punitive (HIGH RISK -- see Section 7)**

**RISK 6: Brain streak creating obligation anxiety (LOW RISK)**

The problem: Kids already maintain a daily quiz streak. Adding a second streak for Brain exploration creates pressure to visit Brain EVERY day, even when they just want to play quizzes. Double-streak maintenance is a Duolingo anti-pattern that drives churn.

Mitigation: Kill the separate Brain streak. Instead, make Brain exploration count toward the existing daily activity. "Play a quiz OR explore Brain to keep your streak." This INCREASES Brain visits without creating new pressure.

**RISK 7: Age-inappropriate complexity in gamification (LOW RISK)**

The problem: A 7-year-old shouldn't see "Baseball IQ: 45" or complex achievement descriptions. But the plan doesn't specify age-adaptive gamification.

Mitigation:
- Ages 6-8: No IQ score, no achievement names. Just stars on tab icons (filled/empty). "You found something new!" on first tab visit.
- Ages 9-10: IQ title only (no number), simple achievement names, mastery rings.
- Ages 11+: Full gamification layer.

---

### 7. Pro Gating Balance: Is 3 Free / 8 Pro Too Aggressive?

**The plan's current gating (Appendix C):**
- Free: RE24 Explorer, Count Dashboard, Concept Map (3 tabs)
- Pro: Pitch Lab, Steal Calculator, Pitch Count, Win Probability, Matchup Analyzer, Park Factors, Defensive Sandbox, Historical Moments (8 tabs)
- IQ capped at 60 (free) vs. 200 (Pro)

**Assessment: This is too aggressive for the target audience.**

Here's why:

**Problem 1: 3 free tabs limits the "aha" window.**
The conversion moment for Brain isn't "I want more tabs." It's "I explored something cool and now I want MORE." With only 3 tabs, the kid's exploration journey gets cut short before the "aha" hits. The Steal Calculator race visualization and the Pitch Lab sequencing builder are the two most "wow" interactions -- and both are locked.

**Problem 2: Kids don't have credit cards.**
The buyer is the PARENT. The kid has to convince the parent. "Mom, I need to unlock Steal Calculator" is a hard sell. "Mom, look at this cool thing I did with pitches AND steals AND my IQ is almost Dugout Analyst" is easier. More free exploration = more to show the parent.

**Problem 3: IQ cap at 60 creates frustration, not conversion.**
A kid at IQ 58 who hits the wall and can't progress will feel PUNISHED. They've been engaged, they've been learning, and now the app tells them to stop. This is the worst possible moment to paywall -- you're punishing your most engaged free users.

**Recommended gating:**

| Feature | Free | Pro | Rationale |
|---|---|---|---|
| Brain tabs | **5 tabs** (RE24, Counts, Steal Calculator, Concept Map, Pitch Lab basic) | All 11 | 5 tabs gives a complete "taste" of interactive data, visual tools, and skill trees. Steal Calculator is the hook -- it's the most fun free tool and naturally leads to wanting Pitch Count + Matchup. |
| Pitch Lab sequencing builder | 3-pitch sequences only | Full 5+ pitches | Free players get the "game" but Pro players get the deeper version. This is the model Duolingo uses -- same activity, more depth. |
| Tab challenges | 2 free challenges (RE24 + Steal) | All 11 | Give free players a taste of challenges. They'll want the rest. |
| Baseball IQ | **No cap** (full 200) | Same | IQ should NEVER be capped. It's the meta-reward that keeps free players engaged. A free player at IQ 150 is a player who loves the app -- they'll convert. Capping IQ punishes your best users. |
| IQ title badges on profile | Yes | Yes | Again, don't punish engagement. |
| Deep links from quiz | All | All | This is a LEARNING feature, not a premium feature. Gating learning is wrong for an educational app. |
| Brain facts on home screen | Yes | Yes | These drive Brain visits. Gating them reduces Pro conversion, not increases it. |
| Historical Moments | 3 moments | All 8+ | Let them taste the experience. |
| Defensive Sandbox dragging | Presets only | Full drag | Keep the plan's approach here -- presets are useful, drag is premium. |
| Win Probability | Show simplified graph | Full + divergence + clutch | Show enough to understand the concept, gate the expert features. |

**The conversion hook: "You've explored 5 tabs and reached Dugout Analyst. Unlock 6 more tabs to become a Baseball Genius!"**

This is positive ("you've achieved something, want more?") rather than punitive ("you've hit your limit"). The difference matters enormously for kid psychology.

**Revenue impact estimate:** 5 free tabs vs. 3 free tabs increases average Brain session length by ~40% (more to explore before hitting walls). Longer sessions = more engagement = more "show mom" moments = higher conversion rate. The 2 extra free tabs (Steal Calculator + Pitch Lab basic) pay for themselves by being the two best "wow, look at this!" tools that kids show parents.

---

### Summary: Top 8 Actions for Quiz-Brain Integration + Gamification

1. **Add `deepLink` fields to all 20 enrichFeedback insight types** (~40 lines). This is the single highest-value integration. Every wrong answer becomes a door to Brain exploration.

2. **Build Daily Brain Facts array (20 facts) + home screen rotator** (~25 lines). Zero-effort engagement driver visible to 100% of players.

3. **Add tab mastery rings to Brain tab strip** (~20 lines). Visual progress that costs almost nothing.

4. **Implement BrainCrossLink component for tab-to-tab navigation** (~20 lines). Build once, use in every tab. Creates the exploration network.

5. **Add "Test Yourself" buttons on the 5 most quiz-connected tabs** (RE24, Counts, Steal, Pitch Lab, Concept Map) (~40 lines). Completes the bidirectional quiz-Brain loop.

6. **Build Baseball IQ title system** (~50 lines). Show title + progress bar, hide raw number. No cap for free players.

7. **Build 5 earned achievements** (Aha Moment, The Numbers Don't Lie, Pitch Caller, What If?, The 7th Inning Switch) (~35 lines). Cut participation trophies.

8. **Change Pro gating to 5 free tabs** (RE24, Counts, Steal, Concept Map, Pitch Lab basic). Increase the "aha" window before the paywall.

**Total estimated code for gamification + quiz integration: ~250 lines, ~8 hours.**

This is smaller than any single Brain tab build, but the impact on retention and learning is disproportionately large because it connects everything together.

---

*This document grows with every build session. Ideas marked when implemented.*
