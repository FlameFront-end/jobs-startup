[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== FULL APPLICATION INSTALLATION ===" -ForegroundColor Green
Write-Host "Installing ALL dependencies automatically..." -ForegroundColor Yellow

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n[$Message]" -ForegroundColor $Color
}

function Test-Command {
    param([string]$Command, [string]$Name, [bool]$Silent = $false)
    try {
        $null = & $Command --version 2>&1
        if (!$Silent) { Write-Host " $Name found" -ForegroundColor Green }
        return $true
    } catch {
        if (!$Silent) { Write-Host " $Name not found" -ForegroundColor Red }
        return $false
    }
}

function Install-WithWinget {
    param([string]$PackageId, [string]$Name)
    try {
        Write-Host "Installing $Name via winget..." -ForegroundColor Yellow
        winget install $PackageId --accept-package-agreements --accept-source-agreements --silent
        Write-Host " $Name installed" -ForegroundColor Green
        return $true
    } catch {
        Write-Host " Error installing $Name" -ForegroundColor Red
        return $false
    }
}

function Update-Path {
    Write-Host "Updating PATH..." -ForegroundColor Yellow
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    Start-Sleep -Seconds 2
}

try {
    Write-Step "Checking system dependencies"

    # Check winget
    if (!(Test-Command "winget" "Winget")) {
        Write-Host "Winget not found! Install App Installer from Microsoft Store and restart" -ForegroundColor Red
        exit 1
    }

    # Check Node.js
    if (!(Test-Command "node" "Node.js")) {
        if (!(Install-WithWinget "OpenJS.NodeJS" "Node.js")) {
            Write-Host "Failed to install Node.js" -ForegroundColor Red
            exit 1
        }
        Update-Path
    }

    # npm
    if (!(Test-Command "npm" "npm")) {
        Update-Path
        if (!(Test-Command "npm" "npm")) {
            Write-Host "npm not found. Restart PowerShell" -ForegroundColor Red
            exit 1
        }
    }

    # Python
    if (!(Test-Command "python" "Python")) {
        if (!(Install-WithWinget "Python.Python.3.11" "Python 3.11")) {
            Write-Host "Failed to install Python" -ForegroundColor Red
            exit 1
        }
        Update-Path
    }

    # Ollama
    $wingetOllama = winget list "Ollama.Ollama" 2>$null
    if ($wingetOllama -match "Ollama.Ollama") {
        # Ollama is installed via winget, check if it's in PATH
        if (Test-Command "ollama" "Ollama" -Silent $true) {
            Write-Host " Ollama found" -ForegroundColor Green
        } else {
            Write-Host "Ollama found in winget, updating PATH..." -ForegroundColor Yellow
            Update-Path
            # Add Ollama to current session PATH
            $ollamaPath = "$env:USERPROFILE\AppData\Local\Programs\Ollama"
            if (Test-Path "$ollamaPath\ollama.exe") {
                $env:PATH += ";$ollamaPath"
            }
            # Try again after PATH update
            if (!(Test-Command "ollama" "Ollama" -Silent $true)) {
                Write-Host "Ollama installed but not in PATH. Restart PowerShell and try again." -ForegroundColor Red
                exit 1
            }
            Write-Host " Ollama found" -ForegroundColor Green
        }
    } else {
        # Ollama not installed, install it
        if (!(Test-Command "ollama" "Ollama" -Silent $true)) {
            if (!(Install-WithWinget "Ollama.Ollama" "Ollama")) {
                Write-Host "Failed to install Ollama" -ForegroundColor Red
                exit 1
            }
            Update-Path
            # Add Ollama to current session PATH
            $ollamaPath = "$env:USERPROFILE\AppData\Local\Programs\Ollama"
            if (Test-Path "$ollamaPath\ollama.exe") {
                $env:PATH += ";$ollamaPath"
            }
        }
        Write-Host " Ollama found" -ForegroundColor Green
    }

    # Git
    if (!(Test-Command "git" "Git")) {
        if (!(Install-WithWinget "Git.Git" "Git")) {
            Write-Host "Failed to install Git" -ForegroundColor Red
            exit 1
        }
        Update-Path
    }

    Write-Step "Setting up Ollama"
    Write-Host "Starting Ollama server..." -ForegroundColor Yellow
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
                Write-Host " Ollama server started" -ForegroundColor Green
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
        Write-Host " Failed to start Ollama server" -ForegroundColor Red
        $ollamaProcess.Kill()
        exit 1
    }

    # Check model
    Write-Host "Checking AI model..." -ForegroundColor Yellow
    $models = & ollama list 2>&1
    if ($models -match "llama3.2") {
        Write-Host " AI model llama3.2 found" -ForegroundColor Green
    } else {
        Write-Host "Downloading model llama3.2..." -ForegroundColor Yellow
        Write-Host "This may take several minutes and requires ~2GB of free space..." -ForegroundColor Cyan
        
        $pullProcess = Start-Process -FilePath "ollama" -ArgumentList "pull", "llama3.2" -NoNewWindow -PassThru -RedirectStandardOutput "nul" -RedirectStandardError "nul"

        while (!$pullProcess.HasExited) {
            Write-Host "." -NoNewline -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
        Write-Host ""
        if ($pullProcess.ExitCode -eq 0) {
            Write-Host " AI model downloaded" -ForegroundColor Green
        } else {
            Write-Host " Error downloading model" -ForegroundColor Red
            if ($ollamaProcess -and !$ollamaProcess.HasExited) {
                $ollamaProcess.Kill()
            }
            exit 1
        }
    }

    try { $ollamaProcess.Kill() } catch {}

    Write-Step "Installing project dependencies"

    $originalLocation = Get-Location

    # client
    if (!(Test-Path "client/node_modules")) {
        try {
            Set-Location "client"
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host " Client configured" -ForegroundColor Green
            } else {
                Write-Host " Error installing client dependencies" -ForegroundColor Red
                Set-Location $originalLocation
                exit 1
            }
        } finally {
            Set-Location $originalLocation
        }
    } else {
        Write-Host " Client already configured" -ForegroundColor Green
    }

    # parser
    if (!(Test-Path "parser/node_modules")) {
        try {
            Set-Location "parser"
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host " Parser configured" -ForegroundColor Green
            } else {
                Write-Host " Error installing parser dependencies" -ForegroundColor Red
                Set-Location $originalLocation
                exit 1
            }
        } finally {
            Set-Location $originalLocation
        }
    } else {
        Write-Host " Parser already configured" -ForegroundColor Green
    }

    # ai-service
    if (!(Test-Path "ai-service/venv")) {
        try {
            Set-Location "ai-service"
            Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
            python -m venv venv
            if ($LASTEXITCODE -ne 0) {
                Write-Host " Error creating virtual environment" -ForegroundColor Red
                Set-Location $originalLocation
                exit 1
            }
            
            Write-Host "Upgrading pip..." -ForegroundColor Yellow
            .\venv\Scripts\python.exe -m pip install --upgrade pip
            if ($LASTEXITCODE -ne 0) {
                Write-Host " Error upgrading pip" -ForegroundColor Red
                Set-Location $originalLocation
                exit 1
            }
            
            Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
            .\venv\Scripts\python.exe -m pip install -r requirements.txt
            if ($LASTEXITCODE -eq 0) {
                Write-Host " AI Service configured" -ForegroundColor Green
            } else {
                Write-Host " Error installing Python dependencies" -ForegroundColor Red
                Set-Location $originalLocation
                exit 1
            }
        } finally {
            Set-Location $originalLocation
        }
    } else {
        Write-Host " AI Service already configured" -ForegroundColor Green
    }

    Write-Step "Installation check"
    Write-Host "`n=== INSTALLATION COMPLETED SUCCESSFULLY ===" -ForegroundColor Green
    Write-Host "Now you can run the application:" -ForegroundColor Cyan
    Write-Host "  docker-compose up  - run all services" -ForegroundColor White
    Write-Host "  AI Service: python -m uvicorn ai-service.app.main:app --host 0.0.0.0 --port 8001" -ForegroundColor White

} catch {
    Write-Host "`n=== CRITICAL ERROR ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
