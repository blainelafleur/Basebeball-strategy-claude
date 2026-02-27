# Baseball Strategy Master — Scenario Quality & Knowledge Framework

> The 394 scenarios are the core product. Every scenario must teach correct baseball strategy backed by authoritative sources. This document defines WHAT knowledge to teach, WHERE it comes from, and HOW to verify it.

---

## 1. Purpose & Scope

This framework governs all scenario content — handcrafted and AI-generated. It replaces the original batch-planning roadmap with a rigorous, data-backed quality system.

**Goals:**
- Every scenario teaches something an authoritative coach would agree with
- Statistics cited are real (sourced from MLB data, FanGraphs, Baseball Reference)
- No scenario contradicts another scenario in the same or different position
- The AI generation system has enough context to produce correct scenarios autonomously

---

## 2. Knowledge Hierarchy (Source Precedence)

When building or auditing scenarios, resolve conflicts using this precedence:

| Tier | Source | Example | Authority |
|------|--------|---------|-----------|
| **1** | MLB Official Rules | Force vs tag, balk rules, infield fly, DH | Canonical — never contradict |
| **2** | Measurable Data | Statcast, FanGraphs RE24, Baseball Reference | Objective — cite the numbers |
| **3** | Coaching Consensus | ABCA, USA Baseball, pro coaching manuals | Standard teaching — follow unless data contradicts |
| **4** | Situational Judgment | Context-dependent decisions | Explain trade-offs, don't present as absolute |

**Conflict Resolution Protocol:**
- Tier 1 overrides everything. If a coaching tradition contradicts the rulebook, the rulebook wins.
- Tier 2 overrides Tier 3 when data clearly shows a strategy is suboptimal (e.g., sacrifice bunts lowering RE).
- Tier 3 represents "what coaches teach" — use this for positioning, communication, fundamentals.
- Tier 4 scenarios must present multiple valid options and explain WHY the best choice depends on context.

---

## 3. Position-Specific Principles Library

### Universal Principles (Apply to ALL Positions)

**Fly Ball Priority Hierarchy** (non-negotiable):
- Outfielder coming in > Infielder going back. ALWAYS.
- Center fielder > Corner outfielders on any ball CF can reach.
- The ball drifts TOWARD the outfielder and AWAY from the infielder.
- Running in = ball in front of you (easy catch, good depth perception).
- Going back = ball over your shoulder (hardest catch in baseball, drifting away).
- Source: Every authoritative coaching source — Pro Baseball Insider, ABCA, USA Baseball.

**Relay Positioning:**
- Default alignment is TOWARD HOME PLATE. Always.
- Preventing runs is the #1 priority on every relay play.
- Teammates yell to redirect — the relay man listens and adjusts.
- Source: Standard coaching consensus (ABCA, pro coaching manuals).

**Force vs Tag:**
- Force play: runner is FORCED to advance because the batter became a runner. Touch the base.
- Tag play: runner is NOT forced. Must tag the runner with the ball.
- Force is REMOVED when the runner ahead is put out. The remaining plays become tag plays.
- Bases loaded = force at every base (including home). Runner out at home = force removed at third.
- Source: MLB Official Rules, Rule 5.09(b).

**Communication:**
- Someone MUST call for every fly ball. "I got it!" — loud, early, repeated.
- No-call fly balls cause collisions, the most dangerous play in baseball.
- The priority fielder calls it; everyone else peels off.

### Pitcher
- First-pitch strikes are critical: batters hit ~.340 on first-pitch strikes.
- Work ahead in the count. 0-2 count: batters hit ~.167. Expand the zone.
- From the stretch: quick to the plate, vary hold times to disrupt steal timing.
- Pitch to contact with a lead; pitch for strikeouts in high leverage.
- Pickoffs: disrupt timing and shorten leads, don't just throw blindly.
- Pitch sequencing: set up pitches with eye level changes and speed differentials.
- **Defensive duties**: Field bunts, cover 1B on grounders to the right side, cover home on wild pitches/passed balls.
- **Backup duty**: Back up home plate on ALL throws from OF to home. Back up 3B on throws to third.
- **NEVER the cutoff or relay man** — that is ALWAYS an infielder (see Section 3.5).

### Catcher
- Field general: calls pitches based on count, batter weakness, and situation.
- Framing: subtle glove pull on borderline pitches. High-leverage: stillness and presentation.
- Blocking: smother balls in the dirt, keep them in front. With runners on, this is critical.
- Throwing out runners: quick transfer, strong throw to the bag side of the base.
- Pop-ups near home: catcher has priority. Turn your back to the field (ball curves back).
- Runner on 2nd seeing signs: switch to multiple-sign sequences.

