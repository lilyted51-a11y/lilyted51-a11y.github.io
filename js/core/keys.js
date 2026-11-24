/* ============ keys.js — las teclas del ordenador, cambiables (Ajustes › Controles) ============
 * (24-11-2026; como la Gran Actualización del juego oficial, hecho aquí a partir de su novedad.)
 * Cada acción del teclado tiene dos teclas, la principal y la secundaria, y las dos se pueden
 * cambiar en Ajustes › Controles (el editor está en ui/settings-ui.js). Se guardan en los ajustes
 * de este dispositivo (G.Settings 'keys'), y sólo las acciones cambiadas: { acción: [tecla, tecla] }.
 *
 * Las teclas son los códigos de G.Input (e.code en minúsculas: 'keyw', 'digit1', 'arrowup',
 * 'space'...), es decir, la tecla física: en un teclado francés la de moverse a la izquierda sigue
 * siendo la que en el inglés es la A. El nombre que se enseña sí es el de ese teclado
 * (navigator.keyboard.getLayoutMap, si el navegador lo tiene).
 *
 *   G.Keys.tap('power')  / held('up')     ¿se ha pulsado en este fotograma / se mantiene? (también el mando:
 *                                         LB/RB cambian de ataque, B usa el poder, Y cambia las cartas)
 *   G.Keys.label('power')                 'F' (la principal; con all = true, 'F / G')
 *   G.Keys.short('move1')                 lo mismo, corto, para el HUD del canvas ('1', '␣', '↑')
 *   G.Keys.cardTap(i) / cardKey(i)        elegir la carta i (las cartas 5-9 de Eevee, con los números)
 *   G.Keys.assign(map, acción, hueco, tecla) → { map, moved }   (pura: el editor y tests/keys.test.cjs)
 *
 * Grupos: las de la partida no pueden compartir tecla entre ellas; las de las cartas de nivel
 * (elegir 1-4 y cambiar las cartas) tampoco entre ellas, pero sí con las de la partida, porque no
 * se usan a la vez. Al poner una tecla que ya usa otra acción del grupo, se cambian: la otra se
 * queda con la que tenía ésta (y si ésta no tenía, se queda sin ella). El editor dice cuál.
 * Esc no se asigna: siempre pausa, cierra ventanas y cancela el editor. Tampoco F5, F11, F12 ni
 * las teclas de Windows / Cmd (son del navegador o del sistema).
 */
