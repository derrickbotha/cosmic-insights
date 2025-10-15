# AWS SES Setup Guide - Step by Step

## 🎯 What You'll Get

- ✅ 62,000 FREE emails per month (first 12 months with AWS Free Tier)
- ✅ $0.10 per 1,000 emails after free tier
- ✅ Enterprise-grade email delivery
- ✅ High deliverability rates
- ✅ Detailed analytics and monitoring

---

## 📋 Prerequisites

- Credit card (required for AWS account)
- Domain name (optional but highly recommended)
- 30-45 minutes for complete setup

---

## 🚀 STEP 1: Create AWS Account

### **1.1 Sign Up for AWS**

1. Go to: **https://aws.amazon.com/**
2. Click **"Create an AWS Account"** (top-right)
3. Enter your email address
4. Choose account name: "Cosmic Insights Production"
5. Click **Continue**

### **1.2 Complete Account Information**

1. **Contact Information:**
   - Account type: Choose "Personal" or "Business"
   - Full name
   - Phone number
   - Address

2. **Payment Information:**
   - Enter credit card details
   - AWS will charge $1 for verification (refunded)

3. **Identity Verification:**
   - Enter phone number
   - Receive verification code via SMS
   - Enter the code

4. **Select Support Plan:**
   - Choose **"Basic Support - Free"**
   - Click **Complete Sign Up**

### **1.3 Sign In to AWS Console**

1. Go to: **https://console.aws.amazon.com/**
2. Sign in with your credentials
3. You'll see the AWS Management Console

---

## 📧 STEP 2: Set Up Amazon SES

### **2.1 Open SES Console**

1. In AWS Console, search for **"SES"** in the top search bar
2. Click **"Amazon Simple Email Service"**
3. **IMPORTANT:** Select your region (top-right dropdown)
   - Recommended: **US East (N. Virginia)** - `us-east-1`
   - Or choose region closest to your users
   - **Remember this region!** You'll need it later

### **2.2 Verify Your Email Address**

**Note:** Start with email verification. You can add domain later.

1. In SES Console, click **"Verified identities"** (left sidebar)
2. Click **"Create identity"** button
3. Choose **"Email address"**
4. Enter your email: `your-email@gmail.com` (or any email you control)
5. Click **"Create identity"**

### **2.3 Verify the Email**

1. Check your inbox for email from: `no-reply-aws@amazon.com`
2. Subject: "Amazon Web Services – Email Address Verification Request"
3. Click the verification link
4. You'll see: "Congratulations! You've successfully verified..."
5. Go back to SES Console
6. Your email should show **"Verified"** status (green checkmark)

### **2.4 (Optional) Verify Your Domain**

**Why verify domain?**
- Professional sender address (noreply@yourdomain.com)
- Better deliverability
- No "via amazonses.com" in email headers

**Steps:**

1. Click **"Create identity"**
2. Choose **"Domain"**
3. Enter your domain: `yourdomain.com` (without www)
4. Check **"Use a custom MAIL FROM domain"** (optional)
5. Click **"Create identity"**

6. **Add DNS Records:**
   - AWS will show you DNS records to add
   - Copy each record (Name, Type, Value)
   - Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
   - Add these DNS records:
     - **3 CNAME records** (for DKIM)
     - **1 TXT record** (for SPF, if not exists)
     - **1 MX record** (if using custom MAIL FROM)

7. **Wait for Verification:**
   - Can take 5 minutes to 72 hours
   - Usually verified within 30 minutes
   - Refresh the page to check status

---

## 🔐 STEP 3: Request Production Access

**IMPORTANT:** By default, SES is in "Sandbox Mode" - you can ONLY send emails to verified addresses.

### **3.1 Check Current Status**

1. In SES Console, click **"Account dashboard"** (left sidebar)
2. Look for **"Account status"** section
3. If it says **"In the sandbox"** - you need to request production access

### **3.2 Request Production Access**

1. Scroll down to **"Sending statistics"** section
2. Click **"Request production access"** button (or **"Get set up"** link)

### **3.3 Fill Out the Form**

AWS will ask several questions:

**1. Use case details:**
```
Mail type: Transactional
Website URL: https://yourdomain.com (or http://localhost:4000 for now)

Use case description (be detailed!):
"We are building Cosmic Insights, a web application that provides 
personalized astrological insights and guidance. We need to send 
transactional emails to our users for:

1. Email verification when users register
2. Welcome emails after verification
3. Password reset requests
4. Important account notifications

We expect to send approximately 100-500 emails per day initially, 
growing to 1,000-2,000 per day as our user base grows. All emails 
are sent only to users who explicitly registered on our platform. 
We maintain strict opt-out policies and monitor bounce/complaint rates."
```

**2. Email sending details:**
```
How do you plan to handle bounces and complaints?
"We will:
- Monitor bounce and complaint rates daily via SES metrics
- Automatically remove hard bounces from our mailing list
- Investigate and address any complaints immediately
- Maintain bounce rate below 5% and complaint rate below 0.1%
- Implement email validation before adding addresses to our system"

How did you build or acquire your mailing list?
"Our mailing list consists entirely of users who registered on our 
web application. Each user provides their email address during 
registration and must verify it via a verification link. We do not 
purchase or acquire email lists from third parties. All recipients 
have explicitly opted in to receive emails from us."
```

**3. Compliance:**
- Check: "I acknowledge that I will only send to recipients who have 
  explicitly requested my mail"

### **3.4 Submit Request**

1. Click **"Submit request"**
2. You'll receive confirmation email
3. **Wait for approval:**
   - Usually approved within **24 hours**
   - Can take up to 48 hours
   - Check your email for approval notification

**While Waiting:**
- You can still test in sandbox mode (send to verified emails only)
- Continue with setup steps below

---

## 🔑 STEP 4: Create SMTP Credentials

### **4.1 Open IAM Console**

1. In AWS Console, search for **"IAM"**
2. Click **"IAM - Identity and Access Management"**

### **4.2 Create IAM User for SES**

1. Click **"Users"** (left sidebar)
2. Click **"Create user"** button
3. **User name:** `cosmic-insights-ses-smtp`
4. Check **"Provide user access to the AWS Management Console"** - **UNCHECK THIS**
5. Click **"Next"**

### **4.3 Set Permissions**

1. Select **"Attach policies directly"**
2. In the search box, type: `AmazonSesSending`
3. Check the box next to: **"AmazonSesSendingAccess-v2"**
   - If not found, check: **"AmazonSesSendingAccess"**
4. Click **"Next"**
5. Click **"Create user"**

### **4.4 Generate SMTP Credentials**

1. Click on the user you just created: `cosmic-insights-ses-smtp`
2. Click **"Security credentials"** tab
3. Scroll down to **"SMTP credentials for Amazon SES"** section
4. Click **"Create SMTP credentials"**
5. **IMPORTANT:** A popup will appear with:
   - **SMTP Username** (looks like: AKIAIOSFODNN7EXAMPLE)
   - **SMTP Password** (long alphanumeric string)
6. Click **"Download credentials"** (CSV file)
7. **Save this file securely!** You cannot retrieve the password later

---

## ⚙️ STEP 5: Configure Your Application

### **5.1 Get SES SMTP Endpoint**

Your SMTP endpoint depends on your AWS region:

| Region | SMTP Endpoint |
|--------|---------------|
| US East (N. Virginia) | `email-smtp.us-east-1.amazonaws.com` |
| US West (Oregon) | `email-smtp.us-west-2.amazonaws.com` |
| EU (Ireland) | `email-smtp.eu-west-1.amazonaws.com` |
| EU (Frankfurt) | `email-smtp.eu-central-1.amazonaws.com` |
| Asia Pacific (Tokyo) | `email-smtp.ap-northeast-1.amazonaws.com` |
| Asia Pacific (Sydney) | `email-smtp.ap-southeast-2.amazonaws.com` |

**Full list:** https://docs.aws.amazon.com/ses/latest/dg/smtp-connect.html

### **5.2 Update Backend Environment File**

Edit `backend/.env`:

```env
# ============================================
# AWS SES SMTP Configuration
# ============================================

# SMTP Settings
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=AKIAIOSFODNN7EXAMPLE
SMTP_PASS=your-smtp-password-here

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Cosmic Insights

# Application URL
CLIENT_URL=https://yourdomain.com
# For local testing, use: CLIENT_URL=http://localhost:4000

# ============================================
# Other Environment Variables
# ============================================

# MongoDB
MONGODB_URI=mongodb://mongo:27017/cosmic-insights

# Redis
REDIS_URL=redis://redis:6379

# JWT Secrets (keep your existing values)
JWT_SECRET=your-existing-secret
JWT_REFRESH_SECRET=your-existing-refresh-secret

# ... rest of your env vars ...
```

### **5.3 Update Docker Compose File**

Edit `docker-compose.mailpit.yml`:

**Option A: Keep Mailpit for Development**

Add environment variables to backend service:

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cosmic-backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      MONGODB_URI: mongodb://mongo:27017/cosmic-insights
      REDIS_URL: redis://redis:6379
      
      # AWS SES Configuration
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_SECURE: ${SMTP_SECURE}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      EMAIL_FROM: ${EMAIL_FROM}
      EMAIL_FROM_NAME: ${EMAIL_FROM_NAME}
      CLIENT_URL: ${CLIENT_URL}
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mongo
      - redis
      - qdrant
    networks:
      - app-network

  # Keep Mailpit for testing (optional)
  mailpit:
    image: axllent/mailpit:latest
    container_name: cosmic-mailpit
    ports:
      - "8025:8025"  # Web UI
      - "1025:1025"  # SMTP
    networks:
      - app-network

  # ... other services ...