### First Base
- Scoop low throws — stretch toward the throw, keep your foot on the bag.
- Hold runners: give pitcher a target, apply tag on pickoff throws.
- Bunt defense: charge aggressively. 2B covers first.
- **Cutoff on throws from CF and RF to home** — line up between OF and home plate, listen for catcher's call.
- When you're cutoff, 2B covers 1B.
- Know when force is removed: runner out ahead of you = tag play, not force.

### Second Base
- Double play pivot: receive feed, touch second, get off the bag to avoid the runner.
- **Relay (double-cut) on extra-base hits to the RIGHT side** (RF line, RF-CF gap) — lead relay, line up between OF and home plate.
- Cover 1B when first baseman is the cutoff. On singles from RF to home, 1B is the cutoff, NOT 2B.
- Cover first on bunts when 1B charges.
- Fly ball priority: outfielder coming in ALWAYS has priority over you going back.

### Shortstop
- Captain of the infield for communication on fly balls and relays.
- Double play feed: firm, chest-high throw to second.
- **Relay (double-cut) on extra-base hits to the LEFT side** (LF line, LF-CF gap, deep CF) — lead relay, line up between OF and home plate.
- **Cutoff on throws to 3B** (runner advancing 1B→3B). On singles from LF to home, 3B is the cutoff, NOT SS — SS covers 3B.
- Deep-hole play: plant hard, strong throw across the diamond (signature play).
- Steal coverage: straddle the bag, sweep tag down in front of the base.
- Fly ball priority: outfielder coming in ALWAYS has priority over you going back. Never call off an outfielder on a shallow fly.

### Third Base
- Hot corner: quick reactions, ready position, expect hard-hit balls.
- Bunt defense: crash hard, bare-hand if needed, strong throw to first.
- Slow rollers: charge aggressively, bare-hand scoop-and-throw in one motion.
- Guard the line late in close games (prevent extra-base hits down the line).
- Fly ball priority: outfielder coming in has priority on tweeners behind you.
- **Cutoff on singles from LF to home** — line up between LF and home plate, listen for catcher's call. SS covers 3B when you go out as cutoff.

### 3.5 Cutoff/Relay Assignments (Authoritative — Sources: Pro Baseball Insider, ABCA, Baseball Made Fun)

**Cardinal Rules:**
1. Pitcher is **NEVER** the cutoff or relay man — always backs up the target base.
2. Catcher stays at home, directs the cutoff: "Cut!" / "Cut two!" / "Cut three!" / silence = let it go.
3. 3B = cutoff on LF singles to home. 1B = cutoff on CF/RF singles to home.
4. SS = cutoff on ALL throws to 3B from outfield.
5. Double cuts: SS leads on left-side balls, 2B leads on right-side balls.
6. Trail man positions 20-30 feet behind lead relay, in line with target base.

**Single Cuts to HOME (runner scoring on a base hit):**

| From | Cutoff Man | SS Does | Pitcher |
|------|-----------|---------|---------|
| LF | **3B** | Covers 3B | Backs up home |
| CF | **1B** | Covers 2B | Backs up home |
| RF | **1B** | Covers 2B | Backs up home |

**Single Cuts to 3B (runner advancing 1B→3B):**

| From | Cutoff Man | Pitcher |
|------|-----------|---------|
| LF | **SS** | Backs up 3B |
| CF | **SS** | Backs up 3B |
| RF | **SS** | Backs up 3B |

**Double Cuts / Relays (extra-base hits to gap or wall):**

| Ball Location | Lead Relay | Trail Man | Pitcher |
|--------------|-----------|-----------|---------|
| LF line / LF-CF gap | **SS** | **2B** | Backs up home |
| RF-CF gap / RF line | **2B** | **SS** (or 1B on RF line) | Backs up home |

### 3.6 Bunt Defense Assignments (Authoritative — Sources: ABCA, USA Baseball, coaching consensus)

**Cardinal Rules:**
1. Lead runner out > trail runner out. Force at 3rd with runners 1st & 2nd is the highest-value play.
2. Pitcher fields bunts near the mound — NEVER makes base-coverage assignments.
3. Catcher directs traffic and calls which base to throw to.

**Runner on 1st Only:**

| Position | Assignment |
|----------|-----------|
| P | Fields bunt near mound |
| 1B | Charges bunt |
| 3B | Charges bunt |
| 2B | Covers 1st |
| SS | Covers 2nd |
| C | Directs play |

**Runners on 1st & 2nd (Standard):**

