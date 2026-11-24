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
const OK = /^(WASD|Esc|Enter|Tab|Shift|Ctrl|Alt|AltGr|Del|Home|End|PgUp|PgDn|Insert|dev|Space|Start|Select|HP|XP|PC|OK|LB|RB|FPS|USB|Wi-?Fi|App|IP|NFT|OFL|Inc\.?|Sans|MiNG|tester1|Folagor|Sekiam|PokeAlex|lindaolin|Minecraft|YouTube|Google|Gmail|GitHub|Chrome|Safari|iPhone|Android|PlayStation|Switch|Xbox|Firebase|PokéSurvivor|Pok[eé]mon|Pok[eé]API|SpriteCollab|PMD|Nintendo|Creatures|GAME|FREAK|Company|The|HUD|TheAdro7?|JPTER78|CC|BY-NC|PolyForm|Noncommercial|Pixelify|Survivor\.io|CREDITS\.md|Kecleon|Kyogre|Mewtwo|Gengar|Pikachu|Umbreon|Arceus|Mega|Lv|Nv|AI|Bot|BENCH|Español|English|Français|Italiano|Português|Brasil|ms|fps|px|s|x|v\d+)$/i;
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
await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); const s = G.DB.save; s.partner = 352; for (const d of [352, 94, 25, 1382, 150]) s.owned[d] = { at: 1 }; s.coins = 99999; s.tickets = { t1: 500, t10: 50 }; s.bag = { candy: 900, mint: 2, cap: 1, caph: 1, tmx: 1 }; s.ptm = { 352: [G.Mons.learnable(352)[0]] }; s.pseen = { 352: 1234, 19: 56, 25: 3 }; s.pdef = { 352: 1200, 19: 50 }; s.skins = { hat: Date.now(), 'bruja-gengar': Date.now() }; G.Skins.wear(s, 352, 'hat'); const u = G.DB.upgradesOf(352); for (const x of G.Upgrades.LIST) u[x.id] = x.max; s.mast = { 352: 60000, 94: 12000, 25: 300 }; s.mstat = { 352: { r: 40, t: 70000, k: 200000, a: 3, bt: 1900, b: 120, rf: 90, e: 2 } }; const ph = G.Photo.dailyPhotos()[0]; s.photos = { [ph.key]: Date.now() }; s.frames = { [G.Photo.weeklyFrames()[0]]: Date.now() }; G.UI.hideAll(); G.MenuUI.open(); 1`); await sleep(1500);
await grab('menú'); await misses('menú');
// Menú sin scroll (24-11-2026): el menú a cada tamaño (PC, móvil en vertical y en horizontal), con el Objeto inicial
// elegido en la ficha del compañero, la ventana para elegirlo (con y sin objetos) y la pestaña Objetos de partida.
await A.ev(`(() => { const s = G.DB.save; s.held = { leftovers: 2, metronome: 1 }; s.psitem = { 352: 'leftovers' }; G.UI.hideAll(); G.MenuUI.open(); return 1; })()`); await sleep(600);
for (const [w, h, m] of [[1280, 720, false], [1920, 1080, false], [390, 844, true], [844, 390, true], [760, 430, false]]) {
  await A.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: m }); await sleep(700);
  await grab(`menú ${w}x${h}`); await misses(`menú ${w}x${h}`);
}
await click('#menu-sitem'); await grab('Objeto inicial: elegir'); await misses('Objeto inicial: elegir');
await click('#scr-sitem [data-id="metronome"]'); await sleep(300); await grab('Objeto inicial: elegido (aviso)');
await A.ev(`(() => { const s = G.DB.save; s.held = {}; G.StartItem.pick(352); return 1; })()`); await sleep(500); await grab('Objeto inicial: sin objetos');
await click('#sitem-close');
await A.ev(`(() => { const s = G.DB.save; s.held = { metronome: 0 }; G.UI.hideAll(); G.MenuUI.open(); return 1; })()`); await sleep(500); await grab('menú: objeto inicial agotado');
await A.ev(`(() => { const s = G.DB.save; s.held = { leftovers: 2, metronome: 1 }; G.ShopUI.open('held'); return 1; })()`); await sleep(1500); await grab('tienda: objetos de partida');
await A.ev(`(() => { const u = G.DB.upgradesOf(352); delete u.sitem; G.ShopUI.render(); return 1; })()`); await sleep(500); await grab('tienda: objetos de partida (sin la Mejora)');
await A.ev(`(() => { G.DB.upgradesOf(352).sitem = 1; G.ShopUI.openBag(); return 1; })()`); await sleep(800); await grab('Mochila: objetos de partida');
for (const t of ['Ese objeto no se vende.']) { await A.ev(`G.UI.toast(G.T(${JSON.stringify(t)}), 900); 1`); await sleep(350); await grab('toast (objeto inicial)'); }
await misses('Objeto inicial y Objetos de partida');
for (const go of ['dex', 'wardrobe', 'upgrades', 'shop', 'bag', 'gacha', 'goals', 'friends', 'rank', 'mastery', 'settings']) {
  await A.ev(`G.UI.hideAll(); G.MenuUI.open(); 1`); await sleep(300);
  const ok = await A.ev(`(() => { const b = document.querySelector('#scr-menu [data-go=${go}]') || (${JSON.stringify(go)} === 'settings' && document.getElementById('btn-settings')); if (b) b.click(); return !!b; })()`); await sleep(1800);
  if (!ok) continue;
  await grab('pantalla ' + go);
  if (go === 'dex') {
    await A.ev(`G.MenuUI.openDex(); 1`); await sleep(1000); await grab('ficha Kecleon'); await clickAll('.mon-extra [data-extra]');
    // MT vacía (23-11-2026): la lista de MT enseñadas y la pregunta antes de borrar (se cancela)
    await A.ev(`(() => { const b = document.querySelector('[data-extra="tmx"]'); if (b && !document.querySelector('#mx-picker [data-v]')) b.click(); return 1; })()`); await sleep(500);
    await click('#mx-picker [data-v]'); await grab('MT vacía: ¿borrar?'); await click('section.scr [data-no]');
    // Pokédex de vistos y derrotados: la ficha de uno visto que no tienes
    await A.ev(`(() => { G.UI.hideAll(); G.MenuUI.openDex(); const c = [...document.querySelectorAll('#dex-grid .cell')].find(c => (c.querySelector('.no') || {}).textContent === '019'); if (c) c.click(); return !!c; })()`); await sleep(800);
    await grab('Pokédex: visto sin tenerlo');
    // Ataques exclusivos (24-11-2026): la ficha de Mewtwo con su ataque exclusivo y el recuadro al pasar el ratón
    await A.ev(`(() => { G.UI.hideAll(); G.MenuUI.openDex(); const c = [...document.querySelectorAll('#dex-grid .cell')].find(c => (c.querySelector('.no') || {}).textContent === '150'); if (c) c.click(); return !!c; })()`); await sleep(800);
    await A.ev(`(() => { const s = document.querySelector('#dex-sig [data-move]'); if (s) s.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' })); return !!s; })()`); await sleep(400);
    await grab('ficha con ataque exclusivo');
  }
  if (go === 'upgrades') { await clickAll('#scr-upgrades button.btn:not([data-back])'); await A.ev(`G.StartItem.close(); 1`); }
  if (go === 'shop') { await clickAll('#scr-shop .gen-tab'); }
  if (go === 'gacha') {
    await clickAll('#gacha-gens .gen-tab:not(.hidden)');
    await A.ev(`G.DB.save.stats.x10 = 9; 1`);   // (la décima ×10 trae un huevo místico)
    await click('#pull-10'); await sleep(5000); await grab('gacha ×10 resultado'); await click('#pull-close');
  }
  if (go === 'settings') {
    await clickAll('#set-tabs .gen-tab'); await A.ev(`G.GuideUI.close(); 1`);
    // Teclas (24-11-2026): el editor, «pulsa una tecla», una tecla que ya era de otra acción (aviso), quitar una y restablecer.
    await A.ev(`G.SettingsUI.open('ctl'); 1`); await sleep(500); await grab('Ajustes: teclas');
    await click('[data-kact=power][data-kslot="0"]'); await grab('Ajustes: pulsa una tecla');
    await A.ev(`dispatchEvent(new KeyboardEvent('keydown', { code: 'F1', key: 'F1', bubbles: true })); 1`); await sleep(300);   // (vale: F1)
    await click('[data-kact=power][data-kslot="0"]');
    await A.ev(`dispatchEvent(new KeyboardEvent('keydown', { code: 'F5', key: 'F5', bubbles: true })); 1`); await sleep(300); await grab('Ajustes: tecla que no se puede usar');
    await A.ev(`dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', key: 'e', bubbles: true })); 1`); await sleep(500); await grab('Ajustes: tecla cambiada (aviso)');
    await click('[data-kact=next][data-kslot="1"]'); await A.ev(`dispatchEvent(new KeyboardEvent('keydown', { code: 'Numpad9', key: '9', bubbles: true })); 1`); await sleep(400);
    await click('[data-kact=prev][data-kslot="1"]'); await A.ev(`dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true })); 1`); await sleep(400);
    await click('[data-kact=reroll][data-kslot="0"]'); await click('#keycap-clear'); await grab('Ajustes: teclas cambiadas');
    await click('#kb-reset'); await grab('Ajustes: teclas restablecidas');
    // Guías (24-11-2026): la portada, cada apartado, el buscador sin resultados y un tipo.
    await A.ev(`G.GuideUI.open(); 1`); await sleep(900); await grab('Guías: portada');
    for (const id of await A.ev(`G.GuideUI.SECTIONS.map(s => s.id)`)) { await A.ev(`G.GuideUI.show('${id}'); 1`); await sleep(500); await grab('Guías: ' + id); }
    await A.ev(`G.GuideUI.show('moves'); 1`); await sleep(400); await click('[data-ft=fire]'); await grab('Guías: movimientos de Fuego');
    await A.ev(`(() => { const q = document.getElementById('guide-q'); q.value = 'zzzz'; q.oninput(); return 1; })()`); await sleep(400); await grab('Guías: buscar sin resultado');
    await A.ev(`G.GuideUI.show('items'); 1`); await sleep(400); await A.ev(`(() => { const q = document.getElementById('guide-q'); q.value = 'zzzz'; q.oninput(); return 1; })()`); await sleep(400); await grab('Guías: objetos sin resultado');
    await misses('Guías');
    await A.ev(`G.GuideUI.close(); G.SettingsUI.close(); 1`);
  }
  // Maestría (23-11-2026): la lista, buscar, la ficha con los premios (ponerse foto, título y marco) y una sin premios.
  if (go === 'mastery') {
    await A.ev(`(() => { const i = document.getElementById('mast-q'); i.value = 'zzz'; i.oninput(); return 1; })()`); await sleep(500); await grab('Maestría: buscar sin resultado');
    await A.ev(`(() => { const i = document.getElementById('mast-q'); i.value = ''; i.oninput(); return 1; })()`); await sleep(500);
    await click('#mast-list .mast-item'); await sleep(800); await grab('Maestría: ficha');
    for (const k of ['photo', 'title', 'frame']) await click(`[data-eq=${k}]`);
    await grab('Maestría: ficha con todo puesto');
    await A.ev(`G.MasteryUI.open(25); 1`); await sleep(800); await grab('Maestría: ficha sin premios');
    await A.ev(`G.MasteryUI.open(94); 1`); await sleep(800); await grab('Maestría: ficha con foto');
    await click('#mast-back'); await sleep(500); await grab('Maestría: vuelta a la lista');
  }
  // Perfil con foto y marco (23-11-2026): el perfil, elegir cara, expresiones, marcos y el perfil público.
  if (go === 'goals') {
    await click('#goals-tabs [data-tab=profile]'); await sleep(800); await grab('perfil');
    await click('[data-ph=photo]'); await sleep(800); await grab('perfil: elegir cara');
    await click('#ph-grid [data-d="94"]'); await sleep(800); await grab('perfil: expresiones');
    await click('#ph-back'); await click('#ph-back'); await sleep(500);
    await click('[data-ph=frame]'); await sleep(800); await grab('perfil: marcos');
    await click('#ph-back'); await sleep(500);
    await A.ev(`G.ProfileUI.showData(G.Social.profileData()); 1`); await sleep(800); await grab('perfil público'); await A.ev(`document.getElementById('scr-profile').classList.add('hidden'); 1`);
  }
  if (go === 'rank') { await clickAll('#rk-mode button'); await clickAll('#rk-period button'); await clickAll('#rk-scope button'); }
  if (go === 'friends') { await click('#fr-create'); await sleep(500); await grab('crear sala'); await click('section.scr [data-no]'); }
  await misses('pantalla ' + go);
}
// ---------- Huevos (23-11-2026): Mochila con huevos de las tres clases, la eclosión (normal y shiny) y el menú ----------
await A.ev(`(() => { const s = G.DB.save, E = G.Eggs; const a = E.add('rift'), b = E.add('mission', 'w2026-48-wrift'), c = E.add('gacha'); E.add('rift');
  Object.assign(s.eggs[a.id], { p: 99999, d: 1027, s: 0 }); Object.assign(s.eggs[c.id], { p: 99999, d: 1037, s: 1 }); s.eggs[b.id].p = 1300;
  window.__eggs = [a.id, c.id]; G.UI.hideAll(); G.MenuUI.open(); return 1; })()`); await sleep(800);
