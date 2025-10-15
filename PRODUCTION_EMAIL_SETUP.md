# Production Email Setup Guide

## 🎯 Overview

Currently, you're using **Mailpit** (local development email server) which only works on your computer. To send and receive real emails on the internet, you need to switch to a production email service.

---

## 📧 **Option 1: Gmail SMTP (Recommended for Starting)**

### **Best for:**
- Small to medium applications
- Up to 500 emails per day
- Quick setup with no infrastructure

### **Cost:** FREE (up to 500 emails/day)

### **Setup Steps:**

#### **Step 1: Create Gmail App Password**

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Click **App passwords**
5. Select **Mail** and **Other (Custom name)**
6. Name it: "Cosmic Insights App"
7. Click **Generate**
8. **Copy the 16-character password** (you'll need this!)

#### **Step 2: Update Backend Environment Variables**

Edit `backend/.env`:

```env
# Email Configuration - Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com

# Your domain (for email links)
CLIENT_URL=https://yourdomain.com
```

#### **Step 3: Update docker-compose.mailpit.yml**

Comment out or remove Mailpit service since you won't need it:

```yaml
services:
  backend:
    # ... existing config ...
    environment:
      # ... other env vars ...
      SMTP_HOST: smtp.gmail.com
      SMTP_PORT: 587
      SMTP_SECURE: false
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      EMAIL_FROM: ${EMAIL_FROM}

  # Comment out Mailpit (not needed in production)
  # mailpit:
  #   image: axllent/mailpit:latest
  #   ...
```

#### **Step 4: Restart Backend**

```powershell
docker-compose -f docker-compose.mailpit.yml restart backend
```

#### **Step 5: Test Email Sending**

Register a new user with a real email address and check if you receive the verification email.

---

## 📧 **Option 2: SendGrid (Recommended for Production)**

### **Best for:**
- Growing applications
- Up to 100 emails/day FREE
- Professional email delivery
- Analytics and tracking

### **Cost:** 
- **FREE:** 100 emails/day
- **Essentials:** $19.95/month (50,000 emails)
- **Pro:** $89.95/month (100,000 emails)

### **Setup Steps:**

#### **Step 1: Create SendGrid Account**

1. Go to: https://sendgrid.com/
2. Click **Sign Up** → Choose **Free** plan
3. Verify your email
4. Complete account setup

#### **Step 2: Create API Key**

1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: "Cosmic Insights Production"
4. Permissions: **Full Access** (or Mail Send only)
5. Click **Create & View**
6. **Copy the API key** (shown only once!)

#### **Step 3: Verify Sender Identity**

SendGrid requires sender verification:

**Option A: Single Sender Verification (Quick)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Enter your email (e.g., noreply@yourdomain.com)
4. Fill in details and verify

**Option B: Domain Authentication (Professional)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow DNS setup instructions
4. Add DNS records to your domain registrar

#### **Step 4: Install SendGrid Package**

```powershell
cd backend
npm install @sendgrid/mail
```

#### **Step 5: Update Backend Email Config**

Create `backend/src/config/email.sendgrid.js`:

```javascript
const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send verification email using SendGrid
 */
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_FROM,
      name: 'Cosmic Insights'
    },
    subject: 'Welcome to Cosmic Insights - Verify Your Email',
    text: `Hi ${name},\n\nWelcome to Cosmic Insights! Please verify your email by clicking: ${verificationUrl}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Cosmic Insights</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Welcome to Cosmic Insights! We're excited to have you on board.</p>
              <p>Please verify your email address to get started:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p style="color: #666; font-size: 12px;">
                Or copy and paste this link: <br/>
                <a href="${verificationUrl}">${verificationUrl}</a>
              </p>
              <p style="color: #666; font-size: 12px;">
                This link will expire in 24 hours.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Cosmic Insights. All rights reserved.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    logger.info(`Verification email sent to ${email} via SendGrid`);
    return true;
  } catch (error) {
    logger.error('SendGrid email error:', error);
    if (error.response) {
      logger.error('SendGrid response:', error.response.body);
    }
    throw error;
  }
};

/**
 * Send welcome email using SendGrid
 */
