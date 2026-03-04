# AI Scenario Quality Improvement Plan

## Purpose
This document is a comprehensive, actionable plan for Claude Code to improve the AI scenario generation quality in Baseball Strategy Master. It was developed after live-testing 6 AI-generated scenarios across 5 positions (Pitcher, Catcher, Batter, Shortstop, Manager, Runner) and cross-referencing every output against the SCENARIO_BIBLE, BRAIN_KNOWLEDGE_SYSTEM, and the app's own knowledge framework.

## How to Use This Document
Feed this entire document into Claude Code as context when working on `index.jsx`. Each fix includes the exact code location, the problem, the root cause, and the specific code change needed. Work through the fixes in order — they are prioritized by impact.

---

## Quality Issues Found (Live Testing Summary)

### Issue 1: Explanation-Answer Mismatch (CRITICAL)
**Seen in:** Manager ("Steal Green Light Call"), Shortstop ("Fly Ball Priority")
**What happens:** The "BEST STRATEGY" explanation describes the reasoning for the OPPOSITE choice. Example: Best answer = "Hold the runner," but the explanation says "Perfect call — stealing with 0 outs needs about 72% success to break even, and this runner vs. poor pickoff gives you that edge. Success moves runner to scoring position without using an out." That justifies stealing, not holding.
**Root cause:** The AI model generates all 4 explanations, but doesn't consistently align explanation[best] with the actual best strategy. The prompt asks for alignment but doesn't enforce it structurally.

