import { tab, sleep } from './cdp.lib.mjs';
const [,, port, trials] = process.argv;
const A = await tab(+(port || 9335));
for (let n = 0; n < +(trials || 2); n++) {
  await A.go('http://localhost:8765/dev.html?dev', 8000);
  await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
  await A.ev(`(()=>{ document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); const s = G.DB.save; s.partner = 3386; s.owned[3386] = { at: 1 }; const u = G.DB.upgradesOf(3386); for (const x of G.Upgrades.LIST) u[x.id] = x.max; G.Boost.paused = false; G.Boost.debugAs('BENCH30', null, true); G.UI.hideAll(); G.Game.startRun(); window.__POKE_BOT_ON__ = true; return 1; })()`);
  await sleep(20000);   // play a bit to get some moves
  await A.ev(`G.Game.player.addMaxHp(400); G.Game.player.heal(9999); G.Game.debugTime(1792); 1`);
  const rows = [];
  let lastPos = null;
  for (let i = 0; i < 160; i++) {
    await sleep(250);
    const r = JSON.parse(await A.ev(`(()=>{ const p = G.Game.player, a = G.Judgment.arceus, b = window.myPokeBot; return JSON.stringify({ t: +G.Game.st.time.toFixed(1), st: G.Game.state, cine: !!G.Judgment.cinematic, act: G.Judgment.active, fight: !!a, x: Math.round(p.x), y: Math.round(p.y), hp: Math.round(p.hp), arc: a ? Math.round(Math.hypot(a.x - p.x, a.y - p.y)) : null, k: a ? +a.k.toFixed(2) : null, dir: b ? b.lastDir : null, keys: b ? Object.entries(b.currentKeys).filter(k => k[1]).map(k => k[0].replace('Key', '')).join('') : '', axis: G.Input.axis().map(v => +v.toFixed(1)).join('/'), spd: Math.round(p.spd), frozen: !!p.frozen, scr: [...document.querySelectorAll('section.scr')].filter(s => !s.classList.contains('hidden')).map(s => s.id).join(','), botState: !!window.__POKE_STATE__, botArc: !!(window.__POKE_STATE__ && window.__POKE_STATE__.arceus) }); })()`));
    r.mv = lastPos ? Math.round(Math.hypot(r.x - lastPos[0], r.y - lastPos[1])) : 0; lastPos = [r.x, r.y];
    rows.push(r);
    if (r.st === 'over') break;
  }
  const fightRows = rows.filter(r => r.fight || r.act);
  console.log(`=== trial ${n + 1}: ended state=${rows[rows.length - 1].st} at t=${rows[rows.length - 1].t}`);
  for (const r of rows.filter((r, i) => r.act && (i % 2 === 0 || r.arc !== null && r.arc < 120)).slice(0, 70)) console.log('  ' + JSON.stringify(r));
}
console.log('errors:', A.errs.slice(0, 3).join(' || ') || 'none');
A.close(); process.exit(0);
