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
      // 10/19 新招式（跟遊戲 combat.js 的 reach 一樣）
      case 'homing': case 'bounce': return Math.min(520, (m.speed || 300) * (m.life || 1.6));   // 追蹤／彈跳：遠程
      case 'charge': return (m.radius || 300) + 20;     // 蓄力光束：直線很長
      case 'quake': return (m.count | 0) * 34 + (m.radius || 30);   // 地震波：往前一路炸過去
      case 'vortex': case 'stun': return 300;           // 漩渦／暈眩：出現在敵人腳下
      case 'spin': case 'shove': return (m.radius || 60) + 20;   // 迴旋／擊退：打身邊一圈
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
    // 卡片剛出現時會暗掉 0.6 秒、點了沒用（防止戰鬥中按 1-4 誤選）→ 等它亮
    if (box.classList.contains('guard')) return true;
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
      const score = card.dataset.key ? this.scoreLevelCard(card, player)
        : card.dataset.item ? this.scoreItem(card.dataset.item)
        : card.dataset.move ? this.scoreBond(card.dataset.move, player)
        : this.scoreByText(card);
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
  /**
   * 招式對這隻寶可夢好不好用（遊戲規則 G.Stats.fit）：物理招吃「攻擊」、特殊招吃「特攻」，
   * 以兩者中較高者為 1。例如怪力（攻擊高）用暗影球（特殊）只剩 6 成多。
   */
  static fit(player, cat) {
    const mon = player && player.mon;
    if (!mon || !cat || mon.pa == null || !mon.atk) return 1;
    return (cat === 'special' ? mon.sa : mon.pa) / mon.atk;
  }

  scoreLevelCard(card, player) {
    const [type, id] = card.dataset.key.split(':');
    // 有「全部」特權（攻擊 ×5 以上）：輸出已經夠，保命優先（見下面的能力卡）
    const boosted = !!(player && player.boost && player.boost.atk >= 5);
    const fit = PokeAutoBot.fit(player, card.dataset.cat);
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
      if (m.kind === 'buff') {
        // 劍舞／龍之舞只加物攻、詭計只加特攻：跟手上攻擊招式不同類就別再升（Mega 基格爾德是特攻型，卻把劍舞升滿）
        const st = m.def && m.def.stat;
        if (st === 'patk' || st === 'satk') {
          const cat = st === 'patk' ? 'physical' : 'special';
          const same = attacks.filter(a => a.cat === cat).length;
          if (attacks.length && same * 2 < attacks.length) return 120 + tiebreak;
        }
        return 700 + m.lvl * 20 + tiebreak;
      }
      // 沒特權：只有選中的那一格會出手，換格時那一格的冷卻直接跳到 35%（Player.setActive）→
      // 兩個強招來回切換最划算。只投資兩個主力攻擊招（進化、等級、實際打出的傷害、合不合這隻寶可夢），
      // 其他攻擊招升了也不會出手（資料：好幾招升滿了整場打 0 傷害），點數改拿 Potencia／Reflejos。
      if (!boosted && attacks.length > 2) {
        const total = attacks.reduce((a, x) => a + (x.dealt || 0), 0) + 1;
        const rank = a => ((a.evolved ? 2 : 0) + a.lvl / ((a.def && a.def.maxLvl) || 5) + 2 * (a.dealt || 0) / total) *
          (PokeAutoBot.QUALITY[a.kind] || 0.6) * Math.min(1, PokeAutoBot.fit(player, a.cat));
        const core = attacks.slice().sort((a, b) => rank(b) - rank(a)).slice(0, 2);
        if (!core.includes(m)) return 450 + tiebreak;
      }
      // 最高等的攻擊招式最優先（集中把它升滿進化），其他攻擊招式其次
      const top = Math.max(...attacks.map(a => a.lvl / ((a.def && a.def.maxLvl) || 5)));
      const q = PokeAutoBot.QUALITY[m.kind] || 0.6;
      let s = 600 + 700 * q + (m.lvl / max) * 600;
      if (m.lvl / max >= top && q >= 0.8) s += 300;
      if (m.lvl + 1 >= max) s += 200;          // 這一下就升滿
      if (fit < 0.95) s *= Math.max(0.35, fit * fit);   // 不合這隻寶可夢的招式：少投資
      if (boosted && m.lvl + 1 < max) s *= 0.6;          // 有特權：一般升級讓給防禦／體力（快升滿＝快進化的照舊）
      return s + tiebreak;
    }

    if (type === 'new') {
      if (free <= 0) return 0;
      if (card.dataset.buff) {
        if (buffs.length) return 200;
        // 加攻擊的輔助最值得，而且要留一格給它。
        // 劍舞／龍之舞（patk）只加物理、詭計（satk）只加特殊：要跟手上攻擊招式的類別對上才有用
        const b = card.dataset.buff;
        let atkBuff = b === 'atk';
        if (b === 'patk' || b === 'satk') {
          const cat = b === 'patk' ? 'physical' : 'special';
          const same = attacks.filter(a => a.cat === cat).length;
          atkBuff = attacks.length ? same * 2 >= attacks.length : PokeAutoBot.fit(player, cat) >= 0.999;
        }
        return (attacks.length >= 2 ? (atkBuff ? 1500 : 500) : 400) + tiebreak;
      }
      // 留一格給輔助：攻擊招式最多 3 招
      if (attacks.length >= 3) return 300;
      // 很不合這隻寶可夢的招式（卡上寫「只剩 xx %」）：不要
      if (fit < 0.85) return 40 + fit * 100 + tiebreak;
      const k = (PokeAutoBot.QUALITY[card.dataset.mkind] || 0.6) * fit * fit;
      // 沒特權：已經有兩個攻擊招就不太需要第三個（排在 Potencia／Reflejos 之後）
      const base = attacks.length < 2 ? 2600 : boosted ? 1300 : 1100;
      return base * k + tiebreak;
    }

    if (type === 'stat') {
      if (id === 'heal') return hpFrac < 0.4 ? 5000 : 50;
      const lv = player ? player.level : 1;
      // 開「全部」特權時攻擊 ×40 還會一直長，輸出早就溢出；後期死因都是一發 200 多的傷害秒殺低血量。
      // → 先拿防禦（每張減傷 6%，最多 12 張＝70%）、體力（沒有上限）、回復，攻擊和冷卻幾乎不拿
      const STAT = boosted
        ? { def: 1900, hp: 1500, rgn: 900, spd: 600, mag: 300, xp: lv < 12 ? 400 : 120, atk: 150, cd: 250 }
        : { atk: 650, cd: 680, hp: hpFrac < 0.6 ? 900 : 620, def: 800, rgn: 450, spd: 500, xp: lv < 12 ? 560 : 250, mag: 260 };
      // 沒特權：真正的瓶頸是殺怪速度（第 4～5 分鐘怪堆到上限 64，之後全是菁英）。
      // 「Potencia」+10% 全部招式傷害、「Reflejos」-8% 全部冷卻，比升一個次要招式（只占總輸出一小部分）划算，
      // 排在一般招式升級之前（進化、新攻擊招式、加攻擊的輔助、升滿進化那一下還是優先）。
      //（試過優先拿防禦：打怪變慢、等級低，平均反而少 1 分半）
      if (!boosted && (id === 'atk' || id === 'cd')) return (id === 'atk' ? 1700 : 1650) + tiebreak;
      return (STAT[id] || 200) + tiebreak;
    }
    return tiebreak;
  }

  /**
   * 道具二選一（一局只能帶一個，js/data/items.js）。以前用文字評分：「換成」那張有 evo 樣式 → +5000，
   * 永遠換成最新撿到的，連「不能換招」的講究頭帶也換（換招會把冷卻跳到 35%，是主要輸出手段）。
   * 保命優先：突擊背心 +20% 減傷、吃剩的東西每秒回 1.5% 血、貝殼之鈴打怪回血、氣勢披帶擋一次致命傷。
   */
  scoreItem(id) {
    const V = { assaultvest: 100, leftovers: 90, shellbell: 85, focussash: 80, quickclaw: 75, choicescarf: 60,
                luckyegg: 55, rockyhelmet: 50, lifeorb: 45, choiceband: 25, amuletcoin: 5 };
    return V[id] ?? 30;
  }

  /**
   * 羈絆（打倒傳說寶可夢）：把招式融合在同一格、同時出手。
   * 選最強的攻擊招式（進化、等級、實際打出的傷害、合不合這隻寶可夢）；輔助招式放最後。
   */
  scoreBond(id, player) {
    const moves = (player && player.moves) || [];
    const m = moves.find(x => x.id === id);
    if (!m) return 0;
    if (m.kind === 'buff') return 0.3;
    const total = moves.reduce((a, x) => a + (x.dealt || 0), 0) + 1;
    return ((m.evolved ? 2 : 0) + m.lvl / ((m.def && m.def.maxLvl) || 5) + 2 * (m.dealt || 0) / total) *
      (PokeAutoBot.QUALITY[m.kind] || 0.6) * Math.min(1, PokeAutoBot.fit(player, m.cat)) + 1;
  }

  // 沒有遊戲標記的卡片：文字關鍵字評分
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
    // 近戰／衝刺：命中要敵人「中心」在招式半徑內 → 站在半徑的 55%，貼著打
    if (best.kind === 'melee' || best.kind === 'dash') return Math.max(22, (best.radius || 50) * 0.55);
    if (best.kind === 'aura') return Math.max(24, (best.radius || 60) * 0.5);
    if (best.kind === 'spin' || best.kind === 'shove') return Math.max(26, (best.radius || 60) * 0.55);   // 打身邊一圈：貼近
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
  riftField(s, rift) { return this.field(s, rift.x, rift.y - 10); }

  /**
   * 從目標 (gx, gy) 往外算每一格「走到目標還要幾格」（8 方向、不切角、牆／樹／岩漿不能走）。
   * 同一個目標格 0.3 秒內重用。也用在卡住時繞路。
   */
  field(s, gx, gy) {
    const now = performance.now();
    const TS = s.TS, R = 34, N = R * 2 + 1;
    const cx = Math.floor(gx / TS), cy = Math.floor(gy / TS);
    const key = cx + ',' + cy;
    if (this.rf && this.rf.key === key && now - this.rf.t < 300) return this.rf;
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
    this.rf = { key, t: now, ox, oy, N, dist, rx: gx, ry: gy };
    return this.rf;
  }

  /** 從 (x1,y1) 直線走到 (x2,y2) 會不會穿過不能走的格子（牆、樹、岩漿）？ */
  /**
   * 開闊度地圖：玩家周圍 20 格內，每一格離最近的牆、障礙物或水有幾格（最多 6）。
   * 洞窟（第 4～8 分鐘）牆和水最多，大部分沒加成的死亡都在這段：在窄通道、牆邊被圍住就跑不掉。
   */
  clearAt(s, x, y) {
    const TS = s.TS, R = 20, N = R * 2 + 1, now = performance.now();
    const pcx = Math.floor(s.player.x / TS), pcy = Math.floor(s.player.y / TS);
    let c = this.clr;
    if (!c || now - c.t > 400 || Math.abs(c.cx - pcx) > 3 || Math.abs(c.cy - pcy) > 3) {
      const ox = pcx - R, oy = pcy - R, dist = new Int8Array(N * N).fill(-1), q = new Int32Array(N * N);
      let head = 0, tail = 0;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const tx = ox + i, ty = oy + j;
        if (!s.walkable(tx, ty) || (s.liquidTile && s.liquidTile(tx, ty))) { dist[j * N + i] = 0; q[tail++] = j * N + i; }
      }
      while (head < tail) {
        const k = q[head++], i = k % N, j = (k / N) | 0, dv = dist[k];
        if (dv >= 6) continue;
        for (const [di, dj] of PokeAutoBot.D8) {
          const ni = i + di, nj = j + dj;
          if (ni < 0 || nj < 0 || ni >= N || nj >= N) continue;
          const n = nj * N + ni;
          if (dist[n] >= 0) continue;
          dist[n] = dv + 1; q[tail++] = n;
        }
      }
      c = this.clr = { t: now, cx: pcx, cy: pcy, ox, oy, N, dist };
    }
    const i = Math.floor(x / TS) - c.ox, j = Math.floor(y / TS) - c.oy;
    if (i < 0 || j < 0 || i >= c.N || j >= c.N) return 6;
    const v = c.dist[j * c.N + i];
    return v < 0 ? 6 : v;
  }

  /**
   * 從 (x, y) 往 (ox, oy) 方向「一小步一小步」真的走走看，能走多遠（最多 maxD）。
   * 以前一次跳 40～60 像素去試，會直接「穿過」薄牆、水邊的高地，誤以為走得通，結果一路走進死角。
   */
  freeRun(s, x, y, ox, oy, maxD) {
    let cx = x, cy = y;
    for (let d = 0; d < maxD; d += 12) {
      const o = s.step(cx + ox * 12, cy + oy * 12);
      if (Math.hypot(o.x - cx, o.y - cy) < 6) return d;
      cx = o.x; cy = o.y;
    }
    return maxD;
  }

  lineBlocked(s, x1, y1, x2, y2) {
    const TS = s.TS, d = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.ceil(d / 16));
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (!s.walkable(Math.floor((x1 + (x2 - x1) * t) / TS), Math.floor((y1 + (y2 - y1) * t) / TS))) return true;
    }
    return false;
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
    // 每一種傷害來源的代價都依「會扣多少血」計算（占最大血量的比例）：
    // 躲不完的時候，自然會挑總傷害最低的路線（例如寧可吃一顆小子彈，也不碰頭目）。
    const maxHp = p.maxHp || 100;
    // 「真實」傷害：屬性相剋、天氣、防禦都算進去（同一隻怪對不同寶可夢可以差到 4 倍）；一下就會被打倒的特別怕
    const hpNow = Math.max(1, p.hp || 1);
    const hurt = dmg => 40 + 400 * Math.min(1, (dmg || 8) / maxHp) + ((dmg || 8) >= hpNow ? 300 : 0);
    const real = (amt, type, cat) => s.hitFor ? s.hitFor(amt || 8, type, cat) : (amt || 8);

    const enemies = s.enemies.filter(e => !e.dead && e.behavior !== 'thief' &&
      Math.abs(e.x - p.x) < 420 && Math.abs(e.y - p.y) < 420);
    const shots = s.projectiles.filter(b => Math.abs(b.x - p.x) < 450 && Math.abs(b.y - p.y) < 450);
    const eHit = new Map(enemies.map(e => [e, real(e.dmg, e.atkType, e.cat)]));
    const bHit = new Map(shots.map(b => [b, real(b.dmg, b.mtype, b.cat)]));
    const hazards = (s.hazards || []).filter(h => !h.hit);
    const hHit = new Map(hazards.map(h => [h, h.pct ? maxHp * h.pct * 1.5 : h.pure ? (h.dmg || 8) : real(h.dmg, h.type, h.cat)]));
    const pickups = s.pickups.filter(it => Math.abs(it.x - p.x) < 500 && Math.abs(it.y - p.y) < 500)
      .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)).slice(0, 40);
    // 小偷寶可夢（會掉金幣和券）：值得追
    const thieves = s.enemies.filter(e => !e.dead && e.behavior === 'thief');

    // 最近的敵人（不限距離，沒人在附近時往那邊走去找經驗）
    let nearest = null, nd = Infinity;
    for (const e of s.enemies) {
      if (e.dead || e.behavior === 'thief') continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < nd) { nd = d; nearest = e; }
    }
    // 真正要打的目標：遊戲目前瞄準的敵人（遠程招式會挑彈道暢通的）；沒有就用最近的
    const tgt = p.target && !p.target.dead && p.target.hp !== undefined ? p.target : nearest;
    const usesShots = (p.slots && p.slots[p.active] || []).some(m => ['projectile', 'beam', 'boomerang', 'cone', 'nova', 'homing', 'bounce', 'charge', 'quake', 'vortex', 'stun'].includes(m.kind));
    // 近身型（近戰、衝刺、光環、環繞）：本來就要貼著怪，對一般小怪的「靠近」不扣分，只有真的碰到才算
    const closeRange = !usesShots && (p.slots && p.slots[p.active] || []).some(m => ['melee', 'dash', 'aura', 'orbit', 'trail', 'spin', 'shove'].includes(m.kind));
    // 阿爾宙斯的審判：牠殺不死、碰到扣 40% 血、越來越快。目標只有一個：活越久越好。
    const arc = s.arceus;
    const lowHp = hpFrac < 0.35;
    // 血量越少越怕痛
    const danger = hpFrac < 0.5 ? 1 + (0.5 - hpFrac) * 2 : 1;
    const specials = s.specials || [];
    const traps = specials.filter(o => o.type === 'trap');
    // 大寶箱：要站在旁邊 3.5 秒才會開（離開會倒退）。320 像素內有一個就去站好，站到開為止。
    // 有時間限制的優先：裂縫一出現（會消失）就只管裂縫，大寶箱、小寶箱、祭壇都不會跑掉，回來再開
    //（以前兩邊一起拉，會在中間來回抖：寶箱沒開到、裂縫也過期了）
    const riftOn = !!(s.rift && !s.inArena);
    let bigChest = null, bcd = 320;
    if (!riftOn) for (const o of specials) if (o.type === 'bigchest') { const d = Math.hypot(o.x - p.x, o.y - p.y); if (d < bcd) { bcd = d; bigChest = o; } }
    const altars = riftOn ? [] : specials.filter(o => o.type === 'altar' && !o.used);
    // 倒地的隊友（連線）：要站在他旁邊 3 秒才扶得起來。審判中或自己快死了就先不去。
    let downed = null;
    if (!arc && hpFrac >= 0.25) {
      let bd = Infinity;
      for (const m of (s.mates || [])) if (m.dead) { const dm = Math.hypot(m.x - p.x, m.y - p.y); if (dm < bd) { bd = dm; downed = m; } }
    }
    const want = this.engageDistance(p) + (lowHp ? 60 : 0);
    // 裂縫（血量太低或快消失前來不及就算了）
    // 裂縫一出現就一定要進去（沿著繞過樹和湖的路線走）
    const rift = s.rift && !s.inArena ? s.rift : null;
    const rf = rift ? this.riftField(s, rift) : null;

    // 卡住偵測：一直按著方向卻沒移動 → 換個方向走一下（每 0.3 秒檢查一次，比以前快一倍）
    const now = performance.now();
    const st = this.stuck;
    if (now - st.t > 300) {
      const moved = Math.hypot(p.x - st.x, p.y - st.y);
      // 按著方向卻幾乎沒動 → 卡住了：接下來 1.5 秒用找路（下面 pf）繞出去
      if (this.lastDir >= 0 && moved < spd * 0.06) st.until = now + 1500;
      st.x = p.x; st.y = p.y; st.t = now;
    }
    // 卡住時：從目前位置往 8 個方向各試走 160 像素，脫困時往走得最遠的方向
    const escapeRun = now < st.until ? PokeAutoBot.DIRS.map(([ox, oy]) => this.freeRun(s, p.x, p.y, ox, oy, 160)) : null;
    // 目標和自己之間有牆／樹（直線走不到），或剛卡住：改用「路徑距離」帶路
    // 審判中：找路的目標 = 阿爾宙斯相對競技場中心的「對面」那一點（繞過柱子往遠處跑）
    // 迷路的寶可夢：先走過去碰牠，牠跟上後帶到綠色標記（獎勵：回血、金幣、抽獎券，有機會加入收藏）
    const lost = !arc && !rift && s.lost && (s.lost.state === 'wait' || s.lost.mine) && hpFrac >= 0.3 ? s.lost : null;
    const lostGoal = lost ? (lost.state === 'wait' ? { x: lost.x, y: lost.y } : { x: lost.tx, y: lost.ty }) : null;
    // 寶藏怪（喵喵＝金幣、賽富豪＝十連券）：15 秒內打倒，不然就跑掉
    let thief = null;
    if (!arc) for (const e of thieves) if (!thief || Math.hypot(e.x - p.x, e.y - p.y) < Math.hypot(thief.x - p.x, thief.y - p.y)) thief = e;
    if (thief && riftOn && Math.hypot(thief.x - p.x, thief.y - p.y) > 200) thief = null;   // 裂縫優先，寶藏怪只在很近時順手打
    // 最值得撿的那一顆（價值 ÷ 距離最高、還在磁鐵範圍外）：鎖定它直線過去，不會被四周的掉落物拉來拉去
    // 開箱模式：大寶箱在旁邊、附近沒怪、血量夠 → 專心站滿 3.5 秒（經驗球等開完再撿，開箱也會噴出很多）
    const chestMode = !!bigChest && hpFrac >= 0.4 && !enemies.some(e => Math.hypot(e.x - bigChest.x, e.y - bigChest.y) < 90);
    let pickGoal = null;
    if (!arc && !rift && !chestMode) {
      let bv = 0;
      for (const it of pickups) {
        const d0 = Math.hypot(it.x - p.x, it.y - p.y);
        if (d0 < (p.magnet || 78) * 0.9) continue;
        const v0 = it.kind === 'heal' ? (hpFrac < 0.85 ? 6 : 0.2) : (PokeAutoBot.PICK[it.kind] ?? 0.3) * (it.kind === 'xp' || it.kind === 'xpBig' ? Math.min(3, 0.6 + (it.value || 1) / 10) : 1);
        const sc = v0 / (d0 + 60);
        if (sc > bv) { bv = sc; pickGoal = it; }
      }
    }
    // 身邊 150 像素內沒敵人：先把經驗球掃乾淨（有敵人靠近時，照常以戰鬥為主）
    const calm = !enemies.some(e => !e.boss && Math.hypot(e.x - p.x, e.y - p.y) < 150) && !enemies.some(e => e.boss && Math.hypot(e.x - p.x, e.y - p.y) < 260);
    // 泉水（站在上面每秒回 14% 最大血量，一口泉水約可回 1.5 倍血量，45 秒回滿）：血量不到六成就過去，站到回滿或泉水乾掉
    //（以前只在血少於一半時輕輕拉一下，200 像素外幾乎沒感覺，從來不會特地過去）
    let spring = null;
    if (!arc && !rift) {
      const want = this.springOn ? hpFrac < 0.97 : hpFrac < 0.6;
      let sd = 450;
      if (want) for (const o of specials) if (o.type === 'spring' && (o.charge === undefined || o.charge > (this.springOn ? 0.03 : 0.2))) {
        const d0 = Math.hypot(o.x - p.x, o.y - 8 - p.y); if (d0 < sd) { sd = d0; spring = { x: o.x, y: o.y - 8 }; } }
    }
    this.springOn = !!spring;
    let pathGoal = rift ? null : downed || spring || thief || lostGoal || (chestMode && bigChest) || (calm && pickGoal) || tgt;
    if (arc) {
      const da = Math.hypot(arc.x - p.x, arc.y - p.y);
      if (da > 320) {
        // 遠：往阿爾宙斯相對中心的「對面」跑
        const vx = arc.cx - arc.x, vy = arc.cy - arc.y, vl = Math.hypot(vx, vy) || 1;
        pathGoal = { x: arc.cx + vx / vl * arc.max * 0.75, y: arc.cy + vy / vl * arc.max * 0.75 };
      } else {
        // 近：沿著圓周往「離牠較遠的那一側」繞（切線逃脫，不會被壓在邊緣）
        const pa = Math.atan2(p.y - arc.cy, p.x - arc.cx), aa = Math.atan2(arc.y - arc.cy, arc.x - arc.cx);
        let diff = aa - pa; while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI;
        const dir = diff > 0 ? -1 : 1;                       // 阿爾宙斯在逆時針方向 → 往順時針繞
        const ga = pa + dir * 1.1;
        pathGoal = { x: arc.cx + Math.cos(ga) * arc.max * 0.7, y: arc.cy + Math.sin(ga) * arc.max * 0.7 };
      }
    }
    const pf = pathGoal && (arc || now < st.until || this.lineBlocked(s, p.x, p.y, pathGoal.x, pathGoal.y)) ? this.field(s, pathGoal.x, pathGoal.y) : null;
    const pfW = now < st.until ? 0.25 : arc ? 0.1 : 0.08;

    const DIRS = PokeAutoBot.DIRS;
    let best = -1, bestCost = Infinity;
    const dbg = this.dbg = [];
    for (let d = -1; d < 8; d++) {
      const [dx, dy] = d < 0 ? [0, 0] : DIRS[d];
      let x = p.x, y = p.y, cost = 0, blocked = 0;
      let riftBest = rf ? this.fieldDist(rf, s.TS, x, y) : 0;   // 這條路線上離裂縫最近的一點
      let mateBest = downed ? Math.hypot(downed.x - x, downed.y - y) : 0;   // 路線上離倒地隊友最近的一點（速度快會走過頭）
      let lostBest = lostGoal ? Math.hypot(lostGoal.x - x, lostGoal.y - y) : 0;
      let thiefBest = thief ? Math.hypot(thief.x - x, thief.y - y) : 0;
      let pgBest = pickGoal ? Math.hypot(pickGoal.x - x, pickGoal.y - y) : 0;
      let chestBest = bigChest ? Math.hypot(bigChest.x - x, bigChest.y - y) : 0;   // 路線上離大寶箱最近的一點
      let springBest = spring ? Math.hypot(spring.x - x, spring.y - y) : 0;
      const pickBest = pickups.map(it => Math.hypot(it.x - x, it.y - y));   // 路線上離每個掉落物最近的距離
      const altarBest = altars.map(o => Math.hypot(o.x - x, o.y - y));   // 祭壇也是碰到就好
      const path = [[x, y]];                  // 我在每一步的位置（衝撞怪瞄準用）
      for (let k = 1; k <= STEPS; k++) {
        const t = k * dt;
        if (d >= 0) {
          const o = s.step(x + dx * spd * dt, y + dy * spd * dt);
          // 撞到東西：實際移動距離比預期短
          blocked += 1 - Math.min(1, Math.hypot(o.x - x, o.y - y) / (spd * dt));
          x = o.x; y = o.y;
          // 審判的競技場是圓的：遊戲會把人夾回圓內（step 不知道），這裡照樣夾，免得以為往牆外跑有用
          if (arc) {
            const qx = x - arc.cx, qy = y - arc.cy, qd = Math.hypot(qx, qy), lim = arc.max - 2;
            if (qd > lim) { const f = lim / qd; x = arc.cx + qx * f; y = arc.cy + qy * f; blocked += 0.35; }
          }
          if (s.bad(x, y)) cost += 25;
        }
        path.push([x, y]);
        if (rf) riftBest = Math.min(riftBest, this.fieldDist(rf, s.TS, x, y));
        if (downed) mateBest = Math.min(mateBest, Math.hypot(downed.x - x, downed.y - y));
        if (lostGoal) lostBest = Math.min(lostBest, Math.hypot(lostGoal.x - x, lostGoal.y - y));
        if (pickGoal) pgBest = Math.min(pgBest, Math.hypot(pickGoal.x - x, pickGoal.y - y));
        if (bigChest) chestBest = Math.min(chestBest, Math.hypot(bigChest.x - x, bigChest.y - y));
        if (spring) springBest = Math.min(springBest, Math.hypot(spring.x - x, spring.y - y));
        if (thief) { const [tx, ty] = [thief.x + (thief.vx || 0) * t, thief.y + (thief.vy || 0) * t]; thiefBest = Math.min(thiefBest, Math.hypot(tx - x, ty - y)); }
        for (let q = 0; q < pickups.length; q++) pickBest[q] = Math.min(pickBest[q], Math.hypot(pickups[q].x - x, pickups[q].y - y));
        for (let a = 0; a < altars.length; a++) altarBest[a] = Math.min(altarBest[a], Math.hypot(altars[a].x - x, altars[a].y - y));
        const w = 1.15 - k / STEPS * 0.5;      // 越近的未來越重要

        if (arc) {
          // 阿爾宙斯朝「我那時的位置」追來，速度 = 我的速度 × k（放招時停住）
          const ax0 = x - arc.x, ay0 = y - arc.y, ad0 = Math.hypot(ax0, ay0) || 1;
          const astep = arc.casting ? 0 : Math.min(ad0, spd * arc.k * t);
          const ax = arc.x + ax0 / ad0 * astep, ay = arc.y + ay0 / ad0 * astep;
          const agap = Math.hypot(x - ax, y - ay) - arc.r - r;
          if (agap < 10) cost += hurt(maxHp * (arc.touch || 0.4)) * 2 * w;      // 碰到：40% 血（7 分鐘後越來越多，約 40 分鐘一碰就倒）
          else cost += 260 * w * Math.exp(-agap / 70);                         // 越近越危險
        }
        for (const e of enemies) {
          const [ex, ey, dashing] = this.predictEnemy(e, t, x, y, path, dt, p);
          const gap = Math.hypot(x - ex, y - ey) - (e.r || 14) - r;
          // 打得痛的怪（一下超過最大血量 15%，例如被剋）拉開得更遠，像頭目一樣
          const ed = eHit.get(e), heavy = Math.min(3, Math.max(1, ed / (maxHp * 0.15)));
          const big = Math.max(e.boss || e.legend || e.judge ? 3 : 1, heavy) * (dashing ? 1.6 : 1);
          // 只在快碰到時才怕：近身／範圍招式需要貼近才打得到
          const bigE = e.boss || e.legend || e.judge;
          if (gap < (closeRange && !bigE ? 2 : 8)) cost += hurt(ed) * (bigE ? 1.5 : 1) * w * danger;
          // 遠程：敵人進到 60～80 像素就開始拉開（風箏），不要等快碰到才躲——沒加成時死因幾乎都是被圍住連續碰撞
          else if (!closeRange || bigE || heavy > 1.5) cost += 30 * big * w * danger * Math.exp(-gap / 14);   // 溫和版：太強會一直後退、打不到怪、等級跟不上
          else cost += 15 * big * w * danger * Math.exp(-gap / 5);   // 近戰：本來就要貼著打
        }
        for (const b of shots) {
          // 子彈這一步走過的線段離我多近（快的子彈一步會跳很遠）
          const ax = b.x + (b.vx || 0) * (t - dt), ay = b.y + (b.vy || 0) * (t - dt);
          const bx = b.x + (b.vx || 0) * t, by = b.y + (b.vy || 0) * t;
          const sx = bx - ax, sy = by - ay, l2 = sx * sx + sy * sy || 1;
          const u = Math.max(0, Math.min(1, ((x - ax) * sx + (y - ay) * sy) / l2));
          const qx = ax + sx * u - x, qy = ay + sy * u - y;
          const rr = (b.r || 6) + r + 10;
          if (qx * qx + qy * qy < rr * rr) cost += hurt(bHit.get(b)) * w * danger;
        }
        for (const o of traps) {
          if (Math.hypot(o.x - x, o.y - 8 - y) < 30) cost += 60 * w;
        }
        for (const h of hazards) {
          const left = h.delay - h.t;
          if (t >= left - 0.12 && t <= left + (h.end || 0.3) + 0.05 && s.inHazard(h, x, y, r + 8)) cost += hurt(hHit.get(h)) * danger;
        }
      }
      // 還沒到時間的地面警告：終點還站在裡面就扣分，一出現就開始走開
      //（以前只扣 10 分，旁邊有怪就不走，最後 0.7 秒才逃已經來不及：19/23 次被炸是警告出現時就在圈裡，只走了 25～43 像素）
      for (const h of hazards) {
        const left = h.delay - h.t;
        if (left > H && left < 2.2 && s.inHazard(h, x, y, r + 12)) cost += Math.max(h.pct ? 30 : 10, hurt(hHit.get(h)) * 0.5) * (1 - (left - H) / 1.5) * danger;
      }
      // 走到要開的寶箱旁邊被它擋住是正常的（寶箱是實心的）：終點在開箱範圍內就不算撞牆、不算死路
      //（以前把大寶箱當牆，停在 60 像素外不敢貼上去，開箱範圍只有 56）
      const atChest = bigChest && Math.hypot(bigChest.x - x, bigChest.y - y) < Math.max(46, (bigChest.r || 14) + r + 24) + 4;
      if (!atChest) cost += blocked * (arc ? 40 : 6);   // 審判中撞牆 = 送死
      // 死路：終點附近真的走得出去（連續走 72 像素以上）的方向太少 → 口袋地形（牆、高地、樹、水邊）
      // 旁邊有怪時更危險：被堵在牆邊、水裡出不去，是沒加成時最常見的死法之一
      if (!atChest) {
        let open = 0;
        for (const [ox, oy] of PokeAutoBot.DIRS) if (this.freeRun(s, x, y, ox, oy, 84) >= 72) open++;
        let crowdEnd = 0;
        for (const e of enemies) if (Math.hypot(e.x - x, e.y - y) < 150) crowdEnd++;
        cost += Math.max(0, 6 - open) * (6 + 3 * Math.min(6, crowdEnd));
        // 待在開闊的地方：離牆／水不到 3 格就扣分，怪越多扣越重（審判和裂縫的競技場另外處理）
        if (!arc) cost += Math.max(0, 3 - this.clearAt(s, x, y)) * (5 + 3 * Math.min(6, crowdEnd));
      }
      // 卡住了：往「真的走得最遠」的方向脫困，不要一直往牆上擠
      if (escapeRun && d >= 0) cost -= escapeRun[d] * 0.2;

      // 終點：別被包圍（四面都有敵人比單邊危險）
      let crowd = 0, cx = 0, cy = 0;
      for (const e of enemies) {
        const ddx = e.x - x, ddy = e.y - y, dd = Math.hypot(ddx, ddy);
        if (dd < 150) { crowd++; cx += ddx / (dd || 1); cy += ddy / (dd || 1); }
      }
      const spread = crowd ? 1 - Math.hypot(cx, cy) / crowd : 0;   // 0 = 都在同一邊, 1 = 被包圍
      cost += crowd * 1.5 + crowd * spread * 6;   // 被包圍要付出代價：往敵人少的那一側走

      // 審判中：離阿爾宙斯越遠越好（牠放招時是拉開距離的機會），不主動去追傳說寶可夢
      if (arc) {
        const da = Math.hypot(arc.x - x, arc.y - y);
        cost -= Math.min(da, 900) * 0.2;
        // 別把自己逼到牆角：終點附近能走的方向越少越糟
        if (d >= 0) {
          let open = 0;
          for (const [ox, oy] of PokeAutoBot.DIRS) {
            const o = s.step(x + ox * 60, y + oy * 60);
            if (Math.hypot(o.x - x, o.y - y) > 42 && Math.hypot(o.x - arc.cx, o.y - arc.cy) < arc.max - 2) open++;   // 牆外（圓外）不算
          }
          cost += Math.max(0, 6 - open) * 9;
        }
      }
      // 保持在招式打得到的距離（對「真正要打的目標」）。審判中：只有阿爾宙斯離得夠遠時才去打傳說寶可夢
      //（牠們每 5 秒翻倍，早殺早好；太近就只管逃）
      const arcFar = !arc;   // 審判中不追任何目標：自動瞄準會打到靠近的傳說
      if (tgt && !rift && arcFar && !(calm && pickGoal) && !chestMode) {
        // 只有打不到時才靠近；打得到就不用再往前（避免在怪群邊緣來回）
        const dn = Math.hypot(tgt.x - x, tgt.y - y);
        cost += Math.min(Math.max(0, dn - want), 700) * (arc ? 0.04 : closeRange ? 0.22 : 0.12);
        // 遠程招式：站在這裡彈道會被牆或石頭擋住 → 不要站這裡，去找打得到的角度
        if (usesShots && dn < 560 && s.clearShot && !s.clearShot(x, y, tgt.x, tgt.y)) cost += 30;
      }

      // 裂縫：走進去打傳說寶可夢（拿券和「連結」）
      // 每靠近裂縫 1 格路程就大幅加分（比撿東西、保持距離都重要；只有快被撞到才會讓路）
      // （看整條路線上最近的一點：速度快時一步會走過頭，只看終點會以為站著不動最好）
      if (rf) cost += riftBest * 0.7 + (riftBest < 26 ? -60 : 0);

      // 撿東西
      // 掉落物進到吸取範圍（磁鐵）就會自己飛過來：以「路線上最近的一點」減掉磁鐵半徑來算，分數比以前高很多，
      // 沒有危險時會主動去掃經驗球（危險時，躲子彈和敵人的分數一樣比較大）
      const mag = (p.magnet || 78) * 0.9;
      let pickSum = 0;
      for (let q = 0; q < pickups.length; q++) {
        const it = pickups[q];
        const v = PokeAutoBot.PICK[it.kind] !== undefined ? PokeAutoBot.PICK[it.kind] : 0.3;
        let wt = it.kind === 'heal' ? (hpFrac < 0.85 ? 4 + (1 - hpFrac) * 30 : 0.3) : v;
        if (it.kind === 'xp' || it.kind === 'xpBig') wt *= Math.min(3, 0.6 + (it.value || 1) / 10);
        const eff = Math.max(0, pickBest[q] - mag);
        pickSum += Math.min(wt, 6) * 160 / (eff + 40);   // 單一個最多 24 分
      }
      // 加總也有上限，血少時再減半：撿東西永遠不能比「被包圍、被打」更重要（曾經為了撿回血衝進怪堆被圍死）
      cost -= (rift || arc ? 0.2 : chestMode ? 0.3 : 1) * Math.min(pickSum, 40) * (danger > 1 ? 0.5 : 1);
      // 鎖定的那顆掉落物：越接近越好（進到磁鐵範圍就會自己飛過來）
      if (pickGoal) cost += Math.max(0, Math.min(Math.hypot(pickGoal.x - x, pickGoal.y - y), pgBest + 10) - mag) * (calm ? 0.35 : 0.1);
      // 迷路的寶可夢：碰到牠／帶到標記
      if (lostGoal) cost += Math.max(0, Math.min(Math.hypot(lostGoal.x - x, lostGoal.y - y), lostBest + 10) - (lost.state === 'wait' ? 18 : 30)) * 0.9;
      // 寶藏怪（喵喵掉金幣、賽富豪掉 ×10 扭蛋券）：不會攻擊、會逃跑、時間到會消失 → 全力追
      for (const e of thieves) cost -= (e.def && e.def.loot === 'ticket10' ? 60 : 30) * 40 / (Math.hypot(e.x - x, e.y - y) + 30);
      // 最近的那隻：用預測的逃跑位置追，越近分數越高（射程內就會被自動瞄準）
      if (thief) cost -= (thief.def && thief.def.loot === 'ticket10' ? 140 : 80) * 60 / (thiefBest + 60);

      // 地圖上的東西：
      //   泉水（站上去每秒回 14% 血）：血少時最優先
      //   祭壇（25 秒強化）、大寶箱（站旁邊 3.5 秒開：金幣、扭蛋券、經驗）
      for (const o of specials) {
        const dd = Math.hypot(o.x - x, (o.type === 'spring' ? o.y - 8 : o.y) - y);
        let wt = 0;
        if (o.type === 'spring' && (o.charge === undefined || o.charge > 0.05)) wt = hpFrac < 0.5 ? 40 : hpFrac < 0.85 ? 6 : 0;
        else if (o.type === 'altar') continue;   // 下面另外算
        else if (o.type === 'bigchest') wt = riftOn || o === bigChest ? 0 : 18;   // 近的那個在下面另外處理；裂縫期間不管寶箱
        if (wt) cost -= wt * 40 / (dd + 20);
      }
      // 小寶箱（打破有金幣、經驗、有時道具）：走過去，靠近時遊戲會自動瞄它
      // 小寶箱（要打破）：走到 130 像素內，遊戲就會讓 bot 改瞄它（身邊 70 像素沒有敵人時）
      if (!riftOn) {
        let cBest = null, cbd = 220;
        for (const c of (s.chests || [])) { const dcs = Math.hypot(c.x - x, c.y - y); cost -= 9 * 40 / (dcs + 20); const d0 = Math.hypot(c.x - p.x, c.y - p.y); if (d0 < cbd) { cbd = d0; cBest = c; } }
        // 最近的那個（220 像素內）：一路走到 60 像素內，近了攻擊就會打它
        if (cBest) cost += Math.max(0, Math.hypot(cBest.x - x, cBest.y - y) - 55) * (calm ? 0.25 : 0.08);
      }
      // 大寶箱：終點要在它旁邊（開箱判定約 46 像素內），到了就站著不動
      if (bigChest) {
        // 遊戲的開箱判定：max(46, 箱子半徑 + 自己半徑 + 24) 以內；箱子是實體，不能再近
        const near = Math.max(46, (bigChest.r || 14) + r + 24) - 4;
        const dc = Math.hypot(bigChest.x - x, bigChest.y - y);
        // 要連續站 3.5 秒（離開會倒退）：周圍有怪也要站好（寶箱本來就設計成邊挨打邊開），血少於四成才放棄
        // 附近（90 像素內）沒有敵人才站著開；有怪貼身就先處理怪，不硬吃傷害
        const want2 = chestMode ? 1 : 0.2;
        // 速度快時 0.7 秒的路線會「走過頭」衝到寶箱另一邊：看路線上最接近的那一點（到了範圍內就會站住）
        cost += Math.max(0, Math.min(dc, chestBest + 10) - near) * 1.6 * want2;
        if (dc < near) cost -= (d < 0 ? 30 : 12) * want2;
      }
      // 泉水：終點要站在上面（遊戲判定 26 像素內），到了就站著回血
      if (spring) {
        const dsp = Math.hypot(spring.x - x, spring.y - y);
        cost += Math.max(0, Math.min(dsp, springBest + 8) - 16) * 1.4;
        if (dsp < 20) cost -= d < 0 ? 24 : 10;
      }
      // 倒地的隊友：終點要貼著他（遊戲判定 56 像素內），到了就站著不動直到他起來
      if (downed) {
        const dm = Math.hypot(downed.x - x, downed.y - y);
        // 判定是 56 像素內，但隊友那邊看到的你會因延遲偏一點：貼到 28 像素內才停（走過頭也算有靠近）
        cost += Math.max(0, Math.min(dm, mateBest + 10) - 28) * 1.2;
        if (dm < 32 && d < 0) cost -= 18;
      }
      // 祭壇（25 秒強化：攻擊×2、速度、磁鐵、冷卻）：路線上碰得到就算
      for (const db of altarBest) cost -= 14 * 40 / (db + 20);

      // 不要一直換方向（減少抖動）
      if (this.lastDir >= 0 && d !== this.lastDir) cost += 1.5;
      if (d < 0 && enemies.length && !downed && !bigChest && !spring) cost += 4;   // 有敵人時別站著不動（扶人、開箱除外）
      // 繞路：沿著路徑距離變短的方向走（卡住時權重更大，站著不動另外扣分）
      if (pf) { cost += this.fieldDist(pf, s.TS, x, y) * pfW; if (now < st.until && d < 0) cost += 20; }

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
                        aura: 0.75, mine: 0.7, orbit: 0.6, trail: 0.6, nova: 0.55, melee: 0.55, dash: 0.5,
                        // 10/19 新招式：自動追蹤／彈跳的遠程最好用；蓄力光束、暈眩、漩渦也是遠程；迴旋／擊退要貼近
                        homing: 1, bounce: 0.95, charge: 0.85, stun: 0.85, vortex: 0.8, quake: 0.75, shove: 0.6, spin: 0.55 };
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
