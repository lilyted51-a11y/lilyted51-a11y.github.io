// Huevos (systems/eggs.js): qué sale, incubar, abrir una sola vez y juntar dos aparatos sin perder ni duplicar
// (merge y sanitize de core/db.js de verdad).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function world() {
  const store = new Map();
  const G = { T: s => s };
  const ctx = {
    G, console, Date, Math, JSON, TextEncoder,
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i], get length() { return store.size; } },
    location: { protocol: 'file:', hostname: '' }, navigator: { onLine: true },
    document: { addEventListener() {}, hidden: false }, window: { addEventListener() {} }, setTimeout, clearTimeout
  };
  vm.createContext(ctx);
  for (const f of ['js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/core/db.js', 'js/systems/eggs.js']) vm.runInContext(source(f), ctx, { filename: f });
  G.U = { pick: l => l[Math.floor(Math.random() * l.length)] };
  G.Sprites = { hasShiny: dex => !!(G.SPRITE_META[dex] && G.SPRITE_META[dex].sh) };
  G.Gacha = { REFUND: { 1: 15, 2: 30, 3: 60, 4: 120, 5: 300 } };
  return { G, store };
}
const blank = () => ({ coins: 0, tickets: { t1: 0, t10: 0 }, owned: {}, shiny: {}, upgrades: {}, stats: {}, eggs: {}, eggsOpen: {} });

test('pueden salir las formas regionales; nunca legendarios, megas ni formas de poder', () => {
  const { G } = world();
  const E = G.Eggs;
  for (const dex of [1027, 1037, 2052, 1570, 1194]) assert.ok(E.hatchable(G.DEX_BY[dex]), G.DEX_BY[dex].name);
  for (const dex of [151, 150, 1094, 1382, 2024]) assert.ok(!E.hatchable(G.DEX_BY[dex]), G.DEX_BY[dex].name);
  for (let i = 0; i < 400; i++) for (const k of ['c', 'r', 'm']) {
    const r = E.roll(k, blank()), p = G.DEX_BY[r.d];
    assert.ok(E.hatchable(p) && E.KINDS[k].rar.some(([rr]) => rr === p.rarity), k + ' → ' + p.name);
  }
});

test('un huevo de forma regional se incuba y se abre (en el oficial se quedaban sin abrir)', () => {
  const { G } = world();
  const s = blank();
  const e = G.Eggs.add('rift', null, s);
  s.eggs[e.id].d = 1027; s.eggs[e.id].s = 0;          // Sandshrew de Alola
  assert.equal(G.Eggs.open(e.id, s), null, 'sin incubar no se abre');
  G.Eggs.runEnd(10 * 60, s);
  assert.equal(G.Eggs.open(e.id, s), null, 'a medias tampoco');
  G.Eggs.runEnd(5 * 60, s);
  const r = G.Eggs.open(e.id, s);
  assert.equal(r.dex, 1027);
  assert.ok(s.owned[1027] && r.isNew);
  assert.ok(!s.eggs[e.id] && s.eggsOpen[e.id]);
});

test('doble toque: el segundo no abre otra vez ni da nada', () => {
  const { G } = world();
  const s = blank();
  s.owned[25] = { at: 1 };
  const e = G.Eggs.add('mission', 'w2026-47-wkill', s);
  Object.assign(s.eggs[e.id], { d: 25, s: 0, p: 99999 });
  const a = G.Eggs.open(e.id, s), b = G.Eggs.open(e.id, s);
  assert.ok(a && !a.isNew && a.refund === G.Gacha.REFUND[G.DEX_BY[25].rarity]);
  assert.equal(b, null);
  assert.equal(s.coins, a.refund);
  assert.equal(s.stats.hatched, 1);
});

test('el de una misión tiene id fijo: recogida dos veces (otro aparato) sigue siendo uno', () => {
  const { G } = world();
  const s = blank();
  G.DB = { save: s };
  assert.ok(G.Eggs.fromMission('w2026-47', 'wrift'));
  assert.equal(G.Eggs.fromMission('w2026-47', 'wrift'), null);
  assert.equal(G.Eggs.count(s), 1);
  assert.equal(G.Eggs.list(s)[0].k, 'r');
});

