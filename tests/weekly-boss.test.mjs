import test from 'node:test';
import assert from 'node:assert/strict';
import { getBossSelection } from '../public/core.js';
import {
  WEEKLY_BOSS_LIMIT,
  normalizeBossNames,
  manualBosses,
  bossSelectionTotal,
  koreanMeso,
  dualMeso,
  worldBossSummary
} from '../public/weekly-boss-core.js';

test('manual weekly boss selection deduplicates and caps at twelve', () => {
  const names = [
    '카오스 자쿰','카오스 블러디퀸','카오스 반반','카오스 피에르','하드 매그너스','카오스 벨룸',
    '카오스 파풀라투스','노멀 스우','노멀 데미안','노멀 가디언 엔젤 슬라임','이지 루시드','이지 윌',
    '노멀 루시드','카오스 자쿰','존재하지 않는 보스'
  ];
  const normalized = normalizeBossNames(names);
  assert.equal(normalized.length, WEEKLY_BOSS_LIMIT);
  assert.equal(new Set(normalized).size, WEEKLY_BOSS_LIMIT);
});

test('configured manual bosses override automatic boss cap', () => {
  const entry = {configured:true, bosses:['노멀 스우','노멀 데미안']};
  assert.deepEqual(manualBosses(entry, '하드 진 힐라'), ['노멀 스우','노멀 데미안']);
  assert.equal(bossSelectionTotal(entry, '하드 진 힐라'), 34200000);
});

test('unconfigured character falls back to existing automatic cap', () => {
  const expected = getBossSelection('이지 루시드').map((boss) => boss.name);
  assert.deepEqual(manualBosses(null, '이지 루시드'), expected);
});

test('korean meso label uses eok and man units beside exact value', () => {
  assert.equal(koreanMeso(1234560000), '12억 3,456만 메소');
  assert.equal(dualMeso(1234560000), '1,234,560,000 메소 (12억 3,456만 메소)');
});

test('world boss summary uses manual picks only for configured characters', () => {
  const world = {characters:[
    {name:'A',bossCap:'하드 진 힐라'},
    {name:'B',bossCap:'이지 루시드'}
  ]};
  const store = {characters:{
    'account1:A':{configured:true,bosses:['노멀 스우','노멀 데미안']},
    'account1:B':{configured:true,bosses:[]}
  }};
  const summary = worldBossSummary(world,'account1',store,90);
  assert.equal(summary.totalCount,2);
  assert.equal(summary.mesos,34200000);
  assert.equal(summary.configuredCharacters,2);
});
