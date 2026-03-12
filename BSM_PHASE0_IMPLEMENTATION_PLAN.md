# BSM Phase 0: Immediate Quality Jump — Full Implementation Plan
## Following Grok's Roadmap Verbatim

**Goal:** 2–3× better AI scenario generations by implementing all four Phase 0 recommendations exactly as Grok specified.

**Timeline:** 1–2 weeks
**Budget:** $300–$800 (Grok's estimate; we're not worried about cost)

---

## The Four Deliverables (Grok's Exact Words)

| # | Grok Said | What It Means Technically |
|---|-----------|--------------------------|
| 1 | "Switch primary model" to Claude 4 Opus | Replace xAI Grok-4 calls with Anthropic Claude Opus 4 via the Cloudflare Worker proxy |
| 2 | "True multi-agent pipeline" — Planner (300 tokens), Generator (only relevant maps via RAG), Critic (full 21-item checklist + new educational rubric), Rewriter if score < 9.5 | Server-side 4-stage pipeline in `worker/index.js` — one client request triggers all 4 stages internally |
| 3 | "Add lightweight RAG (Cloudflare Vectorize)" — embed SCENARIO_BIBLE + 584 scenarios + maps, retrieve top-3 only | Create a Vectorize index, embed all knowledge, and query it at generation time instead of injecting everything |
| 4 | "New critic rubric" — Score 1-10 on factual accuracy, explanation strength, age-appropriateness, educational value, variety | Built into the Critic stage of the multi-agent pipeline |

---

## Architecture Overview

```
CURRENT FLOW:
  Client (index.jsx) ──→ Worker ──→ xAI Grok-4 ──→ Worker ──→ Client
  (massive prompt)       (proxy)    (slow, timeout-prone)

NEW FLOW (Phase 0):
  Client (index.jsx) ──→ Worker /v1/multi-agent ──→ [Server-Side Pipeline]
                                                     │
                                                     ├─ Stage 1: PLANNER
                                                     │   └─ Claude Opus (300 tokens)
                                                     │
                                                     ├─ Stage 2: GENERATOR
                                                     │   ├─ Query Vectorize for top-3 relevant scenarios + maps
                                                     │   └─ Claude Opus (focused prompt, only RAG-retrieved context)
                                                     │
                                                     ├─ Stage 3: CRITIC
                                                     │   └─ Claude Opus (21-item checklist + 5-dimension rubric)
                                                     │
                                                     └─ Stage 4: REWRITER (if critic score < 9.5/10)
                                                         └─ Claude Opus (fix identified issues)
                                                     │
                                                     ──→ Client receives final scenario
```

The existing xAI proxy route (`/v1/chat/completions`) stays untouched as a fallback.

---

## Implementation Sequence (6 Prompts for Windsurf)

### Prompt 1 of 6: Set Up Cloudflare Vectorize Index

**What:** Create a Vectorize index and populate it with all BSM knowledge.

**Context for Windsurf:**

```
TASK: Set up Cloudflare Vectorize for the BSM AI system.

STEP 1 — Create the Vectorize index via Wrangler CLI:

  npx wrangler vectorize create bsm-knowledge --dimensions 1024 --metric cosine

STEP 2 — Add the Vectorize binding to worker/wrangler.toml:

  [[vectorize]]
  binding = "VECTORIZE"
  index_name = "bsm-knowledge"

STEP 3 — Add the Workers AI binding (for embeddings) to worker/wrangler.toml:

  [ai]
  binding = "AI"

STEP 4 — Create a new file: worker/scripts/embed-knowledge.js

This script will:
1. Read all 584 handcrafted scenarios from index.jsx (extract the SCENARIOS constant)
2. Read the full SCENARIO_BIBLE.md content
3. Read all 21 knowledge maps from index.jsx (extract KNOWLEDGE_MAPS constant)
4. Read all POS_PRINCIPLES from index.jsx
5. Read all BRAIN constant data from index.jsx

For each piece of content, create a vector entry with:
- id: unique identifier (e.g., "scenario_pitcher_p1", "map_CUTOFF_RELAY_MAP", "principle_pitcher", "bible_section_3")
- text: the content to embed (scenario description + options + explanations, or map text, or principle text)
- metadata: { type: "scenario"|"map"|"principle"|"bible"|"brain", position: "pitcher"|etc, concept: "cutoff-relay"|etc, difficulty: 1|2|3 }

Chunk long documents (SCENARIO_BIBLE) into ~500-token sections with overlap.

Use Workers AI for embeddings:
  const embeddings = await env.AI.run("@cf/baai/bge-large-en-v1.5", { text: [chunk1, chunk2, ...] })

Then insert into Vectorize:
  await env.VECTORIZE.upsert(vectors)

STEP 5 — Add a worker route POST /admin/embed-knowledge that runs this embedding pipeline. 
Protect it with the existing ADMIN_KEY header check pattern used by /admin/batch-generate.

STEP 6 — Add a worker route GET /vectorize/query that:
- Accepts: { query: "string", position: "string", topK: 3, filter: { type: "scenario"|"map"|etc } }
- Embeds the query using Workers AI
- Queries Vectorize with the embedding + metadata filter
- Returns the top-K matches with their text and metadata

Deploy: cd worker && npx wrangler deploy

After deploying, run the embedding pipeline once:
  curl -X POST https://bsm-ai-proxy.blafleur.workers.dev/admin/embed-knowledge \
    -H "X-Admin-Key: YOUR_ADMIN_KEY" \
    -H "Content-Type: application/json"
```

