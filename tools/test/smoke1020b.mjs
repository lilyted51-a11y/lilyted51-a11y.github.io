import { tab, sleep } from './cdp.lib.mjs';
const G_KIND = {"tackle":"melee","quick-attack":"dash","swords-dance":"buff","nasty-plot":"buff","agility":"buff","harden":"buff","ember":"projectile","flamethrower":"cone","fire-spin":"orbit","heat-wave":"nova","water-gun":"projectile","bubble":"nova","hydro-pump":"beam","aqua-ring":"buff","vine-whip":"melee","razor-leaf":"boomerang","leaf-storm":"orbit","giga-drain":"aura","thunder-shock":"projectile","discharge":"aura","thunderbolt":"chain","confusion":"projectile","psybeam":"beam","psychic":"nova","sludge":"projectile","mud-shot":"nova","gust":"orbit","wing-attack":"melee","body-slam":"melee","hyper-voice":"nova","poison-sting":"projectile","toxic":"trail","bulldoze":"aura","bug-bite":"melee","string-shot":"mine","bug-buzz":"aura","rock-throw":"projectile","rock-slide":"meteor","ice-beam":"beam","powder-snow":"aura","karate-chop":"melee","aura-sphere":"projectile","lick":"melee","shadow-ball":"projectile","dragon-rage":"beam","dragon-dance":"buff","fairy-wind":"nova","dazzling-gleam":"aura","metal-claw":"melee","flash-cannon":"beam","bite":"melee","dark-pulse":"nova","night-shade":"aura","bonemerang":"boomerang","psycho-cut":"boomerang","spikes":"mine","toxic-spikes":"mine","hail":"meteor","meteor-mash":"meteor","will-o-wisp":"turret","substitute":"turret","aerial-ace":"dash","flame-wheel":"trail","bubble-beam":"cone","hex":"chain","hyper-beam":"charge","rapid-spin":"spin","flame-charge":"dash","whirlpool":"vortex","seed-bomb":"bounce","energy-ball":"homing","solar-beam":"charge","thunder-wave":"stun","electro-ball":"bounce","extrasensory":"shove","mist-ball":"homing","acid-spray":"bounce","sand-tomb":"vortex","magnitude":"quake","whirlwind":"shove","air-slash":"homing","signal-beam":"bounce","u-turn":"dash","rock-tomb":"stun","ancient-power":"orbit","power-gem":"bounce","ice-shard":"homing","freeze-dry":"stun","rolling-kick":"spin","vacuum-wave":"shove","dynamic-punch":"stun","shadow-sneak":"homing","ominous-wind":"vortex","dragon-breath":"cone","dragon-claw":"melee","outrage":"spin","draining-kiss":"homing","play-rough":"melee","disarming-voice":"shove","mirror-shot":"bounce","gyro-ball":"spin","sucker-punch":"homing","night-slash":"spin"};
const A = await tab(9333);
const latin = s => [...new Set((s.match(/[A-Za-zÀ-ž][A-Za-zÀ-ž' .]{3,}/g) || []).map(x => x.trim()))].filter(x => !/^(PokéSurvivor|Pok[eé]mon|Mega|HP|Xbox|PlayStation|Switch|Bluetooth|USB|Esc|Start|Shift|Enter|Space|Bot|AI|Ctrl)\b/i.test(x));
await A.go('http://localhost:8765/dev.html?dev', 8000);
console.log('lang:', await A.ev(`'I18n=' + G.I18n.lang + ' nav=' + navigator.language + ' saved=' + localStorage.getItem('ps.lang') + ' patch=' + document.documentElement.getAttribute('data-pszh') + ' framed=' + !!window.PS_FRAMED`));
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
await A.ev(`document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); G.DB.save.partner = 25; G.DB.save.owned[25] = { at: 1 }; G.DB.save.coins = 99999; G.UI.hideAll(); G.MenuUI.open(); 1`); await sleep(1500);
console.log('menu title line:', await A.ev(`(document.querySelector('#scr-menu .splash, #menu-splash, .logo .splash, [class*=splash]') || {}).innerText || '(no splash el)'`));
console.log('menu latin leftovers:', JSON.stringify(latin(await A.ev(`document.getElementById('scr-menu').innerText`))));
// upgrades screen: Starting move
await A.ev(`document.querySelector('#scr-menu [data-go=upgrades]').click(); 1`); await sleep(1200);
const up = await A.ev(`document.getElementById('scr-upgrades').innerText`);
console.log('upgrades has starting move:', up.includes('初始招式') || up.includes('起始招式') ? 'yes' : 'no', '| latin:', JSON.stringify(latin(up)).slice(0, 300));
// settings: language
await A.ev(`G.UI.hideAll(); G.SettingsUI.open(); [...document.querySelectorAll('#scr-settings button')].find(b => b.innerText.trim() === '畫面').click(); 1`); await sleep(500);
console.log('language row:', await A.ev(`document.getElementById('scr-settings').innerText.split(String.fromCharCode(10)).filter(l => /語言|Español|English|繁體|简体|Français/.test(l)).join(' | ')`));
await A.ev(`G.SettingsUI.close(); 1`);
// a run with the bot: which new moves appear and are they in Chinese
await A.ev(`G.Boost.paused = false; G.Boost.debugAs('BENCH', null, true); G.UI.hideAll(); G.Game.startRun(); G.Game.debugSpeed(2); window.__POKE_BOT_ON__ = true; window.__seen = new Set(); setInterval(() => { if (G.UI.isOpen('scr-levelup')) document.querySelectorAll('#cards .card').forEach(c => window.__seen.add(c.querySelector('.nm').innerText.split(String.fromCharCode(10)).join(' ') + ' [' + (c.dataset.key || '') + ']')); }, 200); 1`);
for (let i = 0; i < 25; i++) { await sleep(2000); if ((await A.ev(`G.Game.state`)) === 'over') break; }
const seen = await A.ev(`JSON.stringify([...window.__seen])`);
const NEWK = ['homing','bounce','charge','quake','vortex','stun','shove','spin'];
console.log('cards seen with new move kinds:', JSON.stringify(JSON.parse(seen).filter(s => { const id = (s.match(/\[(?:new|up):([^\]]+)\]/) || [])[1]; return id && NEWK.includes((G_KIND[id] || '')); })));
console.log('player moves:', await A.ev(`(()=>{ const p = G.Game.player; return p.level + ' | ' + p.moves.map(m => m.kind + ':' + m.id).join(', '); })()`));
console.log('latin in cards:', JSON.stringify(latin(JSON.parse(seen).join(' ')).filter(x => !/\[|\]/.test(x))).slice(0, 300));
await A.ev(`window.__POKE_BOT_ON__ = false; G.Game.quit(); 1`);
console.log('errors:', A.errs.slice(0, 3).join(' || ') || 'none');
A.close(); process.exit(0);
