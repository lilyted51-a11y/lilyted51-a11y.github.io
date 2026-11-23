/* ============ eggs-ui.js — huevos en la Mochila y su eclosión ============
 * (23-11-2026) La lógica está en systems/eggs.js. Aquí:
 *   - los iconos de los tres huevos ('egg:c', 'egg:r', 'egg:m'; 12×12 como los de ui/icons.js)
 *   - la sección «Huevos» de la Mochila (shop-ui.js, openBag): cada huevo con su barra de incubación y,
 *     cuando está listo, el botón «Abrir»
 *   - la eclosión (#egg-fx, encima de todo, como la tirada del gacha): el huevo se tambalea en pixel art, se
 *     agrieta, brilla y sale el Pokémon en su carta (tocar el huevo la adelanta; Esc también)
 *   - las líneas del resumen de la partida y del menú
 * Con cuenta y sin conexión no se abre (como el gacha); un segundo toque mientras se abre no hace nada.
 */
G.EggsUI = (() => {
  const $ = id => document.getElementById(id);

  // ---------------- iconos ----------------
  // h brillo · w cáscara · s motas · d sombra
  const ROWS = ['....kkkk....', '...khwwwk...', '..khwwsswk..', '..kwwwsswk..', '.kwssswwwdk.', '.kwsswwwwdk.',
                '.kwwwwwssdk.', 'kwwwwwwssddk', 'kwsswwwwwddk', 'kwsswwwwdddk', '.kwwwwwdddk.', '..kkkkkkkk..'];
  const PAL = {
    c: { h: '#ffffff', w: '#f4f1e1', s: '#5fe08a', d: '#c9c3a8' },
    r: { h: '#ffffff', w: '#e8f3ff', s: '#4fb4ff', d: '#a9c3e0' },
    m: { h: '#ffffff', w: '#efe2ff', s: '#ffcb3d', d: '#a98ad6' }
  };
  for (const k in PAL) G.Icons.UI['egg:' + k] = { pal: PAL[k], rows: ROWS };

  // ---------------- Mochila ----------------

  /** La sección de huevos de la Mochila (va arriba del todo). */
  function bagHtml() {
    const s = G.DB.save, eggs = G.Eggs.list(s);
    let h = `<h3 style="margin:10px 0 6px">${G.Icons.html('egg:m', 18)} ${G.T('Huevos')}</h3>
      <p class="sub" style="margin:0 0 8px">${G.T('Salen de las grietas, de las misiones semanales y del gacha. Se incuban solos mientras juegas: cuando uno esté listo, ábrelo y verás qué Pokémon sale (a veces, shiny).')}
      <br><small>${G.I18n.f('Próximo huevo del gacha: dentro de {x} tiradas ×10', G.Eggs.toNext(s))}</small></p>`;
    if (!eggs.length) return h + `<p class="sub center" style="margin:4px 0 12px">${G.T('No tienes ningún huevo.')}</p>`;
    h += '<div class="upg egg-list">';
    for (const e of eggs) {
      const K = G.Eggs.KINDS[e.k], ok = G.Eggs.ready(e), pct = Math.min(100, Math.floor((+e.p || 0) / K.need * 100));
      const desc = (ok ? `<b class="gold">${G.T('¡Listo para abrir!')}</b>` : G.I18n.f('{x} de {x} min jugados', Math.floor((+e.p || 0) / 60), K.need / 60)) +
        `<div class="egg-bar" style="--ec:${K.col}"><i style="width:${pct}%"></i></div>`;
      const btn = ok ? `<button class="btn small gold" data-egg="${e.id}" data-sfx="none">${G.T('Abrir')}</button>` : `<b class="sub">${pct} %</b>`;
      h += `<div class="panel upg-item${ok ? ' egg-ready' : ''}"><div class="ic">${G.Icons.html('egg:' + e.k, 32)}</div>
        <div><b>${G.T(K.name)}</b> <small class="sub">· ${G.T(G.Eggs.FROM_NAME[e.f] || '')}</small><div class="sub" style="font-size:13px">${desc}</div></div>
        <div class="upg-btns">${btn}</div></div>`;
    }
    return h + '</div>';
  }

  /** Los botones «Abrir» de la Mochila. */
  function wire(box) {
    box.querySelectorAll('[data-egg]').forEach(b => {
      b.onclick = () => { b.disabled = true; hatch(b.dataset.egg, b); };
    });
  }

  // ---------------- abrir ----------------

  let busy = false, skipNow = null;
  const needsNet = () => G.DB.online && navigator.onLine === false;

  async function hatch(id, btn) {
    if (busy) return;                                  // doble toque: el segundo no hace nada
    const s = G.DB.save, e = s && s.eggs && s.eggs[id];
    if (!e || !G.Eggs.ready(e)) return;                // (ya abierto)
    if (needsNet()) {
      if (btn) btn.disabled = false;
      G.Audio.sfx('error'); G.UI.toast(G.T('Sin conexión: con tu cuenta, abrir huevos necesita internet.'), 3200);
      return;
    }
    busy = true;
    const r = G.Eggs.open(id);
    if (!r) { busy = false; return; }
    G.Progress.checkAch();
    G.DB.commit(true);
    if (G.DB.online) G.DB.flush();                     // a la nube ya (como el gacha)
    const fx = $('egg-fx'), out = $('egg-out'), cv = $('egg-cv');
    out.innerHTML = '';
    $('egg-close').classList.add('hidden');
    cv.classList.remove('hidden');
    $('egg-title').textContent = G.T('¡Algo se mueve dentro del huevo!');
    fx.classList.remove('hidden');
    try {
      await play(r.k);
      cv.classList.add('hidden');
      fx.classList.remove('flash'); void fx.offsetWidth; fx.classList.add('flash');
      reveal(r);
    } catch (err) { console.error('[Huevos]', err); }    // (el huevo ya está abierto y guardado: que se pueda salir)
    $('egg-close').classList.remove('hidden');
    G.UI.refreshCoins();
  }

  /** La animación del huevo (pixel art en un lienzo de 96×96, ampliado). Tocarlo la adelanta. */
  function play(k) {
    return new Promise(done => {
      const cv = $('egg-cv'), c = cv.getContext('2d');
      const img = G.Icons.canvas('egg:' + k), S = 5, W = 12 * S, col = G.Eggs.KINDS[k].col;
      // Versión blanca del huevo, para el brillo antes de abrirse.
      const white = document.createElement('canvas'); white.width = img.width; white.height = img.height;
      const wc = white.getContext('2d'); wc.drawImage(img, 0, 0); wc.globalCompositeOperation = 'source-in'; wc.fillStyle = '#fff'; wc.fillRect(0, 0, white.width, white.height);
      // Grietas (en píxeles del huevo), en tres tandas.
      const CR = [[[6, 2], [5, 3], [6, 4]], [[5, 5], [4, 6], [5, 7], [7, 5], [8, 6]], [[3, 7], [2, 8], [8, 7], [9, 8], [6, 8], [7, 9]]];
      const SND = [[250, 'shake'], [700, 'break'], [950, 'shake'], [1300, 'break'], [1600, 'shake'], [1900, 'break']];
      const t0 = performance.now();
      let ended = false, si = 0;
      const finish = () => { if (ended) return; ended = true; cv.onclick = null; skipNow = null; done(); };
      cv.onclick = finish;
      skipNow = finish;
      function frame(now) {
        if (ended) return;
        const t = now - t0;
        while (si < SND.length && t >= SND[si][0]) G.Audio.sfx(SND[si++][1]);
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, 96, 96);
        const glow = Math.max(0, Math.min(1, (t - 1900) / 500));
        // Halo detrás del huevo.
        c.globalAlpha = 0.18 + glow * 0.5;
        c.fillStyle = col;
        for (let rr = 34; rr > 0; rr -= 6) { c.globalAlpha = (0.05 + glow * 0.12); c.beginPath(); c.arc(48, 52, rr + glow * 10, 0, 6.2832); c.fill(); }
        c.globalAlpha = 1;
        // Rayos de luz (píxeles) que salen de las grietas.
        if (glow > 0) {
          c.fillStyle = '#ffffff';
          for (let a = 0; a < 8; a++) {
            const ang = a * Math.PI / 4 + 0.2, len = 10 + glow * 34;
            for (let d = 16; d < len; d += 3) c.fillRect(Math.round(48 + Math.cos(ang) * d) - 1, Math.round(52 + Math.sin(ang) * d) - 1, 2, 2);
          }
        }
        // Tambaleos: tres tandas, cada vez más fuertes.
        let ang = 0;
        [250, 950, 1600].forEach((b, i) => { const u = (t - b) / 380; if (u > 0 && u < 1) ang = Math.sin(u * Math.PI * 4) * (1 - u) * (0.16 + i * 0.08); });
        if (glow > 0) ang = Math.sin(t / 22) * 0.04 * glow;
        c.save();
        c.translate(48, 80); c.rotate(ang);
        c.drawImage(img, -W / 2, -W, W, W);
        c.fillStyle = '#1b1528';
        const n = t > 1900 ? 3 : t > 1300 ? 2 : t > 700 ? 1 : 0;
        for (let i = 0; i < n; i++) for (const [x, y] of CR[i]) c.fillRect(-W / 2 + x * S, -W + y * S, S, S);
        if (glow > 0) { c.globalAlpha = glow * 0.85; c.drawImage(white, -W / 2, -W, W, W); c.globalAlpha = 1; }
        c.restore();
        // Fogonazo final: un círculo de luz que crece y, al acabar, toda la pantalla en blanco (CSS, .flash).
        if (t > 2350) {
          const u = Math.min(1, (t - 2350) / 300);
          c.fillStyle = '#ffffff';
          for (const [rr, a] of [[46, 0.35], [38, 0.7], [30, 1]]) { c.globalAlpha = a * u; c.beginPath(); c.arc(48, 52, rr * (0.3 + 0.7 * u), 0, 6.2832); c.fill(); }
          c.globalAlpha = 1;
        }
        if (t > 2650) { finish(); return; }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  /** La carta del Pokémon que ha salido. */
  function reveal(r) {
    const mon = G.DEX_BY[r.dex], out = $('egg-out');
    G.Audio.sfx('burst', { rarity: r.rarity });
    if (r.shiny) G.Audio.sfx('shinyGet');
    $('egg-title').textContent = G.I18n.f(r.shiny ? '¡{x} shiny ha salido del huevo!' : '¡{x} ha salido del huevo!', mon.name);
    const c = document.createElement('div');
    c.className = 'pcard egg-card r' + r.rarity + (r.shiny ? ' shiny' : '');
    c.style.setProperty('--rc', r.shiny ? '#9ae6ff' : G.Gacha.RARITY_COLOR[r.rarity]);
    c.innerHTML = `<div class="stars">${G.UI.stars(r.rarity, 24)}</div>`;
    c.appendChild(G.UI.spriteCanvas(r.dex, 132, 120, { lively: true, scale: 2, shiny: r.shiny }));
    const tag = r.isNew ? `<span class="new">${r.shiny ? G.T('¡SHINY NUEVO!') : G.T('¡NUEVO!')}</span>`
      : `${G.T('Repetido')} · <span class="coin"></span> +${r.refund}`;
    c.insertAdjacentHTML('beforeend', `<b>${r.shiny ? G.Icons.html('shiny', 12) + ' ' : ''}${mon.name}</b><div class="tag">${tag}</div>`);
    out.appendChild(c);
  }

  function close() {
    if (!busy) return;
    $('egg-fx').classList.add('hidden');
    $('egg-fx').classList.remove('flash');
    busy = false;
    if (G.UI.isOpen('scr-bag')) G.ShopUI.openBag();
  }

  function init() {
    $('egg-close').onclick = close;
    addEventListener('keydown', ev => {
      if (ev.key !== 'Escape' || $('egg-fx').classList.contains('hidden')) return;
      if (skipNow) skipNow(); else if (!$('egg-close').classList.contains('hidden')) close();
    });
    // Con cuenta, abrir necesita conexión: al irse o volver la red, la Mochila se pone al día.
    for (const ev of ['online', 'offline']) addEventListener(ev, () => { if (G.UI.isOpen('scr-bag') && !busy) G.ShopUI.openBag(); });
  }

  // ---------------- resumen de la partida y menú ----------------

  /** Línea «Huevos» del fin de partida (ui/run-ui.js): el de la grieta, lo incubado y los listos. */
  function overHtml() {
    const L = G.Eggs.lastRun;
    if (!L || (!L.any && !L.got)) return '';
    const p = [];
    // (Cada trozo en su elemento: el parche del chino traduce nodo a nodo.)
    if (L.got) p.push(`${G.Icons.html('egg:c', 22)} <span>${G.T('+1 Huevo común')}</span>`);
    if (L.secs >= 60 && L.any > L.got) p.push(`<span>${G.I18n.f('+{x} min de incubación', Math.floor(L.secs / 60))}</span>`);
    if (L.ready) p.push(`<span class="gold">${G.I18n.f(L.ready === 1 ? '{x} listo para abrir' : '{x} listos para abrir', L.ready)}</span>`);
    if (!p.length) return '';
    return `<div style="grid-column:1/-1"><span>${G.T('Huevos')}</span><b style="font-size:15px">${p.join('<span> · </span>')}</b></div>`;
  }

  /** Para la línea bajo «Mochila» en el menú. */
  function menuText() {
    const n = G.Eggs.count(), r = G.Eggs.readyCount();
    if (!n) return '';
    // (Trozos separados por « · », como el resto de la línea: el parche del chino los traduce uno a uno.)
    return G.I18n.f('Huevos: {x}', n) + (r ? ' · ' + G.I18n.f(r === 1 ? '{x} listo para abrir' : '{x} listos para abrir', r) : '');
  }

  init();          // (scripts con defer: la página ya está montada)
  return { bagHtml, wire, hatch, overHtml, menuText, get busy() { return busy; } };
})();
