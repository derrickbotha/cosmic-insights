# MongoDB Installation Guide for Windows

## Quick MongoDB Setup (Choose One Option)

### Option 1: MongoDB Atlas (Cloud - Fastest, No Installation)

**Recommended for quick start!**

1. **Sign up for MongoDB Atlas (Free):**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create account (no credit card required)
   - Free tier: 512MB storage forever

2. **Create a Cluster:**
   - Click "Build a Database"
   - Choose "Free" (M0 Sandbox)
   - Select closest region
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Setup Database Access:**
   - Click "Database Access" in left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `cosmicadmin`
   - Password: Click "Autogenerate Secure Password" and copy it
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Setup Network Access:**
   - Click "Network Access" in left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String:**
   - Go back to "Database" 
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://cosmicadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password

6. **Update Backend .env File:**
   ```bash
   # Edit: backend/.env
   # Replace the MONGODB_URI line with your Atlas connection string:
   MONGODB_URI=mongodb+srv://cosmicadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cosmic-insights?retryWrites=true&w=majority
   ```

7. **Start Backend:**
   ```powershell
   cd backend
   npm run dev
   ```

✅ **Done! No local installation needed!**

---

### Option 2: Local MongoDB Installation (Traditional Method)

#### Step 1: Download MongoDB Community Server

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (current)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

#### Step 2: Install MongoDB

1. **Run the MSI installer** (double-click downloaded file)

2. **Setup Wizard:**
   - Click "Next" on welcome screen
   - Accept License Agreement → "Next"
   - Choose "Complete" installation → "Next"
   
3. **Service Configuration:**
   - ✅ Check "Install MongoDB as a Service"
   - Service Name: `MongoDB`
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data`
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`
   - ✅ Check "Run service as Network Service user"
   - Click "Next"

4. **MongoDB Compass (GUI Tool):**
   - ✅ Check "Install MongoDB Compass" (recommended)
   - Click "Next"

5. **Install:**
   - Click "Install"
   - Wait for installation (2-3 minutes)
   - Click "Finish"

#### Step 3: Verify Installation

Open PowerShell as Administrator:

```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Should show:
# Status   Name               DisplayName
# ------   ----               -----------
# Running  MongoDB            MongoDB

# Test MongoDB connection
mongosh

# If mongosh not found, add to PATH:
$env:Path += ";C:\Program Files\MongoDB\Server\7.0\bin"
```

#### Step 4: Start MongoDB (If Not Running)

```powershell
# Start MongoDB service
net start MongoDB

# Or using Services Manager:
# 1. Press Win + R
# 2. Type: services.msc
# 3. Find "MongoDB"
# 4. Right-click → Start
```

#### Step 5: Verify Connection

```powershell
# Connect to MongoDB shell
mongosh

# In MongoDB shell, you should see:
# Current Mongosh Log ID: xxxxx
# Connecting to: mongodb://127.0.0.1:27017/?directConnection=true
# Using MongoDB: 7.0.x
# test>

# Type 'exit' to quit
exit
```

#### Step 6: Start Backend

```powershell
cd backend
npm run dev
```

✅ **MongoDB is now running locally!**

---

## Current Backend Configuration

Your backend is already configured to use:

```env
MONGODB_URI=mongodb://localhost:27017/cosmic-insights
```

This works for **Option 2 (Local Installation)**.

For **Option 1 (Atlas)**, update this to your Atlas connection string.

---

## Verify Backend Connection

Once MongoDB is running, check backend logs:

**Expected Success Output:**
```
2025-10-10 XX:XX:XX [info]: MongoDB connected successfully
2025-10-10 XX:XX:XX [info]: Server running in development mode on port 5000
```

**Test Health Endpoint:**
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

---

## Troubleshooting

### MongoDB Service Won't Start (Local Install)

**Check if port 27017 is in use:**
```powershell
netstat -ano | findstr :27017
```

**If port is occupied, kill the process:**
```powershell
# Replace <PID> with the process ID from netstat
taskkill /PID <PID> /F
```

**Restart MongoDB:**
```powershell
net stop MongoDB
net start MongoDB
```

### Backend Can't Connect

**Check MongoDB is running:**
```powershell
# Local install:
Get-Service MongoDB

# Should show Status: Running
```

**Check connection string in backend/.env:**
```env
# Local (Option 2):
MONGODB_URI=mongodb://localhost:27017/cosmic-insights

# Atlas (Option 1):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cosmic-insights
```

**Check backend logs:**
```powershell
# View real-time logs:
cd backend
npm run dev

# Or check log files:
cat backend/logs/combined.log
cat backend/logs/error.log
```

### MongoDB Compass Connection

**Local (Option 2):**
```
mongodb://localhost:27017
```

**Atlas (Option 1):**
```
Use the connection string from Atlas dashboard
```

---

## Next Steps After MongoDB is Running

1. ✅ **Verify Backend Connects:**
   ```powershell
   curl http://localhost:5000/health
   ```

2. ✅ **Test User Registration:**
   ```powershell
   $body = @{
       email = "test@cosmicinsights.com"
       password = "SecurePass123"
       name = "Test User"
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
   ```

3. ✅ **Test Analytics Event:**
   ```powershell
   $event = @{
       eventName = "page_view"
       sessionId = "session-test-123"
       url = "http://localhost:3000/"
       pathname = "/"
       deviceType = "desktop"
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/event" -Method POST -Body $event -ContentType "application/json"
   ```

4. ✅ **Open MongoDB Compass** (if installed):
   - Connection: `mongodb://localhost:27017`
   - Browse databases: `cosmic-insights`
   - View collections: `users`, `analyticsevents`

---

## Recommended Choice

🎯 **Use Option 1 (MongoDB Atlas)** if:
- ✅ You want to start quickly (5 minutes)
- ✅ No local installation needed
- ✅ Free forever (512MB)
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ✅ Built-in monitoring

🎯 **Use Option 2 (Local MongoDB)** if:
- ✅ You want full control
- ✅ No internet dependency
- ✅ Faster development (no network latency)
- ✅ Learning MongoDB deeply

---

## Complete Setup Checklist

- [ ] Choose MongoDB option (Atlas or Local)
- [ ] Install/Setup MongoDB
- [ ] Verify MongoDB is running
- [ ] Update backend/.env if needed
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Verify backend health: `curl http://localhost:5000/health`
- [ ] Test registration endpoint
- [ ] Test analytics endpoint
- [ ] (Optional) Install MongoDB Compass for GUI management

---

## Current Server Status

✅ **Frontend:** Running on http://localhost:3000
⏳ **Backend:** Waiting for MongoDB connection
❌ **MongoDB:** Not yet installed/configured

**Once MongoDB is set up, all 19 API endpoints will be ready to use!**
