import { BOSS_DB, SYMBOL_DB } from './core.js';
import { fetchOptimizationBundle } from './insights-api.js';
import { fetchCharacter } from './account-api.js';
import {
  bossCatalog,bossRoute,combatSnapshot,bossRecommendations,huntingRecommendations,
  unionCellCount,unionEffects,unionPlan,flattenHyper,linkSkills,bossDamageIndex
} from './optimization-core.js';
import {
  equipmentViews,selectedAbility,selectedHyper,unionSnapshot,specUpgradePlan,
  bossSettingSummary,huntingSettingSummary
} from './character-spec-core.js';

const MAIN_KEY='maple-personal-manager-v3';
const STORE_KEY='maplemanage:optimization-v1';
const TAB_KEY='maplemanage:feature-tab';
const $=(s,r=document)=>r.querySelector(s);
const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmt=n=>Number.isFinite(Number(n))?Math.round(Number(n)).toLocaleString('ko-KR'):'-';
const compact=n=>{n=Number(n);if(!Number.isFinite(n))return'-';if(n>=1e12)return`${(n/1e12).toFixed(2)}조`;if(n>=1e8)return`${(n/1e8).toFixed(2)}억`;if(n>=1e4)return`${(n/1e4).toFixed(1)}만`;return fmt(n)};

function readMain(){try{return JSON.parse(localStorage.getItem(MAIN_KEY)||'{}')}catch{return{}}}
function loadStore(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return{}}}
let store=loadStore();
function saveStore(){localStorage.setItem(STORE_KEY,JSON.stringify(store))}
function context(){
  const state=readMain();
  const accountId=state.activeWorld||'account1';
  const world=state.worlds?.[accountId]||{name:'계정',characters:[]};
  const character=world.characters?.find(c=>c.name===world.selectedCharacter)||world.characters?.[0]||null;
  return{state,accountId,world,character};
}
function charKey(ctx){return `${ctx.accountId}:${ctx.character?.name||'none'}`}
function charStore(ctx){const key=charKey(ctx);store[key]||={bundle:null,bossDefense:300,unionProfile:'boss',bossTarget:''};return store[key]}
function statValue(snapshot,key){const v=Number(snapshot?.[key]||0);return Number.isFinite(v)?v:0}
function statCard(label,value,note=''){return `<div class="opt-stat"><span>${label}</span><b>${value}</b>${note?`<small>${note}</small>`:''}</div>`}
function empty(message){return `<div class="opt-empty"><b>분석 데이터가 필요합니다.</b><span>${message}</span><button class="btn primary" data-opt-refresh>분석 데이터 갱신</button></div>`}
function activeTab(){return localStorage.getItem(TAB_KEY)||'dashboard'}
function setTab(tab){localStorage.setItem(TAB_KEY,tab);renderFeatureShell()}

async function refreshBundle(){
  const ctx=context();
  if(!ctx.character){alert('관리 캐릭터를 먼저 선택하세요.');return}
  const buttons=[...document.querySelectorAll('[data-opt-refresh]')];
  buttons.forEach(b=>{b.disabled=true;b.textContent='API 분석 중…'});
  try{
    await fetchCharacter(ctx.character,ctx.accountId);
    localStorage.setItem(MAIN_KEY,JSON.stringify(ctx.state));
    const bundle=await fetchOptimizationBundle(ctx.character,ctx.accountId);
    charStore(ctx).bundle=bundle;saveStore();renderFeatureShell();
  }catch(e){alert(e.message)}
  finally{buttons.forEach(b=>{b.disabled=false;b.textContent='분석 데이터 갱신'})}
}

function header(ctx,title,desc){
  return `<div class="opt-head"><div><span>CHARACTER ANALYSIS</span><h2>${title}</h2><p>${desc}</p></div><div class="opt-head-actions"><span class="opt-character-chip">${esc(ctx.character?.name||'캐릭터 미선택')}</span><button class="btn primary" data-opt-refresh>분석 데이터 갱신</button></div></div>`;
}

