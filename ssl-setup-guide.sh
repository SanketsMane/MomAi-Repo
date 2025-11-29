#!/bin/bash

# SSL Setup Guide for momdigital.in
# This script helps you set up SSL certificates for production

echo "🔒 SSL Certificate Setup Options"
echo "================================="
echo ""

echo "Option 1: Cloudflare (Recommended - Free SSL)"
echo "1. Sign up at https://cloudflare.com"
echo "2. Add your domain: momdigital.in"
echo "3. Update nameservers to Cloudflare's"
echo "4. In Cloudflare DNS, add:"
echo "   - A Record: momdigital.in → 15.206.174.14"
echo "   - A Record: widget.momdigital.in → 15.206.174.14"
echo "5. SSL/TLS → Overview → Set to 'Full (strict)'"
echo "6. SSL will be automatically provisioned"
echo ""

echo "Option 2: Let's Encrypt (Free, requires server access)"
echo "1. Install certbot on your server"
echo "2. Run: sudo certbot --nginx -d momdigital.in -d widget.momdigital.in"
echo "3. Configure auto-renewal"
echo ""

echo "Option 3: Manual SSL Certificate"
echo "1. Purchase SSL certificate from provider"
echo "2. Install on your server/hosting provider"
echo "3. Configure NGINX/Apache to use SSL"
echo ""

echo "🚀 Recommended: Use Cloudflare for easiest setup"