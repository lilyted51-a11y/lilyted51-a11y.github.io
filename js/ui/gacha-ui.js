/* ============ gacha-ui.js — banners por generación y animación de tirada ============
 * La lógica (probabilidades, pity, shiny, repetidos) está en systems/gacha.js.
 */
G.GachaUI = (() => {
  const $ = G.UI.$;
  let busy = false, skip = false;
  let gen = 1;

  function init() {
    $('pull-10').onclick = () => pull(10, 't1');
    $('pull-10b').onclick = () => pull(10, 't10');
    $('pull-100').onclick = () => pull(100, 'auto');     // copia local
    $('pull-1000').onclick = () => pull(1000, 'auto');
    $('pull-close').onclick = close;
    // Saltar: se acaba la tragaperras y salen todas las cartas de golpe (también con Esc).
    $('pull-skip').onclick = skipNow;
    addEventListener('keydown', e => { if (e.key === 'Escape' && busy && !$('pull-fx').classList.contains('hidden')) skipNow(); });

    const tabs = $('gacha-gens');
    // Halloween: la pestaña del banner Noche Espectral va la primera (sólo se ve esos días).
    [G.Gacha.SPOOKY, ...G.Gacha.BANNERS].forEach(b => {
      const t = document.createElement('button');
      t.className = 'gen-tab' + (b.event ? ' spooky' : '');
      t.dataset.gen = b.gen;
      t.innerHTML = b.event ? `<b>${G.T(b.name)}</b><small>${G.Icons.html('pumpkin', 10)} ${G.T('Halloween')}</small>`
        : `<b>${b.name}</b><small>Gen ${b.gen}</small>`;
      t.onclick = () => { gen = b.gen; refresh(); };
      tabs.appendChild(t);
    });
  }

  function open() {
    G.UI.show('scr-gacha', true);
    // Esos días se abre en el de Halloween.
    if (G.Gacha.isOpen(G.Gacha.SPOOKY.gen) && !open.seen) { open.seen = 1; gen = G.Gacha.SPOOKY.gen; }
    refresh();
  }

  function refresh() {
    const s = G.DB.save;
    const sk = $('gacha-skip');
    if (sk) { sk.checked = !!G.Settings.get('gachaSkip'); sk.onchange = () => G.Settings.set('gachaSkip', sk.checked); }
    // Si se acaba Halloween con su banner abierto, se vuelve a Kanto.
    if (!G.Gacha.isOpen(gen)) gen = 1;
    const banner = G.Gacha.banner(gen), spooky = !!banner.event;
    document.querySelectorAll('#gacha-gens .gen-tab').forEach(t => {
      t.classList.toggle('on', +t.dataset.gen === gen);
      if (t.classList.contains('spooky')) t.classList.toggle('hidden', !G.Gacha.isOpen(+t.dataset.gen));
    });

    const all = G.DEX.filter(p => (spooky ? p.types.includes('ghost') : p.gen === gen));
    const owned = all.filter(p => s.owned[p.dex]).length;
    const shinies = all.filter(p => s.shiny && s.shiny[p.dex]).length;
    const [c1, c2, c3] = banner.color;
    $('banner').style.background =
      `radial-gradient(circle at 80% 30%, rgba(255,210,63,.3), transparent 45%),
       radial-gradient(circle at 15% 80%, rgba(196,123,255,.3), transparent 50%),
       linear-gradient(135deg, ${c1}, ${c2} 55%, ${c3})`;
    $('banner-title').textContent = spooky ? G.T(banner.name) : banner.name + ' Misterioso';
    $('banner-desc').textContent = spooky ? G.I18n.f('Los {x} Pokémon de tipo Fantasma de todas las regiones, con el doble de shiny. Sólo hasta el 2 de noviembre.', all.length)
      : `Los ${all.length} Pokémon de la generación ${gen}. ¡Los legendarios esperan!`;
    $('gacha-owned').innerHTML = `Tienes ${owned} de ${all.length}` +
      (shinies ? ` · ${G.Icons.html('shiny', 12)} ${shinies} shiny` : '') +
      (G.Gacha.hasIris(s, gen) ? ` · ${G.Icons.html('iris', 12)} ${G.T('Amuleto Iris')}` : '');

    const feat = $('gacha-feat');
    feat.innerHTML = '';
    for (const dex of G.Gacha.featured(gen)) {
      feat.appendChild(G.UI.spriteCanvas(dex, 170, 190, { lively: true, scale: 2, dir: 1 }));
    }

    const pity = (s.pity && s.pity[gen]) || 0;
    $('gacha-pity').textContent = `Tiradas sin legendaria en ${G.T(banner.name)}: ${pity} / ${G.Gacha.PITY_5}`;

    $('gacha-rates').innerHTML = '<h3>Probabilidades</h3>' + G.Gacha.RATES.slice().reverse().map(([r, w]) => `
      <div><span style="color:${G.Gacha.RARITY_COLOR[r]}">${G.UI.stars(r, 10)} ${G.Gacha.RARITY_NAME[r]}</span>
      <span>${w}% · ${G.Gacha.pool(r, gen).length}</span></div>`).join('') +
      `<div><span>${G.Icons.html('shiny', 12)} Shiny</span><span>${spooky ? G.Icons.html('pumpkin', 12) + ' 2%' : G.Gacha.hasIris(s, gen) ? G.Icons.html('iris', 12) + ' 2%' : '1%'}</span></div>
       <p class="note">· La tirada ×10 garantiza al menos una Épica.<br>
       · A las ${G.Gacha.PITY_5} tiradas sin Legendaria en un banner, la siguiente lo es.<br>
       · Los repetidos dan Pokémonedas. Los shiny no se repiten.<br>
       · Los tickets se consiguen jugando: algunos Pokémon los sueltan al caer, y
         los jefes y los legendarios de las grietas, a veces, tickets ×10.</p>`;

    const t = s.tickets;
    $('cost-10').innerHTML = `${G.Icons.html('ticket', 18)} 10`;
    $('cost-10b').innerHTML = `${G.Icons.html('ticket10', 18)} 1`;
    $('cost-100').innerHTML = `${G.Icons.html('ticket', 18)} 100`;
    $('gacha-tickets').innerHTML = `Tienes ${G.Icons.html('ticket', 18)} <b>${t.t1}</b> tickets y ${G.Icons.html('ticket10', 18)} <b>${t.t10}</b> tickets ×10`;
    $('pull-10').disabled = !G.Gacha.costOf(s, 10, 't1');
    $('pull-10b').disabled = !G.Gacha.costOf(s, 10, 't10');
    // Copia local: ×100 y ×1000 (el coste que se muestra es con lo que se pagaría ahora)
    for (const n of [100, 1000]) {
      const c = G.Gacha.costOf(s, n, 'auto');
      $('cost-' + n).innerHTML = c && c.t10 ? `${G.Icons.html('ticket10', 18)} ${c.t10}` : `${G.Icons.html('ticket', 18)} ${n}`;
      $('pull-' + n).disabled = !c;
    }
    G.UI.refreshCoins();
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function pull(n, use = 't1') {
    if (busy) return;
    if (!G.Gacha.isOpen(gen)) { G.UI.toast(G.T('El banner de Halloween ya ha terminado.')); refresh(); return; }
    const res = G.Gacha.pull(G.DB.save, n, gen, use);
    if (!res) { G.Audio.sfx('error'); G.UI.toast('No tienes tickets suficientes: consíguelos jugando'); return; }
    G.Progress.checkAch();
    G.DB.commit(true);
    busy = true; skip = false;

    const best = Math.max(...res.map(r => r.rarity));
    const fx = $('pull-fx'), slot = $('slot'), out = $('pull-results');
    out.innerHTML = '';
    out.classList.toggle('many', n === 100);
    $('pull-close').classList.add('hidden');
    $('pull-skip').classList.remove('hidden');
    slot.style.display = '';
    fx.classList.remove('hidden');

    // La tragaperras (ui/slots.js) y luego las cartas. Con "saltar animación", directo a las cartas.
    // Copia local: en las tiradas en masa (×100, ×1000) no hay tragaperras y las cartas se agrupan.
    const mass = n >= 100;
    const direct = mass || !!G.Settings.get('gachaSkip');   // (skip, el de arriba, es el botón Saltar de upstream)
    if (direct) slot.style.display = 'none';
    else await G.Slots.play(slot, res);
    G.Audio.sfx('burst', { rarity: best });
    slot.style.display = 'none';

    let cards = res;
    if (mass) {
      // Resumen y cartas agrupadas (un mismo Pokémon, una carta con ×n), las mejores primero; como mucho 60.
      const groups = new Map();
      for (const r of res) {
        const k = r.dex + (r.shiny ? 's' : '');
        const g = groups.get(k);
        if (g) { g.n++; g.refund += r.refund; g.isNew = g.isNew || r.isNew; } else groups.set(k, Object.assign({}, r, { n: 1 }));
      }
      cards = [...groups.values()].sort((a, b) => (b.shiny - a.shiny) || (b.isNew - a.isNew) || (b.rarity - a.rarity) || (b.n - a.n));
      const news = res.filter(r => r.isNew && !r.shiny).length, shinies = res.filter(r => r.shiny).length,
            legends = res.filter(r => r.rarity === 5).length, coins = res.reduce((a, r) => a + r.refund, 0);
      out.insertAdjacentHTML('beforeend', `<p class="sub mass-sum" style="width:100%;margin:0 0 6px">${n} tiradas: <b>${news}</b> nuevos · ${G.Icons.html('shiny', 12)} <b>${shinies}</b> shiny · ${G.UI.stars(5, 12)} <b>${legends}</b> legendarias · <span class="coin"></span> +${coins}` +
        (cards.length > 60 ? ` · se muestran 60 de ${cards.length} distintos` : '') + `</p>`);
      cards = cards.slice(0, 60);
    }

    for (const r of cards) {
      const mon = G.DEX_BY[r.dex];
      const c = document.createElement('div');
      c.className = 'pcard r' + r.rarity + (r.shiny ? ' shiny' : '');
      c.style.setProperty('--rc', r.shiny ? '#9ae6ff' : G.Gacha.RARITY_COLOR[r.rarity]);
      c.innerHTML = `<div class="stars">${G.UI.stars(r.rarity, 24)}</div>`;
      c.appendChild(G.UI.spriteCanvas(r.dex, 132, 120, { lively: r.rarity >= 4 || r.shiny, scale: 2, shiny: r.shiny }));
      const tag = r.isNew
        ? `<span class="new">${r.shiny ? '¡SHINY NUEVO!' : '¡NUEVO!'}</span>` + (r.n > 1 ? ` · <span class="coin"></span> +${r.refund}` : '')
        : `Repetido · <span class="coin"></span> +${r.refund}`;
      // Nuevo: con qué naturaleza y habilidad te ha tocado (la oculta, en dorado).
      const ab = r.isNew ? G.Mons.abilityOf(r.dex) : null;
      const who = ab ? `<div class="pmon" translate="no">${G.Mons.name(G.Mons.natureOf(r.dex).n)} · <span class="${ab.slot === 2 ? 'gold' : ''}">${G.Mons.abilityName(ab.id)}</span></div>` : '';
      c.insertAdjacentHTML('beforeend', `<b>${r.shiny ? G.Icons.html('shiny', 12) + ' ' : ''}${mon.name}${r.n > 1 ? ' <small class="times">×' + r.n + '</small>' : ''}</b>${who}<div class="tag">${tag}</div>`);
      out.appendChild(c);
      G.Audio.sfx('reveal', { rarity: r.rarity });
      if (!direct && !skip) await wait(n === 10 ? 150 : 0);
      else if (mass && cards.indexOf(r) % 12 === 11) await wait(0);   // deja respirar al navegador
    }
    $('pull-skip').classList.add('hidden');
    // La última que faltaba de la generación: su Amuleto Iris.
    if (res.iris) {
      const name = G.T(G.Gacha.BANNERS[res.iris - 1].name);
      out.insertAdjacentHTML('beforeend', `<div class="iris-get">${G.Icons.html('iris', 36)}
        <div><b>${G.I18n.f('¡Amuleto Iris de {x}!', name)}</b>
        <div class="sub">${G.I18n.f('Has completado la Pokédex de {x}: en su banner, los shiny salen el doble (2 %). Lo tienes en la Mochila.', name)}</div></div></div>`);
      G.Audio.sfx('shinyGet');
    }
    $('pull-close').classList.remove('hidden');
    busy = false;
  }

  function skipNow() {
    if (skip) return;
    skip = true;
    G.Slots.skip();
    $('pull-skip').classList.add('hidden');
  }

  function close() {
    $('pull-fx').classList.add('hidden');
    refresh();
  }

  return { init, open, get open_() { return !$('pull-fx').classList.contains('hidden'); } };
})();
