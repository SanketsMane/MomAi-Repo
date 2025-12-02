#!/bin/bash

# SSH Connection and Static Assets Fix Script
# Run this script to fix the Next.js chunk loading errors

echo "🔧 Fixing Next.js Static Assets on Server"
echo "========================================="

SERVER_IP="3.111.199.28"
SERVER_USER="ubuntu"

echo ""
echo "STEP 1: Testing SSH Connection..."

# Test SSH connection
if ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    echo "✅ SSH connection successful!"
    
    echo ""
    echo "STEP 2: Connecting to server and fixing assets..."
    
    ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "📍 Connected to server: $(hostname)"
        echo "📂 Current directory: $(pwd)"
        
        echo ""
        echo "🛑 Stopping PM2 processes..."
        cd /home/ubuntu/mom-ai
        pm2 stop web-app widget-app
        
        echo ""
        echo "🧹 Cleaning old build files..."
        rm -rf apps/web/.next
        rm -rf apps/widget/.next
        
        echo ""
        echo "📦 Installing dependencies..."
        pnpm install
        
        echo ""
        echo "🔨 Building applications..."
        pnpm build
        
        echo ""
        echo "🚀 Restarting applications..."
        pm2 restart web-app widget-app
        
        echo ""
        echo "📊 Checking PM2 status..."
        pm2 status
        
        echo ""
        echo "🌐 Testing web app..."
        curl -I http://localhost:3000 | head -1
        
        echo ""
        echo "✅ Deployment complete!"
EOF
    
    echo ""
    echo "🎉 SUCCESS! Static assets have been fixed."
    echo "🌐 Test URL: https://momdigital.in/dashboard"
    
else
    echo "❌ SSH connection failed!"
    echo ""
    echo "🔑 SSH KEY SETUP REQUIRED:"
    echo "1. You need to add your SSH key to the server"
    echo "2. Or create a new SSH key pair"
    echo ""
    echo "📋 MANUAL STEPS:"
    echo "If you have access to AWS Console:"
    echo "1. Go to EC2 → Instances"
    echo "2. Select your instance (3.111.199.28)"
    echo "3. Click 'Connect' → 'Session Manager'"
    echo "4. Run these commands:"
    echo ""
    echo "   cd /home/ubuntu/mom-ai"
    echo "   sudo pm2 stop web-app widget-app"
    echo "   sudo rm -rf apps/web/.next apps/widget/.next"
    echo "   sudo -u ubuntu pnpm build"
    echo "   sudo pm2 restart web-app widget-app"
    echo ""
    echo "🔗 ALTERNATIVE:"
    echo "Restart the entire EC2 instance from AWS Console"
fi