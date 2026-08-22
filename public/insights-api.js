import { getAccountKey } from './account-api.js';

const BASE='https://open.api.nexon.com/maplestory/v1';

async function nx(path,key){
  const c=new AbortController();
  const t=setTimeout(()=>c.abort(),12000);
  try{
    const r=await fetch(`${BASE}${path}`,{headers:{'x-nxopen-api-key':key},signal:c.signal,cache:'no-store'});
    let body={};
    try{body=await r.json()}catch{}
    if(!r.ok) throw new Error(body?.error?.message||body?.message||`NEXON API 오류 (${r.status})`);
    return body;
  }catch(e){
    if(e?.name==='AbortError') throw new Error('NEXON API 응답 시간이 초과되었습니다.');
    throw e;
  }finally{clearTimeout(t)}
}

async function settled(path,key){
  try{return {ok:true,data:await nx(path,key),error:null}}
  catch(e){return {ok:false,data:null,error:e.message}}
}

export async function fetchOptimizationBundle(character,accountId){
  const key=getAccountKey(accountId);
  if(!key) throw new Error('현재 계정에 NEXON Open API Key를 먼저 연결하세요.');
  const ocid=character?.ocid || character?.api?.ocid;
  if(!ocid) throw new Error('OCID가 없습니다. 먼저 캐릭터 API 갱신 또는 계정 동기화를 실행하세요.');
  const q=`?ocid=${encodeURIComponent(ocid)}`;
  const endpoints={
    stat:`/character/stat${q}`,
    hyper:`/character/hyper-stat${q}`,
    link:`/character/link-skill${q}`,
    hexaStat:`/character/hexamatrix-stat${q}`,
    equipment:`/character/item-equipment${q}`,
    dojang:`/character/dojang${q}`,
    union:`/user/union${q}`,
    unionRaider:`/user/union-raider${q}`,
    unionArtifact:`/user/union-artifact${q}`,
    unionChampion:`/user/union-champion${q}`
  };
  const entries=await Promise.all(Object.entries(endpoints).map(async([name,path])=>[name,await settled(path,key)]));
  const bundle={fetchedAt:new Date().toISOString(),ocid,errors:{}};
  for(const[name,result]of entries){
    bundle[name]=result.data;
    if(!result.ok) bundle.errors[name]=result.error;
  }
  return bundle;
}
