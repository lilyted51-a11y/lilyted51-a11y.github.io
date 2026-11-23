/* ============ mastery.js — Maestría de cada Pokémon ============
 * (23-11-2026; como la Maestría de la Gran Actualización del juego oficial, hecho aquí a partir de
 *  su guía.) Jugar mucho con un Pokémon te da su maestría. Cada partida suma puntos al Pokémon que
 * ELEGISTE (aunque evolucione en la partida), en solitario o en grupo:
 *   1 punto por cada 6 Pokémon derrotados y 25 por cada minuto aguantado.
 * De una partida cuentan como mucho 40 minutos (los derrotados, en proporción). No cuentan las
 * partidas tocadas (G.Game.clean, también con ventajas) ni las marcadas con pl.noMastery (desafío
 * semanal: ahí el Pokémon no lo eliges tú).
 *
 *   Puntos    Premio
 *   10.000    Foto de maestría: su cara Inspirado (core/photo.js), que no se vende
 *   25.000    Título «Maestro de …» para el perfil
 *   50.000    Marco de maestría: dorado, con las gemas de sus tipos y su cara en un medallón
 *   100.000   Aura de maestro: brillo dorado y chispas al jugar con él; el grupo también la ve
 *             (va en el estado de cada jugador, coop.js: a[20])
 * Pasados los 100.000 se sigue sumando, sin tope.
 *
 * En la partida guardada (core/db.js, merge, los junta con el mayor de cada número):
 *   mast[dex]  = puntos
 *   mstat[dex] = { r: partidas, t: segundos jugados, k: derrotados, a: llegadas a Arceus,
 *                  bt: mejor tiempo, b: jefes, rf: grietas ganadas, e: Eternatus vencidos }
 * La pantalla está en ui/mastery-ui.js.
 */
