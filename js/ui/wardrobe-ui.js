/* ============ wardrobe-ui.js — el Vestidor (23-11-2026, copia local) ============
 * Como la Gran Actualización del juego oficial (hecho aquí a partir de su descripción): una
 * pantalla del menú (y un botón en la ficha de cada Pokémon) para elegir, Pokémon a Pokémon:
 *   Versión   normal o shiny (si tienes su shiny)
 *   Aspecto   sus formas que sólo cambian el dibujo (core/dress.js, looks), gratis: una rejilla con su
 *             dibujo y su nombre que se desplaza (25-11-2026: Unown tiene 28, Alcremie 63, filtradas por
 *             crema); el puesto, marcado y a la vista; en shiny si eliges el shiny y ese aspecto lo tiene
 *   Skin      las compradas de ese Pokémon (core/skins.js); un aspecto y una skin no van juntos
 *   Efectos   brillos, aura de su tipo, halo de luz o aura oscura (entities/trails.js, FX)
 *   Estela    una de las compradas en la Tienda Kecleon (valen para todos tus Pokémon)
 * Arriba, la vista previa: tu Pokémon da vueltas con su estela y su efecto.
 * Lo elegido se guarda en save.pdress (y save.pskin, save.partnerShiny): ver core/dress.js.
 */
