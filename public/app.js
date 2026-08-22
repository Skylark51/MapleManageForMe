const SYMBOL_DB = [
  ['아케인','소멸의 여로',200,20,40,8],
  ['아케인','츄츄 아일랜드',210,20,40,10],
  ['아케인','레헬른',220,20,40,12],
  ['아케인','아르카나',225,20,40,14],
  ['아케인','모라스',230,20,40,16],
  ['아케인','에스페라',235,20,40,18],
  ['그란디스','세르니움',260,11,30,13.2],
  ['그란디스','호텔 아르크스',265,11,15,15],
  ['그란디스','오디움',270,11,15,16.8],
  ['그란디스','도원경',275,11,15,18.6],
  ['그란디스','아르테리아',280,11,15,20.4],
  ['그란디스','카르시온',285,11,15,22.2],
  ['그란디스','탈라하트',290,11,15,39.8],
  ['그란디스','기어드락',295,11,15,48.8]
].map(([type,region,unlock,maxLevel,daily,base]) => ({type,region,unlock,maxLevel,daily,base}));

const DAILY_EXP = [
  [200,732132258],[210,2141658246],[220,3189098250],[225,3305187639],[230,4398266165],[235,4530843954],
  [240,8397548775],[245,9057690000],[250,10225741680],[260,16455682080],[265,19372782409],[270,23246151120],
  [275,32127015480],[280,38593455264],[285,45635222880],[290,89730912960],[295,105641078400]
];

const MP_DB = [
  [200,'소멸의 여로',359915080],[210,'츄츄 아일랜드',1285078680],[220,'레헬른',3217660990],[225,'아르카나',4707573370],
  [230,'모라스',5993511040],[235,'에스페라',6919667370],[240,'셀라스',8712814920],[245,'문브릿지',11716616500],
  [250,'고통의 미궁',14058901000],[255,'리멘',15552557400],[260,'세르니움',37474604460],[265,'호텔 아르크스',44435446300],
  [270,'오디움',52818835200],[275,'도원경',76639838000],[280,'아르테리아',107204032000],[285,'카르시온',156017856000],
  [290,'탈라하트',218575316000]
].map(([level,region,exp]) => ({level,region,exp}));

const EXP_TABLE = {
  200:2207026470,201:2471869646,202:2768494003,203:3100713283,204:3472798876,205:3889534741,206:4356278909,207:4879032378,208:5464516263,209:6120258214,
  210:7344309856,211:8152183940,212:9048924173,213:10044305832,214:11149179473,215:13379015367,216:14583126750,217:15895608157,218:17326212891,219:18885572051,
  220:22662686461,221:24249074513,222:25946509728,223:27762765408,224:29706158986,225:35647390783,226:38142708137,227:40812697706,228:43669586545,229:46726457603,
  230:56071749123,231:57753901596,232:59486518643,233:61271114202,234:63109247628,235:75731097153,236:78003030067,237:80343120969,238:82753414598,239:85236017035,
  240:102283220442,241:105351717055,242:108512268566,243:111767636622,244:115120665720,245:138144798864,246:142289142829,247:146557817113,248:150954551626,249:155483188174,
  250:186579825808,251:192177220582,252:197942537199,253:203880813314,254:209997237713,255:216297154844,256:222786069489,257:229469651573,258:236353741120,259:243444353353,
  260:1731919984062,261:1749239183902,262:1766731575741,263:1784398891498,264:1802242880412,265:2342915744535,266:2366344901980,267:2390008350999,268:2413908434508,269:2438047518853,
  270:5412465491853,271:5466590146771,272:5521256048238,273:5576468608720,274:5632233294807,275:11377111255510,276:12514822381061,277:13766304619167,278:15142935081083,279:16657228589191,
  280:33647601750165,281:37012361925181,282:40713598117699,283:44784957929468,284:49263453722414,285:99512176519276,286:109463394171203,287:120409733588323,288:132450706947155,289:145695777641870,
  290:294305470836577,291:323736017920234,292:356109619712257,293:391720581683482,294:430892639851830,295:870403132500696,296:957443445750765,297:1053187790325840,298:1158506569358420,299:1737759854037630
};

