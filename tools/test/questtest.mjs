import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(9333);
await A.go('http://localhost:8765/dev.html?dev', 8000);
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
const start = async () => {
  await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = 25; G.DB.save.owned[25] = { at: 1 }; G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.UI.hideAll(); G.Game.startRun(); window.__POKE_BOT_ON__ = true; 1`);
  await sleep(4000);
  await A.ev(`G.Game.player.addMaxHp(5000); G.Game.player.heal(99999); 1`);
};
const res = {};
// 1) XP pickups: clear enemies, drop 12 gems in a ring at 260 px, see how many get collected in 6 s
await start();
await A.ev(`(()=>{ for (const e of G.EnemyMgr.all()) { e.hp = 0; e.dead = true; } G.Pickups.clear && G.Pickups.clear(); const p = G.Game.player; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; G.Pickups.dropXp(p.x + Math.cos(a) * 260, p.y + Math.sin(a) * 220, 5); } window.__ring = G.Pickups.all().filter(i => i.kind === 'xp' || i.kind === 'xpBig').slice(-12); return 1; })()`);
const n0 = await A.ev(`window.__ring.filter(i => G.Pickups.all().includes(i)).length`);
await sleep(6000);
const n1 = await A.ev(`window.__ring.filter(i => G.Pickups.all().includes(i)).length`);
await sleep(6000);
const n2 = await A.ev(`window.__ring.filter(i => G.Pickups.all().includes(i)).length`);
console.log(`XP: ${n0} gems at 260 px -> ${n1} left after 6 s, ${n2} after 12 s (new drops from kills count too)`);
// 2) Treasure thief: 3 tries, killed within its 15 s?
let caught = 0;
for (let k = 0; k < 3; k++) {
  await A.ev(`G.Events.debugThief(); 1`); await sleep(300);
  const info = await A.ev(`(()=>{ const t = G.EnemyMgr.all().find(e => e.behavior === 'thief' && !e.dead); const p = G.Game.player; return t ? t.def.name + ' at ' + Math.round(Math.hypot(t.x - p.x, t.y - p.y)) + ' px' : 'none'; })()`);
  let ok = false; const t0 = Date.now();
  const tid = await A.ev(`(G.EnemyMgr.all().find(e => e.behavior === 'thief' && !e.dead) || {}).id`);
  for (let i = 0; i < 17; i++) { await sleep(1000); const st = await A.ev(`(()=>{ const t = G.EnemyMgr.all().find(e => e.id === ${JSON.stringify(tid)}); return !t ? 'gone' : t.dead ? (t.life > 0 ? 'caught' : 'escaped') : 'alive'; })()`); if (st !== 'alive') { ok = st; break; } }
  const killed = ok && (await A.ev(`(G.Game.player.kills || 0)`)) >= 0;
  console.log(`thief ${k + 1}: ${info} -> ${ok || 'still alive after 17 s'} after ${Math.round((Date.now() - t0) / 1000)} s`);
  if (ok) caught++;
  await sleep(1000);
}
// 3) Lost Pokémon: rescued?
await A.ev(`G.Events.debugStart('lost'); 1`); await sleep(500);
console.log('lost start:', await A.ev(`JSON.stringify(G.Events.lostInfo)`), '| dist to it:', await A.ev(`(()=>{ const L = G.Events.lostInfo, p = G.Game.player; return L ? Math.round(Math.hypot(L.x - p.x, L.y - p.y)) + ' / marker ' + Math.round(Math.hypot(L.tx - L.x, L.ty - L.y)) : '-'; })()`));
let rescued = false;
for (let i = 0; i < 60; i++) {
  await sleep(1000);
  const L = JSON.parse(await A.ev(`JSON.stringify(G.Events.lostInfo)`));
  if (i % 5 === 0) console.log(`  t+${i}s`, L ? `${L.state} mine=${L.mine} hp=${L.hp} toMarker=${Math.round(Math.hypot(L.tx - L.x, L.ty - L.y))}` : 'ended', '|', await A.ev(`(()=>{ const p = G.Game.player, L = G.Events.lostInfo; return 'game=' + G.Game.state + ' screens=' + [...document.querySelectorAll('section.scr')].filter(x => !x.classList.contains('hidden')).map(x => x.id).join(',') + ' me->lost=' + (L ? Math.round(Math.hypot(L.x - p.x, L.y - p.y)) : '-') + ' dir=' + window.myPokeBot.lastDir + ' botState=' + !!window.__POKE_STATE__; })()`));
  if (!L) { rescued = true; break; }
}
console.log('lost Pokémon:', rescued ? 'event ended (rescued or failed — see banner)' : 'not finished in 60 s', '| banner:', await A.ev(`(G.Spawner.banner() || {}).text || ''`));
await A.ev(`window.__POKE_BOT_ON__ = false; G.Game.quit(); 1`);
console.log('errors:', A.errs.slice(0, 3).join(' || ') || 'none');
A.close(); process.exit(0);
