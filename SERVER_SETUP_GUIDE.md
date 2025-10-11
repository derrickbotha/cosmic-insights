# Server Setup & Running Guide

## Current Status

### ✅ Frontend Server
- **Status**: Running
- **URL**: http://localhost:3000
- **Technology**: React with Create React App
- **Auto-reload**: Enabled

### ⚠️ Backend Server
- **Status**: Started but waiting for MongoDB connection
- **URL**: http://localhost:5000 (will work once MongoDB is running)
- **Technology**: Node.js + Express
- **Auto-reload**: Enabled (nodemon)

### ❌ MongoDB Database
- **Status**: Not running
- **Required**: Yes, for backend to function
- **Action needed**: Install and start MongoDB

---

## MongoDB Setup Options

### Option 1: Install MongoDB Locally (Recommended for Development)

#### Windows Installation:

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select "Windows" platform
   - Download MSI installer

2. **Install MongoDB:**
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool) when prompted

3. **Verify Installation:**
   ```powershell
   mongod --version
   ```

4. **Start MongoDB Service:**
   ```powershell
   # MongoDB should start automatically as a Windows service
   # If not, start it manually:
   net start MongoDB
   ```

5. **Restart Backend Server:**
   - The backend will automatically connect once MongoDB is running
   - Or manually restart: In backend terminal, type `rs` and press Enter

### Option 2: Use MongoDB Atlas (Cloud - No Installation)

1. **Create Free Account:**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free account (512MB free tier)

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "Free" tier
   - Select your region
   - Create cluster (takes 3-5 minutes)

3. **Configure Access:**
   - Click "Database Access" → Add Database User
   - Create username and password (save these!)
   - Click "Network Access" → Add IP Address → "Allow Access from Anywhere" (for dev)

4. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

5. **Update Backend .env:**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/cosmic-insights?retryWrites=true&w=majority
   ```

6. **Restart Backend:**
   - Save the .env file
   - Backend will auto-reload and connect

---

## Quick Start Commands

### Starting Everything:

```powershell
# Terminal 1: Frontend
cd "c:\Users\dbmos\OneDrive\Documents\Astrology App\Astrology V1.1"
npm start

# Terminal 2: Backend
cd "c:\Users\dbmos\OneDrive\Documents\Astrology App\Astrology V1.1\backend"
npm run dev

# Terminal 3: MongoDB (if local)
mongod
```

### Stopping Servers:

- **Frontend/Backend**: Press `Ctrl + C` in the terminal
- **MongoDB**: `net stop MongoDB` (if Windows service)

---

## Testing the Servers

### 1. Check Frontend:
Open browser to: http://localhost:3000

### 2. Check Backend Health:
```powershell
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-10T...",
  "environment": "development"
}
```

### 3. Test User Registration:
```powershell
$body = @{
    email = "test@example.com"
    password = "SecurePass123"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### 4. Test Analytics Event:
```powershell
$event = @{
    eventName = "page_view"
    sessionId = "session-$(Get-Date -Format 'yyyyMMddHHmmss')"
    url = "http://localhost:3000/"
    pathname = "/"
    deviceType = "desktop"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/event" -Method POST -Body $event -ContentType "application/json"
```

---

## Current Server Configuration

### Frontend (React)
- **Port**: 3000
- **API Proxy**: Not configured yet (will add if needed)
- **Environment**: Development

### Backend (Express)
- **Port**: 5000
- **CORS**: Allows requests from http://localhost:3000
- **Rate Limits**: 100 requests/15min (general), 5 requests/15min (auth)
- **JWT Tokens**: Access (15min), Refresh (7 days)
- **Password Hashing**: bcrypt (12 rounds)

### Database (MongoDB)
- **Local URI**: mongodb://localhost:27017/cosmic-insights
- **Database Name**: cosmic-insights
- **Collections**: users, analyticsevents, payments, subscriptions

---

## Troubleshooting

### Backend Shows "ECONNREFUSED" Error
**Problem**: MongoDB is not running
**Solution**: Install and start MongoDB (see options above)

### Frontend Can't Connect to Backend
**Problem**: CORS or backend not running
**Solution**: 
- Check backend is running on port 5000
- Check CORS_ORIGIN in backend/.env is set to http://localhost:3000

### Port Already in Use
**Problem**: Another process is using the port
**Solution**:
```powershell
# Check what's using port 3000 or 5000
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### MongoDB Connection Timeout
**Problem**: MongoDB not accessible or wrong connection string
**Solution**:
- Verify MongoDB is running: `mongosh` (should connect)
- Check MONGODB_URI in backend/.env
- If using Atlas, verify network access allows your IP

---

## Environment Files

### Frontend (.env) - Not created yet
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env) - Already created ✅
Located at: `backend/.env`
- JWT secrets: ✅ Generated
- CORS origin: ✅ Configured
- MongoDB URI: ✅ Set to local (change if using Atlas)

---

## Next Steps

1. **Install MongoDB** (choose Option 1 or 2 above)
2. **Verify both servers are running**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/health
3. **Test API endpoints** (see Testing section above)
4. **Configure frontend to use backend API** (update service files to call http://localhost:5000)

---

## API Documentation

Full API documentation is available in:
- `backend/README.md` - Setup and usage guide
- `backend/BACKEND_IMPLEMENTATION.md` - Implementation details
- `SECURITY_ADMIN_GUIDE.md` - Security features and admin guide

**Available Endpoints:**
- **Auth**: 10 endpoints (register, login, logout, refresh, password reset, profile)
- **Analytics**: 8 endpoints (event tracking, summary, export, real-time)
- **Health**: 1 endpoint (server status)

Total: **19 API endpoints** ready to use!

---

## Development Workflow

1. **Make changes** to code
2. **Auto-reload**: Both servers automatically reload
3. **Test** changes in browser or with API calls
4. **Check logs**:
   - Frontend: Terminal output
   - Backend: Terminal output + `backend/logs/*.log` files
5. **Commit** changes when ready

---

## Production Deployment

When ready for production, see:
- `backend/README.md` - Production deployment checklist
- Update environment variables for production
- Set up proper MongoDB instance (Atlas production cluster)
- Configure domain and HTTPS
- Set up monitoring and backups

---

Happy coding! 🚀