function partialWarning(bundle){
  const entries=Object.entries(bundle?.errors||{});
  if(!entries.length)return'';
  return `<div class="partial-warning"><b>일부 API 조회 실패</b><span>${entries.map(([k,v])=>`${esc(k)}: ${esc(v)}`).join(' · ')}</span></div>`;
}

function gradeClass(grade=''){
  const g=String(grade);
  if(g.includes('레전'))return'legendary';
  if(g.includes('유니크'))return'unique';
  if(g.includes('에픽'))return'epic';
  if(g.includes('레어'))return'rare';
  return'normal';
}

function abilityLinesHtml(ability){
  if(!ability.lines.length)return'<div class="spec-empty-line">어빌리티 데이터가 없습니다.</div>';
  return ability.lines.map(line=>`<div class="ability-line"><em class="grade-dot ${gradeClass(line.grade)}"></em><span><b>${esc(line.value)}</b><small>${esc(line.grade||'등급 미확인')}</small></span></div>`).join('');
}

function hyperRowsHtml(hyper){
  if(!hyper.rows.length)return'<div class="spec-empty-line">적용 하이퍼스탯을 읽지 못했습니다.</div>';
  return `<div class="hyper-stat-grid">${hyper.rows.map(row=>`<div><span>${esc(row.name)}</span><b>Lv.${row.level}</b>${row.increase?`<small>${esc(row.increase)}</small>`:''}</div>`).join('')}</div>`;
}

function equipmentCard(item){
  const potential=item.potential.length?item.potential.map(x=>`<li>${esc(x)}</li>`).join(''):'<li class="muted">잠재 옵션 없음</li>';
  const additional=item.additional.length?item.additional.map(x=>`<li>${esc(x)}</li>`).join(''):'<li class="muted">에디셔널 없음</li>';
  return `<article class="equipment-card">
    <div class="equipment-top"><div class="equipment-icon">${item.icon?`<img src="${esc(item.icon)}" alt="${esc(item.name)}" loading="lazy">`:'<span>ITEM</span>'}</div><div><span>${esc(item.part)}</span><b>${esc(item.name)}</b><small>${item.starforce>0?`★ ${item.starforce}성`:'스타포스 없음/미확인'}</small></div></div>
    <div class="equipment-grades"><span class="grade-badge ${gradeClass(item.potentialGrade)}">잠재 ${esc(item.potentialGrade||'-')}</span><span class="grade-badge ${gradeClass(item.additionalGrade)}">에디 ${esc(item.additionalGrade||'-')}</span></div>
    <div class="equipment-options"><div><b>잠재</b><ul>${potential}</ul></div><div><b>에디셔널</b><ul>${additional}</ul></div></div>
    ${item.soul||item.soulOption?`<div class="equipment-soul"><b>소울</b><span>${esc(item.soul)} ${esc(item.soulOption)}</span></div>`:''}
  </article>`;
}

function unionMini(union){
  return `<div class="union-detail-head">${statCard('유니온 레벨',union.level?`Lv.${fmt(union.level)}`:'-')}${statCard('등급',esc(union.grade||'-'))}${statCard('아티팩트',union.artifactLevel?`Lv.${fmt(union.artifactLevel)}`:'-')}${statCard('점령 셀',union.cells||'-')}${statCard('프리셋',union.presetNo?`${union.presetNo}번`:'-')}${statCard('챔피언',union.championCount||'-')}</div><div class="effect-list">${union.effects.length?union.effects.map(x=>`<span>${esc(x)}</span>`).join(''):'점령 효과 데이터 없음'}</div>`;
}

