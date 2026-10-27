@echo off
rem Starts the ClubHire server and opens it in the browser. Close this window to stop the server.
cd /d "%~dp0"
title ClubHire server
if not exist node_modules ( echo Run setup.bat first. & pause & exit /b 1 )
start "" cmd /c "timeout /t 3 >nul & start http://localhost:5050"
call npm start
pause
