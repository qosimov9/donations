/* ============================================================
   FOX DONAT — Telegram Mini App Frontend
   Connects to FastAPI backend via /api/* endpoints
   ============================================================ */

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#1a0f08");
  tg.setBackgroundColor("#1a0f08");
}

/* ──────────────────────────────────────────────────────────────
   API CLIENT
────────────────────────────────────────────────────────────── */
const API_BASE = "";  // same origin

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (tg?.initData) headers["X-Init-Data"] = tg.initData;
  const res = await fetch(API_BASE + path, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

/* ──────────────────────────────────────────────────────────────
   STATE
────────────────────────────────────────────────────────────── */
const state = {
  tab: "home",
  user: null,
  balance: 0,
  games: [],
  orders: [],
  // navigation
  activeGame: null,
  checkout: null,
  // local UI
  heroIndex: 0,
  query: "",
  topupAmount: 50000,
  topupMethod: "humo",
  notifications: true,
  selectedPack: null,
  step: "player",
  playerId: "",
  zoneId: "",
  promo: "",
  payMethod: null,
  showHowTo: false,
  seconds: 157,
  checking: true,
  timerInterval: null,
  checkTimeout: null,
  verifyTimeout: null,
  playerVerified: false,
  playerName: "",
  playerRegion: "",
};

/* ──────────────────────────────────────────────────────────────
   ICONS & HELPERS
────────────────────────────────────────────────────────────── */
const icons = {
  user: '<path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6"/><path d="M16 12h.01"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  scroll: '<path d="M15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9z"/><path d="M15 3v6h6"/><path d="M8 13h8M8 17h6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  xcircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  checkcircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><path d="M21 12H9"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  landmark: '<line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  loader: '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>',
};
const methodIcon = { balance: "wallet", uzcard: "card", atm: "landmark", abroad: "globe" };
const svg = (name, cls = "ic") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || ""}</svg>`;
const ru = (n) => Number(n).toLocaleString("ru-RU");
const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmtTime = (t) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

const heroSlides = [
  { game: "mobile-legends", title: "MOBILE LEGENDS", subtitle: "Скидка 10% на алмазы" },
  { game: "free-fire",      title: "FREE FIRE",      subtitle: "Бонус +5% на первый донат" },
  { game: "standoff-2",     title: "STANDOFF 2",     subtitle: "Золото по лучшей цене" },
];

const topUpMethods = [
  { id: "humo",  name: "HUMO",           hint: "Карта Узбекистана" },
  { id: "uzcard",name: "UZCARD",          hint: "Карта Узбекистана" },
  { id: "payme", name: "Payme",           hint: "Электронный кошелёк" },
  { id: "click", name: "Click",           hint: "Электронный кошелёк" },
  { id: "visa",  name: "Visa/Mastercard", hint: "Международная карта" },
];
const topUpPresets = [10000, 25000, 50000, 100000, 250000, 500000];
const checkoutMethods = [
  { id: "balance", name: "Оплатить с баланса",  hint: "Доступный баланс: {balance} UZS", needsBalance: true },
  { id: "uzcard",  name: "UZCARD / HUMO",        hint: "Оплатите на любую активную карту",  badge: { label: "Активно", tone: "active" } },
  { id: "atm",     name: "Банкомат",             hint: "Продолжение через оператора",        badge: { label: "Оператор", tone: "operator" } },
  { id: "abroad",  name: "Из-за границы",        hint: "Продолжение через оператора",        badge: { label: "Оператор", tone: "operator" } },
];
const mockCard = { brand: "UZCARD", number: "5614 6885 1351 2557", holder: "FOX DONAT SERVICE" };
const howToPaySteps = [
  "Сделайте перевод на указанную карту в течение заданного времени",
  "Укажите сумму точно (как ваша уникальная сумма)",
  "После оплаты нажмите кнопку «Я оплатил»",
  "Если вы укажете неверную сумму, ваш платёж не будет найден в системе",
  "Если срок истёк, нажмите «Получить новую сумму»",
];

/* ──────────────────────────────────────────────────────────────
   DOM REFS
────────────────────────────────────────────────────────────── */
const root     = document.getElementById("screen-root");
const bottomNav= document.getElementById("bottom-nav");
const toastEl  = document.getElementById("toast");
const toastText= document.getElementById("toast-text");
const loadingScreen = document.getElementById("loading-screen");
const loadingFill   = document.getElementById("loading-fill");

/* ──────────────────────────────────────────────────────────────
   TOAST
────────────────────────────────────────────────────────────── */
let toastTimer = null;
function notify(msg) {
  toastText.textContent = msg;
  toastEl.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2600);
}

/* ──────────────────────────────────────────────────────────────
   INIT — load data from API
────────────────────────────────────────────────────────────── */
async function init() {
  // Animate loading bar
  let pct = 0;
  const bar = setInterval(() => { pct = Math.min(pct + 15, 90); loadingFill.style.width = pct + "%"; }, 100);

  try {
    const [userData, balanceData, gamesData] = await Promise.all([
      apiFetch("/api/me"),
      apiFetch("/api/me/balance"),
      apiFetch("/api/games"),
    ]);
    state.user    = userData;
    state.balance = balanceData.balance;
    state.games   = gamesData;
    state.notifications = userData.notifications_enabled;

    // Load recent orders
    try { state.orders = await apiFetch("/api/orders"); } catch (_) {}
  } catch (e) {
    console.warn("API init failed, using demo mode:", e.message);
    // Demo fallback
    state.user  = { id: 1, first_name: tg?.initDataUnsafe?.user?.first_name || "Игрок", username: null };
    state.balance = 0;
    state.games = getDemoGames();
    state.orders = getDemoOrders();
  }

  clearInterval(bar);
  loadingFill.style.width = "100%";
  setTimeout(() => {
    loadingScreen.classList.add("hidden");
    render();
    manageHeroTimer();
  }, 300);
}

/* ──────────────────────────────────────────────────────────────
   DEMO DATA (fallback when no backend)
────────────────────────────────────────────────────────────── */
function getDemoGames() {
  return [
    { id: "mobile-legends", name: "MOBILE LEGENDS", category: "MOBA", image_url: "/static/images/games/moba.png", is_popular: true, requires_zone_id: true, packages: [
      { id: "ml-1", game_id: "mobile-legends", amount: "Weekly Diamond Pass", price: 38000, bonus: null, is_popular: true },
      { id: "ml-2", game_id: "mobile-legends", amount: "275 Алмазов", price: 65000, bonus: null, is_popular: true },
      { id: "ml-3", game_id: "mobile-legends", amount: "550+50 Алмазов", price: 120000, bonus: "+50", is_popular: false },
      { id: "ml-4", game_id: "mobile-legends", amount: "1100+150 Алмазов", price: 230000, bonus: "+150", is_popular: false },
    ]},
    { id: "pubg-mobile", name: "PUBG MOBILE", category: "Battle Royale", image_url: "/static/images/games/battle-royale.png", is_popular: true, requires_zone_id: false, packages: [
      { id: "pm-1", game_id: "pubg-mobile", amount: "60 UC", price: 25000, bonus: null, is_popular: false },
      { id: "pm-2", game_id: "pubg-mobile", amount: "325 UC", price: 115000, bonus: null, is_popular: true },
      { id: "pm-3", game_id: "pubg-mobile", amount: "660 UC", price: 225000, bonus: null, is_popular: false },
    ]},
    { id: "standoff-2", name: "STANDOFF 2", category: "Шутер", image_url: "/static/images/games/fps.png", is_popular: true, requires_zone_id: false, packages: [
      { id: "so-1", game_id: "standoff-2", amount: "120 Золота", price: 45000, bonus: null, is_popular: true },
      { id: "so-2", game_id: "standoff-2", amount: "280 Золота", price: 95000, bonus: null, is_popular: false },
    ]},
    { id: "free-fire", name: "FREE FIRE", category: "Battle Royale", image_url: "/static/images/games/survival.png", is_popular: true, requires_zone_id: false, packages: [
      { id: "ff-1", game_id: "free-fire", amount: "100 Алмазов", price: 27000, bonus: null, is_popular: false },
      { id: "ff-2", game_id: "free-fire", amount: "310 Алмазов", price: 80000, bonus: null, is_popular: true },
    ]},
    { id: "roblox", name: "ROBLOX", category: "Песочница", image_url: "/static/images/games/sandbox.png", is_popular: false, requires_zone_id: false, packages: [
      { id: "rb-1", game_id: "roblox", amount: "400 Robux", price: 65000, bonus: null, is_popular: false },
      { id: "rb-2", game_id: "roblox", amount: "800 Robux", price: 120000, bonus: null, is_popular: true },
    ]},
    { id: "steam", name: "STEAM", category: "Платформа", image_url: "/static/images/games/store.png", is_popular: false, requires_zone_id: false, packages: [
      { id: "st-1", game_id: "steam", amount: "$5 Steam", price: 65000, bonus: null, is_popular: false },
      { id: "st-2", game_id: "steam", amount: "$10 Steam", price: 125000, bonus: null, is_popular: true },
    ]},
  ];
}
function getDemoOrders() {
  return [
    { id: 10428, game_id: "mobile-legends", game_name: "MOBILE LEGENDS", package_amount: "275 алмазов", price: 65000, status: "success",    player_id: "1478597521", created_at: new Date(Date.now()-7200000).toISOString() },
    { id: 10427, game_id: "pubg-mobile",    game_name: "PUBG MOBILE",    package_amount: "325 UC",      price: 115000, status: "success",   player_id: "7891234560", created_at: new Date(Date.now()-86400000).toISOString() },
    { id: 10426, game_id: "standoff-2",     game_name: "STANDOFF 2",     package_amount: "280 Золота",  price: 95000, status: "processing", player_id: "4561230987", created_at: new Date(Date.now()-172800000).toISOString() },
  ];
}

/* ──────────────────────────────────────────────────────────────
   RENDER ROOT
────────────────────────────────────────────────────────────── */
function render() {
  bottomNav.classList.toggle("hidden", !!state.checkout);
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === state.tab));

  let html = "";
  if (state.checkout)       html = renderCheckout();
  else if (state.activeGame) html = renderGameDetail();
  else {
    switch (state.tab) {
      case "home":     html = renderHome(); break;
      case "games":    html = renderGames(); break;
      case "history":  html = renderHistory(); break;
      case "topup":    html = renderTopup(); break;
      case "settings": html = renderSettings(); break;
    }
  }
  root.innerHTML = html;
  root.scrollTop = 0;
  manageHeroTimer();
}

/* ──────────────────────────────────────────────────────────────
   SCREENS
────────────────────────────────────────────────────────────── */
function renderHome() {
  const popular = state.games.filter(g => g.is_popular);
  const firstName = state.user?.first_name || "Игрок";
  return `
  <header class="app-header">
    <div class="app-header-row">
      <button type="button" class="icon-btn" data-action="profile" aria-label="Профиль">${svg("user")}</button>
      <div class="balance-pill">
        <span class="tabular">${ru(state.balance)}</span>
        <span class="unit">UZS</span>
        <button type="button" class="plus" data-action="goto-topup" aria-label="Пополнить">${svg("plus")}</button>
      </div>
    </div>
    <p class="app-title">Привет, <span>${esc(firstName)}</span>!</p>
  </header>

  <div class="screen" style="gap:1.5rem; padding-top:0;">
    <!-- Hero carousel -->
    <div class="hero">
      <div class="hero-frame">
        ${heroSlides.map((s, i) => {
          const game = state.games.find(g => g.id === s.game);
          const img = game?.image_url || "/static/images/games/hero-banner.png";
          return `<div class="hero-slide ${i === state.heroIndex ? "active" : ""}">
            <img src="${esc(img)}" alt="${esc(s.title)}" loading="lazy" />
            <div class="overlay"></div>
            <div class="cap"><h2>${esc(s.title)}</h2><p>${esc(s.subtitle)}</p></div>
          </div>`;
        }).join("")}
      </div>
      <div class="hero-dots">
        ${heroSlides.map((_, i) => `<button type="button" data-dot="${i}" class="${i === state.heroIndex ? "active" : ""}" aria-label="Слайд ${i+1}"></button>`).join("")}
      </div>
    </div>

    <!-- Popular games -->
    <div>
      <p class="section-label" style="padding:0 1.25rem;">🔥 Популярные игры</p>
      <div class="game-grid">
        ${popular.map(g => `
        <div class="game-tile" data-game="${g.id}">
          <div class="thumb"><img src="${esc(g.image_url || "")}" alt="${esc(g.name)}" loading="lazy" /></div>
          <p class="name">${esc(g.name)}</p>
        </div>`).join("")}
      </div>
    </div>

    <!-- Recent orders -->
    ${state.orders.length ? `
    <div>
      <p class="section-label" style="padding:0 1.25rem;">📋 Последние заказы</p>
      <div style="padding:0 1.25rem; display:flex; flex-direction:column; gap:.5rem;">
        ${state.orders.slice(0, 3).map(o => renderOrderCard(o)).join("")}
      </div>
    </div>` : ""}
  </div>`;
}

function renderGames() {
  const q = state.query.toLowerCase();
  const filtered = q ? state.games.filter(g => g.name.toLowerCase().includes(q) || (g.category || "").toLowerCase().includes(q)) : state.games;
  return `
  <div class="screen">
    <div class="screen-head"><h1>Все игры</h1><p>Выберите игру для пополнения</p></div>
    <div class="search">
      ${svg("search")}
      <input id="game-search" type="search" placeholder="Поиск игр..." value="${esc(state.query)}" autocomplete="off" />
    </div>
    ${filtered.length ? `<div class="game-grid">
      ${filtered.map(g => `
      <div class="game-tile" data-game="${g.id}">
        <div class="thumb"><img src="${esc(g.image_url || "")}" alt="${esc(g.name)}" loading="lazy" /></div>
        <p class="name">${esc(g.name)}</p>
      </div>`).join("")}
    </div>` : `<div class="empty">Игры не найдены</div>`}
  </div>`;
}

function renderHistory() {
  const statusMap = {
    success:    { label: "Успешно",    cls: "ok",      icon: "checkcircle" },
    processing: { label: "В обработке",cls: "pending", icon: "clock" },
    failed:     { label: "Ошибка",     cls: "cancel",  icon: "xcircle" },
    cancelled:  { label: "Отменён",    cls: "cancel",  icon: "xcircle" },
  };
  return `
  <div class="screen">
    <div class="screen-head"><h1>История</h1><p>Ваши заказы и транзакции</p></div>
    ${state.orders.length ? `
    <div class="tx-list">
      ${state.orders.map(o => {
        const s = statusMap[o.status] || statusMap.processing;
        const dt = new Date(o.created_at);
        const dateStr = dt.toLocaleString("ru-RU", { day:"numeric", month:"long", hour:"2-digit", minute:"2-digit" });
        return `
        <div class="tx-card">
          <div class="tx-top">
            <div>
              <p class="tx-game">${esc(o.game_name)}</p>
              <p class="tx-item">${esc(o.package_amount)}</p>
            </div>
            <p class="tx-amount">${ru(o.price)} UZS</p>
          </div>
          <div class="tx-bottom">
            <p class="tx-date">${dateStr}</p>
            <span class="status ${s.cls}">${svg(s.icon)}${s.label}</span>
          </div>
        </div>`;
      }).join("")}
    </div>` : `
    <div class="empty-state">
      ${svg("scroll", "ic")}
      <p>Заказов пока нет</p>
      <p style="font-size:.75rem;">Выберите игру и сделайте первый донат</p>
    </div>`}
  </div>`;
}

function renderTopup() {
  return `
  <div class="screen">
    <div class="screen-head"><h1>Пополнить баланс</h1><p>Пополните и донатьте в любые игры</p></div>
    <div class="balance-card">
      <div class="ico">${svg("wallet")}</div>
      <div>
        <p class="lbl">Текущий баланс</p>
        <p class="val">${ru(state.balance)} UZS</p>
      </div>
    </div>
    <div>
      <p class="section-label">Сумма пополнения</p>
      <div class="preset-grid">
        ${topUpPresets.map(p => `<button type="button" class="preset ${state.topupAmount === p ? "active" : ""}" data-preset="${p}">${ru(p)}</button>`).join("")}
      </div>
      <input class="text-input mt-3" id="topup-input" inputmode="numeric" placeholder="Своя сумма" value="${state.topupAmount || ""}" />
    </div>
    <div>
      <p class="section-label">Способ оплаты</p>
      <div class="method-list">
        ${topUpMethods.map(m => `
        <button type="button" class="method ${state.topupMethod === m.id ? "active" : ""}" data-topup-method="${m.id}">
          <div><span class="name">${esc(m.name)}</span><span class="hint">${esc(m.hint)}</span></div>
          ${state.topupMethod === m.id ? `<span class="check">${svg("check")}</span>` : ""}
        </button>`).join("")}
      </div>
    </div>
    <button type="button" class="btn-primary" data-action="do-topup" ${!state.topupAmount ? "disabled" : ""}>
      Пополнить на ${state.topupAmount ? ru(state.topupAmount) : 0} UZS
    </button>
  </div>`;
}

function renderSettings() {
  const u = state.user;
  const name = u ? `${u.first_name}${u.last_name ? " " + u.last_name : ""}` : "—";
  const username = u?.username ? `@${u.username}` : "Telegram ID";
  return `
  <div class="screen">
    <div class="screen-head"><h1>Настройки</h1></div>
    <div class="profile-card">
      <div class="avatar">${svg("user")}</div>
      <div>
        <p class="pname">${esc(name)}</p>
        <p class="pmeta">${esc(username)}</p>
      </div>
    </div>
    <div>
      <p class="section-label">Аккаунт</p>
      <div class="list-card">
        <div class="list-row">
          <div class="left">${svg("wallet")} Баланс</div>
          <div class="right"><span>${ru(state.balance)} UZS</span>${svg("chevronRight")}</div>
        </div>
        <div class="list-row">
          <div class="left">${svg("scroll")} Мои заказы</div>
          <div class="right"><span>${state.orders.length}</span>${svg("chevronRight")}</div>
        </div>
      </div>
    </div>
    <div>
      <p class="section-label">Предпочтения</p>
      <div class="list-card">
        <button type="button" class="list-row" data-action="toggle-notif">
          <div class="left">${svg("bell")} Уведомления</div>
          <div class="right">
            <div class="toggle ${state.notifications ? "on" : ""}"><div class="knob"></div></div>
          </div>
        </button>
        <div class="list-row">
          <div class="left">${svg("globe")} Язык</div>
          <div class="right"><span>Русский</span>${svg("chevronRight")}</div>
        </div>
        <div class="list-row">
          <div class="left">${svg("shield")} Безопасность</div>
          <div class="right">${svg("chevronRight")}</div>
        </div>
      </div>
    </div>
    <div>
      <p class="section-label">Поддержка</p>
      <div class="list-card">
        <div class="list-row">
          <div class="left">${svg("help")} Помощь</div>
          <div class="right">${svg("chevronRight")}</div>
        </div>
        <div class="list-row">
          <div class="left">${svg("info")} О приложении</div>
          <div class="right"><span style="font-size:.75rem;">v1.0.0</span></div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ──────────────────────────────────────────────────────────────
   GAME DETAIL
