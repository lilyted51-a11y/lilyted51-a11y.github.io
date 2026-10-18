import { tab, sleep } from './cdp.lib.mjs';
const PAGE = 'http://localhost:8765/dev.html?dev';
const A = await tab(9333), B = await tab(9334);   // A = tester1 guest, B = MiNG host
await A.go(PAGE, 8000); await B.go(PAGE, 8000);
for (const T of [A, B]) { await T.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200); await T.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.Flow.afterLogin(); 1`); }
await sleep(4000); await A.ev(`G.Social.start()`); await B.ev(`G.Social.start()`); await sleep(2000);
await A.ev(`G.Social.leaveRoom?.(); 1`); await B.ev(`G.Social.leaveRoom?.(); 1`); await sleep(1500);
// ---- DM: A -> B while B is in the menu ----
console.log('friends A:', await A.ev(`JSON.stringify(G.Social.friends.map(f => f.name + ':' + f.status))`));
await B.ev(`G.MenuUI.open(); 1`);
console.log('A sendDm:', await A.ev(`(async()=>JSON.stringify(await G.Social.sendDm('DFa2yefCCPVzV9OA5Ie07jHHlZ32', '哈囉 MiNG，測試私訊 ' + Date.now())))()`)); await sleep(4000);
console.log('B unread:', await B.ev(`G.Social.unreadDm() + ' | menu sub=' + document.getElementById('menu-friends-sub').textContent + ' | toasts=' + [...document.querySelectorAll('.toast, #toast')].map(e => e.textContent).join(' / ')`));
await B.ev(`G.FriendsUI.open(); 1`); await sleep(1500);
console.log('B friend row:', await B.ev(`[...document.querySelectorAll('#fr-list .fr-row')].map(r => r.textContent.replace(/\s+/g,' ').trim()).join(' || ')`));
await B.ev(`[...document.querySelectorAll('#fr-list .fr-row button')].find(b => b.textContent.includes('💬') && b.closest('.fr-row').textContent.includes('tester1')).click(); 1`); await sleep(3000);
console.log('B dm dialog:', await B.ev(`(document.querySelector('[data-log]')||{}).textContent`), '| unread now:', await B.ev(`G.Social.unreadDm()`));
await B.ev(`(()=>{ const i = document.querySelector('[data-in]'); i.value = '收到！回覆測試'; i.form.requestSubmit(); return 1; })()`); await sleep(3000);
console.log('A sees reply via watchDm:', await A.ev(`new Promise(r => { const un = G.Social.watchDm('DFa2yefCCPVzV9OA5Ie07jHHlZ32', m => { un(); r(m.slice(-2).map(x => x.t).join(' / ')); }); })`));
await B.ev(`document.querySelector('[data-no]').click(); 1`);
// ---- room chat in lobby ----
await B.ev(`(async()=>{ await G.Social.createRoom({ max: 4 }); G.LobbyUI.open(); })()`); await sleep(3000);
const roomId = await B.ev(`G.Social.room.id`);
await A.ev(`(async()=>{ await G.Social.joinRoom('${roomId}', '', false); G.LobbyUI.open(); })()`); await sleep(3000);
console.log('lobby chat empty text:', await A.ev(`document.getElementById('lobby-chat-log').textContent`));
await A.ev(`(()=>{ const i = document.getElementById('lobby-chat-in'); i.value = '大家好，我是 tester1'; i.form.requestSubmit(); return 1; })()`); await sleep(2500);
await B.ev(`(()=>{ const i = document.getElementById('lobby-chat-in'); i.value = 'hola desde el anfitrión <b>x</b>'; i.form.requestSubmit(); return 1; })()`); await sleep(2500);
console.log('lobby log A:', await A.ev(`document.getElementById('lobby-chat-log').innerText.split(String.fromCharCode(10)).join(' | ')`));
console.log('lobby log B:', await B.ev(`document.getElementById('lobby-chat-log').innerText.split(String.fromCharCode(10)).join(' | ')`));
// ---- in-game chat ----
await A.ev(`G.Social.setReady(true); 1`);
for (let i = 0; i < 10; i++) { await sleep(2500); if ((await B.ev(`document.getElementById('lobby-start').disabled`)) === false) break; }
await B.ev(`document.getElementById('lobby-start').click(); 1`); await sleep(8000);
console.log('playing:', await B.ev(`G.Game.state`), '/', await A.ev(`G.Game.state`));
for (const T of [A, B]) await T.ev(`window.__POKE_BOT_ON__ = false; G.Game.player.addMaxHp(20000); G.Game.player.heal(99999); 1`);
console.log('game-chat visible A:', await A.ev(`!document.getElementById('game-chat').classList.contains('hidden') + ' formHidden=' + document.getElementById('game-chat-form').classList.contains('hidden')`));
// Enter opens the box; typing 'd' must not move the player; Enter sends
await A.ev(`window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true })); 1`); await sleep(500);
console.log('after Enter A: formHidden=', await A.ev(`document.getElementById('game-chat-form').classList.contains('hidden') + ' focused=' + (document.activeElement && document.activeElement.id)`));
const moved = await A.ev(`(()=>{ const p = G.Game.player, x0 = p.x, y0 = p.y; const inp = document.getElementById('game-chat-in'); inp.value = '遊戲中聊天 dddd'; inp.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', key: 'd', bubbles: true })); return new Promise(r => setTimeout(() => { inp.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', key: 'd', bubbles: true })); r(Math.round(Math.hypot(p.x - x0, p.y - y0))); }, 700)); })()`);
console.log('typing d moved player px:', moved);
await A.ev(`document.getElementById('game-chat-form').requestSubmit(); 1`); await sleep(2500);
console.log('after send A: formHidden=', await A.ev(`document.getElementById('game-chat-form').classList.contains('hidden')`), '| log A:', await A.ev(`document.getElementById('game-chat-log').innerText.split(String.fromCharCode(10)).join(' | ')`));
console.log('log B (host sees it in game):', await B.ev(`document.getElementById('game-chat-log').innerText.split(String.fromCharCode(10)).join(' | ')`));
await B.ev(`G.Game.quit(); 1`); await sleep(3000); await A.ev(`G.Game.quit(); 1`); await sleep(2000);
console.log('game-chat hidden after quit:', await A.ev(`document.getElementById('game-chat').classList.contains('hidden')`));
await B.ev(`G.Social.leaveRoom(); 1`); await A.ev(`G.Social.leaveRoom?.(); 1`);
console.log('errors A:', A.errs.join(' || ') || 'none', '| B:', B.errs.join(' || ') || 'none');
A.close(); B.close(); process.exit(0);
