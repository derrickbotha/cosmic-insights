# Quick Start Guide - ML Admin Features

## 🚀 Immediate Next Steps

Your ML Admin features are now **fully operational**! Here's how to start using them:

---

## Option 1: Use the Test Script (Recommended)

### Step 1: Update Test Credentials
```javascript
// Edit test-ml-admin.js line 7-9
const ADMIN_CREDENTIALS = {
  email: 'YOUR_ADMIN_EMAIL@cosmic.com',  // ← Update this
  password: 'YOUR_ADMIN_PASSWORD'         // ← Update this
};
```

### Step 2: Run the Test Script
```powershell
node test-ml-admin.js
```

This will automatically:
- ✅ Login as admin
- ✅ Create an ML Engineer user
- ✅ Create an Analytics Admin user
- ✅ Display user statistics
- ✅ Check ML service health
- ✅ Trigger data synchronization
- ✅ List synced documents

**Expected Output:**
```
═══════════════════════════════════════════════════
  🚀 ML Admin Feature Test Suite
═══════════════════════════════════════════════════

🔐 Test 1: Admin Login
──────────────────────────────────────────────────
✅ Login successful!
   User: admin@cosmic.com
   Role: admin

👤 Test 2: Create ML Engineer User
──────────────────────────────────────────────────
✅ ML Engineer user created!
   Email: ml_engineer_1728748813456@cosmic.com
   Role: ml_engineer
   ID: 507f1f77bcf86cd799439011

📊 Test 3: Create Analytics Admin User
──────────────────────────────────────────────────
✅ Analytics Admin user created!
   Email: analytics_admin_1728748813789@cosmic.com
   Role: analytics_admin
   ID: 507f191e810c19729de860ea

... and more tests
```

---

## Option 2: Manual Testing via UI

### Step 1: Login to the App
1. Navigate to `http://localhost:3000`
2. Login with your **admin** account
3. You should now see a **database icon** "ML Admin" in the sidebar

### Step 2: Access ML Admin Dashboard
1. Click "ML Admin" in the sidebar
2. You'll see 4 tabs:
   - **Overview** - Statistics and health
   - **Documents** - Browse and manage ML documents
   - **Data Sync** - Synchronize your data
   - **Users** - Create and manage admin users

### Step 3: Create Your First ML Engineer
1. Click the **"Users"** tab
2. Fill out the form:
   - **Email:** `ml_engineer@cosmic.com`
   - **Password:** `SecurePassword123!` (min 8 characters)
   - **Name:** `Jane ML Engineer`
   - **Role:** ML Engineer (select from dropdown)
3. Click **"Create User"**
4. ✅ Success! User is created with premium tier automatically

### Step 4: Sync Your Data
1. Click the **"Data Sync"** tab
2. Options:
   - **Sync Journal Entries** - Syncs only journal entries
   - **Sync Goals** - Syncs only goals
   - **Sync All Data** - Syncs everything
3. Click **"Sync All Data"** button
4. Wait for completion message
5. Check the **Documents** tab to see synced items

### Step 5: Explore Documents
1. Click the **"Documents"** tab
2. You'll see all synced documents with:
   - Title
   - Document type (journal, goal, etc.)
   - Embedding status (pending → processing → completed)
   - Actions (retry, delete)
3. Try:
   - 🔍 **Search** for specific documents
   - 🎯 **Filter** by embedding status
   - ☑️ **Select** multiple documents
   - 🗑️ **Bulk delete** selected items

---

## Option 3: API Testing with cURL

### Get User Statistics
```powershell
curl http://localhost:5000/api/users/stats `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create ML Engineer
```powershell
$body = @{
  email = "ml_engineer@cosmic.com"
  password = "SecurePassword123"
  role = "ml_engineer"
  name = "Jane Engineer"
} | ConvertTo-Json

curl -Method POST http://localhost:5000/api/users/create-admin `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -Body $body
```

### Trigger Data Sync
```powershell
curl -Method POST http://localhost:5000/api/ml/sync `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### List All Documents
```powershell
curl http://localhost:5000/api/ml/documents `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 What Each Role Can Do

| Feature | User | Admin | ML Engineer | Analytics Admin |
|---------|------|-------|-------------|-----------------|
| Use main app | ✅ | ✅ | ✅ | ✅ |
| Create journal entries | ✅ | ✅ | ✅ | ✅ |
| Admin Dashboard | ❌ | ✅ | ❌ | ❌ |
| ML Admin Dashboard | ❌ | ❌ | ✅ | ✅ |
| Create admin users | ❌ | ✅ | ✅ | ✅ |
| Manage users | ❌ | ✅ | ✅ | ✅ |
| Sync data | ❌ | ❌ | ✅ | ✅ |
| View documents | ❌ | ❌ | ✅ | ✅ |
| Analytics Dashboard | ❌ | ❌ | ❌ | ✅ |

