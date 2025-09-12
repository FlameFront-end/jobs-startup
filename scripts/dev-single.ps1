Write-Host "Запуск dev окружения в одной консоли..." -ForegroundColor Green

$ErrorActionPreference = "Stop"

try {
    Write-Host "Проверка зависимостей..." -ForegroundColor Yellow
    
    if (!(Test-Path "client/node_modules")) {
        Write-Host "Установка зависимостей клиента..." -ForegroundColor Yellow
        Set-Location "client"
        npm install
        Set-Location ".."
    }
    
    if (!(Test-Path "parser/node_modules")) {
        Write-Host "Установка зависимостей парсера..." -ForegroundColor Yellow
        Set-Location "parser"
        npm install
        Set-Location ".."
    }
    
    Write-Host "Запуск сервисов..." -ForegroundColor Green
    Write-Host "Client: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Parser API: http://localhost:3000" -ForegroundColor Red
    Write-Host "Нажмите Ctrl+C для остановки" -ForegroundColor Yellow
    Write-Host ""
    
    $parserJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD/parser
        npm run start:dev 2>&1 | ForEach-Object { "[PARSER] $_" }
    }
    
    Start-Sleep -Seconds 2
    
    $clientJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD/client
        npm run dev 2>&1 | ForEach-Object { "[CLIENT] $_" }
    }
    
    try {
        while ($true) {
            $parserOutput = Receive-Job -Job $parserJob -ErrorAction SilentlyContinue
            $clientOutput = Receive-Job -Job $clientJob -ErrorAction SilentlyContinue
            
            if ($parserOutput) {
                $parserOutput | ForEach-Object {
                    Write-Host $_ -ForegroundColor Red
                }
            }
            
            if ($clientOutput) {
                $clientOutput | ForEach-Object {
                    Write-Host $_ -ForegroundColor Blue
                }
            }
            
            Start-Sleep -Milliseconds 200
        }
    }
    catch [System.Management.Automation.PipelineStoppedException] {
        Write-Host "Остановка сервисов..." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
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
    Write-Host "Все сервисы остановлены" -ForegroundColor Green
}