function detailView(ctx,cs){
  const b=cs.bundle;
  if(!b)return `${header(ctx,'캐릭터 상세정보','장비·어빌리티·하이퍼스탯·유니온을 현재 API 데이터로 한 번에 확인합니다.')}${empty('상세정보를 보려면 분석 데이터를 먼저 갱신하세요.')}`;
  const eq=equipmentViews(b.equipment), ability=selectedAbility(b.ability), hyper=selectedHyper(b.hyper), union=unionSnapshot(b);
  const setCount=Array.isArray(b.setEffect?.set_effect)?b.setEffect.set_effect.length:0;
  return `${header(ctx,'캐릭터 상세정보','현재 장착 장비와 내실 상태를 API 데이터 그대로 확인합니다.')}${partialWarning(b)}
  <section class="opt-panel"><div class="opt-stat-grid detail-summary-grid">${statCard('장착 장비',`${eq.length}부위`)}${statCard('어빌리티',esc(ability.grade||'-'),ability.presetNo?`${ability.presetNo}번 프리셋`:undefined)}${statCard('하이퍼',`${hyper.presetNo}번 프리셋`)}${statCard('유니온',union.level?`Lv.${fmt(union.level)}`:'-')}${statCard('아티팩트',union.artifactLevel?`Lv.${fmt(union.artifactLevel)}`:'-')}${statCard('세트 효과',`${setCount}개`)}</div></section>
  <section class="opt-panel"><div class="opt-panel-title"><div><span>EQUIPMENT</span><h3>현재 장착 장비</h3></div><small>아이콘 · 스타포스 · 잠재 · 에디셔널</small></div><div class="equipment-grid">${eq.length?eq.map(equipmentCard).join(''):'<div class="spec-empty-line">장비 데이터를 불러오지 못했습니다.</div>'}</div></section>
  <section class="opt-two spec-pair"><div class="opt-panel"><div class="opt-panel-title"><div><span>ABILITY</span><h3>어빌리티</h3></div><small>${esc(ability.grade||'등급 미확인')}</small></div><div class="ability-list">${abilityLinesHtml(ability)}</div></div>
  <div class="opt-panel"><div class="opt-panel-title"><div><span>HYPER STAT</span><h3>하이퍼스탯</h3></div><small>${hyper.presetNo}번 프리셋</small></div>${hyperRowsHtml(hyper)}</div></section>
  <section class="opt-panel"><div class="opt-panel-title"><div><span>UNION</span><h3>유니온 정보</h3></div><small>공격대 · 점령효과 · 아티팩트 · 챔피언</small></div>${unionMini(union)}</section>`;
}

function overview(ctx,cs){
  const b=cs.bundle,s=b?combatSnapshot(b):null,route=bossRoute(ctx.character?.bossCap||''),unionLevel=b?.union?.union_level;
  const cards=[
    ['상세정보',b?`${equipmentViews(b.equipment).length}부위 · ${selectedAbility(b.ability).grade||'어빌리티'}`:'API 분석 필요','detail'],
    ['보스 루트',route.selected.length?`${route.selected.length}개 · ${compact(route.total)}`:'상한 미설정','boss'],
    ['보스 세팅',b?`방무 ${statValue(s,'ignoreDefense').toFixed(1)}% · 보공 ${statValue(s,'bossDamage').toFixed(1)}%`:'API 분석 필요','boss-opt'],
    ['유니온',unionLevel?`Lv.${fmt(unionLevel)}`:'API 분석 필요','union'],
    ['사냥 세팅',b?`일몹뎀 ${statValue(s,'normalDamage').toFixed(1)}%`:'API 분석 필요','hunt'],
    ['스펙업 순서',b?`${specUpgradePlan(b,ctx.character,cs.bossDefense||300).length}개 점검 항목`:'API 분석 필요','spec-order']
  ];
  return `${header(ctx,'최적화 컨트롤 센터','현재 상태를 먼저 확인하고 보스·사냥·유니온·스펙업 순서를 연결합니다.')}
  <div class="opt-command-grid">${cards.map(([t,v,tab])=>`<button class="opt-command" data-feature-tab="${tab}"><span>${t}</span><b>${v}</b><em>열기 →</em></button>`).join('')}</div>
  <section class="opt-panel"><div class="opt-panel-title"><div><span>QUICK DIAGNOSIS</span><h3>현재 병목</h3></div></div>${b?diagnosis(s,cs):empty('상세 스펙과 최적화 진단에 필요한 API를 한 번에 불러옵니다.')}</section>`;
}

