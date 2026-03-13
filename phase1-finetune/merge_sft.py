import torch, os, glob, shutil, gc, subprocess
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

sft_dir = './bsm-70b-sft'
adapter_path = sft_dir
if not os.path.exists(os.path.join(sft_dir, 'adapter_config.json')):
    candidates = sorted(glob.glob(os.path.join(sft_dir, 'checkpoint-*')))
    if candidates:
        adapter_path = candidates[-1]
        print(f'Using checkpoint: {adapter_path}')

# Save tokenizer first (tiny download)
tokenizer = AutoTokenizer.from_pretrained('meta-llama/Llama-3.1-70B-Instruct')

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
del base
gc.collect()

# Clone all parameters to break memory-mapped file references.
# Without this, deleting the HF cache won't free disk space because
# the safetensors files are still mmap'd by the loaded model tensors.
print('Breaking mmap references (cloning tensors)...')
for name, param in model.named_parameters():
    param.data = param.data.clone()
gc.collect()
torch.cuda.empty_cache()

# NOW delete HF cache — disk space is actually freed
print('Freeing disk space (deleting HF cache)...')
cache_dir = os.path.expanduser('~/.cache/huggingface/hub')
if os.path.exists(cache_dir):
    shutil.rmtree(cache_dir)
    print(f'  Deleted {cache_dir}')

# Delete partial merge from previous attempt
if os.path.exists('./bsm-70b-sft-merged'):
    shutil.rmtree('./bsm-70b-sft-merged')
    print('  Deleted old bsm-70b-sft-merged/')

# Verify free space
result = subprocess.run(['df', '-h', '.'], capture_output=True, text=True)
print(result.stdout)

print('Saving...')
model.save_pretrained('./bsm-70b-sft-merged', safe_serialization=True)
tokenizer.save_pretrained('./bsm-70b-sft-merged')
print('Done!')
