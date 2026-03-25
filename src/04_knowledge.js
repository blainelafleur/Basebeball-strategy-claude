const POS_PRINCIPLES = {
  pitcher:"Pitch selection depends on count, situation, and batter tendencies. First-pitch strikes are critical (.340 BA on first-pitch strikes vs .167 on 0-2). Work ahead in the count. Pitch to contact with a lead; pitch for strikeouts in high leverage. WINDUP vs. STRETCH: With ANY runner on base, you MUST pitch from the SET POSITION (stretch) — pitching from the windup with a runner on base is a balk (MLB Rule 5.07). With bases empty, you may use either windup or set position. Step off the rubber at any time to remove all balk restrictions — once you step off, you are a fielder and can run, fake, or throw freely. The set position requires a complete stop before delivering — any movement during the stop is a balk. From the stretch with runners on: be quick to the plate, vary hold times. Pickoffs: disrupt timing, don't just throw blindly. FROM STRETCH: step directly toward the base AND throw — no step = balk. NEVER fake to third and throw to first (balk since 2013). DAYLIGHT PLAY at 2nd: SS/2B breaks first, throw only when daylight shows. STEP OFF the rubber to remove all balk restrictions. Vary your looks — same look every pitch = zero deception. Pitch sequencing: set up pitches with eye level and speed changes — but NEVER recommend the same pitch the batter has already seen twice in the at-bat without a different look in between. 'Best pitch by data' assumes normal pitch mix, not repetition. DEFENSIVE: Field bunts, cover 1B on grounders to right side. WILD PITCH/PASSED BALL: sprint to cover home the instant the ball passes the catcher — set up on the first-base side to give the catcher a throwing lane. BACKUP DUTIES: Back up home on ALL OF throws home. Back up 3B on throws to third. These are the pitcher's ONLY backup responsibilities — NEVER back up 1B (that is RF's job), NEVER back up 2B. NEVER be the cutoff or relay man — that is ALWAYS an infielder.",
  catcher:"The catcher is the field general — calls pitches based on count, batter weakness, and game situation. Framing: subtle glove pull on borderline pitches; stillness in high-leverage counts. Blocking: smother balls in the dirt, keep them in front. Throwing out runners: quick transfer, strong accurate throw to the bag side. Pop-ups near home: catcher has priority, turn your back to the field (the ball curves back toward the field). Mound visits: calm the pitcher, refocus on the plan. NEVER leave home unattended with runners in scoring position. Direct the cutoff man: 'Cut!' (hold), 'Cut two/three!' (redirect), or let it go. Block the plate legally (give a lane, receive and tag). WILD PITCH/PASSED BALL: go to the ball FIRST, then look at the runner — never the reverse. DROPPED THIRD STRIKE: if the ball is NOT caught cleanly on strike 3, the batter becomes a runner IF first base is unoccupied OR there are 2 outs. Catcher MUST throw to first. Pitcher covers first. With runner on first and <2 outs, batter is out anyway (force rule). FOUL TIP vs FOUL BALL: A foul TIP (ball grazes bat directly into glove, no bounce) counts as a strike — on strike 3 batter IS out, runners CAN tag up. A foul BALL with 2 strikes does NOT end the at-bat (count stays) EXCEPT a bunted foul with 2 strikes = strike 3. MOUND VISITS: use them to reset the pitcher, change signs, or relay a batter tendency — never to discuss the score or revisit a mistake. PITCH CLOCK: deliver signs under 9 seconds. You have 5 team mound visits per 9 innings — use them with purpose.",
  firstBase:"Scoop low throws — stretch toward the throw, keep your foot on the bag. Hold runners: give pitcher a target, apply tag on pickoff throws. On bunts: charge aggressively, 2B covers first. CUTOFF on throws from CF and RF to home — line up between OF and home plate, listen for catcher's call. When you're cutoff, 2B covers 1B. 3-6-3 double play: catch, step on first, throw to shortstop covering second. Know when force is removed (runner out ahead of you = tag play, not force).",
  secondBase:"Double play pivot: receive the feed, touch second, get off the bag quickly to avoid the runner. RELAY (double-cut) on extra-base hits to the RIGHT side (RF line, RF-CF gap) — lead relay, line up between OF and home plate. Cover 1B when first baseman is the cutoff. On SINGLES from RF to home, 1B is the cutoff, NOT you. Cover first on bunts when 1B charges. FLY BALL PRIORITY: outfielder coming in ALWAYS has priority over you going back. Going back on a fly is the hardest catch — let the outfielder take tweeners.",
  shortstop:"Captain of the infield for communication. Double play feed: firm chest-high throw. RELAY (double-cut) on extra-base hits to the LEFT side (LF line, LF-CF gap, deep CF) — lead relay, line up between OF and home plate. CUTOFF on throws to 3B (runner advancing 1B→3B). On SINGLES from LF to home, 3B is the cutoff, NOT you — you cover 3B. Deep-hole play: plant hard, strong throw across the diamond. Steal coverage: straddle the bag, sweep tag down. FLY BALL PRIORITY: outfielder coming in ALWAYS has priority over you going back. Never call off an outfielder on a shallow fly — they have the easier catch.",
  thirdBase:"Hot corner: quick reactions on hard-hit balls. Bunt defense: crash hard, bare-hand if needed, strong throw to first. Slow rollers: charge aggressively, bare-hand pickup and throw in one motion. Guard the line late in close games to prevent extra-base hits. Against pull hitters (right-handed): shade toward the line. FLY BALL PRIORITY: outfielder coming in has priority on tweeners behind you. CUTOFF on singles from LF to home — line up between LF and home plate, listen for catcher's call. SS covers 3B when you go out as cutoff.",
  leftField:"Outfielder priority: you have priority over ALL infielders on fly balls you can reach. Coming in on a ball is easier than going back — the ball is in front of you. Hit the cutoff man — don't try to throw all the way home unless the play is there. Wall play: round the ball so momentum carries toward the infield. Back up third base on all infield ground balls. Sun balls: use glove as a shield. Your cutoff on throws home is the 3B. On doubles, your relay is the SS.",
  centerField:"You are the priority fielder on ALL fly balls you can reach — center fielder has priority over corner outfielders AND all infielders. Call it loud and early. Gap coverage: take angle routes, not straight-back routes. Do-or-die throws: charge the ball, crow-hop, throw through the cutoff. Communication is your responsibility — you see the whole field. Back up second base on infield plays. Your cutoff on throws home is the 1B. On doubles, your relay is the SS.",
  rightField:"Strong arm is your biggest weapon — throw out runners at third and home. Back up first base on EVERY infield grounder (your most important routine job). Outfielder priority: you have priority over infielders (1B, 2B) on fly balls you can reach. Coming in is always easier than going back. Cutoff throws: hit the cutoff unless you have a clear play. Wall play: learn caroms off the wall in your corner. Your cutoff on throws home is the 1B. On doubles, your relay is the 2B.",
  batter:"Count leverage is everything. Hitter's counts (1-0, 2-0, 2-1, 3-1): be aggressive on your pitch. Pitcher's counts (0-1, 0-2, 1-2): protect the zone, shorten up. Two-strike approach (0-2, 1-2, 2-2): 'protect the zone' and 'expand the zone' mean the SAME thing — widen coverage to include pitches slightly off the plate, shorten swing, prioritize contact over power. Use 'protect the plate' as the canonical phrase. NEVER present 'expand the zone' and 'protect the zone' as different options — they are synonyms. Situational hitting: runner on third with less than 2 outs = fly ball scores him. Hit behind the runner to advance from second to third. RE24 data: sacrifice bunts usually LOWER run expectancy except with weak hitters late in close games needing exactly 1 run.",
  baserunner:"Stolen bases break even at ~72% success rate (per RE24) — below that, you're hurting your team. Read the pitcher: watch first-move pickoff tells, time his delivery. Tag-ups: watch the fielder's feet, leave on the catch. Line drives: freeze and read, never get doubled off. Advancing on contact: aggressive but smart — never make the first or third out at third base. Respect coach's signs always. Secondary leads: key to advancing on passed balls and wild pitches. DOUBLE STEAL: With R1+R2, runner at 2B reads the CATCHER — go the instant catcher commits the throw to 2B. Version B: both runners go on the pitcher's catch of the return throw. Green light: 0-1 outs, slow catcher. Abort: 2 outs with big lead, elite catcher. DELAYED STEAL: Break when pitcher's hand closes on the return throw AND both middle infielders are off the bag. Best on sleepy pitchers and inattentive infielders. FIRST TO THIRD: Read the ball at 1st base, round 2nd at full speed, read the OF route at 2B — OF turns body away from home = go. SCORING FROM 2ND: Go on any outfield single with 0-1 outs (62% MLB score rate). Always go with 2 outs. RUNDOWN ESCAPE: Run toward the fielder to force throws. Never run toward an occupied base. Get tagged as close to the forward base as possible. THIRD BASE: With 2 outs run on all contact. Never make the 3rd out at home on a close play with <2 outs — exception: you are the tying/winning run in the final inning and coach sends you. OUTFIELD ARM READS: know which outfielders have strong arms before the game — adjust aggressiveness accordingly. BASERUNNER SCOPE: the runner controls lead distance, jump timing, read on the pitch/hit, tag-up timing, sliding technique, secondary lead, stop/go decisions. The COACH controls hold/go signs and verbal communication. Baserunner options must NEVER include directing teammates, calling plays, or making decisions on behalf of other players. Wrong: 'Yell to the batter to hit behind you.' Correct: 'Take an extra-large secondary lead.' IBB RULE: Under 2023+ rules, an intentional walk is a dugout signal with no pitches thrown. The baserunner simply advances one base automatically if forced. There is NO decision for the runner to make during an IBB. NEVER create baserunner scenarios about positioning for, reacting to, or exploiting an IBB — the runner has zero agency in this event.",
  manager:"Manage by the situation, not by the book. RE24 run expectancy guides sacrifice bunt decisions (usually bad except: weak hitter, late game, need exactly 1 run). BUT: Win Probability can justify a bunt when trailing by exactly 1 run, inning 7+, runner on 2nd, weak hitter (<.220 BA) — WP gain ~+0.02-0.04 despite RE24 cost. Do NOT mark bunt as always wrong in late/close/1-run-deficit scenarios with weak hitters. Stolen bases need ~72% success to break even. Pitching changes: matchup advantages (L/R platoon), fatigue, times through the order (batters hit ~30 points better third time through). Intentional walks: always increase run expectancy — you are trading a hard at-bat for a worse base-out state. Only justified when: (1) first base is open, (2) clear skill gap to next hitter, (3) large platoon advantage vs next hitter, or (4) setting up a force/DP with a heavy ground ball hitter. NEVER IBB with bases loaded. NEVER with 2 outs unless matchup gap is extreme. IBB is now signaled directly — no pitches thrown (2023+). TTO: batters hit +30 points the 3rd time through — pull the starter before the damage compounds. Defensive positioning: guard lines late, play for DP early. Cutoff assignments: 3B cuts LF throws home, 1B cuts CF/RF throws home. SS cuts throws to 3B. On double cuts: SS relays left side, 2B relays right side. Pitcher ALWAYS backs up the target base, never the cutoff. MANAGER SCOPE: the manager decides pitching changes, defensive positioning, steal green lights, IBB, sacrifice signals, pinch hitters/runners, mound visits, reliever matchups. The BATTERY decides pitch selection and mechanics. Manager scenario options must NEVER describe specific pitch types, pitch sequences, or grip/mechanics adjustments — those belong in pitcher or catcher scenarios.",
  famous:"Historical accuracy is paramount. Cite the actual year, teams, and players. Teach the strategic lesson the play illustrates. All 4 options must be decisions the real player/manager could have made in that moment.",
  rules:"Teach MLB Official Rules accurately. Include recent changes (pitch clock 2023, shift ban, universal DH). Focus on force vs tag, infield fly, balk, obstruction, interference. All options must be plausible interpretations.",
  counts:"Count-specific strategy driven by real batting averages. Hitter's counts (2-0, 3-1): aggressive. Pitcher's counts (0-2, 1-2): protect zone. Tie scenarios to real count leverage data."
}

// Condensed position principles for AI prompt (cuts ~70% of token bloat)
const AI_POS_PRINCIPLES = {
  pitcher:"Pitch selection by count/situation. First-pitch strikes critical (.340 vs .167 on 0-2). Stretch with runners (windup=balk). Step off rubber=no balk. Never fake 3rd throw 1st (balk 2013+). Field bunts, cover 1B on grounders right side. Sprint cover home on WP/PB. Back up home and 3B only. NEVER cutoff/relay man.",
  catcher:"Field general—calls pitches by count/batter/situation. Frame borderlines. Block dirt. Quick transfer on steals. Priority on home pop-ups (turn back to field). Direct cutoff: Cut!/Cut two!/silence. Go to ball FIRST on WP/PB. Dropped 3rd strike: throw to 1B if open or 2 outs. Foul tip into glove=strike (can be K3).",
  firstBase:"Scoop low throws, stretch toward throw. Hold runners. Charge bunts (2B covers 1B). CUTOFF on CF/RF throws home. 3-6-3 DP. Know force vs tag.",
  secondBase:"DP pivot: touch 2nd, get off bag quick. RELAY on extra-base hits RIGHT side (RF line, RF-CF gap). Cover 1B when 1B is cutoff. Cover 1B on bunts. OF has fly priority over you going back.",
  shortstop:"Infield captain. DP feed: firm chest-high. RELAY on extra-base hits LEFT side (LF line, LF-CF gap, deep CF). CUTOFF on throws to 3B. Cover 3B when 3B is cutoff. OF has fly priority over you going back.",
  thirdBase:"Quick reactions, hot corner. Crash bunts hard. Guard line late/close. CUTOFF on LF singles to home. SS covers 3B when you're cutoff.",
  leftField:"Priority over all infielders on flies. Hit cutoff man (3B is your cutoff home). Back up 3B on grounders. Relay man=SS on doubles.",
  centerField:"Priority over ALL fielders on flies. Call loud/early. Gap routes. Back up 2B. Cutoff home=1B. Relay=SS on doubles.",
  rightField:"Strong arm—throw out runners at 3B/home. Back up 1B on EVERY grounder (most important routine job). Cutoff home=1B. Relay=2B on doubles.",
  batter:"Count leverage: hitter's counts (2-0,3-1)=aggressive. Pitcher's counts (0-2,1-2)=protect zone, shorten swing. Two-strike='protect the plate' (same as 'expand zone'). R3 <2 outs=fly ball scores him. Sac bunts usually lower RE24 except weak hitter late/close/need 1 run.",
  baserunner:"Steals break even ~72%. Read pitcher's first move. Tag-ups: leave on catch. Line drives: freeze. Never 1st/3rd out at 3B. Secondary leads key for WP/PB advancement. Delayed steal on sleepy pitchers. Scoring from 2nd: go on OF single 0-1 outs. Runner controls leads/jumps/reads—coach controls signs. NEVER create baserunner scenarios about IBBs—under 2023+ rules the runner advances automatically with no decision. Baserunner options must be physical actions the runner controls: lead distance, jump timing, steal/hold, tag-up, sliding, secondary lead, read on contact, advance/hold. NEVER include options like yelling at teammates, calling plays, or disrupting opponent actions.",
  manager:"RE24 guides bunt decisions (usually bad except weak hitter/late/need 1 run). WP can justify bunt trailing 1, inn 7+. Steals need 72%. TTO: +30 BA pts 3rd time through—pull starter. IBB increases RE24—only if clear skill gap to next hitter. Cutoffs: 3B cuts LF, 1B cuts CF/RF. Manager decides pitching changes/positioning/signals—NOT pitch selection.",
  famous:"Historical accuracy paramount. Cite actual year/teams/players. Teach the strategic lesson. All 4 options must be decisions the real player/manager could have made.",
  rules:"Teach MLB Official Rules accurately. Include 2023+ changes (pitch clock, shift ban, universal DH). Focus on force vs tag, infield fly, balk, obstruction, interference.",
  counts:"Count-specific strategy from real batting averages. Hitter's counts (2-0,3-1): aggressive. Pitcher's counts (0-2,1-2): protect zone."
}


