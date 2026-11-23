/* ============ powers.js — los poderes: Megaevolución, Dinamax, Pulsera Z y Teracristal ============
 * (23-11-2026; como la Gran Actualización del juego oficial, hecho aquí a partir de su guía de
 *  poderes.) Al vencer a Eternatus (minuto 20, systems/eternatus.js) eliges UN poder para el resto
 * de la partida. Se usa con F (en el mando, B; en el móvil, su botón redondo, que sale cuando está
 * listo), dura unos segundos y se recarga solo. En grupo, cada uno elige el suyo.
 *
 *   Poder                 Dura      Recarga  Qué hace
 *   Megaevolución          40 s      90 s    su forma Mega (o fusión / forma de poder): tipos, aspecto y
 *                                            stats de esa forma, en proporción a lo que llevas; la vida no cambia
 *   Dinamax                12 s      80 s    gigante, doble de vida, +40 % de daño, cada golpe salpica,
 *                                            rompe lo que pisa y aplasta a los Pokémon normales
 *   Pulsera Z              15 s + Z  60 s    cada 0,8 s rueda una gran Z de su tipo que lo atraviesa todo;
 *                                            al acabar, el movimiento Z golpea a todos los de la pantalla
 *   Teracristal            30 s      75 s    pasa a ser sólo del tipo que elijas: sus ataques de ese tipo
 *                                            pegan ×1,5 (×1,8 si ya era de ese tipo); Astral: los conserva y todo ×1,3
 *
 * La barra del poder va debajo de tu vida (ui/hud.js). La carta Poder rápido (levelup.js) acorta la
 * recarga. Gigamax: no hay sprites de esas formas, así que todos van con Dinamax.
 * Cooperativo: lo de cada uno va en su ordenador; los demás ven su forma Mega (por su Pokémon,
 * coop.js syncDex) y el tamaño Dinamax o la corona Tera (pw, en el estado de cada jugador).
 */
