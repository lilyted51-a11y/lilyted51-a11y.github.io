/* ============ batch.mjs — partidas completas del bot, en serie, con resultados en JSONL (copia local) ============
 * node tools/test/batch.mjs <puerto> <n> <dex> <modo: bot|all> <etiqueta> <archivo.jsonl>
 * Cada partida en una pestaña nueva que SIEMPRE se cierra (también si algo falla), con
 * tope de 80 min (y apunta dónde iba). Al morir, el propio juego guarda el resultado (no se pierde aunque la
 * pantalla cambie). Una línea JSON por partida en <archivo.jsonl>.
 */
import fs from 'node:fs';
const [,, port, n, dex, mode, label, out] = process.argv;
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Nunca esperar para siempre (21-10-2026: un Chrome colgado dejó la tanda parada 4 horas sin avisar):
// todo lo que habla con Chrome tiene tope, y si en 90 min no acaba ninguna partida, se sale con error.
const withTimeout = (p, ms, what) => Promise.race([p, sleep(ms).then(() => { throw new Error('timeout ' + what); })]);
let lastProgress = Date.now();
setInterval(() => { if (Date.now() - lastProgress > 90 * 60000) { console.log(label, "WATCHDOG: sin progreso en 90 min, salgo"); process.exit(3); } }, 60000).unref();

