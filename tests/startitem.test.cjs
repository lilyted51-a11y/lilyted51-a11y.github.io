// Objeto inicial (24-11-2026, systems/startitem.js): los objetos de partida comprados (save.held) van en la libreta
// de las monedas y el elegido de cada Pokémon (save.psitem) gana el cambiado más tarde. js/core/db.js de verdad, con
// la misma nube falsa que tests/db.test.cjs (rev + 1 y 20 s entre escrituras).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'js/core/db.js'), 'utf8');

let NOW = 1e12, cloud = null;
const clone = o => JSON.parse(JSON.stringify(o));
const ref = {
  async get() { return { exists: !!cloud, data: () => clone(cloud) }; },
  async set(d, o) {
    const next = Object.assign(cloud ? clone(cloud) : {});
    for (const f of o.mergeFields) next[f] = clone(d[f]);
    next.updatedAt = NOW;
    if (cloud) {
      const had = cloud.rev || 0, now = next.rev || 0;
      if (NOW <= cloud.updatedAt + 20000 || !(now === had + 1 || (had === 0 && now === 0))) throw { code: 'permission-denied' };
    }
    cloud = next;
  }
};
const TABS = new Map();
function tab(store) {
  if (!TABS.has(store)) TABS.set(store, []);
  const mine = [], timers = [];
  const localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); for (const fn of TABS.get(store)) if (!mine.includes(fn)) setImmediate(() => fn({ key: k, newValue: String(v) })); },
    removeItem: k => store.delete(k), key: i => [...store.keys()][i], get length() { return store.size; }
  };
  const auth = { setPersistence: async () => {}, useEmulator() {}, onAuthStateChanged: cb => { Promise.resolve().then(() => cb({ uid: 'U1', displayName: 'Ash' })); return () => {}; } };
  const db = { useEmulator() {}, settings() {}, collection: () => ({ doc: () => ref }) };
  const G = { FIREBASE_CONFIG: { apiKey: 'x', projectId: 'p', emulator: true } };
  const ctx = {
    G, localStorage, console: { warn() {}, log: console.log }, TextEncoder, setTimeout: fn => timers.push(fn), clearTimeout() {},
    firebase: { initializeApp() {}, auth: Object.assign(() => auth, { Auth: { Persistence: { LOCAL: 1 } } }),
                firestore: Object.assign(() => db, { FieldValue: { serverTimestamp: () => 0 } }) },
    location: { protocol: 'https:', hostname: 'localhost' }, navigator: { onLine: true },
    document: { createElement: () => ({}), head: { appendChild: el => setImmediate(el.onload) }, hidden: false, addEventListener() {} },
    window: { addEventListener: (t, fn) => { mine.push(fn); TABS.get(store).push(fn); } }, Date: { now: () => NOW }
  };
  vm.createContext(ctx);
  vm.runInContext(SRC, ctx);
  return { DB: G.DB, close() { const l = TABS.get(store); for (const fn of mine) l.splice(l.indexOf(fn), 1); } };
}
const settle = async () => { for (let i = 0; i < 6; i++) await new Promise(r => setImmediate(r)); };
async function open(store) { const t = tab(store); await t.DB.ready(); await settle(); return t; }
async function act(t, fn) { NOW += 100000; fn(t.DB.save, t.DB); t.DB.commit(); await settle(); }
async function save(t) { NOW += 100000; await t.DB.saveNow(); await settle(); }
const reset = () => { cloud = null; TABS.clear(); };

test('objetos de partida: lo comprado en un aparato y lo gastado en otro cuadran (libreta h:)', async () => {
  reset();
  const pc = new Map(), mob = new Map();
  let A = await open(pc);
  await act(A, s => { s.held.leftovers = 2; s.held.punchingglove = 1; });   // (punchingglove: 13 letras)
  await save(A);
  const B = await open(mob);
  assert.equal(B.DB.save.held.leftovers, 2);
  assert.equal(B.DB.save.held.punchingglove, 1);
  await act(B, s => { s.held.leftovers -= 1; });                           // empieza una partida con Restos
  await save(B);
  A.close(); A = await open(pc);
  assert.equal(A.DB.save.held.leftovers, 1);
  await act(A, s => { s.held.leftovers += 1; });                           // compra otro
  await save(A);
  const fin = await open(new Map());
  assert.equal(fin.DB.save.held.leftovers, 2);
  assert.equal(fin.DB.save.held.punchingglove, 1);
  assert.ok(Object.values(fin.DB.save.led).some(e => e['h:leftovers']), 'apunte h:leftovers en la libreta');
});

test('objeto inicial elegido: gana el cambiado más tarde, en cualquier aparato', async () => {
  reset();
  const pc = new Map(), mob = new Map();
  const A = await open(pc);
  await act(A, (s, DB) => { s.psitem[25] = 'leftovers'; DB.touchPick('psitem', 25); });
  await save(A);
  const B = await open(mob);
  assert.equal(B.DB.save.psitem[25], 'leftovers');
  await act(B, (s, DB) => { s.psitem[25] = 'choicescarf'; DB.touchPick('psitem', 25); });
  await save(B);
  await act(A, s => { s.coins += 1; });                                    // el PC guarda después otra cosa
  await save(A);
  const fin = await open(new Map());
  assert.equal(fin.DB.save.psitem[25], 'choicescarf');
});

test('merge: una copia sin objetos de partida no los borra', () => {
  const t = tab(new Map());
  const a = { updated: 1, coins: 0, tickets: { t1: 0, t10: 0 }, held: { metronome: 3 }, owned: {}, stats: {} };
  const b = { updated: 2, coins: 0, tickets: { t1: 0, t10: 0 }, owned: {}, stats: {} };
  assert.equal(t.DB.merge(a, b).held.metronome, 3);
});
