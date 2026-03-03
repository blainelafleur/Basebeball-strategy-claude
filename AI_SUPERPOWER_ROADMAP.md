# Baseball Strategy Master — AI Superpower Roadmap

## What This Document Is

A concrete, technical roadmap for transforming BSM's AI from a "prompt-and-pray" content generator into a specialized baseball strategy intelligence engine. Three levels, each building on the last. Level 1 can start today. Level 3 is the competitive moat.

**Status:** ✅ ALL 3 LEVELS FULLY IMPLEMENTED (2026-03-03). See PROMPT_CHANGELOG.md for details.
- Level 1.5: Flagged scenario fetch + "AVOID THESE PATTERNS" prompt injection — complete
- Level 2.1: Weekly Cron Trigger (Mondays 6am UTC) + weekly_ai_report table — complete
- Migration file: `worker/migrations/ai_superpower.sql` — run to create D1 tables
- Deploy Worker with `cd worker && npx wrangler deploy` to activate Cron + new endpoints

---

## The Problem (Honest Assessment)

The AI currently works like this: player clicks "AI Coach's Challenge" → app sends ~1,800 words of prompt to xAI Grok → Grok returns a JSON scenario → 6-layer validation catches bad output → player sees the scenario.

What's broken:

1. **The Scenario Bible is invisible to the AI.** It's your best document — 16 position principle libraries, 13 knowledge maps, the knowledge hierarchy, quality frameworks — and no code ever reads it. The AI has never seen it.

2. **The Brain is 80% unused.** The AI gets ~15 lines of position rules and ~10 lines of tactical guidance. Meanwhile, the full RE24 matrix, pitch count fatigue model, park factors, win probability framework, platoon splits, pitch type sequencing data, and scoring probability tables sit idle in the codebase.

3. **Zero cross-player learning.** If 500 kids all struggle with cutoff relay concepts, that signal goes nowhere. Each player's data stays in their browser's localStorage. The flagged-scenario system writes to D1 but nothing reads it back.

4. **No quality measurement.** You can't compare AI scenario quality vs. handcrafted. You don't track correct-answer rates on AI scenarios separately. You can't tell if the AI produces good teaching moments or noise.

5. **The 539 handcrafted scenarios are invisible to the AI.** They represent your gold standard — patterns, difficulty curves, explanation styles — and the AI gets exactly 1 example via `getAIFewShot()`.

---

## Level 1: Wire Up What You Already Built

**Timeline:** 1-2 weeks
**Effort:** Medium — mostly plumbing, no new infrastructure
**Impact:** Estimated 2x improvement in AI scenario quality

### 1.1 Inject Scenario Bible Sections into AI Prompts

**What exists now:** `POS_PRINCIPLES[position]` gives the AI 100-150 words per position. The full Scenario Bible has 16 detailed principle libraries with specific do/don't rules, edge cases, and coaching context that are 3-5x richer.

**What to do:**
- Extract the position-specific sections from SCENARIO_BIBLE.md into a new constant: `BIBLE_PRINCIPLES`
- Each position gets its ~200-400 word principle block (the Bible is more detailed than POS_PRINCIPLES)
- Inject the relevant `BIBLE_PRINCIPLES[position]` into the AI prompt alongside the existing `POS_PRINCIPLES[position]`
- Include the Knowledge Hierarchy rules (Tier 1-4) as a preamble so the AI knows which sources override which

**Token budget:** ~300-500 additional tokens per prompt. Current prompt is ~1,800 words (~2,400 tokens). This brings it to ~2,700-2,900 tokens — well within Grok's context window.

**Where in code:** `generateAIScenario()` around line 6615, where the system prompt is assembled.

### 1.2 Send Full Brain Analytical Data to the AI

**What exists now:** The prompt mentions steal break-even (~72%) and a few RE24 facts as inline text. The BRAIN constant has 15+ data structures with real MLB numbers.

