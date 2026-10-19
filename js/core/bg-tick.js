/* ============ bg-tick.js — reloj para seguir jugando en segundo plano (copia local) ============
 * Es un Web Worker (no va en app.min.js): con la pestaña oculta el navegador
 * deja de llamar a requestAnimationFrame y frena los temporizadores de la
 * página, pero no los de un worker. Con el bot jugando, js/game.js lo usa
 * para que la partida siga cuando cambias de ventana. Mensajes: 'start' / 'stop'.
 */
let t = 0;
onmessage = e => {
  clearInterval(t); t = 0;
  if (e.data === 'start') t = setInterval(() => postMessage(0), 16);
};
