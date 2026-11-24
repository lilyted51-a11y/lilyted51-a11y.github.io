/* ============ guide-ui.js — las Guías del juego (Ajustes › Guías) ============
 * (24-11-2026; como las Guías de la Gran Actualización del juego oficial, hechas aquí con nuestras
 *  palabras: el oficial sólo ha servido para saber qué temas tocar.)
 * Una portada con Pokémon paseando por detrás y nueve apartados: Cómo se juega, Pokémon,
 * Movimientos, Objetos, Mejoras, Poderes, Jefes finales, Eventos y Maestría.
 *
 * Las listas salen de los datos del propio juego, así que lo que se añada luego aparece solo:
 *   Movimientos   G.Moves.ALL (tipo, forma de atacar, físico / especial, qué hace) y su evolución
 *                 (G.Moves.EVO + evoInfo: el «+», la carta que lo evoluciona y lo que gana)
 *   Objetos       G.Items.LIST, G.Consum.DEF (de un solo uso), G.Orbs.LIST (esferas)
 *   Mejoras       G.Upgrades.LIST (permanentes) y G.LevelUp.STATS (cartas de la partida)
 *   Poderes       G.Powers.DEF (duración y recarga) · Jefes: G.Judgment.MOVES · Eventos: G.Weather.KINDS
 *   Maestría      G.Mastery.TIERS · Pokémon: los stats de tu compañero (G.Mons.ladderFor, G.EVOS)
 *   Controles     las teclas puestas (core/keys.js)
 *
 * Se abre por encima de Ajustes (z-index 62). Esc, «atrás» del móvil y B del mando: de un apartado a
 * la portada y de la portada fuera (SettingsUI.back → back); tocar fuera del recuadro la cierra.
 * Todo el texto va en español y se traduce como el resto (lang-en.js, zh-tw.js).
 */
