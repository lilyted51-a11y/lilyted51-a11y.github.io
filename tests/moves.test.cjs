// La Gran Actualización (23-11-2026): Quitamovimientos (Player.swapMove y sus dos pasos en run-ui.js),
// la MT vacía (G.Mons.forget y la fusión de ptm con fechas en db.js) y la Pokédex de vistos y derrotados
// (systems/dexlog.js y su fusión con el mayor).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

// ---------------- Player.swapMove ----------------
function player(ids, groups) {
  const G = {
    Moves: { BY_ID: {}, instance: (id, lvl) => ({ id, name: id, lvl, kind: 'shot' }) },
    Projectiles: { clearOrbs() {} }, Game: { st: { time: 42 } }
  };
  for (const id of ['ember', 'surf', 'bite', 'growl', 'thunder']) G.Moves.BY_ID[id] = { id };
  new Function('G', source('js/entities/player.js'))(G);
  const p = Object.create(G.Player.prototype);
  p.moves = ids.map(id => ({ id, name: id, lvl: 4 }));
  const by = id => p.moves.find(m => m.id === id);
  p.slots = (groups || ids.map(id => [id])).map(g => g.map(by));
  p.active = 0; p.bind = {};
  return { p, by };
}

test('Move Remover: the new move takes the same slot, at level 1, and you keep the slot you were using', () => {
  const { p, by } = player(['ember', 'surf', 'bite']);
  p.active = 2;
  assert.ok(p.swapMove(by('surf'), 'thunder'));
  assert.deepEqual(p.moves.map(m => m.id), ['ember', 'thunder', 'bite']);
  assert.deepEqual(p.slots.map(g => g.map(m => m.id)), [['ember'], ['thunder'], ['bite']]);
  assert.equal(by('thunder').lvl, 1);
  assert.equal(by('thunder').since, 42);
  assert.equal(p.active, 2, 'still on Bite');
});

test('Move Remover: leaving it empty frees the slot; a bonded move leaves its group but the group stays', () => {
  const { p, by } = player(['ember', 'surf', 'bite'], [['ember', 'surf'], ['bite']]);
  p.active = 1;
  assert.ok(p.swapMove(by('surf'), null));
  assert.deepEqual(p.slots.map(g => g.map(m => m.id)), [['ember'], ['bite']]);
  assert.equal(p.active, 1);
  assert.ok(p.swapMove(by('ember'), null));
  assert.deepEqual(p.slots.map(g => g.map(m => m.id)), [['bite']]);
  assert.equal(p.active, 0, 'the slot you were on is gone: the nearest one');
  assert.ok(!p.swapMove(by('bite'), null), 'you can never be left without moves');
  assert.ok(!p.swapMove(by('bite'), 'bite'), 'nor take a move you already have');
  const q = player(['ember', 'surf'], [['ember', 'surf']]);
  assert.ok(q.p.swapMove(q.by('ember'), 'growl'));
  assert.deepEqual(q.p.slots.map(g => g.map(m => m.id)), [['growl', 'surf']], 'in a bond, the new one joins the group');
});

// ---------------- run-ui.js: los dos pasos ----------------
function fakeEl(id) {
  const ls = {};
  const el = {
    id, ls, dataset: {}, children: [], textContent: '', onclick: null,
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    addEventListener(t, fn) { (ls[t] = ls[t] || []).push(fn); },
    appendChild(c) { el.children.push(c); },
    setAttribute() {}, querySelectorAll: () => [], querySelector: () => null, style: {}
  };
  Object.defineProperty(el, 'innerHTML', { get: () => '', set: v => { if (v === '') el.children.length = 0; } });
  return el;
}
function runUI(pl) {
  let now = 10000;
  const els = {}, $ = id => (els[id] = els[id] || fakeEl(id));
  const G = {
    UI: { $, show() {}, hide() {}, isOpen: () => true }, Audio: { sfx() {} }, T: s => s, I18n: { f: (t, ...a) => t.replace(/\{x\}/g, () => a.shift()) },
    U: { TYPE_COLOR: {}, TYPE_NAME: {} }, Icons: { html: () => '' }, Stats: { NAME: {} }, FX: { ring() {} }, Spawner: { say() {} },
    Moves: { BY_ID: { thunder: { name: 'thunder', type: 'electric', desc: '' }, growl: { name: 'growl', type: 'normal', desc: '' } } },
    Game: { player: pl }, LevelUp: { offer: () => [], swapPool: () => ['thunder', 'growl'] }
  };
  const document = { createElement: () => fakeEl(), querySelectorAll: () => [] };
  new Function('G', 'document', 'performance', 'setTimeout', 'clearTimeout', source('js/ui/run-ui.js'))(G, document, { now: () => now }, () => 0, () => {});
  return { G, $, wait: ms => { now += ms; } };
}

