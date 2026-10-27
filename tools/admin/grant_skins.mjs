/* ============ grant_skins.mjs — da a una cuenta todas las skins (disfraces) y se las pone (copia local) ============
 * node tools/admin/grant_skins.mjs <puerto CDP> [--login <nombre> <contraseña>]
 * Las skins de Halloween (core/skins.js) se compran con caramelos esos días; esto las da directamente en la
 * partida guardada (save.skins) y, si tiene el Pokémon, se las deja puestas (save.pskin). Sube a la nube y comprueba.
 */
const [,, port, ...rest] = process.argv;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT', signal: AbortSignal.timeout(15000) })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
const send = (method, params = {}) => Promise.race([new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); }), sleep(30000).then(() => ({}))]);
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value ?? ('ERR ' + (r.result?.exceptionDetails?.exception?.description || '').slice(0, 300)); };
const kill = setTimeout(() => { console.log('timeout'); process.exit(1); }, 300000);
try {
  await send('Page.navigate', { url: 'http://localhost:8765/dev.html?dev' });
  for (let w = 0; w < 90 && (await ev(`typeof G==='object'&&!!G.DB&&!!G.Skins&&!!document.getElementById('tap-start')`)) !== true; w++) await sleep(1000);
  let online = false;
  for (let w = 0; w < 20 && !online; w++) { online = (await ev(`!!(G.DB.online && G.DB.save && G.DB.save.owned)`)) === true; if (!online) await sleep(1000); }
  const li = rest.indexOf('--login');
  if (!online && li >= 0) {
    console.log('login', await ev(`G.DB.login(${JSON.stringify(rest[li + 1])}, ${JSON.stringify(rest[li + 2])}).then(r => JSON.stringify(r))`));
    for (let w = 0; w < 90 && !online; w++) { online = (await ev(`!!(G.DB.online && G.DB.save && G.DB.save.owned)`)) === true; if (!online) await sleep(1000); }
  }
  if (!online) { console.log('La cuenta no está abierta en este Chrome: no se toca nada'); process.exit(2); }
  await sleep(3000);
  console.log(await ev(`(() => { const s = G.DB.save; s.skins = s.skins || {}; const out = [];
    for (const id of Object.keys(G.Skins.SKINS)) {   // también las que no se venden (el sombrero de Kecleon) const sk = G.Skins.SKINS[id]; if (!s.skins[id]) s.skins[id] = Date.now();
      if (G.DB.owns(sk.dex)) { G.Skins.wear(s, sk.dex, id); out.push(id + ' → puesta a #' + sk.dex); } else out.push(id + ' (no tiene #' + sk.dex + ')'); }
    G.DB.commit(true); return out.join(' · '); })()`));
  for (let i = 0; i < 4; i++) {
    const r = await ev(`G.DB.saveNow().then(r => JSON.stringify(r))`); console.log('saveNow', r);
    let o = {}; try { o = JSON.parse(r); } catch (e) {}
    if (o.ok && o.why !== 'wait') break;
    await sleep(((o.secs || 30) + 3) * 1000);
  }
  console.log('nube', await ev(`(async () => { const fb = G.DB.fb; if (!fb) return 'sin nube';
    const d = await fb.fs.collection('saves').doc(fb.uid).get(); const sv = d.data().save || {};
    return JSON.stringify({ skins: Object.keys(sv.skins || {}), puestas: sv.pskin }); })()`));
} finally { clearTimeout(kill); try { ws.close(); } catch (e) {} await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`).catch(() => {}); process.exit(0); }
