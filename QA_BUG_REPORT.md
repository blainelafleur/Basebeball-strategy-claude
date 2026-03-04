# Baseball Strategy Master — QA Bug Report

**Date:** March 4, 2026
**Tester:** Automated QA (Claude)
**URL:** https://bsm-app.pages.dev/preview
**Device:** Desktop (1280×727), also tested at 375px (iPhone) and 768px (tablet)
**Browser:** Chrome

---

## Summary

Exhaustive 11-phase QA test covering first load, home screen, all 15 position categories, 4 special modes, AI scenario generation, gamification systems, customization, auth, parent report, mobile responsiveness, and edge cases. **22+ scenarios played, all core flows tested.**

**Overall assessment:** The app is in strong shape. Core gameplay loop is polished, educational content is excellent, and the monetization flow is kid-friendly. The bugs found are mostly minor UX issues — no critical blockers.

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 Major | 2 |
| 🟡 Minor | 5 |
| 🟢 UX Improvement | 4 |
| 💡 Feature Idea | 3 |

---

## 🟠 Major Bugs

### BUG-1: Mastery Heatmap counter shows 0/46 despite learned concepts

**Steps to reproduce:**
1. Play several scenarios across multiple positions until concepts show 100% in the Concepts Learned panel
2. Open the Mastery Heatmap (🗺 Map button)
3. Observe the counter at top

**Expected:** Counter reflects concepts that have been fully mastered (e.g., "3/46 concepts mastered")
**Actual:** Shows "0/46 concepts mastered" even though multiple concepts display at 100% in the Concepts Learned panel and show check marks

**Impact:** Players who check the heatmap for progress feel like they aren't advancing. Discouraging for younger players especially.

---

### BUG-2: Sign Up form shows no validation error messages

**Steps to reproduce:**
1. Click the sign-up/account button from the home screen
2. Enter an invalid email (e.g., "notanemail")
3. Enter a short password (e.g., "short")
4. Click "Create Account"

**Expected:** Inline validation errors appear (e.g., "Please enter a valid email", "Password must be at least 8 characters")
**Actual:** Form submits silently with no visible error messages. No feedback to the user about what's wrong.

**Impact:** Users (especially kids) won't understand why sign-up isn't working. Could lead to frustration and abandonment.

---

## 🟡 Minor Bugs

### BUG-3: No toast/confirmation on Pro activation

**Steps to reproduce:**
1. Navigate to `?pro=success&plan=monthly`
2. Observe the home screen

**Expected:** A toast notification or banner confirms "Welcome to All-Star Pass!" or similar
**Actual:** Pro features silently activate. User must notice the absence of the play limit or presence of Pro badges to know it worked.

---

### BUG-4: Duplicate scenario in Speed Round

**Steps to reproduce:**
1. Start a Speed Round
2. Play through scenarios — watch for scenario #3 and #4

**Expected:** All 5 scenarios are unique
**Actual:** Scenarios 3 and 4 were identical: "On 3-1 with a runner on 1st" (batter category). Same situation, same options.

**Note:** May be a randomization edge case rather than a deterministic bug. Could not reproduce consistently.

---

### BUG-5: "Play →" shows literal unicode escape on mobile

**Steps to reproduce:**
1. View the app at 375px width (iPhone viewport)
2. Look at the "Recommended" section on the home screen

**Expected:** Arrow character renders properly: "Play →"
**Actual:** Shows "Play \u2192" as literal text instead of the arrow symbol

**Note:** Only observed at mobile breakpoint. Desktop renders correctly.

---

### BUG-6: Share My Player Card button gives no visual feedback

**Steps to reproduce:**
1. Open Stats panel (📊 Stats)
2. Scroll to bottom and click "📸 Share My Player Card"

**Expected:** Button text changes to "Copied!" or a toast confirms clipboard action
**Actual:** Button remains unchanged after click. No visual indication that anything happened. User doesn't know if the share worked.

---

### BUG-7: Challenge a Friend has no completion summary screen

**Steps to reproduce:**
1. Start "Challenge a Friend" mode from home screen
2. Complete all 5 scenarios
3. Observe what happens after the 5th scenario

**Expected:** A challenge-specific results screen showing score (e.g., "4/5 correct!") with a shareable challenge link
**Actual:** After the 5th scenario feedback, clicking "Next Challenge →" returns to the home screen with a generic "GREAT SESSION TODAY!" banner. No challenge-specific summary or share link is generated.

**Impact:** The core value proposition of "Challenge a Friend" (share link, compare scores) doesn't fully materialize.

---

## 🟢 UX Improvements

### UX-1: Dual naming system may confuse younger players

The player card simultaneously shows "Baseball IQ: 58 Rookie" and "Level All-Star" — two different rank systems displayed at the same time. For kids ages 6-10, this dual naming could be confusing. Consider unifying or clarifying the relationship between Baseball IQ tier and Level name.

