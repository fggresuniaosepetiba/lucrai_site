#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"  # dev (default) or full

check_docker() {
  echo "🔍 Checking Docker..."
  if ! docker info >/dev/null 2>&1; then
    echo "🐳 Docker not running. Attempting to start..."

    case "$(uname -s)" in
      Darwin)
        open -a Docker
        ;;
      Linux)
        if systemctl is-active --quiet docker 2>/dev/null; then
          : # docker is active via systemd
        elif command -v dockerd &>/dev/null; then
          sudo dockerd &
        else
          echo "❌ Cannot start Docker automatically on Linux."
          echo "   Try: sudo systemctl start docker"
          exit 1
        fi
        ;;
      *)
        echo "❌ Unknown OS. Please start Docker manually."
        exit 1
        ;;
    esac

    echo "⏳ Waiting for Docker..."
    local timeout=120 elapsed=0
    until docker info >/dev/null 2>&1; do
      sleep 3
      elapsed=$((elapsed + 3))
      echo -n "."
      if [ "$elapsed" -ge "$timeout" ]; then
        echo -e "\n❌ Docker did not start within ${timeout}s."
        exit 1
      fi
    done
    echo -e "\n✅ Docker is ready!"
  else
    echo "✅ Docker is running."
  fi
}

check_docker

if [ "$MODE" = "full" ]; then
  echo -e "\n🚀 Starting full stack (Docker Compose profile full)..."
  npm run dev:full
else
  echo -e "\n🚀 Starting dev environment..."
  npm run dev:all
fi
