/**
 * 四柱推命 簡易診断ロジック
 * - 複数の四柱推命サイトの計算方式を参考に平均化した独自実装
 * - 著作権フリーの伝統的な干支・五行体系を使用
 */

// ===== 天干・地支データ =====
const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const TIAN_GAN_KANA = ['きのえ','きのと','ひのえ','ひのと','つちのえ','つちのと','かのえ','かのと','みずのえ','みずのと'];
const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const DI_ZHI_KANA = ['ね','うし','とら','う','たつ','み','うま','ひつじ','さる','とり','いぬ','い'];

// 天干の五行・陰陽
const GAN_GOGYO = ['木','木','火','火','土','土','金','金','水','水'];
const GAN_YINYANG = ['陽','陰','陽','陰','陽','陰','陽','陰','陽','陰'];

// 地支の五行
const ZHI_GOGYO = ['水','土','木','木','土','火','火','土','金','金','土','水'];

// 五行テーマ
const GOGYO_INFO = {
  '木': {
    name: '木（もく）', symbol: '🌿', color: 'wood', emoji: '木',
    badge: 'wood-badge', bg: 'wood-bg',
    desc: '成長・発展・創造性のエネルギー。植物が上へ伸びるように、前向きな力を持ちます。',
    keywords: ['成長','創造','柔軟性','向上心','共感力']
  },
  '火': {
    name: '火（か）', symbol: '🔥', color: 'fire', emoji: '火',
    badge: 'fire-badge', bg: 'fire-bg',
    desc: '情熱・輝き・表現力のエネルギー。太陽のように周囲を照らし、人を引き寄せます。',
    keywords: ['情熱','表現力','直感','明るさ','リーダーシップ']
  },
  '土': {
    name: '土（ど）', symbol: '🌍', color: 'earth', emoji: '土',
    badge: 'earth-badge', bg: 'earth-bg',
    desc: '安定・包容・信頼のエネルギー。大地のように揺るぎなく、周囲に安心感を与えます。',
    keywords: ['安定','包容力','誠実','忍耐','思いやり']
  },
  '金': {
    name: '金（こん）', symbol: '⚡', color: 'metal', emoji: '金',
    badge: 'metal-badge', bg: 'metal-bg',
    desc: '決断・収穫・精密のエネルギー。刃のように鋭い洞察力と行動力を持ちます。',
    keywords: ['決断力','正義感','精密さ','自立心','意志力']
  },
  '水': {
    name: '水（すい）', symbol: '💧', color: 'water', emoji: '水',
    badge: 'water-badge', bg: 'water-bg',
    desc: '知恵・流動・深さのエネルギー。水が低所に集まるように、深い知性と柔軟性を持ちます。',
    keywords: ['知恵','直観力','柔軟性','探求心','繊細さ']
  }
};

