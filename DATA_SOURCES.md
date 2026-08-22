# 데이터 출처 메모

- NEXON Open API MapleStory: https://openapi.nexon.com/game/maplestory/
- 캐릭터 외형 이미지 파라미터 공지: https://openapi.nexon.com/support/notice/2702543/
- NEXON Open API 이미지 URL 관련 공지: https://openapi.nexon.com/ko/support/notice/2686587/

심볼/EXP/결정석 정적 DB는 이 프로젝트를 만들기 직전 사용 중이던 `메할일 정리` Google Sheet의 검증값을 코드로 이식했습니다. 이후 패치로 값이 바뀌면 `public/app.js`의 `SYMBOL_DB`, `DAILY_EXP`, `MP_DB`, `EXP_TABLE`, `BOSS_DB`만 교체하면 됩니다.
