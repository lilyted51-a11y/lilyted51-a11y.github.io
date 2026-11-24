// Ranking con foto, marco y build de cada jugador (net/ranking.js, 24-11-2026) y horas jugadas del perfil
// (core/db.js, save.play): el texto corto de la build ida y vuelta, lo que se escribe en la marca y en el
// resumen, las reglas de antes (sin ph / b / bd) y cómo se juntan las horas de dos aparatos.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const src = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const plain = o => JSON.parse(JSON.stringify(o));

/** El ranking de verdad con una base de datos falsa; `extra: false` = las reglas de antes (sin ph / b / bd). */
function env({ extra = true } = {}) {
  const docs = new Map(), store = new Map();
  const clone = o => JSON.parse(JSON.stringify(o));
  const ruleOk = (p, d) => {
    if (!p.startsWith('lb')) return true;
    if (!extra && (p.startsWith('lbs/') ? Object.values(d.top || {}).concat(Object.values(d.dtop || {})).some(r => 'ph' in r)
                                         : ['ph', 'b', 'bd'].some(k => k in d))) return false;
    if (!p.startsWith('lb/')) return true;
    const old = docs.get(p);
    return (!('ph' in d) || (typeof d.ph === 'string' && d.ph.length <= 400)) && (!('b' in d) || (typeof d.b === 'string' && d.b.length <= 4000))
      && (!old || (d.t >= old.t && (d.dmg || 0) >= (old.dmg || 0) && (d.t > old.t || (d.dmg || 0) > (old.dmg || 0))));
  };
  const ref = p => ({
    p,
    async get() { return { exists: docs.has(p), id: p.split('/').pop(), data: () => clone(docs.get(p)) }; },
    async set(d, o) { const v = o && o.merge ? Object.assign({}, docs.get(p), d) : d; if (!ruleOk(p, v)) throw { code: 'permission-denied' }; docs.set(p, clone(v)); },
    collection: c => ({ doc: id => ref(p + '/' + c + '/' + id) })
  });
  const fsx = {
    collection: c => ({ doc: id => ref(c + '/' + id) }),
    async runTransaction(fn) {
      const writes = [];
      await fn({ get: r => r.get(), set: (r, d) => writes.push([r.p, d]) });
      for (const [p, d] of writes) if (!ruleOk(p, d)) throw { code: 'permission-denied' };
      for (const [p, d] of writes) docs.set(p, clone(d));
    }
  };
  const G = {
    U: { int: (v, max = 1e12) => (Number.isFinite(+v) && +v > 0 ? Math.min(max, Math.floor(+v)) : 0),
         str: (v, max = 64) => (typeof v === 'string' ? v.slice(0, max) : ''), list: (v, max = 50) => (Array.isArray(v) ? v.slice(0, max) : []) },
    DB: { online: true, fb: { fs: fsx, uid: 'U1', auth: { currentUser: { uid: 'U1', getIdToken: async () => 'tok' } } } },
    Social: { me: { name: 'Ash' }, friends: [], ensureFriends: async () => {} },
    UI: { toast() {} },
    DEX_BY: { 25: { dex: 25 }, 26: { dex: 26 }, 6: { dex: 6 } },
    // (core/photo.js de mentira: lo justo para leer una foto)
    Photo: { EX: ['Normal', 'Happy', 'Angry'], fromPub: d => (d.photo[0] > 0 && d.photo[0] < 2000 ? { d: d.photo[0], e: ['Normal', 'Happy', 'Angry'][d.photo[1]] || 'Normal', f: d.frame } : null) }
  };
  const localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k), key: i => [...store.keys()][i], get length() { return store.size; } };
  const ctx = { G, localStorage, console: { warn() {}, log: console.log }, Intl, Date, Math, JSON, Object, Promise, Number, isFinite, parseInt,
    fetch: async () => ({ ok: false, status: 500 }), AbortController, setTimeout: (f, ms) => setTimeout(f, Math.min(ms, 5)), clearTimeout,
    firebase: { firestore: { FieldValue: { serverTimestamp: () => 0 } } } };
  vm.createContext(ctx);
  vm.runInContext(src('js/net/ranking.js'), ctx);
  return { R: G.Ranking, G, docs, store };
}

const SUM = { dex: 26, sh: true, lv: 47, t: 1300, it: 'band', its: ['band', 'leftovers'], sk: 'hat', ph: '25.1.basic',
              mv: [['thunder-shock', 8, 1234567, 10, 1], ['quick-attack', 5, 987, 0, 0], ['swords-dance', 3, 0, 0, 0]] };