| Position | Assignment |
|----------|-----------|
| P | Fields bunt near mound |
| 1B | Charges bunt |
| 3B | Charges bunt |
| SS | Covers 3rd |
| 2B | Covers 1st |
| C | Directs play |

**Runners on 1st & 2nd (Wheel Play):**

| Position | Assignment |
|----------|-----------|
| 3B | Crashes HARD early |
| SS | Rotates to cover 3rd |
| 2B | Covers 1st |
| P | Covers mound area |
| Goal | Get lead runner at 3rd |

### 3.7 First-and-Third Defense (Authoritative — Sources: ABCA, coaching consensus)

When runner on 1st steals with runner on 3rd, the catcher has 4 standard options:

| Option | Description | Risk |
|--------|------------|------|
| **Throw Through** | C throws to 2B. SS covers, takes throw, looks R3 back. | R3 may score |
| **Cut by Middle IF** | C throws to 2nd. SS (or 2B) cuts short, looks at R3. If R3 breaks → throw home. | Requires quick read |
| **Fake and Throw** | C pump-fakes to 2nd, fires to 3B to catch R3 leaning. 3B must be ready. | If 3B not ready, ball goes to LF |
| **Hold the Ball** | Concede stolen base, keep R3 at third. | Gives up base but safe |

**Key assignments:** 1B stays at 1B. P ducks out of throwing lane. NEVER throw to 2nd if R3 has a big lead.

### 3.8 Backup Responsibilities (Authoritative — Sources: ABCA, Pro Baseball Insider)

| Position | Backs Up |
|----------|----------|
| P | HOME on OF throws home. 3B on throws to third. |
| LF | 3B on ALL infield grounders and throws to third. |
| CF | 2B on ALL steal attempts and throws to second. |
| RF | 1B on EVERY infield grounder (most important routine OF job). |
| C | 1B on grounders with no runners on. |

**Rule:** Every throw needs a backup in line behind the target. Sprint — don't jog — to backup position.

### 3.9 Rundown Mechanics (Authoritative — Sources: ABCA, coaching consensus)

1. Chase runner BACK toward previous base (drive him back, not forward).
2. Hold ball HIGH and visible. Run FULL SPEED.
3. ONE throw maximum — firm, chest-high. Receiver tags.
4. Backup rotation: next fielder replaces the thrower's vacated base. 2 fielders per base.
5. NEVER pump-fake. NEVER lob. NEVER throw across the runner's body.

**Runner's perspective:** Force many throws — every throw is an error chance.

### 3.10 Double Play Positioning (Authoritative — Sources: coaching consensus)

| Situation | Positioning | Notes |
|-----------|------------|-------|
| Runner on 1st (or 1st & 2nd, loaded), < 2 outs | **DP Depth** | 3-4 steps toward 2B + step in toward home. Reduces range ~15% but speeds pivot. |
| 2 outs, or no force at 2nd | **Normal Depth** | Can't turn two with 2 outs — maximize range. |
| Runner on 3rd, < 2 outs, run matters | **Infield In** | Less range but can throw home on grounders. |

**Never-do rules:** NEVER DP depth with 2 outs. NEVER infield in with 2 outs and no R3.

### 3.11 Hit-and-Run Assignments (Authoritative — Sources: coaching consensus)

- **Batter:** MUST swing — protect the runner. Ground ball through vacated hole > power swing.
- **Runner:** Go on the pitch. Don't look back.
- **2B coverage on steal depends on batter handedness:**
  - LHH → SS covers 2B (hole opens at 2B side, batter aims there)
  - RHH → 2B covers 2B (hole opens at SS side, batter aims there)
- Pitcher should throw strikes to induce contact.

### Left Field
- Priority over ALL infielders on fly balls you can reach (coming in is easier).
- Hit the cutoff man — don't throw all the way home unless the play is clearly there.
- Wall play: round the ball so momentum carries toward the infield. Never field and spin.
- Back up third base on all infield ground balls.
- Sun balls: use glove as primary shield, sunglasses as supplementary.
- **Your cutoff on throws home is the 3B. On doubles, your relay is the SS.**

### Center Field
- Priority on ALL fly balls you can reach — over corner OF and all infielders.
- Communication is your responsibility — you see the whole field.
- Gap coverage: take angle routes (banana routes), not straight-back.
- Do-or-die throws: charge the ball, crow-hop, throw through the cutoff.
- Back up second base on infield plays.
- **Your cutoff on throws home is the 1B. On doubles, your relay is the SS.**

