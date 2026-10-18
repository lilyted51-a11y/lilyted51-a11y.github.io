/* ============ chat-ui.js — chat de la sala, de la partida y mensajes privados ============
 * Copia local.
 *  - Sala y partida en grupo: los mensajes van por la Realtime Database (rooms/{id}/chat);
 *    los ve todo el que está en la sala. En la partida, Enter abre la cajita (Esc la cierra).
 *  - Mensajes privados entre amigos: Firestore (dm/{pareja}/msgs). Botón 💬 en la lista
 *    de amigos; los no leídos se marcan en la lista y en el menú.
 */
G.ChatUI = (() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const IN_GAME = ['playing', 'held', 'levelup', 'choice'];
  const SHOW_FOR = 10000;   // ms que se ve un mensaje en la partida con la cajita cerrada
  let lastLobby = null, lastGame = '', gameOn = false, dmOpen = null, dmReady = false;
  const dmToasted = new Set();

  function colorOf(uid) {
    const room = G.Social.room;
    if (!room || !G.Coop || !G.Coop.COLORS) return '';
    const i = room.members.findIndex(m => m.uid === uid);
    return i >= 0 ? G.Coop.COLORS[i % G.Coop.COLORS.length] : '';
  }

  function line(m) {
    const mine = m.u === G.Social.uid;
    const c = colorOf(m.u);
    return `<div class="chat-msg${mine ? ' mine' : ''}" translate="no"><b${c ? ` style="color:${c}"` : ''}>${esc(m.n || '?')}</b><span>${esc(m.t)}</span></div>`;
  }

  // ---------------- sala ----------------

  function renderLobby() {
    const log = $('lobby-chat-log');
    if (!log || !G.UI.isOpen('scr-lobby')) return;
    const msgs = G.Social.chat || [];
    const key = msgs.length ? msgs[msgs.length - 1].id + ':' + msgs.length : '';
    if (key === lastLobby) return;
    lastLobby = key;
    // Si estabas leyendo mensajes antiguos (desplazado hacia arriba), no te baja al llegar uno nuevo.
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
    log.innerHTML = msgs.length ? msgs.slice(-80).map(line).join('') : '<p class="sub chat-empty">Aquí podéis hablar los de la sala.</p>';
    if (atBottom || !log.childElementCount) log.scrollTop = log.scrollHeight;
  }

  // ---------------- partida ----------------

  function inGame() { return !!(G.Coop && G.Coop.active && G.Game && IN_GAME.includes(G.Game.state)); }
  function inputOpen() { return !$('game-chat-form').classList.contains('hidden'); }

  function renderGame() {
    const box = $('game-chat'), log = $('game-chat-log');
    const on = inGame();
    if (on !== gameOn) { gameOn = on; box.classList.toggle('hidden', !on); if (!on) { closeInput(); lastGame = ''; log.innerHTML = ''; } }
    if (!on) return;
    const now = Date.now();
    const all = (G.Social.chat || []);
    const msgs = inputOpen() ? all.slice(-12) : all.slice(-6).filter(m => now - (m.seenAt || now) < SHOW_FOR);
    const key = msgs.map(m => m.id).join(',') + (inputOpen() ? '+' : '');
    if (key === lastGame) return;
    lastGame = key;
    log.innerHTML = msgs.map(line).join('');
    log.scrollTop = log.scrollHeight;
  }

  function openInput() {
    if (!inGame()) return;
    $('game-chat-form').classList.remove('hidden');
    const inp = $('game-chat-in');
    inp.value = '';
    setTimeout(() => inp.focus(), 0);
    renderGame();
  }
  function closeInput() {
    $('game-chat-form').classList.add('hidden');
    const inp = $('game-chat-in');
    if (document.activeElement === inp) inp.blur();
    renderGame();
  }
  function sendGame() {
    const inp = $('game-chat-in');
    const t = inp.value.trim();
    if (t) { G.Social.sendChat(t); G.Audio.sfx('select'); }
    closeInput();
  }

  // ---------------- mensajes privados ----------------

  function nameOf(uid) { const f = G.Social.friends.find(x => x.uid === uid); return f ? f.name : '?'; }

  function openDm(uid, name) {
    if (dmOpen) dmOpen.close();
    name = name || nameOf(uid);
    const el = document.createElement('section');
    el.className = 'scr dim'; el.style.zIndex = 70;
    el.innerHTML = `<div class="box" style="width:min(460px,100%)">
      <div class="row between"><h3 style="margin:0">💬 <span translate="no">${esc(name)}</span></h3><button class="btn small ghost" data-no>Cerrar</button></div>
      <div class="chat-log dm" data-log><p class="sub chat-empty">Cargando…</p></div>
      <form class="row chat-form" autocomplete="off" data-form><input class="field grow" maxlength="300" placeholder="Escribe un mensaje…" spellcheck="false" data-in><button class="btn small gold" type="submit">Enviar</button></form></div>`;
    document.body.appendChild(el);
    const log = el.querySelector('[data-log]'), inp = el.querySelector('[data-in]');
    let un = null;
    const close = () => { if (un) un(); un = null; el.remove(); if (dmOpen && dmOpen.uid === uid) dmOpen = null; G.Social.markDmSeen(uid); };
    dmOpen = { uid, close };
    el.querySelector('[data-no]').onclick = close;
    el.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    el.querySelector('[data-form]').onsubmit = async e => {
      e.preventDefault();
      const t = inp.value.trim();
      if (!t) return;
      inp.value = '';
      const r = await G.Social.sendDm(uid, t);
      if (!r.ok) G.UI.toast(r.error || 'No se pudo enviar', 2600); else G.Audio.sfx('select');
      inp.focus();
    };
    un = G.Social.watchDm(uid, msgs => {
      log.innerHTML = msgs.length ? msgs.map(m => `<div class="chat-msg${m.from === G.Social.uid ? ' mine' : ''}" translate="no"><b>${esc(m.from === G.Social.uid ? (G.Social.me ? G.Social.me.name : '') : name)}</b><span>${esc(m.t)}</span></div>`).join('')
        : '<p class="sub chat-empty">Todavía no hay mensajes. ¡Escribe el primero!</p>';
      log.scrollTop = log.scrollHeight;
      G.Social.markDmSeen(uid);
    });
    setTimeout(() => inp.focus(), 50);
  }

  /** Aviso cuando llega un mensaje privado nuevo (fuera de la partida y sin tener esa charla abierta). */
  function dmChanged() {
    if (!dmReady) { dmReady = true; for (const d of G.Social.dms) dmToasted.add(d.pid + ':' + d.last); return; }
    for (const d of G.Social.dms) {
      const k = d.pid + ':' + d.last;
      if (dmToasted.has(k)) continue;
      dmToasted.add(k);
      if (d.from === G.Social.uid || (dmOpen && dmOpen.uid === d.other)) continue;
      if (inGame()) continue;
      // Aviso propio (el toast normal es texto plano y lo traduciría el parche zh; aquí el nombre y el mensaje van tal cual)
      let el = document.getElementById('dm-toast');
      if (!el) { el = document.createElement('div'); el.id = 'dm-toast'; el.className = 'toast'; el.style.bottom = '64px'; document.body.appendChild(el); }
      el.innerHTML = '💬 <b translate="no">' + esc(nameOf(d.other)) + '</b>: <span translate="no">' + esc(d.t) + '</span>';
      el.style.display = 'block';
      clearTimeout(el._t); el._t = setTimeout(() => { el.style.display = 'none'; }, 3200);
      G.Audio.sfx('select');
    }
  }

  function init() {
    if (!$('game-chat')) return;
    // Sala
    $('lobby-chat-form').onsubmit = e => {
      e.preventDefault();
      const inp = $('lobby-chat-in'), t = inp.value.trim();
      if (!t) return;
      inp.value = '';
      G.Social.sendChat(t); G.Audio.sfx('select');
    };
    // Partida: Enter abre, Enter envía, Esc cierra; botón 💬 para el táctil.
    $('game-chat-form').onsubmit = e => { e.preventDefault(); sendGame(); };
    $('game-chat-in').addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeInput(); } });
    $('game-chat-btn').onclick = () => { if (inputOpen()) closeInput(); else openInput(); };
    addEventListener('keydown', e => {
      if (e.code !== 'Enter' && e.key !== 'Enter') return;
      if (!inGame() || inputOpen()) return;
      const a = document.activeElement;
      if (a && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(a.tagName)) return;
      e.preventDefault();
      openInput();
    });
    G.Social.on(what => {
      if (what === 'chat') {
        const c = G.Social.chat; const m = c[c.length - 1];
        if (m && !m.seenAt) m.seenAt = Date.now();
        renderLobby(); renderGame();
      } else if (what === 'dm') dmChanged();
      else if (what === 'room' || what === 'room-closed' || what === 'stop') { lastLobby = null; renderLobby(); }
    });
    setInterval(renderGame, 500);
  }

  return { init, renderLobby, openDm };
})();
