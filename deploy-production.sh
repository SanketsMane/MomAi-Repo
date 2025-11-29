#!/bin/bash

# Production Deployment Script for MOM AI
# Make sure to run this on your production server (15.206.174.14)

echo "🚀 MOM AI Production Deployment"
echo "================================="

# Set production environment
export NODE_ENV=production

echo "📋 Pre-deployment Checklist:"
echo "✅ Production build completed"
echo "✅ Convex deployed to: https://pleasant-antelope-42.convex.cloud"
echo "✅ Clerk configured for: momdigital.in"
echo "⚠️  Ensure DNS A records point to this server:"
echo "   - momdigital.in → 15.206.174.14"
echo "   - widget.momdigital.in → 15.206.174.14"

echo ""
echo "🔧 Starting deployment..."

# Install dependencies
echo "Installing production dependencies..."
pnpm install --frozen-lockfile

# Build for production
echo "Building applications..."
pnpm build

# Start applications
echo "🚀 Starting applications..."

# Start web app on port 3000
echo "Starting web app on port 3000..."
cd apps/web && nohup pnpm start --port 3000 > ../../../logs/web.log 2>&1 &
WEB_PID=$!
echo "Web app started with PID: $WEB_PID"

# Start widget app on port 4000  
echo "Starting widget app on port 4000..."
cd ../widget && nohup pnpm start --port 4000 > ../../../logs/widget.log 2>&1 &
WIDGET_PID=$!
echo "Widget app started with PID: $WIDGET_PID"

# Save PIDs for later management
cd ../../
mkdir -p logs
echo $WEB_PID > logs/web.pid
echo $WIDGET_PID > logs/widget.pid

echo ""
echo "✅ Deployment completed!"
echo "🌐 Web app: https://momdigital.in"
echo "🔧 Widget: https://widget.momdigital.in"
echo ""
echo "📊 Monitor logs:"
echo "   Web: tail -f logs/web.log"
echo "   Widget: tail -f logs/widget.log"
echo ""
echo "🛑 Stop services:"
echo "   kill \$(cat logs/web.pid)"
echo "   kill \$(cat logs/widget.pid)"