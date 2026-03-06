# Situation Room — Claude Code Prompts
## Copy-paste these prompts in order. Each is a self-contained task.

---

## PROMPT 1 of 12: Apply Audit Fixes (Critical)

```
TASK: Apply two critical audit fixes to SITUATION_SETS in index.jsx.

CONTEXT: We audited all 8 situation sets against KNOWLEDGE_MAPS, POS_PRINCIPLES, and the BRAIN constant. Two issues were found.

FIX 1 — SR4 Relay Assignment (line ~3750-3768):
The `desc` says "right-center gap" but uses the shortstop (sr4b) as the lead relay man. Per CUTOFF_RELAY_MAP: "Right side (RF-CF gap, RF line) lead relay=2B, trail=SS or 1B." The shortstop is the lead relay for LEFT side, not right.

SOLUTION: Change the desc from "right-center gap" to "left-center gap" so the SS as lead relay is correct. Specifically:
- SR4 desc: change "A line drive splits the outfielders into the right-center gap!" to "A line drive splits the outfielders into the left-center gap!"
- SR4 sr4a title: keep as "Center Fielder: Get the Ball In" (CF fields from left-center too)
- SR4 sr4b explanation for best answer: add a brief note that on left-side hits (LF line, LF-CF gap, deep CF), the SS is the lead relay man per standard assignments

FIX 2 — SR8 Position/Category Mismatch (line ~3844):
sr8c has `pos:"thirdBase"` but `cat:"manager"`. The third base COACH is a manager role, not the third baseman fielding position. This causes the answer to be tracked under thirdBase position stats when it's really a manager/coaching decision.

SOLUTION: Change sr8c from `pos:"thirdBase"` to `pos:"manager"`. Keep the title as "Third Base Coach: Send or Hold?" and keep `cat:"manager"` as-is. The scenario correctly describes a coaching decision, not a fielding play.

IMPORTANT: Only change these specific fields. Do not modify any other scenario content.
```

---

## PROMPT 2 of 12: Add Debrief Narratives to All 8 Situation Sets

