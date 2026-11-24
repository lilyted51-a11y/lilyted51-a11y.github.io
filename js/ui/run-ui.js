/* ============ run-ui.js — cartas de nivel, pausa y fin de run ============ */
G.RunUI = (() => {
  const $ = G.UI.$;
  let offers = null, offerCb = null, coopMode = false;

  /*
   * Al aparecer unas cartas (nivel, vínculo, objeto) no se pueden elegir
   * durante GUARD s y se ven apagadas: en plena pelea se pulsa 1-4 (o se toca
   * la pantalla) para cambiar de ataque y se elegía una carta sin querer.
   * Cambiar las cartas o el 2.º paso del vínculo no lo vuelven a poner: ahí ya
   * estás eligiendo a propósito.
   */
  const GUARD = 0.6;
  let guardUntil = 0, guardT = 0;
  function guard(box) {
    guardUntil = performance.now() + GUARD * 1000;
    box.classList.add('guard');
    clearTimeout(guardT);
    guardT = setTimeout(() => document.querySelectorAll('.cards.guard').forEach(b => b.classList.remove('guard')), GUARD * 1000);
  }
  const guarded = () => performance.now() < guardUntil;

  /*
   * Elegir con el dedo (26-10-2026). El navegador no manda «click» si hay otro
   * dedo en la pantalla: con un pulgar en el joystick y el otro en la carta, la
   * carta no se elegía, las cartas se quedaban abiertas y parecía que el
   * joystick se había atascado. Con el dedo se elige al levantarlo sobre la
   * misma carta (y el click que venga detrás no repite); ratón y teclado, como
   * siempre.
   *
   * Ese click de detrás se ignora en TODAS las cartas y botones, no sólo en el
   * que se tocó (27-10-2026): al cambiar las cartas o pasar al 2.º paso del
   * vínculo, las de debajo del dedo ya son otras y el click caía en la nueva,
   * que se elegía sola (una carta al azar, o el movimiento equivocado).
   */
  let fired = -1e9;           // último toque que eligió algo
  function onTap(el, fn) {
    let id = null, at = 0;
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { id = e.pointerId; at = performance.now(); } });
    el.addEventListener('pointercancel', e => { if (e.pointerId === id) id = null; });
    el.addEventListener('pointerup', e => {
      if (e.pointerId !== id) return;
      id = null;
      if (performance.now() - at > 1500) return;          // (dejar el dedo encima un rato no cuenta)
      fired = performance.now();
      fn();
    });
    el.onclick = () => { if (performance.now() - fired > 700) fn(); };
  }

  /** @param coop  en grupo: tras elegir, se queda esperando a los demás */
  function showLevelUp(level, list, cb, coop = false) {
    offerCb = cb; coopMode = coop;
    $('lvl-num').textContent = level;
    $('lvl-wait').textContent = '';
    $('lvl-wait').classList.toggle('hidden', !coop);
    $('cards').classList.remove('done');
    renderCards(list);
    if (!$('lvl-reroll').dataset.tap) { $('lvl-reroll').dataset.tap = 1; onTap($('lvl-reroll'), reroll); }
    G.UI.show('scr-levelup');
    guard($('cards'));
  }

  /**
   * Cambiar las cartas: 1 vez gratis por partida y 1 más por cada jefe
   * derrotado (en grupo cuentan los jefes del equipo; cada uno tiene los suyos).
   */
  function rerollsLeft() {
    const p = G.Game.player;
    // 1 gratis + los comprados en Mejoras (antes, 1 más por cada jefe).
    return p ? Math.max(0, 1 + (p.rerollBonus || 0) - (p.rerolls || 0)) : 0;
  }

  function reroll() {
    if (!offers || rm || rerollsLeft() <= 0) return;
    const p = G.Game.player;
    p.rerolls = (p.rerolls || 0) + 1;
    G.Audio.sfx('select');
    renderCards(G.LevelUp.offer(p));
  }

  function renderCards(list, step) {
    offers = list;
    if (!step) rm = null;
    const left = rerollsLeft();
    $('lvl-rr-n').textContent = left;
    // (Las cartas de evolución no se cambian: son las que son. Tampoco en los pasos del Quitamovimientos.)
    $('lvl-reroll').classList.toggle('hidden', left <= 0 || !!step || list.some(c => c.type === 'evolve'));
    $('lvl-step').classList.toggle('hidden', !step);
    $('lvl-step').textContent = step || '';
    const box = $('cards');
    box.innerHTML = '';
    // Muchas cartas (las evoluciones de Eevee): en dos columnas y más juntas, para que quepan sin scroll.
    box.classList.toggle('many', list.length > 5);
    list.forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'card';
      const tag = c.type === 'new'
        ? `<span class="tag-chip" style="background:${c.color}">Nuevo · ${c.tag}</span>${c.cat ? `<span class="tag-chip cat">${c.cat}</span>` : ''}`
        // (24-11-2026: carta de los ataques exclusivos: su etiqueta, la del tipo y la de físico o especial.)
        : c.type === 'sig'
        ? `<span class="tag-chip sig">${G.T('Exclusivo')}</span><span class="tag-chip" style="background:${c.color}">${c.tag}</span>${c.cat ? `<span class="tag-chip cat">${c.cat}</span>` : ''}`
        : c.rm ? `${c.tag ? `<span class="tag-chip" style="background:${c.color}">${c.tag}</span>` : ''}${c.cat ? `<span class="tag-chip cat">${c.cat}</span>` : ''}`
        : c.type === 'up' || c.type === 'evo'
          ? `<span class="tag-chip" style="background:${c.color}">${c.tag}</span>`
          : `<span class="tag-chip" style="background:${c.color === '#ffd23f' ? '#ffd23f' : '#9fb1c9'}">${c.tag}</span>`;
      if (c.type === 'evo' || (c.type === 'evolve' && c.color === '#ffd23f')) el.classList.add('evo');
      if (c.type === 'sig') el.classList.add('sig');
      el.innerHTML =
        `<div class="ico" style="background:${c.color}33">${G.Icons.html(c.icon, 32)}</div>
         <div class="txt"><div class="nm">${c.title} ${tag}</div><div class="ds">${c.desc}</div></div>
         <div class="key">${i + 1}</div>`;
      el.dataset.sfx = 'none';             // el juego pone su propio sonido al elegir
      // Evolución en plena partida: en vez del icono, el Pokémon al que evoluciona (o el que se queda).
      if (c.type === 'evolve' && c.dex) {
        const ico = el.querySelector('.ico');
        ico.innerHTML = '';
        ico.appendChild(G.UI.spriteCanvas(c.dex, 46, 46, { scale: 1, shiny: !!c.shiny }));
      }
      // Qué es cada carta (para en/bot.js, que no puede fiarse del texto traducido).
      el.dataset.key = c.key;
      if (c.buff) el.dataset.buff = c.stat || '1';
      if (c.mkind) el.dataset.mkind = c.mkind;
      if (c.evoFor) el.dataset.evo = '1';
      if (c.cat) el.dataset.cat = c.cat;   // físico / especial (el bot mira cuánto rinde con tu Pokémon)
      onTap(el, () => pick(i));
      box.appendChild(el);
    });
  }

  function pick(i) {
    if (!offers || !offers[i] || guarded()) return;
    if (((offers[i].type === 'remove' || (offers[i].type === 'sig' && offers[i].swap)) && !offers[i].done) || offers[i].rm) { removeStep(offers[i]); return; }
    const c = offers[i], cb = offerCb;
    offers = null; offerCb = null;
    $('lvl-reroll').classList.add('hidden');
    if (coopMode) {
      // Se queda la carta elegida a la vista mientras eligen los demás.
      $('cards').querySelectorAll('.card').forEach((el, j) => el.classList.toggle('picked', j === i));
      $('cards').classList.add('done');
    } else G.UI.hide('scr-levelup');
    cb(c);
  }

  /*
   * Quitamovimientos (23-11-2026, carta de levelup.js): dos pasos más en la misma pantalla,
   * como el vínculo. 1) qué movimiento quitas; 2) qué pones en su hueco (otro de los de tu
   * Pokémon: LevelUp.swapPool) o dejarlo libre. «Volver» deshace el paso. En grupo la partida
   * sigue parada como con cualquier carta: hasta que eliges, los demás te esperan.
   */
  /*
   * La carta de un ataque exclusivo con los cuatro huecos llenos (24-11-2026) usa el primer paso:
   * eliges qué movimiento cambias por él y ya está (rm.to es el exclusivo).
   */
  let rm = null;            // { card, base: cartas de nivel, from: movimiento que quitas, to: exclusivo }
  function removeStep(c) {
    const p = G.Game.player;
    if (!p) return;
    G.Audio.sfx('select');
    if (c.type === 'remove' || c.type === 'sig') rm = { card: c, base: offers, from: null, to: c.type === 'sig' ? c.id : null };
    else if (c.rm === 'back') {
      if (rm.from) rm.from = null;
      else { const base = rm.base; rm = null; renderCards(base); return; }
    } else if (c.rm === 'from') rm.from = c.move;
    if (c.rm === 'to' || c.rm === 'empty' || (c.rm === 'from' && rm.to)) {
      // Hecho: la carta Quitamovimientos con lo elegido (apply la lleva a Player.swapMove).
      const from = rm.from, id = c.rm === 'to' ? c.id : rm.to, card = rm.card;
      card.apply = pl => {
        if (!pl.swapMove(from, id)) return;
        G.FX.ring(pl.x, pl.y, 8, 110, '#ff9f6b', 0.7, 5);
        G.Spawner.say(id ? G.I18n.f('{x} → {x}', G.T(from.name, 'move'), G.T(G.Moves.BY_ID[id].name, 'move'))
                         : G.I18n.f('Has quitado {x}: queda un hueco libre', G.T(from.name, 'move')), 2.6, true);
      };
      // (Se queda a la vista lo elegido, como cualquier carta: en grupo, mientras eligen los demás.)
      card.done = true;
      card.desc = id ? G.I18n.f('{x} → {x}', G.T(from.name, 'move'), G.T(G.Moves.BY_ID[id].name, 'move'))
                     : G.I18n.f('Has quitado {x}: queda un hueco libre', G.T(from.name, 'move'));
      renderCards([card]);
      pick(0);
      return;
    }
    const back = { rm: 'back', key: 'rm:back', icon: 'cursor', color: '#8fa3c4', tag: '', title: 'Volver', desc: rm.from ? 'Elegir otro movimiento para quitar.' : 'Volver a las cartas.' };
    let list;
    const toName = rm.to ? G.T(G.Moves.BY_ID[rm.to].name, 'move') : '';
    if (!rm.from) {
      list = p.moves.map(m => ({ rm: 'from', key: 'rm:from:' + m.id, move: m, icon: 'move:' + m.id, color: G.U.TYPE_COLOR[m.type],
        tag: 'Nv.' + m.lvl, title: G.T(m.name, 'move'), desc: rm.to ? G.I18n.f('Cambiarlo por {x}.', toName) : 'Quitar este movimiento.' }));
    } else {
      list = G.LevelUp.swapPool(p, rm.from).map(id => {
        const d = G.Moves.BY_ID[id];
        return { rm: 'to', key: 'rm:to:' + id, id, icon: 'move:' + id, color: G.U.TYPE_COLOR[d.type], tag: G.U.TYPE_NAME[d.type],
                 cat: G.Stats.NAME[d.cat || (d.stat === 'patk' ? 'physical' : d.stat === 'satk' ? 'special' : '')] || '', title: G.T(d.name, 'move'), desc: d.desc };
      });
      if (p.moves.length >= 2) list.unshift({ rm: 'empty', key: 'rm:empty', icon: 'ban', color: '#8fa3c4', tag: 'Hueco libre', title: 'Dejar el hueco libre', desc: 'Podrás aprender otro movimiento en las cartas.' });
    }
    list.push(back);
    renderCards(list, rm.from ? G.I18n.f('¿Qué pones en el hueco de {x}?', G.T(rm.from.name, 'move'))
      : rm.to ? G.I18n.f('¿Qué movimiento cambias por {x}?', toName) : G.T('¿Qué movimiento quitas?'));
  }

  /** Grupo (#45): se acabó el tiempo: la primera carta (si estabas en el Quitamovimientos, la primera de las otras). */
  function pickFirst() {
    if (rm) { const base = rm.base; rm = null; renderCards(base); }
    const i = offers ? offers.findIndex(c => c.type !== 'remove' && !(c.type === 'sig' && c.swap)) : -1;
    pick(Math.max(0, i));
  }

  /** Cooperativo: quién falta por elegir. */
  function setWaiting(names, secs) {
    const me = G.Social.me ? G.Social.me.name : '';
    const others = names.filter(n => n !== me);
    const list = a => new Intl.ListFormat(G.I18n.locale, { style: 'long', type: 'conjunction' }).format(a);
    $('lvl-wait').setAttribute('translate', 'no');
    $('lvl-wait').textContent = !names.length ? ''
      : !others.length ? G.T('Elige tu carta')
      : names.includes(me) ? G.I18n.f('Faltan por elegir: {x}', list([...others, G.T('tú')]))
      : G.I18n.f('Esperando a {x}…', list(others));
    // Copia local: cuenta atrás (#45): pasado el tiempo, el anfitrión elige por quien falte.
    if (names.length && secs != null) { const s = document.createElement('span'); s.className = 'cd'; s.textContent = ' ⏱ ' + secs + ' s'; $('lvl-wait').appendChild(s); }
  }

  function closeLevelUp() {
    offers = null; offerCb = null; rm = null;
    $('cards').classList.remove('done');
    G.UI.hide('scr-levelup');
  }

  /**
   * Mensaje de apoyo (Ko-fi) al acabar: tras un récord o cada 10 partidas,
   * nunca en la primera y como mucho una vez al día. Se cierra con la X.
   */
  function askSupport(r) {
    if (!G.Funding || !G.Funding.url) return false;
    const runs = (G.DB.save && G.DB.save.stats && G.DB.save.stats.runs) || 0;
    if (runs < 2 || !(r.record || runs % 10 === 0)) return false;
    const today = new Date().toISOString().slice(0, 10);
    try { if (localStorage.getItem('ps.ask') === today) return false; localStorage.setItem('ps.ask', today); } catch (e) { return false; }
    return true;
  }

  /** Maestría que ha ganado tu Pokémon (systems/mastery.js) y los premios nuevos. */
  function masteryLine(m) {
    const loc = G.I18n.locale, mon = G.DEX_BY[m.dex];
    return `<div style="grid-column:1/-1"><span>${G.I18n.f('Maestría de {x}', mon.name)}</span>
      <b class="gold">${G.Icons.html('mastery', 18)} +${m.pts.toLocaleString(loc)}</b>
      <div style="font-size:12px;color:var(--muted)">${G.I18n.f('Total: {x}', m.total.toLocaleString(loc))}</div>
      ${m.got.map(t => `<div class="gold">${G.I18n.f('¡Nuevo premio de maestría: {x}!', G.T(t.name))}</div>`).join('')}</div>`;
  }

  function showOver(r, onBack) {
    $('over-title').textContent = r.dead ? 'Has caído…' : 'Run terminada';
    $('over-stats').innerHTML = `
      <div><span>Tiempo</span><b>${G.U.mmss(r.time)}</b></div>
      <div><span>Nivel</span><b>${r.level}</b></div>
      <div><span>Derrotados</span><b>${r.kills}</b></div>
      <div><span>Jefes</span><b>${r.bosses}</b></div>
      ${r.challenge ? `<div style="grid-column:1/-1" class="over-ch"><span>Desafío semanal</span><strong class="ch-over">${G.U.esc(r.challenge.label)}</strong>
        <div style="font-size:12px;color:var(--muted)">${G.U.esc(r.challenge.desc)}</div>
        <div style="font-size:12px">${G.U.esc(r.challenge.tk ? G.T('Aguantaste 3 minutos: ticket ×10 conseguido.') : G.T('No llegaste a los 3 minutos: sin ticket ×10.'))}</div></div>` : ''}
      ${r.judge ? `<div style="grid-column:1/-1"><span>${r.judge.gengar ? 'Ante el gran Gengar' : 'Ante Arceus'}</span><b class="gold">${G.U.mmss(r.judge.time)}${r.judge.bosses ? ` · ${r.judge.bosses} ${r.judge.bosses === 1 ? 'legendario' : 'legendarios'}` : ''}</b></div>
        <div style="grid-column:1/-1"><span>${r.judge.gengar ? 'Daño a Gengar' : 'Daño a Arceus'}</span><b class="gold">${(r.judge.dmg || 0).toLocaleString(G.I18n.locale)}</b></div>` : ''}
      <div style="grid-column:1/-1"><span>Pokémonedas ganadas</span>
        <b class="gold"><span class="coin"></span> +${r.coins}</b>
        <div style="font-size:12px;color:var(--muted)">${r.breakdown}</div></div>
      ${r.mastery ? masteryLine(r.mastery) : ''}
      ${r.t1 || r.t10 ? `<div style="grid-column:1/-1"><span>Tickets del gacha</span><b>
        ${r.t1 ? G.Icons.html('ticket', 22) + ' +' + r.t1 + ' ' : ''}${r.t10 ? G.Icons.html('ticket10', 22) + ' +' + r.t10 + ' ×10' : ''}</b></div>` : ''}
      ${r.candy ? `<div style="grid-column:1/-1"><span>Caramelos de Halloween</span><b>${G.Icons.html('candy', 22)} +${r.candy}</b></div>` : ''}
      ${G.EggsUI ? G.EggsUI.overHtml() : ''}
      <div style="grid-column:1/-1"><span>Movimientos</span><b style="font-size:15px">
        ${r.moves.map(m => `${G.Icons.html('move:' + m.id, 16)} ${G.T(m.name, 'move')} Nv.${m.lvl}`).join(' · ') || '—'}</b></div>
      ${r.team && r.team.length ? `<div style="grid-column:1/-1" class="over-sum"><span>Resumen de la partida</span>
        ${r.team.length > 1 ? '<div class="chips over-tabs" id="over-tabs"></div>' : ''}<div id="over-sum"></div></div>` : ''}
      ${r.caught && r.caught.length ? `<div style="grid-column:1/-1" class="caught"><span>${G.Icons.html('shiny', 12)} Shinies conseguidos</span>
        <div class="caught-row" id="over-caught"></div></div>` : ''}
      ${r.record ? '<div style="grid-column:1/-1;text-align:center" class="gold">¡Nuevo récord de tiempo!</div>' : ''}
      ${askSupport(r) ? `<div class="support-ask" id="over-ask" style="grid-column:1/-1">
        <button class="x" type="button" aria-label="Cerrar">×</button>
        <p>¿Te está gustando PokéSurvivor? Lo hago yo solo y los servidores cuestan dinero. Si quieres, puedes ayudarme a mantenerlo en línea.</p>
        <a class="btn small gold" href="${G.Funding.url}" target="_blank" rel="noopener">${G.Icons.html('heart', 14)} Apoyar en Ko-fi</a>
      </div>` : ''}`;
    const ask = $('over-ask');
    if (ask) ask.querySelector('.x').onclick = () => ask.remove();
    if (r.team && r.team.length) {
      const show = i => {
        $('over-sum').innerHTML = sumHtml(r.team[i]);
        const tabs = $('over-tabs');
        if (tabs) tabs.querySelectorAll('button').forEach((b, j) => b.classList.toggle('on', j === i));
      };
      const tabs = $('over-tabs');
      if (tabs) r.team.forEach((p, i) => {
        const b = document.createElement('button');
        b.className = 'chip';
        // (textContent: el nombre de otro jugador nunca es HTML. Con translate="no" el parche del chino no
        //  toca la pestaña, así que «Tú» va ya traducido.)
        const me = G.T('Tú');
        b.textContent = p.me ? (window.PSZH_T ? window.PSZH_T(me) : me) : p.name;
        b.setAttribute('translate', 'no');
        b.onclick = () => show(i);
        tabs.appendChild(b);
      });
      show(0);
    }
    // Con compañeros, la caja es algo más ancha (las tablas de daño caben mejor).
    $('scr-over').querySelector('.box').style.width = r.team && r.team.length > 1 ? 'min(560px,100%)' : 'min(480px,100%)';
    $('btn-again').onclick = onBack;
    // Volver a jugar al momento, con el mismo Pokémon y la misma dificultad (en sala, la sala se encarga).
    $('btn-replay').classList.toggle('hidden', !!G.Social.room);
    $('btn-replay').onclick = () => { onBack(); if (!G.Social.room && G.UI.isOpen('scr-menu')) G.Flow.play(); };
    if (r.caught && r.caught.length) {
      const row = $('over-caught');
      for (const c of r.caught) {
        const w = document.createElement('div');
        w.appendChild(G.UI.spriteCanvas(c.dex, 90, 72, { shiny: true, lively: true, scale: 2 }));
        w.insertAdjacentHTML('beforeend', `<small>${G.DEX_BY[c.dex].name}${c.isNew ? ' · ¡nuevo!' : ''}</small>`);
        row.appendChild(w);
      }
    }
    G.UI.show('scr-over');
  }

  /**
   * Has encontrado un objeto con los huecos llenos: ¿te quedas con lo que llevas o cambias uno?
   * @param cur   los que llevas (uno, o varios con las Mejoras Segundo / Tercer objeto)
   * @param cb    cb(null) = te quedas como estás · cb(next, viejo) = dejas `viejo` y te pones el nuevo
   */
  function showItemChoice(cur, next, cb) {
    cur = Array.isArray(cur) ? cur : [cur];
    const box = $('item-cards'), nx = G.Items.BY[next], name = id => G.Items.BY[id].name;
    box.innerHTML = '';
    $('item-sub').textContent = cur.length > 1 ? G.I18n.f('Llevas {x}: no te caben más', cur.length) : G.T('Sólo puedes llevar uno');
    // (data-item: lo lee en/bot.js para puntuar cada carta.)
    const opts = cur.length === 1
      ? [{ id: cur[0], title: 'Quedarme con ' + name(cur[0]), desc: G.Items.BY[cur[0]].desc, pick: () => cb(null) },
         { id: next, title: 'Cambiar a ' + nx.name, desc: nx.desc, gold: true, pick: () => cb(next, cur[0]) }]
      : [{ id: cur[0], title: 'Quedarme con los que llevo', desc: cur.map(name).join(' · '), pick: () => cb(null) },
         ...cur.map(c => ({ id: next, old: c, title: G.I18n.f('Cambiar {x} por {x}', name(c), nx.name), desc: nx.desc, gold: true, pick: () => cb(next, c) }))];
    opts.forEach((o, i) => {
      const el = document.createElement('div');
      el.className = 'card' + (o.gold ? ' evo' : '');
      el.dataset.item = o.id;
      el.innerHTML = `<div class="ico">${o.old ? G.Icons.html(o.old, 22) + G.Icons.html(o.id, 30) : G.Icons.html(o.id, 36)}</div>
        <div class="txt"><div class="nm">${o.title}</div><div class="ds">${o.desc}</div></div>
        <div class="key">${i + 1}</div>`;
      onTap(el, () => { if (guarded() || !G.UI.isOpen('scr-item')) return; G.UI.hide('scr-item'); o.pick(); });
      box.appendChild(el);
    });
    G.UI.show('scr-item');
    guard(box);
  }

  // ---------------- elegir (el poder de Eternatus, systems/powers.js) ----------------

  let choiceList = null, choiceCb = null;
  /** Unas cartas para elegir una (teclas 1-9): cb(carta). Puede volver a llamarse desde cb (otra elección). */
  function showChoice(title, sub, list, cb) {
    choiceList = list; choiceCb = cb;
    $('power-title').textContent = title;
    $('power-sub').textContent = sub || '';
    const box = $('power-cards');
    box.innerHTML = '';
    box.classList.toggle('many', list.length > 5);
    list.forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'card' + (c.color === '#ffd23f' ? ' evo' : '');
      el.innerHTML = `<div class="ico" style="background:${c.color}33">${G.Icons.html(c.icon, 32)}</div>
        <div class="txt"><div class="nm">${c.title} <span class="tag-chip" style="background:${c.color}">${c.tag}</span></div><div class="ds">${c.desc || ''}</div></div>
        <div class="key">${i + 1}</div>`;
      if (c.dex && G.SPRITE_META[c.dex]) { const ico = el.querySelector('.ico'); ico.innerHTML = ''; ico.appendChild(G.UI.spriteCanvas(c.dex, 46, 46, { scale: 1 })); }
      el.dataset.sfx = 'none';
      el.dataset.power = c.key;          // (lo lee en/bot.js)
      onTap(el, () => pickChoice(i));
      box.appendChild(el);
    });
    G.UI.show('scr-power');
    guard(box);
  }
  /** @param force  sin esperar a la protección de los primeros toques (el anfitrión elige por quien tarda) */
  function pickChoice(i, force) {
    if (!choiceList || !choiceList[i] || (!force && guarded()) || !G.UI.isOpen('scr-power')) return;
    const c = choiceList[i], cb = choiceCb;
    choiceList = null; choiceCb = null;
    G.UI.hide('scr-power');
    G.Audio.sfx('confirm');
    cb(c);
  }

  // ---------------- vínculo: qué movimientos se fusionan ----------------

  let bond = null;          // { opt, cb, first, list }

  /**
   * @param opt  pl.bondOptions(): 'add' (uno suelto al grupo) o 'pair' (dos sueltos, en dos pasos)
   * @param cb   recibe la lista de movimientos que se juntan
   */
  function showBond(opt, cb) {
    bond = { opt, cb, first: null, list: [] };
    if (!$('bond-back').dataset.tap) { $('bond-back').dataset.tap = 1; onTap($('bond-back'), bondBack); }
    renderBond();
    G.UI.show('scr-bond');
    guard($('bond-cards'));
  }

  function renderBond() {
    const { opt, first } = bond;
    const names = ms => ms.map(m => G.T(m.name, 'move')).join(' + ');
    const step2 = opt.mode === 'pair' && first;
    $('bond-sub').textContent = opt.mode === 'add' ? 'Elige qué movimiento se une a ' + names(opt.group)
      : step2 ? '¿Con cuál unes ' + G.T(first.name, 'move') + '?' : 'Elige el primer movimiento que vas a unir';
    $('bond-back').classList.toggle('hidden', !step2);
    bond.list = step2 ? opt.loose.filter(m => m !== first) : opt.loose;
    const box = $('bond-cards');
    box.innerHTML = '';
    bond.list.forEach((m, i) => {
      const col = G.U.TYPE_COLOR[m.type];
      const desc = opt.mode === 'add' ? 'Se lanzará a la vez que ' + names(opt.group) + '.'
        : step2 ? 'Se lanzará a la vez que ' + G.T(first.name, 'move') + '. Queda un hueco libre.'
        : m.desc || '';
      const el = document.createElement('div');
      el.className = 'card' + (opt.mode === 'add' || step2 ? ' bond' : '');
      el.innerHTML =
        `<div class="ico" style="background:${col}33">${G.Icons.html('move:' + m.id, 32)}</div>
         <div class="txt"><div class="nm">${G.T(m.name, 'move')} <span class="tag-chip" style="background:${col}">Nv.${m.lvl}</span></div><div class="ds">${desc}</div></div>
         <div class="key">${i + 1}</div>`;
      el.dataset.sfx = 'none';
      el.dataset.move = m.id;   // copia local: lo lee en/bot.js para elegir qué se fusiona
      onTap(el, () => pickBond(i));
      box.appendChild(el);
    });
  }

  function pickBond(i) {
    if (!bond || !bond.list[i] || guarded()) return;
    const m = bond.list[i];
    if (bond.opt.mode === 'pair' && !bond.first) {
      bond.first = m;
      G.Audio.sfx('select');
      renderBond();
      return;
    }
    const picked = bond.opt.mode === 'add' ? [m] : [bond.first, m];
    const cb = bond.cb;
    bond = null;
    G.UI.hide('scr-bond');
    cb(picked);
  }

  function bondBack() {
    if (!bond) return;
    bond.first = null;
    renderBond();
  }

  /*
   * Resumen de un jugador al acabar (25-10-2026): su Pokémon, sus ataques con el
   * daño hecho y el daño por segundo, el total y su objeto. sum viene de
   * Game.mySum() o, de un compañero, limpio por coop.js (cleanSum).
   */
  function sumHtml(p) {
    const s = p.sum, n = v => Math.round(v).toLocaleString(G.I18n.locale);
    let total = 0;
    const rows = s.mv.map(([id, lvl, dealt, since, evo]) => {
      const m = G.Moves.instance(id, lvl);
      if (evo) G.Moves.evolve(m);
      const secs = Math.max(5, s.t - since);
      if (m.cat) total += dealt;
      return `<tr><td>${G.Icons.html('move:' + id, 18)} ${G.T(m.name, 'move')} <small>Nv.${lvl}</small></td>
        <td class="num">${m.cat ? n(dealt) : '—'}</td><td class="num">${m.cat ? n(dealt / secs) + '/s' : '—'}</td></tr>`;
    }).join('');
    const mon = G.DEX_BY[s.dex];
    const its = (Array.isArray(s.its) && s.its.length ? s.its : s.it ? [s.it] : []).filter(id => G.Items.BY[id]);
    // (La frase entera en cada idioma: traducida por trozos sale rara.)
    return `<p class="sub" style="margin:6px 0" translate="no">${s.sh ? G.Icons.html('shiny', 12) + ' ' : ''}${G.I18n.f('{x} · Nv. {x} · {x} de daño en total', G.T(mon.name), s.lv, n(total))}</p>
      <table class="sum-moves"><tr><th></th><th class="num">Daño</th><th class="num">Por segundo</th></tr>${rows}</table>
      <p class="sub" style="margin:6px 0 0">${its.length ? its.map(id => G.Icons.html(id, 16) + ' ' + G.Items.BY[id].name).join(' &nbsp; ') : 'Sin objeto.'}</p>`;
  }

  /*
   * Resumen de la partida en la pausa: tus ataques (categoría, daño hecho y
   * daño por segundo), tus estadísticas con todo lo subido y el objeto y las
   * cartas de mejora que llevas.
   */
  function pauseSummary() {
    const pl = G.Game.player;
    if (!pl) return '';
    const t = G.Game.st.time, n = v => Math.round(v).toLocaleString('es');
    const k2 = v => '×' + v.toFixed(2).replace('.', ',');
    const pct = v => Math.round(v * 100) + ' %';
    const moves = pl.moves.map(m => {
      const secs = Math.max(5, t - (m.since || 0)), col = G.U.TYPE_COLOR[m.type];
      const cat = m.cat ? `<span class="tag-chip" style="background:${col}">${G.Stats.NAME[m.cat]}</span>` : '<span class="sub">Mejora</span>';
      return `<tr><td>${G.Icons.html('move:' + m.id, 18)} ${G.T(m.name, 'move')} <small>Nv.${m.lvl}</small></td><td>${cat}</td>
        <td class="num">${m.cat ? n(m.dealt || 0) : '—'}</td><td class="num">${m.cat ? n((m.dealt || 0) / secs) + '/s' : '—'}</td></tr>`;
    }).join('');
    const mon = pl.mon, fis = 1 - G.Stats.taken(mon, 'physical'), esp = 1 - G.Stats.taken(mon, 'special');
    const guard = v => (v >= 0 ? '−' : '+') + Math.round(Math.abs(v) * 100) + ' %';
    const st = [
      ['Vida', n(pl.hp) + ' / ' + n(pl.maxHp)],
      ['Ataque', k2(pl.atkFor({ cat: 'physical' }))],
      ['At. Esp.', k2(pl.atkFor({ cat: 'special' }))],
      ['Defensa', n(mon.df) + ' <small>' + guard(fis) + ' físico</small>'],
      ['Def. Esp.', n(mon.sd) + ' <small>' + guard(esp) + ' especial</small>'],
      ['Velocidad', n(pl.spd)],
      ['Crítico', pct(pl.critChance || 0)],
      ['Reducción de daño', pct(pl.reduction)],
      ['Recarga', pl.cdMul < 0.995 ? '−' + pct(1 - pl.cdMul) : '0 %'],
      ['Regeneración', pl.regen.toFixed(1).replace('.', ',') + ' /s']
    ].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
    const it = pl.item && G.Items.BY[pl.item];
    const cards = Object.entries(pl.statsTaken || {}).map(([id, c]) => {
      const s = G.LevelUp.STATS.find(x => x.id === id);
      return s ? `<span class="chip">${G.Icons.html(s.icon, 12)} ${s.title} ×${c}</span>` : '';
    }).join('');
    return `<h3>Tus ataques</h3>
      <table class="sum-moves"><tr><th></th><th></th><th class="num">Daño</th><th class="num">Por segundo</th></tr>${moves}</table>
      <h3>Tus estadísticas</h3><div class="sum-stats">${st}</div>
      <h3>Objeto y cartas</h3>
      ${pl.items.length ? pl.items.map(id => '<p class="sub">' + G.Icons.html(id, 18) + ' <b>' + G.Items.BY[id].name + '</b>: ' + G.Items.BY[id].desc + '</p>').join('') : '<p class="sub">Sin objeto.</p>'}
      <div class="chips">${cards || '<span class="sub">Aún no has cogido cartas de mejora.</span>'}</div>
      <h3>Tus esferas</h3>${orbsSummary(pl)}`;
  }

  /** Las esferas que llevas (con su tecla y lo que hacen) y las mejoras que tienes puestas. */
  function orbsSummary(pl) {
    const key = i => G.Touch.active ? '' : `<kbd>${i + 5}</kbd> `;
    const rows = (pl.orbs || []).map((s, i) => {
      if (!s) return '';
      const o = G.Orbs.BY[s.id];
      return `<p class="sub orb-row">${key(i)}${G.Icons.html('orb:' + s.id, 18)} <b>${G.T(o.name)}</b>${s.n > 1 ? ' ×' + s.n : ''}: ${G.T(o.desc)}</p>`;
    }).join('');
    const ob = pl.orbBuff || {};
    const on = Object.keys(ob).filter(id => ob[id] > 0)
      .map(id => `<span class="chip">${G.Icons.html('orb:' + id, 12)} ${G.T(G.Orbs.BY[id].name)} · ${Math.ceil(ob[id])} s</span>`).join('');
    return (rows || '<p class="sub">Aún no llevas esferas. Salen de los cofres, de los jefes y, a veces, al derrotar a un Pokémon.</p>')
      + (on ? `<div class="chips">${on}</div>` : '');
  }

  function showPause(coop = false, host = false) {
    $('pause-sum').innerHTML = pauseSummary();
    G.UI.soundControls($('pause-sound'));
    $('pause-coop').classList.toggle('hidden', !coop);
    $('pause-coop').textContent = host ? 'Has pausado la partida: todos esperan a que continúes.' : 'Partida en grupo: el juego sigue mientras estás aquí.';
    $('btn-quit').textContent = coop ? 'Salir de la partida' : 'Abandonar run';
    G.UI.show('scr-pause');
  }

  function wirePause(onResume, onQuit) {
    $('btn-resume').onclick = onResume;
    $('btn-quit').onclick = onQuit;
  }

  return { showLevelUp, reroll, showItemChoice, showChoice, pickChoice, showBond, pickBond, bondBack, pick, pickFirst, setWaiting, closeLevelUp, showOver, wirePause, showPause, masteryLine };
})();
