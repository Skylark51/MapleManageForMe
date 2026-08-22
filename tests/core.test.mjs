import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SYMBOL_DB,
  getBossSelection,
  calculateWorldCrystalSummary,
  getMp,
  monsterParkWeeklyExp,
  dailyExpAtLevel,
  calculateLevelEta,
  symbolRequirement,
  symbolUpgradeCost,
  symbolCalc,
  seoulWeeklyResetKey
} from '../public/core.js';

test('boss cap selects at most 12 bosses from progression up to cap', () => {
  const selected = getBossSelection('노멀 윌');
  assert.equal(selected.length, 12);
  assert.equal(selected[0].name, '노멀 윌');
  assert.ok(selected.every((boss) => boss.progressionIndex <= 13));
});

test('world crystal summary keeps only top 90 crystals', () => {
  const characters = Array.from({ length: 10 }, () => ({ bossCap: '노멀 윌' }));
  const summary = calculateWorldCrystalSummary(characters, 90);
  assert.equal(summary.totalCount, 120);
  assert.equal(summary.soldCount, 90);
  assert.equal(summary.excludedCount, 30);
  assert.ok(summary.mesos > 0);
});

test('monster park 14 weekly runs includes Sunday bonus equivalent to 15 normal runs', () => {
  const level = 275;
  const mp = getMp(level);
  assert.ok(mp);
  assert.equal(monsterParkWeeklyExp(level, 14), mp.exp * 15);
});

test('daily EXP sums all unlocked daily regions for current level', () => {
  assert.equal(dailyExpAtLevel(200), 732132258);
  assert.equal(dailyExpAtLevel(259), 45978166967);
  assert.equal(dailyExpAtLevel(260), 62433849047);
});

test('level ETA decreases when daily content is enabled', () => {
  const withoutDaily = calculateLevelEta(262, 53, 265, false, 14);
  const withDaily = calculateLevelEta(262, 53, 265, true, 14);
  assert.ok(Number.isFinite(withoutDaily));
  assert.ok(Number.isFinite(withDaily));
  assert.ok(withDaily < withoutDaily);
});

test('arcane symbol total requirements and Vanishing Journey meso cost match reference table', () => {
  const db = SYMBOL_DB.find((row) => row.region === '소멸의 여로');
  const totalSymbols = Array.from({ length: 19 }, (_, i) => i + 1)
    .reduce((sum, lv) => sum + symbolRequirement(db.type, lv), 0);
  const totalMesos = Array.from({ length: 19 }, (_, i) => i + 1)
    .reduce((sum, lv) => sum + symbolUpgradeCost(db, lv), 0);
  assert.equal(totalSymbols, 2679);
  assert.equal(totalMesos, 252470000);
});

test('Cernium authentic symbol total requirements and meso cost match reference table', () => {
  const db = SYMBOL_DB.find((row) => row.region === '세르니움');
  const calc = symbolCalc(db, { symbol_level: 1, symbol_growth_count: 0 });
  assert.equal(calc.remainingSymbols, 4565);
  assert.equal(calc.mesos, 3930100000);
});

test('Geardrak total meso cost uses integer-safe floor arithmetic', () => {
  const db = SYMBOL_DB.find((row) => row.region === '기어드락');
  const calc = symbolCalc(db, { symbol_level: 1, symbol_growth_count: 0 });
  assert.equal(calc.mesos, 20181300000);
});

test('weekly reset key rolls on Thursday in Asia/Seoul', () => {
  assert.equal(seoulWeeklyResetKey(new Date('2026-08-20T01:00:00+09:00')), '2026-08-20');
  assert.equal(seoulWeeklyResetKey(new Date('2026-08-26T23:00:00+09:00')), '2026-08-20');
  assert.equal(seoulWeeklyResetKey(new Date('2026-08-27T00:00:01+09:00')), '2026-08-27');
});
