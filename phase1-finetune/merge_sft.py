import torch, os, glob, shutil, gc, subprocess, sys, json
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

# ══════════════════════════════════════════════════════════════════
# BSM 70B LoRA Merge — Disk-Constrained Version
# ══════════════════════════════════════════════════════════════════
# Designed for 200GB disk pods where base model download (141GB)
# + merged output (140GB) can't coexist on disk. Strategy:
#   1. Download base model → HF cache (141GB on disk)
#   2. Load into GPU, merge LoRA
#   3. Clone full state_dict to CPU RAM (breaks mmap references)
#   4. Delete model + GPU memory entirely
#   5. Delete HF cache (now truly frees disk because no mmap)
#   6. Save merged model to disk shard-by-shard
# ══════════════════════════════════════════════════════════════════

print("=" * 60)
print("  BSM 70B LoRA Merge")
print("=" * 60)

# ── Pre-flight checks ──────────────────────────────────────────

# Check disk
result = subprocess.run(['df', '-h', '.'], capture_output=True, text=True)
print(f"\n{result.stdout.strip()}")

# Auto-delete /workspace/data if it reappeared (Vast.ai template data)
if os.path.exists('/workspace/data'):
    print("\nWARNING: /workspace/data found (132GB). Deleting...")
    shutil.rmtree('/workspace/data')
    result = subprocess.run(['df', '-h', '.'], capture_output=True, text=True)
    print(result.stdout.strip())

# Check HF auth
try:
    from huggingface_hub import HfApi
    api = HfApi()
    user = api.whoami()
    print(f"\nHuggingFace: logged in as {user['name']}")
except Exception as e:
    print(f"\nERROR: HuggingFace auth failed: {e}")
    print("Run: python3 -c \"from huggingface_hub import login; login(token='YOUR_TOKEN')\"")
    sys.exit(1)

# Check GPU
if torch.cuda.is_available():
    for i in range(torch.cuda.device_count()):
        name = torch.cuda.get_device_name(i)
        mem = torch.cuda.get_device_properties(i).total_mem / 1e9
        print(f"GPU {i}: {name} ({mem:.0f}GB)")
else:
    print("WARNING: No GPU, using CPU only (will be very slow)")

# Check system RAM
try:
    import psutil
    ram_gb = psutil.virtual_memory().total / 1e9
    print(f"System RAM: {ram_gb:.0f}GB")
    if ram_gb < 150:
        print("WARNING: Less than 150GB RAM. May OOM during save.")
except ImportError:
    print("(psutil not installed, can't check RAM)")

# ── Step 1: Find adapter ──────────────────────────────────────

sft_dir = './bsm-70b-sft'
adapter_path = sft_dir
if not os.path.exists(os.path.join(sft_dir, 'adapter_config.json')):
    candidates = sorted(glob.glob(os.path.join(sft_dir, 'checkpoint-*')))
    if candidates:
        adapter_path = candidates[-1]
        print(f'\nUsing checkpoint: {adapter_path}')
    else:
        print(f"\nERROR: No adapter_config.json in {sft_dir}")
        sys.exit(1)
else:
    print(f"\nAdapter: {adapter_path}")

# ── Step 2: Load tokenizer (tiny) ─────────────────────────────

print('\nLoading tokenizer...')
tokenizer = AutoTokenizer.from_pretrained('meta-llama/Llama-3.1-70B-Instruct')

# ── Step 3: Load base model ───────────────────────────────────

print('\nLoading base model in bf16 (downloading ~141GB)...')
base = AutoModelForCausalLM.from_pretrained(
    'meta-llama/Llama-3.1-70B-Instruct',
    torch_dtype=torch.bfloat16,
    device_map='auto',
)

# ── Step 4: Load LoRA and merge ───────────────────────────────

print(f'\nLoading LoRA from {adapter_path}...')
model = PeftModel.from_pretrained(base, adapter_path)

print('Merging LoRA into base model...')
model = model.merge_and_unload()

# Sanity check
param_count = sum(p.numel() for p in model.parameters())
print(f'Merged model: {param_count:,} parameters ({param_count/1e9:.1f}B)')
if param_count < 60e9 or param_count > 80e9:
    print(f"WARNING: Expected ~70B params, got {param_count/1e9:.1f}B")

# ── Step 5: Save config before losing cache access ────────────

print('\nSaving model config and tokenizer...')
merge_dir = './bsm-70b-sft-merged-tmp'  # temp dir, renamed on completion
if os.path.exists(merge_dir):
    shutil.rmtree(merge_dir)
os.makedirs(merge_dir)

model.config.save_pretrained(merge_dir)
if hasattr(model, 'generation_config'):
    model.generation_config.save_pretrained(merge_dir)
tokenizer.save_pretrained(merge_dir)

# ── Step 6: Clone FULL state_dict to CPU ──────────────────────
# This breaks ALL mmap references (parameters AND buffers).
# Uses ~140GB CPU RAM but frees all disk file handles.

print('\nCloning full state_dict to CPU RAM...')
state_dict = {}
sd = model.state_dict()
total = len(sd)
for i, (key, tensor) in enumerate(sd.items()):
    state_dict[key] = tensor.cpu().clone()
    if (i + 1) % 100 == 0 or (i + 1) == total:
        print(f'  {i+1}/{total} tensors cloned to CPU')