await grab('menú (con huevos)');
await A.ev(`document.querySelector('#scr-menu [data-go=bag]').click(); 1`); await sleep(1200); await grab('Mochila con huevos'); await misses('Mochila con huevos');
for (const i of [0, 1]) {
  await A.ev(`(() => { const b = document.querySelector('[data-egg="' + __eggs[${i}] + '"]'); if (b) b.click(); return !!b; })()`); await sleep(1000);
  await grab('huevo abriéndose'); await sleep(2600); await grab('huevo abierto #' + i); await misses('huevo abierto #' + i);
  await click('#egg-close');
}
await grab('Mochila tras abrir'); await misses('Mochila tras abrir');
await A.ev(`(() => { G.UI.hideAll(); G.MenuUI.open(); return 1; })()`); await sleep(600);
await A.ev(`(() => { G.UI.toast(G.T('Sin conexión: con tu cuenta, abrir huevos necesita internet.'), 900); return 1; })()`); await sleep(350); await grab('toast (huevos sin conexión)');
await A.ev(`G.UI.hideAll(); document.getElementById('btn-news').click(); 1`); await sleep(1500); await grab('novedades'); await misses('novedades'); await click('#news-close');

// ---------- Vestidor y estelas (23-11-2026): cada Pokémon, versión, aspecto, skin, efectos, estelas, tienda y ficha ----------
await A.ev(`(() => { const s = G.DB.save; s.owned[412] = { at: 1 }; s.shiny[25] = { at: 1 }; for (const d of [666, 201, 1025]) s.owned[d] = { at: 1 }; for (const t of G.Trails.LIST) s.trails[t.id] = Date.now(); G.Dress.set(s, 352, { tr: 'arcoiris', fx: 'aura' }); G.UI.hideAll(); G.MenuUI.open(); return 1; })()`); await sleep(500);
for (const d of [352, 25, 412, 94, 666, 201, 1025]) {   // (24-11-2026: aspectos nuevos de Vivillon y Unown, y Pecharunt)
  await A.ev(`G.WardrobeUI.open(${d}, 'dex'); 1`); await sleep(1000); await grab('Vestidor ' + d);
  await clickAll('#wd-opts .chip[data-k=sh]:not([disabled])'); await clickAll('#wd-opts .chip[data-k=lk]'); await clickAll('#wd-opts .chip[data-k=sk]'); await clickAll('#wd-opts .chip[data-k=fx]');
}
await clickAll('#wd-opts .chip[data-k=tr]');
await A.ev(`(() => { const q = document.getElementById('wd-q'); q.value = 'zzzz'; q.dispatchEvent(new Event('input')); return 1; })()`); await sleep(500); await grab('Vestidor sin resultados');
await A.ev(`G.WardrobeUI.back(); 1`); await sleep(1000); await grab('ficha (botón del Vestidor)');
await A.ev(`G.ShopUI.open('trails'); 1`); await sleep(1500); await grab('tienda: estelas (compradas)');
await A.ev(`(() => { G.DB.save.trails = {}; G.ShopUI.render(); return 1; })()`); await sleep(800); await grab('tienda: estelas (a la venta)');
await A.ev(`G.ShopUI.open('items'); 1`); await sleep(500);
await misses('Vestidor y estelas');