### Right Field
- Strong arm is your biggest weapon — throw out runners at third and home.
- Back up first base on EVERY infield grounder (most important routine job).
- Priority over infielders (1B, 2B) on fly balls you can reach.
- Cutoff throws: hit the cutoff unless you have a clear play at the base.
- Wall play: learn caroms off the wall in your corner.
- **Your cutoff on throws home is the 1B. On doubles, your relay is the 2B.**

### Batter
- Count leverage is everything. Hitter's counts (2-0, 3-1): be aggressive on YOUR pitch.
- Pitcher's counts (0-2, 1-2): protect the zone, shorten up, expand slightly.
- Two-strike approach: widen the zone, battle, foul off tough pitches.
- Situational hitting: runner on 3rd with less than 2 outs = fly ball scores him.
- Hit behind the runner to advance from 2nd to 3rd (hit to the right side).
- Sacrifice bunts usually LOWER run expectancy (see Data Integration section).
- Always respect the coach's signs. Never teach "ignore the sign."

### Baserunner
- Stolen base break-even: ~72% success rate needed (per RE24). Below that, you're hurting the team.
- Read the pitcher: first-move tells, timing the delivery, lead distance.
- Tag-ups: watch the fielder's feet, leave on the catch (not before).
- Line drives: FREEZE and read. Never get doubled off.
- Never make the first or third out at third base (old baseball axiom with RE24 backing).
- Respect coach's signs always. Secondary leads are key for passed balls and wild pitches.

### Manager
- RE24 guides sacrifice bunt decisions (usually bad — see Data Integration).
- Stolen bases need ~72% success to be worthwhile.
- Pitching changes: L/R platoon advantage, fatigue, times through the order (~30 points better 3rd time).
- Intentional walks: only with first base open AND a clear skill gap to the next hitter.
- Defensive positioning: guard lines late in close games, play for DP early.
- Play for one run late in close games; play for big innings early.

### Rules (Special Category)
- Teach MLB Official Rules accurately. Include recent changes (pitch clock, shift ban, universal DH).
- Force play, infield fly rule, balk, obstruction, interference — all from the official rulebook.

### Famous Plays (Special Category)
- Historical accuracy is paramount. Cite the actual year, teams, and players.
- Teach the strategic lesson the play illustrates, not just the story.

### Counts (Special Category)
- Count-specific batting averages and strategy. Data-driven decisions.
- Tie scenarios to real count leverage (hitter's count vs pitcher's count).

---

## 4. Scenario Construction Methodology (8 Steps)

1. **Choose the teaching concept** — one clear, reusable principle per scenario.
2. **Design the game situation** — make it realistic (inning, outs, count, runners, score all consistent).
3. **Write 4 options** — one optimal (75-90 rate), one decent (45-65), two poor (10-40).
4. **Verify against Principles Library** — does the best answer match authoritative coaching?
5. **Write explanations that teach WHY** — cite specific rules, stats, or principles. Never just "good choice."
6. **Cross-check for contradictions** — search existing scenarios for the same concept. Ensure consistency.
7. **Assign metadata** — difficulty (1-3), animation type, category, situation object.
8. **Run the Quality Checklist** (Section 7) before committing.

---

## 5. Data Integration Reference

### Run Expectancy Matrix (Key Base-Out States, 2015-2024 MLB averages)

| Runners | 0 Out | 1 Out | 2 Out |
|---------|-------|-------|-------|
| Empty | 0.54 | 0.29 | 0.11 |
| 1st | 0.94 | 0.56 | 0.24 |
| 2nd | 1.17 | 0.71 | 0.33 |
| 3rd | 1.43 | 0.98 | 0.37 |
| 1st & 2nd | 1.56 | 0.96 | 0.46 |
| 1st & 3rd | 1.83 | 1.21 | 0.52 |
| 2nd & 3rd | 2.05 | 1.44 | 0.60 |
| Loaded | 2.29 | 1.59 | 0.77 |

### Sacrifice Bunt RE24 Analysis
- Runner on 1st, 0 out: 0.94 → Runner on 2nd, 1 out: 0.71. **Net: −0.23 runs.**
- Runner on 2nd, 0 out: 1.17 → Runner on 3rd, 1 out: 0.98. **Net: −0.19 runs.**
- Bunting almost always lowers run expectancy. Exceptions: very weak hitter (<.200), late game needing exactly 1 run (Win Expectancy, not RE, drives the call), pitcher batting.

### Stolen Base Break-Even
- ~72% success rate needed for a steal attempt to be RE-neutral.
- Below 72%: the caught-stealing damage outweighs the base-advanced benefit.
- Context: with 2 outs, break-even drops to ~67% (caught stealing ends the inning but you were likely stranded anyway).

