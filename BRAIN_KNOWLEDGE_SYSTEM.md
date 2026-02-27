# Baseball Strategy Master — Brain & AI Knowledge System Reference

> This document extracts the entire in-code knowledge system from `index.jsx` into a readable reference. It covers the BRAIN constant, all 19 knowledge maps, POS_PRINCIPLES, coach line system, AI prompt template, role violations, and Brain API functions. Use this alongside `SCENARIO_BIBLE.md` to reason about, expand, and verify the knowledge system.

---

## Table of Contents

1. [POS_PRINCIPLES — Position-Specific Principles](#1-pos_principles--position-specific-principles)
2. [Knowledge Maps (19 Authoritative Maps)](#2-knowledge-maps-19-authoritative-maps)
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

## 2. Knowledge Maps (19 Authoritative Maps)

These are the "non-negotiable" reference tables injected into AI prompts based on position relevance. They define correct defensive assignments that must never be contradicted.

### 2.1 CUTOFF_RELAY_MAP

```
CUTOFF/RELAY ASSIGNMENTS (non-negotiable):
SINGLE CUTS to HOME: LF→Home cutoff=3B. CF→Home cutoff=1B. RF→Home cutoff=1B.
SINGLE CUTS to 3B (runner going 1st→3rd): All OF→3B cutoff=SS. SS lines up between OF and 3B.
SINGLE CUTS to 2B (no play at home): Cutoff man holds ball or redirects. SS covers 2B.
DOUBLE CUTS (extra-base hits to gap/wall): Left side (LF line, LF-CF gap, deep CF) lead relay=SS, trail=2B.
  Right side (RF-CF gap, RF line) lead relay=2B, trail=SS or 1B.
TRAIL MAN: Positions 20-30 feet behind lead relay, in line with home plate. Backs up the lead relay throw.
TWO-RUNNER SITUATION: Always default relay toward HOME — stop the lead runner. Redirect only on catcher's call.
FOUL TERRITORY THROWS (near 1B/3B line): Closest infielder (1B or 3B) becomes cutoff. Align toward home.
POP-UP NEAR FOUL LINE: Fielder who catches it has no relay assignment — throw directly to base. Cutoff man stays ready.
NO RUNNERS ON: Cutoff assignments still apply — trail runner may be trying to advance. Always align to home default.
PITCHER: Backs up TARGET BASE on every relay/cutoff play. Sprint to backup position before throw is made. NEVER the cutoff or relay man.
CATCHER: Stays at home. Directs cutoff with voice: "Cut!" (hold), "Cut two!" (redirect to 2B), "Cut three!" (redirect to 3B), silence=let it go through.
NEVER: Pitcher cuts the throw. Catcher goes out as cutoff. Relay man throws across runner's body.
```

**Injected for**: ALL positions (via MAP_RELEVANCE — all 12 position categories)

### 2.2 BUNT_DEFENSE_MAP

```
BUNT DEFENSE ASSIGNMENTS (non-negotiable):
NO RUNNERS (safety bunt for hit): P charges. 1B charges. 3B holds. 2B covers 1B. SS covers 2B. C directs.
RUNNER ON 1ST ONLY: P fields bunt near mound. 1B charges. 3B charges. 2B covers 1st. SS covers 2nd. C directs. Throw to 2nd if bunt is fielded quickly.
RUNNER ON 2ND ONLY: P fields. 1B charges. 3B charges HARD (lead runner). SS covers 3rd. 2B covers 1st. C directs. Priority: throw to 3rd to get lead runner.
RUNNER ON 3RD ONLY (suicide squeeze): P throws high and tight immediately. C charges. 1B holds. 3B charges. Goal: get runner at home if bunt is popped up or fielded quickly.
RUNNERS ON 1ST & 2ND (standard): P fields near mound. 1B charges. 3B charges. SS covers 3rd. 2B covers 1st. C directs. Priority: throw to 3rd for force on lead runner.
RUNNERS ON 1ST & 2ND (wheel play): 3B crashes HARD early on pitch. SS rotates to cover 3rd before the pitch. 2B covers 1st. P covers mound area. Goal: force play on lead runner at 3rd.
BASES LOADED: Same as runners 1st & 2nd — throw home for force if fielded cleanly. C must be at plate.
2 OUTS: No bunt defense — fielders play normal depth. A bunt with 2 outs is almost always an error by the offense.
FAKE BUNT / SLASH: 1B and 3B charging = massive hole on right side. Batter will slash through that hole. 2B must read and hold depth until ball is hit.
PRIORITY RULE: Lead runner out > trail runner out. Force at 3rd with runners 1st & 2nd is the highest-value play.
NEVER: SS covers 1st on a bunt. 2B covers 3rd with runners 1st & 2nd. Pitcher makes base-coverage calls — that is the catcher's job.
```

**Injected for**: pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, manager

### 2.3 FIRST_THIRD_MAP

```
FIRST-AND-THIRD DEFENSE (non-negotiable):
SETUP: 1B holds runner at 1st. SS and 2B shade toward 2B. 3B holds at 3rd. P varies looks. C reads R3 lead.
CATCHER'S 4 OPTIONS when R1 steals with R3 on base:
1. THROW THROUGH to 2B: SS covers 2B, takes throw, looks R3 back at 3rd. Use when R3 lead is short.
2. CUT BY MIDDLE IF: C throws to 2nd. SS (or 2B) cuts throw short, looks at R3. If R3 breaks home, fire home. Use when R3 lead is medium.
3. FAKE AND THROW: C pump-fakes to 2nd, fires to 3B to catch R3 leaning. 3B must be READY and holding the bag. Use when R3 is aggressive.
4. HOLD THE BALL: Concede the stolen base, keep R3 at third. Use when R3 has a huge lead and will score on any throw.
PITCHOUT OPTION: P throws pitchout (outside). C receives standing up and fires immediately. Best option when steal is obvious. Costs a ball in count — use on 1-0, 2-0 only.
2-OUT VARIANT: With 2 outs, R3 goes on contact regardless. A throw to 2B on a steal CANNOT score R3 unless there is an error. Catcher should throw through to 2B freely with 2 outs.
DOUBLE STEAL (both runners go): C must read quickly. If R3 breaks immediately, throw home. If R3 holds, throw to 2B (middle IF cuts). P ducks out of throwing lane the instant R1 breaks.
INFIELD POSITIONING: SS and 2B must straddle the lane between home and 2B to cut the throw quickly. They do NOT fully commit to 2B until ball is released.
KEY ASSIGNMENTS: 1B stays at 1B (holds R1, do not break toward 2B). P ducks immediately out of throwing lane. Never throw to 2nd if R3 has a big lead.
NEVER: 1B breaks to cover 2B (leaves first unoccupied). P stays upright in throwing lane. Catcher throws blindly without reading R3 lead.
```

**Injected for**: pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, manager

### 2.4 BACKUP_MAP

```
BACKUP RESPONSIBILITIES (non-negotiable):
PITCHER: Backs up HOME on ALL OF throws home (sprint before the throw lands). Backs up 3B on OF throws to third. Backs up 1B on bunt plays when 1B charges.
CATCHER: Backs up 1B on grounders with NO runners on. Stays at home on ALL other plays.
FIRST BASE: When acting as cutoff (CF/RF throws home), has no backup assignment — 2B covers 1B.
SECOND BASE: Backs up SS on steal throws to 2B when 2B is not covering. Backs up 1B when 1B is acting as cutoff.
SHORTSTOP: Backs up 3B on throws from 1B to 3B (rare). Backs up 2B on steal throws when SS covers 2B.
THIRD BASE: Backs up home on wild pitches/passed balls with R3. Backs up SS on throws to 3B from catcher (fake-and-throw play).
LEFT FIELD: Backs up 3B on ALL infield grounders and throws to third. Backs up CF on balls hit to LF-CF gap.
CENTER FIELD: Backs up 2B on ALL steal attempts and throws to second. Backs up 3B on deep throws to third from RF. Backs up LF on LF-CF gap balls. Backs up RF on RF-CF gap balls.
RIGHT FIELD: Backs up 1B on EVERY infield grounder (most important routine OF backup job). Backs up CF on RF-CF gap balls.
FOUL TERRITORY BACKUPS: On foul pop-ups near the line, the nearest OF moves to back up the infielder's throw to any base.
POP-UPS BEHIND INFIELD: OF backs up the catch from 15-20 feet behind — infielder may drop it. Sprint immediately when ball goes up.
RULE: Every throw needs a backup in direct line behind the target base. Sprint — don't jog. Be in position BEFORE the throw, not after.
NEVER: Two fielders sprint to the same backup spot. Any fielder stands still when a throw is in the air. Pitcher backs up home by stopping halfway down the line.
```

**Injected for**: pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, leftField, centerField, rightField, manager

### 2.5 RUNDOWN_MAP

```
RUNDOWN PROCEDURE (non-negotiable):
STANDARD: Run HARD at runner — drive him BACK toward previous base (NOT forward toward next base).
Hold ball HIGH and visible at all times. Run FULL SPEED toward the runner.
ONE THROW maximum — firm, chest-high to the receiver's glove-side. Receiver applies tag.
BACKUP ROTATION: Thrower immediately sprints to fill the vacated base. 2 fielders per base at all times.
RUNNER GOING FORWARD (toward next base): If runner turns and breaks forward, the fielder at the next base applies the tag. Receiving fielder runs AT the runner, not toward the next base.
TWO-RUNNER RUNDOWN (rare): Focus on the lead runner first. The trailing runner cannot advance while lead runner is in jeopardy. Tag the lead runner out, THEN address the trail runner.
OUTFIELD RUNDOWN: Same mechanics. OF runs hard at runner. Nearest infielder fills the closest base. OF never lobs — firm chest-high throw only.
FORCE REMOVED DURING RUNDOWN: If runner ahead is tagged out, force is removed on all trailing runners. Fielders must TAG the runner, not just step on the base.
RUNNER RETREATING TRICK: Runner may stop short to bait a lob. Never lob regardless. Run full speed, force the early throw.
NEVER: Pump-fake during a rundown (gives runner a free step). Lob the ball. Throw across the runner's body. Allow more than one throw. Abandon a base during rotation.
RUNNER'S COUNTER-STRATEGY: Draw as many throws as possible — every throw is an error chance. Stop-start-stop to bait the pump fake. Try to reach a base during the rotation gap.
```

**Injected for**: firstBase, secondBase, shortstop, thirdBase, baserunner, manager

### 2.6 DP_POSITIONING_MAP

```
DOUBLE PLAY POSITIONING (non-negotiable):
DP DEPTH WHEN: Runner on 1st (or 1st & 2nd, or loaded), less than 2 outs. 3-4 steps toward 2B + half step toward home. Reduces range ~15% but speeds pivot.
NORMAL DEPTH WHEN: 2 outs (can't turn two — maximize range). No force at 2nd.
INFIELD IN WHEN: Runner on 3rd, less than 2 outs, run matters. Sacrifice range to throw home on grounders.
INFIELD IN vs DP DEPTH CONFLICT: With runners on 1st & 3rd, less than 2 outs — play DP depth. A DP ends the inning. Giving up the run while turning two is usually the right trade.
LOADED BASES DP: Force at every base. Infielders play DP depth. On a grounder, throw home for force, then first for the DP. Catcher must be alert for the flip to 1B.
LHB SHIFT (with shift ban): 2 infielders required on each side of 2B. SS shades toward 3B hole. 2B shades toward 1B-2B hole. Standard DP pivot still applies.
RHB DP ANGLE: 6-4-3 (SS to 2B to 1B) — SS needs a clean, firm feed. 2B pivot gets off the bag quickly.
LHB DP ANGLE: 5-4-3 (3B to 2B to 1B) or 4-6-3 (2B to SS to 1B). 3B must field cleanly and throw quickly. SS covers 2B on 4-6-3 pivot.
CRITICAL: With 2 outs, never play DP depth — there is NO double play possible. Maximize range for the single out.
NEVER: DP depth with 2 outs. Infield in with 2 outs and no R3. Play normal depth with runner on 1st and 0 outs — DP depth is the right call.
```

**Injected for**: pitcher, firstBase, secondBase, shortstop, thirdBase, manager

### 2.7 HIT_RUN_MAP

```
HIT-AND-RUN ASSIGNMENTS (non-negotiable):
BATTER: MUST swing at ANY pitch — protect the runner who is already running. Ground ball through vacated hole > power. Swing even at a ball in the dirt if necessary to protect the runner.
RUNNER: Go on the pitcher's FIRST MOVE. Do NOT look back. Read the ball off the bat only after 2nd base is reached.
WHO COVERS 2B: LHH → SS covers 2B (hole opens at SS side, batter aims there). RHH → 2B covers 2B (hole opens at 2B side, batter aims there).
BATTER MISSES THE SIGN (doesn't swing): Runner is hung out — no protection. Runner should abort if lead is not committed, or slide hard if already halfway.
BATTER SWINGS AND MISSES: Catcher fires to 2B immediately. Runner is caught in a vulnerable position. This is the biggest risk of the hit-and-run.
POP-UP ON HIT-AND-RUN: Runner may be doubled off if they don't freeze and read. NEVER run full speed on a line drive or pop-up — risk of double play is high.
PITCHOUT COUNTER: Defense throws a pitchout (outside pitch). C receives standing and fires to 2B. Pitcher should throw pitchout if hit-and-run is suspected on 1-0, 2-1, 3-1 counts.
PITCHER STRATEGY: Throw a pitch away from the batter's power zone. Pitchout, breaking ball in the dirt, or high fastball — all make the batter's job harder.
BEST HIT-AND-RUN COUNTS: 1-0, 2-0, 2-1, 3-1 — hitter's counts where batter is likely to see a strike and pitcher is less likely to pitchout.
NEVER: Runner looks back at the plate while running. Batter takes the pitch on a hit-and-run (unless sign is missed — see above). Hit-and-run with a slow runner or unreliable bat-to-ball hitter.
```

**Injected for**: secondBase, shortstop, batter, baserunner, manager

### 2.8 PICKOFF_MAP

```
PICKOFF MOVES & DECEPTION (non-negotiable):
RHP FROM STRETCH (to 1B): Step directly toward 1B AND throw in one motion. No step = balk. Step must be toward the base, not toward home.
LHP FROM STRETCH (to 1B): LHP faces 1B naturally from the stretch. Can throw to 1B at any time without restriction — this is the lefty's natural advantage. No step requirement toward 1B for LHP.
RHP/LHP TO 3B: Step directly toward 3B AND throw. Must be a genuine throw — no fake.
FAKE 3B/THROW 1B: ILLEGAL since 2013 (Rule 6.02(a)(4)). Always a balk. This play no longer exists in MLB.
STEP OFF RUBBER: Pitcher lifts back foot off rubber — becomes a fielder. Can throw anywhere, fake anywhere, no balk restriction. Step off is a legal "reset."
DAYLIGHT PLAY at 2B: SS or 2B breaks toward 2nd base FIRST. If daylight (gap) appears between the fielder and the runner, pitcher throws. Pitcher CANNOT initiate — he reacts to the fielder's break.
1B PICKOFF TIMING: After 2+ looks, change timing — throw early, throw late, step off instead. Predictable pickoff timing = zero deception.
PITCHOUT to STEAL: Pitcher throws outside by 2+ feet. Catcher steps to right side and fires. Costs a ball in count — use on 1-0, 2-0, 3-1 counts only.
PICKOFF TELLS (runner): Weight forward, big lean, exaggerated secondary lead — these are times to throw. Never throw to an empty base for no reason.
NEVER: Throw to an unoccupied base (balk). Fake to first and then throw to first (balk). Throw to 3rd, spin and throw to 1st (balk). Drop the ball during a pickoff motion (balk).
```

**Injected for**: pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, baserunner, manager

### 2.9 PITCH_CLOCK_MAP

```
PITCH CLOCK STRATEGY (non-negotiable per 2023 MLB Rules):
PITCHER CLOCK: 15 seconds with bases empty. 20 seconds with runners on. Violation = automatic BALL added to count.
BATTER CLOCK: Must be alert in batter's box with 8 seconds remaining. 1 timeout per PA. Violation = automatic STRIKE added to count.
DISENGAGEMENTS: Pitcher gets 2 disengagements (pickoffs or step-offs) per batter. 3rd disengagement = balk UNLESS runner is picked off. Successful pickoff resets the count.
CATCHER VISIT: Catcher can visit the mound once per inning without it counting as a team mound visit. Clock resets after the visit ends.
MOUND VISIT CLOCK RESET: Any mound visit (catcher or coach) resets the pitch clock. Infield meetings do NOT reset it.
VARY TEMPO: Quick-pitch after a long hold disrupts the batter's timing more than a constant pace. Mix up 6-second deliveries with 18-second deliveries in the same at-bat.
HIGH-LEVERAGE DELIVERY: Use the full 20 seconds on 0-2 or full count with runners on. Make the hitter uncomfortable. Never rush a high-leverage pitch.
STEAL READS: The clock makes delivery windows MORE predictable — runners can time the pitcher more easily. Pitchers must vary tempo and add disengagements to compensate.
SIGN DELIVERY: Catcher must deliver signs efficiently. Pitcher should receive signs and be set within 9 seconds of catcher's return to setup. Slow sign sequences cost clock time.
NEVER: Rush a pitch to beat the clock on a 0-2 or full count. Use all 3 disengagements without a genuine read — the balk risk on the 3rd is too high. Ignore the clock until there are 3 seconds left.
```

**Injected for**: pitcher, catcher, batter, baserunner, manager

### 2.10 WP_PB_MAP

```
WILD PITCH / PASSED BALL COVERAGE (non-negotiable):
CATCHER: Go to the BALL first — never look at the runner first. Field the ball, then look, then throw. Quick glance to read runner location is allowed only after the ball is secured.
PITCHER: Sprint to cover HOME PLATE the instant the ball passes the catcher. Set up on the FIRST-BASE SIDE of the plate to give the catcher a throwing lane for any return throw.
BASES EMPTY: No coverage needed at home — pitcher covers home as routine. Catcher retrieves and returns the ball.
RUNNER ON 1ST ONLY: Runner may go to 2nd. Pitcher covers home. CF backs up 2B. SS covers 2B. Catcher retrieves and fires to 2B only if ball is in front.
RUNNER ON 2ND ONLY: Runner may go to 3rd. 3B holds at bag. Pitcher covers home. LF backs up 3B. Catcher retrieves — do NOT throw to 3B unless ball is directly in front and throw is easy.
RUNNER ON 3RD: Runner will break for home. Catcher fields ball and tags runner at plate OR returns to plate for pitcher's tag. Pitcher must reach plate before runner. 3B backs up home on extended wild pitches.
MULTIPLE RUNNERS: Catcher reads LEAD runner. Sprint assignment is the same — pitcher to home, OF backups to their bases.
2-OUT VARIANT: With 2 outs, runner goes on anything. Same coverage assignments — pitcher must still sprint home, not hesitate.
BASES LOADED: Catcher fields and steps on home for force out. Pitcher sprints home anyway as backup.
NEVER: Catcher looks at runner before fielding the ball. Pitcher remains on mound when ball passes catcher. Third baseman abandons 3B to chase a wild pitch with runner on 2nd.
```

**Injected for**: pitcher, catcher, firstBase, thirdBase, baserunner, manager

### 2.11 SQUEEZE_MAP

```
SQUEEZE PLAY (non-negotiable):
SAFETY SQUEEZE: Runner goes on CONTACT. Batter bunts only if pitch is buntable. Lower risk — batter controls the trigger. Runner reads bunt, then breaks.
SUICIDE SQUEEZE: Runner commits on PITCHER'S FIRST MOVE. Batter MUST bunt no matter what — even a ball in the dirt. The runner is already going. A missed bunt = runner dead at home.
NEVER SUICIDE WITH 2 STRIKES: A foul bunt on 2 strikes = strikeout AND the runner is dead at home. This is a catastrophic out. Two-strike safety squeeze only.
RUNNER AT 2ND & 3RD: Both runners read the bunt. R3 uses normal squeeze read. R2 advances to 3rd on contact — do not send R2 home.
BATTER SHOWS BUNT LATE: Square up as late as possible to keep defense guessing. Pitcher cannot adjust a pitch already released.
FAKE SQUEEZE / PULL BACK: Batter shows bunt, pulls back, takes the pitch. Used to read the pitcher's adjustment. Not a swing — batter takes the pitch intentionally.
POP-UP ON SQUEEZE ATTEMPT: R3 on suicide squeeze is dead if it's caught — a popped-up bunt with runner committed = double play. Batter must keep the bunt on the ground.
FOUL BUNT: Safety squeeze foul = just a strike (unless 2 strikes). Suicide squeeze foul with 0-1 strikes = count goes to 1 or 2 strikes. Still alive.
PITCHER DEFENSE AGAINST SQUEEZE: High and tight fastball is hardest to bunt — forces an ugly bunt or a pull-back. Detect squeeze early (R3 starting early) and go high-tight immediately.
CATCHER READS SQUEEZE: If runner breaks and batter pulls back, fire to 3B immediately. If bunt is popped up, come out of crouch and catch it.
NEVER: Suicide squeeze with 2 strikes. Suicide squeeze with a slow runner. Send R2 home on a squeeze — only R3 scores.
```

**Injected for**: pitcher, catcher, firstBase, thirdBase, batter, baserunner, manager

### 2.12 INFIELD_FLY_MAP

```
INFIELD FLY RULE (non-negotiable — MLB Rule 5.09(b)(6)):
WHEN CALLED: Less than 2 outs, runners on 1st & 2nd OR bases loaded, fair fly ball that an infielder can catch with ordinary effort.
BATTER: Automatically OUT regardless of whether ball is caught or dropped. The out is recorded the instant the umpire calls it.
RUNNERS: NOT forced. May advance at their own risk after the IFF is called — they are not required to tag up.
BALL CAUGHT: Runners tag up and advance normally. They cannot be forced anywhere.
BALL DROPS FAIR: Batter still out. Runners may advance at own risk — they are treated as if it was a fair ball in play. No force play.
BALL DRIFTS FOUL: IFF is cancelled — ordinary foul ball. Batter is NOT out. Count continues.
UMPIRE TIMING: Umpire calls IFF while ball is in the air — "Infield fly! Batter is out!" Fielder must be in the infield area. Umpire judgment on "ordinary effort."
LINE DRIVES: NEVER an infield fly. Force play rules apply normally. Runners must read it and react.
BUNT POP-UPS: NEVER an infield fly — rule does not apply to bunts.
RUNNER STRATEGY: On an IFF, runners can advance — but only at their own risk. Advancing when the ball drops fair can score runs if the fielders are not alert.
NEVER: Assume runners are forced to advance on an IFF. Assume a dropped IFF ball starts a force play. Call an IFF on a line drive or bunt pop-up.
```

**Injected for**: firstBase, secondBase, shortstop, thirdBase, batter, baserunner, manager

### 2.13 OF_COMMUNICATION_MAP

```
OUTFIELD COMMUNICATION & POSITIONING (non-negotiable):
CF HAS PRIORITY: Over ALL players on any ball CF can reach — corner OF and all infielders. His call is final and absolute. No exceptions.
CORNER OF PRIORITY: LF and RF have priority over nearest infielders (LF > 3B and SS; RF > 1B and 2B) on any ball they can reach coming in.
CALL SYSTEM: "I got it! I got it!" — loud, early, twice minimum. First call claims the ball. Everyone else peels off immediately and backs up the throw angle.
GAP BALLS (LF-CF or RF-CF): CF calls if he can reach. If not, the nearest corner OF calls and takes it. Middle infielder (SS or 2B) goes to relay position immediately.
COLLISION ZONE: When two OFs converge, the one who calls FIRST owns the ball. Late caller must peel off. NEVER a late call after another fielder has already called it.
FOUL TERRITORY POP-UPS: Nearest fielder calls it. OF has priority over infielder in foul territory — the ball is moving away from the infielder and toward the outfielder. C and 1B/3B defer to OF if OF can reach.
TWO-OF CONVERGENCE: If both corner OFs converge on a ball in LF-CF or RF-CF gap, CF has priority. Corner OF calls "YOU! YOU!" to wave CF off only if CF clearly cannot reach and corner OF can.
SUN BALLS: Glove shield PRIMARY, sunglasses SUPPLEMENTARY. Keep eyes on the ball at all times — never look directly into sun. Call for sun ball help from teammates.
WALL PLAY: Find the warning track (texture change) with feet — never take eyes off the ball to find the wall. Use the wall with the glove hand, not the throwing hand.
PRE-PITCH ADJUSTMENTS: Shade toward pull side for known pull hitters. Communicate wind direction and sun angle to teammates before each inning begins.
NEVER: Allow a no-call fly ball between two fielders. Call off CF after he has already called the ball. Take eyes off a fly ball to find the wall with your eyes.
```

**Injected for**: leftField, centerField, rightField

### 2.14 POPUP_PRIORITY_MAP

```
POP-UP PRIORITY & MECHANICS (non-negotiable):
INFIELD POP-UPS (fair territory):
  SS and 2B have priority over 1B and 3B on pop-ups between them.
  Any infielder can call off another infielder — the one who calls loudest and first owns it.
  CF has priority over ALL infielders on pop-ups he can reach coming in.
  OF coming in ALWAYS has priority over IF going back. This is the universal rule.
CATCHER POP-UPS (near home plate):
  Catcher has PRIORITY on all pop-ups within 30 feet of home plate.
  Catcher turns BACK to the field immediately — the ball curves back toward fair territory.
  Remove mask: toss it away from the direction you will move, NOT directly behind you.
  Pitcher calls "Ball! Ball!" to help locate it — then gets out of the catcher's path.
FOUL TERRITORY POP-UPS (along foul lines):
  OF has priority over nearest infielder on foul pop-ups they can reach.
  Ball in foul territory moves AWAY from the fielder — drift toward the stands.
  Fielder should set up slightly inside the ball's path to compensate for drift.
  1B on RF foul line: RF has priority. 3B on LF foul line: LF has priority.
COMMUNICATION:
  First call wins. "I got it! I got it!" twice minimum.
  Late call = defer immediately. Never fight for a ball after another fielder has called it.
  On an uncalled pop-up: nearest fielder must take it — do not watch it drop.
DROP PROTOCOL:
  If pop-up is dropped, treat as a live ball. Runners may advance.
  Infield fly rule may be in effect — check runners/outs before assuming.
NEVER: Catcher looks at home plate while tracking a pop-up. Fielder moves in front of another who has already called it. Two fielders watch a pop-up drop uncalled.
```

**Injected for**: pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, leftField, centerField, rightField, manager

### 2.15 OBSTRUCTION_INTERFERENCE_MAP

```
OBSTRUCTION & INTERFERENCE (non-negotiable — MLB Rules 6.01 & 6.03):
DEFINITIONS (critical — never confuse these):
  OBSTRUCTION: A FIELDER impedes a RUNNER. Fielder is at fault.
  INTERFERENCE: A RUNNER or BATTER impedes a FIELDER. Runner/batter is at fault.
  Memory: "O = fielder Obstructs runner. I = runner Interferes with fielder."
OBSTRUCTION (Rule 6.01(h)):
  TYPE A (fielder without the ball blocks base path): Play is DEAD immediately. Runner awarded base(s) they would have reached without obstruction. Common at home plate.
  TYPE B (fielder without ball impedes runner not in immediate play): Play continues. Umpire awards bases after play ends if runner was disadvantaged.
  LEGAL BLOCK: Fielder may block the base path ONLY if actively fielding a batted ball OR has the ball. Fielding a throw counts — receiving a throw and then blocking the plate is legal.
  PLATE BLOCK: Catcher must give the runner a lane to the plate if the ball has not arrived yet. Blocking the plate without the ball = Type A obstruction.
INTERFERENCE (Rule 6.01(a)):
  BATTER INTERFERENCE: Batter hits the catcher's glove on the backswing INTENTIONALLY = interference. Unintentional backswing contact = no interference.
  RUNNER INTERFERENCE: Runner deliberately interferes with a fielder making a play (e.g., runner on 2nd tips a throw) = runner is out, batter returns.
  BATTED BALL INTERFERENCE: Fair batted ball hits a runner in fair territory before passing an infielder = runner is out.
  DOUBLE-PLAY INTERFERENCE: Runner slides to break up a DP by going outside the base path or making contact with fielder beyond the base = runner AND batter are out.
UMPIRE SIGNALS: Obstruction = point at fielder and call "That's obstruction!" Interference = point at runner and call "That's interference!"
NEVER: A fielder without the ball blocks the base path (obstruction). A runner intentionally contacts a fielder to break up a play (interference). Confuse which player is at fault.
```

**Injected for**: ALL positions (all 12 position categories)

### 2.16 TAGUP_SACRIFICE_FLY_MAP

```
TAG-UP & SACRIFICE FLY (non-negotiable):
TAG-UP RULE (MLB Rule 5.09(b)(5)):
  Runner must RE-TOUCH their base after a caught fly ball before advancing.
  Runner may leave WHEN THE FIELDER TOUCHES THE BALL — not before, not after.
  "Leave on the catch" = the exact moment the fielder's glove contacts the ball.
  Early departure = runner is out on appeal if defense throws to the original base.
TIMING THE LEAVE:
  Watch the fielder's FEET and GLOVE, not the ball in the air.
  Start moving weight forward when the fielder is 3-4 steps from the catch.
  Full sprint the instant the ball is caught. Every tenth of a second matters.
FAIR vs FOUL TAG-UPS:
  Fair fly ball: standard tag-up rules apply.
  Foul fly ball: same rules — runner can tag and advance on a caught foul fly.
  FOUL POP-UP near wall: if caught, runner may tag up and try to advance (rare but legal).
MULTIPLE RUNNERS TAGGING:
  LEAD runner has priority — will likely score. Tag up from 3rd first.
  Trail runners must read: did the lead runner go? Is there a throw developing?
  Two runners can both attempt to advance — defense must make a choice.
SACRIFICE FLY RE24 VALUE:
  Sac fly scores a run but records an out. It does NOT lower run expectancy the way a sac bunt does.
  Sac fly with R3, <2 outs = net positive — you scored a run.
  Sac fly with R2 (runner on 2nd, trying to score) = almost never correct. The run from 2nd on a fly is very rare.
  The goal is a FLY BALL to the OUTFIELD, not a popup to the infield. Depth of fly ball matters.
OF THROW MECHANICS ON TAG-UP:
  Throw to the BASE before the runner arrives, not at the runner.
  Hit the cutoff man unless throw is clearly going to beat the runner.
  CF tag-up throw home: 1B is the cutoff. LF tag-up throw home: 3B is the cutoff.
NEVER: Leave before the catch (early departure = appealable out). Look at the ball in flight instead of watching the fielder's glove. Throw at the runner instead of the base.
```

**Injected for**: leftField, centerField, rightField, batter, baserunner, manager

### 2.17 PITCHING_CHANGE_MAP

```
PITCHING CHANGE MECHANICS (non-negotiable):
WHEN MANAGER VISITS MOUND:
  If manager crosses the foul line = automatic pitching change UNLESS:
    (a) The original pitcher completes the visit, or
    (b) An injury or defensive conference is declared.
  Second visit to the same pitcher in the same inning = mandatory removal. No exceptions.
WARM-UP PITCHES:
  New pitcher gets 8 warm-up pitches (MLB Rule 5.07(b)). This time is limited — pitcher must be ready.
  Catcher warms up new pitcher. First baseman or infielder can warm up if catcher is injured.
  If no warm-up time (e.g., pitcher was warming in the bullpen), pitcher still gets 8 pitches.
3-BATTER MINIMUM RULE (2020+):
  Relief pitcher must face at least 3 batters OR pitch to the end of the inning, UNLESS pitcher sustains an injury or illness.
  Exception: If the pitcher entered mid-inning, they must complete that half-inning.
  Strategic impact: Can no longer bring in a LOOGY (left-one-out guy) for one batter.
INHERITED RUNNER RULES:
  If a pitcher leaves with runners on base and those runners score, the ORIGINAL pitcher is charged with the earned runs.
  Relievers are NOT charged for inherited runners who score.
  This is a scorekeeping rule — doesn't affect in-game strategy but explains pitching change timing.
COVERAGE DURING CHANGE:
  Infield maintains normal positioning. No one breaks until the new pitcher is ready.
  Catcher jogs to mound when manager exits. SS or 2B often joins the meeting.
  The NEW pitcher jogs from the bullpen — fielders give him space on the mound.
POSITION CHANGES DURING CHANGE:
  Manager may shift a fielder to a different position without removing them from the game.
  Common: position player moves to another spot, then the new pitcher goes to that vacated spot.
NEVER: A second mound visit to the same pitcher in the same inning without removing him. Bringing in a reliever who faces fewer than 3 batters (unless injury). Catcher warming up the new pitcher with the wrong hand.
```

**Injected for**: pitcher, catcher, manager

### 2.18 INTENTIONAL_WALK_MAP

```
INTENTIONAL WALK (non-negotiable):
2023+ RULE: Manager signals the IBB from the dugout. No pitches are thrown. Batter goes directly to 1B. This replaced the 4-pitch walk system.
RE24 COST: An IBB ALWAYS increases run expectancy — you are trading a hard at-bat for a worse base-out state.
  Example: R2, 1 out (0.71 RE) -> R1+R2, 1 out (0.96 RE) = +0.25 runs gifted to the offense.
  Example: R2+R3, 1 out (1.44 RE) -> Loaded, 1 out (1.59 RE) = +0.15 runs gifted.
WHEN IBB IS JUSTIFIED:
  (1) First base is open AND next hitter is clearly weaker.
  (2) Setting up a force play — loading the bases to get a force at home on a grounder.
  (3) Large platoon advantage vs the next hitter (vs the current hitter who has platoon edge).
  (4) Avoiding a hot hitter to face a cold hitter in a critical game situation.
WHEN IBB IS ALMOST NEVER RIGHT:
  Bases loaded — walking in a run is always wrong.
  Two outs — RE cost is smaller but still negative. Next hitter must be dramatically weaker.
  Early in the game (1st-5th inning) — too many plate appearances remain for the extra baserunner to cause damage.
POSITIONING DURING IBB:
  All fielders maintain their defensive positions while the manager signals.
  No fielder moves until the umpire declares "Ball Four" and the batter takes first.
RUNNERS ADVANCE:
  On an IBB, any runner forced by the batter's advancement automatically advances one base.
  No runner advances beyond one base on an IBB.
NEVER: IBB with bases loaded. IBB early in the game to a non-dominant hitter. Assume IBB is "safe" — it always costs run expectancy.
```

**Injected for**: pitcher, catcher, batter, baserunner, manager

### 2.19 LEGAL_SHIFT_MAP

```
DEFENSIVE POSITIONING — SHIFT ERA & SHIFT BAN (non-negotiable):
SHIFT BAN RULE (2023+): At the time of pitch, all 4 infielders must be in the infield dirt, with 2 infielders on each side of second base. Violation = automatic ball.
STILL LEGAL:
  Deep positioning (playing back toward the outfield grass).
  Infield in (all 4 infielders on the outfield grass side of the baselines — when run at 3rd matters).
  Outfield shifts (4 outfielders on one side — no rule restricts outfield positioning).
  Standard pull-side alignment (SS shades toward the 3B hole for a pull LHH — both still on left side of 2B).
ILLEGAL:
  3 infielders on one side of 2B (the old Ted Williams shift).
  Any infielder positioned in the outfield grass in their normal defensive alignment.
  SS playing on the right side of 2B for LHH (requires stepping across 2B).
STRATEGIC ALTERNATIVES TO THE SHIFT:
  Play LHH pull hitters with 3B at the 3B line, SS in normal position, 2B shaded toward 1B-2B hole, 1B toward 1B line.
  Position corners deeper to take away the double down the line.
  Deploy a 4-outfielder alignment (one IF moves to OF) — still legal but rare.
  Use pitch location to force the ball where your defense is positioned.
APPEAL CHECK: Umpires verify positioning at the time of the pitch — a fielder may be moving but must be in legal position when the pitch is released.
LHH vs RHH POSITIONING:
  LHH (pull hitter): SS on left of 2B toward 3B hole. 2B shaded right of 2B toward 1B hole. Still legal.
  RHH (pull hitter): 2B on right of 2B toward 1B line. SS shaded slightly left. Standard alignment.
NEVER: 3 infielders on one side of 2B at time of pitch (illegal shift). Outfielder playing in infield depth in normal defensive alignment. Positioning any player so that a legal shift violation occurs.
```

**Injected for**: firstBase, secondBase, shortstop, thirdBase, batter, baserunner, manager

---

## 3. Map Relevance & Audit System

### MAP_RELEVANCE Table

| Map | Positions That Receive It |
|-----|--------------------------|
| CUTOFF_RELAY_MAP | ALL positions (all 12 position categories via MAP_RELEVANCE) |
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
| POPUP_PRIORITY_MAP | pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, leftField, centerField, rightField, manager |
| OBSTRUCTION_INTERFERENCE_MAP | ALL positions (all 12 position categories) |
| TAGUP_SACRIFICE_FLY_MAP | leftField, centerField, rightField, batter, baserunner, manager |
| PITCHING_CHANGE_MAP | pitcher, catcher, manager |
| INTENTIONAL_WALK_MAP | pitcher, catcher, batter, baserunner, manager |
| LEGAL_SHIFT_MAP | firstBase, secondBase, shortstop, thirdBase, batter, baserunner, manager |

### MAP_AUDIT Strings

These are appended to the AI self-audit checklist as numbered items (starting at item 10):

| Map | Audit Check |
|-----|-------------|
| CUTOFF_RELAY_MAP | "CUTOFF/RELAY: Assignments correct per map? 3B cuts LF→Home, 1B cuts CF/RF→Home. SS relays left side, 2B relays right side. Pitcher backs up target base, never cuts. Trail man in position." |
| BUNT_DEFENSE_MAP | "BUNT DEFENSE: Assignments match map? 2B covers 1st, SS covers 3rd (runners 1st & 2nd). No bunt defense with 2 outs. Fake bunt/slash leaves right side open — 2B holds." |
| FIRST_THIRD_MAP | "FIRST-AND-THIRD: Options match map? SS/2B cuts, pitcher ducks, 1B stays. 2-out = throw freely to 2B. Double steal = read R3 first." |
| BACKUP_MAP | "BACKUP: Responsibilities correct? RF→1B, LF→3B, CF→2B on steals, P→home and 3B, C→1B with no runners. Foul territory and pop-up backups covered." |
| RUNDOWN_MAP | "RUNDOWN: Chase runner BACK, one throw max, no pump fakes, thrower fills vacated base. Two-runner: lead runner first. Force removed = tag play." |
| DP_POSITIONING_MAP | "DP POSITIONING: DP depth only with <2 outs and force at 2nd. Never DP depth with 2 outs. Infield in only with R3 and <2 outs. Loaded = force at every base including home." |
| HIT_RUN_MAP | "HIT-AND-RUN: Batter MUST swing. Coverage depends on batter handedness (LHH=SS, RHH=2B). Batter missing sign = runner hung out. Pitchout counters the hit-and-run." |
| PICKOFF_MAP | "PICKOFF: Legal step requirement for RHP (step toward base + throw). LHP can throw to 1B freely. Fake-3B/throw-1B is a balk since 2013. Daylight play: fielder breaks first." |
| PITCH_CLOCK_MAP | "PITCH CLOCK: 15 sec empty, 20 sec runners. Pitcher violation = ball, batter violation = strike. 2 disengagements per batter — 3rd = balk unless pickoff succeeds." |
| WP_PB_MAP | "WILD PITCH/PASSED BALL: Catcher goes to ball first (never look at runner first). Pitcher sprints home immediately. 3B backs up home with R3. 2-out variant same assignments." |
| SQUEEZE_MAP | "SQUEEZE: Safety=on contact, suicide=on first move. Never suicide with 2 strikes (foul=K + runner dead). Pitcher defends with high-tight pitch. Pop-up on squeeze = double play." |
| INFIELD_FLY_MAP | "IFF: <2 outs, runners 1st+2nd or loaded, fair fly with ordinary effort. Batter automatically out. Runners NOT forced. Ball drifts foul = cancelled. No IFF on line drives or bunts." |
| OF_COMMUNICATION_MAP | "OF COMMUNICATION: CF priority correct. Gap ball caller is correct fielder. Foul territory: OF has priority over infielder. No no-call fly ball. Two-OF convergence: first caller owns it." |
| POPUP_PRIORITY_MAP | "POP-UP PRIORITY: CF priority over all on balls he can reach. Catcher priority within 30 feet — turns back to field. OF priority over IF in foul territory. First caller owns it." |
| OBSTRUCTION_INTERFERENCE_MAP | "OBSTRUCTION/INTERFERENCE: OBSTRUCTION = fielder impedes runner (fielder's fault). INTERFERENCE = runner/batter impedes fielder (runner's fault). Type A obstruction = dead ball immediately." |
| TAGUP_SACRIFICE_FLY_MAP | "TAG-UP: Runner leaves on THE CATCH (not before, not after). Early departure = appealable out. Sac fly with R3 is RE-positive. CF/LF throw home — correct cutoff used." |
| PITCHING_CHANGE_MAP | "PITCHING CHANGE: 2nd mound visit same inning = mandatory removal. 3-batter minimum rule applies. Inherited runners charged to original pitcher. 8 warm-up pitches." |
| INTENTIONAL_WALK_MAP | "IBB: 2023+ = signal only, no pitches. IBB always costs RE. Justified only with 1B open + weaker next hitter. Never with bases loaded. Forced runners advance one base only." |
| LEGAL_SHIFT_MAP | "SHIFT: 2023+ requires 2 infielders each side of 2B at pitch. 3 infielders one side = illegal. Outfield shifts still legal. Infield in still legal. Deep positioning legal." |

### How Maps Are Injected

```javascript
function getRelevantMaps(position) {
  // Returns concatenated text of all maps relevant to this position
  // CUTOFF_RELAY_MAP is in MAP_RELEVANCE for all positions (always included)
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

#### Baserunning Advancement Rates (FanGraphs/Statcast 2021-2024)

```javascript
baserunningRates: {
  first_to_third_on_single: 0.28,  // 28% of opportunities — league average
  first_to_third_elite: 0.45,      // Elite baserunner (top-10 sprint speed)
  first_to_third_slow: 0.15,       // Slow runner
  second_to_home_on_single: 0.62,  // 62% — most singles score this runner
  second_to_home_shallow: 0.30,    // Shallow single
  second_to_home_deep: 0.85,       // Deep single to gap/wall
  first_to_home_on_double: 0.52,   // 52% score — depends on OF arm/route
  tag_score_from_third: 0.88,      // 88% score on catchable OF fly ball
  tag_score_shallow: 0.45,         // Shallow fly — requires fast runner
  tag_advance_second_to_third: 0.55, // 55% advance on catchable fly
  run_on_contact_two_outs: 1.00,   // Always run on contact with 2 outs
}
```

#### Count Strikeout and Walk Rates (Baseball Reference 2021-2024)

Format: `countRates[count]` = `{k: K%, bb: BB%, fouls: foul%}` — per-pitch from this count.

| Count | K% | BB% | Foul% | Notes |
|-------|-----|-----|-------|-------|
| 0-0 | 4% | 0% | 14% | First pitch: almost no K/BB |
| 0-2 | 27% | 0% | 22% | Pitcher close to out |
| 1-2 | 26% | 0% | 22% | Must protect the zone |
| 2-2 | 20% | 0% | 22% | Toss-up |
| 3-0 | 2% | 48% | 6% | Almost always take — 48% walk |
| 3-1 | 5% | 29% | 12% | Hitter can be selective |
| 3-2 | 16% | 15% | 23% | Full count — anything can happen |

#### Steal Window Math (Statcast 2023-2024 post-pitch-clock)

```javascript
stealWindow: {
  deliveryTime: {quick: 1.20, average: 1.35, slow: 1.55, lefty_quick: 1.25, lefty_slow: 1.50},
  popTime: {elite: 1.85, average: 2.00, slow: 2.15},
  runnerTime: {elite: 3.30, average: 3.55, slow: 3.80},
  stealViability: {easy: 3.40, marginal: 3.25, tough: 3.10},
  pitchClockEffect: -0.20,  // Pitch clock shortened window by 0.2s
}
```

- Steal is viable if `deliveryTime + popTime > runnerTime - lead_advantage`
- Easy window (delivery+pop > 3.40s): 65%+ runners should go
- Marginal (3.25s): only elite runners (72%+ success needed)
- Tough (< 3.10s): even elite runners struggle

#### Pitch Count Fatigue Thresholds (FanGraphs, ABCA)

```javascript
pitchCountThresholds: {
  velocityDrop: {"0-50": 0, "51-75": 0.5, "76-90": 1.2, "91-100": 2.1, "100+": 3.0},
  eraIncrease: {"0-75": 0, "76-90": 0.50, "91-100": 1.20, "100+": 2.10},
  softLimit: 90, hardLimit: 110, youthLimit: 75,
  youthByAge: {"7-8": 50, "9-10": 75, "11-12": 85, "13-14": 95, "15-16": 95, "17-18": 105},
}
```

- 90 pitches: consider change (velocity down, TTO effect compounding)
- 110 pitches: rare to exceed — injury risk and performance cliff

#### Scoring Probability by Base/Out State (Tango "The Book")

Different from RE24 — answers "will THIS SPECIFIC RUNNER score?" rather than "how many total runs?"

| Base | 0 Outs | 1 Out | 2 Outs |
|------|--------|-------|--------|
| 1st | 40% | 27% | 13% |
| 2nd | 62% | 42% | 23% |
| 3rd | 85% | 67% | 28% |

Key insight: Runner on 3rd with <2 outs = HIGH probability. Justifies squeeze, sac fly, infield in, IBB.

#### First-Pitch Strike Run Value (FanGraphs RE24 research)

```javascript
firstPitchValue: {
  strikeValue: -0.048,  // First-pitch strike saves ~0.048 runs per PA
  ballCost: 0.051,      // First-pitch ball costs ~0.051 runs per PA
  eliteRate: 0.68,      // Elite pitchers: 68%+ first-pitch strikes
  averageRate: 0.59,    // MLB average: ~59%
  poorRate: 0.50,       // Below average
  afterFirstStrikeK: 0.24,  // 24% K rate after getting ahead 0-1
  afterFirstStrikeBB: 0.05, // Only 5% walk rate after 0-1
}
```

#### Pitch Type Effectiveness Data (Baseball Savant Statcast 2021-2024)

Run value per 100 pitches (rv/100): negative = better for pitcher. 8 pitch types with profiles (rv100, wOBA against, usage rate, velocity, best/worst counts). Sequencing rules (after fastball → changeup; after offspeed → four-seam; two-strike put-away order: sweeper→slider→changeup→splitter→cutter). Velocity bands (elite 97+ mph through soft <86 mph). Eye-level principle: batters hit .085 worse when next pitch changes vertical location 6+ inches.

```javascript
pitchTypeData: {
  types: {
    fourSeam: {name:"Four-Seam Fastball",rv100:0.2,woba:0.335,usage:0.34,velo:94.0,...},
    sinker:   {name:"Sinker / Two-Seam",rv100:0.0,woba:0.320,usage:0.19,velo:93.0,...},
    cutter:   {name:"Cutter",rv100:-0.9,woba:0.305,usage:0.10,velo:90.0,...},
    changeup: {name:"Changeup",rv100:-1.2,woba:0.295,usage:0.11,velo:85.0,tunnelsWith:"fourSeam",...},
    slider:   {name:"Slider",rv100:-1.4,woba:0.285,usage:0.17,velo:87.0,...},
    curveball:{name:"Curveball",rv100:-0.6,woba:0.305,usage:0.12,velo:79.0,tunnelsWith:"fourSeam",...},
    sweeper:  {name:"Sweeper",rv100:-1.6,woba:0.280,usage:0.09,velo:83.0,...},  // BEST in MLB
    splitter: {name:"Splitter",rv100:-1.1,woba:0.275,usage:0.03,velo:85.0,...},
  },
  sequencing: {afterFastball:{best:"changeup",second:"slider",avoid:"curveball"},
               afterOffspeed:{best:"fourSeam",second:"cutter",avoid:"changeup"},
               twoStrikePutaway:["sweeper","slider","changeup","splitter","cutter"],
               firstPitch:["fourSeam","sinker","cutter"],hittersCount:["cutter","sinker","fourSeam"]},
  eyeLevelPrinciple: {rule:"Change the eye level. After up, go down. After low, go up.",
                      data:"Batters hit .085 worse on pitch AFTER 6+ inch vertical change."},
}
```

#### Win Probability Framework (FanGraphs WPA / "The Book")

WP = probability batting team wins from this exact game state. Key insight: RE24 and WP diverge in late/close games — playing for 1 run costs RE24 but can increase WP. Includes WP by inning/score differential (innings 1-9, -3 to +3), leverage index by inning (1.0 avg, 2.0+ extra innings), RE24/WP divergence rules (bunt/IBB/play-for-one-run conditions), and clutch hitting data (year-to-year r ≈ 0.08, not a real skill).

```javascript
winProbability: {
  byInningScore: {
    1:{"-3":0.33,...,"0":0.50,...,"+3":0.67},
    7:{"-3":0.11,...,"0":0.50,...,"+3":0.89},
    9:{"-3":0.04,...,"0":0.50,...,"+3":0.96},
  },
  leverageIndex: {byInning:{1:0.8,5:1.0,7:1.3,9:1.7,"10+":2.0},
                  closedMultiplier:1.5,leadMultiplier:1.2,bigDeficit:0.4},
  reDivergence: {buntJustified:{...},ibbJustified:{...},playForOneRun:{...}},
  clutch: {doesItExist:false,highLeverageHits:0.003,
           teachingPoint:"Best clutch approach = same approach as always."},
}
```

#### Defensive Positioning Tradeoffs (Statcast OAA 2021-2024, ABCA)

Infield depth: normal (74% GB conversion, 41% DP rate), DP depth (70% GB, 49% DP — +8%), infield in (58% GB, costs 0.5 runs/game net — only justified R3 <2 outs late/close). Line guarding: prevents 0.4 XBH/game but creates 8% more singles. Outfield depth: normal (76% gap), shallow (68% gap, 85% short flies), deep (84% gap). Outfield arm value: elite arm prevents ~12 extra bases/season. RF arm premium: prevents ~3x as many extra bases as LF arm. Historical shift data: shift saved ~1.3 runs/100 PA, banned 2023.

```javascript
defensivePositioning: {
  infieldDepth: {
    normalDepth:{groundBallConversionRate:0.74,doublePlayRate:0.41},
    dpDepth:{groundBallConversionRate:0.70,doublePlayRate:0.49,rangeReduction:0.15},
    infieldIn:{groundBallConversionRate:0.58,runsSavedPerGame:0.3,runsCostPerGame:0.8,
               netCostPerGame:-0.5,situationalCost:-0.12},
  },
  lineGuarding:{extraBasesPreventedPerGame:0.4,holeCreated:{singleRateIncrease:0.08,netRunEffect:-0.05}},
  outfieldDepth:{normal:{gapcoverageRate:0.76},shallowIn:{gapcoverageRate:0.68,shortFlyConversion:0.85},
                 deep:{gapcoverageRate:0.84,shortFlyConversion:0.62}},
  outfieldArm:{eliteArm:{extraBasesPrevented:12},weakArm:{extraBasesPrevented:-10},
               rfArmPremium:"RF arm prevents ~3x as many extra bases as LF arm"},
  historicalShift:{shiftRunValuePer100PA:-1.3,postBanEffect:"+.015 BA for pull hitters post-2023"},
}
```

### 4.2 BRAIN.concepts — Prerequisite Graph

36 concept tags that control scenario progression. Each has:
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
| `scoring-probability` | Scoring Probability by Base/Out | baserunning | tag-up | 11 | 2 |
| `pitch-count-mgmt` | Pitch Count & Pitcher Fatigue | pitching | count-leverage | 11 | 2 |
| `steal-window` | The Steal Window | baserunning | steal-breakeven | 11 | 3 |
| `first-pitch-value` | First-Pitch Strike Value | pitching | first-pitch-strike, count-leverage | 11 | 2 |
| `baserunning-rates` | Baserunning Advancement Rates | baserunning | tag-up, steal-breakeven | 11 | 2 |
| `pitch-type-value` | Pitch Type Run Values | pitching | pitch-sequencing | 13 | 3 |
| `eye-level-change` | Eye Level & Pitch Tunneling | pitching | pitch-sequencing | 13 | 3 |
| `win-probability` | Win Probability vs RE24 | strategy | bunt-re24, steal-breakeven | 13 | 3 |
| `infield-positioning` | Infield Depth Tradeoffs | defense | dp-positioning | 11 | 2 |
| `of-depth-arm-value` | Outfield Depth & Arm Value | defense | backup-duties | 11 | 2 |

**Prerequisite Chain Visualization:**

```
(no prereqs, age 6+)
├── force-vs-tag ──┬── cutoff-roles ──┬── bunt-defense ── squeeze-play
│                  │                  ├── first-third
│                  │                  └── relay-double-cut
│                  ├── double-play-turn ── dp-positioning ── infield-positioning
│                  └── infield-fly
├── fly-ball-priority ──┬── tag-up ──────────── scoring-probability
│                       │            └── baserunning-rates (also requires steal-breakeven)
│                       └── of-communication (also requires backup-duties)
├── first-pitch-strike ──┬── pickoff-mechanics
│                        └── count-leverage ──┬── two-strike-approach
│                                             ├── situational-hitting
│                                             ├── pitch-sequencing ──┬── pitch-type-value
│                                             │                     └── eye-level-change
│                                             ├── pitch-clock-strategy
│                                             ├── tto-effect
│                                             ├── pitch-count-mgmt
│                                             └── first-pitch-value (also requires first-pitch-strike)
(no prereqs, age 8+)
├── backup-duties ──┬── wild-pitch-coverage
│                   ├── of-communication (also requires fly-ball-priority)
│                   └── of-depth-arm-value
├── rundown-mechanics
(no prereqs, age 11+)
└── steal-breakeven ──┬── hit-and-run
                      ├── bunt-re24 ── win-probability (also requires steal-breakeven)
                      ├── steal-window
                      └── baserunning-rates (also requires tag-up)
```

### 4.3 BRAIN.coaching.situational — Template Coach Lines

33 situation-keyed lines with template variables (`{re24}`, `{count}`, `{ba}`, `{label}`, `{breakeven}`, `{delta}`, `{penalty}`, `{outs}`, `{prob}`, `{base}`, `{kRate}`, `{window}`, `{verdict}`, `{rate}`). Used by `getSmartCoachLine()` for Pro users — 40% chance of a data-driven line.

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
| `scoring-chance` | "Runner on {base}, {outs} out — {prob}% chance of scoring. Make contact count!" | Runner on 3rd, < 2 outs |
| `pitch-count` | "Approaching {count} pitches — velocity and command both start to fade here." | (available) |
| `two-strike-danger` | "{count} count: pitcher has a {kRate}% strikeout chance. Fight for your life at the plate!" | Count 0-2 or 1-2 |
| `steal-window` | "Delivery + pop time = {window}s. The steal window is {verdict}." | (available) |
| `tag-up-math` | "Tag from 3rd — {prob}% of MLB runners score on a catchable fly ball. Leave on the catch!" | (available) |
| `advance-rate` | "MLB runners score from 2nd on a single {rate}% of the time. Go on a base hit!" | (available) |
| `first-pitch-value` | "First-pitch strikes save ~0.05 runs per batter. At 68%, elite pitchers own this." | Pitcher/manager, early inning |
| `three-oh-take` | "3-0: 48% chance of a walk on the next pitch. Take the pitch unless you get the green light." | Count = 3-0 |

**Selection Priority** (in `getSmartCoachLine`):
1. Streak lines take priority (streak ≥ 3)
2. Then 40% chance of situational brain line, evaluated in this order:
   - bases-loaded → high-leverage → hitters-count → pitchers-count → full-count → high-re24 → risp → scoring-chance → two-strike-danger → three-oh-take → late-close → two-outs → nobody-out → first-pitch-value (pitcher/mgr) → first-inning
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

### `getPitchRecommendation(count: string, lastPitch: string|null, outs: number, runners: number[]) → object`
Returns data-backed best pitch for a given situation using pitchTypeData sequencing rules.
- Evaluates: first pitch → two-strike → hitter's count → sequencing (after fastball vs offspeed)
- Returns: `{pitch: string, name: string, rv100: number, woba: number, reasoning: string, eyeLevel: string}`
- Example: `getPitchRecommendation("0-2", "fourSeam")` → `{pitch: "sweeper", name: "Sweeper (Wide Slider)", rv100: -1.6, ...}`

### `getWinContext(inning: string|number, scoreDiff: number, runners: number[], outs: number) → object`
Returns win probability, leverage index, and strategy mode for a game state.
- Strategy modes: `"run-expectancy"` (innings 1-5), `"transitional"` (6), `"win-probability"` (7-9 close), `"standard"` (blowout)
- Returns: `{wp: number, wpPct: number, li: number, strategyMode: string, isLateClose: boolean, isHighLeverage: boolean, recommendation: string}`
- Example: `getWinContext("Bot 9", 0)` → `{wp: 0.50, wpPct: 50, li: 2.55, strategyMode: "win-probability", isLateClose: true, ...}`

### `evaluateDefensiveAlignment(situation: object, proposedAlignment: string) → object`
Evaluates whether a defensive alignment is justified with data context.
- Alignments: `"infieldIn"` (R3, <2 outs, late/close), `"guardLines"` (late/close, leading), `"dpDepth"` (R1, <2 outs)
- Returns: `{justified: boolean, cost: number|null, explanation: string}`
- Example: `evaluateDefensiveAlignment({runners:[3],outs:1,inning:8,score:[3,3]}, "infieldIn")` → `{justified: true, ...}`

### `enrichFeedback(scenario, choiceIdx, situation) → object[]`
Generates insight items for the outcome screen (max 3).
- RE24 insight if runners on base and re24 > 0.5
- Count insight if count data available
- Pressure insight if pressure ≥ 50
- Bunt insight if concept mentions "bunt"
- Steal insight if concept mentions "steal"
- Scoring probability by base/out
- Two-strike K rate for 0-2/1-2 counts
- Pitch count fatigue context
- Baserunning advance decision
- Pitch sequencing/type insight (pitcher scenarios)
- Win probability insight (late/close games, LI ≥ 2.0)
- Defensive positioning insight (infield depth scenarios)
- Returns: `[{icon: string, text: string}, ...]`

### `getSmartCoachLine(cat, situation, position, streak, isPro) → string`
Situation-aware coach line for Pro users. Falls back to `getCoachLine()`.
- Priority: streak lines → 40% chance brain line → generic line
- See Section 4.3 for selection priority

### `formatBrainStats(position: string) → string`
Generates position-filtered stats string for the AI prompt.
- Everyone gets: RE24 key states, scoring probability, fly ball priority, force play rule
- pitcher/batter/catcher/counts: + count leverage data, count K/BB rates
- baserunner/manager/batter: + steal break-even, baserunning advancement rates, steal window
- pitcher/manager: + TTO effect, pickoff, pitch count fatigue, first-pitch strike value
- pitcher/counts/manager: + pitch type run values, sequencing rules, eye level rule
- manager/pitcher: + win probability vs RE24, leverage index, bunt/IBB WP justification, clutch data
- firstBase/secondBase/shortstop/thirdBase/manager: + defensive positioning run values
- leftField/centerField/rightField/manager: + outfield depth tradeoffs, arm value
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

### 8.4 Facts (35 lines)

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
"Brain stat: Runners on 3rd with less than 2 outs score 67-85% of the time!"
"Brain stat: A runner on 2nd scores only 23% of the time with 2 outs — need a base HIT!"
"Brain stat: MLB runners score from 2nd on a single 62% of the time. Run on contact!"
"Brain stat: First-pitch strikes save pitchers about 0.05 runs per batter faced!"
"Brain stat: Elite pitchers throw first-pitch strikes 68% of the time. Average is 59%!"
"Brain stat: On 0-2, the pitcher has a 27% strikeout rate on the very next pitch!"
"Brain stat: 3-0 count — 48% of the time the pitcher throws ball 4. Take the pitch!"
"Brain stat: The 2023 pitch clock shortened the steal window by 0.2 seconds — steals are harder!"
"Brain stat: After 90 pitches, a starter's ERA equivalent rises by over 1 run per game!"
"Fun fact: A runner needs about 3.3 seconds to steal 2nd. Elite catchers give them only 3.2!"
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
| scoringProb 3rd/0out | 0.85 (85%) | "85% chance of scoring" (fact) | formatBrainStats (everyone) |
| scoringProb 2nd/2out | 0.23 (23%) | "only 23% with 2 outs" (fact) | formatBrainStats (everyone) |
| baserunningRates 2nd→home | 62% | "score from 2nd 62%" (fact) | formatBrainStats (BR/MGR) |
| firstPitchValue.strikeValue | -0.048 | "0.05 runs per batter" (fact) | formatBrainStats (pitcher) |
| firstPitchValue.eliteRate | 68% | "68% first-pitch strikes" (fact) | formatBrainStats (pitcher) |
| countRates["0-2"].k | 27% | "27% K rate on 0-2" (fact) | formatBrainStats (counts) |
| countRates["3-0"].bb | 48% | "48% walk rate on 3-0" (fact) | formatBrainStats (counts) |
| pitchCountThresholds.softLimit | 90 | "after 90 pitches" (fact) | formatBrainStats (pitcher/MGR) |
| stealWindow.pitchClockEffect | -0.20s | "pitch clock shortened window" (fact) | formatBrainStats (BR/MGR) |
| pitchTypeData sweeper rv100 | -1.6 | "Sweeper (-1.6)" (enrichFeedback) | formatBrainStats (pitcher/counts/MGR) |
| pitchTypeData slider rv100 | -1.4 | "Slider (-1.4)" (enrichFeedback) | formatBrainStats (pitcher/counts/MGR) |
| pitchTypeData changeup rv100 | -1.2 | "Changeup (-1.2)" (enrichFeedback) | formatBrainStats (pitcher/counts/MGR) |
| eyeLevelPrinciple | .085 BA worse | — | formatBrainStats (pitcher/counts/MGR) |
| winProbability tied 9th | 0.50 (50%) | "50% WP" (enrichFeedback) | formatBrainStats (MGR/pitcher) |
| winProbability down 1 8th | 0.27 (27%) | "27% WP" | formatBrainStats (MGR/pitcher) |
| leverageIndex inn 9 | 1.7 | "LI 1.7x" (enrichFeedback) | formatBrainStats (MGR/pitcher) |
| clutch year-to-year r | ~0.08 | — | formatBrainStats (MGR/pitcher) |
| defensivePositioning normalDepth GB | 74% | "74% GB conversion" | formatBrainStats (IF/MGR) |
| defensivePositioning dpDepth DP rate | 49% | "49% DP rate (+8%)" | formatBrainStats (IF/MGR) |
| defensivePositioning infieldIn GB | 58% | "58% GB (-16%)" (enrichFeedback) | formatBrainStats (IF/MGR) |
| outfieldArm eliteArm | 12 extra bases prevented | "12 extra bases/season" | formatBrainStats (OF/MGR) |

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
