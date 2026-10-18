import { tab, sleep } from './cdp.lib.mjs';
const PAGE = 'http://localhost:8765/dev.html?dev';
const A = await tab(9333), B = await tab(9334);   // A = tester1 guest, B = MiNG host
await A.go(PAGE, 8000); await B.go(PAGE, 8000);
for (const T of [A, B]) { await T.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200); await T.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.Flow.afterLogin(); 1`); }
await sleep(4000); await A.ev(`G.Social.start()`); await B.ev(`G.Social.start()`); await sleep(1500);
await A.ev(`G.Social.leaveRoom?.(); 1`); await B.ev(`G.Social.leaveRoom?.(); 1`); await sleep(1500);
await B.ev(`(async()=>{ await G.Social.createRoom({ max: 4 }); G.LobbyUI.open(); })()`); await sleep(3000);
const roomId = await B.ev(`G.Social.room.id`);
console.log('A join:', await A.ev(`(async()=>{ const r = await G.Social.joinRoom('${roomId}', '', false); G.LobbyUI.open(); return JSON.stringify(r); })()`)); await sleep(4000);
const hostView = () => B.ev(`'startDisabled=' + document.getElementById('lobby-start').disabled + ' | note=' + document.getElementById('lobby-note').textContent + ' | guestConn=' + (document.querySelector('#lobby-members .conn[data-u="' + G.Social.room.members.find(m=>m.uid!==G.Social.uid).uid + '"]')||{}).textContent`);
const guestView = () => A.ev(`'readyBtn=' + document.getElementById('lobby-ready').textContent + ' hidden=' + document.getElementById('lobby-ready').classList.contains('hidden') + ' | note=' + document.getElementById('lobby-note').textContent + ' | startHidden/disabled=' + document.getElementById('lobby-start').disabled`);
console.log('1 not ready  host:', await hostView()); console.log('             guest:', await guestView());
console.log('   host ready btn hidden?', await B.ev(`document.getElementById('lobby-ready').classList.contains('hidden')`));
// guest goes to the Pokémon menu -> "Preparando"
await A.ev(`G.MenuUI.open(); 1`); await sleep(2500);
console.log('2 guest in menu  host:', await hostView());
await A.ev(`G.LobbyUI.open(); 1`); await sleep(2500);
// guest presses R
await A.ev(`window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR', key: 'r', bubbles: true })); 1`); await sleep(2500);
console.log('3 guest R        host:', await hostView()); console.log('             guest:', await guestView());
// cancel via button, then ready via button
await A.ev(`document.getElementById('lobby-ready').click(); 1`); await sleep(2000);
console.log('4 guest cancel   host:', await hostView());
await A.ev(`document.getElementById('lobby-ready').click(); 1`); await sleep(2000);
for (let i = 0; i < 8; i++) { const v = await hostView(); if (v.startsWith('startDisabled=false')) break; await sleep(2500); }
console.log('5 guest ready    host:', await hostView());
// start -> rdy resets
await B.ev(`document.getElementById('lobby-start').click(); 1`); await sleep(8000);
console.log('6 playing:', await B.ev(`G.Game.state`), '/', await A.ev(`G.Game.state`), '| guest rdy local=', await A.ev(`G.Social.ready`), 'rtdb=', await B.ev(`JSON.stringify((G.Social.room.members.find(m=>m.uid!==G.Social.uid)||{}).rdy)`));
await B.ev(`G.Game.quit(); 1`); await sleep(3000); await A.ev(`G.Game.quit(); 1`); await sleep(3000);
await A.ev(`G.LobbyUI.open(); 1`); await B.ev(`G.LobbyUI.open(); 1`); await sleep(3000);
console.log('7 back in room   host:', await hostView()); console.log('             guest:', await guestView());
await B.ev(`G.Social.leaveRoom(); 1`); await A.ev(`G.Social.leaveRoom?.(); 1`);
console.log('errors A:', A.errs.join(' || ') || 'none', '| B:', B.errs.join(' || ') || 'none');
A.close(); B.close(); process.exit(0);