────────────────────────────────────────────────────────────── */
function renderGameDetail() {
  const game = state.activeGame;
  const pkgs = game.packages || [];
  return `
  <div class="screen">
    <button type="button" class="detail-back" data-action="detail-back">${svg("chevronLeft")} Назад</button>
    <div class="detail-hero">
      <div class="thumb"><img src="${esc(game.image_url || "")}" alt="${esc(game.name)}" /></div>
      <div>
        <h1>${esc(game.name)}</h1>
        <p>${esc(game.category || "")}</p>
      </div>
    </div>
    <div>
      <p class="section-label">Выберите пакет</p>
      <div class="pack-grid">
        ${pkgs.map(p => {
          const active = state.selectedPack === p.id;
          return `<button type="button" class="pack ${active ? "active" : ""}" data-pack="${p.id}">
            <span class="amount">${esc(p.amount)}</span>
            <span class="price">${ru(p.price)} UZS</span>
            ${p.bonus && !active ? `<span class="bonus">${esc(p.bonus)}</span>` : ""}
            ${active ? `<span class="pcheck">${svg("check")}</span>` : ""}
          </button>`;
        }).join("")}
      </div>
    </div>
    <button type="button" class="btn-primary" data-action="detail-continue" ${state.selectedPack ? "" : "disabled"}>
      Продолжить ${state.selectedPack ? "— " + ru(pkgs.find(p => p.id === state.selectedPack)?.price || 0) + " UZS" : ""}
    </button>
  </div>`;
}

