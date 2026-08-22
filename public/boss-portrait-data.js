import { BOSS_DB } from './core.js';

const SCOUTER = 'https://maplescouter.com/bossIcon';

// MapleScouter의 보스 정보 화면에서 사용하는 전용 bossIcon 계열을 시각 레퍼런스로 사용한다.
// NEXON 보스 가이드 하단의 '주요 보상' 합성 이미지는 절대 보스 초상으로 사용하지 않는다.
const FAMILY_PORTRAITS = {
  '자쿰': ['chaos_zakum.png','zakum.png'],
  '블러디퀸': ['chaos_bloodyQueen.png','chaos_bloodyqueen.png','bloodyQueen.png'],
  '반반': ['chaos_vonBon.png','chaos_vonbon.png','chaos_von_bon.png'],
  '피에르': ['chaos_pierre.png','pierre.png'],
  '매그너스': ['hard_magnus.png','magnus.png'],
  '벨룸': ['chaos_vellum.png','vellum.png'],
  '파풀라투스': ['chaos_papulatus.png','papulatus.png'],
  '스우': ['normal_lotus.png','hard_lotus.png'],
  '데미안': ['normal_damien.png','hard_damien.png'],
  '가디언 엔젤 슬라임': ['normal_slime.png','chaos_slime.png'],
  '루시드': ['easy_lucid.png','normal_lucid.png','hard_lucid.png'],
  '윌': ['normal_will.png','easy_will.png','hard_will.png'],
  '더스크': ['normal_gloom.png','chaos_gloom.png'],
  '듄켈': ['normal_darknell.png','hard_darknell.png'],
  '진 힐라': ['normal_verusHilla.png','hard_verusHilla.png'],
  '선택받은 세렌': ['normal_seren.png','hard_seren.png'],
  '감시자 칼로스': ['easy_kalos.png','normal_kalos.png','champion_kalos.png'],
  '최초의 대적자': ['easy_adversary.png','normal_adversary.png','hard_adversary.png'],
  '카링': ['easy_kaling.png','normal_kaling.png','hard_kaling.png']
};

export function bossFamilyName(name='') {
  return String(name)
    .replace(/^(이지|노멀|하드|카오스|익스트림)\s+/,'')
    .replace(/^친위대장\s+/,'')
    .trim();
}

export function bossPortraitCandidates(name='') {
  const family = bossFamilyName(name);
  const files = FAMILY_PORTRAITS[family] || [];
  return files.map((file) => `${SCOUTER}/${file}`);
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
