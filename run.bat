@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist .env.local (
  copy .env.example .env.local >nul
  echo [설정 필요] .env.local 파일에 NEXON_API_KEY를 입력하세요.
  start "" notepad .env.local
  pause
  exit /b
)
start "" cmd /c "timeout /t 1 /nobreak >nul && start http://127.0.0.1:3000"
node server.mjs
pause
