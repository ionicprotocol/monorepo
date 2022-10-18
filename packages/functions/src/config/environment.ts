import dotenv from 'dotenv';
dotenv.config();

const environment = {
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublicKey: process.env.SUPABASE_KEY ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabaseNativePricesTableName: process.env.SUPABASE_NATIVE_PRICES_TABLE_NAME ?? '',
  supabaseFlywheelTableName: process.env.SUPABASE_FLYWHEEL_TABLE_NAME ?? '',
  functionsAlertWebHookUrl: process.env.DISCORD_WEBHOOK_URL ?? '',
};

export default environment;
