# Postal Email Server - GCP Deployment Guide

Complete guide to deploy Postal self-hosted email server on Google Cloud Platform with your Cosmic Insights application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Email Configuration Options](#email-configuration-options)
3. [GCP Setup](#gcp-setup)
4. [Postal Installation](#postal-installation)
5. [DNS Configuration](#dns-configuration)
6. [SSL/TLS Certificates](#ssltls-certificates)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

---

## Prerequisites

### Required Items
- ✅ Google Cloud Platform account with billing enabled
- ✅ Domain name (e.g., yourdomain.com)
- ✅ Domain DNS access (to add MX, SPF, DKIM records)
- ✅ Basic knowledge of Linux and Docker
- ✅ SSH client for server access

### Required GCP Services
- Compute Engine (VM instances)
- Cloud DNS (optional but recommended)
- Cloud Load Balancing (optional for HA)
- Cloud Monitoring
- Cloud Logging

### Estimated Costs
- **Small Setup** (1-1000 emails/day): ~$50-100/month
  - e2-medium VM (2 vCPU, 4 GB RAM)
  - 50 GB persistent disk
  - Basic monitoring
  
- **Medium Setup** (1000-10000 emails/day): ~$150-250/month
  - e2-standard-4 VM (4 vCPU, 16 GB RAM)
  - 200 GB persistent disk
  - Cloud Load Balancer
  - Enhanced monitoring

---

## Email Configuration Options

We have **three email solutions** for different use cases:

### 1. Mailpit (Development Only) ⚡
**Status**: ✅ Ready to use  
**File**: `docker-compose.mailpit.yml`  
**Best For**: Local development and testing  
**Pros**:
- ✅ Easy to set up (5 minutes)
- ✅ Web UI for viewing emails
- ✅ No external dependencies
- ✅ Perfect for testing registration flow

**Cons**:
- ❌ Doesn't send real emails
- ❌ Not for production use
- ❌ No email delivery

**Quick Start**:
```bash
# Start Mailpit
docker-compose -f docker-compose.mailpit.yml up -d

# View emails at:
# http://localhost:8025

# SMTP available at:
# localhost:1025
```

### 2. Postal (Self-Hosted Production) 🚀
**Status**: ✅ Configuration ready  
**File**: `docker-compose.postal.yml`  
**Best For**: Full control, GCP deployment  
**Pros**:
- ✅ Complete mail server
- ✅ Web UI for management
- ✅ Bounce/complaint handling
- ✅ Webhook support
- ✅ API access
- ✅ Detailed analytics

**Cons**:
- ⚠️ Requires domain and DNS setup
- ⚠️ Need to maintain server
- ⚠️ Spam reputation management

**Best Use Cases**:
- You own a domain
- Need 10,000+ emails/month
- Want full control
- Have technical expertise

### 3. Gmail SMTP (Quick Production) 📧
**Status**: ✅ Guide available  
**File**: `GMAIL_SMTP_SETUP.md`  
**Best For**: Quick production setup  
**Pros**:
- ✅ 5-minute setup
- ✅ Google's reputation
- ✅ High deliverability
- ✅ No server maintenance

**Cons**:
- ⚠️ 500 emails/day limit (free)
- ⚠️ Requires Google account
- ⚠️ Less control

**When to Use**:
- Need production emails NOW
- Low volume (<500/day)
- Don't have domain yet
- Testing production flow

---

## GCP Setup

### Step 1: Create GCP Project

```bash
# Install Google Cloud SDK
# Windows: Download from https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Create project
gcloud projects create cosmic-insights-prod --name="Cosmic Insights Production"

# Set as default
gcloud config set project cosmic-insights-prod

# Enable billing (required)
# Visit: https://console.cloud.google.com/billing
```

### Step 2: Enable Required APIs

```bash
# Enable APIs
gcloud services enable compute.googleapis.com
gcloud services enable dns.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 3: Create VM Instance

```bash
# Create VM for Postal
gcloud compute instances create cosmic-postal-server \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --boot-disk-type=pd-balanced \
  --tags=http-server,https-server,mail-server \
  --metadata=startup-script='#!/bin/bash
    apt-get update
    apt-get install -y docker.io docker-compose git
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu'

# Wait for instance to start
gcloud compute instances describe cosmic-postal-server --zone=us-central1-a
```

### Step 4: Configure Firewall Rules

```bash
# Allow HTTP/HTTPS
gcloud compute firewall-rules create allow-web \
  --allow tcp:80,tcp:443 \
  --target-tags http-server,https-server \
  --description="Allow HTTP and HTTPS traffic"

# Allow SMTP
gcloud compute firewall-rules create allow-smtp \
  --allow tcp:25,tcp:587,tcp:2525 \
  --target-tags mail-server \
  --description="Allow SMTP traffic"

# Allow Postal Web UI (if needed externally)
gcloud compute firewall-rules create allow-postal-ui \
  --allow tcp:5000 \
  --target-tags mail-server \
  --description="Allow Postal Web UI"

# Allow RabbitMQ Management (optional)
gcloud compute firewall-rules create allow-rabbitmq-mgmt \
  --allow tcp:15672 \
  --target-tags mail-server \
  --description="Allow RabbitMQ Management UI"
```

### Step 5: Reserve Static IP

```bash
# Reserve external IP for mail server
gcloud compute addresses create cosmic-postal-ip \
  --region=us-central1

# Get the IP address
gcloud compute addresses describe cosmic-postal-ip --region=us-central1

# Assign to instance
gcloud compute instances delete-access-config cosmic-postal-server \
  --access-config-name="external-nat" \
  --zone=us-central1-a

gcloud compute instances add-access-config cosmic-postal-server \
  --access-config-name="external-nat" \
  --address=YOUR_RESERVED_IP \
  --zone=us-central1-a
```

---

## Postal Installation

### Step 1: Connect to Server

```bash
# SSH into server
gcloud compute ssh cosmic-postal-server --zone=us-central1-a

# Or use external IP
ssh ubuntu@YOUR_SERVER_IP
```

### Step 2: Prepare Environment

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Verify Docker installation
docker --version
docker-compose --version

# If not installed:
sudo apt-get install -y docker.io docker-compose git

# Add user to docker group
sudo usermod -aG docker $USER

# Re-login for group to take effect
exit
# SSH back in
```

### Step 3: Clone Repository

```bash
# Create app directory
mkdir -p /opt/cosmic-insights
cd /opt/cosmic-insights

# Clone your repository (or upload files)
git clone https://github.com/yourusername/cosmic-insights.git .

# Or use SCP to upload files:
# From local machine:
# scp -r ./* ubuntu@YOUR_SERVER_IP:/opt/cosmic-insights/
```

### Step 4: Configure Environment Variables

```bash
# Create production .env file
nano .env.production
```

Add the following:

```env
# === Production Environment Configuration ===

# === JWT Secrets (GENERATE STRONG SECRETS!) ===
JWT_ACCESS_SECRET=generate_random_64_char_string_here
JWT_REFRESH_SECRET=generate_different_random_64_char_string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# === Security Secrets ===
CSRF_SECRET=generate_random_32_char_string
ENCRYPTION_KEY=generate_random_32_char_string
COOKIE_SECRET=generate_random_32_char_string

# === Database Passwords ===
POSTGRES_PASSWORD=generate_strong_postgres_password
REDIS_PASSWORD=generate_strong_redis_password

# === MinIO Credentials ===
MINIO_ACCESS_KEY=generate_20_char_access_key
MINIO_SECRET_KEY=generate_40_char_secret_key

# === Postal Configuration ===
POSTAL_ROOT_PASSWORD=generate_strong_postal_root_password
POSTAL_DATABASE_PASSWORD=generate_strong_postal_db_password
POSTAL_RABBITMQ_PASSWORD=generate_strong_rabbitmq_password

# === Domain Configuration ===
POSTAL_DOMAIN=mail.yourdomain.com
APP_DOMAIN=yourdomain.com
CLIENT_URL=https://yourdomain.com

# === Email Configuration ===
EMAIL_FROM_NAME=Cosmic Insights
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

**Generate secure secrets**:
```bash
# Generate random secrets
openssl rand -hex 32  # For 32-byte secrets
openssl rand -hex 64  # For 64-byte secrets

# Or use this script
for i in {1..5}; do openssl rand -hex 32; done
```

### Step 5: Update docker-compose.postal.yml

```bash
# Edit the compose file
nano docker-compose.postal.yml
```

Update these lines:
```yaml
# Change all instances of 'yourdomain.com' to your actual domain
# Change all 'change_me' passwords to your generated secrets

# Example:
  postal:
    environment:
      POSTAL_WEB_HOSTNAME: mail.yourdomain.com  # Change this
      POSTAL_SMTP_HOSTNAME: mail.yourdomain.com  # Change this
      POSTAL_ADMIN_EMAIL: admin@yourdomain.com   # Change this
      POSTAL_ADMIN_PASSWORD: your_generated_password  # Change this
```

### Step 6: Start Services

```bash
# Create required directories
sudo mkdir -p /opt/cosmic-insights/logs
sudo mkdir -p /opt/cosmic-insights/nginx/ssl

# Load environment variables
export $(cat .env.production | xargs)

# Start all services
docker-compose -f docker-compose.postal.yml up -d

# Check status
docker-compose -f docker-compose.postal.yml ps

# View logs
docker-compose -f docker-compose.postal.yml logs -f postal
```

### Step 7: Initialize Postal

```bash
# Wait for Postal to start (2-3 minutes)
docker-compose -f docker-compose.postal.yml logs -f postal

# Access Postal web UI
# http://YOUR_SERVER_IP:5000

# Default credentials (from docker-compose.postal.yml):
# Email: admin@yourdomain.com
# Password: your_generated_password

# Follow Postal's setup wizard:
# 1. Create organization
# 2. Create mail server
# 3. Add domain (yourdomain.com)
# 4. Get SMTP credentials
```

---

## DNS Configuration

### Required DNS Records

After setting up Postal, you'll get specific DNS records from the Postal UI. Here's what you need:

#### 1. A Record (Point domain to server)
```
Type: A
Name: mail.yourdomain.com
Value: YOUR_SERVER_IP
TTL: 3600
```

#### 2. MX Record (Mail exchange)
```
Type: MX
Name: @ (or yourdomain.com)
Priority: 10
Value: mail.yourdomain.com
TTL: 3600
```

#### 3. SPF Record (Sender Policy Framework)
```
Type: TXT
Name: @ (or yourdomain.com)
Value: v=spf1 a mx ip4:YOUR_SERVER_IP ~all
TTL: 3600
```

#### 4. DKIM Record (DomainKeys Identified Mail)
```
Type: TXT
Name: postal-YOUR_UNIQUE_ID._domainkey
Value: [Get from Postal UI - very long string]
TTL: 3600
```

#### 5. DMARC Record (Domain-based Message Authentication)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
TTL: 3600
```

#### 6. PTR Record (Reverse DNS) - Important!
```
# Request from GCP support or set in Cloud Console
# PTR record for YOUR_SERVER_IP should point to mail.yourdomain.com
```

### Using Google Cloud DNS

```bash
# Create DNS zone
gcloud dns managed-zones create yourdomain-zone \
  --dns-name="yourdomain.com." \
  --description="Cosmic Insights DNS Zone"

# Add A record
gcloud dns record-sets create mail.yourdomain.com. \
  --zone=yourdomain-zone \
  --type=A \
  --ttl=3600 \
  --rrdatas=YOUR_SERVER_IP

# Add MX record
gcloud dns record-sets create yourdomain.com. \
  --zone=yourdomain-zone \
  --type=MX \
  --ttl=3600 \
  --rrdatas="10 mail.yourdomain.com."

# Add SPF record
gcloud dns record-sets create yourdomain.com. \
  --zone=yourdomain-zone \
  --type=TXT \
  --ttl=3600 \
  --rrdatas="v=spf1 a mx ip4:YOUR_SERVER_IP ~all"

# Add DKIM (get value from Postal UI)
gcloud dns record-sets create postal-YOUR_UNIQUE_ID._domainkey.yourdomain.com. \
  --zone=yourdomain-zone \
  --type=TXT \
  --ttl=3600 \
  --rrdatas="YOUR_DKIM_PUBLIC_KEY"

# Add DMARC
gcloud dns record-sets create _dmarc.yourdomain.com. \
  --zone=yourdomain-zone \
  --type=TXT \
  --ttl=3600 \
  --rrdatas="v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
```

### Verify DNS Propagation

```bash
# Check A record
dig mail.yourdomain.com +short

# Check MX record
dig yourdomain.com MX +short

# Check SPF
dig yourdomain.com TXT +short | grep spf

# Check DKIM
dig postal-YOUR_UNIQUE_ID._domainkey.yourdomain.com TXT +short

# Check DMARC
dig _dmarc.yourdomain.com TXT +short

# Or use online tools:
# https://mxtoolbox.com/
# https://www.mail-tester.com/
```

---

## SSL/TLS Certificates

### Option 1: Let's Encrypt (Recommended - Free)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Generate certificates
sudo certbot certonly --standalone \
  -d mail.yourdomain.com \
  -d yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --no-eff-email

# Certificates will be at:
# /etc/letsencrypt/live/mail.yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/mail.yourdomain.com/privkey.pem

# Copy to nginx directory
sudo cp /etc/letsencrypt/live/mail.yourdomain.com/fullchain.pem /opt/cosmic-insights/nginx/ssl/
sudo cp /etc/letsencrypt/live/mail.yourdomain.com/privkey.pem /opt/cosmic-insights/nginx/ssl/

# Set up auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Option 2: Google-Managed SSL (Cloud Load Balancer)

```bash
# Create SSL certificate
gcloud compute ssl-certificates create cosmic-ssl-cert \
  --domains=yourdomain.com,mail.yourdomain.com

# Create HTTPS load balancer
gcloud compute target-https-proxies create cosmic-https-proxy \
  --ssl-certificates=cosmic-ssl-cert \
  --url-map=cosmic-url-map

# Create forwarding rule
gcloud compute forwarding-rules create cosmic-https-forwarding \
  --target-https-proxy=cosmic-https-proxy \
  --ports=443 \
  --global
```

---

## Testing

### Test 1: SMTP Connection

```bash
# Test from server
telnet localhost 25

# Should see:
# 220 mail.yourdomain.com ESMTP Postal

# Test from external
telnet YOUR_SERVER_IP 25
```

### Test 2: Send Test Email

```bash
# Using PowerShell (from your Windows machine)
$smtp = New-Object System.Net.Mail.SmtpClient("YOUR_SERVER_IP", 25)
$smtp.Credentials = New-Object System.Net.NetworkCredential("your_postal_api_key", "")
$message = New-Object System.Net.Mail.MailMessage("noreply@yourdomain.com", "your_test_email@gmail.com", "Test", "This is a test email from Postal")
$smtp.Send($message)
```

### Test 3: Registration Flow

```bash
# Test registration from your app
# Open browser to: https://yourdomain.com
# Register new account
# Check email for verification link
# Verify link works
```

### Test 4: Email Deliverability

Visit these testing services:
- https://www.mail-tester.com/ (Score should be 8+/10)
- https://mxtoolbox.com/emailhealth/ (All checks should pass)
- https://dkimvalidator.com/ (DKIM should validate)

---

## Troubleshooting

### Issue: Emails not sending

**Check Postal logs**:
```bash
docker-compose -f docker-compose.postal.yml logs -f postal
```

**Check queue**:
```bash
# Access Postal UI
# http://YOUR_SERVER_IP:5000
# Check Queues tab
```

**Verify SMTP credentials**:
```bash
# Check backend .env
docker-compose -f docker-compose.postal.yml exec backend cat /app/.env | grep EMAIL
```

### Issue: Emails going to spam

**Solutions**:
1. ✅ Verify all DNS records (SPF, DKIM, DMARC)
2. ✅ Set up PTR/reverse DNS
3. ✅ Warm up IP address (send gradually increasing volume)
4. ✅ Monitor bounce rates (keep < 2%)
5. ✅ Implement feedback loops
6. ✅ Use mail-tester.com to check score

### Issue: Can't access Postal UI

**Check firewall**:
```bash
sudo ufw status
sudo ufw allow 5000/tcp
```

**Check Postal status**:
```bash
docker-compose -f docker-compose.postal.yml ps
docker-compose -f docker-compose.postal.yml logs postal
```

### Issue: High bounce rate

**Causes**:
- Invalid email addresses
- Spam traps
- Poor sender reputation
- Missing DNS records

**Solutions**:
- Implement email validation on frontend
- Use double opt-in (verification emails)
- Monitor bounce webhooks
- Clean email list regularly

### Issue: Server overload

**Check resources**:
```bash
# CPU usage
top

# Memory usage
free -h

# Disk usage
df -h

# Docker stats
docker stats
```

**Scale up if needed**:
```bash
# Resize VM
gcloud compute instances stop cosmic-postal-server --zone=us-central1-a
gcloud compute instances set-machine-type cosmic-postal-server \
  --machine-type=e2-standard-4 \
  --zone=us-central1-a
gcloud compute instances start cosmic-postal-server --zone=us-central1-a
```

---

## Maintenance

### Daily Tasks

**Monitor logs**:
```bash
# Backend logs
docker-compose -f docker-compose.postal.yml logs -f backend --tail=100

# Postal logs
docker-compose -f docker-compose.postal.yml logs -f postal --tail=100

# Check for errors
docker-compose -f docker-compose.postal.yml logs | grep ERROR
```

**Check email queue**:
```bash
# Access Postal UI and check Queues tab
# Ensure queue is processing and not backed up
```

### Weekly Tasks

**Database backup**:
```bash
# Backup MongoDB
docker exec cosmic-mongodb-prod mongodump --out /backup/mongodb-$(date +%Y%m%d)

# Backup Postal MariaDB
docker exec cosmic-postal-mariadb mysqldump -u postal -p postal > postal-backup-$(date +%Y%m%d).sql

# Upload to Cloud Storage
gsutil cp -r /backup/* gs://cosmic-insights-backups/
```

**Check deliverability**:
```bash
# Send test email to mail-tester.com
# Verify score is 8+/10
# Fix any issues immediately
```

### Monthly Tasks

**Update SSL certificates** (if using Let's Encrypt):
```bash
sudo certbot renew
# Certificates auto-renew, but verify it worked
sudo certbot certificates
```

**Update Docker images**:
```bash
docker-compose -f docker-compose.postal.yml pull
docker-compose -f docker-compose.postal.yml up -d
```

**Review logs and metrics**:
```bash
# Check GCP Monitoring dashboard
# Review error rates
# Check resource utilization
# Plan for scaling if needed
```

**Clean up old data**:
```bash
# Postal: Delete old emails (configure in UI)
# MongoDB: Archive old user data
# Logs: Rotate and archive logs
```

### Security Updates

```bash
# Update Ubuntu packages
sudo apt-get update
sudo apt-get upgrade -y

# Update Docker
sudo apt-get install --only-upgrade docker-ce

# Restart services
docker-compose -f docker-compose.postal.yml restart
```

---

## Production Checklist

Before going live:

- [ ] ✅ Domain configured with all DNS records
- [ ] ✅ SSL certificates installed and valid
- [ ] ✅ Firewall rules configured
- [ ] ✅ Static IP assigned
- [ ] ✅ PTR/reverse DNS set up
- [ ] ✅ SPF record added
- [ ] ✅ DKIM configured and verified
- [ ] ✅ DMARC policy set
- [ ] ✅ Test email sent and received
- [ ] ✅ Mail-tester score 8+/10
- [ ] ✅ Registration flow tested
- [ ] ✅ Verification email works
- [ ] ✅ Welcome email works
- [ ] ✅ Password reset works
- [ ] ✅ Backups configured
- [ ] ✅ Monitoring set up
- [ ] ✅ Alerts configured
- [ ] ✅ Documentation updated

---

## Cost Optimization

### Tips to Reduce Costs

1. **Use Preemptible VMs** (60-91% cheaper):
```bash
gcloud compute instances create cosmic-postal-server \
  --preemptible \
  --machine-type=e2-medium \
  --zone=us-central1-a
```

2. **Committed Use Discounts** (up to 57% off):
```bash
# Purchase 1-year or 3-year commitment
# Visit: https://console.cloud.google.com/compute/commitments
```

3. **Right-size VMs**:
```bash
# Start small, monitor, scale as needed
# Use Cloud Monitoring to track resource usage
```

4. **Use Cloud Storage for backups**:
```bash
# Cheaper than disk storage for archives
gsutil cp /backup/* gs://cosmic-insights-backups/
```

---

## Support

### Resources
- **Postal Documentation**: https://docs.postalserver.io/
- **GCP Documentation**: https://cloud.google.com/docs
- **Email Deliverability Guide**: https://www.sparkpost.com/resources/email-deliverability/
- **DMARC Guide**: https://dmarc.org/

### Community
- Postal GitHub: https://github.com/postalserver/postal
- GCP Community: https://www.googlecloudcommunity.com/
- Email Geeks Slack: https://email.geeks.chat/

---

**Next Steps**: After deploying Postal, update your backend `.env` file with the SMTP credentials from Postal UI and restart the backend service.

**Development to Production Flow**:
1. Test with Mailpit locally (`docker-compose.mailpit.yml`)
2. Deploy Postal to GCP (`docker-compose.postal.yml`)
3. Configure DNS and SSL
4. Test thoroughly
5. Go live! 🚀