---

## 📝 Common Workflows

### Workflow 1: Onboard a New ML Engineer
```
1. Login as admin → ML Admin → Users tab
2. Fill form: email, password, name, role=ml_engineer
3. Click "Create User"
4. Share credentials with new ML engineer
5. They can now access ML Admin dashboard
```

### Workflow 2: Sync Existing Data
```
1. Login → ML Admin → Data Sync tab
2. Click "Sync All Data"
3. Wait for success message
4. Go to Documents tab
5. Verify synced documents appear
6. Watch embedding status change from pending → completed
```

### Workflow 3: Search and Clean Up Documents
```
1. ML Admin → Documents tab
2. Use search to find specific documents
3. Filter by status (e.g., "failed")
4. Select failed documents using checkboxes
5. Click "Delete X" to bulk delete
6. Or click retry icon to regenerate embeddings
```

### Workflow 4: Monitor Sync Progress
```
1. ML Admin → Overview tab
2. View statistics:
   - Total documents
   - Pending embeddings
   - Processing embeddings
   - Completed/Failed counts
3. Check ML service health
4. Refresh to see updates
```

---

## 🐛 Troubleshooting

### "Access Denied" when clicking ML Admin
**Problem:** User doesn't have the right role  
**Solution:** 
1. Login as admin
2. Go to ML Admin → Users tab
3. Find the user in the table
4. Use the role dropdown to change their role to "ML Engineer"

### Documents not showing after sync
**Problem:** Embeddings generate asynchronously  
**Solution:** 
1. Wait 30-60 seconds
2. Refresh the page
3. Check Overview tab for processing count
4. If still stuck, check ML service health in Overview

### Can't create user - "Email already exists"
**Problem:** Email is already in use  
**Solution:**
1. Use a different email, OR
2. Go to Users tab → Find existing user → Update role

### Backend not responding
**Problem:** Backend might have crashed  
**Solution:**
```powershell
docker-compose restart backend
Start-Sleep -Seconds 10
curl http://localhost:5000/health
```

### Bulk delete not working
**Problem:** No documents selected  
**Solution:**
1. Check checkboxes next to documents
2. "Delete X" button appears when items selected
3. Must have admin role (ml_engineer, analytics_admin, or admin)

---

## 📊 Expected Behavior

### After Data Sync:
- Documents appear in ML service
- Embedding status starts as "pending"
- Celery worker picks up task
- Status changes to "processing"
- After 10-30 seconds, status becomes "completed"
- Failed embeddings show retry button

### In the Users Tab:
- Statistics cards show counts by role
- Create form validates email format and password length
- Users table shows all users with inline role editing
- Can't change own role (safety feature)
- Can't delete own account (safety feature)

### In Documents Tab:
- Search filters by title and document type
- Status filter shows only matching documents
- Checkboxes enable bulk operations
- Master checkbox selects/deselects all
- Delete button shows count of selected items

---

## 🎉 Success Indicators

You'll know it's working when:

✅ **ML Admin appears in sidebar** (for admin users)  
✅ **Can access all 4 tabs** (Overview, Documents, Sync, Users)  
✅ **Can create new admin users** in Users tab  
✅ **User statistics update** after creating users  
✅ **Data sync completes successfully**  
✅ **Documents appear** in Documents tab  
✅ **Embedding status changes** from pending → completed  
✅ **Search and filters work** in Documents tab  
✅ **Bulk operations function** (select & delete)  

---

## 🔜 Next Steps

Once basic features are working:

1. **Create Multiple Admin Users**
   - 1-2 ML Engineers
   - 1 Analytics Admin
   - Test role-based access

2. **Populate ML Service**
   - Sync all existing data
   - Monitor embedding generation
   - Verify search works

3. **Test User-Facing Features** (coming next)
   - Semantic search in Journal
   - Pattern recognition
   - ML-powered suggestions

4. **Production Preparation**
   - Set up monitoring alerts
   - Configure backup strategy
   - Document admin procedures

---

## 📞 Need Help?

### Check System Status:
```powershell
# All services
docker-compose ps

# Backend health
curl http://localhost:5000/health

# ML service health
curl http://localhost:5000/api/ml/health

# Backend logs
docker-compose logs backend --tail 50

# ML service logs
docker-compose logs ml-service --tail 50
```

### Useful Commands:
```powershell
# Restart everything
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart ml-service

# View logs in real-time
docker-compose logs -f backend

# Enter backend container
docker-compose exec backend sh
```

---

**Status:** ✅ All systems operational and ready for use!

**Last Updated:** October 12, 2025  
**Backend:** Running on port 5000  
**ML Service:** Running on port 8000  
**Frontend:** Running on port 3000
