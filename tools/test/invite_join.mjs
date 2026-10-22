/* invite_join.mjs — con tu sala abierta, aceptar la invitación de otro (ventana de abajo a la derecha) (copia local)
 * A = tester1 (9337), B = MiNG (9334). */
import { tab, sleep } from './cdp.lib.mjs';
const PAGE = 'http://localhost:8765/dev.html?dev';
const A = await tab(9337), B = await tab(9334);
await A.go(PAGE, 8000); await B.go(PAGE, 8000);
for (const T of [A, B]) { await T.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200); await T.ev(`document.getElementById('scr-invite').classList.add('hidden'); 1`); }
console.log('A login:', await A.ev(`G.DB.loggedIn && G.DB.user === 'tester1' ? 'ya' : G.DB.login('tester1', 'test12345').then(r => JSON.stringify(r))`));
await sleep(5000);
for (const T of [A, B]) await T.ev(`G.Flow.afterLogin(); 1`);
await sleep(4000); await A.ev(`G.Social.start()`); await B.ev(`G.Social.start()`); await sleep(2000);
console.log('users:', await A.ev(`G.DB.user + ' ' + G.Social.uid`), '/', await B.ev(`G.DB.user + ' ' + G.Social.uid`));
await A.ev(`G.Social.leaveRoom?.(); 1`); await B.ev(`G.Social.leaveRoom?.(); 1`); await sleep(1500);
// A abre su propia sala y se queda en ella
await A.ev(`(async()=>{ await G.Social.createRoom({ max: 4 }); G.LobbyUI.open(); })()`); await sleep(3000);
console.log('A sala propia:', await A.ev(`G.Social.room && G.Social.room.id`), '| pantalla', await A.ev(`[...document.querySelectorAll('section.scr')].filter(x => !x.classList.contains('hidden')).map(x => x.id).join(',')`));
// B abre otra e invita a A
await B.ev(`(async()=>{ await G.Social.createRoom({ max: 4 }); G.LobbyUI.open(); })()`); await sleep(3000);
const roomB = await B.ev(`G.Social.room.id`);
const aUid = await A.ev(`G.Social.uid`);
console.log('B invita:', await B.ev(`G.Social.invite('${aUid}').then(r => JSON.stringify(r))`));
let pop = false;
for (let i = 0; i < 15 && !pop; i++) { await sleep(1000); pop = await A.ev(`!document.getElementById('invite-pop').classList.contains('hidden')`); }
console.log('A ve la invitación:', pop, '|', await A.ev(`document.getElementById('inv-text').innerText`));
A.errs.length = 0;
const toasts = [];
await A.ev(`(()=>{ const t = G.UI.toast; window.__toasts = []; G.UI.toast = (m, ...r) => { window.__toasts.push(String(m)); return t(m, ...r); }; return 1; })()`);
await A.ev(`document.getElementById('inv-yes').click(); 1`);
for (let i = 0; i < 10; i++) { await sleep(1000); const r = await A.ev(`G.Social.room ? G.Social.room.id : null`); if (r === roomB) break; }
console.log('A después: sala', await A.ev(`G.Social.room ? G.Social.room.id + ' host=' + G.Social.room.isHost : null`), '(la de B:', roomB + ')');
console.log('A pantalla:', await A.ev(`[...document.querySelectorAll('section.scr')].filter(x => !x.classList.contains('hidden')).map(x => x.id).join(',')`));
console.log('A avisos:', await A.ev(`JSON.stringify(window.__toasts)`), '| errores:', A.errs.slice(0, 4).join(' || ') || 'ninguno');
console.log('B miembros:', await B.ev(`G.Social.room ? G.Social.room.members.map(m => m.name || m.uid).join(', ') : null`));
await A.ev(`G.Social.leaveRoom(); 1`); await B.ev(`G.Social.leaveRoom(); 1`); await sleep(1500);
A.close(); B.close(); process.exit(0);
