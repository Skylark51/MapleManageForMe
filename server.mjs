import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

function loadEnv(file = '.env.local') {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) return;
  for (const raw of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnv();

const API_BASE = 'https://open.api.nexon.com/maplestory/v1';
const PORT = Number(process.env.PORT || 3000);

function json(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

async function nexon(pathname) {
  const key = process.env.NEXON_API_KEY;
  if (!key || key === 'put_your_api_key_here') {
    const err = new Error('NEXON_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
    err.status = 503;
    throw err;
  }
  const response = await fetch(`${API_BASE}${pathname}`, {
    headers: { 'x-nxopen-api-key': key }
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { message: text }; }
  if (!response.ok) {
    const err = new Error(body?.error?.message || body?.message || `NEXON API 오류 (${response.status})`);
    err.status = response.status;
    err.detail = body;
    throw err;
  }
  return body;
}

function getCombatPower(stat) {
  const rows = stat?.final_stat;
  if (!Array.isArray(rows)) return null;
  const found = rows.find((x) => x?.stat_name === '전투력');
  return found?.stat_value ?? null;
}

async function handleCharacter(reqUrl, res) {
  const name = (reqUrl.searchParams.get('name') || '').trim();
  if (!name) return json(res, 400, { error: '캐릭터명을 입력하세요.' });

  try {
    const id = await nexon(`/id?character_name=${encodeURIComponent(name)}`);
    const ocid = id.ocid;
    if (!ocid) return json(res, 404, { error: 'ocid를 찾지 못했습니다.' });

    const [basic, symbols, stat] = await Promise.all([
      nexon(`/character/basic?ocid=${encodeURIComponent(ocid)}`),
      nexon(`/character/symbol-equipment?ocid=${encodeURIComponent(ocid)}`).catch(() => ({ symbol: [] })),
      nexon(`/character/stat?ocid=${encodeURIComponent(ocid)}`).catch(() => ({ final_stat: [] }))
    ]);

    return json(res, 200, {
      fetchedAt: new Date().toISOString(),
      ocid,
      basic,
      symbols: Array.isArray(symbols?.symbol) ? symbols.symbol : [],
      combatPower: getCombatPower(stat)
    });
  } catch (error) {
    return json(res, error.status || 500, {
      error: error.message,
      detail: error.detail || null
    });
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function serveStatic(urlPath, res) {
  let rel = urlPath === '/' ? '/index.html' : urlPath;
  rel = decodeURIComponent(rel.split('?')[0]);
  const full = path.normalize(path.join(publicDir, rel));
  if (!full.startsWith(publicDir)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(full, (err, data) => {
    if (err) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'content-type': MIME[path.extname(full)] || 'application/octet-stream',
      'cache-control': path.extname(full) === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && reqUrl.pathname === '/api/health') {
    return json(res, 200, { ok: true, apiKeyConfigured: Boolean(process.env.NEXON_API_KEY) });
  }
  if (req.method === 'GET' && reqUrl.pathname === '/api/character') {
    return handleCharacter(reqUrl, res);
  }
  if (req.method !== 'GET') {
    res.writeHead(405); res.end('Method Not Allowed'); return;
  }
  serveStatic(reqUrl.pathname, res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`메할일 개인 관리실: http://127.0.0.1:${PORT}`);
  console.log(process.env.NEXON_API_KEY ? 'NEXON API Key: configured' : 'NEXON API Key: NOT configured (.env.local 필요)');
});
