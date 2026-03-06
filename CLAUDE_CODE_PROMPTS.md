# Claude Code Prompts — AI Generation Overhaul

## How to Use These Prompts
Feed each prompt to Claude Code in your Windsurf terminal **one at a time, in order**. Wait for each prompt to finish before feeding the next one. After each prompt completes, do a quick manual test by generating an AI scenario in the app to confirm nothing is broken.

---

## PROMPT 1: Quick Wins — Model Switch, Token Limit, System Prompt Rewrite

```
I need you to make 3 surgical changes to index.jsx. Do NOT change anything else. Read the entire file first, then make these changes:

CHANGE 1 — Switch AI model (3 locations):
Find ALL instances of the string "grok-4-1-fast-non-reasoning" and replace them with "grok-3-mini". There are exactly 3 occurrences:
- Around line 7871 (inside generateWithAgentPipeline, the agent pipeline fetch)
- Around line 8219 (inside generateAIScenario, the main pipeline fetch)
- Around line 8646 (inside the AI self-audit fetch)
Replace all 3 with "grok-3-mini".

CHANGE 2 — Increase max_tokens (2 locations):
Find "max_tokens: 1800" and replace with "max_tokens: 2500". There are exactly 2 occurrences:
- Around line 7872 (agent pipeline)
- Around line 8220 (main pipeline)
Do NOT change the max_tokens: 200 on the self-audit call (around line 8647). Leave that one alone.

CHANGE 3 — Rewrite the system prompt:
Find the system prompt that starts with:
coachSystem + ` You are creating personalized training scenarios for the Baseball Strategy Master app.

This is the long template literal that spans from approximately line 8223 to line 8249 (ending with the SITUATION CONSISTENCY rule).

