import { combatSnapshot, effectiveDefenseMultiplier, statMap, unionCellCount } from './optimization-core.js';

export const HYPER_NEXT_COST=[0,1,2,4,8,10,15,20,25,30,35,50,65,80,95,110];
const HYPER_KEYS=['mainStat','critRate','critDamage','ignoreDefense','damage','bossDamage','normalDamage','attackMagic'];
const UNION_EFFECT={critRate:1,critDamage:0.5,ignoreDefense:1,bossDamage:1,normalDamage:1,exp:0.25};
const UNION_CAP=40;

const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const clone=(v)=>JSON.parse(JSON.stringify(v));

export function hyperPointCost(level=0){
  const lv=clamp(level,0,15);
  let total=0;
  for(let i=1;i<=lv;i+=1) total+=HYPER_NEXT_COST[i];
  return total;
}

export function hyperEffect(key,level=0){
  const lv=clamp(level,0,15);
  if(key==='critRate') return lv<=5?lv:5+(lv-5)*2;
  if(key==='critDamage') return lv;
  if(key==='ignoreDefense'||key==='damage') return lv*3;
  if(key==='bossDamage'||key==='normalDamage') return lv<=5?lv*3:15+(lv-5)*4;
  if(key==='attackMagic') return lv*3;
  if(key==='mainStat') return lv*30;
  return 0;
}

export function canonicalHyperName(name=''){
  const s=String(name).replace(/\s+/g,'');
  if(/크리티컬(발동)?확률|크확/.test(s)) return 'critRate';
  if(/크리티컬데미지|크뎀/.test(s)) return 'critDamage';
  if(/방어율무시|방무/.test(s)) return 'ignoreDefense';
  if(/보스몬스터.*데미지|보스.*데미지|보공/.test(s)) return 'bossDamage';
  if(/일반몬스터.*데미지|일몹/.test(s)) return 'normalDamage';
  if(/^데미지/.test(s)) return 'damage';
  if(/공격력.*마력|공격력\/마력|공마/.test(s)) return 'attackMagic';
  if(/^(STR|DEX|INT|LUK)$/i.test(s)) return 'mainStat';
  return null;
}

function presetNo(response={}){return Number(response.use_preset_no||1)||1;}
function presetRows(response={}){const n=presetNo(response);return response[`hyper_stat_preset_${n}`]||response.hyper_stat_preset_1||[];}

export function hyperBuildFromResponse(response={}){
  const build={};
  for(const key of HYPER_KEYS) build[key]=0;
  for(const row of presetRows(response)){
    const key=canonicalHyperName(row.stat_type||row.stat_name||row.hyper_stat_type||'');
    if(key) build[key]=Math.max(build[key]||0,Number(row.stat_level??row.level??0)||0);
  }
  return build;
}

export function hyperBudget(response={}){
  const n=presetNo(response),build=hyperBuildFromResponse(response);
  const remain=Number(response[`hyper_stat_preset_${n}_remain_point`]??response.hyper_stat_preset_remain_point??response.remain_hyper_stat??0)||0;
  return Object.values(build).reduce((sum,lv)=>sum+hyperPointCost(lv),0)+remain;
}

export function enrichedSnapshot(bundle={}){
  const s=combatSnapshot(bundle),map=statMap(bundle.stat);
  const candidates=['STR','DEX','INT','LUK'].map(name=>({name,value:Number(map.get(name)||0)})).sort((a,b)=>b.value-a.value);
  return {...s,mainStat:candidates[0]?.value||0,mainStatName:candidates[0]?.name||'주스탯'};
}

export function stackIed(total=0,source=0){
  return 100*(1-(1-clamp(total,0,99.9999)/100)*(1-clamp(source,0,99.9999)/100));
}
export function unstackIed(total=0,source=0){
  const remain=1-clamp(source,0,99.9999)/100;
  if(remain<=0)return clamp(total,0,100);
  return clamp(100*(1-(1-clamp(total,0,99.9999)/100)/remain),0,100);
}

function applyContrib(snapshot,contrib,sign=1){
  const out={...snapshot};
  const add=(key,value)=>{out[key]=Math.max(0,(Number(out[key])||0)+sign*value);};
  add('critRate',contrib.critRate||0); add('critDamage',contrib.critDamage||0);
  add('damage',contrib.damage||0); add('bossDamage',contrib.bossDamage||0); add('normalDamage',contrib.normalDamage||0);
  add('mainStat',contrib.mainStat||0);
  const atk=contrib.attackMagic||0;
  if((out.attack||0)>=(out.magic||0)) add('attack',atk); else add('magic',atk);
  if(contrib.ignoreDefense){out.ignoreDefense=sign>0?stackIed(out.ignoreDefense,contrib.ignoreDefense):unstackIed(out.ignoreDefense,contrib.ignoreDefense);}
  return out;
}

