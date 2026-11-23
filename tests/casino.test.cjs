// El Casino Rocket (js/systems/casino.js): a la larga gana la casa, cada apuesta se cobra y se
// guarda antes de enseñar nada, cada premio se paga una sola vez, y sólo sale en solitario.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

/** Un generador de números al azar con semilla (mulberry32). */
function seeded(a) {
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function load({ coins = 1000, online = false, onLine = true, coop = false } = {}) {
  const commits = [];
  const save = { coins, stats: {}, skins: {}, pskin: {}, unlocks: {} };
  const G = {
    DB: { save, online, commit() { commits.push(save.coins); return true; }, flush() {}, owns: () => true },
    Skins: { wear(s, dex, id) { s.pskin[dex] = [id, 1]; } },
    UI: { refreshCoins() {} },
    Coop: { active: coop },
    Game: { player: { dead: false }, choose: show => { show(() => {}); return true; } },
    CasinoUI: { show() {}, isOpen: false }
  };
  const ctx = vm.createContext({ G, Math, Date, navigator: { onLine }, window: {}, console });
  const f = 'js/systems/casino.js';
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
  return { C: G.Casino, G, save, commits };
}

test('tragaperras: devuelve menos de lo apostado (92,4 % exacto)', () => {
  const { C } = load();
  const rtp = C.slotRtp();
  assert.ok(rtp < 0.95 && rtp > 0.88, 'rtp ' + rtp);
  assert.equal(C.slotPay(['rocket', 'rocket', 'rocket']), 100);
  assert.equal(C.slotPay(['berry', 'ball', 'berry']), 2.5);
  assert.equal(C.slotPay(['rocket', 'pika', 'rocket']), 5);
  assert.equal(C.slotPay(['ball', 'pika', 'seven']), 0);
});

test('tragaperras: cobra y paga una vez, y lo guarda antes de enseñar nada', () => {
  const { C, save, commits } = load({ coins: 1000 });
  C.debugRig({ slots: ['pika', 'pika', 'pika'] });
  const r = C.spin(100);
  assert.equal(r.win, 2500);
  assert.equal(save.coins, 1000 - 100 + 2500);
  assert.deepEqual(commits, [900, 3400]);           // la apuesta, y luego el premio
  // sin monedas no se juega (ni se toca nada)
  save.coins = 5;
  assert.equal(C.spin(10).err, 'coins');
  assert.equal(save.coins, 5);
});

test('tragaperras: el premio gordo da la estela Team Rocket una sola vez', () => {
  const { C, save } = load({ coins: 100 });
  C.debugRig({ slots: ['rocket', 'rocket', 'rocket'] });
  const a = C.spin(10);
  assert.ok(a.jackpot && a.trail);
  assert.ok(save.unlocks.rocketTrail > 0);
  C.debugRig({ slots: ['rocket', 'rocket', 'rocket'] });
  const b = C.spin(10);
  assert.ok(b.jackpot && !b.trail);
});

test('tragaperras: a lo largo de muchas tiradas, la casa gana', () => {
  const { C, save } = load({ coins: 1e9 });
  C.rng = seeded(7);
  for (let i = 0; i < 20000; i++) C.spin(10);
  assert.ok(save.coins < 1e9, 'saldo ' + save.coins);
});

test('Voltorb escondido: el multiplicador nunca da más del 95 % de lo justo', () => {
  const { C } = load();
  const { N, M } = C.VF;
  let surv = 1;
  for (let k = 1; k <= N - M; k++) {
    surv *= (N - M - k + 1) / (N - k + 1);
    assert.ok(C.vfMult(k) * surv <= 0.95 + 1e-9, 'k=' + k);
  }
  assert.ok(C.vfMult(1) > 1);
});

test('Voltorb escondido: la primera carta cobra, plantarse paga una vez, un Voltorb no paga', () => {
  const { C, save } = load({ coins: 1000 });
  C.vfNew(100);
  C.debugRig({ voltorb: [0, 1, 2, 3, 4] });
  assert.equal(save.coins, 1000);                    // aún no ha cobrado
  assert.equal(C.vfFlip(10).kind, 'coin');
  assert.equal(save.coins, 900);
  assert.equal(C.vfFlip(10).kind, 'none');           // la misma carta no cuenta dos veces
  C.vfFlip(11);
  const w = C.vfCash();
  assert.equal(w, Math.floor(100 * C.vfMult(2)));
  assert.equal(save.coins, 900 + w);
  assert.equal(C.vfCash(), 0);                       // no se cobra dos veces
  C.vfNew(100);
  C.debugRig({ voltorb: [0, 1, 2, 3, 4] });
  C.vfFlip(20);
  assert.equal(C.vfFlip(3).kind, 'boom');
  assert.equal(C.vfCash(), 0);
  assert.equal(save.coins, 900 + w - 100);
});

test('Carrera Rocket: ningún corredor devuelve más del 90 %', () => {
  const { C } = load({ coins: 1e9 });
  C.rng = seeded(11);
  for (let i = 0; i < 300; i++) {
    const c = C.raceCard();
    c.p.forEach((p, k) => assert.ok(p * c.odds[k] <= 0.9 + 1e-9 || c.odds[k] === 1.1, 'carrera ' + i));
    assert.ok(Math.abs(c.p.reduce((a, b) => a + b, 0) - 1) < 1e-9);
    C.race(10, i % 5);                               // (la siguiente carrera, con otra forma)
  }
});

test('Carrera Rocket: paga lo que dice la cuota, una vez', () => {
  const { C, save } = load({ coins: 1000 });
  const odds = C.raceCard().odds[3];
  C.debugRig({ race: 3 });
  const r = C.race(100, 3);
  assert.equal(r.winner, 3);
  assert.equal(r.win, Math.floor(100 * odds));
  assert.equal(save.coins, 900 + r.win);
  assert.equal(r.order[0], 3);
  C.debugRig({ race: 0 });
  assert.equal(C.race(100, 3).win, 0);
});

test('¡Atrapa a Pikachu!: tres planes; la skin la primera vez y monedas después; perfecto aún pierde', () => {
  const { C, save } = load({ coins: 1000 });
  assert.ok(C.pkBest() * C.PIKA.PRIZE / C.PIKA.FEE < 1);
  C.pkStart();
  assert.equal(save.coins, 900);
  assert.equal(C.pkThrow(false).res, 'miss');
  for (let s = 0; s < 3; s++) { C.debugRig({ pika: true }); C.pkThrow(true); }
  assert.ok(C.pk.won);
  assert.ok(save.skins[C.SKIN] > 0);
  assert.equal(save.pskin[150][0], C.SKIN);
  assert.equal(save.coins, 900);
  C.pkStart();
  for (let s = 0; s < 3; s++) { C.debugRig({ pika: true }); C.pkThrow(true); }
  assert.equal(save.coins, 800 + C.PIKA.PRIZE);
  // Tres fallos seguidos: se acaba
  C.pkStart();
  C.pkThrow(false); C.pkThrow(false);
  assert.equal(C.pkThrow(false).res, 'lost');
  assert.equal(C.pkThrow(true).res, 'none');
});

test('con cuenta y sin conexión no se apuesta (pero no se pierde nada)', () => {
  const { C, save } = load({ coins: 1000, online: true, onLine: false });
  assert.equal(C.spin(10).err, 'net');
  assert.equal(C.race(10, 0).err, 'net');
  assert.equal(C.pkStart().err, 'net');
  C.vfNew(10);
  assert.equal(C.vfFlip(0).kind, 'err');
  assert.equal(save.coins, 1000);
});

test('sale una vez por partida, 1 de cada 3, y nunca en grupo', () => {
  let n = 0;
  const rng = seeded(3);
  for (let i = 0; i < 450; i++) {
    const { C } = load();
    C.rng = rng;
    const first = C.gate();
    if (first) n++;
    assert.equal(C.gate(), false);                   // ya decidido
  }
  assert.ok(n > 110 && n < 190, 'veces ' + n);
  const { C } = load({ coop: true });
  C.rng = () => 0;
  assert.equal(C.gate(), false);
});
