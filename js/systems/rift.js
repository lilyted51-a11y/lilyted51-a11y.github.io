/* ============ rift.js — grietas y arena del legendario ============
 *
 * De vez en cuando (pocas veces por partida) se abre una GRIETA cerca de un
 * jugador. Dura GRIETA_TTL segundos; si entras, te lleva (con todo el grupo)
 * a una arena cerrada en el Mundo Distorsión, contra un Pokémon LEGENDARIO.
 *
 *   ganas    el legendario suelta tickets (el ×10, la mitad de las veces) y monedas (el primero de la
 *            partida, también un huevo para cada uno: llega al acabarla, systems/eggs.js), y cada uno se lleva un
 *            VÍNCULO (fusiona movimientos, ver Player.fuse); a los pocos
 *            segundos volvéis al mapa donde estabais y se elige la fusión
 *   pierdes  (caéis todos o se acaba el tiempo) volvéis sin premio, con algo
 *            de vida; la partida sigue
 *
 * La pelea en sí (tres fases, sus cinco ataques de tipo y el definitivo) va en
 * systems/legend.js (23-11-2026).
 *
 * Mientras dura la arena, los enemigos del mapa se guardan (EnemyMgr.stash) y
 * no aparecen nuevos; al volver todo sigue como estaba.
 *
 * Cooperativo: lo decide el anfitrión. Mensajes (ver coop.js):
 *   'rift' x y ttl · 'riftx' · 'arena' cfg · 'aw' (ganada) · 'al' (perdida)
 *   y del invitado al anfitrión 're' (he entrado en la grieta).
 */
