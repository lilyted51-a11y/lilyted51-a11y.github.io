#!/usr/bin/env node
/*
 * Copia local (24-11-2026): saca del app.min.js del juego oficial (pokesurvivor.com, con permiso del dueño)
 * las tablas de datos que necesitamos para igualar sus formas, megas y Gigamax. SÓLO LEE: busca cada tabla
 * por su comienzo, corta el literal con las llaves equilibradas y lo convierte en datos. Las cadenas que el
 * oficial guarda cifradas (llamadas como ee(0x975)) NO se descifran: se quedan como "?0x975" y se rellenan
 * a mano o con los datos de PokeAPI (tools/official_forms.py).
 *
 *   node tools/official_manifest.cjs <app.min.js del oficial>  →  tools/cache/official/manifest.json
 *
 *   meta   sprites (como nuestro sprites-meta.js; f = la hoja es la de otra animación)
 *   forms  las 388 formas: id 5xxxxx, d especie, k look|regional|battle|stat|power|mega, fk, slug,
 *          n nombre, fn nombre de la forma, t tipos, stats, ab/abl habilidades, evo, fu, leg...
 *   mega   megas por especie (id 100000+dex) · mega2 la segunda mega (X/Y/Z: su id va dentro)
 *   gmax   efecto de la onda G-Max por especie (sprite 150000+dex; Urshifu Fluido 160892)
 *   dex    la Pokédex base del oficial
 */
const fs = require('fs'), path = require('path');
const src = process.argv[2];
if (!src) { console.error('uso: node tools/official_manifest.cjs <app.min.js>'); process.exit(1); }
const s = fs.readFileSync(src, 'utf8');

/** Literal que empieza en `start` (incluido su primer carácter de apertura) → datos. */
function grab(start, open, close) {
  let i = s.indexOf(start);
  if (i < 0) throw new Error('no encuentro ' + start);
  i += start.length - 1;
  let dep = 0, j = i;
  for (; j < s.length; j++) {
    const c = s[j];
    if (c === '"' || c === "'") { const q = c; j++; while (s[j] !== q) { if (s[j] === '\\') j++; j++; } continue; }
    if (c === open) dep++; else if (c === close) { dep--; if (!dep) break; }
  }
  return toData(s.slice(i, j + 1));
}
/** Literal de objeto JS → datos, sin ejecutar nada del oficial: las llamadas cifradas pasan a cadena. */
function toData(lit) {
  const safe = lit.replace(/\b[a-zA-Z_$][\w$]{0,3}\((0x[0-9a-f]+)\)/g, '"?$1"');
  if (/\b[a-zA-Z_$][\w$]*\(/.test(safe.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, ''))) throw new Error('el literal lleva código: ' + lit.slice(0, 120));
  return Function('"use strict"; return (' + safe + ');')();
}

const meta = grab('a._b49046e={', '{', '}');
const dex = grab('a._4de92ae=[', '[', ']');
const mega = grab("b['_c3ca088']={", '{', '}');
const mega2 = grab("b['_51c1523']={", '{', '}');
const gmax = grab("'GMAX':{", '{', '}');
const forms = [];
for (const m of s.matchAll(/\{id:\d{6,7},d:/g)) {
  let dep = 0, j = m.index;
  for (; j < s.length; j++) {
    const c = s[j];
    if (c === '"' || c === "'") { const q = c; j++; while (s[j] !== q) { if (s[j] === '\\') j++; j++; } continue; }
    if (c === '{') dep++; else if (c === '}') { dep--; if (!dep) break; }
  }
  forms.push(toData(s.slice(m.index, j + 1)));
}
const out = { from: path.basename(src), at: new Date().toISOString(), meta, forms, mega, mega2, gmax, dex };
const dir = path.join(__dirname, 'cache', 'official');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(out));
const left = JSON.stringify({ forms, mega, mega2, gmax }).match(/"\?0x[0-9a-f]+"/g) || [];
console.log('sprites', Object.keys(meta).length, '· formas', forms.length, '· megas', Object.keys(mega).length,
  '+', Object.values(mega2).flat().length, '· gmax', Object.keys(gmax).length, '· pokédex', dex.length,
  '· cadenas cifradas sin rellenar', new Set(left).size);
