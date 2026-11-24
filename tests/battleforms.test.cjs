// Formas de combate (25-11-2026, systems/battleforms.js): cuándo cambia cada uno, los stats en proporción,
// la vuelta exacta a la forma base, Disfraz / Cara de Hielo, los poderes y lo que va por la red.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

function load() {
  const said = [];
  const G = {
    Sprites: { PX: 2, hasShiny: () => true, playerScale: () => 1, playerRadius: () => 10, bodyHeight: () => 30, preload() {},
      Animator: class { constructor(dex, scale, shiny) { this.dex = dex; this.scale = scale; this.shiny = shiny; this.dir = 0; } } },
    U: { TYPE_COLOR: {} }, FX: { ring() {}, burst() {}, dmgText(x, y, t) { said.push(t); } }, Camera: { kick() {} },
    Audio: { sfx() {} }, Spawner: { say(t) { said.push(t); } }, I18n: { f: (s, ...v) => { let i = 0; return s.replace(/\{x\}/g, () => v[i++]); } },
    T: s => s, Mons: { abilityName: id => id }, Types: { mult: () => 1 },
    Weather: { current: null }, Rift: { inArena: false }, EnemyMgr: { near: false, queryCircle() { return this.near ? [{ dead: false }] : []; } },
    DB: { save: { created: 123 } }
  };
  const ctx = vm.createContext({ G, Math, JSON, console });
  for (const f of ['js/data/pokedex.js', 'js/data/forms.js', 'js/systems/battleforms.js']) vm.runInContext(read(f), ctx, { filename: f });
  G.SPRITE_META = new Proxy({}, { get: () => ({}) });
  return { G, said };
}
/** Un jugador de mentira con lo que usa el módulo. */
function player(G, dex, extra = {}) {
  const r = G.DEX_BY[dex];
  const mon = Object.assign({}, r, { pa: r.pa * 1.3, sa: r.sa * 1.3, atk: r.atk * 1.3, df: r.df * 1.2, sd: r.sd * 1.2, spd: r.spd * 1.1, nature: 'x' });
  return Object.assign({ mon, dex, shiny: false, scale: 1, r: 10, bodyH: 30, x: 0, y: 0, hp: 100, maxHp: 100, level: 1,
    baseAtk: mon.atk * 1.5, baseSpd: mon.spd, anim: { dex, dir: 3, skin: 'x' }, atk: 1, abilId: '',
    activeGroup() { return this.moves || []; } }, extra);
}
const tick = (G, pl, n = 1, dt = 1) => { for (let i = 0; i < n; i++) G.BattleForms.update(dt, pl); };

test('Castform sigue al clima: tipos de la forma y stats en proporción; sin clima vuelve tal cual', () => {
  const { G } = load(), pl = player(G, 351), mon0 = pl.mon, atk0 = pl.baseAtk, anim0 = pl.anim;
  tick(G, pl);
  assert.equal(pl.dex, 351);
  G.Weather.current = { kind: 'rain' }; tick(G, pl);
  assert.equal(pl.dex, 2351);
  assert.deepEqual([...pl.mon.types], ['water']);
  assert.equal(pl.mon.nature, 'x');                 // lo suyo se queda
  assert.equal(pl.anim.dir, 3);                     // misma dirección
  G.Weather.current = { kind: 'sun' }; tick(G, pl);
  assert.equal(pl.dex, 1351);
  assert.deepEqual([...pl.mon.types], ['fire']);
  G.Weather.current = null; tick(G, pl);
  assert.equal(pl.dex, 351);
  assert.equal(pl.mon, mon0); assert.equal(pl.baseAtk, atk0); assert.equal(pl.anim, anim0);
});

test('Aegislash: Filo peleando (más ataque, menos defensa, en proporción) y Escudo tras 2 s sin enemigos', () => {
  const { G } = load(), pl = player(G, 681), df0 = pl.mon.df, atk0 = pl.baseAtk;
  G.EnemyMgr.near = true; tick(G, pl);
  assert.equal(pl.dex, 1681);
  const k = G.DEX_BY[1681].atk / G.DEX_BY[681].atk;
  assert.ok(Math.abs(pl.baseAtk - atk0 * k) < 1e-9);
  assert.ok(Math.abs(pl.mon.df - df0 * 50 / 140) < 1e-9);
  G.EnemyMgr.near = false; tick(G, pl, 1, 1);
  assert.equal(pl.dex, 1681);                       // aún no: 2 s
  tick(G, pl, 2, 1);
  assert.equal(pl.dex, 681);
  assert.equal(pl.baseAtk, atk0);
});

test('Darmanitan: Modo Daruma con menos de la mitad de vida SÓLO con la habilidad Modo Daruma (y el de Galar)', () => {
  const { G } = load();
  const a = player(G, 555, { hp: 40 }); tick(G, a);
  assert.equal(a.dex, 555);
  const b = player(G, 555, { hp: 40, abilId: 'zen-mode' }); tick(G, b);
  assert.equal(b.dex, 1555);
  b.hp = 52; tick(G, b); assert.equal(b.dex, 1555);   // margen: vuelve con el 55 %
  b.hp = 60; tick(G, b); assert.equal(b.dex, 555);
  const c = player(G, 2555, { hp: 30, abilId: 'zen-mode' }); tick(G, c);
  assert.equal(c.dex, 510555);
});

