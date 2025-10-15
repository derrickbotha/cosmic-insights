#Requires -Version 5.1

# Robust Startup Script for Cosmic Insights
# Includes 10x retry logic, health checks, and error reporting

$script:MaxRetries = 10
$script:RetryDelay = 5
$script:LogFile = Join-Path $PSScriptRoot "startup.log"
$script:ErrorLogFile = Join-Path $PSScriptRoot "startup-errors.log"
$script:DockerComposeFile = "docker-compose.mailpit.yml"
$script:FrontendPort = 4000
$script:BackendPort = 5000
$script:MailpitPort = 8025

function Initialize-Logs {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "=== Startup Log - $timestamp ===" | Out-File -FilePath $script:LogFile -Encoding UTF8
    "=== Error Log - $timestamp ===" | Out-File -FilePath $script:ErrorLogFile -Encoding UTF8
}

function Write-Log {
    param([string]$Message, [string]$Level = 'INFO')
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $script:LogFile -Value $logMessage -Encoding UTF8
    switch ($Level) {
        'SUCCESS' { Write-Host $logMessage -ForegroundColor Green }
        'WARNING' { Write-Host $logMessage -ForegroundColor Yellow }
        'ERROR'   { Write-Host $logMessage -ForegroundColor Red; Add-Content -Path $script:ErrorLogFile -Value $logMessage -Encoding UTF8 }
        default   { Write-Host $logMessage -ForegroundColor White }
    }
}

function Write-ErrorReport {
    param([string]$ServiceName, [string]$ErrorType, [string]$ErrorMessage, [string]$AdditionalLog = "")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $report = "`n================================================================================"
    $report += "`nERROR REPORT - $timestamp"
    $report += "`n================================================================================"
    $report += "`nService:        $ServiceName"
    $report += "`nError Type:     $ErrorType"
    $report += "`nError Message:  $ErrorMessage"
    $report += "`n`nAdditional Information:`n$AdditionalLog"
    $report += "`n================================================================================"
    Add-Content -Path $script:ErrorLogFile -Value $report -Encoding UTF8
    Write-Log -Message "Error report written for $ServiceName" -Level ERROR
}

function Test-Port {
    param([int]$Port, [int]$TimeoutSeconds = 2)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $asyncResult = $tcpClient.BeginConnect("localhost", $Port, $null, $null)
        $wait = $asyncResult.AsyncWaitHandle.WaitOne($TimeoutSeconds * 1000, $false)
        if ($wait) {
            try { $tcpClient.EndConnect($asyncResult); $tcpClient.Close(); return $true } catch { return $false }
        } else { return $false }
    } catch { return $false } finally { if ($tcpClient) { $tcpClient.Close() } }
}

function Test-DockerRunning {
    try { $null = docker ps 2>&1; return $? } catch { return $false }
}

function Test-BackendHealth {
    for ($i = 1; $i -le 5; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$script:BackendPort/health" -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) { Write-Log -Message "Backend health check passed" -Level SUCCESS; return $true }
        } catch { Write-Log -Message "Backend health check attempt $i failed" -Level WARNING; Start-Sleep -Seconds 2 }
    }
    return $false
}

function Stop-ExistingNodeProcesses {
    Write-Log -Message "Checking for existing Node.js processes..." -Level INFO
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Log -Message "Found $($nodeProcesses.Count) Node.js process(es). Stopping..." -Level WARNING
        $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Log -Message "Existing Node.js processes stopped" -Level SUCCESS
    } else {
        Write-Log -Message "No existing Node.js processes found" -Level INFO
    }
}

