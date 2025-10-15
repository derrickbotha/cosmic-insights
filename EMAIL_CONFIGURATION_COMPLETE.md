# Email System Configuration - Complete Guide

This document summarizes all three email configurations and helps you choose the right one for your needs.

## 📋 Quick Decision Guide

```
┌─────────────────────────────────────────────────────────────┐
│                   CHOOSE YOUR EMAIL SOLUTION                │
└─────────────────────────────────────────────────────────────┘

Are you in development/testing?
├─ YES → Use Mailpit (docker-compose.mailpit.yml)
│        ✅ Ready in 5 minutes
│        ✅ See emails in web UI
│        ✅ No configuration needed
│
└─ NO → Going to production?
         │
         ├─ Need < 500 emails/day?
         │  └─ Use Gmail SMTP (GMAIL_SMTP_SETUP.md)
         │     ✅ Ready in 5 minutes
         │     ✅ Google's reputation
         │     ✅ High deliverability
         │
         └─ Need 500+ emails/day OR own domain?
            └─ Use Postal (docker-compose.postal.yml)
               ✅ Unlimited emails
               ✅ Full control
               ✅ Professional setup
               ⚠️ Requires domain + DNS
```

---

## 🎯 Solution Comparison

| Feature | Mailpit | Gmail SMTP | Postal |
|---------|---------|------------|--------|
| **Setup Time** | 5 minutes | 10 minutes | 2-4 hours |
| **Cost** | Free | Free (500/day) | $50-250/month |
| **Email Limit** | Unlimited* | 500/day | Unlimited |
| **Real Emails** | ❌ No | ✅ Yes | ✅ Yes |
| **Web UI** | ✅ Yes | ❌ No | ✅ Yes |
| **Domain Required** | ❌ No | ❌ No | ✅ Yes |
| **DNS Setup** | ❌ No | ❌ No | ✅ Yes (SPF, DKIM, DMARC) |
| **Deliverability** | N/A | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ (with setup) |
| **Analytics** | Basic | None | Advanced |
| **Webhooks** | ❌ No | ❌ No | ✅ Yes |
| **Bounce Handling** | ❌ No | Manual | ✅ Automatic |
| **Best For** | Development | Quick Production | Production at Scale |

*Mailpit captures emails locally, doesn't send them

---

## 🚀 Configuration 1: Mailpit (Development)

### When to Use
- ✅ Local development
- ✅ Testing registration flow
- ✅ UI testing
- ✅ No real emails needed
- ✅ Quick setup

### Files Involved
- `docker-compose.mailpit.yml` - Main configuration
- `.env.mailpit` - Environment variables (create this)

### Quick Start

**1. Create environment file**:
```bash
# Create .env.mailpit
echo "EMAIL_HOST=mailpit
EMAIL_PORT=1025
EMAIL_SECURE=false
EMAIL_USER=cosmicinsights@localhost
EMAIL_PASSWORD=changeme123
EMAIL_FROM_NAME=Cosmic Insights
CLIENT_URL=http://localhost:3000" > .env.mailpit
```

**2. Start services**:
```powershell
# Start all services with Mailpit
docker-compose -f docker-compose.mailpit.yml up -d

# Check status
docker-compose -f docker-compose.mailpit.yml ps

# View logs
docker-compose -f docker-compose.mailpit.yml logs -f mailpit
```

**3. Access web UI**:
```
Open browser: http://localhost:8025
```

**4. Test email**:
```powershell
# Register new user at http://localhost:3000
# Check Mailpit UI for verification email
# Click verification link
# Check for welcome email
```

### Configuration Details

**Mailpit Service**:
- **SMTP**: localhost:1025
- **Web UI**: http://localhost:8025
- **Storage**: In-memory (clears on restart)
- **Max Messages**: 500
- **Authentication**: Any username/password accepted

**Backend Configuration**:
```javascript
// backend/src/config/email.js (already configured)
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,      // 'mailpit'
  port: process.env.EMAIL_PORT,       // 1025
  secure: false,                      // No TLS needed
  auth: {
    user: process.env.EMAIL_USER,     // 'cosmicinsights@localhost'
    pass: process.env.EMAIL_PASSWORD  // 'changeme123'
  }
});
```

### Stopping Mailpit

```powershell
# Stop all services
docker-compose -f docker-compose.mailpit.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.mailpit.yml down -v
```

---

## 📧 Configuration 2: Gmail SMTP (Quick Production)

### When to Use
- ✅ Need real emails NOW
- ✅ < 500 emails per day
- ✅ Don't have domain yet
- ✅ Testing production flow
- ✅ Simple setup