export function hyperContribution(build={}){
  const out={}; for(const key of HYPER_KEYS) out[key]=hyperEffect(key,build[key]||0); return out;
}
export function applyHyper(snapshot,build={}){return applyContrib(snapshot,hyperContribution(build),1);}
export function removeHyper(snapshot,build={}){return applyContrib(snapshot,hyperContribution(build),-1);}

export function bossObjective(snapshot={},bossDefense=300){
  const atk=Math.max(1,Number(snapshot.attack)||0,Number(snapshot.magic)||0);
  const main=Math.max(1,Number(snapshot.mainStat)||1);
  const dmg=Math.max(0.01,1+((Number(snapshot.damage)||0)+(Number(snapshot.bossDamage)||0))/100);
  const crit=1+clamp(snapshot.critRate,0,100)/100*Math.max(0,Number(snapshot.critDamage)||0)/100;
  const def=Math.max(0.001,effectiveDefenseMultiplier(snapshot.ignoreDefense,bossDefense));
  return atk*main*dmg*crit*def;
}

export function huntObjective(snapshot={}){
  const atk=Math.max(1,Number(snapshot.attack)||0,Number(snapshot.magic)||0);
  const main=Math.max(1,Number(snapshot.mainStat)||1);
  const dmg=Math.max(0.01,1+((Number(snapshot.damage)||0)+(Number(snapshot.normalDamage)||0))/100);
  const crit=1+clamp(snapshot.critRate,0,100)/100*Math.max(0,Number(snapshot.critDamage)||0)/100;
  return atk*main*dmg*crit;
}

function objective(mode,snapshot,bossDefense){return mode==='boss'?bossObjective(snapshot,bossDefense):huntObjective(snapshot);}

export function optimizeHyper(baseSnapshot={},points=0,mode='boss',bossDefense=300){
  const build=Object.fromEntries(HYPER_KEYS.map(k=>[k,0]));
  const allowed=mode==='boss'?['mainStat','critRate','critDamage','ignoreDefense','damage','bossDamage','attackMagic']:['mainStat','critRate','critDamage','damage','normalDamage','attackMagic'];
  let remain=Math.max(0,Math.floor(points));
  while(remain>0){
    const current=applyHyper(baseSnapshot,build),baseScore=objective(mode,current,bossDefense);
    let best=null;
    for(const key of allowed){
      const lv=build[key]||0;if(lv>=15)continue;
      const cost=HYPER_NEXT_COST[lv+1];if(cost>remain)continue;
      const candidate={...build,[key]:lv+1};
      const score=objective(mode,applyHyper(baseSnapshot,candidate),bossDefense);
      const efficiency=((score/baseScore)-1)/cost;
      if(!best||efficiency>best.efficiency)best={key,cost,efficiency};
    }
    if(!best)break;
    build[best.key]+=1;remain-=best.cost;
  }
  return {build,spent:points-remain,remain,score:objective(mode,applyHyper(baseSnapshot,build),bossDefense)};
}

function unionRows(raider={}){return Array.isArray(raider.union_occupied_stat)?raider.union_occupied_stat:[];}
function numberFrom(text=''){const m=String(text).replace(/,/g,'').match(/(-?\d+(?:\.\d+)?)/);return m?Number(m[1]):0;}

export function unionBuildFromResponse(raider={}){
  const build={critRate:0,critDamage:0,ignoreDefense:0,bossDamage:0,normalDamage:0,exp:0};
  for(const raw of unionRows(raider)){
    const text=String(raw),value=numberFrom(text);
    if(/크리티컬.*데미지|Critical Damage/i.test(text))build.critDamage=Math.round(value/0.5);
    else if(/크리티컬.*확률|Critical Rate/i.test(text))build.critRate=Math.round(value);
    else if(/방어율.*무시|Ignore.*Defense/i.test(text))build.ignoreDefense=Math.round(value);
    else if(/보스.*데미지|Boss Damage/i.test(text))build.bossDamage=Math.round(value);
    else if(/일반.*몬스터.*데미지|Normal Monster/i.test(text))build.normalDamage=Math.round(value);
    else if(/경험치|EXP/i.test(text))build.exp=Math.round(value/0.25);
  }
  for(const key of Object.keys(build))build[key]=clamp(build[key],0,UNION_CAP);
  return build;
}

