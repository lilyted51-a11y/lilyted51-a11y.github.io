// Desafío semanal (systems/challenge.js): el mismo para todos cada semana, condiciones que rotan,
// clima fijo, enemigos de un tipo, «Sin curaciones», el intento gastado al empezar, cómo se junta
// entre aparatos (core/db.js) y su tabla del ranking (net/ranking.js, sólo crear la marca).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const src = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

/** El juego justo para el desafío: datos, enemigos, clima, ranking (sin nube) y el desafío. */
function game() {
  const store = new Map();
  const said = [];
  const G = {
    DB: { save: { chal: null, tickets: { t1: 0, t10: 0 } }, online: false, fb: null, commit() { this.commits = (this.commits || 0) + 1; } },
    Spawner: { say: t => said.push(t) }, Audio: { sfx() {} }, Coop: { active: false, isHost: false },
    Rift: { inArena: false }, Judgment: { active: false }, World: { biome: 0 }, EnemyMgr: { all: () => [] }, FX: { dmgText() {} },
    Halloween: { inRun: false }, Mons: { slots: () => ['static', 0, 0] }, UI: { toast() {} }, Social: { me: null },
    T: s => s, I18n: { f: (s, ...v) => { let i = 0; return s.replace(/\{x\}/g, () => v[i++]); } }
  };
  const localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k), key: i => [...store.keys()][i], get length() { return store.size; } };
  const ctx = vm.createContext({ G, localStorage, console, Intl, Date, Math, JSON, Object, Promise, Number, setTimeout, clearTimeout });
  ctx.window = ctx;
  for (const f of ['js/core/util.js', 'js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/data/enemies.js', 'js/systems/weather.js',
                   'js/net/ranking.js', 'js/systems/challenge.js']) vm.runInContext(src(f), ctx, { filename: f });
  return { G, said };
}

test('el mismo desafío para todos la misma semana, y cada semana una condición distinta de la anterior', () => {
  const a = game().G, b = game().G;
  assert.deepEqual(JSON.parse(JSON.stringify(a.Challenge.of('w2026-48'))), JSON.parse(JSON.stringify(b.Challenge.of('w2026-48'))));
  const seen = new Set();
  let prev = null;
  for (let y = 2026; y <= 2028; y++) for (let w = 1; w <= 52; w++) {
    const c = a.Challenge.of('w' + y + '-' + String(w).padStart(2, '0'));
    const key = c.cond + ':' + (c.wx || c.type || '');
    if (prev) assert.notEqual(c.cond === 'wx' ? 'wx:' + c.wx : c.cond, prev, 'dos semanas seguidas con la misma condición: ' + c.w);
    prev = c.cond === 'wx' ? 'wx:' + c.wx : c.cond;
    seen.add(c.cond === 'wx' ? 'wx:' + c.wx : c.cond);
    const p = a.DEX_BY[c.dex];
    assert.ok(p && p.dex <= 1025 && p.rarity < 5 && p.bst >= 430, 'Pokémon prestado normal: ' + c.dex);
    assert.ok(Number.isInteger(c.seed) && c.seed >= 0 && c.seed < 1e6);
    if (c.cond === 'type') assert.ok(a.Challenge.types().includes(c.type), 'tipo con enemigos en todos los tramos: ' + key);
  }
  for (const k of ['wx:sun', 'wx:rain', 'wx:sand', 'wx:snow', 'wx:fog', 'type', 'noheal', 'night']) assert.ok(seen.has(k), 'sale ' + k);
});

test('clima fijo: vuelve tras la arena de la grieta, ni habilidades ni Mega lo cambian, y se quita al acabar', () => {
  const { G } = game();
  G.Weather.reset();
  G.Weather.lock('sand');
  assert.equal(G.Weather.current, null, '(entra poco a poco)');
  G.Weather.update(4, 10, null);
  assert.equal(G.Weather.current.kind, 'sand');
  assert.ok(G.Weather.current.fixed, 'sin cuenta atrás en el HUD');
  G.Weather.debugStart('rain', 60);
  assert.equal(G.Weather.current.kind, 'sand', 'una habilidad no lo cambia');
  G.Weather.force('fog', 60);                // la arena de una grieta
  G.Weather.update(4, 20, null);
  assert.equal(G.Weather.current.kind, 'fog');
  G.Weather.clear();                         // al salir de la arena
  G.Weather.update(0.1, 30, null);
  assert.equal(G.Weather.current.kind, 'sand', 'vuelve el del desafío');
  G.Weather.lock(null);
  G.Weather.update(4, 40, null);
  assert.equal(G.Weather.current, null, 'al acabar, se va');
  G.Weather.lock('snow'); G.Weather.reset();
  assert.equal(G.Weather.locked, null, 'una partida nueva empieza sin clima fijo');
});

