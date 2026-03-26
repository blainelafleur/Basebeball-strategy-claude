# BSM Launch Kit
## Everything You Need to Start Getting Users

**Date:** 2026-03-19
**App URL:** https://bsm-app.pages.dev

---

## PROMO CODES (All Seeded to Cloudflare KV)

### For Coaches (30-day All-Star trial)
```
COACH-BPYSGC    COACH-BMTHNS    COACH-6EWHH9    COACH-D2LML9    COACH-E7P2BF
COACH-UBR4VM    COACH-W29DDE    COACH-46ZQUB    COACH-4NEBZA    COACH-JQM5T9
```

### For Families (30-day All-Star trial)
```
FAMILY-UBDQLP   FAMILY-LCFQS2   FAMILY-6DW6EH   FAMILY-4FG6AZ   FAMILY-DNUHXL
FAMILY-REBACB   FAMILY-SUSLAZ   FAMILY-TK8F9C   FAMILY-Z3NUKQ   FAMILY-LYX7T5
```

### Internal Testing (Lifetime)
```
BSM-Z3WZZA   BSM-A2P5MH   BSM-HLFWD7   BSM-PCF8NP   BSM-X6SF5A
```

**How to redeem:** In the app, tap the All-Star upgrade section → scroll to "Have a promo code?" → enter code → tap Redeem.

---

## OUTREACH MESSAGES

### Message for Coaches
> Hey [Coach Name],
>
> I built a free baseball strategy app that teaches game IQ to players ages 6-18. It has 644 real game situations across all 15 positions — catchers, shortstops, batters, managers, everything.
>
> Players read a game situation, pick the best play from 4 options, and get instant feedback explaining WHY their choice was good or bad. It has survival mode, speed rounds, and a season mode.
>
> Would your team try it for a week? Here's a free 30-day All-Star code that unlocks everything: **[CODE]**
>
> App: https://bsm-app.pages.dev
>
> I'd love your honest feedback — what works, what doesn't, what your players think. Reply here or text me anytime.

### Message for Families
> Hey [Parent Name],
>
> My son and I built a baseball strategy game — it teaches kids real game IQ through interactive situations. Think Duolingo but for baseball decisions.
>
> It's free to play (8 challenges/day), works on any phone or tablet, and covers ages 6-18 with age-appropriate difficulty. Kids pick the best play and learn WHY from every answer.
>
> Would [Kid's name] try it? Here's a free code for the full version: **[CODE]**
>
> App: https://bsm-app.pages.dev
>
> Would love to know what they think — especially which positions they play most and if they learn anything new.

### Short Version (for texts/DMs)
> Built a free baseball IQ app — 644 real game situations. Would your kid/team try it? Free All-Star code: [CODE]. Link: https://bsm-app.pages.dev

---

## QA CHECKLIST (Test Before Sending Codes)

Clear localStorage first: DevTools → Application → Local Storage → Delete `bsm_v5`

### Onboarding
- [ ] Fresh load shows onboard screen (name + age + position picker)
- [ ] All 6 age groups visible with aspirational labels
- [ ] "Let's Play!" auto-starts first game with selected position
- [ ] Batter selection → actually shows a batter scenario (not catcher)
- [ ] No duplicate age picker appears

### Core Gameplay
- [ ] Play 3 scenarios — no repeat concepts in first 5
- [ ] Answer correctly — green "PERFECT STRATEGY!" + points + coach message
- [ ] Answer wrong — "LEARNING MOMENT" + best strategy shown
- [ ] Concept tag shows mastery progress (New/Introduced/Learning/Mastered)
- [ ] Key concept shows kid-friendly name if age 6-8 or 9-10

### Placement Test (set age to 13-15 or older)
- [ ] First time playing a position → 5 rapid-fire questions appear
- [ ] No explanation screens between placement questions
- [ ] Toast shows "Placement: [level]! X/5 correct"
- [ ] After placement, real scenarios start at placed difficulty

### Home Screen
- [ ] NEXT CHALLENGE hero button visible after 1+ games
- [ ] Plays remaining counter in header shows "X/8"
- [ ] Daily Diamond card visible and clickable
- [ ] Daily Mission card visible after 2+ games
- [ ] Position cards show mastery bars after 3+ plays
- [ ] Positions show "challenges" not "scenarios"

### Speed Round
- [ ] Timer is 30s for age 6-8, 15s for age 13+
- [ ] No Manager/Rules/Counts positions for age 6-8

### Survival Mode
- [ ] Difficulty stays at diff:1 for age 6-8 players
- [ ] No Manager positions for age 6-8

### Limit & Upsell
- [ ] After 8 plays, header shows "Tomorrow" in red
- [ ] "See Your Session Stats" button appears on home screen
- [ ] Daily Diamond still playable at limit

### All-Star Pass
- [ ] Header shows "ALL-STAR" not "PRO" when subscribed
- [ ] Promo code redemption works (test with BSM-Z3WZZA)
- [ ] Points show "(2x All-Star)" not "(2x Pro)"

### Themes & Graphics
- [ ] Switch between all 10 themes — weather effects render
- [ ] Crowd dots sway, banners wave
- [ ] Night theme has light cones, Winter has snowflakes

### Mobile
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] All buttons are tap-friendly (48px+ min height)
- [ ] Text readable at all ages

---

## FEEDBACK FORM QUESTIONS

Create a Google Form with these 6 questions:

1. **How old is the player?** (dropdown: 6-8, 9-10, 11-12, 13-15, 16-18, 18+)
2. **What position do they play?** (free text)
3. **How many sessions did they play?** (dropdown: 1, 2-3, 4-5, 6+)
4. **What did they like most?** (free text)
5. **What confused them or made them stop playing?** (free text)
6. **Would they play again tomorrow?** (dropdown: Yes / Maybe / No)

Optional bonus questions:
7. Would you pay $4.99/mo for unlimited play + AI coaching? (Yes / No / Maybe)
8. If you're a coach: would you assign this to your team? (Yes / No)
9. Anything else? (free text)

---

## LAUNCH SEQUENCE

1. **You (now):** Run the QA checklist on bsm-app.pages.dev
2. **You (today):** Create the Google Form with the 6 questions
3. **You (today/tomorrow):** Send coach messages to 5-10 coaches you know
4. **You (today/tomorrow):** Send family messages to 10-15 families you know
5. **You (day 2-3):** Check feedback form responses daily
6. **You (day 7):** Review metrics — day-2 return rate, session length, position distribution
7. **You (day 14):** Decision point — what to build next based on real data

---

## WHAT WAS SHIPPED (Phases 1-4 Summary)

| Phase | Key Changes |
|-------|------------|
| **Phase 1** | 3-tap onboarding (was 8), 6 age groups (was 4), vocab bug fixed, "challenges" not "scenarios" |
| **Phase 2** | Placement test for 11+, age-adjusted Speed Round timer, first-play diversity, Survival difficulty cap, joke option rewrites |
| **Phase 3** | PLAY NEXT hero button, plays-remaining counter, mastery progress on concept tags, All-Star naming, progressive disclosure |
| **Phase 4** | Daily missions, mastery bars on position cards, 99 explSimple text fixes, kid-friendly concept names |
| **Graphics** | Full-body player silhouettes, multi-stage play animations, weather effects per theme, umpire, base glow, jersey numbers |

---

*The app is ready. The codes are live. The only thing missing is players.*
