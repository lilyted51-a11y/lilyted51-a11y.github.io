/* ============ pokedex.js — GENERADO, no editar a mano ============
 * Lo produce tools/fetch_pokedex.py. Los datos se bajaron una vez de
 * PokeAPI y viven aqui: el juego no hace ninguna peticion a internet.
 *
 * hp/spd/atk son stats de juego derivados de los stats base.
 * pa/sa: daño de sus ataques físicos/especiales (atk = el mayor) · df/sd: Defensa y Defensa Especial base.
 * rarity 1-5 para el gacha · gen = generación (banner) · starter = test
 * leg = legendario o singular (sólo salen en las grietas)
 */
G.DEX = [
  {"dex":1,"name":"Bulbasaur","types":["grass","poison"],"hp":90,"spd":97,"atk":1.06,"pa":0.97,"sa":1.06,"df":49,"sd":65,"rarity":1,"bst":318,"starter":true,"gen":1},
  {"dex":2,"name":"Ivysaur","types":["grass","poison"],"hp":97,"spd":103,"atk":1.14,"pa":1.04,"sa":1.14,"df":63,"sd":80,"rarity":2,"bst":405,"starter":false,"gen":1},
  {"dex":3,"name":"Venusaur","types":["grass","poison"],"hp":106,"spd":112,"atk":1.25,"pa":1.15,"sa":1.25,"df":83,"sd":100,"rarity":4,"bst":525,"starter":false,"gen":1},
  {"dex":4,"name":"Charmander","types":["fire"],"hp":88,"spd":105,"atk":1.03,"pa":0.99,"sa":1.03,"df":43,"sd":50,"rarity":1,"bst":309,"starter":true,"gen":1},
  {"dex":5,"name":"Charmeleon","types":["fire"],"hp":96,"spd":112,"atk":1.14,"pa":1.05,"sa":1.14,"df":58,"sd":65,"rarity":2,"bst":405,"starter":false,"gen":1},
  {"dex":6,"name":"Charizard","types":["fire","flying"],"hp":105,"spd":120,"atk":1.3,"pa":1.16,"sa":1.3,"df":78,"sd":85,"rarity":4,"bst":534,"starter":false,"gen":1},
  {"dex":7,"name":"Squirtle","types":["water"],"hp":90,"spd":96,"atk":0.97,"pa":0.96,"sa":0.97,"df":65,"sd":64,"rarity":1,"bst":314,"starter":true,"gen":1},
  {"dex":8,"name":"Wartortle","types":["water"],"hp":97,"spd":102,"atk":1.06,"pa":1.05,"sa":1.06,"df":80,"sd":80,"rarity":2,"bst":405,"starter":false,"gen":1},
  {"dex":9,"name":"Blastoise","types":["water"],"hp":106,"spd":111,"atk":1.17,"pa":1.16,"sa":1.17,"df":100,"sd":105,"rarity":4,"bst":530,"starter":false,"gen":1},
  {"dex":10,"name":"Caterpie","types":["bug"],"hp":90,"spd":97,"atk":0.86,"pa":0.86,"sa":0.81,"df":35,"sd":20,"rarity":1,"bst":195,"starter":false,"gen":1},
  {"dex":11,"name":"Metapod","types":["bug"],"hp":92,"spd":91,"atk":0.84,"pa":0.81,"sa":0.84,"df":55,"sd":25,"rarity":1,"bst":205,"starter":false,"gen":1},
  {"dex":12,"name":"Butterfree","types":["bug","flying"],"hp":97,"spd":107,"atk":1.2,"pa":0.95,"sa":1.2,"df":50,"sd":80,"rarity":2,"bst":395,"starter":false,"gen":1},
  {"dex":13,"name":"Weedle","types":["bug","poison"],"hp":88,"spd":99,"atk":0.89,"pa":0.89,"sa":0.81,"df":30,"sd":20,"rarity":1,"bst":195,"starter":false,"gen":1},
  {"dex":14,"name":"Kakuna","types":["bug","poison"],"hp":90,"spd":93,"atk":0.84,"pa":0.84,"sa":0.84,"df":50,"sd":25,"rarity":1,"bst":205,"starter":false,"gen":1},
  {"dex":15,"name":"Beedrill","types":["bug","poison"],"hp":99,"spd":110,"atk":1.2,"pa":1.2,"sa":0.95,"df":40,"sd":80,"rarity":2,"bst":395,"starter":false,"gen":1},
  {"dex":16,"name":"Pidgey","types":["normal","flying"],"hp":88,"spd":102,"atk":0.95,"pa":0.95,"sa":0.89,"df":40,"sd":35,"rarity":1,"bst":251,"starter":false,"gen":1},
  {"dex":17,"name":"Pidgeotto","types":["normal","flying"],"hp":98,"spd":108,"atk":1.03,"pa":1.03,"sa":0.97,"df":55,"sd":50,"rarity":2,"bst":349,"starter":false,"gen":1},
  {"dex":18,"name":"Pidgeot","types":["normal","flying"],"hp":107,"spd":120,"atk":1.14,"pa":1.14,"sa":1.08,"df":75,"sd":70,"rarity":3,"bst":479,"starter":false,"gen":1},
  {"dex":19,"name":"Rattata","types":["normal"],"hp":84,"spd":108,"atk":1.01,"pa":1.01,"sa":0.84,"df":35,"sd":35,"rarity":1,"bst":253,"starter":false,"gen":1},
  {"dex":20,"name":"Raticate","types":["normal"],"hp":95,"spd":119,"atk":1.15,"pa":1.15,"sa":0.97,"df":60,"sd":70,"rarity":3,"bst":413,"starter":false,"gen":1},
  {"dex":21,"name":"Spearow","types":["normal","flying"],"hp":88,"spd":107,"atk":1.03,"pa":1.03,"sa":0.87,"df":30,"sd":31,"rarity":1,"bst":262,"starter":false,"gen":1},
  {"dex":22,"name":"Fearow","types":["normal","flying"],"hp":99,"spd":120,"atk":1.2,"pa":1.2,"sa":1.04,"df":65,"sd":61,"rarity":3,"bst":442,"starter":false,"gen":1},
  {"dex":23,"name":"Ekans","types":["poison"],"hp":86,"spd":101,"atk":1.03,"pa":1.03,"sa":0.92,"df":44,"sd":54,"rarity":1,"bst":288,"starter":false,"gen":1},
  {"dex":24,"name":"Arbok","types":["poison"],"hp":97,"spd":112,"atk":1.22,"pa":1.22,"sa":1.06,"df":69,"sd":79,"rarity":3,"bst":448,"starter":false,"gen":1},
  {"dex":25,"name":"Pikachu","types":["electric"],"hp":86,"spd":116,"atk":1,"pa":1,"sa":0.97,"df":40,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1},
  {"dex":26,"name":"Raichu","types":["electric"],"hp":97,"spd":124,"atk":1.2,"pa":1.2,"sa":1.2,"df":55,"sd":80,"rarity":3,"bst":485,"starter":false,"gen":1},
  {"dex":27,"name":"Sandshrew","types":["ground"],"hp":92,"spd":95,"atk":1.11,"pa":1.11,"sa":0.81,"df":85,"sd":30,"rarity":1,"bst":300,"starter":false,"gen":1},
  {"dex":28,"name":"Sandslash","types":["ground"],"hp":104,"spd":105,"atk":1.25,"pa":1.25,"sa":0.95,"df":110,"sd":55,"rarity":3,"bst":450,"starter":false,"gen":1},
  {"dex":29,"name":"Nidoran♀","types":["poison"],"hp":95,"spd":95,"atk":0.96,"pa":0.96,"sa":0.92,"df":52,"sd":40,"rarity":1,"bst":275,"starter":false,"gen":1},
  {"dex":30,"name":"Nidorina","types":["poison"],"hp":102,"spd":102,"atk":1.04,"pa":1.04,"sa":1,"df":67,"sd":55,"rarity":2,"bst":365,"starter":false,"gen":1},
  {"dex":31,"name":"Nidoqueen","types":["poison","ground"],"hp":110,"spd":110,"atk":1.21,"pa":1.21,"sa":1.11,"df":87,"sd":85,"rarity":4,"bst":505,"starter":false,"gen":1},
  {"dex":32,"name":"Nidoran♂","types":["poison"],"hp":91,"spd":99,"atk":1.01,"pa":1.01,"sa":0.92,"df":40,"sd":40,"rarity":1,"bst":273,"starter":false,"gen":1},
  {"dex":33,"name":"Nidorino","types":["poison"],"hp":97,"spd":105,"atk":1.1,"pa":1.1,"sa":1,"df":57,"sd":55,"rarity":2,"bst":365,"starter":false,"gen":1},
  {"dex":34,"name":"Nidoking","types":["poison","ground"],"hp":106,"spd":114,"atk":1.26,"pa":1.26,"sa":1.17,"df":77,"sd":75,"rarity":4,"bst":505,"starter":false,"gen":1},
  {"dex":35,"name":"Clefairy","types":["fairy"],"hp":102,"spd":93,"atk":1.03,"pa":0.95,"sa":1.03,"df":48,"sd":65,"rarity":2,"bst":323,"starter":false,"gen":1},
  {"dex":36,"name":"Clefable","types":["fairy"],"hp":113,"spd":103,"atk":1.22,"pa":1.08,"sa":1.22,"df":73,"sd":90,"rarity":3,"bst":483,"starter":false,"gen":1},
  {"dex":37,"name":"Vulpix","types":["fire"],"hp":87,"spd":105,"atk":0.97,"pa":0.93,"sa":0.97,"df":40,"sd":65,"rarity":1,"bst":299,"starter":false,"gen":1},
  {"dex":38,"name":"Ninetales","types":["fire"],"hp":103,"spd":120,"atk":1.15,"pa":1.12,"sa":1.15,"df":75,"sd":100,"rarity":4,"bst":505,"starter":false,"gen":1},
  {"dex":39,"name":"Jigglypuff","types":["normal","fairy"],"hp":122,"spd":86,"atk":0.95,"pa":0.95,"sa":0.95,"df":20,"sd":25,"rarity":1,"bst":270,"starter":false,"gen":1},
  {"dex":40,"name":"Wigglytuff","types":["normal","fairy"],"hp":133,"spd":97,"atk":1.17,"pa":1.08,"sa":1.17,"df":45,"sd":50,"rarity":3,"bst":435,"starter":false,"gen":1},
  {"dex":41,"name":"Zubat","types":["poison","flying"],"hp":88,"spd":101,"atk":0.95,"pa":0.95,"sa":0.86,"df":35,"sd":40,"rarity":1,"bst":245,"starter":false,"gen":1},
  {"dex":42,"name":"Golbat","types":["poison","flying"],"hp":104,"spd":116,"atk":1.14,"pa":1.14,"sa":1.06,"df":70,"sd":75,"rarity":3,"bst":455,"starter":false,"gen":1},
  {"dex":43,"name":"Oddish","types":["grass","poison"],"hp":90,"spd":91,"atk":1.11,"pa":0.97,"sa":1.11,"df":55,"sd":65,"rarity":2,"bst":320,"starter":false,"gen":1},
  {"dex":44,"name":"Gloom","types":["grass","poison"],"hp":97,"spd":95,"atk":1.17,"pa":1.06,"sa":1.17,"df":70,"sd":75,"rarity":2,"bst":395,"starter":false,"gen":1},
  {"dex":45,"name":"Vileplume","types":["grass","poison"],"hp":104,"spd":99,"atk":1.31,"pa":1.14,"sa":1.31,"df":85,"sd":90,"rarity":3,"bst":490,"starter":false,"gen":1},
  {"dex":46,"name":"Paras","types":["bug","grass"],"hp":86,"spd":88,"atk":1.08,"pa":1.08,"sa":0.95,"df":55,"sd":55,"rarity":1,"bst":285,"starter":false,"gen":1},
  {"dex":47,"name":"Parasect","types":["bug","grass"],"hp":97,"spd":91,"atk":1.22,"pa":1.22,"sa":1.03,"df":80,"sd":80,"rarity":2,"bst":405,"starter":false,"gen":1},
  {"dex":48,"name":"Venonat","types":["bug","poison"],"hp":97,"spd":97,"atk":1,"pa":1,"sa":0.92,"df":50,"sd":55,"rarity":1,"bst":305,"starter":false,"gen":1},
  {"dex":49,"name":"Venomoth","types":["bug","poison"],"hp":102,"spd":116,"atk":1.2,"pa":1.06,"sa":1.2,"df":60,"sd":75,"rarity":3,"bst":450,"starter":false,"gen":1},
  {"dex":50,"name":"Diglett","types":["ground"],"hp":74,"spd":118,"atk":1,"pa":1,"sa":0.89,"df":25,"sd":45,"rarity":1,"bst":265,"starter":false,"gen":1},
  {"dex":51,"name":"Dugtrio","types":["ground"],"hp":86,"spd":128,"atk":1.25,"pa":1.25,"sa":0.97,"df":50,"sd":70,"rarity":3,"bst":425,"starter":false,"gen":1},
  {"dex":52,"name":"Meowth","types":["normal"],"hp":88,"spd":116,"atk":0.95,"pa":0.95,"sa":0.92,"df":35,"sd":40,"rarity":1,"bst":290,"starter":false,"gen":1},
  {"dex":53,"name":"Persian","types":["normal"],"hp":99,"spd":126,"atk":1.08,"pa":1.08,"sa":1.06,"df":60,"sd":65,"rarity":3,"bst":440,"starter":false,"gen":1},
  {"dex":54,"name":"Psyduck","types":["water"],"hp":92,"spd":101,"atk":1.06,"pa":0.99,"sa":1.06,"df":48,"sd":50,"rarity":2,"bst":320,"starter":true,"gen":1},
  {"dex":55,"name":"Golduck","types":["water"],"hp":106,"spd":114,"atk":1.22,"pa":1.15,"sa":1.22,"df":78,"sd":80,"rarity":4,"bst":500,"starter":false,"gen":1},
  {"dex":56,"name":"Mankey","types":["fighting"],"hp":88,"spd":107,"atk":1.14,"pa":1.14,"sa":0.89,"df":35,"sd":45,"rarity":1,"bst":305,"starter":false,"gen":1},
  {"dex":57,"name":"Primeape","types":["fighting"],"hp":99,"spd":118,"atk":1.28,"pa":1.28,"sa":1.03,"df":60,"sd":70,"rarity":3,"bst":455,"starter":false,"gen":1},
  {"dex":58,"name":"Growlithe","types":["fire"],"hp":95,"spd":103,"atk":1.08,"pa":1.08,"sa":1.08,"df":45,"sd":50,"rarity":2,"bst":350,"starter":false,"gen":1},
  {"dex":59,"name":"Arcanine","types":["fire"],"hp":110,"spd":118,"atk":1.31,"pa":1.31,"sa":1.25,"df":80,"sd":80,"rarity":4,"bst":555,"starter":false,"gen":1},
  {"dex":60,"name":"Poliwag","types":["water"],"hp":88,"spd":116,"atk":0.97,"pa":0.97,"sa":0.92,"df":40,"sd":40,"rarity":1,"bst":300,"starter":false,"gen":1},
  {"dex":61,"name":"Poliwhirl","types":["water"],"hp":99,"spd":116,"atk":1.06,"pa":1.06,"sa":0.97,"df":65,"sd":50,"rarity":2,"bst":385,"starter":false,"gen":1},
  {"dex":62,"name":"Poliwrath","types":["water","fighting"],"hp":110,"spd":107,"atk":1.22,"pa":1.22,"sa":1.08,"df":95,"sd":90,"rarity":4,"bst":510,"starter":false,"gen":1},
  {"dex":63,"name":"Abra","types":["psychic"],"hp":81,"spd":116,"atk":1.28,"pa":0.81,"sa":1.28,"df":15,"sd":55,"rarity":1,"bst":310,"starter":false,"gen":1},
  {"dex":64,"name":"Kadabra","types":["psychic"],"hp":88,"spd":122,"atk":1.36,"pa":0.89,"sa":1.36,"df":30,"sd":70,"rarity":2,"bst":400,"starter":false,"gen":1},
  {"dex":65,"name":"Alakazam","types":["psychic"],"hp":95,"spd":128,"atk":1.44,"pa":0.97,"sa":1.44,"df":45,"sd":95,"rarity":4,"bst":500,"starter":false,"gen":1},
  {"dex":66,"name":"Machop","types":["fighting"],"hp":102,"spd":93,"atk":1.14,"pa":1.14,"sa":0.89,"df":50,"sd":35,"rarity":1,"bst":305,"starter":false,"gen":1},
  {"dex":67,"name":"Machoke","types":["fighting"],"hp":106,"spd":97,"atk":1.25,"pa":1.25,"sa":0.97,"df":70,"sd":60,"rarity":2,"bst":405,"starter":false,"gen":1},
  {"dex":68,"name":"Machamp","types":["fighting"],"hp":110,"spd":101,"atk":1.42,"pa":1.42,"sa":1.06,"df":80,"sd":85,"rarity":4,"bst":505,"starter":false,"gen":1},
  {"dex":69,"name":"Bellsprout","types":["grass","poison"],"hp":92,"spd":95,"atk":1.11,"pa":1.11,"sa":1.08,"df":35,"sd":30,"rarity":1,"bst":300,"starter":false,"gen":1},
  {"dex":70,"name":"Weepinbell","types":["grass","poison"],"hp":99,"spd":101,"atk":1.2,"pa":1.2,"sa":1.17,"df":50,"sd":45,"rarity":2,"bst":390,"starter":false,"gen":1},
  {"dex":71,"name":"Victreebel","types":["grass","poison"],"hp":106,"spd":107,"atk":1.28,"pa":1.28,"sa":1.25,"df":65,"sd":70,"rarity":3,"bst":490,"starter":false,"gen":1},
  {"dex":72,"name":"Tentacool","types":["water","poison"],"hp":88,"spd":107,"atk":0.97,"pa":0.92,"sa":0.97,"df":35,"sd":100,"rarity":2,"bst":335,"starter":false,"gen":1},
  {"dex":73,"name":"Tentacruel","types":["water","poison"],"hp":106,"spd":120,"atk":1.14,"pa":1.08,"sa":1.14,"df":65,"sd":120,"rarity":4,"bst":515,"starter":false,"gen":1},
  {"dex":74,"name":"Geodude","types":["rock","ground"],"hp":88,"spd":86,"atk":1.14,"pa":1.14,"sa":0.86,"df":100,"sd":30,"rarity":1,"bst":300,"starter":false,"gen":1},
  {"dex":75,"name":"Graveler","types":["rock","ground"],"hp":95,"spd":93,"atk":1.22,"pa":1.22,"sa":0.95,"df":115,"sd":45,"rarity":2,"bst":390,"starter":false,"gen":1},
  {"dex":76,"name":"Golem","types":["rock","ground"],"hp":106,"spd":97,"atk":1.36,"pa":1.36,"sa":1,"df":130,"sd":65,"rarity":4,"bst":495,"starter":false,"gen":1},
  {"dex":77,"name":"Ponyta","types":["fire"],"hp":92,"spd":116,"atk":1.17,"pa":1.17,"sa":1.06,"df":55,"sd":65,"rarity":3,"bst":410,"starter":false,"gen":1},
  {"dex":78,"name":"Rapidash","types":["fire"],"hp":99,"spd":122,"atk":1.25,"pa":1.25,"sa":1.14,"df":70,"sd":80,"rarity":4,"bst":500,"starter":false,"gen":1},
  {"dex":79,"name":"Slowpoke","types":["water","psychic"],"hp":110,"spd":84,"atk":1.06,"pa":1.06,"sa":0.92,"df":65,"sd":40,"rarity":1,"bst":315,"starter":true,"gen":1},
  {"dex":80,"name":"Slowbro","types":["water","psychic"],"hp":113,"spd":91,"atk":1.25,"pa":1.11,"sa":1.25,"df":110,"sd":80,"rarity":3,"bst":490,"starter":false,"gen":1},
  {"dex":81,"name":"Magnemite","types":["electric","steel"],"hp":81,"spd":97,"atk":1.22,"pa":0.89,"sa":1.22,"df":70,"sd":55,"rarity":2,"bst":325,"starter":false,"gen":1},
  {"dex":82,"name":"Magneton","types":["electric","steel"],"hp":92,"spd":107,"atk":1.36,"pa":1.03,"sa":1.36,"df":95,"sd":70,"rarity":3,"bst":465,"starter":false,"gen":1},
  {"dex":83,"name":"Farfetch’d","types":["normal","flying"],"hp":93,"spd":103,"atk":1.2,"pa":1.2,"sa":1.02,"df":55,"sd":62,"rarity":2,"bst":377,"starter":false,"gen":1},
  {"dex":84,"name":"Doduo","types":["normal","flying"],"hp":86,"spd":110,"atk":1.17,"pa":1.17,"sa":0.89,"df":45,"sd":35,"rarity":1,"bst":310,"starter":false,"gen":1},
  {"dex":85,"name":"Dodrio","types":["normal","flying"],"hp":97,"spd":124,"atk":1.31,"pa":1.31,"sa":1.03,"df":70,"sd":60,"rarity":3,"bst":470,"starter":false,"gen":1},
  {"dex":86,"name":"Seel","types":["water"],"hp":99,"spd":97,"atk":0.95,"pa":0.95,"sa":0.95,"df":55,"sd":70,"rarity":2,"bst":325,"starter":false,"gen":1},
  {"dex":87,"name":"Dewgong","types":["water","ice"],"hp":110,"spd":107,"atk":1.08,"pa":1.08,"sa":1.08,"df":80,"sd":95,"rarity":3,"bst":475,"starter":false,"gen":1},
  {"dex":88,"name":"Grimer","types":["poison"],"hp":106,"spd":88,"atk":1.14,"pa":1.14,"sa":0.92,"df":50,"sd":50,"rarity":2,"bst":325,"starter":false,"gen":1},
  {"dex":89,"name":"Muk","types":["poison"],"hp":117,"spd":99,"atk":1.28,"pa":1.28,"sa":1.06,"df":75,"sd":100,"rarity":4,"bst":500,"starter":false,"gen":1},
  {"dex":90,"name":"Shellder","types":["water"],"hp":84,"spd":95,"atk":1.06,"pa":1.06,"sa":0.95,"df":100,"sd":25,"rarity":1,"bst":305,"starter":false,"gen":1},
  {"dex":91,"name":"Cloyster","types":["water","ice"],"hp":92,"spd":107,"atk":1.22,"pa":1.22,"sa":1.17,"df":180,"sd":45,"rarity":4,"bst":525,"starter":false,"gen":1},
  {"dex":92,"name":"Gastly","types":["ghost","poison"],"hp":84,"spd":112,"atk":1.25,"pa":0.89,"sa":1.25,"df":30,"sd":35,"rarity":1,"bst":310,"starter":false,"gen":1},
  {"dex":93,"name":"Haunter","types":["ghost","poison"],"hp":90,"spd":118,"atk":1.33,"pa":0.97,"sa":1.33,"df":45,"sd":55,"rarity":2,"bst":405,"starter":false,"gen":1},
  {"dex":94,"name":"Gengar","types":["ghost","poison"],"hp":97,"spd":124,"atk":1.42,"pa":1.06,"sa":1.42,"df":60,"sd":75,"rarity":4,"bst":500,"starter":false,"gen":1},
  {"dex":95,"name":"Onix","types":["rock","ground"],"hp":86,"spd":107,"atk":0.95,"pa":0.95,"sa":0.86,"df":160,"sd":45,"rarity":2,"bst":385,"starter":false,"gen":1},
  {"dex":96,"name":"Drowzee","types":["psychic"],"hp":97,"spd":96,"atk":0.96,"pa":0.96,"sa":0.94,"df":45,"sd":90,"rarity":2,"bst":328,"starter":false,"gen":1},
  {"dex":97,"name":"Hypno","types":["psychic"],"hp":108,"spd":106,"atk":1.1,"pa":1.1,"sa":1.1,"df":70,"sd":115,"rarity":3,"bst":483,"starter":false,"gen":1},
  {"dex":98,"name":"Krabby","types":["water"],"hp":84,"spd":99,"atk":1.28,"pa":1.28,"sa":0.84,"df":90,"sd":25,"rarity":2,"bst":325,"starter":false,"gen":1},
  {"dex":99,"name":"Kingler","types":["water"],"hp":95,"spd":110,"atk":1.42,"pa":1.42,"sa":0.97,"df":115,"sd":50,"rarity":3,"bst":475,"starter":false,"gen":1},
  {"dex":100,"name":"Voltorb","types":["electric"],"hp":88,"spd":120,"atk":1,"pa":0.86,"sa":1,"df":50,"sd":55,"rarity":2,"bst":330,"starter":false,"gen":1},
  {"dex":101,"name":"Electrode","types":["electric"],"hp":97,"spd":141,"atk":1.14,"pa":0.97,"sa":1.14,"df":70,"sd":80,"rarity":3,"bst":490,"starter":false,"gen":1},
  {"dex":102,"name":"Exeggcute","types":["grass","psychic"],"hp":97,"spd":95,"atk":1.03,"pa":0.92,"sa":1.03,"df":80,"sd":45,"rarity":2,"bst":325,"starter":false,"gen":1},
  {"dex":103,"name":"Exeggutor","types":["grass","psychic"],"hp":113,"spd":101,"atk":1.39,"pa":1.22,"sa":1.39,"df":85,"sd":75,"rarity":4,"bst":530,"starter":false,"gen":1},
  {"dex":104,"name":"Cubone","types":["ground"],"hp":92,"spd":93,"atk":0.97,"pa":0.97,"sa":0.92,"df":95,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1},
  {"dex":105,"name":"Marowak","types":["ground"],"hp":97,"spd":97,"atk":1.14,"pa":1.14,"sa":0.97,"df":110,"sd":80,"rarity":3,"bst":425,"starter":false,"gen":1},
  {"dex":106,"name":"Hitmonlee","types":["fighting"],"hp":92,"spd":115,"atk":1.36,"pa":1.36,"sa":0.89,"df":53,"sd":110,"rarity":3,"bst":455,"starter":false,"gen":1},
  {"dex":107,"name":"Hitmonchan","types":["fighting"],"hp":92,"spd":110,"atk":1.28,"pa":1.28,"sa":0.89,"df":79,"sd":110,"rarity":3,"bst":455,"starter":false,"gen":1},
  {"dex":108,"name":"Lickitung","types":["normal"],"hp":110,"spd":91,"atk":1.03,"pa":1,"sa":1.03,"df":75,"sd":75,"rarity":2,"bst":385,"starter":false,"gen":1},
  {"dex":109,"name":"Koffing","types":["poison"],"hp":88,"spd":93,"atk":1.06,"pa":1.06,"sa":1.03,"df":95,"sd":45,"rarity":2,"bst":340,"starter":false,"gen":1},
  {"dex":110,"name":"Weezing","types":["poison"],"hp":99,"spd":103,"atk":1.2,"pa":1.2,"sa":1.17,"df":120,"sd":70,"rarity":3,"bst":490,"starter":false,"gen":1},
  {"dex":111,"name":"Rhyhorn","types":["ground","rock"],"hp":106,"spd":88,"atk":1.17,"pa":1.17,"sa":0.86,"df":95,"sd":30,"rarity":2,"bst":345,"starter":false,"gen":1},
  {"dex":112,"name":"Rhydon","types":["ground","rock"],"hp":117,"spd":95,"atk":1.42,"pa":1.42,"sa":0.95,"df":120,"sd":45,"rarity":3,"bst":485,"starter":false,"gen":1},
  {"dex":113,"name":"Chansey","types":["normal"],"hp":182,"spd":99,"atk":0.89,"pa":0.73,"sa":0.89,"df":5,"sd":105,"rarity":3,"bst":450,"starter":false,"gen":1},
  {"dex":114,"name":"Tangela","types":["grass"],"hp":99,"spd":103,"atk":1.25,"pa":1,"sa":1.25,"df":115,"sd":40,"rarity":3,"bst":435,"starter":false,"gen":1},
  {"dex":115,"name":"Kangaskhan","types":["normal"],"hp":117,"spd":116,"atk":1.22,"pa":1.22,"sa":0.92,"df":80,"sd":80,"rarity":3,"bst":490,"starter":false,"gen":1},
  {"dex":116,"name":"Horsea","types":["water"],"hp":84,"spd":103,"atk":1.08,"pa":0.92,"sa":1.08,"df":70,"sd":25,"rarity":1,"bst":295,"starter":false,"gen":1},
  {"dex":117,"name":"Seadra","types":["water"],"hp":95,"spd":114,"atk":1.22,"pa":1.06,"sa":1.22,"df":95,"sd":45,"rarity":3,"bst":440,"starter":false,"gen":1},
  {"dex":118,"name":"Goldeen","types":["water"],"hp":90,"spd":104,"atk":1.07,"pa":1.07,"sa":0.89,"df":60,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1},
  {"dex":119,"name":"Seaking","types":["water"],"hp":106,"spd":107,"atk":1.21,"pa":1.21,"sa":1.06,"df":65,"sd":80,"rarity":3,"bst":450,"starter":false,"gen":1},
  {"dex":120,"name":"Staryu","types":["water"],"hp":84,"spd":114,"atk":1.08,"pa":0.95,"sa":1.08,"df":55,"sd":55,"rarity":2,"bst":340,"starter":false,"gen":1},
  {"dex":121,"name":"Starmie","types":["water","psychic"],"hp":97,"spd":126,"atk":1.25,"pa":1.11,"sa":1.25,"df":85,"sd":85,"rarity":4,"bst":520,"starter":false,"gen":1},
  {"dex":122,"name":"Mr. Mime","types":["psychic","fairy"],"hp":88,"spd":116,"atk":1.25,"pa":0.95,"sa":1.25,"df":65,"sd":120,"rarity":3,"bst":460,"starter":false,"gen":1},
  {"dex":123,"name":"Scyther","types":["bug","flying"],"hp":102,"spd":122,"atk":1.31,"pa":1.31,"sa":1,"df":80,"sd":80,"rarity":4,"bst":500,"starter":false,"gen":1},
  {"dex":124,"name":"Jynx","types":["ice","psychic"],"hp":99,"spd":118,"atk":1.33,"pa":0.97,"sa":1.33,"df":35,"sd":95,"rarity":3,"bst":455,"starter":false,"gen":1},
  {"dex":125,"name":"Electabuzz","types":["electric"],"hp":99,"spd":122,"atk":1.22,"pa":1.16,"sa":1.22,"df":57,"sd":85,"rarity":3,"bst":490,"starter":false,"gen":1},
  {"dex":126,"name":"Magmar","types":["fire"],"hp":99,"spd":117,"atk":1.25,"pa":1.22,"sa":1.25,"df":57,"sd":85,"rarity":4,"bst":495,"starter":false,"gen":1},
  {"dex":127,"name":"Pinsir","types":["bug"],"hp":99,"spd":114,"atk":1.39,"pa":1.39,"sa":1,"df":100,"sd":70,"rarity":4,"bst":500,"starter":false,"gen":1},
  {"dex":128,"name":"Tauros","types":["normal"],"hp":104,"spd":124,"atk":1.25,"pa":1.25,"sa":0.92,"df":95,"sd":70,"rarity":3,"bst":490,"starter":false,"gen":1},
  {"dex":129,"name":"Magikarp","types":["water"],"hp":79,"spd":112,"atk":0.78,"pa":0.76,"sa":0.78,"df":55,"sd":20,"rarity":1,"bst":200,"starter":false,"gen":1},
  {"dex":130,"name":"Gyarados","types":["water","flying"],"hp":113,"spd":112,"atk":1.39,"pa":1.39,"sa":1.03,"df":79,"sd":100,"rarity":4,"bst":540,"starter":false,"gen":1},
  {"dex":131,"name":"Lapras","types":["water","ice"],"hp":128,"spd":103,"atk":1.17,"pa":1.17,"sa":1.17,"df":80,"sd":95,"rarity":4,"bst":535,"starter":false,"gen":1},
  {"dex":132,"name":"Ditto","types":["normal"],"hp":92,"spd":98,"atk":0.96,"pa":0.96,"sa":0.96,"df":48,"sd":48,"rarity":1,"bst":288,"starter":false,"gen":1},
  {"dex":133,"name":"Eevee","types":["normal"],"hp":95,"spd":101,"atk":1,"pa":1,"sa":0.95,"df":50,"sd":65,"rarity":2,"bst":325,"starter":false,"gen":1},
  {"dex":134,"name":"Vaporeon","types":["water"],"hp":128,"spd":105,"atk":1.31,"pa":1.06,"sa":1.31,"df":60,"sd":95,"rarity":4,"bst":525,"starter":false,"gen":1},
  {"dex":135,"name":"Jolteon","types":["electric"],"hp":99,"spd":133,"atk":1.31,"pa":1.06,"sa":1.31,"df":60,"sd":95,"rarity":4,"bst":525,"starter":false,"gen":1},
  {"dex":136,"name":"Flareon","types":["fire"],"hp":99,"spd":105,"atk":1.42,"pa":1.42,"sa":1.22,"df":60,"sd":110,"rarity":4,"bst":525,"starter":false,"gen":1},
  {"dex":137,"name":"Porygon","types":["normal"],"hp":99,"spd":95,"atk":1.17,"pa":1.03,"sa":1.17,"df":70,"sd":75,"rarity":2,"bst":395,"starter":false,"gen":1},
  {"dex":138,"name":"Omanyte","types":["rock","water"],"hp":86,"spd":93,"atk":1.2,"pa":0.92,"sa":1.2,"df":100,"sd":55,"rarity":2,"bst":355,"starter":false,"gen":1},
  {"dex":139,"name":"Omastar","types":["rock","water"],"hp":102,"spd":101,"atk":1.33,"pa":1.03,"sa":1.33,"df":125,"sd":70,"rarity":4,"bst":495,"starter":false,"gen":1},
  {"dex":140,"name":"Kabuto","types":["rock","water"],"hp":84,"spd":101,"atk":1.14,"pa":1.14,"sa":1,"df":90,"sd":45,"rarity":2,"bst":355,"starter":false,"gen":1},
  {"dex":141,"name":"Kabutops","types":["rock","water"],"hp":97,"spd":112,"atk":1.33,"pa":1.33,"sa":1.06,"df":105,"sd":70,"rarity":4,"bst":495,"starter":false,"gen":1},
  {"dex":142,"name":"Aerodactyl","types":["rock","flying"],"hp":106,"spd":133,"atk":1.28,"pa":1.28,"sa":1.03,"df":65,"sd":75,"rarity":4,"bst":515,"starter":false,"gen":1},
  {"dex":143,"name":"Snorlax","types":["normal"],"hp":142,"spd":91,"atk":1.31,"pa":1.31,"sa":1.06,"df":65,"sd":110,"rarity":4,"bst":540,"starter":false,"gen":1},
  {"dex":144,"name":"Articuno","types":["ice","flying"],"hp":110,"spd":114,"atk":1.22,"pa":1.17,"sa":1.22,"df":100,"sd":125,"rarity":5,"bst":580,"starter":false,"gen":1,"leg":true},
  {"dex":145,"name":"Zapdos","types":["electric","flying"],"hp":110,"spd":120,"atk":1.39,"pa":1.2,"sa":1.39,"df":85,"sd":90,"rarity":5,"bst":580,"starter":false,"gen":1,"leg":true},
  {"dex":146,"name":"Moltres","types":["fire","flying"],"hp":110,"spd":116,"atk":1.39,"pa":1.25,"sa":1.39,"df":90,"sd":85,"rarity":5,"bst":580,"starter":false,"gen":1,"leg":true},
  {"dex":147,"name":"Dratini","types":["dragon"],"hp":88,"spd":99,"atk":1.05,"pa":1.05,"sa":0.97,"df":45,"sd":50,"rarity":1,"bst":300,"starter":false,"gen":1},
  {"dex":148,"name":"Dragonair","types":["dragon"],"hp":97,"spd":107,"atk":1.16,"pa":1.16,"sa":1.08,"df":65,"sd":70,"rarity":3,"bst":420,"starter":false,"gen":1},
  {"dex":149,"name":"Dragonite","types":["dragon","flying"],"hp":111,"spd":112,"atk":1.44,"pa":1.44,"sa":1.25,"df":95,"sd":100,"rarity":5,"bst":600,"starter":false,"gen":1},
  {"dex":150,"name":"Mewtwo","types":["psychic"],"hp":118,"spd":133,"atk":1.55,"pa":1.31,"sa":1.55,"df":90,"sd":90,"rarity":5,"bst":680,"starter":false,"gen":1,"leg":true},
  {"dex":151,"name":"Mew","types":["psychic"],"hp":115,"spd":120,"atk":1.25,"pa":1.25,"sa":1.25,"df":100,"sd":100,"rarity":5,"bst":600,"starter":false,"gen":1,"leg":true},
  {"dex":152,"name":"Chikorita","types":["grass"],"hp":90,"spd":97,"atk":0.97,"pa":0.97,"sa":0.97,"df":65,"sd":65,"rarity":1,"bst":318,"starter":true,"gen":2},
  {"dex":153,"name":"Bayleef","types":["grass"],"hp":97,"spd":103,"atk":1.05,"pa":1.04,"sa":1.05,"df":80,"sd":80,"rarity":2,"bst":405,"starter":false,"gen":2},
  {"dex":154,"name":"Meganium","types":["grass"],"hp":106,"spd":112,"atk":1.16,"pa":1.15,"sa":1.16,"df":100,"sd":100,"rarity":4,"bst":525,"starter":false,"gen":2},
  {"dex":155,"name":"Cyndaquil","types":["fire"],"hp":88,"spd":105,"atk":1.03,"pa":0.99,"sa":1.03,"df":43,"sd":50,"rarity":1,"bst":309,"starter":true,"gen":2},
  {"dex":156,"name":"Quilava","types":["fire"],"hp":96,"spd":112,"atk":1.14,"pa":1.05,"sa":1.14,"df":58,"sd":65,"rarity":2,"bst":405,"starter":false,"gen":2},
  {"dex":157,"name":"Typhlosion","types":["fire"],"hp":105,"spd":120,"atk":1.3,"pa":1.16,"sa":1.3,"df":78,"sd":85,"rarity":4,"bst":534,"starter":false,"gen":2},
  {"dex":158,"name":"Totodile","types":["water"],"hp":92,"spd":96,"atk":1.06,"pa":1.06,"sa":0.94,"df":64,"sd":48,"rarity":1,"bst":314,"starter":true,"gen":2},
  {"dex":159,"name":"Croconaw","types":["water"],"hp":99,"spd":102,"atk":1.14,"pa":1.14,"sa":1.02,"df":80,"sd":63,"rarity":2,"bst":405,"starter":false,"gen":2},
  {"dex":160,"name":"Feraligatr","types":["water"],"hp":108,"spd":111,"atk":1.28,"pa":1.28,"sa":1.13,"df":100,"sd":83,"rarity":4,"bst":530,"starter":false,"gen":2},
  {"dex":161,"name":"Sentret","types":["normal"],"hp":86,"spd":86,"atk":0.95,"pa":0.95,"sa":0.89,"df":34,"sd":45,"rarity":1,"bst":215,"starter":false,"gen":2},
  {"dex":162,"name":"Furret","types":["normal"],"hp":108,"spd":116,"atk":1.12,"pa":1.12,"sa":0.95,"df":64,"sd":55,"rarity":3,"bst":415,"starter":false,"gen":2},
  {"dex":163,"name":"Hoothoot","types":["normal","flying"],"hp":97,"spd":99,"atk":0.9,"pa":0.86,"sa":0.9,"df":30,"sd":56,"rarity":1,"bst":262,"starter":false,"gen":2},
  {"dex":164,"name":"Noctowl","types":["normal","flying"],"hp":115,"spd":107,"atk":1.17,"pa":0.97,"sa":1.17,"df":50,"sd":96,"rarity":3,"bst":452,"starter":false,"gen":2},
  {"dex":165,"name":"Ledyba","types":["bug","flying"],"hp":88,"spd":101,"atk":0.92,"pa":0.81,"sa":0.92,"df":30,"sd":80,"rarity":1,"bst":265,"starter":false,"gen":2},
  {"dex":166,"name":"Ledian","types":["bug","flying"],"hp":95,"spd":114,"atk":1,"pa":0.89,"sa":1,"df":50,"sd":110,"rarity":2,"bst":390,"starter":false,"gen":2},
  {"dex":167,"name":"Spinarak","types":["bug","poison"],"hp":88,"spd":91,"atk":1.03,"pa":1.03,"sa":0.92,"df":40,"sd":40,"rarity":1,"bst":250,"starter":false,"gen":2},
  {"dex":168,"name":"Ariados","types":["bug","poison"],"hp":102,"spd":95,"atk":1.2,"pa":1.2,"sa":1.03,"df":70,"sd":70,"rarity":2,"bst":400,"starter":false,"gen":2},
  {"dex":169,"name":"Crobat","types":["poison","flying"],"hp":108,"spd":133,"atk":1.2,"pa":1.2,"sa":1.08,"df":80,"sd":80,"rarity":4,"bst":535,"starter":false,"gen":2},
  {"dex":170,"name":"Chinchou","types":["water","electric"],"hp":104,"spd":106,"atk":1.01,"pa":0.91,"sa":1.01,"df":38,"sd":56,"rarity":2,"bst":330,"starter":false,"gen":2},
  {"dex":171,"name":"Lanturn","types":["water","electric"],"hp":126,"spd":106,"atk":1.12,"pa":1.02,"sa":1.12,"df":58,"sd":76,"rarity":3,"bst":460,"starter":false,"gen":2},
  {"dex":172,"name":"Pichu","types":["electric"],"hp":79,"spd":103,"atk":0.92,"pa":0.92,"sa":0.89,"df":15,"sd":35,"rarity":1,"bst":205,"starter":false,"gen":2},
  {"dex":173,"name":"Cleffa","types":["fairy"],"hp":92,"spd":84,"atk":0.95,"pa":0.84,"sa":0.95,"df":28,"sd":55,"rarity":1,"bst":218,"starter":false,"gen":2},
  {"dex":174,"name":"Igglybuff","types":["normal","fairy"],"hp":110,"spd":84,"atk":0.92,"pa":0.86,"sa":0.92,"df":15,"sd":20,"rarity":1,"bst":210,"starter":false,"gen":2},
  {"dex":175,"name":"Togepi","types":["fairy"],"hp":86,"spd":86,"atk":0.92,"pa":0.81,"sa":0.92,"df":65,"sd":65,"rarity":1,"bst":245,"starter":false,"gen":2},
  {"dex":176,"name":"Togetic","types":["fairy","flying"],"hp":95,"spd":95,"atk":1.14,"pa":0.92,"sa":1.14,"df":85,"sd":105,"rarity":2,"bst":405,"starter":false,"gen":2},
  {"dex":177,"name":"Natu","types":["psychic","flying"],"hp":88,"spd":107,"atk":1.08,"pa":0.97,"sa":1.08,"df":45,"sd":45,"rarity":2,"bst":320,"starter":false,"gen":2},
  {"dex":178,"name":"Xatu","types":["psychic","flying"],"hp":99,"spd":118,"atk":1.22,"pa":1.11,"sa":1.22,"df":70,"sd":70,"rarity":3,"bst":470,"starter":false,"gen":2},
  {"dex":179,"name":"Mareep","types":["electric"],"hp":95,"spd":93,"atk":1.06,"pa":0.92,"sa":1.06,"df":40,"sd":45,"rarity":1,"bst":280,"starter":false,"gen":2},
  {"dex":180,"name":"Flaaffy","types":["electric"],"hp":102,"spd":97,"atk":1.14,"pa":1,"sa":1.14,"df":55,"sd":60,"rarity":2,"bst":365,"starter":false,"gen":2},
  {"dex":181,"name":"Ampharos","types":["electric"],"hp":110,"spd":101,"atk":1.33,"pa":1.11,"sa":1.33,"df":85,"sd":90,"rarity":4,"bst":510,"starter":false,"gen":2},
  {"dex":182,"name":"Bellossom","types":["grass"],"hp":104,"spd":99,"atk":1.2,"pa":1.14,"sa":1.2,"df":95,"sd":100,"rarity":3,"bst":490,"starter":false,"gen":2},
  {"dex":183,"name":"Marill","types":["water","fairy"],"hp":102,"spd":95,"atk":0.81,"pa":0.81,"sa":0.81,"df":50,"sd":50,"rarity":1,"bst":250,"starter":false,"gen":2},
  {"dex":184,"name":"Azumarill","types":["water","fairy"],"hp":115,"spd":99,"atk":1.03,"pa":0.97,"sa":1.03,"df":80,"sd":80,"rarity":3,"bst":420,"starter":false,"gen":2},
  {"dex":185,"name":"Sudowoodo","types":["rock"],"hp":102,"spd":91,"atk":1.25,"pa":1.25,"sa":0.86,"df":115,"sd":65,"rarity":3,"bst":410,"starter":false,"gen":2},
  {"dex":186,"name":"Politoed","types":["water"],"hp":110,"spd":107,"atk":1.2,"pa":1.11,"sa":1.2,"df":75,"sd":100,"rarity":4,"bst":500,"starter":false,"gen":2},
  {"dex":187,"name":"Hoppip","types":["grass","flying"],"hp":86,"spd":99,"atk":0.89,"pa":0.89,"sa":0.89,"df":40,"sd":55,"rarity":1,"bst":250,"starter":false,"gen":2},
  {"dex":188,"name":"Skiploom","types":["grass","flying"],"hp":95,"spd":112,"atk":0.95,"pa":0.95,"sa":0.95,"df":50,"sd":65,"rarity":2,"bst":340,"starter":false,"gen":2},
  {"dex":189,"name":"Jumpluff","types":["grass","flying"],"hp":104,"spd":124,"atk":1,"pa":1,"sa":1,"df":70,"sd":95,"rarity":3,"bst":460,"starter":false,"gen":2},
  {"dex":190,"name":"Aipom","types":["normal"],"hp":95,"spd":114,"atk":1.08,"pa":1.08,"sa":0.92,"df":55,"sd":55,"rarity":2,"bst":360,"starter":false,"gen":2},
  {"dex":191,"name":"Sunkern","types":["grass"],"hp":84,"spd":91,"atk":0.86,"pa":0.86,"sa":0.86,"df":30,"sd":30,"rarity":1,"bst":180,"starter":false,"gen":2},
  {"dex":192,"name":"Sunflora","types":["grass"],"hp":104,"spd":91,"atk":1.28,"pa":1.11,"sa":1.28,"df":55,"sd":85,"rarity":3,"bst":425,"starter":false,"gen":2},
  {"dex":193,"name":"Yanma","types":["bug","flying"],"hp":99,"spd":118,"atk":1.11,"pa":1.06,"sa":1.11,"df":45,"sd":45,"rarity":2,"bst":390,"starter":false,"gen":2},
  {"dex":194,"name":"Wooper","types":["water","ground"],"hp":95,"spd":84,"atk":0.95,"pa":0.95,"sa":0.84,"df":45,"sd":25,"rarity":1,"bst":210,"starter":false,"gen":2},
  {"dex":195,"name":"Quagsire","types":["water","ground"],"hp":113,"spd":93,"atk":1.17,"pa":1.17,"sa":1.06,"df":85,"sd":65,"rarity":3,"bst":430,"starter":false,"gen":2},
  {"dex":196,"name":"Espeon","types":["psychic"],"hp":99,"spd":124,"atk":1.42,"pa":1.06,"sa":1.42,"df":60,"sd":95,"rarity":4,"bst":525,"starter":false,"gen":2},
  {"dex":197,"name":"Umbreon","types":["dark"],"hp":113,"spd":105,"atk":1.06,"pa":1.06,"sa":1.03,"df":110,"sd":130,"rarity":4,"bst":525,"starter":false,"gen":2},
  {"dex":198,"name":"Murkrow","types":["dark","flying"],"hp":97,"spd":116,"atk":1.17,"pa":1.17,"sa":1.17,"df":42,"sd":42,"rarity":2,"bst":405,"starter":false,"gen":2},
  {"dex":199,"name":"Slowking","types":["water","psychic"],"hp":113,"spd":91,"atk":1.25,"pa":1.11,"sa":1.25,"df":80,"sd":110,"rarity":3,"bst":490,"starter":false,"gen":2},
  {"dex":200,"name":"Misdreavus","types":["ghost"],"hp":97,"spd":114,"atk":1.17,"pa":1.03,"sa":1.17,"df":60,"sd":85,"rarity":3,"bst":435,"starter":false,"gen":2},
  {"dex":201,"name":"Unown","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2},
  {"dex":202,"name":"Wobbuffet","types":["psychic"],"hp":156,"spd":92,"atk":0.88,"pa":0.88,"sa":0.88,"df":58,"sd":58,"rarity":2,"bst":405,"starter":false,"gen":2},
  {"dex":203,"name":"Girafarig","types":["normal","psychic"],"hp":102,"spd":114,"atk":1.2,"pa":1.14,"sa":1.2,"df":65,"sd":65,"rarity":3,"bst":455,"starter":false,"gen":2},
  {"dex":204,"name":"Pineco","types":["bug"],"hp":92,"spd":84,"atk":1.06,"pa":1.06,"sa":0.89,"df":90,"sd":35,"rarity":1,"bst":290,"starter":false,"gen":2},
  {"dex":205,"name":"Forretress","types":["bug","steel"],"hp":104,"spd":95,"atk":1.2,"pa":1.2,"sa":1.03,"df":140,"sd":60,"rarity":3,"bst":465,"starter":false,"gen":2},
  {"dex":206,"name":"Dunsparce","types":["normal"],"hp":115,"spd":97,"atk":1.08,"pa":1.08,"sa":1.06,"df":70,"sd":65,"rarity":3,"bst":415,"starter":false,"gen":2},
  {"dex":207,"name":"Gligar","types":["ground","flying"],"hp":99,"spd":114,"atk":1.11,"pa":1.11,"sa":0.89,"df":105,"sd":65,"rarity":3,"bst":430,"starter":false,"gen":2},
  {"dex":208,"name":"Steelix","types":["steel","ground"],"hp":104,"spd":91,"atk":1.17,"pa":1.17,"sa":1,"df":200,"sd":65,"rarity":4,"bst":510,"starter":false,"gen":2},
  {"dex":209,"name":"Snubbull","types":["fairy"],"hp":97,"spd":91,"atk":1.14,"pa":1.14,"sa":0.92,"df":50,"sd":40,"rarity":1,"bst":300,"starter":false,"gen":2},
  {"dex":210,"name":"Granbull","types":["fairy"],"hp":110,"spd":97,"atk":1.36,"pa":1.36,"sa":1.03,"df":75,"sd":60,"rarity":3,"bst":450,"starter":false,"gen":2},
  {"dex":211,"name":"Qwilfish","types":["water","poison"],"hp":99,"spd":114,"atk":1.22,"pa":1.22,"sa":1,"df":85,"sd":55,"rarity":3,"bst":440,"starter":false,"gen":2},
  {"dex":212,"name":"Scizor","types":["bug","steel"],"hp":102,"spd":105,"atk":1.42,"pa":1.42,"sa":1,"df":100,"sd":80,"rarity":4,"bst":500,"starter":false,"gen":2},
  {"dex":213,"name":"Shuckle","types":["bug","rock"],"hp":79,"spd":80,"atk":0.76,"pa":0.76,"sa":0.76,"df":230,"sd":230,"rarity":4,"bst":505,"starter":false,"gen":2},
  {"dex":214,"name":"Heracross","types":["bug","fighting"],"hp":106,"spd":114,"atk":1.39,"pa":1.39,"sa":0.92,"df":75,"sd":95,"rarity":4,"bst":500,"starter":false,"gen":2},
  {"dex":215,"name":"Sneasel","types":["dark","ice"],"hp":95,"spd":126,"atk":1.22,"pa":1.22,"sa":0.89,"df":55,"sd":75,"rarity":3,"bst":430,"starter":false,"gen":2},
  {"dex":216,"name":"Teddiursa","types":["normal"],"hp":97,"spd":95,"atk":1.14,"pa":1.14,"sa":0.97,"df":50,"sd":50,"rarity":2,"bst":330,"starter":false,"gen":2},
  {"dex":217,"name":"Ursaring","types":["normal"],"hp":110,"spd":101,"atk":1.42,"pa":1.42,"sa":1.11,"df":75,"sd":75,"rarity":4,"bst":500,"starter":false,"gen":2},
  {"dex":218,"name":"Slugma","types":["fire"],"hp":88,"spd":86,"atk":1.08,"pa":0.92,"sa":1.08,"df":40,"sd":40,"rarity":1,"bst":250,"starter":false,"gen":2},
  {"dex":219,"name":"Magcargo","types":["fire","rock"],"hp":97,"spd":91,"atk":1.2,"pa":0.97,"sa":1.2,"df":120,"sd":80,"rarity":3,"bst":430,"starter":false,"gen":2},
  {"dex":220,"name":"Swinub","types":["ice","ground"],"hp":92,"spd":99,"atk":0.97,"pa":0.97,"sa":0.86,"df":40,"sd":30,"rarity":1,"bst":250,"starter":false,"gen":2},
  {"dex":221,"name":"Piloswine","types":["ice","ground"],"hp":115,"spd":99,"atk":1.25,"pa":1.25,"sa":1.03,"df":80,"sd":60,"rarity":3,"bst":450,"starter":false,"gen":2},
  {"dex":222,"name":"Corsola","types":["water","rock"],"hp":99,"spd":93,"atk":1.06,"pa":1,"sa":1.06,"df":95,"sd":95,"rarity":3,"bst":410,"starter":false,"gen":2},
  {"dex":223,"name":"Remoraid","types":["water"],"hp":86,"spd":105,"atk":1.06,"pa":1.06,"sa":1.06,"df":35,"sd":35,"rarity":1,"bst":300,"starter":false,"gen":2},
  {"dex":224,"name":"Octillery","types":["water"],"hp":104,"spd":97,"atk":1.28,"pa":1.28,"sa":1.28,"df":75,"sd":75,"rarity":3,"bst":480,"starter":false,"gen":2},
  {"dex":225,"name":"Delibird","types":["ice","flying"],"hp":90,"spd":110,"atk":1.06,"pa":1,"sa":1.06,"df":45,"sd":45,"rarity":2,"bst":330,"starter":false,"gen":2},
  {"dex":226,"name":"Mantine","types":["water","flying"],"hp":108,"spd":107,"atk":1.14,"pa":0.92,"sa":1.14,"df":70,"sd":140,"rarity":3,"bst":485,"starter":false,"gen":2},
  {"dex":227,"name":"Skarmory","types":["steel","flying"],"hp":99,"spd":107,"atk":1.14,"pa":1.14,"sa":0.92,"df":140,"sd":70,"rarity":3,"bst":465,"starter":false,"gen":2},
  {"dex":228,"name":"Houndour","types":["dark","fire"],"hp":90,"spd":105,"atk":1.14,"pa":1.03,"sa":1.14,"df":30,"sd":50,"rarity":2,"bst":330,"starter":false,"gen":2},
  {"dex":229,"name":"Houndoom","types":["dark","fire"],"hp":104,"spd":118,"atk":1.31,"pa":1.2,"sa":1.31,"df":50,"sd":80,"rarity":4,"bst":500,"starter":false,"gen":2},
  {"dex":230,"name":"Kingdra","types":["water","dragon"],"hp":104,"spd":114,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":4,"bst":540,"starter":false,"gen":2},
  {"dex":231,"name":"Phanpy","types":["ground"],"hp":110,"spd":95,"atk":1.03,"pa":1.03,"sa":0.92,"df":60,"sd":40,"rarity":2,"bst":330,"starter":false,"gen":2},
  {"dex":232,"name":"Donphan","types":["ground"],"hp":110,"spd":99,"atk":1.36,"pa":1.36,"sa":1.03,"df":120,"sd":60,"rarity":4,"bst":500,"starter":false,"gen":2},
  {"dex":233,"name":"Porygon2","types":["normal"],"hp":108,"spd":103,"atk":1.28,"pa":1.14,"sa":1.28,"df":90,"sd":95,"rarity":4,"bst":515,"starter":false,"gen":2},
  {"dex":234,"name":"Stantler","types":["normal"],"hp":103,"spd":114,"atk":1.22,"pa":1.22,"sa":1.17,"df":62,"sd":65,"rarity":3,"bst":465,"starter":false,"gen":2},
  {"dex":235,"name":"Smeargle","types":["normal"],"hp":95,"spd":110,"atk":0.81,"pa":0.81,"sa":0.81,"df":35,"sd":45,"rarity":1,"bst":250,"starter":false,"gen":2},
  {"dex":236,"name":"Tyrogue","types":["fighting"],"hp":86,"spd":93,"atk":0.89,"pa":0.89,"sa":0.89,"df":35,"sd":35,"rarity":1,"bst":210,"starter":false,"gen":2},
  {"dex":237,"name":"Hitmontop","types":["fighting"],"hp":92,"spd":107,"atk":1.22,"pa":1.22,"sa":0.89,"df":95,"sd":110,"rarity":3,"bst":455,"starter":false,"gen":2},
  {"dex":238,"name":"Smoochum","types":["ice","psychic"],"hp":90,"spd":105,"atk":1.17,"pa":0.86,"sa":1.17,"df":15,"sd":65,"rarity":1,"bst":305,"starter":false,"gen":2},
  {"dex":239,"name":"Elekid","types":["electric"],"hp":90,"spd":118,"atk":1.06,"pa":1.05,"sa":1.06,"df":37,"sd":55,"rarity":2,"bst":360,"starter":false,"gen":2},
  {"dex":240,"name":"Magby","types":["fire"],"hp":90,"spd":113,"atk":1.11,"pa":1.11,"sa":1.08,"df":37,"sd":55,"rarity":2,"bst":365,"starter":false,"gen":2},
  {"dex":241,"name":"Miltank","types":["normal"],"hp":113,"spd":120,"atk":1.14,"pa":1.14,"sa":0.92,"df":105,"sd":70,"rarity":3,"bst":490,"starter":false,"gen":2},
  {"dex":242,"name":"Blissey","types":["normal"],"hp":185,"spd":101,"atk":1.11,"pa":0.76,"sa":1.11,"df":10,"sd":135,"rarity":4,"bst":540,"starter":false,"gen":2},
  {"dex":243,"name":"Raikou","types":["electric"],"hp":110,"spd":126,"atk":1.33,"pa":1.17,"sa":1.33,"df":75,"sd":100,"rarity":5,"bst":580,"starter":false,"gen":2,"leg":true},
  {"dex":244,"name":"Entei","types":["fire"],"hp":122,"spd":120,"atk":1.33,"pa":1.33,"sa":1.2,"df":85,"sd":75,"rarity":5,"bst":580,"starter":false,"gen":2,"leg":true},
  {"dex":245,"name":"Suicune","types":["water"],"hp":115,"spd":114,"atk":1.2,"pa":1.11,"sa":1.2,"df":115,"sd":115,"rarity":5,"bst":580,"starter":false,"gen":2,"leg":true},
  {"dex":246,"name":"Larvitar","types":["rock","ground"],"hp":92,"spd":95,"atk":1.05,"pa":1.05,"sa":0.95,"df":50,"sd":50,"rarity":1,"bst":300,"starter":false,"gen":2},
  {"dex":247,"name":"Pupitar","types":["rock","ground"],"hp":102,"spd":99,"atk":1.16,"pa":1.16,"sa":1.06,"df":70,"sd":70,"rarity":3,"bst":410,"starter":false,"gen":2},
  {"dex":248,"name":"Tyranitar","types":["rock","dark"],"hp":115,"spd":104,"atk":1.44,"pa":1.44,"sa":1.22,"df":110,"sd":100,"rarity":5,"bst":600,"starter":false,"gen":2},
  {"dex":249,"name":"Lugia","types":["psychic","flying"],"hp":118,"spd":124,"atk":1.2,"pa":1.2,"sa":1.2,"df":130,"sd":154,"rarity":5,"bst":680,"starter":false,"gen":2,"leg":true},
  {"dex":250,"name":"Ho-Oh","types":["fire","flying"],"hp":118,"spd":116,"atk":1.42,"pa":1.42,"sa":1.31,"df":90,"sd":154,"rarity":5,"bst":680,"starter":false,"gen":2,"leg":true},
  {"dex":251,"name":"Celebi","types":["psychic","grass"],"hp":115,"spd":120,"atk":1.25,"pa":1.25,"sa":1.25,"df":100,"sd":100,"rarity":5,"bst":600,"starter":false,"gen":2,"leg":true},
  {"dex":252,"name":"Treecko","types":["grass"],"hp":88,"spd":107,"atk":1.06,"pa":0.95,"sa":1.06,"df":35,"sd":55,"rarity":1,"bst":310,"starter":true,"gen":3},
  {"dex":253,"name":"Grovyle","types":["grass"],"hp":92,"spd":118,"atk":1.17,"pa":1.06,"sa":1.17,"df":45,"sd":65,"rarity":2,"bst":405,"starter":false,"gen":3},
  {"dex":254,"name":"Sceptile","types":["grass"],"hp":102,"spd":128,"atk":1.28,"pa":1.17,"sa":1.28,"df":65,"sd":85,"rarity":4,"bst":530,"starter":false,"gen":3},
  {"dex":255,"name":"Torchic","types":["fire"],"hp":90,"spd":97,"atk":1.08,"pa":1.03,"sa":1.08,"df":40,"sd":50,"rarity":1,"bst":310,"starter":true,"gen":3},
  {"dex":256,"name":"Combusken","types":["fire","fighting"],"hp":97,"spd":101,"atk":1.17,"pa":1.17,"sa":1.17,"df":60,"sd":60,"rarity":2,"bst":405,"starter":false,"gen":3},
  {"dex":257,"name":"Blaziken","types":["fire","fighting"],"hp":106,"spd":112,"atk":1.36,"pa":1.36,"sa":1.31,"df":70,"sd":70,"rarity":4,"bst":530,"starter":false,"gen":3},
  {"dex":258,"name":"Mudkip","types":["water"],"hp":92,"spd":95,"atk":1.08,"pa":1.08,"sa":0.97,"df":50,"sd":50,"rarity":1,"bst":310,"starter":true,"gen":3},
  {"dex":259,"name":"Marshtomp","types":["water","ground"],"hp":102,"spd":99,"atk":1.17,"pa":1.17,"sa":1.03,"df":70,"sd":70,"rarity":2,"bst":405,"starter":false,"gen":3},
  {"dex":260,"name":"Swampert","types":["water","ground"],"hp":115,"spd":103,"atk":1.31,"pa":1.31,"sa":1.17,"df":90,"sd":90,"rarity":4,"bst":535,"starter":false,"gen":3},
  {"dex":261,"name":"Poochyena","types":["dark"],"hp":86,"spd":93,"atk":1,"pa":1,"sa":0.86,"df":35,"sd":30,"rarity":1,"bst":220,"starter":false,"gen":3},
  {"dex":262,"name":"Mightyena","types":["dark"],"hp":102,"spd":107,"atk":1.2,"pa":1.2,"sa":1.03,"df":70,"sd":60,"rarity":3,"bst":420,"starter":false,"gen":3},
  {"dex":263,"name":"Zigzagoon","types":["normal"],"hp":87,"spd":103,"atk":0.86,"pa":0.86,"sa":0.86,"df":41,"sd":41,"rarity":1,"bst":240,"starter":false,"gen":3},
  {"dex":264,"name":"Linoone","types":["normal"],"hp":105,"spd":120,"atk":1.08,"pa":1.08,"sa":0.97,"df":61,"sd":61,"rarity":3,"bst":420,"starter":false,"gen":3},
  {"dex":265,"name":"Wurmple","types":["bug"],"hp":90,"spd":86,"atk":0.95,"pa":0.95,"sa":0.81,"df":35,"sd":30,"rarity":1,"bst":195,"starter":false,"gen":3},
  {"dex":266,"name":"Silcoon","types":["bug"],"hp":92,"spd":84,"atk":0.89,"pa":0.89,"sa":0.84,"df":55,"sd":25,"rarity":1,"bst":205,"starter":false,"gen":3},
  {"dex":267,"name":"Beautifly","types":["bug","flying"],"hp":97,"spd":105,"atk":1.25,"pa":1.08,"sa":1.25,"df":50,"sd":50,"rarity":2,"bst":395,"starter":false,"gen":3},
  {"dex":268,"name":"Cascoon","types":["bug"],"hp":92,"spd":84,"atk":0.89,"pa":0.89,"sa":0.84,"df":55,"sd":25,"rarity":1,"bst":205,"starter":false,"gen":3},
  {"dex":269,"name":"Dustox","types":["bug","poison"],"hp":97,"spd":105,"atk":0.97,"pa":0.97,"sa":0.97,"df":70,"sd":90,"rarity":2,"bst":385,"starter":false,"gen":3},
  {"dex":270,"name":"Lotad","types":["water","grass"],"hp":88,"spd":91,"atk":0.92,"pa":0.86,"sa":0.92,"df":30,"sd":50,"rarity":1,"bst":220,"starter":false,"gen":3},
  {"dex":271,"name":"Lombre","types":["water","grass"],"hp":97,"spd":99,"atk":1.03,"pa":0.97,"sa":1.03,"df":50,"sd":70,"rarity":2,"bst":340,"starter":false,"gen":3},
  {"dex":272,"name":"Ludicolo","types":["water","grass"],"hp":106,"spd":107,"atk":1.2,"pa":1.08,"sa":1.2,"df":70,"sd":100,"rarity":3,"bst":480,"starter":false,"gen":3},
  {"dex":273,"name":"Seedot","types":["grass"],"hp":88,"spd":91,"atk":0.92,"pa":0.92,"sa":0.86,"df":50,"sd":30,"rarity":1,"bst":220,"starter":false,"gen":3},
  {"dex":274,"name":"Nuzleaf","types":["grass","dark"],"hp":102,"spd":103,"atk":1.08,"pa":1.08,"sa":1.03,"df":40,"sd":40,"rarity":2,"bst":340,"starter":false,"gen":3},
  {"dex":275,"name":"Shiftry","types":["grass","dark"],"hp":110,"spd":112,"atk":1.25,"pa":1.25,"sa":1.2,"df":60,"sd":60,"rarity":3,"bst":480,"starter":false,"gen":3},
  {"dex":276,"name":"Taillow","types":["normal","flying"],"hp":88,"spd":114,"atk":1,"pa":1,"sa":0.86,"df":30,"sd":30,"rarity":1,"bst":270,"starter":false,"gen":3},
  {"dex":277,"name":"Swellow","types":["normal","flying"],"hp":97,"spd":130,"atk":1.17,"pa":1.17,"sa":1.11,"df":60,"sd":50,"rarity":3,"bst":455,"starter":false,"gen":3},
  {"dex":278,"name":"Wingull","types":["water","flying"],"hp":88,"spd":114,"atk":1,"pa":0.86,"sa":1,"df":30,"sd":30,"rarity":1,"bst":270,"starter":false,"gen":3},
  {"dex":279,"name":"Pelipper","types":["water","flying"],"hp":97,"spd":105,"atk":1.22,"pa":0.97,"sa":1.22,"df":100,"sd":70,"rarity":3,"bst":440,"starter":false,"gen":3},
  {"dex":280,"name":"Ralts","types":["psychic","fairy"],"hp":83,"spd":95,"atk":0.95,"pa":0.84,"sa":0.95,"df":25,"sd":35,"rarity":1,"bst":198,"starter":false,"gen":3},
  {"dex":281,"name":"Kirlia","types":["psychic","fairy"],"hp":87,"spd":99,"atk":1.06,"pa":0.89,"sa":1.06,"df":35,"sd":55,"rarity":1,"bst":278,"starter":false,"gen":3},
  {"dex":282,"name":"Gardevoir","types":["psychic","fairy"],"hp":101,"spd":112,"atk":1.39,"pa":1.06,"sa":1.39,"df":65,"sd":115,"rarity":4,"bst":518,"starter":false,"gen":3},
  {"dex":283,"name":"Surskit","types":["bug","water"],"hp":88,"spd":105,"atk":0.97,"pa":0.86,"sa":0.97,"df":32,"sd":52,"rarity":1,"bst":269,"starter":false,"gen":3},
  {"dex":284,"name":"Masquerain","types":["bug","flying"],"hp":102,"spd":112,"atk":1.25,"pa":1.03,"sa":1.25,"df":62,"sd":82,"rarity":3,"bst":454,"starter":false,"gen":3},
  {"dex":285,"name":"Shroomish","types":["grass"],"hp":97,"spd":93,"atk":0.92,"pa":0.92,"sa":0.92,"df":60,"sd":60,"rarity":1,"bst":295,"starter":false,"gen":3},
  {"dex":286,"name":"Breloom","types":["grass","fighting"],"hp":97,"spd":107,"atk":1.42,"pa":1.42,"sa":1.03,"df":80,"sd":60,"rarity":3,"bst":460,"starter":false,"gen":3},
  {"dex":287,"name":"Slakoth","types":["normal"],"hp":97,"spd":91,"atk":1.03,"pa":1.03,"sa":0.89,"df":60,"sd":35,"rarity":1,"bst":280,"starter":false,"gen":3},
  {"dex":288,"name":"Vigoroth","types":["normal"],"hp":106,"spd":116,"atk":1.14,"pa":1.14,"sa":1,"df":80,"sd":55,"rarity":3,"bst":440,"starter":false,"gen":3},
  {"dex":289,"name":"Slaking","types":["normal"],"hp":138,"spd":120,"atk":1.58,"pa":1.58,"sa":1.22,"df":100,"sd":65,"rarity":5,"bst":670,"starter":false,"gen":3},
  {"dex":290,"name":"Nincada","types":["bug","ground"],"hp":84,"spd":95,"atk":0.95,"pa":0.95,"sa":0.86,"df":90,"sd":30,"rarity":1,"bst":266,"starter":false,"gen":3},
  {"dex":291,"name":"Ninjask","types":["bug","flying"],"hp":97,"spd":145,"atk":1.2,"pa":1.2,"sa":0.97,"df":45,"sd":50,"rarity":3,"bst":456,"starter":false,"gen":3},
  {"dex":292,"name":"Shedinja","types":["bug","ghost"],"hp":70,"spd":95,"atk":1.2,"pa":1.2,"sa":0.86,"df":45,"sd":30,"rarity":1,"bst":236,"starter":false,"gen":3},
  {"dex":293,"name":"Whismur","types":["normal"],"hp":99,"spd":90,"atk":0.98,"pa":0.98,"sa":0.98,"df":23,"sd":23,"rarity":1,"bst":240,"starter":false,"gen":3},
  {"dex":294,"name":"Loudred","types":["normal"],"hp":108,"spd":98,"atk":1.09,"pa":1.09,"sa":1.09,"df":43,"sd":43,"rarity":2,"bst":360,"starter":false,"gen":3},
  {"dex":295,"name":"Exploud","types":["normal"],"hp":117,"spd":107,"atk":1.2,"pa":1.2,"sa":1.2,"df":63,"sd":73,"rarity":3,"bst":490,"starter":false,"gen":3},
  {"dex":296,"name":"Makuhita","types":["fighting"],"hp":102,"spd":88,"atk":1.03,"pa":1.03,"sa":0.81,"df":30,"sd":30,"rarity":1,"bst":237,"starter":false,"gen":3},
  {"dex":297,"name":"Hariyama","types":["fighting"],"hp":135,"spd":99,"atk":1.36,"pa":1.36,"sa":0.92,"df":60,"sd":60,"rarity":3,"bst":474,"starter":false,"gen":3},
  {"dex":298,"name":"Azurill","types":["normal","fairy"],"hp":92,"spd":86,"atk":0.81,"pa":0.81,"sa":0.81,"df":40,"sd":40,"rarity":1,"bst":190,"starter":false,"gen":3},
  {"dex":299,"name":"Nosepass","types":["rock"],"hp":84,"spd":91,"atk":0.95,"pa":0.95,"sa":0.95,"df":135,"sd":90,"rarity":2,"bst":375,"starter":false,"gen":3},
  {"dex":300,"name":"Skitty","types":["normal"],"hp":92,"spd":99,"atk":0.95,"pa":0.95,"sa":0.89,"df":45,"sd":35,"rarity":1,"bst":260,"starter":false,"gen":3},
  {"dex":301,"name":"Delcatty","types":["normal"],"hp":102,"spd":116,"atk":1.06,"pa":1.06,"sa":1,"df":65,"sd":55,"rarity":2,"bst":400,"starter":false,"gen":3},
  {"dex":302,"name":"Sableye","types":["dark","ghost"],"hp":92,"spd":99,"atk":1.11,"pa":1.11,"sa":1.06,"df":75,"sd":65,"rarity":2,"bst":380,"starter":false,"gen":3},
  {"dex":303,"name":"Mawile","types":["steel","fairy"],"hp":92,"spd":99,"atk":1.17,"pa":1.17,"sa":1,"df":85,"sd":55,"rarity":2,"bst":380,"starter":false,"gen":3},
  {"dex":304,"name":"Aron","types":["steel","rock"],"hp":92,"spd":91,"atk":1.08,"pa":1.08,"sa":0.92,"df":100,"sd":40,"rarity":2,"bst":330,"starter":false,"gen":3},
  {"dex":305,"name":"Lairon","types":["steel","rock"],"hp":97,"spd":95,"atk":1.2,"pa":1.2,"sa":0.97,"df":140,"sd":50,"rarity":3,"bst":430,"starter":false,"gen":3},
  {"dex":306,"name":"Aggron","types":["steel","rock"],"hp":102,"spd":99,"atk":1.31,"pa":1.31,"sa":1.03,"df":180,"sd":60,"rarity":4,"bst":530,"starter":false,"gen":3},
  {"dex":307,"name":"Meditite","types":["fighting","psychic"],"hp":84,"spd":103,"atk":0.92,"pa":0.92,"sa":0.92,"df":55,"sd":55,"rarity":1,"bst":280,"starter":false,"gen":3},
  {"dex":308,"name":"Medicham","types":["fighting","psychic"],"hp":97,"spd":112,"atk":1.03,"pa":1.03,"sa":1.03,"df":75,"sd":75,"rarity":3,"bst":410,"starter":false,"gen":3},
  {"dex":309,"name":"Electrike","types":["electric"],"hp":88,"spd":105,"atk":1.06,"pa":0.95,"sa":1.06,"df":40,"sd":40,"rarity":1,"bst":295,"starter":false,"gen":3},
  {"dex":310,"name":"Manectric","types":["electric"],"hp":102,"spd":122,"atk":1.28,"pa":1.11,"sa":1.28,"df":60,"sd":60,"rarity":3,"bst":475,"starter":false,"gen":3},
  {"dex":311,"name":"Plusle","types":["electric"],"hp":97,"spd":118,"atk":1.17,"pa":0.97,"sa":1.17,"df":40,"sd":75,"rarity":2,"bst":405,"starter":false,"gen":3},
  {"dex":312,"name":"Minun","types":["electric"],"hp":97,"spd":118,"atk":1.11,"pa":0.92,"sa":1.11,"df":50,"sd":85,"rarity":2,"bst":405,"starter":false,"gen":3},
  {"dex":313,"name":"Volbeat","types":["bug"],"hp":99,"spd":114,"atk":1.1,"pa":1.1,"sa":0.96,"df":75,"sd":85,"rarity":3,"bst":430,"starter":false,"gen":3},
  {"dex":314,"name":"Illumise","types":["bug"],"hp":99,"spd":114,"atk":1.1,"pa":0.96,"sa":1.1,"df":75,"sd":85,"rarity":3,"bst":430,"starter":false,"gen":3},
  {"dex":315,"name":"Roselia","types":["grass","poison"],"hp":92,"spd":105,"atk":1.25,"pa":1.03,"sa":1.25,"df":45,"sd":80,"rarity":2,"bst":400,"starter":false,"gen":3},
  {"dex":316,"name":"Gulpin","types":["poison"],"hp":102,"spd":95,"atk":0.94,"pa":0.94,"sa":0.94,"df":53,"sd":53,"rarity":1,"bst":302,"starter":false,"gen":3},
  {"dex":317,"name":"Swalot","types":["poison"],"hp":115,"spd":101,"atk":1.1,"pa":1.1,"sa":1.1,"df":83,"sd":83,"rarity":3,"bst":467,"starter":false,"gen":3},
  {"dex":318,"name":"Carvanha","types":["water","dark"],"hp":90,"spd":105,"atk":1.2,"pa":1.2,"sa":1.06,"df":20,"sd":20,"rarity":1,"bst":305,"starter":false,"gen":3},
  {"dex":319,"name":"Sharpedo","types":["water","dark"],"hp":102,"spd":118,"atk":1.36,"pa":1.36,"sa":1.22,"df":40,"sd":40,"rarity":3,"bst":460,"starter":false,"gen":3},
  {"dex":320,"name":"Wailmer","types":["water"],"hp":128,"spd":103,"atk":1.08,"pa":1.08,"sa":1.08,"df":35,"sd":35,"rarity":2,"bst":400,"starter":false,"gen":3},
  {"dex":321,"name":"Wailord","types":["water"],"hp":146,"spd":103,"atk":1.2,"pa":1.2,"sa":1.2,"df":45,"sd":45,"rarity":4,"bst":500,"starter":false,"gen":3},
  {"dex":322,"name":"Numel","types":["fire","ground"],"hp":97,"spd":93,"atk":1.06,"pa":1.03,"sa":1.06,"df":40,"sd":45,"rarity":1,"bst":305,"starter":false,"gen":3},
  {"dex":323,"name":"Camerupt","types":["fire","ground"],"hp":102,"spd":95,"atk":1.28,"pa":1.25,"sa":1.28,"df":70,"sd":75,"rarity":3,"bst":460,"starter":false,"gen":3},
  {"dex":324,"name":"Torkoal","types":["fire"],"hp":102,"spd":86,"atk":1.17,"pa":1.17,"sa":1.17,"df":140,"sd":70,"rarity":3,"bst":470,"starter":false,"gen":3},
  {"dex":325,"name":"Spoink","types":["psychic"],"hp":97,"spd":103,"atk":1.08,"pa":0.84,"sa":1.08,"df":35,"sd":80,"rarity":2,"bst":330,"starter":false,"gen":3},
  {"dex":326,"name":"Grumpig","types":["psychic"],"hp":106,"spd":112,"atk":1.2,"pa":0.95,"sa":1.2,"df":65,"sd":110,"rarity":3,"bst":470,"starter":false,"gen":3},
  {"dex":327,"name":"Spinda","types":["normal"],"hp":97,"spd":103,"atk":1.03,"pa":1.03,"sa":1.03,"df":60,"sd":60,"rarity":2,"bst":360,"starter":false,"gen":3},
  {"dex":328,"name":"Trapinch","types":["ground"],"hp":90,"spd":82,"atk":1.25,"pa":1.25,"sa":0.95,"df":45,"sd":45,"rarity":1,"bst":290,"starter":false,"gen":3},
  {"dex":329,"name":"Vibrava","types":["ground","dragon"],"hp":92,"spd":107,"atk":1.08,"pa":1.08,"sa":0.97,"df":50,"sd":50,"rarity":2,"bst":340,"starter":false,"gen":3},
  {"dex":330,"name":"Flygon","types":["ground","dragon"],"hp":106,"spd":120,"atk":1.25,"pa":1.25,"sa":1.14,"df":80,"sd":80,"rarity":4,"bst":520,"starter":false,"gen":3},
  {"dex":331,"name":"Cacnea","types":["grass"],"hp":92,"spd":93,"atk":1.17,"pa":1.17,"sa":1.17,"df":40,"sd":40,"rarity":2,"bst":335,"starter":false,"gen":3},
  {"dex":332,"name":"Cacturne","types":["grass","dark"],"hp":102,"spd":101,"atk":1.33,"pa":1.33,"sa":1.33,"df":60,"sd":60,"rarity":3,"bst":475,"starter":false,"gen":3},
  {"dex":333,"name":"Swablu","types":["normal","flying"],"hp":90,"spd":99,"atk":0.92,"pa":0.92,"sa":0.92,"df":60,"sd":75,"rarity":1,"bst":310,"starter":false,"gen":3},
  {"dex":334,"name":"Altaria","types":["dragon","flying"],"hp":104,"spd":112,"atk":1.08,"pa":1.08,"sa":1.08,"df":90,"sd":105,"rarity":3,"bst":490,"starter":false,"gen":3},
  {"dex":335,"name":"Zangoose","types":["normal"],"hp":103,"spd":116,"atk":1.33,"pa":1.33,"sa":1.03,"df":60,"sd":60,"rarity":3,"bst":458,"starter":false,"gen":3},
  {"dex":336,"name":"Seviper","types":["poison"],"hp":103,"spd":105,"atk":1.25,"pa":1.25,"sa":1.25,"df":60,"sd":60,"rarity":3,"bst":458,"starter":false,"gen":3},
  {"dex":337,"name":"Lunatone","types":["rock","psychic"],"hp":110,"spd":107,"atk":1.22,"pa":1,"sa":1.22,"df":65,"sd":85,"rarity":3,"bst":460,"starter":false,"gen":3},
  {"dex":338,"name":"Solrock","types":["rock","psychic"],"hp":110,"spd":107,"atk":1.22,"pa":1.22,"sa":1,"df":85,"sd":65,"rarity":3,"bst":460,"starter":false,"gen":3},
  {"dex":339,"name":"Barboach","types":["water","ground"],"hp":92,"spd":103,"atk":0.96,"pa":0.96,"sa":0.95,"df":43,"sd":41,"rarity":1,"bst":288,"starter":false,"gen":3},
  {"dex":340,"name":"Whiscash","types":["water","ground"],"hp":120,"spd":103,"atk":1.13,"pa":1.13,"sa":1.12,"df":73,"sd":71,"rarity":3,"bst":468,"starter":false,"gen":3},
  {"dex":341,"name":"Corphish","types":["water"],"hp":89,"spd":93,"atk":1.14,"pa":1.14,"sa":0.97,"df":65,"sd":35,"rarity":1,"bst":308,"starter":false,"gen":3},
  {"dex":342,"name":"Crawdaunt","types":["water","dark"],"hp":98,"spd":101,"atk":1.36,"pa":1.36,"sa":1.2,"df":85,"sd":55,"rarity":3,"bst":468,"starter":false,"gen":3},
  {"dex":343,"name":"Baltoy","types":["ground","psychic"],"hp":88,"spd":101,"atk":0.92,"pa":0.92,"sa":0.92,"df":55,"sd":70,"rarity":1,"bst":300,"starter":false,"gen":3},
  {"dex":344,"name":"Claydol","types":["ground","psychic"],"hp":97,"spd":110,"atk":1.08,"pa":1.08,"sa":1.08,"df":105,"sd":120,"rarity":4,"bst":500,"starter":false,"gen":3},
  {"dex":345,"name":"Lileep","types":["rock","grass"],"hp":100,"spd":88,"atk":1.04,"pa":0.93,"sa":1.04,"df":77,"sd":87,"rarity":2,"bst":355,"starter":false,"gen":3},
  {"dex":346,"name":"Cradily","types":["rock","grass"],"hp":109,"spd":96,"atk":1.15,"pa":1.15,"sa":1.15,"df":97,"sd":107,"rarity":4,"bst":495,"starter":false,"gen":3},
  {"dex":347,"name":"Anorith","types":["rock","bug"],"hp":90,"spd":110,"atk":1.22,"pa":1.22,"sa":0.92,"df":50,"sd":50,"rarity":2,"bst":355,"starter":false,"gen":3},
  {"dex":348,"name":"Armaldo","types":["rock","bug"],"hp":104,"spd":97,"atk":1.39,"pa":1.39,"sa":1.08,"df":100,"sd":80,"rarity":4,"bst":495,"starter":false,"gen":3},
  {"dex":349,"name":"Feebas","types":["water"],"hp":79,"spd":112,"atk":0.78,"pa":0.78,"sa":0.76,"df":20,"sd":55,"rarity":1,"bst":200,"starter":false,"gen":3},
  {"dex":350,"name":"Milotic","types":["water"],"hp":113,"spd":112,"atk":1.25,"pa":1.03,"sa":1.25,"df":79,"sd":125,"rarity":4,"bst":540,"starter":false,"gen":3},
  {"dex":351,"name":"Castform","types":["normal"],"hp":102,"spd":107,"atk":1.08,"pa":1.08,"sa":1.08,"df":70,"sd":70,"rarity":3,"bst":420,"starter":false,"gen":3},
  {"dex":352,"name":"Kecleon","types":["normal"],"hp":97,"spd":95,"atk":1.2,"pa":1.2,"sa":1.03,"df":70,"sd":120,"rarity":3,"bst":440,"starter":false,"gen":3},
  {"dex":353,"name":"Shuppet","types":["ghost"],"hp":90,"spd":97,"atk":1.11,"pa":1.11,"sa":1.05,"df":35,"sd":33,"rarity":1,"bst":295,"starter":false,"gen":3},
  {"dex":354,"name":"Banette","types":["ghost"],"hp":99,"spd":105,"atk":1.33,"pa":1.33,"sa":1.16,"df":65,"sd":63,"rarity":3,"bst":455,"starter":false,"gen":3},
  {"dex":355,"name":"Duskull","types":["ghost"],"hp":79,"spd":88,"atk":0.92,"pa":0.92,"sa":0.86,"df":90,"sd":90,"rarity":1,"bst":295,"starter":false,"gen":3},
  {"dex":356,"name":"Dusclops","types":["ghost"],"hp":88,"spd":88,"atk":1.08,"pa":1.08,"sa":1.03,"df":130,"sd":130,"rarity":3,"bst":455,"starter":false,"gen":3},
  {"dex":357,"name":"Tropius","types":["grass","flying"],"hp":115,"spd":99,"atk":1.1,"pa":1.07,"sa":1.1,"df":83,"sd":87,"rarity":3,"bst":460,"starter":false,"gen":3},
  {"dex":358,"name":"Chimecho","types":["psychic"],"hp":104,"spd":105,"atk":1.22,"pa":0.97,"sa":1.22,"df":80,"sd":90,"rarity":3,"bst":455,"starter":false,"gen":3},
  {"dex":359,"name":"Absol","types":["dark"],"hp":99,"spd":110,"atk":1.42,"pa":1.42,"sa":1.11,"df":60,"sd":60,"rarity":3,"bst":465,"starter":false,"gen":3},
  {"dex":360,"name":"Wynaut","types":["psychic"],"hp":113,"spd":88,"atk":0.83,"pa":0.83,"sa":0.83,"df":48,"sd":48,"rarity":1,"bst":260,"starter":false,"gen":3},
  {"dex":361,"name":"Snorunt","types":["ice"],"hp":92,"spd":99,"atk":0.97,"pa":0.97,"sa":0.97,"df":50,"sd":50,"rarity":1,"bst":300,"starter":false,"gen":3},
  {"dex":362,"name":"Glalie","types":["ice"],"hp":106,"spd":112,"atk":1.14,"pa":1.14,"sa":1.14,"df":80,"sd":80,"rarity":3,"bst":480,"starter":false,"gen":3},
  {"dex":363,"name":"Spheal","types":["ice","water"],"hp":102,"spd":88,"atk":1,"pa":0.92,"sa":1,"df":50,"sd":50,"rarity":1,"bst":290,"starter":false,"gen":3},
  {"dex":364,"name":"Sealeo","types":["ice","water"],"hp":110,"spd":97,"atk":1.11,"pa":1.03,"sa":1.11,"df":70,"sd":70,"rarity":3,"bst":410,"starter":false,"gen":3},
  {"dex":365,"name":"Walrein","types":["ice","water"],"hp":120,"spd":105,"atk":1.22,"pa":1.14,"sa":1.22,"df":90,"sd":90,"rarity":4,"bst":530,"starter":false,"gen":3},
  {"dex":366,"name":"Clamperl","types":["water"],"hp":86,"spd":91,"atk":1.11,"pa":1.05,"sa":1.11,"df":85,"sd":55,"rarity":2,"bst":345,"starter":false,"gen":3},
  {"dex":367,"name":"Huntail","types":["water"],"hp":95,"spd":100,"atk":1.27,"pa":1.27,"sa":1.22,"df":105,"sd":75,"rarity":3,"bst":485,"starter":false,"gen":3},
  {"dex":368,"name":"Gorebyss","types":["water"],"hp":95,"spd":100,"atk":1.33,"pa":1.16,"sa":1.33,"df":105,"sd":75,"rarity":3,"bst":485,"starter":false,"gen":3},
  {"dex":369,"name":"Relicanth","types":["water","rock"],"hp":115,"spd":101,"atk":1.2,"pa":1.2,"sa":0.95,"df":130,"sd":65,"rarity":3,"bst":485,"starter":false,"gen":3},
  {"dex":370,"name":"Luvdisc","types":["water"],"hp":89,"spd":119,"atk":0.92,"pa":0.86,"sa":0.92,"df":55,"sd":65,"rarity":2,"bst":330,"starter":false,"gen":3},
  {"dex":371,"name":"Bagon","types":["dragon"],"hp":90,"spd":99,"atk":1.11,"pa":1.11,"sa":0.92,"df":60,"sd":30,"rarity":1,"bst":300,"starter":false,"gen":3},
  {"dex":372,"name":"Shelgon","types":["dragon"],"hp":99,"spd":99,"atk":1.22,"pa":1.22,"sa":1.03,"df":100,"sd":50,"rarity":3,"bst":420,"starter":false,"gen":3},
  {"dex":373,"name":"Salamence","types":["dragon","flying"],"hp":113,"spd":120,"atk":1.44,"pa":1.44,"sa":1.31,"df":80,"sd":80,"rarity":5,"bst":600,"starter":false,"gen":3},
  {"dex":374,"name":"Beldum","types":["steel","psychic"],"hp":88,"spd":91,"atk":1,"pa":1,"sa":0.89,"df":80,"sd":60,"rarity":1,"bst":300,"starter":false,"gen":3},
  {"dex":375,"name":"Metang","types":["steel","psychic"],"hp":97,"spd":99,"atk":1.11,"pa":1.11,"sa":1,"df":100,"sd":80,"rarity":3,"bst":420,"starter":false,"gen":3},
  {"dex":376,"name":"Metagross","types":["steel","psychic"],"hp":106,"spd":107,"atk":1.44,"pa":1.44,"sa":1.22,"df":130,"sd":90,"rarity":5,"bst":600,"starter":false,"gen":3},
  {"dex":377,"name":"Regirock","types":["rock"],"hp":106,"spd":99,"atk":1.25,"pa":1.25,"sa":0.97,"df":200,"sd":100,"rarity":5,"bst":580,"starter":false,"gen":3,"leg":true},
  {"dex":378,"name":"Regice","types":["ice"],"hp":106,"spd":99,"atk":1.25,"pa":0.97,"sa":1.25,"df":100,"sd":200,"rarity":5,"bst":580,"starter":false,"gen":3,"leg":true},
  {"dex":379,"name":"Registeel","types":["steel"],"hp":106,"spd":99,"atk":1.11,"pa":1.11,"sa":1.11,"df":150,"sd":150,"rarity":5,"bst":580,"starter":false,"gen":3,"leg":true},
  {"dex":380,"name":"Latias","types":["dragon","psychic"],"hp":106,"spd":124,"atk":1.31,"pa":1.14,"sa":1.31,"df":90,"sd":130,"rarity":5,"bst":600,"starter":false,"gen":3,"leg":true},
  {"dex":381,"name":"Latios","types":["dragon","psychic"],"hp":106,"spd":124,"atk":1.42,"pa":1.2,"sa":1.42,"df":80,"sd":110,"rarity":5,"bst":600,"starter":false,"gen":3,"leg":true},
  {"dex":382,"name":"Kyogre","types":["water"],"hp":115,"spd":116,"atk":1.52,"pa":1.25,"sa":1.52,"df":90,"sd":140,"rarity":5,"bst":670,"starter":false,"gen":3,"leg":true},
  {"dex":383,"name":"Groudon","types":["ground"],"hp":115,"spd":116,"atk":1.52,"pa":1.52,"sa":1.25,"df":140,"sd":90,"rarity":5,"bst":670,"starter":false,"gen":3,"leg":true},
  {"dex":384,"name":"Rayquaza","types":["dragon","flying"],"hp":117,"spd":118,"atk":1.52,"pa":1.52,"sa":1.52,"df":90,"sd":90,"rarity":5,"bst":680,"starter":false,"gen":3,"leg":true},
  {"dex":385,"name":"Jirachi","types":["steel","psychic"],"hp":115,"spd":120,"atk":1.25,"pa":1.25,"sa":1.25,"df":100,"sd":100,"rarity":5,"bst":600,"starter":false,"gen":3,"leg":true},
  {"dex":386,"name":"Deoxys","types":["psychic"],"hp":92,"spd":141,"atk":1.52,"pa":1.52,"sa":1.52,"df":50,"sd":50,"rarity":5,"bst":600,"starter":false,"gen":3,"leg":true},
  {"dex":387,"name":"Turtwig","types":["grass"],"hp":95,"spd":91,"atk":1.07,"pa":1.07,"sa":0.95,"df":64,"sd":55,"rarity":1,"bst":318,"starter":true,"gen":4},
  {"dex":388,"name":"Grotle","types":["grass"],"hp":104,"spd":93,"atk":1.19,"pa":1.19,"sa":1,"df":85,"sd":65,"rarity":2,"bst":405,"starter":false,"gen":4},
  {"dex":389,"name":"Torterra","types":["grass","ground"],"hp":113,"spd":102,"atk":1.3,"pa":1.3,"sa":1.11,"df":105,"sd":85,"rarity":4,"bst":525,"starter":false,"gen":4},
  {"dex":390,"name":"Chimchar","types":["fire"],"hp":90,"spd":104,"atk":1.02,"pa":1.02,"sa":1.02,"df":44,"sd":44,"rarity":1,"bst":309,"starter":true,"gen":4},
  {"dex":391,"name":"Monferno","types":["fire","fighting"],"hp":99,"spd":112,"atk":1.13,"pa":1.13,"sa":1.13,"df":52,"sd":52,"rarity":2,"bst":405,"starter":false,"gen":4},
  {"dex":392,"name":"Infernape","types":["fire","fighting"],"hp":104,"spd":123,"atk":1.27,"pa":1.27,"sa":1.27,"df":71,"sd":71,"rarity":4,"bst":534,"starter":false,"gen":4},
  {"dex":393,"name":"Piplup","types":["water"],"hp":94,"spd":95,"atk":1.04,"pa":0.98,"sa":1.04,"df":53,"sd":56,"rarity":1,"bst":314,"starter":true,"gen":4},
  {"dex":394,"name":"Prinplup","types":["water"],"hp":99,"spd":99,"atk":1.15,"pa":1.06,"sa":1.15,"df":68,"sd":76,"rarity":2,"bst":405,"starter":false,"gen":4},
  {"dex":395,"name":"Empoleon","types":["water","steel"],"hp":108,"spd":103,"atk":1.31,"pa":1.17,"sa":1.31,"df":88,"sd":101,"rarity":4,"bst":530,"starter":false,"gen":4},
  {"dex":396,"name":"Starly","types":["normal","flying"],"hp":88,"spd":103,"atk":1,"pa":1,"sa":0.86,"df":30,"sd":30,"rarity":1,"bst":245,"starter":false,"gen":4},
  {"dex":397,"name":"Staravia","types":["normal","flying"],"hp":95,"spd":112,"atk":1.11,"pa":1.11,"sa":0.92,"df":50,"sd":40,"rarity":2,"bst":340,"starter":false,"gen":4},
  {"dex":398,"name":"Staraptor","types":["normal","flying"],"hp":108,"spd":120,"atk":1.36,"pa":1.36,"sa":0.97,"df":70,"sd":60,"rarity":3,"bst":485,"starter":false,"gen":4},
  {"dex":399,"name":"Bidoof","types":["normal"],"hp":97,"spd":91,"atk":0.95,"pa":0.95,"sa":0.89,"df":40,"sd":40,"rarity":1,"bst":250,"starter":false,"gen":4},
  {"dex":400,"name":"Bibarel","types":["normal","water"],"hp":106,"spd":108,"atk":1.17,"pa":1.17,"sa":1,"df":60,"sd":60,"rarity":3,"bst":410,"starter":false,"gen":4},
  {"dex":401,"name":"Kricketot","types":["bug"],"hp":87,"spd":88,"atk":0.84,"pa":0.84,"sa":0.84,"df":41,"sd":41,"rarity":1,"bst":194,"starter":false,"gen":4},
  {"dex":402,"name":"Kricketune","types":["bug"],"hp":105,"spd":105,"atk":1.17,"pa":1.17,"sa":1,"df":51,"sd":51,"rarity":2,"bst":384,"starter":false,"gen":4},
  {"dex":403,"name":"Shinx","types":["electric"],"hp":90,"spd":97,"atk":1.06,"pa":1.06,"sa":0.92,"df":34,"sd":34,"rarity":1,"bst":263,"starter":false,"gen":4},
  {"dex":404,"name":"Luxio","types":["electric"],"hp":97,"spd":103,"atk":1.17,"pa":1.17,"sa":1.03,"df":49,"sd":49,"rarity":2,"bst":363,"starter":false,"gen":4},
  {"dex":405,"name":"Luxray","types":["electric"],"hp":106,"spd":107,"atk":1.36,"pa":1.36,"sa":1.22,"df":79,"sd":79,"rarity":4,"bst":523,"starter":false,"gen":4},
  {"dex":406,"name":"Budew","types":["grass","poison"],"hp":88,"spd":101,"atk":0.97,"pa":0.86,"sa":0.97,"df":35,"sd":70,"rarity":1,"bst":280,"starter":false,"gen":4},
  {"dex":407,"name":"Roserade","types":["grass","poison"],"hp":97,"spd":116,"atk":1.39,"pa":1.08,"sa":1.39,"df":65,"sd":105,"rarity":4,"bst":515,"starter":false,"gen":4},
  {"dex":408,"name":"Cranidos","types":["rock"],"hp":100,"spd":102,"atk":1.39,"pa":1.39,"sa":0.86,"df":40,"sd":30,"rarity":2,"bst":350,"starter":false,"gen":4},
  {"dex":409,"name":"Rampardos","types":["rock"],"hp":114,"spd":102,"atk":1.61,"pa":1.61,"sa":1.06,"df":60,"sd":50,"rarity":4,"bst":495,"starter":false,"gen":4},
  {"dex":410,"name":"Shieldon","types":["rock","steel"],"hp":84,"spd":91,"atk":0.93,"pa":0.93,"sa":0.93,"df":118,"sd":88,"rarity":2,"bst":350,"starter":false,"gen":4},
  {"dex":411,"name":"Bastiodon","types":["rock","steel"],"hp":97,"spd":91,"atk":0.99,"pa":0.99,"sa":0.96,"df":168,"sd":138,"rarity":4,"bst":495,"starter":false,"gen":4},
  {"dex":412,"name":"Burmy","types":["bug"],"hp":88,"spd":93,"atk":0.86,"pa":0.86,"sa":0.86,"df":45,"sd":45,"rarity":1,"bst":224,"starter":false,"gen":4},
  {"dex":413,"name":"Wormadam","types":["bug","grass"],"hp":97,"spd":93,"atk":1.13,"pa":1.02,"sa":1.13,"df":85,"sd":105,"rarity":3,"bst":424,"starter":false,"gen":4},
  {"dex":414,"name":"Mothim","types":["bug","flying"],"hp":102,"spd":106,"atk":1.22,"pa":1.22,"sa":1.22,"df":50,"sd":50,"rarity":3,"bst":424,"starter":false,"gen":4},
  {"dex":415,"name":"Combee","types":["bug","flying"],"hp":84,"spd":107,"atk":0.86,"pa":0.86,"sa":0.86,"df":42,"sd":42,"rarity":1,"bst":244,"starter":false,"gen":4},
  {"dex":416,"name":"Vespiquen","types":["bug","flying"],"hp":102,"spd":95,"atk":1.14,"pa":1.14,"sa":1.14,"df":102,"sd":102,"rarity":3,"bst":474,"starter":false,"gen":4},
  {"dex":417,"name":"Pachirisu","types":["electric"],"hp":97,"spd":118,"atk":0.95,"pa":0.95,"sa":0.95,"df":70,"sd":90,"rarity":2,"bst":405,"starter":false,"gen":4},
  {"dex":418,"name":"Buizel","types":["water"],"hp":95,"spd":114,"atk":1.06,"pa":1.06,"sa":1.03,"df":35,"sd":30,"rarity":2,"bst":330,"starter":false,"gen":4},
  {"dex":419,"name":"Floatzel","types":["water"],"hp":108,"spd":126,"atk":1.28,"pa":1.28,"sa":1.17,"df":55,"sd":50,"rarity":4,"bst":495,"starter":false,"gen":4},
  {"dex":420,"name":"Cherubi","types":["grass"],"hp":90,"spd":93,"atk":1.04,"pa":0.89,"sa":1.04,"df":45,"sd":53,"rarity":1,"bst":275,"starter":false,"gen":4},
  {"dex":421,"name":"Cherrim","types":["grass"],"hp":102,"spd":114,"atk":1.18,"pa":1.03,"sa":1.18,"df":70,"sd":78,"rarity":3,"bst":450,"starter":false,"gen":4},
  {"dex":422,"name":"Shellos","types":["water"],"hp":104,"spd":92,"atk":1.01,"pa":0.96,"sa":1.01,"df":48,"sd":62,"rarity":2,"bst":325,"starter":false,"gen":4},
  {"dex":423,"name":"Gastrodon","types":["water","ground"],"hp":120,"spd":94,"atk":1.21,"pa":1.16,"sa":1.21,"df":68,"sd":82,"rarity":3,"bst":475,"starter":false,"gen":4},
  {"dex":424,"name":"Ambipom","types":["normal"],"hp":104,"spd":126,"atk":1.25,"pa":1.25,"sa":1.03,"df":66,"sd":66,"rarity":3,"bst":482,"starter":false,"gen":4},
  {"dex":425,"name":"Drifloon","types":["ghost","flying"],"hp":110,"spd":107,"atk":1.03,"pa":0.97,"sa":1.03,"df":34,"sd":44,"rarity":2,"bst":348,"starter":false,"gen":4},
  {"dex":426,"name":"Drifblim","types":["ghost","flying"],"hp":138,"spd":112,"atk":1.2,"pa":1.14,"sa":1.2,"df":44,"sd":54,"rarity":4,"bst":498,"starter":false,"gen":4},
  {"dex":427,"name":"Buneary","types":["normal"],"hp":95,"spd":114,"atk":1.06,"pa":1.06,"sa":0.94,"df":44,"sd":56,"rarity":2,"bst":350,"starter":false,"gen":4},
  {"dex":428,"name":"Lopunny","types":["normal"],"hp":99,"spd":122,"atk":1.12,"pa":1.12,"sa":1,"df":84,"sd":96,"rarity":3,"bst":480,"starter":false,"gen":4},
  {"dex":429,"name":"Mismagius","types":["ghost"],"hp":97,"spd":122,"atk":1.28,"pa":1.03,"sa":1.28,"df":60,"sd":105,"rarity":4,"bst":495,"starter":false,"gen":4},
  {"dex":430,"name":"Honchkrow","types":["dark","flying"],"hp":115,"spd":108,"atk":1.39,"pa":1.39,"sa":1.28,"df":52,"sd":52,"rarity":4,"bst":505,"starter":false,"gen":4},
  {"dex":431,"name":"Glameow","types":["normal"],"hp":92,"spd":114,"atk":1,"pa":1,"sa":0.93,"df":42,"sd":37,"rarity":1,"bst":310,"starter":false,"gen":4},
  {"dex":432,"name":"Purugly","types":["normal"],"hp":102,"spd":125,"atk":1.15,"pa":1.15,"sa":1.05,"df":64,"sd":59,"rarity":3,"bst":452,"starter":false,"gen":4},
  {"dex":433,"name":"Chingling","types":["psychic"],"hp":90,"spd":97,"atk":1.06,"pa":0.86,"sa":1.06,"df":50,"sd":50,"rarity":1,"bst":285,"starter":false,"gen":4},
  {"dex":434,"name":"Stunky","types":["poison","dark"],"hp":98,"spd":109,"atk":1.05,"pa":1.05,"sa":0.93,"df":47,"sd":41,"rarity":2,"bst":329,"starter":false,"gen":4},
  {"dex":435,"name":"Skuntank","types":["poison","dark"],"hp":116,"spd":113,"atk":1.21,"pa":1.21,"sa":1.09,"df":67,"sd":61,"rarity":3,"bst":479,"starter":false,"gen":4},
  {"dex":436,"name":"Bronzor","types":["steel","psychic"],"hp":96,"spd":88,"atk":0.83,"pa":0.83,"sa":0.83,"df":86,"sd":86,"rarity":1,"bst":300,"starter":false,"gen":4},
  {"dex":437,"name":"Bronzong","types":["steel","psychic"],"hp":100,"spd":92,"atk":1.19,"pa":1.19,"sa":1.13,"df":116,"sd":116,"rarity":4,"bst":500,"starter":false,"gen":4},
  {"dex":438,"name":"Bonsly","types":["rock"],"hp":92,"spd":82,"atk":1.14,"pa":1.14,"sa":0.76,"df":95,"sd":45,"rarity":1,"bst":290,"starter":false,"gen":4},
  {"dex":439,"name":"Mime Jr.","types":["psychic","fairy"],"hp":79,"spd":103,"atk":1.08,"pa":0.84,"sa":1.08,"df":45,"sd":90,"rarity":1,"bst":310,"starter":false,"gen":4},
  {"dex":440,"name":"Happiny","types":["normal"],"hp":115,"spd":91,"atk":0.78,"pa":0.73,"sa":0.78,"df":5,"sd":65,"rarity":1,"bst":220,"starter":false,"gen":4},
  {"dex":441,"name":"Chatot","types":["normal","flying"],"hp":104,"spd":116,"atk":1.21,"pa":1.06,"sa":1.21,"df":45,"sd":42,"rarity":3,"bst":411,"starter":false,"gen":4},
  {"dex":442,"name":"Spiritomb","types":["ghost","dark"],"hp":92,"spd":93,"atk":1.21,"pa":1.21,"sa":1.21,"df":108,"sd":108,"rarity":3,"bst":485,"starter":false,"gen":4},
  {"dex":443,"name":"Gible","types":["dragon","ground"],"hp":96,"spd":96,"atk":1.08,"pa":1.08,"sa":0.92,"df":45,"sd":45,"rarity":1,"bst":300,"starter":false,"gen":4},
  {"dex":444,"name":"Gabite","types":["dragon","ground"],"hp":101,"spd":112,"atk":1.2,"pa":1.2,"sa":0.97,"df":65,"sd":55,"rarity":3,"bst":410,"starter":false,"gen":4},
  {"dex":445,"name":"Garchomp","types":["dragon","ground"],"hp":119,"spd":121,"atk":1.42,"pa":1.42,"sa":1.14,"df":95,"sd":85,"rarity":5,"bst":600,"starter":false,"gen":4},
  {"dex":446,"name":"Munchlax","types":["normal"],"hp":131,"spd":80,"atk":1.17,"pa":1.17,"sa":0.92,"df":40,"sd":85,"rarity":2,"bst":390,"starter":false,"gen":4},
  {"dex":447,"name":"Riolu","types":["fighting"],"hp":88,"spd":103,"atk":1.08,"pa":1.08,"sa":0.89,"df":40,"sd":40,"rarity":1,"bst":285,"starter":false,"gen":4},
  {"dex":448,"name":"Lucario","types":["fighting","steel"],"hp":102,"spd":116,"atk":1.33,"pa":1.31,"sa":1.33,"df":70,"sd":70,"rarity":4,"bst":525,"starter":false,"gen":4},
  {"dex":449,"name":"Hippopotas","types":["ground"],"hp":101,"spd":91,"atk":1.1,"pa":1.1,"sa":0.91,"df":78,"sd":42,"rarity":2,"bst":330,"starter":false,"gen":4},
  {"dex":450,"name":"Hippowdon","types":["ground"],"hp":119,"spd":98,"atk":1.32,"pa":1.32,"sa":1.07,"df":118,"sd":72,"rarity":4,"bst":525,"starter":false,"gen":4},
  {"dex":451,"name":"Skorupi","types":["poison","bug"],"hp":88,"spd":105,"atk":0.97,"pa":0.97,"sa":0.86,"df":90,"sd":55,"rarity":2,"bst":330,"starter":false,"gen":4},
  {"dex":452,"name":"Drapion","types":["poison","dark"],"hp":102,"spd":118,"atk":1.2,"pa":1.2,"sa":1.03,"df":110,"sd":75,"rarity":4,"bst":500,"starter":false,"gen":4},
  {"dex":453,"name":"Croagunk","types":["poison","fighting"],"hp":92,"spd":99,"atk":1.04,"pa":1.04,"sa":1.04,"df":40,"sd":40,"rarity":1,"bst":300,"starter":false,"gen":4},
  {"dex":454,"name":"Toxicroak","types":["poison","fighting"],"hp":107,"spd":114,"atk":1.28,"pa":1.28,"sa":1.17,"df":65,"sd":65,"rarity":3,"bst":490,"starter":false,"gen":4},
  {"dex":455,"name":"Carnivine","types":["grass"],"hp":103,"spd":97,"atk":1.25,"pa":1.25,"sa":1.2,"df":72,"sd":72,"rarity":3,"bst":454,"starter":false,"gen":4},
  {"dex":456,"name":"Finneon","types":["water"],"hp":92,"spd":106,"atk":0.97,"pa":0.97,"sa":0.97,"df":56,"sd":61,"rarity":2,"bst":330,"starter":false,"gen":4},
  {"dex":457,"name":"Lumineon","types":["water"],"hp":101,"spd":116,"atk":1.08,"pa":1.08,"sa":1.08,"df":76,"sd":86,"rarity":3,"bst":460,"starter":false,"gen":4},
  {"dex":458,"name":"Mantyke","types":["water","flying"],"hp":90,"spd":99,"atk":1.03,"pa":0.81,"sa":1.03,"df":50,"sd":120,"rarity":2,"bst":345,"starter":false,"gen":4},
  {"dex":459,"name":"Snover","types":["grass","ice"],"hp":97,"spd":95,"atk":1.04,"pa":1.04,"sa":1.04,"df":50,"sd":60,"rarity":2,"bst":334,"starter":false,"gen":4},
  {"dex":460,"name":"Abomasnow","types":["grass","ice"],"hp":110,"spd":103,"atk":1.21,"pa":1.21,"sa":1.21,"df":75,"sd":85,"rarity":3,"bst":494,"starter":false,"gen":4},
  {"dex":461,"name":"Weavile","types":["dark","ice"],"hp":102,"spd":130,"atk":1.36,"pa":1.36,"sa":0.95,"df":65,"sd":85,"rarity":4,"bst":510,"starter":false,"gen":4},
  {"dex":462,"name":"Magnezone","types":["electric","steel"],"hp":102,"spd":103,"atk":1.42,"pa":1.08,"sa":1.42,"df":115,"sd":90,"rarity":4,"bst":535,"starter":false,"gen":4},
  {"dex":463,"name":"Lickilicky","types":["normal"],"hp":120,"spd":99,"atk":1.17,"pa":1.17,"sa":1.14,"df":95,"sd":95,"rarity":4,"bst":515,"starter":false,"gen":4},
  {"dex":464,"name":"Rhyperior","types":["ground","rock"],"hp":122,"spd":95,"atk":1.47,"pa":1.47,"sa":1,"df":130,"sd":55,"rarity":4,"bst":535,"starter":false,"gen":4},
  {"dex":465,"name":"Tangrowth","types":["grass"],"hp":115,"spd":99,"atk":1.31,"pa":1.25,"sa":1.31,"df":125,"sd":50,"rarity":4,"bst":535,"starter":false,"gen":4},
  {"dex":466,"name":"Electivire","types":["electric"],"hp":104,"spd":118,"atk":1.38,"pa":1.38,"sa":1.22,"df":67,"sd":85,"rarity":4,"bst":540,"starter":false,"gen":4},
  {"dex":467,"name":"Magmortar","types":["fire"],"hp":104,"spd":113,"atk":1.39,"pa":1.22,"sa":1.39,"df":67,"sd":95,"rarity":4,"bst":540,"starter":false,"gen":4},
  {"dex":468,"name":"Togekiss","types":["fairy","flying"],"hp":108,"spd":112,"atk":1.36,"pa":0.97,"sa":1.36,"df":95,"sd":115,"rarity":4,"bst":545,"starter":false,"gen":4},
  {"dex":469,"name":"Yanmega","types":["bug","flying"],"hp":109,"spd":118,"atk":1.34,"pa":1.12,"sa":1.34,"df":86,"sd":56,"rarity":4,"bst":515,"starter":false,"gen":4},
  {"dex":470,"name":"Leafeon","types":["grass"],"hp":99,"spd":118,"atk":1.31,"pa":1.31,"sa":1.03,"df":130,"sd":65,"rarity":4,"bst":525,"starter":false,"gen":4},
  {"dex":471,"name":"Glaceon","types":["ice"],"hp":99,"spd":105,"atk":1.42,"pa":1.03,"sa":1.42,"df":110,"sd":95,"rarity":4,"bst":525,"starter":false,"gen":4},
  {"dex":472,"name":"Gliscor","types":["ground","flying"],"hp":104,"spd":118,"atk":1.22,"pa":1.22,"sa":0.95,"df":125,"sd":75,"rarity":4,"bst":510,"starter":false,"gen":4},
  {"dex":473,"name":"Mamoswine","types":["ice","ground"],"hp":120,"spd":112,"atk":1.42,"pa":1.42,"sa":1.08,"df":80,"sd":60,"rarity":4,"bst":530,"starter":false,"gen":4},
  {"dex":474,"name":"Porygon-Z","types":["normal"],"hp":108,"spd":116,"atk":1.44,"pa":1.14,"sa":1.44,"df":70,"sd":75,"rarity":4,"bst":535,"starter":false,"gen":4},
  {"dex":475,"name":"Gallade","types":["psychic","fighting"],"hp":101,"spd":112,"atk":1.39,"pa":1.39,"sa":1.06,"df":65,"sd":115,"rarity":4,"bst":518,"starter":false,"gen":4},
  {"dex":476,"name":"Probopass","types":["rock","steel"],"hp":97,"spd":95,"atk":1.11,"pa":1,"sa":1.11,"df":145,"sd":150,"rarity":4,"bst":525,"starter":false,"gen":4},
  {"dex":477,"name":"Dusknoir","types":["ghost"],"hp":90,"spd":97,"atk":1.25,"pa":1.25,"sa":1.06,"df":135,"sd":135,"rarity":4,"bst":525,"starter":false,"gen":4},
  {"dex":478,"name":"Froslass","types":["ice","ghost"],"hp":102,"spd":124,"atk":1.14,"pa":1.14,"sa":1.14,"df":70,"sd":70,"rarity":3,"bst":480,"starter":false,"gen":4},
  {"dex":479,"name":"Rotom","types":["electric","ghost"],"hp":92,"spd":116,"atk":1.22,"pa":0.97,"sa":1.22,"df":77,"sd":77,"rarity":3,"bst":440,"starter":false,"gen":4},
  {"dex":480,"name":"Uxie","types":["psychic"],"hp":104,"spd":118,"atk":1.11,"pa":1.11,"sa":1.11,"df":130,"sd":130,"rarity":5,"bst":580,"starter":false,"gen":4,"leg":true},
  {"dex":481,"name":"Mesprit","types":["psychic"],"hp":106,"spd":112,"atk":1.28,"pa":1.28,"sa":1.28,"df":105,"sd":105,"rarity":5,"bst":580,"starter":false,"gen":4,"leg":true},
  {"dex":482,"name":"Azelf","types":["psychic"],"hp":104,"spd":126,"atk":1.39,"pa":1.39,"sa":1.39,"df":70,"sd":70,"rarity":5,"bst":580,"starter":false,"gen":4,"leg":true},
  {"dex":483,"name":"Dialga","types":["steel","dragon"],"hp":115,"spd":116,"atk":1.52,"pa":1.36,"sa":1.52,"df":120,"sd":100,"rarity":5,"bst":680,"starter":false,"gen":4,"leg":true},
  {"dex":484,"name":"Palkia","types":["water","dragon"],"hp":110,"spd":120,"atk":1.52,"pa":1.36,"sa":1.52,"df":100,"sd":120,"rarity":5,"bst":680,"starter":false,"gen":4,"leg":true},
  {"dex":485,"name":"Heatran","types":["fire","steel"],"hp":111,"spd":110,"atk":1.42,"pa":1.2,"sa":1.42,"df":106,"sd":106,"rarity":5,"bst":600,"starter":false,"gen":4,"leg":true},
  {"dex":486,"name":"Regigigas","types":["normal"],"hp":120,"spd":120,"atk":1.58,"pa":1.58,"sa":1.14,"df":110,"sd":110,"rarity":5,"bst":670,"starter":false,"gen":4,"leg":true},
  {"dex":487,"name":"Giratina","types":["ghost","dragon"],"hp":138,"spd":116,"atk":1.25,"pa":1.25,"sa":1.25,"df":120,"sd":120,"rarity":5,"bst":680,"starter":false,"gen":4,"leg":true},
  {"dex":488,"name":"Cresselia","types":["psychic"],"hp":124,"spd":114,"atk":1.11,"pa":1.08,"sa":1.11,"df":110,"sd":120,"rarity":5,"bst":580,"starter":false,"gen":4,"leg":true},
  {"dex":489,"name":"Phione","types":["water"],"hp":106,"spd":112,"atk":1.14,"pa":1.14,"sa":1.14,"df":80,"sd":80,"rarity":5,"bst":480,"starter":false,"gen":4,"leg":true},
  {"dex":490,"name":"Manaphy","types":["water"],"hp":115,"spd":120,"atk":1.25,"pa":1.25,"sa":1.25,"df":100,"sd":100,"rarity":5,"bst":600,"starter":false,"gen":4,"leg":true},
  {"dex":491,"name":"Darkrai","types":["dark"],"hp":102,"spd":130,"atk":1.44,"pa":1.2,"sa":1.44,"df":90,"sd":90,"rarity":5,"bst":600,"starter":false,"gen":4,"leg":true},
  {"dex":492,"name":"Shaymin","types":["grass"],"hp":115,"spd":120,"atk":1.25,"pa":1.25,"sa":1.25,"df":100,"sd":100,"rarity":5,"bst":600,"starter":false,"gen":4,"leg":true},
  {"dex":493,"name":"Arceus","types":["normal"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true},
  {"dex":494,"name":"Victini","types":["psychic","fire"],"hp":115,"spd":120,"atk":1.25,"pa":1.25,"sa":1.25,"df":100,"sd":100,"rarity":5,"bst":600,"starter":false,"gen":5,"leg":true},
  {"dex":495,"name":"Snivy","types":["grass"],"hp":90,"spd":104,"atk":0.95,"pa":0.95,"sa":0.95,"df":55,"sd":55,"rarity":1,"bst":308,"starter":true,"gen":5},
  {"dex":496,"name":"Servine","types":["grass"],"hp":97,"spd":113,"atk":1.03,"pa":1.03,"sa":1.03,"df":75,"sd":75,"rarity":3,"bst":413,"starter":false,"gen":5},
  {"dex":497,"name":"Serperior","types":["grass"],"hp":104,"spd":125,"atk":1.11,"pa":1.11,"sa":1.11,"df":95,"sd":95,"rarity":4,"bst":528,"starter":false,"gen":5},
  {"dex":498,"name":"Tepig","types":["fire"],"hp":99,"spd":97,"atk":1.05,"pa":1.05,"sa":0.95,"df":45,"sd":45,"rarity":1,"bst":308,"starter":true,"gen":5},
  {"dex":499,"name":"Pignite","types":["fire","fighting"],"hp":110,"spd":101,"atk":1.21,"pa":1.21,"sa":1.08,"df":55,"sd":55,"rarity":3,"bst":418,"starter":false,"gen":5},
  {"dex":500,"name":"Emboar","types":["fire","fighting"],"hp":120,"spd":105,"atk":1.38,"pa":1.38,"sa":1.25,"df":65,"sd":65,"rarity":4,"bst":528,"starter":false,"gen":5},
  {"dex":501,"name":"Oshawott","types":["water"],"hp":95,"spd":97,"atk":1.05,"pa":1,"sa":1.05,"df":45,"sd":45,"rarity":1,"bst":308,"starter":true,"gen":5},
  {"dex":502,"name":"Dewott","types":["water"],"hp":104,"spd":103,"atk":1.16,"pa":1.11,"sa":1.16,"df":60,"sd":60,"rarity":3,"bst":413,"starter":false,"gen":5},
  {"dex":503,"name":"Samurott","types":["water"],"hp":113,"spd":107,"atk":1.29,"pa":1.25,"sa":1.29,"df":85,"sd":70,"rarity":4,"bst":528,"starter":false,"gen":5},
  {"dex":504,"name":"Patrat","types":["normal"],"hp":90,"spd":96,"atk":1,"pa":1,"sa":0.89,"df":39,"sd":39,"rarity":1,"bst":255,"starter":false,"gen":5},
  {"dex":505,"name":"Watchog","types":["normal"],"hp":97,"spd":110,"atk":1.17,"pa":1.17,"sa":1.03,"df":69,"sd":69,"rarity":3,"bst":420,"starter":false,"gen":5},
  {"dex":506,"name":"Lillipup","types":["normal"],"hp":90,"spd":101,"atk":1.03,"pa":1.03,"sa":0.84,"df":45,"sd":45,"rarity":1,"bst":275,"starter":false,"gen":5},
  {"dex":507,"name":"Herdier","types":["normal"],"hp":99,"spd":103,"atk":1.14,"pa":1.14,"sa":0.89,"df":65,"sd":65,"rarity":2,"bst":370,"starter":false,"gen":5},
  {"dex":508,"name":"Stoutland","types":["normal"],"hp":108,"spd":112,"atk":1.31,"pa":1.31,"sa":0.95,"df":90,"sd":90,"rarity":4,"bst":500,"starter":false,"gen":5},
  {"dex":509,"name":"Purrloin","types":["dark"],"hp":88,"spd":106,"atk":0.97,"pa":0.97,"sa":0.97,"df":37,"sd":37,"rarity":1,"bst":281,"starter":false,"gen":5},
  {"dex":510,"name":"Liepard","types":["dark"],"hp":99,"spd":123,"atk":1.18,"pa":1.18,"sa":1.18,"df":50,"sd":50,"rarity":3,"bst":446,"starter":false,"gen":5},
  {"dex":511,"name":"Pansage","types":["grass"],"hp":92,"spd":105,"atk":0.99,"pa":0.99,"sa":0.99,"df":48,"sd":48,"rarity":1,"bst":316,"starter":false,"gen":5},
  {"dex":512,"name":"Simisage","types":["grass"],"hp":104,"spd":120,"atk":1.24,"pa":1.24,"sa":1.24,"df":63,"sd":63,"rarity":4,"bst":498,"starter":false,"gen":5},
  {"dex":513,"name":"Pansear","types":["fire"],"hp":92,"spd":105,"atk":0.99,"pa":0.99,"sa":0.99,"df":48,"sd":48,"rarity":1,"bst":316,"starter":false,"gen":5},
  {"dex":514,"name":"Simisear","types":["fire"],"hp":104,"spd":120,"atk":1.24,"pa":1.24,"sa":1.24,"df":63,"sd":63,"rarity":4,"bst":498,"starter":false,"gen":5},
  {"dex":515,"name":"Panpour","types":["water"],"hp":92,"spd":105,"atk":0.99,"pa":0.99,"sa":0.99,"df":48,"sd":48,"rarity":1,"bst":316,"starter":false,"gen":5},
  {"dex":516,"name":"Simipour","types":["water"],"hp":104,"spd":120,"atk":1.24,"pa":1.24,"sa":1.24,"df":63,"sd":63,"rarity":4,"bst":498,"starter":false,"gen":5},
  {"dex":517,"name":"Munna","types":["psychic"],"hp":104,"spd":88,"atk":1.07,"pa":0.84,"sa":1.07,"df":45,"sd":55,"rarity":1,"bst":292,"starter":false,"gen":5},
  {"dex":518,"name":"Musharna","types":["psychic"],"hp":122,"spd":90,"atk":1.29,"pa":1,"sa":1.29,"df":85,"sd":95,"rarity":3,"bst":487,"starter":false,"gen":5},
  {"dex":519,"name":"Pidove","types":["normal","flying"],"hp":92,"spd":96,"atk":1,"pa":1,"sa":0.9,"df":50,"sd":30,"rarity":1,"bst":264,"starter":false,"gen":5},
  {"dex":520,"name":"Tranquill","types":["normal","flying"],"hp":98,"spd":105,"atk":1.12,"pa":1.12,"sa":0.97,"df":62,"sd":42,"rarity":2,"bst":358,"starter":false,"gen":5},
  {"dex":521,"name":"Unfezant","types":["normal","flying"],"hp":106,"spd":117,"atk":1.33,"pa":1.33,"sa":1.06,"df":80,"sd":55,"rarity":3,"bst":488,"starter":false,"gen":5},
  {"dex":522,"name":"Blitzle","types":["electric"],"hp":90,"spd":110,"atk":1.03,"pa":1.03,"sa":0.97,"df":32,"sd":32,"rarity":1,"bst":295,"starter":false,"gen":5},
  {"dex":523,"name":"Zebstrika","types":["electric"],"hp":104,"spd":127,"atk":1.25,"pa":1.25,"sa":1.14,"df":63,"sd":63,"rarity":4,"bst":497,"starter":false,"gen":5},
  {"dex":524,"name":"Roggenrola","types":["rock"],"hp":95,"spd":84,"atk":1.11,"pa":1.11,"sa":0.84,"df":85,"sd":25,"rarity":1,"bst":280,"starter":false,"gen":5},
  {"dex":525,"name":"Boldore","types":["rock"],"hp":102,"spd":86,"atk":1.28,"pa":1.28,"sa":0.97,"df":105,"sd":40,"rarity":2,"bst":390,"starter":false,"gen":5},
  {"dex":526,"name":"Gigalith","types":["rock"],"hp":108,"spd":88,"atk":1.44,"pa":1.44,"sa":1.03,"df":130,"sd":80,"rarity":4,"bst":515,"starter":false,"gen":5},
  {"dex":527,"name":"Woobat","types":["psychic","flying"],"hp":99,"spd":108,"atk":1,"pa":0.95,"sa":1,"df":43,"sd":43,"rarity":2,"bst":323,"starter":false,"gen":5},
  {"dex":528,"name":"Swoobat","types":["psychic","flying"],"hp":100,"spd":126,"atk":1.12,"pa":1.01,"sa":1.12,"df":55,"sd":55,"rarity":3,"bst":425,"starter":false,"gen":5},
  {"dex":529,"name":"Drilbur","types":["ground"],"hp":97,"spd":107,"atk":1.17,"pa":1.17,"sa":0.86,"df":40,"sd":45,"rarity":2,"bst":328,"starter":false,"gen":5},
  {"dex":530,"name":"Excadrill","types":["ground","steel"],"hp":120,"spd":115,"atk":1.44,"pa":1.44,"sa":0.97,"df":60,"sd":65,"rarity":4,"bst":508,"starter":false,"gen":5},
  {"dex":531,"name":"Audino","types":["normal"],"hp":116,"spd":99,"atk":1.03,"pa":1.03,"sa":1.03,"df":86,"sd":86,"rarity":3,"bst":445,"starter":false,"gen":5},
  {"dex":532,"name":"Timburr","types":["fighting"],"hp":104,"spd":93,"atk":1.14,"pa":1.14,"sa":0.84,"df":55,"sd":35,"rarity":1,"bst":305,"starter":false,"gen":5},
  {"dex":533,"name":"Gurdurr","types":["fighting"],"hp":108,"spd":95,"atk":1.28,"pa":1.28,"sa":0.92,"df":85,"sd":50,"rarity":2,"bst":405,"starter":false,"gen":5},
  {"dex":534,"name":"Conkeldurr","types":["fighting"],"hp":117,"spd":97,"atk":1.47,"pa":1.47,"sa":1,"df":95,"sd":65,"rarity":4,"bst":505,"starter":false,"gen":5},
  {"dex":535,"name":"Tympole","types":["water"],"hp":92,"spd":105,"atk":0.97,"pa":0.97,"sa":0.97,"df":40,"sd":40,"rarity":1,"bst":294,"starter":false,"gen":5},
  {"dex":536,"name":"Palpitoad","types":["water","ground"],"hp":104,"spd":107,"atk":1.06,"pa":1.06,"sa":1.06,"df":55,"sd":55,"rarity":2,"bst":384,"starter":false,"gen":5},
  {"dex":537,"name":"Seismitoad","types":["water","ground"],"hp":117,"spd":109,"atk":1.22,"pa":1.22,"sa":1.17,"df":75,"sd":75,"rarity":4,"bst":509,"starter":false,"gen":5},
  {"dex":538,"name":"Throh","types":["fighting"],"hp":124,"spd":97,"atk":1.25,"pa":1.25,"sa":0.86,"df":85,"sd":85,"rarity":3,"bst":465,"starter":false,"gen":5},
  {"dex":539,"name":"Sawk","types":["fighting"],"hp":104,"spd":114,"atk":1.39,"pa":1.39,"sa":0.86,"df":75,"sd":75,"rarity":3,"bst":465,"starter":false,"gen":5},
  {"dex":540,"name":"Sewaddle","types":["bug","grass"],"hp":90,"spd":96,"atk":0.99,"pa":0.99,"sa":0.92,"df":70,"sd":60,"rarity":1,"bst":310,"starter":false,"gen":5},
  {"dex":541,"name":"Swadloon","types":["bug","grass"],"hp":95,"spd":96,"atk":1.05,"pa":1.05,"sa":0.97,"df":90,"sd":80,"rarity":2,"bst":380,"starter":false,"gen":5},
  {"dex":542,"name":"Leavanny","types":["bug","grass"],"hp":104,"spd":117,"atk":1.27,"pa":1.27,"sa":1.08,"df":80,"sd":80,"rarity":4,"bst":500,"starter":false,"gen":5},
  {"dex":543,"name":"Venipede","types":["bug","poison"],"hp":84,"spd":102,"atk":0.95,"pa":0.95,"sa":0.86,"df":59,"sd":39,"rarity":1,"bst":260,"starter":false,"gen":5},
  {"dex":544,"name":"Whirlipede","types":["bug","poison"],"hp":88,"spd":98,"atk":1,"pa":1,"sa":0.92,"df":99,"sd":79,"rarity":2,"bst":360,"starter":false,"gen":5},
  {"dex":545,"name":"Scolipede","types":["bug","poison"],"hp":97,"spd":125,"atk":1.25,"pa":1.25,"sa":1,"df":89,"sd":69,"rarity":3,"bst":485,"starter":false,"gen":5},
  {"dex":546,"name":"Cottonee","types":["grass","fairy"],"hp":88,"spd":106,"atk":0.9,"pa":0.85,"sa":0.9,"df":60,"sd":50,"rarity":1,"bst":280,"starter":false,"gen":5},
  {"dex":547,"name":"Whimsicott","types":["grass","fairy"],"hp":97,"spd":127,"atk":1.12,"pa":1.07,"sa":1.12,"df":85,"sd":75,"rarity":3,"bst":480,"starter":false,"gen":5},
  {"dex":548,"name":"Petilil","types":["grass"],"hp":90,"spd":91,"atk":1.08,"pa":0.89,"sa":1.08,"df":50,"sd":50,"rarity":1,"bst":280,"starter":false,"gen":5},
  {"dex":549,"name":"Lilligant","types":["grass"],"hp":102,"spd":116,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":75,"rarity":3,"bst":480,"starter":false,"gen":5},
  {"dex":550,"name":"Basculin","types":["water"],"hp":102,"spd":119,"atk":1.21,"pa":1.21,"sa":1.14,"df":65,"sd":55,"rarity":3,"bst":460,"starter":false,"gen":5},
  {"dex":551,"name":"Sandile","types":["ground","dark"],"hp":92,"spd":105,"atk":1.1,"pa":1.1,"sa":0.89,"df":35,"sd":35,"rarity":1,"bst":292,"starter":false,"gen":5},
  {"dex":552,"name":"Krokorok","types":["ground","dark"],"hp":97,"spd":109,"atk":1.15,"pa":1.15,"sa":0.95,"df":45,"sd":45,"rarity":2,"bst":351,"starter":false,"gen":5},
  {"dex":553,"name":"Krookodile","types":["ground","dark"],"hp":113,"spd":117,"atk":1.34,"pa":1.34,"sa":1.06,"df":80,"sd":70,"rarity":4,"bst":519,"starter":false,"gen":5},
  {"dex":554,"name":"Darumaka","types":["fire"],"hp":102,"spd":99,"atk":1.2,"pa":1.2,"sa":0.78,"df":45,"sd":45,"rarity":1,"bst":315,"starter":false,"gen":5},
  {"dex":555,"name":"Darmanitan","types":["fire"],"hp":117,"spd":118,"atk":1.47,"pa":1.47,"sa":0.86,"df":55,"sd":55,"rarity":3,"bst":480,"starter":false,"gen":5},
  {"dex":556,"name":"Maractus","types":["grass"],"hp":104,"spd":103,"atk":1.28,"pa":1.17,"sa":1.28,"df":67,"sd":67,"rarity":3,"bst":461,"starter":false,"gen":5},
  {"dex":557,"name":"Dwebble","types":["bug","rock"],"hp":92,"spd":101,"atk":1.06,"pa":1.06,"sa":0.89,"df":85,"sd":35,"rarity":2,"bst":325,"starter":false,"gen":5},
  {"dex":558,"name":"Crustle","types":["bug","rock"],"hp":102,"spd":97,"atk":1.28,"pa":1.28,"sa":1.06,"df":125,"sd":75,"rarity":3,"bst":485,"starter":false,"gen":5},
  {"dex":559,"name":"Scraggy","types":["dark","fighting"],"hp":92,"spd":98,"atk":1.11,"pa":1.11,"sa":0.89,"df":70,"sd":70,"rarity":2,"bst":348,"starter":false,"gen":5},
  {"dex":560,"name":"Scrafty","types":["dark","fighting"],"hp":99,"spd":102,"atk":1.2,"pa":1.2,"sa":0.95,"df":115,"sd":115,"rarity":3,"bst":488,"starter":false,"gen":5},
  {"dex":561,"name":"Sigilyph","types":["psychic","flying"],"hp":102,"spd":119,"atk":1.27,"pa":1.02,"sa":1.27,"df":80,"sd":80,"rarity":3,"bst":490,"starter":false,"gen":5},
  {"dex":562,"name":"Yamask","types":["ghost"],"hp":87,"spd":91,"atk":1,"pa":0.86,"sa":1,"df":85,"sd":65,"rarity":1,"bst":303,"starter":false,"gen":5},
  {"dex":563,"name":"Cofagrigus","types":["ghost"],"hp":96,"spd":91,"atk":1.22,"pa":0.97,"sa":1.22,"df":145,"sd":105,"rarity":3,"bst":483,"starter":false,"gen":5},
  {"dex":564,"name":"Tirtouga","types":["water","rock"],"hp":94,"spd":87,"atk":1.13,"pa":1.13,"sa":0.99,"df":103,"sd":45,"rarity":2,"bst":355,"starter":false,"gen":5},
  {"dex":565,"name":"Carracosta","types":["water","rock"],"hp":103,"spd":91,"atk":1.29,"pa":1.29,"sa":1.16,"df":133,"sd":65,"rarity":4,"bst":495,"starter":false,"gen":5},
  {"dex":566,"name":"Archen","types":["rock","flying"],"hp":95,"spd":107,"atk":1.32,"pa":1.32,"sa":1.11,"df":45,"sd":45,"rarity":2,"bst":401,"starter":false,"gen":5},
  {"dex":567,"name":"Archeops","types":["rock","flying"],"hp":104,"spd":124,"atk":1.47,"pa":1.47,"sa":1.32,"df":65,"sd":65,"rarity":4,"bst":567,"starter":false,"gen":5},
  {"dex":568,"name":"Trubbish","types":["poison"],"hp":92,"spd":105,"atk":0.97,"pa":0.97,"sa":0.92,"df":62,"sd":62,"rarity":2,"bst":329,"starter":false,"gen":5},
  {"dex":569,"name":"Garbodor","types":["poison"],"hp":106,"spd":110,"atk":1.22,"pa":1.22,"sa":1.03,"df":82,"sd":82,"rarity":3,"bst":474,"starter":false,"gen":5},
  {"dex":570,"name":"Zorua","types":["dark"],"hp":88,"spd":105,"atk":1.14,"pa":1.06,"sa":1.14,"df":40,"sd":40,"rarity":2,"bst":330,"starter":false,"gen":5},
  {"dex":571,"name":"Zoroark","types":["dark"],"hp":97,"spd":122,"atk":1.36,"pa":1.28,"sa":1.36,"df":60,"sd":60,"rarity":4,"bst":510,"starter":false,"gen":5},
  {"dex":572,"name":"Minccino","types":["normal"],"hp":95,"spd":110,"atk":0.97,"pa":0.97,"sa":0.92,"df":40,"sd":40,"rarity":1,"bst":300,"starter":false,"gen":5},
  {"dex":573,"name":"Cinccino","types":["normal"],"hp":104,"spd":126,"atk":1.22,"pa":1.22,"sa":1.06,"df":60,"sd":60,"rarity":3,"bst":470,"starter":false,"gen":5},
  {"dex":574,"name":"Gothita","types":["psychic"],"hp":90,"spd":97,"atk":1,"pa":0.86,"sa":1,"df":50,"sd":65,"rarity":1,"bst":290,"starter":false,"gen":5},
  {"dex":575,"name":"Gothorita","types":["psychic"],"hp":97,"spd":101,"atk":1.11,"pa":0.95,"sa":1.11,"df":70,"sd":85,"rarity":2,"bst":390,"starter":false,"gen":5},
  {"dex":576,"name":"Gothitelle","types":["psychic"],"hp":102,"spd":105,"atk":1.22,"pa":1,"sa":1.22,"df":95,"sd":110,"rarity":3,"bst":490,"starter":false,"gen":5},
  {"dex":577,"name":"Solosis","types":["psychic"],"hp":90,"spd":86,"atk":1.28,"pa":0.86,"sa":1.28,"df":40,"sd":50,"rarity":1,"bst":290,"starter":false,"gen":5},
  {"dex":578,"name":"Duosion","types":["psychic"],"hp":99,"spd":91,"atk":1.39,"pa":0.92,"sa":1.39,"df":50,"sd":60,"rarity":2,"bst":370,"starter":false,"gen":5},
  {"dex":579,"name":"Reuniclus","types":["psychic"],"hp":120,"spd":91,"atk":1.39,"pa":1.06,"sa":1.39,"df":75,"sd":85,"rarity":3,"bst":490,"starter":false,"gen":5},
  {"dex":580,"name":"Ducklett","types":["water","flying"],"hp":98,"spd":101,"atk":0.94,"pa":0.94,"sa":0.94,"df":50,"sd":50,"rarity":1,"bst":305,"starter":false,"gen":5},
  {"dex":581,"name":"Swanna","types":["water","flying"],"hp":104,"spd":119,"atk":1.18,"pa":1.18,"sa":1.18,"df":63,"sd":63,"rarity":3,"bst":473,"starter":false,"gen":5},
  {"dex":582,"name":"Vanillite","types":["ice"],"hp":86,"spd":96,"atk":1.06,"pa":0.97,"sa":1.06,"df":50,"sd":60,"rarity":1,"bst":305,"starter":false,"gen":5},
  {"dex":583,"name":"Vanillish","types":["ice"],"hp":93,"spd":103,"atk":1.14,"pa":1.06,"sa":1.14,"df":65,"sd":75,"rarity":2,"bst":395,"starter":false,"gen":5},
  {"dex":584,"name":"Vanilluxe","types":["ice"],"hp":102,"spd":111,"atk":1.31,"pa":1.22,"sa":1.31,"df":85,"sd":95,"rarity":4,"bst":535,"starter":false,"gen":5},
  {"dex":585,"name":"Deerling","types":["normal","grass"],"hp":97,"spd":110,"atk":1.03,"pa":1.03,"sa":0.92,"df":50,"sd":50,"rarity":2,"bst":335,"starter":false,"gen":5},
  {"dex":586,"name":"Sawsbuck","types":["normal","grass"],"hp":106,"spd":118,"atk":1.25,"pa":1.25,"sa":1.03,"df":70,"sd":70,"rarity":3,"bst":475,"starter":false,"gen":5},
  {"dex":587,"name":"Emolga","types":["electric","flying"],"hp":95,"spd":121,"atk":1.11,"pa":1.11,"sa":1.11,"df":60,"sd":60,"rarity":3,"bst":428,"starter":false,"gen":5},
  {"dex":588,"name":"Karrablast","types":["bug"],"hp":92,"spd":103,"atk":1.11,"pa":1.11,"sa":0.92,"df":45,"sd":45,"rarity":1,"bst":315,"starter":false,"gen":5},
  {"dex":589,"name":"Escavalier","types":["bug","steel"],"hp":102,"spd":86,"atk":1.44,"pa":1.44,"sa":1.03,"df":105,"sd":105,"rarity":4,"bst":495,"starter":false,"gen":5},
  {"dex":590,"name":"Foongus","types":["grass","poison"],"hp":101,"spd":84,"atk":1,"pa":1,"sa":1,"df":45,"sd":55,"rarity":1,"bst":294,"starter":false,"gen":5},
  {"dex":591,"name":"Amoonguss","types":["grass","poison"],"hp":121,"spd":91,"atk":1.17,"pa":1.17,"sa":1.17,"df":70,"sd":80,"rarity":3,"bst":464,"starter":false,"gen":5},
  {"dex":592,"name":"Frillish","types":["water","ghost"],"hp":95,"spd":95,"atk":1.06,"pa":0.92,"sa":1.06,"df":50,"sd":85,"rarity":2,"bst":335,"starter":false,"gen":5},
  {"dex":593,"name":"Jellicent","types":["water","ghost"],"hp":115,"spd":103,"atk":1.17,"pa":1.03,"sa":1.17,"df":70,"sd":105,"rarity":3,"bst":480,"starter":false,"gen":5},
  {"dex":594,"name":"Alomomola","types":["water"],"hp":144,"spd":105,"atk":1.11,"pa":1.11,"sa":0.92,"df":80,"sd":45,"rarity":3,"bst":470,"starter":false,"gen":5},
  {"dex":595,"name":"Joltik","types":["bug","electric"],"hp":92,"spd":105,"atk":1.01,"pa":0.96,"sa":1.01,"df":50,"sd":50,"rarity":1,"bst":319,"starter":false,"gen":5},
  {"dex":596,"name":"Galvantula","types":["bug","electric"],"hp":102,"spd":123,"atk":1.23,"pa":1.12,"sa":1.23,"df":60,"sd":60,"rarity":3,"bst":472,"starter":false,"gen":5},
  {"dex":597,"name":"Ferroseed","types":["grass","steel"],"hp":90,"spd":82,"atk":0.97,"pa":0.97,"sa":0.83,"df":91,"sd":86,"rarity":1,"bst":305,"starter":false,"gen":5},
  {"dex":598,"name":"Ferrothorn","types":["grass","steel"],"hp":103,"spd":86,"atk":1.22,"pa":1.22,"sa":1,"df":131,"sd":116,"rarity":3,"bst":489,"starter":false,"gen":5},
  {"dex":599,"name":"Klink","types":["steel"],"hp":88,"spd":91,"atk":1,"pa":1,"sa":0.95,"df":70,"sd":60,"rarity":1,"bst":300,"starter":false,"gen":5},
  {"dex":600,"name":"Klang","types":["steel"],"hp":97,"spd":99,"atk":1.14,"pa":1.14,"sa":1.08,"df":95,"sd":85,"rarity":3,"bst":440,"starter":false,"gen":5},
  {"dex":601,"name":"Klinklang","types":["steel"],"hp":97,"spd":116,"atk":1.25,"pa":1.25,"sa":1.08,"df":115,"sd":85,"rarity":4,"bst":520,"starter":false,"gen":5},
  {"dex":602,"name":"Tynamo","types":["electric"],"hp":86,"spd":103,"atk":1,"pa":1,"sa":0.95,"df":40,"sd":40,"rarity":1,"bst":275,"starter":false,"gen":5},
  {"dex":603,"name":"Eelektrik","types":["electric"],"hp":99,"spd":95,"atk":1.17,"pa":1.17,"sa":1.11,"df":70,"sd":70,"rarity":2,"bst":405,"starter":false,"gen":5},
  {"dex":604,"name":"Eelektross","types":["electric"],"hp":108,"spd":99,"atk":1.33,"pa":1.33,"sa":1.28,"df":80,"sd":80,"rarity":4,"bst":515,"starter":false,"gen":5},
  {"dex":605,"name":"Elgyem","types":["psychic"],"hp":95,"spd":91,"atk":1.17,"pa":1,"sa":1.17,"df":55,"sd":55,"rarity":2,"bst":335,"starter":false,"gen":5},
  {"dex":606,"name":"Beheeyem","types":["psychic"],"hp":104,"spd":95,"atk":1.39,"pa":1.11,"sa":1.39,"df":75,"sd":95,"rarity":3,"bst":485,"starter":false,"gen":5},
  {"dex":607,"name":"Litwick","types":["ghost","fire"],"hp":92,"spd":86,"atk":1.06,"pa":0.86,"sa":1.06,"df":55,"sd":55,"rarity":1,"bst":275,"starter":false,"gen":5},
  {"dex":608,"name":"Lampent","types":["ghost","fire"],"hp":97,"spd":101,"atk":1.22,"pa":0.92,"sa":1.22,"df":60,"sd":60,"rarity":2,"bst":370,"starter":false,"gen":5},
  {"dex":609,"name":"Chandelure","types":["ghost","fire"],"hp":97,"spd":112,"atk":1.5,"pa":1,"sa":1.5,"df":90,"sd":90,"rarity":4,"bst":520,"starter":false,"gen":5},
  {"dex":610,"name":"Axew","types":["dragon"],"hp":91,"spd":102,"atk":1.18,"pa":1.18,"sa":0.86,"df":60,"sd":40,"rarity":2,"bst":320,"starter":false,"gen":5},
  {"dex":611,"name":"Fraxure","types":["dragon"],"hp":100,"spd":106,"atk":1.34,"pa":1.34,"sa":0.92,"df":70,"sd":50,"rarity":3,"bst":410,"starter":false,"gen":5},
  {"dex":612,"name":"Haxorus","types":["dragon"],"hp":104,"spd":119,"atk":1.51,"pa":1.51,"sa":1.03,"df":90,"sd":70,"rarity":4,"bst":540,"starter":false,"gen":5},
  {"dex":613,"name":"Cubchoo","types":["ice"],"hp":95,"spd":95,"atk":1.08,"pa":1.08,"sa":1.03,"df":40,"sd":40,"rarity":1,"bst":305,"starter":false,"gen":5},
  {"dex":614,"name":"Beartic","types":["ice"],"hp":113,"spd":99,"atk":1.42,"pa":1.42,"sa":1.08,"df":80,"sd":80,"rarity":4,"bst":505,"starter":false,"gen":5},
  {"dex":615,"name":"Cryogonal","types":["ice"],"hp":106,"spd":122,"atk":1.22,"pa":0.97,"sa":1.22,"df":50,"sd":135,"rarity":4,"bst":515,"starter":false,"gen":5},
  {"dex":616,"name":"Shelmet","types":["bug"],"hp":92,"spd":88,"atk":0.92,"pa":0.92,"sa":0.92,"df":85,"sd":65,"rarity":1,"bst":305,"starter":false,"gen":5},
  {"dex":617,"name":"Accelgor","types":["bug"],"hp":106,"spd":139,"atk":1.25,"pa":1.08,"sa":1.25,"df":40,"sd":60,"rarity":4,"bst":495,"starter":false,"gen":5},
  {"dex":618,"name":"Stunfisk","types":["ground","electric"],"hp":119,"spd":91,"atk":1.15,"pa":1.06,"sa":1.15,"df":84,"sd":99,"rarity":3,"bst":471,"starter":false,"gen":5},
  {"dex":619,"name":"Mienfoo","types":["fighting"],"hp":90,"spd":105,"atk":1.17,"pa":1.17,"sa":1,"df":50,"sd":50,"rarity":2,"bst":350,"starter":false,"gen":5},
  {"dex":620,"name":"Mienshao","types":["fighting"],"hp":99,"spd":122,"atk":1.39,"pa":1.39,"sa":1.22,"df":60,"sd":60,"rarity":4,"bst":510,"starter":false,"gen":5},
  {"dex":621,"name":"Druddigon","types":["dragon"],"hp":105,"spd":98,"atk":1.36,"pa":1.36,"sa":1.03,"df":90,"sd":90,"rarity":3,"bst":485,"starter":false,"gen":5},
  {"dex":622,"name":"Golett","types":["ground","ghost"],"hp":97,"spd":93,"atk":1.11,"pa":1.11,"sa":0.89,"df":50,"sd":50,"rarity":1,"bst":303,"starter":false,"gen":5},
  {"dex":623,"name":"Golurk","types":["ground","ghost"],"hp":110,"spd":101,"atk":1.38,"pa":1.38,"sa":1,"df":80,"sd":80,"rarity":3,"bst":483,"starter":false,"gen":5},
  {"dex":624,"name":"Pawniard","types":["dark","steel"],"hp":90,"spd":103,"atk":1.17,"pa":1.17,"sa":0.92,"df":70,"sd":40,"rarity":2,"bst":340,"starter":false,"gen":5},
  {"dex":625,"name":"Bisharp","types":["dark","steel"],"hp":99,"spd":107,"atk":1.39,"pa":1.39,"sa":1.03,"df":100,"sd":70,"rarity":3,"bst":490,"starter":false,"gen":5},
  {"dex":626,"name":"Bouffalant","types":["normal"],"hp":113,"spd":101,"atk":1.31,"pa":1.31,"sa":0.92,"df":95,"sd":95,"rarity":3,"bst":490,"starter":false,"gen":5},
  {"dex":627,"name":"Rufflet","types":["normal","flying"],"hp":102,"spd":103,"atk":1.16,"pa":1.16,"sa":0.9,"df":50,"sd":50,"rarity":2,"bst":350,"starter":false,"gen":5},
  {"dex":628,"name":"Braviary","types":["normal","flying"],"hp":115,"spd":112,"atk":1.38,"pa":1.38,"sa":1.01,"df":75,"sd":75,"rarity":4,"bst":510,"starter":false,"gen":5},
  {"dex":629,"name":"Vullaby","types":["dark","flying"],"hp":102,"spd":103,"atk":1,"pa":1,"sa":0.95,"df":75,"sd":65,"rarity":2,"bst":370,"starter":false,"gen":5},
  {"dex":630,"name":"Mandibuzz","types":["dark","flying"],"hp":120,"spd":112,"atk":1.06,"pa":1.06,"sa":1,"df":105,"sd":95,"rarity":4,"bst":510,"starter":false,"gen":5},
  {"dex":631,"name":"Heatmor","types":["fire"],"hp":108,"spd":105,"atk":1.28,"pa":1.23,"sa":1.28,"df":66,"sd":66,"rarity":3,"bst":484,"starter":false,"gen":5},
  {"dex":632,"name":"Durant","types":["bug","steel"],"hp":96,"spd":124,"atk":1.3,"pa":1.3,"sa":0.96,"df":112,"sd":48,"rarity":3,"bst":484,"starter":false,"gen":5},
  {"dex":633,"name":"Deino","types":["dark","dragon"],"hp":93,"spd":94,"atk":1.06,"pa":1.06,"sa":0.95,"df":50,"sd":50,"rarity":1,"bst":300,"starter":false,"gen":5},
  {"dex":634,"name":"Zweilous","types":["dark","dragon"],"hp":102,"spd":102,"atk":1.17,"pa":1.17,"sa":1.06,"df":70,"sd":70,"rarity":3,"bst":420,"starter":false,"gen":5},
  {"dex":635,"name":"Hydreigon","types":["dark","dragon"],"hp":111,"spd":119,"atk":1.39,"pa":1.28,"sa":1.39,"df":90,"sd":90,"rarity":5,"bst":600,"starter":false,"gen":5},
  {"dex":636,"name":"Larvesta","types":["bug","fire"],"hp":95,"spd":103,"atk":1.17,"pa":1.17,"sa":0.97,"df":55,"sd":55,"rarity":2,"bst":360,"starter":false,"gen":5},
  {"dex":637,"name":"Volcarona","types":["bug","fire"],"hp":108,"spd":120,"atk":1.44,"pa":1.03,"sa":1.44,"df":65,"sd":105,"rarity":4,"bst":550,"starter":false,"gen":5},
  {"dex":638,"name":"Cobalion","types":["steel","fighting"],"hp":111,"spd":123,"atk":1.2,"pa":1.2,"sa":1.2,"df":129,"sd":72,"rarity":5,"bst":580,"starter":false,"gen":5,"leg":true},
  {"dex":639,"name":"Terrakion","types":["rock","fighting"],"hp":111,"spd":123,"atk":1.41,"pa":1.41,"sa":1.1,"df":90,"sd":90,"rarity":5,"bst":580,"starter":false,"gen":5,"leg":true},
  {"dex":640,"name":"Virizion","types":["grass","fighting"],"hp":111,"spd":123,"atk":1.2,"pa":1.2,"sa":1.2,"df":72,"sd":129,"rarity":5,"bst":580,"starter":false,"gen":5,"leg":true},
  {"dex":641,"name":"Tornadus","types":["flying"],"hp":106,"spd":125,"atk":1.39,"pa":1.33,"sa":1.39,"df":70,"sd":80,"rarity":5,"bst":580,"starter":false,"gen":5,"leg":true},
  {"dex":642,"name":"Thundurus","types":["electric","flying"],"hp":106,"spd":125,"atk":1.39,"pa":1.33,"sa":1.39,"df":70,"sd":80,"rarity":5,"bst":580,"starter":false,"gen":5,"leg":true},
  {"dex":643,"name":"Reshiram","types":["dragon","fire"],"hp":115,"spd":116,"atk":1.52,"pa":1.36,"sa":1.52,"df":100,"sd":120,"rarity":5,"bst":680,"starter":false,"gen":5,"leg":true},
  {"dex":644,"name":"Zekrom","types":["dragon","electric"],"hp":115,"spd":116,"atk":1.52,"pa":1.52,"sa":1.36,"df":120,"sd":100,"rarity":5,"bst":680,"starter":false,"gen":5,"leg":true},
  {"dex":645,"name":"Landorus","types":["ground","flying"],"hp":110,"spd":120,"atk":1.39,"pa":1.39,"sa":1.33,"df":90,"sd":80,"rarity":5,"bst":600,"starter":false,"gen":5,"leg":true},
  {"dex":646,"name":"Kyurem","types":["dragon","ice"],"hp":126,"spd":118,"atk":1.42,"pa":1.42,"sa":1.42,"df":90,"sd":90,"rarity":5,"bst":660,"starter":false,"gen":5,"leg":true},
  {"dex":647,"name":"Keldeo","types":["water","fighting"],"hp":111,"spd":123,"atk":1.41,"pa":1.1,"sa":1.41,"df":90,"sd":90,"rarity":5,"bst":580,"starter":false,"gen":5,"leg":true},
  {"dex":648,"name":"Meloetta","types":["normal","psychic"],"hp":115,"spd":116,"atk":1.4,"pa":1.12,"sa":1.4,"df":77,"sd":128,"rarity":5,"bst":600,"starter":false,"gen":5,"leg":true},
  {"dex":649,"name":"Genesect","types":["bug","steel"],"hp":102,"spd":120,"atk":1.36,"pa":1.36,"sa":1.36,"df":95,"sd":95,"rarity":5,"bst":600,"starter":false,"gen":5,"leg":true},
  {"dex":650,"name":"Chespin","types":["grass"],"hp":95,"spd":94,"atk":1.04,"pa":1.04,"sa":0.96,"df":65,"sd":45,"rarity":1,"bst":313,"starter":true,"gen":6},
  {"dex":651,"name":"Quilladin","types":["grass"],"hp":97,"spd":102,"atk":1.13,"pa":1.13,"sa":1.01,"df":95,"sd":58,"rarity":2,"bst":405,"starter":false,"gen":6},
  {"dex":652,"name":"Chesnaught","types":["grass","fighting"],"hp":110,"spd":105,"atk":1.29,"pa":1.29,"sa":1.11,"df":122,"sd":75,"rarity":4,"bst":530,"starter":false,"gen":6},
  {"dex":653,"name":"Fennekin","types":["fire"],"hp":88,"spd":103,"atk":1.04,"pa":0.95,"sa":1.04,"df":40,"sd":60,"rarity":1,"bst":307,"starter":true,"gen":6},
  {"dex":654,"name":"Braixen","types":["fire"],"hp":97,"spd":109,"atk":1.2,"pa":1.02,"sa":1.2,"df":58,"sd":70,"rarity":2,"bst":409,"starter":false,"gen":6},
  {"dex":655,"name":"Delphox","types":["fire","psychic"],"hp":104,"spd":122,"atk":1.33,"pa":1.08,"sa":1.33,"df":72,"sd":100,"rarity":4,"bst":534,"starter":false,"gen":6},
  {"dex":656,"name":"Froakie","types":["water"],"hp":88,"spd":108,"atk":1.04,"pa":1.01,"sa":1.04,"df":40,"sd":44,"rarity":1,"bst":314,"starter":true,"gen":6},
  {"dex":657,"name":"Frogadier","types":["water"],"hp":94,"spd":119,"atk":1.16,"pa":1.05,"sa":1.16,"df":52,"sd":56,"rarity":2,"bst":405,"starter":false,"gen":6},
  {"dex":658,"name":"Greninja","types":["water","dark"],"hp":102,"spd":129,"atk":1.27,"pa":1.22,"sa":1.27,"df":67,"sd":71,"rarity":4,"bst":530,"starter":false,"gen":6},
  {"dex":659,"name":"Bunnelby","types":["normal"],"hp":87,"spd":102,"atk":0.9,"pa":0.9,"sa":0.88,"df":38,"sd":36,"rarity":1,"bst":237,"starter":false,"gen":6},
  {"dex":660,"name":"Diggersby","types":["normal","ground"],"hp":108,"spd":111,"atk":1.01,"pa":1.01,"sa":0.97,"df":77,"sd":77,"rarity":3,"bst":423,"starter":false,"gen":6},
  {"dex":661,"name":"Fletchling","types":["normal","flying"],"hp":90,"spd":104,"atk":0.97,"pa":0.97,"sa":0.92,"df":43,"sd":38,"rarity":1,"bst":278,"starter":false,"gen":6},
  {"dex":662,"name":"Fletchinder","types":["fire","flying"],"hp":98,"spd":113,"atk":1.1,"pa":1.1,"sa":1.01,"df":55,"sd":52,"rarity":2,"bst":382,"starter":false,"gen":6},
  {"dex":663,"name":"Talonflame","types":["fire","flying"],"hp":105,"spd":131,"atk":1.15,"pa":1.15,"sa":1.11,"df":71,"sd":69,"rarity":4,"bst":499,"starter":false,"gen":6},
  {"dex":664,"name":"Scatterbug","types":["bug"],"hp":87,"spd":93,"atk":0.89,"pa":0.89,"sa":0.85,"df":40,"sd":25,"rarity":1,"bst":200,"starter":false,"gen":6},
  {"dex":665,"name":"Spewpa","types":["bug"],"hp":90,"spd":90,"atk":0.85,"pa":0.82,"sa":0.85,"df":60,"sd":30,"rarity":1,"bst":213,"starter":false,"gen":6},
  {"dex":666,"name":"Vivillon","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6},
  {"dex":667,"name":"Litleo","types":["fire","normal"],"hp":98,"spd":108,"atk":1.1,"pa":0.97,"sa":1.1,"df":58,"sd":54,"rarity":2,"bst":369,"starter":false,"gen":6},
  {"dex":668,"name":"Pyroar","types":["fire","normal"],"hp":109,"spd":123,"atk":1.3,"pa":1.07,"sa":1.3,"df":72,"sd":66,"rarity":4,"bst":507,"starter":false,"gen":6},
  {"dex":669,"name":"Flabébé","types":["fairy"],"hp":90,"spd":96,"atk":1.04,"pa":0.91,"sa":1.04,"df":39,"sd":79,"rarity":1,"bst":303,"starter":false,"gen":6},
  {"dex":670,"name":"Floette","types":["fairy"],"hp":94,"spd":100,"atk":1.11,"pa":0.95,"sa":1.11,"df":47,"sd":98,"rarity":2,"bst":371,"starter":false,"gen":6},
  {"dex":671,"name":"Florges","types":["fairy"],"hp":105,"spd":110,"atk":1.32,"pa":1.06,"sa":1.32,"df":68,"sd":154,"rarity":4,"bst":552,"starter":false,"gen":6},
  {"dex":672,"name":"Skiddo","types":["grass"],"hp":100,"spd":100,"atk":1.06,"pa":1.06,"sa":1.04,"df":48,"sd":57,"rarity":2,"bst":350,"starter":false,"gen":6},
  {"dex":673,"name":"Gogoat","types":["grass"],"hp":125,"spd":107,"atk":1.25,"pa":1.25,"sa":1.23,"df":62,"sd":81,"rarity":4,"bst":531,"starter":false,"gen":6},
  {"dex":674,"name":"Pancham","types":["fighting"],"hp":100,"spd":96,"atk":1.15,"pa":1.15,"sa":0.95,"df":62,"sd":48,"rarity":2,"bst":348,"starter":false,"gen":6},
  {"dex":675,"name":"Pangoro","types":["fighting","dark"],"hp":113,"spd":102,"atk":1.38,"pa":1.38,"sa":1.08,"df":78,"sd":71,"rarity":4,"bst":495,"starter":false,"gen":6},
  {"dex":676,"name":"Furfrou","types":["normal"],"hp":104,"spd":121,"atk":1.14,"pa":1.14,"sa":1.06,"df":60,"sd":90,"rarity":3,"bst":472,"starter":false,"gen":6},
  {"dex":677,"name":"Espurr","types":["psychic"],"hp":98,"spd":107,"atk":1.05,"pa":0.96,"sa":1.05,"df":54,"sd":60,"rarity":2,"bst":355,"starter":false,"gen":6},
  {"dex":678,"name":"Meowstic","types":["psychic"],"hp":103,"spd":122,"atk":1.16,"pa":0.96,"sa":1.16,"df":76,"sd":81,"rarity":3,"bst":466,"starter":false,"gen":6},
  {"dex":679,"name":"Honedge","types":["steel","ghost"],"hp":90,"spd":90,"atk":1.14,"pa":1.14,"sa":0.89,"df":100,"sd":37,"rarity":2,"bst":325,"starter":false,"gen":6},
  {"dex":680,"name":"Doublade","types":["steel","ghost"],"hp":97,"spd":93,"atk":1.31,"pa":1.31,"sa":0.95,"df":150,"sd":49,"rarity":3,"bst":448,"starter":false,"gen":6},
  {"dex":681,"name":"Aegislash","types":["steel","ghost"],"hp":97,"spd":103,"atk":0.97,"pa":0.97,"sa":0.97,"df":140,"sd":140,"rarity":4,"bst":500,"starter":false,"gen":6},
  {"dex":682,"name":"Spritzee","types":["fairy"],"hp":105,"spd":88,"atk":1.05,"pa":0.99,"sa":1.05,"df":60,"sd":65,"rarity":2,"bst":341,"starter":false,"gen":6},
  {"dex":683,"name":"Aromatisse","types":["fairy"],"hp":115,"spd":90,"atk":1.24,"pa":1.1,"sa":1.24,"df":72,"sd":89,"rarity":3,"bst":462,"starter":false,"gen":6},
  {"dex":684,"name":"Swirlix","types":["fairy"],"hp":98,"spd":99,"atk":1.02,"pa":0.96,"sa":1.02,"df":66,"sd":57,"rarity":2,"bst":341,"starter":false,"gen":6},
  {"dex":685,"name":"Slurpuff","types":["fairy"],"hp":107,"spd":108,"atk":1.17,"pa":1.14,"sa":1.17,"df":86,"sd":75,"rarity":3,"bst":480,"starter":false,"gen":6},
  {"dex":686,"name":"Inkay","types":["dark","psychic"],"hp":94,"spd":97,"atk":1,"pa":1,"sa":0.9,"df":53,"sd":46,"rarity":1,"bst":288,"starter":false,"gen":6},
  {"dex":687,"name":"Malamar","types":["dark","psychic"],"hp":109,"spd":109,"atk":1.21,"pa":1.21,"sa":1.07,"df":88,"sd":75,"rarity":3,"bst":482,"starter":false,"gen":6},
  {"dex":688,"name":"Binacle","types":["rock","water"],"hp":89,"spd":99,"atk":0.99,"pa":0.99,"sa":0.91,"df":67,"sd":56,"rarity":1,"bst":306,"starter":false,"gen":6},
  {"dex":689,"name":"Barbaracle","types":["rock","water"],"hp":102,"spd":107,"atk":1.28,"pa":1.28,"sa":1,"df":115,"sd":86,"rarity":4,"bst":500,"starter":false,"gen":6},
  {"dex":690,"name":"Skrelp","types":["poison","water"],"hp":92,"spd":91,"atk":1.03,"pa":1.03,"sa":1.03,"df":60,"sd":60,"rarity":2,"bst":320,"starter":false,"gen":6},
  {"dex":691,"name":"Dragalge","types":["poison","dragon"],"hp":99,"spd":96,"atk":1.23,"pa":1.11,"sa":1.23,"df":90,"sd":123,"rarity":3,"bst":494,"starter":false,"gen":6},
  {"dex":692,"name":"Clauncher","types":["water"],"hp":92,"spd":96,"atk":1.02,"pa":0.99,"sa":1.02,"df":62,"sd":63,"rarity":2,"bst":330,"starter":false,"gen":6},
  {"dex":693,"name":"Clawitzer","types":["water"],"hp":102,"spd":103,"atk":1.36,"pa":1.1,"sa":1.36,"df":88,"sd":89,"rarity":4,"bst":500,"starter":false,"gen":6},
  {"dex":694,"name":"Helioptile","types":["electric","normal"],"hp":90,"spd":107,"atk":1.04,"pa":0.91,"sa":1.04,"df":33,"sd":43,"rarity":1,"bst":289,"starter":false,"gen":6},
  {"dex":695,"name":"Heliolisk","types":["electric","normal"],"hp":98,"spd":124,"atk":1.3,"pa":1,"sa":1.3,"df":52,"sd":94,"rarity":3,"bst":481,"starter":false,"gen":6},
  {"dex":696,"name":"Tyrunt","types":["rock","dragon"],"hp":96,"spd":98,"atk":1.19,"pa":1.19,"sa":0.95,"df":77,"sd":45,"rarity":2,"bst":362,"starter":false,"gen":6},
  {"dex":697,"name":"Tyrantrum","types":["rock","dragon"],"hp":107,"spd":108,"atk":1.37,"pa":1.37,"sa":1.08,"df":119,"sd":59,"rarity":4,"bst":521,"starter":false,"gen":6},
  {"dex":698,"name":"Amaura","types":["rock","ice"],"hp":105,"spd":97,"atk":1.07,"pa":1.02,"sa":1.07,"df":50,"sd":63,"rarity":2,"bst":362,"starter":false,"gen":6},
  {"dex":699,"name":"Aurorus","types":["rock","ice"],"hp":125,"spd":102,"atk":1.24,"pa":1.12,"sa":1.24,"df":72,"sd":92,"rarity":4,"bst":521,"starter":false,"gen":6},
  {"dex":700,"name":"Sylveon","types":["fairy"],"hp":113,"spd":103,"atk":1.31,"pa":1.06,"sa":1.31,"df":65,"sd":130,"rarity":4,"bst":525,"starter":false,"gen":6},
  {"dex":701,"name":"Hawlucha","types":["fighting","flying"],"hp":105,"spd":128,"atk":1.21,"pa":1.21,"sa":1.11,"df":75,"sd":63,"rarity":4,"bst":500,"starter":false,"gen":6},
  {"dex":702,"name":"Dedenne","types":["electric","fairy"],"hp":100,"spd":120,"atk":1.15,"pa":1.02,"sa":1.15,"df":57,"sd":67,"rarity":3,"bst":431,"starter":false,"gen":6},
  {"dex":703,"name":"Carbink","types":["rock","fairy"],"hp":92,"spd":99,"atk":0.97,"pa":0.97,"sa":0.97,"df":150,"sd":150,"rarity":4,"bst":500,"starter":false,"gen":6},
  {"dex":704,"name":"Goomy","types":["dragon"],"hp":90,"spd":95,"atk":1,"pa":0.97,"sa":1,"df":35,"sd":75,"rarity":1,"bst":300,"starter":false,"gen":6},
  {"dex":705,"name":"Sliggoo","types":["dragon"],"hp":101,"spd":103,"atk":1.16,"pa":1.11,"sa":1.16,"df":53,"sd":113,"rarity":3,"bst":452,"starter":false,"gen":6},
  {"dex":706,"name":"Goodra","types":["dragon"],"hp":110,"spd":112,"atk":1.31,"pa":1.25,"sa":1.31,"df":70,"sd":150,"rarity":5,"bst":600,"starter":false,"gen":6},
  {"dex":707,"name":"Klefki","types":["steel","fairy"],"hp":96,"spd":110,"atk":1.14,"pa":1.14,"sa":1.14,"df":91,"sd":87,"rarity":3,"bst":470,"starter":false,"gen":6},
  {"dex":708,"name":"Phantump","types":["ghost","grass"],"hp":89,"spd":94,"atk":1.08,"pa":1.08,"sa":0.97,"df":48,"sd":60,"rarity":1,"bst":309,"starter":false,"gen":6},
  {"dex":709,"name":"Trevenant","types":["ghost","grass"],"hp":108,"spd":102,"atk":1.31,"pa":1.31,"sa":1.06,"df":76,"sd":82,"rarity":3,"bst":474,"starter":false,"gen":6},
  {"dex":710,"name":"Pumpkaboo","types":["ghost","grass"],"hp":92,"spd":99,"atk":1.06,"pa":1.06,"sa":0.94,"df":70,"sd":55,"rarity":2,"bst":335,"starter":false,"gen":6},
  {"dex":711,"name":"Gourgeist","types":["ghost","grass"],"hp":99,"spd":113,"atk":1.2,"pa":1.2,"sa":1.02,"df":122,"sd":75,"rarity":3,"bst":494,"starter":false,"gen":6},
  {"dex":712,"name":"Bergmite","types":["ice"],"hp":95,"spd":90,"atk":1.08,"pa":1.08,"sa":0.88,"df":85,"sd":35,"rarity":1,"bst":304,"starter":false,"gen":6},
  {"dex":713,"name":"Avalugg","types":["ice"],"hp":113,"spd":90,"atk":1.34,"pa":1.34,"sa":0.94,"df":184,"sd":46,"rarity":4,"bst":514,"starter":false,"gen":6},
  {"dex":714,"name":"Noibat","types":["flying","dragon"],"hp":88,"spd":101,"atk":0.95,"pa":0.86,"sa":0.95,"df":35,"sd":40,"rarity":1,"bst":245,"starter":false,"gen":6},
  {"dex":715,"name":"Noivern","types":["flying","dragon"],"hp":108,"spd":130,"atk":1.23,"pa":1.08,"sa":1.23,"df":80,"sd":80,"rarity":4,"bst":535,"starter":false,"gen":6},
  {"dex":716,"name":"Xerneas","types":["fairy"],"hp":127,"spd":120,"atk":1.42,"pa":1.42,"sa":1.42,"df":95,"sd":98,"rarity":5,"bst":680,"starter":false,"gen":6,"leg":true},
  {"dex":717,"name":"Yveltal","types":["dark","flying"],"hp":127,"spd":120,"atk":1.42,"pa":1.42,"sa":1.42,"df":95,"sd":98,"rarity":5,"bst":680,"starter":false,"gen":6,"leg":true},
  {"dex":718,"name":"Zygarde","types":["dragon","ground"],"hp":119,"spd":118,"atk":1.25,"pa":1.25,"sa":1.15,"df":121,"sd":95,"rarity":5,"bst":600,"starter":false,"gen":6,"leg":true},
  {"dex":719,"name":"Diancie","types":["rock","fairy"],"hp":92,"spd":99,"atk":1.25,"pa":1.25,"sa":1.25,"df":150,"sd":150,"rarity":5,"bst":600,"starter":false,"gen":6,"leg":true},
  {"dex":720,"name":"Hoopa","types":["psychic","ghost"],"hp":106,"spd":107,"atk":1.52,"pa":1.31,"sa":1.52,"df":60,"sd":130,"rarity":5,"bst":600,"starter":false,"gen":6,"leg":true},
  {"dex":721,"name":"Volcanion","types":["fire","water"],"hp":106,"spd":107,"atk":1.42,"pa":1.31,"sa":1.42,"df":120,"sd":90,"rarity":5,"bst":600,"starter":false,"gen":6,"leg":true},
  {"dex":722,"name":"Rowlet","types":["grass","flying"],"hp":101,"spd":96,"atk":1,"pa":1,"sa":0.97,"df":55,"sd":50,"rarity":2,"bst":320,"starter":true,"gen":7},
  {"dex":723,"name":"Dartrix","types":["grass","flying"],"hp":105,"spd":100,"atk":1.11,"pa":1.11,"sa":1.08,"df":75,"sd":70,"rarity":3,"bst":420,"starter":false,"gen":7},
  {"dex":724,"name":"Decidueye","types":["grass","ghost"],"hp":105,"spd":107,"atk":1.29,"pa":1.29,"sa":1.25,"df":75,"sd":100,"rarity":4,"bst":530,"starter":false,"gen":7},
  {"dex":725,"name":"Litten","types":["fire"],"hp":90,"spd":107,"atk":1.06,"pa":1.06,"sa":1.03,"df":40,"sd":40,"rarity":2,"bst":320,"starter":true,"gen":7},
  {"dex":726,"name":"Torracat","types":["fire"],"hp":99,"spd":116,"atk":1.17,"pa":1.17,"sa":1.14,"df":50,"sd":50,"rarity":3,"bst":420,"starter":false,"gen":7},
  {"dex":727,"name":"Incineroar","types":["fire","dark"],"hp":113,"spd":103,"atk":1.33,"pa":1.33,"sa":1.14,"df":90,"sd":90,"rarity":4,"bst":530,"starter":false,"gen":7},
  {"dex":728,"name":"Popplio","types":["water"],"hp":92,"spd":95,"atk":1.06,"pa":1,"sa":1.06,"df":54,"sd":56,"rarity":2,"bst":320,"starter":true,"gen":7},
  {"dex":729,"name":"Brionne","types":["water"],"hp":97,"spd":99,"atk":1.2,"pa":1.08,"sa":1.2,"df":69,"sd":81,"rarity":3,"bst":420,"starter":false,"gen":7},
  {"dex":730,"name":"Primarina","types":["water","fairy"],"hp":106,"spd":103,"atk":1.39,"pa":1.11,"sa":1.39,"df":74,"sd":116,"rarity":4,"bst":530,"starter":false,"gen":7},
  {"dex":731,"name":"Pikipek","types":["normal","flying"],"hp":86,"spd":105,"atk":1.11,"pa":1.11,"sa":0.86,"df":30,"sd":30,"rarity":1,"bst":265,"starter":false,"gen":7},
  {"dex":732,"name":"Trumbeak","types":["normal","flying"],"hp":95,"spd":110,"atk":1.17,"pa":1.17,"sa":0.92,"df":50,"sd":50,"rarity":2,"bst":355,"starter":false,"gen":7},
  {"dex":733,"name":"Toucannon","types":["normal","flying"],"hp":106,"spd":103,"atk":1.36,"pa":1.36,"sa":1.11,"df":75,"sd":75,"rarity":3,"bst":485,"starter":false,"gen":7},
  {"dex":734,"name":"Yungoos","types":["normal"],"hp":92,"spd":97,"atk":1.08,"pa":1.08,"sa":0.86,"df":30,"sd":30,"rarity":1,"bst":253,"starter":false,"gen":7},
  {"dex":735,"name":"Gumshoos","types":["normal"],"hp":110,"spd":97,"atk":1.31,"pa":1.31,"sa":1,"df":60,"sd":60,"rarity":3,"bst":418,"starter":false,"gen":7},
  {"dex":736,"name":"Grubbin","types":["bug"],"hp":91,"spd":97,"atk":1.04,"pa":1.04,"sa":1,"df":45,"sd":45,"rarity":1,"bst":300,"starter":false,"gen":7},
  {"dex":737,"name":"Charjabug","types":["bug","electric"],"hp":96,"spd":93,"atk":1.15,"pa":1.15,"sa":1,"df":95,"sd":75,"rarity":2,"bst":400,"starter":false,"gen":7},
  {"dex":738,"name":"Vikavolt","types":["bug","electric"],"hp":105,"spd":96,"atk":1.5,"pa":1.08,"sa":1.5,"df":90,"sd":75,"rarity":4,"bst":500,"starter":false,"gen":7},
  {"dex":739,"name":"Crabrawler","types":["fighting"],"hp":91,"spd":104,"atk":1.15,"pa":1.15,"sa":0.93,"df":57,"sd":47,"rarity":2,"bst":338,"starter":false,"gen":7},
  {"dex":740,"name":"Crabominable","types":["fighting","ice"],"hp":114,"spd":96,"atk":1.43,"pa":1.43,"sa":1.04,"df":77,"sd":67,"rarity":3,"bst":478,"starter":false,"gen":7},
  {"dex":741,"name":"Oricorio","types":["fire","flying"],"hp":104,"spd":117,"atk":1.24,"pa":1.08,"sa":1.24,"df":70,"sd":70,"rarity":3,"bst":476,"starter":false,"gen":7},
  {"dex":742,"name":"Cutiefly","types":["bug","fairy"],"hp":88,"spd":113,"atk":1,"pa":0.95,"sa":1,"df":40,"sd":40,"rarity":1,"bst":304,"starter":false,"gen":7},
  {"dex":743,"name":"Ribombee","types":["bug","fairy"],"hp":97,"spd":130,"atk":1.22,"pa":1,"sa":1.22,"df":60,"sd":70,"rarity":3,"bst":464,"starter":false,"gen":7},
  {"dex":744,"name":"Rockruff","types":["rock"],"hp":90,"spd":103,"atk":1.06,"pa":1.06,"sa":0.86,"df":40,"sd":40,"rarity":1,"bst":280,"starter":false,"gen":7},
  {"dex":745,"name":"Lycanroc","types":["rock"],"hp":104,"spd":125,"atk":1.33,"pa":1.33,"sa":1,"df":65,"sd":65,"rarity":3,"bst":487,"starter":false,"gen":7},
  {"dex":746,"name":"Wishiwashi","types":["water"],"hp":90,"spd":95,"atk":0.84,"pa":0.81,"sa":0.84,"df":20,"sd":25,"rarity":1,"bst":175,"starter":false,"gen":7},
  {"dex":747,"name":"Mareanie","types":["poison","water"],"hp":92,"spd":97,"atk":0.99,"pa":0.99,"sa":0.94,"df":62,"sd":52,"rarity":1,"bst":305,"starter":false,"gen":7},
  {"dex":748,"name":"Toxapex","types":["poison","water"],"hp":92,"spd":93,"atk":1.05,"pa":1.05,"sa":0.99,"df":152,"sd":142,"rarity":4,"bst":495,"starter":false,"gen":7},
  {"dex":749,"name":"Mudbray","types":["ground"],"hp":102,"spd":97,"atk":1.25,"pa":1.25,"sa":0.95,"df":70,"sd":55,"rarity":2,"bst":385,"starter":false,"gen":7},
  {"dex":750,"name":"Mudsdale","types":["ground"],"hp":115,"spd":93,"atk":1.39,"pa":1.39,"sa":1,"df":100,"sd":85,"rarity":4,"bst":500,"starter":false,"gen":7},
  {"dex":751,"name":"Dewpider","types":["water","bug"],"hp":87,"spd":89,"atk":0.92,"pa":0.92,"sa":0.92,"df":52,"sd":72,"rarity":1,"bst":269,"starter":false,"gen":7},
  {"dex":752,"name":"Araquanid","types":["water","bug"],"hp":101,"spd":96,"atk":1.08,"pa":1.08,"sa":0.97,"df":92,"sd":132,"rarity":3,"bst":454,"starter":false,"gen":7},
  {"dex":753,"name":"Fomantis","types":["grass"],"hp":88,"spd":93,"atk":1,"pa":1,"sa":0.97,"df":35,"sd":35,"rarity":1,"bst":250,"starter":false,"gen":7},
  {"dex":754,"name":"Lurantis","types":["grass"],"hp":102,"spd":97,"atk":1.28,"pa":1.28,"sa":1.14,"df":90,"sd":90,"rarity":3,"bst":480,"starter":false,"gen":7},
  {"dex":755,"name":"Morelull","types":["grass","fairy"],"hp":88,"spd":84,"atk":1.06,"pa":0.89,"sa":1.06,"df":55,"sd":75,"rarity":1,"bst":285,"starter":false,"gen":7},
  {"dex":756,"name":"Shiinotic","types":["grass","fairy"],"hp":97,"spd":91,"atk":1.2,"pa":0.95,"sa":1.2,"df":80,"sd":100,"rarity":2,"bst":405,"starter":false,"gen":7},
  {"dex":757,"name":"Salandit","types":["poison","fire"],"hp":92,"spd":110,"atk":1.09,"pa":0.94,"sa":1.09,"df":40,"sd":40,"rarity":2,"bst":320,"starter":false,"gen":7},
  {"dex":758,"name":"Salazzle","types":["poison","fire"],"hp":101,"spd":127,"atk":1.31,"pa":1.05,"sa":1.31,"df":60,"sd":60,"rarity":3,"bst":480,"starter":false,"gen":7},
  {"dex":759,"name":"Stufful","types":["normal","fighting"],"hp":102,"spd":99,"atk":1.11,"pa":1.11,"sa":0.95,"df":50,"sd":50,"rarity":2,"bst":340,"starter":false,"gen":7},
  {"dex":760,"name":"Bewear","types":["normal","fighting"],"hp":124,"spd":103,"atk":1.39,"pa":1.39,"sa":1,"df":80,"sd":60,"rarity":4,"bst":500,"starter":false,"gen":7},
  {"dex":761,"name":"Bounsweet","types":["grass"],"hp":89,"spd":91,"atk":0.86,"pa":0.86,"sa":0.86,"df":38,"sd":38,"rarity":1,"bst":210,"starter":false,"gen":7},
  {"dex":762,"name":"Steenee","types":["grass"],"hp":93,"spd":104,"atk":0.92,"pa":0.92,"sa":0.92,"df":48,"sd":48,"rarity":1,"bst":290,"starter":false,"gen":7},
  {"dex":763,"name":"Tsareena","types":["grass"],"hp":102,"spd":108,"atk":1.36,"pa":1.36,"sa":0.97,"df":98,"sd":98,"rarity":4,"bst":510,"starter":false,"gen":7},
  {"dex":764,"name":"Comfey","types":["fairy"],"hp":93,"spd":120,"atk":1.15,"pa":0.99,"sa":1.15,"df":90,"sd":110,"rarity":3,"bst":485,"starter":false,"gen":7},
  {"dex":765,"name":"Oranguru","types":["normal","psychic"],"hp":110,"spd":103,"atk":1.2,"pa":1.03,"sa":1.2,"df":80,"sd":110,"rarity":3,"bst":490,"starter":false,"gen":7},
  {"dex":766,"name":"Passimian","types":["fighting"],"hp":115,"spd":112,"atk":1.36,"pa":1.36,"sa":0.92,"df":90,"sd":60,"rarity":3,"bst":490,"starter":false,"gen":7},
  {"dex":767,"name":"Wimpod","types":["bug","water"],"hp":81,"spd":112,"atk":0.89,"pa":0.89,"sa":0.81,"df":40,"sd":30,"rarity":1,"bst":230,"starter":false,"gen":7},
  {"dex":768,"name":"Golisopod","types":["bug","water"],"hp":104,"spd":95,"atk":1.39,"pa":1.39,"sa":1.03,"df":140,"sd":90,"rarity":4,"bst":530,"starter":false,"gen":7},
  {"dex":769,"name":"Sandygast","types":["ghost","ground"],"hp":95,"spd":84,"atk":1.08,"pa":1,"sa":1.08,"df":80,"sd":45,"rarity":2,"bst":320,"starter":false,"gen":7},
  {"dex":770,"name":"Palossand","types":["ghost","ground"],"hp":108,"spd":93,"atk":1.25,"pa":1.11,"sa":1.25,"df":110,"sd":75,"rarity":3,"bst":480,"starter":false,"gen":7},
  {"dex":771,"name":"Pyukumuku","types":["water"],"hp":95,"spd":80,"atk":1.03,"pa":1.03,"sa":0.86,"df":130,"sd":130,"rarity":3,"bst":410,"starter":false,"gen":7},
  {"dex":772,"name":"Código Cero","types":["normal"],"hp":113,"spd":103,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":534,"starter":false,"gen":7,"leg":true},
  {"dex":773,"name":"Silvally","types":["normal"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true},
  {"dex":774,"name":"Minior","types":["rock","flying"],"hp":97,"spd":103,"atk":1.03,"pa":1.03,"sa":1.03,"df":100,"sd":100,"rarity":3,"bst":440,"starter":false,"gen":7},
  {"dex":775,"name":"Komala","types":["normal"],"hp":99,"spd":105,"atk":1.33,"pa":1.33,"sa":1.11,"df":65,"sd":95,"rarity":3,"bst":480,"starter":false,"gen":7},
  {"dex":776,"name":"Turtonator","types":["fire","dragon"],"hp":97,"spd":93,"atk":1.2,"pa":1.13,"sa":1.2,"df":135,"sd":85,"rarity":3,"bst":485,"starter":false,"gen":7},
  {"dex":777,"name":"Togedemaru","types":["electric","steel"],"hp":99,"spd":118,"atk":1.24,"pa":1.24,"sa":0.92,"df":63,"sd":73,"rarity":3,"bst":435,"starter":false,"gen":7},
  {"dex":778,"name":"Mimikyu","types":["ghost","fairy"],"hp":95,"spd":118,"atk":1.2,"pa":1.2,"sa":0.97,"df":80,"sd":105,"rarity":3,"bst":476,"starter":false,"gen":7},
  {"dex":779,"name":"Bruxish","types":["water","psychic"],"hp":101,"spd":117,"atk":1.28,"pa":1.28,"sa":1.08,"df":70,"sd":70,"rarity":3,"bst":475,"starter":false,"gen":7},
  {"dex":780,"name":"Drampa","types":["normal","dragon"],"hp":105,"spd":93,"atk":1.44,"pa":1.03,"sa":1.44,"df":85,"sd":91,"rarity":3,"bst":485,"starter":false,"gen":7},
  {"dex":781,"name":"Dhelmise","types":["ghost","grass"],"hp":102,"spd":95,"atk":1.42,"pa":1.42,"sa":1.17,"df":100,"sd":90,"rarity":4,"bst":517,"starter":false,"gen":7},
  {"dex":782,"name":"Jangmo-o","types":["dragon"],"hp":90,"spd":97,"atk":1,"pa":1,"sa":0.95,"df":65,"sd":45,"rarity":1,"bst":300,"starter":false,"gen":7},
  {"dex":783,"name":"Hakamo-o","types":["dragon","fighting"],"hp":95,"spd":105,"atk":1.11,"pa":1.11,"sa":1.06,"df":90,"sd":70,"rarity":3,"bst":420,"starter":false,"gen":7},
  {"dex":784,"name":"Kommo-o","types":["dragon","fighting"],"hp":104,"spd":114,"atk":1.31,"pa":1.31,"sa":1.25,"df":125,"sd":105,"rarity":5,"bst":600,"starter":false,"gen":7},
  {"dex":785,"name":"Tapu Koko","types":["electric","fairy"],"hp":102,"spd":133,"atk":1.33,"pa":1.33,"sa":1.22,"df":85,"sd":75,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true},
  {"dex":786,"name":"Tapu Lele","types":["psychic","fairy"],"hp":102,"spd":118,"atk":1.42,"pa":1.17,"sa":1.42,"df":75,"sd":115,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true},
  {"dex":787,"name":"Tapu Bulu","types":["grass","fairy"],"hp":102,"spd":110,"atk":1.42,"pa":1.42,"sa":1.17,"df":115,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true},
  {"dex":788,"name":"Tapu Fini","types":["water","fairy"],"hp":102,"spd":114,"atk":1.22,"pa":1.11,"sa":1.22,"df":115,"sd":130,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true},
  {"dex":789,"name":"Cosmog","types":["psychic"],"hp":89,"spd":94,"atk":0.86,"pa":0.86,"sa":0.86,"df":31,"sd":31,"rarity":5,"bst":200,"starter":false,"gen":7,"leg":true},
  {"dex":790,"name":"Cosmoem","types":["psychic"],"hp":89,"spd":94,"atk":0.86,"pa":0.86,"sa":0.86,"df":131,"sd":131,"rarity":5,"bst":400,"starter":false,"gen":7,"leg":true},
  {"dex":791,"name":"Solgaleo","types":["psychic","steel"],"hp":132,"spd":119,"atk":1.45,"pa":1.45,"sa":1.32,"df":107,"sd":89,"rarity":5,"bst":680,"starter":false,"gen":7,"leg":true},
  {"dex":792,"name":"Lunala","types":["psychic","ghost"],"hp":132,"spd":119,"atk":1.45,"pa":1.32,"sa":1.45,"df":89,"sd":107,"rarity":5,"bst":680,"starter":false,"gen":7,"leg":true},
  {"dex":793,"name":"Nihilego","types":["rock","poison"],"hp":119,"spd":121,"atk":1.4,"pa":0.99,"sa":1.4,"df":47,"sd":131,"rarity":4,"bst":570,"starter":false,"gen":7},
  {"dex":794,"name":"Buzzwole","types":["bug","fighting"],"hp":118,"spd":111,"atk":1.46,"pa":1.46,"sa":0.99,"df":139,"sd":53,"rarity":4,"bst":570,"starter":false,"gen":7},
  {"dex":795,"name":"Pheromosa","types":["bug","fighting"],"hp":102,"spd":141,"atk":1.45,"pa":1.45,"sa":1.45,"df":37,"sd":37,"rarity":4,"bst":570,"starter":false,"gen":7},
  {"dex":796,"name":"Xurkitree","types":["electric"],"hp":107,"spd":113,"atk":1.65,"pa":1.19,"sa":1.65,"df":71,"sd":71,"rarity":4,"bst":570,"starter":false,"gen":7},
  {"dex":797,"name":"Celesteela","types":["steel","flying"],"hp":114,"spd":104,"atk":1.29,"pa":1.26,"sa":1.29,"df":103,"sd":101,"rarity":4,"bst":570,"starter":false,"gen":7},
  {"dex":798,"name":"Kartana","types":["grass","steel"],"hp":97,"spd":124,"atk":1.7,"pa":1.7,"sa":1.02,"df":131,"sd":31,"rarity":4,"bst":570,"starter":false,"gen":7},
  {"dex":799,"name":"Guzzlord","types":["dark","dragon"],"hp":170,"spd":96,"atk":1.26,"pa":1.26,"sa":1.23,"df":53,"sd":53,"rarity":4,"bst":570,"starter":false,"gen":7},
  {"dex":800,"name":"Necrozma","types":["psychic"],"hp":114,"spd":111,"atk":1.4,"pa":1.29,"sa":1.4,"df":101,"sd":89,"rarity":5,"bst":600,"starter":false,"gen":7,"leg":true},
  {"dex":801,"name":"Magearna","types":["steel","fairy"],"hp":106,"spd":105,"atk":1.42,"pa":1.22,"sa":1.42,"df":115,"sd":115,"rarity":5,"bst":600,"starter":false,"gen":7,"leg":true},
  {"dex":802,"name":"Marshadow","types":["fighting","ghost"],"hp":110,"spd":130,"atk":1.39,"pa":1.39,"sa":1.2,"df":80,"sd":90,"rarity":5,"bst":600,"starter":false,"gen":7,"leg":true},
  {"dex":803,"name":"Poipole","types":["poison"],"hp":100,"spd":109,"atk":1.1,"pa":1.1,"sa":1.1,"df":67,"sd":67,"rarity":3,"bst":420,"starter":false,"gen":7},
  {"dex":804,"name":"Naganadel","types":["poison","dragon"],"hp":103,"spd":129,"atk":1.4,"pa":1.1,"sa":1.4,"df":73,"sd":73,"rarity":4,"bst":540,"starter":false,"gen":7},
  {"dex":805,"name":"Stakataka","types":["rock","steel"],"hp":97,"spd":83,"atk":1.42,"pa":1.42,"sa":0.99,"df":211,"sd":101,"rarity":4,"bst":570,"starter":false,"gen":7},
  {"dex":806,"name":"Blacephalon","types":["fire","ghost"],"hp":94,"spd":123,"atk":1.53,"pa":1.4,"sa":1.53,"df":53,"sd":79,"rarity":4,"bst":570,"starter":false,"gen":7},
  {"dex":807,"name":"Zeraora","types":["electric"],"hp":110,"spd":138,"atk":1.32,"pa":1.32,"sa":1.26,"df":75,"sd":80,"rarity":5,"bst":600,"starter":false,"gen":7,"leg":true},
  {"dex":808,"name":"Meltan","types":["steel"],"hp":91,"spd":92,"atk":1.06,"pa":1.06,"sa":1,"df":65,"sd":35,"rarity":5,"bst":300,"starter":false,"gen":7,"leg":true},
  {"dex":809,"name":"Melmetal","types":["steel"],"hp":131,"spd":92,"atk":1.49,"pa":1.49,"sa":1.14,"df":143,"sd":65,"rarity":5,"bst":600,"starter":false,"gen":7,"leg":true},
  {"dex":810,"name":"Grookey","types":["grass"],"hp":92,"spd":105,"atk":1.06,"pa":1.06,"sa":0.92,"df":50,"sd":40,"rarity":1,"bst":310,"starter":true,"gen":8},
  {"dex":811,"name":"Thwackey","types":["grass"],"hp":102,"spd":112,"atk":1.17,"pa":1.17,"sa":1,"df":70,"sd":60,"rarity":3,"bst":420,"starter":false,"gen":8},
  {"dex":812,"name":"Rillaboom","types":["grass"],"hp":115,"spd":114,"atk":1.39,"pa":1.39,"sa":1.03,"df":90,"sd":70,"rarity":4,"bst":530,"starter":false,"gen":8},
  {"dex":813,"name":"Scorbunny","types":["fire"],"hp":92,"spd":107,"atk":1.09,"pa":1.09,"sa":0.92,"df":40,"sd":40,"rarity":1,"bst":310,"starter":true,"gen":8},
  {"dex":814,"name":"Raboot","types":["fire"],"hp":99,"spd":117,"atk":1.17,"pa":1.17,"sa":1,"df":60,"sd":60,"rarity":3,"bst":420,"starter":false,"gen":8},
  {"dex":815,"name":"Cinderace","types":["fire"],"hp":106,"spd":128,"atk":1.34,"pa":1.34,"sa":1.06,"df":75,"sd":75,"rarity":4,"bst":530,"starter":false,"gen":8},
  {"dex":816,"name":"Sobble","types":["water"],"hp":92,"spd":107,"atk":1.08,"pa":0.92,"sa":1.08,"df":40,"sd":40,"rarity":1,"bst":310,"starter":true,"gen":8},
  {"dex":817,"name":"Drizzile","types":["water"],"hp":99,"spd":116,"atk":1.22,"pa":1.03,"sa":1.22,"df":55,"sd":55,"rarity":3,"bst":420,"starter":false,"gen":8},
  {"dex":818,"name":"Inteleon","types":["water"],"hp":102,"spd":128,"atk":1.39,"pa":1.17,"sa":1.39,"df":65,"sd":65,"rarity":4,"bst":530,"starter":false,"gen":8},
  {"dex":819,"name":"Skwovet","types":["normal"],"hp":102,"spd":88,"atk":1,"pa":1,"sa":0.89,"df":55,"sd":35,"rarity":1,"bst":275,"starter":false,"gen":8},
  {"dex":820,"name":"Greedent","types":["normal"],"hp":124,"spd":86,"atk":1.22,"pa":1.22,"sa":1,"df":95,"sd":75,"rarity":3,"bst":460,"starter":false,"gen":8},
  {"dex":821,"name":"Rookidee","types":["flying"],"hp":87,"spd":102,"atk":0.96,"pa":0.96,"sa":0.88,"df":35,"sd":35,"rarity":1,"bst":245,"starter":false,"gen":8},
  {"dex":822,"name":"Corvisquire","types":["flying"],"hp":101,"spd":110,"atk":1.07,"pa":1.07,"sa":0.94,"df":55,"sd":55,"rarity":2,"bst":365,"starter":false,"gen":8},
  {"dex":823,"name":"Corviknight","types":["flying","steel"],"hp":114,"spd":106,"atk":1.18,"pa":1.18,"sa":0.99,"df":105,"sd":85,"rarity":4,"bst":495,"starter":false,"gen":8},
  {"dex":824,"name":"Blipbug","types":["bug"],"hp":81,"spd":97,"atk":0.84,"pa":0.81,"sa":0.84,"df":20,"sd":45,"rarity":1,"bst":180,"starter":false,"gen":8},
  {"dex":825,"name":"Dottler","types":["bug","psychic"],"hp":92,"spd":91,"atk":0.97,"pa":0.89,"sa":0.97,"df":80,"sd":90,"rarity":2,"bst":335,"starter":false,"gen":8},
  {"dex":826,"name":"Orbeetle","types":["bug","psychic"],"hp":97,"spd":116,"atk":1.14,"pa":0.95,"sa":1.14,"df":110,"sd":120,"rarity":4,"bst":505,"starter":false,"gen":8},
  {"dex":827,"name":"Nickit","types":["dark"],"hp":88,"spd":99,"atk":0.96,"pa":0.85,"sa":0.96,"df":28,"sd":52,"rarity":1,"bst":245,"starter":false,"gen":8},
  {"dex":828,"name":"Thievul","types":["dark"],"hp":102,"spd":116,"atk":1.18,"pa":1.02,"sa":1.18,"df":58,"sd":92,"rarity":3,"bst":455,"starter":false,"gen":8},
  {"dex":829,"name":"Gossifleur","types":["grass"],"hp":88,"spd":82,"atk":0.92,"pa":0.92,"sa":0.92,"df":60,"sd":60,"rarity":1,"bst":250,"starter":false,"gen":8},
  {"dex":830,"name":"Eldegoss","types":["grass"],"hp":97,"spd":103,"atk":1.14,"pa":0.97,"sa":1.14,"df":90,"sd":120,"rarity":3,"bst":460,"starter":false,"gen":8},
  {"dex":831,"name":"Wooloo","types":["normal"],"hp":89,"spd":98,"atk":0.92,"pa":0.92,"sa":0.92,"df":55,"sd":45,"rarity":1,"bst":270,"starter":false,"gen":8},
  {"dex":832,"name":"Dubwool","types":["normal"],"hp":102,"spd":115,"atk":1.14,"pa":1.14,"sa":1.03,"df":100,"sd":90,"rarity":3,"bst":490,"starter":false,"gen":8},
  {"dex":833,"name":"Chewtle","types":["water"],"hp":92,"spd":96,"atk":1.05,"pa":1.05,"sa":0.91,"df":50,"sd":38,"rarity":1,"bst":284,"starter":false,"gen":8},
  {"dex":834,"name":"Drednaw","types":["water","rock"],"hp":110,"spd":109,"atk":1.33,"pa":1.33,"sa":0.96,"df":90,"sd":68,"rarity":3,"bst":485,"starter":false,"gen":8},
  {"dex":835,"name":"Yamper","types":["electric"],"hp":97,"spd":89,"atk":0.95,"pa":0.95,"sa":0.92,"df":50,"sd":50,"rarity":1,"bst":270,"starter":false,"gen":8},
  {"dex":836,"name":"Boltund","types":["electric"],"hp":101,"spd":129,"atk":1.2,"pa":1.2,"sa":1.2,"df":60,"sd":60,"rarity":3,"bst":490,"starter":false,"gen":8},
  {"dex":837,"name":"Rolycoly","types":["rock"],"hp":84,"spd":91,"atk":0.92,"pa":0.92,"sa":0.92,"df":50,"sd":50,"rarity":1,"bst":240,"starter":false,"gen":8},
  {"dex":838,"name":"Carkol","types":["rock","fire"],"hp":106,"spd":99,"atk":1.03,"pa":1.03,"sa":1.03,"df":90,"sd":70,"rarity":3,"bst":410,"starter":false,"gen":8},
  {"dex":839,"name":"Coalossal","types":["rock","fire"],"hp":120,"spd":91,"atk":1.14,"pa":1.14,"sa":1.14,"df":120,"sd":90,"rarity":4,"bst":510,"starter":false,"gen":8},
  {"dex":840,"name":"Applin","types":["grass","dragon"],"hp":88,"spd":86,"atk":0.92,"pa":0.92,"sa":0.92,"df":80,"sd":40,"rarity":1,"bst":260,"starter":false,"gen":8},
  {"dex":841,"name":"Flapple","types":["grass","dragon"],"hp":102,"spd":107,"atk":1.31,"pa":1.31,"sa":1.22,"df":80,"sd":60,"rarity":3,"bst":485,"starter":false,"gen":8},
  {"dex":842,"name":"Appletun","types":["grass","dragon"],"hp":120,"spd":91,"atk":1.25,"pa":1.17,"sa":1.25,"df":80,"sd":80,"rarity":3,"bst":485,"starter":false,"gen":8},
  {"dex":843,"name":"Silicobra","types":["ground"],"hp":93,"spd":97,"atk":1.01,"pa":1.01,"sa":0.89,"df":75,"sd":50,"rarity":1,"bst":315,"starter":false,"gen":8},
  {"dex":844,"name":"Sandaconda","types":["ground"],"hp":102,"spd":108,"atk":1.29,"pa":1.29,"sa":1.06,"df":125,"sd":70,"rarity":4,"bst":510,"starter":false,"gen":8},
  {"dex":845,"name":"Cramorant","types":["flying","water"],"hp":102,"spd":114,"atk":1.17,"pa":1.17,"sa":1.17,"df":55,"sd":95,"rarity":3,"bst":475,"starter":false,"gen":8},
  {"dex":846,"name":"Arrokuda","types":["water"],"hp":88,"spd":106,"atk":1.05,"pa":1.05,"sa":0.92,"df":40,"sd":30,"rarity":1,"bst":280,"starter":false,"gen":8},
  {"dex":847,"name":"Barraskewda","types":["water"],"hp":97,"spd":135,"atk":1.38,"pa":1.38,"sa":1.03,"df":60,"sd":50,"rarity":3,"bst":490,"starter":false,"gen":8},
  {"dex":848,"name":"Toxel","types":["electric","poison"],"hp":88,"spd":95,"atk":1,"pa":0.91,"sa":1,"df":35,"sd":35,"rarity":1,"bst":242,"starter":false,"gen":8},
  {"dex":849,"name":"Toxtricity","types":["electric","poison"],"hp":104,"spd":110,"atk":1.33,"pa":1.24,"sa":1.33,"df":70,"sd":70,"rarity":4,"bst":502,"starter":false,"gen":8},
  {"dex":850,"name":"Sizzlipede","types":["fire","bug"],"hp":92,"spd":97,"atk":1.06,"pa":1.06,"sa":0.97,"df":45,"sd":50,"rarity":1,"bst":305,"starter":false,"gen":8},
  {"dex":851,"name":"Centiskorch","types":["fire","bug"],"hp":115,"spd":105,"atk":1.33,"pa":1.33,"sa":1.2,"df":65,"sd":90,"rarity":4,"bst":525,"starter":false,"gen":8},
  {"dex":852,"name":"Clobbopus","types":["fighting"],"hp":92,"spd":91,"atk":1.07,"pa":1.07,"sa":0.97,"df":60,"sd":50,"rarity":1,"bst":310,"starter":false,"gen":8},
  {"dex":853,"name":"Grapploct","types":["fighting"],"hp":106,"spd":96,"atk":1.35,"pa":1.35,"sa":1.08,"df":90,"sd":80,"rarity":3,"bst":480,"starter":false,"gen":8},
  {"dex":854,"name":"Sinistea","types":["ghost"],"hp":88,"spd":99,"atk":1.11,"pa":0.95,"sa":1.11,"df":45,"sd":54,"rarity":1,"bst":308,"starter":false,"gen":8},
  {"dex":855,"name":"Polteageist","types":["ghost"],"hp":97,"spd":107,"atk":1.44,"pa":1.06,"sa":1.44,"df":65,"sd":114,"rarity":4,"bst":508,"starter":false,"gen":8},
  {"dex":856,"name":"Hatenna","types":["psychic"],"hp":89,"spd":94,"atk":1.01,"pa":0.86,"sa":1.01,"df":45,"sd":53,"rarity":1,"bst":265,"starter":false,"gen":8},
  {"dex":857,"name":"Hattrem","types":["psychic"],"hp":96,"spd":99,"atk":1.17,"pa":0.92,"sa":1.17,"df":65,"sd":73,"rarity":2,"bst":370,"starter":false,"gen":8},
  {"dex":858,"name":"Hatterene","types":["psychic","fairy"],"hp":96,"spd":90,"atk":1.45,"pa":1.2,"sa":1.45,"df":95,"sd":103,"rarity":4,"bst":510,"starter":false,"gen":8},
  {"dex":859,"name":"Impidimp","types":["dark","fairy"],"hp":90,"spd":99,"atk":1,"pa":0.95,"sa":1,"df":30,"sd":40,"rarity":1,"bst":265,"starter":false,"gen":8},
  {"dex":860,"name":"Morgrem","types":["dark","fairy"],"hp":99,"spd":107,"atk":1.11,"pa":1.03,"sa":1.11,"df":45,"sd":55,"rarity":2,"bst":370,"starter":false,"gen":8},
  {"dex":861,"name":"Grimmsnarl","types":["dark","fairy"],"hp":113,"spd":103,"atk":1.36,"pa":1.36,"sa":1.22,"df":65,"sd":75,"rarity":4,"bst":510,"starter":false,"gen":8},
  {"dex":862,"name":"Obstagoon","types":["dark","normal"],"hp":112,"spd":118,"atk":1.2,"pa":1.2,"sa":1.03,"df":101,"sd":81,"rarity":4,"bst":520,"starter":false,"gen":8},
  {"dex":863,"name":"Perrserker","types":["steel"],"hp":102,"spd":99,"atk":1.31,"pa":1.31,"sa":0.97,"df":100,"sd":60,"rarity":3,"bst":440,"starter":false,"gen":8},
  {"dex":864,"name":"Cursola","types":["ghost"],"hp":97,"spd":91,"atk":1.5,"pa":1.22,"sa":1.5,"df":50,"sd":130,"rarity":4,"bst":510,"starter":false,"gen":8},
  {"dex":865,"name":"Sirfetch’d","types":["fighting"],"hp":98,"spd":105,"atk":1.44,"pa":1.44,"sa":1.07,"df":95,"sd":82,"rarity":4,"bst":507,"starter":false,"gen":8},
  {"dex":866,"name":"Mr. Rime","types":["ice","psychic"],"hp":106,"spd":107,"atk":1.31,"pa":1.17,"sa":1.31,"df":75,"sd":100,"rarity":4,"bst":520,"starter":false,"gen":8},
  {"dex":867,"name":"Runerigus","types":["ground","ghost"],"hp":96,"spd":91,"atk":1.22,"pa":1.22,"sa":0.97,"df":145,"sd":105,"rarity":3,"bst":483,"starter":false,"gen":8},
  {"dex":868,"name":"Milcery","types":["fairy"],"hp":90,"spd":92,"atk":0.97,"pa":0.92,"sa":0.97,"df":40,"sd":61,"rarity":1,"bst":270,"starter":false,"gen":8},
  {"dex":869,"name":"Alcremie","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8},
  {"dex":870,"name":"Falinks","types":["fighting"],"hp":99,"spd":110,"atk":1.25,"pa":1.25,"sa":1.08,"df":100,"sd":60,"rarity":3,"bst":470,"starter":false,"gen":8},
  {"dex":871,"name":"Pincurchin","types":["electric"],"hp":92,"spd":84,"atk":1.26,"pa":1.26,"sa":1.2,"df":95,"sd":85,"rarity":3,"bst":435,"starter":false,"gen":8},
  {"dex":872,"name":"Snom","types":["ice","bug"],"hp":84,"spd":86,"atk":0.95,"pa":0.84,"sa":0.95,"df":35,"sd":30,"rarity":1,"bst":185,"starter":false,"gen":8},
  {"dex":873,"name":"Frosmoth","types":["ice","bug"],"hp":102,"spd":105,"atk":1.39,"pa":1.06,"sa":1.39,"df":60,"sd":90,"rarity":3,"bst":475,"starter":false,"gen":8},
  {"dex":874,"name":"Stonjourner","types":["rock"],"hp":115,"spd":107,"atk":1.39,"pa":1.39,"sa":0.81,"df":135,"sd":20,"rarity":3,"bst":470,"starter":false,"gen":8},
  {"dex":875,"name":"Eiscue","types":["ice"],"hp":104,"spd":99,"atk":1.14,"pa":1.14,"sa":1.06,"df":110,"sd":90,"rarity":3,"bst":470,"starter":false,"gen":8},
  {"dex":876,"name":"Indeedee","types":["psychic","normal"],"hp":97,"spd":118,"atk":1.28,"pa":1.06,"sa":1.28,"df":55,"sd":95,"rarity":3,"bst":475,"starter":false,"gen":8},
  {"dex":877,"name":"Morpeko","types":["electric","dark"],"hp":96,"spd":119,"atk":1.22,"pa":1.22,"sa":1.08,"df":58,"sd":58,"rarity":3,"bst":436,"starter":false,"gen":8},
  {"dex":878,"name":"Cufant","types":["steel"],"hp":102,"spd":95,"atk":1.14,"pa":1.14,"sa":0.92,"df":49,"sd":49,"rarity":2,"bst":330,"starter":false,"gen":8},
  {"dex":879,"name":"Copperajah","types":["steel"],"hp":125,"spd":91,"atk":1.42,"pa":1.42,"sa":1.14,"df":69,"sd":69,"rarity":4,"bst":500,"starter":false,"gen":8},
  {"dex":880,"name":"Dracozolt","types":["electric","dragon"],"hp":110,"spd":110,"atk":1.25,"pa":1.25,"sa":1.14,"df":90,"sd":70,"rarity":4,"bst":505,"starter":false,"gen":8},
  {"dex":881,"name":"Arctozolt","types":["electric","ice"],"hp":110,"spd":101,"atk":1.25,"pa":1.25,"sa":1.2,"df":90,"sd":80,"rarity":4,"bst":505,"starter":false,"gen":8},
  {"dex":882,"name":"Dracovish","types":["water","dragon"],"hp":110,"spd":110,"atk":1.2,"pa":1.2,"sa":1.08,"df":100,"sd":80,"rarity":4,"bst":505,"starter":false,"gen":8},
  {"dex":883,"name":"Arctovish","types":["water","ice"],"hp":110,"spd":101,"atk":1.2,"pa":1.2,"sa":1.14,"df":100,"sd":90,"rarity":4,"bst":505,"starter":false,"gen":8},
  {"dex":884,"name":"Duraludon","types":["steel","dragon"],"hp":102,"spd":114,"atk":1.36,"pa":1.22,"sa":1.36,"df":115,"sd":50,"rarity":4,"bst":535,"starter":false,"gen":8},
  {"dex":885,"name":"Dreepy","types":["dragon","ghost"],"hp":83,"spd":112,"atk":1.03,"pa":1.03,"sa":0.92,"df":30,"sd":30,"rarity":1,"bst":270,"starter":false,"gen":8},
  {"dex":886,"name":"Drakloak","types":["dragon","ghost"],"hp":101,"spd":121,"atk":1.14,"pa":1.14,"sa":1.03,"df":50,"sd":50,"rarity":3,"bst":410,"starter":false,"gen":8},
  {"dex":887,"name":"Dragapult","types":["dragon","ghost"],"hp":110,"spd":138,"atk":1.36,"pa":1.36,"sa":1.25,"df":75,"sd":75,"rarity":5,"bst":600,"starter":false,"gen":8},
  {"dex":888,"name":"Zacian","types":["fairy"],"hp":111,"spd":136,"atk":1.36,"pa":1.36,"sa":1.14,"df":115,"sd":115,"rarity":5,"bst":660,"starter":false,"gen":8,"leg":true},
  {"dex":889,"name":"Zamazenta","types":["fighting"],"hp":111,"spd":136,"atk":1.36,"pa":1.36,"sa":1.14,"df":115,"sd":115,"rarity":5,"bst":660,"starter":false,"gen":8,"leg":true},
  {"dex":890,"name":"Eternatus","types":["poison","dragon"],"hp":133,"spd":133,"atk":1.5,"pa":1.17,"sa":1.5,"df":95,"sd":95,"rarity":5,"bst":690,"starter":false,"gen":8,"leg":true},
  {"dex":891,"name":"Kubfu","types":["fighting"],"hp":97,"spd":108,"atk":1.2,"pa":1.2,"sa":0.99,"df":60,"sd":50,"rarity":5,"bst":385,"starter":false,"gen":8,"leg":true},
  {"dex":892,"name":"Urshifu","types":["fighting","dark"],"hp":115,"spd":119,"atk":1.42,"pa":1.42,"sa":1.05,"df":100,"sd":60,"rarity":5,"bst":550,"starter":false,"gen":8,"leg":true},
  {"dex":893,"name":"Zarude","types":["dark","grass"],"hp":117,"spd":122,"atk":1.36,"pa":1.36,"sa":1.08,"df":105,"sd":95,"rarity":5,"bst":600,"starter":false,"gen":8,"leg":true},
  {"dex":894,"name":"Regieleki","types":["electric"],"hp":106,"spd":162,"atk":1.25,"pa":1.25,"sa":1.25,"df":50,"sd":50,"rarity":5,"bst":580,"starter":false,"gen":8,"leg":true},
  {"dex":895,"name":"Regidrago","types":["dragon"],"hp":160,"spd":112,"atk":1.25,"pa":1.25,"sa":1.25,"df":50,"sd":50,"rarity":5,"bst":580,"starter":false,"gen":8,"leg":true},
  {"dex":896,"name":"Glastrier","types":["ice"],"hp":115,"spd":91,"atk":1.5,"pa":1.5,"sa":1.06,"df":130,"sd":110,"rarity":5,"bst":580,"starter":false,"gen":8,"leg":true},
  {"dex":897,"name":"Spectrier","types":["ghost"],"hp":115,"spd":133,"atk":1.5,"pa":1.06,"sa":1.5,"df":60,"sd":80,"rarity":5,"bst":580,"starter":false,"gen":8,"leg":true},
  {"dex":898,"name":"Calyrex","types":["psychic","grass"],"hp":115,"spd":112,"atk":1.14,"pa":1.14,"sa":1.14,"df":80,"sd":80,"rarity":5,"bst":500,"starter":false,"gen":8,"leg":true},
  {"dex":899,"name":"Wyrdeer","types":["normal","psychic"],"hp":116,"spd":105,"atk":1.28,"pa":1.28,"sa":1.28,"df":72,"sd":75,"rarity":4,"bst":525,"starter":false,"gen":8},
  {"dex":900,"name":"Kleavor","types":["bug","rock"],"hp":102,"spd":114,"atk":1.44,"pa":1.44,"sa":0.95,"df":95,"sd":70,"rarity":4,"bst":500,"starter":false,"gen":8},
  {"dex":901,"name":"Ursaluna","types":["ground","normal"],"hp":128,"spd":99,"atk":1.47,"pa":1.47,"sa":0.95,"df":105,"sd":80,"rarity":4,"bst":550,"starter":false,"gen":8},
  {"dex":902,"name":"Basculegion","types":["water","ghost"],"hp":124,"spd":111,"atk":1.32,"pa":1.32,"sa":1.14,"df":65,"sd":75,"rarity":4,"bst":530,"starter":false,"gen":8},
  {"dex":903,"name":"Sneasler","types":["fighting","poison"],"hp":106,"spd":128,"atk":1.42,"pa":1.42,"sa":0.92,"df":60,"sd":80,"rarity":4,"bst":510,"starter":false,"gen":8},
  {"dex":904,"name":"Overqwil","types":["dark","poison"],"hp":108,"spd":114,"atk":1.33,"pa":1.33,"sa":1.06,"df":95,"sd":65,"rarity":4,"bst":510,"starter":false,"gen":8},
  {"dex":905,"name":"Enamorus","types":["fairy","flying"],"hp":103,"spd":123,"atk":1.44,"pa":1.33,"sa":1.44,"df":70,"sd":80,"rarity":5,"bst":580,"starter":false,"gen":8,"leg":true},
  {"dex":906,"name":"Sprigatito","types":["grass"],"hp":88,"spd":105,"atk":1.04,"pa":1.04,"sa":0.95,"df":54,"sd":45,"rarity":1,"bst":310,"starter":true,"gen":9},
  {"dex":907,"name":"Floragato","types":["grass"],"hp":97,"spd":113,"atk":1.14,"pa":1.14,"sa":1.03,"df":63,"sd":63,"rarity":3,"bst":410,"starter":false,"gen":9},
  {"dex":908,"name":"Meowscarada","types":["grass","dark"],"hp":104,"spd":130,"atk":1.31,"pa":1.31,"sa":1.15,"df":70,"sd":70,"rarity":4,"bst":530,"starter":false,"gen":9},
  {"dex":909,"name":"Fuecoco","types":["fire"],"hp":100,"spd":93,"atk":1.05,"pa":0.95,"sa":1.05,"df":59,"sd":40,"rarity":1,"bst":310,"starter":true,"gen":9},
  {"dex":910,"name":"Crocalor","types":["fire"],"hp":106,"spd":99,"atk":1.2,"pa":1,"sa":1.2,"df":78,"sd":58,"rarity":3,"bst":411,"starter":false,"gen":9},
  {"dex":911,"name":"Skeledirge","types":["fire","ghost"],"hp":117,"spd":106,"atk":1.31,"pa":1.11,"sa":1.31,"df":100,"sd":75,"rarity":4,"bst":530,"starter":false,"gen":9},
  {"dex":912,"name":"Quaxly","types":["water"],"hp":95,"spd":99,"atk":1.06,"pa":1.06,"sa":0.97,"df":45,"sd":45,"rarity":1,"bst":310,"starter":true,"gen":9},
  {"dex":913,"name":"Quaxwell","types":["water"],"hp":102,"spd":105,"atk":1.17,"pa":1.17,"sa":1.06,"df":65,"sd":60,"rarity":3,"bst":410,"starter":false,"gen":9},
  {"dex":914,"name":"Quaquaval","types":["water","fighting"],"hp":108,"spd":114,"atk":1.36,"pa":1.36,"sa":1.17,"df":80,"sd":75,"rarity":4,"bst":530,"starter":false,"gen":9},
  {"dex":915,"name":"Lechonk","types":["normal"],"hp":94,"spd":93,"atk":0.95,"pa":0.95,"sa":0.89,"df":40,"sd":45,"rarity":1,"bst":254,"starter":false,"gen":9},
  {"dex":916,"name":"Oinkologne","types":["normal"],"hp":120,"spd":105,"atk":1.25,"pa":1.25,"sa":1.02,"df":75,"sd":80,"rarity":3,"bst":489,"starter":false,"gen":9},
  {"dex":917,"name":"Tarountula","types":["bug"],"hp":86,"spd":86,"atk":0.93,"pa":0.93,"sa":0.86,"df":45,"sd":40,"rarity":1,"bst":210,"starter":false,"gen":9},
  {"dex":918,"name":"Spidops","types":["bug"],"hp":97,"spd":93,"atk":1.13,"pa":1.13,"sa":0.99,"df":92,"sd":86,"rarity":2,"bst":404,"starter":false,"gen":9},
  {"dex":919,"name":"Nymble","types":["bug"],"hp":85,"spd":97,"atk":0.95,"pa":0.95,"sa":0.82,"df":40,"sd":25,"rarity":1,"bst":210,"starter":false,"gen":9},
  {"dex":920,"name":"Lokix","types":["bug","dark"],"hp":102,"spd":117,"atk":1.26,"pa":1.26,"sa":0.99,"df":78,"sd":55,"rarity":3,"bst":450,"starter":false,"gen":9},
  {"dex":921,"name":"Pawmi","types":["electric"],"hp":90,"spd":103,"atk":0.97,"pa":0.97,"sa":0.92,"df":20,"sd":25,"rarity":1,"bst":240,"starter":false,"gen":9},
  {"dex":922,"name":"Pawmo","types":["electric","fighting"],"hp":97,"spd":114,"atk":1.11,"pa":1.11,"sa":0.97,"df":40,"sd":40,"rarity":2,"bst":350,"starter":false,"gen":9},
  {"dex":923,"name":"Pawmot","types":["electric","fighting"],"hp":102,"spd":122,"atk":1.33,"pa":1.33,"sa":1.08,"df":70,"sd":60,"rarity":3,"bst":490,"starter":false,"gen":9},
  {"dex":924,"name":"Tandemaus","types":["normal"],"hp":92,"spd":110,"atk":0.97,"pa":0.97,"sa":0.92,"df":45,"sd":45,"rarity":1,"bst":305,"starter":false,"gen":9},
  {"dex":925,"name":"Maushold","types":["normal"],"hp":103,"spd":125,"atk":1.11,"pa":1.11,"sa":1.06,"df":70,"sd":75,"rarity":3,"bst":470,"starter":false,"gen":9},
  {"dex":926,"name":"Fidough","types":["fairy"],"hp":87,"spd":105,"atk":1,"pa":1,"sa":0.86,"df":70,"sd":55,"rarity":1,"bst":312,"starter":false,"gen":9},
  {"dex":927,"name":"Dachsbun","types":["fairy"],"hp":96,"spd":118,"atk":1.14,"pa":1.14,"sa":0.97,"df":115,"sd":80,"rarity":3,"bst":477,"starter":false,"gen":9},
  {"dex":928,"name":"Smoliv","types":["grass","normal"],"hp":88,"spd":91,"atk":1.02,"pa":0.89,"sa":1.02,"df":45,"sd":51,"rarity":1,"bst":260,"starter":false,"gen":9},
  {"dex":929,"name":"Dolliv","types":["grass","normal"],"hp":93,"spd":92,"atk":1.13,"pa":0.99,"sa":1.13,"df":60,"sd":78,"rarity":2,"bst":354,"starter":false,"gen":9},
  {"dex":930,"name":"Arboliva","types":["grass","normal"],"hp":105,"spd":94,"atk":1.39,"pa":1.08,"sa":1.39,"df":90,"sd":109,"rarity":4,"bst":510,"starter":false,"gen":9},
  {"dex":931,"name":"Squawkabilly","types":["normal","flying"],"hp":107,"spd":117,"atk":1.23,"pa":1.23,"sa":0.95,"df":51,"sd":51,"rarity":3,"bst":417,"starter":false,"gen":9},
  {"dex":932,"name":"Nacli","types":["rock"],"hp":95,"spd":88,"atk":1,"pa":1,"sa":0.89,"df":75,"sd":35,"rarity":1,"bst":280,"starter":false,"gen":9},
  {"dex":933,"name":"Naclstack","types":["rock"],"hp":97,"spd":93,"atk":1.03,"pa":1.03,"sa":0.89,"df":100,"sd":65,"rarity":2,"bst":355,"starter":false,"gen":9},
  {"dex":934,"name":"Garganacl","types":["rock"],"hp":115,"spd":93,"atk":1.25,"pa":1.25,"sa":0.95,"df":130,"sd":90,"rarity":4,"bst":500,"starter":false,"gen":9},
  {"dex":935,"name":"Charcadet","types":["fire"],"hp":88,"spd":93,"atk":0.97,"pa":0.97,"sa":0.97,"df":40,"sd":40,"rarity":1,"bst":255,"starter":false,"gen":9},
  {"dex":936,"name":"Armarouge","types":["fire","psychic"],"hp":108,"spd":110,"atk":1.39,"pa":1.03,"sa":1.39,"df":100,"sd":80,"rarity":4,"bst":525,"starter":false,"gen":9},
  {"dex":937,"name":"Ceruledge","types":["fire","ghost"],"hp":104,"spd":114,"atk":1.39,"pa":1.39,"sa":1.03,"df":80,"sd":100,"rarity":4,"bst":525,"starter":false,"gen":9},
  {"dex":938,"name":"Tadbulb","types":["electric"],"hp":97,"spd":97,"atk":1.02,"pa":0.87,"sa":1.02,"df":41,"sd":35,"rarity":1,"bst":272,"starter":false,"gen":9},
  {"dex":939,"name":"Bellibolt","types":["electric"],"hp":119,"spd":97,"atk":1.27,"pa":1.05,"sa":1.27,"df":91,"sd":83,"rarity":4,"bst":495,"starter":false,"gen":9},
  {"dex":940,"name":"Wattrel","types":["electric","flying"],"hp":88,"spd":107,"atk":1,"pa":0.92,"sa":1,"df":35,"sd":40,"rarity":1,"bst":280,"starter":false,"gen":9},
  {"dex":941,"name":"Kilowattrel","types":["electric","flying"],"hp":102,"spd":130,"atk":1.28,"pa":1.08,"sa":1.28,"df":60,"sd":60,"rarity":3,"bst":490,"starter":false,"gen":9},
  {"dex":942,"name":"Maschiff","types":["dark"],"hp":97,"spd":99,"atk":1.13,"pa":1.13,"sa":0.92,"df":60,"sd":51,"rarity":2,"bst":340,"starter":false,"gen":9},
  {"dex":943,"name":"Mabosstiff","types":["dark"],"hp":106,"spd":114,"atk":1.36,"pa":1.36,"sa":1.03,"df":90,"sd":70,"rarity":4,"bst":505,"starter":false,"gen":9},
  {"dex":944,"name":"Shroodle","types":["poison","normal"],"hp":88,"spd":110,"atk":1.06,"pa":1.06,"sa":0.92,"df":35,"sd":35,"rarity":1,"bst":290,"starter":false,"gen":9},
  {"dex":945,"name":"Grafaiai","types":["poison","normal"],"hp":98,"spd":124,"atk":1.22,"pa":1.22,"sa":1.14,"df":65,"sd":72,"rarity":3,"bst":485,"starter":false,"gen":9},
  {"dex":946,"name":"Bramblin","types":["grass","ghost"],"hp":88,"spd":103,"atk":1.06,"pa":1.06,"sa":0.95,"df":30,"sd":35,"rarity":1,"bst":275,"starter":false,"gen":9},
  {"dex":947,"name":"Brambleghast","types":["grass","ghost"],"hp":95,"spd":116,"atk":1.33,"pa":1.33,"sa":1.14,"df":70,"sd":70,"rarity":3,"bst":480,"starter":false,"gen":9},
  {"dex":948,"name":"Toedscool","types":["ground","grass"],"hp":88,"spd":107,"atk":0.97,"pa":0.92,"sa":0.97,"df":35,"sd":100,"rarity":2,"bst":335,"starter":false,"gen":9},
  {"dex":949,"name":"Toedscruel","types":["ground","grass"],"hp":106,"spd":120,"atk":1.14,"pa":1.08,"sa":1.14,"df":65,"sd":120,"rarity":4,"bst":515,"starter":false,"gen":9},
  {"dex":950,"name":"Klawf","types":["rock"],"hp":102,"spd":110,"atk":1.25,"pa":1.25,"sa":0.89,"df":115,"sd":55,"rarity":3,"bst":450,"starter":false,"gen":9},
  {"dex":951,"name":"Capsakid","types":["grass"],"hp":92,"spd":99,"atk":1.04,"pa":1.04,"sa":1.04,"df":40,"sd":40,"rarity":1,"bst":304,"starter":false,"gen":9},
  {"dex":952,"name":"Scovillain","types":["grass","fire"],"hp":99,"spd":110,"atk":1.29,"pa":1.29,"sa":1.29,"df":65,"sd":65,"rarity":3,"bst":486,"starter":false,"gen":9},
  {"dex":953,"name":"Rellor","types":["bug"],"hp":88,"spd":91,"atk":0.97,"pa":0.97,"sa":0.87,"df":60,"sd":58,"rarity":1,"bst":270,"starter":false,"gen":9},
  {"dex":954,"name":"Rabsca","types":["bug","psychic"],"hp":104,"spd":97,"atk":1.33,"pa":0.97,"sa":1.33,"df":85,"sd":100,"rarity":3,"bst":470,"starter":false,"gen":9},
  {"dex":955,"name":"Flittle","types":["psychic"],"hp":84,"spd":110,"atk":1,"pa":0.89,"sa":1,"df":30,"sd":30,"rarity":1,"bst":255,"starter":false,"gen":9},
  {"dex":956,"name":"Espathra","types":["psychic"],"hp":113,"spd":122,"atk":1.26,"pa":1.03,"sa":1.26,"df":60,"sd":60,"rarity":3,"bst":481,"starter":false,"gen":9},
  {"dex":957,"name":"Tinkatink","types":["fairy","steel"],"hp":92,"spd":102,"atk":0.95,"pa":0.95,"sa":0.89,"df":45,"sd":64,"rarity":1,"bst":297,"starter":false,"gen":9},
  {"dex":958,"name":"Tinkatuff","types":["fairy","steel"],"hp":99,"spd":111,"atk":1,"pa":1,"sa":0.95,"df":55,"sd":82,"rarity":2,"bst":380,"starter":false,"gen":9},
  {"dex":959,"name":"Tinkaton","types":["fairy","steel"],"hp":108,"spd":117,"atk":1.11,"pa":1.11,"sa":1.08,"df":77,"sd":105,"rarity":4,"bst":506,"starter":false,"gen":9},
  {"dex":960,"name":"Wiglett","types":["water"],"hp":74,"spd":118,"atk":1,"pa":1,"sa":0.89,"df":25,"sd":25,"rarity":1,"bst":245,"starter":false,"gen":9},
  {"dex":961,"name":"Wugtrio","types":["water"],"hp":86,"spd":128,"atk":1.25,"pa":1.25,"sa":0.97,"df":50,"sd":70,"rarity":3,"bst":425,"starter":false,"gen":9},
  {"dex":962,"name":"Bombirdier","types":["flying","dark"],"hp":102,"spd":112,"atk":1.27,"pa":1.27,"sa":1.03,"df":85,"sd":85,"rarity":3,"bst":485,"starter":false,"gen":9},
  {"dex":963,"name":"Finizen","types":["water"],"hp":102,"spd":110,"atk":0.95,"pa":0.95,"sa":0.95,"df":40,"sd":40,"rarity":1,"bst":315,"starter":false,"gen":9},
  {"dex":964,"name":"Palafin","types":["water"],"hp":115,"spd":120,"atk":1.08,"pa":1.08,"sa":0.99,"df":72,"sd":62,"rarity":3,"bst":457,"starter":false,"gen":9},
  {"dex":965,"name":"Varoom","types":["steel","poison"],"hp":90,"spd":98,"atk":1.08,"pa":1.08,"sa":0.86,"df":63,"sd":45,"rarity":1,"bst":300,"starter":false,"gen":9},
  {"dex":966,"name":"Revavroom","types":["steel","poison"],"hp":106,"spd":116,"atk":1.35,"pa":1.35,"sa":1,"df":90,"sd":67,"rarity":4,"bst":500,"starter":false,"gen":9},
  {"dex":967,"name":"Cyclizar","types":["dragon","normal"],"hp":102,"spd":129,"atk":1.22,"pa":1.22,"sa":1.17,"df":65,"sd":65,"rarity":4,"bst":501,"starter":false,"gen":9},
  {"dex":968,"name":"Orthworm","types":["steel"],"hp":102,"spd":105,"atk":1.17,"pa":1.17,"sa":1.03,"df":145,"sd":55,"rarity":3,"bst":480,"starter":false,"gen":9},
  {"dex":969,"name":"Glimmet","types":["rock","poison"],"hp":92,"spd":103,"atk":1.28,"pa":0.89,"sa":1.28,"df":42,"sd":60,"rarity":2,"bst":350,"starter":false,"gen":9},
  {"dex":970,"name":"Glimmora","types":["rock","poison"],"hp":107,"spd":114,"atk":1.42,"pa":1,"sa":1.42,"df":90,"sd":81,"rarity":4,"bst":525,"starter":false,"gen":9},
  {"dex":971,"name":"Greavard","types":["ghost"],"hp":92,"spd":92,"atk":1.04,"pa":1.04,"sa":0.86,"df":60,"sd":55,"rarity":1,"bst":290,"starter":false,"gen":9},
  {"dex":972,"name":"Houndstone","types":["ghost"],"hp":102,"spd":107,"atk":1.26,"pa":1.26,"sa":0.97,"df":100,"sd":97,"rarity":3,"bst":488,"starter":false,"gen":9},
  {"dex":973,"name":"Flamigo","types":["flying","fighting"],"hp":107,"spd":116,"atk":1.33,"pa":1.33,"sa":1.11,"df":74,"sd":64,"rarity":4,"bst":500,"starter":false,"gen":9},
  {"dex":974,"name":"Cetoddle","types":["ice"],"hp":119,"spd":96,"atk":1.07,"pa":1.07,"sa":0.86,"df":45,"sd":40,"rarity":2,"bst":334,"starter":false,"gen":9},
  {"dex":975,"name":"Cetitan","types":["ice"],"hp":146,"spd":109,"atk":1.32,"pa":1.32,"sa":0.95,"df":65,"sd":55,"rarity":4,"bst":521,"starter":false,"gen":9},
  {"dex":976,"name":"Veluza","types":["water","psychic"],"hp":110,"spd":107,"atk":1.26,"pa":1.26,"sa":1.13,"df":73,"sd":65,"rarity":3,"bst":478,"starter":false,"gen":9},
  {"dex":977,"name":"Dondozo","types":["water"],"hp":138,"spd":93,"atk":1.25,"pa":1.25,"sa":1.06,"df":115,"sd":65,"rarity":4,"bst":530,"starter":false,"gen":9},
  {"dex":978,"name":"Tatsugiri","types":["dragon","water"],"hp":101,"spd":112,"atk":1.36,"pa":0.97,"sa":1.36,"df":60,"sd":95,"rarity":3,"bst":475,"starter":false,"gen":9},
  {"dex":979,"name":"Annihilape","types":["fighting","ghost"],"hp":120,"spd":116,"atk":1.33,"pa":1.33,"sa":0.97,"df":80,"sd":90,"rarity":4,"bst":535,"starter":false,"gen":9},
  {"dex":980,"name":"Clodsire","types":["poison","ground"],"hp":128,"spd":86,"atk":1.11,"pa":1.11,"sa":0.95,"df":60,"sd":100,"rarity":3,"bst":430,"starter":false,"gen":9},
  {"dex":981,"name":"Farigiraf","types":["normal","psychic"],"hp":124,"spd":103,"atk":1.31,"pa":1.2,"sa":1.31,"df":70,"sd":70,"rarity":4,"bst":520,"starter":false,"gen":9},
  {"dex":982,"name":"Dudunsparce","types":["normal"],"hp":126,"spd":101,"atk":1.25,"pa":1.25,"sa":1.17,"df":80,"sd":75,"rarity":4,"bst":520,"starter":false,"gen":9},
  {"dex":983,"name":"Kingambit","types":["dark","steel"],"hp":115,"spd":99,"atk":1.44,"pa":1.44,"sa":1.03,"df":120,"sd":85,"rarity":4,"bst":550,"starter":false,"gen":9},
  {"dex":984,"name":"Colmilargo","types":["ground","fighting"],"hp":122,"spd":115,"atk":1.42,"pa":1.42,"sa":0.99,"df":131,"sd":53,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":985,"name":"Colagrito","types":["fairy","psychic"],"hp":122,"spd":125,"atk":1.06,"pa":1.06,"sa":1.06,"df":99,"sd":115,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":986,"name":"Furioseta","types":["grass","dark"],"hp":120,"spd":101,"atk":1.4,"pa":1.4,"sa":1.13,"df":99,"sd":99,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":987,"name":"Melenaleteo","types":["ghost","fairy"],"hp":95,"spd":135,"atk":1.44,"pa":1,"sa":1.44,"df":55,"sd":135,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":988,"name":"Reptalada","types":["bug","fighting"],"hp":108,"spd":112,"atk":1.44,"pa":1.44,"sa":1.17,"df":79,"sd":105,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":989,"name":"Pelarena","types":["electric","ground"],"hp":108,"spd":120,"atk":1.37,"pa":1.15,"sa":1.37,"df":97,"sd":85,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":990,"name":"Ferrodada","types":["ground","steel"],"hp":110,"spd":123,"atk":1.32,"pa":1.32,"sa":1.1,"df":120,"sd":70,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":991,"name":"Ferrosaco","types":["ice","water"],"hp":95,"spd":135,"atk":1.38,"pa":1.14,"sa":1.38,"df":114,"sd":60,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":992,"name":"Ferropalmas","types":["fighting","electric"],"hp":139,"spd":99,"atk":1.47,"pa":1.47,"sa":0.97,"df":108,"sd":68,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":993,"name":"Ferrocuello","types":["dark","flying"],"hp":112,"spd":123,"atk":1.37,"pa":1.14,"sa":1.37,"df":86,"sd":80,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":994,"name":"Ferropolilla","types":["fire","poison"],"hp":106,"spd":124,"atk":1.47,"pa":1.08,"sa":1.47,"df":60,"sd":110,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":995,"name":"Ferropúas","types":["rock","electric"],"hp":115,"spd":108,"atk":1.44,"pa":1.44,"sa":1.08,"df":110,"sd":84,"rarity":4,"bst":570,"starter":false,"gen":9},
  {"dex":996,"name":"Frigibax","types":["dragon","ice"],"hp":99,"spd":101,"atk":1.11,"pa":1.11,"sa":0.89,"df":45,"sd":45,"rarity":2,"bst":320,"starter":false,"gen":9},
  {"dex":997,"name":"Arctibax","types":["dragon","ice"],"hp":110,"spd":104,"atk":1.22,"pa":1.22,"sa":0.95,"df":66,"sd":65,"rarity":3,"bst":423,"starter":false,"gen":9},
  {"dex":998,"name":"Baxcalibur","types":["dragon","ice"],"hp":122,"spd":115,"atk":1.5,"pa":1.5,"sa":1.11,"df":92,"sd":86,"rarity":5,"bst":600,"starter":false,"gen":9},
  {"dex":999,"name":"Gimmighoul","types":["ghost"],"hp":90,"spd":82,"atk":1.11,"pa":0.86,"sa":1.11,"df":70,"sd":70,"rarity":1,"bst":300,"starter":false,"gen":9},
  {"dex":1000,"name":"Gholdengo","types":["steel","ghost"],"hp":109,"spd":113,"atk":1.43,"pa":1.03,"sa":1.43,"df":95,"sd":91,"rarity":4,"bst":550,"starter":false,"gen":9},
  {"dex":1001,"name":"Wo-Chien","types":["dark","grass"],"hp":108,"spd":107,"atk":1.22,"pa":1.17,"sa":1.22,"df":100,"sd":135,"rarity":5,"bst":570,"starter":false,"gen":9,"leg":true},
  {"dex":1002,"name":"Chien-Pao","types":["dark","ice"],"hp":106,"spd":135,"atk":1.36,"pa":1.36,"sa":1.2,"df":80,"sd":65,"rarity":5,"bst":570,"starter":false,"gen":9,"leg":true},
  {"dex":1003,"name":"Ting-Lu","types":["dark","ground"],"hp":140,"spd":97,"atk":1.31,"pa":1.31,"sa":1,"df":125,"sd":80,"rarity":5,"bst":570,"starter":false,"gen":9,"leg":true},
  {"dex":1004,"name":"Chi-Yu","types":["dark","fire"],"hp":95,"spd":120,"atk":1.44,"pa":1.14,"sa":1.44,"df":80,"sd":120,"rarity":5,"bst":570,"starter":false,"gen":9,"leg":true},
  {"dex":1005,"name":"Bramaluna","types":["dragon","dark"],"hp":117,"spd":128,"atk":1.46,"pa":1.46,"sa":1,"df":71,"sd":101,"rarity":5,"bst":590,"starter":false,"gen":9},
  {"dex":1006,"name":"Ferropaladín","types":["fairy","fighting"],"hp":103,"spd":127,"atk":1.42,"pa":1.42,"sa":1.36,"df":90,"sd":60,"rarity":5,"bst":590,"starter":false,"gen":9},
  {"dex":1007,"name":"Koraidon","types":["fighting","dragon"],"hp":115,"spd":135,"atk":1.44,"pa":1.44,"sa":1.17,"df":115,"sd":100,"rarity":5,"bst":670,"starter":false,"gen":9,"leg":true},
  {"dex":1008,"name":"Miraidon","types":["electric","dragon"],"hp":115,"spd":135,"atk":1.44,"pa":1.17,"sa":1.44,"df":100,"sd":115,"rarity":5,"bst":670,"starter":false,"gen":9,"leg":true},
  {"dex":1009,"name":"Ondulagua","types":["water","dragon"],"hp":115,"spd":124,"atk":1.39,"pa":1.16,"sa":1.39,"df":91,"sd":83,"rarity":5,"bst":590,"starter":false,"gen":9},
  {"dex":1010,"name":"Ferroverdor","types":["grass","psychic"],"hp":110,"spd":122,"atk":1.42,"pa":1.42,"sa":1.08,"df":88,"sd":108,"rarity":5,"bst":590,"starter":false,"gen":9},
  {"dex":1011,"name":"Dipplin","types":["grass","dragon"],"hp":106,"spd":95,"atk":1.22,"pa":1.14,"sa":1.22,"df":110,"sd":80,"rarity":3,"bst":485,"starter":false,"gen":9},
  {"dex":1012,"name":"Poltchageist","types":["grass","ghost"],"hp":88,"spd":99,"atk":1.11,"pa":0.95,"sa":1.11,"df":45,"sd":54,"rarity":1,"bst":308,"starter":false,"gen":9},
  {"dex":1013,"name":"Sinistcha","types":["grass","ghost"],"hp":102,"spd":107,"atk":1.37,"pa":1.03,"sa":1.37,"df":106,"sd":80,"rarity":4,"bst":508,"starter":false,"gen":9},
  {"dex":1014,"name":"Okidogi","types":["poison","fighting"],"hp":110,"spd":112,"atk":1.4,"pa":1.4,"sa":1.02,"df":115,"sd":86,"rarity":5,"bst":555,"starter":false,"gen":9,"leg":true},
  {"dex":1015,"name":"Munkidori","types":["poison","psychic"],"hp":110,"spd":123,"atk":1.42,"pa":1.11,"sa":1.42,"df":66,"sd":90,"rarity":5,"bst":555,"starter":false,"gen":9,"leg":true},
  {"dex":1016,"name":"Fezandipiti","types":["poison","fairy"],"hp":110,"spd":120,"atk":1.2,"pa":1.2,"sa":1.08,"df":82,"sd":125,"rarity":5,"bst":555,"starter":false,"gen":9,"leg":true},
  {"dex":1017,"name":"Ogerpon","types":["grass"],"hp":106,"spd":124,"atk":1.36,"pa":1.36,"sa":1.03,"df":84,"sd":96,"rarity":5,"bst":550,"starter":false,"gen":9,"leg":true},
  {"dex":1018,"name":"Archaludon","types":["steel","dragon"],"hp":110,"spd":114,"atk":1.39,"pa":1.28,"sa":1.39,"df":130,"sd":65,"rarity":5,"bst":600,"starter":false,"gen":9},
  {"dex":1019,"name":"Hydrapple","types":["grass","dragon"],"hp":118,"spd":96,"atk":1.36,"pa":1.14,"sa":1.36,"df":110,"sd":80,"rarity":4,"bst":540,"starter":false,"gen":9},
  {"dex":1020,"name":"Flamariete","types":["fire","dragon"],"hp":117,"spd":116,"atk":1.33,"pa":1.33,"sa":1.06,"df":121,"sd":93,"rarity":5,"bst":590,"starter":false,"gen":9},
  {"dex":1021,"name":"Electrofuria","types":["electric","dragon"],"hp":126,"spd":110,"atk":1.45,"pa":1.1,"sa":1.45,"df":91,"sd":89,"rarity":5,"bst":590,"starter":false,"gen":9},
  {"dex":1022,"name":"Ferromole","types":["rock","psychic"],"hp":110,"spd":130,"atk":1.36,"pa":1.36,"sa":1.07,"df":80,"sd":108,"rarity":5,"bst":590,"starter":false,"gen":9},
  {"dex":1023,"name":"Ferrotesta","types":["steel","psychic"],"hp":110,"spd":119,"atk":1.37,"pa":1.1,"sa":1.37,"df":100,"sd":108,"rarity":5,"bst":590,"starter":false,"gen":9},
  {"dex":1024,"name":"Terapagos","types":["normal"],"hp":110,"spd":103,"atk":1.06,"pa":1.06,"sa":1.06,"df":85,"sd":85,"rarity":5,"bst":450,"starter":false,"gen":9,"leg":true},
  {"dex":1025,"name":"Pecharunt","types":["poison","ghost"],"hp":110,"spd":115,"atk":1.18,"pa":1.18,"sa":1.18,"df":160,"sd":88,"rarity":5,"bst":600,"starter":false,"gen":9,"leg":true},
  /* ---- copia local: formas alternativas (tools/fetch_forms_all.py, tools/merge_forms_stats.py) ---- */
  {"dex":1094,"name":"Mega Gengar","types":["ghost","poison"],"hp":97,"spd":133,"atk":1.64,"pa":1.06,"sa":1.64,"df":80,"sd":95,"rarity":5,"bst":600,"starter":false,"gen":1,"form":"mega","excl":true},   /* copia local: exclusivo (SpriteCollab 0094/0001) */
  {"dex":1382,"name":"Primal Kyogre","types":["water"],"hp":115,"spd":116,"atk":1.69,"pa":1.52,"sa":1.69,"df":90,"sd":160,"rarity":5,"bst":770,"starter":false,"gen":3,"form":"mega","excl":true},   /* copia local: exclusivo (SpriteCollab 0382/0001) */
  {"dex":1383,"name":"Primal Groudon","types":["ground","fire"],"hp":115,"spd":116,"atk":1.69,"pa":1.69,"sa":1.52,"df":160,"sd":90,"rarity":5,"bst":770,"starter":false,"gen":3,"form":"mega","excl":true},   /* copia local: exclusivo (SpriteCollab 0383/0001) */
  {"dex":1384,"name":"Mega Rayquaza","types":["dragon","flying"],"hp":125,"spd":122,"atk":1.7,"pa":1.7,"sa":1.7,"df":100,"sd":100,"rarity":5,"bst":780,"starter":false,"gen":3,"excl":true,"form":"mega"},   /* copia local: exclusivo (regalo del administrador), sprite SpriteCollab 0384/0001 */
  {"dex":1483,"name":"Origin Dialga","types":["steel","dragon"],"hp":115,"spd":116,"atk":1.52,"pa":1.25,"sa":1.52,"df":120,"sd":120,"rarity":5,"bst":680,"starter":false,"gen":4,"form":"stat","excl":true},   /* copia local: exclusivo (SpriteCollab 0483/0001) */
  {"dex":1484,"name":"Origin Palkia","types":["water","dragon"],"hp":110,"spd":128,"atk":1.52,"pa":1.25,"sa":1.52,"df":100,"sd":120,"rarity":5,"bst":680,"starter":false,"gen":4,"form":"stat","excl":true},   /* copia local: exclusivo (SpriteCollab 0484/0001) */
  {"dex":1646,"name":"White Kyurem","types":["dragon","ice"],"hp":126,"spd":118,"atk":1.64,"pa":1.36,"sa":1.64,"df":90,"sd":100,"rarity":5,"bst":700,"starter":false,"gen":5,"form":"power","excl":true},   /* copia local: exclusivo (SpriteCollab 0646/0002) */
  {"dex":2646,"name":"Black Kyurem","types":["dragon","ice"],"hp":126,"spd":118,"atk":1.64,"pa":1.64,"sa":1.36,"df":100,"sd":90,"rarity":5,"bst":700,"starter":false,"gen":5,"form":"power","excl":true},   /* copia local: exclusivo (SpriteCollab 0646/0001) */
  {"dex":1800,"name":"Ultra Necrozma","types":["psychic","dragon"],"hp":114,"spd":132,"atk":1.62,"pa":1.62,"sa":1.62,"df":97,"sd":97,"rarity":5,"bst":754,"starter":false,"gen":7,"form":"power","excl":true},   /* copia local: exclusivo (SpriteCollab 0800/0003) */
  {"dex":1888,"name":"Zacian Crowned Sword","types":["fairy","steel"],"hp":111,"spd":140,"atk":1.52,"pa":1.52,"sa":1.14,"df":115,"sd":115,"rarity":5,"bst":700,"starter":false,"gen":8,"form":"power","excl":true},   /* copia local: exclusivo (SpriteCollab 0888/0001) */
  {"dex":1889,"name":"Zamazenta Crowned Shield","types":["fighting","steel"],"hp":111,"spd":132,"atk":1.36,"pa":1.36,"sa":1.14,"df":140,"sd":140,"rarity":5,"bst":700,"starter":false,"gen":8,"form":"power","excl":true},   /* copia local: exclusivo (SpriteCollab 0889/0001) */
  {"dex":2006,"name":"Mega Charizard X","types":["fire","dragon"],"hp":105,"spd":120,"atk":1.42,"pa":1.42,"sa":1.42,"df":111,"sd":85,"rarity":5,"bst":634,"starter":false,"gen":1,"form":"mega","excl":true},   /* forma Mega_X de 6 (SpriteCollab 0006/0001) */
  {"dex":2019,"name":"Alolan Rattata","types":["dark","normal"],"hp":84,"spd":108,"atk":1.01,"pa":1.01,"sa":0.84,"df":35,"sd":35,"rarity":1,"bst":253,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 19 (SpriteCollab 0019/0001) */
  {"dex":1026,"name":"Alolan Raichu","types":["electric","psychic"],"hp":97,"spd":124,"atk":1.22,"pa":1.17,"sa":1.22,"df":50,"sd":85,"rarity":3,"bst":485,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 26 (SpriteCollab 0026/0001) */
  {"dex":1027,"name":"Alolan Sandshrew","types":["ice","steel"],"hp":92,"spd":95,"atk":1.11,"pa":1.11,"sa":0.76,"df":90,"sd":35,"rarity":1,"bst":300,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 27 (SpriteCollab 0027/0001) */
  {"dex":1028,"name":"Alolan Sandslash","types":["ice","steel"],"hp":104,"spd":105,"atk":1.25,"pa":1.25,"sa":0.84,"df":120,"sd":65,"rarity":3,"bst":450,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 28 (SpriteCollab 0028/0001) */
  {"dex":1037,"name":"Alolan Vulpix","types":["ice"],"hp":87,"spd":105,"atk":0.97,"pa":0.93,"sa":0.97,"df":40,"sd":65,"rarity":1,"bst":299,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 37 (SpriteCollab 0037/0001) */
  {"dex":1038,"name":"Alolan Ninetales","types":["ice","fairy"],"hp":103,"spd":124,"atk":1.15,"pa":1.07,"sa":1.15,"df":75,"sd":100,"rarity":4,"bst":505,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 38 (SpriteCollab 0038/0001) */
  {"dex":1050,"name":"Alolan Diglett","types":["ground","steel"],"hp":74,"spd":116,"atk":1,"pa":1,"sa":0.89,"df":30,"sd":45,"rarity":1,"bst":265,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 50 (SpriteCollab 0050/0001) */
  {"dex":1051,"name":"Alolan Dugtrio","types":["ground","steel"],"hp":86,"spd":124,"atk":1.25,"pa":1.25,"sa":0.97,"df":60,"sd":70,"rarity":3,"bst":425,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 51 (SpriteCollab 0051/0001) */
  {"dex":1052,"name":"Alolan Meowth","types":["dark"],"hp":88,"spd":116,"atk":0.97,"pa":0.89,"sa":0.97,"df":35,"sd":40,"rarity":1,"bst":290,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 52 (SpriteCollab 0052/0001) */
  {"dex":2052,"name":"Galarian Meowth","types":["steel"],"hp":92,"spd":95,"atk":1.06,"pa":1.06,"sa":0.92,"df":55,"sd":40,"rarity":1,"bst":290,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 52 (SpriteCollab 0052/0002) */
  {"dex":1053,"name":"Alolan Persian","types":["dark"],"hp":99,"spd":126,"atk":1.11,"pa":1.03,"sa":1.11,"df":60,"sd":65,"rarity":3,"bst":440,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 53 (SpriteCollab 0053/0001) */
  {"dex":1058,"name":"Hisuian Growlithe","types":["fire","rock"],"hp":97,"spd":101,"atk":1.11,"pa":1.11,"sa":1.06,"df":45,"sd":50,"rarity":2,"bst":350,"starter":false,"gen":1,"form":"regional"},   /* forma Hisui de 58 (SpriteCollab 0058/0001) */
  {"dex":1059,"name":"Hisuian Arcanine","types":["fire","rock"],"hp":113,"spd":116,"atk":1.33,"pa":1.33,"sa":1.22,"df":80,"sd":80,"rarity":4,"bst":555,"starter":false,"gen":1,"form":"regional"},   /* forma Hisui de 59 (SpriteCollab 0059/0001) */
  {"dex":1065,"name":"Mega Alakazam","types":["psychic"],"hp":95,"spd":141,"atk":1.66,"pa":0.97,"sa":1.66,"df":65,"sd":105,"rarity":5,"bst":600,"starter":false,"gen":1,"form":"mega","excl":true},   /* forma Mega de 65 (SpriteCollab 0065/0001) */
  {"dex":1074,"name":"Alolan Geodude","types":["rock","electric"],"hp":88,"spd":86,"atk":1.14,"pa":1.14,"sa":0.86,"df":100,"sd":30,"rarity":1,"bst":300,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 74 (SpriteCollab 0074/0001) */
  {"dex":1075,"name":"Alolan Graveler","types":["rock","electric"],"hp":95,"spd":93,"atk":1.22,"pa":1.22,"sa":0.95,"df":115,"sd":45,"rarity":2,"bst":390,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 75 (SpriteCollab 0075/0001) */
  {"dex":1076,"name":"Alolan Golem","types":["rock","electric"],"hp":106,"spd":97,"atk":1.36,"pa":1.36,"sa":1,"df":130,"sd":65,"rarity":4,"bst":495,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 76 (SpriteCollab 0076/0001) */
  {"dex":1077,"name":"Galarian Ponyta","types":["psychic"],"hp":92,"spd":116,"atk":1.17,"pa":1.17,"sa":1.06,"df":55,"sd":65,"rarity":3,"bst":410,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 77 (SpriteCollab 0077/0001) */
  {"dex":1078,"name":"Galarian Rapidash","types":["psychic","fairy"],"hp":99,"spd":122,"atk":1.25,"pa":1.25,"sa":1.14,"df":70,"sd":80,"rarity":4,"bst":500,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 78 (SpriteCollab 0078/0001) */
  {"dex":1079,"name":"Galarian Slowpoke","types":["psychic"],"hp":110,"spd":84,"atk":1.06,"pa":1.06,"sa":0.92,"df":65,"sd":40,"rarity":1,"bst":315,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 79 (SpriteCollab 0079/0001) */
  {"dex":1080,"name":"Galarian Slowbro","types":["poison","psychic"],"hp":113,"spd":91,"atk":1.25,"pa":1.25,"sa":1.25,"df":95,"sd":70,"rarity":3,"bst":490,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 80 (SpriteCollab 0080/0001) */
  {"dex":2080,"name":"Mega Slowbro","types":["water","psychic"],"hp":113,"spd":91,"atk":1.42,"pa":1.11,"sa":1.42,"df":180,"sd":80,"rarity":4,"bst":590,"starter":false,"gen":1,"form":"mega","excl":true},   /* forma Mega de 80 (SpriteCollab 0080/0002) */
  {"dex":1083,"name":"Galarian Farfetch’d","types":["fighting"],"hp":93,"spd":101,"atk":1.22,"pa":1.22,"sa":1.02,"df":55,"sd":62,"rarity":2,"bst":377,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 83 (SpriteCollab 0083/0001) */
  {"dex":1088,"name":"Alolan Grimer","types":["poison","dark"],"hp":106,"spd":88,"atk":1.14,"pa":1.14,"sa":0.92,"df":50,"sd":50,"rarity":2,"bst":325,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 88 (SpriteCollab 0088/0001) */
  {"dex":1089,"name":"Alolan Muk","types":["poison","dark"],"hp":117,"spd":99,"atk":1.28,"pa":1.28,"sa":1.06,"df":75,"sd":100,"rarity":4,"bst":500,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 89 (SpriteCollab 0089/0001) */
  {"dex":1100,"name":"Hisuian Voltorb","types":["electric","grass"],"hp":88,"spd":120,"atk":1,"pa":0.86,"sa":1,"df":50,"sd":55,"rarity":2,"bst":330,"starter":false,"gen":1,"form":"regional"},   /* forma Hisui de 100 (SpriteCollab 0100/0001) */
  {"dex":1101,"name":"Hisuian Electrode","types":["electric","grass"],"hp":97,"spd":141,"atk":1.14,"pa":0.97,"sa":1.14,"df":70,"sd":80,"rarity":3,"bst":490,"starter":false,"gen":1,"form":"regional"},   /* forma Hisui de 101 (SpriteCollab 0101/0001) */
  {"dex":1103,"name":"Alolan Exeggutor","types":["grass","dragon"],"hp":113,"spd":97,"atk":1.39,"pa":1.28,"sa":1.39,"df":85,"sd":75,"rarity":4,"bst":530,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 103 (SpriteCollab 0103/0001) */
  {"dex":1105,"name":"Alolan Marowak","types":["fire","ghost"],"hp":97,"spd":97,"atk":1.14,"pa":1.14,"sa":0.97,"df":110,"sd":80,"rarity":3,"bst":425,"starter":false,"gen":1,"form":"regional"},   /* forma Alola de 105 (SpriteCollab 0105/0001) */
  {"dex":1110,"name":"Galarian Weezing","types":["poison","fairy"],"hp":99,"spd":103,"atk":1.2,"pa":1.2,"sa":1.17,"df":120,"sd":70,"rarity":3,"bst":490,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 110 (SpriteCollab 0110/0001) */
  {"dex":1115,"name":"Mega Kangaskhan","types":["normal"],"hp":117,"spd":120,"atk":1.39,"pa":1.39,"sa":1.03,"df":100,"sd":100,"rarity":4,"bst":590,"starter":false,"gen":1,"form":"mega","excl":true},   /* forma Mega de 115 (SpriteCollab 0115/0001) */
  {"dex":1122,"name":"Galarian Mr. Mime","types":["ice","psychic"],"hp":92,"spd":120,"atk":1.2,"pa":1.06,"sa":1.2,"df":65,"sd":90,"rarity":3,"bst":460,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 122 (SpriteCollab 0122/0001) */
  {"dex":1128,"name":"Paldean Tauros","types":["fighting"],"hp":104,"spd":120,"atk":1.31,"pa":1.31,"sa":0.86,"df":105,"sd":70,"rarity":3,"bst":490,"starter":false,"gen":1,"form":"regional"},   /* forma Paldea de 128 (SpriteCollab 0128/0001) */
  {"dex":2128,"name":"Paldean Tauros (Blaze)","types":["fighting","fire"],"hp":104,"spd":120,"atk":1.31,"pa":1.31,"sa":0.86,"df":105,"sd":70,"rarity":3,"bst":490,"starter":false,"gen":1,"form":"regional"},   /* forma Paldea_Blaze de 128 (SpriteCollab 0128/0002) */
  {"dex":3128,"name":"Paldean Tauros (Aqua)","types":["fighting","water"],"hp":104,"spd":120,"atk":1.31,"pa":1.31,"sa":0.86,"df":105,"sd":70,"rarity":3,"bst":490,"starter":false,"gen":1,"form":"regional"},   /* forma Paldea_Aqua de 128 (SpriteCollab 0128/0003) */
  {"dex":1142,"name":"Mega Aerodactyl","types":["rock","flying"],"hp":106,"spd":141,"atk":1.44,"pa":1.44,"sa":1.08,"df":85,"sd":95,"rarity":5,"bst":615,"starter":false,"gen":1,"form":"mega","excl":true},   /* forma Mega de 142 (SpriteCollab 0142/0001) */
  {"dex":1144,"name":"Galarian Articuno","types":["psychic","flying"],"hp":110,"spd":118,"atk":1.39,"pa":1.17,"sa":1.39,"df":85,"sd":100,"rarity":4,"bst":580,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 144 (SpriteCollab 0144/0001) */
  {"dex":1145,"name":"Galarian Zapdos","types":["fighting","flying"],"hp":110,"spd":120,"atk":1.39,"pa":1.39,"sa":1.17,"df":90,"sd":90,"rarity":4,"bst":580,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 145 (SpriteCollab 0145/0001) */
  {"dex":1146,"name":"Galarian Moltres","types":["dark","flying"],"hp":110,"spd":116,"atk":1.25,"pa":1.17,"sa":1.25,"df":90,"sd":125,"rarity":4,"bst":580,"starter":false,"gen":1,"form":"regional"},   /* forma Galar de 146 (SpriteCollab 0146/0001) */
  {"dex":1150,"name":"Mega Mewtwo Y","types":["psychic"],"hp":118,"spd":137,"atk":1.77,"pa":1.52,"sa":1.77,"df":70,"sd":120,"rarity":5,"bst":780,"starter":false,"gen":1,"form":"mega","excl":true},   /* forma Mega_Y de 150 (SpriteCollab 0150/0002) */
  {"dex":1157,"name":"Hisuian Typhlosion","types":["fire","ghost"],"hp":103,"spd":118,"atk":1.35,"pa":1.16,"sa":1.35,"df":78,"sd":85,"rarity":4,"bst":534,"starter":false,"gen":2,"form":"regional"},   /* forma Hisui de 157 (SpriteCollab 0157/0001) */
  {"dex":1194,"name":"Paldean Wooper","types":["poison","ground"],"hp":95,"spd":84,"atk":0.95,"pa":0.95,"sa":0.84,"df":45,"sd":25,"rarity":1,"bst":210,"starter":false,"gen":2,"form":"regional"},   /* forma Paldea de 194 (SpriteCollab 0194/0002) */
  {"dex":1199,"name":"Galarian Slowking","types":["poison","psychic"],"hp":113,"spd":91,"atk":1.31,"pa":1.06,"sa":1.31,"df":80,"sd":110,"rarity":3,"bst":490,"starter":false,"gen":2,"form":"regional"},   /* forma Galar de 199 (SpriteCollab 0199/0001) */
  {"dex":1208,"name":"Mega Steelix","types":["steel","ground"],"hp":104,"spd":91,"atk":1.39,"pa":1.39,"sa":1,"df":230,"sd":95,"rarity":5,"bst":610,"starter":false,"gen":2,"form":"mega","excl":true},   /* forma Mega de 208 (SpriteCollab 0208/0001) */
  {"dex":1211,"name":"Hisuian Qwilfish","types":["dark","poison"],"hp":99,"spd":114,"atk":1.22,"pa":1.22,"sa":1,"df":85,"sd":55,"rarity":3,"bst":440,"starter":false,"gen":2,"form":"regional"},   /* forma Hisui de 211 (SpriteCollab 0211/0001) */
  {"dex":1215,"name":"Hisuian Sneasel","types":["fighting","poison"],"hp":95,"spd":126,"atk":1.22,"pa":1.22,"sa":0.89,"df":55,"sd":75,"rarity":3,"bst":430,"starter":false,"gen":2,"form":"regional"},   /* forma Hisui de 215 (SpriteCollab 0215/0001) */
  {"dex":1222,"name":"Galarian Corsola","types":["ghost"],"hp":97,"spd":91,"atk":1.06,"pa":1,"sa":1.06,"df":100,"sd":100,"rarity":3,"bst":410,"starter":false,"gen":2,"form":"regional"},   /* forma Galar de 222 (SpriteCollab 0222/0001) */
  {"dex":1227,"name":"Mega Skarmory","types":["steel","flying"],"hp":99,"spd":124,"atk":1.47,"pa":1.47,"sa":0.92,"df":110,"sd":100,"rarity":4,"bst":565,"starter":false,"gen":2,"form":"mega","excl":true},   /* forma Mega de 227 (SpriteCollab 0227/0001) */
  {"dex":1229,"name":"Mega Houndoom","types":["dark","fire"],"hp":104,"spd":126,"atk":1.47,"pa":1.2,"sa":1.47,"df":90,"sd":90,"rarity":5,"bst":600,"starter":false,"gen":2,"form":"mega","excl":true},   /* forma Mega de 229 (SpriteCollab 0229/0001) */
  {"dex":1248,"name":"Mega Tyranitar","types":["rock","dark"],"hp":115,"spd":108,"atk":1.6,"pa":1.6,"sa":1.22,"df":150,"sd":120,"rarity":5,"bst":700,"starter":false,"gen":2,"form":"mega","excl":true},   /* forma Mega de 248 (SpriteCollab 0248/0001) */
  {"dex":1263,"name":"Galarian Zigzagoon","types":["dark","normal"],"hp":87,"spd":103,"atk":0.86,"pa":0.86,"sa":0.86,"df":41,"sd":41,"rarity":1,"bst":240,"starter":false,"gen":3,"form":"regional"},   /* forma Galar de 263 (SpriteCollab 0263/0001) */
  {"dex":1264,"name":"Galarian Linoone","types":["dark","normal"],"hp":105,"spd":120,"atk":1.08,"pa":1.08,"sa":0.97,"df":61,"sd":61,"rarity":3,"bst":420,"starter":false,"gen":3,"form":"regional"},   /* forma Galar de 264 (SpriteCollab 0264/0001) */
  {"dex":1282,"name":"Mega Gardevoir","types":["psychic","fairy"],"hp":101,"spd":120,"atk":1.61,"pa":1.17,"sa":1.61,"df":65,"sd":135,"rarity":5,"bst":618,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 282 (SpriteCollab 0282/0001) */
  {"dex":1302,"name":"Mega Sableye","types":["dark","ghost"],"hp":92,"spd":86,"atk":1.17,"pa":1.17,"sa":1.17,"df":125,"sd":115,"rarity":3,"bst":480,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 302 (SpriteCollab 0302/0001) */
  {"dex":1303,"name":"Mega Mawile","types":["steel","fairy"],"hp":92,"spd":99,"atk":1.28,"pa":1.28,"sa":1,"df":125,"sd":95,"rarity":3,"bst":480,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 303 (SpriteCollab 0303/0001) */
  {"dex":1308,"name":"Mega Medicham","types":["fighting","psychic"],"hp":97,"spd":120,"atk":1.25,"pa":1.25,"sa":1.14,"df":85,"sd":85,"rarity":4,"bst":510,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 308 (SpriteCollab 0308/0001) */
  {"dex":1310,"name":"Mega Manectric","types":["electric"],"hp":102,"spd":135,"atk":1.44,"pa":1.11,"sa":1.44,"df":80,"sd":80,"rarity":4,"bst":575,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 310 (SpriteCollab 0310/0001) */
  {"dex":1319,"name":"Mega Sharpedo","types":["water","dark"],"hp":102,"spd":122,"atk":1.47,"pa":1.47,"sa":1.31,"df":70,"sd":65,"rarity":4,"bst":560,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 319 (SpriteCollab 0319/0001) */
  {"dex":1323,"name":"Mega Camerupt","types":["fire","ground"],"hp":102,"spd":86,"atk":1.5,"pa":1.36,"sa":1.5,"df":100,"sd":105,"rarity":4,"bst":560,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 323 (SpriteCollab 0323/0001) */
  {"dex":1334,"name":"Mega Altaria","types":["dragon","fairy"],"hp":104,"spd":112,"atk":1.31,"pa":1.31,"sa":1.31,"df":110,"sd":105,"rarity":4,"bst":590,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 334 (SpriteCollab 0334/0001) */
  {"dex":1351,"name":"Castform Sunny","types":["fire"],"hp":102,"spd":107,"atk":1.08,"pa":1.08,"sa":1.08,"df":70,"sd":70,"rarity":3,"bst":420,"starter":false,"gen":3,"form":"battle","excl":true},   /* forma Sunny de 351 (SpriteCollab 0351/0001) */
  {"dex":2351,"name":"Castform Rainy","types":["water"],"hp":102,"spd":107,"atk":1.08,"pa":1.08,"sa":1.08,"df":70,"sd":70,"rarity":3,"bst":420,"starter":false,"gen":3,"form":"battle","excl":true},   /* forma Rainy de 351 (SpriteCollab 0351/0002) */
  {"dex":3351,"name":"Castform Snowy","types":["ice"],"hp":102,"spd":107,"atk":1.08,"pa":1.08,"sa":1.08,"df":70,"sd":70,"rarity":3,"bst":420,"starter":false,"gen":3,"form":"battle","excl":true},   /* forma Snowy de 351 (SpriteCollab 0351/0003) */
  {"dex":1354,"name":"Mega Banette","types":["ghost"],"hp":99,"spd":110,"atk":1.61,"pa":1.61,"sa":1.21,"df":75,"sd":83,"rarity":4,"bst":555,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 354 (SpriteCollab 0354/0001) */
  {"dex":1359,"name":"Mega Absol","types":["dark"],"hp":99,"spd":126,"atk":1.52,"pa":1.52,"sa":1.33,"df":60,"sd":60,"rarity":4,"bst":565,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 359 (SpriteCollab 0359/0001) */
  {"dex":1362,"name":"Mega Glalie","types":["ice"],"hp":106,"spd":120,"atk":1.36,"pa":1.36,"sa":1.36,"df":80,"sd":80,"rarity":4,"bst":580,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 362 (SpriteCollab 0362/0001) */
  {"dex":1380,"name":"Mega Latias","types":["dragon","psychic"],"hp":106,"spd":124,"atk":1.47,"pa":1.25,"sa":1.47,"df":120,"sd":150,"rarity":5,"bst":700,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 380 (SpriteCollab 0380/0001) */
  {"dex":1381,"name":"Mega Latios","types":["dragon","psychic"],"hp":106,"spd":124,"atk":1.58,"pa":1.42,"sa":1.58,"df":100,"sd":120,"rarity":5,"bst":700,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 381 (SpriteCollab 0381/0001) */
  {"dex":1386,"name":"Deoxys Attack","types":["psychic"],"hp":92,"spd":141,"atk":1.69,"pa":1.69,"sa":1.69,"df":20,"sd":20,"rarity":5,"bst":600,"starter":false,"gen":3,"form":"stat","excl":true},   /* forma Attack de 386 (SpriteCollab 0386/0001) */
  {"dex":2386,"name":"Deoxys Defense","types":["psychic"],"hp":92,"spd":116,"atk":1.08,"pa":1.08,"sa":1.08,"df":160,"sd":160,"rarity":5,"bst":600,"starter":false,"gen":3,"form":"stat","excl":true},   /* forma Defense de 386 (SpriteCollab 0386/0002) */
  {"dex":3386,"name":"Deoxys Speed","types":["psychic"],"hp":92,"spd":154,"atk":1.22,"pa":1.22,"sa":1.22,"df":90,"sd":90,"rarity":5,"bst":600,"starter":false,"gen":3,"form":"stat","excl":true},   /* forma Speed de 386 (SpriteCollab 0386/0003) */
  {"dex":1412,"name":"Burmy Sandy","types":["bug"],"hp":88,"spd":93,"atk":0.86,"pa":0.86,"sa":0.86,"df":45,"sd":45,"rarity":1,"bst":224,"starter":false,"gen":4,"form":"look","excl":true},   /* forma Sand de 412 (SpriteCollab 0412/0001) */
  {"dex":2412,"name":"Burmy Trash","types":["bug"],"hp":88,"spd":93,"atk":0.86,"pa":0.86,"sa":0.86,"df":45,"sd":45,"rarity":1,"bst":224,"starter":false,"gen":4,"form":"look","excl":true},   /* forma Trash de 412 (SpriteCollab 0412/0002) */
  {"dex":1413,"name":"Wormadam Sandy","types":["bug","ground"],"hp":97,"spd":93,"atk":1.13,"pa":1.13,"sa":1.02,"df":105,"sd":85,"rarity":3,"bst":424,"starter":false,"gen":4,"form":"stat","excl":true},   /* forma Sand de 413 (SpriteCollab 0413/0001) */
  {"dex":2413,"name":"Wormadam Trash","types":["bug","steel"],"hp":97,"spd":93,"atk":1.08,"pa":1.08,"sa":1.08,"df":95,"sd":95,"rarity":3,"bst":424,"starter":false,"gen":4,"form":"stat","excl":true},   /* forma Trash de 413 (SpriteCollab 0413/0002) */
  {"dex":1428,"name":"Mega Lopunny","types":["normal","fighting"],"hp":99,"spd":135,"atk":1.45,"pa":1.45,"sa":1,"df":94,"sd":96,"rarity":4,"bst":580,"starter":false,"gen":4,"form":"mega","excl":true},   /* forma Mega de 428 (SpriteCollab 0428/0001) */
  {"dex":1448,"name":"Mega Lucario","types":["fighting","steel"],"hp":102,"spd":125,"atk":1.5,"pa":1.5,"sa":1.47,"df":88,"sd":70,"rarity":5,"bst":625,"starter":false,"gen":4,"form":"mega","excl":true},   /* forma Mega de 448 (SpriteCollab 0448/0001) */
  {"dex":1475,"name":"Mega Gallade","types":["psychic","fighting"],"hp":101,"spd":124,"atk":1.61,"pa":1.61,"sa":1.06,"df":95,"sd":115,"rarity":5,"bst":618,"starter":false,"gen":4,"form":"mega","excl":true},   /* forma Mega de 475 (SpriteCollab 0475/0001) */
  {"dex":1479,"name":"Heat Rotom","types":["electric","fire"],"hp":92,"spd":114,"atk":1.28,"pa":1.06,"sa":1.28,"df":107,"sd":107,"rarity":4,"bst":520,"starter":false,"gen":4,"form":"stat","excl":true},   /* forma Heat de 479 (SpriteCollab 0479/0001) */
  {"dex":2479,"name":"Wash Rotom","types":["electric","water"],"hp":92,"spd":114,"atk":1.28,"pa":1.06,"sa":1.28,"df":107,"sd":107,"rarity":4,"bst":520,"starter":false,"gen":4,"form":"stat","excl":true},   /* forma Wash de 479 (SpriteCollab 0479/0002) */
  {"dex":3479,"name":"Frost Rotom","types":["electric","ice"],"hp":92,"spd":114,"atk":1.28,"pa":1.06,"sa":1.28,"df":107,"sd":107,"rarity":4,"bst":520,"starter":false,"gen":4,"form":"stat","excl":true},   /* forma Frost de 479 (SpriteCollab 0479/0003) */
  {"dex":4479,"name":"Fan Rotom","types":["electric","flying"],"hp":92,"spd":114,"atk":1.28,"pa":1.06,"sa":1.28,"df":107,"sd":107,"rarity":4,"bst":520,"starter":false,"gen":4,"form":"stat","excl":true},   /* forma Fan de 479 (SpriteCollab 0479/0004) */
  {"dex":5479,"name":"Mow Rotom","types":["electric","grass"],"hp":92,"spd":114,"atk":1.28,"pa":1.06,"sa":1.28,"df":107,"sd":107,"rarity":4,"bst":520,"starter":false,"gen":4,"form":"stat","excl":true},   /* forma Mow de 479 (SpriteCollab 0479/0005) */
  {"dex":2483,"name":"Primal Dialga","types":["steel","dragon"],"hp":123,"spd":120,"atk":1.64,"pa":1.47,"sa":1.64,"df":120,"sd":100,"rarity":5,"bst":780,"starter":false,"gen":4,"excl":true,"form":"look"},   /* forma Primal de 483 (SpriteCollab 0483/0002) */
  {"dex":1487,"name":"Origin Giratina","types":["ghost","dragon"],"hp":138,"spd":116,"atk":1.36,"pa":1.36,"sa":1.36,"df":100,"sd":100,"rarity":5,"bst":680,"starter":false,"gen":4,"form":"stat","excl":true},   /* forma Origin de 487 (SpriteCollab 0487/0001) */
  {"dex":1491,"name":"Mega Darkrai","types":["dark"],"hp":102,"spd":114,"atk":1.61,"pa":1.36,"sa":1.61,"df":130,"sd":130,"rarity":5,"bst":700,"starter":false,"gen":4,"form":"mega","excl":true},   /* forma Mega de 491 (SpriteCollab 0491/0002) */
  {"dex":1492,"name":"Sky Shaymin","types":["grass","flying"],"hp":115,"spd":131,"atk":1.36,"pa":1.27,"sa":1.36,"df":75,"sd":75,"rarity":5,"bst":600,"starter":false,"gen":4,"form":"stat","excl":true},   /* forma Sky de 492 (SpriteCollab 0492/0001) */
  {"dex":1503,"name":"Hisuian Samurott","types":["water","dark"],"hp":110,"spd":114,"atk":1.29,"pa":1.29,"sa":1.25,"df":80,"sd":65,"rarity":4,"bst":528,"starter":false,"gen":5,"form":"regional"},   /* forma Hisui de 503 (SpriteCollab 0503/0001) */
  {"dex":1530,"name":"Mega Excadrill","types":["ground","steel"],"hp":120,"spd":121,"atk":1.61,"pa":1.61,"sa":1.06,"df":100,"sd":65,"rarity":5,"bst":608,"starter":false,"gen":5,"form":"mega","excl":true},   /* forma Mega de 530 (SpriteCollab 0530/0001) */
  {"dex":1549,"name":"Hisuian Lilligant","types":["grass","fighting"],"hp":102,"spd":122,"atk":1.28,"pa":1.28,"sa":0.97,"df":75,"sd":75,"rarity":3,"bst":480,"starter":false,"gen":5,"form":"regional"},   /* forma Hisui de 549 (SpriteCollab 0549/0001) */
  {"dex":1554,"name":"Galarian Darumaka","types":["ice"],"hp":102,"spd":99,"atk":1.2,"pa":1.2,"sa":0.78,"df":45,"sd":45,"rarity":1,"bst":315,"starter":false,"gen":5,"form":"regional"},   /* forma Galar de 554 (SpriteCollab 0554/0001) */
  {"dex":1555,"name":"Zen Darmanitan","types":["fire","psychic"],"hp":117,"spd":101,"atk":1.47,"pa":0.86,"sa":1.47,"df":105,"sd":105,"rarity":4,"bst":540,"starter":false,"gen":5,"form":"battle","excl":true},   /* forma Zen de 555 (SpriteCollab 0555/0001) */
  {"dex":2555,"name":"Galarian Darmanitan","types":["ice"],"hp":117,"spd":118,"atk":1.47,"pa":1.47,"sa":0.86,"df":55,"sd":55,"rarity":3,"bst":480,"starter":false,"gen":5,"form":"regional"},   /* forma Galar de 555 (SpriteCollab 0555/0002) */
  {"dex":1560,"name":"Mega Scrafty","types":["dark","fighting"],"hp":99,"spd":107,"atk":1.42,"pa":1.42,"sa":1,"df":135,"sd":135,"rarity":4,"bst":588,"starter":false,"gen":5,"form":"mega","excl":true},   /* forma Mega de 560 (SpriteCollab 0560/0001) */
  {"dex":1562,"name":"Galarian Yamask","types":["ground","ghost"],"hp":87,"spd":91,"atk":1,"pa":1,"sa":0.86,"df":85,"sd":65,"rarity":1,"bst":303,"starter":false,"gen":5,"form":"regional"},   /* forma Galar de 562 (SpriteCollab 0562/0001) */
  {"dex":1570,"name":"Hisuian Zorua","types":["normal","ghost"],"hp":86,"spd":107,"atk":1.17,"pa":1.03,"sa":1.17,"df":40,"sd":40,"rarity":2,"bst":330,"starter":false,"gen":5,"form":"regional"},   /* forma Hisui de 570 (SpriteCollab 0570/0001) */
  {"dex":1571,"name":"Hisuian Zoroark","types":["normal","ghost"],"hp":95,"spd":124,"atk":1.39,"pa":1.25,"sa":1.39,"df":60,"sd":60,"rarity":4,"bst":510,"starter":false,"gen":5,"form":"regional"},   /* forma Hisui de 571 (SpriteCollab 0571/0001) */
  {"dex":1604,"name":"Mega Eelektross","types":["electric"],"hp":108,"spd":112,"atk":1.5,"pa":1.5,"sa":1.44,"df":80,"sd":90,"rarity":5,"bst":615,"starter":false,"gen":5,"form":"mega","excl":true},   /* forma Mega de 604 (SpriteCollab 0604/0001) */
  {"dex":1628,"name":"Hisuian Braviary","types":["psychic","flying"],"hp":120,"spd":105,"atk":1.32,"pa":1.16,"sa":1.32,"df":70,"sd":70,"rarity":4,"bst":510,"starter":false,"gen":5,"form":"regional"},   /* forma Hisui de 628 (SpriteCollab 0628/0001) */
  {"dex":1645,"name":"Therian Landorus","types":["ground","flying"],"hp":110,"spd":116,"atk":1.5,"pa":1.5,"sa":1.28,"df":90,"sd":80,"rarity":5,"bst":600,"starter":false,"gen":5,"form":"stat","excl":true},   /* forma Therian de 645 (SpriteCollab 0645/0001) */
  {"dex":1648,"name":"Meloetta Pirouette","types":["normal","fighting"],"hp":115,"spd":132,"atk":1.4,"pa":1.4,"sa":1.12,"df":90,"sd":77,"rarity":5,"bst":600,"starter":false,"gen":5,"form":"battle","excl":true},   /* forma Pirouette de 648 (SpriteCollab 0648/0001) */
  {"dex":1670,"name":"Mega Floette","types":["fairy"],"hp":103,"spd":121,"atk":1.55,"pa":1.17,"sa":1.55,"df":87,"sd":148,"rarity":5,"bst":651,"starter":false,"gen":6,"form":"mega","excl":true},   /* forma Mega de 670 (SpriteCollab 0670/0006) */
  {"dex":1681,"name":"Aegislash Blade","types":["steel","ghost"],"hp":97,"spd":103,"atk":1.47,"pa":1.47,"sa":1.47,"df":50,"sd":50,"rarity":4,"bst":500,"starter":false,"gen":6,"form":"battle","excl":true},   /* forma Blade de 681 (SpriteCollab 0681/0001) */
  {"dex":1691,"name":"Mega Dragalge","types":["poison","dragon"],"hp":99,"spd":96,"atk":1.43,"pa":1.17,"sa":1.43,"df":105,"sd":163,"rarity":4,"bst":594,"starter":false,"gen":6,"form":"mega","excl":true},   /* forma Mega de 691 (SpriteCollab 0691/0001) */
  {"dex":1705,"name":"Hisuian Sliggoo","types":["steel","dragon"],"hp":96,"spd":95,"atk":1.16,"pa":1.11,"sa":1.16,"df":83,"sd":113,"rarity":3,"bst":452,"starter":false,"gen":6,"form":"regional"},   /* forma Hisui de 705 (SpriteCollab 0705/0001) */
  {"dex":1706,"name":"Hisuian Goodra","types":["steel","dragon"],"hp":106,"spd":103,"atk":1.31,"pa":1.25,"sa":1.31,"df":100,"sd":150,"rarity":5,"bst":600,"starter":false,"gen":6,"form":"regional"},   /* forma Hisui de 706 (SpriteCollab 0706/0001) */
  {"dex":1713,"name":"Hisuian Avalugg","types":["ice","rock"],"hp":113,"spd":94,"atk":1.4,"pa":1.4,"sa":0.89,"df":184,"sd":36,"rarity":4,"bst":514,"starter":false,"gen":6,"form":"regional"},   /* forma Hisui de 713 (SpriteCollab 0713/0001) */
  {"dex":1718,"name":"Zygarde 10%","types":["dragon","ground"],"hp":127,"spd":122,"atk":1.37,"pa":1.37,"sa":1.26,"df":121,"sd":95,"rarity":5,"bst":700,"starter":false,"gen":6,"form":"stat","excl":true},   /* forma 10 de 718 (SpriteCollab 0718/0001) */
  {"dex":2718,"name":"Zygarde Complete","types":["dragon","ground"],"hp":167,"spd":114,"atk":1.25,"pa":1.25,"sa":1.2,"df":121,"sd":95,"rarity":5,"bst":708,"starter":false,"gen":6,"form":"power","excl":true},   /* forma Complete de 718 (SpriteCollab 0718/0002) */
  {"dex":3718,"name":"Mega Zygarde","types":["dragon","ground"],"hp":167,"spd":120,"atk":1.89,"pa":1.08,"sa":1.89,"df":91,"sd":85,"rarity":5,"bst":778,"starter":false,"gen":6,"form":"mega","excl":true},   /* forma Mega de 718 (SpriteCollab 0718/0005) */
  {"dex":1719,"name":"Mega Diancie","types":["rock","fairy"],"hp":92,"spd":124,"atk":1.58,"pa":1.58,"sa":1.58,"df":110,"sd":110,"rarity":5,"bst":700,"starter":false,"gen":6,"form":"mega","excl":true},   /* forma Mega de 719 (SpriteCollab 0719/0001) */
  {"dex":1720,"name":"Hoopa Unbound","types":["psychic","dark"],"hp":106,"spd":112,"atk":1.64,"pa":1.58,"sa":1.64,"df":60,"sd":130,"rarity":5,"bst":680,"starter":false,"gen":6,"form":"stat","excl":true},   /* forma Unbound de 720 (SpriteCollab 0720/0001) */
  {"dex":1724,"name":"Hisuian Decidueye","types":["grass","fighting"],"hp":110,"spd":103,"atk":1.32,"pa":1.32,"sa":1.22,"df":80,"sd":95,"rarity":4,"bst":530,"starter":false,"gen":7,"form":"regional"},   /* forma Hisui de 724 (SpriteCollab 0724/0001) */
  {"dex":1741,"name":"Oricorio Pom-Pom","types":["electric","flying"],"hp":104,"spd":117,"atk":1.24,"pa":1.08,"sa":1.24,"df":70,"sd":70,"rarity":3,"bst":476,"starter":false,"gen":7,"form":"stat","excl":true},   /* forma Pom_Pom de 741 (SpriteCollab 0741/0001) */
  {"dex":2741,"name":"Oricorio Pa'u","types":["psychic","flying"],"hp":104,"spd":117,"atk":1.24,"pa":1.08,"sa":1.24,"df":70,"sd":70,"rarity":3,"bst":476,"starter":false,"gen":7,"form":"stat","excl":true},   /* forma Pa_U de 741 (SpriteCollab 0741/0002) */
  {"dex":3741,"name":"Oricorio Sensu","types":["ghost","flying"],"hp":104,"spd":117,"atk":1.24,"pa":1.08,"sa":1.24,"df":70,"sd":70,"rarity":3,"bst":476,"starter":false,"gen":7,"form":"stat","excl":true},   /* forma Sensu de 741 (SpriteCollab 0741/0003) */
  {"dex":1745,"name":"Lycanroc Midnight","types":["rock"],"hp":108,"spd":112,"atk":1.33,"pa":1.33,"sa":1,"df":75,"sd":75,"rarity":3,"bst":487,"starter":false,"gen":7,"form":"stat","excl":true},   /* forma Midnight de 745 (SpriteCollab 0745/0001) */
  {"dex":2745,"name":"Lycanroc Dusk","types":["rock"],"hp":104,"spd":124,"atk":1.34,"pa":1.34,"sa":1,"df":65,"sd":65,"rarity":3,"bst":487,"starter":false,"gen":7,"form":"stat","excl":true},   /* forma Dusk de 745 (SpriteCollab 0745/0002) */
  {"dex":1746,"name":"Wishiwashi School","types":["water"],"hp":90,"spd":91,"atk":1.47,"pa":1.47,"sa":1.47,"df":130,"sd":135,"rarity":5,"bst":620,"starter":false,"gen":7,"form":"battle","excl":true},   /* forma School de 746 (SpriteCollab 0746/0001) */
  {"dex":1780,"name":"Mega Drampa","types":["normal","dragon"],"hp":105,"spd":93,"atk":1.58,"pa":1.17,"sa":1.58,"df":110,"sd":116,"rarity":4,"bst":585,"starter":false,"gen":7,"form":"mega","excl":true},   /* forma Mega de 780 (SpriteCollab 0780/0001) */
  {"dex":1807,"name":"Mega Zeraora","types":["electric"],"hp":110,"spd":142,"atk":1.56,"pa":1.56,"sa":1.51,"df":75,"sd":80,"rarity":5,"bst":700,"starter":false,"gen":7,"form":"mega","excl":true},   /* forma Mega de 807 (SpriteCollab 0807/0001) */
  {"dex":1849,"name":"Toxtricity Low Key","types":["electric","poison"],"hp":104,"spd":110,"atk":1.33,"pa":1.24,"sa":1.33,"df":70,"sd":70,"rarity":4,"bst":502,"starter":false,"gen":8,"form":"stat","excl":true},   /* forma Lowkey de 849 (SpriteCollab 0849/0001) */
  {"dex":1890,"name":"Eternatus Eternamax","types":["poison","dragon"],"hp":185,"spd":133,"atk":1.39,"pa":1.33,"sa":1.39,"df":250,"sd":250,"rarity":5,"bst":1125,"starter":false,"gen":8,"form":"special","excl":true},   /* forma Eternamax de 890 (SpriteCollab 0890/0001) */
  {"dex":1892,"name":"Urshifu Rapid Strike","types":["fighting","water"],"hp":115,"spd":119,"atk":1.42,"pa":1.42,"sa":1.05,"df":100,"sd":60,"rarity":4,"bst":550,"starter":false,"gen":8,"form":"stat","excl":true},   /* forma Rapid_Strike de 892 (SpriteCollab 0892/0001) */
  {"dex":1901,"name":"Bloodmoon Ursaluna","types":["ground","normal"],"hp":121,"spd":100,"atk":1.44,"pa":1.08,"sa":1.44,"df":120,"sd":65,"rarity":4,"bst":555,"starter":false,"gen":8,"form":"stat","excl":true},   /* forma Bloodmoon de 901 (SpriteCollab 0901/0001) */
  {"dex":1905,"name":"Therian Enamorus","types":["fairy","flying"],"hp":103,"spd":97,"atk":1.44,"pa":1.33,"sa":1.44,"df":110,"sd":100,"rarity":4,"bst":580,"starter":false,"gen":8,"form":"stat","excl":true},   /* forma Therian de 905 (SpriteCollab 0905/0001) */
  {"dex":1964,"name":"Palafin Hero","types":["water"],"hp":115,"spd":120,"atk":1.58,"pa":1.58,"sa":1.28,"df":97,"sd":87,"rarity":5,"bst":650,"starter":false,"gen":9,"form":"battle","excl":true},   /* forma Hero de 964 (SpriteCollab 0964/0001) */
  {"dex":1978,"name":"Mega Tatsugiri","types":["dragon","water"],"hp":109,"spd":116,"atk":1.48,"pa":1.06,"sa":1.48,"df":60,"sd":95,"rarity":4,"bst":575,"starter":false,"gen":9,"form":"mega","excl":true},   /* forma Mega de 978 (SpriteCollab 0978/0003) */
  {"dex":2017,"name":"Ogerpon Wellspring","types":["grass","water"],"hp":106,"spd":124,"atk":1.36,"pa":1.36,"sa":1.03,"df":84,"sd":96,"rarity":4,"bst":550,"starter":false,"gen":9,"form":"stat","excl":true},   /* forma Wellspring_Mask de 1017 (SpriteCollab 1017/0005) */
  {"dex":3017,"name":"Ogerpon Hearthflame","types":["grass","fire"],"hp":106,"spd":124,"atk":1.36,"pa":1.36,"sa":1.03,"df":84,"sd":96,"rarity":4,"bst":550,"starter":false,"gen":9,"form":"stat","excl":true},   /* forma Hearthflame_Mask de 1017 (SpriteCollab 1017/0006) */
  {"dex":4017,"name":"Ogerpon Cornerstone","types":["grass","rock"],"hp":106,"spd":124,"atk":1.36,"pa":1.36,"sa":1.03,"df":84,"sd":96,"rarity":4,"bst":550,"starter":false,"gen":9,"form":"stat","excl":true},   /* forma Cornerstone_Mask de 1017 (SpriteCollab 1017/0007) */
  {"dex":2024,"name":"Terastal Terapagos","types":["normal"],"hp":113,"spd":114,"atk":1.28,"pa":1.22,"sa":1.28,"df":110,"sd":110,"rarity":5,"bst":600,"starter":false,"gen":9,"form":"battle","excl":true},   /* forma Terastal de 1024 (SpriteCollab 1024/0001) */
  /* ---- copia local, 24-11-2026: formas nuevas de SpriteCollab (tools/add_forms.py) ---- */
  {"dex":1254,"name":"Mega Sceptile","types":["grass","dragon"],"hp":102,"spd":139,"atk":1.5,"pa":1.31,"sa":1.5,"df":75,"sd":85,"rarity":5,"bst":630,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 254 (SpriteCollab 0254/0001) */
  {"dex":1358,"name":"Mega Chimecho","types":["psychic","steel"],"hp":104,"spd":105,"atk":1.44,"pa":0.97,"sa":1.44,"df":110,"sd":120,"rarity":4,"bst":555,"starter":false,"gen":3,"form":"mega","excl":true},   /* forma Mega de 358 (SpriteCollab 0358/0001) */
  {"dex":1701,"name":"Mega Hawlucha","types":["fighting","flying"],"hp":105,"spd":128,"atk":1.45,"pa":1.45,"sa":1.11,"df":100,"sd":93,"rarity":5,"bst":600,"starter":false,"gen":6,"form":"mega","excl":true},   /* forma Mega de 701 (SpriteCollab 0701/0001) */
  {"dex":1172,"name":"Pichu Spiky-eared","types":["electric"],"hp":79,"spd":103,"atk":0.92,"pa":0.92,"sa":0.89,"df":15,"sd":35,"rarity":1,"bst":205,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma Spiky de 172 (SpriteCollab 0172/0001), aspecto */
  {"dex":1201,"name":"Unown B","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma B de 201 (SpriteCollab 0201/0001), aspecto */
  {"dex":2201,"name":"Unown C","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma C de 201 (SpriteCollab 0201/0002), aspecto */
  {"dex":3201,"name":"Unown D","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma D de 201 (SpriteCollab 0201/0003), aspecto */
  {"dex":4201,"name":"Unown E","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma E de 201 (SpriteCollab 0201/0004), aspecto */
  {"dex":5201,"name":"Unown F","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma F de 201 (SpriteCollab 0201/0005), aspecto */
  {"dex":6201,"name":"Unown G","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma G de 201 (SpriteCollab 0201/0006), aspecto */
  {"dex":7201,"name":"Unown H","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma H de 201 (SpriteCollab 0201/0007), aspecto */
  {"dex":8201,"name":"Unown I","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma I de 201 (SpriteCollab 0201/0008), aspecto */
  {"dex":9201,"name":"Unown J","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma J de 201 (SpriteCollab 0201/0009), aspecto */
  {"dex":10201,"name":"Unown K","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma K de 201 (SpriteCollab 0201/0010), aspecto */
  {"dex":11201,"name":"Unown L","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma L de 201 (SpriteCollab 0201/0011), aspecto */
  {"dex":12201,"name":"Unown M","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma M de 201 (SpriteCollab 0201/0012), aspecto */
  {"dex":13201,"name":"Unown N","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma N de 201 (SpriteCollab 0201/0013), aspecto */
  {"dex":14201,"name":"Unown O","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma O de 201 (SpriteCollab 0201/0014), aspecto */
  {"dex":15201,"name":"Unown P","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma P de 201 (SpriteCollab 0201/0015), aspecto */
  {"dex":16201,"name":"Unown Q","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma Q de 201 (SpriteCollab 0201/0016), aspecto */
  {"dex":17201,"name":"Unown R","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma R de 201 (SpriteCollab 0201/0017), aspecto */
  {"dex":18201,"name":"Unown S","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma S de 201 (SpriteCollab 0201/0018), aspecto */
  {"dex":19201,"name":"Unown T","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma T de 201 (SpriteCollab 0201/0019), aspecto */
  {"dex":20201,"name":"Unown U","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma U de 201 (SpriteCollab 0201/0020), aspecto */
  {"dex":21201,"name":"Unown V","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma V de 201 (SpriteCollab 0201/0021), aspecto */
  {"dex":22201,"name":"Unown W","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma W de 201 (SpriteCollab 0201/0022), aspecto */
  {"dex":23201,"name":"Unown X","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma X de 201 (SpriteCollab 0201/0023), aspecto */
  {"dex":24201,"name":"Unown Y","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma Y de 201 (SpriteCollab 0201/0024), aspecto */
  {"dex":25201,"name":"Unown Z","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma Z de 201 (SpriteCollab 0201/0025), aspecto */
  {"dex":26201,"name":"Unown !","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma Exclamation de 201 (SpriteCollab 0201/0026), aspecto */
  {"dex":27201,"name":"Unown ?","types":["psychic"],"hp":92,"spd":98,"atk":1.1,"pa":1.1,"sa":1.1,"df":48,"sd":48,"rarity":2,"bst":336,"starter":false,"gen":2,"excl":true,"form":"look"},   /* forma Question de 201 (SpriteCollab 0201/0027), aspecto */
  {"dex":1421,"name":"Cherrim Sunshine","types":["grass"],"hp":102,"spd":114,"atk":1.18,"pa":1.03,"sa":1.18,"df":70,"sd":78,"rarity":3,"bst":450,"starter":false,"gen":4,"excl":true,"form":"battle"},   /* forma Sunshine de 421 (SpriteCollab 0421/0001), aspecto */
  {"dex":1422,"name":"Shellos East","types":["water"],"hp":104,"spd":92,"atk":1.01,"pa":0.96,"sa":1.01,"df":48,"sd":62,"rarity":2,"bst":325,"starter":false,"gen":4,"excl":true,"form":"look"},   /* forma East de 422 (SpriteCollab 0422/0001), aspecto */
  {"dex":1423,"name":"Gastrodon East","types":["water","ground"],"hp":120,"spd":94,"atk":1.21,"pa":1.16,"sa":1.21,"df":68,"sd":82,"rarity":3,"bst":475,"starter":false,"gen":4,"excl":true,"form":"look"},   /* forma East de 423 (SpriteCollab 0423/0001), aspecto */
  {"dex":1550,"name":"Basculin Blue-Striped","types":["water"],"hp":102,"spd":119,"atk":1.21,"pa":1.21,"sa":1.14,"df":65,"sd":55,"rarity":3,"bst":460,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Blue de 550 (SpriteCollab 0550/0001), aspecto */
  {"dex":2550,"name":"Basculin White-Striped","types":["water"],"hp":102,"spd":119,"atk":1.21,"pa":1.21,"sa":1.14,"df":65,"sd":55,"rarity":3,"bst":460,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma White de 550 (SpriteCollab 0550/0002), aspecto */
  {"dex":1585,"name":"Deerling Summer","types":["normal","grass"],"hp":97,"spd":110,"atk":1.03,"pa":1.03,"sa":0.92,"df":50,"sd":50,"rarity":2,"bst":335,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Summer de 585 (SpriteCollab 0585/0001), aspecto */
  {"dex":2585,"name":"Deerling Autumn","types":["normal","grass"],"hp":97,"spd":110,"atk":1.03,"pa":1.03,"sa":0.92,"df":50,"sd":50,"rarity":2,"bst":335,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Autumn de 585 (SpriteCollab 0585/0002), aspecto */
  {"dex":3585,"name":"Deerling Winter","types":["normal","grass"],"hp":97,"spd":110,"atk":1.03,"pa":1.03,"sa":0.92,"df":50,"sd":50,"rarity":2,"bst":335,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Winter de 585 (SpriteCollab 0585/0003), aspecto */
  {"dex":1586,"name":"Sawsbuck Summer","types":["normal","grass"],"hp":106,"spd":118,"atk":1.25,"pa":1.25,"sa":1.03,"df":70,"sd":70,"rarity":3,"bst":475,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Summer de 586 (SpriteCollab 0586/0001), aspecto */
  {"dex":2586,"name":"Sawsbuck Autumn","types":["normal","grass"],"hp":106,"spd":118,"atk":1.25,"pa":1.25,"sa":1.03,"df":70,"sd":70,"rarity":3,"bst":475,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Autumn de 586 (SpriteCollab 0586/0002), aspecto */
  {"dex":3586,"name":"Sawsbuck Winter","types":["normal","grass"],"hp":106,"spd":118,"atk":1.25,"pa":1.25,"sa":1.03,"df":70,"sd":70,"rarity":3,"bst":475,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Winter de 586 (SpriteCollab 0586/0003), aspecto */
  {"dex":1649,"name":"Genesect Douse","types":["bug","steel"],"hp":102,"spd":120,"atk":1.36,"pa":1.36,"sa":1.36,"df":95,"sd":95,"rarity":5,"bst":600,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Douse de 649 (SpriteCollab 0649/0001), aspecto */
  {"dex":2649,"name":"Genesect Shock","types":["bug","steel"],"hp":102,"spd":120,"atk":1.36,"pa":1.36,"sa":1.36,"df":95,"sd":95,"rarity":5,"bst":600,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Shock de 649 (SpriteCollab 0649/0002), aspecto */
  {"dex":3649,"name":"Genesect Burn","types":["bug","steel"],"hp":102,"spd":120,"atk":1.36,"pa":1.36,"sa":1.36,"df":95,"sd":95,"rarity":5,"bst":600,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Burn de 649 (SpriteCollab 0649/0003), aspecto */
  {"dex":4649,"name":"Genesect Chill","types":["bug","steel"],"hp":102,"spd":120,"atk":1.36,"pa":1.36,"sa":1.36,"df":95,"sd":95,"rarity":5,"bst":600,"starter":false,"gen":5,"excl":true,"form":"look"},   /* forma Chill de 649 (SpriteCollab 0649/0004), aspecto */
  {"dex":1666,"name":"Vivillon Icy Snow","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Icy_Snow de 666 (SpriteCollab 0666/0001), aspecto */
  {"dex":2666,"name":"Vivillon Polar","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Polar de 666 (SpriteCollab 0666/0002), aspecto */
  {"dex":3666,"name":"Vivillon Tundra","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Tundra de 666 (SpriteCollab 0666/0003), aspecto */
  {"dex":4666,"name":"Vivillon Continental","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Continental de 666 (SpriteCollab 0666/0004), aspecto */
  {"dex":5666,"name":"Vivillon Garden","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Garden de 666 (SpriteCollab 0666/0005), aspecto */
  {"dex":6666,"name":"Vivillon Elegant","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Elegant de 666 (SpriteCollab 0666/0006), aspecto */
  {"dex":7666,"name":"Vivillon Modern","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Modern de 666 (SpriteCollab 0666/0007), aspecto */
  {"dex":8666,"name":"Vivillon Marine","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Marine de 666 (SpriteCollab 0666/0008), aspecto */
  {"dex":9666,"name":"Vivillon Archipelago","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Archipelago de 666 (SpriteCollab 0666/0009), aspecto */
  {"dex":10666,"name":"Vivillon High Plains","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma High_Plains de 666 (SpriteCollab 0666/0010), aspecto */
  {"dex":11666,"name":"Vivillon Sandstorm","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Sandstorm de 666 (SpriteCollab 0666/0011), aspecto */
  {"dex":12666,"name":"Vivillon River","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma River de 666 (SpriteCollab 0666/0012), aspecto */
  {"dex":13666,"name":"Vivillon Monsoon","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Monsoon de 666 (SpriteCollab 0666/0013), aspecto */
  {"dex":14666,"name":"Vivillon Savanna","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Savannah de 666 (SpriteCollab 0666/0014), aspecto */
  {"dex":15666,"name":"Vivillon Sun","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Sun de 666 (SpriteCollab 0666/0015), aspecto */
  {"dex":16666,"name":"Vivillon Ocean","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Ocean de 666 (SpriteCollab 0666/0016), aspecto */
  {"dex":17666,"name":"Vivillon Jungle","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Jungle de 666 (SpriteCollab 0666/0017), aspecto */
  {"dex":18666,"name":"Vivillon Fancy","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Fancy de 666 (SpriteCollab 0666/0018), aspecto */
  {"dex":19666,"name":"Vivillon Poké Ball","types":["bug","flying"],"hp":106,"spd":115,"atk":1.2,"pa":0.99,"sa":1.2,"df":50,"sd":50,"rarity":3,"bst":411,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Pokeball de 666 (SpriteCollab 0666/0019), aspecto */
  {"dex":1669,"name":"Flabébé Yellow","types":["fairy"],"hp":90,"spd":96,"atk":1.04,"pa":0.91,"sa":1.04,"df":39,"sd":79,"rarity":1,"bst":303,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Yellow de 669 (SpriteCollab 0669/0001), aspecto */
  {"dex":2669,"name":"Flabébé Orange","types":["fairy"],"hp":90,"spd":96,"atk":1.04,"pa":0.91,"sa":1.04,"df":39,"sd":79,"rarity":1,"bst":303,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Orange de 669 (SpriteCollab 0669/0002), aspecto */
  {"dex":3669,"name":"Flabébé Blue","types":["fairy"],"hp":90,"spd":96,"atk":1.04,"pa":0.91,"sa":1.04,"df":39,"sd":79,"rarity":1,"bst":303,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Blue de 669 (SpriteCollab 0669/0003), aspecto */
  {"dex":4669,"name":"Flabébé White","types":["fairy"],"hp":90,"spd":96,"atk":1.04,"pa":0.91,"sa":1.04,"df":39,"sd":79,"rarity":1,"bst":303,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma White de 669 (SpriteCollab 0669/0004), aspecto */
  {"dex":2670,"name":"Floette Yellow","types":["fairy"],"hp":94,"spd":100,"atk":1.11,"pa":0.95,"sa":1.11,"df":47,"sd":98,"rarity":2,"bst":371,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Yellow de 670 (SpriteCollab 0670/0001), aspecto */
  {"dex":3670,"name":"Floette Orange","types":["fairy"],"hp":94,"spd":100,"atk":1.11,"pa":0.95,"sa":1.11,"df":47,"sd":98,"rarity":2,"bst":371,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Orange de 670 (SpriteCollab 0670/0002), aspecto */
  {"dex":4670,"name":"Floette Blue","types":["fairy"],"hp":94,"spd":100,"atk":1.11,"pa":0.95,"sa":1.11,"df":47,"sd":98,"rarity":2,"bst":371,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Blue de 670 (SpriteCollab 0670/0003), aspecto */
  {"dex":5670,"name":"Floette White","types":["fairy"],"hp":94,"spd":100,"atk":1.11,"pa":0.95,"sa":1.11,"df":47,"sd":98,"rarity":2,"bst":371,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma White de 670 (SpriteCollab 0670/0004), aspecto */
  {"dex":1671,"name":"Florges Yellow","types":["fairy"],"hp":105,"spd":110,"atk":1.32,"pa":1.06,"sa":1.32,"df":68,"sd":154,"rarity":4,"bst":552,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Yellow de 671 (SpriteCollab 0671/0001), aspecto */
  {"dex":2671,"name":"Florges Orange","types":["fairy"],"hp":105,"spd":110,"atk":1.32,"pa":1.06,"sa":1.32,"df":68,"sd":154,"rarity":4,"bst":552,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Orange de 671 (SpriteCollab 0671/0002), aspecto */
  {"dex":3671,"name":"Florges Blue","types":["fairy"],"hp":105,"spd":110,"atk":1.32,"pa":1.06,"sa":1.32,"df":68,"sd":154,"rarity":4,"bst":552,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Blue de 671 (SpriteCollab 0671/0003), aspecto */
  {"dex":4671,"name":"Florges White","types":["fairy"],"hp":105,"spd":110,"atk":1.32,"pa":1.06,"sa":1.32,"df":68,"sd":154,"rarity":4,"bst":552,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma White de 671 (SpriteCollab 0671/0004), aspecto */
  {"dex":6670,"name":"Floette Eternal","types":["fairy"],"hp":94,"spd":100,"atk":1.11,"pa":0.95,"sa":1.11,"df":47,"sd":98,"rarity":2,"bst":371,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Eternal de 670 (SpriteCollab 0670/0005), aspecto */
  {"dex":1676,"name":"Furfrou Kabuki","types":["normal"],"hp":104,"spd":121,"atk":1.14,"pa":1.14,"sa":1.06,"df":60,"sd":90,"rarity":3,"bst":472,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Kabuki de 676 (SpriteCollab 0676/0008), aspecto */
  {"dex":1710,"name":"Pumpkaboo Small","types":["ghost","grass"],"hp":92,"spd":99,"atk":1.06,"pa":1.06,"sa":0.94,"df":70,"sd":55,"rarity":2,"bst":335,"starter":false,"gen":6,"excl":true,"form":"stat"},   /* forma Small de 710 (SpriteCollab 0710/0001), aspecto */
  {"dex":2710,"name":"Pumpkaboo Large","types":["ghost","grass"],"hp":92,"spd":99,"atk":1.06,"pa":1.06,"sa":0.94,"df":70,"sd":55,"rarity":2,"bst":335,"starter":false,"gen":6,"excl":true,"form":"stat"},   /* forma Large de 710 (SpriteCollab 0710/0002), aspecto */
  {"dex":3710,"name":"Pumpkaboo Super","types":["ghost","grass"],"hp":92,"spd":99,"atk":1.06,"pa":1.06,"sa":0.94,"df":70,"sd":55,"rarity":2,"bst":335,"starter":false,"gen":6,"excl":true,"form":"stat"},   /* forma Super de 710 (SpriteCollab 0710/0003), aspecto */
  {"dex":1711,"name":"Gourgeist Super","types":["ghost","grass"],"hp":99,"spd":113,"atk":1.2,"pa":1.2,"sa":1.02,"df":122,"sd":75,"rarity":3,"bst":494,"starter":false,"gen":6,"excl":true,"form":"stat"},   /* forma Super de 711 (SpriteCollab 0711/0003), aspecto */
  {"dex":1716,"name":"Xerneas Neutral","types":["fairy"],"hp":127,"spd":120,"atk":1.42,"pa":1.42,"sa":1.42,"df":95,"sd":98,"rarity":5,"bst":680,"starter":false,"gen":6,"excl":true,"form":"look"},   /* forma Neutral de 716 (SpriteCollab 0716/0001), aspecto */
  {"dex":1774,"name":"Minior Red","types":["rock","flying"],"hp":97,"spd":103,"atk":1.03,"pa":1.03,"sa":1.03,"df":100,"sd":100,"rarity":3,"bst":440,"starter":false,"gen":7,"excl":true,"form":"battle"},   /* forma Red de 774 (SpriteCollab 0774/0001), aspecto */
  {"dex":2774,"name":"Minior Orange","types":["rock","flying"],"hp":97,"spd":103,"atk":1.03,"pa":1.03,"sa":1.03,"df":100,"sd":100,"rarity":3,"bst":440,"starter":false,"gen":7,"excl":true,"form":"battle"},   /* forma Orange de 774 (SpriteCollab 0774/0002), aspecto */
  {"dex":3774,"name":"Minior Yellow","types":["rock","flying"],"hp":97,"spd":103,"atk":1.03,"pa":1.03,"sa":1.03,"df":100,"sd":100,"rarity":3,"bst":440,"starter":false,"gen":7,"excl":true,"form":"battle"},   /* forma Yellow de 774 (SpriteCollab 0774/0003), aspecto */
  {"dex":4774,"name":"Minior Green","types":["rock","flying"],"hp":97,"spd":103,"atk":1.03,"pa":1.03,"sa":1.03,"df":100,"sd":100,"rarity":3,"bst":440,"starter":false,"gen":7,"excl":true,"form":"battle"},   /* forma Green de 774 (SpriteCollab 0774/0004), aspecto */
  {"dex":5774,"name":"Minior Blue","types":["rock","flying"],"hp":97,"spd":103,"atk":1.03,"pa":1.03,"sa":1.03,"df":100,"sd":100,"rarity":3,"bst":440,"starter":false,"gen":7,"excl":true,"form":"battle"},   /* forma Blue de 774 (SpriteCollab 0774/0005), aspecto */
  {"dex":6774,"name":"Minior Indigo","types":["rock","flying"],"hp":97,"spd":103,"atk":1.03,"pa":1.03,"sa":1.03,"df":100,"sd":100,"rarity":3,"bst":440,"starter":false,"gen":7,"excl":true,"form":"battle"},   /* forma Indigo de 774 (SpriteCollab 0774/0006), aspecto */
  {"dex":7774,"name":"Minior Violet","types":["rock","flying"],"hp":97,"spd":103,"atk":1.03,"pa":1.03,"sa":1.03,"df":100,"sd":100,"rarity":3,"bst":440,"starter":false,"gen":7,"excl":true,"form":"battle"},   /* forma Violet de 774 (SpriteCollab 0774/0007), aspecto */
  {"dex":1778,"name":"Mimikyu Busted","types":["ghost","fairy"],"hp":95,"spd":118,"atk":1.2,"pa":1.2,"sa":0.97,"df":80,"sd":105,"rarity":3,"bst":476,"starter":false,"gen":7,"excl":true,"form":"battle"},   /* forma Busted de 778 (SpriteCollab 0778/0001), aspecto */
  {"dex":1801,"name":"Magearna Original","types":["steel","fairy"],"hp":106,"spd":105,"atk":1.42,"pa":1.22,"sa":1.42,"df":115,"sd":115,"rarity":5,"bst":600,"starter":false,"gen":7,"excl":true,"form":"look"},   /* forma Original de 801 (SpriteCollab 0801/0001), aspecto */
  {"dex":1875,"name":"Eiscue Noice","types":["ice"],"hp":104,"spd":99,"atk":1.14,"pa":1.14,"sa":1.06,"df":110,"sd":90,"rarity":3,"bst":470,"starter":false,"gen":8,"excl":true,"form":"battle"},   /* forma Noice de 875 (SpriteCollab 0875/0001), aspecto */
  {"dex":1925,"name":"Maushold Family of Three","types":["normal"],"hp":103,"spd":125,"atk":1.11,"pa":1.11,"sa":1.06,"df":70,"sd":75,"rarity":3,"bst":470,"starter":false,"gen":9,"excl":true,"form":"look"},   /* forma Three de 925 (SpriteCollab 0925/0001), aspecto */
  {"dex":2978,"name":"Tatsugiri Stretchy","types":["dragon","water"],"hp":101,"spd":112,"atk":1.36,"pa":0.97,"sa":1.36,"df":60,"sd":95,"rarity":3,"bst":475,"starter":false,"gen":9,"excl":true,"form":"look"},   /* forma Stretchy de 978 (SpriteCollab 0978/0001), aspecto */
  {"dex":3978,"name":"Tatsugiri Droopy","types":["dragon","water"],"hp":101,"spd":112,"atk":1.36,"pa":0.97,"sa":1.36,"df":60,"sd":95,"rarity":3,"bst":475,"starter":false,"gen":9,"excl":true,"form":"look"},   /* forma Droopy de 978 (SpriteCollab 0978/0002), aspecto */
  /* ---- copia local, 24-11-2026: formas, megas y Gigamax del juego oficial (tools/official_import.cjs) ---- */
  {"dex":500003,"name":"Venusaur (Female)","types":["grass","poison"],"hp":106,"spd":112,"atk":1.25,"pa":1.15,"sa":1.25,"df":83,"sd":100,"rarity":4,"bst":525,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look venusaur-female (juego oficial 500003) */
  {"dex":500012,"name":"Butterfree (Female)","types":["bug","flying"],"hp":97,"spd":107,"atk":1.2,"pa":0.95,"sa":1.2,"df":50,"sd":80,"rarity":2,"bst":395,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look butterfree-female (juego oficial 500012) */
  {"dex":500020,"name":"Alolan Raticate","types":["dark","normal"],"hp":104,"spd":110,"atk":1.09,"pa":1.09,"sa":0.92,"df":70,"sd":80,"rarity":3,"bst":413,"starter":false,"gen":1,"form":"regional"},   /* regional raticate-alola (juego oficial 500020) */
  {"dex":510025,"name":"Pikachu Belle","types":["electric"],"hp":86,"spd":116,"atk":1,"pa":1,"sa":0.97,"df":40,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look pikachu-belle (juego oficial 510025) */
  {"dex":520025,"name":"Pikachu Cosplay","types":["electric"],"hp":86,"spd":116,"atk":1,"pa":1,"sa":0.97,"df":40,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look pikachu-cosplay (juego oficial 520025) */
  {"dex":530025,"name":"Pikachu (Female)","types":["electric"],"hp":86,"spd":116,"atk":1,"pa":1,"sa":0.97,"df":40,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look pikachu-female (juego oficial 530025) */
  {"dex":560025,"name":"Pikachu Libre","types":["electric"],"hp":86,"spd":116,"atk":1,"pa":1,"sa":0.97,"df":40,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look pikachu-libre (juego oficial 560025) */
  {"dex":590025,"name":"Pikachu Ph.D.","types":["electric"],"hp":86,"spd":116,"atk":1,"pa":1,"sa":0.97,"df":40,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look pikachu-phd (juego oficial 590025) */
  {"dex":600025,"name":"Pikachu Pop Star","types":["electric"],"hp":86,"spd":116,"atk":1,"pa":1,"sa":0.97,"df":40,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look pikachu-pop-star (juego oficial 600025) */
  {"dex":610025,"name":"Pikachu Rock Star","types":["electric"],"hp":86,"spd":116,"atk":1,"pa":1,"sa":0.97,"df":40,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look pikachu-rock-star (juego oficial 610025) */
  {"dex":510026,"name":"Raichu (Female)","types":["electric"],"hp":97,"spd":124,"atk":1.2,"pa":1.2,"sa":1.2,"df":55,"sd":80,"rarity":3,"bst":485,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look raichu-female (juego oficial 510026) */
  {"dex":500044,"name":"Gloom (Female)","types":["grass","poison"],"hp":97,"spd":95,"atk":1.17,"pa":1.06,"sa":1.17,"df":70,"sd":75,"rarity":2,"bst":395,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look gloom-female (juego oficial 500044) */
  {"dex":500045,"name":"Vileplume (Female)","types":["grass","poison"],"hp":104,"spd":99,"atk":1.31,"pa":1.14,"sa":1.31,"df":85,"sd":90,"rarity":3,"bst":490,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look vileplume-female (juego oficial 500045) */
  {"dex":500084,"name":"Doduo (Female)","types":["normal","flying"],"hp":86,"spd":110,"atk":1.17,"pa":1.17,"sa":0.89,"df":45,"sd":35,"rarity":1,"bst":310,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look doduo-female (juego oficial 500084) */
  {"dex":500085,"name":"Dodrio (Female)","types":["normal","flying"],"hp":97,"spd":124,"atk":1.31,"pa":1.31,"sa":1.03,"df":70,"sd":60,"rarity":3,"bst":470,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look dodrio-female (juego oficial 500085) */
  {"dex":500111,"name":"Rhyhorn (Female)","types":["ground","rock"],"hp":106,"spd":88,"atk":1.17,"pa":1.17,"sa":0.86,"df":95,"sd":30,"rarity":2,"bst":345,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look rhyhorn-female (juego oficial 500111) */
  {"dex":500129,"name":"Magikarp (Female)","types":["water"],"hp":79,"spd":112,"atk":0.78,"pa":0.76,"sa":0.78,"df":55,"sd":20,"rarity":1,"bst":200,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look magikarp-female (juego oficial 500129) */
  {"dex":500130,"name":"Gyarados (Female)","types":["water","flying"],"hp":113,"spd":112,"atk":1.39,"pa":1.39,"sa":1.03,"df":79,"sd":100,"rarity":4,"bst":540,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look gyarados-female (juego oficial 500130) */
  {"dex":500133,"name":"Eevee (Female)","types":["normal"],"hp":95,"spd":101,"atk":1,"pa":1,"sa":0.95,"df":50,"sd":65,"rarity":2,"bst":325,"starter":false,"gen":1,"excl":true,"form":"look"},   /* look eevee-female (juego oficial 500133) */
  {"dex":500154,"name":"Meganium (Female)","types":["grass"],"hp":106,"spd":112,"atk":1.16,"pa":1.15,"sa":1.16,"df":100,"sd":100,"rarity":4,"bst":525,"starter":false,"gen":2,"excl":true,"form":"look"},   /* look meganium-female (juego oficial 500154) */
  {"dex":500165,"name":"Ledyba (Female)","types":["bug","flying"],"hp":88,"spd":101,"atk":0.92,"pa":0.81,"sa":0.92,"df":30,"sd":80,"rarity":1,"bst":265,"starter":false,"gen":2,"excl":true,"form":"look"},   /* look ledyba-female (juego oficial 500165) */
  {"dex":500166,"name":"Ledian (Female)","types":["bug","flying"],"hp":95,"spd":114,"atk":1,"pa":0.89,"sa":1,"df":50,"sd":110,"rarity":2,"bst":390,"starter":false,"gen":2,"excl":true,"form":"look"},   /* look ledian-female (juego oficial 500166) */
  {"dex":500194,"name":"Wooper (Female)","types":["water","ground"],"hp":95,"spd":84,"atk":0.95,"pa":0.95,"sa":0.84,"df":45,"sd":25,"rarity":1,"bst":210,"starter":false,"gen":2,"excl":true,"form":"look"},   /* look wooper-female (juego oficial 500194) */
  {"dex":500202,"name":"Wobbuffet (Female)","types":["psychic"],"hp":156,"spd":92,"atk":0.88,"pa":0.88,"sa":0.88,"df":58,"sd":58,"rarity":2,"bst":405,"starter":false,"gen":2,"excl":true,"form":"look"},   /* look wobbuffet-female (juego oficial 500202) */
  {"dex":500203,"name":"Girafarig (Female)","types":["normal","psychic"],"hp":102,"spd":114,"atk":1.2,"pa":1.14,"sa":1.2,"df":65,"sd":65,"rarity":3,"bst":455,"starter":false,"gen":2,"excl":true,"form":"look"},   /* look girafarig-female (juego oficial 500203) */
  {"dex":500208,"name":"Steelix (Female)","types":["steel","ground"],"hp":104,"spd":91,"atk":1.17,"pa":1.17,"sa":1,"df":200,"sd":65,"rarity":4,"bst":510,"starter":false,"gen":2,"excl":true,"form":"look"},   /* look steelix-female (juego oficial 500208) */
  {"dex":500214,"name":"Heracross (Female)","types":["bug","fighting"],"hp":106,"spd":114,"atk":1.39,"pa":1.39,"sa":0.92,"df":75,"sd":95,"rarity":4,"bst":500,"starter":false,"gen":2,"excl":true,"form":"look"},   /* look heracross-female (juego oficial 500214) */
  {"dex":500232,"name":"Donphan (Female)","types":["ground"],"hp":110,"spd":99,"atk":1.36,"pa":1.36,"sa":1.03,"df":120,"sd":60,"rarity":4,"bst":500,"starter":false,"gen":2,"excl":true,"form":"look"},   /* look donphan-female (juego oficial 500232) */
  {"dex":500256,"name":"Combusken (Female)","types":["fire","fighting"],"hp":97,"spd":101,"atk":1.17,"pa":1.17,"sa":1.17,"df":60,"sd":60,"rarity":2,"bst":405,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look combusken-female (juego oficial 500256) */
  {"dex":500257,"name":"Blaziken (Female)","types":["fire","fighting"],"hp":106,"spd":112,"atk":1.36,"pa":1.36,"sa":1.31,"df":70,"sd":70,"rarity":4,"bst":530,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look blaziken-female (juego oficial 500257) */
  {"dex":500267,"name":"Beautifly (Female)","types":["bug","flying"],"hp":97,"spd":105,"atk":1.25,"pa":1.08,"sa":1.25,"df":50,"sd":50,"rarity":2,"bst":395,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look beautifly-female (juego oficial 500267) */
  {"dex":500274,"name":"Nuzleaf (Female)","types":["grass","dark"],"hp":102,"spd":103,"atk":1.08,"pa":1.08,"sa":1.03,"df":40,"sd":40,"rarity":2,"bst":340,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look nuzleaf-female (juego oficial 500274) */
  {"dex":500275,"name":"Shiftry (Female)","types":["grass","dark"],"hp":110,"spd":112,"atk":1.25,"pa":1.25,"sa":1.2,"df":60,"sd":60,"rarity":3,"bst":480,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look shiftry-female (juego oficial 500275) */
  {"dex":500308,"name":"Medicham (Female)","types":["fighting","psychic"],"hp":97,"spd":112,"atk":1.03,"pa":1.03,"sa":1.03,"df":75,"sd":75,"rarity":3,"bst":410,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look medicham-female (juego oficial 500308) */
  {"dex":500316,"name":"Gulpin (Female)","types":["poison"],"hp":102,"spd":95,"atk":0.94,"pa":0.94,"sa":0.94,"df":53,"sd":53,"rarity":1,"bst":302,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look gulpin-female (juego oficial 500316) */
  {"dex":500317,"name":"Swalot (Female)","types":["poison"],"hp":115,"spd":101,"atk":1.1,"pa":1.1,"sa":1.1,"df":83,"sd":83,"rarity":3,"bst":467,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look swalot-female (juego oficial 500317) */
  {"dex":500322,"name":"Numel (Female)","types":["fire","ground"],"hp":97,"spd":93,"atk":1.06,"pa":1.03,"sa":1.06,"df":40,"sd":45,"rarity":1,"bst":305,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look numel-female (juego oficial 500322) */
  {"dex":500332,"name":"Cacturne (Female)","types":["grass","dark"],"hp":102,"spd":101,"atk":1.33,"pa":1.33,"sa":1.33,"df":60,"sd":60,"rarity":3,"bst":475,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look cacturne-female (juego oficial 500332) */
  {"dex":500350,"name":"Milotic (Female)","types":["water"],"hp":113,"spd":112,"atk":1.25,"pa":1.03,"sa":1.25,"df":79,"sd":125,"rarity":4,"bst":540,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look milotic-female (juego oficial 500350) */
  {"dex":500369,"name":"Relicanth (Female)","types":["water","rock"],"hp":115,"spd":101,"atk":1.2,"pa":1.2,"sa":0.95,"df":130,"sd":65,"rarity":3,"bst":485,"starter":false,"gen":3,"excl":true,"form":"look"},   /* look relicanth-female (juego oficial 500369) */
  {"dex":500396,"name":"Starly (Female)","types":["normal","flying"],"hp":88,"spd":103,"atk":1,"pa":1,"sa":0.86,"df":30,"sd":30,"rarity":1,"bst":245,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look starly-female (juego oficial 500396) */
  {"dex":500397,"name":"Staravia (Female)","types":["normal","flying"],"hp":95,"spd":112,"atk":1.11,"pa":1.11,"sa":0.92,"df":50,"sd":40,"rarity":2,"bst":340,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look staravia-female (juego oficial 500397) */
  {"dex":500398,"name":"Staraptor (Female)","types":["normal","flying"],"hp":108,"spd":120,"atk":1.36,"pa":1.36,"sa":0.97,"df":70,"sd":60,"rarity":3,"bst":485,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look staraptor-female (juego oficial 500398) */
  {"dex":500399,"name":"Bidoof (Female)","types":["normal"],"hp":97,"spd":91,"atk":0.95,"pa":0.95,"sa":0.89,"df":40,"sd":40,"rarity":1,"bst":250,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look bidoof-female (juego oficial 500399) */
  {"dex":500400,"name":"Bibarel (Female)","types":["normal","water"],"hp":106,"spd":108,"atk":1.17,"pa":1.17,"sa":1,"df":60,"sd":60,"rarity":3,"bst":410,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look bibarel-female (juego oficial 500400) */
  {"dex":500403,"name":"Shinx (Female)","types":["electric"],"hp":90,"spd":97,"atk":1.06,"pa":1.06,"sa":0.92,"df":34,"sd":34,"rarity":1,"bst":263,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look shinx-female (juego oficial 500403) */
  {"dex":500404,"name":"Luxio (Female)","types":["electric"],"hp":97,"spd":103,"atk":1.17,"pa":1.17,"sa":1.03,"df":49,"sd":49,"rarity":2,"bst":363,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look luxio-female (juego oficial 500404) */
  {"dex":500405,"name":"Luxray (Female)","types":["electric"],"hp":106,"spd":107,"atk":1.36,"pa":1.36,"sa":1.22,"df":79,"sd":79,"rarity":4,"bst":523,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look luxray-female (juego oficial 500405) */
  {"dex":500407,"name":"Roserade (Female)","types":["grass","poison"],"hp":97,"spd":116,"atk":1.39,"pa":1.08,"sa":1.39,"df":65,"sd":105,"rarity":4,"bst":515,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look roserade-female (juego oficial 500407) */
  {"dex":500415,"name":"Combee (Female)","types":["bug","flying"],"hp":84,"spd":107,"atk":0.86,"pa":0.86,"sa":0.86,"df":42,"sd":42,"rarity":1,"bst":244,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look combee-female (juego oficial 500415) */
  {"dex":500417,"name":"Pachirisu (Female)","types":["electric"],"hp":97,"spd":118,"atk":0.95,"pa":0.95,"sa":0.95,"df":70,"sd":90,"rarity":2,"bst":405,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look pachirisu-female (juego oficial 500417) */
  {"dex":500418,"name":"Buizel (Female)","types":["water"],"hp":95,"spd":114,"atk":1.06,"pa":1.06,"sa":1.03,"df":35,"sd":30,"rarity":2,"bst":330,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look buizel-female (juego oficial 500418) */
  {"dex":500419,"name":"Floatzel (Female)","types":["water"],"hp":108,"spd":126,"atk":1.28,"pa":1.28,"sa":1.17,"df":55,"sd":50,"rarity":4,"bst":495,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look floatzel-female (juego oficial 500419) */
  {"dex":500443,"name":"Gible (Female)","types":["dragon","ground"],"hp":96,"spd":96,"atk":1.08,"pa":1.08,"sa":0.92,"df":45,"sd":45,"rarity":1,"bst":300,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look gible-female (juego oficial 500443) */
  {"dex":500444,"name":"Gabite (Female)","types":["dragon","ground"],"hp":101,"spd":112,"atk":1.2,"pa":1.2,"sa":0.97,"df":65,"sd":55,"rarity":3,"bst":410,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look gabite-female (juego oficial 500444) */
  {"dex":500445,"name":"Garchomp (Female)","types":["dragon","ground"],"hp":119,"spd":121,"atk":1.42,"pa":1.42,"sa":1.14,"df":95,"sd":85,"rarity":5,"bst":600,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look garchomp-female (juego oficial 500445) */
  {"dex":500449,"name":"Hippopotas (Female)","types":["ground"],"hp":101,"spd":91,"atk":1.1,"pa":1.1,"sa":0.91,"df":78,"sd":42,"rarity":2,"bst":330,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look hippopotas-female (juego oficial 500449) */
  {"dex":500450,"name":"Hippowdon (Female)","types":["ground"],"hp":119,"spd":98,"atk":1.32,"pa":1.32,"sa":1.07,"df":118,"sd":72,"rarity":4,"bst":525,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look hippowdon-female (juego oficial 500450) */
  {"dex":500453,"name":"Croagunk (Female)","types":["poison","fighting"],"hp":92,"spd":99,"atk":1.04,"pa":1.04,"sa":1.04,"df":40,"sd":40,"rarity":1,"bst":300,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look croagunk-female (juego oficial 500453) */
  {"dex":500457,"name":"Lumineon (Female)","types":["water"],"hp":101,"spd":116,"atk":1.08,"pa":1.08,"sa":1.08,"df":76,"sd":86,"rarity":3,"bst":460,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look lumineon-female (juego oficial 500457) */
  {"dex":500459,"name":"Snover (Female)","types":["grass","ice"],"hp":97,"spd":95,"atk":1.04,"pa":1.04,"sa":1.04,"df":50,"sd":60,"rarity":2,"bst":334,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look snover-female (juego oficial 500459) */
  {"dex":500465,"name":"Tangrowth (Female)","types":["grass"],"hp":115,"spd":99,"atk":1.31,"pa":1.25,"sa":1.31,"df":125,"sd":50,"rarity":4,"bst":535,"starter":false,"gen":4,"excl":true,"form":"look"},   /* look tangrowth-female (juego oficial 500465) */
  {"dex":500493,"name":"Arceus (Bug)","types":["bug"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-bug (juego oficial 500493) */
  {"dex":510493,"name":"Arceus (Dark)","types":["dark"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-dark (juego oficial 510493) */
  {"dex":520493,"name":"Arceus (Dragon)","types":["dragon"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-dragon (juego oficial 520493) */
  {"dex":530493,"name":"Arceus (Electric)","types":["electric"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-electric (juego oficial 530493) */
  {"dex":540493,"name":"Arceus (Fairy)","types":["fairy"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-fairy (juego oficial 540493) */
  {"dex":550493,"name":"Arceus (Fighting)","types":["fighting"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-fighting (juego oficial 550493) */
  {"dex":560493,"name":"Arceus (Fire)","types":["fire"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-fire (juego oficial 560493) */
  {"dex":570493,"name":"Arceus (Flying)","types":["flying"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-flying (juego oficial 570493) */
  {"dex":580493,"name":"Arceus (Ghost)","types":["ghost"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-ghost (juego oficial 580493) */
  {"dex":590493,"name":"Arceus (Grass)","types":["grass"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-grass (juego oficial 590493) */
  {"dex":600493,"name":"Arceus (Ground)","types":["ground"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-ground (juego oficial 600493) */
  {"dex":610493,"name":"Arceus (Ice)","types":["ice"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-ice (juego oficial 610493) */
  {"dex":620493,"name":"Arceus (Poison)","types":["poison"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-poison (juego oficial 620493) */
  {"dex":630493,"name":"Arceus (Psychic)","types":["psychic"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-psychic (juego oficial 630493) */
  {"dex":640493,"name":"Arceus (Rock)","types":["rock"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-rock (juego oficial 640493) */
  {"dex":650493,"name":"Arceus (Steel)","types":["steel"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-steel (juego oficial 650493) */
  {"dex":660493,"name":"Arceus (Water)","types":["water"],"hp":124,"spd":128,"atk":1.36,"pa":1.36,"sa":1.36,"df":120,"sd":120,"rarity":5,"bst":720,"starter":false,"gen":4,"leg":true,"excl":true,"form":"stat"},   /* stat arceus-water (juego oficial 660493) */
  {"dex":500521,"name":"Unfezant (Female)","types":["normal","flying"],"hp":106,"spd":117,"atk":1.33,"pa":1.33,"sa":1.06,"df":80,"sd":55,"rarity":3,"bst":488,"starter":false,"gen":5,"excl":true,"form":"look"},   /* look unfezant-female (juego oficial 500521) */
  {"dex":510555,"name":"Zen Galarian Darmanitan","types":["ice","fire"],"hp":117,"spd":135,"atk":1.58,"pa":1.58,"sa":0.86,"df":55,"sd":55,"rarity":3,"bst":540,"starter":false,"gen":5,"excl":true,"form":"battle"},   /* battle darmanitan-galar-zen (juego oficial 510555) */
  {"dex":500592,"name":"Frillish (Female)","types":["water","ghost"],"hp":95,"spd":95,"atk":1.06,"pa":0.92,"sa":1.06,"df":50,"sd":85,"rarity":2,"bst":335,"starter":false,"gen":5,"excl":true,"form":"look"},   /* look frillish-female (juego oficial 500592) */
  {"dex":500593,"name":"Jellicent (Female)","types":["water","ghost"],"hp":115,"spd":103,"atk":1.17,"pa":1.03,"sa":1.17,"df":70,"sd":105,"rarity":3,"bst":480,"starter":false,"gen":5,"excl":true,"form":"look"},   /* look jellicent-female (juego oficial 500593) */
  {"dex":500618,"name":"Galarian Stunfisk","types":["ground","steel"],"hp":119,"spd":91,"atk":1.15,"pa":1.15,"sa":1.06,"df":99,"sd":84,"rarity":3,"bst":471,"starter":false,"gen":5,"form":"regional"},   /* regional stunfisk-galar (juego oficial 500618) */
  {"dex":500641,"name":"Therian Tornadus","types":["flying"],"hp":106,"spd":129,"atk":1.31,"pa":1.25,"sa":1.31,"df":80,"sd":90,"rarity":5,"bst":580,"starter":false,"gen":5,"leg":true,"excl":true,"form":"stat"},   /* stat tornadus-therian (juego oficial 500641) */
  {"dex":500642,"name":"Therian Thundurus","types":["electric","flying"],"hp":106,"spd":120,"atk":1.5,"pa":1.28,"sa":1.5,"df":70,"sd":80,"rarity":5,"bst":580,"starter":false,"gen":5,"leg":true,"excl":true,"form":"stat"},   /* stat thundurus-therian (juego oficial 500642) */
  {"dex":500647,"name":"Resolute Keldeo","types":["water","fighting"],"hp":111,"spd":123,"atk":1.41,"pa":1.1,"sa":1.41,"df":90,"sd":90,"rarity":5,"bst":580,"starter":false,"gen":5,"leg":true,"excl":true,"form":"look"},   /* look keldeo-resolute (juego oficial 500647) */
  {"dex":500668,"name":"Pyroar (Female)","types":["fire","normal"],"hp":109,"spd":123,"atk":1.3,"pa":1.07,"sa":1.3,"df":72,"sd":66,"rarity":4,"bst":507,"starter":false,"gen":6,"excl":true,"form":"look"},   /* look pyroar-female (juego oficial 500668) */
  {"dex":500676,"name":"Dandy Furfrou","types":["normal"],"hp":104,"spd":121,"atk":1.14,"pa":1.14,"sa":1.06,"df":60,"sd":90,"rarity":3,"bst":472,"starter":false,"gen":6,"excl":true,"form":"look"},   /* look furfrou-dandy (juego oficial 500676) */
  {"dex":510676,"name":"Debutante Furfrou","types":["normal"],"hp":104,"spd":121,"atk":1.14,"pa":1.14,"sa":1.06,"df":60,"sd":90,"rarity":3,"bst":472,"starter":false,"gen":6,"excl":true,"form":"look"},   /* look furfrou-debutante (juego oficial 510676) */
  {"dex":520676,"name":"Diamond Furfrou","types":["normal"],"hp":104,"spd":121,"atk":1.14,"pa":1.14,"sa":1.06,"df":60,"sd":90,"rarity":3,"bst":472,"starter":false,"gen":6,"excl":true,"form":"look"},   /* look furfrou-diamond (juego oficial 520676) */
  {"dex":530676,"name":"Heart Furfrou","types":["normal"],"hp":104,"spd":121,"atk":1.14,"pa":1.14,"sa":1.06,"df":60,"sd":90,"rarity":3,"bst":472,"starter":false,"gen":6,"excl":true,"form":"look"},   /* look furfrou-heart (juego oficial 530676) */
  {"dex":550676,"name":"La Reine Furfrou","types":["normal"],"hp":104,"spd":121,"atk":1.14,"pa":1.14,"sa":1.06,"df":60,"sd":90,"rarity":3,"bst":472,"starter":false,"gen":6,"excl":true,"form":"look"},   /* look furfrou-la-reine (juego oficial 550676) */
  {"dex":560676,"name":"Matron Furfrou","types":["normal"],"hp":104,"spd":121,"atk":1.14,"pa":1.14,"sa":1.06,"df":60,"sd":90,"rarity":3,"bst":472,"starter":false,"gen":6,"excl":true,"form":"look"},   /* look furfrou-matron (juego oficial 560676) */
  {"dex":570676,"name":"Pharaoh Furfrou","types":["normal"],"hp":104,"spd":121,"atk":1.14,"pa":1.14,"sa":1.06,"df":60,"sd":90,"rarity":3,"bst":472,"starter":false,"gen":6,"excl":true,"form":"look"},   /* look furfrou-pharaoh (juego oficial 570676) */
  {"dex":580676,"name":"Star Furfrou","types":["normal"],"hp":104,"spd":121,"atk":1.14,"pa":1.14,"sa":1.06,"df":60,"sd":90,"rarity":3,"bst":472,"starter":false,"gen":6,"excl":true,"form":"look"},   /* look furfrou-star (juego oficial 580676) */
  {"dex":500678,"name":"Meowstic (Female)","types":["psychic"],"hp":103,"spd":122,"atk":1.16,"pa":0.96,"sa":1.16,"df":76,"sd":81,"rarity":3,"bst":466,"starter":false,"gen":6,"excl":true,"form":"look"},   /* look meowstic-female (juego oficial 500678) */
  {"dex":500773,"name":"Silvally (Bug)","types":["bug"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-bug (juego oficial 500773) */
  {"dex":510773,"name":"Silvally (Dark)","types":["dark"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-dark (juego oficial 510773) */
  {"dex":520773,"name":"Silvally (Dragon)","types":["dragon"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-dragon (juego oficial 520773) */
  {"dex":530773,"name":"Silvally (Electric)","types":["electric"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-electric (juego oficial 530773) */
  {"dex":540773,"name":"Silvally (Fairy)","types":["fairy"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-fairy (juego oficial 540773) */
  {"dex":550773,"name":"Silvally (Fighting)","types":["fighting"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-fighting (juego oficial 550773) */
  {"dex":560773,"name":"Silvally (Fire)","types":["fire"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-fire (juego oficial 560773) */
  {"dex":570773,"name":"Silvally (Flying)","types":["flying"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-flying (juego oficial 570773) */
  {"dex":580773,"name":"Silvally (Ghost)","types":["ghost"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-ghost (juego oficial 580773) */
  {"dex":590773,"name":"Silvally (Grass)","types":["grass"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-grass (juego oficial 590773) */
  {"dex":600773,"name":"Silvally (Ground)","types":["ground"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-ground (juego oficial 600773) */
  {"dex":610773,"name":"Silvally (Ice)","types":["ice"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-ice (juego oficial 610773) */
  {"dex":620773,"name":"Silvally (Poison)","types":["poison"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-poison (juego oficial 620773) */
  {"dex":630773,"name":"Silvally (Psychic)","types":["psychic"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-psychic (juego oficial 630773) */
  {"dex":640773,"name":"Silvally (Rock)","types":["rock"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-rock (juego oficial 640773) */
  {"dex":650773,"name":"Silvally (Steel)","types":["steel"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-steel (juego oficial 650773) */
  {"dex":660773,"name":"Silvally (Water)","types":["water"],"hp":113,"spd":118,"atk":1.22,"pa":1.22,"sa":1.22,"df":95,"sd":95,"rarity":5,"bst":570,"starter":false,"gen":7,"leg":true,"excl":true,"form":"stat"},   /* stat silvally-water (juego oficial 660773) */
  {"dex":500800,"name":"Dawn Necrozma","types":["psychic","ghost"],"hp":114,"spd":110,"atk":1.56,"pa":1.32,"sa":1.56,"df":109,"sd":127,"rarity":5,"bst":680,"starter":false,"gen":7,"leg":true,"excl":true,"form":"power"},   /* power necrozma-dawn (juego oficial 500800) */
  {"dex":510800,"name":"Dusk Necrozma","types":["psychic","steel"],"hp":114,"spd":110,"atk":1.56,"pa":1.56,"sa":1.32,"df":127,"sd":109,"rarity":5,"bst":680,"starter":false,"gen":7,"leg":true,"excl":true,"form":"power"},   /* power necrozma-dusk (juego oficial 510800) */
  {"dex":500845,"name":"Gorging Cramorant","types":["flying","water"],"hp":102,"spd":114,"atk":1.17,"pa":1.17,"sa":1.17,"df":55,"sd":95,"rarity":3,"bst":475,"starter":false,"gen":8,"excl":true,"form":"battle"},   /* battle cramorant-gorging (juego oficial 500845) */
  {"dex":510845,"name":"Gulping Cramorant","types":["flying","water"],"hp":102,"spd":114,"atk":1.17,"pa":1.17,"sa":1.17,"df":55,"sd":95,"rarity":3,"bst":475,"starter":false,"gen":8,"excl":true,"form":"battle"},   /* battle cramorant-gulping (juego oficial 510845) */
  {"dex":500869,"name":"Alcremie Caramel Swirl Berry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-caramel-swirl-berry-sweet (juego oficial 500869) */
  {"dex":510869,"name":"Alcremie Caramel Swirl Clover","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-caramel-swirl-clover-sweet (juego oficial 510869) */
  {"dex":520869,"name":"Alcremie Caramel Swirl Flower","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-caramel-swirl-flower-sweet (juego oficial 520869) */
  {"dex":530869,"name":"Alcremie Caramel Swirl Love","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-caramel-swirl-love-sweet (juego oficial 530869) */
  {"dex":540869,"name":"Alcremie Caramel Swirl Ribbon","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-caramel-swirl-ribbon-sweet (juego oficial 540869) */
  {"dex":550869,"name":"Alcremie Caramel Swirl Star","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-caramel-swirl-star-sweet (juego oficial 550869) */
  {"dex":560869,"name":"Alcremie Caramel Swirl Strawberry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-caramel-swirl-strawberry-sweet (juego oficial 560869) */
  {"dex":570869,"name":"Alcremie Lemon Cream Berry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-lemon-cream-berry-sweet (juego oficial 570869) */
  {"dex":580869,"name":"Alcremie Lemon Cream Clover","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-lemon-cream-clover-sweet (juego oficial 580869) */
  {"dex":590869,"name":"Alcremie Lemon Cream Flower","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-lemon-cream-flower-sweet (juego oficial 590869) */
  {"dex":600869,"name":"Alcremie Lemon Cream Love","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-lemon-cream-love-sweet (juego oficial 600869) */
  {"dex":610869,"name":"Alcremie Lemon Cream Ribbon","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-lemon-cream-ribbon-sweet (juego oficial 610869) */
  {"dex":620869,"name":"Alcremie Lemon Cream Star","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-lemon-cream-star-sweet (juego oficial 620869) */
  {"dex":630869,"name":"Alcremie Lemon Cream Strawberry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-lemon-cream-strawberry-sweet (juego oficial 630869) */
  {"dex":640869,"name":"Alcremie Matcha Cream Berry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-matcha-cream-berry-sweet (juego oficial 640869) */
  {"dex":650869,"name":"Alcremie Matcha Cream Clover","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-matcha-cream-clover-sweet (juego oficial 650869) */
  {"dex":660869,"name":"Alcremie Matcha Cream Flower","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-matcha-cream-flower-sweet (juego oficial 660869) */
  {"dex":670869,"name":"Alcremie Matcha Cream Love","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-matcha-cream-love-sweet (juego oficial 670869) */
  {"dex":680869,"name":"Alcremie Matcha Cream Ribbon","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-matcha-cream-ribbon-sweet (juego oficial 680869) */
  {"dex":690869,"name":"Alcremie Matcha Cream Star","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-matcha-cream-star-sweet (juego oficial 690869) */
  {"dex":700869,"name":"Alcremie Matcha Cream Strawberry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-matcha-cream-strawberry-sweet (juego oficial 700869) */
  {"dex":710869,"name":"Alcremie Mint Cream Berry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-mint-cream-berry-sweet (juego oficial 710869) */
  {"dex":720869,"name":"Alcremie Mint Cream Clover","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-mint-cream-clover-sweet (juego oficial 720869) */
  {"dex":730869,"name":"Alcremie Mint Cream Flower","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-mint-cream-flower-sweet (juego oficial 730869) */
  {"dex":740869,"name":"Alcremie Mint Cream Love","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-mint-cream-love-sweet (juego oficial 740869) */
  {"dex":750869,"name":"Alcremie Mint Cream Ribbon","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-mint-cream-ribbon-sweet (juego oficial 750869) */
  {"dex":760869,"name":"Alcremie Mint Cream Star","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-mint-cream-star-sweet (juego oficial 760869) */
  {"dex":770869,"name":"Alcremie Mint Cream Strawberry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-mint-cream-strawberry-sweet (juego oficial 770869) */
  {"dex":780869,"name":"Alcremie Rainbow Swirl Berry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-rainbow-swirl-berry-sweet (juego oficial 780869) */
  {"dex":790869,"name":"Alcremie Rainbow Swirl Clover","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-rainbow-swirl-clover-sweet (juego oficial 790869) */
  {"dex":800869,"name":"Alcremie Rainbow Swirl Flower","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-rainbow-swirl-flower-sweet (juego oficial 800869) */
  {"dex":810869,"name":"Alcremie Rainbow Swirl Love","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-rainbow-swirl-love-sweet (juego oficial 810869) */
  {"dex":820869,"name":"Alcremie Rainbow Swirl Ribbon","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-rainbow-swirl-ribbon-sweet (juego oficial 820869) */
  {"dex":830869,"name":"Alcremie Rainbow Swirl Star","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-rainbow-swirl-star-sweet (juego oficial 830869) */
  {"dex":840869,"name":"Alcremie Rainbow Swirl Strawberry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-rainbow-swirl-strawberry-sweet (juego oficial 840869) */
  {"dex":850869,"name":"Alcremie Ruby Cream Berry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-cream-berry-sweet (juego oficial 850869) */
  {"dex":860869,"name":"Alcremie Ruby Cream Clover","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-cream-clover-sweet (juego oficial 860869) */
  {"dex":870869,"name":"Alcremie Ruby Cream Flower","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-cream-flower-sweet (juego oficial 870869) */
  {"dex":880869,"name":"Alcremie Ruby Cream Love","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-cream-love-sweet (juego oficial 880869) */
  {"dex":890869,"name":"Alcremie Ruby Cream Ribbon","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-cream-ribbon-sweet (juego oficial 890869) */
  {"dex":900869,"name":"Alcremie Ruby Cream Star","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-cream-star-sweet (juego oficial 900869) */
  {"dex":910869,"name":"Alcremie Ruby Cream Strawberry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-cream-strawberry-sweet (juego oficial 910869) */
  {"dex":920869,"name":"Alcremie Ruby Swirl Berry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-swirl-berry-sweet (juego oficial 920869) */
  {"dex":930869,"name":"Alcremie Ruby Swirl Clover","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-swirl-clover-sweet (juego oficial 930869) */
  {"dex":940869,"name":"Alcremie Ruby Swirl Flower","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-swirl-flower-sweet (juego oficial 940869) */
  {"dex":950869,"name":"Alcremie Ruby Swirl Love","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-swirl-love-sweet (juego oficial 950869) */
  {"dex":960869,"name":"Alcremie Ruby Swirl Ribbon","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-swirl-ribbon-sweet (juego oficial 960869) */
  {"dex":970869,"name":"Alcremie Ruby Swirl Star","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-swirl-star-sweet (juego oficial 970869) */
  {"dex":980869,"name":"Alcremie Ruby Swirl Strawberry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-ruby-swirl-strawberry-sweet (juego oficial 980869) */
  {"dex":990869,"name":"Alcremie Salted Cream Berry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-salted-cream-berry-sweet (juego oficial 990869) */
  {"dex":1000869,"name":"Alcremie Salted Cream Clover","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-salted-cream-clover-sweet (juego oficial 1000869) */
  {"dex":1010869,"name":"Alcremie Salted Cream Flower","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-salted-cream-flower-sweet (juego oficial 1010869) */
  {"dex":1020869,"name":"Alcremie Salted Cream Love","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-salted-cream-love-sweet (juego oficial 1020869) */
  {"dex":1030869,"name":"Alcremie Salted Cream Ribbon","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-salted-cream-ribbon-sweet (juego oficial 1030869) */
  {"dex":1040869,"name":"Alcremie Salted Cream Star","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-salted-cream-star-sweet (juego oficial 1040869) */
  {"dex":1050869,"name":"Alcremie Salted Cream Strawberry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-salted-cream-strawberry-sweet (juego oficial 1050869) */
  {"dex":1060869,"name":"Alcremie Vanilla Cream Berry","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-vanilla-cream-berry-sweet (juego oficial 1060869) */
  {"dex":1070869,"name":"Alcremie Vanilla Cream Clover","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-vanilla-cream-clover-sweet (juego oficial 1070869) */
  {"dex":1080869,"name":"Alcremie Vanilla Cream Flower","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-vanilla-cream-flower-sweet (juego oficial 1080869) */
  {"dex":1090869,"name":"Alcremie Vanilla Cream Love","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-vanilla-cream-love-sweet (juego oficial 1090869) */
  {"dex":1100869,"name":"Alcremie Vanilla Cream Ribbon","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-vanilla-cream-ribbon-sweet (juego oficial 1100869) */
  {"dex":1110869,"name":"Alcremie Vanilla Cream Star","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look alcremie-vanilla-cream-star-sweet (juego oficial 1110869) */
  {"dex":500876,"name":"Indeedee (Female)","types":["psychic","normal"],"hp":102,"spd":114,"atk":1.22,"pa":1,"sa":1.22,"df":65,"sd":105,"rarity":3,"bst":475,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look indeedee-female (juego oficial 500876) */
  {"dex":500877,"name":"Hangry Morpeko","types":["electric","dark"],"hp":96,"spd":119,"atk":1.22,"pa":1.22,"sa":1.08,"df":58,"sd":58,"rarity":3,"bst":436,"starter":false,"gen":8,"excl":true,"form":"battle"},   /* battle morpeko-hangry (juego oficial 500877) */
  {"dex":500898,"name":"Ice Calyrex","types":["psychic","ice"],"hp":115,"spd":99,"atk":1.61,"pa":1.61,"sa":1.17,"df":150,"sd":130,"rarity":5,"bst":680,"starter":false,"gen":8,"leg":true,"excl":true,"form":"power"},   /* power calyrex-ice (juego oficial 500898) */
  {"dex":510898,"name":"Shadow Calyrex","types":["psychic","ghost"],"hp":115,"spd":141,"atk":1.61,"pa":1.17,"sa":1.61,"df":80,"sd":100,"rarity":5,"bst":680,"starter":false,"gen":8,"leg":true,"excl":true,"form":"power"},   /* power calyrex-shadow (juego oficial 510898) */
  {"dex":500902,"name":"Basculegion (Female)","types":["water","ghost"],"hp":124,"spd":111,"atk":1.25,"pa":1.21,"sa":1.25,"df":65,"sd":75,"rarity":4,"bst":530,"starter":false,"gen":8,"excl":true,"form":"look"},   /* look basculegion-female (juego oficial 500902) */
  {"dex":500916,"name":"Oinkologne (Female)","types":["normal"],"hp":122,"spd":105,"atk":1.2,"pa":1.2,"sa":1.02,"df":70,"sd":90,"rarity":3,"bst":489,"starter":false,"gen":9,"excl":true,"form":"look"},   /* look oinkologne-female (juego oficial 500916) */
  {"dex":500931,"name":"Blue Plumage Squawkabilly","types":["normal","flying"],"hp":107,"spd":117,"atk":1.23,"pa":1.23,"sa":0.95,"df":51,"sd":51,"rarity":3,"bst":417,"starter":false,"gen":9,"excl":true,"form":"look"},   /* look squawkabilly-blue-plumage (juego oficial 500931) */
  {"dex":510931,"name":"White Plumage Squawkabilly","types":["normal","flying"],"hp":107,"spd":117,"atk":1.23,"pa":1.23,"sa":0.95,"df":51,"sd":51,"rarity":3,"bst":417,"starter":false,"gen":9,"excl":true,"form":"look"},   /* look squawkabilly-white-plumage (juego oficial 510931) */
  {"dex":520931,"name":"Yellow Plumage Squawkabilly","types":["normal","flying"],"hp":107,"spd":117,"atk":1.23,"pa":1.23,"sa":0.95,"df":51,"sd":51,"rarity":3,"bst":417,"starter":false,"gen":9,"excl":true,"form":"look"},   /* look squawkabilly-yellow-plumage (juego oficial 520931) */
  {"dex":500982,"name":"Three-Segment Form Dudunsparce","types":["normal"],"hp":126,"spd":101,"atk":1.25,"pa":1.25,"sa":1.17,"df":80,"sd":75,"rarity":4,"bst":520,"starter":false,"gen":9,"excl":true,"form":"look"},   /* look dudunsparce-three-segment (juego oficial 500982) */
  {"dex":500999,"name":"Roaming Form Gimmighoul","types":["ghost"],"hp":90,"spd":112,"atk":1.11,"pa":0.86,"sa":1.11,"df":25,"sd":45,"rarity":1,"bst":300,"starter":false,"gen":9,"excl":true,"form":"look"},   /* look gimmighoul-roaming (juego oficial 500999) */
  {"dex":501008,"name":"Low-Power Mode","types":["electric","dragon"],"hp":115,"spd":135,"atk":1.44,"pa":1.17,"sa":1.44,"df":100,"sd":115,"rarity":5,"bst":670,"starter":false,"gen":9,"leg":true,"excl":true,"form":"look"},   /* look miraidon-low-power-mode (juego oficial 501008) */
  {"dex":501024,"name":"Stellar Form Terapagos","types":["normal"],"hp":142,"spd":114,"atk":1.42,"pa":1.28,"sa":1.42,"df":110,"sd":110,"rarity":5,"bst":700,"starter":false,"gen":9,"leg":true,"excl":true,"form":"battle"},   /* battle terapagos-stellar (juego oficial 501024) */
  {"dex":100003,"name":"Mega Venusaur","types":["grass","poison"],"hp":106,"spd":112,"atk":1.37,"pa":1.25,"sa":1.37,"df":123,"sd":120,"rarity":4,"bst":525,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega venusaur-mega (juego oficial 100003) */
  {"dex":100009,"name":"Mega Blastoise","types":["water"],"hp":106,"spd":111,"atk":1.44,"pa":1.27,"sa":1.44,"df":120,"sd":115,"rarity":4,"bst":530,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega blastoise-mega (juego oficial 100009) */
  {"dex":100015,"name":"Mega Beedrill","types":["bug","poison"],"hp":99,"spd":139,"atk":1.52,"pa":1.52,"sa":0.78,"df":40,"sd":80,"rarity":2,"bst":395,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega beedrill-mega (juego oficial 100015) */
  {"dex":100018,"name":"Mega Pidgeot","types":["normal","flying"],"hp":107,"spd":129,"atk":1.44,"pa":1.14,"sa":1.44,"df":80,"sd":80,"rarity":3,"bst":479,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega pidgeot-mega (juego oficial 100018) */
  {"dex":100036,"name":"Mega Clefable","types":["fairy","flying"],"hp":113,"spd":107,"atk":1.44,"pa":1.14,"sa":1.44,"df":93,"sd":110,"rarity":3,"bst":483,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega clefable-mega (juego oficial 100036) */
  {"dex":100071,"name":"Mega Victreebel","types":["grass","poison"],"hp":106,"spd":107,"atk":1.44,"pa":1.39,"sa":1.44,"df":85,"sd":95,"rarity":3,"bst":490,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega victreebel-mega (juego oficial 100071) */
  {"dex":100121,"name":"Mega Starmie","types":["water","psychic"],"hp":97,"spd":128,"atk":1.42,"pa":1.25,"sa":1.42,"df":105,"sd":105,"rarity":4,"bst":520,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega starmie-mega (juego oficial 100121) */
  {"dex":100127,"name":"Mega Pinsir","types":["bug","flying"],"hp":99,"spd":122,"atk":1.55,"pa":1.55,"sa":1.06,"df":120,"sd":90,"rarity":4,"bst":500,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega pinsir-mega (juego oficial 100127) */
  {"dex":100130,"name":"Mega Gyarados","types":["water","dark"],"hp":113,"spd":112,"atk":1.55,"pa":1.55,"sa":1.08,"df":109,"sd":130,"rarity":4,"bst":540,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega gyarados-mega (juego oficial 100130) */
  {"dex":100149,"name":"Mega Dragonite","types":["dragon","flying"],"hp":111,"spd":120,"atk":1.5,"pa":1.38,"sa":1.5,"df":115,"sd":125,"rarity":5,"bst":600,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega dragonite-mega (juego oficial 100149) */
  {"dex":100150,"name":"Mega Mewtwo X","types":["psychic","fighting"],"hp":118,"spd":133,"atk":1.74,"pa":1.74,"sa":1.55,"df":100,"sd":100,"rarity":5,"bst":680,"starter":false,"gen":1,"leg":true,"excl":true,"form":"mega"},   /* mega mewtwo-mega-x (juego oficial 100150) */
  {"dex":100154,"name":"Mega Meganium","types":["grass","fairy"],"hp":106,"spd":112,"atk":1.49,"pa":1.21,"sa":1.49,"df":115,"sd":115,"rarity":4,"bst":525,"starter":false,"gen":2,"excl":true,"form":"mega"},   /* mega meganium-mega (juego oficial 100154) */
  {"dex":100160,"name":"Mega Feraligatr","types":["water","dragon"],"hp":108,"spd":111,"atk":1.58,"pa":1.58,"sa":1.19,"df":125,"sd":93,"rarity":4,"bst":530,"starter":false,"gen":2,"excl":true,"form":"mega"},   /* mega feraligatr-mega (juego oficial 100160) */
  {"dex":100181,"name":"Mega Ampharos","types":["electric","dragon"],"hp":110,"spd":97,"atk":1.61,"pa":1.22,"sa":1.61,"df":105,"sd":110,"rarity":4,"bst":510,"starter":false,"gen":2,"excl":true,"form":"mega"},   /* mega ampharos-mega (juego oficial 100181) */
  {"dex":100212,"name":"Mega Scizor","types":["bug","steel"],"hp":102,"spd":110,"atk":1.52,"pa":1.52,"sa":1.06,"df":140,"sd":100,"rarity":4,"bst":500,"starter":false,"gen":2,"excl":true,"form":"mega"},   /* mega scizor-mega (juego oficial 100212) */
  {"dex":100214,"name":"Mega Heracross","types":["bug","fighting"],"hp":106,"spd":110,"atk":1.72,"pa":1.72,"sa":0.92,"df":115,"sd":105,"rarity":4,"bst":500,"starter":false,"gen":2,"excl":true,"form":"mega"},   /* mega heracross-mega (juego oficial 100214) */
  {"dex":100257,"name":"Mega Blaziken","types":["fire","fighting"],"hp":106,"spd":120,"atk":1.58,"pa":1.58,"sa":1.42,"df":80,"sd":80,"rarity":4,"bst":530,"starter":false,"gen":3,"excl":true,"form":"mega"},   /* mega blaziken-mega (juego oficial 100257) */
  {"dex":100260,"name":"Mega Swampert","types":["water","ground"],"hp":115,"spd":107,"atk":1.52,"pa":1.52,"sa":1.22,"df":110,"sd":110,"rarity":4,"bst":535,"starter":false,"gen":3,"excl":true,"form":"mega"},   /* mega swampert-mega (juego oficial 100260) */
  {"dex":100306,"name":"Mega Aggron","types":["steel"],"hp":102,"spd":99,"atk":1.47,"pa":1.47,"sa":1.03,"df":230,"sd":80,"rarity":4,"bst":530,"starter":false,"gen":3,"excl":true,"form":"mega"},   /* mega aggron-mega (juego oficial 100306) */
  {"dex":100373,"name":"Mega Salamence","types":["dragon","flying"],"hp":113,"spd":128,"atk":1.5,"pa":1.5,"sa":1.36,"df":130,"sd":90,"rarity":5,"bst":600,"starter":false,"gen":3,"excl":true,"form":"mega"},   /* mega salamence-mega (juego oficial 100373) */
  {"dex":100376,"name":"Mega Metagross","types":["steel","psychic"],"hp":106,"spd":124,"atk":1.5,"pa":1.5,"sa":1.28,"df":150,"sd":110,"rarity":5,"bst":600,"starter":false,"gen":3,"excl":true,"form":"mega"},   /* mega metagross-mega (juego oficial 100376) */
  {"dex":100398,"name":"Mega Staraptor","types":["fighting","flying"],"hp":108,"spd":124,"atk":1.47,"pa":1.47,"sa":1.03,"df":100,"sd":90,"rarity":3,"bst":485,"starter":false,"gen":4,"excl":true,"form":"mega"},   /* mega staraptor-mega (juego oficial 100398) */
  {"dex":100445,"name":"Mega Garchomp","types":["dragon","ground"],"hp":119,"spd":117,"atk":1.64,"pa":1.64,"sa":1.36,"df":115,"sd":95,"rarity":5,"bst":600,"starter":false,"gen":4,"excl":true,"form":"mega"},   /* mega garchomp-mega (juego oficial 100445) */
  {"dex":100460,"name":"Mega Abomasnow","types":["grass","ice"],"hp":110,"spd":91,"atk":1.43,"pa":1.43,"sa":1.43,"df":105,"sd":105,"rarity":3,"bst":494,"starter":false,"gen":4,"excl":true,"form":"mega"},   /* mega abomasnow-mega (juego oficial 100460) */
  {"dex":100478,"name":"Mega Froslass","types":["ice","ghost"],"hp":102,"spd":128,"atk":1.47,"pa":1.14,"sa":1.47,"df":70,"sd":100,"rarity":3,"bst":480,"starter":false,"gen":4,"excl":true,"form":"mega"},   /* mega froslass-mega (juego oficial 100478) */
  {"dex":100485,"name":"Mega Heatran","types":["fire","steel"],"hp":111,"spd":106,"atk":1.66,"pa":1.36,"sa":1.66,"df":106,"sd":141,"rarity":5,"bst":600,"starter":false,"gen":4,"leg":true,"excl":true,"form":"mega"},   /* mega heatran-mega (juego oficial 100485) */
  {"dex":100500,"name":"Mega Emboar","types":["fire","fighting"],"hp":120,"spd":110,"atk":1.51,"pa":1.51,"sa":1.31,"df":75,"sd":110,"rarity":4,"bst":528,"starter":false,"gen":5,"excl":true,"form":"mega"},   /* mega emboar-mega (juego oficial 100500) */
  {"dex":100531,"name":"Mega Audino","types":["normal","fairy"],"hp":116,"spd":99,"atk":1.14,"pa":1.03,"sa":1.14,"df":126,"sd":126,"rarity":3,"bst":445,"starter":false,"gen":5,"excl":true,"form":"mega"},   /* mega audino-mega (juego oficial 100531) */
  {"dex":100545,"name":"Mega Scolipede","types":["bug","poison"],"hp":97,"spd":104,"atk":1.47,"pa":1.47,"sa":1.11,"df":149,"sd":99,"rarity":3,"bst":485,"starter":false,"gen":5,"excl":true,"form":"mega"},   /* mega scolipede-mega (juego oficial 100545) */
  {"dex":100609,"name":"Mega Chandelure","types":["ghost","fire"],"hp":97,"spd":116,"atk":1.66,"pa":1.11,"sa":1.66,"df":110,"sd":110,"rarity":4,"bst":520,"starter":false,"gen":5,"excl":true,"form":"mega"},   /* mega chandelure-mega (juego oficial 100609) */
  {"dex":100623,"name":"Mega Golurk","types":["ground","ghost"],"hp":110,"spd":101,"atk":1.57,"pa":1.57,"sa":1.08,"df":105,"sd":105,"rarity":3,"bst":483,"starter":false,"gen":5,"excl":true,"form":"mega"},   /* mega golurk-mega (juego oficial 100623) */
  {"dex":100652,"name":"Mega Chesnaught","types":["grass","fighting"],"hp":110,"spd":96,"atk":1.45,"pa":1.45,"sa":1.11,"df":172,"sd":115,"rarity":4,"bst":530,"starter":false,"gen":6,"excl":true,"form":"mega"},   /* mega chesnaught-mega (juego oficial 100652) */
  {"dex":100655,"name":"Mega Delphox","types":["fire","psychic"],"hp":104,"spd":134,"atk":1.57,"pa":1.08,"sa":1.57,"df":72,"sd":125,"rarity":4,"bst":534,"starter":false,"gen":6,"excl":true,"form":"mega"},   /* mega delphox-mega (juego oficial 100655) */
  {"dex":100658,"name":"Mega Greninja","types":["water","dark"],"hp":102,"spd":138,"atk":1.43,"pa":1.39,"sa":1.43,"df":77,"sd":81,"rarity":4,"bst":530,"starter":false,"gen":6,"excl":true,"form":"mega"},   /* mega greninja-mega (juego oficial 100658) */
  {"dex":100678,"name":"Mega Meowstic","types":["psychic"],"hp":103,"spd":130,"atk":1.49,"pa":0.96,"sa":1.49,"df":76,"sd":101,"rarity":3,"bst":466,"starter":false,"gen":6,"excl":true,"form":"mega"},   /* mega meowstic-male-mega (juego oficial 100678) */
  {"dex":100687,"name":"Mega Malamar","types":["dark","psychic"],"hp":109,"spd":115,"atk":1.26,"pa":1.26,"sa":1.24,"df":88,"sd":120,"rarity":3,"bst":482,"starter":false,"gen":6,"excl":true,"form":"mega"},   /* mega malamar-mega (juego oficial 100687) */
  {"dex":100689,"name":"Mega Barbaracle","types":["rock","fighting"],"hp":102,"spd":115,"atk":1.47,"pa":1.47,"sa":1.05,"df":130,"sd":106,"rarity":4,"bst":500,"starter":false,"gen":6,"excl":true,"form":"mega"},   /* mega barbaracle-mega (juego oficial 100689) */
  {"dex":100740,"name":"Mega Crabominable","types":["fighting","ice"],"hp":114,"spd":92,"atk":1.56,"pa":1.56,"sa":1.04,"df":122,"sd":107,"rarity":3,"bst":478,"starter":false,"gen":7,"excl":true,"form":"mega"},   /* mega crabominable-mega (juego oficial 100740) */
  {"dex":100952,"name":"Mega Scovillain","types":["grass","fire"],"hp":99,"spd":110,"atk":1.46,"pa":1.46,"sa":1.46,"df":85,"sd":85,"rarity":3,"bst":486,"starter":false,"gen":9,"excl":true,"form":"mega"},   /* mega scovillain-mega (juego oficial 100952) */
  {"dex":100970,"name":"Mega Glimmora","types":["rock","poison"],"hp":107,"spd":120,"atk":1.52,"pa":1.2,"sa":1.52,"df":105,"sd":96,"rarity":4,"bst":525,"starter":false,"gen":9,"excl":true,"form":"mega"},   /* mega glimmora-mega (juego oficial 100970) */
  {"dex":100998,"name":"Mega Baxcalibur","types":["dragon","ice"],"hp":122,"spd":115,"atk":1.66,"pa":1.66,"sa":1.28,"df":117,"sd":101,"rarity":5,"bst":600,"starter":false,"gen":9,"excl":true,"form":"mega"},   /* mega baxcalibur-mega (juego oficial 100998) */
  {"dex":300006,"name":"Mega Charizard Y","types":["fire","flying"],"hp":105,"spd":120,"atk":1.57,"pa":1.27,"sa":1.57,"df":78,"sd":115,"rarity":4,"bst":534,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega charizard-mega-y (juego oficial 300006) */
  {"dex":300026,"name":"Mega Raichu X","types":["electric"],"hp":97,"spd":124,"atk":1.44,"pa":1.44,"sa":1.2,"df":95,"sd":95,"rarity":3,"bst":485,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega raichu-mega-x (juego oficial 300026) */
  {"dex":400026,"name":"Mega Raichu Y","types":["electric"],"hp":97,"spd":133,"atk":1.58,"pa":1.25,"sa":1.58,"df":55,"sd":80,"rarity":3,"bst":485,"starter":false,"gen":1,"excl":true,"form":"mega"},   /* mega raichu-mega-y (juego oficial 400026) */
  {"dex":300359,"name":"Mega Absol Z","types":["dark","ghost"],"hp":99,"spd":141,"atk":1.55,"pa":1.55,"sa":1.11,"df":60,"sd":60,"rarity":3,"bst":465,"starter":false,"gen":3,"excl":true,"form":"mega"},   /* mega absol-mega-z (juego oficial 300359) */
  {"dex":300445,"name":"Mega Garchomp Z","types":["dragon"],"hp":119,"spd":141,"atk":1.48,"pa":1.42,"sa":1.48,"df":85,"sd":85,"rarity":5,"bst":600,"starter":false,"gen":4,"excl":true,"form":"mega"},   /* mega garchomp-mega-z (juego oficial 300445) */
  {"dex":300448,"name":"Mega Lucario Z","types":["fighting","steel"],"hp":102,"spd":141,"atk":1.6,"pa":1.25,"sa":1.6,"df":70,"sd":70,"rarity":4,"bst":525,"starter":false,"gen":4,"excl":true,"form":"mega"},   /* mega lucario-mega-z (juego oficial 300448) */
  {"dex":300658,"name":"Ash-Greninja","types":["water","dark"],"hp":102,"spd":133,"atk":1.54,"pa":1.5,"sa":1.54,"df":67,"sd":71,"rarity":4,"bst":530,"starter":false,"gen":6,"excl":true,"form":"power"},   /* power greninja-ash (juego oficial 300658) */
  {"dex":150003,"name":"Gigantamax Venusaur","types":["grass","poison"],"hp":106,"spd":112,"atk":1.25,"pa":1.15,"sa":1.25,"df":83,"sd":100,"rarity":4,"bst":525,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax venusaur-gmax (juego oficial 150003) */
  {"dex":150006,"name":"Gigantamax Charizard","types":["fire","flying"],"hp":105,"spd":120,"atk":1.3,"pa":1.16,"sa":1.3,"df":78,"sd":85,"rarity":4,"bst":534,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax charizard-gmax (juego oficial 150006) */
  {"dex":150009,"name":"Gigantamax Blastoise","types":["water"],"hp":106,"spd":111,"atk":1.17,"pa":1.16,"sa":1.17,"df":100,"sd":105,"rarity":4,"bst":530,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax blastoise-gmax (juego oficial 150009) */
  {"dex":150012,"name":"Gigantamax Butterfree","types":["bug","flying"],"hp":97,"spd":107,"atk":1.2,"pa":0.95,"sa":1.2,"df":50,"sd":80,"rarity":2,"bst":395,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax butterfree-gmax (juego oficial 150012) */
  {"dex":150025,"name":"Gigantamax Pikachu","types":["electric"],"hp":86,"spd":116,"atk":1,"pa":1,"sa":0.97,"df":40,"sd":50,"rarity":2,"bst":320,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax pikachu-gmax (juego oficial 150025) */
  {"dex":150052,"name":"Gigantamax Meowth","types":["normal"],"hp":88,"spd":116,"atk":0.95,"pa":0.95,"sa":0.92,"df":35,"sd":40,"rarity":1,"bst":290,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax meowth-gmax (juego oficial 150052) */
  {"dex":150068,"name":"Gigantamax Machamp","types":["fighting"],"hp":110,"spd":101,"atk":1.42,"pa":1.42,"sa":1.06,"df":80,"sd":85,"rarity":4,"bst":505,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax machamp-gmax (juego oficial 150068) */
  {"dex":150094,"name":"Gigantamax Gengar","types":["ghost","poison"],"hp":97,"spd":124,"atk":1.42,"pa":1.06,"sa":1.42,"df":60,"sd":75,"rarity":4,"bst":500,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax gengar-gmax (juego oficial 150094) */
  {"dex":150099,"name":"Gigantamax Kingler","types":["water"],"hp":95,"spd":110,"atk":1.42,"pa":1.42,"sa":0.97,"df":115,"sd":50,"rarity":3,"bst":475,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax kingler-gmax (juego oficial 150099) */
  {"dex":150131,"name":"Gigantamax Lapras","types":["water","ice"],"hp":128,"spd":103,"atk":1.17,"pa":1.17,"sa":1.17,"df":80,"sd":95,"rarity":4,"bst":535,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax lapras-gmax (juego oficial 150131) */
  {"dex":150133,"name":"Gigantamax Eevee","types":["normal"],"hp":95,"spd":101,"atk":1,"pa":1,"sa":0.95,"df":50,"sd":65,"rarity":2,"bst":325,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax eevee-gmax (juego oficial 150133) */
  {"dex":150143,"name":"Gigantamax Snorlax","types":["normal"],"hp":142,"spd":91,"atk":1.31,"pa":1.31,"sa":1.06,"df":65,"sd":110,"rarity":4,"bst":540,"starter":false,"gen":1,"excl":true,"form":"gmax"},   /* gmax snorlax-gmax (juego oficial 150143) */
  {"dex":150569,"name":"Gigantamax Garbodor","types":["poison"],"hp":106,"spd":110,"atk":1.22,"pa":1.22,"sa":1.03,"df":82,"sd":82,"rarity":3,"bst":474,"starter":false,"gen":5,"excl":true,"form":"gmax"},   /* gmax garbodor-gmax (juego oficial 150569) */
  {"dex":150809,"name":"Gigantamax Melmetal","types":["steel"],"hp":131,"spd":92,"atk":1.49,"pa":1.49,"sa":1.14,"df":143,"sd":65,"rarity":5,"bst":600,"starter":false,"gen":7,"leg":true,"excl":true,"form":"gmax"},   /* gmax melmetal-gmax (juego oficial 150809) */
  {"dex":150812,"name":"Gigantamax Rillaboom","types":["grass"],"hp":115,"spd":114,"atk":1.39,"pa":1.39,"sa":1.03,"df":90,"sd":70,"rarity":4,"bst":530,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax rillaboom-gmax (juego oficial 150812) */
  {"dex":150815,"name":"Gigantamax Cinderace","types":["fire"],"hp":106,"spd":128,"atk":1.34,"pa":1.34,"sa":1.06,"df":75,"sd":75,"rarity":4,"bst":530,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax cinderace-gmax (juego oficial 150815) */
  {"dex":150818,"name":"Gigantamax Inteleon","types":["water"],"hp":102,"spd":128,"atk":1.39,"pa":1.17,"sa":1.39,"df":65,"sd":65,"rarity":4,"bst":530,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax inteleon-gmax (juego oficial 150818) */
  {"dex":150823,"name":"Gigantamax Corviknight","types":["flying","steel"],"hp":114,"spd":106,"atk":1.18,"pa":1.18,"sa":0.99,"df":105,"sd":85,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax corviknight-gmax (juego oficial 150823) */
  {"dex":150826,"name":"Gigantamax Orbeetle","types":["bug","psychic"],"hp":97,"spd":116,"atk":1.14,"pa":0.95,"sa":1.14,"df":110,"sd":120,"rarity":4,"bst":505,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax orbeetle-gmax (juego oficial 150826) */
  {"dex":150834,"name":"Gigantamax Drednaw","types":["water","rock"],"hp":110,"spd":109,"atk":1.33,"pa":1.33,"sa":0.96,"df":90,"sd":68,"rarity":3,"bst":485,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax drednaw-gmax (juego oficial 150834) */
  {"dex":150839,"name":"Gigantamax Coalossal","types":["rock","fire"],"hp":120,"spd":91,"atk":1.14,"pa":1.14,"sa":1.14,"df":120,"sd":90,"rarity":4,"bst":510,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax coalossal-gmax (juego oficial 150839) */
  {"dex":150841,"name":"Gigantamax Flapple","types":["grass","dragon"],"hp":102,"spd":107,"atk":1.31,"pa":1.31,"sa":1.22,"df":80,"sd":60,"rarity":3,"bst":485,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax flapple-gmax (juego oficial 150841) */
  {"dex":150842,"name":"Gigantamax Appletun","types":["grass","dragon"],"hp":120,"spd":91,"atk":1.25,"pa":1.17,"sa":1.25,"df":80,"sd":80,"rarity":3,"bst":485,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax appletun-gmax (juego oficial 150842) */
  {"dex":150844,"name":"Gigantamax Sandaconda","types":["ground"],"hp":102,"spd":108,"atk":1.29,"pa":1.29,"sa":1.06,"df":125,"sd":70,"rarity":4,"bst":510,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax sandaconda-gmax (juego oficial 150844) */
  {"dex":150849,"name":"Gigantamax Toxtricity","types":["electric","poison"],"hp":104,"spd":110,"atk":1.33,"pa":1.24,"sa":1.33,"df":70,"sd":70,"rarity":4,"bst":502,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax toxtricity-gmax (juego oficial 150849) */
  {"dex":150851,"name":"Gigantamax Centiskorch","types":["fire","bug"],"hp":115,"spd":105,"atk":1.33,"pa":1.33,"sa":1.2,"df":65,"sd":90,"rarity":4,"bst":525,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax centiskorch-gmax (juego oficial 150851) */
  {"dex":150858,"name":"Gigantamax Hatterene","types":["psychic","fairy"],"hp":96,"spd":90,"atk":1.45,"pa":1.2,"sa":1.45,"df":95,"sd":103,"rarity":4,"bst":510,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax hatterene-gmax (juego oficial 150858) */
  {"dex":150861,"name":"Gigantamax Grimmsnarl","types":["dark","fairy"],"hp":113,"spd":103,"atk":1.36,"pa":1.36,"sa":1.22,"df":65,"sd":75,"rarity":4,"bst":510,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax grimmsnarl-gmax (juego oficial 150861) */
  {"dex":150869,"name":"Gigantamax Alcremie","types":["fairy"],"hp":99,"spd":105,"atk":1.31,"pa":1.03,"sa":1.31,"df":75,"sd":121,"rarity":4,"bst":495,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax alcremie-gmax (juego oficial 150869) */
  {"dex":150879,"name":"Gigantamax Copperajah","types":["steel"],"hp":125,"spd":91,"atk":1.42,"pa":1.42,"sa":1.14,"df":69,"sd":69,"rarity":4,"bst":500,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax copperajah-gmax (juego oficial 150879) */
  {"dex":150884,"name":"Gigantamax Duraludon","types":["steel","dragon"],"hp":102,"spd":114,"atk":1.36,"pa":1.22,"sa":1.36,"df":115,"sd":50,"rarity":4,"bst":535,"starter":false,"gen":8,"excl":true,"form":"gmax"},   /* gmax duraludon-gmax (juego oficial 150884) */
  {"dex":150892,"name":"Gigantamax Urshifu","types":["fighting","dark"],"hp":115,"spd":119,"atk":1.42,"pa":1.42,"sa":1.05,"df":100,"sd":60,"rarity":5,"bst":550,"starter":false,"gen":8,"leg":true,"excl":true,"form":"gmax"},   /* gmax urshifu-gmax (juego oficial 150892) */
  {"dex":160892,"name":"Gigantamax Urshifu Rapid Strike","types":["fighting","dark"],"hp":115,"spd":119,"atk":1.42,"pa":1.42,"sa":1.05,"df":100,"sd":60,"rarity":5,"bst":550,"starter":false,"gen":8,"leg":true,"excl":true,"form":"gmax"}   /* gmax urshifu-rapid-strike-gmax (juego oficial 160892) */
];

G.DEX_BY = {};
for (const p of G.DEX) G.DEX_BY[p.dex] = p;
G.getPokemon = dex => G.DEX_BY[dex];
