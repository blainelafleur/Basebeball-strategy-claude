#!/bin/bash
# Legacy wrapper — redirects to the production 70B training pipeline
echo "Redirecting to train_70b.sh (production 70B pipeline)..."
exec "$(dirname "$0")/train_70b.sh" "$@"
