// El legendario de la grieta (js/systems/legend.js): cinco ataques por tipo y un definitivo, tope por golpe
// y fases que no se saltan, y la cobertura del ataque definitivo (columnas, árboles y rocas de la arena).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

function load({ wall = () => false, block = () => null } = {}) {
  const noop = () => {};
  const G = {
    U: {
      TYPE_COLOR: { fire: '#ff7b3d' }, clamp: (v, a, b) => Math.max(a, Math.min(b, v)), dist2: (x, y, a, b) => (x - a) ** 2 + (y - b) ** 2,
      dist: (x, y, a, b) => Math.hypot(x - a, y - b), rand: (a, b) => (a + b) / 2, pick: a => a[0], norm: (x, y) => { const d = Math.hypot(x, y) || 1; return [x / d, y / d]; }
    },
    Tiles: { T: 16 }, Sprites: { PX: 2 },
    Coop: { active: false, isHost: false },
    Modes: { dmg: 1 },
    FX: { dmgText: noop, ring: noop, burst: noop, beam: noop }, Audio: { sfx: noop }, Camera: { kick: noop, sees: () => false },
    Spawner: { say: noop }, I18n: { f: s => s }, T: s => s, Game: { flash: noop, everyone: () => [], player: null },
    DEX_BY: { 244: { name: 'Entei' } }, EnemyMgr: { all: () => [], get: () => null }, Hazards: { add: noop }, VFX: { forType: () => ({ proj: 'ball' }) },
    World: { arena: { tx: 0, ty: 0, r: 11 }, isWall: wall, projectileBlock: block }
  };
  const ctx = vm.createContext({ G, Math });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/systems/legend.js'), 'utf8'), ctx, { filename: 'legend.js' });
  return G;
}

test('every rift arena type has five attacks of known shapes and an ultimate', () => {
  const G = load();
  const tiles = fs.readFileSync(path.join(ROOT, 'js/world/tiles.js'), 'utf8');
  const types = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
  for (const t of types) assert.ok(tiles.includes('    ' + t + ':'), t + ' is an arena theme');
  const KINDS = ['wave', 'ring', 'orb', 'whirl', 'bar', 'tumble', 'chase', 'line', 'circle', 'sweep'];
  for (const t of types) {
    const set = G.Legend.SETS[t];
    assert.equal(set.length, 5, t + ': five attacks');
    for (const [name, kind] of set) { assert.ok(name && typeof name === 'string'); assert.ok(KINDS.includes(kind), t + ' ' + name + ': ' + kind); }
    assert.ok(G.Legend.ULT[t], t + ': ultimate');
  }
});

test('one hit takes at most 10 % of its health and never skips a phase', () => {
  const G = load();
  G.Legend.begin({ type: 'fire', r: 11, dex: 244 }, { x: 0, y: 0 });
  const e = { legend: true, maxHp: 10000, hp: 10000, x: 0, y: 0, bodyH: 40 };
  assert.equal(G.Legend.filterHit(e, 1e9), 1000, 'capped at 10 %');
  assert.equal(G.Legend.filterHit(e, 50), 50, 'small hits pass');
  e.hp = 7000;
  assert.equal(G.Legend.filterHit(e, 1e9), 400, 'phase 1 stops at 66 %');
  e.hp = 6600;
  assert.equal(G.Legend.filterHit(e, 1e9), 0, 'immune at the cut until phase 2 starts');
  assert.equal(G.Legend.filterHit({ maxHp: 100, hp: 100 }, 1e9), 1e9, 'other enemies untouched');
});

test('the ultimate misses whoever hides behind a pillar, tree or rock', () => {
  // Una columna (pared) en la casilla (4, 0), a 4 casillas al este del centro de la arena.
  const G = load({ wall: (x, y) => Math.floor(x / 32) === 4 && Math.floor(y / 32) === 0 });
  G.Legend.begin({ type: 'fire', r: 11, dex: 244 }, { x: 16, y: 16 });
  G.Legend.onEvent(['lg', 'u', { x: 16, y: 16, d: 5 }]);
  assert.ok(G.Legend.ult, 'charging');
  assert.equal(G.Legend.covers.length, 1, 'one pillar tile');
  assert.equal(G.Legend.covered(16 + 32 * 7, 16), true, 'right behind the pillar');
  assert.equal(G.Legend.covered(16 + 32 * 7, 16 + 14), true, 'a bit off the line still counts');
  assert.equal(G.Legend.covered(16 + 32 * 2, 16), false, 'between it and the pillar');
  assert.equal(G.Legend.covered(16 - 32 * 6, 16), false, 'on the other side');
  assert.equal(G.Legend.covered(16 + 32 * 7, 16 + 32 * 4), false, 'off to the side');
});
