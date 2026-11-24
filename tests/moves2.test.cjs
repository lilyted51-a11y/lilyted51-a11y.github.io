// Formas de atacar nuevas (24-11-2026, copia local): los 26 movimientos de data/moves.js con sus clases de
// systems/moves2.js (datos, MT, textos en inglés y chino), Protección y las paredes de luz (incoming),
// Descanso (asleep), Doble Equipo (lure) y los climas de los movimientos (Weather.fromMove).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const NEW = ['extreme-speed', 'protect', 'double-team', 'explosion', 'judgment', 'fire-blast', 'sunny-day', 'fire-punch', 'surf',
  'rain-dance', 'seed-flare', 'thunder', 'thunder-punch', 'plasma-fists', 'ice-punch', 'glaciate', 'drain-punch', 'earthquake',
  'acrobatics', 'rest', 'reflect', 'light-screen', 'x-scissor', 'sandstorm', 'stone-axe', 'shadow-force'];
const SIG = { judgment: [493], 'plasma-fists': [807, 1807], 'seed-flare': [492, 1492], 'stone-axe': [900], glaciate: [646, 1646, 2646] };

function load(files, G) {
  const ctx = vm.createContext({ G, console, performance: { now: () => 0 }, document: { createElement: () => ({ getContext: () => ({}) }) } });
  for (const f of files) vm.runInContext(source(f), ctx, { filename: f });
  return G;
}
const data = () => load(['js/data/moves.js', 'js/data/tms.js'], {});

test('the 26 new moves: kinds, category, ladder to level 5 and evolution card', () => {
  const G = data(), M = G.Moves;
  const KINDS = ['rush', 'explode', 'storm', 'cross', 'punch', 'wave', 'tremor', 'leap', 'scissor'];
  const ACTS = ['protect', 'decoy', 'weather', 'rest', 'screen'];
  for (const id of NEW) {
    const m = M.BY_ID[id];
    assert.ok(m, id);
    assert.equal(m.maxLvl, 5, id + ': five levels');
    assert.equal(m.ups.length, 4, id + ': its ladder');
    if (m.kind === 'buff') {
      assert.ok(ACTS.includes(m.act), id + ': a support move has an act');
      assert.equal(m.cat, null, id + ': does no damage');
      assert.equal(M.EVO[id], undefined, id + ': does not evolve');
    } else {
      assert.ok(KINDS.includes(m.kind), id + ': new kind ' + m.kind);
      assert.ok(m.cat === 'physical' || m.cat === 'special', id);
      if (id !== 'stone-axe') {
        assert.ok(M.NEED_NAME[M.EVO[id]], id + ': evolves with a card');
        const i = M.instance(id, 5);
        const ev = M.evoInfo(i, { [M.EVO[id]]: 1 });
        assert.ok(ev && ev.ready, id + ': evolution ready at level 5 with its card');
        const d0 = i.dmg;
        assert.ok(M.evolve(i) && i.dmg > d0 && i.name.endsWith(' +'), id + ': evolves');
      }
    }
  }
  assert.equal(M.BY_ID.protect.minCd, 5, 'Protect never below 5 s');
  assert.equal(M.BY_ID.surf.radius, 360, 'Surf reaches 360 (official tuning of 15-11)');
  assert.equal(M.BY_ID['fire-punch'].cat, 'physical');
  assert.equal(M.BY_ID.surf.cat, 'special');
});

test('signature moves are not in their type pool nor sold as TMs; the rest are TMs with a price', () => {
  const G = data(), M = G.Moves;
  for (const id of NEW) {
    const m = M.BY_ID[id];
    if (SIG[id]) {
      assert.deepEqual([...m.sig], SIG[id], id);
      assert.ok(!(M.POOL[m.type] || []).includes(id), id + ': not in the ' + m.type + ' pool');
      assert.ok(!G.TM_MOVES[id], id + ': not a TM');
    } else {
      assert.ok(!m.sig, id);
      assert.ok(M.POOL[m.type].includes(id), id + ': in the ' + m.type + ' pool');
      assert.ok(G.TM_MOVES[id] && G.TM_MOVES[id].length > 0, id + ': TM learners');
      assert.ok(G.TM_PRICE[id] >= 400, id + ': TM price');
    }
  }
  assert.ok(G.TM_OF(149).includes('extreme-speed'), 'Dragonite learns Extreme Speed by TM');
  assert.ok(G.TM_OF(487).includes('shadow-force'), 'Giratina learns Shadow Force');
});