G.Rift = (() => {
  // Las grietas salen a su hora (RIFT_AT, abajo), no al azar (16-11-2026; antes, una
  // comprobación cada 30 s con probabilidad creciente).
  const TTL = 45;
  // 150 s (antes 120): con las tres fases y el ataque definitivo (legend.js), la pelea dura más.
  const ARENA_R = 11, ARENA_TIME = 150;
  let rift = null;          // { x, y, ttl, t }
  let arena = null;         // { tx, ty, r, dex, shiny, x, y, back, biome, t, phase, endT, bossId }
  let zone = null;          // dónde estaba la última arena { x, y, r } (ver leftBehind)
  let checkT = 0, asked = false, downT = 0;
  let raMiss = 0;           // invitado: desde cuándo el anfitrión no manda el reloj de la arena (netClock)
  // Grietas con hora fija (16-11-2026, como el juego oficial): minutos 4, 8, 12, 16 y 25.
  // La última sólo da vínculo si te has dejado alguna de las anteriores (wins).
  const RIFT_AT = [240, 480, 720, 960, 1500];
  let riftIdx = 0, wins = 0, egg = false;
  // Grietas ya pasadas en este ordenador (la pelea acabada o la grieta cerrada sin entrar): tras la 3.ª
  // se elige la forma (systems/statforms.js, 25-11-2026). En grupo también la cuenta cada invitado.
  let over = 0;
  const authority = () => !G.Coop.active || G.Coop.isHost;
  const TS = () => G.Tiles.T * G.Sprites.PX;

  function reset() { rift = null; arena = null; zone = null; checkT = 0; asked = false; downT = 0; raMiss = 0; riftIdx = 0; wins = 0; egg = false; over = 0; G.Legend.reset(); }

  /**
   * ¿Sigue este jugador en la arena aunque aquí ya se haya vuelto al mapa?
   * En grupo, el anfitrión vuelve unas décimas antes que los invitados (el aviso
   * tarda en llegar) y en ese rato los ve aún allí: el jefe que esperaba salía a su
   * lado, a miles de metros, y ya no se le encontraba (ni salían más grietas).
   */
  function leftBehind(p) {
    return !arena && !!zone && G.U.dist2(p.x, p.y, zone.x, zone.y) < zone.r * zone.r;
  }

  // ---------------- grieta en el mapa ----------------

  function update(dt, pl, time) {
    if (rift) {
      rift.t += dt;
      rift.ttl -= dt;
      if (rift.ttl <= 0) { rift = null; over++; return; }
      // (No se entra con Eternatus en marcha, ni durante su aviso; ni con la Sentencia empezando, 25-11-2026.)
      if (!arena && !pl.dead && !G.Eternatus.active && !G.Judgment.active && G.U.dist2(pl.x, pl.y, rift.x, rift.y - 10) < 30 * 30) enter();
    } else if (!arena && authority() && !G.Judgment.active && !G.Eternatus.active && riftIdx < RIFT_AT.length && time >= RIFT_AT[riftIdx]) {
      // Le toca una grieta. Con un jefe vivo se espera a que caiga (se mira cada 5 s).
      checkT -= dt;
      if (checkT <= 0) {
        checkT = 5;
        if (!G.EnemyMgr.bossAlive() && open()) riftIdx++;
      }
    }
    if (arena) arenaTick(dt, pl);
  }

  function open() {
    const alive = G.Game.everyone().filter(p => !p.dead);
    const near = G.U.pick(alive.length ? alive : [G.Game.player]);
    // Sólo donde se llega andando desde el jugador (25-11-2026, como el juego oficial desde el 16-11): antes podía
    // salir en un hueco cerrado por paredes o detrás de un paso por el que no caben los Pokémon grandes. Primero
    // por un camino ancho (2×2 casillas libres); si no hay ninguno, por cualquiera; y si tampoco, como antes.
    const tries = [reach(near, true), reach(near, false), null];
    for (const ok of tries) {
      for (let i = 0; i < 24; i++) {
        const a = Math.random() * 6.2832, d = G.U.rand(380, 560);
        const x = near.x + Math.cos(a) * d, y = near.y + Math.sin(a) * d * 0.85;
        if (!G.World.isFree(x, y, 22)) continue;
        if (ok && !ok(x, y)) continue;
        show(x, y, TTL);
        if (G.Coop.isHost) G.Coop.broadcast(['rift', Math.round(x), Math.round(y), TTL]);
        return true;
      }
    }
    return false;
  }

  /**
   * Casillas a las que se llega andando desde `p` (recorrido en anchura hasta REACH_R casillas: la grieta sale a
   * 380-560 px, unas 12-18). wide: sólo por sitios donde cabe un Pokémon grande (cada casilla del camino, dentro
   * de un cuadro de 2×2 libre). → (x, y) => ¿se llega?
   */
  const REACH_R = 24;
  function reach(p, wide) {
    const TSz = G.World.TS, N = REACH_R * 2 + 1;
    const px = Math.floor(p.x / TSz), py = Math.floor(p.y / TSz), ox = px - REACH_R, oy = py - REACH_R;
    const open = new Uint8Array(N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) open[j * N + i] = G.World.walkable(ox + i, oy + j) ? 1 : 0;
    const ok = (i, j) => i >= 0 && j >= 0 && i < N && j < N && open[j * N + i] === 1;
    const roomy = (i, j) => {
      for (const [a, b] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) if (ok(i + a, j + b) && ok(i + a + 1, j + b) && ok(i + a, j + b + 1) && ok(i + a + 1, j + b + 1)) return true;
      return false;
    };
    const seen = new Uint8Array(N * N), q = new Int32Array(N * N);
    let h = 0, t = 0;
    seen[REACH_R * N + REACH_R] = 1; q[t++] = REACH_R * N + REACH_R;     // (donde está el jugador siempre cuenta)
    while (h < t) {
      const c = q[h++], i = c % N, j = (c - i) / N;
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + a, nj = j + b, k = nj * N + ni;
        if (!ok(ni, nj) || seen[k] || (wide && !roomy(ni, nj))) continue;
        seen[k] = 1; q[t++] = k;
      }
    }
    return (x, y) => {
      const i = Math.floor(x / TSz) - ox, j = Math.floor(y / TSz) - oy;
      return i >= 0 && j >= 0 && i < N && j < N && seen[j * N + i] === 1;
    };
  }

  /** Aparece la grieta (también la que manda el anfitrión). */
  function show(x, y, ttl) {
    rift = { x, y, ttl, t: 0 };
    asked = false;
    // (El aviso grande lo dibuja hud.js mientras rift.t < 4,5 s.)
    G.Audio.sfx('rift');
    G.FX.ring(x, y, 6, 80, '#b48aff', 0.7, 5);
  }

  function enter() {
    if (asked) return;
    asked = true;
    if (authority()) start();
    else G.Coop.toHost(['re']);
  }

  // ---------------- arena ----------------

  /** Quien manda: elige legendario y lugar, y avisa a todos. */
  let nextType = null;          // pruebas/vídeos: tipo de la próxima arena

  function start(forceType) {
    if (arena) return;
    forceType = forceType || nextType; nextType = null;
    let pool = G.DEX.filter(p => p.leg && G.SPRITE_META[p.dex]);
    if (forceType && pool.some(p => p.types.includes(forceType))) pool = pool.filter(p => p.types.includes(forceType));
    // Los legendarios que aún no has vencido salen 4 veces más (menos repetidos).
    const beaten = (G.DB.save && G.DB.save.legends) || {};
    const ws = pool.map(p => (beaten[p.dex] ? 1 : 4));
    let r = Math.random() * ws.reduce((a, b) => a + b, 0), mi = 0;
    while (mi < pool.length - 1 && (r -= ws[mi]) > 0) mi++;
    const mon = pool[mi];
    const cfg = {
      tx: 5000 + Math.floor(Math.random() * 3000), ty: 5000 + Math.floor(Math.random() * 3000), r: ARENA_R,
      dex: mon.dex, shiny: G.Sprites.hasShiny(mon.dex) && Math.random() < 1 / 512,
      // La arena es la de uno de sus tipos, al azar.
      type: forceType || G.U.pick(mon.types),
      // La última grieta (minuto 25) no da vínculo si ya has ganado las cuatro anteriores.
      nb: riftIdx >= RIFT_AT.length && wins >= RIFT_AT.length - 1 ? 1 : 0
    };
    if (G.Coop.isHost) G.Coop.broadcast(['arena', cfg]);
    begin(cfg);
    spawnLegend();
  }

  /** En cada ordenador: viaje a la arena. */
  function begin(cfg) {
    const pl = G.Game.player;
    const ts = TS();
    arena = Object.assign({}, cfg, {
      x: cfg.tx * ts + ts / 2, y: cfg.ty * ts + ts / 2,
      back: { x: pl.x, y: pl.y }, biome: G.World.biome, t: 0, phase: 'fight', endT: 0, bossId: 0
    });
    zone = { x: arena.x, y: arena.y, r: (cfg.r + 10) * ts };
    rift = null; asked = false; downT = 0;
    G.Legend.begin(cfg, arena);
    if (authority()) G.EnemyMgr.stash(); else G.EnemyMgr.clearRemote();
    G.Projectiles.clear();
    G.Combat.clearFields();
    G.Hazards.clear();
    G.World.setArena({ tx: cfg.tx, ty: cfg.ty, r: cfg.r, type: cfg.type });
    G.World.setBiome(G.Tiles.arenaBiome(cfg.type), true);
    // Cada arena trae su clima (el volcán, sol; el glaciar, nieve...).
    const th = G.Tiles.ARENA_THEMES[cfg.type];
    if (th && th.weather) G.Weather.force(th.weather, ARENA_TIME + 15);
    // Todos al sur de la arena, en fila; el legendario aparece al norte.
    const ps = G.Game.everyone();
    ps.forEach((p, i) => { p.x = arena.x + (i - (ps.length - 1) / 2) * 34; p.y = arena.y + ts * 3; });
    G.Camera.x = pl.x; G.Camera.y = pl.y;
    G.Game.flash('#c9a6ff', 0.9);
    G.Audio.sfx('rift');
    G.Spawner.say('Has entrado en la grieta…', 2.4, true);
  }

  function spawnLegend() {
    const mon = G.DEX_BY[arena.dex];
    const t = G.Game.st.time;
    const n = G.Game.everyone().length;
    const ts = TS();
    const def = {
      dex: mon.dex, name: mon.name,
      hp: Math.round((3200 + t * 9) * G.Coop.scaleHp(n) * (n > 1 ? 1.4 : 1) * G.Modes.hp),
      spd: Math.round(G.U.clamp(48 + (mon.spd - 78) * 0.6, 48, 105)),
      dmg: Math.round((36 + t / 20) * G.Modes.dmg), xp: Math.round(500 + t * 1.2),
      behavior: mon.types.some(x => ['psychic', 'electric', 'ghost', 'fairy', 'fire', 'water', 'ice', 'dragon'].includes(x)) ? 'ranged' : 'charger',
      shotDmg: Math.round((18 + t / 40) * G.Modes.dmg), shotCd: 0.9, range: 300
    };
    const e = new G.Enemy(def, arena.x, arena.y - ts * 3.5, { hp: 1, spd: 1, dmg: 1 }, true);
    e.legend = true;
    // (25-11-2026) Si vuelve a salir porque ha cambiado el anfitrión, con la vida que le quedaba
    // (arena.frac, la apunta cada uno en arenaTick): antes volvía entero.
    if (arena.frac > 0 && arena.frac < 1) e.hp = Math.max(1, Math.round(e.maxHp * arena.frac));
    // Choca con las paredes y columnas como tú: si volara por encima de las
    // rocas, tus disparos no podrían alcanzarle (bug de Celebi).
    e.flying = false;
    if (arena.shiny) e.makeShiny();
    G.EnemyMgr.add(e);
    arena.bossId = e.id;
    G.Legend.attach(e);          // sus fases, sus ataques de tipo y el definitivo
    G.Spawner.say('¡' + e.name + (e.shiny ? ' shiny' : '') + ' te esperaba en la grieta!', 3.2);
    G.Camera.kick(1.1);
    G.Audio.sfx('boss');
  }

  /** Nadie sale del círculo de la arena (por si algo empuja demasiado). */
  function keepInside() {
    const ts = TS(), max = (arena.r - 1.4) * ts;
    for (const e of G.EnemyMgr.all()) {
      if (e.remote) continue;
      const dx = e.x - arena.x, dy = e.y - arena.y, d = Math.hypot(dx, dy);
      if (d > max) { e.x = arena.x + dx / d * max; e.y = arena.y + dy / d * max; }
    }
  }

  function arenaTick(dt, pl) {
    arena.t += dt;
    G.Legend.update(dt, pl);
    if (arena.phase === 'fight') {
      // Cuánta vida le queda al legendario (en todos: si cambia el anfitrión, sigue con ella; ver spawnLegend).
      const lb = G.EnemyMgr.all().find(e => (e.legend || e.boss) && !e.dead && !e.arceus);
      if (lb && lb.maxHp > 0) arena.frac = lb.hp / lb.maxHp;
      if (!authority()) {
        // (25-11-2026) Por si se pierde el aviso de que ha acabado (cambio de anfitrión en grupos de 3 o
        // 4: el nuevo ya había salido): nadie se queda dentro para siempre.
        if (arena.t > ARENA_TIME + 10 || (raMiss && performance.now() - raMiss > 4000)) lost();
        return;
      }
      keepInside();
      const boss = G.EnemyMgr.get(arena.bossId);
      if (!boss || boss.dead) { G.Coop.isHost && G.Coop.broadcast(['aw']); won(); return; }
      const allDown = G.Game.everyone().every(p => p.dead || p.silent);      // (ni el compañero sin conexión)
      downT = allDown ? downT + dt : 0;
      if (downT > 1.4 || arena.t > ARENA_TIME) { G.Coop.isHost && G.Coop.broadcast(['al']); lost(); }
      return;
    }
    arena.endT -= dt;
    if (arena.endT <= 0) finish();
  }

  function won() {
    if (!arena || arena.phase !== 'fight') return;
    arena.phase = 'won'; arena.endT = 5;
    G.Legend.stop();
    G.Progress.event('rift', { type: arena.type });
    G.Pickups.pullAll();
    G.Spawner.say('¡Has vencido a ' + G.DEX_BY[arena.dex].name + '! Recoge el premio…', 3.4, true);
    G.Audio.sfx('legend');
    const pl = G.Game.player;
    if (authority()) wins++;
    if (!egg && G.Eggs) { egg = true; G.Eggs.riftWon(); }
    if (pl && !arena.nb) {
      pl.bonds++;
      G.FX.dmgText(pl.x, pl.y - pl.bodyH - 10, '¡Vínculo!', '#ff8ad8', true);
      G.FX.ring(pl.x, pl.y, 8, 90, '#ff8ad8', 0.7, 5);
    }
  }

  function lost() {
    if (!arena || arena.phase !== 'fight') return;
    arena.phase = 'lost'; arena.endT = 1.2;
    G.Legend.stop();
    G.Spawner.say('La grieta os ha expulsado…', 2.6, true);
    G.Audio.sfx('back');
  }

  /** En cada ordenador: vuelta al mapa. */
  function finish() {
    const pl = G.Game.player;
    const a = arena;
    arena = null;
    over++;
    G.Legend.reset();
    G.World.setBiome(a.biome, true);
    G.Weather.clear();
    // Invitado: no se borra nada. El anfitrión avisa de los de la arena que se
    // van y de los del mapa que vuelven; si el invitado terminaba su cuenta
    // atrás un poco más tarde (pasa casi siempre), borraba los que acababan de
    // volver y no se veían hasta que caían (sólo sus ataques).
    if (authority()) G.EnemyMgr.restore();
    G.Projectiles.clear();
    G.Combat.clearFields();
    G.Hazards.clear();
    for (const p of G.Game.everyone()) { p.x = a.back.x; p.y = a.back.y; }
    pl.x = a.back.x; pl.y = a.back.y;
    if (pl.dead) pl.revive(0.3);
    G.Camera.x = pl.x; G.Camera.y = pl.y;
    G.Game.flash('#c9a6ff', 0.8);
    if (pl.bonds > 0) G.Game.offerBond();
  }

  // ---------------- dibujo ----------------

  /** La grieta, para ordenarla por Y con el resto de la escena. */
  function drawable() {
    if (!rift) return null;
    return {
      y: rift.y,
      draw(ctx) {
        const P = G.Sprites.PX;
        const img = G.Tiles.propSprite(0, 'rift', Math.floor(rift.t * 8) % 4);
        const w = img.width * P, h = img.height * P;
        const fadeIn = Math.min(1, rift.t * 2), fadeOut = Math.min(1, rift.ttl / 1.5);
        ctx.save();
        ctx.globalAlpha = 0.25 * fadeIn * fadeOut;
        ctx.fillStyle = '#7b3cff';
        ctx.beginPath(); ctx.ellipse(rift.x, rift.y, 34, 12, 0, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = fadeIn * fadeOut;
        ctx.drawImage(img, Math.round(rift.x - w / 2), Math.round(rift.y - h + 4), w, h);
        ctx.restore();
        if (Math.random() < 0.3) G.FX.px(rift.x + G.U.rand(-14, 14), rift.y - G.U.rand(10, 80), '#d9c2ff', { vy: -40, life: 0.6 });
      }
    };
  }

  /**
   * Otro pasa a llevar la partida a mitad (cambio de anfitrión, coop.js): si estabais
   * en la arena, el legendario del anfitrión anterior ya no está y vuelve a salir.
   */
  function adopt() {
    asked = false; downT = 0; checkT = 0; raMiss = 0;
    // (Las grietas que ya tocaron no vuelven a salir.)
    const t = G.Game.st ? G.Game.st.time : 0;
    riftIdx = RIFT_AT.filter(x => x <= t).length;
    if (arena && arena.phase === 'fight') { G.Legend.adopt(); arena.bossId = 0; spawnLegend(); }
  }

  // ---------------- red ----------------

  function onEvent(ev) {
    switch (ev[0]) {
      case 'rift': show(ev[1], ev[2], ev[3]); break;
      case 'riftx': rift = null; break;
      case 'arena': begin(ev[1]); break;
      case 'aw': won(); break;
      case 'al': lost(); break;
    }
  }

  return {
    reset, update, drawable, onEvent, adopt, leftBehind,
    // (Un invitado ha entrado: el anfitrión abre la arena, salvo si empieza la Sentencia o Eternatus, 25-11-2026.)
    enterRequest() { if (!arena && !G.Judgment.active && !G.Eternatus.active) start(); },
    /**
     * Cooperativo (25-11-2026): el reloj de la arena es el del anfitrión (cada uno llevaba el suyo y la cuenta
     * atrás no cuadraba). `t` llega en cada mensaje suyo mientras está en la arena; si deja de llegar
     * (`undefined`) y tú sigues peleando, es que él ya no está dentro (ver arenaTick).
     */
    netClock(t) {
      if (typeof t === 'number' && Number.isFinite(t)) { raMiss = 0; if (arena && arena.phase === 'fight' && Math.abs(arena.t - t) > 0.4) arena.t = t; }
      else if (arena && arena.phase === 'fight' && arena.t > 3) { if (!raMiss) raMiss = performance.now(); }
      else raMiss = 0;
    },
    /** Quita la grieta del mapa si la hay (al ir a la pelea de Eternatus), sin tocar el calendario. */
    hidePortal() { rift = null; asked = false; },
    get rift() { return rift; }, get arena() { return arena; },
    get inArena() { return !!arena; },
    /** Grietas ya pasadas en esta partida (statforms.js). */
    get over() { return over; },
    /** Para pruebas: como si ya hubieran pasado n grietas. */
    debugOver(n) { over = n | 0; },
    get timeLeft() { return arena ? Math.max(0, ARENA_TIME - arena.t) : 0; },
    debugOpen() { open(); },
    /** Para pruebas: arena de un tipo ya. */
    debugArena(type) { start(type); },
    /** Para vídeos: la próxima grieta en la que entres será de este tipo. */
    debugNextType(type) { nextType = type; }
  };
})();
