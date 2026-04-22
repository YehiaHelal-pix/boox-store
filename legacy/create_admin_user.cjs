const https = require('https');

const SUPABASE_URL = 'https://sfronpinoavxnlxqjwoa.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcm9ucGlub2F2eG5seHFqd29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTcyMTA0NSwiZXhwIjoyMDkxMjk3MDQ1fQ.tskJ6HACPCUD9kD0J0l-JAtilb9xjUDfHG63oQKLY14';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(SUPABASE_URL + path);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(chunks) }); }
        catch { resolve({ status: res.statusCode, body: chunks }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== Creating admin user in Supabase Auth ===\n');

  // First check if user exists
  console.log('Checking if admin@booxstore.com already exists...');
  const listRes = await apiRequest('GET', '/auth/v1/admin/users?per_page=1000');
  
  if (listRes.status === 200) {
    const users = listRes.body.users || [];
    const existing = users.find(u => u.email === 'admin@booxstore.com');
    if (existing) {
      console.log('✅ User already exists!');
      console.log('  ID:', existing.id);
      console.log('  Email:', existing.email);
      console.log('  Confirmed:', existing.email_confirmed_at ? 'Yes' : 'No');
      console.log('  Last sign in:', existing.last_sign_in_at || 'Never');
      return;
    }
    console.log('User not found, creating...\n');
  } else {
    console.log('Could not list users:', listRes.status, JSON.stringify(listRes.body).slice(0, 200));
  }

  // Create user
  const createRes = await apiRequest('POST', '/auth/v1/admin/users', {
    email: 'admin@booxstore.com',
    password: 'Boox@Admin2026',
    email_confirm: true,
  });

  if (createRes.status === 200 || createRes.status === 201) {
    console.log('✅ Admin user created successfully!');
    console.log('  ID:', createRes.body.id);
    console.log('  Email:', createRes.body.email);
    console.log('  Confirmed:', createRes.body.email_confirmed_at ? 'Yes' : 'No');
  } else {
    console.log('❌ Failed to create user:', createRes.status);
    console.log(JSON.stringify(createRes.body, null, 2));
  }
}

main().catch(console.error);
