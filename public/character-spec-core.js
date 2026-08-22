import { SYMBOL_DB, symbolRegionFromName } from './core.js';
import { combatSnapshot, unionCellCount, unionEffects, unionPlan } from './optimization-core.js';

const POTENTIAL_RANK = {'레어':1,'에픽':2,'유니크':3,'레전드리':4};
const KEY_PARTS = ['무기','보조무기','엠블렘'];

export function equipmentItems(response={}) {
  const rows = response?.item_equipment;
  return Array.isArray(rows) ? rows.filter(Boolean) : [];
}

export function potentialOptions(item={}, additional=false) {
  const prefix = additional ? 'additional_potential_option_' : 'potential_option_';
  return [1,2,3].map(i => item?.[`${prefix}${i}`]).filter(Boolean).map(String);
}

export function equipmentItemView(item={}) {
  return {
    part: String(item.item_equipment_part || item.item_equipment_slot || '기타'),
    slot: String(item.item_equipment_slot || item.item_equipment_part || '기타'),
    name: String(item.item_name || '이름 없음'),
    icon: String(item.item_icon || item.item_shape_icon || ''),
    starforce: Number(item.starforce || 0),
    potentialGrade: String(item.potential_option_grade || ''),
    additionalGrade: String(item.additional_potential_option_grade || ''),
    potential: potentialOptions(item,false),
    additional: potentialOptions(item,true),
    soul: String(item.soul_name || item.item_soul_name || ''),
    soulOption: String(item.soul_option || item.item_soul_option || '')
  };
}

export function equipmentViews(response={}) {
  return equipmentItems(response).map(equipmentItemView);
}

export function selectedAbility(response={}) {
  const presetNo = Number(response.use_preset_no || 0);
  const preset = presetNo ? response[`ability_preset_${presetNo}`] : null;
  const source = preset || response;
  const info = Array.isArray(source?.ability_info) ? source.ability_info : Array.isArray(response.ability_info) ? response.ability_info : [];
  return {
    presetNo: presetNo || null,
    grade: String(source?.ability_preset_grade || source?.ability_grade || response.ability_grade || ''),
    remainFame: Number(response.remain_fame || 0),
    lines: info.map((row,index)=>({
      index:index+1,
      grade:String(row?.ability_grade || row?.grade || ''),
      value:String(row?.ability_value || row?.value || row?.ability_option || '')
    })).filter(row=>row.value)
  };
}

export function selectedHyper(response={}) {
  const presetNo = Number(response.use_preset_no || 0);
  const rows = response[`hyper_stat_preset_${presetNo || 1}`] || response.hyper_stat_preset_1 || [];
  return {
    presetNo:presetNo || 1,
    remainPoint:Number(response.hyper_stat_preset_remain_point ?? response.remain_hyper_stat ?? 0),
    rows:Array.isArray(rows) ? rows.map(row=>({
      name:String(row.stat_type || row.stat_name || row.hyper_stat_type || '하이퍼스탯'),
      level:Number(row.stat_level ?? row.level ?? 0),
      increase:String(row.stat_increase || row.stat_increase_value || '')
    })).filter(row=>row.level>0 || row.increase) : []
  };
}

export function unionSnapshot(bundle={}) {
  const u=bundle.union||{}, r=bundle.unionRaider||{}, artifact=bundle.unionArtifact||{}, champion=bundle.unionChampion||{};
  return {
    level:Number(u.union_level||0),
    grade:String(u.union_grade||''),
    artifactLevel:Number(u.union_artifact_level || artifact.union_artifact_level || 0),
    presetNo:Number(r.use_preset_no||0),
    cells:unionCellCount(r),
    effects:unionEffects(r),
    championCount:Array.isArray(champion.union_champion) ? champion.union_champion.length : Array.isArray(champion.champion) ? champion.champion.length : 0,
    raider:r,
    artifact,
    champion
  };
}

function rankValue(grade='') { return POTENTIAL_RANK[String(grade)] || 0; }
function isKeyPart(part='') { return KEY_PARTS.some(key=>String(part).includes(key)); }

export function equipmentSignals(response={}) {
  const items=equipmentViews(response);
  const keyItems=items.filter(item=>isKeyPart(item.part));
  const starItems=items.filter(item=>item.starforce>0);
  const below17=starItems.filter(item=>item.starforce<17);
  const lowMainPotential=items.filter(item=>rankValue(item.potentialGrade)>0 && rankValue(item.potentialGrade)<3);
  const lowKeyPotential=keyItems.filter(item=>rankValue(item.potentialGrade)<4);
  const lowKeyAdditional=keyItems.filter(item=>rankValue(item.additionalGrade)>0 && rankValue(item.additionalGrade)<2);
  return {items,keyItems,starItems,below17,lowMainPotential,lowKeyPotential,lowKeyAdditional};
}

function currentSymbolGap(character={}) {
  const symbols=Array.isArray(character?.api?.symbols) ? character.api.symbols : [];
  if(!symbols.length) return null;
  const map=new Map(symbols.map(s=>[symbolRegionFromName(s.symbol_name),s]));
  let incomplete=0;
  let unlocked=0;
  const level=Number(character?.api?.basic?.character_level || character?.cachedLevel || 0);
  for(const db of SYMBOL_DB){
    if(level<db.unlock)continue;
    unlocked+=1;
    const symbol=map.get(db.region);
    const lv=Number(symbol?.symbol_level||0);
    if(lv<db.maxLevel)incomplete+=1;
  }
  return {unlocked,incomplete};
}

