#!/usr/bin/env python3
"""
Phase 1: Convert coach ratings into SFT + DPO datasets for fine-tuning.

Input:  coach-ratings-*.json (exported from rating-tool.html)
Output: llm_data/sft.jsonl, llm_data/dpo.jsonl

Usage:
  python dataset_formatter.py coach-ratings-2026-03-15.json
  python dataset_formatter.py *.json          # merge multiple exports
"""

import json
import sys
import glob
from pathlib import Path
from collections import Counter

OUTPUT_DIR = Path(__file__).parent / "llm_data"
GOLDEN_DIR = Path(__file__).parent / "golden_examples"

# Position display names for prompts
POSITION_NAMES = {
    "pitcher": "Pitcher", "catcher": "Catcher",
    "firstBase": "First Base", "secondBase": "Second Base",
    "shortstop": "Shortstop", "thirdBase": "Third Base",
    "leftField": "Left Field", "centerField": "Center Field",
    "rightField": "Right Field", "batter": "Batter",
    "baserunner": "Baserunner", "manager": "Manager",
    "famous": "Famous Plays", "rules": "Rules & Umpiring",
    "counts": "Count Strategy"
}

DIFF_NAMES = {1: "Rookie", 2: "Pro", 3: "All-Star",
              "beginner": "Rookie", "intermediate": "Pro", "advanced": "All-Star"}


def validate_scenario_json(sc):
    """Validate a scenario has correct JSON structure. Returns list of issues."""
    issues = []
    required = ["title", "description", "options", "best", "explanations", "rates", "concept"]
    for field in required:
        if field not in sc:
            issues.append(f"missing {field}")
    if "options" in sc and (not isinstance(sc["options"], list) or len(sc["options"]) != 4):
        issues.append("options must be array of 4")
    if "explanations" in sc and (not isinstance(sc["explanations"], list) or len(sc["explanations"]) != 4):
        issues.append("explanations must be array of 4")
    if "rates" in sc and (not isinstance(sc["rates"], list) or len(sc["rates"]) != 4):
        issues.append("rates must be array of 4")
    # Check for markdown contamination
    all_text = " ".join(str(v) for v in [sc.get("title", ""), sc.get("description", "")]
                        + (sc.get("options") or []) + (sc.get("explanations") or []))
    if "```" in all_text or "##" in all_text:
        issues.append("markdown contamination in text fields")
    return issues


def load_ratings(files):
    """Load and merge all rating JSON files with JSON validation."""
    all_items = []
    skipped = 0
    for f in files:
        with open(f, "r") as fh:
            data = json.load(fh)
            if isinstance(data, list):
                all_items.extend(data)
            else:
                all_items.append(data)
    # Deduplicate by id
    seen = set()
    unique = []
    for item in all_items:
        item_id = item.get("id", id(item))
        if item_id not in seen:
            seen.add(item_id)
            # Validate JSON structure of the scenario
            sc = item.get("scenario", item)
            issues = validate_scenario_json(sc)
            if issues:
                print(f"  JSON validation warning ({item_id}): {', '.join(issues)}")
                skipped += 1
            unique.append(item)
    if skipped > 0:
        print(f"  {skipped} scenario(s) had JSON structure warnings")
    return unique


def build_sft_prompt(item):
    """Build the instruction prompt for SFT training."""
    sc = item["scenario"]
    pos = POSITION_NAMES.get(item.get("position", ""), item.get("position", "unknown"))
    diff = sc.get("diff", 1)
    diff_name = DIFF_NAMES.get(diff, DIFF_NAMES.get(item.get("difficulty", ""), "Rookie"))
    concept = sc.get("concept", "")
    concept_tag = sc.get("conceptTag", "")

    prompt = f"""Generate a baseball strategy scenario for a {pos} player.

Difficulty: {diff_name} (level {diff})
Target concept: {concept}
{f'Concept tag: {concept_tag}' if concept_tag else ''}

Requirements:
- Write from 2nd person perspective ("You are...")
- Include 4 options with exactly 1 best answer
- Each option needs a success rate (best=75-90, tempting wrong=40-65, bad=10-35)
- Each explanation must teach WHY the answer is good or bad
- Include a realistic game situation (inning, outs, count, runners, score)
- Match language to {diff_name} difficulty level"""

    return prompt


