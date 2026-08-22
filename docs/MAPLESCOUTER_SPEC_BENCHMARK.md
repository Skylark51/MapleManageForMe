# MapleScouter 10-pass benchmark — character spec center

Benchmark date: 2026-08-22

This benchmark uses MapleScouter only as an information-architecture and workflow reference. MapleManageForMe does not copy MapleScouter source code, proprietary formulas, copy, branding, or private assets.

## 10 passes

1. **Character entry** — nickname/selected-character context stays persistent while moving between analysis pages.
2. **Character detail** — raw character information and optimization are separated; users can inspect the current build before recommendations.
3. **Equipment** — equipment should be visually scannable by slot/icon/name and surface starforce, potential and additional potential without opening every row.
4. **Ability / Hyper Stat** — current preset and current lines/levels are shown before any optimization recommendation.
5. **Union** — Union level, grade, occupied effects, artifact/champion context, and placement state are treated as first-class character information.
6. **Boss optimization** — current Hyper/Union/Link/other settings are compared with an optimization direction instead of showing only final combat stats.
7. **Hunting optimization** — boss and hunting presets are separate; hunting focuses on crit rate, normal-monster damage, Union allocation and farming-related settings.
8. **Spec-up order** — recommendations are an ordered decision surface. A useful row needs current state, target/direction, reason, and category.
9. **Information density** — many small, scannable cards are preferable to a long prose report; current build and recommendation should remain in the same visual context.
10. **Evidence boundary** — MapleManageForMe must not invent MapleScouter's proprietary conversion/final-damage formula. Without market prices and job-specific efficiency data, it should label upgrade order as heuristic and prioritize obvious deficits.

## Implementation prompt

> `Skylark51/MapleManageForMe`를 캐릭터 단위 스펙 관리·최적화 도구로 확장한다. MapleScouter를 10개 관점에서 재벤치마킹하되 코드·문구·고유 환산식을 복제하지 않는다. 선택 캐릭터에 `상세정보` 화면을 추가하고 NEXON Open API로 장착 장비, 어빌리티, 하이퍼스탯, 유니온/공격대/아티팩트/챔피언을 조회한다. 장비는 슬롯별 아이콘·아이템명·스타포스·잠재/에디셔널 등급 및 옵션을 한눈에 확인할 수 있게 한다. 어빌리티는 현재 적용 프리셋과 각 라인을, 하이퍼스탯은 현재 프리셋의 항목별 레벨을, 유니온은 레벨·등급·점령효과·아티팩트·배치를 표시한다. 기존 보스세팅 최적화는 현재 스탯뿐 아니라 하이퍼·유니온·링크·어빌리티·무보엠 상태를 같이 보고 병목과 조정 우선순위를 제안한다. 사냥세팅 최적화는 크확·일몹뎀·하이퍼·유니온·링크·사냥 관련 어빌리티를 종합한다. `스펙업 순서` 화면을 추가해 장비 스타포스/잠재/에디셔널, 어빌리티, 유니온, 심볼, 보스 핵심 스탯의 부족 요소를 분석하고 `우선순위 / 현재 상태 / 개선 목적 / 근거`를 제시한다. 정확한 최종뎀 상승량이나 메소 효율을 근거 없이 생성하지 않고 heuristic임을 명시한다. API 부분 실패 시 가능한 데이터만 표시하며, 기존 주간보스 직접 선택·결정석·심볼·ETA 로직은 변경하지 않는다. 신규 파싱/추천 로직에 회귀 테스트를 추가하고 npm run verify 성공 후 브랜치 → PR → squash merge → main 재검증까지 완료한다.`

## Public API basis

NEXON Open API endpoints used by this feature include:
- `/maplestory/v1/character/stat`
- `/maplestory/v1/character/hyper-stat`
- `/maplestory/v1/character/ability`
- `/maplestory/v1/character/item-equipment`
- `/maplestory/v1/character/set-effect`
- `/maplestory/v1/character/link-skill`
- `/maplestory/v1/character/hexamatrix`
- `/maplestory/v1/character/hexamatrix-stat`
- `/maplestory/v1/user/union`
- `/maplestory/v1/user/union-raider`
- `/maplestory/v1/user/union-artifact`
- `/maplestory/v1/user/union-champion`
