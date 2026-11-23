/* ============ dexlog.js — Pokédex de vistos y derrotados ============
 * 23-11-2026 (como la Gran Actualización del juego oficial, hecho aquí a partir de su
 * novedad): la Colección lleva la cuenta, para cada especie, de cuántos has visto y
 * cuántos has derrotado sumando todas tus partidas.
 *
 *   visto      cada Pokémon enemigo que sale en tu partida (también las copias que te manda
 *              el anfitrión en grupo; cada uno cuenta una vez aunque vuelva a llegar)
 *   derrotado  cada uno que cae en tu partida (en grupo, los de todo el equipo: G.Progress.kill)
 *
 * Durante la partida se apunta en memoria y al acabar se suma a save.pseen / save.pdef
 * (dex -> número). Al fusionar con la nube gana el mayor de cada uno (core/db.js, merge).
 * Los núcleos de Eternatus no son Pokémon y no cuentan.
 */
G.DexLog = (() => {
  let seen = {}, down = {}, ids = new Set();

  const counts = e => e && !e.etCore && G.DEX_BY[e.dex];

  /** Empieza una partida: nada apuntado. */
  function reset() { seen = {}; down = {}; ids = new Set(); }

  /** Sale un enemigo (EnemyMgr.add / addRemote). */
  function see(e) {
    if (!counts(e) || ids.has(e.id)) return;
    ids.add(e.id);
    seen[e.dex] = (seen[e.dex] || 0) + 1;
  }

  /** Cae un enemigo (G.Progress.kill: anfitrión, solitario o copia en el invitado). */
  function kill(e) {
    if (!counts(e)) return;
    down[e.dex] = (down[e.dex] || 0) + 1;
    if (!ids.has(e.id)) see(e);                  // (por si no se llegó a ver: un derrotado siempre es un visto)
  }

  /** Acaba la partida: lo apuntado pasa a la partida guardada. */
  function bank(s) {
    if (!s) return;
    for (const [coll, src] of [['pseen', seen], ['pdef', down]]) {
      const dst = s[coll] = s[coll] || {};
      for (const d in src) dst[d] = (+dst[d] || 0) + src[d];
    }
    reset();
  }

  /** Lo de un Pokémon: guardado + lo de la partida en curso. */
  const seenOf = dex => (+((G.DB.save && G.DB.save.pseen) || {})[dex] || 0) + (seen[dex] || 0);
  const defeatedOf = dex => (+((G.DB.save && G.DB.save.pdef) || {})[dex] || 0) + (down[dex] || 0);

  /** Cuántas especies has visto y derrotado alguna vez (de las que salen en la Colección). */
  function totals() {
    const s = G.DB.save || {}, n = coll => Object.keys(s[coll] || {}).filter(d => +s[coll][d] > 0 && G.DEX_BY[d] && !G.DEX_BY[d].excl).length;
    return { seen: n('pseen'), defeated: n('pdef') };
  }

  return { reset, see, kill, bank, seenOf, defeatedOf, totals };
})();
