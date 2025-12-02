#!/bin/bash

# Quick deployment script - web app only
set -e

EC2_IP="3.111.199.28"
EC2_USER="ubuntu"
LOCAL_DIR="/Users/sanket/Documents/CHATBOT-MOM"

echo "🚀 Quick deployment of web app to $EC2_IP"

# Build only web app
echo "[STEP] Building web application..."
cd "$LOCAL_DIR"
pnpm build --filter=web

# Create deployment package (web app only)
echo "[STEP] Creating web deployment package..."
tar -czf web-deploy.tar.gz \
    apps/web/.next \
    apps/web/package.json \
    apps/web/next.config.mjs \
    ecosystem.config.js \
    package.json \
    pnpm-lock.yaml

# Transfer to server
echo "[STEP] Transferring to server..."
scp web-deploy.tar.gz $EC2_USER@$EC2_IP:/home/ubuntu/

# Deploy on server
echo "[STEP] Deploying on server..."
ssh $EC2_USER@$EC2_IP << 'EOF'
    cd /home/ubuntu/mom-ai
    
    echo "Stopping web-app..."
    pm2 stop web-app || true
    
    echo "Backing up current web app..."
    mv apps/web/.next apps/web/.next.backup.$(date +%s) 2>/dev/null || true
    
    echo "Extracting new build..."
    cd /home/ubuntu
    tar -xzf web-deploy.tar.gz
    
    echo "Moving new files..."
    cp -r apps/web/.next /home/ubuntu/mom-ai/apps/web/
    cp ecosystem.config.js /home/ubuntu/mom-ai/
    
    echo "Restarting web-app..."
    cd /home/ubuntu/mom-ai
    pm2 start web-app
    pm2 status
    
    echo "Testing web app..."
    sleep 3
    curl -I http://localhost:3000 | head -1
    
    echo "Cleanup..."
    rm /home/ubuntu/web-deploy.tar.gz
EOF

echo "✅ Web app deployment complete!"
echo "🌐 Visit: https://momdigital.in"