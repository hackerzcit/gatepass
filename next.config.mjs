// next.config.mjs
import withPWA from 'next-pwa';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const defaultCache = require('next-pwa/cache');

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

// 🔥 Navigation: MUST be CacheFirst
const navigationCache = {
  urlPattern: ({ request }) => request.mode === 'navigate',
  handler: 'CacheFirst',
  options: {
    cacheName: 'pages',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60,
    },
  },
};

// 🔥 RSC / Next.js data: MUST be CacheFirst
const rscCache = {
  urlPattern: ({ url, request }) =>
    url.pathname.startsWith('/_next/data/') ||
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1',
  handler: 'CacheFirst',
  options: {
    cacheName: 'next-data',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 24 * 60 * 60,
    },
  },
};

// Static assets (already correct)
const nextStaticCache = {
  urlPattern: ({ url }) => url.pathname.startsWith('/_next/static/'),
  handler: 'CacheFirst',
  options: {
    cacheName: 'next-static',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 365 * 24 * 60 * 60,
    },
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  dynamicStartUrl: false,

  // 🔥 DO NOT define offline document fallback
  // fallbacks: ❌ REMOVED

  ignoreURLParametersMatching: [/.*/],

  runtimeCaching: [
    nextStaticCache,
    navigationCache,
    rscCache,
    ...defaultCache,
  ],
});

export default pwaConfig(nextConfig);

