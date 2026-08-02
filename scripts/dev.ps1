param(
  [switch]$Full,
  [switch]$NoDockerCheck
)

$ErrorActionPreference = "Stop"

if ($NoDockerCheck) {
  $env:LUCRAI_SKIP_DOCKER_CHECK = "1"
}

# ─── Start dev ──────────────────────────────────────────────────────────
if ($Full) {
  Write-Host "`n🚀 Starting full stack (Docker Compose profile full)..." -ForegroundColor Cyan
  npm run dev:full
} else {
  Write-Host "`n🚀 Starting dev environment..." -ForegroundColor Cyan
  npm run dev:all
}
