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

**Single Cuts to 2B (no play at home — runner stopping at 2nd):**

| From | Cutoff Assignment | SS Does |
|------|------------------|---------|
| Any OF | Cutoff man holds ball or redirects to 2B | SS covers 2B |

---

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
| P | HOME on ALL OF throws home. 3B on throws to third. 1B on bunt plays when 1B charges (RF is too far away on short bunt plays). |
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

### 3.12 Pickoff Move Mechanics (Authoritative — Sources: MLB Official Rules 6.02, ABCA)

**Cardinal Rules:**
1. From the stretch: step directly toward the base AND throw = legal pickoff. No step = balk.
2. From the windup: pitcher must step off the rubber before pivoting toward a base.
3. Fake to third, throw to first: ILLEGAL since 2013 (Rule 6.02(a)(4)). Always a balk.
4. Stepping off the rubber: pitcher becomes a fielder — no balk restrictions apply.
5. Throw to an unoccupied base without a play attempt = balk.

**When to Throw to First:**
| Situation | Action |
|-----------|--------|
| Runner takes extended lead (>12 feet) | Throw — challenge the lead |
| Runner's weight is forward / leaning | Throw — catch him mid-lean |
| Runner takes same lead 3x in a row | Throw — he's predictable |
| Catcher gives pickoff sign | Throw — coordinated play |
| No tell present | Don't throw — you're just tipping your rhythm |

**Daylight Play (Pickoff at 2nd):**
- SS or 2B breaks toward second base. If daylight appears between the fielder and the runner, the pitcher turns and throws.
- Pitcher initiates on fielder movement — NEVER before.
- Requires practiced timing and a runner with a large secondary lead.

**Pitchout:**
- Catcher signals pitchout. Pitcher throws outside, catcher steps out and fires to a base.
- Best used on 1-0, 2-0, 3-1 counts when a steal or hit-and-run is expected.
- Cost: adds a ball to the count. Use sparingly.

**Balk Quick Reference (Most Common):**
1. Start motion, don't finish (flinch balk)
2. Throw to unoccupied base without a play
3. Fake third, throw first (banned since 2013)
4. Fail to step directly toward the base you're throwing to
5. Drop the ball while in contact with the rubber

**Never-Do Rules:**
- Never throw to first blindly on every pitch — disrupts YOUR timing, not just theirs.
- Never fake to second as a primary move — it rarely works and wastes a look.
- Never throw to a base when the fielder isn't there.

---

### 3.13 Pitch Clock Strategy (Source: MLB Official Rules 5.07(c), 2023+)

**The Rule:**
- Pitcher: 15 seconds with bases empty, 20 seconds with runners on. Violation = automatic ball.
- Batter: Must be in box and alert with 8 seconds remaining. Violation = automatic strike.
- Each batter gets ONE timeout per plate appearance.

**Why It Matters Strategically:**

For Pitchers:
- Working fast keeps your defense engaged and sharp. Slow tempo → fielders drift mentally.
- In high-leverage counts (0-2, full count), use your full 20 seconds with runners on. Make the hitter wait.
- Vary your tempo — quick pitch followed by a longer hold disrupts timing more than a constant pace.
- Never rush a high-leverage pitch just to beat the clock. Own your tempo.

For Batters:
- You have 1 timeout per PA. Save it for a leverage moment (0-2 count, pitcher on a roll).
- Pitch clock violations give you free balls. Recognize when a pitcher is rushing and may get the call.
- Never use your timeout on a 0-0 or 1-0 count — save it.

For Baserunners:
- Pitchers can't hold the ball to reset your timing — the clock forces consistent delivery windows.
- Steal timing becomes more predictable. Secondary leads are MORE valuable under the clock.

For Catchers:
- Sign sequences must be fast (under 9 seconds). Practice fast sign delivery.
- Mound visits slow things down and reset the pitcher's adrenaline — use them strategically.

**Never-Do Rules:**
- Pitcher: never let the clock run out by accident. Own your pace.
- Batter: never waste your one timeout on a low-leverage count.
- Pitcher: never rush a 0-2 or full-count pitch to beat the clock — location beats velocity.

---

