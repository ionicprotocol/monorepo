import doetenv from 'dotenv';
doetenv.config();

const config = {
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublicKey: process.env.SUPABASE_KEY ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabaseFlywheelTableName: process.env.SUPABASE_FLYWHEEL_TABLE_NAME ?? '',
};

export default config;
