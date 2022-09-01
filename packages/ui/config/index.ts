type CONFIG = {
  isRssScoreEnabled: boolean;
  iconServerURL: string | undefined;
  isDevelopment: boolean;
  isBscEnabled: boolean;
  isEvmosEnabled: boolean;
  isMoonbeamEnabled: boolean;
  isPolygonEnabled: boolean;
  isTestnetEnabled: boolean;
  allowedAddresses: string[];
  productDomain: string | undefined;
  productUrl: string | undefined;
  supabaseUrl: string;
  supabasePublicKey: string;
  supabasePluginTableName: string;
  supabaseFlywheelTableName: string;
  hidePools56: string[];
  hidePools97: string[];
};

const config: CONFIG = {
  isRssScoreEnabled: process.env.FEATURE_RSS === 'true',
  iconServerURL: process.env.ICON_SERVER,
  isDevelopment: process.env.NODE_ENV === 'development',
  isBscEnabled: process.env.BSC === 'true',
  isEvmosEnabled: process.env.EVMOS === 'ture',
  isMoonbeamEnabled: process.env.MOONBEAM === 'true',
  isPolygonEnabled: process.env.POLYGON === 'true',
  isTestnetEnabled: process.env.NEXT_PUBLIC_SHOW_TESTNETS === 'true',
  allowedAddresses: process.env.FEATURE_CREATE_POOL
    ? process.env.FEATURE_CREATE_POOL.toLowerCase().split(',')
    : [],
  productDomain: process.env.PRODUCT_DOMAIN,
  productUrl: process.env.PRODUCT_URL,
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublicKey: process.env.SUPABASE_KEY ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabaseFlywheelTableName: process.env.SUPABASE_FLYWHEEL_TABLE_NAME ?? '',
  hidePools56: process.env.HIDE_POOLS_56 ? process.env.HIDE_POOLS_56.split(',') : [],
  hidePools97: process.env.HIDE_POOLS_97 ? process.env.HIDE_POOLS_97.split(',') : [],
};

export { config };
