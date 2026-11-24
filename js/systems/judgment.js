/* ============ judgment.js — La Sentencia de Arceus (minuto 30) ============
 *
 * Al llegar al minuto 30 se acaba la partida "normal" (como la Muerte de
 * Vampire Survivors):
 *
 *   1. Animación: la pantalla se oscurece, aparece "LA SENTENCIA DE ARCEUS"
 *      con su rueda dorada, destello y viaje a su arena. Arceus baja del cielo
 *      por un pilar de luz y cae con una onda de choque. La primera vez se ve
 *      entera; después se puede saltar (en cooperativo sólo el anfitrión).
 *   2. Pelea: Arceus es INVENCIBLE. Lleva una Tabla al azar que le da su tipo
 *      y sólo recibe una parte del daño (ver dmgK; el ranking de daño a Arceus
 *      sale de ahí). Todo lo suyo es «puro»: no mira tipos ni defensas.
 *
 * Desde el 23-11-2026 (como la Gran Actualización del juego oficial, hecho aquí a
 * partir de sus novedades y de su guía de jefes):
 *   - La arena es la Sala del Origen: una plataforma de mármol y oro que flota
 *     sobre un mar de nubes, con columnas de luz y estrellas (world/tiles.js,
 *     tema 'origin'; el cielo lo pinta drawSky por debajo del suelo).
 *   - Ya no acuden legendarios. Arceus no se para a atacar: te persigue mientras
 *     lanza (te iguala al minuto 1, a los 3 es más rápido que tú y a los 10 va al
 *     140 %). Tocarle quita el 45 % y desde los 7 min cada vez más (KO a los 10).
 *   - Cada 30 s saca un ataque nuevo que se suma a los de antes (todos a los 2:30):
 *     Sentencia (pilares), Cruz Sagrada (rayos en cruz) y Onda Divina desde el
 *     principio; Velocidad Extrema (0:30, marca una franja y la cruza como un rayo),
 *     Premonición (1:00, estalla por donde acabas de pasar), Gravedad (1:30, 4 s al
 *     60 % de velocidad y sin embestir; él se queda quieto y cae una tanda de pilares
 *     tras otra), Hiperrayo (2:00, 16 rayos en abanico) y Sentencia de las Tablas
 *     (2:30, las 17 Tablas giran a su alrededor y disparan balas de cada tipo).
 *   - Aspas Doradas: desde los 5 min sus ruedas dan vueltas por un carril cerca del
 *     borde, con huecos para cruzar; a los 7, otro carril más dentro y al revés.
 *     Quitan el 35 % y te echan del carril.
 *   - No se huye: si te alejas, aparece delante de ti (avisa con un sello dorado), y
 *     también cada ~20 s. Si tiene que saltar a por ti 3 veces en 45 s, te arranca el
 *     ataque con el que huyes (Ataque Rápido, embestidas, Agilidad...) y te sujeta con
 *     un rayo dorado unos segundos (te quedas quieto; los demás lo ven, con un aviso).
 *   - El suelo se rompe: cada pocos segundos unas losas se llenan de grietas de luz y
 *     caen a las nubes, hasta el 30 % de la sala. Los agujeros no se pisan
 *     (world.js, VOID) y si estás encima cuando cae, duele.
 *   - Rompe tus objetos de uno en uno a los 2, 4, 6 y 8 minutos. Los que dan
 *     Pokémonedas las siguen dando al acabar. Contra él no valen la Banda Focus ni
 *     Robustez (player.js) y la reducción de daño rebaja sus ataques sólo un poco
 *     (hazards.js); tocarle quita siempre lo mismo.
 *   - En grupo: si caes y te levantan, no pasa nada; si vuelves a caer, Arceus se
 *     para a juzgarte delante de todos y ya no te pueden levantar (game.js, pl.judged).
 *
 * Mientras dura no sale nada más (ni oleadas, ni eventos, ni grietas; desde el
 * 28:00 ya no se abren grietas). Si a las 30:00 estás en una grieta o eligiendo
 * una carta, empieza al terminar.
 *
 * Cooperativo: lo decide el anfitrión. Mensajes (ver coop.js):
 *   'jd' cfg (empieza) · 'jk' (salta la animación) · 'jb' (va a romper un objeto)
 *   'jx' con lo nuevo: ['jx','h',[[i,j]...]] losas que se agrietan · ['jx','g'] Gravedad ·
 *   ['jx','p',ángulo] Tablas · ['jx','t',x,y,uid] sello del salto · ['jx','r',uid] te sujeta
 *   y te rompe el ataque · ['jx','m',uid,ataque] qué ataque ha roto (el invitado se lo dice
 *   al anfitrión con ['jx','m',ataque] y él lo cuenta a todos) · ['jx','j',uid] juzgado.
 *   Y en cada envío del anfitrión, ja: [x, y, animación, dirección, daño, reloj×10].
 *   Los avisos de los ataques van por G.Hazards ('hz').
 */
