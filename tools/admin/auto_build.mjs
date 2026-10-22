/* ============ auto_build.mjs — configuración completa de cada Pokémon de una cuenta (copia local) ============
 * node tools/admin/auto_build.mjs <puerto CDP> [--write] [dex,dex,...] [--login <nombre> <contraseña>]
 * Para cada Pokémon que tiene la cuenta, pensado para el "cuatro en uno" (guía de un jugador, 22-10-2026:
 * ataque inicial + potenciador de ataque + potenciador de defensa + control, fusionados con los vínculos):
 *   - naturaleza (Menta): +10 % a su lado bueno y −10 % al otro, que no usa (Modesta / Firme),
 *   - ataque inicial: el que más pega con SU lado (rinde al 100 %), contando la habilidad (p. ej. Adaptable
 *     +25 % a los de sus tipos) y las MT que aprende en los juegos,
 *   - control (segundo movimiento inicial): un ataque que paraliza (Onda Trueno, Tumba Rocas, Liofilización,
 *     Puño Dinámico) de su lado; si no tiene ninguno, uno que atrae o empuja, y si no, uno que frena,
 *   - habilidad (Cápsula): la que más suma con ese ataque y en defensa,
 *   - MT: sólo las que hacen falta para lo anterior (más movimientos en el mazo = menos cartas de lo bueno),
 *   - veto: los 3 que peor le van; nunca el inicial, el control, su potenciador de ataque, Fortaleza,
 *     Agilidad ni Acua Aro. El potenciador de ataque y Fortaleza son de tipo Normal: los tiene todo Pokémon.
 * Se pone directamente en la partida (como las mejoras de MiNG): no gasta monedas ni espera a la MT del día.
 * Sin --write sólo enseña lo que haría.
 */
const [,, port, ...rest] = process.argv;
const WRITE = rest.includes('--write');
const LI = rest.indexOf('--login');
const SHOW = (rest.find((a, i) => /^\d+(,\d+)*$/.test(a) && !(LI >= 0 && i > LI && i <= LI + 2)) || '1150,382,150,101,6,384,448,445').split(',').map(Number);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT', signal: AbortSignal.timeout(15000) })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
const send = (method, params = {}) => Promise.race([new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); }), sleep(60000).then(() => ({}))]);
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value ?? ('ERR ' + (r.result?.exceptionDetails?.exception?.description || '').slice(0, 300)); };
const kill = setTimeout(() => { console.log('timeout'); process.exit(1); }, 600000);

