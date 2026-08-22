import {
  SYMBOL_DB,
  BOSS_DB,
  clamp,
  getBossSelection,
  bossTotal,
  calculateWorldCrystalSummary,
  getMp,
  dailyExpAtLevel,
  monsterParkWeeklyExp,
  calculateLevelEta,
  getSymbolMap,
  symbolCalc,
  symbolSummary,
  seoulDateKey,
  seoulWeeklyResetKey
} from './core.js';

const STORAGE_KEY = 'maple-personal-manager-v2';
const LEGACY_STORAGE_KEY = 'maple-personal-manager-v1';
const STATE_VERSION = 2;

const SEED = {
  version: STATE_VERSION,
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

const $ = (selector, root = document) => root.querySelector(selector);

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeCharacter(character) {
  const ch = {
    name: String(character?.name || '').trim(),
    targetLevel: Number(character?.targetLevel || 0),
    mpRuns: clamp(character?.mpRuns, 0, 14),
    dailyExpEnabled: character?.dailyExpEnabled !== false,
    bossCap: String(character?.bossCap || ''),
    manualExpRate: Number(character?.manualExpRate || 0),
    cachedLevel: Number(character?.cachedLevel || 0),
    api: character?.api || null,
    apiError: character?.apiError || null,
    tasks: character?.tasks || {}
  };
  resetTasksIfNeeded(ch);
  return ch;
}

function resetTasksIfNeeded(character) {
  character.tasks ||= {};
  const dailyKey = seoulDateKey();
  const weeklyKey = seoulWeeklyResetKey();
  if (character.tasks.dailyKey !== dailyKey) {
    character.tasks.daily = false;
    character.tasks.mp = false;
    character.tasks.dailyKey = dailyKey;
  }
  if (character.tasks.weeklyKey !== weeklyKey) {
    character.tasks.boss = false;
    character.tasks.weeklyKey = weeklyKey;
  }
}

function normalizeState(raw) {
  const base = deepClone(SEED);
  if (!raw?.worlds) return base;
  base.activeWorld = raw.activeWorld && raw.worlds[raw.activeWorld] ? raw.activeWorld : base.activeWorld;
  for (const [id, fallbackWorld] of Object.entries(base.worlds)) {
    const source = raw.worlds[id];
    if (!source) continue;
    fallbackWorld.name = String(source.name || fallbackWorld.name);
    fallbackWorld.characters = Array.isArray(source.characters)
      ? source.characters.map(normalizeCharacter).filter((ch) => ch.name)
      : [];
  }
  base.version = STATE_VERSION;
  return base;
}

function loadState() {
  for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      return normalizeState(JSON.parse(raw));
    } catch {
    }
  }
  return deepClone(SEED);
}

let state = loadState();

function saveState() {
  state.version = STATE_VERSION;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function fmt(value) {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return '-';
  return Math.round(Number(value)).toLocaleString('ko-KR');
}

function fmtCompact(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '-';
  if (Math.abs(numeric) >= 1e12) return `${(numeric / 1e12).toFixed(2)}조`;
  if (Math.abs(numeric) >= 1e8) return `${(numeric / 1e8).toFixed(2)}억`;
  if (Math.abs(numeric) >= 1e4) return `${(numeric / 1e4).toFixed(1)}만`;
  return fmt(numeric);
}

function fmtMeso(value) {
  return value === null || value === undefined ? '-' : `${fmt(value)} 메소`;
}

function fmtWeeks(value) {
  if (!Number.isFinite(value)) return '-';
  if (value === 0) return '완료';
  const weeks = value;
  const days = Math.ceil(weeks * 7);
  const months = days / 30.4375;
  if (weeks < 8) return `${weeks.toFixed(1)}주`;
  if (months < 24) return `${weeks.toFixed(1)}주 · 약 ${months.toFixed(1)}개월`;
  return `${weeks.toFixed(1)}주 · 약 ${(months / 12).toFixed(1)}년`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[char]));
}

function currentWorld() {
  return state.worlds[state.activeWorld];
}

function characterLevel(character) {
  return Number(character.api?.basic?.character_level || character.cachedLevel || 0);
}

