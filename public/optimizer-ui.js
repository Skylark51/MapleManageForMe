import { buildDiffRows, optimizeSettings } from './optimizer-engine.js';

const MAIN_KEY='maple-personal-manager-v3';
const STORE_KEY='maplemanage:optimization-v1';
const TAB_KEY='maplemanage:feature-tab';
let queued=false;

const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return{}}}
function context(){
  const state=read(MAIN_KEY),accountId=state.activeWorld||'account1',world=state.worlds?.[accountId];
  const character=world?.characters?.find(c=>c.name===world.selectedCharacter)||world?.characters?.[0];
  const entry=read(STORE_KEY)?.[`${accountId}:${character?.name||'none'}`];
  return {accountId,character,bundle:entry?.bundle||null,bossDefense:Number(entry?.bossDefense||300)};
}
function num(v,d=2){return Number.isFinite(Number(v))?Number(v).toFixed(d):'-'}
function diffTable(rows,title){
  const useful=rows.filter(r=>r.current||r.optimized);
  return `<div class="calc-block"><div class="calc-title"><b>${title}</b><span>현재 → 계산 추천</span></div><div class="calc-rows">${useful.length?useful.map(r=>`<div class="calc-row ${r.current===r.optimized?'same':''}"><span>${esc(r.label)}</span><b>${r.unit}${r.current}</b><i>→</i><strong>${r.unit}${r.optimized}</strong></div>`).join(''):'<div class="calc-empty">재배분 가능한 데이터가 없습니다.</div>'}</div></div>`;
}
function reportPanel(report,mode){
  const hyper=buildDiffRows(report.currentHyper,report.optimizedHyper,'hyper');
  const union=buildDiffRows(report.currentUnion,report.optimizedUnion,'union');
  const gain=Math.max(-99,report.gainPct||0);
  return `<section class="opt-panel real-optimizer" data-mm-real-optimizer>
    <div class="opt-panel-title"><div><span>CALCULATED OPTIMIZER</span><h3>${mode==='boss'?'보스':'사냥'} 세팅 계산 최적화</h3></div><small>API 현재값 + 공식 하이퍼/유니온 수치 기반</small></div>
    <div class="calc-kpis"><div><span>현재 상대지표</span><b>100.00</b></div><div class="recommended"><span>추천 상대지표</span><b>${num(100*(1+gain/100),2)}</b></div><div class="gain"><span>재배치 기대 변화</span><b>${gain>=0?'+':''}${num(gain,2)}%</b></div><div><span>하이퍼 포인트</span><b>${Math.round(report.hyperPoints||0).toLocaleString('ko-KR')}</b></div><div><span>유니온 특수칸</span><b>${Math.round(report.unionCells||0)}${report.unionEstimated?'*':''}</b></div></div>
    <div class="calc-grid">${diffTable(hyper,'하이퍼스탯')}${diffTable(union,'유니온 점령')}</div>
    <div class="calc-logic"><b>계산 로직</b><span>${mode==='boss'?'크확은 100%에서 상한 처리하고, 보공·데미지·크뎀·공/마·주스탯과 방무를 함께 비교합니다. 방무는 곱연산으로 적용한 뒤 대상 보스 방어율을 반영합니다.':'크확 100% 상한, 일몹뎀·데미지·크뎀·공/마·주스탯을 동시에 비교합니다.'} 각 다음 레벨/칸의 <em>상대 화력 증가량 ÷ 소모 포인트</em>가 가장 큰 항목을 반복 선택합니다.</span></div>
    ${report.unionEstimated?'<p class="calc-warning">* 유니온 특수칸을 직접 복원하지 못해 전체 배치 셀에서 내부 15칸을 제외한 값으로 추정했습니다.</p>':''}
    <p class="calc-disclaimer">MapleScouter의 비공개 환산식을 복제한 최종뎀이 아니라, 현재 공개 API 값에서 동일 자원을 재배치했을 때의 비교 지표입니다. 링크/어빌리티 조건부 효과와 직업별 딜사이클은 별도 판단 대상입니다.</p>
  </section>`;
}
function specPanel(bundle,def){
  const boss=optimizeSettings(bundle,'boss',def),hunt=optimizeSettings(bundle,'hunt',def);
  return `<section class="opt-panel real-optimizer spec-free-opt" data-mm-real-optimizer><div class="opt-panel-title"><div><span>FREE REALLOCATION FIRST</span><h3>메소 쓰기 전 세팅 재배치</h3></div><small>현재 보유 포인트/칸만 재배치</small></div><div class="calc-kpis"><div><span>보스 상대지표</span><b>${boss.gainPct>=0?'+':''}${num(boss.gainPct,2)}%</b></div><div><span>사냥 상대지표</span><b>${hunt.gainPct>=0?'+':''}${num(hunt.gainPct,2)}%</b></div></div><p class="calc-disclaimer">양수라면 장비 구매 전 하이퍼/유니온 프리셋을 먼저 조정할 여지가 있다는 뜻입니다. 0%에 가까우면 현재 배분이 이 근사 모델에서 이미 효율적인 편입니다.</p></section>`;
}
function render(){
  const workspace=document.querySelector('#optimizationWorkspace');if(!workspace||workspace.hidden)return;
  const tab=localStorage.getItem(TAB_KEY)||'dashboard';if(!['boss-opt','hunt','spec-order'].includes(tab))return;
  const ctx=context();if(!ctx.bundle)return;
  const signature=[tab,ctx.accountId,ctx.character?.name||'',ctx.bossDefense,ctx.bundle.fetchedAt||''].join('|');
  const existing=workspace.querySelector('[data-mm-real-optimizer]');
  if(existing?.dataset.mmSignature===signature)return;
  workspace.querySelectorAll('[data-mm-real-optimizer]').forEach(n=>n.remove());
  let html='';
  if(tab==='boss-opt')html=reportPanel(optimizeSettings(ctx.bundle,'boss',ctx.bossDefense),'boss');
  else if(tab==='hunt')html=reportPanel(optimizeSettings(ctx.bundle,'hunt',ctx.bossDefense),'hunt');
  else html=specPanel(ctx.bundle,ctx.bossDefense);
  const first=workspace.querySelector('.opt-panel,.spec-order-hero');
  if(first)first.insertAdjacentHTML('afterend',html);else workspace.insertAdjacentHTML('beforeend',html);
  const inserted=workspace.querySelector('[data-mm-real-optimizer]');if(inserted)inserted.dataset.mmSignature=signature;
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
window.addEventListener('storage',schedule);window.addEventListener('focus',schedule);
setTimeout(render,0);
