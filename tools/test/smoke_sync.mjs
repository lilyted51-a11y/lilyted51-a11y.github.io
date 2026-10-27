/* smoke_sync.mjs — tras sincronizar con upstream: menú, Halloween forzado, esferas, mochila, ranking, una partida corta y la publicada (copia local) */
import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(+(process.argv[2] || 9333));
const latin = s => [...new Set((s.match(/[A-Za-zÀ-ž][A-Za-zÀ-ž' .]{3,}/g) || []).map(x => x.trim()))].filter(x => !/^(PokéSurvivor|Pok[eé]mon|Mega|HP|Kecleon|TheAdro7|Bot|AI|Gengar|Pikachu|Umbreon|Halloween)\b/i.test(x));
const vis = () => A.ev(`[...document.querySelectorAll('section.scr')].filter(x => !x.classList.contains('hidden')).map(x => x.id).join(',')`);
await A.go('http://localhost:8765/dev.html?dev&halloween=1', 8000);
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); const s = G.DB.save; s.partner = 94; s.owned[94] = { at: 1 }; s.owned[25] = { at: 1 }; s.coins = 99999; s.bag = { candy: 900 }; G.UI.hideAll(); G.MenuUI.open(); 1`); await sleep(1500);
console.log('halloween on:', await A.ev(`!!(G.Halloween && G.Halloween.on)`), '| cuenta atrás:', await A.ev(`(document.getElementById('menu-hw') || {}).innerText || '(no hay)'`));
const menu = await A.ev(`document.getElementById('scr-menu').innerText`);
console.log('menú latin:', JSON.stringify(latin(menu)).slice(0, 300));
await A.ev(`document.querySelector('#scr-menu [data-go=shop]').click(); 1`); await sleep(1500);
const shop = await A.ev(`document.getElementById('scr-shop').innerText`);
console.log('tienda (Halloween) latin:', JSON.stringify(latin(shop)).slice(0, 300), '| skins a la venta:', (shop.match(/300/g) || []).length);
console.log('skin gengar:', await A.ev(`(() => { try { const s = G.DB.save; s.skins = { 'bruja-gengar': Date.now() }; G.Skins.wear(s, 94, 'bruja-gengar'); return 'puesta=' + G.Skins.worn(s, 94) + ' tiene=' + G.Skins.owns(s, 'bruja-gengar'); } catch (e) { return 'ERR ' + e.message; } })()`));
await A.ev(`G.ShopUI.openBag(); 1`); await sleep(800);
console.log('mochila latin:', JSON.stringify(latin(await A.ev(`document.getElementById('scr-bag').innerText`))).slice(0, 300));
await A.ev(`G.UI.hideAll(); G.MenuUI.open(); document.querySelector('#scr-menu [data-go=gacha]').click(); 1`); await sleep(1500);
console.log('gacha pestañas:', await A.ev(`[...document.querySelectorAll('#gacha-gens .gen-tab')].filter(t => !t.classList.contains('hidden')).length`), '| botones:', await A.ev(`['pull-10','pull-10b','pull-100','pull-1000','pull-100b'].map(id => id + '=' + (document.getElementById(id) ? (document.getElementById(id).disabled ? 'off' : 'on') : 'no')).join(' ')`));
await A.ev(`G.DB.save.tickets = { t1: 500, t10: 50 }; G.UI.hideAll(); G.MenuUI.open(); document.querySelector('#scr-menu [data-go=gacha]').click(); 1`); await sleep(800);
A.errs.length = 0;
await A.ev(`document.getElementById('pull-100').click(); 1`); await sleep(6000);
console.log('×100 resultado:', await A.ev(`document.querySelectorAll('#pull-results .card').length + ' cartas · ' + ((document.querySelector('.mass-sum') || {}).innerText || '(sin resumen)').slice(0, 80)`), '| errores:', A.errs.slice(0, 3).join(' || ') || 'ninguno');
await A.ev(`document.getElementById('pull-close').click(); 1`); await sleep(500);
await A.ev(`G.UI.hideAll(); G.MenuUI.open(); document.querySelector('#scr-menu [data-go=rank]').click(); 1`); await sleep(2500);
const rk = await A.ev(`document.getElementById('scr-rank').innerText`);
console.log('ranking latin:', JSON.stringify(latin(rk)).slice(0, 300));
// partida corta con el bot: esferas y nada de errores
A.errs.length = 0;
await A.ev(`G.UI.hideAll(); G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.Game.startRun(); G.Game.debugSpeed(3); window.__POKE_BOT_ON__ = true; 1`);
for (let i = 0; i < 25; i++) { await sleep(2000); if ((await A.ev(`G.Game.state`)) === 'over') break; }
console.log('run:', await A.ev(`(() => { const p = G.Game.player; return 'state ' + G.Game.state + ' t ' + Math.round(G.Game.st.time) + ' lv ' + p.level + ' skin ' + (p.anim && p.anim.skin) + ' orbes ' + JSON.stringify(p.orbs || p.spheres || null).slice(0, 60); })()`), '| errores:', A.errs.slice(0, 4).join(' || ') || 'ninguno');
await A.ev(`window.__POKE_BOT_ON__ = false; G.Game.quit(); 1`); await sleep(1500);
// publicada
A.errs.length = 0;
await A.go('http://localhost:8765/index.html', 9000);
await A.ev(`document.getElementById('tap-start') && document.getElementById('tap-start').click(); 1`); await sleep(1500);
console.log('index: menú', await A.ev(`(document.querySelector('[data-go=shop]') || {}).innerText.split(String.fromCharCode(10)).join(' / ')`), '| errores index:', A.errs.slice(0, 5).join(' || ') || 'ninguno');
A.close(); process.exit(0);