function diagnosis(s,cs){
  const boss=bossRecommendations(s,cs.bossDefense||300).slice(0,3),hunt=huntingRecommendations(s).slice(0,3);
  return `<div class="diagnosis-grid"><div><h4>보스</h4>${boss.map((x,i)=>`<div class="diagnosis-row"><em>${i+1}</em><span><b>${x.title}</b><small>${x.reason}</small></span></div>`).join('')}</div><div><h4>사냥</h4>${hunt.map((x,i)=>`<div class="diagnosis-row"><em>${i+1}</em><span><b>${x.title}</b><small>${x.reason}</small></span></div>`).join('')}</div></div>`;
}

function bossHub(ctx,cs){
  const target=cs.bossTarget||ctx.character?.bossCap||'',route=bossRoute(target),selected=new Set(route.selected.map(x=>x.name));
  const options=`<option value="">상한 선택</option>`+BOSS_DB.map(b=>`<option ${b.name===target?'selected':''} value="${esc(b.name)}">${esc(b.name)} · ${compact(b.price)}</option>`).join('');
  return `${header(ctx,'보스 허브','보스 그림, 결정석 수익, 현재 상한과 주간 루트를 한 화면에서 관리합니다.')}
  <section class="opt-panel boss-route-panel"><div class="opt-control-line"><label>시뮬레이션 상한<select id="optBossTarget">${options}</select></label><div>${statCard('선정 결정석',`${route.selected.length}/12개`)}${statCard('예상 주간 수익',`${compact(route.total)} 메소`)}</div><button class="btn" id="applyBossTarget">현재 캐릭터에 상한 적용</button></div></section>
  <section class="opt-panel"><div class="opt-panel-title"><div><span>BOSS LIBRARY</span><h3>주간 보스 갤러리</h3></div><small>보스 자체가 식별되는 전용 초상 체계를 사용합니다.</small></div>
  <div class="boss-gallery">${bossCatalog().map(b=>{const [img,guide]=b.visual;return `<article class="boss-card ${selected.has(b.name)?'selected':''}"><a class="boss-art" href="${guide}" target="_blank" rel="noreferrer">${img?`<img src="${img}" alt="${esc(b.family)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="boss-fallback" hidden>${esc(b.family.slice(0,2))}</span>`:`<span class="boss-fallback">${esc(b.family.slice(0,2))}</span>`}</a><div class="boss-card-copy"><span>${selected.has(b.name)?'주간 루트 포함':'보스'}</span><b>${esc(b.name)}</b><strong>${compact(b.price)} 메소</strong></div></article>`}).join('')}</div></section>`;
}

