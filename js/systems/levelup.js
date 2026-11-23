/* ============ levelup.js — las cuatro cartas de subida de nivel ============
 * Tipos de carta:
 *   new     aprender un movimiento nuevo (sólo si quedan huecos de los 4; un vínculo libera huecos)
 *   up      mejorar un movimiento que ya tienes
 *   stat    mejora permanente de la run (casi todas con tope de veces)
 *   evolve  evolución de tu Pokémon en plena partida (niveles 20 y 40, ver Player.growDue)
 *
 * 16-11-2026 (como la Gran Actualización del juego oficial, hecho aquí a partir de sus
 * guías): cuatro cartas en vez de tres, cartas nuevas de crítico, cazador, esquiva y
 * suerte, la carta rara Sabiduría y la evolución en plena partida.
 */
G.LevelUp = (() => {

  const STATS = [
    { id: 'hp',   icon: 'heart', title: 'Vigor',        desc: '+20 de vida máxima (y la recupera).',
      apply: pl => pl.addMaxHp(20) },
    // (23-11-2026, como el juego oficial: las de stat no tienen tope de veces; sólo dejan de salir cuando ya
    //  no sirven: Coraza al 70 %, Ojo Crítico al 60 %, Golpe Brutal en ×3,5, Imán muy grande.)
    { id: 'atk',  icon: 'fist', title: 'Potencia',     desc: '+10% de daño con todos los movimientos.',
      apply: pl => pl.atkMul *= 1.10 },
    { id: 'spd',  icon: 'boot', title: 'Carrera',      desc: '+7% de velocidad de movimiento.',
      apply: pl => pl.spdMul *= 1.07 },
    // Cada vez un poco menos (la recarga nunca llega a cero): -8 %, -7,3 %, -6,7 %...
    { id: 'cd',   icon: 'clock', title: 'Reflejos',     desc: '-8% de recarga en todos los movimientos (cada vez un poco menos).',
      apply: pl => pl.cdMul *= 1 - 0.08 / (1 + 0.1 * (pl.statsTaken.cd || 0)) },
    { id: 'def',  icon: 'shield', title: 'Coraza',       desc: '+6% de reducción de daño recibido.',
      apply: pl => pl.dmgReduce = Math.min(0.8, pl.dmgReduce + 0.06), cond: pl => pl.dmgReduce < 0.8 },   // (sólo las cartas: el Chaleco Asalto no cuenta, #340)
    { id: 'rgn',  icon: 'sprout', title: 'Síntesis',     desc: '+0.9 de vida regenerada por segundo.',
      apply: pl => pl.regenFlat += 0.9 },
    { id: 'mag',  icon: 'magnet', title: 'Imán',         desc: '+30% de radio de recogida de experiencia.',
      apply: pl => pl.magnet *= 1.30, cond: pl => pl.magnet < 1600 },
    // Aprendizaje (hasta 15 veces) y la rara Sabiduría (una vez), como el juego oficial desde el 23-11-2026.
    { id: 'xp',   icon: 'book', title: 'Aprendizaje',  desc: '+12% de experiencia ganada.',
      apply: pl => pl.xpMul *= 1.12, max: 15 },
    { id: 'wis',  icon: 'book', title: 'Sabiduría',    desc: '+15% de experiencia en esta partida (sólo una vez).',
      apply: pl => pl.xpMul *= 1.15, max: 1, rare: true },
    { id: 'heal', icon: 'berry', title: 'Baya Zidra',   desc: 'Recupera el 45% de tu vida ahora mismo.',
      apply: pl => pl.heal(pl.maxHp * 0.45) },
    // Crítico: tope del 60 % de probabilidad y ×3,5 de daño (combat.js).
    { id: 'crit', icon: 'star', title: 'Ojo Crítico',   desc: '+2% de probabilidad de golpe crítico (tope: 60%).',
      apply: pl => pl.critChance = Math.min(0.6, pl.critChance + 0.02), cond: pl => pl.critChance < 0.6 },
    { id: 'critd', icon: 'up', title: 'Golpe Brutal',   desc: '+5% de daño en los golpes críticos (tope: ×3,5).',
      apply: pl => pl.critBonus += 0.05, cond: pl => 1.5 + (pl.critBonus || 0) < 3.5 },
    { id: 'boss', icon: 'trophy', title: 'Cazador',     desc: '+8% de daño a jefes y legendarios.',
      apply: pl => pl.bossMul += 0.08 },
    { id: 'dodge', icon: 'cursor', title: 'Esquiva',    desc: '3% de probabilidad de librarte de un golpe.',
      apply: pl => pl.dodge = Math.min(0.24, pl.dodge + 0.03), max: 8 },
    { id: 'luck', icon: 'coin', title: 'Racha de suerte', desc: '+10% de Pokémonedas en esta partida.',
      apply: pl => pl.coinMul *= 1.10, max: 5 },
    // Con un poder (systems/powers.js): menos recarga, cada vez un poco menos.
    { id: 'pcd', icon: 'clock', title: 'Poder rápido', desc: '-8% de recarga de tu poder (cada vez un poco menos).',
      apply: pl => pl.powerCdMul = (pl.powerCdMul || 1) * (1 - 0.08 / (1 + 0.1 * (pl.statsTaken.pcd || 0))), cond: pl => !!pl.powerId },
    // Sólo si ya puedes llevar tres (Mejoras Segundo y Tercer objeto).
    { id: 'slot4', icon: 'bag', title: 'Cuarto objeto', desc: 'Puedes llevar un objeto más en esta partida.',
      apply: pl => pl.itemSlots = 4, max: 1, rare: true, cond: pl => pl.itemSlots === 3 }
  ];

  /** n elementos distintos de list, cada uno con probabilidad según weight(x). */
  function pickWeighted(list, n, weight) {
    const rest = list.map(x => [x, weight(x)]), out = [];
    while (out.length < n && rest.length) {
      let r = Math.random() * rest.reduce((a, [, w]) => a + w, 0), i = 0;
      while (i < rest.length - 1 && (r -= rest[i][1]) > 0) i++;
      out.push(rest.splice(i, 1)[0][0]);
    }
    return out;
  }

  /** Construye el conjunto de cartas candidatas, con pesos. */
  function candidates(pl) {
    const out = [];
    // Si es de su lado flojo, cuánto rinde (Machamp con Bola Sombra...).
    // Copia local: también se dice cuando rinde bien, y va en las cartas de mejora.
    const fitNote = (mon, cat) => {
      if (!cat) return '';
      const f = G.Stats.fit(mon, cat);
      return f < 0.95 ? ` <span class="fit-low">Con ${mon.name} rinde un ${Math.round(f * 100)} %: pega mejor con ataques ${G.Stats.sideOf(mon) === 'special' ? 'especiales' : 'físicos'}.</span>`
                      : ` <span class="fit-ok">Con ${mon.name} rinde al ${Math.round(f * 100)} %.</span>`;
    };

    // --- movimientos nuevos ---
    if (pl.slots.length < pl.maxMoves) {
      // Con 2 potenciadores ya no se ofrecen más: los buff no hacen daño y
      // llenar los 4 huecos con ellos deja la run sin salida.
      const buffs = pl.moves.filter(m => m.kind === 'buff').length;
      // (Los de su Pokémon, no los de la forma Mega ni del tipo Tera que lleve puestos.)
      const pool = G.Moves.poolFor(pl.ownMon || pl.mon).filter(id =>
        !pl.hasMove(id) && !(pl.banned && pl.banned.has(id)) && !(buffs >= 2 && G.Moves.BY_ID[id].kind === 'buff'));
      // Los de su lado bueno (y los empatados y mejoras) salen el doble.
      const weight = id => { const d = G.Moves.BY_ID[id]; return G.Stats.fit(pl.mon, d.cat) >= 0.999 ? 2 : 1; };
      for (const id of pickWeighted(pool, 6, weight)) {
        const d = G.Moves.BY_ID[id];
        out.push({
          w: 10, type: 'new', key: 'new:' + id, buff: d.kind === 'buff', mkind: d.kind, stat: d.stat, cat: d.cat,
          icon: 'move:' + id, color: G.U.TYPE_COLOR[d.type],
          // (Físico o especial va en su propia etiqueta, con borde: ver run-ui.js. Los
          // potenciadores no tienen categoría, pero Danza Espada y Danza Dragón suben el
          // ataque físico y Maquinación el especial: llevan la del lado que suben.)
          tag: G.U.TYPE_NAME[d.type],
          cat: G.Stats.NAME[d.cat || (d.stat === 'patk' ? 'physical' : d.stat === 'satk' ? 'special' : '')] || '',
          title: G.T(d.name, 'move'), desc: d.desc + fitNote(pl.mon, d.cat),
          apply: p => p.addMove(id)
        });
      }
    }

    // --- evoluciones: movimiento al máximo + su condición cumplida ---
    const waiting = {};                   // stat -> movimiento que la espera para evolucionar
    for (const m of pl.moves) {
      const ev = G.Moves.evoInfo(m, pl.statsTaken);
      if (!ev) continue;
      if (!ev.ready) { waiting[ev.needs] = m; continue; }
      out.push({
        w: 40, type: 'evo', key: 'evo:' + m.id,
        icon: 'move:' + m.id, color: '#ffd23f', tag: 'EVOLUCIÓN',
        title: G.T(m.name, 'move') + ' → ' + G.T(ev.name, 'move'), desc: ev.text,
        apply: p => {
          G.Moves.evolve(m);
          G.FX.ring(p.x, p.y, 8, 120, '#ffd23f', 0.8, 6);
          G.FX.burst(p.x, p.y - p.bodyH * 0.5, '#ffe14d', 40, 240);
          G.Audio.sfx('legend');
          G.Progress.event('evolve', { move: m.id });
        }
      });
    }

    // --- mejoras de movimientos que ya tienes ---
    for (const m of pl.moves) {
      const txt = G.Moves.nextUpText(m);
      if (!txt) continue;
      out.push({
        w: 8, type: 'up', key: 'up:' + m.id, cat: m.cat,
        icon: 'move:' + m.id, color: G.U.TYPE_COLOR[m.type],
        tag: 'Nv.' + m.lvl + ' > ' + (m.lvl + 1) + (m.cat ? ' · ' + G.Stats.NAME[m.cat] : ''),   // copia local: + categoría
        title: G.T(m.name, 'move'), desc: txt + fitNote(pl.mon, m.cat),
        apply: () => G.Moves.levelUp(m)
      });
    }

    // --- stats ---
    // Las que desbloquean una evolución salen siempre y con aviso.
    // Cada mejora tiene un tope de veces (`max`): en partidas muy largas se
    // acumulaban sin fin (velocidad, recarga y experiencia por las nubes) y el
    // juego acababa colgándose. Las que piden una evolución salen siempre.
    const room = s => (!s.max || (pl.statsTaken[s.id] || 0) < s.max) && (!s.cond || s.cond(pl));
    const pickStats = G.U.pickN(STATS.filter(s => !waiting[s.id] && room(s)), 6).concat(STATS.filter(s => waiting[s.id]));
    for (const s of pickStats) {
      const evoFor = waiting[s.id];
      out.push({
        w: evoFor ? 14 : s.rare ? 1.2 : pl.slots.length < pl.maxMoves ? 4 : 7,
        type: 'stat', key: 'stat:' + s.id, evoFor: !!evoFor,   // copia local: evoFor lo lee en/bot.js (data-evo)
        icon: s.icon, color: evoFor ? '#ffd23f' : s.rare ? '#c9a6ff' : '#8fa3c4',
        tag: evoFor ? 'Evoluciona ' + G.T(evoFor.name, 'move') : s.rare ? 'Carta rara' : 'Mejora',
        title: s.title, desc: s.desc,
        apply: p => { s.apply(p); p.statsTaken[s.id] = (p.statsTaken[s.id] || 0) + 1; }
      });
    }

    return out;
  }

  /**
   * Evolución en plena partida (niveles 20 y 40): en vez de las cartas de ese nivel
   * salen las de evolucionar (una por cada evolución que tenga: Eevee, varias) y la de
   * seguir como está, que sube los stats igual. Los que no evolucionan se hacen más
   * fuertes sin elegir nada (Player.grow) y sus cartas salen como siempre.
   */
  function evolveCards(pl, evos) {
    G.Sprites.preload(evos.map(m => m.dex), 8000, pl.shiny);
    const from = pl.mon.name;
    const cards = evos.map(m => ({
      type: 'evolve', key: 'evolve:' + m.dex, dex: m.dex, shiny: pl.shiny,
      icon: 'up', color: '#ffd23f', tag: 'EVOLUCIÓN',
      title: G.I18n.f('Evolucionar a {x}', G.T(m.name, 'mon')), desc: 'Cambia de aspecto y de tipo, y suben sus stats.',
      apply: p => {
        p.evolveTo(m.dex, false);
        G.FX.ring(p.x, p.y, 8, 150, '#ffd23f', 0.9, 6);
        G.FX.burst(p.x, p.y - p.bodyH * 0.5, '#fff3b0', 50, 260);
        G.Audio.sfx('legend');
        G.Spawner.say(G.I18n.f('¡{x} ha evolucionado a {x}!', G.T(from, 'mon'), G.T(m.name, 'mon')), 3.2, true);
      }
    }));
    const first = evos[0];
    cards.push({
      type: 'evolve', key: 'evolve:keep', dex: pl.dex, shiny: pl.shiny,
      icon: 'shield', color: '#8fa3c4', tag: 'Mejora',
      title: G.I18n.f('Seguir como {x}', G.T(from, 'mon')), desc: 'Mantiene su aspecto y su tipo. Sus stats suben igual.',
      apply: p => {
        // (Si empezó más flojo, sube por su escalera de fuerza; si no, coge los stats de la evolución.)
        if (p.ladder) p.stepLadder(); else p.evolveTo(first.dex, true);
        G.FX.ring(p.x, p.y, 8, 120, '#bfe8ff', 0.8, 5);
        G.Audio.sfx('levelup');
        G.Spawner.say(G.I18n.f('¡{x} se hace más fuerte!', G.T(from, 'mon')), 2.6, true);
      }
    });
    return cards;
  }

  /** Devuelve 4 cartas distintas, elegidas por peso. */
  function offer(pl, n = 4) {
    if (pl.growDue && pl.growDue()) {
      const evos = pl.evoOptions();
      if (evos.length) return evolveCards(pl, evos);
      pl.stepLadder();
      G.FX.ring(pl.x, pl.y, 8, 120, '#bfe8ff', 0.8, 5);
      G.Spawner.say(G.I18n.f('¡{x} se hace más fuerte!', G.T(pl.mon.name, 'mon')), 2.6, true);
    }
    const pool = candidates(pl);
    const picked = [];
    const used = new Set();
    // Si hay una evolución lista, su carta dorada sale siempre.
    const evo = pool.findIndex(c => c.type === 'evo');
    if (evo >= 0) { const c = pool.splice(evo, 1)[0]; used.add(c.key); picked.push(c); }

    while (picked.length < n && pool.length) {
      const total = pool.reduce((a, c) => a + c.w, 0);
      let r = Math.random() * total, idx = 0;
      for (let i = 0; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) { idx = i; break; } }
      const c = pool.splice(idx, 1)[0];
      if (used.has(c.key)) continue;
      used.add(c.key);
      picked.push(c);
    }
    return picked;
  }

  return { offer, evolveCards, STATS };
})();
