/* ============ casino.js — El Team Rocket y su Casino Rocket ============
 * (23-11-2026; como la Gran Actualización del juego oficial, hecho aquí a partir de su guía de eventos.)
 * En 1 de cada 3 partidas que llegan a la Sentencia de Arceus, y sólo jugando solo, el Team Rocket se
 * lleva a tu Pokémon a su casino justo antes de que empiece. Mientras estás dentro el reloj de la
 * partida no corre (G.Game.choose: la partida se queda en 'choice'). Puedes irte enseguida o jugar con
 * tus Pokémonedas de la cuenta (save.coins, las de la libreta de core/db.js: cada apuesta se cobra y se
 * guarda con G.DB.commit ANTES de enseñar lo que sale, y el premio se apunta una sola vez por jugada).
 * Al salir, la partida sigue y empieza la Sentencia. Las pantallas están en ui/casino-ui.js.
 * Con cuenta, apostar necesita conexión, como el gacha (cobrar lo ganado y salir, no).
 *
 * A la larga la casa gana. Lo que se devuelve de media por cada moneda apostada:
 *
 *   Tragaperras        3 rodillos de 26 casillas (Baya 7, Poké Ball 6, Voltorb 5, Pikachu 4, 7 2, R 2).
 *                      Tres iguales: R ×100 (y, la primera vez, la estela Team Rocket, que no se vende),
 *                      7 ×60, Pikachu ×25, Voltorb ×12, Poké Ball ×8, Baya ×5. Dos R ×5, dos Bayas ×2,5.
 *                      Devuelve el 92,4 % (slotRtp(), calculado exacto); el premio gordo, 1 de cada 2197.
 *   Voltorb escondido  5×5 cartas con 5 Voltorb. Cada carta buena sube el premio; un Voltorb lo pierde
 *                      todo; te plantas cuando quieras. El multiplicador tras k cartas buenas es
 *                      0,95 × C(25,k) / C(20,k) (redondeado hacia abajo, tope ×500): da igual cómo
 *                      juegues, devuelve como mucho el 95 %.
 *   Carrera Rocket     5 corredores con su forma del día (probabilidad p de ganar). Cada uno paga
 *                      0,9 / p redondeado hacia abajo a la décima: como mucho el 90 % apuestes a quien apuestes.
 *   ¡Atrapa a Pikachu! 100 monedas la entrada. Tres planes, 3 Poké Balls en cada uno; una bola lanzada
 *                      con Pikachu dentro del aro lo atrapa con un 75 %, 55 % y 35 % (si no, se escapa).
 *                      Aun sin fallar nunca un lanzamiento se gana el 64,9 % de las veces. Premio: la skin
 *                      exclusiva Mewtwo Obsidiana; si ya la tienes, 150 monedas (97 % para el jugador perfecto).
 *
 * Se guarda: save.skins['obsidiana-mewtwo'] (core/skins.js) y save.unlocks.rocketTrail (la estela; las
 * estelas son de otro módulo: esto sólo apunta que la tienes). Ninguna jugada cambia nada de la partida.
 */
