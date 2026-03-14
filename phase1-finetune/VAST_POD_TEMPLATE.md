# BSM 70B — Vast.ai Pod Setup

## Pod Specs (TESTED — do not reduce)

**Search filters on vast.ai/create:**

| Setting | Value | Why |
|---------|-------|-----|
| GPU Type | H100 SXM | ZeRO-3 needs fast interconnect |
| GPU Count | 2 | FSDP/ZeRO-3 shards across both |
| GPU RAM | >= 80 GB | 70B QLoRA needs ~35GB/GPU |
| **Disk Space** | **400 GB** | Base model 141GB + merged output 140GB + overhead |
| RAM | >= 256 GB | Merge clones 140GB state dict to CPU RAM |
| Docker Image | `axolotl/axolotl:main-latest` | Axolotl pre-installed, saves ~10 min setup |
| On-start script | (leave blank — we run manually) | |

**Why 400GB disk (not 200GB):**
- HF cache (base model download): ~141GB
- Merged model output: ~140GB
- DeepSpeed offload files: ~10-20GB
- Docker image + OS: ~15-20GB
- Vast.ai `/workspace/data` junk: up to 132GB (auto-appears!)
- pip/torch caches: ~5-10GB
- Peak during merge: 281GB before cache deletion
- **200GB WILL brick the pod — full disk breaks SSH + Jupyter**

**Typical spot price:** $2.50-3.50/hr (total run ~$25-35)

## Step-by-Step

### 1. Rent the pod

Go to [vast.ai/create](https://vast.ai/create), set filters above, pick cheapest H100 SXM, click "RENT".

### 2. First thing after SSH — delete Vast.ai junk data

```bash
# Vast.ai template images eat 132GB — delete IMMEDIATELY
rm -rf /workspace/data 2>/dev/null
rm -rf ~/.cache/pip 2>/dev/null
df -h .
# Should show ~370GB+ free
```

### 3. Upload training data

```bash
# From your local machine (use the port from Vast dashboard):
scp -P <port> -r phase1-finetune/ root@<pod-ip>:/workspace/bsm/
```

Or use the Vast.ai file manager to upload the `phase1-finetune/` directory.

### 4. SSH in and authenticate

```bash
ssh -p <port> root@<pod-ip> -i ~/.ssh/id_ed25519

cd /workspace/bsm

# Login to HuggingFace (required — Llama 3.1 70B is gated)
pip install huggingface_hub[cli]
huggingface-cli login
# Paste your HF token (get one at huggingface.co/settings/tokens)
# Must have accepted Llama 3.1 license at huggingface.co/meta-llama/Llama-3.1-70B-Instruct

# Optional: enable Wandb logging
export WANDB_API_KEY=your_key_here
```

### 5. Run training

```bash
chmod +x train_70b.sh
./train_70b.sh
```

This runs the full pipeline:
- Step 1: Install deps (~5 min — faster with axolotl image)
- Step 2: Auth check
- Step 2b: Dataset preparation
- Step 3: SFT training (~4-6 hrs)
- Step 4: Merge SFT LoRA (~15 min)
- Step 5: DPO training (~1-2 hrs, if >= 50 pairs)
- Step 6: Validation (3 test generations)

### 6. Download the model

```bash
# From your local machine:
scp -P <port> -r root@<pod-ip>:/workspace/bsm/bsm-70b-final/ ./bsm-70b-final/
```

### 7. Deploy

See deployment options below.

## Troubleshooting

### SSH "Permission denied (publickey)"
- Vast.ai pods can take 1-2 minutes after boot to accept SSH
- Always use `-i ~/.ssh/id_ed25519` explicitly
- If persists, check `vastai logs <instance-id>` for "bad ownership or modes for authorized_keys" — means disk is full and pod is bricked
- Use `vastai set api-key <key>` + `vastai logs <id>` to debug remotely

### Jupyter not loading (blank white screen)
- Usually means disk is full — Jupyter can't write temp/SSL files
- If both SSH and Jupyter are broken, the pod is bricked. Destroy and re-rent with more disk.

### Disk full during merge
- The standalone `merge_sft.py` script handles this by: cloning state dict to CPU RAM → deleting model → deleting HF cache → saving shard-by-shard
- But if the disk fills during *training*, there's no recovery without shell access

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
| **Total** | **6-9 hrs** | **$20-35** |

## Inference Cost (Together.ai)

| Usage | Cost |
|-------|------|
| Per scenario (~1500 tokens) | ~$0.002 |
| 100 scenarios/day | ~$0.20/day |
| Monthly (3000 scenarios) | ~$6/month |

Compared to current Grok-4 costs, the 70B will be **5-10x cheaper** per generation with comparable quality on BSM-specific tasks.