### 3.14 Wild Pitch / Passed Ball Coverage (Source: ABCA, coaching consensus)

**Cardinal Rules:**
1. Catcher goes to the ball immediately — do NOT look at the runner first.
2. Pitcher breaks to cover home the instant the ball gets past the catcher.
3. Third baseman backs up home on any ball in the dirt with a runner on 3rd.
4. Baserunner reads the catcher's first step — that tells you whether to go or hold.

**Coverage by Runner Situation:**
| Runners | Catcher Action | Pitcher Action | 3B Action |
|---------|---------------|----------------|-----------|
| R3 only | Scramble to ball, look to retire R3 | Sprint to home, set up as backstop | Back up home (line up behind pitcher) |
| R1 only | Retrieve, look to 2B | Cover home (backup) | Cover 3B |
| R1 & R2 | Retrieve, look to 3B first | Sprint to home | Cover 3B |
| Bases loaded | Retrieve, step on home for force | Sprint to home | Back up home |

**Pitcher Coverage Detail:**
- Ball rolls to backstop: sprint to home, set up on the FIRST-BASE SIDE of the plate (give catcher a lane to throw).
- Take the throw in fair territory, apply the tag on the third-base side.
- If ball stays close to home: catcher fields and makes the play — pitcher still sprints as backup.

**Baserunner Read:**
- R3: If catcher breaks to retrieve AND ball rolls 10+ feet past the plate, GO. Watch catcher's first step — hesitation means go.
- R1: Look for a bobble or ball rolling away — if catcher fields cleanly in front of the plate, hold.
- Never advance from second on a wild pitch if the catcher fields cleanly.

**Never-Do Rules:**
- Catcher: never look at the runner before going to the ball. Field first, throw second.
- Pitcher: never stay on the mound when a wild pitch passes the catcher. Sprint immediately.
- 3B: never stay at third when a wild pitch is thrown with R3. Sprint to the backup spot behind home.

---

### 3.15 Infield Fly Rule — Full Mechanics (Source: MLB Official Rules 5.09(b)(6))

**The Rule:**
An infield fly is declared by the umpire when ALL of the following are true:
1. Fewer than 2 outs
2. Runners on 1st and 2nd, OR bases are loaded
3. A fair fly ball (not a line drive, not a bunt) that can be caught by an infielder with ordinary effort

**What Happens:**
- Batter is automatically OUT — regardless of whether the ball is caught or dropped.
- Runners are NOT forced to advance — they may advance at their own risk.
- If the ball drops fair untouched, runners may advance — but they may also stay.
- If a fielder intentionally drops the ball after IFF is called, batter is STILL out.

**Why the Rule Exists:**
Without it, a fielder could intentionally drop the ball to get a cheap double play (force at second, force at first). The rule protects runners from this trap.

**Edge Cases:**
| Situation | Ruling |
|-----------|--------|
| IFF called, ball drops fair | Batter still out. Runners may advance at own risk. |
| IFF called, ball caught | Batter out. Runners may tag up and advance. |
| IFF called, ball drifts foul | IFF cancelled. Ordinary foul ball. |
| Outfielder catches ball after IFF called | Still IFF — batter out. Location of fielder doesn't matter. |
| Line drive that falls in | NOT an IFF. Force play rules apply normally. |
| Pop-up near foul line | Umpire discretion — must judge "ordinary effort." |

**Position Responsibilities:**
- Fielder calling the ball: just make the catch. Don't let it drop on purpose — chaos results even though batter is out.
- Baserunner: stay close to your base. The rule protects you — don't advance early and risk being doubled off.
- Manager: know that IFF applies to outfielders too if they make the catch — the call is based on "ordinary effort," not field position.

---

### 3.16 Defensive Positioning Post-Shift Ban (Source: MLB Official Rules 5.02, 2023+)

**The Rule (2023+):**
- All four infielders must be positioned within the infield boundary when the pitch is delivered.
- Two infielders must be on each side of second base.
- Violation: offense may choose to accept the play result OR take an automatic ball.