---

### Prompt 2 of 6: Build the Knowledge Embedding Script

**What:** The actual script that extracts knowledge from index.jsx and embeds it.

**Context for Windsurf:**

```
TASK: Create worker/scripts/embed-knowledge.js — the script that extracts all BSM
knowledge and embeds it into Cloudflare Vectorize.

This script needs to be callable from a Worker route (not a standalone Node script)
because it needs access to env.AI (Workers AI for embeddings) and env.VECTORIZE.

Create an exported function: async function embedAllKnowledge(env)

SECTION 1 — SCENARIO EMBEDDING
For each of the 584 scenarios across all 15 position categories:
- Combine into a single text: "${scenario.title}. ${scenario.description} Options: ${scenario.options.join(' | ')}. Best: ${scenario.options[scenario.best]}. Concept: ${scenario.concept}"
- Metadata: { type: "scenario", position: positionKey, concept: scenario.conceptTag || scenario.concept, difficulty: scenario.diff, id: scenario.id }
- These must be embedded from the actual SCENARIOS constant in index.jsx.

Since this Worker route can't import index.jsx directly, we have two options:
OPTION A (recommended): Export the scenarios as a JSON file that the Worker can import.
  - Create a build step: node scripts/extract-scenarios.js > worker/data/scenarios.json
  - The Worker imports this JSON
OPTION B: Hardcode a fetch to the deployed app and parse scenarios from the HTML/JS.

Go with Option A. Create TWO files:
1. scripts/extract-scenarios.js — Node script that reads index.jsx, extracts SCENARIOS, 
   KNOWLEDGE_MAPS, POS_PRINCIPLES, and BRAIN data, writes to worker/data/knowledge.json
2. worker/scripts/embed-knowledge.js — Worker function that reads knowledge.json and embeds it

SECTION 2 — KNOWLEDGE MAP EMBEDDING
For each of the 21 knowledge maps:
- Text: the full map content string
- Metadata: { type: "map", name: "CUTOFF_RELAY_MAP"|etc, positions: [...relevant positions] }

SECTION 3 — POSITION PRINCIPLES EMBEDDING
For each of the 15 positions:
- Text: the full POS_PRINCIPLES string for that position
- Metadata: { type: "principle", position: positionKey }

SECTION 4 — SCENARIO BIBLE EMBEDDING
Chunk SCENARIO_BIBLE.md into ~500-token sections:
- Split on "## " headers (section boundaries)
- Each chunk gets metadata: { type: "bible", section: "Section 3: Position Principles"|etc }

SECTION 5 — BRAIN DATA EMBEDDING
For each BRAIN.stats entry (RE24, countData, stealBreakEven):
- Text: JSON stringified with a natural language description prefix
  e.g., "Run Expectancy with runners on 1st and 2nd, 1 out: 0.96 expected runs"
- Metadata: { type: "brain", dataType: "RE24"|"countData"|"stealBreakEven" }

EMBEDDING BATCH SIZE: Workers AI supports batching up to 100 texts per call.
Process in batches of 50 to stay safe.

VECTORIZE UPSERT: Batch upsert up to 100 vectors per call.

Return a summary: { totalEmbedded: N, byType: { scenario: N, map: N, principle: N, bible: N, brain: N }, elapsed: Nms }
```

