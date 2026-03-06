# QA Bug Fix Prompt for Claude Code

Copy everything below this line and paste into Claude Code:

---

Read `CLAUDE.md` and `QA_BUG_REPORT.md` first, then fix all bugs below in `index.jsx`. This is a single-file React app (~12,000 lines). Work through each fix one at a time, verify you're editing the right code, and commit after all fixes are done.

## FIX 1 — 🟠 Mastery Heatmap counter shows 0/46 (MAJOR)

**Problem:** Around line ~10736, `totalMastered` is calculated as:
```js
const totalMastered = Object.values(cm).filter(c => c.state === "mastered").length
```
But the concept map (`cm`) objects may never have their `.state` set to `"mastered"` even when the player has seen/completed them at 100%. The Concepts Learned panel shows concepts at 100%, but the heatmap `cm` state doesn't match.

**Fix:** Find where concept mastery state is determined and ensure concepts that reach 100% (or meet the mastery threshold) get `state: "mastered"` written into the concept map. Alternatively, recalculate `totalMastered` based on actual player progress data (e.g., from `stats.ps` position stats or completed scenarios) rather than relying solely on `cm.state`. Trace the data flow from gameplay → concept tracking → heatmap rendering to find the disconnect.

---

## FIX 2 — 🟠 Sign Up form has no validation errors (MAJOR)

**Problem:** Around lines ~9066-9070, the Sign Up form calls `onSignup()` but shows no inline validation messages for invalid email or passwords under 8 characters. The `handleSignup` function (around line ~10119) sets `authError` on server errors but there's no client-side validation before the fetch call.

**Fix:** Add client-side validation before calling `onSignup()`. In the `SignupScreen` component:
1. Validate email format with a basic regex (`/\S+@\S+\.\S+/`)
2. Validate password length >= 8 characters
3. Validate first name is not empty
4. Show inline red error text below the relevant field (e.g., "Please enter a valid email", "Password must be at least 8 characters")
5. Only call `onSignup()` if all validations pass
6. Add a `signupErrors` state object to track per-field errors

---

## FIX 3 — 🟡 No toast on Pro activation

**Problem:** Around line ~9269, the Pro activation handler for `?pro=success` already has a `setToast()` call inside a `setTimeout`. But during testing, no toast appeared.

**Fix:** Check if the toast is being overwritten or if `setToast` is being called before the component is ready. The `setTimeout` is 500ms — verify the toast state isn't cleared by another effect. Also verify `snd.play('ach')` isn't erroring silently and blocking the toast. Add a `console.log` temporarily to confirm the code path executes, then fix whatever is preventing the toast from rendering.

---

## FIX 4 — 🟡 Duplicate scenarios in Speed Round

**Problem:** Around lines ~10198-10211, `startSpeedRound` picks 5 positions randomly from the pool with NO deduplication:
```js
for(let i=0;i<5;i++) positions.push(pool[Math.floor(Math.random()*pool.length)]);
```
Then `getRand(p)` picks a random scenario for each position — but if the same position appears twice, you can get the same scenario.

**Fix:** Add deduplication to the scenario selection. After picking positions, ensure `getRand` returns unique scenario IDs for the 5 rounds. Something like:
```js
const usedIds = new Set();
// In the loop where scenarios are assigned:
const s = getRand(p, usedIds);  // pass used IDs to exclude
usedIds.add(s.id);
```
Or alternatively, deduplicate at the position selection level by shuffling and slicing instead of random-with-replacement.

---

## FIX 5 — 🟡 "Play →" shows literal unicode on mobile

**Problem:** Somewhere in the Recommended section on the home screen, there's a string using `\u2192` that isn't being interpreted as a unicode character — it renders as the literal text `\u2192` instead of `→`.

**Fix:** Search for `\u2192` or `\\u2192` in the JSX. If the string is built with template literals or string concatenation where the escape isn't processed, replace `\u2192` with the literal `→` character, or use `{"\u2192"}` inside JSX properly. The issue likely comes from a string being double-escaped or defined in a data structure where JS doesn't process the escape.

---

## FIX 6 — 🟡 Share My Player Card gives no feedback

**Problem:** Around lines ~10711-10716, the Share button calls `generatePlayerCard()` which either uses `navigator.share` or triggers a download. But there's no visual feedback — no "Copied!" state, no toast.

