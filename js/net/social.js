/* ============ social.js — apodo, amigos, en línea, invitaciones y salas ============
 * Sólo funciona con cuenta en la nube (G.DB.online). Usa:
 *
 *   Firestore
 *     names/{apodo en minúsculas}  { uid }               apodos únicos
 *     profiles/{uid}               { name, lower, at }   apodo público
 *     friendships/{uidA_uidB}      { users, from, to, status: 'pending'|'ok', names, at }
 *
 *     pres/{uid}                   { on, at, room, play } en línea (aproximado)
 *     inv/{para_de}                { to, from, room, name, at } invitaciones
 *
 *   Realtime Database: SÓLO mientras estás en una sala o partida en grupo
 *     rooms/{id}          { host, open, at, m: { uid: { name, dex, shiny } }, q: ... }
 *                         la sala; q/ son los mensajes de net.js
 *
 * Por qué así: el plan gratuito de Firebase sólo admite 100 conexiones a la
 * vez a la Realtime Database. Si todo el mundo estuviera conectado para el
 * "en línea", ése sería el máximo de jugadores. Ahora sólo cuentan los que
 * están en una sala; el "en línea" va por Firestore con un latido cada 10 min
 * y se lee sólo al abrir Amigos o la sala (lo leído vale 1 min).
 *
 * El resto del juego escucha los cambios con G.Social.on(fn).
 */
