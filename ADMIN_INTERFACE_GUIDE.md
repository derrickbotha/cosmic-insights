# Backend Admin Interface Guide

## 🎯 Overview

The Backend Admin system provides Django-based web interfaces to manage the Cosmic Insights backend services:

- **Backend Admin** (Port 5001): Manages Backend API (Node.js), API keys, and service integrations
- **ML Service Admin** (Port 8000): Manages ML models, embeddings, and Qdrant collections

---

## 🚀 Quick Start

### Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend Admin** | http://localhost:5001/admin | API Management, Keys, Services |
| **API Documentation** | http://localhost:5001/swagger | Interactive API docs |
| **ML Service Admin** | http://localhost:8000/admin | ML Models, Embeddings |

### Default Credentials

```
Username: admin
Password: admin123
```

⚠️ **SECURITY WARNING**: Change these credentials immediately in production!

---

## 📋 Backend Admin Features (Port 5001)

### 1. API Key Management

**Purpose**: Create and manage API keys for external services and applications.

**How to Create an API Key**:
1. Navigate to http://localhost:5001/admin
2. Login with credentials above
3. Click **API Keys** → **Add API Key**
4. Fill in the form:
   - **Name**: Friendly name (e.g., "Mobile App", "Partner Integration")
   - **Status**: Active/Inactive/Revoked
   - **Rate Limit**: Requests per hour (default: 1000)
   - **Allowed Endpoints**: JSON array of endpoint patterns (e.g., `["/api/auth/*", "/api/users/*"]`)
   - **Description**: Optional notes
   - **Expires At**: Optional expiration date
5. Click **Save**
6. ⚠️ **IMPORTANT**: Copy the generated API key immediately - it will only be shown once!

**Example API Key**:
```
csk_a3f9b2c8d7e1f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5
```

**Using the API Key**:
```bash
# Add to request headers
Authorization: Bearer csk_a3f9b2c8d7e1f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5
```

**Key Features**:
- SHA-256 hashed storage (only prefix visible in admin)
- Rate limiting per key
- Endpoint access control
- Usage tracking
- Expiration dates
- Revocation capability

---

### 2. API Endpoint Catalog

**Purpose**: Document and manage all Backend API endpoints.

**How to Add an Endpoint**:
1. Navigate to **API Endpoints** → **Add API Endpoint**
2. Fill in the form:
   - **Path**: `/api/auth/login`
   - **Method**: GET/POST/PUT/DELETE/PATCH
   - **Name**: "User Login"
   - **Category**: Authentication/Users/Analytics/ML/Admin
   - **Description**: What this endpoint does
   - **Request Schema**: JSON schema for request body
   - **Response Schema**: JSON schema for response
   - **Rate Limit**: Requests per hour for this endpoint
   - **Is Active**: Enable/disable endpoint

**Example Request Schema**:
```json
{
  "type": "object",
  "properties": {
    "email": {"type": "string", "format": "email"},
    "password": {"type": "string", "minLength": 8}
  },
  "required": ["email", "password"]
}
```

**Example Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {"type": "boolean"},
    "accessToken": {"type": "string"},
    "user": {
      "type": "object",
      "properties": {
        "id": {"type": "string"},
        "email": {"type": "string"}
      }
    }
  }
}
```

---

### 3. Usage Statistics

**Purpose**: Monitor API usage, performance, and errors.

**Viewing Statistics**:
1. Navigate to **API Usage Logs**
2. Filter by:
   - Date range
   - API key
   - Endpoint
   - Status code

**Available Metrics**:
- Total requests (24h, 7d, 30d)
- Average response time
- Error rate (4xx, 5xx)
- Top endpoints by usage
- Requests by API key
- Geographic distribution (via IP)

**REST API Endpoint**:
```bash
GET http://localhost:5001/api/management/usage/

# Response:
{
  "24h": {
    "total_requests": 1524,
    "avg_response_time_ms": 245,
    "error_count": 12
  },
  "7d": {
    "total_requests": 8932,
    "avg_response_time_ms": 267,
    "error_count": 89
  },
  "top_endpoints": [
    {
      "path": "/api/auth/login",
      "method": "POST",
      "count": 432,
      "avg_response_time_ms": 189
    }
  ]
}
```

---

### 4. Service Manager (Coming Soon)

**Purpose**: Manage external service integrations (Stripe, SendGrid, AWS, etc.).

**Features** (Planned):
- Store API credentials securely (encrypted)
- Test service connections
- Configure webhook URLs
- Manage API key rotation
- Monitor service health

---

### 5. Endpoint Explorer (Coming Soon)

**Purpose**: Interactive API testing interface.

**Features** (Planned):
- Browse all endpoints
- Build and send test requests
- View formatted responses
- Save request templates
- Authentication testing
- WebSocket testing

---

## 🔧 REST API

The Backend Admin service also provides a REST API for programmatic access.

### Authentication

Use API keys created in the admin interface:

```bash
# All requests require authentication
Authorization: Bearer csk_your_api_key_here
```

### Endpoints

#### List API Keys
```bash
GET http://localhost:5001/api/management/keys/

