import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_DB } from '../public/core.js';
import { bossFamilyName, bossPortraitCandidates, bossPortraitCoverage } from '../public/boss-portrait-data.js';

test('every weekly boss resolves to at least one dedicated portrait candidate', () => {
  const coverage=bossPortraitCoverage();
  assert.equal(coverage.length,BOSS_DB.length);
  for(const row of coverage) assert.ok(row.candidates.length>=1,`${row.name} portrait missing`);
});

test('boss portraits never use NEXON reward-composite file URLs', () => {
  for(const boss of BOSS_DB){
    for(const url of bossPortraitCandidates(boss.name)){
      assert.doesNotMatch(url,/file\.nexon\.com\/NxFile\/download\/FileDownloader/i);
    }
  }
});

test('primary portrait is a boss-specific MapleTools CDN image', () => {
  assert.equal(bossPortraitCandidates('카오스 자쿰')[0],'https://cdn.mapletools.app/bosses/zakum.webp');
  assert.equal(bossPortraitCandidates('노멀 스우')[0],'https://cdn.mapletools.app/bosses/lotus.webp');
  assert.equal(bossPortraitCandidates('이지 루시드')[0],'https://cdn.mapletools.app/bosses/lucid.webp');
  assert.equal(bossPortraitCandidates('이지 최초의 대적자')[0],'https://cdn.mapletools.app/bosses/first-adversary.webp');
});

test('difficulty prefixes collapse to the correct boss family', () => {
  assert.equal(bossFamilyName('하드 진 힐라'),'진 힐라');
  assert.equal(bossFamilyName('노멀 선택받은 세렌'),'선택받은 세렌');
  assert.equal(bossFamilyName('이지 감시자 칼로스'),'감시자 칼로스');
});