**What Is Still Legal:**
| Strategy | Legal? | Notes |
|----------|--------|-------|
| 2B positioned deep in the hole toward 1B | Yes | Still on right side of 2B |
| SS shading dramatically toward the 3B hole | Yes | Still on left side of 2B |
| 3B playing on the outfield grass | No | Must remain in infield |
| 3 infielders on one side of 2B | No | Requires 2 on each side |
| Outfielders shifting dramatically | Yes | No positioning rule for outfielders |
| Infield in (all 4 charging toward plate) | Yes | Legal — all 4 still within infield |

**How Batters Exploit the New Rule:**
- Left-handed pull hitters benefit most — the 3-infielder overshift is gone.
- Pulling the ball is viable again for LHH. "Go the other way" is less mandatory.
- Ground ball up the middle: with 2B required on the right side, this is no longer automatically an out.
- Bunt to the third-base side: still effective against any defense that plays back.

**Manager/Pitching Considerations:**
- Cannot hide a weak fielder by positioning them away from likely contact.
- Outfield overshift is still legal — teams compensate by shifting outfielders for pull hitters.
- Pitchers must adjust: location that previously induced cheap outs (pull side) may now be hits.

---

### 3.17 Squeeze Play Variants & Defense (Source: ABCA, coaching consensus)

**Two Types of Squeeze:**
| Type | Batter Commitment | Runner Commitment | Risk |
|------|------------------|-------------------|------|
| **Safety Squeeze** | Bunts only if he can get it down | Runner goes on CONTACT | Lower — runner doesn't fully commit |
| **Suicide Squeeze** | MUST bunt no matter what | Runner commits and goes on PITCHER'S FIRST MOVE | High — if batter misses, runner is dead |

**When to Use Each:**
- Safety squeeze: tie game, late innings, 0-1 out, batter is a reliable contact bunter.
- Suicide squeeze: defense playing back, batter has the sign, runner is fast, run is critical.
- NEVER run a suicide squeeze with 2 strikes — a foul bunt = strikeout AND the runner is dead.

**Offensive Execution:**
- Batter (suicide): show bunt as LATE as possible — square around only as pitcher commits to delivery. Must get the ball on the ground.
- Runner (suicide): break on the pitcher's FIRST movement. Cannot hesitate. Going no matter what.
- Batter (safety): read the pitch location. Good pitch = bunt. Bad pitch = pull back, runner holds or scrambles back.

**Defensive Detection & Response:**
| Read | Response |
|------|----------|
| Runner breaks hard from 3rd before pitch | Pitchout immediately if count allows |
| Batter squares early | Charge hard, read batter's hands |
| Full count with runner on 3rd | Suicide squeeze is a common setup — be ready |

**Pitcher's Best Response:**
- Best pitch against a squeeze: high and tight fastball — hardest to bunt, naturally lifts the bat.
- Worst pitch against a squeeze: low and away breaking ball — easy to push down the line.
- If you detect it early: throw HIGH AND TIGHT immediately.

**Catcher Response:**
- If runner breaks and batter pulls back: fire to 3B — runner may be hung out to dry.
- If batter bunts: field the ball first, THEN look to retire the runner at home.
- Never commit to a throw before you have possession of the ball.

**Never-Do Rules:**
- Offense: never run a suicide squeeze on 2 strikes. One foul = automatic out on the bases.
- Defense: never pitch out without reading the runner breaking first.
- Pitcher: never groove a fastball down the middle when a squeeze is suspected.

---

### 3.18 Times Through the Order — Pitching Change Framework (Source: FanGraphs TTO research, coaching consensus)

**Times Through the Order (TTO) Effect:**
| TTO | BA Increase vs 1st Time Through |
|-----|----------------------------------|
| 1st time through | Baseline |
| 2nd time through | +15 points |
| 3rd time through | +30 points |

Source: FanGraphs (large sample, consistent across eras). Effect is real regardless of pitch count.

**Why It Happens:**
Batters see the pitcher's full arsenal during their first two trips to the plate. By the third, they've timed his fastball, identified his go-to breaking ball, and exploited any patterns. Familiarity compounds with each additional at-bat.

