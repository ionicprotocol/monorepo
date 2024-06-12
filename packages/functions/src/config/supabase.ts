import { createClient } from '@supabase/supabase-js';
import environment from './environment';

const supabase = createClient(environment.supabaseUrl, environment.supabasePublicKey);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Key exists' : 'Key not found');
export default supabase;
