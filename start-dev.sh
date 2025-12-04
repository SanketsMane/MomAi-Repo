#!/bin/bash

# MOM AI Development Server Startup Script
# Ensures both web and widget servers run together

echo "🚀 Starting MOM AI Development Servers..."
echo "📱 Web App will run on: http://localhost:3001"
echo "🔧 Widget will run on: http://localhost:3002"
echo ""

# Kill any existing processes on these ports
echo "🔄 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Start both servers with proper error handling
echo "▶️  Starting servers..."
pnpm install && pnpm run dev:all

echo "✅ Servers started successfully!"
echo "📱 Web: http://localhost:3001/dashboard"
echo "🔧 Widget: http://localhost:3002/?organizationId=org_35xstxe4NTEdHiQPj5ZRo3P0y03"