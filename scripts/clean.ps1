[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== PROJECT CLEANUP ===" -ForegroundColor Red
Write-Host "Removing all installed dependencies and temporary files..." -ForegroundColor Yellow

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n[$Message]" -ForegroundColor $Color
}

function Remove-IfExists {
    param([string]$Path, [string]$Description)
    if (Test-Path $Path) {
        Write-Host "Removing $Description..." -ForegroundColor Yellow
        try {
            Remove-Item -Path $Path -Recurse -Force
            Write-Host " $Description removed" -ForegroundColor Green
        } catch {
            Write-Host " Error removing $Description" -ForegroundColor Red
        }
    } else {
        Write-Host " $Description not found" -ForegroundColor Green
    }
}

try {
    Write-Step "Cleaning Node.js dependencies"
    
    Remove-IfExists "client/node_modules" "client dependencies"
    Remove-IfExists "parser/node_modules" "parser dependencies"
    Remove-IfExists "client/dist" "client build"
    Remove-IfExists "parser/dist" "parser build"
    Remove-IfExists "client/.vite" "Vite cache"
    Remove-IfExists "parser/coverage" "parser test coverage"
    
    Write-Step "Cleaning Python dependencies"
    
    Remove-IfExists "ai-service/venv" "AI Service virtual environment"
    Remove-IfExists "ai-service/__pycache__" "AI Service Python cache"
    Remove-IfExists "ai-service/app/__pycache__" "Python application cache"
    
    Write-Step "Cleaning logs and temporary files"
    
    Remove-IfExists "parser/logs" "parser logs"
    Remove-IfExists "ai-service/logs" "AI Service logs"
    Remove-IfExists ".nyc_output" "coverage cache"
    Remove-IfExists "coverage" "general coverage"
    
    Write-Step "Cleaning system processes"
    
    # Stop project-related processes only
    $projectPath = (Get-Location).Path
    
    # Stop Ollama processes (only if running from project directory)
    try {
        $ollamaProcesses = Get-Process -Name "ollama" -ErrorAction SilentlyContinue | Where-Object {
            $_.Path -like "*$projectPath*" -or $_.CommandLine -like "*$projectPath*"
        }
        if ($ollamaProcesses) {
            Write-Host "Stopping project Ollama processes..." -ForegroundColor Yellow
            $ollamaProcesses | Stop-Process -Force
            Write-Host " Project Ollama processes stopped" -ForegroundColor Green
        } else {
            Write-Host " No project Ollama processes found" -ForegroundColor Green
        }
    } catch {
        Write-Host " No project Ollama processes found" -ForegroundColor Green
    }
    
    # Stop Node.js processes (only if running from project directory)
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            $_.Path -like "*$projectPath*" -or $_.CommandLine -like "*$projectPath*"
        }
        if ($nodeProcesses) {
            Write-Host "Stopping project Node.js processes..." -ForegroundColor Yellow
            $nodeProcesses | Stop-Process -Force
            Write-Host " Project Node.js processes stopped" -ForegroundColor Green
        } else {
            Write-Host " No project Node.js processes found" -ForegroundColor Green
        }
    } catch {
        Write-Host " No project Node.js processes found" -ForegroundColor Green
    }
    
    # Stop Python processes (only if running from project directory)
    try {
        $pythonProcesses = Get-Process -Name "python*" -ErrorAction SilentlyContinue | Where-Object {
            $_.Path -like "*$projectPath*" -or $_.CommandLine -like "*$projectPath*"
        }
        if ($pythonProcesses) {
            Write-Host "Stopping project Python processes..." -ForegroundColor Yellow
            $pythonProcesses | Stop-Process -Force
            Write-Host " Project Python processes stopped" -ForegroundColor Green
        } else {
            Write-Host " No project Python processes found" -ForegroundColor Green
        }
    } catch {
        Write-Host " No project Python processes found" -ForegroundColor Green
    }
    
    Write-Step "Cleanup completed"
    
    Write-Host "`n=== CLEANUP COMPLETED ===" -ForegroundColor Green
    Write-Host "All dependencies and temporary files removed!" -ForegroundColor Green
    Write-Host "`nTo reinstall, run:" -ForegroundColor Cyan
    Write-Host "  npm run install" -ForegroundColor White
    
} catch {
    Write-Host "`n=== CLEANUP ERROR ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
