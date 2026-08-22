# 메할일 — 개인 메이플 캐릭터 관리실

개인 캐릭터 관리용 로컬 웹앱입니다. 브라우저에 API Key를 노출하지 않고, 로컬 Node 서버가 NEXON Open API를 호출합니다.

## 포함 기능

- 계정 1 / 계정 2 분리 관리
- 캐릭터명으로 NEXON Open API 조회
- **캐릭터 외형 이미지를 카드 좌측에 표시** (`CharacterBasic.character_image`)
- 직업 / 레벨 / 현재 EXP / 전투력 자동 조회
- 아케인·어센틱·그랜드 어센틱 심볼 레벨/성장치 자동 조회
- 지역별 심볼 만렙까지 남은 일수·메소 자동 계산
- 아케인리버 / 그란디스 풀심볼 잔여 메소 합산
- 현재 캐릭터 주간보스 결정석 수익만으로 심볼비를 충당할 경우 필요한 주수 계산
- 목표 레벨 입력 → 일퀘 EXP + 몬스터파크 기준 예상 소요일 계산
- 몬파 월드 주 14회 배정 요약
- 주간보스 상한 선택 → 하위 고가 결정석 최대 12개 자동 선정
- 월드 전체 결정석 중 상위 90개 자동 합산
- 오늘 일퀘 / 몬파 / 이번 주 주보 수동 체크
- 브라우저 localStorage 저장

## 실행

### 1. Node.js 20 이상 설치

### 2. API Key 설정

프로젝트 폴더에서 `.env.example`을 `.env.local`로 복사합니다.

```text
NEXON_API_KEY=발급받은_키
PORT=3000
```

API Key는 절대로 `public/` 폴더의 JS 파일에 넣지 마세요.

### 3. 실행

```bash
npm start
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:3000
```

## 캐릭터 이미지

API의 `character_image` URL을 그대로 사용하며, UI에서는 고정 220×220 영역에 표시합니다. 넥슨이 공식 지원하는 이미지 쿼리 파라미터로 기본 서있는 포즈를 사용합니다.

## 데이터 기준

현재 프로젝트의 정적 계산 DB는 제작 당시 `메할일 정리` Google Sheet에 검증해 둔 값을 이식했습니다.

- Lv.200~299 필요 경험치
- 몬스터파크 레벨별 EXP
- 아케인/그란디스 심볼 해금 레벨·최대 레벨·일퀘 지급량·성장식·강화비 계산식
- 주간보스 결정석 가격표

NEXON API 원본 데이터는 평균 지연이 있을 수 있으며, 서비스 운영 시 NEXON Open API 이용정책을 따라 주기적으로 데이터를 갱신해야 합니다.

## NEXON API 사용 엔드포인트

- `/maplestory/v1/id`
- `/maplestory/v1/character/basic`
- `/maplestory/v1/character/symbol-equipment`
- `/maplestory/v1/character/stat`

서버에서 `x-nxopen-api-key` 헤더로 호출합니다.
