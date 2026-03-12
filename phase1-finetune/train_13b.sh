#!/bin/bash
# ══════════════════════════════════════════════════════════════
# BSM Phase 1: 13B TEST RUN on Vast.ai
#
# This validates the entire pipeline for ~$0.40 before you
# spend $50+ on the 70B run.
#
# Prerequisites:
#   - Vast.ai pod with RTX 4090 / A6000 / A100 (24GB+ VRAM)
#   - PyTorch 2.1+ template
#   - Files uploaded: this entire phase1-finetune/ directory
#
# Usage:
#   chmod +x train_13b.sh && ./train_13b.sh
# ══════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════"
echo "  BSM Phase 1: 13B TEST RUN"
echo "  Model: Mistral-Nemo-12B-Instruct"
echo "  Expected time: ~30-45 min SFT"
echo "═══════════════════════════════════════════════"

# ── Step 1: Install dependencies ──
echo ""
echo "[1/6] Installing dependencies..."
pip install --upgrade pip
pip install torch --upgrade 2>/dev/null || true
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install axolotl
pip install wandb

# Optional: log into wandb for training curves
# Uncomment and set your key, or run `wandb login` interactively
# export WANDB_API_KEY="your-key-here"

# ── Step 2: Combine SFT datasets ──
echo ""
echo "[2/6] Combining SFT datasets..."
mkdir -p llm_data

if [ ! -f llm_data/sft_handcrafted.jsonl ] || [ ! -f llm_data/sft.jsonl ]; then
  echo "  Running dataset_formatter.py first..."
  python dataset_formatter.py
fi

cat llm_data/sft_handcrafted.jsonl llm_data/sft.jsonl > llm_data/sft_combined.jsonl
SFT_COUNT=$(wc -l < llm_data/sft_combined.jsonl | tr -d ' ')
echo "  Combined SFT dataset: $SFT_COUNT examples"

DPO_COUNT=$(wc -l < llm_data/dpo.jsonl 2>/dev/null | tr -d ' ' || echo "0")
echo "  DPO dataset: $DPO_COUNT pairs"

if [ "$SFT_COUNT" -lt 50 ]; then
  echo "ERROR: Only $SFT_COUNT SFT examples. Need at least 50 for a meaningful test."
  exit 1
fi

# ── Step 3: SFT Training ──
echo ""
echo "[3/6] Starting SFT training on Mistral-Nemo-12B..."
echo "  Config: axolotl_config_13b.yaml"
echo "  This should take ~30-45 min on a 4090/A6000."
START=$(date +%s)

accelerate launch -m axolotl.cli.train axolotl_config_13b.yaml

END=$(date +%s)
ELAPSED=$(( (END - START) / 60 ))
echo ""
echo "  SFT complete in ${ELAPSED} minutes. Model saved to ./bsm-13b-test/"

# ── Step 4: Merge LoRA adapter ──
echo ""
echo "[4/6] Merging LoRA adapter into base model..."
python -c "
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained('bsm-13b-test')
model.save_pretrained_merged('bsm-13b-test-merged', tokenizer)
print('Merged model saved to bsm-13b-test-merged/')
"

# ── Step 5: Quick smoke test ──
echo ""
echo "[5/6] Smoke test — generating one scenario..."
python -c "
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained('bsm-13b-test-merged')
FastLanguageModel.for_inference(model)

prompt = '''Generate a baseball strategy scenario for a Pitcher player.

Difficulty: Rookie (level 1)
Target concept: First-pitch strikes

Requirements:
- Write from 2nd person perspective (\"You are...\")
- Include 4 options with exactly 1 best answer
- Each option needs a success rate (best=75-90, tempting wrong=40-65, bad=10-35)
- Each explanation must teach WHY the answer is good or bad
- Include a realistic game situation (inning, outs, count, runners, score)
- Match language to Rookie difficulty level'''

inputs = tokenizer(prompt, return_tensors='pt').to(model.device)
outputs = model.generate(**inputs, max_new_tokens=1500, temperature=0.4, do_sample=True)
result = tokenizer.decode(outputs[0], skip_special_tokens=True)
print('='*60)
print('GENERATED SCENARIO:')
print('='*60)
print(result[len(prompt):])
print('='*60)
"

# ── Step 6: DPO (if enough data) ──
if [ "$DPO_COUNT" -ge 300 ]; then
  echo ""
  echo "[6/6] Starting DPO training ($DPO_COUNT pairs)..."
  accelerate launch -m axolotl.cli.train axolotl_dpo_config_13b.yaml

  echo "  DPO complete. Merging adapter..."
  python -c "
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained('bsm-13b-test-dpo')
model.save_pretrained_merged('bsm-13b-test-final', tokenizer)
print('Final model saved to bsm-13b-test-final/')
"
else
  echo ""
  echo "[6/6] Skipping DPO: only $DPO_COUNT pairs (need ≥300)."
  echo "  Copying SFT model as final model..."
  cp -r bsm-13b-test-merged bsm-13b-test-final
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  TEST RUN COMPLETE"
echo "═══════════════════════════════════════════════"
echo ""
echo "  Model: ./bsm-13b-test-final/"
echo "  SFT examples: $SFT_COUNT"
echo "  DPO pairs: $DPO_COUNT"
echo "  Training time: ~${ELAPSED} min"
echo ""
echo "  What to check:"
echo "  1. Does the smoke test output look like a valid scenario?"
echo "  2. Check wandb dashboard for loss curves (should decrease)"
echo "  3. If both look good → run the full 70B training"
echo ""
echo "  Next: Run train_70b.sh on an H100 pod"
echo "═══════════════════════════════════════════════"
