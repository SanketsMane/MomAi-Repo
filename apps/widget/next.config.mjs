/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  
  // Suppress React DevTools warnings in development
  reactStrictMode: false,
  
  // Additional experimental flags
  experimental: {
    // Add valid experimental flags here if needed
  },
  
  // Webpack configuration for better stability
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      
      // Additional dev optimizations to reduce warnings
      config.infrastructureLogging = {
        level: 'error',
      }
    }
    return config
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
            value: "frame-ancestors 'self' http://localhost:* https://*.momdigital.io https://*.vercel.app"
          }
          // Note: Removed X-Frame-Options to allow iframe embedding from trusted origins
        ]
      }
    ]
  }
}

export default nextConfig
