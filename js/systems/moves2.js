/* ============ moves2.js — formas de atacar nuevas (24-11-2026, copia local) ============
 * Las MT «con formas de atacar nuevas» de la Gran Actualización del juego oficial, hechas aquí a
 * partir de su guía de movimientos (los datos van al final de la tabla de data/moves.js).
 *
 * Formas que pegan (kind):
 *   rush     Saltos en cadena (Velocidad Extrema): vas de enemigo en enemigo golpeando; intocable.
 *   explode  Explosión: estallido enorme alrededor; te cuesta un cuarto de la vida que te queda.
 *   storm    Tormenta (Trueno, Sentencia): rayos del cielo sobre enemigos de la pantalla (avisan).
 *   cross    Cruz (Llamarada, Fulgor Semilla): estalla una cruz sobre el enemigo.
 *   punch    Puñetazo (Puño Fuego/Trueno/Hielo/Drenaje, Puños Plasma): tres directos seguidos; el
 *            último, con su efecto (salta a dos, electrocuta alrededor, congela...).
 *   wave     Onda (Surf): una ola hasta 360 hacia donde apuntas; pega una vez y arrastra.
 *   tremor   Temblor (Terremoto, Mundo Gélido): un anillo sale de ti y pega a todo lo que alcanza.
 *   leap     Salto (Acróbata, Golpe Umbrío): saltas sobre el enemigo y caes con una onda.
 *   scissor  Tijera (Tijera X, Hachazo Pétreo): dos tajos en X; en el centro, los dos.
 * Las que no pegan son `buff` con `act` (combat.js las manda aquí):
 *   protect  Protección: 1,5 s intocable (recarga mínima 5 s, `minCd`). Contra Arceus no vale.
 *   decoy    Doble Equipo: una copia tuya que atrae a los enemigos de alrededor (lure, enemy.js).
 *   weather  Día Soleado, Danza Lluvia, Tormenta Arena: el clima un rato (Weather.fromMove).
 *   rest     Descanso: te cura mucho y te quedas dormido (ni te mueves ni atacas: asleep).
 *   screen   Reflejo / Pantalla Luz: −35 % del daño físico / especial un rato (incoming, player.js).
 *
 * Todos los golpes pasan por Combat.api.hit (tipo, clima, crítico, Guante de Boxeo con los de
 * contacto, Teracristal, Dinamax...). Dado Trucado: +1 salto, rayo o directo.
 *
 * Cooperativo: como los demás ataques, cada uno ejecuta los suyos y los compañeros los repiten
 * «fantasma» (ghost: sólo se ven). Lo que toca a los enemigos de verdad lo hace quien los tiene (el
 * anfitrión), también con el fantasma de un invitado: la ola arrastra y la copia de Doble Equipo
 * atrae. El clima lo pone el anfitrión y lo manda ('wx' con la marca de movimiento).
 */
