# AWS SES Setup Checklist

Use this checklist to track your progress through the AWS SES setup process.

---

## ✅ Pre-Setup Checklist

- [ ] Credit card ready for AWS account
- [ ] Domain name available (optional but recommended)
- [ ] Access to domain DNS settings
- [ ] 30-45 minutes of free time
- [ ] Read AWS_SES_SETUP_GUIDE.md overview

---

## ✅ AWS Account Setup

- [ ] Created AWS account at https://aws.amazon.com/
- [ ] Verified email address for AWS account
- [ ] Verified phone number
- [ ] Added payment method (credit card)
- [ ] Account activation complete
- [ ] Can log in to AWS Console

---

## ✅ SES Configuration

- [ ] Opened SES Console
- [ ] Selected AWS region (recommend: us-east-1)
- [ ] **Email Verification:**
  - [ ] Verified sender email address
  - [ ] Received verification email
  - [ ] Clicked verification link
  - [ ] Email shows "Verified" status in SES
- [ ] **Domain Verification (Optional):**
  - [ ] Added domain to SES
  - [ ] Received DNS records from AWS
  - [ ] Added CNAME records to DNS
  - [ ] Added TXT record to DNS
  - [ ] Domain shows "Verified" status

---

## ✅ Production Access Request

- [ ] Navigated to SES Account dashboard
- [ ] Clicked "Request production access"
- [ ] Filled out use case description
- [ ] Provided detailed email sending plans
- [ ] Explained bounce/complaint handling
- [ ] Acknowledged compliance requirements
- [ ] Submitted request
- [ ] Received confirmation email
- [ ] **Waiting for approval** (24-48 hours)
- [ ] Received approval email
- [ ] Verified production access enabled

---

## ✅ SMTP Credentials

- [ ] Opened IAM Console
- [ ] Created new IAM user: `cosmic-insights-ses-smtp`
- [ ] Attached policy: `AmazonSesSendingAccess-v2`
- [ ] Generated SMTP credentials
- [ ] Downloaded credentials CSV file
- [ ] Saved credentials securely
- [ ] Have SMTP username (starts with AKIA...)
- [ ] Have SMTP password

---

## ✅ Application Configuration

- [ ] Created/updated `backend/.env` file
- [ ] Added SMTP_HOST (correct for region)
- [ ] Added SMTP_PORT (587)
- [ ] Added SMTP_SECURE (false)
- [ ] Added SMTP_USER (from IAM)
- [ ] Added SMTP_PASS (from IAM)
- [ ] Added EMAIL_FROM (verified email)
- [ ] Added CLIENT_URL
- [ ] Saved .env file
- [ ] Restarted backend: `docker-compose restart backend`
- [ ] Checked backend logs for errors
- [ ] Backend started successfully

---

## ✅ Testing

### **Sandbox Mode Testing (Before Approval)**

- [ ] Verified test email address in SES
- [ ] Opened http://localhost:4000
- [ ] Registered with verified email
- [ ] Received verification email
- [ ] Clicked verification link
- [ ] Auto-logged in successfully
- [ ] Email sent via AWS SES (check logs)

### **Production Mode Testing (After Approval)**

- [ ] Opened http://localhost:4000
- [ ] Registered with any real email
- [ ] Received verification email
- [ ] Email delivered to inbox (not spam)
- [ ] Clicked verification link
- [ ] Auto-logged in successfully
- [ ] Tested with multiple email providers:
  - [ ] Gmail
  - [ ] Outlook/Hotmail
  - [ ] Yahoo Mail
  - [ ] Other provider: ___________

---

## ✅ DNS Configuration

- [ ] **SPF Record:**
  - [ ] Added TXT record to domain
  - [ ] Value: `v=spf1 include:amazonses.com ~all`
  - [ ] Verified with MXToolbox
  
- [ ] **DKIM Records:**
  - [ ] Automatically configured by SES
  - [ ] Verified in SES Console
  - [ ] Status shows "Successful"
  
- [ ] **DMARC Record:**
  - [ ] Added TXT record to domain
  - [ ] Name: `_dmarc`
  - [ ] Value: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
  - [ ] Verified with dmarcian.com

---

## ✅ Email Deliverability Testing

