# Baseball Strategy Master — Full Playtesting Feedback & Claude Code Prompts
> Generated: February 26, 2026
> Tested by: Claude (Anthropic) — Full app walkthrough with PRO/Lifetime promo access
> App URL: https://bsm-app.pages.dev/

---

## WHAT'S WORKING GREAT ✅

- **Dynamic baseball field visualization** accurately shows runners on base, positions, and fielder placement — genuinely impressive and educational
- **Deep content library** — 466 scenarios across 13 positions/roles is substantial
- **Educational explanations** are excellent — the "key concept" after every answer teaches real baseball thinking
- **Famous Plays section** with historical context (Clemente's 3,000th hit!) teaches baseball history and character, not just strategy
- **Player/Stadium customization** is fantastic for kid engagement — jerseys, caps, bat styles, stadium unlocks, field themes
- **Multiple game modes** (Spring Training, Speed Round, Survival, Daily Diamond, AI Coach, Famous, Rules IQ, Count IQ) keep it fresh
- **Count IQ and Rules IQ** are genuinely great for kids learning the game from scratch
- **"Learning Moment" framing for wrong answers** is perfectly supportive — not punishing
- **Concept Mastery Map** and per-position accuracy stats are excellent for parents/coaches to see weak areas
- **Prestige season system and Field Themes** give long-term replay hooks
- **Team feature** with join codes is smart for leagues/teams playing together
- **Age selector** (6-8, 9-10, etc.) cycling through age ranges is a great feature
- **Coach Says fun facts** after correct answers (e.g. "Fun fact: The infield fly rule was created in 1895...") are a brilliant engagement touch

---

## BUGS FOUND 🐛

### Bug 1 — Wrong Title on Daily Diamond Play Scenario
The title says **"Teammate Hit a Homer"** but the body text says *"the batter before this one crushed a solo homer OFF YOUR FASTBALL"* — an **opponent** hit the homer, not a teammate. The title is the opposite of what happened and will confuse kids.

### Bug 2 — "Challenge a Friend" Button is Completely Non-Functional
It appears after every answer but clicking it does absolutely nothing — no modal, no share sheet, no URL copy, nothing. Dead UI.

### Bug 3 — "Hall of Fame" Nav Button is Non-Functional
Clicking it does nothing. No navigation, no modal, no scroll-to-section.

### Bug 4 — "PRO" Nav Badge is Non-Functional
Clicking the PRO badge in the header does nothing visible.

### Bug 5 — "Parent Report" Button is Completely Non-Functional
The button exists in the footer but clicking it produces zero response. **This is one of the most valuable features for the target market (parents of youth players) and it's completely broken.**

### Bug 6 — AI Coach Fallback Silently Drops "AI" Tag
After an AI-generated scenario, clicking "Next Challenge" silently serves a pre-built scenario with no "AI" badge and no indication the content changed. The user thinks they're still getting personalized AI content when they're not.

### Bug 7 — Speed Round Timer Starts Before Question is Visible
The countdown timer starts when the component mounts, but by the time the question and answers fully render, 2-4 seconds have already elapsed. Kids effectively get only 11-13 seconds, not 15.

### Bug 8 — "Best Run" Stat Label is Ambiguous
The header shows a "Best Run: 17" stat. It's unclear if this means best survival streak, best point run, or longest answer streak. Needs a tooltip or clearer label.

---

## CONTENT & DESIGN ISSUES 📋

### Issue 9 — Scoreboard Inconsistent Across Game Modes
- Speed Round: INN · SCORE · COUNT · OUTS ✅
- Survival: INN · SCORE · OUTS ❌ (COUNT missing)
- Rules IQ: INN · SCORE · OUTS ❌ (COUNT missing — matters for rules questions!)
- Manager: INN · SCORE · OUTS ❌ (intentionally? still inconsistent)

### Issue 10 — Hero Text "6 positions" is Wrong and Undersells the App
The tagline reads **"466 scenarios · 6 positions · Real MLB strategy"** but the app has **13 positions/roles** (Pitcher, Catcher, 1B, 2B, SS, 3B, LF, CF, RF, Batter, Runner, Manager + Famous/Rules/Counts categories). Fix the copy.

### Issue 11 — "Game 3 of 36" Label in Spring Training is Confusing
Each individual question is called "Game X of 36" — but these are scenarios/challenges, not full games. "Scenario 3 of 36" or "Challenge 3 of 36" is much clearer.

### Issue 12 — Questionable "Correct" Answer on Foul Ball Scenario
The Speed Round "Foul Ball Near Dugout" (3B position) marked *"Track the ball but pull up if within one step of the dugout — player safety first"* as WRONG, with the "correct" answer being *"know your surroundings — catch confidently, but never blindly run into the dugout."* Both teach essentially the same safety principle with different phrasing. This will confuse kids and coaches who've been taught the "pull up" rule explicitly.

### Issue 13 — Leaderboard is Device-Local Only
"Play on same device to compete" kills the social/competitive hook. Kids want to compete with teammates and friends. The leaderboard needs cloud sync.

### Issue 14 — No Progress Tracking on Famous Plays, Rules IQ, or Count IQ
Position cards show "X% · Y played" progress, but Famous, Rules, and Count sections show nothing. Kids don't know how far they've come.

### Issue 15 — Streak Break Lacks Emotional Payoff
When the flame streak resets to 1, there's no animation or "streak broken" moment. The emotional contrast (pain of breaking a streak → motivation to rebuild) is a major gamification lever that's missing.

### Issue 16 — No Onboarding for New Users
A new kid opens the app and sees an overwhelming home screen with 15+ options and no "Start Here" guidance. Spring Training is designed for this but it's buried mid-page with no recommended path.

### Issue 17 — "Change Position" Has No Picker UI
After answering, "Change Position" appears but clicking it randomly/silently switches positions with no UI to choose which position to switch to.

---

## MISSING FEATURES THAT WOULD MAKE THIS KILLER 🚀

### Feature 18 — "Explain More" Button After Answers
The key concept is 1-2 sentences. Kids and parents should be able to tap for a deeper explanation. Perfect use case for the AI coach.

### Feature 19 — Sound/Audio Effects
A "Sound On" toggle exists but I never heard a single sound during the entire session. Crowd noise, whooshes, and cheer effects would dramatically increase engagement for kids.

### Feature 20 — Animated Play Diagrams for Fielding Scenarios
For fielding scenarios (backup assignments, cutoffs, bunt coverage), a simple animated arrow diagram on the diamond showing WHERE to move would transform learning. Text-only instructions are the hardest to absorb.

### Feature 21 — Survival Difficulty Selector at Start
Difficulty tiers (Rookie/Pro/All-Star) exist but Survival drops you in without choosing your level. Add a difficulty screen before Survival begins.

### Feature 22 — Session Recap / "Today's Learning" Summary
No session summary exists. When a kid finishes playing, a "Here's what you learned today" recap with the key concepts they got right helps reinforce learning and gives parents something to discuss.

### Feature 23 — Team Features Need More Functionality
Create/Join team with code exists but then... nothing. No team leaderboard, no teammate stats, no "challenge your teammate" function. The team code is a dead end.

### Feature 24 — Daily Diamond Play Only Has 1 Scenario Per Day
For high-engagement kids, one scenario feels thin. Consider a "5-Play Daily Practice" for Pro users with the 2x XP bonus.

---

## CLAUDE CODE PROMPTS — COPY & PASTE READY

---

### PROMPT 1 — Fix the Non-Functional Buttons (Critical Bugs)

```
In the Baseball Strategy Master app, fix the following non-functional UI elements:

1. "Challenge a Friend" button (appears after answering a scenario): When clicked, it should open a share modal that:
   - Copies a challenge URL to clipboard with the scenario ID as a parameter
   - Shows "Copied! Send this to a friend to challenge them on this exact play"
   - Falls back to native share sheet on mobile devices (navigator.share API)

2. "Hall of Fame" nav button in the header: This should navigate to or reveal a dedicated Hall of Fame section showing the user's unlocked achievements, highest scores by mode, and personal records. If this page doesn't exist yet, create it as a panel or modal with a trophies/records view.

3. "PRO" nav badge in the header: Should open a modal showing the user's current subscription benefits (2x XP, AI Ready, Unlimited Plays, etc.) in a formatted list. Should not just be decorative dead UI.

4. "Parent Report" footer button: This is critical for the target market. When clicked it should open a modal showing:
   - Sessions played this week (count)
   - Total estimated play time (scenarios × ~30 seconds average)
   - Strongest position (highest accuracy %)
   - Weakest position (lowest accuracy %)
   - Concepts mastered this week (list of key concept text they got correct)
   - A "Copy Report" button that generates a plain-text summary parents can paste into a message to their coach
   
All four of these are currently completely non-functional (no click handler or broken handler). Fix them all.
```

---

### PROMPT 2 — Fix the Speed Round Timer Bug

```
In the Speed Round game mode, the countdown timer starts immediately when the component mounts, but the question text and answer choices aren't visible until after a brief render delay. This means users lose 1-3 seconds before they can even read the question.

Fix this by:
1. Starting the timer countdown ONLY after all answer buttons have been rendered and the question text is visible (use a useEffect with a ref, or a short measured delay after the content is painted)
2. Add a brief animated "3... 2... 1... GO!" countdown overlay before each Speed Round question begins, so the user knows the timer is about to start
3. Ensure the timer bar animates smoothly from full to empty over the complete 15 seconds, not jumping or skipping due to render delays
4. On mobile, the render time is longer — add at least a 500ms buffer before starting the timer regardless of device
```

---

### PROMPT 3 — Fix the Scenario Title Content Bug

```
Fix the following content bug in Baseball Strategy Master:

The Daily Diamond Play scenario titled "Teammate Hit a Homer — Keep Your Cool" has an incorrect title. The scenario body text says "the batter before this one crushed a solo homer OFF YOUR FASTBALL" — meaning an OPPONENT hit the homer, not a teammate. The title directly contradicts the scenario description.

Change the title to: "Opponent Hit a Homer — Keep Your Cool" 
OR: "They Just Took You Deep — Now What?"

Also audit all other scenario titles in the data to ensure they accurately reflect their body text. The title should match the situation being described — mismatches will confuse young players who are just learning the game.
```

---

### PROMPT 4 — Fix Scoreboard Consistency Across All Game Modes

```
In Baseball Strategy Master, the game scoreboard displayed above the baseball field is inconsistent across game modes:

- Standard position scenarios: INN · SCORE · COUNT · OUTS ✅
- Survival mode: INN · SCORE · OUTS (COUNT is missing) ❌
- Rules IQ: INN · SCORE · OUTS (COUNT is missing — it's relevant for rules questions!) ❌
- Some Manager scenarios: INN · SCORE · OUTS (missing COUNT) ❌

Fix this so COUNT is shown in all game modes where a pitch count is situationally relevant. 

For Manager scenarios where the count isn't central to the decision, you can still show it (managers know the count!) or intentionally omit it with a small "MGR VIEW" label to make the design choice explicit.

The scoreboard component should accept a prop like showCount={boolean} that defaults to true, and only set it to false in cases where the position literally wouldn't know the count (which is almost never in baseball).
```

---

### PROMPT 5 — Fix Hero Text and Scenario Labels

```
In Baseball Strategy Master, fix two copy/labeling issues:

1. The hero text under the title reads: "466 scenarios · 6 positions · Real MLB strategy"
   This is factually incorrect — the app has 13 positions/roles: Pitcher, Catcher, 1st Base, 2nd Base, Shortstop, 3rd Base, Left Field, Center Field, Right Field, Batter, Runner, Manager — plus Famous Plays, Rules IQ, and Count IQ as separate content categories.
   
   Update to: "466 scenarios · 13 positions · Real MLB strategy"
   Or better, dynamically compute and display these numbers from the actual scenario data so they stay accurate as you add content.

2. In Spring Training, the progress indicator says "Game 3 of 36" — but each individual question/scenario is not a full game. This confuses kids who think they're playing 36 full baseball games.
   
   Rename throughout Spring Training: "Game X of 36" → "Scenario X of 36" or "Challenge X of 36"
   
   Also check if this label appears anywhere else in the app and fix it there too.
```

---

### PROMPT 6 — Add First-Time User Onboarding

```
Baseball Strategy Master has no onboarding flow. A new user sees an overwhelming home screen with 15+ game modes and no guidance on where to start. Add a first-time user onboarding experience:

1. On first visit (check localStorage for a 'bsm_onboarded' flag), show a 3-screen onboarding overlay/modal:

   Screen 1 — "What's your position?"
   Show an overhead baseball diamond diagram with each position labeled and clickable.
   Let the user tap their real-life position (or "I play multiple positions" / "I'm just learning").
   Save their selection to localStorage as 'bsm_primary_position'.

   Screen 2 — "How it works"
   Show the 4-step format with simple icons:
   1️⃣ Read the situation  2️⃣ Pick your play  3️⃣ See if you got it  4️⃣ Learn why it works
   
   Screen 3 — "Ready? Start with Spring Training"
   Brief copy: "Spring Training walks you through every position from the basics up. It's the best place to start."
   Single CTA button: "Start Spring Training →"
   Smaller skip link: "I already know the game, take me to the full app"

2. After onboarding completes, add a glowing "Start Here →" indicator on the Spring Training card in the home screen for all users who haven't started it yet (Game 1 of 36 not played).

3. Set localStorage 'bsm_onboarded' = true after the onboarding completes so it only shows once.

4. Store the selected position from onboarding and use it to:
   - Pre-highlight their position's card on the home screen
   - Default the AI Coach to their position
   - Show their position's scenarios first in Speed Round and Survival if possible
```

---

### PROMPT 7 — Add Progress Tracking to Famous Plays, Rules IQ, and Count IQ

```
In Baseball Strategy Master, position cards on the home screen show completion progress (e.g. "75% · 4 played"), but Famous Plays, Rules IQ, and Count IQ show no progress whatsoever. Kids have no idea how much they've done or how much is left.

Add progress tracking to all three content types:

1. Track which Famous Play scenarios, Rules scenarios, and Count scenarios the user has answered (both correctly and incorrectly) — store in localStorage matching the pattern used for position scenarios.

2. Show completion stats on home screen cards:
   - Famous: "8/20 plays" 
   - Rules: "5/18 rules"
   - Counts: "12/18 counts"

3. Show a subtle progress bar under each card (matching the existing UI pattern from Spring Training's progress bar).

4. When ALL scenarios in a category are completed, show a gold star or checkmark badge on the card and a brief celebration toast: "Rules Master! You've learned all 18 rules!" 

5. Bonus: in the Concept Mastery Map (accessible via the Map button), add Famous, Rules, and Counts as their own rows alongside the position rows so everything is tracked in one place.
```

---

### PROMPT 8 — Fix and Polish the AI Coach Integration

```
In the AI Coach's Challenge section, there are two problems that make the AI feel unreliable:

PROBLEM 1: Silent fallback with no indication
After completing an AI-generated scenario (tagged "AI" in the header) and clicking "Next Challenge," the next scenario is a pre-built one but the "AI" badge silently disappears and the user gets no explanation. They think they're getting personalized AI content when they're not.

Fix:
- When serving a fallback pre-built scenario, tag it as "📚 Practice" instead of leaving the tag area blank
- Show a small explanatory note: "AI is preparing your next personalized scenario — here's a practice play"
- Pre-fetch the next AI scenario in the background while the user is answering the current fallback, so the one after is AI-generated

PROBLEM 2: Marketing claim vs. reality mismatch  
The section description says: "A personalized scenario targeting your weak spots. Every one is unique to you."
When AI fails and you serve pre-built content, this is factually false.

Fix:
- Change description to: "AI-powered coaching that targets your weak spots — personalized just for you"
- Only show the "Every one is unique to you" language when an active AI session is confirmed
- OR add "(when available)" to the description

ADDITIONAL IMPROVEMENTS:
- Log to console when AI fallback occurs (with reason) so you can monitor API reliability: console.log('[BSM] AI fallback triggered:', reason)
- Add a user-visible loading state when AI is generating: a subtle "🤖 Generating your scenario..." indicator before the question appears, instead of an instant switch to a pre-built question
- Make sure the AI prompt includes the user's recent wrong answers and weak position data so it's actually personalizing, not just generating a random scenario for that position
```

---

### PROMPT 9 — Add "Explain More" Deep Dive Feature

```
After a user answers a scenario in Baseball Strategy Master, the result screen shows a 2-3 sentence explanation and a one-line Key Concept summary. Add a deeper learning option for curious players:

Add an "Explain More ↓" expandable section below the Key Concept box. It should:

1. Be collapsed by default (so it doesn't clutter the screen for users who want to move on quickly)

2. When expanded, show:
   - WHY the correct answer works (2-3 sentences on the strategic reasoning)
   - WHAT experienced players look for in this situation (1-2 sentences on reads/cues)  
   - COMMON MISTAKE beginners make here (1 sentence — helps kids recognize their own error pattern)
   - Optional: A real MLB example of this situation if applicable

3. For pre-built scenarios: add this extended explanation text directly to the scenario data object (new field: "deepExplain": { why: "...", whatToLookFor: "...", commonMistake: "..." })

4. For AI scenarios: make a secondary AI call to generate the deep explanation on-demand when the user taps "Explain More" (lazy load it — don't call the API until they tap)

5. Style it as a smooth accordion with a subtle animation. Use a different background color (slightly lighter than the answer box) to visually separate it.

6. Track when users expand "Explain More" — this is a signal of high engagement and can feed into the AI coaching personalization (if they keep expanding explanations for a certain concept, the AI should know they're struggling with it).
```

---

### PROMPT 10 — Cloud Leaderboard + Team Social Features

```
The current leaderboard in Baseball Strategy Master is device-local only ("Play on same device to compete"). This kills the social/competitive hook that makes educational apps sticky for kids. Implement a cloud-backed leaderboard:

BACKEND (Cloudflare Workers KV — matches current Cloudflare Pages deployment):

Create a Cloudflare Worker at /api/leaderboard with:
- POST /api/leaderboard/submit: Accepts { displayName, weeklyScore, survivalBest, speedAccuracy, teamCode? }
  Stores with key: leaderboard:week:{YYYY-WW}:{nanoid()}
  Rate limit: 1 submission per displayName per hour
- GET /api/leaderboard/weekly: Returns top 20 scores for current week
- GET /api/leaderboard/team/{teamCode}: Returns scores filtered to that team code
- GET /api/leaderboard/rank/{displayName}: Returns the user's rank even if not in top 20

FRONTEND:

1. In the Leaderboard panel, when user sets a display name and submits their score, POST to the worker
2. Show top 20 with rank numbers, display names, and scores
3. Show the user's own rank below the list if they're not in top 20: "You're #47 this week — 120 pts to reach the top 20!"
4. Add tabs: "Global Week" | "My Team" | "Survival All-Time" | "Speed Best"
5. For teams: when a team code exists (Code: RR7R), automatically filter "My Team" tab to team members
6. Show a weekly reset timer: "Resets in 3 days 14 hours"

PRIVACY:
- All submissions are display-name only (no personal data)
- Add a "Play anonymously" option that keeps them off the leaderboard
- Never store or transmit device IDs or personal identifiers
```

---

### PROMPT 11 — Add Animated Play Diagrams for Key Fielding Scenarios

```
In Baseball Strategy Master, fielding scenarios (backup assignments, cutoffs, bunt coverage, double play positioning) teach kids WHERE to go using text only. This is the hardest type of strategic knowledge to learn from reading alone.

Add simple animated SVG play diagrams to fielding movement scenarios:

1. IDENTIFY target scenarios: Any scenario where the position is a fielding position (Pitcher, C, 1B, 2B, SS, 3B, LF, CF, RF) AND the correct answer involves player movement. Look for keywords in answer text: "back up", "cover", "cutoff", "relay", "charge", "rotate", "drift", "move to".

2. Add a new optional field to these scenario data objects: "playDiagram": { positions: [...], movements: [...], ballPath: {...} }

3. After the user answers (show on BOTH correct and incorrect result screens), display:
   - The existing SVG overhead baseball field as the base
   - Small colored dots for the relevant players in their starting positions
   - Animated CSS/SVG arrows showing where the correct answer moves them
   - A dotted arc showing the ball's path
   - The animation auto-plays once, then loops slowly

4. Add a "▶ Watch the Play" / "⏸ Pause" button to control the animation

5. Start with the 10-15 most common fielding scenarios (bunt coverage, outfield backup, cutoff relay, double play pivot). You don't need to cover every scenario — even a subset dramatically improves learning.

6. Use CSS animations (not a full animation library) to keep bundle size small. The field SVG already exists in the codebase — reuse it.
```

---

### PROMPT 12 — Fix "Change Position" to Use an Intentional Picker

```
In Baseball Strategy Master, the "Change Position" button appears after every answered scenario. Currently it either randomly switches positions or silently advances to a different position's pool with no UI for the user to choose.

Fix this so it's intentional:

1. "Change Position" should open a compact position picker overlay/bottom sheet showing all 13 positions in a grid layout (matching the position card colors/emojis from the home screen)

2. The currently active position should be highlighted/selected

3. Tapping a new position immediately closes the picker and loads the next scenario from that position's pool

4. Add a user preference in settings (or in the Theme section): "Stick to my position" toggle
   - When ON: "Change Position" button is hidden; all scenarios cycle through the user's primary position only
   - When OFF (default): "Change Position" shows after every answer

5. Rename the button from "Change Position" to "Switch Position" — "change" implies the current choice was wrong, "switch" is more intentional

6. Remember the last-selected position across sessions in localStorage so returning players don't have to re-select every time
```

---

### PROMPT 13 — Add Streak Break Animation + Session Recap Screen

```
Two missing emotional/gamification moments in Baseball Strategy Master:

PART A — Streak Break Animation:
When the flame streak counter resets from a higher number to 1 (because the user got a wrong answer), there is currently no animation or reaction. This is a missed gamification opportunity.

Add a streak break moment:
- Brief screen flash or shake animation on the streak counter when it resets
- Show a small toast or overlay: "Streak broken! You had {N} in a row. Rebuild it! 🔥"
- After breaking a streak of 5+, add a subtle "bounce back" motivational message from Coach: "Shake it off — every great player misses one. What matters is the next play."
- For streaks of 10+, make the break more dramatic with a brief animation (shatter/extinguish effect on the flame icon)

PART B — Session Recap Screen:
When a user navigates back to home after playing (either via "← Home" or "← Back" buttons), if they played 3+ scenarios in the session, show a Session Recap overlay before going to home:

Session Recap should show:
- "Good Session! Here's what you worked on:" header
- Scenarios played this session (count)
- Correct / Incorrect count with accuracy %
- Streak achieved this session (best streak)
- 2-3 Key Concepts from correct answers (randomly selected from what they got right)
- One "Focus Area" from what they got wrong (1 key concept they should review)
- CTA buttons: "Keep Playing" | "Go Home"

This gives kids and parents a moment to reflect on what was learned, not just close the app.
```

---

### PROMPT 14 — Add Audio/Sound Effects

```
In Baseball Strategy Master, there is a "Sound On/Off" toggle in the footer but the entire app is currently completely silent — no sounds play in any game mode.

Implement audio effects using the Web Audio API (no external library needed for simple sounds):

1. CORRECT ANSWER: A quick positive chime or baseball crack sound
2. WRONG ANSWER: A soft "miss" tone (not harsh — this is for kids)
3. STREAK MILESTONE (5, 10, 15 in a row): Brief crowd cheer or upbeat jingle
4. STREAK BROKEN: A short "aww" crowd sound
5. SPEED ROUND: A ticking sound as the timer enters the last 5 seconds (urgency builder)
6. LEVEL UP / ACHIEVEMENT UNLOCKED: A celebratory fanfare
7. DAILY DIAMOND COMPLETE: A satisfying completion sound

Implementation notes:
- Use the Web Audio API's OscillatorNode for simple tones (no audio file downloads needed for basic sounds)
- For richer sounds (crowd, crack), use short base64-encoded audio clips or load from a CDN
- Respect the Sound On/Off toggle (check localStorage 'bsm_sound' preference before playing any sound)
- Default to Sound OFF (many kids play in class or shared spaces — opt-in is safer)
- All sounds should be short (<1 second for feedback sounds, <3 seconds for celebrations)
- Add a volume slider in the Theme/settings section

Make sure clicking "Sound On" in the footer actually toggles this preference and saves it to localStorage.
```

---

## PRIORITY CHECKLIST FOR IMPLEMENTATION

### 🔴 P0 — Fix These First (Broken/Embarrassing)
- [ ] PROMPT 3 — Wrong title on Daily Diamond Play scenario
- [ ] PROMPT 1 — Non-functional buttons (Challenge Friend, Hall of Fame, PRO, Parent Report)
- [ ] PROMPT 2 — Speed Round timer starts before question is visible
- [ ] PROMPT 5 — Hero text says "6 positions" (wrong — it's 13)

### 🟠 P1 — High Impact for Retention
- [ ] PROMPT 6 — First-time user onboarding with position picker
- [ ] PROMPT 4 — Scoreboard missing COUNT in Survival, Rules IQ, Manager
- [ ] PROMPT 7 — No progress tracking on Famous/Rules/Count sections
- [ ] PROMPT 8 — AI Coach fallback silently drops "AI" tag
- [ ] PROMPT 13 — Streak break animation + session recap screen

### 🟡 P2 — Major Feature Additions
- [ ] PROMPT 10 — Cloud leaderboard (kills local-only limitation)
- [ ] PROMPT 9 — "Explain More" deep dive button
- [ ] PROMPT 14 — Sound effects (Sound toggle currently does nothing)
- [ ] PROMPT 12 — "Change Position" picker UI

### 🟢 P3 — Premium Differentiators
- [ ] PROMPT 11 — Animated play diagrams for fielding scenarios
- [ ] PROMPT 13 (Part B) — Session recap screen

---

## ADDITIONAL NOTES FOR CLAUDE CODE

When working on this codebase, keep in mind:

1. **AI Integration is in progress** — the AI Coach feature calls an API (logs show "[BSM] AI response received, content length: 1276") so the backend call works, but the frontend handling of AI vs. pre-built content needs the polish described in Prompt 8.

2. **localStorage is the current state store** — the app uses localStorage extensively for progress tracking, themes, streaks, etc. Until a proper backend auth/cloud sync is added, continue using localStorage as the source of truth but namespace all keys clearly (e.g., `bsm_progress_pitcher`, `bsm_streak_current`) to avoid collisions.

3. **The baseball field SVG is the core visual** — it dynamically shows runners on base and fielder positions. Any new features (animated diagrams, etc.) should build on this existing component rather than creating a new one.

4. **The app is deployed on Cloudflare Pages** — any backend additions (cloud leaderboard, AI endpoints) should use Cloudflare Workers for consistency.

5. **Target audience is kids ages 6-13** — all copy, error messages, empty states, and loading text should be written at an appropriate reading level, encouraging, and avoid anything discouraging or technical.

6. **The "Coach Says..." messages are a beloved feature** — the rotating motivational/fun fact messages after correct answers are great. Consider expanding this pool and making the fun facts position-specific (e.g., catcher facts when playing catcher scenarios).

---

*End of Playtesting Report*
*App tested: Baseball Strategy Master (https://bsm-app.pages.dev/)*
*Tester: Claude (Anthropic) with PRO/Lifetime access*