### Files Involved
- `GMAIL_SMTP_SETUP.md` - Complete setup guide
- `backend/.env` - Add Gmail credentials

### Quick Start

**1. Get Gmail App Password**:
```
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Google account
3. App name: "Cosmic Insights"
4. Generate
5. Copy the 16-character password
```

**2. Update backend/.env**:
```env
# Email Configuration - Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=Cosmic Insights
CLIENT_URL=http://localhost:3000
```

**3. Restart backend**:
```powershell
docker-compose restart backend
```

**4. Test**:
```powershell
# Register new user
# Check your actual email inbox
# Verify registration
```

### Limitations
- ⚠️ 500 emails per day (free)
- ⚠️ 2000 emails per day (Google Workspace - $6/user/month)
- ⚠️ "Sent via Gmail" warning in some email clients
- ⚠️ Less control over branding

### Alternatives
All follow same pattern, just different credentials:

**SendGrid** (100 emails/day free):
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

**Mailgun** (5000 emails/month free):
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your_mailgun_smtp_password
```

**AWS SES** (62,000 emails/month free):
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_aws_ses_smtp_username
EMAIL_PASSWORD=your_aws_ses_smtp_password
```

---

## 🏢 Configuration 3: Postal (Production Self-Hosted)

### When to Use
- ✅ Own a domain
- ✅ Need 10,000+ emails/month
- ✅ Want full control
- ✅ Professional setup
- ✅ GCP deployment

### Files Involved
- `docker-compose.postal.yml` - Production configuration
- `POSTAL_GCP_DEPLOYMENT.md` - Complete deployment guide
- `.env.production` - Production environment variables

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Postal Email Server                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐           │
│  │ MariaDB  │   │ RabbitMQ │   │  Postal  │           │
│  │  (DB)    │───│  (Queue) │───│  (SMTP)  │           │
│  └──────────┘   └──────────┘   └──────────┘           │
│                                      │                   │
│                                      ↓                   │
│  ┌──────────────────────────────────────────┐          │
│  │         Cosmic Insights Backend          │          │
│  │  (Sends emails via Postal API/SMTP)      │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
└──────────────────────────────────────────────────────────┘
                         ↓
              ┌──────────────────┐
              │  Internet Users  │
              │  (Gmail, etc.)   │
              └──────────────────┘
```

### Prerequisites
- ✅ Google Cloud Platform account
- ✅ Domain name (e.g., yourdomain.com)
- ✅ DNS access
- ✅ Credit card for GCP billing

### Setup Overview

**Phase 1: GCP Setup** (1 hour):
1. Create GCP project
2. Create VM instance (e2-medium or larger)
3. Reserve static IP
4. Configure firewall rules
5. Set up Cloud DNS

**Phase 2: Postal Installation** (1-2 hours):
1. SSH into server
2. Install Docker & Docker Compose
3. Clone repository
4. Configure .env.production
5. Start Postal services
6. Access Postal web UI
7. Create organization & mail server

**Phase 3: DNS Configuration** (30 minutes - 24 hours for propagation):
1. Add A record (mail.yourdomain.com → Server IP)
2. Add MX record (yourdomain.com → mail.yourdomain.com)
3. Add SPF record (authorize server to send)
4. Add DKIM record (email authentication)
5. Add DMARC record (policy for failures)
6. Set PTR/reverse DNS (GCP support)

**Phase 4: SSL Setup** (30 minutes):
1. Install Certbot
2. Generate Let's Encrypt certificates
3. Configure Nginx
4. Test HTTPS access

**Phase 5: Testing** (1 hour):
1. Send test email
2. Check mail-tester.com score (target 8+/10)
3. Test registration flow
4. Verify all emails working

### Costs Estimate

**Small Setup** (1-1000 emails/day):
- VM (e2-medium): ~$35/month
- Disk (50GB): ~$8/month
- Static IP: ~$7/month
- **Total: ~$50/month**

**Medium Setup** (1000-10000 emails/day):
- VM (e2-standard-4): ~$120/month
- Disk (200GB): ~$32/month
- Static IP: ~$7/month
- Load Balancer: ~$18/month
- **Total: ~$177/month**

**Large Setup** (10000+ emails/day):
- VM (n2-standard-8): ~$280/month
- Disk (500GB): ~$80/month
- Static IP: ~$7/month
- Load Balancer: ~$18/month
- Monitoring: ~$15/month
- **Total: ~$400/month**

### Quick Commands

```bash
# Start Postal
docker-compose -f docker-compose.postal.yml up -d

# Stop Postal
docker-compose -f docker-compose.postal.yml down