/* ──────────────────────────────────────────────────────────────
   CHECKOUT FLOW
────────────────────────────────────────────────────────────── */
function renderCheckout() {
  const { game, pack } = state.checkout;
  const idOk = state.playerId.trim().length >= 6 && (!game.requires_zone_id || state.zoneId.trim().length >= 3);
  let body = "";

  if (state.step === "player") {
    body = `
    <div class="checkout-body">
      <h1>Данные игрока</h1>
      ${orderCard(game, pack)}
      <div>
        <p class="field-label">ID Игрока</p>
        <div class="field">
          <input id="player-id" inputmode="numeric" value="${esc(state.playerId)}" placeholder="Введите ваш игровой ID" />
          <span class="help">${svg("help")}</span>
        </div>
      </div>
      ${game.requires_zone_id ? `
      <div>
        <p class="field-label">ID Зоны</p>
        <div class="field">
          <input id="zone-id" inputmode="numeric" value="${esc(state.zoneId)}" placeholder="Введите ID зоны" />
          <span class="help">${svg("help")}</span>
        </div>
      </div>` : ""}
      ${state.playerVerified ? `
      <div class="id-found">
        <p class="ttl">✅ ID Игрока найден</p>
        <div class="tags">
          <span class="tag-outline">${esc(state.playerName)}</span>
          <span class="tag-fill">REGION: ${esc(state.playerRegion)}</span>
        </div>
      </div>` : (state.verifyTimeout ? `<p style="font-size:.875rem;color:var(--muted-foreground);text-align:center;">${svg("loader")} Проверяем ID...</p>` : "")}
      <button type="button" class="btn-primary" data-action="ck-to-method" ${idOk ? "" : "disabled"}>Продолжить</button>
    </div>`;
  } else if (state.step === "method") {
    body = `
    <div class="checkout-body">
      <h1>Оплата товара<span class="sub">${esc(game.name)}</span></h1>
      ${orderCard(game, pack)}
      <div>
        <p class="field-label">Промокод</p>
        <div class="promo-row">
          <input id="promo" value="${esc(state.promo)}" placeholder="Введите код" />
          <button type="button" data-action="apply-promo">Применить</button>
        </div>
      </div>
      <div>
        <p class="field-label">Способ оплаты</p>
        <div style="display:flex;flex-direction:column;gap:.75rem;">
          ${checkoutMethods.map(m => {
            const active = state.payMethod === m.id;
            const disabled = m.needsBalance && state.balance < pack.price;
            const hint = m.hint.replace("{balance}", ru(state.balance));
            const foot = disabled ? "Баланс недостаточен" : m.needsBalance ? "Оплата мгновенно" : "Будет выдана одна назначенная карта";
            return `<button type="button" class="method-big ${active ? "active" : ""}" data-pay-method="${m.id}">
              <div class="row">
                <span class="ico">${svg(methodIcon[m.id] || "card")}</span>
                <div class="info">
                  <div class="top"><p class="nm">${esc(m.name)}</p>${m.badge ? `<span class="badge ${m.badge.tone}">${esc(m.badge.label)}</span>` : ""}</div>
                  <p class="ht">${esc(hint)}</p>
                </div>
              </div>
              <div class="foot"><span>${foot}</span>${svg("chevronRight")}</div>
            </button>`;
          }).join("")}
        </div>
      </div>
      <div class="total-card"><p class="lbl">Итоговая сумма:</p><p class="val">${ru(pack.price)} UZS</p></div>
      <button type="button" class="btn-primary" data-action="ck-confirm-method" ${state.payMethod ? "" : "disabled"}>Продолжить</button>
      <button type="button" class="btn-secondary" data-action="ck-to-player">Назад</button>
    </div>`;
  } else if (state.step === "card") {
    const danger = state.seconds <= 30 && state.seconds > 0;
    body = `
    <div class="checkout-body">
      <h1>Оплата картой</h1>
      <div class="warn">${svg("alert")}<div><p class="ttl">Важно!</p><p>Переведите точную сумму, иначе платёж не будет найден</p></div></div>
      <div class="timer-card">
        <span class="lft">${svg("clock")} ${state.seconds > 0 ? "Слот активен" : "Слот истёк"}</span>
        <span class="time ${danger ? "danger" : ""}" id="ck-timer">${fmtTime(state.seconds)}</span>
      </div>
      <div class="card-head">
        <p>Назначенная карта для перевода</p>
        <button type="button" class="how-link" data-action="show-howto">${svg("help")} Как оплатить?</button>
      </div>
      <div class="pay-card">
        <p class="brand">${esc(mockCard.brand)}</p>
        <p class="num">${esc(mockCard.number)}</p>
        <div class="foot">
          <p class="holder">${esc(mockCard.holder)}</p>
          <button type="button" class="copy-btn" data-action="copy-card">${svg("copy")}</button>
        </div>
      </div>
      <div class="sum-card">
        <p class="sum">${ru(pack.price)} UZS</p>
        <button type="button" data-action="copy-sum">Скопировать</button>
      </div>
      <button type="button" class="btn-primary" data-action="ck-to-status" ${state.seconds <= 0 ? "disabled" : ""}>Я оплатил</button>
      ${state.seconds <= 0 ? `<button type="button" class="btn-secondary" data-action="ck-new-sum">Получить новую сумму</button>` : ""}
    </div>`;
  } else if (state.step === "status") {
    body = `
    <div class="status-step">
      <span class="status-ico ${state.checking ? "checking" : "done"}">${state.checking ? svg("clock") : svg("check")}</span>
      ${state.checking ? `
        <p>Пожалуйста, ожидайте</p>
        <h1>Проверяем оплату</h1>
        <p>Это займёт несколько секунд</p>
      ` : `
        <h1>Оплата подтверждена!</h1>
        <p>${esc(pack.amount)} в ${esc(game.name)} зачислено</p>
      `}
      <div class="status-actions">
        ${state.checking
          ? `<button type="button" class="btn-primary" data-action="ck-force-done">${svg("refresh")} Обновить статус</button>`
          : `<button type="button" class="btn-primary" data-action="ck-paid">Готово</button>`}
        <button type="button" class="btn-secondary" data-action="ck-orders">${svg("bag")} Мои заказы</button>
      </div>
    </div>`;
  }

  const modal = state.showHowTo ? `
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-head"><h2>Как оплатить?</h2><button type="button" class="close-btn" data-action="hide-howto">${svg("x")}</button></div>
      <ol class="steps">${howToPaySteps.map((s, i) => `<li><span class="n">${i+1}.</span><span>${esc(s)}</span></li>`).join("")}</ol>
      <button type="button" class="btn-primary" style="margin-top:1.25rem;" data-action="hide-howto">Понятно</button>
    </div>
  </div>` : "";

  return `
  <header class="checkout-head">
    <button type="button" class="back-link" data-action="ck-back">${svg("chevronLeft")} Назад</button>
    <button type="button" class="close-btn" data-action="ck-close">${svg("x")}</button>
  </header>
  ${body}
  ${modal}`;
}

