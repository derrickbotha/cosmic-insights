# Cosmic Insights - Astrology App

## Overview
Cosmic Insights is an astrology application that provides personalized astrological insights, goal tracking, and pattern recognition. The app uses advanced AI models to analyze birth charts, transits, and personal data to offer guidance tailored to each user.

## Features
- **AI-Powered Astrological Insights**: Get personalized readings based on your birth chart and current transits.
- **Goal Setting & Tracking**: Set goals aligned with your astrological profile and track your progress.
- **Pattern Recognition**: Identify recurring patterns in your life and learn how to navigate them.
- **Journal Integration**: Connect your journal entries with astrological events for deeper insights.
- **Claude Sonnet 4 Integration**: All clients now have access to the advanced Claude Sonnet 4 AI model.

## Claude Sonnet 4
We've enabled Claude Sonnet 4 for all clients. This advanced AI model provides:
- Enhanced transit analysis with personalized recommendations
- Deeper pattern recognition across cosmic cycles
- More intuitive understanding of your unique astrological profile
- Better integration with your journal entries and life events
- More accurate predictions based on planetary movements

## 🏗️ Architecture

```
Frontend (React)  ←→  Backend API (Express)  ←→  MongoDB
  Port 3000              Port 5000              Port 27017
```

### Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- AI Chat Interface
- PWA Support

**Backend:**
- Node.js 18 + Express
- MongoDB with Mongoose
- JWT Authentication
- bcrypt Password Hashing
- Rate Limiting & Security Middleware

**Database:**
- MongoDB 7.0
- 4 Collections (Users, Analytics, Payments, Subscriptions)
- 20+ Indexes for Performance
- TTL Auto-cleanup

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Node.js 18+ (for frontend only)

### Option 1: Docker Setup (Easiest - Recommended)

```bash
# 1. Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# 2. Start all services (MongoDB + Backend)
docker-compose up -d

# 3. Start frontend
npm start

# 4. Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Mongo Express: http://localhost:8081 (admin/pass)
```

**Windows Quick Start:**
```powershell
.\start.ps1
```

**Ubuntu/Linux Quick Start:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

#### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

#### 2. Set Up MongoDB

Choose one:

**A. MongoDB Atlas (Cloud - Free):**
- Create account at https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Update `backend/.env`:
  ```env
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cosmic-insights
  ```

**B. Local MongoDB:**
- Download from https://www.mongodb.com/try/download/community
- Install and start service
- Update `backend/.env`:
  ```env
  MONGODB_URI=mongodb://localhost:27017/cosmic-insights
  ```

#### 3. Start Servers

**Terminal 1 - Frontend:**
```bash
npm start
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

#### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/health

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Login (Default Users Created by Docker)
```bash
# Test User
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cosmicinsights.com","password":"TestUser123!"}'

# Admin User
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cosmicinsights.com","password":"Admin123!"}'
```

### Track Analytics Event
```bash
curl -X POST http://localhost:5000/api/analytics/event \
  -H "Content-Type: application/json" \
  -d '{"eventName":"page_view","sessionId":"test-123","pathname":"/"}'
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **[SETUP_COMPLETE_SUMMARY.md](SETUP_COMPLETE_SUMMARY.md)** | Complete setup overview |
| **[DOCKER_DEPLOYMENT_GUIDE.md](DOCKER_DEPLOYMENT_GUIDE.md)** | Docker deployment (11,000+ words) |
| **[backend/README.md](backend/README.md)** | Backend API documentation |
| **[backend/BACKEND_IMPLEMENTATION.md](backend/BACKEND_IMPLEMENTATION.md)** | Implementation details |
| **[MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md)** | MongoDB setup guide |
| **[SECURITY_ADMIN_GUIDE.md](SECURITY_ADMIN_GUIDE.md)** | Security features |

## 🔐 Default Users (Docker Setup)

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@cosmicinsights.com | Admin123! | admin | Full access |
| test@cosmicinsights.com | TestUser123! | user | Standard user |

⚠️ **Change these passwords in production!**

## 📊 API Endpoints

### Authentication (10 endpoints)
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout
- POST `/api/auth/refresh` - Refresh token
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password
- GET `/api/auth/verify-email/:token` - Verify email
- POST `/api/auth/resend-verification` - Resend verification
- GET `/api/auth/me` - Get current user
- PATCH `/api/auth/profile` - Update profile

### Analytics (8 endpoints)
- POST `/api/analytics/event` - Track event
- POST `/api/analytics/events/batch` - Batch track
- GET `/api/analytics/summary` - Get summary
- GET `/api/analytics/journey/:userId` - User journey
- GET `/api/analytics/realtime` - Real-time events
- GET `/api/analytics/events` - List events
- GET `/api/analytics/export` - Export data
- DELETE `/api/analytics/cleanup` - Cleanup old data

**Total: 19 production-ready API endpoints**

## Usage
1. Create an account or log in with your existing credentials.
2. Complete your astrological profile with your birth date, time, and location.
3. Explore the dashboard for personalized insights.
4. Use the AI chat interface to ask questions about your birth chart, transits, or any astrological queries.
5. Set goals and track your progress in alignment with your cosmic blueprint.

## Directory Structure
```
cosmic-insights/
├── public/             # Public assets
├── src/                # Source code
│   ├── components/     # React components
│   ├── config/         # Configuration files
│   ├── pages/          # Page components
│   ├── services/       # Service files
│   ├── App.jsx         # Main App component
│   └── index.jsx       # Entry point
├── package.json        # Dependencies and scripts
└── tailwind.config.js  # Tailwind CSS configuration
```

## Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
For questions or feedback, please contact us at support@cosmicinsights.com