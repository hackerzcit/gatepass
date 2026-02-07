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

// Start URL with short network timeout so when PWA is reopened offline we serve from cache quickly
// instead of waiting for the network to fail (which can show "You're offline" before the SW responds).
const startUrlWithTimeout = {
  urlPattern: '/',
  handler: 'NetworkFirst',
  options: {
    cacheName: 'start-url',
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
  },
};

// Same-origin page navigations: 3s timeout so after kill app → open PWA offline we load from cache fast
// (covers /users, /attendance, etc. when PWA opens to last URL; uses same "others" cache as default).
const navigateFastTimeout = {
  urlPattern: ({ request, url }) => {
    if (request.mode !== 'navigate') return false;
    if (url.origin !== self.origin) return false;
    if (url.pathname.startsWith('/api')) return false;
    return true;
  },
  handler: 'NetworkFirst',
  options: {
    cacheName: 'others',
    networkTimeoutSeconds: 3,
    expiration: {
      maxEntries: 32,
      maxAgeSeconds: 24 * 60 * 60,
    },
  },
};

// cacheOnFrontEndNav: cache RSC payloads when using client-side nav so Events/Payments/Winners work offline after visit.
// Dev uses NetworkOnly for non-start URLs; production uses NetworkFirst for same-origin.
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  dynamicStartUrl: false, // we provide start-url rule above with networkTimeoutSeconds
  fallbacks: {
    document: '/~offline',
  },
  runtimeCaching: [startUrlWithTimeout, navigateFastTimeout, ...defaultCache],
});

export default pwaConfig(nextConfig);
