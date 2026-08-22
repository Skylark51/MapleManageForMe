import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, 'public');

function loadEnv(file = '.env.local') {
  const envPath = path.join(__dirname, file);
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
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
const REQUEST_TIMEOUT_MS = 10000;

function hasApiKey() {
  const key = String(process.env.NEXON_API_KEY || '').trim();
  return Boolean(key && key !== 'put_your_api_key_here' && key !== '발급받은_키');
}

function json(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  res.end(JSON.stringify(payload));
}

async function nexon(pathname) {
  if (!hasApiKey()) {
    const error = new Error('NEXON_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
    error.status = 503;
    throw error;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${pathname}`, {
      headers: { 'x-nxopen-api-key': process.env.NEXON_API_KEY },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch (cause) {
    const error = new Error(cause?.name === 'TimeoutError' ? 'NEXON API 응답 시간이 초과되었습니다.' : 'NEXON API에 연결하지 못했습니다.');
    error.status = 502;
    error.cause = cause;
    throw error;
  }

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text };
  }

  if (!response.ok) {
    const error = new Error(body?.error?.message || body?.message || `NEXON API 오류 (${response.status})`);
    error.status = response.status;
    error.detail = body;
    throw error;
  }
  return body;
}

async function optionalNexon(pathname, label, fallback) {
  try {
    return { ok: true, data: await nexon(pathname), warning: null };
  } catch (error) {
    return { ok: false, data: fallback, warning: `${label} 조회 실패` };
  }
}

function getCombatPower(stat) {
  const rows = stat?.final_stat;
  if (!Array.isArray(rows)) return null;
  const found = rows.find((row) => row?.stat_name === '전투력');
  const numeric = Number(String(found?.stat_value ?? '').replaceAll(',', ''));
  return Number.isFinite(numeric) ? numeric : null;
}

function validCharacterName(name) {
  return typeof name === 'string' && name.length >= 2 && name.length <= 20 && !/[\u0000-\u001f/\\]/.test(name);
}

async function handleCharacter(reqUrl, res) {
  const name = (reqUrl.searchParams.get('name') || '').trim();
  if (!validCharacterName(name)) return json(res, 400, { error: '올바른 캐릭터명을 입력하세요.' });

  try {
    const id = await nexon(`/id?character_name=${encodeURIComponent(name)}`);
    const ocid = id.ocid;
    if (!ocid) return json(res, 404, { error: '캐릭터 식별자(ocid)를 찾지 못했습니다.' });

    const basic = await nexon(`/character/basic?ocid=${encodeURIComponent(ocid)}`);
    const [symbolsResult, statResult] = await Promise.all([
      optionalNexon(`/character/symbol-equipment?ocid=${encodeURIComponent(ocid)}`, '심볼', { symbol: [] }),
      optionalNexon(`/character/stat?ocid=${encodeURIComponent(ocid)}`, '전투력', { final_stat: [] })
    ]);

    const warnings = [symbolsResult.warning, statResult.warning].filter(Boolean);
    return json(res, 200, {
      fetchedAt: new Date().toISOString(),
      ocid,
      basic,
      symbols: Array.isArray(symbolsResult.data?.symbol) ? symbolsResult.data.symbol : [],
      combatPower: statResult.ok ? getCombatPower(statResult.data) : null,
      availability: {
        basic: true,
        symbols: symbolsResult.ok,
        stat: statResult.ok
      },
      warnings
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
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function serveStatic(urlPath, res) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  const relativePath = decoded.replace(/^\/+/, '');
  const fullPath = path.resolve(publicDir, relativePath);
  if (fullPath !== publicDir && !fullPath.startsWith(`${publicDir}${path.sep}`)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(fullPath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const extension = path.extname(fullPath).toLowerCase();
    res.writeHead(200, {
      'content-type': MIME[extension] || 'application/octet-stream',
      'cache-control': extension === '.html' ? 'no-cache' : 'public, max-age=3600',
      'x-content-type-options': 'nosniff'
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && reqUrl.pathname === '/api/health') {
    return json(res, 200, {
      ok: true,
      apiKeyConfigured: hasApiKey(),
      apiBase: 'NEXON MapleStory Open API'
    });
  }
  if (req.method === 'GET' && reqUrl.pathname === '/api/character') {
    return handleCharacter(reqUrl, res);
  }
  if (req.method !== 'GET') {
    res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8', allow: 'GET' });
    res.end('Method Not Allowed');
    return;
  }
  serveStatic(reqUrl.pathname, res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`메할일 개인 관리실: http://127.0.0.1:${PORT}`);
  console.log(hasApiKey() ? 'NEXON API Key: configured' : 'NEXON API Key: NOT configured (.env.local 필요)');
});
