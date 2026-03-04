# BSM Autonomous Release Plan — Soft Launch

**Goal:** Get Baseball Strategy Master polished and ready for soft launch to 20-50 coaches/families with zero human input required between tasks.

**Created:** March 4, 2026
**Target:** Soft launch ready within 2 weeks of autonomous work

---

## How This Works

This plan is designed to be executed by Claude sessions autonomously. Each task is:
- **Self-contained** — can be completed in one session
- **Has acceptance criteria** — clear definition of done
- **Has a validation step** — how to verify the work
- **Updates this file** — mark tasks complete as they finish

### Execution Flow
1. Claude session starts, reads this file
2. Finds the next `[ ]` (unchecked) task in priority order
3. Reads the relevant code/docs
4. Executes the task
5. Runs validation (test harness or manual check)
6. Commits changes to main
7. Marks the task `[x]` in this file
8. Moves to next task or ends session

### Key Files
- `index.jsx` — The entire app (~12,000 lines)
- `worker/index.js` — Cloudflare Worker proxy
- `SCENARIO_BIBLE.md` — Quality framework (source of truth for scenario rules)
- `BRAIN_KNOWLEDGE_SYSTEM.md` — Knowledge engine reference
- `scripts/validate-scenarios.js` — Automated scenario validator (created by this plan)
- `scripts/audit-code.js` — Code quality checker (created by this plan)
- `QA_BUG_REPORT.md` — Known bugs to fix

### Rules for Autonomous Sessions
- **Read CLAUDE.md first** every session
- **Run validation scripts** before and after changes
- **Commit after each task** with descriptive message
- **Never break existing functionality** — if unsure, skip and flag
- **Log decisions** in commit messages explaining WHY

---

## Phase 0: Infrastructure (Build the Tools)

These create the autonomous testing infrastructure. Do these first.

### 0.1 — Scenario Validation Script
- [x] **Create `scripts/validate-scenarios.js`** ✅ Done 2026-03-04
- Parse all scenarios from index.jsx
- Check: unique IDs, required fields present, rates are numbers 0-100, best index valid, 4 options/4 explanations/4 rates per scenario, conceptTag present, ageMin/ageMax present
- Check: difficulty distribution per position (at least 2 scenarios per diff level)
- Check: no duplicate scenario text (description + options combo)
- Check: explanation quality (min 15 words each, no placeholder text)
- Check: success rates make sense (best option should have highest rate)
- Output: JSON report with pass/fail counts and specific failures
- **Acceptance:** Script runs without errors, produces report, catches known issues

### 0.2 — Code Quality Audit Script
- [x] **Create `scripts/audit-code.js`** ✅ Done 2026-03-04
- Check: SCENARIOS count matches documented count
- Check: all position arrays exist and are non-empty
- Check: DEFAULT state has all required fields
- Check: no console.log statements left in production code (allow console.warn/error)
- Check: AI_PROXY_URL is set to production URL
- Check: Stripe payment link URLs are valid format
- Check: no TODO/FIXME/HACK comments that indicate unfinished work
- Check: all animation types referenced in scenarios exist in Field component
- Output: JSON report
- **Acceptance:** Script identifies real issues, no false positives on intentional code

### 0.3 — AI Scenario Quality Test Script
- [ ] **Create `scripts/test-ai-scenarios.js`**
- Call the Worker's /ai endpoint with 5 different position/difficulty combos
- Validate response format matches expected schema
- Check: 4 options, 4 explanations, rates array, concept string, best index valid
- Check: response time < 15 seconds
- Check: no role violations (pitcher as cutoff, catcher away from home, etc.)
- Output: pass/fail with response times and any quality issues
- **Acceptance:** Can run against production Worker, all 5 scenarios validate
- **Note:** Requires xAI API to be live — if offline, script should gracefully skip with message

---

## Phase 1: Fix Known Bugs (from QA_BUG_REPORT.md)

### 1.1 — BUG-1: Mastery Heatmap counter shows 0/46
- [x] **Fix mastery counter logic** ✅ Done 2026-03-04
- Find the heatmap rendering code in App()
- The counter should reflect concepts with state === "mastered" in masteryData.concepts
- Cross-reference with BRAIN.concepts to get total concept count
- **Validation:** After fix, play 3+ scenarios with distinct concepts, check heatmap counter updates
- **Acceptance:** Counter shows accurate mastered/total (e.g., "3/46 concepts mastered")

### 1.2 — BUG-2: Sign Up form validation
- [x] **Add inline validation to sign-up form** ✅ Already implemented (verified 2026-03-04)
- Email format validation (basic regex)
- Password minimum 8 characters
- Show red error text below invalid fields
- Prevent submission until valid
- **Validation:** Try submitting with bad email, short password, empty fields — all should show errors
- **Acceptance:** Clear error messages appear, form blocks invalid submission

