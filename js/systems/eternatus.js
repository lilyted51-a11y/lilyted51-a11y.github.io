/* ============ eternatus.js — Eternatus Eternamax, el jefe del minuto 20 ============
 * (23-11-2026; como la Gran Actualización del juego oficial, hecho aquí a partir de su
 *  guía de jefes y de lo que se ve en su web.)
 *
 * Al llegar al minuto 20 el cielo se tiñe de rojo y, a los pocos segundos, todos viajáis a
 * la Cima de la Torre, una arena cerrada. Eternatus Eternamax es enorme y no se mueve; no
 * hay límite de tiempo, pero a los 5 minutos de pelea se enfurece (ataca más a menudo).
 *
 *   Fase 1 · Despertar        100 → 66 %  Rayo Infinito (barrido de rayos), Bomba Lodo (charcos
 *                                         tóxicos que duran), Energía Dinamax (anillos de orbes) y
 *                                         Pulso Dragón si estás pegado a él.
 *   Fase 2 · Escudo Dinamax    66 → 33 %  4 Núcleos Dinamax le hacen inmune: hay que romperlos (cada
 *                                         uno suelta una cura). Láseres entre los núcleos que se
 *                                         encienden y se apagan, y las nubes rojas cierran la arena.
 *   Fase 3 · Furioso           33 → 10 %  Espiral Infinita, Noche Oscura (todo a oscuras menos 3
 *                                         círculos), Rayo Infinito doble y el Remolino que te arrastra.
 *   Rayo Eternamax             10 %       Carga 8 s. Si rompéis el Núcleo Eterno queda aturdido 6 s y
 *                                         recibe un 50 % más; si no, el rayo cae fuera de los 2 círculos.
 *
 * Un golpe le quita como mucho el 10 % de la vida y no se salta fases. Sus ataques quitan un %
 * de tu vida (como mucho el 30 %) y sí valen Protección, Robustez y la Banda Focus.
 * Si ganáis: +600 Pokémonedas, un ticket ×10, su botín de jefe, vuelta al mapa y cada uno elige su
 * poder (systems/powers.js). Si caes jugando solo, se acaba la partida; en grupo os podéis levantar.
 *
 * Cooperativo: lo lleva el anfitrión. Eternatus y sus núcleos son enemigos normales (llegan con
 * 'ne'; su forma la pone dress / dressCore), los avisos van por G.Hazards ('hz') y los disparos por
 * 'es'. Lo demás va en 'et': ['et','s',cfg] empieza · ['et','p',fase] · ['et','fx',efecto] ·
 * ['et','x',id] anula un efecto · ['et','w'] ganada · ['et','a'] se acaba sin premio.
 */
