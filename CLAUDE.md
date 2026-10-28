# PokéSurvivor — cómo se trabaja y se publica

Normas fijas del dueño del proyecto. Se aplican SIEMPRE.

## Idioma con el dueño (obligatorio)
- Responder al dueño **siempre en chino tradicional (繁體中文)**: informes, resúmenes, preguntas y
  estados de las pruebas. Nunca en inglés. (El código, los comentarios y los commits siguen como están.)

## Chino: comprobar SIEMPRE lo nuevo (obligatorio)
El dueño juega en chino: con el navegador en chino el juego va en español por debajo y lo traduce `js/zh-tw.js`
(diccionario con clave en español Y en inglés; frases armadas con trozos necesitan un patrón con `{x}`).
**La regla es una sola: antes de CADA commit que toque algo que se ve, y tras CADA sincronización con upstream,
`node tools/test/zh_sweep.mjs 9337` tiene que dar `restos en latín: 0`.** No vale mirar sólo la frase nueva ni
fiarse de `zh_check.js`: el dueño encontró restos 6 veces (fechas, resumen de partida, esferas, cartel partido en
líneas, «×2: ...», botón vacío) porque se comprobaba a trozos. El barrido pasa por todas las pantallas y estados
(menú, ficha, mejoras, tienda, mochila, gacha ×10, misiones, amigos y sala, ranking, ajustes, novedades, Halloween,
partida en pantalla estrecha con esferas y ratón encima, cartas, objeto, vínculo, pausa, fin de partida) y junta:
1. `window.PSZH_MISSES`: todo lo que llegó al parche y no supo traducir o tradujo a medias (trozos, frases armadas,
   líneas partidas, canvas). Es la fuente más fiable: lo apunta el propio parche.
2. Lo que hay en `translate="no"` (el parche no lo toca; sólo nombres de jugador pueden quedar).
3. Lo que de verdad se pinta en el canvas (gancho por debajo del parche).
Si el juego gana una pantalla o un estado nuevo (un modal, un aviso, una fase), **añadirlo al barrido en el mismo
commit**. Trampas conocidas: texto que el juego parte en líneas antes de pintarlo (traducir entero antes con
`window.PSZH_T`, ver `wrap` en hud.js), texto compuesto en un solo nodo («Nombre (tecla 5): ...», «×2: ...»: patrón
`{x}`), elementos `translate="no"` con texto del juego (permitirlos en `skipped()`), números cortos (`short` en ui.js).
Herramientas sueltas: `node tools/zh_try.js "frase"` (cómo la pinta el parche), `node tools/zh_patch_fill.js` (coge
lo oficial de upstream), `zh_check.js`, `news_zh.mjs`, `over_zh.mjs`, `canvas_zh.mjs` (los cubre el barrido).

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
- **Nunca parado y nunca gastando a lo tonto** (21-10-2026: una tanda se colgó a las 4:40 y nadie se
  enteró hasta las 8:36). Lanzar las tandas con `bash tools/test/run3.sh` (reinicia, pone tope de tiempo,
  espera a que acaben las tres y luego cierra los Chrome de prueba). Si no hay ninguna prueba en marcha,
  no puede quedar ningún Chrome de prueba abierto. Mientras corre una tanda, comprobar el avance
  (los .log) cada ~20 min; si no avanza, matarla, ver por qué y relanzar.
- **Mejorar el bot es un bucle que NO se para solo** (meta: sin ventajas, sólo el bot, aguantar
  30 min de forma estable). Al acabar cada tanda, en el mismo turno y sin esperar a que el dueño
  pregunte: analizar → informar en breve (en chino) → si es mejor con datos, commit (el dueño hace
  el push) → diseñar y lanzar ya la siguiente variante. Si no es mejor, descartarla y probar otra.
  Nunca dejar las pruebas paradas esperando un "sigue".
- **Varias sesiones a la vez (28-10-2026)**: la del bot sólo toca `en/bot.js` y lanza tandas; el juego, las
  sincronizaciones y el chino van en otras sesiones sobre la misma carpeta. Quien cambie código del juego mientras
  hay una tanda en marcha (Chrome 9333-9336 abiertos, `node batch.mjs` corriendo) la invalida: avisar o esperar.
  La sesión del bot mira `git log -1` antes de cada tanda y la relanza si el juego cambió a mitad.

## Sincronizar con el juego oficial (upstream)
- `git fetch upstream` y `bash tools/sync_upstream.sh` (fusión a tres bandas fichero a fichero, sin `\r`: los ficheros
  de upstream llevan finales de línea mezclados y, si no, todo el fichero sale en conflicto). Luego resolver los
  `<<<<<<<` a mano. Se queda lo nuestro: salas (4-10, contraseña, lista, chat, privados, `js/net/social.js` y
  `social-ui.js`), modo espectador, ventajas (Boost), regalos, chino. No se toma: TURN/servidores de pago, el botón de
  YouTube (`live-ui.js`), el sello del servidor en el ranking, los recortes de coste de Firestore, `database.rules.json`
  de upstream (su modelo de salas es otro). Reglas de Firestore: las nuestras + los cambios de upstream a mano.
