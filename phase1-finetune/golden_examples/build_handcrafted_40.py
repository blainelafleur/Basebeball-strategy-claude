#!/usr/bin/env python3
"""
Build handcrafted_40.jsonl from Gold-tier scenarios in the audit report.
Selects 40 scenarios with maximum position diversity from 181 Gold-tier (clientScore=100).
Validates and adjusts rates to meet strict requirements.
"""

import json
import re
import sys
import os
from collections import defaultdict

AUDIT_PATH = "/Users/blainelafleur/Desktop/baseball-strategy-master/phase1-finetune/audit-report.json"
INDEX_PATH = "/Users/blainelafleur/Desktop/baseball-strategy-master/index.jsx"
OUTPUT_PATH = "/Users/blainelafleur/Desktop/baseball-strategy-master/phase1-finetune/golden_examples/handcrafted_40.jsonl"

ALL_POSITIONS = [
    "pitcher", "catcher", "firstBase", "secondBase", "shortstop", "thirdBase",
    "leftField", "centerField", "rightField",
    "batter", "baserunner", "manager",
    "famous", "rules", "counts"
]

# Target: 40 scenarios, ~2-3 per position across 15 categories
# Some positions have fewer golds, so we'll distribute as evenly as possible
TARGET_TOTAL = 40


def load_audit_golds():
    """Load Gold-tier scenario IDs and their positions from audit report."""
    with open(AUDIT_PATH) as f:
        data = json.load(f)
    golds = [r for r in data["allResults"] if r["clientScore"] == 100]
    print(f"Found {len(golds)} Gold-tier scenarios in audit report")
    return golds


def extract_scenarios_from_jsx(gold_ids):
    """Parse index.jsx and extract scenario objects for the given IDs."""
    with open(INDEX_PATH, "r") as f:
        content = f.read()

    # Find the SCENARIOS object - it starts after "const SCENARIOS = {"
    # We need to extract each scenario by ID from the JSX
    scenarios = {}

    # For each position category, find its array and parse scenarios
    for position in ALL_POSITIONS:
        # Find the position array in SCENARIOS
        # Pattern: position: [ ... ] or position:[ ... ]
        pattern = rf'(?:^|\n)\s*{position}\s*:\s*\['
        match = re.search(pattern, content)
        if not match:
            print(f"  Warning: Could not find position '{position}' in SCENARIOS")
            continue

        # From the match, find all scenario objects in this array
        start = match.end()
        # We need to find matching scenarios by ID within this position's array
        # Extract individual scenario objects by finding {id:"xxx",...}
        bracket_depth = 1  # We're already inside the [
        pos = start
        current_obj_start = None

        while pos < len(content) and bracket_depth > 0:
            ch = content[pos]
            if ch == '{' and bracket_depth == 1:
                current_obj_start = pos
                bracket_depth += 1
            elif ch == '{':
                bracket_depth += 1
            elif ch == '}':
                bracket_depth -= 1
                if bracket_depth == 1 and current_obj_start is not None:
                    obj_text = content[current_obj_start:pos + 1]
                    # Extract the ID from the object
                    id_match = re.search(r'id\s*:\s*["\']([^"\']+)["\']', obj_text)
                    if id_match:
                        sid = id_match.group(1)
                        if sid in gold_ids:
                            scenarios[sid] = {
                                "raw": obj_text,
                                "position": position
                            }
                    current_obj_start = None
            elif ch == ']':
                if bracket_depth == 1:
                    break
            # Handle strings (skip their contents)
            elif ch in ('"', "'", '`'):
                pos += 1
                while pos < len(content) and content[pos] != ch:
                    if content[pos] == '\\':
                        pos += 1
                    pos += 1
            pos += 1

    print(f"Extracted {len(scenarios)} Gold scenarios from index.jsx")
    return scenarios


