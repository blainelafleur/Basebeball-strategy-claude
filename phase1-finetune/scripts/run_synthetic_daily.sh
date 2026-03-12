#!/bin/bash
# ─────────────────────────────────────────────────────────
# BSM Synthetic Data Pipeline v2 — Daily Cron
#
# Generate → QUALITY_FIREWALL → LLM-as-Judge → Auto-add to training data
#
# Default: 100 scenarios/day via standard pipeline (xAI Grok)
#
# Setup (one time):
#   chmod +x scripts/run_synthetic_daily.sh
#   crontab -e
#   # Add: 0 3 * * * cd /path/to/phase1-finetune && ./scripts/run_synthetic_daily.sh >> logs/cron.log 2>&1
#
# Manual run:
#   ./scripts/run_synthetic_daily.sh           # default 100 scenarios, standard pipeline
#   ./scripts/run_synthetic_daily.sh 200       # custom count
#   ./scripts/run_synthetic_daily.sh 50 --fast # explicit --fast flag (default anyway)
#   ./scripts/run_synthetic_daily.sh 50 ""     # use multi-agent pipeline (slower, better)
# ─────────────────────────────────────────────────────────

set -euo pipefail

# ── Config ──
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$BASE_DIR/logs"
DATE=$(date +%Y-%m-%d)
COUNT="${1:-100}"
# Default to --fast (standard pipeline). Pass "" as $2 for multi-agent.
EXTRA_FLAGS="${2:---fast}"
THRESHOLD="8.0"

# ── Setup ──
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/pipeline_${DATE}.log"

log() {
  echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "BSM Synthetic Pipeline v2 — $DATE"
log "Count: $COUNT | Flags: $EXTRA_FLAGS | Threshold: $THRESHOLD"
log "=========================================="

# ── Check dependencies ──
if ! command -v node &> /dev/null; then
  log "ERROR: node not found"
  exit 1
fi

cd "$BASE_DIR"

# ── Pre-flight: verify golden examples exist ──
if [ ! -f "golden_examples/golden_examples.jsonl" ]; then
  log "ERROR: golden_examples/golden_examples.jsonl not found"
  exit 1
fi

GOLDEN_COUNT=$(wc -l < "golden_examples/golden_examples.jsonl" | tr -d ' ')
log "Golden examples: $GOLDEN_COUNT"

# ── Step 1: Generate ──
log ""
log "STEP 1: Generating $COUNT scenarios..."
BATCH_FILE="$BASE_DIR/synthetic_batch_${DATE}.json"

# If batch exists from earlier today, rename it as backup
if [ -f "$BATCH_FILE" ]; then
  BACKUP="$BASE_DIR/synthetic_batch_${DATE}_$(date +%H%M%S).json"
  mv "$BATCH_FILE" "$BACKUP"
  log "Existing batch backed up to $(basename $BACKUP)"
fi

node "$SCRIPT_DIR/generate_synthetic_batch.js" "$COUNT" $EXTRA_FLAGS 2>&1 | tee -a "$LOG_FILE"
GEN_EXIT=${PIPESTATUS[0]}

if [ $GEN_EXIT -ne 0 ]; then
  log "ERROR: Generation failed (exit $GEN_EXIT)"
  exit 1
fi

if [ ! -f "$BATCH_FILE" ]; then
  log "ERROR: Batch file not created"
  exit 1
fi

GEN_COUNT=$(python3 -c "import json; print(len(json.load(open('$BATCH_FILE'))))" 2>/dev/null || echo "0")
log "Generated: $GEN_COUNT scenarios"

if [ "$GEN_COUNT" = "0" ]; then
  log "WARNING: Zero scenarios generated. Stopping."
  exit 0
fi

# ── Step 2: Judge + Filter (QUALITY_FIREWALL + LLM-as-Judge) ──
log ""
log "STEP 2: Judging (firewall + LLM rubric, threshold: $THRESHOLD)..."

node "$SCRIPT_DIR/judge_scenario.js" "$BATCH_FILE" --add --threshold "$THRESHOLD" 2>&1 | tee -a "$LOG_FILE"
FILTER_EXIT=${PIPESTATUS[0]}

if [ $FILTER_EXIT -ne 0 ]; then
  log "ERROR: Filtering failed (exit $FILTER_EXIT)"
  exit 1
fi

# ── Step 2b: JSON compliance check ──
if [ -f "$BATCH_FILE" ]; then
  JSON_CLEAN=$(python3 -c "
import json
data = json.load(open('$BATCH_FILE'))
clean = sum(1 for s in data if s.get('_jsonClean', True) is not False)
total = len(data)
print(f'{clean}/{total} ({round(clean/max(total,1)*100)}%)')
" 2>/dev/null || echo "N/A")
  log "  JSON compliance: $JSON_CLEAN clean responses"
fi

# ── Step 3: Dataset report ──
log ""
log "STEP 3: Dataset status"

SFT_COUNT=0
DPO_COUNT=0

if [ -f "$BASE_DIR/llm_data/sft_combined.jsonl" ]; then
  SFT_COUNT=$(wc -l < "$BASE_DIR/llm_data/sft_combined.jsonl" | tr -d ' ')
  log "  SFT combined: $SFT_COUNT examples"
fi

if [ -f "$BASE_DIR/llm_data/dpo.jsonl" ]; then
  DPO_COUNT=$(wc -l < "$BASE_DIR/llm_data/dpo.jsonl" | tr -d ' ')
  log "  DPO pairs:    $DPO_COUNT"
fi

if [ -f "$BASE_DIR/llm_data/sft.jsonl" ]; then
  RATED_COUNT=$(wc -l < "$BASE_DIR/llm_data/sft.jsonl" | tr -d ' ')
  log "  Rated SFT:    $RATED_COUNT (coach + synthetic)"
fi

# ── Milestones ──
log ""

if [ "$SFT_COUNT" -ge 2000 ]; then
  log "MILESTONE: $SFT_COUNT SFT — ready for 70B production training!"
elif [ "$SFT_COUNT" -ge 1500 ]; then
  log "MILESTONE: $SFT_COUNT SFT — 75% to 70B target"
elif [ "$SFT_COUNT" -ge 1000 ]; then
  log "MILESTONE: $SFT_COUNT SFT — halfway to 70B target (2000)"
elif [ "$SFT_COUNT" -ge 500 ]; then
  log "STATUS:    $SFT_COUNT SFT — minimum for fine-tuning reached"
else
  log "STATUS:    $SFT_COUNT SFT — need $(( 500 - SFT_COUNT )) more for minimum"
fi

if [ "$DPO_COUNT" -ge 300 ]; then
  log "MILESTONE: $DPO_COUNT DPO — ready for preference optimization!"
else
  log "STATUS:    $DPO_COUNT DPO — need $(( 300 - DPO_COUNT )) more"
fi

# ── Golden candidate alert ──
GOLD_FILE="$BASE_DIR/golden_candidates_${DATE}.json"
if [ -f "$GOLD_FILE" ]; then
  GOLD_NEW=$(python3 -c "import json; print(len(json.load(open('$GOLD_FILE'))))" 2>/dev/null || echo "0")
  log ""
  log "NEW GOLDEN CANDIDATES: $GOLD_NEW scenarios scored >= 9.5 (review for promotion)"
fi

log ""
log "Pipeline complete. Log: $LOG_FILE"
log "=========================================="