function characterExpRate(character) {
  const apiRate = Number(character.api?.basic?.character_exp_rate);
  if (Number.isFinite(apiRate)) return clamp(apiRate, 0, 100);
  return clamp(character.manualExpRate, 0, 100);
}

function symbolsAvailable(character) {
  if (!character.api) return false;
  if (character.api.availability?.symbols === false) return false;
  return Array.isArray(character.api.symbols);
}

function getCharacterSymbolSummary(character) {
  return symbolSummary(characterLevel(character), character.api?.symbols || [], symbolsAvailable(character));
}

function avatarUrl(raw) {
  if (!raw) return '';
  try {
    const url = new URL(raw);
    url.searchParams.set('action', 'A00.1');
    url.searchParams.set('emotion', 'E00');
    url.searchParams.set('width', '240');
    url.searchParams.set('height', '240');
    return url.toString();
  } catch {
    return raw;
  }
}

async function apiFetchCharacter(character) {
  const response = await fetch(`/api/character?name=${encodeURIComponent(character.name)}`, { cache: 'no-store' });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`서버 응답을 읽지 못했습니다. (${response.status})`);
  }
  if (!response.ok) throw new Error(body.error || `API 조회 실패 (${response.status})`);

  character.api = body;
  character.cachedLevel = Number(body.basic?.character_level || character.cachedLevel || 0);
  const apiExpRate = Number(body.basic?.character_exp_rate);
  if (Number.isFinite(apiExpRate)) character.manualExpRate = apiExpRate;
  if (!character.targetLevel || character.targetLevel < character.cachedLevel) character.targetLevel = character.cachedLevel;
  character.apiError = null;
  saveState();
  return body;
}

function renderWorldTabs() {
  const root = $('#worldTabs');
  root.innerHTML = '';
  Object.entries(state.worlds).forEach(([id, world]) => {
    const button = document.createElement('button');
    button.className = `world-tab ${state.activeWorld === id ? 'active' : ''}`;
    button.type = 'button';
    button.innerHTML = `<span>${escapeHtml(world.name)}</span><small>${world.characters.length}캐릭</small>`;
    button.onclick = () => {
      state.activeWorld = id;
      saveState();
      render();
    };
    root.appendChild(button);
  });
}

function worldStats(world) {
  const crystals = calculateWorldCrystalSummary(world.characters, 90);
  const mpRuns = world.characters.reduce((sum, ch) => sum + clamp(ch.mpRuns, 0, 14), 0);
  let symbolMesos = 0;
  let symbolCharacters = 0;
  for (const ch of world.characters) {
    const summary = getCharacterSymbolSummary(ch);
    if (!summary.available) continue;
    symbolMesos += summary.arcaneMesos + summary.grandisMesos;
    symbolCharacters += 1;
  }
  return { ...crystals, mpRuns, symbolMesos, symbolCharacters, count: world.characters.length };
}

function renderSummary() {
  const stats = worldStats(currentWorld());
  const cards = [
    ['관리 캐릭터', `${stats.count}명`, '계정 내 등록 캐릭터'],
    ['결정석', `${stats.soldCount}/90개`, stats.excludedCount ? `저가 ${stats.excludedCount}개 제외` : '월드 상위 90개 기준'],
    ['주간 결정석', fmtMeso(stats.mesos), '선택된 주보 기준'],
    ['몬파 무료 배정', `${stats.mpRuns}/14회`, stats.mpRuns > 14 ? `월드 기준 ${stats.mpRuns - 14}회 초과` : '월드 기본 무료분 기준'],
    ['심볼 잔여비', stats.symbolCharacters ? fmtMeso(stats.symbolMesos) : '-', stats.symbolCharacters ? `${stats.symbolCharacters}캐릭 API 기준` : 'API 갱신 필요']
  ];
  $('#worldSummary').innerHTML = cards.map(([label, value, note]) => `
    <article class="summary-card">
      <span>${label}</span>
      <b>${value}</b>
      <small>${note}</small>
    </article>`).join('');
}

function bossOptions(selected = '') {
  return `<option value="">미설정</option>` + BOSS_DB.map((boss) => `
    <option value="${escapeHtml(boss.name)}" ${selected === boss.name ? 'selected' : ''}>
      ${escapeHtml(boss.name)} · ${fmtCompact(boss.price)}
    </option>`).join('');
}

