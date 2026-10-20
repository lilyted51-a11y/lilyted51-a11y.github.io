# reset_env.ps1 — entorno de pruebas limpio (copia local)
# Antes de CADA prueba: cierra todos los procesos de prueba (node) y todos los Chrome sin
# ventana (puertos 9333-9337, con todas sus pestañas acumuladas), arranca el servidor si
# no está y vuelve a abrir los Chrome limpios. Las pestañas que quedaban abiertas siguen
# jugando en segundo plano y se comen la CPU: las pruebas salen lentas o se cuelgan.
#
#   powershell -ExecutionPolicy Bypass -File tools\test\reset_env.ps1 [-Profiles <carpeta>]
param([string]$Profiles = "$env:LOCALAPPDATA\Temp\pokesurvivor-test-profiles")

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# 1) procesos de prueba y Chrome sin ventana
Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'tools[\\/]test|survive|batch\.mjs|judge|chest|revive|quest|smoke' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'remote-debugging-port=933[3-7](\D|$)' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Sleep 3

# 2) servidor local (sin caché)
try { $null = Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 http://localhost:8765/dev.html }
catch { Start-Process python -ArgumentList "tools\serve.py 8765" -WorkingDirectory $root -WindowStyle Hidden; Start-Sleep 3 }

# 3) Chrome limpios: 9333 tester1 · 9334 MiNG · 9335-9337 para invitados
New-Item -ItemType Directory -Force $Profiles | Out-Null
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$map = @{ 9333 = 'chromeA'; 9334 = 'chromeB'; 9335 = 'chromeC'; 9336 = 'chromeD'; 9337 = 'chromeE' }
foreach ($port in $map.Keys) {
  Start-Process $chrome -ArgumentList "--headless=new --remote-debugging-port=$port --user-data-dir=`"$Profiles\$($map[$port])`" --window-size=1280,800 --autoplay-policy=no-user-gesture-required --mute-audio about:blank"
}
Start-Sleep 5
foreach ($port in ($map.Keys | Sort-Object)) {
  $list = (Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$port/json/list").Content | ConvertFrom-Json
  $tabs = @($list | ForEach-Object { $_ } | Where-Object { $_.type -eq 'page' }).Count   # sólo pestañas (no la interfaz ni extensiones)
  "puerto $port listo ($tabs pestaña)"
}
