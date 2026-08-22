import { BOSS_DB } from './core.js';

const MAPLETOOLS = 'https://cdn.mapletools.app/bosses';

// 고화질 전용: MapleTools의 보스 상세 페이지에서 사용하는 보스 전용 WebP만 사용한다.
// 작은 bossIcon이나 NEXON 가이드의 보상 합성 이미지를 fallback으로 섞지 않는다.
const FAMILY_PORTRAITS = {
  '자쿰':'zakum','블러디퀸':'crimson-queen','반반':'von-bon','피에르':'pierre','매그너스':'magnus','벨룸':'vellum','파풀라투스':'papulatus',
  '스우':'lotus','데미안':'damien','가디언 엔젤 슬라임':'guardian-angel-slime','루시드':'lucid','윌':'will','더스크':'gloom','듄켈':'darknell',
  '진 힐라':'verus-hilla','선택받은 세렌':'seren','감시자 칼로스':'kalos','최초의 대적자':'first-adversary','카링':'kaling'
};

export function bossFamilyName(name='') {
  return String(name).replace(/^(이지|노멀|하드|카오스|익스트림)\s+/,'').replace(/^친위대장\s+/,'').trim();
}

export function bossPortraitCandidates(name='') {
  const slug=FAMILY_PORTRAITS[bossFamilyName(name)];
  return slug ? [`${MAPLETOOLS}/${slug}.webp`] : [];
}

export function bossPortraitPrimary(name='') { return bossPortraitCandidates(name)[0] || ''; }
export function bossPortraitAlt(name='') { return `${String(name).trim()} 고화질 보스 초상`; }
export function bossPortraitCoverage() { return BOSS_DB.map(boss=>({name:boss.name,candidates:bossPortraitCandidates(boss.name)})); }
