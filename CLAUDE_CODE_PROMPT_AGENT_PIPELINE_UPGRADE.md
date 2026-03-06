# Claude Code Prompt — Agent Pipeline Upgrade (Close the Gap with Standard Pipeline)

## The Problem

The agent pipeline (`generateWithAgentPipeline`) keeps failing grading with scores of 48, 61, 67. The reason: the standard pipeline's system prompt and user prompt have evolved significantly with 10+ quality safeguards that the agent pipeline **never received**. The agent pipeline is essentially running with half the instructions.

## Gap Analysis: What Standard Has That Agent Lacks

| # | Feature | Standard Pipeline | Agent Pipeline | Impact |
|---|---------|------------------|---------------|--------|
| 1 | SCORE RULES | Full block with HOME/AWAY, trailing/leading, tying/go-ahead run definitions | **Missing entirely** | Score errors = #1 quality issue |
| 2 | POSITION-ACTION BOUNDARIES | Detailed `POS_ACTIONS` mapping per position (e.g., "Pitcher=pitch selection, pitch location, pickoff attempts...") | Only has `principles` (generic) | Role violations common |
| 3 | "NEVER give this position options that belong to another position" | Explicit enforcement block for fielders/baserunners | **Missing entirely** | Cross-position contamination |
| 4 | COMMON MISTAKES TO AVOID | 5 specific anti-patterns in system prompt | **Missing entirely** | Repeats known mistakes |
| 5 | analyticsRules | Position-specific IBB/bunt/steal/RE24 guidance | **Missing entirely** | Analytics errors |
| 6 | DESCRIPTION STYLE | "Write as if explaining to a young player. No statistics in descriptions." | **Missing entirely** | Overly technical language |
| 7 | VARY EVERYTHING | "Different count, runner, inning, score each time. Best answer not always index 0." | **Missing entirely** | Repetitive patterns |
| 8 | Template value randomization | `getRandomTemplateValues()` seeds varied values in JSON template | Static template | Patterns in structure |
| 9 | explDepth | Requests 3-tier explanation (simple/why/data) | Only basic explanations | Misses grading checks |
| 10 | Error reinforcement | Checks localStorage for past failures, adds CRITICAL warnings | **Missing entirely** | Repeats past errors |
| 11 | AI_SCENARIO_TOPICS | Position-specific topic ideas | **Missing entirely** | Narrow topic range |
| 12 | AUDIT instruction | "All 4 options must be actions THIS position performs at SAME decision point. rates[best] MUST be highest." | **Missing entirely** | Fails structural checks |

## The Fix: 5 Changes to `buildAgentPrompt` and 2 Changes to `generateWithAgentPipeline`

---

### CHANGE 1: Add SCORE RULES, DESCRIPTION STYLE, VARY EVERYTHING, and AUDIT to `buildAgentPrompt`

Find the `buildAgentPrompt` function (around line 7902). Find the TIER 1 section where it builds the prompt string. After the `ageGate` section (around line 7919), the current Tier 1 ends.

Find this line at the very end of the tier1 template string (around line 7919):
```javascript
${ageGate ? `AGE RESTRICTIONS (${ageGroup}): ${ageGate.forbidden ? "Do NOT use these concepts: " + ageGate.forbidden.join(", ") : ""} ${ageGate.allowed ? "Only use these concepts: " + ageGate.allowed.join(", ") : ""}` : ""}`
```

Add a new section right AFTER the closing backtick of `tier1` (before `// TIER 2`). Create a new variable:

```javascript
  // ═══════════════════════════════════════════════════════════════
  // TIER 1.5: CRITICAL QUALITY RULES (closes gap with standard pipeline)
  // ═══════════════════════════════════════════════════════════════
  const isOffensive = ["batter","baserunner"].includes(position)
  const isDefensive = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"].includes(position)

  const scoreRules = `