test('names, descriptions and card texts have English and Traditional Chinese (keyed in Spanish and English)', () => {
  const G = data(), M = G.Moves;
  const en = source('js/data/lang-en.js'), zh = source('js/zh-tw.js');
  const key = (src, k) => src.includes(JSON.stringify(k) + ':') || src.includes("'" + k.replace(/'/g, "\\'") + "':");
  const enOf = k => { const m = en.match(new RegExp('(?:"' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"|\'' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "\\\\'") + '\'):\\s*(["\'])(.*?)\\1')); return m && m[2]; };
  const texts = new Set();
  for (const id of NEW) {
    const m = M.BY_ID[id];
    texts.add(m.name); texts.add(m.desc);
    for (const u of m.ups) texts.add(u.t);
  }
  for (const k of ['rush', 'explode', 'storm', 'cross', 'punch', 'wave', 'tremor', 'leap', 'scissor']) {
    const i = M.instance(NEW.find(id => M.BY_ID[id].kind === k), 5);
    texts.add(M.evoInfo(i, { [M.EVO[i.id]]: 1 }).text);
  }
  texts.add('¡Protegido!');
  for (const t of texts) {
    assert.ok(key(en, t), 'English for: ' + t);
    assert.ok(key(zh, t), 'Chinese for: ' + t);
    const e = enOf(t);
    if (e && e !== t) assert.ok(key(zh, e), 'Chinese keyed by the English: ' + e);
  }
});

// ---------------- systems/moves2.js ----------------
function moves2() {
  const nop = () => {};
  const G = {
    LIFT: 10, Sprites: { PX: 2, Animator: class { loop() {} update() {} draw() {} } }, VFX: { PAL: { normal: [] }, SHAPES: {}, spins: () => false },
    U: { TYPE_COLOR: {}, rand: (a, b) => (a + b) / 2, dist2: (a, b, c, d) => (a - c) ** 2 + (b - d) ** 2, dist: (a, b, c, d) => Math.hypot(a - c, b - d) },
    FX: { ring: nop, sp: nop, px: nop, burst: nop, dmgText: nop, spark: nop }, World: { isFree: () => true },
    Camera: { sees: () => true, kick: nop }, Audio: { sfx: nop }, Coop: { active: false, isHost: false }
  };
  load(['js/systems/moves2.js'], G);
  return G;
}
const P = () => ({ x: 0, y: 0, r: 10, bodyH: 24, maxHp: 100, hp: 50, level: 7, aim: 0, dex: 6, heal(n) { this.hp = Math.min(this.maxHp, this.hp + n); } });

test('Protect: nothing gets through while it lasts, except Arceus (pure); then it wears off', () => {
  const G = moves2(), pl = P();
  G.Moves2.run(pl, { act: 'protect', dur: 1.5, type: 'normal' }, false);
  assert.equal(G.Moves2.incoming(pl, 40, 'physical', false), 0);
  assert.equal(G.Moves2.incoming(pl, 40, null, false), 0);
  assert.equal(G.Moves2.incoming(pl, 40, null, true), 40, 'Arceus ignores it');
  G.Moves2.update(1.6);
  assert.equal(G.Moves2.incoming(pl, 40, 'physical', false), 40);
  // El fantasma de un compañero sólo se ve: no protege al de aquí.
  const mate = P();
  G.Moves2.run(mate, { act: 'protect', dur: 1.5, type: 'normal' }, true);
  assert.equal(G.Moves2.incoming(mate, 40, 'physical', false), 40);
});

test('Reflect and Light Screen: -35 % of their own class only, for their duration', () => {
  const G = moves2(), pl = P();
  G.Moves2.run(pl, { act: 'screen', guard: 'physical', dur: 10, amount: 0.35, type: 'psychic' }, false);
  assert.equal(Math.round(G.Moves2.incoming(pl, 100, 'physical', false)), 65);
  assert.equal(G.Moves2.incoming(pl, 100, 'special', false), 100);
  G.Moves2.run(pl, { act: 'screen', guard: 'special', dur: 10, amount: 0.35, type: 'psychic' }, false);
  assert.equal(Math.round(G.Moves2.incoming(pl, 100, 'special', false)), 65);
  G.Moves2.update(10.5);
  assert.equal(G.Moves2.incoming(pl, 100, 'physical', false), 100);
});

test('Rest: heals and you sleep for its time', () => {
  const G = moves2(), pl = P();
  G.Moves2.run(pl, { act: 'rest', amount: 0.45, stun: 2.4, type: 'psychic' }, false);
  assert.equal(pl.hp, 95);
  assert.ok(G.Moves2.asleep(pl));
  G.Moves2.update(2.5);
  assert.ok(!G.Moves2.asleep(pl));
});

test('Double Team: the copy draws nearby enemies, but not bosses, Arceus or ones far away; it vanishes', () => {
  const G = moves2(), pl = P();
  G.Moves2.run(pl, { act: 'decoy', dur: 4, radius: 260, type: 'normal' }, true);    // (también la de un compañero)
  const d = G.Moves2.lure({ x: 100, y: 0 });
  assert.ok(d && d.decoy && d.level === 7 && d._vx === 0, 'looks like a standing player to the enemy AI');
  assert.equal(G.Moves2.lure({ x: 600, y: 0 }), null);
  assert.equal(G.Moves2.lure({ x: 50, y: 0, boss: true }), null);
  assert.equal(G.Moves2.lure({ x: 50, y: 0, arceus: true }), null);
  G.Moves2.update(4.1);
  assert.equal(G.Moves2.lure({ x: 100, y: 0 }), null);
});

// ---------------- Weather.fromMove ----------------
function weather() {
  const nop = () => {};
  const G = { Spawner: { say: nop }, Audio: { sfx: nop }, Coop: { active: false, isHost: false }, Rift: {}, Judgment: {}, World: { biome: 0 },
              EnemyMgr: { all: () => [] }, FX: { dmgText: nop } };
  load(['js/systems/weather.js'], G);
  return G.Weather;
}

test('weather moves: set it at once, a second cast only lengthens it, and the old weather comes back after', () => {
  const W = weather();
  W.force('fog', 60);
  W.update(5);
  assert.ok(W.fromMove('sun', 10));
  assert.equal(W.current.kind, 'sun');
  assert.ok(W.mult('fire') > 1.2, 'already strong');
  W.update(5);
  assert.ok(W.fromMove('sun', 10));
  W.update(9);
  assert.equal(W.current.kind, 'sun', 'lengthened');
  W.update(2); W.update(0.5);
  assert.equal(W.current.kind, 'fog', 'the fog comes back');
  W.clear();
  W.fromMove('rain', 4);
  W.update(6);
  assert.equal(W.current, null, 'and with nothing before, it just ends');
  W.lock('snow');
  assert.ok(!W.fromMove('sand', 10), 'the weekly challenge weather stays');
  W.update(1);
  assert.equal(W.current.kind, 'snow');
});
