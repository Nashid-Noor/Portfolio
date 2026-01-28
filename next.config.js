/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features if needed
  experimental: {
    // serverComponentsExternalPackages: ['@modelcontextprotocol/sdk'],
  },
  
  // Optimize for production
  poweredByHeader: false,
  
  // Handle environment variables
  env: {
    PORTFOLIO_BASE_URL: process.env.PORTFOLIO_BASE_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
