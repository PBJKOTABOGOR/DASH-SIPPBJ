const APP_ROUTES = {
  dashboard: {
    title: 'Dashboard SIPPBJ',
    subtitle: 'Ringkasan informasi utama untuk monitoring dan analisis pengadaan.',
    type: 'internal'
  },

  'monitoring-sirup': {
    title: 'Monitoring SiRUP',
    subtitle: 'Monitoring paket perencanaan yang diumumkan di SIRUP dan indikator ITKP SIRUP.',
    type: 'module',
    html: 'modules/monitoring/itkp-sirup/itkp-sirup.html',
    css: 'modules/monitoring/itkp-sirup/itkp-sirup.css',
    js: 'modules/monitoring/itkp-sirup/itkp-sirup.js'
  },

  'monitoring-ekatalog': {
    title: 'Monitoring eKatalog',
    subtitle: 'Halaman ini disiapkan untuk monitoring indikator pemanfaatan eKatalog.',
    type: 'module',
    html: 'modules/monitoring/itkp-ekatalog/itkp-ekatalog.html',
    css: 'modules/monitoring/itkp-ekatalog/itkp-ekatalog.css',
    js: 'modules/monitoring/itkp-ekatalog/itkp-ekatalog.js'
  },

  'monitoring-etendering': {
    title: 'Monitoring eTendering',
    subtitle: 'Halaman ini disiapkan untuk monitoring indikator pemanfaatan eTendering.',
    type: 'module',
    html: 'modules/monitoring/itkp-etendering/itkp-etendering.html',
    css: 'modules/monitoring/itkp-etendering/itkp-etendering.css',
    js: 'modules/monitoring/itkp-etendering/itkp-etendering.js'
  },

  'monitoring-ekontrak': {
    title: 'Monitoring eKontrak',
    subtitle: 'Halaman ini disiapkan untuk monitoring indikator pemanfaatan eKontrak.',
    type: 'module',
    html: 'modules/monitoring/itkp-ekontrak/itkp-ekontrak.html',
    css: 'modules/monitoring/itkp-ekontrak/itkp-ekontrak.css',
    js: 'modules/monitoring/itkp-ekontrak/itkp-ekontrak.js'
  },

  'monitoring-nontender': {
    title: 'Non eTendering/Non ePurchasing',
    subtitle: 'Monitoring realisasi paket Non Tender dan capaian ITKP perangkat daerah.',
    type: 'module',
    html: 'modules/monitoring/itkp-nontender/itkp-nontender.html',
    css: 'modules/monitoring/itkp-nontender/itkp-nontender.css',
    js: 'modules/monitoring/itkp-nontender/itkp-nontender.js'
  },

  'rapor-pbj': {
    title: 'Rapor PBJ',
    subtitle: 'Portal laporan Rapor PBJ perangkat daerah.',
    type: 'module',
    html: 'modules/rapor-pbj/rapor-pbj.html',
    css: 'modules/rapor-pbj/rapor-pbj.css',
    js: 'modules/rapor-pbj/rapor-pbj.js',
    externalScripts: [
      'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js'
    ]
  },

  'monitoring-perencanaan': {
    title: 'Monitoring Realisasi',
    subtitle: 'Pemantauan progres realisasi paket pengadaan perangkat daerah.',
    type: 'module',
    html: 'modules/monitoring/perencanaan/monitoring.html',
    css: 'modules/monitoring/perencanaan/monitoring.css',
    js: 'modules/monitoring/perencanaan/monitoring.js',
    externalScripts: [
      'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js'
    ]
  },

'monitoring-konsolidasi': {
  title: 'Monitoring Paket Konsolidasi',
  subtitle: '',
  type: 'iframe',
  url: 'https://pbjkotabogor.github.io/atk-monitoring/',
  fullPage: true
},

  'pemenang-pengadaan': {
    title: 'Pemenang Pengadaan',
    subtitle: 'Portal pencarian paket penyedia dan paket pengadaan aktif.',
    type: 'module',
    html: 'modules/pemenang-pengadaan/pemenang-pengadaan.html',
    css: 'modules/pemenang-pengadaan/pemenang-pengadaan.css',
    js: 'modules/pemenang-pengadaan/pemenang-pengadaan.js'
  },

  'simulasi-procurement-stacker': {
    title: 'Procurement Stacker',
    subtitle: 'Game edukasi interaktif untuk memahami alur, metode, risiko, adendum, dan keputusan PBJ.',
    type: 'module',
    html: 'modules/simulasi/procurement-stacker/procurement-stacker.html',
    css: 'modules/simulasi/procurement-stacker/procurement-stacker.css',
    js: 'modules/simulasi/procurement-stacker/procurement-stacker.js'
  },

  'simulasi-timeline': {
    title: 'Simulasi Timeline Pengadaan',
    subtitle: 'Simulasi penyusunan timeline pengadaan barang dan jasa.',
    type: 'module',
    html: 'modules/timeline/simulasi-timeline.html',
    css: 'modules/timeline/simulasi-timeline.css',
    js: 'modules/timeline/simulasi-timeline.js'
  },

  'simulasi-nontender': {
    title: 'Pencatatan Non Tender',
    subtitle: 'Simulasi PPK untuk pencatatan paket non tender.',
    type: 'iframe',
    url: 'https://pbjkotabogor.github.io/SIMPPK/login.html'
  },

  'rapor-pbj-input-internal': {
    title: 'Input Rapor PBJ',
    subtitle: 'Form internal pegawai untuk input dan upload dokumen Rapor PBJ.',
    type: 'iframe',
    url: 'https://script.google.com/macros/s/AKfycbx7r228pPRdeO6egj_6bDsJu0-V4TY64XiQOG0sZCjhTLexaUV-oqk3PJCKpc3oSsIbTA/exec?embed=1'
  },

  'rapor-pbj-qc-internal': {
    title: 'QC Rapor PBJ',
    subtitle: 'Panel internal QC untuk review dan persetujuan rapor.',
    type: 'iframe',
    url: 'https://script.google.com/macros/s/AKfycbx7r228pPRdeO6egj_6bDsJu0-V4TY64XiQOG0sZCjhTLexaUV-oqk3PJCKpc3oSsIbTA/exec?page=qc&embed=1'
  }
};

const contentArea = document.getElementById('contentArea');
const sidebar = document.getElementById('sidebar');
const sidebarToggleButton = document.getElementById('sidebarToggleButton');

const secretTrigger = document.getElementById('secretTrigger');
const secretLoginOverlay = document.getElementById('secretLoginOverlay');
const secretLoginForm = document.getElementById('secretLoginForm');
const secretUsername = document.getElementById('secretUsername');
const secretPassword = document.getElementById('secretPassword');
const secretLoginError = document.getElementById('secretLoginError');
const secretLoginCancel = document.getElementById('secretLoginCancel');
const secretLoginToast = document.getElementById('secretLoginToast');
const internalNavGroup = document.getElementById('internalNavGroup');
const SECRET_LOGIN_USER = 'admin';
const SECRET_LOGIN_PASS = 'adminpbjkota123#';
const SECRET_SESSION_KEY = 'sippbj_internal_menu_unlocked';
let secretTriggerCount = 0;
let secretTriggerTimer = null;

let activeModuleToken = 0;
let currentModuleDestroy = null;
let activeFlyout = null;
let activePageKey = '';
let loadingPageKey = '';
let scrollAnimationDestroy = null;

let dashboardBootShownThisSession = false;
let dashboardBootOverlayEl = null;
let dashboardBootProgressTimer = null;

function ensureDashboardBootOverlay() {
  if (dashboardBootOverlayEl && document.body.contains(dashboardBootOverlayEl)) {
    return dashboardBootOverlayEl;
  }

  if (!document.getElementById('dashboardBootOverlayStyle')) {
    const style = document.createElement('style');
    style.id = 'dashboardBootOverlayStyle';
    style.textContent = `
      .dashboard-boot-overlay{
        position:fixed;
        inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:24px;
        background:rgba(239,244,251,.58);
        backdrop-filter:blur(10px);
        -webkit-backdrop-filter:blur(10px);
        z-index:999999;
        opacity:0;
        pointer-events:none;
        transition:opacity .28s ease;
      }
      .dashboard-boot-overlay.show{
        opacity:1;
        pointer-events:auto;
      }
      .dashboard-boot-card{
        width:min(100%, 380px);
        border-radius:26px;
        padding:18px 18px 16px;
        color:#fff;
        background:linear-gradient(135deg,#123a72 0%,#245a9b 58%,#2f9a8f 100%);
        box-shadow:0 26px 60px rgba(18,58,114,.24);
        border:1px solid rgba(255,255,255,.16);
      }
      .dashboard-boot-kicker{
        display:inline-flex;
        align-items:center;
        min-height:22px;
        padding:0 10px;
        border-radius:999px;
        background:rgba(255,255,255,.14);
        border:1px solid rgba(255,255,255,.18);
        color:rgba(255,255,255,.92);
        font-size:10px;
        font-weight:900;
        letter-spacing:.08em;
        text-transform:uppercase;
      }
      .dashboard-boot-title{
        margin:12px 0 6px;
        font-size:18px;
        font-weight:900;
        line-height:1.15;
      }
      .dashboard-boot-text{
        margin:0;
        font-size:12px;
        line-height:1.55;
        color:rgba(255,255,255,.86);
      }
      .dashboard-boot-progress-row{
        display:grid;
        grid-template-columns:1fr auto;
        gap:12px;
        align-items:center;
        margin-top:14px;
      }
      .dashboard-boot-track{
        position:relative;
        height:10px;
        border-radius:999px;
        overflow:hidden;
        background:rgba(255,255,255,.18);
      }
      .dashboard-boot-bar{
        height:100%;
        width:0%;
        border-radius:inherit;
        background:linear-gradient(90deg,#ffffff,#8ce7d7);
        box-shadow:0 0 18px rgba(255,255,255,.26);
        transition:width .26s ease;
      }
      .dashboard-boot-percent{
        font-size:15px;
        font-weight:900;
        color:#fff;
        min-width:44px;
        text-align:right;
      }
    `;
    document.head.appendChild(style);
  }

  dashboardBootOverlayEl = document.createElement('div');
  dashboardBootOverlayEl.className = 'dashboard-boot-overlay';
  dashboardBootOverlayEl.innerHTML = `
    <div class="dashboard-boot-card">
      <div class="dashboard-boot-kicker">SIPPBJ · Dashboard Monitoring</div>
      <div class="dashboard-boot-title" id="dashboardBootTitle">Memuat dashboard...</div>
      <p class="dashboard-boot-text" id="dashboardBootText">Menyiapkan tampilan dan mengambil data dashboard.</p>
      <div class="dashboard-boot-progress-row">
        <div class="dashboard-boot-track"><div class="dashboard-boot-bar" id="dashboardBootBar"></div></div>
        <div class="dashboard-boot-percent" id="dashboardBootPercent">0%</div>
      </div>
    </div>
  `;
  document.body.appendChild(dashboardBootOverlayEl);
  return dashboardBootOverlayEl;
}

function setDashboardBootProgress(percent, title, text) {
  const overlay = ensureDashboardBootOverlay();
  const safePercent = Math.max(0, Math.min(100, Number(percent || 0)));
  const titleEl = overlay.querySelector('#dashboardBootTitle');
  const textEl = overlay.querySelector('#dashboardBootText');
  const barEl = overlay.querySelector('#dashboardBootBar');
  const percentEl = overlay.querySelector('#dashboardBootPercent');

  if (titleEl && title) titleEl.textContent = title;
  if (textEl && text) textEl.textContent = text;
  if (barEl) barEl.style.width = `${safePercent}%`;
  if (percentEl) percentEl.textContent = `${Math.round(safePercent)}%`;
}

function clearDashboardBootTimer() {
  if (dashboardBootProgressTimer) {
    window.clearInterval(dashboardBootProgressTimer);
    dashboardBootProgressTimer = null;
  }
}

function showDashboardBootLoading() {
  const overlay = ensureDashboardBootOverlay();
  clearDashboardBootTimer();
  setDashboardBootProgress(6, 'Memuat dashboard...', 'Menyiapkan tampilan dan mengambil data dashboard.');
  overlay.classList.add('show');

  const steps = [14, 27, 39, 52, 66, 78, 86, 92];
  let index = 0;
  dashboardBootProgressTimer = window.setInterval(() => {
    if (index >= steps.length) {
      clearDashboardBootTimer();
      return;
    }
    setDashboardBootProgress(steps[index], null, index < 2
      ? 'Menghubungkan ke sumber data dashboard.'
      : index < 5
        ? 'Menyusun kartu, radar, dan ringkasan performa.'
        : 'Hampir selesai, panel dashboard sedang dirapikan.');
    index += 1;
  }, 240);
}

