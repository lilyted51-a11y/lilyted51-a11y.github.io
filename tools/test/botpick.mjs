import { tab, sleep } from './cdp.lib.mjs';
// Bot card choice with a clearly physical Pokémon (Machamp) and a clearly special one (Alakazam).
const A = await tab(9333);
for (const dex of [68, 65]) {
  await A.go('http://localhost:8765/dev.html?dev', 8000);
  await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
  await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = ${dex}; G.DB.save.owned[${dex}] = { at: 1 }; G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.UI.hideAll(); G.Game.startRun(); G.Game.debugSpeed(2); window.__POKE_BOT_ON__ = true; 1`);
  // record every offer the bot sees and what it ends up with
  await A.ev(`window.__offers = []; setInterval(() => { if (G.UI.isOpen('scr-levelup') && !document.getElementById('cards').classList.contains('guard')) { const k = [...document.querySelectorAll('#cards .card')].map(c => c.dataset.key + ':' + (c.dataset.cat || '-') + ':' + (c.querySelector('.fit-low') ? 'LOW' : 'ok')).join(' '); if (window.__offers[window.__offers.length - 1] !== k) window.__offers.push(k); } }, 150); 1`);
  for (let i = 0; i < 50; i++) { await sleep(2000); const st = await A.ev(`G.Game.state`); if (st === 'over') break; }
  const r = await A.ev(`(()=>{ const p = G.Game.player; return JSON.stringify({ mon: p.mon.name, pa: p.mon.pa, sa: p.mon.sa, lv: p.level, moves: p.moves.map(m => m.name + '(' + (m.cat || 'buff') + ' fit ' + G.Stats.fit(p.mon, m.cat).toFixed(2) + ')'), lowOffered: window.__offers.filter(o => o.includes('LOW')).length, offers: window.__offers.length }); })()`);
  console.log(r);
  const o = JSON.parse(r);
  const weak = o.moves.filter(m => / fit 0\.[0-8]/.test(m));
  console.log(weak.length ? '  WEAK MOVES PICKED: ' + weak.join(', ') : '  no weak-side moves picked');
  await A.ev(`try { G.Game.quit(); } catch (e) {} 1`); await sleep(1000);
}
console.log('errors:', A.errs.slice(0, 3).join(' || ') || 'none');
A.close(); process.exit(0);
