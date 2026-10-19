import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(9333);
await A.go('http://localhost:8765/dev.html?dev', 8000);
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = 68; G.DB.save.owned[68] = { at: 1 }; G.UI.hideAll(); G.Game.startRun(); 1`); await sleep(1500);
await A.ev(`(()=>{ const p = G.Game.player; p.addMove('shadow-ball'); return p.moves.map(m => m.id).join(','); })()`);
for (let i = 0; i < 4; i++) {
  await A.ev(`G.RunUI.showLevelUp(5, G.LevelUp.offer(G.Game.player), () => {}); 1`); await sleep(900);
  console.log(await A.ev(`[...document.querySelectorAll('#cards .card')].map(c => '[' + c.querySelector('.nm').innerText.split(String.fromCharCode(10)).join(' ') + '] ' + c.querySelector('.ds').innerText.split(String.fromCharCode(10)).join(' ')).join(' || ')`));
  console.log('---');
}
console.log('errors:', A.errs.slice(0, 3).join(' || ') || 'none');
A.close(); process.exit(0);
