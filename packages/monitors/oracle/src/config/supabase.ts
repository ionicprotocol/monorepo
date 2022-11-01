import { createClient } from "@supabase/supabase-js";

import { config } from "./getter";

const supabase = createClient(config.supabaseUrl, config.supabasePublicKey);

export default supabase;
