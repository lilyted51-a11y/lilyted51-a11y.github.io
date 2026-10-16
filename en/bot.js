/**
 * PokéSurvivor 全自動 AI 輔助系統 (bot.js)
 * - 自動選卡：依遊戲規則（升滿 → 進化），見 scoreLevelCard
 * - 走位：短程規劃。每一幀試 8 個方向 + 原地不動，模擬接下來 0.5 秒
 *   自己、敵人、子彈和地上的攻擊預警，選最安全、又能讓招式打到敵人的方向
 *
 * 遊戲狀態來自 js/game.js 每幀寫入的 window.__POKE_STATE__（只在 bot 開啟時寫入），
 * 遊戲每一幀呼叫 window.__POKE_BOT_TICK__。
 * 開著 bot 玩的那一局不會上傳排行榜（遊戲會把該局標記為非正常遊玩）。
 */
class PokeAutoBot {
  constructor() {
    this.enabled = true;
    window.__POKE_BOT_ON__ = true;
    this.currentKeys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };
    this.lastDir = -1;
    this.stuck = { x: 0, y: 0, t: 0, until: 0, dir: 0 };

    // 同類卡片之間的參考順序（招式名稱，同時支援西文原版、英文與繁中補丁）
    this.skillPriority = [
      'Evolution', 'Evolve', '進化', '进化',
      'Vast Force', '廣域戰力', 'Psychic', '精神強念', 'Confusion', '念力', 'Psybeam', '幻象光線',
      'Moonblast', '月亮之力', 'Fairy Wind', '妖精之風', 'Misty Terrain', '薄霧場地', 'Dazzling Gleam', '魔法閃耀',
      'Discharge', '放電', 'Thunderbolt', '十萬伏特', 'Thunder', '打雷',
      'Fire Spin', '火焰旋渦', 'Fire Blast', '大字爆炎', 'Heat Wave', '熱風', 'Ember', '火花',
      'Petal Blizzard', '落英繽紛', 'Leaf Storm', '飛葉風暴', 'Razor Leaf', '飛葉快刀',
      'Boomburst', '爆音波', 'Hyper Voice', '巨聲', 'Extreme Speed', '神速',
      'Scald', '熱水', 'Aqua Ring', '水流環', 'Water Gun', '水槍',
      'Dragon Dance', '龍之舞', 'Shadow Ball', '暗影球', 'Hex', '禍不單行'
    ];