// 本質テキストテンプレート（五行×キーワードから生成）
const HONSHITSU_TEMPLATES = {
  '木': [
    { label: '本来の姿', text: '新しいことへの好奇心が旺盛で、成長を続けることに喜びを感じる性質です。物事を長期的な視点で捉え、じっくりと育てていく力があります。' },
    { label: '対人関係', text: '人の気持ちに敏感で、相手の立場に立って考えられる共感力が高い人です。初対面でも自然と打ち解け、広い人間関係を築きやすいでしょう。' },
    { label: '才能の方向', text: '創造性と企画力に優れており、芸術・教育・企画系の分野で才能が開花します。「新しいものを生み出す」喜びを仕事に繋げると開運します。' },
    { label: '気をつけたいこと', text: '優しさゆえに周囲に流されやすく、自分の意見を言い出せないことも。「ノー」と言える勇気を持つことが大切な課題です。' },
    { label: '今後の運勢ヒント', text: '春〜夏にかけて行動力が高まりやすい時期です。直感を信じて動き始めることで、大きな転機が訪れる可能性を秘めています。' }
  ],
  '火': [
    { label: '本来の姿', text: '情熱的で行動力があり、周囲に活力と明るさを与える輝かしい存在です。目標に向かって一直線に進む推進力は、誰よりも際立っています。' },
    { label: '対人関係', text: '人を惹きつける魅力と、場の雰囲気を盛り上げる天性のカリスマ性があります。ただし感情の波が激しく、言葉がストレートすぎる面も。' },
    { label: '才能の方向', text: '表現力・発信力・営業力に恵まれています。人前に出る仕事や、自分のビジョンを伝える役割で真価を発揮します。' },
    { label: '気をつけたいこと', text: '熱しやすく冷めやすい一面があります。一つのことを継続させる仕組みを作ることが、開運の鍵となります。' },
    { label: '今後の運勢ヒント', text: '夏の時期に運気が高まる傾向があります。直感で動いたことが、予想以上の結果を生む可能性があります。杏月先生に詳しい時期を確認しましょう。' }
  ],
  '土': [
    { label: '本来の姿', text: '安定感と誠実さが最大の魅力。信頼される人として周囲から慕われ、縁の下の力持ちとして組織やコミュニティを支えます。' },
    { label: '対人関係', text: '誰に対しても分け隔てなく接することができ、長い付き合いを大切にします。あなたのそばにいると安心できると感じる人が多いでしょう。' },
    { label: '才能の方向', text: '継続力・調整力・サポート力に優れます。コーディネーター・経営管理・相談業などで、その才能が最大限に活きます。' },
    { label: '気をつけたいこと', text: '慎重すぎて行動が遅れることがあります。「完璧でなくてもまず一歩」という姿勢を意識すると、人生が大きく動き出します。' },
    { label: '今後の運勢ヒント', text: '土用の時期（季節の変わり目）に転換点が訪れやすい命式です。変化を恐れず柔軟に対応することが吉とでています。' }
  ],
  '金': [
    { label: '本来の姿', text: '強い意志と明確な価値観を持ち、筋の通った生き方を貫く人です。物事の本質を見抜く洞察力と、決断力の速さが際立ちます。' },
    { label: '対人関係', text: '正直で裏表がなく、信義を重んじます。好き嫌いはっきりしているため誤解されることもありますが、深く付き合うほど人から信頼されます。' },
    { label: '才能の方向', text: '分析力・判断力・実行力に優れます。経営・法律・金融・エンジニアリングなど、精密さが求められる分野で才能を発揮します。' },
    { label: '気をつけたいこと', text: '完璧主義になりすぎると自分も周囲も疲弊させてしまいます。「及第点でOK」の感覚を身につけることが心身の健康に繋がります。' },
    { label: '今後の運勢ヒント', text: '秋から冬にかけて実力が評価されやすい時期です。自分のこだわりを活かした勝負に出ることで、転機が生まれます。' }
  ],
  '水': [
    { label: '本来の姿', text: '深い知性と高い感受性を持ち、物事の本質を直感的に掴む能力があります。表面上は穏やかでも、内に秘めた熱い信念があります。' },
    { label: '対人関係', text: '場の空気を読む能力が高く、相手が求めることを察して動けます。深い関係性を好み、本当に信頼できる少数の仲間を大切にします。' },
    { label: '才能の方向', text: '情報収集・分析・研究・クリエイティブ系に強みがあります。「知ること」「深めること」を仕事にすると、驚くほどの才能が開花します。' },
    { label: '気をつけたいこと', text: '考えすぎて身動きが取れなくなることがあります。信頼できる人に相談しながら動くことで、悩みの渦から抜け出せます。' },
    { label: '今後の運勢ヒント', text: '冬〜春にかけて運気が上昇する命式です。長年温めてきたアイデアを形にし始める絶好のタイミングが近づいています。' }
  ]
};

// ===== 計算ロジック =====

/**
 * 旧暦節入り日（簡易版）：月柱の計算に使う節入り日
 * 実際は毎年変動するため、ここでは一般的な近似値を使用
 */
const SETSUIRI_DATES = [
  { month: 1, day: 6 },  // 小寒
  { month: 2, day: 4 },  // 立春
  { month: 3, day: 6 },  // 啓蟄
  { month: 4, day: 5 },  // 清明
  { month: 5, day: 6 },  // 立夏
  { month: 6, day: 6 },  // 芒種
  { month: 7, day: 7 },  // 小暑
  { month: 8, day: 7 },  // 立秋
  { month: 9, day: 8 },  // 白露
  { month: 10, day: 8 }, // 寒露
  { month: 11, day: 7 }, // 立冬
  { month: 12, day: 7 }, // 大雪
];

/** 年の天干インデックス（1984年=甲=0基準） */
function getYearGanIndex(year) {
  return ((year - 4) % 10 + 10) % 10;
}

