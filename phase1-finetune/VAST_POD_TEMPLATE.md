# BSM 70B — Vast.ai Pod Setup

## One-Click Pod Template

**Search filters on vast.ai/create:**

| Setting | Value |
|---------|-------|
| GPU Type | H100 SXM |
| GPU Count | 1 |
| GPU RAM | >= 80 GB |
| Disk Space | 200 GB |
| Docker Image | `pytorch/pytorch:2.3.1-cuda12.1-cudnn8-devel` |
| On-start script | (leave blank — we run manually) |

**Typical spot price:** $2.50-3.50/hr (total run ~$20-25)

## Step-by-Step

### 1. Rent the pod

Go to [vast.ai/create](https://vast.ai/create), set filters above, pick cheapest H100 SXM, click "RENT".

### 2. Upload training data

```bash
# From your local machine:
scp -r phase1-finetune/ root@<pod-ip>:/workspace/bsm/
```

Or use the Vast.ai file manager to upload the `phase1-finetune/` directory.

### 3. SSH in and authenticate

```bash
ssh root@<pod-ip>

cd /workspace/bsm

# Login to HuggingFace (required — Llama 3.1 70B is gated)
pip install huggingface_hub[cli]
huggingface-cli login
# Paste your HF token (get one at huggingface.co/settings/tokens)
# Must have accepted Llama 3.1 license at huggingface.co/meta-llama/Llama-3.1-70B-Instruct

# Optional: enable Wandb logging
export WANDB_API_KEY=your_key_here
```

### 4. Run training

```bash
chmod +x train_70b.sh
./train_70b.sh
```

This runs the full pipeline:
- Step 1: Install deps (~5 min)
- Step 2: Auth check
- Step 3: SFT training (~4-6 hrs)
- Step 4: Merge SFT LoRA (~15 min)
- Step 5: DPO training (~1-2 hrs, if >= 50 pairs)
- Step 6: Validation (3 test generations)

### 5. Download the model

```bash
# From your local machine:
scp -r root@<pod-ip>:/workspace/bsm/bsm-70b-final/ ./bsm-70b-final/
```

### 6. Deploy

See deployment options below.

## Deployment Options

### Option A: Together.ai (recommended — easiest)

```bash
pip install together
together login

# Upload model
together files upload ./bsm-70b-final/

# Deploy (serverless — pay per token)
together models deploy <model-id> --hardware 1xH100
```

Together.ai endpoint will be: `https://api.together.xyz/v1/chat/completions`
Model name will be: `<your-org>/bsm-70b`

### Option B: Fireworks (fast inference)

```bash
pip install firectl
firectl login

# Upload and deploy
firectl create model bsm-70b ./bsm-70b-final/
firectl deploy bsm-70b
```

Fireworks endpoint: `https://api.fireworks.ai/inference/v1/chat/completions`

### Option C: Self-host with vLLM (cheapest long-term)

```bash
# On a GPU server with H100/A100:
pip install vllm

python -m vllm.entrypoints.openai.api_server \
  --model ./bsm-70b-final/ \
  --tensor-parallel-size 1 \
  --quantization awq \
  --max-model-len 4096 \
  --port 8000
```

Endpoint: `http://<your-server>:8000/v1/chat/completions`

## Activate in BSM App

```bash
cd worker
npx wrangler secret put LLM_70B_URL
# Paste: https://api.together.xyz/v1/chat/completions (or your endpoint)

npx wrangler secret put LLM_70B_API_KEY
# Paste: your Together/Fireworks/vLLM API key

npx wrangler secret put LLM_70B_MODEL
# Paste: <your-org>/bsm-70b (or your model name)

npx wrangler deploy
```

Then in the app: **Settings > Pro Lab > BSM 70B Model > ON**

## Cost Breakdown

| Phase | Time | Cost (H100 spot) |
|-------|------|-------------------|
| SFT training | 4-6 hrs | $10-18 |
| SFT merge | 15 min | $0.75 |
| DPO training | 1-2 hrs | $2.50-6 |
| DPO merge | 15 min | $0.75 |
| Validation | 10 min | $0.50 |
| **Total** | **6-9 hrs** | **$15-26** |

## Inference Cost (Together.ai)

| Usage | Cost |
|-------|------|
| Per scenario (~1500 tokens) | ~$0.002 |
| 100 scenarios/day | ~$0.20/day |
| Monthly (3000 scenarios) | ~$6/month |

Compared to current Grok-4 costs, the 70B will be **5-10x cheaper** per generation with comparable quality on BSM-specific tasks.
