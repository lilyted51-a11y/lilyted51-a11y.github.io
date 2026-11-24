/* ============ startitem.js — Mejora «Objeto inicial» ============
 * (24-11-2026; como la Gran Actualización del juego oficial, hecho aquí a partir de sus novedades y su guía.)
 *
 * Con la Mejora Objeto inicial (data/upgrades.js, 'sitem', de cada Pokémon) empiezas la partida con el
 * objeto equipable que elijas de los que tienes. Los objetos se compran en la Tienda Kecleon, pestaña
 * «Objetos de partida» (data/shop.js: 500 cada uno, menos los que dan experiencia), y se gasta uno cada
 * vez que empiezas con él.
 *   save.held[id]     cuántos tienes de cada uno (en la libreta de las monedas, core/db.js: 'h:<id>')
 *   save.psitem[dex]  el elegido para ese Pokémon ('' o nada = ninguno); al fusionar gana el cambiado
 *                     más tarde (pickT, como el movimiento inicial)
 * En grupo, cada uno empieza con el suyo (cada jugador crea su propio Pokémon en game.js, startRun). En el
 * desafío semanal no: el Pokémon es prestado y no cuentan las Mejoras.
 *
 * Dónde se elige: el hueco «Objeto inicial» de la ficha del compañero en el menú principal, y el botón
 * «Elegir» de la Mejora en Mejoras. Los dos abren la misma ventana (pick).
 */
G.StartItem = (() => {
  const save = () => G.DB.save;

  /** ¿Tiene comprada la Mejora ese Pokémon? */
  const has = dex => { const s = save(); return !!(s && s.pupg && s.pupg[dex] && s.pupg[dex].sitem); };
  /** El elegido para ese Pokémon (o null). */
  function of(dex) {
    const s = save(), id = s && s.psitem && s.psitem[dex];
    return id && G.Items.BY[id] ? id : null;
  }
  function set(dex, id) {
    const s = save();
    s.psitem = s.psitem || {};
    if (id) s.psitem[dex] = id; else delete s.psitem[dex];
    if (G.DB.touchPick) G.DB.touchPick('psitem', dex);
    G.DB.commit();
  }
  /** Los que tienes (o has elegido), en el orden de data/items.js. */
  const owned = () => G.Items.LIST.map(i => i.id).filter(id => G.Shop.heldCount(id) > 0);

  /**
   * Al empezar la partida (game.js, startRun): con la Mejora y uno elegido que te quede, te lo pones
   * y se gasta. `ch`: el desafío semanal (entonces nada). → el id puesto o null.
   */
  function apply(pl, dex, ch) {
    if (ch || !pl || !save() || !has(dex)) return null;
    const id = of(dex);
    if (!id || !G.Shop.heldCount(id) || !pl.equip(id)) return null;
    G.Shop.takeHeld(id);
    G.DB.commit();
    setTimeout(() => { if (G.Game.player === pl) G.Spawner.say(G.I18n.f('Empiezas con {x}', G.T(G.Items.BY[id].name)), 2.4, true); }, 600);
    return id;
  }

  // ---------------- la ventana para elegirlo ----------------

  let el = null, onDone = null;
  const esc = G.U.esc;
  /** Abre la ventana para elegir el objeto inicial de `dex`; `done` al cerrarla (para repintar lo de debajo). */
  function pick(dex, done) {
    close();
    onDone = done || null;
    el = document.createElement('section');
    el.id = 'scr-sitem';
    el.className = 'scr dim';
    el.style.zIndex = 60;
    document.body.appendChild(el);
    render(dex);
    el.addEventListener('click', e => { if (e.target === el) close(); });
  }
  function render(dex) {
    const cur = of(dex), mon = G.DEX_BY[dex], list = owned();
    if (cur && !list.includes(cur)) list.unshift(cur);
    const card = (id, name, desc, n) => `<button class="sitem-card${id === (cur || '') ? ' on' : ''}" type="button" data-id="${id}">
        <span class="ic">${id ? G.Icons.html(id, 32) : G.Icons.html('ban', 28)}</span>
        <span class="tx"><b>${esc(name)}</b><small>${esc(desc)}</small></span>${n != null ? `<span class="n${n ? '' : ' none'}">×${n}</span>` : ''}</button>`;
    el.innerHTML = `<div class="box sitem-box">
      <h2>${G.Icons.html('bag', 22)} <span>${G.T('Objeto inicial')}</span></h2>
      <p class="sub"><span>${esc(G.I18n.f('Elige con qué objeto empieza {x} cada partida.', G.T(mon.name)))}</span>
        <span>${G.T('Se gasta uno al empezar. No vale en el desafío semanal.')}</span></p>
      <div class="sitem-list">${card('', G.T('Ninguno'), G.T('Empiezas sin objeto'), null)}${list.map(id => card(id, G.T(G.Items.BY[id].name), G.T(G.Items.BY[id].desc), G.Shop.heldCount(id))).join('')}</div>
      ${list.length ? '' : `<p class="sub center" style="margin:10px 0 0">${G.T('Aún no tienes objetos de partida: cómpralos en la Tienda Kecleon.')}</p>`}
      <div class="row" style="justify-content:center;margin-top:12px">
        <button class="btn gold" type="button" id="sitem-shop">${G.Icons.html('shop', 16)} ${G.T('Comprar en la Tienda Kecleon')}</button>
        <button class="btn ghost" type="button" id="sitem-close">${G.T('Cerrar')}</button></div></div>`;
    el.querySelectorAll('[data-id]').forEach(b => {
      b.onclick = () => {
        const id = b.dataset.id;
        set(dex, id);
        G.Audio.sfx('select');
        G.UI.toast(id ? G.I18n.f('{x} empezará con {x}', G.T(mon.name), G.T(G.Items.BY[id].name)) : G.I18n.f('{x} empezará sin objeto', G.T(mon.name)));
        close();
      };
    });
    el.querySelector('#sitem-close').onclick = close;
    el.querySelector('#sitem-shop').onclick = () => { close(true); G.ShopUI.open('held'); };
  }
  function close(silent) {
    if (!el) return;
    el.remove(); el = null;
    const d = onDone; onDone = null;
    if (d && !silent) d();
  }
  // Esc (y B del mando, que pulsa Cerrar) cierran la ventana.
  addEventListener('keydown', e => { if (el && e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } }, true);

  return { has, of, set, owned, apply, pick, close, get open() { return !!el; } };
})();
