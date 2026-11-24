/* ============ shop.js — Tienda Kecleon y Mochila ============
 * (20-10-2026, del PR #236 de TheAdro7, adaptado: sin niveles ni caramelos.)
 *
 * Se compra con Pokémonedas y lo comprado va a la Mochila:
 *   save.bag[id]     Menta, Cápsula Habilidad, Cápsula Habilidad Oculta y MT vacía
 *                    (23-11-2026: borra una MT enseñada, G.Mons.forget)
 *   save.tms[move]   MT sin usar (cada una se gasta al enseñarla: G.Mons.teach)
 * Las dos van en la libreta de las monedas (core/db.js): lo gastado en un
 * aparato no reaparece al fusionar con otro.
 *
 * MT a la venta: 8 cada día, iguales para todos (semilla: la fecha en España).
 * Si ninguna sirve a tu compañero, la última se cambia por una que sí aprenda.
 * Estelas (23-11-2026): 12 cada semana, iguales para todos (abajo, weeklyTrails).
 */
G.Shop = (() => {
  const ITEMS = {
    mint: { name: 'Menta', icon: 'mint', price: 1500,
            desc: 'Cambia la naturaleza de un Pokémon por la que tú elijas.' },
    cap:  { name: 'Cápsula Habilidad', icon: 'capsule', price: 1500,
            desc: 'Cambia la habilidad de un Pokémon por otra de las suyas (no la oculta).' },
    caph: { name: 'Cápsula Habilidad Oculta', icon: 'capsuleh', price: 5000, hidden: true,
            desc: 'Cambia la habilidad de un Pokémon por cualquiera de las suyas, también la oculta.' },
    tmx:  { name: 'MT vacía', icon: 'tmx', price: 1000,
            desc: 'Borra una MT que le hayas enseñado a un Pokémon. Si tenías ese ataque vetado, se quita también el veto.' },
    // Halloween (25-10-2026): no se vende; se consigue jugando esos días y se gasta en las skins.
    candy: { name: 'Caramelo de Halloween', icon: 'candy', price: 0, event: true,
             desc: 'Lo sueltan los Pokémon Fantasma y las calabazas en Halloween. Con ellos se compran las skins de bruja en la Tienda Kecleon.' }
  };
  const ORDER = ['mint', 'cap', 'caph', 'tmx'];
  const DAILY = 8;

  const save = () => G.DB.save;

  // ---------------- Mochila ----------------

  const count = id => { const s = save(); return (s && s.bag && s.bag[id]) || 0; };
  function take(id) {
    const s = save();
    if (!count(id)) return false;
    if (--s.bag[id] <= 0) delete s.bag[id];
    return true;
  }
  const tmCount = id => { const s = save(); return (s && s.tms && s.tms[id]) || 0; };
  function takeTm(id) {
    const s = save();
    if (!tmCount(id)) return false;
    if (--s.tms[id] <= 0) delete s.tms[id];
    return true;
  }

  // ---------------- MT del día ----------------

  /** Fecha de hoy en España (todos ven la misma tienda el mismo día). */
  function today() {
    const p = {};
    for (const x of new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())) p[x.type] = x.value;
    return p.year + p.month + p.day;
  }
  function rng(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  /** Las 8 MT a la venta hoy. */
  function dailyTms() {
    const all = Object.keys(G.TM_MOVES).sort(), r = rng('kecleon:' + today());
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    const list = all.slice(0, DAILY);
    const s = save(), dex = s && s.partner;
    if (dex && !list.some(id => G.Mons.canLearn(dex, id))) {
      const mine = G.Mons.learnable(dex).sort();
      if (mine.length) list[DAILY - 1] = mine[Math.floor(rng('kecleon:' + today() + ':' + dex)() * mine.length)];
    }
    return list;
  }
  const tmPrice = id => G.TM_PRICE[id] || 400;

  // ---------------- comprar ----------------

  /** Compra un objeto ('mint'...) o una MT ('tm:flamethrower'). → { ok, error? } */
  function buy(key) {
    const s = save();
    if (!s) return { ok: false };
    const tm = key.startsWith('tm:') ? key.slice(3) : null;
    if (tm && !dailyTms().includes(tm)) return { ok: false, error: 'Esa MT ya no está a la venta.' };
    if (!tm && (!ITEMS[key] || ITEMS[key].event)) return { ok: false };
    const price = tm ? tmPrice(tm) : ITEMS[key].price;
    if (s.coins < price) return { ok: false, error: 'No tienes Pokémonedas suficientes.' };
    s.coins -= price;
    if (tm) { s.tms = s.tms || {}; s.tms[tm] = Math.min(999, (s.tms[tm] || 0) + 1); }
    else { s.bag = s.bag || {}; s.bag[key] = Math.min(999, (s.bag[key] || 0) + 1); }
    G.DB.commit();
    return { ok: true };
  }

  /** Halloween: una skin de bruja por caramelos (sólo esos días; luego se queda para siempre). → { ok, error? } */
  function buySkin(id) {
    const s = save(), sk = G.Skins.SKINS[id], price = G.Halloween.SKIN_PRICE;
    if (!s || !sk || !G.Skins.LIST.includes(id)) return { ok: false };
    if (!G.Halloween.on) return { ok: false, error: 'Las skins de bruja sólo se venden en Halloween.' };
    if (G.Skins.owns(s, id)) return { ok: false, error: 'Ya tienes esta skin.' };
    if (count('candy') < price) return { ok: false, error: 'No tienes caramelos suficientes.' };
    s.bag.candy -= price;
    if (s.bag.candy <= 0) delete s.bag.candy;
    s.skins = s.skins || {};
    s.skins[id] = Date.now();
    // Si ya tienes ese Pokémon, se la pone.
    if (G.DB.owns(sk.dex)) G.Skins.wear(s, sk.dex, id);
    G.DB.commit(true);
    return { ok: true };
  }

  // ---------------- estelas (23-11-2026, copia local: entities/trails.js) ----------------
  /*
   * Cada semana (de lunes a domingo, en España) hay 12 a la venta, las mismas para todos:
   * 5 comunes, 4 raras, 2 épicas y 1 legendaria. Se compran una vez (save.trails) y valen
   * para todos tus Pokémon; cada uno se pone la suya en el Vestidor.
   */
  const WEEK_MIX = { 1: 5, 2: 4, 3: 2, 4: 1 };
  /** Lunes de esta semana en España ('AAAAMMDD') y días que faltan para el siguiente. */
  function week() {
    const t = today(), d = new Date(Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8)));
    const back = (d.getUTCDay() + 6) % 7;
    const mon = new Date(d.getTime() - back * 864e5);
    return { key: mon.toISOString().slice(0, 10).replace(/-/g, ''), left: 7 - back };
  }
  function weeklyTrails() {
    const r = rng('estelas:' + week().key), out = [];
    for (const rar of [1, 2, 3, 4]) {
      const l = G.Trails.LIST.filter(t => t.rar === rar).map(t => t.id).sort();
      for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
      out.push(...l.slice(0, WEEK_MIX[rar]));
    }
    return out;
  }
  /** Compra una estela de las de esta semana. → { ok, error? } */
  function buyTrail(id) {
    const s = save(), t = G.Trails.BY[id];
    if (!s || !t) return { ok: false };
    if (G.Dress.ownsTrail(s, id)) return { ok: false, error: 'Ya tienes esta estela.' };
    if (!weeklyTrails().includes(id)) return { ok: false, error: 'Esa estela ya no está a la venta.' };
    if (s.coins < t.price) return { ok: false, error: 'No tienes Pokémonedas suficientes.' };
    s.coins -= t.price;
    s.trails = s.trails || {};
    s.trails[id] = Date.now();
    // A tu compañero se le pone si aún no llevaba ninguna.
    if (s.partner && !G.Dress.trailOf(s, s.partner)) G.Dress.set(s, s.partner, { tr: id });
    G.DB.commit(true);
    return { ok: true };
  }

  // ---------------- skins de la semana (25-11-2026, copia local: core/skins.js) ----------------
  /*
   * 3 cada semana, las mismas para todos (G.Skins.weekly), con Pokémonedas: el precio va por su rareza.
   * Un pack se compra una vez y da todos sus estilos. Si tienes ese Pokémon, se le pone (sin su aspecto
   * del Vestidor: un aspecto y una skin no van juntos).
   */
  function buyWeekSkin(id) {
    const s = save(), sk = G.Skins.SKINS[id];
    if (!s || !sk) return { ok: false };
    if (G.Skins.owns(s, id)) return { ok: false, error: 'Ya tienes esta skin.' };
    if (!G.Skins.weekly().includes(id)) return { ok: false, error: 'Esa skin ya no está a la venta.' };
    const price = G.Skins.price(id);
    if (s.coins < price) return { ok: false, error: 'No tienes Pokémonedas suficientes.' };
    s.coins -= price;
    s.skins = s.skins || {};
    s.skins[id] = Date.now();
    if (G.DB.owns(sk.dex)) { G.Skins.wear(s, sk.dex, id); G.Dress.set(s, sk.dex, { lk: 0 }); }
    G.DB.commit(true);
    return { ok: true };
  }

  // ---------------- objetos de la partida (24-11-2026, copia local: systems/startitem.js) ----------------
  /*
   * Los objetos equipables de la partida (data/items.js), a 500 cada uno, para la Mejora Objeto inicial.
   * Van a save.held[id] (cuántos), en la libreta como la Mochila ('h:<id>'), y se gasta uno al empezar
   * una partida con él. Los que dan experiencia (Huevo Suerte, Amuleto Exp.) no se venden; si ya tienes
   * alguno, lo puedes seguir usando.
   */
  const HELD_PRICE = 500;
  const NO_SALE = ['luckyegg', 'expcharm'];
  const heldForSale = () => G.Items.LIST.map(i => i.id).filter(id => !NO_SALE.includes(id));
  const heldCount = id => { const s = save(); return (s && s.held && s.held[id]) || 0; };
  function takeHeld(id) {
    const s = save();
    if (!heldCount(id)) return false;
    if (--s.held[id] <= 0) delete s.held[id];
    return true;
  }
  /** Compra uno de los objetos de la partida. → { ok, error? } */
  function buyHeld(id) {
    const s = save();
    if (!s || !G.Items.BY[id]) return { ok: false };
    if (!heldForSale().includes(id)) return { ok: false, error: 'Ese objeto no se vende.' };
    if (s.coins < HELD_PRICE) return { ok: false, error: 'No tienes Pokémonedas suficientes.' };
    s.coins -= HELD_PRICE;
    s.held = s.held || {};
    s.held[id] = Math.min(999, (s.held[id] || 0) + 1);
    G.DB.commit();
    return { ok: true };
  }

  return { ITEMS, ORDER, count, take, tmCount, takeTm, dailyTms, tmPrice, buy, buySkin, today, week, weeklyTrails, buyTrail,
           HELD_PRICE, heldForSale, heldCount, takeHeld, buyHeld, buyWeekSkin };
})();
