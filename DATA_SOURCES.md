# 데이터 출처 및 계산 기준

마지막 정리: 2026-08-22

## NEXON Open API

공식 기준:

- MapleStory Open API
  - https://openapi.nexon.com/game/maplestory/
- Open API 준비 / 인증 가이드
  - https://openapi.nexon.com/ko/guide/prepare-in-advance/

현재 사용하는 엔드포인트:

- `/maplestory/v1/character/list`
  - 계정 API Key 기준 캐릭터 목록 동기화
  - MapleManageForMe에서는 Lv.200 이상 캐릭터를 관리 목록에 반영
- `/maplestory/v1/id`
  - 닉네임 → OCID
- `/maplestory/v1/character/basic`
  - 캐릭터명 / 레벨 / 직업 / 월드 / EXP / 외형 이미지
- `/maplestory/v1/character/symbol-equipment`
  - 심볼 Lv / 성장치 / 필요 성장치 / 아이콘
- `/maplestory/v1/character/stat`
  - 전투력

요청에는 `x-nxopen-api-key` 헤더를 사용합니다.

GitHub Pages에서는 정적 호스팅 특성상 각 계정의 API Key를 사용자가 브라우저에서 입력하여 직접 NEXON API를 호출합니다. 실제 Key는 GitHub 저장소에 커밋하지 않습니다.

- 기본 보관: `sessionStorage`
- 선택 보관: `localStorage`
- 로컬 Node 서버용 `.env.local`: `.gitignore` 대상

캐릭터 외형 이미지:

- 이미지 쿼리 파라미터 공지
  - https://openapi.nexon.com/support/notice/2702543/
- 이미지 프레임 파라미터 공지
  - https://openapi.nexon.com/support/notice/2715682/

## 정적 계산 DB

심볼 비용/요구량 교차 검증:

- https://maplestorywiki.net/w/Arcane_Symbol%3A_Vanishing_Journey
- https://maplestorywiki.net/w/Sacred_Symbol%3A_Cernium
- https://www.whackybeanz.com/calc/symbols/meso-cost-table

다음 값은 기존 `메할일 정리` Google Sheet에서 2026-08 기준으로 검증한 값을 `public/core.js`로 이식했습니다.

- Lv.200~299 다음 레벨 필요 EXP
- 레벨별 몬스터파크 EXP
- 지역별 일일 퀘스트 EXP
- 심볼 해금 레벨 / 일퀘 지급량 / 성장식 / 강화비
- 주간보스 결정석 가격표

심볼 강화 비용은 소수 계수를 바로 곱한 뒤 `Math.floor()` 하지 않고 **10배 정수 계수**로 계산합니다. JavaScript 부동소수점 때문에 특정 단계 비용이 10,000~100,000 메소 낮아지는 문제를 방지하기 위함입니다.

## UI / 정보 구조 참고

- MapleScouter / 환산주스탯
  - https://maplescouter.com/ko
  - https://maplescouter.com/ko/sitemap

참고 요소:

- 밝은 데이터 대시보드
- 닉네임 검색을 중심으로 한 진입 구조
- 좌측 탐색 / 캐릭터 선택
- 캐릭터 중심 프로필 영역
- 작은 KPI 카드와 표를 이용한 높은 정보 밀도
- 성장 / 보스 / 스펙 정보를 영역별로 분리

MapleScouter의 **코드, 자산, 문구, 브랜드 요소, 고유 레이아웃은 복제하지 않습니다.** 개인 캐릭터 관리 목적에 맞게 별도로 구현합니다.

## 프로젝트 내부 데이터 위치

정적 데이터와 순수 계산 함수는 `public/core.js`에 있습니다.

- `SYMBOL_DB`
- `DAILY_EXP`
- `MP_DB`
- `EXP_TABLE`
- `BOSS_DB`

계정 API 연결과 캐릭터 동기화는 `public/account-api.js`, 대시보드 UI/상태 관리는 `public/dashboard.js`에서 담당합니다.

패치로 정적 DB가 바뀌면 값 검증 후 `npm run verify`를 통과시킵니다.

Data based on NEXON Open API.