**Fix:** Add feedback after the share/download action:
1. After `navigator.share` resolves (or after the download link click), show a toast: `setToast({e:"📸",n:"Player Card Ready!",d:"Saved to downloads"})` and `setTimeout(()=>setToast(null),3000)`
2. Optionally change the button text briefly to "✅ Saved!" using local state
3. Handle the case where `generatePlayerCard` might fail silently

---

## FIX 7 — 🟡 Challenge a Friend has no completion summary

**Problem:** Around lines ~9462-9479, when the challenge pack finishes (all 5 done), it sets `challengePack.done = true` and submits to the server. But the UI doesn't render a dedicated challenge results screen. After the 5th answer's feedback, clicking "Next" just goes home.

**Fix:** Add a Challenge Results screen that renders when `challengePack?.done === true`. It should show:
1. "Challenge Complete!" header
2. Score: "You got X/5 correct! (Y points)"
3. If creator: a "Share Challenge Link" button that calls `shareChallengeLink(challengePack.id)`
4. If challenger: comparison with creator's score ("You: X pts vs Creator: Y pts — You Win/Lose!")
5. "Play Again" and "Home" buttons
6. Render this screen in the main App component's screen routing logic, checking for `challengePack?.done` before showing the normal home/game screens.

---

## FIX 8 — 🟢 No error handling for invalid challenge IDs

**Problem:** Around lines ~9250-9266, when `?cpk=INVALID_ID` is in the URL, the fetch to `/challenge/get` either returns `d.ok: false` or throws — but both cases silently do nothing. The `.catch(()=>{})` swallows errors.

**Fix:** Add error handling:
```js
.then(d => {
  if (d.ok) {
    // existing logic...
  } else {
    setToast({e:"⚠️", n:"Challenge Not Found", d:"This challenge link may have expired."});
    setTimeout(() => setToast(null), 4000);
  }
})
.catch(() => {
  setToast({e:"⚠️", n:"Couldn't Load Challenge", d:"Check your connection and try again."});
  setTimeout(() => setToast(null), 4000);
});
```

---

## FIX 9 — 🟢 Stats panel missing Famous, Rules, Counts categories

**Problem:** Line ~3852 defines `ALL_POS` with only 12 positions:
```js
const ALL_POS = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField","batter","baserunner","manager"];
```
The Stats panel iterates over `ALL_POS` and omits `famous`, `rules`, and `counts`.

**Fix:** Either:
- (A) Add `"famous","rules","counts"` to `ALL_POS` (if they should appear everywhere), OR
- (B) Create a separate `STATS_POS` array that includes all 15 and use it only in the Stats panel rendering (around line ~10700). Option B is safer — it avoids changing game mode behavior that relies on `ALL_POS` for the 12 core positions. Add them in a visually separate "Bonus Categories" section below the core positions.

---

## FIX 10 — 🟢 Standardize "Pro" vs "All-Star Pass" naming

**Problem:** The subscription is called "All-Star Pass" in kid-facing UI (upgrade panel, parent report, Explain More button) but "Pro" in code (`isPro`, `PRO+` badge). This is inconsistent.

**Fix:** Standardize all user-facing text to "All-Star Pass". Search for these patterns and update:
- `PRO` badge text → `ALL-STAR` or keep as `PRO+` if it's a short badge (this one is fine)
- `"Pro"` in any user-facing string → `"All-Star Pass"` or `"All-Star"` for short contexts
- Keep code variable names as `isPro` — only change display strings
- The key places to check: header badges, upgrade panel, gated feature buttons, toast messages

---

## FIX 11 — Update CLAUDE.md scenario count

**Problem:** `CLAUDE.md` documents 460 scenarios but the app shows 584. Count the actual scenarios in the SCENARIOS object and update the documentation.

**Fix:** Count each category array's `.length` in the SCENARIOS object. Update the "Scenario Counts" section and the total in CLAUDE.md to match reality.

---

## After all fixes:

1. Do a quick scan for any other instances of `\u2192` being used as literal text
2. Verify no regressions in the hot paths (scenario selection, scoring, streak tracking)
3. Commit with message: "Fix QA bugs: heatmap counter, signup validation, speed round dedup, challenge flow, UX polish"