### Count-Specific Batting Averages (MLB Averages)
| Count | BA | OBP | SLG | Notes |
|-------|-----|-----|-----|-------|
| 0-0 (first pitch) | .340 | .340 | .555 | First-pitch strikes are gold for pitchers |
| 1-0 | .345 | .345 | .550 | Hitter's count — be aggressive |
| 2-0 | .400 | .400 | .665 | Best hitter's count — sit on your pitch |
| 3-0 | .375 | .900+ | .590 | Usually take; green light only for good hitters |
| 3-1 | .370 | .500+ | .615 | Premium hitter's count |
| 0-1 | .300 | .300 | .460 | Pitcher got ahead — still competitive |
| 0-2 | .167 | .170 | .240 | Pitcher dominant — expand zone, protect |
| 1-2 | .180 | .190 | .270 | Pitcher's count — survival mode |
| 2-2 | .205 | .210 | .310 | Neutral-to-pitcher — protect the zone |
| 3-2 | .230 | .350+ | .380 | Full count — anything can happen |

### Key Fielding/Pitching Metrics
- Times through the order: batters hit ~30 points better the 3rd time vs 1st time.
- Platoon advantage: LHB vs RHP ~15-20 points higher BA than LHB vs LHP (and vice versa).
- Catcher pop time: elite = 1.8-1.9 sec. Average = 2.0 sec. Steal window matters.
- Pitcher time to plate: under 1.3 sec makes stealing very difficult.

---

## 6. AI Self-Audit Protocol

Every AI-generated scenario must pass the base 9-point verification plus conditional checks based on position:

**Base checks (always injected):**
1. **Situation validity**: Is the game situation physically possible? (outs 0-2, count valid, runners/score consistent)
2. **Option feasibility**: Can this player physically perform all 4 options from their position in this moment?
3. **Authoritative correctness**: Does the best answer match what a coaching authority (Tier 1-3) would teach?
4. **Rule accuracy**: Are force/tag, priority, relay, and other rules cited correctly?
5. **Statistical accuracy**: Are any cited percentages approximately correct? (no invented numbers)
6. **Principles consistency**: Does the scenario contradict any principle in the Principles Library (Section 3)?
7. **Animation match**: Is the anim type consistent with the scenario action?
8. **Role check**: Does the scenario assign correct defensive roles per Section 3.5? Pitcher is NEVER cutoff. 3B is cutoff on LF→Home. 1B is cutoff on CF/RF→Home.
9. **Position boundary**: Does each option describe an action THIS position would actually perform? A pitcher doesn't relay. A catcher doesn't go out as cutoff.

**Conditional checks (injected per-position via `getRelevantAudits()`):**
10. **Bunt defense** (P, C, 1B, 2B, SS, 3B, MGR): Do assignments match Section 3.6? 2B covers 1st, SS covers 3rd with runners 1st & 2nd.
11. **First-and-third** (P, C, 1B, 2B, SS, 3B, MGR): Do options match Section 3.7? SS/2B cuts, pitcher ducks, 1B stays.
12. **Backup** (all 9 defensive + MGR): Are backup responsibilities correct per Section 3.8?
13. **Rundown** (1B, 2B, SS, 3B, BR, MGR): Chase runner BACK, one throw max, no pump fakes per Section 3.9.
14. **DP positioning** (P, 1B, 2B, SS, 3B, MGR): DP depth only with < 2 outs and force at 2nd per Section 3.10.
15. **Hit-and-run** (2B, SS, BAT, BR, MGR): Coverage depends on batter handedness per Section 3.11.

The base 9 checks plus relevant conditional checks are injected into the AI generation prompt in `index.jsx` via the conditional knowledge maps system.

---

## 7. Enhanced Quality Checklist (For All Scenarios)

Every scenario — handcrafted or AI-generated — must pass ALL of these:

