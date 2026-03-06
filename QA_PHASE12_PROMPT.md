# Phase 12: AI Feature Verification Prompt for Claude Code

Copy everything below this line and paste into Claude Code:

---

Read `CLAUDE.md` and `QA_BUG_REPORT.md` (specifically the "Phase 12: AI Feature Testing" section) first, then perform a code-level audit of all AI-powered features in `index.jsx`. Phase 12 QA testing found **no new bugs** — all AI features passed. Your job is to verify the code paths are sound and flag anything fragile.

## AUDIT 1 — AI Coach's Challenge Flow

**What was tested:** AI Coach's Challenge generates personalized scenarios via xAI Grok across Pitcher, Batter, and Shortstop positions. Loading screen ("AI COACH IS THINKING..."), cancel button, purple AI badge, and BRAIN Insights integration all worked correctly.

**Code to audit:**
- Find `generateAIScenario()` (around lines ~3440-3610) — verify the system prompt includes player context (level, position accuracy, mastered concepts, recent wrong answers)
- Verify the 15-second timeout with `AbortController` is properly implemented
- Verify the cancel button sets an abort signal and returns the user to home screen without state corruption
- Verify JSON validation on the AI response — confirm it checks for required fields (situation, options array of 4, explanations, concept, animation)
- Verify the fallback path when AI returns invalid JSON or times out — should gracefully serve a handcrafted scenario
- Check that the AI Coach's Challenge section only renders when `stats.gp >= 3 && stats.isPro === true`

**Flag if:** Timeout doesn't clean up properly, cancel leaves orphaned state, or invalid AI responses could crash the app.

---

## AUDIT 2 — Explain More / Deep Dive AI

**What was tested:** "Explain More" button on post-answer feedback screen calls AI to generate ~68-word deep dives with real MLB examples. Tested on pitcher (pickoff), shortstop (relay), and batter (two-strike approach) concepts — all produced quality output with age-appropriate language.

**Code to audit:**
- Find the Explain More handler (around lines ~11594-11611) — verify it sends the concept text and scenario context to the AI
- Verify the deep dive content is sanitized/escaped before rendering (no raw HTML injection from AI response)
- Verify the button is gated behind Pro (`stats.isPro`)
- Verify loading state while AI generates the explanation (should show a spinner or "thinking" indicator)
- Verify error handling if the AI deep dive request fails — should fail silently or show a friendly message, not crash

**Flag if:** AI response content is rendered unsanitized, or a failed deep dive request leaves the UI in a broken state.

---

## AUDIT 3 — Real Game Mode (AI-Powered)

**What was tested:** Real Game mode generates a 9-inning AI simulation with live score tracking ("INN X | YOU Y — OPP Z"). Each play is an AI-generated scenario with a position-specific context. Score updates after each play.

**Code to audit:**
- Find the Real Game state management — verify inning tracking, score accumulation, and game-over logic
- Verify the AI is called for each new play within the game (not pre-generating all 9 innings)
- Verify score updates are deterministic based on the player's answer quality (correct answer = team scores, wrong = opponent scores, or similar logic)
- Verify the 9-inning game has a proper completion screen
- Check for edge cases: What happens if AI fails mid-game? Does the game recover or get stuck?

**Flag if:** A failed AI call mid-game could leave the player stuck with no way to continue or exit.

---

## AUDIT 4 — Session Recap + AI Integration

**What was tested:** The Session Recap modal (fires every ~3 plays) correctly includes AI-generated concepts alongside handcrafted ones.

**Code to audit:**
- Find where the Session Recap collects concepts from recent plays
- Verify AI-generated scenario concepts are stored in the same format as handcrafted scenario concepts
- Verify the recap doesn't crash if an AI scenario had an unusual or missing concept field

**Flag if:** AI scenarios store concept data in a different format than handcrafted ones, causing potential display issues.

---

## AUDIT 5 — BUG-5 Update: Unicode Arrow (Expanded Scope)

**Already in Phase 1-11 fixes as FIX 5**, but Phase 12 testing confirmed this bug appears on **desktop too, not just mobile**. All three entries in the "Recommended For You" section show `Play \u2192` as literal text at every viewport width.

**Additional check:** When applying FIX 5, search the entire file for any other instances of `\u2192` that might be double-escaped or stored in data structures where the escape sequence isn't processed. The fix should work at all breakpoints since the bug is viewport-independent.

---

## AUDIT 6 — AI Proxy Security

**Code to audit:**
- Find `AI_PROXY_URL` constant — verify it points to the Cloudflare Worker, not directly to xAI API
- Check `worker/index.js` — verify the API key is read from environment secrets (`env.XAI_API_KEY` or similar), never hardcoded
- Verify the worker has CORS headers that restrict origin to the app domain
- Verify the worker has rate limiting or at minimum doesn't allow unlimited requests from any origin

**Flag if:** API key is exposed client-side, CORS is wide open (`*`), or there's no rate limiting on the worker.

---

## After audit:

1. Report any fragile code paths, missing error handling, or potential crash scenarios you find
2. If any issues are found, fix them with the same compact style as the existing codebase
3. Do NOT change anything that's working correctly — this is a verification audit, not a refactor
4. If all code paths look solid, confirm with: "Phase 12 AI audit complete — no issues found"
5. If fixes were made, commit with message: "Harden AI feature error handling per Phase 12 audit"
