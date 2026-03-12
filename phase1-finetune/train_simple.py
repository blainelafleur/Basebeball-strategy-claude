"""
BSM Fine-Tuning Script — works for both 13B test and 70B production.

Usage:
  python train_simple.py              # 13B test run (RTX 4090, ~25 min)
  python train_simple.py --70b        # 70B production run (H100 80GB, ~5 hrs)
"""
import json
import sys
import torch
from datasets import Dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig
from trl import SFTTrainer, SFTConfig

# ── Pick model size ──
use_70b = "--70b" in sys.argv

if use_70b:
    model_name = "meta-llama/Llama-4-Scout-17B-16E-Instruct"
    output_dir = "./bsm-70b-v1"
    batch_size = 2
    grad_accum = 4
    lora_r = 16
    print("=" * 60)
    print("  BSM 70B PRODUCTION RUN")
    print(f"  Model: {model_name}")
    print("  GPU required: H100 80GB or A100 80GB")
    print("=" * 60)
else:
    model_name = "mistralai/Mistral-Nemo-Instruct-2407"
    output_dir = "./bsm-13b-test"
    batch_size = 4
    grad_accum = 2
    lora_r = 16
    print("=" * 60)
    print("  BSM 13B TEST RUN")
    print(f"  Model: {model_name}")
    print("  GPU required: RTX 4090 / A6000 (24GB+)")
    print("=" * 60)

# ── Load dataset ──
print("\nLoading dataset...")
data = []
with open("llm_data/sft_combined.jsonl") as f:
    for line in f:
        item = json.loads(line)
        text = "<s>[INST] " + item["prompt"] + " [/INST] " + item["completion"] + "</s>"
        data.append({"text": text})

dataset = Dataset.from_list(data)
print(f"Dataset: {len(dataset)} examples")

# ── Load model ──
print(f"\nLoading {model_name} (4-bit quantized)...")
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
)
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto",
    torch_dtype=torch.bfloat16,
)

# ── Configure LoRA + training ──
print("Applying LoRA...")
lora_config = LoraConfig(
    r=lora_r,
    lora_alpha=lora_r * 2,
    lora_dropout=0.05,
    target_modules="all-linear",
    task_type="CAUSAL_LM",
)

training_config = SFTConfig(
    output_dir=output_dir,
    num_train_epochs=3,
    per_device_train_batch_size=batch_size,
    gradient_accumulation_steps=grad_accum,
    learning_rate=2e-5,
    lr_scheduler_type="cosine",
    warmup_steps=50,
    logging_steps=10,
    save_strategy="epoch",
    bf16=True,
    max_length=4096,
    dataset_text_field="text",
    packing=True,
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=lora_config,
    args=training_config,
)

# ── Train ──
print("Starting training...")
trainer.train()
print("Training complete! Saving...")
trainer.save_model(output_dir)
tokenizer.save_pretrained(output_dir)
print(f"\nDone! Model saved to {output_dir}/")
print("\nNext steps:")
print("  1. Run smoke_test.py to verify output quality")
print("  2. Upload to Together.ai or Fireworks for hosting")
print("  3. Update BSM worker endpoint")
