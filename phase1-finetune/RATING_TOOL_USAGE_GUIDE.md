# Rating Tool — How to Use

## Setup (One Time, Takes 2 Minutes)

1. You received 3 files:
   - `rating-tool.html` — the rating tool (opens in your browser)
   - `SAMPLE_RATING_BATCH.json` — 10 practice scenarios
   - Your assigned batch file (e.g., `scenarios-to-rate-batch1.json`)

2. Save all files to the same folder on your computer (e.g., Desktop)

3. Double-click `rating-tool.html` to open it in your browser
   - Works in Chrome, Safari, Firefox, or Edge
   - No internet connection needed — everything runs locally
   - No account or login required

## Loading Scenarios

1. Click **"Choose File"** (or "Load scenarios") in the top-left
2. Select your JSON file (start with `SAMPLE_RATING_BATCH.json` to practice)
3. You'll see the first scenario appear with all its details

## Rating a Scenario

### Step 1: Read Everything
- Read the game situation at the top (inning, outs, score, runners)
- Read all 4 options (the green-bordered one is marked as "best")
- Read all 4 explanations below each option

### Step 2: Rate the 5 Dimensions
- Scroll down to **"Coach Rating (1-10)"**
- You'll see 5 rows with number boxes (1 through 10)
- Click a number for each dimension:
  1. Factual Accuracy
  2. Explanation Strength
  3. Age-Appropriateness
  4. Educational Value
  5. Variety & Engagement
- The number turns gold when selected

### Step 3: Pick the Strongest Explanation
- Below the ratings, you'll see 4 buttons showing the start of each explanation
- Click the one that **teaches the best** (not necessarily the "correct answer" explanation)

### Step 4: Add Comments (Optional)
- Type any notes in the text box
- Flag errors, suggest improvements, or note what's great

### Step 5: Submit
- Click **"Submit & Next"** (green button, bottom right)
- You must rate all 5 dimensions first or you'll get an error message
- The tool automatically moves to the next scenario

## Navigation

- **Arrow keys** (← →): Move between scenarios
- **"Unrated" filter** (top bar): Shows only scenarios you haven't rated yet
- **Position filters** (top bar): Filter by baseball position
- **"Skip" button**: Skip a scenario and come back later
- **Cmd+Enter** (Mac) or **Ctrl+Enter** (Windows): Quick submit

## Your Progress is Saved Automatically

- The tool saves to your browser's local storage after every action
- You can close the tab and reopen `rating-tool.html` later — it will ask to resume
- You can rate 10 now, close the browser, and do 10 more tonight

## Exporting Your Ratings

When you're done for the day (or done with the batch):

1. Click **"Export Rated"** (green button in the top bar)
2. A file called `coach-ratings-YYYY-MM-DD.json` downloads automatically
3. **Send this file back to Blaine** (email, Slack, or however you usually communicate)

That's it! The exported file contains all your ratings. Blaine will feed it into the training pipeline.

## Troubleshooting

**"Please rate all 5 dimensions before submitting"**
→ Scroll up and make sure you clicked a number (1-10) for ALL 5 rating rows.

**Tool shows "0 Rated" after reopening**
→ You may have cleared your browser cache. Load the JSON file again and any previously rated scenarios in that file will show as rated. Your exported file is always the source of truth.

**Can't find the rating boxes**
→ They're below the 4 options and explanations. Scroll down past the "Concept:" tag.

**File won't load**
→ Make sure you're selecting a `.json` file, not the `.html` file or the `.md` instructions.
