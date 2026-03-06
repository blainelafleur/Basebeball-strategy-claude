# Claude Code Execution Prompt — AI Superpower Plan Phase C

Copy everything below the line into Claude Code:

---

Read `AI_SUPERPOWER_PLAN.md` — specifically **Phase C: Learning Architecture (Weeks 5-6)**. Phases A and B are complete. Now execute Phase C, one task at a time.

## RULES (same as before)

1. **One task at a time.** Complete task 12 fully before starting task 13.
2. **After each task**, verify `preview.html` loads without console errors. If the app breaks, fix it before moving on.
3. **Commit after each working task** with a message like `feat: add learning path definitions (Pillar 3A)`.
4. **Single-file app** in `index.jsx`. Surgical edits only. Read 50 lines of context before editing any function.
5. **Don't change handcrafted scenarios.**

## WHAT'S ALREADY BUILT (from Phases A & B)

- `classifyError()` / `classifyAndFeedback()` — error taxonomy
- `brainContradiction` in QUALITY_FIREWALL tier1
- `formatBrainForAI()` with pre-calculated situation conclusions
- Pedagogical grading in `gradeAgentScenario()`
- D1 `learning_events` table + `/analytics/learning-calibration` endpoint
- `CONCEPT_GATES` wired into `planScenario()` and `buildAgentPrompt()`
- `planSession()` — 8-scenario session planner stored in `sessionPlanRef`
- `CONCEPT_SITUATIONS` — optimal game situations per concept
- "Try Again?" button on wrong answers
- `COACH_VOICES` — 3 personas (Rookie/Varsity/Scout) in both pipelines
- Age-adaptive prompt injection with forbidden concepts and strategic adjustments

## PHASE C TASKS (Do these in order)

### Task 12: Learning Path Definitions (Pillar 3A)
**Goal**: Define structured multi-session learning progressions that `planSession()` can follow.

- Add a `LEARNING_PATHS` constant near the other knowledge constants (near `BRAIN.concepts` or `CONCEPT_GATES`):
  ```javascript
  const LEARNING_PATHS = {
    "defensive_fundamentals": {
      sequence: ["ready-position", "fly-ball-tracking", "fly-ball-priority",
                 "cutoff-basics", "relay-positioning", "relay-decision-making"],
      assessAt: [2, 4, 6],
      positions: ["firstBase", "secondBase", "shortstop", "thirdBase",
                  "leftField", "centerField", "rightField"]
    },
    "baserunning_intelligence": {
      sequence: ["force-vs-tag", "lead-distance", "pitcher-reads-basic",
                 "steal-timing", "secondary-leads", "pitcher-reads-advanced",
                 "count-based-running"],
      assessAt: [3, 5, 7],
      positions: ["baserunner"]
    },
    "count_mastery": {
      sequence: ["strike-zone-basics", "ahead-behind-concept", "two-strike-approach",
                 "hitters-count-aggression", "count-leverage-data"],
      assessAt: [2, 4],
      positions: ["batter", "pitcher", "catcher"]
    },
    "pitching_strategy": {
      sequence: ["pitch-selection-basics", "pitch-count-awareness", "pitch-sequencing",
                 "times-through-order", "mound-visit-timing", "pitcher-fielding"],
      assessAt: [2, 4, 6],
      positions: ["pitcher", "catcher", "manager"]
    },
    "situational_offense": {
      sequence: ["contact-hitting", "sacrifice-bunt", "hit-and-run",
                 "squeeze-play", "situational-hitting", "two-out-hitting"],
      assessAt: [2, 4, 6],
      positions: ["batter", "baserunner", "manager"]
    },
    "team_defense": {
      sequence: ["backup-duties", "double-play", "bunt-defense",
                 "first-and-third-defense", "rundown-execution", "pickoff-plays"],
      assessAt: [2, 4, 6],
      positions: ["firstBase", "secondBase", "shortstop", "thirdBase", "pitcher", "catcher"]
    },
    "outfield_craft": {
      sequence: ["fly-ball-tracking", "fly-ball-priority", "outfield-communication",
                 "cutoff-alignment", "gap-coverage", "tag-up-throws"],
      assessAt: [2, 4, 6],
      positions: ["leftField", "centerField", "rightField"]
    },
    "game_management": {
      sequence: ["lineup-basics", "pitching-change-timing", "defensive-substitution",
                 "intentional-walk-decision", "bullpen-management", "late-game-strategy"],
      assessAt: [2, 4, 6],
      positions: ["manager"]
    }
  }
  ```
