// Los poderes con las formas de data/forms.js (js/systems/powers.js, 25-11-2026): qué Pokémon tienen Mega, fusión o
// forma de poder y cuáles Gigamax, la onda G-Max de cada uno y el Gigamax / la Mega que ven los compañeros (pw).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const src = f => fs.readFileSync(path.join(root, f), 'utf8');

const G = { U: { TYPE_NAME: {}, TYPE_COLOR: {} }, I18n: { add() {} } };
const ctx = vm.createContext({ G, console, performance: { now: () => 0 } });
for (const f of ['js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/data/forms.js', 'js/data/abilities.js', 'js/data/ability-fx.js', 'js/systems/powers.js'])
  vm.runInContext(src(f), ctx, { filename: f });
const P = G.Powers;
const forms = d => [...P.megaForms(d).map(f => f.dex)];   // (copia: los arrays vienen de otro contexto de vm)

test('85 especies con Mega y 32 con Gigamax, todas con sprites', () => {
  let mega = 0, gmax = 0;
  for (let d = 1; d <= 1025; d++) {
    if (P.megaForms(d).some(f => G.FORMS[f.dex].k === 'mega')) mega++;
    if (P.gmaxForm(d)) gmax++;
  }
  assert.equal(mega, 85);
  assert.equal(gmax, 32);
});

test('los que tienen dos eligen (X antes que Y) y las formas de poder van en la misma carta', () => {
  assert.deepEqual(forms(6), [2006, 300006]);
  assert.deepEqual(forms(150), [100150, 1150]);
  assert.deepEqual(forms(26), [300026, 400026]);
  assert.deepEqual(forms(448), [1448, 300448]);
  assert.deepEqual(forms(658), [100658, 300658]);         // Greninja: Mega o Ash
  assert.deepEqual(forms(718), [3718, 2718]);             // Zygarde: Mega o Completo
  assert.equal(forms(800).length, 3);                     // Necrozma
  assert.deepEqual(forms(382), [1382]);                   // Kyogre primigenio
});

test('fusión desde su mitad; regionales, formas de stats y Eternamax fuera', () => {
  assert.deepEqual(forms(791), [510800]);
  assert.deepEqual(forms(792), [500800]);
  assert.deepEqual(forms(643), [1646]);
  assert.deepEqual(forms(644), [2646]);
  assert.deepEqual(forms(896), [500898]);
  assert.deepEqual(forms(897), [510898]);
  assert.deepEqual(forms(1026), []);                      // Raichu de Alola: Pokémon aparte
  assert.deepEqual(forms(487), []);                       // Giratina Origen: forma de stats, ya no es poder
  assert.deepEqual(forms(720), []);                       // Hoopa Desatado
  assert.deepEqual(forms(890), []);                       // Eternatus Eternamax
  assert.deepEqual(forms(1052), []);
  assert.equal(P.gmaxForm(1052), 0);                      // Meowth de Alola: sin Gigamax
});

test('Gigamax: Urshifu según su estilo y cada onda con su efecto', () => {
  assert.equal(P.gmaxForm(892), 150892);
  assert.equal(P.gmaxForm(1892), 160892);
  assert.equal(P.gmaxOf(160892).type, 'water');
  const fx = new Set(['heal', 'burn', 'dot', 'stun', 'chain', 'coin', 'shield', 'slow', 'veil', 'pull', 'poison']);
  for (let d = 1; d <= 1025; d++) {
    const g = P.gmaxForm(d);
    if (!g) continue;
    const w = P.gmaxOf(g);
    assert.ok(w && w.name && w.type && fx.has(w.fx), d + ': ' + JSON.stringify(w));
  }
});

test('lo que ven los demás: 1 Dinamax, 3 Gigamax, 4 Mega', () => {
  const pl = { powerOn: true, powerId: 'dyna', gmax: 0 };
  assert.equal(P.netCode(pl), 1);
  pl.gmax = 150006;
  assert.equal(P.netCode(pl), 3);
  assert.equal(P.netCode({ powerOn: true, powerId: 'mega' }), 4);
  assert.equal(P.netCode({ powerOn: false, powerId: 'mega' }), 0);
});

test('las habilidades de las Mega que faltaban tienen efecto', () => {
  for (const id of ['pixilate', 'aerilate', 'refrigerate', 'primordial-sea', 'desolate-land', 'parental-bond', 'turboblaze', 'teravolt', 'neuroforce'])
    assert.ok(G.AbilityFX.FX[id], id);
  assert.equal(G.AbilityFX.FX['primordial-sea'].summon, 'rain');
  assert.equal(G.AbilityFX.FX['desolate-land'].summon, 'sun');
});
