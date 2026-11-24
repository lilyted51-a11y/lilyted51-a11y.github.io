// Gritos de los Pokémon (js/core/cries.js, 25-11-2026): qué fichero suena para cada número, que los ficheros están,
// quién grita en el gacha, que los enemigos gritan una vez y sin amontonarse, y que con el ajuste quitado no suena nada.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const src = f => fs.readFileSync(path.join(root, f), 'utf8');

function load() {
  let now = 0;
  const played = [];
  class Audio {
    constructor() { this.paused = true; this.ended = false; this.dataset = {}; this.src = ''; this.volume = 1; this.currentTime = 0; }
    addEventListener() {}
    removeAttribute() {}
    play() { this.paused = false; played.push(this.src); return Promise.resolve(); }
  }
  const settings = { cries: true };
  const G = { Settings: { get: k => settings[k] }, Audio: { settings: { sfx: 0.7, muted: false } } };
  const ctx = vm.createContext({ G, console, Audio, document: { hidden: false }, performance: { now: () => now } });
  for (const f of ['js/data/pokedex.js', 'js/data/forms.js', 'js/core/cries.js']) vm.runInContext(src(f), ctx, { filename: f });
  return { G, C: G.Cries, played, settings, tick: ms => { now += ms; } };
}

test('las 1025 especies y las formas con grito propio tienen su fichero; las demás formas, el de su especie', () => {
  const { G, C } = load();
  for (let d = 1; d <= 1025; d++) assert.ok(fs.existsSync(path.join(root, 'assets/cries', d + '.mp3')), 'falta ' + d);
  for (const d of C.OWN) assert.ok(fs.existsSync(path.join(root, 'assets/cries', d + '.mp3')), 'falta ' + d);
  assert.equal(C.fileOf(25), 25);
  assert.equal(C.fileOf(100003), 100003);                 // Mega Venusaur: el suyo
  assert.equal(C.fileOf(1026), 26);                       // Raichu de Alola: el de Raichu
  assert.equal(C.fileOf(150006), 6);                      // Charizard Gigamax: el de Charizard
  assert.equal(C.fileOf(500020), G.formBase(500020));     // (números oficiales, por G.formBase)
  for (const d of Object.keys(G.FORMS).map(Number)) {
    const f = C.fileOf(d);
    assert.ok(fs.existsSync(path.join(root, 'assets/cries', f + '.mp3')), d + ' → ' + f);
  }
});

test('gacha: grita uno, el shiny antes que el nuevo y el de más estrellas', () => {
  const { C } = load();
  assert.equal(C.best([{ dex: 1, isNew: false, shiny: false, rarity: 5 }]), null);   // (repetidos: nada)
  assert.equal(C.best([{ dex: 1, isNew: true, shiny: false, rarity: 2 }, { dex: 2, isNew: true, shiny: false, rarity: 4 }]).dex, 2);
  assert.equal(C.best([{ dex: 3, isNew: true, shiny: false, rarity: 5 }, { dex: 4, isNew: false, shiny: true, rarity: 1 }]).dex, 4);
});

test('enemigos: sólo jefes, legendarios y shinies, una vez cada uno, sin amontonarse; los núcleos y ladrones no', () => {
  const { C, played, tick } = load();
  C.runStart(null);
  C.enemy({ id: 1, dex: 19 });                                       // uno normal: nada
  C.enemy({ id: 2, dex: 890, boss: true, etCore: true });            // núcleo de Eternatus: nada
  C.enemy({ id: 3, dex: 52, shiny: true, behavior: 'thief' });       // ladrón: nada
  assert.equal(played.length, 0);
  tick(5000);
  C.enemy({ id: 4, dex: 150, boss: true });
  assert.deepEqual(played, ['assets/cries/150.mp3']);
  C.enemy({ id: 5, dex: 25, shiny: true });                          // justo después: se lo salta
  assert.equal(played.length, 1);
  tick(2000);
  C.enemy({ id: 4, dex: 150, boss: true });                          // el mismo que vuelve a llegar: nada
  assert.equal(played.length, 1);
});

test('como mucho dos a la vez; con el ajuste quitado o sin volumen, nada', () => {
  const { G, C, played, settings } = load();
  assert.ok(C.play(1)); assert.ok(C.play(4));
  assert.equal(C.play(7), false);                                    // (los dos de antes siguen sonando)
  assert.equal(played.length, 2);
  const L = load();
  L.settings.cries = false;
  assert.equal(L.C.play(25), false);
  L.C.runStart({ dex: 25 });
  assert.equal(L.played.length, 0);
  const M = load();
  M.G.Audio.settings.muted = true;
  assert.equal(M.C.play(25), false);
  void G; void settings;
});
