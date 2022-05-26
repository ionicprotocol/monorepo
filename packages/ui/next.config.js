/** @type {import('next').NextConfig} */

nextConfig = {
  reactStrictMode: true,
  env: {
    BSC: process.env.BSC,
    EVMOS: process.env.EVMOS,
    MOONBEAM: process.env.MOONBEAM,
    NEXT_PUBLIC_SHOW_TESTNETS: process.env.NEXT_PUBLIC_SHOW_TESTNETS
  },
};

module.exports = nextConfig;
