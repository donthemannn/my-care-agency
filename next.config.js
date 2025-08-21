/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/login/:path*',
        destination: '/sign-in/:path*'
      }
    ]
  }
}

module.exports = nextConfig
