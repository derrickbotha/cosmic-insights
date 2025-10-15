# AWS SES Quick Setup Script
# Run this after you have your AWS SES SMTP credentials

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         AWS SES CONFIGURATION - QUICK SETUP                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "This script will help you configure AWS SES for your application.`n" -ForegroundColor White

# Check if backend/.env exists
$envPath = ".\backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ ERROR: backend/.env file not found!" -ForegroundColor Red
    Write-Host "   Please create backend/.env file first.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 STEP 1: Gather Your AWS SES Credentials" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "`nYou'll need:" -ForegroundColor White
Write-Host "  1. AWS Region (e.g., us-east-1)" -ForegroundColor Gray
Write-Host "  2. SMTP Username (from AWS IAM)" -ForegroundColor Gray
Write-Host "  3. SMTP Password (from AWS IAM)" -ForegroundColor Gray
Write-Host "  4. Verified sender email" -ForegroundColor Gray

Write-Host "`n📖 Don't have credentials yet?" -ForegroundColor Cyan
Write-Host "   Follow the guide: AWS_SES_SETUP_GUIDE.md`n" -ForegroundColor White

$continue = Read-Host "Do you have your AWS SES credentials ready? (y/n)"
if ($continue -ne 'y') {
    Write-Host "`n📖 Please complete AWS SES setup first:" -ForegroundColor Yellow
    Write-Host "   1. Open: AWS_SES_SETUP_GUIDE.md" -ForegroundColor White
    Write-Host "   2. Follow STEP 1-4 to get credentials" -ForegroundColor White
    Write-Host "   3. Run this script again`n" -ForegroundColor White
    exit 0
}

Write-Host "`n🔧 STEP 2: Enter Your AWS SES Configuration" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray

# Get AWS Region
Write-Host "`n📍 AWS Region:" -ForegroundColor Cyan
Write-Host "   Common regions:" -ForegroundColor Gray
Write-Host "   • us-east-1 (US East - N. Virginia) - Most popular" -ForegroundColor White
Write-Host "   • us-west-2 (US West - Oregon)" -ForegroundColor White
Write-Host "   • eu-west-1 (EU - Ireland)" -ForegroundColor White
Write-Host "   • eu-central-1 (EU - Frankfurt)" -ForegroundColor White
Write-Host "   • ap-southeast-1 (Asia Pacific - Singapore)" -ForegroundColor White

$awsRegion = Read-Host "`nEnter your AWS region (e.g., us-east-1)"
if ([string]::IsNullOrWhiteSpace($awsRegion)) {
    $awsRegion = "us-east-1"
    Write-Host "   Using default: us-east-1" -ForegroundColor Yellow
}

$smtpHost = "email-smtp.$awsRegion.amazonaws.com"
Write-Host "   SMTP Host: $smtpHost" -ForegroundColor Green

# Get SMTP Credentials
Write-Host "`n🔑 SMTP Credentials:" -ForegroundColor Cyan
$smtpUser = Read-Host "Enter SMTP Username (starts with AKIA...)"
$smtpPass = Read-Host "Enter SMTP Password" -AsSecureString
$smtpPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($smtpPass)
)

# Get Email From
Write-Host "`n📧 Sender Email:" -ForegroundColor Cyan
Write-Host "   This must be verified in AWS SES" -ForegroundColor Gray
$emailFrom = Read-Host "Enter sender email (e.g., noreply@yourdomain.com)"

# Get Client URL
Write-Host "`n🌐 Application URL:" -ForegroundColor Cyan
Write-Host "   For testing, use: http://localhost:4000" -ForegroundColor Gray
Write-Host "   For production, use: https://yourdomain.com" -ForegroundColor Gray
$clientUrl = Read-Host "Enter application URL"
if ([string]::IsNullOrWhiteSpace($clientUrl)) {
    $clientUrl = "http://localhost:4000"
    Write-Host "   Using default: http://localhost:4000" -ForegroundColor Yellow
}

Write-Host "`n💾 STEP 3: Update Configuration" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray

# Read current .env file
$envContent = Get-Content $envPath -Raw

# Check if SES config already exists
if ($envContent -match "SMTP_HOST=") {
    Write-Host "`n⚠️  WARNING: SMTP configuration already exists in .env" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite? (y/n)"
    if ($overwrite -ne 'y') {
        Write-Host "`n❌ Configuration cancelled.`n" -ForegroundColor Red
        exit 0
    }
}

# Prepare new SES configuration
$sesConfig = @"

# ============================================
# AWS SES SMTP Configuration
# Added on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ============================================

SMTP_HOST=$smtpHost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=$smtpUser
SMTP_PASS=$smtpPassPlain
EMAIL_FROM=$emailFrom
EMAIL_FROM_NAME=Cosmic Insights
CLIENT_URL=$clientUrl
"@