function orderCard(game, pack) {
  return `<div class="order-card">
    <div class="thumb"><img src="${esc(game.image_url || "")}" alt="${esc(game.name)}" /></div>
    <div>
      <p class="amt">${esc(pack.amount)}</p>
      <p class="reg">${esc(game.name)}</p>
      <p class="prc">${ru(pack.price)} UZS</p>
    </div>
  </div>`;
}

function renderOrderCard(o) {
  const statusMap = { success: "ok", processing: "pending", failed: "cancel", cancelled: "cancel" };
  const cls = statusMap[o.status] || "pending";
  const dt = new Date(o.created_at);
  const dateStr = dt.toLocaleString("ru-RU", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });
  return `<div class="tx-card">
    <div class="tx-top">
      <div><p class="tx-game">${esc(o.game_name)}</p><p class="tx-item">${esc(o.package_amount)}</p></div>
      <p class="tx-amount">${ru(o.price)} UZS</p>
    </div>
    <div class="tx-bottom">
      <p class="tx-date">${dateStr}</p>
      <span class="status ${cls}">${svg(cls === "ok" ? "checkcircle" : cls === "cancel" ? "xcircle" : "clock")}
        ${o.status === "success" ? "Успешно" : o.status === "processing" ? "В обработке" : "Отменён"}
      </span>
    </div>
  </div>`;
}

