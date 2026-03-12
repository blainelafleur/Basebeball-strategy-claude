from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

print("Loading model...")
base = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-Nemo-Instruct-2407", device_map="auto", torch_dtype=torch.bfloat16)
model = PeftModel.from_pretrained(base, "./bsm-13b-test")
tokenizer = AutoTokenizer.from_pretrained("./bsm-13b-test")

prompt = '[INST] Generate a baseball strategy scenario for a Pitcher player.\n\nDifficulty: Rookie (level 1)\nTarget concept: First-pitch strikes\n\nRequirements:\n- Write from 2nd person perspective\n- Include 4 options with exactly 1 best answer\n- Each option needs a success rate (best=75-90, tempting wrong=40-65, bad=10-35)\n- Each explanation must teach WHY the answer is good or bad\n- Include a realistic game situation\n- Match language to Rookie difficulty level [/INST]'

inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
out = model.generate(**inputs, max_new_tokens=1500, temperature=0.4, do_sample=True)
result = tokenizer.decode(out[0], skip_special_tokens=True)
print("=" * 60)
print(result)
print("=" * 60)