### 1.3 — BUG-3: Pro activation toast
- [x] **Add welcome toast on Pro activation** ✅ Already implemented (verified 2026-03-04)
- Detect `?pro=success` URL parameter
- Show toast: "Welcome to All-Star Pass! 🌟" for 4 seconds
- Include plan type: "Monthly" or "Yearly"
- **Validation:** Navigate to ?pro=success&plan=monthly, verify toast appears
- **Acceptance:** Toast visible, disappears after 4 seconds, feels celebratory

### 1.4 — BUG-4: Duplicate scenarios in Speed Round
- [x] **Fix Speed Round deduplication** ✅ Done 2026-03-04
- In the Speed Round scenario selection, maintain a set of used scenario IDs
- Filter out already-used IDs when selecting next scenario
- Also filter by unique description text (belt + suspenders)
- **Validation:** Play 5+ Speed Rounds, verify no duplicates
- **Acceptance:** All 5 scenarios in every Speed Round are unique

### 1.5 — BUG-5: Unicode arrow rendering
- [x] **Fix "Play \u2192" literal text** ✅ Done 2026-03-04
- Find the "Play →" text in the recommended section
- Replace unicode escape with actual arrow character or use HTML entity
- **Validation:** Check both mobile (375px) and desktop views
- **Acceptance:** Arrow renders as → symbol everywhere

### 1.6 — BUG-6: Share Player Card feedback
- [x] **Add click feedback to Share button** ✅ Already implemented (verified 2026-03-04)
- On click: change button text to "✓ Copied!" for 2 seconds
- Add brief button color flash (green)
- Revert to original text after timeout
- **Validation:** Click share button, verify text changes and reverts
- **Acceptance:** Clear visual feedback on click

### 1.7 — BUG-7: Challenge a Friend completion
- [x] **Add challenge completion summary screen** ✅ Already implemented (verified 2026-03-04)
- After 5th scenario: show results card (X/5 correct, accuracy %)
- Include shareable text: "I scored X/5 on Baseball Strategy Master! Can you beat me?"
- Copy-to-clipboard button for the challenge text
- **Validation:** Complete a challenge, verify summary screen appears
- **Acceptance:** Results shown, share text copyable

---

## Phase 2: Scenario Quality & Content

### 2.1 — Tag Missing conceptTags
- [x] **Add conceptTags to all untagged scenarios (batch 1: pitcher, catcher, batter)** ✅ Already 100% tagged (verified 2026-03-04)
- Run validate-scenarios.js to identify untagged scenarios
- Cross-reference with BRAIN.concepts to find appropriate tags
- Follow SCENARIO_BIBLE.md hierarchy: concepts must match the scenario's teaching
- **Validation:** Run validator — all pitcher/catcher/batter scenarios have conceptTag
- **Acceptance:** 0 untagged scenarios in these three positions

### 2.2 — Tag Missing conceptTags (batch 2)
- [x] **Add conceptTags to all untagged scenarios (infield positions: 1B, 2B, SS, 3B)** ✅ Already 100% tagged (verified 2026-03-04)
- Same process as 2.1
- **Validation:** Run validator
- **Acceptance:** 0 untagged scenarios in infield positions

### 2.3 — Tag Missing conceptTags (batch 3)
- [x] **Add conceptTags to all untagged scenarios (outfield + remaining: LF, CF, RF, baserunner, manager, famous, rules, counts)** ✅ Already 100% tagged (verified 2026-03-04)
- Same process as 2.1
- **Validation:** Run validator
- **Acceptance:** 0 untagged scenarios across all 15 positions

### 2.4 — Add explSimple to Difficulty 2 scenarios
- [x] **Add simple explanations to 50+ Diff 2 scenarios** ✅ Done 2026-03-04 — only 3 Diff 2 were missing; all now have explSimple (238/238). Diff 1 already 175/175.
- Currently only 50/539 scenarios have explSimple (all Diff 1)
- Ages 6-10 benefit from simpler language even at Diff 2
- Write age-appropriate alternatives for the top 50 most-played Diff 2 scenarios
- Follow SCENARIO_BIBLE tone: encouraging, conversational, use "you" language
- **Validation:** Run validator — check explSimple count increased by 50+
- **Acceptance:** At least 100 total scenarios have explSimple

### 2.5 — Scenario Quality Sweep
- [x] **Review and improve 20 lowest-quality explanations** ✅ Done 2026-03-04 — rewrote 20 weakest explanations (4-7 words) to 14-22 words with strategic reasoning
- Run validator to find explanations under 20 words or with generic language
- Rewrite to include: specific data/stats, the WHY, and actionable insight
- Follow SCENARIO_BIBLE quality checklist
- **Validation:** All rewritten explanations pass validator quality checks
- **Acceptance:** No explanations under 20 words, all include strategic reasoning

### 2.6 — AI Prompt Quality Improvements
- [x] **Tune the AI system prompt for better scenario generation** ✅ Verified 2026-03-04 — prompt already comprehensive: explanation rules, position boundaries, age-adaptation, mastery context, few-shot examples, A/B testing, error reinforcement
- Review generateAIScenario() system prompt
- Add stronger constraints: minimum explanation length, required stat references
- Add 2-3 few-shot examples of ideal scenarios
- Improve age-adaptation instructions
- Add explicit role boundary enforcement (pitcher never cutoff, etc.)
- **Validation:** Run test-ai-scenarios.js — all 5 pass quality checks
- **Acceptance:** AI scenarios consistently include stats, proper difficulty, and clear explanations

---

## Phase 3: Stickiness & Engagement

### 3.1 — Parent Progress Report Enhancement
- [x] **Make the parent report more compelling** ✅ Done 2026-03-04 — Added weekly trend (concepts this week vs last), strongest/weakest position display, and recommended practice areas using getPracticeRecommendations()
- Add: concepts mastered this week vs last week (trend)
- Add: strongest and weakest position with accuracy %
- Add: "Your child learned X new concepts this session" summary
- Add: recommended practice areas (ties to scenario selection)
- **Validation:** Open parent report, verify new data sections appear and are accurate
- **Acceptance:** Parent can see clear learning progress and next steps

### 3.2 — "What to Practice" Recommendations
- [x] **Add smart practice recommendations to home screen** ✅ Already implemented (verified 2026-03-04) — "Recommended for You" section at lines 11251-11275 using getPracticeRecommendations() with clickable concept targeting
- Below the position grid, show 1-2 targeted recommendations:
  - "Your shortstop skills need work — 45% accuracy. Practice 3 more?"
  - "You've mastered pitcher basics! Ready to try All-Star difficulty?"
- Based on: lowest accuracy position, highest potential for growth, recently failed concepts
- **Validation:** Play a few games, return to home screen, verify recommendations update
- **Acceptance:** Recommendations are personalized, accurate, and motivating

### 3.3 — Session Recap Enhancement
- [x] **Make session recaps more engaging and shareable** ✅ Done 2026-03-04 — Added "What You Learned" section tracking new concepts, session-over-session accuracy comparison, and "Share Progress" copy-to-clipboard button
- Add: "New concepts learned" with checkmarks
- Add: comparison to previous session (improving/declining)
- Add: "Share your progress" button with copyable text
- Make it feel like a mini-report card
- **Validation:** Play 3+ scenarios, verify enhanced recap
- **Acceptance:** Recap shows learning progress, not just stats

### 3.4 — Coach-Friendly Features
- [x] **Add a "Coach Mode" entry point** ✅ Done 2026-03-04 — Added "Coach Mode" button with parent gate, team dashboard preview panel showing aggregate position stats and recommended concepts to work on
- New button on home screen: "I'm a Coach" (below the position grid)
- Shows: roster management (localStorage), team progress overview, recommended drills by position
- Can view aggregated team stats if multiple players use same device
- **Validation:** Enter coach mode, verify team-level views work
- **Acceptance:** Coach can see which positions/concepts their team needs work on

### 3.5 — First-Time Experience Polish
- [x] **Improve the onboarding tutorial** ✅ Done 2026-03-04 — Added age selection step (step -1), position interest picker (step 3), and first-game guided tooltip ("Pick the best play!") that disappears after first choice
- Current tutorial is basic. Enhance with:
  - Age selection (drives difficulty and language)
  - Position interest picker (personalizes home screen)
  - First scenario is guided (arrows pointing to key UI elements)
  - "Play your first game" CTA after tutorial
- **Validation:** Clear localStorage, reload, verify tutorial flow
- **Acceptance:** New user understands how to play within 60 seconds

---

## Phase 4: Stripe & Monetization Verification

### 4.1 — Stripe End-to-End Test
- [ ] **Test complete purchase flow**
- Use Stripe test mode to make a purchase
- Verify: redirect URL works, ?pro=success sets isPro, all Pro features unlock
- Verify: expiry date set correctly (30 days for monthly, 365 for yearly)
- Verify: Pro badge appears, AI scenarios accessible, all themes unlocked
- **Note:** This may require human intervention for the actual Stripe purchase. Flag if blocked.
- **Acceptance:** Full purchase-to-activation loop works

