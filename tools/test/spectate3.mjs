import { tab, sleep } from './cdp.lib.mjs';
const PAGE = 'http://localhost:8765/dev.html?dev';
const A = await tab(9333), B = await tab(9334);   // A = tester1 (falls), B = MiNG host (alive, stands still)
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
for (const T of [A, B]) await T.ev(`window.__POKE_BOT_ON__ = false; G.Game.player.addMaxHp(20000); G.Game.player.heal(99999); setInterval(() => { if (G.UI.isOpen('scr-levelup')) G.RunUI.pick(0); if (G.UI.isOpen('scr-item')) { const c = document.querySelector('#item-cards .card'); if (c) c.click(); } }, 400); 1`);
// A walks 500 px away then falls; B stands still.
await A.ev(`(()=>{ const p = G.Game.player; const o = { x: p.x + 500, y: p.y + 120, r: p.r }; G.World.collide(o); p.x = o.x; p.y = o.y; return 1; })()`); await sleep(1500);
await A.ev(`(()=>{ const p = G.Game.player; p.invuln = 0; p.hurt(999999, null, true); return p.dead; })()`); await sleep(2500);
const cam = () => A.ev(`(()=>{ const p = G.Game.player, m = G.Coop.puppets()[0], c = G.Camera, s = G.Game.spectating; return 'dead=' + p.dead + ' camToSelf=' + Math.round(Math.hypot(c.x - p.x, c.y - p.y)) + ' camToMate=' + (m ? Math.round(Math.hypot(c.x - m.x, c.y - m.y)) : '?') + ' spectating=' + (s ? s.tag : null); })()`);
console.log('dead, after 2.5 s:', await cam());
await A.ev(`window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight', bubbles: true })); setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight', key: 'ArrowRight', bubbles: true })), 80); 1`); await sleep(800);
console.log('after ArrowRight (only one mate):', await cam());
// A third, downed teammate (2 accounts only): add a fake dead puppet next to MiNG's real one and switch to it
await A.ev(`(()=>{ const real = G.Coop.puppets; const mate = real()[0]; const ghost = Object.create(Object.getPrototypeOf(mate)); Object.assign(ghost, mate, { uid: 'ghost', tag: 'Yaru', dead: true, x: mate.x - 600, y: mate.y + 300, tagColor: '#7ee07a' }); ghost.net = Object.assign({}, mate.net, { dead: 1, x: mate.x - 600, y: mate.y + 300 }); window.__ghost = ghost; G.Coop.puppets = () => real().concat([ghost]); window.__realPuppets = real; return 1; })()`).catch(e => console.log('stub err', e));
const spec = () => A.ev(`(()=>{ const s = G.Game.spectating, c = G.Camera; return 'spectating=' + (s ? s.tag + ' dead=' + !!s.dead : null) + ' camToIt=' + (s ? Math.round(Math.hypot(c.x - s.x, c.y - s.y)) : '?'); })()`);
const key = async (code, key) => { await A.send('Input.dispatchKeyEvent', { type: 'keyDown', code, key, windowsVirtualKeyCode: code === 'ArrowRight' ? 39 : 37 }); await sleep(60); await A.send('Input.dispatchKeyEvent', { type: 'keyUp', code, key, windowsVirtualKeyCode: code === 'ArrowRight' ? 39 : 37 }); await sleep(1500); };
console.log('3 mates, start :', await spec());
await key('ArrowRight', 'ArrowRight'); console.log('→ next       :', await spec());
await A.send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyD', key: 'd', windowsVirtualKeyCode: 68 }); await sleep(60); await A.send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyD', key: 'd', windowsVirtualKeyCode: 68 }); await sleep(1500);
console.log('D next       :', await spec());
await key('ArrowLeft', 'ArrowLeft'); console.log('← prev       :', await spec());
// tap on the game canvas also switches
console.log('open overlays:', await A.ev(`[...document.querySelectorAll('section.scr')].filter(x => !x.classList.contains('hidden')).map(x => x.id).join(',')`));
await A.ev(`[...document.querySelectorAll('section.scr')].filter(x => !x.classList.contains('hidden') && x.querySelector('#rec-link')).forEach(x => x.classList.add('hidden')); 1`);
console.log('element under tap:', await A.ev(`(()=>{ const e = document.elementFromPoint(640, 400); return e ? e.tagName + '#' + e.id + '.' + e.className : 'none'; })()`));
await A.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 640, y: 400, button: 'left', clickCount: 1 }); await A.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 640, y: 400, button: 'left', clickCount: 1 }); await sleep(1500);
console.log('tap next     :', await spec());
const hud = await A.ev(`(()=>{ const s = G.Game.spectating; return s && s.dead ? 'ok' : 'alive'; })()`);
await A.ev(`G.Coop.puppets = window.__realPuppets; 1`);
// B walks over to revive A
await B.ev(`(()=>{ const m = G.Coop.puppets()[0]; const p = G.Game.player; p.x = m.x + 30; p.y = m.y; return 1; })()`);
for (let i = 0; i < 12; i++) { await sleep(1000); const d = await A.ev(`G.Game.player.dead`); if (d === false) break; }
await sleep(2500);
console.log('revived:', await cam());
await B.ev(`G.Game.quit(); 1`); await sleep(3000); await A.ev(`G.Game.quit(); 1`); await sleep(2000);
await B.ev(`G.Social.leaveRoom(); 1`); await A.ev(`G.Social.leaveRoom?.(); 1`);
console.log('errors A:', A.errs.join(' || ') || 'none', '| B:', B.errs.join(' || ') || 'none');
A.close(); B.close(); process.exit(0);
