import { tab, sleep } from './cdp.lib.mjs';
const [,, port, dex, speed, trials] = process.argv;
const A0 = await tab(+port);
// Copia local: si la página se cuelga, una evaluación no debe bloquear la prueba para siempre.
const ev0 = A0.ev;
const A = Object.assign(A0, { ev: e => Promise.race([ev0(e), new Promise(r => setTimeout(() => r('TIMEOUT'), 20000))]) });
const out = [];
for (let n = 0; n < +(trials || 1); n++) {
  await A.go('http://localhost:8765/dev.html?dev', 8000);
  await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
  await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = ${dex}; G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.UI.hideAll(); G.Game.startRun(); G.Game.debugSpeed(${speed}); 1`); await sleep(1500);
  await A.ev(`G.Game.player.addMaxHp(200); 1`); await sleep(5000);
  await A.ev(`G.Judgment.debugStart(); 1`);
  let lastT = 0, touches = 0, lastHp = -1, wallT = 0, samples = 0;
  for (let i = 0; i < 400; i++) {
    await sleep(1000);
    const r = await A.ev(`(()=>{ const j = G.Judgment.summary(); const p = G.Game.player; const a = G.Judgment.arceus; return JSON.stringify({ st: G.Game.state, t: j ? Math.round(j.time) : 0, hp: Math.round(p.hp), dist: a ? Math.round(Math.hypot(a.x - p.x, a.y - p.y)) : null, edge: a ? Math.round(a.max - Math.hypot(p.x - a.cx, p.y - a.cy)) : null }); })()`);
    if (r === 'TIMEOUT' || typeof r !== 'string') { console.log('trial', n + 1, 'eval timeout, aborting trial'); break; }
    const o = JSON.parse(r);
    if (o.t) { lastT = o.t; samples++; if (o.edge !== null && o.edge < 40) wallT++; if (lastHp >= 0 && o.hp < lastHp - 30) touches++; lastHp = o.hp; }
    if (o.st === 'over') break;
    if (lastT >= 300) break;
  }
  out.push({ dex: +dex, survived: lastT, hits: touches, wallPct: samples ? Math.round(100 * wallT / samples) : 0 });
  console.log('trial', n + 1, JSON.stringify(out[out.length - 1]));
  await A.ev(`try { G.Game.quit(); } catch (e) {} 1`); await sleep(1500);
}
console.log('SUMMARY', JSON.stringify(out), 'errors:', A.errs.slice(0, 2).join(' || ') || 'none');
A.close(); process.exit(0);
