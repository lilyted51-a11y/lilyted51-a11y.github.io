/* ============ battleforms.js — formas de combate: cambian solas durante la partida ============
 * (25-11-2026, copia local; como las «formas de combate» del juego oficial, hecho aquí a partir de su
 *  guía.) Algunos Pokémon cambian de forma según lo que pasa en la partida, como en los juegos:
 *
 *   Pokémon               Cuándo                                                  Forma
 *   Castform              con sol / lluvia / nieve                                Soleada / Lluvia / Nieve
 *   Cherrim               con sol                                                 Soleada
 *   Darmanitan (y Galar)  con menos de la mitad de vida, SÓLO con Modo Daruma     Daruma (vuelve con ≥ 55 %)
 *   Meloetta              con Canto Arcaico en el hueco activo                    Danza
 *   Aegislash             con enemigos cerca (atacando); 2 s sin ellos, Escudo    Filo
 *   Wishiwashi            desde el nivel 20, con ≥ 25 % de vida (vuelve con 30 %) Banco
 *   Minior                con ≤ 50 % de vida (vuelve con > 55 %)                  Núcleo (su color, fijo por cuenta)
 *   Mimikyu               el primer golpe lo para el disfraz; luego, toda la run  Descubierto
 *   Cramorant             sus ataques de Agua pescan una presa; al recibir un     Tragatodo (> 50 % de vida) /
 *                         golpe la escupe contra los de alrededor                 Engullitodo (≤ 50 %)
 *   Eiscue                su cara de hielo para un golpe físico; la nieve se la   Cara Deshielo
 *                         devuelve (2 s nevando)
 *   Morpeko               cada 10 s                                               Voraz / Saciada
 *   Palafin               al volver de una grieta (como salir y volver a entrar)  Heroica, para el resto de la run
 *   Terapagos             desde el principio Teracristal; con el poder            Astral
 *                         Teracristal puesto, Astral
 *
 * El cambio es como la Mega (systems/powers.js): dibujo (misma dirección), tipos y stats de la forma,
 * EN PROPORCIÓN a lo que llevas (nivel, naturaleza, mejoras y la escalera de fuerza se quedan); la vida no
 * cambia. Las filas de G.DEX (data/pokedex.js) dan tipos y stats; los núcleos de Minior y Eiscue Cara
 * Deshielo traen allí los mismos números que su forma base, así que aquí llevan los de los juegos (FIX).
 * Con un poder puesto (Mega, Dinamax, Z, Tera) no se cambia: se espera a que acabe (salvo Terapagos Astral,
 * que es justo el Teracristal). Antes de evolucionar o de un salto de fuerza se vuelve a la forma base
 * (reset, lo llama entities/player.js) y luego se recalcula.
 * Si empiezas la partida YA con una forma (las que se vendían sueltas: Aegislash Filo, Castform Sol...),
 * esa se queda fija, como antes.
 * Habilidades (data/ability-fx.js): Disfraz, Cara de Hielo, Tragamisil... describen esto; Tragamisil avisa
 * aquí de sus golpes (onHit). Player.hurt pregunta a block() antes de quitar vida.
 *
 * Cooperativo: cada uno decide lo suyo en su ordenador (vida, golpes, clima que le llega del anfitrión).
 * Los demás ven tu forma por el campo `bf` al final de tu estado (coop.js, myState/readState: netCode y
 * applyNet); tu Pokémon «de verdad» (ownDex) sigue en su sitio, así que la sala y el resumen no cambian.
 */
G.BattleForms = (() => {
  const W = () => (G.Weather && G.Weather.current || {}).kind;
  const frac = pl => pl.hp / Math.max(1, pl.maxHp);
  const MINIOR_CORES = [1774, 2774, 3774, 4774, 5774, 6774, 7774];
  // Stats de los juegos donde la fila importada repite los de la forma base (misma escala que G.DEX).
  const CORE = { pa: 1.25, sa: 1.25, atk: 1.25, df: 60, sd: 60, spd: 128 };
  const FIX = { 1875: { df: 70, sd: 50, spd: 132 } };
  for (const d of MINIOR_CORES) FIX[d] = CORE;
  // Los que cambian mucho llevan además un aviso arriba (los demás, sólo el nombre sobre su cabeza).
  const BIG = new Set([1555, 510555, 1746, 1778, 1875, 1964, 2024, 501024]);

  /** Número fijo entre 0 y 1 para esta cuenta (el color del núcleo de Minior). */
  function seed(salt) {
    const s = (G.DB && G.DB.save && G.DB.save.created) || 0, str = s + ':' + salt;
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967296;
  }

  // ---------------- cuándo cambia cada uno: want(pl, s, dt) → número de la forma que toca ----------------
  const zen = to => (pl, s) => (pl.abilId !== 'zen-mode' ? s.base
    : frac(pl) < (s.cur === to ? 0.55 : 0.5) ? to : s.base);
  const RULES = {
    351: { want: () => ({ sun: 1351, rain: 2351, snow: 3351 })[W()] || 351 },
    421: { want: () => (W() === 'sun' ? 1421 : 421) },
    555: { want: zen(1555) },
    2555: { want: zen(510555) },
    648: { want: pl => (pl.activeGroup().some(m => m.id === 'relic-song') ? 1648 : 648) },
    681: { want(pl, s, dt) {
      const near = G.EnemyMgr.queryCircle(pl.x, pl.y, 280).some(e => !e.dead && e.behavior !== 'thief');
      s.fightT = near ? 2 : (s.fightT || 0) - dt;
      return s.fightT > 0 ? 1681 : 681;
    } },
    746: { want: (pl, s) => (pl.level >= 20 && frac(pl) >= (s.cur === 1746 ? 0.25 : 0.3) ? 1746 : 746) },
    774: { want: (pl, s) => (frac(pl) <= (s.cur === s.core ? 0.55 : 0.5) ? s.core : 774) },
    778: { want: (pl, s) => (s.busted ? 1778 : 778) },
    845: { want(pl, s, dt) {
      if (s.gulpCd > 0) s.gulpCd -= dt;
      return s.gulp === 'gorging' ? 500845 : s.gulp === 'gulping' ? 510845 : 845;
    } },
    875: { want(pl, s, dt) {
      // La nieve le devuelve la cara de hielo (tras 2 s nevando).
      if (s.iceGone && W() === 'snow') {
        if ((s.snowT = (s.snowT || 0) + dt) >= 2) { s.iceGone = false; s.snowT = 0; }
      } else s.snowT = 0;
      return s.iceGone ? 1875 : 875;
    } },
    877: { want(pl, s, dt) {
      if ((s.hungerT = (s.hungerT || 0) + dt) >= 10) { s.hungerT = 0; s.hangry = !s.hangry; }
      return s.hangry ? 500877 : 877;
    } },
    964: { want(pl, s) {
      // Entrar en la grieta es como salir del combate: al volver, Forma Heroica para el resto de la partida.
      const inA = !!(G.Rift && G.Rift.inArena);
      if (s.wasArena && !inA) s.hero = true;
      s.wasArena = inA;
      return s.hero ? 1964 : 964;
    } },
    1024: { tera: true, want: pl => (pl.powerOn && pl.powerId === 'tera' ? 501024 : 2024) }
  };

  /** Estado nuevo para el Pokémon `dex` (sin regla, null dentro: no hace nada). */
  function init(dex) {
    const fixed = G.FORMS && G.FORMS[dex] && G.FORMS[dex].k === 'battle';
    const s = { base: dex, cur: dex, rule: fixed ? null : RULES[dex] || null, save: null, cd: 0 };
    if (s.rule && dex === 774) s.core = MINIOR_CORES[Math.floor(seed('774:core') * MINIOR_CORES.length)];
    return s;
  }
  /** La fila de una forma (con los stats de FIX, si los tiene). */
  const row = dex => (G.DEX_BY[dex] && FIX[dex] ? Object.assign({}, G.DEX_BY[dex], FIX[dex]) : G.DEX_BY[dex]);
  const usable = dex => !!(G.DEX_BY[dex] && G.SPRITE_META && G.SPRITE_META[dex]);

  // ---------------- cambiar ----------------

  /** Vuelve a la forma base tal cual estaba (sin aviso). */
  function restore(pl, s) {
    const v = s.save;
    if (!v) return;
    const dir = pl.anim.dir;
    pl.mon = v.mon; pl.dex = v.dex; pl.anim = v.anim; pl.scale = v.scale; pl.r = v.r; pl.bodyH = v.bodyH;
    pl.baseAtk = v.baseAtk; pl.baseSpd = v.baseSpd; pl.shiny = v.shiny;
    pl.anim.dir = dir;
    s.save = null; s.cur = s.base;
  }

  /** Pasa a la forma `to` (o a la base). */
  function switchTo(pl, s, to, quiet) {
    if (to !== s.base && !usable(to)) return;
    // (Terapagos con el Teracristal puesto conserva el tipo elegido.)
    const keepTypes = pl.tera && pl.tera !== 'stellar' ? pl.mon.types.slice() : null;
    const was = s.cur;
    restore(pl, s);
    if (to !== s.base) {
      const from = row(s.base), into = row(to);
      s.save = { mon: pl.mon, dex: pl.dex, anim: pl.anim, scale: pl.scale, r: pl.r, bodyH: pl.bodyH, baseAtk: pl.baseAtk, baseSpd: pl.baseSpd, shiny: pl.shiny };
      const k = key => (from[key] && into[key] ? into[key] / from[key] : 1), o = pl.mon;
      const m = Object.assign({}, o, { dex: to, name: into.name, types: into.types.slice(), bst: into.bst, form: 'battle',
        spd: o.spd * k('spd'), pa: o.pa * k('pa'), sa: o.sa * k('sa'), df: o.df * k('df'), sd: o.sd * k('sd') });
      m.atk = Math.max(m.pa, m.sa);
      pl.mon = m;
      pl.baseAtk *= k('atk');
      pl.baseSpd *= k('spd');
      const dir = pl.anim.dir;
      pl.dex = to;
      pl.shiny = s.save.shiny && G.Sprites.hasShiny(to);
      pl.scale = G.Sprites.playerScale(to);
      pl.anim = new G.Sprites.Animator(to, pl.scale, pl.shiny);
      pl.anim.dir = dir;
      pl.anim.skin = null;
      pl.r = G.Sprites.playerRadius(to);
      pl.bodyH = G.Sprites.bodyHeight(to, pl.scale);
      G.Sprites.preload([to], 8000, pl.shiny);
      s.cur = to;
    }
    if (keepTypes) pl.mon = Object.assign({}, pl.mon, { types: keepTypes });
    s.cd = 0.8;
    if (!quiet && was !== s.cur) announce(pl, s.cur, BIG.has(s.cur));
  }

  /** Destello, el nombre de la forma sobre su cabeza y, si cambia mucho, el aviso. */
  function announce(p, dex, big) {
    const r = G.DEX_BY[dex];
    if (!r) return;
    const col = G.U.TYPE_COLOR[r.types[0]] || '#ffffff';
    G.FX.ring(p.x, p.y, p.r, 90, col, 0.45, 4);
    G.FX.burst(p.x, p.y - p.bodyH * 0.5, col, big ? 26 : 12, big ? 190 : 130);
    G.FX.dmgText(p.x, p.y - p.bodyH - 18, G.T(r.name, 'mon'), col, big);
    if (big && !p.remote) {
      G.Audio.sfx('reveal');
      G.Spawner.say(G.I18n.f('¡{x} cambia de forma!', G.T(G.DEX_BY[G.formBase(dex)] ? G.DEX_BY[G.formBase(dex)].name : r.name, 'mon')), 2.2, true);
    }
  }

  /** Cada fotograma, con tu Pokémon (game.js, junto a los poderes). */
  function update(dt, pl) {
    if (!pl || pl.remote || pl.megaSave || pl.dynaSave) return;
    let s = pl.bf;
    const own = s && s.cur === pl.dex ? s.base : pl.dex;
    if (!s || s.base !== own) s = pl.bf = init(own);       // al empezar y tras evolucionar
    if (!s.rule) return;
    if (s.cd > 0) s.cd -= dt;
    const want = s.rule.want(pl, s, dt);
    if (want === s.cur || pl.dead) return;
    if (pl.powerOn && !(s.rule.tera && pl.powerId === 'tera')) return;    // con un poder, se espera
    if (s.cd > 0 && !s.now) return;
    switchTo(pl, s, want, s.silent);
    s.now = false; s.silent = false;
  }

  /** Antes de evolucionar o de un salto de fuerza (player.js): a la forma base, sin aviso; luego se recalcula. */
  function reset(pl) {
    const s = pl && pl.bf;
    if (!s || !s.save || pl.megaSave || pl.dynaSave) return;
    restore(pl, s);
    s.silent = true; s.now = true;
  }

  // ---------------- golpes ----------------

  /** Player.hurt, antes de quitar vida: true = el golpe no hace nada (Disfraz, Cara de Hielo). */
  function block(pl, type, cat, pure) {
    const s = pl.bf;
    if (!s || !s.rule || pl.remote || pure) return false;
    const say = (id, col) => { G.FX.dmgText(pl.x, pl.y - pl.bodyH - 4, G.Mons.abilityName(id) || id, col, true); G.FX.ring(pl.x, pl.y, 6, 70, col, 0.5, 4); };
    if (s.base === 778 && !s.busted) {
      s.busted = true; s.now = true;
      pl.invuln = 0.8; say('disguise', '#f2d16b');
      G.Audio.sfx('break');
      return true;
    }
    if (s.base === 875 && !s.iceGone && cat === 'physical') {
      s.iceGone = true; s.now = true;
      pl.invuln = 0.6; say('ice-face', '#bfe8ff');
      G.FX.burst(pl.x, pl.y - pl.bodyH * 0.6, '#d8f1ff', 16, 160);
      G.Audio.sfx('break');
      return true;
    }
    if (s.base === 845 && s.gulp) spit(pl, s);
    return false;
  }

  /** Tragamisil: escupe la presa contra los de alrededor (Arrokuda frena; Pikachu paraliza). */
  function spit(pl, s) {
    const stun = s.gulp === 'gorging', col = stun ? '#ffd23f' : '#4fb4ff';
    const dmg = (20 + pl.level * 4) * pl.atk;
    for (const e of G.EnemyMgr.queryCircle(pl.x, pl.y, 130)) {
      if (e.dead || e.behavior === 'thief') continue;
      e.hurt(dmg * G.Types.mult(stun ? 'electric' : 'water', e.types || []), col, e.x - pl.x, e.y - pl.y, 160);
      if (stun) e.applyStun(1.2); else e.applySlow(0.5, 2.5);
    }
    G.FX.ring(pl.x, pl.y, 10, 130, col, 0.45, 6);
    G.FX.dmgText(pl.x, pl.y - pl.bodyH - 4, G.Mons.abilityName('gulp-missile') || 'gulp-missile', col, true);
    G.Camera.kick(0.4);
    s.gulp = ''; s.gulpCd = 3; s.now = true;
  }

  /** Ha golpeado con el ataque m (Tragamisil, data/ability-fx.js): un ataque de Agua pesca una presa. */
  function onHit(pl, e, m) {
    const s = pl && pl.bf;
    if (!s || !s.rule || s.base !== 845 || s.gulp || s.gulpCd > 0 || !m || m.type !== 'water') return;
    s.gulp = frac(pl) > 0.5 ? 'gulping' : 'gorging';
  }

  // ---------------- red: lo que ven los demás ----------------

  /** Tu Pokémon de verdad (sin la forma de combate): lo que va en la sala y en el resumen. */
  function ownDex(pl) { const v = saved(pl); return v ? v.dex : pl && pl.dex; }
  /** Cómo era antes de cambiar ({ dex, shiny, anim... }), o null si no lleva forma de combate. */
  function saved(pl) { const s = pl && pl.bf; return s && s.save && pl.dex === s.cur ? s.save : null; }
  /** Su Pokémon sin la forma (para los ataques que le pueden salir, Player.ownMon). */
  function ownMon(pl, m) { const s = pl && pl.bf; return s && s.save && m && m.dex === s.cur ? s.save.mon : m; }
  /** Lo que va en tu estado (coop.js, myState): la forma de combate puesta, o 0. */
  function netCode(pl) { const s = pl && pl.bf; return s && s.save && pl.dex === s.cur ? s.cur : 0; }
  /** Un compañero (copia): se le cambia el dibujo a su forma (su número de Pokémon no se toca). */
  function applyNet(p, code) {
    code = Math.floor(+code || 0);
    const ok = code && G.FORMS && G.FORMS[code] && G.FORMS[code].k === 'battle' && G.formBase(code) === G.formBase(p.dex) && usable(code) && code !== p.dex;
    const to = ok ? code : 0;
    if ((p.bfNet || 0) === to || p.netPw === 1 || !p.anim) return;       // (Dinamax: al acabar se vuelve a mirar)
    const dir = p.anim.dir, dex = to || p.dex;
    p.bfNet = to;
    p.scale = G.Sprites.playerScale(dex);
    p.anim = new G.Sprites.Animator(dex, p.scale, p.shiny && G.Sprites.hasShiny(dex));
    p.anim.dir = dir;
    p.r = G.Sprites.playerRadius(dex);
    p.bodyH = G.Sprites.bodyHeight(dex, p.scale);
    G.Sprites.preload([dex], 8000, p.anim.shiny);
    announce(p, dex, false);
  }

  return {
    RULES, FIX, update, reset, block, onHit, ownDex, saved, ownMon, netCode, applyNet,
    /** Para pruebas: estado de tu Pokémon y forzar cosas (golpe del disfraz, presa, Heroica...). */
    state: pl => pl && pl.bf,
    debugSet(pl, k, v) { const s = pl && pl.bf; if (s) { s[k] = v; s.now = true; } return s; },
    /** Para pruebas (zh_sweep): el destello, el nombre y el aviso de un cambio a `dex`, sin cambiar nada. */
    debugAnnounce(pl, dex) { announce(pl, dex, true); }
  };
})();
