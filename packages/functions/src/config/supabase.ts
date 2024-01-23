import { createClient } from '@supabase/supabase-js';
import environment from './environment';

const supabase = createClient(environment.supabaseUrl, environment.supabasePublicKey);

export default supabase;
