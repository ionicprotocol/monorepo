import { createClient } from "@supabase/supabase-js";

import config from "./variables";

const supabase = createClient(config.supabaseUrl, config.supabasePublicKey);

export default supabase;