/* ──────────────────────────────────────────────────────────────
   HERO TIMER
────────────────────────────────────────────────────────────── */
let heroTimer = null;
function manageHeroTimer() {
  if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
  if (!state.checkout && !state.activeGame && state.tab === "home") {
    heroTimer = setInterval(() => {
      state.heroIndex = (state.heroIndex + 1) % heroSlides.length;
      document.querySelectorAll(".hero-slide").forEach((el, i) => el.classList.toggle("active", i === state.heroIndex));
      document.querySelectorAll(".hero-dots button").forEach((el, i) => el.classList.toggle("active", i === state.heroIndex));
    }, 4000);
  }
}

/* ──────────────────────────────────────────────────────────────
   TIMERS
────────────────────────────────────────────────────────────── */
function clearCheckoutTimers() {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  if (state.checkTimeout)  { clearTimeout(state.checkTimeout);   state.checkTimeout = null; }
}

function startCardTimer() {
  clearCheckoutTimers();
  state.timerInterval = setInterval(() => {
    state.seconds = Math.max(0, state.seconds - 1);
    const t = document.getElementById("ck-timer");
    if (t) {
      t.textContent = fmtTime(state.seconds);
      t.classList.toggle("danger", state.seconds <= 30 && state.seconds > 0);
    }
    if (state.seconds <= 0) { clearInterval(state.timerInterval); state.timerInterval = null; render(); }
  }, 1000);
}

