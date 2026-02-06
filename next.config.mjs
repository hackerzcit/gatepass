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
// Production build uses default runtimeCaching (NetworkFirst for same-origin pages). Dev build uses NetworkOnly — use `pnpm build` for offline.
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
});

export default pwaConfig(nextConfig);
