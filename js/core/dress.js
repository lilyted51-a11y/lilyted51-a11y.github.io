/* ============ dress.js — lo que lleva puesto cada Pokémon (Vestidor, 23-11-2026, copia local) ============
 * Como la Gran Actualización del juego oficial (hecho aquí a partir de su descripción): en el
 * Vestidor (ui/wardrobe-ui.js) se elige, para cada Pokémon, su versión (normal o shiny, si la
 * tienes), su aspecto (formas que sólo cambian el dibujo), su skin (core/skins.js), sus efectos
 * y su estela (entities/trails.js). Lo de las skins sigue en save.pskin; lo demás va en:
 *
 *   save.trails { id: fecha }                    estelas compradas (para siempre; se unen al fusionar)
 *   save.pdress { dex: [{ sh, lk, fx, tr }, fecha] }  lo elegido de cada Pokémon (gana lo elegido más tarde)
 *       sh  1 = jugar con su shiny · lk  dex de la forma (0 = la normal)
 *       fx  efecto ('' ninguno; sin elegir: brillos si es shiny) · tr  estela ('' ninguna)
 *
 * Del compañero, la versión manda save.partnerShiny (el menú y la Colección también lo cambian).
 * En grupo, la estela, el efecto y el aspecto van en el estado de cada jugador (net/coop.js).
 */