function startStatusCheck(orderId) {
  clearCheckoutTimers();
  state.checking = true;
  if (orderId) {
    // Poll real API
    const poll = async () => {
      try {
        const res = await apiFetch(`/api/orders/${orderId}/status`);
        if (res.status === "success") { state.checking = false; render(); return; }
        if (res.status === "failed")  { state.checking = false; notify("Ошибка доставки"); render(); return; }
      } catch (_) {}
      state.checkTimeout = setTimeout(poll, 3000);
    };
    poll();
  } else {
    state.checkTimeout = setTimeout(() => { state.checking = false; render(); }, 3500);
  }
}

/* ──────────────────────────────────────────────────────────────
   ACTIONS
────────────────────────────────────────────────────────────── */
function changeTab(t) {
  state.activeGame = null; state.checkout = null; clearCheckoutTimers(); state.tab = t; render();
}

function selectGame(id) {
  const game = state.games.find(g => g.id === id);
  if (!game) return;
  // Load packages if not loaded
  if (!game.packages || game.packages.length === 0) {
    apiFetch(`/api/games/${id}/packages`).then(pkgs => {
      game.packages = pkgs; render();
    }).catch(() => {});
  }
  state.activeGame = game; state.selectedPack = null; render();
}

async function completePurchase() {
  if (!state.checkout) return;
  const { game, pack } = state.checkout;

  // If paid with balance, create order via API
  if (state.payMethod === "balance") {
    try {
      const order = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          game_id: game.id,
          package_id: state.selectedPack || pack.id,
          player_id: state.playerId,
          zone_id: state.zoneId || null,
          payment_method: "balance",
          promo_code: state.promo || null,
        }),
      });
      state.balance -= pack.price;
      state.orders.unshift(order);
      notify(`Заказ оформлен: ${pack.amount} в ${game.name}`);
    } catch (e) {
      notify("Ошибка: " + e.message);
      return;
    }
  } else {
    notify(`Заказ оформлен: ${pack.amount} в ${game.name}`);
  }

  state.checkout = null; clearCheckoutTimers(); state.tab = "history"; render();
}

