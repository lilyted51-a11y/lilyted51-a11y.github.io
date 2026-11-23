// Maestría (js/systems/mastery.js), foto y marco (js/core/photo.js) y cómo se juntan en la partida guardada (js/core/db.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

function world(save) {
  const store = new Map();
  const G = {
    DEX_BY: { 1: { dex: 1, name: 'Bulbasaur', types: ['grass', 'poison'] }, 6: { dex: 6, name: 'Charizard', types: ['fire', 'flying'] },
              25: { dex: 25, name: 'Pikachu', types: ['electric'] }, 724: { dex: 724, name: 'Decidueye', types: ['grass', 'ghost'] }, 1724: { dex: 1724, name: 'Hisuian Decidueye', types: ['grass', 'fighting'] } },
    U: { int: (v, max = 1e12) => (Number.isFinite(+v) && +v > 0 ? Math.min(max, Math.floor(+v)) : 0), esc: s => String(s), TYPE_COLOR: {} },
    I18n: { f: (s, ...a) => a.reduce((t, x) => t.replace('{x}', x), s) }, T: s => s
  };
  const ctx = { G, console, localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
                setTimeout, clearTimeout, TextEncoder, addEventListener() {}, document: { addEventListener() {} }, performance: { now: () => 0 } };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['js/core/db.js', 'js/data/portraits.js', 'js/core/photo.js', 'js/systems/mastery.js']) vm.runInContext(read(f), ctx);
  G.DB = Object.assign({}, G.DB, { save, commit() {} });
  return G;
}

test('puntos: 1 por cada 6 derrotados y 25 por minuto, como mucho 40 minutos', () => {
  const G = world({});
  assert.equal(G.Mastery.gain(60, 6), 26);
  assert.equal(G.Mastery.gain(30 * 60, 5100), 750 + 850);
  // 80 minutos: cuenta la mitad del tiempo y la mitad de los derrotados
  assert.equal(G.Mastery.gain(80 * 60, 1200), 1000 + 100);
  assert.equal(G.Mastery.gain(0, 0), 0);
});

test('al acabar: suma al Pokémon elegido, sus números y los premios nuevos; nada si la partida está tocada', () => {
  const s = { mast: { 25: 9990 }, mstat: {} };
  const G = world(s);
  const pl = { kills: 60, bosses: 2 };
  G.Mastery.runStart(pl, 25);
  assert.equal(pl.aura, false);
  G.Mastery.note('rift'); G.Mastery.note('rift'); G.Mastery.note('eternatus'); G.Mastery.note('judge');
  const r = G.Mastery.runEnd(pl, 120, true);
  assert.equal(r.pts, 60);
  assert.equal(s.mast[25], 10050);
  assert.deepEqual([...r.got.map(t => t.id)], ['photo']);
  assert.deepEqual(JSON.parse(JSON.stringify(s.mstat[25])), { r: 1, t: 120, k: 60, a: 1, bt: 120, b: 2, rf: 2, e: 1 });
  assert.ok(G.Mastery.has(25, 'photo') && !G.Mastery.has(25, 'title'));
  // tocada (G.Game.clean) o desafío semanal: nada
  G.Mastery.runStart(pl, 25);
  assert.equal(G.Mastery.runEnd(pl, 600, false), null);
  G.Mastery.runStart(Object.assign(pl, { noMastery: true }), 25);
  assert.equal(G.Mastery.runEnd(pl, 600, true), null);
  assert.equal(s.mast[25], 10050);
  // el aura, a los 100.000
  s.mast[6] = 100000;
  const p2 = {};
  G.Mastery.runStart(p2, 6);
  assert.equal(p2.aura, true);
  assert.deepEqual([...G.Mastery.titles()], ['Maestro de Charizard']);
});

