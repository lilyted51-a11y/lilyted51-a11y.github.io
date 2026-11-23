/* ============ consum.js — objetos de un solo uso: Caramelo Exp., bayas y Mochis ============
 * (23-11-2026; como en el juego oficial, hecho aquí a partir de su guía de objetos.)
 * Salen como premio (cofres con candado, jefes, legendarios de la grieta, algún cofre pequeño y el
 * evento de Munchlax) y no ocupan hueco de objeto:
 *
 *   Caramelo Exp.   al cogerlo, subes un nivel
 *   Mochi Vida / Ataque / Velocidad / Defensa   al cogerlo, +5 % de eso hasta acabar la partida
 *   Baya Zidra      se guarda; al bajar del 25 % de vida, cura un 30 %
 *   Baya Atania     se guarda; al bajar del 25 % de vida, +30 % de daño 10 s
 *   Baya Meloc      se guarda; si algo te frena (trampa, nieve, agua), te limpia y 5 s sin frenazos
 *
 * Las bayas: una de cada a la vez (otra igual se cambia por monedas). Se ven bajo la vida (ui/hud.js).
 * En el suelo son la recogida 'use' (value = id; entities/pickup.js). En grupo, cada uno lo suyo: el
 * anfitrión manda el objeto a quien lo coge (coop.js, ['use', id]).
 */
