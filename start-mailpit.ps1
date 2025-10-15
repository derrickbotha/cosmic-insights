# Quick Start - Mailpit Email Testing
# Run this script to start email testing with Mailpit

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Cosmic Insights - Mailpit Email Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
docker ps 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running" -ForegroundColor Green
Write-Host ""

# Stop any running services
Write-Host "Stopping existing services..." -ForegroundColor Yellow
docker-compose down 2>$null
Write-Host "Stopped" -ForegroundColor Green
Write-Host ""

# Start Mailpit services
Write-Host "Starting Mailpit services..." -ForegroundColor Yellow
docker-compose -f docker-compose.mailpit.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "All services started successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Wait for services to be ready
    Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Check service status
    Write-Host ""
    Write-Host "Service Status:" -ForegroundColor Cyan
    docker-compose -f docker-compose.mailpit.yml ps
    Write-Host ""
    
    # Display access information
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  Mailpit is ready!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Mailpit Web UI:  http://localhost:8025" -ForegroundColor Cyan
    Write-Host "Frontend:        http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend API:     http://localhost:5000" -ForegroundColor Cyan
    Write-Host "ML Service:      http://localhost:8000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "  Testing Email Flow" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Open browser: http://localhost:3000"
    Write-Host "2. Register a new account"
    Write-Host "3. Check Mailpit UI: http://localhost:8025"
    Write-Host "4. You should see the verification email!"
    Write-Host "5. Click the verification link"
    Write-Host "6. Check Mailpit for welcome email"
    Write-Host ""
    Write-Host "All emails are captured by Mailpit - no real emails sent!" -ForegroundColor Yellow
    Write-Host ""
    
    # Ask if user wants to open browsers
    $openBrowsers = Read-Host "Open browsers now? (y/n)"
    if ($openBrowsers -eq 'y' -or $openBrowsers -eq 'Y') {
        Write-Host ""
        Write-Host "Opening browsers..." -ForegroundColor Yellow
        Start-Process "http://localhost:8025"
        Start-Sleep -Seconds 1
        Start-Process "http://localhost:3000"
        Write-Host "Browsers opened!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "  Useful Commands" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f docker-compose.mailpit.yml logs -f mailpit"
    Write-Host ""
    Write-Host "Stop services:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f docker-compose.mailpit.yml down"
    Write-Host ""
    Write-Host "Restart services:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f docker-compose.mailpit.yml restart"
    Write-Host ""
    Write-Host "Check status:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f docker-compose.mailpit.yml ps"
    Write-Host ""
    
} else {
    Write-Host "Failed to start services. Check the error messages above." -ForegroundColor Red
    exit 1
}