function bossOptimizer(ctx,cs){
  const b=cs.bundle;if(!b)return `${header(ctx,'보스 세팅 최적화','현재 스탯·하이퍼·링크·유니온·어빌리티·무보엠을 함께 봅니다.')}${empty('보스 세팅 분석에 필요한 상세 API 데이터를 불러옵니다.')}`;
  const def=Number(cs.bossDefense||300),sum=bossSettingSummary(b,def),s=sum.stats,rec=bossRecommendations(s,def),links=linkSkills(b.link),index=bossDamageIndex(s,def);
  return `${header(ctx,'보스 세팅 최적화','MapleScouter의 현재/추천 분리 흐름을 참고해 실제 API 세팅과 병목을 함께 표시합니다.')}${partialWarning(b)}
  <section class="opt-panel"><div class="opt-control-line"><label>대상 보스 방어율<select id="bossDefense"><option value="300" ${def===300?'selected':''}>300%</option><option value="380" ${def===380?'selected':''}>380%</option></select></label><div class="boss-score"><span>현재 상대 지표</span><b>${index.toFixed(3)}</b><small>방무·보공·데미지·크뎀 기반 비교용 지표</small></div></div><div class="opt-stat-grid">${statCard('보스 데미지',`${s.bossDamage.toFixed(1)}%`)}${statCard('방어율 무시',`${s.ignoreDefense.toFixed(1)}%`,`권장선 ${sum.iedTarget}% 전후`)}${statCard('크리티컬 확률',`${s.critRate.toFixed(1)}%`)}${statCard('크리티컬 데미지',`${s.critDamage.toFixed(1)}%`)}${statCard('유니온',sum.union.level?`Lv.${fmt(sum.union.level)}`:'-')}${statCard('어빌리티',esc(sum.ability.grade||'-'))}</div></section>
  <section class="opt-two"><div class="opt-panel"><div class="opt-panel-title"><div><span>PRIORITY</span><h3>추천 조정 순서</h3></div></div><div class="priority-list">${rec.map((x,i)=>`<div class="priority-row"><em>${i+1}</em><span><b>${x.title}</b><small>${x.reason}</small></span><strong>${x.target!=null?`${x.current.toFixed(1)} → ${x.target}%`:'우선 검토'}</strong></div>`).join('')}</div></div>
  <div class="opt-panel"><div class="opt-panel-title"><div><span>CURRENT SETTING</span><h3>현재 하이퍼 · 어빌리티</h3></div></div>${hyperRowsHtml(sum.hyper)}<div class="ability-list compact-ability">${abilityLinesHtml(sum.ability)}</div></div></section>
  <section class="opt-two"><div class="opt-panel"><div class="opt-panel-title"><div><span>UNION TARGET</span><h3>보스용 유니온 배분</h3></div></div><div class="allocation-list">${sum.unionPlan.map((x,i)=>`<div><em>${i+1}</em><span><b>${esc(x.name)}</b><i style="width:${Math.round(x.weight*100)}%"></i></span><strong>${x.cells!=null?`${x.cells}셀 목표`:`${Math.round(x.weight*100)}%`}</strong></div>`).join('')}</div></div>
  <div class="opt-panel"><div class="opt-panel-title"><div><span>WSE / LINK</span><h3>무보엠 · 링크 확인</h3></div></div><div class="wse-list">${sum.keyEquipment.length?sum.keyEquipment.map(x=>`<div><span>${esc(x.part)}</span><b>${esc(x.name)}</b><small>${esc(x.potentialGrade||'-')} · ${esc(x.potential.join(' / ')||'잠재 없음')}</small></div>`).join(''):'무보엠 장비 데이터 없음'}</div><div class="link-chip-list">${links.length?links.map(x=>`<span>${x.icon?`<img src="${esc(x.icon)}" alt="">`:''}${esc(x.name)}${x.level?` Lv.${x.level}`:''}</span>`).join(''):'링크 스킬 데이터 없음'}</div></div></section>`;
}

function unionGrid(raider={}){
  const blocks=Array.isArray(raider.union_block)?raider.union_block:[],points=blocks.flatMap(b=>b.block_position||[]);
  if(!points.length)return '<div class="union-grid-empty">현재 응답에는 블록 좌표가 없습니다. 점령 효과 텍스트를 기준으로 분석합니다.</div>';
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=maxX-minX+1,h=maxY-minY+1;
  return `<div class="union-grid" style="--cols:${w};--rows:${h}">${Array.from({length:w*h},(_,i)=>{const x=i%w+minX,y=Math.floor(i/w)+minY,on=points.some(p=>p.x===x&&p.y===y);return`<i class="${on?'on':''}"></i>`}).join('')}</div>`;
}

