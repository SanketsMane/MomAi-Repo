#!/bin/bash

# Simple PM2 restart script for remote server

EC2_IP="3.111.199.28"
EC2_USER="ubuntu"

echo "🔄 Restarting PM2 processes on $EC2_IP"

# Check if we can connect
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $EC2_USER@$EC2_IP exit 2>/dev/null; then
    echo "❌ Cannot connect to server. Please ensure:"
    echo "   1. Your SSH key is configured"  
    echo "   2. Security group allows SSH (port 22)"
    echo "   3. Server is running"
    exit 1
fi

# Restart PM2 processes
ssh $EC2_USER@$EC2_IP << 'EOF'
    cd /home/ubuntu/mom-ai
    echo "Current PM2 status:"
    pm2 status
    
    echo "Restarting applications..."
    pm2 restart web-app widget-app
    
    echo "New PM2 status:"
    pm2 status
    
    echo "Testing web-app response:"
    curl -I http://localhost:3000 | head -1
    
    echo "Testing widget-app response:"
    curl -I http://localhost:3001 | head -1
EOF

echo "✅ PM2 restart complete!"