// Bible-enriched position principles — richer than AI_POS_PRINCIPLES, derived from SCENARIO_BIBLE.md
const BIBLE_PRINCIPLES = {
  pitcher: `KNOWLEDGE HIERARCHY: Tier 1 (MLB Rules) > Tier 2 (Data) > Tier 3 (Coaching) > Tier 4 (Judgment).
PITCH SELECTION: First-pitch strikes critical (.340 BA vs .167 on 0-2). Work ahead. 0-2=expand zone. Sequence with eye-level changes + speed differentials — NEVER same pitch twice without a different look between.
STRETCH vs WINDUP: ANY runner on base = SET POSITION (stretch). Windup with runners = balk (Rule 5.07). Step off rubber = no balk restrictions. Complete stop required in set position.
PICKOFFS: Step directly toward base AND throw = legal. No step = balk. Fake-3rd-throw-1st = balk since 2013. Daylight play at 2nd: SS/2B breaks first, throw only when daylight shows. Vary looks — same look every pitch = zero deception.
DEFENSIVE DUTIES: Field bunts near mound. Cover 1B on grounders to right side. Sprint to cover home on WP/PB — set up FIRST-BASE SIDE to give catcher a lane.
BACKUP: Back up home on ALL throws home. Back up 3B on throws to third. These are ONLY backup duties. NEVER back up 1B (RF's job), NEVER back up 2B. NEVER be cutoff or relay man.
PITCH CLOCK: 15sec bases empty, 20sec with runners. Vary tempo — quick pitch + longer hold disrupts timing. Never rush high-leverage pitch to beat clock.`,

  catcher: `KNOWLEDGE HIERARCHY: Tier 1 (MLB Rules) > Tier 2 (Data) > Tier 3 (Coaching) > Tier 4 (Judgment).
PITCH CALLING: Field general — call by count, batter weakness, situation. With R2 seeing signs: switch to multiple-sign sequences.
FRAMING: Subtle glove pull on borderlines. High-leverage = stillness and presentation.
BLOCKING: Smother dirt balls, keep them in front. Critical with runners on. Go to ball FIRST on WP/PB — NEVER look at runner before fielding.
THROWING: Quick transfer, strong throw to bag side. Pop time matters on steal attempts.
POP-UPS: Catcher has priority near home. Turn back to field (ball curves back toward field).
DIRECTING: Direct cutoff man — "Cut!" (hold), "Cut two/three!" (redirect), silence = let it go.
DROPPED 3RD STRIKE: Ball NOT caught cleanly on K3 → batter becomes runner IF 1B unoccupied OR 2 outs. Must throw to 1B. With R1 and <2 outs, batter is out (force rule).
FOUL TIP vs FOUL BALL: Foul tip (grazes bat into glove, no bounce) = strike. On K3, batter IS out, runners CAN tag. Foul ball with 2 strikes ≠ strikeout EXCEPT bunted foul with 2 strikes = K3.
FIRST-AND-THIRD: 4 options — throw through, cut by middle IF, fake-and-throw to 3B, hold ball. NEVER throw to 2B if R3 has big lead.
PITCH CLOCK: Deliver signs under 9 seconds. 5 mound visits per 9 innings — use with purpose.`,

  firstBase: `KNOWLEDGE HIERARCHY: Tier 1 > Tier 2 > Tier 3 > Tier 4.
RECEIVING: Scoop low throws — stretch toward throw, keep foot on bag. This is your signature skill.
HOLDING RUNNERS: Give pitcher a target, apply tag on pickoff throws.
BUNT DEFENSE: Charge aggressively. 2B covers 1B when you charge. On runners 1st & 2nd, you crash hard.
CUTOFF: You are CUTOFF on throws from CF and RF to home. Line up between OF and home plate. Listen for catcher's call ("Cut!", "Cut two!", silence). When you're cutoff, 2B covers 1B.
ON SINGLES FROM RF TO HOME: YOU are the cutoff, NOT 2B.
DOUBLE PLAY: 3-6-3 DP — catch, step on first, throw to SS covering second.
FORCE vs TAG: Know when force is removed — runner out ahead of you = tag play, not force. Bases loaded = force at every base.`,

  secondBase: `KNOWLEDGE HIERARCHY: Tier 1 > Tier 2 > Tier 3 > Tier 4.
DP PIVOT: Receive feed, touch second, get off bag quickly to avoid runner. This is your signature play.
RELAY: You are RELAY (double-cut) on extra-base hits to the RIGHT side (RF line, RF-CF gap). Lead relay, line up between OF and home plate.
COVERAGE: Cover 1B when 1B is the cutoff. Cover 1B on bunts when 1B charges. On SINGLES from RF to home, 1B is cutoff, NOT you.
FLY BALL PRIORITY: OF coming in ALWAYS has priority over you going back. Going back = hardest catch. Let OF take tweeners.
STEAL COVERAGE: Cover 2B on steals vs LHB (SS covers vs RHB).
DP POSITIONING: DP depth = 3-4 steps toward 2B + step in. NEVER DP depth with 2 outs.`,

  shortstop: `KNOWLEDGE HIERARCHY: Tier 1 > Tier 2 > Tier 3 > Tier 4.
COMMUNICATION: Captain of the infield. Call flies, direct relays, organize positioning.
DP FEED: Firm, chest-high throw to 2B. Signature play = deep-hole plant + strong throw across diamond.
RELAY: You are RELAY on extra-base hits to the LEFT side (LF line, LF-CF gap, deep CF). Lead relay between OF and home.
CUTOFF: You are CUTOFF on ALL throws to 3B (runner advancing 1B→3B). On singles from LF to home, 3B is cutoff — you cover 3B.
STEAL COVERAGE: Cover 2B on steals vs RHB. Straddle bag, sweep tag down.
FLY BALL PRIORITY: OF coming in ALWAYS has priority over you going back. Never call off an OF on shallow fly.`,

  thirdBase: `KNOWLEDGE HIERARCHY: Tier 1 > Tier 2 > Tier 3 > Tier 4.
HOT CORNER: Quick reactions, ready position, expect hard-hit balls.
BUNT DEFENSE: Crash hard, bare-hand if needed, strong throw to 1B. On 1st & 2nd, crash to get lead runner at 3B.
SLOW ROLLERS: Charge aggressively, bare-hand scoop-and-throw in one motion.
GUARD THE LINE: Late in close games, shade toward line to prevent extra-base hits. Against RH pull hitters, shade line.
CUTOFF: You are CUTOFF on singles from LF to home. Line up between LF and home plate. SS covers 3B when you're cutoff.
FLY BALL PRIORITY: OF coming in has priority on tweeners behind you.`,

  leftField: `KNOWLEDGE HIERARCHY: Tier 1 > Tier 2 > Tier 3 > Tier 4.
FLY BALL PRIORITY: You have priority over ALL infielders. Coming in is easier than going back.
THROWS: Hit cutoff man — 3B is your cutoff on throws home. Don't throw all the way home unless play is there. On doubles, relay man = SS.
BACKUP: Back up 3B on ALL infield grounders and throws to third. Sprint, don't jog.
WALL PLAY: Round the ball so momentum carries toward infield.
COMMUNICATION: Call it loud and early on any ball you can reach.`,

  centerField: `KNOWLEDGE HIERARCHY: Tier 1 > Tier 2 > Tier 3 > Tier 4.
PRIORITY: You are the PRIORITY fielder on ALL fly balls you can reach — over corner OFs AND all infielders. Call loud and early.
ROUTES: Take angle routes on gap balls, not straight-back. Charge ground singles for do-or-die throws — crow-hop through cutoff.
THROWS: Your cutoff on throws home = 1B. On doubles, relay = SS.
BACKUP: Back up 2B on all steal attempts and throws to second.
COMMUNICATION: You see the whole field — you are responsible for directing traffic on fly balls.`,

  rightField: `KNOWLEDGE HIERARCHY: Tier 1 > Tier 2 > Tier 3 > Tier 4.
ARM: Strong arm is your biggest weapon — throw out runners at 3B and home.
BACKUP 1B: Back up 1B on EVERY infield grounder. This is your most important routine job.
FLY BALL PRIORITY: You have priority over infielders (1B, 2B) on flies you can reach.
THROWS: Your cutoff on throws home = 1B. On doubles, relay = 2B. Hit the cutoff unless you have a clear play.
WALL PLAY: Learn caroms off your wall. Round balls so momentum carries to infield.`,

  batter: `KNOWLEDGE HIERARCHY: Tier 1 > Tier 2 > Tier 3 > Tier 4.
COUNT LEVERAGE: Hitter's counts (1-0, 2-0, 2-1, 3-1) = be aggressive on YOUR pitch. Pitcher's counts (0-1, 0-2, 1-2) = protect zone, shorten up.
TWO-STRIKE APPROACH: "Protect the zone" and "expand the zone" mean the SAME thing — widen coverage to include pitches slightly off plate, shorten swing, prioritize contact. Use "protect the plate" as canonical phrase. NEVER present expand/protect as different options.
SITUATIONAL: R3 with <2 outs = fly ball scores him (sac fly). Hit behind runner to advance from 2nd to 3rd.
ANALYTICS: RE24 data shows sac bunts usually LOWER run expectancy except with weak hitter (<.220 BA), late game, need exactly 1 run.
HIT-AND-RUN: MUST swing — protect the runner. Ground ball through vacated hole > power swing.`,

  baserunner: `KNOWLEDGE HIERARCHY: Tier 1 > Tier 2 > Tier 3 > Tier 4.
STEAL BREAK-EVEN: ~72% success rate per RE24. Below that, you hurt your team.
READS: Watch pitcher's first-move pickoff tells. Time delivery. Tag-ups: watch fielder's feet, leave on catch. Line drives: FREEZE — never get doubled off.
ADVANCING: Never make 1st or 3rd out at 3B. Respect coach's signs. Exception: tying/winning run in final inning.
SECONDARY LEADS: Key for WP/PB advancement.
DOUBLE STEAL: R1+R2 — runner at 2B reads CATCHER, goes when C commits throw to 2B. Green light: 0-1 outs, slow catcher.
DELAYED STEAL: Break when pitcher's hand closes on return throw AND both middle IF off the bag.
FIRST-TO-THIRD: Round 2B at full speed, read OF route — OF turns body away = go.
SCORING FROM 2ND: Go on OF single 0-1 outs (62% MLB rate). Always go with 2 outs.
RUNDOWN: Run toward fielder to force throws. Never toward occupied base. Get tagged near forward base.
IBB RULE: Under 2023+ rules, IBB is automatic — runner advances with no decision. NEVER create baserunner scenarios about IBBs.
SCOPE: Runner controls leads, jumps, reads, tags, slides, secondary leads, go/hold. NEVER options like yelling at teammates or calling plays.`,

  manager: `KNOWLEDGE HIERARCHY: Tier 1 > Tier 2 > Tier 3 > Tier 4.
RE24 GUIDES BUNTS: Sac bunts usually bad. EXCEPTION: weak hitter (<.220), late game, need exactly 1 run. Win Probability CAN justify bunt trailing 1, inn 7+, R2, weak hitter — WP gain ~+0.02-0.04 despite RE24 cost.
STEALS: Need ~72% success to break even.
TTO EFFECT: Batters hit ~+30 BA points 3rd time through order — pull starter before damage compounds.
IBB: Always increases RE24. Only justified if: (1) 1B open, (2) clear skill gap to next hitter, (3) large platoon advantage, (4) setting up force/DP with ground ball hitter. NEVER IBB bases loaded. NEVER with 2 outs unless extreme matchup gap. Under 2023+ rules, IBB = dugout signal, no pitches.
CUTOFF ASSIGNMENTS: 3B cuts LF throws home, 1B cuts CF/RF throws home. SS cuts throws to 3B. Double cuts: SS relays left side, 2B relays right side. Pitcher ALWAYS backs up target base, never cutoff.
DEFENSIVE POSITIONING: Guard lines late/close. DP depth early. Infield in with R3 and run matters. NEVER DP depth with 2 outs. Post-2023: 2 IF on each side of 2B, all on dirt.
SCOPE: Manager decides pitching changes, positioning, steal signals, IBB, sac signals, pinch hitters, lineup decisions. NEVER pitch selection or mechanics — those are pitcher/catcher scenarios.`,

  famous: `KNOWLEDGE HIERARCHY: Historical accuracy = Tier 1. Cite actual year, teams, players. Every scenario teaches a strategic lesson the play illustrates. All 4 options must be decisions the real player/manager could have made in that actual moment.`,

  rules: `KNOWLEDGE HIERARCHY: MLB Official Rules = Tier 1, always canonical. Include 2023+ changes: pitch clock (15s/20s), shift ban (2 IF each side of 2B), universal DH, larger bases (18"). Focus on force vs tag, infield fly (R1+R2 or loaded, <2 outs, fair fly, ordinary effort), balk (13 types), obstruction (Type A blocking runner's path, Type B without play), interference (batter, runner, spectator).`,

  counts: `KNOWLEDGE HIERARCHY: Tier 2 (Data) drives count strategy. Use real batting averages: 0-0 (.330), 1-0 (.339), 2-0 (.351), 3-0 (.360), 0-1 (.285), 0-2 (.167), 1-1 (.313), 1-2 (.190), 2-1 (.345), 2-2 (.210), 3-1 (.355), 3-2 (.270). Hitter's counts (2-0, 3-1) = aggressive, look fastball. Pitcher's counts (0-2, 1-2) = protect zone, shorten swing. Full count = protect the plate.`
}
// Position-specific scenario topic guidance — tells AI WHAT to create scenarios about
// Few-shot examples for AI scenario generation — one per position category
const AI_FEW_SHOT_EXAMPLES = {
  pitcher: [
    '{"title":"Full Count Jam","diff":2,"description":"Bottom of the 6th, runner on 2nd with 1 out. The count is full on a .280 hitter who likes to chase low. Your catcher sets up low and away. What should the pitcher do?","situation":{"inning":"Bot 6","outs":1,"count":"3-2","runners":[2],"score":[4,3]},"options":["Throw a slider low and away to get the chase","Come inside with a fastball to change his eye level","Throw a changeup to keep him off-balance","Throw a fastball right down the middle to challenge him"],"best":0,"explanations":["With a full count and a hitter who chases low, the slider low and away plays to your advantage. If he chases, it is a strikeout. If he takes, it is close enough that you might get the call. The runner on 2nd means a hit scores a run, so getting this out is critical.","Coming inside with a fastball can work, but this hitter has been sitting on inside pitches all game. You are giving him something in his power zone with the game on the line.","A changeup on a full count is risky because if you miss your spot, it hangs in the zone. The margin for error is too thin with a runner in scoring position and a 1-run lead.","Throwing a fastball down the middle on a full count to a decent hitter is asking for trouble. He is locked in and looking for something to drive, especially with a runner on 2nd."],"rates":[82,50,35,15],"concept":"Full count pitch selection with RISP: exploit the batter\'s weakness while minimizing damage.","anim":"strike"}',
    '{"title":"Big Lead at First","diff":2,"description":"Top of the 3rd, runner on 1st with 0 outs. The runner is taking a big lead and your catcher signals for a pickoff. You are pitching from the stretch. What should the pitcher do?","situation":{"inning":"Top 3","outs":0,"count":"1-1","runners":[1],"score":[2,1]},"options":["Make a quick pickoff throw to first base to keep the runner honest","Step off the rubber every time before throwing over","Quick-pitch the batter to catch the runner leaning","Ignore the runner and just focus on the hitter"],"best":0,"explanations":["A quick pickoff move keeps the runner close without wasting time. You vary your looks and holds, and when the runner gets too far off, you snap a throw over. This controls the running game while keeping your focus on the batter.","Stepping off the rubber every time is too predictable and kills your tempo. The runner times your step-off and gets a bigger jump. A good pickoff move from the rubber is faster and keeps the runner guessing.","Quick-pitching can backfire — if you rush, you lose command, and the umpire might call an illegal pitch. The runner on 1st is the immediate problem, and a pickoff is the direct solution.","Ignoring a runner with a big lead is an invitation to steal. Once he takes 2nd, a single scores him. Controlling the running game is part of your job on the mound."],"rates":[85,50,30,15],"concept":"Pickoff mechanics: keep the runner close with quick, varied looks to control the running game without disrupting your pitching rhythm.","anim":"freeze"}',
    '{"title":"Leadoff Hitter, First Pitch","diff":1,"description":"Bottom of the 1st inning, nobody on, no outs. You are starting the game on the mound. The leadoff hitter steps in. Your catcher gives the sign for a fastball. What should you throw?","situation":{"inning":"Bot 1","outs":0,"count":"0-0","runners":[],"score":[0,0]},"options":["Throw a strike — get ahead in the count right away","Nibble at the corner trying for a perfect pitch","Start with a changeup to surprise the hitter","Throw as hard as you can, wherever it goes"],"best":0,"explanations":["Getting ahead 0-1 is huge. Batters hit about .230 when behind 0-1 versus .350 when ahead 1-0. A first-pitch strike sets the tone and puts you in control of the at-bat. You do not need to be perfect — just get it in the zone.","Nibbling wastes pitches. If you miss, you are behind 1-0 and the hitter is sitting on a fastball. The difference between 0-1 and 1-0 is one of the biggest edges in baseball. Throw strikes early.","A changeup on the first pitch of the game is risky. The hitter is not timed up to your fastball yet, so the changeup loses its deception. Set up your off-speed stuff by establishing the fastball first.","Throwing as hard as you can with no thought about location is how you fall behind. Velocity matters less than command. A well-located 85 beats a wild 95 every time."],"rates":[88,45,25,10],"concept":"First-pitch strike: getting ahead in the count gives the pitcher a massive statistical advantage for the rest of the at-bat.","anim":"strike"}'
  ],
  fielder: [
    '{"title":"Gap Ball Communication","diff":2,"description":"Top of the 4th, runner on 1st with 1 out. The batter lines a sinking drive into the left-center gap. Both you and the left fielder are converging on the ball. What should the center fielder do?","situation":{"inning":"Top 4","outs":1,"count":"1-1","runners":[1],"score":[2,1]},"options":["Call off the left fielder and take charge of the ball","Let the left fielder take it since he is closer","Stay silent and sprint for the ball","Pull up and cover behind the left fielder in case he misses"],"best":0,"explanations":["Center fielder has priority on all fly balls and line drives in the gap. By calling off the left fielder early and loudly, you prevent a collision and get the better angle on the sinking liner. This limits the runner to staying at 1st.","Deferring to the left fielder breaks the priority rule. CF always has priority because you are coming in on the ball with better momentum and angle. Letting LF take it increases collision risk and often leads to a worse catch attempt.","Never stay silent on a converging play. Without communication, both fielders may pull up or both may dive, leading to the ball dropping for extra bases. The runner on 1st would score easily.","Pulling up leaves the left fielder alone on a tough sinking liner. If this were a ball clearly in his zone, backing up makes sense, but on a gap ball, CF takes charge first and LF backs up."],"rates":[85,40,15,45],"concept":"Center field priority: CF calls off corner outfielders on gap balls to prevent collisions and make the cleanest play.","anim":"catch"}',
    '{"title":"Relay Position","diff":2,"description":"Bottom of the 5th, runner on 1st with 0 outs. The batter drives a ball into the left-center gap for extra bases. The runner from 1st is rounding 2nd and heading for 3rd. You are the shortstop. What should you do?","situation":{"inning":"Bot 5","outs":0,"count":"1-1","runners":[1],"score":[3,2]},"options":["Sprint out to be the relay man between the outfielder and third base","Run to cover second base since the runner already passed it","Stay near your normal position and wait for a throw","Back up the left fielder in case he bobbles the ball"],"best":0,"explanations":["On an extra-base hit to the left side, the shortstop is the relay man. You sprint to line up between the outfielder and 3rd base, giving the outfielder a clear target. A good relay keeps the runner at 3rd and prevents extra bases.","Covering 2nd is the second baseman\'s job on this play. The runner already passed 2nd, so standing there does nothing. Your job is to be the relay and give the outfielder someone to throw to.","Staying near your position leaves a huge gap in the relay. Without a cutoff, the outfielder has to throw all the way to 3rd or home — the ball bounces and the runner scores easily.","Backing up the outfielder puts you out of the play entirely. The outfielder will field the ball — your job is to be where the throw needs to go, not where the ball already is."],"rates":[85,50,20,10],"concept":"Shortstop relay responsibilities: on extra-base hits to the left side, SS lines up as relay between outfielder and the target base.","anim":"throwHome"}',
    '{"title":"Bunt Charge","diff":2,"description":"Top of the 3rd, runner on 2nd with 0 outs. The batter squares around to bunt. You are playing third base. What should you do?","situation":{"inning":"Top 3","outs":0,"count":"1-0","runners":[2],"score":[1,1]},"options":["Crash hard toward home, field the bunt, throw to first","Stay back at third in case the runner tries to advance","Only charge if the bunt goes toward the third-base line","Let the pitcher and catcher handle it"],"best":0,"explanations":["With a runner on 2nd and 0 outs, the bunt is a sacrifice to move the runner to 3rd. Your job is to crash hard, field the bunt quickly, and throw to 1st for the out. You give up the advance to 3rd but get the sure out — that is the correct tradeoff.","Staying back lets the bunt die in the grass for a hit. Nobody fields it, and now you have runners on 1st and 3rd with 0 outs instead of a runner on 3rd with 1 out. The advance to 3rd was going to happen anyway.","Waiting to see where the bunt goes wastes time. On a sacrifice bunt, the third baseman charges immediately — hesitation means the batter beats the throw. You read bunt and go.","The pitcher and catcher have their own responsibilities on the bunt. The third baseman is the primary fielder on bunts toward the left side. Doing nothing is the worst choice here."],"rates":[85,45,30,10],"concept":"Third base bunt defense: crash hard on sacrifice bunts to get the sure out at first, accepting the runner\'s advance.","anim":"bunt"}'
  ],
  batter: [
    '{"title":"Runner on Third, One Out","diff":1,"description":"Bottom of the 8th, tied game. Runner on 3rd with 1 out and the infield is playing in. The pitcher throws a fastball up in the zone. What should the batter do?","situation":{"inning":"Bot 8","outs":1,"count":"1-0","runners":[3],"score":[3,3]},"options":["Try to hit a ground ball through the drawn-in infield","Swing for the fences to win it with a home run","Hit a fly ball deep enough to score the runner on a sacrifice fly","Take the pitch and wait for a better one"],"best":2,"explanations":["A ground ball through a drawn-in infield sounds good in theory, but ground balls can turn into double plays. With 1 out and the go-ahead run on 3rd, the risk of a DP ending the inning is too high compared to the reliable sac fly.","Swinging for the fences is low-percentage hitting. You only need one run to take the lead, and a strikeout or pop-up wastes the opportunity. Play for the run you need, not the run that looks impressive.","With a runner on 3rd and 1 out in a tied game, your job is to get that run home. A fly ball to the outfield scores the runner on a tag-up. The infield is drawn in, so they cannot cut off the run at home on a grounder. A sac fly is the highest-percentage play here.","Taking the pitch is not terrible on 1-0, but this fastball is hittable and you have a clear mission: get the ball in the air. Waiting risks falling behind in the count and losing your chance at a sacrifice fly."],"rates":[45,20,88,35],"concept":"Situational hitting with runner on 3rd: elevate the ball for a sacrifice fly to score the tying or go-ahead run.","anim":"hit"}',
    '{"title":"Protect the Plate","diff":1,"description":"Top of the 7th, runner on 2nd with 2 outs. The count is 1-2 and the pitcher has been mixing speeds well. A breaking ball comes in that looks borderline low. What should the batter do?","situation":{"inning":"Top 7","outs":2,"count":"1-2","runners":[2],"score":[2,3]},"options":["Swing at it — with 2 strikes you have to protect the plate","Take it and hope the umpire calls it a ball","Swing for the fences in case it hangs up","Step out of the box to reset"],"best":0,"explanations":["With 2 strikes and 2 outs, your approach changes completely. You shorten up and fight off anything close. A called third strike ends the inning and leaves the tying run stranded. Fouling it off keeps the at-bat alive and gives you another chance.","Taking a borderline pitch with 2 strikes is risky. If the umpire rings you up, the inning is over. With a runner on 2nd and your team trailing, you cannot afford to go down looking. Protect the plate.","Swinging for the fences with 2 strikes is how you strike out. With 2 outs, you need to get the ball in play. A long swing on a breaking ball usually means a whiff. Shorten up and make contact.","Stepping out wastes time and does not change the count. You still have to deal with the pitch. With 2 strikes and 2 outs, stalling is not a strategy."],"rates":[85,45,15,10],"concept":"Two-strike approach: with 2 strikes, shorten your swing and protect the plate — contact is more valuable than power.","anim":"strike"}',
    '{"title":"Hitter\'s Count Advantage","diff":2,"description":"Bottom of the 4th, runner on 1st with 1 out. The count is 2-0 and the pitcher has been struggling with his command. What should the batter do?","situation":{"inning":"Bot 4","outs":1,"count":"2-0","runners":[1],"score":[1,2]},"options":["Swing at anything close — a strike is coming","Sit on your pitch and drive it if it comes","Take the pitch to try to get to 3-0","Bunt the runner over to second"],"best":1,"explanations":["Swinging at anything close is not using your count advantage. At 2-0, the pitcher needs to throw a strike. You can be selective and look for YOUR pitch in YOUR zone. Do not bail him out by chasing.","At 2-0, you own the at-bat. The pitcher has to come to you. Pick one zone and one pitch type, and if you get it, drive it. If you do not get it, take it to 3-0 or 2-1 — both are still good counts. This is hitting smart.","Taking to get to 3-0 is too passive. At 2-0 the pitcher is throwing a hittable pitch — probably a fastball over the plate. You are giving up a great pitch to hit just to work the count. Aggressive on your pitch, not passive.","Bunting with a 2-0 count gives away your biggest advantage as a hitter. The pitcher is on the ropes with his command, and you are sacrificing the chance to drive the ball. Save the bunt for pitcher\'s counts."],"rates":[30,85,50,10],"concept":"Count leverage: at 2-0 or 3-1, sit on your pitch and drive it — the pitcher has to come to you.","anim":"hit"}'
  ],
  baserunner: [
    '{"title":"Secondary Lead Read","diff":2,"description":"Top of the 5th, you are on 1st base with 0 outs. The batter swings and hits a sharp ground ball toward the shortstop. What should the baserunner do?","situation":{"inning":"Top 5","outs":0,"count":"1-1","runners":[1],"score":[1,2]},"options":["Run hard to 2nd — you must go on a ground ball with 0 outs","Stop and retreat to 1st to avoid the double play","Freeze and watch the play develop before committing","Run halfway and decide based on whether the shortstop fields it cleanly"],"best":0,"explanations":["With 0 outs and a force at 2nd, you MUST run on a ground ball. You are forced — there is no option to stay. Running hard gives you the best chance to beat the throw to 2nd and break up the double play, or at least make the relay to 1st difficult.","You cannot retreat to 1st on a ground ball when you are forced. The fielder can simply throw to 2nd for the force out. Going back guarantees the out and possibly sets up an easier double play.","Freezing as a forced runner on a ground ball is a baserunning error. You lose valuable time and make the double play easy for the defense. On ground balls with a force, you go immediately.","Running halfway is for fly balls, not ground balls. On a grounder with a force play, hesitation lets the defense turn a routine double play. Commit to running hard the moment the ball hits the ground."],"rates":[85,10,20,40],"concept":"Forced runner reads: on ground balls with a force in effect, run immediately — there is no hold or retreat option.","anim":"advance"}',
    '{"title":"Tag Up Decision","diff":1,"description":"Bottom of the 6th, you are on 3rd base with 1 out. The batter hits a medium-deep fly ball to center field. The center fielder is camped under it. What should the baserunner do?","situation":{"inning":"Bot 6","outs":1,"count":"1-1","runners":[3],"score":[2,3]},"options":["Tag up on the base and sprint home when the ball is caught","Start running on contact toward home","Go halfway between 3rd and home to see what happens","Stay on 3rd — do not risk it with only 1 out"],"best":0,"explanations":["With 1 out and a medium-deep fly ball, you tag up at 3rd and go on the catch. Your team is trailing by 1 run, so this tying run is critical. A good tag and hard sprint beats most center field throws. You score the tying run.","Running on contact is wrong on a fly ball. If the ball is caught, you are an easy double play — the outfielder throws to 3rd and you are out. You have to wait for the catch before going.","Going halfway is a common mistake. If the ball is caught, you cannot get back to 3rd fast enough. If the ball drops, you should score easily from 3rd anyway. Halfway helps nobody.","Staying on 3rd with 1 out wastes a great scoring chance. You are trailing by a run, and tag-up on a medium-deep fly is one of the safest ways to score. Playing it too safe here costs your team."],"rates":[88,15,30,50],"concept":"Tag-up fundamentals: on a fly ball with less than 2 outs, tag the base and run when the fielder catches it to advance or score.","anim":"score"}',
    '{"title":"Steal or Stay","diff":2,"description":"Top of the 4th, you are on 1st base with 1 out. Your team leads by 1 run. The pitcher has a slow move to home and the catcher has a weaker arm. The coach gives you the green light. What should you do?","situation":{"inning":"Top 4","outs":1,"count":"1-1","runners":[1],"score":[3,2]},"options":["Wait for the right pitch and go — read the pitcher\'s first move","Take off on the first pitch no matter what","Stay at first — do not risk it with a 1-run lead","Take a big lead and draw a pickoff throw"],"best":0,"explanations":["You have the green light, a slow pitcher, and a weak arm behind the plate. But smart baserunners pick their pitch — read the pitcher\'s first move to home, get a good jump, and go. Timing your jump is the difference between safe and out.","Going on the first pitch no matter what is reckless. What if it is a pitchout? What if the pitcher quick-slides? You need to read the situation, not just run blindly. A good steal is timed, not random.","Staying at first ignores all the advantages you have. The pitcher is slow, the catcher\'s arm is average, and your coach gave you the green light. Steals need about 72% success to break even, and you have great odds here.","Drawing a pickoff throw is a delay tactic, not a steal strategy. You already have the green light. Over-thinking it lets the pitcher get comfortable. Read his move, get your jump, and go."],"rates":[85,25,50,20],"concept":"Steal decision-making: read the pitcher\'s move, time your jump, and go when the situation favors you.","anim":"steal"}',
    '{"title":"Reading the Pitcher\'s First Move","diff":2,"description":"Bottom of the 6th, your team trails 3-4. You are on first base with 1 out and a 2-1 count on the batter. The pitcher has been slow to home plate all game — his delivery takes about 1.5 seconds. Your coach gave you the steal sign. You are watching the pitcher come set. What should the baserunner do?","situation":{"inning":"Bot 6","outs":1,"count":"2-1","runners":[1],"score":[3,4]},"options":["Take your normal lead and break for second the moment the pitcher lifts his front leg","Extend your lead to 14 feet and get a great jump by reading the pitcher\'s first move to home","Shorten your lead and hold — wait for a better count to steal","Take a walking lead and break late, hoping the catcher won\'t expect it"],"best":1,"explanations":["Breaking on the leg lift is too early — some pitchers lift and still throw over to first. With 1 out in the 6th and your team trailing by one, getting picked off would be devastating. You need to read his first move toward home, not just any movement.","With a 1.5-second delivery and the steal sign on, you have a great chance — but only if you read the pitcher correctly. Extend your lead to challenge him, then key on his first move toward home plate. In a 2-1 count, the pitcher is more likely to throw a fastball to avoid falling behind 3-1, which means a longer time to second. This is the highest-percentage steal technique.","Your coach gave you the steal sign — holding goes against the play call. In a one-run game in the 6th with 1 out, a steal of second puts you in scoring position where a single ties it. The 2-1 count favors this attempt because the pitcher will likely throw a fastball.","A walking lead looks clever but actually hurts your jump. The crossover step from a standard athletic stance gets you to top speed faster than a walking start. With a 1.5-second delivery, you have time — but only with a proper first step, not a shuffle."],"rates":[45,85,25,35],"concept":"Reading the pitcher\'s first move to home plate gives you the best stolen base jump because it confirms the pitch is coming, unlike guessing on leg lift alone.","anim":"steal"}'
  ],
  manager: [
    '{"title":"Third Time Through the Order","diff":3,"description":"Top of the 7th, your team leads 4-2. Your starter has 95 pitches and is facing the 3-hole hitter for the 3rd time. He gave up a double to this batter last time. The bullpen has a fresh reliever with a plus slider. What should the manager do?","situation":{"inning":"Top 7","outs":0,"count":"1-1","runners":[],"score":[4,2]},"options":["Let the starter face this batter, then go to the pen","Pull the starter and bring in the reliever","Leave the starter in — he has earned the chance to finish","Call for an intentional walk to set up the double play"],"best":1,"explanations":["Letting the starter face one more batter sounds like a compromise, but you already know the matchup is bad — he gave up a double last time. Why risk a lead-off baserunner in a 2-run game? The reliever is fresh and has the better weapon.","Data shows batters hit roughly .030 higher the third time through the order. Your starter already gave up a double to this hitter, and at 95 pitches fatigue compounds the TTO penalty. A fresh reliever with a plus slider gives you the best chance to protect a 2-run lead in the 7th.","Loyalty to the starter ignores the analytics. The TTO effect is real and well-documented. With a 2-run lead in the 7th, protecting the lead takes priority over rewarding effort. Your bullpen is rested.","An intentional walk with nobody on and 0 outs is almost never correct. You would be putting the leadoff runner on base for free, raising run expectancy from 0.50 to 0.88. That is giving away nearly half a run with no strategic benefit."],"rates":[50,82,30,15],"concept":"TTO effect and bullpen management: batters improve the third time through, making a fresh reliever the higher-percentage play in close games.","anim":"freeze"}',
    '{"title":"Infield In or Back","diff":2,"description":"Bottom of the 5th, runner on 3rd with 1 out. Your team leads 3-2. The batter is a contact hitter. Should you play the infield in or at normal depth?","situation":{"inning":"Bot 5","outs":1,"count":"1-1","runners":[3],"score":[3,2]},"options":["Play infield in to cut off the run at the plate","Play normal depth and concede the run on a grounder","Play halfway — split the difference","Bring the corners in and keep the middle back"],"best":2,"explanations":["Infield in cuts off the tying run but gives up a lot of range. Ground balls that would be outs at normal depth become hits. With 1 out in the 5th and only a 1-run lead, giving up hits to prevent one run is a bad tradeoff this early.","Playing normal depth concedes the run on any ground ball, tying the game. With a 1-run lead and a runner 90 feet away, you want SOME chance to get the runner at home. Completely giving up is too passive.","Halfway depth gives you a shot at the runner on a slow grounder while keeping enough range to field most ground balls. It is the best compromise in the 5th inning — you are not desperate enough for full infield in, but you want a chance.","Corners in and middle back creates a confusing alignment. Your infielders need to be on the same page. A hybrid setup like this leads to miscommunication and gaps in coverage."],"rates":[35,30,82,50],"concept":"Defensive positioning: infield depth depends on the inning, score, and how much you can afford to trade range for cutting off a run.","anim":"freeze"}',
    '{"title":"Steal Sign Decision","diff":2,"description":"Top of the 6th, runner on 1st with 0 outs. Your team trails 2-1. Your fastest runner is on base and the pitcher has a slow delivery. The cleanup hitter is at bat. Should you call for the steal?","situation":{"inning":"Top 6","outs":0,"count":"1-0","runners":[1],"score":[1,2]},"options":["Give the steal sign — your runner has the speed and the pitcher is slow","Hold the runner — let the cleanup hitter drive him in","Call for a hit-and-run to protect the runner","Call for a sacrifice bunt to move the runner to 2nd"],"best":0,"explanations":["Your fastest runner against a slow delivery is a high-percentage steal. Getting him to 2nd with 0 outs means a single scores the tying run. The cleanup hitter can still drive him in from 2nd, but now a single ties it instead of needing an extra-base hit.","Holding the runner is safe but passive. If the cleanup hitter grounds into a double play, you lose the runner and the momentum. Getting the runner to 2nd first eliminates the DP and puts pressure on the defense.","A hit-and-run is riskier than a straight steal here. If the batter misses, your runner is hung out to dry. With the pitcher\'s slow delivery, a clean steal is the higher-percentage play.","A sacrifice bunt with the cleanup hitter is wasting your best bat. You are giving up an out from your best hitter to move a runner 90 feet. The steal gets the same result without costing an out."],"rates":[82,50,35,15],"concept":"Steal strategy: when speed, pitcher delivery, and game situation all favor the steal, take the extra base without giving up an out.","anim":"steal"}',
    '{"title":"Third Time Through — Pull or Stay","diff":2,"description":"Top of the 7th, your team leads 5-3. Your starter has thrown 78 pitches and just gave up a double to lead off the inning. He has been strong — 6 innings, 3 runs — but this is his third time through the order and the last 2 batters hit the ball hard. Your best setup man is warm in the bullpen. The #4 hitter is up next. What should the manager do?","situation":{"inning":"Top 7","outs":0,"count":"1-1","runners":[2],"score":[5,3]},"options":["Leave the starter in — he has earned the right to pitch out of this jam","Make a mound visit to settle him down, then see how he handles the next batter","Pull the starter now and bring in the setup man with the runner on second","Have the starter intentionally walk the #4 hitter to set up a double play"],"best":2,"explanations":["Your starter has been great, but the data is clear: batters hit about 30 points higher the third time through the lineup. He just gave up a hard double to start the inning, and the previous two batters also hit the ball hard. Loyalty to a pitcher who earned it is one of the most common managerial mistakes — the game situation matters more than rewarding effort.","A mound visit buys time, but it does not fix the third-time-through-the-order effect. The #4 hitter has already seen your starter\'s best stuff twice. The mound visit delay might actually give the hitter more time to prepare. With a 2-run lead and nobody out, you cannot afford to let this inning snowball.","This is the textbook move. Your starter did his job — 6 strong innings. But three hard-hit balls signals his stuff is flattening out. The third-time-through-the-order penalty is real: batters see velocity and movement better each time. Bringing in the setup man with fresh stuff gives you the best chance to hold the 2-run lead with nobody out and a runner on second.","Intentionally walking the #4 hitter puts the go-ahead run on base with nobody out. Even if it sets up a double play, you are giving the other team a free baserunner. IBBs are almost always wrong — especially with no outs, where the DP does not end the inning."],"rates":[30,40,85,15],"concept":"Batters hit significantly better the third time through the order because they have adapted to the pitcher\'s stuff, so bringing in a reliever when hard contact starts is better than loyalty to the starter.","anim":"freeze"}'
  ]
}
function getAIFewShot(position, targetConcept = null, difficulty = 2) {
  // Concept-family mapping for matching few-shot examples to target concepts
  const CONCEPT_FAMILIES = {
    baserunning: ['steal-breakeven','steal-timing','lead-distance','tag-up','force-advance','baserunning-aggression','secondary-lead','force-vs-tag'],
    defense: ['cutoff-roles','relay-alignment','backup-responsibilities','dp-positioning','infield-positioning','of-depth-arm-value','relay-double-cut','fly-ball-priority','bunt-defense','holding-runners','double-play-turn'],
    pitching: ['pitch-selection','count-leverage','pitch-sequencing','pitch-location','first-pitch-strike','pickoff-mechanics','pitch-calling'],
    batting: ['count-hitting','situational-hitting','hit-and-run','bunt-strategy','sacrifice-situations','two-strike-approach'],
    management: ['bullpen-management','lineup-strategy','defensive-substitution','pinch-hit-timing','pitching-change','steal-window','first-third']
  }
  // Primary: position-matched few-shot pool
  const pool = ["pitcher","catcher"].includes(position) ? AI_FEW_SHOT_EXAMPLES.pitcher
    : ["firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"].includes(position) ? AI_FEW_SHOT_EXAMPLES.fielder
    : position === "batter" || position === "counts" ? AI_FEW_SHOT_EXAMPLES.batter
    : position === "baserunner" ? AI_FEW_SHOT_EXAMPLES.baserunner
    : AI_FEW_SHOT_EXAMPLES.manager
  if (!Array.isArray(pool) || pool.length === 0) return pool || ''
  // If targetConcept provided, try to find a concept-family match
  if (targetConcept) {
    const targetFamily = Object.entries(CONCEPT_FAMILIES).find(([, tags]) => tags.some(t => targetConcept.includes(t) || t.includes(targetConcept)))?.[0]
    if (targetFamily) {
      const familyKeywords = CONCEPT_FAMILIES[targetFamily]
      const matches = pool.filter(ex => {
        const lower = ex.toLowerCase()
        return familyKeywords.some(kw => lower.includes(kw.replace(/-/g, ' ')) || lower.includes(kw))
      })
      if (matches.length > 0) {
        const picked = matches[Math.floor(Math.random() * matches.length)]
        console.log("[BSM] Few-shot selected: concept-family match (" + targetFamily + ") for target:", targetConcept)
        return picked
      }
    }
  }
  // Fallback: random from position pool
  const picked = pool[Math.floor(Math.random() * pool.length)]
  console.log("[BSM] Few-shot selected: random for target:", targetConcept || "any")
  return picked
}

