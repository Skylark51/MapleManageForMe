# MapleManageForMe — 개인 메이플 관리·최적화 컨트롤 센터

NEXON Open API와 개인 루틴 계산을 결합한 **2계정 전용 메이플스토리 관리 대시보드**입니다.

- GitHub Pages: `https://skylark51.github.io/MapleManageForMe/`
- 로컬 Node 실행 지원
- MapleScouter를 10개 관점에서 정보구조·사용 흐름만 벤치마킹하고, 코드·자산·문구·고유 레이아웃은 복제하지 않음
- 상세 벤치마크와 구현 프롬프트: [`docs/MAPLESCOUTER_BENCHMARK.md`](./docs/MAPLESCOUTER_BENCHMARK.md)

## 핵심 구조

### 두 계정 분리 관리

좌측의 `계정 1`, `계정 2`는 완전히 독립된 관리 슬롯입니다.

각 계정별로 다음이 따로 저장됩니다.

- NEXON Open API Key 연결 상태
- 관리 캐릭터 목록 / 선택 캐릭터
- 목표 레벨 / 몬파 배정 / 주간보스 상한
- 일퀘 / 몬파 / 주보 체크 상태
- API 캐릭터 기본 정보와 심볼 캐시

각 계정에 해당 NEXON Open API Key를 입력하고 `계정 캐릭터 동기화`를 누르면 `/maplestory/v1/character/list`를 사용하여 **Lv.200 이상 캐릭터를 자동 등록/갱신**합니다.

### API Key 보관

실제 Key는 저장소에 커밋하지 않습니다.

- 기본: `sessionStorage`
- `이 브라우저에 키 저장`: `localStorage`
- 로컬 Node 서버용 `.env.local`: `.gitignore` 대상

GitHub Pages에서는 사용자 브라우저가 NEXON Open API를 직접 호출하고, 로컬 Node 모드에서는 기존 서버 프록시도 사용할 수 있습니다.

## 오늘 관리

기존 관리 기능은 유지합니다.

- 캐릭터 실제 외형 이미지
- 월드 / 직업 / 레벨 / 현재 EXP / 전투력
- 목표 레벨 ETA
- 일퀘 EXP 합산
- 몬스터파크 EXP / 주 14회 무료분 배정
- 지역별 아케인·어센틱·그랜드 어센틱 심볼
- 심볼 만렙까지 일수 / 잔여 메소 / 주보 수익으로 충당할 기간
- 주간보스 상한 → 고가 결정석 최대 12개
- **사용자 운영 기준 월드 상위 90결정석** 합산
- KST 일일·목요일 주간 자동 초기화

## 최적화 컨트롤 센터

상단 또는 좌측 메뉴에서 즉시 전환합니다.

- `오늘 관리`
- `최적화 홈`
- `보스 허브`
- `보스 세팅 최적화`
- `유니온 최적화`
- `사냥 최적화`

키보드:

- `/` 닉네임 검색
- `1` 오늘 관리
- `2` 최적화 홈
- `3` 보스 허브
- `4` 유니온
- `5` 사냥

### 보스 허브

- 기존 `BOSS_DB` 전체를 카드형 갤러리로 표시
- NEXON 공식 보스 가이드 이미지가 확인된 보스는 공식 이미지를 사용
- 선택한 상한에 따른 최대 12개 결정석 루트를 즉시 강조
- 캐릭터 예상 주간 결정석 수익 계산
- 시뮬레이션 상한을 해당 캐릭터의 실제 관리 설정으로 적용
- 보스 카드에서 공식 NEXON 가이드로 이동

> 게임의 공식 결정석 주간 판매 제한과 별개로, 이 프로젝트의 월드 합산은 사용자가 기존부터 사용한 **운영 기준 90개**를 유지합니다.

### 보스 세팅 최적화

추가 API 데이터를 한 번에 조회합니다.

- 현재 보스 데미지
- 방어율 무시
- 크리티컬 확률 / 크리티컬 데미지
- 데미지
- 전투력
- 하이퍼스탯 프리셋
- 링크스킬
- 유니온 데이터

대상 보스 방어율을 선택하고 현재 상태의 병목과 투자 우선순위를 표시합니다.

**MapleScouter의 고유 환산 공식이나 보스컷을 복제하지 않습니다.** 현재 공개 API 스탯을 이용한 비교·의사결정용 heuristic입니다.

### 유니온 최적화

NEXON API에서 다음을 조회합니다.

- Union level / grade
- Union Raider
- Union Artifact
- Union Champion
- 현재 점령 효과
- 응답에 블록 좌표가 존재할 경우 현재 배치 시각화

`보스`와 `사냥` 프로필을 분리해 점령 효과 우선순위와 목표 셀 비중을 제안합니다. 현재 버전은 **효과 배분 목표 optimizer**이며, 직업별 블록 폴리오미노를 실제 좌표에 자동 재배치하는 solver는 아닙니다.

### 사냥 최적화

현재 API에서 확인 가능한 값으로 사냥 세팅의 병목을 정리합니다.

- 일반 몬스터 데미지
- 크리티컬 확률 / 데미지
- 현재 레벨 / 최신 해금 심볼 지역
- 몬스터파크 주간 배정
- 일퀘 반영 상태
- 사냥 프리셋 우선순위 / 체크리스트

맵·직업·스킬별 검증 DB 없이 **원킬컷을 임의 생성하지 않습니다.** 향후 검증된 사냥터/스킬 컷 DB가 확보되면 별도 모듈로 확장합니다.

## 최적화 API 엔드포인트

기존 기본 API 외에 다음을 추가 조회합니다.

- `/maplestory/v1/character/stat`
- `/maplestory/v1/character/hyper-stat`
- `/maplestory/v1/character/link-skill`
- `/maplestory/v1/character/hexamatrix-stat`
- `/maplestory/v1/character/item-equipment`
- `/maplestory/v1/character/dojang`
- `/maplestory/v1/user/union`
- `/maplestory/v1/user/union-raider`
- `/maplestory/v1/user/union-artifact`
- `/maplestory/v1/user/union-champion`

확장 조회는 `분석 데이터 갱신` 한 번으로 실행하며, 기본 캐릭터/심볼도 함께 갱신합니다. 개별 보조 API 실패는 전체 화면을 중단하지 않고 부분 데이터로 계속 동작합니다.

## GitHub Pages

루트 `index.html`이 `public/` 대시보드로 연결되며 정적 자산은 상대 경로를 사용합니다. 프로젝트 Pages 경로 `/MapleManageForMe/`에서 동작합니다.

## 로컬 실행 / 검증

Node.js 20 이상:

```bash
npm run verify
npm start
```

브라우저:

```text
http://127.0.0.1:3000
```

Windows에서는 `run.bat`을 사용할 수 있습니다.

## 코드 구조

- `public/core.js` — 기존 EXP / 심볼 / 결정석 순수 계산
- `public/account-api.js` — 두 계정 기본 API 연결
- `public/dashboard.js` — 오늘 관리 대시보드
- `public/optimization-core.js` — 보스/유니온/사냥 최적화 순수 계산
- `public/insights-api.js` — 확장 API bundle
- `public/optimization.js` — 최적화 UI/상호작용
- `public/optimization.css` — 최적화 화면 디자인
- `tests/optimization.test.mjs` — 신규 최적화 회귀 테스트

정적 계산 데이터와 출처는 [`DATA_SOURCES.md`](./DATA_SOURCES.md)에 기록합니다.

Data based on NEXON Open API.
