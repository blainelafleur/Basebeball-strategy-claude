# Claude Code Execution Prompt — AI Superpower Plan Phase B

Copy everything below the line into Claude Code:

---

Read `AI_SUPERPOWER_PLAN.md` — specifically **Phase B: Coaching Intelligence (Weeks 3-4)**. Phase A is complete. Now execute Phase B, one task at a time.

## RULES (same as Phase A)

1. **One task at a time.** Complete task 7 fully before starting task 8.
2. **After each task**, verify `preview.html` loads without console errors. If the app breaks, fix it before moving on.
3. **Commit after each working task** with a message like `feat: add session planner (Pillar 3B)`.
4. **Single-file app** (~6,000+ lines in `index.jsx`). Surgical edits only. Read 50 lines of context before editing any function.
5. **Don't change handcrafted scenarios.** Changes affect AI scenario flow and supporting functions only.
6. **Phase A context**: Error classification already existed (`classifyAndFeedback()`). `brainContradiction` was added to QUALITY_FIREWALL. `formatBrainForAI()` now has pre-calculated conclusions. Pedagogical grading was added to `gradeAgentScenario()`. `CONCEPT_GATES` is wired into `planScenario()` and `buildAgentPrompt()`.

## PHASE B TASKS (Do these in order)

### Task 7: Session Planner (Pillar 3B)
**Goal**: Instead of generating isolated AI scenarios, plan an 8-scenario session sequence at the start.

- Add a `planSession(stats, position)` function near `planScenario()` (~line 6897 area). It should:
  1. Check for degraded concepts (remediation slots — 1-2 scenarios)
  2. Check for prerequisite gaps (1 scenario)
  3. Advance along a learning progression (3-4 scenarios using available unmastered concepts)
  4. Add one challenge scenario (hardest unmastered concept)
  5. Add one engagement scenario (famous play or cross-position)
  6. Return an array of `{ type, concept }` objects, max 8 items
- Store the session plan in a `useRef` inside `App()` — call it `sessionPlanRef`
- When `planScenario()` runs, check if `sessionPlanRef.current` has items. If yes, pop the next item and use its `type` and `concept` to guide the teaching goal and concept selection. If empty or null, fall back to current behavior.
- Reset the session plan when the player switches positions or starts a new session.
- **Verify**: Play 3 AI scenarios in a row for the same position. Check console logs — you should see the session plan being created on the first scenario and items being consumed on subsequent ones.

### Task 8: Situation-Optimal Generation (Pillar 5B)
**Goal**: When the agent pipeline picks a concept to teach, also specify the ideal game situation for that concept.

- Add a `CONCEPT_SITUATIONS` mapping near the `BRAIN.concepts` area or near `planScenario()`:
  ```javascript
  const CONCEPT_SITUATIONS = {
    "force-vs-tag": { runners: [1, 2], outs: 1 },
    "steal-timing": { runners: [1], outs: 0 },
    "sacrifice-bunt": { runners: [2], outs: 0 },
    "relay-positioning": { runners: [2], outs: 0 },
    "infield-fly": { runners: [1, 2], outs: 0 },
    "double-play": { runners: [1], outs: 0 },
    "tag-up": { runners: [3], outs: 0 },
    "hit-and-run": { runners: [1], outs: 0, count: "1-1" },
    "squeeze-play": { runners: [3], outs: 1 },
    "cutoff-basics": { runners: [2], outs: 1 },
    "backup-duties": { runners: [1], outs: 0 },
    "pickoff-moves": { runners: [1], outs: 0 },
    "pitch-count": { runners: [], outs: 0 },
    "two-strike-approach": { runners: [], outs: 1, count: "1-2" },
    "count-leverage": { runners: [1], outs: 1, count: "3-1" },
    "lead-distance": { runners: [1], outs: 0 },
    "secondary-leads": { runners: [1, 2], outs: 1 }
  }
  ```
- In `planScenario()`, after selecting `selectedConcept`, look up `CONCEPT_SITUATIONS[selectedConcept]`. If found, add it to the returned plan object as `situationHint`.
- In `buildAgentPrompt()`, if `plan.situationHint` exists, inject: `"REQUIRED SITUATION: Set runners to ${JSON.stringify(hint.runners)}, outs to ${hint.outs}${hint.count ? ', count to ' + hint.count : ''}. This situation best illustrates the concept."`
- **Verify**: Generate an AI scenario for "baserunner" position. Check that the console log from planScenario shows a situationHint, and the generated scenario's situation matches the hint.