**What to do:**
- Create a `formatBrainForAI(position, situation)` function that assembles a compact data block:
  - RE24 matrix (the 8 most common base-out states, not all 24)
  - Count data for the specific count in the scenario
  - Steal break-even rates
  - Bunt delta values
  - Relevant pitch type data (for pitcher/catcher/batter)
  - TTO effect + platoon splits (for manager/pitcher/catcher)
  - Win probability for the relevant inning/score (for manager)
  - Scoring probability by base/outs
- Inject this as a "REFERENCE DATA" block in the prompt
- Include a directive: "Use these real numbers in your explanations. Don't invent statistics."

**Token budget:** ~200-350 additional tokens (compact table format).

**Where in code:** New function near `formatBrainStats()` (line ~5200), called from `generateAIScenario()`.

### 1.3 Feed More Handcrafted Examples to the AI

**What exists now:** `getAIFewShot(position)` returns exactly 1 handcrafted scenario as an example.

**What to do:**
- Expand to 2-3 examples per generation, selected by relevance:
  - 1 example matching the target concept (if `targetConcept` is set)
  - 1 example matching the target difficulty
  - 1 high-rated example from the position (highest correct-answer rate if tracking exists)
- Format as compact JSON (strip explanations to 1 sentence each to save tokens)

**Token budget:** ~300-400 additional tokens for 2 extra condensed examples.

**Where in code:** Modify `getAIFewShot()` to accept `targetConcept` and `difficulty` params.

### 1.4 Track AI vs. Handcrafted Quality Separately

**What exists now:** `scoreAIScenario()` scores individual AI scenarios (0-100). No comparison to handcrafted baseline.

**What to do:**
- Add a `scenarioSource` field to every scenario answer event: `"handcrafted"` or `"ai"`
- Track per-source metrics in localStorage:
  - `aiMetrics.correctRate` — % answered correctly on AI scenarios
  - `aiMetrics.avgScore` — average quality score
  - `aiMetrics.flagRate` — % flagged by players
  - Same fields for `hcMetrics` (handcrafted)
- Surface the comparison in the parent report panel
- Send aggregate metrics to the analytics pipeline (already built in Sprint 4)

**Where in code:** Answer handler in `App()` (~line 4800+), parent report renderer (~line 5600+).

### 1.5 Read Flagged Scenarios from D1

**What exists now:** Players can flag confusing AI scenarios. Flags are stored in D1 via the error reporting endpoint. Nothing ever reads them back.

**What to do:**
- Add a Worker endpoint: `GET /flagged-scenarios?position={pos}&limit=20`
- On app load (or on AI generation), fetch recent flags for the current position
- Inject a "AVOID THESE PATTERNS" block into the AI prompt with the 3-5 most common flag reasons
- Example: "Players found these confusing: [scenarios with 'cutoff' in title were flagged 4x for pitcher — avoid cutoff scenarios for pitcher]"

**Where in code:** New Worker endpoint in `worker/index.js`, new fetch call in `generateAIScenario()`.

### Level 1 Validation

After implementing all 5 items, run this test:
1. Generate 20 AI scenarios across 5 positions
2. Compare explanation quality to handcrafted scenarios (do they cite real numbers? do they follow Bible principles?)
3. Check role violation rate (should be near 0 — it was already low, but richer context should eliminate edge cases)
4. Compare AI correct-answer rate before vs. after (tracked via 1.4)

---

## Level 2: Build the Feedback Loop

**Timeline:** 3-5 weeks (after Level 1)
**Effort:** Medium-High — new analytics pipeline, monthly process
**Impact:** System goes from static to self-improving

### 2.1 Aggregate Player Performance Analytics

**What exists now:** Per-player stats in localStorage. Batched analytics events go to D1 (from Sprint 4). No aggregation.

**What to do:**
- Create a Worker endpoint: `GET /analytics/ai-quality` that returns:
  - AI scenario correct-answer rate by position (last 30 days)
  - AI scenario correct-answer rate by concept (last 30 days)
  - Most-flagged AI scenario patterns
  - AI vs. handcrafted quality comparison (aggregate)
  - Most common wrong-answer concepts across all players
