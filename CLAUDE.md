# PokéSurvivor — cómo se trabaja y se publica

Normas fijas del dueño del proyecto. Se aplican SIEMPRE.

## Idioma con el dueño (obligatorio)
- Responder al dueño **siempre en chino tradicional (繁體中文)**: informes, resúmenes, preguntas y
  estados de las pruebas. Nunca en inglés. (El código, los comentarios y los commits siguen como están.)

## Publicar una versión
1. Se edita `dev.html` (nunca `index.html`, que se genera).
2. `node tools/build.js && node tools/export_data.js && python tools/make_seo_pages.py`
   - `build.js` genera `index.html`, `js/app.min.js` y **`version.json`** (la huella de esta versión).
3. Commit (sin "Co-Authored-By" ni ninguna firma de IA) y `git push origin main` sólo cuando el dueño lo pida.

## Actualización automática de los jugadores (obligatorio)
Al publicar, todos los jugadores deben pasar a la versión nueva sin perder nada
(`js/core/updater.js`, mira `version.json` cada 5 min):
- **Fuera de partida** (menú, sala de cooperativo incluida): aviso de 5 s y la página se recarga.
  Si está en el gacha, la tienda de mejoras, los ajustes o escribiendo en un campo, espera a que termine.
- **En partida**: no se toca. Al acabar, la run se guarda como siempre y, al volver al menú, se recarga.
- Antes de recargar se sube a la nube lo pendiente.
No quitar `updater.js` ni la escritura de `version.json` en `tools/build.js`.

## Novedades (changelog)
Cada cambio de juego o arreglo de fallos va también en `js/data/changelog.js`
(español e inglés, en `new` / `chg` / `fix` de la fecha de hoy). Los cambios de
servidores, base de datos o costes NO van ahí.

## Servidores
- Firebase: proyecto **pokesurvivor-free** (autenticación normal: cuentas gratis sin límite).
  **Nunca** activar "Identity Platform" ni nada que lo active (funciones de bloqueo, MFA,
  "Actualizar para habilitar"): cobra por usuario. El proyecto viejo pokesurvivor-jpter se borró el 13-10-2026 (con su facturación).
- Cloudflare: SÓLO el dominio pokesurvivor.com (comprado allí, DNS gratis). El Worker y el TURN
  (Cloudflare Realtime) se quitaron el 15-10-2026: el cooperativo va sólo con conexión directa
  (STUN gratis de Google). No volver a añadir nada de pago.
- Mantenimiento: `MAINTENANCE` en `js/main.js` (con `?dev` se puede entrar para probar).

## Pruebas automáticas (copia local, obligatorio)
- **Antes de CADA prueba** (cualquier script de `tools/test/`): limpiar y reiniciar el entorno con
  `powershell -ExecutionPolicy Bypass -File tools\test\reset_env.ps1 -Profiles <carpeta de perfiles>`.
  Cierra todos los procesos de prueba y todos los Chrome sin ventana (puertos 9333-9337) con las
  pestañas que se hayan acumulado, arranca el servidor si hace falta y abre los Chrome limpios.
  Las pestañas que se quedan abiertas siguen jugando en segundo plano, se comen la CPU y las
  pruebas salen lentas, se cuelgan o dan datos falsos (19-10-2026: 59 pestañas en un solo Chrome).
- Mientras corre una prueba, no lanzar otra en el mismo Chrome (puerto).
- Partidas completas del bot: `tools/test/batch.mjs` (siempre cierra su pestaña, resultados en JSONL)
  y `tools/test/stats.mjs` para la media, el IC 95 %, la mediana y de qué se muere. Comparar
  versiones con el mismo número de partidas.
