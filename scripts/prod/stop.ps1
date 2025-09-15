Write-Host "=== STOPPING SERVICES ===" -ForegroundColor Red
Write-Host "Stopping all Docker containers..." -ForegroundColor Yellow

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot
docker-compose down

# Remove dangling images (tagged as <none>)
Write-Host "Removing dangling images..." -ForegroundColor Yellow
docker image prune -f

Set-Location $scriptPath

Write-Host "All services stopped!" -ForegroundColor Green
