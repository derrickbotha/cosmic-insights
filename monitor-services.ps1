# Service Monitor and Auto-Restart Script
# Monitors frontend and backend services and restarts them if they crash

param(
    [int]$CheckIntervalSeconds = 30
)

$AppDir = "C:\Users\dbmos\OneDrive\Documents\Astrology App\Astrology V1.1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🔍 Service Monitor Started            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Checking services every $CheckIntervalSeconds seconds..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""

function Test-ServiceHealth {
    param(
        [string]$Url,
        [string]$ServiceName
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        Write-Host "⚠ $ServiceName is DOWN!" -ForegroundColor Red
        return $false
    }
}

function Restart-Frontend {
    Write-Host "🔄 Restarting frontend server..." -ForegroundColor Yellow
    
    # Kill existing node processes
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    # Start frontend in new window
    $frontendScript = @"
Set-Location '$AppDir'
Write-Host 'Frontend Server - Auto-restarted at $(Get-Date)' -ForegroundColor Green
npm start
"@
    
    $frontendScript | Out-File -FilePath "$AppDir\temp-restart-frontend.ps1" -Encoding UTF8
    Start-Process powershell -ArgumentList "-NoExit", "-File", "$AppDir\temp-restart-frontend.ps1"
    
    Start-Sleep -Seconds 10
    Write-Host "✓ Frontend restart initiated" -ForegroundColor Green
}

function Restart-Backend {
    Write-Host "🔄 Restarting backend service..." -ForegroundColor Yellow
    Set-Location $AppDir
    docker-compose -f docker-compose.mailpit.yml restart backend
    Start-Sleep -Seconds 10
    Write-Host "✓ Backend restarted" -ForegroundColor Green
}

$checkCount = 0

while ($true) {
    $checkCount++
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Host "[$timestamp] Check #$checkCount" -ForegroundColor Gray
    
    # Check Backend
    $backendHealthy = Test-ServiceHealth -Url "http://localhost:5000/health" -ServiceName "Backend"
    if ($backendHealthy) {
        Write-Host "  ✓ Backend: OK" -ForegroundColor Green
    } else {
        Restart-Backend
    }
    
    # Check Frontend
    $frontendHealthy = Test-ServiceHealth -Url "http://localhost:4000" -ServiceName "Frontend"
    if ($frontendHealthy) {
        Write-Host "  ✓ Frontend: OK" -ForegroundColor Green
    } else {
        Restart-Frontend
    }
    
    # Check Mailpit
    $mailpitHealthy = Test-ServiceHealth -Url "http://localhost:8025" -ServiceName "Mailpit"
    if ($mailpitHealthy) {
        Write-Host "  ✓ Mailpit: OK" -ForegroundColor Green
    }
    
    Write-Host ""
    Start-Sleep -Seconds $CheckIntervalSeconds
}