G.WardrobeUI = (() => {
  const $ = id => document.getElementById(id);
  const MAX_LIST = 60;
  let dex = null, from = 'menu', q = '', wired = false;
  let lgDex = 0, lgSel = null;   // grupo de aspectos que se ve (las Alcremie por crema; null = el del puesto)
  // Las cremas de Alcremie (core/dress.js, lookGroup), en el orden del juego.
  const CREAMS = { 'vanilla-cream': 'Crema vainilla', 'ruby-cream': 'Crema rubí', 'matcha-cream': 'Crema matcha',
    'mint-cream': 'Crema menta', 'lemon-cream': 'Crema limón', 'salted-cream': 'Crema salada', 'ruby-swirl': 'Mezcla rubí',
    'caramel-swirl': 'Mezcla caramelo', 'rainbow-swirl': 'Mezcla tricolor' };

  function wire() {
    if (wired) return;
    wired = true;
    $('wd-back').onclick = back;
    $('wd-q').oninput = () => { q = $('wd-q').value.trim().toLowerCase(); renderList(); };
  }

  /** Abre el Vestidor con un Pokémon (o tu compañero). from: a dónde vuelve ('menu' | 'dex' | 'shop'). */
  function open(d, src) {
    wire();
    const s = G.DB.save;
    from = src || 'menu';
    dex = d && s.owned[d] ? +d : s.partner;
    q = ''; $('wd-q').value = '';
    G.UI.show('scr-wardrobe', true);
    renderList();
    render();
  }
  function back() {
    if (from === 'dex') G.MenuUI.openDex();
    else if (from === 'shop') G.ShopUI.open('trails');
    else G.MenuUI.open();
  }

  // ---------------- lista de Pokémon ----------------

  function match(p, t) {
    if (!t) return true;
    if (/^\d+$/.test(t)) return String(p.dex).startsWith(t) || String(p.dex).padStart(3, '0').startsWith(t);
    if (p.name.toLowerCase().includes(t)) return true;
    const zh = window.PSZH_DICT && window.PSZH_DICT[p.name];
    return !!(zh && zh.includes(t));
  }
  function mine() {
    const s = G.DB.save, used = s.pused || {};
    // (25-11-2026: también las formas que ya no salen en el gacha (excl), para quien las tiene.)
    return Object.keys(s.owned).map(Number).filter(d => G.DEX_BY[d])
      .sort((a, b) => (b === s.partner) - (a === s.partner) || (+used[b] || 0) - (+used[a] || 0) || a - b);
  }
  function cellSprite(cv, d) {
    const s = G.DB.save, lk = G.Dress.lookOf(s, d);
    G.UI.sprite(cv, lk || d, { scale: 1, shiny: G.Dress.shinyOf(s, d), skin: lk ? '' : G.Skins.worn(s, d), twinkle: false });
  }
  function renderList() {
    const box = $('wd-list'), all = mine().filter(d => match(G.DEX_BY[d], q));
    box.innerHTML = '';
    for (const d of all.slice(0, MAX_LIST)) {
      const b = document.createElement('button');
      b.className = 'wd-cell' + (d === dex ? ' on' : '');
      b.type = 'button'; b.dataset.dex = d;
      const cv = document.createElement('canvas');
      cv.width = 56; cv.height = 46;
      b.appendChild(cv);
      b.insertAdjacentHTML('beforeend', `<small>${G.DEX_BY[d].name}</small>`);
      b.onclick = () => { dex = d; box.querySelectorAll('.wd-cell').forEach(c => c.classList.toggle('on', +c.dataset.dex === d)); G.Audio.sfx('select'); render(); };
      box.appendChild(b);
      cellSprite(cv, d);
    }
    if (!all.length) box.innerHTML = `<p class="sub" style="margin:8px">${G.T('Ningún Pokémon con ese nombre.')}</p>`;
    else if (all.length > MAX_LIST) box.insertAdjacentHTML('beforeend', `<p class="sub wd-more">${G.I18n.f('y {x} más: búscalos por nombre', all.length - MAX_LIST)}</p>`);
  }

  // ---------------- el Pokémon elegido ----------------

  const chip = (k, v, label, on, extra = '') => `<button class="chip${on ? ' on' : ''}" type="button" data-k="${k}" data-v="${v}" ${extra}>${label}</button>`;
  const sec = (title, inner, note = '') => `<div class="wd-sec"><h4>${G.T(title)}</h4><div class="chips">${inner}</div>${note ? `<p class="sub wd-note">${note}</p>` : ''}</div>`;

  function render() {
    const s = G.DB.save, p = G.DEX_BY[dex];
    if (!p) return;
    const hasSh = G.DB.ownsShiny(dex), sh = G.Dress.shinyOf(s, dex), lk = G.Dress.lookOf(s, dex);
    const sk = G.Skins.worn(s, dex), fx = G.Dress.fxOf(s, dex), tr = G.Dress.trailOf(s, dex);
    const partner = dex === s.partner;
    $('wd-name').innerHTML = `<b>${lk && G.DEX_BY[lk] ? G.T(G.DEX_BY[lk].name, 'mon') : p.name}</b>${sh ? ' ' + G.Icons.html('shiny', 16) : ''}${partner ? ` <span class="tag-chip">${G.T('Tu compañero')}</span>` : ''}`;

    // Vista previa: da vueltas con su estela y su efecto.
    G.Trails.preview($('wd-stage'), { dex, look: lk, shiny: sh, skin: lk ? '' : sk, trail: tr, fx, zoom: 1.5 });

    const looks = G.Dress.looks(dex);
    const skins = Object.keys(G.Skins.SKINS).filter(id => G.Skins.SKINS[id].dex === dex && G.Skins.owns(s, id));
    const owned = G.Dress.ownedTrails(s);
    let h = sec('Versión', chip('sh', 0, G.T('Normal'), !sh) + chip('sh', 1, `${G.Icons.html('shiny', 12)} ${G.T('Shiny')}`, sh, hasSh ? '' : 'disabled'),
      hasSh ? '' : G.T('Aún no tienes su versión shiny.'));
    // Aspecto: rejilla con su dibujo (renderLooks, abajo).
    const noSh = sh && lk && !G.Sprites.hasShiny(lk);
    h += `<div class="wd-sec"><h4>${G.T('Aspecto')}</h4>${looks.length ? '<div class="wd-lgroups"></div><div class="wd-looks"></div>' : ''}
      <p class="sub wd-note">${looks.length ? `<span>${G.T('Sólo cambia el dibujo.')}</span>` + (noSh ? `<span>${G.T('Este aspecto no tiene versión shiny: se ve normal.')}</span>` : '') : G.T('Sólo tiene un aspecto.')}</p></div>`;
    h += sec('Skin', chip('sk', '', G.T('Sin skin'), !sk) + skins.map(id => chip('sk', id, `${G.Icons.html('witch', 12)} ${G.T(G.Skins.SKINS[id].name)}`, sk === id)).join(''),
      skins.length ? (lk ? G.T('Las skins van con su aspecto normal.') : '') : G.T('No tienes skins de este Pokémon.'));
    h += sec('Efecto', chip('fx', '', G.T('Ninguno'), !fx) + G.Trails.FX_ORDER.map(id => chip('fx', id, G.T(G.Trails.FX[id].name), fx === id, `title="${G.T(G.Trails.FX[id].desc)}"`)).join(''),
      fx ? G.T(G.Trails.FX[fx].desc) : '');
    h += sec('Estela', chip('tr', '', G.T('Ninguna'), !tr) + owned.map(t => chip('tr', t.id, `<i class="rar-dot" style="background:${G.Trails.RAR_COLOR[t.rar]}"></i>${G.T(t.name)}`, tr === t.id, `title="${G.T(G.Trails.RAR_NAME[t.rar])}"`)).join(''),
      `<span>${G.I18n.f('Tienes {x} de {x}', owned.length, G.Trails.LIST.length)}</span> · <span>${G.T('Se compran en la Tienda Kecleon y valen para todos tus Pokémon.')}</span>
       <button class="btn small" type="button" data-go-shop>${G.Icons.html('shop', 14)} ${G.T('Comprar estelas')}</button>`);
    h += `<div class="wd-foot">${partner
      ? `<button class="btn" type="button" disabled>${G.T('Es tu compañero')}</button>`
      : `<button class="btn gold" type="button" data-pick data-sfx="confirm">${G.T('Elegir de compañero')}</button>`}</div>`;
    const box = $('wd-opts');
    box.innerHTML = h;
    box.querySelectorAll('.chip[data-k]').forEach(b => { b.onclick = () => choose(b.dataset.k, b.dataset.v); });
    if (looks.length) renderLooks(box, looks, lk, sh);
    const shop = box.querySelector('[data-go-shop]');
    if (shop) shop.onclick = () => G.ShopUI.open('trails');
    const pick = box.querySelector('[data-pick]');
    if (pick) pick.onclick = () => {
      s.partner = dex;
      s.partnerShiny = !!G.Dress.get(s, dex).sh && hasSh;
      G.DB.commit();
      if (G.Social.room) G.Social.refreshMember();
      G.UI.toast(G.I18n.f('{x} es ahora tu compañero', p.name));
      renderList(); render();
    };
  }

  /** La rejilla de aspectos: «Normal» y cada forma con su dibujo y su nombre; el puesto, marcado y a la vista. */
  function renderLooks(box, looks, lk, sh) {
    const gbox = box.querySelector('.wd-lgroups'), grid = box.querySelector('.wd-looks');
    const groups = [...new Set(looks.map(f => G.Dress.lookGroup(f.dex)).filter(Boolean))];
    if (lgDex !== dex) { lgDex = dex; lgSel = null; }
    // Sin elegir grupo: el del aspecto puesto (o todos).
    const cur = lgSel != null ? lgSel : (lk && G.Dress.lookGroup(lk)) || '';
    gbox.innerHTML = groups.length > 1 ? chip('lg', '', G.T('Todas'), !cur) + groups.map(g => chip('lg', g, G.T(CREAMS[g] || g), cur === g)).join('') : '';
    gbox.querySelectorAll('.chip').forEach(b => { b.onclick = () => { lgSel = b.dataset.v; G.Audio.sfx('select'); renderLooks(box, looks, lk, sh); }; });
    if (!gbox.innerHTML) gbox.remove();
    grid.innerHTML = '';
    const list = [{ dex: 0, name: 'Normal' }].concat(looks.filter(f => !cur || G.Dress.lookGroup(f.dex) === cur));
    for (const f of list) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'wd-look' + ((f.dex || 0) === lk ? ' on' : ''); b.dataset.lk = f.dex;
      const name = f.dex ? G.T(f.name, 'mon') : G.T('Normal');
      b.title = name;
      const cv = document.createElement('canvas');
      cv.width = 56; cv.height = 46;
      b.appendChild(cv);
      const sm = document.createElement('small');
      sm.textContent = name;
      b.appendChild(sm);
      b.onclick = () => choose('lk', String(f.dex));
      grid.appendChild(b);
      const d = f.dex || dex;
      G.UI.sprite(cv, d, { scale: 1, shiny: sh && G.Sprites.hasShiny(d), skin: f.dex ? '' : G.Skins.worn(G.DB.save, dex), twinkle: false });
    }
    // El puesto, a la vista (sin mover la página).
    const on = grid.querySelector('.wd-look.on');
    if (on) grid.scrollTop = Math.max(0, on.offsetTop - grid.clientHeight / 2 + on.offsetHeight / 2);
  }

  function choose(k, v) {
    const s = G.DB.save;
    if (k === 'sh') {
      G.Dress.setShiny(s, dex, v === '1');
      if (dex === s.partner && G.Social.room) G.Social.refreshMember();   // en una sala: los demás lo ven ya
    } else if (k === 'lk') {
      G.Dress.set(s, dex, { lk: +v || 0 });
      if (+v && G.Skins.worn(s, dex)) G.Skins.wear(s, dex, '');
    } else if (k === 'sk') {
      G.Skins.wear(s, dex, v);
      if (v) G.Dress.set(s, dex, { lk: 0 });
    } else if (k === 'fx') G.Dress.set(s, dex, { fx: v });
    else if (k === 'tr') G.Dress.set(s, dex, { tr: v });
    G.DB.commit();
    G.Audio.sfx(k === 'tr' && v ? 'buy' : 'select');
    const cell = document.querySelector(`#wd-list .wd-cell[data-dex="${dex}"] canvas`);
    if (cell) cellSprite(cell, dex);
    render();
  }

  return { open, back, get dex() { return dex; } };
})();