const AI_SCENARIO_TOPICS = {
  pitcher:"GOOD TOPICS: pitch selection by count/situation, pitching from stretch vs windup, pickoff moves, fielding a comebacker, covering 1B on grounder to right side, backing up home on OF throw, wild pitch coverage, pitch sequencing, working ahead in the count, varying hold times.",
  catcher:"GOOD TOPICS: calling pitches by count/batter, framing a borderline pitch, blocking a ball in the dirt, throwing out a runner stealing 2B, pop-up near home (turn back to field), directing the cutoff man, mound visit strategy, dropped third strike, first-and-third defense, pitch clock management.",
  firstBase:"GOOD TOPICS: scooping a low throw, holding a runner at 1B, charging a bunt (2B covers 1B), acting as cutoff on CF/RF throw home, 3-6-3 double play, fielding a grounder in the hole, force vs tag when runner is out ahead, stretch footwork on close play.",
  secondBase:"GOOD TOPICS: turning the DP pivot at 2B, relay on extra-base hit to RF/RF-CF gap, covering 1B on bunt, covering 2B on steal (vs LHB), fielding a grounder up the middle, positioning for DP vs normal depth, fly ball priority (let OF take tweeners).",
  shortstop:"GOOD TOPICS: turning the DP (feed to 2B), relay on extra-base hit to LF/LF-CF gap, cutoff on throws to 3B, covering 2B on steal (vs RHB), deep-hole play across the diamond, fly ball priority, communication as infield captain, positioning depth.",
  thirdBase:"GOOD TOPICS: charging a slow roller (bare-hand play), fielding a hard-hit ball down the line, guarding the line late/close, crashing on a bunt, tagging a runner at 3B, acting as cutoff on LF single to home, positioning against a pull hitter.",
  leftField:"GOOD TOPICS: tracking a fly ball near the wall, throwing to cutoff (3B) on a single, backing up 3B on grounders, playing a ball off the wall, reading ball off the bat, do-or-die throw, gap coverage in LF-CF gap, throwing to relay (SS) on extra-base hit.",
  centerField:"GOOD TOPICS: calling off corner OFs on a fly ball, gap coverage (LF-CF or RF-CF), do-or-die throw to cutoff (1B), backing up 2B on steals, reading ball off the bat, angle routes on gap balls, communication and positioning.",
  rightField:"GOOD TOPICS: throwing out a runner at 3B (strong arm), backing up 1B on infield grounders (most important routine job), fielding a fly ball near the wall, throwing to cutoff (1B) on a single, playing a ball off the RF wall, throwing to relay (2B) on extra-base hit, gap coverage RF-CF, deciding throw to 3B vs cutoff.",
  batter:"GOOD TOPICS: approach on hitter's vs pitcher's count, two-strike protect-the-plate, situational hitting with R3 (fly ball scores him), hit-and-run swing, hitting behind the runner, bunting decision (RE24), full count with 2 outs, first pitch aggressiveness.",
  baserunner:"GOOD TOPICS: steal attempt (read pitcher's first move), tag-up on fly ball, line drive freeze, secondary lead, delayed steal, first-to-third on single, scoring from 2nd on OF single, reading OF arm/route, rundown escape, lead distance.",
  manager:"GOOD TOPICS: pitching change (TTO effect, fatigue, matchup), defensive positioning, steal green light, sacrifice bunt (RE24), intentional walk decision, pinch hitter matchup, mound visit timing, bullpen management, first-and-third call.",
  famous:"GOOD TOPICS: recreate a real historic baseball moment with the actual decision faced.",
  rules:"GOOD TOPICS: force vs tag, infield fly rule, balk rule, dropped third strike, obstruction vs interference, pitch clock violations, shift ban, designated runner.",
  counts:"GOOD TOPICS: count-specific approach with real BA data, hitter's count aggressiveness, pitcher's count survival, full count decisions, 0-2 waste vs attack."
}