// ---------- Desafío semanal (23-11-2026): tarjeta del menú, su pantalla con cada condición, la pregunta y su ranking ----------
// (Las condiciones se fuerzan en el desafío de esta semana; el ranking, con marcas falsas: el invitado no tiene nube.)
const CH_CONDS = [['wx', { wx: 'sun' }], ['wx', { wx: 'rain' }], ['wx', { wx: 'sand' }], ['wx', { wx: 'snow' }], ['wx', { wx: 'fog' }],
                  ['type', { type: 'psychic' }], ['type', { type: 'dark' }], ['noheal', {}], ['night', {}]];
const chSet = (cond, x) => A.ev(`(() => { G.DB.save.chal = null; const c = G.Challenge.thisWeek(); delete c.wx; delete c.type; Object.assign(c, { cond: ${JSON.stringify(cond)} }, ${JSON.stringify(x)}); return 1; })()`);
for (const [cond, x] of CH_CONDS) {
  await chSet(cond, x);
  await A.ev(`G.UI.hideAll(); G.MenuUI.open(); document.getElementById('menu-ch').click(); 1`); await sleep(700);
  await grab('desafío semanal ' + cond + (x.wx || x.type || '')); await misses('desafío semanal ' + cond);
}
await A.ev(`document.getElementById('ch-play').click(); 1`); await sleep(700); await grab('desafío: pregunta');
await A.ev(`[...document.querySelectorAll('section.scr [data-no]')].pop().click(); 1`); await sleep(300);
await A.ev(`(() => { G.DB.save.chal = { w: G.Challenge.weekId(), at: Date.now(), t: 191, tk: 1 }; G.UI.hideAll(); G.MenuUI.open(); document.getElementById('menu-ch').click(); return 1; })()`); await sleep(700);
await grab('desafío: intento usado'); await misses('desafío: intento usado');
await A.ev(`(() => { window.__rk = [G.SocialUI.needOnline, G.Social.start, G.Ranking.top, G.Ranking.myRank];
  G.SocialUI.needOnline = () => true; G.Social.start = async () => {};
  const row = (id, t, n) => ({ id, t, d: 0, uids: [id], names: [n], dex: [G.Challenge.thisWeek().dex], shiny: [false], lv: 12, kills: 340 });
  G.Ranking.top = async (m, p) => (p === 'c' ? [row('a', 412, 'MiNG'), row('b', 185, 'Sekiam')] : []);
  G.Ranking.myRank = async (m, p) => (p === 'c' ? { pos: 2, t: 185 } : null);
  G.UI.hideAll(); G.MenuUI.open(); document.getElementById('ch-rank').classList.remove('hidden'); document.getElementById('menu-ch').click(); document.getElementById('ch-rank').click(); return 1; })()`); await sleep(1500);
await grab('ranking: desafío semanal'); await click('#rk-scope button:last-child'); await sleep(600); await grab('ranking: desafío semanal (amigos)');
await A.ev(`(() => { G.Ranking.top = async () => []; G.Ranking.myRank = async () => null; document.querySelector('#rk-scope button').click(); return 1; })()`); await sleep(800);
await grab('ranking: desafío semanal (vacío)'); await misses('ranking: desafío semanal');
await A.ev(`(() => { [G.SocialUI.needOnline, G.Social.start, G.Ranking.top, G.Ranking.myRank] = window.__rk; G.DB.save.chal = null; G.UI.hideAll(); G.MenuUI.open(); return 1; })()`); await sleep(500);
for (const t of ['¡Tu marca ya está en el ranking del desafío semanal!', 'El desafío semanal es sólo en solitario: sal de la sala para jugarlo.',
                 'Ya has usado tu intento de esta semana. ¡El lunes hay otro!']) { await A.ev(`G.UI.toast(${JSON.stringify(t)}, 900); 1`); await sleep(350); await grab('toast (desafío)'); }
await misses('desafío: avisos');

// ---------- Ranking con foto y marco, y la build de una marca (24-11-2026): solitario, grupo, daño y una marca de antes ----------
// (Marcas de mentira, como las del desafío: el invitado no tiene nube.)
await A.ev(`(() => { const R = G.Ranking; window.__rk2 = [G.SocialUI.needOnline, G.Social.start, R.top, R.topDmg, R.myRank, R.buildOf];
  G.SocialUI.needOnline = () => true; G.Social.start = async () => {};
  const S = (dex, sh) => ({ dex, sh, lv: 61, t: 1500, its: ['leftovers', 'band'], sk: '',
    mv: [['thunder-shock', 5, 2345678, 10, 1], ['quick-attack', 4, 456789, 30, 0], ['swords-dance', 3, 0, 0, 0]] });
  const ph = (d, e, f) => R.encPh({ d, e, f });
  const solo = { id: 'a', t: 1712, d: 3456789, uids: ['a'], names: ['Sekiam'], dex: [26], shiny: [true], lv: 61, kills: 4321, ph: ph(25, 'Happy', 'ember') };
  const old = { id: 'o', t: 1200, d: 0, uids: ['o'], names: ['Folagor'], dex: [6], shiny: [false], lv: 40, kills: 2000, ph: '' };
  const grp = { id: 'a_b', t: 1400, d: 2000000, uids: ['a', 'b'], names: ['Sekiam', 'PokeAlex'], dex: [26, 6], shiny: [true, false], lv: 50, kills: 3000,
    ph: ph(25, 'Happy', 'ember') + ' ' + ph(6, 'Normal', 'm:6') };
  const builds = { a: R.encTeam([S(26, true)]), a_b: R.encTeam([S(26, true), null]) };
  R.top = async m => (m === 'g' ? [grp] : [solo, old]);
  R.topDmg = async m => ({ rows: m === 'g' ? [grp] : [solo], me: null });
  R.myRank = async () => null;
  R.buildOf = async (b, r) => R.decTeam(builds[r.id] || '');
  G.UI.hideAll(); G.MenuUI.open(); G.RankingUI.open('s'); return 1; })()`); await sleep(1500);
