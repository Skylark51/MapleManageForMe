import { BOSS_DB, SYMBOL_DB } from './core.js';
import { fetchOptimizationBundle } from './insights-api.js';
import { fetchCharacter } from './account-api.js';
import {
  bossCatalog,bossRoute,combatSnapshot,bossRecommendations,huntingRecommendations,
  unionCellCount,unionEffects,unionPlan,flattenHyper,linkSkills,bossDamageIndex
} from './optimization-core.js';

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
  return `<div class="opt-head"><div><span>ANALYSIS & OPTIMIZATION</span><h2>${title}</h2><p>${desc}</p></div><div class="opt-head-actions"><span class="opt-character-chip">${esc(ctx.character?.name||'캐릭터 미선택')}</span><button class="btn primary" data-opt-refresh>분석 데이터 갱신</button></div></div>`;
}

function overview(ctx,cs){
  const b=cs.bundle,s=b?combatSnapshot(b):null;
  const route=bossRoute(ctx.character?.bossCap||'');
  const unionLevel=b?.union?.union_level;
  const cards=[
    ['보스 루트',route.selected.length?`${route.selected.length}개 · ${compact(route.total)}`:'상한 미설정','boss'],
    ['보스 세팅',b?`방무 ${statValue(s,'ignoreDefense').toFixed(1)}% · 보공 ${statValue(s,'bossDamage').toFixed(1)}%`:'API 분석 필요','boss-opt'],
    ['유니온',unionLevel?`Lv.${fmt(unionLevel)}`:'API 분석 필요','union'],
    ['사냥 세팅',b?`일몹뎀 ${statValue(s,'normalDamage').toFixed(1)}%`:'API 분석 필요','hunt']
  ];
  return `${header(ctx,'최적화 컨트롤 센터','캐릭터의 현재 상태를 읽고 보스·유니온·사냥 프리셋을 분리해 관리합니다.')}
  <div class="opt-command-grid">${cards.map(([t,v,tab])=>`<button class="opt-command" data-feature-tab="${tab}"><span>${t}</span><b>${v}</b><em>열기 →</em></button>`).join('')}</div>
  <section class="opt-panel"><div class="opt-panel-title"><div><span>QUICK DIAGNOSIS</span><h3>현재 병목</h3></div></div>
  ${b?diagnosis(s,cs):empty('보스/유니온/사냥 진단에 필요한 추가 API를 한 번에 불러옵니다.')}</section>`;
}

function diagnosis(s,cs){
  const boss=bossRecommendations(s,cs.bossDefense||300).slice(0,3);
  const hunt=huntingRecommendations(s).slice(0,3);
  return `<div class="diagnosis-grid"><div><h4>보스</h4>${boss.map((x,i)=>`<div class="diagnosis-row"><em>${i+1}</em><span><b>${x.title}</b><small>${x.reason}</small></span></div>`).join('')}</div><div><h4>사냥</h4>${hunt.map((x,i)=>`<div class="diagnosis-row"><em>${i+1}</em><span><b>${x.title}</b><small>${x.reason}</small></span></div>`).join('')}</div></div>`;
}

function bossHub(ctx,cs){
  const target=cs.bossTarget||ctx.character?.bossCap||'';
  const route=bossRoute(target);
  const selected=new Set(route.selected.map(x=>x.name));
  const options=`<option value="">상한 선택</option>`+BOSS_DB.map(b=>`<option ${b.name===target?'selected':''} value="${esc(b.name)}">${esc(b.name)} · ${compact(b.price)}</option>`).join('');
  return `${header(ctx,'보스 허브','보스 그림, 결정석 수익, 현재 상한과 주간 루트를 한 화면에서 관리합니다.')}
  <section class="opt-panel boss-route-panel"><div class="opt-control-line"><label>시뮬레이션 상한<select id="optBossTarget">${options}</select></label><div>${statCard('선정 결정석',`${route.selected.length}/12개`)}${statCard('예상 주간 수익',`${compact(route.total)} 메소`)}</div><button class="btn" id="applyBossTarget">현재 캐릭터에 상한 적용</button></div></section>
  <section class="opt-panel"><div class="opt-panel-title"><div><span>BOSS LIBRARY</span><h3>주간 보스 갤러리</h3></div><small>이미지는 NEXON 공식 보스 가이드 자산을 우선 사용합니다.</small></div>
  <div class="boss-gallery">${bossCatalog().map(b=>{const [img,guide]=b.visual;return `<article class="boss-card ${selected.has(b.name)?'selected':''}"><a class="boss-art" href="${guide}" target="_blank" rel="noreferrer">${img?`<img src="${img}" alt="${esc(b.family)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="boss-fallback" hidden>${esc(b.family.slice(0,2))}</span>`:`<span class="boss-fallback">${esc(b.family.slice(0,2))}</span>`}</a><div class="boss-card-copy"><span>${selected.has(b.name)?'주간 루트 포함':'보스'}</span><b>${esc(b.name)}</b><strong>${compact(b.price)} 메소</strong></div></article>`}).join('')}</div></section>`;
}

