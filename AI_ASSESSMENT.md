# AI Pipeline Assessment — Baseball Strategy Master

**Date:** March 7, 2026
**Status:** Failing — 504 Gateway Timeouts cascading into total AI failure

---

## What's Happening (Console Diagnosis)

The console screenshot tells a clear story of cascading timeout death:

1. **Pre-fetch fires** with 100s budget, standard pipeline (skipAgent=true) → **504 Gateway Timeout** (55s worker timeout hit)
2. **Player clicks AI Coach's Challenge** → `startGame` fires with `forceAI: true`
3. **Agent pipeline** tries first (A/B variant) → **504 Gateway Timeout** (55s again)
4. Agent falls back to standard pipeline → only **33s budget remaining** (90s total - 55s burned on agent)
5. Standard pipeline → **Timeout** (client-side, ran out of budget)
6. Retries all fail because **budget is exhausted**
7. Total flow: **88 seconds of wall-clock time**, zero scenarios generated

**Root cause: `grok-4` is too slow for the current timeout chain.** The model appears to be taking >55 seconds to respond, which exceeds the Worker's 55s abort timeout. Every single API call 504s.

---

## The 7 Systemic Problems

### 1. TIMEOUT CHAIN IS MISCALIBRATED FOR GROK-4

The timeout stack has 4 layers that fight each other:

| Layer | Timeout | Set Where |
|-------|---------|-----------|
| xAI API response | Unknown (their server) | xAI |
| Worker abort | **55s** | `worker/index.js:1306` |
| Client fetch race | **75s** (or remaining budget) | `index.jsx:9174, 9698` |
| AI_BUDGET total | **90s** | `index.jsx:12186` |

The Worker kills at 55s, but grok-4 (xAI's flagship model) regularly takes >55s for these prompts. The Worker returns a 504 before grok-4 even finishes. **You're paying for computation you never receive.**

**Fix:** Increase Worker timeout to 75s (Cloudflare Workers support up to 30s on free tier, but you may be on paid). Or better: use streaming to keep the connection alive and parse incrementally.

### 2. PROMPTS ARE MASSIVE — ESTIMATED 3,000-5,000 TOKENS INPUT

The standard pipeline prompt (`index.jsx:9550-9622`) packs in:

- System message: ~800 tokens (detailed coaching persona + rules)
- User message: ~2,000-4,000 tokens depending on injections:
  - Position rules + Bible principles + AI maps + Brain data (~500-1000)
  - Weak areas / mastery context / error reinforcement (~200-500)
  - Flagged avoidance patterns + prompt patches + real game feel + decision windows + coaching voice (~300-600)
  - Analytics rules + position-action boundaries + role violation instructions (~300)
  - Option archetypes + few-shot example (~300-500)
  - JSON schema example (~200)

This is asking a model to read a small essay and produce structured JSON. Larger prompts = longer inference time = more timeouts.

**Fix:** Create a "fast" prompt variant (~1,500 tokens max) that strips: Bible principles, Brain data, real game feel, coaching voice, option archetypes, error reinforcement. Use the full prompt only for the agent pipeline or when budget is ample.

### 3. AGENT PIPELINE DOUBLES THE API CALLS

When A/B testing assigns `useAgent: true`, the flow becomes:

1. Agent pipeline calls xAI (burns up to 75s)
2. If agent fails → standard pipeline calls xAI again (remaining budget)
3. If standard fails → retry #1 calls xAI again
4. If retry fails → retry #2 calls xAI again

That's potentially **4 sequential API calls** to xAI, each with massive prompts. With grok-4 being slow, this is a guaranteed timeout spiral.

**Fix:** When agent pipeline 504s, don't fall back to standard pipeline with the same model. Either: (a) fall back to server pool / local pool immediately, or (b) use a faster/smaller model for the fallback.

### 4. PRE-FETCH AND LIVE REQUEST COMPETE FOR THE SAME BUDGET

The pre-fetch fires with a **100s budget** (`index.jsx:10771`) and uses `skipAgent=true` (standard pipeline only). But when the user clicks play and there's no cached result, the live path starts a fresh `generateAIScenario` with a 90s budget. If the pre-fetch is still in-flight, you now have **two concurrent xAI calls** — both burning through rate limits and both likely to 504.

The pre-fetch abort (`cancelPrefetch`) is called in `consumeCachedAI` at line 10802, but only AFTER checking if there's a cached result. If the pre-fetch hasn't finished yet, the live path doesn't know about it — it just starts a new call.

**Fix:** Track pre-fetch in-flight state. If pre-fetch is active when the user starts a game, either: (a) await the pre-fetch result instead of starting a new call, or (b) abort pre-fetch immediately and start the live call.

### 5. NO FAST-FAIL ON KNOWN-BAD CONDITIONS

There's no circuit breaker for xAI API health. If xAI is having a bad day (overloaded, rate-limited, degraded), every single user will burn through 90s of timeout before getting a fallback handcrafted scenario. The `aiFailRef.current.consecutive` counter only triggers a cooldown after **3 consecutive failures** — that's 3 × 90s = **4.5 minutes** of the user staring at a loading spinner before the app learns to stop trying.

**Fix:** Implement an exponential backoff circuit breaker:
- 1st failure: retry once, then fallback (already exists)
- 2nd failure within 5 minutes: skip AI entirely, use pool/handcrafted
- Track xAI response times: if average > 40s over last 3 calls, pre-emptively reduce timeout to 30s or skip AI
- Store circuit breaker state in `sessionStorage` so it persists across React re-renders but resets on new sessions

### 6. GROK-4 MAY BE OVERKILL

You're using `grok-4` (xAI's flagship reasoning model) for every single API call:
- Standard scenario generation
- Agent pipeline generation
- Self-audit scoring
- AI Situation generation (multi-position)