---

### Prompt 3 of 6: Build the Multi-Agent Pipeline Handler (Claude Opus + RAG)

**What:** The server-side handleMultiAgent function with all 4 stages using Claude Opus and Vectorize RAG.

**Context for Windsurf:**

```
TASK: Add a multi-agent pipeline route to worker/index.js that uses Claude Opus 
and Cloudflare Vectorize RAG. This implements Grok's Phase 0 exactly.

PREREQUISITES: Prompt 1 (Vectorize setup) and Prompt 2 (knowledge embedding) are complete.
The Worker has env.VECTORIZE, env.AI, and env.ANTHROPIC_API_KEY configured.

ADD THESE CONSTANTS near the top of worker/index.js:

const ANTHROPIC_MODEL = "claude-opus-4-20250514";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MULTI_AGENT_TIMEOUT = 120000;
const STAGE_TIMEOUT = 50000;

ADD A HELPER: async function callClaude(system, userMessage, env, maxTokens, timeoutMs)
- POST to ANTHROPIC_API_URL with:
  - Headers: Content-Type, x-api-key (env.ANTHROPIC_API_KEY), anthropic-version: "2023-06-01"
  - Body: { model: ANTHROPIC_MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: userMessage }] }
- AbortController with timeoutMs
- Return { text, usage, elapsed }

ADD A HELPER: async function queryVectorize(env, queryText, position, topK = 3, typeFilter = null)
- Embed queryText using env.AI.run("@cf/baai/bge-large-en-v1.5", { text: [queryText] })
- Query env.VECTORIZE.query(embedding, { topK, filter: { position, ...(typeFilter ? { type: typeFilter } : {}) }, returnMetadata: true })
- Return array of { text, metadata, score }

ADD ROUTE: POST /v1/multi-agent → handleMultiAgent(request, env, cors)

Request body:
{
  position: "pitcher"|"catcher"|etc (REQUIRED),
  playerContext: "string describing player state" (optional),
  positionRules: "POS_PRINCIPLES text" (optional — will be RAG'd if not provided),
  targetConcept: "specific concept to target" (optional),
  maxRetries: 1 (optional, default 1)
}

THE 4 STAGES:

--- STAGE 1: PLANNER (Claude Opus, max 400 output tokens) ---
System prompt: You are a baseball strategy scenario planner for ages 6-18.
[Include full planner system prompt — see below]

Before calling Claude, query Vectorize:
  const planContext = await queryVectorize(env, `${position} ${playerContext || ""} baseball strategy scenario`, position, 3, "scenario")
Inject the top-3 scenario summaries into the user message as "SIMILAR EXISTING SCENARIOS (avoid duplicating these):"

Planner output (JSON): { teachingGoal, targetConcept, difficulty, gameState: { inning, outs, runners, score, count }, scenarioFocus, keyDistractors, dataToReference }

Validate: teachingGoal must be "introduce"|"reinforce"|"assess". gameState must be present. Score must be [number, number].

--- STAGE 2: GENERATOR (Claude Opus, max 1500 output tokens) ---
Before calling Claude, query Vectorize for:
1. Relevant knowledge maps: queryVectorize(env, plan.targetConcept + " " + position, position, 3, "map")
2. Relevant principles: queryVectorize(env, position + " defensive responsibilities positioning", position, 2, "principle") 
3. Relevant BRAIN data: queryVectorize(env, plan.dataToReference || plan.targetConcept, null, 2, "brain")
4. Example scenarios for style: queryVectorize(env, plan.scenarioFocus, position, 2, "scenario")

Inject ALL retrieved context into the generator prompt under labeled sections:
  RELEVANT KNOWLEDGE MAPS: [top-3 map texts]
  POSITION PRINCIPLES: [top-2 principle texts]
  STATISTICAL REFERENCE: [top-2 brain data texts]
  EXAMPLE SCENARIOS (match this quality): [top-2 scenario summaries]

System prompt: You are a baseball strategy scenario writer for Baseball Strategy Master.
[Include full generator system prompt with all rules — score perspective, position boundaries, explanation coherence, age-appropriate language, rate distribution, JSON schema]

Generator output (JSON): Full scenario object matching the index.jsx schema.

Validate structure: title, description, options[4], best (0-3), explanations[4], rates[4], situation object, concept, conceptTag, diff.

--- STAGE 3: CRITIC (Claude Opus, max 600 output tokens) ---
This is the 21-item checklist + 5-dimension rubric that Grok specified.

System prompt: You are a quality auditor for Baseball Strategy Master.

THE 21-ITEM CHECKLIST (from SCENARIO_BIBLE quality checklist + Grok's additions):
1. Does the scenario have exactly 4 options?
2. Is the best answer index valid (0-3)?
3. Does each explanation specifically discuss THAT option?
4. Does the best explanation argue FOR the correct choice (not just against others)?
5. Is the score perspective correct? (Bot inning = HOME bats = score[0])
6. Is the game situation physically possible?
7. Does the pitcher NEVER act as cutoff man?
8. Does the catcher NEVER leave home plate unguarded?
9. Do outfielders throw TO the relay man (not relay themselves)?
10. Are cutoff/relay assignments correct per standard baseball?
11. Is the difficulty tag appropriate for the vocabulary used?
12. Are all rates ordered correctly (best option has highest rate)?
13. Do rates sum to approximately 165-195?
14. Is there at least one "tempting wrong answer" (rate 40-65)?
15. Does the description set the scene with enough game context?
16. Is the concept tag specific (not generic like "defense")?
17. Is the coach line teaching something or genuinely encouraging (not filler)?
18. Does explDepth.data reference real statistics or rules?
19. Are all four options strategically distinct (not just "throw to different bases")?
20. Is the language age-appropriate for the stated difficulty/ageMin?
21. Would a real youth baseball coach agree with the correct answer?

THE 5-DIMENSION RUBRIC (Grok's exact specification):
- Factual Accuracy: 1-10
- Explanation Strength: 1-10
- Age-Appropriateness: 1-10
- Educational Value: 1-10
- Variety/Distinctness: 1-10

Critic output (JSON):
{
  "checklist": { "item_1": true|false, ..., "item_21": true|false },
  "checklistFailures": ["item_5: Score perspective is wrong — Bot 3rd but offensive team uses score[1]"],
  "rubric": {
    "factualAccuracy": 1-10,
    "explanationStrength": 1-10,
    "ageAppropriateness": 1-10,
    "educationalValue": 1-10,
    "varietyDistinctness": 1-10
  },
  "overallScore": 1-10 (weighted: factualAccuracy 2x, explanationStrength 2x, others 1x),
  "pass": true if overallScore >= 9.5 AND zero checklist failures,
  "issues": ["specific issue 1", "specific issue 2"],
  "suggestions": ["how to fix 1"]
}

NOTE: Grok said "Rewriter if score < 9.5" — so the pass threshold is 9.5/10, which is extremely high. This means most scenarios will get rewritten at least once. That's intentional — we want the best quality possible and we're not worried about cost.

--- STAGE 4: REWRITER (Claude Opus, max 1500 output tokens, ONLY if critic score < 9.5) ---
System prompt: You are a scenario editor. Fix ONLY the identified issues.

Input: original scenario + critic output (checklist failures + rubric scores + issues + suggestions)
Also re-inject the RAG context from Stage 2 so the rewriter has full knowledge.

Output: corrected scenario JSON.

After rewriting, run the Critic AGAIN (Stage 3 re-run) on the rewritten version.
If still < 9.5 after maxRetries rewrites, serve the best version (highest score).

--- METADATA STAMPING ---
On the final scenario:
  scenario.id = `ma_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  scenario.isAI = true
  scenario.cat = "ai-generated"
  scenario.scenarioSource = "multi-agent-opus"
  scenario.agentGrade = overallScore * 10  (scale to 0-100)
  scenario.agentPlan = { goal, concept, difficulty }
  scenario.pipelineStats = { totalElapsed, stages, totalInputTokens, totalOutputTokens, critiquePass, critiqueScore, ragHits }

