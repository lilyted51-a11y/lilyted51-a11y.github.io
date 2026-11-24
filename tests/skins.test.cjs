// Skins de la comunidad (25-11-2026, core/skins.js): las 3 de la semana, precios, packs, formas con skin y sus hojas.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const G = {};
const ctx = vm.createContext({ G, console, Date, Math });
for (const f of ['js/data/sprites-meta.js', 'js/core/skins.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
const S = G.Skins;
const monday = w => new Date(Date.UTC(2026, 10, 16 + 7 * w)).toISOString().slice(0, 10).replace(/-/g, '');

test('la tienda: 38 en la rotación, todas distintas, sin las que no se venden ni los estilos de un pack', () => {
  assert.strictEqual(S.ORDER.length, 38);
  assert.strictEqual(new Set(S.ORDER).size, 38);
  for (const id of S.ORDER) {
    const s = S.SKINS[id];
    assert.ok(s && !s.hw && s.shop !== false && !s.in, id);
  }
  assert.ok(!S.ORDER.includes('xenomorfo-deoxys') && !S.ORDER.includes('obsidiana-mewtwo'));
  assert.deepStrictEqual([...S.LIST].sort(), ['bruja-gengar', 'bruja-pikachu', 'bruja-umbreon']);
});

test('3 por semana, las mismas para todos; antes de empezar, las tres primeras', () => {
  assert.deepStrictEqual([...S.weekly('20261102')], [...S.ORDER.slice(0, 3)]);
  assert.deepStrictEqual([...S.weekly(monday(0))], [...S.ORDER.slice(0, 3)]);
  assert.deepStrictEqual([...S.weekly(monday(1))], [...S.ORDER.slice(3, 6)]);
  assert.deepStrictEqual([...S.weekly(monday(40))], [...S.weekly(monday(40))]);
  const seen = new Set();
  for (let w = 0; w < 13; w++) for (const id of S.weekly(monday(w))) seen.add(id);
  assert.strictEqual(seen.size, 38, 'la primera vuelta saca todas');
  for (let w = 0; w < 400; w++) assert.strictEqual(new Set(S.weekly(monday(w))).size, 3, 'semana ' + w);
});

test('cada vuelta nueva va mezclada y no empieza por las que cerraron la anterior', () => {
  for (let c = 1; c < 30; c++) {
    const l = S.cycle(c), prev = S.cycle(c - 1).slice(-3);
    assert.deepStrictEqual([...l].sort(), [...S.ORDER].sort());
    for (const id of l.slice(0, 3)) assert.ok(!prev.includes(id), `vuelta ${c}: ${id}`);
  }
  assert.notDeepStrictEqual([...S.cycle(1)], [...S.ORDER]);
});

test('precio por rareza', () => {
  assert.strictEqual(S.price('neon-zygarde'), 25000);
  assert.strictEqual(S.price('sombrio-scyther'), 27500);
  assert.strictEqual(S.price('toxico-koffing'), 30000);
  assert.strictEqual(S.price('cartero-dragonite'), 35000);
  assert.strictEqual(S.price('pastel-magearna'), 45000);
});

test('un pack da todos sus estilos', () => {
  const st = S.styles('abisal-groudon');
  assert.strictEqual(st.length, 7);
  const s = { skins: { 'abisal-groudon': 1 }, pskin: {} };
  for (const id of st) assert.ok(S.owns(s, id), id);
  S.wear(s, 383, 'playero-groudon');
  assert.strictEqual(S.worn(s, 383), 'playero-groudon');
  assert.ok(!S.owns({ skins: { 'desertico-groudon': 1 } }, 'abisal-groudon'));
});

test('las formas con skin (Kyogre primigenio, Mega Baxcalibur, Greninja) la siguen llevando', () => {
  assert.ok(S.get('abisal-kyogre', 382) && S.get('abisal-kyogre', 1382));
  assert.ok(S.get('godzilla-baxcalibur', 100998));
  assert.ok(S.get('esmeralda-greninja', 100658) && S.get('esmeralda-greninja', 300658));
  assert.strictEqual(S.get('cartero-dragonite', 1382), null);
});

test('autor: el suyo, o la comunidad; las de la casa, ninguno', () => {
  assert.strictEqual(S.author('neon-zygarde'), 'SrYena');
  assert.strictEqual(S.author('espacial-groudon'), 'Frisma32');
  assert.strictEqual(S.author('cartero-dragonite'), S.COMMUNITY);
  assert.strictEqual(S.author('bruja-gengar'), '');
});

test('todas tienen sus hojas (y las shiny, las que las tienen), con el margen de siempre', () => {
  const png = f => { const b = fs.readFileSync(f); assert.strictEqual(b.readUInt32BE(0), 0x89504e47, f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
  for (const [id, s] of Object.entries(S.SKINS)) {
    for (const d of [s.dex].concat(s.mega || [])) {
      const m = G.SPRITE_META[d];
      assert.ok(m, `${id}: sin geometría de ${d}`);
      for (const [an, a] of Object.entries(m.a)) {
        if (a.f) continue;
        for (const sh of s.sh && d === s.dex ? ['', 's/'] : ['']) {
          const f = path.join(ROOT, `assets/pokemon/${d}/k-${id}/${sh}${an}.png`);
          assert.ok(fs.existsSync(f), f);
          const [w, h] = png(f);
          const g = sh && m.sa && m.sa[an] ? m.sa[an] : a;
          assert.deepStrictEqual([w, h], [(g.w + 2 * S.PAD_X) * g.n, (g.h + S.PAD_T) * g.r], f);
        }
      }
    }
  }
});
