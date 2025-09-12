Write-Host "Starting dev environment in single console..." -ForegroundColor Green

$ErrorActionPreference = "Stop"

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
    Write-Host "Client: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Parser API: http://localhost:3000" -ForegroundColor Red
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    $parserProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run start:dev" -WorkingDirectory "parser" -PassThru -WindowStyle Hidden
    $clientProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -WorkingDirectory "client" -PassThru -WindowStyle Hidden
    
    Write-Host "Services started in background" -ForegroundColor Green
    Write-Host "Parser PID: $($parserProcess.Id)" -ForegroundColor Red
    Write-Host "Client PID: $($clientProcess.Id)" -ForegroundColor Blue
    
    try {
        while ($true) {
            if ($parserProcess.HasExited) {
                Write-Host "[PARSER] Process exited with code: $($parserProcess.ExitCode)" -ForegroundColor Red
                break
            }
            
            if ($clientProcess.HasExited) {
                Write-Host "[CLIENT] Process exited with code: $($clientProcess.ExitCode)" -ForegroundColor Blue
                break
            }
            
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