- **IMPORTANT**: Cross-reference these concept tags against the actual tags in `BRAIN.concepts`. If a tag doesn't exist in `BRAIN.concepts`, either use the closest matching tag or skip that entry. Don't invent concept tags that the system doesn't recognize. Log any mismatches you find.
- **Verify**: Confirm that at least 80% of the concept tags in LEARNING_PATHS exist in `BRAIN.concepts`. Log any that don't match.

### Task 13: Wire Learning Paths into planSession() (Pillar 3A continued)
**Goal**: Make `planSession()` follow the learning path for the current position.

- Add a helper `getCurrentPath(mastery, position)`:
  1. Find all LEARNING_PATHS where `positions` includes the current position
  2. For each path, find the player's progress (how many concepts in the sequence are mastered)
  3. Return the path where the player has the most progress but hasn't completed it yet (i.e., the "active" path)
  4. If all applicable paths are complete, return null (fall back to general concept selection)
- Add a helper `getNextInPath(path, mastery, count)`:
  1. Find the first concept in `path.sequence` that is NOT mastered
  2. Return up to `count` consecutive unmastered concepts from that point
  3. If at an `assessAt` checkpoint, mark the next item as type "assessment"
- Modify `planSession()` to use these helpers:
  - In the "progression" section (where it fills 3-4 scenario slots), call `getCurrentPath()` and `getNextInPath()` instead of picking random unmastered concepts
  - If no active path exists, fall back to the existing behavior
- Store the active learning path name in localStorage state so it persists across sessions. Add an `activePath` field to the player state.
- **Verify**: Start a new session as shortstop. The console log from `planSession()` should show concepts from "defensive_fundamentals" or "team_defense" in sequence order, not random picks.

### Task 14: Connected Scenario Arcs in Agent Pipeline (Pillar 3C)
**Goal**: When the session plan has consecutive "progression" items, generate scenarios that feel like the same game.

- In `buildAgentPrompt()`, accept an optional `previousScenario` parameter.
- When `previousScenario` exists and the current plan item is type "progression":
  - Add to the prompt: `"CONTINUING THE SAME GAME from the previous play. The previous scenario was: '${previousScenario.title}' — ${previousScenario.description.slice(0, 120)}... Build on this game context. It's now a few batters later. The situation has evolved."`
  - Keep the same score from the previous scenario (or adjust slightly) for continuity
- In the main AI generation flow (wherever `generateWithAgentPipeline` or `generateAIScenario` is called), pass the most recent AI scenario as `previousScenario` when the session plan shows consecutive progression items.
- **IMPORTANT**: Only do this for the agent pipeline (Pro users). Standard pipeline stays unchanged.
- **Verify**: Play 3 AI scenarios in a row at the same position. The 2nd and 3rd scenarios should reference or build on previous game context. Check the prompt in console logs.

### Task 15: Baseball IQ Score (Pillar 7C)
**Goal**: A visible, dynamic "Baseball IQ" number (50-160 scale) that reflects strategic understanding.

- Add a `computeBaseballIQ(stats)` function:
  ```javascript
  function computeBaseballIQ(stats) {
    const mastery = stats.masteryData?.concepts || {}
    const allConcepts = Object.keys(BRAIN.concepts || {})
    const totalConcepts = Math.max(allConcepts.length, 1)

    // Breadth: % of concepts mastered (0-1)
    const masteredCount = Object.values(mastery).filter(c => c.state === 'mastered').length
    const breadth = masteredCount / totalConcepts

    // Depth: % of mastered concepts that are diff:3 (advanced)
    const advancedMastered = Object.entries(mastery)
      .filter(([, c]) => c.state === 'mastered')
      .filter(([tag]) => {
        const concept = BRAIN.concepts[tag]
        return concept && (concept.minLevel >= 8 || concept.domain === 'advanced')
      }).length
    const depth = masteredCount > 0 ? advancedMastered / masteredCount : 0

    // Consistency: average confidence across mastered concepts
    const confidences = Object.values(mastery)
      .filter(c => c.state === 'mastered' && c.confidence)
      .map(c => c.confidence)
    const consistency = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0.5

    // Cross-position: unique positions with >60% accuracy
    const ps = stats.ps || {}
    const positionsPlayed = Object.entries(ps)
      .filter(([, v]) => v.p >= 5 && (v.c / v.p) > 0.6).length
    const crossPosition = Math.min(positionsPlayed / 8, 1.0)

    // Error recovery: ratio of retry-successes (approximate from wrong→later-correct)
    const recovery = stats.retrySuccessRate || 0.5

    // Weighted composite
    const raw = breadth * 0.30 + depth * 0.25 + consistency * 0.20
              + crossPosition * 0.15 + recovery * 0.10

    return Math.round(50 + (raw * 110)) // Range: 50-160
  }
  ```
