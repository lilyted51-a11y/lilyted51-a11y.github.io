#!/usr/bin/env node
/*
 * Copia local (24-11-2026): empareja cada forma, mega y Gigamax del juego oficial (tools/cache/official/manifest.json)
 * con la nuestra (G.DEX), y da número a las que no tenemos. Escribe tools/cache/official/map.json:
 *
 *   [{ off, kind, d, slug, ours, isNew, en, es, zh, types, stats... }]
 *
 *   off    id del oficial (sus sprites: assets/pokemon/<off>/ allí)
 *   kind   look | regional | battle | stat | power | mega | gmax | special  (lo de su tabla; mega2 → mega)
 *   ours   nuestro número: el que ya tenía esa forma, o el del oficial si es nueva (su resto entre 1000 es la
 *          especie, como los nuestros; los dos esquemas no chocan)
 *
 * Nombres: en / zh (zh-Hant) de PokeAPI (pokemon_form_names.csv, en tools/cache/pokeapi/), es del oficial.
 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = global; global.G = {};
require(path.join(ROOT, 'js/data/pokedex.js'));
const man = require(path.join(__dirname, 'cache/official/manifest.json'));

// ---------- PokeAPI ----------
const PA = path.join(__dirname, 'cache', 'pokeapi');
function csv(f) {
  const [head, ...rows] = fs.readFileSync(path.join(PA, f), 'utf8').trim().split(/\r?\n/);
  const H = head.split(',');
  return rows.map(r => { const c = []; let cur = '', q = false; for (const ch of r) { if (ch === '"') q = !q; else if (ch === ',' && !q) { c.push(cur); cur = ''; } else cur += ch; } c.push(cur); return Object.fromEntries(H.map((h, i) => [h, c[i]])); });
}
const forms = csv('pokemon_forms.csv'), fnames = csv('pokemon_form_names.csv'), species = csv('pokemon_species_names.csv');
const formBySlug = {}; for (const f of forms) formBySlug[f.identifier] = f;
const nameOf = {}; for (const r of fnames) (nameOf[r.pokemon_form_id] = nameOf[r.pokemon_form_id] || {})[r.local_language_id] = r;
const spName = {}; for (const r of species) (spName[r.pokemon_species_id] = spName[r.pokemon_species_id] || {})[r.local_language_id] = r.name;
const EN = 9, ZH = 4;

// ---------- lo nuestro ----------
const ours = G.DEX.filter(p => p.dex > 1025);
const used = new Set(G.DEX.map(p => p.dex));
const tok = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/’/g, "'")
  .replace(/\b(alolan)\b/g, 'alola').replace(/\b(galarian)\b/g, 'galar').replace(/\b(hisuian)\b/g, 'hisui').replace(/\b(paldean)\b/g, 'paldea')
  .replace(/[()%.,:]/g, ' ').split(/[\s-]+/).filter(w => w && !['form', 'forme', 'breed', 'mode', 'style', 'the', 'of', 'size', 'trim', 'cloak', 'pattern', 'flower', 'plumage', 'core', 'mask'].includes(w));
const same = (a, b) => { const A = new Set(a), B = new Set(b); return A.size === B.size && [...A].every(x => B.has(x)); };

function enName(slug, fallbackSp) {
  const f = formBySlug[slug];
  const n = f && nameOf[f.id] && nameOf[f.id][EN];
  return (n && (n.pokemon_name || n.form_name)) || null;
}
function zhName(slug, d) {
  const f = formBySlug[slug];
  const n = f && nameOf[f.id] && nameOf[f.id][ZH];
  return n ? (n.pokemon_name || n.form_name) : null;
}

// Cadenas que el oficial guarda cifradas (official_manifest.cjs las deja como "?0x…"): rellenadas a mano,
// por el sitio donde salen (tipo de la otra mitad de un par conocido, especie de la mega...).
const CIPHER = {
  '?0x28a': 'gengar-mega', '?0x975': 'poison', '?0x20f': 'electric', '?0x501': 'skill-link', '?0x2ff': 'dark',
  '?0x8d3': 'solar-power', '?0x539': 'dragon', '?0x825': 'fighting', '?0x25c': 'psychic', '?0x77a': 'manectric-mega',
  '?0xa22': 'sharpedo-mega', '?0x52d': 'sheer-force', '?0x394': 'steel', '?0x435': 'magic-bounce', '?0xa4c': 'aerilate',
  '?0x187': 'kyogre-primal', '?0xa3e': 'fire', '?0x862': 'froslass-mega', '?0x5f3': 'scolipede-mega', '?0x456': 'intimidate',
  '?0x9ab': 'dragalge-mega', '?0x95c': 'zygarde-mega', '?0x90f': 'raichu-mega-x', '?0x4bb': 'ghost', '?0x365': 'water',
  '?0x592': 'ground', '?0x13e': 'leaf', '?0x8c4': 'dot', '?0x74d': 'veil', '?0xa02': 'Gigafundido', '?0x1bf': 'stun',
  '?0x478': 'wind', '?0x9e1': 'star',
};
(function fill(o) { for (const k in o) { if (typeof o[k] === 'string' && CIPHER[o[k]]) o[k] = CIPHER[o[k]]; else if (o[k] && typeof o[k] === 'object') fill(o[k]); } })(man);
// Nuestros nombres que no salen igual que los de PokeAPI.
const ALIAS = { 'zacian-crowned': 'Zacian Crowned Sword', 'zamazenta-crowned': 'Zamazenta Crowned Shield',
  'tauros-paldea-combat-breed': 'Paldean Tauros', 'darmanitan-galar-standard': 'Galarian Darmanitan', 'tatsugiri-curly-mega': 'Mega Tatsugiri' };

const out = [];
function add(e) {
  if (ALIAS[e.slug]) e.altEn = ALIAS[e.slug];
  const cands = ours.filter(p => p.dex % 1000 === e.d || (p.dex - e.d) % 1000 === 0);
  const t1 = tok(e.en).filter(w => !tok(G.DEX_BY ? '' : '').includes(w));
  let hit = cands.find(p => same(tok(p.name), tok(e.en)));
  if (!hit && e.altEn) hit = cands.find(p => same(tok(p.name), tok(e.altEn)));
  e.ours = hit ? hit.dex : e.off;
  e.isNew = !hit;
  if (!hit && used.has(e.off)) throw new Error('el número ' + e.off + ' ya está usado');
  out.push(e);
}

const spEn = d => (spName[d] || {})[EN] || (G.DEX.find(p => p.dex === d) || {}).name;
const spZh = d => (spName[d] || {})[ZH] || '';
for (const f of man.forms) {
  add({ off: f.id, kind: f.k, d: f.d, slug: f.slug, fk: f.fk, es: f.n, esForm: f.fn, en: enName(f.slug) || (spEn(f.d) + ' ' + f.fk), zhForm: zhName(f.slug, f.d),
    types: f.t, hp: f.hp, spd: f.spd, atk: f.atk, pa: f.pa, sa: f.sa, df: f.df, sd: f.sd, bst: f.bst, ab: f.ab, abl: f.abl,
    rarity: f.rarity, gen: f.gen, leg: f.leg, evo: f.evo, fu: f.fu });
}
const megaEn = (d, sfx, slug) => /primal/.test(slug) ? 'Primal ' + spEn(d) : 'Mega ' + spEn(d) + (sfx ? ' ' + sfx : '');
for (const [d, m] of Object.entries(man.mega)) {
  const slug = m.slug.startsWith('?') ? null : m.slug;
  add({ off: 100000 + +d, kind: 'mega', d: +d, slug, sfx: m.sfx, en: megaEn(+d, m.sfx, slug || ''), zhForm: slug && zhName(slug), types: m.types,
    hp: m.hp, spd: m.spd, pa: m.pa, sa: m.sa, df: m.df, sd: m.sd, ab: m.ab, primal: m.primal, orb: m.orb, oc: m.oc, wx: m.wx });
}
for (const [d, list] of Object.entries(man.mega2)) for (const m of list) {
  const slug = m.slug.startsWith('?') ? null : m.slug;
  add({ off: m.id, kind: m.name ? 'power' : 'mega', d: +d, slug, sfx: m.sfx, en: m.name || megaEn(+d, m.sfx, slug || ''), zhForm: slug && zhName(slug), types: m.types,
    hp: m.hp, spd: m.spd, pa: m.pa, sa: m.sa, df: m.df, sd: m.sd, ab: m.ab, wx: m.wx });
}
for (const id of Object.keys(man.meta).map(Number).filter(k => k >= 150000 && k < 200000)) {
  const d = id % 1000, g = man.gmax[d] || {};
  const rapid = id === 160892;
  add({ off: id, kind: 'gmax', d, slug: spEn(d).toLowerCase() + (rapid ? '-rapid-strike' : '') + '-gmax', en: 'Gigantamax ' + spEn(d) + (rapid ? ' Rapid Strike' : ''), gmax: g });
}
add({ off: 200890, kind: 'special', d: 890, slug: 'eternatus-eternamax', en: 'Eternatus Eternamax' });

for (const e of out) { e.spEs = e.spEs; e.spZh = spZh(e.d); e.spEn = spEn(e.d); }
fs.writeFileSync(path.join(__dirname, 'cache/official/map.json'), JSON.stringify(out, null, 1));
const by = {}; for (const e of out) { const k = e.kind + (e.isNew ? ' nuevas' : ' ya'); by[k] = (by[k] || 0) + 1; }
console.log(out.length, by);
const matched = new Set(out.filter(e => !e.isNew).map(e => e.ours));
console.log('nuestras sin pareja:', ours.filter(p => !matched.has(p.dex)).map(p => p.dex + ' ' + p.name).join(' | '));
