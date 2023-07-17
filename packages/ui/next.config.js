/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});
const { withSentryConfig } = require('@sentry/nextjs');

nextConfig = {
  env: {
    ARBITRUM: process.env.ARBITRUM,
    BSC: process.env.BSC,
    ETHEREUM: process.env.ETHEREUM,
    EVMOS: process.env.EVMOS,
    FANTOM: process.env.FANTOM,
    FEATURE_CREATE_POOL: process.env.FEATURE_CREATE_POOL,
    FEATURE_DEPLOY_FLYWHEEL: process.env.FEATURE_DEPLOY_FLYWHEEL,
    ICON_SERVER: process.env.ICON_SERVER,
    IS_SENTRY_ENABLED: process.env.IS_SENTRY_ENABLED,
    MOONBEAM: process.env.MOONBEAM,
    NEXT_PUBLIC_SHOW_TESTNETS: process.env.NEXT_PUBLIC_SHOW_TESTNETS,
    POLYGON: process.env.POLYGON,
    PRODUCT_DOMAIN: process.env.PRODUCT_DOMAIN,
    PRODUCT_URL: process.env.PRODUCT_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SUPABASE_ASSET_APY_TABLE_NAME: process.env.SUPABASE_ASSET_APY_TABLE_NAME,
    SUPABASE_ASSET_PRICE_TABLE_NAME: process.env.SUPABASE_ASSET_PRICE_TABLE_NAME,
    SUPABASE_ASSET_TOTAL_APY_TABLE_NAME: process.env.SUPABASE_ASSET_TOTAL_APY_TABLE_NAME,
    SUPABASE_ASSET_TVL_TABLE_NAME: process.env.SUPABASE_ASSET_TVL_TABLE_NAME,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    SUPABASE_PLUGIN_REWARDS_TABLE_NAME: process.env.SUPABASE_PLUGIN_REWARDS_TABLE_NAME,
    SUPABASE_PLUGIN_TABLE_NAME: process.env.SUPABASE_PLUGIN_TABLE_NAME,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_VAULT_APY_TABLE_NAME: process.env.SUPABASE_VAULT_APY_TABLE_NAME,
    WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID
  },
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  sentry: {
    disableClientWebpackPlugin: true,
    disableServerWebpackPlugin: true
  }
};

module.exports = withSentryConfig(withBundleAnalyzer(nextConfig));
