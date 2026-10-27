@echo off
rem One-time setup: install packages, create .env, fill the database with demo data.
cd /d "%~dp0"
echo ==== ClubHire setup %date% %time% ==== > setup-log.txt
echo [1/3] Installing packages (npm install)...
call npm install >> setup-log.txt 2>&1
if errorlevel 1 ( echo npm install FAILED, see setup-log.txt & echo NPM_FAILED >> setup-log.txt & pause & exit /b 1 )
echo [2/3] Creating .env ...
if not exist .env copy .env.example .env >nul
echo [3/3] Seeding the database (npm run seed)...
call npm run seed >> setup-log.txt 2>&1
if errorlevel 1 ( echo Seeding FAILED. Is MongoDB running? See setup-log.txt & echo SEED_FAILED >> setup-log.txt & pause & exit /b 1 )
echo SETUP_OK >> setup-log.txt
echo.
echo Setup complete. Now double-click start.bat
timeout /t 5 >nul
