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
  minBorrowUsd: string | undefined;
  supabaseUrl: string;
  supabasePublicKey: string;
  supabasePluginTableName: string;
  supabaseFlywheelTableName: string;
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
  minBorrowUsd: process.env.MIN_BORROW_USD,
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublicKey: process.env.SUPABASE_PUBLIC_KEY ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabaseFlywheelTableName: process.env.SUPABASE_FLYWHEEL_TABLE_NAME ?? '',
};

export { config };