For a structured JSON generation task with a detailed prompt, a faster model (like `grok-3` or `grok-3-mini` or whatever xAI's faster tier is) would likely produce equivalent quality at 2-5x speed. The prompt already constrains output quality heavily through validation, role violations, quality firewall, and auto-correction. The model just needs to follow instructions and produce valid JSON.

**Fix:** A/B test `grok-4` vs a faster xAI model. Use the faster model for: pre-fetch, standard pipeline fallback, self-audit. Reserve grok-4 for agent pipeline only (where quality matters most).

### 7. SELF-AUDIT ADDS A SECOND API CALL IN THE HOT PATH

After generating a scenario, the standard pipeline makes a SECOND xAI call for self-audit (`index.jsx:10093-10107`) with a 5s timeout. If grok-4 is already slow, this 5s call will also timeout, and while it's marked "non-blocking" for timeouts, if it succeeds and scores < 3, it **rejects the scenario** — triggering yet another full generation cycle.

**Fix:** Disable self-audit when budget is under 30s. Or move it to post-serve (audit after showing the scenario, store result for pool quality gating).

---

## Prioritized Fix Plan (Execute in Order)

### Phase 1: Stop the Bleeding (30 min)

1. **Increase Worker timeout from 55s to 90s** in `worker/index.js:1306` — or better, match the client's per-call timeout. The Worker abort currently kills responses that xAI would deliver in 60-70s.

2. **Add a model fallback constant** at the top of index.jsx:
   ```
   const AI_MODEL_FAST = "grok-3-mini"  // or whatever xAI's fast tier is
   const AI_MODEL_FULL = "grok-4"
   ```
   Use `AI_MODEL_FAST` for: pre-fetch, standard pipeline after agent failure, retries. Use `AI_MODEL_FULL` for agent pipeline only.

3. **Cut the agent → standard cascade timeout** — when agent 504s, don't retry with standard pipeline if budget < 40s. Just go straight to server pool → local pool → handcrafted.

### Phase 2: Prompt Diet (1-2 hours)

4. **Create a condensed prompt** (~1,500 tokens) that strips: Bible principles, Brain data formatting, real game feel situations, coaching voice picks, option archetypes. Keep: position rules, score rules, analytics rules, role boundaries, few-shot example, JSON schema. Use condensed prompt when `skipAgent=true` or budget < 45s.

5. **Move self-audit to post-serve** — show the scenario immediately, audit in background, flag for pool quality but don't reject mid-session.

### Phase 3: Resilience (1-2 hours)

6. **Smarter circuit breaker:**
   - Track rolling average xAI response time (last 5 calls) in sessionStorage
   - If avg > 40s: halve the timeout, skip agent pipeline, use fast model
   - If 2 consecutive 504s within 5 min: skip AI entirely for 10 min, use pool/handcrafted
   - Show user a friendly "AI is warming up, using curated scenarios" instead of a loading spinner

7. **Pre-fetch awaiting** — if pre-fetch is in-flight when user clicks play, await it instead of starting a duplicate call. Add a `cacheRef.current.inFlightPromise` that the live path can `await`.

8. **Server pool as primary fallback** — before any AI call, check server pool first. If pool has a quality scenario for this position, serve it immediately with zero latency. Only generate AI when pool is empty or all pool scenarios have been served.

### Phase 4: Streaming (Optional, High Impact)

9. **Switch to streaming responses** — xAI supports streaming. Parse the JSON incrementally as tokens arrive. This keeps the Worker connection alive (no timeout), gives you early-fail detection (if first 100 tokens aren't valid JSON structure, abort), and reduces perceived latency for the user.

---

## Quick Wins You Can Validate Immediately

- **Check xAI API status** — grok-4 may be experiencing degraded performance. Check https://status.x.ai or equivalent.
- **Check your xAI rate limits** — if you're hitting rate limits, the API queues requests, adding latency that pushes you past the 55s Worker timeout.
- **Test with a smaller model** — change `grok-4` to `grok-3` or `grok-2` in one place and see if response times drop under 30s.
- **Temporarily disable agent pipeline** — set the A/B test weight for `useAgent` to 0% so all users go straight to standard pipeline (one API call instead of two).

---

## Architecture Summary

```
Current Flow (broken):
  Pre-fetch ──→ xAI grok-4 ──→ 504 (55s timeout)
  User clicks ──→ Agent pipeline ──→ xAI grok-4 ──→ 504
                  ↓ fallback
                  Standard pipeline ──→ xAI grok-4 ──→ Timeout (budget exhausted)
                  ↓ fallback
                  Retry ──→ xAI grok-4 ──→ Timeout
                  ↓ fallback
                  Handcrafted scenario (after 88s of waiting)

Proposed Flow (resilient):
  Pre-fetch ──→ xAI grok-fast ──→ Cache (or pool fallback)
  User clicks ──→ Check cache ──→ HIT? Serve instantly
                  ↓ MISS
                  Check server pool ──→ HIT? Serve instantly
                  ↓ MISS
                  Agent pipeline ──→ xAI grok-4 (75s budget)
                  ↓ 504/timeout? Don't retry with standard — go to pool
                  Local pool ──→ Handcrafted (< 2s total fallback)
```