SCORE RULES (READ FIRST — score errors are the #1 quality issue):
- score=[HOME, AWAY]. Home team bats in "Bot" half, away team bats in "Top" half.
- ${isOffensive ? "This is an OFFENSIVE position. If the inning is 'Bot X', the player is on the HOME team (score[0]). If 'Top X', the player is on the AWAY team (score[1])." : isDefensive ? "This is a DEFENSIVE position. If the inning is 'Bot X', the player is on the AWAY team (score[1]). If 'Top X', the player is on the HOME team (score[0])." : "Manager can be either team. Pick one and be consistent."}
- If you say "trailing 4-3" the player's team score MUST be 3, opponent MUST be 4.
- If you say "up by 2" the player's team score MUST be exactly 2 more than the opponent.
- "Tying run" = the run that ties the game. "Go-ahead run" = the run that takes the lead. Do NOT confuse these.
- Double-check: read your description, find every score reference, and verify it matches the score array.`

  const descriptionStyle = `
DESCRIPTION STYLE: Write descriptions as if explaining a game situation to a young baseball player. Use simple, everyday language. Do NOT include statistics, RE24 values, batting averages, or advanced analytics in the description or options. Save numbers for explanations only.`

  const POS_ACTIONS = {
    pitcher: "Pitcher=pitch selection, pitch location, pickoff attempts, fielding batted balls, covering 1B on grounders right side, backing up bases.",
    catcher: "Catcher=calling pitches, setting up location targets, blocking, throwing out runners, framing, fielding bunts/WP/PB.",
    batter: "Batter=swing decisions, bunt, take, protect the plate, hit-and-run swing.",
    baserunner: "Baserunner=lead distance, jump timing, steal/hold, tag-up, sliding, secondary lead, advance/hold decisions, reading ball off bat.",
    manager: "Manager=pitching changes, IBB signals, defensive alignment/shifts, steal/bunt signs, pinch hitters, lineup decisions.",
    firstBase: "FirstBase=holding runners at 1B, scooping low throws, stretch footwork, charging bunts, cutoff on CF/RF throws home, 3-6-3 DP, fielding grounders.",
    secondBase: "SecondBase=turning DPs (pivot at 2B), covering 1B on bunts, covering 2B on steals (LHB), relay on LF/CF throws, fielding grounders, positioning.",
    shortstop: "Shortstop=turning DPs (feed to 2B), covering 2B on steals (RHB), relay on CF/RF throws, fielding grounders, cutoff alignment, positioning depth.",
    thirdBase: "ThirdBase=guarding the line, charging bunts/slow rollers, bare-hand plays, tagging runners at 3B, fielding grounders, positioning depth.",
    leftField: "LeftField=tracking fly balls, throwing to cutoff/bases, backing up 3B/SS, playing the wall, reading balls off bat.",
    centerField: "CenterField=tracking fly balls, calling off corner OFs, throwing to cutoff/relay, backing up other OFs, gap coverage.",
    rightField: "RightField=tracking fly balls, throwing to 3B/cutoff, backing up 1B/2B, playing the wall, strongest arm to 3B.",
  }
  const posActionText = POS_ACTIONS[position] || POS_ACTIONS.manager

  const FIELDER_POS_LIST = ["firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"]
  const isFielder = FIELDER_POS_LIST.includes(position)
  const analyticsRules = isFielder
    ? "ANALYTICS: Bunting with 0 outs usually lowers run expectancy. Sac bunt only justified with weak hitter, late game, need 1 run. IBBs, pitching changes, and defensive shifts are MANAGER decisions — do NOT create fielder scenarios about these topics."
    : position === "baserunner"
    ? "ANALYTICS: Steals need ~72% success to break even. Bunting usually lowers RE24. IBBs under 2023+ rules give the runner no decision (automatic advance) — NEVER create baserunner scenarios about IBBs."
    : position === "batter"
    ? "ANALYTICS: Bunting with 0 outs usually lowers RE24. Sac bunt only justified with weak hitter, late game, need 1 run. Two-strike approach = protect the plate. IBBs and pitching changes are not batter decisions."
    : "ANALYTICS: Intentional walks almost always wrong per The Book (Tango). NEVER make IBB the best answer unless runners on 2nd+3rd with 1 out. Never put go-ahead/winning run on base via IBB. IBB REQUIRES 1B open."

  const positionBoundaries = `
POSITION-ACTION BOUNDARIES: ${posActionText}
NEVER give this position options that belong to another position. Fielders do NOT call IBBs, shift the defense, call for pitchouts, or make pitching changes. Baserunners CANNOT "yell at pitcher", "call a play", "signal the batter".
${analyticsRules}`

  const auditInstruction = `
AUDIT CHECKLIST (verify before responding):
- All 4 options are actions THIS position performs at the SAME decision point
- rates[best] is the HIGHEST rate value
- score=[HOME,AWAY] matches the description text
- Every explanation references the SPECIFIC game situation
- Best answer index (0-3) should vary — do NOT always make the best answer index 0 or 1`

  const qualityRules = scoreRules + descriptionStyle + positionBoundaries + auditInstruction
```

---

### CHANGE 2: Add template value randomization to `buildAgentPrompt`

Find the JSON output template at the end of `buildAgentPrompt` (around line 7964-7976). The current template is:

```javascript
return `${tier1}${tier2}${tier3}${avoidText}${contextSection}${voiceSection}${patchSection}

NOW: Generate ONE scenario as a JSON object with this EXACT structure:
{
  "title": "Short memorable title (3-6 words)",
  "diff": ${difficulty},
  "description": "3-5 sentence game situation. Last sentence sets up the decision moment.",
  "situation": {"inning": "Top/Bot N", "outs": 0-2, "count": "B-S", "runners": [], "score": [HOME, AWAY]},
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "best": 0-3,
  "explanations": ["Why A is best/wrong", "Why B is best/wrong", "Why C is best/wrong", "Why D is best/wrong"],
  "rates": [0-100, 0-100, 0-100, 0-100],
  "concept": "One sentence: the baseball concept this teaches and WHY it matters.",
  "anim": "one of: steal, score, hit, throwHome, doubleplay, strike, strikeout, groundout, flyout, catch, advance, walk, bunt, safe, freeze"
}`
```

Replace the ENTIRE return statement with:

```javascript
  // Randomize template values to prevent patterns (matches standard pipeline)
  const tv = getRandomTemplateValues()

  return `${tier1}${qualityRules}${tier2}${tier3}${avoidText}${contextSection}${voiceSection}${patchSection}

NOW: Generate ONE scenario as a JSON object with this EXACT structure:
{
  "title": "Short memorable title (3-6 words)",
  "diff": ${difficulty},
  "description": "3-5 sentence game situation. Last sentence sets up the decision moment.",
  "situation": {"inning": "${tv.inning}", "outs": ${tv.outs}, "count": "${tv.count}", "runners": ${tv.runners}, "score": [HOME, AWAY]},
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "best": ${tv.best},
  "explanations": ["Why A is best/wrong", "Why B is best/wrong", "Why C is best/wrong", "Why D is best/wrong"],
  "explDepth": [{"simple":"1 sentence kid version","why":"2-3 sentence strategic reasoning","data":"RE24/stat reference or n/a"},{"simple":"...","why":"...","data":"..."},{"simple":"...","why":"...","data":"..."},{"simple":"...","why":"...","data":"..."}],
  "rates": ${tv.rates},
  "concept": "One sentence: the baseball concept this teaches and WHY it matters.",
  "anim": "one of: steal, score, hit, throwHome, doubleplay, strike, strikeout, groundout, flyout, catch, advance, walk, bunt, safe, freeze"
}
explDepth: array of 4 objects (one per option). "simple"=1 sentence a 6-year-old understands. "why"=2-3 sentences of strategic reasoning. "data"=1 sentence referencing a real stat — write "n/a" if no stat applies.
count format: "B-S" (0-3 balls, 0-2 strikes) or "-". runners: [] empty, [1]=1st, [2]=2nd, [1,2]=1st+2nd, [1,2,3]=loaded. rates: optimal 75-90, decent 45-65, poor 10-40.`
```

**IMPORTANT**: Note the key changes:
1. `${qualityRules}` is inserted between `${tier1}` and `${tier2}`
2. Template values now use `tv.inning`, `tv.outs`, `tv.count`, `tv.runners`, `tv.best`, `tv.rates` instead of static placeholders
3. `explDepth` is now requested (matches standard pipeline)
4. Rate guidance added at the end: "optimal 75-90, decent 45-65, poor 10-40"
5. Count format and runners format documented

---

### CHANGE 3: Upgrade the agent pipeline system prompt in `generateWithAgentPipeline`

Find the system prompt in `generateWithAgentPipeline` (around line 8124). The current system content is a long string starting with `"You are the smartest, most experienced baseball coach..."`.

Replace the ENTIRE system content string (line 8124, the value of `content:` in the system message) with:

```javascript
"You are the smartest, most experienced baseball coach in the world. You have coached at every level from tee-ball to MLB. You know the fundamentals cold. You teach concepts the way a patient coach explains them on the field — concrete, specific, grounded in real baseball.\n\nYou create training scenarios for Baseball Strategy Master, a strategy-teaching app for kids 6-18.\n\nOUTPUT: Respond with ONLY a valid JSON object. No markdown, no code fences, no text outside the JSON.\n\nGOLDEN RULE: Every scenario teaches ONE baseball concept. The concept drives everything — the situation setup, the 4 options, the correct answer, and every explanation. If an option does not relate to the concept being taught, replace it with one that does.\n\nEXPLANATION RULES (most important — players learn from explanations):\n- Each explanation: 2-4 sentences.\n- BEST answer explanation: Name the action → state WHY it is correct in THIS specific game situation (reference score, inning, outs, runners, count) → state the POSITIVE RESULT.\n- WRONG answer explanations: Name the action → state WHY it fails in THIS situation with concrete consequences → teach what makes it wrong.\n- Write from the player's perspective: \"you\", \"your team\", \"your runner\" — never \"the offense\" or \"the batting team.\"\n- NEVER use jargon like RE24, OBP, wOBA, xBA in descriptions or options. Stats go in explDepth.data only.\n- EVERY explanation must reference the SPECIFIC game situation. No generic explanations ever.\n\nOPTION RULES:\n- All 4 options happen at the SAME decision moment. Never mix \"before the pitch\" with \"after the ball is hit.\"\n- Each option is a SPECIFIC, CONCRETE action (not \"make the right play\" or \"do something smart\").\n- Options must be STRATEGICALLY DISTINCT — not 4 variations of the same action.\n- At least one option should be a common MISTAKE that a young player would actually make — this is how kids learn.\n- No near-duplicates. If two options describe essentially the same action with different wording, replace one.\n\nSITUATION RULES:\n- outs: 0, 1, or 2 (never 3).\n- count: valid format \"B-S\" where balls 0-3, strikes 0-2. Use \"-\" only if count is irrelevant.\n- runners: array of occupied bases [1], [1,3], [1,2,3], or [] for empty. Must match the description exactly.\n- score: [HOME, AWAY]. Home team bats in \"Bot\" half. If description says \"trailing 4-3\" and it is Bot inning, score must be [3,4] not [4,3].\n- The LAST sentence of the description MUST set up the exact decision moment.\n\nVARY EVERYTHING: Different count, runner configuration, inning (1-9), and score each time. The best answer should NOT always be option index 0 or 1 — distribute across 0-3.\n\nPOSITION BOUNDARIES: The scenario MUST only include actions that the selected position actually performs on the field. A center fielder does not call pitches. A batter does not position the defense. A pitcher does not decide the batting order.\n\nCOMMON MISTAKES TO AVOID:\n- Best explanation argues for the wrong option.\n- Score math is wrong (e.g., \"one-run game\" when the difference is 2 runs).\n- Combining two actions in one option (\"Wave off CF but also back up the throw\").\n- Options that no real player would ever consider.\n- Description says one thing but situation object says another."
```

This is the same system prompt the standard pipeline uses (lines 8472-8511), now given to the agent pipeline too.

---

### CHANGE 4: Pass `realGameFeelText` and `promptPatchText` context to agent's user prompt

In `generateWithAgentPipeline` (around line 8088), after the plan is created but before `buildAgentPrompt` is called, the function receives `flaggedAvoidText` as a parameter. But when called from `generateAIScenario` (line 8310), the combined text `flaggedAvoidText + realGameFeelText + promptPatchText` is passed.

The issue is that `buildAgentPrompt` uses `plan.flaggedAvoidText` (set on line 8088), but the combined text may be very long. The `buildAgentPrompt` function puts it in the `avoidSection`. This is actually already working — verify that `flaggedAvoidText` on line 8088 is the combined string.

Find line 8088:
```javascript
if (flaggedAvoidText) plan.flaggedAvoidText = flaggedAvoidText
```

This is correct — the combined string from line 8310 flows through. **No change needed here.**

---

### CHANGE 5: Add error reinforcement to `buildAgentPrompt`

In `buildAgentPrompt`, add error reinforcement similar to the standard pipeline. Add this code right BEFORE the return statement (before the `const tv = getRandomTemplateValues()` line you added in Change 2):

```javascript
  // Dynamic error reinforcement from error history (matches standard pipeline)
  let errorReinforcement = ""
  try {
    const errStore = JSON.parse(localStorage.getItem("bsm_ai_errors") || "{}")
    const roleViolations = errStore[position + ":role-violation"] || 0
    const parseErrors = errStore[position + ":parse"] || 0
    const qualityErrors = errStore[position + ":quality-firewall"] || 0
    if (roleViolations >= 2) errorReinforcement += "\nCRITICAL: Previous scenarios for this position had role violations. Double-check EVERY option is an action this specific position performs."
    if (parseErrors >= 2) errorReinforcement += "\nCRITICAL: Previous responses had JSON errors. Respond with ONLY valid JSON — no markdown, no text before or after."
    if (qualityErrors >= 2) errorReinforcement += "\nCRITICAL: Previous scenarios failed quality checks. Ensure explanations are detailed (3+ sentences), all options are distinct, and success rates are realistic."
  } catch {}
```

Then include `${errorReinforcement}` in the return string, right after `${patchSection}`:

Change:
```javascript
return `${tier1}${qualityRules}${tier2}${tier3}${avoidText}${contextSection}${voiceSection}${patchSection}
```

To:
```javascript
return `${tier1}${qualityRules}${tier2}${tier3}${avoidText}${contextSection}${voiceSection}${patchSection}${errorReinforcement}
```

---

### CHANGE 6: Add AI_SCENARIO_TOPICS to agent prompt

In `buildAgentPrompt`, right after the `tier2Parts` section (around line 7927), add the topics text:

Find:
```javascript
const tier2 = tier2Parts.length > 0 ? `\nBASEBALL REFERENCE DATA:\n${tier2Parts.join("\n")}` : ""
```

Add right after it:
```javascript
  const topicsText = AI_SCENARIO_TOPICS[position] || ""
  const topicsSection = topicsText ? `\nSCENARIO TOPIC IDEAS:\n${topicsText}` : ""
```

Then include `${topicsSection}` in the return string. Change the return to:
```javascript
return `${tier1}${qualityRules}${topicsSection}${tier2}${tier3}${avoidText}${contextSection}${voiceSection}${patchSection}${errorReinforcement}
```

---

### CHANGE 7: Add the `getAIFewShot` call as an additional quality example

The standard pipeline calls `getAIFewShot(position, targetConcept, diffTarget)` which returns a curated few-shot example specifically matched to the position, concept, and difficulty. The agent pipeline uses `plan.exampleScenarios` from the knowledge base, which is good, but let's also include the targeted few-shot.

In `buildAgentPrompt`, find the TIER 3 section (around line 7932-7935). After the existing `tier3` variable, add:

```javascript
  // Also include the targeted few-shot example (matches standard pipeline)
  const fewShotExample = getAIFewShot(position, targetConcept, difficulty)
  const fewShotSection = fewShotExample ? `\nHIGH-QUALITY EXAMPLE (match this quality level):\n${fewShotExample}` : ""
```

Include `${fewShotSection}` in the return string right after `${tier3}`:
```javascript
return `${tier1}${qualityRules}${topicsSection}${tier2}${tier3}${fewShotSection}${avoidText}${contextSection}${voiceSection}${patchSection}${errorReinforcement}
```

---

## Summary of All Changes

**`buildAgentPrompt` function (7 additions):**
1. New `qualityRules` variable with SCORE RULES, DESCRIPTION STYLE, POSITION-ACTION BOUNDARIES, ANALYTICS, AUDIT CHECKLIST
2. Template value randomization using `getRandomTemplateValues()`
3. `explDepth` requested in JSON template
4. Rate guidance and format documentation in template
5. Error reinforcement from localStorage
6. AI_SCENARIO_TOPICS injection
7. `getAIFewShot()` targeted few-shot example

**`generateWithAgentPipeline` function (1 change):**
8. Upgraded system prompt to match standard pipeline's full system prompt

**No changes to:**
- `gradeAgentScenario` (thresholds are fine — the scenarios will be better quality now)
- `planScenario` (planner is working correctly)
- Worker code (no server changes needed)

## Verification

After applying changes:

1. Search `buildAgentPrompt` for `SCORE RULES` — should appear
2. Search `buildAgentPrompt` for `POSITION-ACTION BOUNDARIES` — should appear
3. Search `buildAgentPrompt` for `getRandomTemplateValues` — should appear
4. Search `buildAgentPrompt` for `explDepth` — should appear in the JSON template
5. Search `buildAgentPrompt` for `errorReinforcement` — should appear
6. Search `buildAgentPrompt` for `AI_SCENARIO_TOPICS` — should appear
7. Search `buildAgentPrompt` for `getAIFewShot` — should appear
8. Search `generateWithAgentPipeline` system content for `COMMON MISTAKES TO AVOID` — should appear

9. Test: Play 5+ AI scenarios. Console should show:
   - `[BSM] Trying agent pipeline (A/B variant: agent)`
   - `[BSM Agent] Grade: XX pass: true` — grades should now be 65-85+ (instead of 48-67)
   - Score arrays should match descriptions
   - Options should all be actions for the correct position
   - Explanations should reference specific game situations

10. If agent pipeline STILL fails occasionally, that's OK — it falls back to standard pipeline gracefully. The goal is to get the pass rate from ~30% to ~70%+.

## Priority

This is a single prompt — all 8 changes go into `buildAgentPrompt` and `generateWithAgentPipeline`. No worker changes needed. No deployment step.
