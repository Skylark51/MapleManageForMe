import { BOSS_DB, getBossSelection } from './core.js';

export const WEEKLY_BOSS_LIMIT = 12;

export function bossByName(name) {
  return BOSS_DB.find((boss) => boss.name === name) || null;
}

export function normalizeBossNames(names = []) {
  const valid = new Set(BOSS_DB.map((boss) => boss.name));
  return [...new Set((Array.isArray(names) ? names : []).filter((name) => valid.has(name)))].slice(0, WEEKLY_BOSS_LIMIT);
}

export function manualBosses(entry, fallbackCap = '') {
  if (entry?.configured) return normalizeBossNames(entry.bosses);
  return getBossSelection(fallbackCap).map((boss) => boss.name);
}

export function bossSelectionRows(entry, fallbackCap = '') {
  return manualBosses(entry, fallbackCap).map(bossByName).filter(Boolean);
}

export function bossSelectionTotal(entry, fallbackCap = '') {
  return bossSelectionRows(entry, fallbackCap).reduce((sum, boss) => sum + boss.price, 0);
}

export function koreanMeso(value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  const eok = Math.floor(n / 100000000);
  const man = Math.floor((n % 100000000) / 10000);
  const won = n % 10000;
  const parts = [];
  if (eok) parts.push(`${eok.toLocaleString('ko-KR')}억`);
  if (man) parts.push(`${man.toLocaleString('ko-KR')}만`);
  if (!parts.length && won) parts.push(won.toLocaleString('ko-KR'));
  if (!parts.length) parts.push('0');
  return `${parts.join(' ')} 메소`;
}

export function dualMeso(value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  return `${n.toLocaleString('ko-KR')} 메소 (${koreanMeso(n)})`;
}

export function worldBossSummary(world, accountId, manualStore, worldLimit = 90) {
  const prices = [];
  let configuredCharacters = 0;
  for (const character of world?.characters || []) {
    const entry = manualStore?.characters?.[`${accountId}:${character.name}`];
    if (entry?.configured) configuredCharacters += 1;
    for (const boss of bossSelectionRows(entry, character.bossCap)) prices.push(boss.price);
  }
  prices.sort((a, b) => b - a);
  const sold = prices.slice(0, worldLimit);
  return {
    totalCount: prices.length,
    soldCount: sold.length,
    excludedCount: Math.max(0, prices.length - worldLimit),
    mesos: sold.reduce((sum, price) => sum + price, 0),
    configuredCharacters
  };
}