const BOSS_DB = [
  ['카오스 자쿰',8080000],['카오스 블러디퀸',8140000],['카오스 반반',8150000],['카오스 피에르',8170000],['하드 매그너스',8560000],['카오스 벨룸',9280000],
  ['카오스 파풀라투스',13100000],['노멀 스우',16700000],['노멀 데미안',17500000],['노멀 가디언 엔젤 슬라임',25500000],['이지 루시드',29800000],['이지 윌',32300000],
  ['노멀 루시드',35600000],['노멀 윌',41100000],['노멀 더스크',44000000],['노멀 듄켈',47500000],['하드 데미안',48900000],['하드 스우',51500000],
  ['하드 루시드',62900000],['카오스 더스크',69800000],['노멀 진 힐라',71200000],['카오스 가디언 엔젤 슬라임',75100000],['하드 윌',77100000],['하드 듄켈',94400000],
  ['하드 진 힐라',106000000],['노멀 선택받은 세렌',239000000],['이지 감시자 칼로스',280000000],['이지 최초의 대적자',308000000],['이지 카링',377000000],['노멀 감시자 칼로스',505000000]
].map(([name,price]) => ({name,price}));

const SEED = {
  activeWorld: 'account2',
  worlds: {
    account1: { name: '계정 1', characters: [] },
    account2: { name: '계정 2', characters: [
      { name:'매화적매도', targetLevel:275, mpRuns:0, dailyExpEnabled:true, bossCap:'이지 루시드' },
      { name:'ElMolca', targetLevel:270, mpRuns:0, dailyExpEnabled:true, bossCap:'이지 루시드' },
      { name:'이노듀블v', targetLevel:265, mpRuns:14, dailyExpEnabled:true, bossCap:'이지 루시드', manualExpRate:77.3 },
      { name:'AshKaiSage', targetLevel:265, mpRuns:0, dailyExpEnabled:true, bossCap:'카오스 벨룸' },
      { name:'DeHabitacion', targetLevel:265, mpRuns:0, dailyExpEnabled:true, bossCap:'카오스 벨룸' }
    ]}
  }
};

const STORAGE_KEY = 'maple-personal-manager-v1';
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];

