// Formas que cambian tipos y stats (25-11-2026, js/systems/statforms.js): qué formas se ofrecen, cómo cambian
// los stats (en proporción, como la Mega), la habilidad (y deshacer la de antes), la evolución y la tabla del ranking.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const src = f => fs.readFileSync(path.join(root, f), 'utf8');

const G = {};
const ctx = vm.createContext({ G, console });
for (const f of ['js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/data/forms.js', 'js/data/abilities.js', 'js/data/evolutions.js'])
  vm.runInContext(src(f), ctx, { filename: f });
G.DEX_BY = {}; for (const p of G.DEX) G.DEX_BY[p.dex] = p;
// Lo justo del resto del juego
G.Sprites = { Animator: function (dex) { this.dex = dex; this.dir = 0; }, hasShiny: () => true, playerScale: () => 1, playerRadius: () => 10, bodyHeight: () => 30, preload() {} };
G.Mons = { abilityOf: () => ({ id: 'pressure', slot: 0 }), abilityName: id => id };
const FX = {
  'super-luck': { start: pl => { pl.critChance += 0.1; } },
  'frisk': { start: pl => { pl.magnet *= 1.2; } },
  'truant': { cdMul: 1.6 },
  'serene-grace': { serene: true },
  'natural-cure': { start: pl => { pl.regenFlat += pl.maxHp * 0.003; } },
  'pressure': {}, 'levitate': {}
};
G.AbilityFX = { of: id => FX[id] || {} };
vm.runInContext(src('js/systems/statforms.js'), ctx, { filename: 'statforms.js' });
const SF = G.StatForms;
const plain = x => JSON.parse(JSON.stringify(x));

const proto = { setAbility(id) { this.abilId = id; this.abil = G.AbilityFX.of(id); if (this.abil.cdMul) this.cdMul *= this.abil.cdMul; if (this.abil.start) this.abil.start(this); } };
function player(dex, abil) {
  const mon = Object.assign({}, G.DEX_BY[dex], { nature: 'hardy' });
  const p = Object.assign(Object.create(proto), { dex, mon, maxHp: mon.hp + 50, hp: mon.hp + 50, baseAtk: mon.atk * 1.3, baseSpd: mon.spd, shiny: false,
    anim: new G.Sprites.Animator(dex), critChance: 0, magnet: 78, regenFlat: 0, cdMul: 1, lookDex: 0 });
  p.setAbility(abil || 'pressure');
  return p;
}

test('las formas de cada especie: la normal primero; sin formas, ninguna', () => {
  assert.deepEqual(plain(SF.formsOf(386)), [386, 1386, 2386, 3386]);
  assert.deepEqual(plain(SF.formsOf(479)), [479, 1479, 2479, 3479, 4479, 5479]);
  assert.equal(SF.formsOf(493).length, 18);           // Arceus: los 18 tipos
  assert.equal(SF.formsOf(773).length, 18);           // Silvally
  assert.deepEqual(plain(SF.formsOf(25)), []);
  assert.deepEqual(plain(SF.formsOf(6)), []);          // (las Mega no son de éstas)
  for (const s of [413, 745, 849, 892, 1017, 720, 718]) assert.ok(SF.formsOf(s).length >= 2, 'sin formas: ' + s);
});

test('al cambiar de forma: tipos, stats en proporción (naturaleza y Mejoras se quedan), dibujo y escalera', () => {
  const p = player(386);
  p.mon.pa *= 1.1;                                     // (su naturaleza)
  p.ladder = [{ hp: 80, spd: 100, pa: 1, sa: 1, df: 30, sd: 30, atk: 1 }, { hp: 92, spd: 141, pa: 1.52, sa: 1.52, df: 50, sd: 50, atk: 1.52 }];
  const pa0 = p.mon.pa, df0 = p.mon.df, atk0 = p.baseAtk, hp0 = p.maxHp;
  assert.equal(SF.apply(p, 1386), true);
  const A = G.DEX_BY[1386], D = G.DEX_BY[386];
  assert.equal(p.dex, 1386); assert.equal(p.anim.dex, 1386);
  assert.deepEqual(plain(p.mon.types), plain(A.types));
  assert.ok(Math.abs(p.mon.pa - pa0 * A.pa / D.pa) < 1e-9);
  assert.ok(Math.abs(p.mon.df - df0 * A.df / D.df) < 1e-9);
  assert.ok(Math.abs(p.baseAtk - atk0 * A.atk / D.atk) < 1e-9);
  assert.equal(p.maxHp, hp0);                          // (Deoxys: misma vida en todas)
  assert.equal(p.mon.nature, 'hardy');
  assert.ok(Math.abs(p.ladder[1].df - 50 * A.df / D.df) < 1e-9, 'la escalera también');
  assert.ok(Math.abs(p.ladder[1].atk - Math.max(p.ladder[1].pa, p.ladder[1].sa)) < 1e-9);
  // y de vuelta a la normal: lo de antes
  SF.apply(p, 386);
  assert.ok(Math.abs(p.mon.pa - pa0) < 1e-9 && Math.abs(p.mon.df - df0) < 1e-9 && Math.abs(p.baseAtk - atk0) < 1e-9);
});

