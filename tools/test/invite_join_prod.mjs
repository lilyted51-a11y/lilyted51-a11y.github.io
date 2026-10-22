/* invite_join_prod.mjs — lo mismo que invite_join.mjs pero A en la versión publicada (index.html, sin G), sólo con clics (copia local) */
import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(9337), B = await tab(9334);
await A.go('http://localhost:8765/index.html', 9000); await B.go('http://localhost:8765/dev.html?dev', 8000);
for (const T of [A, B]) { await T.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1500); await T.ev(`document.getElementById('scr-invite').classList.add('hidden'); 1`); }
await B.ev(`G.Flow.afterLogin(); 1`);
await sleep(8000); await B.ev(`G.Social.start()`); await B.ev(`G.Social.leaveRoom?.(); 1`);
const vis = T => T.ev(`[...document.querySelectorAll('section.scr')].filter(x => !x.classList.contains('hidden')).map(x => x.id || '(sin id)').join(',')`);
console.log('A pantalla al entrar:', await vis(A));
await A.ev(`document.querySelector('#scr-menu [data-go=friends]').click(); 1`); await sleep(2500);
await A.ev(`document.getElementById('fr-create').click(); 1`); await sleep(800);
await A.ev(`[...document.querySelectorAll('section.scr [data-ok]')].pop().click(); 1`); await sleep(4000);
console.log('A tras crear sala:', await vis(A), '|', await A.ev(`(document.getElementById('lobby-title') || {}).innerText || ''`));
await B.ev(`(async()=>{ await G.Social.createRoom({ max: 4 }); G.LobbyUI.open(); })()`); await sleep(3000);
console.log('B invita:', await B.ev(`G.Social.invite('jmJ3FICx3TaCJ1CZkbjZshVV0Nt2').then(r => JSON.stringify(r))`));
let pop = false;
for (let i = 0; i < 15 && !pop; i++) { await sleep(1000); pop = await A.ev(`!document.getElementById('invite-pop').classList.contains('hidden')`); }
console.log('A ve la invitación:', pop, '|', await A.ev(`document.getElementById('inv-text').innerText`));
A.errs.length = 0;
// clic de verdad (ratón) en «Unirme»
const r = await A.ev(`JSON.stringify(document.getElementById('inv-yes').getBoundingClientRect())`); const b = JSON.parse(r);
const x = b.x + b.width / 2, y = b.y + b.height / 2;
console.log('elemento bajo el botón:', await A.ev(`(()=>{ const e = document.elementFromPoint(${x}, ${y}); return e ? e.tagName + '#' + e.id : 'nada'; })()`));
await A.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
await A.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
await sleep(6000);
console.log('A después:', await vis(A), '| toast:', await A.ev(`[...document.querySelectorAll('.toast, #toast')].map(t => t.innerText).join(' / ')`));
console.log('A errores:', A.errs.slice(0, 4).join(' || ') || 'ninguno');
console.log('B miembros:', await B.ev(`G.Social.room ? G.Social.room.members.map(m => m.name || m.uid).join(', ') : null`));
await A.ev(`(document.getElementById('lobby-leave') || {}).click && document.getElementById('lobby-leave').click(); 1`); await B.ev(`G.Social.leaveRoom(); 1`); await sleep(2000);
A.close(); B.close(); process.exit(0);