G.Powers = (() => {
  const DEF = {
    mega: { dur: 40, cd: 90, icon: 'star',   color: '#ff8ad8', name: 'Megaevolución' },
    dyna: { dur: 12, cd: 80, icon: 'up',     color: '#ff3b5c', name: 'Dinamax' },
    z:    { dur: 15, cd: 60, icon: 'cursor', color: '#ffd23f', name: 'Pulsera Z' },
    tera: { dur: 30, cd: 75, icon: 'shield', color: '#7fe0ff', name: 'Teracristal' }
  };
  // Formas de poder que no se llaman «Mega» ni «Primal» (van en la misma carta que la Mega).
  const POWER_FORMS = /^(Mega |Primal |Origin |White |Black |Ultra |Zacian Crowned|Zamazenta Crowned|Zygarde Complete|Hoopa Unbound|Eternatus Eternamax|Terastal )/;
  // Las que traen su clima al megaevolucionar (lo pone quien manda; en grupo, el anfitrión).
  const WEATHER = { 382: 'rain', 383: 'sun', 248: 'sand', 460: 'snow', 478: 'snow' };
  const TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
  const F = (wt, s) => `${wt} ${s}px Pixelify,"Segoe UI",system-ui,sans-serif`;

  let pending = null;        // jugador al que hay que ofrecerle el poder en cuanto se pueda

  // ---------------- elegir ----------------

  /** Formas de poder de un Pokémon (entradas de G.DEX con sprites). */
  function megaForms(dex) {
    const base = dex > 1025 ? dex % 1000 : dex;
    return G.DEX.filter(p => p.dex > 1025 && p.dex % 1000 === base && p.dex !== dex && POWER_FORMS.test(p.name) && G.SPRITE_META[p.dex]);
  }
  /** Los tipos que tiene sentido elegir (Z y Tera): los de sus ataques y los suyos, el del mejor ataque primero. */
  function typeChoices(pl) {
    const best = bestMove(pl), out = [];
    const add = t => { if (t && TYPES.includes(t) && !out.includes(t)) out.push(t); };
    if (best) add(best.type);
    for (const m of pl.moves) if (m.kind !== 'buff') add(m.type);
    for (const t of pl.mon.types) add(t);
    return out.slice(0, 8);
  }

  /** Tras vencer a Eternatus: se ofrece en cuanto no haya otra elección abierta (ver update). */
  function offer(pl) { if (pl && !pl.powerId) pending = pl; }

  function showOffer(pl) {
    pending = null;
    const forms = megaForms(pl.dex);
    const cards = [];
    if (forms.length) {
      const fusion = forms.every(f => !/^(Mega|Primal) /.test(f.name));
      cards.push(card('mega', fusion ? 'Fusión / Cambio de forma' : 'Megaevolución',
        G.I18n.f('{x} cambia a su forma de poder: tipos, aspecto y stats nuevos durante {x} s.', G.T(pl.mon.name, 'mon'), DEF.mega.dur), forms[0].dex));
    }
    cards.push(card('dyna', 'Dinamax', G.I18n.f('Gigante {x} s: doble de vida, +40 % de daño, salpica, rompe lo que pisa y aplasta a los Pokémon normales.', DEF.dyna.dur)));
    cards.push(card('z', 'Pulsera Z', G.I18n.f('{x} s lanzando grandes Z de un tipo y, al final, un movimiento Z a toda la pantalla.', DEF.z.dur)));
    cards.push(card('tera', 'Teracristal', G.I18n.f('{x} s del tipo que elijas: sus ataques de ese tipo pegan mucho más.', DEF.tera.dur)));
    G.Game.choose(done => {
      G.RunUI.showChoice('¡Elige tu poder!', 'Uno para el resto de la partida · se usa con F (en el mando, B)', cards, c => {
        if (c.id === 'mega' && forms.length > 1) return pickForm(pl, forms, done);
        if (c.id === 'z' || c.id === 'tera') return pickType(pl, c.id, done);
        set(pl, c.id, c.arg); done();
      });
    });
  }
  function card(id, title, desc, dex) {
    return { id, arg: dex || 0, key: 'power:' + id, title, desc, icon: DEF[id].icon, color: DEF[id].color, tag: 'Poder', dex };
  }
  function pickForm(pl, forms, done) {
    G.RunUI.showChoice('¿Qué forma?', G.T(pl.mon.name, 'mon'), forms.map(f => ({ id: 'mega', arg: f.dex, key: 'power:mega:' + f.dex, dex: f.dex,
      title: G.T(f.name, 'mon'), desc: f.types.map(t => G.U.TYPE_NAME[t]).join(' / '), icon: 'star', color: DEF.mega.color, tag: 'Forma' })),
      c => { set(pl, 'mega', c.arg); done(); });
  }
  function pickType(pl, id, done) {
    const types = typeChoices(pl);
    const cards = types.map(t => ({ id, arg: t, key: 'power:' + id + ':' + t, title: G.U.TYPE_NAME[t], icon: 'type:' + t, color: G.U.TYPE_COLOR[t], tag: id === 'z' ? 'Pulsera Z' : 'Teracristal',
      desc: id === 'z' ? G.I18n.f('Las Z y el movimiento Z serán de tipo {x}.', G.U.TYPE_NAME[t])
                       : pl.mon.types.includes(t) ? G.I18n.f('Sólo de tipo {x}: sus ataques de ese tipo, ×1,8.', G.U.TYPE_NAME[t])
                       : G.I18n.f('Sólo de tipo {x}: sus ataques de ese tipo, ×1,5.', G.U.TYPE_NAME[t]) }));
    if (id === 'tera') cards.push({ id, arg: 'stellar', key: 'power:tera:stellar', title: 'Astral', icon: 'star', color: '#ffffff', tag: 'Teracristal',
      desc: 'Conserva sus tipos y todos sus ataques pegan ×1,3.' });
    G.RunUI.showChoice(id === 'z' ? 'Pulsera Z: ¿de qué tipo?' : 'Teracristal: ¿qué tipo?', '', cards, c => { set(pl, id, c.arg); done(); });
  }

  function set(pl, id, arg) {
    pl.powerId = id; pl.powerArg = arg; pl.powerCd = 0; pl.powerOn = false; pl.powerT = 0;
    pl.powerCdMul = pl.powerCdMul || 1;
    G.Audio.sfx('legend');
    G.Spawner.say(G.I18n.f('¡Poder: {x}! Úsalo con F', G.T(DEF[id].name)), 3, true);
  }

  // ---------------- usar ----------------

  const ready = pl => !!(pl && pl.powerId && !pl.powerOn && !(pl.powerCd > 0) && !pl.dead);

  function use(pl) {
    if (!ready(pl) || G.Judgment.cinematic) return false;
    const d = DEF[pl.powerId];
    pl.powerOn = true; pl.powerT = d.dur;
    if (pl.powerId === 'mega') megaOn(pl, pl.powerArg);
    else if (pl.powerId === 'dyna') dynaOn(pl);
    else if (pl.powerId === 'z') { pl.zT = 0; }
    else if (pl.powerId === 'tera') teraOn(pl, pl.powerArg);
    G.Game.flash(d.color, 0.5);
    G.Camera.kick(0.7);
    G.Audio.sfx('legend');
    G.FX.ring(pl.x, pl.y, pl.r, 160, d.color, 0.7, 6);
    G.FX.burst(pl.x, pl.y - pl.bodyH * 0.5, d.color, 40, 260);
    return true;
  }

  /** Se acaba (por tiempo, al caer o al evolucionar). */
  function stop(pl, quiet) {
    if (!pl || !pl.powerOn) return;
    const id = pl.powerId;
    if (id === 'mega') megaOff(pl);
    else if (id === 'dyna') dynaOff(pl);
    else if (id === 'z' && !quiet && !pl.dead) zMove(pl);
    else if (id === 'tera') teraOff(pl);
    pl.powerOn = false; pl.powerT = 0;
    pl.powerCd = DEF[id].cd * (pl.powerCdMul || 1);
  }

  /** Cada fotograma, con tu Pokémon. */
  function update(dt, pl) {
    if (!pl) return;
    if (pending === pl && G.Game.state === 'playing' && !['scr-levelup', 'scr-item', 'scr-bond', 'scr-pause', 'scr-power'].some(G.UI.isOpen)) showOffer(pl);
    if (!pl.powerId) return;
    if (pl.powerOn) {
      if (pl.dead) { stop(pl, true); return; }
      pl.powerT -= dt;
      if (pl.powerId === 'z' && (pl.zT -= dt) <= 0) { pl.zT = 0.8; rollZ(pl); }
      if (pl.powerId === 'dyna') dynaTick(pl);
      if (pl.powerT <= 0) stop(pl);
    } else if (pl.powerCd > 0) pl.powerCd -= dt;
  }

  // ---------------- Megaevolución ----------------

  function megaOn(pl, dex) {
    const to = G.DEX_BY[dex], from = G.DEX_BY[pl.dex];
    if (!to || !from) return;
    pl.megaSave = { mon: pl.mon, dex: pl.dex, anim: pl.anim, scale: pl.scale, r: pl.r, bodyH: pl.bodyH, baseAtk: pl.baseAtk, baseSpd: pl.baseSpd, shiny: pl.shiny };
    const k = key => (from[key] ? to[key] / from[key] : 1), was = pl.mon.name;
    const m = Object.assign({}, to, { hp: pl.mon.hp, spd: pl.mon.spd * k('spd'), pa: pl.mon.pa * k('pa'), sa: pl.mon.sa * k('sa'), df: pl.mon.df * k('df'), sd: pl.mon.sd * k('sd') });
    m.atk = Math.max(m.pa, m.sa);
    pl.mon = m;
    pl.baseAtk *= to.atk / Math.max(0.01, from.atk);
    pl.baseSpd *= k('spd');
    look(pl, dex, G.Sprites.playerScale(dex));
    const w = WEATHER[dex % 1000];
    if (w && (!G.Coop.active || G.Coop.isHost)) G.Weather.debugStart(w, DEF.mega.dur);
    G.Spawner.say(G.I18n.f('¡{x} megaevoluciona!', G.T(was, 'mon')), 2.4, true);
  }
  function megaOff(pl) {
    const s = pl.megaSave;
    if (!s) return;
    pl.mon = s.mon; pl.dex = s.dex; pl.anim = s.anim; pl.scale = s.scale; pl.r = s.r; pl.bodyH = s.bodyH;
    pl.baseAtk = s.baseAtk; pl.baseSpd = s.baseSpd; pl.shiny = s.shiny;
    pl.megaSave = null;
  }
  /** Cambia el dibujo (misma dirección). */
  function look(pl, dex, scale) {
    const dir = pl.anim.dir;
    pl.dex = dex;
    pl.shiny = pl.shiny && G.Sprites.hasShiny(dex);
    pl.scale = scale;
    pl.anim = new G.Sprites.Animator(dex, scale, pl.shiny);
    pl.anim.dir = dir;
    pl.anim.skin = null;
    pl.r = G.Sprites.playerRadius(dex);
    pl.bodyH = G.Sprites.bodyHeight(dex, scale);
    G.Sprites.preload([dex], 8000, pl.shiny);
  }

  // ---------------- Dinamax ----------------

  function dynaOn(pl) {
    pl.dynaSave = { scale: pl.scale, r: pl.r, bodyH: pl.bodyH, maxHp: pl.maxHp, anim: pl.anim, skin: pl.anim.skin };
    pl.dyna = true;
    // (En la Sentencia de Arceus no se rellena la vida: sólo sube el tope.)
    const judge = G.Judgment.active;
    pl.maxHp *= 2;
    if (!judge) pl.hp = Math.min(pl.maxHp, pl.hp * 2);
    pl.atkMul *= 1.4;
    const dir = pl.anim.dir;
    pl.anim = new G.Sprites.Animator(pl.dynaSave.anim.dex, pl.scale * 2, pl.dynaSave.anim.shiny);   // (con su aspecto del Vestidor)
    pl.anim.dir = dir; pl.anim.skin = pl.dynaSave.skin;
    pl.r = pl.dynaSave.r * 1.3;
    pl.bodyH = pl.dynaSave.bodyH * 2;
    G.Spawner.say(G.I18n.f('¡{x} se dinamaxiza!', G.T(pl.mon.name, 'mon')), 2.4, true);
  }
  function dynaOff(pl) {
    const s = pl.dynaSave;
    if (!s) return;
    pl.hp = Math.max(1, Math.min(s.maxHp, pl.hp / 2));
    pl.maxHp = s.maxHp;
    pl.atkMul /= 1.4;
    const dir = pl.anim.dir;
    pl.anim = new G.Sprites.Animator(s.anim.dex, pl.scale, s.anim.shiny);
    pl.anim.dir = dir; pl.anim.skin = s.skin;
    pl.r = s.r; pl.bodyH = s.bodyH;
    pl.dyna = false; pl.dynaSave = null;
  }
  /** Gigante: aplasta a los normales y rompe lo que pisa. */
  function dynaTick(pl) {
    for (const e of G.EnemyMgr.queryCircle(pl.x, pl.y, pl.r * 1.4)) {
      if (e.dead || e.boss || e.legend || e.arceus || e.eternatus || e.etCore || e.behavior === 'thief') continue;
      if ((e._crushT || 0) > performance.now()) continue;
      e._crushT = performance.now() + 400;
      e.hurt(e.hp + e.maxHp, '#ff3b5c', e.x - pl.x, e.y - pl.y, 200);
    }
    for (const p of G.World.propsInCircle(pl.x, pl.y, pl.r * 1.6)) if (p.type !== 'bigchest' && p.type !== 'altar' && p.type !== 'spring') G.World.breakProp(p);
  }
  /** Cada golpe salpica a los de alrededor (lo llama combat.js con el daño que ha hecho). */
  function splash(pl, e, dmg) {
    if (!pl.dyna || !(dmg > 0)) return;
    for (const o of G.EnemyMgr.queryCircle(e.x, e.y, 70)) {
      if (o === e || o.dead || o.arceus) continue;
      o.hurt(dmg * 0.35, '#ff7a9e', o.x - e.x, o.y - e.y, 0);
    }
  }

  // ---------------- Pulsera Z ----------------

  /** El daño de referencia: el mejor golpe de sus ataques. */
  function bestMove(pl) {
    let best = null, bv = 0;
    for (const m of pl.moves || []) {
      if (m.kind === 'buff' || !(m.dmg > 0)) continue;
      const v = m.dmg * pl.atkFor(m);
      if (v > bv) { bv = v; best = m; }
    }
    return best;
  }
  const baseDmg = pl => { const m = bestMove(pl); return m ? m.dmg * pl.atkFor(m) : 20 * pl.atk; };

  function rollZ(pl) {
    const t = pl.powerArg, col = G.U.TYPE_COLOR[t] || '#ffd23f';
    const tg = G.Projectiles.nearest(G.EnemyMgr.all(), pl.x, pl.y, 700);
    const a = tg ? Math.atan2(tg.y - pl.y, tg.x - pl.x) : pl.aim;
    G.Projectiles.spawn({ x: pl.x, y: pl.y - 6, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240, dmg: baseDmg(pl) * 1.2, r: 22, life: 3,
      pierce: 999, color: col, mtype: t, mcat: G.Stats.sideOf(pl.mon), vis: G.VFX.forType(t), zmark: true, hits: new Set() });
    G.Audio.sfx('shot', { kind: 'beam', type: t });
  }

  /** El movimiento Z: a todos los enemigos de la pantalla. */
  function zMove(pl) {
    const t = pl.powerArg, col = G.U.TYPE_COLOR[t] || '#ffd23f', dmg = baseDmg(pl) * 14;
    G.Game.flash(col, 0.9);
    G.Camera.kick(1.6);
    G.Audio.sfx('land');
    G.FX.ring(pl.x, pl.y, 10, G.Camera.outerRadius(), col, 0.8, 10);
    for (const e of G.EnemyMgr.all()) {
      if (e.dead || !G.Camera.sees(e.x, e.y, 40)) continue;
      e.hurt(dmg * G.Types.mult(t, e.types) * G.Stats.taken(e.mon, G.Stats.sideOf(pl.mon)), col, e.x - pl.x, e.y - pl.y, 120, 'crit');
      G.FX.burst(e.x, e.y - 10, col, 8, 140);
    }
    G.Spawner.say(G.I18n.f('¡Movimiento Z de tipo {x}!', G.U.TYPE_NAME[t] || t), 2.6, true);
  }

  // ---------------- Teracristal ----------------

  function teraOn(pl, t) {
    pl.teraSave = pl.mon.types.slice();
    pl.tera = t;
    if (t !== 'stellar') pl.mon = Object.assign({}, pl.mon, { types: [t] });
    G.Spawner.say(G.I18n.f('¡{x} se teracristaliza!', G.T(pl.mon.name, 'mon')), 2.4, true);
  }
  function teraOff(pl) {
    if (pl.teraSave) pl.mon = Object.assign({}, pl.mon, { types: pl.teraSave });
    pl.tera = null; pl.teraSave = null;
  }
  /** × al daño de un ataque de tipo `type` (lo mira combat.js). */
  function teraK(pl, type) {
    if (!pl.tera) return 1;
    if (pl.tera === 'stellar') return 1.3;
    return type === pl.tera ? ((pl.teraSave || []).includes(type) ? 1.8 : 1.5) : 1;
  }

  // ---------------- red: lo que ven los demás ----------------

  /** Lo que va en tu estado (coop.js, myState): 1 Dinamax · 2 Z · 10+n Tera (n = tipo; 40 Astral). */
  function netCode(pl) {
    if (!pl || !pl.powerOn) return 0;
    return pl.powerId === 'dyna' ? 1 : pl.powerId === 'z' ? 2 : pl.powerId === 'tera' ? (pl.tera === 'stellar' ? 40 : 10 + Math.max(0, TYPES.indexOf(pl.tera))) : 0;
  }
  /** Un compañero (copia): su tamaño Dinamax y su corona Tera. */
  function applyNet(p, code) {
    code = code | 0;
    if (p.netPw === code) return;
    const wasDyna = p.netPw === 1;
    p.netPw = code;
    if (code === 1 && !wasDyna) {
      p.netScale0 = p.scale; const dir = p.anim.dir;
      p.anim = new G.Sprites.Animator(p.anim.dex, p.scale * 2, p.anim.shiny); p.anim.dir = dir;
      p.bodyH *= 2;
    } else if (code !== 1 && wasDyna) {
      const dir = p.anim.dir;
      p.anim = new G.Sprites.Animator(p.anim.dex, p.netScale0 || p.scale, p.anim.shiny); p.anim.dir = dir;
      p.bodyH /= 2;
    }
    p.tera = code >= 10 ? (code === 40 ? 'stellar' : TYPES[code - 10]) : null;
  }

  // ---------------- dibujo ----------------

  /** Encima de tu Pokémon (y de los compañeros): el aura del poder y la corona Tera. */
  function drawOn(ctx, p) {
    const t = performance.now() / 1000;
    const dyna = p.dyna || p.netPw === 1, tera = p.tera, z = (p.powerOn && p.powerId === 'z') || p.netPw === 2;
    if (!dyna && !tera && !z && !(p.powerOn && p.powerId === 'mega')) return;
    ctx.save();
    if (dyna) {
      ctx.globalAlpha = 0.3 + Math.sin(t * 6) * 0.1;
      ctx.fillStyle = '#ff3b5c';
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * 2.4, p.r * 0.9, 0, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = '#ff9ab0'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) { const k = (t * 0.8 + i / 3) % 1; ctx.beginPath(); ctx.arc(p.x, p.y - p.bodyH * 0.9, 10 + k * 30, 0, 6.2832); ctx.stroke(); }
    }
    if (tera) {
      const col = tera === 'stellar' ? '#ffffff' : G.U.TYPE_COLOR[tera];
      // Cristales alrededor y la corona con el emblema de su tipo.
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = col;
      for (let i = 0; i < 6; i++) {
        const a = t * 0.8 + i * 1.047, x = p.x + Math.cos(a) * p.r * 1.6, y = p.y - p.bodyH * 0.45 + Math.sin(a) * p.r * 0.8;
        ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 7); ctx.lineTo(x - 4, y); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
      const cy = p.y - p.bodyH - 18;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(p.x - 14, cy + 6); ctx.lineTo(p.x - 14, cy - 4); ctx.lineTo(p.x - 7, cy + 1); ctx.lineTo(p.x, cy - 8);
      ctx.lineTo(p.x + 7, cy + 1); ctx.lineTo(p.x + 14, cy - 4); ctx.lineTo(p.x + 14, cy + 6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1b1528'; ctx.lineWidth = 1.5; ctx.stroke();
      if (tera !== 'stellar') G.Icons.draw(ctx, 'type:' + tera, p.x - 7, cy - 22, 14);
    }
    if (z || (p.powerOn && p.powerId === 'mega')) {
      const col = z ? (G.U.TYPE_COLOR[p.powerArg] || '#ffd23f') : '#ff8ad8';
      ctx.globalAlpha = 0.35 + Math.sin(t * 8) * 0.12;
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * 2, p.r * 0.8, 0, 0, 6.2832); ctx.stroke();
    }
    ctx.restore();
  }

  /** Una Z que rueda (proyectiles con zmark; ver entities/projectile.js). */
  function drawZ(ctx, p, lift) {
    const s = p.r * 1.3, col = p.color || '#ffd23f';
    ctx.save();
    ctx.translate(p.x, p.y - lift);
    ctx.rotate(p.t * 6);
    ctx.globalAlpha = Math.min(1, (p.life - p.t) * 3);
    ctx.lineJoin = 'miter';
    ctx.lineWidth = s * 0.32; ctx.strokeStyle = '#1b1528';
    const z = () => { ctx.beginPath(); ctx.moveTo(-s * 0.6, -s * 0.6); ctx.lineTo(s * 0.6, -s * 0.6); ctx.lineTo(-s * 0.6, s * 0.6); ctx.lineTo(s * 0.6, s * 0.6); };
    z(); ctx.stroke();
    ctx.lineWidth = s * 0.2; ctx.strokeStyle = col; z(); ctx.stroke();
    ctx.restore();
  }

  /** La barra del poder, debajo de tu vida (ui/hud.js), y su botón en el móvil. */
  function drawHud(ctx, pl, x, y, w) {
    if (!pl || !pl.powerId) return;
    const d = DEF[pl.powerId];
    const frac = pl.powerOn ? pl.powerT / d.dur : pl.powerCd > 0 ? 1 - pl.powerCd / (d.cd * (pl.powerCdMul || 1)) : 1;
    const rdy = ready(pl), t = performance.now() / 1000;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x, y, w, 5);
    ctx.fillStyle = pl.powerOn ? d.color : rdy ? (Math.sin(t * 6) > 0 ? '#ffffff' : d.color) : '#7d8aa8';
    ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, 5);
    ctx.font = F(800, 9); ctx.textAlign = 'left';
    ctx.fillStyle = rdy ? d.color : '#a8b4cc';
    const up = d.name.toUpperCase();
    ctx.fillText(rdy ? G.T('[F] ' + up) : G.I18n.f(up + ' · {x} s', Math.ceil(pl.powerOn ? pl.powerT : pl.powerCd)), x + w + 6, y + 6);
    ctx.restore();
  }
  /** Botón redondo del móvil, cuando está listo. */
  function touchButton(ctx, pl, cx, cy) {
    if (!G.Touch.active || !ready(pl)) return;
    const d = DEF[pl.powerId], R = 30, t = performance.now() / 1000;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = 'rgba(10,16,28,.75)';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = Math.sin(t * 6) > 0 ? '#ffffff' : d.color; ctx.stroke();
    G.Icons.draw(ctx, d.icon, cx - 14, cy - 14, 28);
    ctx.restore();
    G.Touch.addButton(cx - R, cy - R, R * 2, R * 2, () => { if (G.Game.state === 'playing') use(pl); }, 6);
  }

  return {
    DEF, TYPES, offer, use, stop, update, splash, teraK, netCode, applyNet, drawOn, drawZ, drawHud, touchButton, megaForms,
    ready, get pending() { return pending; },
    /** Para pruebas: elegir un poder sin la pantalla. */
    debugSet(pl, id, arg) { set(pl, id, arg); }
  };
})();
