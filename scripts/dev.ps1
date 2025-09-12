Write-Host "Starting dev environment..." -ForegroundColor Green

$ErrorActionPreference = "Stop"

function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color = "Cyan"
    )
    
    Write-Host "Starting $Name..." -ForegroundColor $Color
    
    $process = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$Path'; $Command" -PassThru
    return $process
}

try {
    Write-Host "Checking dependencies..." -ForegroundColor Yellow
    
    if (!(Test-Path "client/node_modules")) {
        Write-Host "Installing client dependencies..." -ForegroundColor Yellow
        Set-Location "client"
        npm install
        Set-Location ".."
    }
    
    if (!(Test-Path "parser/node_modules")) {
        Write-Host "Installing parser dependencies..." -ForegroundColor Yellow
        Set-Location "parser"
        npm install
        Set-Location ".."
    }
    
    Write-Host "Starting services..." -ForegroundColor Green
    
    $parserProcess = Start-Service -Name "Parser API" -Path "$PWD/parser" -Command "npm run start:dev" -Color "Red"
    Start-Sleep -Seconds 2
    
    $clientProcess = Start-Service -Name "Client" -Path "$PWD/client" -Command "npm run dev" -Color "Blue"
    
    Write-Host ""
    Write-Host "Dev environment started!" -ForegroundColor Green
    Write-Host "Client: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Parser API: http://localhost:3000" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
    
    try {
        while ($true) {
            Start-Sleep -Seconds 1
        }
    }
    catch [System.Management.Automation.PipelineStoppedException] {
        Write-Host "Stopping services..." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if ($parserProcess -and !$parserProcess.HasExited) {
        Write-Host "Stopping Parser API..." -ForegroundColor Yellow
        $parserProcess.Kill()
    }
    if ($clientProcess -and !$clientProcess.HasExited) {
        Write-Host "Stopping Client..." -ForegroundColor Yellow
        $clientProcess.Kill()
    }
    Write-Host "All services stopped" -ForegroundColor Green
}