test('Mimikyu: el disfraz para el primer golpe y queda Descubierto toda la partida', () => {
  const { G, said } = load(), pl = player(G, 778); tick(G, pl);
  assert.equal(G.BattleForms.block(pl, 'fire', 'physical', false), true);
  assert.ok(said.includes('disguise'));
  tick(G, pl);
  assert.equal(pl.dex, 1778);
  assert.equal(G.BattleForms.block(pl, 'fire', 'physical', false), false);
  pl.hp = 100; tick(G, pl, 5);
  assert.equal(pl.dex, 1778);
  // Contra Arceus (puro) el disfraz no vale.
  const q = player(G, 778); tick(G, q);
  assert.equal(G.BattleForms.block(q, null, null, true), false);
});

test('Eiscue: la cara de hielo sólo para golpes físicos; la nieve se la devuelve', () => {
  const { G } = load(), pl = player(G, 875); tick(G, pl);
  assert.equal(G.BattleForms.block(pl, 'fire', 'special', false), false);
  assert.equal(G.BattleForms.block(pl, 'fire', 'physical', false), true);
  tick(G, pl);
  assert.equal(pl.dex, 1875);
  assert.ok(pl.mon.spd > G.DEX_BY[875].spd * 1.1 * 1.2);     // Cara Deshielo: más rápido (FIX)
  G.Weather.current = { kind: 'snow' }; tick(G, pl, 3, 1);
  assert.equal(pl.dex, 875);
});

test('Wishiwashi: banco desde el nivel 20 con vida; Minior: núcleo fijo por cuenta bajo la mitad', () => {
  const { G } = load(), w = player(G, 746, { level: 19 }); tick(G, w);
  assert.equal(w.dex, 746);
  w.level = 20; tick(G, w); assert.equal(w.dex, 1746);
  w.hp = 20; tick(G, w); assert.equal(w.dex, 746);
  const m = player(G, 774); tick(G, m);
  assert.equal(m.dex, 774);
  m.hp = 40; tick(G, m);
  const core = m.dex;
  assert.ok([1774, 2774, 3774, 4774, 5774, 6774, 7774].includes(core));
  assert.ok(m.mon.pa > m.bf.save.mon.pa && m.mon.df < m.bf.save.mon.df);
  m.hp = 100; tick(G, m); m.hp = 40; tick(G, m);
  assert.equal(m.dex, core);
});

test('con un poder puesto se espera; Terapagos: Teracristal al empezar y Astral con el Teracristal (conserva su tipo Tera)', () => {
  const { G } = load(), pl = player(G, 681, { powerOn: true, powerId: 'z' });
  G.EnemyMgr.near = true; tick(G, pl);
  assert.equal(pl.dex, 681);
  pl.powerOn = false; tick(G, pl);
  assert.equal(pl.dex, 1681);
  const t = player(G, 1024); tick(G, t);
  assert.equal(t.dex, 2024);
  t.powerOn = true; t.powerId = 'tera'; t.tera = 'fire'; t.mon = Object.assign({}, t.mon, { types: ['fire'] }); tick(G, t);
  assert.equal(t.dex, 501024);
  assert.deepEqual([...t.mon.types], ['fire']);
  t.powerOn = false; t.tera = null; tick(G, t);
  assert.equal(t.dex, 2024);
});

test('Palafin: Heroica al volver de una grieta; Cramorant: presa con Agua y la escupe al recibir un golpe', () => {
  const { G } = load(), p = player(G, 964); tick(G, p);
  G.Rift.inArena = true; tick(G, p); assert.equal(p.dex, 964);
  G.Rift.inArena = false; tick(G, p); assert.equal(p.dex, 1964);
  const c = player(G, 845); tick(G, c);
  G.BattleForms.onHit(c, {}, { type: 'fire' }); tick(G, c); assert.equal(c.dex, 845);
  G.BattleForms.onHit(c, {}, { type: 'water' }); tick(G, c); assert.equal(c.dex, 510845);
  assert.equal(G.BattleForms.block(c, 'fire', 'physical', false), false);    // el golpe entra, pero escupe
  tick(G, c); assert.equal(c.dex, 845);
  c.hp = 30; G.BattleForms.onHit(c, {}, { type: 'water' }); tick(G, c); assert.equal(c.dex, 845);   // 3 s de espera
  tick(G, c, 4, 1); G.BattleForms.onHit(c, {}, { type: 'water' }); tick(G, c); assert.equal(c.dex, 500845);
});

test('si empieza ya con una forma, se queda fija; tras evolucionar se recalcula; red: ownDex, netCode y applyNet', () => {
  const { G } = load(), f = player(G, 1681); tick(G, f, 5);
  assert.equal(f.dex, 1681);
  const pl = player(G, 681); G.EnemyMgr.near = true; tick(G, pl);
  assert.equal(G.BattleForms.netCode(pl), 1681);
  assert.equal(G.BattleForms.ownDex(pl), 681);
  assert.equal(G.BattleForms.ownMon(pl, pl.mon).dex, 681);
  G.BattleForms.reset(pl);
  assert.equal(pl.dex, 681);
  assert.equal(G.BattleForms.netCode(pl), 0);
  // Un compañero: sólo formas de combate de su especie.
  const mate = player(G, 681, { remote: true });
  G.BattleForms.applyNet(mate, 1778); assert.equal(mate.anim.dex, 681);
  G.BattleForms.applyNet(mate, 1681); assert.equal(mate.anim.dex, 1681); assert.equal(mate.dex, 681);
  G.BattleForms.applyNet(mate, 0); assert.equal(mate.anim.dex, 681);
});
