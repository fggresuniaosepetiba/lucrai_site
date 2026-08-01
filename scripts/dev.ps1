param(
  [switch]$Full,
  [switch]$NoDockerCheck
)

$ErrorActionPreference = "Stop"

# ─── Docker daemon check (CLI-only, never opens Docker Desktop) ─────────
if (-not $NoDockerCheck) {
  Write-Host "🔍 Checking Docker daemon..." -ForegroundColor Cyan
  $dockerOk = $false
  try {
    docker info 2>&1 | Out-Null
    $dockerOk = $LASTEXITCODE -eq 0
  } catch {
    $dockerOk = $false
  }

  if (-not $dockerOk) {
    Write-Host "❌ Docker daemon is not running." -ForegroundColor Red
    Write-Host "   Start Docker manually (e.g. Docker Desktop or dockerd) and run again."
    Write-Host "   Note: this script starts containers via Docker CLI only and never opens Docker Desktop."
    exit 1
  }
  Write-Host "✅ Docker daemon is running." -ForegroundColor Green
}

# ─── Start dev ──────────────────────────────────────────────────────────
if ($Full) {
  Write-Host "`n🚀 Starting full stack (Docker Compose profile full)..." -ForegroundColor Cyan
  npm run dev:full
} else {
  Write-Host "`n🚀 Starting dev environment..." -ForegroundColor Cyan
  npm run dev:all
}
