#!/bin/bash
# pull-from-obsidian.sh - Pull context from Obsidian vault at Claude Code session start
# Usage: ./scripts/pull-from-obsidian.sh
#
# Outputs the project context + last 3 dev logs for Claude to consume

VAULT="/Users/blainelafleur/Library/Mobile Documents/iCloud~md~obsidian/Documents/My Second Brain"

echo "========================================"
echo "OBSIDIAN VAULT CONTEXT - BASEBALL STRATEGY MASTER"
echo "========================================"
echo ""

BSM="$VAULT/20 Projects/Baseball Strategy Master"

echo "--- PROJECT CONTEXT ---"
if [ -f "$BSM/Baseball App - Claude Code Context.md" ]; then
    cat "$BSM/Baseball App - Claude Code Context.md"
else
    echo "[No context file found - create one at end of this session]"
fi

echo ""
echo "--- RECENT DEV LOGS (last 3) ---"
LOGS=$(ls -t "$BSM/BSM Dev Log"* 2>/dev/null | head -3)
if [ -z "$LOGS" ]; then
    echo "[No dev logs yet - this will be the first session tracked]"
else
    echo "$LOGS" | while read logfile; do
        echo ""
        echo "=== $(basename "$logfile") ==="
        cat "$logfile"
        echo ""
    done
fi

echo ""
echo "--- ARCHITECTURE DECISIONS ---"
if [ -f "$BSM/BSM Architecture Decisions.md" ]; then
    cat "$BSM/BSM Architecture Decisions.md"
else
    echo "[No architecture decisions file found]"
fi

echo ""
echo "--- IDEA/OBSERVATION NOTES (check for offline edits) ---"
NOTES=$(ls -t "$BSM/BSM Idea"* "$BSM/BSM Observation"* 2>/dev/null)
if [ -z "$NOTES" ]; then
    echo "[No idea/observation notes yet]"
else
    echo "$NOTES" | while read notefile; do
        MOD=$(stat -f "%Sm" -t "%Y-%m-%d" "$notefile" 2>/dev/null || stat -c "%y" "$notefile" 2>/dev/null | cut -d' ' -f1)
        echo "  $MOD  $(basename "$notefile")"
    done
fi

echo ""
echo "========================================"
echo "Context loaded. You are now session-aware."
echo "========================================"