function copyText(text, label) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => notify(`${label} скопирована`), () => notify("Ошибка копирования"));
  } else {
    notify(`${label} скопирована`);
  }
}

/* ──────────────────────────────────────────────────────────────
   PLAYER VERIFICATION (debounced)
────────────────────────────────────────────────────────────── */
function scheduleVerify() {
  if (state.verifyTimeout) clearTimeout(state.verifyTimeout);
  state.playerVerified = false;
  const gameId = state.activeGame?.id || state.checkout?.game?.id;
  if (!gameId || state.playerId.trim().length < 6) { render(); return; }
  state.verifyTimeout = setTimeout(async () => {
    try {
      const res = await apiFetch(`/api/games/${gameId}/verify-player`, {
        method: "POST",
        body: JSON.stringify({ player_id: state.playerId, zone_id: state.zoneId || null }),
      });
      state.playerVerified = res.found;
      state.playerName = res.player_name || "";
      state.playerRegion = res.region || "";
    } catch (_) {
      state.playerVerified = state.playerId.length >= 6;
      state.playerName = `Player_${state.playerId.slice(-4)}`;
      state.playerRegion = "UZ";
    }
    state.verifyTimeout = null;
    render();
  }, 800);
}

/* ──────────────────────────────────────────────────────────────
   EVENT DELEGATION
────────────────────────────────────────────────────────────── */
bottomNav.addEventListener("click", e => {
  const btn = e.target.closest(".nav-btn");
  if (btn) changeTab(btn.dataset.tab);
});

