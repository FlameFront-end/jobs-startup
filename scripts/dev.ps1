Write-Host "Запуск dev окружения..." -ForegroundColor Green

$ErrorActionPreference = "Stop"

function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color = "Cyan"
    )
    
    Write-Host "Запуск $Name..." -ForegroundColor $Color
    
    $process = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$Path'; $Command" -PassThru
    return $process
}

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
    
    $parserProcess = Start-Service -Name "Parser API" -Path "$PWD/parser" -Command "npm run start:dev" -Color "Red"
    Start-Sleep -Seconds 2
    
    $clientProcess = Start-Service -Name "Client" -Path "$PWD/client" -Command "npm run dev" -Color "Blue"
    
    Write-Host ""
    Write-Host "Dev окружение запущено!" -ForegroundColor Green
    Write-Host "Client: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Parser API: http://localhost:3000" -ForegroundColor Red
    Write-Host ""
    Write-Host "Нажмите Ctrl+C для остановки всех сервисов" -ForegroundColor Yellow
    
    try {
        while ($true) {
            Start-Sleep -Seconds 1
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
    if ($parserProcess -and !$parserProcess.HasExited) {
        Write-Host "Остановка Parser API..." -ForegroundColor Yellow
        $parserProcess.Kill()
    }
    if ($clientProcess -and !$clientProcess.HasExited) {
        Write-Host "Остановка Client..." -ForegroundColor Yellow
        $clientProcess.Kill()
    }
    Write-Host "Все сервисы остановлены" -ForegroundColor Green
}
