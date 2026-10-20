import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(9336);
for (let n = 0; n < 3; n++) {
  await A.go('http://localhost:8765/dev.html?dev', 8000);
  await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
  await A.ev(`(()=>{ document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = 25; G.DB.save.owned[25] = { at: 1 }; G.Boost.paused = false; G.Boost.debugAs('RIFTT', null, false, true); G.UI.hideAll(); G.Game.startRun(); window.__POKE_BOT_ON__ = true; return 1; })()`);
  for (let w = 0; w < 20 && !(await A.ev(`!!G.Game.player && G.Game.state === 'playing'`)); w++) await sleep(500);
  await sleep(1500);
  // find a big chest somewhere and stand next to it
  const found = await A.ev(`(()=>{ const p = G.Game.player; for (const r of [800, 1600, 2600, 4000]) { const c = G.World.specialsNear(p.x, p.y, r).find(o => o.type === 'bigchest' && !(o.open > 0) && !o.done); if (c) { const o = { x: c.x + 110, y: c.y, r: p.r }; G.World.collide(o); p.x = o.x; p.y = o.y; G.Camera.x = p.x; G.Camera.y = p.y; window.__chest = c; return 'chest at ' + Math.round(c.x) + ',' + Math.round(c.y); } } return 'none'; })()`);
  if (found === 'none') { console.log('trial', n + 1, ': no big chest found'); continue; }
  await A.ev(`(()=>{ for (const e of G.EnemyMgr.all()) { e.hp = 0; e.dead = true; } return 1; })()`);
  await sleep(600);
  await A.ev(`G.Rift.debugOpen(); 1`); await sleep(300);
  const r0 = await A.ev(`(()=>{ const r = G.Rift.rift, p = G.Game.player; return r ? 'rift ' + Math.round(Math.hypot(r.x - p.x, r.y - p.y)) + ' px away, ttl ' + Math.round(r.ttl || r.t || 0) : 'no rift'; })()`);
  let entered = null, flips = 0, lastSide = null;
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    const raw = await A.ev(`(()=>{ const p = G.Game.player, r = G.Rift.rift, c = window.__chest; return JSON.stringify({ arena: !!G.Rift.inArena, dr: r ? Math.round(Math.hypot(r.x - p.x, r.y - p.y)) : null, dc: Math.round(Math.hypot(c.x - p.x, c.y - p.y)), open: +(c.open || 0).toFixed(2) }); })()`);
    if (typeof raw !== "string" || raw.startsWith("ERR")) { console.log("eval:", String(raw).slice(0, 200)); break; }
    const o = JSON.parse(raw);
    if (o.arena) { entered = (i + 1) * 0.25; break; }
    const side = o.dc < (o.dr ?? 1e9) ? 'chest' : 'rift';
    if (lastSide && side !== lastSide) flips++;
    lastSide = side;
  }
  console.log(`trial ${n + 1}: ${found}, ${r0} -> ${entered ? 'ENTERED RIFT after ' + entered + ' s' : 'did not enter rift in 15 s'} | side flips ${flips}`);
  await A.ev(`window.__POKE_BOT_ON__ = false; try { G.Game.quit(); } catch (e) {} 1`);
}
console.log('errors:', A.errs.slice(0, 3).join(' || ') || 'none');
A.close(); process.exit(0);