await grab('ranking con fotos');
await click('#rk-list .rk-row'); await sleep(800); await grab('build: solitario'); await click('#rkb-close');
await A.ev(`document.querySelectorAll('#rk-list .rk-row')[1].click(); 1`); await sleep(1000); await grab('build: marca de antes'); await click('#rkb-close');
await click('#rk-mode button:nth-child(2)'); await sleep(800); await grab('ranking en grupo con fotos');
await click('#rk-dlist .rk-row'); await sleep(800); await grab('build: grupo (daño, un jugador sin datos)'); await click('#rkb-close');
await A.ev(`(() => { G.UI.toast(G.I18n.f('No se pudo cargar la build ({x}).', '503'), 900); return 1; })()`); await sleep(350); await grab('toast (build)');
await misses('ranking: build');
await A.ev(`(() => { const R = G.Ranking; [G.SocialUI.needOnline, G.Social.start, R.top, R.topDmg, R.myRank, R.buildOf] = window.__rk2; G.UI.hideAll(); G.MenuUI.open(); return 1; })()`); await sleep(500);

// Aviso de una actualización (login.js, NOTES): sólo sale con cuenta en la nube; aquí se enseña el de guardado automático tal cual.
await A.ev(`(() => { G.UI.hideAll(); G.MenuUI.open();
  document.getElementById('savenote-title').textContent = 'Guardado automático';
  document.getElementById('savenote-body').innerHTML = '<p><b>Tu progreso ahora se guarda solo.</b></p><p>Ya no hace falta el botón Guardar (lo hemos quitado): la partida se sube a la nube al acabar cada partida y al mejorar, comprar o tirar en el gacha. Si juegas en varios aparatos, se ponen al día al volver al juego.</p><p>El punto junto a tu nombre lo indica: verde, guardado en la nube; amarillo, guardando; rojo, sin conexión (se sube sola al volver).</p>';
  document.getElementById('savenote-ok').textContent = 'Entendido';
  document.getElementById('scr-savenote').classList.remove('hidden'); return 1; })()`); await sleep(700);
await grab('aviso de guardado automático'); await misses('aviso de guardado automático');
await A.ev(`document.getElementById('scr-savenote').classList.add('hidden'); 1`);

// ---------- partida ----------
// (con estela y efecto del Vestidor, 23-11-2026)
await A.ev(`(() => { const s = G.DB.save; s.trails.corazonesiris = Date.now(); G.Dress.set(s, 1382, { tr: 'corazonesiris', fx: 'halo' }); return 1; })()`);
// (y con el Objeto inicial: «Empiezas con …» al empezar, 24-11-2026)
await A.ev(`(() => { const s = G.DB.save; G.DB.upgradesOf(1382).sitem = 1; s.psitem[1382] = 'leftovers'; s.held.leftovers = 3; return 1; })()`);
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
// (Antes, sin el bot y sin cartas abiertas: si salían unas de verdad debajo de éstas de prueba, la partida se quedaba en 'levelup' para siempre.)
await A.ev(`window.__POKE_BOT_ON__ = false; 1`);
for (let i = 0; i < 20 && (await A.ev(`G.Game.state`)) !== 'playing'; i++) { await A.ev(`(() => { if (G.UI.isOpen('scr-levelup')) G.RunUI.pick(0); if (G.UI.isOpen('scr-item')) { const c = document.querySelector('#item-cards .card'); if (c) c.click(); } return 1; })()`); await sleep(500); }
// Evolución en plena partida y cartas de mejora nuevas (16-11-2026): las cartas de evolucionar y todas las de mejora, tal cual salen.
await A.ev(`(() => { const p = G.Game.player; G.RunUI.showLevelUp(20, G.LevelUp.evolveCards(p, [G.DEX_BY[134], G.DEX_BY[135]]), () => {}); return 1; })()`); await sleep(900);
await grab('cartas de evolución'); await A.ev(`G.RunUI.closeLevelUp(); G.UI.hide('scr-levelup'); 1`); await sleep(300);
await A.ev(`(() => { const cards = G.LevelUp.STATS.map(s => ({ type: 'stat', key: 'stat:' + s.id, icon: s.icon, color: '#8fa3c4', tag: s.rare ? 'Carta rara' : 'Mejora', title: s.title, desc: s.desc, apply() {} })); G.RunUI.showLevelUp(21, cards, () => {}); return cards.length; })()`); await sleep(900);
await grab('cartas de mejora (todas)'); await A.ev(`G.RunUI.closeLevelUp(); G.UI.hide('scr-levelup'); 1`); await sleep(300);
for (const t of ['¡Eevee ha evolucionado a Vaporeon!', '¡Mewtwo se hace más fuerte!']) { await A.ev(`G.Spawner.say(${JSON.stringify(t)}, 2, true); 1`); await sleep(500); }
// Avisos del cooperativo sin cortes, del gacha sin conexión y del ranking (12-11-2026): en una partida en solitario
// no salen, así que se pintan aquí como los pinta el juego (aviso del centro y rótulo del HUD en el canvas, y toast).
for (const t of ['Pikachu se ha ido: MiNG pasa a ser el anfitrión…', 'Pikachu se ha ido: pasas a ser el anfitrión…', 'Cambio de anfitrión: conectando con MiNG…',
                 'Cambio de anfitrión: la partida sigue (ya no cuenta para el ranking)', 'Pausa: esperando a MiNG (anfitrión)…',
                 'No se ha podido seguir en grupo: continúas en solitario con todo lo que llevabas.',
                 'Se ha perdido el grupo: continúas en solitario con todo lo que llevabas.',
                 'Otro jugador ha pasado a ser el anfitrión: continúas en solitario con todo lo que llevabas.']) {
  await A.ev(`G.Spawner.say(${JSON.stringify(t)}, 2, true); 1`); await sleep(500);
}
await A.ev(`document.getElementById('game').getContext('2d').fillText('SIN CONEXIÓN', -500, -500); G.Spawner.say('', 0, true); 1`);
for (const t of ['Sin conexión: con tu cuenta, el gacha necesita internet.', 'Sin conexión: tu marca se enviará al ranking en cuanto vuelva.',
                 'Tu marca no ha podido entrar en el ranking.', 'Se ha perdido el grupo: continúas en solitario con todo lo que llevabas.']) {
  await A.ev(`G.UI.toast(${JSON.stringify(t)}, 900); 1`); await sleep(350); await grab('toast (avisos nuevos)');
}
await A.ev(`G.Eggs.riftWon(); 1`); await sleep(600);   // «¡Huevo!» sobre tu Pokémon; llega al acabar la partida (resumen)
await canvas('partida (HUD, esferas, clima)');
await A.ev(`window.__POKE_BOT_ON__ = false; G.RunUI.showItemChoice('leftovers', 'assaultvest', () => {}); 1`); await sleep(800); await grab('elegir objeto'); await A.ev(`document.querySelector('#item-cards .card').click(); 1`); await sleep(500);
await A.ev(`(() => { const pl = G.Game.player; const loose = pl.slots.filter(s => s.length === 1).map(s => s[0]); if (loose.length >= 2) G.RunUI.showBond({ mode: 'pair', group: null, loose }, () => {}); return loose.length; })()`); await sleep(800); await grab('vínculo'); await A.ev(`G.UI.hide('scr-bond'); 1`);
// Quitamovimientos (23-11-2026): la carta, qué quitas, qué pones y el aviso al cambiar.
await A.ev(`(() => { const p = G.Game.player; p.level = Math.max(p.level, 6); for (const id of G.Moves.poolFor(p.mon)) if (p.slots.length < p.maxMoves) p.addMove(id);
  let r = []; for (let i = 0; i < 400 && !r.some(c => c.type === 'remove'); i++) r = G.LevelUp.offer(p); window.__rmCards = r;
  G.RunUI.showLevelUp(p.level, r, c => { c.apply(p); G.UI.hide('scr-levelup'); }); return r.length; })()`); await sleep(900);
