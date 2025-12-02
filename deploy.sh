#!/bin/bash

# Deployment script for MOM AI to EC2
# Usage: ./deploy.sh

set -e

# Configuration
SERVER_IP="3.111.199.28"
SERVER_USER="ubuntu"  # Change this if using different user (e.g., ec2-user for Amazon Linux)
APP_DIR="/home/ubuntu/mom-ai"
DOMAIN="mom-ai.com"  # Replace with your actual domain

echo "🚀 Starting deployment to EC2 instance $SERVER_IP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Build the applications locally
print_status "Building applications locally..."
pnpm install
pnpm build

# Create deployment package (excluding node_modules and build artifacts)
print_status "Creating deployment package..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='.next' \
    --exclude='build' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='.turbo' \
    -czf mom-ai-deploy.tar.gz .

# Upload to server
print_status "Uploading files to server..."
scp mom-ai-deploy.tar.gz $SERVER_USER@$SERVER_IP:~/

# Deploy on server
print_status "Deploying on server..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
# Colors for remote output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[REMOTE]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[REMOTE]${NC} $1"
}

print_error() {
    echo -e "${RED}[REMOTE ERROR]${NC} $1"
}

# Update system packages
print_status "Updating system packages..."
sudo apt update

# Install Node.js 20 if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
    print_status "Installing pnpm..."
    sudo npm install -g pnpm
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
fi

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    sudo apt install -y nginx
fi

# Create app directory
sudo mkdir -p /home/ubuntu/mom-ai
sudo chown ubuntu:ubuntu /home/ubuntu/mom-ai

# Extract deployment package
print_status "Extracting application files..."
cd /home/ubuntu
tar -xzf mom-ai-deploy.tar.gz -C mom-ai/
rm mom-ai-deploy.tar.gz

# Navigate to app directory
cd mom-ai

# Install dependencies
print_status "Installing dependencies..."
pnpm install --frozen-lockfile

# Build applications
print_status "Building applications..."
pnpm build

# Create environment file
print_status "Creating environment configuration..."
cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production

# Convex Configuration
# Note: You'll need to add your actual Convex deployment URL and API keys
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk Authentication
# Note: You'll need to add your Clerk production keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Sentry Configuration (Optional)
SENTRY_DSN=

# Email Configuration (for notifications)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=

# Application URLs
NEXT_PUBLIC_APP_URL=http://3.111.199.28:3001
NEXT_PUBLIC_WIDGET_URL=http://3.111.199.28:3002
EOF

print_status "Environment file created. Please update .env.production with your actual keys."

# Stop existing processes
print_status "Stopping existing processes..."
pm2 delete all || true

# Start applications with PM2
print_status "Starting applications with PM2..."

# Start web application
cd apps/web
pm2 start "pnpm start" --name "mom-ai-web" --cwd $(pwd) -- --port 3001

# Start widget application  
cd ../widget
pm2 start "pnpm start" --name "mom-ai-widget" --cwd $(pwd) -- --port 3002

# Go back to root
cd ../..

# Save PM2 configuration
pm2 save
pm2 startup

print_status "Applications started successfully!"

ENDSSH

# Clean up local deployment package
rm mom-ai-deploy.tar.gz

print_status "Deployment completed! 🎉"
print_status "Web Application: http://$SERVER_IP:3001"
print_status "Widget Application: http://$SERVER_IP:3002"
print_warning "Don't forget to:"
print_warning "1. Update .env.production on the server with your actual API keys"
print_warning "2. Set up your domain DNS to point to $SERVER_IP"
print_warning "3. Configure SSL certificate for production use"

echo ""
echo "Next steps:"
echo "1. SSH into your server: ssh $SERVER_USER@$SERVER_IP"
echo "2. Edit environment file: nano /home/ubuntu/mom-ai/.env.production"
echo "3. Restart applications: pm2 restart all"
echo "4. Check status: pm2 status"
echo "5. View logs: pm2 logs"