---

### UX-2: No error handling for invalid challenge IDs

**Steps to reproduce:**
1. Navigate to `?challenge=INVALID_ID_12345`

**Expected:** A friendly error message like "Challenge not found! Start a new one?"
**Actual:** Silently loads the home screen with no feedback.

**Note:** No console errors thrown either — the invalid parameter is simply ignored.

---

### UX-3: Stats panel only shows 12 core positions

The Stats panel displays position stats for Pitcher, Catcher, 1B, 2B, SS, 3B, LF, CF, RF, Batter, Runner, and Manager — but omits Famous, Rules, and Counts categories. Players who play those categories can't see their accuracy for them.

---

### UX-4: "Explain More" button says "All-Star Pass" instead of "Pro"

On the post-answer feedback screen, the locked explanation button reads "Explain More (All-Star Pass)" — but elsewhere the subscription is sometimes called "Pro." The naming should be consistent throughout.

---

## 💡 Feature Ideas

### IDEA-1: Challenge completion share flow

When a player finishes a "Challenge a Friend" set, show a dedicated results card with their score and a one-tap "Copy Challenge Link" button. The friend receives a URL that loads the same 5 scenarios for direct comparison.

---

### IDEA-2: Scenario count documentation update

The app shows 584 total scenarios across position cards, but CLAUDE.md documents 460. The documentation should be updated to reflect the current count, or the discrepancy investigated.

---

### IDEA-3: Session Recap after Challenge mode

The Session Recap modal (which normally fires every 3 plays) could be adapted for Challenge mode to show challenge-specific stats like "You got 4/5 right! Your friend will need to beat 80%."

---

## What Works Well

These are **not bugs** — just calling out things that tested perfectly:

- **Core gameplay loop** is excellent. Scenarios are well-written, feedback is educational, and the green/yellow/red color system is immediately intuitive.
- **Field visualization** with 10 themes is beautiful. Night Game and World Series themes are standouts.
- **BRAIN Insights** (RE24 data, count tendencies, scoring probability) add real depth for older players.
- **Free tier conversion flow** is kid-friendly and respectful. "Ask a Parent About All-Star Pass" with the math gate is smart.
- **Daily Diamond Play** exempt from play limit — good retention hook.
- **Parent Report** with math gate protection works correctly and shows comprehensive data.
- **Mobile responsiveness** is solid at both 375px and 768px breakpoints.
- **Speed Round, Survival, and Season (Spring Training)** all function correctly with distinct mechanics.
- **AI Scenario Generation** works when triggered (Pro + 3 games played), with appropriate timeout handling and cancel button.
- **Achievement system** unlocks properly during gameplay (went from 4/15 to 6/15 during testing).
- **Streak system** correctly tracks in-session streaks (`str`) and displays in header.
- **Leaderboard** updates and displays weekly data correctly.

---

## Test Coverage Matrix

| Phase | Area | Status | Notes |
|-------|------|--------|-------|
| 1 | First Load & Onboarding | ✅ Pass | Tutorial flow works |
| 2 | Home Screen Audit | ✅ Pass | All elements render correctly |
| 3 | Core Gameplay (15 categories) | ✅ Pass | All positions playable |
| 4 | Speed Round | ✅ Pass | Minor: duplicate scenario |
| 4 | Survival Mode | ✅ Pass | Best streak tracked |
| 4 | Season (Spring Training) | ✅ Pass | Progress bar works |
| 4 | Daily Diamond | ✅ Pass | Exempt from play limit |
| 5 | AI Scenario Generation | ✅ Pass | Purple AI badge, timeout works |
| 6 | Streaks & Gamification | ✅ Pass | XP, levels, achievements work |
| 7 | Avatar & Customization | ✅ Pass | Pro gating on items works |
| 7 | Themes | ✅ Pass | All 10 themes switch correctly |
| 8 | Sign Up / Auth | ⚠️ Bug | No validation errors (BUG-2) |
| 9 | Parent Report | ✅ Pass | Math gate + report render well |
| 9 | Upgrade Panel | ✅ Pass | Stripe links present, pricing shown |
| 10 | Mobile (375px) | ✅ Pass | Minor: unicode arrow (BUG-5) |
| 10 | Tablet (768px) | ✅ Pass | Layout adapts well |
| 11 | Invalid challenge URL | ⚠️ UX | No error message (UX-2) |
| 11 | Free tier play limit | ✅ Pass | Locks at 8 plays, good upsell |
| 11 | Share Player Card | ⚠️ UX | No click feedback (BUG-6) |
| 11 | Challenge a Friend | ⚠️ UX | No completion summary (BUG-7) |

---

*Report generated from exhaustive automated QA testing on March 4, 2026.*
