@echo off
rem Tests the running API end to end (start.bat must be running), then resets the demo data.
cd /d "%~dp0\.."
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\smoke-test.ps1 > smoke-test-log.txt 2>&1
echo [reseeding demo data] >> smoke-test-log.txt
call npm run seed >> smoke-test-log.txt 2>&1
echo FINISHED >> smoke-test-log.txt
type smoke-test-log.txt
timeout /t 8 >nul
