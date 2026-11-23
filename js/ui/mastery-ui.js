/* ============ mastery-ui.js — pantalla de Maestría, foto y marco del perfil ============
 * (23-11-2026; ver systems/mastery.js y core/photo.js.)
 *   G.MasteryUI  Maestría, en el menú principal: todos tus Pokémon de más a menos maestría, con
 *                buscador, y la ficha de cada uno con sus números y sus 4 premios (desde ahí te
 *                pones la foto, el título y el marco). También la barrita de maestría de la ficha
 *                del compañero y del menú, que llevan a esa ficha.
 *   G.PhotoUI    elegir foto (Pokémon y expresión) y marco en Misiones → Perfil; y en la Tienda
 *                Kecleon, las fotos del día y los marcos de la semana.
 */
(() => {
  const $ = G.UI.$;
  const esc = G.U.esc;
  const N = n => (+n || 0).toLocaleString(G.I18n.locale);

  // Icono de la maestría (escarapela dorada con estrella y cintas).
  G.Icons.UI.mastery = { pal: { y: '#ffd23f', o: '#c08a10', w: '#fff4b0', r: '#ff5f6d', d: '#b03040' }, rows: [
    '...kkkkkk...', '..kyyyyyyk..', '.kyyywwyyok.', '.kyywwwwyok.', '.kywwwwwwok.', '.kyyywwyyok.',
    '.kyywyywyok.', '..kooooook..', '...krkkrk...', '..krdk.krk..', '..krk..kdrk.', '..kk....kk..'] };

  const sv = () => G.DB.save;
  function saveProfile() {
    G.DB.commit();
    if (G.Social.me) G.Social.publishProfile(true);
    G.UI.refreshCoins();
  }
  /** Búsqueda por nombre (sin tildes), nombre en chino o número. */
  function match(p, q) {
    if (!q) return true;
    if (/^#?\d+$/.test(q)) return String(p.dex) === q.replace('#', '');
    const plain = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if ([p.name, G.T(p.name)].some(n => plain(n).includes(plain(q)))) return true;
    const zh = window.PSZH_DICT && window.PSZH_DICT[p.name];
    return !!(zh && zh.includes(q));
  }
  const tierIcons = (dex, size = 14) => G.Mastery.TIERS.map(t =>
    `<span title="${esc(G.T(t.name))}">${G.Icons.html(t.icon, size, G.Mastery.has(dex, t.id) ? '' : 'off')}</span>`).join('');
  const bar = dex => `<div class="mast-bar"><i style="width:${Math.round(G.Mastery.progress(dex) * 100)}%"></i></div>`;

  // ======================= MAESTRÍA =======================

  G.MasteryUI = (() => {
    let q = '', shown = 0, list = [], sel = null;
    const PAGE = 60;

    function init() {
      $('mast-back').onclick = () => { if (sel) { sel = null; render(); } else G.MenuUI.open(); };
    }

    /** Abre la pantalla (con dex, directamente en la ficha de ese Pokémon). */
    function open(dex) {
      G.UI.show('scr-mastery', true);
      sel = dex && G.DEX_BY[dex] ? +dex : null;
      if (!sel) q = '';
      render();
    }

    function render() {
      const body = $('mast-body');
      if (sel) return sheet(body, sel);
      body.innerHTML = `<p class="sub" style="margin:4px 0 8px">Cada partida suma maestría al Pokémon que elegiste (aunque evolucione): 1 punto por cada 6 derrotados y 25 por minuto aguantado, como mucho 40 minutos por partida.</p>
        <input id="mast-q" class="field" type="search" maxlength="24" placeholder="Buscar por nombre o número" autocomplete="off" spellcheck="false" style="max-width:320px">
        <div id="mast-list" class="mast-list"></div>`;
      const inp = $('mast-q');
      inp.value = q;
      inp.oninput = () => { q = inp.value.trim(); fill(); };
      fill();
    }

    /** Tus Pokémon, de más a menos maestría (luego los más usados). */
    function mons() {
      const s = sv(), used = d => +(s.pused || {})[d] || 0;
      const ds = new Set(Object.keys(s.owned || {}).concat(Object.keys(s.mast || {})).map(Number));
      return [...ds].filter(d => G.DEX_BY[d] && (!G.DEX_BY[d].excl || s.owned[d]) && match(G.DEX_BY[d], q))
        .sort((a, b) => G.Mastery.points(b) - G.Mastery.points(a) || used(b) - used(a) || a - b);
    }
    function fill() {
      list = mons(); shown = 0;
      const box = $('mast-list');
      box.innerHTML = list.length ? '' : '<p class="sub">No hay ningún Pokémon con ese nombre.</p>';
      more();
    }
    function more() {
      const box = $('mast-list');
      const old = box.querySelector('.mast-more');
      if (old) old.remove();
      const s = sv();
      let h = '';
      for (const d of list.slice(shown, shown + PAGE)) {
        const p = G.DEX_BY[d], pts = G.Mastery.points(d);
        h += `<button class="mast-item${d === s.partner ? ' partner' : ''}" data-dex="${d}" type="button">
          ${G.Photo.faceHtml(d, 'Normal', 40)}
          <span class="mi-nm"><b>${esc(p.name)}</b><small>Nº ${String(p.dex > 1025 ? G.Photo.base(p.dex) : p.dex).padStart(3, '0')}</small></span>
          <span class="mi-pts">${bar(d)}<small><b class="gold">${N(pts)}</b></small></span>
          <span class="mi-tiers">${tierIcons(d)}</span></button>`;
      }
      shown = Math.min(list.length, shown + PAGE);
      box.insertAdjacentHTML('beforeend', h);
      if (shown < list.length) box.insertAdjacentHTML('beforeend', `<button class="btn small ghost mast-more" type="button">${G.I18n.f('Ver más ({x})', list.length - shown)}</button>`);
      box.querySelectorAll('.mast-item:not([data-w])').forEach(b => { b.dataset.w = 1; b.onclick = () => { sel = +b.dataset.dex; G.Audio.sfx('select'); render(); }; });
      const m = box.querySelector('.mast-more');
      if (m) m.onclick = more;
    }

    // ---------------- ficha de un Pokémon ----------------

    function sheet(body, dex) {
      const s = sv(), p = G.DEX_BY[dex], pts = G.Mastery.points(dex), st = G.Mastery.stats(dex), nx = G.Mastery.next(dex);
      const me = G.Photo.mine(s), mex = G.Photo.masterEx(dex), title = G.Mastery.title(dex);
      const cell = (label, v) => `<div><span>${label}</span><b>${v}</b></div>`;
      const reward = t => {
        const ok = G.Mastery.has(dex, t.id);
        let act = `<b class="sub">${N(t.at)}</b>`;
        if (ok && t.id === 'photo') act = me.d === dex && me.e === mex ? '<b class="gold">Puesta</b>' : '<button class="btn small gold" data-eq="photo" type="button">Ponértela</button>';
        else if (ok && t.id === 'title') act = (s.profile || {}).title === title ? '<b class="gold">Puesto</b>' : '<button class="btn small gold" data-eq="title" type="button">Ponértelo</button>';
        else if (ok && t.id === 'frame') act = me.f === 'm:' + dex ? '<b class="gold">Puesto</b>' : '<button class="btn small gold" data-eq="frame" type="button">Ponértelo</button>';
        else if (ok) act = '<b class="gold">Activa al jugar con él</b>';
        const pv = t.id === 'photo' ? G.Photo.faceHtml(dex, mex, 40, ok ? '' : 'locked')
          : t.id === 'frame' ? G.Photo.html({ d: dex, e: 'Normal', f: 'm:' + dex }, 44, ok ? '' : 'locked')
          : G.Icons.html(t.icon, 32, ok ? '' : 'off');
        return `<div class="mast-rw${ok ? ' ok' : ''}"><div class="ic">${pv}</div>
          <div><b>${esc(G.T(t.name))}</b>${t.id === 'title' ? ` <span class="prof-title">${esc(title)}</span>` : ''}
            <div class="sub" style="font-size:13px">${esc(G.T(t.desc))}</div></div>
          <div class="upg-btns">${act}</div></div>`;
      };
      body.innerHTML = `
        <div class="mast-sheet">
          <div class="mast-head">
            ${G.Photo.faceHtml(dex, G.Mastery.has(dex, 'photo') ? mex : 'Normal', 80, 'mast-face')}
            <div class="grow">
              <h3 style="margin:0">${esc(p.name)} ${G.UI.typeChips(p.types)}</h3>
              <div class="mast-pts">${G.Icons.html('mastery', 24)} <b class="gold">${N(pts)}</b> <span class="sub">puntos de maestría</span></div>
              ${bar(dex)}
              <small class="sub">${nx ? G.I18n.f('Faltan {x} para: {x}', N(nx.at - pts), G.T(nx.name)) : 'Todos los premios conseguidos: los puntos siguen sumando.'}</small>
            </div>
          </div>
          <div class="prof-marks">
            ${cell('Partidas', N(st.r))}${cell('Tiempo jugado', G.U.hmmss(st.t))}${cell('Derrotados', N(st.k))}
            ${cell('Llegadas a Arceus', N(st.a))}${cell('Mejor tiempo', G.U.mmss(st.bt))}${cell('Jefes', N(st.b))}
            ${cell('Grietas ganadas', N(st.rf))}${cell('Eternatus vencidos', N(st.e))}
          </div>
          <h3 style="margin:10px 0 6px">Premios</h3>
          <div class="mast-rws">${G.Mastery.TIERS.map(reward).join('')}</div>
        </div>`;
      body.querySelectorAll('[data-eq]').forEach(b => {
        b.onclick = () => {
          const k = b.dataset.eq;
          if (k === 'photo') G.Photo.setPhoto(dex, mex);
          else if (k === 'frame') G.Photo.setFrame('m:' + dex);
          else if (k === 'title') { s.profile = s.profile || { favs: [], title: '' }; s.profile.title = title; }
          saveProfile();
          G.Audio.sfx('confirm');
          G.UI.toast(k === 'photo' ? 'Foto puesta en tu perfil' : k === 'frame' ? 'Marco puesto en tu perfil' : 'Título puesto en tu perfil');
          render();
        };
      });
    }

    // ---------------- en otras pantallas ----------------

    /** Barrita de maestría (ficha del compañero, menú): lleva a su ficha. */
    function miniHtml(dex) {
      return `<button class="mast-mini" data-mast="${dex}" type="button" title="Maestría">${G.Icons.html('mastery', 16)}
        <span>Maestría</span>${bar(dex)}<b class="gold">${N(G.Mastery.points(dex))}</b></button>`;
    }
    function wire(root) {
      root.querySelectorAll('[data-mast]').forEach(b => { b.onclick = e => { e.stopPropagation(); open(+b.dataset.mast); }; });
    }

    return { init, open, render, miniHtml, wire, get sel() { return sel; } };
  })();

  // ======================= FOTO Y MARCO =======================

  G.PhotoUI = (() => {
    const LOCK = { shop: 'En la Tienda Kecleon', mastery: 'Premio de maestría', own: 'Consigue este Pokémon' };

    /** Misiones → Perfil: tu foto y marco, con los botones para cambiarlos. */
    function editor(box, back) {
      const me = G.Photo.mine();
      const el = document.createElement('div');
      el.className = 'ph-edit';
      el.innerHTML = `${G.Photo.html(me, 96)}
        <div><h3 style="margin:0 0 4px">Foto y marco</h3>
          <p class="sub" style="margin:0 0 8px"><span>${esc(G.DEX_BY[me.d].name)}</span> · <span>${esc(G.T(G.Photo.exName(me.e)))}</span> · <span>${esc(G.Photo.frameName(me.f))}</span></p>
          <div class="row" style="gap:6px;flex-wrap:wrap">
            <button class="btn small gold" data-ph="photo" type="button">Cambiar foto</button>
            <button class="btn small gold" data-ph="frame" type="button">Cambiar marco</button>
            <button class="btn small" data-ph="mast" type="button">${G.Icons.html('mastery', 14)} Maestría</button>
          </div></div>`;
      box.appendChild(el);
      el.querySelector('[data-ph=photo]').onclick = () => pickPhoto(box, back);
      el.querySelector('[data-ph=frame]').onclick = () => pickFrame(box, back);
      el.querySelector('[data-ph=mast]').onclick = () => G.MasteryUI.open();
    }

    /** Elegir foto: primero el Pokémon, luego la expresión. */
    function pickPhoto(box, back, dex) {
      const s = sv();
      if (dex) return pickExpr(box, back, dex);
      box.innerHTML = `<div class="row between"><h3>Elige la cara de tu foto</h3><button class="btn small ghost" id="ph-back" type="button">Volver</button></div>
        <input class="field" id="ph-q" type="search" placeholder="Buscar por nombre o número" autocomplete="off" spellcheck="false" style="max-width:320px;margin:6px 0 10px">
        <div class="ph-grid" id="ph-grid"></div>`;
      $('ph-back').onclick = back;
      // Una cara por especie: las que tienes, y las de las fotos compradas o de maestría.
      const sp = new Map();
      const add = d => { const b = G.Photo.base(d); if (G.DEX_BY[b] && G.PORTRAITS && G.PORTRAITS[b] && !sp.has(b)) sp.set(b, +d); };
      Object.keys(s.owned || {}).forEach(add);
      Object.keys(s.photos || {}).forEach(k => add(k.split('/')[0]));
      Object.keys(s.mast || {}).filter(d => G.Mastery.has(+d, 'photo')).forEach(add);
      const all = [...sp.keys()].sort((a, b) => a - b);
      const fill = q => {
        const g = $('ph-grid');
        const l = all.filter(d => match(G.DEX_BY[d], q)).slice(0, 150);
        g.innerHTML = l.map(d => `<button class="ph-cell" data-d="${sp.get(d)}" type="button">${G.Photo.faceHtml(d, 'Normal', 48)}<small>${esc(G.DEX_BY[d].name)}</small></button>`).join('')
          || '<p class="sub">No hay ningún Pokémon con ese nombre.</p>';
        g.querySelectorAll('[data-d]').forEach(c => { c.onclick = () => pickExpr(box, back, +c.dataset.d); });
      };
      $('ph-q').oninput = () => fill($('ph-q').value.trim());
      fill('');
    }
    function pickExpr(box, back, dex) {
      const me = G.Photo.mine(), name = G.DEX_BY[dex].name;
      box.innerHTML = `<div class="row between"><h3>${esc(G.I18n.f('Expresión de {x}', name))}</h3><button class="btn small ghost" id="ph-back" type="button">Volver</button></div>
        <div class="ph-grid big" id="ph-grid"></div>`;
      $('ph-back').onclick = () => pickPhoto(box, back);
      const g = $('ph-grid');
      for (const e of G.Photo.exOf(dex)) {
        const lock = G.Photo.photoLock(dex, e), on = me.d === dex && me.e === e;
        const c = document.createElement('button');
        c.type = 'button';
        c.className = 'ph-cell' + (on ? ' on' : '') + (lock ? ' locked' : '');
        c.innerHTML = `${G.Photo.faceHtml(dex, e, 64, lock ? 'locked' : '')}<small>${esc(G.T(G.Photo.exName(e)))}</small>
          ${lock ? `<small class="lock">${esc(G.T(LOCK[lock] || ''))}</small>` : on ? '<small class="gold">Puesta</small>'
            : e === G.Photo.masterEx(dex) && G.Mastery.has(dex, 'photo') ? '<small class="gold">Foto de maestría</small>' : ''}`;
        c.onclick = () => {
          if (lock) { G.Audio.sfx('error'); G.UI.toast(G.T(LOCK[lock] || '')); return; }
          G.Photo.setPhoto(dex, e);
          saveProfile(); G.Audio.sfx('confirm');
          back();
        };
        g.appendChild(c);
      }
    }

    /** Elegir marco: los gratis, los comprados y los de maestría (los que faltan, apagados). */
    function pickFrame(box, back) {
      const s = sv(), me = G.Photo.mine();
      const ids = Object.keys(G.Photo.FRAMES).filter(f => !G.Photo.FRAMES[f].mastery)
        .concat(Object.keys(s.mast || {}).filter(d => G.Mastery.has(+d, 'frame')).map(d => 'm:' + d));
      box.innerHTML = `<div class="row between"><h3>Elige tu marco</h3><button class="btn small ghost" id="ph-back" type="button">Volver</button></div>
        <p class="sub" style="margin:0 0 8px">Sencillo, Madera y Piedra son gratis; en la Tienda Kecleon hay 2 marcos nuevos cada semana. El dorado de maestría se gana con 50.000 puntos de maestría de un Pokémon.</p>
        <div class="ph-grid big" id="ph-grid"></div>`;
      $('ph-back').onclick = back;
      const g = $('ph-grid');
      for (const f of ids) {
        const lock = G.Photo.frameLock(f), on = me.f === f;
        const c = document.createElement('button');
        c.type = 'button';
        c.className = 'ph-cell' + (on ? ' on' : '') + (lock ? ' locked' : '');
        c.innerHTML = `${G.Photo.html({ d: me.d, e: me.e, f }, 72, lock ? 'locked' : '')}<small>${esc(G.Photo.frameName(f))}</small>
          ${lock ? `<small class="lock">${esc(G.T(LOCK[lock] || ''))}</small>` : on ? '<small class="gold">Puesto</small>' : ''}`;
        c.onclick = () => {
          if (lock) { G.Audio.sfx('error'); G.UI.toast(G.T(LOCK[lock] || '')); return; }
          G.Photo.setFrame(f);
          saveProfile(); G.Audio.sfx('confirm');
          back();
        };
        g.appendChild(c);
      }
    }

    // ---------------- Tienda Kecleon ----------------

    /** Las fotos del día y los marcos de la semana, al final de la tienda (shop-ui.js render). */
    function shopSection(box, onBuy) {
      const s = sv(), coin = n => `<span class="coin"></span> ${N(n)}`;
      const row = (pv, title, desc, right) => `<div class="panel upg-item"><div class="ic">${pv}</div>
        <div><b>${title}</b><div class="sub" style="font-size:13px">${desc}</div></div><div class="upg-btns">${right}</div></div>`;
      let h = `<h3 style="margin:14px 0 6px">${G.Icons.html('user', 18)} Fotos y marcos</h3>
        <p class="sub" style="margin:0 0 8px">Para la foto de tu perfil (Misiones → Perfil): 4 fotos nuevas cada día y 2 marcos cada semana, los mismos para todos.</p><div class="upg">`;
      const me = G.Photo.mine(s);
      for (const p of G.Photo.dailyPhotos()) {
        const got = !!(s.photos && s.photos[p.key]);
        h += row(G.Photo.faceHtml(p.d, p.e, 40), `<span>${esc(G.DEX_BY[p.d].name)}</span> · <span>${esc(G.T(G.Photo.exName(p.e)))}</span>`,
          got ? 'Comprada: póntela en Misiones → Perfil.' : 'Foto para tu perfil, para siempre.',
          got ? '<b class="gold">Comprada</b>' : `<button class="btn small gold" data-buy-ph="${p.key}" data-sfx="none" ${s.coins < G.Photo.PHOTO_PRICE ? 'disabled' : ''} type="button">${coin(G.Photo.PHOTO_PRICE)}</button>`);
      }
      for (const f of G.Photo.weeklyFrames()) {
        const got = !!(s.frames && s.frames[f]);
        h += row(G.Photo.html({ d: me.d, e: me.e, f }, 44), esc(G.Photo.frameName(f)),
          got ? 'Comprado: póntelo en Misiones → Perfil.' : 'Marco para tu foto, para siempre.',
          got ? '<b class="gold">Comprado</b>' : `<button class="btn small gold" data-buy-fr="${f}" data-sfx="none" ${s.coins < G.Photo.FRAME_PRICE ? 'disabled' : ''} type="button">${coin(G.Photo.FRAME_PRICE)}</button>`);
      }
      box.insertAdjacentHTML('beforeend', h + '</div>');
      const buy = (r, b) => {
        if (!r.ok) { if (r.error) G.UI.toast(G.T(r.error)); G.Audio.sfx('error'); return; }
        G.Audio.sfx('buy');
        G.UI.refreshCoins();
        if (onBuy) onBuy(b);
      };
      box.querySelectorAll('[data-buy-ph]').forEach(b => { b.onclick = () => buy(G.Photo.buyPhoto(b.dataset.buyPh), b); });
      box.querySelectorAll('[data-buy-fr]').forEach(b => { b.onclick = () => buy(G.Photo.buyFrame(b.dataset.buyFr), b); });
    }

    /** Ventana del perfil público: la foto con su marco junto al nombre. */
    function profileHead(d) {
      const ph = d.ph || G.Photo.fromPub(d);
      return ph ? G.Photo.html(ph, 80, 'prof-ph') : '';
    }

    return { editor, pickPhoto, pickFrame, shopSection, profileHead };
  })();
})();
