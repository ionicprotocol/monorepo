import doetenv from 'dotenv';
doetenv.config();

const config = {
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublicKey: process.env.SUPABASE_KEY ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabaseNativePricesTableName: process.env.SUPABASE_NATIVE_PRICES_TABLE_NAME ?? '',
  supabaseFlywheelTableName: process.env.SUPABASE_FLYWHEEL_TABLE_NAME ?? '',
  functionsAlertWebHookUrl: process.env.FUNCTIONS_ALERT_WEBHOOK_URL ?? '',
};

export default config;
