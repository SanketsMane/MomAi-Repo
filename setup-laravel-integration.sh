#!/bin/bash

# MOM AI Widget - Laravel Integration Setup Script
# Run this script to set up Laravel integration with MOM AI Widget

echo "🚀 MOM AI Widget Laravel Integration Setup"
echo "=========================================="

# Function to add hosts entry
setup_hosts() {
    echo ""
    echo "📝 Setting up hosts file for local.momdigital.in..."
    
    # Check if entry already exists
    if grep -q "local.momdigital.in" /etc/hosts; then
        echo "✅ local.momdigital.in already in hosts file"
    else
        echo "Adding local.momdigital.in to hosts file (requires sudo)..."
        echo '127.0.0.1 local.momdigital.in' | sudo tee -a /etc/hosts
        echo "✅ Added local.momdigital.in to hosts file"
    fi
}

# Function to start Laravel server
start_laravel() {
    echo ""
    echo "🚀 Starting Laravel development server..."
    echo "Make sure you're in your Laravel project directory!"
    echo ""
    echo "Run this command in your Laravel project:"
    echo "php artisan serve --host=127.0.0.1 --port=8000"
    echo ""
    echo "Then access your site at: http://local.momdigital.in:8000"
}

# Function to install ngrok (alternative method)
setup_ngrok() {
    echo ""
    echo "🌐 Alternative: ngrok tunnel setup"
    echo "================================="
    
    # Check if ngrok is installed
    if command -v ngrok &> /dev/null; then
        echo "✅ ngrok is already installed"
    else
        echo "Installing ngrok..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install ngrok
            else
                echo "❌ Homebrew not found. Please install ngrok manually from https://ngrok.com/download"
                return 1
            fi
        else
            echo "Please install ngrok manually from https://ngrok.com/download"
            return 1
        fi
    fi
    
    echo ""
    echo "To use ngrok:"
    echo "1. Start Laravel: php artisan serve --host=127.0.0.1 --port=8000"
    echo "2. In new terminal: ngrok http 8000"
    echo "3. Use the https://xxxxx.ngrok.io URL provided"
}

# Function to verify setup
verify_setup() {
    echo ""
    echo "🔍 Verification Steps"
    echo "===================="
    echo ""
    echo "1. Check widget CSP headers:"
    echo "   curl -I https://widget.momdigital.in/ | grep 'Content-Security-Policy'"
    echo ""
    echo "2. Test your Laravel site:"
    echo "   - Hosts method: http://local.momdigital.in:8000"
    echo "   - ngrok method: Use the ngrok URL"
    echo ""
    echo "3. Check browser console:"
    echo "   - No CSP errors"
    echo "   - Widget loads successfully"
    echo "   - No CORS font errors"
}

# Main menu
echo ""
echo "Choose setup method:"
echo "1) Hosts file method (Recommended)"
echo "2) ngrok tunnel method"
echo "3) Both methods"
echo "4) Just show verification steps"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        setup_hosts
        start_laravel
        verify_setup
        ;;
    2)
        setup_ngrok
        verify_setup
        ;;
    3)
        setup_hosts
        setup_ngrok
        start_laravel
        verify_setup
        ;;
    4)
        verify_setup
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        ;;
esac

echo ""
echo "📖 For detailed integration code, check: laravel-integration-guide.md"
echo "🎉 Happy coding with MOM AI Widget!"