/* ============ challenge.js — Desafío semanal ============
 * (23-11-2026, como el del juego oficial desde el 13-11 y sus condiciones del 16-11; hecho aquí a
 *  partir de sus novedades.)
 *
 * Cada semana (de lunes a domingo, hora de España) hay un desafío igual para todos: el mismo mapa
 * (semilla de World.reset), el mismo Pokémon y la misma condición. Todo sale de la semana con un
 * generador con semilla, como las MT del día de la Tienda (data/shop.js): no hace falta servidor.
 *
 *   - El Pokémon es prestado: con su naturaleza neutra, su primera habilidad y su ataque de serie;
 *     sin tus Mejoras, sin skin y sin shiny. Igual para todos.
 *   - Condiciones (una cada semana, siempre distinta de la anterior; ver ORDER):
 *       wx      un clima toda la partida (systems/weather.js, lock): sol, lluvia, arena, nieve o niebla
 *       type    «Todos de tipo …»: los enemigos y los jefes son de ese tipo (data/enemies.js)
 *       noheal  «Sin curaciones»: la vida perdida no vuelve (ni bayas, ni objetos, ni regeneración)
 *       night   «Noche cerrada»: todo a oscuras menos un círculo alrededor de tu Pokémon
 *   - Un solo intento por semana, que se gasta al empezar (save.chal). Si aguantas 3 minutos,
 *     un ticket ×10.
 *   - Su propio ranking, sólo de tiempo aguantado (net/ranking.js, tabla s_cw<año>-<semana>).
 *   - Sólo en solitario. La partida va marcada (G.Game.challenge): la maestría no la cuenta y
 *     tampoco sube a los rankings normales.
 *
 * save.chal = { w: 'w2026-48', at: cuándo empezó, t: segundos aguantados, tk: 1 si ya cobró el ticket }
 * (core/db.js, merge: la semana más reciente; la misma semana, lo mayor de cada cosa.)
 */