G.Keys = (() => {
  const DEF = {
    up: ['keyw', 'arrowup'], down: ['keys', 'arrowdown'], left: ['keya', 'arrowleft'], right: ['keyd', 'arrowright'],
    move1: ['digit1', 'numpad1'], move2: ['digit2', 'numpad2'], move3: ['digit3', 'numpad3'], move4: ['digit4', 'numpad4'],
    prev: ['keyq', ''], next: ['keye', 'tab'], power: ['keyf', ''],
    orb1: ['digit5', 'numpad5'], orb2: ['digit6', 'numpad6'], orb3: ['digit7', 'numpad7'], orb4: ['digit8', 'numpad8'],
    pause: ['keyp', ''],
    card1: ['digit1', 'numpad1'], card2: ['digit2', 'numpad2'], card3: ['digit3', 'numpad3'], card4: ['digit4', 'numpad4'],
    reroll: ['keyr', '']
  };
  const ORDER = Object.keys(DEF);
  const GROUP = a => (/^card\d$|^reroll$/.test(a) ? 'cards' : 'play');
  // Lo que se enseña en el editor (en español: se traduce como todo el juego).
  const NAME = {
    up: 'Moverse arriba', down: 'Moverse abajo', left: 'Moverse a la izquierda', right: 'Moverse a la derecha',
    move1: 'Ataque 1', move2: 'Ataque 2', move3: 'Ataque 3', move4: 'Ataque 4',
    prev: 'Ataque anterior', next: 'Ataque siguiente', power: 'Usar el poder',
    orb1: 'Esfera 1', orb2: 'Esfera 2', orb3: 'Esfera 3', orb4: 'Esfera 4', pause: 'Pausa',
    card1: 'Elegir la carta 1', card2: 'Elegir la carta 2', card3: 'Elegir la carta 3', card4: 'Elegir la carta 4',
    reroll: 'Cambiar las cartas'
  };
  // Los botones del mando que hacen lo mismo (gamepad.js los manda con estos códigos).
  const PAD = { prev: ['padlb'], next: ['padrb'], power: ['padb'], reroll: ['pady'] };
  // Siempre, aunque se cambien las teclas: Esc pausa.
  const FIXED = { pause: ['escape'] };
  const BLOCKED = new Set(['escape', 'f5', 'f11', 'f12', 'metaleft', 'metaright', 'osleft', 'osright', 'contextmenu']);

  // ---------------- reglas (puras) ----------------

  const clone = m => Object.fromEntries(ORDER.map(a => [a, (m[a] || DEF[a]).slice()]));
  const okCode = c => typeof c === 'string' && c.length < 40 && /^[a-z0-9]*$/.test(c) && !BLOCKED.has(c);

  /** Las teclas de todas las acciones: lo guardado encima de las de serie, sin repetidas dentro de un grupo. */
  function resolve(saved) {
    const m = clone({});
    if (saved && typeof saved === 'object') {
      for (const a of ORDER) {
        const v = saved[a];
        if (Array.isArray(v) && v.length === 2 && v.every(c => c === '' || okCode(c))) m[a] = v.slice();
      }
    }
    // (Una partida editada a mano o vieja con una tecla repetida: se queda en la primera acción.)
    const used = { play: new Set(), cards: new Set() };
    for (const a of ORDER) {
      const u = used[GROUP(a)];
      m[a] = m[a].map(c => (c && u.has(c) ? '' : c));
      for (const c of m[a]) if (c) u.add(c);
      if (m[a][0] === m[a][1]) m[a][1] = '';
    }
    return m;
  }

  /**
   * Pone `code` en el hueco `slot` (0 principal, 1 secundaria) de `action`.
   * → { map (copia), moved: null | { action, slot, code } } (la otra acción que la tenía y con qué se queda)
   */
  function assign(map, action, slot, code) {
    const m = clone(map);
    const mine = m[action], old = mine[slot], other = mine[1 - slot];
    if (!code || code === old) return { map: m, moved: null };
    if (code === other) { mine[1 - slot] = old || ''; mine[slot] = code; return { map: m, moved: null }; }
    let moved = null;
    for (const a of ORDER) {
      if (a === action || GROUP(a) !== GROUP(action)) continue;
      const i = m[a].indexOf(code);
      if (i < 0) continue;
      const give = old && !m[a].includes(old) ? old : '';
      m[a][i] = give;
      moved = { action: a, slot: i, code: give };
      break;
    }
    mine[slot] = code;
    return { map: m, moved };
  }
  /** Quita la tecla de un hueco. */
  function clear(map, action, slot) { const m = clone(map); m[action][slot] = ''; return m; }
  /** Lo que hay que guardar: sólo lo que no es de serie. */
  function diff(map) {
    const out = {};
    for (const a of ORDER) if (map[a][0] !== DEF[a][0] || map[a][1] !== DEF[a][1]) out[a] = map[a].slice();
    return out;
  }

  // ---------------- nombres ----------------

  const SYM = {
    arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→', space: 'Espacio', enter: 'Intro', tab: 'Tab',
    backspace: 'Retroceso', shiftleft: 'Mayús', shiftright: 'Mayús dcha.', controlleft: 'Ctrl', controlright: 'Ctrl dcha.',
    altleft: 'Alt', altright: 'Alt Gr', capslock: 'Bloq Mayús', delete: 'Supr', insert: 'Insert', home: 'Inicio', end: 'Fin',
    pageup: 'RePág', pagedown: 'AvPág', minus: '-', equal: '=', bracketleft: '[', bracketright: ']', backslash: '\\',
    semicolon: ';', quote: "'", backquote: '`', comma: ',', period: '.', slash: '/', intlbackslash: '<',
    numpadadd: 'Num +', numpadsubtract: 'Num -', numpadmultiply: 'Num *', numpaddivide: 'Num /', numpaddecimal: 'Num .',
    numpadenter: 'Num Intro', escape: 'Esc'
  };
  const SHORT = { space: '␣', enter: '⏎', numpadenter: '⏎', tab: '⇥', backspace: '⌫', shiftleft: '⇧', shiftright: '⇧',
                  controlleft: '⌃', controlright: '⌃', altleft: '⌥', altright: '⌥', capslock: '⇪', delete: '⌦', escape: 'Esc' };
  let layout = null;   // código → lo que pone la tecla en este teclado
  try {
    if (typeof navigator !== 'undefined' && navigator.keyboard && navigator.keyboard.getLayoutMap) {
      navigator.keyboard.getLayoutMap().then(lm => { layout = new Map(); lm.forEach((v, k) => layout.set(k.toLowerCase(), v)); changed(); }).catch(() => {});
    }
  } catch (e) { /* sin teclado: los nombres de serie */ }

  /** Nombre de una tecla (para el editor y las ayudas). */
  function name(code) {
    if (!code) return '';
    const own = layout && /^(key[a-z]|digit\d|minus|equal|bracket|backslash|semicolon|quote|backquote|comma|period|slash|intlbackslash)/.test(code) && layout.get(code);
    if (own && own.trim()) return own.toUpperCase();
    let m;
    if ((m = /^key([a-z])$/.exec(code))) return m[1].toUpperCase();
    if ((m = /^digit(\d)$/.exec(code))) return m[1];
    if ((m = /^numpad(\d)$/.exec(code))) return 'Num ' + m[1];
    if ((m = /^f(\d{1,2})$/.exec(code))) return 'F' + m[1];
    return SYM[code] || code;
  }
  /** Corto, para el canvas: 1-2 letras o un símbolo. */
  function shortName(code) {
    if (!code) return '';
    if (SHORT[code]) return SHORT[code];
    const n = name(code);
    if (/^Num (.)$/.test(n)) return n.slice(4);
    return n.length <= 3 ? n : n.slice(0, 3);
  }

  // ---------------- en el juego ----------------

  let map = resolve(null), loaded = false;
  const fns = new Set();
  function load() {
    loaded = true;
    map = resolve(G.Settings && G.Settings.get('keys'));
  }
  function cur() { if (!loaded) load(); return map; }
  function changed() { fns.forEach(fn => { try { fn(); } catch (e) { /* nada */ } }); }
  function codes(action) { return (cur()[action] || []).filter(Boolean); }
  /** Guarda un mapa entero (o {} para volver a las de serie). */
  function save(m) {
    map = resolve(diff(clone(m || {})));
    G.Settings.set('keys', diff(map));
    changed();
  }

  const any = (list, f) => list.some(c => c && f(c));
  function tap(action) {
    const I = G.Input;
    return any(codes(action), I.tap) || any(PAD[action] || [], I.tap) || any(FIXED[action] || [], I.tap);
  }
  function held(action) { return any(codes(action), G.Input.held); }
  /** ¿La usa alguna acción de la partida? (input.js: que el navegador no haga lo suyo con ella) */
  function isBound(code) { const m = cur(); return ORDER.some(a => m[a].includes(code)); }

  function label(action, all) {
    const l = codes(action).map(name);
    if (!l.length) return '—';
    return all ? l.join(' / ') : l[0];
  }
  function short(action) { const c = codes(action)[0]; return c ? shortName(c) : ''; }

  // Cartas (nivel, objeto, vínculo, poder): 1-4 con sus teclas; de la 5 a la 9 (Eevee, «Quedarme con
  // los que llevo»), con los números, si no los usa ya otra carta.
  function cardTap(i) {
    if (i < 4) return tap('card' + (i + 1));
    const c = ['digit' + (i + 1), 'numpad' + (i + 1)], m = cur();
    return c.some(k => G.Input.tap(k) && !['card1', 'card2', 'card3', 'card4', 'reroll'].some(a => m[a].includes(k)));
  }
  function cardKey(i) { return i < 4 ? label('card' + (i + 1)) : String(i + 1); }
  /** La tecla de la carta i, para su esquina (run-ui.js). */
  function cardKeyHtml(i) { const k = cardKey(i); return `<div class="key"${[...k].length === 1 ? ' translate="no"' : ''}>${G.U.esc(k)}</div>`; }

  // Una letra o un número no se traduce (el chino cambiaba la A por 給 y la O por 或): translate="no".
  // Los nombres largos (Espacio, Num 5...) sí.
  const kbdOf = k => `<kbd${[...k].length === 1 ? ' translate="no"' : ''}>${G.U.esc(k)}</kbd>`;
  /** <kbd> de una acción (las dos teclas si all). */
  function kbd(action, all) {
    const l = codes(action).map(name);
    return (all ? l : l.slice(0, 1)).map(kbdOf).join(' ') || '<kbd>—</kbd>';
  }

  // Ayudas fijas del HTML (dev.html): se rellenan con las teclas puestas.
  function paintHints() {
    if (typeof document === 'undefined') return;
    const el = id => document.getElementById(id);
    if (el('lvl-keys')) el('lvl-keys').innerHTML = ' · ' + [1, 2, 3, 4].map(i => kbd('card' + i)).join(' ');
    if (el('lvl-rr-key')) el('lvl-rr-key').innerHTML = ' · ' + kbd('reroll');
    if (el('pause-keys')) {
      el('pause-keys').innerHTML = [kbd('up'), kbd('left'), kbd('down'), kbd('right')].join('') + ' moverse · '
        + kbd('move1') + '–' + kbd('move4') + ' movimiento · ' + kbd('prev') + '/' + kbd('next') + ' ciclar · '
        + kbd('orb1') + '–' + kbd('orb4') + ' esferas · ' + kbd('power') + ' poder · <kbd>Esc</kbd> ' + kbd('pause') + ' pausa';
    }
  }
  fns.add(paintHints);

  function init() {
    load();
    paintHints();
    if (G.Settings) G.Settings.on(k => { if (k === 'keys') { load(); changed(); } });
  }

  return {
    DEF, ORDER, NAME, GROUP, BLOCKED, resolve, assign, clear, diff, name, shortName, kbdOf,
    init, save, tap, held, isBound, label, short, kbd, cardTap, cardKey, cardKeyHtml, paintHints,
    on(fn) { fns.add(fn); },
    get map() { return clone(cur()); }
  };
})();
