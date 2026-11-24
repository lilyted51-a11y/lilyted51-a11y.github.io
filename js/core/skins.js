/* ============ skins.js — skins (disfraces pintados en las hojas de sprites) ============
 * Una skin es un dibujo nuevo del Pokémon: sus propias hojas de sprites, en cada
 * fotograma y cada dirección. Están en
 *   assets/pokemon/{dex}/k-{id}/{Anim}.png      (y k-{id}/s/ las shiny, si las tiene: sh)
 * con un margen de PAD_X a los lados y PAD_T arriba (el mismo en todas, también en las del
 * juego oficial).
 *
 *   Animator.skin = id    (core/sprites.js usa esas hojas)
 *   SKINS[id]             todas; LIST, las de bruja (Halloween, por caramelos)
 *   'hat'                 sólo el sombrero (Kecleon, en la tienda esos días)
 *
 * Se guardan en la partida: save.skins { id: fecha } (compradas, para siempre)
 * y save.pskin { dex: [id, fecha] } (la que lleva puesta cada Pokémon; '' = ninguna).
 *
 * Skins de color (tint, 23-11-2026): no tienen hojas propias; se pintan las de siempre con otros
 * colores (tinted, una vez por hoja). (Mewtwo Obsidiana lo era; 25-11-2026: ya lleva las hojas
 * pintadas del juego oficial. Sigue siendo el premio de ¡Atrapa a Pikachu!, systems/casino.js.)
 *
 * Skins de la comunidad (25-11-2026, copia local; como en el juego oficial, con sus hojas): hechas
 * por jugadores (by: su autor; ver CREDITS.md). Cada semana (de lunes a domingo, en España) hay 3 en
 * la Tienda Kecleon, las mismas para todos (weekly): ORDER la primera vuelta y luego, cada vuelta,
 * mezcladas con la semilla 'skins:' + vuelta. Precio por rareza (r, PRICE). Algunas:
 *   sh    también en shiny (k-{id}/s/); las demás, en un shiny se ven igual que en el normal
 *   mega  las formas (nuestro número: Mega, primigenia) que también la tienen: al megaevolucionar
 *         o con la regresión primigenia se sigue viendo (systems/powers.js, look)
 *   pack  un pack: se compra una vez y da todos sus estilos (los que tienen in: ese id), que se
 *         eligen en el Vestidor. Sólo se guarda el pack (save.skins[pack]).
 * Deoxys Xenomorfo no se vende (en el oficial es el premio del rango Maestro de su comunidad, que
 * aquí no hay): sólo la da el administrador (tools/admin/grant_skins.mjs), como el sombrero.
 */
