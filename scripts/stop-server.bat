@echo off
rem Stops whatever program is using port 5050 (the ClubHire server). Other apps are not touched.
echo Stopping the ClubHire server on port 5050...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 5050 -State Listen -ErrorAction SilentlyContinue; if ($c) { $c | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force; Write-Output ('Stopped process ' + $_.OwningProcess) } } else { Write-Output 'Nothing is running on port 5050.' }"
timeout /t 3 >nul