const sendWelcomeEmail = async (email, name) => {
  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_FROM,
      name: 'Cosmic Insights'
    },
    subject: 'Welcome to Cosmic Insights! 🌟',
    text: `Hi ${name},\n\nThank you for verifying your email! You're all set to explore Cosmic Insights.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Welcome Aboard!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 🎉</h2>
              <p>Thank you for verifying your email! Your account is now active.</p>
              <p>Here's what you can do next:</p>
              <ul>
                <li>🌙 Explore your cosmic insights</li>
                <li>📊 Track your patterns and goals</li>
                <li>💎 Discover crystal recommendations</li>
                <li>✍️ Keep a journal of your journey</li>
              </ul>
              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}" class="button">Get Started</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Cosmic Insights. All rights reserved.</p>
              <p>Need help? Reply to this email anytime!</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    logger.info(`Welcome email sent to ${email} via SendGrid`);
    return true;
  } catch (error) {
    logger.error('SendGrid welcome email error:', error);
    throw error;
  }
};

/**
 * Send password reset email using SendGrid
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_FROM,
      name: 'Cosmic Insights'
    },
    subject: 'Reset Your Password - Cosmic Insights',
    text: `Hi ${name},\n\nWe received a request to reset your password. Click here to reset: ${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We received a request to reset your password for your Cosmic Insights account.</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="color: #666; font-size: 12px;">
                Or copy and paste this link: <br/>
                <a href="${resetUrl}">${resetUrl}</a>
              </p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br/>
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you're concerned.
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Cosmic Insights. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    logger.info(`Password reset email sent to ${email} via SendGrid`);
    return true;
  } catch (error) {
    logger.error('SendGrid password reset email error:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};
```

#### **Step 6: Update Environment Variables**

Edit `backend/.env`:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
CLIENT_URL=https://yourdomain.com
```

#### **Step 7: Update authController to use SendGrid**

In `backend/src/controllers/authController.js`, update the import:

```javascript
// Old import (Mailpit)
// const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../config/email');

// New import (SendGrid)
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../config/email.sendgrid');
```

#### **Step 8: Restart Backend**

```powershell
docker-compose restart backend
```

---

## 📧 **Option 3: AWS SES (Best for High Volume)**

### **Best for:**
- Large scale applications
- 62,000 emails/month FREE (with AWS Free Tier)
- $0.10 per 1,000 emails after that
- Advanced deliverability

### **Cost:** 
- **FREE Tier:** 62,000 emails/month for first 12 months
- **After Free Tier:** $0.10 per 1,000 emails

### **Setup Steps:**

#### **Step 1: Create AWS Account**

1. Go to: https://aws.amazon.com/
2. Click **Create an AWS Account**
3. Complete registration (requires credit card)

#### **Step 2: Verify Email/Domain**

1. Open AWS Console → **SES** (Simple Email Service)
2. Click **Verified identities**
3. Click **Create identity**
4. Choose **Email address** or **Domain**
5. Enter your email/domain and verify

#### **Step 3: Request Production Access**

By default, SES is in "sandbox mode" (can only send to verified addresses).

1. In SES console, click **Account dashboard**
2. Look for "Production access" section
3. Click **Request production access**
4. Fill out the form explaining your use case
5. Wait for approval (usually 24 hours)

#### **Step 4: Create IAM User for SMTP**

1. Go to **IAM** in AWS Console
2. Click **Users** → **Add users**
3. Username: "cosmic-insights-smtp"
4. Click **Next**
5. Attach policy: **AmazonSesSendingAccess**
6. Click **Create user**
7. Click on the user → **Security credentials**
8. Scroll to **SMTP credentials for Amazon SES**
9. Click **Create SMTP credentials**
10. **Download credentials** (shown only once!)

#### **Step 5: Update Backend Environment**

Edit `backend/.env`:

```env
# AWS SES SMTP Configuration
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password
EMAIL_FROM=noreply@yourdomain.com
CLIENT_URL=https://yourdomain.com
```

#### **Step 6: Restart Backend**

```powershell
docker-compose restart backend
```

---

## 📧 **Option 4: Mailgun (Developer Friendly)**

### **Best for:**
- Developer-focused features
- 5,000 emails/month FREE
- Great API and logs

### **Cost:**
- **FREE Trial:** 5,000 emails/month for 3 months
- **Foundation:** $35/month (50,000 emails)
- **Growth:** $80/month (100,000 emails)

### **Setup Steps:**

1. Sign up at: https://www.mailgun.com/
2. Verify your domain (add DNS records)
3. Get API credentials
4. Install Mailgun package: `npm install mailgun.js`
5. Update backend config similar to SendGrid

---

## 📧 **Option 5: Self-Hosted Email Server (Postal)**

### **Best for:**
- Complete control
- Unlimited emails
- Privacy-focused
- Technical users

### **Requirements:**
- VPS/Server with public IP
- Domain name
- DNS configuration knowledge
- Server management skills

### **Setup:**

You already have a `docker-compose.postal.yml` file! Here's how to use it:

#### **Step 1: Get a Server**

Providers:
- **DigitalOcean:** $6-12/month
- **Linode:** $5-10/month
- **AWS EC2:** $5-10/month
- **Hetzner:** €4-8/month

#### **Step 2: Point Domain to Server**

Add DNS records:
```
A     mail.yourdomain.com    → Your_Server_IP
MX    yourdomain.com         → mail.yourdomain.com (priority 10)
TXT   yourdomain.com         → "v=spf1 a mx ip4:Your_Server_IP ~all"
```

#### **Step 3: Deploy Postal**

```bash
# SSH into your server
ssh root@your-server-ip

# Clone your project
git clone your-repo-url
cd "Astrology V1.1"

# Start Postal
docker-compose -f docker-compose.postal.yml up -d

# Access Postal web interface
# http://your-server-ip:5000
```

#### **Step 4: Configure Postal**

1. Complete setup wizard
2. Create organization
3. Create mail server
4. Add domain
5. Configure DKIM/SPF
6. Get SMTP credentials

#### **Step 5: Update Backend**

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-postal-username
SMTP_PASS=your-postal-password
EMAIL_FROM=noreply@yourdomain.com
```

---

## 🎯 **Comparison Table**

| Feature | Gmail SMTP | SendGrid | AWS SES | Mailgun | Postal (Self-Hosted) |
|---------|------------|----------|---------|---------|----------------------|
| **Free Tier** | 500/day | 100/day | 62k/month | 5k/month (3 months) | Unlimited |
| **Cost (after free)** | N/A | $19.95/month | $0.10/1k | $35/month | Server cost only |
| **Setup Time** | 5 minutes | 15 minutes | 30 minutes | 15 minutes | 2-3 hours |
| **Technical Skill** | Beginner | Beginner | Intermediate | Beginner | Advanced |
| **Deliverability** | Good | Excellent | Excellent | Excellent | Depends on config |
| **Analytics** | No | Yes | Basic | Yes | Yes |
| **Receiving Emails** | No | No | Yes | Yes | Yes |
| **API Support** | No | Yes | Yes | Yes | Yes |
| **Best For** | Testing/Small | Growing apps | Enterprise | Developers | Self-hosted projects |

---

## 🚀 **Recommended Path**

### **For Development/Testing:**
✅ **Keep Mailpit** - Perfect for local development

### **For Production (Starting):**
✅ **Use SendGrid Free Tier** - 100 emails/day is enough for initial users

### **For Production (Growing):**
✅ **Upgrade to SendGrid Essentials** - $19.95/month for 50k emails

### **For Production (High Volume):**
✅ **Switch to AWS SES** - Most cost-effective at scale

---

## 📝 **Quick Start: Gmail SMTP (5 minutes)**

If you want to get started RIGHT NOW with real emails:

1. **Get Gmail App Password:**
   - https://myaccount.google.com/apppasswords
   - Create app password for "Mail"

2. **Update backend/.env:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-char-app-password
   EMAIL_FROM=your-gmail@gmail.com
   ```

3. **Restart backend:**
   ```powershell
   docker-compose restart backend
   ```

4. **Test it:**
   - Register with your real email
   - Check your inbox!

---

## ⚠️ **Important Notes**

### **DNS Configuration (for production domains):**

When using your own domain, add these DNS records:

```
# SPF Record (allows your email server to send)
TXT  @  "v=spf1 include:_spf.google.com ~all"  # For Gmail
TXT  @  "v=spf1 include:sendgrid.net ~all"     # For SendGrid
TXT  @  "v=spf1 include:amazonses.com ~all"    # For AWS SES

# DKIM Record (email authentication)
# Provided by your email service (SendGrid/SES/etc)

# DMARC Record (email policy)
TXT  _dmarc  "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
```

### **Email Deliverability Tips:**

1. ✅ **Verify your domain** with your email provider
2. ✅ **Set up SPF, DKIM, DMARC** records
3. ✅ **Use consistent "From" address**
4. ✅ **Include unsubscribe link** (for marketing emails)
5. ✅ **Monitor bounce rates** and clean invalid emails
6. ✅ **Warm up your domain** (start with low volume, increase gradually)
7. ✅ **Use proper email templates** (good HTML/text ratio)

### **Testing Email Deliverability:**

Use these tools to test:
- https://www.mail-tester.com/ - Overall email score
- https://mxtoolbox.com/ - DNS/SPF/DKIM check
- https://www.learndmarc.com/ - DMARC validation

---

## 📞 **Need Help?**

### **Gmail SMTP Issues:**
- Make sure 2-factor auth is enabled
- Use App Password, not regular password
- Check "Less secure app access" (not needed with app passwords)

### **SendGrid Issues:**
- Verify sender identity before sending
- Check API key has correct permissions
- Monitor SendGrid activity logs

### **Delivery Issues:**
- Check spam folder
- Verify DNS records
- Use mail-tester.com to diagnose

---

## 🎉 **Next Steps**

1. Choose your email provider (recommend **SendGrid** for starting)
2. Follow setup steps above
3. Update backend configuration
4. Test with real email address
5. Monitor delivery and adjust as needed

Your email verification auto-login will work perfectly with any of these production email services! 🚀✨
