#!/usr/bin/env bash
# ============ run3.sh — una tanda de partidas del bot en 3 Chrome a la vez (copia local) ============
# bash tools/test/run3.sh <etiqueta> <partidas por Chrome> <dex> <bot|all> <carpeta de perfiles> <runs.jsonl>
# 1) reinicia el entorno (reset_env.ps1), 2) lanza batch.mjs en 9333/9335/9336 con un tope de
# tiempo cada uno, 3) ESPERA a que acaben los tres (así quien lo lanza siempre recibe el final),
# 4) cierra todos los Chrome de prueba para no gastar recursos mientras no se prueba nada.
set -u
LABEL=$1 N=$2 DEX=$3 MODE=$4 PROFILES=$5 OUT=$6
HERE="$(cd "$(dirname "$0")" && pwd)"
CAP=$(( N * 45 * 60 ))   # 45 min por partida como mucho
powershell -ExecutionPolicy Bypass -File "$HERE/reset_env.ps1" -Profiles "$PROFILES" 2>&1 | tail -1
pids=()
for port in 9333 9335 9336; do
  timeout "$CAP" node "$HERE/batch.mjs" "$port" "$N" "$DEX" "$MODE" "$LABEL" "$OUT" > "$(dirname "$OUT")/${LABEL}_${port}.log" 2>&1 &
  pids+=($!)
  sleep 45
done
for p in "${pids[@]}"; do wait "$p"; echo "batch $p terminó con código $?"; done
grep -h -v Assertion "$(dirname "$OUT")/${LABEL}"_*.log
# Sin pruebas en marcha: fuera los Chrome de prueba
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { \$_.Name -eq 'chrome.exe' -and \$_.CommandLine -match 'remote-debugging-port=933[3-7](\D|$)' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }"
echo "Chrome de prueba cerrados"
