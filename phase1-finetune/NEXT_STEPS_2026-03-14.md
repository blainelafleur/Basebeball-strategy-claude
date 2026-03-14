# BSM 70B Fine-Tune — Next Steps (March 14, 2026)

## What We Accomplished

### SFT Training — COMPLETE
- **Model**: Llama-3.1-70B-Instruct fine-tuned with QLoRA (r=32) + DeepSpeed ZeRO-3
- **Hardware**: 2x A100 SXM4 80GB on Vast.ai (Instance ID: 32806123)
- **Training time**: 7h 23m, 392 steps, 3 epochs
- **Final metrics**:
  - Train loss: **0.6439** (started at 1.787)
  - Eval loss: **0.4729**
  - Eval perplexity: **1.605** (started at 5.975)
  - Trainable params: 414M / 70.9B (0.58%)
- **Training data**: 739 SFT combined + 120 golden (x3 weighted) = ~1099 effective examples
- **Checkpoints saved**: steps 100, 200, 300, 392 (final)

### LoRA Merge — COMPLETE
- Merged LoRA adapter into base model in bf16
- Output: `bsm-70b-sft-merged/` (3 safetensor shards, ~137GB total)
- Files: config.json, generation_config.json, tokenizer.json, tokenizer_config.json, chat_template.jinja, model.safetensors.index.json, 3x .safetensors shards

### DPO Training — FAILED (non-critical)
- Crashed with `TypeError: '{lr}' is not a callable object`
- This is an axolotl version compatibility issue with the DPO config, not a data problem
- 108 DPO pairs were available (above the 50 minimum)
- **Can be re-run later** with a fixed config — the SFT model is the important piece

### HuggingFace Upload — IN PROGRESS
- Repo: **https://huggingface.co/blafleur/bsm-70b-sft** (public)
- Uploading ~137GB from the Vast.ai pod
- **DO NOT destroy the pod until this completes and you verify the files on HuggingFace**

---

## Before You Go to Bed

1. **Wait for upload to finish** — you'll see "Done!" in the terminal
2. **Verify on HuggingFace** — go to https://huggingface.co/blafleur/bsm-70b-sft and confirm these files exist:
   - `model-00001-of-00003.safetensors` (~49.6GB)
   - `model-00002-of-00003.safetensors` (~49.6GB)
   - `model-00003-of-00003.safetensors` (~41.8GB)
   - `model.safetensors.index.json`
   - `config.json`
   - `tokenizer.json`
   - `tokenizer_config.json`
   - `chat_template.jinja`
   - `generation_config.json`
3. **Destroy the Vast.ai pod** — once verified, go to Vast.ai dashboard and delete instance 32806123

---

## Tomorrow: Deployment Plan

### Step 1: Choose a Deployment Provider

**Option A: Together.ai (recommended — easiest)**
- Sign up at https://together.ai
- Serverless inference — pay per token, no idle costs
- Cost: ~$0.002 per scenario (~1500 tokens)
- Monthly at 100 scenarios/day: ~$6/month

**Option B: Fireworks.ai (fast inference)**
- Sign up at https://fireworks.ai
- Also serverless, competitive pricing
- Known for fast inference speeds

**Option C: Self-host with vLLM (cheapest long-term, most complex)**
- Rent a persistent GPU server
- Run vLLM serving the model
- Only makes sense at high volume

### Step 2: Deploy the Model

#### Together.ai deployment:
```bash
pip install together
together login

# Together can pull directly from your HuggingFace repo
together models deploy blafleur/bsm-70b-sft --hardware 1xH100
```

#### Fireworks deployment:
```bash
pip install firectl
firectl login

# Create and deploy from HuggingFace
firectl create model bsm-70b --from-hf blafleur/bsm-70b-sft
firectl deploy bsm-70b
```

Note the **endpoint URL** and **model name** they give you — you'll need both.

### Step 3: Wire Into Cloudflare Worker

```bash
cd ~/Desktop/baseball-strategy-master/worker

# Set the endpoint URL (from your deployment provider)
npx wrangler secret put LLM_70B_URL
# Together: https://api.together.xyz/v1/chat/completions
# Fireworks: https://api.fireworks.ai/inference/v1/chat/completions

# Set your API key
npx wrangler secret put LLM_70B_API_KEY

# Set the model name
npx wrangler secret put LLM_70B_MODEL
# Together: blafleur/bsm-70b-sft (or whatever they assign)
# Fireworks: accounts/<your-account>/models/bsm-70b

# Deploy the updated worker
npx wrangler deploy
```

### Step 4: Update Worker Code (if needed)

The worker (`worker/index.js`) may need a new route or logic to use the 70B model. Check if there's already a `LLM_70B_URL` handler. If not, we'll add one that:
- Routes AI scenario generation to the 70B model first
- Falls back to xAI Grok if the 70B is unavailable
- Uses the same prompt format (the model was trained on it)

### Step 5: Test End-to-End

1. Enable in the app: **Settings > Pro Lab > BSM 70B Model > ON**
2. Generate a few AI scenarios
3. Check quality — the model should produce valid JSON scenarios with all required fields
4. Compare quality/speed to current Grok-4 generation

### Step 6: Validate Quality (optional but recommended)

Run a batch of test generations across different positions and difficulties:
- All 15 position categories
- All 3 difficulty levels
- Check JSON validity, field completeness, baseball accuracy
- Compare to Grok-4 output quality

---

## Future: Fix DPO and Re-train

The DPO failure was a config issue, not a data issue. To fix:

1. **Update `axolotl_dpo_config.yaml`** — the `{lr}` placeholder in the learning rate scheduler isn't compatible with this axolotl version. Need to set a concrete value or use a different scheduler.
2. **Rent a new pod** (same specs: 2x A100/H100, 400GB disk)
3. **Load the SFT model from HuggingFace** instead of re-training:
   ```bash
   # Download the SFT model
   huggingface-cli download blafleur/bsm-70b-sft --local-dir ./bsm-70b-sft-merged
   # Then run DPO on top of it
   ```
4. This would only take 1-2 hours (just the DPO pass), not the full 7+ hours

---

## Key Info for Reference

| Item | Value |
|------|-------|
| HuggingFace repo | https://huggingface.co/blafleur/bsm-70b-sft |
| HF username | blafleur |
| Base model | meta-llama/Llama-3.1-70B-Instruct |
| Fine-tune method | QLoRA r=32, alpha=64, dropout=0.05 |
| Training framework | Axolotl + DeepSpeed ZeRO-3 |
| Trained on | 2x A100 SXM4 80GB |
| Training time | 7h 23m (SFT only) |
| Final train loss | 0.6439 |
| Final eval perplexity | 1.605 |
| Model size | ~137GB (bf16, 3 safetensor shards) |
| DPO status | Failed (config issue), 108 pairs available |
| Local training data | `~/Desktop/baseball-strategy-master/phase1-finetune/` |
| Local configs | axolotl_config.yaml, deepspeed_config.json, train_70b.sh |

## Lessons Learned (for next time)

1. **Always use 400GB+ disk** on Vast.ai — 200GB is not enough for 70B models
2. **Delete `/workspace/data` immediately** — Vast.ai template data eats 132GB
3. **SSH key issues** — if `authorized_keys` permissions break (from full disk), the pod is bricked
4. **Use the axolotl docker image** — saves 10+ min on dependency installation
5. **tmux is your friend** — training survives SSH disconnects
6. **Don't copy the merged model** — use symlinks (`ln -s`) to avoid doubling disk usage
7. **HuggingFace tokens need write access** for uploading models
8. **HuggingFace free tier** has private storage limits — make repos public for large models
