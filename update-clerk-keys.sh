#!/bin/bash

# Quick Clerk Keys Update Script
# Usage: ./update-clerk-keys.sh <publishable_key> <secret_key>

if [ $# -ne 2 ]; then
    echo "Usage: $0 <publishable_key> <secret_key>"
    echo "Example: $0 pk_live_abc123... sk_live_def456..."
    exit 1
fi

PUBLISHABLE_KEY="$1"
SECRET_KEY="$2"
SERVER_IP="3.111.199.28"
SSH_KEY="/Users/sanket/Downloads/mom-aiserver-ec2-1.pem"

echo "🔧 Updating Clerk keys on server..."
echo "📡 Server: $SERVER_IP"
echo "🔑 Publishable Key: ${PUBLISHABLE_KEY:0:20}..."
echo "🗝️  Secret Key: ${SECRET_KEY:0:15}..."

# Update environment variables on server
ssh -i "$SSH_KEY" ubuntu@$SERVER_IP << EOF
cd /home/ubuntu/mom-ai

# Backup current .env
cp .env .env.backup.\$(date +%Y%m%d_%H%M%S)

# Update the keys
sed -i 's/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$PUBLISHABLE_KEY/' .env
sed -i 's/CLERK_SECRET_KEY=.*/CLERK_SECRET_KEY=$SECRET_KEY/' .env

echo "✅ Environment updated!"
echo "📄 Current .env:"
grep -E "(CLERK|NEXT_PUBLIC_CLERK)" .env

echo
echo "🔄 Restarting applications..."
pm2 restart all --update-env
sleep 2
pm2 status
EOF

echo
echo "✅ Clerk keys updated successfully!"
echo "🧪 Test the application: http://$SERVER_IP"