test('la vida cambia en proporción y se queda el % que llevabas', () => {
  const p = player(745);                               // Lycanroc → Midnight (más vida)
  p.hp = p.maxHp / 2;
  const before = p.maxHp, d = Math.round(p.mon.hp * G.DEX_BY[1745].hp / G.DEX_BY[745].hp) - p.mon.hp;
  SF.apply(p, 1745);
  assert.equal(p.maxHp, before + d);
  assert.ok(Math.abs(p.hp / p.maxHp - 0.5) < 1e-9);
});

test('habilidad propia de la forma; la de antes se deshace (suma o multiplica) y la recarga también', () => {
  // Shaymin: Cura Natural (+regeneración al empezar) → Shaymin Cielo, Dicha
  const s = player(492, 'natural-cure');
  assert.ok(s.regenFlat > 0);
  SF.apply(s, 1492);
  assert.equal(s.abilId, 'serene-grace');
  assert.ok(Math.abs(s.regenFlat) < 1e-9, 'regeneración de Cura Natural deshecha: ' + s.regenFlat);
  // Una que suma y otra que multiplica
  const p = player(745, 'super-luck');
  p.magnet = 100; p.critChance = 0.15;                  // (+0,05 de una carta; la habilidad puso 0,1)
  SF.apply(p, 2745);                                    // Lycanroc Crepúsculo: Garra Dura
  assert.equal(p.abilId, 'tough-claws');
  assert.ok(Math.abs(p.critChance - 0.05) < 1e-9, 'crítico: ' + p.critChance);
  const q = player(745, 'frisk');
  assert.ok(Math.abs(q.magnet - 78 * 1.2) < 1e-9);
  SF.apply(q, 2745);
  assert.ok(Math.abs(q.magnet - 78) < 1e-9, 'imán: ' + q.magnet);
  const r = player(745, 'truant');
  assert.equal(r.cdMul, 1.6);
  SF.apply(r, 2745);
  assert.ok(Math.abs(r.cdMul - 1) < 1e-9);
  // Midnight trae Vista Lince, que ya es de Lycanroc: se queda con la suya
  const m = player(745, 'super-luck');
  SF.apply(m, 1745);
  assert.equal(m.abilId, 'super-luck');
  // Rotom: Levitación en todas, no cambia
  const t = player(479, 'levitate');
  SF.apply(t, 2479);
  assert.equal(t.abilId, 'levitate');
});

test('al evolucionar: si la nueva especie tiene la misma forma, se queda con ella', () => {
  const p = player(710);
  SF.apply(p, 3710); p.sfFor = 710;                     // Pumpkaboo Súper
  // (lo que hace Player.evolveTo con la especie nueva)
  const from = p.dex;
  p.dex = 711; p.mon = Object.assign({}, G.DEX_BY[711]); p.anim = new G.Sprites.Animator(711);
  SF.evolved(p, from);
  assert.equal(p.dex, 1711);                            // Gourgeist Súper
  assert.equal(p.sfFor, 711);
  // Pumpkaboo Pequeño: Gourgeist no tiene esa forma → el normal
  const q = player(710);
  SF.apply(q, 1710); q.sfFor = 710;
  const f2 = q.dex;
  q.dex = 711; q.mon = Object.assign({}, G.DEX_BY[711]);
  SF.evolved(q, f2);
  assert.equal(q.dex, 711);
  assert.equal(q.sfFor, 711);
  // Sin haber elegido (Rockruff → Lycanroc): nada; la carta sale después
  const r = player(744);
  r.dex = 745; r.mon = Object.assign({}, G.DEX_BY[745]);
  SF.evolved(r, 744);
  assert.equal(r.dex, 745); assert.ok(!r.sfFor);
});

test('tabla del ranking por Pokémon: estas formas cuentan como su especie; las regionales y las demás, no', () => {
  assert.equal(SF.boardDex(1386), 386);
  assert.equal(SF.boardDex(560493), 493);
  assert.equal(SF.boardDex(2017), 1017);
  assert.equal(SF.boardDex(1026), 1026);               // Raichu de Alola: Pokémon aparte
  assert.equal(SF.boardDex(6), 6);
});
