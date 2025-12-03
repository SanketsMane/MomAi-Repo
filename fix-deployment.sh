#!/bin/bash

# Fix deployment script - Complete fresh clone approach
# This addresses the build contamination issue

SERVER="3.111.199.28"
USER="ubuntu"
SSH_KEY="/Users/sanket/Documents/CHATBOT-MOM/mom-aiserver-ec2.pem"
REPO_URL="https://github.com/SanketMohanty/MOM-AI.git"
BRANCH="2.0_Ai"

echo "🔥 NUCLEAR DEPLOYMENT FIX - Fresh Clone Approach"
echo "=========================================="

# SSH connection function with proper key handling
ssh_exec() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" "$1"
}

scp_file() {
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$1" "$USER@$SERVER:$2"
}

echo "🔍 Testing SSH connection..."
if ! ssh_exec "whoami"; then
    echo "❌ SSH connection failed. Please check:"
    echo "1. SSH key permissions: chmod 600 $SSH_KEY"
    echo "2. Server accessibility"
    echo "3. Key file path"
    exit 1
fi

echo "✅ SSH connection successful"

echo "🛑 Stopping all services..."
ssh_exec "sudo pm2 stop all 2>/dev/null || true"
ssh_exec "sudo pm2 delete all 2>/dev/null || true"

echo "🗑️ Removing old installation completely..."
ssh_exec "rm -rf MOM-AI MOM-AI-backup"

echo "📁 Creating fresh environment..."
ssh_exec "mkdir -p ~/deployments"
ssh_exec "cd ~/deployments && pwd"

echo "📥 Fresh clone from $BRANCH branch..."
ssh_exec "cd ~/deployments && git clone -b $BRANCH --single-branch $REPO_URL MOM-AI-fresh"

echo "🔧 Installing dependencies with clean slate..."
ssh_exec "cd ~/deployments/MOM-AI-fresh && npm install -g pnpm@latest"
ssh_exec "cd ~/deployments/MOM-AI-fresh && rm -rf node_modules pnpm-lock.yaml"
ssh_exec "cd ~/deployments/MOM-AI-fresh && pnpm install --no-frozen-lockfile"

echo "🏗️ Building applications separately and cleanly..."

# Build web app first in isolation
echo "Building WEB app..."
ssh_exec "cd ~/deployments/MOM-AI-fresh && pnpm --filter @workspace/web build"

# Build widget app second in isolation
echo "Building WIDGET app..."
ssh_exec "cd ~/deployments/MOM-AI-fresh && pnpm --filter @workspace/widget build"

# Verify builds by checking actual page content
echo "🔍 Verifying build outputs..."
ssh_exec "cd ~/deployments/MOM-AI-fresh && find apps/web -name 'page-*.js' -exec grep -l 'HeroGeometric\|AI-Powered' {} \; | head -3"
ssh_exec "cd ~/deployments/MOM-AI-fresh && find apps/widget -name 'page-*.js' -exec grep -l 'WidgetView\|Hi there' {} \; | head -3"

echo "📋 Creating fresh ecosystem config..."
cat > /tmp/ecosystem.fresh.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mom-web',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/deployments/MOM-AI-fresh/apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '0.0.0.0'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/ubuntu/logs/web-error.log',
      out_file: '/home/ubuntu/logs/web-out.log',
      log_file: '/home/ubuntu/logs/web-combined.log'
    },
    {
      name: 'mom-widget',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/deployments/MOM-AI-fresh/apps/widget',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOSTNAME: '0.0.0.0'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/ubuntu/logs/widget-error.log',
      out_file: '/home/ubuntu/logs/widget-out.log',
      log_file: '/home/ubuntu/logs/widget-combined.log'
    }
  ]
}
EOF

scp_file "/tmp/ecosystem.fresh.config.js" "~/deployments/MOM-AI-fresh/ecosystem.config.js"

echo "📁 Creating log directory..."
ssh_exec "mkdir -p ~/logs"

echo "🚀 Starting fresh applications..."
ssh_exec "cd ~/deployments/MOM-AI-fresh && pm2 start ecosystem.config.js"

echo "⏳ Waiting for applications to start..."
sleep 10

echo "🔍 Testing local ports..."
ssh_exec "curl -s http://localhost:3001 | grep -o 'HeroGeometric\|AI-Powered\|Hi there' | head -3"
ssh_exec "curl -s http://localhost:3002 | grep -o 'WidgetView\|Hi there' | head -3"

echo "✅ Fresh deployment completed!"
echo "🌐 Test the domain: https://momdigital.in"
echo "📊 Check PM2 status: pm2 status"