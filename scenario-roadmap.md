# Baseball Strategy Master — Scenario Roadmap

## Scenario Audit Results (394 scenarios, Feb 2026)

### Summary
~95% of scenarios are excellent teaching material. The following fixes were applied:

| Grade | Positions |
|-------|-----------|
| **A** | famous (10), counts (8), rules (8), shortstop (16), centerField (16) |
| **A-** | pitcher (59), batter (58), baserunner (57), manager (58), catcher (30), secondBase (15), thirdBase (15) |
| **B+** | leftField (15), firstBase (14), rightField (15) |

### Fixes Applied

**Tier 1 — Critical (5 fixes)**
- `r54`: Added 4th option (was only 3, breaking UI alignment)
- `p53`: Removed "double play" claim (impossible with 2 outs)
- `f21`: Changed "tags the runner" to "steps on home plate for the force out" (bases loaded = force, not tag)
- `ct7`: Changed description so squeeze defense call happens BEFORE the pitch (can't instruct mid-delivery)
- `2b4`: Changed relay default to home plate (was third base, contradicted standard coaching)

**Tier 2 — Significant (6 fixes)**
- `b4`: Removed coaching conflict with b40 (no longer says "coach says take" then teaches to swing)
- `p54`: Changed score from 5-4 to 4-4 (tied), added batting averages to justify platoon walk
- `f17`: Changed score from 5-3 to 5-4 (1-run lead makes throw-home clearly correct)
- `m1`: Changed on-deck hitter from ".245 (35 HRs)" to ".220 (8 HRs)" (makes IBB clearly right)
- `b8`: Narrowed rates from 80/40 to 70/60, added nuance to explanation
- `f43`: Renamed to `m58` (was using fielder prefix in manager array)

**Tier 3 — Inconsistencies (5 fixes)**
- `b16`/`b51`: Narrowed "take first pitch" rates from 85/50 to 75/60, added "patient but ready" nuance
- `ss5`: Changed relay default to home plate (same fix as 2b4)
- `lf7`: Raised glove-shield rate from 45 to 70 (consistent with f9/f55 teaching)
- `ct4`/`ct17`: Added context differentiation (borderline = subtle pull, high-leverage = stillness)
- `r53-r57`/`rl1,4,7`: Verified — both teach different angles (runner vs rule perspective), no changes needed

**Tier 4 — Minor (10 fixes)**
- `cf3`/`rf1`: Changed anim from `throwHome` to `catch` (answer is throw to third, not home)
- `ct9`: Changed description from "1 out" to "2 outs" (matches situation object after strikeout)
- `fp2`: Clarified force play reasoning in last option
- `rl6`: Changed "American League team" to "your team" (DH universal since 2022)
- `m44`: Added "In leagues where pitchers still bat" qualifier
- `1b6`: Emphasized force-removed = tag play rule
- `3b1`: Raised lead runner option rate from 30 to 45
- `b39`: Added safety note for high-and-inside squeeze bunt
- `f47`: Changed "No double play available" to "No conventional double play"

---

## Scenario Quality Checklist (For All Future Scenarios)

Every scenario — handcrafted or AI-generated — must pass ALL of these checks:

### Baseball Accuracy
- [ ] Game situation is possible (innings, outs, count, runners, score all make sense together)
- [ ] All 4 options are actions a player at THAT position could physically perform in that moment
- [ ] The best answer is what a knowledgeable baseball coach would teach
- [ ] No option requires a physically impossible action (e.g., changing a pitch mid-delivery)
- [ ] Success rates reflect real baseball outcomes (best option 80-90, alternatives 40-60/25-40/5-25)
- [ ] Explanations cite correct rules — force vs. tag, when plays apply, who has priority
- [ ] Statistics cited are approximately correct (no made-up percentages)

### Educational Quality
- [ ] The "why" is explained, not just the "what"
- [ ] Wrong-answer explanations teach something — they explain WHY it's suboptimal
- [ ] No contradictions with other scenarios in the same position
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
- [ ] Taking vs. swinging: frame as situational, not absolute. Never say "always take" or "always swing"
- [ ] Sun defense: glove technique is primary, sunglasses are supplementary
- [ ] Framing: context-dependent (borderline = subtle pull, high-leverage = stillness)

---

## Overview
Target: 40-50 scenarios per position, 200-250 total in the shared bank
Current: 394 handcrafted across 15 categories
Each batch: Generate 10 at a time, review for accuracy, then move to next batch

---

## PITCHER (Target: 45 scenarios)

### Batch 1 — Pitch Selection by Count (10 scenarios)
Difficulty 1:
1. First pitch to a leadoff hitter — throw a strike or nibble the corners?
2. 0-2 count — waste a pitch or go for the strikeout?
3. 3-1 count — what pitch to throw when you have to throw a strike?

Difficulty 2:
4. 1-1 count against a power hitter — fastball or offspeed?
5. 2-2 count with a runner on third — pitch to contact or go for the K?
6. 0-1 count — expand the zone or stay in the zone?
7. Behind 2-0 to the 8th hitter — groove it or work the corners?

Difficulty 3:
8. Full count, bases loaded, two outs in a tie game — your best pitch or their worst pitch?
9. 3-2 count, runner stealing on the pitch — fastball for strike or slider hoping he chases?
10. 0-2 to a known fastball hitter — waste a breaking ball or challenge with heat?

### Batch 2 — Pitching With Runners On Base (10 scenarios)
Difficulty 1:
1. Runner on first, nobody out — focus on the batter or worry about the runner?
2. Pitch from the stretch vs the windup — when do you switch?
3. Runner on second, nobody out — do you pitch differently knowing a single scores him?

Difficulty 2:
4. Fast runner on first, 1-1 count — quick to the plate or forget the runner?
5. Runners on first and third, one out — pitch for a ground ball double play?
6. Runner on second in scoring position — pitching carefully or attacking the zone?
7. Slide step vs full delivery with a runner on first — when does it matter?

Difficulty 3:
8. Runner on third, less than 2 outs, infield in — pitch for strikeout, fly ball, or ground ball?
9. Pickoff attempt — runner has a big lead, but the hitter is 0-2. What do you do?
10. Bases loaded, one out, tie game — pitch to the batter or intentionally walk to set up force at any base?

### Batch 3 — Game Situation Pitching (10 scenarios)
Difficulty 1:
1. You have a 5-run lead in the 6th — pitch aggressively or carefully?
2. First inning, first batter — how do you approach the game's opening at-bat?
3. Your team just scored 3 runs — how does a big lead change your approach?

Difficulty 2:
4. Tie game, 7th inning, you've thrown 85 pitches — conserve energy or keep attacking?
5. Facing the same batter for the 3rd time in a game — adjust your sequence or stick with what worked?
6. The batter before this one hit a home run — how do you reset mentally and approach the next hitter?
7. You just walked two batters — what's your adjustment?

Difficulty 3:
8. Top of the order coming up in the 8th, one-run lead — pitch to them or ask to be pulled?
9. Your fastball isn't working today — how do you adjust your game plan mid-game?
10. Cold weather game, your breaking ball isn't biting — adapt or keep throwing it?

### Batch 4 — Holding Runners & Pickoffs (8 scenarios)
Difficulty 1:
1. Runner on first with a big lead — throw a pickoff or ignore him?
2. Known base stealer on first — how do you adjust your timing?

Difficulty 2:
3. Runner on second is taking a big secondary lead — step off or pitch?
4. Two pickoff throws already, runner is still taking a big lead — try again or focus on the batter?
5. Runner on first, lefty pitcher advantage — how to use it?

Difficulty 3:
6. Runner on first fakes going, trying to distract you — how do you stay composed?
7. Pitch out call from the catcher — when does it make sense to agree?
8. Daylight play at second — the shortstop flashes, do you throw?

### Batch 5 — Intentional Walks & Pitching Around (7 scenarios)
Difficulty 2:
1. Their best hitter is up with first base open — walk him to face a weaker hitter?
2. Runner on second, two outs, first base open — walk the hitter to set up force at any base?
3. Facing a lefty when the next batter is a righty — walk the lefty for a better matchup?

Difficulty 3:
4. Their cleanup hitter is 3-for-3 against you today — walk him even though it loads the bases?
5. 8th inning, one-run lead, first base open — walk the tying run into scoring position?
6. Two outs, runners on second and third — walk the batter to load the bases and set up a force?
7. Intentional walk backfires when the next hitter is a surprise pinch hitter — how do you adjust?

---

## BATTER (Target: 45 scenarios)

### Batch 1 — Situational Hitting (10 scenarios)
Difficulty 1:
1. Runner on third, less than 2 outs — what kind of contact do you want to make?
2. Runner on second, nobody out — hit to the right side to advance the runner?
3. Bases empty, you're leading off — what's your approach at the plate?

Difficulty 2:
4. Runner on third, one out, infield playing in — ground ball scores him, but fly ball does too. What's the approach?
5. Runners on first and third, one out — hit and run or swing away?
6. Down by one, runner on second, two outs — just get a hit or look for something specific?
7. Tie game, runner on second, nobody out — bunt him to third or try to drive him in?

Difficulty 3:
8. Runner on third, one out, team down by one in the 9th — deep fly ball ties it, hit ties it. Approach?
9. Bases loaded, nobody out — swing for the fences or just put the ball in play?
10. Runner on first, nobody out, pitcher is wild — take pitches to let the runner steal second?

### Batch 2 — Count Management (10 scenarios)
Difficulty 1:
1. The count is 3-0 — do you swing at the next pitch?
2. You're behind 0-2 — how does your approach change?
3. The count is 2-0 — you're ahead. What are you looking for?

Difficulty 2:
4. First pitch of the at-bat — swing or take to see what the pitcher has?
5. Count is 1-0 after a ball that just missed — get aggressive or stay patient?
6. 3-1 count, runner on first — your pitch to hit, but a ground ball could be a double play?
7. 2-2 count — protect the zone or still be selective?

Difficulty 3:
8. Full count, two outs, runners in scoring position — foul off tough pitches to stay alive?
9. 3-0 with a runner on third and one out — take or swing? Coach's green light vs your judgment.
10. 0-2 and the pitcher keeps throwing the same offspeed pitch — sit on it or react?

### Batch 3 — Bunting Decisions (8 scenarios)
Difficulty 1:
1. Runner on first, nobody out, you're the 9-hole hitter — bunt him over?
2. Runner on second, nobody out — sacrifice bunt to move him to third?

Difficulty 2:
3. You're a fast runner and the third baseman is playing deep — bunt for a hit?
4. Runner on first, nobody out, but you're a good hitter — sacrifice or swing away?
5. Squeeze play with runner on third, one out — when does the coach call this?

Difficulty 3:
6. Suicide squeeze called — the pitch is high and inside. What do you do?
7. Runner on second, nobody out, but you're the 3-hole hitter with power — bunt or drive him in?
8. Fake bunt to pull the infield in, then slash — when is this smart?

### Batch 4 — Two-Strike Approach (8 scenarios)
Difficulty 1:
1. Two strikes — do you change your swing or keep swinging the same way?
2. Two strikes with runners on — protect the plate or still be selective?

Difficulty 2:
3. Two strikes and the pitcher has been throwing breaking balls — what do you look for?
4. Choking up on the bat with two strikes — why and when?
5. Two strikes and you keep fouling off pitches — how long can you battle?
6. The pitcher's been nibbling the corners all day and you have two strikes — expand your zone?

Difficulty 3:
7. Two strikes, runner on third, less than two outs — put the ball in play at all costs or still wait for your pitch?
8. Two strikes and you're pretty sure a curveball is coming — sit on it or stay reactionary?

### Batch 5 — Hitting Strategy by Game Situation (9 scenarios)
Difficulty 1:
1. Your team is winning big — still try hard or just have fun?
2. First at-bat against a new pitcher — take pitches to see his stuff?

Difficulty 2:
3. You're in a slump, 0 for your last 10 — what do you adjust?
4. The pitcher just hit your teammate — how do you stay focused at the plate?
5. Cold weather, the ball isn't carrying — adjust your approach from power to contact?
6. You notice the pitcher tips his curveball — how do you use this without being obvious?

Difficulty 3:
7. Bases loaded, no outs, you're the cleanup hitter — everyone expects a grand slam. What's the smart approach?
8. You're the go-ahead run in the 9th — the pitcher is clearly nervous. How do you exploit this?
9. Late in the game, you've seen this pitcher 3 times — what adjustments have you made?

---

## BASERUNNER (Target: 45 scenarios)

### Batch 1 — Steal Decisions (10 scenarios)
Difficulty 1:
1. You're on first with a big lead — the pitcher is slow to the plate. Steal second?
2. You're fast and on first — but the catcher has a great arm. Do you still go?
3. You're on second — is stealing third ever a good idea?

Difficulty 2:
4. Runner on first, 3-1 count — the pitcher has to throw a strike. Good time to steal?
5. Down by 3 runs in the 7th — steal to get in scoring position or play it safe?
6. You're on first, left-handed pitcher — how does this change your steal approach?
7. Delayed steal — the catcher lobs the ball back to the pitcher lazily. React?

Difficulty 3:
8. Runner on first, two outs, your best hitter is at the plate — risk a steal or let him hit?
9. Double steal with runners on first and third — how does this work?
10. You're on second, the pitcher keeps looking at you — he's going to try a pickoff. How do you read it?

### Batch 2 — Tagging Up (10 scenarios)
Difficulty 1:
1. You're on third, fly ball to deep center field — tag up and score?
2. You're on third, shallow fly ball to left — too risky to tag?
3. You're on second, deep fly ball to right — advance to third on the catch?

Difficulty 2:
4. You're on third, medium-depth fly ball — the outfielder has a strong arm. Go or stay?
5. Line drive to the outfielder — you went halfway. Now what?
6. You're on second, fly ball to center — advance to third or stay put? It depends on the outfielder's arm.
7. Sacrifice fly — you're on third with one out. How do you time your departure?

Difficulty 3:
8. You're on third, fly ball to shallow right — the right fielder is charging in. His throw will be weak but he's close.
9. Two runners tagging — you're on third, teammate is on second. Both go?
10. You're on third, foul ball caught near the dugout — is it deep enough to tag?

### Batch 3 — Reading the Ball Off the Bat (10 scenarios)
Difficulty 1:
1. Ground ball to the left side — you're on first. Go to second?
2. Line drive right at the shortstop — you took off. Get back to first!
3. Fly ball to the outfield — you're on first. Go halfway and watch.

Difficulty 2:
4. Ground ball to the right side — you're on second. Do you advance to third?
5. Ball hit to the gap in right-center — you're on first. Can you make it to third?
6. Chopper over the pitcher's head — you're on second. Score or hold at third?
7. Sharp ground ball to third — you're on second. The third baseman is close to the bag.

Difficulty 3:
8. Slow roller to the right side — you're on third with one out. Go on contact was the call, but the ball is right at the first baseman.
9. Blooper to shallow center — you're on first. The center fielder and shortstop are both going for it. If it drops, you score. If caught, you're doubled off.
10. Hard one-hop back to the pitcher — you're on third. He fakes home and throws to third.

### Batch 4 — Advancing & Game Situations (10 scenarios)
Difficulty 1:
1. Wild pitch — you're on second. Advance to third?
2. Passed ball — you're on third. Sprint home?
3. Ball gets away from the first baseman — you're on first. Go to second?

Difficulty 2:
4. The throw from the outfield goes to the wrong base — you're between bases. Keep going or go back?
5. Hit and run is called — the batter swings and misses. You're running. Now what?
6. First to third on a single — when can you take the extra base?
7. Overthrow to first on a ground ball — how far do you go?

Difficulty 3:
8. You're on second, ground ball to short, runner on first is out at second — do you try for third during the double play?
9. Balk is called — do you always get a free base? What do you do?
10. Rundown — you're caught between bases. How do you make the defense make as many throws as possible?

### Batch 5 — Special Situations (5 scenarios)
Difficulty 2:
1. Infield fly rule is called — what do you do as a runner?
2. Ground rule double — where do you end up from first base?

Difficulty 3:
3. Obstruction by the fielder — the third baseman is in your way without the ball. What happens?
4. Appeal play — you missed touching second base. Can the defense get you out?
5. Force play removed — runner ahead of you is out. Are you still forced?

---

## FIELDER (Target: 50 scenarios)

### Batch 1 — Infield: Throwing to the Right Base (10 scenarios)
Difficulty 1:
1. Ground ball to you at short, runner on first, less than 2 outs — where do you throw?
2. Ground ball to second base, bases empty — routine throw to first?
3. Runner on second, ground ball to third — throw to first or check the runner?

Difficulty 2:
4. Runners on first and second, ground ball to short — start the double play or go to third?
5. Bases loaded, ground ball to you — throw home for the force or start the double play?
6. Runner on third, less than 2 outs, ground ball to short — check the runner or throw to first?
7. Slow roller to third — do you have time to throw to first or eat the ball?

Difficulty 3:
8. Runner on first, ground ball up the middle — flip to second to start the DP, but the runner is fast. Can you turn two?
9. Bases loaded, one out, hard ground ball to you — 1-2-3 double play or throw home first?
10. Bunt with runners on first and second — fielder's choice. Who's the easiest out?

### Batch 2 — Infield: Positioning & Depth (8 scenarios)
Difficulty 1:
1. Runner on third, less than 2 outs — play in to cut off the run or play back for range?
2. Double play depth — where do you stand vs normal depth?

Difficulty 2:
3. Late in a close game, fast runner at the plate — shade toward the hole or play straight up?
4. Bunt situation — where should the first and third basemen move?
5. Left-handed pull hitter at the plate — shift or play straight up?
6. Runner on second, nobody out — play at double play depth even without a runner on first?

Difficulty 3:
7. Their fastest runner is on third, one out — in or back? The batter is a power hitter.
8. No outs, runner on first, known bunter — crash in or hold your position?

### Batch 3 — Outfield: Throwing & Cutoffs (10 scenarios)
Difficulty 1:
1. Single to left field, runner on second — hit the cutoff man or throw straight home?
2. Fly ball caught in center, runner on third tagging — throw home or to the cutoff?
3. Ball hit to the gap — who backs up the throw?

Difficulty 2:
4. Runner rounding second hard on a single — throw to third or hold the ball?
5. Extra base hit to the gap — throw to second, third, or relay through the cutoff?
6. Runner trying to score from first on a double — long relay throw. Where do you aim?
7. You're in right field and the ball gets past the center fielder — back up or go to a cutoff position?

Difficulty 3:
8. Runner on first, base hit to right — the first base coach is waving him to third. Cut it off or let the throw go through?
9. Ball off the wall — play it quickly off the carom or wait for it to settle?
10. Two runners going — one scoring, one trying for third. Which throw do you make?

### Batch 4 — Outfield: Fly Ball Decisions (8 scenarios)
Difficulty 1:
1. Fly ball hit right to you — catch it normally or basket catch?
2. Ball hit between you and another outfielder — who calls it?

Difficulty 2:
3. Ball hit deep toward the warning track — sprint back or angle your route?
4. Line drive sinking in front of you — dive for it or play it on a hop?
5. Fly ball in the sun — how do you find it?
6. Ball hit to the gap, you and the other outfielder are both close — communication?

Difficulty 3:
7. Wind is blowing out hard — how does this change your starting depth?
8. Ball hit to the wall, you can catch it but will crash into the fence — make the play or play it safe?

### Batch 5 — Catcher: Game Management (10 scenarios)
Difficulty 1:
1. Runner on first, your pitcher is ignoring him — call a pitchout or pickoff?
2. Ball in the dirt with a runner on third — block it or try to catch it?
3. Pop fly near the backstop — whose ball is it?

Difficulty 2:
4. The opposing batter keeps fouling off pitches — change the pitch sequence?
5. Your pitcher is losing control, walking batters — what do you say in a mound visit?
6. Runner on third, wild pitch — how do you recover and make a play?
7. Passed ball vs wild pitch — what's the difference and how do you prevent them?

Difficulty 3:
8. You notice the batter peeks at your signs — how do you adjust?
9. Runner on second can see your signs — switch to a more complex sign system?
10. Your pitcher wants to throw a fastball but you see the batter sitting on it — stick with your call or change?

### Batch 6 — Communication & Teamwork (4 scenarios)
Difficulty 2:
1. Popup between the pitcher, catcher, and first baseman — who calls it?
2. Rundown situation — how many throws should it take? What's your role?

Difficulty 3:
3. Relay throw from deep center — where do you position as the cutoff man?
4. Bunt defense with runners on first and second — who covers what?

---

## MANAGER (Target: 45 scenarios)

### Batch 1 — Pitching Changes (10 scenarios)
Difficulty 1:
1. Your starter has thrown 90 pitches and is getting tired — pull him or let him finish the inning?
2. Your pitcher just gave up back-to-back hits — go to the bullpen?
3. Your starter is throwing a shutout but has 100+ pitches — leave him in?

Difficulty 2:
4. Your pitcher is doing well but a tough lefty is coming up — bring in the lefty specialist?
5. Your reliever just got the last out of the 7th — does he come back for the 8th?
6. Bases loaded, one out, your pitcher is struggling — pull him mid-inning or let him work out of it?
7. Your closer has pitched 2 days in a row — use him again in a save situation?

Difficulty 3:
8. Your starter has a no-hitter through 6 but has thrown 105 pitches — how long do you ride it?
9. Your best reliever is available but it's only the 6th inning — save him for later or use him now?
10. Lefty-righty matchup — their best hitter is a switch hitter. Does the platoon advantage still apply?

### Batch 2 — Offensive Strategy Calls (10 scenarios)
Difficulty 1:
1. Runner on first, nobody out, weak hitter up — bunt or swing away?
2. Down by 1 in the 9th, leadoff runner on — sacrifice bunt or let the hitter swing?
3. Bases loaded, nobody out — squeeze play or let him hit?

Difficulty 2:
4. Runner on first, your fastest player — steal or hit and run?
5. Down by 3, runner on first — steal to get in position or play for a big inning?
6. Hit and run called, batter swings and misses — was it the right call?
7. Your 3-hole hitter is in a 0-for-15 slump — drop him in the order?

Difficulty 3:
8. One run game, bottom 8th, runner on second with nobody out — bunt to third or try to drive him in?
9. Intentional walk to load the bases with one out to set up a force/DP — when is this smart?
10. You have 2 pinch hitters left, it's the 7th inning — use one now or save them for the 9th?

### Batch 3 — Defensive Strategy (8 scenarios)
Difficulty 1:
1. Winning by 1 in the 9th — bring in your best defensive outfielder?
2. Opposing team has a fast runner — tell your catcher to be ready for a steal?

Difficulty 2:
3. Opposing batter is a known pull hitter — call for a shift?
4. Runner on second, close game — tell your middle infielders to move to hold the runner?
5. Bunt situation — call the wheel play or standard bunt defense?
6. Infield in or back with a runner on third? Depends on the score and outs.

Difficulty 3:
7. Opposing team down by 2 in the 9th, runner on first, power hitter up — play for the DP or guard the lines?
8. Your outfielders are getting tired — defensive replacement or save your bench?

### Batch 4 — Lineup Construction (8 scenarios)
Difficulty 1:
1. Building a starting lineup — what does each spot in the order mean?
2. Your fastest player — where does he bat? Leadoff?

Difficulty 2:
3. Your best hitter vs your best power hitter — who bats 3rd and who bats 4th?
4. Pitcher is batting — 8th or 9th in the order? (NL rules)
5. Platoon advantage — start the lefty or righty based on the opposing pitcher?
6. A player is hot, hitting .400 this week — move him up in the order?

Difficulty 3:
7. Sabermetrics suggest your best hitter should bat 2nd, not 3rd — do you go against tradition?
8. Your lineup has too many lefties and they're facing a tough lefty pitcher — rearrange or ride with it?

### Batch 5 — Game Management (9 scenarios)
Difficulty 1:
1. Rain delay — your pitcher was dealing. Can he come back after a 45-minute delay?
2. You're losing 8-0 in the 5th — when do you start resting starters for tomorrow?

Difficulty 2:
3. Extra innings — how do you manage your bullpen when the game could go 12+?
4. Your team committed 3 errors — how do you keep morale up?
5. The other team is stealing signs — what do you do?
6. Bench-clearing situation — how does a manager handle conflict?
7. Late game, tie score — do you play for one run or a big inning?

Difficulty 3:
8. Day game after a night game — rest your regulars or play to win?
9. Final series of the season, your team is fighting for playoffs — use your ace on short rest?

---

## GENERATION SCHEDULE

### Week 1
- [ ] Pitcher Batch 1 (Pitch Selection by Count) — 10 scenarios
- [ ] Pitcher Batch 2 (Pitching With Runners) — 10 scenarios
- [ ] Batter Batch 1 (Situational Hitting) — 10 scenarios

### Week 2
- [ ] Batter Batch 2 (Count Management) — 10 scenarios
- [ ] Baserunner Batch 1 (Steal Decisions) — 10 scenarios
- [ ] Baserunner Batch 2 (Tagging Up) — 10 scenarios

### Week 3
- [ ] Fielder Batch 1 (Throwing to Right Base) — 10 scenarios
- [ ] Fielder Batch 3 (Outfield Throwing & Cutoffs) — 10 scenarios
- [ ] Fielder Batch 5 (Catcher Game Management) — 10 scenarios

### Week 4
- [ ] Manager Batch 1 (Pitching Changes) — 10 scenarios
- [ ] Manager Batch 2 (Offensive Strategy) — 10 scenarios
- [ ] Manager Batch 3 (Defensive Strategy) — 8 scenarios

### Week 5 (Fill remaining gaps)
- [ ] Pitcher Batches 3-5
- [ ] Batter Batches 3-5
- [ ] Baserunner Batches 3-5
- [ ] Fielder Batches 2, 4, 6
- [ ] Manager Batches 4-5

### After Each Batch
1. Generate 10 scenarios with Claude Code
2. Review each scenario for baseball accuracy
3. Test in the app to make sure they display correctly
4. Commit and push to GitHub
5. Move to next batch

---

## PROMPT TEMPLATE FOR CLAUDE CODE

Use this template for each batch, changing the position and topics:

---

Generate [NUMBER] new [POSITION] scenarios for the SCENARIOS.[position] array in index.jsx. Follow the EXACT format of the existing scenarios.

Each scenario needs:
- id: "[first letter][next number]" (e.g., "p13" for the 13th pitcher scenario)
- title: Short catchy name
- diff: [SPECIFY 1, 2, or 3 for each]
- cat: category tag
- description: 2-3 sentences painting a vivid game picture. Include the inning, score, outs, count, who's batting.
- situation: {inning, outs, count, runners array, score array}
- options: exactly 4 choices
- best: 0-indexed number of the optimal choice
- explanations: 4 detailed explanations teaching WHY each choice is good or bad. Reference real baseball percentages and strategy.
- rates: 4 success rate numbers (best choice should be 75-90, worst 15-30)
- concept: One-sentence strategic lesson
- anim: one of [steal, score, hit, throwHome, doubleplay, strike, strikeout, groundout, flyout, catch, advance, walk, bunt, safe, freeze]

Focus these [NUMBER] scenarios on:
[LIST THE SPECIFIC TOPICS]

Requirements:
- Strategically accurate based on real MLB baseball fundamentals
- Explanations teach kids WHY, don't just say "good choice" or "bad choice"
- Success rates should be realistic
- Difficulty 1 = obvious right answer, Difficulty 3 = nuanced situations
- Descriptions should make kids feel like they're in a real game
- Age-appropriate language for kids 8-16
