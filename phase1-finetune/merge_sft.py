import torch, os, glob
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

sft_dir = './bsm-70b-sft'
adapter_path = sft_dir
if not os.path.exists(os.path.join(sft_dir, 'adapter_config.json')):
    candidates = sorted(glob.glob(os.path.join(sft_dir, 'checkpoint-*')))
    if candidates:
        adapter_path = candidates[-1]
        print(f'Using checkpoint: {adapter_path}')

print('Loading base model in bf16...')
base = AutoModelForCausalLM.from_pretrained(
    'meta-llama/Llama-3.1-70B-Instruct',
    torch_dtype=torch.bfloat16,
    device_map='auto',
)
print(f'Loading LoRA from {adapter_path}...')
model = PeftModel.from_pretrained(base, adapter_path)
print('Merging...')
model = model.merge_and_unload()
print('Saving...')
tokenizer = AutoTokenizer.from_pretrained('meta-llama/Llama-3.1-70B-Instruct')
model.save_pretrained('./bsm-70b-sft-merged', safe_serialization=True)
tokenizer.save_pretrained('./bsm-70b-sft-merged')
print('Done!')