export function specUpgradePlan(bundle={}, character={}, bossDefense=300) {
  const s=combatSnapshot(bundle), eq=equipmentSignals(bundle.equipment), ability=selectedAbility(bundle.ability), union=unionSnapshot(bundle), symbolGap=currentSymbolGap(character);
  const rows=[];
  const push=(score,category,title,current,goal,reason)=>rows.push({score,category,title,current,goal,reason});

  if(s.critRate<100) push(1000,'세팅','크리티컬 확률 100% 확보',`${s.critRate.toFixed(1)}%`,'100%','하이퍼·유니온·링크에서 먼저 보정하면 보스와 사냥 양쪽의 변동성을 줄일 수 있습니다.');
  const iedTarget=bossDefense>=380?97:bossDefense>=300?95:93;
  if(s.ignoreDefense<iedTarget) push(900,'보스','방어율 무시 보정',`${s.ignoreDefense.toFixed(1)}%`,`${iedTarget}% 전후`,`방어율 ${bossDefense}% 비교 기준에서 우선 확인할 병목입니다.`);
  if(eq.lowKeyPotential.length) push(820,'장비','무기·보조·엠블렘 잠재 검토',eq.lowKeyPotential.map(x=>`${x.part} ${x.potentialGrade||'미확인'}`).join(' · '),'핵심 3부위 잠재 우선 정리','보공·방무·공/마를 직접 다루는 핵심 부위이므로 일반 장비보다 먼저 비교할 가치가 있습니다.');
  if(eq.lowKeyAdditional.length) push(720,'장비','무보엠 에디셔널 정리',eq.lowKeyAdditional.map(x=>`${x.part} ${x.additionalGrade}`).join(' · '),'낮은 등급부터 단계적 개선','정확한 비용 효율은 시세가 필요하지만 핵심 부위의 낮은 에디셔널 등급은 명확한 점검 대상입니다.');
  if(eq.below17.length>=3) push(650,'장비','낮은 스타포스 구간 정리',`${eq.below17.length}부위 17성 미만`,'장비별 17성 구간 우선 검토','여러 부위가 동시에 낮으면 고성 장비 한 부위보다 균형 있게 기본 구간을 맞추는 편이 관리상 우선입니다.');
  if(ability.grade && ability.grade!=='레전드리') push(590,'내실','어빌리티 등급 정리',ability.grade,'레전드리 등급 검토','현재 어빌리티 등급이 최상위가 아니므로 보스/사냥 목적 라인 이전에 등급부터 점검합니다.');
  if(union.level>0 && union.level<8000) push(540,'유니온','유니온 성장',`Lv.${union.level.toLocaleString('ko-KR')}`,'Lv.8,000 구간 검토','공격대원 효과와 점령 자유도가 함께 증가하므로 장기 스펙업 축으로 관리합니다.');
  if(symbolGap?.incomplete>0) push(500,'심볼','심볼 만렙 진행',`${symbolGap.incomplete}/${symbolGap.unlocked} 지역 진행 중`,'해금 심볼 만렙','일퀘 기반 확정 성장 요소이므로 비용/시간 계획과 함께 지속합니다.');
  if(eq.lowMainPotential.length>=4) push(450,'장비','일반 장비 잠재 등급 정리',`${eq.lowMainPotential.length}부위 에픽 이하`,'낮은 등급부터 순차 정리','여러 부위가 낮으면 한 부위에 과투자하기보다 전체 저점부터 정리할 수 있습니다.');
  if(!rows.length) push(100,'점검','현재 데이터 재검토','즉시 확인되는 큰 병목 없음','비용·시세 입력 후 세부 비교','API만으로는 실제 메소 대비 최종뎀 효율을 확정할 수 없으므로 다음 단계는 비용 데이터를 붙여 비교합니다.');

  return rows.sort((a,b)=>b.score-a.score).map((row,index)=>({...row,rank:index+1,tier:row.score>=800?'최우선':row.score>=550?'단기':row.score>=400?'중기':'점검'}));
}

export function bossSettingSummary(bundle={}, bossDefense=300) {
  const s=combatSnapshot(bundle), union=unionSnapshot(bundle), hyper=selectedHyper(bundle.hyper), ability=selectedAbility(bundle.ability), eq=equipmentSignals(bundle.equipment);
  return {
    stats:s,
    union,
    hyper,
    ability,
    unionPlan:unionPlan('boss',union.cells,s),
    keyEquipment:eq.keyItems,
    iedTarget:bossDefense>=380?97:bossDefense>=300?95:93
  };
}

export function huntingSettingSummary(bundle={}) {
  const s=combatSnapshot(bundle), union=unionSnapshot(bundle), hyper=selectedHyper(bundle.hyper), ability=selectedAbility(bundle.ability);
  const farmingAbility=ability.lines.filter(line=>/(메소|아이템|드롭|획득)/.test(line.value));
  return {stats:s,union,hyper,ability,farmingAbility,unionPlan:unionPlan('hunt',union.cells,s)};
}