def build_sft_completion(item):
    """Build the expected completion (the scenario JSON) for SFT training."""
    sc = item["scenario"]
    # Clean scenario to just the fields needed
    clean = {
        "title": sc.get("title", ""),
        "description": sc.get("description", ""),
        "situation": sc.get("situation", {}),
        "options": sc.get("options", []),
        "best": sc.get("best", 0),
        "explanations": sc.get("explanations", []),
        "rates": sc.get("rates", []),
        "concept": sc.get("concept", ""),
        "conceptTag": sc.get("conceptTag", ""),
        "diff": sc.get("diff", 1),
        "anim": sc.get("anim", "")
    }
    return json.dumps(clean)


def create_datasets(items):
    """Create SFT and DPO datasets from rated items."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    sft = []
    dpo = []
    stats = Counter()

    for item in items:
        if not item.get("ratings"):
            stats["skipped_unrated"] += 1
            continue

        ratings = item["ratings"]
        overall = item.get("overallScore", 0)
        if overall == 0:
            dims = ["factualAccuracy", "explanationStrength",
                    "ageAppropriateness", "educationalValue", "varietyEngagement"]
            scores = [ratings.get(d, 0) for d in dims]
            overall = sum(scores) / len(scores) if scores else 0

        sc = item["scenario"]

        # ── SFT: Only use high-quality rated scenarios (≥7.5 average) ──
        if overall >= 7.5:
            prompt = build_sft_prompt(item)
            completion = build_sft_completion(item)
            sft.append({
                "prompt": prompt,
                "completion": completion,
                "metadata": {
                    "position": item.get("position", ""),
                    "difficulty": item.get("difficulty", ""),
                    "overall_score": round(overall, 2),
                    "critique_score": item.get("critiqueScore"),
                    "coach_comments": item.get("coachComments", "")
                }
            })
            stats["sft_included"] += 1
        else:
            stats["sft_excluded_low_quality"] += 1

        # ── DPO: Create preference pairs from preferred explanation ──
        pref_idx = item.get("preferredExplanation")
        if pref_idx is not None and overall >= 6.0:
            explanations = sc.get("explanations", [])
            if len(explanations) == 4 and 0 <= pref_idx <= 3:
                context = (
                    f"Scenario: {sc.get('description', '')}\n"
                    f"Options: {', '.join(sc.get('options', []))}\n"
                    f"Correct answer: {sc['options'][sc['best']] if sc.get('options') and 'best' in sc else 'unknown'}"
                )
                chosen = explanations[pref_idx]
                for i in range(4):
                    if i != pref_idx:
                        dpo.append({
                            "prompt": context,
                            "chosen": chosen,
                            "rejected": explanations[i],
                            "metadata": {
                                "position": item.get("position", ""),
                                "overall_score": round(overall, 2),
                                "chosen_idx": pref_idx,
                                "rejected_idx": i
                            }
                        })
                        stats["dpo_pairs"] += 1
        else:
            stats["dpo_skipped_no_pref"] += 1

    # ── Write JSONL files ──
    sft_path = OUTPUT_DIR / "sft.jsonl"
    with open(sft_path, "w") as f:
        for line in sft:
            f.write(json.dumps(line) + "\n")

    dpo_path = OUTPUT_DIR / "dpo.jsonl"
    with open(dpo_path, "w") as f:
        for line in dpo:
            f.write(json.dumps(line) + "\n")

    # ── Also save audited handcrafted scenarios as SFT data ──
    # Only include Gold (95+, no issues) + Silver (80-94) from audit
    knowledge_path = Path(__file__).parent.parent / "worker" / "data" / "knowledge.json"
    audit_path = Path(__file__).parent / "audit-report.json"
    handcrafted_count = 0

    # Load audit results to filter by quality tier
    exclude_ids = set()
    if audit_path.exists():
        with open(audit_path, "r") as f:
            audit = json.load(f)
        for result in audit.get("allResults", []):
            if result.get("clientScore", 0) < 80:  # Exclude Bronze + Reject
                exclude_ids.add(result["id"])
        print(f"Audit loaded: excluding {len(exclude_ids)} low-quality scenarios")
    else:
        print("No audit report found — including all handcrafted scenarios")

    if knowledge_path.exists():
        with open(knowledge_path, "r") as f:
            knowledge = json.load(f)
        handcrafted_sft_path = OUTPUT_DIR / "sft_handcrafted.jsonl"
        with open(handcrafted_sft_path, "w") as f:
            for sc in knowledge.get("scenarios", []):
                if sc.get("id") in exclude_ids:
                    stats["handcrafted_excluded"] += 1
                    continue
                prompt = f"""Generate a baseball strategy scenario for a {POSITION_NAMES.get(sc.get('position', ''), sc.get('position', ''))} player.