**Decision Framework for Managers:**
| Situation | Decision |
|-----------|----------|
| Starter entering 3rd TTO with a lead | Consider reliever regardless of pitch count |
| Starter entering 3rd TTO with heart of order due | Strong case to pull — +30 BA points against your best hitters |
| Starter entering 2nd TTO with 85+ pitches | Monitor closely, reliever warming |
| Starter struggling in 1st TTO | Pitch count matters less — it's execution, not familiarity |

**Platoon Compound Effect:**
TTO + wrong-side platoon = massive disadvantage.
RHP vs LHH for the 3rd time: +30 (TTO) + ~18 (platoon) = ~+48 BA points above baseline. This is when the pitching change is urgent.

**The Reliever's Advantage:**
A fresh reliever resets batter familiarity to zero. This is the strategic core of modern bullpen usage — not "saving" the closer, but eliminating the TTO penalty.

**When to Override the Data:**
- Pitcher is dominating (8+ K, low pitch count, max velocity) → let him face 3rd TTO
- No reliable reliever available → manage within the frame, pitch carefully
- Low-leverage situation (large lead) → pitcher survival reps have value

---

### 3.19 Intentional Walk Decision Framework (Source: RE24, coaching consensus)

**The Core RE24 Reality:**
An intentional walk always increases run expectancy by adding a baserunner. You are never "saving runs" by walking someone — you are trading a difficult at-bat for a worse base-out state in exchange for a matchup or tactical advantage.

**RE24 Impact Example:**
- Runner on 2nd, 1 out (RE: 0.71) → IBB → Runners on 1st & 2nd, 1 out (RE: 0.96)
- You just added **0.25 expected runs**. This only makes sense if the matchup/tactical gain outweighs it.

**When an IBB Makes Sense:**
| Condition | Justification |
|-----------|--------------|
| First base is open | Creates force-out options, eliminates squeeze, enables DP |
| Massive skill gap to next hitter | Next hitter is significantly and demonstrably weaker |
| Large platoon advantage vs next hitter | L/R matchup swing is large enough to offset the RE cost |
| Set up double play | Runner on 2nd, 1 out — IBB fills 1st, next hitter is a heavy ground ball type |

**When an IBB Almost Never Makes Sense:**
| Condition | Why |
|-----------|-----|
| Bases loaded | You force in a run. RE jumps to 2.29. Almost never justified. |
| Two outs | Force plays exist regardless. You're just adding a baserunner for a 2-out situation. |
| Next hitter is not meaningfully weaker | You're adding a runner with no matchup payoff. |
| Score is close and inning is late | Every additional runner is compounding danger. |

**Modern Note (2023+):**
IBB is now signaled by the manager directly — no pitches thrown. The old risk of a wild IBB pitch is gone. This makes the decision purely strategic, with no execution risk.

---

### 3.20 Mound Visit Protocol (Source: MLB Official Rules 5.10(l), ABCA)

**The Rules:**
- Each team gets 5 mound visits per 9 innings (not including pitching changes).
- A second mound visit to the same pitcher in the same inning = mandatory pitching change.
- Catcher visits (without the manager) count as an official mound visit.
- If a team has no remaining visits, the manager may still visit but must remove the pitcher.

**Strategic Purposes:**
| Reason | Who Should Visit |
|--------|-----------------|
| Change signs (runner on 2nd stealing signs) | Catcher |
| Pitcher is rattled or overthrowing | Catcher or manager |
| Defensive alignment check before key at-bat | Catcher or infielder |
| Pitcher is tipping pitches | Manager (private conversation) |
| Reset after error behind the pitcher | Catcher — show solidarity |
| Clock/momentum management in high-leverage moment | Manager (costs a visit — use wisely) |

**What to Actually Say:**
- "Forget that. It's over. Let's get this guy." — Reset after a rough moment
- "He's sitting on your fastball. Bury a breaking ball in the dirt." — Share a batter tendency
- "New sequence: start cutter inside, breaking ball away." — Adjust the approach
- "Your mechanics are off — you're flying open. Stay closed." — Quick technical fix
- NEVER discuss the score, revisit the last pitch's result, or say anything that increases pressure. Focus forward only.

**When NOT to Visit:**
- Pitcher is in rhythm and throwing well — a visit disrupts timing and wastes a visit.
- Fresh count, no damage done yet.
- Just to stall — save your visits for genuine resets.

**Sign Change Protocol (Runner on 2nd):**
1. Catcher goes to mound
2. Establish indicator system: "Third sign is real" or "Look for my thumb as the key"
3. Keep it under 30 seconds
4. After returning, briefly signal the new system to SS and 2B

---

### 3.21 Outfield Communication & Positioning (Source: ABCA, Pro Baseball Insider)

**Priority System (Reinforcement of Section 3.5):**
- CF has priority over ALL players — corner OF AND all infielders — on any ball he can reach.
- Corner OF has priority over their nearest infielder (LF > 3B/SS on tweeners; RF > 1B/2B on tweeners).
- Going IN = easier. Ball is in front of you. Going BACK = hardest catch in baseball.
- Call early, call loud, call TWICE: "I got it! I got it!" — everyone else peels off after the second call.

**Pre-Pitch Positioning Adjustments:**
| Hitter Tendency | LF | CF | RF |
|----------------|----|----|-----|
| Dead pull RHH | Step toward LF line | Shade left-center | Play normal/shallow |
| Dead pull LHH | Play shallow | Shade right-center | Step toward RF line |
| Spray hitter | Normal | Normal | Normal |
| Power pull RHH | Back up 15 ft + shade line | Deep left-center | Normal |
| Ground ball pitcher | Shade in 10 feet | Shade in | Shade in |
| Fly ball pitcher | Play deeper | Play deeper | Play deeper |

**Gap Communication:**
- Ball to LF-CF gap: CF calls it if he can reach. If CF calls it, LF peels off and backs up the throw. If CF doesn't call, LF takes it and calls loud.
- Ball to CF-RF gap: CF calls it if he can reach. If RF calls it, CF backs up the throw.
- Middle infielders: go to relay position — do NOT attempt a play on a ball an outfielder can reach.

**Sun and Wind Conditions:**
- Sun behind you: step to the side before the pitch so sun isn't directly in your tracking path.
- Sun in front of you: glove shield first, then track the ball through the glove. Eyes ALWAYS on the ball.
- Wind blowing out: play deeper than normal — fly balls carry more than expected.
- Wind blowing in: play shallower — fly balls die faster.
- Communicate conditions to teammates before the inning: "Wind is blowing out to left — play deeper."

**Wall Play Principles:**
- Find the wall with your hand BEFORE the ball arrives — one fingertip touch, eyes stay on the ball.
- Never crash the wall at full speed without knowing where it is.
- After a wall play, momentum carries you INTO the wall — release the throw quickly or let the relay man handle it.

**Never-Do Rules:**
- Never allow a no-call fly ball situation. SOMEONE must call every ball.
- Never call off CF on a ball CF is already calling. His priority is final.
- Never guess on a sun ball — the glove-shield method is always the answer.
- Corner OF: never attempt a full throw home without hitting the cutoff first, unless you are absolutely certain of the play.

---

### 3.22 Pop-Up Priority & Mechanics (Authoritative — Sources: ABCA, Pro Baseball Insider, MLB Rules)

**Cardinal Rules:**
1. OF coming in > IF going back. Always. This applies to pop-ups in fair AND foul territory.
2. CF has priority over corner OF on any pop-up he can reach.
3. Catcher has priority on all pop-ups within ~30 feet of home plate — turns back to field (ball curves back).
4. First caller owns it. Everyone else peels off.

**Priority Hierarchy (pop-ups in fair territory):**
CF > Corner OF > SS/2B > 1B/3B > Pitcher > Catcher (except near home)

**Catcher Pop-Up Mechanics:**
- Remove the mask: toss it away from where you're moving
- Turn your back to the field — the ball always curves back toward fair territory
- Pitcher locates it verbally: "Ball! Ball!" then gets out of the way

**Foul Territory:**
- OF has priority over nearest infielder on foul pop-ups they can reach
- Ball drifts AWAY from the fielder — set up slightly inside the ball's path

**Never-Do Rules:**
- NEVER two fielders converge on a pop-up without calling
- NEVER watch a pop-up drop uncalled — nearest fielder must take it
- NEVER catcher watches home plate while tracking a pop-up

