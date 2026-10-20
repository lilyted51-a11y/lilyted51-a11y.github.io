# Pruebas sin cabeza (copia local)

Scripts que manejan dos Chromes headless por el protocolo DevTools contra el servidor local.

**Antes de cada prueba, siempre:** `powershell -ExecutionPolicy Bypass -File tools	esteset_env.ps1 -Profiles <carpeta>`
(cierra todos los Chrome de prueba con sus pestañas acumuladas y los procesos de prueba, arranca el
servidor y abre Chrome limpios en 9333-9337; `<carpeta>` es donde están los perfiles con sesión iniciada:
`chromeA` = tester1, `chromeB` = MiNG). Pestañas olvidadas = CPU llena = pruebas lentas o falsas.

Partidas completas del bot y estadística:
- `node tools/test/batch.mjs <puerto> <n> <dex> <bot|all> <etiqueta> <salida.jsonl>`
- `node tools/test/stats.mjs <salida.jsonl>` → media ± IC 95 %, mediana, mín/máx, cuántas llegan a 30:00, de qué se muere.

1. Servidor: `python tools/serve.py 8765` (sin caché).
2. Dos Chromes (perfiles `chromeA` = tester1, `chromeB` = MiNG, ya con sesión iniciada), desde PowerShell:
   ```
   $c = "C:\Program Files\Google\Chrome\Application\chrome.exe"
   Start-Process $c -ArgumentList "--headless=new --remote-debugging-port=9333 --user-data-dir=<carpeta>\chromeA --window-size=1280,800 --mute-audio about:blank"
   Start-Process $c -ArgumentList "--headless=new --remote-debugging-port=9334 --user-data-dir=<carpeta>\chromeB --window-size=1280,800 --mute-audio about:blank"
   ```
3. `cd tools/test` y, por ejemplo:
   - `node ready.mjs`  — sala: Listo (R), «Preparando», el anfitrión sólo empieza con todos listos.
   - `node chat.mjs`   — chat de la sala, de la partida (Enter/Esc, las teclas no mueven al jugador) y mensajes privados.
   - `node revive.mjs` — el bot va a levantar a un compañero caído.
   - `node judge3.mjs 9333 393 2 3` — la Sentencia: puerto, Pokémon, velocidad del juego, intentos → segundos sobrevividos. Sólo en el puerto 9333 (invitado), nunca con la cuenta real.
   - `node grantforms.mjs` / `node cloudcheck.mjs` — regalar a MiNG las formas exclusivas nuevas y comprobar que están en la nube.

En `dev.html?dev` el código de invitación se salta pulsando `#tap-start` y ocultando `#scr-invite` (lo hacen los scripts).
