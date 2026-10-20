import { tab, sleep } from './cdp.lib.mjs';
const [,, port, trials, mode] = process.argv;
const A = await tab(+(port || 9337));
for (let n = 0; n < +(trials || 4); n++) {
  await A.go('http://localhost:8765/dev.html?dev', 8000);
  await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
  await A.ev(`(()=>{ document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = 3718; G.DB.save.owned[3718] = { at: 1 }; G.Boost.paused = false; ${mode === 'bot' ? "G.Boost.debugAs('BCT', null, false, true);" : "G.Boost.debugAs('BCT', null, true);"} G.UI.hideAll(); G.Game.startRun(); window.__POKE_BOT_ON__ = true; return 1; })()`);
  for (let w = 0; w < 20 && !(await A.ev(`!!G.Game.player && G.Game.state === 'playing'`)); w++) await sleep(500);
  await sleep(25000);
  const found = await A.ev(`(()=>{ const p = G.Game.player; for (const r of [900, 1800, 3000, 5000]) { const c = G.World.specialsNear(p.x, p.y, r).find(o => o.type === 'bigchest' && !(o.open > 0)); if (c) { const o = { x: c.x + 120, y: c.y + 10, r: p.r }; G.World.collide(o); p.x = o.x; p.y = o.y; G.Camera.x = p.x; G.Camera.y = p.y; window.__bc = { x: c.x, y: c.y }; return 'bigchest at ' + Math.round(c.x) + ',' + Math.round(c.y); } } return 'none'; })()`);
  if (found === 'none') { console.log('trial', n + 1, 'no big chest found'); continue; }
  const log = []; let opened = null;
  for (let i = 0; i < 48; i++) {
    await sleep(250);
    const o = JSON.parse(await A.ev(`(()=>{ const p = G.Game.player, c = window.__bc; const obj = G.World.specialsNear(c.x, c.y, 40).find(o => o.type === 'bigchest' && Math.abs(o.x - c.x) < 1 && Math.abs(o.y - c.y) < 1); const s = window.__POKE_STATE__; const inState = !!(s && (s.specials || []).some(o => o.type === 'bigchest' && Math.abs(o.x - c.x) < 1)); return JSON.stringify({ exists: !!obj, open: obj ? +(obj.open || 0).toFixed(1) : -1, d: Math.round(Math.hypot(c.x - p.x, c.y - p.y)), en: G.EnemyMgr.all().filter(e => !e.dead && Math.hypot(e.x - c.x, e.y - c.y) < 90).length, hp: Math.round(p.hp / p.maxHp * 100), inState, dir: window.myPokeBot && window.myPokeBot.lastDir, st: G.Game.state, rift: !!G.Rift.rift }); })()`));
    log.push(o);
    if (!o.exists) { opened = (i + 1) * 0.25; break; }
  }
  console.log(`trial ${n + 1}: ${found} -> ${opened ? 'OPENED after ' + opened + ' s' : 'NOT opened in 12 s'}`);
  if (!opened) for (const o of log.filter((o, i) => i % 6 === 0)) console.log('    ' + JSON.stringify(o));
  await A.ev(`window.__POKE_BOT_ON__ = false; try { G.Game.quit(); } catch (e) {} 1`);
}
console.log('errors:', A.errs.slice(0, 3).join(' || ') || 'none');
A.close(); process.exit(0);
