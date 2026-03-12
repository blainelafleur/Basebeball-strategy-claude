# Vast.ai Training Setup — Paste-Ready Instructions

## Step 1: Create Vast.ai Account
1. Go to https://cloud.vast.ai/
2. Sign up, add payment method
3. Add ~$5 credit for the 13B test run ($50 for the 70B run)

## Step 2: Rent a GPU (13B Test Run)

### Search filters for 13B test:
- **GPU**: RTX 4090 or A6000 (24GB+ VRAM)
- **Image**: `pytorch/pytorch:2.1.2-cuda12.1-cudnn8-devel`
- **Disk**: 50 GB
- **Type**: Spot (cheapest — if interrupted, just restart)
- **Expected cost**: $0.30-0.50/hr, ~$0.40 total for the run

### How to search:
1. Click "Search" in the left sidebar
2. Set GPU RAM ≥ 24 GB
3. Set Disk Space ≥ 50 GB
4. Sort by "$/hr" ascending
5. Pick the cheapest RTX 4090 or A6000
6. Click "Rent" → select the PyTorch template above

## Step 3: Upload Files

Once the instance is running, open the Jupyter interface or SSH in.

### Option A: Jupyter upload (easier)
1. Click "Open" on your instance → Jupyter
2. Upload the entire `phase1-finetune/` folder

### Option B: SSH + rsync (faster for large files)
```bash
# From your Mac — replace INSTANCE_IP and PORT with values from Vast.ai dashboard
rsync -avz -e "ssh -p PORT" \
  ~/Desktop/baseball-strategy-master/phase1-finetune/ \
  root@INSTANCE_IP:/workspace/phase1-finetune/
```

## Step 4: Run the 13B Test

SSH into the pod or use the Jupyter terminal:

```bash
cd /workspace/phase1-finetune
chmod +x train_13b.sh
./train_13b.sh
```

That's it. The script installs everything, trains, merges, and runs a smoke test.

### What to look for:
- **Loss curve**: Should decrease from ~2.5 to ~1.0 over 3 epochs
- **Smoke test output**: Should look like a valid baseball scenario JSON
- **Training time**: ~30-45 min on a 4090

### If it crashes:
- "CUDA out of memory" → Edit `axolotl_config_13b.yaml`, reduce `micro_batch_size` to 2
- "Module not found" → Run `pip install axolotl unsloth` manually, then re-run
- Pod gets killed (spot instance) → Rent a new pod, re-upload, re-run

## Step 5: Run the 70B Production Run (After Test Succeeds)

### Search filters for 70B:
- **GPU**: H100 80GB or A100 80GB
- **Image**: `pytorch/pytorch:2.1.2-cuda12.1-cudnn8-devel`
- **Disk**: 200 GB (the 70B model is ~35GB in 4-bit)
- **Type**: Spot for H100 (~$2-3/hr), On-demand if you can't risk interruption
- **Expected cost**: $40-80 total (4-6 hrs)

```bash
cd /workspace/phase1-finetune
chmod +x train_70b.sh
./train_70b.sh
```

## Step 6: Download the Trained Model

After training completes, download the model from the pod:

```bash
# From your Mac
rsync -avz -e "ssh -p PORT" \
  root@INSTANCE_IP:/workspace/phase1-finetune/bsm-13b-test-final/ \
  ~/Desktop/bsm-13b-test-final/
```

Or for 70B:
```bash
rsync -avz -e "ssh -p PORT" \
  root@INSTANCE_IP:/workspace/phase1-finetune/bsm-llm-v1-final/ \
  ~/Desktop/bsm-llm-v1-final/
```

## Quick Cost Summary

| Run | GPU | Time | $/hr (spot) | Total |
|-----|-----|------|-------------|-------|
| 13B test | RTX 4090 | ~40 min | $0.40 | ~$0.30 |
| 70B prod | H100 80GB | ~5 hrs | $2.50 | ~$12-15 |
| 70B prod | A100 80GB | ~8 hrs | $1.80 | ~$15-20 |

Note: Prices fluctuate. Check Vast.ai spot prices at time of rental.

## Destroy the Pod When Done!
Don't forget to stop/destroy your instance after downloading the model. Spot instances auto-terminate, but on-demand instances keep billing.
