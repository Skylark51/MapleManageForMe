import { BOSS_DB, getBossSelection } from './core.js';

export const BOSS_VISUALS = {
  '자쿰': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=5413419192680449390','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Zakum'],
  '블러디퀸': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=5413419145435809318','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/BloodyQueen'],
  '반반': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=5701649521587521413','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/VanVan'],
  '벨룸': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=4836958393132385623','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Beluem'],
  '매그너스': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=5629591983384167710','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Magnus'],
  '파풀라투스': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=5125188760694163526','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Papulatus'],
  '스우': ['https://ssl.nexon.com/s2/Game/Maplestory/Maple2013/image/guide2/img_gcontent02_16.gif','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Swoo'],
  '데미안': ['https://ssl.nexon.com/s2/Game/Maplestory/Maple2013/image/guide2/img_gcontent02_17.gif','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Demian'],
  '루시드': ['https://ssl.nexon.com/s2/Game/Maplestory/Maple2013/image/guide2/img_gcontent02_18.gif','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Lucid'],
  '윌': ['https://ssl.nexon.com/s2/Game/Maplestory/Maple2013/image/guide2/img_gcontent02_19.gif','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Will'],
  '가디언 엔젤 슬라임': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=4909016000055216155','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/GuardianAngelSlime'],
  '더스크': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=5557534367871403647','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Dusk'],
  '진 힐라': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=5269303987424725025','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/TrueHila'],
  '듄켈': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=5557534363576436400','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Dunkel'],
  '선택받은 세렌': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=4620785636788405659','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/ChosenSeren'],
  '감시자 칼로스': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=4692843213646464856','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/WatcherKalos'],
  '카링': ['https://file.nexon.com/NxFile/download/FileDownloader.aspx?oidFile=4836958406017288027','https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/Karing']
};

export function bossFamily(name='') {
  return String(name)
    .replace(/^(이지|노멀|하드|카오스|익스트림)\s+/,'')
    .replace(/^친위대장\s+/,'')
    .replace(/^선택받은\s+/,'선택받은 ')
    .trim();
}

export function bossVisual(name) {
  const family = bossFamily(name);
  return BOSS_VISUALS[family] || [null, 'https://gi.maplestory.nexon.com/Guide/GameInformation/Boss/ProcessBossContent'];
}

export function statMap(statResponse) {
  const map = new Map();
  const rows = Array.isArray(statResponse?.final_stat) ? statResponse.final_stat : [];
  for (const row of rows) map.set(row.stat_name, Number(String(row.stat_value ?? '0').replace(/,/g,'')) || 0);
  return map;
}

function pick(map, names) {
  for (const name of names) if (map.has(name)) return map.get(name);
  return 0;
}

export function combatSnapshot(bundle={}) {
  const map = statMap(bundle.stat);
  return {
    combatPower: pick(map,['전투력']),
    bossDamage: pick(map,['보스 몬스터 데미지','보스 몬스터 공격 시 데미지']),
    ignoreDefense: pick(map,['방어율 무시','몬스터 방어율 무시']),
    critRate: pick(map,['크리티컬 확률']),
    critDamage: pick(map,['크리티컬 데미지']),
    damage: pick(map,['데미지']),
    normalDamage: pick(map,['일반 몬스터 데미지','일반 몬스터 공격 시 데미지']),
    attack: pick(map,['공격력']),
    magic: pick(map,['마력'])
  };
}

export function effectiveDefenseMultiplier(ignoreDefense, bossDefense=300) {
  const ied = Math.max(0, Math.min(100, Number(ignoreDefense)||0)) / 100;
  const defense = Math.max(0, Number(bossDefense)||0) / 100;
  return Math.max(0, 1 - defense * (1 - ied));
}

export function bossDamageIndex(snapshot, bossDefense=300) {
  const s = snapshot || {};
  const defense = effectiveDefenseMultiplier(s.ignoreDefense, bossDefense);
  return (1 + (s.damage + s.bossDamage)/100) * (1 + s.critDamage/100) * Math.max(0.01, defense);
}

