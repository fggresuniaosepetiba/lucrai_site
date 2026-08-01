#!/usr/bin/env bash
set -euo pipefail

# Deploy da API Lucraí para o Railway via CLI (projeto sincere-creation / serviço lucrai_site).
# Uso:
#   ./scripts/deploy-railway.sh            # redeploy do último deploy
#   ./scripts/deploy-railway.sh up         # envia o código atual (railway up)
# Pré-requisito: railway CLI instalado e logado (`npm i -g @railway/cli`).

PROJECT="sincere-creation"
SERVICE="lucrai_site"
MODE="${1:-redeploy}"

cd "$(dirname "$0")/../backend"

if ! command -v railway &>/dev/null; then
  echo "❌ railway CLI não encontrado. Instale com: npm i -g @railway/cli" >&2
  exit 1
fi

if ! railway whoami >/dev/null 2>&1; then
  echo "❌ Não logado no Railway. Rode: railway login" >&2
  exit 1
fi

if [ "$MODE" = "up" ]; then
  echo "🚀 Enviando código para o Railway ($PROJECT/$SERVICE)..."
  railway up --project "$PROJECT" --service "$SERVICE"
else
  echo "🔁 Redeploy do último deploy no Railway ($PROJECT/$SERVICE)..."
  railway redeploy --project "$PROJECT" --service "$SERVICE" --yes
fi

echo "✅ Deploy disparado. Acompanhe em: railway logs --project $PROJECT --service $SERVICE"
