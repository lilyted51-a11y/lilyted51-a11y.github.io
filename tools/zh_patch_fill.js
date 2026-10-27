/* ============ zh_patch_fill.js — completa el parche zh-tw con el chino tradicional oficial (copia local) ============
 * El parche js/zh-tw.js traduce desde el español (y el inglés). Upstream trae
 * desde el 19-10-2026 su propio chino tradicional (js/data/lang-zh-hant*.js y
 * la columna zh-Hant de lang-updates.js). Esto añade al parche las frases que
 * le falten (ataques nuevos, textos nuevos...), con la traducción oficial; lo
 * que el parche ya tenía no se toca.
 *
 *   node tools/zh_patch_fill.js           (escribe js/zh-tw.js)
 *   node tools/zh_patch_fill.js --dry     (sólo cuenta)
 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');

// Lo oficial: todo lo que se registra para 'zh-Hant'
const off = {}, offCtx = {};
const fakeG = { I18n: { add(dict, lang, ctx) { if (lang !== 'zh-Hant') return; for (const [k, v] of Object.entries(dict)) { if (ctx) offCtx[k] = v; else off[k] = v; } } } };
for (const f of ['lang-zh-hant.js', 'lang-zh-hant-names.js', 'lang-updates.js']) {
  new Function('G', fs.readFileSync(path.join(ROOT, 'js', 'data', f), 'utf8'))(fakeG);
}
// Inglés (para añadir también la clave inglesa: el parche traduce lo que se vea en pantalla)
const en = {};
new Function('G', fs.readFileSync(path.join(ROOT, 'js', 'data', 'lang-en.js'), 'utf8'))({ I18n: { add(d, l, c) { if (!l || l === 'en') Object.assign(en, d); } } });

const p = path.join(ROOT, 'js', 'zh-tw.js');
let src = fs.readFileSync(p, 'utf8');
const m = src.match(/const DICT = (\{[\s\S]*?\n\});/);
const DICT = eval('(' + m[1] + ')');
const add = {};
// {name} (apodo de un jugador, sin traducir) no lo entiende el parche: esas frases ya las tiene con {x}
const put = (k, v) => { if (k && v && k !== v && !k.includes('{name}') && !(k in DICT) && !(k in add)) add[k] = v; };
for (const [k, v] of Object.entries(off)) { put(k, v); if (en[k]) put(en[k], v); }
// Los de contexto (nombre de un ataque que coincide con otra palabra): sólo si el parche no tiene nada
for (const [k, v] of Object.entries(offCtx)) { put(k, v); if (en[k]) put(en[k], v); }

console.log('oficial zh-Hant:', Object.keys(off).length + Object.keys(offCtx).length, '| ya en el parche:', Object.keys(off).filter(k => k in DICT).length, '| se añaden:', Object.keys(add).length);
if (DRY) { console.log(Object.entries(add).slice(0, 40).map(([k, v]) => '  ' + k + ' => ' + v).join('\n')); process.exit(0); }
const anchor = '  "Sin preparar": "未準備",\n';
src = src.split('\r\n').join('\n');   // da igual el final de línea con que esté guardado
if (!src.includes(anchor)) throw new Error('anchor');
const lines = '  // ---- añadido por tools/zh_patch_fill.js (traducción oficial de upstream) ----\n' +
  Object.entries(add).map(([k, v]) => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(v) + ',\n').join('');
src = src.replace(anchor, anchor + lines);
fs.writeFileSync(p, src);
console.log('escrito', p);
