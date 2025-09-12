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
    
    $parserJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD/parser
        $process = Start-Process -FilePath "npm" -ArgumentList "run", "start:dev" -RedirectStandardOutput "parser.log" -RedirectStandardError "parser-error.log" -PassThru -WindowStyle Hidden
        $process.WaitForExit()
    }
    
    Start-Sleep -Seconds 2
    
    $clientJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD/client
        $process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -RedirectStandardOutput "client.log" -RedirectStandardError "client-error.log" -PassThru -WindowStyle Hidden
        $process.WaitForExit()
    }
    
    $parserLogPath = "parser/parser.log"
    $parserErrorPath = "parser/parser-error.log"
    $clientLogPath = "client/client.log"
    $clientErrorPath = "client/client-error.log"
    
    $lastParserSize = 0
    $lastClientSize = 0
    
    try {
        while ($true) {
            if (Test-Path $parserLogPath) {
                $currentSize = (Get-Item $parserLogPath).Length
                if ($currentSize -gt $lastParserSize) {
                    $newContent = Get-Content $parserLogPath -Skip $lastParserSize -ErrorAction SilentlyContinue
                    $newContent | ForEach-Object {
                        Write-Host "[PARSER] $_" -ForegroundColor Red
                    }
                    $lastParserSize = $currentSize
                }
            }
            
            if (Test-Path $parserErrorPath) {
                $currentSize = (Get-Item $parserErrorPath).Length
                if ($currentSize -gt $lastParserSize) {
                    $newContent = Get-Content $parserErrorPath -Skip $lastParserSize -ErrorAction SilentlyContinue
                    $newContent | ForEach-Object {
                        Write-Host "[PARSER ERROR] $_" -ForegroundColor DarkRed
                    }
                    $lastParserSize = $currentSize
                }
            }
            
            if (Test-Path $clientLogPath) {
                $currentSize = (Get-Item $clientLogPath).Length
                if ($currentSize -gt $lastClientSize) {
                    $newContent = Get-Content $clientLogPath -Skip $lastClientSize -ErrorAction SilentlyContinue
                    $newContent | ForEach-Object {
                        Write-Host "[CLIENT] $_" -ForegroundColor Blue
                    }
                    $lastClientSize = $currentSize
                }
            }
            
            if (Test-Path $clientErrorPath) {
                $currentSize = (Get-Item $clientErrorPath).Length
                if ($currentSize -gt $lastClientSize) {
                    $newContent = Get-Content $clientErrorPath -Skip $lastClientSize -ErrorAction SilentlyContinue
                    $newContent | ForEach-Object {
                        Write-Host "[CLIENT ERROR] $_" -ForegroundColor DarkBlue
                    }
                    $lastClientSize = $currentSize
                }
            }
            
            Start-Sleep -Milliseconds 500
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
    if ($parserJob) {
        Stop-Job -Job $parserJob
        Remove-Job -Job $parserJob
    }
    if ($clientJob) {
        Stop-Job -Job $clientJob
        Remove-Job -Job $clientJob
    }
    
    # Clean up log files
    if (Test-Path "parser/parser.log") { Remove-Item "parser/parser.log" -Force }
    if (Test-Path "parser/parser-error.log") { Remove-Item "parser/parser-error.log" -Force }
    if (Test-Path "client/client.log") { Remove-Item "client/client.log" -Force }
    if (Test-Path "client/client-error.log") { Remove-Item "client/client-error.log" -Force }
    
    Write-Host "All services stopped" -ForegroundColor Green
}
