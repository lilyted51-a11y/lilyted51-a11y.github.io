#!/usr/bin/env node
/*
 * Copia local (24-11-2026): pasa al juego las formas, megas y Gigamax del juego oficial (con permiso del dueño):
 *
 *   1. sprites: tools/cache/official/sprites/<id oficial>/ → assets/pokemon/<nuestro número>/ (tal cual; su
 *      geometría, de su tabla, va a js/data/sprites-meta.js). Las que ya teníamos se cambian por las suyas
 *      (más animaciones y shiny de verdad); si el oficial no tiene shiny, se queda el nuestro.
 *      Las especies base bajadas con --base (más animaciones o shiny que no teníamos) también.
 *   2. js/data/pokedex.js: cada forma lleva "form" (su clase en el oficial: look | regional | battle | stat |
 *      power | mega | gmax | special). Sólo las regionales son Pokémon aparte (gacha, Pokédex...): las demás
 *      llevan excl. Las nuevas van en un bloque al final, con los tipos y números del oficial.
 *   3. js/data/forms.js (GENERADO): lo que el oficial sabe de cada forma y no cabe en la Pokédex: especie,
 *      clase, habilidades, evo/fu, mega (letra, clima, orbe) y la onda G-Max.
 *   4. js/zh-tw.js: el nombre en chino de las nuevas (PokeAPI zh-Hant + nuestra forma de escribirlos).
 *
 *   node tools/official_import.cjs [--dry]
 * Se puede repetir: lo ya hecho se queda igual (los sprites se vuelven a copiar).
 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');
const CACHE = path.join(__dirname, 'cache', 'official');
const map = require(path.join(CACHE, 'map.json'));
const man = require(path.join(CACHE, 'manifest.json'));
const P = f => path.join(ROOT, f);
const read = f => fs.readFileSync(P(f), 'utf8');
const write = (f, s) => { if (!DRY) fs.writeFileSync(P(f), s); };

// ---------------- lo que hay ----------------
const DEX_JS = 'js/data/pokedex.js', META_JS = 'js/data/sprites-meta.js', ZH_JS = 'js/zh-tw.js', FORMS_JS = 'js/data/forms.js';
let dexSrc = read(DEX_JS).replace(/\r\n/g, '\n');
const rowRe = /^  (\{"dex":(\d+),.*?\})(,?)(\s*\/\*.*\*\/)?$/gm;
const rows = {}; for (const m of dexSrc.matchAll(rowRe)) rows[+m[2]] = JSON.parse(m[1]);
let metaSrc = read(META_JS).replace(/\r\n/g, '\n');
const zhSrc = read(ZH_JS);
const zhName = {}; for (const m of zhSrc.matchAll(/^  "([^"]+)": "([^"]*)",?\r?$/gm)) if (!(m[1] in zhName)) zhName[m[1]] = m[2];
const zhHant = read('js/data/lang-zh-hant-names.js');
for (const m of zhHant.matchAll(/^  "([^"]+)": "([^"]*)",?\r?$/gm)) if (!(m[1] in zhName)) zhName[m[1]] = m[2];

// ---------------- nombres ----------------
const TYPE_ES = { normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico', grass: 'Planta', ice: 'Hielo', fighting: 'Lucha',
  poison: 'Veneno', ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho', rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón',
  dark: 'Siniestro', steel: 'Acero', fairy: 'Hada' };
const TYPE_ZH = { normal: '一般', fire: '火', water: '水', electric: '電', grass: '草', ice: '冰', fighting: '格鬥', poison: '毒', ground: '地面',
  flying: '飛行', psychic: '超能力', bug: '蟲', rock: '岩石', ghost: '幽靈', dragon: '龍', dark: '惡', steel: '鋼', fairy: '妖精' };
const TYPE_EN = t => t[0].toUpperCase() + t.slice(1);
const CREAM = { 'vanilla-cream': ['Vanilla Cream', '奶香香草'], 'ruby-cream': ['Ruby Cream', '奶香紅鑽'], 'matcha-cream': ['Matcha Cream', '奶香抹茶'],
  'mint-cream': ['Mint Cream', '奶香薄荷'], 'lemon-cream': ['Lemon Cream', '奶香檸檬'], 'salted-cream': ['Salted Cream', '奶香雪鹽'],
  'ruby-swirl': ['Ruby Swirl', '紅鑽綜合'], 'caramel-swirl': ['Caramel Swirl', '焦糖綜合'], 'rainbow-swirl': ['Rainbow Swirl', '三色綜合'] };
const SWEET = { strawberry: ['Strawberry', '草莓糖飾'], berry: ['Berry', '野莓糖飾'], love: ['Love', '愛心糖飾'], star: ['Star', '星星糖飾'],
  clover: ['Clover', '幸運草糖飾'], flower: ['Flower', '花朵糖飾'], ribbon: ['Ribbon', '蝴蝶結糖飾'] };
const PIKA = { belle: ['Pikachu Belle', '貴婦皮卡丘'], cosplay: ['Pikachu Cosplay', '換裝皮卡丘'], libre: ['Pikachu Libre', '面罩摔角手皮卡丘'],
  phd: ['Pikachu Ph.D.', '博士皮卡丘'], 'pop-star': ['Pikachu Pop Star', '偶像皮卡丘'], 'rock-star': ['Pikachu Rock Star', '硬搖滾皮卡丘'] };
const REGION_ZH = { alola: '阿羅拉', galar: '伽勒爾', hisui: '洗翠', paldea: '帕底亞' };

/** [inglés, chino] de una forma nueva (las que ya teníamos conservan los suyos). */
function names(e) {
  const sp = e.spEn, spZh = zhName[sp] || e.spZh || sp;
  const tail = (e.slug || '').slice(String(e.slug).indexOf('-') + 1);
  if (e.kind === 'gmax') return [e.en, '超極巨' + spZh + (e.off === 160892 ? '（連擊流）' : '')];
  if (e.kind === 'special') return [e.en, '無極汰那 無極巨化'];
  if (e.kind === 'mega') {
    if (/primal/.test(e.slug || '')) return ['Primal ' + sp, '原始' + spZh];
    return [e.en, '超級' + spZh + (e.sfx || '')];
  }
  if (e.off === 300658) return ['Ash-Greninja', '小智版甲賀忍蛙'];
  if (e.d === 869) {
    const c = Object.keys(CREAM).find(k => tail.startsWith(k)), s = tail.slice(c.length + 1).replace(/-sweet$/, '');
    return ['Alcremie ' + CREAM[c][0] + ' ' + SWEET[s][0], spZh + '（' + CREAM[c][1] + '・' + SWEET[s][1] + '）'];
  }
  if (e.d === 25 && PIKA[tail]) return PIKA[tail];
  if (/-female$/.test(e.slug || '')) return [sp + ' (Female)', spZh + '（雌性）'];
  if (e.d === 493 || e.d === 773) { const t = tail; return [sp + ' (' + TYPE_EN(t) + ')', spZh + '（' + TYPE_ZH[t] + '）']; }
  if (e.kind === 'regional') {
    const r = Object.keys(REGION_ZH).find(k => tail.startsWith(k));
    return [e.en.replace(/^Standard /, ''), REGION_ZH[r] + spZh];
  }
  let en = e.en || (sp + ' ' + tail);
  let fz = e.zhForm;
  if (!fz) return [en, null];
  if (fz.includes(spZh)) return [en, fz];
  return [en, spZh + ' ' + fz];
}