```
TASK: Add `debrief` and `teamworkTakeaway` string fields to each of the 8 SITUATION_SETS objects in index.jsx. Currently, the results screen generates a generic 3-tier teamwork message based on score %. We want custom per-situation narratives instead.

CONTEXT: SITUATION_SETS is defined around line 3684 of index.jsx. Each set has: id, title, emoji, color, situation, desc, questions[]. We're adding two new fields to each set object.

ADD THESE FIELDS to each situation set (add them right after the `desc` field):

SR1 (Bases Loaded Jam):
debrief: "The pitcher threw a low fastball, and the catcher had already set up low-and-away — they were on the same page. The batter hit a grounder to short, who flipped to second for one, and the relay to first completed the double play. Meanwhile, the smart baserunner on third read the sharp grounder and held — if he'd run blindly, he would have been the third out. The pitcher's location, the catcher's setup, and the baserunner's patience all worked together."
teamworkTakeaway: "A double play only works when the pitcher pitches for grounders, the catcher calls for the right location, and the baserunner reads the ball before committing. One breakdown in the chain changes everything."

SR2 (Steal Attempt at Second):
debrief: "The pitcher used a slide step, cutting delivery time from 1.5 seconds to 1.2 seconds. That extra 0.3 seconds gave the catcher time to make a clean transfer and fire to second. The shortstop timed his break perfectly — arriving at the bag with the throw, straddling the front edge, and sweeping a low tag. The runner was out by half a step. Every fraction of a second mattered."
teamworkTakeaway: "Stopping a stolen base is a relay chain: pitcher's delivery time + catcher's transfer and throw + fielder's tag. If any link is slow, the runner is safe. The slide step is what makes the whole chain possible."

SR3 (Sacrifice Bunt):
debrief: "The pitcher threw a high fastball — the toughest pitch to bunt. The third baseman charged hard and the first baseman crashed in from the other side, creating a wall of defenders. The batter did the smart thing and bunted softly down the first-base line, away from the charging third baseman. The pitcher fielded it, threw to first (where the second baseman was covering), and the runner moved to second. Sacrifice successful, but the defense made it as hard as possible."
teamworkTakeaway: "Bunt defense is choreography — every defender has an assigned role. The pitcher makes the bunt difficult, corners charge, middle infielders cover the vacated bases. The batter's job is to find the gap in the defense. Both sides are executing a plan."

SR4 (Extra-Base Hit to the Gap):
debrief: "The ball split the outfielders into the left-center gap. The center fielder sprinted to the ball, set his feet, and threw a strong one-hopper to the shortstop, who had sprinted out to be the relay man — arms up, lined up between the outfielder and home plate. The shortstop caught the relay and fired home. The baserunner rounded third hard, read the relay throw coming in strong and on-line, and held at third. Smart aggression — he pressured the defense without running into an out."
teamworkTakeaway: "The relay system only works when everyone does their specific job: the outfielder hits the relay man, the relay man lines up correctly, and the baserunner reads the throw before committing. The ball moves faster than any runner — that's why the relay exists."

SR5 (Full Count Showdown):
debrief: "Full count, two outs, tie game. The pitcher trusted his best pitch — a fastball on the corner — and threw it with conviction. The batter took the championship approach: protect the plate, foul off tough pitches, put hittable ones in play. The manager had already sent the runner from second, knowing there was no downside on a full count with two outs. The batter lined a single to right, and the runner scored from second easily with his head start. Ballgame."
teamworkTakeaway: "In high-leverage moments, every role simplifies: the pitcher competes with his best stuff, the batter refuses to go down without a fight, and the manager makes sure the runners are in motion. Trust, aggression, and awareness win these moments."

SR6 (Squeeze Play Alert):
debrief: "The squeeze was on. The runner on third broke for home as the pitcher started his delivery. The batter squared late — at the last possible moment — to keep the element of surprise. He bunted everything, getting the bat on a tough pitch and rolling it up the first-base line. The run scored. On the defensive side, the third baseman had been watching the runner's lead, saw him break early, and yelled 'SQUEEZE!' — but the call came just a fraction too late for the pitcher to adjust. Execution beats reaction."
teamworkTakeaway: "The squeeze play is baseball's most dramatic gamble. The runner commits blindly, the batter MUST make contact, and the defense has to recognize it in real-time. The offense wins through timing and commitment; the defense wins through recognition and communication."

SR7 (Rundown Chaos):
debrief: "Runners on first and third, and the runner on first got caught in a rundown. The first baseman chased him toward second — ball held high, running hard — while keeping one eye on the runner at third. The shortstop closed the gap from the second-base side, shortening the runway. When the runner at third saw the ball thrown toward second (away from home), he broke for the plate. The first baseman, alert to this exact situation, threw home instead. The catcher applied the tag. One out in the rundown, and the defense kept the runner at third honest."
teamworkTakeaway: "In a first-and-third rundown, the defense has to solve two problems at once: get the out on the caught runner AND watch the runner at third. The runner at third has to time his break for when the ball moves away from home. Both sides are thinking two moves ahead."

SR8 (Tag-Up at Warning Track):
debrief: "Deep fly ball to center. The center fielder camped under it, caught it cleanly with momentum toward home, crow-hopped, and fired a throw on a line toward the plate. The baserunner on third tagged up the instant the ball hit leather, read the outfielder's throw, and saw it was strong and on-line. The third base coach read the same thing and held the runner. Smart play — a run scoring on a sacrifice fly is only valuable if you actually score. Running into the tag wastes the out."
teamworkTakeaway: "Tag-up plays are a three-way calculation: the outfielder's depth and arm strength, the runner's speed and read, and the third base coach's judgment. The coach sees the whole play — the runner trusts the coach, and the outfielder makes his best throw. Everyone reads the same situation differently based on their role."

ALSO: Update the Situation Results screen (around line 13036-13056) to USE these new fields. Replace the generic teamworkTakeaway text with `sitSet.teamworkTakeaway`. Replace the debrief description (line ~13039) with `sitSet.debrief`.

Specifically, change:
- Line ~13039: `{sitSet.description||sitSet.title}` → `{sitSet.debrief||sitSet.desc}`
- Lines ~13052-13054: Replace the 3-tier generic message with `{sitSet.teamworkTakeaway||"Every position's decision connects to every other position's decision. That's what makes baseball a team sport."}`
```

---

## PROMPT 3 of 12: Enrich Explanations with BRAIN Data

