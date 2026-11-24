/* ============ photo.js — foto y marco del perfil ============
 * (23-11-2026; como el perfil nuevo de la Gran Actualización del juego oficial, hecho aquí a partir
 *  de sus novedades.) Tu perfil lleva una FOTO (la cara de un Pokémon con la expresión que elijas) y
 * un MARCO. Se ven en Misiones → Perfil, en tu perfil público (amigos) y arriba, en tu nombre.
 *
 * Caras: las de PMDCollab SpriteCollab (CC BY-NC 4.0, como los sprites), una tira por Pokémon en
 * assets/portraits/<dex>.png con las expresiones que tenga (G.PORTRAITS, data/portraits.js). Se
 * cargan sólo al verlas. Las formas (Vulpix de Alola, Megas...) usan la cara de su especie.
 *
 *   Expresiones          Cómo se consiguen
 *   Normal, Contento,    gratis, de cualquier Pokémon que tengas
 *   Enfadado, Triste,
 *   Sorprendido
 *   Decidido, Feliz,     en la Tienda Kecleon: 4 fotos nuevas cada día, las mismas para todos
 *   Preocupado...
 *   Inspirado            la foto de maestría (10.000 puntos con ese Pokémon, systems/mastery.js);
 *                        no se vende (si no la tiene, su cara Feliz o Contenta)
 *
 * Marcos: dibujados aquí en pixel art (64×64, la cara de 40×40 en medio). Sencillo, Madera y Piedra,
 * gratis; otros 8 en la Tienda Kecleon (2 cada semana); y el de maestría (50.000 puntos): dorado,
 * con gemas de los tipos de ese Pokémon y su cara en un medallón ('m:<dex>').
 *
 * En la partida guardada: profile.photo = { d: dex, e: expresión }, profile.frame = id;
 * photos['<especie>/<expresión>'] y frames[id] = fecha de compra (core/db.js los junta: unión).
 * Al perfil público van como photo: [dex, nº de expresión] y frame: id (net/social.js).
 */