--- RESPONSE FORMAT ---
{
  scenario: { ... },
  critique: { score, pass, rubric, checklistFailures, issues },
  pipeline: { model: "claude-opus-4-20250514", totalElapsed, stages: [...], totalInputTokens, totalOutputTokens, ragHits: N }
}

Headers: X-Pipeline-Elapsed, X-Pipeline-Stages, X-Pipeline-Model, X-Pipeline-RAG-Hits

REGISTER THE ROUTE in the fetch() dispatcher:
  if (path === "/v1/multi-agent" && request.method === "POST") return await handleMultiAgent(request, env, cors);
(Add BEFORE the handleAIProxy fallback)
```

---

### Prompt 4 of 6: Client-Side Integration (index.jsx)

**What:** Wire index.jsx to call the multi-agent pipeline.

**Context for Windsurf:**

```
TASK: Add client-side support for the multi-agent pipeline in index.jsx.

STEP 1 — Add the caller function near generateWithAgentPipeline:

async function generateWithMultiAgent(position, stats, signal, targetConcept = null) {
  const t0 = Date.now()
  
  // Build player context from stats
  const ps = stats?.ps?.[position]
  const accuracy = ps && ps.p > 0 ? Math.round(ps.c / ps.p * 100) : null
  const recentWrong = (stats?.recentWrong || []).slice(0, 5)
  const conceptMastery = stats?.conceptMastery || {}
  
  // Build rich player context string
  let playerContext = ""
  if (accuracy !== null) {
    playerContext += `Position accuracy: ${accuracy}% over ${ps.p} plays. `
  }
  if (recentWrong.length > 0) {
    playerContext += `Recent wrong concepts: ${recentWrong.join(', ')}. `
  }
  // Add mastery info for this position's concepts
  const posConcepts = KNOWLEDGE_BASE.getConceptsForPosition(position)
  const masteredConcepts = posConcepts.filter(c => conceptMastery[c.tag]?.state === 'mastered').map(c => c.name)
  const learningConcepts = posConcepts.filter(c => conceptMastery[c.tag]?.state === 'learning').map(c => c.name)
  if (masteredConcepts.length) playerContext += `Mastered: ${masteredConcepts.slice(0, 5).join(', ')}. `
  if (learningConcepts.length) playerContext += `Still learning: ${learningConcepts.slice(0, 5).join(', ')}. `
  if (!playerContext) playerContext = "New player, no history."
  
  // Send position rules from client (RAG will also retrieve server-side, but this ensures coverage)
  const principles = KNOWLEDGE_BASE.getPrinciplesForPosition(position)
  
  try {
    const res = await Promise.race([
      fetch(WORKER_BASE + "/v1/multi-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position,
          playerContext,
          positionRules: principles.condensed || principles.full || "",
          targetConcept: targetConcept || null,
          maxRetries: 1
        }),
        signal
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Multi-agent timeout")), 90000))
    ])
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: "Unknown" } }))
      console.warn("[BSM Multi-Agent] HTTP error:", res.status, err.error?.message)
      return null
    }
    
    const data = await res.json()
    console.log(`[BSM Multi-Agent] Success in ${data.pipeline.totalElapsed}ms:`,
      `"${data.scenario.title}"`,
      `critique=${data.critique.score}/10 (pass=${data.critique.pass})`,
      `stages=${data.pipeline.stages.length}`,
      `tokens=${data.pipeline.totalInputTokens + data.pipeline.totalOutputTokens}`,
      `RAG hits=${data.pipeline.ragHits || 0}`)
    
    // Run client-side quality firewall too (belt and suspenders)
    const fwResult = QUALITY_FIREWALL.validate(data.scenario)
    if (!fwResult.pass) {
      console.warn("[BSM Multi-Agent] Client firewall rejected:", fwResult.tier1Fails)
      return null
    }
    
    // Shuffle answers client-side
    shuffleAnswers(data.scenario)
    
    return { scenario: data.scenario, agentGrade: data.critique, plan: data.scenario.agentPlan }
  } catch (e) {
    console.warn("[BSM Multi-Agent] Error:", e.message)
    return null
  }
}