```
TASK: Add specific BRAIN constant data references to the best-answer explanations across all 8 situation sets in SITUATION_SETS (index.jsx, ~line 3684). This connects the handcrafted content to our knowledge infrastructure.

CONTEXT: The BRAIN constant (line ~5413) contains RE24, countData, stealBreakEven, stealWindowMath, popTimeData, buntDelta, baserunningRates, and more. Currently NONE of the 26 Situation Room questions reference this data. We want to add brief stat references to the best-answer explanations so kids learn the WHY with real numbers.

RULES:
- Only modify the explanation at index [best] for each question (the correct answer explanation)
- Add 1-2 sentences at the end referencing specific BRAIN data
- Keep the existing explanation intact — just append the data reference
- Use simple, kid-friendly language for the stats ("Did you know..." or "The numbers back this up...")
- Put stats in context, don't just dump numbers

ENRICHMENTS PER SET:

SR1 (Bases Loaded Jam, count 1-2, R123, 1 out):
- sr1a (pitcher, best:0): Append: "The numbers back this up: with bases loaded and one out, the expected run value is 1.59. After a double play (bases empty, two outs), it drops to just 0.11. That's a massive 1.48-run swing on one play!"
- sr1b (catcher, best:0): Append: "At a 1-2 count, the batting average drops to just .180 — the pitcher has a big edge. Setting up low-and-away maximizes that advantage."
- sr1c (baserunner, best:1): Append: "Smart baserunners score from third on about 88% of tag-up opportunities, but only when they read the play correctly."

SR2 (Steal Attempt, count 1-1, R1, 0 outs):
- sr2a (pitcher, best:0): Append: "Here's the math: a normal delivery takes about 1.5 seconds. A slide step cuts it to about 1.2-1.3 seconds. With an average catcher pop time of 2.0 seconds, that 0.3-second difference is the difference between safe and out."
- sr2b (catcher, best:0): Append: "Elite catchers have a pop time (catch to throw arriving at 2B) of 1.85 seconds. Average is 2.0 seconds. Every tenth of a second matters when the runner's total time is around 3.3-3.5 seconds."
- sr2c (shortstop, best:0): Append: "With zero outs, the steal break-even rate is 72% — the runner needs to be safe 72% of the time for stealing to be worth the risk. Good defense pushes that success rate down."

SR3 (Sacrifice Bunt, count 0-0, R1, 0 outs, tied):
- sr3a (pitcher, best:0): Append: "Studies show that bunts on high fastballs result in popups or foul balls significantly more often than bunts on low pitches. You're turning the batter's sacrifice into your advantage."
- sr3b (3B, best:0): No stat to add — this is about technique. Leave as-is.
- sr3c (1B, best:2): No stat to add — technique-focused. Leave as-is.
- sr3d (batter, best:1): Append: "Fun fact: a sacrifice bunt with a runner on first costs about 0.23 expected runs compared to swinging away. But in a tie game in the 7th, moving the runner to scoring position is worth more than those numbers suggest because of win probability."

SR4 (Extra-Base Hit to Gap, R1, 1 out):
- sr4a (CF, best:1): Append: "A throw from deep center to home is about 300+ feet. Even elite arms lose accuracy at that distance. The relay system breaks it into two 150-foot throws — faster and more accurate."
- sr4b (SS, best:0): Append: "The relay man should position about 150 feet from home plate, in a direct line between the outfielder and home. Arms up high — you're the outfielder's target."
- sr4c (baserunner, best:1): Append: "Runners go from first to third successfully about 28% of the time on singles — but on extra-base hits to the gap, third base is almost automatic. The question is whether to try for home."

SR5 (Full Count, 3-2, R2, 2 outs, tied):
- sr5a (pitcher, best:0): Append: "At a 3-2 count, the batting average is .230 with an OBP of .350. The count is basically neutral — neither side has a clear edge. That's why your best pitch with conviction is the right call."
- sr5b (batter, best:1): Append: "At 3-2, the batting average is .230, but the OBP jumps to .350 because of walks. Protecting the plate keeps both outcomes alive — you can get a hit OR draw the walk."
- sr5c (manager, best:0): Append: "With two outs and a full count, there's zero risk in sending the runner. Ball four = free advance. Strikeout = inning over regardless. Contact = huge head start. It's a free play."

SR6 (Squeeze Play, 1-1, R3, 1 out):
- sr6a (batter, best:1): Append: "On a suicide squeeze, the runner commits the moment the pitcher starts his delivery. If you don't bunt the ball, the catcher has it and the runner is out by 20 feet. That's why you MUST get the bat on the ball — no matter where the pitch is."
- sr6b (pitcher, best:0): Append: "A pitch up and in is nearly impossible to bunt down onto the ground. The bat angle required to bunt a high-inside pitch almost guarantees a popup or foul ball — exactly what you want when the runner is committed."
- sr6c (3B, best:0): No stat — communication-based. Leave as-is.

SR7 (Rundown, R1+R3, 0 outs):
- sr7a (1B, best:0): Append: "The #1 rule of rundowns: get the out in as few throws as possible. Every throw is a chance for an error, and every second gives the runner at third more time to read the play."
- sr7b (SS, best:1): Append: "In a well-executed rundown, the tag should happen within one throw — two at most. Closing the gap makes that possible. Standing at the bag means 2-3 throws, which means 2-3 chances for something to go wrong."
- sr7c (baserunner R3, best:1): No new stat — timing-based. Leave as-is.

SR8 (Tag-Up, R3, 1 out):
- sr8a (CF, best:1): Append: "The crow hop transfers energy from your legs into the throw. Without it, you're throwing with arm only. With it, you can add 5-10 mph to your throw — that's the difference between beating the runner and not."
- sr8b (baserunner, best:1): Append: "Runners score from third on sacrifice flies about 88% of the time overall. But that drops significantly on shallow flies or throws from strong-armed outfielders. Reading the depth is what keeps that success rate high."
- sr8c (3B coach, best:1): No new stat — judgment-based. Leave as-is.

IMPORTANT: Only modify the explanation at the `best` index. Do not change options, rates, concepts, explSimple, or any other fields.
```