```

**Option B: Remove Mailpit (Production)**

Simply comment out or remove the mailpit service.

---

## 🧪 STEP 6: Test Email Sending

### **6.1 Restart Backend**

```powershell
cd "C:\Users\dbmos\OneDrive\Documents\Astrology App\Astrology V1.1"
docker-compose -f docker-compose.mailpit.yml restart backend
```

Wait for backend to start (check logs):
```powershell
docker-compose -f docker-compose.mailpit.yml logs -f backend
```

Look for: `Server is running on port 5000`

### **6.2 Test with Sandbox Mode (If Not Approved Yet)**

1. Make sure the email you're testing with is **verified in SES**
2. Open: http://localhost:4000
3. Register with your **verified email address**
4. Check your inbox for verification email
5. Click the verification link
6. You should be auto-logged in!

### **6.3 Test with Production Mode (After Approval)**

1. Open: http://localhost:4000
2. Register with **any real email address**
3. Check inbox for verification email
4. Success! 🎉

---

## 📊 STEP 7: Monitor Email Delivery

### **7.1 View SES Dashboard**

1. Go to SES Console
2. Click **"Account dashboard"**
3. View:
   - **Sending statistics** (sent, delivered, bounces, complaints)
   - **Reputation metrics** (bounce rate, complaint rate)
   - **Sending quota** (emails sent today / 24-hour limit)

### **7.2 Set Up CloudWatch Alarms (Optional)**

Monitor important metrics:

1. In AWS Console, search for **"CloudWatch"**
2. Click **"Alarms"** → **"Create alarm"**
3. Create alarms for:
   - **Bounce rate > 5%** (critical)
   - **Complaint rate > 0.1%** (critical)
   - **Delivery rate < 95%** (warning)

### **7.3 Check Email Logs**

View sent emails:
```powershell
docker-compose -f docker-compose.mailpit.yml logs backend | Select-String "email"
```

---

## 🔍 STEP 8: Improve Deliverability

### **8.1 Set Up SPF Record**

Add to your domain's DNS (if not added during domain verification):

```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
```

If you already have SPF record:
```
v=spf1 include:amazonses.com include:_spf.google.com ~all
```

### **8.2 Set Up DMARC Record**

Add to your domain's DNS:

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

Options:
- `p=none` - Monitor only (start with this)
- `p=quarantine` - Send suspicious emails to spam
- `p=reject` - Reject suspicious emails

### **8.3 Verify DKIM**

DKIM is automatically set up when you verify your domain in SES. Check status:

1. Go to SES Console → **"Verified identities"**
2. Click on your domain
3. Check **"DKIM"** tab
4. Should show: **"Successful"** (green)

### **8.4 Test Email Deliverability**

Use these tools:

1. **Mail Tester:** https://www.mail-tester.com/
   - Register with test email provided
   - Get deliverability score (aim for 9/10 or 10/10)

2. **MXToolbox:** https://mxtoolbox.com/
   - Check SPF, DKIM, DMARC records
   - Verify DNS configuration

---

## 💰 STEP 9: Understand Pricing

### **Free Tier (First 12 Months)**

- ✅ **62,000 emails per month FREE**
- ✅ Applies to all AWS regions
- ✅ Includes both sending and receiving

### **After Free Tier**

- 💰 **$0.10 per 1,000 emails sent**
- 💰 **$0.12 per GB of data transferred** (attachments)

**Examples:**
- 100,000 emails/month = $10/month
- 500,000 emails/month = $50/month
- 1,000,000 emails/month = $100/month

**Comparison:**
- SendGrid: $19.95/month for 50,000 emails
- Mailgun: $35/month for 50,000 emails
- **AWS SES: $5/month for 50,000 emails** 🎉

### **Additional Costs (Optional)**

- **Dedicated IP:** $24.95/month (better reputation control)
- **Email receiving:** $0.10 per 1,000 emails
- **CloudWatch logs:** ~$0.50/month (minimal)

---

## 🚨 STEP 10: Handle Bounces & Complaints

### **10.1 Set Up SNS Notifications (Recommended)**

Get notified of bounces and complaints:

1. In SES Console, click **"Configuration sets"**
2. Click **"Create configuration set"**
3. Name: `cosmic-insights-notifications`
4. Click **"Create set"**

5. Click on the set → **"Event destinations"** tab
6. Click **"Add destination"**
7. Choose event types:
   - ✅ Bounces
   - ✅ Complaints
   - ✅ Deliveries (optional)
8. Select destination: **"Amazon SNS"**
9. Create new SNS topic or use existing
10. Subscribe your email to get notifications

### **10.2 Monitor Bounce Rate**

**Critical Thresholds:**
- **Bounce rate > 5%** - AWS may pause your sending
- **Complaint rate > 0.1%** - AWS may pause your sending

**Actions:**
- Remove hard bounces from your database immediately
- Investigate complaints and remove those addresses
- Implement email validation before registration

### **10.3 Implement Bounce Handling in Backend**

Create `backend/src/services/bounceHandler.js`:

```javascript
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Handle email bounce notification from AWS SNS
 */
const handleBounce = async (bounceData) => {
  try {
    const { bounceType, bouncedRecipients } = bounceData;
    
    for (const recipient of bouncedRecipients) {
      const email = recipient.emailAddress;
      
      if (bounceType === 'Permanent') {
        // Hard bounce - remove user or mark email invalid
        await User.findOneAndUpdate(
          { email },
          { 
            emailVerified: false,
            emailBounced: true,
            bounceReason: recipient.diagnosticCode
          }
        );
        logger.warn(`Hard bounce for ${email} - marked as invalid`);
      } else {
        // Soft bounce - log and retry later
        logger.info(`Soft bounce for ${email} - will retry`);
      }
    }
  } catch (error) {
    logger.error('Error handling bounce:', error);
  }
};

/**
 * Handle complaint notification from AWS SNS
 */
const handleComplaint = async (complaintData) => {
  try {
    const { complainedRecipients } = complaintData;
    
    for (const recipient of complainedRecipients) {
      const email = recipient.emailAddress;
      
      // User marked email as spam - remove from mailing list
      await User.findOneAndUpdate(
        { email },
        { 
          emailVerified: false,
          complained: true,
          complaintDate: new Date()
        }
      );
      logger.warn(`Complaint received for ${email} - removed from mailing list`);
    }
  } catch (error) {
    logger.error('Error handling complaint:', error);
  }
};