function bossOptimizer(ctx,cs){
  const b=cs.bundle;if(!b)return `${header(ctx,'보스 세팅 최적화','현재 스탯·하이퍼·링크·유니온을 API로 읽어 우선순위를 제안합니다.')}${empty('전투력뿐 아니라 하이퍼스탯, 링크스킬, 유니온까지 추가 조회합니다.')}`;
  const s=combatSnapshot(b),def=Number(cs.bossDefense||300),rec=bossRecommendations(s,def),hyper=flattenHyper(b.hyper),links=linkSkills(b.link),index=bossDamageIndex(s,def);
  return `${header(ctx,'보스 세팅 최적화','정확한 환산식 복제가 아니라 현재 공개 스탯에서 병목을 찾는 개인용 프리셋 플래너입니다.')}
  <section class="opt-panel"><div class="opt-control-line"><label>대상 보스 방어율<select id="bossDefense"><option value="300" ${def===300?'selected':''}>300%</option><option value="380" ${def===380?'selected':''}>380%</option></select></label><div class="boss-score"><span>현재 상대 지표</span><b>${index.toFixed(3)}</b><small>방무·보공·데미지·크뎀을 이용한 비교용 지표</small></div></div>
  <div class="opt-stat-grid">${statCard('보스 데미지',`${s.bossDamage.toFixed(1)}%`)}${statCard('방어율 무시',`${s.ignoreDefense.toFixed(1)}%`)}${statCard('크리티컬 확률',`${s.critRate.toFixed(1)}%`)}${statCard('크리티컬 데미지',`${s.critDamage.toFixed(1)}%`)}${statCard('데미지',`${s.damage.toFixed(1)}%`)}${statCard('전투력',fmt(s.combatPower))}</div></section>
  <section class="opt-two"><div class="opt-panel"><div class="opt-panel-title"><div><span>PRIORITY</span><h3>추천 투자 순서</h3></div></div><div class="priority-list">${rec.map((x,i)=>`<div class="priority-row"><em>${i+1}</em><span><b>${x.title}</b><small>${x.reason}</small></span><strong>${x.target!=null?`${x.current.toFixed(1)} → ${x.target}%`:'우선순위'}</strong></div>`).join('')}</div></div>
  <div class="opt-panel"><div class="opt-panel-title"><div><span>CURRENT PRESET</span><h3>현재 하이퍼 / 링크</h3></div></div><div class="mini-list"><b>하이퍼스탯</b>${hyper.length?hyper.slice(0,12).map(x=>`<span>${esc(x.name)} <em>Lv.${x.level}</em></span>`).join(''):'<small>프리셋 구조를 읽지 못했거나 데이터가 없습니다.</small>'}</div><div class="link-chip-list">${links.length?links.map(x=>`<span>${x.icon?`<img src="${esc(x.icon)}" alt="">`:''}${esc(x.name)}${x.level?` Lv.${x.level}`:''}</span>`).join(''):'링크 스킬 데이터 없음'}</div></div></section>`;
}

function unionGrid(raider={}){
  const blocks=Array.isArray(raider.union_block)?raider.union_block:[];
  const points=blocks.flatMap(b=>b.block_position||[]);
  if(!points.length)return '<div class="union-grid-empty">현재 응답에는 블록 좌표가 없습니다. 점령 효과 텍스트를 기준으로 분석합니다.</div>';
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=maxX-minX+1,h=maxY-minY+1;
  return `<div class="union-grid" style="--cols:${w};--rows:${h}">${Array.from({length:w*h},(_,i)=>{const x=i%w+minX,y=Math.floor(i/w)+minY,on=points.some(p=>p.x===x&&p.y===y);return`<i class="${on?'on':''}"></i>`}).join('')}</div>`;
}