### Baseball Accuracy
- [ ] Game situation is possible (innings, outs, count, runners, score all make sense together)
- [ ] All 4 options are actions a player at THAT position could physically perform in that moment
- [ ] The best answer matches authoritative coaching (Tier 1-3 sources)
- [ ] No option requires a physically impossible action (e.g., changing a pitch mid-delivery)
- [ ] Success rates reflect real baseball outcomes (best 75-90, decent 45-65, poor 10-40)
- [ ] Explanations cite correct rules — force vs tag, priority hierarchy, relay direction
- [ ] Statistics cited are approximately correct (sourced from Section 5 data)
- [ ] Fly ball priority is correct: OF coming in > IF going back. Center > corners.
- [ ] Relay default is toward HOME PLATE (preventing runs is priority)
- [ ] Cutoff/relay roles match Section 3.5 — 3B cuts LF→Home, 1B cuts CF/RF→Home, pitcher NEVER cuts
- [ ] Bunt defense assignments match Section 3.6 — 2B covers 1st, SS covers 3rd (runners 1st & 2nd)
- [ ] First-and-third options match Section 3.7 — 4 standard catcher options, P ducks, 1B stays
- [ ] Backup responsibilities match Section 3.8 — RF→1B, LF→3B, CF→2B, P→home/3B
- [ ] Rundown mechanics match Section 3.9 — chase BACK, one throw, no pump fakes
- [ ] DP positioning matches Section 3.10 — never DP depth with 2 outs
- [ ] Hit-and-run assignments match Section 3.11 — coverage depends on batter handedness
- [ ] Each option is an action the SPECIFIED position would perform in that moment

### Educational Quality
- [ ] The "why" is explained, not just the "what"
- [ ] Wrong-answer explanations teach something — they explain WHY it's suboptimal
- [ ] No contradictions with other scenarios in the same or different position
- [ ] The concept is a clear, reusable principle (not just "this is the right play")
- [ ] Age-appropriate language (scenarios with `explSimple` for ages 6-10)

### Structural Integrity
- [ ] Exactly 4 options, 4 explanations, 4 rates
- [ ] `best` index (0-3) matches the highest rate
- [ ] `anim` type matches the scenario's action (not throwHome when the play is to third)
- [ ] ID follows the naming convention for its category
- [ ] `diff` level is appropriate (1=basic concepts, 2=situational, 3=advanced strategy)

