#!/bin/bash

# Clerk Configuration Automation Script
# This script helps configure Clerk settings

echo "🔧 Clerk Configuration Helper"
echo "================================"
echo

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 STEP: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Current deployment info
DEPLOYMENT_IP="3.111.199.28"
CURRENT_ENV_FILE="/home/ubuntu/mom-ai/.env"

print_step "Current Deployment Information"
echo "🌐 IP Address: $DEPLOYMENT_IP"
echo "🔗 Application URL: http://$DEPLOYMENT_IP"
echo "📁 Environment File: $CURRENT_ENV_FILE"
echo

print_step "Clerk Configuration Requirements"
echo "1. 🏠 Add allowed domains in Clerk Dashboard"
echo "2. 🔑 Configure OAuth providers (Google, etc.)"
echo "3. 🎫 Get production API keys"
echo "4. 🔄 Update environment variables"
echo

print_step "Manual Configuration Steps"
echo
echo "1️⃣  DOMAINS CONFIGURATION:"
echo "   • Go to: https://dashboard.clerk.com"
echo "   • Navigate: Configure → Domains"
echo "   • Add these domains:"
echo "     - http://$DEPLOYMENT_IP"
echo "     - http://$DEPLOYMENT_IP:3000"
echo "     - http://localhost:3000 (for development)"
echo

echo "2️⃣  OAUTH CONFIGURATION (Google):"
echo "   • In Clerk: User & Authentication → Social Connections"
echo "   • Enable Google OAuth"
echo "   • Get Google credentials from: https://console.cloud.google.com"
echo "   • Add redirect URI: http://$DEPLOYMENT_IP/api/auth/callback/google"
echo

echo "3️⃣  API KEYS:"
echo "   • In Clerk: Configure → API Keys"
echo "   • Copy Publishable Key: pk_test_... or pk_live_..."
echo "   • Copy Secret Key: sk_test_... or sk_live_..."
echo

print_step "Environment Variables Update"
echo "After getting the keys, update the server environment:"
echo
echo "ssh -i '/Users/sanket/Downloads/mom-aiserver-ec2-1.pem' ubuntu@$DEPLOYMENT_IP << 'EOF'"
echo "cd /home/ubuntu/mom-ai"
echo "# Update .env with your actual keys:"
echo "sed -i 's/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_new_key/' .env"
echo "sed -i 's/CLERK_SECRET_KEY=.*/CLERK_SECRET_KEY=your_new_secret/' .env"
echo "pm2 restart all --update-env"
echo "EOF"
echo

print_step "Quick Test Commands"
echo "# Test current application:"
echo "curl -I http://$DEPLOYMENT_IP"
echo
echo "# Check PM2 status:"
echo "ssh -i '/Users/sanket/Downloads/mom-aiserver-ec2-1.pem' ubuntu@$DEPLOYMENT_IP 'pm2 status'"
echo

print_step "Alternative: Use Clerk Management API"
read -p "Do you have your Clerk secret key to use API configuration? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your Clerk secret key (sk_test_... or sk_live_...): " CLERK_KEY
    
    if [[ $CLERK_KEY == sk_* ]]; then
        print_success "Attempting to configure Clerk via API..."
        
        # Create temporary Node.js script
        cat > /tmp/clerk-api-config.js << EOF
const CLERK_SECRET_KEY = '$CLERK_KEY';
const BASE_URL = 'https://api.clerk.dev/v1';

async function configureClerK() {
    try {
        console.log('🔄 Updating Clerk configuration...');
        
        const response = await fetch(\`\${BASE_URL}/instance\`, {
            method: 'PATCH',
            headers: {
                'Authorization': \`Bearer \${CLERK_SECRET_KEY}\`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                allowed_origins: [
                    'http://$DEPLOYMENT_IP',
                    'http://$DEPLOYMENT_IP:3000',
                    'http://localhost:3000'
                ]
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Clerk configuration updated!');
            console.log('📋 Response:', data);
        } else {
            console.log('❌ API Error:', response.status, await response.text());
        }
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

configureClerK();
EOF
        
        # Run the configuration
        if node /tmp/clerk-api-config.js; then
            print_success "API configuration completed!"
        else
            print_error "API configuration failed - use manual dashboard method"
        fi
        
        # Cleanup
        rm -f /tmp/clerk-api-config.js
    else
        print_error "Invalid secret key format. Should start with 'sk_'"
    fi
else
    print_warning "Using manual dashboard configuration method"
fi

print_step "Next Steps"
echo "1. 🔧 Complete Clerk dashboard configuration"
echo "2. 🧪 Test authentication by visiting: http://$DEPLOYMENT_IP"
echo "3. 🔍 Click 'Sign In' or 'Sign Up' to test OAuth flow"
echo "4. 🚀 Deploy to production domain when ready"
echo

print_success "Configuration helper completed!"