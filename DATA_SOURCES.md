# 데이터 출처 및 계산 기준

마지막 정리: 2026-08-22

## 공식 API

- NEXON Open API MapleStory
  - https://openapi.nexon.com/game/maplestory/
  - 사용 엔드포인트: `/id`, `/character/basic`, `/character/symbol-equipment`, `/character/stat`
- 캐릭터 외형 이미지 쿼리 파라미터 공지
  - https://openapi.nexon.com/support/notice/2702543/
- 캐릭터 외형 이미지 프레임 파라미터 공지
  - https://openapi.nexon.com/support/notice/2715682/

## 정적 계산 DB

- 심볼 비용/요구량 교차 검증
  - https://maplestorywiki.net/w/Arcane_Symbol%3A_Vanishing_Journey
  - https://maplestorywiki.net/w/Sacred_Symbol%3A_Cernium
  - https://www.whackybeanz.com/calc/symbols/meso-cost-table
- 일퀘 EXP, 몬스터파크 EXP, Lv.200~299 필요 EXP, 주간보스 결정석 표
  - 기존 `메할일 정리` Google Sheet에서 2026-08 기준으로 검증한 값을 `public/core.js`로 이식

심볼 강화 비용은 소수 계수를 그대로 곱한 뒤 `Math.floor()` 하는 방식 대신 **10배 정수 계수로 계산**합니다. JavaScript 부동소수점 오차로 특정 단계 비용이 10,000~100,000 메소 낮아지는 문제를 방지하기 위한 것입니다.

## UI/정보 구조 참고

- MapleScouter / 환산주스탯
  - https://maplescouter.com/ko
  - https://maplescouter.com/ko/sitemap

MapleScouter의 **밝은 테마, 닉네임 중심 검색, 캐릭터 단위 정보 카드, 데이터 표 중심의 정보 계층**을 참고했습니다. 코드·문구·자산·고유 레이아웃을 복제하지 않고 개인 캐릭터 관리 목적에 맞게 별도로 구현합니다.

## 프로젝트 내부 상수 위치

정적 데이터와 순수 계산 로직은 `public/core.js`에 모아 두었습니다.

- `SYMBOL_DB`
- `DAILY_EXP`
- `MP_DB`
- `EXP_TABLE`
- `BOSS_DB`

패치로 값이 바뀌면 이 파일의 DB만 검증 후 갱신하고 `npm test`로 계산 회귀 테스트를 수행합니다.
