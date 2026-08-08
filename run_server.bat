@echo off
set PATH=C:\Program Files\nodejs;C:\Users\buain\AppData\Roaming\npm;%PATH%
cd /d C:\kritsakorn\smartdom
"C:\Program Files\nodejs\node.exe" "node_modules\next\dist\bin\next" start -p 3000 -H 0.0.0.0


