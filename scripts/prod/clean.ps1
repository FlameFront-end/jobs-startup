Write-Host "=== JOBS STARTUP - CLEAN ===" -ForegroundColor Cyan
Write-Host "Cleaning Docker project resources..." -ForegroundColor Yellow

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "Stopping all containers..." -ForegroundColor Yellow
docker-compose down --remove-orphans

Write-Host "Stopping old containers..." -ForegroundColor Yellow
docker stop postgres redis ai-service parser client 2>$null
docker stop jobs-startup-postgres jobs-startup-redis jobs-startup-ai-service jobs-startup-parser jobs-startup-client 2>$null

Write-Host "Removing old containers..." -ForegroundColor Yellow
docker rm postgres redis ai-service parser client 2>$null
docker rm jobs-startup-postgres jobs-startup-redis jobs-startup-ai-service jobs-startup-parser jobs-startup-client 2>$null

Write-Host "Removing all project images..." -ForegroundColor Yellow
docker rmi ai-service:latest parser:latest client:latest 2>$null
docker rmi jobs-startup-ai-service jobs-startup-parser jobs-startup-client 2>$null

Write-Host "Removing all project volumes..." -ForegroundColor Yellow
docker volume rm jobs-startup_postgres_data jobs-startup_redis_data 2>$null
docker volume rm jobs-startup_postgres_data jobs-startup_redis_data 2>$null

Write-Host "Removing all project networks..." -ForegroundColor Yellow
docker network rm jobs-startup_jobs_network 2>$null
docker network rm jobs-startup_jobs_network 2>$null

Write-Host "Cleaning all unused resources..." -ForegroundColor Yellow
docker system prune -a -f --volumes

Set-Location $scriptPath

Write-Host "Project cleanup completed!" -ForegroundColor Green
