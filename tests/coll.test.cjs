// Colección (25-11-2026): el 1020 pasa a ser Gouging Fire y el Raticate de Alola el 500020 (core/db.js, remapDex:
// lo apuntado con el 1020 se pasa al cargar, una vez, y al juntar con una copia aún sin pasar), los aspectos del
// Vestidor (core/dress.js, looks: clase «look» del oficial) y las cuentas de la Colección (1025 especies + 57 regionales).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const plain = x => JSON.parse(JSON.stringify(x));

function load() {
  const G = { Sprites: { PX: 2 }, U: { TYPE_COLOR: {} } };
  const store = new Map();
  const ctx = vm.createContext({
    G, Intl, Date, Math, JSON, console, performance: { now: () => 0 },
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    firebase: {}, location: { protocol: 'https:', hostname: 'localhost' }, navigator: { onLine: true },
    document: { addEventListener() {}, hidden: false }, window: { addEventListener() {} }, setTimeout: () => 0, clearTimeout() {}, TextEncoder
  });
  for (const f of ['js/data/pokedex.js', 'js/data/forms.js', 'js/data/sprites-meta.js', 'js/entities/trails.js', 'js/core/dress.js',
                   'js/data/shop.js', 'js/core/db.js']) vm.runInContext(read(f), ctx, { filename: f });
  return G;
}

/** Una partida de antes (numeración vieja): el Raticate de Alola era el 1020. */
function oldSave(at = 1000) {
  return {
    name: 'Ash', updated: at, coins: 10, tickets: { t1: 0, t10: 0 }, stats: {},
    owned: { 1020: { at: 500, from: 'gacha' }, 25: { at: 1, from: 'starter' } }, shiny: { 1020: { at: 600, from: 'gacha' } },
    partner: 1020, partnerShiny: true, starter: 25,
    pupg: { 1020: { hp: 3, dmg: 2 } }, pused: { 1020: 7 }, pseen: { 1020: 40 }, pdef: { 1020: 30 }, dfav: { 1020: 900 },
    mast: { 1020: 5000 }, mstat: { 1020: { r: 7, k: 900 } }, pnat: { 1020: ['adamant', 50] }, pabil: { 1020: [1, 60] },
    pdress: { 1020: [{ sh: 1, fx: 'aura' }, 70] }, ptm: { 1020: ['crunch'] }, ptmT: { '1020:crunch': 80 },
    pban: { 1020: ['tackle'] }, pickT: { 'pban:1020': 90 }, profile: { favs: [1020, 25], title: '' },
    eggs: { e1: { k: 'c', f: 'rift', at: 1, p: 10, d: 1020, s: 0 } }, eggsOpen: { e0: [1020, 0, 5] }
  };
}