G.Moves2 = (() => {
  const PX = G.Sprites.PX;
  const snap = v => Math.round(v / PX) * PX;
  const api = () => G.Combat.api;
  let fields = [];
  let clock = 0;                           // reloj de la partida (se para con la partida)

  // ---------------- paletas y formas propias ----------------
  Object.assign(G.VFX.PAL, {
    gold:    ['#5a3a00', '#a8720a', '#f0b62a', '#ffe27a', '#fffbe0'],
    plasma:  ['#10306a', '#2a66c8', '#56b4ff', '#c4ecff', '#ffffff'],
    shield:  ['#0d4a2a', '#1f8a4e', '#4fd07e', '#b4f7c8', '#ffffff'],
    reflect: ['#4a1458', '#8a3aa8', '#d77ae8', '#f3c4ff', '#ffffff'],
    lscreen: ['#5a4a00', '#b09010', '#ffe04a', '#fff4a8', '#ffffff']
  });
  Object.assign(G.VFX.SHAPES, {
    // Puño (mira a la derecha): nudillos claros delante.
    fist: { w: 11, h: 9, dir: true, gen(P) {
      P.fill((x, y) => {
        const d = Math.hypot((x - 6) / 4.4, (y - 4) / 3.6);
        if (d > 1) return null;
        return x >= 8 ? 'l' : y >= 6 ? 'd' : 'm';
      });
      for (let y = 1; y <= 7; y += 2) P.set(9, y, 'w');
      P.set(4, 2, 'l'); P.set(1, 4, 'd'); P.set(2, 4, 'd');
      P.outline();
    } },
    // Zeta del sueño (Descanso).
    zee: { w: 7, h: 7, gen(P) {
      for (let x = 1; x <= 5; x++) { P.set(x, 1, 'l'); P.set(x, 5, 'm'); }
      for (let i = 0; i <= 3; i++) P.set(4 - i, 2 + i, 'l');
      P.set(1, 1, 'w'); P.set(2, 1, 'w');
      P.outline();
    } },
    // Hexágono de las paredes de luz (Reflejo, Pantalla Luz).
    hexa: { w: 9, h: 10, gen(P) {
      P.fill((x, y) => {
        const dx = Math.abs(x - 4), dy = Math.abs(y - 4.5);
        if (dx > 4 || dy > 4.6 - dx * 0.5) return null;
        return dx > 3 || dy > 3.6 - dx * 0.5 ? 'm' : 'L';
      });
      P.set(2, 2, 'w'); P.set(3, 2, 'w'); P.set(2, 3, 'w');
    } }
  });

  // Cómo se ve cada uno: paleta y la forma que suelta.
  const LOOK = {
    'extreme-speed': { pal: 'normal', proj: 'streak' },
    'explosion':     { pal: 'fire', proj: 'fire' },
    'judgment':      { pal: 'gold', proj: 'star' },
    'thunder':       { pal: 'electric', proj: 'bolt' },
    'fire-blast':    { pal: 'fire', proj: 'fire' },
    'seed-flare':    { pal: 'grass', proj: 'leaf' },
    'fire-punch':    { pal: 'fire', proj: 'fire' },
    'thunder-punch': { pal: 'electric', proj: 'bolt' },
    'plasma-fists':  { pal: 'plasma', proj: 'bolt' },
    'ice-punch':     { pal: 'ice', proj: 'shard' },
    'drain-punch':   { pal: 'fighting', proj: 'heart' },
    'surf':          { pal: 'water', proj: 'drop' },
    'glaciate':      { pal: 'ice', proj: 'shard' },
    'earthquake':    { pal: 'ground', proj: 'rock' },
    'acrobatics':    { pal: 'flying', proj: 'wind' },
    'shadow-force':  { pal: 'ghost', proj: 'shadow' },
    'x-scissor':     { pal: 'bug', proj: 'needle' },
    'stone-axe':     { pal: 'rock', proj: 'rock' }
  };
  const look = m => LOOK[m.id] || { pal: G.VFX.PAL[m.type] ? m.type : 'normal', proj: 'ball' };
  const colOf = m => G.U.TYPE_COLOR[m.type];
  const PALC = pal => G.VFX.PAL[pal] || G.VFX.PAL.normal;

  // Para player.cast (animación y sonido) y combat.js (Guante de Boxeo, alcance).
  const ANIM = { rush: 'Attack', explode: 'Attack', storm: 'Charge', cross: 'Shoot', punch: 'Attack', wave: 'Shoot',
                 tremor: 'Attack', leap: 'Attack', scissor: 'Attack' };
  const SND = { rush: 'melee', explode: 'nova', storm: 'beam', cross: 'nova', punch: 'melee', wave: 'nova',
                tremor: 'nova', leap: 'melee', scissor: 'melee' };
  const CONTACT = new Set(['punch', 'scissor', 'leap', 'rush']);
  const KINDS = new Set(Object.keys(ANIM));

  /** Distancia a la que se lanza (el enemigo tiene que estar a esto). */
  function reach(m) {
    switch (m.kind) {
      case 'rush': return 260;
      case 'explode': return m.radius * 0.75;
      case 'storm': return 380;
      case 'cross': return 320;
      case 'punch': return m.radius + 26;
      case 'wave': return m.radius * 0.8;
      case 'tremor': return m.radius * 0.85;
      case 'leap': return 290;
      case 'scissor': return m.radius + 10;
    }
    return 0;
  }

  // ---------------- utilidades ----------------
  const add = f => { f.t = f.t || 0; fields.push(f); return f; };
  const drop = (owner, kind, extra) => { for (const f of fields) if (f.owner === owner && f.kind === kind && (!extra || extra(f))) f.gone = true; };
  /** Golpea a todo lo que hay en el círculo (salvo `skip`). → los enemigos golpeados */
  function circle(pl, m, x, y, r, dmg, knock, skip) {
    const out = [], col = colOf(m);
    for (const e of G.EnemyMgr.queryCircle(x, y, r)) {
      if (skip && skip.has(e.id)) continue;
      api().hit(pl, e, dmg, col, e.x - x, e.y - y, knock || 0, m);
      out.push(e);
      if (skip) skip.add(e.id);
    }
    for (const p of G.World.propsInCircle(x, y, r)) {
      if (skip && skip.has('p' + p.id)) continue;
      G.World.damageProp(p, dmg, col);
      if (skip) skip.add('p' + p.id);
    }
    return out;
  }
  const dmgOf = (pl, m) => m.dmg * pl.atkFor(m);
  const seen = (x, y, pad = 60) => G.Camera.sees(x, y, pad);
  const grounded = () => !!(G.Judgment && G.Judgment.grounded);
  /** El enemigo más cercano a (x, y) a menos de r que no esté en `done`. */
  function nearestFrom(x, y, r, done) {
    let best = null, bd = r * r;
    for (const e of G.EnemyMgr.queryCircle(x, y, r)) {
      if (done && done.has(e.id)) continue;
      const d = G.U.dist2(x, y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  /** Copia del sprite del dueño (estelas de Velocidad Extrema y de los saltos). */
  function after(owner, x, y, lift, life = 0.24, alpha = 0.45) {
    if (!owner.anim || !seen(x, y, 80)) return;
    add({ kind: 'after', owner, x, y, lift: lift || 0, life, alpha, dir: owner.anim.dir });
  }

  // ---------------- lanzar ----------------

  function run(pl, m, ghost) {
    const k = m.act || m.kind;
    switch (k) {
      case 'protect': return protect(pl, m, ghost);
      case 'screen':  return screen(pl, m, ghost);
      case 'rest':    return rest(pl, m, ghost);
      case 'decoy':   return decoy(pl, m, ghost);
      case 'weather': return weather(pl, m, ghost);
      case 'rush':    return rush(pl, m, ghost);
      case 'explode': return explode(pl, m, ghost);
      case 'storm':   return storm(pl, m, ghost);
      case 'cross':   return cross(pl, m, ghost);
      case 'punch':   return punch(pl, m, ghost);
      case 'wave':    return wave(pl, m, ghost);
      case 'tremor':  return tremor(pl, m, ghost);
      case 'leap':    return leap(pl, m, ghost);
      case 'scissor': return scissor(pl, m, ghost);
    }
  }

  // --- los que no pegan ---

  function protect(pl, m, ghost) {
    if (!ghost) pl.m2prot = clock + m.dur;
    drop(pl, 'shield');
    add({ kind: 'shield', owner: pl, life: m.dur, pal: 'shield' });
    G.FX.ring(pl.x, pl.y - G.LIFT * 0.5, pl.r * 3, pl.r * 1.2, '#7dffa8', 0.3, 3);
  }

  function screen(pl, m, ghost) {
    if (!ghost) { pl.m2scr = pl.m2scr || {}; pl.m2scr[m.guard] = { until: clock + m.dur, k: Math.min(0.6, m.amount) }; }
    const pal = m.guard === 'special' ? 'lscreen' : 'reflect';
    drop(pl, 'screen', f => f.guard === m.guard);
    add({ kind: 'screen', owner: pl, life: m.dur, guard: m.guard, pal, a0: Math.random() * 6.28 });
    const P = PALC(pal);
    G.FX.ring(pl.x, pl.y, 6, pl.r * 3.4, P[3], 0.4, 3);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * 6.2832;
      G.FX.sp('hexa', pal, pl.x + Math.cos(a) * pl.r * 2.4, pl.y + Math.sin(a) * pl.r * 1.2 - G.LIFT * 0.6,
              { vy: -30, life: 0.45, scale: 1.2 });
    }
  }

  function rest(pl, m, ghost) {
    if (!ghost) {
      pl.heal(pl.maxHp * m.amount);
      pl.m2sleep = clock + m.stun;
      if (pl.slowT) pl.slowT = 0;                       // (dormir te quita el frenazo)
    }
    drop(pl, 'zzz');
    add({ kind: 'zzz', owner: pl, life: m.stun, next: 0 });
    G.FX.ring(pl.x, pl.y, pl.r * 2.6, pl.r, '#9fd0ff', 0.5, 2);
    for (let i = 0; i < 8; i++) G.FX.sp('heart', 'psychic', pl.x + G.U.rand(-pl.r, pl.r), pl.y - G.U.rand(4, pl.bodyH), { vy: -50, life: 0.7 });
  }

  function decoy(pl, m, ghost) {
    drop(pl, 'decoy');
    // Un poco detrás de ti (donde se pueda estar).
    let x = pl.x, y = pl.y;
    for (const d of [46, 30, 16]) {
      const a = pl.aim + Math.PI * 0.75, nx = pl.x + Math.cos(a) * d * 1.3, ny = pl.y + Math.sin(a) * d * 0.8;
      if (G.World.isFree(nx, ny, pl.r * 0.8, true)) { x = nx; y = ny; break; }
    }
    const anim = pl.anim ? new G.Sprites.Animator(pl.dex, pl.anim.scale, pl.anim.shiny) : null;
    if (anim) { anim.skin = pl.anim.skin; anim.dir = pl.anim.dir; anim.loop('Idle'); }
    // Lo que miran los enemigos (enemy.js): como un jugador quieto.
    add({ kind: 'decoy', owner: pl, ghost, x, y, life: m.dur, rr: m.radius, r: pl.r, level: pl.level || 1, _vx: 0, _vy: 0,
          anim, scale: pl.scale, dex: pl.dex, decoy: true });
    for (let i = 0; i < 10; i++) G.FX.px(x + G.U.rand(-pl.r, pl.r), y - G.U.rand(0, pl.bodyH || 20), '#ffffff', { vy: -40, life: 0.4, size: 2 });
    G.FX.ring(x, y, 4, m.radius * 0.35, '#e6e0ff', 0.4, 2);
  }

  function weather(pl, m, ghost) {
    // El clima lo pone el anfitrión (también el de un invitado: le llega como fantasma) y lo manda.
    if (!G.Coop.active || G.Coop.isHost) {
      if (G.Weather.fromMove(m.wx, m.dur) && G.Coop.isHost) G.Coop.broadcast(['wx', m.wx, m.dur, 1]);
    }
    const P = { sun: ['#ffcb3d', 'star', 'gold'], rain: ['#7fb8ff', 'drop', 'water'], sand: ['#e0bf73', 'rock', 'ground'] }[m.wx] || ['#ffffff', 'star', 'normal'];
    G.FX.ring(pl.x, pl.y, pl.r, pl.r * 5, P[0], 0.5, 3);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * 6.2832;
      G.FX.sp(P[1], P[2], pl.x + Math.cos(a) * pl.r * 1.6, pl.y + Math.sin(a) * pl.r - G.LIFT * 0.5,
              { vx: Math.cos(a) * 40, vy: -90 - Math.random() * 40, life: 0.6, scale: m.wx === 'sand' ? 0.7 : 1,
                angle: m.wx === 'rain' ? Math.PI / 2 : 0 });
    }
  }

  // --- los que pegan ---

  /** Velocidad Extrema: de enemigo en enemigo, golpe a golpe (lo hace update). */
  function rush(pl, m, ghost) {
    const tg = api().spotFor(pl, m);
    if (!tg) return;
    drop(pl, 'rush');
    add({ kind: 'rush', owner: pl, ghost, m, x: pl.x, y: pl.y, cur: tg, left: Math.max(1, m.count | 0) + api().dice(pl, m),
          next: 0, done: new Set(), dmg: dmgOf(pl, m) });
    if (!ghost) pl.invuln = Math.max(pl.invuln || 0, 0.3);
  }

  function explode(pl, m, ghost) {
    const lk = look(m), x = pl.x, y = pl.y, R = m.radius;
    if (!ghost) {
      // Cuesta un cuarto de la vida que te queda (nunca te deja KO).
      const cost = Math.floor(pl.hp * 0.25);
      if (cost >= 1 && pl.hp - cost >= 1) {
        pl.hp -= cost;
        G.FX.dmgText(pl.x, pl.y - pl.bodyH - 4, '-' + cost, '#ff9a3d');
      }
    }
    add({ kind: 'blast', owner: pl, x, y, r: R, life: 0.55, pal: lk.pal });
    G.FX.ring(x, y, 8, R, '#fff2a0', 0.32, 4);
    G.FX.ring(x, y, 4, R * 1.15, '#ff6a1f', 0.45, 4);
    G.FX.burst(x, y - G.LIFT * 0.5, '#ffb22e', 30, 320);
    G.FX.burst(x, y - G.LIFT * 0.5, '#fff2a0', 14, 200);
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * 6.2832 + Math.random() * 0.2;
      G.FX.sp('fire', 'fire', x + Math.cos(a) * 10, y + Math.sin(a) * 8 - G.LIFT * 0.5,
              { vx: Math.cos(a) * R * 2.6, vy: Math.sin(a) * R * 2 - 30, life: 0.42, angle: a, scale: 1.5 });
    }
    for (let i = 0; i < 6; i++) G.FX.sp('rock', 'dark', x + G.U.rand(-R, R) * 0.4, y - 10, { vx: G.U.rand(-160, 160), vy: -G.U.rand(160, 260), grav: 600, life: 0.7, spin: 9 });
    if (seen(x, y)) { G.Audio.sfx('break'); G.Camera.kick(ghost ? 0.15 : 0.5); }
    if (ghost) return;
    circle(pl, m, x, y, R, dmgOf(pl, m), m.knock || 200);
  }

  /** Trueno / Sentencia: rayos sobre enemigos de la pantalla (si faltan, a sitios cerca de ti). */
  function storm(pl, m, ghost) {
    const n = Math.max(1, m.count | 0) + api().dice(pl, m), lk = look(m);
    const near = G.EnemyMgr.queryCircle(pl.x, pl.y, 430).filter(e => seen(e.x, e.y, 10));
    for (let i = near.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [near[i], near[j]] = [near[j], near[i]]; }
    // Sentencia: primero los más fuertes (jefes y legendarios).
    if (m.id === 'judgment') near.sort((a, b) => (b.boss ? 1 : 0) - (a.boss ? 1 : 0));
    const dmg = dmgOf(pl, m);
    for (let i = 0; i < n; i++) {
      const e = near[i % Math.max(1, near.length)];
      const spot = e && i < near.length ? e : null;
      const a = Math.random() * 6.2832, d = G.U.rand(60, 220);
      const x = spot ? spot.x : e ? e.x + G.U.rand(-50, 50) : pl.x + Math.cos(a) * d;
      const y = spot ? spot.y : e ? e.y + G.U.rand(-40, 40) : pl.y + Math.sin(a) * d * 0.8;
      add({ kind: 'bolt', owner: pl, ghost, m, x, y, tg: spot, r: m.radius, t: -i * 0.07, warn: 0.3, life: 0.62,
            pal: lk.pal, holy: m.id === 'judgment', dmg, seed: Math.random() * 100 });
    }
  }

  /** Llamarada / Fulgor Semilla: una cruz que estalla sobre el enemigo. */
  function cross(pl, m, ghost) {
    const tg = api().spotFor(pl, m);
    const x = tg ? tg.x : pl.x + Math.cos(pl.aim) * 140, y = tg ? tg.y : pl.y + Math.sin(pl.aim) * 110;
    const lk = look(m);
    add({ kind: 'cross', owner: pl, ghost, m, x, y, L: m.radius, w: m.width || 24, at: 0.14, life: 0.6, pal: lk.pal, proj: lk.proj,
          dmg: dmgOf(pl, m) });
    G.FX.ring(x, y, m.radius * 0.6, 6, colOf(m), 0.14, 2);
  }

  /** Tres (o más) directos seguidos (los da update). */
  function punch(pl, m, ghost) {
    const n = Math.max(1, m.count | 0) + api().dice(pl, m);
    drop(pl, 'punch');
    add({ kind: 'punch', owner: pl, ghost, m, i: 0, n, next: 0, lk: look(m) });
  }

  function wave(pl, m, ghost) {
    const a = pl.aim, lk = look(m);
    add({ kind: 'wave', owner: pl, ghost, m, x0: pl.x, y0: pl.y, ca: Math.cos(a), sa: Math.sin(a), d: 10, max: m.radius,
          hw: (m.width || 84) / 2, sp: m.speed || 430, drag: m.knock || 1, hit: new Set(), dmg: dmgOf(pl, m), pal: lk.pal, life: 3 });
    G.FX.burst(pl.x + Math.cos(a) * 14, pl.y + Math.sin(a) * 10, '#eaf7ff', 10, 120);
    if (!ghost && seen(pl.x, pl.y)) G.Camera.kick(0.12);
  }

  function tremor(pl, m, ghost) {
    const lk = look(m), ice = m.type === 'ice';
    add({ kind: 'tremor', owner: pl, ghost, m, x: pl.x, y: pl.y, R: m.radius, dur: 0.42, life: 0.75, hit: new Set(),
          dmg: dmgOf(pl, m), pal: lk.pal, ice, seed: Math.random() * 100, spawned: 0 });
    if (seen(pl.x, pl.y)) { G.Camera.kick(ghost ? 0.1 : ice ? 0.2 : 0.4); G.Audio.sfx('break'); }
  }

  function leap(pl, m, ghost) {
    const tg = api().spotFor(pl, m);
    if (!tg) return;
    drop(pl, 'leap');
    const lk = look(m);
    add({ kind: 'leap', owner: pl, ghost, m, sx: pl.x, sy: pl.y, tx: tg.x, ty: tg.y, tg, dur: m.vanish ? 0.42 : 0.3,
          landed: false, life: 1.2, pal: lk.pal, proj: lk.proj, vanish: !!m.vanish });
    if (m.vanish) {
      for (let i = 0; i < 12; i++) G.FX.sp('shadow', 'ghost', pl.x + G.U.rand(-pl.r, pl.r), pl.y - G.U.rand(0, pl.bodyH || 20),
                                         { vx: G.U.rand(-40, 40), vy: -G.U.rand(20, 60), life: 0.5 });
    } else {
      G.FX.burst(pl.x, pl.y, '#d2e2ff', 10, 120);
    }
    if (!ghost) pl.invuln = Math.max(pl.invuln || 0, 0.45);
  }

  function scissor(pl, m, ghost) {
    const tg = api().spotFor(pl, m);
    const a = tg ? Math.atan2(tg.y - pl.y, tg.x - pl.x) : pl.aim;
    const d = Math.min(m.radius * 0.55, tg ? Math.max(24, G.U.dist(pl.x, pl.y, tg.x, tg.y)) : m.radius * 0.55);
    const lk = look(m);
    add({ kind: 'scissor', owner: pl, ghost, m, x: pl.x + Math.cos(a) * d, y: pl.y + Math.sin(a) * d, a,
          L: m.radius * 0.6, w: m.width || 20, life: 0.36, blades: 0, hits: [new Set(), new Set()], dmg: dmgOf(pl, m),
          pal: lk.pal, stone: m.type === 'rock' });
  }

  // ---------------- cada fotograma ----------------

  function update(dt) {
    clock += dt;
    for (let i = fields.length - 1; i >= 0; i--) {
      const f = fields[i];
      f.t += dt;
      if (f.gone || !f.owner || f.t >= (f.life || 9)) { fields.splice(i, 1); continue; }
      if (STEP[f.kind] && STEP[f.kind](f, dt)) fields.splice(i, 1);
    }
  }

  const STEP = {
    decoy(f) {
      if (f.anim) f.anim.update(1 / 60);
      if (Math.random() < 0.15 && seen(f.x, f.y)) G.FX.px(f.x + G.U.rand(-f.r, f.r), f.y - G.U.rand(0, 30), '#ffffff', { vy: -30, life: 0.4 });
      return false;
    },
    shield(f) { return f.owner.dead; },
    screen(f) { return f.owner.dead; },
    zzz(f, dt) {
      const pl = f.owner;
      if (pl.dead) return true;
      f.next -= dt;
      if (f.next <= 0) {
        f.next = 0.45;
        G.FX.sp('zee', 'psychic', pl.x + pl.r * 0.6, pl.y - (pl.bodyH || 24) - 4, { vx: 18, vy: -32, life: 1.1, scale: 1.2 });
      }
      return false;
    },
    rush(f, dt) {
      const pl = f.owner, m = f.m;
      if (pl.dead) return true;
      f.next -= dt;
      if (f.next > 0) return false;
      f.next = 0.075;
      let e = f.cur;
      if (!e || e.dead) e = nearestFrom(f.x, f.y, m.radius, f.done);
      if (!e || f.left <= 0) return true;
      f.done.add(e.id);
      f.left--;
      const dx = e.x - f.x, dy = e.y - f.y, dd = Math.hypot(dx, dy) || 1;
      // Sale por el otro lado del enemigo.
      const nx = e.x + dx / dd * (e.r * 0.7 + 6), ny = e.y + dy / dd * (e.r * 0.7 + 6);
      add({ kind: 'zip', owner: pl, x0: f.x, y0: f.y - G.LIFT * 0.6, x1: nx, y1: ny - G.LIFT * 0.6, life: 0.22, pal: 'normal' });
      after(pl, f.x, f.y, 0, 0.22, 0.5);
      G.FX.sp('impact', 'normal', e.x, e.y - (e.bodyH || 20) * 0.5, { life: 0.16, scale: 1.4, frameRate: 14, fade: false });
      if (!f.ghost) {
        if (!grounded() && G.World.isFree(nx, ny, pl.r * 0.8, true)) { pl.x = nx; pl.y = ny; G.World.collide(pl); }
        pl.invuln = Math.max(pl.invuln || 0, 0.25);
        api().hit(pl, e, f.dmg, colOf(m), dx, dy, 60, m);
        G.Camera.kick(0.06);
      }
      f.x = f.ghost || grounded() ? nx : pl.x; f.y = f.ghost || grounded() ? ny : pl.y;
      f.cur = nearestFrom(f.x, f.y, m.radius, f.done);
      return !f.cur || f.left <= 0;
    },
    bolt(f) {
      if (f.t < 0) return false;
      if (!f.struck && f.tg && !f.tg.dead) { f.x = f.tg.x; f.y = f.tg.y; }
      if (!f.struck && f.t >= f.warn) {
        f.struck = f.t;
        const P = PALC(f.pal);
        G.FX.ring(f.x, f.y, 4, f.r * 1.2, P[3], 0.3, 4);
        G.FX.burst(f.x, f.y - 8, P[4], 12, 180);
        if (f.holy) for (let k = 0; k < 4; k++) G.FX.sp('star', 'gold', f.x + G.U.rand(-f.r, f.r) * 0.6, f.y - 6, { vy: -G.U.rand(60, 120), life: 0.5, spin: 6 });
        else G.FX.sp('bolt', 'electric', f.x, f.y - 14, { life: 0.2, scale: 2, angle: -Math.PI / 2 });
        if (seen(f.x, f.y, 20)) { G.Audio.sfx('break'); if (!f.ghost) G.Camera.kick(0.07); }
        if (!f.ghost) circle(f.owner, f.m, f.x, f.y, f.r, f.dmg, 0);
      }
      return false;
    },
    cross(f) {
      if (f.done || f.t < f.at) return false;
      f.done = true;
      const P = PALC(f.pal);
      G.FX.burst(f.x, f.y - 10, P[4], 16, 220);
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2;
        for (let j = 0; j < 3; j++) {
          G.FX.sp(f.proj, f.pal, f.x + Math.cos(a) * f.L * (0.2 + j * 0.3), f.y + Math.sin(a) * f.L * (0.2 + j * 0.3) - 8,
                  { vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, life: 0.32, angle: a, spin: G.VFX.spins(f.proj) ? 8 : 0, scale: 1.3 });
        }
      }
      if (seen(f.x, f.y)) { G.Audio.sfx('break'); if (!f.ghost) G.Camera.kick(0.14); }
      if (f.ghost) return false;
      const pl = f.owner, m = f.m, col = colOf(m), hw = f.w / 2;
      const inArm = (x, y, r) => {
        const dx = Math.abs(x - f.x), dy = Math.abs(y - f.y);
        return (dx <= f.L + r && dy <= hw + r) || (dy <= f.L + r && dx <= hw + r);
      };
      for (const e of G.EnemyMgr.queryCircle(f.x, f.y, f.L + 10)) if (inArm(e.x, e.y, e.r)) api().hit(pl, e, f.dmg, col, e.x - f.x, e.y - f.y, 40, m);
      for (const p of G.World.propsInCircle(f.x, f.y, f.L + 10)) if (inArm(p.x, p.y, p.r)) G.World.damageProp(p, f.dmg, col);
      return false;
    },
    punch(f) {
      const pl = f.owner, m = f.m;
      if (pl.dead) return true;
      if (f.t < f.i * 0.11) return false;                 // un directo cada 0,11 s
      const last = f.i === f.n - 1;
      const t = pl.target && !pl.target.dead && pl.target.hurt && G.U.dist(pl.x, pl.y, pl.target.x, pl.target.y) < reach(m) + 30 ? pl.target : null;
      const a = t ? Math.atan2(t.y - pl.y, t.x - pl.x) : pl.aim;
      const side = (f.i % 2 ? 1 : -1) * 7;
      const ca = Math.cos(a), sa = Math.sin(a);
      const hx = pl.x + ca * m.radius * 0.72 - sa * side * 0.5, hy = pl.y + sa * m.radius * 0.72 + ca * side * 0.5;
      const hr = m.radius * (last ? 0.62 : 0.52);
      // El puño sale disparado y el golpe se ve donde da.
      G.FX.sp('fist', f.lk.pal, pl.x + ca * 10 - sa * side, pl.y + sa * 10 + ca * side - G.LIFT * 0.6,
              { vx: ca * 520, vy: sa * 520, life: 0.09, angle: a, scale: last ? 1.8 : 1.4, fade: false });
      G.FX.sp('impact', f.lk.pal, hx, hy - G.LIFT * 0.6, { life: 0.14, scale: last ? 2 : 1.4, frameRate: 14, fade: false, angle: a });
      G.FX.spark(hx, hy - G.LIFT * 0.6, PALC(f.lk.pal)[3], ca, sa, last ? 7 : 4);
      if (last) {
        G.FX.ring(hx, hy, 4, hr * 1.3, PALC(f.lk.pal)[3], 0.25, 3);
        if (m.id === 'fire-punch') G.FX.burst(hx, hy - 10, '#ffb22e', 14, 160);
        if (m.id === 'ice-punch') for (let k = 0; k < 6; k++) G.FX.sp('shard', 'ice', hx, hy - 10, { vx: G.U.rand(-120, 120), vy: G.U.rand(-140, -40), life: 0.4, angle: -Math.PI / 2 });
      }
      if (!f.ghost) {
        const hits = circle(pl, m, hx, hy, hr, dmgOf(pl, m) * (last ? 1.25 : 1), last ? 110 : 45);
        if (m.drain && hits.length) pl.heal(Math.min(6, m.drain * hits.length) * (1 + (pl.level || 1) * 0.02));
        if (last && m.freeze) for (const e of hits) if (!e.dead) e.applyStun(m.freeze * (e.boss || e.judge ? 0.35 : 1));
        if (last && m.chain) chainFrom(pl, m, hx, hy, hits, m.chain | 0);
        if (last && m.zap) zap(pl, m, hx, hy, m.zap, new Set(hits.map(e => e.id)));
      } else if (last && (m.chain || m.zap)) {
        // El fantasma sólo enseña los chispazos.
        G.FX.ring(hx, hy, 6, m.zap || 90, '#fff36a', 0.25, 2);
      }
      if (!f.ghost && seen(hx, hy)) G.Camera.kick(last ? 0.1 : 0.04);
      if (last && seen(hx, hy)) G.Audio.sfx('hit');
      f.i++;
      return f.i >= f.n;
    },
    wave(f, dt) {
      const m = f.m, pl = f.owner;
      const adv = f.sp * dt;
      f.d += adv;
      const fx = f.x0 + f.ca * f.d, fy = f.y0 + f.sa * f.d;
      if (G.World.isWall(fx, fy) || f.d >= f.max) {
        G.FX.burst(fx, fy - 10, '#eaf7ff', 12, 150);
        return true;
      }
      const near = G.EnemyMgr.queryCircle(fx, fy, f.hw + 30);
      for (const e of near) {
        const px = e.x - f.x0, py = e.y - f.y0;
        const along = px * f.ca + py * f.sa, lat = -px * f.sa + py * f.ca;
        if (Math.abs(lat) > f.hw + e.r || along < f.d - 34 - e.r || along > f.d + 12 + e.r) continue;
        if (!f.ghost && !f.hit.has(e.id)) { f.hit.add(e.id); api().hit(pl, e, f.dmg, colOf(m), f.ca, f.sa, 0, m); }
        // Arrastra quien tiene los enemigos de verdad (el anfitrión, también con la ola de un invitado).
        if (!e.remote && !e.dead && !e.arceus && !e.eternatus && !e.etCore) {
          const k = Math.min(1, 0.85 * f.drag) * (e.boss || e.judge ? 0.2 : 1);
          e.x += f.ca * adv * k; e.y += f.sa * adv * k;
          if (!e.flying) G.World.collide(e);
        }
      }
      if (!f.ghost) for (const p of G.World.propsInCircle(fx, fy, f.hw)) {
        if (f.hit.has('p' + p.id)) continue;
        f.hit.add('p' + p.id); G.World.damageProp(p, f.dmg, colOf(m));
      }
      if (Math.random() < dt * 40 && seen(fx, fy)) {
        const u = G.U.rand(-f.hw, f.hw);
        G.FX.px(fx - f.sa * u, fy + f.ca * u - 18, Math.random() < 0.5 ? '#ffffff' : '#8ccaff', { vx: f.ca * 120 + G.U.rand(-30, 30), vy: -G.U.rand(40, 120), grav: 300, life: 0.4, size: 2 });
      }
      return false;
    },
    tremor(f) {
      const k = Math.min(1, f.t / f.dur), r = f.R * (1 - Math.pow(1 - k, 2));
      f.r = r;
      // Lo que salta del suelo en el borde del anillo.
      const want = Math.floor(k * 18);
      while (f.spawned < want && k < 1) {
        f.spawned++;
        const a = (f.spawned / 18) * 6.2832 + f.seed, x = f.x + Math.cos(a) * r, y = f.y + Math.sin(a) * r * 0.85;
        if (!seen(x, y, 20)) continue;
        if (f.ice) G.FX.sp('shard', 'ice', x, y - 8, { vy: -40, life: 0.5, angle: -Math.PI / 2, scale: 1.4 });
        else { G.FX.sp('rock', 'ground', x, y - 6, { vx: Math.cos(a) * 40, vy: -G.U.rand(120, 200), grav: 520, life: 0.5, spin: 7 }); G.FX.px(x, y, '#aa7c3c', { vy: -60, grav: 300, life: 0.3, size: 2 }); }
      }
      if (!f.ghost && k <= 1 && !f.doneHit) {
        const pl = f.owner, m = f.m;
        for (const e of G.EnemyMgr.queryCircle(f.x, f.y, r)) {
          if (f.hit.has(e.id)) continue;
          f.hit.add(e.id);
          api().hit(pl, e, f.dmg, colOf(m), e.x - f.x, e.y - f.y, f.ice ? 0 : 70, m);
        }
        for (const p of G.World.propsInCircle(f.x, f.y, r)) {
          if (f.hit.has('p' + p.id)) continue;
          f.hit.add('p' + p.id); G.World.damageProp(p, f.dmg, colOf(m));
        }
        if (k >= 1) f.doneHit = true;
      }
      return false;
    },
    leap(f) {
      const pl = f.owner, m = f.m;
      if (pl.dead) return true;
      if (!f.landed && f.tg && !f.tg.dead) { f.tx = f.tg.x; f.ty = f.tg.y; }
      const u = Math.min(1, f.t / f.dur);
      if (!f.landed) {
        const x = G.U.lerp(f.sx, f.tx, u), y = G.U.lerp(f.sy, f.ty, u), h = Math.sin(Math.PI * u) * (f.vanish ? 20 : 70);
        if (!f.ghost) {
          if (!grounded() && G.World.isFree(x, y, pl.r * 0.8, true)) { pl.x = x; pl.y = y; }
          pl.invuln = Math.max(pl.invuln || 0, 0.2);
        }
        f.air = { lift: f.vanish ? 0 : h, alpha: f.vanish ? Math.max(0, 1 - Math.sin(Math.PI * u) * 3) : 1 };
        if (!f.vanish && (f.nextAfter = (f.nextAfter || 0) - 1) <= 0) { f.nextAfter = 3; after(pl, pl.x, pl.y, h * 0.7, 0.16, 0.3); }
        if (f.vanish && Math.random() < 0.6) G.FX.sp('shadow', 'ghost', x + G.U.rand(-8, 8), y - 10, { vy: -30, life: 0.35 });
        if (u < 1) return false;
        f.landed = true; f.air = null;
        f.lx = f.ghost || grounded() ? f.tx : pl.x; f.ly = f.ghost || grounded() ? f.ty : pl.y;
        if (!f.ghost) G.World.collide(pl);
        const R = m.radius, P = PALC(f.pal);
        G.FX.ring(f.lx, f.ly, 6, R, P[3], 0.35, 4);
        G.FX.ring(f.lx, f.ly, 4, R * 0.6, P[4], 0.25, 3);
        G.FX.burst(f.lx, f.ly - 6, P[3], 14, 200);
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * 6.2832;
          G.FX.sp(f.proj, f.pal, f.lx + Math.cos(a) * 10, f.ly + Math.sin(a) * 8 - 6, { vx: Math.cos(a) * R * 2.4, vy: Math.sin(a) * R * 1.8, life: 0.32, angle: a, spin: G.VFX.spins(f.proj) ? 8 : 0 });
        }
        if (seen(f.lx, f.ly)) { G.Audio.sfx('break'); if (!f.ghost) G.Camera.kick(0.2); }
        if (!f.ghost) {
          // Acróbata: sin objetos equipados, ×1,5.
          const bare = m.bare && pl.items && !pl.items.length ? m.bare : 1;
          circle(pl, m, f.lx, f.ly, R, dmgOf(pl, m) * bare, 90);
          pl.invuln = Math.max(pl.invuln || 0, 0.25);
        }
        f.life = f.t + 0.35;
      }
      return false;
    },
    scissor(f) {
      // El segundo tajo sale un poco después del primero.
      const want = f.t >= 0.08 ? 2 : 1;
      while (f.blades < want) {
        const b = f.blades++, a = f.a + (b ? -1 : 1) * Math.PI / 4;
        const ca = Math.cos(a), sa = Math.sin(a);
        const ax = f.x - ca * f.L, ay = f.y - sa * f.L, bx = f.x + ca * f.L, by = f.y + sa * f.L;
        if (seen(f.x, f.y)) G.Audio.sfx('shot', { kind: 'melee', type: f.m.type });
        if (f.stone) for (let k = 0; k < 4; k++) G.FX.sp('rock', 'rock', G.U.lerp(ax, bx, Math.random()), G.U.lerp(ay, by, Math.random()) - 10, { vx: G.U.rand(-90, 90), vy: -G.U.rand(80, 160), grav: 500, life: 0.45, spin: 8, scale: 0.8 });
        else G.FX.spark(bx, by - 10, PALC(f.pal)[4], ca, sa, 4);
        if (f.ghost) continue;
        const pl = f.owner, m = f.m, col = colOf(m), hw = f.w / 2, set = f.hits[b];
        const midx = (ax + bx) / 2, midy = (ay + by) / 2;
        for (const e of G.EnemyMgr.queryCircle(midx, midy, f.L + hw)) {
          if (set.has(e.id)) continue;
          if (api().segDist2(ax, ay, bx, by, e.x, e.y) > (hw + e.r) ** 2) continue;
          set.add(e.id);
          api().hit(pl, e, f.dmg, col, -sa, ca, 50, m);
        }
        for (const p of G.World.propsInCircle(midx, midy, f.L + hw)) {
          if (api().segDist2(ax, ay, bx, by, p.x, p.y) <= (hw + p.r) ** 2) G.World.damageProp(p, f.dmg, col);
        }
        if (!f.ghost) G.Camera.kick(0.05);
      }
      return false;
    }
  };

  /** Puño Trueno: del último directo, la descarga salta a los `n` más cercanos. */
  function chainFrom(pl, m, x, y, hits, n) {
    const done = new Set(hits.map(e => e.id));
    let fx = x, fy = y - G.LIFT * 0.6;
    for (let i = 0; i < n; i++) {
      const e = nearestFrom(x, y, 150, done);
      if (!e) break;
      done.add(e.id);
      const tx = e.x, ty = e.y - (e.bodyH || 20) * 0.5;
      G.FX.beam(fx, fy, Math.atan2(ty - fy, tx - fx), Math.hypot(tx - fx, ty - fy), 8, colOf(m), { pal: 'electric', beam: 'lightning' });
      api().hit(pl, e, dmgOf(pl, m) * 0.7, colOf(m), tx - fx, ty - fy, 0, m);
      fx = tx; fy = ty;
    }
  }

  /** Puños Plasma: el último puñetazo electrocuta a todos los de alrededor. */
  function zap(pl, m, x, y, r, skip) {
    G.FX.ring(x, y, 6, r, '#bfe9ff', 0.3, 3);
    for (const e of G.EnemyMgr.queryCircle(x, y, r)) {
      if (skip.has(e.id)) continue;
      const ty = e.y - (e.bodyH || 20) * 0.5;
      G.FX.beam(x, y - G.LIFT * 0.6, Math.atan2(ty - (y - G.LIFT * 0.6), e.x - x), Math.hypot(e.x - x, ty - (y - G.LIFT * 0.6)), 7, '#56b4ff', { pal: 'plasma', beam: 'lightning' });
      api().hit(pl, e, dmgOf(pl, m) * 0.8, colOf(m), e.x - x, e.y - y, 60, m);
    }
  }

  // ---------------- lo que preguntan los demás ----------------

  /** player.hurt: Protección (nada) y las paredes de luz (−35 % de su clase). Lo de Arceus (pure) pasa. */
  function incoming(pl, amount, cat, pure) {
    if (pure) return amount;
    if (pl.m2prot > clock) {
      if (!(pl.m2protT > clock)) { pl.m2protT = clock + 0.4; G.FX.dmgText(pl.x, pl.y - pl.bodyH - 6, '¡Protegido!', '#7dffa8'); }
      const s = fields.find(f => f.kind === 'shield' && f.owner === pl);
      if (s) s.flash = 0.15;
      return 0;
    }
    const s = cat && pl.m2scr && pl.m2scr[cat];
    if (s && s.until > clock) {
      const f = fields.find(o => o.kind === 'screen' && o.owner === pl && o.guard === cat);
      if (f) f.flash = 0.15;
      return amount * (1 - s.k);
    }
    return amount;
  }

  /** player.draw: { lift, alpha } mientras salta (Acróbata) o desaparece (Golpe Umbrío); si no, null. */
  function airOf(pl) {
    for (const f of fields) if (f.kind === 'leap' && f.owner === pl && f.air && !f.gone) return f.air;
    return null;
  }

  /** ¿Duerme (Descanso)? */
  const asleep = pl => !!pl && pl.m2sleep > clock && !pl.dead;

  /** enemy.js: la copia de Doble Equipo más cercana que le atrae (ni jefes ni Arceus ni Eternatus). */
  function lure(e) {
    if (e.boss || e.judge || e.arceus || e.eternatus || e.etCore || e.legend || e.behavior === 'thief') return null;
    let best = null, bd = Infinity;
    for (const f of fields) {
      if (f.kind !== 'decoy' || f.gone) continue;
      const d = G.U.dist2(e.x, e.y, f.x, f.y);
      if (d < f.rr * f.rr && d < bd) { bd = d; best = f; }
    }
    return best;
  }

  function clear(owner) {
    fields = owner ? fields.filter(f => f.owner !== owner) : [];
    if (owner) { owner.m2prot = 0; owner.m2sleep = 0; owner.m2scr = null; }
  }

  // ---------------- dibujo ----------------

  /** En el suelo (debajo de los Pokémon): avisos, anillos, la copia de Doble Equipo. */
  function drawGround(ctx) {
    const now = performance.now() / 1000;
    for (const f of fields) {
      const x = f.x != null ? f.x : f.owner.x, y = f.y != null ? f.y : f.owner.y;
      if (!G.Camera.sees(x, y, 400)) continue;
      ctx.save();
      if (f.kind === 'bolt' && f.t >= 0) {
        const P = PALC(f.pal);
        const k = f.struck ? 1 : G.U.clamp(f.t / f.warn, 0, 1);
        ctx.globalAlpha = f.struck ? Math.max(0, 0.5 - (f.t - f.struck) * 1.5) : 0.18 + 0.22 * k;
        ctx.fillStyle = P[2];
        ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r * k, f.r * k * 0.55, 0, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = f.struck ? 0.4 : 0.85;
        ctx.strokeStyle = P[3]; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r, f.r * 0.55, 0, 0, 6.2832); ctx.stroke();
        if (f.holy && !f.struck) {           // la Sentencia avisa con un sello: cruz dorada que gira
          ctx.globalAlpha = 0.7;
          ctx.strokeStyle = P[4]; ctx.lineWidth = 2;
          const a = now * 2;
          for (let i = 0; i < 4; i++) {
            const b = a + i * Math.PI / 2;
            ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(b) * f.r * k, f.y + Math.sin(b) * f.r * k * 0.55); ctx.stroke();
          }
        }
      } else if (f.kind === 'tremor') {
        const P = PALC(f.pal), r = f.r || 0, fade = Math.max(0, 1 - Math.max(0, f.t - f.dur) / (f.life - f.dur));
        // Suelo removido / escarcha dentro del anillo.
        ctx.globalAlpha = 0.16 * fade;
        ctx.fillStyle = f.ice ? '#dff6ff' : P[1];
        ctx.beginPath(); ctx.ellipse(f.x, f.y, r, r * 0.85, 0, 0, 6.2832); ctx.fill();
        // Grietas que salen del centro.
        ctx.globalAlpha = 0.75 * fade;
        ctx.fillStyle = f.ice ? P[3] : P[0];
        for (let i = 0; i < 9; i++) {
          const a = i / 9 * 6.2832 + f.seed;
          let cx = f.x, cy = f.y;
          for (let s = 0; s < r; s += PX * 3) {
            const w = Math.sin(s * 0.08 + i * 3 + f.seed) * 0.35;
            cx = f.x + Math.cos(a + w) * s; cy = f.y + Math.sin(a + w) * s * 0.85;
            ctx.fillRect(snap(cx), snap(cy), PX, PX);
          }
        }
        // El anillo, grueso y a bloques.
        if (f.t < f.dur + 0.08) {
          const n = Math.max(16, Math.ceil(r * 6.2832 / (PX * 2)));
          for (let i = 0; i < n; i++) {
            const a = i / n * 6.2832, px = f.x + Math.cos(a) * r, py = f.y + Math.sin(a) * r * 0.85;
            ctx.globalAlpha = 0.9 * fade;
            ctx.fillStyle = P[2]; ctx.fillRect(snap(px) - PX, snap(py) - PX * 2, PX * 3, PX * 3);
            ctx.fillStyle = P[4]; ctx.fillRect(snap(px), snap(py) - PX * 2, PX, PX);
          }
        }
      } else if (f.kind === 'cross') {
        const P = PALC(f.pal);
        ctx.globalAlpha = f.done ? Math.max(0, 0.35 - (f.t - f.at) * 0.7) : 0.25;
        ctx.fillStyle = P[1];
        const L = f.L * (f.done ? 1 : 0.4), hw = f.w / 2;
        ctx.fillRect(f.x - L, f.y - hw * 0.6, L * 2, hw * 1.2);
        ctx.fillRect(f.x - hw, f.y - L * 0.7, hw * 2, L * 1.4);
      } else if (f.kind === 'blast') {
        const k = f.t / f.life;
        ctx.globalAlpha = 0.45 * (1 - k);
        ctx.fillStyle = '#2a1a10';
        ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r * 0.8, f.r * 0.5, 0, 0, 6.2832); ctx.fill();
      } else if (f.kind === 'decoy') {
        const fade = Math.min(1, (f.life - f.t) * 3, f.t * 6);
        ctx.globalAlpha = 0.35 * fade;
        ctx.strokeStyle = '#e6e0ff'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r * 2, f.r * 0.8, 0, 0, 6.2832); ctx.stroke();
        ctx.setLineDash([]);
        G.Sprites.drawShadow(ctx, f.dex, f.x, f.y, f.scale || 1);
      } else if (f.kind === 'wave') {
        // El agua que va dejando la ola.
        const P = PALC(f.pal), hw = f.hw, back = Math.max(0, f.d - 90);
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = P[2];
        ctx.beginPath();
        const ax = f.x0 + f.ca * back, ay = f.y0 + f.sa * back, bx = f.x0 + f.ca * f.d, by = f.y0 + f.sa * f.d;
        ctx.moveTo(ax - f.sa * hw * 0.7, ay + f.ca * hw * 0.7);
        ctx.lineTo(bx - f.sa * hw, by + f.ca * hw);
        ctx.lineTo(bx + f.sa * hw, by - f.ca * hw);
        ctx.lineTo(ax + f.sa * hw * 0.7, ay - f.ca * hw * 0.7);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
  }

  /** Por encima: rayos, la ola, cruces, puños, escudos, zetas, estelas. */
  function drawAir(ctx) {
    const now = performance.now() / 1000;
    for (const f of fields) {
      const x = f.x != null ? f.x : f.owner.x, y = f.y != null ? f.y : f.owner.y;
      if (!G.Camera.sees(x, y, 500)) continue;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      switch (f.kind) {
        case 'bolt': if (f.struck) drawBolt(ctx, f, now); break;
        case 'cross': if (f.done) drawCross(ctx, f, now); break;
        case 'wave': drawWave(ctx, f, now); break;
        case 'scissor': drawScissor(ctx, f); break;
        case 'shield': drawShield(ctx, f, now); break;
        case 'screen': drawScreen(ctx, f, now); break;
        case 'zip': drawZip(ctx, f); break;
        case 'blast': drawBlast(ctx, f); break;
        case 'decoy':
          // La copia: tu Pokémon, algo transparente y temblando (por encima: que no la tape la hierba).
          if (f.anim) {
            const fade = Math.min(1, (f.life - f.t) * 3, f.t * 6), j = Math.sin(now * 40) > 0.6 ? PX : 0;
            f.anim.draw(ctx, f.x + j, f.y, { alpha: (0.68 + Math.sin(now * 9) * 0.12) * fade });
          }
          break;
        case 'after':
          if (f.owner.anim) {
            const dir = f.owner.anim.dir; f.owner.anim.dir = f.dir;
            f.owner.anim.draw(ctx, f.x, f.y - f.lift, { alpha: f.alpha * (1 - f.t / f.life) });
            f.owner.anim.dir = dir;
          }
          break;
      }
      ctx.restore();
    }
  }

  /** Rayo del cielo: zigzag (Trueno) o columna de luz dorada (Sentencia). */
  function drawBolt(ctx, f, now) {
    const P = PALC(f.pal), k = 1 - (f.t - f.struck) / Math.max(0.05, f.life - f.struck);
    if (k <= 0) return;
    const top = f.y - 420, step = k > 0.66 ? 1 : k > 0.33 ? 0.66 : 0.33;
    ctx.globalAlpha = step;
    if (f.holy) {
      const w = snap(f.r * 0.42 * (0.6 + 0.4 * k));
      ctx.fillStyle = P[2]; ctx.fillRect(snap(f.x - w), top, w * 2, f.y - top);
      ctx.fillStyle = P[3]; ctx.fillRect(snap(f.x - w * 0.6), top, snap(w * 1.2), f.y - top);
      ctx.fillStyle = P[4]; ctx.fillRect(snap(f.x - PX * 2), top, PX * 4, f.y - top);
      // Tablas: rombos que suben por la columna.
      for (let i = 0; i < 4; i++) {
        const yy = f.y - ((now * 260 + i * 100 + f.seed * 10) % 400);
        G.VFX.draw(ctx, 'star', 'gold', f.x + Math.sin(i * 2 + f.seed) * w * 0.5, yy, { scale: 1.2, frame: i });
      }
      ctx.globalAlpha *= 0.55; ctx.fillStyle = P[3];
      ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r * 0.8 * k, f.r * 0.38 * k, 0, 0, 6.2832); ctx.fill();
    } else {
      let px = f.x, py = top;
      const seg = PX * 6, n = Math.ceil((f.y - top) / seg);
      for (let i = 1; i <= n; i++) {
        const ny = Math.min(f.y, top + i * seg);
        const nx = i === n ? f.x : f.x + (G.U.hash(i, (now * 24) | 0, f.seed | 0) - 0.5) * 34;
        const lo = Math.min(px, nx), hi = Math.max(px, nx);
        ctx.fillStyle = P[2]; ctx.fillRect(snap(lo) - PX * 2, snap(py), snap(hi - lo) + PX * 5, snap(ny - py) + PX);
        ctx.fillStyle = P[4]; ctx.fillRect(snap(lo) - PX, snap(py), snap(hi - lo) + PX * 3, snap(ny - py) + PX);
        px = nx; py = ny;
      }
      ctx.globalAlpha *= 0.55; ctx.fillStyle = P[3];
      ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r * 0.7 * k, f.r * 0.34 * k, 0, 0, 6.2832); ctx.fill();
    }
  }

  /** Cruz de Llamarada / Fulgor Semilla: cuatro brazos que crecen desde el centro. */
  function drawCross(ctx, f, now) {
    const P = PALC(f.pal), age = f.t - f.at, life = f.life - f.at;
    const grow = Math.min(1, age / 0.12), k = 1 - age / life;
    if (k <= 0) return;
    ctx.globalAlpha = k > 0.66 ? 1 : k > 0.33 ? 0.66 : 0.33;
    const L = f.L * grow, cy = f.y - 8;
    const hw = f.w / 2 * (0.7 + 0.3 * k);
    for (let a = 0; a < 4; a++) {
      const dx = [1, -1, 0, 0][a], dy = [0, 0, 1, -1][a], len = dy ? L * 0.8 : L;
      for (let s = 0; s < len; s += PX * 2) {
        const taper = 1 - s / len * 0.55, w = Math.max(PX, snap(hw * taper * (0.85 + 0.15 * Math.sin(s * 0.2 + now * 30))));
        const x = f.x + dx * s, y = cy + dy * s;
        if (dy) {
          ctx.fillStyle = P[1]; ctx.fillRect(snap(x - w - PX), snap(y), w * 2 + PX * 2, PX * 2);
          ctx.fillStyle = P[2]; ctx.fillRect(snap(x - w), snap(y), w * 2, PX * 2);
          ctx.fillStyle = P[3]; ctx.fillRect(snap(x - w * 0.5), snap(y), snap(w), PX * 2);
        } else {
          ctx.fillStyle = P[1]; ctx.fillRect(snap(x), snap(y - w - PX), PX * 2, w * 2 + PX * 2);
          ctx.fillStyle = P[2]; ctx.fillRect(snap(x), snap(y - w), PX * 2, w * 2);
          ctx.fillStyle = P[3]; ctx.fillRect(snap(x), snap(y - w * 0.5), PX * 2, snap(w));
        }
      }
      // La punta: una llama (o semilla) que mira hacia fuera.
      G.VFX.draw(ctx, f.proj, f.pal, f.x + dx * (len + 4), cy + dy * (len + 4), { angle: Math.atan2(dy, dx) || 0.0001, scale: 1.6, frame: (now * 12) | 0 });
    }
    ctx.fillStyle = P[4];
    const c = snap(hw * 1.1);
    ctx.fillRect(snap(f.x) - c, snap(cy) - c, c * 2, c * 2);
  }

  /** La ola de Surf: cresta curvada con espuma, perpendicular a donde va. */
  function drawWave(ctx, f, now) {
    const P = PALC(f.pal), hw = f.hw;
    const fx = f.x0 + f.ca * f.d, fy = f.y0 + f.sa * f.d;
    const fade = Math.min(1, (f.max - f.d) / 60, f.d / 30);
    ctx.globalAlpha = Math.max(0.33, fade);
    const H = 38;
    for (let u = -hw; u <= hw; u += PX * 2) {
      const q = u / hw, h = Math.sqrt(Math.max(0, 1 - q * q)) * H * (0.85 + 0.15 * Math.sin(now * 12 + u * 0.15));
      // Lo de detrás de la cresta (más bajo) y la cresta.
      const bx = fx - f.sa * u, by = fy + f.ca * u;
      for (let back = 0; back < 3; back++) {
        const ox = bx - f.ca * back * 8, oy = by - f.sa * back * 8, hh = h * (1 - back * 0.3);
        ctx.fillStyle = back === 0 ? P[2] : back === 1 ? P[1] : P[0];
        ctx.fillRect(snap(ox), snap(oy - hh), PX * 2, snap(hh) + PX);
      }
      ctx.fillStyle = P[3]; ctx.fillRect(snap(bx), snap(by - h), PX * 2, snap(h * 0.45) + PX);
      // Espuma: la punta se riza hacia delante.
      ctx.fillStyle = P[4]; ctx.fillRect(snap(bx + f.ca * 4), snap(by - h - PX + f.sa * 3), PX * 2, PX * 2);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(snap(bx + f.ca * 7), snap(by - h + PX + f.sa * 5), PX, PX * 2);
      if ((Math.floor(u / (PX * 2)) + Math.floor(now * 10)) % 5 === 0) {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(snap(bx + f.ca * 4), snap(by - h - PX * 3), PX, PX);
      }
    }
  }

  /** Tijera X / Hachazo Pétreo: dos tajos rectos que se cruzan. */
  function drawScissor(ctx, f) {
    const P = PALC(f.pal);
    for (let b = 0; b < f.blades; b++) {
      const age = f.t - b * 0.08, life = f.life - b * 0.08;
      const k = 1 - age / life;
      if (k <= 0) continue;
      const a = f.a + (b ? -1 : 1) * Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
      const sweep = Math.min(1, age / 0.06);
      ctx.globalAlpha = k > 0.66 ? 1 : k > 0.33 ? 0.66 : 0.33;
      const n = Math.ceil(f.L * 2 / PX * sweep);
      for (let i = 0; i <= n; i++) {
        const s = -f.L + i * PX;
        const u = (s + f.L) / (2 * f.L), w = Math.sin(Math.PI * u) * (f.stone ? 4 : 3) * k + 1;
        const x = f.x + ca * s, y = f.y + sa * s - 10;
        for (let j = -Math.ceil(w); j <= Math.ceil(w); j++) {
          const c = Math.abs(j) >= Math.ceil(w) ? P[1] : Math.abs(j) > w * 0.5 ? P[2] : j === 0 ? P[4] : P[3];
          ctx.fillStyle = c;
          ctx.fillRect(snap(x - sa * j * PX), snap(y + ca * j * PX), PX, PX);
        }
      }
    }
  }

  /** Protección: cúpula verde que late y destella al parar un golpe. */
  function drawShield(ctx, f, now) {
    const pl = f.owner, P = PALC(f.pal);
    if (f.flash > 0) f.flash -= 1 / 60;
    const left = f.life - f.t, blink = left < 0.4 && Math.floor(now * 16) % 2;
    if (blink) return;
    const bh = pl.bodyH || 24, rx = Math.max(pl.r * 2.2, bh * 0.66) + Math.sin(now * 8) * PX, ry = rx * 0.98, cy = pl.y - bh * 0.45;
    ctx.globalAlpha = f.flash > 0 ? 0.45 : 0.2;
    ctx.fillStyle = P[3];
    ctx.beginPath(); ctx.ellipse(pl.x, cy, rx, ry, 0, 0, 6.2832); ctx.fill();
    const n = Math.max(20, Math.ceil(rx * 6.2832 / (PX * 2)));
    ctx.globalAlpha = 0.95;
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.2832, px = pl.x + Math.cos(a) * rx, py = cy + Math.sin(a) * ry;
      ctx.fillStyle = Math.sin(a * 3 + now * 6) > 0.5 ? P[4] : P[2];
      ctx.fillRect(snap(px), snap(py), PX * 2, PX * 2);
    }
    ctx.fillStyle = P[4];
    ctx.fillRect(snap(pl.x - rx * 0.45), snap(cy - ry * 0.55), PX * 2, PX * 2);
    ctx.fillRect(snap(pl.x - rx * 0.35), snap(cy - ry * 0.65), PX * 2, PX);
  }

  /** Reflejo / Pantalla Luz: paneles hexagonales que giran a tu alrededor. */
  function drawScreen(ctx, f, now) {
    const pl = f.owner, left = f.life - f.t;
    if (left < 1 && Math.floor(now * 12) % 2) return;
    if (f.flash > 0) f.flash -= 1 / 60;
    const n = 5, R = pl.r * 2.1, a0 = f.a0 + now * (f.guard === 'special' ? -1.1 : 1.1);
    const items = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + i / n * 6.2832;
      items.push({ a, x: pl.x + Math.cos(a) * R, y: pl.y + Math.sin(a) * R * 0.45 - (pl.bodyH || 24) * 0.45 });
    }
    items.sort((p, q) => p.y - q.y);
    for (const it of items) {
      ctx.globalAlpha = (Math.sin(it.a) > 0 ? 0.85 : 0.45) * (f.flash > 0 ? 1 : 0.9);
      G.VFX.draw(ctx, 'hexa', f.pal, it.x, it.y, { scale: f.flash > 0 ? 1.6 : 1.3 });
    }
  }

  function drawZip(ctx, f) {
    const P = PALC(f.pal), k = 1 - f.t / f.life;
    const len = Math.hypot(f.x1 - f.x0, f.y1 - f.y0), a = Math.atan2(f.y1 - f.y0, f.x1 - f.x0);
    const n = Math.ceil(len / PX);
    ctx.globalAlpha = k > 0.5 ? 1 : 0.55;
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = f.x0 + (f.x1 - f.x0) * u, y = f.y0 + (f.y1 - f.y0) * u;
      const w = Math.max(1, Math.round(u * 3 * k));
      for (let j = -w; j <= w; j++) {
        ctx.fillStyle = j === 0 ? '#ffffff' : Math.abs(j) === w ? P[2] : P[3];
        ctx.fillRect(snap(x - Math.sin(a) * j * PX), snap(y + Math.cos(a) * j * PX), PX, PX);
      }
    }
  }

  /** Explosión: bola de fuego que crece y se apaga. */
  function drawBlast(ctx, f) {
    const k = f.t / f.life;
    if (k > 0.6) return;
    const r = f.r * (0.35 + k * 1.1), P = PALC('fire');
    const rings = [[1, P[1], 0.5], [0.8, P[2], 0.75], [0.55, P[3], 0.9], [0.3, P[4], 1]];
    for (const [s, c, a] of rings) {
      ctx.globalAlpha = a * (1 - k / 0.6);
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(f.x, f.y - G.LIFT * 0.5, r * s, r * s * 0.75, 0, 0, 6.2832); ctx.fill();
    }
  }

  return { run, update, drawGround, drawAir, clear, incoming, asleep, lure, airOf, reach, ANIM, SND, CONTACT, KINDS,
           get fieldCount() { return fields.length; },
           /** Para pruebas: lo que hay ahora en el mapa, por clase. */
           debugFields() { const o = {}; for (const f of fields) o[f.kind] = (o[f.kind] || 0) + 1; return o; } };
})();
