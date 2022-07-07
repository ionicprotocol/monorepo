import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const handler: Handler = async (event, context) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'SUPBASE_KEY or SUPABASE_URL not supplied' }),
    };
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { data, error } = await supabase.from('demo-table').insert([{ value: 1234, asset: '554' }]);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
