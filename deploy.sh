#!/bin/bash

# MOM AI Production Deployment Script
# This script deploys the application to AWS EC2

set -e  # Exit on any error

echo "🚀 Starting MOM AI deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/mom-ai"
REPO_URL="https://github.com/SanketsMane/MomAi-Repo.git"
BRANCH="main"

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

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. This is not recommended for production."
fi

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Navigate to app directory
cd $APP_DIR

# Clone or update repository
if [ -d ".git" ]; then
    print_status "Updating existing repository..."
    git fetch origin
    git reset --hard origin/$BRANCH
else
    print_status "Cloning repository..."
    git clone -b $BRANCH $REPO_URL .
fi

# Create logs directory
mkdir -p logs

# Install dependencies
print_status "Installing dependencies..."
if ! command -v pnpm &> /dev/null; then
    print_status "Installing pnpm..."
    npm install -g pnpm
fi

pnpm install --frozen-lockfile

# Build applications
print_status "Building web application..."
cd apps/web
pnpm build

print_status "Building widget application..."
cd ../widget
pnpm build

# Return to root directory
cd $APP_DIR

# Stop existing PM2 processes
print_status "Stopping existing processes..."
pm2 stop all || true
pm2 delete all || true

# Start applications with PM2
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

print_success "🎉 Deployment completed successfully!"
print_success "Web app running on: http://15.206.174.14:3000"
print_success "Widget app running on: http://15.206.174.14:4000"

# Show PM2 status
echo ""
print_status "Application status:"
pm2 status

echo ""
print_status "To monitor logs:"
echo "pm2 logs mom-ai-web"
echo "pm2 logs mom-ai-widget"
echo "pm2 monit"