---

### 3.23 Obstruction & Interference (Authoritative — Sources: MLB Official Rules 6.01 & 6.03)

**The Critical Distinction:**
- **OBSTRUCTION**: FIELDER impedes a RUNNER → Fielder is at fault
- **INTERFERENCE**: RUNNER or BATTER impedes a FIELDER → Runner/batter is at fault

Memory device: "O = fielder Obstructs runner. I = runner Interferes with fielder."

**Obstruction — Two Types:**

| Type | Situation | Result |
|------|-----------|--------|
| Type A | Fielder without ball blocks base path when runner is in immediate play | DEAD BALL immediately. Runner awarded base they would have reached. |
| Type B | Fielder without ball impedes runner not in immediate play | Play continues. Umpire awards bases after the play if runner was disadvantaged. |

**Legal Block:** Fielder may block the base path ONLY when actively fielding a batted ball OR already has possession. Receiving a throw and then blocking = legal.

**Plate Block Rule:** Catcher must give the runner a lane to the plate if the ball has not arrived. Blocking without the ball = Type A obstruction.

**Interference — Common Types:**

| Type | Situation | Result |
|------|-----------|--------|
| Batter interference | Batter intentionally hits catcher's glove on backswing | Out |
| Runner interference | Runner deliberately contacts fielder making a play | Runner out, batter returns |
| Batted ball | Fair ball hits runner before passing an infielder | Runner out |
| DP interference | Runner goes outside base path or contacts fielder to break up DP | Runner AND batter out |

---

### 3.24 Tag-Up & Sacrifice Fly (Authoritative — Sources: MLB Rule 5.09(b)(5), FanGraphs RE24)

**Tag-Up Rule:**
- Runner must re-touch their base after a caught fly ball before advancing
- May leave the INSTANT the fielder's glove contacts the ball
- Early departure = appealable out (defense throws to the base the runner left early)

**Timing the Leave:**
- Watch the fielder's feet and glove — not the ball in the air
- Begin shifting weight when fielder is 3-4 steps from the catch
- Full sprint the instant the ball is caught

**Sacrifice Fly RE24:**
- Sac fly with R3, <2 outs = RE-positive (scores a run, worth the out)
- Unlike the sac bunt, a sac fly does NOT lower run expectancy
- Sac fly attempt with runner on 2nd = almost never correct (fly ball from 2nd to home is very rare)

**OF Throw After Tag-Up:**
- Hit the cutoff unless throw clearly beats the runner
- CF → home: cutoff is 1B. LF → home: cutoff is 3B. RF → home: cutoff is 1B.

---

### 3.25 Pitching Change Mechanics (Authoritative — Sources: MLB Rules 5.07, 5.10, ABCA)

**Manager Visit Rules:**
- Crossing the foul line = automatic pitching change unless injury/defensive conference
- 2nd visit to same pitcher in same inning = mandatory removal (no exceptions)
- 5 team mound visits allowed per 9 innings (clock resets on extra innings)

**3-Batter Minimum (2020+):**
- Relief pitcher must face at least 3 batters OR end the half-inning
- Exception: pitcher injury or illness declared by manager
- No more LOOGY (left-one-out guy) matchup moves

**Warm-Up:**
- New pitcher receives 8 warm-up pitches (Rule 5.07(b))
- Catcher warms up reliever; infielder may substitute if catcher is injured

**Inherited Runner Rule:**
- Runs scored by inherited runners are charged to the ORIGINAL pitcher
- Reliever is not responsible for inherited runners who score

---

### 3.26 Intentional Walk (Authoritative — Sources: MLB Rules, FanGraphs RE24, 2023 rule change)

**2023+ Rule:** Manager signals IBB from dugout. No pitches thrown. Batter goes directly to 1B.

**RE24 Reality:** An IBB always increases run expectancy. It is never "safe" — it is always a trade of a difficult at-bat for a worse base-out state.

**IBB Justification Framework:**