Difficulty: {DIFF_NAMES.get(sc.get('diff', 1), 'Rookie')} (level {sc.get('diff', 1)})
Target concept: {sc.get('concept', '')}
{f"Concept tag: {sc.get('conceptTag', '')}" if sc.get('conceptTag') else ''}

Requirements:
- Write from 2nd person perspective ("You are...")
- Include 4 options with exactly 1 best answer
- Each option needs a success rate (best=75-90, tempting wrong=40-65, bad=10-35)
- Each explanation must teach WHY the answer is good or bad
- Include a realistic game situation (inning, outs, count, runners, score)
- Match language to {DIFF_NAMES.get(sc.get('diff', 1), 'Rookie')} difficulty level"""
                clean = {
                    "title": sc.get("title", ""),
                    "description": sc.get("description", ""),
                    "options": sc.get("options", []),
                    "best": sc.get("best", 0),
                    "explanations": sc.get("explanations", []),
                    "rates": sc.get("rates", []),
                    "concept": sc.get("concept", ""),
                    "conceptTag": sc.get("conceptTag", ""),
                    "diff": sc.get("diff", 1),
                    "anim": sc.get("anim", "")
                }
                f.write(json.dumps({"prompt": prompt, "completion": json.dumps(clean), "metadata": {"source": "handcrafted", "position": sc.get("position", "")}}) + "\n")
                handcrafted_count += 1
        stats["handcrafted_sft"] = handcrafted_count

    # ── Load golden examples as SFT data ──
    golden_path = GOLDEN_DIR / "golden_examples.jsonl"
    golden_count = 0
    if golden_path.exists():
        golden_sft_path = OUTPUT_DIR / "sft_golden.jsonl"
        with open(golden_sft_path, "w") as f:
            with open(golden_path, "r") as gf:
                for line in gf:
                    sc = json.loads(line)
                    pos = POSITION_NAMES.get(sc.get("cat", ""), sc.get("cat", ""))
                    diff = sc.get("diff", 1)
                    diff_name = DIFF_NAMES.get(diff, "Rookie")
                    concept = sc.get("concept", "")
                    concept_tag = sc.get("conceptTag", "")

                    prompt = f"""Generate a baseball strategy scenario for a {pos} player.

Difficulty: {diff_name} (level {diff})
Target concept: {concept}
{f'Concept tag: {concept_tag}' if concept_tag else ''}

