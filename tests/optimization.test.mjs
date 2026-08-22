import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bossFamily,
  bossVisual,
  effectiveDefenseMultiplier,
  bossRecommendations,
  huntingRecommendations,
  unionCellCount,
  unionPlan,
  bossRoute
} from '../public/optimization-core.js';

test('boss family strips difficulty but keeps canonical boss name', () => {
  assert.equal(bossFamily('하드 스우'), '스우');
  assert.equal(bossFamily('노멀 선택받은 세렌'), '선택받은 세렌');
});

test('official boss visual metadata exists for major bosses', () => {
  assert.match(bossVisual('하드 스우')[0], /nexon\.com/);
  assert.match(bossVisual('노멀 루시드')[1], /maplestory\.nexon/);
});

test('higher IED improves defense multiplier against 300 defense', () => {
  assert.ok(effectiveDefenseMultiplier(95, 300) > effectiveDefenseMultiplier(90, 300));
});

test('boss optimizer prioritizes missing critical rate', () => {
  const rows = bossRecommendations({critRate:88,ignoreDefense:96,critDamage:50,bossDamage:300,damage:80,attack:3000,magic:0},300);
  assert.equal(rows[0].key,'크확');
});

test('hunting optimizer includes normal monster damage', () => {
  const rows = huntingRecommendations({critRate:100,normalDamage:45,critDamage:50,damage:80,attack:3000,magic:0});
  assert.ok(rows.some(row => row.key === '일몹뎀'));
});

test('union cell count deduplicates occupied coordinates', () => {
  const raider={union_block:[{block_position:[{x:0,y:0},{x:1,y:0}]},{block_position:[{x:1,y:0},{x:2,y:0}]}]};
  assert.equal(unionCellCount(raider),3);
});

test('union plan allocates approximately all available cells', () => {
  const plan=unionPlan('boss',40,{critRate:100,ignoreDefense:94});
  const total=plan.reduce((sum,row)=>sum+(row.cells||0),0);
  assert.ok(total>=38 && total<=42);
  assert.ok(plan.some(row => row.name === '방어율 무시'));
});

test('boss route remains capped at twelve crystals', () => {
  const route=bossRoute('하드 진 힐라');
  assert.ok(route.selected.length<=12);
  assert.ok(route.total>0);
});