| Condition | IBB Justified? |
|-----------|---------------|
| First base open + next hitter clearly weaker | Yes |
| Setting up force play at home | Sometimes |
| Large platoon advantage vs next hitter | Yes, if gap is >20 BA points |
| Avoiding a dominant hot hitter | Sometimes |
| Bases loaded | Never |
| Two outs, next hitter not dramatically weaker | No |
| Early in game (inning 1-5) | Rarely |

**Runner Advancement on IBB:**
- Runners forced by the batter's advancement move one base automatically
- No runner advances more than one base

---

### 3.27 Defensive Positioning — Shift Era & Shift Ban (Authoritative — Sources: MLB Rule 2023+, coaching consensus)

**Shift Ban Rule (2023+):** At pitch, all 4 infielders must be in the infield dirt with 2 on each side of 2B. Violation = automatic ball.

**Legal Positioning:**
- Deep positioning (near outfield grass)
- Infield in
- Outfield shifts (no restriction on OF)
- Standard pull-side alignment within 2-per-side rule

**Illegal:**
- 3 infielders on one side of 2B
- Any infielder in outfield grass in normal defensive alignment
- SS crossing to the right side of 2B for a LHH

**Strategic Alternatives:**
- Play corners deep to take away doubles down the line
- Use pitch location to direct the ball toward your strongest defensive alignment
- 4-outfielder alignment (rare but legal)

---

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

### 3.28 Catcher Framing (Source: Baseball Savant Statcast, ABCA)

**The Principle:**
Framing is the art of receiving and presenting borderline pitches to maximize called strikes without obvious glove movement that draws umpire attention.

**Context-Dependent Technique:**

| Situation | Technique |
|-----------|-----------|
| Borderline pitch, any count | Subtle glove pull — move 1-2 inches toward the strike zone at the catch |
| High-leverage count (0-2, 1-2, 2-strike) | Stillness and presentation — minimize movement, let the location speak |
| Clear ball, any count | Accept the call cleanly — fighting a clear ball damages framing credibility on future borderline pitches |

**Why It Matters:**
Elite framers earn 20-30 extra called strikes per season above average. Each additional called strike in a plate appearance reduces the batter's wOBA by approximately 0.015 (Baseball Savant Statcast data). Framing is a measurable, trainable skill — not luck.

**Common Mistakes:**
- Yanking the glove toward the zone on a pitch that clearly missed — umpires recognize this immediately
- Using the same technique on every pitch — kills credibility on the pitches where framing actually matters
- Showing frustration at a called ball — costs future borderline calls for the rest of the game