---

## PROMPT 4 of 12: Add Difficulty Tiers and State Tracking

```
TASK: Add difficulty tiers to the Situation Room and update state tracking.

PART A — Add `diff` field to SITUATION_SETS:
All 8 existing sets are Pro difficulty. Add `diff:2` to each set object (right after `color`).

PART B — Add sitMastery to DEFAULT state:
Find the DEFAULT object (around line 2870). Add this field:
sitMastery: {}
// Shape: { [setId]: { bestGrade:"A", attempts:1, grades:["A","B"], perfectCount:0, lastPlayed:null } }

PART C — Track Situation Room progress:
In the situation results handler (where the final grade is computed on the results screen, around line 13001), add logic to update sitMastery:

After computing `pct` (the percentage score), compute the grade:
- 100% = "S" (perfect)
- 80-99% = "A"
- 60-79% = "B"
- 40-59% = "C"
- Below 40% = "D"

Then update stats:
```javascript
const grade = pct===100?"S":pct>=80?"A":pct>=60?"B":pct>=40?"C":"D";
const setId = sitSet.id;
const prev = stats.sitMastery[setId] || { bestGrade:null, attempts:0, grades:[], perfectCount:0, lastPlayed:null };
const gradeRank = {S:5,A:4,B:3,C:2,D:1};
const newBest = !prev.bestGrade || gradeRank[grade] > gradeRank[prev.bestGrade] ? grade : prev.bestGrade;
const newMastery = {
  bestGrade: newBest,
  attempts: prev.attempts + 1,
  grades: [...prev.grades.slice(-9), grade],  // keep last 10
  perfectCount: prev.perfectCount + (pct===100?1:0),
  lastPlayed: Date.now()
};
// Save to stats
```

Integrate this into the existing save flow (wherever `setStats` is called after situation completion).

PART D — Show grades on Situation Picker:
On the Situation Picker screen (around line 12936), show the best grade badge on each situation card if the player has completed it:
- S grade: gold star emoji ⭐ with gold border
- A grade: green badge
- B grade: blue badge
- C grade: yellow badge
- D grade: gray badge
- Not played: no badge

Also show attempt count as small text: "Played 3x" or "New!" if never played.
```

---

## PROMPT 5 of 12: Create Rookie Difficulty Variants (Ages 6-10)

```
TASK: Create Rookie (diff:1) variants of all 8 existing situation sets. These are simpler versions for younger players (ages 6-10).

CONTEXT: The existing 8 sets are all diff:2 (Pro). Rookie variants should:
- Have only 2 questions per set (the two most important positions)
- Use the `explSimple` text (already exists on most questions) as the primary explanations
- Set ageMin:6, ageMax:10
- Use simpler options (more obviously right/wrong)
- Wider rate differentials (best at 90+, wrong at 5-15)
- Shorter explanations (2-3 sentences max)

CREATE 8 NEW SITUATION SETS with IDs sr1r, sr2r, sr3r, sr4r, sr5r, sr6r, sr7r, sr8r. Add them to the SITUATION_SETS array after the existing 8.

FORMAT: Same structure as existing sets. Each should have `diff:1` and a title suffix like "Bases Loaded Jam (Rookie)".

POSITION SELECTIONS PER ROOKIE SET:
- sr1r: pitcher + baserunner (the two most educational)
- sr2r: pitcher + catcher (steal defense basics)
- sr3r: batter + pitcher (bunt offense + defense basics)
- sr4r: centerField + baserunner (relay basics + running basics)
- sr5r: pitcher + batter (full count basics)
- sr6r: batter + pitcher (squeeze basics)
- sr7r: firstBase + baserunner (rundown basics)
- sr8r: baserunner + centerField (tag-up basics)

For each question:
- Use the same `situation` object as the parent set
- Set diff:1, ageMin:6, ageMax:10
- Use `explSimple` from the parent question as the primary `explanations`
- Simplify options if any are too complex for ages 6-10
- Best answer rates at 92, wrong answers at 5-15
- Add `concept` text written at a 2nd-3rd grade reading level
- No `explSimple` needed on rookie sets (the main explanations ARE simple)

Use the same conceptTags, anims, and cats as the parent questions.

Add debrief and teamworkTakeaway to each rookie set — written simply:
- debrief: 2-3 simple sentences describing what happened
- teamworkTakeaway: 1 sentence about teamwork, age-appropriate
```

---

## PROMPT 6 of 12: Create All-Star Difficulty Variants (Ages 12-18)

