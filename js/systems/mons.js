/* ============ mons.js — naturaleza, habilidad y MT de cada Pokémon ============
 * (20-10-2026, de la Tienda Kecleon del PR #236 de TheAdro7, adaptado.)
 *
 * Cada Pokémon de tu colección tiene:
 *   - NATURALEZA (data/natures.js): +10 % a un stat y −10 % a otro, como en los
 *     juegos (5 son neutras). Se cambia con una Menta.
 *   - HABILIDAD (data/abilities.js, efecto en data/ability-fx.js): una de las
 *     suyas; la oculta sale 1 de cada 20. Se cambia con una Cápsula Habilidad
 *     (la oculta, con la Cápsula Habilidad Oculta).
 *   - MT aprendidas: ataques que no son de sus tipos pero sí los aprende en los
 *     juegos (Mewtwo, Bola Sombra; Psyduck, Lanzallamas no). Salen en sus cartas
 *     de nivel y se pueden elegir de movimiento inicial (G.Moves.poolFor).
 *     Desde el 23-11-2026 (como el juego oficial) la MT vacía de la Tienda Kecleon
 *     borra una (forget); si ese ataque estaba vetado, el veto se quita también.
 *
 * Lo que le TOCÓ (naturaleza y habilidad) no se guarda: sale "al azar" pero fijo
 * para cada cuenta y Pokémon (semilla: fecha de creación de la partida + nº de la
 * Pokédex), así todos los aparatos de la misma cuenta ven lo mismo y también los
 * Pokémon que ya tenías antes de esto tienen la suya. Lo cambiado con Menta o
 * Cápsula sí se guarda (save.pnat / save.pabil, con la fecha para fusionar).
 */
