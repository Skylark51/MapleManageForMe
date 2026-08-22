import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hyperPointCost,hyperEffect,hyperBuildFromResponse,hyperBudget,unionBuildFromResponse,
  optimizeHyper,optimizeUnion,optimizeSettings,stackIed,unstackIed
} from '../public/optimizer-engine.js';

const base={mainStat:50000,attack:4000,magic:0,damage:80,bossDamage:300,normalDamage:40,critRate:88,critDamage:90,ignoreDefense:94};

test('official hyper stat point cost table reaches 550 at level 15',()=>{
  assert.equal(hyperPointCost(10),150);
  assert.equal(hyperPointCost(15),550);
});

test('official hyper stat cumulative effects match guide',()=>{
  assert.equal(hyperEffect('critRate',15),25);
  assert.equal(hyperEffect('bossDamage',15),55);
  assert.equal(hyperEffect('normalDamage',15),55);
  assert.equal(hyperEffect('ignoreDefense',15),45);
  assert.equal(hyperEffect('critDamage',15),15);
});

test('IED stacking and removal are inverse within tolerance',()=>{
  const stacked=stackIed(92,30);
  assert.ok(Math.abs(unstackIed(stacked,30)-92)<1e-8);
});

test('boss hyper optimizer spends points and fixes critical rate deficit',()=>{
  const result=optimizeHyper(base,300,'boss',300);
  assert.ok(result.spent>0);
  assert.ok(result.build.critRate>0);
  assert.ok(result.build.bossDamage>0 || result.build.ignoreDefense>0 || result.build.critDamage>0);
});

test('hunting hyper optimizer allocates normal monster damage',()=>{
  const result=optimizeHyper(base,300,'hunt',300);
  assert.ok(result.build.normalDamage>0);
});

test('380 defense profile never values less IED than 300 profile for same budget',()=>{
  const low=optimizeHyper(base,400,'boss',300);
  const high=optimizeHyper(base,400,'boss',380);
  assert.ok(high.build.ignoreDefense>=low.build.ignoreDefense);
});

test('union occupied stats are converted back into cells',()=>{
  const build=unionBuildFromResponse({union_occupied_stat:['크리티컬 데미지 10% 증가','보스 몬스터 공격 시 데미지 40% 증가','방어율 무시 30% 증가','크리티컬 확률 12% 증가']});
  assert.equal(build.critDamage,20);
  assert.equal(build.bossDamage,40);
  assert.equal(build.ignoreDefense,30);
  assert.equal(build.critRate,12);
});

test('boss union optimizer respects 40-cell cap per region',()=>{
  const result=optimizeUnion(base,120,'boss',380);
  for(const value of Object.values(result.build)) assert.ok(value<=40);
  assert.equal(result.spent,120);
});

test('full optimizer compares current API allocation with optimized allocation',()=>{
  const bundle={
    stat:{final_stat:[
      {stat_name:'STR',stat_value:'50000'},{stat_name:'공격력',stat_value:'4000'},{stat_name:'데미지',stat_value:'80'},
      {stat_name:'보스 몬스터 데미지',stat_value:'300'},{stat_name:'일반 몬스터 데미지',stat_value:'40'},
      {stat_name:'크리티컬 확률',stat_value:'88'},{stat_name:'크리티컬 데미지',stat_value:'90'},{stat_name:'방어율 무시',stat_value:'94'}
    ]},
    hyper:{use_preset_no:1,hyper_stat_preset_1_remain_point:30,hyper_stat_preset_1:[
      {stat_type:'크리티컬 확률',stat_level:5},{stat_type:'크리티컬 데미지',stat_level:8},{stat_type:'방어율 무시',stat_level:8},
      {stat_type:'데미지',stat_level:8},{stat_type:'보스 몬스터 공격 시 데미지 증가',stat_level:8},{stat_type:'STR',stat_level:8}
    ]},
    unionRaider:{union_occupied_stat:['크리티컬 데미지 8% 증가','보스 몬스터 공격 시 데미지 30% 증가','방어율 무시 20% 증가','크리티컬 확률 10% 증가']}
  };
  const result=optimizeSettings(bundle,'boss',300);
  assert.ok(Number.isFinite(result.gainPct));
  assert.ok(result.hyperPoints>0);
  assert.equal(result.unionCells,76);
  assert.ok(Object.values(result.optimizedHyper).some(v=>v>0));
});
