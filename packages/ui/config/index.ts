type CONFIG = {
  allowedAddresses: string[];
  iconServerURL: string | undefined;
  isArbitrumEnabled: boolean;
  isBscEnabled: boolean;
  isDevelopment: boolean;
  isEthereumEnabled: boolean;
  isFWDeployEnabled: boolean;
  isLineaEnabled: boolean;
  isModeEnabled: boolean;
  isNeonEnabled: boolean;
  isPolygonEnabled: boolean;
  isProduction: boolean;
  isTestnetEnabled: boolean;
  isZkevmEnabled: boolean;
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
  walletConnectProjectId: string;
};

const config: CONFIG = {
  allowedAddresses: process.env.FEATURE_CREATE_POOL
    ? process.env.FEATURE_CREATE_POOL.toLowerCase().split(',')
    : [],
  iconServerURL: process.env.ICON_SERVER,
  isArbitrumEnabled: process.env.ARBITRUM === 'true',
  isBscEnabled: process.env.BSC === 'true',
  isDevelopment: process.env.NODE_ENV === 'development',
  isEthereumEnabled: process.env.ETHEREUM === 'true',
  isFWDeployEnabled: process.env.FEATURE_DEPLOY_FLYWHEEL === 'true',
  isLineaEnabled: process.env.LINEA === 'true',
  isModeEnabled: process.env.MODE_NETWORK === 'true',
  isNeonEnabled: process.env.NEON === 'true',
  isPolygonEnabled: process.env.POLYGON === 'true',
  isProduction: process.env.IS_PRODUCTION === 'true',
  isTestnetEnabled: process.env.NEXT_PUBLIC_SHOW_TESTNETS === 'true',
  isZkevmEnabled: process.env.ZKEVM === 'true',
  productDomain: process.env.PRODUCT_DOMAIN,
  productUrl: process.env.PRODUCT_URL,
  supabaseAssetApyTableName: process.env.SUPABASE_ASSET_APY_TABLE_NAME ?? '',
  supabaseAssetPriceTableName: process.env.SUPABASE_ASSET_PRICE_TABLE_NAME ?? '',
  supabaseAssetTotalApyTableName: process.env.SUPABASE_ASSET_TOTAL_APY_TABLE_NAME ?? '',
  supabaseAssetTvlTableName: process.env.SUPABASE_ASSET_TVL_TABLE_NAME ?? '',
  supabasePluginRewardsTableName: process.env.SUPABASE_PLUGIN_REWARDS_TABLE_NAME ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabasePublicKey: process.env.SUPABASE_KEY ?? '',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseVaultApyTableName: process.env.SUPABASE_VAULT_APY_TABLE_NAME ?? '',
  walletConnectProjectId: process.env.WALLET_CONNECT_PROJECT_ID ?? 'WALLET_CONNECT_PROJECT_ID'
};

export { config };
