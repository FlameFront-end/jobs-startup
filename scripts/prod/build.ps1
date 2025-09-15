Write-Host "=== JOBS STARTUP - BUILD ===" -ForegroundColor Cyan
Write-Host "Building all services with Docker..." -ForegroundColor Yellow

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# Stop any running services first
Write-Host "Stopping any running services..." -ForegroundColor Yellow
docker-compose down

# Remove PostgreSQL data volume to fix lock issues
Write-Host "Removing PostgreSQL data volume..." -ForegroundColor Yellow
docker volume rm jobs-startup_postgres_data 2>$null

# Remove dangling images (tagged as <none>)
Write-Host "Removing dangling images..." -ForegroundColor Yellow
docker image prune -f

# Remove old duplicate images
Write-Host "Removing old duplicate images..." -ForegroundColor Yellow
docker images --format "table {{.Repository}}:{{.Tag}}" | findstr "jobs-startup" | ForEach-Object { docker rmi $_ 2>$null }

# Remove entire logs directory and recreate it
$logsDir = Join-Path $projectRoot "logs"
if (Test-Path $logsDir) {
    Remove-Item -Path $logsDir -Recurse -Force
    Write-Host "Removed old logs directory" -ForegroundColor Yellow
}

New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
Write-Host "Created fresh logs directory" -ForegroundColor Green

# Build and start all services
Write-Host "Building Docker images..." -ForegroundColor Yellow
docker-compose up --build -d
Set-Location $scriptPath

# Wait a moment for services to start
Start-Sleep -Seconds 5

# Remove unwanted log files
$unwantedFiles = @("access.log", "error.log", "combined.log")
foreach ($file in $unwantedFiles) {
    $filePath = Join-Path $logsDir $file
    if (Test-Path $filePath) {
        Remove-Item -Path $filePath -Force
        Write-Host "Removed unwanted log file: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n=== SERVICES BUILT AND STARTED ===" -ForegroundColor Green
Write-Host "AI Service: http://localhost:8001" -ForegroundColor White
Write-Host "Parser API: http://localhost:3000/api" -ForegroundColor White
Write-Host "Parser Swagger: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "Client App: http://localhost:5173" -ForegroundColor White
Write-Host "PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "Redis: localhost:6379" -ForegroundColor White

Write-Host "`n=== LOG FILES ===" -ForegroundColor Cyan
Write-Host "AI Service: $logsDir\ai-service.log" -ForegroundColor White
Write-Host "Parser: $logsDir\parser.log" -ForegroundColor White
Write-Host "Client: $logsDir\client.log" -ForegroundColor White
Write-Host "PostgreSQL: $logsDir\postgres.log" -ForegroundColor White
Write-Host "Redis: $logsDir\redis.log" -ForegroundColor White

Write-Host "`nBuild completed successfully!" -ForegroundColor Green
Write-Host "View logs: npm run logs" -ForegroundColor White