function unionOptimizer(ctx,cs){
  const b=cs.bundle;if(!b)return `${header(ctx,'유니온 최적화','유니온 레벨·공격대·점령 효과·아티팩트를 API로 읽어 보스/사냥 프리셋을 비교합니다.')}${empty('유니온 API 데이터를 먼저 갱신하세요.')}`;
  const s=combatSnapshot(b),u=b.union||{},r=b.unionRaider||{},cells=unionCellCount(r),effects=unionEffects(r),profile=cs.unionProfile||'boss',plan=unionPlan(profile,cells,s);
  return `${header(ctx,'유니온 최적화','보스용과 사냥용 점령 우선순위를 분리하고 현재 배치 효과를 비교합니다.')}${partialWarning(b)}
  <section class="opt-panel"><div class="opt-stat-grid">${statCard('유니온 레벨',fmt(u.union_level))}${statCard('등급',esc(u.union_grade||'-'))}${statCard('아티팩트 레벨',fmt(u.union_artifact_level))}${statCard('배치 셀',cells||'-')}${statCard('현재 프리셋',r.use_preset_no?`${r.use_preset_no}번`:'-')}</div></section>
  <section class="opt-two"><div class="opt-panel"><div class="opt-panel-title"><div><span>RAIDER MAP</span><h3>현재 공격대 배치</h3></div></div>${unionGrid(r)}<div class="effect-list">${effects.length?effects.map(x=>`<span>${esc(x)}</span>`).join(''):'점령 효과 데이터 없음'}</div></div>
  <div class="opt-panel"><div class="opt-panel-title"><div><span>OPTIMIZER</span><h3>추천 점령 우선순위</h3></div><div class="segmented"><button data-union-profile="boss" class="${profile==='boss'?'active':''}">보스</button><button data-union-profile="hunt" class="${profile==='hunt'?'active':''}">사냥</button></div></div><div class="allocation-list">${plan.map((x,i)=>`<div><em>${i+1}</em><span><b>${x.name}</b><i style="width:${Math.round(x.weight*100)}%"></i></span><strong>${x.cells!=null?`${x.cells}셀 목표`:`${Math.round(x.weight*100)}%`}</strong></div>`).join('')}</div><p class="opt-note">현재 버전은 점령 효과 배분 목표이며 실제 블록 폴리오미노 자동 배치 solver는 아닙니다.</p></div></section>`;
}