del sd

# ── Step 7: Delete model + free ALL GPU memory ────────────────

print('\nDeleting model from GPU memory...')
del model, base
gc.collect()
torch.cuda.empty_cache()

# Verify GPU is clear
for i in range(torch.cuda.device_count()):
    allocated = torch.cuda.memory_allocated(i) / 1e9
    print(f'  GPU {i}: {allocated:.1f}GB allocated')

# ── Step 8: Delete HF cache (disk space truly freed now) ──────

print('\nDeleting HF cache to free disk...')
cache_dir = os.path.expanduser('~/.cache/huggingface/hub')
try:
    if os.path.exists(cache_dir):
        shutil.rmtree(cache_dir)
        print(f'  Deleted {cache_dir}')
except Exception as e:
    print(f'  WARNING: Cache deletion error: {e}')
    print('  Continuing anyway...')

# Clean up other caches
for d in [os.path.expanduser('~/.cache/pip'), '/tmp/torch_*']:
    for path in glob.glob(d):
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
            else:
                os.remove(path)
        except:
            pass

# Delete previous merge attempts
final_dir = './bsm-70b-sft-merged'
if os.path.exists(final_dir):
    shutil.rmtree(final_dir)
    print(f'  Deleted old {final_dir}')

# ── Step 9: Verify disk space ─────────────────────────────────

result = subprocess.run(['df', '-BG', '.'], capture_output=True, text=True)
print(f'\n{result.stdout.strip()}')

lines = result.stdout.strip().split('\n')
if len(lines) >= 2:
    parts = lines[1].split()
    free_gb = int(parts[3].replace('G', ''))
    if free_gb < 150:
        print(f'\nERROR: Only {free_gb}GB free. Need ~150GB for merged model.')
        print('Cannot safely save. Aborting.')
        sys.exit(1)
    print(f'\n{free_gb}GB free — enough for merged model (~140GB)')

# ── Step 10: Save merged model shard by shard ─────────────────
# Manual sharding lets us free CPU RAM as each shard is written.

print('\nSaving merged model...')
from safetensors.torch import save_file

MAX_SHARD_BYTES = 5 * 1024**3  # 5GB per shard

# Plan shards
shards = []
current_shard = {}
current_size = 0
for name, tensor in state_dict.items():
    tensor_bytes = tensor.numel() * tensor.element_size()
    if current_size + tensor_bytes > MAX_SHARD_BYTES and current_shard:
        shards.append(current_shard)
        current_shard = {}
        current_size = 0
    current_shard[name] = tensor
    current_size += tensor_bytes
if current_shard:
    shards.append(current_shard)

num_shards = len(shards)
print(f'  {len(state_dict)} tensors → {num_shards} shards (~5GB each)')

# Write shards + build index
weight_map = {}
total_size = 0
for i, shard in enumerate(shards):
    shard_name = f'model-{i+1:05d}-of-{num_shards:05d}.safetensors'
    shard_path = os.path.join(merge_dir, shard_name)

    save_file(shard, shard_path)
    shard_bytes = os.path.getsize(shard_path)
    total_size += shard_bytes
    print(f'  [{i+1}/{num_shards}] {shard_name} ({shard_bytes/1e9:.1f}GB)')

    for name in shard:
        weight_map[name] = shard_name

    # Free CPU RAM for this shard's tensors
    for name in list(shard.keys()):
        del state_dict[name]
    del shard
    gc.collect()

# Write index file
index = {
    "metadata": {"total_size": total_size},
    "weight_map": weight_map,
}
index_path = os.path.join(merge_dir, 'model.safetensors.index.json')
with open(index_path, 'w') as f:
    json.dump(index, f, indent=2)

print(f'\n  Total: {total_size/1e9:.1f}GB in {num_shards} shards')

# ── Step 11: Atomic rename (temp → final) ─────────────────────

os.rename(merge_dir, final_dir)
print(f'\n  Renamed {merge_dir} → {final_dir}')

# Write completion sentinel
with open(os.path.join(final_dir, 'MERGE_COMPLETE'), 'w') as f:
    f.write('ok')

# ── Step 12: Verify ───────────────────────────────────────────

print('\nVerifying...')
files = os.listdir(final_dir)
shard_files = sorted([f for f in files if f.endswith('.safetensors')])
required = ['config.json', 'model.safetensors.index.json',
            'tokenizer.json', 'tokenizer_config.json']

ok = True
for r in required:
    if r not in files:
        print(f'  MISSING: {r}')
        ok = False

if not shard_files:
    print('  MISSING: No safetensor shards!')
    ok = False
else:
    print(f'  {len(shard_files)} safetensor shards')
    print(f'  Config files: {[f for f in files if f.endswith(".json")]}')

if ok:
    print('\n✓ Merge complete! Model saved to ./bsm-70b-sft-merged/')
else:
    print('\n✗ Merge may be incomplete. Check files above.')

result = subprocess.run(['df', '-h', '.'], capture_output=True, text=True)
print(result.stdout)