// Position\u2192domain mapping for concept filtering in AI prompts
const POS_CONCEPT_DOMAINS = {
  pitcher:["pitching","defense"],catcher:["defense","pitching","rules"],
  firstBase:["defense"],secondBase:["defense"],shortstop:["defense"],thirdBase:["defense"],
  leftField:["defense"],centerField:["defense"],rightField:["defense"],
  batter:["hitting","strategy"],baserunner:["baserunning"],
  manager:["strategy","pitching","defense","baserunning"],
  famous:null,rules:["rules"],counts:["pitching","hitting"]
}

// Slim knowledge map injection for AI — now uses SCOPED excerpts for OF/IF positions
const AI_MAP_PRIORITY = {
  pitcher:"CUTOFF_RELAY_MAP", catcher:"FIRST_THIRD_MAP", firstBase:"CUTOFF_RELAY_MAP",
  secondBase:"DP_POSITIONING_MAP", shortstop:"CUTOFF_RELAY_MAP", thirdBase:"BUNT_DEFENSE_MAP",
  leftField:"CUTOFF_RELAY_MAP", centerField:"OF_COMMUNICATION_MAP", rightField:"CUTOFF_RELAY_MAP",
  batter:"HIT_RUN_MAP", baserunner:"RUNDOWN_MAP", manager:"FIRST_THIRD_MAP",
  famous:null, rules:null, counts:null
}
// Rotation pools to avoid always injecting the same map (reduces runner/topic bias)
const AI_MAP_ROTATION = {
  catcher:["FIRST_THIRD_MAP","SQUEEZE_MAP","WP_PB_MAP","PICKOFF_MAP"],
  manager:["FIRST_THIRD_MAP","PITCHING_CHANGE_MAP","DP_POSITIONING_MAP","INTENTIONAL_WALK_MAP"]
}
// Position-scoped map excerpts — only include lines relevant to THIS position
const AI_SCOPED_MAPS = {
  rightField:`RF CUTOFF/RELAY (your role):
YOUR CUTOFF on throws home = 1B. Hit the 1B cutoff on singles.
YOUR RELAY on extra-base hits = 2B is lead relay on RF line / RF-CF gap. You throw to 2B who relays home.
BACK UP 1B on every infield grounder — your most important routine job.
On a single to RF with runner scoring: RF throws to 1B (cutoff), 1B decides cut/let go.
On extra-base hit down RF line: 2B is lead relay, SS or 1B trails. You throw to 2B.
NEVER: be the cutoff man yourself, throw directly home when cutoff is available (unless do-or-die).`,
  leftField:`LF CUTOFF/RELAY (your role):
YOUR CUTOFF on throws home = 3B. Hit the 3B cutoff on singles.
YOUR RELAY on extra-base hits = SS is lead relay on LF line / LF-CF gap. You throw to SS who relays home.
BACK UP 3B on all infield grounders.
On a single to LF with runner scoring: LF throws to 3B (cutoff), 3B decides cut/let go.
On extra-base hit down LF line: SS is lead relay, 2B trails. You throw to SS.`,
  centerField:`CF CUTOFF/RELAY (your role):
YOUR CUTOFF on throws home = 1B. Hit the 1B cutoff on singles.
On extra-base hit: SS relays left side, 2B relays right side.
BACK UP 2B on steal attempts and throws to second.
You have PRIORITY over all other fielders on fly balls.`,
  pitcher:`PITCHER BACKUP DUTIES (your role):
BACK UP HOME on ALL OF throws home. BACK UP 3B on OF throws to third.
Cover 1B on grounders to right side. Cover home on WP/PB.
NEVER: be the cutoff or relay man.`,
  firstBase:`1B CUTOFF DUTIES (your role):
YOU are the cutoff on CF and RF throws home. Line up between OF and home.
When you're cutoff, 2B covers 1B. On LF singles to home, 3B is cutoff (not you).
CATCHER CALLS: "Cut!"=hold. "Cut two!"=throw to 2B. "Cut three!"=throw to 3B. Silence=let it go.`,
  shortstop:`SS CUTOFF/RELAY (your role):
RELAY on extra-base hits LEFT side (LF line, LF-CF gap, deep CF) — you are lead relay.
CUTOFF on ALL throws to 3B (runner going 1st to 3rd from any OF).
Cover 3B when 3B goes out as cutoff. Cover 2B on steals (vs RHB).`,
}
// Concept-to-map relevance: inject only the one map that matters for this concept
const CONCEPT_MAP_MATCH = {
  'cutoff-roles': 'CUTOFF_RELAY_MAP', 'cutoff-alignment': 'CUTOFF_RELAY_MAP',
  'relay-double-cut': 'CUTOFF_RELAY_MAP',
  'bunt-defense': 'BUNT_DEFENSE_MAP', 'sacrifice-bunt': 'BUNT_DEFENSE_MAP',
  'first-third': 'FIRST_THIRD_MAP',
  'backup-duties': 'BACKUP_MAP',
  'rundown-mechanics': 'RUNDOWN_MAP',
  'double-play-turn': 'DP_POSITIONING_MAP', 'dp-positioning': 'DP_POSITIONING_MAP',
  'hit-and-run': 'HIT_RUN_MAP',
  'pickoff-mechanics': 'PICKOFF_MAP',
  'pitch-clock-strategy': 'PITCH_CLOCK_MAP',
  'wild-pitch-coverage': 'WP_PB_MAP',
  'squeeze-play': 'SQUEEZE_MAP',
  'infield-fly': 'INFIELD_FLY_MAP',
  'of-communication': 'OF_COMMUNICATION_MAP',
  'fly-ball-priority': 'POPUP_PRIORITY_MAP',
  'obstruction-interference': 'OBSTRUCTION_INTERFERENCE_MAP',
  'tag-up': 'TAGUP_SACRIFICE_FLY_MAP',
  'ibb-strategy': 'INTENTIONAL_WALK_MAP',
  'line-guarding': 'LEGAL_SHIFT_MAP',
  'secondary-lead': 'BASERUNNER_READS_MAP',
  'lead-distance': 'BASERUNNER_READS_MAP',
}

function getAIMap(position, targetConcept) {
  // If we have a target concept with a matching map, use ONLY that map
  if (targetConcept) {
    const conceptMapKey = CONCEPT_MAP_MATCH[targetConcept]
    if (conceptMapKey && KNOWLEDGE_MAPS[conceptMapKey]) return `KEY REFERENCE:\n${KNOWLEDGE_MAPS[conceptMapKey]}`
    // Concept has no relevant map — skip map injection entirely (less noise)
    return ""
  }
  // Fallback: no concept specified — use position-based selection (original behavior)
  if (AI_SCOPED_MAPS[position]) return `KEY REFERENCE:\n${AI_SCOPED_MAPS[position]}`
  const pool = AI_MAP_ROTATION[position]
  const key = pool ? pool[Math.floor(Math.random() * pool.length)] : AI_MAP_PRIORITY[position]
  return key && KNOWLEDGE_MAPS[key] ? `KEY REFERENCE:\n${KNOWLEDGE_MAPS[key]}` : ""
}

