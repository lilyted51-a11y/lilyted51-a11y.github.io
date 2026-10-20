import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(9337);
for (let n = 0; n < 5; n++) {
  await A.go('http://localhost:8765/dev.html?dev', 8000);
  await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
  await A.ev(`(()=>{ document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = 3718; G.DB.save.owned[3718] = { at: 1 }; G.Boost.paused = false; G.Boost.debugAs('CHESTT', null, true); G.UI.hideAll(); G.Game.startRun(); window.__POKE_BOT_ON__ = true; return 1; })()`);
  for (let w = 0; w < 20 && !(await A.ev(`!!G.Game.player && G.Game.state === 'playing'`)); w++) await sleep(500);
  await sleep(25000);   // build up attacks and let enemies come
  const found = await A.ev(`(()=>{ const p = G.Game.player; for (const r of [600, 1200, 2400]) { const c = G.World.propsInCircle(p.x, p.y, r).find(o => o.type === 'chest' && o.solid && o.hp > 0); if (c) { const o = { x: c.x + 100, y: c.y + 20, r: p.r }; G.World.collide(o); p.x = o.x; p.y = o.y; G.Camera.x = p.x; G.Camera.y = p.y; window.__c = { x: c.x, y: c.y }; return 'chest at ' + Math.round(c.x) + ',' + Math.round(c.y); } } return 'none'; })()`);
  if (found === 'none') { console.log('trial', n + 1, 'no small chest found'); continue; }
  let broke = null, minD = 1e9, en = 0, seenT = false;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    const o = JSON.parse(await A.ev(`(()=>{ const p = G.Game.player, c = window.__c; const still = G.World.propsInCircle(c.x, c.y, 6).some(o => o.type === 'chest' && o.solid && o.hp > 0); return JSON.stringify({ still, d: Math.round(Math.hypot(c.x - p.x, c.y - p.y)), en: G.EnemyMgr.all().filter(e => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 150).length, tgtChest: !!(p.target && p.target.type === 'chest') }); })()`));
    minD = Math.min(minD, o.d); en = Math.max(en, o.en); if (o.tgtChest) seenT = true;
    if (!o.still) { broke = (i + 1) * 0.25; break; }
  }
  console.log(`trial ${n + 1}: ${found} tgtChestSeen=${seenT} -> ${broke ? 'BROKEN after ' + broke + ' s' : 'NOT broken in 10 s'} | closest ${minD} px | max enemies within 150 px: ${en}`);
  await A.ev(`window.__POKE_BOT_ON__ = false; try { G.Game.quit(); } catch (e) {} 1`);
}
console.log('errors:', A.errs.slice(0, 3).join(' || ') || 'none');
A.close(); process.exit(0);
