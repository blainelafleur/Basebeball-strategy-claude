# Claude Code Execution Prompt — AI Superpower Plan Phase E (FINAL)

Copy everything below the line into Claude Code:

---

Read `AI_SUPERPOWER_PLAN.md` — specifically **Phase E: Polish & Magic (Weeks 9-10)**. Phases A through D are complete. This is the final phase. Execute one task at a time.

## RULES (same as before)

1. **One task at a time.** Complete task 22 fully before starting task 23.
2. **After each task**, verify `preview.html` loads without console errors. If the app breaks, fix it before moving on.
3. **Commit after each working task**.
4. **Single-file app** in `index.jsx`. Surgical edits only. Read 50 lines of context before editing any function.
5. **Don't change handcrafted scenarios.**

## WHAT'S NOW BUILT (Phases A-D complete)

**Phase A (Foundation):** Error classification, brain-data answer validator in QUALITY_FIREWALL, pre-calculated situation conclusions in formatBrainForAI, pedagogical grading in gradeAgentScenario, D1 learning_events table, concept gating by age.

**Phase B (Coaching Intelligence):** Session planner (8-scenario sequences), situation-optimal generation (CONCEPT_SITUATIONS), "Try Again?" button, coach personas (Rookie/Varsity/Scout), age-adaptive prompt injection.

**Phase C (Learning Architecture):** 8 learning paths (39 concept tags), getCurrentPath/getNextInPath wired into planSession, connected scenario arcs in agent pipeline, Baseball IQ score (home screen + stats panel), streak-aware coaching with auto-remediation.

**Phase D (Feedback Loop):** Population difficulty calibration endpoint, prompt patches from population data, A/B test result collection, agent pipeline at 50%, progressive 3-layer explanation depth UI.

## PHASE E TASKS (Do these in order)

### Task 22: "Real Game" Mode Architecture (Pillar 7D)
**Goal**: Design and build the skeleton of a 9-inning game mode where the player makes one strategic decision per inning, and each decision affects the game state going forward.

This is the flagship Pro feature. Build it as a new game mode option alongside the existing modes (Season, Survival, Speed Round, Daily Diamond).