    this.createToggleUI();
  }

  // 畫面左下角的 AI 開關按鈕
  createToggleUI() {
    const btn = document.createElement('button');
    btn.id = 'poke-bot-toggle';
    btn.dataset.pszhControl = '';   // 不讓中文補丁去翻譯這顆按鈕
    Object.assign(btn.style, {
      position: 'fixed', bottom: '10px', left: '10px', zIndex: '999999',
      padding: '6px 12px', color: '#fff', borderRadius: '8px', cursor: 'pointer', opacity: '0.9',
      fontWeight: 'bold', fontFamily: 'sans-serif', fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
    });
    const paint = () => {
      btn.innerText = this.enabled ? '🤖 AI 自動玩: 開啟 (按 B 切換)' : '🤖 AI 自動玩: 關閉 (按 B 切換)';
      btn.style.background = this.enabled ? '#10b981' : '#ef4444';
      btn.style.border = '2px solid ' + (this.enabled ? '#059669' : '#b91c1c');
    };
    const toggle = () => {
      this.enabled = !this.enabled;
      window.__POKE_BOT_ON__ = this.enabled;
      paint();
      if (!this.enabled) this.releaseAllKeys();
    };
    paint();
    btn.addEventListener('click', toggle);
    window.addEventListener('keydown', (e) => {
      if (!e.isTrusted) return;   // 忽略 bot 自己派發的按鍵
      const tag = document.activeElement && document.activeElement.tagName;
      if (e.code === 'KeyB' && tag !== 'INPUT' && tag !== 'TEXTAREA') toggle();
    });
    document.body.appendChild(btn);
  }

  // 模擬真實鍵盤按壓與放開（遊戲在 window 上監聽 keydown / keyup）
  setKey(code, key, isDown) {
    if (this.currentKeys[code] === isDown) return;
    this.currentKeys[code] = isDown;
    window.dispatchEvent(new KeyboardEvent(isDown ? 'keydown' : 'keyup', { code, key, bubbles: true }));
  }

  releaseAllKeys() {
    this.setKey('KeyW', 'w', false);
    this.setKey('KeyS', 's', false);
    this.setKey('KeyA', 'a', false);
    this.setKey('KeyD', 'd', false);
  }

  // 每一幀由遊戲呼叫
  update() {
    if (!this.enabled) return;

    // 1. 優先處理升級選卡、道具二選一、技能連結視窗
    if (this.handleModalsAndUpgrades()) {
      this.releaseAllKeys();
      return;
    }

    // 2. 走位
    const state = window.__POKE_STATE__;
    if (!state || !state.player || state.phase !== 'playing' || state.player.dead) { this.releaseAllKeys(); return; }
    this.weave(state);
    this.applyDir(window.__BOT_NOMOVE ? -1 : this.plan(state));
  }

  // ---------------------------------------------------------------- 換招（數字鍵）

  /**
   * 遊戲規則（js/systems/combat.js、Player.setActive）：
   *   - 只有「目前的格子」會倒數冷卻、會出招
   *   - 換到另一格時，那格的冷卻最多只剩 35%；換走的格子冷卻是暫停，不會損失
   *   - 輔助招式（劍舞等）的效果換走後還在
   * 所以：一招放完就換到下一招（輪流出招），輔助招式快沒效果時補一下。
   */
  weave(s) {
    const p = s.player, slots = p.slots || [];
    if (slots.length < 2) return;
    const now = performance.now();
    if (now - (this.lastSwitch || 0) < 90) return;
    const nd = this.nearestDist(s);

    const value = (i) => {
      let v = 0;
      for (const m of slots[i]) {
        const cd = Math.max(0.05, m.cd || 1);
        if (m.kind === 'orbit') { v += i === p.active ? 40 : 5; continue; }   // 換走會把環繞的球清掉
        const t = i === p.active ? Math.max(0, m.t) : Math.min(Math.max(0, m.t), cd * 0.35);
        if (m.kind === 'buff') {
          const b = p.buffs && p.buffs[m.stat];
          const need = !b || b.n < (m.stacks || 1) || b.t < 2.5;
          v += need ? 60 / (t + 0.1) : 0;
          continue;
        }
        if (PokeAutoBot.TARGETED.includes(m.kind) && !(nd <= this.reach(m))) continue;   // 打不到
        v += this.hitValue(m, s) / (t + 0.1);
      }
      return v;
    };

    let best = p.active, bestV = value(p.active);
    for (let i = 0; i < slots.length; i++) {
      if (i === p.active) continue;
      const v = value(i);
      if (v > bestV * 1.2 + 1) { best = i; bestV = v; }
    }
    if (best !== p.active) {
      const code = 'Digit' + (best + 1);
      window.dispatchEvent(new KeyboardEvent('keydown', { code, key: String(best + 1), bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keyup', { code, key: String(best + 1), bubbles: true }));
      this.lastSwitch = now;
    }
  }

  /**
   * 這一招放出去「實際」大概打到多少傷害（不是招式寫的總量）：
   *   nova（泡沫等）：一圈往四面八方射，敵人只在一邊時，每隻大概只中 1 發
   *   範圍招式：附近敵人越多越賺
   */
  hitValue(m, s) {
    const p = s.player, base = m.dmg || 10, R = this.reach(m) + 20;
    const ds = [];
    for (const e of s.enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d <= R) ds.push([d, e.r || 14]);
    }
    if (!ds.length) return 0;
    const n = Math.max(1, m.count | 0);
    switch (m.kind) {
      case 'nova': {
        const k = Math.max(3, n);
        let hits = 0;
        for (const [d, er] of ds) hits += Math.min(1, k * (er + (m.size || 8)) * 2 / (2 * Math.PI * Math.max(d, 20)));
        return base * Math.min(hits, k);
      }
      case 'projectile': return base * (n > 1 ? n * 0.7 : 1) * (m.pierce ? 1.25 : 1);
      case 'meteor': return base * n * 0.6;
      default: return base * Math.min(1 + (ds.length - 1) * 0.5, 3) * (n > 1 ? Math.min(n, 3) * 0.7 : 1);
    }
  }

  nearestDist(s) {
    const p = s.player;
    let nd = Infinity;
    for (const e of s.enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < nd) nd = d;
    }
    return nd;
  }

  /** 招式打得到的距離（同 js/systems/combat.js 的 reach）。 */
  reach(m) {
    switch (m.kind) {
      case 'melee': return (m.radius || 50) + 30;
      case 'beam': return (m.radius || 200) + 20;
      case 'boomerang': return (m.radius || 150) + 40;
      case 'chain': return 280;
      case 'meteor': return 340;
      case 'dash': return (m.radius || 60) + 60;
      case 'cone': return (m.speed || 200) * (m.life || 0.5) + 30;
      case 'projectile': return Math.min(520, (m.speed || 300) * (m.life || 1.5));
      case 'aura': case 'nova': return m.radius || (m.speed || 200) * (m.life || 1);
      default: return 200;
    }
  }

  // ---------------------------------------------------------------- 選卡

  // 只看遊戲中的三種選卡畫面（升級 / 道具二選一 / 技能連結），不會去點選單、轉蛋或商店
  handleModalsAndUpgrades() {
    const screen = ['scr-levelup', 'scr-item', 'scr-bond']
      .map(id => document.getElementById(id))
      .find(el => el && !el.classList.contains('hidden'));
    if (!screen) return false;
    // 合作模式選完後會等其他人，卡片區會加上 done
    const box = screen.querySelector('#cards, #item-cards, #bond-cards');
    if (!box || box.classList.contains('done')) return true;
    const cards = Array.from(box.querySelectorAll('.card'));
    if (!cards.length) return true;

    // 卡片出現後等一下再點，避免畫面還沒畫好
    const now = performance.now();
    if (this.cardsSeenAt === undefined || this.cardsBox !== box.firstChild) {
      this.cardsBox = box.firstChild; this.cardsSeenAt = now; return true;
    }
    if (now - this.cardsSeenAt < 300) return true;

    const player = window.__POKE_STATE__ && window.__POKE_STATE__.player;
    let best = cards[0], bestScore = -Infinity;
    for (const card of cards) {
      const score = card.dataset.key ? this.scoreLevelCard(card, player) : this.scoreByText(card);
      if (score > bestScore) { bestScore = score; best = card; }
    }
    this.cardsSeenAt = undefined;
    best.click();
    return true;
  }

  /**
   * 升級卡評分（依遊戲規則，見 js/systems/levelup.js）：
   *   招式升到滿級 + 拿到對應的能力卡 → 出現金色「進化」卡，是最大的戰力提升。
   * 策略：
   *   1. 進化卡 > 解鎖進化的能力卡（金色「Evoluciona …」）
   *   2. 前期先湊到 2 招攻擊招式，之後集中把「等級最高」的招式一路升滿，
   *      升滿後再換下一招（不會每招都升一點）
   *   3. 血量低時優先回血；能力卡中以攻擊力、冷卻優先
   */
  /*
   * 因為會輪流換招（見 weave），格子的最佳配置是「3 招攻擊 + 1 招加攻擊的輔助」：
   *   - 學新攻擊招式：前 3 招都很值得，安全的遠程招式優先，近戰排後
   *   - 升級：先把最高等的攻擊招式升滿（升滿 + 能力卡 = 進化），再升下一招
   *   - 輔助：劍舞／龍之舞（加攻擊）最好；其他輔助普通
   */
  scoreLevelCard(card, player) {
    const [type, id] = card.dataset.key.split(':');
    const moves = (player && player.moves) || [];
    const attacks = moves.filter(m => m.kind !== 'buff');
    const buffs = moves.filter(m => m.kind === 'buff');
    const free = player ? (player.maxMoves || 4) - (player.slots || []).length : 0;
    const hpFrac = player ? player.hp / (player.maxHp || 1) : 1;
    const tiebreak = this.scoreByText(card) * 0.01;

    if (type === 'evo') return 10000;
    if (type === 'stat' && card.dataset.evo) return 9000;

    if (type === 'up') {
      const m = moves.find(x => x.id === id);
      if (!m) return 1000 + tiebreak;
      const max = (m.def && m.def.maxLvl) || 5;
      if (m.kind === 'buff') return 700 + m.lvl * 20 + tiebreak;
      // 最高等的攻擊招式最優先（集中把它升滿進化），其他攻擊招式其次
      const top = Math.max(...attacks.map(a => a.lvl / ((a.def && a.def.maxLvl) || 5)));
      const q = PokeAutoBot.QUALITY[m.kind] || 0.6;
      let s = 600 + 700 * q + (m.lvl / max) * 600;
      if (m.lvl / max >= top && q >= 0.8) s += 300;
      if (m.lvl + 1 >= max) s += 200;          // 這一下就升滿
      return s + tiebreak;
    }

    if (type === 'new') {
      if (free <= 0) return 0;
      if (card.dataset.buff) {
        if (buffs.length) return 200;
        // 加攻擊的輔助最值得，而且要留一格給它
        const atkBuff = card.dataset.buff === 'atk';
        return (attacks.length >= 2 ? (atkBuff ? 1500 : 800) : 400) + tiebreak;
      }
      // 留一格給輔助：攻擊招式最多 3 招
      if (attacks.length >= 3) return 300;
      const k = PokeAutoBot.QUALITY[card.dataset.mkind] || 0.6;
      const base = attacks.length < 2 ? 2600 : 1300;
      return base * k + tiebreak;
    }

    if (type === 'stat') {
      if (id === 'heal') return hpFrac < 0.4 ? 5000 : 50;
      const lv = player ? player.level : 1;
      const STAT = { atk: 650, cd: 680, hp: hpFrac < 0.6 ? 700 : 480, def: 520, rgn: 400, spd: 500,
                     xp: lv < 12 ? 560 : 250, mag: 260 };
      return (STAT[id] || 200) + tiebreak;
    }
    return tiebreak;
  }

  // 沒有遊戲標記的卡片（道具二選一、技能連結）：文字關鍵字評分
  scoreByText(card) {
    const text = card.innerText || '';
    let score = 0;
    if (text.includes('Evolution') || text.includes('進化') || card.classList.contains('evo')) score += 5000;
    if (!/Nuevo|New|新/.test(text)) score += 200;
    this.skillPriority.forEach((keyword, idx) => {
      if (text.includes(keyword)) score += (this.skillPriority.length - idx) * 15;
    });
    return score;
  }

  // ---------------------------------------------------------------- 走位

  /** 招式打得到的距離：近戰／光環類要貼近，投射類可以站遠一點。 */
  engageDistance(p) {
    // 以最高等的攻擊招式為準
    let best = (p.slots && p.slots[p.active] || []).find(m => m.kind !== 'buff') || null;
    if (!best) for (const m of p.moves || []) {
      if (m.kind === 'buff') continue;
      if (!best || m.lvl > best.lvl) best = m;
    }
    if (!best) return 150;
    if (best.kind === 'orbit') return 45;
    if (['mine', 'trail', 'turret'].includes(best.kind)) return 120;
    if (best.kind === 'nova') {
      // 距離 d 時，一隻敵人被射中的機率約 = 發數 × (敵人半徑 + 子彈大小) × 2 ÷ 圓周
      const k = Math.max(3, best.count | 0);
      return Math.max(45, Math.min(160, k * (14 + (best.size || 8)) * 2 / (2 * Math.PI * 0.7)));
    }
    return Math.max(50, Math.min(190, this.reach(best) * 0.7));
  }

  /**
   * 敵人 t 秒後的位置（同 js/entities/enemy.js 的行為）：
   *   一般：朝我那時的位置追過來
   *   衝撞怪（charger）：200 內會停下瞄準 0.55 秒，再朝「那一刻的我」以 3.4 倍速衝 0.42 秒
   *   跳躍中：沿著跳躍路線
   * 回傳 [x, y, 是否正在衝撞]
   */
  predictEnemy(e, t, x, y, path, dt, p) {
    const spd = e.spd || 60;
    if (e.jump) {
      const j = e.jump, k = Math.max(0, Math.min(1, (j.t + t) / j.dur));
      return [j.sx + (j.tx - j.sx) * k, j.sy + (j.ty - j.sy) * k, false];
    }
    if (e.behavior === 'charger' && !e.boss) {
      const DASH = spd * 3.4;
      if (e.phase === 'dash') {
        const tt = Math.min(t, Math.max(0, e.pt));
        return [e.x + (e.dx || 0) * DASH * tt, e.y + (e.dy || 0) * DASH * tt, t <= e.pt];
      }
      const dist0 = Math.hypot(p.x - e.x, p.y - e.y);
      const aim = e.phase === 'aim' ? Math.max(0, e.pt) : (dist0 < 210 && e.pt <= 0.1 ? 0.55 : null);
      if (aim !== null) {
        if (t <= aim) return [e.x, e.y, false];
        // 衝刺方向：瞄準結束那一刻我的位置
        const at = path[Math.min(path.length - 1, Math.round(aim / dt))];
        const ux = at[0] - e.x, uy = at[1] - e.y, ul = Math.hypot(ux, uy) || 1;
        const tt = Math.min(t - aim, 0.42);
        return [e.x + ux / ul * DASH * tt, e.y + uy / ul * DASH * tt, true];
      }
    }
    // 朝「我那時的位置」追過來
    const ex0 = x - e.x, ey0 = y - e.y, d0 = Math.hypot(ex0, ey0) || 1;
    const step = Math.min(d0, spd * t);
    return [e.x + ex0 / d0 * step, e.y + ey0 / d0 * step, false];
  }

  /**
   * 從裂縫往外做一次廣度優先搜尋（和遊戲裡敵人找路一樣：8 方向、不切角、
   * 牆／樹／岩漿不能走），得到每一格「走到裂縫還要幾格」。每 0.3 秒更新。
   */
  riftField(s, rift) {
    const now = performance.now();
    if (this.rf && this.rf.key === rift && now - this.rf.t < 300) return this.rf;
    const TS = s.TS, R = 34, N = R * 2 + 1;
    const cx = Math.floor(rift.x / TS), cy = Math.floor((rift.y - 10) / TS);
    const ox = cx - R, oy = cy - R;
    const open = new Uint8Array(N * N), dist = new Float32Array(N * N).fill(-1);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) open[j * N + i] = s.walkable(ox + i, oy + j) ? 1 : 0;
    const q = new Int32Array(N * N);
    let head = 0, tail = 0;
    const start = R * N + R;
    open[start] = 1; dist[start] = 0; q[tail++] = start;
    while (head < tail) {
      const c = q[head++], i = c % N, j = (c / N) | 0;
      for (const [di, dj] of PokeAutoBot.D8) {
        const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= N || nj >= N) continue;
        const n = nj * N + ni;
        if (dist[n] >= 0 || !open[n]) continue;
        if (di && dj && (!open[j * N + ni] || !open[nj * N + i])) continue;   // 不切角
        dist[n] = dist[c] + (di && dj ? 1.4 : 1);
        q[tail++] = n;
      }
    }
    this.rf = { key: rift, t: now, ox, oy, N, dist, rx: rift.x, ry: rift.y - 10 };
    return this.rf;
  }

  /** 從 (x, y) 走到裂縫的路程（像素）。範圍外或走不到就用直線距離加懲罰。 */
  fieldDist(rf, TS, x, y) {
    const i = Math.floor(x / TS) - rf.ox, j = Math.floor(y / TS) - rf.oy;
    const d = i >= 0 && j >= 0 && i < rf.N && j < rf.N ? rf.dist[j * rf.N + i] : -1;
    // 最後一兩格：直接看離裂縫中心多遠（要走到 30 像素內才會進去）
    if (d >= 0) return d <= 1.5 ? Math.hypot(x - rf.rx, y - rf.ry) : d * TS + TS;
    const R = (rf.N - 1) / 2;
    return Math.hypot(x - (rf.ox + R + 0.5) * TS, y - (rf.oy + R + 0.5) * TS) + 200;
  }

  /**
   * 回傳 0..7（8 個方向）或 -1（不動）。
   * 每個選項模擬 0.5 秒：敵人朝自己追來、子彈直線飛、地上預警到時間會爆，
   * 撞牆會卡住。代價最低的就是要走的方向。
   */
  plan(s) {
    const p = s.player;
    const spd = p.spd || 150, r = p.r || 12;
    const hpFrac = p.hp / (p.maxHp || 1);
    const H = 0.7, STEPS = 7, dt = H / STEPS;

    const enemies = s.enemies.filter(e => !e.dead && e.behavior !== 'thief' &&
      Math.abs(e.x - p.x) < 420 && Math.abs(e.y - p.y) < 420);
    const shots = s.projectiles.filter(b => Math.abs(b.x - p.x) < 450 && Math.abs(b.y - p.y) < 450);
    const hazards = (s.hazards || []).filter(h => !h.hit);
    const pickups = s.pickups.filter(it => Math.abs(it.x - p.x) < 500 && Math.abs(it.y - p.y) < 500);
    // 小偷寶可夢（會掉金幣和券）：值得追
    const thieves = s.enemies.filter(e => !e.dead && e.behavior === 'thief');

    // 最近的敵人（不限距離，沒人在附近時往那邊走去找經驗）
    let nearest = null, nd = Infinity;
    for (const e of s.enemies) {
      if (e.dead || e.behavior === 'thief') continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < nd) { nd = d; nearest = e; }
    }
    const lowHp = hpFrac < 0.35;
    // 血量越少越怕痛
    const danger = hpFrac < 0.5 ? 1 + (0.5 - hpFrac) * 2 : 1;
    const specials = s.specials || [];
    const traps = specials.filter(o => o.type === 'trap');
    const altars = specials.filter(o => o.type === 'altar' && !o.used);
    const want = this.engageDistance(p) + (lowHp ? 60 : 0);
    // 裂縫（血量太低或快消失前來不及就算了）
    // 裂縫一出現就一定要進去（沿著繞過樹和湖的路線走）
    const rift = s.rift && !s.inArena ? s.rift : null;
    const rf = rift ? this.riftField(s, rift) : null;

    // 卡住偵測：一直按著方向卻沒移動 → 換個方向走一下
    const now = performance.now();
    const st = this.stuck;
    if (now - st.t > 700) {
      const moved = Math.hypot(p.x - st.x, p.y - st.y);
      if (this.lastDir >= 0 && moved < spd * 0.08) { st.until = now + 600; st.dir = (this.lastDir + 2 + (Math.random() * 4 | 0)) % 8; }
      st.x = p.x; st.y = p.y; st.t = now;
    }

    const DIRS = PokeAutoBot.DIRS;
    let best = -1, bestCost = Infinity;
    const dbg = this.dbg = [];
    for (let d = -1; d < 8; d++) {
      const [dx, dy] = d < 0 ? [0, 0] : DIRS[d];
      let x = p.x, y = p.y, cost = 0, blocked = 0;
      let riftBest = rf ? this.fieldDist(rf, s.TS, x, y) : 0;   // 這條路線上離裂縫最近的一點
      const altarBest = altars.map(o => Math.hypot(o.x - x, o.y - y));   // 祭壇也是碰到就好
      const path = [[x, y]];                  // 我在每一步的位置（衝撞怪瞄準用）
      for (let k = 1; k <= STEPS; k++) {
        const t = k * dt;
        if (d >= 0) {
          const o = s.step(x + dx * spd * dt, y + dy * spd * dt);
          // 撞到東西：實際移動距離比預期短
          blocked += 1 - Math.min(1, Math.hypot(o.x - x, o.y - y) / (spd * dt));
          x = o.x; y = o.y;
          if (s.bad(x, y)) cost += 25;
        }
        path.push([x, y]);
        if (rf) riftBest = Math.min(riftBest, this.fieldDist(rf, s.TS, x, y));
        for (let a = 0; a < altars.length; a++) altarBest[a] = Math.min(altarBest[a], Math.hypot(altars[a].x - x, altars[a].y - y));
        const w = 1.15 - k / STEPS * 0.5;      // 越近的未來越重要

        for (const e of enemies) {
          const [ex, ey, dashing] = this.predictEnemy(e, t, x, y, path, dt, p);
          const gap = Math.hypot(x - ex, y - ey) - (e.r || 14) - r;
          const big = (e.boss || e.legend || e.judge ? 3 : 1) * (dashing ? 1.6 : 1);
          // 只在快碰到時才怕：近身／範圍招式需要貼近才打得到
          if (gap < 6) cost += 80 * big * w * danger;
          else cost += 30 * big * w * danger * Math.exp(-gap / 9);
        }
        for (const b of shots) {
          // 子彈這一步走過的線段離我多近（快的子彈一步會跳很遠）
          const ax = b.x + (b.vx || 0) * (t - dt), ay = b.y + (b.vy || 0) * (t - dt);
          const bx = b.x + (b.vx || 0) * t, by = b.y + (b.vy || 0) * t;
          const sx = bx - ax, sy = by - ay, l2 = sx * sx + sy * sy || 1;
          const u = Math.max(0, Math.min(1, ((x - ax) * sx + (y - ay) * sy) / l2));
          const qx = ax + sx * u - x, qy = ay + sy * u - y;
          const rr = (b.r || 6) + r + 10;
          if (qx * qx + qy * qy < rr * rr) cost += 150 * w * danger;
        }
        for (const o of traps) {
          if (Math.hypot(o.x - x, o.y - 8 - y) < 30) cost += 60 * w;
        }
        for (const h of hazards) {
          const left = h.delay - h.t;
          if (t >= left - 0.12 && t <= left + (h.end || 0.3) + 0.05 && s.inHazard(h, x, y, r + 8)) cost += h.pct ? 600 : 180;
        }
      }
      cost += blocked * 6;
      // 死路：終點附近能走的方向太少（容易被堵在樹和牆之間）
      if (d >= 0) {
        let open = 0;
        for (const [ox, oy] of PokeAutoBot.DIRS) {
          const o = s.step(x + ox * 40, y + oy * 40);
          if (Math.hypot(o.x - x, o.y - y) > 28) open++;
        }
        cost += Math.max(0, 5 - open) * 4;
      }

      // 終點：別被包圍（四面都有敵人比單邊危險）
      let crowd = 0, cx = 0, cy = 0;
      for (const e of enemies) {
        const ddx = e.x - x, ddy = e.y - y, dd = Math.hypot(ddx, ddy);
        if (dd < 140) { crowd++; cx += ddx / (dd || 1); cy += ddy / (dd || 1); }
      }
      const spread = crowd ? 1 - Math.hypot(cx, cy) / crowd : 0;   // 0 = 都在同一邊, 1 = 被包圍
      cost += crowd * 1.5 + crowd * spread * 4;

      // 保持在招式打得到的距離
      if (nearest && !rift) {
        // 只有打不到時才靠近；打得到就不用再往前（避免在怪群邊緣來回）
        const dn = Math.hypot(nearest.x - x, nearest.y - y);
        cost += Math.min(Math.max(0, dn - want), 700) * 0.12;
      }

      // 裂縫：走進去打傳說寶可夢（拿券和「連結」）
      // 每靠近裂縫 1 格路程就大幅加分（比撿東西、保持距離都重要；只有快被撞到才會讓路）
      // （看整條路線上最近的一點：速度快時一步會走過頭，只看終點會以為站著不動最好）
      if (rf) cost += riftBest * 0.7 + (riftBest < 26 ? -60 : 0);

      // 撿東西
      for (const it of pickups) {
        const v = PokeAutoBot.PICK[it.kind] !== undefined ? PokeAutoBot.PICK[it.kind] : 0.3;
        let wt = it.kind === 'heal' ? (hpFrac < 0.85 ? 4 + (1 - hpFrac) * 30 : 0.3) : v;
        if (it.kind === 'xp' || it.kind === 'xpBig') wt *= Math.min(3, 0.6 + (it.value || 1) / 10);
        cost -= (rift ? 0.2 : 1) * wt * 40 / (Math.hypot(it.x - x, it.y - y) + 30);
      }
      // 寶藏怪（喵喵掉金幣、賽富豪掉 ×10 扭蛋券）：不會攻擊、會逃跑、時間到會消失 → 全力追
      for (const e of thieves) cost -= (e.def && e.def.loot === 'ticket10' ? 60 : 30) * 40 / (Math.hypot(e.x - x, e.y - y) + 30);

      // 地圖上的東西：
      //   泉水（站上去每秒回 14% 血）：血少時最優先
      //   祭壇（25 秒強化）、大寶箱（站旁邊 3.5 秒開：金幣、扭蛋券、經驗）
      for (const o of specials) {
        const dd = Math.hypot(o.x - x, (o.type === 'spring' ? o.y - 8 : o.y) - y);
        let wt = 0;
        if (o.type === 'spring' && (o.charge === undefined || o.charge > 0.05)) wt = hpFrac < 0.5 ? 40 : hpFrac < 0.85 ? 6 : 0;
        else if (o.type === 'altar') continue;   // 下面另外算
        else if (o.type === 'bigchest') wt = 12;
        if (wt) cost -= wt * 40 / (dd + 20);
      }
      // 祭壇（25 秒強化：攻擊×2、速度、磁鐵、冷卻）：路線上碰得到就算
      for (const db of altarBest) cost -= 14 * 40 / (db + 20);

      // 不要一直換方向（減少抖動）
      if (this.lastDir >= 0 && d !== this.lastDir) cost += 1.5;
      if (d < 0 && enemies.length) cost += 4;   // 有敵人時別站著不動
      if (now < st.until && d === st.dir) cost -= 8;

      dbg.push(Math.round(cost));
      if (cost < bestCost) { bestCost = cost; best = d; }
    }
    this.lastDir = best;
    return best;
  }

  applyDir(d) {
    const [dx, dy] = d < 0 ? [0, 0] : PokeAutoBot.DIRS[d];
    this.setKey('KeyW', 'w', dy < -0.3);
    this.setKey('KeyS', 's', dy > 0.3);
    this.setKey('KeyA', 'a', dx < -0.3);
    this.setKey('KeyD', 'd', dx > 0.3);
  }
}
PokeAutoBot.DIRS = [0, 1, 2, 3, 4, 5, 6, 7].map(i => [Math.round(Math.cos(i * Math.PI / 4) * 1e6) / 1e6, Math.round(Math.sin(i * Math.PI / 4) * 1e6) / 1e6]);
// 需要目標在範圍內才會出招的招式（同 js/systems/combat.js 的 TARGETED）
PokeAutoBot.TARGETED = ['melee', 'beam', 'projectile', 'boomerang', 'chain', 'meteor', 'dash', 'cone'];
// 招式好不好用（越安全、越容易打中越高）：學新招和升級時參考
PokeAutoBot.QUALITY = { projectile: 1, chain: 1, meteor: 0.95, beam: 0.9, boomerang: 0.85, turret: 0.8, cone: 0.75,
                        aura: 0.75, mine: 0.7, orbit: 0.6, trail: 0.6, nova: 0.55, melee: 0.55, dash: 0.5 };
PokeAutoBot.D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
// 撿東西的價值（heal 依血量另算）
PokeAutoBot.PICK = { xp: 1.2, xpBig: 2.5, coin: 0.8, magnet: 4, bomb: 2, ticket: 10, ticket10: 16, item: 9 };

// 啟動：只有遊戲標記為「有特權的帳號」（js/core/boost.js）才建立 bot；
// 遊戲每一幀會呼叫 __POKE_BOT_TICK__。登出後按鈕會收起來。
window.addEventListener('DOMContentLoaded', () => {
  window.__POKE_BOT_TICK__ = () => {
    const ok = !!window.__POKE_BOOST__;
    if (ok && !window.myPokeBot) window.myPokeBot = new PokeAutoBot();
    const bot = window.myPokeBot;
    if (!bot) return;
    const btn = document.getElementById('poke-bot-toggle');
    if (btn) btn.style.display = ok ? '' : 'none';
    if (!ok) { bot.releaseAllKeys(); return; }
    bot.update();
  };
});
