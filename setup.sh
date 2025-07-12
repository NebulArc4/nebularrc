#!/bin/bash

# ArcBrain Development Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up ArcBrain Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. You'll need it for local development."
fi

print_status "Checking prerequisites..."

# Create backend environment file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend environment file..."
    cp backend/env.example backend/.env
    print_success "Backend environment file created"
else
    print_status "Backend environment file already exists"
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Build Docker images
print_status "Building Docker images..."
docker-compose build
print_success "Docker images built successfully"

# Start services
print_status "Starting services..."
docker-compose up -d
print_success "Services started successfully"

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if backend is responding
print_status "Checking backend health..."
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    print_success "Backend is healthy"
else
    print_warning "Backend health check failed. It might still be starting up."
fi

# Check if frontend is responding
print_status "Checking frontend health..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is healthy"
else
    print_warning "Frontend health check failed. It might still be starting up."
fi

echo ""
print_success "🎉 ArcBrain development environment is ready!"
echo ""
echo "📋 Services:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:8000"
echo "   • API Docs: http://localhost:8000/docs"
echo "   • MongoDB: localhost:27017"
echo ""
echo "🔧 Useful commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop services: docker-compose down"
echo "   • Restart services: docker-compose restart"
echo "   • Rebuild: docker-compose up --build"
echo ""
echo "📚 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Navigate to /dashboard/arc-brain"
echo "   3. Try creating a decision in the Finance Brain"
echo ""

# Optional: Open browser
if command -v open &> /dev/null; then
    read -p "Would you like to open the application in your browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:3000
    fi
fi 