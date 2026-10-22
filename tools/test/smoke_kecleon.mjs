/* smoke_kecleon.mjs — Tienda Kecleon, naturaleza/habilidad/MT y una partida con el bot, en chino (copia local) */
import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(+(process.argv[2] || 9333));
const latin = s => [...new Set((s.match(/[A-Za-zÀ-ž][A-Za-zÀ-ž' .]{3,}/g) || []).map(x => x.trim()))].filter(x => !/^(PokéSurvivor|Pok[eé]mon|Mega|HP|Kecleon|TheAdro7|Bot|AI)\b/i.test(x));
await A.go('http://localhost:8765/dev.html?dev', 8000);
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); const s = G.DB.save; s.partner = 25;
  for (const d of [25, 1094, 382, 150, 2024]) s.owned[d] = { at: 1 }; s.coins = 99999; G.UI.hideAll(); G.MenuUI.open(); 1`); await sleep(1500);
await A.ev(`document.querySelector('#scr-menu [data-go=shop]').click(); 1`); await sleep(1500);
const shop = await A.ev(`document.getElementById('scr-shop').innerText`);
console.log('shop open:', shop.length, '| latin:', JSON.stringify(latin(shop)).slice(0, 400));
console.log('buy:', await A.ev(`(() => { const r = []; for (const k of ['mint', 'cap', 'caph']) r.push(k + '=' + JSON.stringify(G.Shop.buy(k))); const tm = G.Shop.dailyTms().find(id => G.Mons.canLearn(1094, id)) || G.Shop.dailyTms()[0]; r.push('tm ' + tm + '=' + JSON.stringify(G.Shop.buy('tm:' + tm)) + ' enseñar a Mega Gengar=' + G.Mons.teach(1094, tm)); return r.join(' '); })()`));
await A.ev(`G.ShopUI.openBag(); 1`); await sleep(800);
console.log('bag latin:', JSON.stringify(latin(await A.ev(`document.getElementById('scr-bag').innerText`))).slice(0, 300));
for (const d of [25, 1094, 2024, 382]) {
  console.log('#' + d, await A.ev(`(() => { const a = G.Mons.abilityOf(${d}), n = G.Mons.natureOf(${d});
    return G.DEX_BY[${d}].name + ': ' + G.Mons.name(n.n) + ' · ' + G.Mons.abilityName(a.id) + ' (' + a.id + ') · MT posibles ' + G.Mons.learnable(${d}).length; })()`));
}
await A.ev(`G.DB.save.partner = 1094; G.UI.hideAll(); G.MenuUI.openDex(); 1`); await sleep(1200);
const dex = await A.ev(`(document.querySelector('.mon-extra') || {}).innerText || '(sin ficha)'`);
console.log('ficha Mega Gengar:', dex.replace(/\n+/g, ' / '), '| latin:', JSON.stringify(latin(dex)));
// upgrades: second starting move
await A.ev(`G.UI.hideAll(); G.MenuUI.open(); document.querySelector('#scr-menu [data-go=upgrades]').click(); 1`); await sleep(1200);
const up = await A.ev(`document.getElementById('scr-upgrades').innerText`);
console.log('upgrades latin:', JSON.stringify(latin(up)).slice(0, 300));
// partida corta con el bot (Mega Gengar, con habilidad)
await A.ev(`G.DB.save.partner = 1094; G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.UI.hideAll(); G.Game.startRun(); G.Game.debugSpeed(2); window.__POKE_BOT_ON__ = true; 1`);
for (let i = 0; i < 20; i++) { await sleep(2000); if ((await A.ev(`G.Game.state`)) === 'over') break; }
console.log('run:', await A.ev(`(() => { const p = G.Game.player; return 'state ' + G.Game.state + ' lv ' + p.level + ' hp ' + Math.round(p.hp) + '/' + p.maxHp + ' | ' + p.moves.map(m => m.id).join(', '); })()`));
await A.ev(`window.__POKE_BOT_ON__ = false; G.Game.quit(); 1`);
console.log('errors dev:', A.errs.slice(0, 5).join(' || ') || 'none');
// versión publicada (index.html, empaquetada)
A.errs.length = 0;
await A.go('http://localhost:8765/index.html', 9000);
await A.ev(`document.getElementById('tap-start') && document.getElementById('tap-start').click(); 1`); await sleep(1500);
const menu = await A.ev(`(document.querySelector('[data-go=shop]') || {}).innerText || '(sin botón)'`);
console.log('index shop button:', menu.replace(/\n/g, ' / '), '| errors index:', A.errs.slice(0, 5).join(' || ') || 'none');
A.close(); process.exit(0);