function huntOptimizer(ctx,cs){
  const b=cs.bundle;if(!b)return `${header(ctx,'사냥 세팅 최적화','사냥용 하이퍼·유니온·링크·어빌리티를 보스용과 분리합니다.')}${empty('사냥 세팅 분석에 필요한 API 데이터를 불러옵니다.')}`;
  const sum=huntingSettingSummary(b),s=sum.stats,rec=huntingRecommendations(s),lv=Number(ctx.character?.api?.basic?.character_level||ctx.character?.cachedLevel||0),regions=SYMBOL_DB.filter(x=>x.unlock<=lv).map(x=>x.region),latest=regions.at(-1)||'아케인리버 이전';
  return `${header(ctx,'사냥 세팅 최적화','사냥컷을 임의 생성하지 않고 현재 하이퍼·유니온·어빌리티의 사냥 병목을 정리합니다.')}${partialWarning(b)}
  <section class="opt-panel"><div class="opt-stat-grid">${statCard('현재 레벨',`Lv.${lv||'-'}`)}${statCard('최신 해금 지역',esc(latest))}${statCard('일반 몬스터 데미지',`${s.normalDamage.toFixed(1)}%`)}${statCard('크리티컬 확률',`${s.critRate.toFixed(1)}%`)}${statCard('크리티컬 데미지',`${s.critDamage.toFixed(1)}%`)}${statCard('몬파 주간 배정',`${ctx.character?.mpRuns||0}/14회`)}</div></section>
  <section class="opt-two"><div class="opt-panel"><div class="opt-panel-title"><div><span>HUNT PRIORITY</span><h3>사냥 세팅 추천</h3></div></div><div class="priority-list">${rec.map((x,i)=>`<div class="priority-row"><em>${i+1}</em><span><b>${x.title}</b><small>${x.reason}</small></span><strong>${x.target!=null?`${x.current.toFixed(1)} → ${x.target}%`:'강화 우선'}</strong></div>`).join('')}</div></div>
  <div class="opt-panel"><div class="opt-panel-title"><div><span>CURRENT PRESET</span><h3>사냥용 하이퍼 · 어빌리티</h3></div></div>${hyperRowsHtml(sum.hyper)}<div class="ability-list compact-ability">${abilityLinesHtml(sum.ability)}</div>${sum.farmingAbility.length?`<div class="farm-ability-note">사냥 관련 어빌리티: ${sum.farmingAbility.map(x=>esc(x.value)).join(' · ')}</div>`:''}</div></section>
  <section class="opt-two"><div class="opt-panel"><div class="opt-panel-title"><div><span>UNION TARGET</span><h3>사냥용 유니온 배분</h3></div></div><div class="allocation-list">${sum.unionPlan.map((x,i)=>`<div><em>${i+1}</em><span><b>${esc(x.name)}</b><i style="width:${Math.round(x.weight*100)}%"></i></span><strong>${x.cells!=null?`${x.cells}셀 목표`:`${Math.round(x.weight*100)}%`}</strong></div>`).join('')}</div></div>
  <div class="opt-panel"><div class="opt-panel-title"><div><span>CHECKLIST</span><h3>사냥 프리셋 체크</h3></div></div><div class="hunt-checks"><label><input type="checkbox" ${s.critRate>=100?'checked':''} disabled><span><b>크확 100%</b><small>설치기 포함 안정적인 크리티컬</small></span></label><label><input type="checkbox" ${s.normalDamage>0?'checked':''} disabled><span><b>일반 몬스터 데미지</b><small>하이퍼 사냥 프리셋 확인</small></span></label><label><input type="checkbox" ${ctx.character?.dailyExpEnabled!==false?'checked':''} disabled><span><b>일퀘 EXP 루틴</b><small>현재 레벨 ETA에 반영 중</small></span></label><label><input type="checkbox" ${(ctx.character?.mpRuns||0)>0?'checked':''} disabled><span><b>몬스터파크 배정</b><small>주간 무료분 배정</small></span></label></div></div></section>`;
}

function specOrderView(ctx,cs){
  const b=cs.bundle;if(!b)return `${header(ctx,'스펙업 순서','장비·내실·보스 핵심 스탯을 읽고 다음 점검 순서를 정리합니다.')}${empty('스펙업 순서를 만들려면 상세 API 데이터가 필요합니다.')}`;
  const plan=specUpgradePlan(b,ctx.character,Number(cs.bossDefense||300));
  return `${header(ctx,'스펙업 순서','MapleScouter의 효율 비교 흐름을 참고하되 비용 데이터가 없는 항목은 정확한 최종뎀 효율로 과장하지 않습니다.')}${partialWarning(b)}
  <section class="spec-order-hero"><div><span>UPGRADE ROADMAP</span><h3>현재 API 기준 우선순위</h3><p>시세·이벤트·직업별 세부 효율이 없는 상태에서는 명확한 저점과 세팅 병목부터 정리합니다.</p></div><strong>${plan.length}개 점검</strong></section>
  <section class="spec-order-list">${plan.map(row=>`<article class="spec-order-card tier-${row.tier==='최우선'?'top':row.tier==='단기'?'short':row.tier==='중기'?'mid':'check'}"><em>${row.rank}</em><div class="spec-order-main"><div><span>${esc(row.category)} · ${esc(row.tier)}</span><h4>${esc(row.title)}</h4></div><div class="spec-current-goal"><span><small>현재</small><b>${esc(row.current)}</b></span><i>→</i><span><small>목표/방향</small><b>${esc(row.goal)}</b></span></div><p>${esc(row.reason)}</p></div></article>`).join('')}</section>
  <div class="spec-disclaimer"><b>해석 기준</b><span>이 순서는 공개 API에서 확인 가능한 스탯/장비 상태 기반 heuristic입니다. 실제 메소 대비 최종뎀 효율은 시세·이벤트·직업/스킬 구조·보유 자원 입력이 있어야 계산할 수 있습니다.</span></div>`;
}

