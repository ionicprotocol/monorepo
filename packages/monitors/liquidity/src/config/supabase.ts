import { createClient } from "@supabase/supabase-js";

import { baseConfig } from "./variables";

export const getSupabaseClient = () => {
  return createClient(baseConfig.supabaseUrl, baseConfig.supabasePublicKey);
};
