/* over_zh.mjs — la pantalla de fin de partida y el resumen de la pausa en chino, en la publicada (copia local)
 * node tools/test/over_zh.mjs <puerto>  — empieza una partida con el bot, pausa (resumen), muere y mira qué queda sin traducir. */
import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(+(process.argv[2] || 9333));
const latin = s => [...new Set((s.match(/[A-Za-zÀ-ž][A-Za-zÀ-ž' .]{2,}/g) || []).map(x => x.trim()))].filter(x => !/^(PokéSurvivor|Pok[eé]mon|Mega|HP|Kecleon|Bot|AI|Nv|Lv|Primal|Kyogre|Mewtwo|Gengar|Pikachu|Umbreon|Arceus)\b/i.test(x));
await A.go('http://localhost:8765/dev.html?dev', 8000);
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); const s = G.DB.save; s.partner = 1382; s.owned[1382] = { at: 1 }; G.UI.hideAll(); G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.Game.startRun(); G.Game.debugSpeed(3); window.__POKE_BOT_ON__ = true; 1`);
await sleep(20000);
// pausa: resumen
await A.ev(`window.__POKE_BOT_ON__ = false; G.Game.togglePause(); 1`); await sleep(800);
const pause = await A.ev(`(document.getElementById('scr-pause') || {}).innerText || ''`);
console.log('pausa latin:', JSON.stringify(latin(pause)).slice(0, 400));
await A.ev(`G.Game.togglePause(); 1`); await sleep(300);
// muere
await A.ev(`(() => { const p = G.Game.player; p.invuln = 0; p.hurt(999999, null, true); return p.dead; })()`);
for (let i = 0; i < 20; i++) { await sleep(1000); if ((await A.ev(`G.Game.state`)) === 'over') break; }
await sleep(2500);
const over = await A.ev(`(document.getElementById('scr-over') || {}).innerText || ''`);
console.log('fin de partida latin:', JSON.stringify(latin(over)).slice(0, 600));
console.log('resumen:', await A.ev(`[...document.querySelectorAll('#scr-over p.sub')].map(p => p.innerText).filter(t => /傷害|daño|damage/.test(t)).join(' | ').slice(0, 200)`));
console.log('errores:', A.errs.slice(0, 3).join(' || ') || 'ninguno');
A.close(); process.exit(0);