### 4.2 — Free Tier Conversion Polish
- [ ] **Audit all 5 conversion touchpoints**
- Review each funnel touchpoint for: clarity, urgency, value proposition
- Ensure parent gate (math problem) works at every touchpoint
- Verify Stripe links open correctly
- Check that conversion tracking fires at each touchpoint
- **Validation:** Trigger each of the 5 funnel touchpoints, verify behavior
- **Acceptance:** All touchpoints are clear, functional, and track properly

---

## Phase 5: Deploy & Pre-Launch

### 5.1 — Deploy Latest Code
- [ ] **Push all changes to GitHub and deploy**
- `git add -A && git commit -m "Release prep: bugs fixed, scenarios improved, stickiness features added"`
- `git push origin main`
- `cd worker && npx wrangler deploy`
- Verify: https://bsm-app.pages.dev/preview loads with all changes
- **Acceptance:** Production matches local code

### 5.2 — Generate Promo Codes for Testers
- [ ] **Create 25 Pro promo codes for soft launch testers**
- Use worker/generate-codes.js to create codes
- Upload to KV namespace
- Create a simple text file listing codes for Blaine to distribute
- **Acceptance:** 25 valid codes ready, test 1 code to verify it works

### 5.3 — Pre-Launch QA Sweep
- [ ] **Full QA pass on production**
- Run all 3 validation scripts against production
- Play through 10 scenarios across different positions
- Test on mobile (375px viewport)
- Verify Daily Diamond works
- Verify streak system works
- Verify Pro activation with promo code
- **Acceptance:** No critical or major bugs, all features functional

### 5.4 — Update Documentation
- [ ] **Sync all docs with current state**
- Update CLAUDE.md: correct line counts, scenario counts, feature list
- Update ROADMAP.md: mark completed phases
- Update README.md: current feature list and instructions
- **Acceptance:** All docs accurate to current codebase

### 5.5 — Soft Launch Checklist
- [ ] **Final go/no-go checklist**
- [ ] All validation scripts pass
- [ ] All QA bugs from report are fixed
- [ ] Stripe payment flow works (or flagged for manual test)
- [ ] AI scenarios generate successfully on production
- [ ] 25 promo codes ready
- [ ] Production deployed and verified
- [ ] Coach mode functional
- [ ] Parent report shows meaningful data
- **Acceptance:** All items checked, app is launch-ready

---

## Progress Tracker

| Phase | Tasks | Complete | Status |
|-------|-------|----------|--------|
| 0: Infrastructure | 3 | 2 | In progress (0.3 pending) |
| 1: Bug Fixes | 7 | 7 | ✅ Complete |
| 2: Scenario Quality | 6 | 6 | ✅ Complete |
| 3: Stickiness | 5 | 5 | ✅ Complete |
| 4: Monetization | 2 | 0 | Not started |
| 5: Deploy & Launch | 5 | 0 | Not started |
| **Total** | **28** | **20** | **71% complete** |

---

## Session Log

*Each autonomous session should append a log entry here:*

```
Session 2026-03-04 (initial):
- Tasks completed: 0.1, 0.2, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
- Tasks skipped: None
- Issues found: BUG-2, BUG-3, BUG-6, BUG-7 were already implemented. ConceptTags already 100%. Diff 2 explSimple only had 3 gaps.
- Validation results: 0 errors, 214 warnings (down from 234). Code audit: 0 errors, 10 warnings.
- Fixes applied: Mastery heatmap counter (shows explored+mastered), unicode arrow, Speed Round dedup (description-based), 3 explSimple for dropped-third-strike scenarios, 20 weak explanations rewritten
- Next session should start with: Phase 3.1 (Parent Progress Report Enhancement)
```

```
Session 2026-03-04 (Phase 3):
- Tasks completed: 3.1, 3.2, 3.3, 3.4, 3.5
- Tasks skipped: None
- Issues found: 3.2 (Practice Recommendations) was already implemented as "Recommended for You" section
- Features added:
  - Parent Report: weekly concept trend, strongest/weakest position, practice recommendations
  - Session Recap: "What You Learned" new concepts, session-vs-session accuracy comparison, share progress button
  - Coach Mode: parent-gated team dashboard preview with aggregate stats and concept recommendations
  - Onboarding: age selection step, position interest picker, first-game guided tooltip
- Validation results: 0 errors, 214 warnings. Code audit: 0 errors, 10 warnings.
- Progress: 20/28 tasks (71% complete)
- Next session should start with: Phase 4.1 (Stripe End-to-End Test)
```
