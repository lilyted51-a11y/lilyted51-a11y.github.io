// La Sentencia de Arceus en la Sala del Origen (23-11-2026): js/systems/judgment.js de verdad, sus reglas puras.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const G = {};
new Function('G', source('js/systems/judgment.js'))(G);
const J = G.Judgment;
const near = (a, b) => Math.abs(a - b) < 1e-9;

test('Arceus matches your speed at minute 1, is faster at 3 and goes at 140% at 10', () => {
  assert.ok(J.speedK(0) < 1);
  assert.ok(near(J.speedK(60), 1));
  assert.ok(J.speedK(180) > 1.1);
  assert.ok(near(J.speedK(600), 1.4));
  for (let t = 0; t < 900; t += 7) assert.ok(J.speedK(t + 7) >= J.speedK(t), 'never slows down (' + t + ' s)');
});

test('touching it takes 45%, more and more from minute 7, and knocks you out from minute 10', () => {
  assert.equal(J.touchAt(0), 0.45);
  assert.equal(J.touchAt(420), 0.45);
  assert.ok(J.touchAt(500) > 0.45 && J.touchAt(500) < 1);
  assert.equal(J.touchAt(600), 1);
  assert.equal(J.touchAt(900), 1);
});

test('one new attack every 30 s, all of them by 2:30, and no legendaries any more', () => {
  const late = J.MOVES.filter(m => m.at > 0).map(m => m.at).sort((a, b) => a - b);
  assert.deepEqual(late, [30, 60, 90, 120, 150]);
  assert.deepEqual(J.MOVES.filter(m => m.at > 0).map(m => m.id), ['extreme', 'future', 'gravity', 'hyper', 'plates']);
  assert.equal(J.shielded, false);
});

test('items break one by one at 2, 4, 6 (and 8) minutes; Golden Blades at 5 and a reversed lane at 7', () => {
  assert.deepEqual(J.BREAKS, [120, 240, 360, 480]);
  assert.deepEqual(J.LANES.map(L => L.at), [300, 420]);
  assert.ok(J.LANES[0].R > J.LANES[1].R, 'the second lane is further in');
  assert.ok(Math.sign(J.LANES[0].w) === -Math.sign(J.LANES[1].w), 'and spins the other way');
});

test('the move it rips out is the one you flee with: dashes, Agility and moves that move you', () => {
  assert.equal(J.fleeMove({ id: 'quick-attack', kind: 'dash' }), true);
  assert.equal(J.fleeMove({ id: 'agility', kind: 'buff', stat: 'spd' }), true);
  assert.equal(J.fleeMove({ id: 'swords-dance', kind: 'buff', stat: 'patk' }), false);
  assert.equal(J.fleeMove({ id: 'thunder-shock', kind: 'projectile' }), false);
  assert.equal(J.fleeMove(null), false);
});

test('speed soft cap is unchanged outside Gravity', () => {
  assert.equal(J.capSpd(100), 100);
  assert.equal(J.capSpd(170), 140);
});