```
TASK: Create All-Star (diff:3) variants of all 8 existing situation sets. These are advanced versions with 4-5 positions and tighter decision margins.

CONTEXT: The existing 8 sets are all diff:2 (Pro) with 3-4 questions each. All-Star variants should:
- Have 4-5 questions per set (add the missing positions identified in the audit)
- Tighter rate differentials (best at 78-82, second-best at 45-55, others at 15-25)
- Reference BRAIN data in explanations (RE24, count leverage, steal math)
- Reference KNOWLEDGE_MAPS assignments explicitly
- Set ageMin:12, ageMax:99
- More nuanced wrong answers that could seem correct
- Longer, more detailed explanations

CREATE 8 NEW SITUATION SETS with IDs sr1a3, sr2a3, sr3a3, sr4a3, sr5a3, sr6a3, sr7a3, sr8a3. Add them to SITUATION_SETS after the Rookie sets.

POSITIONS TO ADD PER ALL-STAR SET (these are the "missing positions" from the audit):
- sr1a3: Add shortstop (DP pivot positioning from DP_MAP) + keep pitcher, catcher, baserunner = 4 questions
- sr2a3: Add secondBase (coverage/hole awareness) + keep pitcher, catcher, shortstop = 4 questions
- sr3a3: Add secondBase (covering 1st) + keep all 4 existing = 5 questions
- sr4a3: Add secondBase (trail relay per CUTOFF_RELAY_MAP) + pitcher (backup per BACKUP_MAP) + keep CF, SS, baserunner = 5 questions
- sr5a3: Add shortstop (positioning with R2/2 outs) + keep pitcher, batter, manager = 4 questions
- sr6a3: Add catcher (squeeze defense at the plate) + keep batter, pitcher, thirdBase = 4 questions
- sr7a3: Add catcher (watching R3) + secondBase (covering behind 1B) + keep 1B, SS, baserunner = 5 questions
- sr8a3: Add firstBase (cutoff man role) + keep CF, baserunner, 3B coach = 4 questions

FORMAT: Same structure as existing sets. Use `diff:3`. Title suffix "(All-Star)".

For each NEW question added:
- Reference the appropriate KNOWLEDGE_MAP for that position's role
- Include BRAIN data where applicable
- conceptTag should match the situation theme
- Rates: best at 80, second-best at 50, others at 15-25
- Explanations should cite specific rules/maps (e.g., "Per standard relay assignments, the second baseman is the trail man on right-side hits...")

For the EXISTING questions carried over:
- Make explanations more detailed and analytical
- Reference BRAIN data (RE24, count leverage, etc.)
- Tighten rates (best from 88 to 80, making it feel harder)
- Keep the same options and best answer index

Add debrief and teamworkTakeaway at advanced level with specific terminology and data references.
```

---

## PROMPT 7 of 12: Redesign Situation Picker Screen

```
TASK: Redesign the Situation Picker screen (around line 12936 in index.jsx) to show difficulty tiers and progress.

CURRENT STATE: The picker shows a flat vertical list of situation cards with a completion checkmark. It doesn't show difficulty, grades, or progress.

NEW DESIGN:

1. DIFFICULTY TABS at the top:
- Three tabs: "⭐ Rookie" | "⭐⭐ Pro" | "⭐⭐⭐ All-Star"
- Default to the player's appropriate tab (based on stats.ageGroup or overall level)
- Active tab gets a colored underline (green/blue/purple)
- All-Star tab locked until player has 3+ "A" grades at Pro level (show lock icon + "Get 3 A's at Pro to unlock")

2. CARD GRID (2 columns instead of vertical list):
Each card shows:
- Emoji + Title (current)
- Difficulty stars (⭐/⭐⭐/⭐⭐⭐)
- Best grade badge (S/A/B/C/D or "NEW" if unplayed) — use color coding from Prompt 4
- Position icons in a row (small emoji for each position in the set)
- Attempt count: "Played 3x" or "NEW!"
- Completion checkmark if grade is A or better

3. RECOMMENDED BADGE:
If the player has weak positions that appear in a situation set, show a small "📍 Recommended" badge. Use the existing practice recommendation logic to identify weak positions, then match against each situation set's position list.

4. SORT: Default to "Recommended first, then by last played (oldest first)"

5. HEADER: Show aggregate stats:
"🏟️ Situation Room — [X] of [Y] mastered | Best streak: [Z]"
Where "mastered" = grade A or better

STYLING: Match existing app dark theme. Cards should have the situation's `color` as a subtle left border or accent. Use the existing `card` style base. Grid gap of 10px.

Keep the existing back button and navigation logic. The card tap should go to the sitIntro screen for that set (same as current behavior).
```

---

## PROMPT 8 of 12: Situation HUD Component

