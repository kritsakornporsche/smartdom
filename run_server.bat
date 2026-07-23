@echo off
cd /d D:\kritsakorn\smartdom
start /b "smartdom-3000" "C:\nvm4w\nodejs\node.exe" "node_modules\next\dist\bin\next" start -p 3000 -H 0.0.0.0
start /b "smartdom-5993" "C:\nvm4w\nodejs\node.exe" "node_modules\next\dist\bin\next" start -p 5993 -H 0.0.0.0
