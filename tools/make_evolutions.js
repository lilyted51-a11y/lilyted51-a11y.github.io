/* make_evolutions.js — genera js/data/evolutions.js (a qué evoluciona cada Pokémon) (copia local, 16-11-2026)
 *
 *   node tools/make_evolutions.js [ruta a pokemon_species.csv]
 *
 * Datos: la tabla de especies de PokeAPI (https://github.com/PokeAPI/pokeapi,
 * data/v2/csv/pokemon_species.csv: id, identifier, ..., evolves_from_species_id).
 * Si no se da la ruta, se baja a tools/cache/pokemon_species.csv.
 * Sólo se apuntan las evoluciones que el juego tiene (están en G.DEX y con sprites).
 */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const cache = path.join(__dirname, 'cache', 'pokemon_species.csv');
const URL = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species.csv';

(async () => {
  let src = process.argv[2];
  if (!src) {
    if (!fs.existsSync(cache)) {
      fs.mkdirSync(path.dirname(cache), { recursive: true });
      const r = await fetch(URL);
      if (!r.ok) throw Error('no se pudo bajar la tabla de especies: ' + r.status);
      fs.writeFileSync(cache, await r.text());
    }
    src = cache;
  }
  const G = {};
  // eslint-disable-next-line no-eval
  eval(fs.readFileSync(path.join(root, 'js/data/pokedex.js'), 'utf8'));
  eval(fs.readFileSync(path.join(root, 'js/data/sprites-meta.js'), 'utf8'));
  const have = new Set(G.DEX.filter(p => p.dex <= 1025 && G.SPRITE_META[p.dex]).map(p => p.dex));
  const rows = fs.readFileSync(src, 'utf8').trim().split(/\r?\n/).slice(1).map(l => l.split(','));
  const evo = {};
  for (const r of rows) {
    const id = +r[0], from = +r[3];
    if (!from || !have.has(id) || !have.has(from)) continue;
    (evo[from] = evo[from] || []).push(id);
  }
  const keys = Object.keys(evo).map(Number).sort((a, b) => a - b);
  const body = keys.map(k => `  ${k}: [${evo[k].sort((a, b) => a - b).join(', ')}]`).join(',\n');
  const out = `/* ============ evolutions.js — GENERADO (tools/make_evolutions.js), no editar a mano ============
 * A qué evoluciona cada Pokémon: número de la Pokédex -> los de sus evoluciones
 * (Eevee tiene varias). Datos de PokeAPI; sólo las que el juego tiene.
 * Lo usa la evolución en plena partida (entities/player.js, systems/levelup.js).
 */
G.EVOS = {
${body}
};
`;
  fs.writeFileSync(path.join(root, 'js/data/evolutions.js'), out);
  console.log('ok:', keys.length, 'Pokémon con evolución,', keys.reduce((a, k) => a + evo[k].length, 0), 'evoluciones');
})().catch(e => { console.error(e.message); process.exit(1); });
