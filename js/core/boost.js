/* ============ boost.js — copia local: ventajas sólo para ciertas cuentas ============
 * Dos niveles, por el "ID de usuario" de Firebase (Authentication > Usuarios):
 *   all   todo: personaje ×40, botín, tickets y monedas por segundo, y el bot
 *   bot   sólo el bot de en/bot.js (números normales)
 * Para los demás jugadores el juego es el original.
 *
 * Las listas viven en Firestore, documento config/boost:
 *   { all: ['uid', ...], bot: ['uid', ...] }
 * Se editan desde la consola de Firebase sin tocar el código ni republicar; el
 * juego las lee al entrar (G.Flow.afterLogin). UIDS de abajo: respaldo fijo.
 *
 * Las partidas con bot o ventajas no suben al ranking (ver Game.clean), así los
 * amigos compiten entre ellos en igualdad.
 */
G.Boost = (() => {
  const UIDS = [
    'DFa2yefCCPVzV9OA5Ie07jHHlZ32'   // MiNG
  ];
  // Personaje: velocidad ×, recarga × (0,4 = 2,5 veces más rápido), daño ×
  // (el daño además crece con el tiempo como la vida de los enemigos).
  const POWER = { spd: 1.6, cd: 0.4, atk: 40, grow: true };
  // Ventajas sueltas por cuenta (config/boost.custom[uid]): cada una ×1 (original), ×2, ×3, ×4, ×5 o ×10.
  //   spd velocidad · atkSpd velocidad de ataque · atk daño · tickets cantidad de tickets · coins monedas al acabar
  const KEYS = ['spd', 'atkSpd', 'atk', 'tickets', 'coins'];
  const MULTS = [1, 2, 3, 4, 5, 10];
  // El administrador también elige su nivel ('all' por defecto): config/boost.admin[uid]
  let all = new Set(UIDS), bot = new Set(), custom = {}, adminLvl = {}, loadedFor = null;

  let forced = null;            // sólo pruebas (dev.html): debugAs()
  // Interruptor del propio jugador: con las ventajas apagadas la partida es
  // limpia (y en grupo, la marca de todo el equipo sí sube al ranking).
  const K_OFF = 'ps.boost.off';
  let paused = false;
  try { paused = localStorage.getItem(K_OFF) === '1'; } catch (e) { /* nada */ }
  function uid() { if (forced) return forced; const fb = G.DB && G.DB.fb; return fb && fb.uid ? fb.uid : null; }
  function isOn() { const u = uid(); return !paused && !!u && all.has(u); }

  /** Lee config/boost de Firestore (una vez por cuenta). */
  async function load() {
    const fb = G.DB && G.DB.fb;
    if (!fb || !fb.uid || !fb.fs || loadedFor === fb.uid) return;
    loadedFor = fb.uid;
    try {
      const snap = await fb.fs.collection('config').doc('boost').get();
      const d = snap.exists ? snap.data() : {};
      all = new Set(Array.isArray(d.all) ? d.all : []);
      bot = new Set(Array.isArray(d.bot) ? d.bot : []);
      adminLvl = d.admin && typeof d.admin === 'object' ? d.admin : {};
      for (const u of UIDS) { const l = adminLvl[u] === undefined ? 'all' : adminLvl[u]; if (l === 'all') all.add(u); else if (l === 'bot') bot.add(u); }
      custom = d.custom && typeof d.custom === 'object' ? d.custom : {};
    } catch (e) { console.warn('[Boost] sin config/boost:', e.message); }
  }

  // ---------------- administración (sólo las cuentas de UIDS) ----------------

  /** Todos los jugadores con perfil (apodo), para el panel de Ajustes > Cuenta. */
  async function players() {
    const fb = G.DB && G.DB.fb;
    if (!fb || !fb.fs) return [];
    const snap = await fb.fs.collection('profiles').limit(300).get();
    const out = [];
    snap.forEach(d => { const p = d.data() || {}; if (p.name) out.push({ uid: d.id, name: p.name }); });
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Multiplicador suelto de la cuenta conectada (1 si no tiene, o si tiene "todo"). */
  function k(key) {
    const u = uid();
    if (paused || !u || all.has(u)) return 1;
    const v = custom[u] && +custom[u][key];
    return MULTS.includes(v) ? v : 1;
  }
  /** Ventajas sueltas de una cuenta (para el panel). */
  function customOf(u) { return Object.assign({}, custom[u] || {}); }

  /** Qué aplica al personaje: el paquete "todo", las sueltas, o nada (null). */
  function power() {
    if (isOn()) return POWER;
    const spd = k('spd'), cd = 1 / k('atkSpd'), atk = k('atk');
    return spd !== 1 || cd !== 1 || atk !== 1 || k('tickets') !== 1 || k('coins') !== 1 ? { spd, cd, atk, grow: false } : null;
  }

  async function save() {
    const fb = G.DB.fb;
    await fb.fs.collection('config').doc('boost').set({
      all: [...all].filter(x => !UIDS.includes(x)), bot: [...bot].filter(x => !UIDS.includes(x)), custom, admin: adminLvl
    });
  }

  /** Cambia una ventaja suelta de una cuenta (sólo administradores). */
  async function setCustom(u, key, val) {
    const fb = G.DB && G.DB.fb;
    if (!fb || !fb.fs || !UIDS.includes(fb.uid)) throw new Error('Sólo el administrador');
    if (!KEYS.includes(key) || !MULTS.includes(+val)) throw new Error('Valor no válido');
    const c = Object.assign({}, custom[u] || {});
    if (+val === 1) delete c[key]; else c[key] = +val;
    if (Object.keys(c).length) custom[u] = c; else delete custom[u];
    await save();
  }

  /** Nivel de una cuenta: 'all' | 'bot' | ''. */
  function level(u) { return all.has(u) ? 'all' : bot.has(u) ? 'bot' : ''; }

  /** Cambia el nivel de una cuenta y guarda config/boost (sólo administradores). */
  async function set(u, lvl) {
    const fb = G.DB && G.DB.fb;
    if (!fb || !fb.fs || !UIDS.includes(fb.uid)) throw new Error('Sólo el administrador');
    all.delete(u); bot.delete(u);
    if (lvl === 'all') all.add(u); else if (lvl === 'bot') bot.add(u);
    if (UIDS.includes(u)) adminLvl[u] = lvl;
    await save();
  }

  // ---------------- regalos: Pokémon enviados por el administrador ----------------
  // gifts/{uid}/items/{id} = { dex, shiny, from, at }. El que los recibe los
  // aplica a su partida al entrar (claimGifts) y borra el documento.

  /** Envía un Pokémon (dex) a una cuenta. */
  async function gift(u, dex, shiny = false) {
    const fb = G.DB && G.DB.fb;
    if (!fb || !fb.fs || !UIDS.includes(fb.uid)) throw new Error('Sólo el administrador');
    if (!G.DEX_BY[dex]) throw new Error('Pokémon desconocido');
    if (typeof u !== 'string' || u.length < 10) throw new Error('Cuenta no válida');
    await fb.fs.collection('gifts').doc(u).collection('items').add({
      dex, shiny: !!shiny, from: fb.uid, at: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  /** Envía Pokémonedas a una cuenta. */
  async function giftCoins(u, coins) {
    const fb = G.DB && G.DB.fb;
    if (!fb || !fb.fs || !UIDS.includes(fb.uid)) throw new Error('Sólo el administrador');
    coins = Math.floor(+coins);
    if (!(coins >= 1 && coins <= 1e12)) throw new Error('Cantidad no válida');
    if (typeof u !== 'string' || u.length < 10) throw new Error('Cuenta no válida');
    await fb.fs.collection('gifts').doc(u).collection('items').add({
      coins, from: fb.uid, at: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  /** Recoge los regalos pendientes de la cuenta conectada. Devuelve los Pokémon recibidos. */
  async function claimGifts() {
    const fb = G.DB && G.DB.fb;
    if (!fb || !fb.uid || !fb.fs || !G.DB.save || G.DB.guest) return [];
    let snap;
    try { snap = await fb.fs.collection('gifts').doc(fb.uid).collection('items').get(); }
    catch (e) { console.warn('[Boost] regalos:', e.message); return []; }
    const got = [], names = {};
    const nameOf = async u => {
      if (!u) return '';
      if (names[u] === undefined) {
        try { const p = await fb.fs.collection('profiles').doc(u).get(); names[u] = p.exists ? (p.data().name || '') : ''; } catch (e) { names[u] = ''; }
      }
      return names[u];
    };
    for (const d of snap.docs) {
      const g = d.data() || {};
      const mon = G.DEX_BY[g.dex];
      const from = await nameOf(g.from);
      if (mon) {
        if (g.shiny) G.DB.grantShiny(g.dex, 'gift'); else G.DB.grant(g.dex, 'gift');
        got.push({ dex: g.dex, name: mon.name, shiny: !!g.shiny, from });
      } else if (g.coins >= 1) {
        G.DB.save.coins = Math.max(0, (G.DB.save.coins || 0) + Math.floor(g.coins));
        got.push({ coins: Math.floor(g.coins), from });
      }
      try { await d.ref.delete(); } catch (e) { /* se volverá a aplicar (no duplica) */ }
    }
    if (got.length) G.DB.commit(true);
    return got;
  }

  return {
    UIDS, POWER, KEYS, MULTS, load, players, level, set, gift, giftCoins, claimGifts, k, customOf, power, setCustom,
    /** Pruebas: hacerse pasar por una cuenta, con ventajas sueltas opcionales. */
    debugAs(u, cust, full) { forced = u; if (cust) custom[u] = cust; if (full) all.add(u); },
    /** ¿La cuenta conectada administra las listas? */
    get admin() { const u = uid(); return !!u && UIDS.includes(u); },
    /** Todas las ventajas. */
    get on() { return isOn(); },
    /** Puede usar el bot (con o sin las demás ventajas). */
    get bot() { const u = uid(); return !paused && !!u && (all.has(u) || bot.has(u)); },
    /** ¿Esta cuenta tiene alguna ventaja asignada (aunque esté en pausa)? */
    get has() { const u = uid(); return !!u && (all.has(u) || bot.has(u) || !!custom[u]); },
    /** Ventajas en pausa por decisión del jugador (se aplica a la siguiente partida). */
    get paused() { return paused; },
    set paused(v) { paused = !!v; try { localStorage.setItem(K_OFF, paused ? '1' : '0'); } catch (e) { /* nada */ } }
  };
})();
