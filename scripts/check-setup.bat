@echo off
rem Checks that Node.js, npm and MongoDB are available. Results go to setup-check.txt
cd /d "%~dp0\.."
echo ==== ClubHire setup check %date% %time% ==== > setup-check.txt
echo [node] >> setup-check.txt
node -v >> setup-check.txt 2>&1
echo [npm] >> setup-check.txt
call npm -v >> setup-check.txt 2>&1
echo [mongod on PATH] >> setup-check.txt
where mongod >> setup-check.txt 2>&1
echo [MongoDB service] >> setup-check.txt
sc query MongoDB >> setup-check.txt 2>&1
echo [port 27017] >> setup-check.txt
powershell -NoProfile -Command "(Test-NetConnection 127.0.0.1 -Port 27017 -WarningAction SilentlyContinue).TcpTestSucceeded" >> setup-check.txt 2>&1
echo [mongo install folder] >> setup-check.txt
dir /b "C:\Program Files\MongoDB\Server" >> setup-check.txt 2>&1
echo DONE >> setup-check.txt
echo Check finished. You can close this window.
timeout /t 3 >nul
