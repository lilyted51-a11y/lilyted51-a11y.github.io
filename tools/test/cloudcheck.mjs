import { tab, sleep } from './cdp.lib.mjs';
import fs from 'node:fs';
const ids = JSON.parse(fs.readFileSync('C:/Ted-Temp/Ted/pokesurvivor-main/tools/cache/forms_added.json', 'utf8')).concat([1800]);
const B = await tab(9334);
await B.go('http://localhost:8765/dev.html?dev', 8000);
await B.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1500);
await B.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.Flow.afterLogin(); 1`); await sleep(6000);
const check = () => B.ev(`(async()=>{ const d = (await G.DB.fb.fs.collection('saves').doc(G.DB.fb.uid).get()).data(); const sv = d.save; const ok = ${JSON.stringify(ids)}.filter(x => sv.owned[x] && sv.shiny[x]).length; const up = ${JSON.stringify(ids)}.filter(x => sv.pupg && sv.pupg[x] && Object.keys(sv.pupg[x]).length >= 5).length; return 'cloud owned+shiny ' + ok + '/' + ${ids.length} + ' maxed ' + up + ' sync=' + G.DB.syncState + ' v=' + d.v; })()`);
console.log('at login:', await check());
if (!(await check()).includes('owned+shiny ' + ids.length + '/')) {
  console.log('re-grant:', await B.ev(`(()=>{ for (const d of ${JSON.stringify(ids)}) { G.DB.grantShiny(d, 'gift'); const u = G.DB.upgradesOf(d); for (const x of G.Upgrades.LIST) u[x.id] = x.max; } G.DB.commit(true); return 'ok'; })()`));
  for (let i = 0; i < 12; i++) { await sleep(5000); const s = await B.ev(`G.DB.syncState`); console.log('  sync:', s); if (s === 'ok') break; await B.ev(`G.DB.flush(); 1`); }
  console.log('after:', await check());
}
console.log('warnings:', B.errs.slice(0,4).join(' || ') || 'none'); B.close(); process.exit(0);
