/* ============ batch.mjs — partidas completas del bot, en serie, con resultados en JSONL (copia local) ============
 * node tools/test/batch.mjs <puerto> <n> <dex> <modo: bot|all> <etiqueta> <archivo.jsonl>
 * Cada partida en una pestaña nueva que SIEMPRE se cierra (también si algo falla), con
 * tope de 40 min. Al morir, el propio juego guarda el resultado (no se pierde aunque la
 * pantalla cambie). Una línea JSON por partida en <archivo.jsonl>.
 */
import fs from 'node:fs';
const [,, port, n, dex, mode, label, out] = process.argv;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function openTab() {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = new Map(), errs = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errs.push(String(d.params.exceptionDetails.exception?.description || '').slice(0, 200)); };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = e => Promise.race([
    send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }).then(r => r.result?.result?.value ?? ('ERR ' + (r.result?.exceptionDetails?.exception?.description || ''))),
    sleep(20000).then(() => 'TIMEOUT')]);
  await send('Runtime.enable');
  const close = async () => { try { ws.close(); } catch (e) {} try { await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`); } catch (e) {} };
  return { send, ev, errs, close };
}

const SETUP = `(()=>{ document.getElementById('tap-start').click(); document.getElementById('scr-invite').classList.add('hidden');
  G.DB.playAsGuest(); const s = G.DB.save; s.partner = ${dex}; s.owned[${dex}] = { at: 1 };
  const u = G.DB.upgradesOf(${dex}); for (const x of G.Upgrades.LIST) u[x.id] = x.max;
  G.Boost.paused = false; ${mode === 'bot' ? "G.Boost.debugAs('BATCHBOT', null, false, true);" : "G.Boost.debugAs('BATCHALL', null, true);"}
  G.UI.hideAll(); G.Game.startRun(); window.__POKE_BOT_ON__ = true;
  const p = G.Game.player; window.__dmg = []; const orig = p.hurt.bind(p);
  p.hurt = (amount, type, pure, cat) => { const st = new Error().stack; const nearE = G.EnemyMgr.all().filter(e => !e.dead).reduce((m, e) => Math.min(m, Math.hypot(e.x - p.x, e.y - p.y) - (e.r || 14) - p.r), 1e9);
    const src = /hazards\\.js/.test(st) ? 'HAZARD' : /judgment/.test(st) ? 'ARCEUS' : /combat\\.js/.test(st) ? (nearE < 6 ? 'CONTACT' : 'SHOT') : 'OTHER';
    const hp0 = p.hp; const r = orig(amount, type, pure, cat); const lost = hp0 - p.hp;
    if (lost > 0.5) { const near = G.EnemyMgr.all().filter(e => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 160).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)).slice(0, 2).map(e => (e.def && e.def.name || '?') + (e.boss ? '(BOSS)' : '') + '@' + Math.round(Math.hypot(e.x - p.x, e.y - p.y)));
      window.__dmg.push({ src, t: Math.round(G.Game.st.time), lost: Math.round(lost), hp: Math.round(p.hp), max: Math.round(p.maxHp), type: pure ? 'pure' : type, near }); if (window.__dmg.length > 400) window.__dmg.shift(); }
    return r; };
  let lt = -1, lp = null; window.__ter = [];
  const D8 = [[1,0],[-1,0],[0,1],[0,-1],[0.707,0.707],[0.707,-0.707],[-0.707,0.707],[-0.707,-0.707]];
  const tick = () => {
    if (G.Game.state === 'playing' && G.Game.st.time - lt >= 0.5) { lt = G.Game.st.time;
      let open = 0; for (const [dx, dy] of D8) { const o = { x: p.x + dx * 60, y: p.y + dy * 60, r: p.r }; G.World.collide(o); if (Math.hypot(o.x - p.x, o.y - p.y) > 45) open++; }
      const mv = lp ? Math.round(Math.hypot(p.x - lp[0], p.y - lp[1])) : 0; lp = [p.x, p.y];
      window.__ter.push([Math.round(G.Game.st.time), Math.round(p.hp), open, mv, G.EnemyMgr.all().filter(e => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 120).length, p.inLiquid ? 1 : 0, +(p.slowT || 0).toFixed(1)]); if (window.__ter.length > 30) window.__ter.shift(); }
    const j = G.Judgment.summary();
    if ((G.Game.state === 'over' || p.dead || (j && j.time >= 60)) && !window.__done) {
      window.__done = { t: Math.round(G.Game.st.time), judg: j ? Math.round(j.time) : null, lv: p.level, kills: p.kills, bosses: p.bosses, maxHp: Math.round(p.maxHp),
        moves: p.moves.map(m => m.id + ':' + m.lvl).join(','), stats: Object.assign({}, p.statsTaken || {}),
        dmgBy: window.__dmg.reduce((m, d) => { m[d.src] = (m[d.src] || 0) + d.lost; return m; }, {}),
        last: window.__dmg.slice(-5), ter: window.__ter.slice(-8) };
    }
    if (!window.__done) requestAnimationFrame(tick); };
  requestAnimationFrame(tick); return 'ok'; })()`;

for (let k = 0; k < +n; k++) {
  const T = await openTab();
  const rec = { label, port: +port, dex: +dex, mode, k, started: new Date().toISOString() };
  try {
    await T.send('Page.navigate', { url: 'http://localhost:8765/dev.html?dev' });
    let ready = false;
    for (let w = 0; w < 60 && !ready; w++) { await sleep(1000); ready = (await T.ev(`typeof G === 'object' && !!G.Game && !!G.Judgment && !!G.DB && !!G.DB.playAsGuest && !!document.getElementById('tap-start')`)) === true; }
    if (!ready) throw new Error('page never ready');
    await sleep(1500);
    const s = await T.ev(SETUP);
    if (s !== 'ok') throw new Error('setup: ' + String(s).slice(0, 150));
    const t0 = Date.now();
    for (;;) {
      await sleep(5000);
      const d = await T.ev(`window.__done ? JSON.stringify(window.__done) : ''`);
      if (d && d !== 'TIMEOUT' && !String(d).startsWith('ERR')) { Object.assign(rec, JSON.parse(d)); break; }
      if (Date.now() - t0 > 40 * 60000) { rec.error = 'timeout 40 min'; break; }
    }
  } catch (e) { rec.error = String(e.message || e); }
  rec.pageErrors = T.errs.slice(0, 2);
  await T.close();
  fs.appendFileSync(out, JSON.stringify(rec) + '\n');
  console.log(label, k, rec.error ? 'ERROR ' + rec.error : `survived ${rec.t}s lv${rec.lv} judg=${rec.judg}`);
}
process.exit(0);