G.Challenge = (() => {
  const TICKET_AT = 180;
  // Una condición por semana, en este orden (dos seguidas nunca son iguales, tampoco al cambiar de año).
  const ORDER = ['wx:rain', 'type', 'noheal', 'wx:sand', 'night', 'wx:sun', 'type', 'wx:snow', 'noheal', 'wx:fog', 'night'];

  let armed = null;          // el desafío que va a empezar (startRun lo recoge con take)
  let cur = null;            // el de la partida en curso (o la última jugada, hasta la siguiente)
  let paid = false;          // ticket ×10 de los 3 minutos ya dado
  let cap = 1;               // «Sin curaciones»: la vida (en proporción) no puede pasar de aquí
  let darkCv = null;

  const save = () => G.DB.save;

  // ---------------- la semana ----------------

  function rng(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  /** Semana ISO en España, 'w2026-48' (la misma que usan las misiones y el ranking semanal). */
  const weekId = (date = new Date()) => G.Ranking.periodIds(date).w;
  const weekNum = w => { const m = /^w(\d+)-(\d+)$/.exec(w || ''); return m ? +m[1] * 53 + +m[2] : 0; };

  // Especies que llegaron el 24-11-2026 (tools/add_species.py): no cuentan en el sorteo hasta la semana
  // LATE.w, para que el desafío de la semana en que se publican no cambie a mitad (el Pokémon y el tipo
  // salen de un índice en la lista). Si se publica en esa semana o después, subir LATE.w a la siguiente.
  const LATE = { w: 'w2026-49', dex: new Set([593, 618, 683, 733, 837, 865, 878, 879, 929, 945, 948, 962, 990, 1003, 1021, 1025]) };
  const isOld = w => !!w && weekNum(w) < weekNum(LATE.w);
  const inWeek = (p, w) => !(isOld(w) && LATE.dex.has(p.dex));

  /** Tipos con al menos 3 Pokémon en cada tramo de enemigos (para «Todos de tipo …»). */
  const typesCache = {};
  function types(w) {
    const k = isOld(w) ? 'old' : 'new';
    if (typesCache[k]) return typesCache[k];
    const T = G.Enemies.TIERS;
    return (typesCache[k] = Object.keys(G.U.TYPE_NAME).filter(ty => T.every(tier =>
      G.Enemies.candidates(tier).filter(p => p.types.includes(ty) && inWeek(p, w)).length >= 3)));
  }

  const memo = new Map();
  /** El desafío de una semana: { w, seed, dex, cond, wx?, type? } (igual en todos los aparatos). */
  function of(w) {
    if (memo.has(w)) return memo.get(w);
    const r = rng('desafio:' + w);
    const seed = Math.floor(r() * 1e6);
    // Pokémon prestado: de los normales (sin legendarios ni formas), con fuerza para aguantar.
    const pool = G.DEX.filter(p => p.dex <= 1025 && p.rarity < 5 && !p.excl && p.bst >= 430 && G.SPRITE_META[p.dex] && inWeek(p, w)).sort((a, b) => a.dex - b.dex);
    const dex = pool.length ? pool[Math.floor(r() * pool.length)].dex : 25;
    const c = ORDER[weekNum(w) % ORDER.length];
    const info = { w, seed, dex, cond: c.startsWith('wx:') ? 'wx' : c };
    if (info.cond === 'wx') info.wx = c.slice(3);
    if (info.cond === 'type') { const ts = types(w); info.type = ts[Math.floor(r() * ts.length)] || 'normal'; }
    memo.set(w, info);
    return info;
  }
  function thisWeek() { return of(weekId()); }

  /** Lo que se recuerda de tu intento de esta semana: { w, at, t, tk } o null. */
  function mine(w = weekId()) { const c = save() && save().chal; return c && c.w === w && c.at ? c : null; }
  const used = w => !!mine(w);

  /** Cuánto falta para el siguiente desafío (el lunes a las 0:00 de España). → ms */
  let endOf = { w: '', at: 0 };
  function msLeft() {
    const now = Date.now(), w = weekId();
    if (endOf.w !== w) {
      // (Se busca hacia delante, de hora en hora y luego de minuto en minuto: sin cuentas de horarios de verano.)
      let t = now;
      while (weekId(new Date(t + 3600e3)) === w && t - now < 8 * 864e5) t += 3600e3;
      while (weekId(new Date(t + 60e3)) === w && t - now < 8 * 864e5) t += 60e3;
      endOf = { w, at: Math.floor((t + 60e3) / 60e3) * 60e3 };
    }
    return Math.max(0, endOf.at - now);
  }

  // ---------------- textos ----------------

  /** La condición en corto («Lluvia», «Todos de tipo Fuego»...). */
  function label(c) {
    if (c.cond === 'wx') return G.T(G.Weather.KINDS[c.wx].name);
    if (c.cond === 'type') return G.I18n.f('Todos de tipo {x}', G.T(G.U.TYPE_NAME[c.type]));
    if (c.cond === 'noheal') return G.T('Sin curaciones');
    return G.T('Noche cerrada');
  }
  /** La condición entera, como sale en su pantalla y en el resumen de la partida. */
  function desc(c) {
    if (c.cond === 'wx') { const k = G.Weather.KINDS[c.wx]; return G.I18n.f('{x} toda la partida: {x}.', G.T(k.name), G.T(k.hint)); }
    if (c.cond === 'type') return G.I18n.f('Todos los enemigos y los jefes son de tipo {x}.', G.T(G.U.TYPE_NAME[c.type]));
    if (c.cond === 'noheal') return G.T('Nada te cura: ni bayas, ni objetos, ni regeneración. La vida que pierdes no vuelve.');
    return G.T('Todo está a oscuras: sólo ves lo que hay cerca de tu Pokémon.');
  }
  const color = c => (c.cond === 'wx' ? G.Weather.KINDS[c.wx].color : c.cond === 'type' ? G.U.TYPE_COLOR[c.type]
    : c.cond === 'noheal' ? '#ff7b8a' : '#a9b4ff');

  // ---------------- la partida ----------------

  /** Deja listo el desafío de esta semana para la próxima partida (la pantalla del desafío). */
  function arm() { armed = thisWeek(); }

  /**
   * Al empezar cualquier partida (game.js, startRun, antes de sortear enemigos y mapa): recoge el
   * desafío armado (sólo en solitario) y gasta el intento de la semana. → info o null
   */
  function take(coop) {
    const c = coop ? null : armed;
    armed = null; cur = c; paid = false; cap = 1;
    if (!c) return null;
    const s = save();
    if (s) {
      const old = mine(c.w);
      s.chal = { w: c.w, at: (old && old.at) || Date.now(), t: old ? old.t || 0 : 0, tk: old ? old.tk || 0 : 0 };
      paid = !!s.chal.tk;
      G.DB.commit();          // el intento se gasta ya (si cierras la pestaña, también)
    }
    return c;
  }

  /** El Pokémon prestado: sus stats tal cual (naturaleza neutra), una copia. */
  function monOf(c) {
    const m = Object.assign({}, G.DEX_BY[c.dex]);
    m.atk = Math.max(m.pa, m.sa);
    m.nature = 'hardy';
    return m;
  }
  /** Su habilidad: la primera (la misma para todos). */
  function abilityOf(c) { return G.Mons.slots(c.dex)[0] || ''; }

  /** Con el jugador ya creado: pone la condición y lo avisa. */
  function begin(pl) {
    if (!cur) return;
    if (cur.cond === 'wx') G.Weather.lock(cur.wx);
    G.Spawner.say(G.I18n.f('Desafío semanal: {x}', label(cur)), 4, true);
  }

  /** Cada fotograma de la partida (game.js, update). → true si acaba de ganar el ticket ×10 */
  function tick(dt, pl, time) {
    if (!cur || !pl) return false;
    if (cur.cond === 'noheal') {
      if (pl.dead) cap = 1;
      else {
        const f = pl.hp / Math.max(1, pl.maxHp);
        if (f > cap) pl.hp = cap * pl.maxHp; else cap = f;
      }
    }
    if (!paid && time >= TICKET_AT) {
      paid = true;
      const s = save();
      if (s && s.chal && s.chal.w === cur.w) s.chal.tk = 1;
      G.Spawner.say(G.T('¡3 minutos en el desafío! Te llevas un ticket ×10'), 4, true);
      G.Audio.sfx('legend');
      return true;
    }
    return false;
  }

  /** Al acabar (game.js, endRun): apunta lo aguantado y quita el clima fijo. */
  function finish(time) {
    if (!cur) return;
    const s = save();
    if (s && s.chal && s.chal.w === cur.w) s.chal.t = Math.max(+s.chal.t || 0, Math.floor(time));
    G.Weather.lock(null);
  }

  /** «Noche cerrada»: todo a oscuras menos un círculo alrededor de tu Pokémon (game.js, render). */
  function drawDark(ctx, w, h, pl) {
    if (!cur || cur.cond !== 'night' || !pl) return;
    const cam = G.Camera, k = cam.scale;
    const x = (pl.x - cam.left()) * k, y = (pl.y - G.LIFT * 0.5 - cam.top()) * k;
    const r0 = 110 * k, r1 = 230 * k;
    if (!darkCv) darkCv = document.createElement('canvas');
    if (darkCv.width !== Math.ceil(w) || darkCv.height !== Math.ceil(h)) { darkCv.width = Math.ceil(w); darkCv.height = Math.ceil(h); }
    const d = darkCv.getContext('2d');
    d.globalCompositeOperation = 'source-over';
    d.clearRect(0, 0, darkCv.width, darkCv.height);
    d.fillStyle = 'rgba(3,4,16,0.95)';
    d.fillRect(0, 0, darkCv.width, darkCv.height);
    d.globalCompositeOperation = 'destination-out';
    const g = d.createRadialGradient(x, y, r0, x, y, r1);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = g;
    d.beginPath(); d.arc(x, y, r1, 0, 6.2832); d.fill();
    d.globalCompositeOperation = 'source-over';
    ctx.drawImage(darkCv, 0, 0, w, h);
  }

  /** El rótulo del desafío en el HUD, arriba a la derecha (bajo el del clima). → alto ocupado */
  function drawHud(ctx, x1, y0, F, roundRect) {
    if (!cur) return 0;
    ctx.save();
    ctx.font = F(800, 11);
    ctx.textAlign = 'left';
    const txt = 'DESAFÍO SEMANAL · ' + label(cur).toUpperCase();
    const tw = ctx.measureText(txt).width + 20;
    roundRect(ctx, x1 - tw, y0, tw, 22, 8);
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
    ctx.fillStyle = color(cur);
    ctx.fillText(txt, x1 - tw + 10, y0 + 15);
    ctx.restore();
    return 28;
  }

  return {
    TICKET_AT, ORDER, weekId, of, thisWeek, types, mine, used, msLeft, label, desc, color,
    arm, take, monOf, abilityOf, begin, tick, finish, drawDark, drawHud,
    /** El desafío de la partida en curso (o de la última), o null. */
    get cur() { return cur; },
    get active() { return !!cur; },
    /** «Todos de tipo …»: el tipo de los enemigos de esta partida (data/enemies.js), o null. */
    get onlyType() { return cur && cur.cond === 'type' ? cur.type : null; },
    get noHeal() { return !!(cur && cur.cond === 'noheal'); }
  };
})();