test('build en texto corto: ida y vuelta, daño a 3 cifras, y lo que no tiene forma de ser del juego no sale', () => {
  const { R } = env();
  assert.equal(R.short3(999), '999');
  assert.equal(R.short3(1234567), '123e4');
  assert.equal(Number(R.short3(987654321)), 988000000);
  const s = R.encBuild(SUM);
  assert.equal(s, '26.1.47.hat;thunder-shock:8:123e4:e,quick-attack:5:987,swords-dance:3:0;band,leftovers');
  assert.deepEqual(plain(R.decBuild(s)), { dex: 26, sh: true, lv: 47, sk: 'hat', its: ['band', 'leftovers'],
    mv: [{ id: 'thunder-shock', lvl: 8, dmg: 1230000, evo: true }, { id: 'quick-attack', lvl: 5, dmg: 987, evo: false }, { id: 'swords-dance', lvl: 3, dmg: 0, evo: false }] });
  // Basura de otro jugador: nada de HTML, ni números raros, ni más de 8 ataques / 4 objetos.
  assert.equal(R.decBuild('<img src=x onerror=alert(1)>;a:1:2;b'), null);
  const bad = R.decBuild('25.1.99999.<b>;' + Array.from({ length: 12 }, (_, i) => 'm' + i + ':999:1e400').join(',') + ',<x>:1:1;a,b,c,d,e,"f"');
  assert.equal(bad.lv, 9999); assert.equal(bad.sk, ''); assert.equal(bad.mv.length, 8);
  assert.ok(bad.mv.every(m => m.lvl === 99 && m.dmg === 0)); assert.deepEqual(plain(bad.its), ['a', 'b', 'c', 'd']);
  assert.equal(R.decBuild('x'.repeat(5000)), null);
  // Un equipo: en el orden de uids, el que no tiene resumen queda vacío.
  const team = R.encTeam([SUM, null, Object.assign({}, SUM, { dex: 6, sh: false, sk: '' })]);
  const back = R.decTeam(team);
  assert.equal(back.length, 3); assert.equal(back[0].dex, 26); assert.equal(back[1], null); assert.equal(back[2].dex, 6);
  assert.equal(R.encTeam([null, null]), '');
  // Foto y marco: "dex.expresión.marco".
  assert.equal(R.encPh({ d: 25, e: 'Happy', f: 'm:25' }), '25.1.m:25');
  assert.deepEqual(plain(R.decPh('25.1.m:25')), { d: 25, e: 'Happy', f: 'm:25' });
  assert.equal(R.decPh('25.1.<script>'), null);
  assert.deepEqual(plain(R.phs({ ph: '25.1.basic - 6.0.wood' })), [{ d: 25, e: 'Happy', f: 'basic' }, null, { d: 6, e: 'Normal', f: 'wood' }]);
});

test('la marca lleva la foto (también la fila del resumen) y la build; tocarla la lee de la marca', async () => {
  const { R, docs } = env();
  await R.submitSolo({ t: 1900, lv: 47, kills: 900, dex: 26, shiny: true, dmg: 4000000, sum: SUM });
  const b = R.board('s', 'a');
  const e = docs.get('lb/' + b + '/e/U1');
  assert.equal(e.ph, '25.1.basic');
  assert.equal(e.b, R.encBuild(SUM));
  assert.equal(e.bd, e.b, 'con daño a Arceus, la build de esa partida también va en bd');
  const s = docs.get('lbs/' + b);
  assert.equal(s.top.U1.ph, '25.1.basic'); assert.equal(s.dtop.U1.ph, '25.1.basic');
  assert.equal(s.top.U1.b, undefined, 'la build no va en el resumen (sólo en la marca)');
  const row = (await R.top('s', 'a'))[0];
  assert.equal(row.ph, '25.1.basic');
  const got = await R.buildOf(b, row, false);
  assert.equal(got.length, 1); assert.equal(got[0].dex, 26); assert.equal(got[0].mv[0].id, 'thunder-shock');
  // Una marca de antes, sin build: lista vacía (la ventana dice que no hay datos).
  docs.set('lb/' + b + '/e/OLD', { t: 100, uids: ['OLD'], names: ['Misty'], dex: [25], shiny: [false], lv: 5, kills: 10 });
  assert.deepEqual(plain(await R.buildOf(b, { id: 'OLD', t: 100 }, false)), []);
});