/** 年の地支インデックス（1984年=子=0基準） */
function getYearZhiIndex(year) {
  return ((year - 4) % 12 + 12) % 12;
}

/** 月の天干インデックス */
function getMonthGanIndex(year, suimeiMonth) {
  const yearGan = getYearGanIndex(year);
  return ((yearGan % 5) * 2 + suimeiMonth - 1) % 10;
}

/** 推命月（節入りベースの月番号 1〜12）を取得 */
function getSuimeiMonth(month, day) {
  const setsu = SETSUIRI_DATES[month - 1];
  if (day < setsu.day) {
    return month === 1 ? 12 : month - 1;
  }
  return month;
}

/** 月の地支インデックス */
function getMonthZhiIndex(suimeiMonth) {
  // 寅(2)が1月節入り後の月柱始まり
  return ((suimeiMonth + 1) % 12);
}

/** 日の天干インデックス（ツェラー法ベースの簡易計算） */
function getDayGanIndex(year, month, day) {
  const base = new Date(1900, 0, 1); // 1900/1/1 = 甲(0)子(0)
  const target = new Date(year, month - 1, day);
  const diff = Math.floor((target - base) / (1000 * 60 * 60 * 24));
  return ((diff % 10) + 10) % 10;
}

/** 日の地支インデックス */
function getDayZhiIndex(year, month, day) {
  const base = new Date(1900, 0, 1);
  const target = new Date(year, month - 1, day);
  const diff = Math.floor((target - base) / (1000 * 60 * 60 * 24));
  return ((diff % 12) + 12) % 12;
}

/** 時の天干インデックス */
function getHourGanIndex(dayGan, hour) {
  if (hour < 0) return -1;
  const shiIndex = Math.floor((hour + 1) / 2) % 12;
  return ((dayGan % 5) * 2 + shiIndex) % 10;
}

/** 時の地支インデックス */
function getHourZhiIndex(hour) {
  if (hour < 0) return -1;
  return Math.floor((hour + 1) / 2) % 12;
}

/** 命式を計算して返す */
function calcMeishiki(year, month, day, hour) {
  const suimeiMonth = getSuimeiMonth(month, day);

  const yGan = getYearGanIndex(year);
  const yZhi = getYearZhiIndex(year);

  const mGan = getMonthGanIndex(year, suimeiMonth);
  const mZhi = getMonthZhiIndex(suimeiMonth);

  const dGan = getDayGanIndex(year, month, day);
  const dZhi = getDayZhiIndex(year, month, day);

  const hGan = getHourGanIndex(dGan, hour);
  const hZhi = getHourZhiIndex(hour);

  return {
    year:  { gan: yGan, zhi: yZhi },
    month: { gan: mGan, zhi: mZhi },
    day:   { gan: dGan, zhi: dZhi },
    hour:  { gan: hGan, zhi: hZhi }
  };
}

/** 五行スコアを集計して主属性を返す */
function calcGogyo(meishiki) {
  const scores = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  const cols = [meishiki.year, meishiki.month, meishiki.day, meishiki.hour];
  cols.forEach(col => {
    if (col.gan >= 0) scores[GAN_GOGYO[col.gan]] += 2;
    if (col.zhi >= 0) scores[ZHI_GOGYO[col.zhi]] += 1;
  });

  // 最大スコアの五行を主属性に
  let main = '木';
  let max = 0;
  for (const [k, v] of Object.entries(scores)) {
    if (v > max) { max = v; main = k; }
  }
  return { main, scores };
}