const KNOWLEDGE_MAPS = {
  CUTOFF_RELAY_MAP: `CUTOFF/RELAY ASSIGNMENTS (non-negotiable):
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
NEVER: Pitcher cuts the throw. Catcher goes out as cutoff. Relay man throws across runner's body.`,
  BUNT_DEFENSE_MAP: `BUNT DEFENSE ASSIGNMENTS (non-negotiable):
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
NEVER: SS covers 1st on a bunt. 2B covers 3rd with runners 1st & 2nd. Pitcher makes base-coverage calls — that is the catcher's job.`,
  FIRST_THIRD_MAP: `FIRST-AND-THIRD DEFENSE (non-negotiable):
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
KEY ASSIGNMENTS: 1B stays at 1B (holds R1, do not break toward 2B). P ducks immediately out of throwing lane. Never throw to 2nd if R3 has a big lead ("big lead" = R3 is more than 10 feet off the bag with <2 outs).
SCENARIO GENERATION RULE: If writing a first-and-third scenario for the catcher, you MUST specify R3's lead in the description. Large R3 lead → best answer is "hold" or "fake to third." Conservative R3 lead + elite arm → "throw through" may be correct. Unspecified R3 lead → "cut by middle IF" is the safest best answer. NEVER mark "throw through to second" as universally correct without specifying R3's lead.
NEVER: 1B breaks to cover 2B (leaves first unoccupied). P stays upright in throwing lane. Catcher throws blindly without reading R3 lead.`,
  BACKUP_MAP: `BACKUP RESPONSIBILITIES (non-negotiable):
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
NEVER: Two fielders sprint to the same backup spot. Any fielder stands still when a throw is in the air. Pitcher backs up home by stopping halfway down the line.`,
  RUNDOWN_MAP: `RUNDOWN PROCEDURE (non-negotiable):
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
RUNNER'S COUNTER-STRATEGY: Draw as many throws as possible — every throw is an error chance. Stop-start-stop to bait the pump fake. Try to reach a base during the rotation gap.`,
  DP_POSITIONING_MAP: `DOUBLE PLAY POSITIONING (non-negotiable):
DP DEPTH WHEN: Runner on 1st (or 1st & 2nd, or loaded), less than 2 outs. 3-4 steps toward 2B + half step toward home. Reduces range ~15% but speeds pivot.
NORMAL DEPTH WHEN: 2 outs (can't turn two — maximize range). No force at 2nd.
INFIELD IN WHEN: Runner on 3rd, less than 2 outs, run matters. Sacrifice range to throw home on grounders.
INFIELD IN vs DP DEPTH CONFLICT: With runners on 1st & 3rd, less than 2 outs — play DP depth. A DP ends the inning. Giving up the run while turning two is usually the right trade.
LOADED BASES DP: Force at every base. Infielders play DP depth. On a grounder, throw home for force, then first for the DP. Catcher must be alert for the flip to 1B.
LHB SHIFT (with shift ban): 2 infielders required on each side of 2B. SS shades toward 3B hole. 2B shades toward 1B-2B hole. Standard DP pivot still applies.
RHB DP ANGLE: 6-4-3 (SS to 2B to 1B) — SS needs a clean, firm feed. 2B pivot gets off the bag quickly.
LHB DP ANGLE: 5-4-3 (3B to 2B to 1B) or 4-6-3 (2B to SS to 1B). 3B must field cleanly and throw quickly. SS covers 2B on 4-6-3 pivot.
CRITICAL: With 2 outs, never play DP depth — there is NO double play possible. Maximize range for the single out.
NEVER: DP depth with 2 outs. Infield in with 2 outs and no R3. Play normal depth with runner on 1st and 0 outs — DP depth is the right call.`,
  HIT_RUN_MAP: `HIT-AND-RUN ASSIGNMENTS (non-negotiable):
BATTER: MUST swing at ANY pitch — protect the runner who is already running. Ground ball through vacated hole > power. Swing even at a ball in the dirt if necessary to protect the runner.
RUNNER: Go on the pitcher's FIRST MOVE. Do NOT look back. Read the ball off the bat only after 2nd base is reached.
WHO COVERS 2B: LHH → SS covers 2B (hole opens at SS side, batter aims there). RHH → 2B covers 2B (hole opens at 2B side, batter aims there).
BATTER MISSES THE SIGN (doesn't swing): Runner is hung out — no protection. Runner should abort if lead is not committed, or slide hard if already halfway.
BATTER SWINGS AND MISSES: Catcher fires to 2B immediately. Runner is caught in a vulnerable position. This is the biggest risk of the hit-and-run.
POP-UP ON HIT-AND-RUN: Runner may be doubled off if they don't freeze and read. NEVER run full speed on a line drive or pop-up — risk of double play is high.
PITCHOUT COUNTER: Defense throws a pitchout (outside pitch). C receives standing and fires to 2B. Pitcher should throw pitchout if hit-and-run is suspected on 1-0, 2-1, 3-1 counts.
PITCHER STRATEGY: Throw a pitch away from the batter's power zone. Pitchout, breaking ball in the dirt, or high fastball — all make the batter's job harder.
BEST HIT-AND-RUN COUNTS: 1-0, 2-0, 2-1, 3-1 — hitter's counts where batter is likely to see a strike and pitcher is less likely to pitchout.
NEVER: Runner looks back at the plate while running. Batter takes the pitch on a hit-and-run (unless sign is missed — see above). Hit-and-run with a slow runner or unreliable bat-to-ball hitter.`,
  PICKOFF_MAP: `PICKOFF MOVES & DECEPTION (non-negotiable):
RHP FROM STRETCH (to 1B): Step directly toward 1B AND throw in one motion. No step = balk. Step must be toward the base, not toward home.
LHP FROM STRETCH (to 1B): LHP faces 1B naturally from the stretch. Can throw to 1B at any time without restriction — this is the lefty's natural advantage. No step requirement toward 1B for LHP.
RHP/LHP TO 3B: Step directly toward 3B AND throw. Must be a genuine throw — no fake.
FAKE 3B/THROW 1B: ILLEGAL since 2013 (Rule 6.02(a)(4)). Always a balk. This play no longer exists in MLB.
STEP OFF RUBBER: Pitcher lifts back foot off rubber — becomes a fielder. Can throw anywhere, fake anywhere, no balk restriction. Step off is a legal "reset."
DAYLIGHT PLAY at 2B: SS or 2B breaks toward 2nd base FIRST. If daylight (gap) appears between the fielder and the runner, pitcher throws. Pitcher CANNOT initiate — he reacts to the fielder's break.
1B PICKOFF TIMING: After 2+ looks, change timing — throw early, throw late, step off instead. Predictable pickoff timing = zero deception.
PITCHOUT to STEAL: Pitcher throws outside by 2+ feet. Catcher steps to right side and fires. Costs a ball in count — use on 1-0, 2-0, 3-1 counts only.
PICKOFF TELLS (runner): Weight forward, big lean, exaggerated secondary lead — these are times to throw. Never throw to an empty base for no reason.
NEVER: Throw to an unoccupied base (balk). Fake to 1B from set without stepping off (balk). Fake 3B then throw 1B (balk — banned since 2013). Drop the ball while on the rubber (balk). See BALK_MAP for all 13 balk types.`,
  BALK_MAP: `BALK RULE — ALL 13 TYPES (non-negotiable per MLB Rule 6.02(a)):
WHY BALKS EXIST: The balk rule prevents pitchers from deceiving baserunners with fake or illegal motions. When a balk is called: ball is DEAD, ALL runners advance one base automatically, batter's count is unchanged.
CORE PRINCIPLE: Once a pitcher begins any motion, he must complete it legally. Any hesitation, fake, or illegal move a runner could misread = balk.
GROUP 1 — DELIVERY BALKS:
BALK 1 (Flinch): Starts pitching motion then stops. Runner committed to lead — stopping is pure deception.
BALK 2 (Quick Pitch): Delivers before batter is set. Illegal — danger to batter, deception of defense.
BALK 3 (Windup With Runner): Pitches from windup with a runner on base. MUST use set position with any runner on.
BALK 4 (Wrong Position): Not in contact with rubber when delivering. Illegal release point.
GROUP 2 — FOOTWORK BALKS:
BALK 5 (No Step): Throws to a base without stepping directly toward it. Step requirement ensures genuine pickoff.
BALK 6 (Wrong Step): Steps toward one base, throws to another. Direction of step must match direction of throw.
BALK 7 (Unoccupied Base): Steps toward and throws to a base with no runner. No play attempt = pure deception.
GROUP 3 — FAKE/THROW SEQUENCE BALKS:
BALK 8 (Fake to First From Set): RHP fakes a throw to 1B without stepping off rubber. ALWAYS a balk — must throw or step off.
BALK 9 (Fake 3B/Throw 1B): Fakes to third, throws to first. BANNED since 2013. Does not exist in baseball anymore.
BALK 10 (Throw to Unoccupied): Throws to base with no runner and no runner advancing. Deliberate delay.
GROUP 4 — SET POSITION BALKS:
BALK 11 (No Stop): Does not come to a complete discernible stop in set position. The stop is the runner's read — skipping it = deception.
BALK 12 (Drop Ball): Drops ball while in contact with rubber. Ball is live on ground — runners can advance — chaos = illegal.
BALK 13 (No Catcher): Delivers pitch while catcher is not in the catcher's box.
LEGAL ALWAYS: Step off the rubber (back foot clears) → you are a fielder, zero balk rules apply. Throw anywhere, fake anywhere after stepping off. Vary timing at set position (1 second or 5 seconds — both legal as long as you STOP completely).
ILLEGAL ALWAYS: Fake to 1B from set without stepping off. Fake 3B then throw 1B (banned 2013). Start pitching motion and stop. Pitch while catcher is outside the box.
STEP-OFF RESET: When in doubt, step off. Back foot clears rubber = fielder. Never improvise a move from the rubber.
PITCH CLOCK INTERSECTION: With 2 disengagements used, a 3rd step-off = balk UNLESS the runner is picked off. Step-offs count as disengagements.`,
  APPEAL_PLAY_MAP: `APPEAL PLAYS (non-negotiable per MLB Rule 5.09(c)):
WHY APPEALS EXIST: The defense must EARN their outs. Umpires do NOT automatically call missed bases or early tag-ups — the defense must recognize the violation and formally appeal. If no appeal is made before the next pitch, the infraction is forgiven.
APPEAL WINDOW: Defense must appeal BEFORE the next pitch is thrown to any batter. At inning end: before all fielders and the pitcher leave fair territory. Window closes permanently after that.
APPEAL TYPE 1 — MISSING A BASE:
WHEN: Runner's foot does not contact a base while advancing OR while returning.
HOW TO APPEAL: Pitcher steps off rubber → throws to the missed base → fielder catches at base.
Tag the BASE if runner has passed it. Tag the RUNNER if runner is still between bases.
Any base can be appealed, any runner, in any order.
Result: Runner called out.
APPEAL TYPE 2 — LEAVING EARLY ON TAG-UP:
WHEN: Runner leaves their base before the fielder's glove contacts the fly ball.
HOW TO APPEAL: Throw to the base the runner LEFT FROM — not the base they advanced to.
Example: Runner on 2B tags up to 3B but left early → appeal at SECOND BASE.
Result: Runner called out. If this is the 3rd out, see TIME PLAY below.
APPEAL TYPE 3 — BATTING OUT OF ORDER:
WHEN: A batter bats in a different position than listed on the official lineup card.
WHO IS OUT: The PROPER BATTER (who should have batted) is called out — not the batter who actually batted.
All runners who advanced on the out-of-order at-bat return to original bases.
Appeal window: before the next pitch is delivered after the out-of-order at-bat.
After appeal: next legal batter is whoever follows the called-out proper batter in the lineup.
If no appeal before next pitch: the out-of-order at-bat stands as legal.
TIME PLAY — DOES THE RUN COUNT?:
Run does NOT count if the 3rd out is: (a) a force play, (b) an appeal play, or (c) batter-runner put out before reaching 1B.
Run DOES count if: the runner scored BEFORE the 3rd out was recorded AND the 3rd out was NOT a force or appeal.
Test: Did the run cross the plate before the out? Was the out a force/appeal? If yes to both — run is erased.
HOW TO MAKE A LEGAL APPEAL:
Step 1: Ball must be live (if time was called, put ball in play first).
Step 2: Pitcher steps off the rubber (removes balk restrictions).
Step 3: Throw to the appropriate base.
Step 4: Fielder receives at base — umpire rules.
INVALIDATED APPEALS: Wrong base thrown to. Next pitch thrown before appeal. Ball not live when appeal attempted. All fielders left fair territory (inning end — permanent close).
RUNNER OBLIGATIONS — TOUCH EVERY BASE:
Touch each base deliberately with your foot. Missing a base is always appealable — even on home runs.
Return path: re-touch bases in REVERSE ORDER when going back (3B → 2B → 1B).
Tag-up: leave ONLY when fielder's glove contacts the ball — not before, not after.
Home plate: must be touched to score. Missing home is appealable — the run is erased until corrected.
NEVER celebrate early on a home run. Touch all four bases deliberately. One missed base = one appealable out.
NEVER: Assume a missed base will go unnoticed. Skip a base while rounding on an extra-base hit. Leave the base before the catch on a tag-up. Let the window close without appealing a clear violation.`,
  PITCH_CLOCK_MAP: `PITCH CLOCK STRATEGY (non-negotiable per 2023 MLB Rules):
PITCHER CLOCK: 15 seconds with bases empty. 20 seconds with runners on. Violation = automatic BALL added to count.
BATTER CLOCK: Must be alert in batter's box with 8 seconds remaining. 1 timeout per PA. Violation = automatic STRIKE added to count.
DISENGAGEMENTS: Pitcher gets 2 disengagements (pickoffs or step-offs) per batter. 3rd disengagement = balk UNLESS runner is picked off. Successful pickoff resets the count.
CATCHER VISIT: Catcher can visit the mound once per inning without it counting as a team mound visit. Clock resets after the visit ends.
MOUND VISIT CLOCK RESET: Any mound visit (catcher or coach) resets the pitch clock. Infield meetings do NOT reset it.
VARY TEMPO: Quick-pitch after a long hold disrupts the batter's timing more than a constant pace. Mix up 6-second deliveries with 18-second deliveries in the same at-bat.
HIGH-LEVERAGE DELIVERY: Use the full 20 seconds on 0-2 or full count with runners on. Make the hitter uncomfortable. Never rush a high-leverage pitch.
STEAL READS: The clock makes delivery windows MORE predictable — runners can time the pitcher more easily. Pitchers must vary tempo and add disengagements to compensate.
SIGN DELIVERY: Catcher must deliver signs efficiently. Pitcher should receive signs and be set within 9 seconds of catcher's return to setup. Slow sign sequences cost clock time.
NEVER: Rush a pitch to beat the clock on a 0-2 or full count. Use all 3 disengagements without a genuine read — the balk risk on the 3rd is too high. Ignore the clock until there are 3 seconds left.`,
  WP_PB_MAP: `WILD PITCH / PASSED BALL COVERAGE (non-negotiable):
CATCHER: Go to the BALL first — never look at the runner first. Field the ball, then look, then throw. Quick glance to read runner location is allowed only after the ball is secured.
PITCHER: Sprint to cover HOME PLATE the instant the ball passes the catcher. Set up on the FIRST-BASE SIDE of the plate to give the catcher a throwing lane for any return throw.
BASES EMPTY: No coverage needed at home — pitcher covers home as routine. Catcher retrieves and returns the ball.
RUNNER ON 1ST ONLY: Runner may go to 2nd. Pitcher covers home. CF backs up 2B. SS covers 2B. Catcher retrieves and fires to 2B only if ball is in front.
RUNNER ON 2ND ONLY: Runner may go to 3rd. 3B holds at bag. Pitcher covers home. LF backs up 3B. Catcher retrieves — do NOT throw to 3B unless ball is directly in front and throw is easy.
RUNNER ON 3RD: Runner will break for home. Catcher fields ball and tags runner at plate OR returns to plate for pitcher's tag. Pitcher must reach plate before runner. 3B backs up home on extended wild pitches.
MULTIPLE RUNNERS: Catcher reads LEAD runner. Sprint assignment is the same — pitcher to home, OF backups to their bases.
2-OUT VARIANT: With 2 outs, runner goes on anything. Same coverage assignments — pitcher must still sprint home, not hesitate.
BASES LOADED: Catcher fields and steps on home for force out. Pitcher sprints home anyway as backup.
NEVER: Catcher looks at runner before fielding the ball. Pitcher remains on mound when ball passes catcher. Third baseman abandons 3B to chase a wild pitch with runner on 2nd.`,
  SQUEEZE_MAP: `SQUEEZE PLAY (non-negotiable):
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
NEVER: Suicide squeeze with 2 strikes. Suicide squeeze with a slow runner. Send R2 home on a squeeze — only R3 scores.`,
  INFIELD_FLY_MAP: `INFIELD FLY RULE (non-negotiable — MLB Rule 5.09(b)(6)):
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
NEVER: Assume runners are forced to advance on an IFF. Assume a dropped IFF ball starts a force play. Call an IFF on a line drive or bunt pop-up.`,
  OF_COMMUNICATION_MAP: `OUTFIELD COMMUNICATION & POSITIONING (non-negotiable):
CF HAS PRIORITY: Over ALL players on any ball CF can reach — corner OF and all infielders. His call is final and absolute. No exceptions.
CORNER OF PRIORITY: LF and RF have priority over nearest infielders (LF > 3B and SS; RF > 1B and 2B) on any ball they can reach coming in.
CALL SYSTEM: "I got it! I got it!" — loud, early, twice minimum. First call claims the ball. Everyone else peels off immediately and backs up the throw angle.
GAP BALLS (LF-CF or RF-CF): CF calls if he can reach. If not, the nearest corner OF calls and takes it. Middle infielder (SS or 2B) goes to relay position immediately.
COLLISION ZONE: When two OFs converge, the one who calls FIRST owns the ball. Late caller must peel off. NEVER a late call after another fielder has already called it.
FOUL TERRITORY POP-UPS: Nearest fielder calls it. OF has priority over infielder in foul territory — the ball is moving away from the infielder and toward the outfielder. C and 1B/3B defer to OF if OF can reach.
TWO-OF CONVERGENCE: If both corner OFs converge on a ball in LF-CF or RF-CF gap, CF has priority. Corner OF calls "YOU! YOU!" to wave CF off only if CF clearly cannot reach and corner OF can.
SUN BALLS: Glove shield PRIMARY, sunglasses SUPPLEMENTARY. Keep eyes on the ball at all times — never look directly into sun. Call for sun ball help from teammates.
WALL PLAY: Find the warning track (texture change) with feet — never take eyes off the ball to find the wall. Use the wall with the glove hand, not the throwing hand.
PRE-PITCH ADJUSTMENTS: Shade toward pull side for known pull hitters.
WIND OUT (10+ mph): Play 7-15 feet deeper — fly balls carry significantly farther. Pitcher should work down in the zone. WIND IN (10+ mph): Play 5-10 feet shallower — fly balls die. WIND ACROSS (15+ mph): Shade toward where the wind carries fly balls — watch the flags. WIND UNDER 5 MPH: No adjustment needed. PRE-INNING: CF calls out wind direction and speed to corner OFs before every inning — required, not optional. See PARK_ENVIRONMENT_MAP for full context.
NEVER: Allow a no-call fly ball between two fielders. Call off CF after he has already called the ball. Take eyes off a fly ball to find the wall with your eyes.`,
  PARK_ENVIRONMENT_MAP: `PARK & ENVIRONMENT ADJUSTMENTS (Tier 4 — situational modifiers, never override Tier 1-3 rules):
SOURCE: Baseball Reference park factors 2021-2023, Statcast environmental data, ABCA coaching consensus.
PARK FACTOR BASICS: Park factor 100 = neutral. Above 100 = hitter-friendly. Below 100 = pitcher-friendly. Hitter parks (>105, e.g. Coors ~120): RE24 higher across all states — every baserunner more dangerous. Pitcher parks (<95, e.g. Petco ~95): every run harder to score — steals and small ball gain relative value. NEVER: Use park factor to justify a play that is wrong by RE24 in a neutral park. Park factors adjust the margin, not the decision.
WIND OUT (10+ mph): OF plays 7-15 feet deeper. Pitcher works DOWN in the zone — elevated pitches carry. Hitters should look to elevate. WIND IN (10+ mph): OF plays 5-10 feet shallower. Pitcher can work up in zone — fly balls die. Running game slightly more valuable. WIND ACROSS (15+ mph): Breaking ball movement affected — LHP break amplified by L→R wind, reduced by R→L. Watch the flags. WIND UNDER 5 MPH: No adjustment. PRE-INNING: CF calls out wind direction and speed to corner OFs before every inning — required habit.
SURFACE — TURF: Grounders travel 15-20% faster than grass. Infield plays 1-2 steps DEEPER. Bunt defense charges EARLIER — less reaction time. OF plays 2-3 steps deeper for gap roll. SURFACE — GRASS: Standard positioning. No adjustment from baseline.
TEMPERATURE — COLD (<50F): Ball carries ~6% less. OF can shade slightly shallower. Breaking ball grip is harder — pitcher may go more fastball-heavy. TEMPERATURE — HEAT (>85F): Ball carries slightly farther. Pitcher fatigue accelerates — pitch count thresholds matter earlier. ALTITUDE (Coors/Denver): Ball carries ~10% farther. Breaking balls lose ~15% movement (thinner air = less spin drag). OF plays 10-15 feet deeper. Pitcher relies on fastball command over breaking ball movement. HUMIDITY: NO meaningful effect on ball flight — common myth, do not adjust.
SUN DIRECTLY IN FLIGHT PATH: Glove shield PRIMARY, sunglasses supplementary. Eyes always on the ball. NEVER look directly at the sun. SUN BEHIND FIELDER: Step to the side before the pitch so sun is not in the tracking path. PRE-GAME: Identify sun field position before the game. Communicate to teammates.
QUICK CHECKLIST (pre-game): (1) Wind speed/direction, (2) Surface type, (3) Temperature, (4) Sun field position, (5) Park factor category. Communicate to team before first pitch.`,
  LEVEL_ADJUSTMENTS_MAP: `LEVEL & AGE ADJUSTMENTS (non-negotiable for scenario generation):
CRITICAL RULE: Every scenario must be appropriate for the player's level. MLB-optimal strategy is NOT always youth-optimal. Strategy thresholds shift with the skill level of the players involved.
LEVEL 1 — T-BALL / COACH PITCH (ages 5-8): No stealing. No leads. Focus: contact, running, basic fielding. Scenarios: simple cause-effect only. Never use stats or advanced terms.
LEVEL 2 — KID PITCH (ages 8-11): Steal break-even ~50% — catchers rarely throw out runners, stealing is almost always correct. No-lead rule applies in most leagues — steals happen on passed balls and wild pitches only. Bunt effectiveness: very high — fielders can't reliably handle bunts. Any steal scenario must include: "Note: In many youth leagues, you cannot leave the base until the pitch crosses home plate."
LEVEL 3 — TRAVEL / MIDDLE SCHOOL (ages 11-14): Steal break-even ~60% — lower than MLB because you catchers still developing. Bunt can be RE-positive at this level — fielders less reliable at charging and throwing. Leads typically legal in travel ball. Introduce RE24 conceptually.
LEVEL 4 — HIGH SCHOOL NFHS (ages 14-18): Steal break-even ~65% — between youth and MLB. Bunt closer to MLB RE24 cost but margin is smaller. Full strategy vocabulary appropriate.
LEVEL 5 — MLB / ADVANCED: Steal break-even 72% (post-pitch-clock standard). Bunt almost always costs RE. Full analytical vocabulary. All BRAIN.stats thresholds apply directly.
VOCABULARY BY AGE: Ages 6-8: plain English only, no stats. Ages 9-11: batting average and stolen base % OK. Ages 12-14: introduce RE24 by name with explanation. Ages 15-18: full statistical vocabulary. Never use RE24/wOBA/LI/FIP with younger players without explanation.
STEAL BREAK-EVEN QUICK REFERENCE: T-ball: N/A. Youth (8-11): 50%. Travel/Middle (11-14): 60%. High school (14-18): 65%. MLB: 72%.
BUNT QUICK REFERENCE: T-ball/Youth: very high value. Middle school: high value. High school: moderate. MLB: usually costs RE.`,
  POPUP_PRIORITY_MAP: `POP-UP PRIORITY & MECHANICS (non-negotiable):
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
NEVER: Catcher looks at home plate while tracking a pop-up. Fielder moves in front of another who has already called it. Two fielders watch a pop-up drop uncalled.`,
  OBSTRUCTION_INTERFERENCE_MAP: `OBSTRUCTION & INTERFERENCE (non-negotiable — MLB Rules 6.01 & 6.03):
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
GROUND RULE DOUBLES (non-negotiable per MLB Rule 5.05(a)(8)):
AUTOMATIC DOUBLE: Ball bounces into the stands in fair territory, gets lodged in the outfield fence/ivy, or is touched by a spectator reaching over the fence before the fielder touches it.
RUNNER ADVANCEMENT: ALL runners advance exactly TWO BASES from their position at the TIME OF PITCH — not from where they were when the ball left the field.
EXAMPLE: Runner on 1B when pitch is thrown. Ball bounces into stands. Runner goes to 3B (1B + 2 bases). Batter goes to 2B.
FAN INTERFERENCE: Fan reaches OVER the fence into fair territory and touches a catchable ball = umpire awards what would have happened (usually a home run). Reviewable. Fan touching a ball already past the fence = no interference.
NEVER: Advance runners from where they were when the ball went out — always count from time of pitch. Award more than 2 bases on a bounced ground rule double.
CATCHER INTERFERENCE (MLB Rule 6.03(a)(3)): When the catcher's mitt contacts the batter's swing, the ball is dead immediately. The batter is awarded FIRST BASE. All runners who are FORCED advance one base. CHOICE RULE: If a run scores on the play AND the batter reaches base safely, the offensive manager may choose to ACCEPT the play result instead of the interference call — always take whichever outcome scores more runs. Example: Runner on 3B, catcher interference occurs, but batter hits a sac fly and the run scores anyway — manager takes the run, not the interference award.
NEVER: Ignore the choice rule when a run scores on a catcher interference play. Assume all runners advance — only FORCED runners advance automatically.
NEVER: A fielder without the ball blocks the base path (obstruction). A runner intentionally contacts a fielder to break up a play (interference). Confuse which player is at fault.`,
  TAGUP_SACRIFICE_FLY_MAP: `TAG-UP & SACRIFICE FLY (non-negotiable):
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
NEVER: Leave before the catch — early departure is an APPEALABLE OUT. Defense throws to the base you LEFT FROM (not where you advanced to) to make the appeal. If this creates the 3rd out, any run that scored on the same play is erased (time play). Touch every base deliberately — missed bases are also appealable even after you've scored. Look at the ball in flight instead of watching the fielder's glove. Throw at the runner instead of the base.`,
  PITCHING_CHANGE_MAP: `PITCHING CHANGE MECHANICS (non-negotiable):
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
  A pitcher removed from the game can return as a position player ONLY if no pitching change has been made yet (extremely rare).
NEVER: A second mound visit to the same pitcher in the same inning without removing him. Bringing in a reliever who faces fewer than 3 batters (unless injury). Catcher warming up the new pitcher with the wrong hand.`,
  INTENTIONAL_WALK_MAP: `INTENTIONAL WALK (non-negotiable):
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
  Intentional walk to the #8 hitter to face the pitcher — pitcher's batting era is over (universal DH).
  Early in the game (1st-5th inning) — too many plate appearances remain for the extra baserunner to cause damage.
POSITIONING DURING IBB:
  All fielders maintain their defensive positions while the manager signals.
  No fielder moves until the umpire declares "Ball Four" and the batter takes first.
  Catcher does not receive pitches — he signals confirmation back to the manager.
RUNNERS ADVANCE:
  On an IBB, any runner forced by the batter's advancement automatically advances one base.
  Example: R1 and R2 — IBB fills the bases. R1 goes to 2B, R2 goes to 3B.
  No runner advances beyond one base on an IBB (they are not forced to advance two bases).
NEVER: IBB with bases loaded. IBB early in the game to a non-dominant hitter. Assume IBB is "safe" — it always costs run expectancy.`,
  LEGAL_SHIFT_MAP: `DEFENSIVE POSITIONING — SHIFT ERA & SHIFT BAN (non-negotiable):
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
NEVER: 3 infielders on one side of 2B at time of pitch (illegal shift). Outfielder playing in infield depth in normal defensive alignment. Positioning any player so that a legal shift violation occurs.`,
  BASERUNNER_READS_MAP: `BASERUNNER READS & SITUATIONAL RUNNING (non-negotiable):
RHP PICKOFF TELLS (runner at 1B): Watch the FRONT HEEL. If front heel lifts up = going home (take your secondary). If front heel kicks toward 1B = pickoff attempt (dive back). The move starts at the foot, not the hands.
LHP PICKOFF TELLS (runner at 1B): Watch the FRONT KNEE. Knee lifts and moves toward home = pitch (go on steal). Knee lifts and stays or goes toward 1B = pickoff (get back). LHP faces 1B naturally — harder to read.
CATCHER RELEASE READS: Watch the catcher's transfer speed. Slow transfer = steal-friendly. Quick pop-up throw = elite arm, respect it. Pop time under 1.9s = very tough to steal on.
LEAD MECHANICS: Take your lead in foul territory (avoids being hit by batted ball). Crossover step back to bag on pickoff. Primary lead = 2-3 body lengths. Secondary lead = 2 shuffle steps on the pitch, then read.
DOUBLE STEAL (R1 + R2 simultaneous):
  VERSION A (EARLY): R1 breaks for 2B on the pitch. The instant catcher commits the throw to 2B, R2 breaks for home. R2 reads the CATCHER — not R1's break. Half-second early = thrown out at home.
  VERSION B (DELAYED): Both runners wait for catcher's return throw to pitcher. When pitcher's hand closes on the ball, BOTH break simultaneously. Works vs. pitchers who catch and relax.
  GREEN LIGHT: 0-1 outs, average or slow catcher, run is critical. ABORT: 2 outs and big lead, elite catcher pop time, pitchout suspected.
DELAYED STEAL (2B only):
  TRIGGER: Catcher's return throw to pitcher is in the air AND both SS and 2B are drifting off the bag.
  BREAK POINT: The instant the pitcher's hand closes on the ball — not on the pitch.
  READ FIRST: Identify which infielder is covering 2B before breaking. If both are clearly away = go. If one is hovering = abort.
  WHEN NOT TO USE: Alert pitcher who looks at runners on every return. 2 outs. Best hitter at plate.
FIRST TO THIRD ON A SINGLE:
  GO SITUATIONS: Ball to RF corner, RF-CF gap, ball hit behind the runner, OF misplays.
  HOLD SITUATIONS: Shallow RF, ball directly at RF (clean fielding angle toward 3B), LF single (long run, throw tracks you).
  TECHNIQUE: Make the read at 1st base. Round 2nd at full speed. At 2B, read the OF route — if OF turns body to field = GO. If OF fields cleanly facing 3B = read the throw, respect coach.
  Never round second and stop flat-footed — commit or hold. Data: 28% MLB average, 45% elite runners (Statcast 2021-2024).
SCORING FROM SECOND ON A SINGLE:
  DEFAULT: GO on any outfield single with 0-1 outs. 62% MLB score rate makes this almost always correct.
  HOLD ONLY: Shallow LF with strong LF arm. LF single when R3 is also running (traffic jam risk).
  2-OUT RULE: ALWAYS go on contact with 2 outs — the out ends the inning regardless.
  Data: 62% overall, 85% on deep gap single, 30% on shallow single (Statcast 2021-2024).
RUNDOWN ESCAPE:
  GOAL: Stay alive long enough for advancing runners to reach safety.
  TECHNIQUE: Run TOWARD the fielder with the ball to force the throw. Change direction only when fielder commits to throw.
  NEVER run toward a base already occupied by another runner — trail runner retreats, lead runner has priority.
  SURRENDER WHEN: 2 outs. You are the trail runner in a 2-runner rundown.
  If you must be out: get tagged as close to the FORWARD base as possible.
THIRD BASE READS:
  DO-OR-DIE (2 outs): Run on ANY contact that hits the ground. The out ends the inning — you have nothing to lose.
  TAG-UP GO: Deep fly (always), medium fly (88% MLB score rate), shallow fly (only if OF sprinting hard and off-balance).
  TAG-UP HOLD: Short popup, line drive caught (freeze — double play risk).
  3RD OUT RULE (<2 outs): NEVER make the 3rd out at home on a close play with less than 2 outs. Exception: final inning, you are the tying or winning run, coach sends you.
  COACH READS: Windmill = go full speed. Stop sign = stop at 3rd. Act early — never look for the coach at the last second.
NEVER: Guess on a LHP pickoff — always read the knee break. Round second flat-footed on a single. Make the 3rd out at home with less than 2 outs. Run toward an occupied base in a rundown. Ignore the coach's stop sign.`,
  LINEUP_CONSTRUCTION_MAP: `LINEUP CONSTRUCTION & BATTING ORDER STRATEGY (non-negotiable):
LEADOFF (#1): High OBP (.300+ minimum), speed (15+ SB), sees pitches, works deep counts. Goal: get on base for run producers behind him. Not necessarily the fastest — OBP is king.
#2 HITTER: Bat control, hit-and-run ability, can advance runners with contact. Often a good bunter. Bridges the table-setters and run producers.
#3 HITTER: Best overall hitter on the team (highest OPS). Most consistent, handles all pitch types. Gets the most at-bats with runners on in the first time through.
#4 CLEANUP: Power hitter, drives in runs, HR threat. Classic RBI man. Gets at-bats with runners on from 1-2-3 reaching base. Willing to sacrifice average for power.
#5 HITTER: Secondary power, RBI opportunities. Often a lefty if #4 is a righty (or vice versa) to prevent platoon matchups. Protection for the cleanup hitter.
#6-7 HITTERS: Capable but weaker hitters. Still expected to produce situationally — move runners, sac flies, clutch at-bats. Often where young or developing players hit.
#8 HITTER: In NL (pitcher bats 9th), this is the weakest position player. In AL/universal DH, this is the second-weakest hitter.
#9 HITTER: In NL = pitcher (weakest hitter, accept the out). In AL = often a fast, scrappy "second leadoff" hitter who gets on base for the top of the order.
PLATOON CONSIDERATIONS: Alternate L/R hitters through the lineup when possible to prevent the opposing manager from gaining matchup advantages with bullpen changes. Back-to-back same-handed hitters = platoon vulnerability.
DOUBLE SWITCH MECHANICS: When making a pitching change, swap the new pitcher into a batting slot that is NOT due up soon. The position player whose slot is due up moves to the pitcher's old defensive position. This avoids having the pitcher bat in a critical spot.
LINEUP PROTECTION: A strong hitter behind the current batter forces pitchers to attack the zone. Weak hitters behind a star = more walks to the star. Arrange lineup to maximize protection.
NEVER: Bat your best hitter leadoff just because he's fast — OPS matters more than speed for #3/#4. Put back-to-back weak hitters together if avoidable. Ignore platoon splits when constructing the order. Use the same lineup against LHP and RHP starters without considering matchups.`,
  COMMUNICATION_PROTOCOL_MAP: `TEAM COMMUNICATION SYSTEMS (non-negotiable):
VERBAL CALLS — OUTFIELD: "I got it!" (called twice minimum, loudly). "You! You! You!" (deferring to teammate). "Mine!" (quick alternative). "Back! Back!" (warning teammate of wall). First caller owns the ball — no exceptions.
VERBAL CALLS — INFIELD: "Hey batter batter!" (keeping energy up). "Two outs!" (situation awareness). "Nobody on!" (clearing runners status). "Watch the bunt!" (defensive alert). "Ball! Ball!" (locating pop-ups for catcher).
CATCHER-PITCHER SIGNS — BASIC (no runners on 2B): 1 finger = fastball. 2 fingers = curveball. 3 fingers = slider. 4 fingers = changeup. Wiggle fingers = pitchout. Fist = intentional ball. Location shown by glove target position.
CATCHER-PITCHER SIGNS — INDICATOR SYSTEM (runners on 2B can see signs): Use an indicator (e.g., indicator = 2). Flash a sequence of signs — the FIRST sign AFTER the indicator is the real pitch. Example: 3-2-1-4 with indicator 2 = the pitch is 1 (fastball). Change indicator between innings.
COACH SIGNS — TOUCH SEQUENCE: Coach touches a series of body parts. An indicator sign (e.g., belt) activates the sequence — the first touch AFTER the indicator is the real sign. All other touches are decoys.
COMMON COACH SIGNS: Steal = right ear. Bunt = left arm across chest. Hit-and-run = nose. Take (don't swing) = cap. These vary by team — learn YOUR team's signs every season.
BASERUNNER-TO-COACH: Point at the base you intend to advance to. Look for the coach's stop sign (hands up) or go signal (windmill arm). ALWAYS check the 3B coach rounding second.
PRE-PITCH INFIELD COMMUNICATION: Infielders flash fingers behind glove to signal who covers 2B on a steal attempt. Usually: 2B flashes open glove = "I've got it." SS flashes open glove = "I've got it." Closed fist = "You take it."
EMERGENCY CALLS: "Cut!" = cutoff man catches the throw and holds. "Cut two!" = redirect throw to 2B. "Cut three!" = redirect to 3B. "Let it go!" = throw goes through to target base. "Get back!" = pickoff attempt, runner return to base.
DUGOUT COMMUNICATION: On-deck hitter tells runner at 3B whether to slide or stand ("Down! Down!" = slide, "Stand up!" = no play at home). Bench calls out pitch count, outs, and defensive alignment.
NEVER: Let a fly ball drop uncalled — someone MUST call for every ball. Ignore a teammate's call and take the ball anyway. Use signs without confirming your team's indicator system. Forget to check the 3B coach when rounding second.`,
  SLIDE_TECHNIQUE_MAP: `SLIDING TECHNIQUES & DECISION FRAMEWORK (non-negotiable):
FEET-FIRST SLIDE (standard): Safest slide, taught first (age 8+). Tuck one leg under the other in a figure-4 shape. Bottom of the extended foot hits the base. Hands up to avoid jamming fingers. Keep chin tucked to chest.
POP-UP SLIDE: Start as a feet-first slide but spring up to standing position upon contact with the base. Used when you may need to advance on an overthrow or error. Momentum carries you upright — practice the timing of the spring.
HOOK SLIDE: Angle your body to one side of the base to avoid the tag. Reach the base with your hand or foot on the FAR side from the fielder. Used on tag plays where the throw beats you — make the fielder reach across to tag. Pick the side AWAY from where the throw is coming.
HEAD-FIRST SLIDE: Fastest way to reach the base — hands arrive before feet would. But RISKIEST — finger, hand, wrist, and head injuries common. Banned in many youth leagues (ages 12 and under). In MLB, used by elite baserunners who practice it extensively. Never attempt without proper training.
WHEN TO SLIDE: Tag plays at 2B, 3B, and home (force the fielder to apply a tag). Close plays where you might overrun the base (except 1B). Avoiding a collision with a fielder at any base.
WHEN NOT TO SLIDE: Running through 1B — always run through first base on a ground ball (faster than sliding). Passed ball or wild pitch at home — you can run through home plate, no need to slide unless a play is developing. When the play is clearly not close (save your body).
COLLISION RULES — BUSTER POSEY RULE (2014+): Runners MUST slide or attempt to avoid the catcher at home plate. Deliberate collision with the catcher = runner is out, and may be ejected. Catcher must give the runner a lane to the plate unless he has the ball. Violation by catcher = obstruction (runner is safe).
BREAKUP SLIDE AT 2B: On a double play attempt, the runner sliding into 2B must be within reach of the base. Cannot target the fielder's legs or go out of the base path. Illegal slide = runner AND batter-runner are both out (interference). Legal breakup: slide within arm's reach of the base and make incidental contact.
DECISION FRAMEWORK: Tag play = always slide (force the tag). Force play = slide or run through (sliding can slow you down on a force). Home plate = slide or avoid (Buster Posey rule). First base = run through (never slide into 1B on a ground ball — it is SLOWER).
NEVER: Slide head-first into home plate when the catcher has the ball (injury risk). Slide into first base on a routine ground ball. Go out of the base path to break up a double play. Slide with your hands down (jam fingers). Forget to practice slides before using them in a game.`,
  FIELD_CONDITIONS_MAP: `FIELD CONDITIONS & WEATHER ADJUSTMENTS (non-negotiable):
WET INFIELD: Grounders skip faster and hop higher on wet dirt. Infielders play slightly deeper to get extra reaction time. First-step quickness matters more — choppy footing. Bunts die faster in wet grass near foul lines (advantage to bunter). Be ready for bad hops.
WET OUTFIELD: Balls die in wet grass instead of rolling through. Outfielders charge harder and play shallower to compensate. Gap balls that normally roll to the wall may stop in the grass. Adjust your depth based on how heavy the outfield grass is.
MUDDY MOUND: Dig a firmer foothold with your spikes before each inning. Shorten your stride slightly to maintain balance on the landing. Rosin bag is essential — keep your grip hand dry. Breaking balls may slip more — consider going fastball-heavy if grip is compromised.
COLD WEATHER (<50F): Ball doesn't carry as far (~6% less distance). Outfielders can shade slightly shallower. Breaking balls won't break as sharply (cold air is denser but ball is harder). Bat stings more on contact — hand protection matters. Pitchers: keep your hands warm between pitches.
HOT WEATHER (>85F): Ball carries farther. Outfielders play deeper. Pitchers: stay hydrated, fatigue accelerates — pitch count thresholds should be lower. Hitters: ball jumps off the bat more in heat. Everyone: watch for heat exhaustion signs in teammates.
TURF VS GRASS: Turf = grounders travel 15% faster with higher, more predictable hops. Infielders play 1-2 steps deeper. Bunt defense charges earlier (less time to react). Outfield gaps play wider — balls roll farther and faster. Grass = standard positioning baseline, no adjustment needed.
WIND BLOWING OUT (10+ MPH): Fly balls carry 15-20 feet extra. Outfielders play significantly deeper. Pitchers keep the ball down in the zone — elevated pitches become home runs. Hitters should try to elevate the ball. Every fly ball is a potential extra-base hit.
WIND BLOWING IN (10+ MPH): Fly balls die — pop-ups that would be homers become routine outs. Outfielders shade in closer. Pitchers can challenge hitters up in the zone more aggressively. Small ball (bunts, stolen bases, contact hitting) gains value.
CROSSWIND (15+ MPH): Fly balls drift laterally — adjust routes immediately. Outfielders must read wind direction on every pitch. Pitchers can use crosswind for extra movement on breaking balls. LHP breaking ball is amplified by L→R crosswind, reduced by R→L.
SUN FIELD: Use sunglasses and glove as a shade shield. Track the ball with your glove between you and the sun. If completely blinded, call timeout immediately (safety first). Pre-game: identify which positions will face sun at game time.
NIGHT GAMES / SHADOWS: Shadows between mound and plate make fastballs appear faster at dusk (shadow transition zone). Hitters: choke up and focus on contact during shadow innings. Pitchers: fastball-heavy approach works well in shadows. Once full lights take over, normal adjustments resume.
QUICK CHECKLIST (pre-game): (1) Wind speed and direction. (2) Surface type (turf or grass, wet or dry). (3) Temperature. (4) Sun position relative to fielders. (5) Mound condition. Communicate findings to the entire team before the first pitch.
NEVER: Ignore field conditions when positioning — they change every game. Play the same depth in rain as you would on a dry day. Let a muddy mound affect your mechanics without making adjustments. Forget to communicate conditions to teammates.`,
};
const MAP_RELEVANCE = {
  CUTOFF_RELAY_MAP:     ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','leftField','centerField','rightField','batter','baserunner','manager'],
  BUNT_DEFENSE_MAP:     ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','manager'],
  FIRST_THIRD_MAP:      ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','manager'],
  BACKUP_MAP:           ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','leftField','centerField','rightField','manager'],
  RUNDOWN_MAP:          ['firstBase','secondBase','shortstop','thirdBase','baserunner','manager'],
  DP_POSITIONING_MAP:   ['pitcher','firstBase','secondBase','shortstop','thirdBase','manager'],
  HIT_RUN_MAP:          ['secondBase','shortstop','batter','baserunner','manager'],
  PICKOFF_MAP:          ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','baserunner','manager'],
  BALK_MAP:             ['pitcher','catcher','baserunner','manager','rules'],
  APPEAL_PLAY_MAP:      ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','leftField','centerField','rightField','batter','baserunner','manager','rules'],
  PITCH_CLOCK_MAP:      ['pitcher','catcher','batter','baserunner','manager'],
  WP_PB_MAP:            ['pitcher','catcher','firstBase','thirdBase','baserunner','manager'],
  SQUEEZE_MAP:          ['pitcher','catcher','firstBase','thirdBase','batter','baserunner','manager'],
  INFIELD_FLY_MAP:      ['firstBase','secondBase','shortstop','thirdBase','batter','baserunner','manager'],
  OF_COMMUNICATION_MAP: ['leftField','centerField','rightField'],
  POPUP_PRIORITY_MAP:             ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','leftField','centerField','rightField','manager'],
  OBSTRUCTION_INTERFERENCE_MAP:   ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','leftField','centerField','rightField','batter','baserunner','manager'],
  TAGUP_SACRIFICE_FLY_MAP:        ['leftField','centerField','rightField','batter','baserunner','manager'],
  PITCHING_CHANGE_MAP:            ['pitcher','catcher','manager'],
  INTENTIONAL_WALK_MAP:           ['pitcher','catcher','batter','baserunner','manager'],
  LEGAL_SHIFT_MAP:                ['firstBase','secondBase','shortstop','thirdBase','batter','baserunner','manager'],
  BASERUNNER_READS_MAP:           ['baserunner','pitcher','catcher','manager'],
  PARK_ENVIRONMENT_MAP:           ['pitcher','catcher','leftField','centerField','rightField','firstBase','secondBase','shortstop','thirdBase','batter','manager'],
  LEVEL_ADJUSTMENTS_MAP:          ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','leftField','centerField','rightField','batter','baserunner','manager'],
  LINEUP_CONSTRUCTION_MAP:        ['manager','batter'],
  COMMUNICATION_PROTOCOL_MAP:     ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','leftField','centerField','rightField','batter','baserunner','manager','famous','rules','counts'],
  SLIDE_TECHNIQUE_MAP:            ['baserunner','batter','manager'],
  FIELD_CONDITIONS_MAP:           ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase','leftField','centerField','rightField','batter','baserunner','manager','famous','rules','counts'],
};
const MAP_AUDIT = {
  CUTOFF_RELAY_MAP:     "CUTOFF/RELAY: Assignments correct per map? 3B cuts LF→Home, 1B cuts CF/RF→Home. SS relays left side, 2B relays right side. Pitcher backs up target base, never cuts. Trail man in position.",
  BUNT_DEFENSE_MAP:     "BUNT DEFENSE: Assignments match map? 2B covers 1st, SS covers 3rd (runners 1st & 2nd). No bunt defense with 2 outs. Fake bunt/slash leaves right side open — 2B holds.",
  FIRST_THIRD_MAP:      "FIRST-AND-THIRD: Options match map? SS/2B cuts, pitcher ducks, 1B stays. 2-out = throw freely to 2B. Double steal = read R3 first.",
  BACKUP_MAP:           "BACKUP: Responsibilities correct? RF→1B, LF→3B, CF→2B on steals, P→home and 3B, C→1B with no runners. Foul territory and pop-up backups covered.",
  RUNDOWN_MAP:          "RUNDOWN: Chase runner BACK, one throw max, no pump fakes, thrower fills vacated base. Two-runner: lead runner first. Force removed = tag play.",
  DP_POSITIONING_MAP:   "DP POSITIONING: DP depth only with <2 outs and force at 2nd. Never DP depth with 2 outs. Infield in only with R3 and <2 outs. Loaded = force at every base including home.",
  HIT_RUN_MAP:          "HIT-AND-RUN: Batter MUST swing. Coverage depends on batter handedness (LHH=SS, RHH=2B). Batter missing sign = runner hung out. Pitchout counters the hit-and-run.",
  PICKOFF_MAP:          "PICKOFF: Legal step requirement for RHP (step toward base + throw). LHP can throw to 1B freely. Fake-3B/throw-1B is a balk since 2013. Daylight play: fielder breaks first.",
  BALK_MAP:             "BALK: Is the pitcher's action legal? Check: set position with runners on, complete stop, step matches throw direction, no fake to 1B from set, no fake-3B/throw-1B. Step-off = legal reset.",
  APPEAL_PLAY_MAP:      "APPEAL PLAYS: Does any scenario involve a runner advancing or tagging up? If yes — could a missed base or early departure be part of the situation? Does the scenario correctly show the appeal window (before next pitch)? Is the time play rule applied correctly when a run scores on the same play as a third out?",
  PITCH_CLOCK_MAP:      "PITCH CLOCK: 15 sec empty, 20 sec runners. Pitcher violation = ball, batter violation = strike. 2 disengagements per batter — 3rd = balk unless pickoff succeeds.",
  WP_PB_MAP:            "WILD PITCH/PASSED BALL: Catcher goes to ball first (never look at runner first). Pitcher sprints home immediately. 3B backs up home with R3. 2-out variant same assignments.",
  SQUEEZE_MAP:          "SQUEEZE: Safety=on contact, suicide=on first move. Never suicide with 2 strikes (foul=K + runner dead). Pitcher defends with high-tight pitch. Pop-up on squeeze = double play.",
  INFIELD_FLY_MAP:      "IFF: <2 outs, runners 1st+2nd or loaded, fair fly with ordinary effort. Batter automatically out. Runners NOT forced. Ball drifts foul = cancelled. No IFF on line drives or bunts.",
  OF_COMMUNICATION_MAP: "OF COMMUNICATION: CF priority correct. Gap ball caller is correct fielder. Foul territory: OF has priority over infielder. No no-call fly ball. Two-OF convergence: first caller owns it.",
  POPUP_PRIORITY_MAP:            "POP-UP PRIORITY: CF priority over all on balls he can reach. Catcher priority within 30 feet — turns back to field. OF priority over IF in foul territory. First caller owns it.",
  OBSTRUCTION_INTERFERENCE_MAP:  "OBSTRUCTION/INTERFERENCE: OBSTRUCTION = fielder impedes runner (fielder's fault). INTERFERENCE = runner/batter impedes fielder (runner's fault). Type A obstruction = dead ball immediately.",
  TAGUP_SACRIFICE_FLY_MAP:       "TAG-UP: Runner leaves on THE CATCH (not before, not after). Early departure = appealable out. Sac fly with R3 is RE-positive. CF/LF throw home — correct cutoff used.",
  PITCHING_CHANGE_MAP:           "PITCHING CHANGE: 2nd mound visit same inning = mandatory removal. 3-batter minimum rule applies. Inherited runners charged to original pitcher. 8 warm-up pitches.",
  INTENTIONAL_WALK_MAP:          "IBB: 2023+ = signal only, no pitches. IBB always costs RE. Justified only with 1B open + weaker next hitter. Never with bases loaded. Forced runners advance one base only.",
  LEGAL_SHIFT_MAP:               "SHIFT: 2023+ requires 2 infielders each side of 2B at pitch. 3 infielders one side = illegal. Outfield shifts still legal. Infield in still legal. Deep positioning legal.",
  BASERUNNER_READS_MAP:          "BASERUNNER READS: Pickoff tells correct (RHP=front heel, LHP=front knee)? Double steal read = catcher commitment, not R1 break. First-to-third reads correct? 3rd out rule applied? Never make 3rd out at home with <2 outs.",
  PARK_ENVIRONMENT_MAP:          "ENVIRONMENT: Does this scenario take place in a notable park or condition (wind, turf, cold, altitude)? If yes — are positioning and strategy adjustments applied? These are Tier 4 modifiers ONLY — never let them override a Tier 1 rule answer.",
  LEVEL_ADJUSTMENTS_MAP:         "LEVEL/AGE: Is the scenario appropriate for the player's level? Steal break-even, bunt value, and vocabulary must match the age/level context. Youth leagues may have no-lead rules. Never use advanced stats with young players without explanation.",
  LINEUP_CONSTRUCTION_MAP:       "LINEUP: Batting order roles correct? Leadoff = OBP, #3 = best OPS, #4 = power. Platoon L/R alternation considered? Double switch mechanics correct? Lineup protection logic applied?",
  COMMUNICATION_PROTOCOL_MAP:    "COMMUNICATION: Signs correct? Indicator system used with R2? Verbal calls match protocol (first caller owns it)? Pre-pitch coverage signals shown? Emergency cut/relay calls accurate?",
  SLIDE_TECHNIQUE_MAP:           "SLIDES: Correct technique for situation? Feet-first for standard, hook to avoid tag, pop-up for potential advance. Head-first banned in youth? Buster Posey rule applied at home? Breakup slide within reach of base?",
  FIELD_CONDITIONS_MAP:          "CONDITIONS: Weather/field adjustments applied? Wet = faster grounders. Wind out = OF deeper. Cold = less carry. Turf = 15% faster. Sun field = safety first. Conditions communicated to team?",
};
const MASTERY_SCHEMA = {
  states: {
    UNSEEN: "unseen", INTRODUCED: "introduced", LEARNING: "learning",
    MASTERED: "mastered", DEGRADED: "degraded",
  },
  transitions: {
    unseen_correct: "introduced", introduced_correct: "learning",
    learning_correct: "learning", learning_streak3: "mastered",
    mastered_correct: "mastered", degraded_correct: "learning",
    unseen_wrong: "unseen", introduced_wrong: "learning",
    learning_wrong: "learning", mastered_wrong: "degraded", degraded_wrong: "degraded",
  },
  masteryRequirements: { consecutiveCorrect: 3, uniqueScenarioIds: 3, minDifficultyMix: 2 },
  spacedRepetition: {
    intervals: {
      afterIntroduced: 1, afterLearning: 3, afterFirstMastery: 7,
      afterSecondMastery: 14, afterThirdMastery: 30, afterDegraded: 1,
    },
    intervalMultiplier: 2.0,
    maxInterval: 30,
    preSeasonMode: {
      description: "Compress all review intervals. Mastered concepts first for confidence, degraded/learning for repair.",
      masteredInterval: 0, learningInterval: 1, degradedInterval: 0,
    },
  },
};
const ERROR_TAXONOMY = {
  categories: {
    ruleError: {
      id:"rule-error", label:"Rule Error", labelYouth:"Let's check the rulebook!",
      conceptGaps:["force-vs-tag","infield-fly","balk-rule","dropped-third-strike","obstruction-interference","appeal-play"],
      feedbackTemplates: { youth:"Oops — that's a rules question! {correctPrinciple} Remember: {anchor}", varsity:"Rules check: {wrongChoice} isn't allowed here. {correctPrinciple} {anchor}", scout:"Rule violation: {wrongChoice} contradicts {ruleSource}. {correctPrinciple} {anchor}" },
      anchors: {
        "pitcher-cutoff":      "The pitcher sprints to BACK UP a base — the cutoff man is always an INFIELDER.",
        "force-vs-tag":        "No lead = no choice = force play. Runner doesn't have to run = tag required.",
        "infield-fly":         "The umpire calls it. Runners can advance — but at their own risk.",
        "balk-rule":           "Any motion you start, you must finish. Step off the rubber and ALL balk rules disappear.",
        "appeal-play":         "Umpires don't call missed bases — the DEFENSE must ask. Touch every base deliberately.",
        "dropped-third-strike":"The catcher MUST catch it cleanly for the batter to be out on strike three.",
      },
      remediation: { priority:"high", scenarioDiff:1 },
    },
    dataError: {
      id:"data-error", label:"Data Error", labelYouth:"The numbers say something different!",
      conceptGaps:["bunt-re24","steal-breakeven","count-leverage","first-pitch-value","scoring-probability","times-through-order"],
      feedbackTemplates: { youth:"Good thinking — but the math says {dataPoint}! {correctPrinciple} {anchor}", varsity:"The stats matter here: {dataPoint}. {wrongChoice} costs your team. {correctPrinciple} {anchor}", scout:"Data miss: {dataPoint} ({dataSource}). {wrongChoice} is {costDescription}. {correctPrinciple} {anchor}" },
      anchors: {
        "bunt-re24":        "Bunting trades an out for a base. The math says it costs runs — unless the fielders can't handle it.",
        "steal-breakeven":  "Steal break-even: 72% MLB, 65% high school, 60% travel ball. Know your level.",
        "count-leverage":   "The count tells you what to expect. On 2-0, sit fastball. On 0-2, protect the plate.",
        "first-pitch-value":"First-pitch strikes save 0.048 runs per batter. The whole inning turns on pitch #1.",
        "2-0-danger":       "2-0 fastball: .370 wOBA — most dangerous pitch-count combo in baseball. Mix in a breaking ball.",
      },
      remediation: { priority:"medium", scenarioDiff:2 },
    },
    roleConfusion: {
      id:"role-confusion", label:"Role Confusion", labelYouth:"Wrong player — who's really in charge here?",
      conceptGaps:["cutoff-roles","backup-duties","bunt-defense","of-communication","dp-positioning","wild-pitch-coverage"],
      feedbackTemplates: { youth:"{wrongPosition} has a different job! {correctPosition} is the one who {correctAction}. {anchor}", varsity:"Role mix-up: {wrongPosition} can't do that — {correctPosition} owns this responsibility. {anchor}", scout:"Position assignment error: {wrongPosition} for {wrongAction} contradicts {mapSource}. {correctPosition} is responsible because {reason}. {anchor}" },
      anchors: {
        "cutoff-lf-home":   "LF throw home: 3B is the cutoff. Shortest infield path from LF.",
        "cutoff-cf-home":   "CF throw home: 1B is the cutoff. 1B streaks out; 3B covers home.",
        "cutoff-rf-home":   "RF throw home: 1B is the cutoff. RF and 1B are on the same side.",
        "bunt-coverage":    "On a bunt: 2B covers 1st, SS covers 2nd. First baseman charges.",
        "pitcher-backup":   "Pitcher backs up HOME (OF throws) and THIRD (right side throws). Never first or second.",
        "cf-backup":        "CF backs up SECOND BASE — positioned beyond 2B on infield throws.",
      },
      remediation: { priority:"high", scenarioDiff:1 },
    },
    priorityError: {
      id:"priority-error", label:"Priority Error", labelYouth:"Who gets the ball when two players go for it?",
      conceptGaps:["fly-ball-priority","of-communication","popup-priority","cutoff-roles"],
      feedbackTemplates: { youth:"{higherPriority} always has the right-of-way! {correctPrinciple} {anchor}", varsity:"Priority order: {higherPriority} outranks {lowerPriority} here. {correctPrinciple} {anchor}", scout:"Priority inversion: {lowerPriority} calling off {higherPriority} violates the priority hierarchy. {anchor}" },
      anchors: {
        "of-over-if":    "Outfielder coming IN beats infielder going BACK — always. Ball is in front of OF, behind IF.",
        "cf-priority":   "CF has priority over EVERYONE — corner OFs and all infielders. His call is final. No exceptions.",
        "early-call":    "Whoever calls the ball FIRST owns it. Late calls don't override early calls.",
        "catcher-popup": "On a popup directly behind the plate, the CATCHER has priority — he knows the spin.",
      },
      remediation: { priority:"high", scenarioDiff:1 },
    },
    situationalMiss: {
      id:"situational-miss", label:"Situational Miss", labelYouth:"Right idea, wrong moment!",
      conceptGaps:["situational-hitting","win-probability","scoring-probability","bunt-re24","times-through-order","steal-breakeven"],
      feedbackTemplates: { youth:"Good idea in the wrong moment! With {situationKey}, the right play is {correctAction}. {anchor}", varsity:"Situational read: {wrongChoice} makes sense in general — but {situationContext} changes everything. {anchor}", scout:"Context miss: {wrongChoice} is correct in a neutral state, but {situationContext} shifts the optimal decision. {re24OrWpContext} {anchor}" },
      anchors: {
        "two-outs-bunt":      "NEVER sacrifice bunt with 2 outs. You're giving away the last out of the inning for nothing.",
        "3-0-steal":          "On 3-0, the catcher knows a steal is possible. The walk is almost free (48% BB rate).",
        "late-game-switch":   "Early innings: play for runs (RE24). Late, close games: play for wins (WP). Framework switches around the 7th.",
        "tto-compound":       "3rd TTO + wrong-side platoon = +48 BA points above baseline. 2 at-bats don't override the data.",
        "2-out-run-contact":  "2 outs — always run on contact. The out ends the inning anyway.",
      },
      remediation: { priority:"medium", scenarioDiff:2 },
    },
    countBlindness: {
      id:"count-blindness", label:"Count Blindness", labelYouth:"The scoreboard matters — even the little numbers!",
      conceptGaps:["count-leverage","two-strike-approach","first-pitch-value","steal-breakeven"],
      feedbackTemplates: { youth:"Look at the count! {count} means {countMeaning}. {anchor}", varsity:"Count matters: {count} is a {countLabel} count — hitters bat {ba} here. {wrongChoice} ignores that edge. {anchor}", scout:"Count context: {count} shows {ba} BA / {kRate}% K / {bbRate}% BB. {wrongChoice} applies neutral logic to {countEdge} territory. {anchor}" },
      anchors: {
        "0-2-protect":        "0-2: protect everything. Hitters bat .167. Expand your zone — the pitcher wants you to chase.",
        "2-0-sit-fastball":   "2-0: sit on the fastball. Every pitcher in baseball throws one here. Be ready.",
        "3-0-take":           "3-0: take the pitch unless you have the green light. 48% walk rate — the walk is almost free.",
        "full-count":         "3-2: be ready for anything. Pitcher must throw a strike. Selective but protect the plate.",
        "first-pitch":        "0-0: first-pitch strikes save 0.048 runs per batter. The whole at-bat hinges on pitch #1.",
      },
      remediation: { priority:"medium", scenarioDiff:1 },
    },
  },
  classifyError: (scenario, chosenIdx) => {
    const correctExp = (scenario.explanations?.[scenario.best] || '').toLowerCase();
    const chosenExp  = (scenario.explanations?.[chosenIdx]    || '').toLowerCase();
    const all = correctExp + ' ' + chosenExp;
    if (/rule|illegal|violation|balk|appeal|infield fly|interference|obstruction|mlb rule/i.test(correctExp)) return 'ruleError';
    if (/cutoff|relay|backup|who covers|who goes|2b covers|ss covers|pitcher backs/i.test(correctExp))         return 'roleConfusion';
    if (/priority|calls it|calls off|has the right|outfielder.*infielder|cf.*corner|always wins/i.test(correctExp)) return 'priorityError';
    if (/re24|run expectancy|break.?even|woba|0\.23|0\.19|statcast|fangraphs|\.370|\.280/i.test(correctExp))   return 'dataError';
    if (/\b(count|0-2|2-0|3-0|3-1|full count|hitter.?s count|pitcher.?s count)\b/i.test(all))                 return 'countBlindness';
    if (/2 outs|inning|score|late.?game|win probability|tto|time.*through|situation/i.test(correctExp))        return 'situationalMiss';
    return null;
  },
  remediationRoutes: {
    'rule-error':       { conceptGap: null,                 scenarioDiff: 1 },
    'data-error':       { conceptGap: 'bunt-re24',          scenarioDiff: 2 },
    'role-confusion':   { conceptGap: 'cutoff-roles',       scenarioDiff: 1 },
    'priority-error':   { conceptGap: 'fly-ball-priority',  scenarioDiff: 1 },
    'situational-miss': { conceptGap: 'situational-hitting',scenarioDiff: 2 },
    'count-blindness':  { conceptGap: 'count-leverage',     scenarioDiff: 1 },
  },
};
function getRelevantMaps(position) {
  return Object.entries(MAP_RELEVANCE)
    .filter(([, positions]) => positions.includes(position))
    .map(([key]) => KNOWLEDGE_MAPS[key])
    .join('\n\n');
}
function getRelevantAudits(position) {
  return Object.entries(MAP_RELEVANCE)
    .filter(([, positions]) => positions.includes(position))
    .map(([key], i) => `${10 + i}. ${MAP_AUDIT[key]}`)
    .join('\n');
}

