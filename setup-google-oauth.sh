#!/bin/bash

# Google OAuth Setup Guide
echo "🔧 Google OAuth Configuration Guide"
echo "===================================="
echo
echo "📋 Step 1: Google Cloud Console Setup"
echo "1. Go to: https://console.cloud.google.com"
echo "2. Create a new project or select existing one"
echo "3. Enable the Google+ API (or People API)"
echo
echo "📋 Step 2: Create OAuth Credentials"
echo "1. Go to: APIs & Services → Credentials"
echo "2. Click: + CREATE CREDENTIALS → OAuth 2.0 Client IDs"
echo "3. Application type: Web application"
echo "4. Name: MOM AI Application"
echo
echo "📋 Step 3: Configure Redirect URIs"
echo "Add these Authorized redirect URIs:"
echo "• https://momdigital.in/api/auth/callback/google"
echo "• https://accounts.clerk.dev/oauth_callback"
echo "• https://clerk.momdigital.in/oauth_callback"
echo
echo "📋 Step 4: Get Your Credentials"
echo "After creation, you'll get:"
echo "• Client ID (starts with numbers, ends with .apps.googleusercontent.com)"
echo "• Client Secret (random string)"
echo
echo "📋 Step 5: Add to Clerk Dashboard"
echo "1. Go to Clerk: User & Authentication → Social connections"
echo "2. Find Google and click Configure"
echo "3. Enter your Client ID and Client Secret"
echo "4. Save the configuration"
echo
echo "🧪 Step 6: Test"
echo "Visit: https://momdigital.in"
echo "Click: Sign Up → Continue with Google"
echo
echo "✅ Common redirect URIs to add:"
echo "https://momdigital.in/api/auth/callback/google"
echo "https://accounts.clerk.dev/oauth_callback"
echo "https://clerk.momdigital.in/oauth_callback"