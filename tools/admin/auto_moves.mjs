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
const kill = setTimeout(() => { console.log('timeout'); process.exit(1); }, 240000);

try {
  await send('Page.navigate', { url: 'http://localhost:8765/dev.html?dev' });
  for (let w = 0; w < 90 && (await ev(`typeof G==='object'&&!!G.DB&&!!G.DB.save&&typeof PokeAutoBot==='function'&&!!document.getElementById('tap-start')`)) !== true; w++) await sleep(1000);
  await sleep(4000);   // que llegue la partida de la nube
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
      const v = id => { const b = value(mon, id); return G.Moves.BY_ID[id].kind === 'buff' ? b : b * Math.sqrt(dps(id) / med); };
      const choices = G.startChoices(dex);
      const start = choices.slice().sort((a, b) => v(b) - v(a))[0];
      const bans = pool.filter(id => id !== start && v(id) !== Infinity).sort((a, b) => v(a) - v(b)).slice(0, 3);
      const up = (s.pupg && s.pupg[dex]) || {};
      if (!up.start) noStart++;
      if ((up.ban || 0) < 3) noBan++;
      if (${WRITE}) {
        s.pstart = s.pstart || {}; s.pban = s.pban || {};
        if (start === G.baseStartOf(dex)) delete s.pstart[dex]; else s.pstart[dex] = start;
        s.pban[dex] = bans; changed++;
      }
      if (show.includes(dex)) rows.push(mon.name + ' (#' + dex + ', AT ' + mon.pa + ' / AE ' + mon.sa + ', ' + mon.types.join('/') + '): inicial ' +
        G.Moves.BY_ID[start].name + ' [' + G.Moves.BY_ID[start].cat + '] · vetados ' + bans.map(id => G.Moves.BY_ID[id].name).join(', '));
    }
    if (${WRITE}) G.DB.commit();
    return JSON.stringify({ who, owned: Object.keys(s.owned).length, changed, sinMejoraInicial: noStart, vetoIncompleto: noBan, rows });
  })()`);
  console.log(out);
} finally {
  clearTimeout(kill);
  try { ws.close(); } catch (e) {}
  await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`).catch(() => {});
  process.exit(0);
}
