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

const pwaConfig =  withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

export default pwaConfig(nextConfig);