test('si sólo mejora el daño, se quedan el tiempo y la build del tiempo de antes; la de daño es la nueva', async () => {
  const { R, docs } = env();
  const b = R.board('s', 'a');
  docs.set('lb/' + b + '/e/U1', { t: 2400, lv: 300, kills: 5000, dmg: 1000, uids: ['U1'], names: ['Ash'], dex: [25], shiny: [false], ph: '25.0.basic', b: 'OLD-B', bd: 'OLD-BD' });
  await R.submitSolo({ t: 1900, lv: 47, kills: 900, dex: 26, shiny: true, dmg: 4000000, sum: SUM });
  const e = docs.get('lb/' + b + '/e/U1');
  assert.deepEqual([e.t, e.lv, e.kills, e.dmg], [2400, 300, 5000, 4000000]);
  assert.equal(e.b, 'OLD-B');
  assert.equal(e.bd, R.encBuild(SUM));
});

test('en grupo: el Pokémon con el que acaba cada uno, su foto y su build, en el orden de los uids', async () => {
  const { R, docs } = env();
  await R.submitGroup({ t: 700, lv: 30, kills: 500, dmg: 0, members: [
    { uid: 'U2', name: 'Misty', dex: 25, shiny: false, sum: Object.assign({}, SUM, { dex: 6, sh: false, ph: '6.2.wood' }) },
    { uid: 'U1', name: 'Ash', dex: 25, shiny: false, sum: SUM }] });
  const b = R.board('g', 'a'), e = docs.get('lb/' + b + '/e/U1_U2');
  assert.deepEqual(plain(e.dex), [26, 6], 'el evolucionado, no el del principio');
  assert.deepEqual(plain(e.shiny), [true, false]);
  assert.equal(e.ph, '25.1.basic 6.2.wood');
  assert.deepEqual(plain(R.decTeam(e.b).map(x => x.dex)), [26, 6]);
  assert.equal(e.bd, undefined, 'sin daño a Arceus no hay build de daño');
});

test('con las reglas de antes en el servidor, la marca entra igual (sin foto ni build) y se recuerda', async () => {
  const { R, G, docs, store } = env({ extra: false });
  const said = [];
  G.UI.toast = m => said.push(m);
  await R.submitSolo({ t: 1900, lv: 47, kills: 900, dex: 26, shiny: true, dmg: 0, sum: SUM });
  const b = R.board('s', 'a'), e = docs.get('lb/' + b + '/e/U1');
  assert.ok(e && e.t === 1900, 'la marca ha entrado');
  assert.equal(e.ph, undefined); assert.equal(e.b, undefined);
  assert.ok(store.get('ps.rk.lite'), 'se recuerda que el servidor aún no las admite');
  assert.ok(!said.some(m => /no ha podido|Sin conexión/.test(m)), 'sin avisos de fallo: ' + said.join(' / '));
});

/** core/db.js de verdad en un aparato (su localStorage: su propio nombre de aparato). */
function device() {
  const store = new Map();
  const localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k), key: i => [...store.keys()][i], get length() { return store.size; } };
  const G = {};
  vm.runInContext(src('js/core/db.js'), vm.createContext({ G, localStorage, console: { warn() {}, log() {} }, setTimeout, clearTimeout, TextEncoder,
    location: { protocol: 'https:', hostname: 'localhost' }, navigator: { onLine: true }, document: { addEventListener() {}, hidden: false }, window: { addEventListener() {} } }));
  G.DB.playAsGuest();
  return G.DB;
}

test('horas jugadas: dos aparatos jugando a la vez no se pisan, nada se cuenta dos veces y juntar es idempotente', () => {
  const a = device(), b = device();
  a.addPlay(600); b.addPlay(1200);
  // Los dos parten de lo mismo (la nube con 600 s de A), y cada uno sigue jugando a la vez.
  const cloud = a.merge(plain(a.save), plain(b.save));
  assert.equal(a.playSecs(cloud), 1800);
  a.addPlay(300.9);              // (los segundos sueltos no se redondean hacia arriba)
  b.addPlay(60);
  const m1 = a.merge(plain(a.save), plain(cloud)), m2 = a.merge(plain(b.save), m1);
  assert.equal(a.playSecs(m2), 600 + 300 + 1200 + 60);
  assert.equal(a.playSecs(a.merge(m2, plain(m2))), a.playSecs(m2), 'juntar dos veces da lo mismo');
  assert.equal(a.playSecs(a.merge(plain(a.save), m2)), a.playSecs(m2), 'una versión vieja de un aparato no resta ni suma');
  // Lo que no tiene forma (claves raras, números negativos o de texto) no cuenta.
  assert.deepEqual(plain(a.mergePlay({ x: 5, '<b>': 99, y: -4, z: 'NaN' }, { x: 3 })), { x: 5, y: 0, z: 0 });
});
