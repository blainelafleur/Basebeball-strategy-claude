import torch, os, glob, shutil
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

# Save tokenizer before deleting cache
tokenizer = AutoTokenizer.from_pretrained('meta-llama/Llama-3.1-70B-Instruct')

print('Merging...')
model = model.merge_and_unload()

# Delete HF cache to free disk space BEFORE saving merged model
print('Freeing disk space (deleting HF cache)...')
cache_dir = os.path.expanduser('~/.cache/huggingface/hub')
if os.path.exists(cache_dir):
    shutil.rmtree(cache_dir)
    print(f'  Deleted {cache_dir}')

# Also delete partial merge from previous attempt
if os.path.exists('./bsm-70b-sft-merged'):
    shutil.rmtree('./bsm-70b-sft-merged')
    print('  Deleted old bsm-70b-sft-merged/')

print('Saving...')
model.save_pretrained('./bsm-70b-sft-merged', safe_serialization=True)
tokenizer.save_pretrained('./bsm-70b-sft-merged')
print('Done!')
