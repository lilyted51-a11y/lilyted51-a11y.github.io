/* canvas_zh.mjs — todo lo que se pinta en el canvas durante una partida (esferas, avisos, HUD), en chino (copia local)
 * node tools/test/canvas_zh.mjs <puerto> */
import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(+(process.argv[2] || 9337));
const latin = s => [...new Set((s.match(/[A-Za-zÀ-ž][A-Za-zÀ-ž' ]{2,}/g) || []).map(x => x.trim()))].filter(x => !/^(HP|XP|WASD|Esc|Lv|Nv|Pok[eé]mon|Kyogre|Mewtwo|AI|Bot)\b/i.test(x));
// El gancho va ANTES de que cargue el parche de chino: así se ve lo que llega de verdad al canvas (ya traducido)
await A.send('Page.enable'); await A.send('Page.addScriptToEvaluateOnNewDocument', { source: "window.__canvasTexts = new Set(); const P = CanvasRenderingContext2D.prototype; for (const m of ['fillText', 'strokeText']) { const o = P[m]; P[m] = function (t, ...r) { if (typeof t === 'string' && t.trim()) window.__canvasTexts.add(t); return o.call(this, t, ...r); }; }" });
await A.go('http://localhost:8765/dev.html?dev', 8000);
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); const s = G.DB.save; s.partner = 382; s.owned[382] = { at: 1 }; G.UI.hideAll(); G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.Game.startRun(); window.__POKE_BOT_ON__ = true; window.__canvasTexts.clear(); 1`);
await sleep(3000);
// esferas: una de cada (aviso de la primera vez) y el cartel completo con el ratón encima
await A.ev(`const pl = G.Game.player; for (const id of ['slumber', 'slow', 'blowback', 'focus']) G.Orbs.got(pl, id); 1`); await sleep(1500);
const pos = await A.ev(`(() => { const c = document.getElementById('game'); const r = c.getBoundingClientRect(); return JSON.stringify({ w: r.width, h: r.height, cw: c.width, ch: c.height }); })()`);
const { w, h, cw, ch } = JSON.parse(pos);
// la fila de esferas está encima de los ataques (abajo, centrada): barrer con el ratón unos puntos
for (const fx of [0.38, 0.44, 0.5, 0.56, 0.62]) for (const fy of [0.80, 0.84, 0.88]) {
  await A.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(w * fx), y: Math.round(h * fy) }); await sleep(120);
}
await A.ev(`G.Orbs.use(G.Game.player, 0); 1`); await sleep(2500);
const texts = JSON.parse(await A.ev(`JSON.stringify([...window.__canvasTexts])`));
const bad = texts.filter(t => latin(t).length);
console.log('textos en el canvas:', texts.length, '| con latín:', bad.length);
bad.slice(0, 25).forEach(t => console.log('  ·', t.slice(0, 120)));
console.log('cartel esfera:', texts.filter(t => /寶玉|esfera/i.test(t)).slice(0, 8).join(' | ').slice(0, 300));
await A.ev(`window.__POKE_BOT_ON__ = false; G.Game.quit(); 1`);
A.close(); process.exit(0);
