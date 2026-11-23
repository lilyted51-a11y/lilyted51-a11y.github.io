/* ============ legend.js — la pelea de verdad del legendario de la grieta ============
 * (23-11-2026; como en la Gran Actualización del juego oficial y sus notas de los días siguientes,
 *  hecho aquí a partir de lo que cuentan: tres fases, ataques que se mueven por la arena, cinco
 *  por tipo, y un ataque definitivo del que te salvas escondido tras la arena, sin cristales.)
 *
 * El legendario (rift.js, spawnLegend) sigue andando y pegando de cerca como cualquier jefe
 * (enemy.js, bossMove), pero lo que lanza de lejos son los ataques de este módulo, los del tipo
 * de su arena (SETS):
 *
 *   Fase 1   100 → 66 %  los 3 primeros de su tipo
 *   Fase 2    66 → 33 %  4, más seguidos
 *   Fase 3    33 →  0 %  los 5 (a veces dos a la vez), más rápido, y su ATAQUE DEFINITIVO (ULT):
 *                        salta al centro, carga 5 s y golpea a quien vea. Detrás de una columna, un
 *                        árbol o una roca de la arena (vistos desde él) no te da. Vuelve cada 24 s.
 *                        No baja del 15 % hasta haberlo lanzado una vez.
 *
 * Formas que se mueven (cada ordenador las mueve y mira sólo SU Pokémon, como en eternatus.js):
 *   wave   frente que avanza recto (si cruza toda la arena, con un hueco por donde pasar)
 *   ring   onda que se abre desde él, con huecos
 *   orb    bolas que avanzan (unas curvan; las de Fantasma atraviesan las columnas)
 *   whirl  remolinos lentos que se desplazan y atraen un poco (el oficial los suavizó el 15-11)
 *   bar    barras que giran sobre él o que ruedan por la arena
 * Y con aviso en el suelo (G.Hazards, 'hz'): chase (caídas que te siguen), line (en fila desde él),
 * circle (un cerco a tu alrededor) y sweep (rayos que barren).
 * Todo quita un % de tu vida, nunca más del tope por golpe de la dificultad (Player.hurt). Un golpe
 * tuyo le quita como mucho el 10 % de su vida y no se salta fases (filterHit, desde Enemy.hurt).
 *
 * Cooperativo: lo lleva el anfitrión. ['lg','p',fase] · ['lg','m',[formas],i] el ataque i de su tipo
 * · ['lg','n',i] el nombre de uno de los del suelo · ['lg','u',{x,y,d}] empieza el definitivo.
 */
