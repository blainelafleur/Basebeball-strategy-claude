# Baseball Brain UX/Code Audit

**Date:** 2026-03-20
**Scope:** All 11 Brain tabs in `src/08_app.js` (lines 3075-4062, ~987 lines)
**Perspectives:** 13-year-old player, UX designer, baseball coach

---

## Table of Contents

1. [Overall Brain Experience](#overall-brain-experience)
2. [Tab-by-Tab Analysis](#tab-by-tab-analysis)
   - [RE24 Explorer](#tab-1-re24-explorer)
   - [Count Dashboard](#tab-2-count-dashboard)
   - [Pitch Lab](#tab-3-pitch-lab)
   - [Concept Map](#tab-4-concept-map)
   - [Steal Calculator](#tab-5-steal-calculator)
   - [Pitch Count Tracker](#tab-6-pitch-count-tracker)
   - [Win Probability](#tab-7-win-probability)
   - [Matchup Analyzer](#tab-8-matchup-analyzer)
   - [Park Factor Explorer](#tab-9-park-factor-explorer)
   - [Defensive Positioning](#tab-10-defensive-positioning)
   - [Famous Moments](#tab-11-famous-moments)
3. [Prioritized Improvement Plan](#prioritized-improvement-plan)

---

## Overall Brain Experience

### Navigation

**Tab strip (line 3115-3120):** The horizontal scrollable strip with 9-11 tabs works mechanically, but has problems:

- **Discoverability of off-screen tabs.** On a 375px phone, roughly 4-5 tabs are visible. Tabs 6-11 (Fatigue, Win%, Matchup, Parks, Defense, History) are invisible unless the kid scrolls right. There is no scroll indicator, no fade edge, and no "more" affordance. A 13-year-old will likely never discover the later tabs unless they accidentally swipe.

- **No scroll-to-active behavior.** If the user deep-links into tab 9 (Parks) from a Daily Fact, the tab strip does not auto-scroll to show the active tab. The highlighted tab is off-screen.

- **Tab button size.** Each tab button has `padding: 6px 10px` with fontSize 10. The total height is roughly 30-32px. Apple HIG recommends 44px minimum for mobile touch targets. These tabs are too small for a kid's finger, especially on the bounce of a school bus.

- **No mastery rings.** The BASEBALL_BRAIN_PLAN.md describes mastery progress rings on each tab icon (Section 15.2). These are not implemented. Without them, there is no visual pull to explore unvisited tabs.

### Onboarding

**There is zero first-visit guidance.** When a kid taps "Baseball Brain" from the home screen, they land on the RE24 Explorer tab with an empty diamond and the number "0.11" (or stars for young players). There is no tooltip, no coach prompt, no "Tap a base to put a runner on!" nudge. The BASEBALL_BRAIN_PLAN.md calls for this (Section 1 describes "teaser hooks" and Section 15 describes gamification), but none is implemented.

**The subtitle "Explore the hidden math of baseball" (line 3111) is too abstract** for a kid. It does not tell them what to DO. Compare with "Tap a base and see what happens!" which gives an immediate action.

### Flow Between Tabs

**No cross-tab deep links exist.** The plan (Section 14, integration table in IDEAS_AND_INSIGHTS.md lines 449-463) describes an extensive deep-link system where tapping "Steal" in RE24 pre-loads the Steal Calculator, or tapping a count in Count Dashboard opens Pitch Lab. None of this is implemented. Each tab is a dead end.

**No connection to the quiz.** The plan describes "Test yourself" buttons on every tab (Section 14.6) and "Explore" deep links from quiz explanations (Section 14.1). Neither exists. The Concept Map's "Practice This" button (line 3635) is the single exception -- it does jump to a quiz scenario. This should be the model for all tabs.

### Consistency

The 11 tabs share a common visual language (dark backgrounds, colored accents per tab, similar font sizes, consistent spacing), but there are inconsistencies:

- **Headers:** Some tabs use `fontFamily:"'Bebas Neue'"` at fontSize 16 (RE24, Counts, Pitch Lab, Steal, Pitch Count, Win%, Matchup, Park, Defense, History). Concept Map also uses it. Consistent.
- **Detail panels:** RE24 has inline delta badges. Counts has a slide-up detail card. Pitch Lab has expandable pitch cards. No shared component. Each feels slightly different.
- **Empty states:** Count Dashboard has an explicit empty prompt ("Tap a count to see detailed stats," line 3342-3344). RE24 has no empty prompt. Pitch Lab has none. Steal Calculator jumps straight to sliders. Inconsistent.
- **Color semantics:** Green = good, red = bad is mostly consistent. But in RE24, green means "high run expectancy" (good for offense), while in Matchup Analyzer, green means "low BA" (good for pitching). The frame of reference flips without signaling.

### Engagement Hooks

**What makes a kid come BACK to Brain?**

Currently: very little. There is no IQ score displayed, no achievement unlocks, no challenges, no streaks. The `trackBrainVisit` function (line 3078-3086) silently increments visit counts and a brainIQ number, but this number is never shown to the user anywhere. The IQ calculation logic (line 3083) is also buggy -- the ternary condition `(p.brainIQ||0)>=(Object.values(be).filter(v=>v.visited).length*5)` always evaluates to the `p.brainIQ||0` branch after the first visit, meaning IQ never increases beyond the first visit's value.

The Daily Brain Fact on the home screen (lines 1972-2005) is the single best engagement hook. It rotates 20 facts, deep-links to specific tabs with pre-loaded state, and is genuinely interesting. But `brainFactIdx` only changes when explicitly updated -- there is no daily rotation logic. The same fact shows every session until something else changes it.

---

## Tab-by-Tab Analysis

### Tab 1: RE24 Explorer

**Lines:** 3122-3248 (~126 lines)

**A. First-impression clarity:** A 13-year-old sees an empty diamond, "0.11" in green, and the label "Expected Runs." The diamond is visually clear. But there is no instruction to tap the bases. A kid who does not already know what "run expectancy" means will stare at "0.11" and have no idea what to do. The young-player mode shows stars instead ("Chance to Score"), which is better, but still has no call-to-action.

**B. Information hierarchy:** The RE24 number (fontSize 36) is the visual anchor. Good. The "What If?" buttons below it are the primary interaction. The Scoring Probability overlay is discoverable only if runners are placed. The full RE24 matrix (vocabTier 4+) is below the fold. Hierarchy is reasonable.

**C. Interaction feedback:** Tapping a base toggles a runner (green diamond fills). The RE24 number updates instantly. The delta badge ("+0.62") appears after a "What If?" action. The action message appears below. Feedback is present but lacks animation -- the number snaps, it does not count up/down. The `rePrevRE` state (line 103) is set but never read in the render. The planned smooth number animation is missing.

**D. Mobile usability:** The mini diamond is 180x140 CSS pixels. The base tap targets are 12x12 SVG units (rotated 45 degrees), translating to approximately 17px diagonal. This is far below the 44px minimum. A kid on a phone will struggle to tap bases accurately. The "What If?" buttons have `padding: 6px 12px` at fontSize 10 -- approximately 28px tall, also below minimum. The outs selector buttons are 28x28 CSS px, borderline.

**E. Educational value:** HIGH. The "What If?" buttons transform a static number into a live sandbox. Tapping "Single" and watching RE24 change teaches cause-and-effect. The steal break-even message is directly educational. The bunt cost message challenges conventional wisdom. The young-player stars simplification is thoughtful. However, the teaching is one-directional -- there is no "why" beyond the one-sentence message. No link to deeper exploration in other tabs.

**F. Visual polish:** The diamond SVG is clean but minimal. No field texture, no player sprites (the plan calls for Guy() components on bases). The color-coding (green/yellow/red on RE24 value) is good. The delta badge styling is consistent. The full RE24 matrix table is plain -- no heatmap coloring on cell backgrounds, just colored text. Looks functional, not premium.

**G. Age adaptation:** The isYoung branch replaces "Expected Runs" with "Chance to Score" and shows stars instead of decimals. "What If?" button labels change ("Hit!" vs "Single"). The full matrix is gated to vocabTier >= 4. The Scoring Probability overlay shows for all ages. This is solid. Missing: the plan's "6-8 Special Mode: Help the Runners Score!" game framing, and the 16-18 expert full-matrix-as-heatmap mode.

**Missing features from plan:** "Double" What-If button, "Build Your Inning" sandbox mode, comparison mode (side-by-side steal outcomes), number animation, Guy() sprites on bases, diamond background glow, connection between bunt/steal buttons and their respective tabs.

---

### Tab 2: Count Dashboard

**Lines:** 3251-3346 (~95 lines)

**A. First-impression clarity:** The 4x3 count grid is immediately recognizable to any baseball player. Each cell shows the count and a color (green/yellow/red). The empty-state prompt "Tap a count to see detailed stats" (line 3342-3344) is good -- this is the only tab with an explicit empty-state instruction. For young players, emoji faces replace stats. This tab has the best onboarding of any tab.

**B. Information hierarchy:** The grid itself is dominant. Good -- it invites interaction. The selected count's detail panel slides in below with stats. The perspective toggle (hitter/pitcher) is in the top-right corner at fontSize 9 -- easy to miss.

**C. Interaction feedback:** Tapping a count highlights it with a colored border and reveals the detail panel below. The transition is `all .2s`. The deselect behavior (tap again to close) is standard. Progression arrows show where the next pitch could lead. Feedback is clear and immediate.

**D. Mobile usability:** The grid uses `gridTemplateColumns: repeat(4, 1fr)`. On a 375px phone with padding, each cell is roughly 80px wide by ~60px tall. Touch targets are adequate. The detail panel's stat boxes use fontSize 7-9, which is quite small. The progression arrow badges are fontSize 9 with padding 3px 8px -- small but tappable.

**E. Educational value:** HIGH. The color-coded advantage system (hitter's count green, pitcher's count red) teaches the fundamental concept instantly. The perspective toggle is a powerful teaching tool -- seeing the same count from both sides builds empathy. The first-pitch deep dive section (vocabTier >= 3) teaches a specific, actionable lesson. The progression arrows visually connect counts, teaching that each pitch changes the balance of power. This is arguably the best-designed educational tab.

**F. Visual polish:** Clean grid layout. Consistent color theming. The detail panel is well-structured with stats grid + advice text + progression arrows. The first-pitch section has nice styling. Overall feels polished. Missing: cell size proportional to count frequency (plan spec), heat map animation, count journey animated mode.

**G. Age adaptation:** Young players see emoji faces (happy/worried/neutral) instead of BA numbers. The perspective toggle is hidden for vocabTier < 3 (ages 6-10). Stats grid appears at vocabTier >= 2. Progression arrows at vocabTier >= 3. First-pitch deep dive at vocabTier >= 3. Walk rates at vocabTier >= 3. This is granular and well-thought-out. Concern: the perspective toggle should appear earlier (vocabTier >= 2) with simpler language, per the IDEAS_AND_INSIGHTS.md note.

---

### Tab 3: Pitch Lab

**Lines:** 3348-3476 (~128 lines)

**A. First-impression clarity:** The tab opens with a 2x4 grid of pitch type cards. Each shows a name and velocity. The "Build a Sequence" button appears for vocabTier >= 3. For young players, only 3 pitches show (fastball, changeup, curveball) with labels like "Fast!" and "Curvy!" This is clear and inviting.

**B. Information hierarchy:** The pitch card grid is dominant. The sequencing builder (when active) takes over the top of the screen. The selected pitch detail panel appears below the grid. The Eye Level Principle, Catcher Framing, and Run Value Leaderboard sections stack below. On mobile, a lot of content is below the fold. The sequencing builder's scored result is well-highlighted.

**C. Interaction feedback:** Tapping a pitch card highlights it with a red border. In sequencing mode, tapping adds the pitch to the sequence with a numbered badge. The real-time tip ("After fastball, best follow-up is changeup") is excellent -- it provides immediate guidance during the interaction. The sequence score calculation is instant with per-pitch breakdowns.

**D. Mobile usability:** The 2x2 pitch card grid on mobile gives roughly 170px-wide cards with padding 8px. Adequate touch targets. The "Build a Sequence" button at fontSize 9 with padding 4px 10px is approximately 24px tall -- too small. The run value leaderboard bars are fine.

**E. Educational value:** VERY HIGH. The sequencing builder is a game within a tab. The scoring system (+3 for following recommendations, -1 for same pitch twice, +2 for eye level change) teaches pitch sequencing principles through play. The real-time tips during sequencing are where the learning happens. The eye level principle section with examples is directly applicable to pitching strategy. The run value leaderboard challenges the "throw harder" misconception. The catcher framing section teaches an underappreciated skill.

**F. Visual polish:** Pitch cards are compact and well-designed. The run value usage bars use colored gradients. The sequencing mode has a clear visual state change. The leaderboard bars are visually scannable. Missing: pitch movement SVG paths (the plan's centerpiece -- "a side-view SVG showing the pitch traveling from pitcher's hand to home plate"). Without trajectory visualization, the tab is data-only. The tunneling overlay visualization is also missing.

**G. Age adaptation:** 3 pitches for ages 6-8 (with "Fast!" labels), 5 for ages 9-10, all 8 for 11+. Sequencing builder at vocabTier >= 3 (3-pitch for 11-12, 5-pitch for 13+). Eye level principle at vocabTier >= 3. Catcher framing at vocabTier >= 4. Run value leaderboard at vocabTier >= 3. Well-layered. Missing: the plan's "throw" animation button and slow-motion toggle for young players.

---

### Tab 4: Concept Map

**Lines:** 3564-3642 (~78 lines)

**A. First-impression clarity:** Opens with a 4-stat progress dashboard (Mastered, Learning, Review, Ready) and a progress bar. Below that, domain filter pills and a scrollable concept list. For a new player, all concepts show as "unseen/locked." This can feel overwhelming -- 48+ items all showing lock icons. There is no prompt telling the kid what to do ("Play scenarios to start learning concepts!").

**B. Information hierarchy:** The progress dashboard is the clear focus -- big numbers with icons. Good. The domain filter pills provide navigational control. The concept list below is a flat list with mastery icons, not the "RPG skill tree" described in the plan. The hierarchy is: progress stats, then filtering, then browsing. This is functional but not exciting.

**C. Interaction feedback:** Tapping a concept expands an inline detail panel with domain, difficulty stars, prerequisites (with check/cross marks), mastery state, and a "Practice This" button. The detail panel is the best integration with the quiz in all of Brain -- it finds a matching scenario and launches directly into play. Feedback is clear.

**D. Mobile usability:** The concept list has `maxHeight: 400, overflowY: auto`. On a short phone, the list becomes a scrollable container inside a scrollable page -- nested scrolling is a mobile UX antipattern. Concept buttons are full-width with `padding: 6px 8px` -- adequate touch targets. Domain filter pills are `padding: 3px 8px` at fontSize 9 -- approximately 22px tall, too small.

**E. Educational value:** MEDIUM. The progress dashboard motivates ("3 concepts ready to unlock!"). The prerequisite chain view teaches that knowledge builds on itself. The "Practice This" button creates a direct learning loop. But the flat list layout does not visually show how concepts connect. Without the tree/graph visualization from the plan, the prerequisite relationships are hidden inside each concept's detail panel rather than being the tab's organizing principle.

**F. Visual polish:** The progress dashboard is clean with colored badges. The domain filter pills use per-domain colors. The concept list items are functional but plain -- just text rows with icons. Compared to the plan's RPG skill tree with colored nodes, glowing connections, and pulse animations on unlockable concepts, this feels like a prototype list view. No mastery celebration animation exists.

**G. Age adaptation:** Young players see kid-friendly concept names (via CONCEPT_KIDS lookup). Concepts are filtered by ageMin. Domain filter and detail panel are available for all ages. The flat list layout actually works better for young players than a complex graph would. Missing: the plan's simplified list-by-domain view for ages 6-8 vs. full tree for 11+.

---

### Tab 5: Steal Calculator

**Lines:** 3478-3562 (~84 lines)

**A. First-impression clarity:** Opens with three labeled sliders (Pitcher Delivery Time, Catcher Pop Time, Runner Speed) and a race visualization below. The slider labels are clear. For young players, labels say "How fast does the pitcher throw home?" which is excellent. The preset buttons ("MLB Average," "Easy Steal," "No Chance") provide immediate starting points. This tab has the best onboarding after Count Dashboard.

**B. Information hierarchy:** The sliders are dominant, followed by the race visualization SVG, followed by the verdict ("SAFE!" or "OUT!"). The hierarchy matches the interaction flow: set inputs, see output. The break-even calculation, pitch clock toggle, presets, and pickoff panel are secondary information below the fold.

**C. Interaction feedback:** Dragging a slider immediately updates the race visualization bars, the verdict text, the margin number, and the estimated success percentage. The feedback is instantaneous and visual. The "SAFE!/OUT!" verdict at fontSize 18 is the payoff. The pitch clock toggle visibly changes the effective delivery time. This is the most satisfying feedback loop in Brain.

**D. Mobile usability:** The HTML range sliders are full-width and use `accentColor` for theming. Range inputs are notoriously imprecise on mobile (hard to set exact values), but the 0.05s step size means the kid does not need precision. The SVG race visualization uses `width: 100%` with a 300x60 viewBox -- responsive and clear. The preset buttons have `padding: 3px 8px` at fontSize 8 -- very small (approximately 18px tall). The pickoff panel's inline stats use fontSize 9 with small spacing.

**E. Educational value:** VERY HIGH. This is arguably the most "aha-generating" tab. Moving sliders and watching the race change teaches that stealing is MATH, not just speed. The break-even integration shows the RE24 threshold. The pitch clock toggle teaches modern rule impact. The pickoff risk panel teaches the 2-attempt rule. The young-player version ("Can the runner beat the ball?") is a natural framing.

**F. Visual polish:** The race visualization is effective but minimal -- two horizontal bars with no animation. The plan describes an animated race where both tracks fill simultaneously in real-time. Currently the bars are static (they reflect the time values but do not animate). The verdict styling is bold and color-coded. The overall layout is clean. Missing: the "bang-bang play" yellow flash, animated race, and the plan's difficulty classification labels.

**G. Age adaptation:** Young players see "How fast does the pitcher throw home?" labels, SAFE!/OUT! verdict only (no margin numbers). Break-even section is gated to vocabTier >= 3. Pitch clock details are gated. Pickoff risk shows for all ages (the numbers are universal). This is well-layered. Missing: the plan's "two runners racing" animation for ages 6-8 (no numbers at all).

---

### Tab 6: Pitch Count Tracker

**Lines:** 3644-3700 (~56 lines)

**A. First-impression clarity:** Opens with a huge pitch count number (fontSize 42) colored by fatigue zone, a zone label ("Fresh"/"Fading"/"Danger Zone"), and a range slider. Extremely clear. A kid immediately understands: drag the slider, see what happens. The youth pitch limits section shows "Your arm can throw 85 pitches per game" which is directly relevant and personal.

**B. Information hierarchy:** The big number is the undisputed focal point. The zone label below it provides context. The stats row (MPH drop, wOBA, rest days) is secondary. The youth limits section is tertiary. Excellent hierarchy.

**C. Interaction feedback:** Dragging the slider changes the number, color, zone label, MPH drop, wOBA, and rest days simultaneously. The color transitions through green -> yellow-green -> yellow -> orange -> red. This is satisfying and educational. The feedback is immediate.

**D. Mobile usability:** The range slider is 80% width, centered. Good. The stats row uses a 3-column grid -- each cell is roughly 100px wide on mobile, adequate. The youth limits grid uses `gridTemplateColumns: repeat(3, 1fr)` for 6 age ranges -- this creates a 3x2 grid that is compact. Touch targets are acceptable.

**E. Educational value:** HIGH. The velocity drop number directly teaches why starters get pulled ("your fastball loses 2.1 mph after 90 pitches"). The youth limits section is the most practically useful feature in all of Brain -- parents and coaches actually need this information. The rest day calculator is directly actionable. The TTO integration (vocabTier >= 3) teaches why the 3rd time through the order is dangerous.

**F. Visual polish:** The big number + zone label is bold and effective. But the plan describes a semicircular speedometer gauge with five color zones and a draggable needle. The current implementation is a number + slider, which is functional but far less visually impressive than a gauge. The plan's "outer ring showing TTO compounding" is also missing. The youth limits grid is clean but basic.

**G. Age adaptation:** Young players see "Your Pitch Limit" with a personalized message ("Your arm can throw 50 pitches today"). Older players see the full grid of all age ranges. TTO selector is gated to vocabTier >= 3. Well-layered. Missing: the plan's "should I pull the pitcher?" decision tool (mini quiz).

---

### Tab 7: Win Probability

**Lines:** 3702-3773 (~71 lines)

**A. First-impression clarity:** Opens with a large WP percentage (fontSize 48) or emoji face for young players, followed by inning selector buttons and score differential buttons. The layout is clear: pick inning and score, see win probability. Young players see happy/neutral/worried faces, which is intuitive.

**B. Information hierarchy:** The big WP number is dominant. The inning and score selectors are secondary controls. The "WP Across Innings" bar chart and LI bar section are below the fold for vocabTier >= 3. The RE24-vs-WP divergence section is toggled by a button. Hierarchy is good but the selectors need more visual weight -- they look like secondary elements when they are the primary interaction.

**C. Interaction feedback:** Tapping an inning button or score diff button immediately updates the WP number and (if visible) the bar chart. The color transitions (green/yellow/red) on the WP number provide feedback. The Leverage Index section highlights the selected inning. Feedback is present.

**D. Mobile usability:** The inning selector uses 9 buttons in a flex row. On a 375px phone, each button is roughly 35px wide -- below 44px minimum but usable for a row of numbers. The score diff selector uses 7 buttons, roughly 45px each -- adequate. The bar chart uses `height: 100` for the chart area with flex columns -- works on mobile.

**E. Educational value:** HIGH. The core insight -- "being down 3 in the 7th = 11% win chance, while down 1 = 32%" -- is visceral when you can toggle between them. The Leverage Index section teaches WHY late-game decisions matter more. The RE24-vs-WP divergence section (vocabTier >= 4) is the most advanced teaching tool, explaining when "play for one run" beats "play for big inning." The clutch myth section challenges a common misconception.

**F. Visual polish:** The big WP number is bold. The bar chart is basic but effective -- colored gradient bars with percentage labels. The LI section is a clean row of boxes. The divergence section is text-heavy but well-organized. Missing: the plan's line graph showing WP curves across innings (the current bar chart shows discrete points, not a continuous line). Also missing: multi-line comparison mode (showing tied + up1 + down1 + down3 simultaneously).

**G. Age adaptation:** Young players see emoji faces instead of percentages. LI and divergence are gated to vocabTier >= 3/4. Clutch myth at vocabTier >= 4. The simplified WP graph is hidden for young players (vocabTier < 3). Missing: the plan's 3-data-point simplified graph for ages 9-10.

---

### Tab 8: Matchup Analyzer

**Lines:** 3775-3833 (~58 lines)

**A. First-impression clarity:** Opens with pitcher hand (LHP/RHP) and batter hand (LHB/RHB/Switch) selectors, then a large matchup card showing projected BA. The controls are immediately understandable -- pick two hands, see the result. For ages 11+, TTO and pitch count controls add complexity. This tab is gated to minAge 11.

**B. Information hierarchy:** The matchup card with the big BA number (fontSize 40) is dominant. The control panel is above it. The compound stacking bar chart is below. The switch hitter insight is at the bottom. Good hierarchy -- controls first, then payoff, then details.

**C. Interaction feedback:** Toggling pitcher/batter hand immediately updates the BA, the platoon edge text, and the recommendation. Adding TTO or changing pitch count updates the stacking chart. The color-coding on the BA number (green < .260, yellow .260-.280, red > .300) provides clear danger signals. Feedback is immediate and clear.

**D. Mobile usability:** The hand selector buttons use `flex: 1` within a 2-column grid. On mobile, each button is roughly 80px wide with padding 6px -- adequate. The TTO buttons use `flex: 1` in a row of 3 -- about 50px each. The pitch count slider is full-width. Touch targets are acceptable. The compound stacking bar chart uses flex rows with 70px labels -- fits on mobile.

**E. Educational value:** HIGH. The compound stacking visualization is the star -- watching the BA bar extend as you add platoon disadvantage, then TTO, then fatigue teaches why managers make pitching changes. The switch hitter insight explains a concept most kids do not understand. The recommendation text ("PULL THE PITCHER") makes the data actionable.

**F. Visual polish:** Clean layout. The matchup card with large BA number and colored border is visually strong. The stacking bar chart is effective and well-designed. The switch hitter section is appropriately highlighted. Missing: the plan's decision recommender with explicit thresholds (currently implicit in the recommendation text from `getMatchupData()`).

**G. Age adaptation:** Tab is hidden for ages < 11. For ages 11-12, only pitcher/batter hand shows (TTO and pitch count are gated to vocabTier >= 3). The switch hitter section appears for all visible ages. This is appropriate -- matchup analysis requires abstract thinking.

---

### Tab 9: Park Factor Explorer

**Lines:** 3835-3904 (~69 lines)

**A. First-impression clarity:** Opens with an 8-card grid of famous parks, each showing a park factor number and truncated name. Tapping a card reveals park info, strategy adjustments, wind effects, surface effects, and altitude data. The big colored numbers (120 for Coors, 95 for Petco) are immediately scannable. However, the kid needs to know what "park factor" means -- there is no explanation.

**B. Information hierarchy:** The park grid is dominant. The selected park info panel is below. Wind, surface, and altitude sections stack below that. On mobile, a lot of content is below the fold. The park factor numbers are visually strong but the grid labels are truncated to first word only (fontSize 7) -- "Coors" "Great" "Fenway" -- "Great" is not recognizable.

**C. Interaction feedback:** Tapping a park card sets the park type (hitters/pitchers/neutral) and updates the info panel below. The wind direction toggle immediately changes the pitcher strategy text. Feedback is present but the park selection logic has a problem: tapping "Fenway" (hitters) selects ALL hitter parks and shows the first one. The selection is by TYPE, not by individual park. You cannot compare Coors vs Fenway -- tapping either one shows the same hitters-park data.

**D. Mobile usability:** The park grid uses `gridTemplateColumns: repeat(4, 1fr)` -- 8 cards in 2 rows of 4. On a 375px phone, each card is roughly 85px wide. Touch targets are adequate. The wind direction buttons use `flex: 1` in a row of 3 -- about 100px each. Good.

**E. Educational value:** MEDIUM. The core lesson (some parks favor hitters, others favor pitchers) comes through. The wind and surface sections teach practical adjustments. The Coors Field altitude deep dive is genuinely interesting. But the strategy adjustments (steal value, bunt cost, IBB risk) show raw adjustment numbers (+2, -3) without context for what those numbers mean. Missing: the plan's temperature slider, individual park comparisons, and the teaching of HOW park factors change strategy.

**F. Visual polish:** The park grid cards are compact and color-coded. The info panel is clean. The surface comparison grid is effective (grass vs turf side-by-side). The wind section is text-heavy. The altitude section is data-oriented. Missing: a field visualization showing wind arrows (plan spec), temperature effects, and the "feel" of different parks.

**G. Age adaptation:** The park grid and basic info show for all ages. Strategy adjustments are gated to vocabTier >= 3. Altitude details at vocabTier >= 3. This is reasonable. Missing: the plan's simple "Some fields make it easier to hit home runs!" framing for ages 6-8.

---

### Tab 10: Defensive Positioning

**Lines:** 3906-3987 (~81 lines)

**A. First-impression clarity:** Opens with 6 preset buttons (Normal, DP Depth, Infield In, Guard Lines, OF Shallow, OF Deep) and a description of the selected alignment below. The presets make the tab immediately usable -- tap a button, read about it. This tab is gated to minAge 9.

**B. Information hierarchy:** The preset buttons are the primary interaction. The alignment info card is the payoff. The situation context section (for Infield In) and the "Infield-In Tradeoff" deep dive add analytical depth. The historical shift and OF arm value sections are at the bottom. Hierarchy follows the interaction flow well.

**C. Interaction feedback:** Tapping a preset button highlights it and updates the description, stats, and context below. The Infield In situation tool has runner/out toggles that update a "JUSTIFIED/NOT JUSTIFIED" verdict in real-time with color-coding. This interactive verdict is excellent feedback.

**D. Mobile usability:** The preset buttons wrap using `flexWrap: wrap`. On mobile, this creates 2 rows of 3 buttons. Each button has `padding: 5px 10px` at fontSize 9 -- approximately 26px tall, below minimum. The runner toggle buttons in the situation context are 24x24 -- also below minimum. The out buttons are also 24x24.

**E. Educational value:** HIGH. The "Infield In" justified/not justified tool is one of the best teaching features in Brain. It directly answers a question coaches and players debate constantly. The data (saves 0.30 runs, costs 0.50 runs, net -0.20) is eye-opening. The historical shift section teaches modern rule changes. Missing: the plan's draggable fielder positions and the visual field showing where players stand in each alignment. Without the field visualization, the tab is all text -- you have to imagine where the fielders are.

**F. Visual polish:** The preset buttons and alignment card are clean. The JUSTIFIED/NOT JUSTIFIED verdict card is visually striking with green/red coloring. The historical shift section is plain text. The OF arm value at the bottom is a single sentence (line 3985) -- feels like an afterthought. Missing: the plan's interactive field SVG with draggable Guy() sprites, conversion rate overlays, and throw-distance arrows.

**G. Age adaptation:** Tab is hidden for ages < 9. The situation context tool is gated to vocabTier >= 3. Historical shift at vocabTier >= 3. This is appropriate. Missing: the plan's presets-only mode for ages 9-10 (currently presets are the ONLY mode for all ages, so this is effectively implemented by default).

---

### Tab 11: Famous Moments

**Lines:** 3989-4060 (~71 lines)

**A. First-impression clarity:** Opens with a league trends ticker and 4 moment cards (Dave Roberts, Bonds IBB, Chapman fatigue, Bunting the shift). The cards show title, year, and game context. Tapping opens a detailed view with setup, data, a 3-option "What would you do?" quiz, and a reveal/analysis. This is the most narrative-driven tab and the most immediately engaging.

**B. Information hierarchy:** The moment list is dominant. The selected moment view has a clear sequence: setup, data, choices, reveal, analysis. The "Back to moments" navigation is clear. The BABIP teaching section at the bottom of the list view is a bonus. Hierarchy is excellent.

**C. Interaction feedback:** Tapping a moment card opens the detail view. Choosing an option reveals whether you matched the real decision with green/red feedback. The "What Actually Happened" reveal is the narrative payoff. The "Try Again" button allows replaying. Feedback is clear and satisfying.

**D. Mobile usability:** Moment cards are full-width. Option buttons are full-width with padding 8px 10px -- adequate touch targets. The "Back to moments" button is text-only at fontSize 10 -- small but functional. The BABIP grid uses 4 columns -- each roughly 80px wide on mobile, adequate.

**E. Educational value:** VERY HIGH. This tab teaches through storytelling, which is the most effective method for kids. Each moment connects data (WP, RE24, steal break-even) to a real dramatic decision. The "What would you do?" quiz creates personal investment before revealing the answer. The analysis section explains the numbers behind the story. This is the best teaching design in Brain. Missing: more moments (plan calls for 8-12, currently has 4) and deep links to relevant Brain tabs from the analysis.

**F. Visual polish:** The moment cards are clean. The detail view sections (setup, data, choices, reveal, analysis) use distinct color-coded panels. The BABIP section at the bottom is well-designed with a grid of contact types. Missing: Field visualization showing the game state (plan spec), animation on reveal.

**G. Age adaptation:** The data section is gated to vocabTier >= 3. The analysis section is gated to vocabTier >= 3. Young players see setup + choices + reveal but without the numbers. This is appropriate -- the stories work at any age. Missing: the plan's simplified story-only versions for ages 6-8 ("A famous player stole a base!").

---

## Prioritized Improvement Plan

### 1. CRITICAL Fixes (broken or confusing enough to lose users)

#### C1. Add first-visit onboarding for Brain
**Tab:** Overall
**Problem:** Zero guidance on first visit. A kid lands on RE24 Explorer with no idea what to do. The BASEBALL_BRAIN_PLAN.md calls for teaser hooks and guided first interactions.
**Fix:** Add a one-time tooltip overlay on first Brain visit: "Welcome to Baseball Brain! Tap a base to put a runner on, then watch the numbers change." Show for 4 seconds or until dismissed. Track via `brainExplored._onboarded` flag. Optionally, add a pulsing glow animation on the base diamonds as a "tap here" affordance.
**Effort:** ~25 lines

#### C2. Fix BrainIQ calculation bug
**Tab:** Overall (trackBrainVisit, line 3083)
**Problem:** The ternary condition `(p.brainIQ||0)>=(Object.values(be).filter(v=>v.visited).length*5)?p.brainIQ||0:Object.values(be).filter(v=>v.visited).length*5` is circular. After first tab visit, `brainIQ` becomes 5 and `visited.length*5` is also 5, so the condition is true and IQ stays at 5 forever. Additional tabs do not increase IQ.
**Fix:** Replace with: `const tabsVisited = Object.values(be).filter(v=>v.visited).length; const newIQ = tabsVisited * 5;` Then: `return {...p, brainExplored: be, brainIQ: Math.max(p.brainIQ || 0, newIQ)};`
**Effort:** ~3 lines changed

#### C3. Enlarge RE24 diamond base tap targets
**Tab:** RE24 Explorer
**Problem:** Base diamonds are 12x12 SVG units (~17px). Far below 44px minimum. Kids on phones will miss taps.
**Fix:** Add invisible hit areas around each base: `<rect x={x-8} y={y-8} width={28} height={28} fill="transparent" onClick={...}/>` or enlarge the entire diamond SVG from 180x140 to 240x180 and increase base elements proportionally.
**Effort:** ~10 lines changed

#### C4. Add scroll indicator/fade edge to tab strip
**Tab:** Overall navigation
**Problem:** Tabs 6-11 are invisible on mobile. No affordance that more tabs exist off-screen.
**Fix:** Add a right-fade gradient overlay on the tab strip container: `maskImage: linear-gradient(to right, black 85%, transparent 100%)`. Alternatively, add a small "scroll for more" text or arrow on first visit.
**Effort:** ~5 lines

#### C5. Fix park selection logic (selects TYPE, not individual park)
**Tab:** Park Factor Explorer
**Problem:** Tapping Coors or Fenway both set `parkType="hitters"`, showing the same generic hitters-park data. You cannot explore individual parks.
**Fix:** Change `parkType` state to `selParkIdx` or `selParkName`. Show the individual park's factor and city. Map the strategy adjustments to the park's type. Allow comparing parks.
**Effort:** ~15 lines changed

#### C6. Fix nested scrolling in Concept Map
**Tab:** Concept Map
**Problem:** The concept list has `maxHeight: 400, overflowY: auto`, creating a scrollable container inside the page's scrollable container. On mobile, this causes scroll-trapping where the user cannot scroll past the concept list.
**Fix:** Remove `maxHeight` and `overflowY`. Let the list extend to its natural height within the page scroll. If the list is long, use virtual scrolling or lazy rendering instead.
**Effort:** ~2 lines changed (remove maxHeight/overflowY)

---

### 2. HIGH-Impact UX Improvements (make it feel 2x better)

#### H1. Add "Build Your Inning" sandbox mode to RE24 Explorer
**Tab:** RE24 Explorer
**Problem:** The RE24 tab is a reference tool, not a game. The plan's "Build Your Inning" mode (start at 0 outs, bases empty; use What-If buttons to play through; track total runs; compare to average) is the single highest-engagement feature missing from Brain.
**Fix:** Add a "Play an Inning" toggle button. When active: track runs scored across the inning, show running total, at 3 outs display "Your inning scored X runs. Average: 0.47." Include a "Beat your best" high score.
**Effort:** ~60 lines

#### H2. Add animated number transitions on RE24, WP, Matchup BA
**Tab:** RE24 Explorer, Win Probability, Matchup Analyzer
**Problem:** Key numbers snap instantly when values change. The plan calls for smooth counting animation. This is the single most impactful "feel" improvement -- animating numbers makes the data feel alive.
**Fix:** Create a `NumberAnim` component using `useRef` + `requestAnimationFrame` that interpolates between old and new values over 400ms with ease-out. Use for RE24 value, WP percentage, and Matchup BA.
**Effort:** ~30 lines for component + ~10 lines per tab (40 lines total)

#### H3. Add cross-tab deep links
**Tab:** All tabs
**Problem:** Tabs are isolated. The plan describes an extensive deep-link system. Currently the only cross-tab link is Concept Map's "Practice This" button.
**Fix:** After each "What If?" action in RE24, show a "See the steal math" link when steal is used. In Count Dashboard, after viewing a count, show "What pitch should I throw?" link to Pitch Lab. In Steal Calculator, show "See the RE24 math" link. Create a shared `navigateBrain(tab, state)` function that sets `brainTab` and pre-loads state.
**Effort:** ~40 lines for navigateBrain + ~5 lines per tab (95 lines total)

#### H4. Show Baseball IQ score in the Brain header
**Tab:** Overall
**Problem:** The `brainIQ` score is calculated and stored but never displayed. There is no visible reward for exploring tabs.
**Fix:** Add an IQ badge next to the "BASEBALL BRAIN" header: `IQ: 25 / 200` with a circular progress ring. Show the IQ title ("Dugout Analyst"). Update on each tab visit.
**Effort:** ~20 lines

#### H5. Add "Test Yourself" buttons on every tab
**Tab:** All tabs (except Concept Map, which already has "Practice This")
**Problem:** Brain tabs are dead ends. After learning about steal math or win probability, there is no way to apply the knowledge.
**Fix:** Add a footer section on each tab: "Think you understand? [Test yourself]". Tapping finds a scenario tagged with the relevant concept (steal-breakeven, win-probability, pitch-sequencing, etc.) and launches into the quiz. After answering, return to the Brain tab.
**Effort:** ~30 lines for shared component + ~3 lines per tab (60 lines total)

#### H6. Add empty-state prompts to all tabs
**Tab:** RE24, Pitch Lab, Steal, Pitch Count, Win Prob, Matchup, Park, Defense, History
**Problem:** Only Count Dashboard has an explicit "Tap a count to see..." prompt. Other tabs dump the user into content with no guidance.
**Fix:** Add a one-sentence prompt at the top of each tab when no selection is active:
- RE24: "Tap a base to place a runner, then use the buttons below to see what happens."
- Pitch Lab: "Tap a pitch type to learn about it, or try the sequencing builder."
- Steal: (already has sliders as the default interaction, prompt not needed)
- History: "Pick a famous moment and decide what YOU would do."
**Effort:** ~15 lines total (1-2 lines per tab)

#### H7. Add pitch movement SVG visualization to Pitch Lab
**Tab:** Pitch Lab
**Problem:** The plan's centerpiece -- pitch trajectory visualization -- is entirely missing. Without it, Pitch Lab is a data table with cards instead of the "pitch workshop" it should be.
**Fix:** Add a side-view SVG (300x120) showing a pitch path from release point to plate. Each pitch type gets a unique `<path>` with SMIL animation. Add a "Throw" button that animates the path and a "Slow Motion" toggle.
**Effort:** ~80 lines (SVG paths + animation)

---

### 3. MEDIUM Polish (make it feel professional)

#### M1. Add mastery progress rings to tab icons
**Tab:** Overall navigation
**Problem:** Tab icons have no indication of exploration progress. The plan describes circular progress rings.
**Fix:** Wrap each tab icon in a small SVG circle arc showing exploration percentage: 0% = empty ring, 25% = visited, 50% = interacted, 75% = challenge done, 100% = all features explored. Derive percentage from `brainExplored[tab]`.
**Effort:** ~25 lines

#### M2. Add the "Double" What-If button to RE24 Explorer
**Tab:** RE24 Explorer
**Problem:** The plan specifies 8 action buttons; the code has 7. "Double" (clears bases, runners score per advancement rates) is missing.
**Fix:** Add a Double button: runners on 2nd/3rd score, runner on 1st goes to 3rd, batter to 2nd. Calculate new RE24 and display delta.
**Effort:** ~15 lines

#### M3. Add heatmap cell backgrounds to the RE24 full matrix
**Tab:** RE24 Explorer (vocabTier >= 4)
**Problem:** The full RE24 matrix table (line 3228-3247) uses colored text but white/transparent cell backgrounds. A heatmap with cell background gradients (green to red) would be far more scannable.
**Fix:** Add `background` style to each `<td>` based on the value: `rgba(34,197,94, val/2.5)` for green, `rgba(239,68,68, (2.5-val)/2.5)` for red.
**Effort:** ~5 lines changed

#### M4. Make Count Dashboard cell sizes proportional to count frequency
**Tab:** Count Dashboard
**Problem:** All 12 count cells are the same size. The plan says "cell size proportional to how often that count occurs." 0-0 occurs in 100% of plate appearances; 3-2 in ~15%.
**Fix:** Not practical with a grid layout, but can add a subtle "importance" indicator: an opacity gradient or a subtle badge showing frequency. Alternatively, add a `gridRow: span 2` for 0-0 to make it visually larger.
**Effort:** ~10 lines

#### M5. Add animated race to Steal Calculator
**Tab:** Steal Calculator
**Problem:** The race visualization is static horizontal bars. The plan describes bars that fill simultaneously in real-time.
**Fix:** Add a "Race!" button that triggers CSS animations: both bars animate from 0 to their final width over 2-3 seconds (scaled to real time). Use `@keyframes` or requestAnimationFrame.
**Effort:** ~30 lines

#### M6. Add semicircular gauge visualization to Pitch Count Tracker
**Tab:** Pitch Count Tracker
**Problem:** Currently a large number + slider. The plan describes a speedometer gauge with 5 color zones and a needle.
**Fix:** Add an SVG semicircle arc with 5 colored segments (green -> yellow-green -> yellow -> orange -> red). A needle rotates based on pitch count. The slider still controls the value but the gauge is the visual payoff.
**Effort:** ~40 lines

#### M7. Add accessibility indicators beyond color
**Tab:** Count Dashboard, RE24 Explorer, Win Probability
**Problem:** Hitter/pitcher/neutral count edges, RE24 good/bad, and WP states all rely on green/red/yellow color coding only. ~8% of boys have color vision deficiency.
**Fix:** Add secondary indicators: text labels ("Hitter's count" visible at all ages, not just young), directional arrows on delta badges, and/or pattern fills on chart bars.
**Effort:** ~15 lines total

#### M8. Scroll tab strip to active tab on deep link
**Tab:** Overall navigation
**Problem:** When deep-linking to a later tab (e.g., Parks from a Daily Fact), the tab strip does not scroll to show the active tab.
**Fix:** Add a `useEffect` that calls `scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'})` on the active tab button when `brainTab` changes. Requires a ref on each tab button.
**Effort:** ~10 lines

#### M9. Add daily rotation to Brain Facts
**Tab:** Home screen
**Problem:** `brainFactIdx` never changes automatically. The same fact shows every session.
**Fix:** In the stats loading logic, set `brainFactIdx` based on the current date: `Math.floor(Date.now() / 86400000) % BRAIN_FACTS.length`. Or increment on each new session.
**Effort:** ~3 lines

#### M10. Add more Famous Moments
**Tab:** Famous Moments
**Problem:** Only 4 moments exist. The plan calls for 8-12.
**Fix:** Add 4-8 more moments: Buckner's Error (1986), Maddon's Shift on Ortiz, Bonds IBB with bases loaded (this exists but could add the 2004 NL version), 2001 WS Game 7 bottom 9, Roberto Clemente's 3000th hit context, The Pine Tar Game, Merkle's Boner (for older kids).
**Effort:** ~40 lines (10 lines per moment)

---

### 4. NICE-TO-HAVE (amazing but not blocking)

#### N1. RPG skill tree visualization for Concept Map
**Tab:** Concept Map
**Problem:** Currently a flat list with domain filters. The plan describes an interconnected tree/graph with colored nodes, prerequisite lines, and pulse animations. This is the "wow factor" feature.
**Fix:** Replace the list with an SVG graph layout. Use a simple top-down tree algorithm: group by domain, position by prerequisite depth. Draw lines between prereq nodes. Color nodes by mastery state.
**Effort:** ~120 lines (tree layout algorithm is non-trivial)

#### N2. Pitch tunneling overlay in Pitch Lab
**Tab:** Pitch Lab
**Problem:** The plan's tunneling visualization (two pitches overlaid, showing where their paths diverge) is the most visually impressive teaching tool, but is missing.
**Fix:** When a pitch is selected, show a "Compare tunneling" button. Tapping shows two pitch paths overlaid in the same SVG, with a label at the divergence point: "By the time the hitter sees the difference, it's too late."
**Effort:** ~50 lines (on top of H7 pitch movement SVGs)

#### N3. Line graph for Win Probability across innings
**Tab:** Win Probability
**Problem:** Currently a bar chart showing discrete innings. The plan describes a continuous line graph with multiple lines for different score differentials.
**Fix:** Replace bars with an SVG `<polyline>` connecting WP values across innings. Add toggle buttons to show multiple score diffs simultaneously as colored lines. Add dots at each inning that show exact WP on tap.
**Effort:** ~60 lines

#### N4. Draggable fielder positions in Defensive Sandbox
**Tab:** Defensive Positioning
**Problem:** Currently preset-only with descriptions. The plan describes a top-down field where you drag fielders and see stats update in real-time.
**Fix:** Reuse the Field SVG. Add draggable Guy() sprites for 7 fielders. On drag, calculate distance from standard positions and update conversion rate estimates. Snap to preset positions on button tap.
**Effort:** ~100 lines (drag logic + field integration)

#### N5. Tab challenges for gamification
**Tab:** All tabs
**Problem:** No challenges exist. The plan describes one challenge per tab (e.g., "Build an inning that scores 4+ runs" for RE24, "Build a 5-pitch sequence scoring 12+ points" for Pitch Lab).
**Fix:** Add a "Challenge" button on each tab that presents a specific goal. Track completion in `brainExplored[tab].challengeDone`. Award IQ points and show a celebration animation on completion.
**Effort:** ~80 lines (shared challenge component + 11 challenge definitions)

#### N6. Brain streak tracking
**Tab:** Overall
**Problem:** No streak reward for returning to Brain daily. The plan describes a Brain-specific streak with avatar rewards.
**Fix:** Track consecutive days visiting Brain in `brainStreak`. Show streak count in the Brain header. At 7 days, unlock a Brain-themed avatar accessory. At 14 days, a profile badge.
**Effort:** ~20 lines

#### N7. Deep links from quiz explanations into Brain tabs
**Tab:** Quiz integration
**Problem:** After getting a question wrong, the enrichFeedback() insights mention RE24 or count data but do not link to Brain tabs. The plan (Section 14.1) describes tappable "[Explore RE24 -->]" links.
**Fix:** Add a `deepLink` field to enrichFeedback output objects. In the outcome screen, render deep links as tappable buttons that set brainTab + state and navigate to Brain.
**Effort:** ~40 lines (enrichFeedback changes + outcome screen rendering)

#### N8. Haptic feedback on mobile interactions
**Tab:** All tabs
**Problem:** No tactile feedback on tap. Modern mobile apps use subtle vibrations.
**Fix:** Add `navigator.vibrate?.(10)` on base toggle, What-If button tap, verdict display, mastery celebration. Check for API availability.
**Effort:** ~10 lines (scattered 1-line additions)

#### N9. "Youth League" preset in Steal Calculator
**Tab:** Steal Calculator
**Problem:** Only 3 presets (MLB Average, Easy Steal, No Chance). Youth leagues have different timing (no leads, shorter basepaths).
**Fix:** Add a "Youth League" preset with age-adjusted delivery, pop, and runner times from `levelAdjustments`.
**Effort:** ~5 lines

#### N10. Add age-adjusted RE24 disclaimer for bunting
**Tab:** RE24 Explorer
**Problem:** Bunt always shows negative RE24 (based on MLB data). But at youth level, bunting is often RE-positive because fielding is unreliable. BRAIN data acknowledges this in `levelAdjustments.levels.travelMiddle.buntNote`.
**Fix:** When vocabTier <= 3 and a bunt is tapped, add a footnote: "At your level, bunting works better than these MLB numbers suggest because fielders make more errors."
**Effort:** ~5 lines

---

## Summary Effort Estimate

| Priority | Items | Total Lines |
|---|---|---|
| CRITICAL | 6 items | ~60 lines |
| HIGH | 7 items | ~365 lines |
| MEDIUM | 10 items | ~195 lines |
| NICE-TO-HAVE | 10 items | ~490 lines |
| **TOTAL** | **33 items** | **~1,110 lines** |

### Recommended Execution Order

**Sprint A (Critical fixes + highest-impact):** C1, C2, C3, C4, C5, C6, H4, H6, M9 (~100 lines, 2-3 hours)
These are all small fixes that remove friction, fix bugs, and add missing affordances.

**Sprint B (Engagement and animation):** H1, H2, H3, H5 (~195 lines, 4-5 hours)
These transform Brain from a reference section into an interactive playground with game loops and cross-tab navigation.

**Sprint C (Visual upgrades):** H7, M5, M6, M1, M3, M7 (~195 lines, 4-5 hours)
These make Brain look premium: animated pitches, speedometer gauge, mastery rings, heatmaps, accessibility.

**Sprint D (Content and depth):** M2, M4, M10, N9, N10, N5 (~145 lines, 3-4 hours)
These add missing content (moments, Double button, challenges) and fix educational gaps (youth bunt disclaimer, count frequency).

**Sprint E (Advanced features):** N1, N2, N3, N4, N7 (~370 lines, 6-8 hours)
These are the "wow factor" features: skill tree, pitch tunneling, WP line graph, draggable fielders, quiz deep links.

---

## Key Takeaways

1. **The bones are excellent.** All 11 tabs are implemented, the data integration is thorough, and the age-adaptive layering is thoughtful across vocabTier levels. The Steal Calculator, Count Dashboard, and Famous Moments tabs stand out as particularly well-designed.

2. **The critical gap is onboarding and discoverability.** There is no first-visit guidance, no visible progress system, off-screen tabs are invisible, and the IQ score is calculated but never shown. These are the differences between "a feature that exists" and "a feature kids actually use."

3. **Cross-tab navigation is the biggest missed opportunity.** The plan describes an interconnected system where every tab links to others. Currently each tab is an island. Adding `navigateBrain()` and deep links would transform Brain from 11 separate tools into one coherent learning environment.

4. **Visual gaps are significant but not blocking.** Missing pitch trajectory SVGs, the speedometer gauge, the RPG skill tree, and draggable fielders are all features from the plan that would elevate Brain from "good data visualization" to "an experience kids talk about." These can be added incrementally.

5. **The educational design is strong.** The age-adaptive vocabulary, the "What If?" interaction pattern, the perspective toggles, and the Famous Moments quiz-style reveal all demonstrate thoughtful pedagogy. The data is there, the teaching moments are written -- the main work is making the interactions more discoverable and connected.