function deepClone(x) { return JSON.parse(JSON.stringify(x)); }
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(SEED);
    const parsed = JSON.parse(raw);
    if (!parsed?.worlds) return deepClone(SEED);
    return parsed;
  } catch { return deepClone(SEED); }
}
let state = loadState();
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function fmt(n) {
  if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return '-';
  return Math.round(Number(n)).toLocaleString('ko-KR');
}
function fmtMeso(n) { return n == null ? '-' : `${fmt(n)} 메소`; }
function fmtWeeks(n) {
  if (!Number.isFinite(n)) return '-';
  const weeks = n;
  if (weeks < 8) return `${weeks.toFixed(1)}주`;
  const days = Math.ceil(weeks * 7);
  const months = days / 30.4375;
  if (months < 24) return `${weeks.toFixed(1)}주 · 약 ${months.toFixed(1)}개월`;
  return `${weeks.toFixed(1)}주 · 약 ${(months/12).toFixed(1)}년`;
}
function escapeHtml(s='') { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function currentWorld() { return state.worlds[state.activeWorld]; }
function getBossSelection(capName) {
  const cap = BOSS_DB.find(b => b.name === capName);
  if (!cap) return [];
  return BOSS_DB.filter(b => b.price <= cap.price).sort((a,b)=>b.price-a.price).slice(0,12);
}
function bossTotal(ch) { return getBossSelection(ch.bossCap).reduce((a,b)=>a+b.price,0); }

function getMp(level) {
  let result = null;
  for (const row of MP_DB) if (level >= row.level) result = row;
  return result;
}
function dailyExpAtLevel(level) {
  return DAILY_EXP.filter(([unlock]) => level >= unlock).reduce((sum,[,exp]) => sum + exp, 0);
}
function mpDailyAverage(level, runsPerWeek) {
  const mp = getMp(level);
  if (!mp || !runsPerWeek) return 0;
  return mp.exp * runsPerWeek * 15 / 98;
}
function calculateLevelEta(level, expRate, target, dailyEnabled, mpRuns) {
  level = Number(level); target = Number(target); expRate = Number(expRate || 0);
  if (!level || !target || target <= level) return target === level ? 0 : null;
  if (level < 200 || target > 300) return null;
  let days = 0;
  for (let lv=level; lv<target; lv++) {
    const req = EXP_TABLE[lv];
    if (!req) return null;
    const remain = req * (lv === level ? Math.max(0, 1-expRate/100) : 1);
    const perDay = (dailyEnabled ? dailyExpAtLevel(lv) : 0) + mpDailyAverage(lv, mpRuns);
    if (perDay <= 0) return Infinity;
    days += remain / perDay;
  }
  return days;
}

function symbolRegionFromName(name='') {
  const n = name.replace(/^어센틱심볼\s*:\s*/,'').replace(/^아케인심볼\s*:\s*/,'').replace(/^그랜드 어센틱심볼\s*:\s*/,'').trim();
  const aliases = {'아르크스':'호텔 아르크스'};
  return aliases[n] || n;
}
function reqAtLevel(type, lv) { return type === '아케인' ? lv*lv + 11 : 9*lv*lv + 20*lv; }
function costAtLevel(db, lv) {
  if (db.type === '아케인') return 10000 * Math.trunc((lv*lv+11) * (db.base + 0.1*lv));
  return 100000 * Math.trunc((9*lv*lv+20*lv) * (db.base - 0.6*lv));
}
function symbolCalc(db, apiSymbol) {
  if (!apiSymbol) return null;
  const level = Number(apiSymbol.symbol_level || 0);
  const growth = Number(apiSymbol.symbol_growth_count || 0);
  if (!level) return null;
  if (level >= db.maxLevel) return { level, growth, remainingSymbols:0, days:0, mesos:0, max:true };
  let totalNeed = 0, mesos = 0;
  for (let lv=level; lv<db.maxLevel; lv++) {
    totalNeed += reqAtLevel(db.type, lv);
    mesos += costAtLevel(db, lv);
  }
  const remainingSymbols = Math.max(0, totalNeed-growth);
  return { level, growth, remainingSymbols, days:Math.ceil(remainingSymbols/db.daily), mesos, max:false };
}
function getSymbolMap(ch) {
  const map = new Map();
  for (const s of ch.api?.symbols || []) {
    map.set(symbolRegionFromName(s.symbol_name), s);
  }
  return map;
}
function symbolSummary(ch) {
  const level = Number(ch.api?.basic?.character_level || ch.cachedLevel || 0);
  const map = getSymbolMap(ch);
  const out = { arcaneMesos:0, grandisMesos:0, arcaneDays:0, grandisDays:0, missingArcane:false, missingGrandis:false };
  for (const db of SYMBOL_DB) {
    if (level < db.unlock) continue;
    const calc = symbolCalc(db, map.get(db.region));
    if (!calc) {
      if (db.type === '아케인') out.missingArcane = true; else out.missingGrandis = true;
      continue;
    }
    if (db.type === '아케인') {
      out.arcaneMesos += calc.mesos; out.arcaneDays = Math.max(out.arcaneDays, calc.days);
    } else {
      out.grandisMesos += calc.mesos; out.grandisDays = Math.max(out.grandisDays, calc.days);
    }
  }
  return out;
}

function characterExpRate(ch) {
  const api = Number(ch.api?.basic?.character_exp_rate);
  if (Number.isFinite(api)) return api;
  const manual = Number(ch.manualExpRate);
  return Number.isFinite(manual) ? manual : 0;
}
function characterLevel(ch) { return Number(ch.api?.basic?.character_level || ch.cachedLevel || 0); }

async function apiFetchCharacter(ch) {
  const res = await fetch(`/api/character?name=${encodeURIComponent(ch.name)}`, { cache:'no-store' });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'API 조회 실패');
  ch.api = body;
  ch.cachedLevel = Number(body.basic?.character_level || ch.cachedLevel || 0);
  if (body.basic?.character_exp_rate !== undefined) ch.manualExpRate = Number(body.basic.character_exp_rate);
  if (!ch.targetLevel || ch.targetLevel < ch.cachedLevel) ch.targetLevel = ch.cachedLevel;
  ch.apiError = null;
  saveState();
  return body;
}