def parse_js_object(raw_text):
    """Parse a JavaScript object literal into a Python dict."""
    text = raw_text.strip()

    # Convert JS object to JSON-compatible format
    # This is tricky because JS objects have unquoted keys, trailing commas, etc.

    # Strategy: use regex to extract known fields

    result = {}

    # id
    m = re.search(r'id\s*:\s*["\']([^"\']+)["\']', text)
    if m:
        result["id"] = m.group(1)

    # title
    m = re.search(r'title\s*:\s*["\'](.+?)["\'](?:\s*,)', text)
    if m:
        result["title"] = m.group(1)

    # diff
    m = re.search(r'diff\s*:\s*(\d+)', text)
    if m:
        result["diff"] = int(m.group(1))

    # cat
    m = re.search(r'cat\s*:\s*["\']([^"\']+)["\']', text)
    if m:
        result["cat"] = m.group(1)

    # conceptTag
    m = re.search(r'conceptTag\s*:\s*["\']([^"\']+)["\']', text)
    if m:
        result["conceptTag"] = m.group(1)

    # concept
    m = re.search(r'(?<![a-zA-Z])concept\s*:\s*["\'](.+?)["\'](?:\s*,|\s*\})', text)
    if m:
        result["concept"] = m.group(1)

    # anim
    m = re.search(r'anim\s*:\s*["\']([^"\']+)["\']', text)
    if m:
        result["anim"] = m.group(1)

    # description - can contain quotes, so be careful
    m = re.search(r'description\s*:\s*["\'](.+?)["\'](?:\s*,\s*\n|\s*,\s*s)', text, re.DOTALL)
    if not m:
        m = re.search(r'description\s*:\s*"(.+?)"(?:\s*,)', text, re.DOTALL)
    if not m:
        # Try with backtick
        m = re.search(r'description\s*:\s*`(.+?)`', text, re.DOTALL)
    if m:
        result["description"] = m.group(1).replace('\n', ' ').strip()

    # situation object
    sit_match = re.search(r'situation\s*:\s*\{([^}]+)\}', text)
    if sit_match:
        sit_text = sit_match.group(1)
        situation = {}
        # inning
        m2 = re.search(r'inning\s*:\s*["\']([^"\']+)["\']', sit_text)
        if m2:
            situation["inning"] = m2.group(1)
        # outs
        m2 = re.search(r'outs\s*:\s*(\d+)', sit_text)
        if m2:
            situation["outs"] = int(m2.group(1))
        # count
        m2 = re.search(r'count\s*:\s*["\']([^"\']+)["\']', sit_text)
        if m2:
            situation["count"] = m2.group(1)
        # runners
        m2 = re.search(r'runners\s*:\s*\[([^\]]*)\]', sit_text)
        if m2:
            runners_str = m2.group(1).strip()
            if runners_str:
                situation["runners"] = [int(x.strip()) for x in runners_str.split(',')]
            else:
                situation["runners"] = []
        # score
        m2 = re.search(r'score\s*:\s*\[([^\]]+)\]', sit_text)
        if m2:
            situation["score"] = [int(x.strip()) for x in m2.group(1).split(',')]
        result["situation"] = situation

    # options array - array of strings
    opts_match = re.search(r'options\s*:\s*\[', text)
    if opts_match:
        result["options"] = extract_string_array(text, opts_match.end() - 1)

    # best
    m = re.search(r'best\s*:\s*(\d+)', text)
    if m:
        result["best"] = int(m.group(1))

    # explanations array
    expl_match = re.search(r'explanations\s*:\s*\[', text)
    if expl_match:
        result["explanations"] = extract_string_array(text, expl_match.end() - 1)

    # rates array
    m = re.search(r'rates\s*:\s*\[([^\]]+)\]', text)
    if m:
        result["rates"] = [int(x.strip()) for x in m.group(1).split(',')]

    return result


def extract_string_array(text, start_bracket):
    """Extract an array of strings starting at the [ character."""
    strings = []
    pos = start_bracket + 1  # skip [
    while pos < len(text):
        # Skip whitespace
        while pos < len(text) and text[pos] in ' \t\n\r,':
            pos += 1
        if pos >= len(text) or text[pos] == ']':
            break
        if text[pos] in ('"', "'"):
            quote = text[pos]
            pos += 1
            s = []
            while pos < len(text) and text[pos] != quote:
                if text[pos] == '\\':
                    pos += 1
                    if pos < len(text):
                        if text[pos] == 'n':
                            s.append('\n')
                        elif text[pos] == 't':
                            s.append('\t')
                        elif text[pos] == quote:
                            s.append(quote)
                        elif text[pos] == '\\':
                            s.append('\\')
                        else:
                            s.append(text[pos])
                else:
                    s.append(text[pos])
                pos += 1
            pos += 1  # skip closing quote
            strings.append(''.join(s))
        elif text[pos] == '`':
            pos += 1
            s = []
            while pos < len(text) and text[pos] != '`':
                s.append(text[pos])
                pos += 1
            pos += 1
            strings.append(''.join(s))
        else:
            # skip non-string content
            pos += 1
    return strings


