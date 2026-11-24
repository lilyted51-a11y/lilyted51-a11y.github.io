// Especies y formas (24-11-2026, tools/add_species.py y tools/add_forms.py): que cada Pokémon de la
// Pokédex tenga sus sprites (meta y ficheros), su nombre en chino, sus habilidades y sus evoluciones bien.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const src = f => fs.readFileSync(path.join(root, f), 'utf8');

const G = {};
const zhNames = {};
const ctx = vm.createContext({ G, console });
G.I18n = { add: d => Object.assign(zhNames, d) };
for (const f of ['js/data/pokedex.js', 'js/data/sprites-meta.js', 'js/data/forms.js', 'js/data/abilities.js', 'js/data/evolutions.js', 'js/data/tms.js'])
  vm.runInContext(src(f), ctx, { filename: f });
vm.runInContext(src('js/data/lang-zh-hant-names.js'), ctx, { filename: 'lang-zh-hant-names.js' });
// zh-tw.js: las líneas «  "clave": "valor",» de su diccionario
const zhtw = {};
for (const m of src('js/zh-tw.js').matchAll(/^ {2}("(?:[^"\\]|\\.)*"): ("(?:[^"\\]|\\.)*"),?\r?$/gm)) zhtw[JSON.parse(m[1])] = JSON.parse(m[2]);

const plain = x => JSON.parse(JSON.stringify(x));   // (los datos vienen de otro contexto de vm)
const NEW = [593, 618, 683, 733, 837, 865, 878, 879, 929, 945, 948, 962, 990, 1003, 1021, 1025];

test('cada Pokémon de la Pokédex tiene su entrada en sprites-meta y sus hojas en assets/', () => {
  const miss = [], files = [];
  for (const p of G.DEX) {
    const m = G.SPRITE_META[p.dex];
    if (!m) { miss.push(p.dex); continue; }
    assert.ok(m.a.Idle || m.a.Walk, p.dex + ': sin Idle ni Walk');
    const dir = path.join(root, 'assets/pokemon', String(p.dex));
    const have = new Set(fs.existsSync(dir) ? fs.readdirSync(dir) : []);
    // (f: esa animación usa la hoja de otra: sprites del juego oficial)
    for (const a of Object.keys(m.a)) if (!m.a[a].f && !have.has(a + '.png')) files.push(p.dex + '/' + a);
    if (m.sh) {
      const sh = new Set(have.has('s') ? fs.readdirSync(path.join(dir, 's')) : []);
      for (const a of Object.keys(m.a)) if (!m.a[a].f && !(m.sm || []).includes(a) && !sh.has(a + '.png')) files.push(p.dex + '/s/' + a);
    }
  }
  assert.deepEqual(miss, [], 'sin sprites-meta');
  assert.deepEqual(files, [], 'hojas que faltan');
  assert.equal(Object.keys(G.SPRITE_META).filter(d => !G.DEX_BY[d]).length, 0, 'sprites-meta de Pokémon que no están en la Pokédex');
});

test('cada Pokémon tiene nombre en chino tradicional (zh-tw.js; las especies, también en lang-zh-hant-names.js)', () => {
  const noTw = G.DEX.filter(p => !zhtw[p.name]).map(p => p.dex + ' ' + p.name);
  assert.deepEqual(plain(noTw), []);
  const species = G.DEX.filter(p => p.dex <= 1025 && !/^(Alolan|Galarian|Hisuian|Paldean) /.test(p.name));
  assert.deepEqual(plain(species.filter(p => !zhNames[p.name]).map(p => p.dex + " " + p.name)), []);
});

test('las especies nuevas: datos, habilidades con nombre, MT, rareza y sin romper evoluciones', () => {
  for (const d of NEW) {
    const p = G.DEX_BY[d];
    assert.ok(p && p.types.length && p.bst > 0 && p.rarity >= 1 && p.rarity <= 5, d + ': fila de la Pokédex');
    assert.ok(G.DEX_ABIL[d], d + ': habilidades');
    for (const a of G.DEX_ABIL[d]) if (a) assert.ok(G.ABIL[a] && G.ABIL[a].length === 6, d + ': nombre de la habilidad ' + a);
    assert.ok(G.TM_OF(d).length > 0, d + ': alguna MT');
  }
  assert.equal(G.DEX_BY[1025].rarity, 5); assert.ok(G.DEX_BY[1025].leg, 'Pecharunt es singular');
  assert.ok(G.DEX_BY[1003].leg, 'Ting-Lu es legendario');
  // Evoluciones: sólo entre Pokémon que están (desde el 24-11-2026 también Frillish → Jellicent)
  for (const [from, to] of Object.entries(G.EVOS)) for (const t of to) {
    assert.ok(G.DEX_BY[from] && G.DEX_BY[t], `evolución ${from} → ${t} con alguno que falta`);
  }
  assert.deepEqual(plain(G.EVOS[878]), [879]); assert.deepEqual(plain(G.EVOS[928]), [929]); assert.deepEqual(plain(G.EVOS[929]), [930]);
  assert.deepEqual(plain(G.EVOS[592]), [593], 'Frillish → Jellicent');
});

test('los aspectos (forma «look» del juego oficial) llevan los tipos de su especie', () => {
  const looks = G.DEX.filter(p => p.form === 'look');
  assert.ok(looks.length >= 220);
  for (const p of looks) {
    const b = G.DEX_BY[G.FORMS[p.dex].d];
    assert.ok(b, p.name + ': su especie');
    assert.deepEqual(plain(p.types), plain(b.types), p.name);
  }
});
