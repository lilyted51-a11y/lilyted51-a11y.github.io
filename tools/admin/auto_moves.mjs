/* ============ auto_moves.mjs — veto y movimiento inicial automáticos (copia local) ============
 * node tools/admin/auto_moves.mjs <puerto CDP> [--write] [dex,dex,...]
 * En un Chrome con la cuenta ya abierta (p. ej. MiNG en 9334), para cada Pokémon que tiene:
 *   - movimiento inicial = el ataque que mejor le va (categoría física/especial según sus
 *     estadísticas, tipo de ataque, un solo tipo ×1,2, daño por segundo al máximo),
 *   - veto = los 3 que peor le van (antes que nada, los potenciadores de ataque de la otra
 *     categoría: Danza Espada en un atacante especial, Maquinación en uno físico).
 *     Agilidad, Fortaleza y Acua Aro no se vetan nunca (el bot los usa para esquivar).
 * Sin --write sólo enseña lo que haría. Con --write lo guarda y lo sube a la nube (G.DB.commit).
 */
const [,, port, ...rest] = process.argv;
const WRITE = rest.includes('--write');
const SHOW = (rest.find(a => /^\d+(,\d+)*$/.test(a)) || '382,1150,6,150,384').split(',').map(Number);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT', signal: AbortSignal.timeout(15000) })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
const send = (method, params = {}) => Promise.race([new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); }), sleep(30000).then(() => ({}))]);
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value ?? ('ERR ' + (r.result?.exceptionDetails?.exception?.description || '').slice(0, 300)); };
const kill = setTimeout(() => { console.log('timeout'); process.exit(1); }, 420000);