G.Mons = (() => {
  const HIDDEN_RATE = 1 / 20;
  const save = () => G.DB && G.DB.save;

  /** Nombre en el idioma del juego: [es, en, fr, it, zh-Hans, zh-Hant] (pt-BR, el inglés). */
  const LANG_I = { es: 0, en: 1, fr: 2, it: 3, 'pt-BR': 1, 'zh-Hans': 4, 'zh-Hant': 5 };
  function name(n) {
    if (!Array.isArray(n)) return String(n || '');
    // Copia local: con el parche de chino (js/zh-tw.js) va la columna zh-Hant; por el diccionario no se puede,
    // "Rara" o "Potencia" ya significan otra cosa allí.
    if (window.PSZH_DICT && n[5]) return n[5];
    return n[LANG_I[G.I18n ? G.I18n.lang : 'es'] || 0] || n[1] || n[0];
  }

  // Número pseudoaleatorio fijo para (cuenta, Pokémon, sal), entre 0 y 1.
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }
  const roll = (dex, salt) => hash(((save() && save().created) || 0) + ':' + dex + ':' + salt);

  // ---------------- naturaleza ----------------

  /** La que le tocó (sin Menta). */
  function rolledNature(dex) { return G.NATURES[Math.floor(roll(dex, 'nat') * G.NATURES.length)]; }
  /** La que tiene ahora: la de la Menta o la que le tocó. */
  function natureOf(dex) {
    const s = save(), p = s && s.pnat && s.pnat[dex];
    return (p && G.NATURE_BY[p[0]]) || rolledNature(dex);
  }
  function setNature(dex, id) {
    const s = save();
    if (!s || !G.NATURE_BY[id]) return;
    s.pnat = s.pnat || {};
    s.pnat[dex] = [id, Date.now()];
  }

  /**
   * El Pokémon con su naturaleza aplicada (una copia: G.DEX_BY no se toca).
   * pa/sa: daño de sus ataques físicos/especiales · df/sd: defensas · spd: velocidad.
   */
  function monFor(dex) {
    const base = G.DEX_BY[dex];
    if (!base) return base;
    const n = natureOf(dex), m = Object.assign({}, base);
    if (n.up) m[n.up] = base[n.up] * 1.1;
    if (n.down) m[n.down] = base[n.down] * 0.9;
    m.atk = Math.max(m.pa, m.sa);
    m.nature = n.id;
    return m;
  }

  // ---------------- habilidad ----------------

  /** [habilidad 1, habilidad 2 o 0, oculta o 0] */
  // Las formas propias de esta copia (Mega, regionales... nº = base + 1000·k) no vienen en los datos de
  // PokeAPI: usan las de su forma base.
  const baseDex = dex => (G.formBase ? G.formBase(dex) : dex);   // (25-11-2026: data/forms.js; los números del oficial no se restan)
  // (25-11-2026) Las formas del juego oficial traen las suyas (data/forms.js).
  const formAbil = dex => { const f = G.FORMS && G.FORMS[dex]; return f && f.abl && f.abl.some(Boolean) ? f.abl : null; };
  const slots = dex => (G.DEX_ABIL && (G.DEX_ABIL[dex] || formAbil(dex) || G.DEX_ABIL[baseDex(dex)])) || [0, 0, 0];
  /** Hueco que le tocó: 2 (oculta) 1 de cada 20 si tiene; si no, 0 o 1. */
  function rolledSlot(dex) {
    const l = slots(dex);
    if (l[2] && roll(dex, 'hid') < HIDDEN_RATE) return 2;
    return l[1] && roll(dex, 'abil') < 0.5 ? 1 : 0;
  }
  /** { id, slot }: la de la Cápsula o la que le tocó. */
  function abilityOf(dex) {
    const s = save(), p = s && s.pabil && s.pabil[dex], l = slots(dex);
    let slot = p && l[p[0]] ? p[0] : rolledSlot(dex);
    if (!l[slot]) slot = 0;
    return { id: l[slot] || '', slot };
  }
  /** Huecos a los que se puede cambiar (la oculta, sólo con la Cápsula Oculta). */
  function abilityChoices(dex, hidden) {
    const l = slots(dex), cur = abilityOf(dex).slot;
    return [0, 1, 2].filter(i => l[i] && i !== cur && (i < 2 || hidden) && !(i === 1 && l[1] === l[0]));
  }
  function setAbility(dex, slot) {
    const s = save();
    if (!s || !slots(dex)[slot]) return;
    s.pabil = s.pabil || {};
    s.pabil[dex] = [slot, Date.now()];
  }
  const abilityName = id => (id && G.ABIL[id] ? name(G.ABIL[id]) : '');

  // ---------------- MT ----------------

  /** Movimientos que ha aprendido con MT. */
  function taught(dex) {
    const s = save(), l = s && s.ptm && s.ptm[dex];
    return Array.isArray(l) ? l.filter(id => G.Moves.BY_ID[id]) : [];
  }
  /** ¿Ya lo sabe sin MT (es de sus tipos)? */
  const natural = (dex, id) => G.Moves.poolFor(G.DEX_BY[dex], true).includes(id);
  /** MT que puede aprender (las que no sabe ya). */
  function learnable(dex) { return (G.TM_OF(dex).length ? G.TM_OF(dex) : G.TM_OF(baseDex(dex))).filter(id => G.Moves.BY_ID[id] && !natural(dex, id) && !taught(dex).includes(id)); }
  const canLearn = (dex, id) => learnable(dex).includes(id);
  /** Enseña una MT de la Mochila (se gasta). → true si se ha aprendido. */
  function teach(dex, id) {
    const s = save();
    if (!s || !canLearn(dex, id) || !G.Shop.takeTm(id)) return false;
    s.ptm = s.ptm || {};
    s.ptm[dex] = taught(dex).concat([id]);
    s.ptmT = s.ptmT || {};
    s.ptmT[dex + ':' + id] = Date.now();          // (para fusionar con la nube: gana lo último, ver db.js)
    return true;
  }
  /**
   * MT vacía: le borra a `dex` la MT `id` (se gasta una de la Mochila). Si estaba vetada, el veto
   * se quita (no ocupa un hueco de Veto con un ataque que ya no le puede salir); y si era su
   * movimiento inicial elegido, vuelve al de serie. → true si se ha borrado.
   */
  function forget(dex, id) {
    const s = save();
    if (!s || !taught(dex).includes(id) || !G.Shop.take('tmx')) return false;
    s.ptm[dex] = taught(dex).filter(x => x !== id);
    if (!s.ptm[dex].length) delete s.ptm[dex];
    s.ptmT = s.ptmT || {};
    s.ptmT[dex + ':' + id] = -Date.now();
    for (const k of ['pban', 'pstart', 'pstart2']) {
      const cur = s[k] && s[k][dex];
      if (k === 'pban' ? !(Array.isArray(cur) && cur.includes(id)) : cur !== id) continue;
      if (k === 'pban') s.pban[dex] = cur.filter(x => x !== id); else delete s[k][dex];
      if (G.DB.touchPick) G.DB.touchPick(k, dex);
    }
    return true;
  }

  // ---------------- fuerza al empezar la partida (23-11-2026, como el juego oficial) ----------------
  /*
   * Escalera de fuerza: con qué stats empieza tu Pokémon y a cuáles llega en los niveles 20 y 40
   * (entities/player.js, stepLadder). → [al empezar, nivel 20, nivel 40] o null
   *   - primera fase con evolución (Charmander, Pikachu): null, crece evolucionando (cartas)
   *   - ya evolucionado (Charizard): empieza con la fuerza de su primera fase (Charmander), en el 20 la
   *     de la fase de en medio y en el 40 la suya. Los bebés (Pichu) no cuentan como primera fase.
   *   - sin evolución (Mewtwo): empieza con el 65 % de sus stats base y llega al 100 % en el 40.
   * Con su naturaleza: la fuerza de las fases anteriores se saca en proporción a la suya.
   */
  let PRE = null, BABY = null;
  function preOf(dex) {
    if (!PRE) { PRE = {}; for (const [f, list] of Object.entries(G.EVOS || {})) for (const t of list) PRE[t] = +f; }
    return PRE[dex] || 0;
  }
  /** La familia hasta él, de la primera fase (sin bebés) a él. */
  function lineOf(dex) {
    if (!BABY) BABY = new Set(G.EVO_BABY || []);
    const out = [dex];
    for (let d = preOf(dex); d && !BABY.has(d) && out.length < 4; d = preOf(d)) out.unshift(d);
    return out;
  }
  const KEYS = ['hp', 'spd', 'pa', 'sa', 'df', 'sd'];
  // (Vida y velocidad, en números enteros como las de G.DEX.)
  const withAtk = o => Object.assign(o, { hp: Math.round(o.hp), spd: Math.round(o.spd), atk: Math.max(o.pa, o.sa) });
  const statsOf = m => withAtk(Object.fromEntries(KEYS.map(k => [k, m[k]])));
  const mix = (a, b, k) => withAtk(Object.fromEntries(KEYS.map(x => [x, a[x] + (b[x] - a[x]) * k])));
  /** El k (0..1) de sus stats BASE, en las unidades del juego (tools/fetch_pokedex.py: vida = 70 + base × 0,45...). */
  const weaken = (m, k) => withAtk({ hp: 70 + (m.hp - 70) * k, spd: 78 + (m.spd - 78) * k, pa: 0.70 + (m.pa - 0.70) * k,
                                     sa: 0.70 + (m.sa - 0.70) * k, df: m.df * k, sd: m.sd * k });
  /** Los stats de otra fase (dex) en proporción a los de `mon` (con su naturaleza). */
  function asStage(mon, dex) {
    const me = G.DEX_BY[mon.dex], st = G.DEX_BY[dex];
    if (!me || !st) return statsOf(mon);
    return withAtk(Object.fromEntries(KEYS.map(k => [k, me[k] ? mon[k] * st[k] / me[k] : mon[k]])));
  }
  function ladderFor(mon) {
    if (!mon || !G.EVOS) return null;
    const line = lineOf(mon.dex), evolves = !!(G.EVOS[mon.dex] || []).length, own = statsOf(mon);
    if (line.length === 1) {
      if (evolves) return null;
      const s0 = weaken(mon, 0.65);
      return [s0, mix(s0, own, 0.5), own];
    }
    const s0 = asStage(mon, line[0]);
    return [s0, line.length >= 3 ? asStage(mon, line[line.length - 2]) : mix(s0, own, 0.5), own];
  }

  return { name, natureOf, setNature, rolledNature, monFor, abilityOf, abilityChoices, setAbility, abilityName,
           slots, taught, learnable, canLearn, teach, forget, natural, ladderFor, lineOf };
})();
