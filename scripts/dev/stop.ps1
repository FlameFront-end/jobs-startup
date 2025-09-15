Write-Host "Stopping all development services..." -ForegroundColor Yellow

# Stop Python processes
Get-Process | Where-Object {$_.ProcessName -eq "python"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Stop Node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Remove logs directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptPath)
$logsDir = Join-Path $projectRoot "logs"

if (Test-Path $logsDir) {
    Remove-Item -Path $logsDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Cleaned logs directory" -ForegroundColor Green
}

Write-Host "All services stopped." -ForegroundColor Green
