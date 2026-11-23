/* ============ casino-ui.js — las pantallas del Casino Rocket ============
 * (23-11-2026.) La lógica, las cuentas y el dinero están en systems/casino.js; aquí sólo se enseña.
 * Una sola pantalla (#scr-casino, se crea aquí) con varias vistas: el secuestro, la entrada y los
 * cuatro juegos. Todo en píxeles: los símbolos son dibujos de 12×12 (como ui/icons.js) y los
 * Pokémon, sus sprites (core/sprites.js) en un <canvas>. El resultado de cada jugada ya está
 * decidido y guardado ANTES de la animación: la animación sólo lo enseña.
 *
 * Controles: ratón o dedo en los botones; mando (A pulsa, B vuelve, la cruceta mueve la selección);
 * teclado: Esc vuelve (en la entrada, sale), Espacio / Intro juega, 1-4 eligen la apuesta,
 * en Voltorb escondido las flechas mueven la carta y C se planta, en la carrera 1-5 eligen corredor.
 */
G.CasinoUI = (() => {
  const C = () => G.Casino;
  let el = null, body = null, view = null, onLeave = null, open = false, openedAt = 0;
  let betIx = 1, hold = 0, raf = 0, last = 0, lastPick = 0;
  let st = {};               // lo de la vista abierta (animaciones)

  // ---------------- dibujos de píxeles (12×12) ----------------

  const PAL = { k: '#16101f', w: '#f4f2f8', s: '#b9b6c8', r: '#e8343c', R: '#a3122a', b: '#4f8cff', B: '#2b54b8',
                g: '#5fd068', G: '#2f8a3c', y: '#ffd83d', Y: '#d39a12', o: '#ff9a3d' };
  const ICON = {
    berry: ['......gg....', '.....gGgg...', '...kkkgkk...', '..kbbbbbbk..', '.kbwwbbbbBk.', '.kbwbbbbbBk.',
            '.kbbbbbbbBk.', '.kbbbbbbBBk.', '.kbbbbbBBBk.', '..kBBBBBBk..', '...kkkkkk...', '............'],
    ball:  ['....kkkk....', '..kkrrrrkk..', '.krwwrrrrRk.', '.krwrrrrrRk.', 'krrrrkkrrRRk', 'kkkkkwwkkkkk',
            'kkkkkwwkkkkk', 'kwwwwkkwwwsk', '.kwwwwwwwsk.', '.kwwwwwwssk.', '..kkssssskk.', '....kkkk....'],
    voltorb: ['....kkkk....', '..kkrrrrkk..', '.krwrrrrrRk.', '.krrrrrrrRk.', 'krkkrrrrkkRk', 'krwkkrrkkwRk',
              'krwwkrrkwwRk', 'kkkkkkkkkkkk', '.kwwwwwwwsk.', '.kwwwwwwssk.', '..kkssssskk.', '....kkkk....'],
    pika:  ['k..........k', 'kk........kk', '.ky......yk.', '.kyy....yyk.', '..kyykkyyk..', '.kyyyyyyyyk.',
            'kyykyyyykyyk', 'kyykyyyykyyk', 'krryyykyyrrk', 'krryyyyyyrrk', '.kyyyyyyyYk.', '..kkkkkkkk..'],
    seven: ['............', '.kkkkkkkkkk.', '.krrrrrrrrk.', '.kkkkkkkrrk.', '......krrk..', '.....krrk...',
            '....krrk....', '....krrk....', '...krrk.....', '...krrk.....', '...kkkk.....', '............'],
    rocket: ['...kkkkkk...', '..kwwwwwwk..', '.kwrrrrrwwk.', 'kwwrrwwrrwwk', 'kwwrrwwrrwwk', 'kwwrrrrrwwwk',
             'kwwrrwrrwwwk', 'kwwrrwwrrwwk', 'kwwrrwwwrrwk', '.kwwwwwwwwk.', '..kwwwwwwk..', '...kkkkkk...'],
    coin:  ['....kkkk....', '..kkyyyykk..', '.kyyyyyyyYk.', '.kyykkkkyYk.', 'kyykyyyykYYk', 'kyykyyyyyYYk',
            'kyykyyyyyYYk', 'kyykyyyykYYk', '.kyykkkkyYk.', '.kyyyyyyYYk.', '..kkYYYYkk..', '....kkkk....'],
    back:  ['............', '....kkkk....', '...krrrrk...', '..krwrrrRk..', '..kkkkkkkk..', '..kkkwwkkk..',
            '..kwwkkwsk..', '...kwwwsk...', '....kkkk....', '............', '............', '............']
  };
  function pix(ctx, rows, x, y, s) {
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
      const c = PAL[rows[j][i]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x + i * s), Math.round(y + j * s), Math.ceil(s), Math.ceil(s));
    }
  }
  /** Un <canvas> con un dibujo (para la tabla de premios, las cartas...). */
  function iconCv(id, s = 2, cls = 'cas-ico') {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 12 * s; cv.className = cls;
    pix(cv.getContext('2d'), ICON[id], 0, 0, s);
    return cv;
  }
  const iconHtml = (id, s = 2) => iconCv(id, s).outerHTML.replace('<canvas', `<canvas data-ico="${id}" data-s="${s}"`);
  /** Los <canvas data-ico> que vienen en HTML (innerHTML no copia lo pintado): se vuelven a pintar. */
  function paintIcons(root) {
    for (const cv of root.querySelectorAll('canvas[data-ico]')) pix(cv.getContext('2d'), ICON[cv.dataset.ico], 0, 0, +cv.dataset.s || 2);
  }

  // ---------------- texto y números ----------------

  const T = (s, ...v) => (v.length ? G.I18n.f(s, ...v) : G.T(s));
  const loc = () => (window.PSZH_DICT ? 'zh-TW' : G.I18n.locale);
  const num = n => Math.floor(n).toLocaleString(loc());
  const mult = n => '×' + n.toLocaleString(loc(), { maximumFractionDigits: 2 });
  const monName = dex => G.T((G.DEX_BY[dex] || { name: '?' }).name, 'mon');

  // ---------------- música (un tema de casino, para el sintetizador de core/audio.js) ----------------

  if (G.MUSIC && !G.MUSIC.casino) G.MUSIC.casino = {
    bpm: 128, swing: 0.25,
    chords: ['C', 'Am', 'Dm', 'G', 'C', 'Am', 'F', 'G', 'E', 'Am', 'D', 'G', 'C', 'A', 'Dm', 'G'],
    melody: [{ inst: 'pluck', vel: 1, bars: [
      'G4:2 C5:2 E5:2 G5:4 E5:2 C5:4', 'A5:4 G5:2 E5:2 C5:4 -:4', 'F5:2 F5:2 A5:2 F5:2 D5:4 C5:4', 'B4:4 D5:2 G5:6 -:4',
      'E5:2 G5:2 C6:4 B5:2 A5:2 G5:4', 'E5:4 C5:2 A4:2 C5:4 E5:4', 'F5:2 A5:2 C6:2 A5:2 G5:2 F5:2 E5:4', 'D5:8 -:8',
      'G#4:2 B4:2 E5:4 G#5:4 E5:4', 'A5:4 E5:2 C5:2 A4:8', 'F#5:2 A5:2 F#5:2 D5:2 A4:4 D5:4', 'B4:2 D5:2 G5:4 F5:4 D5:4',
      'E5:2 G5:2 E5:2 C5:2 G5:4 E5:4', 'C#5:2 E5:2 A5:4 G5:4 E5:4', 'F5:4 E5:2 D5:2 A5:4 F5:4', 'G5:4 D5:4 B4:4 -:4'] }],
    parts: [
      { inst: 'bass', octave: 2, useBass: true, vel: 0.9, pattern: 'R...F...O...F...' },
      { inst: 'organ', octave: 4, vel: 0.35, pattern: '..C...C...C...C.' }
    ],
    drums: { kick: 'X.......x.......', snare: '....x.......x...', hat: 'x.ox.ox.x.ox.ox.' }
  };

  // ---------------- estilos (en la propia pantalla: así el casino va entero en estos dos ficheros) ----------------

  const CSS = `
#scr-casino { z-index: 60; background: radial-gradient(circle at 50% 30%, rgba(90,10,40,.72), rgba(8,3,14,.94)); }
#scr-casino .cas-box { width: min(620px, 100%); padding: 14px 16px; background: linear-gradient(180deg, #3a1f5e, #1c0f33);
  box-shadow: 0 0 0 3px #0c0614, inset 0 0 0 2px #8a3fd0, 0 18px 50px rgba(0,0,0,.6); }
#scr-casino .cas-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
#scr-casino .cas-top h2 { margin: 0; font-size: 22px; color: #ff5f7a; flex: 1; }
#scr-casino .cas-coins { background: rgba(0,0,0,.35); border-radius: 8px; padding: 3px 10px; font-weight: 700; white-space: nowrap; }
#scr-casino .cas-msg { min-height: 22px; margin: 8px 0 0; text-align: center; font-weight: 700; }
#scr-casino .cas-msg.win { color: var(--gold); } #scr-casino .cas-msg.bad { color: #ff9aa8; }
#scr-casino .cas-keys { margin: 6px 0 0; font-size: 12px; color: var(--muted); text-align: center; }
#scr-casino .cas-keys kbd { font-size: 11px; }
#scr-casino .sub { margin: 0 0 8px; font-size: 14px; }
#scr-casino canvas.cas-stage { display: block; width: 100%; max-width: 560px; margin: 0 auto; background: #0c0614; border: 3px solid #0c0614; border-radius: 8px; box-shadow: inset 0 0 0 2px #6b2fa8; }
#scr-casino .cas-games { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
#scr-casino .cas-game { display: grid; grid-template-columns: 44px 1fr; column-gap: 8px; align-items: center; text-align: left;
  padding: 8px; border-radius: 9px; border: 3px solid #e8d8ff; background: linear-gradient(180deg, #5a2a90, #34175c); cursor: pointer;
  box-shadow: 0 0 0 2px #0c0614, 0 4px 0 #0c0614; }
#scr-casino .cas-game:hover { filter: brightness(1.15); }
#scr-casino .cas-game canvas { grid-row: span 2; }
#scr-casino .cas-game b { font-size: 16px; } #scr-casino .cas-game small { color: var(--muted); font-size: 12px; line-height: 1.2; }
#scr-casino .cas-bets { display: flex; gap: 6px; justify-content: center; align-items: center; flex-wrap: wrap; margin: 8px 0; }
#scr-casino .cas-chip { min-width: 54px; padding: 4px 8px; border-radius: 16px; border: 2px solid #e8d8ff; background: #2a1446; font-weight: 700; cursor: pointer; }
#scr-casino .cas-chip.on { background: var(--gold); color: #3a2300; text-shadow: none; }
#scr-casino .cas-chip:disabled { opacity: .4; cursor: not-allowed; }
#scr-casino .btn.wait { filter: grayscale(.7) brightness(.75); cursor: default; }
#scr-casino .cas-acts { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 6px; }
#scr-casino .cas-pay { display: grid; grid-template-columns: repeat(4, auto); gap: 2px 10px; justify-content: center; margin-top: 8px; font-size: 13px; align-items: center; }
#scr-casino .cas-pay span { display: flex; gap: 1px; align-items: center; }
#scr-casino .cas-pay i { font-style: normal; color: var(--gold); }
#scr-casino .vf-grid { display: grid; grid-template-columns: repeat(5, 44px); gap: 5px; justify-content: center; margin: 6px 0; }
#scr-casino .vf-tile { width: 44px; height: 44px; padding: 0; border-radius: 7px; border: 3px solid #e8d8ff; background: linear-gradient(180deg, #6b2fa8, #3d1a66);
  display: flex; align-items: center; justify-content: center; cursor: pointer; }
#scr-casino .vf-tile.sel { outline: 3px solid var(--gold); outline-offset: 1px; }
#scr-casino .vf-tile.open { background: #1c0f33; cursor: default; } #scr-casino .vf-tile.boom { background: #7a1020; }
#scr-casino .vf-tile.ghost { opacity: .45; }
#scr-casino .vf-stat { display: flex; gap: 14px; justify-content: center; font-weight: 700; flex-wrap: wrap; }
#scr-casino .rc-list { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-top: 6px; }
#scr-casino .rc-pick { padding: 4px 2px; border-radius: 8px; border: 2px solid #e8d8ff; background: #2a1446; cursor: pointer; font-size: 12px; text-align: center; line-height: 1.2; }
#scr-casino .rc-pick b { display: block; color: var(--gold); font-size: 15px; }
#scr-casino .rc-pick.on { background: #6b2fa8; box-shadow: 0 0 0 2px var(--gold); }
#scr-casino .pk-stat { display: flex; gap: 14px; justify-content: center; align-items: center; font-weight: 700; margin-top: 6px; flex-wrap: wrap; }
#scr-casino .pk-prize { display: flex; gap: 8px; align-items: center; justify-content: center; font-size: 13px; color: var(--muted); }
#scr-casino .cas-intro { text-align: center; }
#scr-casino .cas-intro h3 { color: #ff5f7a; margin-top: 8px; }
@media (max-height: 520px) { #scr-casino { padding: 6px; } #scr-casino .cas-box { padding: 8px 10px; } #scr-casino .vf-grid { grid-template-columns: repeat(5, 30px); gap: 3px; }
  #scr-casino .vf-tile { width: 30px; height: 30px; } #scr-casino .cas-keys { display: none; } #scr-casino .cas-top { margin-bottom: 4px; }
  #scr-casino canvas.cas-stage { width: auto; height: 31vh; max-width: 100%; } #scr-casino .box h3 { font-size: 15px; margin: 0 0 4px; }
  #scr-casino .sub { font-size: 12px; margin: 2px 0 4px !important; } #scr-casino .cas-pay { font-size: 11px; margin-top: 4px; gap: 0 8px; }
  #scr-casino .cas-bets { margin: 4px 0; } #scr-casino .btn { padding: 6px 14px; font-size: 15px; } #scr-casino .cas-game { padding: 5px; }
  #scr-casino .pk-prize canvas { width: 48px; height: 48px; } #scr-casino .vf-tile canvas { width: 18px; height: 18px; } }
`;

  // ---------------- la pantalla ----------------

  function build() {
    if (el) return;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    el = document.createElement('section');
    el.id = 'scr-casino';
    el.className = 'scr hidden';
    el.innerHTML = `<div class="box cas-box">
      <div class="cas-top"><canvas class="cas-logo" width="24" height="24"></canvas><h2>${T('Casino Rocket')}</h2>
        <span class="cas-coins"><span class="coin"></span> <b id="cas-coins">0</b></span>
        <button id="cas-back" class="btn small ghost" data-back data-sfx="none"></button></div>
      <div id="cas-body"></div>
      <p id="cas-msg" class="cas-msg"></p>
      <p id="cas-keys" class="cas-keys"></p></div>`;
    document.body.appendChild(el);
    pix(el.querySelector('.cas-logo').getContext('2d'), ICON.rocket, 0, 0, 2);
    body = el.querySelector('#cas-body');
    el.querySelector('#cas-back').onclick = back;
    // Que un botón pulsado con el ratón no se quede con el foco (Espacio lo volvería a pulsar).
    el.addEventListener('click', () => setTimeout(() => { const a = document.activeElement; if (a && el.contains(a) && a.blur) a.blur(); }, 0));
  }

  function show(leave) {
    build();
    onLeave = leave; open = true; openedAt = performance.now(); hold = 0;
    el.classList.remove('hidden');
    if (G.Touch && G.Touch.reset) G.Touch.reset();
    G.Audio.music(null);
    G.Audio.sfx('boss');
    intro();
    last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }
  function hide() {
    open = false; st = {}; view = null;
    cancelAnimationFrame(raf);
    if (el) el.classList.add('hidden');
  }
  function leave() {
    if (!open) return;
    // (Si la tirada o la carrera aún se ve, lo ganado ya está apuntado: se puede salir igual.)
    const cb = onLeave;
    hide();
    G.Audio.sfx('back');
    if (cb) cb();
  }
  function back() {
    if (!open) return;
    if (view === 'intro' || view === 'lobby') {
      // (Un Esc que llega justo al abrir no saca: era el de otra pantalla.)
      if (performance.now() - openedAt < 600) return;
      leave(); return;
    }
    if (busy()) return;
    const w = view === 'voltorb' ? C().vfCash() : 0;       // (lo que llevabas en Voltorb escondido se cobra)
    lobby();
    if (w) { G.Audio.sfx('buy'); say(T('Te plantas: +{x}', num(w)), 'win'); }
  }
  /** ¿Hay una animación que no se debe cortar? */
  const busy = () => !!(st.spinning || st.running || (st.ball && view === 'pika'));

  function setView(v, keys) {
    view = v; st = { t: 0 };
    say('');
    el.querySelector('#cas-back').textContent = v === 'intro' || v === 'lobby' ? T('Irse') : T('Volver');
    el.querySelector('#cas-keys').innerHTML = keys || '';
    refresh();
  }
  /** Un aviso bajo el juego (varias frases: cada una en su trozo, para que se traduzcan enteras). */
  function say(t, cls = '') {
    const m = el && el.querySelector('#cas-msg'); if (!m) return;
    m.innerHTML = '';
    (Array.isArray(t) ? t : [t]).filter(Boolean).forEach((x, i) => { if (i) m.append(' · '); const s = document.createElement('span'); s.textContent = x; m.appendChild(s); });
    m.className = 'cas-msg ' + cls;
  }
  /*
   * El botón principal no se desactiva mientras dura la animación (sólo se apaga y no hace nada): con el
   * mando, un botón desactivado pierde la selección, que saltaba a una ficha de apuesta.
   */
  function wait(sel, on) { const b = el.querySelector(sel); if (b) b.classList.toggle('wait', on); }
  function refresh() { const c = el && el.querySelector('#cas-coins'); if (c) c.textContent = num(Math.max(0, C().balance() - hold)); }
  function sayErr(why) {
    G.Audio.sfx('error');
    say(why === 'net' ? T('Sin conexión: con tu cuenta, el casino necesita internet.') : T('No tienes Pokémonedas suficientes.'), 'bad');
  }

  // ---------------- apuesta ----------------

  const bet = () => C().BETS[betIx];
  function chips(onPick) {
    const box = document.createElement('div');
    box.className = 'cas-bets';
    box.innerHTML = `<span>${T('Apuesta')}</span>` + C().BETS.map((b, i) => `<button class="cas-chip${i === betIx ? ' on' : ''}" data-i="${i}">${num(b)}</button>`).join('');
    box.querySelectorAll('.cas-chip').forEach(b => b.onclick = () => { pickBet(+b.dataset.i); if (onPick) onPick(); });
    return box;
  }
  function pickBet(i) {
    if (i < 0 || i >= C().BETS.length || busy()) return;
    if (view === 'voltorb' && C().vf && C().vf.round && !C().vf.over) return;      // (en plena partida no se cambia)
    betIx = i;
    G.Audio.sfx('select');
    el.querySelectorAll('.cas-chip').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    if (view === 'voltorb' && C().vf && !C().vf.round) C().vf.bet = bet();
  }
  /** Ayuda de teclas: [[teclas], palabra]... (cada palabra en su trozo). */
  const hint = (...l) => l.map(([ks, w]) => ks.map(k => `<kbd>${k}</kbd>`).join(/^\d$/.test(ks[0]) ? '-' : '') + ` <span>${T(w)}</span>`).join(' · ');
  const keysHint = (...extra) => hint([['Esc'], 'volver'], [['1', '4'], 'apuesta'], ...extra);

  // ---------------- el secuestro ----------------

  function intro() {
    setView('intro', hint([['Esc'], 'irse']));
    const pl = G.Game.player;
    body.innerHTML = `<div class="cas-intro"><canvas id="cas-kid" class="cas-stage" width="320" height="140"></canvas>
      <h3>${T('¡El Team Rocket se ha llevado a {x}!', pl ? G.T(pl.mon.name, 'mon') : '')}</h3>
      <p class="sub">${T('Lo tienen en su Casino Rocket. Mientras estés dentro, el reloj de la partida no corre.')}</p>
      <div class="cas-acts"><button class="btn gold" data-a="in">${T('Entrar al casino')}</button>
      <button class="btn ghost" data-a="out">${T('Rescatarlo y seguir')}</button></div></div>`;
    body.querySelector('[data-a=in]').onclick = () => { G.Audio.sfx('confirm'); G.Audio.music('casino'); lobby(); };
    body.querySelector('[data-a=out]').onclick = leave;
    const a = pl ? new G.Sprites.Animator(pl.dex, 1 / G.Sprites.PX, !!pl.shiny) : null;
    if (a) { a.skin = pl.anim && pl.anim.skin; a.loop('Hurt'); a.dir = 0; }
    st.kid = a; st.cv = body.querySelector('#cas-kid');
  }
  function drawIntro(dt) {
    const cv = st.cv; if (!cv) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    st.t += dt;
    ctx.imageSmoothingEnabled = false;
    // Cielo de noche y estrellas
    ctx.fillStyle = '#120a24'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { const x = (i * 97) % W, y = (i * 53) % (H - 30); ctx.fillStyle = (i + Math.floor(st.t * 3)) % 5 ? '#4b3a78' : '#e8d8ff'; ctx.fillRect(x, y, 2, 2); }
    ctx.fillStyle = '#1d3a1f'; ctx.fillRect(0, H - 14, W, 14);
    // El globo (la cabeza de Meowth), subiendo y moviéndose de lado
    const bx = W / 2 + Math.sin(st.t * 0.9) * 40, by = 44 + Math.sin(st.t * 1.7) * 5;
    const R = 26;
    for (let y = -R; y <= R; y += 2) for (let x = -R; x <= R; x += 2) {
      const d = x * x / (R * R) + y * y / (R * R * 0.85);
      if (d > 1) continue;
      ctx.fillStyle = d > 0.8 ? '#16101f' : y > 8 ? '#e0c890' : '#f5e3b5';
      ctx.fillRect(Math.round(bx + x), Math.round(by + y), 2, 2);
    }
    // orejas, ojos, bigotes, moneda
    ctx.fillStyle = '#16101f';
    ctx.fillRect(bx - 22, by - 26, 8, 8); ctx.fillRect(bx + 14, by - 26, 8, 8);
    ctx.fillStyle = '#8a5a3a'; ctx.fillRect(bx - 20, by - 24, 4, 4); ctx.fillRect(bx + 16, by - 24, 4, 4);
    ctx.fillStyle = '#16101f'; ctx.fillRect(bx - 10, by - 2, 4, 6); ctx.fillRect(bx + 6, by - 2, 4, 6);
    ctx.fillRect(bx - 24, by + 8, 10, 2); ctx.fillRect(bx + 14, by + 8, 10, 2);
    ctx.fillStyle = '#ffd83d'; ctx.fillRect(bx - 4, by - 18, 8, 8); ctx.fillStyle = '#d39a12'; ctx.fillRect(bx - 2, by - 16, 4, 4);
    // cuerdas, cesta con la R
    ctx.fillStyle = '#c9b48a'; ctx.fillRect(bx - 14, by + 22, 2, 14); ctx.fillRect(bx + 12, by + 22, 2, 14);
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(bx - 16, by + 36, 32, 12); ctx.fillStyle = '#5a3416'; ctx.fillRect(bx - 16, by + 44, 32, 4);
    pix(ctx, ICON.rocket, bx - 6, by + 36, 1);
    // la red colgando, con tu Pokémon dentro
    const nx = bx + 34, ny = by + 74;
    ctx.fillStyle = '#c9b48a'; ctx.fillRect(bx + 14, by + 46, 2, 2);
    for (let i = 0; i < 10; i++) ctx.fillRect(Math.round(bx + 15 + (nx - bx - 15) * i / 10), Math.round(by + 46 + (ny - 40 - by - 46) * i / 10), 2, 2);
    if (st.kid) { st.kid.update(dt); st.kid.draw(ctx, nx, ny); }
    ctx.fillStyle = 'rgba(201,180,138,.85)';
    for (let i = -18; i <= 18; i += 6) { ctx.fillRect(nx + i, ny - 40, 1, 40); }
    for (let j = -40; j <= 0; j += 6) { ctx.fillRect(nx - 18, ny + j, 37, 1); }
  }

  // ---------------- la entrada ----------------

  const GAMES = [
    { id: 'slots', ico: 'seven', name: 'Tragaperras Rocket', desc: 'Tres R: la estela Team Rocket, que no se vende.' },
    { id: 'voltorb', ico: 'voltorb', name: 'Voltorb escondido', desc: 'Levanta cartas sin despertar a un Voltorb.' },
    { id: 'race', ico: 'ball', name: 'Carrera Rocket', desc: 'Apuesta por el más rápido de cinco.' },
    { id: 'pika', ico: 'pika', name: '¡Atrapa a Pikachu!', desc: 'Tres planes de habilidad. Premio: la skin Mewtwo Obsidiana.' }
  ];
  function lobby() {
    setView('lobby', hint([['Esc'], 'irse'], [['1', '4'], 'elegir juego']));
    G.Audio.music('casino');
    body.innerHTML = `<p class="sub center">${T('Juega con tus Pokémonedas de la cuenta. A la larga, la casa gana. Al salir, sigue la partida con la Sentencia de Arceus.')}</p>
      <div class="cas-games">${GAMES.map((g, i) => `<button class="cas-game" data-i="${i}">${iconHtml(g.ico, 3)}<b>${T(g.name)}</b><small>${T(g.desc)}</small></button>`).join('')}</div>
      <div class="cas-acts" style="margin-top:10px"><button class="btn ghost small" data-a="out">${T('Salir y seguir con la partida')}</button></div>`;
    paintIcons(body);
    body.querySelectorAll('.cas-game').forEach(b => b.onclick = () => game(+b.dataset.i));
    body.querySelector('[data-a=out]').onclick = leave;
    if (C().needsNet()) say(T('Sin conexión: con tu cuenta, el casino necesita internet.'), 'bad');
  }
  function game(i) {
    const g = GAMES[i]; if (!g) return;
    G.Audio.sfx('confirm');
    ({ slots, voltorb, race, pika })[g.id]();
  }

  // ---------------- tragaperras ----------------

  const CELL = 56;
  function slots() {
    setView('slots', keysHint([[T('Espacio')], 'girar']));
    const S = C().SYM;
    const pay = [['rocket', 3, 100], ['seven', 3, 60], ['pika', 3, 25], ['voltorb', 3, 12], ['ball', 3, 8], ['berry', 3, 5], ['rocket', 2, 5], ['berry', 2, 2.5]];
    body.innerHTML = `<h3 class="center">${T('Tragaperras Rocket')}</h3><canvas id="cas-reels" class="cas-stage" width="240" height="132" style="max-width:300px"></canvas>
      <div class="cas-pay">${pay.map(([s, n, m]) => `<span>${iconHtml(s, 1).repeat(n)}</span><i>${mult(m)}${s === 'rocket' && n === 3 ? ` + <span>${T('estela')}</span>` : ''}</i>`).join('')}</div>`;
    paintIcons(body);
    body.appendChild(chips());
    const acts = document.createElement('div'); acts.className = 'cas-acts';
    acts.innerHTML = `<button class="btn gold" id="cas-spin" data-sfx="none">${T('Girar')}</button>`;
    body.appendChild(acts);
    acts.querySelector('#cas-spin').onclick = doSpin;
    st.cv = body.querySelector('#cas-reels');
    st.reels = [0, 1, 2].map(i => ({ strip: [S[(i * 2) % S.length], S[(i * 2 + 1) % S.length], S[(i * 2 + 2) % S.length]], pos: 1, from: 1, to: 1, t0: 0, dur: 0, done: true }));
  }
  function doSpin() {
    if (view !== 'slots' || st.spinning) return;
    const r = C().spin(bet());
    if (r.err) { sayErr(r.err); return; }
    hold = r.win; refresh();
    say('');
    G.Audio.sfx('click');
    const S = C().SYM;
    st.res = r; st.spinning = true; st.t = 0; st.tick = 0;
    st.reels.forEach((rl, i) => {
      const cur = rl.strip[Math.round(rl.pos)];
      const n = 14 + i * 6;
      const strip = [rl.strip[Math.round(rl.pos) - 1] || cur, cur];
      for (let k = 0; k < n; k++) strip.push(S[Math.floor(Math.random() * S.length)]);
      strip.push(r.reels[i], S[Math.floor(Math.random() * S.length)]);
      Object.assign(rl, { strip, from: 1, to: strip.length - 2, pos: 1, t0: 0, dur: 0.9 + i * 0.45, done: false });
    });
    wait('#cas-spin', true);
  }
  function slotsTick(dt) {
    if (!st.reels) return;
    if (st.spinning) {
      st.t += dt;
      if ((st.tick -= dt) <= 0) { st.tick = 0.09; G.Audio.sfx('shake'); }
      for (const rl of st.reels) {
        if (rl.done) continue;
        const u = Math.min(1, st.t / rl.dur);
        rl.pos = rl.from + (rl.to - rl.from) * (1 - (1 - u) ** 3);
        if (u >= 1) { rl.done = true; rl.pos = rl.to; G.Audio.sfx('select'); }
      }
      if (st.reels.every(r => r.done)) { st.spinning = false; slotsEnd(); }
    }
    const cv = st.cv, ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0c0614'; ctx.fillRect(0, 0, W, H);
    const rw = 72, gap = 6, x0 = (W - rw * 3 - gap * 2) / 2;
    st.reels.forEach((rl, i) => {
      const x = x0 + i * (rw + gap);
      ctx.fillStyle = '#f4f2f8'; ctx.fillRect(x, 4, rw, H - 8);
      ctx.save(); ctx.beginPath(); ctx.rect(x, 4, rw, H - 8); ctx.clip();
      const base = Math.floor(rl.pos), frac = rl.pos - base;
      for (let k = -2; k <= 2; k++) {
        const s = rl.strip[base + k]; if (!s) continue;
        const cy = H / 2 + (k - frac) * CELL;
        pix(ctx, ICON[s], x + rw / 2 - 18, cy - 18, 3);
      }
      ctx.restore();
      // sombra arriba y abajo
      ctx.fillStyle = 'rgba(12,6,20,.35)'; ctx.fillRect(x, 4, rw, 18); ctx.fillRect(x, H - 22, rw, 18);
    });
    // línea de premio
    const win = !st.spinning && st.res && st.res.win > 0;
    ctx.fillStyle = win && Math.floor(st.t * 6) % 2 ? '#ffd23f' : '#e8343c';
    ctx.fillRect(x0 - 6, H / 2 - 1, rw * 3 + gap * 2 + 12, 2);
    if (!st.spinning) st.t += dt;
  }
  function slotsEnd() {
    const r = st.res; hold = 0; refresh(); st.t = 0;
    wait('#cas-spin', false);
    if (r.jackpot) {
      G.Audio.sfx('shinyGet');
      say([T('¡PREMIO GORDO! +{x}', num(r.win)), r.trail && T('¡Estela Team Rocket desbloqueada!')], 'win');
    } else if (r.win > 0) { G.Audio.sfx(r.mult >= 10 ? 'legend' : 'buy'); say(T('¡Premio! +{x}', num(r.win)), 'win'); }
    else say(T('Nada esta vez.'));
  }

  // ---------------- Voltorb escondido ----------------

  function voltorb() {
    setView('voltorb', keysHint([['←', '→', '↑', '↓'], 'elegir carta'], [[T('Espacio')], 'levantar'], [['C'], 'plantarse']));
    C().vfNew(bet());
    st.sel = 12;
    body.innerHTML = `<h3 class="center">${T('Voltorb escondido')}</h3>
      <p class="sub center">${T('Levanta cartas: cada una buena sube el premio; un Voltorb se lo lleva todo. Plántate cuando quieras.')}</p>
      <div class="vf-grid">${[...Array(C().VF.N).keys()].map(i => `<button class="vf-tile" data-i="${i}" data-sfx="none">${iconHtml('back', 2)}</button>`).join('')}</div>
      <div class="vf-stat"><span><span>${T('Premio')}</span>: <b id="vf-now">—</b></span><span><span>${T('Siguiente')}</span>: <b id="vf-next">${mult(C().vfMult(1))}</b></span></div>`;
    paintIcons(body);
    body.appendChild(chips());
    const acts = document.createElement('div'); acts.className = 'cas-acts';
    acts.innerHTML = `<button class="btn gold" id="vf-cash" data-sfx="none" disabled>${T('Plantarse')}</button><button class="btn" id="vf-again" data-sfx="none">${T('Otra vez')}</button>`;
    body.appendChild(acts);
    body.querySelectorAll('.vf-tile').forEach(b => b.onclick = () => flip(+b.dataset.i));
    acts.querySelector('#vf-cash').onclick = cash;
    acts.querySelector('#vf-again').onclick = () => { if (C().vf && C().vf.round && !C().vf.over) return; voltorb(); };
    vfPaint();
  }
  function vfPaint() {
    const v = C().vf; if (!v) return;
    const live = v.round && !v.over;
    body.querySelectorAll('.vf-tile').forEach(b => b.classList.toggle('sel', +b.dataset.i === st.sel && !v.over));
    const now = body.querySelector('#vf-now'), next = body.querySelector('#vf-next');
    if (now) now.textContent = v.k && !v.lost ? mult(C().vfMult(v.k)) + ' · ' + num(v.bet * C().vfMult(v.k)) : '—';
    if (next) next.textContent = v.over ? '—' : mult(C().vfMult(v.k + 1));
    const cashB = body.querySelector('#vf-cash'), again = body.querySelector('#vf-again');
    if (cashB) cashB.disabled = !(live && v.k > 0);
    if (again) again.classList.toggle('hidden', !v.over);
    body.querySelectorAll('.cas-chip').forEach(b => { b.disabled = !!live; });
  }
  function tileShow(i, what) {
    const b = body.querySelector(`.vf-tile[data-i="${i}"]`); if (!b) return;
    b.classList.add('open'); if (what === 'voltorb') b.classList.add('boom');
    b.innerHTML = ''; b.appendChild(iconCv(what === 'voltorb' ? 'voltorb' : 'coin', 2));
  }
  function flip(i) {
    const v = C().vf; if (!v || v.over || v.open.has(i)) return;
    st.sel = i;
    const r = C().vfFlip(i);
    if (r.kind === 'err') { sayErr(r.err); return; }
    if (r.kind === 'none') return;
    refresh();
    if (r.kind === 'boom') {
      tileShow(i, 'voltorb'); G.Audio.sfx('break'); G.Audio.sfx('hurt');
      // Se enseña dónde estaban los demás.
      for (const j of v.voltorbs) if (j !== i) { tileShow(j, 'voltorb'); body.querySelector(`.vf-tile[data-i="${j}"]`).classList.add('ghost'); }
      say(T('¡Voltorb! Pierdes la apuesta.'), 'bad');
    } else {
      tileShow(i, 'coin'); G.Audio.sfx('coin');
      if (r.done) { G.Audio.sfx('legend'); say(T('¡Todas! +{x}', num(r.win)), 'win'); }
      else say('');
    }
    vfPaint();
  }
  function cash() {
    const w = C().vfCash();
    if (!w) return;
    G.Audio.sfx('buy'); refresh();
    say(T('Te plantas: +{x}', num(w)), 'win');
    const v = C().vf;
    for (const j of v.voltorbs) if (!v.open.has(j)) { tileShow(j, 'voltorb'); body.querySelector(`.vf-tile[data-i="${j}"]`).classList.add('ghost'); }
    vfPaint();
  }

  // ---------------- Carrera Rocket ----------------

  function race() {
    setView('race', hint([['Esc'], 'volver'], [['1', '5'], 'corredor'], [['←', '→'], 'apuesta'], [[T('Espacio')], 'correr']));
    const card = C().raceCard();
    st.pick = lastPick;
    body.innerHTML = `<h3 class="center">${T('Carrera Rocket')}</h3><canvas id="cas-track" class="cas-stage" width="360" height="170"></canvas>
      <p class="sub center" style="margin-top:6px">${T('Elige corredor y apuesta: si gana, cobras lo que dice su cuota.')}</p>
      <div class="rc-list">${C().RACERS.map((d, i) => `<button class="rc-pick" data-i="${i}"><span>${monName(d)}</span><b>${mult(card.odds[i])}</b></button>`).join('')}</div>`;
    body.appendChild(chips());
    const acts = document.createElement('div'); acts.className = 'cas-acts';
    acts.innerHTML = `<button class="btn gold" id="rc-go" data-sfx="none">${T('¡Que empiece!')}</button>`;
    body.appendChild(acts);
    body.querySelectorAll('.rc-pick').forEach(b => b.onclick = () => rcPick(+b.dataset.i));
    acts.querySelector('#rc-go').onclick = runRace;
    st.cv = body.querySelector('#cas-track');
    st.anims = C().RACERS.map(d => { const a = new G.Sprites.Animator(d, 1 / G.Sprites.PX); a.dir = 2; a.loop('Idle'); return a; });
    G.Sprites.preload(C().RACERS, 6000);
    st.x = C().RACERS.map(() => 0);
    rcPick(st.pick, true);
  }
  function rcPick(i, quiet) {
    if (st.running || i < 0 || i >= C().RACERS.length) return;
    st.pick = lastPick = i;
    if (!quiet) G.Audio.sfx('select');
    body.querySelectorAll('.rc-pick').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
  }
  function runRace() {
    if (view !== 'race' || st.running) return;
    if (st.res) { race(); return; }          // (tras una carrera, el botón prepara la siguiente)
    const r = C().race(bet(), st.pick);
    if (r.err) { sayErr(r.err); return; }
    hold = r.win; refresh(); say('');
    G.Audio.sfx('confirm');
    st.res = r; st.running = true; st.t = 0; st.tick = 0;
    st.phase = C().RACERS.map(() => Math.random() * 6);
    st.anims.forEach(a => a.loop('Walk', 1.6));
    body.querySelectorAll('.rc-pick, .cas-chip').forEach(b => { b.disabled = true; });
    wait('#rc-go', true);
  }
  function raceTick(dt) {
    const cv = st.cv; if (!cv || !st.anims) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, lane = 30, top = 14, x0 = 34, x1 = W - 30;
    ctx.imageSmoothingEnabled = false;
    if (st.running) {
      st.t += dt;
      if ((st.tick -= dt) <= 0) { st.tick = 0.22; G.Audio.sfx('grass'); }
      const r = st.res;
      st.x = r.times.map((T0, i) => {
        const u = st.t / T0;
        if (u >= 1) return 1;
        return Math.max(0, Math.min(0.999, u + 0.045 * Math.sin(Math.PI * u) * Math.sin(u * Math.PI * 3 + st.phase[i])));
      });
      st.x.forEach((x, i) => { if (x >= 1 && st.anims[i].base !== 'Idle') st.anims[i].loop('Idle'); });
      if (st.t >= Math.max(...r.times) + 0.4) { st.running = false; raceEnd(); }
    }
    // pista
    ctx.fillStyle = '#2f6b2a'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? '#c99a5b' : '#b8874a'; ctx.fillRect(0, top + i * lane, W, lane);
      ctx.fillStyle = '#8a6030'; ctx.fillRect(0, top + i * lane + lane - 2, W, 2);
    }
    for (let y = top; y < top + 5 * lane; y += 6) { ctx.fillStyle = (y / 6) % 2 ? '#fff' : '#16101f'; ctx.fillRect(x1, y, 6, 6); ctx.fillStyle = (y / 6) % 2 ? '#16101f' : '#fff'; ctx.fillRect(x1 + 6, y, 6, 6); }
    ctx.fillStyle = '#f4f2f8'; ctx.fillRect(x0, top, 2, 5 * lane);
    st.anims.forEach((a, i) => {
      a.update(dt);
      const x = x0 + (x1 - x0) * st.x[i], y = top + i * lane + lane - 4;
      a.draw(ctx, x, y);
      if (i === st.pick) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(4, top + i * lane + lane / 2 - 4, 8, 8); }
    });
    // puestos al llegar
    if (st.res && !st.running) st.res.order.forEach((idx, k) => {
      ctx.fillStyle = k === 0 ? '#ffd23f' : '#f4f2f8';
      ctx.font = '700 12px Pixelify, monospace';
      ctx.fillText(String(k + 1), x1 + 16, top + idx * lane + lane / 2 + 4);
    });
  }
  function raceEnd() {
    const r = st.res; hold = 0; refresh();
    const name = monName(C().RACERS[r.winner]);
    if (r.win > 0) { G.Audio.sfx('legend'); say(T('¡Gana {x}! +{x}', name, num(r.win)), 'win'); }
    else { G.Audio.sfx('gameover'); say(T('Gana {x}. Otra vez será.', name)); }
    wait('#rc-go', false); const b = el.querySelector('#rc-go'); if (b) b.textContent = T('Otra carrera');
  }

  // ---------------- ¡Atrapa a Pikachu! ----------------

  const PK = { speed: [60, 95, 135], ring: [44, 34, 26], pause: [[0.7, 1.3], [0.3, 0.7], [0.1, 0.3]] };
  function pika() {
    setView('pika', hint([['Esc'], 'volver'], [[T('Espacio')], 'lanzar']));
    const have = C().hasSkin();
    body.innerHTML = `<h3 class="center">${T('¡Atrapa a Pikachu!')}</h3>
      <canvas id="cas-pika" class="cas-stage" width="360" height="200"></canvas>
      <div class="pk-stat"><span><span>${T('Plan')}</span> <b id="pk-stage">1/3</b></span><span><span>${T('Bolas')}</span> <b id="pk-balls"></b></span></div>
      <p class="sub center" style="margin:6px 0">${T('Lanza la Poké Ball cuando Pikachu esté dentro del aro. Tienes 3 bolas en cada plan.')}</p>
      <div class="pk-prize"></div>
      <div class="cas-acts"><button class="btn gold" id="pk-go" data-sfx="none"></button></div>`;
    const prize = body.querySelector('.pk-prize');
    const cv = document.createElement('canvas'); cv.width = 84; cv.height = 84;
    G.UI.sprite(cv, 150, { skin: C().SKIN, scale: 2, hero: true, lively: true });
    prize.appendChild(cv);
    prize.insertAdjacentHTML('beforeend', `<span>${have ? T('Premio: {x} Pokémonedas (ya tienes la skin)', num(C().PIKA.PRIZE)) : T('Premio: skin exclusiva Mewtwo Obsidiana')}</span>`);
    body.querySelector('#pk-go').onclick = pkGo;
    st.cv = body.querySelector('#cas-pika');
    // Con el dedo o el ratón, tocar el campo también lanza (si ya estás jugando).
    st.cv.addEventListener('pointerdown', () => { if (st.playing) pkGo(); });
    st.a = new G.Sprites.Animator(25, 1); st.a.loop('Idle');
    G.Sprites.preload([25], 6000);
    st.p = { x: 180, y: 130, tx: 180, ty: 130, wait: 1, vis: 1, dash: 0, tp: 2.5 };
    st.playing = false; st.ball = null; st.stage = 0;
    pkPaint();
  }
  function pkPaint() {
    const go = body.querySelector('#pk-go'), pk = C().pk;
    if (go) {
      go.innerHTML = st.playing ? `<span>${T('¡Lanzar!')}</span>` : `<span>${T('Jugar')}</span> · <span class="coin"></span> ${num(C().PIKA.FEE)}`;
      go.classList.toggle('wait', !!(st.playing && (st.ball || st.p.vis < 1)));
    }
    const s = body.querySelector('#pk-stage'), b = body.querySelector('#pk-balls');
    if (s) s.textContent = Math.min(3, (pk ? pk.stage : 0) + 1) + '/3';
    if (b) b.textContent = '●'.repeat(pk && st.playing ? pk.balls : C().PIKA.BALLS);
  }
  function pkGo() {
    if (view !== 'pika') return;
    if (!st.playing) {
      const r = C().pkStart();
      if (r.err) { sayErr(r.err); return; }
      refresh(); G.Audio.sfx('confirm');
      st.playing = true; st.stage = 0; say('');
      pkPaint(); return;
    }
    if (st.ball || st.p.vis < 1) return;
    // La bola sale de abajo y cae en el centro del aro: cuenta dónde está Pikachu al llegar.
    G.Audio.sfx('ball');
    st.ball = { t: 0, fly: 0.28, shakes: 0, phase: 'fly', res: null };
    pkPaint();
  }
  function pkTick(dt) {
    const cv = st.cv; if (!cv || !st.p) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, p = st.p, sg = Math.min(2, st.stage);
    const cx = W / 2, cy = H / 2 + 10, ring = PK.ring[sg];
    ctx.imageSmoothingEnabled = false;
    st.t += dt;
    // Pikachu: va de un sitio a otro y para un poco; en el 2.º plan, Ataque Rápido; en el 3.º, Agilidad (desaparece).
    const frozen = st.ball && st.ball.phase !== 'fly';
    if (!frozen && p.vis >= 1) {
      if (p.wait > 0) { p.wait -= dt; st.a.loop('Idle'); }
      else {
        const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
        let v = PK.speed[sg] * (st.playing ? 1 : 0.6);
        if (sg >= 1 && (p.dash -= dt) > 0) v *= 2.6;
        else if (sg >= 1 && p.dash < -1.6 && Math.random() < dt * 0.8) p.dash = 0.35;
        if (d < 4) {
          const [a, b] = PK.pause[sg];
          p.wait = a + Math.random() * (b - a);
          // A veces se para dentro del aro: es cuando hay que lanzar.
          const inRing = Math.random() < 0.45;
          const ang = Math.random() * Math.PI * 2, rr = inRing ? Math.random() * ring * 0.7 : ring + 20 + Math.random() * 80;
          p.tx = Math.max(24, Math.min(W - 24, cx + Math.cos(ang) * rr * (inRing ? 1 : 1.6))); p.ty = Math.max(46, Math.min(H - 10, cy + 12 + Math.sin(ang) * rr));
        } else {
          const k = Math.min(1, v * dt / d);
          p.x += dx * k; p.y += dy * k;
          st.a.dir = G.Sprites.dirFromAngle(Math.atan2(dy, dx));
          st.a.loop('Walk', sg >= 1 ? 1.6 : 1.1);
        }
      }
      if (sg >= 2 && st.playing && (p.tp -= dt) <= 0) { p.vis = 0; p.tp = 1.8 + Math.random() * 1.6; }
    } else if (p.vis < 1 && !frozen) {
      p.vis += dt / 0.3;
      if (p.vis >= 1) { p.vis = 1; p.x = 30 + Math.random() * (W - 60); p.y = 50 + Math.random() * (H - 60); p.wait = 0; pkPaint(); }
    }
    st.a.update(dt);
    // Pelota en el aire / en el suelo
    const b = st.ball;
    if (b) {
      b.t += dt;
      if (b.phase === 'fly' && b.t >= b.fly) {
        const by = p.y - 12 * 2 * 0.5;
        const inside = p.vis >= 1 && Math.hypot(p.x - cx, by - cy) < ring;
        b.res = C().pkThrow(inside);
        b.phase = inside ? 'shake' : 'miss'; b.t = 0;
        if (inside) { G.Audio.sfx('confirm'); b.shakes = b.res.res === 'caught' || b.res.res === 'won' ? 3 : 1 + Math.floor(Math.random() * 2); }
        else { G.Audio.sfx('back'); say(T('¡Fallaste!'), 'bad'); }
      } else if (b.phase === 'shake') {
        const k = Math.floor(b.t / 0.45);
        if (k !== b.k && k <= b.shakes) { b.k = k; if (k > 0) G.Audio.sfx('shake'); }
        if (b.t > b.shakes * 0.45 + 0.4) pkResult();
      } else if (b.phase === 'miss' && b.t > 0.5) pkResult();
    }
    // Dibujo: hierba, aro y Pikachu
    ctx.fillStyle = '#3f8f3a'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) { ctx.fillStyle = i % 3 ? '#4fa046' : '#2f7a2a'; ctx.fillRect((i * 61) % W, (i * 37) % H, 4, 2); }
    ctx.fillStyle = st.playing ? 'rgba(255,210,63,.18)' : 'rgba(255,255,255,.08)';
    ctx.beginPath(); ctx.arc(cx, cy, ring, 0, 7); ctx.fill();
    ctx.strokeStyle = st.playing ? '#ffd23f' : '#c9b6ff'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, ring, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    const caught = b && b.phase === 'shake';
    if (!caught && p.vis >= 1) {
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 12, 4, 0, 0, 7); ctx.fill();
      st.a.draw(ctx, p.x, p.y);
    } else if (!caught && p.vis < 1) {
      // Agilidad: unas rayas donde estaba
      ctx.fillStyle = 'rgba(255,216,61,' + (1 - p.vis) + ')';
      for (let i = 0; i < 4; i++) ctx.fillRect(p.x - 16 + i * 8, p.y - 26 + (i % 2) * 6, 6, 2);
    }
    if (b) {
      let bx = cx, by = cy;
      if (b.phase === 'fly') { const u = Math.min(1, b.t / b.fly); bx = cx; by = H + 10 - (H + 10 - cy) * u - Math.sin(u * Math.PI) * 40; }
      else if (b.phase === 'shake') { const k = Math.floor(b.t / 0.45); bx = cx + (k < b.shakes && (b.t % 0.45) < 0.2 ? (k % 2 ? 3 : -3) : 0); }
      else { bx = cx + b.t * 120; by = cy - Math.sin(Math.min(1, b.t * 2) * Math.PI) * 20; }
      pix(ctx, ICON.ball, bx - 12, by - 12, 2);
    }
  }
  function pkResult() {
    const r = st.ball.res; st.ball = null;
    const p = st.p;
    if (r.res === 'won') {
      G.Audio.sfx('shinyGet'); st.playing = false; st.stage = 2; refresh();
      say(r.skin ? T('¡Lo has atrapado! Skin Mewtwo Obsidiana conseguida.') : T('¡Lo has atrapado! +{x}', num(r.coins)), 'win');
      p.wait = 99;
    } else if (r.res === 'caught') {
      G.Audio.sfx('levelup'); st.stage = r.stage;
      say(T('¡Atrapado! Pikachu se escapa al siguiente plan…'), 'win');
      p.vis = 0; p.tp = 3;
    } else if (r.res === 'lost') {
      G.Audio.sfx('gameover'); st.playing = false;
      say(T('Pikachu se ha escapado. Otra vez será.'), 'bad');
      p.vis = 0; st.stage = 0;
    } else if (r.res === 'free') {
      G.Audio.sfx('break');
      say(T('¡Se ha escapado de la bola!'), 'bad');
      p.wait = 0; p.dash = 0.5;
    }
    pkPaint();
  }

  // ---------------- bucle y teclas ----------------

  function loop(ts) {
    if (!open) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(1 / 20, (ts - last) / 1000 || 0); last = ts;
    try {
      if (view === 'intro') drawIntro(dt);
      else if (view === 'slots') slotsTick(dt);
      else if (view === 'race') raceTick(dt);
      else if (view === 'pika') pkTick(dt);
    } catch (e) { console.error('[casino]', e); }
  }

  /** Lo llama game.js con el casino abierto (en vez de sus teclas de siempre). */
  function keys() {
    if (!open) return;
    const I = G.Input, tap = k => I.tap(k);
    if (tap('escape')) { back(); return; }
    const act = tap('space') || tap('enter');
    const dig = [1, 2, 3, 4, 5].find(n => tap('digit' + n) || tap('numpad' + n));
    if (view === 'intro') { if (act) { G.Audio.music('casino'); lobby(); } return; }
    if (view === 'lobby') { if (dig && dig <= 4) game(dig - 1); return; }
    if (view === 'slots') { if (dig && dig <= 4) pickBet(dig - 1); if (act) doSpin(); return; }
    if (view === 'voltorb') {
      if (dig && dig <= 4) pickBet(dig - 1);
      const mv = tap('arrowleft') || tap('keya') ? -1 : tap('arrowright') || tap('keyd') ? 1 : tap('arrowup') || tap('keyw') ? -5 : tap('arrowdown') || tap('keys') ? 5 : 0;
      if (mv) { const n = st.sel + mv; if (n >= 0 && n < C().VF.N && !(Math.abs(mv) === 1 && Math.floor(n / 5) !== Math.floor(st.sel / 5))) { st.sel = n; G.Audio.sfx('hover'); vfPaint(); } }
      if (act) { const v = C().vf; if (v && v.over) voltorb(); else flip(st.sel); }
      if (tap('keyc')) cash();
      return;
    }
    if (view === 'race') {
      if (dig) rcPick(dig - 1);
      if (tap('arrowleft') || tap('keya')) pickBet(Math.max(0, betIx - 1));
      if (tap('arrowright') || tap('keyd')) pickBet(Math.min(C().BETS.length - 1, betIx + 1));
      if (act) runRace();
      return;
    }
    if (view === 'pika') { if (act) pkGo(); }
  }

  return {
    show, hide, keys,
    get isOpen() { return open; },
    get view() { return view; },
    /** Para pruebas: abrir una vista (lobby, slots, voltorb, race, pika). */
    debugView(v) { if (!open) return false; if (v === 'lobby') lobby(); else if (v === 'intro') intro(); else ({ slots, voltorb, race, pika })[v](); return true; },
    /** Para pruebas: lo que se ve de cada animación. */
    get state() { return st; }
  };
})();
