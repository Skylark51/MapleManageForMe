# MapleScouter 10-pass benchmark → MapleManageForMe implementation brief

Benchmark date: 2026-08-22

This document records **information-architecture and workflow benchmarking only**. MapleScouter source code, copy, proprietary assets, formulas, branding, and distinctive layout are not copied. Boss imagery used by MapleManageForMe comes from official NEXON MapleStory guide resources when available.

## 10 passes

1. **Global information architecture** — persistent navigation separates character analysis, boss, hunting, growth, and Union instead of stacking every feature in one page.
2. **Character entry flow** — nickname search and saved/favorite characters minimize repeated navigation.
3. **Boss analysis** — boss-related information is its own decision surface, not only a dropdown attached to income calculation.
4. **Boss-setting optimizer** — current Hyper/Link/Union settings are compared with a recommended direction and expected bottlenecks.
5. **Weekly boss settlement** — boss route and weekly mesos are shown as an operational workflow.
6. **Hunting cutoff vs. hunting setting** — “can I one-shot?” and “how should I configure presets?” are treated as separate questions.
7. **Union** — current Union state and target allocation are visible independently from character combat stats.
8. **Growth simulators** — EXP, symbol and other progression calculations stay accessible from the character context.
9. **Convenience** — one-click refresh, persistent selected character, quick tabs, clear empty/loading/error states, and shortcuts reduce friction.
10. **Decision-oriented output** — the UI should answer `current state → bottleneck → recommended change → expected purpose`, not merely dump API values.

## Implementation decisions for MapleManageForMe

- Keep the existing two-account model, routine checklist, symbol ETA, character max-12 crystals, and the user's operational top-90 world crystal management rule.
- Add persistent analysis navigation: **Today / Optimization Home / Boss Hub / Boss Setting / Union / Hunting**.
- Extend the NEXON Open API bundle with character stat, Hyper Stat, Link Skill, HEXA Stat, equipment, Dojang, Union, Union Raider, Union Artifact and Union Champion endpoints.
- Boss Hub must show BOSS_DB as visual cards, use NEXON official boss-guide imagery where available, highlight the current top-12 route, show weekly mesos, and allow applying the selected boss cap back to the managed character.
- Boss Setting must show current boss damage, IED, critical rate/damage, damage and combat power, plus Hyper/Link context and a **heuristic** priority list. Do not claim to reproduce MapleScouter's proprietary conversion formula.
- Union must display level/grade/artifact, current occupied effects, old-schema block coordinates where available, and separate boss/hunting allocation targets. Exact polyomino placement is explicitly out of scope until a verified placement solver is implemented.
- Hunting must show general-monster damage, critical stats, latest unlocked region, current Monster Park allocation and a hunting-preset checklist. Do not invent map-specific one-shot thresholds.
- All API endpoint failures other than required base character identity should degrade gracefully and surface partial-data warnings.
- API keys remain account-separated and must never be committed.

## Implementation prompt

> `Skylark51/MapleManageForMe`를 2계정 개인용 메이플 관리·최적화 컨트롤 센터로 개편한다. MapleScouter를 정보구조·워크플로만 벤치마킹하되 코드/자산/문구를 복제하지 않는다. 기존 오늘 할 일/심볼/레벨 ETA/결정석 캐릭터 12개·월드 운영 90개 로직을 유지한다. 선택 캐릭터 기준으로 대시보드, 최적화 홈, 보스 허브, 보스세팅 최적화, 유니온 최적화, 사냥 최적화를 즉시 전환할 수 있게 한다. NEXON Open API에서 character/stat, hyper-stat, link-skill, hexamatrix-stat, item-equipment, dojang, user/union, union-raider, union-artifact, union-champion을 한 번에 조회하고 부분 실패를 허용한다. 보스 허브는 NEXON 공식 보스 이미지를 사용해 BOSS_DB 전체를 카드화하고 현재 상한에 따른 최대 12결정석 루트·주간 수익을 시각화하며 상한을 메인 캐릭터 설정에 적용할 수 있게 한다. 보스 최적화는 현재 보공/방무/크확/크뎀/데미지/전투력과 하이퍼·링크·유니온을 보여주고 대상 방어율 기준 병목/투자순서를 제안한다. 유니온은 레벨/등급/아티팩트/공격대 효과와 가능한 경우 블록 배치를 시각화하고 보스·사냥 프로필별 점령 우선순위와 목표 셀 배분을 제안한다. 사냥은 일반몬스터데미지/크확/크뎀/레벨/지역/몬파/일퀘를 종합해 사냥 프리셋 우선순위와 체크리스트를 제공한다. 정확한 환산주스탯 또는 맵별 원킬컷을 근거 없이 단정하지 말고 heuristic임을 명시한다. 키보드 단축키, 한 번의 분석 데이터 갱신, 빈 상태/오류/부분 조회 UX를 제공한다. GitHub Pages 상대경로와 2계정 API 키 분리를 유지하고 API 키를 저장소에 커밋하지 않는다. 모든 신규 순수 계산 로직은 테스트하고 npm run verify를 통과시킨다.`
