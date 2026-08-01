#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"  # dev (default) or full

# ─── Docker daemon check (CLI-only, never opens Docker Desktop) ─────────
echo "🔍 Checking Docker daemon..."
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker daemon is not running." >&2
  echo "   Start Docker manually (e.g. Docker Desktop or dockerd) and run again." >&2
  echo "   Note: this script starts containers via Docker CLI only and never opens Docker Desktop." >&2
  exit 1
fi
echo "✅ Docker daemon is running."

if [ "$MODE" = "full" ]; then
  echo -e "\n🚀 Starting full stack (Docker Compose profile full)..."
  npm run dev:full
else
  echo -e "\n🚀 Starting dev environment..."
  npm run dev:all
fi