await grab('carta Quitamovimientos');
await A.ev(`G.RunUI.pick(window.__rmCards.findIndex(c => c.type === 'remove')); 1`); await sleep(400); await grab('Quitamovimientos: qué quitas');
await A.ev(`G.RunUI.pick(0); 1`); await sleep(400); await grab('Quitamovimientos: qué pones');
await A.ev(`G.RunUI.pick([...document.querySelectorAll('#cards .card')].findIndex(c => c.dataset.key.startsWith('rm:to:'))); 1`); await sleep(1200);
await canvas('Quitamovimientos (aviso)');
await A.ev(`(() => { const p = G.Game.player; const r = window.__rmCards; r.forEach(c => { if (c.type === 'remove') c.done = false; }); G.RunUI.showLevelUp(p.level, r, c => { c.apply(p); G.UI.hide('scr-levelup'); }); return 1; })()`); await sleep(900);
await A.ev(`G.RunUI.pick(window.__rmCards.findIndex(c => c.type === 'remove')); 1`); await sleep(300); await A.ev(`G.RunUI.pick(0); 1`); await sleep(300);
await A.ev(`G.RunUI.pick([...document.querySelectorAll('#cards .card')].findIndex(c => c.dataset.key === 'rm:empty')); 1`); await sleep(1200);
await canvas('Quitamovimientos (hueco libre)'); await misses('Quitamovimientos');
// Ataques exclusivos (24-11-2026): su carta especial (Kyogre Primigenio: Pulso Primigenio), con hueco libre y con los cuatro llenos (qué cambias)
await A.ev(`(() => { const p = G.Game.player; p.level = Math.max(p.level, 10); p.banned.clear(); const sig = G.Moves.sigFor(p.ownMon || p.mon); for (const id of sig) { const m = p.moves.find(x => x.id === id); if (m) p.swapMove(m, null); }
  if (p.slots.length >= p.maxMoves) p.swapMove(p.moves[p.moves.length - 1], null);
  let r = []; for (let i = 0; i < 400 && !r.some(c => c.type === 'sig'); i++) r = G.LevelUp.offer(p); window.__sgCards = r;
  G.RunUI.showLevelUp(p.level, r, c => { c.apply(p); G.UI.hide('scr-levelup'); }); return r.length; })()`); await sleep(900);
await grab('carta de ataque exclusivo');
await A.ev(`G.RunUI.pick(window.__sgCards.findIndex(c => c.type === 'sig')); 1`); await sleep(1200);
await canvas('ataque exclusivo aprendido');
await A.ev(`(() => { const p = G.Game.player; for (const id of G.Moves.sigFor(p.ownMon || p.mon)) { const m = p.moves.find(x => x.id === id); if (m) p.swapMove(m, null); }
  for (const id of G.Moves.poolFor(p.mon)) if (p.slots.length < p.maxMoves && !p.hasMove(id)) p.addMove(id);
  let r = []; for (let i = 0; i < 400 && !r.some(c => c.type === 'sig'); i++) r = G.LevelUp.offer(p); window.__sgCards = r;
  G.RunUI.showLevelUp(p.level, r, c => { c.apply(p); G.UI.hide('scr-levelup'); }); return r.length; })()`); await sleep(900);
await grab('carta de ataque exclusivo (huecos llenos)');
await A.ev(`G.RunUI.pick(window.__sgCards.findIndex(c => c.type === 'sig')); 1`); await sleep(400); await grab('ataque exclusivo: qué cambias');
await A.ev(`G.RunUI.pick(0); 1`); await sleep(1200);
await canvas('ataque exclusivo (cambiado)'); await misses('ataque exclusivo');
// Varios objetos a la vez (16-11-2026): la elección con los huecos llenos, y todos los objetos (nombre y lo que hacen) en la pausa.
await A.ev(`G.RunUI.showItemChoice(['leftovers', 'metronome', 'heavyboots'], 'luckincense', () => {}); 1`); await sleep(800); await grab('elegir objeto (tres huecos)');
await A.ev(`G.UI.hide('scr-item'); (() => { const p = G.Game.player; p.itemSlots = 40; for (const it of G.Items.LIST) p.equip(it.id); return p.items.length; })()`); await sleep(400);
await A.ev(`G.Game.togglePause(); 1`); await sleep(800); await grab('pausa'); await A.ev(`G.Game.togglePause(); 1`); await sleep(300);
await misses('partida');

// ---------- Objetos de un solo uso y Munchlax hambriento (23-11-2026) ----------
await A.ev(`(() => { const p = G.Game.player; G.Consum.IDS.forEach((id, i) => G.Pickups.drop('use', p.x - 150 + i * 40, p.y + 60, id)); return 1; })()`); await sleep(800);
await canvas('objetos de un solo uso (suelo)');
await A.ev(`(() => { const p = G.Game.player; for (const id of G.Consum.IDS) G.Consum.take(p, id); p.invuln = 0; p.hp = Math.max(1, p.maxHp * 0.2); p.slowT = 2; return 1; })()`); await sleep(1500);
await canvas('objetos de un solo uso (usados)'); await misses('objetos de un solo uso');
await A.ev(`G.Events.debugStart('munch'); 1`); await sleep(2500);
await canvas('Munchlax'); await misses('Munchlax');
await A.ev(`(() => { const m = G.Events.munchInfo, p = G.Game.player; if (!m) return 0; for (const b of m.bushes.filter(b => b.kind !== m.want)) { p.x = b.x; p.y = b.y; } p.x = m.x + 10; p.y = m.y; return 1; })()`); await sleep(1500);
await canvas('Munchlax (sin la buena)'); await misses('Munchlax (sin la buena)');
for (let i = 0; i < 4; i++) { await A.ev(`(() => { const m = G.Events.munchInfo, p = G.Game.player; const b = m && m.bushes.find(b => b.kind === m.want && !b.shaken); if (b) { p.x = b.x; p.y = b.y; } return 1; })()`); await sleep(500); }
await A.ev(`(() => { const m = G.Events.munchInfo, p = G.Game.player; if (m) { p.x = m.x + 10; p.y = m.y; } return 1; })()`); await sleep(2000);
await canvas('Munchlax (premio)'); await grab('Munchlax (premio)'); await misses('Munchlax (premio)');
for (let i = 0; i < 6 && (await A.ev(`G.UI.isOpen('scr-item') || G.UI.isOpen('scr-levelup')`)); i++) { await A.ev(`(() => { if (G.UI.isOpen('scr-levelup')) G.RunUI.pick(0); const c = document.querySelector('#item-cards .card'); if (G.UI.isOpen('scr-item') && c) c.click(); return 1; })()`); await sleep(1500); }
await A.ev(`(() => { for (const e of G.EnemyMgr.all()) if (e.dex === 415) e.dead = true; return 1; })()`);

