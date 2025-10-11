# Cosmic Insights - Quick Start Script for PowerShell
# Run this after installing Docker Desktop

Write-Host "🚀 Cosmic Insights - Quick Start" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed!" -ForegroundColor Red
    Write-Host "`nPlease install Docker Desktop from:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop`n" -ForegroundColor Cyan
    exit 1
}

# Check if docker-compose is available
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose is available: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available!" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Starting services..." -ForegroundColor Yellow
Write-Host "This will start:" -ForegroundColor White
Write-Host "  - MongoDB (port 27017)" -ForegroundColor White
Write-Host "  - Backend API (port 5000)" -ForegroundColor White
Write-Host "  - Mongo Express GUI (port 8081)`n" -ForegroundColor White

# Start Docker Compose
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Services started successfully!`n" -ForegroundColor Green
    
    Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "`n🌐 Access your services:" -ForegroundColor Cyan
    Write-Host "  Frontend:     http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend API:  http://localhost:5000" -ForegroundColor White
    Write-Host "  Health Check: http://localhost:5000/health" -ForegroundColor White
    Write-Host "  Mongo Express: http://localhost:8081 (admin/pass)`n" -ForegroundColor White
    
    Write-Host "👤 Default users created:" -ForegroundColor Cyan
    Write-Host "  Admin:     admin@cosmicinsights.com / Admin123!" -ForegroundColor White
    Write-Host "  Test User: test@cosmicinsights.com / TestUser123!`n" -ForegroundColor White
    
    Write-Host "🧪 Test the backend:" -ForegroundColor Cyan
    Write-Host '  $body = @{email="test@cosmicinsights.com"; password="TestUser123!"} | ConvertTo-Json' -ForegroundColor Gray
    Write-Host '  Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"' -ForegroundColor Gray
    
    Write-Host "`n📊 View logs:" -ForegroundColor Cyan
    Write-Host "  docker-compose logs -f" -ForegroundColor Gray
    
    Write-Host "`n🛑 Stop services:" -ForegroundColor Cyan
    Write-Host "  docker-compose down`n" -ForegroundColor Gray
    
    # Try to test health endpoint
    Write-Host "Testing backend health..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
        Write-Host "✅ Backend is healthy!" -ForegroundColor Green
        Write-Host "   Response: $($health.message)" -ForegroundColor White
    } catch {
        Write-Host "⏳ Backend is still starting up. Check logs with:" -ForegroundColor Yellow
        Write-Host "   docker-compose logs backend" -ForegroundColor Gray
    }
    
} else {
    Write-Host "`n❌ Failed to start services!" -ForegroundColor Red
    Write-Host "Check the error messages above." -ForegroundColor Yellow
    Write-Host "View logs with: docker-compose logs" -ForegroundColor Gray
    exit 1
}

Write-Host "`n🎉 Setup complete! Happy coding!" -ForegroundColor Green
