#!/bin/bash

# Cosmic Insights - Quick Start Script for Ubuntu/Linux
# Run this after installing Docker

echo "🚀 Cosmic Insights - Quick Start"
echo "================================"
echo ""

# Check if Docker is installed
echo "Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker is installed: $DOCKER_VERSION"
else
    echo "❌ Docker is not installed!"
    echo ""
    echo "Install Docker with:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    echo "  sudo usermod -aG docker \$USER"
    echo "  newgrp docker"
    exit 1
fi

# Check if docker compose is available
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    echo "✅ Docker Compose is available: $COMPOSE_VERSION"
else
    echo "❌ Docker Compose is not available!"
    exit 1
fi

echo ""
echo "📦 Starting services..."
echo "This will start:"
echo "  - MongoDB (port 27017)"
echo "  - Backend API (port 5000)"
echo "  - Mongo Express GUI (port 8081)"
echo ""

# Start Docker Compose
docker compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    
    echo "Waiting for services to be ready..."
    sleep 10
    
    echo ""
    echo "🌐 Access your services:"
    echo "  Frontend:      http://localhost:3000"
    echo "  Backend API:   http://localhost:5000"
    echo "  Health Check:  http://localhost:5000/health"
    echo "  Mongo Express: http://localhost:8081 (admin/pass)"
    echo ""
    
    echo "👤 Default users created:"
    echo "  Admin:     admin@cosmicinsights.com / Admin123!"
    echo "  Test User: test@cosmicinsights.com / TestUser123!"
    echo ""
    
    echo "🧪 Test the backend:"
    echo '  curl -X POST http://localhost:5000/api/auth/login \'
    echo '    -H "Content-Type: application/json" \'
    echo '    -d '"'"'{"email":"test@cosmicinsights.com","password":"TestUser123!"}'"'"
    echo ""
    
    echo "📊 View logs:"
    echo "  docker compose logs -f"
    echo ""
    
    echo "🛑 Stop services:"
    echo "  docker compose down"
    echo ""
    
    # Try to test health endpoint
    echo "Testing backend health..."
    sleep 5
    if curl -s http://localhost:5000/health > /dev/null; then
        echo "✅ Backend is healthy!"
        HEALTH_RESPONSE=$(curl -s http://localhost:5000/health | jq -r '.message' 2>/dev/null || echo "Server is running")
        echo "   Response: $HEALTH_RESPONSE"
    else
        echo "⏳ Backend is still starting up. Check logs with:"
        echo "   docker compose logs backend"
    fi
    
else
    echo ""
    echo "❌ Failed to start services!"
    echo "Check the error messages above."
    echo "View logs with: docker compose logs"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Happy coding!"
