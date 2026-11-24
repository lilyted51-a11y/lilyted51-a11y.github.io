/* ============ coop.js — partida cooperativa (hasta 8 jugadores; original 4) ============
 *
 * Quién manda en qué:
 *   ANFITRIÓN   enemigos (aparición, IA, vida, muerte), objetos del suelo,
 *               experiencia y nivel del equipo, reloj, fin de la partida.
 *   CADA UNO    su propio Pokémon: posición, vida, ataques y lo que le golpea.
 *               Sus golpes a enemigos se mandan al anfitrión, que los aplica.
 *
 * Los invitados ven COPIAS de los enemigos del anfitrión (enemy.remote) y los
 * ataques de los compañeros como "fantasmas" que no hacen daño (ver combat.js).
 *
 * Quién está eligiendo (objeto o vínculo) y quién ha elegido carta de nivel va
 * además en CADA envío (no sólo en un aviso suelto): si un aviso se pierde
 * porque la conexión parpadea, el siguiente envío lo arregla y nadie se queda
 * esperando a otro para siempre (pasaba en 2026-10).
 *
 * Mensajes (por net.js, unas 15 veces por segundo; 3 si va por el relé):
 *   invitado -> anfitrión  { k:'f', p:[estado], ev:[eventos], h, w }   (h, w: ver flushClient)
 *   anfitrión -> invitado  { k:'f', t, lv, xp, xn, ki, bo, co, p:{uid:[estado]},
 *                            e:[[id,x,y,vida,anim,dir,estados]], ev:[eventos],
 *                            ja:[x,y,anim,dir,daño] (Arceus, sólo en la Sentencia) }
 *   anfitrión -> todos     { k:'start', seed, host, members:[{uid,name,dex,shiny}] }
 *
 * Cooperativo sin cortes (08-11-2026): si el anfitrión se va, se le corta la
 * conexión o deja de responder, la partida sigue con otro anfitrión (ver "cambio
 * de anfitrión", abajo). Y un jugador sin conexión (silent) ya no levanta a nadie,
 * ni mantiene viva la partida, ni recoge objetos, ni hace que salgan más enemigos,
 * ni se le espera en las cartas de nivel.
 */