G.GuideUI = (() => {
  const esc = G.U.esc;
  let el = null, view = 'cover', raf = 0, walkers = [], lastT = 0;

  const SECTIONS = [
    { id: 'play', icon: 'cursor', title: 'Cómo se juega', sub: 'Moverse, atacar, subir de nivel y lo que ganas' },
    { id: 'mons', icon: 'user', title: 'Pokémon', sub: 'Sus stats, cómo crecen y la evolución en la partida' },
    { id: 'moves', icon: 'cards', title: 'Movimientos', sub: 'Todos los ataques, con qué stat pegan y su evolución' },
    { id: 'items', icon: 'bag', title: 'Objetos', sub: 'Objetos equipables, de un solo uso y esferas' },
    { id: 'upgrades', icon: 'up', title: 'Mejoras', sub: 'Mejoras permanentes y cartas de la partida' },
    { id: 'powers', icon: 'star', title: 'Poderes', sub: 'Megaevolución, Dinamax, Pulsera Z y Teracristal' },
    { id: 'bosses', icon: 'crown', title: 'Jefes finales', sub: 'Eternatus y la Sentencia de Arceus' },
    { id: 'events', icon: 'clock', title: 'Eventos', sub: 'Lo que puede pasar durante una partida' },
    { id: 'mastery', icon: 'medal3', title: 'Maestría', sub: 'Puntos y premios por jugar con un Pokémon' }
  ];

  // Cómo se llama cada forma de atacar (G.Moves, kind). Nombres que no coinciden con ningún movimiento.
  const KIND = {
    projectile: 'Disparo', melee: 'Cuerpo a cuerpo', beam: 'Rayo recto', orbit: 'Órbita', nova: 'Ráfaga circular',
    aura: 'Aura de daño', buff: 'Potenciador', boomerang: 'Bumerán', chain: 'Cadena', mine: 'Minas', meteor: 'Meteoros',
    turret: 'Torreta', dash: 'Embestida', trail: 'Rastro', cone: 'Abanico', homing: 'Teledirigido', bounce: 'Rebote',
    charge: 'Rayo cargado', spin: 'Giro', quake: 'Onda sísmica', vortex: 'Torbellino de daño', shove: 'Empujón', stun: 'Aturdidor',
    // las de systems/moves2.js (24-11-2026)
    rush: 'Saltos en cadena', explode: 'Estallido', storm: 'Rayos del cielo', cross: 'Golpe en cruz', punch: 'Puñetazos',
    wave: 'Ola', tremor: 'Temblor', leap: 'Salto', scissor: 'Tijeretazo'
  };

  // ---------------- piezas ----------------
  const H = t => `<h3 class="gd-h">${esc(t)}</h3>`;
  const P = t => `<p class="gd-p">${esc(t)}</p>`;
  const UL = list => `<ul class="gd-ul">${list.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  const chip = (t, col) => `<span class="type" style="background:${col}">${esc(t)}</span>`;
  /** Una ficha: icono, nombre, etiqueta y lo que hace. */
  const card = (icon, name, tag, desc, extra = '') => `<div class="gd-card">
      <div class="gd-ic">${icon ? G.Icons.html(icon, 28) : ''}</div>
      <div class="gd-tx"><div class="gd-nm"><b>${esc(name)}</b>${tag ? ' <span class="gd-tag">' + esc(tag) + '</span>' : ''}</div>
      <div class="gd-ds">${esc(desc)}</div>${extra}</div></div>`;
  /** Un grupo con título, explicación y fichas (el buscador lo esconde entero si no queda nada). */
  const grp = (h, p, cards) => `<div class="gd-grp">${H(h)}${p ? P(p) : ''}<div class="gd-list">${cards.join('')}</div></div>`;
  const search = ph => `<input id="guide-q" class="field gd-q" type="search" placeholder="${esc(ph)}" autocomplete="off">`;

  // ---------------- apartados ----------------

  function play() {
    const k = a => G.Keys.kbd(a, true);
    const row = (what, keys) => `<div class="gd-kv"><span>${esc(what)}</span><span>${keys}</span></div>`;
    return H('Lo básico')
      + P('Tú mueves a tu Pokémon y él ataca solo: lanza su movimiento activo al enemigo más cercano sin que tengas que apuntar (en Ajustes › Accesibilidad puedes apuntar a mano).')
      + P('Los enemigos llegan en oleadas cada vez más duras. Aguanta todo lo que puedas: cuanto más dures, más Pokémonedas y tickets te llevas al acabar.')
      + H('Subir de nivel')
      + P('Los enemigos derrotados sueltan cristales de experiencia. En cada nivel eliges una de cuatro cartas: aprender un movimiento, mejorar uno que ya tienes (hasta el nivel 5) o una mejora para el resto de la partida.')
      + P('Llevas hasta cuatro movimientos, pero sólo ataca el activo: cámbialo según lo que tengas delante. Un movimiento al nivel máximo puede evolucionar (mira Movimientos).')
      + H('Controles en el ordenador')
      + `<div class="gd-keys">${row('Moverse', k('up') + ' ' + k('left') + ' ' + k('down') + ' ' + k('right'))}
          ${row('Elegir ataque', [1, 2, 3, 4].map(i => G.Keys.kbd('move' + i)).join(' '))}
          ${row('Ataque anterior / siguiente', k('prev') + ' · ' + k('next'))}
          ${row('Usar el poder', k('power'))}
          ${row('Usar una esfera', [1, 2, 3, 4].map(i => G.Keys.kbd('orb' + i)).join(' '))}
          ${row('Pausa', '<kbd>Esc</kbd> ' + k('pause'))}
          ${row('Elegir carta', [1, 2, 3, 4].map(i => G.Keys.kbd('card' + i)).join(' ') + ' · ' + k('reroll'))}</div>`
      + P('Todas estas teclas se pueden cambiar en Ajustes › Controles.')
      + H('Móvil y mando')
      + P('En el móvil arrastras el dedo para moverte, tocas un ataque para activarlo y tocas una esfera para usarla. Los botones se pueden colocar a tu gusto en Ajustes › Controles.')
      + P('Con mando: stick izquierdo para moverte, LB / RB para cambiar de ataque, B para el poder, X / Y para las esferas y Start para la pausa.')
      + H('Lo que te encuentras')
      + UL(['Cofres: rómpelos a golpes. Los grandes traen objetos.',
            'Cada 4 minutos cambia el bioma y, con él, los Pokémon que salen.',
            'Jefes: llegan con aviso, pegan fuerte y sueltan mejores premios.',
            'Grietas: portales a la arena de un legendario. Si lo vences, ganas un vínculo para juntar movimientos en un solo hueco.',
            'Clima: sol, lluvia, arena, nieve o niebla cambian durante un rato la fuerza de cada tipo.'])
      + H('Al acabar')
      + P('Las Pokémonedas se gastan en Mejoras y los tickets en el gacha, donde salen Pokémon nuevos. Cada partida suma además Maestría al Pokémon con el que juegas.')
      + P('Con tus amigos podéis jugar en grupo en la misma partida: si caes, un compañero puede levantarte.');
  }

  function mons() {
    const STATS = [['Vida', 'Los golpes que aguantas.'], ['Ataque', 'Lo que pegan sus movimientos físicos.'],
      ['At. Esp.', 'Lo que pegan sus movimientos especiales.'], ['Defensa', 'Te protege de los golpes físicos.'],
      ['Def. Esp.', 'Te protege de los golpes especiales.'], ['Velocidad', 'Lo rápido que te mueves.']];
    let out = H('Sus stats')
      + P('Cada Pokémon trae los stats de los juegos, adaptados a la partida:')
      + `<div class="gd-keys">${STATS.map(([a, b]) => `<div class="gd-kv"><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join('')}</div>`
      + H('Físico o especial')
      + P('Los movimientos físicos pegan con su Ataque y los especiales con su Ataque Especial. Con su lado fuerte pega al 100 %; con el otro, en proporción. Cada carta de movimiento te dice cuánto rinde con tu Pokémon.')
      + P('La naturaleza sube un stat un 10 % y baja otro un 10 %, y la habilidad añade un efecto en la partida. Las dos se ven y se cambian en la ficha del Pokémon (Mentas y Cápsulas de la Tienda Kecleon).')
      + H('Cómo crecen con el nivel')
      + P('Subir de nivel no cambia sus stats: lo que te hace más fuerte son las cartas. Los saltos llegan en los niveles 20 y 40:')
      + UL(['Si puede evolucionar, en esos niveles sale la carta de evolución: evoluciona en plena partida y pasa a los stats de su evolución, con tu vida y tus cartas.',
            'Si ya está evolucionado o no evoluciona, empieza algo más flojo y gana fuerza en los niveles 20 y 40 hasta llegar a la suya.']);
    // Con tu compañero de ejemplo (sus números de verdad).
    const dex = G.DB.save && G.DB.save.partner, mon = dex && G.Mons.monFor(dex);
    if (mon) {
      const f = s => [Math.round(s.hp), '×' + s.pa.toFixed(2), '×' + s.sa.toFixed(2), Math.round(s.df), Math.round(s.sd), Math.round(s.spd)];
      const head = ['', 'Vida', 'Ataque', 'At. Esp.', 'Defensa', 'Def. Esp.', 'Velocidad'];
      const rows = [];
      const lad = G.Mons.ladderFor(mon);
      if (lad) lad.forEach((s, i) => rows.push([G.I18n.f('Nv. {x}', [1, 20, 40][i]), ...f(s)]));
      else {
        rows.push([G.T(mon.name, 'mon'), ...f(mon)]);
        let d = dex;
        for (let i = 0; i < 2; i++) { const n = (G.EVOS[d] || [])[0]; if (!n || !G.DEX_BY[n]) break; rows.push([G.T(G.DEX_BY[n].name, 'mon'), ...f(G.DEX_BY[n])]); d = n; }
      }
      out += H(G.I18n.f('Tu compañero: {x}', G.T(mon.name, 'mon')))
        + P(lad ? 'Sus stats en la partida, del nivel 1 al 40:' : 'Evoluciona en la partida. Sus stats y los de sus evoluciones:')
        + `<div class="gd-tbl-w"><table class="gd-tbl"><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`).join('')}</tr>`).join('')}</table></div>`;
    }
    return out;
  }

  /** Lo que se sabe de un movimiento: forma, stat, evolución. */
  function moveInfo(m) {
    const evo = G.Moves.EVO[m.id] ? G.Moves.evoInfo({ id: m.id, kind: m.kind, lvl: 9, evolved: false, def: { maxLvl: 1, name: m.name } }, {}) : null;
    return { evo, stat: m.cat === 'physical' ? 'Ataque' : m.cat === 'special' ? 'At. Esp.' : '' };
  }
  function moves() {
    const all = G.Moves.ALL, evos = all.filter(m => moveInfo(m).evo).length;
    const types = [...new Set(all.map(m => m.type))];
    const rows = all.map(m => {
      const { evo, stat } = moveInfo(m), col = G.U.TYPE_COLOR[m.type];
      const meta = `<div class="gd-meta">${chip(G.U.TYPE_NAME[m.type], col)} <span class="gd-tag">${esc(KIND[m.kind] || m.kind)}</span> `
        + (stat ? `<span class="gd-tag cat">${esc(G.Stats.NAME[m.cat])}</span> <span class="gd-k">${esc('Escala con')}</span> <b>${esc(stat)}</b>`
                : `<span class="gd-k">${esc('No hace daño')}</span>`) + '</div>';
      const ev = evo ? `<div class="gd-evo"><span class="gd-k">${esc('Evoluciona a')}</span> <b class="gd-mvn">${esc(evo.name)}</b> <span class="gd-k">${esc('con la carta')}</span> <b>${esc(evo.needName)}</b><span class="gd-k">:</span> <span>${esc(evo.text)}</span></div>`
        : (m.kind === 'buff' ? '' : `<div class="gd-evo"><span class="gd-k">${esc('No evoluciona')}</span></div>`);
      return `<div class="gd-card gd-move" data-type="${m.type}" data-id="${m.id}">
        <div class="gd-ic">${G.Icons.html('move:' + m.id, 28)}</div>
        <div class="gd-tx"><div class="gd-nm"><b class="gd-mvn">${esc(m.name)}</b></div>${meta}<div class="gd-ds">${esc(m.desc)}</div>${ev}</div></div>`;
    }).join('');
    return P(G.I18n.f('{x} movimientos de {x} tipos; {x} pueden evolucionar.', all.length, types.length, evos))
      + P('Llévalo al nivel máximo, coge alguna vez la carta de mejora que pide (Potencia, Vigor, Reflejos…) y saldrá una carta dorada para evolucionarlo. Los potenciadores no evolucionan.')
      + P('Los físicos pegan con el Ataque de tu Pokémon y los especiales con su Ataque Especial; los enemigos se defienden de cada uno con su Defensa o su Defensa Especial.')
      + `<div class="gd-tools">${search('Buscar un movimiento…')}
          <div class="chips gd-types"><button class="chip on" data-ft="">${esc('Todos')}</button>${types.map(t => `<button class="chip" data-ft="${t}" style="border-color:${G.U.TYPE_COLOR[t]}">${esc(G.U.TYPE_NAME[t])}</button>`).join('')}</div></div>`
      + `<p class="note gd-none hidden">${esc('Ningún movimiento coincide.')}</p><div class="gd-list">${rows}</div>`;
  }

  function items() {
    if (G.Consum.icons) G.Consum.icons();
    return P('Los objetos se consiguen en los cofres grandes, de los jefes y con algunos eventos. De serie llevas uno; con las mejoras y las cartas, hasta cuatro. Si coges uno con los huecos llenos, eliges cuál se queda.')
      + search('Buscar un objeto…')
      + grp('Objetos equipables', '', G.Items.LIST.map(it => card(it.id, it.name, '', it.desc)))
      + grp('De un solo uso', 'Se cogen del suelo y se gastan al momento (las bayas, cuando hace falta).',
            G.Consum.IDS.map(id => card('use:' + id, G.Consum.DEF[id].name, '', G.Consum.DEF[id].desc)))
      + grp('Esferas', G.I18n.f('Las guardas para cuando las necesites: hasta {x} distintas y {x} de cada una. Se usan con sus teclas, tocándolas encima de los ataques o con X / Y en el mando. A los jefes y legendarios les afectan menos.', G.Orbs.SLOTS, G.Orbs.STACK),
            G.Orbs.LIST.map(o => card('orb:' + o.id, o.name, '', o.desc)))
      + `<p class="note gd-none hidden">${esc('Nada coincide.')}</p>`;
  }

  function upgrades() {
    return H('Mejoras permanentes')
      + P('Se compran con Pokémonedas en el menú (Mejoras) y valen para todos tus Pokémon en todas las partidas. Cada nivel cuesta un poco más que el anterior.')
      + `<div class="gd-list">${G.Upgrades.LIST.map(u => card(u.icon, u.name, G.I18n.f('Máx. {x}', u.max), u.unit)).join('')}</div>`
      + H('Cartas de mejora de la partida')
      + P('Salen al subir de nivel, junto a las de movimientos, y sólo duran esa partida. Algunas dejan de salir cuando ya no sirven (por ejemplo, Coraza al llegar a su tope).')
      + `<div class="gd-list">${G.LevelUp.STATS.map(s => card(s.icon, s.title, s.rare ? 'Carta rara' : '', s.desc)).join('')}</div>`;
  }

  function powers() {
    const D = G.Powers.DEF;
    const TXT = {
      mega: 'Pasa a su forma Mega (o a su forma de poder, como las fusiones): tipos, aspecto y stats de esa forma. Sólo sale si tu Pokémon la tiene.',
      dyna: 'Se hace gigante: doble de vida, +40 % de daño, cada golpe salpica alrededor y aplasta a los Pokémon normales que pisa.',
      z: 'Cada poco lanza una gran Z de un tipo que atraviesa todo y, al terminar, un movimiento Z golpea a todos los de la pantalla.',
      tera: 'Pasa a ser sólo del tipo que elijas y sus ataques de ese tipo pegan mucho más. Astral conserva sus tipos y lo sube todo un poco.'
    };
    return P(G.I18n.f('Al vencer a Eternatus (minuto 20) eliges un poder para el resto de la partida. Se usa con {x} (B en el mando, o su botón redondo en el móvil) y se recarga solo. La carta Poder rápido acorta la recarga.', G.T(G.Keys.label('power'))))
      + `<div class="gd-list">${Object.keys(D).map(id => card(D[id].icon, D[id].name, G.I18n.f('{x} s · recarga {x} s', D[id].dur, D[id].cd), TXT[id] || '')).join('')}</div>`
      + P('En grupo, cada uno elige el suyo. La barra del poder va debajo de tu vida y parpadea cuando está listo.');
  }

  function bosses() {
    const J = G.Judgment, mm = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    return H('Eternatus Eternamax · minuto 20')
      + P('El cielo se vuelve rojo y todos viajáis a la Cima de la Torre. Eternatus no se mueve, pero llena la arena de rayos, charcos tóxicos y anillos de energía. Un golpe no le quita más del 10 % de su vida.')
      + UL(['Fase 1: rayos en barrido, charcos de veneno que duran y anillos de orbes.',
            'Fase 2: cuatro Núcleos Dinamax le protegen; rómpelos (cada uno suelta una cura) mientras esquivas los láseres entre ellos.',
            'Fase 3: espirales, oscuridad con sólo tres círculos de luz, rayos dobles y un remolino que te arrastra.',
            'Al final carga el Rayo Eternamax: rompe el Núcleo Eterno para dejarlo aturdido, o ponte dentro de un círculo seguro.'])
      + P('Si ganáis: Pokémonedas, un ticket ×10, su botín y cada uno elige su poder. Jugando solo, caer aquí acaba la partida.')
      + H('La Sentencia de Arceus · minuto 30')
      + P('A los 30 minutos se acaba la partida normal y Arceus te lleva a la Sala del Origen, una plataforma de mármol sobre las nubes. No se le puede vencer: se trata de aguantar todo lo posible.')
      + P('Arceus te persigue sin pararse a atacar y cada vez corre más. Tocarle quita mucha vida. Si huyes, aparece delante de ti; si tiene que saltar a por ti varias veces seguidas, te arranca el ataque con el que escapas.')
      + P('Cada 30 segundos suma un ataque nuevo a los que ya tenía:')
      + `<div class="gd-keys">${J.MOVES.map(m => `<div class="gd-kv"><span>${esc(m.at ? mm(m.at) : '0:00')}</span><span>${esc(m.id === 'rain' ? 'Sentencia (lluvia de pilares)' : m.name)}</span></div>`).join('')}</div>`
      + UL([G.I18n.f('Rompe tus objetos de uno en uno, a los {x} minutos.', J.BREAKS.map(s => s / 60).join(', ')),
            G.I18n.f('Aspas Doradas desde el minuto {x}: ruedas que giran por un carril cerca del borde (y otro más dentro a los {x}).', J.LANES[0].at / 60, J.LANES[1].at / 60),
            'El suelo se agrieta y se cae a trozos: los agujeros no se pisan.',
            'Contra él no valen la Banda Focus ni Robustez.',
            'En grupo, si caes dos veces, Arceus te juzga y ya no te pueden levantar.']);
  }

  function events() {
    return H('Eventos (cada 4-5 minutos)')
      + UL(['Horda de un tipo: 30 s en los que todos los enemigos son de un mismo tipo. Si tus ataques le ganan, es tu momento.',
            'Hora dorada: 30 s de enemigos dorados que dan el doble de experiencia y a veces sueltan monedas.',
            'Pokémon perdido: tócalo para que te siga y llévalo a la marca antes de 2 minutos sin que le peguen. A veces se une a tu colección.',
            'Munchlax hambriento: sacude los arbustos pasando por encima y llévale 3 bayas como la que pide. Ojo: algunos arbustos esconden Combee. Premio: un objeto para cada uno y un Caramelo Exp.'])
      + H('Ladrones de monedas')
      + P('Hasta dos por partida: un Meowth cargado de monedas o, a veces, un Gholdengo con un ticket ×10. No atacan, pero huyen: tienes 15 segundos para atraparlos.')
      + H('El Team Rocket')
      + P('Alguna vez, jugando solo y antes de la Sentencia, el Team Rocket se lleva a tu Pokémon a su casino. El reloj se para: puedes salir enseguida o probar suerte con tus Pokémonedas en sus cuatro juegos. A la larga, la casa gana.')
      + H('El clima')
      + P('Desde el minuto 3 puede llegar un clima que dura alrededor de un minuto y cambia la fuerza de los ataques por tipo, los tuyos y los de los enemigos:')
      + `<div class="gd-list">${Object.keys(G.Weather.KINDS).map(k => { const w = G.Weather.KINDS[k]; return card(w.icon, w.name, '', w.hint); }).join('')}</div>`;
  }

  function mastery() {
    const M = G.Mastery;
    return P('Cada partida suma puntos de maestría al Pokémon que elegiste (aunque evolucione durante la partida), jugando solo o en grupo: 1 punto por cada 6 Pokémon derrotados y 25 por cada minuto que aguantas.')
      + P(G.I18n.f('De una partida cuentan como mucho {x} minutos. Las partidas con ventajas y el desafío semanal no suman.', M.MAX_T / 60))
      + `<div class="gd-list">${M.TIERS.map(t => card(t.icon, t.name, G.I18n.f('{x} puntos', t.at.toLocaleString(G.I18n.locale)), t.desc)).join('')}</div>`
      + P('Pasados los 100.000 se sigue sumando. En el menú, Maestría enseña todos tus Pokémon de más a menos, con sus números: partidas, tiempo, derrotados, jefes, grietas y más.');
  }

  const RENDER = { play, mons, moves, items, upgrades, powers, bosses, events, mastery };

  // ---------------- pantalla ----------------

  function build() {
    el = document.createElement('section');
    el.id = 'scr-guide'; el.className = 'scr dim hidden';
    el.innerHTML = `<div class="box guide-box">
        <div class="row between guide-top">
          <h2 id="guide-title">Guías</h2>
          <div class="row" style="gap:6px"><button class="btn small ghost hidden" id="guide-back">Volver</button><button class="btn small ghost" id="guide-close">Cerrar</button></div>
        </div>
        <div id="guide-body" class="guide-body"></div>
      </div>`;
    document.body.appendChild(el);
    el.querySelector('#guide-close').onclick = close;
    el.querySelector('#guide-back').onclick = () => show('cover');
    // Tocar fuera del recuadro (soltando también fuera) la cierra.
    let down = null;
    el.addEventListener('pointerdown', e => { down = e.target; });
    el.addEventListener('click', e => { if (e.target === el && down === el) close(); });
  }

  function init() { if (!el) build(); }
  function open() { init(); el.classList.remove('hidden'); show('cover'); }
  function close() { if (!el) return; stopWalk(); el.classList.add('hidden'); }
  const isOpen = () => !!el && !el.classList.contains('hidden');
  /** Esc / atrás / B: del apartado a la portada; de la portada, fuera. */
  function back() { if (view !== 'cover') show('cover'); else close(); }

  function show(id) {
    view = id;
    const body = el.querySelector('#guide-body');
    const sec = SECTIONS.find(s => s.id === id);
    el.querySelector('#guide-title').textContent = sec ? sec.title : 'Guías';
    el.querySelector('#guide-back').classList.toggle('hidden', !sec);
    stopWalk();
    if (!sec) {
      body.innerHTML = `<div class="gd-cover"><canvas id="gd-walk"></canvas>
          <div class="gd-hero"><div class="about-logo">PokéSurvivor</div><p class="sub">Todo el juego explicado: elige un tema.</p></div>
          <div class="gd-grid">${SECTIONS.map(s => `<button class="gd-sec" data-sec="${s.id}">${G.Icons.html(s.icon, 28)}<span><b>${esc(s.title)}</b><small>${esc(s.sub)}</small></span></button>`).join('')}</div>
        </div>`;
      body.querySelectorAll('[data-sec]').forEach(b => { b.onclick = () => show(b.dataset.sec); });
      startWalk(body.querySelector('#gd-walk'));
    } else {
      body.innerHTML = `<div class="gd-sec-body" data-guide="${id}">${RENDER[id]()}</div>`;
      wireSearch(body);
    }
    body.scrollTop = 0;
  }

  // Buscador (Movimientos y Objetos) y los tipos de Movimientos: se mira el texto ya traducido.
  function wireSearch(body) {
    const q = body.querySelector('#guide-q');
    let type = '';
    const apply = () => {
      const s = (q ? q.value : '').trim().toLowerCase();
      let n = 0;
      body.querySelectorAll('.gd-card').forEach(c => {
        const ok = (!type || c.dataset.type === type) && (!s || c.textContent.toLowerCase().includes(s) || (c.dataset.id || '').includes(s));
        c.classList.toggle('hidden', !ok);
        if (ok) n++;
      });
      const none = body.querySelector('.gd-none'); if (none) none.classList.toggle('hidden', n > 0);
      // (En Objetos, los grupos que se quedan sin nada, fuera.)
      body.querySelectorAll('.gd-grp').forEach(g => g.classList.toggle('hidden', !g.querySelector('.gd-card:not(.hidden)')));
    };
    if (q) q.oninput = apply;
    body.querySelectorAll('[data-ft]').forEach(b => { b.onclick = () => { type = b.dataset.ft; body.querySelectorAll('[data-ft]').forEach(x => x.classList.toggle('on', x === b)); apply(); }; });
  }

  // ---------------- portada: Pokémon paseando ----------------
  const CAST = [1, 4, 7, 25, 133, 152, 155, 158, 175, 252, 255, 258, 393, 390, 387, 39, 52, 54, 143, 151];
  function startWalk(cv) {
    if (!cv || !G.Sprites) return;
    const cast = CAST.filter(d => G.SPRITE_META[d]);
    if (!cast.length) return;
    walkers = [];
    const n = Math.min(9, cast.length);
    for (let i = 0; i < n; i++) walkers.push(walker(G.U.pick(cast), true));
    lastT = performance.now();
    const tick = t => {
      if (!isOpen() || view !== 'cover' || !cv.isConnected) { raf = 0; return; }
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (t - lastT) / 1000); lastT = t;
      const r = cv.getBoundingClientRect(), W = Math.max(1, Math.round(r.width)), Hh = Math.max(1, Math.round(r.height));
      if (cv.width !== W || cv.height !== Hh) { cv.width = W; cv.height = Hh; }
      const ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, W, Hh);
      ctx.imageSmoothingEnabled = false;
      for (const w of walkers) {
        w.x += w.v * dt;
        w.a.update(dt);
        if (w.x > W + 60) Object.assign(w, walker(G.U.pick(cast), false));
      }
      walkers.sort((a, b) => a.y - b.y);
      for (const w of walkers) {
        const y = w.y * Hh;
        ctx.globalAlpha = 0.55;
        w.a.draw(ctx, w.x, y);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(tick);
  }
  function walker(dex, anywhere) {
    const a = new G.Sprites.Animator(dex, 0.8);
    a.loop('Walk'); a.dir = 2;   // hacia la derecha
    const W = (el && el.querySelector('#gd-walk') || {}).clientWidth || 600;
    return { a, x: anywhere ? Math.random() * W : -40 - Math.random() * 160, y: 0.2 + Math.random() * 0.75, v: 30 + Math.random() * 35 };
  }
  function stopWalk() { if (raf) cancelAnimationFrame(raf); raf = 0; walkers = []; }

  return { init, open, close, back, show, SECTIONS, KIND, get isOpen() { return isOpen(); }, get view() { return view; } };
})();