export function unionBudget(raider={}){
  const parsed=unionBuildFromResponse(raider),direct=Object.values(parsed).reduce((a,b)=>a+b,0);
  if(direct>0)return {cells:direct,estimated:false};
  const occupied=unionCellCount(raider);
  return {cells:Math.max(0,Math.min(160,occupied-15)),estimated:true};
}

export function unionContribution(build={}){
  return {
    critRate:(build.critRate||0)*UNION_EFFECT.critRate,
    critDamage:(build.critDamage||0)*UNION_EFFECT.critDamage,
    ignoreDefense:(build.ignoreDefense||0)*UNION_EFFECT.ignoreDefense,
    bossDamage:(build.bossDamage||0)*UNION_EFFECT.bossDamage,
    normalDamage:(build.normalDamage||0)*UNION_EFFECT.normalDamage
  };
}
export function applyUnion(snapshot,build={}){return applyContrib(snapshot,unionContribution(build),1);}
export function removeUnion(snapshot,build={}){return applyContrib(snapshot,unionContribution(build),-1);}

export function optimizeUnion(baseSnapshot={},cells=0,mode='boss',bossDefense=300){
  const build={critRate:0,critDamage:0,ignoreDefense:0,bossDamage:0,normalDamage:0,exp:0};
  const allowed=mode==='boss'?['critRate','critDamage','ignoreDefense','bossDamage']:['critRate','critDamage','normalDamage'];
  let remain=Math.max(0,Math.floor(cells));
  while(remain>0){
    const current=applyUnion(baseSnapshot,build),baseScore=objective(mode,current,bossDefense);
    let best=null;
    for(const key of allowed){
      if((build[key]||0)>=UNION_CAP)continue;
      const candidate={...build,[key]:(build[key]||0)+1};
      const score=objective(mode,applyUnion(baseSnapshot,candidate),bossDefense);
      const gain=(score/baseScore)-1;
      if(!best||gain>best.gain)best={key,gain};
    }
    if(!best)break;
    build[best.key]+=1;remain-=1;
  }
  return {build,spent:cells-remain,remain,score:objective(mode,applyUnion(baseSnapshot,build),bossDefense)};
}

export function optimizeSettings(bundle={},mode='boss',bossDefense=300){
  const current=enrichedSnapshot(bundle);
  const currentHyper=hyperBuildFromResponse(bundle.hyper||{}),currentUnion=unionBuildFromResponse(bundle.unionRaider||{});
  const hyperPoints=hyperBudget(bundle.hyper||{}),unionInfo=unionBudget(bundle.unionRaider||{});
  let base=removeHyper(current,currentHyper);base=removeUnion(base,currentUnion);
  let hyper=optimizeHyper(base,hyperPoints,mode,bossDefense);
  let union=optimizeUnion(applyHyper(base,hyper.build),unionInfo.cells,mode,bossDefense);
  hyper=optimizeHyper(applyUnion(base,union.build),hyperPoints,mode,bossDefense);
  union=optimizeUnion(applyHyper(base,hyper.build),unionInfo.cells,mode,bossDefense);
  const optimized=applyUnion(applyHyper(base,hyper.build),union.build);
  const currentScore=objective(mode,current,bossDefense),optimizedScore=objective(mode,optimized,bossDefense);
  return {
    mode,bossDefense,current,optimized,currentHyper,optimizedHyper:hyper.build,hyperPoints,hyperRemain:hyper.remain,
    currentUnion,optimizedUnion:union.build,unionCells:unionInfo.cells,unionEstimated:unionInfo.estimated,
    currentScore,optimizedScore,gainPct:currentScore>0?(optimizedScore/currentScore-1)*100:0
  };
}

export function buildDiffRows(current={},optimized={},kind='hyper'){
  const labels={mainStat:'주스탯',critRate:'크확',critDamage:'크뎀',ignoreDefense:'방무',damage:'데미지',bossDamage:'보공',normalDamage:'일몹뎀',attackMagic:'공/마',exp:'획득 EXP'};
  const keys=[...new Set([...Object.keys(current),...Object.keys(optimized)])];
  return keys.filter(k=>(current[k]||0)!==(optimized[k]||0)||(optimized[k]||0)>0).map(k=>({key:k,label:labels[k]||k,current:current[k]||0,optimized:optimized[k]||0,unit:kind==='hyper'?'Lv.':'칸'}));
}