G.Mastery = (() => {
  const TIERS = [
    { id: 'photo', at: 10000, icon: 'user', name: 'Foto de maestría', desc: 'Una cara especial de este Pokémon para tu perfil, que no se vende en la Tienda Kecleon.' },
    { id: 'title', at: 25000, icon: 'medal3', name: 'Título de maestro', desc: 'El título «Maestro de …» para tu perfil.' },
    { id: 'frame', at: 50000, icon: 'crown', name: 'Marco de maestría', desc: 'El marco dorado con las gemas de su tipo y su cara en el medallón.' },
    { id: 'aura', at: 100000, icon: 'star', name: 'Aura de maestro', desc: 'Un brillo dorado y chispas al jugar con él; los de tu grupo también lo ven.' }
  ];
  const BY = Object.fromEntries(TIERS.map(t => [t.id, t]));
  const MAX_T = 40 * 60;                 // segundos que cuentan de una partida
  const STAT_KEYS = ['r', 't', 'k', 'a', 'bt', 'b', 'rf', 'e'];

  const sv = () => G.DB.save;
  const points = (dex, s = sv()) => (s && s.mast && +s.mast[dex]) || 0;
  const has = (dex, id, s = sv()) => !!BY[id] && points(dex, s) >= BY[id].at;
  const stats = (dex, s = sv()) => Object.assign({ r: 0, t: 0, k: 0, a: 0, bt: 0, b: 0, rf: 0, e: 0 }, (s && s.mstat && s.mstat[dex]) || {});
  /** El siguiente premio (o null si ya los tiene todos). */
  const next = dex => TIERS.find(t => points(dex) < t.at) || null;
  /** Lo que llevas hacia el siguiente premio, de 0 a 1 (1 con todos). */
  function progress(dex) {
    const p = points(dex), n = next(dex);
    if (!n) return 1;
    const i = TIERS.indexOf(n), from = i ? TIERS[i - 1].at : 0;
    return (p - from) / (n.at - from);
  }
  /** Cuántos premios tiene (0-4): para el icono. */
  const level = dex => TIERS.filter(t => points(dex) >= t.at).length;
  const title = dex => G.DEX_BY[dex] ? 'Maestro de ' + G.DEX_BY[dex].name : '';
  /** Los títulos de maestro que tienes. */
  function titles(s = sv()) {
    return Object.keys((s && s.mast) || {}).filter(d => G.DEX_BY[d] && has(+d, 'title', s)).map(d => title(+d));
  }
  /** Puntos que da una partida. */
  function gain(time, kills) {
    time = Math.max(0, +time || 0);
    const k = time > MAX_T ? kills * MAX_T / time : kills;
    return Math.floor(Math.min(time, MAX_T) / 60 * 25) + Math.floor(Math.max(0, k) / 6);
  }

  // ---------------- en la partida ----------------

  let run = null;
  /** Al empezar (game.js startRun): con quién juegas y si lleva el aura. */
  function runStart(pl, dex) {
    run = { dex: +dex, rf: 0, e: 0, a: 0 };
    if (pl) pl.aura = has(+dex, 'aura');
  }
  /** Lo que pasa en la partida (progress.js event). */
  function note(kind) {
    if (!run) return;
    if (kind === 'rift') run.rf++;
    else if (kind === 'eternatus') run.e++;
    else if (kind === 'judge') run.a = 1;
  }
  /**
   * Al acabar (game.js endRun, antes de guardar): suma puntos y números.
   * ok = partida limpia. → { dex, pts, total, got: [premios nuevos] } o null.
   */
  function runEnd(pl, time, ok) {
    const r = run, s = sv();
    run = null;
    if (!r || !pl || !s || !G.DEX_BY[r.dex] || !ok || pl.noMastery) return null;
    const dex = r.dex, before = points(dex);
    const pts = gain(time, pl.kills || 0);
    s.mast = s.mast || {};
    s.mstat = s.mstat || {};
    s.mast[dex] = before + pts;
    const st = stats(dex);
    st.r++; st.t += Math.floor(time); st.k += pl.kills || 0; st.a += r.a; st.b += pl.bosses || 0; st.rf += r.rf; st.e += r.e;
    st.bt = Math.max(st.bt, Math.floor(time));
    s.mstat[dex] = st;
    const got = TIERS.filter(t => before < t.at && before + pts >= t.at);
    return { dex, pts, total: before + pts, got };
  }

  // ---------------- aura de maestro ----------------

  /** Brillo dorado en el suelo y chispas que suben (debajo del Pokémon; ver Player.draw). */
  function drawAura(ctx, p) {
    if (!(p.aura || (p.net && p.net.au)) || p.dead) return;
    const t = performance.now() / 1000, r = p.r || 14, h = p.bodyH || 30;
    ctx.save();
    const g = ctx.createRadialGradient(p.x, p.y - h * 0.4, 2, p.x, p.y - h * 0.4, r * 2.6);
    g.addColorStop(0, 'rgba(255,226,120,0.32)');
    g.addColorStop(1, 'rgba(255,200,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y - h * 0.4, r * 2.6, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 0.5 + Math.sin(t * 3) * 0.15;
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 1.9, r * 0.75, 0, 0, 6.2832); ctx.stroke();
    // Chispas: cada una sube y se apaga (sale de la hora, sin guardar nada).
    for (let i = 0; i < 7; i++) {
      const k = (t * 0.6 + i / 7) % 1, a = i * 2.39 + Math.floor(t * 0.6 + i / 7) * 1.7;
      const x = p.x + Math.cos(a) * r * 1.4, y = p.y - k * h * 1.6;
      ctx.globalAlpha = Math.sin(k * Math.PI) * 0.9;
      const s = 2;
      ctx.fillStyle = '#fff4b0';
      ctx.fillRect(Math.round(x) - s / 2, Math.round(y) - s * 1.5, s, s * 3);
      ctx.fillRect(Math.round(x) - s * 1.5, Math.round(y) - s / 2, s * 3, s);
    }
    ctx.restore();
  }

  // ---------------- partida guardada ----------------

  /** Limpia lo de la partida guardada (core/db.js, sanitize). */
  function sanitize(s) {
    const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
    const num = v => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0);
    if (!isObj(s.mast)) s.mast = {};
    for (const d of Object.keys(s.mast)) { s.mast[d] = num(s.mast[d]); if (!s.mast[d] || (G.DEX_BY && !G.DEX_BY[d])) delete s.mast[d]; }
    if (!isObj(s.mstat)) s.mstat = {};
    for (const d of Object.keys(s.mstat)) {
      const e = s.mstat[d];
      if (!isObj(e) || (G.DEX_BY && !G.DEX_BY[d])) { delete s.mstat[d]; continue; }
      for (const k of Object.keys(e)) if (!STAT_KEYS.includes(k)) delete e[k]; else e[k] = num(e[k]);
    }
  }
  return { TIERS, BY, MAX_T, points, has, stats, next, progress, level, title, titles, gain, runStart, note, runEnd, drawAura, sanitize,
           get run() { return run; } };
})();
