import { createRequire } from "node:module"; const require = createRequire(import.meta.url);
import { tab, sleep } from './cdp.lib.mjs';
const PAGE = 'http://localhost:8765/dev.html?dev';
const A = await tab(9333), B = await tab(9334);   // A = tester1 guest (will fall), B = MiNG host (bot revives)
await A.go(PAGE, 8000); await B.go(PAGE, 8000);
for (const T of [A, B]) { await T.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200); await T.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.Flow.afterLogin(); 1`); }
await sleep(4000); await A.ev(`G.Social.start()`); await B.ev(`G.Social.start()`); await sleep(1500);
await A.ev(`G.Social.leaveRoom?.(); 1`); await B.ev(`G.Social.leaveRoom?.(); 1`); await sleep(1500);
await B.ev(`(async()=>{ await G.Social.createRoom({ max: 4 }); G.LobbyUI.open(); })()`); await sleep(3000);
const roomId = await B.ev(`G.Social.room.id`);
await A.ev(`(async()=>{ await G.Social.joinRoom('${roomId}', '', false); G.LobbyUI.open(); })()`); await sleep(3000);
await A.ev(`G.Social.setReady(true); 1`);
for (let i = 0; i < 10; i++) { await sleep(2500); if ((await B.ev(`document.getElementById('lobby-start').disabled`)) === false) break; }
await B.ev(`document.getElementById('lobby-start').click(); 1`); await sleep(8000);
console.log('playing:', await B.ev(`G.Game.state`), '/', await A.ev(`G.Game.state`));
// guest: bot off, stands still; host: bot on (MiNG). Guest walks 400 px away first, then dies.
await A.ev(`window.__POKE_BOT_ON__ = false; setInterval(() => { if (G.UI.isOpen("scr-levelup")) G.RunUI.pick(0); if (G.UI.isOpen("scr-item")) { const c = document.querySelector("#item-cards .card"); if (c) c.click(); } }, 400); 1`);
await B.ev(`window.__POKE_BOT_ON__ = true; G.Game.player.addMaxHp(20000); G.Game.player.heal(99999); 1`);
await A.ev(`(()=>{ const p = G.Game.player; const o = { x: p.x + 420, y: p.y, r: p.r }; G.World.collide(o); p.x = o.x; p.y = o.y; return 1; })()`); await sleep(1500);
await A.ev(`(()=>{ const p = G.Game.player; p.invuln = 0; p.hurt(999999, null, true); return p.dead; })()`); await sleep(1000);
console.log('guest dead:', await A.ev(`G.Game.player.dead`), '| host sees mate dead:', await B.ev(`JSON.stringify((window.__POKE_STATE__||{}).mates)`));
const t0 = Date.now(); let revived = false;
for (let i = 0; i < 40; i++) {
  await sleep(1000);
  const g = await A.ev(`G.Game.player.dead + ' reviveT=' + (G.Game.player.reviveT||0).toFixed(1) + ' hp=' + Math.round(G.Game.player.hp)`);
  const h = await B.ev(`(()=>{ const p = G.Game.player, m = (window.__POKE_STATE__||{}).mates||[]; return 'dist=' + (m[0] ? Math.round(Math.hypot(m[0].x-p.x, m[0].y-p.y)) : '?') + ' hostDead=' + p.dead; })()`);
  if (i % 4 === 0 || g.startsWith("false")) { console.log(`  t+${i}s guest ${g} | host ${h}`); console.log("     var:", await B.ev(`(()=>{ const b = window.myPokeBot, s0 = window.__POKE_STATE__; const run = (name, mod) => { const s = Object.assign({}, s0, mod); const ld = b.lastDir; const d = b.plan(s); const c = b.dbg.slice(); b.lastDir = ld; return name + ":" + d + "/" + Math.min(...c) + "(stay " + c[0] + ")"; }; return [run("base", {}), run("noEnemies", { enemies: [] }), run("noProj", { projectiles: [] }), run("noHaz", { hazards: [], inHazard: () => false }), run("noPick", { pickups: [] }), run("noSpecials", { specials: [], chests: [] }), run("noTarget", { player: Object.assign(Object.create(Object.getPrototypeOf(s0.player)), s0.player, { target: null }) })].join(" | "); })()`)); console.log("     dbg:", await B.ev(`(()=>{ const b = window.myPokeBot, s = window.__POKE_STATE__, p = s.player, m = s.mates[0]; const o = s.step(p.x + Math.sign(m.x-p.x)*40, p.y + Math.sign(m.y-p.y)*40); return "lastDir=" + b.lastDir + " costs=" + JSON.stringify(b.dbg) + " mateTileWalkable=" + s.walkable(Math.floor(m.x/s.TS), Math.floor(m.y/s.TS)) + " stepToward=" + Math.round(Math.hypot(o.x-p.x,o.y-p.y)) + " lineBlocked=" + b.lineBlocked(s, p.x, p.y, m.x, m.y) + " enemiesNear=" + s.enemies.filter(e=>!e.dead && Math.hypot(e.x-p.x,e.y-p.y)<200).length + " hp=" + Math.round(p.hp) + "/" + p.maxHp + " target=" + (p.target ? Math.round(Math.hypot(p.target.x-p.x,p.target.y-p.y)) : null); })()`)); if (i === 12) { const png = await B.send("Page.captureScreenshot", { format: "png" }); require("node:fs").writeFileSync("revive.png", Buffer.from(png.result.data, "base64")); } }
  if (g.startsWith('false')) { revived = true; break; }
}
console.log(revived ? 'REVIVED after ' + Math.round((Date.now() - t0) / 1000) + ' s' : 'NOT revived in 40 s');
await B.ev(`G.Game.quit(); 1`); await sleep(3000); await A.ev(`G.Game.quit(); 1`); await sleep(2000);
await B.ev(`G.Social.leaveRoom(); 1`); await A.ev(`G.Social.leaveRoom?.(); 1`);
console.log('errors A:', A.errs.join(' || ') || 'none', '| B:', B.errs.join(' || ') || 'none');
A.close(); B.close(); process.exit(0);
