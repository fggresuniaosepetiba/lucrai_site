param(
  [switch]$Full,
  [switch]$NoDockerCheck
)

$ErrorActionPreference = "Stop"

# ─── Docker Desktop check ───────────────────────────────────────────────
if (-not $NoDockerCheck) {
  Write-Host "🔍 Checking Docker Desktop..." -ForegroundColor Cyan
  $dockerOk = $false
  try {
    $info = docker info 2>&1
    $dockerOk = $LASTEXITCODE -eq 0
  } catch {
    $dockerOk = $false
  }

  if (-not $dockerOk) {
    Write-Host "🐳 Docker Desktop not running. Starting Docker service..." -ForegroundColor Yellow
    try {
      net start com.docker.service 2>&1 | Out-Null
    } catch {
      $dockerPath = @(
        "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe"
      ) | Where-Object { Test-Path $_ } | Select-Object -First 1

      if (-not $dockerPath) {
        Write-Host "❌ Docker Desktop not found. Please install Docker Desktop first." -ForegroundColor Red
        Write-Host "   https://www.docker.com/products/docker-desktop/"
        exit 1
      }

      Write-Host "   Starting Docker Desktop GUI..." -ForegroundColor Yellow
      Start-Process $dockerPath -WindowStyle Hidden
    }
    Write-Host "⏳ Waiting for Docker to start..." -ForegroundColor Yellow

    $timeout = 120
    $elapsed = 0
    do {
      Start-Sleep -Seconds 3
      $elapsed += 3
      try {
        docker info 2>&1 | Out-Null
        $ready = $LASTEXITCODE -eq 0
      } catch { $ready = $false }
      if ($ready) { break }
      Write-Host "." -NoNewline -ForegroundColor Yellow
    } while ($elapsed -lt $timeout)

    if (-not $ready) {
      Write-Host "`n❌ Docker did not start within $timeout seconds."
      Write-Host "   Try starting Docker Desktop manually and run again."
      exit 1
    }
    Write-Host "`n✅ Docker Desktop is ready!" -ForegroundColor Green
  } else {
    Write-Host "✅ Docker Desktop is running." -ForegroundColor Green
  }
}

# ─── Start dev ──────────────────────────────────────────────────────────
if ($Full) {
  Write-Host "`n🚀 Starting full stack (Docker Compose profile full)..." -ForegroundColor Cyan
  npm run dev:full
} else {
  Write-Host "`n🚀 Starting dev environment..." -ForegroundColor Cyan
  npm run dev:all
}
