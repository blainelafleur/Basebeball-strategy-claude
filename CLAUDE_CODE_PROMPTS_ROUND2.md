# Claude Code Prompts — Round 2 (Post-Testing Fixes)

Based on live testing, we found two issues: 504 gateway timeouts from the reasoning model being slower, and the agent pipeline failing grading too often. These two prompts fix both.

---

## PROMPT 6: Fix Timeout Issue (Worker + Client)

```
The AI model switch from "grok-4-1-fast-non-reasoning" to "grok-3-mini" is producing much better scenarios, but the reasoning model takes longer to respond. We're hitting 504 Gateway Timeout errors because the Cloudflare Worker has a 30-second timeout and responses regularly take 22-30 seconds.

I need you to increase timeouts in TWO files:

FILE 1: worker/index.js

Find around line 1277:
  const timeout = setTimeout(() => controller.abort(), 30000);

Replace with:
  const timeout = setTimeout(() => controller.abort(), 60000);

Find around line 1310:
  console.error("[BSM Worker] xAI timeout after 30s");

Replace with:
  console.error("[BSM Worker] xAI timeout after 60s");

Find around line 1311:
  return jsonResponse({ error: { message: "xAI API timeout (30s)", type: "timeout" } }, 504, cors);

Replace with:
  return jsonResponse({ error: { message: "xAI API timeout (60s)", type: "timeout" } }, 504, cors);

FILE 2: index.jsx

Find the client-side timeout (around line 8521):
  new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 35000))

Replace with:
  new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 65000))

Also search the ENTIRE file for any other timeout values related to AI fetch calls. Look for patterns like:
  setTimeout(() => reject(new Error("Timeout")), XXXXX)
or:
  setTimeout(() => rej(new Error("...timeout...")), XXXXX)

The ones related to AI generation (in generateAIScenario and generateWithAgentPipeline) should be increased to 65000. Do NOT change these other timeouts that should stay as-is:
- "pattern-timeout" (3000ms) — this is for pattern fetching, not AI generation
- "patch-timeout" (2000ms) — this is for prompt patch fetching, not AI generation
- "audit-timeout" (5000ms) — this is for the quick self-audit, keep it short
- ANALYTICS_BATCH_INTERVAL (30000) — not related to AI
- Any timeout under 10000ms that's not an AI fetch timeout

After changes, verify:
1. In worker/index.js: search for "30000" — should return 0 results related to AI timeout
2. In worker/index.js: search for "60000" — should appear once (the AI timeout)
3. In index.jsx: search for "35000" — should return 0 results for AI timeouts
4. In index.jsx: search for "65000" — should appear in the AI fetch timeout(s)
5. Confirm "pattern-timeout" is still 3000, "patch-timeout" still 2000, "audit-timeout" still 5000

IMPORTANT: After changing worker/index.js, remind me to redeploy the worker with: cd worker && npx wrangler deploy
```

---

## PROMPT 7: Fix Agent Pipeline Grading Failures

```
The agent pipeline (generateWithAgentPipeline) is producing scenarios that fail grading with scores of 38-53, causing constant fallbacks to the standard pipeline. The issue is that the agent pipeline's system prompt (around line 7875) is still the old bare-bones version that wasn't updated with our new quality standards.

Read index.jsx and find the agent pipeline's system prompt. It's in generateWithAgentPipeline(), inside the fetch call's messages array. Around line 7875, it should look something like:

{ role: "system", content: "You are an expert baseball coach creating personalized training scenarios. Respond with ONLY valid JSON — no markdown, no code fences." }

Replace that system message content with a version that matches the quality of our main pipeline system prompt. Replace the content string with:

"You are the smartest, most experienced baseball coach in the world. You have coached at every level from tee-ball to MLB. You create training scenarios for Baseball Strategy Master, a strategy-teaching app for kids 6-18. Respond with ONLY valid JSON — no markdown, no code fences.\n\nGOLDEN RULE: Every scenario teaches ONE baseball concept. The concept drives the situation, options, correct answer, and all explanations.\n\nEXPLANATION RULES:\n- Each explanation: 2-4 sentences.\n- BEST explanation: Name the action, state WHY correct in this game situation (reference score/inning/outs/runners/count), state the positive result.\n- WRONG explanations: Name the action, state WHY it fails with concrete consequences.\n- Use player perspective: \"you\", \"your team\" — never \"the offense\".\n- Every explanation must reference the SPECIFIC game situation.\n\nOPTION RULES:\n- All 4 options at the SAME decision moment.\n- Each option is a specific, concrete action.\n- Options must be strategically distinct — not 4 variations of the same action.\n- Include at least one common mistake a young player would actually make.\n- No near-duplicates.\n\nSITUATION RULES:\n- outs: 0-2 only. count: valid B-S format. runners: array of [1,2,3]. score: [HOME,AWAY].\n- Last sentence of description sets up the decision moment.\n\nPOSITION BOUNDARIES: Only include actions the selected position actually performs."

Also check: does the agent pipeline have its own grading function (gradeAgentScenario)? If so, make sure it calls the same gradeScenario() function we upgraded in Prompt 5, not a separate simpler version. Search for "gradeAgentScenario" and verify it delegates to gradeScenario(). If it has its own logic, replace it with a call to gradeScenario().

After changes, verify:
1. The agent pipeline system prompt contains "GOLDEN RULE"
2. The agent pipeline system prompt contains "OPTION RULES" and "POSITION BOUNDARIES"
3. gradeAgentScenario uses the same gradeScenario() function (not a duplicate grader)
```

---

## After Both Prompts

After running Prompt 6, you MUST redeploy the worker:
```
cd worker && npx wrangler deploy
```

Then test again. You should see:
- No more 504 timeouts (the 60s worker timeout gives grok-3-mini plenty of room)
- Agent pipeline scenarios passing grading more often (better system prompt)
- Quality scores staying in the 8-10 range
