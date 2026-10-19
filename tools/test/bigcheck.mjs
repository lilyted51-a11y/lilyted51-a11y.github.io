import { tab, sleep } from './cdp.lib.mjs';
const B = await tab(9334);
await B.go('http://localhost:8765/dev.html?dev', 8000);
await B.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1500);
await B.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.Flow.afterLogin(); 1`); await sleep(5000);
await B.ev(`(()=>{ const n = document.getElementById('scr-savenote'); for (let i = 0; i < 3 && n && !n.classList.contains('hidden'); i++) document.getElementById('savenote-ok').click(); return 1; })()`);
const partner0 = await B.ev(`G.DB.save.partner + ':' + !!G.DB.save.partnerShiny`);
for (const dex of [1384, 4890, 1890, 130, 25]) {
  const r = await B.ev(`(()=>{ if (!G.DEX_BY[${dex}]) return 'no dex ${dex}'; G.DB.save.partner = ${dex}; G.UI.hideAll(); G.Game.startRun(); const p = G.Game.player; const out = p.mon.name + ': scale=' + p.scale + ' r=' + p.r.toFixed(1) + ' bodyH=' + p.bodyH.toFixed(1) + ' rawR=' + G.Sprites.bodyRadius(${dex}).toFixed(1); G.Game.quit(); return out; })()`);
  console.log(r); await sleep(1200);
}
await B.ev(`G.DB.save.partner = ${JSON.stringify(partner0.split(':')[0])} | 0; 1`);
console.log('restored partner:', await B.ev(`G.DB.save.partner`), '(was ' + partner0 + ')');
console.log('errors:', B.errs.slice(0, 3).join(' || ') || 'none');
B.close(); process.exit(0);
