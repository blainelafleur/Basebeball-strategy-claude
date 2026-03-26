#!/bin/bash
# push-to-obsidian.sh - Push a dev log from Claude Code to Obsidian vault
# Usage: ./scripts/push-to-obsidian.sh "Summary of what was done"
#
# Called at the end of Claude Code sessions to persist context

VAULT="/Users/blainelafleur/Library/Mobile Documents/iCloud~md~obsidian/Documents/My Second Brain"
DATE=$(date +%Y-%m-%d)
LOGFILE="$VAULT/20 Projects/Baseball Strategy Master/BSM Dev Log $DATE.md"
CONTEXT="$VAULT/20 Projects/Baseball Strategy Master/Baseball App - Claude Code Context.md"
SUMMARY="${1:-No summary provided}"

# Check if a log already exists for today (append session number)
if [ -f "$LOGFILE" ]; then
    SESSION=2
    while [ -f "$VAULT/20 Projects/Baseball Strategy Master/BSM Dev Log $DATE-s$SESSION.md" ]; do
        SESSION=$((SESSION + 1))
    done
    LOGFILE="$VAULT/20 Projects/Baseball Strategy Master/BSM Dev Log $DATE-s$SESSION.md"
fi

cat > "$LOGFILE" << DEVLOG
---
type: dev-log
created: $DATE
modified: $DATE
tags: [dev-log, claude-code, baseball-dev-log]
project: "[[Baseball Strategy Master App]]"
date: $DATE
summary: $SUMMARY
---

# Dev Log - $DATE

## What I Built / Changed
- $SUMMARY

## Key Decisions Made
| Decision | Rationale |
|----------|-----------|
| | |

## What Broke / Bugs Found
- None noted

## What I Learned
-

## Cross-Domain Connections
- How does this session's work connect to Vested, coaching, parenting, or AI Mastery?
-

## Next Session: Pick Up Here
-

## Connections
- **Project:** [[Baseball Strategy Master App]]
- **Daily Note:** [[$DATE]]
DEVLOG

echo "Dev log written to: $LOGFILE"
echo ""
echo "IMPORTANT: Now update the dev log with full details before ending session."
echo "Also update: $CONTEXT (Current State section)"