G.Consum = (() => {
  const DEF = {
    rarecandy: { name: 'Caramelo Exp.', desc: 'Subes un nivel al momento.', col: '#7fb8ff', w: 3 },
    sitrus:    { name: 'Baya Zidra', desc: 'Al bajar del 25 % de vida, te cura un 30 %.', col: '#ffd23f', berry: true, w: 2 },
    liechi:    { name: 'Baya Atania', desc: 'Al bajar del 25 % de vida, +30 % de daño durante 10 s.', col: '#ff5f6d', berry: true, w: 2 },
    pecha:     { name: 'Baya Meloc', desc: 'Si algo te frena, te limpia y te hace inmune a frenazos 5 s.', col: '#ff9ed8', berry: true, w: 2 },
    mochiHp:   { name: 'Mochi Vida', desc: '+5 % de vida máxima hasta acabar la partida.', col: '#5fe08a', w: 1 },
    mochiAtk:  { name: 'Mochi Ataque', desc: '+5 % de daño hasta acabar la partida.', col: '#ff7b3d', w: 1 },
    mochiSpd:  { name: 'Mochi Velocidad', desc: '+5 % de velocidad hasta acabar la partida.', col: '#4fb4ff', w: 1 },
    mochiDef:  { name: 'Mochi Defensa', desc: 'Recibes un 5 % menos de daño hasta acabar la partida.', col: '#c9b48a', w: 1 }
  };
  const IDS = Object.keys(DEF);
  const BERRIES = IDS.filter(id => DEF[id].berry);

  // ---------------- iconos (12×12, como los de ui/icons.js) ----------------
  const BERRY_ROWS = ['............', '.....kkk....', '....kgggk...', '..kkkgdkkk..', '.krrrkkrrrk.', 'krwwrrrrrrsk',
    'krwrrrrrrrsk', 'krrrrrrrrrsk', 'krrrrrrrrssk', '.krrrrrrssk.', '..kkssssskk.', '....kkkkk...'];
  const MOCHI_ROWS = ['............', '............', '....kkkk....', '..kkwwwwkk..', '.kwwwwwwwwk.', '.kwcwwwwwwk.',
    'kwwwwwwwwwwk', 'kcccccccccck', 'kwwwwwwwwwsk', '.kwwwwwwwssk', '..kkssssskk.', '....kkkk....'];
  const CANDY_ROWS = ['............', '.k........k.', 'kbk......kbk', 'kbbk.kk.kbbk', '.kbkkwwkkbk.', '..kkwwbbkk..',
    '..kkwbbbkk..', '.kbkkbbkkbk.', 'kbbk.kk.kbbk', 'kbk......kbk', '.k........k.', '............'];
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k))); return '#' + [16, 8, 0].map(s => c(s).toString(16).padStart(2, '0')).join(''); };
  function icons() {
    const UI = G.Icons.UI;
    for (const id of IDS) {
      const d = DEF[id], key = 'use:' + id;
      if (UI[key]) continue;
      if (d.berry) UI[key] = { pal: { r: d.col, s: shade(d.col, 0.65), w: '#ffffff', g: '#5fe08a', d: '#2f9a52' }, rows: BERRY_ROWS };
      else if (id === 'rarecandy') UI[key] = { pal: { b: d.col, w: '#ffffff' }, rows: CANDY_ROWS };
      else UI[key] = { pal: { w: '#fff6ee', c: d.col, s: '#d8c8c0' }, rows: MOCHI_ROWS };
    }
  }

  /** Uno al azar (el Caramelo Exp. sale algo más). */
  function roll() {
    let t = Math.random() * IDS.reduce((a, id) => a + DEF[id].w, 0);
    for (const id of IDS) if ((t -= DEF[id].w) <= 0) return id;
    return 'rarecandy';
  }

  // ---------------- usar ----------------

  const say = (t, s = 2.4) => G.Spawner.say(t, s, true);
  const pop = (pl, txt, col) => { G.FX.dmgText(pl.x, pl.y - pl.bodyH - 10, txt, col, true); G.FX.ring(pl.x, pl.y, 6, 54, col, 0.45, 3); };

  /** Tu Pokémon coge uno (en grupo, lo llama cada uno para sí: ver la cabecera). */
  function take(pl, id) {
    const d = DEF[id];
    if (!pl || !d || pl.dead) return;
    icons();
    G.Audio.sfx(id === 'rarecandy' ? 'levelup' : 'confirm');
    if (id === 'rarecandy') {
      G.Game.giveLevel();
      pop(pl, G.T(d.name), d.col);
      return;
    }
    if (d.berry) {
      pl.berries = pl.berries || {};
      if (pl.berries[id]) {                        // ya lleva una igual: monedas
        pl.coins += 25;
        G.FX.dmgText(pl.x, pl.y - pl.bodyH - 6, '+25', '#ffd23f');
        return;
      }
      pl.berries[id] = true;
      say(G.I18n.f('¡Guardas una {x}!', G.T(d.name)));
      pop(pl, G.T(d.name), d.col);
      return;
    }
    if (id === 'mochiHp') pl.addMaxHp(Math.round(pl.maxHp * 0.05));
    else if (id === 'mochiAtk') pl.atkMul *= 1.05;
    else if (id === 'mochiSpd') pl.spdMul *= 1.05;
    else if (id === 'mochiDef') pl.dmgReduce = Math.min(0.8, pl.dmgReduce + 0.05);
    pl.mochis = (pl.mochis || 0) + 1;
    pop(pl, G.T(d.name), d.col);
    say(G.I18n.f('¡{x}! {x}', G.T(d.name), G.T(d.desc)));
  }

  /** Cada fotograma, con tu Pokémon: las bayas que hacen falta se gastan solas. */
  function update(dt, pl) {
    if (!pl || pl.dead) return;
    if (pl.liechiT > 0) pl.liechiT -= dt;
    if (pl.freeT > 0) { pl.freeT -= dt; pl.slowT = 0; }
    const b = pl.berries;
    if (!b) return;
    const low = pl.hp < pl.maxHp * 0.25;
    if (b.sitrus && low) { b.sitrus = false; pl.heal(pl.maxHp * 0.3); eat(pl, 'sitrus'); }
    if (b.liechi && low && !(pl.liechiT > 0)) { b.liechi = false; pl.liechiT = 10; eat(pl, 'liechi'); }
    if (b.pecha && slowed(pl)) { b.pecha = false; pl.slowT = 0; pl.freeT = 5; eat(pl, 'pecha'); }
  }
  /** ¿Algo le frena? (trampa pegajosa, la nieve, el agua…) */
  function slowed(pl) {
    if (pl.slowT > 0) return true;
    const ab = pl.abil || {};
    if (!pl.hasItem('safetygoggles') && G.Weather.speedFor(pl.mon.types) < 1) return true;
    return !!(pl.inLiquid && !ab.steady && !pl.hasItem('heavyboots') && (G.World.liquidEffect(pl.mon.types).slow || 1) < 1);
  }
  function eat(pl, id) {
    const d = DEF[id];
    G.Audio.sfx('heal');
    pop(pl, G.T(d.name), d.col);
    say(G.I18n.f('¡{x}! {x}', G.T(d.name), G.T(d.desc)), 2.6);
  }

  /** Las bayas que llevas, en fila (bajo la vida; ui/hud.js). */
  function drawHud(ctx, pl, x, y) {
    if (!pl || !pl.berries) return;
    icons();
    let i = 0;
    for (const id of BERRIES) if (pl.berries[id]) G.Icons.draw(ctx, 'use:' + id, x + (i++) * 16, y, 14);
    if (pl.liechiT > 0 || pl.freeT > 0) {
      const id = pl.liechiT > 0 ? 'liechi' : 'pecha', t = pl.liechiT > 0 ? pl.liechiT : pl.freeT;
      ctx.save();
      ctx.globalAlpha = 0.6 + Math.sin(performance.now() / 120) * 0.3;
      G.Icons.draw(ctx, 'use:' + id, x + i * 16, y, 14);
      ctx.restore();
      ctx.font = '800 9px Pixelify,"Segoe UI",system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = DEF[id].col;
      ctx.fillText(Math.ceil(t) + ' s', x + i * 16 + 16, y + 10);
    }
  }

  return { DEF, IDS, BERRIES, roll, take, update, drawHud, icons };
})();
