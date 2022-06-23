/** @type {import('next').NextConfig} */

nextConfig = {
  reactStrictMode: true,
  env: {
    BSC: process.env.BSC,
    EVMOS: process.env.EVMOS,
    MOONBEAM: process.env.MOONBEAM,
    NEXT_PUBLIC_SHOW_TESTNETS: process.env.NEXT_PUBLIC_SHOW_TESTNETS,
    ICON_SERVER: process.env.ICON_SERVER,
    FEATURE_RSS: process.env.FEATURE_RSS,
    FEATURE_CREATE_POOL: process.env.FEATURE_CREATE_POOL
  },
};

module.exports = nextConfig;