**Core Design:**
- A "Real Game" is 9 scenarios, one per inning (or fewer — critical innings only)
- The game starts with a score of 0-0
- Each scenario represents a key strategic moment in that inning
- The player's choice affects the outcome:
  - **Correct (green):** Your team gets a favorable result (out recorded, run scored, runner held)
  - **Acceptable (yellow):** Neutral outcome (the play works but isn't optimal)
  - **Wrong (red):** Bad outcome (run scores against you, runner advances, error)
- The score evolves based on choices — wrong answers in key moments lead to opponent runs
- After 9 innings, show a final result: "You managed a 5-3 WIN!" or "You lost 4-6"
- Display the player's Baseball IQ for the game session

**Implementation:**
1. Add a `GAME_MODE_REAL_GAME` constant or similar identifier.
2. Add a "Real Game" button to the mode selection screen (wherever Season/Survival/Speed are listed). Gate it behind Pro.
3. Create a `RealGameState` object:
   ```javascript
   {
     inning: 1,
     playerScore: 0,
     opponentScore: 0,
     scenarios: [], // The 9 planned scenarios
     results: [],   // Player's choices and outcomes
     isActive: false,
     isComplete: false
   }
   ```
4. When "Real Game" starts:
   - Initialize the game state
   - Use `planSession()` to generate 9 scenario slots (adjust from 8 to 9)
   - Set the first scenario's situation to inning 1
5. After each answer:
   - Update score based on choice quality:
     - Green answer: 40% chance your team scores a run this inning
     - Yellow answer: 10% chance your team scores
     - Red answer: 60% chance opponent scores a run
   - Advance to next inning
   - Pass updated score into the next scenario's situation
   - The connected scenario arc feature (from Phase C Task 14) should feed the previous scenario as context
6. After inning 9:
   - Show a game summary screen with:
     - Final score
     - Inning-by-inning breakdown (which decisions were green/yellow/red)
     - Baseball IQ for this game session (compute from just these 9 answers)
     - A shareable result: "⚾ I managed a 5-3 win with a Baseball IQ of 127!"
   - Award bonus XP for wins (e.g., 2x normal XP)
7. The game summary should look distinct from normal feedback — make it feel like a box score.

**UI Notes:**
- During a Real Game, show a mini scoreboard at the top: `⚾ INN: 3 | YOU: 2 | OPP: 1`
- The existing `Board()` component might be reusable for this — check if it can display a simple score
- Use the existing field visualization with the appropriate inning context

**IMPORTANT:** This is the most complex single feature. If it starts getting too big, it's OK to build the skeleton (mode selection, game state, score tracking, summary screen) and leave the polish (shareable card, box score styling) for a follow-up. Get the gameplay loop working first.

- **Verify**: Start a Real Game. Play through 9 innings. Verify the score updates, innings advance, and a summary screen appears at the end.

### Task 23: Integration Testing Across All Pillars
**Goal**: Systematically verify that all features from Phases A-E work together without conflicts.

Run through these test cases and fix any issues:

1. **New Player Flow (Age 8 simulation)**:
   - Set player to low level / diff:1
   - Pick shortstop, play 3 scenarios
   - Verify: Coach Rookie voice, no advanced concepts (concept gating), simple vocabulary
   - Verify: Session plan created with learning path concepts in order
   - Verify: Baseball IQ displays and updates

2. **Wrong Answer Flow**:
   - Get a scenario wrong deliberately
   - Verify: Error classification fires (check console)
   - Verify: "Try Again?" button appears
   - Verify: 3-layer explanation shows (simple visible, "Why?" expandable)
   - Verify: Learning event POSTed to worker

3. **Streak Flow**:
   - Get 3 wrong in a row
   - Verify: Cold streak coaching line appears
   - Verify: Next scenario drops to remediation/prerequisite
   - Then get 5 right in a row
   - Verify: Hot streak coaching line appears

4. **Agent Pipeline Flow (Pro)**:
   - Enable Pro mode (set `stats.isPro = true` in localStorage or via the app)
   - Play 3 AI scenarios at the same position
   - Verify: ~50% use agent pipeline (console logs show `[BSM Agent]`)
   - Verify: Agent scenarios have pedagogical grading logs
   - Verify: Connected scenario arcs reference previous game context

5. **Real Game Mode (Pro)**:
   - Start a Real Game
   - Play through all 9 innings
   - Verify: Score updates correctly based on answer quality
   - Verify: Summary screen shows at the end with final score and Baseball IQ

6. **Handcrafted Scenario Backward Compatibility**:
   - Play 3 handcrafted (non-AI) scenarios
   - Verify: Old explanation format still renders correctly (no crashes from missing explDepth)
   - Verify: Baseball IQ still updates
   - Verify: Learning events still POST

- Fix any bugs found during testing. Commit each fix separately with a descriptive message.
- **Verify**: All 6 test flows pass without console errors.

### Task 24: A/B Test Configuration for New Features
**Goal**: Set up A/B tests for the major new features so we can measure their impact.

- Add new entries to the `AB_TESTS` object:
  ```javascript
  // Test: Coach personas vs no persona
  coach_persona: {
    id: "coach_persona_v1",
    variants: [
      { id: "control", weight: 50, config: { usePersona: false } },
      { id: "persona_on", weight: 50, config: { usePersona: true } }
    ]
  },

  // Test: Session planner vs random selection
  session_planner: {
    id: "session_planner_v1",
    variants: [
      { id: "control", weight: 30, config: { useSessionPlan: false } },
      { id: "planned", weight: 70, config: { useSessionPlan: true } }
    ]
  },

  // Test: 3-layer explanations vs single explanation
  explanation_depth: {
    id: "explanation_depth_v1",
    variants: [
      { id: "control", weight: 50, config: { useExplDepth: false } },
      { id: "layered", weight: 50, config: { useExplDepth: true } }
    ]
  }
  ```
- Wire these tests into the appropriate code paths:
  - `coach_persona`: In the system prompt injection, check `abConfigs.coach_persona?.usePersona` before injecting the coach voice. If control, use the generic system prompt.
  - `session_planner`: In `planSession()` or wherever it's called, check `abConfigs.session_planner?.useSessionPlan`. If control, skip the learning path logic and fall back to random concept selection.
  - `explanation_depth`: In the explanation rendering UI, check `abConfigs.explanation_depth?.useExplDepth`. If control, always show the flat `explanations[idx]` string even if `explDepth` exists.
- Make sure `reportABResult()` (from Task 19) fires for these new tests when scenarios are completed.
- **Verify**: Check that variant assignments are logged. Over several sessions/reloads, verify different variants get assigned.

### Task 25: Baseball IQ Sharing Card (Polish)
**Goal**: Make the Baseball IQ display screenshot-friendly and shareable.

- In the Baseball IQ display (added in Phase C Task 15), enhance the styling:
  - Add a card/container with a subtle border, rounded corners, and background that looks good in screenshots
  - Include the player's level, position, and season alongside the IQ number
  - Add a tagline: "Baseball Strategy Master" at the bottom of the card
  - The layout should look like:
    ```
    ┌──────────────────────────────┐
    │     🧠 Baseball IQ: 127      │
    │   ████████████░░░░ (Gold)    │
    │                              │
    │   Level 14 · Shortstop       │
    │   Season 2 · 89% accuracy   │
    │                              │
    │   ⚾ Baseball Strategy Master │
    └──────────────────────────────┘
    ```
  - Use appropriate colors: dark background with gold/white text looks great in screenshots
  - The progress bar should visually show where 127 falls on the 50-160 scale
- Also add this card to the Real Game summary screen (show the game-specific IQ alongside the career IQ).
- **Verify**: Take a screenshot of the Baseball IQ card. It should look polished and self-contained — something a kid would actually share.

## WHEN PHASE E IS DONE

This is the final phase. Run through all the verification steps from Task 23 one more time to confirm everything works together. Then provide a summary of:

1. Total commits across all 5 phases
2. Any features that were already implemented and didn't need building
3. Any known issues or edge cases to watch for
4. Suggestions for what to monitor after launch (which A/B tests to watch, what population data to look for)

Congratulations — the AI superpower system is complete. 🏆
