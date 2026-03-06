# Situation Room Enhancement Plan

## Current State Assessment

### What Exists
The Situation Room is a game mode where players face one game situation from multiple position perspectives. It currently has:

- **8 handcrafted situation sets** (sr1-sr8): Bases Loaded Jam, Steal Attempt, Sacrifice Bunt, Extra-Base Hit to Gap, Full Count Showdown, Squeeze Play, Rundown Chaos, Tag-Up Play
- **3-4 questions per set**, each from a different position (pitcher, catcher, shortstop, baserunner, etc.)
- **Intro screen** with SVG field visualization showing runners, game state grid (inning, outs, count, score, runners), and position badges for upcoming questions
- **Standard play screen** — same as every other mode (4 options, pick one, see outcome)
- **Results screen** with letter grade, position breakdown (✅/❌ per position), XP earned, and a "How the Play Unfolded" text debrief with a "Teamwork Takeaway"
- **State**: `sitMode`, `sitSet`, `sitQ` (question index), `sitResults[]`
- **All scenarios are diff:2 (Pro level)** — no difficulty scaling
- **No replay tracking** specific to Situation Room (uses global `stats.cl` completed IDs)
- **No AI generation** — 100% handcrafted content

### What Makes It Special (Protect These)
1. **Multi-position perspective** — No other mode or competitor does this. The "think like a team" concept is genuinely unique.
2. **The debrief** — "How the Play Unfolded" ties all position decisions together into a narrative. This is the educational payoff.
3. **Field visualization on intro** — Seeing the runners and game state before you start grounds the situation.

### Key Weaknesses
1. **Content ceiling** — 8 sets = ~30 minutes of content total. One session and done.
2. **No progression** — Flat list, no unlocking, no difficulty tiers, no mastery tracking.
3. **Identical play flow** — Each question feels like a regular scenario. The position-switching magic is invisible.
4. **No urgency/stakes** — No timer, no scoring pressure, no competitive element.
5. **Text-heavy debrief** — Kids won't read paragraphs. Needs to be visual/animated.
6. **No replay incentive** — Once you get ✅ on all positions, zero reason to replay.
7. **No social hook** — Can't share, compare, or challenge on Situation Room performance.
8. **Picker is a boring list** — No visual progress map, no indication of past performance per set.

---

## Enhancement Plan

### Phase 1: Content & Difficulty Depth (Priority: HIGH)
*Goal: Go from "one session of content" to "weeks of content"*

#### 1A. Add Difficulty Tiers to Each Situation Set
Currently all 8 sets are diff:2. Add Rookie (diff:1) and All-Star (diff:3) variants.

**Implementation:**
- Add a `diff` field to each `SITUATION_SETS` entry
- Create simplified versions (diff:1) of each set with:
  - Fewer positions (2 instead of 3-4)
  - Simpler language in options/explanations
  - Use `explSimple` arrays (some already exist)
  - Only positions kids encounter first (batter, baserunner, pitcher)
- Create advanced versions (diff:3) with:
  - More positions per set (4-5)
  - Tighter option differentials (best option is 65% not 88%)
  - More nuanced game states (2 outs, 3-2 count, tie game late innings)
  - Include manager/coach perspective questions
- **Target: 8 situations × 3 difficulty levels = 24 total sets**
- Picker screen groups by situation with difficulty badges

#### 1B. Add 8-12 New Situation Types
Expand beyond the current 8. High-value situations to add:

1. **"Infield Fly Rule" situation** — umpire, batter, baserunner perspectives
2. **"Hit and Run" situation** — batter, baserunner, second baseman, shortstop
3. **"Intentional Walk Strategy"** — manager, pitcher, on-deck batter
4. **"Defensive Shift"** — manager, left fielder, shortstop, batter
5. **"Pitching Change"** — manager, reliever, catcher, batter
6. **"First and Third Double Steal"** — both runners, catcher, middle infielder
7. **"Relay and Cutoff"** — outfielder, cutoff man, third baseman, catcher
8. **"Pickoff Play"** — pitcher, first baseman, baserunner
9. **"Late-Inning Defensive Replacement"** — manager, defensive sub, baserunner
10. **"Walk-Off Situation"** — pitcher, batter, runners, outfield positioning
11. **"Rain Delay Decision"** — manager perspective on when to pull starters, pinch hit
12. **"Error Recovery"** — what each position does after a throwing error

**Target: 20 situations × 3 difficulties = 60 total sets, ~200+ questions**

#### 1C. AI-Generated Situation Sets (Pro Feature)
Extend `generateAIScenario()` to generate entire multi-position situation sets.

**Implementation:**
- New function `generateAISituation()` that:
  - Takes player's weak positions and unmastered concepts
  - Generates a coherent game state + 3-4 position questions that all reference the same situation
  - Includes the debrief narrative connecting all positions
  - Uses same xAI Grok endpoint through Cloudflare Worker
  - JSON schema validation for the multi-question format
