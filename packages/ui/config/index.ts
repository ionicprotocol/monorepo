type CONFIG = {
  allowedAddresses: string[];
  hidePools137: string[];
  hidePools56: string[];
  hidePools97: string[];
  iconServerURL: string | undefined;
  isArbitrumEnabled: boolean;
  isBscEnabled: boolean;
  isDevelopment: boolean;
  isEvmosEnabled: boolean;
  isMoonbeamEnabled: boolean;
  isPolygonEnabled: boolean;
  isTestnetEnabled: boolean;
  logrocketAppId: string | undefined;
  productDomain: string | undefined;
  productUrl: string | undefined;
  supabasePluginRewardsTableName: string;
  supabasePluginTableName: string;
  supabasePublicKey: string;
  supabaseUrl: string;
};

const config: CONFIG = {
  allowedAddresses: process.env.FEATURE_CREATE_POOL
    ? process.env.FEATURE_CREATE_POOL.toLowerCase().split(',')
    : [],

  hidePools137: process.env.HIDE_POOLS_137 ? process.env.HIDE_POOLS_137.split(',') : [],
  hidePools56: process.env.HIDE_POOLS_56 ? process.env.HIDE_POOLS_56.split(',') : [],
  hidePools97: process.env.HIDE_POOLS_97 ? process.env.HIDE_POOLS_97.split(',') : [],
  iconServerURL: process.env.ICON_SERVER,
  isArbitrumEnabled: process.env.ARBITRUM === 'true',
  isBscEnabled: process.env.BSC === 'true',
  isDevelopment: process.env.NODE_ENV === 'development',
  isEvmosEnabled: process.env.EVMOS === 'true',
  isMoonbeamEnabled: process.env.MOONBEAM === 'true',
  isPolygonEnabled: process.env.POLYGON === 'true',
  isTestnetEnabled: process.env.NEXT_PUBLIC_SHOW_TESTNETS === 'true',
  logrocketAppId: process.env.LOGROCKET_APP_ID,
  productDomain: process.env.PRODUCT_DOMAIN,
  productUrl: process.env.PRODUCT_URL,
  supabasePluginRewardsTableName: process.env.SUPABASE_PLUGIN_REWARDS_TABLE_NAME ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabasePublicKey: process.env.SUPABASE_KEY ?? '',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
};

export { config };
