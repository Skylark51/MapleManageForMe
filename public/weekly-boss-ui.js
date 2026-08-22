import { BOSS_DB, getBossSelection } from './core.js';
import { bossVisual } from './optimization-core.js';
import {
  WEEKLY_BOSS_LIMIT,
  bossSelectionRows,
  bossSelectionTotal,
  dualMeso,
  koreanMeso,
  normalizeBossNames,
  worldBossSummary
} from './weekly-boss-core.js';

const MANAGER_KEYS = ['maple-personal-manager-v3','maple-personal-manager-v2','maple-personal-manager-v1'];
const STORE_KEY = 'maple-personal-weekly-boss-v1';
let scheduled = false;
let rendering = false;

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

function managerState() {
  for (const key of MANAGER_KEYS) {
    const state = readJson(key, null);
    if (state?.worlds) return state;
  }
  return null;
}

function loadStore() {
  const raw = readJson(STORE_KEY, null);
  return raw?.characters ? raw : {version:1, characters:{}};
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function context() {
  const state = managerState();
  if (!state) return null;
  const accountId = state.activeWorld;
  const world = state.worlds?.[accountId];
  if (!world) return null;
  const character = world.characters?.find((c) => c.name === world.selectedCharacter) || world.characters?.[0] || null;
  if (!character) return null;
  return {state, accountId, world, character, key:`${accountId}:${character.name}`};
}

function currentEntry(ctx, store = loadStore()) {
  return store.characters?.[ctx.key] || null;
}

function formatWeeks(value) {
  if (!Number.isFinite(value)) return '-';
  if (value === 0) return '완료';
  const months = value * 7 / 30.4375;
  if (value < 8) return `${value.toFixed(1)}주`;
  if (months < 24) return `${value.toFixed(1)}주 · ${months.toFixed(1)}개월`;
  return `${(months / 12).toFixed(1)}년`;
}

function parseMesoText(node) {
  if (!node) return null;
  const match = node.textContent.replace(/\s+/g,' ').match(/([\d,]+)\s*메소/);
  return match ? Number(match[1].replace(/,/g,'')) : null;
}

function decorateMesoLabels(root = document) {
  const nodes = root.querySelectorAll('.symbol-summary .summary-box b, .symbol-groups .symbol-row > span:last-child');
  for (const node of nodes) {
    if (node.querySelector?.('.meso-human')) continue;
    const value = parseMesoText(node);
    if (!Number.isFinite(value)) continue;
    const exact = `${Math.floor(value).toLocaleString('ko-KR')} 메소`;
    node.innerHTML = `${exact}<small class="meso-human">(${koreanMeso(value)})</small>`;
  }
}

function updateWorldSummary(ctx, store) {
  const summary = worldBossSummary(ctx.world, ctx.accountId, store, 90);
  const card = document.querySelector('#worldSummary .summary-card:nth-child(3)');
  if (!card) return;
  const value = card.querySelector('b');
  const note = card.querySelector('small');
  if (value) value.textContent = dualMeso(summary.mesos);
  if (note) note.textContent = `${summary.soldCount}/90개 반영 · 직접선택 ${summary.configuredCharacters}캐릭`;
}

function updateCharacterMetrics(ctx, entry) {
  const total = bossSelectionTotal(entry, ctx.character.bossCap);
  const rows = bossSelectionRows(entry, ctx.character.bossCap);
  const kpi = document.querySelector('.character-kpis .kpi-card:nth-child(2)');
  if (kpi) {
    const value = kpi.querySelector('b');
    const note = kpi.querySelector('small');
    if (value) value.textContent = dualMeso(total);
    if (note) note.textContent = `${rows.length}/${WEEKLY_BOSS_LIMIT} 직접 선택 결정석`;
  }

  const boxes = [...document.querySelectorAll('.symbol-summary .summary-box')];
  for (const [amountIndex, fundingIndex] of [[0,1],[2,3]]) {
    const amount = parseMesoText(boxes[amountIndex]?.querySelector('b'));
    const funding = boxes[fundingIndex]?.querySelector('b');
    const fundingNote = boxes[fundingIndex]?.querySelector('small');
    if (!funding || !Number.isFinite(amount)) continue;
    funding.textContent = total > 0 ? formatWeeks(amount / total) : '주보 미설정';
    if (fundingNote) fundingNote.textContent = entry?.configured ? '직접 선택 결정석 기준' : '기존 상한 자동 추정 기준';
  }
}

function bossButton(boss, selected) {
  const [image] = bossVisual(boss.name);
  const imageHtml = image
    ? `<span class="manual-boss-image"><img src="${image}" alt="" loading="lazy"></span>`
    : `<span class="manual-boss-image placeholder">BOSS</span>`;
  return `<button type="button" class="manual-boss-button ${selected ? 'selected' : ''}" data-manual-boss="${boss.name}" aria-pressed="${selected}">
    ${imageHtml}
    <span class="manual-boss-copy"><b>${boss.name}</b><small>${dualMeso(boss.price)}</small></span>
    <span class="manual-boss-check">${selected ? '✓' : '+'}</span>
  </button>`;
}

function renderBossPanel(ctx, force = false) {
  const panel = document.querySelector('.boss-panel');
  if (!panel) return;
  const store = loadStore();
  const entry = currentEntry(ctx, store);
  const names = bossSelectionRows(entry, ctx.character.bossCap).map((boss) => boss.name);
  const signature = `${ctx.key}|${entry?.configured ? 'manual' : 'auto'}|${names.join('|')}`;
  if (!force && panel.dataset.manualBossSignature === signature) return;
  panel.dataset.manualBossSignature = signature;

  const selected = new Set(names);
  const total = bossSelectionTotal(entry, ctx.character.bossCap);
  const note = panel.querySelector('.panel-note');
  const controls = panel.querySelector('.boss-control-row');
  const list = panel.querySelector('.boss-list');
  if (note) note.textContent = entry?.configured ? `직접 선택 ${names.length}/${WEEKLY_BOSS_LIMIT}` : '기존 상한 자동 추정 · 직접 선택 가능';
  if (controls) controls.innerHTML = `
    <div class="manual-boss-summary">
      <span>실제 주간보스</span>
      <b>${names.length}/${WEEKLY_BOSS_LIMIT}개</b>
      <small>${dualMeso(total)}</small>
    </div>
    <div class="manual-boss-actions">
      <button type="button" class="btn primary" data-boss-action="copy-auto">기존 자동 12개 가져오기</button>
      <button type="button" class="btn subtle" data-boss-action="clear">전체 해제</button>
      <button type="button" class="btn subtle" data-boss-action="fallback">자동 추정으로 복귀</button>
    </div>`;
  if (list) list.innerHTML = `
    <div class="manual-boss-help">
      <div><b>실제로 매주 잡는 보스만 클릭</b><span>선택한 보스의 결정석만 수익·심볼 충당 기간·계정 상위 90개 계산에 반영합니다.</span></div>
      <em>${entry?.configured ? '직접 선택 사용 중' : '아직 직접 설정 전'}</em>
    </div>
    <div class="manual-boss-grid">${BOSS_DB.map((boss) => bossButton(boss, selected.has(boss.name))).join('')}</div>`;

  panel.querySelectorAll('[data-manual-boss]').forEach((button) => {
    button.onclick = () => {
      const fresh = loadStore();
      const existing = fresh.characters[ctx.key];
      let bosses = existing?.configured ? normalizeBossNames(existing.bosses) : [];
      const name = button.dataset.manualBoss;
      if (bosses.includes(name)) bosses = bosses.filter((item) => item !== name);
      else {
        if (bosses.length >= WEEKLY_BOSS_LIMIT) {
          const help = panel.querySelector('.manual-boss-help em');
          if (help) help.textContent = `최대 ${WEEKLY_BOSS_LIMIT}개까지 선택할 수 있습니다.`;
          return;
        }
        bosses.push(name);
      }
      fresh.characters[ctx.key] = {configured:true, bosses:normalizeBossNames(bosses)};
      saveStore(fresh);
      renderAll(true);
    };
  });

  panel.querySelector('[data-boss-action="copy-auto"]')?.addEventListener('click', () => {
    const fresh = loadStore();
    fresh.characters[ctx.key] = {configured:true, bosses:getBossSelection(ctx.character.bossCap).map((boss) => boss.name)};
    saveStore(fresh);
    renderAll(true);
  });
  panel.querySelector('[data-boss-action="clear"]')?.addEventListener('click', () => {
    const fresh = loadStore();
    fresh.characters[ctx.key] = {configured:true, bosses:[]};
    saveStore(fresh);
    renderAll(true);
  });
  panel.querySelector('[data-boss-action="fallback"]')?.addEventListener('click', () => {
    const fresh = loadStore();
    delete fresh.characters[ctx.key];
    saveStore(fresh);
    renderAll(true);
  });

  updateCharacterMetrics(ctx, entry);
  updateWorldSummary(ctx, store);
}

function renderAll(force = false) {
  if (rendering) return;
  rendering = true;
  try {
    const ctx = context();
    if (ctx) renderBossPanel(ctx, force);
    decorateMesoLabels();
    if (ctx) {
      const store = loadStore();
      updateCharacterMetrics(ctx, currentEntry(ctx, store));
      updateWorldSummary(ctx, store);
    }
  } finally {
    rendering = false;
  }
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    renderAll(false);
  });
}

new MutationObserver(schedule).observe(document.body, {childList:true, subtree:true});
window.addEventListener('storage', schedule);
window.addEventListener('focus', schedule);
renderAll(true);
