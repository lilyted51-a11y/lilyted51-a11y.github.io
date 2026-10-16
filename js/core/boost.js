/* ============ boost.js — copia local: ventajas sólo para ciertas cuentas ============
 * Dos niveles, por el "ID de usuario" de Firebase (Authentication > Usuarios):
 *   all   todo: personaje ×40, botín, tickets y monedas por segundo, y el bot
 *   bot   sólo el bot de en/bot.js (números normales)
 * Para los demás jugadores el juego es el original.
 *
 * Las listas viven en Firestore, documento config/boost:
 *   { all: ['uid', ...], bot: ['uid', ...] }
 * Se editan desde la consola de Firebase sin tocar el código ni republicar; el
 * juego las lee al entrar (G.Flow.afterLogin). UIDS de abajo: respaldo fijo.
 *
 * Las partidas con bot o ventajas no suben al ranking (ver Game.clean), así los
 * amigos compiten entre ellos en igualdad.
 */
G.Boost = (() => {
  const UIDS = [
    'DFa2yefCCPVzV9OA5Ie07jHHlZ32'   // MiNG
  ];
  // Personaje: velocidad ×, recarga × (0,4 = 2,5 veces más rápido), daño ×
  // (el daño además crece con el tiempo como la vida de los enemigos).
  const POWER = { spd: 1.6, cd: 0.4, atk: 40 };
  let all = new Set(UIDS), bot = new Set(), loadedFor = null;

  function uid() { const fb = G.DB && G.DB.fb; return fb && fb.uid ? fb.uid : null; }

  /** Lee config/boost de Firestore (una vez por cuenta). */
  async function load() {
    const fb = G.DB && G.DB.fb;
    if (!fb || !fb.uid || !fb.fs || loadedFor === fb.uid) return;
    loadedFor = fb.uid;
    try {
      const snap = await fb.fs.collection('config').doc('boost').get();
      const d = snap.exists ? snap.data() : {};
      all = new Set(UIDS.concat(Array.isArray(d.all) ? d.all : []));
      bot = new Set(Array.isArray(d.bot) ? d.bot : []);
    } catch (e) { console.warn('[Boost] sin config/boost:', e.message); }
  }

  return {
    UIDS, POWER, load,
    /** Todas las ventajas. */
    get on() { const u = uid(); return !!u && all.has(u); },
    /** Puede usar el bot (con o sin las demás ventajas). */
    get bot() { const u = uid(); return !!u && (all.has(u) || bot.has(u)); }
  };
})();
