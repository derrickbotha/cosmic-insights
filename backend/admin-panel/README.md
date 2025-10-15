# Backend API & ML Service Admin Panel Installation

This Django admin panel provides comprehensive management interfaces for:
- **Backend API (Port 5000)**: User management, API keys, service connections
- **ML Service (Port 8000)**: Model management, embeddings, vector operations  
- **API Explorer**: Interactive endpoint testing with Swagger UI
- **Service Manager**: Secure third-party integrations

## Features

### 🔑 API Management
- Generate, rotate, and revoke API keys
- Rate limiting configuration
- IP whitelisting
- Endpoint access control
- Real-time usage analytics
- API call logging

### 🔌 Service Integrations
- Secure credential storage (encrypted)
- Third-party API management
- Webhook event handling
- Health monitoring
- Connection testing

### 📊 API Explorer
- Interactive Swagger UI
- Test all endpoints
- View request/response examples
- Authentication testing
- Real-time API documentation

### 👥 User Management
- View all registered users
- Manage roles and permissions
- View user activity
- Session management

## Installation

### 1. Install Python Dependencies

```bash
cd backend/admin-panel
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `.env` file in `backend/admin-panel/`:

```env
# Django Settings
DJANGO_SECRET_KEY=your-super-secret-key-change-this
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Uses PostgreSQL)
ADMIN_DB_NAME=cosmic_admin
ADMIN_DB_USER=postgres
ADMIN_DB_PASSWORD=cosmicpassword123
ADMIN_DB_HOST=localhost
ADMIN_DB_PORT=5432

# Backend Services
BACKEND_API_URL=http://localhost:5000
ML_SERVICE_URL=http://localhost:8000

# MongoDB (Read-only access to main app data)
MONGODB_URI=mongodb://localhost:27017/cosmic-insights

# Redis
REDIS_URL=redis://localhost:6379/0

# Encryption (Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
ENCRYPTION_KEY=your-encryption-key-here
```

### 3. Initialize Database

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Load Sample Data (Optional)

```bash
# Load sample endpoints and services
python manage.py loaddata fixtures/sample_data.json
```

### 5. Start the Admin Panel

```bash
# Development server (Port 8001)
python manage.py runserver 8001

# Production server
gunicorn admin_panel.wsgi:application --bind 0.0.0.0:8001
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Admin Dashboard** | http://localhost:8001/admin/ | Django admin interface |
| **API Docs** | http://localhost:8001/ | Swagger UI documentation |
| **API Explorer** | http://localhost:8001/api/docs/ | Interactive API testing |
| **ReDoc** | http://localhost:8001/api/redoc/ | Alternative API docs |

## Usage

### Managing API Keys

1. Navigate to **Admin** → **API Management** → **API Keys**
2. Click **Add API Key**
3. Fill in details:
   - Name: Descriptive name (e.g., "Mobile App - Production")
   - Key Type: Read Only / Read & Write / Admin
   - Rate Limit: Requests per hour
   - Allowed Endpoints: Comma-separated list (e.g., `/api/users,/api/ml`)
   - Allowed IPs: Comma-separated IPs (optional)
   - Expires At: Expiration date (optional)
4. **Save** - The full API key will be displayed ONCE
5. Copy and securely store the API key

### Adding Service Integrations

1. Navigate to **Admin** → **Service Manager** → **Service Integrations**
2. Click **Add Service Integration**
3. Configure:
   - Name: Service name (e.g., "Stripe Payment Gateway")
   - Service Type: Select category
   - Provider: Provider name (e.g., "Stripe")
   - API URL: Base URL for the service
   - Status: Active/Inactive/Testing
   - API Key & Secret: Entered securely and encrypted
   - Configuration JSON: Additional parameters
   - Webhook URL: For incoming webhooks
4. **Save**
5. Click **Test Connection** to verify

### Viewing API Logs

1. Navigate to **Admin** → **API Management** → **API Logs**
2. Filter by:
   - Date range
   - HTTP method
   - Response status
   - API key
   - Endpoint
3. Click on any log entry to view:
   - Request headers and body
   - Response details
   - Response time
   - IP address and user agent

### Managing Webhooks

1. Navigate to **Admin** → **Service Manager** → **Webhook Events**
2. View incoming webhook events
3. Filter by:
   - Service
   - Event type
   - Processing status
   - Signature validation
4. Click **View Details** to see full payload

## API Testing with Swagger

1. Open http://localhost:8001/
2. Explore all available endpoints
3. Click **Authorize** and enter API key
4. Select an endpoint
5. Click **Try it out**
6. Fill in parameters
7. Click **Execute**
8. View response

## Security Best Practices

### 1. Encryption
- All API keys and secrets are encrypted using Fernet encryption
- Generate a strong encryption key:
  ```bash
  python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
  ```
- Store `ENCRYPTION_KEY` securely (never commit to git)

### 2. Database Access
- Use strong passwords for PostgreSQL
- Limit database access to localhost in production
- Enable SSL for database connections

### 3. API Keys
- Set expiration dates for all API keys
- Implement IP whitelisting for sensitive operations
- Use rate limiting to prevent abuse
- Rotate keys regularly

### 4. Production Settings
- Set `DEBUG=False`
- Use HTTPS only (`SECURE_SSL_REDIRECT=True`)
- Set secure cookies (`SESSION_COOKIE_SECURE=True`)
- Configure proper `ALLOWED_HOSTS`

## Monitoring

### API Analytics

View real-time statistics:
- Total API calls
- Success/error rates
- Average response times
- Most used endpoints
- Top API key users

### Service Health

Monitor third-party services:
- Connection status
- Last health check
- Error messages
- Response times
- Success rates

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql -h localhost -U postgres -d cosmic_admin
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Migration Issues
```bash
# Reset migrations (CAUTION: Deletes data)
python manage.py migrate admin_panel zero
python manage.py makemigrations
python manage.py migrate
```

### Permission Denied
```bash
# On Windows
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Fixtures
```bash
python manage.py dumpdata api_management --indent 2 > fixtures/api_management.json
```

### Collecting Static Files
```bash
python manage.py collectstatic --no-input
```

## Support

For issues or questions:
- Check logs: `backend/admin-panel/logs/`
- Review Django admin audit logs
- Check API logs in admin panel
- View webhook events for integration issues

## License

Proprietary - Cosmic Insights © 2025