function renderSymbols(character, root) {
  const level = characterLevel(character);
  const available = symbolsAvailable(character);
  const map = getSymbolMap(character.api?.symbols || []);
  const summary = getCharacterSymbolSummary(character);
  const weeklyBoss = bossTotal(character);

  const summaryRoot = $('.symbol-summary', root);
  if (!available) {
    summaryRoot.innerHTML = `
      <div class="inline-notice warning">심볼 API를 아직 불러오지 못했습니다. API 갱신 후 잔여 메소와 만렙 ETA를 계산합니다.</div>`;
  } else {
    const arcWeeks = weeklyBoss > 0 ? summary.arcaneMesos / weeklyBoss : Infinity;
    const grandisWeeks = weeklyBoss > 0 ? summary.grandisMesos / weeklyBoss : Infinity;
    summaryRoot.innerHTML = `
      <div class="summary-box"><span>아케인리버 잔여비</span><b>${fmtMeso(summary.arcaneMesos)}</b><small>최장 ${summary.arcaneDays}일</small></div>
      <div class="summary-box"><span>주보로 충당</span><b>${weeklyBoss ? fmtWeeks(arcWeeks) : '주보 미설정'}</b><small>현재 캐릭터 결정석 기준</small></div>
      <div class="summary-box"><span>그란디스 잔여비</span><b>${fmtMeso(summary.grandisMesos)}</b><small>최장 ${summary.grandisDays}일</small></div>
      <div class="summary-box"><span>주보로 충당</span><b>${weeklyBoss ? fmtWeeks(grandisWeeks) : '주보 미설정'}</b><small>현재 캐릭터 결정석 기준</small></div>`;
  }

  const groups = [
    ['아케인리버', SYMBOL_DB.filter((row) => row.type === '아케인')],
    ['그란디스', SYMBOL_DB.filter((row) => row.type !== '아케인')]
  ];

  $('.symbol-groups', root).innerHTML = groups.map(([title, rows]) => {
    const unlocked = rows.filter((db) => level >= db.unlock);
    const body = unlocked.map((db) => {
      if (!available) {
        return `<div class="symbol-row muted-row"><div class="symbol-name"><b>${db.region}</b></div><span>-</span><span>API 필요</span><span>-</span><span>-</span></div>`;
      }
      const apiSymbol = map.get(db.region) || null;
      const calc = symbolCalc(db, apiSymbol);
      const requirement = apiSymbol?.symbol_require_growth_count;
      const levelText = apiSymbol ? `Lv.${calc.level}` : '미보유';
      const growthText = apiSymbol ? `${fmt(calc.growth)}${requirement ? ` / ${fmt(requirement)}` : ''}` : 'Lv.1 기준';
      const icon = apiSymbol?.symbol_icon
        ? `<img src="${escapeHtml(apiSymbol.symbol_icon)}" alt="" loading="lazy">`
        : `<span class="symbol-dot"></span>`;
      return `<div class="symbol-row">
        <div class="symbol-name">${icon}<b>${db.region}</b></div>
        <span class="symbol-level">${levelText}</span>
        <span>${growthText}</span>
        <span>${calc.days}일</span>
        <span>${fmtMeso(calc.mesos)}</span>
      </div>`;
    }).join('');

    return `<section class="symbol-group">
      <div class="symbol-group-head"><h5>${title}</h5><span>지역</span><span>Lv</span><span>성장치</span><span>만렙</span><span>잔여 메소</span></div>
      ${body || '<div class="symbol-empty">아직 해금된 심볼이 없습니다.</div>'}
    </section>`;
  }).join('');
}