async function openTab() {
  const t = await withTimeout(fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT', signal: AbortSignal.timeout(15000) }).then(r => r.json()), 20000, 'json/new');
  const ws = new WebSocket(t.webSocketDebuggerUrl); await withTimeout(new Promise((r, j) => { ws.onopen = r; ws.onerror = j; }), 15000, 'websocket');
  let id = 0; const pend = new Map(), errs = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errs.push(String(d.params.exceptionDetails.exception?.description || '').slice(0, 200));
    // console.error también (el juego atrapa los fallos del bot y los escribe con console.error('[bot]', e))
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errs.push(JSON.stringify(d.params.args.map(a => a.value ?? a.description)).slice(0, 240)); };
  const send = (method, params = {}) => Promise.race([new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); }),
    sleep(30000).then(() => ({ timeout: method }))]);
  const ev = e => Promise.race([
    send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }).then(r => r.result?.result?.value ?? ('ERR ' + (r.result?.exceptionDetails?.exception?.description || ''))),
    sleep(20000).then(() => 'TIMEOUT')]);
  await send('Runtime.enable');
  const close = async () => { try { ws.close(); } catch (e) {} try { await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`, { signal: AbortSignal.timeout(10000) }); } catch (e) {} };
  return { send, ev, errs, close };
}

const SETUP = `(()=>{ document.getElementById('tap-start').click(); document.getElementById('scr-invite').classList.add('hidden');
  G.DB.playAsGuest(); const s = G.DB.save; s.partner = ${dex}; s.owned[${dex}] = { at: 1 };
  const u = G.DB.upgradesOf(${dex}); for (const x of G.Upgrades.LIST) u[x.id] = x.max;
  ${process.env.BANS ? `(() => {   // BANS=1: veto y movimiento inicial como en la cuenta del dueño (tools/admin/auto_moves.mjs)
    const mon = G.DEX_BY[${dex}], Q = PokeAutoBot.QUALITY, DEF = new Set(['spd', 'def', 'regen']);
    const ONCE = new Set(['projectile', 'beam', 'charge', 'cone', 'nova', 'homing', 'bounce', 'chain', 'boomerang', 'melee', 'dash']);
    const dps = id => { const d = G.Moves.BY_ID[id]; const m = G.Moves.instance(id, d.maxLvl || 5); return (m.dmg || 10) * Math.max(1, m.count || 1) / Math.max(0.2, m.cd || 1); };
    const pool = G.Moves.poolFor(mon), med = pool.map(dps).sort((a, b) => a - b)[pool.length >> 1] || 1;
    const v = id => { const d = G.Moves.BY_ID[id];
      if (d.kind === 'buff') { if (DEF.has(d.stat)) return Infinity; const cat = d.stat === 'patk' ? 'physical' : d.stat === 'satk' ? 'special' : null; return cat && G.Stats.fit(mon, cat) < 0.95 ? -1 : 2; }
      const fit = G.Stats.fit(mon, d.cat), b = (Q[d.kind] || 0.6) * fit * fit * (mon.types.length === 1 && d.type === mon.types[0] ? 1.2 : 1);
      return ONCE.has(d.kind) ? b * Math.sqrt(dps(id) / med) : b; };
    // START_BASE=1: el inicial de serie (para comparar con el que elige el veto automático)
    const start = ${process.env.START_BASE ? 'G.baseStartOf(' + dex + ')' : 'G.startChoices(' + dex + ').sort((a, b) => v(b) - v(a))[0]'};
    s.pstart = { [${dex}]: start }; s.pban = { [${dex}]: pool.filter(id => id !== start && v(id) !== Infinity).sort((a, b) => v(a) - v(b)).slice(0, 3) };
  })();` : ''}
  ${process.env.START || process.env.TM || process.env.NAT || process.env.ABIL ? `(() => {   // configuración fija (tools/admin/auto_build.mjs): START, START2, TM=a,b, NAT, ABIL=0|1|2
    const E = ${JSON.stringify({ START: process.env.START || '', START2: process.env.START2 || '', TM: process.env.TM || '', NAT: process.env.NAT || '', ABIL: process.env.ABIL || '' })};
    if (E.TM) { s.ptm = { [${dex}]: E.TM.split(',') }; }
    if (E.NAT) G.Mons.setNature(${dex}, E.NAT);
    if (E.ABIL !== '') G.Mons.setAbility(${dex}, +E.ABIL);
    if (E.START) { s.pstart = s.pstart || {}; s.pstart[${dex}] = E.START; }
    if (E.START2) { s.pstart2 = s.pstart2 || {}; s.pstart2[${dex}] = E.START2; }
  })();` : ''}
  G.Boost.paused = false; ${mode === 'bot' ? "G.Boost.debugAs('BATCHBOT', null, false, true);" : "G.Boost.debugAs('BATCHALL', null, true);"}
  G.UI.hideAll(); G.Game.startRun(); window.__POKE_BOT_ON__ = true;
  window.__botErr = 0; const ce = console.error.bind(console); console.error = (...a) => { if (String(a[0]).includes('[bot]')) window.__botErr++; ce(...a); };
  const p = G.Game.player; window.__dmg = []; const orig = p.hurt.bind(p);
  // Peligros: dónde estaba el jugador cuando apareció el aviso (¿se podía escapar?)
  const hadd = G.Hazards.add; G.Hazards.add = function (h, net) { const o = hadd.call(this, h, net);
    o.__in0 = G.Hazards.inside(o, p.x, p.y, p.r); o.__t0 = G.Game.st.time; o.__p0 = [p.x, p.y]; return o; };
  p.hurt = (amount, type, pure, cat) => { const st = new Error().stack; const nearE = G.EnemyMgr.all().filter(e => !e.dead).reduce((m, e) => Math.min(m, Math.hypot(e.x - p.x, e.y - p.y) - (e.r || 14) - p.r), 1e9);
    const src = /hazards\\.js/.test(st) ? 'HAZARD' : /judgment/.test(st) ? 'ARCEUS' : /combat\\.js/.test(st) ? (nearE < 6 ? 'CONTACT' : 'SHOT') : 'OTHER';
    const hp0 = p.hp; const r = orig(amount, type, pure, cat); const lost = hp0 - p.hp;
    if (lost > 0.5) { const near = G.EnemyMgr.all().filter(e => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 160).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)).slice(0, 2).map(e => (e.def && e.def.name || '?') + (e.boss ? '(BOSS)' : '') + '@' + Math.round(Math.hypot(e.x - p.x, e.y - p.y)));
      let hz = null;
      if (src === 'HAZARD') { const h = G.Hazards.all.find(h => h.hit && h.t - h.delay < 0.1 && G.Hazards.inside(h, p.x, p.y, p.r));
        if (h) hz = { k: h.kind, delay: +h.delay.toFixed(2), sz: Math.round(h.r || h.w || 0), len: Math.round(h.len || 0), in0: h.__in0 ? 1 : 0,
          moved: h.__p0 ? Math.round(Math.hypot(p.x - h.__p0[0], p.y - h.__p0[1])) : null, others: G.Hazards.all.filter(o => !o.hit).length,
          dir: window.myPokeBot ? window.myPokeBot.lastDir : null }; }
      window.__dmg.push({ src, hz, t: Math.round(G.Game.st.time), lost: Math.round(lost), hp: Math.round(p.hp), max: Math.round(p.maxHp), type: pure ? 'pure' : type, near }); if (window.__dmg.length > 400) window.__dmg.shift(); }
    return r; };
  // Detector de "quiere moverse pero no se mueve": cada fotograma, con el motivo
  window.__stuck = []; window.__stuckN = 0;
  const col = G.World.collide; G.World.collide = function (o) { const bx = o.x, by = o.y; const r = col.apply(this, arguments); if (o === p) window.__push = Math.hypot(o.x - bx, o.y - by); return r; };
  const upd = p.update.bind(p);
  p.update = function (dt, ...rest) {
    const x0 = p.x, y0 = p.y, ax = G.Input.axis(); window.__push = 0;
    const r = upd(dt, ...rest);
    const moved = Math.hypot(p.x - x0, p.y - y0), want = (ax[0] || ax[1]) ? p.spd * dt : 0;
    if (G.Game.state === 'playing' && !p.dead && want > 0.5 && moved < want * 0.2) {
      window.__stuckN++;
      window.__stuck.push({ t: +G.Game.st.time.toFixed(2), ax: ax.map(v => +v.toFixed(2)), want: +want.toFixed(2), moved: +moved.toFixed(2), push: +(window.__push || 0).toFixed(2), spd: Math.round(p.spd), sv: [Math.round(p.svx || 0), Math.round(p.svy || 0)], frozen: !!p.frozen, liq: !!p.inLiquid,
        near: G.EnemyMgr.all().filter(e => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 40).length, props: G.World.propsInCircle(p.x, p.y, 40).filter(o => o.solid).map(o => o.type).join(','),
        // lo que cree el bot: ¿se movería 6 px en esa dirección según la colisión? (si sí y no se mueve, algo más lo frena)
        pred: (() => { const o = { x: x0 + ax[0] * 6, y: y0 + ax[1] * 6, r: p.r }; G.World.collide(o); return +Math.hypot(o.x - x0, o.y - y0).toFixed(2); })(),
        pos: [Math.round(p.x), Math.round(p.y)], arena: !!G.Rift.inArena, judge: !!(G.Judgment.arceus), r: p.r });
      if (window.__stuck.length > 20) window.__stuck.shift();
    }
    return r;
  };
  let lt = -1, lp = null, lt30 = -30, fr = 0, fw = performance.now(); window.__ter = []; window.__tl = [];
  const D8 = [[1,0],[-1,0],[0,1],[0,-1],[0.707,0.707],[0.707,-0.707],[-0.707,0.707],[-0.707,-0.707]];
  const tick = () => {
    fr++; if (G.Game.state === 'playing' && G.World.specialsNear(p.x, p.y, 40).some(o => o.type === 'spring' && Math.hypot(o.x - p.x, o.y - 8 - p.y) < 26)) window.__springF = (window.__springF || 0) + 1;
    if (G.Game.state === 'playing' && G.Game.st.time - lt >= 0.5) { lt = G.Game.st.time;
      let open = 0; for (const [dx, dy] of D8) { let cx = p.x, cy = p.y, d = 0; for (; d < 84; d += 12) { const o = { x: cx + dx * 12, y: cy + dy * 12, r: p.r }; G.World.collide(o); if (Math.hypot(o.x - cx, o.y - cy) < 6) break; cx = o.x; cy = o.y; } if (d >= 72) open++; }   // paso a paso: no atraviesa paredes finas
      const mv = lp ? Math.round(Math.hypot(p.x - lp[0], p.y - lp[1])) : 0; lp = [p.x, p.y];
      const b = window.myPokeBot;
      window.__ter.push([Math.round(G.Game.st.time), Math.round(p.hp), open, mv, G.EnemyMgr.all().filter(e => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 120).length, p.inLiquid ? 1 : 0, +(p.slowT || 0).toFixed(1),
        b ? b.lastDir : null, b ? (b.dbgMode || '') : '', b ? Object.entries(b.currentKeys || {}).filter(k => k[1]).map(k => k[0].replace('Key', '')).join('') : '', window.__botErr || 0]); if (window.__ter.length > 30) window.__ter.shift(); }
    // Línea de tiempo cada 30 s: [t, enemigos vivos, élites (≥55 vivos), nivel, muertes, vida, daño hecho (miles), movimientos evolucionados, enemigos a <200, en la grieta, fotogramas por segundo, fotogramas sobre un manantial, xp en el suelo, xp a <300 px, xp para subir, sin matar (bot), Agilidad/Fortaleza y su nivel]
    if (G.Game.state === 'playing' && G.Game.st.time - lt30 >= 30) { lt30 = G.Game.st.time;
      window.__tl.push([Math.round(lt30), G.EnemyMgr.count, G.EnemyMgr.count >= 55 ? 1 : 0, p.level, p.kills, Math.round(p.hp),
        Math.round(p.moves.reduce((a, m) => a + (m.dealt || 0), 0) / 1000), p.moves.filter(m => m.evolved).length,
        G.EnemyMgr.all().filter(e => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 200).length, G.Rift.inArena ? 1 : 0, Math.round(fr * 1000 / Math.max(1, performance.now() - fw)), window.__springF || 0,
        // experiencia que sigue en el suelo (no desaparece): total y a menos de 300 px; y la que se necesita para el siguiente nivel
        Math.round(G.Pickups.all().filter(o => o.kind === 'xp' || o.kind === 'xpBig').reduce((a, o) => a + (o.value || 1), 0)),
        Math.round(G.Pickups.all().filter(o => (o.kind === 'xp' || o.kind === 'xpBig') && Math.hypot(o.x - p.x, o.y - p.y) < 300).reduce((a, o) => a + (o.value || 1), 0)),
        Math.round(p.xpNext), window.myPokeBot && window.myPokeBot.pacifist ? 1 : 0,
        p.moves.filter(m => m.kind === 'buff' && (m.stat === 'spd' || m.stat === 'def')).map(m => m.stat + m.lvl).join('')]); window.__springF = 0; fr = 0; fw = performance.now(); }
    const j = G.Judgment.summary();
    if ((G.Game.state === 'over' || p.dead || (j && j.time >= 60)) && !window.__done) {
      window.__done = { t: Math.round(G.Game.st.time), judg: j ? Math.round(j.time) : null, lv: p.level, kills: p.kills, bosses: p.bosses, maxHp: Math.round(p.maxHp),
        moves: p.moves.map(m => m.id + ':' + m.lvl + (m.evolved ? '*' : '') + '=' + Math.round((m.dealt || 0) / 1000) + 'k').join(','), stats: Object.assign({}, p.statsTaken || {}), item: p.item || null, groups: p.slots.map(g => g.map(m => m.id).join('+')).join(' | '),
        dmgBy: window.__dmg.reduce((m, d) => { m[d.src] = (m[d.src] || 0) + d.lost; return m; }, {}),
        last: window.__dmg.slice(-5), ter: window.__ter.slice(-8), stuckN: window.__stuckN, tl: window.__tl, hzHits: window.__dmg.filter(d => d.src === 'HAZARD').map(d => Object.assign({ t: d.t, lost: d.lost, hp: d.hp }, d.hz || {})), stuck: window.__stuck.slice(-12) };
    }
    if (!window.__done) requestAnimationFrame(tick); };
  requestAnimationFrame(tick); return 'ok'; })()`;

let tabFails = 0;
for (let k = 0, retried = false; k < +n; k++) {
  let T;
  try { T = await openTab(); tabFails = 0; }
  catch (e) {   // Chrome no responde: tras 3 intentos se deja (el que lanza la tanda lo verá en el log)
    console.log(label, 'no se pudo abrir pestaña:', e.message);
    if (++tabFails >= 3) { console.log(label, 'Chrome no responde, salgo'); process.exit(2); }
    k--; await sleep(10000); continue;
  }
  const rec = { label, port: +port, dex: +dex, mode, k, started: new Date().toISOString() };
  try {
    await T.send('Page.navigate', { url: 'http://localhost:8765/dev.html?dev' });
    let ready = false;
    for (let w = 0; w < 150 && !ready; w++) { await sleep(1000); ready = (await T.ev(`typeof G === 'object' && !!G.Game && !!G.Judgment && !!G.DB && !!G.DB.playAsGuest && !!document.getElementById('tap-start')`)) === true; }
    if (!ready) throw new Error('page never ready');
    await sleep(1500);
    const s = await T.ev(SETUP);
    if (s !== 'ok') throw new Error('setup: ' + String(s).slice(0, 150));
    const t0 = Date.now();
    for (;;) {
      await sleep(5000);
      const d = await T.ev(`window.__done ? JSON.stringify(window.__done) : ''`);
      if (d && d !== 'TIMEOUT' && !String(d).startsWith('ERR')) { Object.assign(rec, JSON.parse(d)); break; }
      // 80 min de reloj: con 3 partidas a la vez el juego va más lento que el reloj y una partida que llega a la
      // Sentencia (30:00 + 60 s) puede pasar de 40 min. Antes de cortar se apunta dónde iba (21-10-2026: se cortó una sin saber si vivía)
      if (Date.now() - t0 > 80 * 60000) {
        rec.error = 'timeout 80 min';
        const snap = await T.ev(`JSON.stringify({ t: Math.round(G.Game.st.time), state: G.Game.state, lv: G.Game.player.level, hp: Math.round(G.Game.player.hp), dead: !!G.Game.player.dead, judg: G.Judgment.active })`);
        try { rec.snapshot = JSON.parse(snap); } catch (e) { rec.snapshot = String(snap).slice(0, 120); }
        break;
      }
    }
  } catch (e) { rec.error = String(e.message || e); }
  rec.pageErrors = T.errs.slice(0, 2);
  await T.close();
  // La página no llegó a cargar (máquina ocupada): se repite esa partida una vez
  if (rec.error && /never ready|setup/.test(rec.error) && !retried) { retried = true; k--; console.log(label, 'retry after', rec.error); await sleep(10000); continue; }
  retried = false;
  fs.appendFileSync(out, JSON.stringify(rec) + '\n');
  lastProgress = Date.now();
  console.log(label, k, rec.error ? 'ERROR ' + rec.error : `survived ${rec.t}s lv${rec.lv} judg=${rec.judg}`);
}
process.exit(0);