```
TASK: Build a SituationHUD component that shows during Situation Room play, and add position transition animations between questions.

CONTEXT: When playing a Situation Room set, the player answers 2-5 questions sequentially (one per position). Currently there's no visual indicator of which position they're on or how many remain.

PART A — SituationHUD Component:
Create a small (~55px tall) persistent HUD that shows above the play screen when `sitMode === true`.

Layout (horizontal, centered):
[Position dots] — [Game state mini-display] — [Set title]

Position dots: A row of circles for each question in the set.
- Completed correct: ✅ green filled circle
- Completed wrong: ❌ red filled circle
- Current: 🔵 pulsing blue circle with current position emoji inside
- Upcoming: ⚪ gray outlined circle

Game state mini-display: Tiny inline text showing:
"Bot 6 | 1 Out | 🟢🟢🟢" (runners as dots) — pulled from sitSet.situation

Set title: Small text showing the situation name, e.g., "🔥 Bases Loaded Jam"

Style: Dark semi-transparent background (rgba(0,0,0,0.6)), rounded corners, slight blur. Fixed at top of play area. Should not obscure the question content.

PART B — Position Transition:
Between questions (when sitQ advances), show a 1.5-second transition screen:

1. Quick fade-out of current question (0.3s)
2. Position announcement banner (0.9s):
   - Large position emoji
   - "Now you're the CATCHER" (or appropriate position label from POS_META)
   - Position color background pulse
   - Small text: "Question 2 of 4"
3. Fade-in of next question (0.3s)

IMPLEMENTATION:
- Add a `sitTransition` state variable (boolean)
- When advancing between situation questions (in the `next()` callback around line 11070), set `sitTransition = true`
- After 1.5s timeout, set `sitTransition = false` and show the next question
- Render the transition overlay when `sitTransition === true`
- The HUD stays visible during transitions

PART C — Wire into existing flow:
- Show SituationHUD when `sitMode && screen === "play"`
- Pass `sitSet`, `sitQ`, `sitResults` as props
- Hide it on the sitResults screen (it's no longer needed there)
```

---

## PROMPT 9 of 12: Film Room Animated Debrief

```
TASK: Replace the static "How the Play Unfolded" text debrief on the Situation Results screen with an animated "Film Room" that steps through each position's decision on the field.

CONTEXT: The results screen is around line 13001 in index.jsx. Currently it shows a vertical list of position results with text explanations. We want to make this cinematic.

NEW DESIGN — "🎬 Film Room":

STEP-THROUGH MODE:
The Film Room shows one position at a time, with the Field() SVG component in the background highlighting the relevant position.

For each step:
1. Field visualization shows the game state with the current position highlighted (brighter color, slight glow)
2. Position banner: emoji + label + "Position 2 of 4"
3. The player's choice appears: "You chose: [option text]"
4. Result reveal: ✅ "Optimal!" (green) or ❌ "Not quite..." (red)
5. The best-answer explanation text appears (scrollable if long)
6. Brief pause, then auto-advance to next position (or tap to advance)

CONTROLS:
- Auto-advance with a progress bar (4 seconds per step)
- Tap anywhere to advance immediately
- "Skip to Summary" button in top-right corner
- After all positions, transition to the existing summary view (grade, teamwork takeaway)

IMPLEMENTATION:
Add a `filmStep` state (integer, -1 = not started, 0 to N-1 = position steps, N = summary).

Replace the debrief section (lines ~13036-13056) with:
```
{filmStep < sitSet.questions.length ? (
  // Step-through mode: show Field + current position highlight + choice + explanation
  <FilmRoomStep
    question={sitSet.questions[filmStep]}
    result={sitResults[filmStep]}
    step={filmStep}
    total={sitSet.questions.length}
    situation={sitSet.situation}
    onNext={() => setFilmStep(f => f + 1)}
    onSkip={() => setFilmStep(sitSet.questions.length)}
  />
) : (
  // Summary mode: show the existing debrief + teamworkTakeaway + grade
  <FilmRoomSummary ... />
)}
```

The FilmRoomStep component should:
- Render Field() with the current situation's game state
- Highlight the current position's player on the field (use the existing animation system or a simple glow effect)
- Show choice and explanation with entrance animation (slide up)
- Auto-advance timer with visible progress bar at bottom

For the Field() highlight, use the existing position coordinates:
- pitcher: around mound (200, 218)
- catcher: home (200, 290)
- firstBase: (290, 210)
- secondBase: (245, 165)
- shortstop: (155, 165)
- thirdBase: (110, 210)
- leftField: (80, 90)
- centerField: (200, 60)
- rightField: (320, 90)
- batter: near home
- baserunner: varies by runner position
- manager: dugout area

Add a subtle SVG circle glow around the highlighted position (same technique as existing animations but static).

Keep the existing summary elements (grade display, "Play Another" button, "Back to Home" button) in the summary view after all steps complete.
```

---

## PROMPT 10 of 12: Daily Situation & Mastery Tiers