root.addEventListener("click", e => {
  const game = e.target.closest("[data-game]");
  if (game) { selectGame(game.dataset.game); return; }

  const dot = e.target.closest("[data-dot]");
  if (dot) { state.heroIndex = Number(dot.dataset.dot); manageHeroTimer(); render(); return; }

  const preset = e.target.closest("[data-preset]");
  if (preset) { state.topupAmount = Number(preset.dataset.preset); render(); return; }

  const tm = e.target.closest("[data-topup-method]");
  if (tm) { state.topupMethod = tm.dataset.topupMethod; render(); return; }

  const pack = e.target.closest("[data-pack]");
  if (pack) { state.selectedPack = pack.dataset.pack; render(); return; }

  const pm = e.target.closest("[data-pay-method]");
  if (pm) {
    const id = pm.dataset.payMethod;
    if (id === "balance" && state.balance < state.checkout?.pack?.price) {
      notify("Баланс недостаточен. Пополните счёт."); return;
    }
    state.payMethod = id; render(); return;
  }

  const act = e.target.closest("[data-action]");
  if (act) handleAction(act.dataset.action);
});

root.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "game-search") {
    state.query = t.value;
    const pos = t.selectionStart; render();
    const again = document.getElementById("game-search");
    if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (_) {} }
  } else if (t.id === "topup-input") {
    state.topupAmount = Number(t.value.replace(/\D/g, ""));
    const btn = root.querySelector('[data-action="do-topup"]');
    if (btn) { btn.textContent = `Пополнить на ${state.topupAmount ? ru(state.topupAmount) : 0} UZS`; btn.disabled = !state.topupAmount; }
    root.querySelectorAll("[data-preset]").forEach(b => b.classList.toggle("active", Number(b.dataset.preset) === state.topupAmount));
  } else if (t.id === "player-id") {
    state.playerId = t.value; scheduleVerify();
  } else if (t.id === "zone-id") {
    state.zoneId = t.value; scheduleVerify();
  } else if (t.id === "promo") {
    state.promo = t.value;
  }
});

function handleAction(action) {
  const ck = state.checkout;
  switch (action) {
    case "profile": changeTab("settings"); break;
    case "goto-topup": changeTab("topup"); break;

    case "do-topup": {
      const amt = state.topupAmount;
      if (!amt || amt <= 0) break;
      apiFetch("/api/topup", { method: "POST", body: JSON.stringify({ amount: amt, payment_method: state.topupMethod }) })
        .then(res => {
          if (res.status === "credited") {
            state.balance = res.balance;
            notify(`Баланс пополнен на ${ru(amt)} UZS`);
            state.tab = "home"; render();
          } else {
            // redirect to payment URL
            if (res.payment_url && tg) tg.openLink(res.payment_url);
            else notify("Перейдите к оплате");
          }
        })
        .catch(e => notify("Ошибка: " + e.message));
      break;
    }

    case "toggle-notif":
      state.notifications = !state.notifications; render(); break;

    case "detail-back":
      state.activeGame = null; render(); break;

    case "detail-continue": {
      const game = state.activeGame;
      const pkg = (game.packages || []).find(p => p.id === state.selectedPack);
      if (!pkg) break;
      state.checkout = { game, pack: { id: pkg.id, amount: pkg.amount, price: pkg.price, bonus: pkg.bonus } };
      state.activeGame = null;
      state.step = "player"; state.playerId = ""; state.zoneId = "";
      state.promo = ""; state.payMethod = null; state.showHowTo = false;
      state.seconds = 157; state.checking = true;
      state.playerVerified = false; state.playerName = ""; state.playerRegion = "";
      render();
      break;
    }

    case "ck-back":
      if (!ck) break;
      if (state.step === "player") { state.checkout = null; clearCheckoutTimers(); }
      else if (state.step === "method") state.step = "player";
      else if (state.step === "card")   { state.step = "method"; clearCheckoutTimers(); }
      else state.step = "card";
      if (state.step === "card") startCardTimer();
      render(); break;

    case "ck-close":
      state.checkout = null; clearCheckoutTimers(); render(); break;

    case "ck-to-method":
      state.step = "method"; render(); break;

    case "ck-to-player":
      state.step = "player"; render(); break;

    case "apply-promo":
      notify(state.promo.trim() ? "Промокод применён" : "Введите промокод"); break;

    case "ck-confirm-method":
      if (!state.payMethod) break;
      if (state.payMethod === "balance") { completePurchase(); break; }
      state.seconds = 157; state.step = "card"; render(); startCardTimer(); break;

    case "ck-to-status":
      if (state.seconds <= 0) break;
      state.step = "status"; clearCheckoutTimers(); render(); startStatusCheck(ck?.orderId); break;

    case "ck-new-sum":
      state.seconds = 157; render(); startCardTimer(); break;

    case "show-howto": state.showHowTo = true; render(); break;
    case "hide-howto": state.showHowTo = false; render(); break;

    case "copy-card": copyText(mockCard.number.replace(/\s/g, ""), "Карта"); break;
    case "copy-sum":  copyText(String(ck?.pack?.price || ""), "Сумма"); break;

    case "ck-force-done":
      state.checking = false; clearCheckoutTimers(); notify("Оплата подтверждена"); render(); break;

    case "ck-paid":
      completePurchase(); break;

    case "ck-orders":
      state.checkout = null; clearCheckoutTimers(); state.tab = "history"; render(); break;
  }
}

/* ──────────────────────────────────────────────────────────────
   BOOT
────────────────────────────────────────────────────────────── */
init();
