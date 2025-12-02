#!/bin/bash

# Fix Convex configuration and redeploy
set -e

echo "🔧 Fixing Convex configuration and redeploying..."

# Check current Convex configuration
echo "[CHECK] Current Convex URLs in production environment:"
grep -r "CONVEX_URL" apps/web/.env.production apps/widget/.env.production 2>/dev/null || true

echo ""
echo "[INFO] Production Convex deployment URL: https://pleasant-antelope-42.convex.cloud"

# Ensure backend is pointing to production
echo "[STEP] Setting backend to production..."
cd packages/backend

# Check current deployment
echo "Current backend deployment:"
npx convex env ls 2>/dev/null || echo "No environment variables set"

# Set production deployment if not already set
echo "Setting up production deployment..."
export CONVEX_DEPLOYMENT=pleasant-antelope-42
echo "pleasant-antelope-42" > .convex/deployment_name

# Deploy to ensure latest functions are on production
echo "[STEP] Deploying latest functions to production..."
npx convex deploy --prod

echo "✅ Convex configuration fixed!"
echo ""
echo "📝 Next steps:"
echo "1. The Convex backend is now properly configured for production"
echo "2. Try accessing https://momdigital.in/dashboard again"
echo "3. The server errors should be resolved"

cd ../..
echo ""
echo "🌐 Test URL: https://momdigital.in/dashboard"