test('Move Remover card: pick the move to remove, then what goes in; Back undoes a step; the card applies it', () => {
  const { p, by } = player(['ember', 'surf', 'bite']);
  const r = runUI(p), picked = [];
  const remove = { type: 'remove', key: 'remove', title: 'Quitamovimientos', apply() {} };
  r.G.RunUI.showLevelUp(9, [{ title: 'A0' }, remove], c => { picked.push(c); c.apply(p); });
  r.wait(1000);
  r.G.RunUI.pick(1);                                   // la carta
  let cards = r.$('cards').children;
  assert.equal(cards.length, 4, 'your 3 moves + Back');
  r.G.RunUI.pick(3);                                   // Volver: las cartas de nivel otra vez
  assert.equal(r.$('cards').children.length, 2);
  r.G.RunUI.pick(1);
  r.G.RunUI.pick(1);                                   // quitar Surf
  cards = r.$('cards').children;
  assert.equal(cards.length, 4, 'leave it empty + 2 moves of the Pokémon + Back');
  assert.equal(cards[1].dataset.key, 'rm:to:thunder');
  assert.deepEqual(picked, [], 'nothing applied yet');
  r.G.RunUI.pick(1);                                   // Trueno
  assert.equal(picked.length, 1);
  assert.equal(picked[0], remove);
  assert.deepEqual(p.moves.map(m => m.id), ['ember', 'thunder', 'bite']);
  assert.ok(!by('surf'));
});

test('Move Remover in a group: when time runs out mid-way, the first other card is taken (no move is lost)', () => {
  const { p } = player(['ember', 'surf']);
  const r = runUI(p), picked = [];
  const remove = { type: 'remove', key: 'remove', apply() {} };
  r.G.RunUI.showLevelUp(9, [remove, { title: 'A1' }], c => picked.push(c.title), true);
  r.wait(1000);
  r.G.RunUI.pick(0);
  r.G.RunUI.pick(0);                                   // ya ha elegido qué quitar...
  r.G.RunUI.pickFirst();                               // ...y se acaba el tiempo
  assert.deepEqual(picked, ['A1']);
  assert.deepEqual(p.moves.map(m => m.id), ['ember', 'surf']);
});

// ---------------- Pokédex de vistos y derrotados ----------------
test('Pokédex: each enemy is seen once even if it arrives again; Eternatus cores do not count; a run adds up', () => {
  const save = { pseen: { 1: 10 }, pdef: { 1: 4 } };
  const G = { DEX_BY: { 1: {}, 4: {}, 890: {} }, DB: { save } };
  new Function('G', source('js/systems/dexlog.js'))(G);
  const L = G.DexLog;
  L.reset();
  L.see({ id: 1, dex: 1 }); L.see({ id: 1, dex: 1 }); L.see({ id: 2, dex: 4 });
  L.see({ id: 3, dex: 890, etCore: true }); L.kill({ id: 3, dex: 890, etCore: true });
  L.kill({ id: 1, dex: 1 }); L.kill({ id: 9, dex: 4 });   // uno que no se llegó a ver: también es un visto
  assert.equal(L.seenOf(1), 11);
  assert.equal(L.defeatedOf(4), 1);
  L.bank(save);
  assert.deepEqual(save.pseen, { 1: 11, 4: 2 });
  assert.deepEqual(save.pdef, { 1: 5, 4: 1 });
  assert.equal(L.seenOf(1), 11, 'nothing counted twice after banking');
  assert.deepEqual(L.totals(), { seen: 2, defeated: 2 });
});

// ---------------- core/db.js: fusión ----------------
function db() {
  const store = new Map();
  const ctx = {
    G: {}, localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    console, setTimeout: () => 0, clearTimeout() {}, location: { protocol: 'https:', hostname: 'localhost' }, navigator: { onLine: true },
    document: { addEventListener() {}, hidden: false }, window: { addEventListener() {} }, Date
  };
  vm.createContext(ctx);
  vm.runInContext(source('js/core/db.js'), ctx);
  return ctx.G.DB;
}
// Una partida mínima para fusionar (monedas, tickets y lo que se fusiona siempre).
const sv = o => Object.assign({ coins: 0, tickets: { t1: 0, t10: 0 }, upgrades: {}, stats: {}, owned: {} }, o);

test('merge: seen and defeated keep the larger count of each Pokémon', () => {
  const DB = db();
  const a = sv({ updated: 1, pseen: { 1: 50, 4: 3 }, pdef: { 1: 20 } }), b = sv({ updated: 2, pseen: { 1: 40, 7: 9 }, pdef: { 1: 25, 7: 1 } });
  const r = JSON.parse(JSON.stringify(DB.merge(a, b)));   // (objetos de otro contexto de vm)
  assert.deepEqual(r.pseen, { 1: 50, 4: 3, 7: 9 });
  assert.deepEqual(r.pdef, { 1: 25, 7: 1 });
});

test('merge: a TM erased with the Empty TM does not come back from the other device, unless taught again later', () => {
  const DB = db();
  const pc = sv({ updated: 5, ptm: { 25: ['surf', 'fly'] }, ptmT: { '25:surf': 100 } });            // la enseñó en el PC
  const mob = sv({ updated: 9, ptm: { 25: ['fly'] }, ptmT: { '25:surf': -200 } });                    // y la borró en el móvil
  const merge = (x, y) => JSON.parse(JSON.stringify(DB.merge(x, y)));
  let r = merge(pc, mob);
  assert.deepEqual(r.ptm[25], ['fly']);
  r = merge(mob, pc);
  assert.deepEqual(r.ptm[25], ['fly'], 'same result whichever is newer');
  const again = sv({ updated: 3, ptm: { 25: ['fly', 'surf'] }, ptmT: { '25:surf': 300 } });          // la vuelve a enseñar después
  r = merge(mob, again);
  assert.deepEqual([...r.ptm[25]].sort(), ['fly', 'surf']);
  const old = sv({ updated: 1, ptm: { 25: ['fly', 'surf'] } });                                       // sin fechas (de antes)
  r = merge(old, mob);
  assert.deepEqual(r.ptm[25], ['fly']);
});