# Response:
[
  {
    "id": 1,
    "name": "Mobile App",
    "key_prefix": "csk_a3f9",
    "status": "active",
    "rate_limit": 1000,
    "total_requests": 5234,
    "created_at": "2025-10-15T13:00:00Z"
  }
]
```

#### Create API Key
```bash
POST http://localhost:5001/api/management/keys/create/
Content-Type: application/json

{
  "name": "New Integration",
  "rate_limit": 2000,
  "allowed_endpoints": ["/api/users/*"]
}

# Response:
{
  "api_key": "csk_b4g8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5",
  "message": "Save this API key securely - it won't be shown again",
  "key_id": 2
}
```

#### List Endpoints
```bash
GET http://localhost:5001/api/management/endpoints/

# Response:
[
  {
    "id": 1,
    "path": "/api/auth/login",
    "method": "POST",
    "name": "User Login",
    "category": "auth",
    "is_active": true,
    "rate_limit": 100
  }
]
```

#### Usage Statistics
```bash
GET http://localhost:5001/api/management/usage/

# Optional query parameters:
?api_key=1              # Filter by API key ID
&endpoint=2             # Filter by endpoint ID
&start_date=2025-10-01  # Start date
&end_date=2025-10-15    # End date
```

---

## 📊 ML Service Admin (Port 8000)

### Current Features

The ML Service already has Django admin installed. Access at:
```
http://localhost:8000/admin
```

### Planned Enhancements

1. **ML Model Management**
   - View trained models
   - Model versioning
   - Performance metrics
   - Training status

2. **Embedding Management**
   - Browse embeddings
   - View vector dimensions
   - Search similar embeddings
   - Batch operations

3. **Qdrant Collection Management**
   - List collections
   - View collection stats
   - Optimize collections
   - Manage points

4. **Dataset Management**
   - Upload datasets
   - View dataset metadata
   - Training/testing splits
   - Data quality checks

---

## 🔒 Security Features

### API Key Security
- **SHA-256 Hashing**: Keys are hashed before storage
- **Prefix Display**: Only first 8 characters shown in admin
- **One-Time Display**: Full key shown only once during creation
- **Revocation**: Keys can be instantly revoked
- **Expiration**: Optional expiration dates

### Rate Limiting
- Per-key rate limits
- Per-endpoint rate limits
- Hourly/daily limits
- Automatic blocking of excessive requests

### Access Control
- Endpoint-level permissions
- Pattern-based access control (e.g., `/api/admin/*` restricted)
- IP-based restrictions (planned)

### Audit Logging
- All API requests logged
- Response times tracked
- Error tracking
- IP address logging

---

## 🛠️ Administration Tasks

### Change Admin Password

```bash
docker-compose exec backend-admin python manage.py changepassword admin
```

### Create Additional Admin Users

```bash
docker-compose exec backend-admin python manage.py createsuperuser
```

### View Database Tables

```bash
docker-compose exec backend-admin python manage.py dbshell
```

```sql
-- List all API keys
SELECT id, name, key_prefix, status, total_requests FROM api_keys;

-- View usage statistics
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as requests,
  AVG(response_time_ms) as avg_response_time
FROM api_usage_logs
GROUP BY DATE(timestamp)
ORDER BY date DESC
LIMIT 7;

-- Top endpoints
SELECT 
  path,
  method,
  COUNT(*) as requests
FROM api_usage_logs
GROUP BY path, method
ORDER BY requests DESC
LIMIT 10;
```

### Export Usage Data

```bash
# Export last 30 days of usage logs
docker-compose exec backend-admin python manage.py dumpdata api_management.APIUsageLog --indent 2 > usage_logs.json
```

### Backup Database

```bash
# Backup PostgreSQL database
docker-compose exec postgres-ml pg_dump -U mluser cosmic_ml > backup_$(date +%Y%m%d).sql
```

---

## 🐛 Troubleshooting

### Admin Interface Not Loading

```bash
# Check container status
docker-compose ps backend-admin

# View logs
docker-compose logs backend-admin --tail 50

# Restart service
docker-compose restart backend-admin
```

### Migrations Not Applied

```bash
# Create migrations
docker-compose exec backend-admin python manage.py makemigrations

# Apply migrations
docker-compose exec backend-admin python manage.py migrate

# Check migration status
docker-compose exec backend-admin python manage.py showmigrations
```

### Static Files Not Loading

```bash
# Collect static files
docker-compose exec backend-admin python manage.py collectstatic --noinput

# Check static files location
docker-compose exec backend-admin ls -la /app/staticfiles/
```

### Can't Login to Admin

```bash
# Reset admin password
docker-compose exec backend-admin python manage.py changepassword admin

# Or create new superuser
docker-compose exec backend-admin python manage.py createsuperuser
```

---

## 📚 API Documentation

### Swagger UI

Interactive API documentation available at:
```
http://localhost:5001/swagger/
```

Features:
- Browse all endpoints
- Try API calls directly from browser
- View request/response schemas
- Authentication testing
- Example requests/responses

### ReDoc

Alternative documentation format:
```
http://localhost:5001/redoc/
```

---

## 🔄 Development Workflow

### Making Changes

1. **Edit Models**:
   ```bash
   # Edit backend-admin/api_management/models.py
   
   # Create migration
   docker-compose exec backend-admin python manage.py makemigrations
   
   # Apply migration
   docker-compose exec backend-admin python manage.py migrate
   ```

2. **Update Admin Interface**:
   ```bash
   # Edit backend-admin/api_management/admin.py
   
   # Restart service
   docker-compose restart backend-admin
   ```

3. **Add REST API Endpoints**:
   ```bash
   # Edit backend-admin/api_management/views.py
   # Edit backend-admin/api_management/urls.py
   
   # Restart service
   docker-compose restart backend-admin
   ```

### Testing

```bash
# Run Django tests
docker-compose exec backend-admin python manage.py test

# Run with coverage
docker-compose exec backend-admin coverage run --source='.' manage.py test
docker-compose exec backend-admin coverage report
```

---

## 🎨 Customization

### Adding Custom Admin Actions

```python
# In backend-admin/api_management/admin.py

@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    actions = ['revoke_keys', 'extend_expiration']
    
    def revoke_keys(self, request, queryset):
        queryset.update(status='revoked')
        self.message_user(request, f"{queryset.count()} keys revoked")
    revoke_keys.short_description = "Revoke selected keys"
```

### Adding Custom Views

```python
# In backend-admin/api_management/views.py

class CustomStatsView(APIView):
    def get(self, request):
        # Your custom logic
        return Response({"custom": "data"})

# In backend-admin/api_management/urls.py
urlpatterns = [
    path('custom-stats/', views.CustomStatsView.as_view()),
]
```

---

## 📈 Monitoring

### Health Checks

```bash
# Backend Admin health
curl http://localhost:5001/admin/login/

# Check response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5001/admin/
```

### Logs

```bash
# Real-time logs
docker-compose logs -f backend-admin

# Search logs
docker-compose logs backend-admin | grep ERROR

# Export logs
docker-compose logs backend-admin > backend-admin.log
```

### Metrics

**Database Size**:
```sql
SELECT 
  pg_size_pretty(pg_database_size('cosmic_ml')) as size;
```

**Table Sizes**:
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🚀 Production Deployment

### Security Checklist

- [ ] Change default admin password
- [ ] Set strong `DJANGO_SECRET_KEY`
- [ ] Set `DJANGO_DEBUG=False`
- [ ] Configure allowed hosts
- [ ] Enable HTTPS
- [ ] Set up SSL certificates
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring/alerts
- [ ] Configure backups
- [ ] Review API key permissions
- [ ] Enable audit logging

### Environment Variables

```bash
# .env file for production
DJANGO_ADMIN_SECRET=your-super-secret-key-here-change-me
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=admin.yourdomain.com,api.yourdomain.com

POSTGRES_DB=cosmic_ml
POSTGRES_USER=mluser
POSTGRES_PASSWORD=strong-database-password

BACKEND_API_KEY=shared-secret-between-services

# Email notifications
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

---

## 📞 Support

### Common Issues

1. **403 Forbidden**: Check ALLOWED_HOSTS in settings
2. **500 Error**: Check logs for detailed error
3. **Database Connection Failed**: Verify PostgreSQL is running
4. **Static Files 404**: Run collectstatic command
5. **Migration Conflicts**: Run `python manage.py migrate --fake`

### Getting Help

- Check container logs: `docker-compose logs backend-admin`
- View Django errors: Check `/app/logs/backend_admin.log` inside container
- Database console: `docker-compose exec backend-admin python manage.py dbshell`
- Python shell: `docker-compose exec backend-admin python manage.py shell`

---

## 🎯 Next Steps

1. ✅ Backend Admin service deployed
2. ✅ API Key management working
3. ✅ Endpoint catalog ready
4. ✅ Usage logging implemented
5. ⏳ Implement Service Manager
6. ⏳ Implement Endpoint Explorer
7. ⏳ Enhance ML Service Admin
8. ⏳ Add monitoring/alerting
9. ⏳ Create automated tests
10. ⏳ Production deployment guide

---

## 📝 Notes

- **Default Port**: 5001 (Backend Admin), 8000 (ML Service)
- **Database**: Shared PostgreSQL (cosmic_ml)
- **Authentication**: Django session-based for admin, Bearer tokens for API
- **Rate Limiting**: Enforced per API key and per endpoint
- **Logging**: Rotating file logs + console output

---

**Last Updated**: October 15, 2025
**Version**: 1.0.0
**Status**: ✅ Deployed and Operational