### Task 9: Coaching Follow-Up Offer (Pillar 1B)
**Goal**: After a wrong answer, show a "Try Again?" button that generates a new scenario targeting the same concept from a different angle.

- Find where wrong-answer feedback is displayed in `App()` (look for the feedback/explanation rendering area, probably ~line 5200 area where explanations are shown after answering).
- After the explanation display, add a "Try Again?" button that:
  1. Only appears on wrong answers
  2. Only appears for Pro users OR if the player has remaining free plays
  3. When clicked, calls the AI scenario generator with `targetConcept` set to the current scenario's `conceptTag` or `concept`
  4. Passes a flag or note that this is a remediation attempt so the prompt can say "approach from a different angle"
- Style the button to match the existing UI (look at other buttons in the app for the pattern).
- **Verify**: Get a scenario wrong deliberately. Verify the "Try Again?" button appears. Click it and verify a new AI scenario loads targeting the same concept.

### Task 10: Coach Persona System (Pillar 7A)
**Goal**: Three distinct coaching voices based on player age/level.

- Add a `COACH_VOICES` constant near the other config constants:
  ```javascript
  const COACH_VOICES = {
    rookie: {
      ageRange: [5, 10],
      system: "You are Coach Rookie — an enthusiastic, encouraging youth baseball coach. Use simple words, exciting analogies, and celebrate effort. Never use statistics or advanced terms. Keep sentences short. Use exclamation marks naturally.",
      lineStyle: "excited"
    },
    varsity: {
      ageRange: [11, 14],
      system: "You are Coach Varsity — a knowledgeable travel ball coach. Reference real MLB players as examples when relevant. Introduce statistics gently with phrases like 'the numbers show...' Be encouraging but also direct about mistakes.",
      lineStyle: "teaching"
    },
    scout: {
      ageRange: [15, 18],
      system: "You are Coach Scout — an analytical baseball mind who respects the player's intelligence. Use full statistical vocabulary freely. Reference game theory and RE24 when relevant. Talk to the player as a peer analyst.",
      lineStyle: "analytical"
    }
  }
  ```
- Add a helper `getCoachVoice(stats)` that returns the appropriate voice based on the player's level or age group setting.
- In `buildAgentPrompt()` (~line 6984) and in the standard `generateAIScenario()` system prompt, inject the coach voice's `system` text.
- Also update `getSmartCoachLine()` to use the coach voice — if the voice is "rookie", use simpler/more excited coaching lines; if "scout", use analytical ones.
- **Verify**: Set your player to a low level (simulate age 8) and generate an AI scenario. The explanations should use simple, encouraging language. Then set to high level and verify analytical language appears.

### Task 11: Age-Adaptive Prompt Injection (Pillar 4B)
**Goal**: Inject age-specific strategic adjustments into the AI prompt.

- In `buildAgentPrompt()`, after the position principles section, add:
  ```
  PLAYER AGE GROUP: ${ageGroup}
  STRATEGIC ADJUSTMENTS FOR THIS AGE:
  ${adjustments from CONCEPT_GATES[ageGroup]}
  ```
- Use the `CONCEPT_GATES` constant added in Phase A Task 6. Extract the `adjustments` object for the player's age group and format it as bullet points.
- Also inject any `forbidden` concepts list so the AI knows what NOT to reference: `"NEVER mention or test these concepts: ${forbidden.join(', ')}"`
- **Verify**: Generate an AI scenario for a young player (diff:1). Check the console log of the prompt being sent — it should include the age adjustments and forbidden list. The scenario should NOT reference advanced concepts.

## WHEN PHASE B IS DONE

Play through a full AI session:
1. Start as a low-level player at shortstop — verify Coach Rookie voice and simple concepts
2. Get one wrong — verify "Try Again?" button appears
3. Play 4+ scenarios — verify session plan is consumed (console logs show plan items being popped)
4. Check that situations match the concept being taught (e.g., steal scenarios have a runner on 1st)

Then tell me you're ready for Phase C.
