type CONFIG = {
  iconServerURL: string | undefined;
  isDevelopment: boolean;
  isBscEnabled: boolean;
  isEvmosEnabled: boolean;
  isMoonbeamEnabled: boolean;
  isPolygonEnabled: boolean;
  isArbitrumEnabled: boolean;
  isFantomEnabled: boolean;
  isTestnetEnabled: boolean;
  allowedAddresses: string[];
  productDomain: string | undefined;
  productUrl: string | undefined;
  supabaseUrl: string;
  supabasePublicKey: string;
  supabasePluginTableName: string;
  supabasePluginRewardsTableName: string;
  hidePools56: string[];
  hidePools97: string[];
  hidePools137: string[];
};

const config: CONFIG = {
  iconServerURL: process.env.ICON_SERVER,
  isDevelopment: process.env.NODE_ENV === 'development',
  isBscEnabled: process.env.BSC === 'true',
  isEvmosEnabled: process.env.EVMOS === 'true',
  isMoonbeamEnabled: process.env.MOONBEAM === 'true',
  isPolygonEnabled: process.env.POLYGON === 'true',
  isArbitrumEnabled: process.env.ARBITRUM === 'true',
  isFantomEnabled: process.env.FANTOM === 'true',
  isTestnetEnabled: process.env.NEXT_PUBLIC_SHOW_TESTNETS === 'true',
  allowedAddresses: process.env.FEATURE_CREATE_POOL
    ? process.env.FEATURE_CREATE_POOL.toLowerCase().split(',')
    : [],
  productDomain: process.env.PRODUCT_DOMAIN,
  productUrl: process.env.PRODUCT_URL,
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublicKey: process.env.SUPABASE_KEY ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabasePluginRewardsTableName: process.env.SUPABASE_PLUGIN_REWARDS_TABLE_NAME ?? '',
  hidePools56: process.env.HIDE_POOLS_56 ? process.env.HIDE_POOLS_56.split(',') : [],
  hidePools97: process.env.HIDE_POOLS_97 ? process.env.HIDE_POOLS_97.split(',') : [],
  hidePools137: process.env.HIDE_POOLS_137 ? process.env.HIDE_POOLS_137.split(',') : [],
};

export { config };
