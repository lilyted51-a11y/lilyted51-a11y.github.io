/* ============ powers.js — los poderes: Megaevolución, Dinamax / Gigamax, Pulsera Z y Teracristal ============
 * (23-11-2026; como la Gran Actualización del juego oficial, hecho aquí a partir de su guía de
 *  poderes.) Al vencer a Eternatus (minuto 20, systems/eternatus.js) eliges UN poder para el resto
 * de la partida. Se usa con F (en el mando, B; en el móvil, su botón redondo, que sale cuando está
 * listo), dura unos segundos y se recarga solo. En grupo, cada uno elige el suyo.
 *
 *   Poder                 Dura      Recarga  Qué hace
 *   Megaevolución          40 s      90 s    su forma Mega (o fusión / forma de poder): tipos, aspecto,
 *                                            stats y habilidad de esa forma, en proporción a lo que llevas;
 *                                            la vida no cambia
 *   Dinamax / Gigamax      12 s      80 s    gigante, doble de vida, +40 % de daño, cada golpe salpica,
 *                                            rompe lo que pisa y aplasta a los Pokémon normales; con forma
 *                                            Gigamax, su dibujo y cada 3 s una onda G-Max con efecto
 *   Pulsera Z              15 s + Z  60 s    cada 0,8 s rueda una gran Z de su tipo que lo atraviesa todo;
 *                                            al acabar, el movimiento Z golpea a todos los de la pantalla
 *   Teracristal            30 s      75 s    pasa a ser sólo del tipo que elijas: sus ataques de ese tipo
 *                                            pegan ×1,5 (×1,8 si ya era de ese tipo); Astral: los conserva y todo ×1,3
 *
 * (25-11-2026, copia local) Las formas salen de data/forms.js (G.FORMS, con la clase del juego oficial):
 *   · 'mega': 85 especies con Mega (91 formas). Las que tienen dos o una Z (Charizard, Mewtwo y Raichu X/Y;
 *     Absol, Garchomp y Lucario Z) eligen una al coger el poder. Kyogre y Groudon hacen la regresión
 *     primigenia con su orbe (lluvia o sol). El clima lo pone la forma (wx: Mega Charizard Y, sol) o su
 *     habilidad (Chorro Arena, Nevada...: Tyranitar, Abomasnow, Froslass).
 *   · 'power' (fusiones y formas de poder): Necrozma, Kyurem, Calyrex, Zacian, Zamazenta, Zygarde Completo y
 *     Greninja Ash, en la misma carta y con las mismas reglas. Solgaleo, Lunala, Reshiram, Zekrom, Glastrier
 *     y Spectrier se fusionan «desde su mitad» (HALF). Greninja y Zygarde, que tienen Mega y forma de poder, eligen.
 *     Las formas que cambian tipos y stats ('stat') o que cambian solas ('battle') ya no son poderes.
 *   · 'gmax': los 32 con forma Gigamax cambian el Dinamax por el Gigamax (Urshifu, la de su estilo). Cada 3 s
 *     sueltan su onda G-Max (G.FORMS[d].gmax = { name, type, fx, deco }): daño de su tipo alrededor y su efecto
 *     (WAVE): curar al grupo, quemar, daño que sigue, aturdir, rayo en cadena, monedas, escudo, frenar, velo,
 *     atraer o envenenar. En la Sentencia de Arceus no cura.
 * La barra del poder va debajo de tu vida (ui/hud.js). La carta Poder rápido (levelup.js) acorta la recarga.
 * Cooperativo: lo de cada uno va en su ordenador (los golpes y estados a los enemigos del anfitrión se le mandan
 * solos, ver entities/enemy.js); los demás ven su Mega (por su Pokémon, coop.js syncDex) y el tamaño Dinamax,
 * el Gigamax con su onda, el aura Mega o la corona Tera (pw, en el estado de cada jugador). La curación y el velo
 * de la onda G-Max de un compañero te los aplica tu ordenador si estás dentro.
 */
