// 24-11-2026 (copia local): movimientos nuevos con formas de atacar que ya existían y los exclusivos (`sig`).
// Cada movimiento nuevo tiene tipo, forma, stat, nombre en chino y en inglés; los números de `sig` existen;
// los exclusivos no salen en el pool de su tipo ni como MT, y G.Moves.sigFor los encuentra (también por la especie).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const G = {};
for (const f of ['js/data/pokedex.js', 'js/data/moves.js', 'js/data/tms.js']) new Function('G', source(f))(G);
const M = G.Moves, DEX = new Set(G.DEX.map(p => p.dex));
const block = source('js/data/moves.js').split('24-11-2026 (copia local): movimientos nuevos con formas de atacar que ya existían')[1].split('];')[0]
  .split('24-11-2026 (copia local): movimientos nuevos con formas de atacar nuevas')[0];   // (el bloque de moves2.js va detrás)
const NEW = [...block.matchAll(/\{ id: '([a-z-]+)'/g)].map(r => r[1]);
const OLD_KINDS = new Set(['projectile', 'melee', 'beam', 'orbit', 'nova', 'aura', 'buff', 'boomerang', 'chain', 'mine', 'meteor', 'turret',
  'dash', 'trail', 'cone', 'homing', 'bounce', 'charge', 'spin', 'quake', 'vortex', 'shove', 'stun']);
const zh = source('js/zh-tw.js'), en = source('js/data/lang-en.js');
const has = (txt, k) => txt.includes(JSON.stringify(k) + ':') || txt.includes("'" + k.replace(/'/g, "\\'") + "':");

test('47 new moves: type, existing attack style, physical/special, English and Chinese name and description', () => {
  assert.equal(NEW.length, 47);
  for (const id of NEW) {
    const m = M.BY_ID[id];
    assert.ok(m, id);
    assert.ok(M.POOL[m.type] || m.sig, id + ' type ' + m.type);
    assert.ok(OLD_KINDS.has(m.kind), id + ' kind ' + m.kind);
    assert.ok(m.kind === 'buff' ? m.cat === null : ['physical', 'special'].includes(m.cat), id + ' stat');
    for (const k of [m.name, m.desc]) {
      assert.ok(has(en, k), id + ': falta en inglés ' + k);
      assert.ok(has(zh, k), id + ': falta en chino ' + k);
    }
    assert.ok(m.look, id + ' look');
    if (m.kind !== 'buff' && !m.sig) assert.ok(M.EVO[m.id], id + ': los que no son exclusivos evolucionan');
  }
});

test('signature moves: their dex numbers exist; never in a type pool or a TM; sigFor finds them (forms fall back to their species)', () => {
  const sig = M.ALL.filter(m => m.sig);
  assert.ok(sig.length >= 30);
  for (const m of sig) {
    for (const d of m.sig) assert.ok(DEX.has(d), m.id + ': no existe el número ' + d);
    for (const t in M.POOL) assert.ok(!M.POOL[t].includes(m.id), m.id + ' en el pool ' + t);
    assert.ok(!G.TM_MOVES[m.id], m.id + ' es MT');
    for (const d of m.sig) assert.ok(M.sigFor(G.DEX.find(p => p.dex === d)).includes(m.id), m.id + ' para ' + d);
  }
  assert.deepEqual(M.sigFor({ dex: 249 }), ['aeroblast']);
  assert.deepEqual(M.sigFor({ dex: 384 }), ['dragon-ascent']);
  assert.deepEqual(M.sigFor({ dex: 1 }), []);
  assert.ok(!M.poolFor({ dex: 249, types: ['psychic', 'flying'] }, true).includes('aeroblast'));
  // Legendarios y singulares evolucionan; los de Pokémon normales no (como en el oficial)
  for (const id of ['aeroblast', 'sacred-fire', 'psystrike', 'roar-of-time', 'origin-pulse']) assert.ok(M.EVO[id], id);
  for (const id of ['volt-tackle', 'pyro-ball', 'flower-trick']) assert.ok(!M.EVO[id], id);
});

test('new TMs: every non-signature new move is a TM (except Malignant Chain), with a price and learners that exist', () => {
  for (const id of NEW) {
    const m = M.BY_ID[id];
    if (m.sig || id === 'malignant-chain') continue;
    assert.ok(G.TM_MOVES[id] && G.TM_MOVES[id].length, id + ' MT');
    assert.ok(G.TM_PRICE[id] >= 400, id + ' precio');
    for (const d of G.TM_MOVES[id]) assert.ok(d >= 1 && d <= 1025, id + ' ' + d);
  }
});

test('evolved signature move hits like an evolved move; extras keep their numbers through the ladder', () => {
  const a = M.instance('aeroblast', 5), b = M.instance('ice-beam', 5);
  M.evolve(a); M.evolve(b);
  assert.equal(a.name, 'Aerochorro +');
  assert.ok(a.width > M.BY_ID.aeroblast.width);
  const c = M.instance('snipe-shot', 5);
  assert.equal(c.critUp, 0.25);
  assert.equal(M.instance('crunch', 3).weakT, 4);
});