# Remove old SMTP config if exists
$envContent = $envContent -replace '(?ms)# AWS SES.*?(?=\r?\n\r?\n|\Z)', ''
$envContent = $envContent -replace 'SMTP_HOST=.*', ''
$envContent = $envContent -replace 'SMTP_PORT=.*', ''
$envContent = $envContent -replace 'SMTP_SECURE=.*', ''
$envContent = $envContent -replace 'SMTP_USER=.*', ''
$envContent = $envContent -replace 'SMTP_PASS=.*', ''
$envContent = $envContent -replace 'EMAIL_FROM=.*', ''
$envContent = $envContent -replace 'EMAIL_FROM_NAME=.*', ''
$envContent = $envContent -replace 'CLIENT_URL=.*', ''

# Append new SES config
$envContent = $envContent.TrimEnd() + "`n" + $sesConfig

# Write to .env file
$envContent | Set-Content -Path $envPath -NoNewline

Write-Host "`n✅ Configuration saved to backend/.env" -ForegroundColor Green

Write-Host "`n🔄 STEP 4: Restart Backend" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray

$restart = Read-Host "`nRestart backend now? (y/n)"
if ($restart -eq 'y') {
    Write-Host "`n🔄 Restarting backend..." -ForegroundColor Cyan
    
    try {
        docker-compose -f docker-compose.mailpit.yml restart backend
        Write-Host "✅ Backend restarted successfully!" -ForegroundColor Green
        
        Write-Host "`n⏳ Waiting for backend to start (10 seconds)..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
        
        # Test backend health
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 5
            Write-Host "✅ Backend is healthy!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Backend health check failed. Check logs:" -ForegroundColor Yellow
            Write-Host "   docker-compose logs backend" -ForegroundColor White
        }
    } catch {
        Write-Host "❌ Error restarting backend: $_" -ForegroundColor Red
        Write-Host "   Try manually: docker-compose -f docker-compose.mailpit.yml restart backend" -ForegroundColor Yellow
    }
}

Write-Host "`n🧪 STEP 5: Test Email Sending" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n📧 To test AWS SES:" -ForegroundColor Cyan
Write-Host "   1. Open: http://localhost:4000" -ForegroundColor White
Write-Host "   2. Click 'Sign Up' and register" -ForegroundColor White

if ($envContent -match "In the sandbox") {
    Write-Host "`n⚠️  SANDBOX MODE:" -ForegroundColor Yellow
    Write-Host "   Your AWS account is in sandbox mode." -ForegroundColor White
    Write-Host "   You can only send to verified email addresses." -ForegroundColor White
    Write-Host "   Register with: $emailFrom" -ForegroundColor Cyan
} else {
    Write-Host "   3. Use any real email address" -ForegroundColor White
}

Write-Host "   4. Check your inbox for verification email" -ForegroundColor White
Write-Host "   5. Click verification link" -ForegroundColor White
Write-Host "   6. You'll be auto-logged in! 🎉" -ForegroundColor Green

Write-Host "`n📊 STEP 6: Monitor AWS SES" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n📈 Check your sending statistics:" -ForegroundColor Cyan
Write-Host "   • AWS Console: https://console.aws.amazon.com/ses/" -ForegroundColor White
Write-Host "   • Navigate to: Account dashboard" -ForegroundColor White
Write-Host "   • Monitor: Bounce rate, Complaint rate, Delivery rate" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "   • Keep bounce rate < 5%" -ForegroundColor White
Write-Host "   • Keep complaint rate < 0.1%" -ForegroundColor White
Write-Host "   • Monitor daily via AWS Console" -ForegroundColor White

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              AWS SES CONFIGURATION COMPLETE! ✅            ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📄 Configuration Summary:" -ForegroundColor Cyan
Write-Host "   • SMTP Host: $smtpHost" -ForegroundColor White
Write-Host "   • SMTP Port: 587" -ForegroundColor White
Write-Host "   • Sender Email: $emailFrom" -ForegroundColor White
Write-Host "   • Application URL: $clientUrl" -ForegroundColor White

Write-Host "`n🚀 Your app can now send emails via AWS SES!" -ForegroundColor Green
Write-Host "   Free quota: 62,000 emails/month (first year)" -ForegroundColor White
Write-Host "   After free tier: `$0.10 per 1,000 emails`n" -ForegroundColor White

Write-Host "📖 For detailed setup and troubleshooting:" -ForegroundColor Cyan
Write-Host "   Read: AWS_SES_SETUP_GUIDE.md`n" -ForegroundColor White

# Show backend logs
$showLogs = Read-Host "Show backend logs? (y/n)"
if ($showLogs -eq 'y') {
    Write-Host "`n📋 Backend logs (last 30 lines):" -ForegroundColor Cyan
    Write-Host "=" * 70 -ForegroundColor Gray
    docker-compose -f docker-compose.mailpit.yml logs --tail 30 backend
}

Write-Host "`n✨ Setup complete! Ready to send emails.`n" -ForegroundColor Green
