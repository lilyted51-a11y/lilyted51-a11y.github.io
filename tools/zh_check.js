/* ============ zh_check.js — ¿sale todo en chino? (copia local) ============
 * node tools/zh_check.js [--all]
 * Carga el parche js/zh-tw.js de verdad (con un navegador mínimo de mentira) y le
 * pasa los textos que ve el jugador; lista los que siguen con palabras en español
 * o inglés. Hay que pasarlo cada vez que se añade algo que se ve (ataques, objetos,
 * formas, pantallas, avisos, novedades...): la regla está en CLAUDE.md.
 *   1. Novedades (js/data/changelog.js): todas, título y líneas, en español e inglés.
 *   2. Cadenas del código (js/**, sin app.min.js ni js/lang) y textos de dev.html
 *      que parecen frases. Las que llevan ${...} se prueban con un ejemplo y se
 *      marcan como «compuesta» (puede hacer falta un patrón con {x} en el diccionario).
 * Sale con código 1 si algo de las novedades queda sin traducir.
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const ALL = process.argv.includes('--all');

// ---- el parche, con lo justo para que arranque ----
const out = [];
class Ctx { constructor() { this.font = '16px Pixelify'; } fillText(s) { out.push(String(s)); } strokeText() {} measureText(s) { return { width: String(s).length * 8 }; } }
const el = () => ({ setAttribute() {}, appendChild() {}, append() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, toggle() {} },
  querySelector: () => null, querySelectorAll: () => [], closest: () => null });
const document = { createElement: el, head: el(), body: el(), documentElement: el(), addEventListener() {}, querySelector: () => null,
  querySelectorAll: () => [], getElementById: () => null, createTreeWalker: () => ({ nextNode: () => null }), readyState: 'complete' };
const win = { CanvasRenderingContext2D: Ctx, addEventListener() {}, location: { hostname: 'localhost', pathname: '/', href: 'http://localhost/' },
  document, alert() {}, confirm() {}, navigator: { language: 'zh-TW' }, setTimeout, clearTimeout, requestAnimationFrame: () => 0 };
win.parent = win; win.window = win;
vm.createContext(Object.assign(win, { MutationObserver: class { observe() {} }, Node: { TEXT_NODE: 3, ELEMENT_NODE: 1 }, NodeFilter: {}, console }));
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'zh-tw.js'), 'utf8'), win);
const ctx = new Ctx();
const zh = s => { out.length = 0; ctx.fillText(s); return out[0]; };

// ¿Queda texto sin traducir? Dos o más palabras latinas seguidas, o una palabra sola si era todo el texto.
const KEEP = /^(pokesurvivor\.com|pokesurvivor|com|PolyForm|Noncommercial|The|Company|Inc|CREDITS|md|Pixelify|Sans|OFL|LB|RB|Pikachu|Ted|PokéSurvivor|Pokémon|Nintendo|Creatures|GAME|FREAK|PokeAPI|SpriteCollab|PMD|CC|BY|NC|WASD|Esc|Enter|Shift|Tab|Gmail|Google|Firebase|GitHub|Discord|Xbox|PlayStation|Switch|USB|Bluetooth|HP|XP|PS|ID|OK|MIT|JPTER78|URL|HUD|FPS|CPU|PC|iOS|Android|Chrome|Safari|Firefox|Edge|Mega|Gigamax|Nv|CD|ATK|DEF|VEL|REG|AT|E|x\d*|m|s|km|px|v\d.*)$/i;
function leftover(s) {
  const words = (s.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’-]*/g) || []).filter(w => !KEEP.test(w));
  if (!words.length) return null;
  // palabras latinas seguidas (separadas sólo por espacios/puntuación corta)
  const runs = s.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’-]*(?:[ ,.:;!?¡¿«»"()\/-]+[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’-]*)+/g) || [];
  const bad = runs.filter(r => r.split(/[^A-Za-zÀ-ÿ'’-]+/).filter(w => w && !KEEP.test(w)).length >= 2);
  return bad.length ? bad.join(' | ') : null;
}

const problems = { changelog: [], code: [], dynamic: [], html: [] };

// ---- 1. novedades ----
const G = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js', 'data', 'changelog.js'), 'utf8'), { G });
for (const day of G.CHANGELOG) {
  // Sólo el español: con el navegador en chino el juego va en español por debajo y el parche lo traduce
  const lines = [day.title[0], ...['new', 'chg', 'fix'].flatMap(k => (day[k] || []).map(x => x[0]))];
  for (const src of lines) { const t = zh(src), bad = leftover(t); if (bad) problems.changelog.push({ d: day.d, src, bad }); }
}

// ---- 2. cadenas del código ----
function* files(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { if (!['lang'].includes(f.name)) yield* files(p); }
    else if (f.name.endsWith('.js') && !/^lang-/.test(f.name) && !['app.min.js', 'zh-tw.js', 'changelog.js', 'pokedex.js', 'boot.js', 'i18n.js', 'locales.js', 'bg-tick.js', 'noframe.js', 'abilities.js', 'natures.js'  /* llevan su propia columna zh-Hant (G.Mons.name) */].includes(f.name)) yield p;
  }
}
// Parece una frase para el jugador: letras, un espacio y nada de código/CSS/selectores.
const looksUi = s => /[a-záéíóúñ]/.test(s) && /\s/.test(s) && /[A-Za-zÁÉÍÓÚáéíóúñ]{3}/.test(s) &&
  !/^[\w.#\-\[\]=:*>~+ ]+$/.test(s) && !/[{};]|=>|\bfunction\b|https?:|\.(js|png|css|json)\b|^\s*[#.][\w-]/.test(s.replace(/\$\{[^}]*\}/g, '')) &&
  !/^(rgba?|hsla?)\(|^\d/.test(s.trim()) && !/^[a-z]+(-[a-z]+)+$/.test(s.trim());
const seen = new Set();
for (const file of files(path.join(ROOT, 'js'))) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const code = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
  const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(code))) {
    let s = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\\(['"`\\])/g, '$1').replace(/\\n/g, ' ');
    const tpl = m[3] != null && s.includes('${');
    if (/<[a-z][^>]*>/i.test(s)) s = s.replace(/<[^>]+>/g, ' ');           // HTML dentro: sólo el texto
    s = s.replace(/\s+/g, ' ').trim();
    if (!looksUi(s) || seen.has(s)) continue;
    if (!tpl && s.includes('${')) continue;   // trozo de una plantilla mal cortada (comillas dentro de ${...})
    if (tpl && (s.replace(/\$\{[^}]*\}/g, ' ').match(/[A-Za-zÀ-ÿ]{2,}/g) || []).length < 2) continue;   // clases y rutas armadas con ${...}
    // Lo que no ve el jugador: consola, errores, selectores, CSS, fuentes
    const lineText = code.slice(code.lastIndexOf('\n', m.index) + 1, code.indexOf('\n', m.index));
    if (/console\.|new Error\(|throw |querySelector|closest\(|matches\(|matchMedia/.test(lineText)) continue;
    if (/px |gradient\(|env\(|system-ui|sans-serif|^\[|\]$/.test(s)) continue;
    // Trozo de una frase que se arma con + (se lista aparte: lo que cuenta es la frase entera)
    const glued = /\+\s*$/.test(code.slice(Math.max(0, m.index - 4), m.index)) || /^\s*\+/.test(code.slice(re.lastIndex, re.lastIndex + 4));
    seen.add(s);
    // Se prueba la frase entera como la ve el jugador: los ${...} y lo que va entre los trozos
    // unidos con + se rellenan con un número, un Pokémon o un apodo (vale si alguno sale bien).
    let shapes = [s];
    if (tpl) shapes = ['7', 'Pikachu', 'Ted'].map(v => s.replace(/\$\{[^}]*\}/g, v));
    else if (glued) {
      const lits = [...lineText.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)].map(x => (x[1] ?? x[2]).replace(/\\(['"\\])/g, '$1'));
      const lead = /^[^'"]*\+\s*['"]/.test(lineText.trim().replace(/^.*?[=(:,]\s*(?=[\w.]+\s*\+)/, ''));
      shapes = ['7', 'Pikachu', 'Ted'].map(v => (lead ? v : '') + lits.join(v) + v).concat(['7', 'Pikachu', 'Ted'].map(v => lits.join(v)));
    }
    const bad = shapes.map(x => leftover(zh(x.replace(/\s+/g, ' ').trim()))).reduce((a, b) => (a && b ? a : null));
    if (!bad) continue;
    const line = code.slice(0, m.index).split('\n').length;
    (tpl || glued ? problems.dynamic : problems.code).push({ at: rel + ':' + line, src: s.slice(0, 160), bad: bad.slice(0, 120) });
  }
}

// ---- 3. textos fijos de dev.html ----
const html = fs.readFileSync(path.join(ROOT, 'dev.html'), 'utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '');
for (const t of html.split(/<[^>]+>/).map(x => x.replace(/\s+/g, ' ').trim()).filter(x => /[a-záéíóúñ]{2}/i.test(x))) {
  if (seen.has(t)) continue; seen.add(t);
  const bad = leftover(zh(t));
  if (bad) problems.html.push({ src: t.slice(0, 160), bad: bad.slice(0, 120) });
}

const show = (title, list, fmt) => { console.log(`\n== ${title}: ${list.length}`); for (const p of (ALL ? list : list.slice(0, 40))) console.log('  ' + fmt(p)); if (!ALL && list.length > 40) console.log(`  … ${list.length - 40} más (--all)`); };
show('Novedades sin traducir', problems.changelog, p => `${p.d}  ${p.src.slice(0, 90)}  →  ${p.bad}`);
show('Cadenas del código sin traducir', problems.code, p => `${p.at}  «${p.src}»  →  ${p.bad}`);
show('Frases compuestas (${...}) con restos', problems.dynamic, p => `${p.at}  «${p.src}»  →  ${p.bad}`);
show('dev.html', problems.html, p => `«${p.src}»  →  ${p.bad}`);
process.exit(problems.changelog.length ? 1 : 0);