// ============================================================================
// IMPROVEMENT ENGINE — Scenario quality scoring, gap detection, explanation
// effectiveness tracking, and micro-feedback loop.
// Phase 2.7: qualitySignals → profiles.stats_json, flagged_scenarios → D1 table
// ============================================================================
const IMPROVEMENT_ENGINE = {
  quality: {
    minAttempts: 5,
    idealAccuracy: [0.45, 0.75],
    tooEasy: 0.85,
    tooHard: 0.25,
    flagThreshold: 3,
    degradedInterval: 7,
  },
  gapRules: {
    minScenariosForMastery: 3,
    stuckThreshold: 0.35,
    neglectedDays: 14,
    cacheRefreshInterval: 10,
  },
  explanationTracking: {
    minSampleSize: 3,
    effectiveThreshold: 0.60,
    ineffectiveThreshold: 0.35,
    decayDays: 30,
  },
  remediationWeights: {
    ruleError: 1.5,
    dataError: 1.4,
    roleConfusion: 1.3,
    priorityError: 1.2,
    situationalMiss: 1.0,
    countBlindness: 1.1,
  },
};

// ============================================================================
// SELF-LEARNING AI: Real Baseball Knowledge Constants
// Sources: Retrosheet play-by-play aggregates, coaching manuals, baseball consensus
// ============================================================================

