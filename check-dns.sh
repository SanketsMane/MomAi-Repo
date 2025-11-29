#!/bin/bash

echo "🌐 Checking DNS propagation for MOM AI domains..."
echo "================================================"
echo ""

echo "📋 Main domain:"
echo -n "momdigital.in → "
dig +short A momdigital.in || echo "Not resolved"

echo -n "www.momdigital.in → "  
dig +short A www.momdigital.in || echo "Not resolved"

echo -n "widget.momdigital.in → "
dig +short A widget.momdigital.in || echo "Not resolved"

echo ""
echo "🎯 Expected IP: 15.206.174.14"
echo ""

echo "🧪 Testing HTTP connectivity:"
echo -n "http://momdigital.in → "
curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://momdigital.in/ || echo "Connection failed"

echo ""
echo -n "http://www.momdigital.in → "
curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://www.momdigital.in/ || echo "Connection failed"

echo ""  
echo -n "http://widget.momdigital.in → "
curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://widget.momdigital.in/ || echo "Connection failed"

echo ""
echo ""
echo "✅ If all domains show '15.206.174.14' and return HTTP 200/301, DNS is ready!"
echo "🔒 Next step: Run SSL certificate setup"