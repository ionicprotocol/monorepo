/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const { withSentryConfig } = require('@sentry/nextjs');

nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  env: {
    BSC: process.env.BSC,
    EVMOS: process.env.EVMOS,
    MOONBEAM: process.env.MOONBEAM,
    POLYGON: process.env.POLYGON,
    ARBITRUM: process.env.ARBITRUM,
    FANTOM: process.env.FANTOM,
    NEXT_PUBLIC_SHOW_TESTNETS: process.env.NEXT_PUBLIC_SHOW_TESTNETS,
    ICON_SERVER: process.env.ICON_SERVER,
    FEATURE_CREATE_POOL: process.env.FEATURE_CREATE_POOL,
    PRODUCT_DOMAIN: process.env.PRODUCT_DOMAIN,
    PRODUCT_URL: process.env.PRODUCT_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    SUPABASE_PLUGIN_TABLE_NAME: process.env.SUPABASE_PLUGIN_TABLE_NAME,
    SUPABASE_PLUGIN_REWARDS_TABLE_NAME: process.env.SUPABASE_PLUGIN_REWARDS_TABLE_NAME,
    SUPABASE_ASSET_APY_TABLE_NAME: process.env.SUPABASE_ASSET_APY_TABLE_NAME,
    SENTRY_DSN: process.env.SENTRY_DSN,
    IS_SENTRY_ENABLED: process.env.IS_SENTRY_ENABLED,
    FEATURE_DEPLOY_FLYWHEEL: process.env.FEATURE_DEPLOY_FLYWHEEL,
  },
  sentry: {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
  },
};

module.exports = withSentryConfig(withBundleAnalyzer(nextConfig));
