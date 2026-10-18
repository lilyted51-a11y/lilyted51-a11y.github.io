import { tab, sleep } from './cdp.lib.mjs';
const [,, speed, trials] = process.argv;
const A = await tab(9333);
for (let n = 0; n < +(trials || 1); n++) {
  await A.go('http://localhost:8765/dev.html?dev', 8000);
  await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
  await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = 393; G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.UI.hideAll(); G.Game.startRun(); G.Game.debugSpeed(${speed || 2}); 1`); await sleep(1500);
  await A.ev(`G.Game.player.addMaxHp(200); 1`); await sleep(5000);
  // in-page sampler (every 0.5 s of game time via rAF) + damage log
  await A.ev(`(()=>{ const p = G.Game.player; window.__dmg = []; window.__smp = []; const orig = p.hurt.bind(p); p.hurt = (amount, type, pure) => { const hp0 = p.hp; const r = orig(amount, type, pure); const j = G.Judgment.summary(); const a = G.Judgment.arceus; const near = G.EnemyMgr.all().filter(e => !e.dead && (e.boss || e.legend || e.judge)).map(e => (e.def && e.def.name || '?') + '@' + Math.round(Math.hypot(e.x - p.x, e.y - p.y))).slice(0, 3); const hz = (G.Hazards.all || []).filter(h => Math.hypot(h.x - p.x, h.y - p.y) < (h.r || 40) + 10).length; window.__dmg.push({ t: j ? +j.time.toFixed(1) : -1, lost: Math.round(hp0 - p.hp), hp: Math.round(p.hp), type: pure ? 'ARCEUS-TOUCH/pure' : type, arc: a ? Math.round(Math.hypot(a.x - p.x, a.y - p.y)) : null, cast: a ? a.casting : null, near, hz }); return r; };
    let last = -1; const tick = () => { const j = G.Judgment.summary(); if (j && G.Game.state === 'playing' && j.time - last >= 0.5) { last = j.time; const a = G.Judgment.arceus; const bosses = G.EnemyMgr.all().filter(e => !e.dead && (e.boss || e.legend || e.judge)); const nb = bosses.map(e => Math.round(Math.hypot(e.x - p.x, e.y - p.y))).sort((x, y) => x - y)[0]; window.__smp.push([+j.time.toFixed(1), Math.round(p.hp), a ? Math.round(Math.hypot(a.x - p.x, a.y - p.y)) : -1, a && a.casting ? 1 : 0, a ? Math.round(a.max - Math.hypot(p.x - a.cx, p.y - a.cy)) : -1, bosses.length, nb === undefined ? -1 : nb, myPokeBot.lastDir]); } if (G.Game.state !== 'over') requestAnimationFrame(tick); }; requestAnimationFrame(tick); return 1; })()`);
  await A.ev(`G.Judgment.debugStart(); 1`);
  let lastT = 0;
  for (let i = 0; i < 400; i++) {
    await sleep(1000);
    const o = JSON.parse(await A.ev(`(()=>{ const j = G.Judgment.summary(); return JSON.stringify({ st: G.Game.state, t: j ? Math.round(j.time) : 0 }); })()`));
    if (o.t) lastT = o.t;
    if (o.st === 'over' || lastT >= 240) break;
  }
  const dmg = JSON.parse(await A.ev(`JSON.stringify(window.__dmg.filter(d => d.t >= 0))`));
  const smp = JSON.parse(await A.ev(`JSON.stringify(window.__smp.slice(-28))`));
  console.log('=== trial', n + 1, 'survived', lastT, '| damage events:', dmg.length);
  console.log('by type:', JSON.stringify(dmg.reduce((m, d) => { m[d.type || 'none'] = (m[d.type || 'none'] || 0) + d.lost; return m; }, {})));
  for (const d of dmg.slice(-6)) console.log('  dmg', JSON.stringify(d));
  console.log('  samples [t, hp, arcDist, casting, edgeGap, bosses, nearestBoss, dir] last 14 s:');
  for (const s of smp) console.log('   ', JSON.stringify(s));
  await A.ev(`try { G.Game.quit(); } catch (e) {} 1`); await sleep(1500);
}
console.log('errors:', A.errs.slice(0, 2).join(' || ') || 'none'); A.close(); process.exit(0);
