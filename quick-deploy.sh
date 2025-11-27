#!/bin/bash

# One-command deployment for MOM AI
# Run this on your EC2 server after setting up environment variables

set -e
echo "🚀 Starting MOM AI deployment on EC2..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please run the setup script first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_status "Installing pnpm..."
    sudo npm install -g pnpm
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
fi

# Create app directory
print_status "Setting up application directory..."
sudo mkdir -p /var/www/mom-ai
sudo chown -R $USER:$USER /var/www/mom-ai
cd /var/www/mom-ai

# Clone repository
if [ ! -d ".git" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/SanketsMane/MomAi-Repo.git .
else
    print_status "Updating repository..."
    git fetch origin
    git reset --hard origin/main
fi

# Check for environment files
if [ ! -f "apps/web/.env.production" ] || [ ! -f "apps/widget/.env.production" ]; then
    print_error "Environment files missing!"
    print_error "Please create:"
    print_error "- apps/web/.env.production"
    print_error "- apps/widget/.env.production"
    print_error "Use .env.production.template as reference"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
pnpm install --frozen-lockfile

# Build applications
print_status "Building web application..."
cd apps/web
pnpm build

print_status "Building widget application..."
cd ../widget  
pnpm build

# Return to root
cd /var/www/mom-ai

# Create logs directory
mkdir -p logs

# Stop existing processes
print_status "Stopping existing processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start applications
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup ubuntu

print_success "🎉 Deployment completed!"
print_success "Web App: http://15.206.174.14:3000"
print_success "Widget: http://15.206.174.14:4000"

echo ""
print_status "PM2 Status:"
pm2 status

echo ""
print_status "To monitor logs:"
echo "pm2 logs"
echo "pm2 monit"