function Start-DockerServices {
    Write-Log -Message "Starting Docker services..." -Level INFO
    for ($attempt = 1; $attempt -le $script:MaxRetries; $attempt++) {
        Write-Log -Message "Docker services start attempt $attempt of $script:MaxRetries" -Level INFO
        try {
            if (-not (Test-DockerRunning)) {
                Write-Log -Message "Docker Desktop is not running." -Level ERROR
                Write-ErrorReport -ServiceName "Docker" -ErrorType "Docker Not Running" -ErrorMessage "Docker Desktop is not running"
                if ($attempt -lt $script:MaxRetries) { Write-Log -Message "Waiting 10 seconds..." -Level WARNING; Start-Sleep -Seconds 10; continue } else { return $false }
            }
            Write-Log -Message "Stopping existing containers..." -Level INFO
            docker-compose -f $script:DockerComposeFile down 2>&1 | Out-Null
            Write-Log -Message "Starting Docker containers..." -Level INFO
            $dockerOutput = docker-compose -f $script:DockerComposeFile up -d 2>&1
            if ($LASTEXITCODE -ne 0) { throw "Docker compose failed with exit code $LASTEXITCODE" }
            Write-Log -Message "Docker containers started successfully" -Level SUCCESS
            Write-Log -Message "Waiting for services to initialize (15 seconds)..." -Level INFO
            Start-Sleep -Seconds 15
            $backendHealthy = Test-BackendHealth
            if ($backendHealthy) { Write-Log -Message "Docker services are healthy" -Level SUCCESS; return $true } else { throw "Backend health check failed" }
        } catch {
            $errorMsg = $_.Exception.Message
            Write-Log -Message "Docker start attempt $attempt failed: $errorMsg" -Level ERROR
            Write-ErrorReport -ServiceName "Docker Services" -ErrorType "Startup Failure" -ErrorMessage $errorMsg -AdditionalLog ($dockerOutput -join "`n")
            if ($attempt -lt $script:MaxRetries) { Write-Log -Message "Retrying in $script:RetryDelay seconds..." -Level WARNING; Start-Sleep -Seconds $script:RetryDelay }
        }
    }
    Write-Log -Message "Failed to start Docker services after $script:MaxRetries attempts" -Level ERROR
    return $false
}

function Start-Frontend {
    Write-Log -Message "Starting frontend server..." -Level INFO
    Stop-ExistingNodeProcesses
    for ($attempt = 1; $attempt -le $script:MaxRetries; $attempt++) {
        Write-Log -Message "Frontend start attempt $attempt of $script:MaxRetries" -Level INFO
        try {
            if (Test-Port -Port $script:FrontendPort) {
                Write-Log -Message "Port $script:FrontendPort is already in use. Clearing..." -Level WARNING
                Stop-ExistingNodeProcesses
                Start-Sleep -Seconds 2
            }
            Write-Log -Message "Launching frontend (npm start)..." -Level INFO
            $jobScript = { param($AppPath); Set-Location $AppPath; $env:BROWSER = "none"; npm start 2>&1 }
            $job = Start-Job -ScriptBlock $jobScript -ArgumentList $PSScriptRoot
            Write-Log -Message "Frontend job started (Job ID: $($job.Id))" -Level SUCCESS
            Write-Log -Message "Waiting for frontend to compile and start..." -Level INFO
            $timeoutSeconds = 120; $elapsed = 0; $portOpen = $false
            while ($elapsed -lt $timeoutSeconds) {
                Start-Sleep -Seconds 2; $elapsed += 2
                $jobOutput = Receive-Job -Job $job -ErrorAction SilentlyContinue
                if ($jobOutput) {
                    $outputString = $jobOutput -join "`n"
                    if ($outputString -match "Compiled successfully") { Write-Log -Message "Frontend compiled successfully" -Level SUCCESS }
                    if ($outputString -match "Failed to compile") { throw "Frontend compilation failed" }
                }
                if (Test-Port -Port $script:FrontendPort) {
                    $portOpen = $true
                    Write-Log -Message "Frontend port $script:FrontendPort is now open" -Level SUCCESS
                    break
                }
                if ($job.State -eq 'Failed' -or $job.State -eq 'Stopped') {
                    $jobError = Receive-Job -Job $job -ErrorAction SilentlyContinue
                    throw "Frontend job failed"
                }
            }
            if ($portOpen) {
                Write-Log -Message "Frontend is running on http://localhost:$script:FrontendPort" -Level SUCCESS
                Write-Log -Message "Frontend job ID: $($job.Id) (background)" -Level INFO
                return $true
            } else {
                throw "Frontend did not start within $timeoutSeconds seconds"
            }
        } catch {
            $errorMsg = $_.Exception.Message
            Write-Log -Message "Frontend start attempt $attempt failed: $errorMsg" -Level ERROR
            $jobOutput = ""
            if ($job) { $jobOutput = Receive-Job -Job $job -ErrorAction SilentlyContinue | Out-String; Remove-Job -Job $job -Force -ErrorAction SilentlyContinue }
            Write-ErrorReport -ServiceName "Frontend" -ErrorType "Startup Failure" -ErrorMessage $errorMsg -AdditionalLog $jobOutput
            Stop-ExistingNodeProcesses
            if ($attempt -lt $script:MaxRetries) { Write-Log -Message "Retrying in $script:RetryDelay seconds..." -Level WARNING; Start-Sleep -Seconds $script:RetryDelay }
        }
    }
    Write-Log -Message "Failed to start frontend after $script:MaxRetries attempts" -Level ERROR
    return $false
}