test('al cargar, todo lo del 1020 viejo pasa al 500020 (una vez) y el 1020 queda para Gouging Fire', () => {
  const G = load();
  assert.equal(G.DEX_BY[1020].name, 'Flamariete');
  assert.equal(G.DEX_BY[500020].name, 'Alolan Raticate');
  const s = G.DB.migrate(oldSave());
  assert.ok(!s.owned[1020] && !s.shiny[1020], 'sin el 1020');
  assert.deepEqual(plain(s.owned[500020]), { at: 500, from: 'gacha' });
  assert.deepEqual(plain(s.shiny[500020]), { at: 600, from: 'gacha' });
  assert.equal(s.partner, 500020); assert.equal(s.partnerShiny, true);
  assert.deepEqual(plain(s.pupg[500020]), { hp: 3, dmg: 2 });
  assert.equal(s.pused[500020], 7); assert.equal(s.pseen[500020], 40); assert.equal(s.pdef[500020], 30);
  assert.equal(s.dfav[500020], 900); assert.equal(s.mast[500020], 5000);
  assert.deepEqual(plain(s.mstat[500020]), { r: 7, k: 900 });
  assert.deepEqual(plain(s.pnat[500020]), ['adamant', 50]); assert.deepEqual(plain(s.pabil[500020]), [1, 60]);
  assert.deepEqual(plain(s.pdress[500020]), [{ sh: 1, fx: 'aura' }, 70]);
  assert.deepEqual(plain(s.ptm[500020]), ['crunch']); assert.equal(s.ptmT['500020:crunch'], 80);
  assert.deepEqual(plain(s.pban[500020]), ['tackle']); assert.equal(s.pickT['pban:500020'], 90);
  assert.deepEqual(plain(s.profile.favs), [500020, 25]);
  assert.equal(s.eggs.e1.d, 500020); assert.equal(s.eggsOpen.e0[0], 500020);
  for (const k of ['pupg', 'pused', 'pseen', 'pdef', 'dfav', 'mast', 'mstat', 'pnat', 'pabil', 'pdress', 'ptm', 'pban'])
    assert.ok(!(1020 in s[k]), k + ' sin el 1020');
  assert.ok(s.dexmap > 0);
  // Una vez pasada, ya no se toca: Gouging Fire conseguido después se queda en el 1020.
  s.owned[1020] = { at: s.dexmap + 10, from: 'gacha' };
  const again = G.DB.migrate(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(plain(again.owned[1020]), { at: s.dexmap + 10, from: 'gacha' });
  assert.deepEqual(plain(again.owned[500020]), { at: 500, from: 'gacha' });
  // Una partida de antes sin el 1020 sólo se marca.
  const other = G.DB.migrate({ name: 'Misty', owned: { 25: { at: 1 } }, tickets: {}, stats: {} });
  assert.ok(other.dexmap > 0 && other.owned[25] && !other.owned[500020]);
});

test('juntar una copia ya pasada con otra de otro aparato aún sin pasar: nada se duplica ni se pierde, en cualquier orden', () => {
  const G = load();
  const a = G.DB.migrate(oldSave(2000));          // este aparato: ya pasada, y luego consigue Gouging Fire
  a.owned[1020] = { at: a.dexmap + 1000, from: 'gacha' };
  a.pupg[1020] = { hp: 1 };
  a.mast[500020] = 6000;                          // siguió jugando con el Raticate de Alola
  const b = oldSave(3000);                        // el otro aparato (más reciente) con el juego de antes
  b.pupg[1020] = { hp: 5, dmg: 1 };
  b.pused[1020] = 9;
  for (const r of [G.DB.merge(a, G.DB.migrate(JSON.parse(JSON.stringify(b)))), G.DB.merge(G.DB.migrate(JSON.parse(JSON.stringify(b))), a)]) {
    assert.deepEqual(plain(r.owned[1020]), plain(a.owned[1020]), 'Gouging Fire se queda');
    assert.deepEqual(plain(r.owned[500020]), { at: 500, from: 'gacha' });
    assert.deepEqual(plain(r.pupg[500020]), { hp: 5, dmg: 2 }, 'el mayor de cada mejora');
    assert.deepEqual(plain(r.pupg[1020]), { hp: 1 });
    assert.equal(r.mast[500020], 6000); assert.equal(r.pused[500020], 9);
    assert.equal(r.partner, 500020);
    assert.equal(r.dexmap, Math.min(a.dexmap, r.dexmap));
    // Y vuelve a cargar igual (idempotente).
    const back = G.DB.migrate(JSON.parse(JSON.stringify(r)));
    assert.deepEqual(plain(back.owned), plain(r.owned));
  }
});

test('un aparato con el juego viejo vuelve a meter el 1020 de Raticate en una copia ya pasada: se nota y se pasa', () => {
  const G = load();
  const s = G.DB.migrate(oldSave());
  const t = s.dexmap;
  // El juego viejo junta su copia (con el 1020 de antes) con la de la nube (ya pasada): queda dexmap y el 1020 viejo.
  s.owned[1020] = { at: 500, from: 'gacha' }; s.pupg[1020] = { hp: 4 }; s.mast[1020] = 7000;
  const r = G.DB.migrate(JSON.parse(JSON.stringify(s)));
  assert.ok(!r.owned[1020], 'el 1020 viejo vuelve a pasar');
  assert.deepEqual(plain(r.pupg[500020]), { hp: 4, dmg: 2 });
  assert.equal(r.mast[500020], 7000);
  assert.equal(r.dexmap, t);
});

test('aspectos del Vestidor: los «look» del oficial por especie (también 1000-1025) y los dos nuestros', () => {
  const G = load();
  const L = d => plain(G.Dress.looks(d).map(p => p.dex));
  assert.equal(L(869).length, 62, 'Alcremie');
  assert.equal(L(201).length, 27, 'Unown');
  assert.equal(L(666).length, 19, 'Vivillon');
  assert.ok(L(25).includes(530025) && L(25).includes(510025), 'Pikachu hembra y Belle');
  assert.deepEqual(L(3), [500003], 'Venusaur hembra');
  assert.deepEqual(L(1008), [501008], 'Miraidon (especie de más de 1000)');
  assert.deepEqual(L(1017), [], 'las máscaras de Ogerpon no son aspectos');
  assert.deepEqual(L(716), [1716]); assert.deepEqual(L(483), [2483]);
  assert.deepEqual(L(20), [], 'el Raticate de Alola es un Pokémon aparte');
  assert.deepEqual(L(500020), []);
  for (const d of [869, 201, 25, 3, 666, 676]) for (const p of G.Dress.looks(d)) assert.deepEqual(plain(p.types), plain(G.DEX_BY[d].types), p.name);
  assert.equal(G.Dress.lookGroup(560869), 'caramel-swirl');
  assert.equal(G.Dress.lookGroup(1110869), 'vanilla-cream');
  assert.equal(G.Dress.lookGroup(1201), '');
  // Un aspecto que ya no es de esa especie no se lleva.
  const s = { pdress: { 869: [{ lk: 560869 }, 1], 1017: [{ lk: 2017 }, 1] } };
  assert.equal(G.Dress.lookOf(s, 869), 560869);
  assert.equal(G.Dress.lookOf(s, 1017), 0);
});

test('Colección: 1025 especies + 57 regionales; las demás formas, exclusivas (para quien las tenga)', () => {
  const G = load();
  assert.equal(G.DEX.filter(p => p.dex <= 1025).length, 1025);
  assert.equal(G.DEX.filter(p => p.form === 'regional' && !p.excl).length, 57);
  assert.equal(G.DEX.filter(p => !p.excl).length, 1082);
  assert.equal(new Set(G.DEX.map(p => p.dex)).size, G.DEX.length, 'sin números repetidos');
  // Las regionales nuevas, en el banner de su especie, como las demás.
  assert.equal(G.DEX_BY[500020].gen, G.DEX_BY[20].gen);
  assert.equal(G.DEX_BY[500618].gen, G.DEX_BY[618].gen);
  assert.equal(G.DEX_BY[1020].gen, 9);
  assert.ok(G.DEX_BY[2483].excl && G.DEX_BY[1716].excl, 'Dialga Primigenio y Xerneas Neutral: sólo aspectos');
});