def select_diverse_40(golds, scenarios):
    """Select 40 scenarios with maximum position diversity."""
    # Group gold scenarios by position
    by_position = defaultdict(list)
    for g in golds:
        if g["id"] in scenarios:
            by_position[g["position"]].append(g["id"])

    print("\nGold scenarios available per position:")
    for pos in ALL_POSITIONS:
        print(f"  {pos}: {len(by_position.get(pos, []))}")

    selected = []
    # Round-robin: take scenarios from each position
    # First pass: 2 per position (30 scenarios for 15 positions)
    # Second pass: fill remaining 10 from positions with most available

    # First pass: 2 from each position that has golds
    remaining = {pos: list(ids) for pos, ids in by_position.items()}
    for pos in ALL_POSITIONS:
        if pos in remaining and remaining[pos]:
            take = min(2, len(remaining[pos]))
            for i in range(take):
                selected.append(remaining[pos].pop(0))

    print(f"\nAfter first pass (2 per position): {len(selected)} selected")

    # Second pass: fill to 40, prioritizing positions with fewest selected
    needed = TARGET_TOTAL - len(selected)
    # Count how many we have per position
    selected_set = set(selected)
    pos_selected_count = defaultdict(int)
    for g in golds:
        if g["id"] in selected_set:
            pos_selected_count[g["position"]] += 1

    # Sort positions by (count selected ASC, remaining available DESC)
    while needed > 0:
        # Find position with fewest selected that still has remaining
        best_pos = None
        best_score = (999, 0)
        for pos in ALL_POSITIONS:
            if pos in remaining and remaining[pos]:
                score = (pos_selected_count[pos], -len(remaining[pos]))
                if score < best_score:
                    best_score = score
                    best_pos = pos
        if best_pos is None:
            break
        sid = remaining[best_pos].pop(0)
        selected.append(sid)
        pos_selected_count[best_pos] += 1
        needed -= 1

    print(f"After second pass: {len(selected)} selected")
    print("\nFinal distribution:")
    final_counts = defaultdict(int)
    for g in golds:
        if g["id"] in set(selected):
            final_counts[g["position"]] += 1
    for pos in ALL_POSITIONS:
        print(f"  {pos}: {final_counts.get(pos, 0)}")

    return selected


def validate_and_fix_rates(rates, best):
    """Validate and adjust rates to meet strict requirements.
    - rates[best] must be 78-90
    - At least one wrong answer rate in 42-65 (tempting wrong)
    - Other wrong rates in 12-35
    - Rate sum 170-190
    """
    rates = list(rates)  # copy
    wrong_indices = [i for i in range(4) if i != best]

    # Fix best rate to 78-90
    if rates[best] < 78:
        rates[best] = 78
    elif rates[best] > 90:
        rates[best] = 90

    # Sort wrong indices by their current rate (descending) to pick tempting wrong
    wrong_sorted = sorted(wrong_indices, key=lambda i: rates[i], reverse=True)

    # The highest wrong answer should be the "tempting wrong" (42-65)
    tempting_idx = wrong_sorted[0]
    if rates[tempting_idx] < 42:
        rates[tempting_idx] = 42
    elif rates[tempting_idx] > 65:
        rates[tempting_idx] = 65

    # Other wrong answers should be 12-35
    for idx in wrong_sorted[1:]:
        if rates[idx] < 12:
            rates[idx] = 12
        elif rates[idx] > 35:
            rates[idx] = 35

    # Check sum target: 170-190
    total = sum(rates)
    if total < 170:
        # Increase: prefer bumping tempting wrong or best
        deficit = 170 - total
        # Try bumping tempting wrong first (up to 65)
        bump = min(deficit, 65 - rates[tempting_idx])
        rates[tempting_idx] += bump
        deficit -= bump
        # Then bump best (up to 90)
        if deficit > 0:
            bump = min(deficit, 90 - rates[best])
            rates[best] += bump
            deficit -= bump
        # Then bump other wrongs (up to 35 each)
        if deficit > 0:
            for idx in wrong_sorted[1:]:
                bump = min(deficit, 35 - rates[idx])
                rates[idx] += bump
                deficit -= bump
                if deficit <= 0:
                    break
    elif total > 190:
        # Decrease: prefer reducing low wrong answers
        excess = total - 190
        for idx in reversed(wrong_sorted[1:]):
            red = min(excess, rates[idx] - 12)
            rates[idx] -= red
            excess -= red
            if excess <= 0:
                break
        # Then reduce tempting wrong
        if excess > 0:
            red = min(excess, rates[tempting_idx] - 42)
            rates[tempting_idx] -= red
            excess -= red
        # Then reduce best
        if excess > 0:
            red = min(excess, rates[best] - 78)
            rates[best] -= red
            excess -= red

    return rates