function renderFeatureShell(){
  const ctx=context(),cs=charStore(ctx),tab=activeTab(),workspace=$('#optimizationWorkspace'),dash=$('.dashboard-grid');
  document.querySelectorAll('[data-feature-tab],[data-mm-feature]').forEach(b=>b.classList.toggle('active',(b.dataset.featureTab||b.dataset.mmFeature)===tab));
  if(tab==='dashboard'){
    if(dash)dash.hidden=false;
    if(workspace){workspace.hidden=true;workspace.innerHTML=''}
    return;
  }
  if(dash)dash.hidden=true;
  if(!workspace)return;
  workspace.hidden=false;
  if(!ctx.character){workspace.innerHTML='<div class="opt-empty"><b>캐릭터를 선택하세요.</b><span>좌측 캐릭터 목록에서 분석할 캐릭터를 선택합니다.</span></div>';return}
  const views={detail:detailView,overview,boss:bossHub,'boss-opt':bossOptimizer,union:unionOptimizer,hunt:huntOptimizer,'spec-order':specOrderView};
  workspace.innerHTML=(views[tab]||overview)(ctx,cs);
  wire(ctx,cs);
}

function wire(ctx,cs){
  document.querySelectorAll('[data-opt-refresh]').forEach(b=>b.onclick=refreshBundle);
  document.querySelectorAll('[data-feature-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.featureTab));
  const target=$('#optBossTarget');if(target)target.onchange=e=>{cs.bossTarget=e.target.value;saveStore();renderFeatureShell()};
  const apply=$('#applyBossTarget');if(apply)apply.onclick=()=>{
    const state=readMain(),w=state.worlds?.[ctx.accountId],c=w?.characters?.find(x=>x.name===ctx.character.name);if(!c)return;
    c.bossCap=cs.bossTarget||'';localStorage.setItem(MAIN_KEY,JSON.stringify(state));location.reload();
  };
  const defense=$('#bossDefense');if(defense)defense.onchange=e=>{cs.bossDefense=Number(e.target.value);saveStore();renderFeatureShell()};
  document.querySelectorAll('[data-union-profile]').forEach(b=>b.onclick=()=>{cs.unionProfile=b.dataset.unionProfile;saveStore();renderFeatureShell()});
}

function bindGlobal(){
  document.querySelectorAll('[data-feature-tab],[data-mm-feature]').forEach(b=>b.onclick=()=>setTab(b.dataset.featureTab||b.dataset.mmFeature));
  document.addEventListener('click',e=>{if(e.target.closest('.roster-item,.account-tab'))setTimeout(renderFeatureShell,50)});
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,select,textarea'))return;
    if(e.key==='/'){e.preventDefault();$('#characterNameInput')?.focus()}
    const tabs={'1':'dashboard','2':'detail','3':'overview','4':'boss','5':'union','6':'hunt','7':'spec-order'};if(tabs[e.key])setTab(tabs[e.key]);
  });
  window.addEventListener('storage',renderFeatureShell);
  setInterval(()=>{const ctx=context(),sig=`${ctx.accountId}:${ctx.character?.name||''}`;if(sig!==bindGlobal.last){bindGlobal.last=sig;renderFeatureShell()}},1000);
}

bindGlobal();
renderFeatureShell();
