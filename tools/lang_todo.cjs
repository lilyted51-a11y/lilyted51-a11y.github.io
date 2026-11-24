#!/usr/bin/env node
/*
 * Copia local (25-11-2026): lo que falta por traducir en cada idioma del juego (fr, it, pt-BR, zh-Hans, zh-Hant)
 * y la comprobación de un fichero de traducciones nuevo.
 *
 *   node tools/lang_todo.cjs dump            → tools/cache/lang/<idioma>.todo.json  [{ k (español), en }]
 *   node tools/lang_todo.cjs check <idioma> <fichero.js>
 *        el fichero es «G.I18n.add({ "español": "traducción", ... }, '<idioma>');» (puede llevar varios add):
 *        dice qué claves faltan, cuáles sobran (no están en la lista) y cuáles no tienen los mismos {x} / {name},
 *        saltos de línea o etiquetas <b>…</b> que el original.
 *   node tools/lang_todo.cjs zhhant          → js/data/lang-local-zh-hant.js desde js/zh-tw.js (el parche de chino
 *        ya tiene todo en tradicional, con clave en español)
 *
 * Las traducciones nuevas van en js/data/lang-local-<idioma>.js (tools/build_langs.js las junta con las demás).
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
// zhhant rehace su fichero entero: se quita antes de mirar qué falta (si no, «no falta nada» y saldría vacío).
if (process.argv[2] === 'zhhant') fs.rmSync(path.join(ROOT, 'js/data/lang-local-zh-hant.js'), { force: true });
const L = require('./build_langs.js');
const DIR = path.join(__dirname, 'cache', 'lang');
const [cmd, lang, file] = process.argv.slice(2);
const marks = s => [(s.match(/\{(?:x|name)\}/g) || []).length, (s.match(/\n/g) || []).length, (s.match(/<\/?[a-z][^>]*>/gi) || []).map(t => t.toLowerCase().replace(/\s.*>/, '>')).sort().join('')];

function dump() {
  const { en, res } = L.missing();
  fs.mkdirSync(DIR, { recursive: true });
  // Las novedades (changelog.js) desde el 18-10-2026 también tienen que estar en todos (tests/i18n).
  const sb = { G: {} }; vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data/changelog.js'), 'utf8'), sb);
  const all = L.capture(L.SOURCES, '?');
  const dexSb = { G: {} }; vm.createContext(dexSb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data/pokedex.js'), 'utf8'), dexSb);
  const dexNames = dexSb.G.DEX.map(p => p.name);
  for (const l of L.LANGS) {
    const have = new Set();
    for (const [d, l2, c] of all) if (l2 === l && !c) for (const k of Object.keys(d)) have.add(k.replace(/\{name\}/g, '{x}'));
    for (const e of sb.G.CHANGELOG.filter(e => e.d >= '2026-10-18'))
      for (const pair of [e.title, ...(e.new || []), ...(e.chg || []), ...(e.fix || [])])
        if (pair && !have.has(pair[0].replace(/\{name\}/g, '{x}')) && !res[l].includes(pair[0])) { res[l].push(pair[0]); en[pair[0]] = pair[1]; }
    // En chino, además, el nombre de cada Pokémon y forma de la Pokédex (tests/i18n: «all species have names»).
    if (l.startsWith('zh-')) for (const p of dexNames) if (!have.has(p) && !res[l].includes(p)) { res[l].push(p); en[p] = p; }
    fs.writeFileSync(path.join(DIR, l + '.todo.json'), JSON.stringify(res[l].map(k => ({ k, en: en[k] })), null, 1));
    console.log(l, res[l].length);
  }
}
if (cmd === 'dump') dump();
else if (cmd === 'check') {
  const todo = JSON.parse(fs.readFileSync(path.join(DIR, lang + '.todo.json'), 'utf8'));
  const got = {};
  for (const [d, l] of L.capture([path.relative(ROOT, path.resolve(file))], '?')) { if (l !== lang) { console.log('! idioma', l); process.exitCode = 1; } Object.assign(got, d); }
  const want = new Map(todo.map(t => [t.k, t.en]));
  const miss = [...want.keys()].filter(k => !(k in got) || !String(got[k]).trim());
  const extra = Object.keys(got).filter(k => !want.has(k));
  const bad = Object.keys(got).filter(k => want.has(k) && String(marks(k)) !== String(marks(String(got[k]))));
  const same = Object.keys(got).filter(k => want.has(k) && got[k] === k && /[a-záéíóúñ]{4,} [a-záéíóúñ]{3,}/i.test(k));
  console.log(`${lang}: ${Object.keys(got).length} traducidas de ${todo.length} · faltan ${miss.length} · sobran ${extra.length} · marcas distintas ${bad.length} · iguales al español ${same.length}`);
  for (const [t, l2] of [['FALTA', miss], ['SOBRA', extra], ['MARCAS', bad], ['IGUAL', same]]) for (const k of l2.slice(0, 15)) console.log(' ', t, JSON.stringify(k).slice(0, 150));
  if (miss.length || bad.length) process.exitCode = 1;
} else if (cmd === 'zhhant') {
  dump();
  const todo = JSON.parse(fs.readFileSync(path.join(DIR, 'zh-Hant.todo.json'), 'utf8'));
  const src = fs.readFileSync(path.join(ROOT, 'js/zh-tw.js'), 'utf8');
  const zh = {};
  for (const m of src.matchAll(/^ {2}("(?:[^"\\]|\\.)*"): ("(?:[^"\\]|\\.)*"),?\r?$/gm)) zh[JSON.parse(m[1])] = JSON.parse(m[2]);
  const out = [], none = [];
  for (const { k, en } of todo) {
    const v = zh[k] !== undefined ? zh[k] : zh[en];
    if (v === undefined || String(marks(k)) !== String(marks(v))) { none.push(k); continue; }
    out.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  }
  const js = `/* lang-local-zh-hant.js — GENERADO por tools/lang_todo.cjs zhhant desde js/zh-tw.js: no editar a mano.\r\n * Lo de esta copia en chino tradicional para quien elige 繁體中文 en Ajustes (el parche zh-tw.js es para el\r\n * navegador en chino). Lo que el parche resuelve con un patrón propio va aparte, en lang-local-zh-hant-extra.js. */\r\nG.I18n.add({\r\n${out.join('\r\n')}\r\n}, 'zh-Hant');\r\n`;
  fs.writeFileSync(path.join(ROOT, 'js/data/lang-local-zh-hant.js'), js);
  fs.writeFileSync(path.join(DIR, 'zh-Hant.rest.json'), JSON.stringify(todo.filter(t => none.includes(t.k)), null, 1));
  console.log('zh-Hant desde zh-tw.js:', out.length, '· sin traducción directa:', none.length, '(tools/cache/lang/zh-Hant.rest.json)');
} else console.log('uso: dump | check <idioma> <fichero> | zhhant');