Requirements:
- Write from 2nd person perspective ("You are...")
- Include 4 options with exactly 1 best answer
- Each option needs a success rate (best=75-90, tempting wrong=40-65, bad=10-35)
- Each explanation must teach WHY the answer is good or bad
- Include a realistic game situation (inning, outs, count, runners, score)
- Match language to {diff_name} difficulty level"""

                    clean = {
                        "title": sc.get("title", ""),
                        "description": sc.get("description", ""),
                        "situation": sc.get("situation", {}),
                        "options": sc.get("options", []),
                        "best": sc.get("best", 0),
                        "explanations": sc.get("explanations", []),
                        "rates": sc.get("rates", []),
                        "concept": sc.get("concept", ""),
                        "conceptTag": sc.get("conceptTag", ""),
                        "diff": sc.get("diff", 1),
                        "anim": sc.get("anim", "")
                    }
                    f.write(json.dumps({
                        "prompt": prompt,
                        "completion": json.dumps(clean),
                        "metadata": {"source": f"golden-{sc.get('source', 'unknown')}", "position": sc.get("cat", "")}
                    }) + "\n")
                    golden_count += 1
        stats["golden_sft"] = golden_count
        print(f"Golden examples loaded: {golden_count}")
    else:
        print("No golden_examples.jsonl found — skipping golden merge")

    return sft, dpo, stats


def print_report(sft, dpo, stats):
    """Print a summary of the dataset creation."""
    print("\n" + "=" * 60)
    print("BSM PHASE 1: DATASET FORMATTING REPORT")
    print("=" * 60)
    print(f"\nSFT examples (coach-rated, ≥7.5):   {len(sft)}")
    print(f"SFT examples (100 golden):           {stats.get('golden_sft', 0)}")
    print(f"SFT examples (584 handcrafted):      {stats.get('handcrafted_sft', 0)}")
    golden = stats.get('golden_sft', 0)
    total_sft_display = len(sft) + golden + stats.get('handcrafted_sft', 0)
    print(f"SFT total:                           {total_sft_display}")
    print(f"\nDPO preference pairs:                {len(dpo)}")
    print(f"\nSkipped (unrated):                   {stats.get('skipped_unrated', 0)}")
    print(f"Excluded (score < 7.5):              {stats.get('sft_excluded_low_quality', 0)}")
    print(f"Skipped DPO (no preference):         {stats.get('dpo_skipped_no_pref', 0)}")

    print(f"\nOutput files:")
    print(f"  {OUTPUT_DIR / 'sft_golden.jsonl'}")
    print(f"  {OUTPUT_DIR / 'sft_handcrafted.jsonl'}")
    print(f"  {OUTPUT_DIR / 'sft.jsonl'}")
    print(f"  {OUTPUT_DIR / 'dpo.jsonl'}")

    print(f"\nTo combine for training:")
    print(f"  cat llm_data/sft_golden.jsonl llm_data/sft_handcrafted.jsonl llm_data/sft.jsonl > llm_data/sft_combined.jsonl")

    total_sft = len(sft) + stats.get("golden_sft", 0) + stats.get("handcrafted_sft", 0)
    if total_sft >= 500:
        print(f"\n✅ You have {total_sft} SFT examples — ready for first fine-tuning run!")
    else:
        need = 500 - total_sft
        print(f"\n⚠️  You have {total_sft} SFT examples. Collect ~{need} more coach ratings for a strong first run.")

    if len(dpo) >= 300:
        print(f"✅ You have {len(dpo)} DPO pairs — ready for preference optimization!")
    else:
        need = 300 - len(dpo)
        print(f"⚠️  You have {len(dpo)} DPO pairs. Need ~{need} more for DPO pass.")

    print()


def run_judge_on_batch(files):
    """Run judge_scenario.js on coach-rating files for LLM quality verification."""
    import subprocess

    judge_script = Path(__file__).parent / "scripts" / "judge_scenario.js"
    if not judge_script.exists():
        print("  judge_scenario.js not found — skipping LLM judge pass")
        return

    print("\n" + "=" * 60)
    print("LLM-AS-JUDGE PRE-FILTER")
    print("=" * 60)
    print(f"Running judge on {len(files)} file(s)...")

    cmd = ["node", str(judge_script)] + [str(f) for f in files] + ["--dry"]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600,
                                cwd=str(Path(__file__).parent))
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
    except subprocess.TimeoutExpired:
        print("  Judge timed out (10 min limit) — continuing without LLM filter")
    except FileNotFoundError:
        print("  Node.js not found — skipping LLM judge pass")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Try to find rating files automatically
        pattern = str(Path(__file__).parent / "coach-ratings-*.json")
        files = sorted(glob.glob(pattern))
        if not files:
            print("Usage: python dataset_formatter.py <coach-ratings.json> [more-files.json ...]")
            print(f"  No files matching {pattern} found.")
            sys.exit(1)
        print(f"Auto-found {len(files)} rating file(s): {', '.join(Path(f).name for f in files)}")
    else:
        files = sys.argv[1:]

    # Run LLM judge first for quality visibility (non-blocking)
    run_judge_on_batch(files)

    items = load_ratings(files)
    print(f"Loaded {len(items)} total scenarios ({sum(1 for i in items if i.get('ratings'))} rated)")

    sft, dpo, stats = create_datasets(items)
    print_report(sft, dpo, stats)