G.Casino = (() => {
  const CHANCE = 1 / 3;                       // partidas que llegan a la Sentencia con casino
  const BETS = [10, 50, 100, 500];
  const SKIN = 'obsidiana-mewtwo';

  let rng = Math.random;
  let decided = false, want = false, visited = false;
  let rig = {};                                // para pruebas: el siguiente resultado de cada juego
  let seq = 0;

  // ---------------- dinero ----------------

  const save = () => (G.DB && G.DB.save) || null;
  /** Con cuenta y sin red no se apuesta (como el gacha, gacha-ui.js). */
  const needsNet = () => !!(G.DB && G.DB.online && typeof navigator !== 'undefined' && navigator.onLine === false);
  function balance() { const s = save(); return s ? s.coins : 0; }
  /** Guarda ya (en la nube, en cuanto se pueda): así recargar no deshace ni repite nada. */
  function store() {
    if (!G.DB) return;
    G.DB.commit(true);
    if (G.DB.online && G.DB.flush) G.DB.flush();
    if (G.UI && G.UI.refreshCoins) G.UI.refreshCoins();
  }
  /** ¿Se puede apostar n? → null o el motivo: 'net' | 'coins' */
  function cantBet(n) {
    const s = save();
    if (!s) return 'coins';
    if (needsNet()) return 'net';
    if (!(n > 0) || s.coins < n) return 'coins';
    return null;
  }
  /** Cobra la apuesta y abre una jugada (o null). */
  function charge(game, n) {
    if (cantBet(n)) return null;
    const s = save();
    s.coins -= n;
    s.stats = s.stats || {};
    s.stats.casinoBet = (s.stats.casinoBet || 0) + n;
    store();
    return { id: ++seq, game, bet: n, paid: false };
  }
  /** Paga una jugada (una sola vez). → lo pagado */
  function settle(r, amount) {
    if (!r || r.paid) return 0;
    r.paid = true;
    amount = Math.max(0, Math.floor(amount || 0));
    const s = save();
    if (amount > 0 && s) {
      s.coins += amount;
      s.stats.casinoWon = (s.stats.casinoWon || 0) + amount;
    }
    store();
    return amount;
  }
  function unlock(kind) {
    const s = save();
    if (!s) return false;
    if (kind === 'trail') {
      s.unlocks = s.unlocks || {};
      if (s.unlocks.rocketTrail) return false;
      s.unlocks.rocketTrail = Date.now();
      // La estela del Vestidor (entities/trails.js 'rocket'); si tu compañero no lleva ninguna, se la pone.
      s.trails = s.trails || {};
      s.trails.rocket = s.unlocks.rocketTrail;
      if (G.Dress && s.partner && !G.Dress.trailOf(s, s.partner)) G.Dress.set(s, s.partner, { tr: 'rocket' });
      return true;
    }
    s.skins = s.skins || {};
    if (s.skins[SKIN]) return false;
    s.skins[SKIN] = Date.now();
    // Si ya tienes a Mewtwo, se la pone (como al comprar una skin, data/shop.js).
    if (G.Skins && (!G.DB.owns || G.DB.owns(150))) G.Skins.wear(s, 150, SKIN);
    return true;
  }
  const hasTrail = () => !!(save() && save().unlocks && save().unlocks.rocketTrail);
  const hasSkin = () => !!(save() && save().skins && save().skins[SKIN]);

  // ---------------- tragaperras ----------------

  const SYM = ['berry', 'ball', 'voltorb', 'pika', 'seven', 'rocket'];
  const WEIGHT = { berry: 7, ball: 6, voltorb: 5, pika: 4, seven: 2, rocket: 2 };
  const TRIPLE = { rocket: 100, seven: 60, pika: 25, voltorb: 12, ball: 8, berry: 5 };
  const PAIR = { rocket: 5, berry: 2.5 };     // exactamente dos, en cualquier rodillo
  const WSUM = SYM.reduce((a, s) => a + WEIGHT[s], 0);

  function slotPay(r) {
    if (r[0] === r[1] && r[1] === r[2]) return TRIPLE[r[0]];
    for (const s in PAIR) if (r.filter(x => x === s).length === 2) return PAIR[s];
    return 0;
  }
  function slotSym(u) {
    let x = u * WSUM;
    for (const s of SYM) { if ((x -= WEIGHT[s]) < 0) return s; }
    return SYM[SYM.length - 1];
  }
  /** Lo que devuelve de media (exacto). */
  function slotRtp() {
    let ev = 0;
    for (const a of SYM) for (const b of SYM) for (const c of SYM) ev += WEIGHT[a] * WEIGHT[b] * WEIGHT[c] / WSUM ** 3 * slotPay([a, b, c]);
    return ev;
  }
  /** Una tirada: cobra, decide y paga ya (la animación sólo lo enseña). → resultado o { err } */
  function spin(bet) {
    const why = cantBet(bet);
    if (why) return { err: why };
    const r = charge('slots', bet);
    const reels = rig.slots || [slotSym(rng()), slotSym(rng()), slotSym(rng())];
    rig.slots = null;
    const mult = slotPay(reels);
    const jackpot = reels.every(s => s === 'rocket');
    const trail = jackpot && unlock('trail');
    const win = settle(r, bet * mult);
    return { reels, mult, win, jackpot, trail, bet };
  }

  // ---------------- Voltorb escondido ----------------

  const VF = { N: 25, M: 5, RTP: 0.95, CAP: 500 };
  function comb(n, k) { let r = 1; for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1); return r; }
  /** Multiplicador tras k cartas buenas. */
  function vfMult(k) {
    if (k <= 0) return 0;
    return Math.min(VF.CAP, Math.floor(VF.RTP * comb(VF.N, k) / comb(VF.N - VF.M, k) * 100) / 100);
  }
  let vf = null;           // { bet, round, voltorbs:Set, open:Set, k, over }
  function vfNew(bet) { vf = { bet, round: null, voltorbs: null, open: new Set(), k: 0, over: false }; return vf; }
  /** Levanta una carta. La primera cobra la apuesta. → { kind: 'coin'|'boom'|'err', ... } */
  function vfFlip(i) {
    if (!vf || vf.over || vf.open.has(i) || i < 0 || i >= VF.N) return { kind: 'none' };
    if (!vf.round) {
      const why = cantBet(vf.bet);
      if (why) return { kind: 'err', err: why };
      vf.round = charge('voltorb', vf.bet);
      // Dónde están los Voltorb se decide aquí (antes de levantar nada).
      const pos = rig.voltorb ? rig.voltorb.slice() : [];
      rig.voltorb = null;
      const free = [...Array(VF.N).keys()].filter(x => !pos.includes(x));
      while (pos.length < VF.M) pos.push(free.splice(Math.floor(rng() * free.length), 1)[0]);
      vf.voltorbs = new Set(pos);
    }
    vf.open.add(i);
    if (vf.voltorbs.has(i)) {
      vf.over = true; vf.lost = true;
      settle(vf.round, 0);
      return { kind: 'boom', lost: vf.bet };
    }
    vf.k++;
    // Todas las buenas levantadas: se cobra solo.
    if (vf.k >= VF.N - VF.M) { const win = vfCash(); return { kind: 'coin', mult: vfMult(vf.k), win, done: true }; }
    return { kind: 'coin', mult: vfMult(vf.k), next: vfMult(vf.k + 1) };
  }
  /** Plantarse: cobra lo que llevas (también al salir). → lo cobrado */
  function vfCash() {
    if (!vf || vf.over || !vf.round || !vf.k) return 0;
    vf.over = true;
    return settle(vf.round, vf.bet * vfMult(vf.k));
  }

  // ---------------- Carrera Rocket ----------------

  const RACERS = [78, 85, 59, 101, 291];       // Rapidash, Dodrio, Arcanine, Electrode, Ninjask
  const RACE_RTP = 0.9;
  let card = null;          // { p: [prob], odds: [pago] }
  function raceCard() {
    if (card) return card;
    const s = RACERS.map(() => (0.55 + rng()) ** 2);
    const tot = s.reduce((a, b) => a + b, 0);
    const p = s.map(x => x / tot);
    const odds = p.map(x => Math.max(1.1, Math.floor(RACE_RTP / x * 10) / 10));
    card = { p, odds };
    return card;
  }
  /** Apuesta a un corredor: cobra, decide y paga ya. → { winner, order, times, win, ... } o { err } */
  function race(bet, pick) {
    const why = cantBet(bet);
    if (why) return { err: why };
    const c = raceCard();
    const r = charge('race', bet);
    let winner = rig.race != null ? rig.race : -1;
    rig.race = null;
    if (winner < 0) { let u = rng(); winner = c.p.length - 1; for (let i = 0; i < c.p.length; i++) { if ((u -= c.p[i]) < 0) { winner = i; break; } } }
    // Tiempos de llegada: el ganador primero; los demás, detrás (por su forma, con algo de suerte).
    const times = c.p.map((p, i) => (i === winner ? 6 : 6.15 + rng() * 0.9 + (1 - p) * 0.5));
    const order = times.map((t, i) => i).sort((a, b) => times[a] - times[b]);
    const win = settle(r, winner === pick ? bet * c.odds[pick] : 0);
    const odds = c.odds[pick];
    card = null;            // la próxima carrera, con otra forma
    return { winner, order, times, win, pick, bet, odds };
  }

  // ---------------- ¡Atrapa a Pikachu! ----------------

  const PIKA = { FEE: 100, PRIZE: 150, BALLS: 3, CATCH: [0.75, 0.55, 0.35] };
  let pk = null;            // { round, stage, balls, over, won }
  /** Paga la entrada y empieza el primer plan. */
  function pkStart() {
    const why = cantBet(PIKA.FEE);
    if (why) return { err: why };
    pk = { round: charge('pika', PIKA.FEE), stage: 0, balls: PIKA.BALLS, over: false, won: false };
    return { stage: 0, balls: pk.balls };
  }
  /**
   * Lanza una bola. inside: ¿Pikachu estaba dentro del aro? → { res: 'miss'|'free'|'caught'|'won'|'lost', ... }
   * Al ganar: la skin (la primera vez) o PIKA.PRIZE monedas.
   */
  function pkThrow(inside) {
    if (!pk || pk.over) return { res: 'none' };
    pk.balls--;
    let res = 'miss';
    if (inside) {
      const ok = rig.pika != null ? rig.pika : rng() < PIKA.CATCH[pk.stage];
      rig.pika = null;
      res = ok ? 'caught' : 'free';
    }
    if (res === 'caught') {
      pk.stage++;
      pk.balls = PIKA.BALLS;
      if (pk.stage >= PIKA.CATCH.length) {
        pk.over = true; pk.won = true;
        const skin = unlock('skin');
        const coins = settle(pk.round, skin ? 0 : PIKA.PRIZE);
        return { res: 'won', skin, coins };
      }
      return { res, stage: pk.stage, balls: pk.balls };
    }
    if (pk.balls <= 0) { pk.over = true; settle(pk.round, 0); return { res: 'lost', stage: pk.stage, was: res }; }
    return { res, stage: pk.stage, balls: pk.balls };
  }
  /** Lo mejor posible (sin fallar nunca el aro): probabilidad de ganar. */
  function pkBest() { return PIKA.CATCH.reduce((a, c) => a * (1 - (1 - c) ** PIKA.BALLS), 1); }

  // ---------------- cuándo sale ----------------

  /** Una partida nueva (game.js). */
  function reset() {
    decided = false; want = false; visited = false;
    vf = null; pk = null; card = null; rig = {};
    if (G.CasinoUI && G.CasinoUI.isOpen) G.CasinoUI.hide();
  }
  const botOn = () => typeof window !== 'undefined' && !!window.__POKE_BOT_ON__;
  function eligible() {
    const pl = G.Game && G.Game.player;
    // Ni en grupo, ni con el bot, ni en el desafío semanal (systems/challenge.js: su ranking es de tiempo).
    return !!(pl && !pl.dead && save() && !(G.Coop && G.Coop.active) && !botOn() && !(G.Challenge && G.Challenge.cur));
  }
  /**
   * Lo llama la Sentencia (judgment.js) justo antes de empezar: → true si ahora toca el casino
   * (entonces la Sentencia espera a que salgas). Se decide una vez por partida.
   */
  function gate() {
    if (visited) return false;
    if (!decided) { decided = true; want = eligible() && rng() < CHANCE; }
    if (!want) return false;
    visited = true;
    return open();
  }
  function open() {
    if (!G.CasinoUI) return false;
    return G.Game.choose(done => G.CasinoUI.show(() => {
      // Al salir: lo que estuviera a medias en Voltorb escondido se cobra.
      vfCash();
      vf = null; pk = null;
      done();
    }));
  }

  return {
    BETS, SKIN, SYM, VF, PIKA, RACERS, CHANCE,
    balance, cantBet, needsNet, hasTrail, hasSkin,
    slotPay, slotRtp, spin,
    vfNew, vfFlip, vfCash, vfMult, get vf() { return vf; },
    raceCard, race,
    pkStart, pkThrow, pkBest, get pk() { return pk; },
    reset, gate,
    get isOpen() { return !!(G.CasinoUI && G.CasinoUI.isOpen); },
    keys() { if (G.CasinoUI) G.CasinoUI.keys(); },
    /** Para pruebas: abrir el casino ya (en partida). */
    debugOpen() { visited = true; decided = true; return open(); },
    /** Para pruebas: el siguiente resultado (slots: [3 símbolos], voltorb: [posiciones], race: índice, pika: true/false). */
    debugRig(o) { Object.assign(rig, o); },
    /** Para pruebas: otro generador de números al azar. */
    set rng(f) { rng = f || Math.random; }
  };
})();