- [ ] Tested with Mail Tester (https://www.mail-tester.com/)
  - [ ] Score: ___/10 (aim for 9+)
- [ ] Checked SPF with MXToolbox
- [ ] Checked DKIM with MXToolbox
- [ ] Checked DMARC with MXToolbox
- [ ] Tested emails arrive in inbox (not spam)
- [ ] Tested on mobile devices

---

## ✅ Monitoring Setup

- [ ] Opened SES Account dashboard
- [ ] Reviewed sending statistics
- [ ] Checked reputation metrics
- [ ] Set up bounce notifications (optional):
  - [ ] Created SNS topic
  - [ ] Created configuration set
  - [ ] Added event destination
  - [ ] Subscribed email to SNS topic
- [ ] Set up CloudWatch alarms (optional):
  - [ ] Bounce rate > 5%
  - [ ] Complaint rate > 0.1%
  - [ ] Delivery rate < 95%

---

## ✅ Production Readiness

- [ ] Tested complete registration flow
- [ ] Tested password reset emails
- [ ] Tested welcome emails
- [ ] Monitored bounce rate (< 5%)
- [ ] Monitored complaint rate (< 0.1%)
- [ ] Implemented bounce handling in backend
- [ ] Implemented complaint handling in backend
- [ ] Email templates reviewed and approved
- [ ] Unsubscribe mechanism in place (if needed)
- [ ] Privacy policy includes email usage
- [ ] Terms of service includes email notifications

---

## ✅ Documentation & Maintenance

- [ ] Documented SES configuration
- [ ] Saved SMTP credentials securely
- [ ] Set calendar reminder to check metrics weekly
- [ ] Planned for scaling (if needed)
- [ ] Backup plan if SES has issues
- [ ] Team members trained on monitoring
- [ ] Emergency contacts documented

---

## 📊 Current Status

**Fill this out after setup:**

- **AWS Account ID:** ___________________
- **AWS Region:** ___________________
- **SES Status:** [ ] Sandbox  [ ] Production
- **Verified Email:** ___________________
- **Verified Domain:** ___________________
- **SMTP Endpoint:** ___________________
- **Sending Limit:** _______ emails/day
- **Current Usage:** _______ emails/month
- **Setup Date:** ___________________
- **Approval Date:** ___________________

---

## 🎯 Key Metrics to Monitor

Track these weekly:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Emails Sent | - | _____ | ✅ |
| Bounce Rate | < 5% | _____ % | ⚠️ |
| Complaint Rate | < 0.1% | _____ % | ⚠️ |
| Delivery Rate | > 95% | _____ % | ⚠️ |

---

## 🚨 Troubleshooting Log

Use this section to track any issues:

**Issue 1:**
- Date: ___________________
- Problem: ___________________
- Solution: ___________________
- Resolved: [ ] Yes  [ ] No

**Issue 2:**
- Date: ___________________
- Problem: ___________________
- Solution: ___________________
- Resolved: [ ] Yes  [ ] No

---

## 📞 Important Contacts

- **AWS Support:** https://console.aws.amazon.com/support/
- **SES Documentation:** https://docs.aws.amazon.com/ses/
- **Your AWS Account ID:** ___________________
- **Team Lead Email:** ___________________
- **Emergency Contact:** ___________________

---

## 🎉 Completion

- [ ] **All checklist items completed**
- [ ] **SES sending production emails**
- [ ] **Monitoring set up**
- [ ] **Team trained**
- [ ] **Documentation complete**

**Setup Completed By:** ___________________  
**Date:** ___________________  
**Signature:** ___________________

---

## 📈 Next Steps After Setup

1. **Week 1:** Monitor daily, adjust as needed
2. **Week 2-4:** Weekly monitoring, optimize delivery
3. **Month 2+:** Monthly review, plan for scaling
4. **Year 1 End:** Evaluate AWS Free Tier expiration, budget for paid tier

---

## 💡 Tips for Success

- ✅ Start with sandbox mode for testing
- ✅ Request production access early (takes 24-48h)
- ✅ Verify domain for better deliverability
- ✅ Set up DNS records properly
- ✅ Monitor bounce/complaint rates religiously
- ✅ Test with multiple email providers
- ✅ Keep credentials secure
- ✅ Document everything
- ✅ Plan for scaling
- ✅ Have backup email service ready (SendGrid, Mailgun)

---

**Good luck with your AWS SES setup! 🚀**

If you get stuck, refer to: `AWS_SES_SETUP_GUIDE.md`
