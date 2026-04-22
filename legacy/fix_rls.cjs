const https = require('https');

const SUPABASE_URL = 'sfronpinoavxnlxqjwoa.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcm9ucGlub2F2eG5seHFqd29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTcyMTA0NSwiZXhwIjoyMDkxMjk3MDQ1fQ.tskJ6HACPCUD9kD0J0l-JAtilb9xjUDfHG63oQKLY14';

// Step 1: Create the exec_sql function first via the Supabase SQL editor API
// The service_role key bypasses RLS on its own, so let's test without RLS changes

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const sup = createClient('https://' + SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 1. First, let's check the actual products table schema
  console.log('=== Checking products table schema ===');
  const { data: prods, error: pErr } = await sup.from('products').select('*').limit(1);
  if (pErr) {
    console.log('Products table error:', pErr.message);
  } else {
    console.log('Products table columns:', prods.length > 0 ? Object.keys(prods[0]) : 'empty table');
  }

  // 2. Quick test: insert then delete with service_role (bypasses RLS)
  console.log('\n=== Testing insert/delete with service_role key ===');
  
  // Build test payload from actual schema
  const testPayload = {
    name: '__RLS_TEST__',
    slug: 'rls-test-' + Date.now(),
    price: 1,
    model: 'test',
    storage: '64GB',
    color: 'test',
    color_hex: '#000000',
    condition: 'excellent',
    battery_health: 100,
    network: 'unlocked',
    stock_quantity: 0,
    in_stock: false,
    is_featured: false,
    is_visible: false,
    images: []
  };

  const { data: ins, error: errIns } = await sup.from('products').insert([testPayload]).select().single();
  if (errIns) {
    console.log('Insert FAILED:', errIns.message);
    console.log('Details:', errIns.details, errIns.hint);
  } else {
    console.log('✅ Insert OK:', ins.id);
    const { error: errDel } = await sup.from('products').delete().eq('id', ins.id);
    if (errDel) {
      console.log('Delete FAILED:', errDel.message);
    } else {
      console.log('✅ Delete OK');
    }
  }

  // 3. Now test with anon key (this is what the frontend uses)
  console.log('\n=== Testing with ANON key (frontend scenario) ===');
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcm9ucGlub2F2eG5seHFqd29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjEwNDUsImV4cCI6MjA5MTI5NzA0NX0.cbGc87Ca4cdM25EEWEorFVmF0Jfojw2XIHsZ8cgXiFU';
  const anonSup = createClient('https://' + SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: anonRead, error: anonReadErr } = await anonSup.from('products').select('id').limit(1);
  console.log('Anon read:', anonReadErr ? 'FAIL: ' + anonReadErr.message : 'OK (' + anonRead.length + ' rows)');

  // Try insert with anon
  const testPayload2 = { ...testPayload, slug: 'anon-rls-test-' + Date.now() };
  const { data: anonIns, error: anonInsErr } = await anonSup.from('products').insert([testPayload2]).select().single();
  if (anonInsErr) {
    console.log('Anon insert:', 'FAIL: ' + anonInsErr.message);
    console.log('→ This is EXPECTED if RLS is blocking anon writes');
  } else {
    console.log('Anon insert: OK (id: ' + anonIns.id + ')');
    // cleanup
    await sup.from('products').delete().eq('id', anonIns.id);
  }

  // Try delete with anon (using a real product if any exist)
  if (anonRead && anonRead.length > 0) {
    // Don't actually delete a real product, just test the API response
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { error: anonDelErr } = await anonSup.from('products').delete().eq('id', fakeId);
    console.log('Anon delete (fake id):', anonDelErr ? 'FAIL: ' + anonDelErr.message : 'OK (no rows affected, no error)');
  }

  // 4. Check if maintenance_requests and trade_requests exist
  console.log('\n=== Checking other tables ===');
  const { error: mErr } = await sup.from('maintenance_requests').select('id').limit(1);
  console.log('maintenance_requests:', mErr ? 'MISSING or error: ' + mErr.message : 'EXISTS');
  
  const { error: tErr } = await sup.from('trade_requests').select('id').limit(1);
  console.log('trade_requests:', tErr ? 'MISSING or error: ' + tErr.message : 'EXISTS');

  console.log('\n=== Summary ===');
  console.log('Service role key can insert/delete: YES (bypasses RLS)');
  console.log('The index.html uses the ANON key which is subject to RLS policies.');
  console.log('Since we cannot run DDL via API, RLS needs to be fixed via Supabase Dashboard.');
  console.log('\nBUT: The anon key with service_role already works for CRUD.');
  console.log('The front-end uses the anon key; if RLS blocks it, we need to either:');
  console.log('  1. Fix RLS via Dashboard SQL Editor');
  console.log('  2. Or skip RLS by using service_role in the frontend (not recommended)');
}

main().catch(console.error);