// ---------- El legendario de la grieta (23-11-2026, systems/legend.js): sus 5 ataques, las 3 fases y el definitivo ----------
// (Si el bot ha caído antes, o las cartas de prueba de arriba han dejado la partida parada en 'levelup' sin pantalla,
//  partida nueva: lo que queda del barrido necesita una partida en marcha.)
for (let i = 0; i < 6 && (await A.ev(`G.UI.isOpen('scr-levelup') || G.UI.isOpen('scr-item')`)); i++) { await A.ev(`(() => { if (G.UI.isOpen('scr-levelup')) G.RunUI.pick(0); const c = document.querySelector('#item-cards .card'); if (G.UI.isOpen('scr-item') && c) c.click(); return 1; })()`); await sleep(1000); }
if ((await A.ev(`G.Game.state`)) !== 'playing') { await A.ev(`G.UI.hideAll(); G.Game.startRun(); 1`); await sleep(2500); }
await A.ev(`(() => { window.__POKE_BOT_ON__ = false; window.__rfHeal = setInterval(() => { const q = G.Game.player; if (q && !q.dead) q.hp = q.maxHp; if (G.UI.isOpen('scr-levelup')) G.RunUI.pick(0); const c = document.querySelector('#item-cards .card'); if (G.UI.isOpen('scr-item') && c) c.click(); }, 200); for (const e of G.EnemyMgr.all()) if (e.boss) e.dead = true; G.Rift.debugArena('ghost'); return 1; })()`);
for (let i = 0; i < 20 && (await A.ev(`!G.Legend.boss`)); i++) await sleep(500);
await sleep(2500); await canvas('grieta: entrada'); await misses('grieta: entrada');
for (let i = 0; i < 5; i++) { await A.ev(`(() => { const b = G.Legend.boss; if (b && b.ai) b.ai.cd = 9; G.Legend.debugCast(${i}); return 1; })()`); await sleep(1000); }
await canvas('grieta: fase 1 y los 5 ataques');
const rfHit = n => A.ev(`(() => { const b = G.Legend.boss; if (b) for (let i = 0; i < ${n}; i++) b.hurt(1e12, '#fff', 0, 0, 0); return 1; })()`);
await rfHit(6); await sleep(2000); await canvas('grieta: fase 2'); await misses('grieta: fase 2');
await rfHit(6); await sleep(1000); await canvas('grieta: fase 3');
for (let i = 0; i < 12 && !(await A.ev(`!!G.Legend.ult`)); i++) await sleep(300);
await A.ev(`(() => { const p = G.Game.player, u = G.Legend.ult; if (!u) return 0; for (let k = 0; k < 60; k++) { const a = k * 2.4, d = 70 + k * 3; const x = u.x + Math.cos(a) * d, y = u.y + Math.sin(a) * d; if (G.World.isFree(x, y, p.r) && !G.Legend.covered(x, y)) { p.x = x; p.y = y; break; } } return 1; })()`);
await sleep(1200); await canvas('grieta: ataque definitivo (al descubierto)');
await A.ev(`(() => { const p = G.Game.player, u = G.Legend.ult; if (!u) return 0; for (const c of G.Legend.covers) { const d = Math.hypot(c.x - u.x, c.y - u.y); if (d < 60) continue; const x = c.x + (c.x - u.x) / d * (c.r + p.r + 8), y = c.y + (c.y - u.y) / d * (c.r + p.r + 8); if (G.World.isFree(x, y, p.r) && G.Legend.covered(x, y)) { p.x = x; p.y = y; return 1; } } return 0; })()`);
await sleep(800); await canvas('grieta: ataque definitivo (a cubierto)');
for (let i = 0; i < 25 && (await A.ev(`!!G.Legend.ult`)); i++) await sleep(300);
await sleep(800); await canvas('grieta: tras el definitivo'); await misses('grieta: definitivo');
await rfHit(12); await sleep(800); await A.ev(`(() => { G.Game.player.bonds = 0; return 1; })()`);
for (let i = 0; i < 20 && (await A.ev(`G.Rift.inArena`)); i++) await sleep(500);
await canvas('grieta: victoria'); await misses('grieta: victoria');
console.log('grieta:', await A.ev(`'en la arena ' + G.Rift.inArena + ' · pelea ' + G.Legend.active + ' · estado ' + G.Game.state`));
await A.ev(`clearInterval(window.__rfHeal); 1`);

// ---------- Eternatus Eternamax (minuto 20, 23-11-2026): aviso, las 4 fases, oscuridad, núcleos, victoria ----------
await A.ev(`(() => { window.__POKE_BOT_ON__ = false; const p = G.Game.player; window.__hp0 = p.maxHp; p.maxHp = 1e7; p.hp = 1e7; window.__etHeal = setInterval(() => { const q = G.Game.player; if (q && !q.dead) q.hp = q.maxHp; }, 200); G.Game.debugTime(1196); return 1; })()`);
const etHit = n => A.ev(`(() => { const b = G.Eternatus.boss; if (b) for (let i = 0; i < ${n}; i++) b.hurt(1e12, '#fff', 0, 0, 0); for (const c of G.EnemyMgr.all().filter(e => e.etCore && !e.dead && ${n} > 90)) c.hurt(1e12, '#fff', 0, 0, 0); return 1; })()`);
const etPick = () => A.ev(`(() => { if (G.UI.isOpen('scr-levelup')) G.RunUI.pick(0); if (G.UI.isOpen('scr-item')) { const c = document.querySelector('#item-cards .card'); if (c) c.click(); } return 1; })()`);
for (let i = 0; i < 12; i++) { await sleep(1000); await etPick(); if ((await A.ev(`G.Eternatus.phase`)) === 'p1') break; }
await sleep(4000); await canvas('Eternatus fase 1');
await etHit(20); await sleep(2500); await canvas('Eternatus fase 2 (núcleos)');
await etHit(99); await sleep(800); await etPick(); await etHit(20); await sleep(1500); await etPick();
for (let i = 0; i < 30; i++) { await sleep(500); await etPick(); if (await A.ev(`G.Eternatus.fx.some(f => f.kind === 'dark' || f.kind === 'vortex')`)) break; }
await sleep(1500); await canvas('Eternatus fase 3');
await etHit(20); await sleep(2500); await etPick(); await canvas('Eternatus: Rayo Eternamax');
await etHit(99); await sleep(1000); await etPick(); await canvas('Eternatus aturdido');
await etHit(20); for (let i = 0; i < 20; i++) { await sleep(600); await etPick(); if (!(await A.ev(`G.Eternatus.active`))) break; }
await canvas('Eternatus: victoria y vuelta'); await misses('Eternatus');
console.log('Eternatus:', await A.ev(`(G.Eternatus.phase || 'acabado') + ' · estado ' + G.Game.state + ' · pantallas ' + [...document.querySelectorAll('section.scr')].filter(x => !x.classList.contains('hidden')).map(x => x.id).join(',') + ' · poder pendiente ' + !!G.Powers.pending + ' · t ' + Math.round(G.Game.st.time)`));

