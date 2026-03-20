# Baseball Brain: The Maximum Build Plan

**Date:** 2026-03-20
**Status:** Comprehensive Design Document
**Author:** Thought Partner Analysis (Deep BRAIN Data Audit + UX + Gamification + Age-Adaptive Design)

---

## Table of Contents

1. [Executive Vision](#1-executive-vision)
2. [BRAIN Data Audit: What We Have](#2-brain-data-audit)
3. [Tab 1: RE24 Explorer (Maximum Version)](#3-re24-explorer)
4. [Tab 2: Count Dashboard (Maximum Version)](#4-count-dashboard)
5. [Tab 3: Pitch Lab (Maximum Version)](#5-pitch-lab)
6. [Tab 4: Concept Map (Maximum Version)](#6-concept-map)
7. [Tab 5: Steal Calculator (NEW)](#7-steal-calculator)
8. [Tab 6: Pitch Count Tracker (NEW)](#8-pitch-count-tracker)
9. [Tab 7: Win Probability Live Graph (NEW)](#9-win-probability)
10. [Tab 8: Matchup Analyzer (NEW)](#10-matchup-analyzer)
11. [Tab 9: Park Factor Explorer (NEW)](#11-park-factor-explorer)
12. [Tab 10: Defensive Positioning Sandbox (NEW)](#12-defensive-positioning)
13. [Tab 11: Historical Moments (NEW)](#13-historical-moments)
14. [Quiz Loop Integration](#14-quiz-loop-integration)
15. [Gamification of Exploration](#15-gamification)
16. [Age-Adaptive Presentation Matrix](#16-age-adaptive)
17. [Technical Feasibility & Line Estimates](#17-technical-feasibility)
18. [Build Order](#18-build-order)

---

## 1. Executive Vision

Baseball Brain is not a reference section. It is a **playground** where kids discover the hidden math of baseball by touching it.

The design principle: **every number has a story, and every story has a number.** An 8-year-old tapping runners onto bases should feel like they're playing a game. A 16-year-old dragging a slider into a sequencing chain should feel like they're calling pitches in the World Series.

Baseball Brain serves three audiences simultaneously:
- **The curious 8-year-old** who wants to know "what happens if I put a runner on third?"
- **The competitive 12-year-old** who wants to know "why does my coach call a bunt here?"
- **The analytical 16-year-old** who wants to know "is a 3-1 slider ever the right pitch?"

Every tab must work for all three. Not by dumbing down the data, but by layering the presentation so each age group sees exactly what challenges them.

### Navigation Design

Baseball Brain lives as a top-level section accessible from the home screen, equal in visual weight to "Play" and "Practice." It is NOT buried in settings or behind a "more" menu. On the home screen, a brain icon with a pulsing glow reads "Baseball Brain" with a subtitle that rotates through teaser hooks:

- "Did you know batters hit .400 on 2-0 counts?"
- "How fast does a catcher need to throw to stop a steal?"
- "What pitch is hardest to hit in baseball?"

Inside Baseball Brain, tabs are arranged as a horizontal scrollable strip with icons. Each tab icon has a small mastery ring (empty to full) showing how much the player has explored.

---

## 2. BRAIN Data Audit

### What Exists Today (458 lines, 18 data sections)

| Data Section | Lines | Currently Used By | Orphaned? | Brain Tab |
|---|---|---|---|---|
| `RE24` (8 states x 3 outs) | 5 | `getRunExpectancy()`, `enrichFeedback()`, `formatBrainStats()`, `formatBrainForAI()` | No | RE24 Explorer |
| `countData` (12 counts) | 13 | `getCountIntel()`, `enrichFeedback()`, `formatBrainStats()` | No | Count Dashboard |
| `stealBreakEven` (by outs) | 1 | `evaluateSteal()`, `formatBrainStats()` | No | Steal Calculator |
| `buntDelta` (3 situations) | 1 | `evaluateBunt()`, `formatBrainStats()` | No | RE24 Explorer |
| `ttoEffect` (3 TTO levels) | 1 | `formatBrainStats()`, `formatBrainForAI()` | Partially | Matchup Analyzer |
| `matchupMatrix.platoon` | 6 | `getMatchupData()` (zero callers!) | **YES** | Matchup Analyzer |
| `matchupMatrix.ttoCompound` | 4 | `getMatchupData()` (zero callers!) | **YES** | Matchup Analyzer |
| `matchupMatrix.leverageIndex` | 8 | Never read | **YES** | Win Probability |
| `matchupMatrix.pitchCountMatrix` | 8 | `getMatchupData()` (zero callers!) | **YES** | Pitch Count Tracker |
| `parkAndEnvironment.parkFactors` | 6 | Never read | **YES** | Park Factor Explorer |
| `parkAndEnvironment.wind` | 8 | Never read | **YES** | Park Factor Explorer |
| `parkAndEnvironment.surface` | 3 | Never read | **YES** | Park Factor Explorer |
| `parkAndEnvironment.temperature` | 8 | Never read | **YES** | Park Factor Explorer |
| `levelAdjustments` (5 levels + vocab) | 35 | `getLevelContext()` | No | Age layer |
| `popTime` / `timeToPlate` | 2 | Never read directly | **YES** | Steal Calculator |
| `pickoffSuccess` | 1 | Never read directly | **YES** | Steal Calculator |
| `pitchClockViolations` | 6 | Never read | **YES** | Steal Calculator |
| `baserunningRates` | 8 | 1 line in `enrichFeedback()` | Mostly orphaned | RE24 Explorer |
| `countRates` (K/BB/foul per count) | 6 | `enrichFeedback()` (2-strike only) | Mostly orphaned | Count Dashboard |
| `stealWindow` (delivery/pop/runner) | 6 | Never read | **YES** | Steal Calculator |
| `pitchCountThresholds` | 6 | Never read | **YES** | Pitch Count Tracker |
| `scoringProb` (by base x outs) | 4 | `enrichFeedback()`, `getSmartCoachLine()` | No | RE24 Explorer |
| `firstPitchValue` | 5 | Never read directly | **YES** | Count Dashboard |
| `catcherFramingValue` | 8 | Never read | **YES** | Pitch Lab |
| `leagueTrends` (K%, BB%, BABIP, HBP) | 25 | Never read | **YES** | Historical tab |
| `infieldInRunImpact` | 8 | Never read directly | **YES** | Defensive Sandbox |
| `pitchTypeData` (8 types + sequencing) | 50 | `getPitchRecommendation()`, `formatBrainStats()` | No | Pitch Lab |
| `winProbability` (by inning x score) | 25 | `getWinContext()` | No | Win Probability |
| `defensivePositioning` | 30 | `evaluateDefensiveAlignment()` | Partially | Defensive Sandbox |
| `concepts` (76 concepts) | 76 | Multiple functions | No | Concept Map |
| `coaching.situational` (40 lines) | 40 | `getSmartCoachLine()` | No | All tabs |

**Summary: ~140 lines of BRAIN data (30.5%) are completely orphaned.** An additional ~40 lines are partially orphaned (function exists but has zero callers, or only 1 of 8 fields is read). Baseball Brain activates ALL of it.

### New Data Needed

| Tab | New Data Required | Lines | Source |
|---|---|---|---|
| Park Factor Explorer | 30 park factor values (Coors=120, etc.) | ~30 | FanGraphs |
| Historical Moments | 8-12 famous game states | ~60 | Public record |
| Steal Calculator | None (stealWindow + popTime + timeToPlate already exist) | 0 | -- |
| Win Probability | Extended WP table (innings 2,4,5 + extra innings) | ~20 | The Book |

**Total new data: ~110 lines.** Everything else uses existing BRAIN data.

---

## 3. Tab 1: RE24 Explorer (Maximum Version)

### Core Experience

A visual baseball diamond (reusing the existing Field SVG) where kids tap to place runners on bases and select outs. The expected runs number updates live with smooth counting animation.

### Interactions

**Runner Placement (Primary)**
- Tap 1B, 2B, 3B to toggle runners on/off
- Each runner appears as a Guy() component (reusing existing sprites)
- As runners are added/removed, the RE24 number counts up/down with easing animation
- The diamond background subtly glows green (high RE24) or dims red (low RE24)

**Outs Selector**
- Three baseball icons at the bottom: tap to cycle 0-1-2 outs
- Filled baseballs = outs recorded, empty = remaining
- Each out change triggers RE24 recalculation with number animation

**"What If?" Action Buttons**
Six context-aware buttons appear based on the current state:

| Button | Appears When | Effect |
|---|---|---|
| "Bunt" | Runner on 1st or 2nd, <2 outs | Shows RE24 delta, animates runner advancing + out added |
| "Steal" | Runner on 1st or 2nd | Shows break-even %, splits into SAFE/OUT outcomes |
| "Single" | Any state | Advances runners per baserunningRates, shows new RE24 |
| "Double" | Any state | Clears bases, runners score per advancement rates |
| "Sac Fly" | Runner on 3rd, <2 outs | Runner scores, out added, shows RE24 change |
| "Strikeout" | Any state | Out added, runners stay, shows RE24 drop |
| "Walk" | Any state | Advances forced runners, adds batter to 1st |
| "Double Play" | Runner on 1st, <2 outs | Two outs, shows devastating RE24 collapse |

Each "What If?" button animates:
1. A brief Field animation showing the play (reuse existing ANIM_DATA)
2. The RE24 number morphing from old to new
3. A delta badge: "+0.62 runs" (green) or "-0.23 runs" (red)
4. A one-sentence teaching moment: "A single with a runner on 2nd scores them 62% of the time!"

**Scoring Probability Overlay**
Toggle a "Scoring %" mode where each runner shows their individual probability of scoring (from `BRAIN.stats.scoringProb`). Visual: a percentage badge floating above each runner sprite.

- Runner on 3rd, 0 outs: "85%" badge in bright green
- Runner on 1st, 2 outs: "13%" badge in dim red

**Sandbox Mode ("Build Your Inning")**
A full simulation mode where the player builds an entire half-inning:
1. Start at 0 outs, bases empty
2. Each "What If?" button advances the state
3. Track total runs scored
4. At 3 outs, show: "Your inning scored X runs. The average is Y."
5. "Try again" resets. "Beat your best" adds competition.

**Comparison Mode**
Side-by-side: "What if the runner steals?" Left shows success path, right shows caught-stealing path. Both RE24 values displayed with a verdict: "The steal needs to work 72% of the time to be worth it. Is your runner that fast?"

### Age-Adaptive Layers

| Age | RE24 Label | Number Format | "What If?" Language | Data Depth |
|---|---|---|---|---|
| 6-8 | "Chance to Score" | Stars (1-5) | "Hit! Runner goes to third!" | No decimals, no percentages |
| 9-10 | "Expected Runs" | Round to 1 decimal | "Single: +0.6 runs for your team" | Simple percentages |
| 11-12 | "Run Expectancy" | 2 decimals | "Single raises RE from 0.94 to 1.56" | Full deltas |
| 13-15 | "RE24" | 2 decimals + delta | "RE24 delta: +0.62. Bunt costs -0.23." | All math visible |
| 16-18 | "RE24 Matrix" | Full table view | "RE24 shifts: compare bunt vs swing." | Table mode + all 24 states |

**6-8 Special Mode: "Help the Runners Score!"**
Instead of abstract numbers, the 6-8 version frames it as a game:
- "You have 3 chances (outs) to get all the runners home!"
- Stars represent how likely the team is to score (1 star = unlikely, 5 stars = great chance)
- "What If?" buttons say things like "Hit the ball!" and "The runner runs fast!"
- Animations play automatically, showing runners moving

**16-18 Expert Mode: Full Matrix View**
A toggleable 8x3 grid showing all 24 RE24 states simultaneously. Tap any cell to set the diamond to that state. Color-coded heatmap from green (high RE) to red (low RE). This is the FanGraphs view, adapted for a phone screen.

### Technical: ~250-300 lines
- Reuses existing Field SVG, Guy() components, ANIM_DATA
- All data from `BRAIN.stats.RE24`, `scoringProb`, `buntDelta`, `stealBreakEven`, `baserunningRates`
- New: number animation component (~30 lines), "What If?" button row (~80 lines), state management (~60 lines), age-adaptive text layer (~40 lines), sandbox mode (~80 lines)

---

## 4. Tab 2: Count Dashboard (Maximum Version)

### Core Experience

A 4x3 grid of count cells (balls on Y-axis 0-3, strikes on X-axis 0-2) forming the complete count matrix. The current count is highlighted. Tapping any count reveals detailed stats and strategic guidance.

### Visual Design

**The Grid**
- 12 cells arranged as a baseball count board
- Each cell shows: the count (e.g., "2-1"), a color gradient (green for hitter's counts, red for pitcher's counts, yellow for neutral), and one key stat visible at a glance (BA for 13+, "Hitter's advantage!" for younger)
- The cell size is proportional to how often that count occurs in a game (bigger = more common)
- Impossible counts (4-0, 0-3, etc.) are absent; the grid is naturally shaped

**Count Detail Panel (Tap to Expand)**
When a count is tapped, a panel slides up showing:

| Field | Source | Example (2-0 count) |
|---|---|---|
| BA | `countData[count].ba` | .400 |
| OBP | `countData[count].obp` | .400 |
| SLG | `countData[count].slg` | .665 |
| K% on next pitch | `countRates[count].k` | 6% |
| BB% on next pitch | `countRates[count].bb` | 0% |
| Foul% on next pitch | `countRates[count].fouls` | 14% |
| Walk rate from this count | `leagueTrends.countWalkRates[count]` | 18% |
| Label | `countData[count].label` | "Best Hitter's Count" |
| Edge | `countData[count].edge` | "hitter" |
| Pitch recommendation | `getPitchRecommendation(count)` | "Cutter — must throw strike" |

**Progression Arrows**
From any selected count, arrows show the three possible outcomes of the next pitch:
- **Strike arrow** (red): points to the next count (e.g., 2-0 to 2-1), with BA at that count
- **Ball arrow** (green): points to the next count (e.g., 2-0 to 3-0), with BA and walk%
- **Foul arrow** (yellow): same count (if 2 strikes) or to next strike count
- **In play arrow** (blue): shows the BA/OBP for contact on this count

Each arrow shows the probability from `countRates` (e.g., "Strike: 40% chance, leads to .340 BA").

**The Count Journey**
Animated mode: watch a "typical at-bat" play out pitch by pitch. The count grid highlights each count in sequence as the at-bat progresses. Based on actual pitch-by-pitch probabilities from `countRates`.

Example journey: 0-0 (first pitch strike, 40%) -> 0-1 (ball, 35%) -> 1-1 (foul, 18%) -> 1-2 (ball, 25%) -> 2-2 (strikeout, 20%). Shows how each pitch changes the balance of power.

**Hitter vs Pitcher Toggle**
A toggle at the top switches the entire dashboard between:
- **Hitter's View**: "How do I win this at-bat?" Emphasizes BA, OBP, approach tips
- **Pitcher's View**: "How do I get this batter out?" Emphasizes K%, pitch selection, sequencing tips

The same data, different framing. Teaches perspective-taking.

**First-Pitch Deep Dive**
A special expanded section for the 0-0 count using `firstPitchValue`:
- "First-pitch strikes save 0.048 runs per batter"
- "Elite pitchers throw strike 68% of the time"
- "If batter swings first pitch: .340 BA. If batter takes: .315 BA."
- "After 0-1: K rate jumps to 24%, walk rate drops to 5%"
- Visual: a split-screen showing the two paths from 0-0 (strike vs ball)

**Count Heat Map Animation**
An animated heat map showing BA across all counts simultaneously. Colors smoothly transition. Kids can see the "terrain" of the strike zone count — pitcher's counts are a valley, hitter's counts are a mountain.

### Age-Adaptive Layers

| Age | Grid Labels | Stats Shown | Language |
|---|---|---|---|
| 6-8 | Emoji faces (happy hitter / happy pitcher / neutral) | None (just faces) | "The hitter is in charge!" |
| 9-10 | "Hitter's count" / "Pitcher's count" | BA only | "Batters get a hit 4 out of 10 times here!" |
| 11-12 | Count + BA + K% | BA, K%, BB% | "At 0-2, the pitcher strikes out the batter 27% of the time." |
| 13-15 | All stats | Full panel | "2-0: .400 BA, .665 SLG. Best hitter's count in baseball." |
| 16-18 | All stats + pitch recommendations | Full + sequencing | "2-0: Sit dead-red fastball. Pitcher must throw a strike." |

### Technical: ~200-250 lines
- Data from `countData`, `countRates`, `firstPitchValue`, `leagueTrends.countWalkRates`
- New: grid component (~60 lines), detail panel (~50 lines), progression arrows (~40 lines), count journey animation (~40 lines), age-adaptive layer (~30 lines), heat map (~30 lines)

---

## 5. Tab 3: Pitch Lab (Maximum Version)

### Core Experience

A "pitch workshop" where players explore 8 pitch types, see their movement paths, compare effectiveness, and build pitch sequences.

### The Pitch Gallery

Eight pitch cards arranged in a 2x4 grid (or horizontal scroll on mobile). Each card shows:
- Pitch name and nickname (e.g., "Sweeper (Wide Slider)")
- Velocity badge (e.g., "83 mph")
- Movement animation: a mini SVG showing the pitch's trajectory from release to plate
- Run value badge: color-coded from green (-1.6, best) to red (+0.2, worst)
- Usage bar: how often MLB pitchers throw this pitch (from `pitchTypeData.types[x].usage`)

**Pitch Detail View (Tap to Expand)**

| Field | Source | Example (Sweeper) |
|---|---|---|
| Name | `types.sweeper.name` | "Sweeper (Wide Slider)" |
| Velocity | `types.sweeper.velo` | 83 mph |
| wOBA against | `types.sweeper.woba` | .280 |
| Run value / 100 | `types.sweeper.rv100` | -1.6 |
| Usage | `types.sweeper.usage` | 9% |
| Best counts | `types.sweeper.bestCounts` | 0-2, 1-2 |
| Worst counts | `types.sweeper.worstCounts` | 3-2, 3-0 |
| Description | `types.sweeper.description` | "Wide horizontal break..." |
| Tunnels with | `types.sweeper.tunnelsWith` | (if defined) |

### Pitch Movement Visualizer

The centerpiece of Pitch Lab. A side-view SVG showing the pitch traveling from pitcher's hand to home plate. Each pitch type has a unique trajectory:

| Pitch | Visual Trajectory |
|---|---|
| Four-seam | Straight line, slight "rise" (backspin illusion) |
| Sinker | Starts straight, drops 4-6 inches at plate |
| Cutter | Slight late horizontal break (2-3 inches) |
| Changeup | Matches fastball path for 40 feet, then drops 6-8 inches |
| Slider | Lateral break + slight drop, 4-5 inches |
| Curveball | Big 12-to-6 arc, 10+ inches of drop |
| Sweeper | Wide horizontal sweep, 12+ inches lateral |
| Splitter | Fastball path for 50 feet, then falls off the table |

Each trajectory is an SVG `<path>` with SMIL animation. The pitch takes ~1.5 seconds (real-time feel). Players can:
- Tap "Throw" to see the pitch animate
- Toggle "Slow motion" (3x slower) to see the break develop
- Toggle "Overlay" to see two pitches superimposed (key for tunneling)

**Tunneling Visualization**
The most important teaching tool. Show two pitches overlaid:
- Four-seam + changeup: identical paths for 40 feet, then diverge
- Four-seam + curveball: both start at same release point, then separate
- Slider + sweeper: similar release, different break angles

A label explains: "These two pitches look IDENTICAL to the hitter for the first 40 feet. By the time the hitter sees the difference, it's too late."

This directly teaches `eye-level-change` and `pitch-sequencing` concepts. Link from the eye-level principle data: "Batters hit .085 worse when the next pitch changes vertical location by 6+ inches."

### Pitch Sequencing Builder

An interactive "call the game" mode:
1. Player selects a pitch from the 8 options
2. The pitch animates to the plate
3. The dashboard shows: "After [pitch], the best next pitch is [X] because [reason]"
4. Player picks the next pitch
5. After 5 pitches, the app grades the sequence: "Great sequence! You changed eye levels 3 times and used proper tunneling."

Uses `pitchTypeData.sequencing` for all recommendations:
- `afterFastball`: best = changeup, second = slider, avoid = curveball
- `afterOffspeed`: best = fourSeam, second = cutter, avoid = changeup
- `twoStrikePutaway`: sweeper, slider, changeup, splitter, cutter
- `firstPitch`: fourSeam, sinker, cutter
- `hittersCount`: cutter, sinker, fourSeam

**Scoring the Sequence**
Each pitch-to-pitch transition earns points:
- +3 for following `sequencing` recommendation
- +2 for changing eye level (high to low or vice versa)
- +1 for speed change > 5 mph
- -1 for same pitch twice in a row
- -2 for throwing the `avoid` pitch after a given type

**Velocity Comparison Bar**
A horizontal bar chart showing all 8 pitches sorted by velocity. Visual gap between fastball (94 mph) and offspeed (79-87 mph) teaches why speed differential matters.

**Run Value Leaderboard**
Pitches ranked from best (sweeper -1.6) to worst (four-seam +0.2). Teaches that "harder" isn't always "better." The best pitch in baseball by run value is the sweeper, not the fastball.

### Catcher Framing Section

A dedicated sub-panel using `catcherFramingValue`:
- "Elite framers save +15 runs per season"
- "Each stolen strike is worth 0.125 runs"
- "Best counts for framing: 0-0, 1-0, 2-0, 3-1, 3-2 (borderline pitches matter most)"
- "Worst counts for framing: 0-2, 1-2 (umpire expects offspeed anyway)"
- Visual: a strike zone with borderline pitches highlighted, showing which ones elite framers steal

### Eye Level Principle Section

Dedicated visualization of `pitchTypeData.eyeLevelPrinciple`:
- Side-view SVG showing two pitches: one high, one low
- Arrow indicating vertical distance
- "Batters hit .085 worse on the pitch AFTER a 6+ inch vertical change"
- Three animated examples from the `examples` array

### Age-Adaptive Layers

| Age | Pitch Types Shown | Stats | Sequencing |
|---|---|---|---|
| 6-8 | 3 (fastball, changeup, curveball) | "Fast!" / "Tricky!" / "Curvy!" | "Throw fast, then slow!" |
| 9-10 | 5 (+ slider, sinker) | Speed only | "After a fast pitch, try a slow one!" |
| 11-12 | All 8 | Speed + description | Basic sequencing builder (3 pitches) |
| 13-15 | All 8 | All stats | Full sequencing builder (5 pitches) |
| 16-18 | All 8 + framing + tunneling | All stats + wOBA + rv/100 | Expert mode: call a full at-bat |

### Technical: ~350-400 lines
- Data from `pitchTypeData` (types, sequencing, velocityBands, eyeLevelPrinciple), `catcherFramingValue`
- New: pitch cards (~60 lines), movement SVG paths (~80 lines), tunneling overlay (~50 lines), sequencing builder (~80 lines), scoring logic (~30 lines), framing section (~40 lines), age layer (~30 lines)
- Reuses: existing pitch animation infrastructure from AF3 (curveball/slider/changeup paths already exist in Field())

---

## 6. Tab 4: Concept Map (Maximum Version)

### Core Experience

An RPG-style skill tree showing all 76 concepts as nodes in a visual graph. Nodes are colored by mastery state, connected by prerequisite lines, and grouped by domain.

### Visual Design

**The Tree Layout**
The concept graph is laid out as a top-down tree with domain groupings:

```
                [FUNDAMENTALS]
    Force/Tag    Fly Priority    Backup Duties
         |            |               |
    [DEFENSE]    [BASERUNNING]   [PITCHING]    [HITTING]    [STRATEGY]    [RULES]    [MENTAL]
```

Each domain gets a distinct color family:
- Defense: blue
- Baserunning: green
- Pitching: red/orange
- Hitting: yellow
- Strategy: purple
- Rules: gray
- Mental: teal

**Node States (Mastery-Colored)**

| State | Visual | Border | Interior | Icon |
|---|---|---|---|---|
| Unseen | Grayed out, locked | Dashed gray | Dark gray | Lock icon |
| Introduced | Dim glow | Thin color | 25% opacity fill | Eye icon |
| Learning | Visible | Medium color | 50% opacity fill | Book icon |
| Mastered | Full glow + pulse | Thick color + glow | 100% opacity fill | Star icon |
| Degraded | Warning state | Amber border | 75% opacity + cracks | Warning icon |

**Prerequisite Lines**
Lines connect prereqs to dependents:
- Solid green line: prereq mastered (path open)
- Dashed gray line: prereq not mastered (path locked)
- Animated pulse on lines that lead to the next unlockable concept

**Node Detail (Tap to Expand)**

| Field | Source | Example |
|---|---|---|
| Name | `concepts[tag].name` | "Steal Break-Even Rate" |
| Domain | `concepts[tag].domain` | "baserunning" |
| Difficulty | `concepts[tag].diff` | 2 |
| Age minimum | `concepts[tag].ageMin` | 11 |
| Prerequisites | `concepts[tag].prereqs` | ["tag-up"] -> "Tagging Up on Fly Balls" |
| Mastery state | `masteryData.concepts[tag].state` | "learning" |
| Accuracy | `totalCorrect / totalAttempts` | "67% (4/6)" |
| Last practiced | `lastAttemptDate` | "2 days ago" |
| Next review | `nextReviewDate` | "Tomorrow" |
| Scenarios available | Count from SCENARIOS | "12 scenarios" |

**"Practice This" Button**
On the detail panel, a button that:
1. Finds a scenario matching this concept and the player's current difficulty level
2. Deep-links directly into the quiz loop with that scenario loaded
3. Returns to the Concept Map afterward with updated mastery

**"What Unlocks?" Preview**
Shows which concepts this one unlocks:
- "Master 'Steal Break-Even' to unlock: Hit-and-Run, Sacrifice Bunt RE24"
- Unlockable concepts shown as dim nodes with a "Coming soon" label

### Progress Dashboard

At the top of the Concept Map:
- **Total mastered**: "23 / 76 concepts mastered" with a circular progress ring
- **Domain bars**: mini progress bars per domain (Defense: 8/18, Pitching: 3/12, etc.)
- **"Ready to unlock" count**: "5 concepts ready to learn!" (all prereqs mastered, age-appropriate)
- **"Needs review" count**: "3 concepts degrading!" (mastered but degraded or due)

### Animated Mastery Celebration

When a concept transitions from "learning" to "mastered" (detected on return from quiz):
- The node explodes with particles (reuse existing particle system from graphics overhaul)
- Connected "next" nodes light up and pulse
- A banner: "Concept Mastered: Steal Break-Even! You unlocked: Hit-and-Run!"
- Sound effect (achievement chime from existing Web Audio system)

### Domain Deep Dive

Tap a domain header to see:
- All concepts in that domain, sorted by prerequisite depth
- A "learning path" suggested order
- The player's current position on the path
- "Next step" recommendation

### Search & Filter

- Search bar: type "steal" to highlight all steal-related concepts
- Filter by: domain, difficulty, mastery state, age group
- "Show me what I can learn now" filter: only concepts where prereqs are mastered and age is met

### Age-Adaptive Layers

| Age | Layout | Node Labels | Detail Level |
|---|---|---|---|
| 6-8 | Simple list by domain (not graph) | Kid-friendly names + emoji | "You learned Force vs Tag!" |
| 9-10 | Simplified tree (3 levels deep) | Short names | Basic stats (accuracy, plays) |
| 11-12 | Full tree | Full names | Full detail panel |
| 13-15 | Full tree + stats | Full names + accuracy | All stats + learning path |
| 16-18 | Full tree + stats + prereq graph depth | Full + difficulty indicators | Expert view with all data |

### Technical: ~300-350 lines
- Data from `BRAIN.concepts` (76 concepts with name, domain, prereqs, ageMin, diff)
- Data from `masteryData.concepts` (per-concept state, accuracy, dates)
- New: tree layout algorithm (~80 lines), node rendering (~60 lines), detail panel (~50 lines), progress dashboard (~40 lines), mastery celebration (~30 lines), search/filter (~40 lines), age layer (~30 lines)

---

## 7. Tab 5: Steal Calculator (NEW)

### Core Experience

An interactive calculator where players set delivery time, pop time, and runner speed to determine if a steal attempt will succeed. Visual: a timeline showing the race between the throw and the runner.

### The Steal Equation

The fundamental equation the calculator teaches:

```
Steal Window = Delivery Time + Pop Time
Runner Time = Time from lead to base

If Runner Time < Steal Window: SAFE
If Runner Time > Steal Window: OUT
```

### Interface

**Three Sliders**

| Slider | Range | Labels | Source |
|---|---|---|---|
| Delivery Time | 1.20s - 1.55s | Quick / Average / Slow (+ lefty variants) | `stealWindow.deliveryTime` |
| Pop Time | 1.85s - 2.15s | Elite / Average / Slow | `stealWindow.popTime` (also `popTime`) |
| Runner Speed | 3.30s - 3.80s | Elite / Average / Slow | `stealWindow.runnerTime` |

**The Race Visualization**
A horizontal timeline SVG showing two parallel tracks:
- **Top track**: Ball path (pitcher -> catcher -> second base)
  - Segment 1: Delivery time (pitcher to plate)
  - Segment 2: Pop time (catch to throw arriving at 2B)
- **Bottom track**: Runner path (lead -> second base)
  - Single segment: Runner time

Both tracks animate simultaneously. The viewer sees which arrives first. Color-coded result:
- Green flash + "SAFE!" if runner beats throw
- Red flash + "OUT!" if throw beats runner
- Yellow flash + "BANG-BANG!" if within 0.05s

**Difficulty: "Close play" threshold**: from `stealWindow.stealViability`:
- Easy: runner has 0.30s+ margin (delivery + pop > runner time + 0.30)
- Marginal: 0.15-0.30s margin
- Tough: <0.15s margin

**Pitch Clock Effect Toggle**
A button showing: "Pitch clock shortens delivery by 0.20s" (from `stealWindow.pitchClockEffect`).
Toggle between pre-2023 and post-2023 steal windows. Visual: the delivery segment shrinks/grows.

**Pickoff Risk Panel**
Below the calculator, using `pickoffSuccess`:
- "Blind throw: 8% success"
- "Read throw: 28% success"
- "Daylight play: 35% success"
- "Post-pitch-clock: only 2 free pickoff attempts per at-bat!"

Teaching moment: "Pitchers used to throw over as much as they wanted. Now they get 2 free tries. A 3rd attempt that doesn't get the runner = BALK."

**Break-Even Calculator**
Integrates with RE24: "At 0 outs, you need a 72% success rate to break even. Based on these times, your chance of being safe is approximately X%."

Uses `stealBreakEven[outs]` for the threshold and the slider values for the outcome estimate.

**Presets**
Quick-set buttons:
- "MLB Average" (1.35s delivery, 2.00s pop, 3.55s runner)
- "Easy steal" (1.55s slow pitcher, 2.15s slow catcher, 3.30s elite runner)
- "No chance" (1.20s quick pitcher, 1.85s elite catcher, 3.80s slow runner)
- "Youth league" (adjusted for age-appropriate times, leads not allowed pre-youth-pitch)

### Age-Adaptive Layers

| Age | Interface | Math Shown | Teaching |
|---|---|---|---|
| 6-8 | Two runners racing (no numbers) | None | "Can the runner beat the ball?" |
| 9-10 | Sliders with "Fast/Medium/Slow" | Total times only | "Fast runner + slow throw = SAFE!" |
| 11-12 | Sliders with seconds | Full equation | "1.35 + 2.00 = 3.35s. Runner needs 3.30s. Close!" |
| 13+ | Full calculator | All decimals + break-even | "Steal window: 3.35s. Runner: 3.55s. Out by 0.20s." |

### Technical: ~200-250 lines
- Data from `stealWindow`, `popTime`, `timeToPlate`, `stealBreakEven`, `pickoffSuccess`, `pitchClockViolations`
- New: slider components (~50 lines), race visualization SVG (~60 lines), animation (~40 lines), pickoff panel (~30 lines), break-even integration (~30 lines), age layer (~30 lines)
- Zero new data needed

---

## 8. Tab 6: Pitch Count Tracker (NEW)

### Core Experience

A visual gauge showing pitcher fatigue as pitch count increases. Integrates pitch count thresholds, youth limits by age, velocity drop, ERA increase, and TTO compounding.

### The Fatigue Gauge

A semicircular gauge (like a car speedometer) with five zones:

| Zone | Range | Color | Label | Source |
|---|---|---|---|---|
| Fresh | 0-50 | Green | "Dealing!" | `pitchCountThresholds.velocityDrop["0-50"]` = 0 |
| Strong | 51-75 | Yellow-green | "Still strong" | `velocityDrop["51-75"]` = -0.5 mph |
| Fading | 76-90 | Yellow | "Watch closely" | `velocityDrop["76-90"]` = -1.2 mph |
| Tired | 91-100 | Orange | "Getting tired" | `velocityDrop["91-100"]` = -2.1 mph |
| Danger | 100+ | Red | "High risk" | `velocityDrop["100+"]` = -3.0 mph |

A draggable needle lets the player set any pitch count. As they drag:
- The velocity drop animates: "Fastball speed: 94 -> 92 -> 91 mph"
- The ERA increase shows: "+0 -> +0.5 -> +1.2 -> +2.1"
- The injury risk text updates

**TTO Compounding Layer**
A second ring around the gauge shows TTO effect:
- Inner ring = pitch count fatigue
- Outer ring = TTO familiarity penalty
- Combined: "At 95 pitches, 3rd TTO: wOBA jumps from .300 to .380"

Uses `matchupMatrix.pitchCountMatrix` for exact wOBA values by bucket and TTO.

**Youth Pitch Limits**
A prominent section using `pitchCountThresholds.youthByAge`:

| Age | Limit | Source |
|---|---|---|
| 7-8 | 50 pitches | Little League rules |
| 9-10 | 75 pitches | Little League rules |
| 11-12 | 85 pitches | Little League rules |
| 13-14 | 95 pitches | Little League / NFHS |
| 15-16 | 95 pitches | NFHS |
| 17-18 | 105 pitches | NFHS |

Visual: the gauge marks the player's age-appropriate limit with a bold line. "Your limit: 85 pitches. After that, your arm needs rest."

**Rest Day Calculator**
Based on pitch count:
- 0-25: No rest required
- 26-50: 1 day rest
- 51-65: 2 days rest
- 66-85: 3 days rest
- 86+: 4 days rest

"You threw 72 pitches. You need 3 days before pitching again."

**"Should I Pull the Pitcher?" Decision Tool**
A mini quiz using the fatigue data:
- Set pitch count, TTO, score differential, inning
- The tool recommends: "PULL — 3rd TTO at 88 pitches with a 1-run lead. Go to the pen."
- Or: "KEEP — 2nd TTO at 65 pitches, up by 4. Let him work."
- Shows the data behind the recommendation

### Age-Adaptive Layers

| Age | Focus | Numbers | Teaching |
|---|---|---|---|
| 6-8 | Arm safety only | "Your arm can throw 50 pitches today" | Coloring page of gauge |
| 9-10 | Limits + rest days | Pitch count + rest | "After 75 pitches, your arm needs 3 days off" |
| 11-12 | Limits + fatigue + speed | Velocity drop | "After 85 pitches, your fastball slows down" |
| 13+ | Full dashboard | All metrics + TTO | "At 95 pitches, 3rd TTO, you're giving up .380 wOBA" |

### Technical: ~200-250 lines
- Data from `pitchCountThresholds` (velocityDrop, eraIncrease, youthByAge, softLimit, hardLimit), `matchupMatrix.pitchCountMatrix`, `ttoEffect`
- New: gauge SVG (~60 lines), TTO ring (~30 lines), youth limits section (~30 lines), decision tool (~50 lines), rest calculator (~20 lines), age layer (~30 lines)
- Zero new data needed

---

## 9. Tab 7: Win Probability Live Graph (NEW)

### Core Experience

An interactive line graph showing win probability changing across innings. Players can set the game state and watch the WP line react. Like FanGraphs WP graph, but kid-friendly.

### The Graph

**X-axis**: Innings 1-9+ (horizontal)
**Y-axis**: Win probability 0-100% (vertical)
**50% line**: Always visible, labeled "Coin flip"

**Interactive State Controls**
- Score differential slider: -3 to +3
- Inning selector: 1-9+
- As controls change, the WP line redraws with smooth animation
- Data from `winProbability.byInningScore`

**The WP Line**
- Shows WP for the selected score differential across all innings
- At each inning, a dot shows the exact WP value
- Tap any dot to see: "Inning 7, down by 1: 32% win probability"

**Multi-Line Comparison**
Toggle multiple score differentials simultaneously:
- "Tied" (green line at 50% throughout, then diverging late)
- "Up 1" (blue line, rising toward 100%)
- "Down 1" (red line, falling toward 0%)
- "Down 3" (dark red line, plummeting late)

Visual impact: seeing how being down 3 in the 7th (11%) compares to being down 1 (32%) makes the concept visceral.

### Leverage Index Overlay

A second layer showing leverage index by inning:
- Bars below the graph, height proportional to LI
- "Average PA = 1.0 LI"
- "Tie game, 9th inning = 1.7 LI"
- "This means every decision in the 9th is worth 1.7x more than in the 1st"

Uses `winProbability.leverageIndex.byInning` for bar heights.

### The RE24 vs WP Divergence Visualizer

The most important teaching tool in this tab. Shows WHEN and WHY RE24 and WP diverge:

Side-by-side comparison for a specific situation:
- Left: "RE24 says: bunt costs -0.23 runs. Don't bunt."
- Right: "WP says: bunt gains +0.03 WP. Bunt!"
- Verdict: "In the 8th inning, down by 1, with a runner on 2nd and a weak hitter up, playing for 1 run (WP) is smarter than playing for big innings (RE24)."

Interactive: player can set the situation and see where RE24 and WP agree or disagree.

Uses `winProbability.reDivergence` (buntJustified, ibbJustified, playForOneRun).

### Clutch Myth Buster

A dedicated section using `winProbability.clutch`:
- "Does clutch hitting exist?"
- "Year-to-year clutch correlation: r = 0.08 (essentially random)"
- "The SITUATION creates pressure, not special ability"
- "Best clutch approach = same approach as always"
- "High-leverage hit bonus: +0.003 (almost zero)"

Teaching moment: "When announcers say a player is 'clutch,' they're usually describing a small sample. Over thousands of at-bats, clutch performance is not a repeatable skill."

### Age-Adaptive Layers

| Age | Visualization | Concepts | Language |
|---|---|---|---|
| 6-8 | Simple emoji meter (happy to worried face) | "How likely is your team to win?" | "Your team has a GOOD chance!" |
| 9-10 | Simplified graph (3 data points: early/mid/late) | WP only | "In the 7th inning, down 1, you still have a 32% chance!" |
| 11-12 | Full graph | WP + LI | "Every decision in the 9th is worth 1.7x more" |
| 13+ | Full graph + RE24/WP divergence | All concepts | "RE24 and WP diverge here. Play for WP." |

### Technical: ~250-300 lines
- Data from `winProbability.byInningScore` (7 innings x 7 diffs = 49 data points), `winProbability.leverageIndex`, `winProbability.reDivergence`, `winProbability.clutch`
- New data needed: WP for innings 2, 4, 5 (~20 lines, interpolated from existing)
- New: graph SVG component (~80 lines), multi-line toggle (~30 lines), LI overlay (~30 lines), RE24/WP divergence tool (~50 lines), clutch section (~30 lines), age layer (~30 lines)

---

## 10. Tab 8: Matchup Analyzer (NEW)

### Core Experience

Set pitcher hand, batter hand, TTO, and pitch count to see the compound matchup advantage. Teaches platoon splits, TTO stacking, and when to make pitching changes.

### Interface

**Four Controls**

| Control | Options | Default |
|---|---|---|
| Pitcher hand | LHP / RHP | RHP |
| Batter hand | LHB / RHB / Switch | RHB |
| Times through order | 1st / 2nd / 3rd | 1st |
| Pitch count | Slider 0-110 | 50 |

**The Matchup Card**
A large display showing the computed matchup:

```
Platoon: Same-hand (pitcher advantage)
Base BA: .248 | wOBA: .302 | SLG: .388
TTO adjustment: +15 BA points (2nd time)
Adjusted BA: .263
Pitch count fatigue: .315 wOBA (26-50 pitches, 2nd TTO)
```

All computed by `getMatchupData()` (the function that currently has zero callers).

**Compound Stacking Visualization**
A bar chart showing how platoon + TTO + fatigue compound:

```
Baseline:       .248 BA  [████████          ]
+ Opposite hand: .266 BA  [██████████        ] (+18 pts)
+ 3rd TTO:      .296 BA  [████████████      ] (+48 pts total!)
+ 90+ pitches:  .320 BA  [██████████████    ] (danger zone)
```

Teaching moment: "These effects STACK. A tired pitcher facing the lineup for the 3rd time against opposite-hand hitters is giving up .320+ BA. That's why managers make changes."

**Decision Recommender**
Based on the computed matchup:
- BA < .260: "Matchup favors the pitcher. Keep going."
- BA .260-.280: "Manageable, but watch the next TTO."
- BA > .280: "Consider a pitching change."
- BA > .300: "PULL THE PITCHER. This matchup is dangerous."

**Switch Hitter Insight**
When "Switch" is selected: "Switch hitters always bat opposite-hand. They neutralize the platoon advantage. That's why they're so valuable — .257 BA regardless of pitcher hand."

Uses `matchupMatrix.platoon.switchHitter`.

### Age-Adaptive Layers

| Age | Controls | Data Shown | Teaching |
|---|---|---|---|
| 6-8 | Hidden (not age-appropriate) | -- | -- |
| 9-10 | Pitcher/batter hand only | "Same hand = pitcher wins, opposite = hitter wins" | Simple advantage concept |
| 11-12 | + TTO | BA + simple stacking | "The more times a batter sees a pitcher, the better they hit" |
| 13+ | All 4 controls | Full compound analysis | Complete matchup analysis |

### Technical: ~180-220 lines
- Data from `matchupMatrix.platoon`, `matchupMatrix.ttoCompound`, `matchupMatrix.pitchCountMatrix`, `ttoEffect`, `platoonEdge`
- Activates `getMatchupData()` function (currently zero callers)
- New: control panel (~40 lines), matchup card (~30 lines), stacking bar chart (~40 lines), decision recommender (~30 lines), age layer (~30 lines)

---

## 11. Tab 9: Park Factor Explorer (NEW)

### Core Experience

Explore how different ballparks change the game. Toggle between hitter's parks, pitcher's parks, and neutral parks. See how wind, temperature, altitude, and surface affect strategy.

### The Park Selector

A visual grid of ~10 famous parks with park factor badges:

| Park | Factor | Type | Source |
|---|---|---|---|
| Coors Field | ~120 | Extreme hitter | `parkFactors.hittersParks.examples[0]` |
| Great American Ballpark | ~108 | Hitter | `parkFactors.hittersParks.examples[1]` |
| Fenway Park | ~106 | Hitter | `parkFactors.hittersParks.examples[2]` |
| Generic Neutral | 100 | Neutral | `parkFactors.neutral` |
| Tropicana Field | ~97 | Pitcher | `parkFactors.pitchersParks.examples[2]` |
| Oracle Park | ~96 | Pitcher | `parkFactors.pitchersParks.examples[1]` |
| Petco Park | ~95 | Pitcher | `parkFactors.pitchersParks.examples[0]` |

**New data needed**: 30 real park factor values (~30 lines). Currently only have examples and thresholds.

### Strategy Adjustments Panel

When a park type is selected, show the strategic impact:

**Hitter's Park (factor > 105)**
From `parkFactors.hitterspark`:
- "Steal value decreases by 2% (runs are cheaper, don't risk outs)"
- "Bunt cost increases by 3% (giving up outs hurts more when runs are plentiful)"
- "IBB risk increases by 4% (more runs score anyway)"

**Pitcher's Park (factor < 95)**
From `parkFactors.pitcherspark`:
- "Steal value increases by 2% (runs are precious)"
- "Bunt cost decreases by 2% (manufacturing 1 run is worth more)"
- "IBB risk decreases by 2% (fewer runs means each walk hurts less)"

### Environmental Factors

**Wind Effects**
From `parkAndEnvironment.wind`:
- Visual: wind arrows on the field SVG, direction toggle (in/out/cross)
- Outfield depth adjustments: "+7 to +15 feet deeper with wind out"
- Pitcher strategy:
  - Wind out: "Work down in the zone. Ground balls. Avoid elevated pitches."
  - Wind in: "Can work up in the zone. Fly balls become warning track outs."
  - Wind cross: "Breaking ball movement affected. Watch the flags."

**Surface Effects**
From `parkAndEnvironment.surface`:
- Grass: "Standard grounder speed, normal positioning"
- Turf: "Grounders 17.5% faster, infield plays 1.5 feet deeper, outfield 2.5 feet deeper"

**Temperature & Altitude**
From `parkAndEnvironment.temperature`:
- Temperature slider: below 50F to above 90F
- Carry adjustment: "-6% cold game -> +4% hot game"
- Altitude deep dive on Coors: "10% more carry, breaking balls lose 15% movement"
- "This is why Coors Field has a humidor for the baseballs"

### Age-Adaptive Layers

| Age | Content | Depth |
|---|---|---|
| 6-8 | "Some fields make it easier to hit home runs!" | Just hitter/pitcher park concept |
| 9-10 | Named parks + "hitter's park / pitcher's park" | Park factor number explained |
| 11-12 | + Wind and temperature effects | Strategy adjustments |
| 13+ | Full environmental analysis | All factors + strategy implications |

### Technical: ~200-250 lines
- Data from `parkAndEnvironment` (all currently orphaned: parkFactors, wind, surface, temperature)
- New data needed: ~30 lines of specific park factor values
- New: park selector grid (~40 lines), strategy panel (~40 lines), wind visualization (~40 lines), temperature slider (~30 lines), surface comparison (~20 lines), age layer (~30 lines)

---

## 12. Tab 10: Defensive Positioning Sandbox (NEW)

### Core Experience

A top-down field view where players drag fielders to different positions and see how conversion rates and run values change. Teaches normal depth, DP depth, infield in, line guarding, and outfield depth.

### The Interactive Field

Reuses the existing Field SVG with draggable fielder sprites (Guy() components). Seven fielders can be repositioned:
- 1B, 2B, SS, 3B (infield)
- LF, CF, RF (outfield)
- Pitcher and catcher fixed

### Preset Alignments

Quick-select buttons for standard alignments:

| Preset | Source | Effect on Field |
|---|---|---|
| Normal | `defensivePositioning.infieldDepth.normalDepth` | Standard positions |
| DP Depth | `defensivePositioning.infieldDepth.dpDepth` | IF shift toward 2B |
| Infield In | `defensivePositioning.infieldDepth.infieldIn` | All IF on grass |
| Guard Lines | `defensivePositioning.lineGuarding` | 1B/3B on lines |
| OF Shallow | `defensivePositioning.outfieldDepth.shallowIn` | OF move in |
| OF Deep | `defensivePositioning.outfieldDepth.deep` | OF move back |
| 4-OF | `defensivePositioning.outfieldDepth.fourOutfielders` | IF moves to OF |

### Live Stats Panel

As fielders move, stats update in real time:

| Stat | Normal | DP Depth | Infield In |
|---|---|---|---|
| Ground ball conversion | 74% | 70% | 58% |
| Double play rate | 41% | 49% | -- |
| Runs saved/game | -- | -- | +0.30 |
| Runs cost/game | -- | -- | -0.50 |
| Net per game | 0 | +DP bonus | -0.20 |

**Situation Context**
Set the game situation (runners, outs, inning, score) and see whether the alignment is justified:
- `evaluateDefensiveAlignment()` provides the verdict
- "Infield in is justified: R3, 1 out, 8th inning, tied game."
- "Infield in is NOT justified: only 2nd inning, up by 3."

### Historical Shift Section

From `defensivePositioning.historicalShift`:
- Before/after visualization of the traditional shift ban (2023)
- "The shift cost pull hitters 10+ points of BA"
- "After the ban, pull hitters gained +.015 BA and +.008 wOBA"

### Outfield Arm Value

From `defensivePositioning.outfieldArm`:
- "Elite RF arm prevents 12 extra bases per season"
- "RF arm prevents 3x as many extra bases as LF arm"
- Visual: throw-distance arrows from each OF position to bases

### The "Infield In" Run Impact Deep Dive

From `infieldInRunImpact`:
- "Normal depth, R3, 0 outs: 85% scoring probability"
- "Infield in, R3, 0 outs: 72% scoring probability"
- "Saves 0.30 runs/game from cutting off grounders"
- "Costs 0.50 runs/game from hits through the drawn-in infield"
- "Net: -0.20 runs/game. Only use when the 1 run matters MORE than average."

### Age-Adaptive Layers

| Age | Interface | Teaching |
|---|---|---|
| 6-8 | Just presets, no dragging | "When a runner is on third, the fielders come closer!" |
| 9-10 | Presets + simple drag | "Moving closer catches more grounders but lets more hits through" |
| 11-12 | Full drag + stats | Conversion rates and when to use each alignment |
| 13+ | Full sandbox + situation context | Complete alignment analysis with run values |

### Technical: ~250-300 lines
- Data from `defensivePositioning` (infieldDepth, lineGuarding, outfieldDepth, historicalShift, outfieldArm), `infieldInRunImpact`
- Reuses: Field SVG, Guy() components, existing evaluateDefensiveAlignment() function
- New: draggable fielder logic (~60 lines), preset buttons (~30 lines), stats panel (~40 lines), situation context tool (~40 lines), historical shift section (~30 lines), arm value visualization (~30 lines), age layer (~30 lines)

---

## 13. Tab 11: Historical Moments (NEW)

### Core Experience

Famous game moments with the actual RE24 and WP at the decision point. "What would YOU have done?" Then reveal what actually happened and whether it was the right call by the numbers.

### Moment Structure

Each moment includes:
- **The Setup**: Game, inning, score, runners, outs, count
- **The Decision**: What the manager/player faced
- **The Data**: RE24, WP, relevant BRAIN analytics
- **What Happened**: The actual outcome
- **The Analysis**: Was it right by the numbers?

### Starter Moments (New Data: ~60 lines)

| Moment | Game | Decision | Key Data |
|---|---|---|---|
| Buckner's Error | 1986 WS Game 6 | Defensive positioning | WP, infield alignment |
| Roberts Steals 2B | 2004 ALCS Game 4 | Steal attempt, down 3 | Steal break-even, WP = ~4% |
| Bunt in the Shift | 2023+ era | Bunt against extreme shift | Bunt RE24 vs shift BA cost |
| Bonds IBB with Bases Loaded | 1998 | Intentional walk with bases loaded | RE24 bases loaded (2.29!) |
| Maddon's Shift on David Ortiz | 2008-2016 | Extreme defensive positioning | Shift run value, platoon |
| Walking Barry Bonds 1st and 3rd | 2004 NL | IBB to load bases | IBB strategy, WP analysis |
| 2001 WS Game 7, Bottom 9 | 2001 | Byung-Hyun Kim pitching | Leverage index, TTO, fatigue |
| 2016 WS Game 7, Rain Delay | 2016 | Chapman fatigue | Pitch count, velocity drop |

### Interaction Flow

1. Read the setup (with Field visualization showing the exact game state)
2. See the data: RE24, WP, relevant BRAIN analytics
3. "What would you do?" — 3-4 options
4. Player picks
5. Reveal: "Here's what happened..." with animation
6. Analysis: "By the numbers, the right play was X because..."
7. Deep link to relevant Brain tab: "Want to understand RE24 better? Tap to explore."

### League Trends Integration

Uses `leagueTrends` to provide historical context:
- "In 1980, the K rate was 12%. By 2023, it's 22.8%."
- "Walk rates dropped post-pitch-clock — batters can't work deep counts as easily."
- "BABIP has been .298 for a decade — it's the most stable stat in baseball."

BABIP by contact type from `leagueTrends.babip.byContactType`:
- Line drives: .685
- Ground balls: .235
- Fly balls: .130
- Popups: .020

Teaching: "Line drives fall for hits 68.5% of the time. Popups are outs 98% of the time. This is why coaches say 'hit the ball hard on a line.'"

### Age-Adaptive Layers

| Age | Moments Shown | Analysis Depth | Language |
|---|---|---|---|
| 6-8 | Simple moments ("A famous player stole a base!") | None | Story-based |
| 9-10 | 3-4 kid-friendly moments | "It was risky, but it worked!" | Narrative |
| 11-12 | 6-8 moments | Basic RE24/WP | "The steal had only a 30% chance but it was the playoffs" |
| 13+ | All moments | Full statistical analysis | "WP was 4%. The steal was -EV but changed the series" |

### Technical: ~200-250 lines
- Data from `leagueTrends` (all currently orphaned), `winProbability`, `RE24`, `stealBreakEven`
- New data needed: ~60 lines of historical moment definitions
- New: moment card component (~50 lines), "what would you do" quiz flow (~50 lines), reveal animation (~30 lines), analysis panel (~40 lines), league trends section (~40 lines), age layer (~30 lines)

---

## 14. Quiz Loop Integration

This is the critical question: **how does exploring Baseball Brain make the player BETTER at answering scenarios?**

### 14.1 Deep Links from Quiz Explanations

After every wrong answer, the `enrichFeedback()` function already generates BRAIN-powered insights (RE24, count, pressure, etc.). Add a **tappable deep link** on each insight:

**Current behavior** (enrichFeedback output):
> "With a runner on 2nd, your team expects 1.17 runs from here."

**New behavior**:
> "With a runner on 2nd, your team expects 1.17 runs from here. **[Explore RE24 -->]**"

The `[Explore RE24 -->]` link opens Baseball Brain's RE24 Explorer with the exact game state from the scenario pre-loaded (runners on the bases, outs set).

**Implementation**: Each enrichFeedback insight gains an optional `deepLink` field:
```js
{icon:"chart", text:"...", deepLink: {tab:"re24", state:{runners:[2], outs:1}}}
```

The outcome screen renders the link. Tapping opens Baseball Brain with the state pre-loaded. Player explores, then returns to the quiz.

### 14.2 Concept-Specific Links

When a player gets a wrong answer classified as a specific error type (via `classifyAndFeedback()`), show a targeted Brain tab link:

| Error Type | Brain Tab Link | State |
|---|---|---|
| `dataError` + `bunt-re24` | RE24 Explorer | Runners + outs from scenario, "Bunt" highlighted |
| `dataError` + `steal-breakeven` | Steal Calculator | Pre-set with scenario timing |
| `countBlindness` | Count Dashboard | Count from scenario highlighted |
| `situationalMiss` + win-probability | Win Probability | Inning + score from scenario |
| `roleConfusion` + positioning | Defensive Sandbox | Show correct alignment |

### 14.3 Pre-Quiz Brain Priming

Before starting a scenario in a concept the player has failed before, show a 5-second "Brain Primer":
- "Before you play: at 0-2, the pitcher strikes out the batter 27% of the time. Keep that in mind!"
- Links to the relevant Brain tab
- Dismissed with "Got it" or auto-fades after 5 seconds

### 14.4 Post-Mastery Celebration with Brain Context

When a player masters a concept, the celebration screen includes:
- "You mastered Steal Break-Even! You now know that steals need a 72% success rate."
- "Explore the Steal Calculator to test different speeds and times."
- Deep link to the relevant Brain tab

### 14.5 "You Got This Wrong Because..." Flow

The most powerful integration. When a player gets a wrong answer on a data-dependent concept, show:

```
You chose: "Bunt the runner over"
The right answer: "Swing away"

Why? Bunting with a runner on 1st and 0 outs costs 0.23 expected runs.
Your team had 0.94 expected runs. After a bunt: 0.71.

[TAP TO SEE THE MATH -->]
```

Tapping opens RE24 Explorer with:
- Runners on 1st, 0 outs (RE24 = 0.94)
- The "Bunt" What-If button glowing, ready to tap
- Player taps "Bunt" and watches RE24 drop from 0.94 to 0.71
- Visceral understanding: "Oh, bunting costs runs."

This flow transforms a wrong answer into a learning moment that the player INTERACTS with, not just reads.

### 14.6 Brain Tab -> Quiz Bridge

The reverse flow: from exploring a Brain tab, launch directly into a scenario testing that concept.

On every Brain tab, after a teaching moment:
- "Think you understand? **[Test yourself -->]**"
- Tapping loads a scenario tagged with the relevant concept
- After answering, return to the Brain tab with updated mastery color

---

## 15. Gamification of Exploration

### 15.1 Baseball IQ Score

A single number (0-200) representing how much a player has explored and understood Brain data. Displayed prominently on the home screen next to their level.

**How it's calculated:**

| Action | Points | Max |
|---|---|---|
| Visit a Brain tab (first time) | +5 per tab | 55 (11 tabs) |
| Interact with a tab feature (first time) | +2 per interaction | ~80 (40 interactions) |
| Complete a tab challenge | +5 per challenge | 55 (11 challenges) |
| Correct quiz answer on data concept | +1 | Unlimited but capped at +2/day |
| Master a data concept | +5 | ~35 (7 data concepts) |
| Use "Explore" deep link from quiz | +3 per link | ~30 (10 links) |

**IQ Level Titles:**
- 0-30: "Rookie Scout"
- 31-60: "Dugout Analyst"
- 61-90: "Front Office Prospect"
- 91-120: "Analytics All-Star"
- 121-150: "Sabermetrics Expert"
- 151-180: "Baseball Genius"
- 181-200: "Hall of Fame Brain"

### 15.2 Tab Mastery Rings

Each tab icon on the Brain navigation has a circular progress ring:
- Empty: never visited
- 25%: visited, basic interactions
- 50%: explored most features
- 75%: completed the tab challenge
- 100%: all interactions + challenge + quiz concept mastered

### 15.3 Tab Challenges

Each tab has one "challenge" that tests understanding:

| Tab | Challenge | Reward |
|---|---|---|
| RE24 Explorer | "Build an inning that scores 4+ runs" (sandbox mode) | +5 IQ, "Run Scorer" badge |
| Count Dashboard | "Navigate from 0-0 to a walk in the Count Journey" | +5 IQ, "Patient Hitter" badge |
| Pitch Lab | "Build a 5-pitch sequence scoring 12+ points" | +5 IQ, "Pitch Master" badge |
| Concept Map | "Master 3 concepts in one domain" | +5 IQ, "Domain Expert" badge |
| Steal Calculator | "Find the fastest combination that gets thrown out" | +5 IQ, "Speed Scout" badge |
| Pitch Count | "Correctly recommend pull/keep on 5 scenarios" | +5 IQ, "Bullpen Boss" badge |
| Win Probability | "Identify when RE24 and WP diverge on 3 situations" | +5 IQ, "Strategy Master" badge |
| Matchup Analyzer | "Find the matchup that exceeds .300 BA" | +5 IQ, "Matchup Maven" badge |
| Park Factors | "Identify 3 strategy changes for Coors Field" | +5 IQ, "Park Ranger" badge |
| Defensive Sandbox | "Set the correct alignment for 5 situations" | +5 IQ, "Field General" badge |
| Historical Moments | "Get 6/8 historical decisions correct" | +5 IQ, "History Buff" badge |

### 15.4 Discovery Achievements

Hidden achievements unlocked by exploring:

| Achievement | Trigger | Badge |
|---|---|---|
| "First Brain Cell" | Visit any Brain tab | Brain emoji |
| "Data Nerd" | Visit all 11 tabs | Chart emoji |
| "The Numbers Don't Lie" | Use 5 deep links from quiz explanations | Magnifying glass |
| "What If?" | Use 20 What-If buttons in RE24 Explorer | Question mark |
| "Pitch Caller" | Complete 10 sequencing builder rounds | Baseball |
| "IQ 100" | Reach Baseball IQ 100 | Brain with lightning |
| "Full Tree" | View all 76 concept nodes | Tree |
| "Steal Scientist" | Try all 9 preset combinations in Steal Calculator | Running figure |
| "Weather Watcher" | Explore all 4 wind conditions | Wind |
| "History Repeats" | Complete all historical moments | Clock |

### 15.5 Daily Brain Fact

On the home screen, rotate through BRAIN data as "did you know?" teasers:
- "Did you know? Batters hit .400 on 2-0 counts. [Explore counts -->]"
- "Did you know? Bunting costs 0.23 runs with a runner on first. [See why -->]"
- "Did you know? The pitch clock shortened steal windows by 0.20 seconds. [Calculate -->]"

Each fact links to the relevant Brain tab. New fact each day (pulled from a rotation of ~50 facts generated from BRAIN data).

### 15.6 Brain Streak

Similar to daily streak, but for Brain exploration:
- "You've explored Baseball Brain 3 days in a row!"
- At 7 days: unlock a Brain-themed avatar accessory
- At 14 days: unlock a special "Analyst" profile badge
- At 30 days: "Baseball Genius" permanent title

---

## 16. Age-Adaptive Presentation Matrix

The master matrix showing how ALL tabs adapt per age group:

### Vocabulary Tiers (from `levelAdjustments.vocabularyTiers`)

| Tier | Ages | Label | Avoid Terms |
|---|---|---|---|
| 1 | 6-8 | Plain English | RE24, wOBA, leverage, platoon, FIP, OPS, Statcast, run expectancy |
| 2 | 9-10 | Simple Stats | RE24, wOBA, leverage index, FIP, Statcast, OPS |
| 3 | 11-12 | Intro Analytics | wOBA, FIP, Statcast, xFIP, spin rate |
| 4 | 13-15 | Full Stats | wOBA, FIP, xFIP, spin rate, arm angle |
| 5 | 16-18 | Full Analytics | (none) |

### Tab Visibility by Age

| Tab | 6-8 | 9-10 | 11-12 | 13-15 | 16-18 |
|---|---|---|---|---|---|
| RE24 Explorer | "Chance to Score" (stars) | Simplified | Full | Full + matrix | Expert |
| Count Dashboard | Emoji faces only | BA only | BA + K% | Full stats | Full + sequencing |
| Pitch Lab | 3 pitches, no stats | 5 pitches, speed only | All 8, basic | All 8, full | + framing + tunneling |
| Concept Map | Simple list | Simplified tree | Full tree | Full + stats | Expert + depth |
| Steal Calculator | Racing game (no numbers) | Fast/Medium/Slow | Full equation | Full + break-even | Full + pitch clock |
| Pitch Count | Arm safety poster | Limits + rest | + fatigue | Full dashboard | + TTO compound |
| Win Probability | **Hidden** | Happy/worried meter | Simplified graph | Full graph | + RE24/WP divergence |
| Matchup Analyzer | **Hidden** | **Hidden** | Pitcher/batter hand | + TTO | Full compound |
| Park Factor Explorer | "Some fields hit more!" | Named parks | + wind/temp | Full analysis | Full + strategy |
| Defensive Sandbox | **Hidden** | Presets only | + drag | Full sandbox | + run values |
| Historical Moments | Simple stories | Narrative | + basic data | Full analysis | Expert |

### Interaction Complexity by Age

| Age | Tap | Drag | Slider | Toggle | Builder | Quiz |
|---|---|---|---|---|---|---|
| 6-8 | Yes | No | No | Yes/No only | No | Simple |
| 9-10 | Yes | Simple | Limited | Yes | No | 2-choice |
| 11-12 | Yes | Yes | Yes | Yes | Basic | 4-choice |
| 13-15 | Yes | Yes | Yes | Yes | Full | Full |
| 16-18 | Yes | Yes | Yes | Yes | Expert | Full + explain |

### Visual Density by Age

| Age | Numbers per screen | Chart types | Animation speed | Color coding |
|---|---|---|---|---|
| 6-8 | 0-2 (use icons) | None (use images) | Slow + fun | Big, bold, primary |
| 9-10 | 2-4 | Simple bar | Medium | Clear categories |
| 11-12 | 4-8 | Bar + simple line | Normal | Color-coded data |
| 13-15 | 8-15 | Bar, line, grid | Normal | Full palette |
| 16-18 | 15+ | All types | Normal | Data-density OK |

---

## 17. Technical Feasibility & Line Estimates

### Summary Table

| Tab | Lines of Code | New Data Lines | Uses Existing BRAIN | Orphaned Data Activated | New Components |
|---|---|---|---|---|---|
| RE24 Explorer | 250-300 | 0 | RE24, scoringProb, buntDelta, stealBreakEven, baserunningRates | baserunningRates (7/8 fields) | NumberAnim, WhatIfRow |
| Count Dashboard | 200-250 | 0 | countData, countRates, firstPitchValue, countWalkRates | firstPitchValue (5 fields), countRates (10/12 fields), countWalkRates (12 fields) | CountGrid, DetailPanel |
| Pitch Lab | 350-400 | 0 | pitchTypeData, catcherFramingValue | catcherFramingValue (8 fields) | PitchCard, MovementSVG, SequenceBuilder |
| Concept Map | 300-350 | 0 | concepts (76), masteryData | -- | TreeLayout, ConceptNode |
| Steal Calculator | 200-250 | 0 | stealWindow, popTime, timeToPlate, pickoffSuccess, pitchClockViolations | stealWindow (5 fields), popTime (3), timeToPlate (3), pickoffSuccess (3), pitchClockViolations (6) | RaceViz, SliderSet |
| Pitch Count Tracker | 200-250 | 0 | pitchCountThresholds, pitchCountMatrix, ttoEffect | pitchCountThresholds (6 fields), pitchCountMatrix (all) | FatigueGauge, YouthLimits |
| Win Probability | 250-300 | ~20 | winProbability, leverageIndex | leverageIndex (some), clutch (all) | WPGraph, LIOverlay, DivergenceViz |
| Matchup Analyzer | 180-220 | 0 | matchupMatrix, ttoCompound, pitchCountMatrix, platoonEdge | matchupMatrix.platoon (all), ttoCompound (all), leverageIndex (all) | MatchupCard, StackingChart |
| Park Factor Explorer | 200-250 | ~30 | parkAndEnvironment | parkFactors (all), wind (all), surface (all), temperature (all) | ParkGrid, WindViz |
| Defensive Sandbox | 250-300 | 0 | defensivePositioning, infieldInRunImpact | infieldInRunImpact (all), historicalShift, outfieldArm (partial) | DraggableField, StatsPanel |
| Historical Moments | 200-250 | ~60 | leagueTrends, RE24, WP, stealBreakEven | leagueTrends (all: K%, BB%, BABIP, HBP, countWalkRates) | MomentCard, QuizFlow |
| **TOTAL** | **~2,580-3,120** | **~110** | -- | **~140 lines fully activated** | -- |

### Shared Infrastructure (~200 lines)

| Component | Lines | Used By |
|---|---|---|
| BrainTab container + navigation strip | 50 | All tabs |
| Age-adaptive wrapper (reads ageGroup, filters content) | 30 | All tabs |
| NumberAnimation component (counting up/down) | 30 | RE24, Count, WP, Matchup |
| DeepLink handler (open tab with pre-loaded state) | 25 | Quiz integration |
| Baseball IQ calculator + display | 35 | Gamification |
| Tab mastery ring component | 15 | Navigation |
| Brain fact rotator (home screen) | 15 | Home screen |

### Grand Total

| Category | Lines |
|---|---|
| 11 Brain tabs | 2,580-3,120 |
| Shared infrastructure | 200 |
| Quiz integration (deep links, primers, bridges) | 100 |
| Gamification (IQ, achievements, challenges) | 150 |
| **GRAND TOTAL** | **3,030-3,570** |

This represents a ~17-20% addition to the current ~17,936 line codebase. Substantial but proportional to the value delivered.

### What Can Be Reused

| Existing Component/System | Reused By |
|---|---|
| Field SVG + Guy() sprites | RE24 Explorer, Defensive Sandbox, Historical Moments |
| ANIM_DATA + AnimPhases | RE24 "What If?" animations |
| Web Audio sound system | Tab interactions, celebrations |
| Particle system (graphics overhaul) | Mastery celebrations |
| Achievement system | Brain achievements |
| localStorage persistence | IQ score, tab progress, exploration state |
| MASTERY_SCHEMA + updateConceptMastery() | Concept Map data |
| enrichFeedback() | Deep link generation |
| getMatchupData() | Matchup Analyzer (zero callers currently!) |
| evaluateDefensiveAlignment() | Defensive Sandbox |
| getPitchRecommendation() | Count Dashboard + Pitch Lab |
| getWinContext() | Win Probability |
| getLevelContext() | Age-adaptive layer |

---

## 18. Build Order

### Sprint 1: Foundation + Core 4 Tabs (Week 1)

**Goal**: Ship the 4 originally planned tabs with maximum features

| Day | Task | Lines | Hours |
|---|---|---|---|
| 1 | Brain navigation container, age-adaptive wrapper, tab infrastructure | 100 | 3 |
| 1 | RE24 Explorer (runner placement, outs, What-If buttons, number animation) | 250 | 5 |
| 2 | Count Dashboard (grid, detail panel, progression arrows, first-pitch deep dive) | 220 | 5 |
| 2 | Pitch Lab (pitch cards, movement SVG, basic sequencing) | 250 | 5 |
| 3 | Concept Map (tree layout, node rendering, detail panel, mastery colors) | 300 | 6 |
| 3 | Quiz integration: deep links from enrichFeedback to Brain tabs | 60 | 2 |

**Sprint 1 total: ~1,180 lines, 26 hours**

### Sprint 2: New Tabs Batch 1 — Steal + Pitch Count + Win Probability (Week 2)

**Goal**: Activate the most orphaned data, ship the 3 most game-changing new tabs

| Day | Task | Lines | Hours |
|---|---|---|---|
| 4 | Steal Calculator (sliders, race visualization, pickoff panel, break-even) | 230 | 5 |
| 4 | Pitch Count Tracker (fatigue gauge, youth limits, TTO ring) | 220 | 5 |
| 5 | Win Probability Graph (line graph, multi-line, LI overlay) | 260 | 6 |
| 5 | RE24/WP divergence tool + clutch myth buster | 80 | 2 |

**Sprint 2 total: ~790 lines, 18 hours**

### Sprint 3: New Tabs Batch 2 — Matchup + Park + Defense + History (Week 3)

**Goal**: Complete all 11 tabs, activate all orphaned data

| Day | Task | Lines | Hours |
|---|---|---|---|
| 6 | Matchup Analyzer (controls, matchup card, stacking chart) | 200 | 4 |
| 6 | Park Factor Explorer (park grid, strategy panel, wind/temp) | 220 | 5 |
| 7 | Defensive Positioning Sandbox (draggable field, presets, stats panel) | 270 | 6 |
| 7 | Historical Moments (moment data, quiz flow, league trends) | 230 | 5 |

**Sprint 3 total: ~920 lines, 20 hours**

### Sprint 4: Gamification + Polish (Week 4)

**Goal**: Make exploration sticky, complete quiz integration, polish age adaptation

| Day | Task | Lines | Hours |
|---|---|---|---|
| 8 | Baseball IQ score system + display | 50 | 2 |
| 8 | Tab mastery rings + tab challenges (all 11) | 100 | 3 |
| 8 | Discovery achievements (10 hidden achievements) | 40 | 1 |
| 9 | Brain fact rotator (home screen, 50 facts) | 30 | 1 |
| 9 | Full quiz integration: "You got this wrong because..." flow | 60 | 3 |
| 9 | Brain tab -> quiz bridge ("Test yourself" buttons) | 40 | 2 |
| 9 | Age-adaptive polish pass across all 11 tabs | 60 | 3 |
| 10 | QA: test all tabs at ages 6-8, 9-10, 11-12, 13-15, 16-18 | 0 | 4 |
| 10 | Performance audit: ensure no render lag with 11 new tabs | 0 | 2 |
| 10 | Pitch Lab advanced: sequencing builder scoring, tunneling overlay | 100 | 3 |

**Sprint 4 total: ~480 lines, 24 hours**

### Total Effort

| Sprint | Lines | Hours | Week |
|---|---|---|---|
| Sprint 1: Foundation + Core 4 | 1,180 | 26 | Week 1 |
| Sprint 2: Steal + Pitch Count + WP | 790 | 18 | Week 2 |
| Sprint 3: Matchup + Park + Defense + History | 920 | 20 | Week 3 |
| Sprint 4: Gamification + Polish | 480 | 24 | Week 4 |
| **TOTAL** | **3,370** | **88 hours** | **4 weeks** |

---

## Appendix A: BRAIN Data Usage After Baseball Brain

After all 11 tabs are built, here is the usage status of every BRAIN data field:

| Data Section | Pre-Brain Status | Post-Brain Status | Used By |
|---|---|---|---|
| RE24 | Active | Active | RE24 Explorer + quiz |
| countData | Active | Active | Count Dashboard + quiz |
| stealBreakEven | Active | Active | Steal Calculator + quiz |
| buntDelta | Active | Active | RE24 Explorer + quiz |
| ttoEffect | Partial | Active | Matchup Analyzer + Pitch Count |
| matchupMatrix.platoon | **Orphaned** | Active | Matchup Analyzer |
| matchupMatrix.ttoCompound | **Orphaned** | Active | Matchup Analyzer |
| matchupMatrix.leverageIndex | **Orphaned** | Active | Win Probability |
| matchupMatrix.pitchCountMatrix | **Orphaned** | Active | Pitch Count Tracker |
| parkAndEnvironment (all) | **Orphaned** | Active | Park Factor Explorer |
| levelAdjustments | Active | Active | Age-adaptive layer |
| popTime | **Orphaned** | Active | Steal Calculator |
| timeToPlate | **Orphaned** | Active | Steal Calculator |
| pickoffSuccess | **Orphaned** | Active | Steal Calculator |
| pitchClockViolations | **Orphaned** | Active | Steal Calculator |
| baserunningRates | Mostly orphaned | Active | RE24 Explorer |
| countRates | Mostly orphaned | Active | Count Dashboard |
| stealWindow | **Orphaned** | Active | Steal Calculator |
| pitchCountThresholds | **Orphaned** | Active | Pitch Count Tracker |
| scoringProb | Active | Active | RE24 Explorer + quiz |
| firstPitchValue | **Orphaned** | Active | Count Dashboard |
| catcherFramingValue | **Orphaned** | Active | Pitch Lab |
| leagueTrends | **Orphaned** | Active | Historical Moments |
| infieldInRunImpact | **Orphaned** | Active | Defensive Sandbox |
| pitchTypeData | Active | Active | Pitch Lab + quiz |
| winProbability | Active | Active | Win Probability + quiz |
| defensivePositioning | Partial | Active | Defensive Sandbox |
| concepts | Active | Active | Concept Map + quiz |
| coaching | Active | Active | All tabs (teaching moments) |

**Result: 0 orphaned fields. 100% of BRAIN data is actively used by Baseball Brain.**

---

## Appendix B: State Additions to localStorage

Baseball Brain adds the following to the `bsm_v5` localStorage state:

```js
// Added to DEFAULT state object
brainIQ: 0,                    // Baseball IQ score (0-200)
brainExplored: {},             // { tabName: { visited: bool, interactions: [], challengeDone: bool } }
brainStreak: 0,                // Consecutive days exploring Brain
brainLastVisit: null,          // ISO date string
brainAchievements: [],         // Array of achievement keys
brainFactIdx: 0,               // Current daily fact rotation index
```

**Estimated localStorage impact**: ~500 bytes per player (well within budget).

---

## Appendix C: Pro Gating Strategy

| Feature | Free | Pro |
|---|---|---|
| Brain tabs (all 11) | 3 tabs unlocked (RE24, Count, Concept Map) | All 11 tabs |
| Tab challenges | First 3 | All 11 |
| Baseball IQ | Visible but capped at 60 | Full 200 |
| Deep links from quiz | All | All |
| Brain fact rotator | Yes | Yes |
| Brain streak rewards | Yes | Yes |
| Sequencing builder | 3 pitches | Full 5+ pitches |
| Historical moments | 3 moments | All moments |
| Defensive sandbox | Presets only | Full drag |

**Rationale**: Brain tabs are the perfect upsell. Free players get enough to understand the value. Pro unlocks the full playground. The 3 free tabs (RE24, Count, Concept Map) are the most educational and drive the deepest quiz integration.

---

*This document represents the maximum version of Baseball Brain. Every tab uses existing BRAIN data except where noted. Every interaction is designed for discovery, not reference. Every number has a story. Every story has a number.*

*Total new code: ~3,370 lines. Total new data: ~110 lines. Total orphaned BRAIN data activated: ~140 lines (100% coverage). Build time: 4 weeks at full pace.*