- Create a scheduled Worker (Cron Trigger, weekly) that:
  - Aggregates the week's analytics into a `weekly_ai_report` D1 table
  - Identifies concepts where AI scenarios have <40% correct rate (too hard or confusing)
  - Identifies concepts where AI scenarios have >90% correct rate (too easy)
  - Flags positions where AI flag rate exceeds 5%

**Where in code:** New Worker endpoints + D1 table + Cron Trigger in `worker/index.js`.

### 2.2 Scenario Grader (Benchmark System)

**What to do:**
- Build a grading function that scores any scenario (AI or handcrafted) against the Bible's quality checklist:
  - Does every option describe an action the position actually performs? (Role boundary check)
  - Does the best answer align with the Knowledge Hierarchy? (Tier 1 > Tier 2 > Tier 3 > Tier 4)
  - Are explanations teaching the "why," not just stating the "what"?
  - Is the difficulty appropriate for the concept's age gate?
  - Does the situation make game-sense? (no 4-ball counts, no 3-out innings, score matches perspective)
  - Are success rates ordered correctly? (best option = highest rate)
- Run the grader on all 539 handcrafted scenarios to establish a quality baseline
- Run the grader on every AI scenario before showing it to the player (add as validation layer 7)
- Track grader scores in analytics

**Where in code:** New `gradeScenario()` function near the validation chain (~line 6776).

### 2.3 Prompt Refinement Pipeline (Monthly Cycle)

**Process (human-in-the-loop, not automated):**

1. **Week 1 of month:** Pull weekly AI quality report (from 2.1)
2. **Week 2:** Identify the 3 worst-performing concept/position combos
3. **Week 3:** For each, examine flagged scenarios and wrong-answer patterns. Determine if the issue is:
   - Bad prompt guidance → update `POS_PRINCIPLES` or `BIBLE_PRINCIPLES`
   - Missing knowledge → add to BRAIN constant
   - Validation gap → add new regex rule or consistency check
4. **Week 4:** Deploy updated prompt, monitor for 1 week, compare before/after

**Tracking:**
- Create `PROMPT_CHANGELOG.md` documenting every prompt change, why it was made, and the measured impact
- Version the prompt alongside `BRAIN_VERSION`

### 2.4 Auto-Difficulty Calibration from Population Data

**What exists now:** `scenarioCalibration` tracks per-player difficulty zone. No cross-player calibration.

**What to do:**
- Aggregate correct-answer rates per scenario ID across all players (anonymized)
- If a scenario labeled Diff 1 has <50% correct rate across 50+ attempts → flag for review (probably too hard)
- If a scenario labeled Diff 3 has >85% correct rate across 50+ attempts → flag for review (probably too easy)
- For AI scenarios: feed population-level difficulty data into the prompt:
  "Players at this level typically get cutoff-relay concepts right 62% of the time. Target that range."

**Where in code:** New aggregation in the weekly Cron Trigger, new prompt injection in `generateAIScenario()`.

### 2.5 A/B Testing the AI Prompt (Expand Existing Framework)

**What exists now:** A/B test framework from Sprint 4 with 2 tests (temperature, system prompt suffix).

**What to do:**
- Add new test variants:
  - `bible_injection`: on/off — does injecting Bible sections improve quality? (Validates Level 1.1)
  - `brain_data`: minimal/full — does sending more Brain data help? (Validates Level 1.2)
  - `few_shot_count`: 1/3 — does more examples help? (Validates Level 1.3)
- Track per-variant: correct rate, flag rate, quality score, time-to-answer
- After 2 weeks of data per test, pick winners and make them default

**Where in code:** Expand `AI_AB_TESTS` constant and variant selection in `generateAIScenario()`.

### Level 2 Validation

