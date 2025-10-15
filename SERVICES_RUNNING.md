# ✅ SERVICES ARE NOW RUNNING!

## Current Status
- ✅ Frontend: **http://localhost:4000** (React Dev Server)
- ✅ Backend: **http://localhost:5000** (Docker with Express API)
- ✅ Mailpit: **http://localhost:8025** (Email Viewer)

## ⚠️ IMPORTANT: Always Use Port 4000
Your app is configured to run on **PORT 4000**, not 3000!

### Correct URLs:
- ✅ **http://localhost:4000** - Your app
- ✅ **http://localhost:5000** - Backend API
- ✅ **http://localhost:8025** - Email viewer

### Wrong URLs:
- ❌ **http://localhost:3000** - Nothing here!

## Quick Commands

### Check if Services are Running
```powershell
# Check backend
curl http://localhost:5000/health

# Check frontend (should see HTML)
curl http://localhost:4000

# Check what's on port 4000
netstat -ano | findstr ":4000"
```

### Start Services
```powershell
# Start backend (if not running)
docker-compose -f docker-compose.mailpit.yml up -d

# Start frontend (if not running)
npm start
```

### Stop Services
```powershell
# Stop frontend
Stop-Process -Name "node" -Force

# Stop backend
docker-compose -f docker-compose.mailpit.yml down
```

## Registration Instructions

1. Open **http://localhost:4000** in your browser
2. Click "Sign Up" or "Get Started"
3. Fill in the form:
   - Email: your@email.com
   - Name: Your Name
   - Username: username
   - Password: **Lookgood123!** (at least 12 chars!)
4. Click "Register"
5. Open **http://localhost:8025** (Mailpit)
6. Find your verification email
7. Click the "Verify Email" link
8. Return to **http://localhost:4000** and login!

## Password Requirements
- Minimum **12 characters**
- Must include:
  - Uppercase letter (A-Z)
  - Lowercase letter (a-z)
  - Number (0-9)
  - Special character (!@#$%^&*(),.?":{}|<>)

**Example**: `Lookgood123!` or `MyP@ssword456!`

## Troubleshooting

### "ERR_CONNECTION_REFUSED" Error
**Problem**: Frontend server stopped

**Solution**:
```powershell
# Restart frontend
npm start
```

### "CORS policy" Error
**Problem**: Backend not configured for port 4000

**Solution**:
```powershell
# Restart backend with correct config
docker-compose -f docker-compose.mailpit.yml down
docker-compose -f docker-compose.mailpit.yml up -d

# Wait 10 seconds, then verify
Start-Sleep -Seconds 10
docker exec cosmic-backend printenv | findstr CORS_ORIGIN
# Should show: CORS_ORIGIN=http://localhost:4000
```

### Frontend Keeps Stopping
The React dev server can crash. When this happens:
1. Check the terminal for errors
2. Restart with: `npm start`
3. Consider increasing Node.js memory:
   ```powershell
   $env:NODE_OPTIONS="--max-old-space-size=4096"
   npm start
   ```

## Architecture
```
Browser (localhost:4000)
    ↓
React Frontend (Port 4000)
    ↓
Backend API (Port 5000)
    ↓
Mailpit SMTP (Port 1025) → Web UI (Port 8025)
```

## Files to Remember
- `.env` - Frontend port configuration (PORT=4000)
- `docker-compose.mailpit.yml` - Backend with email service
- `ROBUST_STARTUP_GUIDE.md` - Detailed documentation

---

**Last Updated**: October 15, 2025  
**Your frontend is running in the terminal - don't close it!**