G.Social = (() => {
  const VALID = /^[A-Za-z0-9_ñÑáéíóúÁÉÍÓÚ]{3,16}$/;
  const MAX_PLAYERS = 10;  // tope duro; cada sala elige entre 4 y 10 (copia local; original 4)
  const DEFAULT_MAX = 8;
  const INVITE_TTL = 3 * 60 * 1000;
  /*
   * Hora real: la del servidor de la web (cabecera Date de version.json, gratis).
   * Si el reloj del aparato va adelantado (p. ej. la zona horaria mal puesta),
   * todas las invitaciones parecían caducadas y se borraban sin enseñarse, y
   * los amigos salían siempre desconectados (pasaba en 2026-10).
   */
  let skew = 0;
  const now = () => Date.now() + skew;
  function measureSkew() {
    const t0 = Date.now();
    fetch('version.json?t=' + t0, { method: 'HEAD', cache: 'no-store' }).then(r => {
      const d = Date.parse(r.headers.get('date') || '');
      if (!d) return;
      const s = d + 500 - (t0 + Date.now()) / 2;          // (la cabecera va en segundos)
      skew = Math.abs(s) > 60000 ? s : 0;
      if (skew) console.warn('[Social] el reloj de este aparato va desfasado', Math.round(skew / 60000), 'min: se corrige');
    }).catch(() => {});
  }
  // Latido de presencia: cada 30 min (era 15; antes 10). 57.000 jugadores con
  // amigos lo escribían 4 veces por hora (13-10-2026, menos gasto de Firestore).
  const BEAT = 30 * 60 * 1000;
  const ONLINE = 40 * 60 * 1000;        // "en línea" si el último latido es más reciente
  const PRES_TTL = 60 * 1000;           // lo leído de los amigos vale 1 min

  let fb = null, uid = null;
  let me = null;                    // { uid, name }
  let friends = new Map();          // otherUid -> { uid, name, pid, status: 'ok'|'in'|'out', online, play }
  let unFriends = null;
  let beatT = 0, presAt = 0, unInv = null;
  const pres = new Map();           // otherUid -> { online, play, room, seen } (lo último leído)
  const sentInv = new Set();        // a quién invitaste (para retirarlo al salir)
  let room = null;                  // { id, host, isHost, members: [{ uid, name, dex, shiny }] }
  const chat = [];                  // copia local: mensajes de la sala (rooms/{id}/chat)
  const dms = new Map();            // copia local: últimas charlas privadas (dm/{pareja}) pid -> { pid, other, from, t, last }
  let unDm = null, dmSeen = {};
  let roomRefs = [];
  const invites = new Map();        // fromUid -> { from, name, room, at }
  const listeners = new Set();
  let started = false;

  function emit(what) { listeners.forEach(fn => { try { fn(what); } catch (e) { console.warn(e); } }); }
  const ts = () => firebase.database.ServerValue.TIMESTAMP;
  const fts = () => firebase.firestore.FieldValue.serverTimestamp();
  const msOf = v => (v && v.toMillis ? v.toMillis() : +v || 0);
  const pidOf = (a, b) => (a < b ? a + '_' + b : b + '_' + a);

  // ---------------- arranque ----------------

  /** Tras iniciar sesión. → 'ok' | 'need-nick' | 'off' (sin nube) */
  async function start() {
    if (!G.DB.online) return 'off';
    if (started) return me ? 'ok' : 'need-nick';
    fb = G.DB.fb; uid = fb.uid;
    started = true;
    measureSkew();
    // El apodo no cambia nunca: se recuerda en este navegador y así no se lee
    // el perfil en cada visita (una lectura menos por jugador y sesión).
    const NICK = 'ps.nick.' + uid;
    let cachedNick = null;
    try { cachedNick = localStorage.getItem(NICK); } catch (e) { /* nada */ }
    const prof = cachedNick ? { name: cachedNick }
      : await fb.fs.collection('profiles').doc(uid).get().then(s => s.exists ? s.data() : null).catch(() => null);
    if (prof) {
      me = { uid, name: prof.name };
      if (G.DB.user !== prof.name) G.DB.setName(prof.name);
      try { localStorage.setItem(NICK, prof.name); } catch (e) { /* nada */ }
    }
    else if (G.DB.nameAccount) {
      // Cuentas de nombre y contraseña: su nombre ya es único, se usa de apodo.
      const r = await claimNick(G.DB.save.name);
      if (!r.ok) return 'need-nick';
    } else return 'need-nick';
    online();
    autoFriend();
    return 'ok';
  }

  /**
   * Copia local: todo el que entra es amigo del administrador (G.Boost.UIDS)
   * automáticamente, sin solicitud (las reglas lo permiten sólo hacia él).
   * Una comprobación por cuenta y navegador (ps.af.<uid>).
   */
  async function autoFriend() {
    if (!me || !G.Boost || G.Boost.admin) return;
    const K = 'ps.af.' + uid;
    try { if (localStorage.getItem(K)) return; } catch (e) { /* nada */ }
    for (const admin of G.Boost.UIDS) {
      const users = [uid, admin].sort(), pid = users[0] + '_' + users[1];
      try {
        const ref = fb.fs.collection('friendships').doc(pid);
        const cur = await ref.get();
        if (cur.exists) continue;
        const prof = await fb.fs.collection('profiles').doc(admin).get();
        if (!prof.exists) continue;
        await ref.set({
          users, from: uid, to: admin, status: 'ok',
          names: { [uid]: me.name, [admin]: prof.data().name },
          at: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) { console.warn('[Social] amistad automática:', e.message); return; }
    }
    try { localStorage.setItem(K, '1'); } catch (e) { /* nada */ }
  }

  /** Reserva un apodo único y crea el perfil público. */
  async function claimNick(name) {
    name = (name || '').trim();
    if (!VALID.test(name)) return { ok: false, error: 'El apodo debe tener 3-16 letras, números o _.' };
    const lower = name.toLowerCase();
    try {
      await fb.fs.runTransaction(async tx => {
        const nref = fb.fs.collection('names').doc(lower);
        const n = await tx.get(nref);
        if (n.exists && n.data().uid !== uid) throw { code: 'taken' };
        if (!n.exists) tx.set(nref, { uid });
        tx.set(fb.fs.collection('profiles').doc(uid),
          { name, lower, at: firebase.firestore.FieldValue.serverTimestamp() });
      });
    } catch (e) {
      if (e && e.code === 'taken') return { ok: false, error: 'Ese apodo ya lo tiene otro jugador.' };
      return { ok: false, error: 'No se pudo guardar el apodo (' + ((e && e.code) || 'error') + ').' };
    }
    me = { uid, name };
    try { localStorage.setItem('ps.nick.' + uid, name); } catch (e) { /* nada */ }
    G.DB.setName(name);
    if (started && !beatT) online();
    publishProfile(true);
    return { ok: true };
  }

  /** Presencia (latido), amigos e invitaciones. Nada de esto usa la Realtime Database. */
  function online() {
    if (beatT) return;                        // ya estaba en marcha
    if (fb.rtdb) fb.rtdb.goOffline();         // se conecta sólo al entrar en una sala
    writeStatus();
    clearInterval(beatT);
    beatT = setInterval(() => { if (document.visibilityState === 'visible') writeStatus(); }, BEAT);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pagehide', onHide);
    listenFriends();
    loadDmSeen();
    listenDms();
  }

  /** Invitaciones a salas: sólo te pueden llegar de amigos, así que sin amigos no se escucha (lecturas). */
  function listenInvites() {
    if (unInv || !fb) return;
    unInv = fb.fs.collection('inv').where('to', '==', uid).onSnapshot(snap => {
      snap.docChanges().forEach(ch => {
        const v = ch.doc.data();
        if (ch.type === 'removed') { invites.delete(v.from); emit('invites'); return; }
        onInvite(ch.doc.ref, v);
      });
    }, e => console.warn('[Social] invitaciones:', e.code || e.message));
  }

  let playing = false, lastBeat = 0;
  /** ¿Hay alguien que pueda leer tu "en línea"? (sólo los amigos confirmados) */
  const hasFriends = () => [...friends.values()].some(f => f.status === 'ok');
  function writeStatus(on = true) {
    // Sin amigos nadie lo lee: no se gasta una escritura (cupo diario de Firebase).
    if (!fb || !me || !hasFriends()) return;
    lastBeat = Date.now();
    fb.fs.collection('pres').doc(uid).set({ on, at: fts(), room: room ? room.id : '', play: playing }).catch(() => {});
  }
  function setPlaying(p) { if (playing !== !!p) { playing = !!p; writeStatus(); } }
  // Al volver a la pestaña tras un rato, un latido; al cerrarla, "desconectado".
  function onVisible() { if (document.visibilityState === 'visible' && Date.now() - lastBeat > BEAT) writeStatus(); }
  function onHide() { writeStatus(false); }

  async function stop(why) {
    if (!started) return;
    await leaveRoom().catch(() => {});
    if (unFriends) { unFriends(); unFriends = null; }
    if (unInv) { unInv(); unInv = null; }
    if (unDm) { unDm(); unDm = null; }
    dms.clear(); dmSeen = {};
    clearInterval(beatT); beatT = 0;
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('pagehide', onHide);
    if (me) await fb.fs.collection('pres').doc(uid).delete().catch(() => {});
    if (why === 'delete') {
      try { localStorage.removeItem('ps.nick.' + uid); } catch (e) { /* nada */ }
      await deleteAll().catch(e => console.warn('[Social] borrar:', e));
    }
    friends.clear(); invites.clear(); sentInv.clear(); pres.clear(); presAt = 0;
    me = null; started = false; fb = null; uid = null; playing = false;
    emit('stop');
  }

  /** Al borrar la cuenta: amistades, marcas del ranking, perfil y apodo. */
  async function deleteAll() {
    // Cada paso por separado: si uno falla, los demás se borran igual.
    const step = async (what, fn) => { try { await fn(); } catch (e) { console.warn('[Social] no se pudo borrar ' + what + ':', e.code || e.message); } };
    const del = async q => { const s = await q.get(); await Promise.all(s.docs.map(d => d.ref.delete().catch(() => {}))); };
    await step('amistades', () => del(fb.fs.collection('friendships').where('users', 'array-contains', uid)));
    await step('filas del ranking', () => G.Ranking.removeMine());
    await step('invitaciones', () => del(fb.fs.collection('inv').where('to', '==', uid)));
    await step('marcas', () => del(fb.fs.collectionGroup('e').where('uids', 'array-contains', uid)));
    await step('partida en curso', () => fb.fs.collection('runs').doc(uid).delete());
    await step('apodo', async () => {
      const prof = await fb.fs.collection('profiles').doc(uid).get();
      const lower = prof.exists ? prof.data().lower : me && me.name.toLowerCase();
      if (lower) await fb.fs.collection('names').doc(lower).delete().catch(() => {});
      if (prof.exists) await fb.fs.collection('profiles').doc(uid).delete();
    });
  }

  // ---------------- amigos ----------------

  function listenFriends() {
    unFriends = fb.fs.collection('friendships').where('users', 'array-contains', uid).onSnapshot(snap => {
      const next = new Map();
      snap.forEach(d => {
        const f = d.data();
        const other = f.users[0] === uid ? f.users[1] : f.users[0];
        next.set(other, Object.assign({
          uid: other, pid: d.id, name: (f.names && f.names[other]) || '???',
          status: f.status === 'ok' ? 'ok' : f.to === uid ? 'in' : 'out',
          online: false, play: false, room: '', seen: 0
        }, pres.get(other) || {}));
      });
      // Un amigo nuevo (o recién aceptado): se mira si está en línea.
      const added = [...next.values()].some(f => f.status === 'ok' && (!friends.has(f.uid) || friends.get(f.uid).status !== 'ok'));
      const hadFriends = hasFriends();
      friends = next;
      emit('friends');
      // Tu primer amigo: ahora sí hay quien lea tu "en línea" y quien te invite.
      if (!hadFriends && hasFriends()) writeStatus();
      if (hasFriends()) listenInvites();
      // Se mira si está en línea un momento después: tu amigo también acaba de
      // recibir la amistad y está apuntando su "en línea" a la vez.
      if (added) setTimeout(() => { if (started) refreshPresence(true); }, 2500);
    }, e => console.warn('[Social] amigos:', e.code || e.message));
  }

  /**
   * Lee el "en línea" de tus amigos (1 lectura por amigo). Sólo se llama al
   * abrir Amigos o la sala, y lo leído vale 1 min.
   */
  async function refreshPresence(force = false) {
    if (!fb || (!force && Date.now() - presAt < PRES_TTL)) return;
    presAt = Date.now();
    const ok = [...friends.values()].filter(f => f.status === 'ok');
    const docs = await Promise.all(ok.map(f => fb.fs.collection('pres').doc(f.uid).get().catch(() => null)));
    const t = now();
    ok.forEach((f, i) => {
      const v = docs[i] && docs[i].exists ? docs[i].data() : null;
      const on = !!(v && v.on && t - msOf(v.at) < ONLINE);
      const p = { online: on, play: !!(on && v.play), room: on ? v.room : '', seen: v ? msOf(v.at) : 0 };
      pres.set(f.uid, p);
      // La lista de amigos puede haberse renovado mientras se leía: se aplica a la actual.
      const cur = friends.get(f.uid);
      if (cur) Object.assign(cur, p);
    });
    emit('presence');
  }

  /** Envía una solicitud de amistad (o acepta la que ya te había mandado). */
  async function request(name) {
    name = (name || '').trim();
    if (!me) return { ok: false, error: 'Primero elige tu apodo.' };
    if (!VALID.test(name)) return { ok: false, error: 'Escribe el apodo exacto de tu amigo.' };
    const n = await fb.fs.collection('names').doc(name.toLowerCase()).get().catch(() => null);
    if (!n || !n.exists) return { ok: false, error: 'No hay ningún jugador con ese apodo.' };
    const other = n.data().uid;
    if (other === uid) return { ok: false, error: 'Ese eres tú.' };
    const f = friends.get(other);
    if (f && f.status === 'ok') return { ok: false, error: 'Ya sois amigos.' };
    if (f && f.status === 'out') return { ok: false, error: 'Ya le enviaste una solicitud.' };
    if (f && f.status === 'in') return accept(other);
    const prof = await fb.fs.collection('profiles').doc(other).get().catch(() => null);
    const otherName = prof && prof.exists ? prof.data().name : name;
    const users = [uid, other].sort();
    try {
      await fb.fs.collection('friendships').doc(users[0] + '_' + users[1]).set({
        users, from: uid, to: other, status: 'pending',
        names: { [uid]: me.name, [other]: otherName },
        at: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { ok: true, msg: 'Solicitud enviada a ' + otherName };
    } catch (e) { return { ok: false, error: 'No se pudo enviar (' + (e.code || 'error') + ').' }; }
  }

  async function accept(other) {
    const f = friends.get(other);
    if (!f || f.status !== 'in') return { ok: false, error: 'No hay solicitud.' };
    try {
      await fb.fs.collection('friendships').doc(f.pid).update({
        status: 'ok', at: firebase.firestore.FieldValue.serverTimestamp(), ['names.' + uid]: me.name
      });
      return { ok: true, msg: 'Ahora eres amigo de ' + f.name };
    } catch (e) { return { ok: false, error: 'No se pudo aceptar (' + (e.code || 'error') + ').' }; }
  }

  async function remove(other) {
    const f = friends.get(other);
    if (!f) return { ok: false };
    try { await fb.fs.collection('friendships').doc(f.pid).delete(); return { ok: true }; }
    catch (e) { return { ok: false, error: 'No se pudo borrar (' + (e.code || 'error') + ').' }; }
  }

  // ---------------- salas ----------------

  function memberInfo() {
    const s = G.DB.save;
    return { name: me.name, dex: s.partner, shiny: !!s.partnerShiny && G.DB.ownsShiny(s.partner), at: ts(), lob: true, rdy: false };
  }

  /** Copia local: "listo" en la sala (el anfitrión sólo empieza cuando todos lo están). */
  let rdyOn = false;
  function setReady(on) {
    on = !!on;
    if (!room || !me) return;
    rdyOn = on;
    fb.rtdb.ref('rooms/' + room.id + '/m/' + uid + '/rdy').set(on).catch(() => {});
  }

  /** Copia local: ¿estás viendo la pantalla de la sala? (el anfitrión no empieza hasta que todos estén). */
  let lobOn = null;
  function setInLobby(on) {
    on = !!on;
    if (!room || !me || lobOn === on) return;
    lobOn = on;
    fb.rtdb.ref('rooms/' + room.id + '/m/' + uid + '/lob').set(on).catch(() => {});
  }

  /**
   * La Realtime Database sólo se conecta mientras estás en una sala: cada
   * conexión abierta gasta descargas (se pagan a partir de 360 MB al día).
   * (El 11-10-2026 hubo un contador de gente en línea que la tenía siempre
   * conectada; se quitó por eso.)
   */
  function rtOn() { if (fb.rtdb) fb.rtdb.goOnline(); }
  function rtOff() { if (fb && fb.rtdb && !room) fb.rtdb.goOffline(); }

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const clampMax = n => Math.max(4, Math.min(MAX_PLAYERS, Math.floor(+n) || DEFAULT_MAX));

  /**
   * Copia local: la sala se crea directamente (sin invitar), con aforo (4-10) y
   * contraseña opcional. Además se anuncia en lobby/{id} para la lista de salas.
   * @param opts  { max, pass }
   */
  async function createRoom(opts = {}) {
    if (room) return room;
    rtOn();
    const max = clampMax(opts.max);
    const lock = opts.pass ? await sha256(opts.pass) : null;
    const id = fb.rtdb.ref('rooms').push().key;
    await fb.rtdb.ref('rooms/' + id).set({ host: uid, open: true, at: ts(), max, lock, name: me.name, m: { [uid]: memberInfo() } });
    await fb.rtdb.ref('lobby/' + id).set({ host: uid, name: me.name, n: 1, max, lock: !!lock, open: true, at: ts() }).catch(() => {});
    enterRoom(id, uid);
    return room;
  }

  /** Anfitrión: cambia el aforo de la sala (4-10). */
  async function setMax(n) {
    if (!room || !room.isHost) return;
    const max = clampMax(n);
    await fb.rtdb.ref('rooms/' + room.id + '/max').set(max).catch(() => {});
    await fb.rtdb.ref('lobby/' + room.id + '/max').set(max).catch(() => {});
  }

  /** Salas abiertas con sitio (lista pública), de más reciente a más antigua. */
  async function listRooms() {
    if (!fb || !fb.rtdb) return [];
    rtOn();
    let out = [];
    try {
      const snap = await fb.rtdb.ref('lobby').get();
      const v = snap.val() || {};
      const t = ts();
      out = Object.keys(v).map(id => Object.assign({ id }, v[id]))
        .filter(r => r.open !== false && (r.n || 0) < (r.max || DEFAULT_MAX) && t - (r.at || 0) < 6 * 3600 * 1000)
        .sort((a, b) => (b.at || 0) - (a.at || 0));
    } catch (e) { /* sin permiso o sin red */ }
    rtOff();
    return out;
  }

  /**
   * @param pass     contraseña escrita (si la sala tiene)
   * @param invited  con invitación del anfitrión no hace falta contraseña
   * → { ok } | { ok:false, error } | { ok:false, locked:true } (pide contraseña)
   */
  async function joinRoom(id, pass = '', invited = false) {
    if (room && room.id === id) return { ok: true };
    if (room) await leaveRoom();
    rtOn();
    let open = null, host = null, max = DEFAULT_MAX, lock = null;
    try {
      open = (await fb.rtdb.ref('rooms/' + id + '/open').get()).val();
      host = (await fb.rtdb.ref('rooms/' + id + '/host').get()).val();
      max = (await fb.rtdb.ref('rooms/' + id + '/max').get()).val() || DEFAULT_MAX;
      lock = (await fb.rtdb.ref('rooms/' + id + '/lock').get()).val() || null;
    } catch (e) { /* sala borrada */ }
    if (!host) { rtOff(); return { ok: false, error: 'Esa sala ya no existe.' }; }
    if (open !== true) { rtOff(); return { ok: false, error: 'La partida de esa sala ya ha empezado.' }; }
    if (lock && !invited) {
      if (!pass) { rtOff(); return { ok: false, locked: true, error: 'Esta sala tiene contraseña.' }; }
      if (await sha256(pass) !== lock) { rtOff(); return { ok: false, locked: true, error: 'Contraseña incorrecta.' }; }
    }
    try { await fb.rtdb.ref('rooms/' + id + '/m/' + uid).set(memberInfo()); }
    catch (e) { rtOff(); return { ok: false, error: 'No se pudo entrar en la sala.' }; }
    const n = (await fb.rtdb.ref('rooms/' + id + '/m').get()).numChildren();
    if (n > max) {
      await fb.rtdb.ref('rooms/' + id + '/m/' + uid).remove();
      rtOff();
      return { ok: false, error: 'La sala está llena (máximo ' + max + ').' };
    }
    enterRoom(id, host);
    return { ok: true };
  }

  function enterRoom(id, host) {
    room = { id, host, isHost: host === uid, members: [], open: true, max: DEFAULT_MAX, locked: false };
    lobOn = true; rdyOn = false;        // se entra desde la sala (memberInfo ya lleva lob: true, rdy: false)
    watchRoomDisconnect();
    const mref = fb.rtdb.ref('rooms/' + id + '/m');
    mref.on('value', s => {
      if (!room || room.id !== id) return;
      const m = s.val() || {};
      // El anfitrión siempre primero; el resto por orden de llegada.
      room.members = Object.keys(m).map(k => Object.assign({ uid: k }, m[k]))
        .sort((a, b) => (a.uid === room.host ? -1 : b.uid === room.host ? 1 : (a.at || 0) - (b.at || 0)));
      // La lista pública de salas: el anfitrión mantiene cuántos hay.
      if (room.isHost) fb.rtdb.ref('lobby/' + id).update({ n: room.members.length, at: ts() }).catch(() => {});
      emit('room');
    }, () => closedRoom());
    const xref = fb.rtdb.ref('rooms/' + id + '/max');
    xref.on('value', s => { if (room && room.id === id) { room.max = clampMax(s.val()); emit('room'); } }, () => {});
    const lref = fb.rtdb.ref('rooms/' + id + '/lock');
    lref.on('value', s => { if (room && room.id === id) { room.locked = !!s.val(); emit('room'); } }, () => {});
    const href = fb.rtdb.ref('rooms/' + id + '/host');
    href.on('value', s => {
      if (!room || room.id !== id) return;
      const h = s.val();
      if (!h) { closedRoom(); return; }
      if (h !== room.host) {
        // Copia local: el anfitrión ha pasado el puesto a otro (transferHost).
        const wasHost = room.isHost;
        room.host = h; room.isHost = h === uid;
        room.members.sort((a, b) => (a.uid === h ? -1 : b.uid === h ? 1 : (a.at || 0) - (b.at || 0)));
        if (wasHost !== room.isHost) rewatchDisconnect(wasHost);
        if (room.isHost) rdyOn = false;
        emit('host');
        emit('room');
      }
    }, () => closedRoom());
    const oref = fb.rtdb.ref('rooms/' + id + '/open');
    oref.on('value', s => { if (room && room.id === id) { room.open = s.val() === true; emit('room'); } }, () => {});
    // Chat de la sala (también durante la partida): los últimos 60 mensajes.
    chat.length = 0;
    const cref = fb.rtdb.ref('rooms/' + id + '/chat').limitToLast(80);
    cref.on('child_added', s => {
      if (!room || room.id !== id) return;
      const v = s.val();
      if (!v || typeof v.t !== 'string') return;
      chat.push({ id: s.key, u: v.u, n: String(v.n || '?').slice(0, 20), t: v.t.slice(0, 200), at: v.at || 0 });
      if (chat.length > 120) chat.splice(0, chat.length - 120);
      emit('chat');
    }, () => {});
    roomRefs = [mref, href, oref, xref, lref, cref];
    writeStatus();
    emit('room');
  }

  /** Copia local: pasar el puesto de anfitrión a otro miembro (sólo en la sala, no en partida). */
  async function transferHost(to) {
    if (!room || !room.isHost || to === uid || !room.members.some(m => m.uid === to)) return { ok: false };
    if (playing) return { ok: false, error: 'No se puede cambiar de anfitrión durante la partida.' };
    const m = room.members.find(x => x.uid === to);
    try {
      await fb.rtdb.ref('rooms/' + room.id).update({ host: to, name: m.name || '?' });
      await fb.rtdb.ref('lobby/' + room.id).update({ host: to, name: m.name || '?', at: ts() }).catch(() => {});
      return { ok: true };
    } catch (e) { return { ok: false, error: 'No se pudo pasar el puesto de anfitrión.' }; }
  }

  /** Al cambiar de anfitrión: el nuevo vigila la sala entera; el antiguo, sólo su plaza. */
  function rewatchDisconnect(wasHost) {
    if (!room) return;
    const rref = fb.rtdb.ref('rooms/' + room.id), mref = fb.rtdb.ref('rooms/' + room.id + '/m/' + uid), lref = fb.rtdb.ref('lobby/' + room.id);
    if (wasHost) { rref.onDisconnect().cancel().catch(() => {}); lref.onDisconnect().cancel().catch(() => {}); }
    else mref.onDisconnect().cancel().catch(() => {});
    watchRoomDisconnect();
  }

  /** Si se cierra el navegador, la sala (anfitrión) o tu plaza (invitado) se borran solas. */
  function watchRoomDisconnect() {
    if (!room) return;
    const ref = room.isHost ? fb.rtdb.ref('rooms/' + room.id) : fb.rtdb.ref('rooms/' + room.id + '/m/' + uid);
    ref.onDisconnect().remove();
    if (room.isHost) fb.rtdb.ref('lobby/' + room.id).onDisconnect().remove();
  }

  function detachRoom() {
    for (const r of roomRefs) r.off();
    roomRefs = [];
    chat.length = 0;
  }

  /** Mensaje a la sala (lo ven todos los de la sala, en la sala y en la partida). */
  function sendChat(text) {
    text = String(text || '').trim().slice(0, 200);
    if (!room || !me || !text) return;
    fb.rtdb.ref('rooms/' + room.id + '/chat').push({ u: uid, n: me.name, t: text, at: ts() }).catch(() => {});
  }

  // ---------------- mensajes privados (Firestore: dm/{pareja} y dm/{pareja}/msgs) ----------------

  function loadDmSeen() { try { dmSeen = JSON.parse(localStorage.getItem('ps.dmseen.' + uid) || '{}') || {}; } catch (e) { dmSeen = {}; } }
  function saveDmSeen() { try { localStorage.setItem('ps.dmseen.' + uid, JSON.stringify(dmSeen)); } catch (e) { /* nada */ } }

  /** Escucha las charlas en las que estás (un documento pequeño por amigo con el que has hablado). */
  function listenDms() {
    if (unDm || !fb) return;
    unDm = fb.fs.collection('dm').where('users', 'array-contains', uid).onSnapshot(snap => {
      snap.docChanges().forEach(ch => {
        if (ch.type === 'removed') { dms.delete(ch.doc.id); return; }
        const v = ch.doc.data() || {};
        const other = (v.users || []).find(x => x !== uid);
        if (!other) return;
        dms.set(ch.doc.id, { pid: ch.doc.id, other, from: v.from, t: String(v.t || '').slice(0, 80), last: msOf(v.last) });
      });
      emit('dm');
    }, e => console.warn('[Social] mensajes:', e.code || e.message));
  }

  function dmUnread(other) {
    const d = dms.get(pidOf(uid, other));
    return !!(d && d.from !== uid && d.last > (dmSeen[d.pid] || 0));
  }
  function unreadDm() { let n = 0; for (const d of dms.values()) if (d.from !== uid && d.last > (dmSeen[d.pid] || 0)) n++; return n; }
  function markDmSeen(other) {
    const pid = pidOf(uid, other), d = dms.get(pid);
    const t = d ? d.last : Date.now();
    if ((dmSeen[pid] || 0) >= t) return;
    dmSeen[pid] = t; saveDmSeen(); emit('dm');
  }

  async function sendDm(other, text) {
    text = String(text || '').trim().slice(0, 300);
    if (!fb || !me || !text) return { ok: false };
    const f = friends.get(other);
    if (!f || f.status !== 'ok') return { ok: false, error: 'Sólo puedes escribir a tus amigos.' };
    const pid = pidOf(uid, other);
    const users = uid < other ? [uid, other] : [other, uid];
    try {
      const b = fb.fs.batch();
      b.set(fb.fs.collection('dm').doc(pid), { users, from: uid, t: text.slice(0, 80), last: fts() });
      b.set(fb.fs.collection('dm').doc(pid).collection('msgs').doc(), { from: uid, t: text, at: fts() });
      await b.commit();
      return { ok: true };
    } catch (e) {
      console.warn('[Social] enviar mensaje:', e.code || e.message);
      return { ok: false, error: 'No se pudo enviar el mensaje.' };
    }
  }

  /** Los últimos 50 mensajes con `other`; `fn(lista)` cada vez que cambian. → función para dejar de escuchar. */
  function watchDm(other, fn) {
    if (!fb) return () => {};
    const pid = pidOf(uid, other);
    return fb.fs.collection('dm').doc(pid).collection('msgs').orderBy('at', 'desc').limit(50).onSnapshot(snap => {
      fn(snap.docs.map(d => { const v = d.data(); return { id: d.id, from: v.from, t: String(v.t || ''), at: msOf(v.at) || Date.now() }; }).reverse());
    }, e => console.warn('[Social] leer mensajes:', e.code || e.message));
  }

  function closedRoom() {
    if (!room) return;
    detachRoom();
    room = null;
    retractInvites();
    writeStatus();
    rtOff();
    emit('room-closed');
  }

  async function leaveRoom() {
    if (!room) return;
    const r = room;
    detachRoom();
    room = null;
    const ref = r.isHost ? fb.rtdb.ref('rooms/' + r.id) : fb.rtdb.ref('rooms/' + r.id + '/m/' + uid);
    ref.onDisconnect().cancel().catch(() => {});
    if (r.isHost) { fb.rtdb.ref('lobby/' + r.id).onDisconnect().cancel().catch(() => {}); fb.rtdb.ref('lobby/' + r.id).remove().catch(() => {}); }
    await ref.remove().catch(() => {});
    retractInvites();
    writeStatus();
    rtOff();
    emit('room');
  }

  /** El anfitrión cierra la sala a nuevos jugadores al empezar la partida. */
  function setOpen(open) {
    if (!room || !room.isHost) return;
    fb.rtdb.ref('rooms/' + room.id + '/open').set(!!open).catch(() => {});
    fb.rtdb.ref('lobby/' + room.id + '/open').set(!!open).catch(() => {});   // fuera de la lista mientras se juega
  }

  /** Actualiza tu Pokémon en la sala (si cambias de compañero). */
  /** Relee de la base de datos el Pokémon de cada miembro (justo antes de empezar). */
  async function freshMembers() {
    if (!room) return [];
    try {
      const snap = await fb.rtdb.ref('rooms/' + room.id + '/m').once('value');
      const m = snap.val() || {};
      for (const mem of room.members) { const x = m[mem.uid]; if (x && x.dex) { mem.dex = x.dex; mem.shiny = !!x.shiny; } }
    } catch (e) { /* se usa lo que haya */ }
    return room.members;
  }

  function refreshMember() {
    if (room && me) fb.rtdb.ref('rooms/' + room.id + '/m/' + uid).update(
      { dex: G.DB.save.partner, shiny: !!G.DB.save.partnerShiny && G.DB.ownsShiny(G.DB.save.partner) }).catch(() => {});
  }

  // ---------------- invitaciones ----------------

  async function invite(other) {
    const f = friends.get(other);
    if (!f || f.status !== 'ok') return { ok: false, error: 'Sólo puedes invitar a tus amigos.' };
    if (room && room.members.length >= (room.max || DEFAULT_MAX)) return { ok: false, error: 'La sala está llena.' };
    if (room && !room.isHost) return { ok: false, error: 'Sólo el anfitrión de la sala puede invitar.' };
    if (!room) await createRoom();
    try {
      await fb.fs.collection('inv').doc(other + '_' + uid).set({ to: other, from: uid, room: room.id, name: me.name, at: fts() });
    } catch (e) { return { ok: false, error: 'No se pudo invitar (' + (e.code || 'error') + ').' }; }
    sentInv.add(other);
    return { ok: true, msg: 'Invitación enviada a ' + f.name };
  }

  /** Retira las invitaciones que mandaste (al salir de la sala). */
  function retractInvites() {
    if (!fb) return;
    for (const o of sentInv) fb.fs.collection('inv').doc(o + '_' + uid).delete().catch(() => {});
    sentInv.clear();
  }

  function onInvite(ref, v) {
    // Las caducadas se borran; sólo se aceptan de amigos confirmados.
    if (!v || (v.at && now() - msOf(v.at) > INVITE_TTL)) { ref.delete().catch(() => {}); return; }
    const f = friends.get(v.from);
    if (f && f.status !== 'ok') return;
    invites.set(v.from, { from: v.from, name: v.name, room: v.room, at: msOf(v.at) || now() });
    emit('invites');
  }

  const invDoc = from => fb.fs.collection('inv').doc(uid + '_' + from);

  async function acceptInvite(from) {
    const inv = invites.get(from);
    if (!inv || now() - inv.at > INVITE_TTL) { invites.delete(from); emit('invites'); return { ok: false, error: 'La invitación ha caducado.' }; }
    invites.delete(from);
    invDoc(from).delete().catch(() => {});
    emit('invites');
    return joinRoom(inv.room, '', true);
  }

  function declineInvite(from) {
    invites.delete(from);
    invDoc(from).delete().catch(() => {});
    emit('invites');
  }

  // ---------------- perfil público ----------------

  /** Lo que se enseña de ti (también para tu vista previa, sin subirlo). */
  function profileData() {
    const s = G.DB.save, st = s.stats, prof = s.profile || {};
    const unlocked = G.AchDefs.LIST.filter(a => s.ach && s.ach[a.id]);
    const medals = unlocked.slice().sort((a, b) => (b.tier - a.tier) || (s.ach[b.id] - s.ach[a.id])).slice(0, 8).map(a => a.id);
    return {
      name: me ? me.name : G.DB.user,
      favs: (prof.favs || []).slice(0, 3).map(f => ({ dex: f.dex | 0, shiny: !!f.shiny })),
      title: prof.title || '',
      best: { solo: st.bestTime | 0, group: st.bestGroupTime | 0, level: st.bestLevel | 0, bosses: st.bossesTotal | 0,
              legends: Object.keys(s.legends || {}).length, kills: st.totalKills | 0, medals: unlocked.length },
      medals
    };
  }

  let pubT = 0, pubAt = 0, pubLast = '';
  /**
   * Sube tu perfil (con un poco de espera, por si cambias varias cosas
   * seguidas), pero SÓLO si ha cambiado algo de lo que se ve a primera vista:
   * récords de tiempo y nivel, legendarios, medallas, título o favoritos.
   * Los jefes y derrotados (que cambian en cada partida) se suben con lo demás
   * cuando toca, no por sí solos: el perfil se escribía 200.000 veces al día
   * (13-10-2026). Si cambias favoritos o título (force), al momento.
   */
  function publishProfile(force = false) {
    if (!me || !fb) return;
    if (!force && Date.now() - pubAt < 2 * 3600 * 1000) return;    // como mucho cada 2 h (era 30 min)
    clearTimeout(pubT);
    pubT = setTimeout(() => {
      if (!me || !fb) return;
      const d = profileData();
      // Para decidir si se sube (se recuerda entre sesiones): sin jefes ni derrotados.
      const key = JSON.stringify(Object.assign({}, d, { best: Object.assign({}, d.best, { kills: 0, bosses: 0 }) }));
      const lsKey = 'ps.pub.' + uid;
      if (!pubLast) { try { pubLast = localStorage.getItem(lsKey) || ''; } catch (e) { /* nada */ } }
      if (key === pubLast) return;
      pubLast = key; pubAt = Date.now();
      try { localStorage.setItem(lsKey, key); } catch (e) { /* nada */ }
      fb.fs.collection('profiles').doc(uid).set(Object.assign(d, {
        name: me.name, lower: me.name.toLowerCase(), at: firebase.firestore.FieldValue.serverTimestamp()
      })).catch(e => { pubLast = ''; console.warn('[Social] perfil:', e.code || e.message); });
    }, 800);
  }

  /** El perfil público de otro jugador. */
  const profCache = new Map();
  async function getProfile(other) {
    if (!fb) return null;
    // El tuyo sale de tu partida (sin leer nada y siempre al día).
    if (other === uid && me) return Object.assign(profileData(), { name: me.name });
    const c = profCache.get(other);
    if (c && Date.now() - c.at < 10 * 60 * 1000) return c.v;     // lo leído vale 10 min
    const d = await fb.fs.collection('profiles').doc(other).get().catch(() => null);
    const v = d && d.exists ? d.data() : null;
    profCache.set(other, { at: Date.now(), v });
    return v;
  }

  // Al cerrar sesión o borrar la cuenta.
  G.DB.onLeave(why => stop(why));

  return {
    start, stop, claimNick, request, accept, remove, publishProfile, getProfile, profileData,
    createRoom, joinRoom, leaveRoom, setOpen, setMax, listRooms, setInLobby, setReady, transferHost, refreshMember, freshMembers, setPlaying, refreshPresence,
    get ready() { return rdyOn; },
    sendChat, get chat() { return chat; },
    sendDm, watchDm, markDmSeen, dmUnread, unreadDm, get dms() { return [...dms.values()]; },
    invite, acceptInvite, declineInvite,
    on(fn) { listeners.add(fn); }, off(fn) { listeners.delete(fn); },
    get me() { return me; },
    get started() { return started; },
    get friends() { return [...friends.values()]; },
    get invites() { return [...invites.values()]; },
    get room() { return room; },
    get uid() { return uid; },
    /** La hora real (corrige el reloj del aparato si va desfasado). */
    now,
    VALID, MAX_PLAYERS
  };
})();
