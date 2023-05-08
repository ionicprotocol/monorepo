import dotenv from 'dotenv';
dotenv.config();

const environment = {
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublicKey: process.env.SUPABASE_KEY ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabasePluginRewardsTableName: process.env.SUPABASE_PLUGIN_REWARDS_TABLE_NAME ?? '',
  supabaseAssetApyTableName: process.env.SUPABASE_ASSET_APY_TABLE_NAME ?? '',
  functionsAlertWebHookUrl: process.env.WEBHOOK_URL_FUNCTIONS ?? '',
  supabaseVaultApyTableName: process.env.SUPABASE_VAULT_APY_TABLE_NAME ?? '',
  supabaseAssetPriceTableName: process.env.SUPABASE_ASSET_PRICE_TABLE_NAME ?? '',
  supabaseAssetTvlTableName: process.env.SUPABASE_ASSET_TVL_TABLE_NAME ?? '',
  supabaseAssetTotalApyTableName: process.env.SUPABASE_ASSET_TOTAL_APY_TABLE_NAME ?? '',
};

export default environment;