function avatarUrl(raw) {
  if (!raw) return '';
  try {
    const u = new URL(raw);
    u.searchParams.set('action','A00.1');
    u.searchParams.set('emotion','E00');
    u.searchParams.set('width','220');
    u.searchParams.set('height','220');
    return u.toString();
  } catch { return raw; }
}

function renderWorldTabs() {
  const root = $('#worldTabs'); root.innerHTML = '';
  Object.entries(state.worlds).forEach(([id,w]) => {
    const b = document.createElement('button');
    b.className = `world-tab ${state.activeWorld===id?'active':''}`;
    b.textContent = w.name;
    b.onclick = () => { state.activeWorld=id; saveState(); render(); };
    root.appendChild(b);
  });
}

function worldStats(world) {
  const chars = world.characters;
  const allCrystals = chars.flatMap(ch => getBossSelection(ch.bossCap).map(b=>b.price)).sort((a,b)=>b-a);
  const top90 = allCrystals.slice(0,90);
  const mp = chars.reduce((s,ch)=>s+Number(ch.mpRuns||0),0);
  const symbolMesos = chars.reduce((s,ch)=>{ const x=symbolSummary(ch); return s+x.arcaneMesos+x.grandisMesos; },0);
  return { count:chars.length, crystalCount:allCrystals.length, crystalMeso:top90.reduce((a,b)=>a+b,0), excluded:Math.max(0,allCrystals.length-90), mp, symbolMesos };
}
function renderSummary() {
  const s = worldStats(currentWorld());
  $('#worldSummary').innerHTML = [
    ['등록 캐릭터', `${s.count}명`],
    ['결정석', `${Math.min(s.crystalCount,90)}/90개`],
    ['월드 결정석(상위90)', fmtMeso(s.crystalMeso)],
    ['몬파 무료 배정', `${s.mp}/14회${s.mp>14?' · 초과':''}`],
    ['전체 심볼 잔여비', fmtMeso(s.symbolMesos)]
  ].map(([k,v])=>`<div class="summary-card"><span>${k}</span><b>${v}</b></div>`).join('');
}

function bossOptions(selected='') {
  return `<option value="">미설정</option>` + BOSS_DB.map(b=>`<option value="${escapeHtml(b.name)}" ${selected===b.name?'selected':''}>${escapeHtml(b.name)} · ${fmt(b.price)}</option>`).join('');
}

function renderSymbols(ch, root) {
  const level = characterLevel(ch);
  const map = getSymbolMap(ch);
  const summary = symbolSummary(ch);
  const weeklyBoss = bossTotal(ch);
  const arcWeeks = weeklyBoss > 0 ? summary.arcaneMesos / weeklyBoss : Infinity;
  const graWeeks = weeklyBoss > 0 ? summary.grandisMesos / weeklyBoss : Infinity;
  $('.symbol-summary', root).innerHTML = `
    <div class="summary-box"><span>아케인 잔여비</span><b>${summary.missingArcane?'API 확인 필요':fmtMeso(summary.arcaneMesos)}</b></div>
    <div class="summary-box"><span>아케인 · 현재 주보 기준</span><b>${summary.missingArcane?'-':fmtWeeks(arcWeeks)}</b></div>
    <div class="summary-box"><span>그란디스 잔여비</span><b>${summary.missingGrandis?'API 확인 필요':fmtMeso(summary.grandisMesos)}</b></div>
    <div class="summary-box"><span>그란디스 · 현재 주보 기준</span><b>${summary.missingGrandis?'-':fmtWeeks(graWeeks)}</b></div>`;

  const groups = [
    ['아케인리버', SYMBOL_DB.filter(x=>x.type==='아케인')],
    ['그란디스', SYMBOL_DB.filter(x=>x.type!=='아케인')]
  ];
  $('.symbol-groups', root).innerHTML = groups.map(([title, rows]) => {
    const body = rows.filter(db => level >= db.unlock).map(db => {
      const apiSymbol = map.get(db.region);
      const calc = symbolCalc(db, apiSymbol);
      if (!apiSymbol) return `<div class="symbol-row"><div class="symbol-name"><b>${db.region}</b></div><span>-</span><span>API 미조회</span><span class="hide-mobile">-</span><span class="hide-mobile">-</span></div>`;
      const req = apiSymbol.symbol_require_growth_count;
      return `<div class="symbol-row">
        <div class="symbol-name">${apiSymbol.symbol_icon?`<img src="${escapeHtml(apiSymbol.symbol_icon)}" alt="">`:''}<b>${db.region}</b></div>
        <span class="symbol-level">Lv.${calc.level}</span>
        <span>${fmt(calc.growth)}${req?` / ${fmt(req)}`:''}</span>
        <span class="hide-mobile">${calc.days}일</span>
        <span class="hide-mobile">${fmtMeso(calc.mesos)}</span>
      </div>`;
    }).join('');
    return `<div class="symbol-group"><h5>${title}</h5>${body || '<div class="symbol-row"><div class="symbol-name"><b>미해금</b></div></div>'}</div>`;
  }).join('');
}