// ---------------- sprites ----------------
const ASSETS = P('assets/pokemon');
function copyDir(src, dst) {
  if (DRY) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const a = path.join(src, f), b = path.join(dst, f);
    if (fs.statSync(a).isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}
/** Meta del oficial → la nuestra (misma forma; sin sus marcas internas). Si no tiene shiny y la nuestra sí, la nuestra. */
function metaFor(off, oldMeta) {
  const m = man.meta[off];
  const o = { s: m.s, a: m.a };
  if (m.sh) o.sh = 1; if (m.sa) o.sa = m.sa; if (m.sm) o.sm = m.sm; if (m.hv) o.hv = 1;
  if (!m.sh && oldMeta && oldMeta.sh) { o.sh = 1; o.sa = oldMeta.sa ? oldMeta.sa : undefined; o._keepShiny = 1; }
  return o;
}
const metaLine = new Map(); for (const m of metaSrc.matchAll(/^  (\d+): (\{.*\}),$/gm)) metaLine.set(+m[1], m[2]);
const newMeta = new Map();
function placeSprites(off, ours) {
  const src = path.join(CACHE, 'sprites', String(off));
  if (!fs.existsSync(path.join(src, 'Idle.png')) && !fs.existsSync(path.join(src, 'Walk.png'))) return false;
  const old = metaLine.has(ours) ? JSON.parse(metaLine.get(ours)) : null;
  // Si el oficial tiene MENOS animaciones que las nuestras (sus megas de un dibujo, 837, 962...), se quedan
  // las nuestras y del oficial sólo se toma el shiny (de verdad; el nuestro era el tono girado o ninguno):
  // su geometría va en sa y lo que le falte, en sm.
  const om = man.meta[off];
  const offN = Object.values(om.a).filter(a => !a.f).length;
  if (old && offN < Object.keys(old.a).length) {
    if (!om.sh) return true;
    const m = { s: old.s, a: old.a, sh: 1 };
    const sa = {}, sm = [];
    for (const k of Object.keys(old.a)) {
      const a = om.a[k];
      if (!a || a.f) { sm.push(k); continue; }
      const g = (om.sa && om.sa[k]) || a;
      const o = old.a[k];
      if (g.w !== o.w || g.h !== o.h || g.n !== o.n || g.ax !== o.ax || g.ay !== o.ay || String(g.d) !== String(o.d)) sa[k] = g;
    }
    if (Object.keys(sa).length) m.sa = sa;
    if (sm.length) m.sm = sm;
    if (old.hv) m.hv = 1;
    const dst = path.join(ASSETS, String(ours), 's');
    if (!DRY) {
      fs.rmSync(dst, { recursive: true, force: true });
      copyDir(path.join(src, 's'), dst);
    }
    newMeta.set(ours, m);
    return true;
  }
  const meta = metaFor(off, old);
  // La shiny nuestra (si el oficial no tiene) tiene que ser de la misma geometría: si no, fuera.
  if (meta._keepShiny) {
    delete meta._keepShiny;
    const sameGeo = Object.keys(meta.a).every(k => old.a[k] && old.a[k].w === meta.a[k].w && old.a[k].h === meta.a[k].h && old.a[k].n === meta.a[k].n);
    if (!sameGeo) { delete meta.sh; delete meta.sa; }
  }
  if (meta.sa === undefined) delete meta.sa;
  const dst = path.join(ASSETS, String(ours));
  if (!DRY && fs.existsSync(dst) && man.meta[off].sh) {
    // las shiny viejas (tono girado) fuera; el resto se pisa
    fs.rmSync(path.join(dst, 's'), { recursive: true, force: true });
  }
  copyDir(src, dst);
  newMeta.set(ours, meta);
  return true;
}

// ---------------- formas ----------------
const FORMS = {};
const newRows = [], zhLines = [];
let replaced = 0, added = 0, noSprite = [];
for (const e of map) {
  const ours = e.ours;
  const okSprite = placeSprites(e.off, ours);
  if (!okSprite) { noSprite.push(e.off); if (e.isNew) continue; }
  const info = { k: e.kind, d: e.d, off: e.off };
  if (e.slug) info.slug = e.slug;
  if (e.ab) info.ab = e.ab;
  if (e.abl) info.abl = e.abl.map(x => x || 0);
  if (e.evo) info.evo = 1;
  if (e.fu) info.fu = 1;
  if (e.sfx) info.sfx = e.sfx;
  if (e.primal) info.primal = 1;
  if (e.orb) info.orb = e.orb;
  if (e.oc) info.oc = e.oc;
  if (e.wx) info.wx = e.wx;
  if (e.gmax && e.gmax.name) info.gmax = e.gmax;
  if (e.fk) info.fk = e.fk;
  FORMS[ours] = info;
  const excl = e.kind !== 'regional';
  if (!e.isNew) {
    const r = rows[ours];
    r.form = e.kind;
    if (excl) r.excl = true; else delete r.excl;
    replaced++;
    continue;
  }
  const [en, zh] = names(e);
  const base = rows[e.d];
  const row = { dex: ours, name: en, types: e.types || base.types };
  for (const k of ['hp', 'spd']) row[k] = e[k] != null ? e[k] : base[k];
  row.atk = e.atk != null ? e.atk : Math.max(e.pa != null ? e.pa : base.pa, e.sa != null ? e.sa : base.sa);
  for (const k of ['pa', 'sa', 'df', 'sd']) row[k] = e[k] != null ? e[k] : base[k];
  row.rarity = e.rarity || base.rarity;
  row.bst = e.bst || base.bst;
  row.starter = false;
  row.gen = e.gen || base.gen;
  if (e.leg || (base.leg && e.kind !== 'regional')) row.leg = true;
  if (excl) row.excl = true;
  row.form = e.kind;
  rows[ours] = row;
  newRows.push({ row, note: `${e.kind} ${e.slug || ''} (juego oficial ${e.off})` });
  if (zh && !(en in zhName)) { zhLines.push(`  ${JSON.stringify(en)}: ${JSON.stringify(zh)},`); zhName[en] = zh; }
  else if (!zh && !(en in zhName)) console.log('  ! sin chino:', en);
  added++;
}

// Especies base con sprites mejores en el oficial (bajadas con --base)
let baseUpd = [];
for (const d of fs.readdirSync(path.join(CACHE, 'sprites')).map(Number).filter(n => n >= 1 && n <= 1025)) {
  if (d === 1020 && rows[1020] && rows[1020].name !== 'Gouging Fire') continue;   // (1020 es aún Raticate de Alola: lo hace la parte de especies)
  if (placeSprites(d, d)) baseUpd.push(d);
}

// ---------------- escribir ----------------
// pokedex.js: filas cambiadas en su sitio; las nuevas, en un bloque al final.
dexSrc = dexSrc.replace(rowRe, (all, json, num, comma, note) => {
  const d = +JSON.parse(json).dex;
  return '  ' + JSON.stringify(rows[d]) + comma + (note || '');
});
if (newRows.length) {
  const lines = dexSrc.split('\n');
  const end = lines.findIndex(l => l.startsWith('];'));
  if (!/\},(\s*\/\*.*\*\/)?$/.test(lines[end - 1])) lines[end - 1] = lines[end - 1].replace(/^(  \{.*?\})/, '$1,');
  const block = ['  /* ---- copia local, 24-11-2026: formas, megas y Gigamax del juego oficial (tools/official_import.cjs) ---- */']
    .concat(newRows.map((n, i) => '  ' + JSON.stringify(n.row) + (i < newRows.length - 1 ? ',' : '') + '   /* ' + n.note + ' */'));
  // si ya había un bloque de antes (otra pasada), quitarlo antes
  lines.splice(end, 0, ...block);
  dexSrc = lines.join('\n');
}
write(DEX_JS, dexSrc.replace(/\n/g, '\r\n').replace(/\r\r\n/g, '\r\n'));

