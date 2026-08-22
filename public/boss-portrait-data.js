import { BOSS_DB } from './core.js';

const MAPLETOOLS = 'https://cdn.mapletools.app/bosses';
const SCOUTER = 'https://maplescouter.com/bossIcon';

// MapleScouter의 보스 정보 UI처럼 '보스 자체가 식별되는 전용 초상'만 사용한다.
// 1차 소스는 MapleTools의 보스 전용 CDN 이미지(페이지별 실제 이미지 URL 확인),
// 2차 소스는 MapleScouter bossIcon 계열이다.
// NEXON 가이드 하단의 '주요 보상' 합성 이미지는 보스 초상으로 사용하지 않는다.
const FAMILY_PORTRAITS = {
  '자쿰': {slug:'zakum', scout:['chaos_zakum.png','zakum.png']},
  '블러디퀸': {slug:'crimson-queen', scout:['chaos_bloodyQueen.png','chaos_bloodyqueen.png']},
  '반반': {slug:'von-bon', scout:['chaos_vonBon.png','chaos_vonbon.png']},
  '피에르': {slug:'pierre', scout:['chaos_pierre.png','pierre.png']},
  '매그너스': {slug:'magnus', scout:['hard_magnus.png','magnus.png']},
  '벨룸': {slug:'vellum', scout:['chaos_vellum.png','vellum.png']},
  '파풀라투스': {slug:'papulatus', scout:['chaos_papulatus.png','papulatus.png']},
  '스우': {slug:'lotus', scout:['normal_lotus.png','hard_lotus.png']},
  '데미안': {slug:'damien', scout:['normal_damien.png','hard_damien.png']},
  '가디언 엔젤 슬라임': {slug:'guardian-angel-slime', scout:['normal_slime.png','chaos_slime.png']},
  '루시드': {slug:'lucid', scout:['easy_lucid.png','normal_lucid.png','hard_lucid.png']},
  '윌': {slug:'will', scout:['normal_will.png','easy_will.png','hard_will.png']},
  '더스크': {slug:'gloom', scout:['normal_gloom.png','chaos_gloom.png']},
  '듄켈': {slug:'darknell', scout:['normal_darknell.png','hard_darknell.png']},
  '진 힐라': {slug:'verus-hilla', scout:['normal_verusHilla.png','hard_verusHilla.png']},
  '선택받은 세렌': {slug:'seren', scout:['normal_seren.png','hard_seren.png']},
  '감시자 칼로스': {slug:'kalos', scout:['easy_kalos.png','normal_kalos.png','champion_kalos.png']},
  '최초의 대적자': {slug:'first-adversary', scout:['easy_adversary.png','normal_adversary.png','hard_adversary.png']},
  '카링': {slug:'kaling', scout:['easy_kaling.png','normal_kaling.png','hard_kaling.png']}
};

export function bossFamilyName(name='') {
  return String(name)
    .replace(/^(이지|노멀|하드|카오스|익스트림)\s+/,'')
    .replace(/^친위대장\s+/,'')
    .trim();
}

export function bossPortraitCandidates(name='') {
  const family = bossFamilyName(name);
  const data = FAMILY_PORTRAITS[family];
  if(!data) return [];
  return [
    `${MAPLETOOLS}/${data.slug}.webp`,
    ...data.scout.map((file) => `${SCOUTER}/${file}`)
  ];
}

export function bossPortraitPrimary(name='') {
  return bossPortraitCandidates(name)[0] || '';
}

export function bossPortraitAlt(name='') {
  return `${String(name).trim()} 보스 초상`;
}

export function bossPortraitCoverage() {
  return BOSS_DB.map((boss) => ({name:boss.name, candidates:bossPortraitCandidates(boss.name)}));
}
