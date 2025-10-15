# 🎯 Admin Panels Access Guide

**Date**: October 15, 2025  
**Status**: ✅ Email Verified - Ready to Access!

---

## 🚀 Quick Access Links

| Service | URL | Credentials | Purpose |
|---------|-----|-------------|---------|
| **Main App** | http://localhost:4000 | Your registered account | User interface |
| **Backend Admin** | http://localhost:5001/admin | admin / admin123 | API & Service Management |
| **ML Service Admin** | http://localhost:8000/admin | admin / admin123 | ML Models & Embeddings |
| **MongoDB Admin** | http://localhost:8081 | admin / changeme | Database Management |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin | File Storage |

---

## 1️⃣ Main Application (User Interface)

### Access
**URL**: http://localhost:4000

### Login
- **Email**: `bothaderrrick@gmail.com`
- **Password**: Your registered password
- **Status**: ✅ Email verified - you can now login!

### What You Can Do
- ✨ Complete astrology questionnaire
- 🌟 Get personalized cosmic insights
- 📊 View your astrological profile
- 🎨 Manage preferences and settings
- 👤 Update profile information
- 🔔 Manage notifications

### Steps to Login
1. Open http://localhost:4000 in your browser
2. Click "Sign In" or go to http://localhost:4000/login
3. Enter your email: `bothaderrrick@gmail.com`
4. Enter your password
5. Click "Sign In"
6. You're in! 🎉

---

## 2️⃣ Backend Admin Panel (NEW!)

### Access
**URL**: http://localhost:5001/admin

### Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

### What You Can Do
- 🔑 **API Key Management**
  - Create API keys for external services
  - View usage statistics
  - Revoke/regenerate keys
  - Set rate limits and permissions
  
- 📡 **Endpoint Catalog**
  - View all available API endpoints
  - See request/response schemas
  - Test endpoints directly
  - Monitor endpoint health
  
- 📈 **Usage Analytics**
  - Track API usage by endpoint
  - Monitor response times
  - View error rates
  - Analyze user patterns
  
- 🔌 **Service Management** (Coming Soon)
  - Connect external services (Stripe, SendGrid, etc.)
  - Manage service credentials
  - Test connections
  - Configure webhooks

### Steps to Access
1. Open http://localhost:5001/admin in your browser
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click "Log in"
5. You're in the Django admin interface! 🎉

### Features Available Now

#### API Keys
- **Create New**: Click "API keys" → "Add API key +"
- **Fields**:
  - Name: Descriptive name for the key
  - Service name: Which service is using it
  - Permissions: Comma-separated list (read, write, admin)
  - Rate limit: Requests per minute (default: 100)
  - Active: Enable/disable the key
