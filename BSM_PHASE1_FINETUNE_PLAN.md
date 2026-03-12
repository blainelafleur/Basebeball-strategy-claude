# Baseball Strategy Master — Phase 1: Custom LLM Fine-Tuning

**Version 1.0**
**Date: March 11, 2026**
**For: Blaine LaFleur (@BlaineLaFleur)**
**Goal**: Turn your 584 handcrafted scenarios + 21 knowledge maps + BRAIN constant into a dedicated 70B Baseball Strategy Master LLM that becomes the permanent brain of the app. This fulfills your original vision: the world's best baseball LLM that understands every position, grows forever, and makes kids measurably smarter.

**Why Phase 1 now?**
Phase 0 (Claude 4 multi-agent + RAG) is complete. You now have dramatically better generations. Phase 1 internalizes everything into model weights so you never fight prompt limits again.

**Total timeline & cost (cloud only)**
- Data collection: 3–7 days
- First SFT model: 1–2 days training (~$300–500)
- DPO + deployment: 2–3 days
- Ongoing weekly updates: $30–80/month
- Grand total to world-class: <$8k

**Base model recommendation (March 2026)**: Llama 4 70B (or Qwen 3.5 72B if stronger on structured reasoning). Use QLoRA + Unsloth — fits on a single H100.

---

## Step 1: Coach Rating Rubric & Data Collection (Start HERE — 3–7 days)

### 1A. 1–10 Coach Rating Rubric (use this exact form)
Create a Google Form or Airtable with these fields:

**Scenario ID**
**Position**
**Difficulty**
**Full scenario JSON** (paste the generated output)

**Rate 1–10**
- **Factual Accuracy** (Tier 1–3 compliance, no role violations, correct RE24/cutoffs)
- **Explanation Strength** (best explanation argues FOR the correct answer + teaches WHY)
- **Age-Appropriateness** (matches diff level and AGE_GATE; no jargon for 6–10)
- **Educational Value** (specific teaching moment, no filler, encourages learning)
- **Variety & Engagement** (fresh situation, vivid description, not formulaic)

**Overall Score** (average of above)
**Preferred Explanation** (A/B/C/D — pick the best one for DPO)
**Comments** (optional — "too wordy", "missed fly-ball priority", etc.)

**Target**: Collect 1,000+ rated scenarios (5–10 coaches rating 100–200 each). Even 500 gets you a strong first model.

### 1B. Remote-Assistant Instructions (copy-paste this to your remote assistant)

> **Task**: Rate 20 scenarios per day using the exact 1–10 rubric above.
>
> 1. Open the Google Form link I will send.
> 2. Paste the full scenario JSON.
> 3. Rate honestly — we are training the world's best baseball LLM.
> 4. For "Preferred Explanation", choose which of the 4 explanations is strongest for teaching kids.
> 5. If you see any Tier 1 error (wrong cutoff, wrong backup, fly-ball priority reversed), flag it in comments.
> 6. Deadline: 200 ratings by end of week.
>
> Send your remote assistant the Google Form link + this exact text.

---

## Step 2: Dataset Formatting Script (Run this after you have ratings)

```python
# dataset_formatter.py
import json
from pathlib import Path

def create_sft_and_dpo_datasets(ratings_file: str, output_dir: str = "llm_data"):
    Path(output_dir).mkdir(exist_ok=True)
    sft = []
    dpo = []

    with open(ratings_file, "r") as f:
        ratings = json.load(f)  # list of rated scenarios

    for item in ratings:
        scenario = item["scenario_json"]
        overall = item["overall_score"]

        # SFT: only use high-quality (≥8.0)
        if overall >= 8.0:
            prompt = f"Generate a baseball strategy scenario for position {scenario['position']} at difficulty {scenario['diff']}.\n\nUse these principles: {scenario['principles_summary']}"
            completion = json.dumps(scenario)
            sft.append({"prompt": prompt, "completion": completion})

        # DPO: create preference pairs
        if "preferred_explanation" in item and overall >= 7.0:
            best_idx = item["preferred_explanation"]
            for i in range(4):
                if i != best_idx:
                    dpo.append({
                        "prompt": scenario["description"] + "\nOptions: " + str(scenario["options"]),
                        "chosen": scenario["explanations"][best_idx],
                        "rejected": scenario["explanations"][i]
                    })

    with open(f"{output_dir}/sft.jsonl", "w") as f:
        for line in sft:
            f.write(json.dumps(line) + "\n")

    with open(f"{output_dir}/dpo.jsonl", "w") as f:
        for line in dpo:
            f.write(json.dumps(line) + "\n")

    print(f"Created {len(sft)} SFT examples and {len(dpo)} DPO pairs!")

# Run after exporting Google Form as JSON
create_sft_and_dpo_datasets("coach_ratings_export.json")
```

---

## Step 3: Unsloth + Axolotl Training Config (Ready to Run on RunPod/Vast.ai)

Create a new folder on your laptop, save these two files, then spin up an H100 pod.

### File 1: axolotl_config.yaml

```yaml
base_model: meta-llama/Llama-4-70B-Instruct  # or current best 70B
model_type: LlamaForCausalLM
tokenizer_type: LlamaTokenizer

load_in_4bit: true
strict: false

datasets:
  - path: ./llm_data/sft.jsonl
    type: completion
  - path: ./llm_data/dpo.jsonl
    type: dpo

sequence_len: 4096
sample_packing: true
pad_to_sequence_len: true

adapter: lora
lora_r: 16
lora_alpha: 32
lora_dropout: 0.05
lora_target_linear: true

val_set_size: 0.05
learning_rate: 2e-5
num_epochs: 3
optimizer: adamw_torch
lr_scheduler: cosine
train_batch_size: 4
micro_batch_size: 2
gradient_accumulation_steps: 2

save_strategy: epoch
output_dir: ./bsm-llm-v1

wandb_project: bsm-llm
```

### File 2: train.sh (run this on the pod)

```bash
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install axolotl

accelerate launch -m axolotl.cli.train axolotl_config.yaml
```

**Expected cost**: First full SFT run ≈ 4–6 hours on H100 spot instance (~$300–500 total).

---

## Step 4: DPO Pass (After SFT)

Use the same config but change `type: dpo` and run a second short training (1–2 hours, ~$100).

---

## Step 5: Deployment & Continuous Learning Loop

1. Merge the LoRA adapter (Unsloth script does this automatically).
2. Upload to Together.ai or Fireworks (serverless endpoint).
3. Update your Cloudflare Worker to point to the new endpoint (single line change).
4. Continuous learning script (run weekly on a cheap CPU VPS):

```bash
# weekly_update.sh
python dataset_formatter.py
accelerate launch -m axolotl.cli.train axolotl_config.yaml --resume_from_checkpoint
# merge & push to Together.ai
```

---

## Phase 1 Checklist (Track in Claude Code)

- [ ] Create Google Form + send to remote assistant/coaches
- [ ] Collect first 500 ratings
- [ ] Run dataset_formatter.py
- [ ] Spin up H100 pod and run SFT
- [ ] Run DPO pass
- [ ] Deploy to Together.ai and switch Worker endpoint
- [ ] Test 100 generations in the app
- [ ] Set up weekly_update.sh cron job

---

**You are now 7–10 days away from the world's best baseball LLM.**

Paste this file into Claude Code and begin.

When you finish data collection, reply here with "Ready for training script tweaks" and I'll give you the exact pod commands and merge steps.
