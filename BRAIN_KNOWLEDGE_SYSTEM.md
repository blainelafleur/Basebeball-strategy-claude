# Baseball Strategy Master — Brain & AI Knowledge System Reference

> This document extracts the entire in-code knowledge system from `index.jsx` into a readable reference. It covers the BRAIN constant, all 7 knowledge maps, POS_PRINCIPLES, coach line system, AI prompt template, role violations, and Brain API functions. Use this alongside `SCENARIO_BIBLE.md` to reason about, expand, and verify the knowledge system.

---

## Table of Contents

1. [POS_PRINCIPLES — Position-Specific Principles](#1-pos_principles--position-specific-principles)
2. [Knowledge Maps (7 Authoritative Maps)](#2-knowledge-maps-7-authoritative-maps)
3. [Map Relevance & Audit System](#3-map-relevance--audit-system)
4. [BRAIN Constant — Centralized Knowledge Engine](#4-brain-constant--centralized-knowledge-engine)
5. [Brain API — Pure Utility Functions](#5-brain-api--pure-utility-functions)
6. [AI Scenario Generation — Full Prompt Template](#6-ai-scenario-generation--full-prompt-template)
7. [Role Violation Detection](#7-role-violation-detection)
8. [Coach Line System](#8-coach-line-system)
9. [Cross-References & Consistency Notes](#9-cross-references--consistency-notes)

---

## 1. POS_PRINCIPLES — Position-Specific Principles

These are injected directly into every AI-generated scenario prompt. They define the authoritative boundaries for what each position does and doesn't do.

### Pitcher
> Pitch selection depends on count, situation, and batter tendencies. First-pitch strikes are critical (.340 BA on first-pitch strikes vs .167 on 0-2). Work ahead in the count. Pitch to contact with a lead; pitch for strikeouts in high leverage. From the stretch with runners on: be quick to the plate, vary hold times. Pickoffs: disrupt timing, don't just throw blindly. FROM STRETCH: step directly toward the base AND throw — no step = balk. NEVER fake to third and throw to first (balk since 2013). DAYLIGHT PLAY at 2nd: SS/2B breaks first, throw only when daylight shows. STEP OFF the rubber to remove all balk restrictions. Vary your looks — same look every pitch = zero deception. Pitch sequencing: set up pitches with eye level and speed changes. DEFENSIVE: Field bunts, cover 1B on grounders to right side. WILD PITCH/PASSED BALL: sprint to cover home the instant the ball passes the catcher — set up on the first-base side to give the catcher a throwing lane. Back up home on ALL OF throws home. Back up 3B on throws to third. NEVER be the cutoff or relay man — that is ALWAYS an infielder.

### Catcher
> The catcher is the field general — calls pitches based on count, batter weakness, and game situation. Framing: subtle glove pull on borderline pitches; stillness in high-leverage counts. Blocking: smother balls in the dirt, keep them in front. Throwing out runners: quick transfer, strong accurate throw to the bag side. Pop-ups near home: catcher has priority, turn your back to the field (the ball curves back toward the field). Mound visits: calm the pitcher, refocus on the plan. NEVER leave home unattended with runners in scoring position. Direct the cutoff man: 'Cut!' (hold), 'Cut two/three!' (redirect), or let it go. Block the plate legally (give a lane, receive and tag). WILD PITCH/PASSED BALL: go to the ball FIRST, then look at the runner — never the reverse. MOUND VISITS: use them to reset the pitcher, change signs, or relay a batter tendency — never to discuss the score or revisit a mistake. PITCH CLOCK: deliver signs under 9 seconds. You have 5 team mound visits per 9 innings — use them with purpose.

### First Base
> Scoop low throws — stretch toward the throw, keep your foot on the bag. Hold runners: give pitcher a target, apply tag on pickoff throws. On bunts: charge aggressively, 2B covers first. CUTOFF on throws from CF and RF to home — line up between OF and home plate, listen for catcher's call. When you're cutoff, 2B covers 1B. 3-6-3 double play: catch, step on first, throw to shortstop covering second. Know when force is removed (runner out ahead of you = tag play, not force).

### Second Base
> Double play pivot: receive the feed, touch second, get off the bag quickly to avoid the runner. RELAY (double-cut) on extra-base hits to the RIGHT side (RF line, RF-CF gap) — lead relay, line up between OF and home plate. Cover 1B when first baseman is the cutoff. On SINGLES from RF to home, 1B is the cutoff, NOT you. Cover first on bunts when 1B charges. FLY BALL PRIORITY: outfielder coming in ALWAYS has priority over you going back. Going back on a fly is the hardest catch — let the outfielder take tweeners.

### Shortstop
> Captain of the infield for communication. Double play feed: firm chest-high throw. RELAY (double-cut) on extra-base hits to the LEFT side (LF line, LF-CF gap, deep CF) — lead relay, line up between OF and home plate. CUTOFF on throws to 3B (runner advancing 1B→3B). On SINGLES from LF to home, 3B is the cutoff, NOT you — you cover 3B. Deep-hole play: plant hard, strong throw across the diamond. Steal coverage: straddle the bag, sweep tag down. FLY BALL PRIORITY: outfielder coming in ALWAYS has priority over you going back. Never call off an outfielder on a shallow fly — they have the easier catch.

### Third Base
> Hot corner: quick reactions on hard-hit balls. Bunt defense: crash hard, bare-hand if needed, strong throw to first. Slow rollers: charge aggressively, bare-hand pickup and throw in one motion. Guard the line late in close games to prevent extra-base hits. Against pull hitters (right-handed): shade toward the line. FLY BALL PRIORITY: outfielder coming in has priority on tweeners behind you. CUTOFF on singles from LF to home — line up between LF and home plate, listen for catcher's call. SS covers 3B when you go out as cutoff.

### Left Field
> Outfielder priority: you have priority over ALL infielders on fly balls you can reach. Coming in on a ball is easier than going back — the ball is in front of you. Hit the cutoff man — don't try to throw all the way home unless the play is there. Wall play: round the ball so momentum carries toward the infield. Back up third base on all infield ground balls. Sun balls: use glove as a shield. Your cutoff on throws home is the 3B. On doubles, your relay is the SS.

### Center Field
> You are the priority fielder on ALL fly balls you can reach — center fielder has priority over corner outfielders AND all infielders. Call it loud and early. Gap coverage: take angle routes, not straight-back routes. Do-or-die throws: charge the ball, crow-hop, throw through the cutoff. Communication is your responsibility — you see the whole field. Back up second base on infield plays. Your cutoff on throws home is the 1B. On doubles, your relay is the SS.

### Right Field
> Strong arm is your biggest weapon — throw out runners at third and home. Back up first base on EVERY infield grounder (your most important routine job). Outfielder priority: you have priority over infielders (1B, 2B) on fly balls you can reach. Coming in is always easier than going back. Cutoff throws: hit the cutoff unless you have a clear play. Wall play: learn caroms off the wall in your corner. Your cutoff on throws home is the 1B. On doubles, your relay is the 2B.

### Batter
> Count leverage is everything. Hitter's counts (1-0, 2-0, 2-1, 3-1): be aggressive on your pitch. Pitcher's counts (0-1, 0-2, 1-2): protect the zone, shorten up. Two-strike approach: expand the zone slightly, fight off tough pitches. Situational hitting: runner on third with less than 2 outs = fly ball scores him. Hit behind the runner to advance from second to third. RE24 data: sacrifice bunts usually LOWER run expectancy except with weak hitters late in close games needing exactly 1 run.

### Baserunner
> Stolen bases break even at ~72% success rate (per RE24) — below that, you're hurting your team. Read the pitcher: watch first-move pickoff tells, time his delivery. Tag-ups: watch the fielder's feet, leave on the catch. Line drives: freeze and read, never get doubled off. Advancing on contact: aggressive but smart — never make the first or third out at third base. Respect coach's signs always. Secondary leads: key to advancing on passed balls and wild pitches.

### Manager
> Manage by the situation, not by the book. RE24 run expectancy guides sacrifice bunt decisions (usually bad except: weak hitter, late game, need exactly 1 run). Stolen bases need ~72% success to break even. Pitching changes: matchup advantages (L/R platoon), fatigue, times through the order (batters hit ~30 points better third time through). Intentional walks: always increase run expectancy — you are trading a hard at-bat for a worse base-out state. Only justified when: (1) first base is open, (2) clear skill gap to next hitter, (3) large platoon advantage vs next hitter, or (4) setting up a force/DP with a heavy ground ball hitter. NEVER IBB with bases loaded. NEVER with 2 outs unless matchup gap is extreme. IBB is now signaled directly — no pitches thrown (2023+). TTO: batters hit +30 points the 3rd time through — pull the starter before the damage compounds. Defensive positioning: guard lines late, play for DP early. Cutoff assignments: 3B cuts LF throws home, 1B cuts CF/RF throws home. SS cuts throws to 3B. On double cuts: SS relays left side, 2B relays right side. Pitcher ALWAYS backs up the target base, never the cutoff.

### Famous
> Historical accuracy is paramount. Cite the actual year, teams, and players. Teach the strategic lesson the play illustrates. All 4 options must be decisions the real player/manager could have made in that moment.

### Rules
> Teach MLB Official Rules accurately. Include recent changes (pitch clock 2023, shift ban, universal DH). Focus on force vs tag, infield fly, balk, obstruction, interference. All options must be plausible interpretations.

### Counts
> Count-specific strategy driven by real batting averages. Hitter's counts (2-0, 3-1): aggressive. Pitcher's counts (0-2, 1-2): protect zone. Tie scenarios to real count leverage data.

---

## 2. Knowledge Maps (7 Authoritative Maps)

These are the "non-negotiable" reference tables injected into AI prompts based on position relevance. They define correct defensive assignments that must never be contradicted.

### 2.1 CUTOFF_RELAY_MAP

```
CUTOFF/RELAY ASSIGNMENTS (non-negotiable):
SINGLE CUTS to HOME: LF→Home cutoff=3B. CF→Home cutoff=1B. RF→Home cutoff=1B.
SINGLE CUTS to 3B: All OF→3B cutoff=SS.
DOUBLE CUTS (extra-base hits): Left side (LF line, LF-CF gap, deep CF) lead relay=SS, trail=2B.
  Right side (RF-CF gap, RF line) lead relay=2B, trail=SS or 1B.
PITCHER: Backs up the TARGET BASE on every relay/cutoff play. NEVER the cutoff or relay man.
CATCHER: Stays at home. Directs cutoff with voice: "Cut!" / "Cut two!" / "Cut three!" / silence=let it go.
```

**Injected for**: ALL positions (always included in every AI prompt)

### 2.2 BUNT_DEFENSE_MAP

```
BUNT DEFENSE ASSIGNMENTS (non-negotiable):
RUNNER ON 1ST ONLY: P fields bunt near mound. 1B charges. 3B charges. 2B covers 1st. SS covers 2nd. C directs.
RUNNERS ON 1ST & 2ND (standard): P fields near mound. 1B charges. 3B charges. SS covers 3rd.
  2B covers 1st. C directs.
RUNNERS ON 1ST & 2ND (wheel play): 3B crashes HARD early. SS rotates to 3rd. 2B covers 1st.
  P covers mound area. Goal: get lead runner at 3rd.
PRIORITY: Lead runner out > trail runner out. Force at 3rd with runners 1st & 2nd is the highest-value play.
```

**Injected for**: pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, manager

### 2.3 FIRST_THIRD_MAP

```
FIRST-AND-THIRD DEFENSE (non-negotiable):
Runner on 1st steals with runner on 3rd — catcher's options:
1. THROW THROUGH to 2B: SS covers 2B, takes throw, looks runner back at 3rd. Risk: R3 scores.
2. CUT BY MIDDLE IF: C throws to 2nd. SS (or 2B) cuts throw short, looks at R3. If R3 breaks home, throw home.
3. FAKE AND THROW: C pump-fakes to 2nd, fires to 3B to catch R3 leaning. 3B must be ready.
4. HOLD THE BALL: Concede stolen base, keep R3 at third.
1B stays at 1B. P ducks out of throwing lane. Key: NEVER throw to 2nd if R3 has a big lead.
```

**Injected for**: pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, manager

### 2.4 BACKUP_MAP

```
BACKUP RESPONSIBILITIES (non-negotiable):
P: Backs up HOME on OF throws home. Backs up 3B on throws to third.
LF: Backs up 3B on ALL infield grounders and throws to third.
CF: Backs up 2B on ALL steal attempts and throws to second.
RF: Backs up 1B on EVERY infield grounder (most important routine OF job).
C: Backs up 1B on grounders with no runners on.
RULE: Every throw needs a backup in line behind the target. Sprint to position.
```

**Injected for**: pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, leftField, centerField, rightField, manager

### 2.5 RUNDOWN_MAP

```
RUNDOWN PROCEDURE (non-negotiable):
1. Run hard at runner — drive him BACK toward previous base.
2. Hold ball high (visible). Run FULL SPEED.
3. ONE throw — firm, chest-high. Receiver tags.
4. Backup: next fielder replaces thrower's vacated base. 2 fielders per base.
5. NEVER pump-fake. NEVER lob. NEVER throw across runner's body.
RUNNER'S GOAL: Force many throws — every throw is an error chance.
```

**Injected for**: firstBase, secondBase, shortstop, thirdBase, baserunner, manager

### 2.6 DP_POSITIONING_MAP

```
DOUBLE PLAY POSITIONING (non-negotiable):
DP DEPTH WHEN: Runner on 1st (or 1st & 2nd, loaded), less than 2 outs.
NORMAL DEPTH WHEN: 2 outs (can't turn two), or no force at 2nd.
INFIELD IN WHEN: Runner on 3rd, less than 2 outs, run matters. Tradeoff: less range.
DP DEPTH = 3-4 steps toward 2B + step in toward home. Reduces range ~15% but speeds pivot.
NEVER DP depth with 2 outs. NEVER infield in with 2 outs and no R3.
```

**Injected for**: pitcher, firstBase, secondBase, shortstop, thirdBase, manager

### 2.7 HIT_RUN_MAP

```
HIT-AND-RUN ASSIGNMENTS (non-negotiable):
BATTER: MUST swing — protect the runner. Ground ball through vacated hole > power.
RUNNER: Go on the pitch. Don't look back.
WHO COVERS 2B on steal: LHH → SS covers (hole opens at 2B side). RHH → 2B covers (hole opens at SS side).
BATTER aims through the vacated hole. P should throw strikes to induce contact.
```

**Injected for**: secondBase, shortstop, batter, baserunner, manager

### 2.8 PICKOFF_MAP

```
PICKOFF MOVES & DECEPTION (non-negotiable):
FROM STRETCH: Step directly toward the base AND throw = legal pickoff. No step = balk.
FAKE 3B/THROW 1B: ILLEGAL since 2013 (Rule 6.02(a)(4)). Always a balk. Never do it.
STEP OFF RUBBER: Pitcher becomes a fielder — throw anywhere, no balk restriction applies.
DAYLIGHT PLAY (2B): SS/2B breaks toward 2nd first. If daylight shows between fielder and runner, pitcher throws. Pitcher does NOT initiate.
PITCHOUT: Pitcher throws outside. Catcher steps and fires. Costs a ball in count — use on 1-0, 2-0, 3-1 only.
PICKOFF TELLS: Throw when runner leans forward, weight is forward, or has consistent lead >12 feet.
NEVER: Throw to an unoccupied base. Throw blindly without a tell. Fake third and throw first.
```

**Injected for**: pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, baserunner, manager

### 2.9 PITCH_CLOCK_MAP

```
PITCH CLOCK STRATEGY (non-negotiable per 2023 MLB Rules):
PITCHER: 15 sec with bases empty, 20 sec with runners on. Violation = automatic BALL.
BATTER: Must be alert in box with 8 sec remaining. Violation = automatic STRIKE. 1 timeout per PA.
VARY TEMPO: Quick-pitch followed by long hold disrupts timing more than constant pace.
HIGH LEVERAGE: Use full 20 seconds on 0-2 or full count with runners on. Make the hitter wait.
STEAL READS: Clock makes delivery windows MORE consistent — helps runners time the pitcher.
SIGN DELIVERY: Catcher must deliver signs fast. Under 9 seconds for pitcher to receive and set.
NEVER: Rush a high-leverage pitch to beat the clock. Waste batter timeout on 0-0 or 1-0 count.
```

**Injected for**: pitcher, catcher, batter, baserunner, manager

### 2.10 WP_PB_MAP

```
WILD PITCH / PASSED BALL COVERAGE (non-negotiable):
CATCHER: Go to the BALL first, THEN look at the runner. Never look at runner first.
PITCHER: Sprint to cover HOME the instant ball passes catcher. Set up on first-base side (give catcher a lane).
3B: With R3, sprint to back up home immediately behind the pitcher.
R3 READ: If catcher breaks to retrieve AND ball rolls 10+ feet past plate, GO. Watch catcher's first step.
BASES LOADED: Ball in dirt = catcher fields and steps on home for force out. Pitcher still sprints as backup.
NEVER: Catcher looks at runner before fielding. Pitcher stays on mound when wild pitch passes catcher.
```

**Injected for**: pitcher, catcher, firstBase, thirdBase, baserunner, manager

### 2.11 SQUEEZE_MAP

```
SQUEEZE PLAY (non-negotiable):
SAFETY SQUEEZE: Runner goes on CONTACT. Batter bunts only if pitch is buntable. Lower risk.
SUICIDE SQUEEZE: Runner commits on PITCHER'S FIRST MOVE. Batter MUST bunt no matter what.
NEVER RUN SUICIDE WITH 2 STRIKES — foul bunt = strikeout AND runner is dead at home.
PITCHER DEFENSE: High and tight fastball is hardest pitch to bunt. Throw it immediately if squeeze detected.
CATCHER: If runner breaks and batter pulls back, fire to 3B immediately.
BATTER: Show bunt as late as possible. Square up only as pitcher commits to delivery.
```

**Injected for**: pitcher, catcher, firstBase, thirdBase, batter, baserunner, manager

### 2.12 INFIELD_FLY_MAP

```
INFIELD FLY RULE (non-negotiable — MLB Rule 5.09(b)(6)):
WHEN CALLED: <2 outs, runners on 1st+2nd OR bases loaded, fair fly ball catchable with ordinary effort.
BATTER: Automatically OUT regardless of whether ball is caught or dropped.
RUNNERS: NOT forced. May advance at own risk after IFF is called.
BALL DROPS FAIR: Batter still out. Runners may advance at own risk.
BALL DRIFTS FOUL: IFF cancelled — ordinary foul ball. Batter not out.
LINE DRIVES: Never an IFF. Force play rules apply normally.
NEVER: Assume runners are forced to advance on an IFF. Assume a dropped IFF ball puts runners in jeopardy of a force out.
```

**Injected for**: firstBase, secondBase, shortstop, thirdBase, batter, baserunner, manager

### 2.13 OF_COMMUNICATION_MAP

```
OUTFIELD COMMUNICATION & POSITIONING (non-negotiable):
CF HAS PRIORITY: Over ALL players — corner OF and all infielders — on any ball he can reach. His call is final.
CORNER OF: Priority over nearest infielder (LF > 3B/SS; RF > 1B/2B) on tweeners.
CALL SYSTEM: "I got it! I got it!" — twice, loud. Everyone else peels off and backs up the throw.
GAP BALLS: CF calls if he can reach. If not, nearest corner OF calls and takes it. Middle IF goes to relay.
SUN BALLS: Glove shield first, sunglasses supplementary. Eyes always on the ball.
PRE-PITCH: Shade toward pull side based on batter tendencies. Communicate wind/sun to teammates before inning.
NEVER: Allow a no-call fly ball. Call off CF after he has already called the ball.
```

**Injected for**: leftField, centerField, rightField

---

## 3. Map Relevance & Audit System

### MAP_RELEVANCE Table

| Map | Positions That Receive It |
|-----|--------------------------|
| CUTOFF_RELAY_MAP | ALL positions (always injected separately) |
| BUNT_DEFENSE_MAP | pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, manager |
| FIRST_THIRD_MAP | pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, manager |
| BACKUP_MAP | pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, leftField, centerField, rightField, manager |
| RUNDOWN_MAP | firstBase, secondBase, shortstop, thirdBase, baserunner, manager |
| DP_POSITIONING_MAP | pitcher, firstBase, secondBase, shortstop, thirdBase, manager |
| HIT_RUN_MAP | secondBase, shortstop, batter, baserunner, manager |
| PICKOFF_MAP | pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, baserunner, manager |
| PITCH_CLOCK_MAP | pitcher, catcher, batter, baserunner, manager |
| WP_PB_MAP | pitcher, catcher, firstBase, thirdBase, baserunner, manager |
| SQUEEZE_MAP | pitcher, catcher, firstBase, thirdBase, batter, baserunner, manager |
| INFIELD_FLY_MAP | firstBase, secondBase, shortstop, thirdBase, batter, baserunner, manager |
| OF_COMMUNICATION_MAP | leftField, centerField, rightField |

### MAP_AUDIT Strings

These are appended to the AI self-audit checklist as numbered items (starting at item 10):

| Map | Audit Check |
|-----|-------------|
| BUNT_DEFENSE_MAP | "If bunt scenario, do assignments match BUNT DEFENSE map? 2B covers 1st, SS covers 3rd with runners 1st & 2nd." |
| FIRST_THIRD_MAP | "If runners 1st & 3rd with steal, do options match? SS/2B cuts, pitcher ducks, 1B stays." |
| BACKUP_MAP | "Are backup responsibilities correct? RF backs up 1B, LF backs up 3B, CF backs up 2B, P backs up home/3B." |
| RUNDOWN_MAP | "If rundown scenario, chase runner BACK, one throw max, no pump fakes, backup rotation correct." |
| DP_POSITIONING_MAP | "DP depth only with less than 2 outs and force at 2nd. Never DP depth with 2 outs." |
| HIT_RUN_MAP | "Batter must swing, runner goes on pitch, coverage depends on batter handedness." |
| PICKOFF_MAP | "If pickoff scenario: is the move legal? No fake-third/throw-first (balk since 2013). Step toward base required. Daylight play: fielder breaks FIRST, pitcher reacts." |
| PITCH_CLOCK_MAP | "If pitch clock scenario: pitcher violation = ball, batter violation = strike. 15 sec empty, 20 sec with runners. Batter has exactly 1 timeout per PA." |
| WP_PB_MAP | "Wild pitch/passed ball: catcher goes to ball first. Pitcher sprints home immediately. 3B backs up home with R3. R3 reads catcher's first step before breaking." |
| SQUEEZE_MAP | "Squeeze scenario: is it safety (on contact) or suicide (on first move)? Suicide with 2 strikes = never. Pitcher's best response is high and tight. Runner commitment timing correct." |
| INFIELD_FLY_MAP | "Infield fly scenario: IFF requires <2 outs and runners on 1st+2nd or loaded. Batter is automatically out. Runners NOT forced. Ball drifts foul = IFF cancelled." |
| OF_COMMUNICATION_MAP | "Outfield scenario: CF priority is correct on any ball he can reach. Gap ball caller is the correct fielder. No no-call fly ball situation. Sun/wall technique is correct." |

### How Maps Are Injected

```javascript
function getRelevantMaps(position) {
  // Returns concatenated text of all maps relevant to this position
  // CUTOFF_RELAY_MAP is injected separately (always included)
  return Object.entries(MAP_RELEVANCE)
    .filter(([, positions]) => positions.includes(position))
    .map(([key]) => KNOWLEDGE_MAPS[key])
    .join('\n\n');
}

function getRelevantAudits(position) {
  // Returns numbered audit items (10+) for the AI self-check
  return Object.entries(MAP_RELEVANCE)
    .filter(([, positions]) => positions.includes(position))
    .map(([key], i) => `${10 + i}. ${MAP_AUDIT[key]}`)
    .join('\n');
}
```

---

## 4. BRAIN Constant — Centralized Knowledge Engine

Source: FanGraphs RE24 (2015-2024 averages), Baseball Reference count data.

### 4.1 BRAIN.stats

#### Run Expectancy Matrix (RE24)

Format: `RE24[runnersKey][outs]` = expected runs from this state to end of inning.

Runner keys: `"---"` = empty, `"1--"` = 1st, `"-2-"` = 2nd, `"--3"` = 3rd, `"12-"` = 1st+2nd, `"1-3"` = 1st+3rd, `"-23"` = 2nd+3rd, `"123"` = loaded.

| Runners | 0 Outs | 1 Out | 2 Outs |
|---------|--------|-------|--------|
| `---` (empty) | 0.54 | 0.29 | 0.11 |
| `1--` (1st) | 0.94 | 0.56 | 0.24 |
| `-2-` (2nd) | 1.17 | 0.71 | 0.33 |
| `--3` (3rd) | 1.43 | 0.98 | 0.37 |
| `12-` (1st+2nd) | 1.56 | 0.96 | 0.46 |
| `1-3` (1st+3rd) | 1.83 | 1.21 | 0.52 |
| `-23` (2nd+3rd) | 2.05 | 1.44 | 0.60 |
| `123` (loaded) | 2.29 | 1.59 | 0.77 |

#### Count Leverage Data

Format: `countData[count]` = `{ba, obp, slg, label, edge}`

| Count | BA | OBP | SLG | Label | Edge |
|-------|-----|-----|-----|-------|------|
| 0-0 | .340 | .340 | .555 | First Pitch | neutral |
| 1-0 | .345 | .345 | .550 | Hitter's Advantage | hitter |
| 2-0 | .400 | .400 | .665 | Best Hitter's Count | hitter |
| 3-0 | .375 | .900 | .590 | Free Pass Territory | hitter |
| 3-1 | .370 | .500 | .615 | Premium Hitter's Count | hitter |
| 0-1 | .300 | .300 | .460 | Pitcher Got Ahead | pitcher |
| 0-2 | .167 | .170 | .240 | Pitcher Dominant | pitcher |
| 1-1 | .310 | .310 | .480 | Even Battle | neutral |
| 1-2 | .180 | .190 | .270 | Pitcher's Count | pitcher |
| 2-1 | .340 | .340 | .540 | Hitter Leaning | hitter |
| 2-2 | .205 | .210 | .310 | Toss-Up | neutral |
| 3-2 | .230 | .350 | .380 | Full Count | neutral |

#### Steal Break-Even Rates

```javascript
stealBreakEven: {0: 0.72, 1: 0.72, 2: 0.67}  // by outs
```

- 0 outs: 72% success needed
- 1 out: 72% success needed
- 2 outs: 67% success needed (lower because out ends inning anyway)

#### Bunt RE24 Delta (Cost of Sacrifice Bunt)

```javascript
buntDelta: {"1--_0": -0.23, "-2-_0": -0.19, "12-_0": -0.08}
```

- Runner on 1st, 0 outs: costs 0.23 expected runs
- Runner on 2nd, 0 outs: costs 0.19 expected runs
- Runners on 1st & 2nd, 0 outs: costs 0.08 expected runs (lowest cost — closer to break-even)

#### Times Through Order (TTO) Effect

```javascript
ttoEffect: [0, 15, 30]  // BA points penalty by times-through-order (1st, 2nd, 3rd)
```

- 1st time through: baseline
- 2nd time through: batters hit +15 BA points better
- 3rd time through: batters hit +30 BA points better

#### Platoon Edge

```javascript
platoonEdge: 18  // ~18 BA points for opposite-hand matchup
```

#### Pop Time (Catcher)

```javascript
popTime: {elite: 1.85, average: 2.0, slow: 2.15}  // seconds
```

#### Time to Plate (Pitcher)

```javascript
timeToPlate: {quick: 1.2, average: 1.4, slow: 1.6}  // seconds
```

#### Pickoff Success Rates

```javascript
pickoffSuccess: {blindThrow: 0.08, readThrow: 0.28, daylightPlay: 0.35}
```

- Blind throw (no read): ~8% success rate
- Read-based throw (runner leaning, tell present): ~28% success rate
- Practiced daylight play at 2nd: ~35% success rate
- Source: coaching consensus / ABCA estimates

#### Pitch Clock Violation Rates (2023 MLB)

```javascript
pitchClockViolations: {pitcherRate: 0.004, batterRate: 0.002}
```

- Pitcher violations: ~0.4% of pitches (automatic ball)
- Batter violations: ~0.2% of pitches (automatic strike)
- Source: Baseball Reference 2023 season data

### 4.2 BRAIN.concepts — Prerequisite Graph

20 concept tags that control scenario progression. Each has:
- `name`: Display name
- `domain`: Category (rules, defense, baserunning, pitching, hitting, strategy)
- `prereqs[]`: Tags that must be mastered first
- `ageMin`: Minimum age group to see this concept
- `diff`: Difficulty level (1-3)

| Tag | Name | Domain | Prerequisites | Age Min | Diff |
|-----|------|--------|---------------|---------|------|
| `force-vs-tag` | Force vs Tag Plays | rules | — | 6 | 1 |
| `fly-ball-priority` | Fly Ball Priority | defense | — | 6 | 1 |
| `backup-duties` | Backup Responsibilities | defense | — | 8 | 1 |
| `rundown-mechanics` | Rundown Procedure | defense | — | 8 | 1 |
| `tag-up` | Tagging Up on Fly Balls | baserunning | fly-ball-priority | 8 | 1 |
| `first-pitch-strike` | First-Pitch Strikes | pitching | — | 6 | 1 |
| `cutoff-roles` | Who Is the Cutoff Man | defense | force-vs-tag | 9 | 2 |
| `count-leverage` | Count Leverage | pitching | first-pitch-strike | 9 | 2 |
| `double-play-turn` | Turning the Double Play | defense | force-vs-tag | 9 | 2 |
| `two-strike-approach` | Two-Strike Approach | hitting | count-leverage | 9 | 2 |
| `bunt-defense` | Bunt Defense Assignments | defense | cutoff-roles | 10 | 2 |
| `steal-breakeven` | Steal Break-Even Rate | baserunning | — | 11 | 2 |
| `dp-positioning` | DP Depth vs Normal | defense | double-play-turn | 11 | 2 |
| `situational-hitting` | Situational Hitting | hitting | count-leverage | 11 | 2 |
| `hit-and-run` | Hit-and-Run Play | strategy | steal-breakeven | 11 | 2 |
| `first-third` | First-and-Third Defense | defense | cutoff-roles | 11 | 3 |
| `relay-double-cut` | Double Cut Relays | defense | cutoff-roles | 11 | 3 |
| `pitch-sequencing` | Pitch Sequencing | pitching | count-leverage | 11 | 3 |
| `bunt-re24` | Sacrifice Bunt RE24 | strategy | steal-breakeven | 11 | 3 |
| `infield-fly` | Infield Fly Rule | rules | force-vs-tag | 9 | 2 |
| `pickoff-mechanics` | Pickoff Move Mechanics | pitching | first-pitch-strike | 9 | 2 |
| `pitch-clock-strategy` | Pitch Clock Strategy | pitching | count-leverage | 11 | 2 |
| `wild-pitch-coverage` | Wild Pitch / Passed Ball Coverage | defense | backup-duties | 8 | 1 |
| `squeeze-play` | Squeeze Play Variants | strategy | bunt-defense | 11 | 3 |
| `tto-effect` | Times Through the Order | pitching | count-leverage | 11 | 3 |
| `of-communication` | Outfield Communication & Positioning | defense | fly-ball-priority, backup-duties | 9 | 2 |

**Prerequisite Chain Visualization:**

```
(no prereqs, age 6+)
├── force-vs-tag ──┬── cutoff-roles ──┬── bunt-defense ── squeeze-play
│                  │                  ├── first-third
│                  │                  └── relay-double-cut
│                  ├── double-play-turn ── dp-positioning
│                  └── infield-fly
├── fly-ball-priority ──┬── tag-up
│                       └── of-communication (also requires backup-duties)
├── first-pitch-strike ──┬── pickoff-mechanics
│                        └── count-leverage ──┬── two-strike-approach
│                                             ├── situational-hitting
│                                             ├── pitch-sequencing
│                                             ├── pitch-clock-strategy
│                                             └── tto-effect
(no prereqs, age 8+)
├── backup-duties ──┬── wild-pitch-coverage
│                   └── of-communication (also requires fly-ball-priority)
├── rundown-mechanics
(no prereqs, age 11+)
└── steal-breakeven ──┬── hit-and-run
                      └── bunt-re24
```

### 4.3 BRAIN.coaching.situational — Template Coach Lines

25 situation-keyed lines with template variables (`{re24}`, `{count}`, `{ba}`, `{label}`, `{breakeven}`, `{delta}`, `{penalty}`, `{outs}`). Used by `getSmartCoachLine()` for Pro users — 40% chance of a data-driven line.

| Key | Template | When Used |
|-----|----------|-----------|
| `high-re24` | "With {re24} runs expected here, every decision counts!" | RE24 > 1.5 |
| `low-re24` | "Only {re24} expected runs — need to make this opportunity count." | (available, not currently triggered) |
| `hitters-count` | "{count} is a {label} — hitters bat {ba} here!" | Count edge = "hitter" & success |
| `pitchers-count` | "Down {count}, hitters only bat {ba}. Expand the zone!" | Count edge = "pitcher" |
| `full-count` | "Full count — hitters bat .230 but walk rate jumps. Be ready!" | Count = "3-2" |
| `steal-risky` | "Need {breakeven}% success to break even on a steal here." | (available) |
| `bunt-bad-re24` | "Bunting costs {delta} expected runs here — look for something better." | (available) |
| `bunt-ok` | "With a weak hitter needing exactly 1 run, a bunt can make sense here." | (available) |
| `high-leverage` | "This is a championship moment. One play changes everything!" | Pressure ≥ 75 & inning ≥ 7 |
| `fatigue-warning` | "Third time through — batters hit {penalty} points better now." | (available) |
| `bases-loaded` | "Bases loaded! {re24} expected runs — every pitch is magnified." | 3 runners on |
| `risp` | "Runner in scoring position with {outs} out — situational hitting time!" | Runner on 2nd+ & < 2 outs |
| `lead-protect` | "Protecting a lead means pitching smart, not hard." | (available) |
| `comeback` | "Down in the count — battle and make the pitcher work." | (available) |
| `two-outs` | "Two outs changes everything — run on contact!" | Outs = 2 |
| `empty-bases` | "Nobody on — focus on getting on base any way you can." | (available) |
| `first-inning` | "Top of the game — set the tone with smart play!" | Inning ≤ 1 |
| `late-close` | "Late and close — every decision is amplified!" | Inning ≥ 7 & score diff ≤ 2 |
| `dp-situation` | "Double play situation — ground ball is the pitcher's best friend." | (available) |
| `nobody-out` | "Nobody out — don't give away outs! Make them earn it." | Outs = 0 & runners on |
| `tto-warning` | "Third time through the order — batters hit {penalty} points better now. Time to think about the bullpen." | (available) |
| `tto-platoon` | "Wrong-side matchup AND third time through — that's a massive BA jump. The pen needs to be ready." | (available) |
| `pitch-clock-leverage` | "With the pitch clock, every second of your 20 counts. Make the hitter sweat on 0-2." | (available) |
| `squeeze-alert` | "Runner on third, less than 2 outs — squeeze play is in the toolbox. Is the defense ready?" | (available) |
| `wp-pb-alert` | "Ball in the dirt with a runner on third — catcher goes to the ball, pitcher sprints home. No hesitation." | (available) |

**Selection Priority** (in `getSmartCoachLine`):
1. Streak lines take priority (streak ≥ 3)
2. Then 40% chance of situational brain line, evaluated in this order:
   - bases-loaded → high-leverage → hitters-count → pitchers-count → full-count → high-re24 → risp → late-close → two-outs → nobody-out → first-inning
3. Falls through to `getCoachLine()` (generic/position lines)

---

## 5. Brain API — Pure Utility Functions

All functions are pure (no side effects, no state mutation).

### `runnersKey(runners: number[]) → string`
Converts runner base array to RE24 lookup key.
- Input: `[1, 3]` (runners on 1st and 3rd)
- Output: `"1-3"`
- Input: `[]` or `null`
- Output: `"---"`

### `getRunExpectancy(runners: number[], outs: number) → number`
Looks up expected runs from the RE24 matrix.
- Input: `[1, 2], 0`
- Output: `1.56`

### `getPressure(situation: object) → number (0-100)`
Calculates pressure score from three components:
- **RE24 component** (0-40): `(re24 / 2.29) * 40`, capped at 40
- **Inning leverage** (0-30): 9th+ = 30, 7th-8th = 20, 5th-6th = 10, else 0
- **Score closeness** (0-30): tie = 30, 1-run = 25, 2-run = 15, 3-4 run = 5, 5+ = 0
- Input: `{runners: [1,2,3], outs: 0, inning: "Bot 9", score: [3,3]}`
- Output: `100` (max)

### `getCountIntel(count: string) → object|null`
Returns count data from BRAIN.stats.countData.
- Input: `"2-0"`
- Output: `{ba: .400, obp: .400, slg: .665, label: "Best Hitter's Count", edge: "hitter"}`
- Input: `"-"` or `null`
- Output: `null`

### `evaluateBunt(runners: number[], outs: number) → object`
Evaluates whether a sacrifice bunt makes sense.
- Returns: `{delta: number|null, worthIt: boolean, explanation: string}`
- `worthIt` = true when delta > -0.10 (small enough cost to be situationally justified)

### `evaluateSteal(outs: number, successRate: number) → object`
Evaluates whether a steal attempt is justified by break-even rate.
- Returns: `{breakeven: number, worthIt: boolean, explanation: string}`

### `isConceptReady(tag: string, mastered: string[], ageGroup: string) → object`
Checks if a concept's prerequisites and age requirements are met.
- Returns: `{ready: boolean, missing: string[]}`
- Age mapping: "6-8" → 7, "9-10" → 9, "11-12" → 11, else 13

### `findConceptTag(conceptText: string) → string|null`
Maps scenario concept text to a BRAIN concept tag using weighted keyword matching.
- Input: `"Cutoff relay assignments"`
- Output: `"cutoff-roles"`
- Uses regex keyword table with priority weights (1-3)

### `enrichFeedback(scenario, choiceIdx, situation) → object[]`
Generates insight items for the outcome screen (max 3).
- RE24 insight if runners on base and re24 > 0.5
- Count insight if count data available
- Pressure insight if pressure ≥ 50
- Bunt insight if concept mentions "bunt"
- Steal insight if concept mentions "steal"
- Returns: `[{icon: string, text: string}, ...]`

### `getSmartCoachLine(cat, situation, position, streak, isPro) → string`
Situation-aware coach line for Pro users. Falls back to `getCoachLine()`.
- Priority: streak lines → 40% chance brain line → generic line
- See Section 4.3 for selection priority

### `formatBrainStats(position: string) → string`
Generates position-filtered stats string for the AI prompt.
- Everyone gets: RE24 key states, fly ball priority, force play rule
- pitcher/batter/catcher/counts: + count leverage data
- baserunner/manager/batter: + steal break-even
- pitcher/manager: + TTO effect + pickoff success rates
- pitcher/catcher/batter/baserunner/manager: + pitch clock rules
- batter/manager/baserunner: + bunt RE24

### `getTeachingContext(position, mastered, ageGroup) → string`
Returns up to 5 unmastered-but-ready concept tags for the AI to target.
- Output: `"\nTEACH ONE OF THESE UNMASTERED CONCEPTS: cutoff-roles (Who Is the Cutoff Man), ..."` or `""`

### `filterByReadiness(scenarios, masteredTags, ageGroup) → scenario[]`
Filters scenario array to only those whose concept prerequisites are met.
- Uses `findConceptTag()` to map scenario concept text to tags
- Scenarios with no tag are always eligible

### `getPressureLabel(pressure: number) → object`
Returns display text and color for pressure meter.
- `≥ 80`: `{text: "CLUTCH TIME", color: "#ef4444"}` (red)
- `≥ 55`: `{text: "HIGH STAKES", color: "#f97316"}` (orange)
- `≥ 30`: `{text: "HEATING UP", color: "#f59e0b"}` (yellow)
- `< 30`: `{text: "WARMING UP", color: "#22c55e"}` (green)

---

## 6. AI Scenario Generation — Full Prompt Template

The `generateAIScenario()` function builds a prompt with these sections:

### Player Context Block
```
PLAYER CONTEXT:
- Level: {level name} ({points} points, {games} games played)
- Position: {position} ({played} played, {accuracy}% accuracy)
- Target difficulty: {1-3}/3 (1=Rookie, 2=Intermediate, 3=Advanced)
- Concepts already mastered: {list or "none yet"}
- Personalization: {weak areas, recent wrong, target concept}
```

**Difficulty targeting:**
- posAcc > 75% → diff 3 (Advanced)
- posAcc > 50% → diff 2 (Intermediate)
- posAcc ≤ 50% → diff 1 (Rookie)

**Personalization triggers:**
- posAcc < 50%: "player struggles — make it slightly easier"
- posAcc > 80% with 5+ plays: "player is strong — increase difficulty"
- recentWrong: "revisit one of these concepts from a different angle"
- targetConcept: "PRIORITY: player missed this — create COMPLETELY DIFFERENT situation teaching same concept"

### Knowledge Injection Block
```
POSITION PRINCIPLES: {POS_PRINCIPLES[position]}
{CUTOFF_RELAY_MAP}                    ← always
{getRelevantMaps(position)}           ← position-filtered
DATA REFERENCE: {formatBrainStats(position)}
{getTeachingContext(position, mastered, ageGroup)}
```

### Self-Audit Checklist (9 base items + position-filtered map audits)
1. Is the game situation physically possible?
2. Can this player perform all 4 options from their position?
3. Does the best answer match authoritative coaching?
4. Do explanations cite correct rules?
5. Are cited statistics approximately correct?
6. Does scenario contradict POSITION PRINCIPLES?
7. Is anim type consistent with scenario action?
8. ROLE CHECK: Correct defensive roles per CUTOFF/RELAY ASSIGNMENTS?
9. POSITION BOUNDARY: Each option describes an action THIS position performs?
10+. {Position-filtered MAP_AUDIT items}

### Output Format
```json
{
  "title": "Short Catchy Title",
  "diff": 1-3,
  "description": "Vivid 2-3 sentence scenario",
  "situation": {"inning": "Bot 7", "outs": 1, "count": "2-1", "runners": [1, 3], "score": [3, 2]},
  "options": ["A", "B", "C", "D"],
  "best": 0,
  "explanations": ["Why A", "Why B", "Why C", "Why D"],
  "rates": [85, 55, 30, 20],
  "concept": "One-sentence strategic concept",
  "anim": "strike|strikeout|hit|groundout|flyout|steal|score|advance|catch|throwHome|doubleplay|bunt|walk|safe|freeze"
}
```

### API Configuration
- Model: `grok-4-1-fast` (xAI Grok)
- Temperature: `0.4` (low for factual accuracy)
- Max tokens: `1000`
- Timeout: `15000ms` (15 seconds)
- Proxy: Cloudflare Worker at `AI_PROXY_URL`

### Post-Generation Validation
1. Structure check: title, 4 options, 4 explanations, best 0-3, concept, 4 rates
2. Anim validation: must be in ANIMS list, defaults to "strike"
3. Diff validation: must be 1-3, defaults to target
4. Situation normalization: runners → array, score → [home, away], outs/inning/count defaults
5. Role violation regex check (see Section 7)

---

## 7. Role Violation Detection

Last-resort client-side regex check that rejects AI scenarios containing obviously wrong defensive role assignments.

```javascript
const ROLE_VIOLATIONS = {
  pitcher: [
    /pitcher.*cutoff/i,
    /pitcher.*relay\s*man/i,
    /pitcher.*lines?\s*up.*between/i,
    /pitcher.*covers?\s*(1st|first|second|2nd|third|3rd)\b/i,
    /pitcher.*fake.*third.*throw.*first/i,
    /pitcher.*relay.*second/i,
    /pitcher.*stays.*on.*mound.*wild.*pitch/i
  ],
  catcher: [
    /catcher.*cutoff/i,
    /catcher.*goes?\s*out/i,
    /catcher.*relay/i,
    /catcher.*looks.*runner.*before.*field/i
  ],
  shortstop: [
    /SS\s*covers?\s*(1st|first)\b.*bunt/i,
    /shortstop\s*covers?\s*(1st|first)\b.*bunt/i
  ],
  secondBase: [
    /2B\s*covers?\s*(3rd|third)\b.*bunt/i,
    /second\s*base.*covers?\s*(3rd|third)\b.*bunt/i
  ],
  thirdBase: [
    /third.*base.*stays.*at.*third.*wild.*pitch.*runner.*third/i,
    /third.*base.*cutoff.*right.*field/i,
    /third.*base.*relay.*right/i
  ],
  leftField: [
    /left.*field.*cutoff.*center/i,
    /left.*field.*relay.*second/i
  ],
  rightField: [
    /right.*field.*cutoff.*left/i,
    /right.*field.*relay.*third/i
  ],
};
```

**How it works:**
1. Concatenates description + all options + all explanations into one string
2. Tests against position-specific regex patterns
3. If any pattern matches → scenario is rejected, falls back to handcrafted

**Known gaps** (positions without violation checks):
- firstBase, baserunner, manager, batter
- These rely on the AI prompt's self-audit checklist and knowledge maps

---

## 8. Coach Line System

### 8.1 Line Categories

**Generic Success Lines (25 lines)**
```
"Perfect call, slugger!", "That's big-league thinking!", "You nailed it!",
"Pro-level decision!", "Coach is impressed!", "Textbook play!",
"You're reading the game like a pro!", "That's exactly what I'd do!",
"Sharp thinking out there!", "You've got baseball IQ for days!",
"MVP material right there!", "That's a veteran move!",
"Way to stay cool under pressure!", "Smart baseball, love it!",
"You just made the highlight reel!", "The scouts are watching!",
"That's what champions do!", "You're playing chess while they play checkers!",
"That's heads-up ball right there!", "You could teach this one!",
"Gold glove decision!", "That's the right read every time!",
"You're seeing the whole field!", "Clutch play, no doubt!",
"That's instinct you can't teach — wait, we just did!"
```

**Generic Warning Lines (20 lines)**
```
"Not bad! Close one.", "Good instinct, almost there!",
"Decent call — let's learn why.", "You're on the right track!",
"Solid effort!", "Hey, that's a reasonable play!",
"Close — just one adjustment away!", "Good thinking, wrong moment for it though.",
"I've seen pros make that same call!", "That works sometimes — but there's a better option.",
"You're thinking about it the right way!", "Almost had it — read the explanation!",
"That's a B+ play — let's get to A+!", "Halfway there, keep going!",
"Smart idea, just slightly off target.", "Not a bad play — but not the best play.",
"You've got the right instincts — let's sharpen them!", "That'll work in some situations!",
"Good effort — next time you'll nail it!", "Close call! The difference is in the details."
```

**Generic Danger Lines (20 lines)**
```
"Hey, that's how we learn!", "Every pro struck out first.",
"Let's break this down.", "Good try — check the tip!",
"No worries, you'll get it!", "Even the greats make mistakes!",
"That's a tough one — let's learn from it.", "Shake it off and come back stronger!",
"Babe Ruth struck out 1,330 times. You're in good company!",
"The best players study their mistakes.",
"Don't sweat it — this is how you get better!",
"Read the breakdown — it'll click next time.",
"That's a learning rep — those count the most!",
"This one's tricky. Let's figure it out together.",
"Oops! But now you know for next time.",
"Every wrong answer is a future right answer!",
"I missed that one too when I was learning!",
"Dust yourself off — next one's yours!",
"The game is the best teacher!", "That's why we practice!"
```

### 8.2 Position-Specific Lines (Pro Only)

**Position Success Lines (4 per fielding position, 1 for special modes)**

| Position | Lines |
|----------|-------|
| pitcher | "That's an ace-level pitch call!", "First-pitch strikes cut BA from .340 to .167 on 0-2 — you got ahead!", "Pitching smart beats pitching hard every time!", "That's Cy Young thinking!" |
| catcher | "You're the quarterback of this defense!", "Elite catchers think two pitches ahead — just like you!", "That's a 1.85-second pop time decision!", "Field general material!" |
| firstBase | "Stretch and scoop — that's Gold Glove material!", "Knowing when to hold vs charge is what separates pros!", "That's why 1B is the cutoff on CF/RF throws home!", "Smooth first base work!" |
| secondBase | "Silky smooth! That's a double play artist!", "Quick pivot, strong relay — textbook!", "Knowing when to cover 1B vs 2B is advanced stuff!", "DP artist in the making!" |
| shortstop | "Captain of the infield — nailed it!", "Communication is king at short — you've got it!", "That's a Gold Glove relay!", "You own the left side!" |
| thirdBase | "Hot corner hero! Lightning reflexes!", "Charging bunts takes courage — you've got it!", "Line guard in the 9th — that's veteran savvy!", "Hot corner MVP!" |
| leftField | "Tracking that ball like a pro!", "Backing up 3B is an OF's hidden superpower — you know it!", "That throw hit the cutoff perfectly!", "Reading the ball like a scout!" |
| centerField | "That's why CF is the captain of the outfield!", "You called it loud and early — that's leadership!", "Gap to gap coverage — elite range!", "The OF captain speaks!" |
| rightField | "Cannon arm! That throw was perfect!", "Backing up 1B on every grounder — that's elite hustle!", "Strong arm, smart throw — deadly combo!", "Right field rocket arm!" |
| batter | "You've got the eye of a cleanup hitter!", "Knowing hitter's counts from pitcher's counts is an edge!", "That's situational hitting — moving runners is how you win!", "Patient and powerful — the perfect combo!" |
| baserunner | "Speed AND smarts — that's rare!", "72% break-even for steals — you know the math!", "Reading the pitcher's first move is an art!", "That's heads-up base running!" |
| manager | "Skipper, that's a World Series move!", "RE24 says that was the right call — and so do I!", "Managing the pitching staff is the hardest job — nailed it!", "That's a championship decision!" |
| famous | "History lesson: aced!" |
| rules | "You know the rulebook inside out!" |
| counts | "Count IQ is off the charts!" |

**Position Danger Lines (4 per fielding position, 1 for special modes)**

| Position | Lines |
|----------|-------|
| pitcher | "Pitching is all about outsmarting the hitter — you'll get there!", "Remember: location beats velocity in high leverage!", "Getting ahead 0-1 changes everything — work on first-pitch strikes!", "The best pitchers think two pitches ahead." |
| catcher | "Calling a game is the toughest job on the field — keep studying!", "Remember: direct the cutoff man with your voice!", "Pop time starts with a quick transfer — keep working on it!", "The catcher sees the whole field — use that view!" |
| firstBase | "First base is all about footwork and focus — keep at it!", "Scoops save games — short-hop practice pays off!", "Remember: you're the cutoff on CF and RF throws home!", "Knowing when 2B covers for you is key." |
| secondBase | "Turning two is an art — you'll get smoother with reps!", "Cover 1B when 1B charges bunts — it's your job!", "The DP pivot takes a thousand reps — keep at it!", "Left side relay is SS, right side is you — know your assignments!" |
| shortstop | "Shortstop is the hardest infield position — keep grinding!", "Firm, chest-high feeds make the DP work!", "You cut throws to 3B — know your assignments!", "Communication is your superpower — use it!" |
| thirdBase | "The hot corner is all about reactions — they'll get faster!", "Bare-hand bunts take practice — keep charging!", "Guard the line late and close — don't give up extra bases!", "SS covers 3B when you're the cutoff — trust your teammates!" |
| leftField | "Reading the ball off the bat takes practice — you're learning!", "3B is your cutoff man on throws home — hit him!", "Back up 3B on ALL infield plays — that's your hidden job!", "Coming in on a ball is always easier than going back." |
| centerField | "Covering all that ground takes experience — keep running them down!", "You have priority on EVERY fly ball you can reach!", "Angle routes beat straight-back routes — save steps!", "Back up 2B on steal attempts — hustle pays off!" |
| rightField | "That arm will get stronger — keep making those throws!", "Back up 1B on EVERY grounder — most important routine OF job!", "1B is your cutoff on throws home — hit the target!", "Coming in is always easier than going back." |
| batter | "Even the best hitters fail 7 out of 10 times. Keep swinging!", "On 0-2, expand your zone slightly and fight off tough pitches.", "2-0 is the best hitter's count — .400 BA! Be ready for your pitch.", "Situational hitting wins games — think about moving runners!" |
| baserunner | "Base running is the hardest thing to teach — you're learning!", "Below 72% success rate, a steal attempt hurts your team.", "Never make the first or third out at third base!", "Tag up: watch the fielder's feet, leave on the catch." |
| manager | "Managing is all about the next decision. Reset and go!", "Batters hit 30 points better the 3rd time through — use that info!", "Sacrifice bunts usually cost runs — check the RE24!", "Late and close: every decision is magnified." |
| famous | "These famous plays tripped up real pros too!" |
| rules | "Even umpires argue about rules sometimes!" |
| counts | "Counts are tricky — even big leaguers get fooled!" |

### 8.3 Streak Lines

Triggered when streak ≥ 3 and the player got the answer right. Takes priority over all other line types.

| Streak | Line |
|--------|------|
| 3 | "Three in a row! You're heating up!" |
| 4 | "Four straight! Stay locked in!" |
| 5 | "Five in a row! You're on fire!" |
| 6 | "Six straight! Can't stop, won't stop!" |
| 7 | "Seven! That's a whole week of perfection!" |
| 8 | "Incredible streak going!" |
| 9 | "Double digits! You're unstoppable!" |
| 10 | "This streak is legendary!" |
| 15 | "FIFTEEN straight! You're writing history!" |
| 20 | "TWENTY! Hall of Fame material right here!" |
| 25 | "TWENTY-FIVE! Is there anything you don't know?!" |

### 8.4 Facts (25 lines)

Mix of "Did you know?" fun facts and "Brain stat:" data-driven facts. 20% chance on success for Pro users.

```
"Did you know? A MLB game has about 300 strategic decisions!"
"Fun fact: The pitcher's mound is exactly 60 feet, 6 inches from home plate!"
"Did you know? A 90 mph fastball reaches home plate in 0.4 seconds!"
"Fun fact: The average MLB game has about 146 pitches per team!"
"Did you know? Only 6% of stolen base attempts use a delayed steal!"
"Fun fact: Left-handed pitchers have a natural advantage holding runners!"
"Did you know? Batters hit .100 points higher on 3-1 counts vs 0-2 counts!"
"Fun fact: The infield fly rule was created in 1895 to stop sneaky double plays!"
"Did you know? Catchers squat and stand up over 200 times per game!"
"Fun fact: A curveball can break up to 17 inches from its starting path!"
"Did you know? The hit-and-run play has been used since the 1890s!"
"Fun fact: Relief pitchers didn't become common until the 1950s!"
"Brain stat: With bases loaded and 0 outs, teams score an average of 2.29 runs!"
"Brain stat: A sacrifice bunt with a runner on 1st costs 0.23 expected runs!"
"Brain stat: On 2-0 counts, hitters bat .400 — the best count in baseball!"
"Brain stat: Batters hit .167 on 0-2 counts — get ahead early!"
"Brain stat: Platoon advantage is worth about 18 points of batting average!"
"Brain stat: Elite catchers have a 1.85-second pop time — lightning fast!"
"Brain stat: The steal break-even rate is 72% — below that, you're hurting your team!"
"Brain stat: Runners on 2nd and 3rd with 0 outs? Teams average 2.05 runs!"
"Did you know? The force play is removed when the runner ahead is put out!"
"Fun fact: Center fielders have priority over ALL other fielders on fly balls!"
"Did you know? On a full count, the walk rate jumps but BA drops to .230!"
"Fun fact: The double play is called the pitcher's best friend!"
"Brain stat: With no one on and 2 outs, teams only average 0.11 runs. Every base counts!"
```

### 8.5 Coach Line Selection Logic

```
getCoachLine(cat, pos, streak, isPro):
  IF Pro:
    1. streak ≥ 3 AND streak line exists → streak line
    2. 20% chance on success → random fact
    3. 30% chance → position-specific line (success or danger based on cat)
  THEN (Pro or Free):
    4. Random generic line from cat (success/warning/danger)

getSmartCoachLine(cat, situation, position, streak, isPro):
  IF Pro AND situation exists:
    1. streak ≥ 3 AND streak line exists → streak line
    2. 40% chance → situational brain line (see priority order in Section 4.3)
  THEN:
    3. Fall through to getCoachLine()
```

---

## 9. Cross-References & Consistency Notes

### Knowledge Map ↔ POS_PRINCIPLES Alignment

| Knowledge Map | POS_PRINCIPLES that reference it |
|---------------|----------------------------------|
| CUTOFF_RELAY_MAP | pitcher ("NEVER be cutoff"), catcher ("Direct cutoff"), firstBase ("CUTOFF on CF/RF"), secondBase ("RELAY right side"), shortstop ("RELAY left side"), thirdBase ("CUTOFF on LF"), leftField/centerField/rightField (cutoff targets), manager (full assignments) |
| BUNT_DEFENSE_MAP | firstBase ("charge, 2B covers"), secondBase ("cover 1B on bunts"), thirdBase ("crash hard"), pitcher ("field bunts") |
| FIRST_THIRD_MAP | catcher (implicit via "Direct cutoff"), manager (implicit) |
| BACKUP_MAP | pitcher ("back up home, 3B"), leftField ("back up 3B"), centerField ("back up 2B"), rightField ("back up 1B"), catcher ("back up 1B no runners") |
| RUNDOWN_MAP | (implicit in general defensive knowledge) |
| DP_POSITIONING_MAP | manager ("play for DP early") |
| HIT_RUN_MAP | (implicit in batting/baserunning) |

### Data Consistency Checks

| Data Point | BRAIN.stats Value | Used In Coach Lines | Used In AI Prompt |
|------------|-------------------|--------------------|--------------------|
| RE24 bases loaded 0 out | 2.29 | "2.29 runs" (fact) | formatBrainStats |
| 0-2 BA | .167 | ".167 on 0-2" (fact) | formatBrainStats |
| 2-0 BA | .400 | ".400 — best count" (fact) | formatBrainStats |
| Steal break-even | 72% | "72% break-even" (fact, pos lines) | formatBrainStats |
| Bunt delta 1st/0out | -0.23 | "costs 0.23 runs" (fact) | formatBrainStats |
| Platoon edge | 18 pts | "18 points" (fact) | — |
| Pop time elite | 1.85s | "1.85-second" (pos line) | — |
| TTO 3rd time | +30 pts | "30 points better" (pos line, fact) | formatBrainStats (manager) |
| -23/2nd+3rd/0out RE24 | 2.05 | "2.05 runs" (fact) | formatBrainStats |
| ---/2out RE24 | 0.11 | "0.11 runs" (fact) | formatBrainStats |

### Animation Types (15)

Used in scenario `anim` field — AI must choose one that matches the play:

| Anim | When to Use |
|------|-------------|
| `strike` | Pitch called/swinging strike |
| `strikeout` | Batter strikes out |
| `hit` | Ball put in play for a hit |
| `groundout` | Ground ball → out |
| `flyout` | Fly ball caught |
| `steal` | Runner stealing a base |
| `score` | Runner scoring |
| `advance` | Runner advancing bases |
| `catch` | Fielder making a catch |
| `throwHome` | Throw to home plate |
| `doubleplay` | Double play turned |
| `bunt` | Bunt attempt |
| `walk` | Walk/HBP |
| `safe` | Runner called safe |
| `freeze` | Default/general |
