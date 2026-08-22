import test from 'node:test';
import assert from 'node:assert/strict';
import {
  equipmentViews,selectedAbility,selectedHyper,unionSnapshot,
  specUpgradePlan,bossSettingSummary,huntingSettingSummary
} from '../public/character-spec-core.js';

const equipment={item_equipment:[
  {item_equipment_part:'무기',item_name:'테스트 무기',item_icon:'https://example.com/a.png',starforce:'15',potential_option_grade:'유니크',potential_option_1:'공격력 : +12%',additional_potential_option_grade:'레어',additional_potential_option_1:'공격력 : +3%'},
  {item_equipment_part:'모자',item_name:'테스트 모자',starforce:'12',potential_option_grade:'에픽',potential_option_1:'STR : +6%'},
  {item_equipment_part:'상의',item_name:'테스트 상의',starforce:'10',potential_option_grade:'에픽',potential_option_1:'STR : +6%'}
]};

const ability={
  use_preset_no:2,
  ability_grade:'레전드리',
  ability_preset_2:{ability_preset_grade:'레전드리',ability_info:[
    {ability_grade:'레전드리',ability_value:'보스 몬스터 공격 시 데미지 20% 증가'},
    {ability_grade:'유니크',ability_value:'메소 획득량 15% 증가'}
  ]}
};

const hyper={use_preset_no:2,hyper_stat_preset_2:[
  {stat_type:'크리티컬 확률',stat_level:10,stat_increase:'15%'},
  {stat_type:'보스 몬스터 공격 시 데미지 증가',stat_level:8,stat_increase:'23%'}
]};

const unionRaider={use_preset_no:1,union_occupied_stat:['크리티컬 데미지 20%','방어율 무시 20%'],union_block:[{block_position:[{x:0,y:0},{x:1,y:0}]},{block_position:[{x:1,y:0},{x:2,y:0}]}]};

const stat={final_stat:[
  {stat_name:'전투력',stat_value:'50000000'},
  {stat_name:'크리티컬 확률',stat_value:'88'},
  {stat_name:'크리티컬 데미지',stat_value:'60'},
  {stat_name:'방어율 무시',stat_value:'91'},
  {stat_name:'보스 몬스터 데미지',stat_value:'300'},
  {stat_name:'데미지',stat_value:'80'},
  {stat_name:'일반 몬스터 데미지',stat_value:'35'},
  {stat_name:'공격력',stat_value:'4000'}
]};

const bundle={
  equipment,ability,hyper,stat,
  union:{union_level:6500,union_grade:'그랜드 마스터 II',union_artifact_level:30},
  unionRaider,
  unionArtifact:{},unionChampion:{union_champion:[{name:'A'}]}
};

test('equipment detail keeps icon, starforce and potential lines',()=>{
  const rows=equipmentViews(equipment);
  assert.equal(rows.length,3);
  assert.equal(rows[0].part,'무기');
  assert.equal(rows[0].starforce,15);
  assert.equal(rows[0].potentialGrade,'유니크');
  assert.deepEqual(rows[0].potential,['공격력 : +12%']);
});

test('ability parser follows active preset',()=>{
  const out=selectedAbility(ability);
  assert.equal(out.presetNo,2);
  assert.equal(out.grade,'레전드리');
  assert.equal(out.lines.length,2);
  assert.match(out.lines[1].value,/메소/);
});

test('hyper parser follows active preset and keeps levels',()=>{
  const out=selectedHyper(hyper);
  assert.equal(out.presetNo,2);
  assert.equal(out.rows[0].name,'크리티컬 확률');
  assert.equal(out.rows[0].level,10);
});

test('union snapshot deduplicates occupied cells and reports account state',()=>{
  const out=unionSnapshot(bundle);
  assert.equal(out.level,6500);
  assert.equal(out.cells,3);
  assert.equal(out.championCount,1);
  assert.ok(out.effects.some(x=>x.includes('방어율')));
});

test('spec upgrade plan puts missing crit rate and IED ahead of long-term items',()=>{
  const plan=specUpgradePlan(bundle,{cachedLevel:260,api:{symbols:[]}},300);
  assert.equal(plan[0].title,'크리티컬 확률 100% 확보');
  assert.equal(plan[1].title,'방어율 무시 보정');
  assert.ok(plan.some(x=>x.title.includes('무기·보조·엠블렘')));
  assert.ok(plan.some(x=>x.title==='유니온 성장'));
});

test('boss setting summary exposes hyper, ability, union and key equipment together',()=>{
  const out=bossSettingSummary(bundle,300);
  assert.equal(out.hyper.presetNo,2);
  assert.equal(out.ability.grade,'레전드리');
  assert.equal(out.union.level,6500);
  assert.equal(out.keyEquipment[0].part,'무기');
  assert.equal(out.iedTarget,95);
});

test('hunting setting summary detects farming ability and hunting union plan',()=>{
  const out=huntingSettingSummary(bundle);
  assert.ok(out.farmingAbility.some(x=>x.value.includes('메소')));
  assert.ok(out.unionPlan.some(x=>x.name.includes('크리티컬 데미지')));
});

test('partial bundle safely returns empty detail collections',()=>{
  assert.deepEqual(equipmentViews(null),[]);
  assert.deepEqual(selectedAbility({}).lines,[]);
  assert.deepEqual(selectedHyper({}).rows,[]);
  assert.doesNotThrow(()=>specUpgradePlan({stat:{final_stat:[]}},{}));
});