function renderCharacter(character, index) {
  resetTasksIfNeeded(character);
  const fragment = $('#characterTemplate').content.cloneNode(true);
  const card = $('.character-card', fragment);
  const level = characterLevel(character);
  const expRate = characterExpRate(character);
  const basic = character.api?.basic || {};
  const partialWarnings = character.api?.warnings || [];

  $('.character-name', card).textContent = character.name;
  $('.character-meta', card).textContent = level
    ? `${basic.character_class || '직업 미확인'} · Lv.${level} · ${basic.world_name || '월드 미확인'}`
    : 'API 갱신 필요';
  $('.combat-power', card).textContent = character.api?.combatPower
    ? `전투력 ${fmt(character.api.combatPower)}`
    : '전투력 -';

  const apiState = $('.character-api-state', card);
  if (character.apiError) {
    apiState.textContent = character.apiError;
    apiState.classList.add('error');
  } else if (partialWarnings.length) {
    apiState.textContent = `부분 조회 · ${partialWarnings.join(' / ')}`;
    apiState.classList.add('warn');
  } else if (character.api?.fetchedAt) {
    apiState.textContent = `API ${new Date(character.api.fetchedAt).toLocaleString('ko-KR')} 갱신`;
    apiState.classList.add('good-text');
  } else {
    apiState.textContent = '아직 API를 조회하지 않았습니다.';
  }

  const image = $('.character-image', card);
  const placeholder = $('.avatar-placeholder', card);
  const source = avatarUrl(basic.character_image);
  if (source) {
    image.src = source;
    image.hidden = false;
    placeholder.hidden = true;
    image.onerror = () => {
      image.hidden = true;
      placeholder.hidden = false;
    };
  } else {
    image.hidden = true;
    placeholder.hidden = false;
  }

  $('.level-badge', card).textContent = level ? `Lv.${level}` : '미조회';
  $('.exp-caption', card).textContent = `${expRate.toFixed(3)}%`;
  $('.exp-fill', card).style.width = `${expRate}%`;

  const expInput = $('.current-exp', card);
  expInput.value = expRate || '';
  expInput.readOnly = Boolean(character.api?.basic?.character_level);
  expInput.title = expInput.readOnly ? 'API 조회값입니다.' : 'API 미조회 시 수동 입력값을 사용합니다.';
  $('.target-level', card).value = character.targetLevel || (level || '');
  $('.mp-runs', card).value = clamp(character.mpRuns, 0, 14);
  $('.daily-exp-enabled', card).checked = character.dailyExpEnabled !== false;
  $('.task-daily', card).checked = Boolean(character.tasks?.daily);
  $('.task-mp', card).checked = Boolean(character.tasks?.mp);
  $('.task-boss', card).checked = Boolean(character.tasks?.boss);
  $('.daily-reset-label', card).textContent = `오늘 ${seoulDateKey()} 기준`;
  $('.weekly-reset-label', card).textContent = `주간 ${seoulWeeklyResetKey()}(목) 기준`;
  $('.boss-cap', card).innerHTML = bossOptions(character.bossCap);

  const target = Number(character.targetLevel || level);
  const eta = calculateLevelEta(level, expRate, target, character.dailyExpEnabled !== false, character.mpRuns);
  const mp = getMp(level);
  const dailyExp = character.dailyExpEnabled !== false ? dailyExpAtLevel(level) : 0;
  const mpWeek = monsterParkWeeklyExp(level, character.mpRuns);
  $('.level-metrics', card).innerHTML = `
    <div class="metric"><span>일퀘 EXP/일</span><b>${fmt(dailyExp)}</b><small>해금 지역 합산</small></div>
    <div class="metric"><span>몬파 주간 EXP</span><b>${mp ? fmt(mpWeek) : '-'}</b><small>${mp ? `${mp.region} · 일요일 보너스 평균 반영` : '미해금'}</small></div>
    <div class="metric"><span>목표까지</span><b>${eta === Infinity ? '루틴 없음' : eta == null ? '-' : `${eta.toFixed(1)}일`}</b><small>Lv.${target || '-'}</small></div>
    <div class="metric"><span>예상 달성일</span><b>${Number.isFinite(eta) ? new Date(Date.now() + Math.ceil(eta) * 86400000).toLocaleDateString('ko-KR') : '-'}</b><small>일퀘·몬파만 계산</small></div>`;

  const selectedBosses = getBossSelection(character.bossCap);
  const totalBossMesos = selectedBosses.reduce((sum, boss) => sum + boss.price, 0);
  $('.boss-metrics', card).innerHTML = `
    <div class="metric"><span>선정 결정석</span><b>${selectedBosses.length}/12개</b><small>상한 이하 진행도 기준</small></div>
    <div class="metric"><span>캐릭 주간 결정석</span><b>${fmtMeso(totalBossMesos)}</b><small>1인 판매가 기준</small></div>`;
  $('.boss-list', card).innerHTML = selectedBosses.length
    ? selectedBosses.map((boss) => `<span>${escapeHtml(boss.name)} <b>${fmtCompact(boss.price)}</b></span>`).join('')
    : '<em>주간보스 상한을 선택하세요.</em>';

  renderSymbols(character, card);

  $('.refresh-character', card).onclick = async () => {
    const button = $('.refresh-character', card);
    button.disabled = true;
    button.textContent = '조회 중…';
    try {
      await apiFetchCharacter(character);
    } catch (error) {
      character.apiError = error.message;
      saveState();
    }
    render();
  };

  $('.remove-character', card).onclick = () => {
    if (!confirm(`${character.name} 캐릭터를 관리 목록에서 삭제할까요?`)) return;
    currentWorld().characters.splice(index, 1);
    saveState();
    render();
  };

  expInput.onchange = (event) => {
    if (expInput.readOnly) return;
    character.manualExpRate = clamp(event.target.value, 0, 100);
    saveState();
    render();
  };
  $('.target-level', card).onchange = (event) => {
    character.targetLevel = clamp(event.target.value, 200, 300);
    saveState();
    render();
  };
  $('.mp-runs', card).onchange = (event) => {
    character.mpRuns = clamp(event.target.value, 0, 14);
    saveState();
    render();
  };
  $('.daily-exp-enabled', card).onchange = (event) => {
    character.dailyExpEnabled = event.target.checked;
    saveState();
    render();
  };
  $('.boss-cap', card).onchange = (event) => {
    character.bossCap = event.target.value;
    saveState();
    render();
  };

  for (const [selector, key] of [['.task-daily','daily'], ['.task-mp','mp'], ['.task-boss','boss']]) {
    $(selector, card).onchange = (event) => {
      character.tasks ||= {};
      character.tasks[key] = event.target.checked;
      character.tasks.dailyKey = seoulDateKey();
      character.tasks.weeklyKey = seoulWeeklyResetKey();
      saveState();
      renderSummary();
    };
  }

  return fragment;
}

