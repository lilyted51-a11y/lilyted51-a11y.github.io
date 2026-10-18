/* ============ social-ui.js — apodo, amigos, sala e invitaciones ============ */
(() => {
  const $ = G.UI.$;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** ¿Se puede usar lo online? Si no, explica por qué. */
  function needOnline() {
    if (G.DB.online) return true;
    G.UI.toast(G.DB.guest ? 'Crea una cuenta para jugar con amigos y salir en el ranking.'
      : 'Esto necesita la versión online del juego (con la nube).', 3200);
    return false;
  }

  // ======================= APODO =======================

  G.NickUI = (() => {
    let then = null, skipped = false;

    function init() {
      $('nick-form').onsubmit = async e => {
        e.preventDefault();
        $('nick-err').textContent = '';
        $('nick-ok').disabled = true;
        const r = await G.Social.claimNick($('nick-in').value);
        $('nick-ok').disabled = false;
        if (!r.ok) { $('nick-err').textContent = r.error; G.Audio.sfx('error'); return; }
        G.Audio.sfx('confirm');
        G.UI.toast('Tu apodo es ' + G.Social.me.name);
        const cb = then; then = null;
        if (cb) cb(); else G.MenuUI.open();
      };
      $('nick-later').onclick = () => { skipped = true; then = null; G.MenuUI.open(); };
    }

    /** @param next  qué abrir después de elegirlo */
    function open(next) {
      then = next || null;
      G.UI.show('scr-nick');
      $('nick-err').textContent = '';
      $('nick-in').value = '';
      setTimeout(() => $('nick-in').focus(), 50);
    }

    return { init, open, get skipped() { return skipped; } };
  })();

  /** Abre `fn` si tienes apodo; si no, pide el apodo primero. */
  function withNick(fn) {
    if (!needOnline()) return;
    if (G.Social.me) { fn(); return; }
    G.Social.start().then(r => { if (r === 'ok') fn(); else G.NickUI.open(fn); });
  }

  // ======================= AMIGOS =======================

  G.FriendsUI = (() => {
    function init() {
      $('fr-add').onsubmit = async e => {
        e.preventDefault();
        const name = $('fr-name').value;
        msg('');
        const r = await G.Social.request(name);
        msg(r.ok ? r.msg : r.error, !r.ok);
        if (r.ok) $('fr-name').value = '';
      };
      $('fr-room').onclick = () => G.LobbyUI.open();
      $('fr-create').onclick = () => createRoomDialog();
      $('fr-rooms-refresh').onclick = () => renderRooms(true);
      G.Social.on(() => { if (G.UI.isOpen('scr-friends')) render(); });
    }

    /** Pide algo en una cajita del juego: → Promise<string|null>. */
    function askText(title, opts = {}) {
      return new Promise(done => {
        const el = document.createElement('section');
        el.className = 'scr dim'; el.style.zIndex = 70;
        el.innerHTML = `<div class="box center" style="width:min(380px,100%)"><h3>${title}</h3>${opts.body || ''}
          <input id="ask-in" class="field" type="${opts.password ? 'password' : 'text'}" maxlength="32" autocomplete="off" style="text-align:center">
          <p class="err" id="ask-err"></p>
          <div class="row" style="justify-content:center;gap:8px"><button class="btn gold" data-ok>${opts.ok || 'Aceptar'}</button><button class="btn ghost" data-no>Cancelar</button></div></div>`;
        document.body.appendChild(el);
        const inp = el.querySelector('#ask-in');
        setTimeout(() => inp.focus(), 50);
        const end = v => { el.remove(); done(v); };
        el.querySelector('[data-ok]').onclick = () => end(inp.value);
        el.querySelector('[data-no]').onclick = () => end(null);
        inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); end(inp.value); } };
      });
    }

    /** Crear sala: aforo (4-10) y contraseña opcional, y a la sala. */
    function createRoomDialog() {
      if (G.Social.room) { G.LobbyUI.open(); return; }
      const el = document.createElement('section');
      el.className = 'scr dim'; el.style.zIndex = 70;
      el.innerHTML = `<div class="box center" style="width:min(400px,100%)"><h3>Crear sala</h3>
        <div class="row" style="justify-content:center;gap:10px;margin:8px 0"><label for="cr-max" style="margin:0">Jugadores</label>
          <select id="cr-max" class="field" style="width:auto">${[4,5,6,7,8,9,10].map(n => `<option value="${n}"${n === 8 ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
        <label for="cr-pass">Contraseña (opcional)</label>
        <input id="cr-pass" class="field" maxlength="32" autocomplete="off" placeholder="Sin contraseña: entra cualquiera" style="text-align:center">
        <div class="row" style="justify-content:center;gap:8px;margin-top:10px"><button class="btn gold" data-ok>Crear</button><button class="btn ghost" data-no>Cancelar</button></div></div>`;
      document.body.appendChild(el);
      el.querySelector('[data-no]').onclick = () => el.remove();
      el.querySelector('[data-ok]').onclick = async () => {
        const max = +el.querySelector('#cr-max').value, pass = el.querySelector('#cr-pass').value.trim();
        el.querySelector('[data-ok]').disabled = true;
        try { await G.Social.createRoom({ max, pass }); el.remove(); G.LobbyUI.open(); }
        catch (e) { el.remove(); G.UI.toast('No se pudo crear la sala'); }
      };
    }

    /** Lista de salas abiertas (se lee al abrir Amigos y con "Actualizar"). */
    let roomsBusy = false;
    async function renderRooms(force) {
      const box = $('fr-rooms');
      if (!box || roomsBusy) return;
      roomsBusy = true;
      if (force || !box.children.length) box.innerHTML = '<p class="sub" style="margin:0">Buscando salas…</p>';
      const rooms = await G.Social.listRooms();
      roomsBusy = false;
      if (!G.UI.isOpen('scr-friends')) return;
      box.innerHTML = '';
      const mine = G.Social.room;
      if (!rooms.length) { box.innerHTML = '<p class="sub" style="margin:0">No hay salas abiertas ahora mismo. Crea una con «Crear sala».</p>'; return; }
      for (const r of rooms) {
        const el = document.createElement('div');
        el.className = 'fr-row';
        el.innerHTML = `<i class="dot on"></i><b translate="no">${esc(r.name || '?')}</b><span class="st">${r.n || 1}/${r.max || 8}${r.lock ? ' · 🔒' : ''}</span><span class="grow"></span>`;
        const b = document.createElement('button');
        b.className = 'btn small gold'; b.textContent = mine && mine.id === r.id ? 'Ir a la sala' : 'Entrar';
        b.onclick = async () => {
          if (mine && mine.id === r.id) { G.LobbyUI.open(); return; }
          let res = await G.Social.joinRoom(r.id, '', false);
          if (!res.ok && res.locked) {
            const pass = await askText('Sala de ' + (r.name || '?'), { body: '<p class="sub">Esta sala tiene contraseña.</p>', password: true, ok: 'Entrar' });
            if (pass == null) return;
            res = await G.Social.joinRoom(r.id, pass, false);
          }
          if (res.ok) G.LobbyUI.open(); else { msg(res.error, true); renderRooms(true); }
        };
        el.appendChild(b);
        box.appendChild(el);
      }
    }

    function msg(t, bad) {
      $('fr-msg').textContent = t || '';
      $('fr-msg').style.color = bad ? '#ffb0b8' : '';
      if (t) G.Audio.sfx(bad ? 'error' : 'confirm');
    }

    function open() { withNick(() => { G.UI.show('scr-friends', true); msg(''); render(); renderRooms(true); G.Social.refreshPresence(); }); }

    /** "hace 5 min", "hace 2 h", "hace 3 días". */
    function ago(t) {
      const m = Math.max(1, Math.round((G.Social.now() - t) / 60000));
      if (m < 60) return 'hace ' + m + ' min';
      const h = Math.round(m / 60);
      if (h < 48) return 'hace ' + h + ' h';
      return 'hace ' + Math.round(h / 24) + ' días';
    }

    function stateText(f) {
      if (f.status === 'in') return 'Quiere ser tu amigo';
      if (f.status === 'out') return 'Solicitud enviada';
      if (!f.online) return f.seen ? 'Visto ' + ago(f.seen) : 'Desconectado';
      return f.play ? 'Jugando' : 'En línea';
    }

    function render() {
      const room = G.Social.room;
      $('fr-me').innerHTML = 'Tu apodo: <b class="gold" translate="no">' + esc(G.Social.me ? G.Social.me.name : '') + '</b> · dáselo a tus amigos para que te añadan.';
      $('fr-room').classList.toggle('hidden', !room);
      const list = G.Social.friends.sort((a, b) => {
        const rank = f => f.status === 'in' ? 0 : f.status === 'ok' ? (f.online ? (f.play ? 2 : 1) : 3) : 4;
        return rank(a) - rank(b) || a.name.localeCompare(b.name);
      });
      const box = $('fr-list');
      box.innerHTML = '';
      if (!list.length) {
        box.innerHTML = '<p class="sub">Aún no tienes amigos añadidos. Escribe arriba el apodo de un amigo.</p>';
        return;
      }
      for (const f of list) {
        const el = document.createElement('div');
        el.className = 'fr-row';
        const dot = f.status !== 'ok' ? 'pend' : !f.online ? 'off' : f.play ? 'play' : 'on';
        const inRoom = room && room.members.some(m => m.uid === f.uid);
        el.innerHTML = `<i class="dot ${dot}"></i><b translate="no"><a href="#" class="plink" title="Ver su perfil">${esc(f.name)}</a></b><span class="st">${inRoom ? 'En tu sala' : stateText(f)}</span><span class="grow"></span>`;
        if (f.status === 'ok') el.querySelector('.plink').onclick = e => { e.preventDefault(); G.ProfileUI.show(f.uid); };
        else el.querySelector('.plink').onclick = e => e.preventDefault();
        const btn = (txt, cls, fn) => {
          const b = document.createElement('button');
          b.className = 'btn small ' + cls; b.textContent = txt; b.onclick = fn; el.appendChild(b); return b;
        };
        if (f.status === 'in') {
          btn('Aceptar', 'gold', async () => { const r = await G.Social.accept(f.uid); msg(r.ok ? r.msg : r.error, !r.ok); });
          btn('Rechazar', 'ghost', () => G.Social.remove(f.uid));
        } else if (f.status === 'out') {
          btn('Cancelar', 'ghost', () => G.Social.remove(f.uid));
        } else {
          // Copia local: mensajes privados (con marca si hay alguno sin leer)
          const un = G.Social.dmUnread && G.Social.dmUnread(f.uid);
          const cb = btn(un ? '💬 ●' : '💬', un ? 'gold' : 'ghost', () => G.ChatUI.openDm(f.uid, f.name));
          cb.title = un ? 'Mensaje nuevo' : 'Enviar mensaje';
          if (f.online && !f.play && !inRoom && (!room || room.isHost)) {
            btn('Invitar', 'gold', async () => {
              const r = await G.Social.invite(f.uid);
              msg(r.ok ? r.msg : r.error, !r.ok);
              if (r.ok) G.LobbyUI.open();
            });
          }
          btn('Quitar', 'ghost', () => { if (confirm('¿Quitar a ' + f.name + ' de tus amigos?')) G.Social.remove(f.uid); });
        }
        box.appendChild(el);
      }
    }

    return { init, open, render };
  })();

  // ======================= SALA =======================

  G.LobbyUI = (() => {
    let membersKey = '';

    function init() {
      $('lobby-leave').onclick = async () => {
        await G.Social.leaveRoom();
        G.Net.close();
        G.MenuUI.open();
      };
      $('lobby-menu').onclick = () => G.MenuUI.open();
      $('lobby-start').onclick = start;
      // Listo / cancelar (botón o tecla R) — sólo invitados.
      const toggleReady = () => { const r = G.Social.room; if (!r || r.isHost) return; G.Social.setReady(!G.Social.ready); G.Audio.sfx('select'); render(); };
      $('lobby-ready').onclick = toggleReady;
      addEventListener('keydown', e => {
        if (!G.UI.isOpen('scr-lobby') || e.repeat) return;
        const tag = document.activeElement && document.activeElement.tagName;
        if (e.code === 'KeyR' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') toggleReady();
      });
      $('lobby-start').dataset.sfx = 'confirm';
      // Conecta / desconecta la red al entrar o salir de una sala.
      G.Social.on(what => {
        const room = G.Social.room;
        if (room) {
          G.Net.open(room.id, room.isHost, room.host);
          G.Net.syncMembers(room.members.map(m => m.uid));
        } else if (G.Net.open_) G.Net.close();
        if (what === 'room-closed') {
          G.UI.toast('La sala se ha cerrado', 2600);
          if (G.UI.isOpen('scr-lobby')) G.MenuUI.open();
        }
        if (G.UI.isOpen('scr-lobby')) render();
      });
      G.Net.onPeer(() => { if (G.UI.isOpen('scr-lobby')) render(); });
    }

    function open() {
      if (!G.Social.room) { G.MenuUI.open(); return; }
      G.Social.refreshMember();
      G.Social.refreshPresence();
      G.UI.show('scr-lobby', true);
      membersKey = '';
      render();
      if (G.ChatUI) G.ChatUI.renderLobby();
    }

    function close() { G.UI.hide('scr-lobby'); }

    function connText(m, room) {
      if (m.uid === room.host) return 'Anfitrión';
      if (m.lob === false) return 'Preparando (eligiendo Pokémon o mejoras)…';
      if (m.rdy) return m.uid === G.Social.uid ? 'Listo' : 'Listo ✓';
      if (!room.isHost) return m.uid === G.Social.uid ? 'Sin preparar (pulsa Listo)' : 'Sin preparar';
      const mode = G.Net.mode(m.uid);
      return mode === 'direct' ? 'Conectado · sin preparar' : mode === 'relay' ? 'Conectado (por servidor) · sin preparar' : mode === 'failed' ? 'No se pudo conectar (reintentando…)' : 'Conectando…';
    }

    function render() {
      const room = G.Social.room;
      if (!room) return;
      const ms = room.members;
      const MAXR = room.max || 8;
      $('lobby-sub').textContent = room.isHost
        ? 'Eres el anfitrión. Invita a tus amigos (hasta ' + MAXR + ') y empezad cuando estéis.'
        : 'Estás en la sala de ' + ((ms.find(m => m.uid === room.host) || {}).name || '…') + '. El anfitrión empezará la partida.';
      // Aforo: el anfitrión lo cambia; los demás lo ven. Candado si tiene contraseña.
      const sel = $('lobby-max');
      if (sel) {
        if (!sel.options.length) { sel.innerHTML = [4,5,6,7,8,9,10].map(n => `<option value="${n}">${n}</option>`).join(''); sel.onchange = () => G.Social.setMax(+sel.value); }
        sel.value = MAXR; sel.disabled = !room.isHost;
        $('lobby-lock').textContent = room.locked ? '🔒 Con contraseña' : 'Sin contraseña: entra cualquiera desde Amigos › Salas abiertas';
      }

      // Las tarjetas sólo se rehacen si cambian los miembros (los sprites no parpadean).
      const key = MAXR + '#' + ms.map(m => m.uid + ':' + m.dex + ':' + (m.shiny ? 1 : 0) + ':' + (m.lob === false ? 0 : 1) + ':' + (m.rdy ? 1 : 0)).join('|');
      const box = $('lobby-members');
      // Filas: 4 jugadores en una; de 5 a 10, dos filas (la mitad arriba, redondeando: 5→3+2, 7→4+3, 9→5+4).
      box.style.setProperty('--cols', MAXR <= 4 ? MAXR : Math.ceil(MAXR / 2));
      if (key !== membersKey) {
        membersKey = key;
        box.innerHTML = '';
        for (let i = 0; i < MAXR; i++) {
          const m = ms[i];
          const c = document.createElement('div');
          c.className = 'lob-card' + (m ? '' : ' empty');
          if (m) {
            c.style.setProperty('--pc', G.Coop.COLORS[i]);
            c.appendChild(G.UI.spriteCanvas(m.dex, 120, 96, { scale: 2, lively: true, shiny: !!m.shiny }));
            c.insertAdjacentHTML('beforeend', `<b translate="no">${esc(m.name)}</b><small>${esc((G.DEX_BY[m.dex] || {}).name || '')}</small><span class="conn" data-u="${m.uid}"></span>`);
          } else c.innerHTML = '<span>Libre</span>';
          box.appendChild(c);
        }
      }
      box.querySelectorAll('.conn').forEach(el => {
        const m = ms.find(x => x.uid === el.dataset.u);
        if (!m) return;
        const t = connText(m, room);
        el.textContent = t;
        el.className = 'conn' + (t === 'Conectando…' ? ' wait' : '');
      });

      // Invitar (sólo el anfitrión y si queda sitio).
      const canInvite = room.isHost && ms.length < MAXR;
      $('lobby-inv-title').classList.toggle('hidden', !canInvite);
      const inv = $('lobby-invite');
      inv.classList.toggle('hidden', !canInvite);
      if (canInvite) {
        inv.innerHTML = '';
        const free = G.Social.friends.filter(f => f.status === 'ok' && f.online && !ms.some(m => m.uid === f.uid));
        if (!free.length) inv.innerHTML = '<p class="sub" style="margin:0">Ningún amigo en línea ahora mismo.</p>';
        for (const f of free) {
          const el = document.createElement('div');
          el.className = 'fr-row';
          el.innerHTML = `<i class="dot ${f.play ? 'play' : 'on'}"></i><b translate="no">${esc(f.name)}</b><span class="st">${f.play ? 'Jugando' : 'En línea'}</span><span class="grow"></span>`;
          const b = document.createElement('button');
          b.className = 'btn small gold'; b.textContent = 'Invitar';
          b.onclick = async () => { const r = await G.Social.invite(f.uid); G.UI.toast(r.ok ? r.msg : r.error); };
          el.appendChild(b);
          inv.appendChild(el);
        }
      }

      const btn = $('lobby-start');
      btn.classList.toggle('hidden', !room.isHost);
      const connecting = ms.some(m => m.uid !== room.host && G.Net.mode(m.uid) === 'connecting');
      const failed = ms.some(m => m.uid !== room.host && G.Net.mode(m.uid) === 'failed');
      const away = ms.filter(m => m.uid !== room.host && m.lob === false).map(m => m.name);
      const notReady = ms.filter(m => m.uid !== room.host && m.lob !== false && !m.rdy).map(m => m.name);
      btn.disabled = !room.isHost || ms.length < 2 || connecting || failed || away.length > 0 || notReady.length > 0;
      btn.textContent = 'Empezar partida (' + ms.length + '/' + MAXR + ')';
      const rb = $('lobby-ready');
      rb.classList.toggle('hidden', room.isHost);
      rb.textContent = G.Social.ready ? 'Cancelar (R)' : 'Listo (R)';
      rb.classList.toggle('gold', !G.Social.ready);
      $('lobby-note').textContent = !room.isHost ? (G.Social.ready ? 'Listo. Cuando el anfitrión empiece, entraréis todos a la vez.' : 'Pulsa «Listo» (o la tecla R) cuando estés preparado.')
        : ms.length < 2 ? 'Necesitas al menos un amigo en la sala.'
        : away.length ? 'Esperando a que ' + away.join(', ') + ' vuelva a la sala.'
        : notReady.length ? 'Esperando a que estén listos: ' + notReady.join(', ') + '.'
        : failed ? 'No se puede conectar con algún amigo: su red (o la tuya) no deja jugar en grupo. Probad con otra wifi o datos móviles; se reintenta solo.'
        : connecting ? 'Conectando con tus amigos…' : 'La partida empieza para todos a la vez.';
    }

    async function start() {
      const room = G.Social.room;
      if (!room || !room.isHost || room.members.length < 2) return;
      G.Social.refreshMember();
      await G.Social.freshMembers();          // el Pokémon actual de cada uno
      const cfg = {
        k: 'start', seed: Math.floor(Math.random() * 1e6), host: room.host,
        members: room.members.map(m => ({ uid: m.uid, name: m.name, dex: m.dex, shiny: !!m.shiny }))
      };
      G.Social.setOpen(false);
      G.Net.broadcast(cfg);
      G.Flow.startCoop(cfg);
    }

    return { init, open, close, render };
  })();

  // ======================= INVITACIONES =======================

  G.InvitePop = (() => {
    let cur = null;

    function init() {
      $('inv-yes').onclick = async () => {
        if (!cur) return;
        const from = cur.from;
        hide();
        const r = await G.Social.acceptInvite(from);
        if (!r.ok) { G.UI.toast(r.error, 3000); return; }
        G.LobbyUI.open();
      };
      $('inv-no').onclick = () => { if (cur) G.Social.declineInvite(cur.from); hide(); };
      G.Social.on(what => { if (what === 'invites' || what === 'room') refresh(); });
    }

    function hide() { cur = null; $('invite-pop').classList.add('hidden'); }

    /** Enseña la invitación más antigua si estás en los menús (no en plena partida). */
    function refresh() {
      const room = G.Social.room;
      const list = G.Social.invites.filter(i => !room || i.room !== room.id).sort((a, b) => a.at - b.at);
      if (!list.length || G.Game.state !== 'ui' || !G.DB.loggedIn) { hide(); return; }
      if (cur && cur.from === list[0].from) return;
      cur = list[0];
      $('inv-text').innerHTML = `${G.Icons.html('friends', 22)} <b class="gold" translate="no">${esc(cur.name)}</b> te invita a jugar en su sala`;
      $('invite-pop').classList.remove('hidden');
      G.Audio.sfx('shiny');
    }

    return { init, refresh };
  })();

  G.SocialUI = {
    init() { G.NickUI.init(); G.FriendsUI.init(); G.LobbyUI.init(); G.InvitePop.init(); G.ChatUI.init(); },   // copia local: + chat
    withNick, needOnline
  };
})();
