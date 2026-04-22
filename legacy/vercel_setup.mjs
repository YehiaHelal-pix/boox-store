// vercel_setup.mjs
// Adds env vars to Vercel project via REST API, then deploys via CLI

import { execSync } from 'child_process';
import https from 'https';

// ── CONFIG ────────────────────────────────────────────────────────────────────
const VERCEL_TOKEN = process.env.VERCEL_TOKEN; // pass via env
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
// ─────────────────────────────────────────────────────────────────────────────

function vercelPath() {
  // Try global vercel first
  try { execSync('vercel --version', { stdio: 'ignore' }); return 'vercel'; } catch {}
  return 'npx vercel';
}

async function getProjectInfo() {
  try {
    const raw = execSync(`${vercelPath()} ls --token ${VERCEL_TOKEN} 2>&1`, {
      cwd: process.cwd(), encoding: 'utf8'
    });
    console.log('Vercel ls output:\n', raw.slice(0, 500));
  } catch (e) {
    console.log('ls error (ok):', e.message.slice(0, 200));
  }

  // Read .vercel/project.json
  try {
    const proj = JSON.parse(
      (await import('fs')).readFileSync('.vercel/project.json', 'utf8')
    );
    return proj;
  } catch {}
  return null;
}

async function readProjectJson() {
  const { readFileSync } = await import('fs');
  try {
    return JSON.parse(readFileSync('.vercel/project.json', 'utf8'));
  } catch {
    return null;
  }
}

function apiRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.vercel.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
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
  if (!VERCEL_TOKEN) {
    console.error('❌ Set VERCEL_TOKEN env var before running this script');
    process.exit(1);
  }

  // Get project info
  const proj = await readProjectJson();
  if (!proj) {
    console.error('❌ .vercel/project.json not found. Run "vercel link" first.');
    process.exit(1);
  }

  const { projectId, orgId } = proj;
  console.log(`✅ Project: ${projectId}, Org: ${orgId}`);

  // Delete existing env vars first (to avoid duplicates)
  console.log('\n── Removing existing env vars (if any) ──');
  for (const ev of ENV_VARS) {
    const list = await apiRequest('GET', `/v9/projects/${projectId}/env?teamId=${orgId}`, null, VERCEL_TOKEN);
    if (list.body?.envs) {
      const existing = list.body.envs.filter(e => e.key === ev.key);
      for (const e of existing) {
        const del = await apiRequest('DELETE', `/v9/projects/${projectId}/env/${e.id}?teamId=${orgId}`, null, VERCEL_TOKEN);
        console.log(`  Deleted ${ev.key} (${e.id}): ${del.status}`);
      }
    }
  }

  // Add env vars
  console.log('\n── Adding env vars ──');
  for (const ev of ENV_VARS) {
    const res = await apiRequest('POST', `/v10/projects/${projectId}/env?teamId=${orgId}`, ev, VERCEL_TOKEN);
    if (res.status === 200 || res.status === 201) {
      console.log(`  ✅ ${ev.key} → ${ev.target.join(', ')}`);
    } else {
      console.log(`  ⚠️  ${ev.key}: ${res.status}`, JSON.stringify(res.body).slice(0, 200));
    }
  }

  // Deploy
  console.log('\n── Deploying to production ──');
  try {
    const output = execSync(
      `npx vercel --prod --yes --token ${VERCEL_TOKEN}`,
      { cwd: process.cwd(), encoding: 'utf8', stdio: 'pipe' }
    );
    console.log(output);
  } catch (e) {
    console.log(e.stdout || '');
    console.error(e.stderr || e.message);
  }
}

main().catch(console.error);
