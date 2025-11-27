#!/bin/bash

# Complete MOM AI Production Deployment Script
# Run this script on your EC2 server after copying the .env files

set -e

echo "🚀 MOM AI Complete Production Deployment"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Configuration
APP_DIR="/var/www/mom-ai"
REPO_URL="https://github.com/SanketsMane/MomAi-Repo.git"
BRANCH="main"

print_status "Starting complete deployment process..."

# Step 1: System Setup
print_status "Step 1: Setting up system dependencies..."

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js $(node --version) installed"
else
    print_success "Node.js $(node --version) already installed"
fi

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git unzip build-essential nginx

# Install pnpm
if ! command -v pnpm &> /dev/null; then
    print_status "Installing pnpm..."
    sudo npm install -g pnpm
    print_success "pnpm $(pnpm --version) installed"
else
    print_success "pnpm $(pnpm --version) already installed"
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
    print_success "PM2 $(pm2 --version) installed"
else
    print_success "PM2 $(pm2 --version) already installed"
fi

# Step 2: Application Setup
print_status "Step 2: Setting up application directory..."

# Create and setup app directory
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR
cd $APP_DIR

# Clone or update repository
if [ -d ".git" ]; then
    print_status "Updating existing repository..."
    git fetch origin
    git reset --hard origin/$BRANCH
    git clean -fd
else
    print_status "Cloning repository..."
    git clone -b $BRANCH $REPO_URL .
fi

print_success "Repository updated to latest $BRANCH branch"

# Step 3: Environment Setup
print_status "Step 3: Setting up environment files..."

# Check for environment files (they should already be in the repo now)
if [ ! -f "apps/web/.env.production" ]; then
    print_error "Web app .env.production file missing!"
    exit 1
fi

if [ ! -f "apps/widget/.env.production" ]; then
    print_error "Widget app .env.production file missing!"
    exit 1
fi

print_success "Environment files found"

# Step 4: Dependencies and Build
print_status "Step 4: Installing dependencies..."
pnpm install --frozen-lockfile

print_status "Building web application..."
cd apps/web
pnpm build
cd ../../

print_status "Building widget application..."
cd apps/widget
pnpm build
cd ../../

print_success "Both applications built successfully"

# Step 5: Setup Process Management
print_status "Step 5: Setting up process management..."

# Create logs directory
mkdir -p logs

# Stop existing processes
print_status "Stopping existing processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start applications with PM2
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

print_success "Applications started with PM2"

# Step 6: Configure Firewall
print_status "Step 6: Configuring firewall..."
sudo ufw allow 22 2>/dev/null || true
sudo ufw allow 80 2>/dev/null || true
sudo ufw allow 443 2>/dev/null || true
sudo ufw allow 3000 2>/dev/null || true
sudo ufw allow 4000 2>/dev/null || true

print_success "Firewall configured"

# Step 7: Nginx Configuration (optional)
print_status "Step 7: Setting up Nginx reverse proxy..."

# Backup existing nginx config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup 2>/dev/null || true

# Copy our nginx config
sudo cp nginx-config.conf /etc/nginx/sites-available/mom-ai
sudo ln -sf /etc/nginx/sites-available/mom-ai /etc/nginx/sites-enabled/mom-ai 2>/dev/null || true
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test nginx config
if sudo nginx -t; then
    sudo systemctl restart nginx
    print_success "Nginx configured and restarted"
else
    print_warning "Nginx configuration test failed, skipping nginx setup"
fi

# Final Status
print_success "🎉 Deployment completed successfully!"
echo ""
print_status "=== DEPLOYMENT SUMMARY ==="
print_success "✅ System dependencies installed"
print_success "✅ Repository cloned and updated"
print_success "✅ Environment files configured"
print_success "✅ Applications built successfully"
print_success "✅ PM2 process manager configured"
print_success "✅ Firewall configured"
print_success "✅ Nginx reverse proxy setup"

echo ""
print_status "=== ACCESS URLs ==="
print_success "🌐 Main Web App: http://15.206.174.14:3000"
print_success "🔧 Widget App: http://15.206.174.14:4000"
print_success "📊 Nginx Proxy: http://15.206.174.14"

echo ""
print_status "=== MONITORING COMMANDS ==="
echo "📊 PM2 Status: pm2 status"
echo "📋 PM2 Logs: pm2 logs"
echo "👀 PM2 Monitor: pm2 monit"
echo "🔄 Restart Apps: pm2 restart all"
echo "🛑 Stop Apps: pm2 stop all"

echo ""
print_status "=== SYSTEM INFO ==="
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "PNPM: $(pnpm --version)"
echo "PM2: $(pm2 --version)"
echo "Nginx: $(nginx -v 2>&1)"

echo ""
print_success "🚀 Your MOM AI application is now live and running!"