G.Dress = (() => {
  function get(s, dex) { const e = s && s.pdress && s.pdress[dex]; return (e && e[0] && typeof e[0] === 'object') ? e[0] : {}; }
  function set(s, dex, patch) {
    s.pdress = s.pdress || {};
    const cur = Object.assign({}, get(s, dex), patch);
    for (const k of Object.keys(cur)) if (cur[k] === undefined) delete cur[k];
    s.pdress[dex] = [cur, Date.now()];
  }

  // ---------------- versión ----------------
  function shinyOf(s, dex) {
    dex = +dex;
    if (!s || !G.DB.ownsShiny(dex)) return false;
    return dex === s.partner ? !!s.partnerShiny : !!get(s, dex).sh;
  }
  function setShiny(s, dex, on) {
    set(s, +dex, { sh: on ? 1 : 0 });
    if (+dex === s.partner) s.partnerShiny = !!on;
  }

  // ---------------- aspecto ----------------
  // Formas que sólo cambian el dibujo (25-11-2026): las de clase «look» del juego oficial (data/forms.js: las letras
  // de Unown, los motivos de Vivillon, las Alcremie, los disfraces de Pikachu, las hembras...; ~227), y dos nuestras
  // que el oficial no tiene: Xerneas Neutral y Dialga Primigenio (de Mystery Dungeon; antes salía en el gacha).
  // (Antes se buscaban por nombre, mismos tipos y dex % 1000: fallaba con las especies 1000-1025 y los números del
  // oficial.) Van por número: Unown B…Z, !, ?; las Alcremie, por crema y adorno.
  const EXTRA = { 483: [2483], 716: [1716] };
  const looksCache = {};
  function looks(dex) {
    dex = +dex;
    if (looksCache[dex]) return looksCache[dex];
    const ids = ((G.FORMS_OF && G.FORMS_OF[dex]) || []).filter(d => G.FORMS[d].k === 'look').concat(EXTRA[dex] || []);
    const l = !G.DEX_BY[dex] || dex > 1025 ? [] : ids.map(d => G.DEX_BY[d]).filter(p => p && (!G.SPRITE_META || G.SPRITE_META[p.dex]));
    return (looksCache[dex] = l);
  }
  /** Grupo de un aspecto en el Vestidor ('' = sin grupo): las 62 Alcremie, por su crema. */
  function lookGroup(d) {
    const f = G.FORMS && G.FORMS[d], m = f && f.d === 869 && /^(.+)-[a-z]+-sweet$/.exec(f.fk || '');
    return m ? m[1] : '';
  }
  function lookOf(s, dex) { const lk = +get(s, dex).lk || 0; return lk && looks(dex).some(p => p.dex === lk) ? lk : 0; }

  // ---------------- efectos y estela ----------------
  const ownsTrail = (s, id) => !!(s && s.trails && s.trails[id]);
  function trailOf(s, dex) { const id = get(s, dex).tr; return id && G.Trails.BY[id] && ownsTrail(s, id) ? id : ''; }
  function fxOf(s, dex) {
    const v = get(s, dex).fx;
    if (v === undefined) return shinyOf(s, dex) ? 'shine' : '';
    return G.Trails.FX[v] ? v : '';
  }
  const ownedTrails = s => G.Trails.LIST.filter(t => ownsTrail(s, t.id));

  // ---------------- en la partida ----------------

  /** Tu Pokémon al empezar: estela, efecto y aspecto. */
  function applyRun(pl, s, dex) {
    pl.trail = trailOf(s, dex);
    pl.dfx = fxOf(s, dex);
    const lk = lookOf(s, dex);
    pl.lookDex = lk || 0;
    if (lk) setLook(pl, lk);
  }
  /** Cambia sólo el dibujo (misma escala de juego: el tamaño es el de la forma). */
  function setLook(pl, lk) {
    const dir = pl.anim.dir;
    pl.anim = new G.Sprites.Animator(lk, pl.scale, pl.shiny && G.Sprites.hasShiny(lk));
    pl.anim.dir = dir;
    pl.anim.skin = null;
    G.Sprites.preload([lk], 8000, pl.anim.shiny);
  }
  /** Lo que va en el estado de cada jugador (coop.js, myState): [estela, efecto, aspecto]. */
  function netCode(pl) { return [pl.trail || '', pl.dfx || '', pl.lookDex || 0]; }
  /** Lo de un compañero (readState: n.tr, n.fx, n.lk). */
  function applyNet(pl, n) {
    if (!pl || !n) return;
    pl.trail = n.tr && G.Trails.BY[n.tr] ? n.tr : '';
    pl.dfx = n.fx && G.Trails.FX[n.fx] ? n.fx : '';
    const lk = n.lk && looks(pl.dex).some(p => p.dex === n.lk) ? n.lk : 0;
    // (Con un poder puesto el dibujo lo lleva el poder; al acabar se vuelve a mirar.)
    if (pl.megaSave || pl.dynaSave || pl.netPw === 1 || pl.netPw === 3) return;   // (3: Gigamax, systems/powers.js)
    if ((pl.lookDex || 0) !== lk) {
      pl.lookDex = lk;
      if (lk) setLook(pl, lk);
      else { const dir = pl.anim.dir; pl.anim = new G.Sprites.Animator(pl.dex, pl.scale, pl.shiny); pl.anim.dir = dir; }
    }
  }

  // ---------------- partida guardada ----------------

  /** Quita lo imposible (lo llama db.js al cargar). */
  function clean(s) {
    const num = v => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0);
    if (!s.trails || typeof s.trails !== 'object' || Array.isArray(s.trails)) s.trails = {};
    for (const id of Object.keys(s.trails)) if ((G.Trails && !G.Trails.BY[id]) || !Number.isFinite(+s.trails[id])) delete s.trails[id];
    // La del Team Rocket se gana en el Casino Rocket (save.unlocks.rocketTrail, systems/casino.js).
    if (s.unlocks && +s.unlocks.rocketTrail > 0 && !s.trails.rocket) s.trails.rocket = +s.unlocks.rocketTrail;
    if (!s.pdress || typeof s.pdress !== 'object' || Array.isArray(s.pdress)) s.pdress = {};
    for (const d of Object.keys(s.pdress)) {
      const e = s.pdress[d], v = Array.isArray(e) && e[0] && typeof e[0] === 'object' && !Array.isArray(e[0]) ? e[0] : null;
      if (!v || (G.DEX_BY && !G.DEX_BY[d])) { delete s.pdress[d]; continue; }
      const o = {};
      if (v.sh === 0 || v.sh === 1) o.sh = v.sh;
      if (Number.isFinite(+v.lk) && +v.lk > 0) o.lk = Math.floor(+v.lk);
      if (typeof v.fx === 'string' && (v.fx === '' || !G.Trails || G.Trails.FX[v.fx])) o.fx = v.fx;
      if (typeof v.tr === 'string' && (v.tr === '' || !G.Trails || G.Trails.BY[v.tr])) o.tr = v.tr;
      s.pdress[d] = [o, num(e[1])];
    }
  }

  return { get, set, shinyOf, setShiny, looks, lookGroup, lookOf, ownsTrail, trailOf, fxOf, ownedTrails, applyRun, setLook, netCode, applyNet, clean };
})();
