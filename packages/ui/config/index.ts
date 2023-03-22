type CONFIG = {
  allowedAddresses: string[];
  iconServerURL: string | undefined;
  isArbitrumEnabled: boolean;
  isBscEnabled: boolean;
  isDevelopment: boolean;
  isEvmosEnabled: boolean;
  isFWDeployEnabled: boolean;
  isFantomEnabled: boolean;
  isMoonbeamEnabled: boolean;
  isPolygonEnabled: boolean;
  isTestnetEnabled: boolean;
  productDomain: string | undefined;
  productUrl: string | undefined;
  supabaseAssetApyTableName: string;
  supabasePluginRewardsTableName: string;
  supabasePluginTableName: string;
  supabasePublicKey: string;
  supabaseUrl: string;
};

const config: CONFIG = {
  allowedAddresses: process.env.FEATURE_CREATE_POOL
    ? process.env.FEATURE_CREATE_POOL.toLowerCase().split(',')
    : [],
  iconServerURL: process.env.ICON_SERVER,
  isArbitrumEnabled: process.env.ARBITRUM === 'true',
  isBscEnabled: process.env.BSC === 'true',
  isDevelopment: process.env.NODE_ENV === 'development',
  isEvmosEnabled: process.env.EVMOS === 'true',
  isFWDeployEnabled: process.env.FEATURE_DEPLOY_FLYWHEEL === 'true',
  isFantomEnabled: process.env.FANTOM === 'true',
  isMoonbeamEnabled: process.env.MOONBEAM === 'true',
  isPolygonEnabled: process.env.POLYGON === 'true',
  isTestnetEnabled: process.env.NEXT_PUBLIC_SHOW_TESTNETS === 'true',
  productDomain: process.env.PRODUCT_DOMAIN,
  productUrl: process.env.PRODUCT_URL,
  supabaseAssetApyTableName: process.env.SUPABASE_ASSET_APY_TABLE_NAME ?? '',
  supabasePluginRewardsTableName: process.env.SUPABASE_PLUGIN_REWARDS_TABLE_NAME ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabasePublicKey: process.env.SUPABASE_KEY ?? '',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
};

export { config };