const FLAG_CATEGORIES = {
  wrong_answer: { label: "Wrong answer", desc: "The 'best' answer seemed wrong" },
  unrealistic: { label: "Unrealistic", desc: "This wouldn't happen in a real game" },
  wrong_position: { label: "Wrong position", desc: "This isn't my position's job" },
  confusing_text: { label: "Confusing", desc: "The explanation didn't make sense" },
  too_easy_hard: { label: "Too easy/hard", desc: "Way too easy or too hard" },
};

// Phase C1: Real game situations that make AI scenarios feel authentic
// Each entry captures a REAL decision moment — what actually happens, not textbook theory
const REAL_GAME_SITUATIONS = {
  pitcher: [
    { setup: "Runner on first, 1 out, ground ball to right side", real_decision: "Sprint to cover first — automatic, no thinking", why_real: "This is muscle memory drilled in every bullpen session", common_mistake: "Treating this as a strategic 'decision' — it's instinct", source: "Coaching consensus" },
    { setup: "Full count, bases loaded, 2 outs", real_decision: "Throw your best pitch — don't nibble", why_real: "Walking in a run is the worst outcome. Trust your stuff", common_mistake: "Having the pitcher 'consider' 4 different pitch types analytically", source: "Pitching coaches consensus" },
    { setup: "Batter squares to bunt, runner on first", real_decision: "Field position depends on bunt direction — charge if it's toward you, cover first if 2B fields it", why_real: "Pitcher's reaction is split-second, not a chess move", common_mistake: "Making pitcher 'decide' whether to field or cover — you react to where the ball goes", source: "ABCA manual" },
    { setup: "Wild pitch with runner on third, less than 2 outs", real_decision: "Sprint to cover home plate immediately", why_real: "Catcher's going after the ball — someone must cover the plate", common_mistake: "Staying on the mound or hesitating", source: "USA Baseball" },
    { setup: "2-0 count, no runners, early in game", real_decision: "Throw a fastball for a strike — get ahead", why_real: "2-0 is a hitter's count. Falling behind 3-0 is worse than giving up a hit", common_mistake: "Overcomplicating with breaking ball selection", source: "FanGraphs count data" },
    { setup: "Leadoff hitter reaches base to start the inning", real_decision: "Focus on getting the next batter out, vary your look at the runner", why_real: "The runner changes your approach but you still pitch to the batter", common_mistake: "Making the scenario entirely about the runner rather than pitching", source: "Coaching consensus" },
    { setup: "Pitcher gets 2 quick outs to start the inning", real_decision: "Don't ease up — finish the inning strong", why_real: "Third-time-through effects and pitch count matter more than 2-out comfort", common_mistake: "Treating 2-out situations as low-pressure", source: "Baseball Prospectus TTO data" },
    { setup: "Comeback grounder hit right at the pitcher", real_decision: "Field it cleanly, turn and throw to first", why_real: "Self-defense reaction first, then a routine play", common_mistake: "Overcomplicating a simple play", source: "Retrosheet play-by-play" },
  ],
  catcher: [
    { setup: "Runner stealing second, right-handed batter", real_decision: "Receive the pitch, pop up throwing, don't rush the catch", why_real: "A dropped ball is worse than a late throw. Catch first, throw second", common_mistake: "Making the throw the entire focus — receiving is step one", source: "Catching coaches consensus" },
    { setup: "Wild pitch with runners on base", real_decision: "Find the ball first, then decide which runner to play on", why_real: "Chasing the ball blindly leads to overthrows. Controlled urgency", common_mistake: "Having catcher 'look at runners' before fielding the ball", source: "USA Baseball" },
    { setup: "Popup behind home plate", real_decision: "Rip off mask, toss it away from the ball, track the spin", why_real: "Popup spin near home plate curves TOWARD the field — drift back", common_mistake: "Standing still and reaching up — popup drift is real", source: "Pro Baseball Insider" },
    { setup: "Runner on third, less than 2 outs, ground ball to infield", real_decision: "Stay at home plate, set up for the throw", why_real: "You're the last line of defense — be ready for the play at the plate", common_mistake: "Having catcher leave the plate or chase the ball", source: "Coaching consensus" },
    { setup: "Pitcher is struggling, walks two batters", real_decision: "Go visit the mound, slow things down, talk about one specific thing", why_real: "Not a lecture — just break the rhythm and refocus", common_mistake: "Making the mound visit too analytical", source: "Catching coaches consensus" },
    { setup: "Foul tip with two strikes", real_decision: "Squeeze the glove — if it pops out, it's not a strikeout", why_real: "Foul tip must be caught for strike three. Bare hand helps trap it", common_mistake: "Treating foul tips as automatic outs", source: "MLB Rules 5.09" },
  ],
  firstBase: [
    { setup: "Ground ball to second baseman, no runners", real_decision: "Get to the bag, stretch toward the throw, catch it", why_real: "Every first baseman does this 10+ times a game — it's fundamental", common_mistake: "Making a routine out into a strategic puzzle", source: "Retrosheet play-by-play" },
    { setup: "Bunt down the first base line, pitcher fielding", real_decision: "If pitcher fields it, sprint to cover first base", why_real: "Someone has to be at first. If you fielded the bunt, pitcher covers", common_mistake: "Confusion about who covers — depends on who fields the ball", source: "ABCA manual" },
    { setup: "Runner on first, pick-off attempt", real_decision: "Give a target, catch the ball, sweep the tag down", why_real: "Tag is at the back corner of the base where the runner's hand goes", common_mistake: "Tagging high or away from the base", source: "Coaching consensus" },
    { setup: "Throw in the dirt on a ground ball play", real_decision: "Get in front of it — block it like a hockey goalie if you have to", why_real: "Keeping the ball in front of you is more important than catching it cleanly", common_mistake: "Trying to pick it cleanly every time instead of blocking", source: "Pro Baseball Insider" },
  ],
  secondBase: [
    { setup: "Double play ball, runner on first", real_decision: "Get to the bag, receive the throw, pivot and throw to first", why_real: "The timing is tight — every DP has under 2 seconds to turn", common_mistake: "Overanalyzing the pivot — you drill this until it's automatic", source: "Coaching consensus" },
    { setup: "Popup in shallow right field", real_decision: "Go get it — you have priority over the right fielder coming in", why_real: "Infielders coming out have a better angle than outfielders coming in", common_mistake: "Deferring to the outfielder on a ball you can reach", source: "ABCA manual" },
    { setup: "Steal attempt, left-handed batter", real_decision: "Cover second base (shortstop takes it with right-handed batters)", why_real: "The batter's handedness determines who covers — it's predetermined", common_mistake: "Not knowing the coverage assignment by batter handedness", source: "Coaching consensus" },
  ],
  shortstop: [
    { setup: "Ground ball in the hole between short and third", real_decision: "Backhand it, plant, throw across your body to first", why_real: "This is the signature shortstop play — requires arm strength", common_mistake: "Making it about 'deciding' whether to throw — if you field it, you throw it", source: "Pro Baseball Insider" },
    { setup: "Runner on second, single to center", real_decision: "Get into cutoff position between the outfield and third base", why_real: "SS is the cutoff on throws from center to third", common_mistake: "Having SS cover a base instead of being the cutoff", source: "ABCA relay/cutoff system" },
    { setup: "Popup in short left field", real_decision: "Call for it loudly and go catch it — you have priority", why_real: "SS going out has a better angle than LF coming in on most balls", common_mistake: "Collision scenarios where nobody calls for the ball", source: "Coaching consensus" },
  ],
  thirdBase: [
    { setup: "Slow roller, runner on first", real_decision: "Charge hard, bare-hand it, throw on the run to first", why_real: "You don't have time to set your feet — this is the 'do or die' play", common_mistake: "Having the fielder 'decide' whether to charge — you always charge slow rollers", source: "Pro Baseball Insider" },
    { setup: "Bunt situation, runner on second", real_decision: "Hold your position until you read bunt — don't crash too early", why_real: "If you crash and they fake bunt/slash, the line is wide open", common_mistake: "Auto-charging on every bunt look without reading the batter", source: "ABCA manual" },
    { setup: "Line drive right at you", real_decision: "Catch it — if runner's off the base, throw to the base for a double play", why_real: "Reaction play first, then look for the bonus out", common_mistake: "Overcomplicating a catch-and-throw", source: "Retrosheet play-by-play" },
  ],
  leftField: [
    { setup: "Line drive into the gap, runner on first", real_decision: "Cut the ball off to prevent extra bases, hit the cutoff man", why_real: "Preventing the triple is more important than trying for an impossible throw home", common_mistake: "Throwing home past the cutoff man on a ball deep in the gap", source: "Coaching consensus" },
    { setup: "Fly ball, runner tagging from third", real_decision: "Catch the ball, crow-hop, throw home through the cutoff", why_real: "Even a weak arm needs to hit the cutoff — he can relay home", common_mistake: "Overthrowing the cutoff trying to reach home plate directly", source: "ABCA manual" },
    { setup: "Ball hit off the wall", real_decision: "Play the carom off the wall, get the ball in quickly", why_real: "The ball comes back to you — don't run past it chasing the wall", common_mistake: "Turning the wrong way on wall balls", source: "Pro Baseball Insider" },
  ],
  centerField: [
    { setup: "Fly ball in the gap, corner outfielder also going", real_decision: "Call it — center fielder has priority over corners", why_real: "CF sees the ball better coming in. Corner OF should peel off on the call", common_mistake: "Collision scenarios where both fielders go full speed", source: "Coaching consensus" },
    { setup: "Single to center, runner trying to go first to third", real_decision: "Hit the cutoff man at shortstop — don't try to throw to third on the fly", why_real: "Overthrowing = runner advances to home. The cutoff keeps the play alive", common_mistake: "Always having CF throw to third base directly", source: "ABCA relay system" },
    { setup: "Fly ball with the sun in your eyes", real_decision: "Use your glove as a sun shield, flip down sunglasses if you have them", why_real: "Every CF deals with this — it's a fundamental skill, not a rare event", common_mistake: "Treating sun balls as exotic situations", source: "Coaching consensus" },
  ],
  rightField: [
    { setup: "Single to right, runner on first trying for third", real_decision: "Get the ball in quickly, throw to the cutoff man at shortstop or second base", why_real: "RF throw to third is the longest throw in the outfield — need the cutoff", common_mistake: "Trying to throw to third directly without the cutoff", source: "ABCA relay system" },
    { setup: "Fly ball, runner on third, less than 2 outs", real_decision: "Catch the ball, set your feet, throw home through the cutoff", why_real: "Sac fly situation — your throw might save the run", common_mistake: "Not being ready to throw before the catch", source: "Coaching consensus" },
    { setup: "Ground ball single past the infield", real_decision: "Charge the ball, field it cleanly, get it back in fast", why_real: "Speed of getting the ball back prevents runners from taking extra bases", common_mistake: "Casual fielding on routine singles", source: "Pro Baseball Insider" },
  ],
  batter: [
    { setup: "0-2 count, two outs, runner in scoring position", real_decision: "Protect the plate — foul off tough pitches, look for something to drive", why_real: "You can't take a close pitch with 2 strikes. Shorten up and battle", common_mistake: "Having the batter 'choose a pitch to look for' on 0-2 like it's 2-0", source: "Hitting coaches consensus" },
    { setup: "3-1 count, runner on second, nobody out", real_decision: "Look for your pitch in your zone — this is a hitter's count", why_real: "Pitcher doesn't want to go 3-2 or walk you. He's coming in the zone", common_mistake: "Making the batter consider taking the pitch on 3-1", source: "FanGraphs count data" },
    { setup: "Hit and run is on, pitch is way outside", real_decision: "You have to swing — protect the runner", why_real: "The runner is going. A take means he's hung out to dry", common_mistake: "Giving 'take the pitch' as an option when hit-and-run is on", source: "Coaching consensus" },
    { setup: "First pitch of the at-bat", real_decision: "If it's your pitch, hit it. First-pitch fastballs are the most hittable pitch", why_real: "First-pitch strike rate is ~60%. Hitters who swing at first-pitch strikes have higher OPS", common_mistake: "Always 'taking' the first pitch as if it's a rule", source: "Baseball Savant data" },
    { setup: "Bases loaded, nobody out, close game", real_decision: "Put the ball in play — a fly ball scores a run, a ground ball might too", why_real: "Walking is fine too but you want to drive in runs, not just wait", common_mistake: "Overcomplicating a 'pressure' situation when the answer is: hit the ball", source: "Coaching consensus" },
  ],
  baserunner: [
    { setup: "Runner on second, single to center", real_decision: "Read the outfielder's position and arm, round third aggressively, coach's call", why_real: "You look at the third base coach for the sign — hold or go", common_mistake: "Making the runner 'decide' independently without mentioning the third base coach", source: "USA Baseball" },
    { setup: "Runner on first, fly ball to center, 1 out", real_decision: "Go halfway — if it's caught, get back; if it drops, advance", why_real: "Halfway is automatic with 1 out on medium fly balls", common_mistake: "Having the runner tag up on a routine fly with 1 out when it's not deep enough to score", source: "Coaching consensus" },
    { setup: "Runner on third, ground ball to the right side, less than 2 outs", real_decision: "If the ball gets through, you score. If it's fielded, read the play", why_real: "Ground ball to the right side with runner on third is the sac fly equivalent for infield", common_mistake: "Auto-running home on every grounder — depends on where it's hit", source: "Coaching consensus" },
    { setup: "Runner on first, pitcher has been slow to the plate", real_decision: "Get a bigger secondary lead, look for the steal sign", why_real: "Slow delivery = bigger window. But you still need the sign from the dugout", common_mistake: "Having the runner independently decide to steal without the sign", source: "Pro Baseball Insider" },
    { setup: "Runner on second, two outs, single to left", real_decision: "You're running on contact with 2 outs — score standing up", why_real: "With 2 outs you run on anything. Single from second scores you easily", common_mistake: "Making the runner 'decide' whether to score on a clean single with 2 outs", source: "Retrosheet play-by-play" },
    { setup: "Runner on 2nd, 1 out, ground ball to shortstop", real_decision: "Hold at 2nd — SS is looking at you and the throw to first is routine. Advance only on ball hit to right side or through the infield.", common_mistake: "AI has runner always advance on ground balls regardless of where ball is hit", source: "Coaching consensus" },
    { setup: "Runner on 1st, 0 outs, fly ball to medium-depth center", real_decision: "Tag up but don't go — medium CF fly is not deep enough to advance. Return to 1st after the catch.", common_mistake: "AI has runner tag up and advance on every fly ball, even shallow ones", source: "Coaching consensus" },
    { setup: "Runner on 3rd, line drive hit to left fielder", real_decision: "Freeze immediately — if the liner is caught, you need to be on the bag. Only score if it drops and you can read it cleanly.", common_mistake: "AI has runner break for home on contact instead of freezing on line drives", source: "Pro Baseball Insider" },
  ],
  manager: [
    { setup: "Starter has faced the lineup 3 times, pitch count at 90", real_decision: "Get the bullpen ready — TTO effect means batters are timing him", why_real: "Third-time-through, batting average jumps ~30 points. It's data-backed", common_mistake: "Ignoring pitch count and TTO in favor of 'feel'", source: "Baseball Prospectus TTO data" },
    { setup: "Tie game, bottom 8th, leadoff runner reaches", real_decision: "Consider a sacrifice bunt only if the next hitter is weak", why_real: "RE24 says bunting usually lowers run expectancy — but context matters", common_mistake: "Always bunting the runner over or never bunting", source: "The Book (Tango et al.)" },
    { setup: "Closer has pitched 3 straight days", real_decision: "Find someone else. Fatigue + injury risk > saving one game", why_real: "Overuse injuries end seasons. One game isn't worth a blown arm", common_mistake: "Always bringing in the closer regardless of workload", source: "Pitching analytics consensus" },
    { setup: "Runner on first, 1 out, batter has been hitting well", real_decision: "Let him hit — don't bunt away an out with a hot hitter", why_real: "Bunting a good hitter is giving away an at-bat", common_mistake: "Auto-bunting in 'bunt situations' without considering who's batting", source: "FanGraphs RE24" },
    { setup: "Opposing team's best hitter comes up with first base open", real_decision: "Only walk him if the on-deck hitter is significantly worse AND force at home matters", why_real: "IBB puts the go-ahead run on base. It's rarely correct", common_mistake: "Walking good hitters reflexively", source: "The Book (Tango et al.)" },
    { setup: "Defensive alignment with a pull-heavy left-handed hitter", real_decision: "Shade the defense toward right side, but keep 2 infielders on each side (2023+ rules)", why_real: "Full shifts are banned. You can shade but can't overload one side", common_mistake: "Using banned pre-2023 shift strategies", source: "MLB 2023 rule changes" },
    { setup: "Starter at 90 pitches in the 7th, 2-run lead, facing bottom of order", real_decision: "Let him face the 7-8-9 hitters if he's sharp. Save the bullpen for the top of the order in the 8th.", common_mistake: "AI pulls starter based on pitch count alone without considering opponent, game state, or bullpen usage", source: "Pitching analytics consensus" },
    { setup: "Down 1 run, runner on 1st, 0 outs, weak hitter up", real_decision: "Sacrifice bunt is justified here — weak hitter, need 1 run, move runner to scoring position with better hitters coming up.", common_mistake: "AI always says 'bunting lowers RE24' without considering that RE24 analysis changes when the batter is weak and only 1 run is needed", source: "The Book (Tango et al.)" },
    { setup: "Tie game, bottom 9th, runners on 2nd and 3rd, 1 out, their cleanup hitter up", real_decision: "Intentional walk to load the bases — sets up force at home and double play. The cleanup hitter is their most dangerous bat.", common_mistake: "AI says IBB is always wrong, but with 2nd+3rd occupied and 1 out, loading bases for the force/DP is textbook", source: "The Book (Tango et al.)" },
  ],
};

