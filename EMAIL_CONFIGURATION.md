# Email Configuration Updated

## ✅ Changes Applied

Updated the email service configuration to use **port 3000** (frontend) as the default for all email links.

## 🔧 What Was Changed

### File: `backend/src/config/email.js`

**Added Constants:**
```javascript
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const APP_NAME = process.env.APP_NAME || 'Cosmic Insights';
```

**Updated All Email Templates:**
1. **Verification Email** - Links now point to `http://localhost:3000/verify-email?token=...`
2. **Password Reset Email** - Links now point to `http://localhost:3000/reset-password?token=...`
3. **Welcome Email** - Dashboard link now points to `http://localhost:3000/dashboard`

## 📧 Email Links Configuration

All email templates now correctly reference:
- **Frontend URL**: `http://localhost:3000` (default)
- **App Name**: `Cosmic Insights` (default)

### Before:
- Used `process.env.CLIENT_URL` without default
- Used `process.env.APP_NAME` inline with fallback each time

### After:
- Defined constants at the top of the file
- Default `CLIENT_URL` = `http://localhost:3000`
- Default `APP_NAME` = `Cosmic Insights`
- Cleaner, more maintainable code

## 🌐 Environment Variables

You can still override these defaults with environment variables:

```bash
# In .env or docker-compose.yml
CLIENT_URL=http://localhost:3000          # Frontend URL
APP_NAME=Cosmic Insights                  # Application name
EMAIL_HOST=smtp.gmail.com                 # SMTP server
EMAIL_PORT=587                            # SMTP port
EMAIL_USER=your-gmail@gmail.com           # Sender email
EMAIL_PASSWORD=your-app-password          # Gmail app password
```

## 📨 Email Templates

### 1. Verification Email
- **Link**: `{CLIENT_URL}/verify-email?token={token}`
- **Expiry**: 24 hours
- **Purpose**: Verify user email address after registration

### 2. Password Reset Email
- **Link**: `{CLIENT_URL}/reset-password?token={token}`
- **Expiry**: 1 hour
- **Purpose**: Allow users to reset forgotten passwords

### 3. Welcome Email
- **Dashboard Link**: `{CLIENT_URL}/dashboard`
- **Sent**: After successful email verification
- **Purpose**: Welcome new users and guide them to start using the app

## 🚀 Deployment Status

- ✅ Email configuration updated
- ✅ Default CLIENT_URL set to `http://localhost:3000`
- ✅ All email templates updated
- ✅ Backend container restarted
- ✅ Backend health check passed

## 🧪 Testing

To test the email links:

1. **Register a new user** (if EMAIL_USER and EMAIL_PASSWORD are configured):
   ```bash
   POST http://localhost:5000/api/auth/register
   {
     "email": "test@example.com",
     "password": "TestPass123",
     "name": "Test User"
   }
   ```

2. **Check your email** for the verification link

3. **Verify the link format**:
   ```
   http://localhost:3000/verify-email?token=abc123...
   ```

## 📝 Notes

- Email functionality requires Gmail SMTP credentials to be configured
- If credentials are not set, registration still works but emails won't send
- The app will log email errors without crashing
- Frontend runs on port 3000 (default React dev server)
- Backend API runs on port 5000

## 🔗 Related Files

- `backend/src/config/email.js` - Email service configuration
- `backend/src/controllers/authController.js` - Auth endpoints using email service
- `USER_PROFILE_IMPLEMENTATION.md` - Full user profile system documentation

---

**Updated**: October 12, 2025  
**Status**: ✅ Active  
**Default Client URL**: http://localhost:3000