- **Copy Key**: After creating, copy the displayed key (won't be shown again!)

#### Endpoints
- **View All**: Click "Endpoints" to see catalog
- **Details**: Click any endpoint to see:
  - HTTP method (GET, POST, etc.)
  - Full path
  - Description
  - Request schema (JSON)
  - Response schema (JSON)
  - Authentication required
  - Service it belongs to

#### API Usage
- **View Logs**: Click "Api usages" to see all requests
- **Filter**: By endpoint, API key, status code, date range
- **Metrics**:
  - Timestamp
  - Endpoint called
  - API key used
  - Response time (ms)
  - Status code
  - Error message (if any)

---

## 3️⃣ ML Service Admin

### Access
**URL**: http://localhost:8000/admin

### Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

### What You Can Do
- 🤖 **ML Model Management**
  - View loaded models
  - Check model status
  - Update model configurations
  
- 🔢 **Embedding Management**
  - View stored embeddings
  - Monitor embedding generation
  - Analyze embedding quality
  
- 🗄️ **Qdrant Collections**
  - Manage vector database collections
  - View collection statistics
  - Query embeddings
  
- 📊 **ML Jobs**
  - Monitor training jobs
  - View job history
  - Check job status

### Steps to Access
1. Open http://localhost:8000/admin in your browser
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click "Log in"
5. Django admin for ML service appears

---

## 4️⃣ MongoDB Admin (Mongo Express)

### Access
**URL**: http://localhost:8081

### Login Credentials
- **Username**: `admin`
- **Password**: `changeme`

### What You Can Do
- 📊 **Database Management**
  - View all databases
  - Create/delete databases
  - Manage collections
  
- 📝 **Document Editing**
  - View documents in collections
  - Edit documents directly
  - Add new documents
  - Delete documents
  
- 🔍 **Query Interface**
  - Run MongoDB queries
  - Export query results
  - Import data
  
- 📈 **Statistics**
  - Database sizes
  - Collection counts
  - Index information

### Key Collections to Explore

#### `cosmic-insights` Database
- **users**: All registered users (10 users currently)
  - View user profiles
  - Check verification status
  - See subscription tiers
  
- **sessions**: Active user sessions
  - Monitor logged-in users
  - Check session expiration
  
- **readings**: Astrology readings
  - Generated insights
  - Reading history
  
- **questionnaires**: User questionnaire responses
  - Birth data
  - Preferences
  - Astrological information

### Steps to Access
1. Open http://localhost:8081 in your browser
2. Enter username: `admin`
3. Enter password: `changeme`
4. Click "Login" (or press Enter)
5. Click on `cosmic-insights` database
6. Explore collections

### Quick Actions

#### View All Users
1. Go to http://localhost:8081
2. Click `cosmic-insights` database
3. Click `users` collection
4. See all 10 registered users

#### Edit a User
1. Navigate to users collection
2. Click on a user document
3. Edit fields (be careful with passwords!)
4. Click "Save"

#### Run a Query
1. Navigate to any collection
2. Click "Query" button
3. Enter MongoDB query (e.g., `{email: "bothaderrrick@gmail.com"}`)
4. Click "Execute"

---

## 5️⃣ MinIO Console (File Storage)

### Access
**URL**: http://localhost:9001

### Login Credentials
- **Username**: `minioadmin`
- **Password**: `minioadmin`

### What You Can Do
- 📁 **Bucket Management**
  - Create/delete buckets
  - Configure bucket policies
  - Set access controls
  
- 📤 **File Operations**
  - Upload files
  - Download files
  - Delete files
  - Share files (generate URLs)
  
- 👥 **User Management**
  - Create service accounts
  - Manage access keys
  - Set permissions
  
- 📊 **Monitoring**
  - Storage usage
  - API metrics
  - Traffic statistics

### Steps to Access
1. Open http://localhost:9001 in your browser
2. Enter username: `minioadmin`
3. Enter password: `minioadmin`
4. Click "Login"
5. MinIO Console dashboard appears

### Current Buckets
- **profile-images**: User profile pictures
- **astrology-resources**: Astrology charts, images, etc.
- **ml-models**: Machine learning model files
- **exports**: Data export files

---

## 🎨 Admin Workflow Examples

### Example 1: Create an API Key for External Service

1. **Access Backend Admin**
   - Go to http://localhost:5001/admin
   - Login with admin/admin123

2. **Create API Key**
   - Click "API keys" in left menu
   - Click "Add API key +" button
   - Fill in:
     - Name: "Mobile App"
     - Service name: "mobile_app"
     - Permissions: "read,write"
     - Rate limit: 1000
     - Active: ✅ Check
   - Click "Save"

3. **Copy the Key**
   - **IMPORTANT**: The key is displayed only once!
   - Copy it immediately and store securely
   - Example: `cosmic_live_abc123def456...`

4. **Test the Key**
   ```bash
   curl -H "X-API-Key: cosmic_live_abc123def456..." http://localhost:5000/api/health
   ```

---

### Example 2: Monitor API Usage

1. **Access Backend Admin**
   - Go to http://localhost:5001/admin

2. **View Usage**
   - Click "Api usages" in left menu
   - See all API calls with:
     - Timestamp
     - Endpoint
     - API key used
     - Response time
     - Status code

3. **Filter by Endpoint**
   - Use the filter on the right
   - Select "By endpoint"
   - Choose endpoint (e.g., "/api/auth/login")
   - Click "Apply"

4. **Analyze Performance**
   - Look for slow endpoints (high response times)
   - Check error rates (4xx, 5xx status codes)
   - Identify bottlenecks

---

### Example 3: Verify User Email Manually

1. **Access MongoDB Admin**
   - Go to http://localhost:8081
   - Login with admin/changeme

2. **Navigate to Users**
   - Click `cosmic-insights` database
   - Click `users` collection

3. **Find User**
   - Click "Query" button
   - Enter: `{email: "user@example.com"}`
   - Click "Execute"

4. **Edit User**
   - Click on the user document
   - Find `emailVerified` field
   - Change `false` to `true`
   - Click "Save"

5. **Verify Change**
   - User can now login!

---

### Example 4: Check ML Embeddings

1. **Access ML Service Admin**
   - Go to http://localhost:8000/admin

2. **View Embeddings**
   - Click "Embeddings" (or relevant model)
   - See list of all embeddings

3. **Check Details**
   - Click on an embedding
   - View:
     - Vector dimensions
     - Associated text
     - Similarity scores
     - Creation date

---

### Example 5: Upload Astrology Resource

1. **Access MinIO Console**
   - Go to http://localhost:9001
   - Login with minioadmin/minioadmin

2. **Select Bucket**
   - Click "Buckets" in left menu
   - Click "astrology-resources"

3. **Upload File**
   - Click "Upload" button
   - Select file from your computer
   - Wait for upload to complete

4. **Share File**
   - Find uploaded file
   - Click "Share" button
   - Copy generated URL
   - Set expiration time
   - Use URL in your app

---

## 🔧 Troubleshooting

### Cannot Access Admin Panel

**Issue**: "This site can't be reached"

**Solutions**:
1. Check if services are running:
   ```bash
   docker-compose ps
   ```
2. Look for "Up" status for each service
3. If service is down, restart it:
   ```bash
   docker-compose restart backend-admin
   docker-compose restart ml-service
   ```

---

### Forgot Admin Password

**Backend Admin & ML Service** (Django):
```bash
# Reset Django admin password
docker-compose exec backend-admin python manage.py changepassword admin

# Or create new superuser
docker-compose exec backend-admin python manage.py createsuperuser
```

**MongoDB Admin**:
- Credentials are in `docker-compose.yml`
- Default: admin / changeme
- To change: Edit environment variables and restart

**MinIO**:
- Credentials are in `docker-compose.yml`
- Default: minioadmin / minioadmin
- To change: Edit environment variables and restart

---

### Login Loop / Session Issues

**Clear Browser Data**:
1. Open Developer Tools (F12)
2. Go to Application tab
3. Clear cookies for localhost
4. Clear local storage
5. Refresh page

**Or Try Incognito Mode**:
- Ctrl+Shift+N (Chrome)
- Ctrl+Shift+P (Firefox)

---

### API Key Not Working

**Check Key Status**:
1. Go to http://localhost:5001/admin
2. Click "API keys"
3. Find your key
4. Verify:
   - Active checkbox is checked
   - Rate limit not exceeded
   - Permissions are correct

**Regenerate Key**:
1. Delete old key (don't worry, this is safe)
2. Create new key with same settings
3. Copy new key
4. Update your application

---

## 📚 Additional Resources

### API Documentation
- **Backend API**: Check `backend/README.md`
- **ML Service API**: Check `ml-service/README.md`
- **Endpoint Catalog**: http://localhost:5001/admin/api_management/endpoint/

### Development Tools
- **Backend Logs**: `docker-compose logs backend -f`
- **ML Service Logs**: `docker-compose logs ml-service -f`
- **Database Logs**: `docker-compose logs mongodb -f`

### Health Checks
- **Backend**: http://localhost:5000/health
- **ML Service**: http://localhost:8000/health
- **Frontend**: http://localhost:4000

---

## 🎯 Quick Reference Card

**Print this section for easy access!**

```
┌─────────────────────────────────────────────────────┐
│         COSMIC INSIGHTS - ADMIN ACCESS              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🌐 MAIN APP                                        │
│     http://localhost:4000                           │
│     Email: bothaderrrick@gmail.com                  │
│     Password: [your password]                       │
│                                                     │
│  🔧 BACKEND ADMIN                                   │
│     http://localhost:5001/admin                     │
│     User: admin / Pass: admin123                    │
│                                                     │
│  🤖 ML SERVICE ADMIN                                │
│     http://localhost:8000/admin                     │
│     User: admin / Pass: admin123                    │
│                                                     │
│  🗄️  MONGODB ADMIN                                  │
│     http://localhost:8081                           │
│     User: admin / Pass: changeme                    │
│                                                     │
│  📦 MINIO CONSOLE                                   │
│     http://localhost:9001                           │
│     User: minioadmin / Pass: minioadmin             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Your Account Status

- ✉️ **Email**: bothaderrrick@gmail.com
- ✅ **Verified**: YES (just verified!)
- 👤 **Role**: user
- 🎫 **Tier**: free
- 🔓 **Status**: Active
- 📅 **Created**: October 12, 2025

### Ready to Login!
Your email is now verified and you can access all the admin panels! 🚀

---

## 🚀 Next Steps

1. **Login to Main App**
   - Go to http://localhost:4000
   - Use your credentials
   - Complete the astrology questionnaire

2. **Explore Backend Admin**
   - Create an API key
   - View endpoint catalog
   - Check usage analytics

3. **Check Your Data**
   - Go to MongoDB Admin
   - View your user document
   - See your questionnaire responses

4. **Access ML Admin**
   - View ML models
   - Check embeddings
   - Monitor predictions

Have fun exploring your Cosmic Insights platform! 🌟✨

**Questions?** Check the troubleshooting section above or the main README.md