try {
  await send('Page.navigate', { url: 'http://localhost:8765/dev.html?dev' });
  for (let w = 0; w < 90 && (await ev(`typeof G==='object'&&!!G.DB&&!!G.DB.save&&!!G.Mons&&typeof PokeAutoBot==='function'&&!!document.getElementById('tap-start')`)) !== true; w++) await sleep(1000);
  let online = false;
  for (let w = 0; w < 20 && !online; w++) { online = (await ev(`!!(G.DB.online && G.DB.save && G.DB.save.owned)`)) === true; if (!online) await sleep(1000); }
  const li = rest.indexOf('--login');
  if (!online && li >= 0) {
    console.log('login', await ev(`G.DB.login(${JSON.stringify(rest[li + 1])}, ${JSON.stringify(rest[li + 2])}).then(r => JSON.stringify(r))`));
    for (let w = 0; w < 90 && !online; w++) { online = (await ev(`!!(G.DB.online && G.DB.save && G.DB.save.owned)`)) === true; if (!online) await sleep(1000); }
  }
  if (!online) { console.log('La cuenta no está abierta en este Chrome: no se toca nada'); process.exit(2); }
  await sleep(3000);
  const out = await ev(`(() => {
    const s = G.DB.save, BY = G.Moves.BY_ID, Q = PokeAutoBot.QUALITY;
    const NEVER_BAN = new Set(['harden', 'agility', 'aqua-ring']);
    const ONCE = new Set(['projectile', 'beam', 'charge', 'cone', 'nova', 'homing', 'bounce', 'chain', 'boomerang', 'melee', 'dash', 'stun', 'shove']);
    const dps = id => { const m = G.Moves.instance(id, BY[id].maxLvl || 5); return (m.dmg || 10) * Math.max(1, m.count || 1) / Math.max(0.2, m.cd || 1); };
    const withNature = (base, nat) => { const n = G.NATURE_BY[nat], m = Object.assign({}, base);
      if (n.up) m[n.up] = base[n.up] * 1.1; if (n.down) m[n.down] = base[n.down] * 0.9; m.atk = Math.max(m.pa, m.sa); return m; };
    // Habilidad: lo que suma con el ataque m (out, con vida llena y con poca), en defensa (inMul, esquivar) y lo demás
    const TYPES = Object.keys(G.U.TYPE_NAME);
    function abilScore(fx, mon, ids) {
      const pl = { mon, hp: 100, maxHp: 100, level: 30, buffs: {}, moxie: 0.08, x: 0, y: 0, moves: [], slots: [], hasItem: () => false };
      const e = { mon: { types: ['normal'], df: 75, sd: 75, pa: 1, sa: 1 }, types: ['normal'], hp: 50, maxHp: 100, x: 0, y: 0 };
      // Clima propio (Llovizna, Sequía...): sale al empezar y cada 3 min, dura ~1 min → cuenta con un 40 % del tiempo
      const wk = fx.summon && G.Weather.KINDS[fx.summon];
      const wxOf = m => 1 + (((wk && wk.mult && wk.mult[m.type]) || 1) - 1) * 0.4;
      const outOf = m => { if (!fx.out) return wxOf(m); let a = 0;
        for (let k = 0; k < 12; k++) { pl.hp = k < 9 ? 100 : 25; try { a += fx.out(pl, m, e) || 1; } catch (er) { a += 1; } }
        pl.hp = 100; return a / 12 * wxOf(m); };
      const dmg = ids.reduce((a, [id, w]) => a + w * outOf(G.Moves.instance(id, 5)), 0) / ids.reduce((a, [, w]) => a + w, 0);
      let inm = 0, n = 0, dodge = 0;
      for (const ty of TYPES) for (const c of ['p', 's']) {
        let k = 1; try { if (fx.inMul) k = fx.inMul(pl, ty, c) || 1; } catch (er) {}
        if (fx.absorb === ty) k = 0;
        let d = 0; try { if (fx.dodge) d = fx.dodge(pl, ty, c) || 0; } catch (er) {}
        inm += k; dodge += d; n++;
      }
      inm /= n; dodge /= n;
      let spd = 1; try { if (fx.speed) spd = fx.speed(pl) || 1; } catch (er) {}
      let v = dmg / (fx.cdMul || 1) * Math.pow(1 / Math.max(0.3, inm * (1 - dodge)), 0.8) * Math.sqrt(spd);
      if (fx.statusCd) v *= 1 + (1 - fx.statusCd) * 0.2;
      if (fx.critMul) v *= 1 + (fx.critMul - 1.5) * 0.1;
      for (const [k, b] of [['levitate', 0.04], ['sturdy', 0.05], ['steady', 0.03], ['lavaProof', 0.02], ['trapProof', 0.02], ['summon', 0.03],
                            ['tick', 0.03], ['healMul', 0.02], ['contact', 0.02], ['hurt', 0.02], ['start', 0.04], ['hit', 0.02]]) if (fx[k]) v += b;
      return v;
    }
    const show = ${JSON.stringify(SHOW)}, rows = [], tally = { ctrl: {}, nat: {}, tms: 0, noCtrl: 0 };
    let changed = 0;
    for (const dex of Object.keys(s.owned).map(Number)) {
      const base = G.DEX_BY[dex]; if (!base) continue;
      const side = G.Stats.sideOf(base);
      const nat = side === 'special' ? 'modest' : 'adamant';
      const mon = withNature(base, nat);
      const natural = G.Moves.poolFor(base, true);
      const tmAll = [...new Set([...G.Mons.learnable(dex), ...G.Mons.taught(dex)])].filter(id => BY[id]);
      const all = [...new Set([...natural, ...tmAll])];
      const atks = all.filter(id => BY[id].kind !== 'buff');
      const full = id => G.Stats.fit(mon, BY[id].cat) >= 0.999;          // rinde al 100 % con este Pokémon
      const med = atks.map(dps).sort((a, b) => a - b)[atks.length >> 1] || 1;
      const val = id => { const d = BY[id];
        const f = G.Stats.fit(mon, d.cat), mono = mon.types.length === 1 && d.type === mon.types[0] ? 1.2 : 1;
        return (Q[d.kind] || 0.6) * f * f * mono * (ONCE.has(d.kind) ? Math.sqrt(dps(id) / med) : 1); };
      // Control: paraliza > atrae / empuja > frena; siempre de su lado
      const tiers = [atks.filter(id => BY[id].kind === 'stun' && full(id)),
                     atks.filter(id => (BY[id].kind === 'vortex' || BY[id].kind === 'shove') && full(id)),
                     atks.filter(id => BY[id].slow && full(id))];
      const ctrlPool = tiers.find(l => l.length) || [];
      const slotsL = G.Mons.slots(dex);
      const abils = [0, 1, 2].filter(i => slotsL[i] && !(i === 1 && slotsL[1] === slotsL[0]));
      let best = null;
      for (const ai of abils.length ? abils : [0]) {
        const fx = G.AbilityFX.of(slotsL[ai] || '', mon);
        const ctrlIds = ctrlPool.slice().sort((a, b) => val(b) * abilScore(fx, mon, [[b, 1]]) - val(a) * abilScore(fx, mon, [[a, 1]])
                                                        || natural.includes(b) - natural.includes(a));
        const ctrl = ctrlIds[0] || null;
        for (const st of atks) {
          if (st === ctrl || !full(st)) continue;          // el inicial también tiene que rendir al 100 %
          // Una MT de ataque sólo si pega claramente más que lo que ya tiene (cada movimiento de más estorba en el mazo)
          const v = val(st) * (natural.includes(st) ? 1 : 0.9) * abilScore(fx, mon, ctrl ? [[st, 3], [ctrl, 1]] : [[st, 1]]);
          if (!best || v > best.v) best = { v, ai, st, ctrl };
        }
      }
      if (!best) continue;
      const { ai, st: start, ctrl } = best;
      // Sin control que rinda al 100 %: el segundo inicial es el segundo mejor ataque (de los que ya tiene)
      const second = ctrl || natural.filter(id => BY[id].kind !== 'buff' && id !== start && full(id)).sort((a, b) => val(b) - val(a))[0] || null;
      const teach = [start, ctrl].filter(id => id && !natural.includes(id));
      const atkBuff = side === 'special' ? ['nasty-plot'] : ['swords-dance', 'dragon-dance'];
      const keep = new Set([start, second, ...atkBuff, ...NEVER_BAN].filter(Boolean));
      const pool = [...new Set([...natural, ...G.Mons.taught(dex), ...teach])];
      const banV = id => { const d = BY[id];
        if (d.kind === 'buff') return d.stat === 'patk' || d.stat === 'satk' ? -1 : 2;   // potenciador de la otra categoría: el peor
        return val(id); };
      const bans = pool.filter(id => !keep.has(id)).sort((a, b) => banV(a) - banV(b)).slice(0, 3);
      tally.nat[nat] = (tally.nat[nat] || 0) + 1; tally.tms += teach.length;
      if (ctrl) tally.ctrl[ctrl] = (tally.ctrl[ctrl] || 0) + 1; else tally.noCtrl++;
      if (${WRITE}) {
        G.Mons.setNature(dex, nat);
        if (slotsL[ai]) G.Mons.setAbility(dex, ai);
        if (teach.length) { s.ptm = s.ptm || {}; s.ptm[dex] = [...new Set([...G.Mons.taught(dex), ...teach])]; }
        s.pstart = s.pstart || {}; s.pstart2 = s.pstart2 || {}; s.pban = s.pban || {};
        s.pstart[dex] = start;
        if (second) s.pstart2[dex] = second; else delete s.pstart2[dex];
        s.pban[dex] = bans;
        s.pupg = s.pupg || {}; const up = s.pupg[dex] = s.pupg[dex] || {};
        up.start = 1; if (up.moves) up.start2 = 1;
        for (const k of ['pban', 'pstart', 'pstart2']) G.DB.touchPick(k, dex);
        changed++;
      }
      if (show.includes(dex)) {
        const nm = id => id ? BY[id].name + ' [' + BY[id].cat + (natural.includes(id) ? '' : ', MT') + ']' : '—';
        rows.push(base.name + ' #' + dex + ' (' + side + '): ' + G.NATURE_BY[nat].n[0] + ' · habilidad ' + (slotsL[ai] ? G.Mons.name(G.ABIL[slotsL[ai]]) + (ai === 2 ? ' (oculta)' : '') : '—') +
          ' · inicial ' + nm(start) + ' · ' + atkBuff.map(id => BY[id].name).join('/') + ' · Fortaleza · control ' + nm(ctrl) + (ctrl ? '' : ' (2.º inicial ' + nm(second) + ')') +
          ' · vetados ' + bans.map(id => BY[id].name).join(', '));
      }
    }
    if (${WRITE}) G.DB.commit();
    return JSON.stringify({ owned: Object.keys(s.owned).length, changed, tally, rows }, null, 1);
  })()`);
  console.log(out);
  if (WRITE) {
    for (let i = 0; i < 4; i++) {
      const r = await ev(`G.DB.saveNow().then(r => JSON.stringify(r))`);
      console.log('saveNow', r);
      let o = {}; try { o = JSON.parse(r); } catch (e) {}
      if (o.ok && o.why !== 'wait') break;
      await sleep(((o.secs || 30) + 3) * 1000);
    }
    console.log('nube', await ev(`(async () => { const fb = G.DB.fb; if (!fb) return 'sin nube';
      const d = await fb.fs.collection('saves').doc(fb.uid).get(); const sv = d.data().save || {};
      const k = 1150;
      return JSON.stringify({ naturalezas: Object.keys(sv.pnat || {}).length, habilidades: Object.keys(sv.pabil || {}).length,
        conMT: Object.keys(sv.ptm || {}).length, iniciales: Object.keys(sv.pstart || {}).length, segundos: Object.keys(sv.pstart2 || {}).length,
        vetos: Object.keys(sv.pban || {}).length,
        mewtwoY: { nat: (sv.pnat || {})[k], abil: (sv.pabil || {})[k], mt: (sv.ptm || {})[k], inicial: (sv.pstart || {})[k], segundo: (sv.pstart2 || {})[k], veto: (sv.pban || {})[k] } }); })()`));
  }
} finally {
  clearTimeout(kill);
  try { ws.close(); } catch (e) {}
  await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`).catch(() => {});
  process.exit(0);
}
