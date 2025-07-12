#!/bin/bash

# ArcBrain Vercel Deployment Script
# This script helps prepare and deploy ArcBrain to Vercel

set -e

echo "🚀 ArcBrain Vercel Deployment Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed. Installing now..."
    npm install -g vercel
    print_success "Vercel CLI installed"
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking project structure..."

# Ensure all required files exist
required_files=(
    "src/app/api/arcbrain/route.ts"
    "src/lib/arcbrain-api.ts"
    "vercel.json"
    "package.json"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_success "Project structure looks good"

# Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Build the project
print_status "Building the project..."
npm run build
print_success "Project built successfully"

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "You're not logged in to Vercel. Please log in:"
    vercel login
fi

print_status "Preparing for deployment..."

echo ""
echo "📋 Before deploying, make sure you have:"
echo "   1. MongoDB Atlas cluster set up"
echo "   2. MongoDB connection string ready"
echo "   3. Environment variables configured"
echo ""

read -p "Do you have MongoDB Atlas set up? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_warning "Please set up MongoDB Atlas first:"
    echo "   1. Go to https://cloud.mongodb.com"
    echo "   2. Create a new cluster"
    echo "   3. Get your connection string"
    echo "   4. Run this script again"
    echo ""
    exit 1
fi

echo ""
print_status "Starting deployment..."

# Deploy to Vercel
if vercel --prod; then
    print_success "Deployment completed successfully!"
    echo ""
    echo "🎉 Your ArcBrain app is now live!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Set up environment variables in Vercel dashboard"
    echo "   2. Test your deployment"
    echo "   3. Configure custom domain (optional)"
    echo ""
    echo "📚 For detailed instructions, see DEPLOYMENT.md"
    echo ""
else
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi 