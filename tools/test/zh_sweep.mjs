/* ============ zh_sweep.mjs — barrido COMPLETO del chino (copia local) ============
 * node tools/test/zh_sweep.mjs <puerto>
 * Pasa por todas las pantallas y estados de la partida y junta tres cosas:
 *   1. window.PSZH_MISSES: todo lo que llegó al parche (js/zh-tw.js) y no supo traducir o tradujo a medias
 *      (trozos, frases armadas, líneas partidas, texto del canvas).
 *   2. Lo que hay dentro de translate="no" (el parche no lo toca): nombres de jugador aparte, nada debe quedar en latín.
 *   3. Lo que de verdad se pinta en el canvas (gancho por debajo del parche), en pantalla estrecha y con el ratón encima
 *      de las esferas.
 * Sale con código 1 si queda algo. Al añadir una pantalla o un estado nuevo al juego: añadirlo aquí.
 */
import { tab, sleep } from './cdp.lib.mjs';
const port = +(process.argv[2] || 9337);
const A = await tab(port);
// Lo que puede quedar en latín: teclas, marcas, nombres propios de jugadores de prueba
const OK = /^(WASD|Esc|Enter|Tab|Shift|Ctrl|Space|Start|Select|HP|XP|PC|OK|LB|RB|FPS|USB|Wi-?Fi|App|IP|NFT|OFL|Inc\.?|Sans|MiNG|tester1|Folagor|Sekiam|PokeAlex|lindaolin|Minecraft|YouTube|Google|Gmail|GitHub|Chrome|Safari|iPhone|Android|PlayStation|Switch|Xbox|Firebase|PokéSurvivor|Pok[eé]mon|Pok[eé]API|SpriteCollab|PMD|Nintendo|Creatures|GAME|FREAK|Company|The|HUD|TheAdro7?|JPTER78|CC|BY-NC|PolyForm|Noncommercial|Pixelify|Survivor\.io|CREDITS\.md|Kecleon|Kyogre|Mewtwo|Gengar|Pikachu|Umbreon|Arceus|Mega|Lv|Nv|AI|Bot|BENCH|Español|English|Français|Italiano|Português|Brasil|ms|fps|px|s|x|v\d+)$/i;
const latinBits = s => [...new Set((String(s).match(/[A-Za-zÀ-ž][A-Za-zÀ-ž'’.\-]{2,}/g) || []).map(w => w.replace(/[.'’\-]+$/, '')))].filter(w => !OK.test(w) && !/^(pokesurvivor\.com|pokeapi\.co|MIT|Noncommercial|Anchored|Floating)$/i.test(w));
const found = new Map();   // texto -> dónde
const note = (where, texts) => { for (const t of texts) if (t && latinBits(t).length) found.set(t.trim().slice(0, 160), (found.get(t.trim().slice(0, 160)) || where)); };

await A.send('Page.enable');
await A.send('Page.addScriptToEvaluateOnNewDocument', { source: "window.__canvasTexts = new Set(); const P = CanvasRenderingContext2D.prototype; for (const m of ['fillText', 'strokeText']) { const o = P[m]; P[m] = function (t, ...r) { if (typeof t === 'string' && t.trim()) window.__canvasTexts.add(t); return o.call(this, t, ...r); }; }" });
await A.send('Emulation.setDeviceMetricsOverride', { width: 760, height: 430, deviceScaleFactor: 1, mobile: false });

/** Texto visible de las pantallas abiertas + lo que hay en translate="no" */
async function grab(where) {
  const r = JSON.parse(await A.ev(`(() => {
    const vis = el => !!(el.offsetParent || el.getClientRects().length);
    const scr = [...document.querySelectorAll('section.scr, .box, #hud, #invite-pop, #toast, .toast')].filter(e => !e.classList.contains('hidden') && vis(e));
    const text = scr.map(e => e.innerText).join('\\n');
    const nos = [...document.querySelectorAll('[translate="no"]')].filter(vis).map(e => e.innerText.trim()).filter(Boolean);
    return JSON.stringify({ text, nos });
  })()`));
  note(where, r.text.split('\n'));
  note(where + ' [translate=no]', r.nos.flatMap(x => x.split(String.fromCharCode(10))));
}
async function misses(where) {
  const m = JSON.parse(await A.ev(`JSON.stringify([...window.PSZH_MISSES]); `));
  await A.ev(`window.PSZH_MISSES.clear(); 1`);
  // lo que el parche tradujo a medias: se mira lo que quedó (la parte de después de la flecha), no lo de antes
  note(where + ' [parche]', m.map(x => { const i = x.indexOf('  →  '); return i < 0 ? x : x.slice(i + 5); }).filter(x => !/^<div class="boot noscript">/.test(x)));
}
async function canvas(where) {
  const t = JSON.parse(await A.ev(`JSON.stringify([...window.__canvasTexts])`));
  await A.ev(`window.__canvasTexts.clear(); 1`);
  note(where + ' [canvas]', t);
}
const click = async sel => { await A.ev(`(() => { const b = document.querySelector(${JSON.stringify(sel)}); if (b) b.click(); return !!b; })()`); await sleep(600); };
const clickAll = async sel => { const n = await A.ev(`document.querySelectorAll(${JSON.stringify(sel)}).length`); for (let i = 0; i < Math.min(n, 12); i++) { await A.ev(`document.querySelectorAll(${JSON.stringify(sel)})[${i}].click(); 1`); await sleep(500); await grab(sel + '#' + i); } };

