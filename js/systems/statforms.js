/* ============ statforms.js — formas que cambian tipos y stats (25-11-2026, copia local) ============
 * Como el juego oficial (hecho aquí a partir de su guía de poderes, «Formas del Pokémon»): Deoxys,
 * Rotom, Arceus, Shaymin, Hoopa, Oricorio... Pasada la 3.ª grieta (minuto 12; systems/rift.js las
 * cuenta en G.Rift.over) sale UNA vez la carta «¡Elige la forma de...!» y lo elegido vale para el
 * resto de la partida. Formas: las de clase 'stat' de data/forms.js (G.FORMS / G.FORMS_OF).
 *
 *   - Una carta por forma, la normal también (la que llevas, la primera: si se acaba el tiempo en
 *     grupo se queda como está). Cada una con sus tipos y lo que cambia cada stat («±0» lo que no
 *     cambia) y su habilidad si es otra. Arceus y Silvally: una carta por tipo (Normal = el de siempre).
 *   - Al elegir cambian tipos, stats (en proporción, como la Mega de systems/powers.js: tu nivel, tu
 *     naturaleza y tus Mejoras se mantienen; la vida, también en proporción), dibujo y habilidad
 *     (si la forma trae la suya: G.FORMS[d].ab / abl).
 *   - No sale con un poder puesto ni con el de Eternatus por elegir; si luego megaevoluciona, manda la
 *     Mega mientras dura y al acabar vuelve la forma elegida (powers.js guarda y repone el Pokémon).
 *   - Las formas de una evolución (Wormadam, Lycanroc, Toxtricity, Urshifu: evo 1) salen cuando tu
 *     Pokémon ya es esa especie. Si evoluciona a otra especie, la forma deja de valer; si la nueva
 *     tiene la misma forma (Pumpkaboo → Gourgeist, tamaño Súper) se queda con ella sin preguntar.
 *   - Quien tenía una de estas formas de antes (salían en el gacha) puede empezar con ella: la carta
 *     le ofrece las demás, la normal incluida.
 * Cooperativo: cada uno elige la suya; los demás la ven porque va en tu número de Pokémon (coop.js,
 * syncDex), con sus tipos. El resumen de la partida y el ranking la llevan (Game.mySum: pl.dex).
 */
G.StatForms = (() => {
  const TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
  const STATS = [['hp', 'Vida'], ['pa', 'Ataque'], ['sa', 'At. Esp.'], ['df', 'Defensa'], ['sd', 'Def. Esp.'], ['spd', 'Velocidad']];
  const KEYS = ['hp', 'spd', 'pa', 'sa', 'df', 'sd'];
  const SCREENS = ['scr-levelup', 'scr-item', 'scr-bond', 'scr-pause', 'scr-power'];
  const RIFTS = 3;               // tras la 3.ª grieta
  const LATE = 17 * 60;          // (por si acaso: pasado el minuto 17, aunque no se hayan contado las grietas)
  const COLOR = '#8fd0ff';
  let chkT = 0;

  const sp = dex => (G.formBase ? G.formBase(dex) : dex);
  const isStat = d => !!(G.FORMS && G.FORMS[d] && G.FORMS[d].k === 'stat');
  /** Las formas de una especie que se pueden elegir (la normal primero) o [] si no tiene. */
  function formsOf(s) {
    const l = ((G.FORMS_OF || {})[s] || []).filter(d => isStat(d) && G.DEX_BY[d] && G.SPRITE_META[d]);
    return l.length && G.DEX_BY[s] ? [s].concat(l) : [];
  }
  /** Arceus y Silvally: una forma por tipo. */
  const typeForms = l => l.length > 2 && l.slice(1).every(d => TYPES.includes(G.FORMS[d].fk));

  // ---------------- cuándo ----------------

  const due = () => (G.Rift.over || 0) >= RIFTS || ((G.Game.st && G.Game.st.time) || 0) >= LATE;
  function canNow(pl) {
    return G.Game.state === 'playing' && !pl.powerOn && !G.Powers.pending && !pl.megaSave && !pl.dynaSave && !pl.teraSave
      && !G.Rift.inArena && !G.Eternatus.active && !G.Judgment.cinematic && !SCREENS.some(G.UI.isOpen);
  }
  /** Cada fotograma, con tu Pokémon (game.js, tras Powers.update). */
  function update(dt, pl) {
    if (!pl || pl.remote || pl.dead || (chkT -= dt) > 0) return;
    chkT = 0.5;
    const s = sp(pl.dex);
    if (pl.sfFor === s || !due() || !canNow(pl)) return;
    const l = formsOf(s);
    if (l.length < 2) return;
    offer(pl, s, l);
  }

  // ---------------- la carta ----------------

  const pctTxt = k => { const p = Math.round((k - 1) * 100); return p === 0 ? '±0' : (p > 0 ? '+' : '−') + Math.abs(p) + ' %'; };
  const ratio = (to, from, key) => (from[key] ? to[key] / from[key] : 1);
  /** Tipos (sin ellos con noTypes), lo que cambia cada stat respecto a la forma que llevas y la habilidad si cambia (HTML de la carta). */
  function descOf(pl, dex, noTypes) {
    const to = G.DEX_BY[dex], from = G.DEX_BY[pl.dex] || to;
    const types = to.types.map(t => `<b style="color:${G.U.TYPE_COLOR[t]}">${G.U.TYPE_NAME[t]}</b>`).join(' / ');
    const k = STATS.map(([key]) => ratio(to, from, key));
    const same = k.every(x => Math.round((x - 1) * 100) === 0);
    const val = x => { const t = pctTxt(x); return `<b style="color:${t === '±0' ? '#c9d4e6' : x > 1 ? '#7dffa0' : '#ff8f8f'}">${t}</b>`; };
    const stats = same ? `<span>Stats</span> ${val(1)}` : STATS.map(([, lab], i) => `<span>${lab}</span> ${val(k[i])}`).join(' · ');
    const ab = abilityFor(pl, dex), abTxt = ab && ab !== pl.abilId && G.Mons.abilityName(ab)
      ? `<br><span>Habilidad</span>: <b>${G.U.esc(G.Mons.abilityName(ab))}</b>` : '';
    return (noTypes ? '' : types + '<br>') + stats + abTxt;
  }

  function offer(pl, s, l) {
    const cur = pl.dex, base = G.DEX_BY[s];
    G.Sprites.preload(l, 8000, pl.shiny);
    let cards;
    if (typeForms(l)) {
      const of = t => (t === 'normal' ? s : l.find(d => G.FORMS[d] && G.FORMS[d].fk === t));
      const list = TYPES.map(of).filter(Boolean);
      list.sort((a, b) => (b === cur) - (a === cur));
      cards = list.map(d => {
        const t = G.DEX_BY[d].types[0];
        return { id: 'form', arg: d, key: 'form:' + d, title: G.U.TYPE_NAME[t], icon: 'type:' + t, color: G.U.TYPE_COLOR[t],
                 tag: d === cur ? 'La de ahora' : 'Forma', desc: descOf(pl, d, true) };   // (el tipo ya va en el título)
      });
    } else {
      const list = [cur].concat(l.filter(d => d !== cur));
      cards = list.map(d => ({ id: 'form', arg: d, key: 'form:' + d, dex: d, title: G.T(G.DEX_BY[d].name, 'mon'),
        icon: 'star', color: d === cur ? '#8fa3c4' : G.U.TYPE_COLOR[G.DEX_BY[d].types[0]] || COLOR,
        tag: d === cur ? 'La de ahora' : 'Forma', desc: descOf(pl, d) }));
    }
    G.Game.choose(done => {
      G.RunUI.showChoice(G.I18n.f('¡Elige la forma de {x}!', G.T(base.name, 'mon')), 'Sólo una vez: se queda hasta el final de la partida', cards, c => {
        pick(pl, c.arg); done();
      });
    });
  }

  function pick(pl, dex) {
    const s = sp(pl.dex), was = pl.mon.name;
    pl.sfFor = s;
    if (dex === pl.dex || !G.DEX_BY[dex]) { G.Spawner.say(G.I18n.f('{x} se queda con su forma', G.T(was, 'mon')), 2.4, true); return; }
    apply(pl, dex);
    G.Audio.sfx('legend');
    if (G.Cries) G.Cries.play(dex, 'form');            // su grito (core/cries.js)
    G.Game.flash(COLOR, 0.4);
    G.FX.ring(pl.x, pl.y, 8, 140, COLOR, 0.8, 6);
    G.FX.burst(pl.x, pl.y - pl.bodyH * 0.5, '#e8f6ff', 40, 240);
    G.Spawner.say(G.I18n.f('¡{x} cambia a {x}!', G.T(was, 'mon'), G.T(G.DEX_BY[dex].name, 'mon')), 3, true);
  }

  // ---------------- cambiar de forma ----------------

  /** La habilidad con la forma `dex`: la suya si la trae (G.FORMS ab / abl); si no, la que tenía. */
  function abilityFor(pl, dex) {
    const sf = pl.sf || { ab0: pl.abilId, slot: slotOf(pl), d0: pl.dex };
    const f = G.FORMS && G.FORMS[dex];
    if (!isStat(dex)) return isStat(sf.d0) && !pl.noMastery ? G.Mons.abilityOf(dex).id || sf.ab0 : sf.ab0;   // la normal
    if (f.abl && f.abl.some(Boolean)) return f.abl[sf.slot] || f.ab || sf.ab0;
    const own = (G.DEX_ABIL && G.DEX_ABIL[f.d]) || [];
    return f.ab && !own.includes(f.ab) ? f.ab : sf.ab0;
  }
  const slotOf = pl => (pl.noMastery ? 0 : G.Mons.abilityOf(pl.dex).slot || 0);

  /**
   * Pasa a la forma `dex`: tipos, stats en proporción (como la Mega), dibujo y habilidad.
   * (Sin poder puesto: la Mega guarda el Pokémon y lo repone al acabar.)
   */
  function apply(pl, dex) {
    const to = G.DEX_BY[dex], from = G.DEX_BY[pl.dex];
    if (!to || !from || dex === pl.dex) return false;
    if (!pl.sf) pl.sf = { d0: pl.dex, ab0: pl.abilId || '', slot: slotOf(pl), sh0: !!pl.shiny, skin0: pl.anim.skin || null, lk0: pl.lookDex || 0 };
    const k = key => ratio(to, from, key);
    const ab = abilityFor(pl, dex);
    // Stats: los de la partida × lo que cambia la forma (la vida, en proporción y sin perder el % que llevas).
    const m = Object.assign({}, to, { nature: pl.mon.nature, hp: Math.round(pl.mon.hp * k('hp')), spd: pl.mon.spd * k('spd'),
      pa: pl.mon.pa * k('pa'), sa: pl.mon.sa * k('sa'), df: pl.mon.df * k('df'), sd: pl.mon.sd * k('sd') });
    m.atk = Math.max(m.pa, m.sa);
    const frac = pl.maxHp > 0 ? pl.hp / pl.maxHp : 1;
    pl.maxHp = Math.max(1, pl.maxHp + (m.hp - pl.mon.hp));
    pl.hp = Math.max(1, Math.min(pl.maxHp, pl.maxHp * frac));
    pl.mon = m;
    pl.baseAtk *= to.atk / Math.max(0.01, from.atk);
    pl.baseSpd *= k('spd');
    // La escalera de fuerza (G.Mons.ladderFor: los niveles 20 y 40) también, o al subir volvería a la forma de antes.
    if (pl.ladder) pl.ladder = pl.ladder.map(st => {
      const o = Object.assign({}, st);
      for (const key of KEYS) if (o[key] != null) o[key] = key === 'hp' || key === 'spd' ? Math.round(o[key] * k(key)) : o[key] * k(key);
      o.atk = Math.max(o.pa, o.sa);
      return o;
    });
    look(pl, dex);
    if (ab && ab !== pl.abilId) swapAbility(pl, ab);
    return true;
  }

  /** El dibujo de la forma (misma dirección; la skin y el aspecto del Vestidor, sólo con la de siempre). */
  function look(pl, dex) {
    const sf = pl.sf, dir = pl.anim.dir, back = dex === sf.d0;
    pl.dex = dex;
    pl.shiny = sf.sh0 && G.Sprites.hasShiny(dex);
    pl.scale = G.Sprites.playerScale(dex);
    pl.anim = new G.Sprites.Animator(dex, pl.scale, pl.shiny);
    pl.anim.dir = dir;
    pl.anim.skin = back ? sf.skin0 : null;
    pl.r = G.Sprites.playerRadius(dex);
    pl.bodyH = G.Sprites.bodyHeight(dex, pl.scale);
    pl.lookDex = back ? sf.lk0 : 0;
    if (pl.lookDex && G.Dress) G.Dress.setLook(pl, pl.lookDex);
    G.Sprites.preload([dex], 8000, pl.shiny);
  }

  /*
   * Otra habilidad en plena partida. Lo que la de antes hizo al empezar (start: +crítico, ×imán...) se
   * deshace: se aplica dos veces a una copia y se mira si suma o multiplica.
   */
  const snap = o => { const r = {}; for (const key of Object.keys(o)) if (typeof o[key] === 'number' && Number.isFinite(o[key])) r[key] = o[key]; return r; };
  function swapAbility(pl, id) {
    const old = pl.abil;
    if (old && old.start) {
      try {
        const c = Object.assign(Object.create(Object.getPrototypeOf(pl)), pl, { mon: Object.assign({}, pl.mon) });
        const b0 = snap(c); old.start(c); const b1 = snap(c); old.start(c); const b2 = snap(c);
        for (const key of Object.keys(b1)) {
          if (key === 'hp' || !(key in b0) || b1[key] === b0[key]) continue;
          const mul = b0[key] !== 0 && b1[key] !== 0 && Math.abs(b2[key] / b1[key] - b1[key] / b0[key]) < 1e-9 && Math.abs((b2[key] - b1[key]) - (b1[key] - b0[key])) > 1e-9;
          pl[key] = mul ? pl[key] / (b1[key] / b0[key]) : pl[key] - (b1[key] - b0[key]);
        }
      } catch (e) { /* (una habilidad rara: se queda lo que hizo) */ }
    }
    if (old && old.cdMul) pl.cdMul /= old.cdMul;
    pl.setAbility(id);
    pl.hp = Math.min(pl.hp, pl.maxHp);
  }

  /**
   * Ha evolucionado (Player.evolveTo): la forma de antes ya no vale. Si ya había elegido y la nueva
   * especie tiene esa misma forma (Pumpkaboo Súper → Gourgeist Súper), se queda con ella.
   */
  function evolved(pl, fromDex) {
    if (!pl.sfFor) return;
    const s = sp(pl.dex), l = formsOf(s);
    if (!l.length) return;
    const fk = isStat(fromDex) ? G.FORMS[fromDex].fk : '';
    const same = fk ? l.find(d => isStat(d) && G.FORMS[d].fk === fk) : 0;
    pl.sfFor = s;
    if (same) apply(pl, same);
  }

  /** Para el ranking por Pokémon: la especie de una forma de éstas (Deoxys Ataque cuenta como Deoxys). */
  const boardDex = d => (isStat(d) ? G.FORMS[d].d : d);

  return {
    TYPES, formsOf, update, apply, evolved, boardDex, abilityFor,
    /** Para pruebas: la carta ya (sin esperar a la 3.ª grieta). */
    debugOffer(pl) { pl = pl || G.Game.player; const s = sp(pl.dex), l = formsOf(s); if (l.length < 2) return false; pl.sfFor = 0; offer(pl, s, l); return true; },
    /** Para pruebas: elegir una forma sin la carta. */
    debugPick(pl, dex) { pick(pl || G.Game.player, dex); }
  };
})();