// ===== フォーム初期化 =====
function initForm() {
  const yearEl = document.getElementById('birth-year');
  const monthEl = document.getElementById('birth-month');
  const dayEl = document.getElementById('birth-day');
  const hourEl = document.getElementById('birth-hour');

  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 0; y >= 1924; y--) {
    const o = document.createElement('option');
    o.value = y; o.textContent = y;
    yearEl.appendChild(o);
  }
  yearEl.value = 1990;

  for (let m = 1; m <= 12; m++) {
    const o = document.createElement('option');
    o.value = m; o.textContent = m;
    monthEl.appendChild(o);
  }

  for (let d = 1; d <= 31; d++) {
    const o = document.createElement('option');
    o.value = d; o.textContent = d;
    dayEl.appendChild(o);
  }
  dayEl.value = 1;

  for (let h = 0; h <= 23; h++) {
    const o = document.createElement('option');
    o.value = h; o.textContent = `${h}:00〜${h}:59`;
    hourEl.appendChild(o);
  }

  // 性別ボタン
  document.querySelectorAll('.gender-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ===== 命式表を描画 =====
function renderMeishiki(meishiki) {
  const container = document.getElementById('meishiki-table');
  container.innerHTML = '';

  const cols = [meishiki.year, meishiki.month, meishiki.day, meishiki.hour];
  const labels = ['年柱', '月柱', '日柱', '時柱'];

  cols.forEach((col, i) => {
    const colEl = document.createElement('div');
    colEl.className = 'meishiki-col';

    // 天干セル
    const kanEl = document.createElement('div');
    kanEl.className = 'meishiki-cell cell-kan';
    if (col.gan >= 0) {
      kanEl.innerHTML = `<div class="kanji">${TIAN_GAN[col.gan]}</div><div class="kana">${TIAN_GAN_KANA[col.gan]}</div>`;
    } else {
      kanEl.innerHTML = `<div class="kanji" style="opacity:.3">不明</div>`;
    }

    // 地支セル
    const zhiEl = document.createElement('div');
    zhiEl.className = 'meishiki-cell cell-shi';
    if (col.zhi >= 0) {
      zhiEl.innerHTML = `<div class="kanji">${DI_ZHI[col.zhi]}</div><div class="kana">${DI_ZHI_KANA[col.zhi]}</div>`;
    } else {
      zhiEl.innerHTML = `<div class="kanji" style="opacity:.3">不明</div>`;
    }

    colEl.appendChild(kanEl);
    colEl.appendChild(zhiEl);
    container.appendChild(colEl);
  });
}

// ===== 属性カードを描画 =====
function renderAttribute(gogyo) {
  const info = GOGYO_INFO[gogyo.main];
  const container = document.getElementById('attribute-card');
  container.className = `card attribute-card ${info.bg}`;

  container.innerHTML = `
    <div class="attribute-symbol ${info.color}">${info.symbol}</div>
    <div class="attribute-info">
      <div class="attribute-badge ${info.badge}">主属性：${info.emoji}行</div>
      <h3 class="${info.color}">${info.name}</h3>
      <p>${info.desc}</p>
    </div>
  `;
}

// ===== 本質を描画 =====
function renderEssence(gogyo) {
  const templates = HONSHITSU_TEMPLATES[gogyo.main];
  const container = document.getElementById('essence-card');
  container.className = 'card essence-card';

  container.innerHTML = templates.map((t, i) => `
    <div class="essence-item">
      <div class="essence-num">${i + 1}</div>
      <div class="essence-text">
        <span class="essence-label">【${t.label}】</span><br>
        ${t.text}
      </div>
    </div>
  `).join('');
}

// ===== CTA ボタンリンク設定 =====
function setupCTA(name, gogyo) {
  const btn = document.getElementById('btn-cta');
  // 実際のURLに変更してください
  const params = new URLSearchParams({
    name: name,
    gogyo: gogyo.main,
    ref: 'suimei-simple'
  });
  btn.href = `https://example.com/ankitsu-sensei?${params.toString()}`;
}

// ===== メイン診断実行 =====
document.getElementById('btn-diagnose').addEventListener('click', () => {
  const name = document.getElementById('name').value.trim() || 'あなた';
  const year = parseInt(document.getElementById('birth-year').value);
  const month = parseInt(document.getElementById('birth-month').value);
  const day = parseInt(document.getElementById('birth-day').value);
  const hour = parseInt(document.getElementById('birth-hour').value);

  // 簡易バリデーション
  if (!year || !month || !day) {
    alert('生年月日を入力してください');
    return;
  }

  const meishiki = calcMeishiki(year, month, day, hour);
  const gogyo = calcGogyo(meishiki);

  renderMeishiki(meishiki);
  renderAttribute(gogyo);
  renderEssence(gogyo);
  setupCTA(name, gogyo);

  // ページ切り替え
  document.getElementById('step-input').classList.remove('active');
  document.getElementById('step-result').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== 戻るボタン =====
document.getElementById('btn-back').addEventListener('click', () => {
  document.getElementById('step-result').classList.remove('active');
  document.getElementById('step-input').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== 初期化実行 =====
initForm();