test('gacha: un huevo místico cada 10 tiradas ×10 (×100 = 10, ×1000 = 100)', () => {
  const { G } = world();
  const s = blank();
  let n = 0;
  for (let i = 0; i < 9; i++) n += G.Eggs.fromPulls(s, 1).length;
  assert.equal(n, 0);
  assert.equal(G.Eggs.toNext(s), 1);
  assert.equal(G.Eggs.fromPulls(s, 1).length, 1);
  assert.equal(G.Eggs.fromPulls(s, 10).length, 1);     // una ×100
  assert.equal(G.Eggs.fromPulls(s, 100).length, 10);   // una ×1000
  assert.ok(G.Eggs.list(s).every(e => e.k === 'm' && e.f === 'gacha'));
});

test('al acabar la partida: todos incuban y llega el de la grieta (a cero, uno solo)', () => {
  const { G } = world();
  const s = blank();
  const a = G.Eggs.add('gacha', null, s);
  G.Eggs.riftWon(); G.Eggs.riftWon();
  G.Eggs.runEnd(20 * 60, s);
  assert.equal(s.eggs[a.id].p, 20 * 60);
  const rift = G.Eggs.list(s).filter(e => e.f === 'rift');
  assert.equal(rift.length, 1);
  assert.equal(rift[0].p, 0);
  assert.equal(G.Eggs.lastRun.got, 1);
  G.Eggs.runEnd(60 * 60, s);                          // no pasa del tope de su clase
  assert.equal(s.eggs[a.id].p, G.Eggs.KINDS.m.need);
  assert.equal(G.Eggs.readyCount(s), 2);
  assert.equal(G.Eggs.list(s).filter(e => e.f === 'rift').length, 1, 'sin otra grieta, no hay otro');
});

test('dos aparatos: unión, el mayor progreso, y el abierto en uno no vuelve en el otro (y al revés)', () => {
  const { G } = world();
  const pc = Object.assign(blank(), { updated: 2 }), mob = Object.assign(blank(), { updated: 1 });
  const x = G.Eggs.add('gacha', null, pc), y = G.Eggs.add('rift', null, mob), z = G.Eggs.add('mission', 'w1-a', pc);
  mob.eggs[x.id] = JSON.parse(JSON.stringify(pc.eggs[x.id]));
  mob.eggs[x.id].p = 900; pc.eggs[x.id].p = 300;
  mob.eggs[z.id] = JSON.parse(JSON.stringify(pc.eggs[z.id]));
  pc.eggs[z.id].p = 99999; G.Eggs.open(z.id, pc);    // abierto en el PC
  for (const r of [G.DB.merge(pc, mob), G.DB.merge(mob, pc), G.DB.merge(G.DB.merge(pc, mob), mob)]) {
    assert.deepEqual(Object.keys(r.eggs).sort(), [x.id, y.id].sort());
    assert.equal(r.eggs[x.id].p, 900);
    assert.ok(r.eggsOpen[z.id]);
  }
});

test('lo raro de una copia tocada a mano se quita al cargar', async () => {
  const { G, store } = world();
  const s = Object.assign(blank(), { name: 'Ash', created: 1, updated: 1, tickets: { t1: 0, t10: 0 } });
  s.eggs = { ok1: { k: 'r', f: 'mission', at: 5, p: -50, d: 25, s: 'yes' }, 'MAL ID': { k: 'c' }, raro: { k: 'x' }, ya: { k: 'c', p: 1 }, nada: 7 };
  s.eggsOpen = { ya: [25, 0, 1], 'otro mal': 3 };
  store.set('ps.accounts', JSON.stringify({ ash: { name: 'Ash', salt: '', hash: '' } }));
  store.set('ps.session', JSON.stringify('ash'));
  store.set('ps.save.ash', JSON.stringify(s));
  assert.equal(await G.DB.ready(), true);
  const e = G.DB.save.eggs;
  assert.deepEqual(Object.keys(e), ['ok1']);
  assert.deepEqual([e.ok1.p, e.ok1.s], [0, 1]);
  assert.deepEqual(Object.keys(G.DB.save.eggsOpen), ['ya']);
});
