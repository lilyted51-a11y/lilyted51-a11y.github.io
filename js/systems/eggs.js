/* ============ eggs.js — huevos: se consiguen, se incuban jugando y se abren en la Mochila ============
 * (23-11-2026; como en el juego oficial desde la Gran Actualización del 13-11, hecho aquí a partir de sus
 * novedades.) La pantalla (Mochila y eclosión) está en ui/eggs-ui.js.
 *
 * De dónde salen (cada fuente, su clase de huevo):
 *   Huevo común    (motas verdes)   el primer legendario de grieta que vences en cada partida; llega al acabarla
 *   Huevo raro     (motas azules)   cada misión semanal recogida
 *   Huevo místico  (motas doradas)  cada 10 tiradas ×10 del gacha (una ×100 cuenta como 10 y una ×1000 como 100)
 *
 * Se incuban todos a la vez con el tiempo que juegas (cualquier partida, también en grupo; se suma al acabarla):
 *   común 15 min · raro 30 min · místico 45 min. Cuando está listo, «Abrir» en la Mochila. Con cuenta, abrir
 *   necesita conexión (como el gacha): se sube a la nube al momento.
 *
 * Qué sale (se decide al conseguir el huevo y va guardado en él):
 *   común    rareza 1-2-3 (55/35/10 %)   shiny 1 de 40
 *   raro     rareza 2-3-4 (30/45/25 %)   shiny 1 de 25
 *   místico  rareza 3-4-5 (35/45/20 %)   shiny 1 de 15      (en el gacha, 1 de 100)
 *   La mitad de las veces, uno de esa rareza que aún no tienes. Sin legendarios ni singulares, ni megas, Gigamax
 *   o formas de poder; SÍ las formas regionales (Vulpix de Alola, Zorua de Hisui, Meowth de Galar, Wooper de
 *   Paldea…), que se abren como cualquier otro (en el oficial se quedaban sin eclosionar). Repetido: Pokémonedas
 *   como en el gacha (un shiny repetido, el triple).
 *
 * Guardado (core/db.js):
 *   save.eggs      { id: { k, f, at, p, d, s } }   k 'c'|'r'|'m' · f 'rift'|'mission'|'gacha' · at cuándo ·
 *                                                  p segundos incubados · d el Pokémon · s 1 si sale shiny
 *   save.eggsOpen  { id: [dex, shiny, fecha] }      los ya abiertos
 *   save.stats.x10 tiradas ×10 hechas (para el huevo del gacha) · stats.eggs conseguidos · stats.hatched abiertos
 * Al juntar dos aparatos (db.js, merge): unión de huevos, el mayor progreso de cada uno, y uno abierto en
 * cualquiera de los dos ya no vuelve. El de una misión tiene un id fijo (semana + misión): recogido en dos
 * aparatos, sigue siendo un solo huevo. Abrir quita el huevo y lo apunta en eggsOpen en el mismo paso, así un
 * doble toque no lo abre dos veces.
 */
G.Eggs = (() => {
  const KINDS = {
    c: { name: 'Huevo común', need: 15 * 60, rar: [[1, 55], [2, 35], [3, 10]], shiny: 1 / 40, col: '#5fe08a' },
    r: { name: 'Huevo raro', need: 30 * 60, rar: [[2, 30], [3, 45], [4, 25]], shiny: 1 / 25, col: '#4fb4ff' },
    m: { name: 'Huevo místico', need: 45 * 60, rar: [[3, 35], [4, 45], [5, 20]], shiny: 1 / 15, col: '#ffcb3d' }
  };
  const FROM = { rift: 'c', mission: 'r', gacha: 'm' };
  const FROM_NAME = { rift: 'De una grieta', mission: 'De una misión semanal', gacha: 'Del gacha' };
  const PER_EGG = 10;                       // tiradas ×10 por huevo del gacha
  const REGIONAL = /^(Alolan|Galarian|Hisuian|Paldean) /;
  const ID_OK = /^[a-z0-9-]{1,40}$/;

  let pend = 0;          // huevo de grieta ganado en esta partida (llega al acabarla)
  let lastRun = null;    // lo de la última partida, para el resumen (ui/run-ui.js)

  const save = () => G.DB.save;
  const need = e => KINDS[e.k] ? KINDS[e.k].need : Infinity;
  const ready = e => !!e && (+e.p || 0) >= need(e);

  // ---------------- qué puede salir ----------------

  /** ¿Puede salir de un huevo? (con dibujo, de la gacha, no legendario; formas: sólo las regionales) */
  function hatchable(p) {
    return !!(p && G.SPRITE_META[p.dex] && !p.excl && !p.leg && (p.dex <= 1025 || REGIONAL.test(p.name)));
  }
  let pools = null;
  function pool(r) {
    if (!pools) {
      pools = {};
      for (const p of G.DEX) if (hatchable(p)) (pools[p.rarity] = pools[p.rarity] || []).push(p);
    }
    return pools[r] || [];
  }

  /** El Pokémon de un huevo nuevo de la clase `k` → { d, s }. */
  function roll(k, s) {
    const K = KINDS[k] || KINDS.c;
    let t = Math.random() * K.rar.reduce((a, [, w]) => a + w, 0), r = K.rar[K.rar.length - 1][0];
    for (const [rr, w] of K.rar) if ((t -= w) <= 0) { r = rr; break; }
    let list = pool(r);
    for (let d = 1; !list.length && d < 5; d++) list = pool(r - d).length ? pool(r - d) : pool(r + d);
    const miss = list.filter(p => !(s && s.owned && s.owned[p.dex]));
    const mon = miss.length && Math.random() < 0.5 ? G.U.pick(miss) : G.U.pick(list);
    return { d: mon.dex, s: G.Sprites.hasShiny(mon.dex) && Math.random() < K.shiny ? 1 : 0 };
  }

  // ---------------- conseguir ----------------

  const newId = () => 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /**
   * Un huevo nuevo de esa fuente ('rift' | 'mission' | 'gacha') en la partida guardada (no la sube: lo hace quien
   * llama, con G.DB.commit). `id` fijo para los de misión. → el huevo (con su id), o null si ya estaba.
   */
  function add(from, id, s = save()) {
    if (!s || !FROM[from]) return null;
    s.eggs = s.eggs || {}; s.eggsOpen = s.eggsOpen || {}; s.stats = s.stats || {};
    id = String(id || newId()).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || newId();
    if (s.eggs[id] || s.eggsOpen[id]) return null;
    const k = FROM[from];
    const e = Object.assign({ k, f: from, at: Date.now(), p: 0 }, roll(k, s));
    s.eggs[id] = e;
    s.stats.eggs = (s.stats.eggs || 0) + 1;
    return Object.assign({ id }, e);
  }

  /** Misión semanal recogida (systems/progress.js): su huevo, con id de la semana y la misión. */
  function fromMission(week, missionId) { return add('mission', week + '-' + missionId); }

  /** Tiradas del gacha (systems/gacha.js): `blocks` tiradas ×10 más. → los huevos que tocan (cada PER_EGG). */
  function fromPulls(s, blocks) {
    if (!s || !(blocks > 0)) return [];
    const S = s.stats = s.stats || {};
    const before = +S.x10 || 0;
    S.x10 = before + blocks;
    const out = [];
    for (let i = Math.floor(before / PER_EGG); i < Math.floor(S.x10 / PER_EGG); i++) { const e = add('gacha', null, s); if (e) out.push(e); }
    return out;
  }
  /** Tiradas ×10 que faltan para el próximo huevo del gacha. */
  const toNext = (s = save()) => PER_EGG - ((+((s && s.stats) || {}).x10 || 0) % PER_EGG);

  /** Has vencido al legendario de la grieta (rift.js, una vez por partida, en cada ordenador): llega al acabar. */
  function riftWon() {
    pend = 1;
    const pl = G.Game && G.Game.player;
    if (pl && G.FX) G.FX.dmgText(pl.x, pl.y - pl.bodyH - 26, G.T('¡Huevo!'), KINDS.c.col, true);
  }

  // ---------------- incubar ----------------

  /**
   * Fin de una partida (systems/progress.js, 'runEnd'; en grupo, cada uno la suya): el tiempo jugado incuba
   * todos los huevos y llega el de la grieta, si lo ganaste (ése empieza de cero).
   */
  function runEnd(time, s = save()) {
    if (!s) return;
    const secs = Math.max(0, Math.floor(+time || 0));
    s.eggs = s.eggs || {};
    let hatchNow = 0;
    for (const id of Object.keys(s.eggs)) {
      const e = s.eggs[id];
      if (!e || !KINDS[e.k]) continue;
      const was = ready(e);
      e.p = Math.min(need(e), (+e.p || 0) + secs);
      if (!was && ready(e)) hatchNow++;
    }
    const got = pend ? add('rift', null, s) : null;
    pend = 0;
    lastRun = { secs, got: got ? 1 : 0, now: hatchNow, ready: list(s).filter(ready).length, any: list(s).length };
  }

  /** Los huevos sin abrir, los listos primero y luego los más avanzados. */
  function list(s = save()) {
    const open = (s && s.eggsOpen) || {};
    return Object.entries((s && s.eggs) || {})
      .filter(([id, e]) => !open[id] && e && KINDS[e.k])
      .map(([id, e]) => Object.assign({ id }, e))
      .sort((a, b) => (ready(b) - ready(a)) || ((+b.p || 0) / need(b) - (+a.p || 0) / need(a)) || (a.at || 0) - (b.at || 0));
  }

  // ---------------- abrir ----------------

  /**
   * Abre el huevo `id` (si está listo). Quita el huevo y lo apunta como abierto en el mismo paso: una segunda
   * llamada (doble toque) devuelve null sin hacer nada. No sube la partida (lo hace ui/eggs-ui.js).
   * → { id, k, dex, shiny, isNew, refund, rarity } o null
   */
  function open(id, s = save()) {
    const e = s && s.eggs && s.eggs[id];
    if (!e || (s.eggsOpen && s.eggsOpen[id]) || !ready(e)) return null;
    let dex = +e.d, shiny = !!e.s;
    // (Un Pokémon que ya no existe o no puede salir: otro de la misma clase.)
    if (!hatchable(G.DEX_BY[dex])) { const r = roll(e.k, s); dex = r.d; shiny = !!r.s; }
    if (shiny && !G.Sprites.hasShiny(dex)) shiny = false;
    const mon = G.DEX_BY[dex], now = Date.now(), REFUND = (G.Gacha && G.Gacha.REFUND) || { 1: 15, 2: 30, 3: 60, 4: 120, 5: 300 };
    s.owned = s.owned || {}; s.shiny = s.shiny || {}; s.stats = s.stats || {};
    let isNew, refund = 0;
    if (shiny) {
      isNew = !s.shiny[dex];
      if (isNew) s.shiny[dex] = { at: now, from: 'egg' }; else refund = REFUND[mon.rarity] * 3;
      if (!s.owned[dex]) s.owned[dex] = { at: now, from: 'egg' };
    } else {
      isNew = !s.owned[dex];
      if (isNew) s.owned[dex] = { at: now, from: 'egg' }; else refund = REFUND[mon.rarity];
    }
    s.coins = (+s.coins || 0) + refund;
    delete s.eggs[id];
    s.eggsOpen = s.eggsOpen || {};
    s.eggsOpen[id] = [dex, shiny ? 1 : 0, now];
    s.stats.hatched = (s.stats.hatched || 0) + 1;
    return { id, k: e.k, dex, shiny, isNew, refund, rarity: mon.rarity };
  }

  return {
    KINDS, FROM, FROM_NAME, PER_EGG, ID_OK, add, fromMission, fromPulls, toNext, riftWon, runEnd, list, open, ready, need,
    hatchable, roll,
    /** Cuántos huevos tienes y cuántos están listos. */
    count(s = save()) { return list(s).length; },
    readyCount(s = save()) { return list(s).filter(ready).length; },
    get lastRun() { return lastRun; },
    get pending() { return pend; }
  };
})();
