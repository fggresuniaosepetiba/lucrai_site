param(
  [Parameter(Position = 0)]
  [ValidateSet("redeploy", "up")]
  [string]$Mode = "redeploy"
)

# Deploy da API Lucraí para o Railway via CLI (projeto sincere-creation / serviço lucrai_site).
# Uso:
#   .\scripts\deploy-railway.ps1            # redeploy do último deploy
#   .\scripts\deploy-railway.ps1 up         # envia o código atual (railway up)
# Pré-requisito: railway CLI instalado e logado (`npm i -g @railway/cli`).

$ErrorActionPreference = "Stop"

$Project = "sincere-creation"
$Service = "lucrai_site"

Set-Location (Join-Path $PSScriptRoot "..\backend")

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
  Write-Host "❌ railway CLI não encontrado. Instale com: npm i -g @railway/cli" -ForegroundColor Red
  exit 1
}

$null = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Não logado no Railway. Rode: railway login" -ForegroundColor Red
  exit 1
}

if ($Mode -eq "up") {
  Write-Host "🚀 Enviando código para o Railway ($Project/$Service)..." -ForegroundColor Cyan
  railway up --project $Project --service $Service
} else {
  Write-Host "🔁 Redeploy do último deploy no Railway ($Project/$Service)..." -ForegroundColor Cyan
  railway redeploy --project $Project --service $Service --yes
}

Write-Host "✅ Deploy disparado. Acompanhe em: railway logs --project $Project --service $Service" -ForegroundColor Green
