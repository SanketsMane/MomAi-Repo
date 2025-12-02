/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  
  // Suppress React DevTools warnings in development
  reactStrictMode: false,
  
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
            value: "frame-ancestors 'self' *.momdigital.in http://localhost:8000 http://127.0.0.1:8000"
          }
          // Note: Removed X-Frame-Options to allow iframe embedding from trusted origins
        ]
      }
    ]
  }
}

export default nextConfig
