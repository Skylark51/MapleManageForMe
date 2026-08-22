# 메할일 — 개인 메이플 캐릭터 관리실

NEXON Open API를 이용하는 **개인용 로컬 캐릭터 관리 웹앱**입니다. API Key는 브라우저에 전달하지 않고 로컬 Node 서버에서만 사용합니다.

UI는 MapleScouter의 밝은 데이터 중심 정보 구조를 참고하되, 개인용 `레벨 / 심볼 / 일퀘 / 몬파 / 주보` 관리에 맞춰 별도로 구성했습니다.

## 주요 기능

- 계정 1 / 계정 2 분리 관리
- 닉네임 검색 후 NEXON Open API 자동 조회
- 캐릭터 카드 **좌측에 실제 캐릭터 외형 이미지 표시**
- 월드 / 직업 / 레벨 / 현재 EXP / 전투력 자동 조회
- API 현재 EXP는 읽기 전용, API 미조회 시에만 수동 EXP 사용
- 아케인·어센틱·그랜드 어센틱 심볼 자동 조회
- 지역별 심볼 Lv / 성장치 / 일퀘 기준 만렙까지 일수 / 잔여 메소
- 미보유지만 해금된 심볼은 Lv.1부터의 잔여 비용으로 계산
- 아케인리버 / 그란디스 잔여 메소 합계
- 현재 캐릭터 주보 결정석만으로 심볼 강화비를 충당할 경우 필요한 기간 계산
- 목표 레벨 → 일퀘 EXP + 몬스터파크 기준 ETA 계산
- 몬파 무료분 주간 배정 0~14회, 일요일 보너스 평균 반영
- 주간보스 상한 → 진행도상 하위 보스 중 결정석 가치가 높은 최대 12개 자동 선정
- 계정 전체 결정석 중 상위 90개 자동 합산
- 오늘 일퀘 / 오늘 몬파 / 이번 주 주보 체크
- 일일 체크는 KST 날짜가 바뀌면 자동 초기화
- 주간보스 체크는 KST 목요일 00:00 기준 자동 초기화
- 브라우저 localStorage 저장
- 심볼·보스·EXP 핵심 계산 회귀 테스트 포함

## 실행

### 1. Node.js 20 이상 설치

### 2. API Key 설정

`.env.example`을 `.env.local`로 복사한 뒤 발급받은 Key를 넣습니다.

```text
NEXON_API_KEY=발급받은_키
PORT=3000
```

`.env.local`은 `.gitignore`에 포함되어 있습니다. API Key를 `public/` 아래 파일에 넣지 마세요.

### 3. 검증

```bash
npm run verify
```

실행되는 항목:

- `server.mjs`, `public/core.js`, `public/app.js` 문법 검사
- 결정석 12/90 로직
- 몬파 일요일 보너스 계산
- 일퀘 EXP 합산
- 목표 레벨 ETA
- 아케인/어센틱 심볼 요구량 및 강화비
- 목요일 주간 초기화

### 4. 실행

```bash
npm start
```

브라우저에서:

```text
http://127.0.0.1:3000
```

Windows에서는 `run.bat`을 사용해도 됩니다.

## API 처리 원칙

사용 엔드포인트:

- `/maplestory/v1/id`
- `/maplestory/v1/character/basic`
- `/maplestory/v1/character/symbol-equipment`
- `/maplestory/v1/character/stat`

`basic` 조회가 실패하면 캐릭터 조회 전체를 실패 처리합니다. 심볼 또는 전투력만 실패하면 카드 자체는 유지하고 **부분 조회 경고**를 표시합니다.

캐릭터 외형은 `CharacterBasic.character_image`를 사용하며 공식 이미지 파라미터로 기본 서있는 동작과 240×240 렌더링 크기를 지정합니다.

## 데이터 기준

정적 계산 데이터와 출처는 [`DATA_SOURCES.md`](./DATA_SOURCES.md)에 기록합니다. 핵심 DB는 `public/core.js`에 모아 두었으며, 패치 이후 값 수정 시 `npm test`를 반드시 통과시킵니다.