Replace the ENTIRE content of that template literal (everything between the backtick after coachSystem + ` and the closing backtick before + systemSuffix) with this new system prompt:

` You create training scenarios for Baseball Strategy Master, a strategy-teaching app for kids 6-18.

ROLE: You are the smartest, most experienced baseball coach in the world. You have coached at every level from tee-ball to MLB. You know the fundamentals cold. You teach concepts the way a patient coach explains them on the field — concrete, specific, grounded in real baseball.

OUTPUT: Respond with ONLY a valid JSON object. No markdown, no code fences, no text outside the JSON.

GOLDEN RULE: Every scenario teaches ONE baseball concept. The concept drives everything — the situation setup, the 4 options, the correct answer, and every explanation. If an option does not relate to the concept being taught, replace it with one that does.

EXPLANATION RULES (most important — players learn from explanations):
- Each explanation: 2-4 sentences.
- BEST answer explanation: Name the action → state WHY it is correct in THIS specific game situation (reference score, inning, outs, runners, count) → state the POSITIVE RESULT.
- WRONG answer explanations: Name the action → state WHY it fails in THIS situation with concrete consequences → teach what makes it wrong.
- Write from the player's perspective: "you", "your team", "your runner" — never "the offense" or "the batting team."
- NEVER use jargon like RE24, OBP, wOBA, xBA in descriptions or options. Stats go in explDepth.data only.
- EVERY explanation must reference the SPECIFIC game situation. No generic explanations ever.

OPTION RULES:
- All 4 options happen at the SAME decision moment. Never mix "before the pitch" with "after the ball is hit."
- Each option is a SPECIFIC, CONCRETE action (not "make the right play" or "do something smart").
- Options must be STRATEGICALLY DISTINCT — not 4 variations of the same action (e.g., not 4 different pitches for a pitcher scenario, not 4 different throws for a fielder scenario).
- At least one option should be a common MISTAKE that a young player would actually make — this is how kids learn.
- No near-duplicates. If two options describe essentially the same action with different wording, replace one.

SITUATION RULES:
- outs: 0, 1, or 2 (never 3).
- count: valid format "B-S" where balls 0-3, strikes 0-2. Use "-" only if count is irrelevant.
- runners: array of occupied bases [1], [1,3], [1,2,3], or [] for empty. Must match the description exactly.
- score: [HOME, AWAY]. Home team bats in "Bot" half. If description says "trailing 4-3" and it is Bot inning, score must be [3,4] not [4,3].
- The LAST sentence of the description MUST set up the exact decision moment. All 4 options are what the player does RIGHT NOW.

VARY EVERYTHING: Different count, runner configuration, inning (1-9), and score each time. The best answer should NOT always be option index 0 or 1 — distribute across 0-3.

POSITION BOUNDARIES: The scenario MUST only include actions that the selected position actually performs on the field. A center fielder does not call pitches. A batter does not position the defense. A pitcher does not decide the batting order.

COMMON MISTAKES TO AVOID:
- Best explanation argues for the wrong option.
- Score math is wrong (e.g., "one-run game" when the difference is 2 runs).
- Combining two actions in one option ("Wave off CF but also back up the throw").
- Options that no real player would ever consider.
- Description says one thing but situation object says another.`

After making all 3 changes, verify by searching the file for:
1. "grok-4-1-fast-non-reasoning" — should return 0 results
2. "grok-3-mini" — should return exactly 3 results
3. "max_tokens: 1800" — should return 0 results
4. "max_tokens: 2500" — should return exactly 2 results
5. "max_tokens: 200" — should return exactly 1 result (the self-audit)
6. "GOLDEN RULE" — should appear once in the new system prompt
```

---

## PROMPT 2: Full Few-Shot Examples (Stop Truncating)

```
I need you to fix the few-shot example system in index.jsx. The current getAIFewShot() function (around line 4445) truncates handcrafted scenarios — cutting descriptions to 200/150 chars and explanations to 2/1 sentences. This destroys the quality signal the AI needs to learn from.

Read the file first, then make these changes:

CHANGE 1 — Stop truncating secondary examples in getAIFewShot():

Find the secondary example block (around lines 4460-4467) that looks like:
```js
      secondary = JSON.stringify({
        title: conceptMatch.title, diff: conceptMatch.diff,
        description: conceptMatch.description?.slice(0, 200) + (conceptMatch.description?.length > 200 ? "..." : ""),
        options: conceptMatch.options, best: conceptMatch.best,
        explanations: conceptMatch.explanations.map(e => e.split(". ").slice(0, 2).join(". ") + "."),
        rates: conceptMatch.rates, concept: conceptMatch.concept, anim: conceptMatch.anim || "strike"
      })
```

Replace it with:
```js
      secondary = JSON.stringify({
        title: conceptMatch.title, diff: conceptMatch.diff,
        description: conceptMatch.description,
        situation: conceptMatch.situation,
        options: conceptMatch.options, best: conceptMatch.best,
        explanations: conceptMatch.explanations,
        rates: conceptMatch.rates, concept: conceptMatch.concept, anim: conceptMatch.anim || "strike"
      })
```

Key changes: full description (no slice), full explanations (no sentence truncation), and include the situation object.

CHANGE 2 — Stop truncating tertiary examples:

Find the tertiary example block (around lines 4474-4481) that looks like:
```js
      tertiary = JSON.stringify({
        title: diffMatch.title, diff: diffMatch.diff,
        description: diffMatch.description?.slice(0, 150) + "...",
        options: diffMatch.options, best: diffMatch.best,
        explanations: diffMatch.explanations.map(e => e.split(". ")[0] + "."),
        rates: diffMatch.rates, concept: diffMatch.concept, anim: diffMatch.anim || "strike"
      })
```

Replace it with:
```js
      tertiary = JSON.stringify({
        title: diffMatch.title, diff: diffMatch.diff,
        description: diffMatch.description,
        situation: diffMatch.situation,
        options: diffMatch.options, best: diffMatch.best,
        explanations: diffMatch.explanations,
        rates: diffMatch.rates, concept: diffMatch.concept, anim: diffMatch.anim || "strike"
      })
```

Same idea: full description, full explanations, include situation.

CHANGE 3 — Also fix the example descriptions in planScenario():

Find around line 7657 where planScenario() truncates example scenarios:
```js
    exampleScenarios: exampleScenarios.map(s => ({
      title: s.title, diff: s.diff, concept: s.concept,
      description: (s.description || "").slice(0, 150),
      options: s.options, best: s.best,
      rates: s.rates
    })),
```

Replace with:
```js
    exampleScenarios: exampleScenarios.map(s => ({
      title: s.title, diff: s.diff, concept: s.concept,
      description: s.description,
      situation: s.situation,
      options: s.options, best: s.best,
      explanations: s.explanations,
      rates: s.rates, anim: s.anim || "strike"
    })),
```

Now the AI sees complete, high-quality examples instead of butchered fragments. The handcrafted scenarios are the gold standard — the AI needs to see them in full to understand what quality looks like.

After making changes, verify:
1. Search for ".slice(0, 200)" — should return 0 results in getAIFewShot
2. Search for ".slice(0, 150)" — should return 0 results in getAIFewShot or planScenario
3. Search for ".split(\". \").slice" — should return 0 results in getAIFewShot
```

---

## PROMPT 3: 3-Tier Prompt Architecture for the Agent Pipeline

```
I need you to restructure how the agent pipeline builds its prompt. The current buildAgentPrompt() function (around line 7678) dumps everything into one flat prompt. I need it restructured into 3 clear tiers.

Read the file first, then find the buildAgentPrompt() function (starts around line 7678). Replace the ENTIRE function with this:

function buildAgentPrompt(plan, previousScenario = null) {
  const { position, difficulty, teachingGoal, targetConcept, playerContext, principles, brainData, exampleScenarios, avoidPatterns, avoidTitles, flaggedAvoidText, ageGate, ageGroup, situationHint, coachVoice, promptPatch } = plan

  // ═══════════════════════════════════════════════════════════════
  // TIER 1: IDENTITY & CONSTRAINTS (non-negotiable rules)
  // ═══════════════════════════════════════════════════════════════
  const tier1 = `POSITION: ${position}
DIFFICULTY: ${difficulty} (${difficulty === 1 ? "Rookie — ages 6-10, basic concepts, simple language" : difficulty === 2 ? "Pro — ages 11-14, intermediate strategy, proper baseball terms" : "All-Star — ages 15-18, advanced analytics-informed decisions"})
TEACHING GOAL: ${teachingGoal} the concept "${targetConcept}"
${teachingGoal === "introduce" ? "This player has NEVER seen this concept. Build the scenario so the correct answer is intuitive if they think carefully. Make the wrong options represent common beginner mistakes." : ""}
${teachingGoal === "reinforce" ? "This player learned this concept but is forgetting it. Create a scenario where they must APPLY it in a new situation they haven't seen before." : ""}
${teachingGoal === "review" ? "This player is still learning this concept. Create a slightly harder variation to deepen understanding." : ""}
${teachingGoal === "prerequisite" ? "This player is missing a foundation concept. Teach the prerequisite before advancing." : ""}

POSITION RULES (NEVER violate these):
${principles || "Follow standard baseball rules for this position."}

${ageGate ? `AGE RESTRICTIONS (${ageGroup}): ${ageGate.forbidden ? "Do NOT use these concepts: " + ageGate.forbidden.join(", ") : ""} ${ageGate.allowed ? "Only use these concepts: " + ageGate.allowed.join(", ") : ""}` : ""}`

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: BASEBALL KNOWLEDGE (data to inform the correct answer)
  // ═══════════════════════════════════════════════════════════════
  const tier2Parts = []
  if (brainData) tier2Parts.push(brainData)
  if (situationHint) tier2Parts.push(`SUGGESTED GAME SITUATION for "${targetConcept}": ${JSON.stringify(situationHint)}`)
  const tier2 = tier2Parts.length > 0 ? `\nBASEBALL REFERENCE DATA:\n${tier2Parts.join("\n")}` : ""

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: QUALITY EXAMPLES (show what good looks like)
  // ═══════════════════════════════════════════════════════════════
  const exampleText = exampleScenarios && exampleScenarios.length > 0
    ? exampleScenarios.map((s, i) => `EXAMPLE ${i + 1}:\n${JSON.stringify(s)}`).join("\n\n")
    : ""
  const tier3 = exampleText ? `\nSTUDY THESE EXAMPLES — match this quality level:\n${exampleText}` : ""

  // ═══════════════════════════════════════════════════════════════
  // ANTI-REPETITION
  // ═══════════════════════════════════════════════════════════════
  const avoidSection = []
  if (avoidTitles?.length > 0) avoidSection.push(`Do NOT reuse these titles: ${avoidTitles.join(", ")}`)
  if (avoidPatterns?.length > 0) avoidSection.push(`Avoid these overused patterns: ${avoidPatterns.join("; ")}`)
  if (flaggedAvoidText) avoidSection.push(flaggedAvoidText)
  if (previousScenario) avoidSection.push(`The PREVIOUS scenario was about "${previousScenario.title}" (${previousScenario.concept}). Create something COMPLETELY DIFFERENT — different situation, different concept application, different game state.`)
  const avoidText = avoidSection.length > 0 ? `\nAVOID REPETITION:\n${avoidSection.join("\n")}` : ""

  // ═══════════════════════════════════════════════════════════════
  // PLAYER CONTEXT
  // ═══════════════════════════════════════════════════════════════
  const contextSection = playerContext ? `\nPLAYER CONTEXT: ${playerContext}` : ""

  // ═══════════════════════════════════════════════════════════════
  // COACH VOICE
  // ═══════════════════════════════════════════════════════════════
  const voiceSection = coachVoice?.voice ? `\nCOACH VOICE: Write explanations in this tone: "${coachVoice.voice}"` : ""

  // ═══════════════════════════════════════════════════════════════
  // PROMPT PATCH (dynamic overrides)
  // ═══════════════════════════════════════════════════════════════
  const patchSection = promptPatch ? `\nADDITIONAL INSTRUCTIONS:\n${promptPatch}` : ""

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
}

After replacing the function, verify:
1. The function signature is unchanged: buildAgentPrompt(plan, previousScenario = null)
2. The returned string ends with the JSON structure template
3. No syntax errors — check for unmatched backticks or template literals
```

---

## PROMPT 4: Concept Weighting System (Replace Random Selection)

```
I need you to replace the random concept selection in planScenario() with a weighted priority system. Currently around line 7590, 7593, 7600, and 7620, the code uses Math.floor(Math.random() * array.length) to pick concepts randomly. This means a player might get an advanced concept before learning the basics.

Read the file first, then make these changes:

CHANGE 1 — Add a concept weight function BEFORE planScenario() (insert around line 7562, right before the planScenario function):

```js
// Concept priority weights: higher = more likely to be selected
function getConceptWeight(tag, conceptData, playerMasteryData, position) {
  let weight = 10 // base weight

  const mastery = playerMasteryData.concepts?.[tag]
  const concept = conceptData || BRAIN.concepts[tag]
  if (!concept) return weight

  // Prerequisites met bonus: concepts whose prereqs are all mastered get priority
  const prereqs = concept.prereqs || []
  const allPrereqsMastered = prereqs.every(p => playerMasteryData.concepts?.[p]?.state === 'mastered')
  if (prereqs.length > 0 && allPrereqsMastered) weight += 20
  if (prereqs.length > 0 && !allPrereqsMastered) weight -= 30 // deprioritize if prereqs not met

  // Foundational concepts get boosted (concepts with no prereqs that many others depend on)
  if (prereqs.length === 0) weight += 10

  // Recently wrong: high priority to reinforce
  if (mastery?.state === 'degraded') weight += 25
  if (mastery?.state === 'learning') weight += 15

  // Never-seen concepts that are age-appropriate: moderate priority
  if (!mastery) weight += 5

  // Difficulty alignment: prefer concepts matching player's current level
  if (concept.difficulty) {
    const posStats = playerMasteryData.posStats?.[position] || {}
    const posAcc = posStats.p > 0 ? Math.round((posStats.c / posStats.p) * 100) : 50
    const playerDiff = posAcc > 75 ? 3 : posAcc > 50 ? 2 : 1
    if (concept.difficulty === playerDiff) weight += 10
    if (Math.abs(concept.difficulty - playerDiff) > 1) weight -= 15
  }

  return Math.max(1, weight) // never zero
}

function weightedRandomSelect(items, weightFn) {
  const weights = items.map(weightFn)
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  let random = Math.random() * totalWeight
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) return items[i]
  }
  return items[items.length - 1] // fallback
}
```

CHANGE 2 — Replace random selection in planScenario():

Find around line 7590 (inside the degraded.length > 0 block):
    selectedConcept = degraded[Math.floor(Math.random() * degraded.length)].tag

Replace with:
    selectedConcept = weightedRandomSelect(degraded, d => getConceptWeight(d.tag, null, playerMasteryData, position)).tag

Find around line 7593 (inside the learning.length > 0 block):
    selectedConcept = learning[Math.floor(Math.random() * learning.length)].tag

Replace with:
    selectedConcept = weightedRandomSelect(learning, l => getConceptWeight(l.tag, null, playerMasteryData, position)).tag

Find around line 7600 (inside the unseen.length > 0 block):
    selectedConcept = unseen[Math.floor(Math.random() * unseen.length)].tag

Replace with:
    selectedConcept = weightedRandomSelect(unseen, u => getConceptWeight(u.tag, null, playerMasteryData, position)).tag

Find around line 7620 (inside the age gate allowed.length > 0 block):
    selectedConcept = allowed[Math.floor(Math.random() * allowed.length)].tag

Replace with:
    selectedConcept = weightedRandomSelect(allowed, a => getConceptWeight(a.tag, null, playerMasteryData, position)).tag

After making changes, verify:
1. Search for "Math.floor(Math.random()" in planScenario — should return 0 results within that function
2. The getConceptWeight and weightedRandomSelect functions exist before planScenario
3. No syntax errors
```

