/* ============ events.js — eventos a mitad de partida y duendes del tesoro ============
 *
 * Cada 4-5 minutos (nunca con un jefe vivo ni en la grieta) pasa uno de estos:
 *
 *   horde   Horda de un tipo: 30 s en los que todos los que salen son de un
 *           mismo tipo (si tu tipo les gana, es tu momento)
 *   gold    Hora dorada: 30 s de enemigos dorados que dan el doble de
 *           experiencia y a veces sueltan monedas
 *   lost    Pokémon perdido: lo tocas, te sigue y lo llevas hasta la marca.
 *           Los enemigos le hacen daño; si cae (o tardas más de 2 min), se va.
 *           Premio: cura la mitad de la vida, monedas, un ticket y, 1 de cada
 *           5 veces, se une a tu colección.
 *   munch   Munchlax hambriento (23-11-2026, como el del juego oficial): pide una baya;
 *           al pasar por encima de un arbusto se sacude y suelta su baya (dos
 *           esconden un enjambre de Combee). Llévale 3 de las que pide antes de
 *           2 min 30 s. Premio: un objeto y un Caramelo Exp. para cada jugador.
 *
 * Duendes del tesoro (1-2 por partida, ver Enemy behavior 'thief'): un
 * Meowth cargado de monedas (o, 1 de cada 4, un Gholdengo con un ticket ×10)
 * que huye y se escapa a los 15 s si no lo atrapas.
 *
 * Cooperativo: decide el anfitrión y avisa con 'ev' (ver coop.js). Todos ven lo
 * mismo y el premio es para todos.
 */