// ---------- Los poderes (tras vencer a Eternatus, 23-11-2026): elegir, formas, tipos y cada uno puesto ----------
const pwSeen = [];
const pwOpen = async () => { for (let i = 0; i < 80 && !(await A.ev(`G.UI.isOpen('scr-power')`)); i++) { await sleep(500); await etPick(); } pwSeen.push(await A.ev(`G.UI.isOpen('scr-power')`)); await sleep(1400); };
const pwTap = async key => { await A.ev(`(() => { const l = [...document.querySelectorAll('#power-cards .card')]; const c = l.find(x => x.dataset.power === ${JSON.stringify(key)}) || l[l.length - 1]; if (c) c.click(); return 1; })()`); await sleep(1400); };
const pwUse = async (where) => { for (let i = 0; i < 20 && (await A.ev(`G.Game.state`)) !== 'playing'; i++) { await sleep(300); await etPick(); }
  await A.ev(`G.Input.virtual('keyf'); 1`); await sleep(2500); await canvas(where); await misses(where);
  await A.ev(`G.Powers.stop(G.Game.player); 1`); await sleep(1500); await canvas(where + ' (fin)'); };
const pwAgain = dex => A.ev(`(() => { const p = G.Game.player; p.powerId = null; window.__dex0 = p.dex; if (${dex}) p.dex = ${dex}; G.Powers.offer(p); return 1; })()`);
await pwOpen(); await grab('elige poder'); await misses('elige poder');
await pwTap('power:z'); await grab('Pulsera Z: tipo'); await misses('Pulsera Z: tipo');
await pwTap('?'); await pwUse('Pulsera Z');
await pwAgain(646); await pwOpen(); await grab('elige poder (con Mega)');
await pwTap('power:mega'); await grab('Mega: forma'); await misses('Mega: forma');
await pwTap('?'); await A.ev(`(() => { G.Game.player.dex = window.__dex0; return 1; })()`); await pwUse('Megaevolución');
await pwAgain(0); await pwOpen(); await pwTap('power:tera'); await grab('Teracristal: tipo'); await misses('Teracristal: tipo');
await pwTap('?'); await pwUse('Teracristal');
await pwAgain(0); await pwOpen(); await pwTap('power:dyna'); await pwUse('Dinamax');
console.log('poderes: pantallas abiertas', pwSeen.filter(Boolean).length + '/' + pwSeen.length, JSON.stringify(pwSeen));

// ---------- El Team Rocket y su Casino Rocket (23-11-2026): el secuestro, la entrada y los 4 juegos, con lo que puede salir ----------
const cas = async where => { await grab('casino: ' + where); await misses('casino: ' + where); await canvas('casino: ' + where); };
const casClick = async sel => { await A.ev(`(() => { const b = document.querySelector(${JSON.stringify(sel)}); if (b) b.click(); return !!b; })()`); };
for (let i = 0; i < 20 && (await A.ev(`G.Game.state`)) !== 'playing'; i++) { await A.ev(`(() => { if (G.SettingsUI.isOpen) G.SettingsUI.close(); if (G.Game.state === 'paused') G.Game.togglePause(); return 1; })()`); await sleep(400); await etPick(); }
await A.ev(`(() => { window.__POKE_BOT_ON__ = false; G.DB.save.coins = Math.max(G.DB.save.coins, 50000); delete G.DB.save.skins['obsidiana-mewtwo']; return G.Casino.debugOpen(); })()`); await sleep(1500);
await cas('secuestro');
await casClick('#cas-body [data-a=in]'); await sleep(800); await cas('entrada');
await A.ev(`G.CasinoUI.debugView('slots'); 1`); await sleep(500); await cas('tragaperras');
for (const r of [['ball', 'pika', 'seven'], ['berry', 'ball', 'berry'], ['pika', 'pika', 'pika'], ['rocket', 'rocket', 'rocket']]) {
  await A.ev(`G.Casino.debugRig({ slots: ${JSON.stringify(r)} }); document.getElementById('cas-spin').click(); 1`); await sleep(2700); await cas('tragaperras ' + r.join('/'));
}
await A.ev(`(() => { window.__cc = G.DB.save.coins; G.DB.save.coins = 3; document.getElementById('cas-spin').click(); return 1; })()`); await sleep(400); await cas('tragaperras sin monedas');
await A.ev(`(() => { G.DB.save.coins = window.__cc; window.__od = Object.getOwnPropertyDescriptor(G.DB, 'online'); Object.defineProperty(G.DB, 'online', { get: () => true, configurable: true }); return 1; })()`);
await A.send('Network.enable'); await A.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
await A.ev(`document.getElementById('cas-spin').click(); 1`); await sleep(400); await cas('tragaperras sin conexión');
await A.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
await A.ev(`(() => { Object.defineProperty(G.DB, 'online', window.__od); return 1; })()`);
await A.ev(`G.CasinoUI.debugView('voltorb'); 1`); await sleep(500); await cas('Voltorb escondido');
await A.ev(`G.Casino.debugRig({ voltorb: [0, 1, 2, 3, 4] }); 1`); await casClick('.vf-tile[data-i="10"]'); await sleep(300); await casClick('.vf-tile[data-i="11"]'); await sleep(300); await cas('Voltorb: dos buenas');
await casClick('#vf-cash'); await sleep(400); await cas('Voltorb: plantarse');
await casClick('#vf-again'); await sleep(300); await A.ev(`G.Casino.debugRig({ voltorb: [0, 1, 2, 3, 4] }); 1`); await casClick('.vf-tile[data-i="12"]'); await sleep(200); await casClick('.vf-tile[data-i="2"]'); await sleep(400); await cas('Voltorb: boom');
await A.ev(`G.CasinoUI.debugView('race'); 1`); await sleep(1200); await cas('carrera');
await A.ev(`G.Casino.debugRig({ race: 1 }); document.querySelectorAll('.rc-pick')[1].click(); document.getElementById('rc-go').click(); 1`); await sleep(2500); await cas('carrera en marcha');
for (let i = 0; i < 20 && (await A.ev(`!!G.CasinoUI.state.running`)); i++) await sleep(500);
await sleep(300); await cas('carrera ganada');
await casClick('#rc-go'); await sleep(400);
await A.ev(`G.Casino.debugRig({ race: 0 }); document.querySelectorAll('.rc-pick')[4].click(); document.getElementById('rc-go').click(); 1`); await sleep(500);
for (let i = 0; i < 20 && (await A.ev(`!!G.CasinoUI.state.running`)); i++) await sleep(500);
await sleep(300); await cas('carrera perdida');
const pkIn = `(() => { const s = G.CasinoUI.state, p = s.p; p.x = 180; p.y = s.cv.height / 2 + 22; p.tx = p.x; p.ty = p.y; p.wait = 5; p.vis = 1; return 1; })()`;
const pkOut = `(() => { const s = G.CasinoUI.state, p = s.p; p.x = 20; p.y = 40; p.tx = p.x; p.ty = p.y; p.wait = 5; p.vis = 1; return 1; })()`;
const pkReady = async () => { for (let i = 0; i < 30 && !(await A.ev(`G.CasinoUI.state.p.vis >= 1 && !G.CasinoUI.state.ball`)); i++) await sleep(200); };
const pkThrow = async (inside, ok, where) => { await pkReady(); await A.ev(inside ? pkIn : pkOut); await A.ev(`G.Casino.debugRig({ pika: ${ok} }); document.getElementById('pk-go').click(); 1`); await sleep(2300); if (where) await cas(where); };
await A.ev(`G.CasinoUI.debugView('pika'); 1`); await sleep(1500); await cas('¡Atrapa a Pikachu!');
await casClick('#pk-go'); await sleep(500); await cas('Pikachu: jugando');
await pkThrow(false, false, 'Pikachu: fuera del aro'); await pkThrow(true, false, 'Pikachu: se escapa de la bola');
await pkThrow(true, true, 'Pikachu: plan 2'); await pkThrow(true, true, 'Pikachu: plan 3'); await pkThrow(true, true, 'Pikachu: skin conseguida');
await A.ev(`G.CasinoUI.debugView('pika'); 1`); await sleep(1200); await cas('Pikachu (ya con la skin)');
await casClick('#pk-go'); await sleep(400);
await pkThrow(true, true); await pkThrow(true, true); await pkThrow(true, true, 'Pikachu: premio en monedas');
await casClick('#pk-go'); await sleep(400);
await pkThrow(false, false); await pkThrow(false, false); await pkThrow(false, false, 'Pikachu: se ha escapado');
await A.ev(`G.Input.virtual('escape'); 1`); await sleep(600); await A.ev(`G.Input.virtual('escape'); 1`); await sleep(1200);
console.log('casino:', await A.ev(`'abierto ' + G.Casino.isOpen + ' · estado ' + G.Game.state + ' · estela ' + !!G.DB.save.unlocks.rocketTrail + ' · skin ' + !!G.DB.save.skins['obsidiana-mewtwo']`));
// ---------- La Sentencia de Arceus en la Sala del Origen (23-11-2026): llegada, los ataques nuevos y sus avisos, Aspas
// Doradas, suelo roto, objetos rotos, ataque roto y juzgado (lo de los compañeros, con el aviso que les llega) ----------
for (let i = 0; i < 30 && (await A.ev(`G.Game.state`)) !== 'playing'; i++) { await A.ev(`(() => { const l = document.querySelectorAll('#power-cards .card'); if (G.UI.isOpen('scr-power') && l.length) l[l.length - 1].click(); return 1; })()`); await etPick(); await sleep(500); }
console.log('Sentencia (empieza):', await A.ev(`(() => { try { G.Powers.stop(G.Game.player); const s = G.DB.save; s.stats = s.stats || {}; s.stats.judged = 1; const p = G.Game.player; p.itemSlots = 4; for (const id of ['amuletcoin', 'leftovers']) p.equip(id); p.maxMoves = Math.max(p.maxMoves, p.moves.length + 1); p.addMove('quick-attack'); const h0 = p.hurt; p.hurt = function (a, ...r) { return h0.call(this, Math.min(a, this.maxHp * 0.05), ...r); }; G.Halloween.runStart(false); G.Judgment.debugStart(); G.Halloween.runStart(true); return G.Game.state + ' activa=' + G.Judgment.active; } catch (e) { return 'ERR ' + e.message; } })()`)); await sleep(1500);
await A.ev(`G.Judgment.skip(); 1`);
for (let i = 0; i < 30 && !(await A.ev(`!!G.Judgment.arceus`)); i++) { await sleep(500); await etPick(); }
await sleep(1500); await canvas('Sentencia (llegada)'); await misses('Sentencia (llegada)');
for (const id of ['rain', 'cross', 'nova', 'extreme', 'future', 'gravity', 'hyper', 'plates']) { await A.ev(`G.Judgment.debugCast('${id}'); 1`); await sleep(id === 'gravity' || id === 'plates' ? 1500 : 700); }
await A.ev(`G.Judgment.debugCrack(6); 1`); await sleep(2800);
for (const t of [28, 58, 88, 118, 148, 298, 418]) { await A.ev(`G.Judgment.debugAt(${t}); 1`); await sleep(2600); await canvas('Sentencia ' + t + ' s'); await etPick(); }
await A.ev(`G.Judgment.debugRip(); 1`); await sleep(1500);
await A.ev(`(() => { G.Judgment.onEvent(['jx', 'm', 'otro', 'agility']); return 1; })()`); await sleep(800);
await A.ev(`(() => { G.Judgment.onEvent(['jx', 'r', 'otro']); G.Judgment.onEvent(['jx', 'm', 'otro', '']); return 1; })()`); await sleep(800);
await A.ev(`(() => { G.Judgment.onEvent(['jx', 'j', 'otro']); return 1; })()`); await sleep(800);
await A.ev(`G.Judgment.debugJudge(); 1`); await sleep(1200);
await canvas('Sentencia (avisos)'); await grab('Sentencia'); await misses('Sentencia');
console.log('Sentencia:', await A.ev(`JSON.stringify(Object.assign({}, G.Judgment.summary(), G.Judgment.debug))`));
await A.ev(`(() => { delete G.Game.player.hurt; clearInterval(window.__etHeal); const p = G.Game.player; p.maxHp = window.__hp0 || 100; p.hp = 1; return 1; })()`);