G.Coop = (() => {
  const ANIMS = ['Idle', 'Walk', 'Attack', 'Shoot', 'Charge', 'Hurt', 'Faint'];
  const COLORS = ['#ffcb3d', '#5fc8ff', '#7ee07a', '#ff8ad8', '#ff9a4d', '#c47bff', '#5fe0d0', '#ff6b6b', '#d8e35c', '#f0a8ff'];
  // Mensajes por segundo: 15 por la conexión directa y 3 por el relé de la
  // Realtime Database (apagado: 1 $ el GB).
  const RATE_FAST = 1 / 15, RATE_SLOW = 1 / 3;
  const rateFor = u => (G.Net.slow(u) ? RATE_SLOW : RATE_FAST);
  const NEAR = 950;                     // radio de enemigos que se mandan a cada uno
  const EV_MAX = 500;                   // eventos por envío como mucho (el resto, en el siguiente)

  let active = false, host = false, me = null, hostUid = null;
  let local = null;                     // tu Player
  const mates = new Map();              // uid -> { uid, name, color, pl, connected, q:[], flushT, xpMul }
  let outEv = [];                       // invitado: eventos para el anfitrión
  let flushT = 0;
  let hitFrom = null;                   // invitado cuyo golpe se está aplicando (no repetirle el número)
  let api = {};                         // callbacks del juego (game.js)
  let waiting = new Set();              // subida de nivel: quién falta por elegir
  let holds = new Set();                // quién está eligiendo una fusión (la partida se para para todos)
  // El anfitrión mueve a los enemigos: si cambia de pestaña (o se le congela),
  // todo se para para todos. Antes los enemigos se quedaban quietos y los demás
  // seguían jugando con una ventaja enorme.
  let hostAway = false, stalled = false, lastHostAt = 0;
  // Cartas de nivel: número de la ronda (anfitrión), la última que te ha llegado
  // y la última que has elegido (invitado). Y el último "quién elige" aplicado.
  let levelSeq = 0, levelNow = 1, seenSeq = 0, doneSeq = 0, lastHo = '';
  const STALL_MS = 2500;
  let members = [];
  // Copia local (#45): nadie se queda esperando para siempre. Si alguien tarda
  // más de esto en elegir, el anfitrión elige por él (la primera opción).
  const WAIT_MAX = 20, HOLD_MAX = 25;   // segundos: cartas de nivel · objeto o vínculo
  let waitSince = 0, lastWaitSec = -1;  // cartas: desde cuándo se espera, último segundo avisado
  const holdSince = new Map();          // uid -> performance.now() al empezar a elegir
  // Cambio de anfitrión (ver abajo): cuánto se espera al anfitrión que no responde,
  // cuánto más cada candidato que el anterior, y cuánto al nuevo antes de seguir en solitario.
  const HOST_MAX = 30000, CLAIM_STEP = 5000, FOLLOW_MAX = 20000;
  let migrated = false, quietSince = 0, claiming = false, followSince = 0, swapNote = '';

  // ---------------- escalado de dificultad ----------------

  // Hasta 4 como el original; del 5.º al 8.º suben menos (el anfitrión mueve a todos los enemigos).
  const scaleRate = n => 1 + 0.75 * Math.min(3, Math.max(0, n - 1)) + 0.35 * Math.max(0, n - 4);
  const scaleHp = n => 1 + 0.3 * Math.min(3, Math.max(0, n - 1)) + 0.15 * Math.max(0, n - 4);

  // ---------------- arranque / fin ----------------

  /**
   * @param cfg   { seed, host, members }
   * @param pl    tu Player (ya creado)
   * @param cb    lo que hace falta del juego (coopApi en game.js: levelStart, resume, over, hold...)
   */
  function begin(cfg, pl, cb) {
    active = true;
    me = G.Net.uid; hostUid = cfg.host;
    host = me === hostUid;
    local = pl;
    api = cb;
    members = cfg.members;
    mates.clear();
    outEv = []; flushT = 0; waiting = new Set(); holds = new Set(); holdSince.clear(); waitSince = 0; lastWaitSec = -1;
    hostAway = false; stalled = false; lastHostAt = performance.now();
    sums = {}; sumT = 1; myHold = false;
    levelSeq = 0; levelNow = 1; seenSeq = 0; doneSeq = 0; lastHo = '';
    migrated = false; quietSince = 0; claiming = false; followSince = 0; swapNote = '';
    cfg.members.forEach((m, i) => {
      const x = (i - (cfg.members.length - 1) / 2) * 34, y = 0;
      if (m.uid === me) { pl.x = x; pl.y = y; pl.uid = me; pl.coopHost = host; pl.tagColor = COLORS[i]; return; }
      const mon = G.DEX_BY[m.dex] || G.DEX_BY[25];
      const p = new G.Player(mon, {}, !!m.shiny);
      p.remote = true; p.uid = m.uid; p.tag = m.name; p.tagColor = COLORS[i]; p.revLabel = 'Quédate a su lado';
      p.x = x; p.y = y;
      p.net = { x, y, ang: Math.PI / 2, walk: 0, hp: p.maxHp, maxHp: p.maxHp, dead: 0, mv: G.baseStartOf(mon.dex), ml: 1, mag: 78, aim: Math.PI / 2, rev: 0 };
      G.Sprites.preload([mon.dex], 8000, p.shiny);
      mates.set(m.uid, { uid: m.uid, name: m.name, color: COLORS[i], pl: p, connected: true, q: [], flushT: 0, xpMul: 1, lastAt: performance.now(), wait: 0 });
    });
  }

  function end() {
    for (const u of [...graceT.keys()]) stopGrace(u);
    active = false; host = false; local = null;
    mates.clear(); outEv = []; waiting = new Set(); holds = new Set(); holdSince.clear();
  }

  /** Te vas de la partida (los demás siguen). */
  function leave() {
    if (!active) return;
    if (host) {
      const next = successor();
      if (next) {
        // Cooperativo sin cortes: se va el anfitrión y la partida sigue con otro
        // (se avisa por aquí y la sala pasa a él: Social.handOver).
        emit(['hx', next]);
        flushAll();
        G.Social.handOver(next);
      } else {
        // No queda nadie que pueda seguir: la partida termina.
        emit(['ov', Object.assign(api.summary ? api.summary() : {}, { why: 'host', sums: teamSums() })]);
        flushAll();
      }
    } else {
      outEv.push(['bye']);
      flushClient('bye');
    }
    end();
  }

  // ---------------- lista de jugadores ----------------

  /** Los Pokémon de los compañeros conectados. */
  function puppets() { const out = []; for (const m of mates.values()) if (m.connected) out.push(m.pl); return out; }
  /** Todos: tú primero. */
  function players() { return [local, ...puppets()]; }
  /** ¿Habéis caído todos? (Un compañero sin conexión no mantiene viva la partida.) */
  function allDown() { return !!local && local.dead && puppets().every(p => p.dead || p.silent); }

  /**
   * Multiplicador de la experiencia del equipo: la media de los bonus de
   * cada uno, y repartida entre los que sois (en grupo cae mucho más, y si no
   * se subiría de nivel el triple de rápido que en solitario).
   */
  function xpFactor() {
    let s = local.xpMul, n = 1;
    for (const m of mates.values()) if (m.connected) { s += m.xpMul || 1; n++; }
    return (s / n) / local.xpMul / (1 + 0.6 * (n - 1));
  }

  // ---------------- estado de un jugador ----------------

  const r1 = v => Math.round(v), r2 = v => Math.round(v * 100) / 100;

  function myState() {
    // Con un vínculo se manda la órbita si la hay (es lo único que los demás no ven por los 'c').
    const g = local.activeGroup();
    const m = g.find(x => x.kind === 'orbit') || g[0];
    return [r1(local.x), r1(local.y), r2(local.moveAngle), local.walking ? 1 : 0, r1(local.hp), r1(local.maxHp),
            local.dead ? 1 : 0, m ? m.id : '', m ? m.lvl : 1, r1(local.magnet), r2(local.aim), r2(local.xpMul),
            r2(local.reviveT || 0), api.choosing && api.choosing() ? 1 : 0, doneSeq,
            G.BattleForms ? G.BattleForms.ownDex(local) : local.dex, ((G.BattleForms && G.BattleForms.saved(local)) || local).shiny ? 1 : 0, api.watching ? api.watching() : '', r2((G.Camera && G.Camera.zoomTo) || 1),
            G.Powers ? G.Powers.netCode(local) : 0,
            // Vestidor (23-11-2026): estela, efecto y aspecto, para que los demás los vean.
            ...(G.Dress ? G.Dress.netCode(local) : ['', '', 0]),
            local.aura ? 1 : 0,                  // aura de maestro (systems/mastery.js)
            G.BattleForms ? G.BattleForms.netCode(local) : 0,    // forma de combate puesta (systems/battleforms.js)
            r1(local.spd || 0)];                 // su velocidad de verdad (Arceus le persigue con ella: systems/judgment.js)
  }

  /** Número que llega por la red: si no es un número de verdad vale `def`, y si se pasa se queda en el tope. */
  const num = (v, def, lo, hi) => typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def;

  /*
   * Resumen de cada uno para el final de la partida (25-10-2026): su Pokémon, sus
   * ataques con el daño que han hecho y su objeto. Cada invitado manda el suyo al
   * anfitrión cada SUM_EVERY s ('sm') y el anfitrión, los de todos a todos ('sms');
   * al acabar van también en 'ov'. Así cada uno ve el de todos aunque alguien se
   * haya ido antes. Lo que llega se limpia (sólo números, ataques y objetos que
   * existen): nada de texto de otros jugadores.
   */
  const SUM_EVERY = 5;
  let sums = {}, sumT = 0;
  const mySum = () => (api && api.mySum ? api.mySum() : null);
  function cleanSum(s) {
    if (!s || typeof s !== 'object') return null;
    // (Hasta 2e6: las formas con número del juego oficial, como Arceus Bicho 500493; statforms.js.)
    const dex = Math.floor(num(s.dex, 0, 0, 2e6));
    if (!G.DEX_BY[dex]) return null;
    const mv = (Array.isArray(s.mv) ? s.mv : []).slice(0, 8)
      .filter(m => Array.isArray(m) && typeof m[0] === 'string' && G.Moves.BY_ID[m[0]])
      .map(m => [m[0], Math.floor(num(m[1], 1, 1, 99)), Math.round(num(m[2], 0, 0, 1e13)), Math.round(num(m[3], 0, 0, 86400)), m[4] ? 1 : 0]);
    const sk = typeof s.sk === 'string' && G.Skins && G.Skins.get(s.sk, dex) ? s.sk : '';
    const out = { dex, sh: s.sh === true, lv: Math.floor(num(s.lv, 1, 1, 9999)), t: Math.round(num(s.t, 0, 0, 86400)),
             it: typeof s.it === 'string' && G.Items.BY[s.it] ? s.it : null,
             its: (Array.isArray(s.its) ? s.its : []).slice(0, 4).filter(x => typeof x === 'string' && G.Items.BY[x]), sk, mv };
    // Su foto y marco, para la marca del ranking (24-11-2026; net/ranking.js, decPh).
    if (typeof s.ph === 'string' && G.Ranking && G.Ranking.decPh(s.ph)) out.ph = s.ph;
    return out;
  }
  /** La skin (Halloween) de un compañero, que va en su resumen: se le pone a su Pokémon. */
  function dressMate(u, c) { const m = mates.get(u); if (m && m.pl.anim && m.pl.dex === c.dex) m.pl.anim.skin = c.sk || null; }
  /** Los resúmenes de todos (el tuyo, recién hecho). Siguen ahí al acabar la partida. */
  function teamSums() { const out = Object.assign({}, sums), m = mySum(); if (m && me) out[me] = m; return out; }
  function takeSums(all) {
    if (!all || typeof all !== 'object') return;
    for (const u of Object.keys(all)) {
      if (u === me || !members.some(x => x.uid === u)) continue;
      const c = cleanSum(all[u]);
      if (c) { sums[u] = c; dressMate(u, c); }
    }
  }

  // Lo que manda otro jugador no se cree a ciegas: un xpMul de 1e309 colgaba al anfitrión al subir de nivel.
  function readState(a) {
    if (!Array.isArray(a)) a = [];
    return { x: num(a[0], 0, -1e6, 1e6), y: num(a[1], 0, -1e6, 1e6), ang: num(a[2], 0, -10, 10), walk: a[3] ? 1 : 0,
             hp: num(a[4], 0, 0, 1e6), maxHp: num(a[5], 1, 1, 1e6), dead: a[6] ? 1 : 0,
             mv: typeof a[7] === 'string' ? a[7].slice(0, 40) : '', ml: num(a[8], 1, 1, 99),
             mag: num(a[9], 0, 0, 5000), aim: num(a[10], 0, -10, 10), xpMul: num(a[11], 1, 0.1, 20),
             rev: num(a[12], 0, 0, 60), ch: a[13] === undefined ? undefined : a[13] ? 1 : 0, ld: num(a[14], 0, 0, 1e9),
             // copia local: Pokémon y shiny del compañero (cambio de Pokémon en la sala)
             dx: num(a[15], 0, 0, 2e6), sh: a[16] ? 1 : 0,
             wa: typeof a[17] === 'string' ? a[17].slice(0, 64) : '', zm: num(a[18], 1, 1, 1.5),
             pw: Math.floor(num(a[19], 0, 0, 40)),
             // Vestidor: estela, efecto y aspecto (G.Dress.applyNet sólo acepta los que existen)
             tr: typeof a[20] === 'string' ? a[20].slice(0, 24) : '', fx: typeof a[21] === 'string' ? a[21].slice(0, 12) : '',
             lk: Math.floor(num(a[22], 0, 0, 2e6)),
             au: a[23] === 1 ? 1 : 0,              // aura de maestro (systems/mastery.js)
             bf: Math.floor(num(a[24], 0, 0, 2e6)),     // forma de combate (G.BattleForms.applyNet sólo acepta las que existen)
             sp: num(a[25], 0, 0, 1500) };              // su velocidad (25-11-2026; 0 = no la manda)
  }

  /** Anfitrión: dónde mira un invitado (él mismo, o el compañero vivo que mira estando caído). */
  function viewOf(m) {
    const w = m.pl.dead && m.pl.net && m.pl.net.wa;
    if (!w) return m.pl;
    if (w === me) return local.dead ? m.pl : local;
    const o = mates.get(w);
    return o && o.connected && !o.pl.dead ? o.pl : m.pl;
  }

  /**
   * El compañero juega con otro Pokémon del que decía la sala (lo cambió en la
   * Pokédex sin volver al vestíbulo, o llegó tarde el aviso): se rehace su copia.
   */
  function syncDex(m, n) {
    if (!n.dx || !G.DEX_BY[n.dx]) return;
    const sh = !!n.sh;
    if (m.pl.dex === n.dx && m.pl.shiny === sh) return;
    const old = m.pl, mon = G.DEX_BY[n.dx];
    const p = new G.Player(mon, {}, sh);
    p.remote = true; p.uid = old.uid; p.tag = old.tag; p.tagColor = old.tagColor; p.revLabel = old.revLabel;
    p.x = old.x; p.y = old.y; p.net = old.net; p.hp = old.hp; p.maxHp = old.maxHp; p.dead = old.dead;
    G.Projectiles.clearOrbs(old);
    // Su skin sigue si la otra forma también la tiene (Mega o primigenia con skin: core/skins.js, mega).
    const sk = old.anim && old.anim.skin;
    if (sk && G.Skins && G.Skins.get(sk, mon.dex)) p.anim.skin = sk;
    G.Sprites.preload([mon.dex], 8000, sh, p.anim.skin || '');
    m.pl = p;
    const mem = members.find(x => x.uid === m.uid);
    if (mem) { mem.dex = n.dx; mem.shiny = sh; }
  }

  // ---------------- envío ----------------

  /** Anfitrión: evento para todos los invitados (menos `except`). */
  function emit(ev, except) {
    if (!host) return;
    for (const m of mates.values()) if (m.connected && m.uid !== except) m.q.push(ev);
  }

  /** Anfitrión: evento sólo para los que están cerca (números de daño). */
  function emitNear(ev, x, y, except) {
    for (const m of mates.values()) {
      if (!m.connected || m.uid === except) continue;
      const v = viewOf(m);
      if (G.U.dist2(v.x, v.y, x, y) > 700 * 700) continue;
      if (m.q.length > 400) continue;
      m.q.push(ev);
    }
  }

  function enemyList(near) {
    const out = [];
    const r2n = NEAR * NEAR;
    for (const e of G.EnemyMgr.all()) {
      if (e.dead || G.U.dist2(e.x, e.y, near.x, near.y) > r2n) continue;
      const a = ANIMS.indexOf(e.anim.cur);
      out.push([e.id, r1(e.x), r1(e.y), Math.ceil(e.hp), a < 0 ? 0 : a, e.anim.dir,
                (e.burn > 0 ? 1 : 0) | (e.poison > 0 ? 2 : 0) | (e.shield > 0 ? 4 : 0) | (e.slow > 0 ? 8 : 0) | (e.sleepT > 0 ? 16 : 0)]);
    }
    return out;
  }

  function hostFrame(m) {
    const st = api.team();
    const p = { [me]: myState() };
    for (const o of mates.values()) {
      if (o.connected && o.uid !== m.uid && o.state) p[o.uid] = o.state;
    }
    // Tras una espera (ver tick) puede haber muchos: un mensaje enorme no saldría.
    const ev = m.q.length > EV_MAX ? m.q.splice(0, EV_MAX) : m.q;
    if (ev === m.q) m.q = [];
    const f = { k: 'f', t: r2(st.time), lv: st.level, xp: r2(st.xp), xn: st.xpNext, ki: st.kills, bo: st.bosses, co: st.coins, tk: [st.t1, st.t10, st.cn || 0],
                p, e: enemyList(viewOf(m)), ev };
    const ja = G.Judgment.netState();       // Arceus en la Sentencia
    if (ja) f.ja = ja;
    // Siempre: quién está eligiendo y, si hay cartas de nivel, cuáles (ver arriba).
    f.ho = holdNames();
    if (waiting.size) f.lu = [levelSeq, levelNow];
    // Quién se ha ido (gn) y quién está sin conexión (si): cada juego lo necesita
    // para no dejar que un jugador apagado levante a nadie, y para saber quién sigue
    // si hay que cambiar de anfitrión.
    const gn = [], si = [];
    for (const o of mates.values()) { if (!o.connected) gn.push(o.uid); else if (o.pl.silent) si.push(o.uid); }
    if (gn.length) f.gn = gn;
    if (si.length) f.si = si;
    return f;
  }

  function flushAll() { for (const m of mates.values()) if (m.connected && !m.wait && !G.Net.busy(m.uid)) G.Net.send(m.uid, hostFrame(m)); }

  /*
   * Cada mensaje del invitado lleva también si está eligiendo fusión u objeto (h)
   * y hasta qué ronda de cartas de nivel ha elegido (w), y el anfitrión lo coge de
   * ahí (onClientFrame). Antes sólo iban en avisos sueltos ('hs'/'he'/'lp'): si uno
   * se perdía en un corte de la conexión, el anfitrión esperaba para siempre y la
   * partida se quedaba parada para todos (25-10-2026).
   */
  let myHold = false;
  function flushClient(force) {
    if (!force && !outEv.length && flushT > 0) return;
    // Con la conexión atascada se espera (los eventos siguen en outEv); el 'bye' sale igual.
    if (force !== 'bye' && G.Net.busy(hostUid)) return;
    G.Net.toHost({ k: 'f', p: myState(), ev: outEv, h: myHold ? 1 : 0, w: doneSeq });
    outEv = [];
  }

  /** Cada fotograma (también en la pantalla de subida de nivel). */
  function tick(dt) {
    if (!active) return;
    if ((sumT -= dt) <= 0) {
      sumT = SUM_EVERY;
      if (host) emit(['sms', teamSums()]);
      else {
        const m = mySum(); if (m) outEv.push(['sm', m]);
        // El sello del ranking (ranking.js): el anfitrión lo necesita para subir la marca.
        const sl = G.Ranking.mySeal(); if (sl) outEv.push(['seal', sl.s, sl.g]);
      }
    }
    if (host) {
      // Esperas con límite: cartas de nivel (con cuenta atrás) y objeto/vínculo.
      const now = performance.now();
      if (waiting.size) {
        const left = Math.ceil(WAIT_MAX - (now - waitSince) / 1000);
        if (left <= 0) forceCards();
        else if (left !== lastWaitSec) { lastWaitSec = left; sendWaiting(); }
      }
      for (const [u, t0] of holdSince) if (now - t0 > HOLD_MAX * 1000) forceHold(u);
      for (const m of mates.values()) {
        if (!m.connected) continue;
        // Tras un cambio de anfitrión: hasta que el compañero no manda algo al nuevo
        // (ya se ha enterado del cambio) no se le envía nada, o lo perdería. Si no
        // llega nunca, es que ha seguido por su cuenta.
        if (m.wait) { if (now - m.wait > FOLLOW_MAX + 5000) mateGone(m.uid); continue; }
        // Un compañero que no manda nada (el móvil apagado o en segundo plano) se
        // queda quieto y nunca muere: si los enemigos y Arceus le seguían
        // persiguiendo, el anfitrión aguantaba para siempre (25-10-2026). Y ya no se
        // le espera en las cartas de nivel ni mientras "elige" (08-11-2026).
        const sil = now - m.lastAt > SILENT_MS;
        if (sil !== !!m.pl.silent) {
          m.pl.silent = sil;
          if (sil) { if (waiting.has(m.uid)) picked(m.uid); if (holds.has(m.uid)) holdOff(m.uid); }
          if (G.Social.rearm) G.Social.rearm();
        }
        m.flushT -= dt;
        if (m.flushT > 0) continue;
        // Si aún no ha salido lo de antes, mandar más sólo alarga la cola: se espera
        // (los eventos se guardan en m.q). Si dura, el invitado se pone en pausa
        // («esperando al anfitrión») en vez de ver la partida minutos tarde.
        if (G.Net.busy(m.uid)) continue;
        m.flushT = rateFor(m.uid);
        G.Net.send(m.uid, hostFrame(m));
      }
    } else {
      const now = performance.now();
      if (!stalled && now - lastHostAt > STALL_MS) { stalled = true; updateAway(); }
      // Sin anfitrión (no responde o se ha ido de la pestaña): si dura HOST_MAX, se le
      // sustituye (ver "cambio de anfitrión"); tras un cambio, si el nuevo no llega, en solitario.
      if (!(stalled || hostAway)) quietSince = 0; else if (!quietSince) quietSince = now;
      if (followSince) {
        if (now - followSince > FOLLOW_MAX) { solo('No se ha podido seguir en grupo: continúas en solitario con todo lo que llevabas.'); return; }
      } else if (quietSince && !claiming && now - quietSince > HOST_MAX + CLAIM_STEP * myTurn()) claim();
      flushT -= dt;
      if (flushT <= 0) {
        flushT = rateFor(hostUid);
        flushClient(true);
      }
    }
  }

  // ---------------- recepción ----------------

  G.Net.on((from, msg) => {
    if (!msg) return;
    if (msg.k === 'start') { if (G.Flow.startCoop) G.Flow.startCoop(msg); return; }
    if (!active || msg.k !== 'f') return;
    if (host) onClientFrame(from, msg); else if (from === hostUid) onHostFrame(msg);
  });

  /*
   * Cortes de la conexión directa en plena partida (22-10-2026). Antes, al
   * primer fallo del canal (un bache de la wifi o de los datos), al invitado se
   * le acababa la partida al momento, aunque el anfitrión ya lo estuviera
   * reintentando. Ahora se espera GRACE_MS a que vuelva: el invitado se queda
   * en pausa («esperando al anfitrión») y el anfitrión sigue jugando.
   */
  const GRACE_MS = 45000;
  const SILENT_MS = 3000;              // sin noticias de un compañero: los enemigos le dejan (ver tick)
  const graceT = new Map();             // uid -> temporizador de la espera

  function stopGrace(u) { clearTimeout(graceT.get(u)); graceT.delete(u); }

  G.Net.onPeer((u, mode) => {
    if (!active) return;
    if (mode === 'direct') {
      if (!graceT.has(u)) return;
      stopGrace(u);
      const m = mates.get(u);
      if (host && m && m.connected) G.Spawner.say(m.name + ' ha vuelto', 2);
      return;
    }
    if (mode !== 'closed' && mode !== 'failed') return;
    const ours = host ? !!(mates.get(u) && mates.get(u).connected) : u === hostUid;
    if (mode === 'failed' && ours) {
      if (graceT.has(u)) return;                  // ya se le está esperando
      if (host) G.Spawner.say(nameOf(u) + ': reconectando…', 3);
      graceT.set(u, setTimeout(() => {
        graceT.delete(u);
        if (!active || G.Net.mode(u) === 'direct' || (host && !keeps(u))) return;   // volvió, o se fue ('bye')
        if (host) G.Social.dropMember(u);         // no volvió: fuera de la sala
        gone(u);
      }, GRACE_MS));
      return;
    }
    gone(u);
  });

  function gone(u) {
    stopGrace(u);
    if (host) mateGone(u);
    // Invitado: se ha perdido la conexión con el anfitrión. La partida ya no se acaba
    // (08-11-2026): se espera en pausa y, si no vuelve, otro pasa a ser el anfitrión
    // (lo normal es que la sala cambie de anfitrión sola a los pocos segundos).
    else if (u === hostUid && !stalled) { stalled = true; updateAway(); }
  }

  /** Anfitrión: ¿`u` sigue en esta partida (aunque se esté reconectando)? */
  function keeps(u) { const m = active && host && mates.get(u); return !!(m && m.connected); }

  function mateGone(u) {
    const m = mates.get(u);
    if (!m || !m.connected) return;
    m.connected = false;
    G.Projectiles.clearOrbs(m.pl);
    G.Spawner.say(m.name + ' ha dejado la partida', 2.6);
    if (waiting.has(u)) picked(u);
    if (holds.has(u)) holdOff(u);
    if (G.Social.rearm) G.Social.rearm();       // (quién heredaría la sala si me desconecto)
  }

  // --- en el anfitrión ---

  function onClientFrame(from, msg) {
    const m = mates.get(from);
    if (!m || !m.connected) return;
    m.lastAt = performance.now(); m.wait = 0;
    if (m.pl.silent) { m.pl.silent = false; if (G.Social.rearm) G.Social.rearm(); }
    // Lo que dice su juego manda sobre lo que se apuntó con los avisos (ver flushClient).
    if (msg.h === 0 && holds.has(from)) holdOff(from);
    else if (msg.h === 1 && !holds.has(from)) holdOn(from);
    if (typeof msg.w === 'number' && msg.w >= levelSeq && waiting.has(from)) picked(from);
    if (msg.p) { m.state = msg.p; const n = readState(msg.p); syncDex(m, n); m.pl.net = n; G.Powers.applyNet(m.pl, n.pw); if (G.Dress) G.Dress.applyNet(m.pl, n); if (G.BattleForms) G.BattleForms.applyNet(m.pl, n.bf); m.xpMul = n.xpMul || 1; reconcile(from, n); }
    for (const ev of msg.ev || []) {
      switch (ev[0]) {
        case 'h': {
          const e = G.EnemyMgr.get(ev[1]);
          if (!e || e.dead || e.remote) break;
          hitFrom = from;
          e.hurt(ev[2], ev[3], ev[4], ev[5], ev[6]);
          hitFrom = null;
          break;
        }
        case 's': {
          const e = G.EnemyMgr.get(ev[1]);
          if (!e || e.dead) break;
          if (ev[2] === 'b') e.applyBurn(ev[3]);
          else if (ev[2] === 'p') e.applyPoison(ev[3]);
          else if (ev[2] === 's') e.applySlow(ev[3]);
          else if (ev[2] === 't') e.applyStun(ev[3]);
          break;
        }
        case 'c':
          G.Combat.ghostCast(m.pl, ev[1], ev[2], ev[3], ev[4]);
          emit(['c', from, ev[1], ev[2], ev[3], ev[4]], from);
          break;
        case 'pb':
          G.World.breakAt(ev[1], ev[2]);
          emit(['pb', ev[1], ev[2]], from);
          break;
        case 'wd':
          if (G.World.digWall(num(ev[1], NaN, -1e6, 1e6), num(ev[2], NaN, -1e6, 1e6), true)) emit(['wd', ev[1], ev[2]], from);
          break;
        case 'ou': {
          // Esfera de un invitado: se aplica aquí (los enemigos son del anfitrión) y se avisa a los demás.
          const x = num(ev[2], 0, -1e6, 1e6), y = num(ev[3], 0, -1e6, 1e6), z = num(ev[4], 1, 1, 1.5);
          if (typeof ev[1] === 'string' && G.Orbs.onMateUse(m.pl, ev[1], x, y, z)) emit(['ob', ev[1], x, y, z], from);
          break;
        }
        case 'lp': picked(from); break;
        case 'hs': holdOn(from); break;
        case 'he': holdOff(from); break;
        case 're': G.Rift.enterRequest(); break;
        case 'jx': G.Judgment.onMate(from, ev); break;     // Sentencia: lo que le ha pasado a un invitado (el ataque roto)
        case 'bye': mateGone(from); break;
        case 'sm': { const c = cleanSum(ev[1]); if (c) { sums[from] = c; dressMate(from, c); } break; }
        case 'seal': if (Number.isSafeInteger(ev[1]) && typeof ev[2] === 'string' && /^[0-9a-f]{64}$/.test(ev[2])) m.seal = { s: ev[1], g: ev[2] }; break;
        // Un invitado con Sequía, Llovizna...: su clima, si no hay otro (como mucho uno por minuto).
        case 'wxq':
          if (typeof ev[1] === 'string' && G.Weather.KINDS[ev[1]] && !G.Weather.current && performance.now() - (m.wxAt || -1e9) > 60000) {
            m.wxAt = performance.now();
            G.Weather.debugStart(ev[1], 60);
          }
          break;
      }
    }
  }

  /** Anfitrión: lo que dice cada envío del invitado manda sobre avisos que se hayan perdido. */
  function reconcile(from, n) {
    if (n.ch === undefined) return;                        // versión vieja del juego
    if (n.ch && !holds.has(from)) holdOn(from);
    else if (!n.ch && holds.has(from)) holdOff(from);
    if (waiting.has(from) && n.ld >= levelSeq) picked(from);
  }

  // --- en el invitado ---

  /** Invitado: se para (o sigue) según si el anfitrión está. (swapNote: el texto, si es por un cambio de anfitrión.) */
  function updateAway() { if (api.away) api.away(hostAway || stalled ? nameOf(hostUid) : null, swapNote); }

  // Anfitrión: al irse de la pestaña avisa a todos al momento (después ya no
  // podrá mandar nada) y al volver, que sigue.
  document.addEventListener('visibilitychange', () => {
    if (!active || !host) return;
    emit(['ha', document.hidden ? 1 : 0]);
    flushAll();
  });

  function onHostFrame(msg) {
    lastHostAt = performance.now();
    const arrived = !!followSince;                 // ya llega el nuevo anfitrión: se sigue
    if (arrived) { followSince = 0; swapNote = ''; }
    if (stalled) { stalled = false; updateAway(); }
    // (Después de quitar la pausa, que borra el aviso del centro.)
    if (arrived) G.Spawner.say('Cambio de anfitrión: la partida sigue (ya no cuenta para el ranking)', 4, true);
    // Quién se ha ido y quién está sin conexión (lo sabe el anfitrión).
    for (const m of mates.values()) {
      const off = Array.isArray(msg.gn) && msg.gn.includes(m.uid);
      if (off && m.connected) { m.connected = false; G.Projectiles.clearOrbs(m.pl); }
      m.pl.silent = !off && Array.isArray(msg.si) && msg.si.includes(m.uid);
    }
    for (const ev of msg.ev || []) applyHostEvent(ev);
    if (msg.ja) G.Judgment.netApply(msg.ja);
    // Quién elige y las cartas de nivel, aunque se haya perdido algún aviso.
    if (msg.ho) {
      const k = msg.ho.join('|');
      if (k !== lastHo) { lastHo = k; api.hold && api.hold(msg.ho); }
      // Hay cartas abiertas que aún no has elegido y no las tienes delante (eran
      // nuevas, o algo te las cerró al elegir muy deprisa): se abren otra vez.
      // Antes sólo se miraba si eran nuevas y te podías quedar fuera de la ronda
      // con los demás esperándote.
      const showing = api.inLevelUp && api.inLevelUp();
      if (msg.lu && msg.lu[0] > doneSeq && (msg.lu[0] > seenSeq || !showing)) { seenSeq = msg.lu[0]; api.levelStart(msg.lu[1]); }
      else if (!msg.lu && showing) api.resume();
    }
    api.syncTeam({ time: msg.t, level: msg.lv, xp: msg.xp, xpNext: msg.xn, kills: msg.ki, bosses: msg.bo, coins: msg.co,
                   t1: (msg.tk || [])[0], t10: (msg.tk || [])[1], cn: num((msg.tk || [])[2], 0, 0, 1e6) });
    for (const u in msg.p || {}) {
      const m = mates.get(u);
      if (m) { const n = readState(msg.p[u]); syncDex(m, n); m.pl.net = n; G.Powers.applyNet(m.pl, n.pw); if (G.Dress) G.Dress.applyNet(m.pl, n); if (G.BattleForms) G.BattleForms.applyNet(m.pl, n.bf); }
    }
    const now = performance.now();
    for (const a of msg.e || []) {
      const e = G.EnemyMgr.get(a[0]);
      if (!e || !e.remote || e.dead) continue;
      const n = e.net;
      const dts = (now - (n.last || now)) / 1000;
      if (dts > 0.02 && dts < 1) {
        n.vx = G.U.clamp((a[1] - n.x) / dts, -600, 600);
        n.vy = G.U.clamp((a[2] - n.y) / dts, -600, 600);
      } else { n.vx = 0; n.vy = 0; }
      n.x = a[1]; n.y = a[2]; n.age = 0; n.last = now;
      e.hp = Math.min(e.maxHp, a[3]);
      n.anim = a[4]; n.dir = a[5]; n.st = a[6];
    }
  }

  function applyHostEvent(ev) {
    switch (ev[0]) {
      case 'ne':
        G.EnemyMgr.addRemote({ id: ev[1], dex: ev[2], x: ev[3], y: ev[4], boss: !!ev[5], shiny: !!ev[6], hp: ev[7], dmg: ev[8], beh: ev[9] });
        break;
      case 'ed': G.EnemyMgr.removeRemote(ev[1], true); break;
      case 'eg': G.EnemyMgr.removeRemote(ev[1], false); break;
      case 'hn': { const e = G.EnemyMgr.get(ev[1]); if (e && !e.dead) e.showHurt(ev[2], ev[3]); break; }
      case 'es':
        G.Projectiles.spawn({ x: ev[1], y: ev[2], vx: ev[3], vy: ev[4], dmg: ev[5], r: ev[6], life: ev[7],
                              friendly: false, color: '#ff7a9e', vis: G.VFX.forType(ev[8]), mtype: ev[8], cat: ev[9], pct: num(ev[10], 0, 0, 0.3) });
        break;
      case 'c': { const m = mates.get(ev[1]); if (m) G.Combat.ghostCast(m.pl, ev[2], ev[3], ev[4], ev[5]); break; }
      case 'item': api.item(ev[1]); break;
      case 'use': if (typeof ev[1] === 'string' && G.Consum.DEF[ev[1]]) api.use(ev[1]); break;
      case 'orb': if (typeof ev[1] === 'string') api.orb(ev[1]); break;
      case 'ob': if (typeof ev[1] === 'string') G.Orbs.nearBuff(ev[1], num(ev[2], 0, -1e6, 1e6), num(ev[3], 0, -1e6, 1e6)); break;
      case 'pk': G.Pickups.addRemote(ev[1], ev[2], ev[3], ev[4], ev[5]); break;
      case 'pc': G.Pickups.removeId(ev[1]); break;
      case 'mag': G.Pickups.pullAll(); G.FX.ring(local.x, local.y, 10, 420, '#ff9ed8', 0.6, 4); break;
      case 'bomb':
        G.FX.ring(ev[1], ev[2], 20, G.Camera.outerRadius(), '#ff7b3d', 0.5, 6);
        if (G.U.dist2(ev[1], ev[2], local.x, local.y) < 500 * 500) G.Camera.kick(0.8);
        G.Audio.sfx('break');
        break;
      case 'pb': G.World.breakAt(ev[1], ev[2]); break;
      case 'wd': G.World.digWall(num(ev[1], NaN, -1e6, 1e6), num(ev[2], NaN, -1e6, 1e6), true); break;
      case 'say': G.Spawner.say(ev[1], ev[2]); break;
      case 'heal': if (!local.dead) { local.heal(local.maxHp * ev[1]); G.FX.ring(local.x, local.y, 6, 60, '#5fe08a', 0.4, 3); } break;
      case 'lu': if (!ev[2] || ev[2] > seenSeq) { seenSeq = ev[2] || seenSeq; api.levelStart(ev[1]); } break;
      case 'lw': api.waiting(ev[1], ev[2]); break;
      case 'lf': api.forcePick && api.forcePick(); break;      // se acabó el tiempo: tu carta se elige sola
      case 'hf': if (ev[1] === me && api.forceChoice) api.forceChoice(); break;  // ídem con el objeto o el vínculo
      case 'lr': api.resume(); break;
      case 'hp': lastHo = (ev[1] || []).join('|'); api.hold && api.hold(ev[1]); break;
      case 'ha': hostAway = !!ev[1]; updateAway(); break;
      // El anfitrión se va y la partida sigue con otro (ev[1]): en pausa hasta que la sala cambie.
      case 'hx':
        if (typeof ev[1] === 'string') {
          swapNote = ev[1] === me ? G.I18n.f('{x} se ha ido: pasas a ser el anfitrión…', nameOf(hostUid))
                                  : G.I18n.f('{x} se ha ido: {x} pasa a ser el anfitrión…', nameOf(hostUid), nameOf(ev[1]));
          stalled = true; updateAway();
        }
        break;
      case 'pz': api.hostPause && api.hostPause(!!ev[1]); break;   // pausa del anfitrión para todos
      case 'sh': api.shiny(ev[1]); break;
      case 'ov': { const cb = api.over; const d = ev[1]; if (d) takeSums(d.sums); end(); cb(d); break; }
      case 'sms': takeSums(ev[1]); break;
      case 'rift': case 'riftx': case 'arena': case 'aw': case 'al': G.Rift.onEvent(ev); break;
      case 'jd': case 'jk': case 'jb': case 'jx': G.Judgment.onEvent(ev); break;
      case 'et': G.Eternatus.onEvent(ev); break;
      case 'lg': G.Legend.onEvent(ev); break;     // el legendario de la grieta (systems/legend.js)
      case 'wx': G.Weather.onEvent(ev); break;
      case 'ev': G.Events.onNet(ev); break;
      case 'hz': G.Hazards.add(ev[1], true); break;
      case 'fxr':
        if (typeof ev[4] === 'string') G.FX.ring(num(ev[1], 0, -1e6, 1e6), num(ev[2], 0, -1e6, 1e6), 8, num(ev[3], 8, 0, 2000), ev[4], 0.5, 3);
        break;
    }
  }

  // ---------------- ganchos que llaman los módulos del juego ----------------

  /** Tu ataque: los demás lo repiten como fantasma. */
  function cast(pl, m) {
    if (!active || pl !== local) return;
    if (host) emit(['c', me, m.id, m.lvl, r2(pl.aim), m.evolved ? 1 : 0]);
    else outEv.push(['c', m.id, m.lvl, r2(pl.aim), m.evolved ? 1 : 0]);
  }

  // invitado
  function hit(e, d, color, dx, dy, knock) { outEv.push(['h', e.id, d, color, r1(dx), r1(dy), knock || 0]); }
  function status(e, kind, val) { outEv.push(['s', e.id, kind, val]); }

  // anfitrión
  function hurtShown(e, d, color) { emitNear(['hn', e.id, d, color], e.x, e.y, hitFrom); }
  function enemyAdded(e) {
    emit(['ne', e.id, e.dex, r1(e.x), r1(e.y), e.boss ? 1 : 0, e.shiny ? 1 : 0, Math.ceil(e.maxHp), r2(e.dmg), e.behavior]);
  }
  function enemyGone(e, died) { emit([died ? 'ed' : 'eg', e.id]); }
  function enemyShot(p, type) { emit(['es', r1(p.x), r1(p.y), r1(p.vx), r1(p.vy), r2(p.dmg), p.r, p.life, type, p.cat, r2(p.pct || 0)]); }
  function pickupAdded(o) { emit(['pk', o.id, o.kind, r1(o.x), r1(o.y), o.value]); }
  function pickupGone(id) { emit(['pc', id]); }
  function say(text, secs) { emit(['say', text, secs]); }

  function propBroken(p) {
    if (host) emit(['pb', p.tx, p.ty]);
    else outEv.push(['pb', p.tx, p.ty]);
  }
  /** Un muro roto por un Dinamax (world.js digWall, 25-11-2026): a los demás. */
  function wallDug(tx, ty) {
    if (host) emit(['wd', tx, ty]);
    else outEv.push(['wd', tx, ty]);
  }

  /** Anfitrión: alguien ha cogido un objeto. Devuelve true si es para ti. */
  function collected(p, who) {
    emit(['pc', p.id]);
    if (p.kind === 'magnet') emit(['mag']);
    if (p.kind === 'bomb') emit(['bomb', r1(who.x), r1(who.y)]);
    if ((p.kind === 'heal' || p.kind === 'item' || p.kind === 'sphere' || p.kind === 'use') && who !== local) {
      const m = mates.get(who.uid);
      if (m) m.q.push(p.kind === 'heal' ? ['heal', 0.3] : [p.kind === 'item' ? 'item' : p.kind === 'use' ? 'use' : 'orb', p.value]);
    }
  }

  function shinyCaught(e) { emit(['sh', e.dex]); }

  /** Has usado una esfera: el anfitrión avisa a todos; un invitado se lo pide al anfitrión. */
  function orbUsed(id, x, y, z) {
    if (!active) return;
    if (host) emit(['ob', id, r1(x), r1(y), r2(z)]);
    else outEv.push(['ou', id, r1(x), r1(y), r2(z)]);
  }

  // ---------------- subida de nivel compartida ----------------

  function levelStart(level) {
    waiting = new Set([me]);
    // (A quien está sin conexión no se le espera: 08-11-2026.)
    for (const m of mates.values()) if (m.connected && !m.pl.silent && !m.wait) waiting.add(m.uid);
    levelSeq++; levelNow = level;
    waitSince = performance.now(); lastWaitSec = -1;
    emit(['lu', level, levelSeq]);
    flushAll();
    api.levelStart(level);
    sendWaiting();
  }

  function nameOf(u) { return u === me ? (G.Social.me ? G.Social.me.name : 'Tú') : (mates.get(u) || {}).name || '?'; }

  function sendWaiting() {
    const names = [...waiting].map(nameOf);
    const secs = Math.max(0, Math.ceil(WAIT_MAX - (performance.now() - waitSince) / 1000));
    emit(['lw', names, secs]);
    api.waiting(names, secs);
  }

  /** Anfitrión: se acabó el tiempo de las cartas; cada uno (incluido yo) se queda con la primera. */
  function forceCards() {
    emit(['lf']); flushAll();
    if (api.forcePick && api.inLevelUp && api.inLevelUp()) api.forcePick();   // yo (llama a localPicked)
    for (const u of [...waiting]) picked(u);                                  // los demás: se sigue sin esperarlos
  }

  /** Anfitrión: `u` lleva demasiado eligiendo objeto o vínculo. */
  function forceHold(u) {
    if (u === me) { if (api.forceChoice) api.forceChoice(); }
    else { emit(['hf', u]); flushAll(); }
    holdOff(u);
  }

  /** Alguien ha elegido carta (anfitrión). */
  function picked(u) {
    if (!waiting.delete(u)) return;
    if (waiting.size) { sendWaiting(); return; }
    emit(['lr']);
    flushAll();
    api.resume();
  }

  // ---------------- fusiones: pausa para todos ----------------
  // Mientras alguien elige qué movimientos fusiona (vínculo de un legendario),
  // la partida se para para todos, como con las cartas de nivel.

  function holdNames() { return [...holds].map(nameOf); }

  /** Anfitrión: `u` empieza a elegir. */
  function holdOn(u) {
    holds.add(u);
    if (!holdSince.has(u)) holdSince.set(u, performance.now());
    emit(['hp', holdNames()]); flushAll();
    api.hold && api.hold(holdNames());
  }

  /** Anfitrión: `u` ha terminado (o se ha ido). */
  function holdOff(u) {
    holdSince.delete(u);
    if (!holds.delete(u)) return;
    emit(['hp', holdNames()]); flushAll();
    api.hold && api.hold(holdNames());
  }

  /** Tú empiezas / terminas de elegir fusión. */
  function holdStart() { if (host) holdOn(me); else { myHold = true; outEv.push(['hs']); flushClient(true); } }
  function holdEnd() { if (host) holdOff(me); else { myHold = false; outEv.push(['he']); flushClient(true); } }

  /** Has elegido tu carta. */
  function localPicked() {
    if (!active) { if (api.resume) api.resume(); return; }     // (ya en solitario: no hay a quién esperar)
    if (host) { doneSeq = seenSeq; picked(me); }
    else { doneSeq = seenSeq; outEv.push(['lp']); flushClient(true); }
  }

  // ---------------- cambio de anfitrión (cooperativo sin cortes, 08-11-2026) ----------------
  /*
   * Si el anfitrión se va, se le corta la conexión o deja de responder, la partida
   * ya no se acaba: otro jugador pasa a ser el anfitrión y se sigue juntos; y si no
   * se puede, cada uno sigue su partida en solitario con todo lo que llevaba.
   *
   *   se va por las buenas     leave(): avisa ('hx') y deja la sala al siguiente (Social.handOver)
   *   se le cierra el juego    la base de datos pasa la sala sola (social.js, onDisconnect)
   *   no responde en HOST_MAX  el siguiente de la lista toma el puesto (Social.claimHost)
   *
   * En los tres casos cambia `host` en la sala y cada juego lo ve (Social 'host'):
   *   el nuevo anfitrión         promote(): pasa a mandar él (enemigos, objetos, reloj...)
   *   los demás                  follow(): se conectan a él y esperan sus envíos
   *   el antiguo, si sigue ahí   solo(): continúa por su cuenta
   *
   * Los enemigos del anfitrión anterior no se heredan (cada uno sólo tenía copias,
   * sin su comportamiento): se quitan y el nuevo anfitrión saca los suyos; el jefe o
   * legendario que hubiera vuelve a salir (game.js, takeOver). Los objetos del suelo
   * que veía el nuevo anfitrión se quedan. Una partida que cambia de anfitrión no
   * entra en el ranking.
   */

  /** Anfitrión: a quién le pasaría la partida (el primero de la lista que sigue conectado), o null. */
  function successor() {
    if (!active || !host) return null;
    const ok = members.filter(x => { const m = mates.get(x.uid); return m && m.connected && !m.wait; });
    const best = ok.find(x => !mates.get(x.uid).pl.silent) || null;       // mejor uno que responda
    return best ? best.uid : null;
  }

  /** Invitado: tu turno para sustituir al anfitrión (0 = el primero), por el orden de la sala. */
  function myTurn() {
    const r = G.Social.room;
    if (!r) return 0;
    const c = r.members.filter(m => m.uid !== r.host).map(m => m.uid);
    const i = c.indexOf(me);
    return i < 0 ? c.length : i;
  }

  /** Invitado: el anfitrión lleva HOST_MAX sin responder y te toca: tomas su puesto. */
  async function claim() {
    claiming = true;
    const was = hostUid;
    let ok = false;
    try { ok = await G.Social.claimHost(); } catch (e) { ok = false; }
    claiming = false;
    if (!active || host || hostUid !== was) return;       // ya ha cambiado por otro lado
    // No se ha podido (o la sala ya no existe): cada uno por su cuenta.
    if (!ok) solo('Se ha perdido el grupo: continúas en solitario con todo lo que llevabas.');
  }

  /** Pasas a ser el anfitrión en plena partida. */
  function promote() {
    const old = hostUid, now = performance.now();
    migrated = true;
    host = true; hostUid = me;
    // (local.coopHost se queda como estaba, a false: esta partida ya no sube al ranking.)
    stalled = false; hostAway = false; quietSince = 0; followSince = 0; claiming = false; swapNote = '';
    for (const u of [...graceT.keys()]) stopGrace(u);
    outEv = []; lastHo = '';
    for (const m of mates.values()) {
      if (m.uid === old) { if (m.connected) { m.connected = false; G.Projectiles.clearOrbs(m.pl); } continue; }
      if (!m.connected) continue;
      m.q = []; m.flushT = 0; m.lastAt = now; m.state = null; m.wait = now;
    }
    // Lo que llevaba el anfitrión anterior.
    const hadBoss = G.EnemyMgr.all().some(e => e.remote && e.boss && !e.dead);
    G.EnemyMgr.clearRemote();
    if (api.takeOver) api.takeOver(hadBoss);
    for (const o of G.Pickups.adopt()) emit(['pk', o.id, o.kind, r1(o.x), r1(o.y), o.value]);
    // Pausas del anterior: fuera. Si había cartas de nivel abiertas, la ronda sigue
    // con el mismo número: quien ya eligió lo dice en su siguiente envío.
    waiting = new Set(); holds = new Set(); holdSince.clear();
    levelSeq = seenSeq;
    if (api.hostPause) api.hostPause(false);
    if (api.hold) api.hold([]);
    if (api.away) api.away(null, '');
    if (api.choosing && api.choosing()) holdOn(me);
    if (api.inLevelUp && api.inLevelUp()) {
      if (doneSeq < seenSeq) waiting.add(me);
      for (const m of mates.values()) if (m.connected) waiting.add(m.uid);
      levelNow = local.level; waitSince = now; lastWaitSec = -1;
      if (waiting.size) sendWaiting(); else api.resume();
    }
    G.Spawner.say('Cambio de anfitrión: la partida sigue (ya no cuenta para el ranking)', 4, true);
  }

  /** Otro jugador (u) pasa a ser el anfitrión: te conectas a él y esperas sus envíos. */
  function follow(u) {
    const old = hostUid;
    migrated = true;
    hostUid = u; lastHostAt = performance.now(); followSince = lastHostAt;
    hostAway = false; quietSince = 0; claiming = false;
    for (const k of [...graceT.keys()]) stopGrace(k);
    outEv = []; lastHo = '';
    const m = mates.get(old);
    if (m && m.connected) { m.connected = false; G.Projectiles.clearOrbs(m.pl); }
    // Lo del anfitrión anterior: fuera (el nuevo manda lo suyo en cuanto conecte).
    G.EnemyMgr.clearRemote();
    G.Pickups.clear();
    if (api.hostPause) api.hostPause(false);
    if (api.hold) api.hold([]);
    swapNote = G.I18n.f('Cambio de anfitrión: conectando con {x}…', nameOf(u));
    stalled = true; updateAway();
  }

  /**
   * Te quedas sin grupo en plena partida (no se pudo conectar con el nuevo anfitrión,
   * la sala se cerró, o eras el anfitrión y otro ha ocupado tu puesto): sigues tu
   * partida en solitario con todo lo que llevabas.
   */
  function solo(msg) {
    if (!active) return;
    const wasHost = host, picked_ = doneSeq >= seenSeq;
    migrated = true;
    if (!wasHost) { try { outEv = [['bye']]; flushClient('bye'); } catch (e) { /* nada */ } }
    for (const m of mates.values()) G.Projectiles.clearOrbs(m.pl);
    if (local) local.coopHost = false;             // ya no sube al ranking en grupo
    const hadBoss = !wasHost && G.EnemyMgr.all().some(e => e.remote && e.boss && !e.dead);
    const cb = api.solo;
    end();                                          // (la partida sigue, ya sin red)
    if (!wasHost) { G.EnemyMgr.clearRemote(); G.Pickups.adopt(); }
    if (cb) cb(msg, wasHost, hadBoss, picked_);
    if (G.Social.room) G.Social.leaveRoom();
  }

  // (En las pruebas de tests/ no hay sala: sin G.Social.on no hay nada que escuchar.)
  if (G.Social && G.Social.on) G.Social.on(what => {
    if (!active) return;
    const r = G.Social.room;
    if (what === 'host' && r) {
      if (r.isHost) { if (!host) promote(); }
      else if (host) solo('Otro jugador ha pasado a ser el anfitrión: continúas en solitario con todo lo que llevabas.');
      else if (r.host !== hostUid) follow(r.host);
    } else if (what === 'room-closed' && !host) {
      // La sala ha desaparecido en plena partida.
      solo('Se ha perdido el grupo: continúas en solitario con todo lo que llevabas.');
    }
  });

  /** Anfitrión: se acabó para todos. */
  function over(data) {
    emit(['ov', Object.assign({}, data, { sums: teamSums() })]);
    flushAll();
    end();
  }

  return {
    ANIMS, COLORS, begin, end, leave, keeps, successor, tick, players, puppets, allDown, xpFactor, scaleRate, scaleHp,
    cast, hit, status, hurtShown, enemyAdded, enemyGone, enemyShot, pickupAdded, pickupGone, say,
    propBroken, wallDug, collected, shinyCaught, orbUsed, levelStart, localPicked, over, holdStart, holdEnd,
    /** Anfitrión: evento para todos. Invitado: evento para el anfitrión. */
    broadcast(ev) { emit(ev); },
    toHost(ev) { if (active && !host) { outEv.push(ev); flushClient(true); } },
    mate(u) { return mates.get(u); },
    /** Anfitrión: el sello del ranking que mandó el invitado u (o null). */
    sealOf(u) { const m = mates.get(u); return m && m.seal ? { s: m.seal.s, g: m.seal.g } : null; },
    get mates() { return [...mates.values()]; },
    get members() { return members; },
    /** uid -> resumen de cada jugador (ver cleanSum), también al acabar. */
    sums: teamSums,
    get active() { return active; },
    /** ¿Ha cambiado de anfitrión esta partida? (Entonces no entra en el ranking.) */
    get migrated() { return migrated; },
    get isHost() { return active && host; },
    get local() { return local; }
  };
})();