G.Skins = (() => {
  const PAD_X = 8, PAD_T = 16;          // (los mismos que en tools/make_skins.py y en las del juego oficial)
  const COMMUNITY = 'comunidad de PokéSurvivor';   // autor cuando no se sabe

  const SKINS = {
    'bruja-gengar':  { dex: 94,  name: 'Gengar bruja', hw: 1, sh: 1 },
    'bruja-pikachu': { dex: 25,  name: 'Pikachu bruja', hw: 1, sh: 1 },
    'bruja-umbreon': { dex: 197, name: 'Umbreon bruja', hw: 1, sh: 1 },
    // Copia local: el sombrero de Kecleon (el de la tienda) también se puede llevar, pero no se vende (shop: false):
    // lo da el administrador (tools/admin/grant_skins.mjs).
    'hat':           { dex: 352, name: 'Kecleon bruja', shop: false, sh: 1 },
    // El premio de ¡Atrapa a Pikachu! (Casino Rocket): no se vende.
    'obsidiana-mewtwo': { dex: 150, name: 'Mewtwo Obsidiana', shop: false, r: 5 },

    // ---- de la comunidad (25-11-2026) ----
    'cartero-dragonite':    { dex: 149, name: 'Dragonite cartero', r: 4, sh: 1 },
    'cosmico-rayquaza':     { dex: 384, name: 'Rayquaza cósmico', r: 3 },
    'gafas-squirtle':       { dex: 7,   name: 'Squirtle con gafas de sol', r: 3, sh: 1 },
    'neon-zygarde':         { dex: 718, name: 'Zygarde neón vivo', r: 1, by: 'SrYena' },
    'fucsia-gengar':        { dex: 94,  name: 'Gengar blanco fucsia', r: 3 },
    'pastelero-lickilicky': { dex: 463, name: 'Lickilicky pastelero', r: 5, sh: 1 },
    'godzilla-baxcalibur':  { dex: 998, name: 'Baxcalibur Godzilla', r: 3, mega: [100998] },
    'circense-espeon':      { dex: 196, name: 'Espeon circense', r: 4 },
    'sombrio-scyther':      { dex: 123, name: 'Scyther sombrío', r: 2, sh: 1 },
    'acuatico-yveltal':     { dex: 717, name: 'Yveltal acuático', r: 2, by: 'Frisma32' },
    'epico-braixen':        { dex: 654, name: 'Braixen épico', r: 1 },
    'viajero-snorlax':      { dex: 143, name: 'Snorlax viajero', r: 4 },
    'hielo-lunala':         { dex: 792, name: 'Lunala de hielo', r: 4 },
    'infernal-toxtricity':  { dex: 849, name: 'Toxtricity infernal', r: 5, sh: 1 },
    'saiyan-abra':          { dex: 63,  name: 'Abra saiyan', r: 4 },
    'azul-centiskorch':     { dex: 851, name: 'Centiskorch fuego azul', r: 2, by: 'Frisma32' },
    'plata-gholdengo':      { dex: 1000, name: 'Gholdengo de plata', r: 2 },
    'algodon-woobat':       { dex: 527, name: 'Woobat algodón de azúcar', r: 5 },
    'lunar-tapu-fini':      { dex: 788, name: 'Tapu Fini lunar', r: 3 },
    'nocturno-pangoro':     { dex: 675, name: 'Pangoro nocturno', r: 2, by: 'Frisma32' },
    'pastel-magearna':      { dex: 801, name: 'Magearna pastel', r: 5 },
    'abisal-huntail':       { dex: 367, name: 'Huntail abisal', r: 1, by: 'Frisma32' },
    'sombrio-gliscor':      { dex: 472, name: 'Gliscor sombrío', r: 3 },
    'explorador-minccino':  { dex: 572, name: 'Minccino explorador', r: 3 },
    'fresa-reuniclus':      { dex: 579, name: 'Reuniclus de fresa', r: 5 },
    'albino-excadrill':     { dex: 530, name: 'Excadrill albino', r: 2 },
    'selva-simisage':       { dex: 512, name: 'Simisage de la selva', r: 2 },
    'nebuloso-rayquaza':    { dex: 384, name: 'Rayquaza nebuloso', r: 2 },
    'sombrio-charizard':    { dex: 6,   name: 'Charizard llama sombría', r: 3 },
    'xenomorfo-deoxys':     { dex: 386, name: 'Deoxys Xenomorfo', r: 5, sh: 1, shop: false },
    'abismal-eternatus':    { dex: 890, name: 'Eternatus abismal', r: 2 },
    'esmeralda-greninja':   { dex: 658, name: 'Greninja Esmeralda', r: 3, mega: [100658, 300658] },
    'abisal-kyogre':        { dex: 382, name: 'Kyogre abisal', r: 4, mega: [1382] },
    'oscuro-reshiram':      { dex: 643, name: 'Reshiram oscuro', r: 4 },
    'cibernetico-luxray':   { dex: 405, name: 'Luxray cibernético', r: 3 },
    'unown-scizor':         { dex: 212, name: 'Scizor rey Unown', r: 4 },
    'muerto-tentacruel':    { dex: 73,  name: 'Tentacruel muerto', r: 2 },
    'toxico-koffing':       { dex: 109, name: 'Koffing tóxico', r: 3 },
    // El pack Groudon multiescamas: una compra, 7 estilos.
    'abisal-groudon':       { dex: 383, name: 'Groudon abisal', r: 3, by: 'Frisma32', pack: 'Groudon multiescamas' },
    'desertico-groudon':    { dex: 383, name: 'Groudon desértico', by: 'Frisma32', in: 'abisal-groudon' },
    'diamante-groudon':     { dex: 383, name: 'Groudon diamante', by: 'Frisma32', in: 'abisal-groudon' },
    'esmeralda-groudon':    { dex: 383, name: 'Groudon esmeralda', by: 'Frisma32', in: 'abisal-groudon' },
    'espacial-groudon':     { dex: 383, name: 'Groudon espacial', by: 'Frisma32', in: 'abisal-groudon' },
    'playero-groudon':      { dex: 383, name: 'Groudon playero', by: 'Frisma32', in: 'abisal-groudon' },
    'selvatico-groudon':    { dex: 383, name: 'Groudon selvático', by: 'Frisma32', in: 'abisal-groudon' }
  };
  const LIST = Object.keys(SKINS).filter(id => SKINS[id].hw);   // las de bruja (Halloween)

  /** La skin de un id para ese Pokémon (o una de sus formas con la skin: mega); null si no hay o no es suya. */
  function get(id, dex) {
    const s = SKINS[id];
    return s && (s.dex === +dex || (s.mega && s.mega.includes(+dex))) ? s : null;
  }
  /** Quién la hizo (las de bruja, el sombrero y Obsidiana: de la casa → ''). */
  const author = id => { const s = SKINS[id]; return !s || s.hw || id === 'hat' ? '' : s.by || COMMUNITY; };
  /** Los estilos de un pack (él mismo, el primero); de una skin suelta, ella sola. */
  const styles = id => [id].concat(Object.keys(SKINS).filter(k => SKINS[k].in === id));

  // ---------------- la tienda: 3 cada semana ----------------

  // Orden de la primera vuelta (el del juego oficial desde el 20-11-2026; las 7 que no se sabe dónde van, repartidas).
  const ORDER = ['hielo-lunala', 'epico-braixen', 'toxico-koffing', 'circense-espeon', 'acuatico-yveltal', 'sombrio-charizard',
    'azul-centiskorch', 'abismal-eternatus', 'plata-gholdengo', 'muerto-tentacruel', 'viajero-snorlax', 'explorador-minccino',
    'abisal-kyogre', 'infernal-toxtricity', 'selva-simisage', 'fucsia-gengar', 'fresa-reuniclus', 'algodon-woobat', 'saiyan-abra',
    'sombrio-gliscor', 'esmeralda-greninja', 'godzilla-baxcalibur', 'oscuro-reshiram', 'neon-zygarde', 'unown-scizor',
    'pastelero-lickilicky', 'albino-excadrill', 'nocturno-pangoro', 'nebuloso-rayquaza', 'abisal-groudon', 'sombrio-scyther',
    'lunar-tapu-fini', 'cibernetico-luxray', 'abisal-huntail', 'pastel-magearna', 'cartero-dragonite', 'cosmico-rayquaza',
    'gafas-squirtle'];
  const PER_WEEK = 3;
  const WEEK0 = '20261116';             // lunes de la semana de la primera vuelta (antes, la primera semana)
  const PRICE = { 1: 25000, 2: 27500, 3: 30000, 4: 35000, 5: 45000 };
  const price = id => PRICE[(SKINS[id] && SKINS[id].r) || 3] || PRICE[3];

  function rng(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  /** La vuelta n: la 0, ORDER; las demás, mezcladas, sin empezar por las que cerraron la anterior. */
  const cycles = [ORDER];
  function cycle(n) {
    while (cycles.length <= n) {
      const c = cycles.length, prev = cycles[c - 1].slice(-PER_WEEK), l = ORDER.slice(), r = rng('skins:' + c);
      for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
      for (let i = 0; i < PER_WEEK; i++) {
        if (!prev.includes(l[i])) continue;
        let j = l.length - 1;
        while (j >= 2 * PER_WEEK && prev.includes(l[j])) j--;
        [l[i], l[j]] = [l[j], l[i]];
      }
      cycles.push(l);
    }
    return cycles[n];
  }
  /** Semanas desde WEEK0 hasta la del lunes `key` ('AAAAMMDD'); antes, 0. */
  function weekIndex(key) {
    const d = k => Date.UTC(+k.slice(0, 4), +k.slice(4, 6) - 1, +k.slice(6, 8));
    return Math.max(0, Math.round((d(key) - d(WEEK0)) / (7 * 864e5)));
  }
  /** Las 3 de la semana (de `key`, el lunes; por defecto, ésta). Iguales para todos. */
  function weekly(key) {
    const w = weekIndex(key || G.Shop.week().key), N = ORDER.length, out = [];
    for (let p = w * PER_WEEK; out.length < PER_WEEK; p++) out.push(cycle(Math.floor(p / N))[p % N]);
    return out;
  }

  // ---------------- en la partida guardada ----------------

  /** ¿La tiene? (Un estilo de un pack, si tiene el pack.) */
  const owns = (s, id) => !!(s && s.skins && (s.skins[id] || (SKINS[id] && SKINS[id].in && s.skins[SKINS[id].in])));
  /** La skin que lleva puesta un Pokémon ('' si ninguna o si no es suya). */
  function worn(s, dex) {
    const e = s && s.pskin && s.pskin[dex];
    const id = e && e[0];
    return id && SKINS[id] && SKINS[id].dex === +dex && owns(s, id) ? id : '';
  }
  function wear(s, dex, id) {
    s.pskin = s.pskin || {};
    s.pskin[dex] = [id || '', Date.now()];
  }

  // ---------------- skins de color ----------------

  /*
   * Obsidiana (ya no se usa: ahora tiene hojas): cada píxel según su luz, en una escala de negro a
   * violeta pálido; los muy saturados de tono morado o rosa (ojos, cola) pasan a un rojo encendido.
   */
  const OBS = [[10, 7, 16], [26, 17, 42], [52, 34, 88], [100, 70, 160], [186, 156, 244]];
  const OBS_HOT = [[90, 8, 24], [196, 24, 60], [255, 92, 120]];
  function ramp(pal, t) {
    t = Math.max(0, Math.min(0.999, t)) * (pal.length - 1);
    const i = Math.floor(t), f = t - i, a = pal[i], b = pal[i + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  }
  const TINTS = {
    obsidian(d) {
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 8) continue;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
        if (mx < 40) continue;                                       // contorno
        const sat = mx ? (mx - mn) / mx : 0;
        let h = 0;
        if (mx !== mn) h = (mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4) * 60;
        h = (h + 360) % 360;
        // (Mewtwo es casi blanco: su luz se comprime hacia lo oscuro, y los brillos quedan violeta.)
        const [R, G2, B] = sat > 0.3 && (h > 250 || h < 20) ? ramp(OBS_HOT, l * 1.4) : ramp(OBS, l * l * 0.9);
        d[i] = R; d[i + 1] = G2; d[i + 2] = B;
      }
    }
  };
  const tintCache = new Map();          // tinte -> WeakMap(imagen -> canvas)
  /** La hoja `img` con los colores del tinte (se calcula una vez). */
  function tinted(img, kind) {
    let m = tintCache.get(kind);
    if (!m) tintCache.set(kind, m = new WeakMap());
    let cv = m.get(img);
    if (cv) return cv;
    cv = document.createElement('canvas');
    cv.width = img.naturalWidth || img.width; cv.height = img.naturalHeight || img.height;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    try {
      const data = ctx.getImageData(0, 0, cv.width, cv.height);
      (TINTS[kind] || (() => {}))(data.data);
      ctx.putImageData(data, 0, 0);
    } catch (e) { /* (imagen de otro sitio: se queda sin tinte) */ }
    m.set(img, cv);
    return cv;
  }

  return { PAD_X, PAD_T, SKINS, LIST, ORDER, PRICE, COMMUNITY, get, author, styles, price, cycle, weekIndex, weekly,
           owns, worn, wear, tinted };
})();
