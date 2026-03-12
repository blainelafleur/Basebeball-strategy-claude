#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# BSM 70B Production Training Pipeline
# ═══════════════════════════════════════════════════════════════════════
#
# Target:     Llama-3.1-70B-Instruct → BSM baseball strategy expert
# Hardware:   1x H100 SXM 80GB (Vast.ai)
# Time:       ~6-8 hours total (SFT + merge + DPO + merge + validate)
# Cost:       ~$20-25 on Vast.ai ($2.50-3/hr)
#
# Upload:     scp -r phase1-finetune/ root@<pod-ip>:/workspace/bsm/
# Run:        cd /workspace/bsm && chmod +x train_70b.sh && ./train_70b.sh
#
# Outputs:
#   ./bsm-70b-sft/          — SFT LoRA adapter checkpoints
#   ./bsm-70b-sft-merged/   — Full merged SFT model
#   ./bsm-70b-dpo/          — DPO LoRA adapter (if enough data)
#   ./bsm-70b-final/        — Production model (safetensors)
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail

SECONDS=0
LOG_FILE="train_$(date +%Y%m%d_%H%M%S).log"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

log "═══════════════════════════════════════════════════════════════"
log "  BSM 70B PRODUCTION TRAINING"
log "═══════════════════════════════════════════════════════════════"

# ── Pre-flight checks ────────────────────────────────────────────────

log ""
log "Step 0: Pre-flight checks..."

if ! nvidia-smi &>/dev/null; then
  log "ERROR: No NVIDIA GPU detected"
  exit 1
fi

GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -1)
GPU_MEM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -1)
log "  GPU: $GPU_NAME (${GPU_MEM}MB)"

if [ "${GPU_MEM:-0}" -lt 70000 ]; then
  log "WARNING: Less than 70GB VRAM. 70B QLoRA needs ~42GB. May OOM."
fi

for f in llm_data/sft_combined.jsonl llm_data/sft_golden.jsonl llm_data/dpo.jsonl; do
  if [ ! -f "$f" ]; then
    log "ERROR: Missing $f"
    exit 1
  fi
done

SFT_COUNT=$(wc -l < llm_data/sft_combined.jsonl | tr -d ' ')
GOLDEN_COUNT=$(wc -l < llm_data/sft_golden.jsonl | tr -d ' ')
DPO_COUNT=$(wc -l < llm_data/dpo.jsonl | tr -d ' ')
EFFECTIVE=$((GOLDEN_COUNT * 3 + SFT_COUNT))

log "  SFT combined:    $SFT_COUNT examples"
log "  Golden:          $GOLDEN_COUNT examples (x3 = $((GOLDEN_COUNT * 3)) effective)"
log "  DPO pairs:       $DPO_COUNT"
log "  Effective/epoch: $EFFECTIVE training examples"

DISK_FREE=$(df -BG . | tail -1 | awk '{print $4}' | tr -d 'G')
log "  Disk free:       ${DISK_FREE}GB (need ~150GB for 70B)"

# ── Step 1: Install dependencies ─────────────────────────────────────

log ""
log "Step 1: Installing dependencies..."

pip install --upgrade pip 2>&1 | tail -1 | tee -a "$LOG_FILE"

python -c "import torch; assert torch.cuda.is_available()" 2>/dev/null || {
  log "  Installing PyTorch..."
  pip install torch --index-url https://download.pytorch.org/whl/cu121 2>&1 | tail -3 | tee -a "$LOG_FILE"
}

log "  Installing Axolotl + Flash Attention..."
pip install axolotl 2>&1 | tail -3 | tee -a "$LOG_FILE"
pip install flash-attn --no-build-isolation 2>&1 | tail -3 | tee -a "$LOG_FILE"
pip install wandb huggingface_hub[cli] 2>&1 | tail -1 | tee -a "$LOG_FILE"

log "  Done."

# ── Step 2: Authentication ────────────────────────────────────────────

log ""
log "Step 2: Authentication..."