test('«Todos de tipo …»: el elenco de cada tramo, los jefes y las hordas son de ese tipo', () => {
  const { G } = game();
  G.DB.save.chal = null;
  for (const type of G.Challenge.types()) {
    G.Challenge.arm();
    const c = G.Challenge.take(false);
    c.cond = 'type'; c.type = type;           // (la de esta semana puede ser otra: se fuerza)
    const { cast, bosses } = G.Enemies.rollRun();
    for (const tier of cast) {
      assert.ok(tier.list.length >= 3, type + ': al menos 3 por tramo');
      for (const d of tier.list) assert.ok(G.DEX_BY[d.dex].types.includes(type), type + ': ' + d.name);
    }
    for (const b of bosses) assert.ok(G.DEX_BY[b.dex].types.includes(type) || !G.DEX.some(p => !p.leg && !p.excl && p.types.includes(type) && p.bst >= 450), type + ': jefe ' + b.name);
    assert.ok(G.Enemies.hordeTypes(400).every(t => t === type));
  }
  G.Challenge.take(false);                    // partida normal: todo vuelve
  const { cast } = G.Enemies.rollRun();
  assert.ok(new Set(cast.flatMap(t => t.list.flatMap(d => G.DEX_BY[d.dex].types))).size > 3);
});

test('el intento se gasta al empezar; en grupo no hay desafío; «Sin curaciones» y el ticket de los 3 minutos', () => {
  const { G } = game();
  const w = G.Challenge.weekId();
  assert.equal(G.Challenge.used(w), false);
  G.Challenge.arm();
  assert.equal(G.Challenge.take(true), null, 'en grupo, nunca');
  assert.equal(G.Challenge.used(w), false);
  G.Challenge.arm();
  const c = G.Challenge.take(false);
  assert.equal(c.w, w);
  assert.ok(G.Challenge.used(w), 'gastado nada más empezar');
  assert.ok(G.DB.commits >= 1, 'y guardado');
  c.cond = 'noheal';
  const pl = { hp: 100, maxHp: 100, dead: false };
  G.Challenge.tick(0.1, pl, 5);
  pl.hp = 60; G.Challenge.tick(0.1, pl, 6);
  pl.hp = 90; G.Challenge.tick(0.1, pl, 7);
  assert.equal(pl.hp, 60, 'la vida perdida no vuelve');
  pl.maxHp = 200; pl.hp = 150; G.Challenge.tick(0.1, pl, 8);
  assert.equal(pl.hp, 120, 'subir la vida máxima no cura: la misma proporción');
  assert.equal(G.Challenge.tick(0.1, pl, 179), false);
  assert.equal(G.Challenge.tick(0.1, pl, 180.05), true, 'a los 3 minutos, el ticket ×10');
  assert.equal(G.Challenge.tick(0.1, pl, 200), false, 'una sola vez');
  assert.equal(G.DB.save.chal.tk, 1);
  G.Challenge.finish(212.7);
  assert.equal(G.DB.save.chal.t, 212);
  G.Challenge.arm();
  G.Challenge.take(false);
  assert.equal(G.DB.save.chal.t, 212, '(si se empezara otra vez, no se pierde lo apuntado)');
});