test('foto y marco: lo que se puede llevar, y lo que va y viene del perfil público', () => {
  const s = { partner: 25, owned: { 25: { at: 1 }, 1724: { at: 1 } }, mast: { 6: 60000 }, photos: {}, frames: {}, profile: {} };
  const G = world(s);
  assert.equal(G.Photo.photoLock(25, 'Happy'), '');
  assert.equal(G.Photo.photoLock(724, 'Normal'), '');             // forma: cuenta su especie
  assert.equal(G.Photo.photoLock(1, 'Normal'), 'own');
  assert.equal(G.Photo.photoLock(25, 'Joyous'), 'shop');
  assert.equal(G.Photo.photoLock(25, 'Inspired'), 'mastery');
  assert.equal(G.Photo.photoLock(6, 'Inspired'), '');             // maestría de 10.000
  assert.equal(G.Photo.frameLock('wood'), '');
  assert.equal(G.Photo.frameLock('ember'), 'shop');
  assert.equal(G.Photo.frameLock('m:6'), '');
  assert.equal(G.Photo.frameLock('m:25'), 'mastery');
  assert.ok(G.Photo.setPhoto(6, 'Inspired') && G.Photo.setFrame('m:6'));
  assert.ok(!G.Photo.setFrame('ember'));
  const pub = G.Photo.pub(s);
  assert.deepEqual(JSON.parse(JSON.stringify(pub)), { photo: [6, G.Photo.EX.indexOf('Inspired')], frame: 'm:6' });
  assert.deepEqual(JSON.parse(JSON.stringify(G.Photo.fromPub(pub))), { d: 6, e: 'Inspired', f: 'm:6' });
  assert.equal(G.Photo.fromPub({ photo: [99999, 0] }), null);
  assert.equal(G.Photo.fromPub({ photo: [25, 0], frame: '<script>' }).f, 'basic');
  // si deja de poder llevarla (p. ej. otra partida guardada), vuelve a su compañero y al Sencillo
  s.mast[6] = 0;
  assert.deepEqual(JSON.parse(JSON.stringify(G.Photo.mine(s))), { d: 25, e: 'Normal', f: 'basic' });
});

test('la tienda: 4 fotos al día y 2 marcos a la semana, iguales para todos', () => {
  const s = { coins: 10000, photos: {}, frames: {} };
  const G = world(s);
  G.Shop = { today: () => '20261124' };
  const a = G.Photo.dailyPhotos(), b = G.Photo.dailyPhotos();
  assert.equal(a.length, 4);
  assert.deepEqual(JSON.stringify(a), JSON.stringify(b));
  assert.ok(a.every(p => G.Photo.SHOP.includes(p.e)));
  assert.equal(G.Photo.week(), '20261123');
  const fr = G.Photo.weeklyFrames();
  assert.equal(fr.length, 2);
  assert.equal(G.Photo.buyPhoto(a[0].key).ok, true);
  assert.equal(G.Photo.buyPhoto(a[0].key).ok, false);
  assert.equal(G.Photo.buyFrame(fr[0]).ok, true);
  assert.equal(s.coins, 10000 - G.Photo.PHOTO_PRICE - G.Photo.FRAME_PRICE);
  assert.equal(G.Photo.frameLock(fr[0], s), '');
});

test('partida guardada: la maestría se junta con el mayor de cada número; fotos y marcos, unión', () => {
  const G = world({});
  const a = { updated: 2, coins: 0, tickets: { t1: 0, t10: 0 }, owned: {}, shiny: {}, upgrades: {}, stats: {}, mast: { 25: 500, 6: 10 }, mstat: { 25: { r: 3, t: 900 } }, photos: { '25/Joyous': 5 }, frames: {} };
  const b = { updated: 1, coins: 0, tickets: { t1: 0, t10: 0 }, owned: {}, shiny: {}, upgrades: {}, stats: {}, mast: { 25: 800 }, mstat: { 25: { r: 2, t: 1200, e: 1 } }, photos: {}, frames: { ember: 7 } };
  const r = G.DB.merge(a, b);
  assert.deepEqual(JSON.parse(JSON.stringify(r.mast)), { 25: 800, 6: 10 });
  assert.deepEqual(JSON.parse(JSON.stringify(r.mstat[25])), { r: 3, t: 1200, e: 1 });
  assert.deepEqual(JSON.parse(JSON.stringify(r.photos)), { '25/Joyous': 5 });
  assert.deepEqual(JSON.parse(JSON.stringify(r.frames)), { ember: 7 });
  // y lo raro se limpia
  const s = { mast: { 25: -4, 6: 'x', 1: 50 }, mstat: { 25: { r: 2, zz: 9 } }, photos: { '25/Nope': 1, 'abc': 1, '25/Happy': 3 }, frames: { basic: 1, ember: 2, gold: 3 }, profile: { photo: { d: 25, e: 'Happy' }, frame: 'nope' } };
  G.Mastery.sanitize(s); G.Photo.sanitize(s);
  assert.deepEqual(JSON.parse(JSON.stringify(s.mast)), { 1: 50 });
  assert.deepEqual(JSON.parse(JSON.stringify(s.mstat)), { 25: { r: 2 } });
  assert.deepEqual([...Object.keys(s.photos)], ['25/Happy']);
  assert.deepEqual([...Object.keys(s.frames)], ['ember']);
  assert.equal(s.profile.frame, undefined);
  assert.equal(s.profile.photo.e, 'Happy');
});