function renderCharacter(ch, idx) {
  const tpl = $('#characterTemplate').content.cloneNode(true);
  const card = $('.character-card', tpl);
  const level = characterLevel(ch);
  const expRate = characterExpRate(ch);
  const basic = ch.api?.basic || {};
  $('.character-name', card).textContent = ch.name;
  $('.character-meta', card).textContent = level ? `${basic.character_class || ''} · Lv.${level} · ${basic.world_name || ''}` : 'API 갱신 필요';
  $('.combat-power', card).textContent = ch.api?.combatPower ? `전투력 ${Number(ch.api.combatPower).toLocaleString('ko-KR')}` : '';
  $('.api-time', card).textContent = ch.api?.fetchedAt ? `갱신 ${new Date(ch.api.fetchedAt).toLocaleString('ko-KR')}` : (ch.apiError || '');
  if (ch.apiError) $('.api-time', card).classList.add('error');
  const img = $('.character-image', card);
  const src = avatarUrl(basic.character_image);
  if (src) { img.src = src; img.style.display='block'; } else img.style.display='none';

  $('.level-badge', card).textContent = level ? `Lv.${level} · ${expRate.toFixed(3)}%` : '미조회';
  $('.exp-fill', card).style.width = `${Math.max(0,Math.min(100,expRate))}%`;
  $('.current-exp', card).value = expRate || '';
  $('.target-level', card).value = ch.targetLevel || (level || '');
  $('.mp-runs', card).value = ch.mpRuns ?? 0;
  $('.daily-exp-enabled', card).checked = ch.dailyExpEnabled !== false;
  $('.task-daily', card).checked = Boolean(ch.tasks?.daily);
  $('.task-mp', card).checked = Boolean(ch.tasks?.mp);
  $('.task-boss', card).checked = Boolean(ch.tasks?.boss);
  $('.boss-cap', card).innerHTML = bossOptions(ch.bossCap);

  const eta = calculateLevelEta(level, expRate, Number(ch.targetLevel || level), ch.dailyExpEnabled !== false, Number(ch.mpRuns||0));
  const mp = getMp(level);
  const dailyExp = ch.dailyExpEnabled !== false ? dailyExpAtLevel(level) : 0;
  $('.level-metrics', card).innerHTML = `
    <div class="metric"><span>일퀘 EXP/일</span><b>${fmt(dailyExp)}</b></div>
    <div class="metric"><span>몬파</span><b>${mp?`${mp.region} · ${fmt(mp.exp)}`:'-'}</b></div>
    <div class="metric"><span>목표까지</span><b>${eta===Infinity?'루틴 없음':eta==null?'-':`${eta.toFixed(1)}일`}</b></div>
    <div class="metric"><span>예상 달성일</span><b>${Number.isFinite(eta)?new Date(Date.now()+Math.ceil(eta)*86400000).toLocaleDateString('ko-KR'):'-'}</b></div>`;

  const selected = getBossSelection(ch.bossCap);
  const total = selected.reduce((s,b)=>s+b.price,0);
  $('.boss-metrics', card).innerHTML = `
    <div class="metric"><span>결정석 개수</span><b>${selected.length}/12</b></div>
    <div class="metric"><span>캐릭 주간 결정석</span><b>${fmtMeso(total)}</b></div>`;
  $('.boss-list', card).textContent = selected.map(b=>b.name).join(' · ') || '주간보스 상한을 선택하세요.';
  renderSymbols(ch, card);

  $('.refresh-character', card).onclick = async () => {
    const btn = $('.refresh-character', card); btn.disabled=true; btn.textContent='조회 중';
    try { await apiFetchCharacter(ch); } catch (e) { ch.apiError=e.message; saveState(); }
    btn.disabled=false; render();
  };
  $('.remove-character', card).onclick = () => {
    if (!confirm(`${ch.name} 캐릭터를 관리 목록에서 삭제할까요?`)) return;
    currentWorld().characters.splice(idx,1); saveState(); render();
  };
  $('.current-exp', card).onchange = e => { ch.manualExpRate=Number(e.target.value||0); saveState(); render(); };
  $('.target-level', card).onchange = e => { ch.targetLevel=Number(e.target.value||0); saveState(); render(); };
  $('.mp-runs', card).onchange = e => { ch.mpRuns=Math.max(0,Math.min(14,Number(e.target.value||0))); saveState(); render(); };
  $('.daily-exp-enabled', card).onchange = e => { ch.dailyExpEnabled=e.target.checked; saveState(); render(); };
  $('.boss-cap', card).onchange = e => { ch.bossCap=e.target.value; saveState(); render(); };
  for (const [sel,key] of [['.task-daily','daily'],['.task-mp','mp'],['.task-boss','boss']]) {
    $(sel, card).onchange = e => { ch.tasks ||= {}; ch.tasks[key]=e.target.checked; saveState(); };
  }
  return tpl;
}