function renderCharacters() {
  const list = $('#characterList');
  list.innerHTML = '';
  const characters = currentWorld().characters;
  if (!characters.length) {
    list.innerHTML = '<div class="empty"><b>등록된 캐릭터가 없습니다.</b><span>위 검색창에 닉네임을 입력하면 공식 API 정보가 자동으로 연결됩니다.</span></div>';
    return;
  }
  characters.forEach((character, index) => list.appendChild(renderCharacter(character, index)));
}

function render() {
  renderWorldTabs();
  renderSummary();
  $('#worldTitle').textContent = currentWorld().name;
  renderCharacters();
  saveState();
}

async function refreshAll() {
  const button = $('#refreshAllBtn');
  button.disabled = true;
  button.textContent = '전체 갱신 중…';
  for (const character of currentWorld().characters) {
    try {
      await apiFetchCharacter(character);
    } catch (error) {
      character.apiError = error.message;
      saveState();
    }
  }
  button.disabled = false;
  button.textContent = '전체 API 갱신';
  render();
}

$('#addCharacterForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = $('#characterNameInput');
  const name = input.value.trim();
  if (!name) return;
  if (currentWorld().characters.some((character) => character.name.toLowerCase() === name.toLowerCase())) {
    alert('이미 등록된 캐릭터입니다.');
    return;
  }

  const character = normalizeCharacter({ name, targetLevel: 0, mpRuns: 0, dailyExpEnabled: true, bossCap: '' });
  currentWorld().characters.push(character);
  saveState();
  input.value = '';
  render();

  try {
    await apiFetchCharacter(character);
  } catch (error) {
    character.apiError = error.message;
    saveState();
  }
  render();
});

$('#refreshAllBtn').onclick = refreshAll;

(async function checkHealth() {
  const chip = $('#apiStatus');
  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
    const result = await response.json();
    chip.textContent = result.apiKeyConfigured ? 'NEXON API 연결 준비' : 'API Key 설정 필요';
    chip.classList.add(result.apiKeyConfigured ? 'good' : 'warn');
  } catch {
    chip.textContent = '로컬 서버 확인 필요';
    chip.classList.add('error-chip');
  }
})();

render();