STEP 2 — Wire into generateAIScenario as the PRIMARY pipeline (not A/B — we want Opus always):

In generateAIScenario(), find where the agent pipeline is selected (around the useAgent A/B check).
ADD THIS at the very top of the function body, BEFORE the existing agent pipeline logic:

  // Phase 0: Multi-Agent Pipeline (Claude Opus + RAG) — primary path
  if (!skipAgent) {
    console.log("[BSM] Attempting multi-agent pipeline (Claude Opus)")
    const maResult = await generateWithMultiAgent(position, stats, signal, targetConcept)
    if (maResult?.scenario) {
      console.log("[BSM] Multi-agent pipeline succeeded")
      return maResult
    }
    console.warn("[BSM] Multi-agent pipeline failed, falling through to xAI pipeline")
    // Fall through to existing xAI pipeline as backup
  }

This makes Claude Opus the PRIMARY model. xAI Grok-4 becomes the fallback.
Pre-fetch (skipAgent=true) still uses the existing xAI standard pipeline for speed.

STEP 3 — Add console logging group for multi-agent:

  // At the top of generateWithMultiAgent:
  console.group("[BSM Multi-Agent Pipeline]")
  // At the end (in finally block):
  console.groupEnd()

Do NOT remove the existing agent pipeline or xAI pipeline. They stay as fallbacks.
```

---

### Prompt 5 of 6: Worker Secrets and Wrangler Config

**What:** Configure all required secrets and bindings.

**Context for Windsurf:**

```
TASK: Configure the Cloudflare Worker for the multi-agent pipeline.

