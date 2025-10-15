# 📧 Gmail SMTP Configuration Guide

**Purpose**: Enable email verification and notifications  
**Status**: ⚠️ Configuration Required  
**Time**: 5-10 minutes

---

## 🚀 Quick Setup

### Step 1: Enable Gmail App Password

1. **Go to Google Account Settings**:
   - Visit: https://myaccount.google.com/security
   - Or search "Google Account Security" in Google

2. **Enable 2-Step Verification** (if not already enabled):
   - Click "2-Step Verification"
   - Follow the prompts to enable it
   - ⚠️ Required for app passwords

3. **Generate App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - OR: Google Account → Security → 2-Step Verification → App passwords
   - Select app: "Mail"
   - Select device: "Other" → Enter: "Cosmic Insights"
   - Click "Generate"
   - **Copy the 16-character password** (you won't see it again!)

### Step 2: Update Backend .env File

1. **Open**: `backend/.env`

2. **Find these commented lines**:
```env
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=
# EMAIL_PASSWORD=
```

3. **Uncomment and fill in**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**Example**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=cosmicinsights@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

4. **Save the file**

### Step 3: Restart Backend

```bash
docker-compose restart backend
```

Wait 5-10 seconds for backend to restart.

### Step 4: Test Email Sending

Register a new user and check if you receive the verification email!

---

## ✅ Verification

### Test Registration:
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in the form with a **real email address** (one you can access)
4. Submit the form
5. Check your email inbox (and spam folder)
6. You should receive: "Verify Your Email Address" email

### Check Backend Logs:
```bash
docker-compose logs backend --tail=20 | Select-String "email"
```

**Expected output**:
```
Verification email sent to user@example.com: <message-id>
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use App Password (not your actual Gmail password)
- Keep .env file out of version control (.gitignore)
- Use different email for production
- Enable 2-Step Verification on Gmail
- Rotate app passwords periodically

### ❌ DON'T:
- Commit .env file to git
- Share your app password
- Use your personal email password
- Disable 2-Step Verification after creating app password

---

## 🐛 Troubleshooting

### Issue: "Invalid login" or "Username and Password not accepted"

**Solution**:
1. Make sure 2-Step Verification is enabled
2. Use App Password (not regular password)
3. Remove spaces from app password
4. Check EMAIL_USER is correct email address

### Issue: "Connection timeout" or "ECONNREFUSED"

**Solution**:
1. Check EMAIL_PORT=587 (not 465)
2. Check EMAIL_SECURE=false
3. Check internet connection
4. Try EMAIL_PORT=465 with EMAIL_SECURE=true

### Issue: "No email received"

**Solutions**:
1. **Check spam folder** (most common)
2. Check backend logs for errors:
   ```bash
   docker-compose logs backend --tail=50 | Select-String "email"
   ```
3. Verify EMAIL_USER and EMAIL_PASSWORD are correct
4. Test with a different email provider

### Issue: Backend logs show "Error sending verification email"

**Check**:
1. Gmail app password is correct
2. No typos in EMAIL_USER
3. Backend has internet access
4. Gmail account is active

---

## 📧 Email Templates

Three email templates are configured:

### 1. **Verification Email** (sent on registration)
- Subject: "Verify Your Email Address"
- Contains: Verification link
- Expires: 24 hours

### 2. **Welcome Email** (sent after verification)
- Subject: "Welcome to Cosmic Insights! 🌟"
- Contains: Getting started guide
- Links to dashboard

### 3. **Password Reset Email**
- Subject: "Reset Your Password"
- Contains: Password reset link
- Expires: 1 hour

---

## 🎨 Email Design

All emails include:
- ✅ Responsive HTML design
- ✅ Dark/light compatible
- ✅ Professional branding
- ✅ Clear call-to-action buttons
- ✅ Fallback text links
- ✅ Security warnings

---

## 🔄 Alternative Email Providers

### Using SendGrid:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### Using Mailgun:
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-smtp-password
```

### Using Outlook/Office365:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

---

## 📊 Email Configuration Status

### Current Configuration:
- ✅ Email service code: Implemented
- ✅ Email templates: Created (3 templates)
- ✅ Verification flow: Complete
- ⚠️ SMTP credentials: **NOT CONFIGURED**
- ⚠️ Backend .env: **Needs update**

### What Happens Without Configuration:
- ✅ Registration still works
- ✅ User account created
- ❌ No email sent
- ⚠️ Users can't verify email
- ⚠️ Users can't login (email verification required)

---

## 🎯 Production Recommendations

### For Production Deploy:

1. **Use Professional Email Service**:
   - SendGrid (12,000 free emails/month)
   - Mailgun (5,000 free emails/month)
   - AWS SES (62,000 free emails/month)

2. **Configure Custom Domain**:
   - Use your domain: noreply@yourdomain.com
   - Better deliverability
   - More professional

3. **Set Up Email Monitoring**:
   - Track delivery rates
   - Monitor bounce rates
   - Check spam complaints

4. **Enable Email Logging**:
   - Already implemented in code
   - Check logs regularly
   - Set up alerts for failures

---

## 🚀 Quick Start Commands

### 1. Check Current Configuration:
```bash
docker-compose exec backend cat .env | Select-String "EMAIL"
```

### 2. Test Email Sending (after configuration):
Register a new user at http://localhost:3000

### 3. View Email Logs:
```bash
docker-compose logs backend --tail=100 | Select-String "email"
```

### 4. Restart Backend:
```bash
docker-compose restart backend
```

### 5. Check Backend Health:
```bash
curl http://localhost:5000/health
```

---

## ✅ Configuration Checklist

### Before Testing:
- [ ] Gmail 2-Step Verification enabled
- [ ] App Password generated
- [ ] backend/.env file updated
- [ ] EMAIL_USER configured
- [ ] EMAIL_PASSWORD configured
- [ ] Backend restarted
- [ ] Backend health check passed

### Testing:
- [ ] Registration form tested
- [ ] Email received in inbox
- [ ] Verification link works
- [ ] Backend logs show success
- [ ] No errors in console

---

## 📞 Need Help?

### If emails aren't working:

1. **Check Backend Logs**:
   ```bash
   docker-compose logs backend --tail=50
   ```

2. **Verify Configuration**:
   ```bash
   docker-compose exec backend node -e "console.log(process.env.EMAIL_USER, process.env.EMAIL_HOST)"
   ```

3. **Test SMTP Connection**:
   Create test script (optional) or use backend logs

4. **Common Issues**:
   - Wrong app password → Regenerate
   - 2-Step not enabled → Enable it
   - Typo in email → Double check
   - Port blocked → Try different port

---

## 🎉 Success Indicators

### You'll know it's working when:
- ✅ User registers successfully
- ✅ Email arrives within 1-2 minutes
- ✅ Email has verification link
- ✅ Link redirects to verification page
- ✅ Backend logs show "Verification email sent"
- ✅ No errors in backend logs

---

**Configuration Time**: 5-10 minutes  
**Difficulty**: Easy  
**Required**: For email verification to work  
**Optional**: For development (not for production)

**Next Steps**: 
1. Generate Gmail App Password
2. Update backend/.env
3. Restart backend
4. Test registration!

---

**Last Updated**: January 2025  
**Status**: Ready for configuration  
**Documentation**: Complete