await A.ev(`(() => { const p = G.Game.player; p.invuln = 0; p.hurt(999999, null, true); return 1; })()`);
for (let i = 0; i < 20; i++) { await sleep(1000); if ((await A.ev(`G.Game.state`)) === 'over') break; }
await sleep(2500); await grab('fin de partida'); await misses('fin de partida'); await canvas('fin de partida');
await A.ev(`(() => { const o = document.getElementById('over-stats'); o.insertAdjacentHTML('afterbegin', G.RunUI.masteryLine({ dex: 352, pts: 1234, total: 61234, got: G.Mastery.TIERS })); return 1; })()`); await sleep(800);
await grab('fin de partida: maestría'); await misses('fin de partida: maestría');

// ---------- Desafío semanal en partida (23-11-2026): aviso, rótulo del HUD, ticket de los 3 minutos y resumen, con cada condición ----------
for (const [i, [cond, x]] of [['wx', { wx: 'sand' }], ['type', { type: 'psychic' }], ['noheal', {}], ['night', {}]].entries()) {
  await A.ev(`(() => { const b = document.getElementById('btn-again'); if (G.Game.state === 'over' && b) b.click(); window.__POKE_BOT_ON__ = false; return 1; })()`); await sleep(1200);
  await chSet(cond, x);
  await A.ev(`(() => { G.UI.hideAll(); G.Challenge.arm(); G.Flow.play(); return 1; })()`); await sleep(2500);
  if (!i) { await A.ev(`(() => { G.Game.debugTime(179.6); return 1; })()`); await sleep(1500); }
  await canvas('desafío en partida ' + cond); await misses('desafío en partida ' + cond);
  await A.ev(`(() => { const p = G.Game.player; p.invuln = 0; p.hurt(999999, null, true); return 1; })()`);
  for (let k = 0; k < 20 && (await A.ev(`G.Game.state`)) !== 'over'; k++) await sleep(500);
  await sleep(1500); await grab('desafío: resumen ' + cond); await misses('desafío: resumen ' + cond);
  console.log('desafío en partida:', cond, '·', await A.ev(`G.Game.state + ' · ' + ((document.querySelector('#over-stats .over-ch') || {}).innerText || '(sin fila del desafío)').replace(/\\n+/g, ' | ')`));
}

// ---------- resultado ----------
const list = [...found.entries()];
console.log('restos en latín:', list.length);
for (const [t, where] of list.slice(0, 80)) console.log('  ·', where.padEnd(28), '|', t);
console.log('errores de página:', A.errs.slice(0, 3).join(' || ') || 'ninguno');
A.close(); process.exit(list.length ? 1 : 0);
