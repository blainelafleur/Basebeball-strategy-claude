# BSM Ideas & Insights Log
## A living document of ideas, patterns, and future directions

**Started:** 2026-03-19 | **Last updated:** 2026-03-27

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

## Final 5 Build Notes (TPA)

**Date:** 2026-03-24 | **Reviewer:** Thought Partner Agent | **Scope:** Achievement triggers, IQ title ladder, haptic feedback, pitch tunnel visualization, Game Film speed control

---

### 1. Achievement Trigger Logic

Five Brain achievements to implement. All require understanding, not just clicking.

| # | Achievement | Trigger Condition | Where to Check | Implementation Notes |
|---|---|---|---|---|
| 1 | **"Aha Moment"** | Player follows a deep link from a wrong-answer explanation into Brain, then gets the SAME concept correct on their next quiz attempt. | In the outcome handler (around line 4494 of `src/08_app.js`), after `od` is computed: check if `stats.lastBrainDeepLinkConcept` matches `sc.conceptTag` AND `od.isOpt`. Clear the field after awarding. | Requires adding `lastBrainDeepLinkConcept` to state. Set it in the deep-link onClick handler when navigating from outcome screen to Brain. Reset on any non-matching quiz play. |
| 2 | **"The Numbers Don't Lie"** | Use 5 deep links from quiz explanations into Brain tabs (cumulative, not per-session). | In the deep-link onClick handler (outcome screen insights, ~line 4630). Increment `stats.brainDeepLinkCount`. Check `>= 5`. | Track count in `brainExplored.deepLinkCount`. Persists across sessions via localStorage. |
| 3 | **"Pitch Caller"** | Complete 10 sequencing rounds in Pitch Lab (cumulative). A "round" = building a full sequence (3 or 5 pitches) and seeing the score. | In the Pitch Lab sequencing score display block (~line 3542), where `seqPitches.length >= target`. Increment `stats.brainExplored.pitchlab.seqRounds`. Check `>= 10`. | Already have the exact render point -- it's where `scoreSeq(seqPitches)` runs. Just add a counter increment alongside the existing `challengeDone` logic. |
| 4 | **"What If?"** | Tap 20 What-If action buttons in RE24 Explorer (cumulative). Actions: Single, Walk, K, Bunt, Steal, Sac Fly, Double Play. | In `doAction()` function (~line 3195). Increment `stats.brainExplored.re24.whatIfCount`. Check `>= 20`. | `doAction` already calls `trackInteraction("re24")`. Add the counter there. 20 taps means genuine experimentation across multiple game states. |
| 5 | **"The 7th Inning Switch"** | In Win Probability tab, view WP for the same score differential in BOTH an early inning (1-6) AND a late inning (7-9). Must see the values diverge. | In the Win Probability tab's inning/diff change handler. Track `{ earlyViewed: Set<diff>, lateViewed: Set<diff> }`. When any diff appears in both sets, trigger. | Requires tracking viewed combinations in `brainExplored.winprob`. The "aha" is seeing that the same 2-run lead means different things in inning 2 vs inning 8. |

**Achievement check pattern (shared):**
```js
// Add to ACHS array in src/03_config.js:
{id:"brain_aha",n:"Aha Moment",d:"Wrong answer -> Brain -> got it right!",e:"💡",ck:s=>(s.brainExplored?.deepLinkAha||0)>=1},
{id:"brain_numbers",n:"The Numbers Don't Lie",d:"Explored Brain data 5 times from quiz",e:"📊",ck:s=>(s.brainExplored?.deepLinkCount||0)>=5},
{id:"brain_pitcher",n:"Pitch Caller",d:"Built 10 pitch sequences",e:"⚾",ck:s=>(s.brainExplored?.pitchlab?.seqRounds||0)>=10},
{id:"brain_whatif",n:"What If?",d:"20 What-If experiments in RE24",e:"🔬",ck:s=>(s.brainExplored?.re24?.whatIfCount||0)>=20},
{id:"brain_switch",n:"The 7th Inning Switch",d:"Saw win probability shift in late innings",e:"📈",ck:s=>s.brainExplored?.winprob?.switchSeen},
```

Also add matching entries to `achProgress()` for progress bar rendering.

---

### 2. IQ Title Ladder

**Current state (line 3138):** 6 titles, raw number displayed prominently, progress bar absent.

**Recommended change:** Hide raw number, show title + progress bar to next title. Per Risk 1 analysis in Section 6 of the Gamification TPA -- raw numbers create "low number = dumb" associations.

| IQ Range | Title | Color | Progress Bar "Next" Target |
|---|---|---|---|
| 0-29 | Rookie Scout | #9ca3af (gray) | 30 |
| 30-59 | Dugout Analyst | #f59e0b (amber) | 60 |
| 60-89 | Front Office Prospect | #3b82f6 (blue) | 90 |
| 90-119 | Analytics All-Star | #06b6d4 (cyan) | 120 |
| 120-149 | Sabermetrics Expert | #22c55e (green) | 150 |
| 150-179 | Baseball Genius | #a855f7 (purple) | 180 |
| 180-200 | Hall of Fame Brain | #f59e0b (gold) | MAX |

**UI spec (replace lines 3170-3173):**
```jsx
<div style={{textAlign:"center",flexShrink:0,minWidth:90}}>
  <div style={{fontSize:11,fontWeight:900,color:iqColor}}>{iqTitle}</div>
  <div style={{width:80,height:4,background:"rgba(255,255,255,.08)",borderRadius:2,marginTop:3,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${iqProgressPct}%`,background:iqColor,borderRadius:2,transition:"width .5s ease"}}/>
  </div>
  <div style={{fontSize:7,color:"rgba(255,255,255,.3)",marginTop:2}}>{iqTitle==="Hall of Fame Brain"?"MAX":`${brainIQ}/${iqNextThreshold}`}</div>
</div>
```

**Compute `iqProgressPct` and `iqNextThreshold`:**
```js
const IQ_TIERS=[{min:0,t:"Rookie Scout",c:"#9ca3af"},{min:30,t:"Dugout Analyst",c:"#f59e0b"},
  {min:60,t:"Front Office Prospect",c:"#3b82f6"},{min:90,t:"Analytics All-Star",c:"#06b6d4"},
  {min:120,t:"Sabermetrics Expert",c:"#22c55e"},{min:150,t:"Baseball Genius",c:"#a855f7"},
  {min:180,t:"Hall of Fame Brain",c:"#f59e0b"}];