function hideDashboardBootLoading(success = true) {
  const overlay = ensureDashboardBootOverlay();
  clearDashboardBootTimer();

  if (success) {
    setDashboardBootProgress(100, 'Merapikan tampilan dashboard...', 'Hampir selesai, panel dan kartu sedang ditampilkan.');
    window.setTimeout(() => {
      overlay.classList.remove('show');
    }, 320);
    return;
  }

  overlay.classList.remove('show');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cacheBust(url) {
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}v=${Date.now()}`;
}

function showModuleLoading(title = 'Memuat modul...') {
  contentArea.innerHTML = `
    <section class="card">
      <h3>${escapeHtml(title)}</h3>
      <p>Mohon tunggu sebentar, sistem sedang menyiapkan tampilan dan data.</p>
    </section>
  `;
}

function initScrollAnimation() {
  if (typeof scrollAnimationDestroy === 'function') {
    scrollAnimationDestroy();
    scrollAnimationDestroy = null;
  }

  let progress = document.getElementById('luxScrollProgress');

  if (!progress) {
    progress = document.createElement('div');
    progress.id = 'luxScrollProgress';
    progress.className = 'lux-scroll-progress';
    document.body.appendChild(progress);
  }

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  };

  const revealItems = contentArea.querySelectorAll(
    '.hero-card, .card, .quick-card, .embed-card, .module-page--native > *'
  );

  revealItems.forEach((item, index) => {
    item.classList.add('lux-reveal');
    item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -30px 0px'
  });

  revealItems.forEach((item) => observer.observe(item));

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  scrollAnimationDestroy = () => {
    window.removeEventListener('scroll', updateProgress);
    observer.disconnect();
  };
}

const DASHBOARD_SHEETS = {
  itkp: {
    title: 'FIX ITKP OPD',
    spreadsheetId: '18SSLHINReP4mpMYLFhFGVGjsbspQSs0xHZ4weSjvE3A',
    gid: '1217577518'
  },
  itkpSubOpd: {
    title: 'FIX ITKP SUB OPD',
    spreadsheetId: '18SSLHINReP4mpMYLFhFGVGjsbspQSs0xHZ4weSjvE3A',
    gid: '1682485707'
  },
  perencanaan: {
    title: 'D_PERENCANAAN',
    spreadsheetId: '1ccDgtXNATxSYMZuDgd3polvRiTFNiFnjIGMP7b9qmrU',
    gid: '1819757327'
  },
  realisasi: {
    title: 'D_REALISASI',
    spreadsheetId: '1ccDgtXNATxSYMZuDgd3polvRiTFNiFnjIGMP7b9qmrU',
    gid: '325886021'
  },
  allprog: {
    title: 'ALLPROG',
    spreadsheetId: '14i9ni_b0X_3D681j_GHNxap2nfJBmIoaOmy8KNCIHRc',
    gid: '693324486'
  }
};

const DASHBOARD_STATE = {
  loading: false,
  loadedAt: null,
  error: null,
  data: null,
  selectedItkpSatker: 'PEMERINTAH KOTA BOGOR'
};

const WARNING_MODAL_STATE = {
  rows: [],
  filteredRows: [],
  type: '',
  title: '',
  page: 1,
  pageSize: 10
};

const DASHBOARD_CONTEXT_KEY = 'traxpbj_dashboard_context';

function getDashboardContext() {
  try {
    const raw = localStorage.getItem(DASHBOARD_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function persistDashboardContext() {
  const payload = {
    selectedSatker: DASHBOARD_STATE.selectedItkpSatker || 'PEMERINTAH KOTA BOGOR',
    updatedAt: Date.now()
  };

  try {
    localStorage.setItem(DASHBOARD_CONTEXT_KEY, JSON.stringify(payload));
  } catch (error) {
    // ignore storage issues
  }

  window.__dashboardSelectedSatker = payload.selectedSatker;
  return payload;
}

function escapeSelectorValue(value) {
  if (window.CSS && typeof window.CSS.escape === 'function') {
    return window.CSS.escape(String(value || ''));
  }
  return String(value || '').replace(/(["'\\.#:[\]()])/g, '\\$1');
}

function applyDashboardSatkerToModule(moduleContainer) {
  const context = getDashboardContext();
  const selectedSatker = String(context.selectedSatker || '').trim();
  if (!selectedSatker) return false;

  const root = moduleContainer || contentArea || document;
  let applied = false;

  const selectCandidates = Array.from(root.querySelectorAll('select'));
  selectCandidates.forEach((select) => {
    if (applied) return;
    const descriptor = [select.id, select.name, select.getAttribute('aria-label'), select.getAttribute('data-filter'), select.closest('label')?.textContent]
      .join(' ')
      .toLowerCase();
    if (!/satker|satuan kerja|perangkat daerah|opd/.test(descriptor)) return;

    const option = Array.from(select.options || []).find((item) => String(item.textContent || item.value || '').trim().toUpperCase() === selectedSatker.toUpperCase());
    if (!option) return;

    select.value = option.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    select.dispatchEvent(new Event('input', { bubbles: true }));
    applied = true;
  });

  if (applied) return true;

  const inputCandidates = Array.from(root.querySelectorAll('input[type="search"], input[type="text"], .choices__input, [role="combobox"] input'));
  inputCandidates.forEach((input) => {
    if (applied) return;
    const descriptor = [input.id, input.name, input.placeholder, input.getAttribute('aria-label'), input.closest('label')?.textContent]
      .join(' ')
      .toLowerCase();
    if (!/satker|satuan kerja|perangkat daerah|opd/.test(descriptor)) return;

    input.value = selectedSatker;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    applied = true;
  });

  return applied;
}

function applyDashboardContextToModule(page, moduleContainer) {
  if (!page || !page.html) return;
  if (!/itkp-sirup|itkp-ekatalog|itkp-etendering|itkp-ekontrak|itkp-nontender/.test(page.html)) return;

  [120, 400, 900, 1600].forEach((delay) => {
    window.setTimeout(() => {
      applyDashboardSatkerToModule(moduleContainer);
    }, delay);
  });
}

function normalizeHeader(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s%()-]/g, '')
    .trim();
}

function getField(row, candidates) {
  const map = row.__normalized || {};

  for (const candidate of candidates) {
    const key = normalizeHeader(candidate);
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      return map[key];
    }
  }

  const candidateText = candidates.map(normalizeHeader);

  for (const [key, value] of Object.entries(map)) {
    if (candidateText.some((item) => key.includes(item) || item.includes(key))) {
      return value;
    }
  }

  return '';
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;

  const raw = String(value)
    .trim()
    .replace(/\s/g, '');

  if (!raw || raw === '-' || raw.toLowerCase() === 'nan') return 0;

  const hasComma = raw.includes(',');
  const hasDot = raw.includes('.');

  let cleaned = raw.replace(/[^\d,.-]/g, '');

  if (hasComma && hasDot) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      cleaned = `${parts[0]}.${parts[1]}`;
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (!hasComma && hasDot) {
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = cleaned.replace(/\./g, '');
    }
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value) {
  return Math.round(toNumber(value)).toLocaleString('id-ID');
}

function formatMoney(value) {
  const number = toNumber(value);
  if (number >= 1_000_000_000_000) return `Rp ${(number / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} T`;
  if (number >= 1_000_000_000) return `Rp ${(number / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`;
  if (number >= 1_000_000) return `Rp ${(number / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Jt`;
  return `Rp ${formatNumber(number)}`;
}

function formatCompactMetric(value) {
  const number = toNumber(value);
  if (number >= 1_000_000_000_000) return `${(number / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} T`;
  if (number >= 1_000_000_000) return `${(number / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`;
  if (number >= 1_000_000) return `${(number / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Jt`;
  return formatNumber(number);
}

function formatCompactPair(leftValue, rightValue) {
  return `${formatCompactMetric(leftValue)} / ${formatCompactMetric(rightValue)}`;
}

function formatPlainPair(leftValue, rightValue) {
  return `${formatNumber(leftValue)} / ${formatNumber(rightValue)}`;
}

function getToneByPercent(percent) {
  const value = Math.max(0, Math.min(100, toNumber(percent)));
  if (value < 50) return 'danger';
  if (value < 80) return 'warning';
  return 'success';
}

function getToneColor(percent) {
  const tone = getToneByPercent(percent);
  if (tone === 'danger') return '#dc2626';
  if (tone === 'warning') return '#f59e0b';
  return '#16a34a';
}

function formatPercent(value) {
  const number = toNumber(value);
  return `${number.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function formatScore(value) {
  return toNumber(value).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quote = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quote && next === '"') {
      value += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quote = !quote;
      continue;
    }

    if (char === ',' && !quote) {
      row.push(value);
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quote) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(value);
      if (row.some((cell) => String(cell).trim() !== '')) rows.push(row);
      row = [];
      value = '';
      continue;
    }

    value += char;
  }

  row.push(value);
  if (row.some((cell) => String(cell).trim() !== '')) rows.push(row);

  return rows;
}

async function fetchSheetRows(config) {
  const url = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/gviz/tq?tqx=out:csv&gid=${config.gid}&v=${Date.now()}`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Gagal mengambil ${config.title}. HTTP ${response.status}`);
  }

  const text = await response.text();

  if (/googlevisualization|DOCTYPE html|<html/i.test(text.slice(0, 300))) {
    throw new Error(`${config.title} belum bisa dibaca publik. Pastikan spreadsheet/share link dapat diakses viewer.`);
  }

  const matrix = parseCsv(text);
  const headers = matrix.shift() || [];

  return matrix.map((cells) => {
    const row = {};
    const normalized = {};

    headers.forEach((header, index) => {
      const cleanHeader = String(header || '').trim();
      const cell = String(cells[index] || '').trim();
      row[cleanHeader] = cell;
      normalized[normalizeHeader(cleanHeader)] = cell;
    });

    // Simpan bentuk asli CSV supaya sheet tertentu yang kolomnya sudah pasti
    // bisa dibaca berdasarkan posisi kolom. Ini penting untuk ALLPROG karena
    // Google Visualization kadang membuat pencarian header menjadi terlalu longgar.
    row.__headers = headers.map((header) => String(header || '').trim());
    row.__cells = cells.map((cell) => String(cell || '').trim());
    row.__normalized = normalized;
    return row;
  }).filter((row) => {
    return Object.values(row.__normalized).some((item) => String(item).trim() !== '');
  });
}

function groupSum(rows, keyGetter, valueGetter) {
  const map = new Map();

  rows.forEach((row) => {
    const key = String(keyGetter(row) || 'Tidak Terisi').trim() || 'Tidak Terisi';
    const prev = map.get(key) || { name: key, count: 0, value: 0 };

    prev.count += 1;
    prev.value += toNumber(valueGetter(row));
    map.set(key, prev);
  });

  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

function avg(values) {
  const cleaned = values.map(toNumber).filter((value) => Number.isFinite(value));
  if (!cleaned.length) return 0;
  return cleaned.reduce((total, value) => total + value, 0) / cleaned.length;
}

function sum(values) {
  return values.reduce((total, value) => total + toNumber(value), 0);
}

function isCityAggregateName(name) {
  return String(name || '').trim().toUpperCase() === 'PEMERINTAH KOTA BOGOR';
}

function findNumericByHeader(row, requiredWords = [], optionalWords = []) {
  const map = row && row.__normalized ? row.__normalized : {};
  const required = requiredWords.map(normalizeHeader).filter(Boolean);
  const optional = optionalWords.map(normalizeHeader).filter(Boolean);

  let bestValue = 0;
  let bestWeight = -1;

  Object.entries(map).forEach(([key, value]) => {
    const number = toNumber(value);

    if (!Number.isFinite(number) || number <= 0) {
      return;
    }

    const isMatch = required.every((word) => key.includes(word));

    if (!isMatch) {
      return;
    }

    let weight = 0;
    optional.forEach((word) => {
      if (key.includes(word)) weight += 1;
    });

    if (weight > bestWeight) {
      bestWeight = weight;
      bestValue = number;
    }
  });

  return bestValue;
}

function getLastReasonableItkpNumber(row) {
  const map = row && row.__normalized ? row.__normalized : {};
  const values = Object.entries(map)
    .filter(([key]) => {
      return !key.includes('total rup')
        && !key.includes('total komitmen')
        && !key.includes('total pagu')
        && !key.includes('total realisasi')
        && !key.includes('paket')
        && !key.includes('pagu');
    })
    .map(([, value]) => toNumber(value))
    .filter((value) => Number.isFinite(value) && value > 0 && value <= 30);

  return values.length ? values[values.length - 1] : 0;
}

function getItkpScore(row) {
  const exactValue = toNumber(getField(row, [
    'Nilai ITKP Indikator Pemanfaatan Sistem - skor maksimal 30 (point)',
    'Nilai ITKP - Pemanfaatan Sistem - skor maksimal 30 (point)',
    'Nilai ITKP Pemanfaatan Sistem - skor maksimal 30 (point)',
    'Nilai ITKP Pemanfaatan Sistem',
    'Nilai ITKP Indikator Pemanfaatan Sistem',
    'Pemanfaatan Sistem - skor maksimal 30',
    'Pemanfaatan Sistem'
  ]));

  if (exactValue > 0) {
    return exactValue;
  }

  const headerValue = findNumericByHeader(
    row,
    ['nilai itkp', 'pemanfaatan sistem'],
    ['skor maksimal 30', '30', 'point']
  );

  if (headerValue > 0) {
    return headerValue;
  }

  if (isCityAggregateName(getField(row || {}, ['Satuan Kerja', 'Nama Satuan Kerja', 'nama_satker']))) {
    return getLastReasonableItkpNumber(row || {});
  }

  return 0;
}

function buildItkpProfile(row, fallbackName = 'PEMERINTAH KOTA BOGOR') {
  const sourceRow = row || {};
  const name = getField(sourceRow, ['Satuan Kerja', 'Nama Satuan Kerja', 'nama_satker']) || fallbackName;

  const totalKomitmenSirup = getField(sourceRow, ['Total Komitmen (SIRUP)', 'Total Komitmen Sirup']);
  const totalRupSirup = getField(sourceRow, ['Total RUP Diumumkan (SIRUP)', 'Total RUP Diumumkan Sirup']);
  const paketAktifEpurchasing = getField(sourceRow, ['Paket Aktif(ePurchasing)', 'Paket Aktif (ePurchasing)', 'Paket Aktif epurchasing']);
  const paketSelesaiEpurchasing = getField(sourceRow, ['Paket Selesai (ePurchasing)', 'Paket Selesai ePurchasing']);
  const paketTerumumkanTender = getField(sourceRow, ['Paket Terumumkan (etendering)', 'Paket Terumumkan etendering']);
  const paketSelesaiTender = getField(sourceRow, ['Paket Selesai (etendering)', 'Paket Selesai etendering']);
  const totalPaketAktifKontrak = getField(sourceRow, ['Total Paket Aktif (ekontrak)', 'Total Paket Aktif ekontrak']);
  const totalPaketSelesaiKontrak = getField(sourceRow, ['Total Paket Selesai (ekontrak)', 'Total Paket Selesai ekontrak']);
  const totalPaguNonTender = getField(sourceRow, ['Total Pagu (Non etendering & Non ePurchasing)', 'Total Pagu Non etendering & Non ePurchasing', 'Total Pagu']);
  const totalRealisasiNonTender = getField(sourceRow, ['Total Realisasi (Non etendering & Non ePurchasing)', 'Total Realisasi Non etendering & Non ePurchasing', 'Total Realisasi']);
  const tokoDaringValue = toNumber(getField(sourceRow, ['Nilai ITKP - skor maksimal 1 (point) (Toko Daring)', 'Toko Daring']));

  return {
    name,
    __sourceRow: sourceRow,
    score: getItkpScore(sourceRow),
    dimensions: [
      {
        name: 'SiRUP',
        value: toNumber(getField(sourceRow, ['Nilai ITKP - skor maksimal 10 (point) (SIRUP)', 'SIRUP'])),
        max: 10,
        accent: 'blue',
        route: 'monitoring-sirup',
        hint: 'Klik untuk buka Monitoring SiRUP',
        detailText: formatCompactPair(totalKomitmenSirup, totalRupSirup),
        detailHref: 'https://datastudio.google.com/reporting/d940ac07-c54f-4ff8-af5e-36424698d5a2'
      },
      {
        name: 'Toko Daring',
        value: tokoDaringValue,
        max: 1,
        accent: 'teal',
        route: 'monitoring-ekatalog',
        hint: 'Klik untuk buka Monitoring eKatalog/Toko Daring',
        detailText: `${tokoDaringValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })} / 1`
      },
      {
        name: 'e-Purchasing',
        value: toNumber(getField(sourceRow, ['Nilai ITKP - skor maksimal 4 (point) (Epurchasing)', 'Epurchasing', 'ePurchasing'])),
        max: 4,
        accent: 'purple',
        route: 'monitoring-ekatalog',
        hint: 'Klik untuk buka Monitoring eKatalog',
        detailText: formatPlainPair(paketSelesaiEpurchasing, paketAktifEpurchasing)
      },
      {
        name: 'e-Tendering',
        value: toNumber(getField(sourceRow, ['Nilai ITKP - skor maksimal 5 (point) (etendering)', 'eTendering'])),
        max: 5,
        accent: 'orange',
        route: 'monitoring-etendering',
        hint: 'Klik untuk buka Monitoring eTendering',
        detailText: formatPlainPair(paketSelesaiTender, paketTerumumkanTender)
      },
      {
        name: 'e-Kontrak',
        value: toNumber(getField(sourceRow, ['Nilai ITKP - skor maksimal 5 (point) (ekontrak)', 'eKontrak'])),
        max: 5,
        accent: 'green',
        route: 'monitoring-ekontrak',
        hint: 'Klik untuk buka Monitoring eKontrak',
        detailText: formatPlainPair(totalPaketSelesaiKontrak, totalPaketAktifKontrak)
      },
      {
        name: 'Non eTendering / Non ePurchasing',
        value: toNumber(getField(sourceRow, ['Nilai ITKP - skor maksimal 5 (point) (Non etendering & Non ePurchasing)', 'Non etendering', 'Non ePurchasing', 'Non Tender'])),
        max: 5,
        accent: 'red',
        route: 'monitoring-nontender',
        hint: 'Klik untuk buka Monitoring Non eTendering',
        detailText: formatCompactPair(totalRealisasiNonTender, totalPaguNonTender)
      }
    ]
  };
}

function isBlankDash(v) {
  const s = String(v || '').trim();
  return s === '' || s === '-';
}

function containsAny(text, words) {
  const t = String(text || '').toLowerCase();
  return (words || []).some((w) => t.includes(String(w).toLowerCase()));
}

function getMonthOrder(label) {
  const months = {
    januari: 1,
    februari: 2,
    maret: 3,
    april: 4,
    mei: 5,
    juni: 6,
    juli: 7,
    agustus: 8,
    september: 9,
    oktober: 10,
    november: 11,
    desember: 12
  };

  const parts = String(label || '').trim().toLowerCase().split(/\s+/);
  if (parts.length < 2) return 0;
  const bulan = months[parts[0]] || 0;
  const tahun = Number(parts[1] || 0);
  return (tahun * 100) + bulan;
}

function getCurrentMonthOrder() {
  const now = new Date();
  return (now.getFullYear() * 100) + (now.getMonth() + 1);
}

function analyzeDashboardPackageStatuses(rows, metodeRup) {
  const summary = {
    selesai: 0,
    berjalan: 0,
    selesaiPemilihan: 0,
    adendum: 0,
    onProcess: 0,
    completed: 0,
    paymentOutsideSystem: 0
  };

  const isEPurchasing = String(metodeRup || '').toLowerCase().includes('e-purchasing');

  (rows || []).forEach((item) => {
    const status = String(item.status_paket || '').toLowerCase();
    const sumber = String(item.sumber_transaksi || '').toLowerCase();
    const bast = String(item.bast || '').trim();

    if (containsAny(status, ['adendum'])) {
      summary.adendum += 1;
    }

    if (isEPurchasing) {
      if (containsAny(status, ['on process'])) {
        summary.berjalan += 1;
        summary.onProcess += 1;
      } else if (containsAny(status, ['completed'])) {
        summary.selesai += 1;
        summary.completed += 1;
      } else if (containsAny(status, ['payment outside system'])) {
        summary.selesai += 1;
        summary.paymentOutsideSystem += 1;
      } else {
        summary.berjalan += 1;
      }
      return;
    }

    if (sumber === 'non tender' || sumber === 'tender') {
      if (!isBlankDash(bast)) {
        summary.selesai += 1;
      } else if (containsAny(status, ['selesai'])) {
        summary.selesaiPemilihan += 1;
      } else {
        summary.berjalan += 1;
      }
      return;
    }

    if (containsAny(status, ['selesai', 'completed', 'payment outside system'])) {
      summary.selesai += 1;
    } else {
      summary.berjalan += 1;
    }
  });

  return summary;
}

function buildDashboardWarningSummary(planningRows, realRows, getFieldFn) {
  return {
    sedangBerjalan: 0,
    selesaiProsesPemilihan: 0,
    melewatiWaktuPemilihan: 0,
    melebihiTargetPemilihan: 0,
    melebihiPaguRealisasi: 0
  };
}

function normalizeSatkerName(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

function getAllprogCell(row, index, candidates) {
  const cells = Array.isArray(row && row.__cells) ? row.__cells : [];
  const valueByIndex = String(cells[index] || '').trim();

  // ALLPROG punya struktur kolom tetap:
  // A Cara Pengadaan, B Jenis Pengadaan, C Kode RUP, D Satuan Kerja,
  // E Metode Pengadaan, F Sumber Transaksi, G Nama Paket, H Nilai Pagu,
  // I Nilai Realisasi, J Status Paket, K Waktu Pemilihan, L Warning.
  // Jadi popup dan export harus ambil dari posisi kolom ini, bukan tebakan header.
  if (valueByIndex) return valueByIndex;

  return getField(row, candidates || []);
}

function getAllprogSatker(row) {
  return getAllprogCell(row, 3, [
    'Satuan Kerja',
    'Nama Satuan Kerja',
    'Satker',
    'Nama Satker',
    'OPD',
    'Nama OPD',
    'Perangkat Daerah',
    'Unit Kerja'
  ]);
}

function mapAllprogRows(rows, selectedProfileName, selectedIsCity) {
  const selectedKey = normalizeSatkerName(selectedProfileName);

  return (rows || []).map((row) => ({
    caraPengadaan: getAllprogCell(row, 0, ['Cara Pengadaan']),
    jenisPengadaan: getAllprogCell(row, 1, ['Jenis Pengadaan']),
    kodeRup: getAllprogCell(row, 2, ['Kode RUP', 'Kode Rup']),
    satker: getAllprogSatker(row),
    metodePengadaan: getAllprogCell(row, 4, ['Metode Pengadaan']),
    sumberTransaksi: getAllprogCell(row, 5, ['Sumber Transaksi']),
    namaPaket: getAllprogCell(row, 6, ['Nama Paket']),
    nilaiPagu: toNumber(getAllprogCell(row, 7, ['Nilai Pagu', 'Pagu'])),
    nilaiRealisasi: toNumber(getAllprogCell(row, 8, ['Nilai Realisasi', 'Realisasi'])),
    statusPaket: getAllprogCell(row, 9, ['Status Paket', 'Status']),
    waktuPemilihan: getAllprogCell(row, 10, ['Waktu Pemilihan', 'Waktu_Pemilihan', 'Waktu Pemilihan Paket']),
    warning: getAllprogCell(row, 11, ['Warning'])
  })).filter((item) => {
    if (selectedIsCity) return true;
    return normalizeSatkerName(item.satker) === selectedKey;
  });
}

function normalizeWarningText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function buildAllprogWarningSummary(rows) {
  const summary = {
    totalPaket: (rows || []).length,
    selesai: 0,
    sedangBerjalan: 0,
    belumBerjalan: 0,
    melewatiWaktuPemilihan: 0,
    melebihiTargetPemilihan: 0
  };

  (rows || []).forEach((item) => {
    const warning = normalizeWarningText(item.warning);

    if (warning === 'selesai') {
      summary.selesai += 1;
      return;
    }
    if (warning === 'sedang berjalan') {
      summary.sedangBerjalan += 1;
      return;
    }
    if (warning === 'belum berjalan') {
      summary.belumBerjalan += 1;
      return;
    }
    if (warning === 'melewati waktu pemilihan') {
      summary.melewatiWaktuPemilihan += 1;
      return;
    }
    if (warning === 'melebihi target pemilihan') {
      summary.melebihiTargetPemilihan += 1;
    }
  });

  return summary;
}

function getWarningTypeTitle(type) {
  return ({
    selesai: 'Selesai',
    sedangBerjalan: 'Sedang Berjalan',
    belumBerjalan: 'Belum Berjalan',
    melewatiWaktuPemilihan: 'Melewati Waktu Pemilihan',
    melebihiTargetPemilihan: 'Melebihi Target Pemilihan'
  })[type] || 'Detail Paket Warning';
}

function filterWarningRowsByType(rows, type) {
  return (rows || []).filter((item) => {
    const warning = normalizeWarningText(item.warning);
    if (type === 'selesai') return warning === 'selesai';
    if (type === 'sedangBerjalan') return warning === 'sedang berjalan';
    if (type === 'belumBerjalan') return warning === 'belum berjalan';
    if (type === 'melewatiWaktuPemilihan') return warning === 'melewati waktu pemilihan';
    if (type === 'melebihiTargetPemilihan') return warning === 'melebihi target pemilihan';
    return false;
  });
}

function ensureWarningModalStyle() {
  if (document.getElementById('warningModalStyle')) return;

  const style = document.createElement('style');
  style.id = 'warningModalStyle';
  style.textContent = `
    .warning-modal-overlay{position:fixed;inset:0;z-index:999999;background:rgba(15,23,42,.42);display:flex;align-items:center;justify-content:center;padding:24px;}
    .warning-modal-card{width:min(1180px,100%);max-height:min(86vh,920px);background:#fff;border-radius:24px;border:1px solid #dbe7f3;box-shadow:0 26px 60px rgba(15,23,42,.22);display:flex;flex-direction:column;overflow:hidden;}
    .warning-modal-header,.warning-modal-toolbar,.warning-modal-footer{padding:14px 18px;}
    .warning-modal-header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;border-bottom:1px solid #e8eff7;}
    .warning-modal-kicker{color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;}
    .warning-modal-header h3{margin:6px 0 0;color:#102544;font-size:28px;line-height:1.1;}
    .warning-modal-close{border:none;width:38px;height:38px;border-radius:999px;cursor:pointer;background:#eef5fb;color:#123a72;font-size:24px;}
    .warning-modal-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid #e8eff7;}
    .warning-modal-caption{color:#64748b;font-size:13px;font-weight:700;}
    .warning-modal-button{border:none;background:#123a72;color:#fff;border-radius:12px;padding:10px 14px;cursor:pointer;font-size:13px;font-weight:800;}
    .warning-modal-button:disabled{opacity:.45;cursor:not-allowed;}
    .warning-modal-body{padding:16px 18px;overflow:auto;min-height:220px;}
    .warning-empty{padding:24px;border:1px dashed #dbe7f3;border-radius:18px;color:#64748b;font-weight:700;}
    .warning-table-top-scroll{height:16px;overflow-x:auto;overflow-y:hidden;margin:0 0 8px;border-radius:999px;background:#f3f7fc;}
    .warning-table-top-scroll-inner{height:1px;min-width:1280px;}
    .warning-table-wrap{overflow:auto;}
    .warning-table{width:100%;border-collapse:collapse;min-width:1280px;}
    .warning-table th,.warning-table td{padding:10px 12px;border-bottom:1px solid #edf3f9;text-align:left;font-size:13px;vertical-align:top;}
    .warning-table th{position:sticky;top:0;background:#f8fbff;color:#123a72;font-size:12px;text-transform:uppercase;letter-spacing:.04em;z-index:2;}
    .warning-table tbody tr.warning-row--selesai{background:linear-gradient(90deg,rgba(34,197,94,.11),rgba(255,255,255,.96));}
    .warning-table tbody tr.warning-row--sedang{background:linear-gradient(90deg,rgba(59,130,246,.10),rgba(255,255,255,.96));}
    .warning-table tbody tr.warning-row--belum{background:linear-gradient(90deg,rgba(100,116,139,.10),rgba(255,255,255,.96));}
    .warning-table tbody tr.warning-row--melewati{background:linear-gradient(90deg,rgba(239,68,68,.12),rgba(255,255,255,.96));}
    .warning-table tbody tr.warning-row--melebihi{background:linear-gradient(90deg,rgba(245,158,11,.14),rgba(255,255,255,.96));}
    .warning-badge{display:inline-flex;align-items:center;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:900;white-space:nowrap;}
    .warning-badge--selesai{background:#dcfce7;color:#166534;}
    .warning-badge--sedang{background:#dbeafe;color:#1d4ed8;}
    .warning-badge--belum{background:#f1f5f9;color:#475569;}
    .warning-badge--melewati{background:#fee2e2;color:#b91c1c;}
    .warning-badge--melebihi{background:#fef3c7;color:#b45309;}
    .summary-stat--clickable{width:100%;text-align:left;cursor:pointer;transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;}
    .summary-stat--clickable:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(18,58,114,.10);border-color:#b8d4ef;}
    .summary-stat--success{border-left-color:#22c55e!important;}
    .summary-stat--success b{color:#166534!important;}
    .summary-stat--info{border-left-color:#3b82f6!important;}
    .summary-stat--info b{color:#1d4ed8!important;}
    .summary-stat--muted{border-left-color:#94a3b8!important;}
    .summary-stat--muted b{color:#475569!important;}
    @media (max-width:900px){.warning-modal-card{max-height:92vh;border-radius:18px;}.warning-modal-header h3{font-size:22px;}}
  `;
  document.head.appendChild(style);
}

function closeWarningModal() {
  const overlay = document.getElementById('warningModalOverlay');
  if (overlay) overlay.remove();
}


function getWarningUiKey(value) {
  const warning = normalizeWarningText(value);
  if (warning === 'selesai') return 'selesai';
  if (warning === 'sedang berjalan') return 'sedang';
  if (warning === 'belum berjalan') return 'belum';
  if (warning === 'melewati waktu pemilihan') return 'melewati';
  if (warning === 'melebihi target pemilihan') return 'melebihi';
  return 'belum';
}

function renderWarningBadge(value) {
  const key = getWarningUiKey(value);
  return `<span class="warning-badge warning-badge--${key}">${escapeHtml(value || '-')}</span>`;
}

function syncWarningModalScrollers() {
  const topScroll = document.getElementById('warningTableTopScroll');
  const topInner = document.getElementById('warningTableTopScrollInner');
  const tableWrap = document.getElementById('warningTableWrap');
  const table = tableWrap ? tableWrap.querySelector('.warning-table') : null;
  if (!topScroll || !topInner || !tableWrap || !table) return;

  topInner.style.width = `${Math.max(table.scrollWidth, tableWrap.scrollWidth)}px`;

  let syncing = false;
  topScroll.onscroll = () => {
    if (syncing) return;
    syncing = true;
    tableWrap.scrollLeft = topScroll.scrollLeft;
    syncing = false;
  };
  tableWrap.onscroll = () => {
    if (syncing) return;
    syncing = true;
    topScroll.scrollLeft = tableWrap.scrollLeft;
    syncing = false;
  };
}

function renderWarningModalPage() {
  const body = document.getElementById('warningModalBody');
  const titleEl = document.getElementById('warningModalTitle');
  const pageInfo = document.getElementById('warningModalPageInfo');
  const prevBtn = document.getElementById('warningModalPrev');
  const nextBtn = document.getElementById('warningModalNext');

  if (!body || !titleEl) return;

  const totalRows = WARNING_MODAL_STATE.filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / WARNING_MODAL_STATE.pageSize));
  WARNING_MODAL_STATE.page = Math.min(Math.max(1, WARNING_MODAL_STATE.page), totalPages);

  const start = (WARNING_MODAL_STATE.page - 1) * WARNING_MODAL_STATE.pageSize;
  const pageRows = WARNING_MODAL_STATE.filteredRows.slice(start, start + WARNING_MODAL_STATE.pageSize);

  titleEl.textContent = `${WARNING_MODAL_STATE.title} · ${totalRows.toLocaleString('id-ID')} paket`;

  if (!pageRows.length) {
    body.innerHTML = `<div class="warning-empty">Tidak ada data untuk kategori ini.</div>`;
  } else {
    body.innerHTML = `
      <div class="warning-table-top-scroll" id="warningTableTopScroll"><div class="warning-table-top-scroll-inner" id="warningTableTopScrollInner"></div></div>
      <div class="warning-table-wrap" id="warningTableWrap">
        <table class="warning-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Cara Pengadaan</th>
              <th>Jenis Pengadaan</th>
              <th>Kode RUP</th>
              <th>Satuan Kerja</th>
              <th>Metode Pengadaan</th>
              <th>Sumber Transaksi</th>
              <th>Nama Paket</th>
              <th>Nilai Pagu</th>
              <th>Nilai Realisasi</th>
              <th>Status Paket</th>
              <th>Waktu Pemilihan</th>
              <th>Warning</th>
            </tr>
          </thead>
          <tbody>
            ${pageRows.map((item, index) => `
              <tr class="warning-row--${getWarningUiKey(item.warning)}">
                <td>${start + index + 1}</td>
                <td>${escapeHtml(item.caraPengadaan || '-')}</td>
                <td>${escapeHtml(item.jenisPengadaan || '-')}</td>
                <td>${escapeHtml(item.kodeRup || '-')}</td>
                <td>${escapeHtml(item.satker || '-')}</td>
                <td>${escapeHtml(item.metodePengadaan || '-')}</td>
                <td>${escapeHtml(item.sumberTransaksi || '-')}</td>
                <td>${escapeHtml(item.namaPaket || '-')}</td>
                <td>${escapeHtml(formatMoney(item.nilaiPagu || 0))}</td>
                <td>${escapeHtml(formatMoney(item.nilaiRealisasi || 0))}</td>
                <td>${escapeHtml(item.statusPaket || '-')}</td>
                <td>${escapeHtml(item.waktuPemilihan || '-')}</td>
                <td>${renderWarningBadge(item.warning)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  window.setTimeout(syncWarningModalScrollers, 0);

  if (pageInfo) pageInfo.textContent = `Page ${WARNING_MODAL_STATE.page} / ${totalPages}`;
  if (prevBtn) prevBtn.disabled = WARNING_MODAL_STATE.page <= 1;
  if (nextBtn) nextBtn.disabled = WARNING_MODAL_STATE.page >= totalPages;
}

function ensureXlsxLibrary() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('xlsxLibraryLoader');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.XLSX), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'xlsxLibraryLoader';
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Gagal memuat library XLSX'));
    document.body.appendChild(script);
  });
}

async function exportWarningRowsToXlsx() {
  await ensureXlsxLibrary();
  const rows = WARNING_MODAL_STATE.filteredRows.map((item) => ({
    'Satuan Kerja': item.satker || '',
    'Cara Pengadaan': item.caraPengadaan || '',
    'Jenis Pengadaan': item.jenisPengadaan || '',
    'Kode RUP': item.kodeRup || '',
    'Metode Pengadaan': item.metodePengadaan || '',
    'Sumber Transaksi': item.sumberTransaksi || '',
    'Nama Paket': item.namaPaket || '',
    'Nilai Pagu': item.nilaiPagu || 0,
    'Nilai Realisasi': item.nilaiRealisasi || 0,
    'Status Paket': item.statusPaket || '',
    'Waktu Pemilihan': item.waktuPemilihan || '',
    'Warning': item.warning || ''
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Warning');
  const safeName = WARNING_MODAL_STATE.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  XLSX.writeFile(wb, `${safeName || 'warning'}_${Date.now()}.xlsx`);
}


async function exportAllWarningRowsToXlsx() {
  await ensureXlsxLibrary();
  const rows = ((DASHBOARD_STATE.data && DASHBOARD_STATE.data.allprogRows) || []).map((item) => ({
    'Satuan Kerja': item.satker || '',
    'Cara Pengadaan': item.caraPengadaan || '',
    'Jenis Pengadaan': item.jenisPengadaan || '',
    'Kode RUP': item.kodeRup || '',
    'Metode Pengadaan': item.metodePengadaan || '',
    'Sumber Transaksi': item.sumberTransaksi || '',
    'Nama Paket': item.namaPaket || '',
    'Nilai Pagu': item.nilaiPagu || 0,
    'Nilai Realisasi': item.nilaiRealisasi || 0,
    'Status Paket': item.statusPaket || '',
    'Waktu Pemilihan': item.waktuPemilihan || '',
    'Warning': item.warning || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Semua Paket');
  XLSX.writeFile(wb, `semua_paket_warning_${Date.now()}.xlsx`);
}


function openWarningModal(type) {
  ensureWarningModalStyle();
  const rows = filterWarningRowsByType((DASHBOARD_STATE.data && DASHBOARD_STATE.data.allprogRows) || [], type);
  WARNING_MODAL_STATE.rows = rows;
  WARNING_MODAL_STATE.filteredRows = rows;
  WARNING_MODAL_STATE.type = type;
  WARNING_MODAL_STATE.title = getWarningTypeTitle(type);
  WARNING_MODAL_STATE.page = 1;
  closeWarningModal();

  const overlay = document.createElement('div');
  overlay.id = 'warningModalOverlay';
  overlay.className = 'warning-modal-overlay';
  overlay.innerHTML = `
    <div class="warning-modal-card" role="dialog" aria-modal="true">
      <div class="warning-modal-header">
        <div>
          <div class="warning-modal-kicker">Detail Paket Warning</div>
          <h3 id="warningModalTitle">${escapeHtml(WARNING_MODAL_STATE.title)}</h3>
        </div>
        <button type="button" class="warning-modal-close" id="warningModalClose">×</button>
      </div>
      <div class="warning-modal-toolbar">
        <div class="warning-modal-caption">Data mengikuti satuan kerja yang sedang dipilih di dashboard ITKP.</div>
        <button type="button" class="warning-modal-button" id="warningModalExport">Export Status Ini</button>
        <button type="button" class="warning-modal-button warning-modal-button--all" id="warningModalExportAll">Export Semua Paket</button>
      </div>
      <div class="warning-modal-body" id="warningModalBody"></div>
      <div class="warning-modal-footer">
        <button type="button" class="warning-modal-button" id="warningModalPrev">Prev</button>
        <span id="warningModalPageInfo">Page 1 / 1</span>
        <button type="button" class="warning-modal-button" id="warningModalNext">Next</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  renderWarningModalPage();

  document.getElementById('warningModalClose')?.addEventListener('click', closeWarningModal);
  document.getElementById('warningModalPrev')?.addEventListener('click', () => {
    WARNING_MODAL_STATE.page -= 1;
    renderWarningModalPage();
  });
  document.getElementById('warningModalNext')?.addEventListener('click', () => {
    WARNING_MODAL_STATE.page += 1;
    renderWarningModalPage();
  });
  document.getElementById('warningModalExport')?.addEventListener('click', () => {
    exportWarningRowsToXlsx().catch((error) => alert(error.message || 'Gagal export XLSX'));
  });
  document.getElementById('warningModalExportAll')?.addEventListener('click', () => {
    exportAllWarningRowsToXlsx().catch((error) => alert(error.message || 'Gagal export XLSX'));
  });
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeWarningModal();
  });
}

function analyzeDashboardData(raw) {
  const itkpAllRows = raw.itkp || [];
  const subOpdAllRows = raw.itkpSubOpd || [];
  const planningRows = raw.perencanaan || [];
  const realRows = raw.realisasi || [];
  const allprogAllRows = raw.allprog || [];

  const getSatker = (row) => getField(row, ['Satuan Kerja', 'Nama Satuan Kerja', 'nama_satker']);
  const getMetode = (row) => getField(row, ['Metode Pengadaan', 'mtd_pemilihan', 'Sumber Transaksi']);
  const getPagu = (row) => getField(row, ['Nilai Pagu', 'Pagu', 'Total Pagu']);
  const getRealisasi = (row) => getField(row, ['Nilai Realisasi', 'Total Realisasi', 'nilai_realisasi']);
  const getStatus = (row) => getField(row, ['Status Paket', 'status_paket', 'Status']);

  const itkpOpdRows = itkpAllRows.filter((row) => !isCityAggregateName(getSatker(row)));
  const subOpdRows = subOpdAllRows.filter((row) => !isCityAggregateName(getSatker(row)));
  const cityRow = itkpAllRows.find((row) => isCityAggregateName(getSatker(row))) || null;
  const cityProfile = buildItkpProfile(cityRow || {}, 'PEMERINTAH KOTA BOGOR');

  const profiles = [cityProfile]
    .concat(itkpOpdRows.map((row) => buildItkpProfile(row, getSatker(row))))
    .filter((profile) => profile.name);

  const selectedName = DASHBOARD_STATE.selectedItkpSatker || cityProfile.name;
  const selectedProfile = profiles.find((profile) => profile.name === selectedName) || cityProfile;
  DASHBOARD_STATE.selectedItkpSatker = selectedProfile.name;

  const selectedIsCity = isCityAggregateName(selectedProfile.name);

  const selectedSatkerKey = normalizeSatkerName(selectedProfile.name);
  const isSelectedSatkerRow = (row) => {
    if (selectedIsCity) return true;
    return normalizeSatkerName(getSatker(row)) === selectedSatkerKey;
  };

  const scopedPlanningRows = planningRows.filter(isSelectedSatkerRow);
  const scopedRealRows = realRows.filter(isSelectedSatkerRow);

  const totalPagu = sum(scopedPlanningRows.map(getPagu));
  const totalRealisasi = sum(scopedRealRows.map(getRealisasi));
  const realisasiPersen = totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;

  const selesaiRows = scopedRealRows.filter((row) => /selesai|completed|paket selesai/i.test(getStatus(row)));
  const processRows = scopedRealRows.filter((row) => /process|proses|berlangsung|sedang/i.test(getStatus(row)));
  const bastRows = scopedRealRows.filter((row) => String(getField(row, ['BAST', 'dok_realisasi'])).trim() && String(getField(row, ['BAST', 'dok_realisasi'])).trim() !== '-');

  const byMetodePlanning = groupSum(scopedPlanningRows, getMetode, getPagu);
  const byMetodeReal = groupSum(scopedRealRows, getMetode, getRealisasi);
  const bySatkerPlanning = groupSum(scopedPlanningRows, getSatker, getPagu);
  const bySatkerReal = groupSum(scopedRealRows, getSatker, getRealisasi);

  const rankingSourceRows = subOpdRows.length ? subOpdRows : itkpOpdRows;
  const scoreRows = rankingSourceRows.map((row) => ({
    name: getSatker(row) || getField(row, ['Satuan Kerja']),
    score: getItkpScore(row)
  })).filter((item) => item.name && !isCityAggregateName(item.name));

  const topItkp = [...scoreRows].sort((a, b) => b.score - a.score).slice(0, 8);
  const lowItkp = [...scoreRows].sort((a, b) => a.score - b.score).slice(0, 8);

  const scopedAllprogRows = mapAllprogRows(allprogAllRows, selectedProfile.name, selectedIsCity);
  const warningSummary = buildAllprogWarningSummary(scopedAllprogRows);

  return {
    itkpRows: itkpOpdRows,
    itkpSubOpdRows: subOpdRows,
    planningRows,
    realRows,
    allprogRaw: allprogAllRows,
    totalOpd: itkpOpdRows.length,
    totalSubOpd: subOpdRows.length,
    scopeName: selectedProfile.name,
    scopeIsCity: selectedIsCity,
    scopedPlanningRows,
    scopedRealRows,
    totalPaketRup: scopedPlanningRows.length,
    totalPaketRealisasi: scopedRealRows.length,
    totalPagu,
    totalRealisasi,
    realisasiPersen,
    selesaiCount: selesaiRows.length,
    processCount: processRows.length,
    bastCount: bastRows.length,
    itkpOverall: cityProfile.score,
    dimensions: selectedProfile.dimensions,
    cityProfile,
    selectedProfile,
    itkpProfiles: profiles,
    byMetodePlanning,
    byMetodeReal,
    bySatkerPlanning,
    bySatkerReal,
    topItkp,
    lowItkp,
    warningSummary,
    allprogRows: scopedAllprogRows
  };
}

async function loadDashboardData(force = false) {
  if (DASHBOARD_STATE.data && !force) return DASHBOARD_STATE.data;
  if (DASHBOARD_STATE.loading) return DASHBOARD_STATE.data;

  DASHBOARD_STATE.loading = true;
  DASHBOARD_STATE.error = null;

  try {
    const [itkp, itkpSubOpd, perencanaan, realisasi, allprog] = await Promise.all([
      fetchSheetRows(DASHBOARD_SHEETS.itkp),
      fetchSheetRows(DASHBOARD_SHEETS.itkpSubOpd),
      fetchSheetRows(DASHBOARD_SHEETS.perencanaan),
      fetchSheetRows(DASHBOARD_SHEETS.realisasi),
      fetchSheetRows(DASHBOARD_SHEETS.allprog)
    ]);

    DASHBOARD_STATE.data = analyzeDashboardData({ itkp, itkpSubOpd, perencanaan, realisasi, allprog });
    DASHBOARD_STATE.loadedAt = new Date();
    return DASHBOARD_STATE.data;
  } catch (error) {
    DASHBOARD_STATE.error = error;
    throw error;
  } finally {
    DASHBOARD_STATE.loading = false;
  }
}

function renderDashboardSkeleton() {
  persistDashboardContext();

  contentArea.innerHTML = `
    <section class="hero-card hero-card--dashboard">
      <div class="hero-glow"></div>
      <div class="hero-kicker">SIPPBJ · Sistem Informasi Pelaporan Pengadaan Barang Jasa</div>
      <h3>Dashboard Pengadaan Barang/Jasa Kota Bogor</h3>
      <p></p>

      <div class="dashboard-loading">
        <div class="loading-orb"></div>
        <div>
          <b>Memuat data dashboard...</b>
          <span>Mengambil data dan menyusun analisis Kota Bogor.</span>
        </div>
      </div>
    </section>
  `;
}

function renderDashboardError(error) {
  persistDashboardContext();

  contentArea.innerHTML = `
    <section class="hero-card hero-card--dashboard">
      <div class="hero-kicker">SIPPBJ · Dashboard</div>
      <h3>Data dashboard belum bisa dimuat</h3>
      <p>${escapeHtml(error.message || 'Terjadi kendala saat mengambil data.')}</p>
      <div class="hero-actions">
        <button class="lux-button lux-button--light" type="button" id="retryDashboardButton">Coba Muat Ulang</button>
      </div>
    </section>

    <section class="card">
      <h3>Yang perlu dicek</h3>
      <div class="insight-list">
        <div class="insight-item">
          <b>1. Share spreadsheet</b>
          <span>Pastikan file Google Sheet dapat dibaca minimal oleh viewer/link terkait.</span>
        </div>
        <div class="insight-item">
          <b>2. GID sheet</b>
          <span>FIX ITKP OPD: 1217577518, FIX ITKP SUB OPD: 1682485707, D_PERENCANAAN: 1819757327, D_REALISASI: 325886021.</span>
        </div>
        <div class="insight-item">
          <b>3. Header</b>
          <span>Jangan ubah nama header utama seperti Nama Satuan Kerja, Metode Pengadaan, Nilai Pagu, Nilai Realisasi, dan Nilai ITKP.</span>
        </div>
      </div>
    </section>
  `;

  const retry = document.getElementById('retryDashboardButton');
  if (retry) {
    retry.addEventListener('click', () => {
      DASHBOARD_STATE.data = null;
      renderDashboard(true);
    });
  }
}

async function renderDashboard(force = false) {
  const shouldShowBootLoading = !dashboardBootShownThisSession;

  if (shouldShowBootLoading) {
    dashboardBootShownThisSession = true;
    showDashboardBootLoading();
  }

  renderDashboardSkeleton();

  try {
    const data = await loadDashboardData(force);
    renderDashboardReady(data);
    bindDashboardEvents();
    if (shouldShowBootLoading) {
      hideDashboardBootLoading(true);
    }
  } catch (error) {
    console.error('Dashboard gagal dimuat:', error);
    renderDashboardError(error);
    if (shouldShowBootLoading) {
      hideDashboardBootLoading(false);
    }
  }
}

function renderDashboardReady(data) {
  const lastUpdate = DASHBOARD_STATE.loadedAt
    ? DASHBOARD_STATE.loadedAt.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    : '-';

  const selectedProfile = data.selectedProfile || data.cityProfile;
  const scopeLabel = data.scopeIsCity ? 'Kota Bogor' : selectedProfile.name;
  const scopeDesc = data.scopeIsCity
    ? 'Akumulasi seluruh satuan kerja Kota Bogor'
    : `Filter khusus ${selectedProfile.name}`;
  const profileKicker = data.scopeIsCity
    ? 'Profile Kota Bogor'
    : `Profile ${selectedProfile.name}`;

  persistDashboardContext();

  contentArea.innerHTML = `
    <section class="hero-card hero-card--dashboard">
      <div class="hero-glow"></div>

      <div class="hero-topline">
        <div>
          <div class="hero-kicker">SIPPBJ · Sistem Informasi Pelaporan Pengadaan Barang Jasa</div>
          <h3>Dashboard Pengadaan Barang/Jasa Kota Bogor</h3>
          <p>Ringkasan ITKP Kota Bogor, profil perencanaan, realisasi paket, metode pengadaan, dan performa OPD/Sub OPD.</p>
        </div>

        <div class="hero-badge">
          <span>Update</span>
          <b>${escapeHtml(lastUpdate)}</b>
        </div>
      </div>

      <div class="stats-grid dashboard-kpi-grid">
        ${renderKpiCard(data.scopeIsCity ? 'Skor ITKP Kota Bogor' : 'Skor ITKP Satuan Kerja', formatScore(selectedProfile.score), data.scopeIsCity ? 'PEMERINTAH KOTA BOGOR' : selectedProfile.name, '📊', '')}
        ${renderKpiCard('Perencanaan', formatMoney(data.totalPagu), `${formatNumber(data.totalPaketRup)} paket · ${scopeLabel}`, '🧾', '')}
        ${renderKpiCard('Pagu Realisasi', formatMoney(data.totalRealisasi), `${formatPercent(data.realisasiPersen)} dari pagu · ${scopeLabel}`, '💰', getToneByPercent(data.realisasiPersen))}
        ${renderKpiCard('Paket Realisasi', formatNumber(data.totalPaketRealisasi), `${formatNumber(data.selesaiCount)} selesai · ${formatNumber(data.processCount)} proses · ${scopeLabel}`, '📦', '')}
      </div>

      <div class="hero-actions">
        <button class="lux-button lux-button--light" type="button" id="refreshDashboardButton">Refresh Data</button>
        <button class="lux-button lux-button--ghost" type="button" data-quick="monitoring-sirup">Buka ITKP SiRUP</button>
        <button class="lux-button lux-button--ghost" type="button" data-quick="monitoring-perencanaan">Buka Monitoring Realisasi</button>
      </div>
    </section>

    <section class="dashboard-grid dashboard-grid--main">
      <div class="card procurement-map-card">
        <div class="section-title-row section-title-row--select">
          <div>
            <span class="section-kicker">${escapeHtml(profileKicker)}</span>
            <h3>Radar Pemanfaatan Sistem ITKP</h3>
            <p class="section-subnote">Pilih satuan kerja untuk melihat komposisi skor per indikator.</p>
          </div>

          <label class="satker-select-wrap">
            <span>Pilih Satuan Kerja</span>
            <div class="satker-combobox" id="itkpSatkerCombobox">
              <div class="satker-combobox-top">
                <input type="search" id="itkpSatkerSearch" class="satker-select satker-search" autocomplete="off" placeholder="Cari satuan kerja..." value="${escapeHtml(selectedProfile.name)}">
                <button class="satker-combobox-toggle" type="button" id="itkpSatkerToggle" aria-label="Buka daftar satuan kerja">▾</button>
              </div>
              <div class="satker-dropdown" id="itkpSatkerDropdown">
                ${data.itkpProfiles.map((profile) => `
                  <button class="satker-option ${profile.name === selectedProfile.name ? 'is-active' : ''}" type="button" data-satker-option="${escapeHtml(profile.name)}">${escapeHtml(profile.name)}</button>
                `).join('')}
              </div>
            </div>
          </label>
        </div>

        <div class="itkp-radar-layout">
          <div class="score-orbit">
            <div class="score-ring score-ring--${getToneByPercent((selectedProfile.score / 30) * 100)}" style="--score:${Math.min(100, (selectedProfile.score / 30) * 100)}; --score-color:${getToneColor((selectedProfile.score / 30) * 100)}">
              <div class="score-core">
                <span>${escapeHtml(selectedProfile.name === 'PEMERINTAH KOTA BOGOR' ? 'ITKP KOTA' : 'ITKP OPD')}</span>
                <b>${formatScore(selectedProfile.score)}</b>
                <small>dari 30 poin</small>
              </div>
            </div>
            <div class="score-caption">${escapeHtml(selectedProfile.name)}</div>
          </div>

          <div class="dimensions dimensions--lux dimensions--clickable">
            ${selectedProfile.dimensions.map(renderDimension).join('')}
          </div>
        </div>
      </div>

      ${renderDistributionCard(data, scopeLabel)}
    </section>

    <section class="dashboard-grid dashboard-grid--analysis">
      ${renderMethodComparisonCard(data, scopeLabel)}

      <div class="dashboard-side-stack">
        ${renderQuickSummaryCard(data, scopeLabel, scopeDesc)}

        <div class="card">
          <div class="section-title-row">
            <div>
              <span class="section-kicker">Akses Cepat</span>
              <h3>Akses Cepat</h3>
            </div>
          </div>

          <div class="quick-grid quick-grid--compact">
            ${renderQuickCard('📝', 'linear-gradient(135deg,#2563eb,#22c55e)', 'Rapor PBJ', 'Buka portal laporan Rapor PBJ perangkat daerah.', 'rapor-pbj')}
            ${renderQuickCard('🏆', 'linear-gradient(135deg,#7c54e9,#a075f3)', 'Pemenang Pengadaan', 'Telusuri portal pencarian paket penyedia dan paket aktif.', 'pemenang-pengadaan')}
            ${renderQuickCard('🧩', 'linear-gradient(135deg,#ef8d21,#f8b14c)', 'Monitoring Paket Konsolidasi', 'Pantau paket konsolidasi yang sudah disiapkan di portal.', 'monitoring-konsolidasi')}
            ${renderQuickCard('📈', 'linear-gradient(135deg,#0f766e,#22c55e)', 'Looker Studio ITKP', 'Buka dashboard indikator pemanfaatan sistem di Looker Studio.', '', 'https://datastudio.google.com/reporting/d940ac07-c54f-4ff8-af5e-36424698d5a2')}
          </div>
        </div>
      </div>
    </section>

    <section class="dashboard-grid dashboard-grid--two">
      <div class="card">
        <div class="section-title-row">
          <div>
            <span class="section-kicker">Ranking Sub OPD</span>
            <h3>Nilai ITKP Tertinggi</h3>
          </div>
          <span class="soft-pill">Top 8 · FIX ITKP SUB OPD</span>
        </div>
        <div class="rank-table">
          ${renderRankRows(data.topItkp, 'top')}
        </div>
      </div>

      <div class="card">
        <div class="section-title-row">
          <div>
            <span class="section-kicker">Perlu Atensi</span>
            <h3>Nilai ITKP Terendah</h3>
          </div>
          <span class="soft-pill">Bottom 8 · FIX ITKP SUB OPD</span>
        </div>
        <div class="rank-table">
          ${renderRankRows(data.lowItkp, 'low')}
        </div>
      </div>
    </section>

    <section class="card">
      <div class="section-title-row">
        <div>
          <span class="section-kicker">Profil Belanja · ${escapeHtml(scopeLabel)}</span>
          <h3>${data.scopeIsCity ? 'Top OPD Berdasarkan Pagu Perencanaan & Realisasi' : 'Ringkasan Pagu Perencanaan & Realisasi OPD Terpilih'}</h3>
        </div>
        <span class="soft-pill">Profil belanja</span>
      </div>

      <div class="dashboard-grid dashboard-grid--two no-margin">
        <div class="neo-panel">
          <h4>Pagu Perencanaan Terbesar</h4>
          <div class="compact-list">
            ${renderCompactList(data.bySatkerPlanning.slice(0, 10), 'pagu')}
          </div>
        </div>

        <div class="neo-panel">
          <h4>Realisasi Terbesar</h4>
          <div class="compact-list">
            ${renderCompactList(data.bySatkerReal.slice(0, 10), 'realisasi')}
          </div>
        </div>
      </div>
    </section>

    <div class="footer-note">© 2023 BenRama - TRAXPBJ</div>
  `;
}

function bindDashboardEvents() {
  const refresh = document.getElementById('refreshDashboardButton');

  if (refresh) {
    refresh.addEventListener('click', () => {
      DASHBOARD_STATE.data = null;
      renderDashboard(true);
    });
  }

  const rerenderDashboardBySatker = (satkerName) => {
    DASHBOARD_STATE.selectedItkpSatker = satkerName;
    persistDashboardContext();

    if (DASHBOARD_STATE.data) {
      DASHBOARD_STATE.data = analyzeDashboardData({
        itkp: DASHBOARD_STATE.data.cityProfile && DASHBOARD_STATE.data.cityProfile.__sourceRow
          ? DASHBOARD_STATE.data.itkpRows.concat([DASHBOARD_STATE.data.cityProfile.__sourceRow])
          : DASHBOARD_STATE.data.itkpRows,
        itkpSubOpd: DASHBOARD_STATE.data.itkpSubOpdRows,
        perencanaan: DASHBOARD_STATE.data.planningRows,
        realisasi: DASHBOARD_STATE.data.realRows,
        allprog: DASHBOARD_STATE.data.allprogRaw
      });
      renderDashboardReady(DASHBOARD_STATE.data);
      bindDashboardEvents();
      initScrollAnimation();
    }
  };

  const satkerSearch = document.getElementById('itkpSatkerSearch');
  const satkerToggle = document.getElementById('itkpSatkerToggle');
  const satkerDropdown = document.getElementById('itkpSatkerDropdown');
  const satkerCombobox = document.getElementById('itkpSatkerCombobox');

  if (satkerSearch && satkerDropdown) {
    const optionButtons = () => Array.from(satkerDropdown.querySelectorAll('[data-satker-option]'));

    const openDropdown = () => satkerCombobox?.classList.add('is-open');
    const closeDropdown = () => satkerCombobox?.classList.remove('is-open');

    const filterOptions = () => {
      const keyword = String(satkerSearch.value || '').trim().toLowerCase();
      let visibleCount = 0;

      optionButtons().forEach((button) => {
        const name = String(button.dataset.satkerOption || '').toLowerCase();
        const visible = !keyword || name.includes(keyword);
        button.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      satkerDropdown.classList.toggle('is-empty', visibleCount === 0);
    };

    satkerSearch.addEventListener('focus', () => {
      openDropdown();
      filterOptions();
    });

    satkerSearch.addEventListener('input', () => {
      openDropdown();
      filterOptions();
    });

    satkerSearch.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeDropdown();
      if (event.key === 'Enter') {
        const exactButton = optionButtons().find((button) => !button.hidden && String(button.dataset.satkerOption || '').toUpperCase() === String(satkerSearch.value || '').trim().toUpperCase());
        if (exactButton) {
          event.preventDefault();
          rerenderDashboardBySatker(exactButton.dataset.satkerOption);
          closeDropdown();
        }
      }
    });

    satkerToggle?.addEventListener('click', () => {
      satkerCombobox?.classList.toggle('is-open');
      filterOptions();
      if (satkerCombobox?.classList.contains('is-open')) satkerSearch.focus();
    });

    optionButtons().forEach((button) => {
      button.addEventListener('click', () => {
        satkerSearch.value = button.dataset.satkerOption || '';
        rerenderDashboardBySatker(button.dataset.satkerOption || 'PEMERINTAH KOTA BOGOR');
        closeDropdown();
      });
    });

    document.addEventListener('click', (event) => {
      if (!satkerCombobox?.contains(event.target)) {
        closeDropdown();
      }
    });
  }

  const donutSegments = Array.from(contentArea.querySelectorAll('[data-method-segment]'));
  const donutLegends = Array.from(contentArea.querySelectorAll('[data-method-legend]'));
  const insightName = document.getElementById('distributionInsightName');
  const insightValue = document.getElementById('distributionInsightValue');
  const insightMeta = document.getElementById('distributionInsightMeta');
  const insightColor = document.getElementById('distributionInsightColor');

  const setActiveDistribution = (dataset) => {
    if (!dataset) return;
    const activeName = String(dataset.methodName || '').trim();

    donutSegments.forEach((segment) => {
      segment.classList.toggle('is-active', String(segment.dataset.methodName || '').trim() === activeName);
    });

    donutLegends.forEach((item) => {
      item.classList.toggle('is-active', String(item.dataset.methodName || '').trim() === activeName);
    });

    if (insightName) insightName.textContent = activeName;
    if (insightValue) insightValue.textContent = dataset.methodValue || '-';
    if (insightMeta) insightMeta.textContent = `${dataset.methodShare || '0,00%'} dari total pagu · ${dataset.methodCount || '0'} paket`;
    if (insightColor) insightColor.style.background = dataset.methodColor || '#2563eb';
  };

  donutSegments.concat(donutLegends).forEach((item) => {
    item.addEventListener('click', () => setActiveDistribution(item.dataset));
    item.addEventListener('mouseenter', () => setActiveDistribution(item.dataset));
    item.addEventListener('focus', () => setActiveDistribution(item.dataset));
  });

  contentArea.querySelectorAll('[data-warning-type]').forEach((item) => {
    item.addEventListener('click', () => {
      openWarningModal(item.dataset.warningType || '');
    });
  });

  contentArea.querySelectorAll('[data-quick], [data-route], [data-external]').forEach((item) => {
    item.addEventListener('click', () => {
      const externalUrl = item.dataset.external;
      if (externalUrl) {
        window.open(externalUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      const route = item.dataset.quick || item.dataset.route;
      if (route) {
        persistDashboardContext();
        loadPage(route);
      }
    });
  });
}

function renderKpiCard(label, value, desc, icon, tone = '') {
  const toneClass = tone ? ` stat-card--${tone}` : '';
  return `
    <div class="stat-card stat-card--lux${toneClass}">
      <div class="stat-card-top">
        <div class="stat-icon">${icon}</div>
        <div class="label">${escapeHtml(label)}</div>
      </div>
      <div class="value">${escapeHtml(value)}</div>
      <div class="desc">${escapeHtml(desc)}</div>
    </div>
  `;
}

function renderSmallMetric(label, value, desc, percent = 0) {
  const tone = getToneByPercent(percent);
  return `
    <div class="small-metric small-metric--${tone}">
      <b>${formatNumber(value)}</b>
      <span>${escapeHtml(label)}</span>
      <small>${escapeHtml(desc)}</small>
      <div class="small-metric-percent">${percent.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</div>
      <div class="small-metric-track"><span class="small-metric-bar small-metric-bar--${tone}" style="width:${Math.max(0, Math.min(100, percent))}%"></span></div>
    </div>
  `;
}

function getMethodPalette(index) {
  const palette = [
    { color: '#2563eb', gradient: 'linear-gradient(135deg,#2563eb,#60a5fa)' },
    { color: '#14b8a6', gradient: 'linear-gradient(135deg,#0f766e,#2dd4bf)' },
    { color: '#8b5cf6', gradient: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
    { color: '#f59e0b', gradient: 'linear-gradient(135deg,#f97316,#fbbf24)' },
    { color: '#22c55e', gradient: 'linear-gradient(135deg,#16a34a,#86efac)' },
    { color: '#64748b', gradient: 'linear-gradient(135deg,#64748b,#94a3b8)' },
    { color: '#ec4899', gradient: 'linear-gradient(135deg,#db2777,#f472b6)' }
  ];

  return palette[index % palette.length];
}

function buildMethodComparisonRows(data) {
  const map = new Map();

  (data.byMetodePlanning || []).forEach((item) => {
    const key = String(item.name || 'Tidak Terisi').trim() || 'Tidak Terisi';
    const row = map.get(key) || {
      name: key,
      paguValue: 0,
      paguCount: 0,
      realisasiValue: 0,
      realisasiCount: 0
    };

    row.paguValue = toNumber(item.value);
    row.paguCount = toNumber(item.count);
    map.set(key, row);
  });

  (data.byMetodeReal || []).forEach((item) => {
    const key = String(item.name || 'Tidak Terisi').trim() || 'Tidak Terisi';
    const row = map.get(key) || {
      name: key,
      paguValue: 0,
      paguCount: 0,
      realisasiValue: 0,
      realisasiCount: 0
    };

    row.realisasiValue = toNumber(item.value);
    row.realisasiCount = toNumber(item.count);
    map.set(key, row);
  });

  const totalPagu = sum(Array.from(map.values()).map((item) => item.paguValue));

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      sharePercent: totalPagu > 0 ? (item.paguValue / totalPagu) * 100 : 0,
      serapanPercent: item.paguValue > 0 ? (item.realisasiValue / item.paguValue) * 100 : 0
    }))
    .sort((a, b) => Math.max(b.paguValue, b.realisasiValue) - Math.max(a.paguValue, a.realisasiValue));
}

function renderInfoStat(label, value, desc, tone = '', meta = '') {
  const toneClass = tone ? ` summary-stat--${tone}` : '';
  return `
    <div class="summary-stat${toneClass}">
      <span class="summary-stat-label">${escapeHtml(label)}</span>
      <b>${escapeHtml(value)}</b>
      <small>${escapeHtml(desc)}</small>
      ${meta ? `<div class="summary-stat-meta">${escapeHtml(meta)}</div>` : ''}
    </div>
  `;
}

function renderQuickSummaryCard(data, scopeLabel, scopeDesc) {
  const warning = data.warningSummary || {
    totalPaket: (data.allprogRows || []).length,
    selesai: 0,
    sedangBerjalan: 0,
    belumBerjalan: 0,
    melewatiWaktuPemilihan: 0,
    melebihiTargetPemilihan: 0
  };

  const renderWarningCard = (type, label, value, desc, tone) => `
    <button type="button" class="summary-stat summary-stat--clickable ${tone ? `summary-stat--${tone}` : ''}" data-warning-type="${type}">
      <span class="summary-stat-label">${escapeHtml(label)}</span>
      <b>${escapeHtml(formatNumber(value))}</b>
      <small>${escapeHtml(desc)}</small>
    </button>
  `;

  return `
    <div class="card">
      <div class="section-title-row">
        <div>
          <span class="section-kicker">Paket Warning · ${escapeHtml(scopeLabel)}</span>
          <h3>Paket Warning</h3>
          <p class="section-subnote">Klik salah satu status untuk melihat daftar paketnya.</p>
        </div>
        <span class="soft-pill">${formatNumber(warning.totalPaket)} paket</span>
      </div>

      <div class="summary-stat-grid summary-stat-grid--warning">
        ${renderWarningCard('selesai', 'Selesai', warning.selesai, 'Paket sudah selesai/prosesnya sudah tuntas.', warning.selesai > 0 ? 'success' : '')}
        ${renderWarningCard('sedangBerjalan', 'Sedang Berjalan', warning.sedangBerjalan, 'Paket sudah ada proses/realisasi dan masih berjalan.', warning.sedangBerjalan > 0 ? 'info' : '')}
        ${renderWarningCard('belumBerjalan', 'Belum Berjalan', warning.belumBerjalan, 'Paket belum ada proses/realisasi yang tercatat.', 'muted')}
        ${renderWarningCard('melewatiWaktuPemilihan', 'Melewati Waktu Pemilihan', warning.melewatiWaktuPemilihan, 'Jadwal pemilihan sudah lewat, tapi paket belum selesai/bergerak sesuai data.', warning.melewatiWaktuPemilihan > 0 ? 'danger' : '')}
        ${renderWarningCard('melebihiTargetPemilihan', 'Melebihi Target Pemilihan', warning.melebihiTargetPemilihan, 'Realisasi/proses muncul lebih cepat dari jadwal pemilihan yang direncanakan.', warning.melebihiTargetPemilihan > 0 ? 'warning' : '')}
      </div>
    </div>
  `;
}

function renderDistributionCard(data, scopeLabel) {
  const methodRows = buildMethodComparisonRows(data).filter((item) => item.paguValue > 0).slice(0, 6);
  const totalPagu = sum(methodRows.map((item) => item.paguValue));

  if (!methodRows.length) {
    return `
      <div class="card">
        <div class="section-title-row">
          <div>
            <span class="section-kicker">Distribusi Pagu</span>
            <h3>Distribusi Pagu per Metode</h3>
          </div>
        </div>
        <div class="empty-state">Belum ada data pagu yang bisa ditampilkan.</div>
      </div>
    `;
  }

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  const first = methodRows[0];

  const segments = methodRows.map((item, index) => {
    const palette = getMethodPalette(index);
    const fraction = totalPagu > 0 ? item.paguValue / totalPagu : 0;
    const arcLength = Math.max((fraction * circumference) - 5, 0);
    const dashOffset = -(cumulative * circumference);
    cumulative += fraction;

    return `
      <circle
        class="distribution-donut-segment ${index === 0 ? 'is-active' : ''}"
        cx="110"
        cy="110"
        r="${radius}"
        fill="none"
        stroke="${palette.color}"
        stroke-width="24"
        stroke-linecap="round"
        stroke-dasharray="${arcLength} ${circumference}"
        stroke-dashoffset="${dashOffset}"
        transform="rotate(-90 110 110)"
        tabindex="0"
        role="button"
        aria-label="${escapeHtml(item.name)}"
        data-method-segment="true"
        data-method-name="${escapeHtml(item.name)}"
        data-method-value="${escapeHtml(formatMoney(item.paguValue))}"
        data-method-share="${escapeHtml(formatPercent(item.sharePercent))}"
        data-method-count="${escapeHtml(formatNumber(item.paguCount))}"
        data-method-color="${palette.color}">
      </circle>
    `;
  }).join('');

  const legends = methodRows.map((item, index) => {
    const palette = getMethodPalette(index);
    return `
      <button type="button" class="distribution-legend-item ${index === 0 ? 'is-active' : ''}" data-method-legend="true"
        data-method-name="${escapeHtml(item.name)}"
        data-method-value="${escapeHtml(formatMoney(item.paguValue))}"
        data-method-share="${escapeHtml(formatPercent(item.sharePercent))}"
        data-method-count="${escapeHtml(formatNumber(item.paguCount))}"
        data-method-color="${palette.color}">
        <span class="distribution-legend-main">
          <span class="distribution-legend-dot" style="background:${palette.color}"></span>
          <span>
            <b>${escapeHtml(item.name)}</b>
            <small>${escapeHtml(formatMoney(item.paguValue))}</small>
          </span>
        </span>
        <strong>${escapeHtml(formatPercent(item.sharePercent))}</strong>
      </button>
    `;
  }).join('');

  return `
    <div class="card distribution-card">
      <div class="section-title-row">
        <div>
          <span class="section-kicker">Distribusi Pagu</span>
          <h3>Distribusi Pagu per Metode</h3>
          <p class="section-subnote">Klik diagram atau daftar metode untuk melihat detail distribusi pagu. Satker: ${escapeHtml(scopeLabel)}</p>
        </div>
        <span class="soft-pill">${formatMoney(data.totalPagu)}</span>
      </div>

      <div class="distribution-card-body distribution-card-body--row">
        <div class="distribution-donut-panel">
          <div class="distribution-donut-wrap">
            <svg class="distribution-donut" viewBox="0 0 220 220" aria-label="Distribusi pagu per metode">
              <circle class="distribution-donut-track" cx="110" cy="110" r="${radius}" fill="none" stroke="#e7eef7" stroke-width="24"></circle>
              ${segments}
            </svg>
            <div class="distribution-donut-center">
              <span>Total Pagu</span>
              <b>${escapeHtml(formatCompactMetric(data.totalPagu))}</b>
              <small>Klik metode di kanan</small>
            </div>
          </div>
        </div>

        <div class="distribution-detail-panel">
          <div class="distribution-insight" id="distributionInsight">
            <span class="distribution-insight-color" id="distributionInsightColor" style="background:${getMethodPalette(0).color}"></span>
            <div class="distribution-insight-body">
              <small>Metode terpilih</small>
              <b id="distributionInsightName">${escapeHtml(first.name)}</b>
              <div class="distribution-insight-value" id="distributionInsightValue">${escapeHtml(formatMoney(first.paguValue))}</div>
              <div class="distribution-insight-meta" id="distributionInsightMeta">${escapeHtml(formatPercent(first.sharePercent))} dari total pagu · ${escapeHtml(formatNumber(first.paguCount))} paket</div>
            </div>
          </div>

          <div class="distribution-legend-list">
            ${legends}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderMethodComparisonCard(data, scopeLabel) {
  const rows = buildMethodComparisonRows(data)
    .filter((item) => (item.paguValue > 0 || item.realisasiValue > 0) && String(item.name || '').trim().toLowerCase() !== 'tidak terisi')
    .slice(0, 8);

  if (!rows.length) {
    return `
      <div class="card">
        <div class="section-title-row">
          <div>
            <span class="section-kicker">Perencanaan & Realisasi · ${escapeHtml(scopeLabel)}</span>
            <h3>Komposisi Pagu vs Realisasi per Metode</h3>
          </div>
        </div>
        <div class="empty-state">Belum ada data metode yang bisa dibandingkan.</div>
      </div>
    `;
  }

  return `
    <div class="card method-comparison-card">
      <div class="section-title-row">
        <div>
          <span class="section-kicker">Perencanaan & Realisasi · ${escapeHtml(scopeLabel)}</span>
          <h3>Komposisi Pagu vs Realisasi per Metode</h3>
          <p class="section-subnote">Perbandingan realisasi terhadap pagu pada setiap metode pengadaan.</p>
        </div>
        <div class="section-pill-group">
          <span class="soft-pill">${formatNumber(data.totalPaketRup)} paket</span>
          <span class="soft-pill soft-pill--${getToneByPercent(data.realisasiPersen)}">Serapan ${formatPercent(data.realisasiPersen)}</span>
        </div>
      </div>

      <div class="summary-stat-grid summary-stat-grid--method">
        ${renderInfoStat('Total Pagu', formatMoney(data.totalPagu), 'Akumulasi nilai pagu perencanaan')}
        ${renderInfoStat('Total Realisasi', formatMoney(data.totalRealisasi), 'Akumulasi nilai realisasi paket')}
        ${renderInfoStat('Serapan Total', formatPercent(data.realisasiPersen), 'Persentase realisasi terhadap pagu', getToneByPercent(data.realisasiPersen))}
      </div>

      <div class="method-comparison-list">
        ${rows.map((item, index) => {
          const serapanTone = getToneByPercent(item.serapanPercent);
          return `
            <div class="method-compare-item method-compare-item--reference">
              <div class="method-compare-head method-compare-head--reference">
                <div class="method-compare-title">
                  <span class="bar-index">${index + 1}</span>
                  <div>
                    <b>${escapeHtml(item.name)}</b>
                    <small>Realisasi ${escapeHtml(formatMoney(item.realisasiValue))} / Pagu ${escapeHtml(formatMoney(item.paguValue))}</small>
                  </div>
                </div>

                <div class="method-compare-metric">
                  <div class="method-compare-percent method-compare-percent--${serapanTone}">${formatPercent(item.serapanPercent)}</div>
                  <small>${formatNumber(item.realisasiCount)} / ${formatNumber(item.paguCount)} paket</small>
                </div>
              </div>

              <div class="method-track method-track--reference">
                <span class="method-track-fill method-track-fill--${serapanTone}" style="width:${Math.max(0, Math.min(100, item.serapanPercent))}%"></span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderDimension(item) {
  const percent = item.max > 0 ? Math.min(100, (toNumber(item.value) / item.max) * 100) : 0;
  const route = item.route || '';
  const tone = getToneByPercent(percent);
  const detailText = String(item.detailText || '').trim();
  const detailHref = String(item.detailHref || '').trim();
  const detailHtml = detailText
    ? detailHref
      ? `<a class="dim-detail-link" href="${escapeHtml(detailHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(detailText)}</a>`
      : `<span class="dim-detail-text">${escapeHtml(detailText)}</span>`
    : '';

  return `
    <button class="dim-row dim-row--${escapeHtml(item.accent || 'blue')} dim-row--button dim-row--${tone}" type="button" data-route="${escapeHtml(route)}" title="${escapeHtml(item.hint || 'Klik untuk membuka modul monitoring')}">
      <div class="dim-name">
        <span>${escapeHtml(item.name)}</span>
        <small>${escapeHtml(item.hint || 'Buka detail')}</small>
      </div>
      <div class="dim-progress-wrap">
        <div class="bar">
          <span class="dim-progress-fill dim-progress-fill--${tone}" style="width:${percent}%"></span>
        </div>
        ${detailHtml ? `<div class="dim-detail">${detailHtml}</div>` : ''}
      </div>
      <div class="dim-value">${Math.round(toNumber(item.value)).toLocaleString('id-ID')}/${item.max}</div>
    </button>
  `;
}

function renderBarList(items, maxValue, type) {
  if (!items.length) {
    return `<div class="empty-state">Belum ada data yang bisa ditampilkan.</div>`;
  }

  return items.map((item, index) => {
    const percent = maxValue > 0 ? Math.max(2, (item.value / maxValue) * 100) : 0;

    return `
      <div class="bar-item">
        <div class="bar-item-top">
          <div>
            <span class="bar-index">${index + 1}</span>
            <b>${escapeHtml(item.name)}</b>
          </div>
          <strong>${formatMoney(item.value)}</strong>
        </div>
        <div class="bar-item-sub">
          <span>${formatNumber(item.count)} paket</span>
          <span>${type === 'pagu' ? 'Pagu' : 'Realisasi'}</span>
        </div>
        <div class="bar-line">
          <span style="width:${percent}%"></span>
        </div>
      </div>
    `;
  }).join('');
}

function renderRankRows(items, mode) {
  if (!items.length) {
    return `<div class="empty-state">Belum ada nilai ITKP.</div>`;
  }

  return items.map((item, index) => `
    <div class="rank-row rank-row--${mode}">
      <div class="rank-number">${index + 1}</div>
      <div class="rank-name">${escapeHtml(item.name)}</div>
      <div class="rank-score">${toNumber(item.score).toLocaleString('id-ID', { maximumFractionDigits: 2 })}</div>
    </div>
  `).join('');
}

function renderCompactList(items, type) {
  if (!items.length) {
    return `<div class="empty-state">Belum ada data.</div>`;
  }

  return items.map((item, index) => `
    <div class="compact-item">
      <div class="compact-index">${index + 1}</div>
      <div class="compact-main">
        <b>${escapeHtml(item.name)}</b>
        <span>${formatNumber(item.count)} paket · ${type === 'pagu' ? 'Pagu' : 'Realisasi'}</span>
      </div>
      <strong>${formatMoney(item.value)}</strong>
    </div>
  `).join('');
}

function renderActivity(color, icon, title, text, time) {
  return `
    <div class="activity-item">
      <div class="activity-icon" style="background:${color}">${icon}</div>

      <div>
        <div class="activity-title">${escapeHtml(title)}</div>
        <div class="activity-text">${escapeHtml(text)}</div>
      </div>

      <div class="activity-time">${escapeHtml(time)}</div>
    </div>
  `;
}

function renderQuickCard(icon, bg, title, text, route, externalUrl = '') {
  const dataAttrs = externalUrl
    ? `data-external="${escapeHtml(externalUrl)}"`
    : `data-quick="${escapeHtml(route)}"`;

  return `
    <button class="quick-card" type="button" ${dataAttrs}>
      <div class="quick-icon" style="background:${bg}">${icon}</div>

      <div>
        <div class="quick-title">${escapeHtml(title)}</div>
        <div class="quick-text">${escapeHtml(text)}</div>
      </div>

      <div class="quick-arrow">›</div>
    </button>
  `;
}

function renderIframePage(page) {
  const lowerUrl = String(page.url || '').toLowerCase();
  const isSimNontender = lowerUrl.includes('simppk');
  const isInternalRapor = lowerUrl.includes('script.google.com/macros');
  const isFullPageIframe = Boolean(page.fullPage);
  const iframeId = isSimNontender ? 'simppkFrame' : (isInternalRapor ? 'internalRaporFrame' : 'genericEmbedFrame');

  if (isInternalRapor) {
    contentArea.classList.add('iframe-internal-rapor-mode');
    contentArea.innerHTML = `
      <section class="embed-card embed-card--internal-full">
        <div class="embed-frame-wrap embed-frame-wrap--internal-full">
          <iframe
            id="${iframeId}"
            class="embed-frame embed-frame--internal-full"
            src="${page.url}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            scrolling="yes">
          </iframe>
        </div>
      </section>
    `;
  } else if (isFullPageIframe) {
    contentArea.classList.add('iframe-fullpage-mode');
    contentArea.innerHTML = `
      <section class="embed-card embed-card--fullpage">
        <div class="embed-frame-wrap embed-frame-wrap--fullpage">
          <iframe
            id="${iframeId}"
            class="embed-frame embed-frame--fullpage"
            src="${page.url}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            scrolling="yes">
          </iframe>
        </div>
      </section>
    `;
  } else {
    contentArea.innerHTML = `
      <section class="embed-card ${isSimNontender ? 'embed-card--simppk' : ''}">
        <h3>${escapeHtml(page.title)}</h3>
        <div class="page-note">Halaman dimuat dari project/modul yang sudah ada.</div>

        <div class="embed-frame-wrap ${isSimNontender ? 'embed-frame-wrap--simppk' : ''}">
          <iframe
            id="${iframeId}"
            class="embed-frame ${isSimNontender ? 'embed-frame--simppk' : ''}"
            src="${page.url}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            scrolling="${isSimNontender ? 'no' : 'yes'}">
          </iframe>
        </div>
      </section>
    `;
  }

  if (isSimNontender) {
    const iframe = document.getElementById('simppkFrame');

    const resizeIframe = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        if (!doc) {
          return;
        }

        const body = doc.body;
        const html = doc.documentElement;

        const height = Math.max(
          body ? body.scrollHeight : 0,
          body ? body.offsetHeight : 0,
          html ? html.clientHeight : 0,
          html ? html.scrollHeight : 0,
          html ? html.offsetHeight : 0,
          820
        );

        iframe.style.height = `${height + 40}px`;
      } catch (error) {
        iframe.style.height = 'calc(100vh - 170px)';
        iframe.setAttribute('scrolling', 'yes');
      }
    };

    iframe.addEventListener('load', () => {
      resizeIframe();

      setTimeout(resizeIframe, 300);
      setTimeout(resizeIframe, 1000);
      setTimeout(resizeIframe, 2000);
    });
  }

  if (isInternalRapor) {
    const iframe = document.getElementById('internalRaporFrame');
    if (iframe) {
      iframe.addEventListener('load', () => {
        iframe.classList.add('is-loaded');
      });
    }
  }
}

function renderPlaceholderPage(pageKey, page) {
  contentArea.innerHTML = `
    <section class="card">
      <h3>${escapeHtml(page.title)}</h3>

      <div class="placeholder-grid">
        <div class="placeholder-box">
          <h4>Modul belum dihubungkan</h4>
          <p>Halaman ini sedang disiapkan.</p>
        </div>
    </section>
  `;
}

function updateActiveMenu(key) {
  document.querySelectorAll('.nav-link, .submenu-link').forEach((el) => {
    el.classList.remove('active');
  });

  const directButton = document.querySelector(`.nav-link[data-page="${key}"]`);
  const subButton = document.querySelector(`.submenu-link[data-page="${key}"]`);

  if (directButton) {
    directButton.classList.add('active');
  }

  if (subButton) {
    subButton.classList.add('active');

    const group = subButton.closest('.nav-group');
    if (group) {
      group.classList.add('open');
    }
  }
}

function closeFlyout() {
  if (activeFlyout) {
    activeFlyout.remove();
    activeFlyout = null;
  }
}

function cleanupDynamicModule() {
  closeFlyout();

  if (typeof scrollAnimationDestroy === 'function') {
    scrollAnimationDestroy();
    scrollAnimationDestroy = null;
  }

  if (typeof currentModuleDestroy === 'function') {
    try {
      currentModuleDestroy();
    } catch (error) {
      console.warn('Cleanup module lama gagal:', error);
    }
  }

  currentModuleDestroy = null;

  try {
    delete window.__moduleInit;
  } catch (error) {
    window.__moduleInit = undefined;
  }

  document.querySelectorAll('[data-dynamic-module-css]').forEach((el) => {
    el.remove();
  });

  document.querySelectorAll('[data-dynamic-module-js]').forEach((el) => {
    el.remove();
  });
}

function loadExternalScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-dynamic-external-script="true"][src="${src}"]`);

    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Gagal memuat ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.dynamicExternalScript = 'true';
    script.dataset.loaded = 'false';

    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Gagal memuat ${src}`));
    };

    document.body.appendChild(script);
  });
}

function loadModuleCss(href) {
  return new Promise((resolve, reject) => {
    if (!href) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cacheBust(href);
    link.setAttribute('data-dynamic-module-css', 'true');

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Gagal memuat CSS ${href}`));

    document.head.appendChild(link);
  });
}

function loadModuleJs(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = cacheBust(src);
    script.async = false;
    script.setAttribute('data-dynamic-module-js', 'true');

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Gagal memuat JS ${src}`));

    document.body.appendChild(script);
  });
}

async function fetchModuleHtml(path) {
  const response = await fetch(cacheBust(path), {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} saat memuat HTML ${path}`);
  }

  return response.text();
}

function extractModuleBody(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  if (doc.body && doc.body.innerHTML.trim()) {
    return doc.body.innerHTML;
  }

  return rawHtml;
}

async function renderModulePage(page) {
  const token = ++activeModuleToken;

  cleanupDynamicModule();
  showModuleLoading(page.title || 'Memuat modul...');

  try {
    if (Array.isArray(page.externalScripts) && page.externalScripts.length) {
      for (const src of page.externalScripts) {
        await loadExternalScriptOnce(src);

        if (token !== activeModuleToken) {
          return false;
        }
      }
    }

    const rawHtml = await fetchModuleHtml(page.html);

    if (token !== activeModuleToken) {
      return false;
    }

    await loadModuleCss(page.css);

    if (token !== activeModuleToken) {
      return false;
    }

    const moduleContent = extractModuleBody(rawHtml);

    contentArea.innerHTML = `
      <section class="module-page module-page--native">
        ${moduleContent}
      </section>
    `;

    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (token !== activeModuleToken) {
      return false;
    }

    await loadModuleJs(page.js);

    if (token !== activeModuleToken) {
      return false;
    }

    const moduleContainer = contentArea.querySelector('.module-page--native') || contentArea;

    if (typeof window.__moduleInit === 'function') {
      const destroyFn = window.__moduleInit({
        container: moduleContainer,
        route: page
      });

      currentModuleDestroy = typeof destroyFn === 'function' ? destroyFn : null;
    } else {
      currentModuleDestroy = null;
    }

    applyDashboardContextToModule(page, moduleContainer);
    return true;
  } catch (error) {
    console.error('Gagal memuat module:', error);

    if (token !== activeModuleToken) {
      return false;
    }

    contentArea.innerHTML = `
      <section class="card">
        <h3>Gagal memuat modul</h3>
        <p>File modul tidak bisa dimuat. Cek path HTML, CSS, JS, atau inisialisasi modul.</p>
        <p><b>Detail:</b> ${escapeHtml(error.message)}</p>
      </section>
    `;

    return false;
  }
}

async function loadPage(key) {
  const page = APP_ROUTES[key] || APP_ROUTES.dashboard;

  if (loadingPageKey === key) {
    return;
  }

  if (activePageKey === key) {
    updateActiveMenu(key);
    return;
  }

  loadingPageKey = key;
  updateActiveMenu(key);

  try {
    let success = true;

    if (page.type !== 'module') {
      activeModuleToken++;
      cleanupDynamicModule();
      contentArea.classList.remove('module-mode');
      contentArea.classList.remove('iframe-internal-rapor-mode');
      contentArea.classList.remove('iframe-fullpage-mode');
    } else {
      contentArea.classList.add('module-mode');
    }

    if (page.type === 'iframe') {
      renderIframePage(page);
    } else if (page.type === 'module') {
      success = await renderModulePage(page);
    } else if (page.type === 'placeholder') {
      renderPlaceholderPage(key, page);
    } else {
      renderDashboard();
    }

    if (success) {
      activePageKey = key;
    }

    initScrollAnimation();

    if (window.innerWidth <= 980 && sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  } finally {
    if (loadingPageKey === key) {
      loadingPageKey = '';
    }
  }
}

function showSecretLogin() {
  if (!secretLoginOverlay) return;
  if (secretLoginError) secretLoginError.textContent = '';
  if (secretUsername) secretUsername.value = '';
  if (secretPassword) secretPassword.value = '';
  secretLoginOverlay.classList.add('show');
  secretLoginOverlay.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => {
    if (secretUsername) secretUsername.focus();
  }, 30);
}

function hideSecretLogin() {
  if (!secretLoginOverlay) return;
  secretLoginOverlay.classList.remove('show');
  secretLoginOverlay.setAttribute('aria-hidden', 'true');
}

function showSecretToast(message = 'Mode internal aktif') {
  if (!secretLoginToast) return;
  secretLoginToast.textContent = message;
  secretLoginToast.classList.add('show');
  window.clearTimeout(showSecretToast._timer);
  showSecretToast._timer = window.setTimeout(() => {
    secretLoginToast.classList.remove('show');
  }, 2200);
}

function setInternalMenuVisible(isVisible) {
  if (!internalNavGroup) return;
  internalNavGroup.hidden = !isVisible;
  if (!isVisible) {
    internalNavGroup.classList.remove('open');
  }
}

function unlockInternalMenu() {
  sessionStorage.setItem(SECRET_SESSION_KEY, '1');
  setInternalMenuVisible(true);
  showSecretToast('Panel internal aktif');
}

function restoreInternalMenu() {
  setInternalMenuVisible(sessionStorage.getItem(SECRET_SESSION_KEY) === '1');
}

function handleSecretTriggerClick() {
  secretTriggerCount += 1;
  window.clearTimeout(secretTriggerTimer);
  secretTriggerTimer = window.setTimeout(() => {
    secretTriggerCount = 0;
  }, 1300);

  if (secretTriggerCount >= 5) {
    secretTriggerCount = 0;
    showSecretLogin();
  }
}

function bindSecretLogin() {
  restoreInternalMenu();

  if (secretTrigger) {
    secretTrigger.addEventListener('click', handleSecretTriggerClick);
  }

  if (secretLoginCancel) {
    secretLoginCancel.addEventListener('click', hideSecretLogin);
  }

  if (secretLoginOverlay) {
    secretLoginOverlay.addEventListener('click', (event) => {
      if (event.target === secretLoginOverlay) {
        hideSecretLogin();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && secretLoginOverlay && secretLoginOverlay.classList.contains('show')) {
      hideSecretLogin();
    }
  });

  if (secretLoginForm) {
    secretLoginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = String(secretUsername?.value || '').trim();
      const password = String(secretPassword?.value || '');

      if (username === SECRET_LOGIN_USER && password === SECRET_LOGIN_PASS) {
        unlockInternalMenu();
        hideSecretLogin();
        return;
      }

      if (secretLoginError) {
        secretLoginError.textContent = 'Username atau password salah.';
      }
      if (secretPassword) secretPassword.value = '';
      if (secretPassword) secretPassword.focus();
    });
  }
}

function bindMenu() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const pageKey = button.dataset.page;

      if (!pageKey) {
        return;
      }

      loadPage(pageKey);
    });
  });

  document.querySelectorAll('[data-toggle-group]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const groupName = button.dataset.toggleGroup;
      const group = document.querySelector(`.nav-group[data-group="${groupName}"]`);

      if (!group) {
        return;
      }

      if (sidebar && sidebar.classList.contains('collapsed') && window.innerWidth > 980) {
        event.preventDefault();
        toggleFlyout(button, groupName);
        return;
      }

      group.classList.toggle('open');
    });
  });

  if (sidebarToggleButton && sidebar) {
    sidebarToggleButton.addEventListener('click', () => {
      if (window.innerWidth <= 980) {
        sidebar.classList.toggle('mobile-open');
      } else {
        sidebar.classList.toggle('collapsed');
        closeFlyout();
      }
    });
  }

  document.addEventListener('click', (event) => {
    if (!activeFlyout) {
      return;
    }

    const clickedInsideFlyout = activeFlyout.contains(event.target);
    const clickedToggle = event.target.closest('[data-toggle-group]');

    if (!clickedInsideFlyout && !clickedToggle) {
      closeFlyout();
    }
  });

  window.addEventListener('resize', () => {
    closeFlyout();

    if (window.innerWidth > 980 && sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  });
}

function toggleFlyout(toggleButton, groupName) {
  if (!toggleButton) {
    return;
  }

  if (activeFlyout && activeFlyout.dataset.group === groupName) {
    closeFlyout();
    return;
  }

  closeFlyout();

  const group = document.querySelector(`.nav-group[data-group="${groupName}"]`);

  if (!group) {
    return;
  }

  const submenuLinks = group.querySelectorAll('.submenu-link');

  if (!submenuLinks.length) {
    return;
  }

  const titleMap = {
    itkp: 'ITKP',
    realisasi: 'Realisasi Paket',
    simulasi: 'Simulasi',
    internal: 'Panel Internal'
  };

  const flyout = document.createElement('div');
  flyout.className = 'sidebar-flyout';
  flyout.dataset.group = groupName;

  flyout.innerHTML = `
    <div class="sidebar-flyout-title">${escapeHtml(titleMap[groupName] || 'Menu')}</div>

    ${Array.from(submenuLinks).map((link) => {
      const isActive = link.classList.contains('active') ? ' active' : '';

      return `
        <button class="flyout-link${isActive}" type="button" data-page="${escapeHtml(link.dataset.page)}">
          ${escapeHtml(link.textContent)}
        </button>
      `;
    }).join('')}
  `;

  document.body.appendChild(flyout);

  const rect = toggleButton.getBoundingClientRect();

  flyout.style.top = `${rect.top}px`;
  flyout.style.left = `${rect.right + 12}px`;

  flyout.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeFlyout();
      loadPage(btn.dataset.page);
    });
  });

  activeFlyout = flyout;
}

bindSecretLogin();
bindMenu();
loadPage('dashboard');
