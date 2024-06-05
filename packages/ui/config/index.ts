type CONFIG = {
  allowedAddresses: string[];
  iconServerURL: string | undefined;
  isBaseEnabled: boolean;
  isDevelopment: boolean;
  isFWDeployEnabled: boolean;
  isModeEnabled: boolean;
  isTestnetEnabled: boolean;
  productDomain: string | undefined;
  productUrl: string | undefined;
  supabaseAssetApyTableName: string;
  supabaseAssetPriceTableName: string;
  supabaseAssetTotalApyTableName: string;
  supabaseAssetTvlTableName: string;
  supabasePluginRewardsTableName: string;
  supabasePluginTableName: string;
  supabasePublicKey: string;
  supabaseUrl: string;
  supabaseVaultApyTableName: string;
};

const config: CONFIG = {
  allowedAddresses: process.env.FEATURE_CREATE_POOL
    ? process.env.FEATURE_CREATE_POOL.toLowerCase().split(',')
    : [],
  iconServerURL: process.env.ICON_SERVER,
  isBaseEnabled: true,
  isDevelopment: process.env.NODE_ENV === 'development',
  isFWDeployEnabled: process.env.FEATURE_DEPLOY_FLYWHEEL === 'true',
  isModeEnabled: true,
  isTestnetEnabled: process.env.NEXT_PUBLIC_SHOW_TESTNETS === 'true',
  productDomain: process.env.PRODUCT_DOMAIN,
  productUrl: process.env.PRODUCT_URL,
  supabaseAssetApyTableName: process.env.SUPABASE_ASSET_APY_TABLE_NAME ?? '',
  supabaseAssetPriceTableName:
    process.env.SUPABASE_ASSET_PRICE_TABLE_NAME ?? '',
  supabaseAssetTotalApyTableName:
    process.env.SUPABASE_ASSET_TOTAL_APY_TABLE_NAME ?? '',
  supabaseAssetTvlTableName: process.env.SUPABASE_ASSET_TVL_TABLE_NAME ?? '',
  supabasePluginRewardsTableName:
    process.env.SUPABASE_PLUGIN_REWARDS_TABLE_NAME ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabasePublicKey: process.env.SUPABASE_KEY ?? '',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseVaultApyTableName: process.env.SUPABASE_VAULT_APY_TABLE_NAME ?? ''
};

export { config };