module.exports = {
  handleBounce,
  handleComplaint
};
```

---

## ✅ STEP 11: Verification Checklist

Before going live, verify:

- [ ] AWS account created and verified
- [ ] SES email address verified
- [ ] SES domain verified (optional but recommended)
- [ ] Production access approved (can send to any email)
- [ ] SMTP credentials created and downloaded
- [ ] Backend .env updated with SES credentials
- [ ] Backend restarted successfully
- [ ] Test email sent and received
- [ ] SPF record added to DNS
- [ ] DKIM verified (auto-configured by SES)
- [ ] DMARC record added to DNS
- [ ] Bounce/complaint notifications configured
- [ ] Email deliverability tested (Mail Tester)
- [ ] Monitoring dashboard reviewed

---

## 🎯 Quick Reference

### **SMTP Settings**

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=AKIAIOSFODNN7EXAMPLE
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com
```

### **Important Links**

- **AWS Console:** https://console.aws.amazon.com/
- **SES Dashboard:** https://console.aws.amazon.com/ses/
- **IAM Users:** https://console.aws.amazon.com/iam/
- **SES Docs:** https://docs.aws.amazon.com/ses/

### **Testing Tools**

- **Mail Tester:** https://www.mail-tester.com/
- **MXToolbox:** https://mxtoolbox.com/
- **DMARC Check:** https://dmarcian.com/dmarc-inspector/

### **Support**

- **AWS Support:** https://console.aws.amazon.com/support/
- **SES Sending Limits:** Check in SES Console → Account dashboard

---

## 🎉 You're Done!

Your application is now configured to send production emails via AWS SES!

**Benefits:**
- ✅ 62,000 free emails/month (first year)
- ✅ $0.10 per 1,000 emails after
- ✅ Enterprise-grade deliverability
- ✅ Scalable to millions of emails
- ✅ Detailed analytics and monitoring

**Next Steps:**
1. Monitor your bounce and complaint rates daily
2. Set up CloudWatch alarms for critical metrics
3. Implement bounce/complaint handling in your backend
4. Test thoroughly before production launch

**Questions?** Check the troubleshooting section below or AWS SES documentation.

---

## 🔧 Troubleshooting

### **Problem: "Email address not verified"**

**Solution:**
- Check SES Console → Verified identities
- Resend verification email if needed
- Make sure you clicked the verification link

### **Problem: "Account is in sandbox mode"**

**Solution:**
- Request production access (Step 3)
- Wait for AWS approval (24-48 hours)
- Until approved, only send to verified emails

### **Problem: "Invalid SMTP credentials"**

**Solution:**
- Regenerate SMTP credentials in IAM
- Make sure you're using SMTP credentials (not AWS access keys)
- Check for typos in .env file

### **Problem: "Connection timeout to SMTP server"**

**Solution:**
- Check your SMTP_HOST matches your AWS region
- Port 587 must be open (firewall/security group)
- Try port 465 or 25 if 587 doesn't work

### **Problem: "High bounce rate warning"**

**Solution:**
- Implement email validation before registration
- Remove hard bounces from database immediately
- Use double opt-in (email verification)

### **Problem: "Emails going to spam"**

**Solution:**
- Verify SPF, DKIM, DMARC records
- Use consistent "From" address
- Avoid spam trigger words in subject/body
- Test with Mail Tester tool

---

## 📞 Getting Help

### **AWS Support**

- **Free tier:** Community forums only
- **Developer support:** $29/month (response in 12-24 hours)
- **Business support:** $100/month (response in 1 hour)

### **Community Resources**

- **AWS Forums:** https://forums.aws.amazon.com/
- **Stack Overflow:** Tag questions with [amazon-ses]
- **AWS Documentation:** https://docs.aws.amazon.com/ses/

### **Emergency Issues**

If your account is suspended:
1. Check email from AWS for reason
2. Open support case immediately
3. Provide detailed explanation
4. Show bounce/complaint handling implementation

---

**🚀 Happy Sending!**

Your Cosmic Insights app is now powered by enterprise-grade email infrastructure. 

Emails sent: 0 / 62,000 free per month ✨