const iqTier=IQ_TIERS.slice().reverse().find(t=>brainIQ>=t.min)||IQ_TIERS[0];
const iqTitle=iqTier.t; const iqColor=iqTier.c;
const iqNextTier=IQ_TIERS.find(t=>t.min>brainIQ);
const iqNextThreshold=iqNextTier?iqNextTier.min:200;
const iqProgressPct=iqNextTier?Math.round((brainIQ-iqTier.min)/(iqNextThreshold-iqTier.min)*100):100;
```

This replaces the existing ternary chain at line 3138-3139 with a data-driven lookup. Adds "Hall of Fame Brain" (180+) as a new top tier.

---

### 3. Haptic Feedback Patterns

**Current state:** Only ONE `navigator.vibrate?.(10)` call exists -- the Steal Calculator "Race!" button (line 3680). All other Brain interactions are silent.

**Pattern spec:**

| Interaction | Duration (ms) | Where to Add |
|---|---|---|
| Base toggle (RE24 diamond) | 10 | `onClick` handler in base `<g>` elements (~line 3229) |
| What-If button tap (Single, Walk, K, etc.) | 10 | Inside `doAction()` (~line 3195), already has `snd.play('tap')` |
| Count cell tap (Count Dashboard) | 10 | Count grid `onClick` handlers |
| Pitch card tap (Pitch Lab) | 10 | Pitch card `onClick` (~line 3564) |
| Tab switch | 10 | Tab strip `onClick` (~line 3181) |
| Slider change (Steal Calculator) | 10 | Slider `onChange` handlers (~line 3665), debounce to once per 100ms |
| "Throw!" button (Pitch Lab) | 20 | Throw button `onClick` (~line 3530) |
| "Race!" button (Steal Calculator) | 10 | Already exists (line 3680) |
| Challenge complete (any tab) | 50 | After `snd.play('lvl')` calls (~lines 3202, 3547, 3684) |
| Achievement earned | 50 | In achievement celebration handler (wherever `setAchCelebration` is called) |
| IQ title level-up | [50, 30, 50] | In `trackBrainVisit` or `trackInteraction` when `iqTitle` changes -- use pattern vibration |

**Implementation helper:**
```js
const haptic=(ms)=>{try{navigator.vibrate?.(ms)}catch(e){}};
// Usage: haptic(10) for taps, haptic(20) for actions, haptic(50) for celebrations
// Pattern: haptic([50,30,50]) for IQ level-up (vibrate-pause-vibrate)
```

Add `haptic(10)` alongside every existing `snd.play('tap')` call within the Brain section. Add `haptic(50)` after every `snd.play('lvl')` call. The `try/catch` guards against environments where vibrate throws (some desktop browsers).

---

### 4. Pitch Tunnel Visualization in Pitch Lab

**Current state (lines 3507-3533):** Single pitch trajectory SVG. ViewBox 300x90. Pitcher silhouette at x=15, plate at x=275. Each pitch type has a unique cubic Bezier path. Animated ball follows path on "Throw!" button.

**Tunnel zone spec:**

The "tunnel point" is where all pitches look identical to the batter -- roughly the first 1/3 of the pitch's flight. After the tunnel point, pitches diverge. This is the core teaching concept.

**SVG additions (inside the existing `<svg viewBox="0 0 300 90">`):**

```jsx
{/* Tunnel zone: semi-transparent rectangle from pitcher to tunnel point */}
<rect x="20" y="25" width="80" height="40" rx="4"
  fill="rgba(168,85,247,.08)" stroke="rgba(168,85,247,.15)" strokeWidth=".5"/>
{/* Tunnel point vertical line */}
<line x1="100" y1="20" x2="100" y2="75" stroke="rgba(168,85,247,.25)"
  strokeWidth="1" strokeDasharray="3,2"/>
{/* Label (ages 11+ only, vocabTier >= 3) */}
{vocabTier>=3&&<text x="100" y="16" fill="rgba(168,85,247,.5)"
  fontSize="6" textAnchor="middle">Tunnel Point</text>}
{/* Ghost paths: show 2 comparison pitches at low opacity when a pitch is selected */}
{selPitch&&["fourSeam","changeup"].filter(p=>p!==selPitch).slice(0,2).map((p,i)=>
  <path key={i} d={paths[p]} fill="none" stroke="rgba(255,255,255,.06)"
    strokeWidth=".5" strokeDasharray="2,4"/>
)}
```

**Why x=100 for the tunnel point:** The paths start at x=20 (pitcher) and end at x=280 (plate). The first ~80px of every path is nearly identical (all pitches travel roughly the same line out of the hand). By x=100, curves start to diverge (curveball drops, slider breaks, changeup slows). This maps to the real-world tunnel distance of ~20 feet out of the pitcher's release point (~1/3 of 60.5 feet).

**Additional teaching element for ages 11+:**
```jsx
{vocabTier>=3&&selPitch&&<div style={{fontSize:8,color:"#c4b5fd",textAlign:"center",marginTop:2}}>
  All pitches look the same in the purple zone. Great pitchers make them diverge AFTER the tunnel point.
</div>}
```

**Ghost paths rationale:** Show fourSeam and changeup as faint comparison lines (they're the most common "tunneling pair"). When the player selects slider, they see the fourSeam ghost overlapping through the tunnel zone then diverging. This is the visual "aha" -- the two pitches are identical for 20 feet.

---

### 5. Speed Control Slider for Game Film Replay

**Current state:** `slow={true}` prop triggers `useLayoutEffect` in Field component (lines 112-134 of `src/07_components.js`). It applies per-phase durFactor multipliers: setup phases get 2.0x, key moments get 3.5x, resolution gets 2.5x. Short pulses get 1.8x. There is a 1.0s `preDelay`. Tap-to-pause exists via `svg.pauseAnimations()`.

**Speed slider spec:**

Add a `replaySpeed` state (default 1.0) and a range input to the Game Film controls bar (line 4537).

| Slider Position | Label | speedMultiplier | Effect on durFactor |
|---|---|---|---|
| Left | 0.5x | 2.0 | All existing durFactors doubled (ultra slow-mo) |
| Center | 1x | 1.0 | Current behavior (the existing 2.0/3.5/2.5 factors unchanged) |
| Right | 2x | 0.5 | All existing durFactors halved (faster replay) |
| Far right | 3x | 0.33 | Near real-time speed |

**How it interacts with `useLayoutEffect`:**

The `slow` prop already triggers the useLayoutEffect. The speed slider multiplies the ALREADY-COMPUTED durFactor and phaseFactor values. Change in `src/07_components.js` Field component:

```js
// Add speedMultiplier prop to Field:
const Field=React.memo(function Field({runners=[],outcome=null,ak=0,anim=null,
  animVariant=null,theme=null,avatar=null,pos=null,slow=false,speedMultiplier=1.0}){
```

Then in the useLayoutEffect (line 122):
```js
const phaseFactor=(rawBegin<0.15?2.0:rawBegin<0.5?3.5:2.5)*speedMultiplier;
const durFactor=(rawDur<0.15?1.8:rawDur<0.4?3.0:2.5)*speedMultiplier;
const preDelay=1.0*speedMultiplier;
```

**UI placement (in Game Film controls bar, line 4537):**
```jsx
<div style={{display:"flex",alignItems:"center",gap:4}}>
  <span style={{fontSize:8,color:"#6b7280"}}>Speed</span>
  <input type="range" min="0.33" max="2" step="0.01" value={replaySpeed}
    onChange={e=>{setReplaySpeed(parseFloat(e.target.value));setReplayKey(k=>k+1);}}
    style={{width:60,accentColor:"#60a5fa"}}/>
  <span style={{fontSize:8,color:"#93c5fd",fontWeight:700,minWidth:24}}>
    {replaySpeed<=0.5?"0.5x":replaySpeed<=0.75?"1x":replaySpeed<=1.5?"2x":"3x"}
  </span>
</div>
```

**Key detail:** Changing the slider must re-trigger the animation by incrementing `replayKey`. The useLayoutEffect only runs on `[slow, ak]` dependency -- `ak` is the `replayKey`. So `setReplayKey(k=>k+1)` in the onChange handler will re-render Field with the new speed.

**Sound timing adjustment:** The replay sound effects (lines 4512-4526) use hardcoded `sf=2.5`. Replace with:
```js
const sf=2.5*replaySpeed;
```
This keeps sound effects synchronized with the visual animation at any speed.

**Pass to Field:** On the `<Field>` call at line 4558, add `speedMultiplier={replaySpeed}`:
```jsx
<Field key={`replay-${replayKey}`} ... slow={true} speedMultiplier={replaySpeed}/>
```

---

### Summary: Build Order

1. **IQ title ladder** (10 min) -- Data-driven lookup replaces ternary chain, adds progress bar, hides raw number
2. **Haptic feedback** (15 min) -- Add `haptic()` helper, sprinkle 10/20/50ms calls alongside existing `snd.play()` calls
3. **Speed control slider** (20 min) -- New state + slider UI + speedMultiplier prop on Field + sound timing fix
4. **Pitch tunnel visualization** (15 min) -- Static SVG overlay + ghost paths + teaching text
5. **Brain achievements** (30 min) -- 5 new ACHS entries + tracking fields in brainExplored + trigger logic at 5 code points

Total estimated: ~90 minutes of implementation.

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

## Defensive Animation Gap Analysis (TPA)

**Date:** 2026-03-27 | **Reviewer:** Thought Partner Agent | **Scope:** Animation coverage audit, new animation designs for defensive scenarios

---

### The Problem: 44 Scenarios Show a Static Field

44 scenarios (6.8% of 644) use `anim:"freeze"`. But "freeze" is not always wrong -- many freeze scenarios deliberately teach "don't move." The real gap is scenarios using `anim:"catch"` (84), `anim:"safe"` (23), and several other types that only have inline SMIL fallbacks with no ANIM_DATA entries, meaning they lack ghost/fail variants, direction variants, and the full phase-based animation quality.

**Current animation coverage audit:**

| Animation | Scenario Count | Has ANIM_DATA? | Has Inline SMIL? | Has Fail Variant? | Needs Work? |
|-----------|---------------|----------------|-------------------|-------------------|-------------|
| hit | 98 | Yes (+ CF, LF variants) | Yes (fallback) | Yes | Low -- well covered |
| strike | 86 | Yes (+ curveball, slider, changeup) | Yes | Yes | Low |
| catch | 84 | **No** | Yes (inline only) | **No** | **HIGH** |
| groundout | 73 | Yes (+ 1B variant) | Yes | Yes | Low |
| throwHome | 47 | Yes (+ OF variant) | N/A | No | Medium |
| freeze | 44 | Yes (2B, 3B variants) | Yes | N/A | Medium (see below) |
| advance | 39 | Yes (+ 2to3, 3toHome) | Yes | No | Medium |
| steal | 37 | Yes (+ 2to3, 3toHome) | Yes | Yes | Low |
| strikeout | 27 | Yes | Yes | Yes | Low |
| score | 23 | Yes | Yes | Yes | Low |
| safe | 23 | **No** | Yes (inline only) | **No** | **HIGH** |
| bunt | 21 | Yes | Yes | Yes | Low |
| doubleplay | 20 | Yes | N/A | No | Medium |
| walk | 14 | Yes | Yes | No | Low |
| flyout | 13 | Yes (+ CF, LF variants) | Yes | Yes | Low |
| relay | 6 | Yes | Yes (inline) | No | Medium |
| pickoff | 6 | **No** | Yes (inline only) | **No** | **HIGH** |
| popup | 4 | **No** | Yes (inline only) | **No** | Medium |
| wildPitch | 2 | **No** | Yes (inline only) | **No** | Low (only 2) |
| squeeze | 2 | **No** | Yes (inline only) | **No** | Low (only 2) |
| tag | 1 | **No** | Yes (inline only) | **No** | Low (only 1) |
| hitByPitch | 1 | **No** | Yes (inline only) | **No** | Low (only 1) |

---

### The 6 Most-Needed New ANIM_DATA Entries

Prioritized by: (1) scenario count, (2) educational value, (3) visual distinctiveness from existing animations.

#### 1. `catch_success` / `catch_fail` -- 84 scenarios, NO ANIM_DATA

The most common animation without ANIM_DATA. Current inline SMIL shows a generic ball dropping from upper-left to a fielder. No fail variant exists at all.

**Proposed `catch_success` phases:**
```
catch_success: [
  // Ball arcs to fielder position (SS/2B area)
  {type:"ball", path:"M200,290 Q220,180 235,165", dur:.4, begin:0, color:"white", r:2.5, easing:EASE.flyArc, glow:true},
  // Trail following ball
  {type:"trail", path:"M200,290 Q220,180 235,165", dur:.4, begin:.03, color:"white", r:1.5, easing:EASE.flyArc},
  // Glove pop flash at catch point
  {type:"flash", cx:235, cy:165, r:10, dur:.12, begin:.39, color:"rgba(34,197,94,.5)"},
  // Dust from slide-step
  {type:"dust", cx:237, cy:167, r:5, dur:.25, begin:.38, color:"#c4a882"},
  // GOT IT text
  {type:"text", x:235, y:150, text:"GOT IT!", size:10, color:"#22c55e", dur:1.2, begin:0},
]
```

**Proposed `catch_fail` phases (ball drops in):**
```
catch_fail: [
  // Ball arcs toward fielder but drops through
  {type:"ball", path:"M200,290 Q220,180 245,155 Q260,145 280,110", dur:.5, begin:0, color:"white", r:2.5, easing:EASE.flyArc},
  // Fielder reaches but misses -- flash shows "near miss"
  {type:"flash", cx:245, cy:155, r:6, dur:.1, begin:.35, color:"rgba(239,68,68,.3)"},
  // Ball continues past
  {type:"text", x:260, y:140, text:"BASE HIT!", size:10, color:"#ef4444", dur:1.2, begin:0},
]
```

**Direction variants to add:** `catch_LF`, `catch_CF`, `catch_RF` -- change the ball path endpoint. Most catch scenarios specify position context (e.g., "shortstop dives") but the animation is generic.

#### 2. `safe_success` / `safe_fail` -- 23 scenarios, NO ANIM_DATA

Currently uses inline SMIL with expanding green rings. Good visual but lacks runner movement and fail variant.

**Proposed `safe_success` phases (runner beats throw to 2B):**
```
safe_success: [
  // Runner sprinting 1B to 2B
  {type:"runner", path:"M290,210 Q248,170 200,135", dur:.5, begin:0, easing:EASE.runner},
  // Ball arrives at base (slightly late)
  {type:"ball", path:"M200,300 Q210,215 200,138", dur:.45, begin:.12, color:"white", r:2, easing:EASE.throw},
  // Slide dust
  {type:"dust", cx:200, cy:137, r:7, dur:.3, begin:.48, color:"#c4a882"},
  {type:"dust", cx:203, cy:135, r:5, dur:.25, begin:.50, color:"#c4a882"},
  // Flash at arrival
  {type:"flash", cx:200, cy:135, r:12, dur:.15, begin:.49, color:"rgba(34,197,94,.4)"},
  // SAFE text
  {type:"text", x:200, y:120, text:"SAFE!", size:13, color:"#22c55e", dur:1.3, begin:0},
]
```

**Proposed `safe_fail` phases (runner is tagged out):**
```
safe_fail: [
  // Runner sprinting but ball arrives first
  {type:"runner", path:"M290,210 Q265,190 248,178", dur:.45, begin:0, easing:EASE.runner, o:0.5},
  // Ball beats runner
  {type:"ball", path:"M200,300 Q210,215 200,138", dur:.35, begin:.05, color:"#ef4444", r:2.5, easing:EASE.throw},
  // Tag flash
  {type:"flash", cx:230, cy:170, r:10, dur:.12, begin:.42, color:"rgba(239,68,68,.4)"},
  // OUT text
  {type:"text", x:230, y:160, text:"OUT!", size:11, color:"#ef4444", dur:1.2, begin:0},
]
```

#### 3. `pickoff_success` / `pickoff_fail` -- 6 scenarios, but conceptually important

Pickoff is a signature defensive play that teaches reading the pitcher. Current inline SMIL is minimal (ball to 1B + dust). ANIM_DATA would enable: pitcher wind-up fake, snap throw, runner dive-back.

**Proposed `pickoff_success` phases (runner picked off at 1B):**
```
pickoff_success: [
  // Quick snap throw from mound to 1B
  {type:"ball", path:"M200,218 Q245,214 290,210", dur:.2, begin:0, color:"white", r:2.5, easing:EASE.throw, glow:true},
  // Runner starts to dive back (too late)
  {type:"runner", path:"M300,210 Q295,208 292,210", dur:.3, begin:.05, easing:EASE.runner, o:0.6},
  // Tag flash at 1B
  {type:"flash", cx:290, cy:210, r:10, dur:.12, begin:.19, color:"rgba(239,68,68,.5)"},
  // Dust from dive
  {type:"dust", cx:292, cy:212, r:6, dur:.25, begin:.18, color:"#c4a882"},
  // OUT text
  {type:"text", x:290, y:196, text:"PICKED OFF!", size:10, color:"#22c55e", dur:1.2, begin:0},
]
```

**Proposed `pickoff_fail` phases (runner safe on dive-back):**
```
pickoff_fail: [
  // Snap throw
  {type:"ball", path:"M200,218 Q245,214 290,210", dur:.2, begin:0, color:"white", r:2.5, easing:EASE.throw},
  // Runner dives back safely
  {type:"runner", path:"M300,210 Q295,209 290,210", dur:.25, begin:.02, easing:EASE.runner},
  // Dust from dive
  {type:"dust", cx:291, cy:212, r:5, dur:.25, begin:.2, color:"#c4a882"},
  // SAFE flash
  {type:"flash", cx:290, cy:210, r:8, dur:.12, begin:.22, color:"rgba(34,197,94,.4)"},
  // SAFE text
  {type:"text", x:290, y:196, text:"SAFE!", size:10, color:"#ef4444", dur:1.2, begin:0},
]
```

**Variants:** `pickoff_2B` (throw to 2B, more dramatic -- pitcher spin move), `pickoff_3B` (rare but exists in scenarios).

#### 4. `doubleplay_fail` -- 20 scenarios, success exists but no fail

Double play already has `doubleplay_success` in ANIM_DATA showing ball 2B->1B with flashes. Missing: the failure case where the DP turn is botched.

**Proposed `doubleplay_fail` phases:**
```
doubleplay_fail: [
  // Ball to 2B (first out made)
  {type:"ball", path:"M240,258 Q240,200 200,135", dur:.25, begin:0, color:"#22c55e", r:3, easing:EASE.throw},
  {type:"flash", cx:200, cy:135, r:6, dur:.1, begin:.24, color:"rgba(34,197,94,.3)"},
  // Relay throw to 1B (late or wild)
  {type:"ball", path:"M200,135 Q248,170 290,210", dur:.3, begin:.3, color:"#ef4444", r:2.5, easing:EASE.throw},
  // Runner beats it
  {type:"runner", path:"M200,290 Q248,252 290,210", dur:.55, begin:.05, easing:EASE.runner},
  // SAFE at 1B
  {type:"flash", cx:290, cy:210, r:8, dur:.12, begin:.58, color:"rgba(239,68,68,.4)"},
  {type:"text", x:245, y:175, text:"SAFE AT FIRST!", size:9, color:"#ef4444", dur:1.2, begin:0},
]
```

#### 5. `popup_success` -- 4 scenarios, important for infield-fly rule teaching

Current inline SMIL shows a ball going up and coming down. Needs the full treatment: ball pops HIGH (emphasize height), hangs, drops into glove. The infield fly rule is one of the hardest concepts for young players.

**Proposed `popup_success` phases:**
```
popup_success: [
  // Contact flash
  {type:"flash", cx:200, cy:288, r:5, dur:.08, begin:0, color:"rgba(255,255,255,.6)"},
  // Ball pops WAY up (emphasis on height via slow arc)
  {type:"ball", path:"M200,290 Q200,60 210,200", dur:.7, begin:.02, color:"white", r:2.5, easing:EASE.flyArc},
  // Trail showing height
  {type:"trail", path:"M200,290 Q200,60 210,200", dur:.7, begin:.05, color:"white", r:1.5, easing:EASE.flyArc},
  // Catch flash
  {type:"flash", cx:210, cy:200, r:10, dur:.12, begin:.71, color:"rgba(34,197,94,.5)"},
  // Dust at catch point
  {type:"dust", cx:212, cy:202, r:4, dur:.2, begin:.70, color:"#c4a882"},
  // INFIELD FLY text
  {type:"text", x:210, y:185, text:"INFIELD FLY!", size:10, color:"#22c55e", dur:1.2, begin:0},
]
```

#### 6. Freeze Sub-Animations -- Reclassify 44 freeze scenarios

The 44 freeze scenarios fall into distinct categories. Not all should stay as `anim:"freeze"`. Some could use existing animations with `animVariant`:

| Freeze Category | Count (approx) | Recommendation |
|----------------|-----------------|----------------|
| Line-drive freeze (baserunner) | ~8 | Keep as freeze, but add `animVariant:"lineDrive"` showing a line drive caught and ghost runner doubled off |
| Shallow fly hold (baserunner) | ~4 | Could reuse `flyout` with `animVariant:"shallow"` |
| Pitcher fake/deception (baserunner) | ~4 | Add new `freeze_fake` showing pitcher's deceptive move + ball staying at mound |
| Fielder proximity hold (baserunner) | ~5 | Keep as freeze -- the stillness IS the lesson |
| Infield fly situations | ~3 | Remap to `anim:"popup"` |
| Defensive positioning holds (fielders) | ~12 | Keep as freeze -- these are about where to stand, not about ball movement |
| Manager/strategic decisions | ~8 | Keep as freeze -- the animation is secondary to the decision |

**Net result:** ~15 scenarios could be remapped to better animations. The remaining ~29 are correctly using freeze because the POINT is "don't move" or the scenario is about decision-making rather than physical play.

---

### Reuse Strategy: Existing Animations with Variants

Before building new animations from scratch, consider which existing ANIM_DATA entries can serve double duty with direction/context variants:

| New Need | Reuse Base | Variant Key | What Changes |
|----------|-----------|-------------|--------------|
| Tag play at 2B | `steal_fail` | Already exists | Runner tagged at 2B -- this IS a tag play |
| Tag play at 3B | `steal_2to3` + fail logic | `steal_2to3_fail` | Need new entry but follows existing pattern |
| Tag play at home | `score_fail` | Already exists | Throw beats runner to plate |
| Cutoff relay from LF | `relay_success` | `relay_LF_success` | Change ball origin from (300,80) to (100,80) |
| Cutoff relay from CF | `relay_success` | `relay_CF_success` | Change ball origin from (300,80) to (200,50) |
| Bunt fielding (catcher) | `bunt_success` | Add ball-to-1B throw after bunt dribble | Extend existing bunt with fielding phase |
| Force play at 2B | `groundout_success` | `groundout_2B_success` | Change throw target from 1B to 2B |
| Rundown | **New** | N/A | Cannot reuse -- unique multi-throw pattern (see below) |

---

### Stretch Goal: Rundown Animation

A rundown is the most visually complex play in baseball and would be the "wow" animation. It requires a new phase type or creative use of multiple ball phases.

**Proposed `rundown_success` phases (runner caught between 2B and 3B):**
```
rundown_success: [
  // Runner breaks for 3B
  {type:"runner", path:"M200,135 Q165,160 140,185", dur:.3, begin:0, easing:EASE.runner},
  // Ball thrown from SS toward 3B
  {type:"ball", path:"M200,140 Q160,175 120,205", dur:.25, begin:.05, color:"white", r:2, easing:EASE.throw},
  // Runner reverses toward 2B
  {type:"runner", path:"M140,185 Q165,165 185,148", dur:.3, begin:.32, easing:EASE.runner},
  // Ball thrown back from 3B to SS
  {type:"ball", path:"M120,205 Q155,175 185,150", dur:.2, begin:.35, color:"white", r:2, easing:EASE.throw},
  // Tag flash -- caught!
  {type:"flash", cx:175, cy:155, r:12, dur:.15, begin:.55, color:"rgba(239,68,68,.5)"},
  // Dust at tag point
  {type:"dust", cx:177, cy:157, r:6, dur:.25, begin:.54, color:"#c4a882"},
  // RUNDOWN text
  {type:"text", x:170, y:140, text:"TAGGED OUT!", size:10, color:"#22c55e", dur:1.3, begin:0},
]
```

**Challenge:** The runner and two ball throws create visual overlap. The timing must be precise so the ball "chases" the runner convincingly. Consider using 2 runner phases (forward + reverse) and 2 ball phases (throw + return throw). The existing AnimPhases renderer handles this fine since phases are independent SVG elements.

**Variant:** `rundown_1B2B` (between 1B and 2B) -- just shift all coordinates.

---

### Build Priority Recommendation

**Tier 1 (Biggest Impact, Build First):**
1. `catch_success` + `catch_fail` -- covers 84 scenarios
2. `safe_success` + `safe_fail` -- covers 23 scenarios
3. Reclassify ~15 freeze scenarios to existing animation types

**Tier 2 (Educational Value):**
4. `pickoff_success` + `pickoff_fail` + 2B variant
5. `doubleplay_fail`
6. `popup_success` (infield fly teaching)

**Tier 3 (Stretch):**
7. Rundown animation (visually impressive, complex)
8. Additional relay variants (LF, CF origins)
9. Bunt fielding extension (catcher fields + throws)

**Estimated effort:** Tier 1 = ~45 min (6 ANIM_DATA entries + scenario remapping). Tier 2 = ~30 min (4 entries). Tier 3 = ~45 min (complex multi-phase animations).

**Total potential scenario coverage improvement:** From ~38 scenarios with no proper animation data to ~6, covering 95%+ of all plays with full ANIM_DATA phase-based animations.

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

---

## Baseball Brain Execution Monitor (TPA)

**Date:** 2026-03-20 | **Scope:** Risk analysis, quality checks, and post-plan vision for the 36-item Brain improvement sprint

---

### 1. Execution Risks — What Could Go Wrong During Rapid 36-Item Changes

**RISK E1: State explosion from new features stacking on 33 existing useState calls**

The Brain section already has 33 `useState` calls at lines 99-131 of `src/08_app.js`. The improvement plan adds at minimum:
- `brainOnboarded` (A1)
- `buildInningState` with runs/outs/actions (B1)
- `numberAnimTargets` for multiple tabs (B2)
- `brainChallenges` per-tab completion tracking (D6)
- `brainStreakDays` (E5)
- Several new states for pitch trajectory SVGs (C1), steal race animation (C2), speedometer gauge (C3)

Rapid addition of 10-15 new `useState` calls risks:
- Accidentally placing a hook inside a conditional (the ORIGINAL sin, now fixed but could recur in a rush)
- State interdependencies where resetting one tab's state doesn't reset another's (e.g., navigating from Steal to RE24 via deep link but leaving stale steal slider values)
- localStorage bloat if all new state gets persisted via `brainExplored`

**Mitigation:** Before starting Sprint B, do a state audit. Count all Brain useState calls. Group them by tab. Verify none are conditionally called. Consider a `brainState` reducer pattern if the count exceeds 40.

**RISK E2: Cross-tab deep links (B3) create circular navigation**

The plan calls for 10+ cross-tab links. If RE24 links to Steal, Steal links back to RE24, and both auto-scroll to the link, a curious kid could tap back and forth infinitely. Worse, each navigation could trigger `trackBrainVisit()` inflating IQ artificially.

**Mitigation:** Deep links should NOT re-trigger IQ tracking on revisit within the same session. Add a `lastVisited` timestamp check: if same tab visited within 60 seconds, skip IQ increment. Also, cross-link UI should be a subtle footer, not a modal that demands attention.

**RISK E3: Build Your Inning (B1) logic duplication with RE24 What-If buttons**

The existing What-If buttons (Single, Walk, K, Bunt, Steal, Sac Fly, DP) already advance runners and track state. "Build Your Inning" adds a meta-layer (track total runs, count outs to 3, reset for new inning). The risk is duplicating the runner-advancement logic rather than reusing it, creating two sources of truth for "what happens on a single with runners on 1st and 2nd."

**Mitigation:** Extract the runner-advancement logic from the What-If buttons into a shared function BEFORE building the inning sandbox. The sandbox should call the same function and just add run-tracking and out-counting on top.

**RISK E4: Pitch trajectory SVGs (C1) are significantly more complex than estimated**

The plan estimates 80 lines for 8 pitch paths with a "Throw" button and slow-motion toggle. In practice, baseball pitch movement involves:
- 3D perspective projection (side view) of non-linear curves
- Different pitches break in different planes (slider = horizontal, curveball = vertical, cutter = late horizontal)
- Speed variation along the path (changeup decelerates)
- A "tunnel point" where pitches look identical before diverging

80 lines might produce static SVG paths, but the "Throw" button with slow-motion replay needs `requestAnimationFrame` or CSS `@keyframes`, which typically runs 30-50 lines per animation type. Expect 150-200 lines, not 80.

**Mitigation:** Start with 3 pitch types (fastball, curveball, changeup) for Sprint C. Add the remaining 5 in a follow-up. The pitch tunneling overlay (E2) depends on C1 being solid, so under-investing in C1 creates a cascading delay.

**RISK E5: Tab mastery rings (C4) and BrainIQ (A2) double-counting exploration**

The current `trackBrainVisit` function at line 3078 already has a broken IQ calculation (the ternary is circular: `newIQ = min(200, tabs*5 + (brainIQ >= tabs*5 ? brainIQ : tabs*5))`). This effectively means IQ = max(previous IQ, tabs visited * 5), which only grows when visiting NEW tabs. But the plan says IQ should also grow from interactions, challenges, and quiz bridge usage. If the execution agent just patches the formula without restructuring it, IQ will remain a "tabs visited" counter dressed up as something more.

**Mitigation:** Replace the entire IQ calculation with a proper scoring function. Define point values: tab visit = 5, meaningful interaction = 1 (capped at 10 per tab per day), challenge completed = 15, quiz bridge used = 3. Store the breakdown in `brainExplored` so debugging is possible.

**RISK E6: Sound additions (B6) could clash with existing Web Audio system**

The existing `snd.play()` system was built for quiz feedback sounds. Adding `snd.play('tap')` on every Brain interaction (base toggle, slider drag, button press) could create audio spam if a kid rapidly taps bases. The Web Audio context also has a limit on simultaneous AudioBufferSourceNodes.

**Mitigation:** Add a debounce to Brain tap sounds: minimum 100ms between plays. Use a single re-triggerable oscillator rather than spawning a new source node per tap. Keep Brain sounds distinctly quieter than quiz feedback sounds.

**RISK E7: Famous Moments content (D1) needs historical accuracy verification**

Adding 4-8 new moments (Buckner 1986, Gibson HR 1988, Bumgarner 2014, Pine Tar Game, Jeter flip play) requires exact situational data. If the agent gets a detail wrong (wrong inning, wrong count, wrong score), a baseball-savvy parent or coach will lose trust in the entire app. These moments are well-documented — errors are inexcusable.

**Mitigation:** Each new moment should include a source comment. The agent should verify: exact year, game number/context, score at the time of the play, inning/outs/runners. If unsure, use hedging language ("approximately" or "with the score close") rather than stating a wrong specific.

**RISK E8: RPG skill tree (E1) rendering performance on mobile**

120 lines for an SVG graph of 65+ concept nodes with edges, color-coded by mastery, with click handlers. On a low-end phone (the target device for many kids), rendering 65+ SVG elements with interactivity will likely cause:
- Slow initial render (65 circles + 80+ lines + text labels)
- Laggy pan/zoom if implemented
- Overlapping labels making the graph unreadable

**Mitigation:** Start with a simplified tree: show only the current domain (7-12 nodes per domain) rather than all 65 at once. Use the domain filter that already exists in the concept map. Defer full-graph view to desktop or a "zoom out" button.

---

### 2. Quality Checks — What to Verify After Each Sprint

**After Sprint A (Critical Fixes):**
- [ ] Onboarding tooltip appears on FIRST Brain visit, never again (check `brainExplored._onboarded` in localStorage)
- [ ] Tapping a base on a 320px-wide phone screen works reliably (test on smallest target device)
- [ ] Tab strip auto-scrolls to the active tab when navigating via deep link from quiz
- [ ] BrainIQ displays in the header and updates when visiting new tabs
- [ ] Daily fact rotates (change the date in localStorage, reload, verify new fact)
- [ ] The truncated history text at line 4003 now shows the full trend string
- [ ] Park selection shows individual park data, not just category-level
- [ ] Concept map scrolls without nested scroll trap
- [ ] TTO tooltip is visible and understandable to a 13-year-old

**After Sprint B (Engagement):**
- [ ] "Build Your Inning" tracks runs correctly through all 3 outs, including edge cases: bases-loaded walk (run scores), double play (2 outs at once), strikeout for 3rd out (inning ends)
- [ ] Number animations don't flash or glitch when rapidly changing state (toggle bases on/off quickly)
- [ ] Every cross-tab deep link lands on the correct tab with correct pre-loaded state
- [ ] "Test Yourself" finds a real scenario matching the tab's concept (not a random one)
- [ ] Tap sounds play but don't stack/overlap on rapid input
- [ ] "Review This" on mastered concepts navigates to quiz and returns to Brain after answering

**After Sprint C (Visual Polish):**
- [ ] Pitch trajectory SVGs render correctly on both 320px and 1280px viewports
- [ ] Steal race animation completes in 2 seconds, doesn't freeze mid-animation
- [ ] Speedometer gauge needle points to correct position at boundary values (0, 50, 75, 90, 100, 120)
- [ ] Tab mastery rings are visible but don't make the tab strip too tall
- [ ] RE24 heatmap colors are distinguishable (check 0.11 vs 0.24 vs 0.54 color difference)
- [ ] Color-blind accessibility: every count cell has a text label ("Hitter's" / "Pitcher's") in addition to color
- [ ] "Double" button produces correct runner advancement (runners on 2nd/3rd score, 1st to 3rd, batter to 2nd)

**After Sprint D (Content):**
- [ ] All new Famous Moments have historically accurate data (verify year, score, inning, outcome)
- [ ] Youth bunt disclaimer shows for vocabTier <= 3 and does NOT show for advanced players
- [ ] Youth steal preset uses age-adjusted break-even (0.50 for youthPitch, 0.60 for travelMiddle)
- [ ] DP Depth situation toggles correctly show "justified" only when R1 + <2 outs
- [ ] Share button copies clean text to clipboard (test on mobile Safari — clipboard API requires HTTPS)
- [ ] Tab challenges track completion and award IQ points

**After Sprint E (Advanced):**
- [ ] Skill tree renders without lag on a low-end device (test with 65+ nodes)
- [ ] Pitch tunneling overlay shows two paths diverging from a common tunnel point
- [ ] WP line graph handles all 7 score differentials without overlapping lines
- [ ] Draggable fielders snap to presets and stats update on drop
- [ ] Brain streak integrates with (not duplicates) the existing daily quiz streak
- [ ] Haptic feedback fires on supported devices but doesn't error on desktop

**Cross-Sprint Integration Check (after all 36 items):**
- [ ] Navigate through the full loop: Home fact -> Brain tab -> cross-link -> another tab -> Test Yourself -> quiz -> wrong answer -> deep link back to Brain. Verify no state leaks, no stale data.
- [ ] A brand-new player (0 games) cannot access Brain (gated at `gp>=1`)
- [ ] A 6-year-old sees only age-appropriate tabs (no Matchup, no Defense until age 9)
- [ ] All Brain state resets properly when switching tabs (no leftover state from previous tab)
- [ ] localStorage size with full Brain exploration data stays under 100KB

---

### 3. Emerging Opportunities — Patterns Enabled by Cross-Tab Links

**Opportunity 1: "Learning Journey" Auto-Detection**

Once cross-tab links exist (B3) and tab exploration is tracked (C4), the app can detect NATURAL learning journeys: "This kid started at RE24, went to Steal Calculator, came back to RE24 and tried the steal button, then aced a steal scenario." This is a richer signal than individual tab visits. Track sequences of tab visits as a `brainJourney` array. After 3+ sessions with consistent patterns, surface: "You keep exploring steals! You're becoming a Steal Expert."

**Opportunity 2: "Brain-Assisted Wrong Answer Recovery"**

With deep links from enrichFeedback already partially implemented (line 1061-1153 of `src/05_brain.js` adds `deepLink` objects), the next step is tracking whether a player who uses a deep link after a wrong answer then gets the SAME concept right on their next attempt. This is the "Aha Moment" achievement (already designed in the Gamification TPA above), but it's also a powerful signal for the adaptive difficulty system. Players who use Brain links should get a slight difficulty boost on the retried concept -- they just studied it.

**Opportunity 3: "Concept Cluster" Teaching via Tab Intersection**

Some concepts span multiple tabs: "steal-breakeven" touches RE24 (break-even math), Steal Calculator (timing), Count Dashboard (best counts to steal on), and Win Probability (when steals matter most). Once cross-links connect these tabs, the app can create multi-tab mini-lessons: "The Steal Deep Dive: Visit 4 tabs to understand everything about stealing." This is more engaging than reading one explanation and more structured than random exploration.

**Opportunity 4: "What Changed?" Context on Cross-Tab Navigation**

When navigating from RE24 (where the kid just saw that stealing costs 0.28 RE on failure) to Steal Calculator (where they see the timing math), add a contextual bridge sentence: "You just saw that a failed steal costs 0.28 runs. Now let's find out HOW FAST the runner needs to be to avoid that." This connecting tissue turns tab-hopping from "clicking around" into "following a thread."

**Opportunity 5: Tab-Specific AI Scenario Generation**

After a kid spends 2+ minutes on Pitch Lab exploring sequencing, the "Test Yourself" button (B4) should generate an AI scenario specifically about pitch sequencing with the exact pitches they were just exploring. The Brain state (which pitches they viewed, what sequence they built) becomes context for the AI prompt. This creates a deeply personalized quiz-Brain loop.

---

### 4. Post-Plan Vision — What Would Make a Coach Say "I Need This for My Team"

After all 36 items ship, Baseball Brain will be a solid individual exploration tool. But coaches need TEAM tools. Here's the gap between "cool app" and "essential coaching tool":

**Gap 1: No Team Dashboard**

A coach with 15 players needs to see: "Which of my players understand cutoff roles? Who is weak on situational hitting? What concepts should I teach at practice this week?" The Concept Map has all the mastery data per-player, but there's no aggregate view across players. Phase 3's Coach Mode Preview exists as a teaser, but the real value is: import a team roster (even just names), see each player's concept mastery grid, and get a "This Week's Practice Plan" auto-generated from collective gaps.

**Gap 2: No "Assign This" Workflow**

Coaches want to say "Do the RE24 Explorer and Build Your Inning before Tuesday's practice." Currently there's no assignment or sharing mechanism. A simple "Share Challenge" link that pre-loads a specific tab with specific state would be a lightweight first step. The share button (D5) copies a fact -- extend it to copy a challenge link.

**Gap 3: No Progress Over Time**

The Concept Map shows current mastery state but not trajectory. A coach wants: "Jaylen went from 0 mastered concepts to 12 in 3 weeks." The data exists in localStorage (mastery state changes are timestamped), but there's no visualization. A simple "Concepts Mastered Over Time" line graph per player would be transformative for parent conferences.

**Gap 4: No Connection to Real Practice**

Brain teaches WHAT to do. It doesn't connect to HOW to practice it. After a kid explores pitch sequencing in Pitch Lab, the app should suggest: "At your next bullpen session, try this sequence: fastball up, changeup down, slider away. Tell your catcher to set up for it." These are practice plans, not just data exploration.

**Gap 5: No Game Prep Mode**

Before a game, a coach could input: "We're playing at Fenway, their pitcher is a LHP who throws 85." Brain could auto-generate a pre-game briefing: "Park factor 106 (hitter-friendly). Your right-handed batters have platoon advantage (+18 BA pts). At 85 mph, look for the changeup -- it's his best pitch by run value but at this speed it won't fool patient hitters." This requires no new data -- it's just combining existing BRAIN data based on inputs.

**The "I need this" moment for a coach:** When the app saves them 30 minutes of practice planning per week by automatically identifying what their team needs to work on and providing interactive tools to teach it.

---

### 5. Edge Cases — Boundary Conditions the Main Agent Will Likely Miss

**Edge Case 1: 0 Games Played -- Reaching Brain**

The Brain entry point is gated at `stats.gp>=1` (line 2006). But:
- What if a player clicks "Baseball Brain" on the home screen before playing any games? The Brain Facts section is gated at `gp>=3` (line 1972), so there's a window at 1-2 games played where Brain is accessible but no daily fact shows.
- More critically: a brand-new player has NO mastery data. The Concept Map will show ALL concepts as "unseen" with zero progress bars. This is discouraging. The onboarding (A1) should handle this: "Play some challenges first to start filling your map!"
- The "Test Yourself" button (B4) will find no scenarios for a player who hasn't played any position yet. It should gracefully degrade: "Play some challenges first, then come back to test yourself!"

**Edge Case 2: Ages 6-8 on Every Tab**

The `isYoung` flag (vocabTier <= 2) triggers simplified UI in RE24 (stars instead of numbers) and Counts (emoji faces). But several new features don't account for this age group:

- **Build Your Inning (B1):** "You scored 0.54 runs! Average: 0.47" is meaningless to a 7-year-old. Young mode should say: "You scored 1 run! Can you score 2?" and use whole numbers only.
- **Pitch trajectories (C1):** Young kids don't know what a "sweeper" or "splitter" is. Limit to 3 pitches: "Fast ball," "Curve ball," "Change-up" with simple labels.
- **Speedometer gauge (C3):** Great visual for all ages. But the labels should be: "Fresh / Getting tired / Very tired / Stop!" not "Fading / Danger Zone."
- **Cross-tab links (B3):** Text like "Need 72% to break even" is jargon. Young links should say: "Want to see if the runner is fast enough? [Go!]"
- **Tab challenges (D6):** "Score 4+ runs in an inning" works for all ages. "Build a 12+ point sequence" does NOT work for ages 6-8 because they shouldn't see the sequencing builder at all.
- **Number animations (B2):** Stars (for young) can't animate the same way numbers do. Either skip animation for young or animate star count (1 star -> 2 stars with a "pop" effect).

**Edge Case 3: Rapid Tab Switching**

A hyperactive 8-year-old will tap through all 11 tabs in 10 seconds. Each tap calls `trackBrainVisit()` which calls `setStats()`. Eleven rapid `setStats` calls may batch in React but could also cause:
- 11 localStorage writes in quick succession
- IQ jumping from 0 to 55 in one session (11 tabs * 5 pts) -- feels unearned
- `brainExplored` object growing with 11 entries simultaneously

**Mitigation:** Debounce `trackBrainVisit`: only count a visit if the player stays on the tab for 2+ seconds. This prevents speed-clicking inflation and ensures IQ reflects actual exploration.

**Edge Case 4: Deep Link from Quiz to Brain When Brain Tab Doesn't Exist for Age**

A 7-year-old gets a wrong answer on a matchup scenario. The `enrichFeedback` deep link points to `tab:"matchup"`. But Matchup Analyzer has `minAge:11`. The kid taps the link and... what happens? Currently `activeTab = visibleTabs.find(t=>t.id===brainTab) || visibleTabs[0]`, so they'd land on the RE24 tab (first visible). The deep link would silently fail.

**Mitigation:** Before showing a deep link in enrichFeedback, check the player's age against the target tab's `minAge`. If the tab is age-locked, either hide the deep link entirely or redirect to a related unlocked tab with appropriate context.

**Edge Case 5: Concept Map "Practice This" Button When No Scenarios Match**

The Concept Map's "Practice This" button (line 3635) searches `SCENARIOS` for matching `conceptTag`. Some concepts have 0 matching scenarios (the audit identified `of-wall-play`, `mound-composure`, `defensive-substitution` as having 0 scenarios). Clicking "Practice This" for these concepts will silently do nothing because `scens.length > 0` is false.

**Mitigation:** If no scenarios match, show "No challenges available yet for this concept" instead of a dead button. Or better: trigger an AI scenario generation specifically for that concept (Pro only).

**Edge Case 6: Build Your Inning with Bases Loaded Walk Scoring**

The existing walk logic at lines 3189-3191 handles bases-loaded as a special case. But "Build Your Inning" needs to track TOTAL runs scored across the half-inning. The current walk handler calls `doAction()` with a `+1` for the run scored, but this is an RE24 delta display, not a cumulative counter. The sandbox needs its own cumulative run counter that persists through all 3 outs.

**Edge Case 7: Share Button on HTTP (Not HTTPS)**

The share/clipboard feature (D5) uses `navigator.clipboard.writeText()`. This API requires a secure context (HTTPS). The preview server (`npx serve .`) runs on HTTP at localhost. Sharing will fail silently in preview mode. The deployed app at `bsm-app.pages.dev` uses HTTPS and will work fine, but this will cause confusion during development testing.

**Edge Case 8: brainExplored Persistence Across Prestige Resets**

When a player prestiges (resets after Hall of Fame), the `DEFAULT` state object is applied. Does `brainExplored` survive prestige? If not, a prestigious player loses all Brain IQ and exploration progress. If yes, Brain progress becomes the only thing that persists across seasons -- which might be desirable ("your baseball knowledge is permanent") but needs to be intentional, not accidental.

Check: does the prestige reset logic explicitly preserve `brainExplored` and `brainIQ`? If not, it should.

---

### 6. The One Thing the Plan Doesn't Address: Explanation-to-Brain Feedback Loop

The plan has Quiz -> Brain (deep links from wrong answers) and Brain -> Quiz ("Test Yourself"). But it's missing the THIRD leg of the triangle: **Brain insights changing how explanations are written.**

Currently, a kid who gets a steal scenario wrong sees a static explanation ("The steal break-even rate is 72%..."). After they visit the Steal Calculator and spend 3 minutes playing with sliders, they now UNDERSTAND the timing math. If they get a similar scenario wrong again, the explanation should be DIFFERENT: "Remember in the Steal Calculator, you found that a 1.35s delivery + 2.00s pop = 3.35s. The runner here needs 3.55s. Do the math." This is personalized explanation based on Brain exploration history.

Implementation would be lightweight: check `brainExplored.steal.interactionCount > 5` and inject a "remember when you explored..." prefix into the steal explanation. No new data needed -- just conditional text in `enrichFeedback()` based on exploration state.

This closes the loop: Quiz teaches through explanations -> Brain teaches through exploration -> Exploration improves explanations -> Quiz becomes more effective. That's the flywheel that makes Baseball Brain exceptional, not just useful.

---

### Summary: Top 5 Risks to Watch

1. **State management complexity** -- 33+ useState calls becoming 45+. Consider a reducer before Sprint B.
2. **BrainIQ calculation is currently broken** (circular ternary). Fix must be a real scoring function, not a patch.
3. **Cross-tab deep links risk circular navigation and IQ inflation.** Debounce visits, cap IQ per session.
4. **Pitch trajectory SVGs are 2x the estimated effort.** Start with 3 pitches, not 8.
5. **Age 6-8 gets overlooked on every new feature.** Every item needs an `isYoung` check.

---

## Sprint E Execution Notes (TPA)

**Date:** 2026-03-20 | **Reviewer:** Thought Partner Agent | **Scope:** Pre-execution code state, SVG complexity assessment, integration risks, new ideas, post-E vision

---

### 1. Pre-Execution Code State Check

**Total useState count: 88 declarations** (up from 33 Brain-specific earlier). The Brain section alone has 37 useState calls at lines 99-137. This is within tolerance but approaching the zone where a `useReducer` would improve maintainability. Sprint E adds at minimum 3-5 more state variables for challenges, haptics toggle, etc.

**Bugs from earlier TPAs -- status check:**

- FIXED: `reRunners.sort()` mutation -- now correctly uses `[...reRunners].sort()` at line 3241.
- FIXED: Hooks hoisted to top level -- all Brain useState calls are at lines 99-137, unconditional. No hooks inside IIFE conditionals.
- FIXED: BrainIQ calculation -- line 3091 now uses `tabsVisited*5 + interactions sum (capped at 10 per tab)`. No longer circular.
- FIXED: Cross-tab navigation -- `navigateBrain()` at line 3105 handles state pre-loading correctly.
- FIXED: `brainExplored` preservation across prestige -- prestige reset at line 2423 only clears `pts,str,bs,sp,season` fields; `brainExplored` and `brainIQ` survive by default.
- NOT YET ADDRESSED: IQ visit debounce -- `trackBrainVisit()` at line 3085 still counts every tab click immediately. No dwell-time check. E11 lists this fix.
- NOT YET ADDRESSED: Practice This with 0 scenarios -- line 3737 silently does nothing when no scenarios match. E11 lists this fix.
- NOT YET ADDRESSED: Deep links to age-locked tabs -- `enrichFeedback` at line 1061 can return a deepLink to "matchup" for a 7-year-old. E11 lists this fix.

**State stubs already declared:** Lines 133-137 have `inningMode`, `inningRuns`, `inningActions`, `stealRacing`, `pitchThrow` -- declared but unused. Sprint E should use these, not create new ones.

**`rePrevRE` is stored but never rendered (line 103).** E2 (Number Animation) should finally consume this value. Confirm during E2 that `rePrevRE` feeds the animation's "from" value.

**`enrichFeedback` does NOT currently receive `brainExplored` data.** Line 4514: `enrichFeedback(sc,choice,sc.situation)` passes only 3 args. E10 needs to either (a) pass `stats.brainExplored` as a 6th argument, or (b) have the personalization logic live in `08_app.js` as a post-processing step on the returned insights. Option (b) is cleaner since `enrichFeedback` is in `05_brain.js` and shouldn't depend on app-level state.

---

### 2. SVG Complexity Assessment

**E3: Pitch Trajectories (3 pitches)**

The current Pitch Lab has zero SVG trajectory visualization. The pitches need to show a side view (like a pitching tunnel camera) from release point to plate. Here are the specific SVG elements needed:

```
ViewBox: "0 0 300 150" (horizontal = distance, vertical = drop/rise)
Release point: (30, 60) -- left side, about 6 feet high
Plate: (270, 100) -- right side, strike zone center

FASTBALL path:
  M30,60 C100,55 200,65 270,75
  (Slight natural rise illusion, then gravity drop -- gentle curve)
  Speed overlay: dashed line showing "expected" straight path vs actual

CURVEBALL path:
  M30,60 C80,50 160,60 270,120
  (Starts level with fastball, then drops sharply -- the 12-to-6 break)
  Drop magnitude: 15-20 SVG units more than fastball endpoint

CHANGEUP path:
  M30,60 C90,57 180,68 270,95
  (Mirrors fastball trajectory for first 60%, then drops off)
  Tunnel point: ~x=150 where path diverges from fastball
```

For the "Throw" button animation, use `stroke-dasharray` + `stroke-dashoffset` with CSS animation:
```css
@keyframes pitchDraw { from { stroke-dashoffset: 300; } to { stroke-dashoffset: 0; } }
```
Duration: 0.8s normal, 2.5s slow-motion. No `requestAnimationFrame` needed -- pure CSS animation on SVG path is sufficient and performant. The slow-motion toggle just changes the `animation-duration`.

Add a faint "tunnel zone" rectangle at x=120-160 with 5% opacity fill to show where pitches look identical. Text label: "Tunnel Point" at age 11+.

**Estimated actual lines: ~85 (not 100)** because CSS-animated SVG paths are concise.

**E5: Speedometer Gauge**

The current pitch count display (line 3762-3768) is a plain number + range slider. The speedometer needs:

```
ViewBox: "0 0 200 120" (semicircle)
Center: (100, 110)  Radius: 90

Arc path (background):
  M10,110 A90,90 0 0,1 190,110
  (semicircle from left to right)

5 color zones (each ~36 degrees of the 180-degree arc):
  0-25:   #22c55e (Fresh)         -- 0 to 36 deg
  26-50:  #86efac (Strong)        -- 36 to 72 deg
  51-75:  #f59e0b (Fading)        -- 72 to 108 deg
  76-90:  #f97316 (Tired)         -- 108 to 144 deg
  91-120: #ef4444 (Danger Zone)   -- 144 to 180 deg

Each zone is a separate <path> using arc segments. The arc formula:
  x = cx + r * cos(angle)
  y = cy - r * sin(angle)
  Where angle goes from pi (180 deg, left) to 0 (right)

Needle:
  <line x1="100" y1="110" x2={nx} y2={ny} />
  Where angle = pi - (pcCount / 120) * pi
  nx = 100 + 75 * cos(angle)
  ny = 110 - 75 * sin(angle)
  transition: transform 0.5s ease-out (use CSS transform-origin)

Young labels: array of ["Fresh","Getting tired","Very tired","Stop!"]
Adult labels: zone names above
```

Arc segment calculation for each zone boundary:
```js
const arcPoint = (pct) => {
  const angle = Math.PI - (pct / 120) * Math.PI;
  return `${100 + 90 * Math.cos(angle)},${110 - 90 * Math.sin(angle)}`;
};
// Zone boundaries: arcPoint(0), arcPoint(25), arcPoint(50), arcPoint(75), arcPoint(90), arcPoint(120)
```

**Estimated actual lines: ~45** -- the math is compact once the arc helper exists.

**E6: Domain-Grouped Concept Tree**

The current concept map (line 3666-3743) is a flat list with domain filters. The tree view needs to show prerequisite edges between nodes within a domain.

Per-domain node count (from BRAIN.concepts):
- defense: ~12 nodes
- baserunning: ~8 nodes
- pitching: ~8 nodes
- hitting: ~6 nodes
- strategy: ~10 nodes
- rules: ~5 nodes
- mental: ~3 nodes
- catching: ~4 nodes

Approach: Show nodes in a force-directed-ish layout within the filtered domain. Since max is ~12 nodes, a simple 3-column grid layout with SVG edge lines drawn between prerequisite pairs is sufficient. No need for a full force layout algorithm.

```
Container: <div style={{position:"relative"}}>
  Nodes: Absolutely positioned <div> elements in a 3-column grid
  Edges: An SVG overlay with <line> elements connecting prerequisite nodes

  Node positions (for a domain with N nodes):
  col = i % 3, row = Math.floor(i / 3)
  x = 50 + col * 120, y = 30 + row * 80

  Edge for each prereq: <line x1={parentX} y1={parentY} x2={childX} y2={childY}/>
  Color: mastered prereq = #22c55e, unmastered = #ef4444 dashed
```

The key insight: DON'T try to render all 65+ nodes at once. The domain filter already exists. Just add an SVG edge layer on top of the existing domain-filtered list. This is ~50 lines, not 80, because most of the concept list rendering already exists.

---

### 3. Integration Risks and Execution Order

**E2 (NumberAnimation) must be built BEFORE E1 (Build Your Inning), E4 (Steal Race), E5 (Speedometer), and E7 (WP Line)** because all four use animated numbers. The plan already has this order correct.

**E1 (Build Your Inning) and E8 (Tab Challenges) are tightly coupled.** The RE24 challenge ("Score 3+ runs in an inning") literally requires the Build Your Inning sandbox. Build E1 first, then E8 can reference it. Plan order is correct.

**E3 (Pitch Trajectories) is independent** and can be built in parallel with E1/E2 if two agents were working. In serial execution, E3's position at #5 is fine.

**E10 (Brain->Explanation Personalization) has a hidden dependency on E11 (Edge Cases).** Specifically, E10 needs `brainExplored` to be passed to the explanation renderer. But the explanation renderer at line 4514 only passes 3 args to `enrichFeedback`. E10 should add `stats.brainExplored` as a new parameter BEFORE building the personalization logic. Do E11's edge case fixes first (as the plan says), then E10 falls into place.

**E9 (Haptic Feedback) is truly independent** -- 5 lines, no dependencies. Can go last without any risk.

**Risk: E4 (Animated Steal Race) + E2 (NumberAnimation) collision.** The steal race needs the bars to animate over 2 seconds on a "Race!" button. The NumberAnimation component interpolates numbers over ~500ms. These are different animation patterns. E4 should NOT try to reuse NumberAnimation for bar width -- use CSS `transition: width 2s` on the SVG rect elements instead. NumberAnimation is for the time displays (the "3.35s" text that counts up).

**Risk: E6 (Domain Tree) + existing concept list.** The plan says "keep the list as fallback." The implementation should toggle between tree view and list view, not replace the list entirely. Add a small toggle button: "Tree | List" next to the domain filter strip.

**Recommended execution order change:** Move E9 (Haptic) to slot #2 immediately after E11 (Edge Cases), not last. Reason: haptic feedback on base toggles, slider drags, and button taps will make testing E1-E8 more satisfying during development, and it's only 5 lines. Getting it in early means every subsequent feature automatically gets haptic feedback in the `snd.play('tap')` calls if you wire it there.

Revised order:
1. E11 (Edge cases) -- prevents bugs
2. E9 (Haptic) -- 5 lines, improves all subsequent testing
3. E2 (NumberAnimation) -- dependency for E1, E4, E5, E7
4. E1 (Build Your Inning) -- top engagement feature
5. E8 (Tab Challenges) -- depends on E1
6. E3 (Pitch Trajectories) -- independent, high visual impact
7. E4 (Steal Race) -- independent
8. E5 (Speedometer) -- independent
9. E7 (WP Line Graph) -- independent
10. E6 (Domain Tree) -- independent, most complex SVG
11. E10 (Brain->Explanation) -- depends on all Brain state being final

---

### 4. New Ideas from Combining E Items

**Combo 1: Build Your Inning (E1) + Tab Challenges (E8) + Number Animation (E2) = "Inning Replay"**

After a player finishes an inning in the sandbox (3 outs), show an animated replay of all their actions: "Single (+0.40) -> Walk (+0.18) -> K (-0.18) -> Sac Fly (-0.32 + 1 run)". Each line animates the RE24 delta using NumberAnimation. The cumulative run counter ticks up. This turns the sandbox result into a shareable story. The action log (`inningActions` state already exists) feeds this directly.

**Combo 2: Pitch Trajectories (E3) + Steal Race (E4) = "Full At-Bat Simulator"**

After E3 and E4 exist independently, a future sprint could combine them: the pitcher throws (E3 trajectory), the batter swings (hit animation from field system), the runner goes (E4 race). This would be the most visually impressive feature in the app. Not for Sprint E, but the architecture should allow it. Key: pitch trajectory SVG and steal race SVG should use the same viewBox convention (or easily composable viewBoxes).

**Combo 3: Speedometer Gauge (E5) + Brain->Explanation Personalization (E10) = "Fatigue-Aware Coaching"**

If `brainExplored.pitchcount.interactions > 5`, the enrichFeedback personalization (E10) can reference the specific pitch count the player explored: "Remember when you set the gauge to 95 pitches and saw velocity drop 2.1 mph? This pitcher is at 92." This is a natural extension of E10 using E5's exploration data.

**Combo 4: Domain Tree (E6) + Tab Challenges (E8) = "Unlock Path Visualization"**

When a player completes a tab challenge, light up the corresponding concept node in the domain tree. The tree becomes a visual progress map for challenges, not just mastery. "Complete the RE24 challenge to unlock the scoring-probability node" creates a natural goal chain.

**Combo 5: WP Line Graph (E7) + Build Your Inning (E1) = "Inning WP Overlay"**

During Build Your Inning, show a live WP line that updates with each action. If the player's inning is in the 9th of a tie game, each action moves the WP line visibly. This connects RE24 (individual play value) to WP (game-level stakes) in a visceral way.

---

### 5. Post-E Vision: The Single Most Impactful Thing to Build Next

After all 11 Sprint E items ship, the Baseball Brain will have: interactive sandbox (E1), animated visualizations (E2-E5, E7), a concept tree (E6), gamified challenges (E8), haptic feedback (E9), personalized explanations (E10), and cleaned-up edge cases (E11).

**The missing piece: the Quiz-to-Brain "Wrong Answer Recovery" loop.**

The data is already there. `enrichFeedback` already generates deepLink objects pointing to specific Brain tabs (lines 1061-1153 of `05_brain.js`). But the outcome screen at line 4514 calls `enrichFeedback(sc,choice,sc.situation)` without passing age or mastery data, and most importantly: the insights render as plain text, not tappable deep links.

**The single highest-impact post-E feature:**

Make every `enrichFeedback` insight with a `deepLink` field tappable. When a kid gets a steal question wrong and sees "Need 72% success rate to break even on a steal here", tapping it should navigate to the Steal Calculator with the scenario's outs pre-loaded. After exploring the calculator, a "Back to Quiz" button returns them to try a similar scenario.

This is approximately 25 lines of code:
- ~10 lines: Pass `deepLink` from enrichFeedback to the insight renderer
- ~10 lines: `onClick` handler that calls `navigateBrain(ins.deepLink.tab, ins.deepLink.state)` and `setScreen("brain")`
- ~5 lines: Visual indicator (arrow icon, subtle underline) showing the insight is tappable

Why this matters more than any new tab or feature: it closes the learning loop. Right now, wrong answers are dead ends -- the kid reads an explanation and moves on. With tappable deep links, wrong answers become entry points to interactive exploration. The kid who just failed a steal scenario gets to play with the Steal Calculator's sliders and figure out WHY their instinct was wrong. Then they understand it next time.

Every Sprint A-E feature (sandbox, animations, gauge, tree, challenges) becomes more valuable when wrong answers route players into those features. The deep link is the connective tissue that makes the whole Brain system work as a learning engine, not just a collection of cool tools.

---

### Summary: 5 Key Watchpoints During E Execution

1. **Use existing state stubs** (`inningMode`, `inningRuns`, `inningActions`, `stealRacing`, `pitchThrow`) at lines 133-137. Do not create duplicate state.
2. **E10 requires passing `stats.brainExplored` to the outcome screen.** Do this as a post-processing step in `08_app.js` (line 4514 area), not by modifying `enrichFeedback`'s signature in `05_brain.js`.
3. **Pitch trajectory SVGs: use CSS `stroke-dashoffset` animation, not `requestAnimationFrame`.** Simpler, more performant, ~85 lines.
4. **Speedometer arc math:** `angle = PI - (pcCount / 120) * PI`. Needle endpoint: `(100 + 75*cos(angle), 110 - 75*sin(angle))`. Five zone arcs, one helper function.
5. **After E ships, the #1 priority is making enrichFeedback deepLinks tappable on the outcome screen.** ~25 lines, closes the entire learning loop.

---

## Final 3 Items (TPA)

**Date:** 2026-03-21 | **Reviewer:** Thought Partner Agent | **Scope:** NumberAnim component, domain tree SVG, tab challenges with IQ rewards

---

### 1. NumberAnim: How rePrevRE Feeds the Animation

**Current state:** `rePrevRE` (line 103 of `08_app.js`) is set via `setRePrevRE(re24)` at line 3193 immediately BEFORE every `doAction()` call updates `reRunners`/`reOuts`. After the state update, the new `re24` is computed from the new runners/outs. So `rePrevRE` = the OLD value, and `re24` = the NEW value. This is exactly the from/to pair the animation needs.

**The problem:** `rePrevRE` is never read in the render. The RE24 display at line 3249 just shows `re24.toFixed(2)` (or stars for young). It snaps instantly.

**NumberAnim implementation spec:**

```
Props: { from, to, duration=500, decimals=2, prefix="", suffix="", color, fontSize }
Internal: useRef for animationFrameId, useEffect that runs on `to` change
Logic: on mount or `to` change, lerp from `from` to `to` over `duration` ms using requestAnimationFrame + easeOutCubic
Display: renders a <span> with the interpolated value
Cleanup: cancelAnimationFrame on unmount or new animation start
```

~25-30 lines. Key detail: the `from` prop should default to a ref that remembers the last rendered value, so you don't need to pass `rePrevRE` explicitly every time -- the component tracks its own "last displayed value."

**Which values should animate across which tabs:**

| Tab | Value | From Source | To Source | Format |
|---|---|---|---|---|
| RE24 Explorer | RE24 number | `rePrevRE` | `re24` (computed from `reRunners`/`reOuts`) | `X.XX` or stars for young |
| RE24 Explorer | Inning runs (Build Your Inning) | prev `inningRuns` | new `inningRuns` | whole number |
| Win Probability | WP% | prev `curWP` | new `curWP` (from `getWP(wpInning,wpDiff)`) | `XX%` |
| Matchup Analyzer | Projected BA | prev `md.adjustedBA` | new `md.adjustedBA` | `.XXX` |
| Pitch Count | Pitch count display | prev `pcCount` | new `pcCount` | whole number |
| Pitch Count | Velocity drop | prev `veloDrop` | new `veloDrop` | `-X.X mph` |
| Steal Calculator | Margin time | prev `margin` | new `margin` | `+X.XXs` |

**For WP, Matchup, and Pitch Count:** These tabs don't have a dedicated `prev` state variable like RE24 does. The simplest approach: make NumberAnim self-tracking. Store `lastDisplayed` in a ref inside the component. When `to` changes, animate from `lastDisplayed.current` to the new `to`. This eliminates the need for `prev` state variables on every tab.

**Young player (isYoung) handling:** Stars can't lerp. Two options: (a) skip animation entirely for young, just snap; (b) animate star count as a "pop" effect (scale 1 -> 1.3 -> 1 over 300ms when count changes). Option (b) is better UX, but it's a different component (StarAnim, not NumberAnim). Recommend: build NumberAnim first, add a `type="stars"` variant later if time permits. For now, young players get snap behavior.

**Gotcha: rapid state changes.** A kid toggling bases quickly will queue multiple animations. The component MUST cancel the previous animation when a new one starts (via `cancelAnimationFrame`). The lerp should always start from the CURRENT interpolated position, not from `rePrevRE`, to avoid visual jumps.

---

### 2. Domain Tree: Per-Domain View, Not Full Graph

**The numbers that drive this decision:**

76 concepts across 8 domains. Domain sizes:
- defense: ~19 nodes
- pitching: ~13 nodes
- strategy: ~12 nodes
- baserunning: ~9 nodes
- hitting: ~6 nodes
- rules: ~5 nodes
- mental: ~3 nodes
- catching: ~1 node (most catcher concepts live in defense)

Full graph = 76 nodes + ~90 edges. On a 320px mobile viewport, that is unreadable and laggy. Previous TPA (Risk E8) already flagged this.

**Recommendation: per-domain view (7-12 nodes) with domain picker.**

The domain filter buttons already exist at line 3754-3756. Replace the flat concept list (lines 3759-3791) with an SVG tree when a domain is selected, and show a domain overview grid when "All" is selected.

**SVG layout algorithm (simplest that works):**

Use a top-down layered layout based on prereq depth:
1. Compute `depth` for each node: nodes with no prereqs = depth 0, nodes whose prereqs are all at depth N = depth N+1
2. Group by depth layer
3. X position: evenly space nodes within each layer
4. Y position: `depth * 70px` (gives room for labels)
5. Draw edges from each prereq to its dependent as straight lines (no Bezier needed at 7-12 nodes)

For the largest domain (defense, ~19 nodes), this produces 4-5 layers. At 70px per layer, that is 280-350px tall -- fits in one screen on mobile with modest scroll. Each node is a circle (r=18) with mastery color fill + abbreviated label below.

**SVG spec:**
- ViewBox: `0 0 320 (layers*70+40)` -- full width, height scales with depth
- Nodes: `<circle>` with mastery fill color + `<text>` label (8px, truncated to 12 chars)
- Edges: `<line>` from parent center to child center, `stroke-opacity: 0.3`, color matching parent's mastery state
- Tap handler: `onClick` sets `selConcept` to show the existing detail panel below the tree
- Active node highlight: 2px stroke ring on selected node

**Why NOT full graph with scroll:**
- 76 nodes + 90 edges = ~250 SVG elements. On an iPhone SE (the budget target), this renders in ~80ms initially but becomes janky with tap handlers and repaints on mastery state changes.
- Scroll-to-zoom adds ~40 lines of touch handler code and creates nested scrolling conflicts with the Brain tab's own scrollable container.
- The domain filter is already built and understood by users. Switching from flat list to tree within the same filter paradigm is zero learning curve.

**"All" view (no domain selected):** Show a 2x4 grid of domain cards, each showing: domain name, node count, mastery fraction (e.g., "5/19 mastered"), a tiny inline progress bar, and the domain color. Tapping a card sets `domainFilter` and renders the tree. This replaces the overwhelming 76-item flat list with a scannable dashboard.

**Estimated code:** ~120 lines for the tree renderer + ~30 lines for the domain overview grid = ~150 lines total. The layout algorithm is ~25 lines (depth computation + layer positioning).

---

### 3. Tab Challenges: Exact Completion Conditions and IQ Values

**Data structure (already stubbed):**

`brainExplored[tabId].challengeDone` exists at line 3090. IQ formula at line 3094: `challengePts = Object.values(be).filter(v=>v?.challengeDone).length * 15`. So each completed challenge = 15 IQ points.

**3 Starter Challenges:**

**Challenge 1: RE24 "Build Your Inning" -- Score 3+ runs**

- Tab: `re24`
- Precondition: `inningMode === true` (player must click "Play an Inning" first)
- Completion condition: `inningRuns >= 3` when `reOuts >= 3` (inning ends)
- Detection point: Line 3196, inside the `if(newOuts>=3)` timeout callback. After computing `finalRuns`, check: `if(finalRuns >= 3 && !stats.brainExplored?.re24?.challengeDone)`
- UI: Show a challenge banner inside the inning tracker (line 3241): "Challenge: Score 3+ runs this inning!" with a target icon
- On completion: Set `be.re24.challengeDone = true` in stats, show toast "Challenge Complete! +15 IQ", play `snd.play('ach')`
- Edge case: The `finalRuns` calculation at line 3196 uses `inningRuns + runsScored` where `runsScored` is from the final action. This is correct -- a bases-loaded walk that ends the inning with 3 outs would count the run. BUT there is a stale closure risk: `inningRuns` inside the `setTimeout` captures the value at the time of the action, not after the `setInningRuns` updater runs. The code already handles this correctly by using `inningRuns + runsScored` (the accumulated value plus the current action's runs). Verify this doesn't double-count.
- Difficulty note: 3 runs in one inning is hard. MLB average is ~0.5. But the sandbox lets you choose outcomes (Single, Walk, Double), so a kid can manufacture a big inning. This is intentional -- the challenge teaches that stringing hits together is how big innings happen.

**Challenge 2: Pitch Lab "Build a Sequence" -- Score 12+ points**

- Tab: `pitchlab`
- Precondition: `seqMode === true` AND `seqPitches.length >= (vocabTier>=4 ? 5 : 3)` (sequence is complete)
- Completion condition: `scoreSeq(seqPitches).total >= 12`
- Detection point: Line 3523, inside the `seqPitches.length >= target` conditional that already renders the score. After `const sc = scoreSeq(seqPitches)`, check: `if(sc.total >= 12 && !stats.brainExplored?.pitchlab?.challengeDone)`
- UI: Show challenge text above the sequence builder: "Challenge: Build a 12+ point sequence!"
- On completion: Same pattern as RE24 -- set challengeDone, toast, sound
- Edge case: For younger players (vocabTier < 3), `seqMode` is hidden (the toggle button at line 3486 is gated at `vocabTier>=3`). This means the Pitch Lab challenge is only available to ages 11+. This is correct -- younger players should not see a challenge they cannot attempt.
- Scoring math: Maximum possible per transition is +3 (best follow-up) +2 (eye level change) +1 (speed change) = +6. A 5-pitch sequence has 4 transitions, so max = 24. A 3-pitch sequence has 2 transitions, max = 12. So for younger players (3-pitch), 12 points requires a PERFECT sequence. Consider lowering threshold to 8 for vocabTier 3 (ages 11-12) and keeping 12 for vocabTier 4+ (ages 13+).

**Challenge 3: Steal Calculator "Find the Bang-Bang Play" -- Margin within 0.05s**

- Tab: `steal`
- Precondition: Player has adjusted at least one slider (not still on default values)
- Completion condition: `Math.abs(margin) <= 0.05` where `margin = throwTime - runnerTime`
- Detection point: Inside the steal tab render (line 3620+), after computing `margin` at line 3630. Check on every slider change: `if(Math.abs(margin) <= 0.05 && !stats.brainExplored?.steal?.challengeDone)`
- Additional requirement to prevent trivial completion: The player must have changed at least 2 of the 3 sliders from their default values (delivery: 1.35, pop: 2.00, runner: 3.55). Track this via a local ref or by comparing current values to defaults.
- UI: Show challenge text below the sliders: "Challenge: Find a bang-bang play (margin < 0.05s)!"
- On completion: Same pattern
- Edge case: Default values (1.35 + 2.00 = 3.35 throw, 3.55 runner) give margin = -0.20, so defaults don't accidentally trigger the challenge. Good. But a kid could just nudge one slider by 0.05 to hit 0.05 margin. The "must change 2+ sliders" guard prevents trivial solutions.
- Teaching value: This challenge teaches that stolen base outcomes are decided by fractions of a second. The kid has to understand what each variable does to find the sweet spot.

**IQ Reward Structure:**

| Challenge | IQ Points | Rationale |
|---|---|---|
| RE24: Score 3+ runs | 15 | Standard per existing formula at line 3094 |
| Pitch Lab: 12+ sequence | 15 | Same |
| Steal: Bang-bang play | 15 | Same |

The existing formula `challengePts = completedCount * 15` means all challenges are worth the same. This is fine for now. If later challenges are harder, consider a `challengePoints` field per tab in BRAIN_TABS (line 3138) instead of the flat 15.

**Total IQ impact:** A player who completes all 3 challenges earns 45 IQ points. Combined with tab visits (11 tabs * 5 = 55) and interactions (capped at 10 per tab = 110 max), the theoretical IQ ceiling is 55 + 110 + 45 = 210, clamped to 200 by `Math.min(200, ...)` at line 3095.

---

### 4. Risks and Edge Cases

**Risk 1: NumberAnim requestAnimationFrame leak on unmount**

If a player navigates away from the Brain screen mid-animation, the rAF callback will try to update state on an unmounted component. React will log a warning. Fix: the useEffect cleanup MUST call `cancelAnimationFrame`. This is standard but easy to forget in a compact codebase.

**Risk 2: NumberAnim + isYoung star display**

The RE24 tab renders stars for young players (line 3249): `"stars".repeat(Math.max(1,Math.round(re24/0.5)))`. NumberAnim cannot interpolate between star strings. The main agent must either: (a) skip NumberAnim for `isYoung` on RE24 and use a CSS scale pulse instead, or (b) have NumberAnim accept a `renderValue` prop that converts the interpolated number to stars. Option (a) is simpler and recommended.

**Risk 3: Domain tree layout for defense domain (19 nodes)**

Defense has the most concepts and the deepest prereq chains (force-vs-tag -> cutoff-roles -> bunt-defense -> no further, max depth 3). With 19 nodes across 4 layers on a 320px viewport, horizontal spacing gets tight. At layer depth 2, there could be 6-7 nodes sharing 320px width = ~46px per node. With 18px radius circles and 8px labels, this BARELY fits. Mitigation: allow horizontal scroll within the SVG for domains with >12 nodes, or use a narrower node radius (14px) for large domains.

**Risk 4: Challenge detection timing for Build Your Inning**

The inning-over logic at line 3196 runs inside a `setTimeout(1500)`. The `inningRuns` value captured in the closure is the value BEFORE `setInningRuns` processes. The code compensates by using `inningRuns + runsScored`. But if the challenge check also needs to update `brainExplored.re24.challengeDone`, that update must happen inside the same `setStats` call or in a subsequent one. Do NOT read `stats.brainExplored?.re24?.challengeDone` from the closure -- it may be stale. Instead, use the functional form: `setStats(p => { if(p.brainExplored?.re24?.challengeDone) return p; ... })`.

**Risk 5: Pitch Lab challenge threshold too high for vocabTier 3**

As noted above, 12 points on a 3-pitch sequence requires a perfect score. Consider: `threshold = vocabTier >= 4 ? 12 : 8` to make the challenge achievable but non-trivial for younger advanced players.

**Risk 6: Steal challenge with pitch clock toggle**

The steal margin changes when pitch clock is toggled (line 3628: `effectiveDT = showPitchClock ? deliveryTime : deliveryTime - sw.pitchClockEffect`). A player could toggle the clock to change the margin without understanding the sliders. Consider: require at least one SLIDER change (not just clock toggle) to count toward the challenge.

**Risk 7: brainExplored.challengeDone persists forever**

Once `challengeDone` is set, it never resets. This is correct for IQ (you earned it), but means there is no replay incentive. Consider adding a `challengeBest` field (e.g., `re24.challengeBest = 5` for runs scored) so players can beat their own record even after the IQ reward is claimed. This is a nice-to-have, not a blocker.

**Risk 8: Tree SVG edge overlap at deep prereq chains**

Some concepts have 2 prereqs from different depths (e.g., `baserunning-rates` prereqs `tag-up` at depth 1 and `steal-breakeven` at depth 0). Edges crossing layers will overlap other nodes. Mitigation: draw edges with `pointer-events: none` and low opacity (0.2-0.3). At 7-12 nodes per domain, the crossing count is low enough that this is acceptable without a proper edge-routing algorithm.

---

### Quick Reference: Implementation Order

1. **NumberAnim component** (~30 lines) -- standalone, no dependencies, used by all other work
2. **Challenge detection + IQ rewards** (~50 lines across 3 tabs) -- uses existing state, straightforward conditionals
3. **Domain tree SVG** (~150 lines) -- most complex, should come last when the other two are stable

This order minimizes risk: NumberAnim is self-contained and immediately testable. Challenges are simple conditionals in existing code paths. The tree is the most likely to need iteration.

---

## Comprehensive TPA Audit Checklist (Final)

**Date:** 2026-03-24 | **Auditor:** Thought Partner Agent | **Scope:** Cross-reference ALL TPA recommendations against current codebase state

### Legend
- [x] = DONE and verified in code
- [ ] = NOT DONE -- needs implementation
- [~] = PARTIALLY DONE -- details on what is missing

---

### A. Critical Fixes (from Baseball Brain Build Review TPA)

- [x] **A-HOOKS: Hoist all Brain useState to top level** (DONE - lines 99-137 of `src/08_app.js`, all 37 Brain useState calls are unconditional at top of App())
- [x] **A-SORT: reRunners.sort() mutation fix** (DONE - line 3241 uses `[...reRunners].sort()`)
- [x] **A-IQ-CALC: BrainIQ calculation is no longer circular** (DONE - line 3095: `tabsVisited*5 + interactionPts + challengePts`, proper scoring function)
- [x] **A-PRESTIGE: brainExplored survives prestige reset** (DONE - prestige reset at line 2423 only clears specific fields; brainExplored persists by default)
- [x] **A1: First-visit onboarding overlay** (DONE - lines 3153-3160, checks `_onboarded` in brainExplored, "Welcome to Baseball Brain!" with "Got it!" dismiss)
- [x] **A2: Baseball IQ display in Brain header** (DONE - lines 3168-3171, shows raw IQ number + title + color-coded)
- [x] **A3: Enlarged tap targets on RE24 diamond** (DONE - line 3217 uses 220x170 SVG, line 3229 adds invisible 36x36 hit area rects around bases)
- [x] **A4: Tab strip scroll indicator fade** (DONE - line 3175 uses `maskImage: linear-gradient` for fade)
- [x] **A8: Empty-state prompt for RE24** (DONE - line 3213, shows "Tap a base to put a runner on!" when no runners and no last action)

### B. Engagement Features (from Gamification Review TPA)

- [x] **B1: Build Your Inning sandbox** (DONE - lines 3242-3251, `inningMode`/`inningRuns`/`inningActions` state, tracks runs through 3 outs, inning-over logic at line 3195-3204)
- [x] **B2: NumberAnim component** (DONE - `src/07_components.js` lines 2-22, uses requestAnimationFrame + easeOutCubic, self-tracking via `prevVal` ref, proper cleanup)
- [x] **B2-USAGE-RE24: NumberAnim on RE24 display** (DONE - line 3255 uses `<NumberAnim value={re24} decimals={2}/>`)
- [x] **B2-USAGE-WP: NumberAnim on Win Probability** (DONE - line 3948 uses `<NumberAnim value={Math.round(curWP*100)} decimals={0} suffix="%"/>`)
- [x] **B2-USAGE-MATCHUP: NumberAnim on Matchup Analyzer** (DONE - line 4052 uses `<NumberAnim value={Math.round(md.adjustedBA*1000)} decimals={0}/>`)
- [ ] **B2-USAGE-PITCHCOUNT: NumberAnim on Pitch Count display** (NOT DONE - line 3889 still uses plain text `{pcCount}` in the speedometer SVG, not NumberAnim)
- [x] **B3: Cross-tab navigation helper** (DONE - `navigateBrain()` at line 3110, handles runners, count, inning, pitcher/batter, park, preset state pre-loading)
- [x] **B3-LINKS: Cross-tab link buttons on tabs** (DONE - at least 4 links found: RE24->Steal at line 3328, RE24->Counts at line 3331, Steal->Counts at line 3626, Steal->RE24 at line 3730)
- [~] **B3-BIDIRECTIONAL: Cross-links on ALL tabs** (PARTIAL - RE24, Steal, and Pitch Lab tabs have cross-links. Counts, WinProb, Matchup, Park, Defense, History, Concepts tabs do NOT have outbound navigateBrain links visible in the code)
- [x] **B4: "Test Yourself" buttons** (DONE - `launchQuizFromBrain()` at line 3128, buttons on RE24 (3336), Steal (3627, 3731), PitchCount (3928), WinProb (4017). Finds scenarios by conceptTag or concept string match)
- [ ] **B4-GRACEFUL: "Test Yourself" with 0 matching scenarios** (NOT DONE - `launchQuizFromBrain` at line 3129-3130 calls `findScenarioForConcept` which returns null when no match. If null, the function does nothing silently -- no "No challenges available yet" message to the user)
- [x] **B5: Daily Brain Facts on home screen** (DONE - `BRAIN_FACTS` array at line 1980, daily rotation at line 2002-2003, "Did you know?" display on home screen at line 2007)
- [x] **B6: Tap sound on Brain interactions** (DONE - `snd.play('tap')` called throughout Brain tabs, e.g., line 3193 on What-If actions, line 3227 on base toggles, line 3517 on pitch throw)

### C. Visual Polish (from Sprint E TPA)

- [x] **C1/E3: Pitch trajectory SVGs** (DONE - lines 3494-3521, 8 pitch paths defined in `paths` object, SVG with side view, "Throw!" button with animateMotion, dashed preview line)
- [x] **C2/E4: Steal race animation** (DONE - lines 3663-3695, two bars (throw vs runner) with animated width, "Race!" button, stealRacing state)
- [x] **C3/E5: Speedometer gauge** (DONE - lines 3874-3895, 5 arc segments, needle with angle math, young-friendly labels, slider input)
- [x] **C4: Tab mastery rings on tab strip** (DONE - lines 3177-3182, `ring` computed from visitCount + interactions, small colored dot indicator at top-right of tab)
- [x] **E6: Domain tree visualization** (DONE - lines 3779-3821, per-domain SVG tree with depth-based layout, prerequisite edge lines, mastery-colored nodes, click to select)
- [x] **E7: WP line graph across innings** (DONE - lines 3965-3989, polyline SVG with multi-line for selected diff + tied, data points with WP% labels, inning axis)
- [ ] **C4-RINGS-SVG: Tab mastery rings as SVG arcs** (NOT DONE - TPA recommended SVG arc rings around tab icons. Current implementation uses a small 8x8 colored dot at top-right corner, not a ring/arc. Functional but not the "gotta fill 'em all" visual the TPA described)
- [ ] **E3-TUNNEL: Pitch tunnel point visualization** (NOT DONE - TPA spec called for a "tunnel zone" rectangle at x=120-160 with text label showing where pitches look identical before diverging. The current pitch trajectory SVG shows individual pitch paths but no tunnel point overlay)
- [ ] **E3-SLOWMO: Slow-motion toggle for pitch throw** (NOT DONE - TPA spec called for a slow-motion toggle changing animation duration to 2.5s. Current "Throw!" button at line 3517 always uses 1.2s dur. No slow-motion option)

### D. Content & Gamification

- [x] **D-DOUBLE: "Double" What-If button** (DONE - line 3322, `doAction("Double",...)` with runner advancement logic)
- [x] **E8: Tab challenges (RE24, Pitch Lab, Steal)** (DONE - RE24 challenge at line 3198 "Score 3+ runs", Pitch Lab challenge at line 3532 with age-adjusted threshold (8 for vocabTier<4, 12 for vocabTier>=4), Steal challenge at line 3669 "margin <= 0.05s")
- [x] **E8-IQ: Challenge completion awards IQ** (DONE - each challenge sets `challengeDone=true` in brainExplored and recalculates IQ with `challengePts = completedCount * 15`)
- [ ] **D-ACHIEVEMENTS: Brain-specific achievements** (NOT DONE - ACHS array at `src/03_config.js` lines 20-36 has 15 general gameplay achievements. None are Brain-specific. TPA recommended 5-10 earned achievements: "Aha Moment", "The Numbers Don't Lie", "Pitch Caller", "What If?", "Brain Before Brawn", etc. None exist)
- [ ] **D-FAMOUS: Additional Famous Moments** (UNKNOWN - would need to check history tab content to verify if Buckner, Gibson HR, Bumgarner, Pine Tar Game, Jeter flip were added. The `selMoment` / `momentChoice` state exists and the history tab renders at line 4238)
- [ ] **D-SHARE: Share button for Brain facts/stats** (NOT DONE - no clipboard/share functionality found within Brain tabs. The player card generator exists at `src/03_config.js` line 58 but is for profile sharing, not Brain tab data)

### E. Edge Cases (from E11 TPA recommendations)

- [x] **E11-DEBOUNCE: IQ visit debounce (2s dwell)** (DONE - lines 3085-3098, `brainVisitTimer` ref with `setTimeout(2000)`, clears previous timer on rapid switches)
- [x] **E11-PRACTICE0: "Practice This" with 0 matching scenarios** (DONE - line 3850, the ternary checks `scens.length>0` and renders "No challenges available yet" span when no scenarios match)
- [ ] **E11-DEEPLINK-AGE: Deep links to age-locked tabs** (NOT DONE - `enrichFeedback` at line 1150 of `05_brain.js` can return `deepLink:{tab:"matchup",minAge:11}` for the matchup insight. The outcome screen at line 4695 DOES check `!ins.deepLink.minAge||ageNum>=ins.deepLink.minAge` before rendering the "Explore" button. HOWEVER, only the matchup insight at line 1150 has `minAge` in its deepLink. Other insights pointing to age-gated tabs (defense minAge:9) do NOT include `minAge` in their deepLink objects. For example, line 1155 links to `tab:"defense"` without minAge. A 7-year-old could see a defense deep link even though the defense tab has `minAge:9`)
- [ ] **E11-BRAINEXP-PASS: enrichFeedback receives brainExplored** (DONE - line 4700 passes 6 args: `enrichFeedback(sc,choice,sc.situation,ageNum,stats.masteryData,stats.brainExplored)`. The function signature at `05_brain.js` line 1050 accepts all 6. The `hasBrainExp` helper at line 1054 uses it for personalized text prefixes)
- [x] **E11-STALE-CLOSURE: Inning-over challenge detection uses correct run count** (DONE - line 3196 uses `inningRuns + runsScored` to compute `finalRuns` before the state update, avoiding stale closure)

### F. enrichFeedback Deep Links (from Gamification Review TPA)

- [x] **F1: deepLink objects generated by enrichFeedback** (DONE - `src/05_brain.js` lines 1063-1155, approximately 15 insight types include `deepLink:{tab,state}` objects)
- [x] **F2: Deep links rendered as tappable on outcome screen** (DONE - line 4695 of `src/08_app.js`, each insight with a deepLink gets an "Explore ->" button that calls `setBrainTab`, sets state, and navigates to Brain screen)
- [x] **F3: Deep links set pre-loaded state** (DONE - line 4695 handles `runners`, `outs`, `count`, `inning`, `diff` from the deepLink state object)
- [~] **F4: Brain exploration personalizes enrichFeedback text** (PARTIAL - line 1054 of `05_brain.js` defines `hasBrainExp(tab)` that checks `interactions >= 3`. Used on RE24 insight (line 1063: "Remember your RE24 Explorer experiments") and Steal insight (line 1078: "Like you saw in the Steal Calculator"). But only 2 of ~15 insight types have personalized prefixes. The TPA recommended ALL insight types reference exploration history when available)

### G. Game Film / Animation System

- [x] **G1: ANIM_DATA architecture** (DONE - `src/03_config.js` line 276, 11+ animation types defined as phase arrays)
- [x] **G2: AnimPhases renderer** (DONE - `src/07_components.js` line 574+, renders ANIM_DATA phases as SVG+SMIL)
- [x] **G3: Direction variants defined** (DONE - steal_2to3, steal_3toHome, advance_2to3, advance_3toHome, throwHome_OF, hit_CF, hit_LF, flyout_CF, flyout_LF, groundout_1B all defined in ANIM_DATA)
- [x] **G4: Direction variants computed at render** (DONE - lines 4533-4559 of `src/08_app.js`, computes variant based on runners + position (steal direction, hit/flyout field side, groundout side))
- [x] **G5: Field component accepts animVariant** (DONE - line 90 of `src/07_components.js`, Field prop destructuring includes `animVariant`)
- [x] **G6: Variant lookup chain in Field** (DONE - lines 466-470: tries `dirVariant` -> `pitchVariant` -> `dataKey` -> `altKey` -> falls through to inline SMIL)
- [x] **G7: Replay sounds** (DONE - batCrack, glovePop, slideDust, umpSafe, umpOut at lines 48-53 of `src/07_components.js`)
- [x] **G8: Per-phase pacing (fast-slow-fast)** (DONE - per TPA CI1 in shipped section, setup 2x, key moment 3.5x, resolution 2.5x)
- [x] **G9: Ghost/failure comparison** (DONE - per TPA AF2/CI2, GhostPhases renderer, "Compare" button)
- [x] **G10: Highlight reel** (DONE - stats.highlights tracked, replay at line 2120)
- [ ] **G11: Scenario-specific animVariant in scenario data** (NOT DONE - TPA recommended adding `animVariant` field to individual scenario objects in SCENARIOS data, e.g., `anim:"groundout", animVariant:"5-3"`. Currently, variants are computed at render time from runner/position context only, not from scenario metadata. No scenarios in SCENARIOS object have an explicit `animVariant` field beyond `pitchType`)
- [ ] **G12: prefers-reduced-motion support** (NOT DONE - TPA recommended showing static field when user has motion reduction enabled. No `matchMedia('(prefers-reduced-motion: reduce)')` check found anywhere)
- [ ] **G13: Aria labels for replay SVG** (NOT DONE - no `aria-label` or `role="img"` with descriptive text on Field SVG or animation elements)

### H. UX Issues Identified but NOT Addressed

- [~] **H1: Touch targets on RE24 outs buttons** (PARTIAL - line 3240: outs buttons are 28x28px, below 44px minimum. The BASE targets at line 3229 were enlarged with invisible 36x36 hit areas, but outs buttons were not enlarged)
- [ ] **H2: Color-blind accessibility on count grid** (NOT DONE - count cells use green/red/yellow color alone to distinguish hitter/pitcher/neutral. No text labels, icons, or patterns as secondary indicators. TPA flagged 8% of boys have color vision deficiency)
- [ ] **H3: Count grid cell size proportional to frequency** (NOT DONE - all 12 count cells are the same size. TPA recommended size-coding by frequency (0-0 occurs 100% vs 3-2 at ~15%))
- [ ] **H4: RE24 number context bar** (NOT DONE - TPA recommended a visual bar showing where the RE24 value falls in the 0.11 to 2.29 range. Currently just shows the number)
- [ ] **H5: Haptic feedback broadly** (PARTIAL - `navigator.vibrate?.(10)` found only on the Steal "Race!" button at line 3667. TPA recommended haptic on all base toggles, slider drags, and button taps across all Brain tabs. Only 1 of many interaction points has haptic)
- [ ] **H6: Perspective toggle visible at vocabTier 2** (NOT DONE - TPA recommended showing the hitter/pitcher perspective toggle for ages 9-10. Currently hidden for vocabTier < 3)
- [ ] **H7: Youth bunt disclaimer on RE24** (NOT DONE - TPA flagged that RE24 bunt data uses MLB numbers which are misleading for youth. No age-adjusted bunt cost display or disclaimer found in the RE24 tab)
- [ ] **H8: Youth steal break-even adjustment** (NOT DONE - TPA flagged that steal break-even uses MLB 72%. Youth should use 50% per `levelAdjustments`. No age-conditional break-even found in RE24 or Steal tabs)
- [ ] **H9: "Run on contact with 2 outs" highlight** (NOT DONE - TPA recommended auto-highlighting this teaching point when outs=2. Not implemented)

### I. Shared Components / Patterns

- [x] **P1: NumberAnim component** (DONE - `src/07_components.js` lines 2-22)
- [ ] **P2: BrainSlider component** (NOT DONE - steal sliders, pitch count slider, etc. are all one-off HTML range inputs. No shared styled slider component)
- [ ] **P3: BrainDetailPanel component** (NOT DONE - each tab hand-builds its own detail panels inline)
- [ ] **P4: BrainStatBox component** (NOT DONE - stat boxes are hand-built inline per tab, not extracted)
- [ ] **P5: AgeAdaptiveText helper** (NOT DONE - dozens of inline ternaries for `isYoung?X:Y` throughout Brain tabs. No shared helper function)
- [ ] **P6: BrainTeachingMoment component** (NOT DONE - no shared teaching moment component)
- [ ] **P7: Top-level Brain state management** (DONE - all Brain state is hoisted to App() top level at lines 99-137. However, not using a reducer pattern despite 37+ useState calls)

### J. IQ / Gamification Display

- [x] **J1: IQ score displayed in Brain header** (DONE - line 3169, shows raw number)
- [x] **J2: IQ title displayed** (DONE - line 3170, shows title like "Dugout Analyst")
- [ ] **J3: IQ shows title + progress bar, hides raw number** (NOT DONE - TPA recommended showing ONLY the title + progress bar to next title, hiding the raw number to avoid "low number = dumb" association. Currently shows the raw IQ number prominently at fontSize 18, with the title as tiny 7px text below it. The TPA recommended the OPPOSITE emphasis)
- [ ] **J4: IQ on home screen** (NOT DONE - IQ is only visible inside the Brain section header. TPA recommended showing IQ title on the home screen to drive Brain visits)
- [ ] **J5: IQ non-linear scaling for early progress** (NOT DONE - TPA recommended first 60 IQ points come fast. Current formula is linear: `tabs*5 + interactions(capped 10/tab) + challenges*15`. A kid visiting 2 tabs with 3 interactions each gets 10+6=16 IQ. Visiting all 11 tabs gets 55 IQ just from visits. The early progression feels reasonable but there is no explicit non-linear curve)
- [ ] **J6: Age-adaptive gamification (6-8 sees stars, no IQ)** (NOT DONE - TPA recommended hiding IQ for ages 6-8, showing only stars. Currently all ages see the same IQ display)

### K. Missing Features from Plan (Not Built)

- [ ] **K1: "Build Your Inning" sandbox comparison mode** (NOT DONE - plan specified side-by-side steal outcome comparison. Not implemented)
- [ ] **K2: Count Journey animated mode** (NOT DONE - plan called for animated at-bat walkthrough)
- [ ] **K3: Count Heat Map** (NOT DONE - plan described color-gradient heat map showing BA across all counts)
- [ ] **K4: RE24 full heatmap for vocabTier >= 4** (NOT DONE - TPA recommended heatmap with cell background gradients for the full RE24 matrix table. Not implemented)
- [ ] **K5: Coach Film Voice Lines** (NOT DONE - planned timed annotations like "Watch the runner's jump..." during game film. Not implemented)
- [ ] **K6: Play-by-Play Text Labels during replay** (NOT DONE - planned timed text annotations during animation replay. Not implemented)
- [ ] **K7: Speed Control Slider for replay** (NOT DONE - planned 0.5x/1x/2x speed control. Currently only has tap-to-pause)
- [ ] **K8: Fielder Repositioning Pre-Animation** (NOT DONE - planned 0.5s pre-animation showing fielders shifting to correct positions)
- [ ] **K9: "What Happened Next" continuation** (NOT DONE - planned downstream impact display after replay)

### Summary Statistics

**DONE:** 38 items
**PARTIALLY DONE:** 5 items
**NOT DONE:** 35 items

**Highest priority NOT DONE items (by impact):**
1. **Brain-specific achievements** (D-ACHIEVEMENTS) -- drives long-term engagement, ~35 lines
2. **IQ title emphasis over raw number** (J3) -- prevents "low = dumb" psychology, ~5 lines
3. **Deep link minAge on ALL age-gated tabs** (E11-DEEPLINK-AGE) -- bug for young players, ~10 lines
4. **Cross-tab links on ALL tabs** (B3-BIDIRECTIONAL) -- currently only 3 of 11 tabs have outbound links
5. **Haptic feedback broadly** (H5) -- currently only on 1 button, ~10 lines to add everywhere
6. **Youth bunt/steal disclaimers** (H7, H8) -- misleading MLB data shown to kids
7. **Tab mastery rings as actual rings** (C4-RINGS-SVG) -- dots are functional but less motivating than the "fill the ring" visual
8. **Pitch tunnel point visualization** (E3-TUNNEL) -- key teaching concept, ~10 lines
9. **Color-blind accessibility** (H2) -- 8% of male users affected
10. **NumberAnim on Pitch Count** (B2-USAGE-PITCHCOUNT) -- consistency, ~1 line

---

## AI Generation Audit -- TPA Deep Analysis (2026-03-25)

### Finding 1: Score Convention is a 4-Way Contradiction (CRITICAL)

The score array convention is contradicted in at least 4 different places across the codebase. This is the most dangerous inconsistency found.

**Handcrafted scenarios use `score=[HOME, AWAY]`:**
- Scenario b1: "down 2-1" in Bot 7, score:[1,2] -- home=1, away=2, home is losing. Correct for [HOME,AWAY].
- Scenario p55: "up 6-4" in Bot 8 (pitcher=away), score:[4,6] -- home=4, away=6, away pitcher's team leads. Correct for [HOME,AWAY].

**Client-side AI prompts say `score=[HOME, AWAY]`:**
- Line 10577: `score=[HOME, AWAY]. Home team bats in "Bot" half`
- Line 11527: same
- Line 11549: `score=[HOME,AWAY]`

**Worker multi-agent pipeline says `score=[AWAY, HOME]`:**
- Line 3308 (PLANNER_SYSTEM): `score as [away, home]`
- Line 3331-3333 (GENERATOR_SYSTEM): Confused self-correction: "score[0]=away, score[1]=home"
- Line 3365 (CRITIC_SYSTEM): `score[0]=away, score[1]=home`
- Line 3447 (REWRITER_SYSTEM): `score[0]=away, score[1]=home`

**Worker batch/variant endpoints say `score=[HOME, AWAY]`:**
- Line 2512: `score=[HOME,AWAY]`
- Line 2653: `score=[HOME,AWAY]`

**Client-side QUALITY_FIREWALL has BOTH conventions:**
- Line 8741 (scoreInningPerspective): `const [away, home] = sit.score` -- treats as [AWAY,HOME]
- Line 9146 (gradeScenario description check): `const [home, away] = s.score` -- treats as [HOME,AWAY]

**Severity: CRITICAL.** The multi-agent pipeline (Claude Opus) generates scenarios with [AWAY,HOME], the handcrafted corpus uses [HOME,AWAY], and the QUALITY_FIREWALL destructures the score both ways in different functions. This means:
1. AI-generated scenarios from the multi-agent pipeline will have INVERTED scores compared to handcrafted ones.
2. The Critic checks the score against [AWAY,HOME] and may PASS scenarios that are actually wrong per the handcrafted convention.
3. The client-side QUALITY_FIREWALL scoreInningPerspective check destructures as [AWAY,HOME], so it will incorrectly validate multi-agent scenarios and incorrectly reject handcrafted ones (or vice versa, depending on which is "right").
4. The `gradeScenario` function uses the OPPOSITE convention from `scoreInningPerspective`, so these two checks can never agree.

**Recommendation:** The handcrafted scenarios and the majority of client-side code say [HOME,AWAY]. The multi-agent pipeline in the worker is the outlier. Fix the worker pipeline prompts to say [HOME,AWAY] and fix the QUALITY_FIREWALL scoreInningPerspective to use `const [home, away] = sit.score`.

---

### Finding 2: GENERATOR_SYSTEM Has a Confused Self-Correction (HIGH)

Worker line 3331-3333 shows the Generator prompt literally arguing with itself:
```
"Bot 7, score [3, 5]" means AWAY leads 3-5... wait, no: score = [away, home], so away=3, home=5, home leads.
Actually: score[0] = away, score[1] = home. Bot = home bats. Top = away bats.
```

This "wait, no... Actually:" pattern is being sent directly to the LLM. An LLM seeing "AWAY leads... wait, no... home leads" has conflicting signals. This self-correction pattern likely confuses the model rather than clarifying. The prompt should state the convention once, clearly, without showing the thought process of someone figuring it out.

**Severity: HIGH.** This is in the system prompt that Claude Opus reads for every multi-agent generation.

---

### Finding 3: A/B Test `agent_pipeline` Stuck at 100% Agent (MEDIUM)

`AB_TESTS.agent_pipeline` (line 9441-9446) has a single variant with weight 100:
```
{ id: "agent", weight: 100, config: { useAgent: true } }
```

This means:
- There is no control group. No data can be collected on whether the agent pipeline is better than standard.
- The A/B test framework allocates the user to a variant using weighted random selection, but with only one variant at 100%, every user gets the agent pipeline.
- This is technically correct if the agent pipeline is proven better, but it defeats the purpose of having an A/B test entry for it. Either remove the A/B test or add a control variant.

**Severity: MEDIUM.** No data collection impact, but dead code obscures intent.

---

### Finding 4: OPTION_ARCHETYPES Coverage Analysis (LOW)

Counted 72+ archetypes across positions. Distribution by position:
- **pitcher**: 8 archetypes (first-pitch-strike, count-leverage, pickoff-mechanics, cutoff-roles, bunt-defense, pitch-calling, pitch-count-awareness, holding-runners, pitching-from-stretch, balk-rule) -- well covered
- **catcher**: 9 archetypes (catcher-framing, steal-breakeven, first-third, cutoff-roles, blocking, throw-to-base, pitchout, pitch-calling, wild-pitch-passed-ball) -- well covered
- **batter**: 7 archetypes (two-strike-approach, count-leverage, situational-hitting, hit-and-run, sacrifice-bunt, first-pitch-strike, hitters-count) -- well covered
- **baserunner**: 8 archetypes (tag-up, force-vs-tag, secondary-lead, steal-breakeven, steal-window, lead-distance, first-to-third, tag-up-rules, pickoff-mechanics, squeeze-play) -- well covered
- **manager**: 7 archetypes (times-through-order, cutoff-roles, bunt-defense, pitching-change, intentional-walk, defensive-positioning, pinch-hitter, steal-sign, mound-visit) -- well covered
- **shortstop**: 5 archetypes -- well covered
- **secondBase**: 4 archetypes -- adequate
- **thirdBase**: 4 archetypes -- adequate
- **firstBase**: 3 archetypes -- slightly thin
- **leftField**: 3 archetypes -- slightly thin
- **rightField**: 3 archetypes -- slightly thin
- **centerField**: 3 archetypes -- slightly thin

**Gaps:** No archetypes exist for the `famous`, `rules`, or `counts` position categories. These 3 categories have 89 combined scenarios (21+40+28) but zero archetypes to guide AI generation. If AI generation is ever requested for these positions, the archetype lookup returns `undefined` and the OPTION BLUEPRINT section is silently omitted.

**Severity: LOW.** Outfield and corner infield positions have fewer archetypes but this matches their smaller scenario corpus. The `famous/rules/counts` gap matters only if AI scenarios are generated for those categories.

---

### Finding 5: Few-Shot Examples Are High Quality But Have One Issue (LOW)

The `AI_FEW_SHOT_EXAMPLES` at line 5807 contain 3 pitcher, 3 fielder, 3 batter, 4 baserunner, and 4 manager examples. Quality is generally excellent:
- All use 2nd person correctly
- Explanations are specific and teach genuine concepts
- Rate distributions follow the guidelines (best >= 75, one yellow 40-65)
- All include `explSimple` equivalent quality

**Issue found:** The fielder few-shot example at line 5814 ("Gap Ball Communication") has `count:"-"` which is a placeholder that the QUALITY_FIREWALL explicitly rejects at line 8730 (`if (count === "-") return "Count placeholder"`). The few-shot examples are teaching the AI that `count:"-"` is acceptable, but the firewall will reject scenarios that use it. This creates a "do as I say, not as I do" conflict.

Two other fielder and all manager few-shot examples also use `count:"-"`. This is actually reasonable for fielder/manager scenarios where the count is irrelevant to the decision, but it conflicts with the firewall check.

**Severity: LOW.** The few-shot examples using `count:"-"` may cause AI to generate scenarios that the firewall then rejects, wasting an API call.

---

### Finding 6: Self-Audit Data Flow is Working But Has Gaps (MEDIUM)

The self-audit system (lines 12100-12150) does the following:
1. After generating an AI scenario, sends it to xAI for a quick 1-5 quality rating across 4 dimensions (realistic, options, coach, tone)
2. Logs the score to console
3. Fires a POST to `/analytics/ai-audit` on the worker (fire-and-forget)
4. If score < 3, rejects the scenario and retries

**The data IS going somewhere useful:** The worker has an `/analytics/ai-audit` endpoint that stores results, and the client fetches weak spots from it at line 11223-11275 to inject into future AI prompts. This creates a feedback loop.

**Gaps found:**
- The self-audit uses the xAI standard API for grading, NOT the multi-agent pipeline. So when the primary Claude pipeline generates a scenario, it gets graded by xAI Grok. This cross-model grading may miss model-specific quality issues.
- The 4 grading dimensions (realistic, options, coach, tone) do NOT match the multi-agent pipeline's 6 dimensions (factualAccuracy, explanationStrength, ageAppropriateness, educationalValue, varietyDistinctness, conceptClarity). Quality signals are fragmented across incompatible rubrics.
- The self-audit has a 5-second timeout (line 12136). If it times out, no quality data is recorded. In high-latency conditions, many scenarios may ship without any quality score.

**Severity: MEDIUM.** The feedback loop exists but the dimension mismatch means weak spots discovered by the self-audit may not correspond to dimensions the multi-agent Critic evaluates.

---

### Finding 7: Local Pool Has No Age-Based Eviction (LOW)

The `saveToLocalPool` function (line 12766) stores scenarios with a `savedAt` timestamp and caps at 75 entries. Eviction is purely FIFO (`pool.shift()`). However:

- There is no quality-based eviction. A scenario with `auditScore: 2` is treated the same as `auditScore: 5`.
- There is no staleness eviction by age. A scenario saved 30 days ago is consumed just as readily as one from 5 minutes ago (unlike the prefetch cache which has a 5-minute staleness window at line 12975).
- The quality field is stored (`quality: scenario.qualityGrade || 0`) but never read during consumption.
- `consumeFromLocalPool` filters by position and difficulty but never by quality or age.

**Severity: LOW.** The pool max of 75 is small enough that old scenarios cycle out naturally. But if a player doesn't use AI scenarios for weeks, the pool contains stale content that may reference outdated rules or have lower quality than current generation.

---

### Finding 8: Prefetch Race Condition -- In-Flight Promise Handling (MEDIUM)

At line 15041-15049, when no cached scenario is available, the code checks for an in-flight prefetch promise:
```
const inFlight = aiCacheRef.current?.inFlightPromise?.[p]
if (inFlight) {
  const prefetchResult = await Promise.race([
    inFlight,
    new Promise((_, rej) => setTimeout(() => rej(new Error("prefetch-wait-timeout")), 30000))
  ])
```

**Race condition scenario:**
1. Player clicks "AI Coach's Challenge"
2. No cached scenario exists, but prefetch is in-flight
3. Code awaits the in-flight promise with 30s timeout
4. While waiting, the player switches position (which calls `cancelPrefetchExcept`)
5. The AbortController aborts the in-flight fetch
6. But the Promise.race doesn't check if the abort happened -- it just catches the error
7. The error path falls through to live generation for the NEW position, which is correct

Actually, looking more carefully, the abort propagates correctly because the `generateAIScenario` call that created the in-flight promise respects the AbortController signal. When aborted, the promise rejects, which the Promise.race catches, and the code falls through to live generation. This is handled correctly.

**However**, there is a subtle issue: `_prefetchControllers` is module-level (line 12885), while `aiCacheRef` is a React ref (line 14221). If multiple rapid position switches happen, the `cancelPrefetchExcept` function cleans up `_prefetchControllers` but the `inFlightPromise` reference on `aiCacheRef` may still point to the old (now-aborted) promise. The next read of `aiCacheRef.current?.inFlightPromise?.[p]` could get a stale promise for a different position. This is mitigated by the position key `[p]`, but if the player switches back to the original position before the abort propagates, they could await a promise that is in the process of being aborted.

**Severity: MEDIUM.** Edge case that requires rapid position switching. Impact is a delayed/failed AI scenario, not data corruption.

---

### Finding 9: POS_ACTIONS Defined Twice in Separate Pipelines (LOW)

The `POS_ACTIONS` object mapping position names to allowed actions is defined independently in two places:
- Line 10587-10600 (agent pipeline prompt construction)
- Line 11551-11564 (standard pipeline prompt construction)

These are identical currently, but if one is updated and the other is not, the pipelines would disagree on what actions a position can take. This should be a single shared constant.

**Severity: LOW.** Copy-paste maintenance risk.

---

### Finding 10: No TODO/FIXME/HACK/XXX Comments in AI Code (POSITIVE)

Searched both `index.jsx` and `worker/index.js` for TODO/FIXME/HACK/XXX comments. Found zero in the worker and only one trivial match in `index.jsx` (a promo code URL check comment). The AI generation code is clean of technical debt markers.

---

### Finding 11: REAL_GAME_SITUATIONS Coverage (LOW)

The `REAL_GAME_SITUATIONS` object (line 6717) provides position-specific real-game scenarios to inject into AI prompts. Coverage:
- pitcher: 8 situations
- catcher: 6 situations
- firstBase: 4 situations
- secondBase: 3 situations
- shortstop: 3 situations
- thirdBase: 3 situations
- leftField: 3 situations
- centerField: 3 situations
- rightField: 3 situations
- batter: 5 situations
- baserunner: 8 situations (includes 3 that correct specific AI failure patterns)
- manager: 7 situations (including banned-shift and bullpen-usage corrections)

**Missing positions:** `famous`, `rules`, `counts` have no real-game situations. The code at line 11289 falls back using a key lookup which would return empty arrays for these positions. The baserunner section was clearly expanded to fix identified AI failure patterns (lines 6785-6787), which is a good practice.

---

### Finding 12: Circuit Breaker Uses sessionStorage, Not localStorage (MEDIUM)

The circuit breaker (line 12742-12763) uses `sessionStorage`, not `localStorage`. This means:
- Circuit breaker state resets when the browser tab is closed and reopened
- If the AI service is down, closing and reopening the tab resets the breaker, allowing immediate retries against a still-broken service
- However, the comment at line 14282 says "Clear stale circuit breakers from previous session" and the code iterates sessionStorage keys -- this clearing code is unnecessary since sessionStorage already clears on tab close

The main agent's task #10 is specifically about moving the circuit breaker to localStorage, which aligns with this finding. The current sessionStorage approach means a user who encounters repeated AI failures can simply close and reopen the tab to bypass the protection.

**Severity: MEDIUM.** The breaker should persist across sessions to properly protect against extended outages.

---

### Summary of Findings by Severity

| Severity | Count | Key Items |
|----------|-------|-----------|
| CRITICAL | 1 | Score convention 4-way contradiction (#1) |
| HIGH | 1 | Generator prompt self-correction confusion (#2) |
| MEDIUM | 4 | A/B test stuck (#3), Self-audit dimension mismatch (#6), Prefetch race condition (#8), Circuit breaker sessionStorage (#12) |
| LOW | 5 | Archetype gaps (#4), Few-shot count placeholder (#5), Pool eviction (#7), POS_ACTIONS duplication (#9), REAL_GAME_SITUATIONS gaps (#11) |
| POSITIVE | 1 | No TODO/FIXME debt (#10) |

**Top 3 actions to prioritize alongside the main audit:**
1. Unify score convention to [HOME,AWAY] everywhere -- fix worker pipeline prompts and QUALITY_FIREWALL destructuring
2. Remove the "wait, no... Actually:" self-correction from GENERATOR_SYSTEM -- state convention clearly once
3. Align self-audit dimensions with multi-agent Critic dimensions so the feedback loop targets the same quality axes

---

### AI Generation Audit — Live Console Log Analysis (2026-03-25)

**Context:** TPA analysis of console logs from live AI scenario generation session. Multi-agent pipeline completing in 29-38s, xAI fallback experiencing Connect Timeouts, several quality/grading anomalies observed.

---

#### Finding 13: Multi-Agent Scenarios Get `grade:0` Because They Skip `gradeScenario()` Entirely (HIGH)

**Root cause confirmed.** When the multi-agent pipeline succeeds, `generateAIScenario()` returns early at line 3014:
```
if (maResult?.scenario) {
  console.log("[BSM] Multi-agent pipeline succeeded")
  return maResult
}
```

This returns BEFORE the grading block at lines 3774-3795 where `gradeScenario()` runs and sets `scenario.qualityGrade`. The multi-agent scenario never receives a `qualityGrade` property.

**Downstream effects:**
1. `saveToLocalPool()` (line 4483) stores `quality: scenario.qualityGrade || 0` -- so multi-agent scenarios get `quality: 0` in the local pool.
2. `submitToServerPool()` is never called for multi-agent scenarios (only call site is line 3793, inside the standard pipeline grading block). So the "grade:0" log the user saw must be from a standard pipeline scenario that scored poorly, or from a local pool entry being reported.
3. The prompt-version analytics at line 3876 logs `generationGrade: scenario.qualityGrade || 0` -- but this is also standard-pipeline-only.

**The irony:** Multi-agent scenarios pass a 9.5/10 server-side critic with a 21-item checklist and 5-dimension rubric, yet they're treated as quality:0 in the local pool. They're higher quality than standard pipeline scenarios but ranked lowest.

**Fix:** After `generateWithMultiAgent` returns successfully, run `gradeScenario()` on the result and set `qualityGrade` before returning. Also call `submitToServerPool()` for multi-agent scenarios -- they should be the BEST candidates for the community pool. Something like:
```js
if (maResult?.scenario) {
  const grade = gradeScenario(maResult.scenario, position, targetConcept)
  maResult.scenario.qualityGrade = grade.score
  if (grade.score >= 65) submitToServerPool(maResult.scenario, position, grade.score/10, 0, grade.score)
  return maResult
}
```

---

#### Finding 14: Causal Reasoning Regex Is Too Narrow for AI-Written Explanations (MEDIUM)

The `allExplanationsCausal` check at line 429 uses this regex:
```
/\b(because|so that|this means|the reason|which means|the key is|the advantage|this ensures|this prevents|this is why|if you|that way|otherwise|since|after all|remember|given that)\b/i
```

Claude Opus writes sophisticated explanations that often use causal reasoning without these exact trigger phrases. Common causal patterns that would PASS a human reader but FAIL this regex:

- **Conditional causation:** "With runners in scoring position, the priority shifts to..." / "When the count is full, protecting the plate..."
- **Consequence framing:** "That leaves the runner stranded" / "which opens up the double play" / "putting pressure on the defense"
- **Implicit because:** "The infield is playing in, making the bunt less effective" (the "making" is causal)
- **Comparative reasoning:** "Unlike a force play, this requires a tag" / "Rather than risk the throw, the safer play is..."
- **Coach-voice causation:** "You want to..." / "The smart play here is..." / "What matters most is..."
- **Result language:** "That gives you..." / "which leads to..." / "resulting in..." / "so the runner..."

The regex also misses these common causal connectors: `therefore`, `as a result`, `consequently`, `that's why`, `the risk is`, `by doing this`, `to prevent`, `to avoid`, `to protect`, `which forces`, `making it`, `allowing`, `enabling`, `causing`.

**The 60-word escape hatch partially saves this:** Explanations over 60 words are exempt from the check (line 430: `(e||"").split(/\s+/).length < 60`). But Claude sometimes writes tight 40-55 word explanations that are pedagogically excellent yet fail the regex.

**Why this matters for multi-agent scenarios specifically:** The server-side Critic grades on a holistic rubric (explanationQuality is one of 5 dimensions). The client-side firewall then re-checks with this narrow regex. A scenario can score 9.8/10 on the server and still trigger "4 of 4 explanations lack causal reasoning" on the client. The warning is a Tier 2 (non-blocking), so it doesn't reject the scenario, but it creates misleading noise in the logs.

**Suggested additions to the regex:**
```
/\b(because|so that|this means|the reason|which means|the key is|the advantage|this ensures|this prevents|this is why|if you|that way|otherwise|since|after all|remember|given that|therefore|as a result|that's why|the risk is|by doing this|to prevent|to avoid|which forces|making it|allowing you|what matters is|you want to)\b/i
```

---

#### Finding 15: xAI Connect Timeouts Are Wasting Budget With No Fast Escape (MEDIUM)

The xAI standard pipeline (fallback) hits "Connect Timeout" errors frequently. The current flow:
1. Multi-agent (Claude) fails or is skipped
2. Agent pipeline (xAI) attempted if budget allows (40s minimum)
3. Standard pipeline (xAI) attempted with remaining budget (25s minimum)

The worker proxy at line 1349 sets a 90-second timeout for xAI calls. But "Connect Timeout" errors are fundamentally different from slow responses -- they indicate the xAI API endpoint itself is unreachable or overloaded. The current code treats all xAI failures the same.

**Key observations:**
- When multi-agent times out (>50s), the code already skips the agent pipeline (line 3059-3061). Good.
- But when multi-agent FAILS (not timeout), both xAI pipelines are attempted even if the failure was fast (e.g., a 502 from Cloudflare). This means two more xAI calls that will also likely fail.
- There's no "xAI is unreachable" circuit breaker at the worker level. The client-side circuit breaker tracks per-position failures, not per-backend failures.
- Connect Timeouts typically fail in 10-30 seconds, burning budget before the client-side timeout kicks in.

**Mitigation ideas:**
1. **Worker-level xAI health check:** Cache the last xAI response status in a Durable Object or KV. If the last 3 xAI calls failed with connect/timeout errors in the past 5 minutes, return a fast 503 with `"type": "xai_unavailable"` so the client can skip immediately to handcrafted fallback.
2. **Client-side backend awareness:** When the standard pipeline gets a connect timeout error, set a session flag `_xaiDown = true` with a 5-minute TTL. On subsequent calls, skip xAI pipelines entirely and go straight to multi-agent only (with handcrafted fallback).
3. **Shorter connect timeout in worker:** The 90s timeout at line 1349 is for the full request. Add a separate connect timeout of 10-15 seconds -- if the TCP connection isn't established in 15s, fail fast. (Cloudflare Workers don't natively support connect-vs-read timeouts, but the worker could use a AbortController race with a shorter timer for the initial connection phase.)

---

#### Finding 16: 500/504 Worker Errors Suggest Cloudflare CPU Limits (LOW)

The 500/504 errors from the worker are likely Cloudflare Worker CPU time limits. Workers have a 30ms CPU time limit on the free plan, 50ms on paid. The multi-agent pipeline endpoint (`/v1/multi-agent`) does significant work:
- RAG vector search
- 4-stage LLM pipeline (Planner, Generator, Critic, Rewriter)
- D1 database reads for calibration, patches, feedback patterns

If any of these stages involve CPU-intensive JSON parsing or string manipulation, the worker could hit the CPU limit. The 504s specifically suggest the worker timed out (not the upstream API).

**Diagnostic step:** Check `wrangler tail` logs for `exceeded CPU time limit` errors. If confirmed, consider:
- Moving CPU-heavy work (like prompt construction) to the client
- Using Cloudflare Workers Unbound (no CPU limit, pay per GB-ms) for the multi-agent endpoint
- Splitting the multi-agent pipeline into separate worker invocations chained via Durable Objects

---

#### Finding 17: Pool Submission Quality Gate Has a Scoring Inconsistency (LOW)

At line 3793, pool submission passes `grade.score / 10` as `qualityScore` and `grade.score` as `generationGrade`:
```js
submitToServerPool(scenario, position, grade.score / 10, scenario.auditScore || 0, grade.score)
```

Inside `submitToServerPool` at line 4540, the client-side gate checks:
```js
const poolGate = UNDERSERVED_POSITIONS.includes(position) ? 6.5 : 7.5
if ((qualityScore || 0) < poolGate) { ... }
```

So `qualityScore` is on a 0-10 scale (grade.score/10) and the gate is 6.5 or 7.5. That means a grade of 65/100 passes for underserved positions, 75/100 for others.

But the worker-side `scenario-pool/submit` endpoint at line 1882 does:
```js
const newQuality = quality_score || generation_grade || 7.0
```

This means if `quality_score` (0-10 scale) is falsy (e.g., 0), it falls back to `generation_grade` (0-100 scale), mixing scales. A scenario with `quality_score: 0, generation_grade: 80` would get `newQuality: 80` on a 0-10 scale, which is nonsensical.

This probably doesn't trigger in practice (the client gate rejects quality_score < 6.5), but it's a latent bug if the gate logic ever changes.

---

#### Summary of Live Log Findings

| # | Finding | Severity | Fix Effort |
|---|---------|----------|------------|
| 13 | Multi-agent scenarios get grade:0 (skip gradeScenario) | HIGH | Small -- add 4 lines after multi-agent return |
| 14 | Causal reasoning regex too narrow for AI writing style | MEDIUM | Small -- expand regex with 12 more phrases |
| 15 | xAI Connect Timeouts waste budget, no fast escape | MEDIUM | Medium -- add xAI health tracking |
| 16 | 500/504 errors suggest worker CPU limits | LOW | Medium -- needs wrangler tail diagnosis |
| 17 | Pool submission quality_score vs generation_grade scale mismatch | LOW | Small -- normalize scales in worker |

**Priority recommendation:** Fix #13 first -- it's 4 lines of code and immediately improves pool quality by letting multi-agent scenarios (the best ones) contribute to the community pool instead of being stored as quality:0.

---

### AI Generation Audit — Blind Spot Analysis for 3-Fix Sprint (2026-03-26)

**Context:** Main agent is implementing 3 fixes: (1) multi-agent scenarios now submit to server pool, (2) xAI health tracking with 5min cooldown after connect timeout, (3) worker pool submission scale mismatch fix. This analysis looks for second-order effects and adjacent blind spots.

#### Fix 1: Multi-Agent Pool Submission — Hidden Issues

**Scale mismatch in the submission call itself (line 3020):**
The multi-agent path calls `submitToServerPool(scenario, position, critiqueScore, 0, maResult.scenario.qualityGrade)` where `critiqueScore` is the raw 10-point critique score (e.g., 9.5) passed as the `qualityScore` parameter. Inside `submitToServerPool`, the client-side gate at line 4548 checks `qualityScore >= 7.5` (or 6.5 for underserved). A critiqueScore of 9.5 passes this gate correctly. But the worker receives this as `quality_score: 9.5` on a 0-10 scale, while standard pipeline scenarios send `grade.score / 10` (also 0-10), so the scales actually align. **No bug here — but document this explicitly** because it's confusing that qualityGrade is 0-100 but quality_score is 0-10.

**Dual write to local pool + server pool:**
When a multi-agent scenario succeeds, it returns at line 3028 (`return maResult`). The caller in the main App component will likely also save the scenario to local pool via `saveToLocalPool()` during prefetch eviction (line 4608). Meanwhile `submitToServerPool` fires in the background. This creates a scenario that exists in both localStorage AND D1. There is no dedup issue per se — the local pool deduplicates by `title + position` (line 4481), and the server pool deduplicates by content hash (line 1860). But if the same scenario is later fetched FROM the server pool, the player could see a scenario they already played (since it was also in their local pool). **Mitigation exists:** the `consumeFromLocalPool` function uses `excludeIds` but the server-fetched scenario gets a `pool_XXXX` ID while the local copy has the original `ma_XXXX` ID. This means the exclude filter won't match. **Recommendation:** Add title-based dedup to `fetchFromServerPool` exclude logic, or strip local pool entries when a matching scenario is consumed from server pool.

**No firewall/consistency check before pool submission:**
The multi-agent path at line 3019-3027 submits to the pool BEFORE the scenario is shuffled (shuffleAnswers happens inside generateWithMultiAgent at line 2665, before the return). The pool gets the shuffled version, which is correct. However, the multi-agent path does run client-side QUALITY_FIREWALL and CONSISTENCY_RULES (lines 2639-2662), and rejects the scenario if they fail (returns null). So only scenarios that pass both server-side critique AND client-side firewall reach the pool submission. **This is sound.**

**Rate limiting concern:**
`submitToServerPool` is fire-and-forget with a 10s timeout. If a player rapidly generates AI scenarios (e.g., clicking "AI Coach's Challenge" repeatedly), each successful multi-agent scenario triggers a pool submission. The worker has no rate limiting on `/scenario-pool/submit`. D1 free tier allows 100K writes/day, so this is fine at current scale. But if prefetch also submits (it currently doesn't for multi-agent since prefetch uses `skipAgent=true`), this could compound. **No action needed now.**

#### Fix 2: xAI Health Tracking — Design Questions

**Global vs per-position flag:**
The current implementation at line 37-40 uses a single global `_xaiDownUntil` timestamp. This is the right call. xAI connect timeouts are infrastructure-level (the api.x.ai endpoint is unreachable), not position-specific. A per-position flag would be wrong — if xAI is down for pitcher, it's down for catcher too.

**5-minute TTL — is it right?**
The 5-minute cooldown (line 38) is reasonable for a connect timeout, which typically indicates a transient infrastructure issue. Shorter (2min) risks repeatedly hitting a dead endpoint. Longer (15min) risks missing recovery. 5 minutes is a good middle ground. **One concern:** the `markXaiDown()` trigger at line 3917-3918 catches ALL errors matching `/connect.*timeout|ETIMEDOUT|ECONNREFUSED|fetch failed|network/i`. The regex `fetch failed` is very broad — it could match a worker-side fetch failure that isn't xAI-specific (e.g., if the worker's D1 database connection fails and returns a generic "fetch failed" error message). **Recommendation:** Make the regex more specific: `/connect.*timeout|ETIMEDOUT|ECONNREFUSED/i` without the broad `fetch failed|network` patterns, OR only trigger on errors from the xAI-specific code path (check `errType`).

**Where `isXaiDown()` is checked:**
Searched the codebase — `isXaiDown()` is defined but I see no call sites yet. The main agent presumably needs to add checks before the xAI agent pipeline (around line 3072) and before the standard pipeline xAI call (around line 3381). Missing either check defeats the purpose. The standard pipeline is the most important one to gate since it's the final fallback that wastes 25-85s on timeout.

**Interaction with multi-agent timeout flag:**
When multi-agent times out (`multiAgentTimedOut = true` at line 3030), the code already skips the xAI agent pipeline (line 3067-3068). But it does NOT skip the xAI standard pipeline — it falls through to line 3372+. If xAI is also down, this wastes another 25-85s before the budget runs out. The `isXaiDown()` check on the standard pipeline is critical to prevent this double-timeout scenario. The player would wait up to 90s + 85s = 175s total before getting a fallback handcrafted scenario. **This is the highest-impact use of the health flag.**

**No persistence across page loads:**
`_xaiDownUntil` is a module-level variable that resets on page refresh. This means if a player refreshes after a timeout, they'll hit xAI again immediately. For a single-page app this is fine (players rarely refresh mid-session), but worth noting. Could use sessionStorage for persistence if this becomes an issue.

#### Fix 3: Scale Mismatch — Remaining Inconsistencies

**The fix being applied (based on finding #17):**
The worker's semantic dedup at line 1882 compares `quality_score` (0-10) with `generation_grade` (0-100) via `quality_score || generation_grade || 7.0`. After the fix normalizes this, there's a downstream implication.

**Worker-side `qualityGate` comparison (line 1851-1853):**
The gate checks `quality_score >= 6.5` or `>= 7.5`. Multi-agent scenarios send `critiqueScore` (0-10 scale, e.g., 9.5) as `quality_score`. Standard pipeline sends `grade.score / 10` (0-10 scale, e.g., 7.5). Both are on the same 0-10 scale. **This is correct after the fix.**

**But `generation_grade` field is on a different scale:**
Multi-agent sends `generation_grade: maResult.scenario.qualityGrade` which is `critiqueScore * 10` (0-100 scale, e.g., 95). Standard pipeline sends `generation_grade: grade.score` (0-100 scale, e.g., 75). Both are 0-100. **This is consistent.**

**The `scenario_grades` table (line 1750-1758) uses yet another field:**
The analytics endpoint stores `quality_score` from grader details. The multi-agent pipeline reports grades to `/analytics/scenario-grade` only from the standard pipeline (line 3787-3792). Multi-agent scenarios skip this analytics call entirely — their grades only show up in the pool submission. **Observation:** After this fix, multi-agent scenarios will appear in the pool but NOT in `scenario_grades` analytics. This creates a blind spot in quality monitoring. Consider adding a grade report call in the multi-agent success path.

**`agentGrade` field overwrite in worker (line 3645):**
The worker stamps `scenario.agentGrade = Math.round(critique.overallScore * 10)` — this is a NUMBER (e.g., 95). But the client at line 2667 returns `{ agentGrade: data.critique }` where `data.critique` is an OBJECT with `{score, pass, rubric, ...}`. The client reads `maResult.agentGrade?.score` (line 3020) which gets the critique object's `score` field (0-10 scale). The worker's numeric `scenario.agentGrade` is on the scenario object itself, not in the wrapper. **No conflict, but confusing naming.** The scenario has `scenario.agentGrade = 95` (number) while the wrapper has `agentGrade: {score: 9.5, pass: true, ...}` (object). If any code reads `scenario.agentGrade` expecting a 0-10 score, it gets 0-100 instead.

#### Adjacent Blind Spots Found

**Blind Spot A: No `shuffleAnswers` before pool submission**
At line 3019-3027, the multi-agent scenario is submitted to the pool. But `shuffleAnswers` was already called at line 2665 inside `generateWithMultiAgent`. This means the pool stores the shuffled version. When another player fetches this scenario from the pool, there's no re-shuffle — they get the same answer ordering. Over time, answer position bias could emerge. The standard pipeline calls `shuffleAnswers` at line 3864, AFTER pool submission at line 3800-3802, so pool stores the pre-shuffle version. **Inconsistency:** multi-agent pool entries are shuffled, standard pipeline pool entries are not. If re-shuffle is added on fetch, multi-agent entries get double-shuffled (fine mathematically, but the `best` index tracking could break if not careful).

**Blind Spot B: Prefetch never uses multi-agent pipeline**
`prefetchAIScenario` at line 4597 always passes `skipAgent=true`, meaning prefetched scenarios use xAI standard pipeline only. When xAI is down (new health flag), prefetch silently fails. The prefetch should check `isXaiDown()` early and skip entirely rather than burning a fetch attempt and abort controller. Also: prefetched scenarios are lower quality (no agent grading, no multi-agent critique) but enter the same local pool as multi-agent scenarios. The `quality` field in local pool entries preserves this distinction, but `consumeFromLocalPool` doesn't prioritize by quality — it takes the first match. **Recommendation:** Sort local pool by quality descending before consuming.

**Blind Spot C: `_serverPoolCounts` may be stale**
At line 3796, the standard pipeline's pool gate reads `_serverPoolCounts?.[position]` to decide the submission threshold. This object is populated... somewhere (searched but couldn't find the setter in the visible code range). If it's populated once at app boot and never refreshed, positions that were underserved at boot may have grown past 5 scenarios. The gate would still use the lower 65-threshold. Low risk but worth a periodic refresh (e.g., every 30 min or on session start).

**Blind Spot D: Error catch regex too broad for `markXaiDown`**
Repeating for emphasis: the catch block at line 3897-3918 handles ALL `generateAIScenario` errors, including parse errors, role violations, and quality firewall rejections. The `markXaiDown` trigger at line 3917-3918 only fires if the error message matches the connect-timeout regex, which is correct. But if a future code change adds an error message like "network validation failed" or "fetch failed to parse", it would falsely trigger the xAI cooldown. **Guard rail:** Add a dedicated error type like `errType === "connect"` and only trigger markXaiDown on that.

| # | Finding | Severity | Fix Effort |
|---|---------|----------|------------|
| 18 | Local pool + server pool ID mismatch blocks cross-dedup | MEDIUM | Small -- add title-based exclude to fetchFromServerPool |
| 19 | `isXaiDown()` not yet wired to standard pipeline gate | HIGH | Small -- add 2-line check before line 3372 |
| 20 | Multi-agent scenarios skip analytics grade reporting | LOW | Small -- add fetch to /analytics/scenario-grade |
| 21 | Shuffle inconsistency: multi-agent pool entries pre-shuffled, standard not | LOW | Small -- move shuffleAnswers after pool submit in multi-agent |
| 22 | `markXaiDown` regex matches broad "fetch failed" patterns | MEDIUM | Small -- narrow regex to connect-specific errors |
| 23 | Prefetch doesn't check isXaiDown(), wastes AbortController on dead endpoint | LOW | Small -- add early return in prefetchAIScenario |
| 24 | Local pool consumeFromLocalPool doesn't prioritize by quality | LOW | Small -- sort by quality desc before match |

**Priority:** #19 is critical -- without it, the xAI health flag exists but doesn't actually prevent the most expensive timeout (standard pipeline, 25-85s). #22 is a close second to prevent false positives.

---

## AI Position Cross-Contamination Bug -- TPA Deep Analysis (2026-03-26)

**Bug report:** A BATTER scenario ("First Pitch Decision Leading Off") with options like "Look for a fastball in the zone and attack" and "Take the first pitch to see more pitches" was served to a player playing CATCHER position. All four options are batting decisions; none are catcher decisions. This passed every quality check.

### Root Cause Analysis

#### Finding 1: No "Position-Action Match" Check Exists Anywhere (CRITICAL)

The entire quality pipeline -- ROLE_VIOLATIONS, QUALITY_FIREWALL, CONSISTENCY_RULES, PREMISE_VIOLATIONS, the server-side Critic checklist (31 items), and the cross-position action check -- **never asks the fundamental question: "Are these 4 options actions that the requested position actually performs?"**

Every existing check is a negative pattern match ("catcher should NOT do X"). None is a positive match ("catcher options MUST be about calling pitches, blocking, framing, throwing out runners, or fielding bunts/WP/PB").

Here is what happens when a batter scenario arrives for catcher:

1. **ROLE_VIOLATIONS for catcher** (line 3518-3523 in 06_ai_pipeline.js): Checks for `catcher.*cutoff`, `catcher.*relay`, `catcher.*looks.*runner.*before.*field`. A batter scenario about "look for a fastball" matches NONE of these patterns. These patterns only catch catcher doing wrong catcher-adjacent things, not catcher doing an entirely different position's job.

2. **Cross-position action check** (lines 3574-3592): Only checks fielders/baserunner/batter for manager/catcher/pitcher options. It does NOT check catcher for batter options. Catcher is not in the `FIELDER_POS` array and is not checked at all.

3. **PREMISE_VIOLATIONS** (lines 3596-3630): Only two categories: `fielder` (checks for manager/pitcher/catcher topics) and `offensive` (checks for defensive positioning). There is NO `catcher` category that checks for batting topics. There is NO `pitcher` category that checks for batting topics.

4. **Server-side Critic checklist** (worker lines 3362-3392): Item 7 says "Does the pitcher NEVER act as cutoff man?" Item 8 says "Does the catcher NEVER leave home plate unguarded?" These are action-specific checks, not position-identity checks. There is NO checklist item that says "Are all 4 options actions this position performs?"

5. **POS_ACTIONS_MAP** (lines 21-34): This constant perfectly defines what each position does. It is used to inject position boundaries into AI generation prompts. But it is NEVER used for validation. It tells the AI "Catcher=calling pitches, setting up location targets, blocking..." but nobody checks the output against this map.

**The gap:** POS_ACTIONS_MAP is a generation hint, not a validation gate. The system trusts the AI to obey position boundaries but never verifies.

#### Finding 2: ROLE_VIOLATIONS Reference in Multi-Agent Handler is a Scoping Bug (HIGH)

The multi-agent handler (`generateWithMultiAgent`, line 11058 in index.jsx) references `ROLE_VIOLATIONS[position]`:

```javascript
if (ROLE_VIOLATIONS[position]) {
  // ... check patterns ...
}
```

But `ROLE_VIOLATIONS` is defined as `const` inside `generateAIScenario` (line 11919), a completely different function. In the single-file Babel setup, `const` is function-scoped. `ROLE_VIOLATIONS` is NOT visible to `generateWithMultiAgent`.

This means line 11058 throws a `ReferenceError: ROLE_VIOLATIONS is not defined`, which is caught by the outer try/catch at line 10970, causing the entire multi-agent result to return `null`. The multi-agent pipeline either: (a) always fails this check and falls back to xAI, or (b) Babel transpiles `const` to `var` in a way that hoists it (unlikely for nested function scope).

**If (a) is happening:** Every multi-agent scenario is silently rejected by the client and the system falls back to the xAI pipeline, which DOES have ROLE_VIOLATIONS in scope. This would mean the multi-agent pipeline (Claude Opus, higher quality) is being thrown away and replaced by xAI every time. Massive waste of tokens.

**If Babel hoisting makes it work:** The ROLE_VIOLATIONS check runs but still wouldn't catch batter-options-for-catcher because the catcher patterns only look for cutoff/relay/leaving-home violations.

**To verify:** Add `console.log("[BSM] ROLE_VIOLATIONS type:", typeof ROLE_VIOLATIONS)` before line 11058 and check browser console.

#### Finding 3: The Server Critic is an LLM, Not a Regex (MEDIUM)

The Critic is Claude Opus evaluating against a 31-item checklist. Item 3 says "Does each explanation specifically discuss THAT option?" The Critic could, in theory, notice that batting options don't belong in a catcher scenario. But:

1. The Critic prompt at line 3574 says: `Evaluate this Baseball Strategy Master scenario for position "${position}"`. It passes position as context.
2. The checklist has no item that says "Do all options match the requested position's responsibilities?"
3. The POSITION-SPECIFIC VALIDATION section (lines 3401-3411) says: `catcher: framing/blocking descriptions must be technically correct`. This checks catcher scenarios for catcher accuracy but does NOT check whether the scenario is actually about catching.
4. An LLM Critic seeing a well-written batter scenario could score it 9.5+ on all rubric dimensions if it focuses on quality rather than position match.

The Critic's blind spot: it evaluates scenario quality, not scenario identity.

#### Finding 4: Server Pool is Not the Vector (CONFIRMED SAFE)

The server pool fetch query (worker line 1968) correctly filters `WHERE position = ?`. The local pool's `consumeFromLocalPool` (line 4559) also filters `p.position === position`. The pool cannot serve a batter scenario to catcher unless the scenario was STORED with position="catcher".

This confirms the bug originates at generation time, not at retrieval time. The AI generated a batter scenario, it was tagged as catcher (because catcher was requested), it passed all checks, and was served/stored as catcher.

#### Finding 5: The Generator Prompt Has Position but No Enforcement (MEDIUM)

The multi-agent Generator receives `Position: ${position}` in the user message (worker line 3546) and "POSITION BOUNDARIES: Pitcher NEVER acts as cutoff/relay. Catcher NEVER leaves home unguarded." in the system prompt (line 3335). But these are narrow prohibition rules, not identity enforcement. The system prompt never says "ALL 4 options MUST be actions this position performs" or "If position=catcher, options must be about calling pitches, blocking, framing, etc."

### Proposed Fix: Position-Action Validator

A new Tier 1 firewall check using the existing `POS_ACTIONS_MAP`:

```
positionActionMatch(scenario, position) {
  const posActions = POS_ACTIONS_MAP[position]
  if (!posActions) return null  // unknown position, skip

  // Extract the action keywords for this position
  const actionKeywords = posActions.split("=")[1].split(",").map(a => a.trim().toLowerCase())

  // Check: do ANY of the 4 options reference actions from this position's domain?
  // Use a broader approach: check against WRONG position action maps
  const WRONG_POS_SIGNALS = {
    catcher: [/swing|bat|hit|bunt.*runner|take the pitch|protect the plate|look for.*fastball|attack.*zone|foul.*off|work the count|leadoff|first pitch.*decision/i],
    pitcher: [/swing|bat|take.*pitch|protect.*plate|look for.*fastball|steal|tag.*up|lead.*off/i],
    // ... etc for each position
  }
  const wrongSignals = WRONG_POS_SIGNALS[position] || []
  const optsText = scenario.options.join(" ")
  const matchCount = wrongSignals.filter(rx => rx.test(optsText)).length
  if (matchCount >= 2) return "Position mismatch: options contain actions for a different position"
  return null
}
```

A more robust version: for each option, check if it matches ANY other position's POS_ACTIONS_MAP better than the requested position. If 3+ of 4 options match a different position, reject.

### Recommended Actions

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 25 | Add Tier 1 firewall check: position-action match using POS_ACTIONS_MAP keywords | Medium | Catches this entire class of bugs |
| 26 | Fix ROLE_VIOLATIONS scoping bug: move const to module level or duplicate in generateWithMultiAgent | Small | Either unblocks multi-agent or stops silent token waste |
| 27 | Add Critic checklist item 32: "Are ALL 4 options actions this position performs?" | Small | Server-side catch before client |
| 28 | Add cross-position check for catcher/pitcher receiving batter/baserunner options | Small | Targeted fix for the exact bug observed |
| 29 | Expand PREMISE_VIOLATIONS to cover catcher/pitcher receiving offensive topics | Small | Catches batter/baserunner premise leaking into defensive positions |

**Priority:** #26 first (may reveal multi-agent pipeline is being silently discarded). #25 second (broadest protection). #28 third (targeted quick fix).

---

## Vite Migration -- TPA Risk Analysis (2026-03-26)

**Context:** The main agent is migrating from CDN Babel-in-browser transpilation to Vite. This analysis covers what will break, hidden gotchas, and the wiring scope.

### 1. The Global Variable Problem (HIGH RISK, HIGH EFFORT)

The current architecture is a concatenated single file. Every `const`, `function`, and `let` in files 01-07 is a **global** that files 08 and later use freely. With Vite, each source file becomes an ES module with its own scope. Nothing leaks.

**Scale of the wiring job:** I count roughly **150+ top-level declarations** across the 9 source files that are consumed cross-file. The dependency graph is one-directional (later files depend on earlier files), which simplifies things, but here is what each file exports to later files:

| File | Approximate exports needed | Examples |
|------|--------------------------|----------|
| 01_scenarios.js | 1 | `SCENARIOS` |
| 02_situations.js | 1 | `SITUATION_SETS` |
| 03_config.js | ~60 | `ALL_POS`, `POS_META`, `LEVELS`, `ACHS`, `DAILY_FREE`, `AI_PROXY_URL`, `WORKER_BASE`, `LLM_70B_URL`, `S` (sound config), `FIELD_THEMES`, `SEASON_STAGES`, `SEASON_TOTAL`, `DEFAULT`, `STORAGE_KEY`, `LB_KEY`, `PLACEMENT_POOL`, `CONCEPT_GATES`, `COACH_VOICES`, `LEARNING_PATHS`, `AVATAR_OPTS`, `ANIM_DATA`, `ANIMS`, `EASE`, `Guy()`, `AnimPhases()`, `GhostPhases()`, `getDailyScenario()`, `getWeeklyScenario()`, `getDailySituation()`, `achProgress()`, `getLvl()`, `getNxt()`, `proGate()`, `trackFunnel()`, `themeOk()`, `getFlame()`, `kidConceptName()`, `getCoachVoice()`, `detectSituationalPatterns()`, `trackAnalyticsEvent()`, `reportError()`, `generatePlayerCard()`, + more |
| 04_knowledge.js | ~20 | `POS_PRINCIPLES`, `AI_POS_PRINCIPLES`, `BIBLE_PRINCIPLES`, `KNOWLEDGE_MAPS`, `MAP_RELEVANCE`, `MAP_AUDIT`, `MASTERY_SCHEMA`, `ERROR_TAXONOMY`, `IMPROVEMENT_ENGINE`, `REAL_GAME_SITUATIONS`, `COACHING_VOICE`, `DECISION_WINDOWS`, `AI_FEW_SHOT_EXAMPLES`, `AI_SCENARIO_TOPICS`, `getRelevantMaps()`, `getAIFewShot()`, `getAIMap()`, + more |
| 05_brain.js | ~6 | `BRAIN`, `runnersKey()`, `getRunExpectancy()`, `getPressure()`, `getCountIntel()`, `evaluateBunt()` |
| 06_ai_pipeline.js | ~40+ | `QUALITY_FIREWALL`, `CONSISTENCY_RULES`, `AB_TESTS`, `OPTION_ARCHETYPES`, `ROLE_VIOLATIONS`, `gradeScenario()`, `planScenario()`, `buildAgentPrompt()`, `gradeAgentScenario()`, `computeBaseballIQ()`, `getIQColor()`, `planSession()`, `getCurrentPath()`, `getNextInPath()`, `shuffleAnswers()`, `fixPerspective()`, `consumeCachedAI()`, `cancelPrefetch()`, `saveToLocalPool()`, `consumeFromLocalPool()`, `getLocalPool()`, `getABGroup()`, `getABVariant()`, `getActiveABConfigs()`, `reportABResult()`, `queueLearningContribution()`, `buildLearningContribution()`, + many more |
| 07_components.js | ~10 | `Field`, `Board`, `Coach`, `useSound()`, `NumberAnim`, `ParticleFX`, `PromoCodeInput`, `LoginScreen`, `SignupScreen`, `DIFF_TAG`, `getCoachLine()` |

**Recommendation:** Do NOT try to add granular `import`/`export` statements for 150+ symbols across 9 files. Instead, consider two approaches:
- **Option A (quick):** Keep assemble.sh as the build input. Create a single `src/index.jsx` that is the concatenated file, and have Vite's entry point be that file. No module wiring needed. You lose per-file editing but keep the Vite dev server, HMR, and production builds.
- **Option B (proper):** Accept the wiring cost. Each file gets `export` on every top-level declaration, and each consuming file gets a barrel `import`. Since the dependency graph is strictly linear (01 never imports from 02, etc.), you can do this mechanically. But it is 9 files x ~20 imports each = ~180 import lines to write and maintain. This is a one-time cost but touching every file.

### 2. The preview.html Regex Hacks (MUST REMOVE)

Lines 70-75 of preview.html do critical transformations:
```js
code = code.replace(/import\s*\{[^}]*\}\s*from\s*["']react["'];?/,
  'const { useState, useEffect, useCallback, useRef } = React;');
code = code.replace('export default function App', 'function App');
```

And line 78 appends the React render call:
```js
code += '\nReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));';
```

With Vite, none of this is needed -- Vite handles JSX, imports, and you have a proper `main.jsx` entry point. But the **import line in 00_header.js is incomplete**: it imports `useState, useEffect, useCallback, useRef` but the code also uses `useMemo` (in 07_components.js) and `React.memo` and `React.createElement` (via global `React`). Those references to the bare `React` global will fail in Vite's module system.

**What breaks:**
- `React.memo(function Field(...))` -- needs `import React from 'react'` or `import { memo } from 'react'`
- `React.createElement("span", ...)` in NumberAnim -- needs the same
- Any JSX in the files will need React in scope (Vite with `@vitejs/plugin-react` handles this via automatic JSX runtime, so `React` import is NOT needed for JSX, but explicit `React.memo` and `React.createElement` calls still need it)

**Fix:** Add `import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'` or convert `React.memo` to `memo` and `React.createElement` to JSX.

### 3. The `window.storage` Polyfill (MEDIUM RISK)

The app uses `window.storage.get()` and `window.storage.set()` throughout 08_app.js (5 occurrences). This is a Claude.ai artifact API that preview.html polyfills with localStorage. With Vite, you need this polyfill to run BEFORE the app. Two options:
- Put the polyfill in `index.html` in a plain `<script>` tag (before Vite's module script)
- Create a `storage-polyfill.js` module imported at the top of the entry point

The polyfill itself is simple (6 lines). Just make sure it runs before any component mounts.

### 4. The `window.AudioContext` / `window.webkitAudioContext` Pattern (LOW RISK)

In 07_components.js line 29: `new(window.AudioContext||window.webkitAudioContext)()`. This works fine in ES modules -- `window` is still available in browser modules. No change needed.

### 5. `window.location`, `window.history`, `window.addEventListener` (NO RISK)

These are standard browser APIs that work identically in ES modules. No changes needed.

### 6. Cloudflare Pages Deployment (LOW RISK, EASY)

Current deployment: static files (preview.html, index.jsx) on Cloudflare Pages.

Vite outputs a `dist/` folder with `index.html` + bundled JS/CSS. Cloudflare Pages can serve this directly. The only change is setting the build command and output directory in the Pages config:
- Build command: `npm run build` (which runs `vite build`)
- Output directory: `dist`

This is a standard Vite + Cloudflare Pages setup. No gotchas.

### 7. React 18 CDN vs React 18/19 npm (MEDIUM RISK)

The current CDN loads `react@18` and `react-dom@18`. The existing `package.json` has `react: "19.1.0"` and `react-dom: "19.1.0"` (for the Next.js app that shares this repo).

**Key concern:** If the Vite migration uses the existing package.json's React 19, the BSM app code was written for React 18 patterns. React 19 differences that matter:
- `ReactDOM.createRoot` still works in React 19 (no change)
- `useEffect` cleanup timing changed slightly in React 19
- `React.createElement` still works but is no longer needed with the new JSX transform
- Strict mode double-rendering is more aggressive in React 19

**Recommendation:** Pin React 18 for the Vite migration to avoid surprise behavior changes. Test thoroughly before upgrading to 19. Or if using the same package.json, be aware of React 19 differences.

### 8. CSS / Inline Styles (NO RISK)

The app uses inline styles throughout (React `style={{...}}` objects). preview.html has a small `<style>` block for mobile responsiveness. This CSS needs to move to a `.css` file imported by the Vite entry point, or stay inline in the new `index.html`. Either way, trivial.

### 9. The Artifact Compatibility Question (STRATEGIC)

The current design allows index.jsx to work as a Claude.ai artifact (the `import { ... } from "react"` line, the `export default function App` signature). The Vite migration breaks this dual-use:
- Vite will transform JSX with its own plugin
- The assembled index.jsx with module-style imports won't work as a standalone artifact anymore unless you keep assemble.sh producing the artifact-compatible version

**Question for Blaine:** Is artifact compatibility still needed? If yes, you need two outputs: (1) assemble.sh for artifact, (2) Vite for web. If no, you can simplify significantly.

### 10. HMR and the 17,500-Line Single File (PERFORMANCE)

Vite's dev server uses Hot Module Replacement. With a single 17,500-line file, every edit triggers a full module reload (no granular HMR). If you split into 9 files with proper imports, HMR works per-file -- editing a component in 07 only reloads that module. This is one of the biggest DX wins of the migration.

However: Vite's JSX transform on a 17,500-line file is still faster than in-browser Babel. Even without splitting, dev experience improves.

### 11. Hidden Gotcha: Module-Level Side Effects

Several files have code that runs at module load time:
- `03_config.js` lines 154-157: `window.addEventListener("visibilitychange", ...)` and `window.addEventListener("beforeunload", flushAnalytics)` -- these run when the module is first imported
- `03_config.js` lines 185-191: `window.addEventListener("error", ...)` and `window.addEventListener("unhandledrejection", ...)`
- `06_ai_pipeline.js`: Several `let` variables initialized at module level (`_xaiDownUntil`, `_calibrationCache`, `_learningBatch`, `_recentAITitles`, etc.)

In a script tag, these run once when the script executes. In ES modules, they run once when the module is first imported. The behavior is functionally the same, BUT: if Vite's HMR re-executes a module, those event listeners get re-added (duplicated). This causes analytics events to fire multiple times during development.

**Fix:** Wrap side-effect listeners in a guard: `if (!window.__bsmListenersAttached) { ... window.__bsmListenersAttached = true; }` or move them into a React `useEffect` in the App component.

### 12. The package.json Conflict (IMPORTANT)

The current package.json is a **Next.js app** with Prisma, NextAuth, Tailwind, Socket.io, etc. The BSM single-file app has NOTHING to do with these dependencies. If you add Vite to this same package.json, you'll have conflicting build commands (`next build` vs `vite build`), conflicting configs, and React version conflicts.

**Options:**
- **Option A:** Create a separate `bsm-app/` directory with its own package.json for the Vite app. Clean separation.
- **Option B:** Use the root package.json but add separate scripts (`bsm:dev`, `bsm:build`). Messy but workable.
- **Option C:** If the Next.js app IS the future and BSM is being absorbed into it, then the Vite migration is temporary scaffolding. Clarify the end state before committing to either.

### Summary: Migration Effort Estimate

| Task | Effort | Risk |
|------|--------|------|
| Install Vite + plugin-react, create vite.config.js | 10 min | Low |
| Create new index.html entry point | 10 min | Low |
| Create main.jsx entry that imports App and renders | 5 min | Low |
| Add window.storage polyfill | 5 min | Low |
| Move preview.html CSS to a CSS file | 5 min | Low |
| Wire imports/exports across 9 files (~150+ symbols) | 2-4 hours | Medium -- mechanical but tedious, easy to miss one |
| Fix `React.memo` / `React.createElement` references | 15 min | Low |
| Test all 15 position categories + AI pipeline | 1-2 hours | Medium |
| Fix HMR side-effect duplication | 15 min | Low |
| Update Cloudflare Pages build config | 10 min | Low |
| Resolve package.json conflict (Next.js vs Vite) | 30 min | Medium |
| **Total** | **4-7 hours** | |

### Recommended Approach

1. **Create a separate directory** (`bsm-vite/` or similar) with its own package.json to avoid Next.js conflicts
2. **Keep assemble.sh working** as a fallback and for artifact compatibility (if still needed)
3. **Start with Option A** (single concatenated file as Vite entry) to get the build pipeline working in 30 minutes
4. **Then progressively split** into proper modules if the DX improvement justifies the wiring cost
5. **Pin React 18** to avoid behavior changes during migration
6. **Test the AI pipeline thoroughly** -- the fetch calls, timeouts, and abort controllers are the most likely to surface subtle timing differences

---

## Thought Partner: Phase 0 Blind Spot Audit (2026-03-26)

After the Vite migration, PWA manifest, repo cleanup, Critic token fix, and package.json replacement, here are the blind spots found:

### CRITICAL: 7 files still reference `preview.html` (now dead)

The old entry point `preview.html` is gone in favor of `index.html` + Vite, but these files still point to it:

1. **`sw.js` (service worker)** — 4 references. Push notification URLs, notificationclick handler, and periodic sync all open `/preview.html`. Users who "Add to Home Screen" and receive push notifications will land on a 404.
2. **`coaches.html`** line 102 — "TRY IT NOW" CTA links to `/preview.html`.
3. **`terms.html`** line 60 — "Back to Game" link points to `/preview.html`.
4. **`privacy.html`** line 77 — "Back to Game" link points to `/preview.html`.
5. **`build.sh`** line 8 — copies `preview.html` to dist. With Vite now doing builds, `build.sh` is likely dead, but if anyone runs it they will get stale output.

**Fix:** Global find-and-replace `/preview.html` with `/` across sw.js, coaches.html, terms.html, privacy.html. For build.sh, either delete it or update it to run `vite build` instead.

### CRITICAL: Missing PWA icons — iOS "Add to Home Screen" will show a blank icon

`index.html` line 13 references `/icons/icon-192.png` for the Apple touch icon, but that file does not exist. The only file in `public/icons/` is `icon.svg`. The manifest only lists the SVG icon.

**Problem:** Safari on iOS does not support SVG icons in the manifest. It uses `apple-touch-icon` which must be a PNG. Android Chrome also prefers raster icons (192x192 and 512x512 are recommended).

**Fix:** Generate PNG icons from the SVG:
- `icon-192.png` (192x192) — required for apple-touch-icon and Android install prompt
- `icon-512.png` (512x512) — required for Android splash screen
- Add both to `manifest.json` icons array alongside the SVG

### CRITICAL: Missing `favicon.ico`

`index.html` line 7 references `/favicon.ico` but the file does not exist anywhere in the project (not in root, not in `public/`). Every page load generates a 404 for the favicon.

**Fix:** Generate a favicon.ico from the SVG icon, or convert the `<link>` tag to reference the SVG directly: `<link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />`.

### MEDIUM: Critic 1000 tokens — probably fine, but monitor

The Critic output JSON structure contains:
- 32 boolean checklist items (~128 tokens)
- `checklistFailures` array with detailed strings (~50-150 tokens per failure)
- 6 rubric dimension scores (~50 tokens)
- `overallScore`, `pass`, `issues`, `suggestions` (~100-200 tokens)
- JSON formatting overhead (~50 tokens)

**Analysis:** With 0 checklist failures, output is ~350 tokens. With 3-4 failures (typical for a scenario that needs rewriting), output is ~600-800 tokens. 1000 tokens should handle most cases. The risk scenario is 6+ checklist failures with verbose descriptions — that could hit ~900-1000 and get truncated. The old 600 token limit was clearly too low; 1000 is a reasonable fix.

**Recommendation:** Monitor for truncated Critic JSON in production logs. If truncation reappears, bump to 1200. The Critic's value comes precisely when there are many failures to report, so truncation hits hardest exactly when you need the output most.

### MEDIUM: Rewriter token budget looks fine at 1500

The Rewriter at 1500 tokens (line 3615) generates a full scenario JSON object. A typical scenario is ~800-1200 tokens of JSON. 1500 gives enough headroom. No change needed.

### LOW: Vite config is minimal but functional

Missing features that would help:
1. **Sourcemaps** — `sourcemap: false` means production errors will be unreadable stack traces pointing to minified code. For a 12K+ line single-file app, this makes debugging reported bugs nearly impossible. Consider `sourcemap: 'hidden'` (generates maps but does not expose them via sourceMappingURL — you can upload to an error tracking service later).
2. **Manual chunk splitting** — The 12K-line `index.jsx` will produce one giant JS bundle. The SCENARIOS object alone (~3800 lines) never changes between deploys. A manual chunk split would let browsers cache scenarios separately: `manualChunks: { scenarios: ['./index.jsx'] }` is not viable since it is one file, but if/when the codebase splits, this becomes important.
3. **Environment variables** — No `define` or `envPrefix` config. If you ever need `import.meta.env.VITE_*` variables (e.g., for switching API URLs between dev/prod), you will need to add this.

### LOW: `build.sh` is now redundant (but not deleted)

`build.sh` manually copies files to `dist/`. With Vite, `vite build` handles this. The two will conflict — `build.sh` copies `preview.html` (old entry), while `vite build` produces its own `dist/index.html`. If Cloudflare Pages is configured to run `build.sh`, it will produce a broken build.

**Check:** What is the Cloudflare Pages build command set to? If it is `sh build.sh`, it needs to change to `npm run build` (which runs `vite build`).

### LOW: `assemble.sh` is still needed

`assemble.sh` concatenates `src/` files into a single `index.jsx` — this is Vite's actual entry (via `main.jsx` importing `./index.jsx`). If anyone edits `src/` files directly and forgets to run `assemble.sh`, the changes will not appear in the running app. This is a footgun but a known one.

### OBSERVATION: Manifest could use `scope` and `id`

The PWA manifest is missing `"scope": "/"` and `"id": "/"`. Without `scope`, the PWA might not correctly handle navigation. Without `id`, Chrome may create duplicate install entries if the start_url ever changes. Both are one-line additions.

### OBSERVATION: Service worker registers from where?

`sw.js` exists at the project root, but there is no `navigator.serviceWorker.register('/sw.js')` call visible in `index.html` or `main.jsx`. Is it registered somewhere inside `index.jsx`? If not, push notifications will never work because the service worker is never installed.

### OBSERVATION: `dist/` is properly gitignored

Confirmed in `.gitignore` line 2: `dist/` is ignored. Good.

---

## Thought Partner Audit: AI-Graphics Connection Gaps (2026-03-26)

Cross-cutting analysis of the intersection between AI scenario generation and field animation rendering. These are things neither a pure AI audit nor a pure graphics audit would catch because they live in the seam between the two systems.

### HIGH: AI scenarios never set `animVariant` — direction variants are silently lost

The AI prompt (line 2492 of `06_ai_pipeline.js`) asks the AI to set `anim` to one of 15 values but never mentions `animVariant`. The handcrafted scenarios also never set `animVariant`. The replay Field computes direction variants dynamically from `sc.situation.runners` and `pos` (lines 4618-4641 of `08_app.js`), which works great for replay mode.

**But the live play Field at line 4484 passes `anim={fo?sc.anim:null}` with NO animVariant at all.** This means during the first play-through (not replay), every steal animation shows 1B-to-2B regardless of where the runner actually is. A steal-of-third scenario with `runners:[2]` will show the runner leaving from first base. The steal, advance, hit, flyout, groundout, and freeze direction variants are only applied in the replay Field, not the initial outcome animation.

A coach watching would immediately notice: "The runner was on second, but the animation just showed him stealing from first."

**Fix:** Compute the same `animVariant` logic for the live play Field at line 4484, or factor the computation into a shared function and use it in both places.

### HIGH: `steal` animation hardcodes 1B-to-2B runner path even in ANIM_DATA fallback

The `steal_success` ANIM_DATA entry (line 277 of `03_config.js`) has a runner path `M290,210 Q248,170 200,135` (1B to 2B) and catcher throw to second. When Field receives `anim="steal"` with no `animVariant`, it always plays the 1B-to-2B steal. The `steal_2to3_success` and `steal_3toHome_success` variants exist but are only reached when `animVariant` is "2to3" or "3toHome".

The AI's firewall (line 261) correctly checks "steal animation but no runners on base" but does NOT check whether the steal animation direction matches where the runners actually are. An AI scenario with `anim:"steal"` and `runners:[2]` will pass the firewall but animate incorrectly (showing a 1B steal when the runner is on 2B).

**Fix:** Add a firewall rule: if `anim==="steal"` and `!runners.includes(1)` and `runners.includes(2)`, warn "steal animation defaults to 1B-to-2B but runner is on 2B — consider adding animVariant support to AI prompt."

### MEDIUM: Highlights reel stores raw `sc.animVariant||sc.pitchType` which is always null

At line 1394 of `08_app.js`, when a player gets a correct answer and the highlight is saved, the variant is stored as `variant:sc.animVariant||sc.pitchType||null`. Since neither AI nor handcrafted scenarios ever set these fields, the highlights reel always replays with `animVariant=null`. The Field at line 2122 passes `animVariant={h.variant}` which will always be null.

This means the highlights reel always plays the default animation direction. A great steal-of-third play would be replayed as a steal of second.

**Fix:** Compute the variant at save time (like the replay Field does) rather than reading from the scenario object.

### MEDIUM: No animation for `safe`, `catch`, `freeze`, `pickoff`, `relay`, `tag`, `popup`, `wildPitch`, `squeeze`, `hitByPitch` in live outcome

The live play Field (line 4484) passes `anim={fo?sc.anim:null}`. The ANIM_DATA lookup (line 474) checks `anim+"_"+outcome`. But several animation types only exist as `_success` variants in ANIM_DATA. If `fo` (feedback outcome) is "warning" or "danger", the lookup tries e.g. `steal_warning` which does not exist, then falls back to `steal_success` via `altKey`. This means:

1. A wrong answer on a steal scenario still shows the successful steal animation (runner safe) even though the player chose poorly.
2. Only the replay's "Game Film" mode shows the fail animation via the separate `GhostPhases` overlay.

A coach would expect: player picks wrong, animation shows what goes wrong. Instead, the field always shows the optimal outcome animation regardless of answer quality.

### MEDIUM: Camera zoom map missing several animation types

The `zoomMap` at line 100-102 of `07_components.js` only covers 9 animation types: steal, score, hit, doubleplay, groundout, flyout, relay, pickoff, bunt. But there are 22 animation types total. Missing from zoom: strikeout, strike, catch, advance, walk, safe, freeze, tag, popup, wildPitch, squeeze, hitByPitch. In replay mode, these animations play without the camera zoom effect, which is inconsistent.

### MEDIUM: Trajectory dashed lines only cover 6 animation types

The trajectory paths at lines 434-436 of `07_components.js` only map: hit, flyout, groundout, relay, doubleplay, bunt. A steal replay shows the spotlight ring and slow-motion but no trajectory guide line. throwHome, advance, score, and other animations with clear ball/runner paths have no trajectory visualization in replay mode.

### LOW: AI loading spinner has no field preview — missed opportunity

During AI generation (lines 4427-4440 of `08_app.js`), the player sees a spinning baseball emoji and text messages. The field SVG is not rendered at all. For waits of 5-15 seconds, this feels like a broken loading screen.

**Idea:** Show the Field component with the player's current position highlighted and runners from the AI prompt's situation hint. This would feel like "setting up the play" rather than "waiting for the computer." The planner already picks situation params (inning, outs, runners) before generation starts.

### LOW: Runner dots remain after animation shows them scoring/advancing

In the live play Field (line 4484), `runners` comes from `sc.situation.runners`. If a score animation plays (runner goes from 3B to home), the static runner dot at 3B (line 430) remains visible because the `runners` prop still includes `3`. The animation overlays a moving runner on top, but the original dot stays put. In replay mode (lines 4603-4614), the code correctly filters out the moving runner from the `runners` array. The live play Field does not do this filtering.

### LOW: `advance_success` always shows 1B-to-2B even for 2B-to-3B or 3B-to-home

Same pattern as the steal issue. The default `advance_success` in ANIM_DATA (line 491-495) shows `M290,210 Q248,170 200,135` (1B to 2B). Variants `advance_2to3_success` and `advance_3toHome_success` exist but are only reached via `animVariant`, which is never set for live play.

### OBSERVATION: Fielder positions are standard alignment — no shift representation

The Field component hardcodes fielder positions: SS at (152,185), 2B at (248,185), 1B at (278,205), 3B at (122,205). There is no mechanism to adjust these based on a scenario's described defensive alignment. A scenario about "playing a shift with the shortstop behind second base" will still show the SS at the normal position. One of the 21 knowledge maps is `legal-shift` — the visual doesn't reflect it.

### OBSERVATION: AI QUALITY_FIREWALL has an animation-situation mismatch check but it's incomplete

The `animationSituationMismatch` check (lines 256-265 of `06_ai_pipeline.js`) validates 5 cases:
- doubleplay with 2 outs
- steal/score/advance with no runners
- bunt with 2 outs

Missing checks a coach would catch:
- `hit` animation with no batter context (count field missing or "-")
- `doubleplay` with runner only on 3rd (DP goes to 2B then 1B — needs runner at 1B or batter)
- `throwHome` with no runners in scoring position (runners should include 2 or 3)
- `score` with runner only on 1st (very unlikely to score from 1st on most plays)
- `steal` when count has 2 strikes (extremely rare real baseball decision)

### OBSERVATION: Guy() component scale factor creates sizing inconsistency

Guy uses `scale(0.6)` (line 550 of `03_config.js`) for all poses. The ring highlight uses `r="16"` before the scale transform, so the ring is in the parent coordinate space (actual size 16). But the player body is in the 0.6-scaled child space. This means the player body is about 60% the size of what the ring suggests. The shadow ellipse (`rx=11, ry=3.5`) is also in scaled space, making it appear proportionally correct to the body but small relative to the ring. This is cosmetic but a coach might notice players look slightly small for their highlight rings.

---

## IDEA: Film Room Multi-Position Play Animation — Full Design (2026-03-27)

### The Problem
The Film Room currently shows a static field with a pulsing radial glow on each position, stepping through one position at a time (4s auto-advance). The field uses `anim="freeze"` — nothing moves. For a feature called "Film Room," this is underwhelming. The whole point of the Situation Room is that 5 positions work together on ONE play. The Film Room should show that play unfolding.

### The Vision
A single continuous animation showing the ENTIRE play — all 5 positions moving simultaneously — played as a slow-motion replay before stepping through each position's decision. Think broadcast replay: ball off the bat, everyone reacts, the play develops over 8-10 seconds.

### Reference Play: "Extra-Base Hit to the Gap" (sr4)

**The action sequence in real baseball (4 seconds):**
- t=0.0s: Ball hit to left-center gap (line drive off bat)
- t=0.3s: CF and LF both break toward the gap
- t=0.5s: Runner on 1B takes off running toward 2B
- t=1.0s: SS sprints to relay position between gap and home
- t=1.2s: 2B moves to cover second base
- t=1.5s: Pitcher moves to back up potential throw to home/3B
- t=2.0s: CF reaches ball in gap
- t=2.5s: CF throws to relay man (SS)
- t=3.0s: SS catches relay, redirects toward home
- t=3.2s: Runner rounds 2B heading to 3B
- t=3.5s: Runner rounds 3B, reads the throw
- t=4.0s: Runner holds at 3B (throw is on-line)

### Key Coordinates (SVG viewBox 0 0 400 340)

| Position | Start | End | Notes |
|----------|-------|-----|-------|
| Ball | Home (200,290) | LC gap (150,55) then to SS relay (168,150) | Two-phase: launch arc then relay throw |
| CF | CF position (200,60) | Gap area (150,55) | Sprint left to field ball |
| SS | SS position (160,180) | Relay spot (168,150) | Sprint out to relay position |
| 2B fielder | 2B position (240,180) | Cover 2B bag (200,135) | Drift to cover vacated bag |
| Pitcher | Mound (200,218) | Backup (145,240) | Move toward 3B/home backup |
| Runner | 1B (290,210) | Round 3B (110,210) then hold | Full baserunning path 1B-2B-3B |

### ANIM_DATA Design: `situationRoom_sr4`

**Slow-motion scale: 2x real time (4s play becomes 8s animation)**

```javascript
situationRoom_sr4: [
  // === PHASE 1: Contact (t=0.0-0.5s) ===
  // Bat contact flash
  {type:"flash", cx:200, cy:288, r:10, dur:0.12, begin:0, color:"rgba(255,255,255,.9)"},

  // Ball launches to LC gap — high arc line drive
  {type:"trail", path:"M200,290 Q170,140 150,55", dur:1.0, begin:0.05, color:"#f59e0b", r:2, easing:EASE.launch},
  {type:"ball", path:"M200,290 Q170,140 150,55", dur:1.0, begin:0, color:"#f59e0b", r:3, easing:EASE.launch, glow:true},

  // Bat contact dust
  {type:"dust", cx:202, cy:292, r:5, dur:0.3, begin:0.08, color:"#c4a882"},
  {type:"dust", cx:197, cy:290, r:4, dur:0.25, begin:0.12, color:"#c4a882"},

  // === PHASE 2: Everyone reacts (t=0.3-2.0s) ===
  // Runner takes off from 1B toward 2B
  {type:"runner", path:"M290,210 Q248,170 200,135", dur:1.2, begin:0.6, easing:EASE.runner},
  {type:"dust", cx:290, cy:212, r:4, dur:0.25, begin:0.6, color:"#c4a882"},

  // CF sprints left to the gap
  {type:"runner", path:"M200,60 Q175,55 150,55", dur:1.0, begin:0.3, easing:EASE.runner, jersey:"#1e40af", cap:"#1e3a8a", pants:"#e5e7eb"},

  // SS sprints to relay position (arms up will be a label, see below)
  {type:"runner", path:"M160,180 Q164,165 168,150", dur:0.8, begin:0.5, easing:EASE.runner, jersey:"#1e40af", cap:"#1e3a8a", pants:"#e5e7eb"},

  // 2B fielder drifts to cover 2B bag
  {type:"runner", path:"M240,180 Q220,158 200,135", dur:1.2, begin:0.6, easing:EASE.float, jersey:"#1e40af", cap:"#1e3a8a", pants:"#e5e7eb"},

  // Pitcher moves toward 3B-line backup
  {type:"runner", path:"M200,218 Q172,228 145,240", dur:1.5, begin:0.8, easing:EASE.float, jersey:"#1e40af", cap:"#1e3a8a", pants:"#e5e7eb"},

  // === PHASE 3: CF fields and throws relay (t=2.0-3.0s) ===
  // CF arrival dust at ball
  {type:"dust", cx:150, cy:57, r:5, dur:0.3, begin:1.3, color:"#c4a882"},
  {type:"flash", cx:150, cy:55, r:6, dur:0.1, begin:1.3, color:"rgba(255,255,255,.4)"},

  // Relay throw: CF to SS
  {type:"ball", path:"M150,55 Q160,100 168,150", dur:0.5, begin:1.8, color:"white", r:2.5, easing:EASE.throw, glow:true},
  {type:"trail", path:"M150,55 Q160,100 168,150", dur:0.5, begin:1.83, color:"white", r:1.5, easing:EASE.throw},

  // SS catches relay — flash
  {type:"flash", cx:168, cy:150, r:7, dur:0.1, begin:2.28, color:"rgba(34,197,94,.4)"},

  // === PHASE 4: Runner rounds bases, SS redirects (t=3.0-4.0s) ===
  // Runner continues 2B to rounding 3B
  {type:"runner", path:"M200,135 Q152,170 110,210", dur:1.2, begin:1.8, easing:EASE.runner},
  {type:"dust", cx:200, cy:137, r:4, dur:0.25, begin:1.8, color:"#c4a882"},
  {type:"dust", cx:112, cy:212, r:5, dur:0.3, begin:3.0, color:"#c4a882"},

  // SS redirect throw toward home (strong relay)
  {type:"ball", path:"M168,150 Q184,220 200,290", dur:0.6, begin:2.5, color:"#ef4444", r:2.5, easing:EASE.throw},
  {type:"line", x1:168, y1:150, x2:200, y2:290, color:"#ef4444", width:1.5, dash:"4,3", dur:1.5, begin:2.5},

  // === PHASE 5: Runner holds at 3B (t=3.5-4.0s) ===
  // Runner rounds and holds — small step past 3B then back
  {type:"runner", path:"M110,210 Q115,220 118,228", dur:0.5, begin:3.2, easing:EASE.float, o:0.6},

  // Ball arrives at home — catcher catches
  {type:"flash", cx:200, cy:290, r:8, dur:0.12, begin:3.1, color:"rgba(239,68,68,.4)"},

  // === LABELS: Position callouts (appear as play unfolds) ===
  {type:"text", x:200, y:42, text:"CF", size:8, color:"#3b82f6", dur:6, begin:0.3},
  {type:"text", x:168, y:140, text:"SS RELAY", size:7, color:"#3b82f6", dur:5, begin:0.8},
  {type:"text", x:200, y:126, text:"2B COVERS", size:6, color:"#64748b", dur:4, begin:1.0},
  {type:"text", x:145, y:252, text:"P BACKUP", size:6, color:"#64748b", dur:4, begin:1.2},
  {type:"text", x:115, y:200, text:"HOLDS!", size:10, color:"#f59e0b", dur:2, begin:3.5},
],
```

**Total duration: ~5.5s of active animation, ~8s with text fadeouts.**

### New Phase Type Needed: `spotlight`

The Film Room step-through already uses a radial glow SVG overlay (lines 5264-5280 of 08_app.js). But for the full-play animation, we need a way to highlight which position is "active" as the play unfolds. Proposal:

```javascript
// New phase type for AnimPhases renderer:
if(p.type==="spotlight") return (
  <circle key={k} cx={p.cx} cy={p.cy} r="0" fill="none"
    stroke={p.color||"#3b82f6"} strokeWidth={p.width||2} opacity="0">
    <animate attributeName="r" from="0" to={p.r||25} dur={p.dur+"s"}
      begin={(p.begin||0)+"s"} fill="freeze"/>
    <animate attributeName="opacity" values="0;.6;.6;0" dur={p.dur+"s"}
      begin={(p.begin||0)+"s"} fill="freeze"/>
  </circle>
);
```

This would let the phases array include:
```javascript
{type:"spotlight", cx:200, cy:60, r:25, dur:2, begin:0.3, color:"#3b82f6"},  // CF
{type:"spotlight", cx:168, cy:150, r:20, dur:2, begin:0.8, color:"#22c55e"},  // SS
```

### Film Room Integration: Two-Phase Viewing

**Phase A: Full Play Replay (new)**
- Before stepping through individual positions, show "Watch the Play" button
- Plays the full `situationRoom_sr4` animation once on the field
- Ball, runners, fielders all moving simultaneously
- Position labels appear as each actor enters the play
- 8-10 seconds total, then transitions to Phase B
- "Replay" button available

**Phase B: Position Step-Through (existing, enhanced)**
- Current behavior: step through each position with radial glow
- Enhancement: instead of `anim="freeze"`, play a SUBSET of the full animation showing only that position's action
- CF step: show just the CF sprint and the ball arriving in the gap
- SS step: show just the SS sprinting to relay and catching/throwing
- Runner step: show just the baserunning path 1B-2B-3B with the hold decision
- This means we need per-position phase slices — tag each phase with a `pos` field

### Per-Position Phase Tagging

Add an optional `pos` field to each ANIM_DATA phase:
```javascript
{type:"runner", path:"M200,60 Q175,55 150,55", dur:1.0, begin:0.3,
  easing:EASE.runner, jersey:"#1e40af", pos:"centerField"},
```

The renderer can filter: `phases.filter(p => !p.pos || p.pos === currentPosition)` to show only the relevant subset during step-through. During the full replay, show all phases.

### Reusable Patterns Across Situation Sets

Many Situation Room plays share sub-animations:

| Sub-animation | Used in |
|---------------|---------|
| Ball to gap (LC or RC) | sr4, any gap-hit play |
| Runner 1B-2B-3B path | sr4, sr7, any baserunning play |
| Relay chain (OF to SS to home) | sr4, any cutoff play |
| Bunt roll to baseline | sr3, sr6 |
| Steal break (runner to 2B) | sr2 |
| Rundown oscillation | sr7 |
| Pitcher mound-to-backup drift | sr3, sr4, sr6 |

These could be extracted as composable phase arrays:
```javascript
const RELAY_CHAIN = (ofX, ofY, relayX, relayY) => [
  {type:"ball", path:`M${ofX},${ofY} Q${(ofX+relayX)/2},${(ofY+relayY)/2-20} ${relayX},${relayY}`, dur:0.5, begin:0, ...},
  {type:"flash", cx:relayX, cy:relayY, r:7, dur:0.1, begin:0.49, ...},
];
```

This avoids duplicating ~15 lines per situation set and makes new plays quick to author.

### Timing Coordination Rules

Key constraint: SMIL `begin` attributes are absolute from SVG insertion. All 5 positions' animations share the same time origin. This is actually perfect for simultaneous action — we don't need to coordinate between separate timelines. Everything is one flat array of phases with absolute `begin` times.

**Timing guidelines for realistic feel:**
- Ball off bat: begin=0
- Fielder reactions: begin=0.3-0.6 (human reaction time ~0.3s, scaled 2x)
- Runner first move: begin=0.5-0.7 (reads ball off bat, then commits)
- Relay throw: begin when CF would realistically field it (~1.8s in slow-mo)
- Runner arrival at bases: stagger ~1.2s per base in slow-mo
- Text labels: appear when the position becomes relevant, persist 4-6s
- Total play: 5-6s of action, 2s of text fadeout = ~8s total

### Concerns and Edge Cases

1. **Too many Guy() sprites on screen simultaneously**: The sr4 play has 5 runners + existing Field() sprites. May need to hide default field positions during the film animation, or use lower-opacity versions. The `o` (opacity) parameter on runner phases helps — background positions at `o:0.3`.

2. **Runner jersey collision**: Offense is red (`#dc2626`), defense is blue (`#1e40af`). The runner phases default to red. Defense phases must explicitly set `jersey:"#1e40af"`. This is already supported by the AnimPhases renderer.

3. **Looping vs. one-shot**: The full-play animation should be one-shot with a "Replay" button, not looping. SMIL `fill="freeze"` on the last phase keeps everything visible at final positions. Current AnimPhases already uses `fill="freeze"`.

4. **Mobile performance**: 20+ simultaneous SMIL animations could be choppy on older phones. Could add a "reduced motion" check (`prefers-reduced-motion`) that shows a simplified version — just the ball path and final positions, no fielder movements.

5. **Animation key reset**: When transitioning from full-play to step-through, the AnimPhases `ak` (animation key) prop must change to force SVG re-render. Otherwise SMIL animations won't restart. The existing system handles this via `ak={ak}` tied to state changes.

6. **Coordinate accuracy**: The paths above are estimates. The ball's arc to the gap should feel like a line drive — low Q control point. CF sprint should be short (he's already near the gap). SS sprint is longer — 30 units outward. These may need visual tuning.

### Priority and Effort Estimate

- **New `spotlight` phase type**: 5 lines in AnimPhases renderer. Trivial.
- **Per-position `pos` tag filtering**: 1 line in AnimPhases. Trivial.
- **sr4 full-play phases array**: ~30 phases, authored manually. Medium (2-3 hours with visual tuning).
- **Film Room UI changes**: Add "Watch Play" button, render full animation, then transition to step-through. Medium (1-2 hours).
- **Composable sub-animation helpers**: Nice-to-have for scaling to all 12+ situation sets. Low priority for first implementation.
- **All 12 situation sets**: Each needs a custom phases array. At ~2h per set, that is 24 hours total. Could be batched — do sr4 as reference, then template the rest.

### Bottom Line

The existing ANIM_DATA + AnimPhases system is already built for exactly this. Every phase type (dust, ball, trail, runner, flash, text, line) supports absolute `begin` timing, which means simultaneous multi-position action works out of the box. The only new code needed is a `spotlight` phase type (~5 lines) and a `pos` filter (~1 line). The real work is authoring the phase arrays for each situation set and tuning the visual timing.

---

## AutoResearch: analyzeFailurePatterns() Blind Spots (TPA)

**Date:** 2026-03-30 | **Reviewer:** Thought Partner Agent | **Scope:** Quality infrastructure analysis for the AutoResearch prompt optimization loop — blind spots in grading, unmapped failure modes, feedback loop corruption risks

---

### Observation O12: Grading Infrastructure Has Correlated Blind Spots That Would Corrupt the Optimization Loop

The three quality systems (gradeScenario, QUALITY_FIREWALL, CONSISTENCY_RULES) share a structural assumption that text-matching is a reliable proxy for correctness. This creates a blind spot category that `analyzeFailurePatterns()` cannot detect because all three graders would score the scenario as passing.

**The specific gap:** A scenario can have a baseball-correct best answer, proper rates, good explanation length, causal language, situation references, distinct options, no role violations, no consistency rule triggers — and still be a BAD scenario if the *wrong answers are unrealistically bad*. The "absurd option" check in Tier 2 only catches explicit phrases like "give up" or "yell at." It misses the far more common AI failure: options that no real player would ever consider but don't contain banned phrases.

Example: A shortstop scenario where option C is "Run to the outfield to catch the ball yourself." This passes every firewall check (no role violation regex matches, it's about the shortstop, no banned phrases, sufficient length, distinct from other options). But a real kid would never think this. The scenario teaches nothing because the wrong answers don't represent real misconceptions.

**Why this matters for analyzeFailurePatterns():** If the grading infrastructure gives a scenario 85/100 and QUALITY_FIREWALL passes it, the optimization loop will never flag it for mutation. The loop optimizes for what it can measure, and "wrong answer plausibility" is unmeasured. Over hundreds of iterations, the AI will learn to generate scenarios that ace the grading rubric while producing trivially easy multiple choice.

**Recommended addition to MUTATION_TARGET_MAP:** A new failure category `implausible_distractors` that measures the semantic gap between options. If 3 of 4 options are obviously wrong to anyone with basic baseball knowledge (approximated by: option text length < 60% of best option length, or option rates cluster below 20%), flag for the `option_archetype_injection` mutation. The OPTION_ARCHETYPES system already has `kid_mistake` and `sounds_smart` categories — the mutation should verify the generated scenario actually uses these patterns rather than falling back to straw-man distractors.

---

### Idea 11: The Grader-Optimizer Goodhart's Law Problem (Cross-Domain)

**Cross-domain connection:** This is a textbook Goodhart's Law situation — "when a measure becomes a target, it ceases to be a good measure." The `gradeScenario()` function awards points for explanation length, causal language, situation references, rate spread, and option distinctness. An optimization loop that mutates prompts to maximize `gradeScenario()` scores will produce scenarios that are *long*, *use "because" frequently*, *mention outs and innings*, *have wide rate spreads*, and *use different first words* — without necessarily being good baseball teaching content.

**Specific dimensions vulnerable to Goodhart drift:**
1. **Explanation length** — gradeScenario penalizes explanations under 40 chars and under 2 sentences. An optimizer will push explanations toward verbosity, not clarity.
2. **Causal language** — The `allExplanationsCausal` Tier 2 check uses a regex for ~35 causal phrases. An optimizer will learn to sprinkle "because" and "which means" into every explanation regardless of whether the reasoning is sound.
3. **Rate spread** — The 30-point minimum spread between best and worst rates means the optimizer will learn to generate extreme rate arrays (e.g., 85/55/30/15) that mechanically pass but don't reflect genuine difficulty calibration.
4. **Situation references** — Section 2b of gradeScenario counts how many of 5 situation categories the best explanation mentions. The optimizer will learn to shoehorn unnecessary situation mentions into explanations.

**Mitigation for analyzeFailurePatterns():** Track not just whether scenarios pass/fail, but the *distribution* of gradeScenario deduction types over time. If the same deduction (e.g., `explanation_too_short`) drops to 0% across 100 scenarios while overall human-perceived quality stays flat, that's a Goodhart signal — the AI learned to game that specific check. The function should emit a `goodhart_risk` flag when any previously-common deduction type disappears without a corresponding improvement in the Critic's rubric score (from the multi-agent pipeline). The Critic operates on a different evaluation axis (6-dimension rubric) and is harder to game via text patterns alone.

**Blaine parallel (Vested/business thinking):** This is the same dynamic as optimizing for a business KPI that stops reflecting actual customer value. The fix is the same: use a lagging indicator (human review of a random 5% sample) as a check against the leading indicators (automated scores). Even 5 manually-reviewed scenarios per batch would catch Goodhart drift early.

---

### Idea 12: Position-Specific Failure Fingerprints Enable Targeted Prompt Mutations

The quality infrastructure already reveals that failures cluster by position (from audit data: batter 66%, pitcher 66%, manager 70%, baserunner 71% pass rates). But `analyzeFailurePatterns()` should go deeper — each position has a *characteristic failure mode* that maps to a specific prompt mutation.

**Position failure fingerprints (derived from QUALITY_FIREWALL check distributions):**

| Position | Dominant Failure Mode | Root Cause | Targeted Mutation |
|----------|----------------------|------------|-------------------|
| pitcher | `principleContradiction` — best answer has pitcher doing cutoff/relay | AI confuses pitcher's backup role with active relay role | Inject `KNOWLEDGE_MAPS.cutoffRelay` + explicit "pitcher NEVER cuts" line |
| batter | `positionActionBoundary` — 3+ batting options are swing variants | AI generates "swing at fastball" / "swing at curve" / "swing at slider" / "take the pitch" | Inject OPTION_ARCHETYPES with distinct strategic choices (approach, timing, contact type) |
| manager | `options_mix_decision_moments` — options span pre-game and in-game decisions | AI mixes "set the lineup" with "call for the steal" in one scenario | Add temporal constraint to prompt: "all options must be available at the SAME moment" |
| baserunner | `score_direction_mismatch` — trailing/leading confusion when runner is away team | Score convention [HOME, AWAY] consistently trips AI for baserunner in Top innings | Inject explicit "YOU are the [home/away] team" with score perspective in prompt |
| catcher | `brainBuntStealCheck` — recommends steal defense when bunt delta is favorable | AI defaults to "throw to second" instead of analyzing the run expectancy cost | Inject BRAIN.stats.buntDelta for the specific runner/out state into prompt |

**For analyzeFailurePatterns():** Instead of treating all failures equally, bucket them by position and firewall check name. Compute `failureRate[position][checkName]` across the batch. The highest-rate position-check combinations become the mutation targets. This is far more actionable than "12% of scenarios fail Tier 1" — it tells you *which prompt section to rewrite for which position*.

**Implementation detail:** The QUALITY_FIREWALL.validate() return already includes `check: name` in each failure object. gradeScenario returns `deductions` as an array of strings. Both are structured enough to aggregate. The key is that `analyzeFailurePatterns()` should return something like:
```js
{ topFailures: [
    { position: "pitcher", check: "principleContradiction", rate: 0.18, mutation: "inject_knowledge_map", mapKey: "cutoffRelay" },
    { position: "batter", check: "positionActionBoundary", rate: 0.14, mutation: "inject_option_archetypes", archetypeKey: "batter:*" },
  ],
  goodhartRisk: ["explanation_too_short"], // deductions that disappeared without quality improvement
  overallPassRate: 0.82,
  batchSize: 50
}
```

This structured output is what the prompt mutator needs to make surgical changes rather than shotgun-rewriting the entire system prompt.

---

## AutoResearch: generatePromptVariant() & buildAgentPromptWithVariant() — Blind Spots, Risks, and Missing Mutations (TPA)

**Date:** 2026-03-30 | **Reviewer:** Thought Partner Agent | **Scope:** Mutation isolation risks, position boundary safety, missing mutation types, cross-domain A/B testing insights for the prompt optimization loop

---

### Observation O13: Prompt Mutations Can Silently Weaken Position Boundary Hard Stops

The current `buildAgentPrompt()` has position safety distributed across THREE non-contiguous prompt sections: (1) `POSITION RULES` in Tier 1 (line 11069-11070, injected from `plan.principles`), (2) `POSITION-ACTION BOUNDARIES` in `qualityRules` (line 11104-11107, with `POS_ACTIONS_MAP` and `analyticsRules`), and (3) `principleContradiction` in QUALITY_FIREWALL Tier 1 (line 8716-8725, post-generation validation).

The risk: `generatePromptVariant()` must treat these three sections as a **frozen core** that no mutation can modify. But the current PROMPT_MUTATION_TYPES include `position_principle` and `knowledge_map_scope`, both of which map to `principleContradiction` and `positionActionBoundary` failures. If the mutator interprets "fix position_principle failures" as "relax the position_principle constraint in the prompt," it could weaken the very guard rails that prevent pitcher-doing-cutoff and catcher-leaving-home scenarios.

**Specific danger scenario:** `analyzeFailurePatterns()` reports that `principleContradiction` fires at 18% for pitcher. The mutator's intended fix is to inject `KNOWLEDGE_MAPS.cutoffRelay` to teach the AI the correct role. But an alternative (wrong) fix would be to soften the "pitcher NEVER cuts" language — maybe rewording it to "pitcher usually doesn't cut" — which reduces Tier 1 failures by making the firewall's regex less likely to match, while actually making scenarios worse.

**Recommended guard rail for `buildAgentPromptWithVariant()`:** Hard-code an immutable block containing: (a) all ROLE_VIOLATIONS regex source text as-is, (b) the `principleContradiction` check descriptions (pitcher never cutoff, catcher stays home, CF has priority, baserunner can't direct defense), (c) the `positionActionBoundary` structural rules. Wrap these in a `// FROZEN — mutations MUST NOT modify below this line` comment. The variant function should accept mutations as *additions* to the prompt (inject more knowledge, add emphasis, extend examples) but never as *substitutions* for the position safety sections. Think of it as an append-only mutation model for safety-critical prompt regions.

---

### Idea 13: Missing Mutation Types — "Decision Window Narrowing" and "Explanation Anchoring"

Two failure patterns in the current quality infrastructure have no corresponding mutation type in PROMPT_MUTATION_TYPES:

**A. Decision Window Narrowing (missing mutation).** The `options_mix_decision_moments` failure (Tier 2 — detected by `optionDecisionMoment`) fires when options span different moments in the play. Example: option A is a pre-pitch positioning choice while option B is a reaction-to-contact choice. The current MUTATION_TARGET_MAP routes this to `archetype_emphasis`, which injects OPTION_ARCHETYPES structural templates. But the root cause is not missing structure — it's that the AI doesn't understand *temporal framing*. A dedicated `decision_window` mutation type should inject: "All 4 options must be available to the player at the EXACT SAME MOMENT in the play. If the description says 'the ball is hit to you,' every option must be about what to do WITH the ball, not about where you should have been standing before the pitch." This is a constraint the archetype system cannot express because archetypes define roles (correct/kid_mistake/sounds_smart/clearly_wrong), not timing.

**B. Explanation Anchoring (missing mutation).** The `best_explanation_argues_for_wrong_option` deduction in `gradeScenario()` catches when the best answer's explanation discusses why another option is bad instead of why THIS option is good. But there's no mutation type that specifically teaches the AI to anchor explanations. The `explanation_guidance` mutation targets causal language and situation references — structural quality. What's missing is a `explanation_anchoring` mutation that injects: "Each explanation must START by naming the action in its option, then explain why that specific action succeeds or fails. The best answer explanation must contain the words from the best option text. Never write an explanation that could be swapped to a different option without anyone noticing." This directly attacks the AI's tendency to write generic explanations that aren't option-specific.

**Why these matter for the optimization loop:** Without `decision_window`, the loop will keep routing temporal confusion failures to archetype injection, which won't fix them. Without `explanation_anchoring`, explanation quality improvements will be structural (longer, more causal words) rather than semantic (actually about the right option). Both are cases where the failure-to-mutation mapping has a resolution mismatch — the suggested fix doesn't address the root cause.

---

### Idea 14: Mutation Isolation — Lessons from Multi-Armed Bandit A/B Testing (Cross-Domain)

**Cross-domain connection (A/B testing / experimentation platforms):** The "mutation isolation" problem in the AutoResearch loop is identical to the interaction effect problem in factorial experiment design. When Optimizely, LaunchDarkly, or Google's internal Vizier system run multiple experiments simultaneously, they face the same question: if you change two things at once and quality improves, which change caused it?

The standard solution in experimentation platforms is **layered experiments with holdbacks**: (1) each mutation operates on a different "layer" of the prompt (prefix, position rules, examples, explanation guidance, temperature), (2) only ONE mutation per layer changes at a time, (3) a holdback group runs the unmodified prompt as a control. The BSM prompt already has natural layers (Tier 1 identity, Tier 1.5 quality rules, Tier 2 baseball knowledge, Tier 3 examples, anti-repetition, player context, coach voice, prompt patch). `generatePromptVariant()` should enforce that each variant changes content in exactly ONE tier. Cross-tier mutations (e.g., changing both the system prefix AND the few-shot examples) make it impossible to attribute quality changes.

**Practical implementation for BSM:** The variant object should have a `layer` field:
```
{ mutationType: "explanation_guidance", layer: "quality_rules", delta: "...", parentVariant: "baseline" }
```
The optimization loop should maintain a variant tree: baseline -> variant_A (changed layer 1) -> variant_B (changed layer 2). When variant_A wins, it becomes the new baseline, and the next round tests a mutation on a DIFFERENT layer. This is a sequential one-at-a-time exploration strategy — slower than testing all mutations in parallel, but it produces interpretable results. At BSM's scale (not millions of scenarios per day), interpretability matters more than speed.

**The Thompson Sampling connection:** Google's Vizier uses Thompson Sampling (a multi-armed bandit algorithm) to allocate more traffic to winning variants without waiting for statistical significance. For BSM, this means: after generating 5 scenarios with variant A and 5 with baseline, if variant A's average grade is higher, allocate 7 of the next 10 generations to variant A. This converges faster than fixed 50/50 splits while still maintaining exploration. The key insight from the bandit literature is: you don't need to "finish" testing one mutation before starting the next — you just need to track which mutations are active in each generation and attribute quality scores back to the specific mutations that were present.

**Blaine parallel (Vested / business thinking):** This is the same principle as isolating variables in a sales process optimization. If you change the pitch deck AND the follow-up cadence simultaneously and close rates improve, you don't know which to keep. The discipline of changing one thing at a time feels slower but produces knowledge that compounds. Each prompt mutation that's validated in isolation becomes a permanent upgrade — you KNOW it works. Shotgun changes produce results you can never decompose.

---

### Idea 15: compareAndAdopt() Needs a "Dimension Stability" Check to Detect Goodhart Gaming (Cross-Domain)

**Date:** 2026-03-30 | **Source:** TPA research for compareAndAdopt() + formatCycleReport()

**The problem:** A naive `compareAndAdopt()` that compares `variant.avgScore > baseline.avgScore && variant.passRate >= baseline.passRate && variant.tier1FailRate === 0` will be gamed. The optimizer can produce a variant that scores higher by inflating easy-to-pass dimensions while silently degrading hard-to-measure ones. For example: a `wrong_answer_strategy` mutation could push all rate arrays to 90/60/30/10 (mechanically passing the 30-point spread check with headroom) while making the actual rate calibration less realistic.

**The fix — Dimension Stability Envelope:** `compareAndAdopt()` should compute a per-dimension delta between baseline and variant, not just the aggregate score. For each of the ~15 gradeScenario deduction categories, compute: `dimensionDelta[d] = variant.deductionRate[d] - baseline.deductionRate[d]`. If ANY dimension degrades by more than 10 percentage points (even if the aggregate improves), flag it as a `goodhart_suspect` and require a higher overall delta threshold to adopt (e.g., +5 instead of +2). This is directly from Idea 11's insight: track the distribution, not just the mean.

**Concrete implementation shape:**
```
compareAndAdopt(baselineAnalysis, variantAnalysis, mutation) {
  const delta = variantAnalysis.avgScore - baselineAnalysis.avgScore;
  const passRateDelta = variantAnalysis.passRate - baselineAnalysis.passRate;
  // Dimension stability: no single deduction category should spike
  const dimensionRegression = findDimensionRegressions(baselineAnalysis, variantAnalysis, threshold=10);
  const goodhartSuspect = dimensionRegression.length > 0;
  const adoptionThreshold = goodhartSuspect ? 5 : 2; // require higher delta if Goodhart suspected
  const adopt = delta >= adoptionThreshold
    && passRateDelta >= 0
    && variantAnalysis.tier1FailRate === 0
    && !hasNewTier1Failures(baselineAnalysis, variantAnalysis);
  return { adopt, delta, goodhartSuspect, dimensionRegression, reason: ... };
}
```

**Cross-domain connection (ML experiment frameworks):** Google Vizier and Meta's Ax both implement "guardrail metrics" — metrics that must NOT degrade even if the primary objective improves. In Vizier, you define `objective_metrics` (what to optimize) and `safety_metrics` (what must stay flat). `compareAndAdopt()` should treat Tier 1 fail rate, consistency rule violations, and position-specific pass rates as safety metrics. The variant only gets adopted if ALL safety metrics hold AND the objective metric (avgScore) improves. This is a direct port of Vizier's `SafetyChecker` concept to the BSM domain.

**Blaine parallel (Vested):** Same as monitoring churn alongside revenue growth. Revenue can go up while churn silently climbs — you feel great until the cohort data catches up. Dimension stability is the prompt optimization equivalent of watching retention alongside acquisition.

---

### Idea 16: Mutation Cooldown and Revert Memory — Preventing Oscillation Loops

**Date:** 2026-03-30 | **Source:** TPA research for compareAndAdopt() + formatCycleReport()

**The problem:** Without cooldown logic, the optimization loop can oscillate: Cycle 1 adopts `explanation_guidance` variant → Cycle 2's new failure patterns suggest `wrong_answer_strategy` → Cycle 3's failures point back to `explanation_guidance` → infinite loop where two mutation types trade off making each other's problems worse.

**The fix — Revert Memory with Exponential Cooldown:** Maintain a `revertLog` array: `[{mutationType, revertedAt: cycleN, reason, delta}]`. When `compareAndAdopt()` rejects a variant (delta < threshold or safety metric regression), log it. Before `analyzeFailurePatterns()` suggests the same mutation type again, check the revert log:

- If reverted in the last 1 cycle: BLOCK completely (cooldown)
- If reverted in the last 3 cycles: require 2x the normal adoption threshold
- If reverted 2+ times in the last 10 cycles: escalate to `oscillation_detected` flag in the cycle report — this mutation type needs a fundamentally different approach (probably a new mutation type, per Idea 13's missing mutations insight)

**Why exponential:** The first revert might be noise (small batch, unlucky scenario mix). The second revert of the same type within 10 cycles is a signal that this mutation axis is fighting against the grading function's structure. The third is proof that you need to change the mutation definition, not retry it.

**For formatCycleReport():** The report should include a "Mutation Health" section showing each mutation type's adoption history: `explanation_guidance: 3 tested / 1 adopted / 2 reverted (last revert: cycle 7, reason: tier1 regression)`. This makes oscillation patterns visible at a glance. Also include a `blockedMutations` list showing what's currently in cooldown and when it becomes eligible again.

**Cross-domain connection (reinforcement learning):** This is analogous to the "exploration penalty" in contextual bandits. After pulling an arm and getting a bad reward, you don't immediately re-pull the same arm — you reduce its selection probability proportional to recency and frequency of bad outcomes. The cooldown implements a deterministic version of this: hard block for 1 cycle, soft penalty for 3, structural re-evaluation after repeated failures.

---

### Observation O14: compareAndAdopt() Should Use Position-Stratified Comparison, Not Just Aggregate Scores

**Date:** 2026-03-30 | **Source:** TPA research for compareAndAdopt() + formatCycleReport()

**The blind spot:** If the test batch is 20 scenarios across 10 positions, and a variant improves pitcher scenarios by +15 points while degrading batter scenarios by -10 points, the aggregate avgScore goes up but the variant is actually harmful for batters. The current `analyzeFailurePatterns()` already groups by tier1/tier2/consistency but does NOT group by position. `compareAndAdopt()` inherits this blind spot.

**What compareAndAdopt() should require:** Before adopting, compute `positionPassRate[pos]` for both baseline and variant. If ANY position's pass rate drops by more than 15 percentage points, block adoption regardless of aggregate improvement. This catches the scenario where a mutation is great for its target position but toxic for others — which is exactly what will happen with `position_principle` and `knowledge_map_scope` mutations that inject position-specific content that might confuse the AI when generating for other positions.

**For formatCycleReport():** Include a position-level comparison table:
```
Position    | Baseline Pass% | Variant Pass% | Delta | Status
pitcher     |  72%           |  85%          | +13   | IMPROVED
batter      |  66%           |  58%          | -8    | REGRESSED (below threshold, but warning)
manager     |  70%           |  71%          | +1    | STABLE
baserunner  |  71%           |  74%          | +3    | IMPROVED
```
This makes position-level regressions impossible to miss in the report. It also connects to Idea 12's position-specific failure fingerprints — the report should show which position's fingerprint changed and in what direction.

**Why this matters for the loop's long-term health:** Prompt mutations are inherently position-biased. An `explanation_guidance` mutation that says "reference the specific game situation in every explanation" helps fielding scenarios (where the situation is concrete: runner on 2nd, ground ball hit) but hurts manager scenarios (where the situation is abstract: 6th inning decision about bullpen). Without position stratification, the loop will unconsciously optimize for whichever positions dominate the test batch, slowly degrading the minority positions until someone notices in manual review.

---

### Idea 17: Successive Halving for Budget-Efficient Variant Evaluation (Cross-Domain)

**Date:** 2026-03-30 | **Source:** TPA research for runAutoResearchCycle() cost analysis

**The problem:** The default config of 10 scenarios x 12 positions x 4 groups = 480 API calls per cycle is expensive. Using the multi-agent Claude Opus pipeline (~$0.15/scenario) costs ~$72/cycle, blowing a $200 budget in under 3 cycles. Even the xAI fallback at ~$0.019/scenario costs ~$9/cycle — manageable but wasteful when most variants are duds.

**The fix — Successive Halving (Hyperband):** Borrow from Optuna/Ray Tune's ASHA scheduler. Instead of evaluating every variant with the full 10-scenarios-per-position budget:
- **Round 1 (Triage):** Generate 3 scenarios per position for ALL variants (~144 calls). Score each variant. Kill any variant scoring below baseline - 5 points (clearly bad). Cost: ~30% of full budget.
- **Round 2 (Confirm):** Generate 7 more scenarios per position for surviving variants only (~168 calls for 2 survivors). Now you have 10 total per position for winners. Cost: ~35% of full budget.
- **Savings:** If 2 of 3 variants are duds (common), Round 1 kills them early. Total cost: ~312 calls instead of 480 (35% savings). If ALL 3 variants survive (rare), cost is the same as exhaustive.

**Why 3 scenarios is enough for triage:** With 3 scenarios per position across 12 positions = 36 graded scenarios per variant. At n=36, you can detect a 10-point avgScore difference with >80% confidence. You can't confirm a 3-point improvement, but you CAN confidently reject a variant that's 15 points worse — and those are the ones you're trying to kill early.

**Realistic default config recommendation:** 5 scenarios x 6 positions (weakest: pitcher, batter, manager, baserunner, catcher, shortstop) x 3 groups = 90 calls for triage round. Promotes 1-2 survivors to full 10-scenario evaluation on all 12 positions. Total: 90 + ~120 = ~210 calls. At xAI rates: ~$4/cycle. At Claude Opus rates: ~$31.50/cycle. Both comfortably under $200 for multiple cycles.

**Cross-domain connection (Optuna):** Optuna's `SuccessiveHalvingPruner` does exactly this for hyperparameter sweeps. It allocates a "rung" of resources (here: scenarios) and prunes the bottom performer at each rung. The mathematical insight is that relative ranking is stable even at low sample sizes — you don't need precise scores to identify the worst candidate, just enough signal to rank. BSM's grading function (35 QUALITY_FIREWALL checks + 15 CONSISTENCY_RULES) produces a rich enough signal that 3 scenarios per position gives meaningful separation.

**For runAutoResearchCycle():** The function should accept a `pruningStrategy: "exhaustive" | "successive_halving"` config. Default to successive_halving. The cycle report should show which variants were pruned at which round and their scores at pruning time, so you can verify the pruner isn't killing promising variants too early.

---

### Idea 18: Pin AutoResearch to a Single Pipeline — Treat Pipeline Choice as a Controlled Variable

**Date:** 2026-03-30 | **Source:** TPA research for runAutoResearchCycle() pipeline analysis

**The problem:** `generateAIScenario()` has a 3-tier fallback chain: Claude Opus multi-agent -> xAI agent pipeline -> xAI standard pipeline. If AutoResearch tests a prompt variant and the first scenario hits Claude Opus while the second falls through to xAI due to a transient timeout, the grading signal is contaminated. You're measuring prompt quality + pipeline noise simultaneously. The multi-agent pipeline applies server-side RAG, Vectorize lookups, and a 4-stage Planner->Generator->Critic->Rewriter flow that transforms the prompt in ways the client can't observe. A prompt mutation that improves the xAI agent pipeline might be irrelevant or harmful to the multi-agent pipeline because the Planner rewrites the user's prompt anyway.

**The fix:** `runAutoResearchCycle()` should pin all generation to a single pipeline by passing a `pipelineOverride` parameter. The cleanest approach: call `generateWithAgentPipeline()` directly (bypassing the fallback chain in `generateAIScenario()`), since that's the pipeline where prompt mutations have the most direct effect — the user prompt goes straight to grok-4 without server-side rewriting. If the call fails, log the failure and skip that scenario (don't fall through to another pipeline). This means some scenarios will fail to generate, which is fine — the analysis just uses a smaller n for that position.

**Why NOT test against multi-agent:** The multi-agent pipeline's Planner stage rewrites the user prompt based on Vectorize RAG results. A prompt mutation changing "always reference the game situation" gets absorbed and potentially overwritten by the Planner. You'd be measuring Planner behavior, not prompt quality. Save multi-agent testing for a separate evaluation: once a mutation is adopted into the xAI pipeline, run a one-time comparison against multi-agent to see if it also helps there.

**For the code:** `generateWithAgentPipeline()` already accepts all the needed parameters (line 11988). AutoResearch can call it directly, injecting the variant's mutated prompt text via the `flaggedAvoidText` parameter (which is already a string concatenated into the agent prompt). The function returns `null` on failure, making error handling trivial.

**Rate limit handling:** If a 429 hits mid-cycle, the function should: (1) log the partial results collected so far, (2) compute a `partialConfidence` score based on n/target_n, (3) if partialConfidence > 0.6 (got at least 60% of planned scenarios), run the analysis on what you have, (4) if < 0.6, save the partial state to a checkpoint object and return a `INCOMPLETE` status so the caller can resume later. The checkpoint should include: `{cycleId, completedPositions: [], partialPositions: {pos: scenarios[]}, remainingVariants: [], elapsedBudget}`.

---

### Observation O15: The 480-Call Default Is Based on Statistical Overkill — 90 Calls Gives Equivalent Signal for Variant Ranking

**Date:** 2026-03-30 | **Source:** TPA research for runAutoResearchCycle() budget math

**The math:** The AutoResearch loop doesn't need to estimate each variant's exact avgScore — it needs to RANK variants relative to baseline. Ranking requires less data than estimation. With a grading function that scores 0-100 and typical standard deviation of ~15 points across scenarios, detecting a meaningful difference (delta > 5 points) between two groups requires n >= (2 * 15^2 * 7.85) / 5^2 = ~28 scenarios per group (alpha=0.05, power=0.8, two-sided t-test). That's 28 per variant, not 28 per position per variant.

**Implication:** You need ~28 scored scenarios per variant to make a statistically meaningful comparison. With 12 positions, that's ~2.3 scenarios per position — round up to 3. The "10 scenarios per position" config (120 per variant) is 4x more than needed for ranking decisions. It's appropriate for detailed position-level analysis (per Observation O14) but overkill for the adopt/reject decision.

**Recommendation for config defaults:**
- `scenariosPerVariant: 36` (3 per position x 12 positions) for triage/ranking
- `scenariosPerVariant: 120` (10 per position x 12 positions) for deep analysis of the winning variant only
- Total calls per cycle with successive halving: ~108 (triage) + ~120 (deep analysis of winner) = ~228
- At xAI rates: ~$4.30/cycle. At Claude Opus rates: ~$34/cycle. Budget supports 5-46 cycles at $200.

**Why this matters:** The difference between "good enough to rank" and "good enough to characterize" is a 4x cost multiplier. The loop should use cheap ranking to pick winners, then invest in expensive characterization only for the winner. This is exactly how tournament selection works in genetic algorithms — cheap comparisons to narrow the field, expensive evaluation only for finalists.

**Blaine parallel (Vested):** Same principle as lead qualification. Don't run a full discovery call (expensive) on every inbound lead. Run a 2-minute qualification screen (cheap) to filter, then invest the full hour only in qualified leads. The qualification screen doesn't need to be perfect — it just needs to reliably identify the bottom 50% for rejection.

---

## AutoResearch: D1 Persistence & Dashboard Analytics — TPA Analysis (2026-03-30)

**Date:** 2026-03-30 | **Reviewer:** Thought Partner Agent | **Scope:** What analytics the dashboard needs, mutation effectiveness tracking, data retention policy, cross-domain lessons from ML experiment dashboards (W&B, MLflow)

---

### Idea 19: Mutation Effectiveness Leaderboard — The Single Most Valuable Dashboard View

**The question:** Should the dashboard show which mutation types have been most/least effective historically?

**Answer: Yes, and it should be the PRIMARY view.** Every ML experiment dashboard (Weights & Biases, MLflow, Optuna) centers on a "runs table" that shows each experiment's configuration alongside its outcome metrics. For AutoResearch, the equivalent is a mutation leaderboard ranked by cumulative impact.

**Schema design for the `autoresearch_mutations` D1 table:**
```sql
CREATE TABLE autoresearch_mutations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_id TEXT NOT NULL,
  mutation_type TEXT NOT NULL,      -- e.g. "explanation_guidance", "wrong_answer_strategy"
  layer TEXT,                        -- prompt layer that was modified
  parent_variant TEXT DEFAULT 'baseline',
  delta_avg_score REAL,             -- variant avgScore - baseline avgScore
  delta_pass_rate REAL,             -- variant passRate - baseline passRate
  adopted INTEGER DEFAULT 0,        -- 1 if compareAndAdopt() said yes
  reverted INTEGER DEFAULT 0,       -- 1 if later reverted
  goodhart_suspect INTEGER DEFAULT 0,
  dimension_regressions TEXT,       -- JSON array of regressed dimensions
  scenarios_evaluated INTEGER,
  position_deltas TEXT,             -- JSON: {pitcher: +5, batter: -3, ...}
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_mutations_type ON autoresearch_mutations(mutation_type);
CREATE INDEX idx_mutations_cycle ON autoresearch_mutations(cycle_id);
```

**The leaderboard query:**
```sql
SELECT mutation_type,
  COUNT(*) as times_tested,
  SUM(adopted) as times_adopted,
  SUM(reverted) as times_reverted,
  AVG(delta_avg_score) as avg_impact,
  MAX(delta_avg_score) as best_impact,
  MIN(delta_avg_score) as worst_impact,
  AVG(CASE WHEN adopted=1 THEN delta_avg_score END) as avg_when_adopted
FROM autoresearch_mutations
GROUP BY mutation_type
ORDER BY avg_impact DESC;
```

**What this tells you at a glance:** "explanation_guidance has been tested 8 times, adopted 3 times, reverted once, with average impact of +4.2 points. wrong_answer_strategy has been tested 5 times, adopted 0 times, average impact of -1.8 points — stop testing it." This is the single highest-leverage view for deciding where to invest optimization effort.

**Cross-domain connection (Weights & Biases):** W&B's "Parallel Coordinates" plot shows every hyperparameter on a vertical axis with lines connecting each run's configuration to its outcome. The BSM equivalent: each mutation type is an axis, each cycle is a line, the rightmost axis is avgScore. Lines that trend upward from a specific mutation type visually confirm that mutation's positive impact. This could be rendered as a simple multi-line chart in the dashboard: X-axis = cycle number, Y-axis = avgScore, one line per active mutation type. Lines that diverge upward from baseline are winners. Lines that dip below are losers. You can build this with a `<canvas>` or even SVG in ~40 lines.

---

### Idea 20: Dashboard Minimum Viable Display — Steal from MLflow's Run Comparison Page

**The question:** What is the minimum viable dashboard display for prompt optimization decisions?

**Cross-domain analysis (MLflow, W&B, Optuna):** All three converge on the same 4-panel layout for experiment monitoring:

1. **Objective Curve** (top-left): A time-series line chart showing the primary metric (avgScore) over cycles. MLflow calls this "Metric History." Overlays baseline as a horizontal reference line. This answers: "Is the system improving over time?"

2. **Configuration Diff** (top-right): For the most recent cycle, a side-by-side comparison of baseline vs. variant prompt text (like a git diff). This answers: "What exactly changed?" W&B's "Diff" tab does this for model configs. For BSM, this is the mutated prompt section with additions highlighted.

3. **Leaderboard Table** (bottom-left): The mutation effectiveness table from Idea 19. This answers: "Which levers are working?" MLflow's "Compare Runs" table with sortable columns.

4. **Position Breakdown** (bottom-right): A heatmap or bar chart showing per-position pass rates for the current cycle. Green = improved, yellow = stable, red = regressed. This answers: "Is the improvement broad or narrow?" Directly implements Observation O14's recommendation.

**What you do NOT need (common dashboard bloat):** Loss curves (irrelevant — this is not gradient descent), epoch/step tracking (cycles are atomic), GPU utilization (N/A), model checkpoints (the "model" is a prompt string). Strip these and the dashboard is remarkably simple: 1 line chart, 1 diff view, 1 table, 1 heatmap. Could be a single HTML page served from the worker with D1 queries.

**Schema for the `autoresearch_cycles` D1 table (stores each cycle's summary):**
```sql
CREATE TABLE autoresearch_cycles (
  id TEXT PRIMARY KEY,              -- e.g. "cycle_2026-03-30_001"
  baseline_avg_score REAL,
  baseline_pass_rate REAL,
  variant_avg_score REAL,
  variant_pass_rate REAL,
  variant_mutation_type TEXT,
  adopted INTEGER DEFAULT 0,
  position_breakdown TEXT,          -- JSON: {pitcher: {baseline: 72, variant: 85}, ...}
  dimension_breakdown TEXT,         -- JSON: per-deduction-category rates
  config_json TEXT,                 -- full cycle config (scenarios_per_pos, positions, etc.)
  cost_usd REAL,                   -- estimated API cost for the cycle
  duration_seconds INTEGER,
  report_text TEXT,                 -- formatCycleReport() output for human reading
  created_at TEXT DEFAULT (datetime('now'))
);
```

**Endpoint design:** A single `GET /admin/autoresearch/dashboard` route (admin-key protected) that returns the last 20 cycles, the mutation leaderboard, and the current active prompt variant. The frontend can be a static HTML page with inline JS that fetches this JSON and renders the 4 panels. No React needed — this is an admin tool, not a user-facing feature.

---

### Observation O16: Data Retention Policy — 90-Day Rolling Window with Milestone Snapshots

**The question:** Should old cycles be purged after N months?

**Analysis:** D1 free tier allows 5GB storage. Each cycle row is ~2-4KB (mostly JSON blobs for position/dimension breakdowns). At 1 cycle/day, that is ~120KB/month or ~1.4MB/year. Storage is not the constraint. The constraint is **query performance and dashboard noise** — a dashboard showing 365 data points on the objective curve is cluttered and makes recent trends hard to see.

**Recommended policy:**
- **Last 90 days:** Keep full detail (every cycle, every mutation test, every position breakdown). This is the active optimization window.
- **90-365 days:** Compress to weekly summaries. A scheduled cron (Cloudflare Cron Trigger, already available in Workers) aggregates each week's cycles into a single `autoresearch_weekly_summary` row: best score that week, adopted mutations, position highlights. Delete the individual cycle rows.
- **365+ days:** Compress to monthly summaries. Same pattern.
- **Milestone snapshots:** NEVER delete a cycle where a mutation was adopted (it changed the baseline). These are the "inflection points" in the optimization history. Tag them with `milestone=1` and exclude from purging. This lets you reconstruct the full evolution of the prompt: baseline -> adopted mutation 1 -> adopted mutation 2 -> ... -> current state.

**Implementation:** A weekly cron trigger (`"triggers": {"crons": ["0 6 * * 1"]}` in wrangler.toml — already supported) runs a D1 query:
```sql
-- Aggregate cycles older than 90 days into weekly summaries
INSERT INTO autoresearch_weekly_summary (week_start, ...)
SELECT strftime('%Y-%W', created_at), AVG(variant_avg_score), ...
FROM autoresearch_cycles
WHERE created_at < datetime('now', '-90 days') AND milestone = 0
GROUP BY strftime('%Y-%W', created_at);

-- Then purge the originals
DELETE FROM autoresearch_cycles
WHERE created_at < datetime('now', '-90 days') AND milestone = 0;
```

**Cross-domain connection (Weights & Biases):** W&B keeps runs forever (they charge for storage). MLflow community edition has no automatic cleanup. Optuna's RDB storage grows unbounded. All three suffer from "experiment graveyard" syndrome — thousands of old runs that nobody looks at but slow down the UI. BSM should learn from this and build retention into the schema from day one. The 90-day window is borrowed from observability platforms (Datadog, Grafana) that have solved the "infinite time series" problem: keep recent data at full resolution, compress old data into summaries, never delete inflection points.

**Blaine parallel (Vested/business):** Same as CRM data hygiene. Keep the last 90 days of activity detail for active pipeline management. Compress older data into quarterly summaries for trend analysis. Never delete closed-won records (milestones). The CRM that keeps every email ever sent becomes unusable; the CRM that purges everything loses institutional memory. The middle path is time-bucketed compression with milestone preservation.

---

## AutoResearch Baseline: Expected Differences, Statistical Caveats, and Drift Alarms (TPA)

**Date:** 2026-03-30 | **Reviewer:** Thought Partner Agent | **Scope:** First AutoResearch baseline run — what to expect, statistical traps, canary test design, baseline drift detection

---

### Idea 21: Handcrafted vs. AI Baseline Gap — Expected Direction and Why

**The prediction:** Handcrafted scenarios will score HIGHER on the grading rubric than AI-generated scenarios, but by a SMALLER margin than most people assume.

**Why handcrafted scores higher:**
1. **Survivorship bias.** The 644 handcrafted scenarios have been through 4 audit rounds (72.6% -> 80.3% -> 88.4% -> 94.6% projected) with 1,268 quality fixes applied during the Gold Standard push. They have been human-reviewed, FIREWALL-validated, and refined. They represent the output of a polishing process, not a first draft. AI scenarios are first drafts that pass a quality gate — they have never been manually reviewed by a domain expert.
2. **Explanation specificity.** The audit insights doc identifies `explanationQuality` as the critical dimension (6.95 avg, 2x weight). Handcrafted explanations were individually written to teach specific concepts with specific references to the game situation. AI explanations tend toward generic causal reasoning ("because the runner is fast" vs. "because with a 1.35s delivery time and 2.00s pop time, the catcher's 3.35s total gives the runner a 0.20s window").
3. **Rate calibration.** Handcrafted rates (success percentages for each option) were tuned during audits to reflect real baseball outcomes. AI rates tend toward mechanical patterns: best=85, acceptable=55, bad=25, worst=10 (the OPTION_ARCHETYPES push this structure). The gradeScenario deduction for "rates don't reflect realistic baseball" hits AI scenarios harder.

**Why the gap is smaller than expected:**
1. **The grading function was built FOR AI.** The 35 QUALITY_FIREWALL checks, 15 CONSISTENCY_RULES, and gradeScenario deductions were designed to catch AI failure patterns. They are optimized to detect AI's specific weaknesses. Running handcrafted scenarios through this same grading function will surface issues in the HANDCRAFTED corpus that human review overlooked — particularly structural checks like "count format matches X-Y pattern" or "score-inning perspective consistency" that humans are bad at verifying manually.
2. **Some handcrafted scenarios are pre-audit quality.** Not all 644 scenarios were touched by all 4 audit rounds. Scenarios added in early phases may have stale explanations, missing explSimple fields, or inconsistent rate spreads. The grading function will penalize these just as harshly as AI scenarios.
3. **Multi-agent scenarios (Claude Opus) pass a 9.5/10 server-side critique with a 31-item checklist.** These are not naive AI outputs — they have been through their own audit pipeline. The gap between "4-round human-audited handcrafted" and "9.5/10 multi-agent critiqued AI" is narrower than the gap between "handcrafted" and "raw LLM output."

**Expected scores (prediction for the baseline run):**
- Handcrafted corpus avgScore: 78-85 / 100 (gradeScenario scale)
- AI corpus (multi-agent) avgScore: 70-78 / 100
- AI corpus (xAI agent) avgScore: 62-72 / 100
- AI corpus (xAI standard) avgScore: 55-68 / 100
- Gap: 8-15 points between handcrafted and best AI pipeline

**The key insight for Blaine:** The baseline establishes WHERE each pipeline sits, not whether AI is "good enough." A 10-point gap that narrows to 5 over 10 optimization cycles is a clear signal that the AutoResearch loop is working. A gap that stays at 10 after 10 cycles means the mutation types are wrong or the grading function has a ceiling effect.

---

### Observation O17: Statistical Caveats for the First Baseline — The "Control" Is Not What You Think

**Caveat 1: The grading function IS the metric, not an oracle.**
gradeScenario() applies ~35 deductions based on structural rules (rate spread, count format, score perspective, causal language regex, etc.). It does NOT measure educational effectiveness, kid engagement, or actual learning outcomes. A scenario scoring 90/100 on gradeScenario might bore a 10-year-old. A scenario scoring 65/100 (penalized for short explanations and mechanical rates) might be the one that teaches the concept most effectively. The baseline measures "conformance to the quality rubric," which is a proxy for quality, not quality itself. Be careful about optimizing the proxy so hard that you lose sight of the actual goal (kids learning baseball strategy). This is literally Goodhart's Law applied to educational content.

**Caveat 2: Small sample sizes per position make per-position comparisons unreliable.**
With 644 handcrafted scenarios across 15 categories, some positions have only 21 scenarios (famous) or 27 (secondBase, shortstop). Running gradeScenario on 21 scenarios produces a confidence interval of roughly +/- 8 points (at 95% CI, assuming sigma=15). That means a "famous" avgScore of 75 is really "somewhere between 67 and 83." Comparing that to an AI batch of 10 famous scenarios (CI +/- 12 points) is comparing two wide distributions. You cannot reliably say "AI is worse at famous scenarios" with n=10 vs n=21. You CAN reliably compare the aggregate across all positions (n=644 vs n=whatever the AI batch is), but position-level claims need at least 30 scenarios per position per group.

**Caveat 3: Pipeline confounding in the AI corpus.**
If the AI corpus includes scenarios from multi-agent, agent, AND standard pipelines mixed together, the baseline is actually a BLEND of three quality levels. The "AI baseline" would be pulled upward by multi-agent and dragged down by standard. Future cycles that happen to hit more multi-agent scenarios (due to Claude availability) will appear to improve even if the prompts are identical. Fix: tag every AI scenario with its pipeline source and compute separate baselines per pipeline. This is analogous to the problem identified in Idea 18 — pipeline choice is a confounding variable.

**Caveat 4: Temporal confounding in the handcrafted corpus.**
The 644 handcrafted scenarios were not all written at the same time or by the same process. Early scenarios (from the original 623) may have different quality characteristics than the 21 added later. The grading function applies uniformly, but the corpus is not uniform. If the first baseline shows a bimodal distribution (cluster at 85 and another at 65), that is likely an artifact of pre-audit vs post-audit scenarios, not a meaningful quality signal.

**Caveat 5: The "pass rate" metric hides distribution information.**
If 80% of handcrafted scenarios pass and 65% of AI scenarios pass, the tempting conclusion is "handcrafted is better." But what if handcrafted has a tight distribution (most at 75-80) while AI has a bimodal one (40% at 85+ and 25% at 50-)? The AI corpus might have MORE top-tier scenarios AND more failures. The mean and pass rate hide this. Always look at the histogram, not just the summary stats. This connects directly to Idea 15's "dimension stability" concept — aggregate metrics mask important distributional information.

---

### Idea 22: Baseline Drift Alarm — A "Canary Test Suite" for Prompt Regression Detection

**The problem:** Once the baseline is established and optimization cycles begin, the control (unmodified prompt) needs to be re-measured periodically. Without this, you cannot distinguish "the variant improved" from "the grading function drifted" or "the LLM model updated silently." OpenAI and Anthropic both update model behavior between versions (sometimes even within a version via RLHF updates). xAI does the same with Grok. A prompt that scored 75/100 in March might score 70/100 in April with zero prompt changes because the model shifted.

**The canary test concept (from ML/SRE):** Google's ML infrastructure uses "canary models" — a frozen model that processes a fixed test set every deployment. If the canary's accuracy drops below threshold, the deployment is halted. The equivalent for BSM: a fixed set of 15-20 "canary scenarios" (one per position category + a few extras for weak positions) with known expected scores.

**Design:**
1. **Select 15-20 canary scenarios** from the handcrafted corpus. Choose scenarios that scored 80+ on gradeScenario in the baseline run. These are "known good" — any future score drop is a signal, not noise.
2. **Run the canary set through gradeScenario every cycle** (zero cost — no API calls, just local grading). If the handcrafted canary avgScore drops by more than 5 points from the original baseline, something changed in the grading function. Investigate before interpreting any variant results. This takes <1 second to compute.
3. **Run the canary PROMPTS through the AI pipeline once per week** (moderate cost — 15-20 API calls). Use the same positions, same target concepts, same difficulty. Compare the AI canary output scores to the original AI baseline. If they drop by more than 8 points with zero prompt changes, the LLM model behavior shifted. Log this as `model_drift_detected` and adjust the baseline accordingly.

**Threshold recommendations:**
- Handcrafted canary drift > 5 points: HALT — grading function changed (code bug or intentional rubric update)
- AI canary drift > 8 points: WARNING — model behavior may have shifted, re-run full baseline before next optimization cycle
- AI canary drift > 15 points: HALT — model has fundamentally changed, old baseline is invalid, start a new baseline run
- Variant delta < canary drift: INVALID — the "improvement" is within the noise floor of model drift

**Why 5/8/15 thresholds:** The handcrafted canary should be near-zero drift (same inputs, same grading code, deterministic). A 5-point drift means a code change or scoring bug. The AI canary has inherent variance from LLM non-determinism (temperature, sampling). At temperature=0.6 (typical for generation), repeated generations of the same prompt produce scores with sigma ~5-8 points. An 8-point drift is ~1 sigma — could be noise, worth investigating. A 15-point drift is ~2 sigma — almost certainly a real shift.

**Cross-domain parallel (SRE/DevOps):** This is identical to "golden signal monitoring" in production systems. You don't wait for users to report that the site is slow — you run synthetic transactions (canary requests) every minute and alert when latency exceeds the baseline. The canary doesn't need to be representative of all traffic; it needs to be STABLE so that any change in its signal is a meaningful alert.

**Cross-domain parallel (ML teams):** Every serious ML team maintains a "regression test set" — a frozen dataset with known correct labels. After every model retrain, the regression set is scored. If accuracy drops on the regression set, the retrain is suspect even if the overall validation accuracy improved. The regression set catches overfitting to the validation distribution and underfitting to edge cases. BSM's canary scenarios serve the same purpose: they catch prompt mutations that improve average quality while breaking specific known-good scenarios.

**Blaine parallel (Vested):** This is the same principle as checking your best client's renewal rate separately from overall retention. If your top 10 clients are all renewing, overall churn can fluctuate without panic. If a top client churns, that is a red alert regardless of what the aggregate says. The canary scenarios are your top clients — monitor them separately.

---

### Observation O18: The Baseline Must Capture BOTH Score Distribution AND Failure Mode Distribution

**What most baselines miss:** The typical ML baseline captures mean/median/percentile of a single metric. But for AutoResearch, the PATTERN of failures matters as much as the aggregate score. Two corpora with identical avgScore=75 and passRate=80% can have completely different failure profiles:

- Corpus A: fails on `explanationCausal` (40% of failures), `rateSpreadRealistic` (30%), everything else clean
- Corpus B: fails on `positionActionBoundary` (50% of failures), `scoreInningPerspective` (25%), with scattered other failures

Corpus A has a writing quality problem. Corpus B has a structural/factual problem. The optimization strategy is completely different. If the baseline only records avgScore=75, this distinction is lost.

**What the baseline report must include:**
1. avgScore and passRate (the headline metrics)
2. Score histogram (10-point buckets: 0-10, 10-20, ..., 90-100) — shows distribution shape
3. Per-position avgScore and passRate — identifies weak positions
4. Failure mode frequency table: for each gradeScenario deduction and FIREWALL check, how often it fires — identifies the dominant quality problems
5. Tier 1 vs Tier 2 vs Consistency failure breakdown — distinguishes "hard fail" from "quality warning"
6. Top 5 most common deduction strings (verbatim) — gives concrete examples for prompt mutation targeting

This is the "failure fingerprint" that the optimization loop compares against. If a variant changes the fingerprint (shifts failures from explanationCausal to positionActionBoundary), that is a regression even if avgScore holds steady. The fingerprint should be the PRIMARY comparison metric, with avgScore as a summary statistic.

**Implementation for `formatCycleReport()`:** The report should have a "Failure Fingerprint" section that visualizes the deduction frequency as a horizontal bar chart (ASCII is fine for a text report):
```
explanationCausal:      ████████████████████ 22%
rateSpreadRealistic:    █████████████ 14%
scoreInningPerspective: █████████ 9%
positionActionBoundary: ██████ 6%
...
```
Compare baseline fingerprint to variant fingerprint side-by-side. Highlight any deduction that moved more than 5 percentage points. This is the most actionable section of the report — it tells you exactly what the mutation fixed and what it might have broken.

---

## AutoResearch Cycle 1: Mutation Selection, Sample Size, and Position Strategy — TPA Analysis (2026-03-30)

**Date:** 2026-03-30 | **Reviewer:** Thought Partner Agent | **Scope:** First real optimization cycle planning based on Step 7 baseline results (avgScore 67.9, passRate 52%, top failures: explanation_few_sentences 171x, concept_missing_why 92x, description_missing_decision_prompt 81x)

---

### Idea 23: The Top 3 Mutations Should Target the Three Failure Modes Independently, Not Use the Weighted Suggestion Ranking

**Date:** 2026-03-30 | **Source:** TPA analysis of Step 7 baseline failure distribution

**The baseline tells a clear story:** 67.9 avg score with 52% pass rate means roughly half of AI-generated scenarios fail quality checks. The top 3 failures are:
- `explanation_few_sentences` (171x) — each scenario has 4 explanations, so this fires on ~43% of all explanations. The gradeScenario check at line 743 of `src/06_ai_pipeline.js` deducts 5 points per explanation with fewer than 2 sentences. This is the single biggest score drag.
- `concept_missing_why` (92x) — the concept field lacks causal language (no "because", "so that", "to prevent", etc.). 92% of scenarios hit this. 5-point deduction each.
- `description_missing_decision_prompt` (81x) — the description's last sentence does not contain a decision prompt phrase ("what should you do?", "your call", etc.). 81% of scenarios. 5-point deduction each.

**The 3 highest-probability mutations, in order:**

**1. `few_shot_examples` (NOT coaching_line_rules as the automated suggestion recommends).** The few-shot example is the single most powerful lever for structural compliance because the AI mimics the example's format. If the few-shot example has 2-3 sentence explanations, a causal concept, and a decision-prompt description ending, the AI will reproduce all three patterns. One mutation fixes all three top failures simultaneously. The current few-shot may have short explanations or missing decision prompts — updating it to be a "golden example" that passes every gradeScenario check would propagate formatting compliance across all generated scenarios. Weight this highest because it has the widest blast radius with the lowest token cost increase.

**2. `explanation_guidance` (targeted at the specific sentence-count and anchoring rules).** This adds explicit instructions about explanation length and structure. The current agent prompt at line 2376 says "Every explanation must be 1-3 sentences" and the standard prompt at line 3404 says "2-4 sentences." The grader penalizes at <2 sentences. The mismatch between the instruction ("1-3") and the grader threshold (">=2") means the AI sometimes writes 1-sentence explanations believing it is compliant. The mutation should change the prompt to say "Every explanation must be 2-3 sentences. One sentence is NEVER enough." This is a surgical fix: change one number, fix 171 deductions.

**3. `system_prefix` (add a formatting preamble that establishes the concept-why and decision-prompt patterns).** A system prefix line like "Your concept field must explain WHY using causal language. Your description must end with a question asking the player what to do." primes the model before it sees the full prompt. This targets concept_missing_why and description_missing_decision_prompt specifically. Token cost: ~30 tokens. Risk: near zero.

**Why NOT coaching_line_rules first (the #1 automated suggestion at weight 92):** coaching_line_rules adds coaching voice guidance, banned phrases, and explanation style rules. It is a LARGE injection (~200-400 tokens). It addresses explanation quality (voice, specificity) but does NOT directly address the top 3 structural failures. A scenario can have perfect coaching voice and still fail for 1-sentence explanations, missing causal concept, and no decision prompt. coaching_line_rules optimizes for quality AFTER the structural floor is met. The structural floor is where 48% of scenarios currently fail. Fix the floor first.

**Cross-domain parallel (Vested/business):** This is triage. When 48% of your pipeline is failing at a structural checkpoint, you do not invest in improving the quality of the 52% that passes. You fix the checkpoint failure first, then raise the quality bar. Same as Blaine's principle: "fix the leak before you optimize the funnel."

---

### Idea 24: coaching_line_rules Token Budget Risk — The "Prompt Bloat Timeout" Problem

**Date:** 2026-03-30 | **Source:** TPA risk analysis for Cycle 1 mutation selection

**The risk is real but quantifiable.** The current agent prompt (built by `buildAgentPrompt()`) is already long — it includes position rules, knowledge maps, OPTION_ARCHETYPES, few-shot examples, quality rules, coaching voice, real game feel injection, and error reinforcement. Adding coaching_line_rules injects banned phrases, voice examples, and structural rules. Estimated additional tokens: 200-400.

**Current token budget math:**
- xAI grok-4 context window: 131,072 tokens
- Typical agent prompt: ~3,000-4,000 tokens (estimated from the concatenated sections)
- max_tokens for response: 1,800 tokens
- Headroom: ~125,000 tokens — no risk of context overflow

**But the timeout risk is not about context length — it is about generation latency.** Longer prompts increase time-to-first-token (TTFT) because the model must process more input. For grok-4 at the xAI API, TTFT scales roughly linearly with prompt length. A 400-token prompt increase (~10% of current prompt) adds ~1-2 seconds to TTFT. With the worker timeout at 55s and AI_BUDGET at 120s, this is within margin.

**The REAL risk:** coaching_line_rules adds complexity to the generation task (more constraints = more reasoning = more output tokens = longer generation). If the AI tries harder to satisfy coaching voice rules, it may generate longer explanations (good for sentence count, bad for token budget). At 1,800 max_tokens, a scenario with 4 verbose explanations can hit the token ceiling and get truncated, producing invalid JSON. This is the failure mode to watch.

**Mitigation:** If coaching_line_rules is tested in a later cycle, monitor the `parse_error` rate alongside quality scores. If parse errors spike above 5%, the prompt is pushing the model past its max_tokens budget. The fix would be to increase max_tokens to 2,200 or to trim elsewhere in the prompt.

**Bottom line:** coaching_line_rules is safe from a timeout perspective but carries moderate risk of JSON truncation. Test it in Cycle 2 after the structural floor is fixed, not in Cycle 1.

---

### Observation O19: Run Cycle 1 Against the 3 Weakest Positions Only — Full-Position Testing Is Wasteful at This Stage

**Date:** 2026-03-30 | **Source:** TPA analysis of position-level baseline results and Idea 17 (successive halving)

**The baseline per-position data:** pitcher=76.8 (best), shortstop=63.0 (worst). The spread is 13.8 points. Positions above 70 (pitcher, presumably a few others) are already passing at acceptable rates. The optimization signal is strongest where scores are lowest — shortstop (63.0), and based on historical audit data, batter (~66%), baserunner (~71%), and catcher (~mid-60s).

**Why 3 positions, not 5 or 12:**

1. **Statistical power per dollar.** Per Observation O15, you need ~28 scenarios per variant to rank variants reliably. With 3 positions at 10 scenarios each = 30 per variant. With 3 variants + 1 control = 120 calls. At xAI rates (~$0.019/call): ~$2.28 per cycle. This leaves budget for 80+ cycles at $200. With 5 positions at 10 each = 50 per variant = 200 calls = ~$3.80/cycle. The marginal value of positions 4 and 5 (which are closer to passing) is low — they contribute less failure signal and dilute the per-position sample size.

2. **Failure mode concentration.** The top 3 failures (explanation_few_sentences, concept_missing_why, description_missing_decision_prompt) are structural and position-agnostic — they fire at similar rates across all positions. But position-SPECIFIC failures (principleContradiction for pitcher, positionActionBoundary for batter, score_direction_mismatch for baserunner) only appear in those positions. Testing shortstop + baserunner + catcher gives you the weakest structural scores AND captures the position-specific failure modes that matter most.

3. **Faster iteration.** 120 calls complete in ~10 minutes. 480 calls take ~40 minutes. At the early stage of the optimization loop, iteration speed matters more than coverage breadth. Run 4 fast cycles against weak positions before running 1 comprehensive cycle against all 12.

**Recommended Cycle 1 configuration:**
- Positions: shortstop, baserunner, catcher (weakest 3)
- Scenarios per position per variant: 10
- Variants: 3 (few_shot_golden, explanation_sentence_fix, system_prefix_structural) + 1 control
- Total calls: 120
- Estimated cost: ~$2.28 (xAI) or ~$18 (Claude Opus)
- Use successive halving (Idea 17): 3 scenarios/position in Round 1 (36 calls), kill worst variant, 7 more scenarios/position for survivors in Round 2 (42-84 calls). Total: 78-120 calls.

**Minimum sample size for +5 point detection:** Per the power analysis in Observation O15, detecting a 5-point improvement over baseline (67.9 → 72.9) with 80% power and alpha=0.05 requires n=28 per group (assuming sigma=15). With 3 positions x 10 scenarios = 30 per variant, you are just above the threshold. For a +3 point improvement, you would need n=78 — meaning you would need to expand to 8 positions or 26 scenarios per position. **Recommendation: target +5 as the minimum detectable effect for Cycle 1 and accept that smaller improvements will not be statistically significant.** This is fine — a mutation that only improves scores by 3 points is not worth adopting anyway. The structural fixes (few-shot, sentence count, decision prompt) should each contribute 5-15 points if they work, making them easily detectable at n=30.

---

## TPA Implementation Roadmap — Consolidated Priority Ranking

**Date:** 2026-03-30 | **Scope:** All TPA findings from Ideas 11-24, Observations O12-O19, ranked by implementation priority and grouped into action windows.

---

### Build Status: What Was ALREADY Addressed

| Finding | Status | Details |
|---------|--------|---------|
| Idea 11 (Goodhart's Law) | IMPLEMENTED | `compareAndAdopt()` at line 10461 has Goodhart detection using gameable vs non-gameable deduction tracking. Flags and reverts suspicious score improvements. |
| Idea 12 (Position-Specific Failure Fingerprints) | PARTIALLY IMPLEMENTED | `analyzeFailurePatterns()` at line 9845 computes per-position and per-deduction breakdowns. The structured `topFailures` output format was adopted. Missing: explicit `mutation` field in failure objects mapping to specific prompt sections. |
| Idea 18 (Pin to Single Pipeline) | IMPLEMENTED | `runAutoResearchCycle()` calls `generateWithAgentPipeline()` directly, bypassing the multi-tier fallback chain. Pipeline choice is a controlled variable. |
| Idea 23 (Top 3 Mutations for Cycle 1) | IMPLEMENTED | The three mutations (few_shot_examples, explanation_guidance, system_prefix) are available in `PROMPT_MUTATION_TYPES` and `generatePromptVariant()`. The baseline failure analysis confirmed these as the highest-leverage targets. |
| O15 (90-Call Efficient Config) | IMPLEMENTED | `runAutoResearchCycle()` defaults reflect the efficient config (small position set, controlled scenarios per variant). |
| O19 (Weak Positions Only) | IMPLEMENTED | Cycle 1 config targets weakest positions rather than all 12. |

---

### Category 1: INCORPORATE NOW (During or Immediately After This Build)

**Estimated total effort: 3-5 hours**

| Priority | Finding | Implementation Spec |
|----------|---------|-------------------|
| **P1** | **O13: Frozen Core for Position Safety** | In `buildAgentPromptWithVariant()`, wrap ROLE_VIOLATIONS source text, `principleContradiction` check descriptions, and `positionActionBoundary` rules in a clearly-delimited block that the variant injection logic skips entirely. Add a guard: if any `variant.delta` string contains substrings from the frozen block's key phrases ("pitcher NEVER cuts", "catcher stays home", "CF has priority"), reject the variant and log a safety violation. ~30 minutes. |
| **P2** | **Idea 15: Dimension Stability Check** | In `compareAndAdopt()`, after the existing Goodhart check, add a per-deduction-category delta computation: for each deduction key present in either control or variant `failurePatterns.deductionCounts`, compute the percentage-point change. If ANY single deduction category increases by more than 10pp (even if aggregate improves), set `dimensionRegression=true` and require `improvementThreshold * 2` for adoption instead of the standard threshold. ~45 minutes. |
| **P3** | **O14: Position-Stratified Comparison** | In `compareAndAdopt()`, compute per-position pass rates from `failurePatterns.positionBreakdown` (already computed by `analyzeFailurePatterns`). Block adoption if any position's pass rate drops by more than 15pp. Add a position-level comparison table to `formatCycleReport()` output. ~1 hour. |
| **P4** | **Idea 16: Mutation Cooldown / Revert Memory** | Add a `_revertLog` module-level array. After `compareAndAdopt()` reverts a variant, push `{mutationType, cycleId, reason, delta}`. Before `analyzeFailurePatterns()` suggests a mutation type, check the revert log: block if reverted in last 1 cycle, require 2x threshold if reverted in last 3 cycles, flag `oscillation_detected` if reverted 2+ times in last 10 cycles. ~1 hour. |
| **P5** | **Idea 13: Missing Mutation Types** | Add two entries to `PROMPT_MUTATION_TYPES`: `"decision_window"` and `"explanation_anchoring"`. Add corresponding entries in `MUTATION_TARGET_MAP` mapping `decision_window` to `["optionDecisionMoment"]` failures and `explanation_anchoring` to `["best_explanation_argues_for_wrong_option"]` failures. In `generatePromptVariant()`, add cases for both: `decision_window` injects the temporal constraint text from Idea 13; `explanation_anchoring` injects the "start by naming the action" guidance. ~45 minutes. |

---

### Category 2: NEXT SPRINT (Next Development Session)

**Estimated total effort: 4-6 hours**

| Priority | Finding | What to Build |
|----------|---------|--------------|
| **P6** | **O12: Implausible Distractor Detection** | Add a new `implausible_distractors` check to QUALITY_FIREWALL Tier 2. Heuristic: if 3 of 4 option texts are <60% the length of the best option, or if 3 of 4 rates cluster below 25%, flag the scenario. Route to `option_archetype_injection` mutation. Requires updating FIREWALL validate() and `MUTATION_TARGET_MAP`. |
| **P7** | **Idea 14: Mutation Layer Isolation** | Add a `layer` field to each variant object in `generatePromptVariant()`. Define 5 layers: `identity` (system prefix), `quality_rules` (explanation/coaching), `knowledge` (maps/archetypes), `examples` (few-shot), `context` (player/coach/anti-repetition). Enforce single-layer mutations: reject or split any variant that touches content in 2+ layers. |
| **P8** | **Idea 17: Successive Halving** | Add `pruningStrategy: "successive_halving"` to `runAutoResearchCycle()` config. Round 1: 3 scenarios/position for all variants, kill any variant scoring >5 below baseline. Round 2: remaining 7 scenarios/position for survivors only. Log pruning decisions in cycle report. |
| **P9** | **Idea 22: Canary Test Suite** | Select 15-20 handcrafted scenarios that scored 80+ on gradeScenario. Store their IDs in a `CANARY_SCENARIOS` constant. At the start of each cycle, run `gradeScenario` on canary set (zero API cost). If canary avgScore drifts >5 from baseline, halt the cycle and log `grading_drift_detected`. Weekly: generate 15 scenarios with the unmodified prompt and compare to AI baseline for model drift detection. |
| **P10** | **O18: Failure Mode Distribution in Baseline** | Extend `formatCycleReport()` to include: score histogram (10-point buckets), per-position avgScore table, failure mode frequency ASCII bar chart, top 5 most common deduction strings verbatim. Compare baseline vs variant fingerprints side-by-side with highlights for >5pp deltas. |

---

### Category 3: FUTURE (Nice-to-Have, Build When Scale Justifies)

**Estimated total effort: 8-12 hours (if ever needed)**

| Priority | Finding | Why Deferred |
|----------|---------|-------------|
| **P11** | **Idea 19: Mutation Effectiveness Leaderboard** | Requires D1 `autoresearch_mutations` table and dashboard endpoint. High value but only useful after 10+ cycles of data accumulate. Build the D1 schema now (low effort), defer the dashboard UI until there is data to display. |
| **P12** | **Idea 20: Dashboard MVP (4-Panel MLflow-Style)** | Depends on Idea 19's D1 tables. Single HTML page with objective curve, config diff, leaderboard, position heatmap. Build after 5+ cycles run successfully. The `formatCycleReport()` text output covers decision-making needs until then. |
| **P13** | **O16: Data Retention Policy** | D1 storage is not a constraint at current scale (~1.4MB/year). The 90-day rolling window with milestone snapshots is good hygiene but unnecessary until running daily cycles. Add the cron trigger and purge logic when daily automation is in place. |
| **P14** | **Idea 21: Handcrafted vs AI Baseline Gap Prediction** | The predictions (handcrafted 78-85, multi-agent 70-78, xAI agent 62-72) serve as sanity-check anchors for baseline results. No code to write — these are reference values for interpreting the first baseline run. Already serving their purpose as documented context. |
| **P15** | **O17: Statistical Caveats** | These are interpretation guidelines, not code changes. The five caveats (grading-is-proxy, small-n per position, pipeline confounding, temporal confounding, pass-rate-hides-distribution) should inform how baseline and cycle results are read. No implementation needed — this observation is a permanent reference document. |
| **P16** | **Idea 24: coaching_line_rules Token Budget Risk** | The risk analysis concluded coaching_line_rules is safe from timeout but carries moderate JSON truncation risk. Mitigation: monitor `parse_error` rate when coaching_line_rules is eventually tested. No preemptive code needed — just awareness for Cycle 2+. |
| **P17** | **Idea 14 (Thompson Sampling Extension)** | The multi-armed bandit allocation strategy (allocate more traffic to winning variants dynamically) is theoretically optimal but adds complexity. At BSM's scale (single-digit cycles per week), fixed allocation with successive halving (Idea 17) is sufficient. Revisit if running 10+ cycles/day. |

---

### Effort Summary

| Category | Items | Effort | When |
|----------|-------|--------|------|
| **Incorporate Now** | P1-P5 (O13, I15, O14, I16, I13) | 3-5 hours | This build or immediately after |
| **Next Sprint** | P6-P10 (O12, I14, I17, I22, O18) | 4-6 hours | Next development session |
| **Future** | P11-P17 (I19, I20, O16, I21, O17, I24, I14-ext) | 8-12 hours | When scale justifies |
| **Already Done** | I11, I12 (partial), I18, I23, O15, O19 | 0 hours | Shipped in this build |

### Key Sequencing Dependencies

1. **P1 (Frozen Core) before P5 (New Mutation Types)** — New mutations must respect the frozen safety block before being added.
2. **P2 (Dimension Stability) before P8 (Successive Halving)** — Halving's triage round needs the stability check to avoid promoting a Goodhart-gaming variant.
3. **P3 (Position Stratification) before P10 (Failure Fingerprint Display)** — The report needs position-level data to render the fingerprint comparison.
4. **P4 (Revert Memory) before running multiple optimization cycles** — Without cooldown, Cycles 2-3 may oscillate on the same mutation types.
5. **P9 (Canary Suite) before running Cycle 2** — Model drift between cycles is undetectable without the canary baseline.

### Cross-Domain Insights Worth Preserving

The TPA findings surfaced several reusable patterns that apply beyond AutoResearch:

- **Goodhart's Law** (I11, I15): When a measure becomes a target, it ceases to be a good measure. Applied everywhere BSM uses automated scoring to drive automated decisions. Mitigation: always track the distribution, not just the mean; use lagging indicators (human review) as a check on leading indicators (automated scores).
- **Successive Halving / Tournament Selection** (I17, O15): Cheap comparisons to narrow the field, expensive evaluation only for finalists. Applies to any resource-constrained search: scenario selection, A/B testing, even candidate screening.
- **Frozen Core / Append-Only Safety** (O13): Safety-critical constraints must be immutable under optimization. Mutations add knowledge, not substitute guardrails. Same principle as Vested's "non-negotiable client commitments" that sales cannot override.
- **Experiment Layering** (I14): Change one variable per layer to maintain attribution. Slower but produces compounding knowledge. Same principle in sales process optimization and coaching methodology development.

---

## TPA Research Notes — P1-P5 Implementation Design (2026-03-31)

### Idea 25: P1 Safety Guard Needs Semantic Polarity, Not Substring Matching

**Context:** P1 spec says to check if a variant's injected text contains substrings from the frozen POSITION_BOUNDARY_HARDSTOP block (e.g., "pitcher NEVER cuts"). A naive substring check would flag BOTH weakening phrases ("pitcher sometimes cuts off throws") AND reinforcing phrases ("pitcher should NOT cut off throws — back up instead"). These are semantically opposite.

**The distinction matters:** The real danger is not the AI mentioning cutoffs — it is the AI stating the rule WITHOUT the negation. "Pitcher handles the cutoff" weakens safety. "Pitcher is NEVER the cutoff" reinforces it. A substring match on "pitcher" + "cut" catches both, creating false positives that would reject good variants.

**Recommended approach:** Extract the core safety predicates as (subject, NEGATION, action) triples: `[("pitcher", "NEVER", "cutoff/relay"), ("catcher", "NEVER", "leaves home plate"), ...]`. The guard should flag variant text that contains the subject+action pair WITHOUT a negation word within N tokens. Specifically: (1) scan variant mutation text for each safety predicate's subject+action keywords; (2) if found, check whether a negation word (NEVER, NOT, don't, cannot, must not) appears within 5 tokens; (3) if no negation is present, flag as a safety weakening and reject the variant. This is a ~20-line regex implementation, not an LLM call.

**Bonus insight:** This same polarity-aware pattern applies to the ROLE_VIOLATIONS regex system. Several of the 30 ROLE_VIOLATIONS patterns could benefit from distinguishing "pitcher cuts off the throw" (violation) from "pitcher does NOT cut off the throw" (correct teaching).

**Tags:** `#autoresearch` `#safety` `#implementation-design`

---

### Observation O20: Position Regression Blocking Needs Sample-Size Weighting (P3)

**Context:** P3 spec says to block adoption if any position's pass rate drops by more than 15pp. But `analyzeFailurePatterns()` does NOT currently compute per-position breakdowns — it aggregates all positions into a single `passRate`. More critically, the 90-call budget (O15) means each cycle tests ~2-4 scenarios per position. A 15pp pass rate drop at n=2 means one scenario flipped from pass to fail — that is noise, not signal.

**The math:** With 5 positions tested and 4 scenarios each (20 total), a single position going from 2/4 pass (50%) to 1/4 pass (25%) is a 25pp drop. That triggers the block. But the 95% confidence interval for a binomial at n=4, p=0.5 is [7%, 93%]. The observed 25pp drop is well within random variation.

**Recommended approach:** Use a weighted hybrid: (1) If n >= 8 for a position, apply the 15pp hard block (sample is meaningful). (2) If 4 <= n < 8, apply a softer gate: require `improvementThreshold * 1.5` for adoption if any position drops >20pp. (3) If n < 4, log the position drop as a warning in the cycle report but do NOT block adoption — flag it for the next cycle to retest with a larger sample at that position. This prevents a single unlucky scenario from vetoing a genuinely good mutation.

**Cross-domain parallel:** This is the same "minimum credible sample" problem Vested faces with NPS scores — a single detractor in a 5-response survey can tank the score. The solution there is also tiered: flag at small n, act at large n.

**Tags:** `#autoresearch` `#statistics` `#implementation-design`

---

### Idea 26: Revert Log Should Persist in localStorage with TTL-Based Decay

**Context:** P4 adds a `_revertLog` to prevent mutation oscillation. The question is whether this should be module-level (in-memory, lost on refresh) or persisted in localStorage.

**Why localStorage wins:** AR cycles are expensive (90 API calls, ~$2-4 each). A user will not run multiple cycles in a single browser session — they will run one, review results, close the tab, come back tomorrow, and run another. An in-memory revert log would be empty for Cycle 2, defeating the entire purpose of oscillation detection. The log MUST persist across sessions.

**Recommended design:** Store under `bsm_ar_revert_log` in localStorage. Each entry: `{mutationType, cycleId, reason, delta, timestamp}`. Apply TTL-based decay rather than cycle-count-based: entries older than 7 days are ignored (model drift makes older reverts irrelevant). Cap at 50 entries (FIFO eviction). The cooldown rules become: (1) mutation reverted in last 24 hours — hard block; (2) mutation reverted in last 7 days — require 2x improvement threshold; (3) same mutation reverted 3+ times in 7 days — flag `oscillation_detected`, skip entirely and log. This is ~15 lines of code plus 5 lines of localStorage read/write.

**Why NOT D1/KV:** The revert log is a client-side optimization loop. It does not need server persistence — each browser instance runs its own AR cycles independently. Putting it in D1 adds latency and complexity for zero benefit at current scale. If/when AR moves server-side (Phase 3+), migrate the log to D1 at that point.

**Tags:** `#autoresearch` `#persistence` `#implementation-design`
- **Experiment Layering** (I14): Change one variable per layer to maintain attribution. Slower but produces compounding knowledge. Same principle in sales process optimization and coaching methodology development.

---

## TPA Research Notes — Cycle 3 Pre-Flight Analysis (2026-03-31)

### Idea 27: Decision Prompt Rule Is Already Present but Ignored — Fix Prompt Architecture, Not Content

**Context:** The 84% `description_missing_decision_prompt` failure rate suggests we need to add a rule. But line 11932-11934 of buildAgentPrompt already contains: "CRITICAL: The LAST sentence of every description MUST be a decision prompt... This is non-negotiable." The rule exists. The AI ignores it.

**Root cause:** The `qualityRules` block is ~60 lines of dense instructions (scoreRules + descriptionStyle + positionBoundaries + auditInstruction + yellowOptionRule + explanationRules + voiceExamples). LLMs satisfice — they attend to the first rules and drop later ones. The decision-prompt rule is buried at line 11934 inside descriptionStyle, which is the second block concatenated into qualityRules. By the time the model processes the JSON schema format requirements and generates the description, this instruction has decayed from working memory.

**Proposed fix (not a duplicate rule — a structural change):** Move the decision-prompt requirement out of the prose rules block and into one of three structural positions where LLMs reliably attend: (1) The LAST line of the entire prompt (recency bias), (2) Inside the JSON schema format block as a field-level constraint ("description: string, MUST end with a question asking the player to decide"), or (3) As a post-generation check in the grading step that rejects and retries. Option 2 is the strongest because it ties the rule to the exact field being generated, not to a separate instruction block the model may discard. Adding a second copy of the same prose rule will not overcome the attention decay that caused the first copy to fail.

**Implication for Cycle 3:** If we add a one-liner to buildAgentPrompt as planned, control baseline should barely shift (the existing rule already fails to stick). This means Cycles 1-2 data IS comparable. But it also means the fix will have minimal effect. The real experiment should be: move the rule to a structural position and test THAT as the mutation.

**Tags:** `#autoresearch` `#prompt-engineering` `#cycle-3`

---

### Idea 28: allExplanationsCausal Is a Universal Quality Gap, Not a Grading Bug — But the Floor Should Be 2 Sentences

**Context:** allExplanationsCausal fires at 79% for AI scenarios. Investigation shows the handcrafted baseline has a similar weakness: `explanation_few_sentences` fires 171x out of 100 handcrafted scenarios. The causal word list (35+ patterns including "since", "so the", "otherwise") is generous — any explanation that fails this check is genuinely weak.

**The grading is honest.** An explanation under 50 words with zero causal language is a bad explanation for teaching. The 79% failure rate reflects a real pattern: both AI and human authors write terse explanations that state the outcome without explaining WHY. "You throw to the cutoff man" is an instruction, not an explanation. "You throw to the cutoff man because he's lined up with home and cutting the distance means the ball arrives on a line instead of bouncing" is teaching.

**The fixable gap:** The current `explanationRules` (line 11967-11974) says "1-3 sentences." This permits 1-sentence explanations that trivially fail the causal check. Changing the floor to "2-3 sentences" would force the AI to write enough text that causal reasoning almost inevitably appears. This is a simpler, more reliable fix than trying to teach the AI what "causal reasoning" means. The `explanation_anchoring` mutation in Cycle 3 partially addresses this by requiring explanations to name the action first, then argue — which naturally produces 2+ sentences. Watch whether explanation_anchoring's pass rate on allExplanationsCausal improves as a side effect.

**Tags:** `#autoresearch` `#grading` `#cycle-3`

---

### Observation O21: Worker Multi-Agent Pipeline Has Zero Decision-Prompt Guidance

**Context:** The Claude Opus multi-agent pipeline in `worker/index.js` has no mention of "decision prompt", "What should you do", "End with", or any instruction to close descriptions with a player decision question. This means the primary AI pipeline (which handles most production AI scenarios) is generating descriptions that almost certainly fail the `description_missing_decision_prompt` check at the same 84% rate as the xAI fallback.

**Why this matters:** Any fix to buildAgentPrompt (client-side) only affects the xAI agent and standard pipelines — it does NOT touch the Claude Opus multi-agent pipeline, which runs server-side in the worker. To fix the 84% failure rate across ALL pipelines, the rule must be added to BOTH the worker's Planner/Generator prompts AND the client-side buildAgentPrompt. Currently, fixing only the client side leaves the primary pipeline untouched.

**Recommended approach:** Add the decision-prompt requirement to the worker's Generator agent prompt (the agent that actually writes the scenario JSON). Place it as a field-level constraint in the JSON schema or as the final instruction before the generation call. Then separately fix the client-side prompt per Idea 27. This ensures both the primary path (Claude Opus) and the fallback path (xAI Grok) receive the instruction.

**Tags:** `#autoresearch` `#worker` `#multi-agent` `#cycle-3`
