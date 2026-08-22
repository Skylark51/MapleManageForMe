import { bossFamilyName, bossPortraitAlt, bossPortraitCandidates } from './boss-portrait-data.js';

let scheduled=false;

function applyPortrait(img,name){
  const candidates=bossPortraitCandidates(name);
  if(!candidates.length)return false;
  if(img.dataset.mmBossPortrait===name)return true;
  img.dataset.mmBossPortrait=name;
  img.dataset.mmBossPortraitIndex='0';
  img.alt=bossPortraitAlt(name);
  img.referrerPolicy='no-referrer';
  img.loading='lazy';
  img.hidden=false;
  img.onerror=()=>{
    const next=Number(img.dataset.mmBossPortraitIndex||0)+1;
    if(next<candidates.length){
      img.dataset.mmBossPortraitIndex=String(next);
      img.src=candidates[next];
      return;
    }
    img.hidden=true;
    const fallback=img.parentElement?.querySelector('.boss-name-fallback,.boss-fallback');
    if(fallback){
      fallback.hidden=false;
      fallback.textContent=bossFamilyName(name);
      fallback.classList.add('boss-name-fallback');
    }
  };
  img.onload=()=>{
    img.hidden=false;
    const fallback=img.parentElement?.querySelector('.boss-name-fallback,.boss-fallback');
    if(fallback)fallback.hidden=true;
  };
  img.src=candidates[0];
  return true;
}

function ensureManualPortrait(button){
  const name=button.dataset.manualBoss||button.querySelector('.manual-boss-copy b')?.textContent?.trim();
  if(!name)return;
  const frame=button.querySelector('.manual-boss-image');
  if(!frame)return;
  let img=frame.querySelector('img');
  let fallback=frame.querySelector('.boss-name-fallback');
  if(!img){
    frame.textContent='';
    img=document.createElement('img');
    frame.appendChild(img);
  }
  if(!fallback){
    fallback=document.createElement('span');
    fallback.className='boss-name-fallback';
    fallback.hidden=true;
    frame.appendChild(fallback);
  }
  applyPortrait(img,name);
}

function ensureGalleryPortrait(card){
  const name=card.querySelector('.boss-card-copy b')?.textContent?.trim();
  if(!name)return;
  const frame=card.querySelector('.boss-art');
  if(!frame)return;
  let img=frame.querySelector('img');
  let fallback=frame.querySelector('.boss-fallback,.boss-name-fallback');
  if(!img){
    img=document.createElement('img');
    frame.prepend(img);
  }
  if(!fallback){
    fallback=document.createElement('span');
    fallback.className='boss-fallback boss-name-fallback';
    fallback.hidden=true;
    frame.appendChild(fallback);
  }
  applyPortrait(img,name);
}

function repairBossPortraits(){
  document.querySelectorAll('.manual-boss-button').forEach(ensureManualPortrait);
  document.querySelectorAll('.boss-gallery .boss-card').forEach(ensureGalleryPortrait);
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    repairBossPortraits();
  });
}

new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
window.addEventListener('focus',schedule);
repairBossPortraits();
