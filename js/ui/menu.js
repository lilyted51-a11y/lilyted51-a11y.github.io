/* ============ menu.js — menú principal, colección y mejoras ============ */
G.MenuUI = (() => {
  const $ = G.UI.$;
  const GEN_NAMES = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Teselia', 'Kalos', 'Alola', 'Galar', 'Paldea'];
  let dexGen = 1, dexSel = null;
  // Filtros de la colección (se combinan): tengo / me faltan, rarezas (varias),
  // shiny, favoritos, tipo y búsqueda; y el orden. Duran mientras no recargas.
  const DEX0 = () => ({ status: 'all', rar: new Set(), shiny: false, fav: false, type: '', q: '', sort: 'num' });
  let dexF = DEX0();
  const SORTS = [['num', 'Nº'], ['name', 'Nombre'], ['rar', 'Rareza'], ['new', 'Recién conseguidos'], ['used', 'Más usados']];
  // Copia local: búsqueda que entiende también el nombre en chino (lo usa la pantalla de mejoras).
  function dexMatch(p, q) {
    if (!q) return true;
    if (/^\d+$/.test(q)) return String(p.dex) === q || String(p.dex).padStart(3, '0').startsWith(q) || String(p.dex).startsWith(q);
    if (p.name.toLowerCase().includes(q)) return true;
    const zh = window.PSZH_DICT && window.PSZH_DICT[p.name];
    return !!(zh && zh.includes(q));
  }

  function init() {
    const ICON = { play: 'ball', dex: 'book', upgrades: 'up', gacha: 'ball4', goals: 'medal3', friends: 'friends', rank: 'trophy', settings: 'gear' };
    document.querySelectorAll('#scr-menu [data-go]').forEach(b => {
      b.insertAdjacentHTML('afterbegin', `<span class="mi-ico">${G.Icons.html(ICON[b.dataset.go], 26)}</span>`);
      b.dataset.sfx = b.dataset.go === 'play' ? 'confirm' : 'click';
      b.onclick = () => {
        const go = b.dataset.go;
        if (go === 'play') { if (G.Social.room) G.LobbyUI.open(); else G.Flow.play(); }
        else if (go === 'dex') openDex();
        else if (go === 'upgrades') openUpgrades();
        else if (go === 'gacha') G.GachaUI.open();
        else if (go === 'goals') G.GoalsUI.open();
        else if (go === 'friends') G.FriendsUI.open();
        else if (go === 'rank') G.RankingUI.open();
        else if (go === 'settings') G.SettingsUI.open();
      };
    });
    document.querySelectorAll('[data-back]').forEach(b => { b.onclick = open; });
    G.Social.on(() => { if (G.UI.isOpen('scr-menu')) socialLine(); });
    $('btn-logout').onclick = () => {
      if (G.DB.guest && !confirm('Eres invitado: se perderá todo el progreso. ¿Salir?')) return;
      G.Audio.music(null);
      G.DB.logout().then(() => G.Flow.toLogin());
    };
  }

  // ---------------- menú principal ----------------

  function open() {
    giftTo = null;
    const s = G.DB.save;
    const mon = G.DEX_BY[s.partner];
    const shiny = !!s.partnerShiny && G.DB.ownsShiny(mon.dex);
    G.UI.chrome(true);
    G.UI.show('scr-menu');
    G.UI.sprite($('menu-partner'), mon.dex, { lively: true, scale: 4, hero: true, shiny });
    $('menu-partner').style.setProperty('--stage-c', shiny ? '#9ae6ff' : G.U.TYPE_COLOR[mon.types[0]]);
    $('menu-partner').classList.toggle('shiny', shiny);
    $('menu-partner-name').innerHTML = mon.name + (shiny ? ' ' + G.Icons.html('shiny', 24) : '');
    $('menu-partner-info').innerHTML = G.UI.typeChips(mon.types) + ' ' + G.UI.stars(mon.rarity);
    // Normal / shiny a mano, aquí mismo (en el móvil no se encontraba en la ficha).
    const seg = $('menu-shiny');
    seg.classList.toggle('hidden', !G.DB.ownsShiny(mon.dex));
    seg.lastChild.innerHTML = G.Icons.html('shiny', 12) + ' Shiny';
    seg.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', (b.dataset.v === '1') === shiny);
      b.onclick = () => {
        if ((b.dataset.v === '1') === shiny) return;
        s.partnerShiny = b.dataset.v === '1';
        G.DB.commit();
        G.Audio.sfx('confirm');
        open();
      };
    });

    const owned = Object.keys(s.owned).filter(d => G.DEX_BY[d] && !G.DEX_BY[d].excl).length;
    const shinies = Object.keys(s.shiny || {}).filter(d => G.DEX_BY[d] && !G.DEX_BY[d].excl).length;
    $('menu-dex-count').textContent = `${owned} / ${G.DEX.filter(p => !p.excl).length}` + (shinies ? ` · ${shinies} shiny` : '');

    const st = s.stats;
    $('menu-stats').innerHTML =
      `Runs <b style="color:#fff">${st.runs}</b> · Mejor tiempo <b style="color:#fff">${G.U.mmss(st.bestTime)}</b><br>` +
      `Mejor nivel <b style="color:#fff">${st.bestLevel}</b> · Derrotados <b style="color:#fff">${st.totalKills.toLocaleString('es')}</b>` +
      (G.DB.guest ? '<br><span style="color:#ffb0b8">Modo invitado: no se guarda</span>' : '');

    socialLine();
    // Premios de misiones por recoger.
    G.Progress.checkAch();
    const pend = G.Progress.pending();
    $('menu-goals-sub').textContent = pend ? pend + (pend === 1 ? ' premio por recoger' : ' premios por recoger') : 'Misiones, logros y perfil';
    $('menu-goals-sub').classList.toggle('gold', pend > 0);
    // Con cuenta en la nube: amigos en línea, invitaciones y (una vez) el apodo.
    if (G.DB.online && !G.Social.started) {
      G.Social.start().then(r => {
        if (r === 'need-nick' && !G.NickUI.skipped && G.UI.isOpen('scr-menu')) G.NickUI.open();
        socialLine();
      });
    }
    G.InvitePop.refresh();
  }

  /** Texto bajo "Amigos" y "Jugar": quién está en línea, solicitudes, sala. */
  function socialLine() {
    const room = G.Social.room;
    const play = document.querySelector('#scr-menu [data-go=play] small');
    if (play) play.textContent = room ? 'Volver a tu sala (' + room.members.length + '/' + (room.max || 8) + ')' : 'Entra en la mazmorra';
    const fr = G.Social.friends;
    const on = fr.filter(f => f.status === 'ok' && f.online).length;
    const req = fr.filter(f => f.status === 'in').length;
    const parts = [];
    if (on) parts.push(on + ' en línea');
    if (req) parts.push(req + (req === 1 ? ' solicitud' : ' solicitudes'));
    const un = G.Social.unreadDm ? G.Social.unreadDm() : 0;   // copia local: mensajes privados sin leer
    if (un) parts.push(un + (un === 1 ? ' mensaje nuevo' : ' mensajes nuevos'));
    $('menu-friends-sub').textContent = parts.length ? parts.join(' · ') : 'Juega en grupo, hasta 10';
    $('menu-friends-sub').classList.toggle('gold', req > 0 || un > 0);
    // Copia local: globo rojo con los mensajes privados (y solicitudes) sin leer sobre «Amigos»
    const badge = $('menu-dm-badge');
    if (badge) { const n = un + req; badge.textContent = n > 99 ? '99+' : String(n); badge.classList.toggle('hidden', n === 0); }
  }

  // ---------------- colección ----------------

  // Copia local: modo regalo del administrador (Ajustes > Cuenta > Regalar Pokémon):
  // la Pokédex enseña todos los Pokémon y el botón envía el elegido a `giftTo`.
  let giftTo = null;            // { uid, name } | null
  function openDexGift(target) { giftTo = target; dexF = DEX0(); dexSel = null; openDex(); }

  function openDex() {
    G.UI.show('scr-dex', true);
    const s = G.DB.save;
    if (dexSel == null) { dexSel = s.partner; dexGen = G.DEX_BY[s.partner].gen; }
    const owned = Object.keys(s.owned).filter(d => G.DEX_BY[d] && !G.DEX_BY[d].excl).length;
    $('dex-total').textContent = giftTo ? 'Regalo para ' + giftTo.name : `${owned} / ${G.DEX.filter(p => !p.excl).length}`;

    // Pestañas de generación (y "Todas"), con cuántos tienes de cada una.
    const tabs = $('dex-gens');
    tabs.innerHTML = '';
    ['Todas', ...GEN_NAMES].forEach((name, g) => {
      const list = (g ? G.DEX.filter(p => p.gen === g) : G.DEX).filter(p => !p.excl);   // copia local: sin exclusivos en las cuentas
      const have = list.filter(p => s.owned[p.dex]).length;
      const b = document.createElement('button');
      b.className = 'gen-tab' + (g === dexGen && !dexF.q ? ' on' : '');
      b.innerHTML = `<b>${name}</b><small>${have}/${list.length}</small>`;
      b.onclick = () => { dexGen = g; openDex(); };
      tabs.appendChild(b);
    });

    // Tengo / me faltan (uno), rarezas (las que quieras), shiny y favoritos.
    const fb = $('dex-filters');
    fb.innerHTML = '';
    const chip = (html, on, fn) => {
      const c = document.createElement('button');
      c.className = 'chip' + (on ? ' on' : '');
      c.innerHTML = html;
      c.onclick = () => { fn(); openDex(); };
      fb.appendChild(c);
    };
    for (const [k, label] of [['all', 'Todos'], ['own', 'Tengo'], ['miss', 'Me faltan']]) chip(label, dexF.status === k, () => { dexF.status = k; });
    chip(G.Icons.html('shiny', 12) + ' Shiny', dexF.shiny, () => { dexF.shiny = !dexF.shiny; });
    chip(G.Icons.html('star', 12) + ' Favoritos', dexF.fav, () => { dexF.fav = !dexF.fav; });
    for (const r of [5, 4, 3, 2, 1]) {
      chip(G.Icons.rarity(r, 12) + ' ' + G.Gacha.RARITY_NAME[r], dexF.rar.has(r), () => { dexF.rar.has(r) ? dexF.rar.delete(r) : dexF.rar.add(r); });
    }

    // Orden.
    const sb = $('dex-sort');
    sb.innerHTML = '<span class="sub">Orden:</span>';
    for (const [k, label] of SORTS) {
      const c = document.createElement('button');
      c.className = 'chip' + (dexF.sort === k ? ' on' : '');
      c.textContent = label;
      c.onclick = () => { dexF.sort = k; openDex(); };
      sb.appendChild(c);
    }

    // Tipo y búsqueda (la búsqueda mira en todas las generaciones).
    const ts = $('dex-type');
    ts.innerHTML = `<option value="">Todos los tipos</option>` +
      Object.keys(G.U.TYPE_NAME).map(t => `<option value="${t}">${G.U.TYPE_NAME[t]}</option>`).join('');
    ts.value = dexF.type;
    ts.onchange = () => { dexF.type = ts.value; openDex(); };
    const q = $('dex-q');
    if (q.value !== dexF.q) q.value = dexF.q;
    q.oninput = () => {
      clearTimeout(qT);
      qT = setTimeout(() => {
        dexF.q = q.value; renderGrid();
        $('dex-gens').querySelectorAll('.gen-tab').forEach((b, g) => b.classList.toggle('on', g === dexGen && !dexF.q));
      }, 150);
    };
    q.onkeydown = e => {
      if (e.key === 'Escape') { e.stopPropagation(); q.blur(); }
      if (e.key === 'Enter') { const first = $('dex-grid').querySelector('.cell'); if (first) first.click(); e.preventDefault(); }   // copia local
    };
    $('dex-clear').onclick = () => { dexF = DEX0(); openDex(); };
    renderGrid();
    showDetail(dexSel);
  }

  /** Lo que se ve con la generación, los filtros y el orden de ahora. */
  function dexList() {
    const s = G.DB.save, f = dexF;
    const q = f.q.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const num = /^#?\d+$/.test(q) ? +q.replace('#', '') : null;
    const list = G.DEX.filter(p => {
      if (p.excl && !s.owned[p.dex]) return false;   // copia local: exclusivos, sólo quien los tiene
      const own = giftTo ? true : !!s.owned[p.dex];   // copia local: regalando se ve todo
      if (q) {
        // Por número, o por nombre (sin tildes; copia local: también en chino); de los que no tienes no se busca el nombre.
        const zh = window.PSZH_DICT && window.PSZH_DICT[p.name];
        if (num != null ? p.dex !== num : !(own && (p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) || (zh && zh.includes(f.q.trim()))))) return false;
      } else if (dexGen && p.gen !== dexGen) return false;
      if (f.status === 'own' && !own) return false;
      if (f.status === 'miss' && own) return false;
      if (f.shiny && !(s.shiny && s.shiny[p.dex])) return false;
      if (f.fav && !G.DB.isFav(p.dex)) return false;
      if (f.rar.size && !f.rar.has(p.rarity)) return false;
      if (f.type && !(own && p.types.includes(f.type))) return false;
      return true;
    });
    const at = p => (s.owned[p.dex] && s.owned[p.dex].at) || 0, used = p => +(s.pused || {})[p.dex] || 0;
    const by = { num: (a, b) => a.dex - b.dex, name: (a, b) => a.name.localeCompare(b.name, 'es'),
                 rar: (a, b) => b.rarity - a.rarity || a.dex - b.dex, new: (a, b) => at(b) - at(a) || a.dex - b.dex,
                 used: (a, b) => used(b) - used(a) || a.dex - b.dex }[f.sort];
    // Los que no tienes no tienen nombre a la vista: al ordenar por nombre van al final.
    if (f.sort === 'name') list.sort((a, b) => (!s.owned[a.dex]) - (!s.owned[b.dex]) || by(a, b)); else list.sort(by);
    return list;
  }

  /*
   * La rejilla se pinta por tandas de PAGE: con "Todas" son 966 Pokémon, cada
   * uno con su animación y su hoja de sprites, y pintarlos de golpe paraba el
   * juego (y la música) un segundo al borrar la búsqueda o cambiar el orden.
   * Al acercarse al final de la lista se pinta la siguiente tanda.
   * keep: volver a pintar los mismos que había (marcar un favorito no te
   * devuelve arriba).
   */
  const PAGE = 48;
  let qT = 0, gridList = [], gridShown = 0, gridIO = null;
  function renderGrid(keep = false) {
    const grid = $('dex-grid');
    const want = keep ? Math.max(PAGE, gridShown) : PAGE;
    const top = grid.scrollTop;
    grid.innerHTML = '';
    gridList = dexList();
    gridShown = 0;
    const f = dexF, busy = f.q || f.status !== 'all' || f.shiny || f.fav || f.rar.size || f.type || f.sort !== 'num';
    $('dex-count').textContent = gridList.length === 1 ? '1 Pokémon' : gridList.length + ' Pokémon';
    $('dex-clear').classList.toggle('hidden', !busy);
    if (!gridList.length) { grid.innerHTML = '<p class="sub" style="grid-column:1/-1">Ninguno con estos filtros.</p>'; return; }
    moreCells(want);
    if (keep) grid.scrollTop = top;
  }

  function moreCells(n = PAGE) {
    const grid = $('dex-grid');
    const old = grid.querySelector('.dex-more');
    if (old) { if (gridIO) gridIO.unobserve(old); old.remove(); }
    const end = Math.min(gridList.length, gridShown + n);
    for (let i = gridShown; i < end; i++) grid.appendChild(dexCell(gridList[i]));
    gridShown = end;
    if (gridShown >= gridList.length) return;
    // Marca al final: cuando se acerca a la vista, la siguiente tanda.
    const more = document.createElement('div');
    more.className = 'dex-more';
    grid.appendChild(more);
    if (!('IntersectionObserver' in window)) { moreCells(gridList.length); return; }
    gridIO = gridIO || new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) moreCells(); }, { rootMargin: '300px' });
    gridIO.observe(more);
  }

  function dexCell(p) {
    const s = G.DB.save;
    const own = giftTo ? true : !!s.owned[p.dex], sh = !!(s.shiny && s.shiny[p.dex]);   // copia local: regalando se ve todo
    const cell = document.createElement('div');
    cell.className = 'cell' + (own ? '' : ' locked') + (p.dex === dexSel ? ' on' : '');
    cell.dataset.pad = '1';
    cell.insertAdjacentHTML('beforeend', `<span class="no">${String(p.dex).padStart(3, '0')}${G.DB.isFav(p.dex) ? ' ' + G.Icons.html('star', 10) : ''}</span>`);
    if (p.dex === s.partner) cell.insertAdjacentHTML('beforeend', `<span class="badge-r" title="Compañero">${G.Icons.html('crown', 14)}</span>`);
    else if (sh) cell.insertAdjacentHTML('beforeend', `<span class="badge-r" title="Tienes su shiny">${G.Icons.html('shiny', 12)}</span>`);
    const useShiny = sh && p.dex === s.partner && s.partnerShiny;
    cell.appendChild(G.UI.spriteCanvas(p.dex, 92, 80, { scale: 2, silhouette: !own, shadow: own, shiny: useShiny }));
    cell.insertAdjacentHTML('beforeend', `<b>${own ? p.name : '???'}</b>${G.UI.stars(p.rarity, 9)}`);
    cell.onclick = () => {
      dexSel = p.dex;
      $('dex-grid').querySelectorAll('.cell').forEach(c => c.classList.remove('on'));
      cell.classList.add('on');
      showDetail(p.dex);
    };
    return cell;
  }

  // Variante que se está viendo en la ficha (normal o shiny).
  let viewShiny = false;

  function showDetail(dex) {
    const s = G.DB.save;
    const p = G.DEX_BY[dex];
    const own = giftTo ? true : !!s.owned[dex];
    const hasSh = giftTo ? true : G.DB.ownsShiny(dex);
    const isPartner = !giftTo && dex === s.partner;
    if (!hasSh) viewShiny = false;
    else if (isPartner && dex !== showDetail.last) viewShiny = !!s.partnerShiny;
    showDetail.last = dex;

    const max = { hp: 183, atk: 1.55, spd: 137, def: 160 };
    const bar = (label, v, m, txt) =>
      `<div class="stat"><span>${label}</span><div class="bar"><i style="width:${Math.min(100, v / m * 100)}%"></i></div><span>${txt}</span></div>`;
    const usingThis = isPartner && (!hasSh || !!s.partnerShiny === viewShiny);

    const box = $('dex-detail');
    box.innerHTML = `
      <canvas id="dex-big" class="stage" width="220" height="190"></canvas>
      ${hasSh ? `<div class="seg">
          <button class="${viewShiny ? '' : 'on'}" data-v="0">Normal</button>
          <button class="${viewShiny ? 'on' : ''}" data-v="1">${G.Icons.html('shiny', 12)} Shiny</button></div>` : ''}
      <div class="center">
        <div style="color:var(--muted);font-size:13px">Nº ${String(p.dex).padStart(3, '0')} · ${GEN_NAMES[p.gen - 1]}</div>
        <h3>${own ? p.name : '???'}</h3>
        ${own ? `<button id="dex-fav" class="chip${G.DB.isFav(dex) ? ' on' : ''}" type="button">${G.Icons.html(G.DB.isFav(dex) ? 'star' : 'starDim', 12)} ${G.DB.isFav(dex) ? 'Favorito' : 'Marcar como favorito'}</button>` : ''}
        <div style="color:${G.Gacha.RARITY_COLOR[p.rarity]}">${G.UI.stars(p.rarity, 24)} ${G.Gacha.RARITY_NAME[p.rarity]}</div>
        <div style="margin:6px 0">${own ? G.UI.typeChips(p.types) : ''}</div>
      </div>
      ${own ? `
        ${bar('Vida', p.hp, max.hp, p.hp)}
        ${bar('Ataque', p.pa, max.atk, '×' + p.pa.toFixed(2))}
        ${bar('At. Esp.', p.sa, max.atk, '×' + p.sa.toFixed(2))}
        ${bar('Defensa', p.df, max.def, p.df)}
        ${bar('Def. Esp.', p.sd, max.def, p.sd)}
        ${bar('Velocidad', p.spd, max.spd, p.spd)}
        <p class="sub center" style="margin:6px 0 0">Pega mejor con ataques <b class="gold">${G.Stats.sideOf(p) === 'special' ? 'especiales' : 'físicos'}</b></p>
        <p style="font-size:14px;margin:10px 0 4px">Empieza con <b class="gold">${G.Moves.BY_ID[G.startMoveOf(dex)].name}</b></p>
        <p class="move-icons" title="Movimientos que puede aprender">
          ${G.Moves.poolFor(p).map(id => `<span title="${G.Moves.BY_ID[id].name}">${G.Icons.html('move:' + id, 16)}</span>`).join('')}</p>
        ${giftTo
          ? `<button id="dex-gift" class="btn gold" data-sfx="confirm" style="width:100%">Regalar a ${giftTo.name}${viewShiny ? ' (shiny)' : ''}</button>`
          : usingThis
          ? '<button class="btn grow" disabled style="width:100%">Es tu compañero</button>'
          : `<button id="dex-pick" class="btn gold" data-sfx="confirm" style="width:100%">Elegir de compañero${viewShiny ? ' (shiny)' : ''}</button>`}
      ` : `<p class="center" style="color:var(--muted)">Aún no lo tienes.<br>Consíguelo en el banner de <b class="gold">${GEN_NAMES[p.gen - 1]}</b>
            o derrotándolo cuando salga shiny.</p>`}
    `;
    $('dex-big').style.setProperty('--stage-c', !own ? '#5b83d6' : viewShiny ? '#9ae6ff' : G.U.TYPE_COLOR[p.types[0]]);
    $('dex-big').classList.toggle('shiny', own && viewShiny);
    G.UI.sprite($('dex-big'), dex, { lively: own, spin: own, silhouette: !own, scale: 3, hero: true, shiny: own && viewShiny });
    box.querySelectorAll('.seg button').forEach(b => {
      b.onclick = () => { viewShiny = b.dataset.v === '1'; showDetail(dex); };
    });
    const giftBtn = $('dex-gift');
    if (giftBtn) giftBtn.onclick = async () => {
      if (!await G.UI.ask('¿Regalar <b class="gold" translate="no">' + p.name + (viewShiny ? ' shiny' : '') + '</b> a <b translate="no">' + giftTo.name + '</b>?', 'Regalar')) return;
      giftBtn.disabled = true;
      try { await G.Boost.gift(giftTo.uid, dex, viewShiny); G.UI.toast('Enviado a ' + giftTo.name + ': lo recibe al entrar'); }
      catch (e) { G.UI.toast('No se pudo enviar: ' + e.message); }
      giftBtn.disabled = false;
    };
    const fav = $('dex-fav');
    if (fav) fav.onclick = () => { G.DB.setFav(dex, !G.DB.isFav(dex)); renderGrid(true); showDetail(dex); };
    const pick = $('dex-pick');
    if (pick) pick.onclick = () => {
      s.partner = dex;
      s.partnerShiny = hasSh && viewShiny;
      G.DB.commit();
      if (G.Social.room) G.Social.refreshMember();   // en una sala: los demás lo ven ya
      G.UI.toast(p.name + (s.partnerShiny ? ' shiny' : '') + ' es ahora tu compañero');
      renderGrid(true); showDetail(dex);
    };
  }

  // ---------------- mejoras ----------------

  let upgDex = null;

  let upgQuery = '', upgGen = 1;
  function openUpgrades() {
    G.UI.show('scr-upgrades', true);
    const s = G.DB.save;
    upgDex = s.partner;                 // siempre se abre con el compañero
    upgGen = G.DEX_BY[s.partner].gen;   // ... y en su región
    upgQuery = '';
    const q = $('upg-search');
    if (q) {
      q.value = '';
      if (!q.dataset.wired) {
        q.dataset.wired = '1';
        let t = 0;
        q.oninput = () => { clearTimeout(t); t = setTimeout(() => { upgQuery = q.value.trim().toLowerCase(); renderUpgPick(); }, 120); };
        q.onkeydown = e => {
          if (e.key === 'Enter') { const c = $('upg-pick').querySelector('.pick-card'); if (c) c.click(); e.preventDefault(); }
          if (e.key === 'Escape') { q.value = ''; upgQuery = ''; renderUpgPick(); q.blur(); e.stopPropagation(); }
        };
      }
    }
    renderUpgPick();
    // Copia local: el administrador sube o baja todas las mejoras del Pokémon elegido de golpe (gratis).
    const adm = !!(G.Boost && G.Boost.admin);
    $('upg-max').classList.toggle('hidden', !adm);
    $('upg-zero').classList.toggle('hidden', !adm);
    if (adm) {
      $('upg-max').onclick = () => {
        const lv = G.DB.upgradesOf(upgDex);
        for (const u of G.Upgrades.LIST) lv[u.id] = u.max;
        G.DB.commit(); G.Audio.sfx('legend'); renderUpgrades();
        G.UI.toast(G.DEX_BY[upgDex].name + ': todas las mejoras al máximo');
      };
      $('upg-zero').onclick = async () => {
        if (!await G.UI.ask('¿Poner a cero todas las mejoras de <b class="gold">' + G.DEX_BY[upgDex].name + '</b>?', 'Volver a cero')) return;
        const lv = G.DB.upgradesOf(upgDex);
        for (const u of G.Upgrades.LIST) delete lv[u.id];
        banOpen = false;
        G.DB.commit(); G.Audio.sfx('select'); renderUpgrades();
        G.UI.toast(G.DEX_BY[upgDex].name + ': mejoras a cero');
      };
    }
    renderUpgrades();
  }

  /** Tarjetas con tus Pokémon (el compañero primero, luego los que ya tienen mejoras); con búsqueda, los que coincidan. */
  function renderUpgPick() {
    const s = G.DB.save, box = $('upg-pick');
    if (!box) return;
    const lv = d => Object.values(s.pupg[d] || {}).reduce((a, b) => a + b, 0);
    // Pestañas de región (cuántos tienes en cada una); buscando, se ignoran.
    const tabs = $('upg-gens');
    tabs.innerHTML = '';
    tabs.classList.toggle('hidden', !!upgQuery);
    GEN_NAMES.forEach((name, i) => {
      const g = i + 1;
      const total = G.DEX.filter(p => p.gen === g && !p.excl).length;
      const have = G.DEX.filter(p => p.gen === g && !p.excl && s.owned[p.dex]).length;
      const b = document.createElement('button');
      b.className = 'gen-tab' + (g === upgGen ? ' on' : '');
      b.innerHTML = `<b>${name}</b><small>${have}/${total}</small>`;
      b.onclick = () => { upgGen = g; G.Audio.sfx('select'); renderUpgPick(); };
      tabs.appendChild(b);
    });
    let mons = Object.keys(s.owned).map(Number).filter(d => G.DEX_BY[d])
      .sort((a, b) => (b === s.partner) - (a === s.partner) || lv(b) - lv(a) || a - b);
    mons = upgQuery ? mons.filter(d => dexMatch(G.DEX_BY[d], upgQuery)) : mons.filter(d => G.DEX_BY[d].gen === upgGen);
    box.innerHTML = '';
    if (!mons.length) { box.innerHTML = '<p class="sub" style="margin:4px">Ningún Pokémon coincide.</p>'; return; }
    for (const d of mons) {
      const p = G.DEX_BY[d];
      const c = document.createElement('div');
      c.className = 'pick-card' + (d === upgDex ? ' on' : '');
      c.appendChild(G.UI.spriteCanvas(d, 64, 52, { scale: 1.5, shiny: d === s.partner && !!s.partnerShiny && G.DB.ownsShiny(d) }));
      c.insertAdjacentHTML('beforeend', `<b>${p.name}</b><small>${d === s.partner ? '(compañero)' : 'Nº ' + String(d).padStart(3, '0')}</small>${lv(d) ? `<span class="lv">${lv(d)} niveles</span>` : ''}`);
      c.onclick = () => {
        upgDex = d; G.Audio.sfx('select');
        box.querySelectorAll('.pick-card').forEach(x => x.classList.toggle('on', x === c));
        renderUpgrades();
      };
      box.appendChild(c);
    }
  }

  function renderUpgrades() {
    const s = G.DB.save;
    const levels = G.DB.upgradesOf(upgDex);
    const mon = G.DEX_BY[upgDex];
    const shiny = upgDex === s.partner && !!s.partnerShiny && G.DB.ownsShiny(upgDex);
    G.UI.sprite($('upg-stage'), upgDex, { lively: true, scale: 2, hero: true, shiny });
    $('upg-stage').style.setProperty('--stage-c', shiny ? '#9ae6ff' : G.U.TYPE_COLOR[mon.types[0]]);
    const box = $('upg-list');
    box.innerHTML = '';
    for (const u of G.Upgrades.LIST) {
      const lvl = levels[u.id] || 0;
      const maxed = lvl >= u.max;
      const cost = maxed ? 0 : G.Upgrades.cost(u.id, lvl);
      const el = document.createElement('div');
      el.className = 'panel upg-item';
      el.innerHTML = `
        <div class="ic">${G.Icons.html(u.icon, 32)}</div>
        <div>
          <b>${u.name}</b> <span style="color:var(--muted);font-size:13px">${u.unit}</span>
          <div class="pips">${Array.from({ length: u.max }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div>
        </div>
        <div class="upg-btns">
          ${u.id === 'ban' && lvl > 0 ? `<button class="btn small" data-ban>Elegir (${banList().length}/${lvl})</button>` : ''}
          <button class="btn small ${maxed ? '' : 'gold'}" data-buy data-sfx="none" ${maxed || s.coins < cost ? 'disabled' : ''}>
          ${maxed ? 'Máx.' : `<span class="coin"></span> ${cost}`}</button></div>`;
      if (u.id === 'ban' && lvl > 0) el.querySelector('[data-ban]').onclick = () => { banOpen = !banOpen; renderUpgrades(); };
      el.querySelector('[data-buy]').onclick = () => {
        // Se vuelve a leer todo al pulsar (la partida puede haber cambiado desde que se dibujó).
        const sv = G.DB.save, lv = G.DB.upgradesOf(upgDex), now = lv[u.id] || 0;
        if (now >= u.max) { renderUpgrades(); return; }
        const price = G.Upgrades.cost(u.id, now);
        if (sv.coins < price) { renderUpgrades(); return; }
        sv.coins -= price;
        lv[u.id] = now + 1;
        G.DB.commit(true);
        G.Audio.sfx('buy');
        G.UI.refreshCoins();
        G.UI.toast(`${mon.name} · ${u.name}: nivel ${now + 1}`);
        renderUpgrades();
      };
      box.appendChild(el);
      if (u.id === 'ban' && lvl > 0 && banOpen) box.appendChild(banPicker(lvl));
    }
    box.appendChild(bindPanel());
  }

  // ---------------- atajos: hueco fijo para cada movimiento ----------------
  // save.pbind[dex] = [movimiento del hueco 1, del 2, del 3, del 4] (o null).
  function bindPanel() {
    const s = G.DB.save;
    s.pbind = s.pbind || {};
    const list = s.pbind[upgDex] || [null, null, null, null];
    const mon = G.DEX_BY[upgDex];
    const ids = G.Moves.poolFor(mon).concat([G.startMoveOf(upgDex)]).filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => G.Moves.BY_ID[a].name.localeCompare(G.Moves.BY_ID[b].name, 'es'));
    const el = document.createElement('div');
    el.className = 'panel bind-panel';
    el.innerHTML = `<b>Atajos de movimientos</b>
      <p class="sub" style="margin:2px 0 8px">Elige qué movimiento va siempre en cada hueco (teclas 1-4 o los iconos de abajo), para la memoria muscular. Si aún no tienes tantos movimientos, va al hueco más cercano.</p>
      <div class="bind-slots">${[0, 1, 2, 3].map(i => `<label class="bind-slot"><span>${i + 1}</span>
        <select class="field" data-slot="${i}"><option value="">Libre</option>${ids.map(id =>
          `<option value="${id}" ${list[i] === id ? 'selected' : ''}>${G.Moves.BY_ID[id].name}</option>`).join('')}</select></label>`).join('')}</div>`;
    el.querySelectorAll('select[data-slot]').forEach(sel => {
      sel.onchange = () => {
        const l = (s.pbind[upgDex] || [null, null, null, null]).slice(0, 4);
        while (l.length < 4) l.push(null);
        const i = +sel.dataset.slot, id = sel.value || null;
        // Un movimiento sólo puede estar en un hueco.
        for (let j = 0; j < 4; j++) if (id && l[j] === id) l[j] = null;
        l[i] = id;
        s.pbind[upgDex] = l;
        G.DB.commit();
        G.Audio.sfx('select');
        renderUpgrades();
      };
    });
    return el;
  }

  // ---------------- veto: movimientos bloqueados ----------------
  // Lista por Pokémon en save.pban[dex]; con N niveles de Veto, N movimientos.
  let banOpen = false;
  function banList() {
    const s = G.DB.save;
    s.pban = s.pban || {};
    return s.pban[upgDex] || (s.pban[upgDex] = []);
  }
  function banPicker(max) {
    const mon = G.DEX_BY[upgDex];
    const start = G.startMoveOf(upgDex);
    const ids = G.Moves.poolFor(mon).filter(id => id !== start)
      .sort((a, b) => G.Moves.BY_ID[a].name.localeCompare(G.Moves.BY_ID[b].name, 'es'));
    const list = banList();
    const el = document.createElement('div');
    el.className = 'panel ban-picker';
    el.innerHTML = `<p class="sub" style="margin:0 0 8px">Toca los movimientos que no quieres que te salgan en las cartas (${list.length}/${max}). El movimiento de inicio no se puede vetar.</p>
      <div class="ban-moves">${ids.map(id => { const d = G.Moves.BY_ID[id]; const on = list.includes(id);
        return `<button class="chip ${on ? 'on ban' : ''}" data-id="${id}">${G.Icons.html('move:' + id, 16)} ${d.name}${on ? ' ' + G.Icons.html('ban', 14) : ''}</button>`; }).join('')}</div>`;
    el.querySelectorAll('[data-id]').forEach(b => {
      b.onclick = () => {
        const l = banList(), id = b.dataset.id, i = l.indexOf(id);
        if (i >= 0) l.splice(i, 1);
        else if (l.length >= max) { G.UI.toast('Ya tienes ' + max + ' vetados: quita uno primero'); return; }
        else l.push(id);
        G.DB.commit();
        G.Audio.sfx('select');
        renderUpgrades();
      };
    });
    return el;
  }

  return { init, open, openDexGift, GEN_NAMES };
})();
