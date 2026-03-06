# Claude Code Execution Prompt — AI Superpower Plan Phase A

Copy everything below the line into Claude Code:

---

Read `AI_SUPERPOWER_PLAN.md` thoroughly — it's the master plan. Then execute **Phase A (Foundation & Validation)** one task at a time. Here are your rules:

## RULES

1. **One task at a time.** Do not batch. Complete task 1 fully before starting task 2.
2. **After each task**, run `npx serve . &` and verify `preview.html` loads without console errors. If the app breaks, fix it before moving on.
3. **Commit after each working task** with a descriptive message like `feat: add error classification system (Pillar 1A)`.
4. **This is a single-file app** (~6,000 lines in `index.jsx`). Make surgical edits — never rewrite large sections. Use the exact line numbers and function names from the plan.
5. **Don't change handcrafted scenarios.** Your changes only affect AI-generated scenario flow and the functions listed in the plan.
6. **Read before you edit.** Before touching any function, read 50 lines above and below it to understand context.

## PHASE A TASKS (Do these in order)

### Task 1: Error Classification System (Pillar 1A)
- Add `classifyError(scenario, chosenIdx, bestIdx, position)` function after `enrichFeedback()` (~line 6130 in index.jsx)
- It returns `{ type, remedy, weight }` based on the error taxonomy in the plan
- Wire it into the answer handler in `App()` — find where wrong answers are processed (~line 4800 area, look for where `wrongCounts` is updated) and call `classifyError()` there
- Store the error type in the player's state alongside the existing spaced-repetition data
- **Verify**: Add a `console.log("[BSM] Error classified:", result)` so you can see it firing

### Task 2: Brain-Data Answer Validator (Pillar 2A)
- Add `brainContradiction` check to `QUALITY_FIREWALL.tier1` (~line 6410)
- It checks: does the best answer recommend bunting when bunt delta is < -0.15? Does it recommend stealing without acknowledging break-even?
- Reference the code in the plan — adapt it to match the existing QUALITY_FIREWALL pattern
- **Verify**: Run the existing `gradeScenario()` test cases (if any) or manually verify with a test scenario object

### Task 3: Enhance formatBrainForAI with Pre-Calculated Conclusions (Pillar 2B)
- Find `formatBrainForAI()` (~line 6200)
- After the existing data injection, add a "CALCULATED ANALYSIS" section that computes RE24, scoring probability, and steal viability for the current situation and injects plain-English conclusions
- Example output: `"Current RE24: 0.71 (runner on 2nd, 1 out). Scoring chance: 63%. USE THESE NUMBERS to validate your correct answer."`
- **Verify**: Call `formatBrainForAI("pitcher", {runners:[2], outs:1, count:"3-1"})` in console and check the output includes calculated conclusions

### Task 4: Pedagogical Grading (Pillar 5A)
- Find `gradeAgentScenario()` (~line 7026)
- After the existing `agentDeductions` checks (~line 7062), add:
  - Best explanation length check (< 80 chars = -10 points)
  - Causal reasoning check (missing "because/since/this means" = -5 points)
  - Brain contradiction check (call the new `brainContradiction` from Task 2, = -15 points)
- **Verify**: Create a test scenario object with a too-short explanation and verify the grade drops

### Task 5: D1 Learning Events Table (Pillar 6C)
- In `worker/index.js`, add a migration or initialization for the `learning_events` table
- Wire the existing `/analytics/population-difficulty` POST endpoint to actually INSERT into this table
- Add a GET endpoint at `/analytics/difficulty-calibration` that returns concepts with extreme correct rates
- **Verify**: Deploy with `cd worker && npx wrangler deploy` and test with a curl POST

### Task 6: Concept Gating by Age (Pillar 4A)
- Add the `CONCEPT_GATES` constant near the other constants (~line 2870 area)
- Wire it into `planScenario()` (~line 6926): after a concept is selected, check it against `CONCEPT_GATES[ageGroup].allowed`. If the concept is in `forbidden`, pick a different one
- Inject `CONCEPT_GATES[ageGroup].adjustments` into `buildAgentPrompt()` so the AI knows age-specific strategy differences
- **Verify**: Call `planScenario()` with a simulated age 7 player and confirm it never selects "suicide-squeeze" or "RE24"

## WHEN PHASE A IS DONE

Run the full app, play 5 AI scenarios, and verify:
- Console shows error classification on wrong answers
- AI scenarios don't recommend bunting/stealing against the numbers
- Young-player simulations don't get advanced concepts
- The worker deploys cleanly

Then tell me you're ready for Phase B, and I'll give you the next prompt.