- Add the Baseball IQ display to the **profile/stats screen** in the UI. Find where player stats are displayed (look for level, XP, games played display — probably in the profile or stats section of `App()`). Add a prominent display:
  - Show as: "Baseball IQ: 107 🧠" with a large font
  - Use a color gradient: <80 = gray, 80-100 = blue, 100-120 = green, 120-140 = gold, 140+ = purple
  - Update it reactively (recompute whenever stats change)
- Also add it to the **main dashboard/home screen** if there's a stats summary shown there — it should be one of the first things players see.
- Store the computed IQ in state so it doesn't recompute on every render — update it after each answer.
- **Verify**: Check the profile screen — Baseball IQ should display with the correct color. Play a few scenarios and verify the number updates.

### Task 16: Streak-Aware Coaching (Pillar 7B)
**Goal**: When players are on hot or cold streaks, the coach adapts.

- Find `getSmartCoachLine()` (wherever it was placed — check near the coaching voice system from Task 10).
- Add streak awareness to the situation detection:
  ```javascript
  // Track current streak in the answer handler
  // If player has 5+ correct in a row:
  if (currentStreak >= 5) {
    situations.push({
      key: "hot-streak",
      lines: {
        rookie: ["🔥 Five in a row! You're on FIRE! Let's see if you can handle a tougher one!",
                 "WOW! You're crushing it! Time to level up, superstar!"],
        varsity: ["Five straight — you're locked in. Let me challenge you with something harder.",
                  "You're seeing the game clearly. Time to test that at the next level."],
        scout: ["Five consecutive correct reads. Let's increase the complexity.",
                "Strong streak. Moving to a higher-difficulty concept."]
      }
    })
  }

  // If player has 3+ wrong in a row:
  if (wrongStreak >= 3) {
    situations.push({
      key: "cold-streak",
      lines: {
        rookie: ["Hey, even All-Stars strike out sometimes! Let's try something a little easier.",
                 "Baseball is about bouncing back. Let's slow down and nail the basics!"],
        varsity: ["Baseball is a game of adjustments. Let's go back to fundamentals for a sec.",
                  "Three tough ones — even Trout goes 0-for-3. Let's rebuild from the basics."],
        scout: ["Pattern suggests a concept gap. Dropping to prerequisite level for recalibration.",
                "Adjusting difficulty. Let's solidify the foundation before advancing."]
      }
    })
  }
  ```
- Also: when `wrongStreak >= 3`, modify `planScenario()` or the session plan to auto-drop to a prerequisite concept. This could be as simple as: if the current session plan item is "progression" and wrongStreak >= 3, swap it for a "remediation" item targeting the most recent wrong concept.
- Track `currentStreak` and `wrongStreak` as local state in `App()` (reset on position change, increment on correct/wrong).
- **Verify**: Deliberately get 3 wrong in a row — verify the cold-streak coaching line appears and the next scenario is easier. Then get 5 right — verify hot-streak line and difficulty bump.

## WHEN PHASE C IS DONE

Play a full 8+ scenario AI session at one position and verify:
1. Scenarios follow a learning path sequence (not random concepts)
2. Consecutive scenarios feel like the same game evolving (agent pipeline)
3. Baseball IQ displays on the profile screen and updates after each answer
4. Hot/cold streak coaching lines fire at the right thresholds
5. Console shows session plan creation, path progression, and streak tracking

Then tell me you're ready for Phase D.