export function bossRecommendations(snapshot, bossDefense=300) {
  const s = snapshot || {};
  const targetIed = bossDefense >= 380 ? 97 : bossDefense >= 300 ? 95 : 93;
  const rows = [];
  if (s.critRate < 100) rows.push({key:'크확',severity:100-s.critRate,title:'크리티컬 확률',current:s.critRate,target:100,reason:'100% 도달 전까지 가장 먼저 보정'});
  if (s.ignoreDefense < targetIed) rows.push({key:'방무',severity:(targetIed-s.ignoreDefense)*2,title:'방어율 무시',current:s.ignoreDefense,target:targetIed,reason:`방어율 ${bossDefense}% 기준 권장선`});
  rows.push({key:'크뎀',severity:24,title:'크리티컬 데미지',current:s.critDamage,target:null,reason:'보스 세팅의 고효율 범용 옵션'});
  rows.push({key:'보공',severity:20,title:'보스 데미지',current:s.bossDamage,target:null,reason:'보스 전용 증폭 옵션'});
  rows.push({key:'데미지',severity:12,title:'데미지',current:s.damage,target:null,reason:'보공 다음 보완 옵션'});
  rows.push({key:'공마',severity:8,title:'공격력 / 마력',current:Math.max(s.attack,s.magic),target:null,reason:'남는 자원으로 보완'});
  return rows.sort((a,b)=>b.severity-a.severity);
}

export function huntingRecommendations(snapshot) {
  const s = snapshot || {};
  const rows = [];
  if (s.critRate < 100) rows.push({key:'크확',severity:100-s.critRate,title:'크리티컬 확률',current:s.critRate,target:100,reason:'사냥에서도 100% 우선 확보'});
  rows.push({key:'일몹뎀',severity:30,title:'일반 몬스터 데미지',current:s.normalDamage,target:null,reason:'하이퍼스탯 사냥 프리셋 최우선 후보'});
  rows.push({key:'크뎀',severity:22,title:'크리티컬 데미지',current:s.critDamage,target:null,reason:'원킬컷과 설치기 컷 동시 개선'});
  rows.push({key:'데미지',severity:16,title:'데미지',current:s.damage,target:null,reason:'일몹뎀 이후 범용 보완'});
  rows.push({key:'공마',severity:10,title:'공격력 / 마력',current:Math.max(s.attack,s.magic),target:null,reason:'주력기와 설치기 모두 보완'});
  return rows.sort((a,b)=>b.severity-a.severity);
}

export function unionCellCount(raider={}) {
  const blocks = Array.isArray(raider.union_block) ? raider.union_block : [];
  const set = new Set();
  for (const block of blocks) for (const p of block.block_position || []) set.add(`${p.x},${p.y}`);
  return set.size;
}

export function unionEffects(raider={}) {
  const candidates = [raider.union_occupied_stat, raider.union_raider_stat];
  for (const key of Object.keys(raider || {})) {
    if (/union.*stat/i.test(key) && Array.isArray(raider[key])) candidates.push(raider[key]);
  }
  return [...new Set(candidates.flat().filter(Boolean).map(String))];
}

export function unionPlan(profile='boss', cells=0, snapshot={}) {
  const available = Math.max(0, Number(cells)||0);
  let weights;
  if (profile === 'hunt') {
    weights = [
      ['크리티컬 데미지',0.30],['크리티컬 확률',snapshot.critRate < 100 ? 0.22 : 0.08],['주스탯/공격력',0.28],['버프 지속시간',0.12],['방어율 무시',0.08]
    ];
  } else {
    weights = [
      ['크리티컬 데미지',0.28],['방어율 무시',snapshot.ignoreDefense < 95 ? 0.27 : 0.15],['보스 데미지',0.25],['크리티컬 확률',snapshot.critRate < 100 ? 0.12 : 0.04],['버프 지속시간/주스탯',0.08]
    ];
  }
  const total = weights.reduce((s,[,w])=>s+w,0);
  return weights.map(([name,w])=>({name,weight:w/total,cells:available ? Math.round(available*w/total) : null}));
}

export function bossRoute(capName) {
  const selected = getBossSelection(capName);
  const total = selected.reduce((s,b)=>s+b.price,0);
  return { selected, total };
}

export function bossCatalog() {
  return BOSS_DB.map((boss,index)=>({ ...boss, index, family: bossFamily(boss.name), visual: bossVisual(boss.name) }));
}

export function flattenHyper(hyper={}) {
  const out=[];
  const presetNo=Number(hyper.use_preset_no || 0);
  const candidate = hyper[`hyper_stat_preset_${presetNo}`] || hyper.hyper_stat_preset_1 || [];
  if (Array.isArray(candidate)) {
    for (const row of candidate) {
      const name=row.stat_type || row.stat_name || row.hyper_stat_type;
      const level=Number(row.stat_level ?? row.stat_point ?? row.level ?? 0);
      if (name) out.push({name:String(name),level});
    }
  }
  return out;
}

export function linkSkills(link={}) {
  const rows = link.character_link_skill || link.link_skill || [];
  return Array.isArray(rows) ? rows.map(x=>({name:x.skill_name||x.link_skill_name||'링크 스킬',level:x.skill_level||x.link_skill_level||0,icon:x.skill_icon||x.link_skill_icon||''})) : [];
}
