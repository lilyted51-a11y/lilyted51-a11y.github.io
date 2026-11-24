/* ============ ranking-ui.js — pantalla del ranking ============
 * Pestañas Solo / Grupo, periodo (diario ... histórico), todos o sólo amigos,
 * filtro por Pokémon (sólo en el histórico) y tu puesto abajo aunque no salgas
 * en el top. Lo leído se guarda 2 h (ver ranking.js).
 * Dos mitades (23-10-2026): a la izquierda el daño a Arceus y a la derecha el
 * tiempo aguantado. Salen de la misma lectura (el mismo resumen).
 * Desafío semanal (23-11-2026, systems/challenge.js): tercera pestaña, con la tabla de la semana
 * (sólo tiempo, sin periodos ni filtro por Pokémon) y arriba el desafío de esta semana.
 * Foto, marco y build (24-11-2026): cada fila lleva la foto y el marco de cada jugador junto a su
 * Pokémon; al tocarla se abre la build de cada uno (openBuild, ventana #scr-rkb).
 */
G.RankingUI = (() => {
  const $ = G.UI.$;
  const esc = G.U.esc;
  let mode = 's', period = 'w', scope = 'all', dex = null;
  let token = 0;

  function init() {
    const dl = $('rk-dl');
    dl.innerHTML = G.DEX.map(p => `<option value="${esc(G.T(p.name))}">`).join('');
    $('rk-poke').onchange = () => {
      const v = $('rk-poke').value.trim().toLowerCase();
      const p = G.DEX.find(x => (x.name.toLowerCase() === v || G.T(x.name).toLowerCase() === v));
      if (!v) { setDex(null); return; }
      if (!p) { G.UI.toast('No hay ningún Pokémon con ese nombre'); return; }
      setDex(p.dex);
    };
    $('rk-clear').onclick = () => { $('rk-poke').value = ''; setDex(null); };
    $('rk-mod').onclick = () => G.ModUI.open();
    // Build de una marca: Cerrar o tocar fuera de la ventana (Esc, Atrás y B: game.js / gamepad.js).
    $('rkb-close').onclick = closeBuild;
    $('scr-rkb').onclick = e => { if (e.target.id === 'scr-rkb') closeBuild(); };
  }

  /** El filtro por Pokémon sólo existe en el histórico: al elegir uno se pasa a esa pestaña. */
  function setDex(d) {
    dex = d;
    if (d && period !== 'a') period = 'a';
    $('rk-clear').classList.toggle('hidden', !d);
    tabs(); load();
  }

  /** @param m  pestaña con la que se abre ('c': el desafío semanal) */
  function open(m) {
    if (!G.SocialUI.needOnline()) return;
    if (m) { mode = m; if (m === 'c' && dex) { dex = null; $('rk-poke').value = ''; } }
    G.UI.show('scr-rank', true);
    if (!G.Social.started) G.Social.start();
    $('rk-mod').classList.toggle('hidden', !G.Ranking.isAdmin());
    G.Ranking.retry();          // marcas que no pudieron subir por la conexión (ranking.js)
    tabs();
    load();
  }

  function tabs() {
    const mk = (box, items, cur, set, cls) => {
      box.innerHTML = '';
      for (const [k, label] of items) {
        const b = document.createElement('button');
        b.className = cls + (k === cur ? ' on' : '');
        b.innerHTML = label;
        b.onclick = () => { set(k); tabs(); load(); };
        box.appendChild(b);
      }
    };
    mk($('rk-mode'), [['s', `<b>${G.Icons.html('user', 16)} Solo</b>`], ['g', `<b>${G.Icons.html('friends', 16)} Grupo</b>`],
                      ['c', `<b>${G.Icons.html('trophy', 16)} Desafío semanal</b>`]],
       mode, k => { mode = k; if (k === 'c' && dex) { dex = null; $('rk-poke').value = ''; } }, 'gen-tab');
    // Desafío semanal: sin periodos, sin filtro por Pokémon y sin daño a Arceus; arriba, el de esta semana.
    const ch = mode === 'c';
    $('rk-period').classList.toggle('hidden', ch);
    $('rk-poke').classList.toggle('hidden', ch);
    $('rk-clear').classList.toggle('hidden', ch || !dex);
    $('rk-split').classList.toggle('one', ch);
    $('rk-ch').classList.toggle('hidden', !ch);
    if (ch) {
      const c = G.Challenge.thisWeek(), mon = G.DEX_BY[c.dex];
      $('rk-ch').innerHTML = `${G.Icons.html('trophy', 16)} <span>${esc(G.I18n.f('Esta semana: {x} · {x}', mon ? G.T(mon.name) : '?', G.Challenge.label(c)))}</span>`;
    }
    mk($('rk-period'), G.Ranking.PERIODS, period, k => {
      period = k;
      if (k !== 'a' && dex) { dex = null; $('rk-poke').value = ''; $('rk-clear').classList.add('hidden'); }
    }, 'chip');
    mk($('rk-scope'), [['all', 'Todos'], ['friends', 'Sólo amigos']], scope, k => { scope = k; }, 'chip');
  }

  const fmt = G.U.hmmss;

  async function load() {
    const my = ++token;
    const list = $('rk-list'), dlist = $('rk-dlist');
    list.innerHTML = dlist.innerHTML = '<p class="sub">Cargando…</p>';
    $('rk-me').innerHTML = $('rk-dme').innerHTML = '';
    let rows = [], me = null, dmg = { rows: [], me: null };
    if (mode === 'c') { loadChallenge(my); return; }
    try {
      [rows, me, dmg] = await Promise.all([
        G.Ranking.top(mode, period, dex, scope === 'friends'),
        G.Social.me ? G.Ranking.myRank(mode, period, dex) : Promise.resolve(null),
        dex ? Promise.resolve(dmg) : G.Ranking.topDmg(mode, period, scope === 'friends')
      ]);
    } catch (e) {
      if (my !== token) return;
      list.innerHTML = dlist.innerHTML = '<p class="sub">No se pudo cargar el ranking (' + esc(e.code || e.message) + ').</p>';
      return;
    }
    if (my !== token) return;
    list.innerHTML = dlist.innerHTML = '';
    if (!rows.length) {
      // Sólo amigos: por Pokémon sólo se guarda el top 50 (ranking.js); en lo demás salen todos tus amigos.
      list.innerHTML = scope === 'friends'
        ? (dex ? '<p class="sub">Ninguno de tus amigos está en el top 50 con este Pokémon.</p>'
               : '<p class="sub">Ni tú ni tus amigos tenéis marca aquí todavía.</p>')
        : '<p class="sub">Todavía no hay marcas aquí. ¡Sé el primero!</p>';
    }
    const uid = G.Social.uid;
    const b = G.Ranking.board(mode, period, dex), done = G.Ranking.reported();
    rows.forEach((r, i) => list.appendChild(rowEl(r, i + 1, r.uids.includes(uid), b, done)));

    // Daño a Arceus (no hay por Pokémon).
    if (dex) dlist.innerHTML = '<p class="sub">El daño a Arceus no tiene ranking por Pokémon.</p>';
    else if (!dmg.rows.length) dlist.innerHTML = '<p class="sub">Todavía nadie le ha hecho daño a Arceus aquí. ¡Llega al minuto 30 y pégale!</p>';
    const db = G.Ranking.board(mode, period);
    dmg.rows.forEach((r, i) => dlist.appendChild(rowEl(r, i + 1, r.uids.includes(uid), db, done, true)));
    const dme = $('rk-dme');
    dme.setAttribute('translate', 'no');
    dme.textContent = dex || !dmg.me ? '' : dmg.me.out ? G.T('Aún no estás en el top 50 de daño.')
      : G.I18n.f('Tu puesto: {x}', '#' + dmg.me.pos) + ' · ' + num(dmg.me.d);
    dme.classList.toggle('hidden', !dme.textContent);

    // La frase se monta en cada idioma (traducirla por trozos sale rara).
    const lang = G.I18n.lang, en = lang === 'en', pos = '#' + (me && me.capped ? '1000+' : me && me.pos);
    if (lang !== 'es' && !en) {
      // Otros idiomas: frases enteras sin periodo ni Pokémon (ya se ven en los filtros).
      const rk = $('rk-me');
      rk.setAttribute('translate', 'no');
      rk.textContent = !G.Social.me ? G.T('Elige un apodo (en Amigos) para salir en el ranking.')
        : me && me.out ? G.T('Aún no estás en el top 50. Tu puesto está en Histórico.')
        : me ? G.I18n.f('Tu mejor puesto: {x}', pos) + ' · ' + fmt(me.t)
        : G.T('Aún no tienes marca.');
      return;
    }
    const pn = en ? { d: 'today', w: 'this week', m: 'this month', y: 'this year', a: 'of all time' }[period]
                  : { d: 'de hoy', w: 'de esta semana', m: 'de este mes', y: 'de este año', a: 'de siempre' }[period];
    const mon = dex ? G.DEX_BY[dex].name : '';
    const where = en ? (mode === 's' ? 'solo' : 'group') + (dex ? ' with ' + mon : '')
                     : (mode === 's' ? 'en solitario' : 'en grupo') + (dex ? ' con ' + mon : '');
    $('rk-me').removeAttribute('translate');
    $('rk-me').innerHTML = !G.Social.me ? 'Elige un apodo (en Amigos) para salir en el ranking.'
      : me && me.out ? (en ? `<span translate="no">You're not in the top 50 ${where} ${pn} yet. Your rank is in All-time.</span>`
                           : `Aún no estás en el top 50 ${pn} ${where}. Tu puesto está en Histórico.`)
      : me ? (en ? `<span translate="no">Your best ${where} rank ${pn}: <b class="gold">${pos}</b> · ${fmt(me.t)}</span>`
                 : `Tu mejor puesto ${pn} ${where}: <b class="gold">${pos}</b> · ${fmt(me.t)}`)
      : (en ? `<span translate="no">You don't have a ${where} record ${pn} yet.</span>` : `Aún no tienes marca ${pn} ${where}.`);
  }

  /** Desafío semanal: la tabla de esta semana (sólo tiempo aguantado) y tu puesto. */
  async function loadChallenge(my) {
    const list = $('rk-list');
    let rows = [], me = null;
    try {
      [rows, me] = await Promise.all([
        G.Ranking.top('s', 'c', null, scope === 'friends'),
        G.Social.me ? G.Ranking.myRank('s', 'c') : Promise.resolve(null)
      ]);
    } catch (e) {
      if (my !== token) return;
      list.innerHTML = '<p class="sub">No se pudo cargar el ranking (' + esc(e.code || e.message) + ').</p>';
      return;
    }
    if (my !== token) return;
    list.innerHTML = '';
    if (!rows.length) list.innerHTML = scope === 'friends' ? '<p class="sub">Ni tú ni tus amigos tenéis marca en el desafío de esta semana.</p>'
      : '<p class="sub">Todavía nadie ha jugado el desafío de esta semana. ¡Sé el primero!</p>';
    const uid = G.Social.uid, b = G.Ranking.board('s', 'c'), done = G.Ranking.reported();
    rows.forEach((r, i) => list.appendChild(rowEl(r, i + 1, r.uids.includes(uid), b, done)));
    const rk = $('rk-me');
    rk.removeAttribute('translate');
    rk.innerHTML = !G.Social.me ? esc(G.T('Elige un apodo (en Amigos) para salir en el ranking.'))
      : me && !me.out ? esc(G.I18n.f('Tu puesto en el desafío de esta semana: {x}', '#' + (me.capped ? '1000+' : me.pos))) + ' · ' + fmt(me.t)
      : esc(G.T('Aún no tienes marca en el desafío de esta semana.'));
  }

  const num = n => (n || 0).toLocaleString(G.I18n.locale);

  /** Una fila: de tiempo o, con dmg, de daño a Arceus. Tocarla abre su build (24-11-2026). */
  function rowEl(r, pos, mine, b, done, dmg = false) {
    const el = document.createElement('div');
    el.className = 'rk-row tap' + (mine ? ' mine' : '') + (pos <= 3 ? ' top' + pos : '');
    el.insertAdjacentHTML('beforeend', `<span class="pos">${pos <= 3 ? G.Icons.html('trophy', 20) : ''}${pos}</span>`);
    // Cada jugador con su foto y su marco, y su Pokémon (en grupo, más pequeños: el Pokémon sobre la esquina de la foto).
    const mons = document.createElement('span'), phs = G.Ranking.phs(r), group = r.dex.length > 1;
    mons.className = 'mons' + (group ? ' grp' : '');
    r.dex.forEach((d, i) => {
      if (!G.DEX_BY[d]) return;
      const pm = document.createElement('span');
      pm.className = 'rk-pm';
      if (phs[i]) pm.insertAdjacentHTML('beforeend', G.Photo.html(phs[i], group ? 30 : 34));
      pm.appendChild(group ? G.UI.spriteCanvas(d, 34, 30, { scale: 1, shiny: !!r.shiny[i] }) : G.UI.spriteCanvas(d, 44, 40, { scale: 1, shiny: !!r.shiny[i] }));
      mons.appendChild(pm);
    });
    el.appendChild(mons);
    el.onclick = e => { if (!e.target.closest('a, button')) openBuild(r, b, dmg); };
    el.insertAdjacentHTML('beforeend',
      `<span class="who"><b translate="no">${r.names.map((n, i) => `<a href="#" class="plink" data-u="${esc(r.uids[i] || '')}">${esc(n)}</a>`).join(' · ')}</b>${dmg ? '' : `<small>Nv. ${r.lv || 1} · ${num(r.kills)} derrotados</small>`}</span>
       <span class="time">${dmg ? num(r.d) : fmt(r.t)}</span>`);
    el.querySelectorAll('.plink').forEach(a => { a.onclick = e => { e.preventDefault(); G.ProfileUI.show(a.dataset.u); }; });
    // Reportar una marca sospechosa (no la tuya). Lo revisa el admin (mod-ui.js).
    if (!mine && G.Social.me) {
      const rep = document.createElement('button');
      const sent = done.has(b + '__' + r.id);
      rep.className = 'rk-rep' + (sent ? ' sent' : '');
      rep.title = sent ? 'Ya la has reportado' : 'Reportar marca sospechosa';
      rep.innerHTML = G.Icons.html('flag', 16);
      rep.onclick = async () => {
        if (rep.classList.contains('sent')) { G.UI.toast('Ya has reportado esta marca'); return; }
        if (!confirm('¿Reportar la marca de ' + r.names.join(', ') + ' como trampa?')) return;
        rep.classList.add('sent'); rep.title = 'Ya la has reportado';
        await G.Ranking.report(b, r);
        G.UI.toast('Gracias: la revisaremos');
      };
      el.appendChild(rep);
    } else el.appendChild(document.createElement('span'));
    return el;
  }

  // ---------------- build de una marca (24-11-2026) ----------------
  /*
   * Toca una marca y sale la build de cada jugador: su foto y su marco, el Pokémon con el que acabó
   * (evolucionado, shiny, skin), su nivel, sus ataques con su nivel y el daño que hizo cada uno, y sus
   * objetos (net/ranking.js, buildOf: 1 lectura). Las marcas de antes no la llevan: se dice.
   * Se cierra con Cerrar, Esc, el botón Atrás del móvil, B en el mando o tocando fuera (game.js).
   */
  let bTok = 0;
  const N = v => Math.round(v || 0).toLocaleString(G.I18n.locale);
  async function openBuild(r, b, dmg) {
    const my = ++bTok, body = $('rkb-body');
    // (Cada frase en su trozo: juntas, el parche del chino las leía como una sola.)
    $('rkb-mark').innerHTML = dmg ? `<span>${esc(G.I18n.f('Daño a Arceus: {x}', N(r.d)))}</span>`
      : `<span>${esc(G.I18n.f('Tiempo aguantado: {x}', fmt(r.t)))}</span> · <span>${esc(G.I18n.f('{x} derrotados', N(r.kills)))}</span>`;
    body.innerHTML = '<p class="sub">Cargando…</p>';
    $('scr-rkb').classList.remove('hidden');
    $('scr-rkb').scrollTop = 0;
    let builds = [];
    try { builds = await G.Ranking.buildOf(b, r, dmg); } catch (e) {
      if (my === bTok) body.innerHTML = '<p class="sub">' + esc(G.I18n.f('No se pudo cargar la build ({x}).', e.code || e.message)) + '</p>';
      return;
    }
    if (my !== bTok) return;
    body.innerHTML = '';
    if (!builds.some(Boolean)) body.insertAdjacentHTML('beforeend', `<p class="sub rkb-none">${esc(G.T('Esta marca es de antes de que se guardara la build: no hay datos.'))}</p>`);
    const phs = G.Ranking.phs(r);
    r.uids.forEach((u, i) => body.appendChild(playerEl(r, i, builds[i], phs[i], !builds.some(Boolean))));
  }
  /** Un jugador de la marca: cabecera (foto, Pokémon, nombre) y, si la hay, su build. */
  function playerEl(r, i, bd, ph, none) {
    const el = document.createElement('div');
    el.className = 'rkb-p';
    const dex = bd && G.DEX_BY[bd.dex] ? bd.dex : r.dex[i], mon = G.DEX_BY[dex];
    const head = document.createElement('div');
    head.className = 'rkb-head';
    if (ph) head.insertAdjacentHTML('beforeend', G.Photo.html(ph, 56));
    if (mon) head.appendChild(G.UI.spriteCanvas(dex, 76, 64, { scale: 2, lively: true, shiny: bd ? bd.sh : !!r.shiny[i], skin: bd && bd.sk && G.Skins && G.Skins.get(bd.sk, dex) ? bd.sk : null }));
    let total = 0;
    const rows = (bd ? bd.mv : []).map(x => {
      const def = G.Moves.BY_ID[x.id];
      if (!def) return '';
      // (Nunca por encima de los niveles que tiene: lo que llega de otros jugadores no se cree a ciegas.)
      const m = G.Moves.instance(x.id, Math.min(x.lvl, (def.ups || []).length + 1));
      if (x.evo) G.Moves.evolve(m);
      if (m.cat) total += x.dmg;
      return `<tr><td>${G.Icons.html('move:' + x.id, 18)} ${esc(G.T(m.name, 'move'))}</td><td class="num">${G.I18n.f('Nv. {x}', x.lvl)}</td><td class="num">${m.cat ? N(x.dmg) : '—'}</td></tr>`;
    }).join('');
    // (La línea del Pokémon, entera en cada idioma, como en el resumen de la partida: run-ui.js sumHtml. Sin
    //  translate="no": no lleva apodos y así el parche del chino la traduce.)
    const line = !mon ? '' : bd ? G.I18n.f('{x} · Nv. {x} · {x} de daño en total', G.T(mon.name), bd.lv, N(total)) : G.T(mon.name);
    head.insertAdjacentHTML('beforeend', `<div class="rkb-who"><b translate="no">${esc(r.names[i] || '?')}</b>
      <span>${bd && bd.sh ? G.Icons.html('shiny', 12) + ' ' : ''}${esc(line)}</span></div>`);
    el.appendChild(head);
    if (!bd) {
      if (!none) el.insertAdjacentHTML('beforeend', `<p class="sub">${esc(G.T('No hay datos de la build de este jugador.'))}</p>`);
      return el;
    }
    const its = bd.its.filter(id => G.Items.BY[id]);
    el.insertAdjacentHTML('beforeend', `<table class="sum-moves"><tr><th>${esc(G.T('Ataques'))}</th><th class="num">${esc(G.T('Nivel'))}</th><th class="num">${esc(G.T('Daño'))}</th></tr>${rows}</table>
      <p class="sub rkb-its">${its.length ? its.map(id => G.Icons.html(id, 16) + ' ' + esc(G.T(G.Items.BY[id].name))).join(' &nbsp; ') : esc(G.T('Sin objeto.'))}</p>`);
    return el;
  }
  function closeBuild() { bTok++; $('scr-rkb').classList.add('hidden'); }
  const buildOpen = () => !$('scr-rkb').classList.contains('hidden');

  return { init, open, openBuild, closeBuild, buildOpen };
})();