```
TASK: Add Daily Situation mode and Bronze/Silver/Gold/Diamond mastery tier badges.

PART A — Daily Situation:
Add a "📅 Daily Situation" card to the home screen (near the existing Daily Diamond card). One rotating situation per day, always at Pro difficulty.

Implementation:
1. Use date-based seed to select today's situation:
```javascript
const getDailySituation = () => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
  const proSets = SITUATION_SETS.filter(s => s.diff === 2);
  return proSets[seed % proSets.length];
};
```

2. Daily Situation is exempt from the free-tier daily play limit (like Daily Diamond)
3. Track in stats: `dailySitStreak` (consecutive days played), `dailySitBestStreak`, `lastDailySitDate`
4. Show streak on the home card: "🔥 3-day streak!"
5. If already played today, show the grade and "Come back tomorrow!"
6. Tapping the card goes directly to that situation's intro screen

Home screen card style: Match Daily Diamond's visual weight. Use a calendar emoji and a different accent color (teal/cyan).

PART B — Mastery Tier Badges:
For each situation set in sitMastery, compute a tier:
- 🥉 Bronze: Completed at least once (any grade)
- 🥈 Silver: Best grade is B or better
- 🥇 Gold: Best grade is A or better
- 💎 Diamond: Perfect score (grade S) on the highest available difficulty

Show the tier badge on:
1. The Situation Picker cards (replace or augment the grade badge)
2. The results screen after completion ("You earned Gold on this situation!")
3. A new "Situation Room" section on the profile/stats screen showing aggregate tiers

PART C — Situation Room Rank:
Compute an aggregate rank based on total mastery tiers across all situation sets:
- "Scout" — 0-3 Bronze+ tiers
- "Coordinator" — 4-7 Bronze+ tiers
- "Dugout Genius" — 8-14 Silver+ tiers
- "Field General" — 15+ Gold+ tiers
- "Hall of Fame Strategist" — All situations at Diamond

Show the rank on the Situation Room home card and the picker header.
```

---

## PROMPT 11 of 12: Connect to Mastery & Spaced Repetition Systems

```
TASK: Wire the Situation Room into the existing mastery system and spaced repetition engine.

CONTEXT: The app has a 5-state mastery system (unseen → introduced → learning → mastered → degraded) tracked per concept, and a spaced repetition system that schedules reviews based on wrongCounts. Currently, Situation Room answers don't feed into either system.

PART A — Feed Situation Room answers into mastery tracking:
When a Situation Room question is answered (in the outcome handler around line 11020-11070):

1. Extract the `conceptTag` from the current situation question
2. Call the same mastery update logic used for regular scenarios:
   - Correct answer: advance concept toward mastery (same rules: 3 consecutive correct, etc.)
   - Wrong answer: increment wrongCounts[conceptTag], potentially degrade mastery

Look at how the regular play mode updates mastery (search for `wrongCounts` and concept mastery updates in the outcome handler). Replicate that same logic for situation room answers.

3. Track the scenario ID in `stats.cl` (completed list) using the situation question ID (e.g., "sr1a", "sr3d")

PART B — Feed into spaced repetition:
When a situation question is answered wrong:
1. Add/increment `stats.wrongCounts[questionId]`
2. The existing spaced repetition system will then surface related concepts in practice recommendations

PART C — Use mastery data to recommend situations:
In the Situation Picker, compute a "relevance score" for each situation set based on:
1. Does the set contain positions where the player is weak? (+10 per weak position)
2. Does the set contain concepts that are due for review (degraded or never mastered)? (+15 per due concept)
3. Has the set never been played? (+5 for novelty)
4. Was the last grade below B? (+10 for improvement opportunity)

Sort "Recommended" situations by this score. Show the "📍 Recommended" badge on sets with score > 15.

PART D — Situation Room in practice recommendations:
On the home screen "Recommended for You" section, include Situation Room sets when:
- Player has 2+ weak positions that appear together in a situation set
- Player has degraded concepts that match situation conceptTags
- Show: "Try the Situation Room! 🏟️ [Set Title] covers [position1] and [position2]"

This integrates with the existing `getPracticeRecommendations()` function (search for it). Add a new recommendation type: "situation_room" alongside the existing "position" and "concept" types.
```

---

## PROMPT 12 of 12: AI-Generated Situation Sets

```
TASK: Build generateAISituation() — a function that creates complete multi-position situation sets using the existing AI pipeline.

CONTEXT: The app already has a sophisticated generateAIScenario() function (line ~8357) that generates single-position scenarios via xAI Grok through a Cloudflare Worker proxy. It includes a 9-layer quality firewall. We need to extend this for multi-position situation sets.

STEP 1 — Create generateAISituation() function:
Add this after generateAIScenario() in index.jsx.

```javascript
async function generateAISituation(stats, masteryData) {
  // 1. Identify 3-4 positions to include based on player weaknesses
  // Use getWeakPositions() or similar logic
  // Ensure positions make sense together (e.g., pitcher+catcher+batter makes sense,
  // but pitcher+pitcher+pitcher doesn't)

  // 2. Select a coherent game state
  // Pick from realistic scenarios: bases loaded, steal situation, bunt, relay, etc.
  // Use REAL_GAME_SITUATIONS for authentic context

  // 3. Build the multi-position prompt
  // System prompt should include:
  // - The shared game state (inning, outs, count, runners, score)
  // - For each position: inject AI_POS_PRINCIPLES and AI_SCOPED_MAPS
  // - Inject DECISION_WINDOWS to ensure temporal consistency
  // - Inject COACHING_VOICE for explanation tone
  // - Include the mastery context (which concepts the player needs to practice)
  // - Request JSON output with: title, emoji, color, situation, desc, questions[], debrief, teamworkTakeaway

  // 4. Call the xAI API (same endpoint and method as generateAIScenario)

  // 5. Parse and validate the response

  // 6. Run quality firewall (extended for multi-position)

  // 7. Return the validated situation set or null on failure
}
```

STEP 2 — Multi-Position System Prompt:
The system prompt should be structured like this (adapt from the existing AI scenario prompt):

```
You are a baseball strategy expert creating a multi-position situation for an educational game.
TARGET: ages [ageMin]-[ageMax], difficulty [diff]

