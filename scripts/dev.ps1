Write-Host "=== DEVELOPMENT ENVIRONMENT ===" -ForegroundColor Green
Write-Host "Starting all services locally..." -ForegroundColor Yellow

$ErrorActionPreference = "Stop"

# Check for NoBrowser flag
$NoBrowser = $env:NO_BROWSER -eq "true"

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n[$Message]" -ForegroundColor $Color
}

function Write-Service {
    param([string]$Service, [string]$Status, [string]$Color = "White")
    Write-Host "  $Service`: $Status" -ForegroundColor $Color
}

try {
    Write-Step "Checking prerequisites"
    
    # Check if services are already running
    $existingJobs = Get-Job | Where-Object { $_.Name -like "*AI*" -or $_.Name -like "*Parser*" -or $_.Name -like "*Client*" }
    if ($existingJobs) {
        Write-Host "Found running development services. Stopping them first..." -ForegroundColor Yellow
        $existingJobs | Stop-Job
        $existingJobs | Remove-Job
        Write-Service "Services" "Stopped" "Green"
    }
    
    # Check if dependencies are installed
    if (!(Test-Path "client/node_modules")) {
        Write-Host "Client dependencies not found. Run 'npm run install' first." -ForegroundColor Red
        exit 1
    }
    
    if (!(Test-Path "parser/node_modules")) {
        Write-Host "Parser dependencies not found. Run 'npm run install' first." -ForegroundColor Red
        exit 1
    }
    
    if (!(Test-Path "ai-service/venv")) {
        Write-Host "AI Service dependencies not found. Run 'npm run install' first." -ForegroundColor Red
        exit 1
    }
    
    Write-Service "Dependencies" "Found" "Green"
    
    # Kill processes using required ports
    $ports = @(8001, 4000, 5173)
    $killedProcesses = @()
    
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($connection in $connections) {
            try {
                $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    $process.Kill()
                    $killedProcesses += "$($process.ProcessName) (PID: $($process.Id))"
                }
            } catch {
                # Process already terminated
            }
        }
    }
    
    if ($killedProcesses.Count -gt 0) {
        Write-Service "Ports" "Freed from $($killedProcesses.Count) processes" "Yellow"
    } else {
        Write-Service "Ports" "Available" "Green"
    }
    
    # Add Ollama to PATH if not already there
    $ollamaPath = "$env:USERPROFILE\AppData\Local\Programs\Ollama"
    if (Test-Path "$ollamaPath\ollama.exe") {
        if ($env:PATH -notlike "*$ollamaPath*") {
            $env:PATH += ";$ollamaPath"
            Write-Service "Ollama" "Added to PATH" "Yellow"
        } else {
            Write-Service "Ollama" "In PATH" "Green"
        }
    } else {
        Write-Host "Ollama not found. Run 'npm run install' first." -ForegroundColor Red
        exit 1
    }
    
    Write-Step "Starting Ollama server"
    
    # Check if Ollama is already running
    $ollamaRunning = $false
    try {
        $testResult = & ollama list 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Service "Ollama" "Already running" "Green"
            $ollamaRunning = $true
        }
    } catch {
        # Ollama not running
    }
    
    if (!$ollamaRunning) {
        Write-Service "Ollama" "Starting..." "Yellow"
        $ollamaProcess = Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden -PassThru
        
        # Wait for startup
        $maxAttempts = 30
        $attempt = 0
        $ollamaReady = $false
        
        while ($attempt -lt $maxAttempts -and -not $ollamaReady) {
            Start-Sleep -Seconds 2
            $attempt++
            try {
                $testResult = & ollama list 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Service "Ollama" "Started" "Green"
                    $ollamaReady = $true
                }
            } catch {
                # wait
            }
            if (-not $ollamaReady) {
                Write-Host "." -NoNewline -ForegroundColor Yellow
            }
        }
        
        if (-not $ollamaReady) {
            Write-Host " Failed to start Ollama" -ForegroundColor Red
            if ($ollamaProcess -and !$ollamaProcess.HasExited) {
                $ollamaProcess.Kill()
            }
            exit 1
        }
    }
    
    # Check model
    Write-Host "Checking AI model..." -ForegroundColor Yellow
    $models = & ollama list 2>&1
    if ($models -match "llama3.2") {
        Write-Service "AI Model" "Found" "Green"
    } else {
        Write-Host "Downloading llama3.2 model..." -ForegroundColor Yellow
        Write-Host "This may take several minutes and requires ~2GB of free space..." -ForegroundColor Cyan
        
        $pullProcess = Start-Process -FilePath "ollama" -ArgumentList "pull", "llama3.2" -NoNewWindow -PassThru -RedirectStandardOutput "nul" -RedirectStandardError "nul"
        
        while (!$pullProcess.HasExited) {
            Write-Host "." -NoNewline -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
        Write-Host ""
        if ($pullProcess.ExitCode -eq 0) {
            Write-Service "AI Model" "Downloaded" "Green"
        } else {
            Write-Host " Error downloading model" -ForegroundColor Red
            if ($ollamaProcess -and !$ollamaProcess.HasExited) {
                $ollamaProcess.Kill()
            }
            exit 1
        }
    }
    
    Write-Step "Starting application services"
    
    # Clean and recreate logs directory
    if (Test-Path "logs") {
        Get-ChildItem -Path "logs" -File | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Service "Logs" "Files cleaned" "Yellow"
    } else {
        New-Item -ItemType Directory -Path "logs" -Force | Out-Null
        Write-Service "Logs" "Directory created" "Green"
    }
    
    # Start AI Service in background with logging
    Write-Service "AI Service" "Starting..." "Yellow"
    $aiJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        cd ai-service
        .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload 2>&1 | ForEach-Object { 
            # Remove ANSI color codes and emojis
            $_ -replace '\x1b\[[0-9;]*m', '' -replace '[^\x00-\x7F]', '' 
        } | Tee-Object -FilePath "../logs/ai-service.log"
    }
    
    # Start Parser in background with logging
    Write-Service "Parser" "Starting..." "Yellow"
    $parserJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        cd parser
        npm run start:dev 2>&1 | ForEach-Object { 
            # Remove ANSI color codes and emojis
            $_ -replace '\x1b\[[0-9;]*m', '' -replace '[^\x00-\x7F]', '' 
        } | Tee-Object -FilePath "../logs/parser.log"
    }
    
    # Start Client in background with logging
    Write-Service "Client" "Starting..." "Yellow"
    $clientJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        cd client
        npm run dev 2>&1 | ForEach-Object { 
            # Remove ANSI color codes and emojis
            $_ -replace '\x1b\[[0-9;]*m', '' -replace '[^\x00-\x7F]', '' 
        } | Tee-Object -FilePath "../logs/client.log"
    }
    
    # Wait a bit for services to start
    Start-Sleep -Seconds 5
    
    # Check if services started successfully
    Write-Host "`nChecking service status..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Check if log files exist
    if (Test-Path "logs/ai-service.log") {
        Write-Service "AI Service" "Log file created" "Green"
    } else {
        Write-Service "AI Service" "No log file yet" "Yellow"
    }
    
    if (Test-Path "logs/parser.log") {
        Write-Service "Parser" "Log file created" "Green"
    } else {
        Write-Service "Parser" "No log file yet" "Yellow"
    }
    
    if (Test-Path "logs/client.log") {
        Write-Service "Client" "Log file created" "Green"
    } else {
        Write-Service "Client" "No log file yet" "Yellow"
    }
    
    Write-Step "Development environment ready"
    
    Write-Host "`n=== SERVICES RUNNING ===" -ForegroundColor Green
    Write-Service "Ollama API" "http://localhost:11434" "Cyan"
    Write-Service "AI Service" "http://localhost:8001" "Cyan"
    Write-Service "Parser API" "http://localhost:4000" "Cyan"
    Write-Service "Parser Swagger" "http://localhost:4000/api/docs" "Cyan"
    Write-Service "Client App" "http://localhost:5173" "Cyan"
    
    if (!$NoBrowser) {
        Write-Host "`nOpening browsers..." -ForegroundColor Green
        Start-Process "http://localhost:5173"
        Start-Process "http://localhost:4000/api/docs"
    } else {
        Write-Host "`nBrowsers not opened (NoBrowser flag)" -ForegroundColor Yellow
    }
    
    Write-Host "`nPress Ctrl+C to stop all services..." -ForegroundColor Red
    Write-Host "All services are running in background jobs." -ForegroundColor Cyan
    Write-Host "Use the commands above to view logs or stop services." -ForegroundColor Cyan
    
    # Keep script running and show status
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Check if jobs are still running
        $aiStatus = if ($aiJob.State -eq "Running") { "Running" } else { "Stopped" }
        $parserStatus = if ($parserJob.State -eq "Running") { "Running" } else { "Stopped" }
        $clientStatus = if ($clientJob.State -eq "Running") { "Running" } else { "Stopped" }
        
        Write-Host "`rStatus: AI Service: $aiStatus | Parser: $parserStatus | Client: $clientStatus" -NoNewline -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n=== ERROR ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stopping services..." -ForegroundColor Yellow
    
    # Stop background jobs
    if ($aiJob) { Stop-Job $aiJob; Remove-Job $aiJob }
    if ($parserJob) { Stop-Job $parserJob; Remove-Job $parserJob }
    if ($clientJob) { Stop-Job $clientJob; Remove-Job $clientJob }
    
    # Stop Ollama if we started it
    if ($ollamaProcess -and !$ollamaProcess.HasExited) {
        $ollamaProcess.Kill()
    }
    
    exit 1
}