- AI situations appear in picker with purple "AI" badge
- Generate 1-2 AI situations per session based on player's weaknesses
- Fallback to handcrafted if AI fails (same pattern as existing AI scenarios)

---

### Phase 2: Visual & UX Overhaul (Priority: HIGH)
*Goal: Make the mode feel distinct and premium, not just "regular scenarios in a row"*

#### 2A. Position Transition Animation
When switching from one position's question to the next, show a visual transition.

**Implementation:**
- After answering as pitcher, the field view zooms/pans to the catcher's perspective
- Brief 1-second animation: current position's player glows → camera shifts → next position highlights
- Show a banner: "Now you're the CATCHER" with position emoji and color
- The field stays visible during the transition so players feel they're in one continuous play
- Use existing `Field()` component's animation system — add a new `anim` type: `"positionSwitch"`

#### 2B. Split-Screen "Situation HUD"
During play, show a persistent mini-HUD at the top showing:
- The overall situation (inning, outs, runners)
- Which position you're currently playing (highlighted)
- Progress dots for all positions in the set (✅ done, 🔵 current, ⚪ upcoming)
- A mini field diagram showing your current position highlighted

**Implementation:**
- New `SituationHUD` component rendered above the play screen when `sitMode` is true
- Compact: ~60px tall, doesn't crowd the question area
- Position dots are interactive — tapping a completed one shows what you answered

#### 2C. Animated Debrief ("Film Room")
Replace the text-heavy debrief with an animated "Film Room" replay.

**Implementation:**
- Rename "How the Play Unfolded" to **"Film Room"** 🎬
- Show the field with all positions, then step through each position's decision:
  - Position highlights → their choice appears → ✅ or ❌ animates → field shows the result
  - 2-3 second pause per position, auto-advancing with a progress bar
  - User can tap to pause or skip forward
- Use existing SVG field + animation system
- Each step shows a 1-line explanation (not a paragraph)
- End with the "Teamwork Takeaway" as a final card
- This is a big educational win — kids SEE how all 9 positions connect

#### 2D. Picker Screen Redesign
Replace the flat card list with a visual **"Situation Board"**.

**Implementation:**
- Grid/map layout instead of vertical list
- Each situation is a card showing:
  - Best grade achieved (A+, B, etc.) with color
  - Stars for each difficulty completed (☆☆☆)
  - Position emojis with ✅/❌ for last attempt
  - Lock icon on difficulties not yet unlocked
- Difficulty filter tabs at top: Rookie / Pro / All-Star
- "Recommended" badge on situations targeting player's weak areas
- Sort options: Newest, Hardest, Needs Practice

---

### Phase 3: Progression & Engagement (Priority: MEDIUM)
*Goal: Give players a reason to come back to Situation Room daily*

#### 3A. Situation Room Mastery System
Track mastery specific to Situation Room, separate from per-concept mastery.

**Implementation:**
- New stats fields: `sitMastery: { [setId]: { bestGrade, attempts, grades[], perfectCount } }`
- **Bronze / Silver / Gold / Diamond** tier per situation:
  - Bronze: Complete the set (any grade)
  - Silver: Get a B or better
  - Gold: Get an A or better
  - Diamond: Perfect score (100%) on All-Star difficulty
- **"Situation Room Rank"**: Aggregate of all situation tiers → titles like "Scout", "Coordinator", "Dugout Genius", "Field General"
- Show rank on home screen Situation Room card
- Unlock higher difficulties by completing the lower one (Rookie unlocks Pro, Pro unlocks All-Star)

#### 3B. "Daily Situation" (Like Daily Diamond but for Situation Room)
One rotating situation per day, available to all players (including free tier).

**Implementation:**
- Pick from the full situation pool using date-based seed (same for all players)
- Always at Pro difficulty
- Special scoring: streak tracking for consecutive days of Daily Situation
- Leaderboard-ready format (daily score + position accuracy)
- Different situation each day, cycles through all available
- Exempt from daily play limit (like Daily Diamond)

#### 3C. Team Score / Team Grade
Introduce a holistic "Team Coordination Score" that measures how well the player's choices across all positions work together.

**Implementation:**
- Not just "did you get each question right" but "did your answers create a coherent play?"
- Example: If the pitcher throws low for a DP, the catcher sets up low (coordinated = bonus), but if pitcher throws low and catcher sets up high (uncoordinated = penalty even if both are technically acceptable)
- Add `synergy` field to situation sets mapping position answer combinations to coordination scores
- Show Team Coordination Score (0-100) on results screen with a gauge visualization
- "Perfect Coordination" achievement for 100% synergy score

#### 3D. Timed Challenge Mode for Situation Room
Optional timed variant that adds urgency.

**Implementation:**
- "Speed Situation" toggle on the intro screen
- 15-second timer per question (same as Speed Round)
- Bonus XP for fast correct answers
- Timer visible in the Situation HUD
- Results show time breakdown per position
- Separate leaderboard from untimed

---

### Phase 4: Social & Competitive (Priority: MEDIUM)
*Goal: Make Situation Room shareable and competitive*

