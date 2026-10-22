/* spectate_auto.mjs — caído mirando a un compañero: si él cae, pasa solo al siguiente vivo (copia local)
 * A = tester1 (9337), B = MiNG (9334, anfitrión). Con dos cuentas sólo hay un compañero de verdad: se añaden dos falsos. */
import { tab, sleep } from './cdp.lib.mjs';
const PAGE = 'http://localhost:8765/dev.html?dev';
const A = await tab(9337), B = await tab(9334);
await A.go(PAGE, 8000); await B.go(PAGE, 8000);
for (const T of [A, B]) { await T.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200); await T.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.Flow.afterLogin(); 1`); }
await sleep(5000); await A.ev(`G.Social.start()`); await B.ev(`G.Social.start()`); await sleep(1500);
await A.ev(`G.Social.leaveRoom?.(); 1`); await B.ev(`G.Social.leaveRoom?.(); 1`); await sleep(1500);
await B.ev(`(async()=>{ await G.Social.createRoom({ max: 4 }); G.LobbyUI.open(); })()`); await sleep(3000);
const roomId = await B.ev(`G.Social.room.id`);
await A.ev(`(async()=>{ await G.Social.joinRoom('${roomId}', '', false); G.LobbyUI.open(); })()`); await sleep(3000);
await A.ev(`G.Social.setReady(true); 1`);
for (let i = 0; i < 10; i++) { await sleep(2500); if ((await B.ev(`document.getElementById('lobby-start').disabled`)) === false) break; }
await B.ev(`document.getElementById('lobby-start').click(); 1`); await sleep(8000);
console.log('jugando:', await B.ev(`G.Game.state`), '/', await A.ev(`G.Game.state`));
for (const T of [A, B]) await T.ev(`window.__POKE_BOT_ON__ = false; G.Game.player.addMaxHp(20000); G.Game.player.heal(99999); setInterval(() => { if (G.UI.isOpen('scr-levelup')) G.RunUI.pick(0); if (G.UI.isOpen('scr-item')) { const c = document.querySelector('#item-cards .card'); if (c) c.click(); } }, 400); 1`);
// Dos compañeros falsos vivos (copias del de verdad), lejos
await A.ev(`(()=>{ const real = G.Coop.puppets; const mate = real()[0]; const mk = (uid, tag, dx) => { const g = Object.create(Object.getPrototypeOf(mate)); Object.assign(g, mate, { uid, tag, dead: false, x: mate.x + dx, y: mate.y }); g.net = Object.assign({}, mate.net, { dead: 0, x: mate.x + dx, y: mate.y }); g.netUpdate = () => {}; return g; };
  window.__g1 = mk('g1', 'Uno', 700); window.__g2 = mk('g2', 'Dos', -700); window.__real = real; G.Coop.puppets = () => [window.__g1, window.__g2].concat(real()); return 1; })()`);
await A.ev(`(()=>{ const p = G.Game.player; p.invuln = 0; p.hurt(999999, null, true); return p.dead; })()`); await sleep(2000);
const spec = () => A.ev(`(()=>{ const s = G.Game.spectating; return s ? s.tag + (s.dead ? ' (caído)' : '') : null; })()`);
console.log('caído, mira a:', await spec());
await A.ev(`window.__g1.dead = true; window.__g1.net.dead = 1; 1`); await sleep(1500);
console.log('«Uno» cae → mira a:', await spec(), '(esperado: Dos)');
// A mano a un caído: se queda
await A.ev(`G.Game.cycleWatch(-1); 1`); await sleep(1200);
console.log('a mano al anterior → mira a:', await spec(), '(esperado: Uno (caído), y se queda)');
await sleep(1500); console.log('1,5 s después:', await spec());
console.log('errores A:', A.errs.slice(0, 3).join(' || ') || 'ninguno');
await A.ev(`G.Coop.puppets = window.__real; 1`);
await B.ev(`G.Game.quit(); 1`); await sleep(3000); await A.ev(`G.Game.quit(); 1`); await sleep(2000);
await A.ev(`G.Social.leaveRoom(); 1`); await B.ev(`G.Social.leaveRoom(); 1`); await sleep(1000);
A.close(); B.close(); process.exit(0);