After 1 month of the feedback loop running:
1. AI scenario correct-answer rate should be within 5% of handcrafted baseline
2. AI flag rate should drop below 3%
3. At least 1 prompt refinement cycle should show measurable improvement
4. Population-level difficulty data should identify at least 5 miscalibrated scenarios

---

## Level 3: The Baseball Strategy AI Agent

**Timeline:** 2-3 months (after Level 2 is running smoothly)
**Effort:** High — new architecture, possibly new model, RAG system
**Impact:** This is the competitive moat. Scenarios indistinguishable from handcrafted.

### 3.1 Architecture Decision: RAG vs. Fine-Tune vs. Agent Pipeline

Three approaches, each with tradeoffs:

**Option A: RAG (Retrieval-Augmented Generation)**
- Store the Scenario Bible, all 539 handcrafted scenarios, Brain data, and player analytics in a vector database (Cloudflare Vectorize or Pinecone)
- On each generation, retrieve the 5-10 most relevant chunks based on position + concept + difficulty
- Feed retrieved context + player state to the LLM
- **Pros:** No model training needed, knowledge updates are instant (just re-embed), works with any LLM
- **Cons:** Retrieval quality depends on embedding model, context window still limited, retrieval latency adds 1-2s

**Option B: Fine-Tuned Model**
- Fine-tune a smaller model (Llama 3, Mistral, or similar) on your 539 handcrafted scenarios as training examples
- Input: position + situation + player context → Output: complete scenario JSON
- **Pros:** Fastest inference, deeply learned patterns, smallest prompt needed
- **Cons:** Expensive to retrain when knowledge updates, needs training infrastructure, risk of overfitting to 539 examples

**Option C: Agent Pipeline (Recommended)**
- Two-stage generation:
  - **Stage 1 — Planner:** Given player state + position + concept, the Planner selects: which knowledge maps to use, which Brain data is relevant, which handcrafted scenarios to reference, what difficulty band to target, and what teaching goal to pursue. Output: a structured generation plan.
  - **Stage 2 — Generator:** Given the plan + all selected context, generate the scenario. This stage gets a much richer, more targeted context than today's single-prompt approach because the Planner already filtered and organized it.
  - **Stage 3 — Grader (from Level 2.2):** Validates the output against the Bible's quality checklist. If it fails, feedback goes back to Stage 2 for a retry (max 2 retries).
- **Pros:** Best quality (specialized stages), self-correcting, modular (upgrade any stage independently), works with any LLM
- **Cons:** 2-3x latency (mitigated by pre-generation cache from Sprint 2.3), higher token cost per scenario

**Recommendation:** Option C (Agent Pipeline). It produces the highest quality, and the pre-generation cache from Sprint 2 means latency doesn't matter — scenarios are ready before the player clicks.

### 3.2 Knowledge Base (The Agent's Brain)

Build a structured knowledge base that the agent can query:

**Baseball Strategy Corpus:**
- Full Scenario Bible (embedded and searchable)
- All 539 handcrafted scenarios (indexed by position, concept, difficulty, correct-answer rate)
- Complete BRAIN constant data (RE24, counts, pitches, park factors, win probability)
- All 16 knowledge maps
- All 37 concepts with prerequisite graph
- POS_PRINCIPLES for all 15 positions

**Quality Corpus:**
- Quality checklist from the Bible
- All role violation patterns (regex + examples)
- All consistency rules (CR1-CR10 + examples)
- Historical flagged scenarios with reasons
- Prompt changelog from Level 2.3

**Player Intelligence Corpus:**
- Aggregate concept difficulty data (from Level 2.1)
- Position-specific performance distributions
- Most effective teaching patterns (which scenario structures produce the highest learning gains)
- Common misconceptions by age group

**Storage:** Cloudflare Vectorize (already in the Cloudflare ecosystem, free tier covers initial scale) for semantic search. D1 for structured data. R2 for larger documents if needed.

### 3.3 The Planner Agent

