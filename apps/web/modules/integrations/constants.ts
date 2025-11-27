export const INTEGRATIONS = [
  {
    id: "html",
    title: "HTML",
    icon: "/languages/html5.svg",
  },
  {
    id: "react",
    title: "React",
    icon: "/languages/react.svg",
  },
  {
    id: "nextjs",
    title: "Next.js",
    icon: "/languages/nextjs.svg",
  },
  {
    id: "javascript",
    title: "JavaScript",
    icon: "/languages/javascript.svg",
  },
  {
    id: "laravel",
    title: "Laravel",
    icon: "/languages/laravel.svg",
  },
];

export type IntegrationId = (typeof INTEGRATIONS)[number]["id"];

export const HTML_SCRIPT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>
    <!-- Your website content -->
    <h1>Welcome to My Website</h1>
    
    <!-- MOM AI Widget -->
    <script 
        src="http://localhost:3001/widget.js"
        data-organization-id="{{ORGANIZATION_ID}}">
    </script>
</body>
</html>`;

export const REACT_SCRIPT = `import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.src = 'http://localhost:3001/widget.js';
    script.setAttribute('data-organization-id', '{{ORGANIZATION_ID}}');
    
    // Append to body
    document.body.appendChild(script);
    
    // Cleanup function
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="App">
      {/* Your React app content */}
    </div>
  );
}

export default App;`;

export const NEXTJS_SCRIPT = `// pages/_app.js (Pages Router)
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Load MOM AI Widget
    const script = document.createElement('script');
    script.src = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com/widget.js'
      : 'http://localhost:3001/widget.js';
    script.setAttribute('data-organization-id', '{{ORGANIZATION_ID}}');
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[data-organization-id]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;`;

export const JAVASCRIPT_SCRIPT = `// Load MOM AI Widget dynamically
function loadMomAiWidget() {
  // Configuration
  const config = {
    organizationId: '{{ORGANIZATION_ID}}',
    widgetUrl: window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/widget.js'
      : 'https://your-domain.com/widget.js'
  };

  // Create script element
  const script = document.createElement('script');
  script.src = config.widgetUrl;
  script.setAttribute('data-organization-id', config.organizationId);
  
  // Add load handlers
  script.onload = () => {
    console.log('MOM AI Widget loaded successfully!');
  };
  
  script.onerror = () => {
    console.error('Failed to load MOM AI Widget');
  };

  // Append to body
  document.body.appendChild(script);
}

// Load when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadMomAiWidget);
} else {
  loadMomAiWidget();
}`;

export const LARAVEL_SCRIPT = `{{-- Add to your main layout file (resources/views/layouts/app.blade.php) --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Laravel App</title>
</head>
<body>
    <!-- Your content here -->
    
    <!-- MOM AI Widget -->
    <script 
        src="{{ config('services.mom_ai.widget_url') }}"
        data-organization-id="{{ config('services.mom_ai.org_id') }}">
    </script>
</body>
</html>

{{-- Add to config/services.php --}}
'mom_ai' => [
    'widget_url' => env('MOM_AI_WIDGET_URL', 'http://localhost:3001/widget.js'),
    'org_id' => env('MOM_AI_ORG_ID', '{{ORGANIZATION_ID}}'),
],

{{-- Add to your .env file --}}
MOM_AI_WIDGET_URL=http://localhost:3001/widget.js
MOM_AI_ORG_ID={{ORGANIZATION_ID}}`;
