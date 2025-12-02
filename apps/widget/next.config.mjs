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
            value: "frame-ancestors 'self' http://localhost:* https://*.momdigital.io https://*.vercel.app https://momdigital.in https://*.momdigital.in https://dashboard.momdigital.in https://*.our-custom-client-domains.com"
          }
          // Note: Removed X-Frame-Options to allow iframe embedding from trusted origins
        ]
      }
    ]
  }
}

export default nextConfig