function Show-ServiceStatus {
    Write-Host "`n=================================================================================" -ForegroundColor Cyan
    Write-Host "                      COSMIC INSIGHTS - SERVICE STATUS" -ForegroundColor Cyan
    Write-Host "=================================================================================" -ForegroundColor Cyan
    Write-Host ""
    if (Test-Port -Port $script:FrontendPort) { Write-Host "   Frontend:     http://localhost:$script:FrontendPort" -ForegroundColor Green } else { Write-Host "   Frontend:     NOT RUNNING" -ForegroundColor Red }
    if (Test-Port -Port $script:BackendPort) { Write-Host "   Backend:      http://localhost:$script:BackendPort" -ForegroundColor Green } else { Write-Host "   Backend:      NOT RUNNING" -ForegroundColor Red }
    if (Test-Port -Port $script:MailpitPort) { Write-Host "   Mailpit:      http://localhost:$script:MailpitPort" -ForegroundColor Green } else { Write-Host "   Mailpit:      NOT RUNNING" -ForegroundColor Red }
    Write-Host ""
    Write-Host "   Logs:         $script:LogFile" -ForegroundColor Yellow
    Write-Host "    Errors:       $script:ErrorLogFile" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "=================================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Main {
    Clear-Host
    Write-Host "=================================================================================" -ForegroundColor Cyan
    Write-Host "        COSMIC INSIGHTS - ROBUST STARTUP WITH AUTO-RETRY" -ForegroundColor Cyan
    Write-Host "=================================================================================" -ForegroundColor Cyan
    Write-Host ""
    Initialize-Logs
    Write-Log -Message "Starting Cosmic Insights application..." -Level INFO
    Write-Log -Message "Max retries per service: $script:MaxRetries" -Level INFO
    Write-Host "Step 1: Starting Docker services (backend, Mailpit, databases)..." -ForegroundColor Yellow
    $dockerSuccess = Start-DockerServices
    if (-not $dockerSuccess) {
        Write-Host "`n CRITICAL: Failed to start Docker services." -ForegroundColor Red
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  1. Docker Desktop is installed and running" -ForegroundColor White
        Write-Host "  2. Error log: $script:ErrorLogFile`n" -ForegroundColor White
        return
    }
    Write-Host "`nStep 2: Starting frontend server (React)..." -ForegroundColor Yellow
    $frontendSuccess = Start-Frontend
    if (-not $frontendSuccess) {
        Write-Host "`n  WARNING: Frontend failed to start." -ForegroundColor Yellow
        Write-Host "Backend services are still running. Start manually: npm start`n" -ForegroundColor White
    }
    Write-Host ""
    Show-ServiceStatus
    if ($dockerSuccess -and $frontendSuccess) {
        Write-Host " All services started successfully!" -ForegroundColor Green
        Write-Host "`n Open http://localhost:4000 in your browser`n" -ForegroundColor Green
    } elseif ($dockerSuccess) {
        Write-Host "  Partial success: Backend running, frontend needs manual start`n" -ForegroundColor Yellow
    } else {
        Write-Host " Startup failed. Check error logs for details.`n" -ForegroundColor Red
    }
    Write-Log -Message "Startup sequence completed" -Level INFO
}

Main