G.Events = (() => {
  const EVERY = [240, 300], DUR = 30, LOST_TIME = 120;
  const THIEF_FIRST = [120, 240], THIEF_NEXT = [240, 360], THIEF_LIFE = 15;
  const authority = () => !G.Coop.active || G.Coop.isHost;
  // Munchlax: las bayas que puede pedir (de los arbustos; no son las de consum.js) y cuánto espera.
  const MUNCH_DEX = 446, COMBEE = 415, MUNCH_TIME = 150, MUNCH_NEED = 3, BUSHES = 9;
  const MB = ['oran', 'cheri', 'rawst', 'aspear'];
  const MB_NAME = { oran: 'Baya Aranja', cheri: 'Baya Zreza', rawst: 'Baya Safre', aspear: 'Baya Perasi' };
  const MB_PL = { oran: 'Bayas Aranja', cheri: 'Bayas Zreza', rawst: 'Bayas Safre', aspear: 'Bayas Perasi' };
  const MB_COL = { oran: '#4fb4ff', cheri: '#ff5f6d', rawst: '#5fe08a', aspear: '#ffd23f' };

  let nextT = 0, cur = null, last = null, thiefT = 0, thieves = 0;
  let lost = null;      // { dex, name, x, y, hp, maxHp, state, follow, tx, ty, t, anim, r, hitCd, netT, grant }
  let munch = null;     // { x, y, want, got, bushes: [{ x, y, kind, shaken }], carry: { oran: n… }, t, anim, r, netT, nagT }

  function reset() {
    nextT = G.U.rand(EVERY[0], EVERY[1]);
    cur = null; last = null; lost = null; munch = null;
    thiefT = G.U.rand(THIEF_FIRST[0], THIEF_FIRST[1]); thieves = 0;
  }

  // ---------------- ciclo ----------------

  function update(dt, players, time) {
    if (cur) {
      cur.t += dt;
      if (cur.id !== 'lost' && cur.id !== 'munch' && cur.t >= cur.dur && authority()) end();
    }
    if (lost) lostTick(dt, players);
    if (munch) munchTick(dt, players);
    if (!authority() || G.Rift.inArena || G.Judgment.active || G.Eternatus.active) return;

    if (thieves < 2) {
      thiefT -= dt;
      if (thiefT <= 0) {
        if (G.EnemyMgr.bossAlive()) thiefT = 8;
        else { spawnThief(players, time); thieves++; thiefT = G.U.rand(THIEF_NEXT[0], THIEF_NEXT[1]); }
      }
    }

    if (cur) return;
    nextT -= dt;
    if (nextT > 0) return;
    if (G.EnemyMgr.bossAlive()) { nextT = 10; return; }
    nextT = G.U.rand(EVERY[0], EVERY[1]);
    const ids = ['horde', 'gold', 'lost', 'munch'].filter(id => id !== last);
    start(G.U.pick(ids), time, players);
  }

  function start(id, time, players) {
    last = id;
    if (id === 'horde') {
      const types = G.Enemies.hordeTypes(time);
      if (!types.length) return start('gold', time, players);
      const type = G.U.pick(types);
      const defs = G.Enemies.hordeDefs(type, time);
      G.Sprites.preload(defs.map(d => d.dex));
      cur = { id, t: 0, dur: DUR, type, defs };
      G.Spawner.burst(Math.round(6 * G.Coop.scaleRate(players.length)));
    } else if (id === 'gold') {
      cur = { id, t: 0, dur: DUR };
      for (const e of G.EnemyMgr.all()) if (!e.remote) e.makeGolden();
    } else if (id === 'munch') {
      if (!spawnMunch(players)) return start('gold', time, players);
      cur = { id, t: 0, dur: Infinity };
    } else {
      if (!spawnLost(players)) return;
      cur = { id, t: 0, dur: Infinity };
    }
    announce();
    if (G.Coop.isHost) G.Coop.broadcast(['ev', 's', id, cur.type || '']);
  }

  function announce() {
    if (!cur) return;
    if (cur.id === 'horde') say('¡Horda de tipo ' + G.U.TYPE_NAME[cur.type] + '!', 3, G.U.TYPE_COLOR[cur.type]);
    else if (cur.id === 'gold') say('¡Hora dorada! Doble de experiencia', 3, '#ffd23f');
    else if (cur.id === 'munch') say(G.I18n.f('¡Munchlax tiene hambre! Sacude los arbustos y llévale 3 {x}', G.T(MB_PL[munch ? munch.want : 'oran'])), 3.6);
    else if (lost) say('¡Un ' + lost.name + ' se ha perdido! Búscalo y llévalo a la marca', 3.4, '#7dffb0');
    G.Audio.sfx(cur.id === 'gold' ? 'shiny' : 'surge');
  }

  function say(text, secs) { G.Spawner.say(text, secs, true); }

  function end() {
    if (!cur) return;
    cur = null;
    if (G.Coop.isHost) G.Coop.broadcast(['ev', 'e']);
  }

  /** Lo que sale durante una horda (lo usa G.Enemies.bagAt). */
  function bag() { return cur && cur.id === 'horde' && cur.defs.length ? cur.defs : null; }

  // ---------------- duende del tesoro ----------------

  function spawnThief(players, time) {
    const gold = Math.random() < 0.25;
    const dex = gold ? 1000 : 52;
    const mon = G.DEX_BY[dex];
    if (!mon || !G.SPRITE_META[dex]) return;
    const pl = G.U.pick(players.filter(p => !p.dead).length ? players.filter(p => !p.dead) : players);
    G.Sprites.preload([dex]);
    const def = { dex, name: mon.name, behavior: 'thief', hp: Math.round(60 * (1 + time / 95) * (gold ? 1.5 : 1)),
                  spd: 92, dmg: 0, xp: 10, loot: gold ? 'ticket10' : 'coins' };
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * 6.2832, d = G.U.rand(230, 300);
      const x = pl.x + Math.cos(a) * d, y = pl.y + Math.sin(a) * d * 0.8;
      if (!G.World.isFree(x, y, 14)) continue;
      const e = new G.Enemy(def, x, y, { hp: 1, spd: 1, dmg: 1 });
      e.life = THIEF_LIFE;
      G.EnemyMgr.add(e);
      G.FX.ring(x, y, 4, 40, '#ffd23f', 0.5, 3);
      G.Spawner.say(gold ? '¡Un ' + mon.name + ' con un ticket ×10! ¡Atrápalo antes de que huya!'
                         : '¡Un ' + mon.name + ' cargado de monedas! ¡Atrápalo antes de que huya!', 3.2);
      G.Audio.sfx('shiny');
      return;
    }
  }

  // ---------------- Munchlax hambriento ----------------

  function spawnMunch(players) {
    if (!G.SPRITE_META[MUNCH_DEX]) return false;
    const alive = players.filter(p => !p.dead);
    const pl = G.U.pick(alive.length ? alive : players);
    let at = null;
    for (let i = 0; i < 20 && !at; i++) {
      const a = Math.random() * 6.2832, d = G.U.rand(220, 300);
      const x = pl.x + Math.cos(a) * d, y = pl.y + Math.sin(a) * d * 0.8;
      if (G.World.isFree(x, y, 18)) at = [x, y];
    }
    if (!at) return false;
    const want = G.U.pick(MB);
    // 4 de la que pide (hacen falta 3), 2 enjambres y el resto de otras.
    const kinds = [want, want, want, want, 'combee', 'combee'];
    while (kinds.length < BUSHES) kinds.push(G.U.pick(MB.filter(k => k !== want)));
    kinds.sort(() => Math.random() - 0.5);
    const bushes = [];
    for (let i = 0, tries = 0; i < BUSHES && tries < 200; tries++) {
      const a = Math.random() * 6.2832, d = G.U.rand(170, 560);
      const x = at[0] + Math.cos(a) * d, y = at[1] + Math.sin(a) * d * 0.85;
      if (!G.World.isFree(x, y, 20) || bushes.some(b => G.U.dist2(b.x, b.y, x, y) < 90 * 90)) continue;
      // show: la baya que se le ve (25-11-2026, como el juego oficial: se ve qué bayas tiene cada uno). Los del
      // enjambre también enseñan una, cualquiera: por eso hay que tener cuidado.
      const kind = kinds[i++];
      bushes.push({ x: Math.round(x), y: Math.round(y), kind, show: kind === 'combee' ? G.U.pick(MB) : kind, shaken: false });
    }
    if (bushes.length < 6) return false;
    makeMunch({ x: at[0], y: at[1], want, bushes });
    G.Sprites.preload([MUNCH_DEX, COMBEE]);
    return true;
  }

  function makeMunch(o) {
    munch = Object.assign({ got: 0, carry: { oran: 0, cheri: 0, rawst: 0, aspear: 0 }, t: 0, netT: 0, nagT: 0,
                            anim: new G.Sprites.Animator(MUNCH_DEX, 1), r: G.Sprites.bodyRadius(MUNCH_DEX) }, o);
  }

  function munchTick(dt, players) {
    const M = munch;
    M.t += dt;
    M.anim.update(dt);
    M.anim.loop('Idle');
    if (!authority()) return;
    if (G.Rift.inArena) return;                     // (os espera mientras estáis en la grieta)
    if (M.nagT > 0) M.nagT -= dt;
    for (const p of players) {
      if (p.dead) continue;
      // Pasar por encima de un arbusto lo sacude.
      for (let i = 0; i < M.bushes.length; i++) {
        const b = M.bushes[i];
        if (b.shaken || G.U.dist2(p.x, p.y, b.x, b.y) > (p.r + 22) ** 2) continue;
        b.shaken = true;
        shake(i, b);
      }
      // Llegar a Munchlax con bayas.
      if (G.U.dist2(p.x, p.y, M.x, M.y) < (p.r + M.r + 22) ** 2) {
        const n = Math.min(M.carry[M.want], MUNCH_NEED - M.got);
        if (n > 0) {
          M.carry[M.want] -= n; M.got += n;
          G.FX.burst(M.x, M.y - 16, MB_COL[M.want], 16, 140);
          G.Audio.sfx('confirm');
          if (M.got >= MUNCH_NEED) return munchDone();
          say(G.I18n.f('¡Ñam! Munchlax quiere {x} más', MUNCH_NEED - M.got), 2.4);
        } else if (M.nagT <= 0) {
          M.nagT = 4;
          say(G.I18n.f('Munchlax quiere {x}', G.T(MB_PL[M.want])), 2.4);
        }
      }
    }
    if (M.t > MUNCH_TIME) return munchGone('Munchlax se ha cansado de esperar y se ha dormido…');
    if (G.Coop.isHost && (M.netT -= dt) <= 0) { M.netT = 0.25; G.Coop.broadcast(munchNet()); }
  }

  /** Se ha sacudido un arbusto (lo decide quien manda). */
  function shake(i, b) {
    G.FX.burst(b.x, b.y - 14, '#5fe08a', 14, 120);
    G.Audio.sfx('break');
    if (b.kind === 'combee') {
      const t = G.Game.st.time, def = G.Enemies.defOf(COMBEE, t);
      if (def) {
        const n = G.Game.everyone().length;
        const sc = Object.assign({}, G.Enemies.scale(t), { hp: G.Enemies.scale(t).hp * G.Coop.scaleHp(n) });
        for (let k = 0; k < 6; k++) {
          const a = k / 6 * 6.2832, x = b.x + Math.cos(a) * 46, y = b.y + Math.sin(a) * 36;
          G.EnemyMgr.add(new G.Enemy(Object.assign({}, def, { behavior: 'chase' }), x, y, sc));
        }
      }
      say('¡Un enjambre de Combee!', 2.2);
    } else {
      munch.carry[b.kind]++;
      G.FX.dmgText(b.x, b.y - 30, G.T(MB_NAME[b.kind]), MB_COL[b.kind], true);
    }
    if (G.Coop.isHost) G.Coop.broadcast(munchNet());
  }

  /** Estado para los demás: ['ev', 'mp', x, y, want, got, t, carry×4, arbustos (x, y, sacudido)…] */
  function munchNet() {
    const M = munch;
    return ['ev', 'mp', Math.round(M.x), Math.round(M.y), M.want, M.got, Math.round(M.t), ...MB.map(k => M.carry[k]),
            ...M.bushes.flatMap(b => [b.x, b.y, (b.shaken ? 1 : 0) + 2 * (MB.indexOf(b.show) + 1)])];   // (sacudido + 2 × la baya que se ve)
  }

  function munchDone() {
    if (G.Coop.isHost) G.Coop.broadcast(['ev', 'mw']);
    munchReward();
    munch = null;
    end();
  }
  /** En cada ordenador: un objeto y un Caramelo Exp. para ti. */
  function munchReward() {
    const pl = G.Game.player;
    if (munch) { G.FX.burst(munch.x, munch.y - 16, '#ffd23f', 30, 200); G.FX.ring(munch.x, munch.y, 6, 80, '#ffd23f', 0.6, 4); }
    G.Audio.sfx('legend');
    say('¡Munchlax está lleno! Te regala un objeto y un Caramelo Exp.', 3.2);
    if (!pl || pl.dead) return;
    G.Consum.take(pl, 'rarecandy');
    G.Game.giveItem(G.Items.roll(pl.items));
  }
  function munchGone(msg) {
    if (G.Coop.isHost) G.Coop.broadcast(['ev', 'mx', msg]);
    say(msg, 3);
    munch = null;
    end();
  }

  // ---------------- Pokémon perdido ----------------

  function spawnLost(players) {
    const alive = players.filter(p => !p.dead);
    const pl = G.U.pick(alive.length ? alive : players);
    const pool = G.DEX.filter(p => p.rarity <= 3 && !p.leg && G.SPRITE_META[p.dex] && !G.Sprites.hovers(p.dex));
    const mon = G.U.pick(pool);
    let at = null, to = null;
    for (let i = 0; i < 20 && !at; i++) {
      const a = Math.random() * 6.2832, d = G.U.rand(220, 300);
      const x = pl.x + Math.cos(a) * d, y = pl.y + Math.sin(a) * d * 0.8;
      if (G.World.isFree(x, y, 16)) at = [x, y];
    }
    for (let i = 0; i < 30 && at && !to; i++) {
      const a = Math.random() * 6.2832, d = G.U.rand(700, 850);
      const x = at[0] + Math.cos(a) * d, y = at[1] + Math.sin(a) * d * 0.85;
      if (G.World.isFree(x, y, 30)) to = [x, y];
    }
    if (!at || !to) return false;
    makeLost({ dex: mon.dex, x: at[0], y: at[1], tx: to[0], ty: to[1], state: 'wait', hp: 100, grant: Math.random() < 0.2 });
    G.Sprites.preload([mon.dex]);
    return true;
  }

  function makeLost(o) {
    const mon = G.DEX_BY[o.dex];
    lost = Object.assign({ name: mon ? mon.name : '', maxHp: 100, t: 0, hitCd: 0, netT: 0, follow: null,
                           anim: new G.Sprites.Animator(o.dex, 1), r: G.Sprites.bodyRadius(o.dex) }, o);
  }

  function lostTick(dt, players) {
    const L = lost;
    L.t += dt;
    L.anim.update(dt);
    if (!authority()) { L.anim.loop(L.moving ? 'Walk' : 'Idle'); return; }
    // En la grieta te espera quieto, y el reloj no corre (como el oficial del 18-11: antes se iba andando).
    if (G.Rift.inArena) { L.t -= dt; L.moving = false; L.anim.loop('Idle'); return; }

    if (L.state === 'wait') {
      const p = players.find(o => !o.dead && G.U.dist2(o.x, o.y, L.x, L.y) < (o.r + L.r + 18) ** 2);
      if (p) { L.state = 'follow'; L.follow = p; say('¡' + L.name + ' te sigue! Llévalo a la marca verde', 3, '#7dffb0'); G.Audio.sfx('confirm'); }
      L.moving = false;
    } else {
      const p = L.follow && !L.follow.dead ? L.follow : players.find(o => !o.dead) || L.follow;
      const d = G.U.dist(L.x, L.y, p.x, p.y), keep = p.r + L.r + 14;
      L.moving = d > keep;
      if (L.moving) {
        const sp = Math.min(d - keep, Math.max(120, p.spd * 1.15) * dt);
        const [nx, ny] = G.U.norm(p.x - L.x, p.y - L.y);
        L.x += nx * sp; L.y += ny * sp;
        G.World.collide(L);
        L.anim.dir = G.Sprites.dirFromAngle(Math.atan2(ny, nx));
      }
      if (G.U.dist2(L.x, L.y, L.tx, L.ty) < 56 * 56) return rescued();
    }
    L.anim.loop(L.moving ? 'Walk' : 'Idle');

    // Los enemigos que lo tocan le hacen daño.
    if ((L.hitCd -= dt) <= 0) {
      const hits = G.EnemyMgr.queryCircle(L.x, L.y, L.r).filter(e => !e.dead && e.behavior !== 'thief');
      if (hits.length) {
        L.hitCd = 0.5;
        L.hp -= Math.min(30, hits.reduce((a, e) => a + 4 + e.dmg * 0.12, 0));
        L.flash = 0.1;
        G.FX.burst(L.x, L.y - 10, '#ff5f6d', 4, 60);
        if (L.hp <= 0) return gone('¡' + L.name + ' se ha asustado y ha huido…!');
      }
    }
    if (L.flash > 0) L.flash -= dt;
    if (L.t > LOST_TIME) return gone(L.name + ' se ha cansado de esperar y se ha ido…');

    if (G.Coop.isHost && (L.netT -= dt) <= 0) {
      L.netT = 0.1;
      G.Coop.broadcast(['ev', 'lp', L.dex, Math.round(L.x), Math.round(L.y), Math.round(L.hp), L.state === 'follow' ? 1 : 0,
                        Math.round(L.tx), Math.round(L.ty), L.anim.dir, L.moving ? 1 : 0]);
    }
  }

  function rescued() {
    const L = lost;
    for (let i = 0; i < 12; i++) G.Pickups.drop('coin', L.tx + G.U.rand(-40, 40), L.ty + G.U.rand(-30, 30), 5);
    G.Pickups.drop('ticket', L.tx, L.ty - 12, 1);
    if (G.Coop.isHost) G.Coop.broadcast(['ev', 'rw', L.dex, L.grant ? 1 : 0]);
    reward(L.dex, L.grant);
    lost = null;
    end();
  }

  /** En cada ordenador: cura, y si toca, el Pokémon se une a tu colección. */
  function reward(dex, grant) {
    const pl = G.Game.player;
    if (pl && !pl.dead) { pl.heal(pl.maxHp * 0.5); G.FX.ring(pl.x, pl.y, 6, 70, '#5fe08a', 0.5, 3); }
    const name = (G.DEX_BY[dex] || {}).name || '';
    G.FX.burst(lost ? lost.tx : pl.x, lost ? lost.ty - 10 : pl.y, '#7dffb0', 24, 180);
    G.Audio.sfx('legend');
    if (grant && G.onRescue) G.onRescue(dex, name);
    else say('¡Has llevado a ' + name + ' a casa! Te lo agradece', 3.2, '#7dffb0');
  }

  function gone(msg) {
    if (G.Coop.isHost) G.Coop.broadcast(['ev', 'lx', msg]);
    say(msg, 3);
    lost = null;
    end();
  }

  /**
   * Otro pasa a llevar la partida a mitad (cambio de anfitrión, coop.js): el evento
   * que hubiera (horda, hora dorada, Pokémon perdido) se da por acabado; de él sólo
   * había aquí un resumen, no lo que hace falta para seguirlo.
   */
  function adopt() {
    lost = null; munch = null;
    if (cur) { cur = null; if (G.Coop.isHost) G.Coop.broadcast(['ev', 'e']); }
    nextT = Math.max(nextT, 20);
  }

  // ---------------- red ----------------

  function onNet(ev) {
    switch (ev[1]) {
      case 's': cur = { id: ev[2], t: 0, dur: ev[2] === 'lost' || ev[2] === 'munch' ? Infinity : DUR, type: ev[3] || null }; break;
      case 'e': cur = null; break;
      case 'lp': {
        const [, , dex, x, y, hp, follow, tx, ty, dir, moving] = ev;
        if (!lost || lost.dex !== dex) makeLost({ dex, x, y, tx, ty, hp, state: follow ? 'follow' : 'wait' });
        Object.assign(lost, { x, y, hp, tx, ty, moving: !!moving, state: follow ? 'follow' : 'wait' });
        lost.anim.dir = dir;
        break;
      }
      case 'rw': reward(ev[2], !!ev[3]); lost = null; break;
      case 'lx': say(ev[2], 3); lost = null; break;
      case 'mp': {
        const [, , x, y, want, got, t] = ev, carry = ev.slice(7, 11), bs = ev.slice(11), bushes = [];
        if (!MB.includes(want)) break;
        for (let i = 0; i + 2 < bs.length; i += 3) { const v = bs[i + 2] | 0; bushes.push({ x: bs[i], y: bs[i + 1], shaken: !!(v & 1), show: MB[(v >> 1) - 1] || null }); }
        if (!munch) { makeMunch({ x, y, want, bushes }); G.Sprites.preload([MUNCH_DEX]); }
        Object.assign(munch, { x, y, want, got, t, bushes });
        MB.forEach((k, i) => { munch.carry[k] = carry[i] | 0; });
        break;
      }
      case 'mw': munchReward(); munch = null; break;
      case 'mx': say(ev[2], 3); munch = null; break;
    }
  }

  // ---------------- dibujo ----------------

  /** El Pokémon perdido y la marca, para ordenarlos por Y con el resto. */
  function drawables() {
    const out = munchDrawables();
    if (!lost) return out;
    const L = lost;
    const now = performance.now() / 1000;
    const goal = {
      y: L.ty - 4000,          // en el suelo, debajo de todo
      draw(ctx) {
        const k = 0.5 + Math.sin(now * 4) * 0.5;
        ctx.save();
        ctx.globalAlpha = 0.25 + k * 0.15;
        ctx.fillStyle = '#5fe08a';
        ctx.beginPath(); ctx.ellipse(L.tx, L.ty, 56, 40, 0, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.ellipse(L.tx, L.ty, 56, 40, 0, 0, 6.2832); ctx.stroke();
        ctx.restore();
        G.Icons.draw(ctx, 'heart', Math.round(L.tx - 8), Math.round(L.ty - 30 - k * 6), 16);
      }
    };
    const mon = {
      y: L.y,
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#7dffb0';
        ctx.beginPath(); ctx.ellipse(L.x, L.y, L.r * 1.5, L.r * 0.6, 0, 0, 6.2832); ctx.fill();
        ctx.restore();
        G.Sprites.drawShadow(ctx, L.dex, L.x, L.y, 1);
        L.anim.draw(ctx, L.x, L.y, { flash: L.flash > 0 });
        const h = G.Sprites.bodyHeight(L.dex, 1);
        if (L.state === 'wait') {
          // "!" que bota encima: está esperando a que lo toques.
          const by = L.y - h - 14 - Math.abs(Math.sin(now * 5)) * 6;
          ctx.save();
          ctx.font = '700 16px Pixelify, monospace'; ctx.textAlign = 'center';
          ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.strokeText('!', L.x, by);
          ctx.fillStyle = '#7dffb0'; ctx.fillText('!', L.x, by);
          ctx.restore();
        }
        const w = 30, y = L.y - h - 6;
        ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(L.x - w / 2, y, w, 3.4);
        ctx.fillStyle = '#5fe08a'; ctx.fillRect(L.x - w / 2, y, w * Math.max(0, L.hp / L.maxHp), 3.4);
      }
    };
    return out.concat([goal, mon]);
  }

  /** Iconos de las bayas de los arbustos (los dibuja icons.js: 'mb:oran'…). */
  function berryIcons() {
    const UI = G.Icons.UI;
    for (const k of MB) if (!UI['mb:' + k]) {
      const c = MB_COL[k];
      UI['mb:' + k] = { pal: { r: c, s: '#00000055', w: '#ffffff', g: '#5fe08a', d: '#2f9a52' }, rows: UI.berry.rows };
    }
  }

  function munchDrawables() {
    if (!munch) return [];
    berryIcons();
    const M = munch, now = performance.now() / 1000, out = [];
    for (const b of M.bushes) {
      out.push({ y: b.y, draw(ctx) {
        const sh = b.shaken, wig = sh ? 0 : Math.sin(now * 3 + b.x) * 1.5;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,.28)';
        ctx.beginPath(); ctx.ellipse(b.x, b.y, 22, 8, 0, 0, 6.2832); ctx.fill();
        const greens = sh ? ['#3d7a45', '#4f9455'] : ['#2f8a3e', '#43b052', '#62cf6a'];
        const blobs = sh ? [[-10, -8, 11], [9, -7, 10], [0, -12, 10]] : [[-12, -10, 13], [12, -10, 13], [0, -18, 15], [0, -8, 14]];
        blobs.forEach(([dx, dy, r], i) => {
          ctx.fillStyle = greens[i % greens.length];
          ctx.beginPath(); ctx.arc(b.x + dx + wig, b.y + dy, r, 0, 6.2832); ctx.fill();
          ctx.strokeStyle = '#1b3a22'; ctx.lineWidth = 1.5; ctx.stroke();
        });
        if (!sh) {                                   // sus bayas, del color de la que tiene (o la que enseña el enjambre)
          ctx.fillStyle = b.show ? MB_COL[b.show] : '#ffffffaa';
          ctx.strokeStyle = '#1b3a22'; ctx.lineWidth = 1;
          for (const [dx, dy] of [[-8, -14], [7, -18], [2, -6]]) { ctx.beginPath(); ctx.arc(b.x + dx + wig, b.y + dy, 3, 0, 6.2832); ctx.fill(); ctx.stroke(); }
        }
        ctx.restore();
      } });
    }
    out.push({ y: M.y, draw(ctx) {
      G.Sprites.drawShadow(ctx, MUNCH_DEX, M.x, M.y, 1);
      M.anim.draw(ctx, M.x, M.y, {});
      // Bocadillo: la baya que pide y cuántas lleva.
      const h = G.Sprites.bodyHeight(MUNCH_DEX, 1), by = M.y - h - 30 - Math.abs(Math.sin(now * 3)) * 3;
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = '#1b1528'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(M.x - 30, by - 14, 60, 26, 8) : ctx.rect(M.x - 30, by - 14, 60, 26); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(M.x - 5, by + 12); ctx.lineTo(M.x, by + 19); ctx.lineTo(M.x + 5, by + 12); ctx.fill();
      G.Icons.draw(ctx, 'mb:' + M.want, M.x - 26, by - 10, 18);
      ctx.font = '800 12px Pixelify,"Segoe UI",system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#1b1528';
      ctx.fillText(M.got + '/' + MUNCH_NEED, M.x - 4, by + 4);
      ctx.restore();
    } });
    return out;
  }

  /** Flecha en el borde hacia el Pokémon perdido (o hacia la marca, si ya te sigue). */
  function drawHud(ctx, w, h, pl, F) {
    const cam = G.Camera;
    if (munch) {
      const M = munch, left = Math.max(0, Math.ceil(MUNCH_TIME - M.t));
      const carry = M.carry[M.want] || 0;
      // Con bayas de las que pide: a Munchlax; si no, al arbusto más cercano sin sacudir.
      let to = [M.x, M.y - 10], label = 'Munchlax';
      if (!(carry > 0)) {
        let bd = Infinity;
        for (const b of M.bushes) if (!b.shaken) { const d = G.U.dist2(pl.x, pl.y, b.x, b.y); if (d < bd) { bd = d; to = [b.x, b.y - 10]; label = G.T('Arbusto'); } }
      }
      edgeArrow(ctx, w, h, cam, to[0], to[1], '#ffd23f', label + ' · ' + Math.round(G.U.dist(pl.x, pl.y, to[0], to[1]) / 32) + ' m', F);
      berryIcons();
      const txt = G.I18n.f('MUNCHLAX · {x}/{x} · {x} s', M.got, MUNCH_NEED, left);
      ctx.save();
      ctx.font = F(800, 12); ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.strokeText(txt, w / 2, 112);
      ctx.fillStyle = '#ffd23f'; ctx.fillText(txt, w / 2, 112);
      // Lo que lleva el grupo: la que pide primero.
      let x = w / 2 - 52;
      for (const k of [M.want, ...MB.filter(k => k !== M.want)]) {
        if (!M.carry[k] && k !== M.want) continue;
        G.Icons.draw(ctx, 'mb:' + k, x, 120, 16);
        ctx.font = F(800, 11); ctx.textAlign = 'left'; ctx.lineWidth = 3; ctx.strokeText('×' + (M.carry[k] || 0), x + 17, 133);
        ctx.fillStyle = k === M.want ? '#ffd23f' : '#c9d2e3'; ctx.fillText('×' + (M.carry[k] || 0), x + 17, 133);
        x += 40;
      }
      ctx.restore();
    }
    if (lost) {
      const L = lost, to = L.state === 'wait' ? [L.x, L.y - 10] : [L.tx, L.ty];
      edgeArrow(ctx, w, h, cam, to[0], to[1], '#7dffb0', (L.state === 'wait' ? L.name : 'Marca') + ' · ' +
                Math.round(G.U.dist(pl.x, pl.y, to[0], to[1]) / 32) + ' m', F);
    }
    for (const e of G.EnemyMgr.all()) {
      if (e.behavior === 'thief' && !e.dead) edgeArrow(ctx, w, h, cam, e.x, e.y - 10, '#ffd23f', e.name, F);
    }
    if (cur && cur.id !== 'lost' && cur.id !== 'munch') {
      const left = Math.max(0, Math.ceil(cur.dur - cur.t));
      const txt = (cur.id === 'gold' ? 'HORA DORADA' : 'HORDA ' + G.U.TYPE_NAME[cur.type].toUpperCase()) + ' · ' + left + ' s';
      ctx.save();
      ctx.font = F(800, 12); ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.8)';
      ctx.strokeText(txt, w / 2, 112);
      ctx.fillStyle = cur.id === 'gold' ? '#ffd23f' : G.U.TYPE_COLOR[cur.type] || '#fff';
      ctx.fillText(txt, w / 2, 112);
      ctx.restore();
    }
  }

  function edgeArrow(ctx, w, h, cam, x, y, col, label, F) {
    const sx = (x - cam.left()) * cam.scale, sy = (y - cam.top()) * cam.scale;
    if (sx > 0 && sx < w && sy > 0 && sy < h) return;
    const M = 44, ex = G.U.clamp(sx, M, w - M), ey = G.U.clamp(sy, M + 70, h - M - 80);
    const a = Math.atan2(sy - ey, sx - ex), ca = Math.cos(a), sa = Math.sin(a);
    const pulse = 0.65 + Math.sin(performance.now() / 160) * 0.35;
    ctx.save();
    ctx.translate(ex, ey);
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.moveTo(ca * 30, sa * 30);
    ctx.lineTo(Math.cos(a + 2.45) * 15, Math.sin(a + 2.45) * 15);
    ctx.lineTo(Math.cos(a - 2.45) * 15, Math.sin(a - 2.45) * 15);
    ctx.closePath();
    ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke();
    ctx.fillStyle = col; ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = F(800, 11);
    ctx.textAlign = ca > 0.3 ? 'right' : ca < -0.3 ? 'left' : 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.85)';
    ctx.strokeText(label, -ca * 26, -sa * 24 + 4);
    ctx.fillStyle = col; ctx.fillText(label, -ca * 26, -sa * 24 + 4);
    ctx.restore();
  }

  return {
    reset, update, bag, onNet, adopt, drawables, drawHud,
    get golden() { return !!cur && cur.id === 'gold'; },
    get current() { return cur ? cur.id : null; },
    /** Para pruebas. */
    debugStart(id) { start(id, G.Game.st.time, G.Game.everyone()); },
    debugThief() { spawnThief(G.Game.everyone(), G.Game.st.time); },
    /** Copia local (bot y pruebas): Munchlax, la baya que pide, las que lleva el grupo y los arbustos. */
    get munchInfo() {
      if (!munch) return null;
      const M = munch;
      return { x: M.x, y: M.y, want: M.want, got: M.got, need: MUNCH_NEED, carry: M.carry[M.want] || 0, t: M.t,
               bushes: M.bushes.map(b => ({ x: b.x, y: b.y, shaken: b.shaken, kind: authority() ? b.kind : null, show: b.show || null })) };
    },
    _dbg() { return lost && { x: lost.x, y: lost.y, tx: lost.tx, ty: lost.ty, state: lost.state, hp: lost.hp }; },
    /** Copia local (bot): el Pokémon perdido, dónde está la marca y si te sigue a ti. */
    get lostInfo() {
      if (!lost) return null;
      const pl = G.Game.player;
      // (en grupo, el invitado no sabe a quién sigue: se da por suyo si está pegado a él)
      const mine = lost.follow ? lost.follow === pl : lost.state === 'follow' && !!pl && G.U.dist(pl.x, pl.y, lost.x, lost.y) < 120;
      return { x: lost.x, y: lost.y, tx: lost.tx, ty: lost.ty, state: lost.state, mine, hp: lost.hp };
    }
  };
})();
