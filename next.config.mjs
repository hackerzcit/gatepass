// next.config.mjs
import withPWA from 'next-pwa';

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

// cacheOnFrontEndNav: cache RSC payloads when using client-side nav so Events/Payments/Winners work offline after visit.
// For "close app and reopen offline" to load from cache/IndexedDB: use production build (pnpm build && pnpm start).
// Dev uses NetworkOnly for non-start URLs so the app shell is not cached; production uses NetworkFirst for same-origin.
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  fallbacks: {
    document: '/~offline',
  },
});

export default pwaConfig(nextConfig);