G.Legend = (() => {
  const HIT_CAP = 0.10;           // un golpe le quita como mucho esto
  const ULT_D = 5, ULT_EVERY = 24, ULT_PCT = 0.3, ULT_GATE = 0.15;
  const CD = { p1: 3.4, p2: 2.8, p3: 2.3 };
  const POOL = { p1: 3, p2: 4, p3: 5 };
  const TS = () => G.Tiles.T * G.Sprites.PX;
  const authority = () => !G.Coop.active || G.Coop.isHost;

  // [nombre del ataque, forma, opciones]. La fase 1 usa los 3 primeros; la 2, los 4.
  const SETS = {
    normal:   [['Vozarrón', 'ring', { n: 2, gaps: 2 }], ['Gigaimpacto', 'wave', { len: 300, v: 230 }], ['Golpe Cuerpo', 'chase', { k: 4 }],
               ['Remolino', 'whirl', { n: 2 }], ['Ataque Rápido', 'tumble', { n: 2 }]],
    fire:     [['Lanzallamas', 'wave', { len: 240, v: 220 }], ['Giro Fuego', 'whirl', { n: 2 }], ['Llamarada', 'chase', { k: 5 }],
               ['Rueda Fuego', 'bar', { n: 1 }], ['Ascuas', 'orb', { n: 9, spread: 1.3, v: 170 }]],
    water:    [['Surf', 'wave', { full: 1, v: 150 }], ['Torbellino', 'whirl', { n: 2 }], ['Hidrobomba', 'sweep', {}],
               ['Escaldar', 'chase', { k: 4 }], ['Burbuja', 'orb', { n: 14, ring: 1, v: 110, r: 12 }]],
    grass:    [['Hoja Afilada', 'orb', { n: 8, spread: 1.0, v: 190, av: 0.9 }], ['Tormenta Floral', 'ring', { n: 1, gaps: 3 }], ['Látigo Cepa', 'bar', { n: 2 }],
               ['Bomba Germen', 'chase', { k: 4 }], ['Danza Pétalo', 'tumble', { n: 3 }]],
    electric: [['Chispazo', 'ring', { n: 1, gaps: 2 }], ['Rayo', 'line', { fan: 3 }], ['Bola Voltio', 'orb', { n: 5, spread: 1.4, v: 120, r: 14 }],
               ['Voltio Cruel', 'tumble', { n: 2 }], ['Trueno', 'chase', { k: 5 }]],
    ice:      [['Viento Hielo', 'wave', { full: 1, v: 160 }], ['Carámbano', 'orb', { n: 11, spread: 1.1, v: 230, r: 8 }], ['Rayo Hielo', 'sweep', {}],
               ['Granizo', 'chase', { k: 6 }], ['Canto Helado', 'line', { fan: 1 }]],
    fighting: [['Onda Certera', 'orb', { n: 3, spread: 0.9, v: 120, r: 18 }], ['Esfera Aural', 'orb', { n: 10, ring: 1, v: 140 }], ['Megapuño', 'chase', { k: 4 }],
               ['Puño Dinámico', 'ring', { n: 2, gaps: 2 }], ['Golpe Kárate', 'wave', { len: 280, v: 240 }]],
    poison:   [['Bomba Lodo', 'chase', { k: 4 }], ['Gas Venenoso', 'ring', { n: 1, gaps: 2 }], ['Residuos', 'whirl', { n: 3, pull: 0 }],
               ['Puya Nociva', 'tumble', { n: 2 }], ['Picotazo Veneno', 'orb', { n: 9, spread: 1.2, v: 200, r: 8 }]],
    ground:   [['Terremoto', 'ring', { n: 2, gaps: 2 }], ['Tierra Viva', 'line', { fan: 3 }], ['Bucle Arena', 'whirl', { n: 2 }],
               ['Disparo Lodo', 'orb', { n: 7, spread: 1.2, v: 170 }], ['Terratemblor', 'wave', { full: 1, v: 170 }]],
    flying:   [['Vendaval', 'whirl', { n: 2 }], ['Tajo Aéreo', 'orb', { n: 7, spread: 1.1, v: 210, av: 0.7 }], ['Ataque Ala', 'wave', { len: 260, v: 250 }],
               ['Tornado', 'tumble', { n: 2 }], ['Golpe Aéreo', 'chase', { k: 4 }]],
    psychic:  [['Psíquico', 'ring', { n: 1, gaps: 2 }], ['Psicorrayo', 'bar', { n: 1 }], ['Premonición', 'chase', { k: 4, delay: 1.6 }],
               ['Psicoonda', 'wave', { full: 1, v: 160 }], ['Confusión', 'orb', { n: 8, spread: 1.6, v: 150, av: 1.1 }]],
    bug:      [['Zumbido', 'ring', { n: 2, gaps: 2 }], ['Tijera X', 'bar', { n: 2 }], ['Picadura', 'chase', { k: 4 }],
               ['Enjambre', 'orb', { n: 12, spread: 2.2, v: 120, av: 1.2 }], ['Ida y Vuelta', 'wave', { len: 260, v: 260 }]],
    rock:     [['Avalancha', 'wave', { full: 1, v: 150 }], ['Lanzarrocas', 'chase', { k: 4 }], ['Roca Afilada', 'line', { fan: 3 }],
               ['Joya de Luz', 'orb', { n: 12, ring: 1, v: 140 }], ['Trampa Rocas', 'circle', {}]],
    ghost:    [['Bola Sombra', 'orb', { n: 5, spread: 1.5, v: 110, r: 14, av: 0.8, ghost: 1 }], ['Infortunio', 'chase', { k: 4 }], ['Viento Aciago', 'wave', { full: 1, v: 150 }],
               ['Sombra Vil', 'line', { fan: 1 }], ['Garra Umbría', 'bar', { n: 2 }]],
    dragon:   [['Pulso Dragón', 'ring', { n: 2, gaps: 2 }], ['Garra Dragón', 'bar', { n: 1 }], ['Enfado', 'tumble', { n: 2 }],
               ['Dragoaliento', 'orb', { n: 9, spread: 1.2, v: 180 }], ['Carga Dragón', 'line', { fan: 3 }]],
    dark:     [['Pulso Umbrío', 'ring', { n: 2, gaps: 2 }], ['Tajo Umbrío', 'wave', { len: 280, v: 250 }], ['Golpe Bajo', 'chase', { k: 4 }],
               ['Triturar', 'circle', {}], ['Mordisco', 'tumble', { n: 3 }]],
    steel:    [['Foco Resplandor', 'line', { fan: 3 }], ['Disparo Espejo', 'orb', { n: 9, spread: 1.2, v: 190 }], ['Cabeza de Hierro', 'wave', { len: 300, v: 240 }],
               ['Puño Meteoro', 'chase', { k: 4 }], ['Giro Bola', 'tumble', { n: 2 }]],
    fairy:    [['Voz Cautivadora', 'ring', { n: 2, gaps: 2 }], ['Carantoña', 'chase', { k: 4 }], ['Viento Feérico', 'wave', { full: 1, v: 150 }],
               ['Beso Drenaje', 'orb', { n: 8, spread: 1.4, v: 150, av: 0.9 }], ['Brillo Mágico', 'bar', { n: 2 }]]
  };
  // Su ataque definitivo.
  const ULT = {
    normal: 'Hiperrayo', fire: 'Sofoco', water: 'Hidrocañón', grass: 'Rayo Solar', electric: 'Electrocañón', ice: 'Ventisca',
    fighting: 'A Bocajarro', poison: 'Onda Tóxica', ground: 'Fisura', flying: 'Pájaro Osado', psychic: 'Psicocarga', bug: 'Megacuerno',
    rock: 'Poder Pasado', ghost: 'Tinieblas', dragon: 'Cometa Draco', dark: 'Juego Sucio', steel: 'Cuerpo Pesado', fairy: 'Fuerza Lunar'
  };
  const PHASE_LABEL = { p1: 'FASE 1 · TANTEO', p2: 'FASE 2 · FURIA', p3: 'FASE 3 · TODO O NADA' };

  let on = false, type = 'normal', col = '#ffffff', center = null, R = 0, dex = 0;
  let phase = 'p1', E = null, movers = [], later = [], ult = null, ultDone = false, ultT = 0, cd = 3, last = -1, nextId = 1;
  let immuneT = 0, covers = [], coverT = 0, glareCv = null;

  function reset() {
    on = false; E = null; center = null; movers = []; later = []; ult = null; covers = [];
    phase = 'p1'; ultDone = false; ultT = 0; cd = 3; last = -1; immuneT = 0;
  }

  // ---------------- empezar / acabar ----------------

  /** En cada ordenador, al llegar a la arena (rift.js, begin). */
  function begin(cfg, a) {
    reset();
    on = true;
    type = SETS[cfg.type] ? cfg.type : 'normal';
    col = G.U.TYPE_COLOR[type] || '#ffffff';
    center = { x: a.x, y: a.y };
    R = (cfg.r - 1.4) * TS();
    dex = cfg.dex;
  }

  /** Se acaba la pelea (ganada o perdida): fuera lo que quede en el aire. */
  function stop() { on = false; movers = []; later = []; ult = null; covers = []; if (E) E.legendHold = null; }

  /**
   * Quien manda: el legendario recién salido. Sus ataques de lejos son los de aquí (no los de jefe),
   * no se enfurece solo a media vida (lo hace en la fase 3) y, durante el definitivo, salta al centro
   * y se queda quieto cargando.
   */
  function attach(e) {
    E = e;
    e.bossInit();
    e.ai.ranged = [];
    e.enrage = function () {};
    const upd = e.update;
    e.update = function (dt, pl) {
      const h = this.legendHold;
      if (!h || this.dead) return upd.call(this, dt, pl);
      this.anim.update(dt);
      if (this.flash > 0) this.flash -= dt;
      if (this.ai) this.ai.cast = null;
      if (!h.jumped && !this.jump && G.U.dist2(this.x, this.y, h.x, h.y) > 64) {
        h.jumped = true;
        this.jump = { sx: this.x, sy: this.y, tx: h.x, ty: h.y, t: -0.2, dur: 0.7 };
      }
      if (this.jump) { this.updateJump(dt); return; }
      this.x = h.x; this.y = h.y;
      this.anim.dir = G.Sprites.dirFromAngle(Math.PI / 2);
      if (!this.anim.busy()) this.anim.play('Charge', { speed: 0.5 });
    };
    cd = 3;
  }

  const boss = () => {
    if (E && !E.dead && G.EnemyMgr.get(E.id) === E) return E;
    E = G.EnemyMgr.all().find(e => e.boss && !e.dead && e.dex === dex) || null;
    return E;
  };
  const targets = () => G.Game.everyone().filter(p => !p.dead && !p.silent);

  // ---------------- golpes que recibe ----------------

  /** Quien manda: un golpe al legendario (Enemy.hurt). Como mucho el 10 %, y sin saltarse fases. */
  function filterHit(e, amount) {
    if (!on || !e.legend) return amount;
    const a = Math.min(amount, e.maxHp * HIT_CAP, Math.max(0, e.hp - gate(e)));
    if (a <= 0 && immuneT <= 0) { immuneT = 0.45; G.FX.dmgText(e.x, e.y - e.bodyH * 0.6, 'INMUNE', '#d8c8e8'); }
    return a;
  }
  function gate(e) {
    return phase === 'p1' ? e.maxHp * 0.66 : phase === 'p2' ? e.maxHp * 0.33 : ultDone ? 0 : e.maxHp * ULT_GATE;
  }

  // ---------------- cada fotograma ----------------

  /** En cada ordenador (rift.js, mientras dura la arena). */
  function update(dt, pl) {
    if (!on) return;
    if (immuneT > 0) immuneT -= dt;
    if (authority()) hostTick(dt);
    if (ult) ultTick(dt, pl);
    stepMovers(dt, pl);
  }

  function hostTick(dt) {
    for (let i = later.length - 1; i >= 0; i--) if ((later[i].t -= dt) <= 0) { const f = later[i].fn; later.splice(i, 1); f(); }
    const e = boss();
    if (!e) return;
    const f = e.hp / e.maxHp;
    if (phase === 'p1' && f <= 0.66 + 1e-6) toPhase('p2');
    else if (phase === 'p2' && f <= 0.33 + 1e-6) toPhase('p3');
    if (ult || e.legendHold) return;                      // cargando el definitivo: nada más
    if (phase === 'p3' && (ultT -= dt) <= 0) { startUlt(e); return; }
    if ((cd -= dt) > 0) return;
    const n = POOL[phase];
    let i = Math.floor(Math.random() * n);
    if (i === last) i = (i + 1 + Math.floor(Math.random() * (n - 1))) % n;
    cast(i, e);
    // Fase 3: a veces dos a la vez.
    if (phase === 'p3' && Math.random() < 0.3) cast((i + 1 + Math.floor(Math.random() * (n - 1))) % n, e);
    last = i;
    cd = CD[phase] * G.U.rand(0.9, 1.15);
  }

  function toPhase(p) {
    if (G.Coop.isHost) G.Coop.broadcast(['lg', 'p', p]);
    onPhase(p);
    const e = boss();
    if (p === 'p3') {
      ultT = 1.4;
      if (e && e.ai && !e.ai.fury) { e.ai.fury = true; e.spd *= 1.15; }
    }
    cd = Math.min(cd, 1.2);
  }

  /** En cada ordenador: lo que se ve al cambiar de fase. */
  function onPhase(p) {
    if (!on || (p !== 'p2' && p !== 'p3')) return;
    phase = p;
    const name = (G.DEX_BY[dex] || {}).name || '';
    G.Game.flash(col, 0.45);
    G.Camera.kick(0.7);
    G.Audio.sfx('boss');
    const e = boss();
    if (e) G.FX.ring(e.x, e.y, e.r, e.r * 6, col, 0.6, 5);
    G.Spawner.say(G.I18n.f(p === 'p2' ? '¡{x} se pone serio! Fase 2' : '¡{x} lo da todo! Fase 3', name), 3, true);
  }

  // ---------------- ataques ----------------

  /** Quien manda: lanza el ataque i de su tipo. */
  function cast(i, e) {
    const [name, kind, o] = SETS[type][i];
    const tg = G.U.pick(targets()) || G.Game.player;
    if (!tg) return;
    const a0 = Math.atan2(tg.y - e.y, tg.x - e.x);
    // Lo mínimo que quita (si tu vida es poca): algo menos que un disparo suyo, porque ahora lanza muchos más.
    const dmg = Math.round(e.shotDmg() * 0.6);
    const base = (pct, extra) => Object.assign({ type, col, dmg, cat: e.cat, pct: +(pct * G.Modes.dmg).toFixed(3) }, extra);
    const H = (pct, extra) => G.Hazards.add(Object.assign({ type, dmg, color: col, cat: e.cat, pct: +(pct * G.Modes.dmg).toFixed(3) }, extra));
    const r2 = v => Math.round(v * 100) / 100;
    const list = [];
    const ex = Math.round(e.x), ey = Math.round(e.y);
    switch (kind) {
      case 'wave':
        if (o.full) {
          // Un frente que cruza toda la arena desde su lado, con un hueco por donde pasar.
          const gaps = [];
          for (let g = 0; g < (o.gaps || 1); g++) gaps.push(Math.round(G.U.rand(-R * 0.55, R * 0.55)));
          list.push(base(0.14, { k: 'wave', x: Math.round(center.x - Math.cos(a0) * R), y: Math.round(center.y - Math.sin(a0) * R), a: r2(a0),
                                 len: Math.round(R * 2 + 60), w: 28, v: o.v, travel: Math.round(R * 2), gaps, gw: 50, wait: 1.3 }));
        } else {
          list.push(base(0.13, { k: 'wave', x: ex, y: ey, a: r2(a0), len: o.len, w: 26, v: o.v, travel: Math.round(R * 2), gaps: [], gw: 0, wait: 0.7 }));
        }
        break;
      case 'ring':
        for (let k = 0; k < o.n; k++) {
          const gaps = [];
          for (let g = 0; g < (o.gaps || 0); g++) gaps.push(r2(Math.random() * 6.2832));
          list.push(base(0.12, { k: 'ring', x: ex, y: ey, v: 165, w: 22, gaps, ga: 0.34, maxR: Math.round(R * 2.1), wait: 0.8 + k * 1.0 }));
        }
        break;
      case 'orb': {
        const n = o.n, v = o.v || 170;
        for (let j = 0; j < n; j++) {
          const a = o.ring ? a0 + j * 6.2832 / n : a0 + (n === 1 ? 0 : (j / (n - 1) - 0.5) * (o.spread || 1));
          const side = j - (n - 1) / 2;
          list.push(base(0.09, { k: 'orb', x: ex, y: ey, a: r2(a), v, av: o.av ? r2(o.av * Math.sign(side || 1)) : 0,
                                 r: o.r || 10, ghost: o.ghost ? 1 : 0, life: 0.35 + R * 2.6 / v, wait: 0.35 }));
        }
        break;
      }
      case 'whirl': {
        // Remolinos lentos cerca de cada uno, que se desplazan despacio y atraen un poco.
        const ps = targets();
        for (let j = 0; j < o.n; j++) {
          const p = ps[j % ps.length] || tg;
          const a = Math.random() * 6.2832, d = G.U.rand(90, 150);
          let x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d;
          const dc = G.U.dist(x, y, center.x, center.y), max = R * 0.8;
          if (dc > max) { x = center.x + (x - center.x) / dc * max; y = center.y + (y - center.y) / dc * max; }
          const [nx, ny] = G.U.norm(p.x - x, p.y - y);
          list.push(base(0.05, { k: 'whirl', x: Math.round(x), y: Math.round(y), vx: Math.round(nx * 26), vy: Math.round(ny * 26),
                                 r: 46, pr: 125, pull: o.pull === 0 ? 0 : 40, life: 7.4, wait: 0.9 }));
        }
        break;
      }
      case 'bar':
        // Barras que giran sobre él (2: en cruz).
        for (let j = 0; j < o.n; j++) {
          list.push(base(0.12, { k: 'bar', x: ex, y: ey, vx: 0, vy: 0, a: r2(a0 + j * Math.PI / o.n + Math.PI / 2), av: (Math.random() < 0.5 ? -1 : 1) * 1.25,
                                 len: Math.round(Math.min(250, R * 0.75)), w: 18, life: 5.6, wait: 1.0 }));
        }
        break;
      case 'tumble':
        // Barras cortas que ruedan por la arena hacia vosotros.
        for (let j = 0; j < o.n; j++) {
          const a = a0 + (j - (o.n - 1) / 2) * 0.5;
          list.push(base(0.11, { k: 'bar', x: ex, y: ey, vx: Math.round(Math.cos(a) * 100), vy: Math.round(Math.sin(a) * 100), a: r2(Math.random() * 3.14),
                                 av: (j % 2 ? -1 : 1) * 3, len: 70, w: 18, life: 0.6 + R * 2.2 / 100, wait: 0.6, roll: 1 }));
        }
        break;
      case 'chase':
        // Caídas, una tras otra, donde está cada uno (y un poco por delante).
        for (const p of targets()) {
          for (let j = 0; j < o.k; j++) {
            later.push({ t: j * 0.45, fn: () => {
              if (!boss() || p.dead) return;
              H(0.12, { kind: 'zone', x: p.x + (p._vx || 0) * 0.35, y: p.y + (p._vy || 0) * 0.35, r: 52, delay: o.delay || 0.9 });
            } });
          }
        }
        break;
      case 'line':
        // En fila desde él hacia ti (en abanico si fan = 3).
        for (let f = 0; f < o.fan; f++) {
          const a = a0 + (o.fan === 1 ? 0 : (f - 1) * 0.38);
          for (let j = 1; j <= 11; j++) {
            const x = e.x + Math.cos(a) * j * 58, y = e.y + Math.sin(a) * j * 58;
            if (G.U.dist2(x, y, center.x, center.y) > (R + 20) ** 2) break;
            H(0.12, { kind: 'zone', x, y, r: 40, delay: 0.7 + j * 0.09 });
          }
        }
        break;
      case 'circle':
        // Un cerco alrededor de cada uno, con una salida, y luego el centro.
        for (const p of targets()) {
          const gap = Math.floor(Math.random() * 8);
          for (let j = 0; j < 8; j++) {
            if (j === gap) continue;
            const a = j * Math.PI / 4;
            H(0.12, { kind: 'zone', x: p.x + Math.cos(a) * 110, y: p.y + Math.sin(a) * 110, r: 44, delay: 1.1 });
          }
          H(0.14, { kind: 'zone', x: p.x, y: p.y, r: 70, delay: 1.7 });
        }
        break;
      case 'sweep': {
        // Rayos que barren un buen trozo de la arena.
        const dir = Math.random() < 0.5 ? 1 : -1;
        for (let j = 0; j < 9; j++) {
          H(0.12, { kind: 'beam', x: e.x, y: e.y, angle: a0 - dir * 0.8 + dir * j * 0.2, len: R * 2 + 80, w: 32, delay: 1.0 + j * 0.13 });
        }
        break;
      }
    }
    if (list.length) {
      if (G.Coop.isHost) G.Coop.broadcast(['lg', 'm', list, i]);
      for (const m of list) add(m);
    } else if (G.Coop.isHost) G.Coop.broadcast(['lg', 'n', i]);
    shout(i);
    e.anim.play(kind === 'bar' || kind === 'ring' || kind === 'whirl' ? 'Charge' : 'Shoot', { speed: 1.1 });
  }

  /** El nombre del ataque, encima del legendario. */
  function shout(i) {
    const a = SETS[type][i], e = boss();
    if (!a || !e) return;
    G.FX.dmgText(e.x, e.y - e.bodyH - 18, a[0], col, true);
    G.FX.ring(e.x, e.y, e.r, e.r * 3, col, 0.5, 3);
    if (G.Camera.sees(e.x, e.y, 200)) G.Audio.sfx('shot', { kind: 'beam', type });
  }

  /** Una forma nueva (también la que llega del anfitrión). */
  function add(o) {
    const m = Object.assign({ id: nextId++, t: 0, hit: false, hitT: 0 }, o);
    m.px = m.x; m.py = m.y; m.ca = m.a || 0;
    if (m.k === 'wave') m.life = m.wait + m.travel / m.v;
    if (m.k === 'ring') m.life = m.wait + m.maxR / m.v;
    movers.push(m);
  }

  // ---------------- formas que se mueven (cada ordenador, su Pokémon) ----------------

  function touch(m, pl, once, k = 1) {
    if (pl.invuln > 0) return;
    if (once) m.hit = true; else m.hitT = 0.8;
    // (Los remolinos pegan poco cada vez: es estar dentro lo que duele.)
    pl.hurt(Math.max((m.dmg || 1) * (m.k === 'whirl' ? 0.35 : 1), pl.maxHp * m.pct) * k, m.type, false, m.cat || null);
  }

  /** Distancia de un punto a un segmento. */
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    const t = l2 ? G.U.clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1) : 0;
    return Math.hypot(px - ax - dx * t, py - ay - dy * t);
  }
  const angDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

  function stepMovers(dt, pl) {
    const alive = pl && !pl.dead;
    const pr = alive ? pl.r * 0.6 : 0;
    for (let i = movers.length - 1; i >= 0; i--) {
      const m = movers[i];
      m.t += dt;
      if (m.hitT > 0) m.hitT -= dt;
      if (m.t >= m.life) { movers.splice(i, 1); continue; }
      const s = m.t - m.wait;
      if (s < 0) continue;
      if (m.k === 'wave') {
        const d = Math.min(m.travel, s * m.v);
        m.px = m.x + Math.cos(m.a) * d; m.py = m.y + Math.sin(m.a) * d;
        if (alive && !m.hit) {
          const rx = pl.x - m.px, ry = pl.y - m.py;
          const along = rx * Math.cos(m.a) + ry * Math.sin(m.a), lat = -rx * Math.sin(m.a) + ry * Math.cos(m.a);
          if (Math.abs(along) < m.w / 2 + pr && Math.abs(lat) < m.len / 2 && !m.gaps.some(g => Math.abs(lat - g) < m.gw - pr)) touch(m, pl, true);
        }
      } else if (m.k === 'ring') {
        m.R = s * m.v;
        if (alive && !m.hit) {
          const d = G.U.dist(pl.x, pl.y, m.x, m.y);
          if (Math.abs(d - m.R) < m.w / 2 + pr) {
            const an = Math.atan2(pl.y - m.y, pl.x - m.x);
            if (!m.gaps.some(g => angDiff(an, g) < m.ga)) touch(m, pl, true);
          }
        }
      } else if (m.k === 'orb') {
        m.ca += m.av * dt;
        m.px += Math.cos(m.ca) * m.v * dt; m.py += Math.sin(m.ca) * m.v * dt;
        if ((!m.ghost && G.World.projectileBlock(m.px, m.py, m.r * 0.5)) || G.U.dist2(m.px, m.py, center.x, center.y) > (R + 80) ** 2) {
          if (G.Camera.sees(m.px, m.py, 40)) G.FX.burst(m.px, m.py - 8, m.col, 5, 80);
          movers.splice(i, 1); continue;
        }
        if (alive && G.U.dist2(pl.x, pl.y, m.px, m.py) < (m.r + pr) ** 2 && pl.invuln <= 0) {
          touch(m, pl, true);
          G.FX.burst(m.px, m.py - 8, m.col, 6, 90);
          movers.splice(i, 1); continue;
        }
      } else if (m.k === 'whirl') {
        m.px += m.vx * dt; m.py += m.vy * dt;
        // Rebota en el borde de la arena.
        const dx = m.px - center.x, dy = m.py - center.y, d = Math.hypot(dx, dy), max = R - m.r;
        if (d > max) {
          const nx = dx / d, ny = dy / d, dot = m.vx * nx + m.vy * ny;
          if (dot > 0) { m.vx -= 2 * dot * nx; m.vy -= 2 * dot * ny; }
          m.px = center.x + nx * max; m.py = center.y + ny * max;
        }
        if (alive) {
          const dd = G.U.dist(pl.x, pl.y, m.px, m.py);
          // Atrae poco (se puede salir andando sin problema).
          if (m.pull && dd < m.pr && dd > 4) {
            const k = m.pull * (0.35 + 0.65 * (1 - dd / m.pr));
            const o = { x: pl.x + (m.px - pl.x) / dd * k * dt, y: pl.y + (m.py - pl.y) / dd * k * dt, r: pl.r };
            G.World.collide(o);
            pl.x = o.x; pl.y = o.y;
          }
          if (dd < m.r + pr && m.hitT <= 0) { touch(m, pl, false); if (m.hitT > 0) m.hitT = 0.7; }
        }
      } else if (m.k === 'bar') {
        m.px = m.x + m.vx * s; m.py = m.y + m.vy * s;
        m.ca = m.a + m.av * s;
        if (m.roll && G.U.dist2(m.px, m.py, center.x, center.y) > (R + m.len) ** 2) { movers.splice(i, 1); continue; }
        if (alive && m.hitT <= 0) {
          const cx = Math.cos(m.ca) * m.len, cy = Math.sin(m.ca) * m.len;
          if (segDist(pl.x, pl.y, m.px - cx, m.py - cy, m.px + cx, m.py + cy) < m.w / 2 + pr) touch(m, pl, false);
        }
      }
    }
  }

  // ---------------- ataque definitivo ----------------

  /** Quien manda: salta al centro y empieza a cargar. */
  function startUlt(e) {
    const o = { x: Math.round(center.x), y: Math.round(center.y), d: ULT_D };
    e.legendHold = { x: o.x, y: o.y };
    e.anim.play('Charge', { speed: 0.5 });
    if (G.Coop.isHost) G.Coop.broadcast(['lg', 'u', o]);
    onUlt(o);
  }

  /** En cada ordenador: empieza la carga del definitivo. */
  function onUlt(o) {
    if (!on) return;
    ult = { x: o.x, y: o.y, d: o.d || ULT_D, t: 0, name: ULT[type] };
    covers = findCovers(); coverT = 0.5;
    const name = (G.DEX_BY[dex] || {}).name || '';
    G.Spawner.say(G.I18n.f('¡{x} prepara {x}! Escóndete detrás de una columna, un árbol o una roca', name, G.T(ult.name)), 3.6, true);
    G.Audio.sfx('toll');
    G.Camera.kick(0.6);
  }

  function ultTick(dt, pl) {
    ult.t += dt;
    if ((coverT -= dt) <= 0) { coverT = 0.5; covers = findCovers(); }   // (las rocas se pueden romper)
    if (ult.t < ult.d) return;
    const u = ult;
    ult = null;
    // ¡Cae! A quien le vea, le da.
    G.Game.flash('#ffffff', 0.85);
    G.Camera.kick(1.3);
    G.Audio.sfx('land');
    G.FX.ring(u.x, u.y, 10, R * 1.6, col, 0.7, 8);
    for (let i = 0; i < 20; i++) G.FX.beam(u.x, u.y - G.LIFT, i * 6.2832 / 20, R * 2, 26, col, G.VFX.forType(type));
    if (pl && !pl.dead) {
      if (covered(pl.x, pl.y, u)) G.FX.dmgText(pl.x, pl.y - pl.bodyH - 12, '¡A CUBIERTO!', '#9effc0', true);
      else { pl.invuln = 0; pl.hurt(pl.maxHp * ULT_PCT * G.Modes.dmg, type, false, null); }
    }
    if (authority()) {
      ultDone = true; ultT = ULT_EVERY; cd = 2.2;
      later.push({ t: 0.6, fn: () => { const e = boss(); if (e) e.legendHold = null; } });
    }
  }

  /**
   * Lo que tapa: las columnas (paredes de dentro de la arena) y los árboles y rocas de la arena,
   * como círculos { x, y, r }. (Se mira con generosidad: no hace falta estar colocado al milímetro.)
   */
  function findCovers() {
    const a = G.World.arena;
    if (!a) return [];
    const ts = TS(), out = [], seen = new Set();
    for (let ty = a.ty - a.r; ty <= a.ty + a.r; ty++) for (let tx = a.tx - a.r; tx <= a.tx + a.r; tx++) {
      if (Math.hypot(tx - a.tx, ty - a.ty) > a.r - 0.8) continue;
      const x = tx * ts + ts / 2;
      if (G.World.isWall(x, ty * ts + ts / 2)) { out.push({ x, y: ty * ts + ts / 2, r: ts * 0.62 }); continue; }
      const p = G.World.projectileBlock(x, ty * ts + ts - 4, 1);
      if (p && p !== 'wall' && p.solid && !seen.has(p.id)) { seen.add(p.id); out.push({ x: p.x, y: p.y - 4, r: p.r + 3 }); }
    }
    return out;
  }

  /** ¿Algo tapa este punto, visto desde el legendario? */
  function covered(x, y, u = ult) {
    if (!u) return false;
    const px = x - u.x, py = y - u.y, dp = Math.hypot(px, py);
    if (dp < 1) return false;
    const ux = px / dp, uy = py / dp;
    for (const c of covers) {
      const cx = c.x - u.x, cy = c.y - u.y;
      const t = cx * ux + cy * uy;
      if (t <= 0 || t >= dp + c.r * 0.3) continue;
      if (Math.abs(cx * uy - cy * ux) < c.r + 6) return true;
    }
    return false;
  }

  // ---------------- red ----------------

  function onEvent(ev) {
    switch (ev[1]) {
      case 'p': if (typeof ev[2] === 'string') onPhase(ev[2]); break;
      case 'm':
        if (on && Array.isArray(ev[2])) {
          for (const o of ev[2]) if (o && typeof o === 'object' && typeof o.k === 'string') add(Object.assign({}, o, { pct: G.U.clamp(+o.pct || 0, 0, 0.4) }));
          if (SETS[type][ev[3]]) shout(ev[3]);
        }
        break;
      case 'n': if (on && SETS[type][ev[2]]) shout(ev[2]); break;
      case 'u': if (ev[2] && typeof ev[2] === 'object') onUlt(ev[2]); break;
    }
  }

  /** Otro pasa a llevar la partida a mitad: la carga que hubiera se pierde; la fase sigue. */
  function adopt() { later = []; ult = null; cd = 2; ultT = Math.min(ultT, 4); }

  // ---------------- dibujo ----------------

  const F = (wt, s) => `${wt} ${s}px Pixelify,"Segoe UI",system-ui,sans-serif`;

  /** En el mundo (encima de los Pokémon): las formas, sus avisos y las sombras del definitivo. */
  function drawAir(ctx) {
    if (!on || !center) return;
    const t = performance.now() / 1000, shape = G.VFX.forType(type).proj;
    ctx.save();
    // Sombras donde no llega el definitivo.
    if (ult) {
      const L = R * 2.4;
      ctx.fillStyle = 'rgba(8,10,28,0.32)';
      ctx.strokeStyle = 'rgba(158,255,192,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
      for (const c of covers) {
        const q = shadowPoly(c, ult, L);
        if (!q) continue;
        ctx.beginPath(); ctx.moveTo(q[0], q[1]); for (let i = 2; i < 8; i += 2) ctx.lineTo(q[i], q[i + 1]); ctx.closePath();
        ctx.fill();
      }
      ctx.setLineDash([]);
      // Su aura mientras carga.
      const k = Math.min(1, ult.t / ult.d);
      ctx.globalAlpha = 0.25 + k * 0.35;
      ctx.strokeStyle = col; ctx.lineWidth = 3 + k * 4;
      ctx.beginPath(); ctx.arc(ult.x, ult.y - 20, 30 + (1 - k) * 90 + Math.sin(t * 12) * 3, 0, 6.2832); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    for (const m of movers) {
      const s = m.t - m.wait, wait = s < 0, blink = Math.sin(t * 18) > 0;
      if (m.k === 'wave') {
        const nx = -Math.sin(m.a), ny = Math.cos(m.a);
        ctx.save();
        ctx.translate(m.px, m.py); ctx.rotate(m.a);
        if (wait) {
          // Aviso: la línea de salida y una flecha hacia donde va.
          ctx.globalAlpha = blink ? 0.85 : 0.5;
          ctx.strokeStyle = m.col; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
          ctx.beginPath(); ctx.moveTo(0, -m.len / 2); ctx.lineTo(0, m.len / 2); ctx.stroke();
          ctx.setLineDash([]);
          for (let j = -1; j <= 1; j++) { const yy = j * m.len / 4; ctx.beginPath(); ctx.moveTo(10, yy - 14); ctx.lineTo(40, yy); ctx.lineTo(10, yy + 14); ctx.stroke(); }
        } else {
          ctx.globalAlpha = 0.42; ctx.fillStyle = m.col;
          ctx.fillRect(-m.w / 2, -m.len / 2, m.w, m.len);
        }
        // Los huecos, bien marcados.
        ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(158,255,192,0.9)';
        for (const g of m.gaps) { ctx.fillRect(-m.w / 2 - 3, g - m.gw, 3, m.gw * 2); ctx.fillRect(m.w / 2, g - m.gw, 3, m.gw * 2); }
        ctx.restore();
        if (!wait) {
          ctx.globalAlpha = 0.95;
          for (let l = -m.len / 2 + 14; l < m.len / 2; l += 30) {
            if (m.gaps.some(g => Math.abs(l - g) < m.gw)) continue;
            G.VFX.draw(ctx, shape, type, m.px + nx * l, m.py + ny * l, { angle: m.a, scale: 1.1, frame: Math.floor(t * 8) });
          }
          ctx.globalAlpha = 1;
        }
      } else if (m.k === 'ring') {
        if (wait) {
          ctx.globalAlpha = blink ? 0.8 : 0.45; ctx.strokeStyle = m.col; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(m.x, m.y, 26 + (1 + s / m.wait) * 30, 0, 6.2832); ctx.stroke();
          ctx.globalAlpha = 1;
          continue;
        }
        const r = m.R || 0;
        ctx.globalAlpha = 0.55; ctx.strokeStyle = m.col; ctx.lineWidth = m.w;
        drawArcs(ctx, m, r);
        ctx.globalAlpha = 0.9; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        drawArcs(ctx, m, r);
        ctx.globalAlpha = 1;
      } else if (m.k === 'orb') {
        if (wait) continue;
        ctx.globalAlpha = m.ghost ? 0.35 : 0.3; ctx.fillStyle = m.col;
        ctx.beginPath(); ctx.arc(m.px, m.py - 10, m.r * 1.5, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = m.ghost ? 0.8 : 1;
        G.VFX.draw(ctx, shape, type, m.px, m.py - 10, { angle: m.ca, scale: m.r / 9, frame: Math.floor(t * 8) });
        ctx.globalAlpha = 1;
      } else if (m.k === 'whirl') {
        const k = wait ? Math.max(0.15, 1 + s / m.wait) : 1;
        ctx.globalAlpha = 0.2 * k; ctx.fillStyle = m.col;
        ctx.beginPath(); ctx.arc(m.px, m.py, m.r, 0, 6.2832); ctx.fill();
        if (m.pull) {
          ctx.globalAlpha = 0.3 * k; ctx.strokeStyle = m.col; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]);
          ctx.beginPath(); ctx.arc(m.px, m.py, m.pr, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.globalAlpha = 0.75 * k; ctx.strokeStyle = m.col; ctx.lineWidth = 3;
        for (let j = 0; j < 4; j++) {
          const a0 = t * 4 + j * 1.571;
          ctx.beginPath();
          for (let q = 0; q < 10; q++) { const a = a0 + q * 0.35, rr = 6 + q * (m.r - 6) / 9; const x = m.px + Math.cos(a) * rr, y = m.py + Math.sin(a) * rr; if (q) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (m.k === 'bar') {
        const a = wait ? m.a : m.ca, cx = Math.cos(a) * m.len, cy = Math.sin(a) * m.len;
        const x = wait ? m.x : m.px, y = wait ? m.y : m.py;
        if (wait) {
          ctx.globalAlpha = blink ? 0.8 : 0.4; ctx.strokeStyle = m.col; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
          ctx.beginPath(); ctx.moveTo(x - cx, y - cy); ctx.lineTo(x + cx, y + cy); ctx.stroke(); ctx.setLineDash([]);
          if (!m.roll) { ctx.beginPath(); ctx.arc(x, y, m.len, 0, 6.2832); ctx.globalAlpha = 0.18; ctx.stroke(); }
          ctx.globalAlpha = 1;
          continue;
        }
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.5; ctx.strokeStyle = m.col; ctx.lineWidth = m.w;
        ctx.beginPath(); ctx.moveTo(x - cx, y - cy); ctx.lineTo(x + cx, y + cy); ctx.stroke();
        ctx.globalAlpha = 0.95; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - cx, y - cy); ctx.lineTo(x + cx, y + cy); ctx.stroke();
        ctx.lineCap = 'butt';
        for (let l = -m.len + 12; l <= m.len; l += 34) G.VFX.draw(ctx, shape, type, x + Math.cos(a) * l, y + Math.sin(a) * l, { angle: a, scale: 0.9, frame: Math.floor(t * 8) });
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }

  function drawArcs(ctx, m, r) {
    if (!m.gaps.length) { ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, 6.2832); ctx.stroke(); return; }
    const gs = m.gaps.map(g => ((g % 6.2832) + 6.2832) % 6.2832).sort((a, b) => a - b);
    for (let i = 0; i < gs.length; i++) {
      const a0 = gs[i] + m.ga, a1 = (i + 1 < gs.length ? gs[i + 1] : gs[0] + 6.2832) - m.ga;
      if (a1 > a0) { ctx.beginPath(); ctx.arc(m.x, m.y, r, a0, a1); ctx.stroke(); }
    }
  }

  /** La sombra de algo que tapa (cuadrilátero en el mundo), o null si está pegado a él. */
  function shadowPoly(c, u, L) {
    const dx = c.x - u.x, dy = c.y - u.y, d = Math.hypot(dx, dy);
    if (d < c.r + 4) return null;
    const nx = -dy / d, ny = dx / d;
    const x1 = c.x + nx * c.r, y1 = c.y + ny * c.r, x2 = c.x - nx * c.r, y2 = c.y - ny * c.r;
    const f1 = L / Math.hypot(x1 - u.x, y1 - u.y), f2 = L / Math.hypot(x2 - u.x, y2 - u.y);
    return [x1, y1, u.x + (x1 - u.x) * f1, u.y + (y1 - u.y) * f1, u.x + (x2 - u.x) * f2, u.y + (y2 - u.y) * f2, x2, y2];
  }

  /** En pantalla: el resplandor del definitivo (menos en las sombras), su cuenta atrás y la fase. */
  function drawOverlay(ctx, w, h) {
    if (!on) return;
    const t = performance.now() / 1000, cam = G.Camera, pl = G.Game.player;
    ctx.save();
    if (ult) {
      const k = Math.min(1, ult.t / ult.d);
      if (!glareCv) glareCv = document.createElement('canvas');
      if (glareCv.width !== w || glareCv.height !== h) { glareCv.width = w; glareCv.height = h; }
      const g = glareCv.getContext('2d');
      g.clearRect(0, 0, w, h);
      g.globalAlpha = 0.12 + k * 0.3 + (k > 0.75 ? Math.sin(t * 20) * 0.05 : 0);
      g.fillStyle = col;
      g.fillRect(0, 0, w, h);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'destination-out';
      const L = R * 2.4, X = x => (x - cam.left()) * cam.scale, Y = y => (y - cam.top()) * cam.scale;
      for (const c of covers) {
        const q = shadowPoly(c, ult, L);
        if (!q) continue;
        g.beginPath(); g.moveTo(X(q[0]), Y(q[1])); for (let i = 2; i < 8; i += 2) g.lineTo(X(q[i]), Y(q[i + 1])); g.closePath(); g.fill();
      }
      g.globalCompositeOperation = 'source-over';
      ctx.drawImage(glareCv, 0, 0);
      // Cuenta atrás, el nombre y si estás a cubierto.
      const left = Math.max(0, ult.d - ult.t), y0 = h * 0.64;   // (debajo de tu Pokémon, que está en el centro)
      ctx.textAlign = 'center';
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.85)';
      ctx.font = F(800, 21);
      const t1 = G.I18n.f('ATAQUE DEFINITIVO · {x} s', left.toFixed(1));
      ctx.strokeText(t1, w / 2, y0); ctx.fillStyle = '#ffffff'; ctx.fillText(t1, w / 2, y0);
      ctx.font = F(800, 15);
      ctx.strokeText(ult.name, w / 2, y0 + 22); ctx.fillStyle = col; ctx.fillText(ult.name, w / 2, y0 + 22);
      if (pl && !pl.dead) {
        const safe = covered(pl.x, pl.y);
        const t2 = safe ? '¡A CUBIERTO!' : 'AL DESCUBIERTO: ESCÓNDETE';
        ctx.font = F(800, 14);
        ctx.strokeText(t2, w / 2, y0 + 44); ctx.fillStyle = safe ? '#9effc0' : '#ff8a8a'; ctx.fillText(t2, w / 2, y0 + 44);
      }
    }
    // Debajo de la barra de vida (y del tiempo de la grieta): la fase.
    if (boss()) {
      const label = ult ? 'ATAQUE DEFINITIVO' : PHASE_LABEL[phase];
      ctx.textAlign = 'center';
      ctx.font = F(800, 11);
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.8)';
      ctx.strokeText(label, w / 2, 112);
      ctx.fillStyle = ult ? '#ffffff' : phase === 'p3' ? '#ff8a8a' : phase === 'p2' ? '#ffd27a' : '#d9c2ff';
      ctx.fillText(label, w / 2, 112);
    }
    ctx.restore();
  }

  return {
    SETS, ULT, reset, begin, stop, attach, update, filterHit, onEvent, adopt, drawAir, drawOverlay, covered,
    /** ¿Hay pelea con un legendario? */
    get active() { return on; },
    get phase() { return phase; },
    get type() { return type; },
    get center() { return center; },
    get radius() { return R; },
    get boss() { return boss(); },
    /** Las formas en el aire: { k, px, py, ca, r, len, w, R, gaps, ... } (k: wave, ring, orb, whirl, bar). */
    get movers() { return movers; },
    /** El definitivo que carga: { x, y, t, d, name } o null. */
    get ult() { return ult; },
    /** Lo que tapa del definitivo: [{ x, y, r }]. */
    get covers() { return covers; },
    /** Pruebas: lanza ya el ataque i de su tipo (quien manda). */
    debugCast(i) { const e = boss(); if (e && authority()) cast(i, e); },
    /** Pruebas: el definitivo ya (quien manda). */
    debugUlt() { const e = boss(); if (e && authority() && !ult) startUlt(e); }
  };
})();
