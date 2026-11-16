/* ============ items.js — objetos equipables ============
 * Se encuentran en los cofres (a veces en los normales, a menudo en los de
 * candado) y los sueltan los jefes. Llevas uno a la vez (dos y tres con las
 * Mejoras Segundo y Tercer objeto, y un cuarto con la carta rara); si
 * encuentras otro con los huecos llenos, eliges cuál cambias. Duran lo que
 * dura la run.
 *
 *   on(pl)   se lo pones (lo que hace mientras lo llevas)
 *   off(pl)  se lo quitas (deshace lo de on)
 * Los que reaccionan a algo (golpe mortal, daño hecho...) los mira el
 * jugador con pl.hasItem(id).
 */
G.Items = (() => {
  const LIST = [
    { id: 'leftovers', name: 'Restos', desc: 'Recuperas un 1,5% de tu vida por segundo.',
      on: p => { p.regenFlat += p.maxHp * 0.015; p._itemRegen = p.maxHp * 0.015; },
      off: p => { p.regenFlat -= p._itemRegen || 0; } },
    { id: 'choiceband', name: 'Cinta Elección', desc: '+40% de daño, pero no puedes cambiar de movimiento.',
      on: p => { p.atkMul *= 1.4; }, off: p => { p.atkMul /= 1.4; } },
    { id: 'quickclaw', name: 'Garra Rápida', desc: '-20% de recarga en todos tus movimientos.',
      on: p => { p.cdMul *= 0.8; }, off: p => { p.cdMul /= 0.8; } },
    { id: 'focussash', name: 'Banda Focus', desc: 'Un golpe que te dejaría KO te deja con 1 de vida (cada 60 s).',
      on: () => {}, off: () => {} },
    { id: 'shellbell', name: 'Cascabel Concha', desc: 'Recuperas vida con el daño que haces.',
      on: () => {}, off: () => {} },
    { id: 'amuletcoin', name: 'Moneda Amuleto', desc: '+50% de Pokémonedas al acabar la run.',
      on: p => { p.coinMul *= 1.5; }, off: p => { p.coinMul /= 1.5; } },
    { id: 'luckyegg', name: 'Huevo Suerte', desc: '+30% de experiencia.',
      on: p => { p.xpMul *= 1.3; }, off: p => { p.xpMul /= 1.3; } },
    { id: 'lifeorb', name: 'Vidasfera', desc: '+30% de daño, pero cada ataque te quita un poco de vida.',
      on: p => { p.atkMul *= 1.3; }, off: p => { p.atkMul /= 1.3; } },
    { id: 'choicescarf', name: 'Pañuelo Elección', desc: '+35% de velocidad.',
      on: p => { p.spdMul *= 1.35; }, off: p => { p.spdMul /= 1.35; } },
    { id: 'rockyhelmet', name: 'Casco Dentado', desc: 'Los que te golpean cuerpo a cuerpo reciben daño.',
      on: () => {}, off: () => {} },
    { id: 'assaultvest', name: 'Chaleco Asalto', desc: '+20% de reducción de daño recibido.',
      // (aparte del tope del 70 % de las cartas Coraza: ver Player.reduction)
      on: p => { p.itemReduce += 0.2; }, off: p => { p.itemReduce -= 0.2; } },
    // ---- 16-11-2026 (como la Gran Actualización del juego oficial; lo que hace cada uno se mira con
    //      pl.hasItem(id) en el sitio que toca: player.js, combat.js, hazards.js, interact.js, enemy.js...) ----
    { id: 'heavyboots', name: 'Botas Gruesas', desc: 'Las trampas no te afectan, la lava no te quema y el agua no te frena.',
      on: () => {}, off: () => {} },
    { id: 'metronome', name: 'Metrónomo', desc: 'Cada 3 s seguidos con el mismo ataque: +6% de daño, hasta +48%. Se pierde al cambiar de ataque.',
      on: p => { p.metroT = 0; }, off: () => {} },
    { id: 'powerherb', name: 'Hierba Copia', desc: 'Los poderes de los altares te duran el doble.',
      on: () => {}, off: () => {} },
    { id: 'covertcloak', name: 'Capa Furtiva', desc: 'Los enemigos que curan o ponen escudos no ayudan a los que tienes cerca.',
      on: () => {}, off: () => {} },
    { id: 'punchingglove', name: 'Guante de Boxeo', desc: '+30% de daño con los ataques físicos cuerpo a cuerpo.',
      on: () => {}, off: () => {} },
    { id: 'earplugs', name: 'Supertapones', desc: 'Los ataques con aviso en el suelo te quitan un 30% menos.',
      on: () => {}, off: () => {} },
    { id: 'throatspray', name: 'Espray Bucal', desc: '+25% de Ataque Especial durante 8 s al cambiar de ataque (cada 12 s como mucho).',
      on: p => { p.sprayT = 0; p.sprayCd = 0; }, off: p => { p.sprayT = 0; } },
    { id: 'loadeddice', name: 'Dado Trucado', desc: 'Los ataques con varios proyectiles lanzan uno más.',
      on: () => {}, off: () => {} },
    { id: 'safetygoggles', name: 'Gafa Protectora', desc: 'Los climas no te debilitan ni te frenan (sí te potencian).',
      on: () => {}, off: () => {} },
    { id: 'expcharm', name: 'Amuleto Exp.', desc: '+20% de experiencia y +10% de Pokémonedas.',
      on: p => { p.xpMul *= 1.2; p.coinMul *= 1.1; }, off: p => { p.xpMul /= 1.2; p.coinMul /= 1.1; } },
    { id: 'luckincense', name: 'Incienso Suerte', desc: '+60% de Pokémonedas, pero −15% de daño.',
      on: p => { p.coinMul *= 1.6; p.atkMul *= 0.85; }, off: p => { p.coinMul /= 1.6; p.atkMul /= 0.85; } },
    { id: 'rareincense', name: 'Incienso Raro', desc: 'Los shiny salvajes salen el doble de a menudo (en grupo, si lo lleva el anfitrión).',
      on: () => {}, off: () => {} }
  ];
  const BY = {};
  for (const it of LIST) BY[it.id] = it;

  /** Uno al azar, distinto de los que ya llevas (`except`: un id o una lista). */
  function roll(except) {
    const no = Array.isArray(except) ? except : [except];
    const pool = LIST.filter(i => !no.includes(i.id));
    return G.U.pick(pool.length ? pool : LIST).id;
  }

  return { LIST, BY, roll };
})();