# View logs
docker-compose -f docker-compose.postal.yml logs -f postal

# Restart after config change
docker-compose -f docker-compose.postal.yml restart backend

# Check status
docker-compose -f docker-compose.postal.yml ps

# Access Postal UI
# http://YOUR_SERVER_IP:5000
```

---

## 🔄 Migration Path

### Development → Production

**Step 1: Start with Mailpit**
```powershell
# Use Mailpit for all development
docker-compose -f docker-compose.mailpit.yml up -d

# Test registration, verification, password reset
# Iterate on email templates
# Perfect the user flow
```

**Step 2: Test with Gmail SMTP**
```powershell
# When ready for real emails, switch to Gmail
# Update backend/.env with Gmail credentials
docker-compose restart backend

# Test with real email addresses
# Verify deliverability
# Check spam folder placement
```

**Step 3: Deploy Postal**
```bash
# When scaling up, deploy Postal to GCP
# Follow POSTAL_GCP_DEPLOYMENT.md guide
# Configure DNS records
# Warm up IP address (gradually increase volume)
```

### IP Warmup Schedule (Postal)

To avoid spam filters, gradually increase email volume:

| Day | Emails | Notes |
|-----|--------|-------|
| 1 | 50 | Send to engaged users only |
| 2 | 100 | |
| 3 | 200 | |
| 4 | 400 | Monitor bounce rate |
| 5 | 800 | |
| 6-7 | 1,500 | Check spam reports |
| 8-10 | 3,000 | |
| 11-14 | 6,000 | |
| 15+ | Unlimited | Maintain good practices |

**Best Practices During Warmup**:
- Send to most engaged users first
- Monitor bounce rate (keep < 2%)
- Check spam reports immediately
- Gradually increase volume 2x every 2-3 days
- Use mail-tester.com regularly

---

## 📊 Monitoring & Analytics

### Mailpit (Development)
- Web UI: http://localhost:8025
- Shows all captured emails
- Search and filter
- View HTML/text versions
- Check headers

### Gmail SMTP (Production)
- No built-in analytics
- Use Google Analytics for tracking
- Monitor backend logs for send errors
- Track verification rates in database

### Postal (Production)
- Postal Web UI: http://YOUR_SERVER_IP:5000
- **Dashboard**: Real-time stats
- **Queues**: Current sending status
- **Messages**: Search sent emails
- **Deliveries**: Delivery attempts
- **Bounces**: Automatic handling
- **Spam Complaints**: Immediate alerts
- **Webhooks**: Integrate with your app

**Metrics to Monitor**:
```
✅ Delivery Rate (target: >95%)
✅ Bounce Rate (target: <2%)
✅ Spam Complaint Rate (target: <0.1%)
✅ Open Rate (target: >20%)
✅ Click Rate (target: >3%)
✅ Verification Rate (target: >80%)
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Emails not sending**

**Mailpit**:
```powershell
# Check Mailpit is running
docker-compose -f docker-compose.mailpit.yml ps

# Check logs
docker-compose -f docker-compose.mailpit.yml logs mailpit

# Restart
docker-compose -f docker-compose.mailpit.yml restart mailpit
```

**Gmail**:
```powershell
# Check credentials
docker-compose exec backend cat /app/.env | grep EMAIL

# Check logs
docker-compose logs backend | grep -i email

# Test SMTP connection
# Use test-smtp.js script (create if needed)
```

**Postal**:
```bash
# Check Postal logs
docker-compose -f docker-compose.postal.yml logs postal

# Check queue
# Visit Postal UI → Queues tab

# Check credentials
docker-compose -f docker-compose.postal.yml exec backend env | grep EMAIL
```

**2. Emails going to spam**

**Solutions**:
- ✅ Verify SPF record is correct
- ✅ Verify DKIM is configured
- ✅ Add DMARC policy
- ✅ Set up PTR/reverse DNS
- ✅ Use mail-tester.com to check score
- ✅ Avoid spam trigger words
- ✅ Include unsubscribe link
- ✅ Authenticate sender domain

**3. Verification links not working**

**Check**:
```javascript
// backend/src/config/email.js
// Verify CLIENT_URL is correct
console.log('CLIENT_URL:', process.env.CLIENT_URL);

// Should be:
// Development: http://localhost:3000
// Production: https://yourdomain.com
```

**4. High bounce rate**

**Causes**:
- Invalid email addresses
- Typos in addresses
- Temporary email services
- Spam traps

**Solutions**:
- Implement email validation on frontend
- Use email verification API (e.g., ZeroBounce)
- Monitor bounce webhooks (Postal)
- Remove bounced addresses immediately

---