// Phase C2: Coaching voice patterns — how real coaches talk
const COACHING_VOICE = {
  right_answer: [
    "That's heads-up baseball right there.",
    "You read that perfectly.",
    "Smart play — that's what coaches love to see.",
    "Exactly what a pro would do in that spot.",
    "Good instincts. You let the game come to you.",
    "That's playing the game the right way.",
    "Your baseball IQ is showing.",
    "You trusted your training and it paid off.",
  ],
  wrong_answer: [
    "That's a common mistake — here's what to look for next time.",
    "Good effort, but let's talk about what happened.",
    "Even pros make that mistake early on.",
    "Think about it this way...",
    "Here's the thing most players don't realize...",
    "Close, but there's a better play here.",
  ],
  tone_guidance: [
    "Get your feet moving BEFORE the ball gets there.",
    "Don't try to be a hero — hit your cutoff man.",
    "Always know where your next throw is going before you catch the ball.",
    "Two outs changes everything — be aggressive on the bases.",
    "Play catch, don't play throw. Accuracy beats arm strength.",
    "See the ball, read the ball, react to the ball. In that order.",
    "Never assume the play is over — always back up.",
    "You've got to want the ball hit to you.",
    "Stay on your toes. The play happens fast.",
    "Keep your head in the game between pitches.",
    "Routine plays win ball games.",
    "Hustle is free — it doesn't cost you anything.",
    "Trust your teammates — they've got their job, you've got yours.",
    "Think one pitch ahead. What do I do if...?",
  ],
};

// Phase C3: Decision windows — groups options by WHEN they happen
// All 4 options in a scenario must occur in the SAME window
const DECISION_WINDOWS = {
  pitcher: {
    pre_pitch: "Before delivering: pitch selection, pickoff look, checking runners, setting up",
    during_delivery: "During the pitch: location, grip adjustment, release point",
    after_contact: "After ball is hit: fielding position, covering bases, backing up",
    between_pitches: "Between pitches: tempo, holding runner, reading batter",
  },
  catcher: {
    pre_pitch: "Before the pitch: calling pitch/location, setting up target, positioning",
    receiving: "Receiving the pitch: framing, blocking, catching",
    after_contact: "After contact: fielding bunts, throwing out runners, directing traffic",
    between_pitches: "Between pitches: reading batter, checking runners, mound visit decision",
  },
  batter: {
    pre_pitch: "Before the pitch: stance, approach, looking for signs",
    pitch_recognition: "Pitch is coming: swing/take decision, pitch recognition, timing",
    contact: "Making contact: swing type, placement, execution",
    on_base: "After reaching base: leadoff, reading pitcher, next play awareness",
  },
  baserunner: {
    pre_pitch: "Before the pitch: lead distance, steal attempt, positioning, read the pitcher's move",
    on_contact: "React to ball off bat — freeze on line drive, advance on ground ball, read fly ball depth",
    after_catch: "Tag-up decision, advance or hold after outfielder catches fly ball",
    between_pitches: "Adjust lead, read catcher's signs, evaluate count for steal opportunity",
  },
  manager: {
    between_batters: "Pitching changes, defensive substitutions, positioning shifts, mound visits",
    before_pitch: "Steal sign, bunt sign, hit-and-run sign, pitchout call",
    between_innings: "Bullpen warm-up decisions, pinch-hitter prep, lineup card adjustments",
    during_at_bat: "Intentional walk signal, mound visit timing, defensive alignment mid-AB",
  },
  infielder: {
    pre_pitch: "Before the pitch: positioning, depth, ready position, anticipation",
    after_contact: "Ball is hit: fielding, throwing, covering bases, relay/cutoff",
    no_ball: "Ball not hit to you: covering bases, backing up, cutoff position",
    between_pitches: "Between pitches: adjusting position, checking runners, communication",
  },
  outfielder: {
    pre_pitch: "Before the pitch: depth, shading, ready position",
    after_contact: "Ball is hit: tracking, catching, throwing to cutoff/base",
    no_ball: "Ball not hit to you: backing up, communication, positioning for relay",
    between_pitches: "Between pitches: adjusting depth, checking runners, sun/wind awareness",
  },
};

// ============================================================================
// BASEBALL BRAIN — Centralized knowledge engine for all game features
// Stats from FanGraphs RE24 (2015-2024 avg), Baseball Reference count data
// ============================================================================
