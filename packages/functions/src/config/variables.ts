import doetenv from 'dotenv';
doetenv.config();

const config = {
  chain: parseInt(process.env.SUPPORT_CHAIN ?? '56', 10),
  rpcUrl: process.env.SUPPORT_RPC_URL ?? 'https://bsc-dataseed1.binance.org/',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublicKey: process.env.SUPABASE_PUBLIC_KEY ?? '',
  supabasePluginTableName: process.env.SUPABASE_PLUGIN_TABLE_NAME ?? '',
  supabaseFlywheelTableName: process.env.SUPABASE_FLYWHEEL_TABLE_NAME ?? '',
};

export default config;
