#!/bin/bash
# assemble.sh — Concatenate src/ files into deployable index.jsx
# Output is identical to the original single-file app.
# Preserves: artifact compatibility, preview.html workflow, Cloudflare Pages deploy.
#
# Usage: ./assemble.sh
#
# File order matters — these are sequential segments of the original index.jsx:
#   00_header.js     — Import statement + file header comment
#   01_scenarios.js  — SCENARIOS object (644 handcrafted scenarios)
#   02_situations.js — SITUATION_SETS (Situation Room data)
#   03_config.js     — Config constants (POS_META, LEVELS, ACHS, ANIM_DATA, etc.)
#   04_knowledge.js  — Knowledge system (POS_PRINCIPLES, KNOWLEDGE_MAPS, MASTERY_SCHEMA, etc.)
#   05_brain.js      — BRAIN constant + Brain API functions
#   06_ai_pipeline.js— AI generation pipeline (QUALITY_FIREWALL, grading, agents, prefetch)
#   07_components.js — React components (useSound, Field, Board, Coach, Login/Signup)
#   08_app.js        — Main App() component + CSS

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$SCRIPT_DIR/src"
OUT_FILE="$SCRIPT_DIR/index.jsx"

cat "$SRC_DIR/00_header.js" \
    "$SRC_DIR/01_scenarios.js" \
    "$SRC_DIR/02_situations.js" \
    "$SRC_DIR/03_config.js" \
    "$SRC_DIR/04_knowledge.js" \
    "$SRC_DIR/05_brain.js" \
    "$SRC_DIR/06_ai_pipeline.js" \
    "$SRC_DIR/07_components.js" \
    "$SRC_DIR/08_app.js" \
    > "$OUT_FILE"

echo "Built index.jsx ($(wc -l < "$OUT_FILE") lines, $(du -h "$OUT_FILE" | cut -f1))"
