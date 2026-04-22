const https = require('https');
const { execSync } = require('child_process');

const TOKEN = 'vca_57DEBDjBhjcPIORFAB5GlyJ6VrYeuhgXf3INmoxSVj2eUbgasT1EZWGl';
const PROJECT_ID = 'prj_Rr5Ik0IGaUDydzK0wYjc8QSBAGWf';
const TEAM_ID = 'team_g0HxEd5OD4PQ2cmS2NoMNbAB';

const ENV_VARS = [
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcm9ucGlub2F2eG5seHFqd29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTcyMTA0NSwiZXhwIjoyMDkxMjk3MDQ1fQ.tskJ6HACPCUD9kD0J0l-JAtilb9xjUDfHG63oQKLY14',
    target: ['production', 'preview', 'development'],
    type: 'encrypted',
  },
  {
    key: 'ADMIN_EMAIL',
    value: 'admin@booxstore.com',
    target: ['production', 'preview', 'development'],
    type: 'plain',
  },
  {
    key: 'NEXT_PUBLIC_WHATSAPP',
    value: '201113614021',
    target: ['production', 'preview', 'development'],
    type: 'plain',
  },
];

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.vercel.com',
      path,
      method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
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
  console.log('=== Boox Store Vercel Setup ===\n');

  // Step 1: List existing env vars to remove duplicates
  console.log('Fetching existing env vars...');
  const listRes = await apiRequest('GET', `/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`);
  const existing = listRes.body && listRes.body.envs ? listRes.body.envs : [];
  console.log(`Found ${existing.length} existing env vars`);

  // Step 2: Delete any existing vars with the same keys
  for (const ev of ENV_VARS) {
    const matches = existing.filter(e => e.key === ev.key);
    for (const m of matches) {
      const delRes = await apiRequest('DELETE', `/v9/projects/${PROJECT_ID}/env/${m.id}?teamId=${TEAM_ID}`);
      console.log(`  Deleted existing ${ev.key} [${m.target.join(',') || 'unknown'}]: HTTP ${delRes.status}`);
    }
  }

  // Step 3: Add new env vars
  console.log('\nAdding env vars...');
  for (const ev of ENV_VARS) {
    const res = await apiRequest('POST', `/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`, ev);
    if (res.status === 200 || res.status === 201) {
      console.log(`  ✅ ${ev.key} → [${ev.target.join(', ')}]`);
    } else {
      console.log(`  ⚠️  ${ev.key}: HTTP ${res.status}`, JSON.stringify(res.body).slice(0, 300));
    }
  }

  // Step 4: Deploy to production
  console.log('\n=== Deploying to production ===');
  try {
    const output = execSync(
      'npx vercel --prod --yes --token ' + TOKEN,
      { 
        cwd: 'E:\\Boox Store',
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000,
        env: { ...process.env, PATH: 'C:\\Program Files\\nodejs;' + process.env.PATH }
      }
    );
    console.log(output);
  } catch (e) {
    if (e.stdout) console.log(e.stdout);
    if (e.stderr) console.error(e.stderr);
    if (e.message) console.error('Error:', e.message.slice(0, 500));
  }
}

main().catch(console.error);