G.Photo = (() => {
  const EX = G.PORTRAIT_EX || ['Normal'];
  const FREE = ['Normal', 'Happy', 'Angry', 'Sad', 'Surprised'];
  const SHOP = ['Determined', 'Joyous', 'Worried', 'Teary-Eyed', 'Dizzy', 'Shouting'];
  const MASTER = ['Inspired', 'Joyous', 'Happy', 'Normal'];
  const EX_NAME = { Normal: 'Normal', Happy: 'Contento', Angry: 'Enfadado', Sad: 'Triste', Surprised: 'Sorprendido',
                    Determined: 'Decidido', Joyous: 'Feliz', Worried: 'Preocupado', 'Teary-Eyed': 'Lloroso', Dizzy: 'Mareado',
                    Shouting: 'Gritando', Inspired: 'Inspirado' };
  const PHOTO_PRICE = 1000, FRAME_PRICE = 4000, DAILY = 4, WEEKLY = 2;

  // ---------------- caras ----------------

  const base = d => { d = Math.floor(+d) || 0; if (G.formBase) return G.formBase(d); while (d > 1025) d -= 1000; return d; };   // (data/forms.js)
  const mask = d => (G.PORTRAITS && G.PORTRAITS[base(d)]) || 0;
  const has = (d, e) => { const i = EX.indexOf(e); return i >= 0 && !!(mask(d) & (1 << i)); };
  const exOf = d => EX.filter(e => has(d, e));
  const masterEx = d => MASTER.find(e => has(d, e)) || 'Normal';
  const exName = e => EX_NAME[e] || e;

  const strips = new Map();          // especie -> { img, ok, p }
  function load(d) {
    const b = base(d);
    if (!mask(b)) return Promise.resolve(null);
    let st = strips.get(b);
    if (!st) {
      st = { img: new Image(), ok: false };
      st.p = new Promise(res => {
        st.img.onload = () => { st.ok = true; res(st.img); };
        st.img.onerror = () => res(null);
      });
      st.img.src = 'assets/portraits/' + b + '.png';
      strips.set(b, st);
    }
    return st.p;
  }
  /** Dibuja la cara (40×40 de la tira) en g, en x, y con lado `size`. */
  function face(g, d, e, x, y, size) {
    const st = strips.get(base(d));
    if (!st || !st.ok) return false;
    if (!has(d, e)) e = 'Normal';
    const m = mask(d), i = EX.indexOf(e);
    let rank = 0;
    for (let k = 0; k < i; k++) if (m & (1 << k)) rank++;
    g.drawImage(st.img, rank * 40, 0, 40, 40, x, y, size, size);
    return true;
  }

  // ---------------- marcos ----------------

  const K = '#141022';
  // c: [base, claro, oscuro, adorno, adorno 2] · free: gratis · si no, de la tienda
  const FRAMES = {
    basic: { name: 'Sencillo', free: true, c: ['#3a4f8a', '#7f9be0', '#22305a', '#b9cbf0'], orn: 'rivet' },
    wood:  { name: 'Madera', free: true, c: ['#9a5c2e', '#c8874c', '#5e3416', '#7a4420'], orn: 'grain' },
    stone: { name: 'Piedra', free: true, c: ['#8a8f9c', '#b8bcc6', '#55596a', '#6c7080'], orn: 'brick' },
    leaf:  { name: 'Hojas', c: ['#2f8a4a', '#5fe08a', '#1a5230', '#9cf0a8', '#c06a2a'], orn: 'leaf' },
    ember: { name: 'Brasas', c: ['#8a1f1f', '#d84a2a', '#4a0c10', '#ffa64d', '#ffe36a'], orn: 'flame' },
    wave:  { name: 'Oleaje', c: ['#1f5aa8', '#4fb4ff', '#123466', '#d6f0ff'], orn: 'wave' },
    spark: { name: 'Chispas', c: ['#2a2a36', '#55556a', '#121218', '#ffd23f'], orn: 'bolt' },
    frost: { name: 'Escarcha', c: ['#7fc8e8', '#e0f6ff', '#3f7fa8', '#ffffff'], orn: 'flake' },
    candy: { name: 'Caramelo', c: ['#ff8ab8', '#ffd0e4', '#b04878', '#ffffff'], orn: 'stripe' },
    night: { name: 'Noche', c: ['#2a1f5a', '#4a3f8a', '#140c30', '#fff4b0', '#c47bff'], orn: 'stars' },
    royal: { name: 'Realeza', c: ['#6a2a9a', '#a35fd8', '#3a1060', '#ffd23f', '#ff5f6d'], orn: 'jewel' },
    gold:  { name: 'Marco de maestría', c: ['#e8b028', '#fff0a0', '#8a5a10', '#ffd23f'], orn: 'master', mastery: true }
  };
  const SHOP_FRAMES = Object.keys(FRAMES).filter(id => !FRAMES[id].free && !FRAMES[id].mastery);
  const isMasterFrame = f => typeof f === 'string' && /^m:\d+$/.test(f);
  const frameDex = f => (isMasterFrame(f) ? +f.slice(2) : 0);
  const frameDef = f => (isMasterFrame(f) ? FRAMES.gold : FRAMES[f] || FRAMES.basic);
  const validFrame = f => (isMasterFrame(f) ? !!G.DEX_BY[frameDex(f)] : !!FRAMES[f] && !FRAMES[f].mastery);
  function frameName(f) {
    return isMasterFrame(f) ? G.I18n.f('Marco de maestría de {x}', G.DEX_BY[frameDex(f)].name) : G.T(frameDef(f).name);
  }

  const R = 64, IN = 12;               // lienzo y dónde empieza la cara
  /** El marco entero (sin la cara) en g. */
  function drawFrame(g, f) {
    const def = frameDef(f), [c0, c1, c2, c3, c4] = def.c;
    const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w || 1, h || 1); };
    px(0, 0, R, R, K);
    px(1, 1, R - 2, R - 2, c0);
    px(1, 1, R - 2, 1, c1); px(1, 1, 1, R - 2, c1);
    px(1, R - 2, R - 2, 1, c2); px(R - 2, 1, 1, R - 2, c2);
    // Por el centro de la banda (de 2 a 9 y de 54 a 61): pos(t) recorre el marco entero.
    const along = (step, fn) => {
      for (let x = 6; x <= R - 7; x += step) { fn(x, 5, 'top'); fn(x, R - 6, 'bottom'); }
      for (let y = 6 + step; y <= R - 7 - step; y += step) { fn(5, y, 'left'); fn(R - 6, y, 'right'); }
    };
    switch (def.orn) {
      case 'rivet':
        for (const [x, y] of [[4, 4], [R - 6, 4], [4, R - 6], [R - 6, R - 6]]) { px(x, y, 2, 2, c3); px(x + 1, y + 1, 1, 1, c2); }
        px(4, 31, 2, 2, c3); px(R - 6, 31, 2, 2, c3); px(31, 4, 2, 2, c3); px(31, R - 6, 2, 2, c3);
        break;
      case 'grain':
        for (let x = 3; x < R - 3; x++) { if ((x * 7) % 11 > 2) px(x, 4, 1, 1, c3); if ((x * 5) % 13 > 3) px(x, 7, 1, 1, c3);
          if ((x * 3) % 7 > 1) px(x, R - 5, 1, 1, c3); if ((x * 11) % 9 > 2) px(x, R - 8, 1, 1, c3); }
        for (let y = 10; y < R - 10; y++) { if ((y * 7) % 11 > 2) px(4, y, 1, 1, c3); if ((y * 5) % 13 > 3) px(7, y, 1, 1, c3);
          if ((y * 3) % 7 > 1) px(R - 5, y, 1, 1, c3); if ((y * 11) % 9 > 2) px(R - 8, y, 1, 1, c3); }
        for (const [x, y] of [[4, 4], [R - 7, 4], [4, R - 7], [R - 7, R - 7]]) { px(x, y, 3, 3, c2); px(x + 1, y + 1, 1, 1, c1); }
        break;
      case 'brick':
        px(2, 5, R - 4, 1, c2); px(2, R - 6, R - 4, 1, c2); px(5, 2, 1, R - 4, c2); px(R - 6, 2, 1, R - 4, c2);
        for (let x = 4; x < R - 4; x += 8) { px(x, 2, 1, 3, c2); px(x + 4, 6, 1, 4, c2); px(x, R - 5, 1, 3, c2); px(x + 4, R - 10, 1, 4, c2); }
        for (let y = 4; y < R - 4; y += 8) { px(2, y, 3, 1, c2); px(6, y + 4, 4, 1, c2); px(R - 5, y, 3, 1, c2); px(R - 10, y + 4, 4, 1, c2); }
        break;
      case 'leaf':
        along(1, (x, y) => px(x, y, 1, 1, c2));
        along(6, (x, y, s) => {
          const h = s === 'top' || s === 'bottom';
          px(x - 1, y - 1, 3, 3, c1); px(x, y, 1, 1, c3);
          if (h) px(x + 2, y + ((x / 6) % 2 ? -2 : 2), 1, 1, c1); else px(x + ((y / 6) % 2 ? -2 : 2), y + 2, 1, 1, c1);
        });
        for (const [x, y] of [[3, 3], [R - 6, 3], [3, R - 6], [R - 6, R - 6]]) { px(x, y, 3, 3, c4); px(x + 1, y, 1, 1, c1); }
        break;
      case 'flame':
        along(5, (x, y, s) => {
          const up = s === 'top' ? 1 : s === 'bottom' ? -1 : 0, sd = s === 'left' ? 1 : s === 'right' ? -1 : 0;
          if (up) { px(x - 1, y + up * 2, 3, 1, c3); px(x - 1, y + up, 3, 1, c3); px(x, y, 1, 1, c4); px(x, y - up, 1, 1, c3); px(x, y + up, 1, 1, c4); }
          else { px(x + sd * 2, y - 1, 1, 3, c3); px(x + sd, y - 1, 1, 3, c3); px(x, y, 1, 1, c4); px(x - sd, y, 1, 1, c3); px(x + sd, y, 1, 1, c4); }
        });
        break;
      case 'wave':
        for (let x = 2; x < R - 2; x++) { const o = Math.round(Math.sin(x / 2.2) * 1.5); px(x, 5 + o, 1, 1, c3); px(x, R - 6 + o, 1, 1, c3); px(x, 3 + o, 1, 1, c1); px(x, R - 4 + o, 1, 1, c1); }
        for (let y = 10; y < R - 10; y++) { const o = Math.round(Math.sin(y / 2.2) * 1.5); px(5 + o, y, 1, 1, c3); px(R - 6 + o, y, 1, 1, c3); px(3 + o, y, 1, 1, c1); px(R - 4 + o, y, 1, 1, c1); }
        break;
      case 'bolt':
        for (let x = 2; x < R - 2; x++) { const o = [0, 1, 2, 1][x % 4] - 1; px(x, 5 + o, 1, 1, c3); px(x, R - 6 + o, 1, 1, c3); }
        for (let y = 10; y < R - 10; y++) { const o = [0, 1, 2, 1][y % 4] - 1; px(5 + o, y, 1, 1, c3); px(R - 6 + o, y, 1, 1, c3); }
        for (const [x, y] of [[3, 3], [R - 7, 3], [3, R - 7], [R - 7, R - 7]]) { px(x + 2, y, 2, 1, c3); px(x + 1, y + 1, 2, 1, c3); px(x, y + 2, 4, 1, c3); px(x + 2, y + 3, 1, 1, c3); }
        break;
      case 'flake':
        along(8, (x, y) => { px(x - 2, y, 5, 1, c3); px(x, y - 2, 1, 5, c3); px(x - 1, y - 1, 1, 1, c1); px(x + 1, y + 1, 1, 1, c1); px(x + 1, y - 1, 1, 1, c1); px(x - 1, y + 1, 1, 1, c1); });
        break;
      case 'stripe':
        for (let x = 1; x < R - 1; x++) for (let y = 1; y < R - 1; y++) {
          if ((x >= 10 && x < R - 10 && y >= 10 && y < R - 10)) continue;
          if ((x + y) % 6 < 2) px(x, y, 1, 1, c3);
        }
        break;
      case 'stars':
        along(7, (x, y, s) => { const j = (x * 13 + y * 7) % 5; px(x + (j % 3) - 1, y + ((j + 1) % 3) - 1, 1, 1, j ? c3 : c4); });
        px(R - 9, 2, 3, 1, c3); px(R - 10, 3, 2, 4, c3); px(R - 9, 7, 3, 1, c3);
        for (const [x, y] of [[4, 4], [4, R - 6], [R - 6, R - 6]]) { px(x, y - 1, 1, 3, c3); px(x - 1, y, 3, 1, c3); }
        break;
      case 'jewel':
        along(1, (x, y) => px(x, y, 1, 1, c3));
        along(9, (x, y) => { px(x - 1, y - 1, 3, 3, c4); px(x - 1, y - 1, 1, 1, '#ffffff'); });
        for (const [x, y] of [[2, 2], [R - 8, 2], [2, R - 8], [R - 8, R - 8]]) { px(x, y, 6, 6, c3); px(x + 1, y + 1, 4, 4, c4); px(x + 1, y + 1, 1, 1, '#ffffff'); }
        break;
      case 'master': {
        // Doble filete dorado, gemas de sus tipos y (luego) el medallón con su cara.
        px(3, 3, R - 6, 1, c1); px(3, 3, 1, R - 6, c1); px(3, R - 4, R - 6, 1, c2); px(R - 4, 3, 1, R - 6, c2);
        px(7, 7, R - 14, 1, c2); px(7, 7, 1, R - 14, c2); px(7, R - 8, R - 14, 1, c1); px(R - 8, 7, 1, R - 14, c1);
        const d = frameDex(f), mon = G.DEX_BY[d], ty = (mon && mon.types) || ['normal'];
        const gem = (x, y, col) => {
          px(x - 1, y - 3, 3, 1, K); px(x - 2, y - 2, 5, 1, K); px(x - 3, y - 1, 7, 3, K); px(x - 2, y + 2, 5, 1, K); px(x - 1, y + 3, 3, 1, K);
          px(x - 1, y - 2, 3, 1, col); px(x - 2, y - 1, 5, 3, col); px(x - 1, y + 2, 3, 1, col);
          px(x - 1, y - 1, 1, 1, '#ffffff'); px(x, y - 2, 1, 1, '#ffffff');
        };
        const col = i => G.U.TYPE_COLOR[ty[i % ty.length]] || '#ffffff';
        gem(5, 5, col(0)); gem(R - 6, 5, col(1)); gem(5, R - 6, col(1)); gem(R - 6, R - 6, col(0));
        gem(5, 31, col(0)); gem(R - 6, 31, col(1)); gem(31, 5, col(0));
        break;
      }
    }
    // Aro oscuro alrededor de la cara.
    px(IN - 2, IN - 2, 44, 44, c2);
    px(IN - 1, IN - 1, 42, 42, K);
    px(IN, IN, 40, 40, '#2a3458');
  }
  /** Medallón del marco de maestría: su cara, abajo en el centro. */
  function medal(g, f) {
    const d = frameDex(f);
    const cx = 32, cy = 56, r = 7;
    g.save();
    g.fillStyle = K; g.beginPath(); g.arc(cx, cy, r + 1.5, 0, 6.2832); g.fill();
    g.fillStyle = '#fff0a0'; g.beginPath(); g.arc(cx, cy, r + 0.5, 0, 6.2832); g.fill();
    g.fillStyle = '#2a3458'; g.beginPath(); g.arc(cx, cy, r - 0.5, 0, 6.2832); g.fill();
    g.beginPath(); g.arc(cx, cy, r - 0.5, 0, 6.2832); g.clip();
    g.imageSmoothingEnabled = true;
    face(g, d, 'Normal', cx - r, cy - r, r * 2);
    g.restore();
  }

  // ---------------- foto ya montada (cara + marco) ----------------

  const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const urls = new Map();              // 'dex|expr|marco' -> data URL
  const keyOf = sp => `${sp.d}|${sp.e}|${sp.f}`;
  function render(sp) {
    const cv = document.createElement('canvas');
    const bare = sp.f === 'none';              // sólo la cara
    cv.width = cv.height = bare ? 40 : R;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    if (bare) { face(g, sp.d, sp.e, 0, 0, 40); return cv; }
    drawFrame(g, sp.f);
    face(g, sp.d, sp.e, IN, IN, 40);
    if (isMasterFrame(sp.f)) medal(g, sp.f);
    return cv;
  }
  /** Prepara la foto (carga las caras) y devuelve su data URL. */
  function ready(sp) {
    const k = keyOf(sp);
    if (urls.has(k)) return Promise.resolve(urls.get(k));
    return Promise.all([load(sp.d), isMasterFrame(sp.f) ? load(frameDex(sp.f)) : null]).then(() => {
      const u = render(sp).toDataURL();
      urls.set(k, u);
      return u;
    });
  }
  /** <img> con la foto y su marco (se rellena al cargar la cara). px = lado en pantalla. */
  function html(sp, px = 64, cls = '') {
    sp = norm(sp);
    const k = keyOf(sp), u = urls.get(k);
    if (!u) ready(sp).then(v => { for (const i of document.querySelectorAll('img[data-phk]')) if (i.dataset.phk === k) i.src = v; });
    return `<img class="ph-img pix ${cls}" data-phk="${G.U.esc(k)}" src="${u || BLANK}" width="${px}" height="${px}" alt="" draggable="false">`;
  }
  /** Sólo la cara, sin marco (lista de Maestría, elegir foto). */
  function faceHtml(d, e = 'Normal', px = 40, cls = '') { return html({ d, e, f: 'none' }, px, cls + ' ph-face'); }

  // ---------------- lo tuyo ----------------

  const sv = () => G.DB.save;
  const ownsSpecies = (s, d) => !!(s && s.owned && Object.keys(s.owned).some(x => base(x) === base(d)));
  function mastered(d, tier) { return !!(G.Mastery && G.Mastery.has(d, tier)); }
  /** ¿Puedes ponerte esta foto? → '' si sí; si no, cómo se consigue ('shop' | 'mastery' | 'own'). */
  function photoLock(d, e, s = sv()) {
    if (!G.DEX_BY[d] || !has(d, e)) return 'none';
    if (s && s.photos && s.photos[base(d) + '/' + e]) return '';
    if (e === masterEx(d) && mastered(d, 'photo')) return '';
    if (FREE.includes(e)) return ownsSpecies(s, d) ? '' : 'own';
    return e === 'Inspired' || (e === masterEx(d) && !SHOP.includes(e)) ? 'mastery' : 'shop';
  }
  function frameLock(f, s = sv()) {
    if (isMasterFrame(f)) return mastered(frameDex(f), 'frame') ? '' : 'mastery';
    const def = FRAMES[f];
    if (!def || def.mastery) return 'none';
    if (def.free) return '';
    return s && s.frames && s.frames[f] ? '' : 'shop';
  }
  /** Tu foto y marco puestos (lo que no puedas llevar ya, vuelve a lo de siempre: tu compañero y el Sencillo). */
  function mine(s = sv()) {
    const P = (s && s.profile) || {}, ph = P.photo || {};
    const partner = (s && s.partner) || 25;
    let d = +ph.d || partner, e = typeof ph.e === 'string' ? ph.e : 'Normal';
    if (photoLock(d, e, s)) { d = partner; e = 'Normal'; }
    let f = typeof P.frame === 'string' ? P.frame : 'basic';
    if (frameLock(f, s)) f = 'basic';
    return { d, e, f };
  }
  function setPhoto(d, e) {
    const s = sv();
    if (!s || photoLock(d, e, s)) return false;
    s.profile = s.profile || { favs: [], title: '' };
    s.profile.photo = { d: +d, e };
    return true;
  }
  function setFrame(f) {
    const s = sv();
    if (!s || frameLock(f, s)) return false;
    s.profile = s.profile || { favs: [], title: '' };
    s.profile.frame = f;
    return true;
  }
  /** Para guardar el perfil: lo comprueba todo antes de enseñarlo. */
  function norm(sp) {
    sp = sp || {};
    const d = G.DEX_BY[+sp.d] ? +sp.d : 25;
    const e = EX.includes(sp.e) ? sp.e : 'Normal';
    const f = sp.f === 'none' || validFrame(sp.f) ? sp.f : 'basic';
    return { d, e, f };
  }
  /** Lo que va al perfil público. */
  function pub(s = sv()) { const m = mine(s); return { photo: [m.d, Math.max(0, EX.indexOf(m.e))], frame: m.f }; }
  /** Lo que llega del perfil de otro jugador (sólo lo que el juego sabe pintar). */
  function fromPub(d) {
    const a = Array.isArray(d && d.photo) ? d.photo : null;
    if (!a) return null;
    const dex = G.U.int(a[0], 99999), i = G.U.int(a[1], 99);
    if (!G.DEX_BY[dex]) return null;
    const f = typeof d.frame === 'string' && validFrame(d.frame.slice(0, 16)) ? d.frame.slice(0, 16) : 'basic';
    return { d: dex, e: EX[i] || 'Normal', f };
  }

  // ---------------- Tienda Kecleon: fotos del día y marcos de la semana ----------------

  function rng(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const today = () => (G.Shop && G.Shop.today ? G.Shop.today() : new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  /** El lunes de esta semana (en España), como 'AAAAMMDD'. */
  function week() {
    const t = today(), d = new Date(Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8)));
    d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  }
  /** Las 4 fotos de hoy (iguales para todos): [{ d, e, key }]. */
  function dailyPhotos() {
    const r = rng('kphoto:' + today()), out = [], used = new Set();
    const pool = Object.keys(G.PORTRAITS || {}).map(Number).filter(d => G.DEX_BY[d] && SHOP.some(e => has(d, e)));
    for (let n = 0; n < 60 && out.length < DAILY && pool.length; n++) {
      const d = pool[Math.floor(r() * pool.length)];
      if (used.has(d)) continue;
      const exs = SHOP.filter(e => has(d, e)), e = exs[Math.floor(r() * exs.length)];
      used.add(d);
      out.push({ d, e, key: d + '/' + e });
    }
    return out;
  }
  /** Los 2 marcos de esta semana. */
  function weeklyFrames() {
    const r = rng('kframe:' + week()), l = SHOP_FRAMES.slice();
    for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
    return l.slice(0, WEEKLY);
  }
  function buyPhoto(key) {
    const s = sv(), p = dailyPhotos().find(x => x.key === key);
    if (!s || !p) return { ok: false, error: 'Esa foto ya no está a la venta.' };
    if (s.photos && s.photos[key]) return { ok: false, error: 'Ya tienes esta foto.' };
    if (s.coins < PHOTO_PRICE) return { ok: false, error: 'No tienes Pokémonedas suficientes.' };
    s.coins -= PHOTO_PRICE;
    s.photos = s.photos || {};
    s.photos[key] = Date.now();
    G.DB.commit(true);
    return { ok: true };
  }
  function buyFrame(id) {
    const s = sv();
    if (!s || !weeklyFrames().includes(id)) return { ok: false, error: 'Ese marco ya no está a la venta.' };
    if (s.frames && s.frames[id]) return { ok: false, error: 'Ya tienes este marco.' };
    if (s.coins < FRAME_PRICE) return { ok: false, error: 'No tienes Pokémonedas suficientes.' };
    s.coins -= FRAME_PRICE;
    s.frames = s.frames || {};
    s.frames[id] = Date.now();
    G.DB.commit(true);
    return { ok: true };
  }

  /** Limpia lo de la partida guardada (core/db.js, sanitize). */
  function sanitize(s) {
    const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
    if (!isObj(s.photos)) s.photos = {};
    for (const k of Object.keys(s.photos)) {
      const [d, e] = k.split('/');
      if (!Number.isFinite(+s.photos[k]) || !(+d >= 1 && +d <= 1025) || !EX.includes(e)) delete s.photos[k];
    }
    if (!isObj(s.frames)) s.frames = {};
    for (const k of Object.keys(s.frames)) if (!FRAMES[k] || FRAMES[k].free || FRAMES[k].mastery || !Number.isFinite(+s.frames[k])) delete s.frames[k];
    const P = s.profile;
    if (isObj(P)) {
      if (P.photo != null && !(isObj(P.photo) && (!G.DEX_BY || G.DEX_BY[+P.photo.d]) && EX.includes(P.photo.e))) delete P.photo;
      if (P.frame != null && !(typeof P.frame === 'string' && (isMasterFrame(P.frame) || FRAMES[P.frame]))) delete P.frame;
    }
  }

  return { EX, FREE, SHOP, EX_NAME, FRAMES, SHOP_FRAMES, PHOTO_PRICE, FRAME_PRICE, base, has, exOf, exName, masterEx, load, face,
           html, faceHtml, ready, render, photoLock, frameLock, frameName, isMasterFrame, frameDex, validFrame, mine, setPhoto, setFrame,
           pub, fromPub, dailyPhotos, weeklyFrames, buyPhoto, buyFrame, sanitize, week };
})();
