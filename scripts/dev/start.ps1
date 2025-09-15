Write-Host "=== JOBS STARTUP - LOCAL DEVELOPMENT ===" -ForegroundColor Cyan
Write-Host "Starting all services locally..." -ForegroundColor Yellow

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptPath)
Set-Location $projectRoot

# Stop any existing processes first
Write-Host "Stopping existing processes..." -ForegroundColor Yellow

# Stop AI Service processes
$aiProcesses = Get-Process | Where-Object { $_.ProcessName -eq "python" -and $_.CommandLine -like "*uvicorn*" }
foreach ($process in $aiProcesses) {
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}

# Stop Parser Service processes
$parserProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*parser*" }
foreach ($process in $parserProcesses) {
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}

# Stop Client processes
$clientProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*vite*" }
foreach ($process in $clientProcesses) {
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}

# Wait a moment for processes to fully stop
Start-Sleep -Seconds 2

# Clean and recreate logs directory
$logsDir = Join-Path $projectRoot "logs"
if (Test-Path $logsDir) {
    Remove-Item -Path $logsDir -Recurse -Force
    Write-Host "Cleaned logs directory" -ForegroundColor Yellow
}

New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
Write-Host "Created logs directory" -ForegroundColor Green

# Start AI Service
Write-Host "Starting AI Service..." -ForegroundColor Yellow
$aiServicePath = Join-Path $projectRoot "ai-service"

# Start AI service
$venvPath = Join-Path $aiServicePath "venv"
if (Test-Path $venvPath) {
    $pythonPath = Join-Path $venvPath "Scripts\python.exe"
    Start-Process -FilePath "cmd" -ArgumentList "/c", "cd /d `"$aiServicePath`" && `"$pythonPath`" -m app.main > `"$logsDir\ai-service.log`" 2>&1" -WindowStyle Hidden
    Write-Host "AI Service started on port 8001" -ForegroundColor Green
} else {
    Write-Host "Virtual environment not found. Please run setup first." -ForegroundColor Red
    exit 1
}

# Start Parser Service
Write-Host "Starting Parser Service..." -ForegroundColor Yellow
$parserPath = Join-Path $projectRoot "parser"
Set-Location $parserPath

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing parser dependencies..." -ForegroundColor Yellow
    npm install
}

# Start parser in development mode
Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run start:dev > `"$logsDir\parser.log`" 2>&1" -WindowStyle Hidden
Write-Host "Parser Service started on port 3000" -ForegroundColor Green

# Start Client
Write-Host "Starting Client..." -ForegroundColor Yellow
$clientPath = Join-Path $projectRoot "client"
Set-Location $clientPath

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    npm install
}

# Start client in development mode (no logging)
Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -WindowStyle Hidden
Write-Host "Client started on port 5173" -ForegroundColor Green

Set-Location $projectRoot

# Wait for services to start
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n=== SERVICES STARTED ===" -ForegroundColor Green
Write-Host "AI Service: http://localhost:8001" -ForegroundColor White
Write-Host "Parser API: http://localhost:3000/api" -ForegroundColor White
Write-Host "Parser Swagger: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "Client App: http://localhost:5173" -ForegroundColor White

Write-Host "`n=== LOG FILES ===" -ForegroundColor Cyan
Write-Host "AI Service: $logsDir\ai-service.log" -ForegroundColor White
Write-Host "Parser: $logsDir\parser.log" -ForegroundColor White

Write-Host "`nAll services are running in background. Check log files for output." -ForegroundColor Green
Write-Host "Press any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop all services
Write-Host "`nStopping all services..." -ForegroundColor Yellow

# Stop AI Service
$aiProcesses = Get-Process | Where-Object { $_.ProcessName -eq "python" -and $_.CommandLine -like "*uvicorn*" }
foreach ($process in $aiProcesses) {
    Stop-Process -Id $process.Id -Force
}

# Stop Parser Service
$parserProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*parser*" }
foreach ($process in $parserProcesses) {
    Stop-Process -Id $process.Id -Force
}

# Stop Client
$clientProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*vite*" }
foreach ($process in $clientProcesses) {
    Stop-Process -Id $process.Id -Force
}

Write-Host "All services stopped." -ForegroundColor Green
Set-Location $scriptPath