G.Judgment = (() => {
  const AT = 30 * 60;
  const ARENA_R = 24;                 // en tiles (la arena de la grieta: 11)
  const TOUCH = 0.45;                 // vida que quita tocar a Arceus
  /*
   * Contra la huida sin fin (18-10-2026: con toda la velocidad subida se
   * aguantaba hasta el minuto 60 corriendo en círculos): velocidad con tope suave
   * (lo que pase de 130 cuenta sólo un 25 %). Antes del minuto 30 no cambia nada.
   * Con la Gravedad de Arceus, además, al 60 %.
   */
  const SPD_SOFT = 130, SPD_OVER = 0.25, GRAV_SLOW = 0.6;
  const capSpd = s => (s <= SPD_SOFT ? s : SPD_SOFT + (s - SPD_SOFT) * SPD_OVER) * (grav > 0 ? GRAV_SLOW : 1);
  /** Su velocidad, × la tuya: te iguala al minuto 1, a los 3 es un 12 % más rápido y a los 10, un 40 %. */
  function speedK(t) {
    if (t < 60) return 0.82 + 0.18 * t / 60;
    if (t < 180) return 1 + 0.12 * (t - 60) / 120;
    if (t < 600) return 1.12 + 0.28 * (t - 180) / 420;
    return 1.4 + (t - 600) * 0.001;
  }
  /** Lo que quita tocarle: el 45 %, y desde los 7 min cada vez más (KO a los 10). */
  const touchAt = t => Math.min(1, TOUCH + Math.max(0, t - 420) / 180 * (1 - TOUCH));
  const touchPct = () => touchAt(arenaT);
  /*
   * Daño a Arceus: recibe el 5 % de lo que le hacéis, y cada vez menos (el 1 %
   * a los 10 min de Sentencia), para que el ranking no tenga números enormes.
   */
  const dmgK = () => 0.05 / (1 + arenaT / 150);
  // Sus ataques y desde cuándo (s de Sentencia): uno nuevo cada 30 s, todos a los 2:30.
  const MOVES = [
    { id: 'rain', at: 0, name: 'Sentencia' },
    { id: 'cross', at: 0, name: 'Cruz Sagrada' },
    { id: 'nova', at: 0, name: 'Onda Divina' },
    { id: 'extreme', at: 30, name: 'Velocidad Extrema' },
    { id: 'future', at: 60, name: 'Premonición' },
    { id: 'gravity', at: 90, name: 'Gravedad' },
    { id: 'hyper', at: 120, name: 'Hiperrayo' },
    { id: 'plates', at: 150, name: 'Sentencia de las Tablas' }
  ];
  const BREAKS = [120, 240, 360, 480];           // rompe un objeto (s de Sentencia); el 4.º, si llevas cuatro
  const BREAK_T = 1.6;                           // s de aviso
  // Aspas Doradas: carriles (radio en tiles), ruedas, vueltas (rad/s) y desde cuándo.
  const LANES = [{ at: 300, R: ARENA_R - 3.4, n: 7, w: 0.34, wr: 30 }, { at: 420, R: ARENA_R - 9.5, n: 5, w: -0.42, wr: 30 }];
  const BLADE_PCT = 0.35, BLADE_RISE = 1.4;
  // El suelo: losas de 2×2 casillas que se agrietan y caen, hasta el 30 % de la sala.
  const HOLE_FROM = 6, HOLE_MAX = 0.3, CRACK_T = 2.2, FALL_PCT = 0.2;
  // Saltos: si te alejas (o cada ~20 s) aparece delante de ti; 3 por huir en 45 s → te rompe el ataque.
  const BLINK_FAR = 460, BLINK_EVERY = 20, BLINK_GAP = 5, SEAL_T = 0.75, JUMPS = 3, JUMP_WIN = 45, HOLD_T = 2.6;
  const GRAV_T = 4, GRAV_VOLLEYS = [0.8, 2.0, 3.2];
  const PLATES_T = 4.5, BULLET_PCT = 0.12;
  const JUDGE_T = 3;                             // en grupo: lo que se para a juzgar al que cae dos veces
  // Las Tablas: una al azar en cada partida le da su tipo.
  const PLATES = {
    fire: 'Tabla Llama', water: 'Tabla Linfa', electric: 'Tabla Trueno', grass: 'Tabla Pradal',
    ice: 'Tabla Helada', fighting: 'Tabla Fuerte', poison: 'Tabla Tóxica', ground: 'Tabla Terrax',
    flying: 'Tabla Cielo', psychic: 'Tabla Mental', bug: 'Tabla Bicho', rock: 'Tabla Pétrea',
    ghost: 'Tabla Terror', dragon: 'Tabla Draco', dark: 'Tabla Oscura', steel: 'Tabla Acero', fairy: 'Tabla Duende'
  };
  const PLATE_TYPES = Object.keys(PLATES);
  /*
   * Quién protagoniza la Sentencia. Del 30-10 al 2-11 (systems/halloween.js), en
   * vez de Arceus, el gran Gengar bruja (sombrero y capa: core/skins.js), de
   * tipo Fantasma y sin Tablas, en las Ruinas del Juicio de antes; todo lo demás
   * igual. En grupo lo dice el anfitrión (cfg.hw), así todos ven el mismo.
   */
  const ARCEUS_B = { dex: 493, scale: 1.5, name: 'Arceus', skin: null, col: '#ffd25e', pale: '#fff3c8', glow: '#ffcf4a',
                     rgb: '255,210,94', rgb2: '255,248,220', t1: 'LA SENTENCIA', t2: 'DE ARCEUS', sub: 'El tiempo se ha agotado…',
                     landed: '¡ARCEUS HA DESCENDIDO!', dmg: 'DAÑO A ARCEUS · {x}', breaks: '¡Arceus va a romper vuestros objetos!',
                     gems: ['#ff6b4d', '#4fa8ff', '#5fe08a', '#ffe14d', '#b37bff', '#c9d2de'], arena: 'origin' };
  const GENGAR_B = { dex: 94, scale: 3, name: 'Gengar', skin: 'bruja-gengar', col: '#b46bff', pale: '#ffd9a8', glow: '#ff8a2a',
                     rgb: '180,107,255', rgb2: '255,200,140', t1: 'LA NOCHE', t2: 'DE GENGAR', sub: '¡Truco o trato!',
                     landed: '¡EL GRAN GENGAR HA LLEGADO!', dmg: 'DAÑO A GENGAR · {x}', breaks: '¡Gengar va a romper vuestros objetos!',
                     gems: ['#ff8a2a', '#ffd23f', '#b46bff', '#5fe08a', '#ff8a2a', '#c9a6ff'], arena: 'judgment' };
  let BOSS = ARCEUS_B;
  // Línea de tiempo de la animación (segundos).
  const T_TITLE = 1.3, T_FLASH = 4.7, T_PORT = 5.1, T_DESC = 5.7, T_LAND = 7.9, T_BACK = 9.1, T_END = 10.1;
  let GOLD = ARCEUS_B.col, PALE = ARCEUS_B.pale, GLOW = ARCEUS_B.glow;
  const PURPLE = '#c08cff', FUTURE = '#e07bff', DARK = '#3a2208';
  const authority = () => !G.Coop.active || G.Coop.isHost;
  const TS = () => G.Tiles.T * G.Sprites.PX;
  const keyOf = p => (p && p.uid) || 'me';

  let phase = null;                   // null | 'cine' | 'fight'
  let ct = 0;                         // reloj de la animación
  let cfg = null;                     // { tx, ty, pl, hw }
  let ported = false, landed = false, canSkip = false;
  let A = null;                       // Arceus
  let center = null;                  // centro de la arena (mundo)
  let arenaT = 0, downs = 0, dealt = 0, brk = 0, breakN = 0, shown = 0;
  // Cuándo empezó la pelea, con el reloj de la partida (25-11-2026): el «Ante Arceus» del resumen va con él. En
  // grupo, arenaT lo cuenta cada uno con su propio fotograma y podía salir más largo de lo que fue; el reloj de la
  // partida lo manda el anfitrión (como el juego oficial desde el 16-11).
  let fightAt = -1;
  let embers = [];
  let cineAnim = null;
  // Lo nuevo (23-11-2026)
  let slabs = [], slabMax = 0;        // losas que pueden caer (i, j) y cuántas como mucho
  let fallen = new Set(), cracks = [], falling = [], holeT = 0, holeSaid = false;
  let grav = 0, gravAt = -99, gravVol = 0, gravFx = 0;
  let plates = null, bullets = [];
  let blink = null;                   // { x, y, t, uid, flee }  sello dorado donde va a aparecer
  let jumps = new Map();              // uid -> instantes de los saltos por huir
  let held = new Map();               // uid -> s que le quedan sujeto (y dónde)
  let falls = new Map(), wasDead = new Map(), judged = new Set();
  let trails = new Map(), trailT = 0; // uid -> posiciones de los últimos ~3 s (Premonición y saltos)
  let columns = [], rays = [], ghosts = [], seals = [];
  let bladeCd = 0, lanesSaid = 0;
  let noBosses = false;               // (ya no hay legendarios; se deja para las pruebas de antes)
  // Daño a un solo enemigo por segundo (el que más recibe en cada segundo; con
  // ataques en área, sumar todo daría una vida enorme). Se guardan los últimos
  // 30 s y vale la media de los 6 mejores. (Lo usa Eternatus para su vida.)
  let hits = new Map(), hitT = 0, samples = [];

  function reset() {
    phase = null; ct = 0; cfg = null; ported = landed = canSkip = false;
    A = null; center = null; arenaT = 0; downs = 0; dealt = 0; brk = 0; breakN = 0; shown = 0; fightAt = -1;
    hits = new Map(); hitT = 0; samples = []; embers = []; cam = null;
    slabs = []; slabMax = 0; fallen = new Set(); cracks = []; falling = []; holeT = 0; holeSaid = false;
    grav = 0; gravAt = -99; gravVol = 0; gravFx = 0; plates = null; bullets = [];
    blink = null; jumps = new Map(); held = new Map(); falls = new Map(); wasDead = new Map(); judged = new Set();
    trails = new Map(); trailT = 0; columns = []; rays = []; ghosts = []; seals = []; bladeCd = 0; lanesSaid = 0;
  }

  /** Daño hecho a un enemigo (lo llama Enemy.hurt en quien manda). */
  function noteDmg(d, e) { if (!phase) hits.set(e.id, (hits.get(e.id) || 0) + d); }

  function sampleDps(dt) {
    hitT += dt;
    if (hitT < 1) return;
    let best = 0;
    for (const v of hits.values()) if (v > best) best = v;
    samples.push(best / hitT);
    if (samples.length > 30) samples.shift();
    hits.clear(); hitT = 0;
  }
  function singleDps() {
    const top = samples.slice().sort((a, b) => b - a).slice(0, 6);
    return top.length ? top.reduce((a, b) => a + b, 0) / top.length : 0;
  }

  // ---------------- arranque ----------------

  /** Quien manda: elige la arena y la Tabla, y avisa a todos. */
  function start() {
    // (Si la pelea con Eternatus sigue a las 30:00, se acaba sin premio: llega Arceus.)
    if (G.Eternatus.active) G.Eternatus.abort();
    const hw = G.Halloween.inRun ? 1 : 0;
    const c = { tx: -6000 - Math.floor(Math.random() * 2000), ty: -6000 - Math.floor(Math.random() * 2000),
                pl: hw ? 'ghost' : G.U.pick(PLATE_TYPES), hw };
    if (G.Coop.isHost) G.Coop.broadcast(['jd', c]);
    begin(c);
  }

  /** En cada ordenador: empieza la animación. */
  function begin(c) {
    if (phase) return;
    if (!PLATES[c.pl]) c.pl = 'fighting';
    BOSS = c.hw ? GENGAR_B : ARCEUS_B;
    GOLD = BOSS.col; PALE = BOSS.pale; GLOW = BOSS.glow;
    cfg = c;
    phase = 'cine'; ct = 0;
    G.Rift.hidePortal();            // (la grieta del mapa se va: entrar ahora abría la arena en plena Sentencia; 25-11-2026)
    const s = G.DB.save;
    // La primera vez se ve entera; en grupo la salta el anfitrión.
    canSkip = !!(s && s.stats && s.stats.judged > 0) && authority();
    G.Sprites.preload([BOSS.dex], 12000, false, BOSS.skin || '');
    cineAnim = new G.Sprites.Animator(BOSS.dex, 1);
    cineAnim.skin = BOSS.skin;
    G.Touch.reset();
    G.Audio.music(null);
  }

  /** Salta la animación (tecla o toque; en grupo, el anfitrión). */
  function skip() {
    if (phase !== 'cine' || !canSkip || ct >= T_BACK) return;
    if (G.Coop.isHost) G.Coop.broadcast(['jk']);
    doSkip();
  }
  function doSkip() {
    if (phase !== 'cine') return;
    if (!ported) port();
    land(true);
    ct = T_BACK;
  }

  /** Viaje a la arena (a mitad de la animación, tapado por el destello). */
  function port() {
    ported = true;
    const pl = G.Game.player, ts = TS();
    G.Rift.reset();
    // (25-11-2026: en quien no manda, sin quitar el blanco de Arceus si ya ha llegado: con el móvil lento o la
    //  pestaña escondida, la animación iba por detrás, se borraba al llegar aquí y sus golpes no contaban.)
    if (authority()) G.EnemyMgr.stash(); else G.EnemyMgr.clearRemote(e => e.arceus);
    G.Projectiles.clear();
    G.Combat.clearFields();
    G.Hazards.clear();
    G.Pickups.clear();
    G.Events.reset();
    G.Weather.clear();
    G.World.setArena({ tx: cfg.tx, ty: cfg.ty, r: ARENA_R, type: BOSS.arena });
    G.World.setBiome(G.Tiles.arenaBiome(BOSS.arena), true);
    center = { x: cfg.tx * ts + ts / 2, y: cfg.ty * ts + ts / 2 };
    const ps = G.Game.everyone();
    ps.forEach((p, i) => { p.x = center.x + (i - (ps.length - 1) / 2) * 34; p.y = center.y + ts * 3; });
    G.Camera.x = pl.x; G.Camera.y = pl.y;
    const anim = new G.Sprites.Animator(BOSS.dex, BOSS.scale);
    anim.skin = BOSS.skin;
    A = { x: center.x, y: center.y - ts * 5, lift: 900, anim, r: G.Sprites.bodyRadius(BOSS.dex, BOSS.scale) * 0.9,
          bodyH: G.Sprites.bodyHeight(BOSS.dex, BOSS.scale), cd: 2.2, cast: null, touchCd: 0, spin: 0,
          net: null, glow: 0, sinceBlink: 0, dash: null, judge: null, next: null, lastGrav: -99, lastPlates: -99 };
    anim.dir = 0;
    // Las losas que se pueden caer: las que caben enteras dentro de la sala.
    slabs = [];
    const lim = (ARENA_R - 1.2);
    for (let j = -13; j <= 13; j++) for (let i = -13; i <= 13; i++) {
      const x0 = 2 * i - 1, y0 = 2 * j - 1;
      if ([[x0, y0], [x0 + 2, y0], [x0, y0 + 2], [x0 + 2, y0 + 2]].every(([x, y]) => Math.hypot(x - 0.5, y - 0.5) < lim)) slabs.push([i, j]);
    }
    slabMax = Math.floor(slabs.length * HOLE_MAX);
  }

  /** Arceus toca el suelo. */
  function land(quiet = false) {
    if (landed || !A) return;
    landed = true;
    A.lift = 0;
    A.anim.play('Attack', { speed: 0.8 });
    if (quiet) return;
    G.Camera.kick(1.2);
    G.Game.flash(PALE, 0.7);
    G.Audio.sfx('land');
    for (let i = 0; i < 4; i++) G.FX.ring(A.x, A.y, 10 + i * 20, 260 + i * 140, i % 2 ? PALE : GOLD, 0.5 + i * 0.25, 8 - i);
    G.FX.burst(A.x, A.y - 20, GOLD, 60, 360);
    G.FX.burst(A.x, A.y - 10, '#ffffff', 30, 240);
  }

  /** Fin de la animación: empieza la pelea. */
  function fight() {
    phase = 'fight';
    if (!ported) port();
    land(true);
    arenaT = 0; downs = 0; shown = 0; holeT = HOLE_FROM;
    fightAt = G.Game.st.time;
    G.Progress.event('judge');
    if (BOSS === GENGAR_B) G.Spawner.say('¡El gran Gengar te ha arrastrado a su Noche Espectral!', 4, true);
    else G.Spawner.say(G.I18n.f('¡Arceus lleva la {x}! Ahora es de tipo {x}', G.T(PLATES[cfg.pl]), G.T(G.U.TYPE_NAME[cfg.pl])), 4, true);
    // Halloween: llegar hasta aquí da un buen puñado de caramelos (en grupo, a todos: los da el anfitrión).
    if (BOSS === GENGAR_B && authority()) G.Game.addCandy(G.Halloween.JUDGE);
    if (authority()) addTarget();
  }

  /*
   * El blanco de Arceus: un enemigo invisible que va siempre donde está él.
   * Así los ataques le dan como a cualquiera (y en cooperativo, los golpes de
   * los invitados llegan al anfitrión, que lleva la cuenta). No se mueve solo,
   * no hace daño al tocarle y no cae nunca (ver Enemy.hurt).
   */
  function addTarget() {
    const def = { dex: BOSS.dex, name: BOSS.name, hp: 1e9, spd: 0, dmg: 0, xp: 0, behavior: 'arceus' };
    const e = new G.Enemy(def, A.x, A.y, { hp: 1, spd: 1, dmg: 1 }, false);
    dress(e);
    e.update = function (dt) { if (A) { this.x = A.x; this.y = A.y; } if (this.flash > 0) this.flash -= dt; };
    G.EnemyMgr.add(e);
  }
  /** Lo que lo hace "Arceus" (también en la copia de los invitados). */
  function dress(e) {
    e.arceus = true; e.judge = true;
    e.types = [cfg ? cfg.pl : 'normal']; e.atkType = e.types[0];
    e.r = G.Sprites.bodyRadius(BOSS.dex, BOSS.scale) * 0.9;
    e.bodyH = G.Sprites.bodyHeight(BOSS.dex, BOSS.scale);
  }
  /** Un golpe a Arceus (en quien manda; ya viene reducido, ver dmgK). */
  function hitArceus(d) { if (phase === 'fight') dealt += d; }

  /** Manda un aviso a todos (quien manda) y lo aplica aquí. */
  function send(ev) {
    if (G.Coop.isHost) G.Coop.broadcast(ev);
    onEvent(ev);
  }

  // ---------------- objetos rotos ----------------

  /** A los 2, 4, 6 y 8 min: aviso y, al poco, se rompe un objeto de cada uno. */
  function startBreak() {
    if (brk > 0 || !A) return;
    brk = BREAK_T;
    G.Spawner.say(BOSS.breaks, 2.6, true);
    G.Audio.sfx('toll');
    A.anim.play('Charge', { speed: 0.7 });
    for (let i = 0; i < 3; i++) G.FX.ring(A.x, A.y, A.r, 380 + i * 260, i % 2 ? PALE : GOLD, BREAK_T * (0.6 + i * 0.2), 6 - i);
  }
  function shatter() {
    const pl = G.Game.player;
    G.Game.flash(PALE, 0.6);
    G.Camera.kick(0.9);
    G.Audio.sfx('land');
    if (A) G.FX.ring(A.x, A.y, 10, 1400, GOLD, 0.7, 8);
    if (!pl || !pl.item) return;
    // De uno en uno: el último que cogiste. Los que dan Pokémonedas (Moneda Amuleto, Amuleto Exp.,
    // Incienso Suerte) las siguen dando al acabar: se quita todo lo demás que hacían.
    const broken = pl.items[pl.items.length - 1];
    const coins = pl.coinMul;
    G.FX.dmgText(pl.x, pl.y - pl.bodyH - 16, G.I18n.f('¡Objeto roto: {x}!', G.T(G.Items.BY[broken].name)), '#ffd25e', true);
    G.FX.burst(pl.x, pl.y - pl.bodyH * 0.5, PALE, 26, 220);
    for (let i = 0; i < 8; i++) G.FX.px(pl.x, pl.y - pl.bodyH * 0.6, i % 2 ? GOLD : '#ffffff', { vx: G.U.rand(-120, 120), vy: G.U.rand(-200, -60), grav: 420, life: 0.9, size: 2 });
    pl.unequip(broken);
    pl.coinMul = coins;
  }

  // ---------------- cada fotograma ----------------

  /** Durante la animación (el resto del juego está parado). */
  function cineTick(dt) {
    const prev = ct;
    ct += dt;
    const at = x => prev < x && ct >= x;
    const pl = G.Game.player;
    if (cineAnim) cineAnim.update(dt);
    if (at(0.01)) { G.Audio.sfx('quake'); G.Camera.kick(0.9); }
    if (ct < T_FLASH && Math.random() < dt * 3) G.Camera.kick(0.15);
    if (at(T_TITLE)) G.Audio.sfx('toll');
    if (at(T_TITLE + 1.7)) G.Audio.sfx('toll');
    if (at(T_FLASH)) G.Game.flash('#ffffff', 0.9);
    if (at(T_PORT) && !ported) port();
    if (at(T_DESC)) G.Audio.sfx('descend');
    if (A && !landed) {
      // Bajada: lenta al principio y frenando al final (como si se posara).
      const k = G.U.clamp((ct - T_DESC) / (T_LAND - T_DESC), 0, 1);
      A.lift = 900 * Math.pow(1 - k, 2.2);
      A.anim.loop('Idle');
      if (ct > T_DESC && Math.random() < dt * 30) G.FX.px(A.x + G.U.rand(-60, 60), A.y - A.lift - G.U.rand(0, 200), Math.random() < 0.5 ? GOLD : PALE, { vy: G.U.rand(60, 160), life: 0.9 });
      if (at(T_LAND)) land();
    }
    if (A) { A.anim.update(dt); A.spin += dt; }
    // Cámara: tu Pokémon; sube despacio hacia Arceus mientras baja y vuelve.
    let tx = pl.x, ty = pl.y;
    if (ported && A && ct < T_BACK) { tx = A.x; ty = A.y - 60; }
    if (!cam || at(T_PORT) || (ported && !cam.ported)) cam = { x: G.Camera.x, y: G.Camera.y, ported };
    cam.x = G.U.damp(cam.x, tx, 2.2, dt); cam.y = G.U.damp(cam.y, ty, 2.2, dt);
    G.Camera.follow(cam.x, cam.y, dt);
    if (ct >= T_END) { cam = null; fight(); }
  }
  let cam = null;

  /** En la pelea (lo llama game.js en cada fotograma de juego). */
  function update(dt, pl, time) {
    if (!phase) {
      sampleDps(dt);                        // (para la vida de Eternatus)
      if (authority() && time >= AT && !G.Rift.inArena) {
        // Antes, 1 de cada 3 partidas en solitario: el Casino Rocket (systems/casino.js); la Sentencia espera.
        if (G.Casino && G.Casino.gate()) return;
        start();
      }
      return;
    }
    if (phase !== 'fight') return;
    arenaT += dt;
    A.touchCd -= dt; A.spin += dt;
    if (brk > 0 && (brk -= dt) <= 0) shatter();
    if (grav > 0) grav = Math.max(0, grav - dt);
    if (gravFx > 0) gravFx = Math.max(0, gravFx - dt);
    if (authority()) {
      arceusTick(dt);
      hostTick(dt);
      keepInside();
    } else netTick(dt);
    newMoves();
    floorTick(dt, pl);
    platesTick(dt, pl);
    bladesTick(dt, pl);
    holdTick(dt, pl);
    keepMeInside(pl);
    A.anim.update(dt);
    touch(pl);
    ember(dt);
    for (const list of [columns, rays, ghosts, seals]) for (let i = list.length - 1; i >= 0; i--) if ((list[i].t += dt) >= list[i].life) list.splice(i, 1);
  }

  /** Avisos de lo nuevo (en cada ordenador, con su reloj): ataques, Aspas. */
  function newMoves() {
    for (const m of MOVES) {
      if (m.at <= 0 || m.at > arenaT || shown >= m.at) continue;
      shown = m.at;
      G.Spawner.say(G.I18n.f('¡Nuevo ataque de {x}: {x}!', BOSS.name, G.T(m.name)), 2.4, true);
      G.Audio.sfx('toll');
      if (authority() && A) A.next = m.id;            // lo estrena al momento
    }
    for (let i = lanesSaid; i < LANES.length; i++) {
      if (arenaT < LANES[i].at - 2) break;
      lanesSaid = i + 1;
      G.Spawner.say(i ? '¡Otro carril de Aspas Doradas, más dentro y al revés!' : '¡Aspas Doradas! Cruza el carril por los huecos', 3, true);
      G.Audio.sfx('toll');
    }
  }

  // ---------------- Arceus ----------------

  function target() {
    let best = null, bd = Infinity;
    for (const p of G.Game.everyone()) {
      if (p.dead || p.silent) continue;              // (ni el compañero sin conexión: coop.js)
      const d = G.U.dist2(p.x, p.y, A.x, A.y);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  /** Quien manda: lo que no es Arceus moviéndose (suelo, objetos, caídas, rastro). */
  function hostTick(dt) {
    // Objetos rotos a los 2, 4, 6 y 8 min.
    if (breakN < BREAKS.length && arenaT >= BREAKS[breakN]) { breakN++; send(['jb']); }
    // Rastro de cada uno (cada 0,2 s, los últimos 3,2 s).
    if ((trailT -= dt) <= 0) {
      trailT = 0.2;
      for (const p of G.Game.everyone()) {
        const k = keyOf(p);
        let tr = trails.get(k);
        if (!tr) trails.set(k, tr = []);
        tr.push({ x: p.x, y: p.y, t: arenaT });
        if (tr.length > 16) tr.shift();
      }
    }
    // El suelo se rompe: unas losas cada pocos segundos (cada vez más deprisa y más a la vez).
    // (Sólo en la Sala del Origen: las Ruinas del gran Gengar no flotan sobre nada.)
    if (BOSS.arena === 'origin' && arenaT >= HOLE_FROM && (holeT -= dt) <= 0) {
      holeT = Math.max(2.2, 4 - arenaT / 150);
      const n = 1 + (arenaT > 120 ? 1 : 0) + (arenaT > 300 ? 1 : 0);
      const pick = pickSlabs(n);
      if (pick.length) send(['jx', 'h', pick]);
    }
    // En grupo: quien cae por segunda vez es juzgado (ya no le levantan).
    if (G.Coop.active) {
      for (const p of G.Game.everyone()) {
        const k = keyOf(p), was = !!wasDead.get(k);
        if (p.dead && !was) {
          const n = (falls.get(k) || 0) + 1;
          falls.set(k, n);
          if (n >= 2 && !judged.has(k)) send(['jx', 'j', k]);
        }
        wasDead.set(k, !!p.dead);
      }
    }
    // Gravedad: una tanda de pilares tras otra mientras dura.
    if (grav > 0 && gravVol < GRAV_VOLLEYS.length && GRAV_T - grav >= GRAV_VOLLEYS[gravVol]) {
      gravVol++;
      // (25-11-2026, como el juego oficial desde el 16-11: primero su animación de gravedad y luego otra en cada tanda.)
      if (A && A.anim && !A.judge) A.anim.play('Shoot', { speed: 1.2 });
      for (const p of G.Game.everyone()) {
        if (p.dead) continue;
        for (let i = 0; i < 4; i++) {
          const a = Math.random() * 6.2832, d = i ? G.U.rand(40, 120) : 0;
          H({ kind: 'zone', x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d * 0.8, r: 46, delay: 0.85 + i * 0.06, pct: 0.28, vis: 'gpillar', color: PURPLE });
        }
      }
    }
  }

  /** Losas que se agrietan: junto a un agujero (para que se abran simas) o al azar. */
  function pickSlabs(n) {
    const out = [];
    const busy = k => fallen.has(k) || cracks.some(c => c.k === k) || out.some(o => o[0] + ',' + o[1] === k);
    for (let tries = 0; out.length < n && tries < 40; tries++) {
      if (fallen.size + cracks.length + out.length >= slabMax) break;
      let s;
      if (fallen.size && Math.random() < 0.55) {
        const keys = [...fallen];
        const [i, j] = keys[Math.floor(Math.random() * keys.length)].split(',').map(Number);
        const [di, dj] = G.U.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
        s = [i + di, j + dj];
        if (!slabs.some(o => o[0] === s[0] && o[1] === s[1])) continue;
      } else s = slabs[Math.floor(Math.random() * slabs.length)];
      if (!s || busy(s[0] + ',' + s[1])) continue;
      out.push([s[0], s[1]]);
    }
    return out;
  }

  /** Rectángulo de una losa en el mundo: { x0, y0, s } (s = lado). */
  function slabRect(i, j) {
    const ts = TS();
    return { x0: (cfg.tx + 2 * i - 1) * ts, y0: (cfg.ty + 2 * j - 1) * ts, s: 2 * ts };
  }

  /** En cada ordenador: las grietas avanzan y la losa cae (y duele si estás encima). */
  function floorTick(dt, pl) {
    for (let n = cracks.length - 1; n >= 0; n--) {
      const c = cracks[n];
      c.t += dt;
      if (c.t < CRACK_T) continue;
      cracks.splice(n, 1);
      fallen.add(c.k);
      const ts = TS(), r = slabRect(c.i, c.j);
      for (let b = 0; b < 2; b++) for (let a = 0; a < 2; a++) G.World.setHole(cfg.tx + 2 * c.i - 1 + a, cfg.ty + 2 * c.j - 1 + b);
      falling.push({ x: r.x0, y: r.y0, s: r.s, t: 0, rot: G.U.rand(-0.6, 0.6) });
      if (G.Camera.sees(r.x0 + ts, r.y0 + ts, 80)) { G.Audio.sfx('break'); G.Camera.kick(0.15); }
      for (let i = 0; i < 10; i++) G.FX.px(r.x0 + Math.random() * r.s, r.y0 + Math.random() * r.s, i % 3 ? '#e8e0cc' : GOLD, { vx: G.U.rand(-40, 40), vy: G.U.rand(20, 90), grav: 300, life: 0.7, size: 2 });
      // ¿Estabas encima? Duele y te deja en el suelo más cercano.
      if (pl && !pl.dead && pl.x > r.x0 - pl.r * 0.4 && pl.x < r.x0 + r.s + pl.r * 0.4 && pl.y > r.y0 - pl.r * 0.4 && pl.y < r.y0 + r.s + pl.r * 0.4) {
        pl.invuln = 0;
        pl.hurt(pl.maxHp * FALL_PCT * redOf(pl), null, true);
        ground(pl);
      }
    }
    for (let n = falling.length - 1; n >= 0; n--) if ((falling[n].t += dt) > 1.6) falling.splice(n, 1);
    // Por si acaso (un empujón, un compañero que llega tarde): nadie se queda sobre el vacío.
    if (pl && !pl.dead && G.World.isVoid(pl.x, pl.y)) ground(pl);
  }

  /** Lleva a p al trozo de suelo más cercano (fuera de los agujeros). */
  function ground(p) {
    const max = (ARENA_R - 1.6) * TS();
    for (let r = 0; r <= 420; r += 14) {
      const n = r ? Math.max(8, Math.round(r / 9)) : 1;
      for (let k = 0; k < n; k++) {
        const a = k * 6.2832 / n + r * 0.1;
        const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r;
        if (Math.hypot(x - center.x, y - center.y) > max) continue;
        if (G.World.isFree(x, y, (p.r || 12) * 0.8)) { p.x = x; p.y = y; return; }
      }
    }
    p.x = center.x; p.y = center.y;
  }

  /** La reducción de daño rebaja sus ataques, pero poco (como hazards.js). */
  const redOf = p => 1 - Math.min(0.8, p.reduction || 0) * 0.375;

  function arceusTick(dt) {
    A.sinceBlink += dt;
    // Juzgando a alguien (en grupo): quieto, cargando, hasta que acaba.
    if (A.judge) {
      A.judge.t += dt;
      A.anim.loop('Idle');
      if (A.judge.t >= JUDGE_T) A.judge = null;
      return;
    }
    // Velocidad Extrema: cruza la franja como un rayo.
    if (A.dash) {
      const d = A.dash;
      d.t += dt;
      const k = Math.min(1, d.t / d.T);
      const ox = A.x, oy = A.y;
      A.x = d.sx + (d.ex - d.sx) * k; A.y = d.sy + (d.ey - d.sy) * k;
      ghosts.push({ x: ox, y: oy, dir: A.anim.dir, t: 0, life: 0.35 });
      if (k >= 1) A.dash = null;
      return;
    }
    const tg = target();
    if (!tg) { A.anim.loop('Idle'); return; }
    // El sello del salto: quieto hasta aparecer allí.
    if (blink) {
      blink.t += dt;
      A.anim.loop('Idle');
      if (blink.t >= SEAL_T) appear();
      return;
    }
    const c = A.cast;
    if (c) castTick(dt, tg);
    // ¿Huyes? Aparece delante de ti (y cada ~20 s aunque no huyas).
    const far = G.U.dist(A.x, A.y, tg.x, tg.y);
    if (!c && grav <= 0 && ((far > BLINK_FAR && A.sinceBlink > BLINK_GAP) || A.sinceBlink > BLINK_EVERY)) { startBlink(tg, far > BLINK_FAR); return; }
    // Te persigue sin pararse (salvo con la Gravedad y mientras marca la Velocidad Extrema);
    // con los rayos y la onda, más despacio.
    const still = grav > 0 || (c && c.id === 'extreme');
    const slow = c && (c.id === 'cross' || c.id === 'hyper' || c.id === 'nova') ? 0.45 : 1;
    if (!still) {
      // (Un compañero: su velocidad de verdad, que manda su juego; su copia aquí no lleva sus cartas ni mejoras y
      //  Arceus le perseguía más despacio de lo que corría. 25-11-2026.)
      const tsp = tg.remote && tg.net && tg.net.sp > 0 ? tg.net.sp : tg.spd;
      const spd = Math.max(70, (tsp || 100) * speedK(arenaT)) * slow;
      const [dx, dy] = G.U.norm(tg.x - A.x, tg.y - A.y);
      A.x += dx * spd * dt; A.y += dy * spd * dt;
      A.anim.dir = G.Sprites.dirFromAngle(Math.atan2(dy, dx));
      A.anim.loop('Walk', Math.max(0.8, spd / 90));
    } else A.anim.loop('Idle');
    if (Math.random() < dt * 14) G.FX.px(A.x + G.U.rand(-20, 20), A.y - G.U.rand(0, A.bodyH), GOLD, { vy: -30, life: 0.6 });
    if (c) return;
    A.cd -= dt;
    if (A.cd <= 0 && grav <= 0) cast(choose(tg), tg);
  }

  /** Qué ataque toca: uno de los que ya tiene (el recién estrenado, primero). */
  function choose(tg) {
    if (A.next) { const n = A.next; A.next = null; return n; }
    const d = G.U.dist(A.x, A.y, tg.x, tg.y);
    if (d < 200 && Math.random() < 0.55 && A.last !== 'nova') return 'nova';
    const pool = MOVES.filter(m => m.at <= arenaT && m.id !== 'nova' && m.id !== A.last &&
      !(m.id === 'gravity' && arenaT - A.lastGrav < 14) && !(m.id === 'plates' && arenaT - A.lastPlates < 10));
    // Los nuevos salen algo más a menudo que los de siempre.
    const w = pool.map(m => 1 + m.at / 90);
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) if ((r -= w[i]) <= 0) return pool[i].id;
    return 'rain';
  }

  const H = o => G.Hazards.add(Object.assign({ type: null, pure: true, dmg: 1, color: GOLD }, o));

  /** Ataques de Arceus: todos avisan en el suelo y quitan un % de la vida. */
  function cast(id, tg) {
    A.last = id;
    const c = A.cast = { id, t: 0, wind: 0.6 };
    const alive = G.Game.everyone().filter(p => !p.dead);
    if (id === 'rain') {
      // La Sentencia: pilares de luz sobre cada uno (más cuanto más dura).
      const n = 4 + Math.min(6, Math.floor(arenaT / 10));
      for (const p of alive) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.2832, d = i ? G.U.rand(40, 150) : 0;
          H({ kind: 'zone', x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d * 0.8, r: 44, delay: 0.95 + i * 0.07, pct: 0.3, vis: 'pillar' });
        }
      }
      A.anim.play('Shoot', { speed: 0.9 });
    } else if (id === 'cross') {
      // Cruz Sagrada: rayos en cruz hasta el borde (8 desde los 0:30).
      const a0 = Math.atan2(tg.y - A.y, tg.x - A.x) + (Math.random() < 0.5 ? 0 : Math.PI / 4);
      const n = arenaT > 30 ? 8 : 4;
      for (let i = 0; i < n; i++) H({ kind: 'beam', x: A.x, y: A.y, angle: a0 + i * 6.2832 / n, len: 1700, w: 34, delay: 0.85, pct: 0.35, color: '#fff3b0', vis: 'ray' });
      c.wind = 0.85;
      A.anim.play('Charge', { speed: 0.9 });
    } else if (id === 'extreme') {
      // Velocidad Extrema: marca una franja hacia ti hasta el borde y la cruza como un rayo.
      const a = Math.atan2(tg.y - A.y, tg.x - A.x);
      const len = edgeDist(A.x, A.y, a);
      H({ kind: 'beam', x: A.x, y: A.y, angle: a, len, w: 70, delay: 0.75, pct: 0.35, color: '#fff8d8', vis: 'xspeed' });
      c.wind = 0.75; c.dash = { sx: A.x, sy: A.y, ex: A.x + Math.cos(a) * len, ey: A.y + Math.sin(a) * len };
      A.anim.dir = G.Sprites.dirFromAngle(a);
      A.anim.play('Charge', { speed: 1.2 });
    } else if (id === 'future') {
      // Premonición: estalla por donde acabas de pasar (hace entre 0,6 y 2,4 s).
      for (const p of alive) {
        const tr = trails.get(keyOf(p)) || [];
        const past = tr.filter(o => arenaT - o.t >= 0.6 && arenaT - o.t <= 2.4);
        past.forEach((o, i) => H({ kind: 'zone', x: o.x, y: o.y, r: 50, delay: 1.0 + i * 0.1, pct: 0.25, vis: 'future', color: FUTURE }));
      }
      c.wind = 0.9;
      A.anim.play('Charge', { speed: 1 });
    } else if (id === 'gravity') {
      // Gravedad: 4 s al 60 % y sin embestir; él quieto y una tanda de pilares tras otra (hostTick).
      A.lastGrav = arenaT;
      send(['jx', 'g']);
      c.wind = GRAV_T;
      A.anim.play('Charge', { speed: 0.6 });
    } else if (id === 'hyper') {
      // Hiperrayo: 16 rayos en abanico que barren un cuarto de la sala, uno tras otro.
      const a0 = Math.atan2(tg.y - A.y, tg.x - A.x) + (Math.random() < 0.5 ? -1 : 1) * Math.PI / 4;
      const dir = a0 > Math.atan2(tg.y - A.y, tg.x - A.x) ? -1 : 1;
      for (let i = 0; i < 16; i++) H({ kind: 'beam', x: A.x, y: A.y, angle: a0 + dir * i * (Math.PI / 2) / 15, len: 1700, w: 38, delay: 0.7 + i * 0.05, pct: 0.3, color: '#ffe9a0', vis: 'ray' });
      c.wind = 1.5;
      A.anim.play('Charge', { speed: 0.8 });
    } else if (id === 'plates') {
      // Sentencia de las Tablas: las 17 giran a su alrededor y disparan balas de cada tipo.
      A.lastPlates = arenaT;
      send(['jx', 'p', Math.round(Math.random() * 628) / 100]);
      c.wind = PLATES_T;
      A.anim.play('Shoot', { speed: 0.7 });
    } else {
      // Onda Divina: onda a su alrededor (si estás demasiado cerca).
      H({ kind: 'zone', x: A.x, y: A.y, r: 170, delay: 0.7, pct: 0.4, vis: 'nova' });
      c.wind = 0.7;
      A.anim.play('Charge', { speed: 1.2 });
    }
    G.FX.ring(A.x, A.y, A.r, A.r * 3, GOLD, Math.min(1.2, c.wind), 3);
  }

  /** Distancia de (x, y) hasta el borde de la sala en la dirección a. */
  function edgeDist(x, y, a) {
    const R = (ARENA_R - 1.5) * TS(), dx = Math.cos(a), dy = Math.sin(a);
    const ox = x - center.x, oy = y - center.y;
    const b = ox * dx + oy * dy, c = ox * ox + oy * oy - R * R;
    return Math.max(60, -b + Math.sqrt(Math.max(0, b * b - c)));
  }

  function castTick(dt, tg) {
    const c = A.cast;
    c.t += dt;
    if (tg && c.id !== 'extreme') A.anim.dir = G.Sprites.dirFromAngle(Math.atan2(tg.y - A.y, tg.x - A.x));
    if (c.t >= c.wind && !c.done) {
      c.done = true;
      if (c.dash) { A.dash = Object.assign({ t: 0, T: 0.18 }, c.dash); G.Audio.sfx('judge'); }
      A.anim.play(c.id === 'nova' ? 'Attack' : 'Shoot', { speed: 1.2 });
    }
    if (c.t >= c.wind + 0.25) {
      A.cast = null;
      // Ataca más seguido cuanto más dura.
      A.cd = Math.max(0.9, 2.2 - arenaT * 0.008);
    }
  }

  // --- saltos: aparece delante de ti ---

  function startBlink(tg, flee) {
    const k = keyOf(tg);
    const tr = trails.get(k) || [];
    let vx = 0, vy = 0;
    if (tr.length >= 3) { const a = tr[tr.length - 3], b = tr[tr.length - 1]; vx = b.x - a.x; vy = b.y - a.y; }
    let dir = Math.hypot(vx, vy) > 12 ? Math.atan2(vy, vx) : Math.atan2(center.y - tg.y, center.x - tg.x);
    const max = (ARENA_R - 2.2) * TS();
    let x = tg.x + Math.cos(dir) * 170, y = tg.y + Math.sin(dir) * 170;
    const d = Math.hypot(x - center.x, y - center.y);
    if (d > max) { x = center.x + (x - center.x) / d * max; y = center.y + (y - center.y) / d * max; }
    const o = { x, y, r: A.r };
    if (G.World.isVoid(x, y)) ground(o);
    send(['jx', 't', Math.round(o.x), Math.round(o.y), k, flee ? 1 : 0]);
  }

  /** Quien manda: Arceus aparece en el sello. Los saltos por huir se cuentan. */
  function appear() {
    const b = blink;
    blink = null;
    ghosts.push({ x: A.x, y: A.y, dir: A.anim.dir, t: 0, life: 0.4 });
    A.x = b.x; A.y = b.y; A.sinceBlink = 0; A.cd = Math.max(A.cd, 0.6);
    A.anim.play('Attack', { speed: 1.2 });
    flashAt(b.x, b.y);
    if (!b.flee) return;
    const l = (jumps.get(b.uid) || []).filter(t => arenaT - t < JUMP_WIN);
    l.push(arenaT);
    jumps.set(b.uid, l);
    if (l.length >= JUMPS) { jumps.set(b.uid, []); send(['jx', 'r', b.uid]); }
  }
  function flashAt(x, y) {
    G.FX.ring(x, y, 6, 150, PALE, 0.45, 6);
    G.FX.burst(x, y - 30, GOLD, 24, 220);
    if (G.Camera.sees(x, y, 100)) { G.Audio.sfx('judge'); G.Camera.kick(0.3); }
  }

  /** Invitado: Arceus va a donde dice el anfitrión. */
  function netTick(dt) {
    const n = A.net;
    if (!n) return;
    const ox = A.x, oy = A.y;
    if (G.U.dist2(A.x, A.y, n.x, n.y) > 300 * 300) {
      ghosts.push({ x: A.x, y: A.y, dir: A.anim.dir, t: 0, life: 0.4 });
      A.x = n.x; A.y = n.y;
      if (blink) { blink = null; flashAt(A.x, A.y); }
    } else { A.x = G.U.damp(A.x, n.x, 10, dt); A.y = G.U.damp(A.y, n.y, 10, dt); }
    if (blink && (blink.t += dt) > SEAL_T + 1) blink = null;
    A.anim.dir = n.dir;
    if (n.anim !== A.lastNetAnim) {
      A.lastNetAnim = n.anim;
      const a = G.Coop.ANIMS[n.anim];
      if (a === 'Charge' || a === 'Shoot' || a === 'Attack') A.anim.play(a);
    }
    A.anim.loop(Math.abs(A.x - ox) + Math.abs(A.y - oy) > 0.5 ? 'Walk' : 'Idle');
  }

  /** Tocar a Arceus (cada uno mira el suyo). */
  function touch(pl) {
    if (!pl || pl.dead || A.touchCd > 0 || A.dash) return;
    const rr = A.r + pl.r;
    if (G.U.dist2(A.x, A.y, pl.x, pl.y) > rr * rr) return;
    A.touchCd = 0.9;
    pl.invuln = 0;
    pl.hurt(pl.maxHp * touchPct(), null, true);
    G.Camera.kick(0.6);
    G.FX.ring(pl.x, pl.y, 6, 70, GOLD, 0.4, 4);
    if (authority()) A.anim.play('Attack', { speed: 1.4 });
  }

  /** Nadie sale de la arena (Arceus y tú). */
  function keepInside() {
    const ts = TS(), max = (ARENA_R - 1.4) * ts;
    const clampIn = o => {
      const dx = o.x - center.x, dy = o.y - center.y, d = Math.hypot(dx, dy);
      if (d > max) { o.x = center.x + dx / d * max; o.y = center.y + dy / d * max; }
    };
    clampIn(A);
    for (const e of G.EnemyMgr.all()) if (!e.remote) clampIn(e);
  }
  // Y tú (25-10-2026): sólo te frenaban las paredes, y quien se salía de la
  // arena (yendo muy rápido) ya no podía ser alcanzado: aguantaba para siempre.
  // Cada juego, con su jugador (también los invitados).
  function keepMeInside(pl) {
    if (!pl || !center) return;
    const max = (ARENA_R - 1.4) * TS(), dx = pl.x - center.x, dy = pl.y - center.y, d = Math.hypot(dx, dy);
    if (d > max) { pl.x = center.x + dx / d * max; pl.y = center.y + dy / d * max; }
  }

  // ---------------- Tablas, Aspas, sujetar ----------------

  /** Sentencia de las Tablas: giran alrededor de Arceus y disparan; cada uno mira las balas contra el suyo. */
  function platesTick(dt, pl) {
    if (plates) {
      plates.t += dt;
      if ((plates.fire -= dt) <= 0 && plates.t < PLATES_T - 0.3) {
        plates.fire = 0.16;
        for (const i of [plates.n % 17, (plates.n + 8) % 17]) {
          const a = plateAngle(i), x = A.x + Math.cos(a) * 74, y = A.y - A.bodyH * 0.45 + Math.sin(a) * 50;
          bullets.push({ x, y: y + A.bodyH * 0.45, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, type: PLATE_TYPES[i], t: 0 });
        }
        plates.n++;
      }
      if (plates.t >= PLATES_T) plates = null;
    }
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.t += dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.t > 3.6) { bullets.splice(i, 1); continue; }
      if (pl && !pl.dead && G.U.dist2(b.x, b.y, pl.x, pl.y) < (9 + pl.r * 0.8) ** 2) {
        pl.invuln = 0;
        pl.hurt(pl.maxHp * BULLET_PCT * redOf(pl), null, true);
        G.FX.burst(b.x, b.y - 10, G.U.TYPE_COLOR[b.type], 8, 120);
        bullets.splice(i, 1);
      }
    }
  }
  const plateAngle = i => plates.a0 + plates.t * 1.7 + i * 6.2832 / 17;

  /** Dónde está cada rueda de las Aspas ahora: [{ x, y, r, k (0..1 al salir), lane }]. */
  function blades() {
    const out = [];
    if (!center) return out;
    const ts = TS();
    LANES.forEach((L, li) => {
      if (arenaT < L.at) return;
      const k = Math.min(1, (arenaT - L.at) / BLADE_RISE);
      for (let n = 0; n < L.n; n++) {
        const a = L.w * (arenaT - L.at) + n * 6.2832 / L.n + li * 0.4;
        out.push({ x: center.x + Math.cos(a) * L.R * ts, y: center.y + Math.sin(a) * L.R * ts, r: L.wr * (0.3 + 0.7 * k), k, lane: li, a });
      }
    });
    return out;
  }

  /** Aspas Doradas: quitan el 35 % y te echan del carril (cada uno, el suyo). */
  function bladesTick(dt, pl) {
    if (bladeCd > 0) bladeCd -= dt;
    if (!pl || pl.dead || bladeCd > 0 || arenaT < LANES[0].at) return;
    const ts = TS();
    for (const b of blades()) {
      if (b.k < 0.85 || G.U.dist2(b.x, b.y, pl.x, pl.y) > (b.r + pl.r * 0.8) ** 2) continue;
      bladeCd = 0.9;
      pl.invuln = 0;
      pl.hurt(pl.maxHp * BLADE_PCT * redOf(pl), null, true);
      G.Camera.kick(0.5);
      G.FX.burst(pl.x, pl.y - 10, GOLD, 14, 200);
      // Fuera del carril: hacia el lado más cercano (dentro o fuera).
      const L = LANES[b.lane], R = L.R * ts, dx = pl.x - center.x, dy = pl.y - center.y, d = Math.hypot(dx, dy) || 1;
      const out = d >= R ? R + L.wr + pl.r + 10 : R - L.wr - pl.r - 10;
      const to = Math.min(out, (ARENA_R - 1.6) * ts);
      pl.x = center.x + dx / d * to; pl.y = center.y + dy / d * to;
      if (!G.World.isFree(pl.x, pl.y, pl.r * 0.8)) ground(pl);
      G.FX.ring(pl.x, pl.y, 6, 60, PALE, 0.35, 3);
      break;
    }
  }

  /** Sujetos por el rayo dorado: tú te quedas quieto mientras dura. */
  function holdTick(dt, pl) {
    for (const [k, h] of held) if ((h.t -= dt) <= 0) held.delete(k);
    const h = pl && held.get(keyOf(pl));
    if (h && !pl.dead) { pl.x = h.x; pl.y = h.y; pl.walking = false; }
  }

  /** Movimientos con los que se huye: embestidas, Agilidad y los que te mueven. */
  const fleeMove = m => !!m && (m.kind === 'dash' || (m.kind === 'buff' && m.stat === 'spd') || !!m.moves || !!m.flee);

  /** En el ordenador de quien ha saltado tres veces: le arranca el ataque con el que huye. */
  function rip(pl) {
    const act = pl.activeGroup();
    const m = act.find(fleeMove) || pl.moves.find(fleeMove);
    if (!m) return null;
    pl.moves.splice(pl.moves.indexOf(m), 1);
    const g = pl.slots.find(s => s.includes(m));
    if (g) {
      g.splice(g.indexOf(m), 1);
      if (!g.length) {
        const cur = pl.slots[pl.active], i = pl.slots.indexOf(g);
        pl.slots.splice(i, 1);
        pl.active = Math.max(0, cur === g ? Math.min(i, pl.slots.length - 1) : pl.slots.indexOf(cur));
      }
    }
    if (pl.banned) pl.banned.add(m.id);              // (y no vuelve a salir en las cartas)
    G.Projectiles.clearOrbs(pl);
    return m.id;
  }

  /** Nombre de un jugador para los avisos (tú, o un compañero). */
  function nameOf(uid) {
    const p = G.Game.everyone().find(o => keyOf(o) === uid);
    if (!p) return '?';
    if (!p.remote) return (G.Social && G.Social.me && G.Social.me.name) || G.T(p.mon.name);
    return p.tag || G.T(p.mon.name);
  }
  const isMe = uid => keyOf(G.Game.player) === uid;
  const moveName = id => G.T((G.Moves.BY_ID[id] || {}).name || id);

  /** Aviso de lo que ha roto (en cada ordenador, en su idioma). */
  function ripNote(uid, id) {
    if (isMe(uid)) G.Spawner.say(id ? G.I18n.f('¡Arceus te ha roto {x}!', moveName(id)) : '¡Arceus te sujeta con un rayo dorado!', 3, true);
    else G.Spawner.say(id ? G.I18n.f('¡Arceus le ha roto a {x} su {x}!', nameOf(uid), moveName(id)) : G.I18n.f('¡Arceus sujeta a {x}!', nameOf(uid)), 3, true);
  }

  // ---------------- dibujo ----------------

  /** Arceus, ordenado por Y con el resto de la escena. */
  function drawable() {
    if (!A || !ported) return null;
    return { y: A.y, draw: drawArceus };
  }

  function drawArceus(ctx) {
    const lift = A.lift;
    const now = performance.now() / 1000;
    // Sombra que crece mientras baja.
    const near = G.U.clamp(1 - lift / 900, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.15 + near * 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(A.x, A.y, 44 * (0.4 + near * 0.6), 16 * (0.4 + near * 0.6), 0, 0, 6.2832); ctx.fill();
    // Aura dorada en el suelo.
    if (lift < 40) {
      ctx.globalAlpha = 0.22 + Math.sin(now * 3) * 0.06;
      ctx.fillStyle = (cfg && G.U.TYPE_COLOR[cfg.pl]) || GOLD;    // del color de su Tabla
      ctx.beginPath(); ctx.ellipse(A.x, A.y, A.r * 2.2, A.r * 0.8, 0, 0, 6.2832); ctx.fill();
    }
    ctx.restore();
    // Estelas de los saltos y de la Velocidad Extrema.
    for (const g of ghosts) {
      const dir = A.anim.dir;
      A.anim.dir = g.dir;
      A.anim.draw(ctx, g.x, g.y, { flash: true, alpha: 0.45 * (1 - g.t / g.life) });
      A.anim.dir = dir;
    }
    // La rueda dorada detrás de él (gira más deprisa cuando ataca).
    const fast = A.cast || grav > 0 ? 2.4 : 0.6;
    wheel(ctx, A.x, A.y - lift - A.bodyH * 0.55, A.bodyH * 0.62, A.spin * fast, A.cast ? 0.8 : 0.55);
    A.anim.draw(ctx, A.x, A.y - lift);
  }

  /** La rueda de Arceus: aro dorado con 12 joyas que gira. */
  function wheel(ctx, x, y, R, rot, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = GOLD; ctx.lineWidth = Math.max(2, R * 0.07);
    ctx.shadowColor = GLOW; ctx.shadowBlur = R * 0.3;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.stroke();
    ctx.lineWidth = Math.max(1, R * 0.025);
    ctx.beginPath(); ctx.arc(0, 0, R * 0.82, 0, 6.2832); ctx.stroke();
    const GEMS = BOSS.gems;
    for (let i = 0; i < 12; i++) {
      const a = i * 6.2832 / 12;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = GEMS[i % GEMS.length];
      ctx.beginPath(); ctx.moveTo(R * 1.02, 0); ctx.lineTo(R * 0.91, -R * 0.07); ctx.lineTo(R * 0.8, 0); ctx.lineTo(R * 0.91, R * 0.07); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // --- el cielo de la Sala del Origen (por debajo del suelo, en pantalla) ---

  let stars = null, cloudCv = null;
  function cloudTile() {
    if (cloudCv) return cloudCv;
    const S = 512, cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const c = cv.getContext('2d');
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let n = 0; n < 70; n++) {
      const x = rnd() * S, y = rnd() * S, r = 30 + rnd() * 70, dark = rnd() < 0.35;
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        const g = c.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        g.addColorStop(0, dark ? 'rgba(150,128,200,0.5)' : 'rgba(255,246,255,0.55)');
        g.addColorStop(0.6, dark ? 'rgba(120,100,180,0.22)' : 'rgba(236,222,255,0.25)');
        g.addColorStop(1, 'rgba(200,180,255,0)');
        c.fillStyle = g;
        c.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
      }
    }
    return (cloudCv = cv);
  }

  /** Cielo, estrellas, nubes, columnas de luz y las losas que caen (antes del mundo). */
  function drawSky(ctx, w, h) {
    if (!phase || !ported || !cfg || BOSS.arena !== 'origin' || !center) return;
    const cm = G.Camera, k = cm.scale, now = performance.now() / 1000;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0b0a26'); g.addColorStop(0.5, '#251c4c'); g.addColorStop(1, '#5a4478');
    ctx.save();
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Resplandor dorado lejano.
    const gx = w / 2 - (cm.x - center.x) * k * 0.08, gy = h * 0.3 - (cm.y - center.y) * k * 0.08;
    const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.6);
    rg.addColorStop(0, 'rgba(255,214,120,0.22)'); rg.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    // Estrellas (casi quietas: están muy lejos).
    if (!stars) { stars = []; for (let i = 0; i < 160; i++) stars.push({ x: Math.random(), y: Math.random(), s: Math.random() < 0.15 ? 2 : 1, ph: Math.random() * 6.28 }); }
    const sx0 = -(cm.x * 0.03) % w, sy0 = -(cm.y * 0.03) % h;
    for (const s of stars) {
      ctx.globalAlpha = 0.45 + Math.sin(now * 2 + s.ph) * 0.35;
      ctx.fillStyle = s.s > 1 ? '#fff3c8' : '#ffffff';
      const x = ((s.x * w + sx0) % w + w) % w, y = ((s.y * h + sy0) % h + h) % h;
      ctx.fillRect(Math.round(x), Math.round(y), s.s * 1.5, s.s * 1.5);
    }
    ctx.globalAlpha = 1;
    // Mar de nubes, capa de abajo.
    const tile = cloudTile();
    clouds(ctx, w, h, tile, cm.x * 0.35 + now * 6, cm.y * 0.35, 0.75, 1.3 * k);
    // Columnas de luz alrededor de la plataforma (ancladas al mundo).
    const ts = TS();
    for (let i = 0; i < 12; i++) {
      const a = i * 6.2832 / 12 + 0.13, R = (ARENA_R + 4 + (i % 3) * 2) * ts;
      const x = (center.x + Math.cos(a) * R - cm.left()) * k, y = (center.y + Math.sin(a) * R * 0.9 - cm.top()) * k;
      if (x < -80 || x > w + 80 || y < -40) continue;
      const cw = (18 + (i % 2) * 10) * k * (1 + Math.sin(now * 1.3 + i) * 0.12);
      const cg = ctx.createLinearGradient(x - cw, 0, x + cw, 0);
      cg.addColorStop(0, 'rgba(255,236,170,0)'); cg.addColorStop(0.5, 'rgba(255,246,214,0.42)'); cg.addColorStop(1, 'rgba(255,236,170,0)');
      ctx.fillStyle = cg;
      ctx.fillRect(x - cw, 0, cw * 2, Math.min(h, y));
      const bg = ctx.createRadialGradient(x, y, 0, x, y, cw * 2.2);
      bg.addColorStop(0, 'rgba(255,240,200,0.45)'); bg.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(x - cw * 2.2, y - cw * 2.2, cw * 4.4, cw * 4.4);
    }
    // Las losas que caen a las nubes.
    for (const f of falling) {
      const t = f.t, s = f.s * k * (1 - t * 0.35), drop = 140 * t * t * k;
      const x = (f.x + f.s / 2 - cm.left()) * k, y = (f.y + f.s / 2 - cm.top()) * k + drop;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t / 1.6);
      ctx.translate(x, y); ctx.rotate(f.rot * t);
      ctx.fillStyle = '#d8cfbd'; ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.fillStyle = '#a89c84'; ctx.fillRect(-s / 2, s / 2 - s * 0.18, s, s * 0.18);
      ctx.strokeStyle = GOLD; ctx.lineWidth = Math.max(1, 2 * k); ctx.strokeRect(-s / 2, -s / 2, s, s);
      ctx.restore();
    }
    // Nubes de arriba (más claras y rápidas): las losas se hunden en ellas.
    clouds(ctx, w, h, tile, cm.x * 0.6 + now * 14, cm.y * 0.6 + 200, 0.35, 2 * k);
    ctx.restore();
  }
  function clouds(ctx, w, h, tile, ox, oy, alpha, sc) {
    const S = tile.width * sc;
    const x0 = -(((ox * sc / 1.3) % S) + S) % S, y0 = -(((oy * sc / 1.3) % S) + S) % S;
    ctx.globalAlpha = alpha;
    for (let y = y0; y < h; y += S) for (let x = x0; x < w; x += S) ctx.drawImage(tile, x, y, S, S);
    ctx.globalAlpha = 1;
  }

  /** En el suelo (debajo de los Pokémon): grietas, carriles de las Aspas, sellos de los saltos. */
  function drawFloor(ctx) {
    if (phase !== 'fight' || !A) return;
    const now = performance.now() / 1000, ts = TS();
    ctx.save();
    // Losas agrietándose: luz dorada que sale por las grietas y tiembla.
    for (const c of cracks) {
      const r = slabRect(c.i, c.j), k = c.t / CRACK_T;
      const jx = k > 0.6 ? G.U.rand(-1.5, 1.5) * k : 0, jy = k > 0.6 ? G.U.rand(-1.5, 1.5) * k : 0;
      ctx.globalAlpha = 0.12 + k * 0.3 + (k > 0.75 && Math.sin(now * 30) > 0 ? 0.2 : 0);
      ctx.fillStyle = GOLD;
      ctx.fillRect(r.x0 + jx, r.y0 + jy, r.s, r.s);
      ctx.globalAlpha = 0.5 + k * 0.5;
      ctx.strokeStyle = k > 0.5 ? '#fff6d0' : GOLD; ctx.lineWidth = 1.5 + k * 2;
      ctx.shadowColor = GLOW; ctx.shadowBlur = 6 + k * 10;
      ctx.beginPath();
      const cx = r.x0 + r.s / 2 + jx, cy = r.y0 + r.s / 2 + jy, n = 5;
      for (let i = 0; i < n; i++) {
        const a = G.U.hash(c.i * 7 + i, c.j * 13, 5) * 6.2832, len = r.s * 0.5 * Math.min(1, k * 1.6);
        ctx.moveTo(cx, cy);
        const mx = cx + Math.cos(a) * len * 0.5 + (G.U.hash(c.i, c.j + i, 6) - 0.5) * 12, my = cy + Math.sin(a) * len * 0.5 + (G.U.hash(c.i + i, c.j, 7) - 0.5) * 12;
        ctx.lineTo(mx, my); ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    // Carriles de las Aspas Doradas (y el que va a salir, parpadeando).
    LANES.forEach(L => {
      if (arenaT < L.at - 3) return;
      const soon = arenaT < L.at, on = soon ? (Math.sin(now * 8) > 0 ? 1 : 0.3) : 1;
      // La banda del carril (un poco oscura) y sus bordes, dorados con contorno.
      ctx.globalAlpha = 0.12 * on; ctx.strokeStyle = DARK; ctx.lineWidth = L.wr * 2;
      ctx.beginPath(); ctx.arc(center.x, center.y, L.R * ts, 0, 6.2832); ctx.stroke();
      ctx.setLineDash([12, 8]);
      for (const R of [L.R * ts - L.wr, L.R * ts + L.wr]) {
        ctx.globalAlpha = 0.5 * on; ctx.strokeStyle = DARK; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(center.x, center.y, R, 0, 6.2832); ctx.stroke();
        ctx.globalAlpha = 0.8 * on; ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(center.x, center.y, R, 0, 6.2832); ctx.stroke();
      }
      ctx.setLineDash([]);
    });
    // Sombras de las ruedas.
    ctx.globalAlpha = 0.3; ctx.fillStyle = '#000';
    for (const b of blades()) { ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r * 0.9, b.r * 0.35, 0, 0, 6.2832); ctx.fill(); }
    // El sello dorado donde va a aparecer.
    if (blink) {
      const k = Math.min(1, blink.t / SEAL_T);
      seal(ctx, blink.x, blink.y, 30 + k * 34, now * 3, 0.4 + k * 0.6);
    }
    // Gravedad: aros que se cierran sobre él.
    if (grav > 0) {
      ctx.strokeStyle = PURPLE; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const p = ((now * 0.8 + i / 3) % 1);
        ctx.globalAlpha = 0.5 * p;
        ctx.beginPath(); ctx.ellipse(A.x, A.y, 40 + (1 - p) * 260, (40 + (1 - p) * 260) * 0.6, 0, 0, 6.2832); ctx.stroke();
      }
    }
    ctx.restore();
  }

  /** Sello dorado: aro, estrella de seis puntas que gira y marcas. */
  function seal(ctx, x, y, r, rot, alpha, col = GOLD) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(1, 0.62);
    ctx.globalAlpha = alpha * 0.25; ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = 2.5;
    ctx.shadowColor = col; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, 6.2832); ctx.stroke();
    ctx.rotate(rot);
    for (let t = 0; t < 2; t++) {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) { const a = t * Math.PI / 3 + i * 6.2832 / 3; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 0.74, Math.sin(a) * r * 0.74); }
      ctx.closePath(); ctx.stroke();
    }
    for (let i = 0; i < 12; i++) { const a = i * 6.2832 / 12; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82); ctx.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); ctx.stroke(); }
    ctx.restore();
  }

  /** Avisos de sus ataques (hazards.js): sellos y franjas redondeadas, más vistosos. */
  function drawWarn(ctx, h, k) {
    const now = performance.now() / 1000, blinkOn = Math.sin(now * 16) > 0;
    ctx.save();
    if (h.kind === 'zone') {
      ctx.translate(h.x, h.y); ctx.scale(1, 0.75);
      // (Sobre el mármol claro, un fondo oscuro debajo para que se vea bien.)
      ctx.fillStyle = DARK;
      ctx.globalAlpha = 0.16; ctx.beginPath(); ctx.arc(0, 0, h.r, 0, 6.2832); ctx.fill();
      ctx.fillStyle = h.color;
      ctx.globalAlpha = 0.2 + k * 0.3; ctx.beginPath(); ctx.arc(0, 0, h.r * k, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 0.8; ctx.strokeStyle = DARK; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(0, 0, h.r, 0, 6.2832); ctx.stroke();
      ctx.globalAlpha = k > 0.75 && blinkOn ? 1 : 0.85;
      ctx.strokeStyle = h.color; ctx.lineWidth = 2.5;
      ctx.shadowColor = h.color; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(0, 0, h.r, 0, 6.2832); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.5; ctx.globalAlpha = 0.35 + k * 0.5;
      ctx.rotate(now * (h.vis === 'future' ? -2.2 : 1.6));
      for (let t = 0; t < 2; t++) {
        ctx.beginPath();
        for (let i = 0; i < 3; i++) { const a = t * Math.PI / 3 + i * 6.2832 / 3; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * h.r * 0.7, Math.sin(a) * h.r * 0.7); }
        ctx.closePath(); ctx.stroke();
      }
      if (h.vis === 'future') { ctx.beginPath(); ctx.ellipse(0, 0, h.r * 0.36, h.r * 0.2, 0, 0, 6.2832); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, h.r * 0.1, 0, 6.2832); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(0, 0, h.r * 0.42, 0, 6.2832); ctx.stroke(); }
    } else {
      ctx.translate(h.x, h.y); ctx.rotate(h.angle);
      const w = h.w, L = h.len;
      const rr = (y, hh) => { ctx.beginPath(); ctx.moveTo(hh / 2, y); ctx.lineTo(L - hh / 2, y); ctx.arc(L - hh / 2, y + hh / 2, hh / 2, -Math.PI / 2, Math.PI / 2); ctx.lineTo(hh / 2, y + hh); ctx.arc(hh / 2, y + hh / 2, hh / 2, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); };
      ctx.fillStyle = DARK;
      ctx.globalAlpha = 0.16; rr(-w / 2, w); ctx.fill();
      ctx.fillStyle = h.color;
      ctx.globalAlpha = 0.22 + k * 0.3; rr(-w / 2 * k, Math.max(1, w * k)); ctx.fill();
      ctx.globalAlpha = 0.75; ctx.strokeStyle = DARK; ctx.lineWidth = 4.5;
      rr(-w / 2, w); ctx.stroke();
      ctx.globalAlpha = k > 0.75 && blinkOn ? 1 : 0.85;
      ctx.strokeStyle = h.color; ctx.lineWidth = 2;
      ctx.shadowColor = h.color; ctx.shadowBlur = 6;
      rr(-w / 2, w); ctx.stroke();
      ctx.shadowBlur = 0;
      // Flechas que corren por la franja.
      ctx.globalAlpha = 0.35 + k * 0.4; ctx.lineWidth = 2;
      const step = 64, off = (now * (h.vis === 'xspeed' ? 420 : 220)) % step;
      for (let x = off + w / 2; x < L - w / 2; x += step) { ctx.beginPath(); ctx.moveTo(x - 8, -w * 0.25); ctx.lineTo(x + 4, 0); ctx.lineTo(x - 8, w * 0.25); ctx.stroke(); }
    }
    ctx.restore();
  }

  /** Al estallar uno de sus ataques: columnas de luz, rayos brillantes, ondas (hazards.js). */
  function boom(h, near) {
    if (h.kind === 'zone') {
      const col = h.vis === 'future' ? FUTURE : h.vis === 'gpillar' ? PURPLE : h.vis === 'nova' ? GOLD : '#fff3c8';
      if (h.vis === 'nova') {
        for (let i = 0; i < 3; i++) G.FX.ring(h.x, h.y, 8 + i * 20, h.r * (1 + i * 0.25), i % 2 ? PALE : GOLD, 0.4 + i * 0.12, 6 - i);
        G.FX.burst(h.x, h.y - 10, GOLD, 26, 260);
        if (near) { G.Audio.sfx('break'); G.Camera.kick(0.4); }
        return true;
      }
      columns.push({ x: h.x, y: h.y, r: h.r, col, t: 0, life: 0.5 });
      G.FX.ring(h.x, h.y, 4, h.r * 1.3, col, 0.4, 5);
      G.FX.burst(h.x, h.y - 6, col, 12, 200);
      if (h.vis === 'gpillar') G.FX.ring(h.x, h.y, h.r * 2.2, 6, PURPLE, 0.35, 3);       // la gravedad lo aplasta
      if (near) { G.Audio.sfx('judge'); G.Camera.kick(0.2); }
      return true;
    }
    rays.push({ x: h.x, y: h.y, angle: h.angle, len: h.len, w: h.w, col: h.color, t: 0, life: h.vis === 'xspeed' ? 0.5 : 0.35 });
    G.FX.beam(h.x, h.y - G.LIFT, h.angle, h.len, h.w, h.color, G.VFX.forType('electric'));
    if (near) G.Audio.sfx('shot', { kind: 'beam', type: 'electric' });
    return true;
  }

  /** Por encima de todo (en el mundo): pilar de la bajada, columnas, rayos, Tablas, balas, Aspas, rayos que sujetan. */
  function drawAir(ctx) {
    if (!A || !ported) return;
    if (phase === 'cine') { drawDescent(ctx); return; }
    const now = performance.now() / 1000;
    ctx.save();
    // Columnas de luz de los pilares.
    for (const c of columns) {
      const k = c.t / c.life, w = c.r * (1.1 - k * 0.6), top = c.y - 520;
      const g = ctx.createLinearGradient(c.x - w, 0, c.x + w, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, c.col); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 0.85 * (1 - k);
      ctx.fillStyle = g;
      ctx.fillRect(c.x - w, top, w * 2, c.y - top);
      ctx.globalAlpha = 0.9 * (1 - k); ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.x - w * 0.18, top, w * 0.36, c.y - top);
    }
    // Rayos: núcleo blanco con brillo, puntas redondeadas.
    ctx.lineCap = 'round';
    for (const r of rays) {
      const k = r.t / r.life, x2 = r.x + Math.cos(r.angle) * r.len, y2 = r.y - G.LIFT + Math.sin(r.angle) * r.len;
      ctx.globalAlpha = 0.55 * (1 - k); ctx.strokeStyle = r.col; ctx.lineWidth = r.w * (1.2 - k * 0.5);
      ctx.shadowColor = GLOW; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.moveTo(r.x, r.y - G.LIFT); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.95 * (1 - k); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = r.w * 0.35 * (1 - k * 0.6);
      ctx.beginPath(); ctx.moveTo(r.x, r.y - G.LIFT); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.lineCap = 'butt';
    // Las 17 Tablas girando.
    if (plates) {
      const fade = Math.min(1, plates.t / 0.4, (PLATES_T - plates.t) / 0.4);
      for (let i = 0; i < 17; i++) {
        const a = plateAngle(i), x = A.x + Math.cos(a) * 74, y = A.y - A.bodyH * 0.45 + Math.sin(a) * 50;
        ctx.globalAlpha = fade;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = G.U.TYPE_COLOR[PLATE_TYPES[i]]; ctx.strokeStyle = '#fff8dc'; ctx.lineWidth = 1.5;
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
        ctx.fillRect(-6, -8, 12, 16); ctx.shadowBlur = 0; ctx.strokeRect(-6, -8, 12, 16);
        ctx.restore();
      }
    }
    // Balas de las Tablas.
    for (const b of bullets) {
      ctx.globalAlpha = Math.min(1, (3.6 - b.t) * 2);
      ctx.fillStyle = G.U.TYPE_COLOR[b.type];
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(b.x, b.y - 10, 8, 0, 6.2832); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(b.x - 2, b.y - 12, 3, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Aspas Doradas: ruedas de Arceus que ruedan por su carril.
    for (const b of blades()) {
      wheel(ctx, b.x, b.y - b.r * 0.9, b.r, now * 6 * (b.lane ? -1 : 1), 0.6 + 0.4 * b.k);
      ctx.save(); ctx.globalAlpha = 0.35 * b.k; ctx.fillStyle = PALE;
      ctx.beginPath(); ctx.arc(b.x, b.y - b.r * 0.9, b.r * 0.45, 0, 6.2832); ctx.fill(); ctx.restore();
    }
    // Rayos dorados que sujetan (te ha roto el ataque) o juzgan (en grupo).
    for (const p of G.Game.everyone()) {
      const k = keyOf(p);
      const hold = held.get(k), judging = A.judge && A.judge.uid === k;
      if (!hold && !judging && !(judged.has(k) && p.dead && seals.some(s => s.uid === k))) continue;
      const w = 26 + Math.sin(now * 12) * 4, top = p.y - 600;
      const g = ctx.createLinearGradient(p.x - w, 0, p.x + w, 0);
      g.addColorStop(0, `rgba(${BOSS.rgb},0)`); g.addColorStop(0.5, `rgba(${BOSS.rgb2},0.85)`); g.addColorStop(1, `rgba(${BOSS.rgb},0)`);
      ctx.globalAlpha = 0.9; ctx.fillStyle = g;
      ctx.fillRect(p.x - w, top, w * 2, p.y - top);
      for (let i = 0; i < 2; i++) {
        const q = (now * 1.5 + i / 2) % 1;
        ctx.globalAlpha = 1 - q; ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(p.x, p.y - q * p.bodyH * 1.4, p.r * 1.8, p.r * 0.7, 0, 0, 6.2832); ctx.stroke();
      }
    }
    ctx.restore();
  }

  /** El pilar de luz por el que baja (animación). */
  function drawDescent(ctx) {
    const cm = G.Camera;
    const a = G.U.clamp((ct - T_PORT) / 0.6, 0, 1) * G.U.clamp((T_LAND + 0.6 - ct) / 0.6, 0, 1);
    if (a <= 0) return;
    const top = cm.top() - 40, bot = A.y + 6;
    const near = G.U.clamp(1 - A.lift / 900, 0, 1);
    const w = 40 + near * 40 + Math.sin(ct * 9) * 6;
    ctx.save();
    const g = ctx.createLinearGradient(A.x - w, 0, A.x + w, 0);
    g.addColorStop(0, `rgba(${BOSS.rgb},0)`);
    g.addColorStop(0.5, `rgba(${BOSS.rgb2},0.7)`);
    g.addColorStop(1, `rgba(${BOSS.rgb},0)`);
    ctx.globalAlpha = a;
    ctx.fillStyle = g;
    ctx.fillRect(A.x - w, top, w * 2, Math.max(0, bot - top));
    // Resplandor en el suelo, donde va a caer.
    ctx.globalAlpha = a * (0.35 + near * 0.55);
    ctx.translate(A.x, A.y); ctx.scale(1, 0.36);
    const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 1.5);
    rg.addColorStop(0, `rgba(${BOSS.rgb2},0.9)`); rg.addColorStop(0.5, `rgba(${BOSS.rgb},0.35)`); rg.addColorStop(1, `rgba(${BOSS.rgb},0)`);
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(0, 0, w * 1.5, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  const F = (wt, s) => `${wt} ${s}px Pixelify,"Segoe UI",system-ui,sans-serif`;

  /** En pantalla: la animación, o el aviso de la pelea. */
  function drawOverlay(ctx, w, h) {
    if (phase === 'cine') drawCine(ctx, w, h);
    else if (phase === 'fight') drawFight(ctx, w, h);
  }

  function drawCine(ctx, w, h) {
    const t = ct;
    G.Touch.clearButtons();             // (el HUD no se dibuja durante la animación)
    ctx.save();
    // Se oscurece todo (hasta el viaje).
    if (t < T_PORT + 0.1) {
      ctx.fillStyle = `rgba(10,6,2,${(G.U.clamp(t / 1.1, 0, 1) * 0.86).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
    }
    // "LA SENTENCIA DE ARCEUS" (o "LA NOCHE DE GENGAR")
    const a = G.U.clamp((t - T_TITLE + 0.3) / 0.5, 0, 1) * G.U.clamp((T_FLASH + 0.2 - t) / 0.35, 0, 1);
    if (a > 0) {
      const cx = w / 2, cy = h * 0.34, R = Math.min(w, h) * 0.24;
      // Rayos de luz que giran.
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.18);
      ctx.globalAlpha = a * 0.35;
      for (let i = 0; i < 16; i++) {
        ctx.rotate(6.2832 / 16);
        const g = ctx.createLinearGradient(0, 0, Math.max(w, h), 0);
        g.addColorStop(0, `rgba(${BOSS.rgb},0.9)`); g.addColorStop(1, `rgba(${BOSS.rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.max(w, h), -R * 0.16); ctx.lineTo(Math.max(w, h), R * 0.16); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      // Arceus en silueta de luz, detrás de su rueda.
      wheel(ctx, cx, cy - R * 0.05, R, t * 0.35, a * 0.9);
      const idle = G.Sprites.sheet(BOSS.dex, 'Idle');
      if (cineAnim && idle && idle.ready) {
        // Silueta de luz que llena la rueda (en múltiplos de 0,5: píxeles enteros).
        const body = (G.Sprites.animMeta(BOSS.dex, 'Idle').ay || 47) * G.Sprites.PX;
        cineAnim.scale = Math.max(1, Math.round(R * 1.7 / body * 2) / 2);
        const rise = (1 - G.U.clamp((t - T_TITLE + 0.3) / 0.8, 0, 1)) * R * 0.3;
        ctx.save();
        ctx.globalAlpha = a * 0.85;
        ctx.shadowColor = GLOW; ctx.shadowBlur = 40;
        cineAnim.draw(ctx, cx, cy + body * cineAnim.scale * 0.5 + rise, { flash: true });
        ctx.restore();
      }
      // El título, letra a letra, debajo de la rueda.
      const size = Math.round(G.U.clamp(Math.min(w / 13, h / 9), 24, 64));
      const ty = cy + R + size * 1.15;
      title(ctx, BOSS.t1, cx, ty, size, T_TITLE, a);
      title(ctx, BOSS.t2, cx, ty + size * 0.95, Math.round(size * 0.8), T_TITLE + 0.75, a);
      ctx.globalAlpha = a * G.U.clamp((t - T_TITLE - 1.6) / 0.6, 0, 1);
      ctx.font = F(700, Math.round(size * 0.32));
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f3e2b0';
      ctx.fillText(G.T(BOSS.sub), cx, ty + size * 1.7);
    }
    // Franjas negras de cine durante la bajada.
    if (t > T_PORT) {
      const k = G.U.clamp((t - T_PORT) / 0.5, 0, 1) * G.U.clamp((T_END - t) / 0.6, 0, 1);
      const bh = Math.round(h * 0.11 * k);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, bh); ctx.fillRect(0, h - bh, w, bh);
    }
    // ¡Ha descendido!
    const b = G.U.clamp((t - T_LAND - 0.15) / 0.3, 0, 1) * G.U.clamp((T_END - t) / 0.5, 0, 1);
    if (b > 0) {
      const size = Math.round(G.U.clamp(w / 20, 20, 40));
      const pop = 1 + (1 - G.U.clamp((t - T_LAND - 0.15) / 0.25, 0, 1)) * 0.6;
      ctx.save();
      ctx.globalAlpha = b;
      ctx.translate(w / 2, h * 0.24);
      ctx.scale(pop, pop);
      goldText(ctx, BOSS.landed, 0, 0, size);
      ctx.restore();
      ctx.globalAlpha = b;
      ctx.font = F(700, Math.round(size * 0.45));
      ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.8)';
      const sub = 'Es invencible: aguanta y hazle todo el daño que puedas';
      ctx.strokeText(sub, w / 2, h * 0.24 + size * 1.1);
      ctx.fillStyle = '#ffe9b0';
      ctx.fillText(sub, w / 2, h * 0.24 + size * 1.1);
    }
    if (canSkip && t < T_BACK) {
      ctx.globalAlpha = 0.55 + Math.sin(t * 4) * 0.2;
      ctx.font = F(700, 11);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#f3e2b0';
      ctx.fillText(G.Touch.active ? 'Toca la pantalla para saltar' : 'Pulsa Espacio para saltar', w - 16, h - 14);
      // Toda la pantalla es un botón (móvil y ratón).
      G.Touch.addButton(0, 0, w, h, skip, 0);
    }
    ctx.restore();
  }

  /** Texto dorado con borde y brillo. */
  function goldText(ctx, s, x, y, size) {
    ctx.font = F(800, size);
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(4, size * 0.16);
    ctx.strokeStyle = '#2a1500';
    ctx.strokeText(s, x, y);
    const g = ctx.createLinearGradient(0, y - size * 0.8, 0, y + size * 0.1);
    g.addColorStop(0, '#fff8d8'); g.addColorStop(0.5, '#ffd25e'); g.addColorStop(1, '#c7771a');
    ctx.shadowColor = GLOW; ctx.shadowBlur = size * 0.4;
    ctx.fillStyle = g;
    ctx.fillText(s, x, y);
    ctx.shadowBlur = 0;
  }

  /** Título que aparece letra a letra (cada una cae y se asienta). */
  function title(ctx, raw, cx, y, size, t0, alpha) {
    // Copia local: el parche de chino (js/zh-tw.js) da el título entero ya traducido. Antes se
    // traducía letra a letra en el canvas («A» → «給») y salía un galimatías (en app.min.js no hay G global).
    const s = (window.PSZH_TITLE && window.PSZH_TITLE(raw)) || (G.I18n ? G.I18n.t(raw) : raw);
    ctx.save();
    ctx.font = F(800, size);
    const total = ctx.measureText(s).width;
    let x = cx - total / 2;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      const cw = ctx.measureText(ch).width;
      const p = G.U.clamp((ct - t0 - i * 0.055) / 0.28, 0, 1);
      if (p > 0 && ch !== ' ') {
        const k = 1 + (1 - p) * 1.8;
        ctx.save();
        ctx.globalAlpha = alpha * p;
        ctx.translate(x + cw / 2, y);
        ctx.scale(k, k);
        goldText(ctx, ch, 0, 0, size);
        ctx.restore();
      }
      ctx.font = F(800, size);
      x += cw;
    }
    ctx.restore();
  }

  /** Pelea: tinte, motas de luz (o ceniza con Gengar), flecha a Arceus y el contador. */
  function drawFight(ctx, w, h) {
    ctx.save();
    const origin = BOSS.arena === 'origin';
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, origin ? 'rgba(40,20,90,0)' : 'rgba(120,40,10,0)');
    g.addColorStop(1, origin ? 'rgba(40,20,90,0.3)' : 'rgba(120,40,10,0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Gravedad: todo pesa (franjas moradas que caen y la pantalla algo más oscura).
    if (grav > 0) {
      const k = Math.min(1, grav / 0.4, (GRAV_T - grav) / 0.3);
      ctx.fillStyle = `rgba(40,10,70,${(0.22 * k).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PURPLE;
      const now = performance.now() / 1000;
      for (let i = 0; i < 24; i++) {
        ctx.globalAlpha = 0.25 * k;
        const x = (i * 97.3) % w, y = ((now * 520 + i * 61) % (h + 80)) - 40;
        ctx.fillRect(x, y, 2, 30);
      }
      ctx.globalAlpha = 1;
    }
    for (const e of embers) {
      ctx.globalAlpha = Math.min(1, e.life) * e.a;
      ctx.fillStyle = e.c;
      ctx.fillRect(Math.round(e.x), Math.round(e.y), e.s, e.s);
    }
    ctx.globalAlpha = 1;
    // Contador bajo el reloj.
    const boss = G.EnemyMgr.all().some(e => e.boss && !e.dead);
    const y0 = boss ? 98 : 76;
    ctx.textAlign = 'center';
    ctx.font = F(800, 12);
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.7)';
    const txt = G.I18n.f('SENTENCIA · {x}', G.U.mmss(arenaT));
    ctx.strokeText(txt, w / 2, y0);
    ctx.fillStyle = GOLD;
    ctx.fillText(txt, w / 2, y0);
    const dtx = G.I18n.f(BOSS.dmg, Math.round(dealt).toLocaleString(G.I18n.locale));
    ctx.font = F(800, 11);
    ctx.strokeText(dtx, w / 2, y0 + 15);
    ctx.fillStyle = (cfg && G.U.TYPE_COLOR[cfg.pl]) || GOLD;
    ctx.fillText(dtx, w / 2, y0 + 15);
    // Lo próximo: el objeto que va a romper (si llevas alguno).
    const pl = G.Game.player;
    if (breakN < BREAKS.length && pl && pl.item) {
      const left = Math.max(0, BREAKS[breakN] - arenaT);
      if (left < 20) {
        const txt2 = G.I18n.f('Rompe un objeto en {x} s', Math.ceil(left));
        ctx.font = F(700, 10);
        ctx.strokeText(txt2, w / 2, y0 + 29);
        ctx.fillStyle = left < 5 && Math.sin(performance.now() / 90) > 0 ? '#ff8a6a' : '#f3e2b0';
        ctx.fillText(txt2, w / 2, y0 + 29);
      }
    }
    // Flecha hacia Arceus si no se ve.
    const cam = G.Camera;
    const sx = (A.x - cam.left()) * cam.scale, sy = (A.y - A.bodyH * 0.5 - cam.top()) * cam.scale;
    if (sx < 0 || sx > w || sy < 0 || sy > h) {
      const M = 46, ex = G.U.clamp(sx, M, w - M), ey = G.U.clamp(sy, M + 70, h - M - 80);
      const an = Math.atan2(sy - ey, sx - ex);
      const beat = 0.5 + Math.sin(performance.now() / 120) * 0.5;
      ctx.translate(ex, ey);
      ctx.globalAlpha = 0.2 + beat * 0.25;
      ctx.fillStyle = '#ff6a3d';
      ctx.beginPath(); ctx.arc(0, 0, 26 + beat * 6, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = beat > 0.5 ? PALE : GOLD;
      ctx.beginPath();
      ctx.moveTo(Math.cos(an) * 34, Math.sin(an) * 34);
      ctx.lineTo(Math.cos(an + 2.45) * 17, Math.sin(an + 2.45) * 17);
      ctx.lineTo(Math.cos(an - 2.45) * 17, Math.sin(an - 2.45) * 17);
      ctx.closePath(); ctx.fill();
      ctx.font = F(800, 11);
      ctx.textAlign = Math.cos(an) > 0.3 ? 'right' : Math.cos(an) < -0.3 ? 'left' : 'center';
      const lbl = BOSS.name.toUpperCase() + ' · ' + Math.round(G.U.dist(pl.x, pl.y, A.x, A.y) / 32) + ' m';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.85)';
      ctx.strokeText(lbl, -Math.cos(an) * 30, -Math.sin(an) * 26 + 4);
      ctx.fillStyle = GOLD;
      ctx.fillText(lbl, -Math.cos(an) * 30, -Math.sin(an) * 26 + 4);
    }
    ctx.restore();
  }

  /** Motas de luz que suben (Sala del Origen) o ceniza que cae (Gengar), en pantalla. */
  function ember(dt) {
    const cv = document.getElementById('game');
    const w = cv ? cv.clientWidth : 800, h = cv ? cv.clientHeight : 600;
    const origin = BOSS.arena === 'origin';
    if (embers.length < 70 && Math.random() < dt * 40) {
      const spark = Math.random() < 0.3;
      if (origin) embers.push({ x: Math.random() * w, y: h + 6, vx: G.U.rand(-10, 10), vy: -G.U.rand(20, 50), life: G.U.rand(5, 10),
                                s: spark ? 2 : 3, a: spark ? 0.9 : 0.4, c: spark ? '#fff3c8' : '#ffd25e' });
      else embers.push({ x: Math.random() * w, y: -6, vx: G.U.rand(-25, 10), vy: G.U.rand(20, 55), life: G.U.rand(5, 10),
                         s: spark ? 2 : 3, a: spark ? 0.9 : 0.45, c: spark ? '#ffb347' : '#8a8078' });
    }
    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.x += e.vx * dt; e.y += e.vy * dt; e.life -= dt;
      if (e.life <= 0 || e.y > h + 10 || e.y < -10) embers.splice(i, 1);
    }
  }

  /**
   * Otro pasa a llevar la partida a mitad (cambio de anfitrión, coop.js): Arceus sigue
   * desde donde estaba, ahora movido desde aquí; su blanco (el enemigo invisible al
   * que se pega) vuelve a ponerse. El suelo, las Aspas y los objetos rotos siguen igual.
   */
  function adopt() {
    if (phase === 'cine') { const s = G.DB.save; canSkip = !!(s && s.stats && s.stats.judged > 0); return; }
    if (phase !== 'fight' || !A) return;
    A.net = null; A.cast = null; A.cd = 2.2; A.dash = null; A.judge = null; blink = null;
    breakN = BREAKS.filter(t => t <= arenaT).length;
    if (!G.EnemyMgr.all().some(e => e.arceus && !e.remote)) addTarget();
  }

  // ---------------- red ----------------

  function onEvent(ev) {
    if (ev[0] === 'jd') begin(ev[1]);
    else if (ev[0] === 'jk') doSkip();
    else if (ev[0] === 'jb' && phase === 'fight') startBreak();
    else if (ev[0] === 'jx' && phase === 'fight' && A) onX(ev);
  }

  /** Lo nuevo de la Sentencia (23-11-2026), en cada ordenador. */
  function onX(ev) {
    const pl = G.Game.player;
    switch (ev[1]) {
      case 'h':                                     // losas que se agrietan
        for (const s of ev[2] || []) {
          const i = s[0] | 0, j = s[1] | 0, k = i + ',' + j;
          if (fallen.has(k) || cracks.some(c => c.k === k)) continue;
          cracks.push({ i, j, k, t: 0 });
        }
        if (!holeSaid) { holeSaid = true; G.Spawner.say('¡La Sala del Origen se agrieta! No pises los agujeros', 3, true); }
        break;
      case 'g':                                     // Gravedad
        grav = GRAV_T; gravVol = 0; gravFx = 1.2; gravAt = arenaT;
        G.Spawner.say('¡Gravedad! Vas más lento y no puedes embestir', 2, true);
        G.Audio.sfx('quake'); G.Camera.kick(0.5);
        G.FX.ring(A.x, A.y, 420, 20, PURPLE, 0.7, 6);
        break;
      case 'p':                                     // Sentencia de las Tablas
        plates = { t: 0, a0: +ev[2] || 0, fire: 0.3, n: 0 };
        G.Audio.sfx('legend');
        break;
      case 't':                                     // sello del salto
        blink = { x: +ev[2], y: +ev[3], t: 0, uid: ev[4], flee: !!ev[5] };
        if (G.Camera.sees(blink.x, blink.y, 200)) G.Audio.sfx('judge');
        break;
      case 'r': {                                   // te sujeta (y te rompe el ataque con el que huyes)
        const uid = ev[2], p = G.Game.everyone().find(o => keyOf(o) === uid);
        if (!p) break;
        held.set(uid, { t: HOLD_T, x: p.x, y: p.y });
        if (G.Camera.sees(p.x, p.y, 200)) { G.Audio.sfx('judge'); G.Camera.kick(0.4); }
        if (!isMe(uid) || pl.dead) break;
        const id = rip(pl);
        ripNote(uid, id);
        if (G.Coop.isHost) G.Coop.broadcast(['jx', 'm', uid, id || '']);
        else if (G.Coop.active) G.Coop.toHost(['jx', 'm', id || '']);
        break;
      }
      case 'm':                                     // lo que le ha roto a otro
        if (!isMe(ev[2])) ripNote(ev[2], ev[3] || null);
        break;
      case 'j': {                                   // juzgado: ya no le levantan
        const uid = ev[2];
        judged.add(uid);
        const p = G.Game.everyone().find(o => keyOf(o) === uid);
        if (isMe(uid)) { pl.judged = true; pl.reviveT = 0; }
        G.Spawner.say(isMe(uid) ? '¡Arceus te ha juzgado! Ya no te pueden levantar' : G.I18n.f('¡Arceus juzga a {x}! Ya no se le puede levantar', nameOf(uid)), 3.5, true);
        G.Audio.sfx('toll');
        if (p) {
          seals.push({ uid, t: 0, life: JUDGE_T });
          if (authority()) {
            // Se para delante de todos a juzgarle.
            A.cast = null; A.dash = null; blink = null;
            A.x = p.x; A.y = p.y - 70; A.judge = { uid, t: 0 };
            A.anim.play('Charge', { speed: 0.5 });
            flashAt(A.x, A.y);
          }
        }
        break;
      }
    }
  }

  /** Anfitrión: un invitado cuenta qué ataque le ha roto Arceus; se lo dice a los demás. */
  function onMate(from, ev) {
    if (ev[1] !== 'm' || typeof from !== 'string') return;
    const id = typeof ev[2] === 'string' && G.Moves.BY_ID[ev[2]] ? ev[2] : '';
    if (phase === 'fight') ripNote(from, id || null);
    G.Coop.broadcast(['jx', 'm', from, id]);
  }

  /** Anfitrión: dónde está Arceus (va en cada envío), el daño y el reloj de la Sentencia. */
  function netState() {
    if (phase !== 'fight' || !A) return null;
    const a = G.Coop.ANIMS.indexOf(A.anim.cur);
    return [Math.round(A.x), Math.round(A.y), a < 0 ? 0 : a, A.anim.dir, Math.round(dealt), Math.round(arenaT * 10)];
  }
  function netApply(a) {
    // El anfitrión ya está peleando y aquí sigue la animación (va por detrás): se salta hasta la pelea.
    if (phase === 'cine') { doSkip(); return; }
    if (!A || phase !== 'fight') return;
    A.net = { x: a[0], y: a[1], anim: a[2], dir: a[3] };
    if (Number.isFinite(a[4]) && a[4] >= 0) dealt = a[4];      // el daño a Arceus lo cuenta el anfitrión
    // El reloj de la Sentencia, el del anfitrión (las Aspas y los ataques nuevos van con él).
    if (Number.isFinite(a[5]) && a[5] >= 0 && Math.abs(a[5] / 10 - arenaT) > 0.4) arenaT = a[5] / 10;
  }

  return {
    AT, reset, noteDmg, hitArceus, dress, dmgK, update, cineTick, skip, drawable, drawAir, drawOverlay, onEvent, onMate, adopt, netState, netApply,
    drawSky, drawFloor, drawWarn, boom, speedK, touchAt, fleeMove, MOVES, BREAKS, LANES,
    /** Ha caído un legendario en la arena (ya no acuden: se deja por si acaso). */
    bossDown() { if (phase === 'fight') downs++; },
    get active() { return !!phase; }, capSpd,
    /** Gravedad de Arceus: no se embiste (combat.js). */
    get grounded() { return phase === 'fight' && grav > 0; },
    /** Vuestro daño a un enemigo por segundo, de los últimos 30 s (para la vida de Eternatus). */
    singleDps,
    /** Copia local (bot): todo lo de la Sentencia que hay que esquivar. */
    get arceus() {
      if (phase !== 'fight' || !A) return null;
      const ts = TS(), pl = G.Game.player, h = pl && held.get(keyOf(pl));
      return { x: A.x, y: A.y, r: A.r, casting: !!A.cast, cast: A.cast ? A.cast.id : null, t: arenaT, touch: touchPct(),
               k: speedK(arenaT), cx: center.x, cy: center.y, max: (ARENA_R - 1.4) * ts,   // arena redonda
               // Lo nuevo (23-11-2026)
               attacks: MOVES.filter(m => m.at <= arenaT).map(m => m.id),
               hole: (x, y) => G.World.isVoid(x, y),                                    // agujeros (y fuera de la sala)
               cracks: cracks.map(c => { const r = slabRect(c.i, c.j); return { x: r.x0 + r.s / 2, y: r.y0 + r.s / 2, half: r.s / 2, left: CRACK_T - c.t }; }),
               holes: fallen.size, holeMax: slabMax,
               blades: blades().map(b => ({ x: b.x, y: b.y, r: b.r })),
               lanes: LANES.filter(L => arenaT >= L.at - 3).map(L => ({ R: L.R * ts, half: L.wr, w: L.w, n: L.n, on: arenaT >= L.at })),
               grav, seal: blink ? { x: blink.x, y: blink.y, left: SEAL_T - blink.t } : null,
               bullets: bullets.map(b => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy, r: 9 })),
               held: h ? h.t : 0, judged: !!(pl && pl.judged), dashing: !!A.dash,
               nextBreak: breakN < BREAKS.length ? BREAKS[breakN] : null };
    },
    /** (Ya no hay legendarios en la Sentencia.) */
    get shielded() { return false; },
    get cinematic() { return phase === 'cine'; },
    /** Lo que suena: nada en la animación hasta que aterriza. */
    get music() { return phase === 'cine' && ct < T_LAND ? null : 'judgment'; },
    /** Para el resumen de la partida: { time, bosses, dmg, plate } o null. */
    summary() { return phase === 'fight' ? { time: fightAt >= 0 ? Math.max(0, G.Game.st.time - fightAt) : arenaT, bosses: downs, dmg: Math.round(dealt), plate: cfg.pl, gengar: BOSS === GENGAR_B } : null; },
    /** Para pruebas: daño medido. */
    get debug() { return { single: singleDps(), samples: samples.length, cracks: cracks.length, holes: fallen.size, slabs: slabs.length }; },
    /** Para pruebas: la Sentencia ya. */
    debugStart() { if (!phase && authority()) start(); },
    /** Para pruebas: salta el reloj de la Sentencia a t segundos (ataques nuevos, Aspas, objetos rotos). */
    debugAt(t) { if (phase === 'fight') { arenaT = t; shown = MOVES.filter(m => m.at <= t).reduce((a, m) => Math.max(a, m.at), 0); lanesSaid = LANES.filter(L => t >= L.at - 2).length; breakN = BREAKS.filter(b => b < t).length; } },
    /** Para pruebas: que lance ya un ataque ('rain', 'cross', 'nova', 'extreme', 'future', 'gravity', 'hyper', 'plates'). */
    debugCast(id) { if (phase === 'fight' && authority()) { const tg = target(); if (tg) { A.cast = null; cast(id, tg); } } },
    /** Para pruebas: un salto delante de ti (flee: cuenta para romperte el ataque). */
    debugBlink(flee = true) { if (phase === 'fight' && authority()) { const tg = target(); if (tg) startBlink(tg, flee); } },
    /** Para pruebas: unas losas agrietándose ya. */
    debugCrack(n = 3) { if (phase === 'fight' && authority()) { const p = pickSlabs(n); if (p.length) send(['jx', 'h', p]); } },
    /** Para pruebas: te sujeta y te rompe el ataque con el que huyes. */
    debugRip(uid) { if (phase === 'fight' && authority()) send(['jx', 'r', uid || keyOf(G.Game.player)]); },
    /** Para pruebas: el aviso de juzgado (como en grupo). */
    debugJudge(uid) { if (phase === 'fight' && authority()) send(['jx', 'j', uid || keyOf(G.Game.player)]); },
    /** Para vídeos (ya no hay legendarios: no hace nada). */
    debugNoBosses(v = true) { noBosses = !!v; }
  };
})();