def validate_scenario(scenario):
    """Check all validation rules, return list of issues."""
    issues = []
    if len(scenario.get("options", [])) != 4:
        issues.append(f"Expected 4 options, got {len(scenario.get('options', []))}")
    if len(scenario.get("explanations", [])) != 4:
        issues.append(f"Expected 4 explanations, got {len(scenario.get('explanations', []))}")
    for i, e in enumerate(scenario.get("explanations", [])):
        if not e or not e.strip():
            issues.append(f"Explanation {i} is empty")
    rates = scenario.get("rates", [])
    best = scenario.get("best", 0)
    if len(rates) != 4:
        issues.append(f"Expected 4 rates, got {len(rates)}")
    else:
        if not (78 <= rates[best] <= 90):
            issues.append(f"best rate {rates[best]} not in 78-90")
        wrong = [rates[i] for i in range(4) if i != best]
        if not any(42 <= r <= 65 for r in wrong):
            issues.append(f"No tempting wrong (42-65) in wrong rates {wrong}")
        other_wrong = sorted(wrong)[:-1]  # exclude highest wrong
        for r in other_wrong:
            if not (12 <= r <= 35):
                issues.append(f"Wrong rate {r} not in 12-35")
        total = sum(rates)
        if not (170 <= total <= 190):
            issues.append(f"Rate sum {total} not in 170-190")
    return issues


def main():
    # Step 1: Load gold scenarios from audit
    golds = load_audit_golds()
    gold_ids = set(g["id"] for g in golds)

    # Step 2: Extract scenarios from index.jsx
    scenarios = extract_scenarios_from_jsx(gold_ids)

    # Step 3: Select 40 with max diversity
    selected_ids = select_diverse_40(golds, scenarios)

    # Step 4: Parse and build output
    # Build position lookup from audit
    id_to_position = {g["id"]: g["position"] for g in golds}

    output = []
    errors = []
    for sid in selected_ids:
        if sid not in scenarios:
            errors.append(f"Scenario {sid} not found in extracted scenarios")
            continue

        raw = scenarios[sid]["raw"]
        parsed = parse_js_object(raw)

        if not parsed.get("id"):
            errors.append(f"Failed to parse scenario {sid}")
            continue

        # Fix rates
        if parsed.get("rates") and parsed.get("best") is not None:
            parsed["rates"] = validate_and_fix_rates(parsed["rates"], parsed["best"])

        # Build output object
        obj = {
            "id": parsed.get("id"),
            "title": parsed.get("title"),
            "diff": parsed.get("diff"),
            "cat": parsed.get("cat"),
            "conceptTag": parsed.get("conceptTag", parsed.get("concept", "")),
            "description": parsed.get("description"),
            "situation": parsed.get("situation"),
            "options": parsed.get("options"),
            "best": parsed.get("best"),
            "explanations": parsed.get("explanations"),
            "rates": parsed.get("rates"),
            "concept": parsed.get("concept"),
            "anim": parsed.get("anim"),
            "source": "handcrafted",
            "coachScore": None,
        }

        # Validate
        issues = validate_scenario(obj)
        if issues:
            print(f"  WARN {sid}: {issues}")

        output.append(obj)

    if errors:
        print(f"\nErrors: {len(errors)}")
        for e in errors:
            print(f"  {e}")

    # Write output
    with open(OUTPUT_PATH, "w") as f:
        for obj in output:
            f.write(json.dumps(obj, ensure_ascii=False) + "\n")

    print(f"\nWrote {len(output)} scenarios to {OUTPUT_PATH}")

    # Verify
    with open(OUTPUT_PATH) as f:
        lines = f.readlines()
    print(f"Verification: {len(lines)} lines in output file")

    parse_errors = 0
    for i, line in enumerate(lines):
        try:
            json.loads(line)
        except json.JSONDecodeError as e:
            print(f"  JSON error on line {i+1}: {e}")
            parse_errors += 1

    if parse_errors == 0:
        print("All lines are valid JSON")
    else:
        print(f"{parse_errors} JSON parse errors!")

    if len(output) != TARGET_TOTAL:
        print(f"WARNING: Expected {TARGET_TOTAL} scenarios, got {len(output)}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
