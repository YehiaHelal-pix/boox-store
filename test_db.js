require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const sql = `ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'; ALTER TABLE products ADD COLUMN IF NOT EXISTS price_on_inquiry BOOLEAN DEFAULT false;`;
  
  // try various common rpc names for running sql if any exist
  let res = await supabase.rpc('exec_sql', { query: sql });
  console.log('exec_sql:', res.error ? res.error.message : 'success');
  
  res = await supabase.rpc('exec', { sql: sql });
  console.log('exec:', res.error ? res.error.message : 'success');

  res = await supabase.rpc('run_sql', { sql: sql });
  console.log('run_sql:', res.error ? res.error.message : 'success');
}
run();
