/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self';", 
            },
            {
              key: 'Referrer-Policy',
              value: 'no-referrer',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload', // Enforce HTTPS
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  