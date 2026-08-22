# MapleManageForMe — 개인 메이플 관리 대시보드

NEXON Open API와 개인 루틴 계산을 결합한 **2계정 전용 메이플스토리 관리 대시보드**입니다.

- GitHub Pages: `https://skylark51.github.io/MapleManageForMe/`
- 로컬 Node 실행도 지원
- UI는 MapleScouter의 검색 중심·고밀도 정보 계층을 참고하되 코드, 자산, 문구, 고유 레이아웃은 복제하지 않고 별도로 구현

## 핵심 구조

### 두 계정 분리 관리

좌측의 `계정 1`, `계정 2`는 완전히 독립된 관리 슬롯입니다.

각 계정별로 다음이 따로 저장됩니다.

- NEXON Open API Key 연결 상태
- 관리 캐릭터 목록
- 선택 캐릭터
- 목표 레벨 / 몬파 배정 / 주간보스 상한
- 일퀘 / 몬파 / 주보 체크 상태
- API 캐릭터 기본 정보와 심볼 캐시

### 계정 캐릭터 자동 동기화

각 계정에 해당 NEXON Open API Key를 입력하고 `계정 캐릭터 동기화`를 누르면 `/maplestory/v1/character/list`를 사용하여 **Lv.200 이상 캐릭터를 자동 등록/갱신**합니다.

동기화된 캐릭터는 좌측 캐릭터 목록에서 선택하며, 우측에는 한 캐릭터의 상세 정보만 집중 표시합니다.

### API Key 보관

GitHub 저장소에는 실제 Key를 저장하지 않습니다.

- 기본: `sessionStorage` — 현재 브라우저 세션에만 유지
- `이 브라우저에 키 저장` 선택: `localStorage`
- `.env.local`은 로컬 Node 서버용이며 `.gitignore` 대상

GitHub Pages는 정적 호스팅이므로 사용자 브라우저에서 NEXON Open API를 직접 호출합니다. 로컬 Node 모드에서는 기존 서버 프록시도 사용할 수 있습니다.

## 대시보드 기능

- 캐릭터 실제 외형 이미지
- 월드 / 직업 / 레벨 / 현재 EXP / 전투력
- 목표 레벨 ETA
- 일퀘 EXP 합산
- 몬스터파크 레벨별 EXP 및 주간 무료분 배정
- 아케인 / 어센틱 / 그랜드 어센틱 심볼 자동 조회
- 지역별 심볼 Lv / 성장치 / 만렙까지 일수 / 잔여 메소
- 아케인리버 및 그란디스 풀심볼 잔여 메소 합계
- 현재 캐릭터 주보 수익으로 심볼비를 충당하는 데 필요한 기간
- 주간보스 상한 → 진행도상 하위 보스 중 고가 결정석 최대 12개
- 계정 전체 결정석 상위 90개 합산
- KST 기준 일일 루틴 자동 초기화
- 목요일 00:00 KST 기준 주간보스 체크 자동 초기화

## GitHub Pages

루트 `index.html`이 `public/` 대시보드로 연결되며, 정적 자산은 모두 **상대 경로**를 사용합니다. 따라서 프로젝트 사이트 경로인 `/MapleManageForMe/`에서도 CSS/JS가 정상 로드됩니다.

## 로컬 실행

Node.js 20 이상이 필요합니다.

```bash
npm run verify
npm start
```

브라우저:

```text
http://127.0.0.1:3000
```

Windows에서는 `run.bat`을 사용할 수 있습니다.

로컬 서버 공용 Key를 사용하려면 `.env.example`을 `.env.local`로 복사합니다.

```text
NEXON_API_KEY=발급받은_키
PORT=3000
```

## 검증

```bash
npm run verify
```

검증 대상:

- `server.mjs`
- `public/core.js`
- `public/account-api.js`
- `public/dashboard.js`
- `public/app.js`
- 결정석 12/90 계산
- 몬파 일요일 보너스
- 일퀘 EXP
- 목표 레벨 ETA
- 심볼 요구량/강화비
- KST 일일·주간 초기화

## API 엔드포인트

- `/maplestory/v1/character/list`
- `/maplestory/v1/id`
- `/maplestory/v1/character/basic`
- `/maplestory/v1/character/symbol-equipment`
- `/maplestory/v1/character/stat`

캐릭터 기본정보가 실패하면 해당 갱신은 실패 처리하고, 심볼/전투력만 실패하면 기존 카드와 기본정보는 유지하면서 부분 조회 경고를 표시합니다.

## 데이터 기준

정적 계산 데이터와 출처는 [`DATA_SOURCES.md`](./DATA_SOURCES.md)에 기록합니다. 계산 DB와 순수 함수는 `public/core.js`에 모아 두었습니다.

Data based on NEXON Open API.
