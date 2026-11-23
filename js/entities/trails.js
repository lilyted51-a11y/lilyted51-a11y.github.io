/* ============ trails.js — estelas y efectos de tu Pokémon (23-11-2026, copia local) ============
 * Como la Gran Actualización del juego oficial (hecho aquí a partir de su descripción):
 * lo que deja tu Pokémon al moverse ya no viene de fábrica. Hay 56 estelas que se compran
 * una vez en la Tienda Kecleon (data/shop.js) y valen para todos tus Pokémon; cada uno lleva
 * la suya, elegida en el Vestidor (ui/wardrobe-ui.js, core/dress.js). Los jefes y los
 * legendarios conservan la suya (y los shiny enemigos, sus brillos de siempre).
 *
 * Todo se dibuja a la rejilla de píxeles del juego (G.Sprites.PX), como fx.js:
 *   - partículas con forma (corazón, estrella, nota, copo...) de mapas de caracteres
 *     coloreados con la paleta de cada estela ('o' oscuro, 'a' medio, 'b' claro, 'w' brillo);
 *   - cintas (arcoíris, neón, aurora) que siguen el camino;
 *   - sombras: copias del sprite que se quedan atrás.
 * Efectos del Pokémon (FX): brillos, aura de su tipo, halo de luz y aura oscura.
 *
 * Un "sistema" (make()) guarda sus partículas: el de la partida (world) y uno por cada
 * vista previa (Vestidor y tienda). Ajustes (core/settings.js):
 *   trails    'all' | 'mine' | 'off'   estelas de todos, sólo la tuya o ninguna
 *   trailLite true/false               la mitad de partículas
 *   dressFx   true/false               efectos (brillos, auras) de los Pokémon
 * Nada de esto toca el juego: es sólo dibujo.
 */