// sprites-meta.js
for (const [d, m] of newMeta) {
  const line = `  ${d}: ${JSON.stringify(m)},`;
  if (metaLine.has(d)) metaSrc = metaSrc.replace(new RegExp(`^  ${d}: \\{.*\\},$`, 'm'), () => line);
  else metaSrc = metaSrc.replace(/\n\};\s*$/, '\n' + line + '\n};\n');
}
write(META_JS, metaSrc.replace(/\r?\n/g, '\r\n'));

// forms.js
const formsJs = `/* ============ forms.js — GENERADO por tools/official_import.cjs, no editar a mano ============
 * Copia local (24-11-2026): lo que el juego oficial sabe de cada forma (su tabla), con nuestros números.
 *   k     clase: look (sólo el dibujo, Vestidor) · regional (Pokémon aparte) · battle (cambia sola en la partida)
 *         stat (se elige tras la 3.ª grieta) · power (fusión o forma de poder: premio de Eternatus) · mega
 *         gmax (Gigamax) · special (Eternatus Eternamax)
 *   d     especie · off número en el oficial · slug su nombre en PokeAPI · fk clave de la forma
 *   ab / abl  habilidad / sus tres habilidades (0 = ninguna)
 *   evo   la forma es de la evolución (se elige al evolucionar) · fu fusión (Kyurem, Necrozma, Calyrex)
 *   sfx   letra de la mega (X, Y, Z) · primal / orb / oc / wx: regresión primigenia, orbe, su color y clima
 *   gmax  onda G-Max: { name, type, fx, deco }
 */
G.FORMS = {
${Object.entries(FORMS).map(([d, v]) => `  ${d}: ${JSON.stringify(v)},`).join('\n')}
};
G.FORMS_OF = {};
for (const [d, f] of Object.entries(G.FORMS)) (G.FORMS_OF[f.d] = G.FORMS_OF[f.d] || []).push(+d);
/** Especie de un número (forma o no). Restar 1000 hasta llegar a 1-1025 sólo vale para nuestros números viejos
 *  (especie + 1000·k): con los del oficial falla (100003 → 1003, 500020 → 1020), así que manda G.FORMS. */
G.formBase = d => { d = +d; if (G.FORMS[d]) return G.FORMS[d].d; while (d > 1025) d -= 1000; return d; };
`;
write(FORMS_JS, formsJs.replace(/\n/g, '\r\n'));

// zh-tw.js: junto a las formas que ya estaban
if (zhLines.length) {
  const anchor = '  "Terastal Terapagos": "太晶太樂巴戈斯",';
  if (!zhSrc.includes(anchor)) throw new Error('no encuentro el ancla en zh-tw.js');
  const nl = zhSrc.includes('\r\n') ? '\r\n' : '\n';
  write(ZH_JS, zhSrc.replace(anchor, anchor + nl + zhLines.join(nl)));
}
console.log(`formas: ${replaced} ya estaban (ahora con su clase), ${added} nuevas · especies base con sprites del oficial: ${baseUpd.length}`
  + ` · sin sprites todavía: ${noSprite.length}${noSprite.length ? ' (' + noSprite.slice(0, 12).join(' ') + '…)' : ''} · chino nuevo: ${zhLines.length}`);
