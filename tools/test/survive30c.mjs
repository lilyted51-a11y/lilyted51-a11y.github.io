import { tab, sleep } from './cdp.lib.mjs';
// One full run from minute 0 with the "All" privilege (POWER), the bot on, normal speed.
// Usage: node survive30.mjs <port> <dex> <label>
const [,, port, dex, label, mode] = process.argv;   // mode: 'all' (default) | 'bot' (sólo el bot, sin ventajas)
const A0 = await tab(+port);
const ev0 = A0.ev;
const A = Object.assign(A0, { ev: e => Promise.race([ev0(e), new Promise(r => setTimeout(() => r('TIMEOUT'), 20000))]) });
await A.go('http://localhost:8765/dev.html?dev', 8000);
await A.ev(`document.getElementById('tap-start').click(); 1`); await sleep(1200);
await A.ev(`(()=>{ document.getElementById('scr-invite').classList.add('hidden'); G.DB.playAsGuest(); const s = G.DB.save; s.partner = ${dex}; s.owned[${dex}] = { at: 1 };
  const u = G.DB.upgradesOf(${dex}); for (const x of G.Upgrades.LIST) u[x.id] = x.max;
  G.Boost.paused = false; ${mode === 'bot' ? "G.Boost.debugAs('BOTONLY', null, false, true);" : "G.Boost.debugAs('BENCH30', null, true);"} G.UI.hideAll(); G.Game.startRun(); window.__POKE_BOT_ON__ = true;
  const p = G.Game.player; window.__dmg = []; const orig = p.hurt.bind(p);
  p.hurt = (amount, type, pure, cat) => { const st = new Error().stack.split(String.fromCharCode(10)).slice(2, 5).join(' '); const nearE = G.EnemyMgr.all().filter(e => !e.dead).reduce((m, e) => Math.min(m, Math.hypot(e.x - p.x, e.y - p.y) - (e.r || 14) - p.r), 1e9); const src = /hazards\.js/.test(st) ? 'HAZARD' : /judgment/.test(st) ? 'ARCEUS' : /combat\.js/.test(st) ? (nearE < 6 ? 'CONTACT' : 'SHOT') : 'OTHER'; const hp0 = p.hp; const r = orig(amount, type, pure, cat); const lost = hp0 - p.hp; if (lost > 0.5) { const near = G.EnemyMgr.all().filter(e => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 160).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)).slice(0, 2).map(e => (e.def && e.def.name || '?') + (e.boss ? '(BOSS)' : e.legend ? '(LEG)' : '') + '@' + Math.round(Math.hypot(e.x - p.x, e.y - p.y))); window.__dmg.push({ src, t: Math.round(G.Game.st.time), lost: Math.round(lost), hp: Math.round(p.hp), max: Math.round(p.maxHp), type: pure ? 'pure' : type, near, judg: !!G.Judgment.active, arena: !!G.Rift.inArena }); if (window.__dmg.length > 400) window.__dmg.shift(); } return r; };
  return 1; })()`);
const t0 = Date.now(); let last = null;
for (;;) {
  await sleep(15000);
  const r = await A.ev(`(()=>{ const p = G.Game.player; const j = G.Judgment.summary(); return JSON.stringify({ st: G.Game.state, t: Math.round(G.Game.st.time), lv: p.level, hp: Math.round(p.hp), max: Math.round(p.maxHp), kills: p.kills, judg: j ? Math.round(j.time) : null, arena: !!G.Rift.inArena, moves: p.moves.map(m => m.id + ':' + m.lvl).join(',') }); })()`);
  if (r === 'TIMEOUT' || typeof r !== 'string' || r.startsWith('ERR')) { console.log(label, 'eval problem', r); break; }
  const o = JSON.parse(r); last = o;
  if (o.t % 120 < 15) console.log(label, `t=${o.t}s lv=${o.lv} hp=${o.hp}/${o.max} kills=${o.kills} judg=${o.judg} arena=${o.arena}`);
  if (o.st === 'over' || o.judg >= 60 || (Date.now() - t0) > 45 * 60000) break;
}
const dmg = JSON.parse(await A.ev(`JSON.stringify(window.__dmg.slice(-8))`));
console.log(label, 'damage by source (last 400 hits):', await A.ev(`JSON.stringify(window.__dmg.reduce((m, d) => { m[d.src] = (m[d.src] || 0) + d.lost; return m; }, {}))`), '| big hits (>=40% max HP):', await A.ev(`JSON.stringify(window.__dmg.filter(d => d.lost >= d.max * 0.4).map(d => d.src + '@' + d.t + 's:' + d.lost))`));
console.log(label, 'RESULT', JSON.stringify({ mode: mode || 'all', boost: await A.ev(`JSON.stringify(G.Game.player.boost)`), bosses: await A.ev(`G.Game.player.bosses`), survivedTo: last.t, reachedJudgment: last.judg != null, state: last.st, level: last.lv, kills: last.kills, moves: last.moves }));
console.log(label, 'last hits:'); for (const d of dmg) console.log(label, '  ', JSON.stringify(d));
console.log(label, 'errors:', A.errs.slice(0, 3).join(' || ') || 'none');
await A.ev(`window.__POKE_BOT_ON__ = false; try { G.Game.quit(); } catch (e) {} 1`);
A.close(); process.exit(0);