### Consistency Checks
- [ ] Relay positioning: default alignment is toward HOME (not the lead runner's base)
- [ ] Coach's signs: always teach respect for the coach's call (never "ignore the sign")
- [ ] Taking vs swinging: frame as situational, not absolute. Never "always take" or "always swing"
- [ ] Sun defense: glove technique is primary, sunglasses are supplementary
- [ ] Framing: context-dependent (borderline = subtle pull, high-leverage = stillness)
- [ ] Sacrifice bunts: acknowledge RE24 trade-off (bunts lower RE except in narrow late-game situations)
- [ ] Stolen bases: acknowledge ~72% break-even rate in explanations when relevant

---

## 8. Current MLB Rule Changes Tracker

Rules that affect scenario accuracy (as of 2024-25 seasons):

| Rule Change | Season | Impact on Scenarios |
|-------------|--------|-------------------|
| Pitch clock | 2023 | Pitchers must deliver in 15/20 sec. Affects steal timing scenarios. |
| Shift ban | 2023 | 2 infielders on each side of 2B required. Shift scenarios need qualifier. |
| Universal DH | 2022 | No more "pitcher batting" in NL. Add qualifier for youth leagues. |
| Bigger bases (18") | 2023 | Slightly shorter steal distance. Minor impact on steal scenarios. |
| Runner on 2nd in extras | 2020 | "Ghost runner" rule. Affects extra-inning manager scenarios. |
| Pitch clock violation = ball/strike | 2023 | New strategic element for advanced scenarios. |

---

## 9. Audit Log

### Feb 2026 — Initial Audit (394 scenarios)

**Tier 1 — Critical (7 fixes)**
- `r54`: Added 4th option (was only 3, breaking UI)
- `p53`: Removed "double play" claim (impossible with 2 outs)
- `f21`: Changed "tags the runner" to "steps on home plate for the force out" (bases loaded = force)
- `ct7`: Changed squeeze defense call to happen BEFORE the pitch
- `2b4`: Changed relay default to home plate (was third base)
- `ss4`: **Fixed fly ball priority** — changed best answer from SS going back to LF coming in. Outfielder priority is non-negotiable.
- `2b6`: **Fixed fly ball priority** — changed best answer from 2B going back to RF coming in. Added tag-up throwing position rationale.

**Tier 2 — Significant (6 fixes)**
- `b4`: Removed coaching conflict with b40
- `p54`: Changed score from 5-4 to 4-4, added batting averages
- `f17`: Changed score from 5-3 to 5-4 (1-run lead)
- `m1`: Changed on-deck hitter stats (makes IBB clearly right)
- `b8`: Narrowed rates, added nuance
- `f43`: Renamed to `m58` (wrong prefix)

**Tier 3 — Inconsistencies (5 fixes)**
- `b16`/`b51`: Narrowed "take first pitch" rates, added nuance
- `ss5`: Changed relay default to home plate
- `lf7`: Raised glove-shield rate to 70
- `ct4`/`ct17`: Added context differentiation for framing
- `r53-r57`/`rl1,4,7`: Verified — no changes needed

**Tier 4 — Minor (14 fixes)**
- `cf3`/`rf1`: Fixed anim from `throwHome` to `catch`
- `ct9`: Fixed outs description
- `fp2`: Clarified force play reasoning
- `rl6`: Changed "American League" to "your team" (universal DH)
- `m44`: Added qualifier for pitcher batting
- `1b6`: Emphasized force-removed = tag play
- `3b1`: Raised lead runner rate
- `b39`: Added safety note
- `f47`: Changed "No double play" to "No conventional double play"
- `p44`: Fixed anim from `catch` to `safe` (pickoff throw, not catching)
- `p48`: Fixed anim from `catch` to `safe` (pickoff throw, not catching)
- `2b7`: Fixed anim from `advance` to `freeze` (holding runner, not advancing)
- `r15`: Fixed anim from `safe` to `freeze` (teaching NOT to steal = stay put)

### Full Framework Audit (Feb 2026)

All 394 scenarios audited against the new Knowledge Framework (Section 3). Results:
- **Structural integrity**: 394/394 pass (4 options, 4 rates, best=highest, valid anim, valid diff)
- **Fly ball priority**: All correct after ss4/2b6 fixes
- **Relay direction**: 8/8 relay scenarios correctly default toward home plate
- **Force/tag accuracy**: 0 critical errors. Minor wording in m1/m31 ("force at every base")
- **Bunt RE24**: 47/48 properly contextualized (b40 teaches coach obedience — design choice)
- **Steal RE24**: All stealing scenarios are RE24-aware with proper risk/reward framing
- **Count data**: All cited statistics are correct or approximately correct
- **Coach authority**: All scenarios respect coach's signs
- **No absolute claims**: No "always take" or "always swing" found
- **Internal contradictions**: 0 true contradictions found
- **Animation consistency**: 4 mismatches fixed (p44, p48, 2b7, r15)

---

## 10. Maintenance Protocol

### Annual (Before Each Season)
- Review MLB rule changes for the upcoming season
- Update Section 8 (Rule Changes Tracker)
- Check if any scenarios reference outdated rules
- Update count-specific batting averages if new MLB data is available

### Quarterly
- Refresh RE24 data if FanGraphs publishes updated tables
- Audit any new scenarios added since last review
- Check AI-generated scenario logs for recurring errors

### On Every New Scenario Batch
- Run the full Quality Checklist (Section 7) on every scenario
- Cross-reference with existing scenarios for contradictions
- Verify fly ball priority, relay direction, and force/tag rules specifically

---

## Appendix A: AI Prompt Enhancement Spec

The AI generation prompt in `index.jsx` (`generateAIScenario()`) includes these injected blocks:

1. **Position Principles Block**: Full principles from `POS_PRINCIPLES` constant, injected per-position.
2. **Cutoff/Relay Map**: `CUTOFF_RELAY_MAP` constant — always injected for all positions.
3. **Conditional Knowledge Maps**: 6 maps injected only when relevant to the current position via `getRelevantMaps(position)`:
   - `BUNT_DEFENSE_MAP` — P, C, 1B, 2B, SS, 3B, MGR
   - `FIRST_THIRD_MAP` — P, C, 1B, 2B, SS, 3B, MGR
   - `BACKUP_MAP` — All 9 defensive + MGR
   - `RUNDOWN_MAP` — 1B, 2B, SS, 3B, BR, MGR
   - `DP_POSITIONING_MAP` — P, 1B, 2B, SS, 3B, MGR
   - `HIT_RUN_MAP` — 2B, SS, BAT, BR, MGR
4. **Data Reference Block**: Key RE24 data, count averages, stolen base break-even, fly ball priority hierarchy, relay default, force/tag rules.
5. **Self-Audit Block**: 9 base checks + conditional per-position checks via `getRelevantAudits(position)`.

**Architecture**: `MAP_RELEVANCE` maps each knowledge map to its relevant positions. `getRelevantMaps()` filters and concatenates only the maps needed. `getRelevantAudits()` generates numbered audit items (starting at 10) for the injected maps. This keeps the prompt focused — a batter gets hit-and-run but not bunt defense; a manager gets everything.

**Role Violations**: Client-side regex in `ROLE_VIOLATIONS` rejects AI scenarios with obviously wrong assignments (pitcher as cutoff, SS covering 1st on bunts, etc.) as a last-resort safety net.

**Token Budget**: Worst case (manager, all 6 maps): ~2,141 tokens total prompt. Against the 2M context window, this is negligible.

These blocks are maintained in constants and helper functions near `generateAIScenario()`. When updating principles in this document, also update the corresponding code.

---

## Appendix B: Batch Planning Template

Use this template when generating new scenario batches:

```
Generate [NUMBER] new [POSITION] scenarios for the SCENARIOS.[position] array in index.jsx.

Each scenario needs:
- id: "[prefix][next number]"
- title: Short catchy name
- diff: [1, 2, or 3]
- cat: category tag
- description: 2-3 vivid sentences. Include inning, score, outs, count, who's batting.
- situation: {inning, outs, count, runners array, score array}
- options: exactly 4 choices
- best: 0-indexed optimal choice
- explanations: 4 detailed explanations teaching WHY
- rates: 4 success rates (best 75-90, decent 45-65, poor 10-40)
- concept: One-sentence strategic lesson
- anim: one of [strike, strikeout, hit, groundout, flyout, steal, score, advance, catch, throwHome, doubleplay, bunt, walk, safe, freeze]

Focus: [SPECIFIC TOPICS]

CRITICAL: All scenarios must comply with the Principles Library in SCENARIO_BIBLE.md.
Run the Quality Checklist before finalizing.
```

---

## Scenario Counts (394 total)

| Position | Count | Notes |
|----------|-------|-------|
| pitcher | 59 | |
| batter | 58 | |
| baserunner | 57 | |
| manager | 58 | |
| catcher | 30 | |
| shortstop | 16 | |
| centerField | 16 | |
| secondBase | 15 | |
| thirdBase | 15 | |
| leftField | 15 | |
| firstBase | 14 | |
| rightField | 15 | |
| famous | 10 | |
| rules | 8 | |
| counts | 8 | |

---

## Concept Re-teaching Policy

When a player answers a scenario wrong, spaced repetition should **not** replay the exact same scenario. Instead:

1. **Handcrafted pool**: Pick a DIFFERENT scenario from the same position pool, avoiding the exact scenario ID the player got wrong. Any different scenario is better than an exact repeat — the variety keeps engagement high while still reinforcing position knowledge.

2. **AI-generated re-teaching**: When Pro users trigger AI generation and they have previously-wrong concepts, there is a 50% chance the AI will receive a `targetConcept` parameter. The AI prompt instructs it to create a completely different game situation (different inning, score, runners, context) that teaches the same strategic concept from a new angle.

3. **Smart recycling priority** (when all scenarios in a position are seen):
   - **Priority 1**: Scenarios the user previously got wrong — these need revisiting
   - **Priority 2**: Least-recently-seen — avoid the last half of the play history
   - **Priority 3**: Random from the full pool

4. **Mastery screen**: Shows only once per position when a free user exhausts all scenarios. On subsequent plays, a "Review Mode" toast appears and smart recycling provides the next scenario.

---

## Key Sources

- [MLB Official Rules](https://www.mlb.com/official-rules) — Tier 1
- [FanGraphs RE24 / Run Expectancy](https://library.fangraphs.com/misc/re24/) — Tier 2
- [Baseball Savant / Statcast](https://baseballsavant.mlb.com/) — Tier 2
- [Baseball Reference](https://baseball-reference.com/) — Tier 2
- [SABR Research](https://sabr.org/) — Tier 2
- [Pro Baseball Insider — Pop Fly Priorities](https://probaseballinsider.com/baseball-instruction/pop-fly-priorities/) — Tier 3
- [Coach and Athletic Director — Priority System](https://coachad.com/articles/the-priority-system-in-baseball/) — Tier 3
- [ABCA (American Baseball Coaches Association)](https://abca.org/) — Tier 3
- [USA Baseball](https://usabaseball.com/) — Tier 3
- [Pro Baseball Insider — Relay Fundamentals](https://probaseballinsider.com/baseball-instruction/relay-and-cut-off-fundamentals/) — Tier 3
- [Pro Baseball Insider — SS Positioning for Cutoffs](https://probaseballinsider.com/shortstop-positioning-part-1-cut-offs-and-relays/) — Tier 3
- [Pro Baseball Insider — 3B Relay Positioning](https://probaseballinsider.com/baseball-instruction/third-base/third-base-positioning-for-relays/) — Tier 3
- [Pro Baseball Insider — Double Cuts & Relays](https://probaseballinsider.com/baseball-instruction/positioning-for-double-cuts-and-relays/) — Tier 3
- [Baseball Made Fun — Cutoff Cheat Sheet](https://baseballmadefun.com/baseball-cut-off-positions-cheat-sheet/) — Tier 3