HF_USER=$(python3 -c "
try:
    from huggingface_hub import HfApi
    api = HfApi()
    info = api.whoami()
    print(info['name'])
except Exception:
    print('')
" 2>/dev/null)

if [ -z "$HF_USER" ]; then
  log "  HuggingFace login required (Llama-3.1-70B-Instruct is gated)."
  log "  Run: python3 -c \"from huggingface_hub import login; login()\""
  exit 1
fi
log "  HuggingFace: $HF_USER"

if [ -z "${WANDB_API_KEY:-}" ]; then
  log "  Wandb: disabled (set WANDB_API_KEY to enable)"
  export WANDB_DISABLED=true
else
  log "  Wandb: enabled"
fi

# ── Step 3: SFT Training ─────────────────────────────────────────────

log ""
log "Step 3: SFT Training (Llama-3.1-70B + QLoRA r=32)"
log "  Golden weighted 3x. Effective: $EFFECTIVE examples/epoch x 3 epochs"
log "  Estimated: 4-6 hours on H100..."

SFT_START=$SECONDS
accelerate launch -m axolotl.cli.train axolotl_config.yaml 2>&1 | tee -a "$LOG_FILE"
SFT_ELAPSED=$(( SECONDS - SFT_START ))
log "SFT done in $(( SFT_ELAPSED / 3600 ))h $(( (SFT_ELAPSED % 3600) / 60 ))m"

if [ ! -d "./bsm-70b-sft" ]; then
  log "ERROR: SFT output not found"
  exit 1
fi

# ── Step 4: Merge SFT LoRA ───────────────────────────────────────────

log ""
log "Step 4: Merging SFT LoRA into base model..."

python3 << 'MERGE_SFT'
import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

print("Loading base model...")
base = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-70B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto",
    load_in_4bit=True,
)
print("Loading LoRA adapter...")
model = PeftModel.from_pretrained(base, "./bsm-70b-sft")
print("Merging...")
model = model.merge_and_unload()
print("Saving...")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-70B-Instruct")
model.save_pretrained("./bsm-70b-sft-merged", safe_serialization=True)
tokenizer.save_pretrained("./bsm-70b-sft-merged")
print("Done: ./bsm-70b-sft-merged/")
MERGE_SFT

log "SFT merge complete."

# ── Step 5: DPO Training ─────────────────────────────────────────────

DPO_MIN=50
if [ "$DPO_COUNT" -ge "$DPO_MIN" ]; then
  log ""
  log "Step 5: DPO Training ($DPO_COUNT preference pairs)"
  log "  Estimated: 1-2 hours..."

  DPO_START=$SECONDS
  accelerate launch -m axolotl.cli.train axolotl_dpo_config.yaml 2>&1 | tee -a "$LOG_FILE"
  DPO_ELAPSED=$(( SECONDS - DPO_START ))
  log "DPO done in $(( DPO_ELAPSED / 3600 ))h $(( (DPO_ELAPSED % 3600) / 60 ))m"

  log ""
  log "Step 5b: Merging DPO LoRA..."

  python3 << 'MERGE_DPO'
import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

print("Loading SFT-merged base...")
base = AutoModelForCausalLM.from_pretrained(
    "./bsm-70b-sft-merged",
    torch_dtype=torch.bfloat16,
    device_map="auto",
    load_in_4bit=True,
)
print("Loading DPO adapter...")
model = PeftModel.from_pretrained(base, "./bsm-70b-dpo")
print("Merging...")
model = model.merge_and_unload()
print("Saving...")
tokenizer = AutoTokenizer.from_pretrained("./bsm-70b-sft-merged")
model.save_pretrained("./bsm-70b-final", safe_serialization=True)
tokenizer.save_pretrained("./bsm-70b-final")
print("Done: ./bsm-70b-final/")
MERGE_DPO

  log "DPO merge complete."
else
  log ""
  log "Step 5: Skipping DPO ($DPO_COUNT pairs < $DPO_MIN minimum)"
  log "  Run more synthetic batches to build DPO data."
  cp -r bsm-70b-sft-merged bsm-70b-final