test('entre aparatos: la semana más reciente; la misma semana, el intento gastado en cualquiera', () => {
  const ctx = vm.createContext({ G: {}, localStorage: { getItem: () => null, setItem() {}, removeItem() {}, key: () => null, length: 0 },
    console: { warn() {}, log() {} }, location: { protocol: 'https:', hostname: 'localhost' }, navigator: { onLine: true },
    document: { addEventListener() {}, createElement: () => ({}), head: { appendChild() {} } }, window: { addEventListener() {} }, setTimeout, clearTimeout, TextEncoder });
  vm.runInContext(src('js/core/db.js'), ctx);
  const { merge } = ctx.G.DB;
  const base = (chal, updated) => ({ updated, created: 1, coins: 0, tickets: { t1: 0, t10: 0 }, owned: {}, shiny: {}, stats: {}, upgrades: {}, chal });
  let r = merge(base({ w: 'w2026-47', at: 5, t: 300, tk: 1 }, 10), base({ w: 'w2026-48', at: 9, t: 20, tk: 0 }, 5));
  assert.equal(r.chal.w, 'w2026-48');
  r = merge(base({ w: 'w2026-48', at: 9, t: 20, tk: 0 }, 10), base({ w: 'w2026-48', at: 7, t: 250, tk: 1 }, 5));
  assert.deepEqual(JSON.parse(JSON.stringify(r.chal)), { w: 'w2026-48', at: 7, t: 250, tk: 1 });
  r = merge(base(null, 10), base({ w: 'w2026-48', at: 7, t: 0, tk: 0 }, 5));
  assert.equal(r.chal.w, 'w2026-48', 'un aparato que no lo había jugado no lo devuelve');
});

test('ranking del desafío: su propia tabla, con cualquier tiempo, sin tocar las normales', async () => {
  const docs = new Map(), store = new Map();
  const clone = o => JSON.parse(JSON.stringify(o));
  // (firestore.rules: en las tablas s_c... sólo se puede crear la marca, no mejorarla.)
  const ruleOk = (p, d) => !p.startsWith('lb/') || (Number.isInteger(d.t) && d.t > 0 && d.lv >= 1 && d.lv <= 10 + d.t / 4
    && (!/^lb\/s_c/.test(p) || !docs.has(p)) && (!docs.has(p) || d.t > docs.get(p).t));
  const ref = p => ({ p, async get() { return { exists: docs.has(p), id: p.split('/').pop(), data: () => clone(docs.get(p)) }; },
    async set(d) { if (!ruleOk(p, d)) throw { code: 'permission-denied' }; docs.set(p, clone(d)); },
    collection: c => ({ doc: id => ref(p + '/' + c + '/' + id) }) });
  const fsx = { collection: c => ({ doc: id => ref(c + '/' + id) }),
    async runTransaction(fn) { const ws = []; await fn({ get: r => r.get(), set: (r, d) => ws.push([r.p, d]) });
      for (const [p, d] of ws) if (!ruleOk(p, d)) throw { code: 'permission-denied' }; for (const [p, d] of ws) docs.set(p, clone(d)); } };
  const toasts = [];
  const G = { U: { int: (v, max = 1e12) => (Number.isFinite(+v) && +v > 0 ? Math.min(max, Math.floor(+v)) : 0),
                   str: (v, max = 64) => (typeof v === 'string' ? v.slice(0, max) : ''), list: (v, max = 50) => (Array.isArray(v) ? v.slice(0, max) : []) },
    DB: { online: true, fb: { fs: fsx, uid: 'U1', auth: { currentUser: { uid: 'U1' } } } },
    Social: { me: { name: 'Ash' }, friends: [] }, UI: { toast: t => toasts.push(t) } };
  const localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k), key: i => [...store.keys()][i], get length() { return store.size; } };
  const ctx = vm.createContext({ G, localStorage, console: { warn() {}, log() {} }, Intl, Date, Math, JSON, Object, Promise, Number,
    setTimeout: (f, ms) => setTimeout(f, Math.min(ms, 5)), clearTimeout, firebase: { firestore: { FieldValue: { serverTimestamp: () => 0 } } } });
  vm.runInContext(src('js/net/ranking.js'), ctx);
  const R = G.Ranking, w = R.periodIds().w;
  const got = await R.submitChallenge({ t: 45, lv: 9, kills: 80, dex: 25, w });
  assert.deepEqual([...got], ['c']);
  const b = R.board('s', 'c');
  assert.equal(b, 's_c' + w);
  assert.equal(docs.get('lb/' + b + '/e/U1').t, 45, 'aunque dure menos de 2 minutos');
  assert.ok(docs.get('lbs/' + b).top.U1, 'en el top de la semana');
  assert.ok(![...docs.keys()].some(k => k.includes(R.board('s', 'w'))), 'nada en el ranking semanal normal');
  assert.ok(toasts.some(t => /desafío semanal/.test(t)));
  assert.deepEqual((await R.top('s', 'c', null, false)).map(r => r.id), ['U1']);
  assert.equal((await R.myRank('s', 'c')).pos, 1);
});