GAME STATE: [inning], [outs] out, count [count], runners on [bases], score [away]-[home]

Generate a situation set with questions for these positions: [pos1], [pos2], [pos3]

CRITICAL RULES:
1. All questions describe the SAME MOMENT in the play
2. Each position can only do actions appropriate to their role
3. [Inject DECISION_WINDOWS for temporal consistency]
4. [Inject POS_PRINCIPLES for each position]
5. [Inject relevant KNOWLEDGE_MAPS via AI_MAP_PRIORITY]

For each position's question, provide:
- title, conceptTag, options (4), best (index), explanations (4), rates (4), concept, anim
- explanations must reference specific data (RE24, count leverage, etc.)

Also provide:
- debrief: A narrative describing how all positions' decisions connect
- teamworkTakeaway: One sentence about the teamwork lesson

OUTPUT FORMAT: [JSON schema]
```

STEP 3 — Extended Quality Firewall:
Add these validation layers on top of the existing 9:
- Layer 10: Cross-position temporal consistency (all actions must happen at the same moment)
- Layer 11: Position role validation (no position doing another's job)
- Layer 12: Situation coherence (all questions reference the same game state)
- Layer 13: Debrief validation (must mention all positions)

STEP 4 — Trigger AI Situations:
Add an "🤖 AI Situation" button on the Situation Picker screen (Pro only):
- Purple accent color matching existing AI badge
- On tap: show loading spinner with "Creating a custom situation for you..."
- 20-second timeout with cancel button
- On success: go directly to the situation intro screen
- On failure: show "Couldn't create a situation right now. Try a handcrafted one!" and fall back to picker
- Track in stats: `aiSitCount` (total AI situations generated)

STEP 5 — Fallback:
If AI generation fails (timeout, validation failure, API error):
- Select a random unplayed handcrafted situation at the player's difficulty
- If all are played, select the one with the lowest grade
- Show it without the AI badge

NOTE: The AI proxy URL is stored in AI_PROXY_URL constant. Use the same fetch pattern as generateAIScenario() including the same timeout handling and cancel button logic.
```

---

## EXECUTION ORDER

Run these prompts in order. Each builds on the previous:

1. **Prompt 1** — Audit fixes (5 min) — prerequisite for all others
2. **Prompt 2** — Debrief narratives (10 min) — needed before Film Room
3. **Prompt 3** — BRAIN data enrichment (15 min) — standalone content improvement
4. **Prompt 4** — Difficulty tiers + state tracking (15 min) — prerequisite for Rookie/All-Star
5. **Prompt 5** — Rookie variants (20 min) — needs diff tiers from Prompt 4
6. **Prompt 6** — All-Star variants (25 min) — needs diff tiers from Prompt 4
7. **Prompt 7** — Picker redesign (15 min) — needs tiers + grades from Prompts 4-6
8. **Prompt 8** — Situation HUD (15 min) — standalone UI component
9. **Prompt 9** — Film Room debrief (20 min) — needs debriefs from Prompt 2
10. **Prompt 10** — Daily Situation + mastery tiers (15 min) — needs state from Prompt 4
11. **Prompt 11** — Mastery/spaced repetition integration (15 min) — needs mastery state
12. **Prompt 12** — AI generation (30 min) — most complex, benefits from all above

Total estimated time: ~3.5 hours of Claude Code sessions

---

## TIPS FOR CLAUDE CODE SUCCESS

- **One prompt at a time** — Don't combine prompts. Each is scoped to fit in one session.
- **Test after each prompt** — Open preview.html and verify the changes work before moving on.
- **If Claude Code struggles** — Break the prompt in half. The content-heavy prompts (5, 6) are the most likely to need splitting.
- **Line numbers may shift** — After each prompt, line numbers in index.jsx will change. Claude Code should search by content/variable names rather than relying on exact line numbers.
- **Backup first** — Before starting, commit the current index.jsx to git so you can roll back if needed.
