/* ============ cries.js — gritos de los Pokémon ============
 * 25-11-2026 (copia local, como el juego oficial desde el 13-11): tu compañero y los Pokémon
 * especiales sueltan su grito en algunos momentos. Son ficheros, assets/cries/<n>.mp3 (n = nuestro
 * número; los de las formas que no lo tienen usan el de su especie, G.formBase), bajados del oficial.
 *
 *   G.Cries.play(dex)         suena el grito (si el ajuste «Gritos de los Pokémon» está puesto)
 *   G.Cries.runStart(pl)      empieza la partida: el grito de tu compañero
 *   G.Cries.enemy(e)          sale un enemigo (EnemyMgr.add / addRemote): sólo jefes, legendarios y shinies
 *   G.Cries.best(list)        de una tirada del gacha, el que grita (shiny o nuevo, el mejor)
 *
 * Cuándo: al empezar, al evolucionar, Mega / Gigamax / cambio de forma (sólo el tuyo), al salir un
 * jefe, un legendario de la grieta, Arceus o Eternatus o un shiny, en el gacha (nuevo o shiny) y al
 * abrirse un huevo. En grupo cada ordenador grita lo que ve (los enemigos le llegan una vez, por su
 * id: si vuelven a llegar no se repite); no va nada por la red.
 *
 * Se cargan al pedirlos (con <audio>, que también va abriendo dev.html con doble clic, file://), se
 * guardan unos pocos, el volumen es el de los efectos y como mucho suenan dos a la vez.
 */
G.Cries = (() => {
  const DIR = 'assets/cries/';
  const MAX_AT_ONCE = 2;          // gritos a la vez
  const KEEP = 16;                // <audio> guardados
  const ENEMY_GAP = 1500;         // ms entre gritos de enemigos (que no se amontonen)
  const SAME_GAP = 15000;         // ms antes de repetir el grito de la misma especie enemiga
  const cache = new Map();        // dex -> <audio> (el último usado, al final)
  const missing = new Set();      // números sin fichero (ni el suyo ni el de su especie)
  let heard = new Set();          // ids de enemigos que ya han gritado en esta partida
  let lastEnemy = 0;
  const lastDex = {};
  const log = [];                 // para pruebas: [{ dex, why, t }] (los 40 últimos)

  // Las formas (números > 1025) que tienen grito propio (las megas casi todas); las demás, el de su especie.
  // (La lista la da tools/fetch_official_cries.cjs al acabar.)
  const OWN = new Set([1065, 1094, 1115, 1142, 1208, 1227, 1229, 1248, 1254, 1282, 1302, 1303, 1308, 1310, 1319, 1323, 1334, 1354,
    1358, 1359, 1362, 1380, 1381, 1384, 1428, 1448, 1475, 1491, 1530, 1560, 1604, 1670, 1691, 1701, 1719, 1780, 1807, 2006, 2080, 3718,
    100003, 100009, 100015, 100018, 100036, 100071, 100121, 100127, 100130, 100149, 100150, 100154, 100160, 100181, 100212,
    100214, 100257, 100260, 100306, 100373, 100376, 100398, 100445, 100460, 100478, 100485, 100500, 100531, 100545, 100609,
    100623, 100652, 100655, 100658, 100678, 100687, 100689, 100740, 100952, 100970, 100998]);
  const on = () => G.Settings.get('cries') !== false;
  const base = d => (G.formBase ? G.formBase(d) : d);
  /** El fichero de un número: el suyo, o el de su especie si es una forma sin grito propio. */
  const fileOf = d => (d > 1025 && !OWN.has(d) ? base(d) : d);

  /** Volumen: el de los efectos de sonido (y nada si está silenciado). */
  function volume() {
    const s = G.Audio && G.Audio.settings;
    if (!s || s.muted) return 0;
    return Math.max(0, Math.min(1, (s.sfx == null ? 0.7 : s.sfx) * 0.75));
  }

  function playing() { let n = 0; for (const a of cache.values()) if (!a.paused && !a.ended) n++; return n; }

  /** El <audio> de un número: el suyo y, si no existe, el de su especie. */
  function element(dex) {
    let a = cache.get(dex);
    if (a) { cache.delete(dex); cache.set(dex, a); return a; }
    a = new Audio();
    a.preload = 'auto';
    a.dataset.dex = dex;
    const f = fileOf(dex);
    a.addEventListener('error', () => {
      // Su fichero no está: el de su especie; si tampoco, silencio (y no se vuelve a pedir).
      const b = base(dex);
      if (a.dataset.fb !== '1' && b !== f) { a.dataset.fb = '1'; a.src = DIR + b + '.mp3'; if (a.dataset.want === '1') tryPlay(a); return; }
      missing.add(dex); cache.delete(dex);
    });
    a.src = DIR + f + '.mp3';
    cache.set(dex, a);
    // Se guardan unos pocos: fuera el que hace más que no se usa (si no está sonando).
    if (cache.size > KEEP) for (const [d, x] of cache) { if (x.paused || x.ended) { cache.delete(d); x.removeAttribute('src'); break; } }
    return a;
  }

  function tryPlay(a) {
    a.volume = volume();
    try { a.currentTime = 0; } catch (e) { /* aún sin cargar */ }
    const p = a.play();
    if (p && p.catch) p.then(() => { a.dataset.want = ''; }, () => { a.dataset.want = ''; });   // (sin permiso del navegador, sin fichero...: silencio)
  }

  /** Suena el grito de `dex`. Devuelve true si se ha pedido. */
  function play(dex, why = '') {
    dex = +dex;
    if (!dex || !on() || missing.has(dex) || document.hidden) return false;
    if (volume() <= 0) return false;
    if (playing() >= MAX_AT_ONCE) return false;
    log.push({ dex, why, t: Math.round(performance.now()) });
    if (log.length > 40) log.shift();
    try {
      const a = element(dex);
      a.dataset.want = '1';
      tryPlay(a);
    } catch (e) { /* un grito nunca debe romper el juego */ }
    return true;
  }

  /** Lo deja cargado (el compañero al empezar, las cartas del gacha...). */
  function preload(dex) { dex = +dex; if (dex && on() && !missing.has(dex)) { try { element(dex); } catch (e) { /* nada */ } } }

  /** Empieza una partida: se olvidan los enemigos y grita tu compañero. */
  function runStart(pl) {
    heard = new Set(); lastEnemy = 0;
    for (const k in lastDex) delete lastDex[k];
    if (pl) play(pl.dex, 'partner');
  }

  /** Sale un enemigo: grita si es jefe, legendario o shiny (una vez por enemigo y sin amontonarse). */
  function enemy(e) {
    if (!e || !(e.boss || e.legend || e.shiny) || e.etCore || e.behavior === 'thief') return;
    if (heard.has(e.id)) return;
    heard.add(e.id);
    const now = performance.now();
    if (now - lastEnemy < ENEMY_GAP || now - (lastDex[e.dex] || -1e9) < SAME_GAP) return;
    if (play(e.dex, e.boss ? 'boss' : e.legend ? 'legend' : 'shiny')) { lastEnemy = now; lastDex[e.dex] = now; }
  }

  /** De lo que ha salido en el gacha, el que grita: shiny antes que nuevo, y el de más estrellas. */
  function best(list) {
    let b = null;
    for (const r of list || []) {
      if (!r || !(r.shiny || r.isNew)) continue;
      if (!b || (r.shiny - b.shiny || r.rarity - b.rarity) > 0) b = r;
    }
    return b;
  }

  return { play, preload, runStart, enemy, best, fileOf, OWN, get log() { return log; }, get on() { return on(); } };
})();
