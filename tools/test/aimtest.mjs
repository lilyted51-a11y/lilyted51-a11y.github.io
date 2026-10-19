import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(9333);
await A.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await A.go('http://localhost:8765/dev.html?dev', 8000);
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = 25; G.DB.save.owned[25] = { at: 1 }; G.UI.hideAll(); G.MenuUI.open(); 1`); await sleep(800);
const deg = r => Math.round(r * 180 / Math.PI);

// 1) turn it on through the Settings screen
await A.ev(`G.SettingsUI.open(); [...document.querySelectorAll('#scr-settings button')].find(b => b.innerText.trim() === '無障礙' || b.innerText.trim() === 'Accesibilidad').click(); 1`); await sleep(400);
console.log('accessibility tab:', await A.ev(`document.getElementById('scr-settings').innerText.split(String.fromCharCode(10)).filter(l => l.includes('瞄準')).join(' | ')`));
console.log('setting before:', await A.ev(`G.Settings.get('aimManual')`));
console.log('click toggle:', await A.ev(`(()=>{ const el = document.querySelector('#scr-settings button[data-k="aimManual"]'); if (!el) return 'toggle not found'; const before = el.innerText; el.click(); const now = document.querySelector('#scr-settings button[data-k="aimManual"]'); return 'button ' + before + ' -> ' + now.innerText; })()`));
console.log('setting after:', await A.ev(`G.Settings.get('aimManual') + ' stored=' + JSON.stringify(localStorage.getItem('ps.settings') || '').slice(0, 0)`));
await A.ev(`G.SettingsUI.close(); 1`);

// 2) run: keep enemies away so they don't interfere, move the real mouse around the player
await A.ev(`G.UI.hideAll(); G.Game.startRun(); 1`); await sleep(1500);
const scr = await A.ev(`(()=>{ const p = G.Game.player, c = G.Camera; return JSON.stringify({ x: (p.x - c.left()) * c.scale, y: (p.y - G.LIFT * 0.5 - c.top()) * c.scale }); })()`);
const P = JSON.parse(scr);
console.log('player on screen ~', Math.round(P.x), Math.round(P.y));
const mouse = async (x, y) => { await A.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await sleep(250); };
for (const [name, dx, dy, want] of [['right', 250, 0, 0], ['down', 0, 200, 90], ['up-left', -200, -200, -135], ['left', -260, 0, 180]]) {
  await mouse(P.x + dx, P.y + dy);
  await A.ev(`G.Camera.x = G.Game.player.x; 1`);
  const r = JSON.parse(await A.ev(`(()=>{ const p = G.Game.player; return JSON.stringify({ manual: p.manualAim, aim: p.aim }); })()`));
  // shots fired since: friendly projectiles' direction
  const shots = JSON.parse(await A.ev(`(()=>{ const p = G.Game.player; return JSON.stringify(G.Projectiles.all().filter(b => b.friendly !== false && (b.vx || b.vy) && Math.hypot(b.x - p.x, b.y - p.y) < 300).slice(-3).map(b => Math.atan2(b.vy, b.vx))); })()`));
  console.log(`mouse ${name.padEnd(8)} want ${String(want).padStart(4)}° -> manual=${r.manual} aim=${deg(r.aim)}° | recent shots: ${shots.map(deg).join('°, ') || '-'}${shots.length ? '°' : ''}`);
  await sleep(700);
}

// 3) turn it off -> back to auto aim (nearest enemy)
await A.ev(`G.Settings.set('aimManual', false); 1`); await sleep(400);
console.log('off:', await A.ev(`(()=>{ const p = G.Game.player, t = p.target; return 'manual=' + p.manualAim + ' aim=' + Math.round(p.aim * 180 / Math.PI) + '° target=' + (t && t.hurt ? Math.round(Math.atan2(t.y - p.y, t.x - p.x) * 180 / Math.PI) + '° (nearest enemy)' : 'none'); })()`));

// 4) setting on + bot running -> bot keeps auto aim
await A.ev(`G.Settings.set('aimManual', true); G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); window.__POKE_BOT_ON__ = true; 1`); await sleep(1500);
await mouse(P.x + 250, P.y);
console.log('bot on:', await A.ev(`'pl.bot=' + G.Game.player.bot + ' manual=' + G.Game.player.manualAim`));
await A.ev(`window.__POKE_BOT_ON__ = false; G.Settings.set('aimManual', false); G.Game.quit(); 1`);
console.log('errors:', A.errs.slice(0, 3).join(' || ') || 'none');
A.close(); process.exit(0);
