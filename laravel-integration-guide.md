# Laravel Integration Guide for MOM AI Widget

## 🎯 Solution Options

### Option 1: Hosts File Method (Recommended)

#### 1. Add to Hosts File
```bash
# Edit hosts file
sudo nano /etc/hosts

# Add this line:
127.0.0.1 local.momdigital.in
```

#### 2. Start Laravel Server
```bash
cd mom-hr-management-system
php artisan serve --host=127.0.0.1 --port=8000
```

#### 3. Access Laravel
```
http://local.momdigital.in:8000
```

**Why This Works:**
- ✅ `local.momdigital.in` matches CSP `*.momdigital.in` 
- ✅ No frame-ancestors violations
- ✅ Widget embeds successfully

---

### Option 2: ngrok Tunnel Method

#### 1. Install ngrok
```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

#### 2. Start Laravel Server
```bash
php artisan serve --host=127.0.0.1 --port=8000
```

#### 3. Create ngrok Tunnel (New Terminal)
```bash
ngrok http 8000
```

#### 4. Use ngrok URL
```
https://abc123.ngrok.io  # Use the URL provided by ngrok
```

**Why This Works:**
- ✅ ngrok provides external HTTPS domain
- ✅ Widget CSP allows `*.ngrok.io` domains
- ✅ No localhost CSP issues

---

## 🛠️ Laravel Integration Code

### 1. Add to Laravel Layout (resources/views/layouts/app.blade.php)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel + MOM AI</title>
    <!-- Your existing head content -->
</head>
<body>
    <!-- Your Laravel content -->
    
    <!-- MOM AI Widget Integration -->
    <div class="mom-ai-widget-container">
        <!-- Widget will load here -->
    </div>
    
    <!-- MOM AI Widget Script -->
    <script>
    (function() {
        // Widget configuration
        const config = {
            organizationId: '{{ env("MOM_AI_ORGANIZATION_ID", "your-org-id") }}',
            widgetUrl: 'https://widget.momdigital.in/widget.js'
        };
        
        // Create and load widget script
        const script = document.createElement('script');
        script.src = config.widgetUrl;
        script.setAttribute('data-organization-id', config.organizationId);
        script.crossOrigin = 'anonymous';
        
        // Handle load events
        script.onload = function() {
            console.log('✅ MOM AI Widget loaded successfully');
        };
        
        script.onerror = function() {
            console.error('❌ Failed to load MOM AI Widget');
        };
        
        document.body.appendChild(script);
    })();
    </script>
</body>
</html>
```

### 2. Add to Laravel .env

```env
# Add to your .env file
MOM_AI_ORGANIZATION_ID=your-actual-organization-id
MOM_AI_WIDGET_URL=https://widget.momdigital.in/widget.js
```

### 3. Laravel CORS Configuration (config/cors.php)

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'https://widget.momdigital.in',
        'https://*.momdigital.in',
        'http://local.momdigital.in:8000',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
    ],
    
    'allowed_origins_patterns' => [
        '/^https:\/\/.*\.momdigital\.in$/',
        '/^https:\/\/.*\.ngrok\.io$/',
        '/^http:\/\/local\.momdigital\.in:\d+$/',
    ],
    
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

## 🧪 Testing Steps

### Test 1: Hosts File Method
```bash
# 1. Add hosts entry
echo '127.0.0.1 local.momdigital.in' | sudo tee -a /etc/hosts

# 2. Start Laravel
php artisan serve --host=127.0.0.1 --port=8000

# 3. Open browser
open http://local.momdigital.in:8000

# 4. Check console for widget load
# Should see: "✅ MOM AI Widget loaded successfully"
```

### Test 2: ngrok Method
```bash
# 1. Start Laravel
php artisan serve --host=127.0.0.1 --port=8000

# 2. Start ngrok (new terminal)
ngrok http 8000

# 3. Open ngrok URL in browser
# Check console for successful widget load
```

### Test 3: Verify CSP Headers
```bash
# Check widget CSP allows your domain
curl -I https://widget.momdigital.in/ | grep "Content-Security-Policy"

# Should include:
# *.momdigital.in (for local.momdigital.in)
# *.ngrok.io (for ngrok tunnels)
# localhost:* (for direct access)
```

---

## 🔧 Troubleshooting

### Problem: Widget not loading
**Check:**
1. Browser console for CSP errors
2. Network tab for failed requests
3. Widget script URL is accessible

### Problem: CORS font errors
**Solution:**
- Widget server needs proper CORS headers (configured)
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Problem: CSP frame-ancestors error  
**Solution:**
- Use hosts file method: `local.momdigital.in:8000`
- Use ngrok for external domain
- Verify CSP includes your domain pattern

---

## ✅ Final Verification

After setup, you should see:

1. **Laravel loads at correct URL** 
   - `http://local.momdigital.in:8000` (hosts method)
   - `https://xyz.ngrok.io` (tunnel method)

2. **No console errors**
   - No CSP frame-ancestors violations
   - No CORS font loading errors
   - Widget script loads successfully

3. **Widget appears and functions**
   - Widget iframe loads in page
   - Interactive elements work
   - No security warnings

🎉 **Success!** MOM AI Widget should now work seamlessly with your Laravel application.