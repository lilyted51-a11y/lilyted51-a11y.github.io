/* ============ boost.js — copia local: ventajas sólo para ciertas cuentas ============
 * Todo lo "trucado" de esta copia (personaje ×40, botín, tickets y monedas por
 * segundo, bot de en/bot.js) se activa SÓLO si la cuenta conectada está en
 * UIDS (el "ID de usuario" de Firebase > Authentication > Usuarios). Para los
 * demás jugadores, el juego es el original.
 *
 * Las partidas con ventajas no suben al ranking (ver Game.clean), así los
 * amigos compiten entre ellos en igualdad.
 */
G.Boost = (() => {
  const UIDS = [
    'DFa2yefCCPVzV9OA5Ie07jHHlZ32'   // MiNG
  ];
  // Personaje: velocidad ×, recarga × (0,4 = 2,5 veces más rápido), daño ×
  // (el daño además crece con el tiempo como la vida de los enemigos).
  const POWER = { spd: 1.6, cd: 0.4, atk: 40 };
  function on() {
    const fb = G.DB && G.DB.fb;
    return !!(fb && fb.uid && UIDS.includes(fb.uid));
  }
  return { UIDS, POWER, get on() { return on(); } };
})();
