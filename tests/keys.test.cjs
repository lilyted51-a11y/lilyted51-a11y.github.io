// Teclas cambiables (24-11-2026): js/core/keys.js de verdad, sus reglas puras (de serie, cambios, choques, guardado).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const G = {};
new Function('G', source('js/core/keys.js'))(G);
const K = G.Keys;
const base = () => K.resolve(null);

test('defaults: WASD + arrows, 1-4 and the numpad, Q/E, F, 5-8, P, cards 1-4 and R; two keys per action', () => {
  const m = base();
  assert.deepEqual(m.up, ['keyw', 'arrowup']);
  assert.deepEqual(m.left, ['keya', 'arrowleft']);
  assert.deepEqual(m.move1, ['digit1', 'numpad1']);
  assert.deepEqual(m.next, ['keye', 'tab']);
  assert.deepEqual(m.power, ['keyf', '']);
  assert.deepEqual(m.orb4, ['digit8', 'numpad8']);
  assert.deepEqual(m.card4, ['digit4', 'numpad4']);
  assert.deepEqual(m.reroll, ['keyr', '']);
  for (const a of K.ORDER) assert.equal(m[a].length, 2, a);
});

test('no key is repeated inside a group; cards may share keys with the run', () => {
  const m = base();
  for (const g of ['play', 'cards']) {
    const all = K.ORDER.filter(a => K.GROUP(a) === g).flatMap(a => m[a]).filter(Boolean);
    assert.equal(new Set(all).size, all.length, g);
  }
  assert.equal(K.GROUP('card1'), 'cards');
  assert.equal(K.GROUP('move1'), 'play');
  assert.deepEqual(m.card1, m.move1);
});

test('a free key just goes in its slot', () => {
  const r = K.assign(base(), 'power', 0, 'keyg');
  assert.deepEqual(r.map.power, ['keyg', '']);
  assert.equal(r.moved, null);
});

test('a key used by another action of the group swaps: the other one gets the old key', () => {
  const r = K.assign(base(), 'power', 0, 'keye');
  assert.deepEqual(r.map.power, ['keye', '']);
  assert.deepEqual(r.map.next, ['keyf', 'tab']);
  assert.deepEqual(r.moved, { action: 'next', slot: 0, code: 'keyf' });
});

test('with an empty slot there is nothing to give back: the other action loses that key', () => {
  const r = K.assign(base(), 'power', 1, 'tab');
  assert.deepEqual(r.map.power, ['keyf', 'tab']);
  assert.deepEqual(r.map.next, ['keye', '']);
  assert.deepEqual(r.moved, { action: 'next', slot: 1, code: '' });
});

test('its own other key just swaps slots; the cards group is separate from the run', () => {
  let r = K.assign(base(), 'up', 0, 'arrowup');
  assert.deepEqual(r.map.up, ['arrowup', 'keyw']);
  assert.equal(r.moved, null);
  r = K.assign(base(), 'card1', 0, 'keyq');     // Q is «previous move», but in another group
  assert.deepEqual(r.map.card1, ['keyq', 'numpad1']);
  assert.deepEqual(r.map.prev, ['keyq', '']);
  assert.equal(r.moved, null);
  r = K.assign(base(), 'card1', 0, 'keyr');     // R is «reroll», same group: swap
  assert.deepEqual(r.map.reroll, ['digit1', '']);
});

test('assign never changes the map it gets; clear empties a slot', () => {
  const m = base();
  K.assign(m, 'power', 0, 'keye');
  assert.deepEqual(m.power, ['keyf', '']);
  assert.deepEqual(K.clear(m, 'pause', 0).pause, ['', '']);
  assert.deepEqual(m.pause, ['keyp', '']);
});

test('only what differs from the defaults is saved, and it loads back the same', () => {
  const r = K.assign(base(), 'power', 0, 'keye');
  const d = K.diff(r.map);
  assert.deepEqual(Object.keys(d).sort(), ['next', 'power']);
  assert.deepEqual(K.resolve(d), r.map);
  assert.deepEqual(K.diff(base()), {});
});

test('broken or hand-edited saves fall back safely: bad codes, Esc, duplicates', () => {
  const m = K.resolve({ power: ['escape', ''], up: 'w', down: ['keyw', ''], left: [1, 2], pause: ['f5', ''] });
  assert.deepEqual(m.power, ['keyf', '']);
  assert.deepEqual(m.up, ['keyw', 'arrowup']);
  assert.deepEqual(m.down, ['', ''], 'W is already «up»');
  assert.deepEqual(m.left, ['keya', 'arrowleft']);
  assert.deepEqual(m.pause, ['keyp', '']);
  assert.ok(K.BLOCKED.has('escape') && K.BLOCKED.has('f5'));
});

test('key names', () => {
  assert.equal(K.name('keyq'), 'Q');
  assert.equal(K.name('digit5'), '5');
  assert.equal(K.name('numpad7'), 'Num 7');
  assert.equal(K.name('space'), 'Espacio');
  assert.equal(K.name('arrowleft'), '←');
  assert.equal(K.name('f3'), 'F3');
  assert.equal(K.shortName('space'), '␣');
  assert.equal(K.shortName('numpad7'), '7');
  assert.ok(K.shortName('backspace').length <= 3);
});