### Issue 2: Score Perspective Errors (CRITICAL)
**Seen in:** Pitcher, Batter, Runner
**What happens:** The scenario text says one thing about the score (e.g., "trailing 4-3") but the scoreboard displays the opposite (player's team shown as 4, opponent as 3 = leading). Also, explanations mischaracterize game context — "one-run game" when up by 2, "go-ahead run" when it's actually the tying run.
**Root cause:** The prompt has a SCORE PERSPECTIVE section explaining the HOME/AWAY convention, but it's buried at the very bottom after 80+ lines of other instructions. The AI loses track of the score=[HOME,AWAY] convention, especially when it has to reason about which team the player is on based on inning half.

### Issue 3: Contradictory Premises
**Seen in:** Catcher ("Rundown Catcher Call")
**What happens:** Scenario says "You tagged the runner but he slipped away" — if you tagged him, he's out. This is physically impossible in baseball.
**Root cause:** No premise coherence validation. The validation pipeline checks structure, rates, roles, and quality firewall rules, but never validates that the scenario premise is internally consistent or physically possible.

### Issue 4: Absurd/Impossible Options
**Seen in:** Catcher (option: "Call time" during a live rundown play), Runner (option: "Run hard halfway to second and look back at the catcher")
**What happens:** Options that no coach would ever teach and that violate basic baseball rules make it into the scenario.
**Root cause:** The prompt says "All 4 options must be actions THIS position performs" but doesn't say "all 4 options must be legitimate strategic choices that a coach might actually teach." The quality firewall checks for position violations but not for baseball absurdity.

### Issue 5: Wrong Terminology
**Seen in:** Runner ("Take a big secondary lead and go on the steal attempt" — secondary leads happen AFTER the pitch, not before a steal), Catcher ("R3 situation" — jargon not appropriate for kids)
**Root cause:** The AI model uses technical baseball terms imprecisely. No terminology validation exists. The age-adaptive prompt exists but doesn't specifically enforce plain language for younger players.

### Issue 6: Coach Says Line Wrong Perspective
**Seen in:** Manager, Runner (both showed "Data point: Double play situation — ground ball is the pitcher's best friend" — a defensive perspective shown to offensive positions)
**Root cause:** The Coach Says lines come from a pool that isn't filtered by offensive vs. defensive context. The coaching line system uses `getCoachLine()` which likely doesn't account for whether the player is batting/running vs. fielding/pitching.

### Issue 7: Options Not at Same Decision Point
**Seen in:** Shortstop ("Wave off CF but stay as backup" — combines two contradictory actions in one option)
**Root cause:** The prompt says "All 4 options must happen at the SAME decision moment" but the AI sometimes bundles two sequential actions into one option. No validation exists to detect compound options.

---

## Fix Plan (Ordered by Impact)

### FIX 1: Add Explanation-Answer Coherence Validation (CRITICAL)
**File:** `index.jsx` — after the `QUALITY_FIREWALL.validate()` call (~line 8172)
**What to add:** A post-generation validation that checks whether the best answer's explanation actually supports that answer, and whether wrong answer explanations describe why they fail.

```javascript
// EXPLANATION COHERENCE CHECK — after quality firewall, before consistency rules
// Check that the best explanation doesn't accidentally argue for a different option
const bestExpl = (scenario.explanations[scenario.best] || "").toLowerCase();
const bestOpt = (scenario.options[scenario.best] || "").toLowerCase();

// Extract key action verbs from each option
const optionActions = scenario.options.map(opt => {
  const words = opt.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
  return words.filter(w => w.length > 3);
});

// Check if best explanation contains MORE action words from a NON-best option than from the best option
const bestActionOverlap = optionActions[scenario.best].filter(w => bestExpl.includes(w)).length;
for (let i = 0; i < 4; i++) {
  if (i === scenario.best) continue;
  const otherOverlap = optionActions[i].filter(w => bestExpl.includes(w)).length;
  if (otherOverlap > bestActionOverlap + 2 && otherOverlap >= 3) {
    console.warn("[BSM] AI explanation coherence fail: best=" + scenario.best + " but explanation matches option " + i + " better (" + otherOverlap + " vs " + bestActionOverlap + " action words)");
    throw new Error("Quality firewall: best explanation argues for option " + i + " instead of option " + scenario.best);
  }
}
```

**Why this works:** The Manager scenario would have been caught — "Hold the runner" has action words {hold, runner, first, base} but the explanation contained {stealing, success, runner, scoring, position, pickoff, edge} which overlaps far more with option 4 (steal).

### FIX 2: Restructure the Prompt's Score Handling (CRITICAL)
**File:** `index.jsx` — in the prompt string construction (~line 7902-7964)
**Problem:** The SCORE PERSPECTIVE instructions are at the very bottom of a massive prompt. By the time the AI reads them, it's already decided on a score. Also, the `getRandomTemplateValues()` function generates a random score that may conflict with the scenario the AI writes.

**Change 1:** Move score perspective rules to the TOP of the prompt, right after the position line:

Replace the current prompt opening (line 7902):
```javascript
const prompt = `Create a baseball strategy scenario for position: ${position}.
THE QUESTION MUST ASK: "What should the ${position.replace(/([A-Z])/g,' $1').trim().toLowerCase()} do?" All 4 options must be physical actions or decisions that ONLY this position makes.
```

With:
```javascript
const isOffensive = ["batter","baserunner"].includes(position);
const isDefensive = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"].includes(position);
const prompt = `Create a baseball strategy scenario for position: ${position}.
THE QUESTION MUST ASK: "What should the ${position.replace(/([A-Z])/g,' $1').trim().toLowerCase()} do?" All 4 options must be physical actions or decisions that ONLY this position makes.

SCORE RULES (READ FIRST — score errors are the #1 quality issue):
- score=[HOME, AWAY]. Home team bats in "Bot" half, away team bats in "Top" half.
- ${isOffensive ? "This is an OFFENSIVE position. If the inning is 'Bot X', the player is on the HOME team (score[0]). If 'Top X', the player is on the AWAY team (score[1])." : isDefensive ? "This is a DEFENSIVE position. If the inning is 'Bot X', the player is on the AWAY team (score[1]). If 'Top X', the player is on the HOME team (score[0])." : "Manager can be either team. Pick one and be consistent."}
- If you say "trailing 4-3" the player's team score MUST be 3, opponent MUST be 4.
- If you say "up by 2" the player's team score MUST be exactly 2 more than the opponent.
- "Tying run" = the run that ties the game. "Go-ahead run" = the run that takes the lead. Do NOT confuse these.
- Double-check: read your description, find every score reference, and verify it matches the score array.
```

**Change 2:** Add a post-generation score consistency check after JSON parsing (~line 8058):

```javascript
// SCORE-DESCRIPTION CONSISTENCY CHECK
const descLower = (scenario.description || "").toLowerCase();
const [homeScore, awayScore] = scenario.situation.score || [0, 0];
const innHalf = (scenario.situation.inning || "").toLowerCase();
const isPlayerHome = (isOffensive && innHalf.startsWith("bot")) || (isDefensive && innHalf.startsWith("top"));
const playerScore = isPlayerHome ? homeScore : awayScore;
const oppScore = isPlayerHome ? awayScore : homeScore;

// Check for "trailing" / "behind" when player is actually ahead
if ((descLower.includes("trailing") || descLower.includes("behind") || descLower.includes("down by")) && playerScore > oppScore) {
  console.warn("[BSM] AI score mismatch: description says trailing but player leads " + playerScore + "-" + oppScore);
  // Auto-fix by swapping the score
  scenario.situation.score = [awayScore, homeScore];
  console.warn("[BSM] Auto-fixed score to", scenario.situation.score);
}
// Check for "leading" / "up by" when player is actually behind
if ((descLower.includes("leading") || descLower.match(/up by \d/) || descLower.match(/up \d+-\d+/)) && playerScore < oppScore) {
  console.warn("[BSM] AI score mismatch: description says leading but player trails " + playerScore + "-" + oppScore);
  scenario.situation.score = [awayScore, homeScore];
  console.warn("[BSM] Auto-fixed score to", scenario.situation.score);
}
```

### FIX 3: Add Premise Coherence Validation
**File:** `index.jsx` — new validation after role violations (~line 8131)
**What to add:** Check scenario descriptions for physically impossible baseball situations.

```javascript
// PREMISE COHERENCE — reject physically impossible scenarios
const IMPOSSIBLE_PREMISES = [
  [/tagged.*(?:but|and).*(?:slipped|got away|escaped|safe)/i, "Can't tag a runner and have them escape — if tagged, they're out"],
  [/caught.*(?:but|and).*(?:dropped|missed|safe)/i, "Contradictory: caught but dropped"],
  [/call(?:s|ed)?\s*time.*(?:during|while|in the middle of).*(?:play|rundown|throw|tag)/i, "Cannot call time during a live play"],
  [/(?:3|three)\s*outs?.*(?:still|continue|keep)\s*(?:batting|hitting|running)/i, "Three outs ends the half-inning"],
  [/(?:strike(?:out)?|struck out).*(?:reaches|safe|on base)/i, "Strikeout means batter is out (unless dropped third strike, which must be specified)"],
];
const premiseText = scenario.description + " " + scenario.options.join(" ");
const impossibleMatch = IMPOSSIBLE_PREMISES.find(([rx]) => rx.test(premiseText));
if (impossibleMatch) {
  console.warn("[BSM] AI scenario rejected: impossible premise —", impossibleMatch[1]);
  throw new Error("Quality firewall: impossible premise — " + impossibleMatch[1]);
}
```

### FIX 4: Add Option Quality Validation
**File:** `index.jsx` — new validation after premise coherence
**What to add:** Detect compound options (two actions bundled), absurd options, and terminology errors.

```javascript
// OPTION QUALITY — detect compound, absurd, or contradictory options
for (let i = 0; i < scenario.options.length; i++) {
  const opt = scenario.options[i];

  // Compound option detection: "X but Y" or "X and then Y" where X and Y contradict
  if (/\bbut\s+(stay|hold|wait|don't|keep)\b/i.test(opt) || /\band\s+then\s+(stop|hold|wait|freeze)\b/i.test(opt)) {
    console.warn("[BSM] AI option " + i + " may be compound/contradictory:", opt);
    // Soft warning, don't reject — but flag for monitoring
  }

  // Absurd options that no coach would teach
  const ABSURD_OPTIONS = [
    [/call\s*time.*(?:rundown|live|play)/i, "Cannot call time during live play"],
    [/run\s*(?:hard\s*)?halfway.*(?:stop|look|pause)/i, "Running halfway creates a rundown — terrible baserunning"],
    [/yell\s*at\s*(?:the\s*)?(?:pitcher|catcher|umpire)/i, "Yelling at teammates is not a strategic option"],
    [/do\s*nothing/i, "Do nothing is not a strategic baseball decision"],
    [/(?:give|throw)\s*up/i, "Giving up is not a strategic option"],
  ];
  const absurdMatch = ABSURD_OPTIONS.find(([rx]) => rx.test(opt));
  if (absurdMatch) {
    console.warn("[BSM] AI option " + i + " is absurd:", absurdMatch[1], "—", opt);
    throw new Error("Quality firewall: absurd option " + i + " — " + absurdMatch[1]);
  }
}

// TERMINOLOGY CHECK for baserunner scenarios
if (position === "baserunner") {
  const allOptText = scenario.options.join(" ");
  if (/secondary\s*lead.*steal/i.test(allOptText) || /steal.*secondary\s*lead/i.test(allOptText)) {
    console.warn("[BSM] AI terminology error: secondary leads happen AFTER the pitch, not before a steal attempt");
    // Auto-fix: replace "secondary lead" with "aggressive lead" in the option text
    scenario.options = scenario.options.map(o => o.replace(/secondary\s*lead/gi, "aggressive lead"));
    console.warn("[BSM] Auto-fixed: 'secondary lead' -> 'aggressive lead'");
  }
}
```

### FIX 5: Improve the Prompt's Explanation Instructions
**File:** `index.jsx` — in the prompt string (~line 7951)
**Problem:** The current explanation instruction says "BEST explanation: state WHY this is correct" but doesn't explicitly require the explanation to reference the chosen action.

Replace the current explanation instruction (around line 7951):
```
Each explanation must be 2-4 sentences. BEST explanation: state WHY this is correct + WHAT HAPPENS as a result + reference the specific game situation. WRONG explanations: state WHY this fails in THIS specific situation.
```

With:
```
EXPLANATION RULES (these are the most important part of the scenario — players learn from explanations):
- Each explanation must be 2-4 sentences.
- BEST explanation: Start by naming the action ("Holding the runner is smart because..."). Then state WHY this is correct in THIS game situation (reference score, inning, outs, runners). Then state WHAT HAPPENS as a positive result.
- WRONG explanations: Start by naming the action ("Stealing here is risky because..."). Then state WHY this specific action fails in THIS specific situation. Reference concrete consequences.
- CRITICAL: The best explanation MUST argue FOR the best option's action. It must NOT describe why another option is good. Read your best explanation and ask: "Does this paragraph argue for option[best]?" If not, rewrite it.
- Use the player's team perspective: "your team", "you", "your runner" — not "the offense" or "the batting team."
- Do NOT use jargon like "R3", "RE24", "OBP", "wOBA" in descriptions or options. Save stats for explDepth.data only.
- Use simple language a 10-year-old could understand for descriptions and options. Save complex analysis for explDepth.why.
```

### FIX 6: Fix Coach Says Line Context Filtering
**File:** `index.jsx` — in the `getCoachLine()` function (search for `getCoachLine` or `COACH_SAYS`)
**Problem:** The same coaching line ("Double play situation — ground ball is the pitcher's best friend") appears for offensive positions like Runner and Manager, where it makes no sense.

Find the coach line selection logic and add context filtering:
```javascript
// When selecting a coach line, filter by offensive/defensive context
const isOffensivePosition = ["batter", "baserunner", "manager"].includes(position);
const isDefensivePosition = ["pitcher", "catcher", "firstBase", "secondBase", "shortstop", "thirdBase", "leftField", "centerField", "rightField"].includes(position);

// Tag coach lines with context and only show relevant ones
// If the current position is offensive, skip coach lines that are from a defensive perspective
// If defensive, skip offensive-perspective lines
```

The coach line pool should be tagged or filtered. If the lines come from the BRAIN constant's coaching data, add a `perspective` field ("offense", "defense", "universal") to each line and filter accordingly.

### FIX 7: Add Few-Shot Examples That Demonstrate Common Mistakes
**File:** `index.jsx` — in the `getAIFewShot()` function
**Problem:** The AI sees one "good" example but doesn't see examples of what NOT to do. Adding negative examples dramatically improves output quality for LLMs.

After the existing few-shot example in the prompt, add:
```
COMMON AI MISTAKES (do NOT make these):
❌ WRONG: Best answer is "Hold the runner" but explanation says "Stealing gives you the edge" — explanation must match the answer.
❌ WRONG: Score is 4-2 but explanation says "one-run game" — count the runs correctly.
❌ WRONG: Description says "trailing 4-3" but score=[4,3] with player as home team — that means LEADING, not trailing.
❌ WRONG: Option says "Call time" during a live rundown — you CANNOT call time during active play.
❌ WRONG: Option says "Run halfway to second and look back" — this creates a rundown and is terrible baserunning.
❌ WRONG: Combining two actions: "Wave off the CF but stay as backup" — pick ONE action per option.
```

### FIX 8: Improve the Retry Logic for Quality Failures
**File:** `index.jsx` — in the retry logic after `generateAIScenario()` call (~line 9567 in `doAI`)
**Problem:** Quality firewall and consistency violations are NOT retried (only `parse`, `role-violation`, `rate-mismatch` get retried). When the AI generates a scenario that fails premise coherence or explanation coherence, the user just gets a fallback to handcrafted — wasting the API call.

Find the retry condition and expand it:
```javascript
// OLD: Only retry on parse/role/rate errors
if (!result?.scenario && (result?.error === "parse" || result?.error === "role-violation" || result?.error === "rate-mismatch")) {

// NEW: Retry on ALL quality failures (with shared timeout budget)
const RETRYABLE_ERRORS = ["parse", "role-violation", "rate-mismatch", "quality-firewall", "consistency-violation", "premise-violation"];
if (!result?.scenario && RETRYABLE_ERRORS.includes(result?.error)) {
```

Also implement a shared timeout budget so retries don't double the wait time:
```javascript
const AI_BUDGET_MS = 30000; // 30s total for all attempts
const aiStartTime = Date.now();

result = await generateAIScenario(p, stats, ...);

if (!result?.scenario && RETRYABLE_ERRORS.includes(result?.error)) {
  const elapsed = Date.now() - aiStartTime;
  const remaining = AI_BUDGET_MS - elapsed;
  if (remaining > 8000) { // Only retry if >8s remains
    console.log("[BSM] Retrying AI generation (" + remaining + "ms remaining), error was:", result.error);
    result = await generateAIScenario(p, stats, ...);
  }
}
```

### FIX 9: Add Post-Generation Explanation Quality Scoring
**File:** `index.jsx` — new function, called after all validations pass
**Purpose:** Score each explanation on a 0-10 scale. If the average is below 5, reject and retry.

```javascript
function scoreExplanationQuality(scenario) {
  let totalScore = 0;
  const issues = [];

  for (let i = 0; i < 4; i++) {
    let score = 10;
    const expl = scenario.explanations[i] || "";
    const opt = scenario.options[i] || "";

    // Penalty: Too short (less than 2 sentences)
    const sentences = expl.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length < 2) { score -= 3; issues.push("Option " + i + ": explanation too short (" + sentences.length + " sentences)"); }

    // Penalty: No reference to game situation
    const situationWords = ["inning", "out", "score", "runner", "count", "base", "lead", "trailing", "tied"];
    const hasSituationRef = situationWords.some(w => expl.toLowerCase().includes(w));
    if (!hasSituationRef) { score -= 2; issues.push("Option " + i + ": no game situation reference"); }

    // Penalty: Generic language
    const genericPhrases = ["good choice", "bad idea", "smart play", "not ideal", "better option", "this is wrong", "this is right"];
    if (genericPhrases.some(p => expl.toLowerCase().includes(p))) { score -= 2; issues.push("Option " + i + ": generic language"); }

    // Penalty: Doesn't name the action from the option
    const optWords = opt.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const optMentioned = optWords.filter(w => expl.toLowerCase().includes(w)).length;
    if (optMentioned < 1) { score -= 2; issues.push("Option " + i + ": explanation doesn't reference the option's action"); }

    totalScore += Math.max(0, score);
  }

  const avgScore = totalScore / 4;
  if (avgScore < 5) {
    console.warn("[BSM] AI explanation quality too low:", avgScore.toFixed(1) + "/10", issues.join("; "));
    return { pass: false, score: avgScore, issues };
  }
  return { pass: true, score: avgScore, issues };
}
```

Call this after all other validations pass:
```javascript
const explQuality = scoreExplanationQuality(scenario);
if (!explQuality.pass) {
  throw new Error("Quality firewall: low explanation quality (" + explQuality.score.toFixed(1) + "/10) — " + explQuality.issues.slice(0, 3).join("; "));
}
```

### FIX 10: Reduce Prompt Length by Moving Static Content to System Message
**File:** `index.jsx` — in the `generateAIScenario()` function (~line 7984)
**Problem:** The user prompt is extremely long (easily 2000+ tokens). LLMs follow instructions better when critical rules are in the system message and the user message contains only the dynamic scenario-specific content.

Move these to the system message (currently at line 7985):
- Position action boundaries
- Common mistakes to avoid
- Explanation rules
- Analytics rules
- The negative examples from Fix 7

Keep these in the user message:
- Position name
- Player stats/personalization
- Knowledge maps
- Score rules (since they're situation-specific)
- Template values
- Few-shot example

This reduces the user prompt by ~40% and puts the "rules" where LLMs are most likely to follow them.

---

## Implementation Order

1. **Fix 2** (Score handling) — Most visible bug, affects every scenario
2. **Fix 1** (Explanation coherence) — Catches the worst quality issue
3. **Fix 5** (Prompt explanation instructions) — Prevents issues at generation time
4. **Fix 7** (Negative examples in prompt) — Prevents common AI mistakes
5. **Fix 3** (Premise coherence) — Catches impossible scenarios
6. **Fix 4** (Option quality) — Catches absurd options and bad terminology
7. **Fix 8** (Retry logic) — Makes quality fixes effective by retrying failures
8. **Fix 9** (Explanation quality scoring) — Catches remaining low-quality explanations
9. **Fix 6** (Coach line filtering) — Fixes wrong-perspective coaching lines
10. **Fix 10** (Prompt restructuring) — Long-term quality and speed improvement

## Testing Checklist

After implementing each fix, test by:
1. Open https://bsm-app.pages.dev/preview (or local preview)
2. Ensure Pro access is active
3. Scroll to AI Coach's Challenge section
4. Click each position button and verify:
   - [ ] Score in description matches scoreboard display
   - [ ] "Trailing"/"leading" matches the actual score
   - [ ] Best explanation argues FOR the best answer (not another option)
   - [ ] All 4 options are legitimate baseball actions
   - [ ] No option combines two contradictory actions
   - [ ] Language is age-appropriate (no jargon like "R3", "RE24" in descriptions)
   - [ ] Coach Says line makes sense for the position's perspective
   - [ ] Scenario premise is physically possible in baseball
5. Check browser console for `[BSM]` logs — look for auto-fixes and warnings

## Summary of Root Causes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Explanation argues for wrong answer | No coherence validation | Fix 1 |
| Score mismatches (text vs. scoreboard) | Score rules buried at bottom of prompt | Fix 2 |
| Impossible premises | No premise validation | Fix 3 |
| Absurd options | No option quality check | Fix 4 |
| Generic/vague explanations | Weak prompt instructions | Fix 5 |
| Wrong-perspective coach lines | No offensive/defensive filtering | Fix 6 |
| AI repeats same mistake patterns | No negative examples in prompt | Fix 7 |
| Quality failures waste API calls | Narrow retry logic | Fix 8 |
| Inconsistent explanation quality | No quality scoring | Fix 9 |
| Prompt too long, rules ignored | Rules in user message not system | Fix 10 |