function unionOptimizer(ctx,cs){
  const b=cs.bundle;if(!b)return `${header(ctx,'유니온 최적화','유니온 레벨·공격대·점령 효과·아티팩트를 API로 읽어 보스/사냥 프리셋을 비교합니다.')}${empty('유니온 API는 현재 캐릭터 OCID 기준으로 계정 유니온 정보를 조회합니다.')}`;
  const s=combatSnapshot(b),u=b.union||{},r=b.unionRaider||{},cells=unionCellCount(r),effects=unionEffects(r),profile=cs.unionProfile||'boss',plan=unionPlan(profile,cells,s);
  return `${header(ctx,'유니온 최적화','보스용과 사냥용 점령 우선순위를 분리하고 현재 배치의 효과를 한 화면에서 비교합니다.')}
  <section class="opt-panel"><div class="opt-stat-grid">${statCard('유니온 레벨',fmt(u.union_level))}${statCard('등급',esc(u.union_grade||'-'))}${statCard('아티팩트 레벨',fmt(u.union_artifact_level))}${statCard('배치 셀',cells||'-')}${statCard('현재 프리셋',r.use_preset_no?`${r.use_preset_no}번`:'-')}</div></section>
  <section class="opt-two"><div class="opt-panel"><div class="opt-panel-title"><div><span>RAIDER MAP</span><h3>현재 공격대 배치</h3></div></div>${unionGrid(r)}<div class="effect-list">${effects.length?effects.map(x=>`<span>${esc(x)}</span>`).join(''):'점령 효과 데이터 없음'}</div></div>
  <div class="opt-panel"><div class="opt-panel-title"><div><span>OPTIMIZER</span><h3>추천 점령 우선순위</h3></div><div class="segmented"><button data-union-profile="boss" class="${profile==='boss'?'active':''}">보스</button><button data-union-profile="hunt" class="${profile==='hunt'?'active':''}">사냥</button></div></div><div class="allocation-list">${plan.map((x,i)=>`<div><em>${i+1}</em><span><b>${x.name}</b><i style="width:${Math.round(x.weight*100)}%"></i></span><strong>${x.cells!=null?`${x.cells}셀 목표`:`${Math.round(x.weight*100)}%`}</strong></div>`).join('')}</div><p class="opt-note">실제 블록 좌표 자동 재배치는 직업 블록 형태와 프리셋 제약이 있어, 현재 단계에서는 점령 효과 배분 목표를 제안합니다.</p></div></section>`;
}

function huntOptimizer(ctx,cs){
  const b=cs.bundle;if(!b)return `${header(ctx,'사냥 최적화','사냥용 하이퍼·유니온·링크 프리셋을 보스용과 분리합니다.')}${empty('일반 몬스터 데미지와 현재 프리셋을 분석하려면 추가 API 데이터가 필요합니다.')}`;
  const s=combatSnapshot(b),rec=huntingRecommendations(s),lv=Number(ctx.character?.api?.basic?.character_level||ctx.character?.cachedLevel||0),regions=SYMBOL_DB.filter(x=>x.unlock<=lv).map(x=>x.region),latest=regions.at(-1)||'아케인리버 이전';
  return `${header(ctx,'사냥 최적화','원킬컷 자체를 임의로 단정하지 않고, API에서 확인되는 사냥 관련 스탯과 프리셋 병목을 정리합니다.')}
  <section class="opt-panel"><div class="opt-stat-grid">${statCard('현재 레벨',`Lv.${lv||'-'}`)}${statCard('최신 해금 지역',esc(latest))}${statCard('일반 몬스터 데미지',`${s.normalDamage.toFixed(1)}%`)}${statCard('크리티컬 확률',`${s.critRate.toFixed(1)}%`)}${statCard('크리티컬 데미지',`${s.critDamage.toFixed(1)}%`)}${statCard('몬파 주간 배정',`${ctx.character?.mpRuns||0}/14회`)}</div></section>
  <section class="opt-two"><div class="opt-panel"><div class="opt-panel-title"><div><span>HUNT PRESET</span><h3>사냥 세팅 추천</h3></div></div><div class="priority-list">${rec.map((x,i)=>`<div class="priority-row"><em>${i+1}</em><span><b>${x.title}</b><small>${x.reason}</small></span><strong>${x.target!=null?`${x.current.toFixed(1)} → ${x.target}%`:'강화 우선'}</strong></div>`).join('')}</div></div>
  <div class="opt-panel"><div class="opt-panel-title"><div><span>CHECKLIST</span><h3>사냥 프리셋 체크</h3></div></div><div class="hunt-checks"><label><input type="checkbox" ${s.critRate>=100?'checked':''} disabled><span><b>크확 100%</b><small>설치기 포함 안정적인 크리티컬</small></span></label><label><input type="checkbox" ${s.normalDamage>0?'checked':''} disabled><span><b>일반 몬스터 데미지</b><small>하이퍼 사냥 프리셋 확인</small></span></label><label><input type="checkbox" ${ctx.character?.dailyExpEnabled!==false?'checked':''} disabled><span><b>일퀘 EXP 루틴</b><small>현재 레벨 ETA에 반영 중</small></span></label><label><input type="checkbox" ${(ctx.character?.mpRuns||0)>0?'checked':''} disabled><span><b>몬스터파크 배정</b><small>주간 무료분 배정</small></span></label></div></div></section>`;
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
  const views={overview,boss:bossHub,'boss-opt':bossOptimizer,union:unionOptimizer,hunt:huntOptimizer};
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
    const tabs={'1':'dashboard','2':'overview','3':'boss','4':'union','5':'hunt'};if(tabs[e.key])setTab(tabs[e.key]);
  });
  window.addEventListener('storage',renderFeatureShell);
  setInterval(()=>{const ctx=context(),sig=`${ctx.accountId}:${ctx.character?.name||''}`;if(sig!==bindGlobal.last){bindGlobal.last=sig;renderFeatureShell()}},1000);
}

bindGlobal();
renderFeatureShell();