**Input:** Player state (level, accuracy, mastery, recent wrongs, age group) + position + optional target concept

**Process:**
1. Query the concept prerequisite graph: what should this player learn next?
2. Query aggregate difficulty data: what's the right challenge level?
3. Select 3-5 relevant handcrafted scenarios as style examples
4. Select the relevant knowledge maps and Brain data
5. Check deduplication against recent AI history
6. Identify the teaching goal: introduce new concept? reinforce weak one? advance mastered one?

**Output:** A structured plan object:
```json
{
  "teachingGoal": "reinforce",
  "targetConcept": "cutoff-relay",
  "difficulty": 2,
  "knowledgeMaps": ["CUTOFF_RELAY_MAP", "BACKUP_MAP"],
  "brainData": { "re24": {...}, "scoringProb": {...} },
  "exampleScenarios": [scenario1, scenario2, scenario3],
  "avoidPatterns": ["pitcher as cutoff", "catcher leaving home"],
  "playerContext": "Struggles with relay positioning. Gets force-vs-tag right 90% of the time."
}
```

### 3.4 The Generator Agent

**Input:** The Planner's structured plan

**Process:**
1. Assemble a focused, rich prompt using ONLY the data the Planner selected (no more cramming everything in)
2. Generate the scenario with the full context of examples, knowledge maps, and Brain data
3. Self-validate: check that every option is an action the position performs, that the best answer aligns with the knowledge hierarchy, and that real numbers appear in explanations

**Model choice:** Continue with xAI Grok for now (already working, good quality). Evaluate Anthropic Claude or OpenAI for the Generator stage if quality benchmarks from Level 2 suggest it would help.

### 3.5 The Grader Agent

**Input:** Generated scenario + the Planner's plan + the Bible's quality checklist

**Process:**
1. Role boundary check (automated — existing regex validation)
2. Knowledge hierarchy check: does the best answer align with the highest applicable tier?
3. Explanation quality check: does each explanation teach the "why"? Does it reference real data?
4. Difficulty appropriateness: does the scenario match the target difficulty and age gate?
5. Deduplication check: is this substantially different from recent scenarios?
6. Teaching effectiveness prediction: based on patterns from the quality corpus, will this scenario produce a learning moment?

**Output:** Pass/fail + quality score + specific feedback (if fail, what to fix)

**Retry logic:** If the Grader fails the scenario, it sends specific feedback to the Generator for a targeted retry (not a full re-generation). Max 2 retries, then fall back to handcrafted.

### 3.6 Cross-Player Learning Loop (The Flywheel)

This is what makes the system get smarter over time:

1. **Every player answer feeds the intelligence:** correct/incorrect, time-to-answer, flag status
2. **Weekly aggregation** (from Level 2.1) identifies:
   - Which concepts the AI teaches well vs. poorly
   - Which scenario structures produce the best learning outcomes
   - Where the AI's explanations are confusing (high flag rate)
3. **Monthly refinement** (from Level 2.3) updates:
   - The Planner's teaching strategy (which concepts to prioritize, which patterns to avoid)
   - The Generator's reference examples (swap in higher-performing scenarios)
   - The Grader's quality thresholds (tighten standards as quality improves)
4. **The knowledge base grows:** Every validated AI scenario that passes the Grader with a high score and gets >70% correct from players becomes a candidate for the "gold standard" corpus — effectively growing your handcrafted-equivalent library automatically.

**This is the AI superpower:** After 6 months of Level 3, you'll have thousands of graded, player-validated scenarios — each as good as the original 539 — covering edge cases and concept combinations that would take years to write by hand. The system teaches itself what works.

### 3.7 Migration Path (No Big Bang)

Roll out Level 3 incrementally:

1. **Week 1-2:** Build the knowledge base (3.2). Embed the Scenario Bible, scenarios, and Brain data into Vectorize.
2. **Week 3-4:** Build the Planner (3.3). Run it in shadow mode — it generates plans but the existing `generateAIScenario()` still does the actual generation. Compare plans to what the current system would have done.
3. **Week 5-6:** Build the Generator (3.4) with RAG retrieval from the knowledge base. A/B test: 50% of AI generations use the new pipeline, 50% use the old one. Compare quality scores.
4. **Week 7-8:** Build the Grader (3.5). Run on all AI scenarios (both old and new pipeline). Track rejection rates and quality scores.
5. **Week 9-10:** If new pipeline wins the A/B test, make it default. Shut down old generation path.
6. **Week 11-12:** Enable the cross-player learning loop (3.6). Monitor for 2 weeks before trusting it to influence generation.

### Level 3 Validation

After 1 month of the full pipeline running:
1. AI scenario quality scores should be within 2% of handcrafted baseline (measured by Grader)
2. AI scenario correct-answer rate should match handcrafted within 3%
3. Flag rate should be below 1%
4. The system should have auto-generated at least 50 "gold standard" scenarios
5. Cross-player learning should have identified at least 3 teaching pattern improvements

---

## Cost Projections

| Level | Monthly Cost (at 1,000 Pro users) | Notes |
|-------|-----------------------------------|-------|
| Current | ~$15-25 | ~5K AI generations × $0.003-0.005 each |
| Level 1 | ~$20-35 | Larger prompts, same generation count |
| Level 2 | ~$25-45 | + analytics pipeline, + grading runs |
| Level 3 | ~$60-120 | 2-3x tokens per generation (Planner + Generator + Grader), offset by pre-generation cache reducing wasted generations |

All well within the $4,900/mo revenue at 1,000 Pro users. Even at 100 Pro users ($490/mo revenue), Level 3 costs are <25% of revenue.

---

## Infrastructure Requirements

**Level 1:** No new infrastructure. All changes in `index.jsx` and `worker/index.js`.

**Level 2:**
- New D1 tables: `weekly_ai_report`, `scenario_grades`
- Cloudflare Cron Trigger (free tier)
- `PROMPT_CHANGELOG.md` (new file)

**Level 3:**
- Cloudflare Vectorize (free tier: 5M vectors, more than enough)
- Possibly a second Worker for the agent pipeline (to separate concerns from the main proxy)
- R2 bucket for larger knowledge base documents (free tier: 10GB)

Everything stays in the Cloudflare ecosystem. No new vendors, no new billing accounts.

---

## Decision Points

Before starting each level, answer these:

**Before Level 1:**
- [x] Is the current A/B testing framework stable? (Yes — Sprint 4 complete)
- [ ] Are analytics events flowing reliably to D1? (Verify with a spot check)

**Before Level 2:**
- [ ] Did Level 1 produce measurable quality improvement? (Check A/B test data)
- [ ] Is the analytics pipeline collecting enough data for aggregation? (Need ~1,000 AI scenario completions)
- [ ] Who runs the monthly prompt refinement cycle? (Blaine? Automated report to review?)

**Before Level 3:**
- [ ] Is the Level 2 feedback loop producing actionable insights monthly?
- [ ] Is the pre-generation cache working well enough to absorb the extra latency?
- [ ] Budget approval for increased token costs?
- [ ] Which LLM for the Generator stage? (Run a model comparison test)

---

## Summary

| Level | What It Does | Timeline | Key Outcome |
|-------|-------------|----------|-------------|
| **1** | Wire up existing knowledge (Bible, Brain, examples) | 1-2 weeks | AI scenarios 2x better quality |
| **2** | Build feedback loops (analytics, grading, monthly refinement) | 3-5 weeks | System self-improves monthly |
| **3** | Specialized agent pipeline (Planner → Generator → Grader) | 2-3 months | AI indistinguishable from handcrafted, auto-grows library |

The end state: an AI that doesn't just generate baseball scenarios — it **understands** baseball strategy the way your Scenario Bible teaches it, **learns** from every player interaction, and **improves** itself every week. That's the superpower.