fi

# ── Step 6: Validation ────────────────────────────────────────────────

log ""
log "Step 6: Validation — 3 test generations..."

python3 << 'VALIDATE'
import torch, json
from transformers import AutoModelForCausalLM, AutoTokenizer

print("Loading final model...")
tokenizer = AutoTokenizer.from_pretrained("./bsm-70b-final")
model = AutoModelForCausalLM.from_pretrained(
    "./bsm-70b-final",
    torch_dtype=torch.bfloat16,
    device_map="auto",
    load_in_4bit=True,
)

tests = [
    ("pitcher", "pitch-sequencing", 2),
    ("shortstop", "double-play-turn", 3),
    ("baserunner", "tag-up-advance", 1),
]
DIFF_NAMES = {1: "Rookie", 2: "Pro", 3: "All-Star"}
REQUIRED = ["title","description","situation","options","best","explanations","rates","concept","anim"]

passed = 0
for pos, concept, diff in tests:
    prompt = f"""Generate a baseball strategy scenario for a {pos.title()} player.

Difficulty: {DIFF_NAMES[diff]} (level {diff})
Target concept: {concept}
Concept tag: {concept}

Requirements:
- Title, description, situation, 4 options, best answer index, 4 explanations, 4 success rates, concept, animation type
- JSON only, no markdown
- 2nd person perspective (you/your)"""

    msgs = [{"role": "user", "content": prompt}]
    ids = tokenizer.apply_chat_template(msgs, return_tensors="pt").to(model.device)
    with torch.no_grad():
        out = model.generate(ids, max_new_tokens=1500, temperature=0.7, do_sample=True)
    text = tokenizer.decode(out[0][ids.shape[1]:], skip_special_tokens=True)
    print(f"\n--- {pos}/{concept} (diff {diff}) ---")
    try:
        sc = json.loads(text)
        missing = [k for k in REQUIRED if k not in sc]
        if missing:
            print(f"WARN: Missing: {missing}")
        elif len(sc["options"]) != 4:
            print(f"WARN: {len(sc['options'])} options (expected 4)")
        else:
            print(f"PASS: '{sc['title']}' — {len(text)} chars")
            passed += 1
    except json.JSONDecodeError:
        print(f"FAIL: Invalid JSON. First 200 chars: {text[:200]}")

print(f"\nValidation: {passed}/3 passed")
if passed < 2:
    print("WARNING: Low pass rate. Review training data.")
VALIDATE

# ── Summary ───────────────────────────────────────────────────────────

TOTAL=$SECONDS
log ""
log "═══════════════════════════════════════════════════════════════"
log "  TRAINING COMPLETE"
log "═══════════════════════════════════════════════════════════════"
log ""
log "  Time: $(( TOTAL / 3600 ))h $(( (TOTAL % 3600) / 60 ))m"
log "  GPU:  $GPU_NAME"
log "  SFT:  $SFT_COUNT examples ($GOLDEN_COUNT golden x3)"
log "  DPO:  $DPO_COUNT pairs"
log ""
log "  Final model: ./bsm-70b-final/"
log ""
log "  ── Deploy to Together.ai ──"
log "  together files upload ./bsm-70b-final/"
log "  together models deploy <model-id> --hardware 1xH100"
log ""
log "  ── Deploy to Fireworks ──"
log "  firectl create model bsm-70b ./bsm-70b-final/"
log "  firectl deploy bsm-70b"
log ""
log "  ── Self-host with vLLM ──"
log "  python -m vllm.entrypoints.openai.api_server \\"
log "    --model ./bsm-70b-final/ --tensor-parallel-size 1 \\"
log "    --quantization awq --max-model-len 4096 --port 8000"
log ""
log "  ── Activate in BSM ──"
log "  cd worker && npx wrangler secret put LLM_70B_URL && npx wrangler secret put LLM_70B_API_KEY && npx wrangler deploy"
log ""
log "  Log: $LOG_FILE"
log "═══════════════════════════════════════════════════════════════"
