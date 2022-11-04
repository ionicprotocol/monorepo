import { createClient } from "@supabase/supabase-js";

import { getConfig } from "./getter";

export const getSupabaseClient = () => {
  const config = getConfig();
  return createClient(config.supabaseUrl, config.supabasePublicKey);
};