## 🔒 Security Best Practices

### All Configurations

**1. Environment Variables**:
```bash
# Never commit .env files
echo ".env*" >> .gitignore

# Use strong passwords
openssl rand -hex 32

# Rotate credentials quarterly
```

**2. Rate Limiting**:
```javascript
// backend/src/middleware/rateLimit.js
// Already configured:
// - 5 registration attempts per 15 minutes per IP
// - 3 login attempts per 15 minutes per email
```

**3. Email Validation**:
```javascript
// Validate email format on frontend and backend
// Check for disposable email domains
// Implement CAPTCHA for registration
```

### Postal-Specific

**4. Firewall Rules**:
```bash
# Only allow necessary ports
# 25, 587 - SMTP (authenticated only)
# 443 - HTTPS (web UI via Nginx)
# Block port 5000 from internet (use Nginx proxy)
```

**5. DKIM & SPF**:
```
# Always configure DKIM for authentication
# Use strict SPF policy
v=spf1 a mx ip4:YOUR_IP -all
# -all = fail if not from authorized server
```

**6. Monitoring**:
```bash
# Set up alerts for:
# - High bounce rates (>5%)
# - Spam complaints (>0.5%)
# - Queue backlog (>1000 emails)
# - Failed deliveries (>10%)
```

---

## 📚 Additional Resources

### Documentation
- **Mailpit**: https://github.com/axllent/mailpit
- **Postal**: https://docs.postalserver.io/
- **Nodemailer**: https://nodemailer.com/
- **Email Standards**: https://www.rfc-editor.org/

### Testing Tools
- **Mail Tester**: https://www.mail-tester.com/
- **MXToolbox**: https://mxtoolbox.com/
- **DKIM Validator**: https://dkimvalidator.com/
- **SPF Record Check**: https://www.spfwizard.net/

### Email Deliverability
- **Gmail Postmaster**: https://postmaster.google.com/
- **Sender Score**: https://senderscore.org/
- **Email Blacklists**: https://multirbl.valli.org/

### Community
- **Email Geeks Slack**: https://email.geeks.chat/
- **Postal GitHub**: https://github.com/postalserver/postal
- **GCP Community**: https://www.googlecloudcommunity.com/

---

## ✅ Implementation Checklist

### Current Status

**✅ Completed**:
- [x] Email service implemented (backend/src/config/email.js)
- [x] 3 email templates created
- [x] Verification flow working
- [x] Success message with login link
- [x] Mailpit configuration ready
- [x] Gmail SMTP guide created
- [x] Postal configuration ready
- [x] GCP deployment guide created

**⏳ In Progress**:
- [ ] Choose production email solution
- [ ] Configure .env files
- [ ] Test email sending
- [ ] Commit all changes

**📋 TODO**:
- [ ] Deploy to GCP (if using Postal)
- [ ] Configure DNS records
- [ ] Set up monitoring
- [ ] Test deliverability
- [ ] Monitor verification rates

### Quick Start Checklist

**For Development (RIGHT NOW)**:
```powershell
# 1. Start Mailpit
docker-compose -f docker-compose.mailpit.yml up -d

# 2. Open Mailpit UI
start http://localhost:8025

# 3. Open app
start http://localhost:3000

# 4. Register test user

# 5. Check Mailpit for verification email

# 6. Click verification link

# 7. Check Mailpit for welcome email

# ✅ Done! All emails visible in Mailpit
```

**For Production (WHEN READY)**:
```
1. Choose email solution:
   - Gmail SMTP: Follow GMAIL_SMTP_SETUP.md
   - Postal: Follow POSTAL_GCP_DEPLOYMENT.md

2. Configure credentials

3. Test thoroughly

4. Monitor deliverability

5. Scale as needed
```

---

## 🎉 Summary

You now have **three complete email solutions**:

1. **Mailpit** (`docker-compose.mailpit.yml`):
   - ✅ For development
   - ✅ Ready to use NOW
   - ✅ 5-minute setup

2. **Gmail SMTP** (`GMAIL_SMTP_SETUP.md`):
   - ✅ For quick production
   - ✅ 10-minute setup
   - ✅ 500 emails/day

3. **Postal** (`docker-compose.postal.yml`, `POSTAL_GCP_DEPLOYMENT.md`):
   - ✅ For production at scale
   - ✅ Full deployment guide
   - ✅ Unlimited emails

**Recommendation**: Start with Mailpit today for development, then choose Gmail or Postal based on your production needs.

---

**Next Steps**: 
1. Start Mailpit and test email flow
2. Decide on production solution
3. Deploy when ready
4. Monitor and optimize

Good luck! 🚀