try {
  await send('Page.navigate', { url: 'http://localhost:8765/dev.html?dev' });
  for (let w = 0; w < 90 && (await ev(`typeof G==='object'&&!!G.DB&&!!G.DB.save&&typeof PokeAutoBot==='function'&&!!document.getElementById('tap-start')`)) !== true; w++) await sleep(1000);
  // Esperar a que la cuenta esté abierta y la partida de la nube cargada (si no, save es null o de invitado)
  let online = false;
  for (let w = 0; w < 20 && !online; w++) { online = (await ev(`!!(G.DB.online && G.DB.save && G.DB.save.owned)`)) === true; if (!online) await sleep(1000); }
  // --login <nombre> <contraseña>: si no hay cuenta abierta, se entra con ella (en la nube, no la copia local)
  const li = rest.indexOf('--login');
  if (!online && li >= 0) {
    console.log('login', await ev(`G.DB.login(${JSON.stringify(rest[li + 1])}, ${JSON.stringify(rest[li + 2])}).then(r => JSON.stringify(r))`));
    for (let w = 0; w < 90 && !online; w++) { online = (await ev(`!!(G.DB.online && G.DB.save && G.DB.save.owned)`)) === true; if (!online) await sleep(1000); }
  }
  if (!online) { console.log('La cuenta no está abierta en este Chrome: no se toca nada'); process.exit(2); }
  await sleep(3000);
  const out = await ev(`(() => {
    const s = G.DB.save, who = (G.Social && G.Social.me && G.Social.me.name) || (G.DB.user && (G.DB.user.displayName || G.DB.user.email)) || '?';
    const DEF_BUFF = new Set(['spd', 'def', 'regen']);
    const Q = PokeAutoBot.QUALITY;
    // Daño por segundo al nivel máximo (aprox.: daño × proyectiles / recarga)
    const dps = id => { const d = G.Moves.BY_ID[id]; const m = G.Moves.instance(id, d.maxLvl || 5);
      return (m.dmg || 10) * Math.max(1, m.count || 1) / Math.max(0.2, m.cd || 1); };
    const value = (mon, id) => {
      const d = G.Moves.BY_ID[id];
      if (d.kind === 'buff') {
        if (DEF_BUFF.has(d.stat)) return Infinity;                                   // nunca se veta
        const cat = d.stat === 'patk' ? 'physical' : d.stat === 'satk' ? 'special' : null;
        return cat && G.Stats.fit(mon, cat) < 0.95 ? -1 : 2;                         // potenciador de la otra categoría: el peor
      }
      const fit = G.Stats.fit(mon, d.cat);
      const mono = mon.types.length === 1 && d.type === mon.types[0] ? 1.2 : 1;
      return (Q[d.kind] || 0.6) * fit * fit * mono;
    };
    const rows = [], show = ${JSON.stringify(SHOW)};
    let changed = 0, noStart = 0, noBan = 0;
    for (const dex of Object.keys(s.owned).map(Number)) {
      const mon = G.DEX_BY[dex]; if (!mon) continue;
      const pool = G.Moves.poolFor(mon);
      const med = pool.map(dps).sort((a, b) => a - b)[pool.length >> 1] || 1;
      // El daño por segundo «daño ÷ recarga» sólo vale para lo que pega una vez por uso. Los que hacen daño
      // continuo (remolino cada 0,4 s, muñeco que dispara, aura, minas, rastro, órbita...) salían casi a 0 y se
      // vetaban por error (Torbellino de Kyogre): para ésos cuenta sólo el tipo de ataque y la categoría.
      const ONCE = new Set(['projectile', 'beam', 'charge', 'cone', 'nova', 'homing', 'bounce', 'chain', 'boomerang', 'melee', 'dash']);
      const v = id => { const b = value(mon, id), k = G.Moves.BY_ID[id].kind;
        return k === 'buff' || !ONCE.has(k) ? b : b * Math.sqrt(dps(id) / med); };
      const choices = G.startChoices(dex);
      const start = choices.slice().sort((a, b) => v(b) - v(a))[0];
      const bans = pool.filter(id => id !== start && v(id) !== Infinity).sort((a, b) => v(a) - v(b)).slice(0, 3);
      const up = (s.pupg && s.pupg[dex]) || {};
      if (!up.start) noStart++;
      if ((up.ban || 0) < 3) noBan++;
      if (${WRITE}) {
        s.pstart = s.pstart || {}; s.pban = s.pban || {};
        // Siempre explícito, aunque sea el de serie: al fusionar partidas, lo que falta se rellena con lo de la otra
        s.pstart[dex] = start;
        s.pban[dex] = bans; changed++;
      }
      if (show.includes(dex)) rows.push(mon.name + ' (#' + dex + ', AT ' + mon.pa + ' / AE ' + mon.sa + ', ' + mon.types.join('/') + '): inicial ' +
        G.Moves.BY_ID[start].name + ' [' + G.Moves.BY_ID[start].cat + '] · vetados ' + bans.map(id => G.Moves.BY_ID[id].name).join(', '));
    }
    if (${WRITE}) G.DB.commit();
    return JSON.stringify({ who, owned: Object.keys(s.owned).length, changed, sinMejoraInicial: noStart, vetoIncompleto: noBan, rows });
  })()`);
  console.log(out);
  if (WRITE) {
    // Subirlo de verdad (21-10-2026: se cerró la pestaña antes de la subida, que va con retraso, y en la nube
    // no quedó nada). saveNow espera a la subida; si toca esperar los 65 s entre subidas, se espera y se repite.
    for (let i = 0; i < 4; i++) {
      const r = await ev(`G.DB.saveNow().then(r => JSON.stringify(r))`);
      console.log('saveNow', r);
      let o = {}; try { o = JSON.parse(r); } catch (e) {}
      if (o.ok && o.why !== 'wait') break;
      await sleep(((o.secs || 30) + 3) * 1000);
    }
    // Comprobación en la nube (leyendo el documento directamente, no lo que hay en el navegador)
    console.log('nube', await ev(`(async () => { const fb = G.DB.fb; if (!fb) return 'sin nube';
      const d = await fb.fs.collection('saves').doc(fb.uid).get(); const sv = d.data().save || {};
      return JSON.stringify({ vetos: Object.keys(sv.pban || {}).length, iniciales: Object.keys(sv.pstart || {}).length,
        kyogre: { veto: (sv.pban || {})[382] || null, inicial: (sv.pstart || {})[382] || null },
        mewtwoY: { veto: (sv.pban || {})[1150] || null, inicial: (sv.pstart || {})[1150] || null } }); })()`));
  }
} finally {
  clearTimeout(kill);
  try { ws.close(); } catch (e) {}
  await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`).catch(() => {});
  process.exit(0);
}
