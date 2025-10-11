# Docker Deployment Guide for Cosmic Insights

Complete guide for deploying the Cosmic Insights application using Docker on Windows, Ubuntu, or any Linux distribution.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Ubuntu Specific Instructions](#ubuntu-specific-instructions)
- [Docker Commands Reference](#docker-commands-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Install Docker

#### **Windows:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and restart your computer
3. Verify installation:
   ```powershell
   docker --version
   docker-compose --version
   ```

#### **Ubuntu/Linux:**
```bash
# Update package index
sudo apt-get update

# Install required packages
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Add your user to docker group (optional - avoid using sudo)
sudo usermod -aG docker $USER
newgrp docker

# Test Docker
docker run hello-world
```

---

## Quick Start (Development)

### 1. Clone/Navigate to Project

```bash
cd "c:\Users\dbmos\OneDrive\Documents\Astrology App\Astrology V1.1"
# OR on Ubuntu:
# cd ~/cosmic-insights
```

### 2. Start Everything with Docker Compose

```bash
# Start all services (MongoDB + Backend + Mongo Express GUI)
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access Services

- **Backend API**: http://localhost:5000
- **Backend Health Check**: http://localhost:5000/health
- **Mongo Express (Database GUI)**: http://localhost:8081
  - Username: `admin`
  - Password: `pass`
- **Frontend** (run separately): http://localhost:3000
  ```bash
  npm start
  ```

### 4. Test API

```bash
# Health check
curl http://localhost:5000/health

# Login with test user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cosmicinsights.com","password":"TestUser123!"}'

# Login with admin user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cosmicinsights.com","password":"Admin123!"}'
```

### 5. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

---

## Development Setup

### File Structure

```
cosmic-insights/
├── backend/
│   ├── src/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development with hot-reload
│   └── .dockerignore
├── docker-compose.yml          # Development configuration
├── docker-compose.prod.yml     # Production configuration
├── mongo-init.js               # Database initialization
├── .env.docker                 # Docker environment variables
└── DOCKER_DEPLOYMENT_GUIDE.md
```

### Environment Variables

The `.env.docker` file contains default development settings:

```env
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=changeme_in_production

# JWT Secrets (change in production!)
JWT_ACCESS_SECRET=dev_access_secret...
JWT_REFRESH_SECRET=dev_refresh_secret...
```

**For production, generate secure secrets:**

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Hot Reload Development

The development setup (`docker-compose.yml`) includes:

- ✅ **Hot reload**: Code changes automatically restart the backend
- ✅ **Volume mounting**: Your local code is mounted into the container
- ✅ **Mongo Express**: Web GUI for database management
- ✅ **Debug logging**: Full verbose logs for development

```bash
# Start with hot-reload
docker-compose up -d

# Make changes to backend/src/*.js files
# Backend automatically restarts!

# View live logs
docker-compose logs -f backend
```

---

## Production Deployment

### 1. Update Environment Variables

Create a `.env.production` file:

```env
# MongoDB - Use strong passwords!
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# JWT Secrets - Generate new ones!
JWT_ACCESS_SECRET=<generate-64-char-hex>
JWT_REFRESH_SECRET=<generate-64-char-hex>

# Security
CSRF_SECRET=<generate-64-char-hex>
ENCRYPTION_KEY=<generate-32-char-hex>
COOKIE_SECRET=<generate-64-char-hex>

# CORS - Update with your domain
CORS_ORIGIN=https://yourdomain.com
CLIENT_URL=https://yourdomain.com

# Admin
ADMIN_EMAILS=admin@yourdomain.com
```

### 2. Deploy with Production Configuration

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health
curl http://localhost:5000/health
```

### 3. Nginx Reverse Proxy (Recommended)

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/cosmic-insights;
        try_files $uri /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Ubuntu Specific Instructions

### Complete Ubuntu Deployment

```bash
# 1. Update system
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker (see Prerequisites section)

# 3. Clone repository
git clone https://github.com/yourusername/cosmic-insights.git
cd cosmic-insights

# 4. Set up environment
cp .env.docker .env.production
nano .env.production  # Edit with your values

# 5. Generate secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output to .env.production

# 6. Start services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# 7. Check logs
docker compose -f docker-compose.prod.yml logs -f

# 8. Verify health
curl http://localhost:5000/health

# 9. Set up firewall (if using UFW)
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable

# 10. Install Nginx (optional)
sudo apt-get install -y nginx
sudo nano /etc/nginx/sites-available/cosmic-insights
# Add nginx.conf configuration
sudo ln -s /etc/nginx/sites-available/cosmic-insights /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 11. Install SSL certificate (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Systemd Service (Auto-start on boot)

Create `/etc/systemd/system/cosmic-insights.service`:

```ini
[Unit]
Description=Cosmic Insights Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/youruser/cosmic-insights
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
User=youruser
Group=docker

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cosmic-insights
sudo systemctl start cosmic-insights
sudo systemctl status cosmic-insights
```

---

## Docker Commands Reference

### Container Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f
docker-compose logs backend  # Specific service

# Check status
docker-compose ps

# Execute commands in container
docker-compose exec backend sh
docker-compose exec mongodb mongosh
```

### Database Management

```bash
# Connect to MongoDB shell
docker-compose exec mongodb mongosh -u admin -p changeme

# Backup database
docker-compose exec mongodb mongodump --uri="mongodb://admin:changeme@localhost:27017/cosmic-insights?authSource=admin" --out=/backup

# Restore database
docker-compose exec mongodb mongorestore --uri="mongodb://admin:changeme@localhost:27017/cosmic-insights?authSource=admin" /backup/cosmic-insights

# Export to host
docker cp cosmic-mongodb:/backup ./backup
```

### Cleaning Up

```bash
# Remove stopped containers
docker-compose down

# Remove containers and volumes (DELETES DATA!)
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a --volumes

# View disk usage
docker system df
```

---

## Docker Compose Services

### MongoDB (`mongodb`)
- **Image**: mongo:7.0
- **Port**: 27017
- **Volumes**: Persistent data storage
- **Init Script**: `mongo-init.js` creates collections, indexes, and default users
- **Health Check**: Pings database every 10 seconds

### Backend API (`backend`)
- **Build**: From `backend/Dockerfile` or `backend/Dockerfile.dev`
- **Port**: 5000
- **Depends on**: MongoDB (waits for health check)
- **Volumes** (dev): Live code mounting for hot-reload
- **Health Check**: HTTP check on `/health` endpoint

### Mongo Express (`mongo-express`)
- **Image**: mongo-express:1.0
- **Port**: 8081
- **Purpose**: Web-based MongoDB administration
- **Credentials**: admin / pass (configurable in `.env.docker`)

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs mongodb

# Check container status
docker-compose ps

# Inspect container
docker inspect cosmic-backend

# Remove and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### MongoDB Connection Refused

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# View MongoDB logs
docker-compose logs mongodb

# Verify connection string in backend
docker-compose exec backend printenv MONGODB_URI
```

### Port Already in Use

```bash
# Windows - Find process using port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux - Find and kill process
sudo lsof -i :5000
sudo kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "5001:5000"  # Map to different host port
```

### Backend Can't Connect to MongoDB

**Issue**: `Error: connect ECONNREFUSED`

**Solution**:
```bash
# 1. Check if MongoDB container is healthy
docker-compose ps

# 2. Verify MongoDB URI
docker-compose exec backend printenv MONGODB_URI

# 3. Check network connectivity
docker-compose exec backend ping mongodb

# 4. Restart services in order
docker-compose restart mongodb
docker-compose restart backend
```

### Database Data Persists After `docker-compose down`

This is intentional! To completely reset:

```bash
# Remove volumes (DELETES ALL DATA!)
docker-compose down -v

# Then restart
docker-compose up -d
```

### Permission Denied Errors (Ubuntu)

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Fix file permissions
sudo chown -R $USER:$USER .
```

---

## Monitoring & Maintenance

### View Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Specific container
docker stats cosmic-backend
```

### Database Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cosmic-insights_$TIMESTAMP"

mkdir -p $BACKUP_DIR

docker-compose exec -T mongodb mongodump \
  --uri="mongodb://admin:changeme@localhost:27017/cosmic-insights?authSource=admin" \
  --archive > "$BACKUP_FILE.archive"

echo "Backup created: $BACKUP_FILE.archive"
```

Make executable and run:
```bash
chmod +x backup.sh
./backup.sh
```

### Log Rotation

Backend logs are automatically rotated by Winston (5MB max, 5 files kept).

For Docker container logs:

```bash
# Edit /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
sudo systemctl restart docker
```

---

## Security Best Practices

### Production Checklist

- [ ] Change all default passwords in `.env.production`
- [ ] Generate new JWT secrets (64+ character hex)
- [ ] Use strong MongoDB credentials
- [ ] Enable firewall (allow only necessary ports)
- [ ] Set up SSL/TLS certificates (Let's Encrypt)
- [ ] Configure CORS for your domain only
- [ ] Disable Mongo Express in production (or secure it)
- [ ] Set up automated backups
- [ ] Enable Docker security scanning: `docker scan cosmic-backend`
- [ ] Use secrets management (Docker Secrets, AWS Secrets Manager, etc.)
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure log aggregation (ELK stack, CloudWatch)

---

## Scaling

### Horizontal Scaling

```yaml
# In docker-compose.yml, scale backend:
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancer (Nginx)

```nginx
upstream backend {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    location /api/ {
        proxy_pass http://backend/api/;
    }
}
```

---

## Additional Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Compose**: https://docs.docker.com/compose/
- **MongoDB Docker**: https://hub.docker.com/_/mongo
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## Summary

🎯 **Development**: `docker-compose up -d`
🚀 **Production**: `docker-compose -f docker-compose.prod.yml up -d`
🔍 **Logs**: `docker-compose logs -f`
🛑 **Stop**: `docker-compose down`
💾 **Backup**: `docker-compose exec mongodb mongodump`

**Default Users Created:**
- Admin: `admin@cosmicinsights.com` / `Admin123!`
- Test User: `test@cosmicinsights.com` / `TestUser123!`

⚠️ **IMPORTANT**: Change these passwords in production!