---

## PROMPT 5: Enhanced Grading — Baseball Accuracy Checks

```
I need you to significantly enhance the gradeScenario() function (around line 7087) to catch baseball accuracy errors, not just structural issues. The current grader only checks surface-level things like explanation length and option overlap. It needs to catch the REAL problems: wrong baseball knowledge, position violations, and logical inconsistencies.

Read the file first, then find gradeScenario() at approximately line 7087. Replace the ENTIRE function (from "function gradeScenario(scenario, position) {" through the closing "}" before the next comment block) with this:

```js
function gradeScenario(scenario, position) {
  let score = 100
  const deductions = []

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: STRUCTURAL CHECKS (same as before but stricter)
  // ═══════════════════════════════════════════════════════════════

  // 1a. Must have all required fields
  const required = ["title","description","options","best","explanations","rates","concept","situation"]
  required.forEach(f => {
    if (!scenario[f]) { score -= 15; deductions.push(`missing_field_${f}`) }
  })
  if (score <= 40) return { score: Math.max(0, score), deductions, pass: false }

  // 1b. Options array must have exactly 4 items
  if ((scenario.options || []).length !== 4) { score -= 30; deductions.push("options_not_4") }
  if ((scenario.explanations || []).length !== 4) { score -= 20; deductions.push("explanations_not_4") }
  if ((scenario.rates || []).length !== 4) { score -= 20; deductions.push("rates_not_4") }

  // 1c. Best index valid
  if (typeof scenario.best !== "number" || scenario.best < 0 || scenario.best > 3) {
    score -= 30; deductions.push("invalid_best_index")
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: EXPLANATION QUALITY (stricter than before)
  // ═══════════════════════════════════════════════════════════════

  const expls = scenario.explanations || []
  expls.forEach((e, i) => {
    if (!e || e.length < 40) { score -= 12; deductions.push(`explanation_${i}_too_short`) }
    const sentences = (e.match(/[.!?]+/g) || []).length
    if (sentences < 2) { score -= 8; deductions.push(`explanation_${i}_few_sentences`) }
    // Check for generic explanations (no situation reference)
    if (e && !/\d/.test(e) && !/inning|out|runner|score|count|lead|trail|tied/i.test(e)) {
      score -= 5; deductions.push(`explanation_${i}_too_generic`)
    }
  })

  // 2b. Best explanation must argue FOR the best option (not against another option)
  if (scenario.best !== undefined && expls[scenario.best]) {
    const bestExpl = expls[scenario.best].toLowerCase()
    const bestOpt = (scenario.options?.[scenario.best] || "").toLowerCase()
    // Check if the explanation mentions any other option more than the best option
    const otherOpts = (scenario.options || []).filter((_, i) => i !== scenario.best).map(o => o.toLowerCase().split(/\s+/).slice(0, 3).join(" "))
    const mentionsOther = otherOpts.some(other => bestExpl.includes(other) && !bestExpl.includes(bestOpt.split(/\s+/).slice(0, 3).join(" ")))
    if (mentionsOther) { score -= 15; deductions.push("best_explanation_argues_for_wrong_option") }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: RATE-BEST ALIGNMENT (stricter)
  // ═══════════════════════════════════════════════════════════════

  if (scenario.rates && typeof scenario.best === "number") {
    const maxRate = Math.max(...scenario.rates)
    if (scenario.rates[scenario.best] !== maxRate) {
      score -= 20; deductions.push("rate_best_misalignment")
    }
    // Best rate should be >= 70
    if (scenario.rates[scenario.best] < 70) {
      score -= 10; deductions.push("best_rate_too_low")
    }
    // Rate spread: should span at least 30 points
    const range = Math.max(...scenario.rates) - Math.min(...scenario.rates)
    if (range < 30) { score -= 10; deductions.push("rates_too_narrow") }
    // Worst rate should be <= 40
    if (Math.min(...scenario.rates) > 40) {
      score -= 5; deductions.push("worst_rate_too_high")
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: OPTION QUALITY
  // ═══════════════════════════════════════════════════════════════

  const opts = (scenario.options || []).map(o => (o || "").toLowerCase().replace(/[^a-z\s]/g, ""))

  // 4a. No near-duplicates
  for (let i = 0; i < opts.length; i++) {
    for (let j = i + 1; j < opts.length; j++) {
      const words1 = new Set(opts[i].split(/\s+/).filter(w => w.length > 3))
      const words2 = new Set(opts[j].split(/\s+/).filter(w => w.length > 3))
      const shared = [...words1].filter(w => words2.has(w)).length
      const overlap = shared / Math.max(Math.min(words1.size, words2.size), 1)
      if (overlap > 0.6) { score -= 12; deductions.push(`options_${i}_${j}_too_similar`) }
    }
  }

  // 4b. No vague options
  const vaguePatterns = /^(make the (right|smart|best) (play|decision|call))|^(do (the|something) (smart|right))|^(handle it (correctly|properly))/i
  ;(scenario.options || []).forEach((o, i) => {
    if (vaguePatterns.test(o)) { score -= 10; deductions.push(`option_${i}_too_vague`) }
    if (o && o.length < 10) { score -= 5; deductions.push(`option_${i}_too_short`) }
  })

  // 4c. Options should not combine two actions
  ;(scenario.options || []).forEach((o, i) => {
    if (o && /\b(but also|and also|while also|then also)\b/i.test(o)) {
      score -= 8; deductions.push(`option_${i}_combines_actions`)
    }
  })

  // 4d. All options same decision moment (check for time-mixing)
  const preActionWords = /\b(before the pitch|in the windup|on deck|warming up)\b/i
  const postActionWords = /\b(after the (hit|catch|throw|play)|once the ball|as the ball)\b/i
  const hasPre = (scenario.options || []).some(o => preActionWords.test(o))
  const hasPost = (scenario.options || []).some(o => postActionWords.test(o))
  if (hasPre && hasPost) { score -= 15; deductions.push("options_mix_decision_moments") }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: SITUATION CONSISTENCY
  // ═══════════════════════════════════════════════════════════════

  if (scenario.situation) {
    const s = scenario.situation
    if (s.outs !== undefined && (s.outs < 0 || s.outs > 2)) { score -= 25; deductions.push("invalid_outs") }
    if (s.count && s.count !== "-" && !/^[0-3]-[0-2]$/.test(s.count)) { score -= 20; deductions.push("invalid_count") }
    // Check if runners array is valid
    if (s.runners && !Array.isArray(s.runners)) { score -= 15; deductions.push("runners_not_array") }
    if (s.runners && s.runners.some(r => ![1,2,3].includes(r))) { score -= 15; deductions.push("invalid_runner_base") }
    // Check score format
    if (s.score && (!Array.isArray(s.score) || s.score.length !== 2)) { score -= 15; deductions.push("invalid_score_format") }
  }

  // 5b. Description must match situation
  if (scenario.description && scenario.situation) {
    const desc = scenario.description.toLowerCase()
    const s = scenario.situation
    // Check trailing/leading consistency with score
    if (s.score && s.score.length === 2) {
      const [home, away] = s.score
      const isBot = s.inning && /^bot/i.test(s.inning)
      const isTop = s.inning && /^top/i.test(s.inning)
      // In Bot half, the home team is batting
      if (isBot && desc.includes("trailing") && home > away) {
        score -= 15; deductions.push("score_direction_mismatch_trailing_but_leading")
      }
      if (isBot && desc.includes("leading") && home < away) {
        score -= 15; deductions.push("score_direction_mismatch_leading_but_trailing")
      }
      if (isTop && desc.includes("trailing") && away > home) {
        score -= 15; deductions.push("score_direction_mismatch_visitor")
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: POSITION ROLE BOUNDARIES (expanded)
  // ═══════════════════════════════════════════════════════════════

  const FIELDER_POS = ["firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"]
  const optsText = (scenario.options || []).join(" ").toLowerCase()
  const descText = (scenario.description || "").toLowerCase()

  // Fielders should not be calling pitches or making lineup decisions
  if (FIELDER_POS.includes(position)) {
    if (/\bcall(ing)?\s+(a|the)?\s*(fastball|curve|slider|changeup|pitch)/i.test(optsText)) {
      score -= 20; deductions.push("role_violation: fielder calling pitches")
    }
    if (/\bintentional\s*walk/i.test(optsText) || /\bIBB\b/.test(optsText)) {
      score -= 20; deductions.push("role_violation: fielder calling IBB")
    }
  }

  // Batters should not be making defensive decisions
  if (position === "batter") {
    if (/\b(throw to|field the|tag the runner|turn the double play)/i.test(optsText)) {
      score -= 20; deductions.push("role_violation: batter making defensive play")
    }
  }

  // Baserunners should not be batting or fielding
  if (position === "baserunner") {
    if (/\b(swing|bunt|hit|throw to first|field)\b/i.test(optsText)) {
      score -= 20; deductions.push("role_violation: baserunner batting or fielding")
    }
  }

  // Pitcher should never be the cutoff man
  if (position === "pitcher") {
    if (/\b(act as|be the|become the)\s*cutoff/i.test(optsText)) {
      score -= 25; deductions.push("role_violation: pitcher as cutoff")
    }
  }

  // Catcher should not leave home plate to be cutoff
  if (position === "catcher") {
    if (/\b(run to|go to|move to)\s*(second|third|the outfield)/i.test(optsText)) {
      score -= 20; deductions.push("role_violation: catcher leaving home")
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7: CONCEPT QUALITY
  // ═══════════════════════════════════════════════════════════════

  if (!scenario.concept || scenario.concept.length < 15) {
    score -= 15; deductions.push("weak_concept")
  }
  // Concept should explain WHY, not just what
  if (scenario.concept && !/because|so that|in order to|to prevent|to maximize|to minimize|which means/i.test(scenario.concept)) {
    score -= 5; deductions.push("concept_missing_why")
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8: DESCRIPTION QUALITY
  // ═══════════════════════════════════════════════════════════════

  if (!scenario.description || scenario.description.length < 80) {
    score -= 10; deductions.push("description_too_short")
  }
  // Last sentence should set up decision moment
  if (scenario.description) {
    const lastSentence = scenario.description.split(/[.!?]\s+/).filter(Boolean).pop() || ""
    if (!/what should|what do you|how should|your move|you need to|the decision/i.test(lastSentence)) {
      score -= 5; deductions.push("description_missing_decision_prompt")
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 9: JARGON CHECK (no stats jargon in descriptions/options)
  // ═══════════════════════════════════════════════════════════════
  const jargonPattern = /\b(RE24|OBP|wOBA|xBA|BABIP|FIP|WAR|wRC\+|ISO|WHIP|ERA\+)\b/
  if (jargonPattern.test(scenario.description || "")) {
    score -= 10; deductions.push("jargon_in_description")
  }
  if ((scenario.options || []).some(o => jargonPattern.test(o))) {
    score -= 10; deductions.push("jargon_in_options")
  }

  return { score: Math.max(0, score), deductions, pass: score >= 65 }
}
```

Note: The pass threshold is now 65 (up from 60) since we have more checks.

After making changes, verify:
1. The function still returns { score, deductions, pass }
2. Search for "pass: score >= 65" — should appear in the new gradeScenario
3. The SECTION comments are present (helps with future debugging)
4. No syntax errors — watch for backtick/quote mismatches
```

---

## After All 5 Prompts Are Done

Once you've run all 5 prompts successfully, come back here and let me know. I'll give you a **Prompt 6** for testing and fine-tuning — that one will have you generate 10 test scenarios across different positions and grade them against the new system to verify everything works together.

The order matters:
1. **Prompt 1** (model + tokens + system prompt) — foundation changes
2. **Prompt 2** (full examples) — gives the AI better training signal
3. **Prompt 3** (3-tier prompt architecture) — restructures how we talk to the AI
4. **Prompt 4** (concept weighting) — fixes what we ask the AI to teach
5. **Prompt 5** (enhanced grading) — catches bad scenarios before they reach the player