G.Powers = (() => {
  const DEF = {
    mega: { dur: 40, cd: 90, icon: 'star',   color: '#ff8ad8', name: 'Megaevolución' },
    dyna: { dur: 12, cd: 80, icon: 'up',     color: '#ff3b5c', name: 'Dinamax' },
    z:    { dur: 15, cd: 60, icon: 'cursor', color: '#ffd23f', name: 'Pulsera Z' },
    tera: { dur: 30, cd: 75, icon: 'shield', color: '#7fe0ff', name: 'Teracristal' }
  };
  // Fusiones «desde su mitad» (como el oficial): Solgaleo → Necrozma Melena Crepuscular, Lunala → Alas del Alba,
  // Reshiram → Kyurem Blanco, Zekrom → Kyurem Negro, Glastrier → Calyrex Jinete Glacial, Spectrier → Jinete Espectral.
  const HALF = { 791: [510800], 792: [500800], 643: [1646], 644: [2646], 896: [500898], 897: [510898] };
  // Urshifu Fluido tiene la suya, de tipo Agua (la tabla trae la de Urshifu Brusco).
  const GMAX_FIX = { 160892: { name: 'Gigagolpe fluido', type: 'water', deco: 'splash' } };
  const WAVE_EVERY = 3, WAVE_R = 230;
  // Color de las partículas de cada onda (deco).
  const DECO = { leaf: '#6fd36a', flame: '#ff7b3d', splash: '#4da6ff', dust: '#e8d27a', spark: '#ffe14d', coin: '#ffd23f',
    shadow: '#9a6bd8', bubble: '#9fdcff', snow: '#dff4ff', heart: '#ff8ad8', flower: '#ffb3d9', gas: '#b06bd0',
    metal: '#c8d0e0', wind: '#cfe8f0', star: '#fff27a', rock: '#b89a6a', sand: '#d8c28a', psy: '#ff7ad8' };
  // Lo que hace cada onda, para la carta.
  const FX_TXT = { heal: 'cura un poco a tu grupo', burn: 'quema a los enemigos', dot: 'les deja un daño que dura',
    stun: 'aturde a los enemigos', chain: 'un rayo salta de enemigo en enemigo', coin: 'suelta Pokémonedas',
    shield: 'te pone un escudo', slow: 'frena a los enemigos', veil: 'tu grupo recibe menos daño',
    pull: 'atrae a los enemigos', poison: 'envenena a los enemigos' };
  const TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
  const F = (wt, s) => `${wt} ${s}px Pixelify,"Segoe UI",system-ui,sans-serif`;

  let pending = null;        // jugador al que hay que ofrecerle el poder en cuanto se pueda
  let dots = [];             // daño que sigue de las ondas G-Max: { pl, e, n, t, dmg, col }

  // ---------------- las formas (data/forms.js) ----------------

  const form = d => (G.FORMS && G.FORMS[d]) || null;
  /** Especie de la que salen sus poderes. Las regionales son Pokémon aparte, y una forma de poder ya lo es. */
  function speciesOf(dex) {
    const f = form(dex);
    if (f && ['regional', 'mega', 'power', 'gmax', 'special'].includes(f.k)) return 0;
    return G.formBase ? G.formBase(dex) : dex;
  }
  const ok = d => !!(G.DEX_BY[d] && G.SPRITE_META[d]);
  /** Formas de la carta Megaevolución de un Pokémon (entradas de G.DEX): primero las Mega (X antes que Y). */
  function megaForms(dex) {
    const sp = speciesOf(dex);
    if (!sp) return [];
    const rank = d => (form(d).k === 'mega' ? 0 : 1) * 10 + ' XYZ'.indexOf(form(d).sfx || ' ');
    const l = (G.FORMS_OF[sp] || []).filter(d => { const k = form(d).k; return k === 'mega' || k === 'power'; }).sort((a, b) => rank(a) - rank(b));
    return l.concat(HALF[sp] || []).filter(d => d !== dex && ok(d)).map(d => G.DEX_BY[d]);
  }
  /** Su forma Gigamax (0 si no tiene). Urshifu: la de su estilo (Fluido si va con esa forma). */
  function gmaxForm(dex) {
    const sp = speciesOf(dex);
    if (!sp) return 0;
    const l = (G.FORMS_OF[sp] || []).filter(d => form(d).k === 'gmax' && ok(d) && form(d).gmax);
    if (l.length > 1) {
      const rapid = /rapid/.test((form(dex) || {}).slug || '');
      const m = l.find(d => /rapid/.test(form(d).slug || '') === rapid);
      if (m) return m;
    }
    return l[0] || 0;
  }
  /** Su onda G-Max: { name, type, fx, deco }. */
  const gmaxOf = d => { const f = form(d); return f && f.k === 'gmax' && f.gmax ? Object.assign({}, f.gmax, GMAX_FIX[d]) : null; };
  /** Nombre del poder (el Dinamax de los que tienen forma Gigamax se llama Gigamax). */
  const powerName = pl => (pl.powerId === 'dyna' && gmaxOf(pl.powerArg) ? 'Gigamax' : DEF[pl.powerId].name);

  /** Los tipos que tiene sentido elegir (Z y Tera): los de sus ataques y los suyos, el del mejor ataque primero. */
  function typeChoices(pl) {
    const best = bestMove(pl), out = [];
    const add = t => { if (t && TYPES.includes(t) && !out.includes(t)) out.push(t); };
    if (best) add(best.type);
    for (const m of pl.moves) if (m.kind !== 'buff') add(m.type);
    for (const t of pl.mon.types) add(t);
    return out.slice(0, 8);
  }

  // ---------------- elegir ----------------

  /** Tras vencer a Eternatus: se ofrece en cuanto no haya otra elección abierta (ver update). */
  function offer(pl) { if (pl && !pl.powerId) pending = pl; }

  function showOffer(pl) {
    pending = null;
    const forms = megaForms(pl.dex), name = G.T(pl.mon.name, 'mon');
    const cards = [];
    if (forms.length) {
      const mega = forms.every(f => form(f.dex).k === 'mega'), f0 = form(forms[0].dex), many = forms.length > 1;
      let title, desc;
      if (f0.primal && !many) {
        title = 'Regresión primigenia';
        desc = G.I18n.f('{x} vuelve {x} s a su forma primigenia con el {x}: tipos, aspecto, stats, habilidad y su clima.', name, DEF.mega.dur, G.T(f0.orb || ''));
      } else if (mega) {
        title = 'Megaevolución';
        desc = many ? G.I18n.f('{x} megaevoluciona {x} s: tipos, aspecto, stats y habilidad de su Mega (la vida no cambia). Tiene {x} y eliges una.', name, DEF.mega.dur, forms.length)
                    : G.I18n.f('{x} megaevoluciona {x} s: tipos, aspecto, stats y habilidad de su Mega (la vida no cambia).', name, DEF.mega.dur);
      } else {
        title = forms.some(f => form(f.dex).k === 'mega') ? 'Megaevolución / Cambio de forma' : 'Fusión / Cambio de forma';
        desc = many ? G.I18n.f('{x} cambia {x} s a su forma de poder: tipos, aspecto, stats y habilidad nuevos (la vida no cambia). Tiene {x} y eliges una.', name, DEF.mega.dur, forms.length)
                    : G.I18n.f('{x} cambia {x} s a su forma de poder: tipos, aspecto, stats y habilidad nuevos (la vida no cambia).', name, DEF.mega.dur);
      }
      cards.push(card('mega', title, desc, forms[0].dex));
    }
    const gm = gmaxForm(pl.dex), gx = gm && gmaxOf(gm);
    if (gx) cards.push(card('dyna', 'Gigamax', G.I18n.f('Gigante {x} s con su forma Gigamax: doble de vida, +40 % de daño, salpica y aplasta. Cada {x} s, {x}: {x}.',
      DEF.dyna.dur, WAVE_EVERY, G.T(gx.name), G.T(FX_TXT[gx.fx] || FX_TXT.burn)), gm));
    else cards.push(card('dyna', 'Dinamax', G.I18n.f('Gigante {x} s: doble de vida, +40 % de daño, salpica, rompe lo que pisa y aplasta a los Pokémon normales.', DEF.dyna.dur)));
    cards.push(card('z', 'Pulsera Z', G.I18n.f('{x} s lanzando grandes Z de un tipo y, al final, un movimiento Z a toda la pantalla.', DEF.z.dur)));
    cards.push(card('tera', 'Teracristal', G.I18n.f('{x} s del tipo que elijas: sus ataques de ese tipo pegan mucho más.', DEF.tera.dur)));
    G.Game.choose(done => {
      G.RunUI.showChoice('¡Elige tu poder!', G.I18n.f('Uno para el resto de la partida · se usa con {x} (en el mando, B)', G.T(G.Keys.label('power'))), cards, c => {
        if (c.id === 'mega' && forms.length > 1) return pickForm(pl, forms, done);
        if (c.id === 'z' || c.id === 'tera') return pickType(pl, c.id, done);
        set(pl, c.id, c.arg); done();
      });
    });
  }
  function card(id, title, desc, dex) {
    return { id, arg: dex || 0, key: 'power:' + id, title, desc, icon: DEF[id].icon, color: DEF[id].color, tag: 'Poder', dex };
  }
  /** Las que tienen dos (o Mega y forma de poder) eligen una: sus tipos y, debajo, su habilidad. */
  function pickForm(pl, forms, done) {
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    G.RunUI.showChoice('¿Qué forma?', G.T(pl.mon.name, 'mon'), forms.map(f => {
      const ab = form(f.dex).ab, an = ab && G.ABIL && G.ABIL[ab] ? G.Mons.abilityName(ab) : '';
      return { id: 'mega', arg: f.dex, key: 'power:mega:' + f.dex, dex: f.dex,
        title: G.T(f.name, 'mon'), desc: f.types.map(t => G.U.TYPE_NAME[t]).join(' / ') + (an ? `<br><span translate="no">${esc(an)}</span>` : ''),
        icon: 'star', color: DEF.mega.color, tag: 'Forma' };
    }), c => { set(pl, 'mega', c.arg); done(); });
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
    // (Dinamax con una forma que no es Gigamax: Dinamax normal.)
    if (id === 'dyna' && arg && !gmaxOf(arg)) arg = 0;
    pl.powerId = id; pl.powerArg = arg; pl.powerCd = 0; pl.powerOn = false; pl.powerT = 0;
    pl.powerCdMul = pl.powerCdMul || 1;
    if ((id === 'mega' || id === 'dyna') && arg && G.SPRITE_META[arg]) G.Sprites.preload([arg], 8000, pl.shiny);   // (que esté listo al usarlo)
    G.Audio.sfx('legend');
    G.Spawner.say(G.I18n.f('¡Poder: {x}! Úsalo con {x}', G.T(powerName(pl)), G.T(G.Keys.label('power'))), 3, true);   // (su tecla: core/keys.js)
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
    if (dots.length) tickDots(dt, pl);
    if (G.Coop.active) mateWaves(dt, pl);
    if (!pl.powerId) return;
    if (pl.powerOn) {
      if (pl.dead) { stop(pl, true); return; }
      pl.powerT -= dt;
      if (pl.powerId === 'z' && (pl.zT -= dt) <= 0) { pl.zT = 0.8; rollZ(pl); }
      if (pl.powerId === 'dyna') {
        dynaTick(pl);
        if (pl.gmax && (pl.gmaxT -= dt) <= 0) { pl.gmaxT = WAVE_EVERY; wave(pl); }
      }
      if (pl.powerT <= 0) stop(pl);
    } else if (pl.powerCd > 0) pl.powerCd -= dt;
  }

  // ---------------- Megaevolución (y fusiones / formas de poder) ----------------

  // Lo que tocan las habilidades al empezar (ability-fx.js, start): se deshace al acabar la Mega.
  const START_KEYS = ['critChance', 'regenFlat', 'coinMul', 'magnet'];

  function megaOn(pl, dex) {
    const to = G.DEX_BY[dex], from = G.DEX_BY[pl.dex], f = form(dex) || {};
    if (!to || !from) return;
    pl.megaSave = { mon: pl.mon, dex: pl.dex, anim: pl.anim, scale: pl.scale, r: pl.r, bodyH: pl.bodyH, baseAtk: pl.baseAtk, baseSpd: pl.baseSpd, shiny: pl.shiny,
                    abil: pl.abil, abilId: pl.abilId, sumT: pl.sumT, delta: null };
    const k = key => (from[key] ? to[key] / from[key] : 1), was = pl.mon.name;
    const m = Object.assign({}, to, { hp: pl.mon.hp, spd: pl.mon.spd * k('spd'), pa: pl.mon.pa * k('pa'), sa: pl.mon.sa * k('sa'), df: pl.mon.df * k('df'), sd: pl.mon.sd * k('sd') });
    m.atk = Math.max(m.pa, m.sa);
    pl.mon = m;
    pl.baseAtk *= to.atk / Math.max(0.01, from.atk);
    pl.baseSpd *= k('spd');
    look(pl, dex, G.Sprites.playerScale(dex));
    abilOn(pl, f.ab, m);
    // Su clima: el de la forma (Kyogre y Groudon primigenios, Mega Charizard Y) o el de su habilidad.
    const fx = f.ab && G.AbilityFX.FX[f.ab], w = f.wx || (fx && fx.summon);
    if (w && G.Weather.KINDS[w]) {
      if (!G.Coop.active || G.Coop.isHost) G.Weather.debugStart(w, DEF.mega.dur);
      else G.Coop.toHost(['wxq', w]);
    }
    const nm = G.T(was, 'mon');
    G.Spawner.say(f.primal ? G.I18n.f('¡Regresión primigenia de {x}!', nm)
      : f.k === 'mega' ? G.I18n.f('¡{x} megaevoluciona!', nm)
      : f.fu || HALF[G.formBase(from.dex)] ? G.I18n.f('¡{x} se fusiona!', nm)
      : G.I18n.f('¡{x} cambia de forma!', nm), 2.4, true);
  }
  function megaOff(pl) {
    const s = pl.megaSave;
    if (!s) return;
    pl.mon = s.mon; pl.dex = s.dex; pl.anim = s.anim; pl.scale = s.scale; pl.r = s.r; pl.bodyH = s.bodyH;
    pl.baseAtk = s.baseAtk; pl.baseSpd = s.baseSpd; pl.shiny = s.shiny;
    if (s.delta) { for (const [key, d] of s.delta) pl[key] -= d; pl.abil = s.abil; pl.abilId = s.abilId; pl.sumT = s.sumT; }
    pl.megaSave = null;
  }
  /** La habilidad de la forma (data/ability-fx.js) mientras dura. */
  function abilOn(pl, id, mon) {
    if (!id || !G.AbilityFX) return;
    const a = G.AbilityFX.of(id, mon), before = START_KEYS.map(key => pl[key]);
    pl.abil = a; pl.abilId = id;
    if (a.start) { try { a.start(pl); } catch (e) { /* (una que no vale aquí: sin su arranque) */ } }
    pl.megaSave.delta = START_KEYS.map((key, i) => [key, (pl[key] || 0) - (before[i] || 0)]).filter(([, d]) => Number.isFinite(d) && d !== 0);
    if (a.summon) pl.sumT = DEF.mega.dur + 1;          // (su clima ya lo pone la Mega)
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

  // ---------------- Dinamax / Gigamax ----------------

  function dynaOn(pl) {
    pl.dynaSave = { scale: pl.scale, r: pl.r, bodyH: pl.bodyH, maxHp: pl.maxHp, anim: pl.anim, skin: pl.anim.skin };
    pl.dyna = true;
    // (En la Sentencia de Arceus no se rellena la vida: sólo sube el tope.)
    const judge = G.Judgment.active;
    pl.maxHp *= 2;
    if (!judge) pl.hp = Math.min(pl.maxHp, pl.hp * 2);
    pl.atkMul *= 1.4;
    const dir = pl.anim.dir, gm = gmaxOf(pl.powerArg) ? pl.powerArg : 0, sh = pl.dynaSave.anim.shiny;
    if (gm) {
      // Gigamax: su dibujo (sin el aspecto del Vestidor) a tamaño gigante.
      const sc = G.Sprites.playerScale(gm) * 2;
      pl.anim = new G.Sprites.Animator(gm, sc, sh && G.Sprites.hasShiny(gm));
      pl.bodyH = G.Sprites.bodyHeight(gm, sc);
      pl.gmax = gm; pl.gmaxT = 1;
    } else {
      pl.anim = new G.Sprites.Animator(pl.dynaSave.anim.dex, pl.scale * 2, sh);   // (con su aspecto del Vestidor)
      pl.anim.skin = pl.dynaSave.skin;
      pl.bodyH = pl.dynaSave.bodyH * 2;
    }
    pl.anim.dir = dir;
    pl.r = pl.dynaSave.r * 1.3;
    G.Spawner.say(G.I18n.f(gm ? '¡{x} se gigamaxiza!' : '¡{x} se dinamaxiza!', G.T(pl.mon.name, 'mon')), 2.4, true);
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
    pl.dyna = false; pl.dynaSave = null; pl.gmax = 0;
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

  // ---------------- la onda G-Max ----------------

  const big = e => e.boss || e.legend || e.eternatus || e.etCore || e.arceus;

  /** Tu onda: daño de su tipo a los de alrededor y su efecto. (En grupo, los golpes y estados a los enemigos del
   *  anfitrión se le mandan solos: entities/enemy.js.) */
  function wave(pl) {
    const g = gmaxOf(pl.gmax);
    if (!g) return;
    const col = DECO[g.deco] || G.U.TYPE_COLOR[g.type] || '#ff3b5c', cat = G.Stats.sideOf(pl.mon);
    const dmg = baseDmg(pl) * 2.5, hit = [];
    waveFx(pl, g, col);
    for (const e of G.EnemyMgr.queryCircle(pl.x, pl.y, WAVE_R)) {
      if (e.dead) continue;
      const k = G.Types.mult(g.type, e.types) * G.Stats.taken(e.mon, cat), pull = g.fx === 'pull';
      const dx = e.x - pl.x, dy = e.y - pl.y, dist = Math.hypot(dx, dy);
      e.hurt(dmg * k, col, pull ? -dx : dx, pull ? -dy : dy, pull ? Math.min(260, dist * 1.2) : 60);
      hit.push(e);
      if (e.dead) continue;
      if (g.fx === 'burn') e.applyBurn(2);
      else if (g.fx === 'poison') e.applyPoison(2);
      else if (g.fx === 'slow') e.applySlow(0.5, 2.5);
      else if (g.fx === 'stun' && !big(e)) e.applyStun(1.2);
      else if (g.fx === 'dot' && dots.length < 200) dots.push({ pl, e, n: 3, t: 0.6, dmg: dmg * k * 0.25, col });
    }
    if (g.fx === 'chain') chain(pl, dmg, g.type, col, cat);
    else if (g.fx === 'coin') coins(pl, hit);
    else if (g.fx === 'shield') pl.addBuff('def', 0.3, WAVE_EVERY + 0.4, 1);
    else groupFx(pl, g.fx);
  }
  /** Curar o velo: a ti (y, en tu ordenador, si estás en la onda de un compañero; ver mateWaves). */
  function groupFx(pl, fx) {
    if (fx === 'heal' && !G.Judgment.active) pl.heal(pl.maxHp * 0.04);        // (en la Sentencia de Arceus no cura)
    else if (fx === 'veil') pl.addBuff('def', 0.15, WAVE_EVERY + 0.4, 1);
  }
  /** Lo que se ve: el anillo de su color, partículas y el nombre del movimiento. */
  function waveFx(p, g, col) {
    G.FX.ring(p.x, p.y, 20, WAVE_R, col, 0.55, 10);
    G.FX.ring(p.x, p.y, 10, WAVE_R * 0.6, '#ffffff', 0.4, 4);
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * 6.2832;
      G.FX.burst(p.x + Math.cos(a) * WAVE_R * 0.85, p.y + Math.sin(a) * WAVE_R * 0.85, col, 3, 90);
    }
    G.FX.dmgText(p.x, p.y - p.bodyH - 26, G.T(g.name), col, true);
  }
  /** Rayo que salta de enemigo en enemigo (hasta 6). */
  function chain(pl, dmg, type, col, cat) {
    let fx = pl.x, fy = pl.y - pl.bodyH * 0.5, reach = WAVE_R + 80;
    const seen = new Set();
    for (let n = 0; n < 6; n++) {
      let best = null, bd = reach * reach;
      for (const e of G.EnemyMgr.queryCircle(fx, fy, reach)) {
        if (e.dead || seen.has(e)) continue;
        const d = (e.x - fx) ** 2 + (e.y - fy) ** 2;
        if (d < bd) { bd = d; best = e; }
      }
      if (!best) break;
      seen.add(best);
      const tx = best.x, ty = best.y - 10;
      G.FX.beam(fx, fy, Math.atan2(ty - fy, tx - fx), Math.hypot(tx - fx, ty - fy), 4, col, { pal: type, beam: 'lightning' });
      best.hurt(dmg * 0.8 * G.Types.mult(type, best.types) * G.Stats.taken(best.mon, cat), col, tx - fx, ty - fy, 30);
      fx = tx; fy = ty; reach = 180;
    }
  }
  /** Pokémonedas: las suelta quien manda los objetos. En grupo las monedas son del equipo y las lleva el anfitrión:
   *  las de la onda de un invitado las suelta el anfitrión al verla (mateWaves). */
  function coins(pl, hit) {
    const n = Math.max(1, Math.min(4, hit.length));
    if (G.Coop.active && !G.Coop.isHost) return;
    for (let i = 0; i < n; i++) {
      const e = hit[i] || pl;
      G.Pickups.drop('coin', e.x + G.U.rand(-12, 12), e.y + G.U.rand(-12, 12), 2);
    }
  }
  function tickDots(dt, pl) {
    dots = dots.filter(d => d.pl === pl);          // (los de otra partida, fuera)
    for (const d of dots) {
      if ((d.t -= dt) > 0) continue;
      d.t = 0.6; d.n--;
      if (!d.e.dead) d.e.hurt(d.dmg, d.col);
    }
    dots = dots.filter(d => d.n > 0 && !d.e.dead);
  }
  /** Compañeros con Gigamax: su onda se ve aquí cada 3 s y, si te pilla dentro, te cura o te pone el velo. */
  function mateWaves(dt, pl) {
    for (const p of G.Coop.puppets()) {
      if (p.netPw !== 3 || !p.netGmax || p.dead) continue;
      if ((p.netWaveT -= dt) > 0) continue;
      p.netWaveT = WAVE_EVERY;
      const g = gmaxOf(p.netGmax);
      if (!g) continue;
      waveFx(p, g, DECO[g.deco] || G.U.TYPE_COLOR[g.type] || '#ff3b5c');
      if (!pl.dead && (pl.x - p.x) ** 2 + (pl.y - p.y) ** 2 < WAVE_R * WAVE_R) groupFx(pl, g.fx);
      if (g.fx === 'coin' && G.Coop.isHost) coins(p, G.EnemyMgr.queryCircle(p.x, p.y, WAVE_R).filter(e => !e.dead));
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

  /** Lo que va en tu estado (coop.js, myState): 1 Dinamax · 2 Z · 3 Gigamax · 4 Mega · 10+n Tera (n = tipo; 40 Astral). */
  function netCode(pl) {
    if (!pl || !pl.powerOn) return 0;
    const id = pl.powerId;
    return id === 'dyna' ? (pl.gmax ? 3 : 1) : id === 'z' ? 2 : id === 'mega' ? 4
      : id === 'tera' ? (pl.tera === 'stellar' ? 40 : 10 + Math.max(0, TYPES.indexOf(pl.tera))) : 0;
  }
  /** Un compañero (copia): su tamaño Dinamax o su Gigamax, y su corona Tera. (Su Mega llega por su Pokémon: syncDex.) */
  function applyNet(p, code) {
    code = code | 0;
    if (p.netPw === code) return;
    const giant = c => c === 1 || c === 3;
    const was = giant(p.netPw);
    p.netPw = code;
    if (was && p.netSave) {
      const s = p.netSave, dir = p.anim.dir;
      p.anim = new G.Sprites.Animator(s.dex, s.scale, s.shiny); p.anim.dir = dir; p.anim.skin = s.skin;
      p.bodyH = s.bodyH; p.netSave = null; p.netGmax = 0;
    }
    if (giant(code)) {
      const a = p.anim, dir = a.dir, gm = code === 3 ? gmaxForm(p.dex) : 0;
      p.netSave = { dex: a.dex, scale: p.scale, shiny: a.shiny, skin: a.skin, bodyH: p.bodyH };
      if (gm) {
        const sc = G.Sprites.playerScale(gm) * 2;
        p.anim = new G.Sprites.Animator(gm, sc, a.shiny && G.Sprites.hasShiny(gm));
        p.bodyH = G.Sprites.bodyHeight(gm, sc);
        p.netGmax = gm; p.netWaveT = 1;
        G.Sprites.preload([gm], 8000, p.anim.shiny);
      } else {
        p.anim = new G.Sprites.Animator(a.dex, p.scale * 2, a.shiny); p.anim.skin = a.skin;
        p.bodyH *= 2;
      }
      p.anim.dir = dir;
    }
    p.tera = code >= 10 ? (code === 40 ? 'stellar' : TYPES[code - 10]) : null;
  }

  // ---------------- dibujo ----------------

  /** Encima de tu Pokémon (y de los compañeros): el aura del poder, las nubes Gigamax, el orbe primigenio y la corona Tera. */
  function drawOn(ctx, p) {
    const t = performance.now() / 1000;
    const dyna = p.dyna || p.netPw === 1 || p.netPw === 3, gmax = p.gmax || (p.netPw === 3 && p.netGmax), tera = p.tera;
    const z = (p.powerOn && p.powerId === 'z') || p.netPw === 2, mega = (p.powerOn && p.powerId === 'mega') || p.netPw === 4;
    if (!dyna && !tera && !z && !mega) return;
    ctx.save();
    if (dyna) {
      ctx.globalAlpha = 0.3 + Math.sin(t * 6) * 0.1;
      ctx.fillStyle = '#ff3b5c';
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * 2.4, p.r * 0.9, 0, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = '#ff9ab0'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) { const k = (t * 0.8 + i / 3) % 1; ctx.beginPath(); ctx.arc(p.x, p.y - p.bodyH * 0.9, 10 + k * 30, 0, 6.2832); ctx.stroke(); }
    }
    if (gmax) {
      // Las nubes rojas del Gigamax, girando sobre la cabeza, con chispas del color de su onda.
      const g = gmaxOf(gmax) || {}, col = DECO[g.deco] || '#ff3b5c', cy = p.y - p.bodyH - 10;
      for (let i = 0; i < 7; i++) {
        const a = t * 0.9 + i * 0.8976, x = p.x + Math.cos(a) * p.r * 1.5, y = cy + Math.sin(a) * 6;
        ctx.globalAlpha = 0.55; ctx.fillStyle = i % 2 ? '#c4123a' : '#ff4d6d';
        ctx.beginPath(); ctx.arc(x, y, 9 + (i % 3) * 2, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 0.8; ctx.fillStyle = col;
        ctx.fillRect(x - 1.5, y - 1.5 - ((t * 20 + i * 7) % 12), 3, 3);
      }
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
    if (z || mega) {
      const col = z ? (G.U.TYPE_COLOR[p.powerArg] || '#ffd23f') : '#ff8ad8';
      ctx.globalAlpha = 0.35 + Math.sin(t * 8) * 0.12;
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * 2, p.r * 0.8, 0, 0, 6.2832); ctx.stroke();
    }
    const f = mega && form(p.dex);
    if (f && f.primal) {
      // El orbe (Azul de Kyogre, Rojo de Groudon), brillando sobre la cabeza.
      const col = G.U.TYPE_COLOR[f.oc] || '#7fb8ff', cy = p.y - p.bodyH - 34 + Math.sin(t * 3) * 3;
      ctx.globalAlpha = 0.35; ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(p.x, cy, 13, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(p.x, cy, 7, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = '#1b1528'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 3, cy - 4, 2, 2);
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
    const up = powerName(pl).toUpperCase();
    // (La tecla del poder es la que se haya puesto en Ajustes › Controles; de serie, F.)
    ctx.fillText(rdy ? '[' + G.T(G.Keys.label('power')) + '] ' + G.T(up) : G.I18n.f(up + ' · {x} s', Math.ceil(pl.powerOn ? pl.powerT : pl.powerCd)), x + w + 6, y + 6);
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

  // ---------------- habilidades de las formas ----------------
  // Las de las Mega y formas de poder que no estaban en data/ability-fx.js (si alguien las añade allí, mandan las de
  // allí). Las que no salen aquí dan la pasiva de su tipo, como cualquier otra (AbilityFX.of).
  (function addAbilities() {
    const A = G.AbilityFX && G.AbilityFX.FX;
    if (!A) return;
    const TN = t => (G.U && G.U.TYPE_NAME ? G.U.TYPE_NAME[t] : t);
    const boost = type => ({ d: '+20 % de daño con movimientos de tipo ' + TN(type) + '.', out: (pl, m) => (m.type === type ? 1.2 : 1) });
    const with2 = (base, type) => (A[base] ? Object.assign({}, A[base], { out: (pl, m) => (m.type === type ? 1.2 : 1) }) : boost(type));
    const add = {
      'pixilate': boost('fairy'), 'aerilate': boost('flying'), 'refrigerate': boost('ice'), 'dragonize': boost('dragon'),
      'electric-surge': boost('electric'), 'fairy-aura': boost('fairy'),
      'primordial-sea': with2('drizzle', 'water'), 'desolate-land': with2('drought', 'fire'),
      'delta-stream': A['filter'], 'turboblaze': A['mold-breaker'], 'teravolt': A['mold-breaker'], 'stalwart': A['inner-focus'],
      'berserk': A['anger-point'], 'aura-guard': { d: 'Recibe un 20 % menos de daño.', inMul: () => 0.8 },
      // (25-11-2026) las de las megas nuevas, con nombre oficial en PokeAPI: lo más parecido que ya hay
      'piercing-drill': A['tough-claws'], 'mega-sol': boost('fire'), 'spicy-spray': A['flame-body'], 'eelevate': A['levitate'],
      'power-construct': A['moxie'], 'battle-bond': A['moxie'], 'as-one-glastrier': A['moxie'], 'as-one-spectrier': A['moxie'],
      'parental-bond': { d: '+20 % de daño con todos sus movimientos.', out: () => 1.2 },
      'intrepid-sword': { d: '+20 % de daño con todos sus movimientos.', out: () => 1.2 },
      'dauntless-shield': { d: 'Recibe un 20 % menos de daño.', inMul: () => 0.8 },
      'neuroforce': { d: '+25 % de daño con los ataques muy eficaces.', out: (pl, m, e) => (e && G.Types.mult(m.type, e.types || []) > 1 ? 1.25 : 1) }
    };
    for (const id in add) if (!A[id] && add[id]) A[id] = add[id];
    // Sus nombres (es, en, fr, it, zh-Hans, zh-Hant), si data/abilities.js no los trae (fr / it: los del inglés).
    const N = G.ABIL;
    if (!N) return;
    const names = {
      'parental-bond': ['Amor Filial', 'Parental Bond', '', '', '亲子爱', '親子愛'],
      'primordial-sea': ['Mar del Albor', 'Primordial Sea', '', '', '始源之海', '始源之海'],
      'desolate-land': ['Tierra del Ocaso', 'Desolate Land', '', '', '终结之地', '終結之地'],
      'delta-stream': ['Ráfaga Delta', 'Delta Stream', '', '', '德尔塔气流', '德爾塔氣流'],
      'neuroforce': ['Fuerza Cerebral', 'Neuroforce', '', '', '脑核之力', '腦核之力'],
      'power-construct': ['Agrupamiento', 'Power Construct', '', '', '群聚变形', '群聚變形'],
      'aerilate': ['Piel Celeste', 'Aerilate', '', '', '飞行皮肤', '飛行皮膚'],
      'battle-bond': ['Fuerte Afecto', 'Battle Bond', '', '', '牵绊变身', '牽絆變身'],
      'as-one-glastrier': ['Unidad Ecuestre', 'As One', '', '', '人马一体', '人馬一體'],
      'as-one-spectrier': ['Unidad Ecuestre', 'As One', '', '', '人马一体', '人馬一體'],
      // (25-11-2026, PokeAPI)
      'piercing-drill': ['Turbotaladro', 'Piercing Drill', 'Transperceuse', 'Punta Perforante', '贯穿钻', '貫穿鑽'],
      'dragonize': ['Piel Dragontina', 'Dragonize', 'Peau Draconique', 'Pelledrago', '龙皮肤', '龍皮膚'],
      'mega-sol': ['Megasolar', 'Mega Sol', 'Méga-Soleil', 'Megasolar', '超级日光', '超級日光'],
      'spicy-spray': ['Salpicante', 'Spicy Spray', 'Habanéruption', 'Spargipiccante', '辣椒喷发', '辣椒噴發'],
      'eelevate': ['Impulso Anguila', 'Eelevate', 'Lévitaboost', 'Rapidascesa', '鳗鳗高升', '鰻鰻高升'],
      'aura-guard': ['Aura Protectora', 'Aura Guard', 'Aura Protectrice', 'Ondascudo', '波导防护', '波導防護']
    };
    for (const id in names) if (!N[id]) N[id] = names[id];
  })();

  return {
    DEF, TYPES, offer, use, stop, update, splash, teraK, netCode, applyNet, drawOn, drawZ, drawHud, touchButton, megaForms, gmaxForm, gmaxOf,
    ready, powerName, get pending() { return pending; },
    /** Para pruebas: elegir un poder sin la pantalla (dyna con la forma Gigamax como arg = Gigamax). */
    debugSet(pl, id, arg) { set(pl, id, arg); }
  };
})();
