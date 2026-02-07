// next.config.mjs
import withPWA from 'next-pwa';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const defaultCache = require('next-pwa/cache');

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: true,
};

// Comprehensive navigation caching (includes start URL and all pages)
const navigationCache = {
  urlPattern: ({ request, url }) => {
    if (request.mode !== 'navigate') return false;
    if (url.origin !== self.origin) return false;
    if (url.pathname.startsWith('/api')) return false;
    return true;
  },
  handler: 'NetworkFirst',
  options: {
    cacheName: 'pages',
    networkTimeoutSeconds: 3,
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          if (response && response.type === 'opaqueredirect') {
            return new Response(response.body, {
              status: 200,
              statusText: 'OK',
              headers: response.headers,
            });
          }
          return response;
        },
      },
    ],
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    },
  },
};

// Cache Next.js RSC data payloads
const rscCache = {
  urlPattern: ({ url, request }) => {
    return url.pathname.startsWith('/_next/data/') || 
           request.headers.get('RSC') === '1' ||
           request.headers.get('Next-Router-Prefetch') === '1';
  },
  handler: 'NetworkFirst',
  options: {
    cacheName: 'next-data',
    networkTimeoutSeconds: 3,
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 24 * 60 * 60,
    },
  },
};

// Cache Next.js static files
const nextStaticCache = {
  urlPattern: ({ url }) => url.pathname.startsWith('/_next/static/'),
  handler: 'CacheFirst',
  options: {
    cacheName: 'next-static',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
    },
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  dynamicStartUrl: false,
  disable: process.env.NODE_ENV === 'development', // Disable in dev for easier testing
  fallbacks: {
    document: '/~offline',
  },
  runtimeCaching: [
    nextStaticCache,  // Static assets first (most specific)
    navigationCache,  // Navigation requests
    rscCache,         // RSC data
    ...defaultCache,  // Default cache rules last
  ],
});

export default pwaConfig(nextConfig);