function renderCharacters() {
  const list = $('#characterList'); list.innerHTML='';
  const chars = currentWorld().characters;
  if (!chars.length) { list.innerHTML='<div class="empty">등록된 캐릭터가 없습니다. 캐릭터명을 추가하세요.</div>'; return; }
  chars.forEach((ch,i) => list.appendChild(renderCharacter(ch,i)));
}

function render() {
  renderWorldTabs();
  renderSummary();
  $('#worldTitle').textContent = currentWorld().name;
  renderCharacters();
}

async function refreshAll() {
  const btn = $('#refreshAllBtn'); btn.disabled=true; btn.textContent='전체 갱신 중';
  for (const ch of currentWorld().characters) {
    try { await apiFetchCharacter(ch); } catch (e) { ch.apiError=e.message; saveState(); }
    render();
  }
  btn.disabled=false; btn.textContent='전체 API 갱신';
}

$('#addCharacterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = $('#characterNameInput');
  const name = input.value.trim();
  if (!name) return;
  if (currentWorld().characters.some(c=>c.name===name)) { alert('이미 등록된 캐릭터입니다.'); return; }
  const ch = { name, targetLevel:0, mpRuns:0, dailyExpEnabled:true, bossCap:'' };
  currentWorld().characters.push(ch); saveState(); input.value=''; render();
  try { await apiFetchCharacter(ch); } catch (err) { ch.apiError=err.message; saveState(); }
  render();
});
$('#refreshAllBtn').onclick = refreshAll;

(async function health() {
  try {
    const res = await fetch('/api/health', {cache:'no-store'}); const x = await res.json();
    const chip = $('#apiStatus');
    chip.textContent = x.apiKeyConfigured ? 'API Key 설정됨' : 'API Key 필요';
    chip.classList.add(x.apiKeyConfigured ? 'good' : 'warn');
  } catch { $('#apiStatus').textContent='서버 확인 필요'; }
})();

render();