#### 4A. Challenge a Friend with a Situation
Extend the existing Challenge system to work with Situation Room.

**Implementation:**
- After completing a Situation, "Challenge a Friend" button generates a shareable link
- Friend plays the same situation set and sees both scores side by side
- Compare per-position: "You got Pitcher right, they got Catcher right"
- Reuse existing challenge link infrastructure (hash-based)

#### 4B. Shareable Situation Report Card
After completing a situation, generate a visual "report card" image.

**Implementation:**
- Canvas-rendered image with:
  - Situation name and emoji
  - Grade (big, colorful)
  - Position breakdown with ✅/❌
  - Team Coordination Score gauge
  - "Play at baseballstrategymaster.com" footer
- Share button → copies image to clipboard or generates share link
- Works with existing share infrastructure

---

### Phase 5: Polish & Edge Cases (Priority: LOW)
*Goal: Make it bulletproof*

#### 5A. Age-Appropriate Filtering
Filter situation sets by age group.

**Implementation:**
- Use `ageMin`/`ageMax` fields (already exist on individual questions)
- Add `ageMin`/`ageMax` to the set level
- Picker only shows age-appropriate sets
- Rookie difficulty: ages 6-10, simpler language
- Pro difficulty: ages 9-14
- All-Star: ages 12-18
- Uses existing `stats.ageGroup` from onboarding

#### 5B. Situation Room Tutorial
First-time tutorial specific to this mode.

**Implementation:**
- Triggered on first Situation Room entry
- 3 steps: "One situation, many positions", "Think like the whole team", "See how it all connects in Film Room"
- Uses existing tooltip/overlay system
- Sets `stats.sitTutorialDone` flag

#### 5C. Practice Recommendations Integration
Connect Situation Room to the existing "Recommended for You" system.

**Implementation:**
- If a player consistently misses catcher questions in Situation Room, recommend catcher practice scenarios
- If a player aces Situation Room but struggles with individual position play, suggest the positions they're weakest at
- "Situation Room recommended" badge when the practice system thinks multi-position thinking would help

---

## Implementation Order for Claude Code

### Sprint 1: Foundation (Estimated: 1 session)
```
Tasks:
1. Add `diff` field to existing SITUATION_SETS entries (all currently diff:2)
2. Create Rookie (diff:1) variants of all 8 existing situations (2 positions each, simpler language)
3. Create All-Star (diff:3) variants of all 8 existing situations (4-5 positions, tighter margins)
4. Add `sitMastery` to DEFAULT state object
5. Update picker screen to show difficulty tabs and per-situation best grades
6. Add difficulty unlock logic (must complete Rookie to unlock Pro, Pro to unlock All-Star)
```

### Sprint 2: New Content (Estimated: 1-2 sessions)
```
Tasks:
1. Write 8-12 new situation sets at Pro difficulty (see 1B list)
2. Create Rookie and All-Star variants of each new set
3. Add all new sets to SITUATION_SETS array
4. Ensure all new scenarios follow SCENARIO_BIBLE.md quality standards
5. Cross-check all new content against BRAIN constant and POS_PRINCIPLES
```

### Sprint 3: Visual Overhaul (Estimated: 1 session)
```
Tasks:
1. Build SituationHUD component (position progress dots, mini game state, current position highlight)
2. Add position transition animation between questions ("Now you're the CATCHER" banner + field highlight)
3. Redesign picker as a visual grid with grades, stars, and difficulty badges
4. Build "Film Room" animated debrief (step through each position's decision on the field SVG)
```

### Sprint 4: Engagement Features (Estimated: 1 session)
```
Tasks:
1. Implement Bronze/Silver/Gold/Diamond mastery tiers per situation
2. Add "Situation Room Rank" aggregate with titles
3. Build "Daily Situation" mode (date-seeded, exempt from limit, streak tracking)
4. Add Team Coordination Score with synergy mappings
5. Add "Speed Situation" timed variant toggle
```

### Sprint 5: Social + AI (Estimated: 1 session)
```
Tasks:
1. Extend Challenge system to support Situation Room sets
2. Build shareable Situation Report Card (canvas-rendered image)
3. Implement generateAISituation() for AI-generated multi-position sets
4. Connect to practice recommendations system
5. Add first-time Situation Room tutorial
6. Add age-appropriate filtering to picker
```

---

## Key Metrics to Track
- Situation Room plays per session
- Completion rate (start a set → finish all questions)
- Replay rate (same situation played more than once)
- Grade distribution across difficulty levels
- Film Room engagement (do players watch the whole thing or skip?)
- Daily Situation streak length
- Conversion from free → pro via Situation Room (if AI situations are pro-gated)

## Design Principles
1. **Every question should feel connected** — never like isolated scenarios stitched together
2. **Show, don't tell** — animate the connections between positions instead of explaining them
3. **Progression should be visible** — the picker should make you WANT to fill in all the stars
4. **Difficulty should feel earned** — unlocking All-Star after mastering Rookie feels rewarding
5. **The Film Room is the educational payoff** — invest the most polish here