STEP 1 — Add the Anthropic API key as a secret:
  cd worker
  npx wrangler secret put ANTHROPIC_API_KEY
  (paste your Anthropic API key when prompted)

STEP 2 — Update worker/wrangler.toml to add Vectorize and Workers AI bindings:

  # Add these sections if they don't already exist:
  
  [ai]
  binding = "AI"
  
  [[vectorize]]
  binding = "VECTORIZE"
  index_name = "bsm-knowledge"

STEP 3 — Create the Vectorize index:
  npx wrangler vectorize create bsm-knowledge --dimensions 1024 --metric cosine

STEP 4 — Deploy the worker:
  cd worker
  npx wrangler deploy

STEP 5 — Run the knowledge embedding:
  curl -X POST https://bsm-ai-proxy.blafleur.workers.dev/admin/embed-knowledge \
    -H "X-Admin-Key: YOUR_ADMIN_KEY" \
    -H "Content-Type: application/json"

STEP 6 — Test the multi-agent endpoint:
  curl -X POST https://bsm-ai-proxy.blafleur.workers.dev/v1/multi-agent \
    -H "Content-Type: application/json" \
    -d '{"position":"shortstop","playerContext":"Intermediate player, 65% accuracy"}'

Expected: JSON response with scenario + critique + pipeline stats within 30-60 seconds.
```

---

### Prompt 6 of 6: Verification & A/B Baseline

**What:** Test 50 generations and compare success rate (Grok's Phase 0 checklist item).

**Context for Windsurf:**

```
TASK: Create a test script that generates 50 scenarios via the multi-agent pipeline
and compares quality against the existing xAI pipeline.

Create: scripts/test-multi-agent.js (Node script)

The script should:

1. Define a test matrix: 15 positions × ~3-4 scenarios each = ~50 total
   [
     { position: "pitcher", context: "Beginner, 45% accuracy" },
     { position: "pitcher", context: "Advanced, 82% accuracy, mastered pitch-selection" },
     { position: "pitcher", context: "Intermediate, struggles with pickoff-timing" },
     { position: "catcher", context: "Beginner, first time" },
     ... (fill out all 15 positions with 3-4 difficulty variants)
   ]

2. For each test case, call BOTH endpoints:
   a. POST /v1/multi-agent (Claude Opus pipeline)
   b. POST /v1/chat/completions (existing xAI Grok-4 pipeline, with the standard prompt from index.jsx)

3. For each result, record:
   - Success/failure (did it return valid JSON?)
   - Response time
   - Critique score (from multi-agent pipeline)
   - Client-side gradeScenario() score (run on both results)
   - Checklist pass/fail counts
   - Token usage (if available)

