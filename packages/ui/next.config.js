/** @type {import('next').NextConfig} */

nextConfig = {
  reactStrictMode: true,
  env: {
    BSC: process.env.BSC,
    EVMOS: process.env.EVMOS,
    MOONBEAM: process.env.MOONBEAM,
    POLYGON: process.env.POLYGON,
    ARBITRUM: process.env.ARBITRUM,
    NEXT_PUBLIC_SHOW_TESTNETS: process.env.NEXT_PUBLIC_SHOW_TESTNETS,
    ICON_SERVER: process.env.ICON_SERVER,
    FEATURE_RSS: process.env.FEATURE_RSS,
    FEATURE_CREATE_POOL: process.env.FEATURE_CREATE_POOL,
    PRODUCT_DOMAIN: process.env.PRODUCT_DOMAIN,
    PRODUCT_URL: process.env.PRODUCT_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    SUPABASE_PLUGIN_TABLE_NAME: process.env.SUPABASE_PLUGIN_TABLE_NAME,
    SUPABASE_FLYWHEEL_TABLE_NAME: process.env.SUPABASE_FLYWHEEL_TABLE_NAME,
    SUPABASE_NATIVE_PRICES_TABLE_NAME: process.env.SUPABASE_NATIVE_PRICES_TABLE_NAME,
    HIDE_POOLS_56: process.env.HIDE_POOLS_56,
    HIDE_POOLS_97: process.env.HIDE_POOLS_97,
  },
};

module.exports = nextConfig;