**Never-Do Rules:**
- Never yank the glove on a ball that clearly missed the zone
- Never present identical framing technique regardless of count or pitch location
- Never show frustration visibly at a called ball

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
- Platoon advantage: ~18 BA points for opposite-hand matchup (range: 15-20 depending on pitcher type). Source: FanGraphs. Used as `platoonEdge: 18` in BRAIN.stats.
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
16. **Pop-up priority** (all 9 defensive + MGR): CF priority over all on balls he can reach. Catcher within 30 feet turns back to field. OF > IF in foul territory per Section 3.22.
17. **Obstruction/interference** (all positions): Obstruction = fielder impedes runner (fielder's fault). Interference = runner/batter impedes fielder (runner's fault). Type A = dead ball per Section 3.23.
18. **Tag-up/sac fly** (LF, CF, RF, BAT, BR, MGR): Runner leaves on the catch. Early departure = appealable out. Sac fly with R3 is RE-positive. Correct cutoff per Section 3.24.
19. **Pitching change** (P, C, MGR): 2nd mound visit same inning = mandatory removal. 3-batter minimum applies. Inherited runners charged to original pitcher per Section 3.25.
20. **Intentional walk** (P, C, BAT, BR, MGR): 2023+ = signal only, no pitches. IBB always costs RE. Never with bases loaded. Forced runners advance one base per Section 3.26.
21. **Shift positioning** (1B, 2B, SS, 3B, BAT, BR, MGR): 2023+ requires 2 infielders each side of 2B at pitch. 3 on one side = illegal. Outfield and infield-in shifts still legal per Section 3.27.
22. **Mound visits** (P, C, MGR): 2nd visit to same pitcher in same inning = mandatory removal. 5 total visits per 9 innings. Catcher visits count. Per Section 3.20.
23. **Taking/Swinging** (BAT, BR): Never frame any count situation as "always take" or "always swing." Must be situational and count-dependent.
24. **Sun defense** (LF, CF, RF): Glove technique is primary. Sunglasses are supplementary. Never present sunglasses as the first or only option.
25. **Catcher framing** (C): Subtle glove pull on borderline pitches. Stillness and presentation in high-leverage counts. Never present as identical technique in all situations.

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
- [ ] Pickoff moves match Section 3.12 — no fake-third/throw-first, step required, daylight play fielder breaks first
- [ ] Squeeze play scenarios match Section 3.17 — safety vs suicide commitment timing is correct, never suicide on 2 strikes
- [ ] Wild pitch coverage matches Section 3.14 — catcher goes to ball first, pitcher sprints home, 3B backs up
- [ ] Outfield communication matches Section 3.21 — CF priority is correct, gap ball caller is correct, no no-call fly balls
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
- [ ] Taking vs swinging: never frame as absolute. Never "always take" or "always swing" — frame as count-dependent and situational
- [ ] Sun defense: glove technique is primary, sunglasses are supplementary. Never present sunglasses as first option
- [ ] Catcher framing: subtle pull on borderline pitches; stillness in high-leverage counts. Never present as one-size-fits-all technique
- [ ] Sacrifice bunts: acknowledge RE24 trade-off (bunts lower RE except in narrow late-game situations)
- [ ] Stolen bases: acknowledge ~72% break-even rate in explanations when relevant
- [ ] Mound visits: if scenario involves a second visit to the same pitcher in the same inning, it must result in mandatory removal

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
3. **Conditional Knowledge Maps**: 17 maps injected only when relevant to the current position via `getRelevantMaps(position)` (plus 2 always-injected maps = 19 total):
   - `BUNT_DEFENSE_MAP` — P, C, 1B, 2B, SS, 3B, MGR
   - `FIRST_THIRD_MAP` — P, C, 1B, 2B, SS, 3B, MGR
   - `BACKUP_MAP` — All 9 defensive + MGR
   - `RUNDOWN_MAP` — 1B, 2B, SS, 3B, BR, MGR
   - `DP_POSITIONING_MAP` — P, 1B, 2B, SS, 3B, MGR
   - `HIT_RUN_MAP` — 2B, SS, BAT, BR, MGR
   - `PICKOFF_MAP` — P, C, 1B, 2B, SS, 3B, BR, MGR
   - `PITCH_CLOCK_MAP` — P, C, BAT, BR, MGR
   - `WP_PB_MAP` — P, C, 1B, 3B, BR, MGR
   - `SQUEEZE_MAP` — P, C, 1B, 3B, BAT, BR, MGR
   - `INFIELD_FLY_MAP` — 1B, 2B, SS, 3B, BAT, BR, MGR
   - `OF_COMMUNICATION_MAP` — LF, CF, RF
   - `POPUP_PRIORITY_MAP` — All 9 defensive + MGR
   - `OBSTRUCTION_INTERFERENCE_MAP` — ALL positions (always injected)
   - `TAGUP_SACRIFICE_FLY_MAP` — LF, CF, RF, BAT, BR, MGR
   - `PITCHING_CHANGE_MAP` — P, C, MGR
   - `INTENTIONAL_WALK_MAP` — P, C, BAT, BR, MGR
   - `LEGAL_SHIFT_MAP` — 1B, 2B, SS, 3B, BAT, BR, MGR
4. **Data Reference Block**: Key RE24 data, count averages, stolen base break-even, fly ball priority hierarchy, relay default, force/tag rules.
5. **Self-Audit Block**: 9 base checks + conditional per-position checks via `getRelevantAudits(position)`.

**Architecture**: `MAP_RELEVANCE` maps each of the 19 knowledge maps to its relevant positions. `getRelevantMaps()` filters and concatenates only the maps needed. `getRelevantAudits()` generates numbered audit items (starting at 10) for the injected maps. This keeps the prompt focused — a batter gets hit-and-run but not bunt defense; a manager gets everything.

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
