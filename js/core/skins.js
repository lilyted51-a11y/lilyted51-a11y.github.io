/* ============ skins.js — disfraces de bruja (Halloween 2026) ============
 * Una skin es un disfraz pintado en las propias hojas de sprites del Pokémon:
 * sombrero de bruja en la coronilla y capa siguiendo el cuerpo, en cada
 * fotograma y cada dirección (tools/make_skins.py). Están en
 *   assets/pokemon/{dex}/k-{id}/{Anim}.png      (y k-{id}/s/ las shiny)
 * con un margen de PAD_X a los lados y PAD_T arriba para el sombrero.
 *
 *   Animator.skin = id    (core/sprites.js usa esas hojas)
 *   SKINS[id]             las que se compran con caramelos en la Tienda Kecleon
 *   'hat'                 sólo el sombrero (Kecleon, en la tienda esos días)
 *
 * Se guardan en la partida: save.skins { id: fecha } (compradas, para siempre)
 * y save.pskin { dex: [id, fecha] } (la que lleva puesta cada Pokémon; '' = ninguna).
 *
 * Skins de color (tint, 23-11-2026): no tienen hojas propias; se pintan las de siempre con otros
 * colores (tinted, una vez por hoja). Mewtwo Obsidiana, el premio de ¡Atrapa a Pikachu! en el
 * Casino Rocket (systems/casino.js): cristal negro con brillos violeta y ojos y cola en rojo.
 */
G.Skins = (() => {
  const PAD_X = 8, PAD_T = 16;          // (los mismos que en tools/make_skins.py)

  const SKINS = {
    'bruja-gengar':  { dex: 94,  name: 'Gengar bruja' },
    'bruja-pikachu': { dex: 25,  name: 'Pikachu bruja' },
    'bruja-umbreon': { dex: 197, name: 'Umbreon bruja' },
    // Copia local: el sombrero de Kecleon (el de la tienda) también se puede llevar, pero no se vende (shop: false):
    // lo da el administrador (tools/admin/grant_skins.mjs).
    'hat':           { dex: 352, name: 'Kecleon bruja', shop: false },
    // El premio de ¡Atrapa a Pikachu! (Casino Rocket): no se vende.
    'obsidiana-mewtwo': { dex: 150, name: 'Mewtwo Obsidiana', shop: false, tint: 'obsidian' }
  };
  const LIST = Object.keys(SKINS).filter(id => SKINS[id].shop !== false);   // las de la tienda

  /** La skin de un id para ese Pokémon; null si no hay o no es suya (no tiene hojas). */
  function get(id, dex) {
    const s = SKINS[id];
    return s && s.dex === +dex ? s : null;
  }

  // ---------------- en la partida guardada ----------------

  const owns = (s, id) => !!(s && s.skins && s.skins[id]);
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
   * Obsidiana: cada píxel según su luz, en una escala de negro a violeta pálido; los muy
   * saturados de tono morado o rosa (ojos, cola) pasan a un rojo encendido. El contorno, igual.
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

  return { PAD_X, PAD_T, SKINS, LIST, get, owns, worn, wear, tinted };
})();
