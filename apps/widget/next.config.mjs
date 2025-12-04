/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  output: 'standalone',
  
  // Disable SSR to prevent hydration issues
  experimental: {
    runtime: 'nodejs',
    ssr: false
  },
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    poweredByHeader: false,
    generateEtags: false,
  }),
  
  // Enable React strict mode in production
  reactStrictMode: process.env.NODE_ENV === 'production',
  
  // Suppress searchParams warnings in development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Experimental features
  experimental: {
    // Turbopack configuration
    turbo: {
      // Enable faster builds in development
    },
  },
  
  // Security headers (allowing iframe embedding for widget)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *.momdigital.in https://*.momdigital.in http://*.momdigital.in *.momdigital.io https://*.momdigital.io http://*.momdigital.io http://localhost:* http://127.0.0.1:* https://*.ngrok.io http://*.ngrok.io https://*.ngrok-free.app"
          },
          // CORS headers for API endpoints
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods', 
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
          }
          // Note: Removed X-Frame-Options to allow iframe embedding from trusted origins
        ]
      },
      // Specific CORS headers for static assets (fonts, images, etc.)
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers', 
            value: 'Content-Type, Range'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // CORS for font files specifically
      {
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

export default nextConfig