4. Output a comparison table:

   | Metric | Claude Opus Multi-Agent | xAI Grok-4 Standard |
   |--------|------------------------|---------------------|
   | Success rate | X/50 | X/50 |
   | Avg response time | Xs | Xs |
   | Avg critique score | X/10 | N/A |
   | Avg gradeScenario score | X/100 | X/100 |
   | Checklist pass rate | X% | N/A |
   | Avg tokens used | X | X |
   | Position boundary violations | X | X |
   | Score perspective errors | X | X |

5. Save raw results to scripts/test-results/multi-agent-baseline-YYYY-MM-DD.json

Run: node scripts/test-multi-agent.js

This gives us the Grok-specified "Test 50 generations and compare success rate" deliverable.
```

---

## Grok's Phase 0 Checklist (Verbatim)

From the roadmap document:

- [ ] Update worker/index.js for Claude 4 ← Prompts 1-3
- [ ] Refactor generateAIScenario() into 4 agents ← Prompts 3-4
- [ ] Implement Vectorize RAG ← Prompts 1-2
- [ ] Test 50 generations and compare success rate ← Prompt 6

---

## Cost Estimate (Grok said $300-$800)

Claude Opus pricing (as of March 2026): ~$15/M input tokens, ~$75/M output tokens

Per scenario (4 stages, no rewrite):
- Planner: ~500 input + ~300 output = $0.008 + $0.023 = $0.031
- Generator: ~2000 input + ~1000 output = $0.030 + $0.075 = $0.105
- Critic: ~2500 input + ~400 output = $0.038 + $0.030 = $0.068
- **Total per scenario (no rewrite): ~$0.20**

Per scenario (with 1 rewrite):
- Add Rewriter: ~2500 input + ~1000 output = $0.038 + $0.075 = $0.113
- Add Re-critique: ~2500 input + ~400 output = $0.038 + $0.030 = $0.068
- **Total per scenario (1 rewrite): ~$0.38**

With the 9.5/10 threshold, expect ~80% of scenarios to need at least 1 rewrite.
Effective average: ~$0.35 per scenario.

50-test baseline: ~$17.50
100 scenarios/day operation: ~$35/day

Workers AI embeddings (for RAG): included in Cloudflare Workers Paid plan.
Vectorize queries: included in Cloudflare Workers Paid plan (up to 30M queries/month).

**This is well within Grok's $300-$800 estimate for the implementation phase.**

---

## What Stays Unchanged

- All 584 handcrafted scenarios in index.jsx — untouched
- The existing xAI proxy route (/v1/chat/completions) — stays as fallback
- The client-side agent pipeline — stays as fallback
- QUALITY_FIREWALL — still runs on every scenario (belt and suspenders)
- Pre-fetch system — still uses xAI standard pipeline (skipAgent=true) for speed
- All existing Worker routes (flag, feedback, pool, analytics) — untouched
- SCENARIO_BIBLE.md and BRAIN_KNOWLEDGE_SYSTEM.md — untouched (the RAG embeds them, doesn't modify them)

---

## What Changes

| Component | Before | After |
|-----------|--------|-------|
| Primary AI model | xAI Grok-4 | Claude Opus 4 |
| Pipeline architecture | Client-side plan→generate→grade | Server-side plan→generate→critique→rewrite |
| Knowledge retrieval | Inject ALL maps + principles into prompt | RAG: retrieve only top-3 relevant pieces |
| Quality evaluation | Structural gradeScenario() + regex | 21-item checklist + 5-dimension rubric + gradeScenario() |
| Quality threshold | gradeAgentScenario pass/fail (score-based) | 9.5/10 critique score + zero checklist failures |
| Fallback chain | Agent → Standard → Pool → Handcrafted | Multi-Agent (Opus) → Agent (xAI) → Standard (xAI) → Pool → Handcrafted |

---

## Execution Order

1. **Prompt 1** (Vectorize setup) → Deploy worker with bindings
2. **Prompt 2** (Embedding script) → Deploy, run embedding pipeline
3. **Prompt 3** (Multi-agent handler) → Deploy worker with full pipeline
4. **Prompt 4** (Client integration) → Deploy app with Opus as primary
5. **Prompt 5** (Secrets & config) → Verify everything is wired
6. **Prompt 6** (50-test baseline) → Measure improvement

Each prompt is self-contained. Wait for each to complete before starting the next.
Copy each prompt's "Context for Windsurf" block directly into Windsurf/Claude Code.
