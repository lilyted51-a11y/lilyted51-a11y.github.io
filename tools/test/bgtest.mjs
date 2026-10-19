import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(9333);
await A.go('http://localhost:8765/dev.html?dev', 8000);
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
// Simulated "tab hidden": document.hidden = true, visibilitychange fires, and requestAnimationFrame stops (like a real hidden tab)
await A.ev(`(()=>{ let hid = false; const realRAF = window.requestAnimationFrame.bind(window); const q = [];
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hid });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => hid ? 'hidden' : 'visible' });
  window.requestAnimationFrame = cb => hid ? (q.push(cb), q.length) : realRAF(cb);
  window.__setHidden = h => { hid = h; document.dispatchEvent(new Event('visibilitychange')); if (!h) { const cbs = q.splice(0); for (const cb of cbs) realRAF(cb); } };
  let n = 0; const count = () => { n++; realRAF(count); }; realRAF(count); window.__rafCount = () => n;
  return 1; })()`);
await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = 25; G.DB.save.owned[25] = { at: 1 }; G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.UI.hideAll(); G.Game.startRun(); 1`); await sleep(1500);
const snap = () => A.ev(`(()=>{ const p = G.Game.player; return JSON.stringify({ st: G.Game.state, t: +G.Game.st.time.toFixed(1), lv: p.level, x: Math.round(p.x), y: Math.round(p.y), kills: p.kills }); })()`);

// --- 1) bot ON, tab hidden for 12 s
await A.ev(`window.__POKE_BOT_ON__ = true; 1`); await sleep(3000);
const s0 = JSON.parse(await snap());
await A.ev(`window.__setHidden(true); 1`);
const w0 = Date.now(); await sleep(12000);
const s1 = JSON.parse(await snap()); const wall = (Date.now() - w0) / 1000;
console.log('bot ON, hidden 12 s :', JSON.stringify(s0), '->', JSON.stringify(s1));
console.log(`   game time advanced ${(s1.t - s0.t).toFixed(1)} s in ${wall.toFixed(1)} s real | moved ${Math.round(Math.hypot(s1.x - s0.x, s1.y - s0.y))} px | levels ${s0.lv}->${s1.lv} | kills ${s0.kills}->${s1.kills} | paused? ${s1.st === 'paused'}`);
// --- back to visible: speed must be normal (no double loop)
await A.ev(`window.__setHidden(false); 1`); await sleep(1000);
const r0 = await A.ev(`window.__rafCount()`), g0 = JSON.parse(await snap()).t; await sleep(4000);
const r1 = await A.ev(`window.__rafCount()`), g1 = JSON.parse(await snap()).t;
console.log(`visible again: game time ${(g1 - g0).toFixed(1)} s over 4 s real (should be ~4, not ~8) | state ${JSON.parse(await snap()).st}`);

// --- 2) bot OFF: hiding must pause like before
await A.ev(`window.__POKE_BOT_ON__ = false; 1`); await sleep(500);
for (let i = 0; i < 20; i++) { const st = await A.ev(`(()=>{ if (G.UI.isOpen('scr-levelup')) G.RunUI.pick(0); if (G.UI.isOpen('scr-item')) { const c = document.querySelector('#item-cards .card'); if (c) c.click(); } return G.Game.state; })()`); if (st === 'playing') break; await sleep(700); }
console.log('state before hiding (bot off):', await A.ev(`G.Game.state`));
await A.ev(`window.__setHidden(true); 1`); await sleep(3000);
const s2 = JSON.parse(await snap());
console.log('bot OFF, hidden 3 s  : state =', s2.st, '(should be paused) | pause screen open?', await A.ev(`G.UI.isOpen('scr-pause')`));
await A.ev(`window.__setHidden(false); 1`); await sleep(500);
await A.ev(`G.Game.quit(); 1`);
console.log('errors:', A.errs.slice(0, 3).join(' || ') || 'none');
A.close(); process.exit(0);