G.Trails = (() => {
  const PX = G.Sprites.PX;
  const R = (a, b) => a + Math.random() * (b - a);
  const pick = l => l[Math.floor(Math.random() * l.length)];
  const snap = v => Math.round(v / PX) * PX;
  const step = k => k > 0.66 ? 1 : k > 0.33 ? 0.66 : 0.33;

  // ---------------- formas (píxeles de arte) ----------------
  const SHAPES = {
    heart:  ['.aa.aa.', 'abbaaaa', 'abaaaao', '.aaaao.', '..aao..', '...o...'],
    star:   ['...a...', '..aba..', 'aaabaaa', '.abbba.', '..aaa..', '.aa.aa.', '.a...a.'],
    note:   ['...aa.', '...aba', '...a..', '...a..', '.aaa..', 'abba..', '.aa...'],
    snow:   ['...b...', '.b.b.b.', '..bab..', 'bbaaabb', '..bab..', '.b.b.b.', '...b...'],
    petal:  ['.ab..', 'abba.', '.aaao', '..oo.'],
    leaf:   ['...aab', '.aabba', 'abbaa.', 'aaao..', 'o.....'],
    bubble: ['.aaa.', 'ab..a', 'a...a', 'a...a', '.aaa.'],
    spark:  ['.a.', 'awa', '.a.'],
    drop:   ['.a.', '.a.', 'aba', 'aaa', '.o.'],
    flame:  ['..a..', '.aa..', '.aba.', 'abbaa', 'abwba', 'abwba', '.aaa.'],
    paw:    ['a.a.a', '.....', '.aaa.', 'aaaaa', '.aaa.'],
    foot:   ['.a.', 'aaa', 'aaa', 'aaa', '.a.'],
    coin:   ['.ooo.', 'oabao', 'oabao', 'oaaao', '.ooo.'],
    gem:    ['..b..', '.bab.', 'baaao', '.aao.', '..o..'],
    moon:   ['..aa.', '.ab..', '.a...', '.ab..', '..aa.'],
    bolt:   ['...a', '..ab', '.aba', 'abb.', '.a..', 'a...'],
    bone:   ['aa...aa', '.abbba.', 'aa...aa'],
    ball:   ['.aaa.', 'abaaa', 'oowoo', 'bbbbb', '.bbb.'],
    feather:['..a', '.ab', '.ab', 'ab.', 'ab.', 'o..'],
    clover: ['.a.a.', 'aabaa', '.a.a.', '..o..', '.o...'],
    candy:  ['o.aaa.o', 'ooabaoo', 'o.aaa.o'],
    flower: ['.a.a.', 'aawaa', '.a.a.', '..o..', '.oo..'],
    fly:    ['aa...aa', 'aba.aba', '.aaoaa.', '.ab.ba.', '..a.a..'],
    bat:    ['a.....a', 'aa.o.aa', 'aaaoaaa', '.a...a.'],
    pebble: ['.aa.', 'abaa', '.oo.'],
    pumpkin:['..o..', '.aaa.', 'abaab', 'aaaaa', '.aaa.'],
    skull:  ['.aaa.', 'abaab', 'aoaoa', '.aaa.', '.a.a.'],
    puff:   ['.aa..', 'abbaa', '.aaa.'],
    conf:   ['ab'],
    confv:  ['a', 'b'],
    sq:     ['a']
  };
  const cache = new Map();
  /** La forma pintada con su paleta (un lienzo pequeño, a un píxel por celda). */
  function art(shape, pal) {
    const key = shape + '|' + pal.join(',');
    let c = cache.get(key);
    if (c) return c;
    const rows = SHAPES[shape] || SHAPES.sq, h = rows.length, w = rows[0].length;
    c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    const col = { o: pal[0], a: pal[1], b: pal[2], w: pal[3] };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '.' || !col[ch]) continue;
      g.fillStyle = col[ch]; g.fillRect(x, y, 1, 1);
    }
    if (cache.size > 600) cache.clear();
    cache.set(key, c);
    return c;
  }

  // ---------------- paletas ----------------
  const P = {
    dust:   ['#5a4630', '#a08460', '#c8b08a', '#e8dcc0'],
    mud:    ['#3a2a18', '#5e4428', '#7a5a38', '#9a7a52'],
    green:  ['#1e5a1a', '#3f9a33', '#8fdc5c', '#eaffd0'],
    autumn: ['#7a3a10', '#e0742a', '#ffb24a', '#fff0c0'],
    pink:   ['#8a1e4a', '#ff5f9e', '#ffb3d1', '#fff0f6'],
    sakura: ['#b0587a', '#ffb7d0', '#ffe2ee', '#ffffff'],
    blue:   ['#1f56c4', '#5aa8ff', '#bfe4ff', '#ffffff'],
    yellow: ['#8a6400', '#ffd21a', '#fff36a', '#ffffff'],
    ember:  ['#7a1a00', '#ff6a1f', '#ffb22e', '#fff2a0'],
    ice:    ['#2f8aa8', '#7fe0ff', '#d8f8ff', '#ffffff'],
    sand:   ['#8a6a30', '#d8b468', '#f0d898', '#fff4d0'],
    toxic:  ['#3c1050', '#a043d0', '#d995f2', '#f7e2ff'],
    white:  ['#8a96b0', '#e8eef8', '#ffffff', '#ffffff'],
    stone:  ['#3e3834', '#8e8478', '#c4bcb0', '#ece6dc'],
    smoke:  ['#4a4a52', '#8a8a94', '#b8b8c2', '#dcdce4'],
    gold:   ['#8a5a00', '#ffc21a', '#fff07a', '#ffffff'],
    ink:    ['#0c0a14', '#1e1a2c', '#2e2844', '#46406a'],
    water:  ['#1f56c4', '#4f9bff', '#a8d8ff', '#ffffff'],
    bone:   ['#7a7062', '#e8e0cc', '#ffffff', '#ffffff'],
    ball:   ['#2a2230', '#e83a3a', '#f4f4f4', '#ffffff'],
    moon:   ['#8a7a2a', '#ffeaa0', '#fffbe0', '#ffffff'],
    pumpkin:['#3a6a1e', '#ff8a2a', '#ffc070', '#ffffff'],
    bat:    ['#ffd23f', '#4a2a7a', '#7a50b8', '#ffffff'],
    ghost:  ['#1a2a6a', '#4a7aff', '#9ad0ff', '#e8f6ff'],
    violet: ['#2a1050', '#7a3cff', '#b490ff', '#ffffff'],
    elec:   ['#103a8a', '#4ac8ff', '#c0f0ff', '#ffffff'],
    lava:   ['#4a0a00', '#e04a10', '#ff9a2a', '#ffe080'],
    skull:  ['#1a1424', '#c8c0d8', '#ffffff', '#ffffff'],
    dragon: ['#1e0a50', '#7a3cff', '#c08aff', '#ffe8ff'],
    phoenix:['#7a1a00', '#ff5a1a', '#ffc040', '#fff6c0'],
    psy:    ['#5e0a3a', '#ff4f9a', '#ff9fcf', '#ffe8f3'],
    abyss:  ['#08040e', '#2a1040', '#5a2a7a', '#9a6ab8']
  };
  // Varias paletas para las que cambian de color en cada partícula.
  const MULTI = [P.pink, P.blue, P.yellow, P.green, P.autumn, P.toxic];
  const RAINBOW = ['#ff4a4a', '#ff9a2a', '#ffe03a', '#4ad04a', '#3a8aff', '#9a5aff'];

  // ---------------- catálogo ----------------
  /*
   * mode: cómo se mueven las partículas
   *   ground  se quedan en el suelo donde caen (huellas, flores, monedas)
   *   rise    suben desde detrás, meciéndose (burbujas, corazones, notas)
   *   fall    caen desde el cuerpo y se posan (hojas, pétalos, nieve)
   *   spray   salen hacia atrás y se apagan rápido (polvo, chispas)
   *   drift   se quedan flotando donde nacen (estrellas)
   *   swirl   giran alrededor mientras se quedan atrás (torbellino)
   *   ripple  ondas que se abren en el suelo
   * gap: cada cuántos píxeles recorridos sale una tanda de n.
   * ribbon: cinta de colores que sigue el camino · after: sombras del sprite.
   */
  const PRICE = { 1: 800, 2: 2000, 3: 4000, 4: 8000 };
  const RAR_NAME = { 1: 'Común', 2: 'Rara', 3: 'Épica', 4: 'Legendaria' };
  const RAR_COLOR = { 1: '#b8c4dc', 2: '#5fb4ff', 3: '#c47bff', 4: '#ffd23f' };
  const E = (shape, pal, mode, o = {}) => Object.assign({ shape, pal, mode, gap: 14, n: 1, life: [0.6, 1], size: 1 }, o);
  const LIST = [
    // Comunes
    { id: 'polvo', name: 'Polvo', rar: 1, em: [E('sq', P.dust, 'spray', { gap: 9, n: 2, life: [0.35, 0.6] })] },
    { id: 'huellas', name: 'Huellas', rar: 1, em: [E('foot', P.mud, 'ground', { gap: 17, life: [2, 2.8], feet: true })] },
    { id: 'patitas', name: 'Patitas', rar: 1, em: [E('paw', P.mud, 'ground', { gap: 20, life: [2, 2.8], feet: true })] },
    { id: 'hojas', name: 'Hojas', rar: 1, em: [E('leaf', P.green, 'fall', { gap: 16, life: [1.2, 1.8] })] },
    { id: 'petalos', name: 'Pétalos', rar: 1, em: [E('petal', P.pink, 'fall', { gap: 15, life: [1.2, 1.8] })] },
    { id: 'burbujas', name: 'Burbujas', rar: 1, em: [E('bubble', P.blue, 'rise', { gap: 15, life: [0.9, 1.4] })] },
    { id: 'chispas', name: 'Chispas', rar: 1, em: [E('spark', P.yellow, 'spray', { gap: 10, n: 2, life: [0.25, 0.45] })] },
    { id: 'brasas', name: 'Brasas', rar: 1, em: [E('sq', P.ember, 'rise', { gap: 8, n: 2, life: [0.5, 0.9] })] },
    { id: 'nieve', name: 'Nieve', rar: 1, em: [E('snow', P.ice, 'fall', { gap: 18, life: [1.4, 2] })] },
    { id: 'gotas', name: 'Gotas de lluvia', rar: 1, em: [E('drop', P.water, 'fall', { gap: 12, life: [0.7, 1] })] },
    { id: 'arena', name: 'Arena', rar: 1, em: [E('sq', P.sand, 'spray', { gap: 7, n: 2, life: [0.4, 0.7], grav: 160 })] },
    { id: 'toxico', name: 'Burbujas tóxicas', rar: 1, em: [E('bubble', P.toxic, 'rise', { gap: 14, life: [0.8, 1.3] })] },
    { id: 'treboles', name: 'Tréboles', rar: 1, em: [E('clover', P.green, 'ground', { gap: 22, life: [1.8, 2.6] })] },
    { id: 'notas', name: 'Notas musicales', rar: 1, em: [E('note', MULTI, 'rise', { gap: 22, life: [1, 1.5] })] },
    { id: 'confeti', name: 'Confeti', rar: 1, em: [E('conf', MULTI, 'fall', { gap: 8, n: 2, life: [0.9, 1.4], spin: true })] },
    { id: 'plumas', name: 'Plumas', rar: 1, em: [E('feather', P.white, 'fall', { gap: 18, life: [1.3, 1.9] })] },
    { id: 'piedras', name: 'Piedrecitas', rar: 1, em: [E('pebble', P.stone, 'ground', { gap: 14, life: [1.5, 2.2] })] },
    { id: 'humo', name: 'Humo', rar: 1, em: [E('puff', P.smoke, 'rise', { gap: 14, life: [0.8, 1.2], grow: true })] },
    // Raras
    { id: 'corazones', name: 'Corazones', rar: 2, em: [E('heart', P.pink, 'rise', { gap: 18, life: [1, 1.5] })] },
    { id: 'estrellas', name: 'Estrellas', rar: 2, em: [E('star', P.gold, 'drift', { gap: 20, life: [0.8, 1.2] })] },
    { id: 'llamas', name: 'Llamas', rar: 2, em: [E('flame', P.ember, 'rise', { gap: 12, life: [0.5, 0.8] })] },
    { id: 'rayos', name: 'Rayos', rar: 2, em: [E('bolt', P.yellow, 'spray', { gap: 16, life: [0.3, 0.5] })] },
    { id: 'flores', name: 'Flores', rar: 2, em: [E('flower', [['#2e7a26', '#ff6a8a', '#ffc0cc', '#ffe03a'], ['#2e7a26', '#ffffff', '#e8eef8', '#ffd23f'], ['#2e7a26', '#9a6aff', '#d0b8ff', '#ffe03a']], 'ground', { gap: 20, life: [2, 2.8], grow: true })] },
    { id: 'cristales', name: 'Cristales de hielo', rar: 2, em: [E('gem', P.ice, 'ground', { gap: 16, life: [1.6, 2.2], grow: true })] },
    { id: 'caramelos', name: 'Caramelos', rar: 2, em: [E('candy', [['#ffffff', '#ff5f9e', '#ffb3d1'], ['#ffffff', '#4ac8ff', '#c0f0ff'], ['#ffffff', '#ffd21a', '#fff36a']].map(p => p.concat('#fff')), 'fall', { gap: 16, life: [1, 1.5] })] },
    { id: 'monedas', name: 'Monedas', rar: 2, em: [E('coin', P.gold, 'ground', { gap: 18, life: [1.6, 2.2], bounce: true })] },
    { id: 'sakura', name: 'Flor de cerezo', rar: 2, em: [E('petal', P.sakura, 'fall', { gap: 8, life: [1.4, 2] })] },
    { id: 'mariposas', name: 'Mariposas', rar: 2, em: [E('fly', [P.pink, P.blue, P.yellow, P.autumn], 'rise', { gap: 26, life: [1.2, 1.8], flap: true })] },
    { id: 'pompas', name: 'Pompas de jabón', rar: 2, em: [E('bubble', [['#c0a0ff', '#ff9ad8', '#ffffff', '#fff'], ['#a0e0ff', '#9affd0', '#ffffff', '#fff'], ['#ffe0a0', '#ff9a9a', '#ffffff', '#fff']], 'rise', { gap: 16, life: [1.2, 1.7], size: 2 })] },
    { id: 'tinta', name: 'Tinta', rar: 2, em: [E('sq', P.ink, 'ground', { gap: 8, life: [1.4, 2], size: 3 })] },
    { id: 'ondas', name: 'Ondas', rar: 2, em: [E('ring', P.water, 'ripple', { gap: 20, life: [0.8, 1.1] })] },
    { id: 'huesos', name: 'Huesos', rar: 2, em: [E('bone', P.bone, 'ground', { gap: 24, life: [1.8, 2.4] })] },
    { id: 'pokeballs', name: 'Poké Balls', rar: 2, em: [E('ball', P.ball, 'ground', { gap: 24, life: [1.6, 2.2], bounce: true })] },
    { id: 'lunas', name: 'Lunas', rar: 2, em: [E('moon', P.moon, 'rise', { gap: 22, life: [1, 1.5] })] },
    { id: 'calabazas', name: 'Calabazas', rar: 2, em: [E('pumpkin', P.pumpkin, 'ground', { gap: 24, life: [1.8, 2.4], grow: true })] },
    { id: 'murcielagos', name: 'Murciélagos', rar: 2, em: [E('bat', P.bat, 'rise', { gap: 26, life: [1, 1.4], flap: true })] },
    // Épicas
    { id: 'arcoiris', name: 'Arcoíris', rar: 3, ribbon: { cols: RAINBOW, life: 0.55 }, em: [] },
    { id: 'neon', name: 'Neón', rar: 3, ribbon: { cols: ['#ff3ad8', '#ffffff', '#3ae8ff'], life: 0.45, pulse: true }, em: [] },
    { id: 'sombras', name: 'Sombras', rar: 3, after: 'dark', em: [] },
    { id: 'espejismo', name: 'Espejismo', rar: 3, after: 'light', em: [E('spark', P.white, 'drift', { gap: 26, life: [0.4, 0.6] })] },
    { id: 'fatuo', name: 'Fuego fatuo', rar: 3, em: [E('flame', P.ghost, 'rise', { gap: 11, life: [0.6, 1], sway: 2 })] },
    { id: 'galaxia', name: 'Polvo de galaxia', rar: 3, em: [E('star', P.violet, 'drift', { gap: 22, life: [0.8, 1.2] }), E('sq', [P.violet, P.blue, P.white], 'drift', { gap: 6, life: [0.6, 1] })] },
    { id: 'aurora', name: 'Aurora', rar: 3, ribbon: { cols: ['#3affb0', '#3ad8ff', '#9a5aff'], life: 0.7, wave: true }, em: [] },
    { id: 'estatica', name: 'Estática', rar: 3, em: [E('bolt', P.elec, 'spray', { gap: 18, life: [0.25, 0.4] }), E('spark', P.elec, 'spray', { gap: 8, n: 2, life: [0.2, 0.35] })] },
    { id: 'torbellino', name: 'Torbellino de hojas', rar: 3, em: [E('leaf', [P.green, P.autumn], 'swirl', { gap: 9, life: [0.8, 1.1] })] },
    { id: 'lava', name: 'Lava', rar: 3, em: [E('sq', P.lava, 'ground', { gap: 7, life: [1.2, 1.7], size: 3, cool: true }), E('sq', P.ember, 'rise', { gap: 14, life: [0.4, 0.7] })] },
    { id: 'escarcha', name: 'Escarcha', rar: 3, em: [E('gem', P.ice, 'ground', { gap: 13, life: [1.6, 2.2], grow: true }), E('snow', P.ice, 'fall', { gap: 22, life: [1.2, 1.6] })] },
    { id: 'calaveras', name: 'Calaveras', rar: 3, em: [E('skull', P.skull, 'rise', { gap: 22, life: [1, 1.4] }), E('sq', P.toxic, 'rise', { gap: 10, life: [0.5, 0.8] })] },
    // Legendarias
    { id: 'cometa', name: 'Cometa', rar: 4, ribbon: { cols: ['#fff07a', '#ffffff'], life: 0.35 }, em: [E('star', P.gold, 'drift', { gap: 18, life: [0.6, 1], size: 2 }), E('spark', P.gold, 'spray', { gap: 7, n: 2, life: [0.3, 0.5] })] },
    { id: 'oro', name: 'Estela dorada', rar: 4, ribbon: { cols: ['#c48a00', '#ffd21a', '#fff07a'], life: 0.5, pulse: true }, em: [E('coin', P.gold, 'spray', { gap: 20, life: [0.5, 0.8] }), E('spark', P.gold, 'drift', { gap: 12, life: [0.4, 0.7] })] },
    { id: 'arcoestelar', name: 'Arcoíris estelar', rar: 4, ribbon: { cols: RAINBOW, life: 0.6, wave: true }, em: [E('star', [P.gold, P.pink, P.blue, P.green], 'drift', { gap: 18, life: [0.7, 1.1] })] },
    { id: 'dragon', name: 'Aliento de dragón', rar: 4, em: [E('flame', P.dragon, 'rise', { gap: 8, life: [0.5, 0.9], size: 2 }), E('sq', P.dragon, 'spray', { gap: 6, n: 2, life: [0.3, 0.6] })] },
    { id: 'fenix', name: 'Plumas de fénix', rar: 4, em: [E('feather', P.phoenix, 'fall', { gap: 12, life: [1, 1.5], size: 2 }), E('sq', P.ember, 'rise', { gap: 6, n: 2, life: [0.5, 0.9] })] },
    { id: 'psiquica', name: 'Onda psíquica', rar: 4, em: [E('ring', P.psy, 'ripple', { gap: 16, life: [0.8, 1.1] }), E('spark', P.psy, 'drift', { gap: 9, life: [0.4, 0.7] })] },
    { id: 'abismo', name: 'Abismo', rar: 4, after: 'abyss', em: [E('flame', P.abyss, 'rise', { gap: 10, life: [0.6, 1] })] },
    { id: 'corazonesiris', name: 'Corazones arcoíris', rar: 4, em: [E('heart', [P.pink, P.blue, P.yellow, P.green, P.toxic, P.autumn], 'rise', { gap: 11, life: [1, 1.5] }), E('spark', P.white, 'drift', { gap: 10, life: [0.4, 0.7] })] }
  ];
  const BY = {};
  for (const t of LIST) { t.price = PRICE[t.rar]; BY[t.id] = t; }

  // Efectos del Pokémon (Vestidor → Efectos): siempre puestos, se mueva o no.
  const FX = {
    shine: { name: 'Brillos', desc: 'Centelleos alrededor, como los shiny.' },
    aura:  { name: 'Aura de su tipo', desc: 'Un aura del color de su tipo bajo los pies.' },
    halo:  { name: 'Halo de luz', desc: 'Un aro de luz sobre la cabeza.' },
    dark:  { name: 'Aura oscura', desc: 'Una sombra morada que se levanta del suelo.' }
  };
  const FX_ORDER = ['shine', 'aura', 'halo', 'dark'];

  // ---------------- sistemas ----------------

  const CAP = [280, 600, 1000];
  function make() { return { parts: [], own: new Map(), t: 0 }; }
  const world = make();

  /** Estado de un dueño (posición anterior, distancia, cinta, sombras). */
  function stOf(sys, o) {
    let st = sys.own.get(o);
    if (!st) { st = { o, lx: o.x, ly: o.y, d: 0, ang: 0, foot: 0, pts: [], ghosts: [], gt: 0, fxT: 0, seen: 0 }; sys.own.set(o, st); }
    return st;
  }
  const quality = () => (G.Settings ? G.Settings.fx : 2);
  const dens = () => (G.Settings && G.Settings.get('trailLite') ? 0.5 : 1) * [0.55, 0.8, 1][quality()];

  function add(sys, p) {
    if (sys.parts.length >= CAP[quality()]) return;
    sys.parts.push(p);
  }

  /** Una partícula de un emisor, en (x, y) de los pies del dueño que va hacia `ang`. */
  function emit(sys, em, o, st, x, y, ang) {
    const pal = Array.isArray(em.pal[0]) ? pick(em.pal) : em.pal;
    const r = o.r || 10, body = o.bodyH || 30;
    const bx = x - Math.cos(ang) * r * 0.9, by = y - Math.sin(ang) * r * 0.5;
    const life = R(em.life[0], em.life[1]);
    const p = { x: bx, y: by, vx: 0, vy: 0, t: 0, life, shape: em.shape, pal, size: em.size, mode: em.mode,
                grav: em.grav || 0, sway: em.sway || 0, ph: Math.random() * 6.28, ground: false, floor: y };
    switch (em.mode) {
      case 'ground': {
        p.ground = true;
        if (em.feet) {
          // Huellas: una a cada lado, alternando.
          st.foot ^= 1;
          const side = st.foot ? 1 : -1, px_ = -Math.sin(ang) * r * 0.35 * side, py_ = Math.cos(ang) * r * 0.25 * side;
          p.x = x + px_; p.y = y + py_ - 1;
        } else { p.x = x + R(-r, r) * 0.7 - Math.cos(ang) * r * 0.4; p.y = y + R(-3, 3); }
        if (em.bounce) { p.ground = false; p.mode = 'bounce'; p.vy = -R(60, 90); p.vx = -Math.cos(ang) * R(10, 30); p.grav = 380; p.floor = p.y; p.y -= 2; }
        p.grow = !!em.grow; p.cool = !!em.cool;
        break;
      }
      case 'rise':
        p.x += R(-r, r) * 0.5; p.y = y - R(0.15, 0.6) * body;
        p.vy = -R(14, 30); p.vx = -Math.cos(ang) * R(4, 14); p.sway = em.sway || 1; p.grow = !!em.grow;
        break;
      case 'fall':
        p.x = x + R(-r, r) * 0.9 - Math.cos(ang) * r * 0.5; p.y = y - R(0.45, 1) * body;
        p.vy = R(14, 26); p.grav = em.grav || 10; p.sway = 1.4; p.floor = y + R(-3, 4);
        break;
      case 'spray': {
        const a = ang + Math.PI + R(-0.7, 0.7), s = R(30, 80);
        p.x = bx; p.y = y - R(0, 0.3) * body;
        p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s * 0.6 - R(5, 25); p.drag = 0.9;
        break;
      }
      case 'drift':
        p.x = bx + R(-r, r) * 0.8; p.y = y - R(0.1, 0.9) * body; p.vy = -R(2, 8);
        break;
      case 'swirl':
        p.cx = bx; p.cy = y - body * 0.35; p.rad = R(r * 0.6, r * 1.3); p.ang = Math.random() * 6.28; p.spinv = (Math.random() < 0.5 ? -1 : 1) * R(4, 7);
        break;
      case 'ripple':
        p.ground = true; p.x = x - Math.cos(ang) * r * 0.3; p.y = y;
        break;
    }
    if (em.spin) p.spin = true;
    if (em.flap) p.flap = true;
    add(sys, p);
  }

  /**
   * Cada fotograma, por cada dueño: si se mueve, suelta su estela; y sus efectos.
   * o: { x, y, r, bodyH, anim, types } · id: estela ('' ninguna) · fx: efecto ('' ninguno)
   */
  function tick(sys, o, id, fx, dt) {
    const st = stOf(sys, o);
    st.seen = sys.t;
    const dx = o.x - st.lx, dy = o.y - st.ly;
    st.lx = o.x; st.ly = o.y;
    const d = Math.hypot(dx, dy);
    const moving = d > 0.15 && d < 120;
    if (moving) st.ang = Math.atan2(dy, dx);
    const def = id && BY[id];
    if (def && moving) {
      const k = dens();
      st.d += d;
      for (const em of def.em) {
        em._acc = em._acc || new WeakMap();
        let a = (em._acc.get(st) || 0) + d * k;
        let guard = 4;
        while (a >= em.gap && guard-- > 0) { a -= em.gap; for (let i = 0; i < em.n; i++) emit(sys, em, o, st, o.x, o.y, st.ang); }
        em._acc.set(st, Math.min(a, em.gap));
      }
      if (def.ribbon) {
        const last = st.pts[st.pts.length - 1];
        if (!last || Math.hypot(o.x - last.x, o.y - last.y) > 5) st.pts.push({ x: o.x, y: o.y, t: sys.t });
        if (st.pts.length > 40) st.pts.shift();
      }
      if (def.after && o.anim) {
        st.gt -= dt;
        if (st.gt <= 0) { st.gt = 0.07; st.ghosts.push({ x: o.x, y: o.y, dir: o.anim.dir, t: sys.t }); if (st.ghosts.length > 6) st.ghosts.shift(); }
      }
    }
    st.def = def || null;
    // Lo viejo de la cinta y las sombras se va.
    const rl = def && def.ribbon ? def.ribbon.life : 0.5;
    while (st.pts.length && sys.t - st.pts[0].t > rl) st.pts.shift();
    while (st.ghosts.length && sys.t - st.ghosts[0].t > 0.36) st.ghosts.shift();
    // Efectos.
    st.fx = FX[fx] ? fx : '';
    if (st.fx) fxTick(sys, st, o, dt);
  }

  function fxTick(sys, st, o, dt) {
    const r = o.r || 10, body = o.bodyH || 30;
    st.fxT -= dt * [0.5, 0.8, 1][quality()];
    if (st.fxT > 0) return;
    if (st.fx === 'shine') {
      st.fxT = R(0.14, 0.3);
      add(sys, { tw: true, x: o.x + R(-r, r) * 1.3, y: o.y - R(0.1, 1.05) * body, vx: 0, vy: -8, t: 0, life: R(0.45, 0.7) });
    } else if (st.fx === 'aura') {
      st.fxT = 0.09;
      const c = typeColor(o);
      add(sys, { x: o.x + R(-r, r) * 1.1, y: o.y + R(-3, 3), vx: 0, vy: -R(18, 34), t: 0, life: R(0.5, 0.9), shape: 'sq', pal: [c, c, c, c], size: Math.random() < 0.3 ? 2 : 1, mode: 'rise', sway: 0.6, ph: Math.random() * 6 });
    } else if (st.fx === 'dark') {
      st.fxT = 0.08;
      add(sys, { x: o.x + R(-r, r) * 1.1, y: o.y + R(-3, 3), vx: 0, vy: -R(14, 28), t: 0, life: R(0.6, 1), shape: 'puff', pal: P.abyss, size: 1, mode: 'rise', sway: 0.8, ph: Math.random() * 6, grow: true });
    } else st.fxT = 1;
  }
  function typeColor(o) {
    const t = (o.types && o.types[0]) || (o.mon && o.mon.types && o.mon.types[0]) || 'normal';
    return (G.U.TYPE_COLOR && G.U.TYPE_COLOR[t]) || '#ffffff';
  }

  function update(sys, dt) {
    sys.t += dt;
    const ps = sys.parts;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.t += dt;
      if (p.t >= p.life) { ps.splice(i, 1); continue; }
      if (p.mode === 'swirl') {
        p.ang += p.spinv * dt; p.rad *= Math.pow(0.6, dt); p.cy -= 6 * dt;
        p.x = p.cx + Math.cos(p.ang) * p.rad; p.y = p.cy + Math.sin(p.ang) * p.rad * 0.45;
        continue;
      }
      if (p.ground && p.mode !== 'bounce') continue;
      p.vy += p.grav * dt;
      if (p.drag) { const k = Math.pow(p.drag, dt * 60); p.vx *= k; p.vy *= k; }
      p.x += p.vx * dt + (p.sway ? Math.sin(p.t * 5 + p.ph) * p.sway * 12 * dt : 0);
      p.y += p.vy * dt;
      if ((p.mode === 'fall' || p.mode === 'bounce') && p.y >= p.floor) {
        if (p.mode === 'bounce' && p.vy > 40) { p.y = p.floor; p.vy *= -0.35; p.vx *= 0.5; }
        else { p.y = p.floor; p.ground = true; p.sway = 0; p.vx = p.vy = 0; if (p.mode === 'bounce') p.mode = 'ground'; }
      }
    }
    // Dueños que ya no se ven (se fueron de la partida): fuera.
    for (const [o, st] of sys.own) if (sys.t - st.seen > 3) sys.own.delete(o);
  }

  // ---------------- dibujo ----------------

  function drawPart(ctx, p) {
    const k = 1 - p.t / p.life;
    if (p.tw) { G.Icons.twinkle(ctx, p.x, p.y, p.t / p.life, PX); return; }
    let a = p.ground ? (k > 0.4 ? 1 : step(k / 0.4)) : step(k);
    if (p.mode === 'ripple') {
      const rad = 3 + (1 - k) * 16, n = Math.max(10, Math.ceil(rad * 6.28 / (PX * 2)));
      ctx.globalAlpha = step(k);
      ctx.fillStyle = p.pal[1];
      for (let i = 0; i < n; i++) { const an = i / n * 6.2832; ctx.fillRect(snap(p.x + Math.cos(an) * rad), snap(p.y + Math.sin(an) * rad * 0.45), PX, PX); }
      return;
    }
    let shape = p.shape;
    if (p.spin && shape === 'conf' && Math.floor(p.t * 8 + p.ph) % 2) shape = 'confv';
    let pal = p.pal;
    if (p.cool) pal = k > 0.6 ? pal : k > 0.3 ? [pal[0], pal[0], pal[1], pal[1]] : [pal[0], pal[0], pal[0], pal[0]];
    const img = art(shape, pal);
    let s = PX * p.size;
    if (p.grow) s *= p.ground ? Math.min(1, p.t / 0.18) : 1 + (p.t / p.life) * 0.8;
    let w = img.width * s, h = img.height * s;
    if (p.flap && Math.floor(p.t * 10 + p.ph) % 2) w *= 0.5;
    if (w < 0.5 || h < 0.5) return;
    ctx.globalAlpha = a;
    ctx.drawImage(img, snap(p.x - w / 2), snap(p.y - h), Math.round(w), Math.round(h));
  }

  /** Cinta de colores por el camino (arcoíris, neón, aurora). */
  function drawRibbon(ctx, sys, st) {
    const rb = st.def && st.def.ribbon, pts = st.pts;
    if (!rb || pts.length < 2) return;
    const cols = rb.cols, n = cols.length, half = n / 2;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i], p1 = pts[i + 1];
      const age = sys.t - p1.t, k = 1 - age / rb.life;
      if (k <= 0) continue;
      ctx.globalAlpha = step(k) * (rb.pulse ? 0.75 + 0.25 * Math.sin(sys.t * 12 + i) : 1);
      const dx = p1.x - p0.x, dy = p1.y - p0.y, len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const segs = Math.ceil(len / PX);
      // Cada color, una banda de 2 píxeles de arte que se estrecha al irse apagando.
      const bw = PX * 2 * (0.5 + 0.5 * k), sq = PX * 2;
      for (let j = 0; j <= segs; j++) {
        const u = j / segs, x = p0.x + dx * u, y = p0.y + dy * u - 4;
        const wv = rb.wave ? Math.sin((i + u) * 0.9 + sys.t * 6) * 4 : 0;
        for (let b = 0; b < n; b++) {
          const off = (b - half + 0.5) * bw + wv;
          ctx.fillStyle = cols[b];
          ctx.fillRect(snap(x + nx * off - PX), snap(y + ny * off * 0.7 - PX), sq, sq);
        }
      }
    }
  }

  /** Sombras: el sprite repetido donde estuvo hace un momento. */
  function drawGhosts(ctx, sys, st) {
    const kind = st.def && st.def.after, o = st.o;
    if (!kind || !st.ghosts.length || !o.anim) return;
    const a0 = o.anim, dir = a0.dir;
    ctx.save();
    if (kind === 'dark') ctx.filter = 'brightness(0)';
    else if (kind === 'abyss') ctx.filter = 'brightness(0.35) sepia(1) hue-rotate(230deg) saturate(4)';
    for (const g of st.ghosts) {
      const k = 1 - (sys.t - g.t) / 0.36;
      if (k <= 0) continue;
      a0.dir = g.dir;
      a0.draw(ctx, g.x, g.y, kind === 'light' ? { alpha: step(k) * 0.55, flash: true } : { alpha: step(k) * 0.45 });
    }
    a0.dir = dir;
    ctx.restore();
  }

  /** Lo de debajo de los Pokémon: suelo, cintas, sombras y auras. */
  function drawUnder(ctx, sys = world) {
    for (const st of sys.own.values()) {
      drawRibbon(ctx, sys, st);
      drawGhosts(ctx, sys, st);
      if (st.fx === 'aura' || st.fx === 'dark') drawAuraRing(ctx, sys, st);
    }
    for (const p of sys.parts) if (p.ground || p.mode === 'ripple') drawPart(ctx, p);
    ctx.globalAlpha = 1;
  }
  /** Lo de encima: lo que vuela y los halos. */
  function drawAir(ctx, sys = world) {
    for (const p of sys.parts) if (!p.ground && p.mode !== 'ripple') drawPart(ctx, p);
    for (const st of sys.own.values()) if (st.fx === 'halo') drawHalo(ctx, sys, st);
    ctx.globalAlpha = 1;
  }

  function drawAuraRing(ctx, sys, st) {
    const o = st.o, r = (o.r || 10) * 1.7, c = st.fx === 'dark' ? '#5a2a7a' : typeColor(o);
    const pul = 0.85 + Math.sin(sys.t * 4) * 0.15, n = Math.ceil(r * 6.28 / (PX * 2));
    ctx.fillStyle = c;
    for (const [rr, al] of [[r * pul, 0.66], [r * pul * 0.7, 0.33]]) {
      ctx.globalAlpha = al;
      for (let i = 0; i < n; i++) { const a = i / n * 6.2832; ctx.fillRect(snap(o.x + Math.cos(a) * rr), snap(o.y + Math.sin(a) * rr * 0.4), PX, PX); }
    }
  }
  function drawHalo(ctx, sys, st) {
    const o = st.o, r = Math.max(7, (o.r || 10) * 0.75), y = o.y - (o.bodyH || 30) - 6 + Math.sin(sys.t * 3) * 2;
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.2832 + sys.t * 1.5, front = Math.sin(a) > 0;
      ctx.globalAlpha = front ? 1 : 0.66;
      ctx.fillStyle = (i + Math.floor(sys.t * 8)) % 4 === 0 ? '#ffffff' : '#ffe27a';
      ctx.fillRect(snap(o.x + Math.cos(a) * r), snap(y + Math.sin(a) * r * 0.35), PX, PX);
    }
  }

  // ---------------- partida ----------------

  /** La estela de los jefes y legendarios (de su tipo), que se quedan con la suya. */
  const BOSS_EM = {};
  function bossEm(e) {
    const t = (e.types && e.types[0]) || 'normal', key = (e.legend ? 'L' : 'B') + t;
    if (!BOSS_EM[key]) {
      const V = (G.VFX && G.VFX.PAL[t]) || P.white, pal = [V[1], V[2], V[3], V[4]];
      BOSS_EM[key] = { em: e.legend ? [E('star', pal, 'drift', { gap: 22, life: [0.6, 1] }), E('sq', pal, 'rise', { gap: 10, life: [0.4, 0.8] })]
                                    : [E('sq', pal, 'spray', { gap: 9, n: 2, life: [0.35, 0.7], size: 2 })] };
    }
    return BOSS_EM[key];
  }

  /** Cada fotograma de la partida: los jugadores (con los Ajustes) y los jefes. */
  function run(dt, players) {
    const set = (G.Settings && G.Settings.get('trails')) || 'all', fxOn = !G.Settings || G.Settings.get('dressFx') !== false;
    for (const p of players || []) {
      if (!p) continue;
      const mine = !p.remote, show = !p.dead && (set === 'all' || (set === 'mine' && mine));
      tick(world, p, show ? p.trail || '' : '', fxOn && !p.dead ? p.dfx || '' : '', dt);
    }
    if (G.EnemyMgr && G.Camera) {
      for (const e of G.EnemyMgr.all()) {
        if (e.dead || !(e.boss || e.legend) || e.etCore || !G.Camera.sees(e.x, e.y, 60)) continue;
        const def = bossEm(e);
        const st = stOf(world, e);
        st.seen = world.t;
        const d = Math.hypot(e.x - st.lx, e.y - st.ly);
        if (d > 0.15 && d < 120) {
          st.ang = Math.atan2(e.y - st.ly, e.x - st.lx);
          for (const em of def.em) {
            em._acc = em._acc || new WeakMap();
            let a = (em._acc.get(st) || 0) + d * dens(), guard = 3;
            while (a >= em.gap && guard-- > 0) { a -= em.gap; for (let i = 0; i < em.n; i++) emit(world, em, e, st, e.x, e.y, st.ang); }
            em._acc.set(st, Math.min(a, em.gap));
          }
        }
        st.lx = e.x; st.ly = e.y;
      }
    }
    update(world, dt);
  }
  function clear() { world.parts = []; world.own.clear(); }

  // ---------------- vistas previas (Vestidor y tienda) ----------------
  /*
   * Un <canvas> con un Pokémon que da vueltas por un prado dejando su estela.
   * opts: { dex, shiny, skin, look, trail, fx, scale (zoom), path: 'loop' | 'line' }
   * Se animan todas con un solo requestAnimationFrame, sólo mientras se ven.
   */
  const views = new Set();
  let raf = 0, lastT = 0;
  function preview(cv, opts = {}) {
    for (const v of views) if (v.cv === cv) views.delete(v);
    const dex = opts.look || opts.dex;
    const sc = G.Sprites.playerScale(dex);
    const anim = new G.Sprites.Animator(dex, sc, !!opts.shiny);
    anim.skin = opts.skin || null;
    anim.loop('Walk');
    const mon = G.DEX_BY[opts.dex] || G.DEX_BY[dex] || { types: ['normal'] };
    const o = { x: 0, y: 0, anim, r: G.Sprites.playerRadius(dex), bodyH: G.Sprites.bodyHeight(dex, sc), types: mon.types, scale: sc, dex };
    const v = { cv, ctx: cv.getContext('2d'), sys: make(), o, opts, a: opts.path === 'line' ? Math.random() * 150 : Math.random() * 6, dex };
    views.add(v);
    if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); }
    return v;
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    for (const v of views) {
      if (!v.cv.isConnected) { views.delete(v); continue; }
      if (v.cv.offsetParent === null) continue;
      drawView(v, dt);
    }
    raf = views.size ? requestAnimationFrame(frame) : 0;
  }
  function drawView(v, dt) {
    const { cv, ctx, sys, o, opts } = v;
    const W = cv.width, H = cv.height, z = opts.zoom || Math.max(1, H / 150);
    const w = W / z, h = H / z;
    // Recorrido: una vuelta (óvalo) o de lado a lado.
    const spd = 95;
    if (opts.path === 'line') {
      v.a += dt * spd;
      const span = w + 80, x = (v.a % span) - 40;
      o.x = x; o.y = h * 0.72;
      o.anim.dir = 2;
    } else {
      const rx = w * 0.3, ry = h * 0.2, per = 6.2832 * Math.sqrt((rx * rx + ry * ry) / 2);
      v.a += dt * spd / per * 6.2832;
      const nx = w / 2 + Math.cos(v.a) * rx, ny = h * 0.6 + Math.sin(v.a) * ry;
      o.anim.dir = G.Sprites.dirFromAngle(Math.atan2(ny - o.y, nx - o.x));
      o.x = nx; o.y = ny;
    }
    o.anim.update(dt);
    tick(sys, o, opts.trail || '', opts.fx || '', dt);
    update(sys, dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    // Prado a cuadros, como el suelo del juego.
    ctx.fillStyle = opts.bg || '#2d5a3a';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.scale(z, z);
    ctx.fillStyle = 'rgba(255,255,255,.05)';
    for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? 16 : 0; x < w; x += 32) ctx.fillRect(x, y, 16, 16);
    drawUnder(ctx, sys);
    G.Sprites.drawShadow(ctx, o.dex, o.x, o.y, o.scale);
    o.anim.draw(ctx, o.x, o.y);
    drawAir(ctx, sys);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  return { LIST, BY, FX, FX_ORDER, PRICE, RAR_NAME, RAR_COLOR, SHAPES, make, tick, update, drawUnder, drawAir, run, clear, preview, world };
})();
