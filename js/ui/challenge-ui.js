/* ============ challenge-ui.js — Desafío semanal: tarjeta del menú y su pantalla ============
 * (23-11-2026; la lógica está en systems/challenge.js.)
 *   - En el menú principal, una tarjeta con el Pokémon y la condición de esta semana y si ya has
 *     usado tu intento. Al pulsarla se abre la pantalla del desafío.
 *   - La pantalla: el Pokémon prestado, la condición entera, las normas, cuánto falta para el
 *     siguiente, «Empezar el desafío» (pregunta antes: el intento se gasta al empezar) y su ranking.
 */
G.ChallengeUI = (() => {
  const $ = G.UI.$;
  const esc = G.U.esc;
  let leftT = 0;

  function init() {
    $('menu-ch').dataset.sfx = 'click';
    $('menu-ch').onclick = open;
    $('ch-play').onclick = start;
    $('ch-rank').onclick = () => G.RankingUI.open('c');
  }

  // «3 d 04:12:30» (como la cuenta atrás de Halloween del menú)
  const hms = ms => { const t = Math.floor(ms / 1000); return [Math.floor(t / 3600) % 24, Math.floor(t / 60) % 60, t % 60].map(v => String(v).padStart(2, '0')).join(':'); };
  const left = ms => { const d = Math.floor(ms / 864e5); return d ? G.I18n.f('{x} d {x}', d, hms(ms)) : hms(ms); };

  /** Lo que llevas de esta semana, en una línea. */
  function stateLine(c) {
    const my = G.Challenge.mine(c.w);
    if (!my) return G.T('Tienes tu intento de esta semana');
    return my.t ? G.I18n.f('Intento usado: aguantaste {x}', G.U.mmss(my.t)) : G.T('Ya has usado tu intento de esta semana');
  }

  /** La tarjeta del menú principal (MenuUI.open). */
  function card() {
    const el = $('menu-ch');
    if (!el || !G.DB.save) return;
    const c = G.Challenge.thisWeek(), mon = G.DEX_BY[c.dex];
    G.UI.sprite($('ch-card-mon'), c.dex, { scale: 1.5, hero: true });
    // (Nombre y condición en nodos separados: así se traduce cada uno entero.)
    $('ch-card-cond').innerHTML = `<span>${esc(mon ? mon.name : '?')}</span> · <span style="color:${G.Challenge.color(c)}">${esc(G.Challenge.label(c))}</span>`;
    $('ch-card-sub').textContent = stateLine(c);
    el.classList.toggle('used', G.Challenge.used(c.w));
  }

  function open() {
    const c = G.Challenge.thisWeek(), mon = G.DEX_BY[c.dex];
    G.UI.show('scr-chal', true);
    G.UI.sprite($('ch-mon'), c.dex, { lively: true, scale: 3, hero: true });
    $('ch-mon').style.setProperty('--stage-c', G.U.TYPE_COLOR[mon.types[0]]);
    $('ch-name').textContent = mon.name;
    $('ch-types').innerHTML = G.UI.typeChips(mon.types);
    $('ch-cond').textContent = G.Challenge.label(c);
    $('ch-cond').style.color = G.Challenge.color(c);
    $('ch-desc').textContent = G.Challenge.desc(c);
    const used = G.Challenge.used(c.w);
    $('ch-state').textContent = stateLine(c);
    $('ch-state').classList.toggle('gold', !used);
    $('ch-play').disabled = used;
    $('ch-rank').classList.toggle('hidden', !G.DB.online);
    tickLeft();
    if (!leftT) leftT = setInterval(() => { if (G.UI.isOpen('scr-chal')) tickLeft(); }, 1000);
  }
  function tickLeft() { $('ch-left').textContent = G.I18n.f('Nuevo desafío en {x}', left(G.Challenge.msLeft())); }

  async function start() {
    const c = G.Challenge.thisWeek();
    if (G.Social.room) { G.UI.toast('El desafío semanal es sólo en solitario: sal de la sala para jugarlo.', 3400); return; }
    if (G.Challenge.used(c.w)) { G.UI.toast('Ya has usado tu intento de esta semana. ¡El lunes hay otro!', 3200); return; }
    if (!await G.UI.ask(esc(G.T('Sólo tienes un intento esta semana y se gasta al empezar. ¿Empezamos?')), G.T('Empezar'))) return;
    if (G.Game.state !== 'ui' || G.Challenge.used(c.w)) return;
    G.Challenge.arm();
    G.Flow.play();
  }

  return { init, card, open, start };
})();
