// Estelas y Vestidor (23-11-2026): el catálogo (entities/trails.js), las 12 de la semana
// (data/shop.js), lo que se guarda de cada Pokémon (core/dress.js) y cómo se junta entre
// aparatos (core/db.js, merge: estelas unidas, lo elegido más tarde gana).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

function load() {
  const G = { Sprites: { PX: 2 }, U: { TYPE_COLOR: {} } };
  const store = new Map();
  const ctx = vm.createContext({
    G, Intl, Date, Math, JSON, console, performance: { now: () => 0 },
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    firebase: {}, location: { protocol: 'https:', hostname: 'localhost' }, navigator: { onLine: true },
    document: { addEventListener() {}, hidden: false }, window: { addEventListener() {} }, setTimeout: () => 0, clearTimeout() {}, TextEncoder
  });
  for (const f of ['js/entities/trails.js', 'js/core/dress.js', 'js/data/shop.js', 'js/core/db.js']) vm.runInContext(read(f), ctx, { filename: f });
  G.DEX_BY = { 25: { dex: 25, types: ['electric'] }, 412: { dex: 412, types: ['bug'] } };
  return G;
}

test('catálogo: 56 estelas a la venta + la del Team Rocket (no se vende), id único, formas y precios por rareza', () => {
  const G = load(), T = G.Trails;
  assert.equal(T.LIST.filter(t => t.rar <= 4).length, 56);
  assert.equal(T.LIST.length, 57);
  assert.equal(T.BY.rocket.rar, 5);
  assert.equal(new Set(T.LIST.map(t => t.id)).size, 57);
  for (const t of T.LIST) {
    assert.ok(t.em.length || t.ribbon || t.after, t.id + ' no deja nada');
    assert.equal(t.price, T.PRICE[t.rar], t.id);
    for (const e of t.em) assert.ok(T.SHAPES[e.shape] || e.mode === 'ripple', t.id + ': forma ' + e.shape);
  }
  // Las formas: todas las filas del mismo ancho.
  for (const [k, rows] of Object.entries(T.SHAPES)) assert.ok(rows.every(r => r.length === rows[0].length), 'forma ' + k);
});

test('tienda: 12 por semana (5 comunes, 4 raras, 2 épicas, 1 legendaria), iguales toda la semana', () => {
  const G = load();
  const w = G.Shop.weeklyTrails();
  assert.equal(w.length, 12);
  assert.equal(new Set(w).size, 12);
  const n = r => w.filter(id => G.Trails.BY[id].rar === r).length;
  assert.equal([n(1), n(2), n(3), n(4)].join(), '5,4,2,1');
  assert.equal(G.Shop.weeklyTrails().join(), w.join());
  const k = G.Shop.week();
  assert.match(k.key, /^\d{8}$/);
  assert.ok(k.left >= 1 && k.left <= 7);
});

test('Vestidor: limpia lo imposible y junta dos aparatos sin perder estelas', () => {
  const G = load();
  const s = { trails: { arcoiris: 5, nope: 3, neon: 'x' }, pdress: { 25: [{ tr: 'arcoiris', fx: 'zzz', sh: 1, lk: -3 }, 10], 9999: [{}, 1], 412: 'roto' } };
  G.Dress.clean(s);
  assert.deepEqual([...Object.keys(s.trails)], ['arcoiris']);
  assert.deepEqual(JSON.parse(JSON.stringify(s.pdress)), { 25: [{ sh: 1, tr: 'arcoiris' }, 10] });

  const a = { updated: 2, coins: 0, tickets: { t1: 0, t10: 0 }, trails: { arcoiris: 1 }, pdress: { 25: [{ tr: 'arcoiris' }, 50] }, stats: {}, owned: {}, shiny: {} };
  const b = { updated: 1, coins: 0, tickets: { t1: 0, t10: 0 }, trails: { neon: 2 }, pdress: { 25: [{ tr: 'neon' }, 90], 412: [{ fx: 'halo' }, 5] }, stats: {}, owned: {}, shiny: {} };
  const r = G.DB.merge(a, b);
  assert.equal(Object.keys(r.trails).sort().join(), 'arcoiris,neon');
  assert.equal(r.pdress[25][0].tr, 'neon');          // elegida más tarde en el otro aparato
  assert.equal(r.pdress[412][0].fx, 'halo');
});

test('en partida: la estela sólo si es tuya; efecto por defecto, brillos si juegas shiny', () => {
  const G = load();
  G.DB.ownsShiny = d => d === 25;
  const s = { partner: 25, partnerShiny: true, trails: { neon: 1 }, pdress: { 25: [{ tr: 'arcoiris' }, 1], 412: [{ tr: 'neon', fx: '' }, 1] } };
  assert.equal(G.Dress.trailOf(s, 25), '');            // no la ha comprado
  assert.equal(G.Dress.trailOf(s, 412), 'neon');
  assert.equal(G.Dress.fxOf(s, 25), 'shine');
  assert.equal(G.Dress.fxOf(s, 412), '');
  G.Dress.setShiny(s, 25, false);
  assert.equal(s.partnerShiny, false);
  assert.equal(G.Dress.fxOf(s, 25), '');
});
