# Cosmic Insights - Admin Panel Setup Script
# Automated setup for Backend API & ML Service Admin Panel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cosmic Insights - Admin Panel Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python installation
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Navigate to admin-panel directory
Set-Location -Path "backend\admin-panel"

# Create virtual environment
Write-Host "`nCreating Python virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "✓ Virtual environment already exists" -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "`nActivating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host "`nInstalling Python packages..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Generate encryption key
Write-Host "`nGenerating encryption key..." -ForegroundColor Yellow
$encryptionKey = python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
Write-Host "✓ Encryption key generated" -ForegroundColor Green

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "`nCreating .env file..." -ForegroundColor Yellow
    
    @"
# Django Settings
DJANGO_SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database (PostgreSQL)
ADMIN_DB_NAME=cosmic_admin
ADMIN_DB_USER=postgres
ADMIN_DB_PASSWORD=cosmicpassword123
ADMIN_DB_HOST=localhost
ADMIN_DB_PORT=5432

# Backend Services
BACKEND_API_URL=http://localhost:5000
ML_SERVICE_URL=http://localhost:8000

# MongoDB (Read-only access)
MONGODB_URI=mongodb://localhost:27017/cosmic-insights

# Redis
REDIS_URL=redis://localhost:6379/0

# Encryption Key
ENCRYPTION_KEY=$encryptionKey
"@ | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✓ .env file created" -ForegroundColor Green
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Create __init__.py files for Django apps
Write-Host "`nCreating Django app structure..." -ForegroundColor Yellow
$apps = @("api_management", "service_manager", "user_management", "admin_panel")
foreach ($app in $apps) {
    if (-not (Test-Path $app)) {
        New-Item -ItemType Directory -Path $app | Out-Null
    }
    if (-not (Test-Path "$app\__init__.py")) {
        New-Item -ItemType File -Path "$app\__init__.py" | Out-Null
    }
    if (-not (Test-Path "$app\apps.py")) {
        $appName = (Get-Culture).TextInfo.ToTitleCase($app.Replace("_", " ")).Replace(" ", "")
        @"
from django.apps import AppConfig

class ${appName}Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = '$app'
"@ | Out-File -FilePath "$app\apps.py" -Encoding UTF8
    }
}
Write-Host "✓ Django app structure created" -ForegroundColor Green

# Run migrations
Write-Host "`nRunning database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate
Write-Host "✓ Database initialized" -ForegroundColor Green

# Create superuser
Write-Host "`nCreating admin superuser..." -ForegroundColor Cyan
Write-Host "Please enter admin credentials:" -ForegroundColor Yellow
python manage.py createsuperuser

# Collect static files
Write-Host "`nCollecting static files..." -ForegroundColor Yellow
python manage.py collectstatic --no-input
Write-Host "✓ Static files collected" -ForegroundColor Green

# Final success message
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓ Admin Panel Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the admin panel:" -ForegroundColor Cyan
Write-Host "  cd backend\admin-panel" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python manage.py runserver 8001" -ForegroundColor White
Write-Host ""
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "  Admin Dashboard:  http://localhost:8001/admin/" -ForegroundColor White
Write-Host "  API Explorer:     http://localhost:8001/" -ForegroundColor White
Write-Host "  API Docs:         http://localhost:8001/api/docs/" -ForegroundColor White
Write-Host ""
Write-Host "Default credentials: Use the superuser you just created" -ForegroundColor Yellow
Write-Host ""