// ---------- menú y pantallas ----------
await A.go(`http://localhost:8765/dev.html?dev&halloween=1`, 8000);
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); const s = G.DB.save; s.partner = 352; for (const d of [352, 94, 25, 1382, 150]) s.owned[d] = { at: 1 }; s.coins = 99999; s.tickets = { t1: 500, t10: 50 }; s.bag = { candy: 900, mint: 2, cap: 1, caph: 1 }; s.skins = { hat: Date.now(), 'bruja-gengar': Date.now() }; G.Skins.wear(s, 352, 'hat'); const u = G.DB.upgradesOf(352); for (const x of G.Upgrades.LIST) u[x.id] = x.max; G.UI.hideAll(); G.MenuUI.open(); 1`); await sleep(1500);
await grab('menú'); await misses('menú');
for (const go of ['dex', 'upgrades', 'shop', 'bag', 'gacha', 'goals', 'friends', 'rank', 'settings']) {
  await A.ev(`G.UI.hideAll(); G.MenuUI.open(); 1`); await sleep(300);
  const ok = await A.ev(`(() => { const b = document.querySelector('#scr-menu [data-go=${go}]'); if (b) b.click(); return !!b; })()`); await sleep(1800);
  if (!ok) continue;
  await grab('pantalla ' + go);
  if (go === 'dex') { await A.ev(`G.MenuUI.openDex(); 1`); await sleep(1000); await grab('ficha Kecleon'); await clickAll('.mon-extra [data-extra]'); }
  if (go === 'upgrades') await clickAll('#scr-upgrades button.btn:not([data-back])');
  if (go === 'shop') { await clickAll('#scr-shop .gen-tab'); }
  if (go === 'gacha') {
    await clickAll('#gacha-gens .gen-tab:not(.hidden)');
    await click('#pull-10'); await sleep(5000); await grab('gacha ×10 resultado'); await click('#pull-close');
  }
  if (go === 'settings') await clickAll('#set-tabs .gen-tab');
  if (go === 'rank') { await clickAll('#rk-mode button'); await clickAll('#rk-period button'); await clickAll('#rk-scope button'); }
  if (go === 'friends') { await click('#fr-create'); await sleep(500); await grab('crear sala'); await click('section.scr [data-no]'); }
  await misses('pantalla ' + go);
}
await A.ev(`G.UI.hideAll(); document.getElementById('btn-news').click(); 1`); await sleep(1500); await grab('novedades'); await misses('novedades'); await click('#news-close');

// ---------- partida ----------
await A.ev(`G.UI.hideAll(); G.DB.save.partner = 1382; G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.Game.startRun(); G.Game.debugSpeed(2); window.__POKE_BOT_ON__ = true; window.__canvasTexts.clear(); 1`);
let lvSeen = false, itemSeen = false;
for (let i = 0; i < 30; i++) {
  await sleep(1000);
  if (!lvSeen && (await A.ev(`G.UI.isOpen('scr-levelup')`))) { lvSeen = true; await grab('cartas de nivel'); }
  if (await A.ev(`G.Game.state === 'over'`)) break;
}
await A.ev(`const pl = G.Game.player; for (const id of ['slumber', 'blowback', 'blowback', 'slow', 'focus']) G.Orbs.got(pl, id); G.Weather.debugStart('rain', 30); 1`); await sleep(2500);
const pos = JSON.parse(await A.ev(`(() => { const r = document.getElementById('game').getBoundingClientRect(); return JSON.stringify({ w: r.width, h: r.height }); })()`));
for (const fx of [0.36, 0.42, 0.48, 0.54, 0.6]) for (const fy of [0.78, 0.84, 0.9]) { await A.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(pos.w * fx), y: Math.round(pos.h * fy) }); await sleep(100); }
await canvas('partida (HUD, esferas, clima)');
await A.ev(`window.__POKE_BOT_ON__ = false; G.RunUI.showItemChoice('leftovers', 'assaultvest', () => {}); 1`); await sleep(800); await grab('elegir objeto'); await A.ev(`document.querySelector('#item-cards .card').click(); 1`); await sleep(500);
await A.ev(`(() => { const pl = G.Game.player; const loose = pl.slots.filter(s => s.length === 1).map(s => s[0]); if (loose.length >= 2) G.RunUI.showBond({ mode: 'pair', group: null, loose }, () => {}); return loose.length; })()`); await sleep(800); await grab('vínculo'); await A.ev(`G.UI.hide('scr-bond'); 1`);
await A.ev(`G.Game.togglePause(); 1`); await sleep(800); await grab('pausa'); await A.ev(`G.Game.togglePause(); 1`); await sleep(300);
await misses('partida');
await A.ev(`(() => { const p = G.Game.player; p.invuln = 0; p.hurt(999999, null, true); return 1; })()`);
for (let i = 0; i < 20; i++) { await sleep(1000); if ((await A.ev(`G.Game.state`)) === 'over') break; }
await sleep(2500); await grab('fin de partida'); await misses('fin de partida'); await canvas('fin de partida');

// ---------- resultado ----------
const list = [...found.entries()];
console.log('restos en latín:', list.length);
for (const [t, where] of list.slice(0, 80)) console.log('  ·', where.padEnd(28), '|', t);
console.log('errores de página:', A.errs.slice(0, 3).join(' || ') || 'ninguno');
A.close(); process.exit(list.length ? 1 : 0);
