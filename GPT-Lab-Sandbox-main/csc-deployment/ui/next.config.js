const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable Docker optimization
  experimental: {
    outputFileTracingRoot: undefined,
  },
  webpack: (config) => {
    // Ensure "@" alias works during Docker builds (Linux-case-sensitive env)
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:8080/api/:path*',
      },
    ];
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { 
          key: 'Content-Security-Policy', 
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' http://localhost:8080 http://gptlab-backend:3001 https://gptlab-backend:3001 ws:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'" 
        },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ],
    },
  ],
};

module.exports = nextConfig;