G.Eternatus = (() => {
  const AT = 20 * 60;
  const DEX = 1890, FALLBACK = 890;           // Eternatus Eternamax (forma propia) o Eternatus
  const ARENA_R = 15;                         // en tiles
  const HIT_CAP = 0.10;                       // un golpe le quita como mucho esto
  const RAGE_AT = 300;                        // s de pelea: se enfurece
  const RED = '#ff3b5c', VIOLET = '#b04dff', TOXIC = '#a24dff', PALE = '#ffd0e0';
  const TS = () => G.Tiles.T * G.Sprites.PX;
  const authority = () => !G.Coop.active || G.Coop.isHost;
  const H = o => G.Hazards.add(Object.assign({ type: null, pure: false, dmg: 1, color: RED }, o));

  let phase = null;           // null | 'warn' | 'p1' | 'p2' | 'p3' | 'final' | 'won'
  let cfg = null, center = null, back = null, biome0 = 0;
  let E = null;               // Eternatus (en quien manda, el de verdad; en los demás, su copia)
  let done = false;           // ya ha salido en esta partida
  let warnT = 0, fightT = 0, cd = 2, last = '', endT = 0, stunT = 0, stunnedOnce = false, enraged = false;
  let finalT = 0, finalCore = 0, finalFx = 0, laserT = 0;
  let fogT = 0, fogR = 0;     // nubes rojas (desde la fase 2): radio que se puede pisar
  let fx = [];                // efectos de cada ordenador (ver addFx)
  let later = [];             // { t, fn } cosas que pasan dentro de un rato (quien manda)
  let touchCd = 0, hurtT = 0, immuneT = 0, lastFrac = 1, lastMax = 0, nextId = 1;
  let darkCv = null;

  function reset() {
    phase = null; cfg = null; center = null; back = null; E = null; done = false;
    warnT = fightT = endT = stunT = finalT = laserT = fogT = 0; cd = 2; last = ''; stunnedOnce = enraged = false;
    finalCore = finalFx = 0; fx = []; later = []; touchCd = hurtT = immuneT = 0; lastFrac = 1; lastMax = 0; fogR = 0;
  }

  // ---------------- empezar / viajar / acabar ----------------

  /** Quien manda: le toca (minuto 20). */
  function start() {
    done = true;
    const c = { tx: 9000 + Math.floor(Math.random() * 2000), ty: -9000 - Math.floor(Math.random() * 2000) };
    if (G.Coop.isHost) G.Coop.broadcast(['et', 's', c]);
    warn(c);
  }

  /** En cada ordenador: el cielo se tiñe de rojo y, a los 3 s, el viaje. */
  function warn(c) {
    if (phase) return;
    done = true; cfg = c; phase = 'warn'; warnT = 3;
    G.Rift.hidePortal();                   // (que nadie entre en una grieta durante el aviso)
    G.Spawner.say('¡El cielo se tiñe de rojo! Eternatus Eternamax despierta…', 3.2, true);
    G.Audio.sfx('toll');
    G.Camera.kick(0.6);
    G.Sprites.preload([G.SPRITE_META[DEX] ? DEX : FALLBACK], 12000);
  }

  function enter() {
    const pl = G.Game.player, ts = TS();
    back = { x: pl.x, y: pl.y }; biome0 = G.World.biome;
    G.Rift.hidePortal();
    if (authority()) G.EnemyMgr.stash(); else G.EnemyMgr.clearRemote();
    G.Projectiles.clear();
    G.Combat.clearFields();
    G.Hazards.clear();
    G.Pickups.clear();                     // (lo que había en el suelo se queda atrás)
    G.Events.adopt();                      // el evento que hubiera se da por acabado
    G.Weather.clear();
    G.World.setArena({ tx: cfg.tx, ty: cfg.ty, r: ARENA_R, type: 'eternatus' });
    G.World.setBiome(G.Tiles.arenaBiome('eternatus'), true);
    center = { x: cfg.tx * ts + ts / 2, y: cfg.ty * ts + ts / 2 };
    fogR = (ARENA_R - 1.4) * ts;
    const ps = G.Game.everyone();
    ps.forEach((p, i) => { p.x = center.x + (i - (ps.length - 1) / 2) * 34; p.y = center.y + ts * 3; });   // (a la vista de Eternatus)
    G.Camera.x = pl.x; G.Camera.y = pl.y;
    G.Game.flash(RED, 0.9);
    G.Camera.kick(1.2);
    G.Audio.sfx('boss');
    phase = 'p1'; fightT = 0; cd = 2.5;
    if (authority()) spawnBoss();
    G.Spawner.say('¡Eternatus Eternamax! Fase 1: Despertar', 3, true);
  }

  /** Vuelta al mapa (en cada ordenador). */
  function finish() {
    const pl = G.Game.player;
    phase = null; E = null; fx = []; later = []; stunT = 0;
    G.World.setArena(null);
    G.World.setBiome(biome0, true);
    if (authority()) G.EnemyMgr.restore();
    G.Projectiles.clear();
    G.Combat.clearFields();
    G.Hazards.clear();
    if (pl && back) {
      for (const p of G.Game.everyone()) { p.x = back.x; p.y = back.y; }
      if (pl.dead) pl.revive(0.3);
      G.Camera.x = pl.x; G.Camera.y = pl.y;
    }
    G.Game.flash(RED, 0.6);
  }

  /** Quien manda: se acaba sin premio (llega la Sentencia de Arceus con la pelea a medias). */
  function abort() {
    if (!phase) return;
    if (G.Coop.isHost) G.Coop.broadcast(['et', 'a']);
    if (phase !== 'warn') finish(); else phase = null;
  }

  // ---------------- Eternatus y sus núcleos ----------------

  function spawnBoss(frac = 1, maxHp = 0) {
    const n = G.Game.everyone().length, t = G.Game.st.time;
    // Vida: unos 150 s de vuestro daño a un enemigo (como la de los legendarios de la Sentencia), con un mínimo.
    const dps = G.Judgment.singleDps ? G.Judgment.singleDps() : 0;
    const hp = maxHp || Math.round(Math.max(60000 + t * 40, dps * 150) * (n > 1 ? G.Coop.scaleHp(n) : 1));
    const dex = G.SPRITE_META[DEX] ? DEX : FALLBACK;
    const def = { dex, hp, spd: 0, dmg: 0, xp: Math.round(2500 + t), behavior: 'eternatus' };
    const e = new G.Enemy(def, center.x, center.y - TS() * 2, { hp: 1, spd: 1, dmg: 1 }, true);
    dress(e);
    e.hp = Math.max(1, Math.round(hp * frac));
    G.EnemyMgr.add(e);
  }

  /** Lo que lo hace Eternatus (también en la copia de los invitados). */
  function dress(e) {
    e.eternatus = true; e.flying = true;
    e.scale = 1.5;
    e.anim = new G.Sprites.Animator(e.dex, e.scale);
    e.r = G.Sprites.bodyRadius(e.dex, e.scale) * 0.75;
    e.bodyH = G.Sprites.bodyHeight(e.dex, e.scale);
    e.update = function (dt) {                    // (no se mueve: flota sobre su sitio)
      if (center) { this.x = center.x; this.y = center.y - TS() * 2 + Math.sin(performance.now() / 700) * 5; }
      if (this.flash > 0) this.flash -= dt;
      this.anim.update(dt);
      if (!this.anim.busy()) this.anim.loop('Idle');
    };
    e.draw = function (ctx) { drawAura(ctx, this); G.Enemy.prototype.draw.call(this, ctx); };
    E = e;
  }

  function spawnCore(x, y, hp, eternal) {
    const def = { dex: E.dex, hp, spd: 0, dmg: 0, xp: 80, behavior: eternal ? 'etcore2' : 'etcore' };
    const c = new G.Enemy(def, x, y, { hp: 1, spd: 1, dmg: 1 }, false);
    dressCore(c);
    G.EnemyMgr.add(c);
    return c;
  }

  /** Un núcleo: cristal rojo que flota quieto (también en la copia de los invitados). */
  function dressCore(c) {
    c.etCore = true; c.flying = true;
    c.eternal = c.behavior === 'etcore2';
    c.name = c.eternal ? 'Núcleo Eterno' : 'Núcleo Dinamax';
    c.r = c.eternal ? 30 : 22; c.bodyH = c.eternal ? 56 : 42;
    const x0 = c.x, y0 = c.y;
    c.update = function (dt) { this.x = x0; this.y = y0; if (this.flash > 0) this.flash -= dt; };
    c.draw = function (ctx) { drawCore(ctx, this); };
    // Cada Núcleo Dinamax suelta una cura al romperse (la pone quien manda).
    c.die = function () {
      const was = this.dead;
      G.Enemy.prototype.die.call(this);
      if (!was && !this.remote && !this.eternal) G.Pickups.drop('heal', this.x, this.y);
    };
  }

  const liveCores = () => G.EnemyMgr.all().filter(e => e.etCore && !e.eternal && !e.dead);
  const boss = () => (E && !E.dead ? E : null);

  /**
   * Quien manda: un golpe a Eternatus (lo llama Enemy.hurt). Con núcleos vivos, inmune; si no,
   * como mucho el 10 % de su vida, y nunca por debajo del corte de su fase. → lo que le quita
   */
  function filterHit(e, amount) {
    if (e !== E || !phase || phase === 'won' || phase === 'warn') return amount;
    if (liveCores().length) { immune(e); return 0; }
    let a = amount * (stunT > 0 ? 1.5 : 1);
    a = Math.min(a, e.maxHp * HIT_CAP, Math.max(0, e.hp - gate(e)));
    if (a <= 0) immune(e);
    return a;
  }
  function gate(e) {
    return phase === 'p1' ? e.maxHp * 0.66 : phase === 'p2' ? e.maxHp * 0.33 : phase === 'p3' ? e.maxHp * 0.10
      : phase === 'final' && !stunnedOnce ? e.maxHp * 0.10 : 0;
  }
  function immune(e) {
    if (immuneT > 0) return;
    immuneT = 0.45;
    G.FX.dmgText(e.x, e.y - e.bodyH * 0.6, 'INMUNE', '#d8c8e8');
  }

  // ---------------- cada fotograma ----------------

  function update(dt, pl, time) {
    if (!phase) {
      if (!done && authority() && time >= AT && !G.Rift.inArena && !G.Judgment.active) start();
      return;
    }
    if (immuneT > 0) immuneT -= dt;
    if (phase === 'warn') {
      if ((warnT -= dt) <= 0) enter();
      return;
    }
    if (phase === 'won') {
      // De vuelta al mapa, a elegir el poder (systems/powers.js; en grupo, cada uno el suyo).
      if ((endT -= dt) <= 0) { finish(); done = true; G.Powers.offer(G.Game.player); }
      return;
    }
    fightT += dt;
    if (!E || E.dead) E = G.EnemyMgr.all().find(e => e.eternatus && !e.dead) || E;
    if (E && !E.dead) { lastFrac = E.hp / E.maxHp; lastMax = E.maxHp; }
    if (stunT > 0) stunT -= dt;
    if (phase === 'p2' || phase === 'p3' || phase === 'final') {
      fogT += dt;
      const ts = TS();
      fogR = Math.max(9 * ts, (ARENA_R - 1.4) * ts - fogT * ts * 0.15);
    }
    if (authority()) hostTick(dt);
    mine(dt, pl);
  }

  /** Quien manda: fases, ataques, núcleos, victoria. */
  function hostTick(dt) {
    for (let i = later.length - 1; i >= 0; i--) if ((later[i].t -= dt) <= 0) { const f = later[i].fn; later.splice(i, 1); f(); }
    const e = boss();
    if (!e) { if (E && E.dead && phase !== 'won') won(); return; }
    if (!enraged && fightT >= RAGE_AT) { enraged = true; G.Spawner.say('¡Eternatus se enfurece!', 2.6, true); if (G.Coop.isHost) G.Coop.broadcast(['et', 'r']); }
    const f = e.hp / e.maxHp;
    if (phase === 'p1' && f <= 0.66 + 1e-6) toPhase('p2');
    else if (phase === 'p2' && f <= 0.33 + 1e-6 && !liveCores().length) toPhase('p3');
    else if (phase === 'p3' && f <= 0.10 + 1e-6) toPhase('final');
    // Láseres entre los núcleos (fase 2).
    if (phase === 'p2') {
      const cs = liveCores();
      if (cs.length >= 2 && (laserT -= dt) <= 0) {
        laserT = enraged ? 2.4 : 3.2;
        for (let i = 0; i < cs.length; i++) {
          const a = cs[i], b = cs[(i + 1) % cs.length];
          if (a === b) continue;
          H({ kind: 'beam', x: a.x, y: a.y, angle: Math.atan2(b.y - a.y, b.x - a.x), len: G.U.dist(a.x, a.y, b.x, b.y), w: 26, delay: 1.0, pct: 0.15, color: RED });
        }
      }
    }
    // Rayo Eternamax.
    if (phase === 'final' && stunT <= 0) {
      finalT -= dt;
      const core = finalCore && G.EnemyMgr.get(finalCore);
      if (finalCore && (!core || core.dead)) {
        // ¡Roto! Aturdido 6 s y recibe un 50 % más.
        finalCore = 0; stunT = 6; stunnedOnce = true;
        cancelFx(finalFx);
        G.Spawner.say('¡Núcleo Eterno roto! Eternatus está aturdido', 3, true);
        if (G.Coop.isHost) G.Coop.broadcast(['et', 'st']);
        e.anim.play('Hurt', { speed: 0.5 });
        finalT = 14;
        return;
      }
      if (!finalCore && finalT <= 0) startFinal();
      if (finalCore) return;                       // mientras carga, nada más
    }
    if (stunT > 0) return;
    cd -= dt;
    if (cd > 0) return;
    const near = G.Game.everyone().some(p => !p.dead && !p.silent && G.U.dist2(p.x, p.y, e.x, e.y) < 280 * 280);
    const pool = phase === 'p1' ? ['sweep', 'sludge', 'orbs'] : phase === 'p2' ? ['orbs', 'sludge', 'sweep'] : ['spiral', 'night', 'sweep2', 'vortex'];
    let id = near && Math.random() < 0.45 ? 'pulse' : G.U.pick(pool.filter(x => x !== last));
    cast(id, e);
    last = id;
    cd = (phase === 'p1' ? 3.0 : phase === 'p2' ? 3.4 : 2.7) * (enraged ? 0.65 : 1);
  }

  function toPhase(p) {
    phase = p;
    if (G.Coop.isHost) G.Coop.broadcast(['et', 'p', p]);
    onPhase(p);
    if (p === 'p2') {
      const ts = TS(), hp = Math.round(E.maxHp * 0.035);
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + i * Math.PI / 2;
        spawnCore(center.x + Math.cos(a) * ts * 7, center.y + Math.sin(a) * ts * 6, hp, false);
      }
      laserT = 2;
    } else if (p === 'final') { finalT = 0.5; }
  }

  /** En cada ordenador: lo que se ve al cambiar de fase. */
  function onPhase(p) {
    phase = p;
    G.Game.flash(RED, 0.5);
    G.Camera.kick(0.8);
    G.Audio.sfx('rift');
    if (p === 'p2') { fogT = 0; G.Spawner.say('Fase 2: ¡Escudo Dinamax! Rompe los 4 núcleos', 3.4, true); }
    else if (p === 'p3') G.Spawner.say('Fase 3: ¡Eternatus está furioso!', 3, true);
    else if (p === 'final') G.Spawner.say('¡Rayo Eternamax! Rompe el Núcleo Eterno o ponte en un círculo', 3.6, true);
  }

  /** Quien manda: empieza a cargar el Rayo Eternamax (8 s). */
  function startFinal() {
    const ts = TS(), e = boss();
    if (!e) return;
    finalCore = spawnCore(center.x, center.y + ts * 1, Math.round(e.maxHp * 0.05), true).id;   // (entre él y vosotros)
    finalFx = addFx({ kind: 'dark', safe: safeSpots(2, 78), delay: 8, pct: 0.3, big: 1 }, true);
    e.anim.play('Charge', { speed: 0.35 });
  }

  // ---------------- ataques ----------------

  function targets() { return G.Game.everyone().filter(p => !p.dead && !p.silent); }

  /** n círculos seguros de radio r, repartidos cerca de los jugadores (a 110-230 de cada uno), dentro de la arena. */
  function safeSpots(n, r) {
    const ps = targets(), out = [];
    for (let i = 0; i < n; i++) {
      const p = ps.length ? ps[i % ps.length] : G.Game.player;
      let spot = null;
      for (let k = 0; k < 16 && !spot; k++) {
        const a = Math.random() * 6.2832, d = G.U.rand(110, 230);
        const x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d * 0.8;
        if (G.U.dist2(x, y, center.x, center.y) < (fogR - r - 12) ** 2 && G.World.isFree(x, y, 20)
            && !out.some(s => G.U.dist2(s.x, s.y, x, y) < (r * 2.2) ** 2)) spot = { x: Math.round(x), y: Math.round(y), r };
      }
      out.push(spot || { x: Math.round(center.x + (p.x - center.x) * 0.5), y: Math.round(center.y + (p.y - center.y) * 0.5 + r), r });
    }
    return out;
  }

  function cast(id, e) {
    const tg = G.U.pick(targets()) || G.Game.player;
    const k = enraged ? 1.3 : 1;
    if (id === 'sweep' || id === 'sweep2') {
      // Rayo Infinito: un rayo que barre (rayos seguidos, cada uno un poco más girado).
      const a0 = Math.atan2(tg.y - e.y, tg.x - e.x);
      for (const dir of id === 'sweep2' ? [1, -1] : [Math.random() < 0.5 ? 1 : -1]) {
        for (let i = 0; i < 10; i++) {
          H({ kind: 'beam', x: e.x, y: e.y, angle: a0 - dir * 0.9 + dir * i * 0.2, len: 1500, w: 40, delay: 1.0 + i * 0.12, pct: 0.22, color: RED });
        }
      }
      e.anim.play('Charge', { speed: 0.8 });
    } else if (id === 'sludge') {
      // Bomba Lodo: caídas sobre cada uno, y dejan charcos de Tóxico un rato.
      for (const p of targets()) {
        for (let i = 0; i < 3; i++) {
          const a = Math.random() * 6.2832, d = i ? G.U.rand(40, 130) : 0;
          const x = Math.round(p.x + Math.cos(a) * d), y = Math.round(p.y + Math.sin(a) * d * 0.8);
          H({ kind: 'zone', x, y, r: 58, delay: 1.2 + i * 0.15, pct: 0.12, color: TOXIC });
          addFx({ kind: 'pool', x, y, r: 54, life: 6, wait: 1.3 + i * 0.15 }, true);
        }
      }
      e.anim.play('Shoot', { speed: 0.9 });
    } else if (id === 'orbs') {
      // Energía Dinamax: coronas de orbes que salen de él.
      const ring = (off, n) => { for (let i = 0; i < n; i++) shot(e, off + i * 6.2832 / n, 150 * k, 0.1); };
      ring(Math.random(), enraged ? 22 : 18);
      later.push({ t: 0.7, fn: () => boss() && ring(Math.random(), enraged ? 22 : 18) });
      e.anim.play('Shoot', { speed: 1 });
    } else if (id === 'pulse') {
      // Pulso Dragón: si estás pegado a él.
      H({ kind: 'zone', x: e.x, y: e.y + 20, r: 250, delay: 0.9, pct: 0.25, color: '#7a5cff' });
      e.anim.play('Attack', { speed: 1.1 });
    } else if (id === 'spiral') {
      // Espiral Infinita: dos brazos de orbes que giran durante 3 s.
      const a0 = Math.random() * 6.2832;
      for (let i = 0; i < 25; i++) {
        later.push({ t: i * 0.12, fn: () => { const b = boss(); if (!b) return; const a = a0 + i * 0.32; shot(b, a, 170 * k, 0.08); shot(b, a + Math.PI, 170 * k, 0.08); } });
      }
      e.anim.play('Charge', { speed: 1 });
    } else if (id === 'night') {
      // Noche Oscura: todo a oscuras menos 3 círculos.
      addFx({ kind: 'dark', safe: safeSpots(3, 70), delay: 3.6, pct: 0.3 }, true);
      G.Spawner.say('¡Noche Oscura! Busca un círculo de luz', 2.4, true);
      e.anim.play('Charge', { speed: 0.6 });
    } else if (id === 'vortex') {
      // Remolino Infinito: te arrastra hacia él durante unos segundos (corre en contra).
      addFx({ kind: 'vortex', dur: 4.5, k: 95 * k }, true);
      G.Spawner.say('¡Remolino Infinito! Corre en contra', 2.2, true);
      e.anim.play('Charge', { speed: 0.8 });
    }
    G.FX.ring(e.x, e.y, e.r, e.r * 2.6, RED, 0.6, 4);
  }

  /** Un orbe de Energía Dinamax (disparo enemigo que quita un % de la vida). */
  function shot(e, a, sp, pct) {
    const p = G.Projectiles.spawn({
      x: e.x + Math.cos(a) * e.r * 0.6, y: e.y + Math.sin(a) * e.r * 0.4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      dmg: 1, pct, r: 9, life: 7, friendly: false, color: RED, mtype: 'dragon', cat: 'special', vis: G.VFX.forType('dragon')
    });
    if (G.Coop.isHost) G.Coop.enemyShot(p, 'dragon');
  }

  // ---------------- efectos de cada ordenador ----------------
  /*
   *   dark    a oscuras menos unos círculos: al cumplirse `delay`, quien esté fuera de todos pierde `pct`
   *   pool    charco de Tóxico: mientras estés dentro, un 4 % cada medio segundo
   *   vortex  te arrastra hacia Eternatus `dur` segundos
   * Quien manda lo crea y lo manda a los demás; cada uno lo aplica a su Pokémon.
   */
  function addFx(o, send) {
    const f = Object.assign({ id: nextId++, t: 0 }, o);
    fx.push(f);
    if (send && G.Coop.isHost) G.Coop.broadcast(['et', 'fx', f]);
    return f.id;
  }
  function cancelFx(id) {
    fx = fx.filter(f => f.id !== id);
    if (G.Coop.isHost) G.Coop.broadcast(['et', 'x', id]);
  }

  /** Tu Pokémon: efectos, nubes rojas y tocar a Eternatus. */
  function mine(dt, pl) {
    if (touchCd > 0) touchCd -= dt;
    if (hurtT > 0) hurtT -= dt;
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i];
      f.t += dt;
      if (f.kind === 'dark') {
        if (f.t >= f.delay) {
          fx.splice(i, 1);
          G.Game.flash(f.big ? '#ffffff' : RED, f.big ? 0.8 : 0.4);
          G.Camera.kick(f.big ? 1.4 : 0.6);
          G.Audio.sfx(f.big ? 'land' : 'break');
          if (pl && !pl.dead && !f.safe.some(s => G.U.dist2(pl.x, pl.y, s.x, s.y) < s.r * s.r)) {
            pl.invuln = 0;
            pl.hurt(pl.maxHp * f.pct, null, false, null);
          }
          if (f.big && authority()) {       // el rayo ha caído: otra carga dentro de un rato
            finalCore = 0;
            const c = G.EnemyMgr.all().find(e => e.etCore && e.eternal && !e.dead);
            if (c) { c.dead = true; c.fade = 0.4; }
            finalT = 7;
          }
        }
      } else if (f.kind === 'pool') {
        if (f.t < (f.wait || 0)) continue;
        if (f.t >= (f.wait || 0) + f.life) { fx.splice(i, 1); continue; }
        if (pl && !pl.dead && hurtT <= 0 && G.U.dist2(pl.x, pl.y, f.x, f.y) < f.r * f.r) {
          hurtT = 0.5; pl.invuln = 0;
          pl.hurt(pl.maxHp * 0.04, null, false, null);
        }
      } else if (f.kind === 'vortex') {
        if (f.t >= f.dur) { fx.splice(i, 1); continue; }
        const b = E;
        if (pl && !pl.dead && b) {
          const [nx, ny] = G.U.norm(b.x - pl.x, b.y - pl.y);
          // (collide mueve el objeto que le pasas y devuelve si chocó: antes se usaba lo que devolvía
          //  y el jugador acababa en NaN, fuera del mapa, en cuanto le pillaba el remolino)
          const s = { x: pl.x + nx * f.k * dt, y: pl.y + ny * f.k * dt, r: pl.r };
          G.World.collide(s);
          pl.x = s.x; pl.y = s.y;
        }
      }
    }
    if (!pl || pl.dead || !center) return;
    // Nubes rojas: fuera del círculo que queda, duele.
    if (hurtT <= 0 && G.U.dist2(pl.x, pl.y, center.x, center.y) > fogR * fogR && fogR < (ARENA_R - 1.5) * TS()) {
      hurtT = 0.5; pl.invuln = 0;
      pl.hurt(pl.maxHp * 0.05, null, false, null);
    }
    // Tocar a Eternatus.
    const b = E;
    if (b && !b.dead && touchCd <= 0) {
      const rr = b.r + pl.r;
      if (G.U.dist2(b.x, b.y, pl.x, pl.y) < rr * rr) {
        touchCd = 1; pl.invuln = 0;
        pl.hurt(pl.maxHp * 0.15, null, false, null);
        G.Camera.kick(0.5);
      }
    }
    // Y nadie sale de la arena.
    const max = (ARENA_R - 1.4) * TS(), dx = pl.x - center.x, dy = pl.y - center.y, d = Math.hypot(dx, dy);
    if (d > max) { pl.x = center.x + dx / d * max; pl.y = center.y + dy / d * max; }
  }

  // ---------------- victoria ----------------

  function won() {
    if (G.Coop.isHost) G.Coop.broadcast(['et', 'w']);
    onWon();
    // El premio (en grupo, el del equipo: lo cuenta el anfitrión y llega a todos).
    const pl = G.Game.player;
    if (pl) { pl.coins += 600; pl.t10 = (pl.t10 || 0) + 1; }
  }
  function onWon() {
    if (phase === 'won') return;
    phase = 'won'; endT = 4.5; fx = []; later = [];
    G.Hazards.clear();
    G.Pickups.pullAll();
    G.Game.flash('#ffffff', 0.8);
    G.Audio.sfx('legend');
    G.Spawner.say('¡Has vencido a Eternatus Eternamax! +600 Pokémonedas y un ticket ×10', 4, true);
    G.Progress.event('eternatus');
  }

  // ---------------- red ----------------

  function onEvent(ev) {
    switch (ev[1]) {
      case 's': if (ev[2]) warn(ev[2]); break;
      case 'p': if (typeof ev[2] === 'string' && phase && phase !== 'warn') onPhase(ev[2]); break;
      case 'fx': if (ev[2] && typeof ev[2] === 'object' && phase) fx.push(Object.assign({}, ev[2], { t: 0 })); break;
      case 'x': fx = fx.filter(f => f.id !== ev[2]); break;
      case 'st': stunT = 6; stunnedOnce = true; G.Spawner.say('¡Núcleo Eterno roto! Eternatus está aturdido', 3, true); break;
      case 'r': enraged = true; G.Spawner.say('¡Eternatus se enfurece!', 2.6, true); break;
      case 'w': onWon(); break;
      case 'a': if (phase && phase !== 'warn') finish(); phase = null; break;
    }
  }

  /**
   * Otro pasa a llevar la partida a mitad (cambio de anfitrión, coop.js): Eternatus vuelve a salir
   * con la vida que le quedaba, y los núcleos que quedaban.
   */
  function adopt() {
    if (!phase || phase === 'warn' || phase === 'won' || !center) return;
    const cores = G.EnemyMgr.all().filter(e => e.etCore && !e.dead && !e.remote).length;
    if (!G.EnemyMgr.all().some(e => e.eternatus && !e.dead && !e.remote)) spawnBoss(lastFrac, lastMax);
    if (phase === 'p2' && !cores) {
      // (No sabemos cuántos quedaban: si aún no había caído del 33 %, vuelven los cuatro.)
      if (lastFrac > 0.34) for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + i * Math.PI / 2, ts = TS();
        spawnCore(center.x + Math.cos(a) * ts * 7, center.y + Math.sin(a) * ts * 6, Math.round(E.maxHp * 0.035), false);
      }
    }
    finalCore = 0; finalT = 2; later = []; cd = 2;
  }

  // ---------------- dibujo ----------------

  const F = (wt, s) => `${wt} ${s}px Pixelify,"Segoe UI",system-ui,sans-serif`;

  /** Aura roja y anillos debajo de Eternatus. */
  function drawAura(ctx, e) {
    if (e.dead) return;
    const t = performance.now() / 1000;
    ctx.save();
    ctx.globalAlpha = 0.28 + Math.sin(t * 3) * 0.08 + (stunT > 0 ? 0.2 : 0);
    ctx.fillStyle = stunT > 0 ? '#ffe14d' : RED;
    ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * 2.4, e.r * 0.8, 0, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = liveCores().length ? '#ff9ab0' : VIOLET; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.6 + i / 3) % 1;
      ctx.globalAlpha = 0.5 * (1 - k);
      ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * (1.2 + k * 2.2), e.r * (0.4 + k * 0.75), 0, 0, 6.2832); ctx.stroke();
    }
    // Escudo Dinamax: una cúpula roja mientras quedan núcleos.
    if (liveCores().length) {
      ctx.globalAlpha = 0.18 + Math.sin(t * 5) * 0.05;
      ctx.fillStyle = '#ff2a4a';
      ctx.beginPath(); ctx.arc(e.x, e.y - e.bodyH * 0.45, e.bodyH * 0.62, 0, 6.2832); ctx.fill();
    }
    ctx.restore();
  }

  /** Un núcleo: cristal rojo (el Eterno, más grande y morado) con su brillo. */
  function drawCore(ctx, c) {
    const a = c.dead ? Math.max(0, c.fade / 0.5) : 1;
    if (a <= 0) return;
    const t = performance.now() / 1000, x = c.x, y = c.y - 24 + Math.sin(t * 2 + c.id) * 4, s = c.eternal ? 1.5 : 1;
    const col = c.eternal ? VIOLET : RED;
    ctx.save();
    ctx.globalAlpha = 0.3 * a;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x, c.y, 16 * s, 6 * s, 0, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = (0.35 + Math.sin(t * 4) * 0.1) * a;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, 26 * s, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = a;
    ctx.fillStyle = c.flash > 0 ? '#ffffff' : col;
    ctx.beginPath(); ctx.moveTo(x, y - 22 * s); ctx.lineTo(x + 13 * s, y); ctx.lineTo(x, y + 22 * s); ctx.lineTo(x - 13 * s, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = PALE;
    ctx.beginPath(); ctx.moveTo(x - 2 * s, y - 15 * s); ctx.lineTo(x + 5 * s, y - 2 * s); ctx.lineTo(x - 2 * s, y + 4 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2a0610'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y - 22 * s); ctx.lineTo(x + 13 * s, y); ctx.lineTo(x, y + 22 * s); ctx.lineTo(x - 13 * s, y); ctx.closePath(); ctx.stroke();
    // Vida del núcleo.
    if (!c.dead && c.hp < c.maxHp) {
      const w = 40 * s;
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - w / 2, y + 28 * s, w, 5);
      ctx.fillStyle = col; ctx.fillRect(x - w / 2, y + 28 * s, w * c.hp / c.maxHp, 5);
    }
    ctx.restore();
  }

  /** En el mundo: nubes rojas, charcos, círculos seguros y el remolino. */
  function drawAir(ctx) {
    if (!center || !phase || phase === 'warn') return;
    const t = performance.now() / 1000;
    ctx.save();
    // Nubes rojas fuera del círculo que se puede pisar.
    if (fogR < (ARENA_R - 1.5) * TS()) {
      ctx.fillStyle = `rgba(150,20,40,${(0.42 + Math.sin(t * 2) * 0.05).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(center.x, center.y, (ARENA_R + 6) * TS(), 0, 6.2832);
      ctx.arc(center.x, center.y, fogR, 0, 6.2832, true);
      ctx.fill('evenodd');
      ctx.strokeStyle = 'rgba(255,90,120,.7)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(center.x, center.y, fogR, 0, 6.2832); ctx.stroke();
    }
    for (const f of fx) {
      if (f.kind === 'pool' && f.t >= (f.wait || 0)) {
        const k = Math.min(1, (f.wait || 0) + f.life - f.t);
        ctx.globalAlpha = 0.45 * k;
        ctx.fillStyle = TOXIC;
        ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r, f.r * 0.6, 0, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 0.7 * k;
        ctx.fillStyle = '#e0b0ff';
        for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * 2.1 + f.id; ctx.fillRect(Math.round(f.x + Math.cos(a) * f.r * 0.5), Math.round(f.y + Math.sin(a) * f.r * 0.3), 3, 3); }
        ctx.globalAlpha = 1;
      } else if (f.kind === 'dark') {
        for (const s of f.safe) {
          ctx.globalAlpha = 0.85;
          ctx.strokeStyle = f.big ? '#ffffff' : '#fff3c8'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.8, 0, 0, 6.2832); ctx.stroke();
          ctx.globalAlpha = 0.18 + Math.sin(t * 6) * 0.06;
          ctx.fillStyle = '#fff3c8';
          ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.8, 0, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = 1;
        }
      } else if (f.kind === 'vortex' && E) {
        ctx.strokeStyle = 'rgba(200,120,255,.55)'; ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
          const a0 = t * 3 + i * 1.05;
          ctx.beginPath();
          for (let j = 0; j < 14; j++) {
            const a = a0 + j * 0.28, r = 60 + j * 34;
            const px = E.x + Math.cos(a) * r, py = E.y + Math.sin(a) * r * 0.6;
            if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py);
          }
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  /** En pantalla: el cielo rojo, la oscuridad con sus huecos y lo que pasa. */
  function drawOverlay(ctx, w, h) {
    if (!phase) return;
    const t = performance.now() / 1000;
    ctx.save();
    if (phase === 'warn') {
      ctx.fillStyle = `rgba(170,10,40,${((1 - warnT / 3) * 0.45).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      return;
    }
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(150,10,40,0)');
    g.addColorStop(1, `rgba(150,10,40,${enraged ? 0.45 : 0.32})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Oscuridad (Noche Oscura y Rayo Eternamax): todo negro menos los círculos.
    const cam = G.Camera;
    for (const f of fx) {
      if (f.kind !== 'dark') continue;
      const k = G.U.clamp(f.t / Math.min(1.5, f.delay * 0.5), 0, 1) * (f.big ? 0.55 : 0.8);
      if (!darkCv) darkCv = document.createElement('canvas');
      if (darkCv.width !== w || darkCv.height !== h) { darkCv.width = w; darkCv.height = h; }
      const d = darkCv.getContext('2d');
      d.clearRect(0, 0, w, h);
      d.fillStyle = f.big ? `rgba(70,0,30,${k.toFixed(3)})` : `rgba(4,0,12,${k.toFixed(3)})`;
      d.fillRect(0, 0, w, h);
      d.globalCompositeOperation = 'destination-out';
      for (const s of f.safe) {
        d.beginPath();
        d.ellipse((s.x - cam.left()) * cam.scale, (s.y - cam.top()) * cam.scale, s.r * cam.scale * 1.05, s.r * 0.8 * cam.scale * 1.05, 0, 0, 6.2832);
        d.fill();
      }
      d.globalCompositeOperation = 'source-over';
      ctx.drawImage(darkCv, 0, 0);
      // El borde de cada círculo y, si no se ve, una flecha hacia el más cercano.
      const pl = G.Game.player, pulse = 0.6 + Math.sin(t * 8) * 0.4;
      let best = null, bd = Infinity;
      for (const s of f.safe) {
        const sx = (s.x - cam.left()) * cam.scale, sy = (s.y - cam.top()) * cam.scale;
        ctx.strokeStyle = f.big ? '#ffffff' : '#fff3c8'; ctx.lineWidth = 3; ctx.globalAlpha = 0.6 + pulse * 0.4;
        ctx.beginPath(); ctx.ellipse(sx, sy, s.r * cam.scale, s.r * 0.8 * cam.scale, 0, 0, 6.2832); ctx.stroke();
        ctx.globalAlpha = 1;
        const dd = pl ? G.U.dist2(pl.x, pl.y, s.x, s.y) : 0;
        if (dd < bd) { bd = dd; best = { sx, sy }; }
      }
      if (best && (best.sx < 0 || best.sx > w || best.sy < 0 || best.sy > h)) {
        const M = 48, ex = G.U.clamp(best.sx, M, w - M), ey = G.U.clamp(best.sy, M + 70, h - M - 80), an = Math.atan2(best.sy - ey, best.sx - ex);
        ctx.save(); ctx.translate(ex, ey);
        ctx.fillStyle = '#fff3c8';
        ctx.beginPath(); ctx.moveTo(Math.cos(an) * 30, Math.sin(an) * 30);
        ctx.lineTo(Math.cos(an + 2.45) * 15, Math.sin(an + 2.45) * 15); ctx.lineTo(Math.cos(an - 2.45) * 15, Math.sin(an - 2.45) * 15);
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
      // Cuenta atrás (debajo del aviso del centro).
      const left = Math.max(0, f.delay - f.t);
      ctx.textAlign = 'center';
      ctx.font = F(800, f.big ? 24 : 19);
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.85)';
      const txt = G.I18n.f(f.big ? 'RAYO ETERNAMAX · {x} s' : 'NOCHE OSCURA · {x} s', left.toFixed(1));
      ctx.strokeText(txt, w / 2, h * 0.42);
      ctx.fillStyle = f.big ? '#ffb0c8' : '#fff3c8';
      ctx.fillText(txt, w / 2, h * 0.42);
    }
    // Debajo de la barra de vida: la fase y si es inmune.
    const b = E && !E.dead ? E : null;
    if (b) {
      const n = liveCores().length;
      const label = n ? G.I18n.f('ESCUDO DINAMAX · INMUNE · NÚCLEOS {x}', n)
        : stunT > 0 ? 'ATURDIDO · ¡RECIBE UN 50 % MÁS!'
        : phase === 'p1' ? 'FASE 1 · DESPERTAR' : phase === 'p2' ? 'FASE 2 · ESCUDO DINAMAX' : phase === 'p3' ? 'FASE 3 · FURIOSO' : 'RAYO ETERNAMAX';
      ctx.textAlign = 'center';
      ctx.font = F(800, 11);
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.8)';
      ctx.strokeText(label, w / 2, 98);
      ctx.fillStyle = n ? '#ff9ab0' : stunT > 0 ? '#ffe14d' : '#ffd0e0';
      ctx.fillText(label, w / 2, 98);
      if (enraged) {
        ctx.strokeText('ENFURECIDO', w / 2, 112);
        ctx.fillStyle = '#ff6a7a';
        ctx.fillText('ENFURECIDO', w / 2, 112);
      }
    }
    ctx.restore();
  }

  return {
    AT, reset, update, onEvent, adopt, abort, filterHit, dress, dressCore, drawAir, drawOverlay,
    /** ¿Está en marcha (aviso o pelea)? Mientras, no salen oleadas, eventos ni grietas. */
    get active() { return !!phase; },
    get phase() { return phase; },
    /** Copia local (bot y pruebas): Eternatus y lo que hay. */
    get boss() { return boss(); },
    get fx() { return fx; },
    get center() { return center; },
    get fogR() { return fogR; }
  };
})();
