#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"  # dev (default) or full
SKIP_DOCKER="${SKIP_DOCKER_CHECK:-0}"

if [ "$SKIP_DOCKER" = "1" ]; then
  export LUCRAI_SKIP_DOCKER_CHECK=1
fi

if [ "$MODE" = "full" ]; then
  echo -e "\n🚀 Starting full stack (Docker Compose profile full)..."
  npm run dev:full
else
  echo -e "\n🚀 Starting dev environment..."
  npm run dev:all
fi
