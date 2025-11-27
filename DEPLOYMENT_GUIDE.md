#!/bin/bash

# Quick deployment script for MOM AI
echo "🚀 MOM AI Quick Deployment Script"
echo "=================================="

# Step 1: Setup server environment
echo "📦 Step 1: Setting up server environment..."
echo "Run these commands one by one:"
echo ""
echo "# Update system"
echo "sudo apt update && sudo apt upgrade -y"
echo ""
echo "# Install Node.js 18"
echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
echo "sudo apt-get install -y nodejs"
echo ""
echo "# Install pnpm and PM2"
echo "sudo npm install -g pnpm pm2"
echo ""
echo "# Create app directory"
echo "sudo mkdir -p /var/www/mom-ai"
echo "sudo chown -R \$USER:\$USER /var/www/mom-ai"
echo ""

# Step 2: Clone and build
echo "📁 Step 2: Clone repository and build"
echo "cd /var/www/mom-ai"
echo "git clone https://github.com/SanketsMane/MomAi-Repo.git ."
echo "git checkout main"
echo ""

# Step 3: Environment setup
echo "⚙️  Step 3: Environment setup"
echo "# You need to create .env files for both apps:"
echo "# apps/web/.env.production"
echo "# apps/widget/.env.production"
echo "# Use the template in .env.production.template"
echo ""

# Step 4: Install and build
echo "🔨 Step 4: Install dependencies and build"
echo "pnpm install"
echo "cd apps/web && pnpm build && cd ../"
echo "cd apps/widget && pnpm build && cd ../"
echo "cd /var/www/mom-ai"
echo ""

# Step 5: Start with PM2
echo "🎯 Step 5: Start applications with PM2"
echo "mkdir -p logs"
echo "pm2 start ecosystem.config.js"
echo "pm2 save"
echo "pm2 startup"
echo ""

echo "✅ After completion, your apps will be running on:"
echo "📱 Web App: http://15.206.174.14:3000"
echo "🔧 Widget: http://15.206.174.14:4000"