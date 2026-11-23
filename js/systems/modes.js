/* ============ modes.js — las tres dificultades: Normal, Difícil y Pesadilla ============
 * (23-11-2026; como en la Gran Actualización del juego oficial, hecho aquí a partir de sus novedades.)
 *
 *   Modo        Enemigos y jefes          Golpe máximo   A la vez   Monedas y tickets
 *   Normal      ×0,85 vida y daño         25 % de vida   como hoy   ×1
 *   Difícil     como hasta ahora          30 % de vida   como hoy   ×1,5
 *   Pesadilla   ×1,3 vida, ×1,25 daño     40 % de vida   ×1,25      ×2
 *
 * La Sentencia de Arceus no cambia con el modo. Vencer a Eternatus (minuto 20) desbloquea el
 * siguiente: en Normal, Difícil; en Difícil, Pesadilla (y lo de antes, aunque sea como invitado).
 * Se elige en el menú principal (save.mode); lo desbloqueado va en save.modes { hard, nightmare }.
 * En grupo manda el del anfitrión (cfg.mode al empezar; ver ui/social-ui.js).
 */
G.Modes = (() => {
  const LIST = [
    { id: 'normal',    name: 'Normal',    hp: 0.85, dmg: 0.85, cap: 0.25, many: 1,    reward: 1,   col: '#7dffb0' },
    { id: 'hard',      name: 'Difícil',   hp: 1,    dmg: 1,    cap: 0.3,  many: 1,    reward: 1.5, col: '#ffd23f' },
    { id: 'nightmare', name: 'Pesadilla', hp: 1.3,  dmg: 1.25, cap: 0.4,  many: 1.25, reward: 2,   col: '#ff5f6d' }
  ];
  const BY = Object.fromEntries(LIST.map(m => [m.id, m]));
  let cur = BY.normal;            // el de la partida en curso

  /** ¿Lo tiene desbloqueado esta cuenta? */
  function unlocked(id, s = G.DB.save) {
    if (id === 'normal') return true;
    return !!(s && s.modes && s.modes[id]);
  }
  /** El elegido en el menú (si ya no está desbloqueado, Normal). */
  function chosen(s = G.DB.save) {
    const id = s && s.mode;
    return BY[id] && unlocked(id, s) ? id : 'normal';
  }

  /** Al empezar la partida: el tuyo, o el que manda el anfitrión (aunque tú no lo tengas). */
  function start(id) { cur = BY[id] || BY[chosen()] || BY.normal; }

  /** Has vencido a Eternatus: se desbloquea el siguiente (y los de antes). */
  function beatEternatus() {
    const s = G.DB.save;
    if (!s) return;
    s.modes = s.modes || {};
    const i = LIST.indexOf(cur), next = LIST[i + 1];
    let fresh = null;
    for (let k = 1; k <= Math.min(i + 1, LIST.length - 1); k++) {
      if (!s.modes[LIST[k].id]) { s.modes[LIST[k].id] = Date.now(); if (LIST[k] === next) fresh = next; }
    }
    if (fresh) setTimeout(() => G.Spawner.say(G.I18n.f('¡Desbloqueado el modo {x}!', G.T(fresh.name)), 3.4, true), 3500);
    G.DB.commit();
  }

  // ---------------- menú principal ----------------

  function renderMenu() {
    const box = document.getElementById('menu-mode');
    if (!box) return;
    if (!G.Icons.UI.lock) G.Icons.UI.lock = { pal: { y: '#ffd23f', o: '#b8860b', w: '#fff4b0' }, rows: [
      '....kkkk....', '...k....k...', '..k......k..', '..k......k..', '..k......k..', '.kkkkkkkkkk.',
      '.kwyyyyyyok.', '.kyyykkyyok.', '.kyyykkyyok.', '.kyyyykyyok.', '.kooooooook.', '.kkkkkkkkkk.'] };
    const s = G.DB.save, on = chosen(s);
    box.innerHTML = '';
    for (const m of LIST) {
      const b = document.createElement('button');
      const ok = unlocked(m.id, s);
      b.className = (m.id === on ? 'on' : '') + (ok ? '' : ' locked');
      b.style.setProperty('--mc', m.col);
      b.innerHTML = (ok ? '' : G.Icons.html('lock', 11) + ' ') + G.T(m.name) + (m.reward > 1 ? ` <small>×${String(m.reward).replace('.', ',')}</small>` : '');
      b.title = ok ? G.T(desc(m)) : G.T(m.id === 'hard' ? 'Vence a Eternatus en Normal para desbloquearlo' : 'Vence a Eternatus en Difícil para desbloquearlo');
      b.dataset.sfx = ok ? 'click' : 'none';
      b.onclick = () => {
        if (!ok) { G.UI.toast(b.title); G.Audio.sfx('back'); return; }
        s.mode = m.id;
        G.DB.commit();
        renderMenu();
      };
      box.appendChild(b);
    }
    const sub = document.getElementById('menu-mode-sub');
    if (sub) sub.textContent = G.T(desc(BY[on]));
  }
  const desc = m => m.id === 'normal' ? 'Enemigos algo más flojos; ningún golpe te quita más de un cuarto de la vida.'
    : m.id === 'hard' ? 'El reto de siempre: ×1,5 Pokémonedas y tickets.'
    : 'Más vida, más daño y más enemigos a la vez: ×2 Pokémonedas y tickets.';

  return {
    LIST, BY, unlocked, chosen, start, beatEternatus, renderMenu,
    get cur() { return cur; },
    /** Multiplicadores de los enemigos (systems/spawner.js, eternatus.js, rift.js). */
    get hp() { return cur.hp; }, get dmg() { return cur.dmg; }, get many() { return cur.many; },
    /** Lo más que te quita un golpe (Player.hurt; Arceus aparte). */
    get cap() { return cur.cap; },
    get reward() { return cur.reward; }
  };
})();
