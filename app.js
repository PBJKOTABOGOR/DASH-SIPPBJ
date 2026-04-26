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
    title: 'Monitoring Non Tender',
    subtitle: 'Halaman ini disiapkan untuk monitoring Non eTendering/Non ePurchasing.',
    type: 'placeholder'
  },

  'rapor-pbj': {
    title: 'Rapor PBJ',
    subtitle: 'Portal laporan Rapor PBJ perangkat daerah.',
    type: 'iframe',
    url: 'https://pbjkotabogor.github.io/raporpbj/'
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
    subtitle: 'Halaman ini disiapkan untuk monitoring paket konsolidasi.',
    type: 'placeholder'
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
  }
};

const contentArea = document.getElementById('contentArea');
const sidebar = document.getElementById('sidebar');
const sidebarToggleButton = document.getElementById('sidebarToggleButton');

let activeModuleToken = 0;
let currentModuleDestroy = null;
let activeFlyout = null;
let activePageKey = '';
let loadingPageKey = '';
let scrollAnimationDestroy = null;
let dashboardPanjiDestroy = null;

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
  }
};

const DASHBOARD_STATE = {
  loading: false,
  loadedAt: null,
  error: null,
  data: null,
  selectedItkpSatker: 'PEMERINTAH KOTA BOGOR'
};

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
  const name = getField(row || {}, ['Satuan Kerja', 'Nama Satuan Kerja', 'nama_satker']) || fallbackName;

  return {
    name,
    __sourceRow: row || {},
    score: getItkpScore(row || {}),
    dimensions: [
      {
        name: 'SiRUP',
        value: toNumber(getField(row || {}, ['Nilai ITKP - skor maksimal 10 (point) (SIRUP)', 'SIRUP'])),
        max: 10,
        accent: 'blue',
        route: 'monitoring-sirup',
        hint: 'Klik untuk buka Monitoring SiRUP'
      },
      {
        name: 'Toko Daring',
        value: toNumber(getField(row || {}, ['Nilai ITKP - skor maksimal 1 (point) (Toko Daring)', 'Toko Daring'])),
        max: 1,
        accent: 'teal',
        route: 'monitoring-ekatalog',
        hint: 'Klik untuk buka Monitoring eKatalog/Toko Daring'
      },
      {
        name: 'e-Purchasing',
        value: toNumber(getField(row || {}, ['Nilai ITKP - skor maksimal 4 (point) (Epurchasing)', 'Epurchasing', 'ePurchasing'])),
        max: 4,
        accent: 'purple',
        route: 'monitoring-ekatalog',
        hint: 'Klik untuk buka Monitoring eKatalog'
      },
      {
        name: 'e-Tendering',
        value: toNumber(getField(row || {}, ['Nilai ITKP - skor maksimal 5 (point) (etendering)', 'eTendering'])),
        max: 5,
        accent: 'orange',
        route: 'monitoring-etendering',
        hint: 'Klik untuk buka Monitoring eTendering'
      },
      {
        name: 'e-Kontrak',
        value: toNumber(getField(row || {}, ['Nilai ITKP - skor maksimal 5 (point) (ekontrak)', 'eKontrak'])),
        max: 5,
        accent: 'green',
        route: 'monitoring-ekontrak',
        hint: 'Klik untuk buka Monitoring eKontrak'
      },
      {
        name: 'Non Tender',
        value: toNumber(getField(row || {}, ['Nilai ITKP - skor maksimal 5 (point) (Non etendering & Non ePurchasing)', 'Non etendering', 'Non ePurchasing', 'Non Tender'])),
        max: 5,
        accent: 'red',
        route: 'monitoring-nontender',
        hint: 'Klik untuk buka Monitoring Non Tender'
      }
    ]
  };
}

function analyzeDashboardData(raw) {
  const itkpAllRows = raw.itkp || [];
  const subOpdAllRows = raw.itkpSubOpd || [];
  const planningRows = raw.perencanaan || [];
  const realRows = raw.realisasi || [];

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
  const normalizeSatkerName = (value) => String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');

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

  return {
    itkpRows: itkpOpdRows,
    itkpSubOpdRows: subOpdRows,
    planningRows,
    realRows,
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
    lowItkp
  };
}

async function loadDashboardData(force = false) {
  if (DASHBOARD_STATE.data && !force) return DASHBOARD_STATE.data;
  if (DASHBOARD_STATE.loading) return DASHBOARD_STATE.data;

  DASHBOARD_STATE.loading = true;
  DASHBOARD_STATE.error = null;

  try {
    const [itkp, itkpSubOpd, perencanaan, realisasi] = await Promise.all([
      fetchSheetRows(DASHBOARD_SHEETS.itkp),
      fetchSheetRows(DASHBOARD_SHEETS.itkpSubOpd),
      fetchSheetRows(DASHBOARD_SHEETS.perencanaan),
      fetchSheetRows(DASHBOARD_SHEETS.realisasi)
    ]);

    DASHBOARD_STATE.data = analyzeDashboardData({ itkp, itkpSubOpd, perencanaan, realisasi });
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
  contentArea.innerHTML = `
    <section class="hero-card hero-card--dashboard">
      <div class="hero-glow"></div>
      <div class="hero-kicker">SIPPBJ · Dashboard</div>
      <h3>Dashboard Profil Pengadaan Barang/Jasa Kota Bogor</h3>
      <p>Menarik data dari FIX ITKP OPD, D_PERENCANAAN, dan D_REALISASI untuk merangkum profil ITKP, perencanaan, realisasi, metode pengadaan, OPD dominan, serta indikator progress pengadaan.</p>

      <div class="dashboard-loading">
        <div class="loading-orb"></div>
        <div>
          <b>Memuat data dashboard...</b>
          <span>Mengambil data Google Sheet dan menyusun analisis Kota Bogor.</span>
        </div>
      </div>
    </section>
  `;
}

function renderDashboardError(error) {
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
  renderDashboardSkeleton();

  try {
    const data = await loadDashboardData(force);
    renderDashboardReady(data);
    bindDashboardEvents();
    initDashboardPanji(data);
  } catch (error) {
    console.error('Dashboard gagal dimuat:', error);
    renderDashboardError(error);
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

  contentArea.innerHTML = `
    <section class="hero-card hero-card--dashboard">
      <div class="hero-glow"></div>

      <div class="hero-topline">
        <div>
          <div class="hero-kicker">SIPPBJ · Dashboard</div>
          <h3>Dashboard Profil Pengadaan Barang/Jasa Kota Bogor</h3>
          <p>Ringkasan interaktif dari ITKP Kota Bogor, profil perencanaan, realisasi paket, metode pengadaan, dan performa OPD/Sub OPD berdasarkan data Google Sheet yang tersedia.</p>
        </div>

        <div class="hero-badge">
          <span>Update</span>
          <b>${escapeHtml(lastUpdate)}</b>
        </div>
      </div>

      <div class="stats-grid dashboard-kpi-grid">
        ${renderKpiCard('Skor ITKP Kota Bogor', formatScore(data.itkpOverall), 'Mengambil baris agregat PEMERINTAH KOTA BOGOR, tidak dihitung ulang dari OPD', '📊')}
        ${renderKpiCard('Pagu Perencanaan', formatMoney(data.totalPagu), `${formatNumber(data.totalPaketRup)} paket · ${scopeLabel}`, '🧾')}
        ${renderKpiCard('Realisasi', formatMoney(data.totalRealisasi), `${formatPercent(data.realisasiPersen)} dari pagu · ${scopeLabel}`, '💰')}
        ${renderKpiCard('Paket Realisasi', formatNumber(data.totalPaketRealisasi), `${formatNumber(data.selesaiCount)} selesai · ${formatNumber(data.processCount)} proses · ${scopeLabel}`, '📦')}
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
            <p class="section-subnote">Pilih satuan kerja untuk melihat komposisi skor per indikator. Baris <b>PEMERINTAH KOTA BOGOR</b> dipakai sebagai skor agregat kota, dibaca langsung dari kolom <b>Nilai ITKP Pemanfaatan Sistem</b>, dan tidak masuk ranking OPD.</p>
          </div>

          <label class="satker-select-wrap">
            <span>Pilih Satuan Kerja</span>
            <select id="itkpSatkerSelect" class="satker-select">
              ${data.itkpProfiles.map((profile) => `
                <option value="${escapeHtml(profile.name)}" ${profile.name === selectedProfile.name ? 'selected' : ''}>
                  ${escapeHtml(profile.name)}
                </option>
              `).join('')}
            </select>
          </label>
        </div>

        <div class="itkp-radar-layout">
          <div class="score-orbit">
            <div class="score-ring" style="--score:${Math.min(100, (selectedProfile.score / 30) * 100)}">
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

      <div class="card">
        <div class="section-title-row">
          <div>
            <span class="section-kicker">Kinerja Realisasi · ${escapeHtml(scopeLabel)}</span>
            <h3>Progress Pagu vs Realisasi</h3>
          </div>
          <span class="soft-pill">${formatPercent(data.realisasiPersen)}</span>
        </div>

        <div class="money-progress">
          <div class="money-row">
            <span>Total Pagu</span>
            <b>${formatMoney(data.totalPagu)}</b>
          </div>
          <div class="money-row">
            <span>Total Realisasi</span>
            <b>${formatMoney(data.totalRealisasi)}</b>
          </div>
          <div class="progress-track progress-track--tall">
            <div class="progress-bar" style="width:${Math.min(100, data.realisasiPersen)}%"></div>
          </div>
          <p class="page-note">${escapeHtml(scopeDesc)}. Persentase dihitung dari nilai realisasi pada D_REALISASI dibanding nilai pagu pada D_PERENCANAAN.</p>
        </div>

        <div class="status-mini-grid">
          ${renderSmallMetric('BAST Terisi', data.bastCount, 'Dokumen/referensi BAST')}
          ${renderSmallMetric('Selesai', data.selesaiCount, 'Status paket selesai')}
          ${renderSmallMetric('Proses', data.processCount, 'Masih berjalan/proses')}
        </div>
      </div>
    </section>

    <section class="dashboard-grid dashboard-grid--two">
      <div class="card">
        <div class="section-title-row">
          <div>
            <span class="section-kicker">Perencanaan · ${escapeHtml(scopeLabel)}</span>
            <h3>Komposisi Pagu per Metode</h3>
          </div>
          <span class="soft-pill">${formatNumber(data.totalPaketRup)} paket</span>
        </div>
        <div class="bar-list">
          ${renderBarList(data.byMetodePlanning.slice(0, 8), data.byMetodePlanning[0]?.value || 1, 'pagu')}
        </div>
      </div>

      <div class="card">
        <div class="section-title-row">
          <div>
            <span class="section-kicker">Realisasi · ${escapeHtml(scopeLabel)}</span>
            <h3>Komposisi Realisasi per Metode</h3>
          </div>
          <span class="soft-pill">${formatNumber(data.totalPaketRealisasi)} paket</span>
        </div>
        <div class="bar-list">
          ${renderBarList(data.byMetodeReal.slice(0, 8), data.byMetodeReal[0]?.value || 1, 'realisasi')}
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

    <section class="quick-grid">
      ${renderQuickCard('📊', 'linear-gradient(135deg,#2665df,#3a8bff)', 'ITKP - SiRUP', 'Lihat monitoring indikator ITKP dari modul SiRUP.', 'monitoring-sirup')}
      ${renderQuickCard('🛒', 'linear-gradient(135deg,#123a72,#2f9a8f)', 'ITKP - eKatalog', 'Pantau pemanfaatan transaksi katalog.', 'monitoring-ekatalog')}
      ${renderQuickCard('📦', 'linear-gradient(135deg,#7c54e9,#a075f3)', 'Monitoring Realisasi', 'Pantau progress realisasi paket perangkat daerah.', 'monitoring-perencanaan')}
      ${renderQuickCard('🗓️', 'linear-gradient(135deg,#ef8d21,#f8b14c)', 'Simulasi Timeline', 'Simulasikan jadwal pengadaan secara terstruktur.', 'simulasi-timeline')}
    </section>

    <div class="footer-note">© BenRama 2026 SIPPBJ - Dashboard UKPBJ Kota Bogor</div>
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

  const satkerSelect = document.getElementById('itkpSatkerSelect');

  if (satkerSelect) {
    satkerSelect.addEventListener('change', () => {
      DASHBOARD_STATE.selectedItkpSatker = satkerSelect.value;
      if (DASHBOARD_STATE.data) {
        DASHBOARD_STATE.data = analyzeDashboardData({
          itkp: DASHBOARD_STATE.data.cityProfile && DASHBOARD_STATE.data.cityProfile.__sourceRow
            ? DASHBOARD_STATE.data.itkpRows.concat([DASHBOARD_STATE.data.cityProfile.__sourceRow])
            : DASHBOARD_STATE.data.itkpRows,
          itkpSubOpd: DASHBOARD_STATE.data.itkpSubOpdRows,
          perencanaan: DASHBOARD_STATE.data.planningRows,
          realisasi: DASHBOARD_STATE.data.realRows
        });
        renderDashboardReady(DASHBOARD_STATE.data);
        bindDashboardEvents();
        initDashboardPanji(DASHBOARD_STATE.data, true);
        initScrollAnimation();
      }
    });
  }

  contentArea.querySelectorAll('[data-quick], [data-route]').forEach((item) => {
    item.addEventListener('click', () => {
      const route = item.dataset.quick || item.dataset.route;
      if (route) loadPage(route);
    });
  });
}

function renderKpiCard(label, value, desc, icon) {
  return `
    <div class="stat-card stat-card--lux" data-panji-kpi="${escapeHtml(label)}" data-panji-value="${escapeHtml(value)}" data-panji-desc="${escapeHtml(desc)}">
      <div class="stat-icon">${icon}</div>
      <div class="label">${escapeHtml(label)}</div>
      <div class="value">${escapeHtml(value)}</div>
      <div class="desc">${escapeHtml(desc)}</div>
    </div>
  `;
}

function renderSmallMetric(label, value, desc) {
  return `
    <div class="small-metric">
      <b>${formatNumber(value)}</b>
      <span>${escapeHtml(label)}</span>
      <small>${escapeHtml(desc)}</small>
    </div>
  `;
}

function renderDimension(item) {
  const percent = item.max > 0 ? Math.min(100, (toNumber(item.value) / item.max) * 100) : 0;
  const route = item.route || '';

  return `
    <button class="dim-row dim-row--${escapeHtml(item.accent || 'blue')} dim-row--button" type="button" data-route="${escapeHtml(route)}" title="${escapeHtml(item.hint || 'Klik untuk membuka modul monitoring')}">
      <div class="dim-name">
        <span>${escapeHtml(item.name)}</span>
        <small>${escapeHtml(item.hint || 'Buka detail')}</small>
      </div>
      <div class="bar">
        <span style="width:${percent}%"></span>
      </div>
      <div class="dim-value">${toNumber(item.value).toLocaleString('id-ID', { maximumFractionDigits: 2 })}/${item.max}</div>
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

function renderQuickCard(icon, bg, title, text, route) {
  return `
    <button class="quick-card" type="button" data-quick="${escapeHtml(route)}">
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
  contentArea.innerHTML = `
    <section class="embed-card">
      <h3>${escapeHtml(page.title)}</h3>
      <div class="page-note">Halaman dimuat dari project/modul yang sudah ada.</div>

      <div class="embed-frame-wrap">
        <iframe
          class="embed-frame"
          src="${page.url}"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </section>
  `;
}

function renderPlaceholderPage(pageKey, page) {
  contentArea.innerHTML = `
    <section class="card">
      <h3>${escapeHtml(page.title)}</h3>

      <div class="placeholder-grid">
        <div class="placeholder-box">
          <h4>Modul belum dihubungkan</h4>
          <p>Halaman ini sudah disiapkan di portal utama. Nanti saat project GitHub/halaman monitoring selesai, tinggal isi URL atau module path di file <b>app.js</b>.</p>
        </div>

        <div class="placeholder-box">
          <h4>Langkah berikutnya</h4>
          <p>Cari route <b>${escapeHtml(pageKey)}</b> pada objek <b>APP_ROUTES</b>, lalu ubah <b>type</b> menjadi <b>iframe</b> atau <b>module</b>.</p>
        </div>
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


/* =========================================================
   PANJI DASHBOARD ASSISTANT
   Tidak mengubah bentuk dashboard. PANJI hanya di-inject lewat JS,
   bisa bergerak ke elemen, menjelaskan nilai, tombol, indikator,
   serta memberi penilaian baik/cukup/butuh perhatian.
   ========================================================= */

function getPanjiDashboardStatus(value, maxValue = 30) {
  const score = toNumber(value);
  const max = toNumber(maxValue) || 30;
  const percent = max > 0 ? (score / max) * 100 : 0;

  if (score <= 0) {
    return {
      label: 'Belum Terdeteksi',
      tone: 'sad',
      text: 'Data belum terlihat atau masih nol. Perlu cek sumber data dan pencatatannya.'
    };
  }

  if (percent >= 85) {
    return {
      label: 'Sangat Baik',
      tone: 'happy',
      text: 'Capaian sudah kuat. Tinggal dijaga konsistensi datanya.'
    };
  }

  if (percent >= 70) {
    return {
      label: 'Baik',
      tone: 'happy',
      text: 'Capaian sudah baik, tetapi masih bisa dioptimalkan.'
    };
  }

  if (percent >= 50) {
    return {
      label: 'Cukup',
      tone: 'thinking',
      text: 'Capaian cukup, tetapi perlu penguatan agar tidak tertinggal.'
    };
  }

  return {
    label: 'Butuh Perhatian',
    tone: 'sad',
    text: 'Capaian masih rendah dan sebaiknya jadi prioritas pembinaan/perbaikan.'
  };
}

function getPanjiIndicatorMeaning(name) {
  const key = String(name || '').toLowerCase();

  if (key.includes('sirup')) {
    return 'SiRUP menunjukkan ketertiban perencanaan dan pengumuman RUP: paket, pagu, metode, dan jadwal.';
  }

  if (key.includes('toko')) {
    return 'Toko Daring menunjukkan pemanfaatan kanal belanja digital sederhana untuk kebutuhan yang sesuai.';
  }

  if (key.includes('purchasing')) {
    return 'e-Purchasing menunjukkan pemanfaatan e-Katalog untuk paket yang barang/jasanya tersedia dan sesuai kebutuhan.';
  }

  if (key.includes('tender')) {
    return 'e-Tendering menunjukkan proses tender/seleksi melalui SPSE dan ketertiban data pemilihannya.';
  }

  if (key.includes('kontrak')) {
    return 'e-Kontrak menunjukkan apakah hasil pemilihan sudah lanjut menjadi pencatatan kontrak elektronik.';
  }

  if (key.includes('non')) {
    return 'Non Tender menunjukkan ketertiban pencatatan paket non tender/non e-Purchasing sampai realisasi.';
  }

  return 'Indikator ini perlu dibaca dari nilai, sumber data, dan keterkaitannya dengan proses PBJ.';
}

function buildPanjiDashboardIntro(data) {
  const profile = data.selectedProfile || data.cityProfile;
  const status = getPanjiDashboardStatus(profile.score, 30);

  return `Halo, saya PANJI — Pengadaan Jitu.\n\nSaya tidak mengubah bentuk dashboard. Saya hanya hidup di atas dashboard untuk membantu membaca angka, tombol, indikator, dan memberi penilaian.\n\nSaat ini saya membaca ${profile.name}. Skor Pemanfaatan Sistem ITKP-nya ${formatScore(profile.score)} dari 30, kategori ${status.label}. ${status.text}`;
}

function buildPanjiFullDashboardAnalysis(data) {
  const profile = data.selectedProfile || data.cityProfile;
  const status = getPanjiDashboardStatus(profile.score, 30);
  const dimensions = profile.dimensions || [];

  const indicatorText = dimensions.map((item) => {
    const itemStatus = getPanjiDashboardStatus(item.value, item.max);
    return `• ${item.name}: ${formatScore(item.value)} dari ${formatScore(item.max)} — ${itemStatus.label}`;
  }).join('\n');

  const sorted = [...dimensions].sort((a, b) => {
    const aPercent = a.max > 0 ? toNumber(a.value) / a.max : 0;
    const bPercent = b.max > 0 ? toNumber(b.value) / b.max : 0;
    return aPercent - bPercent;
  });

  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  return `Analisis PANJI untuk ${profile.name}.\n\nTotal ITKP Pemanfaatan Sistem: ${formatScore(profile.score)} dari 30 — ${status.label}.\n\nRincian indikator:\n${indicatorText}\n\nYang paling kuat: ${strongest ? strongest.name : '-'}.\nYang perlu perhatian dulu: ${weakest ? weakest.name : '-'}.\n\nSaran PANJI: fokuskan perbaikan dari indikator terendah. Pastikan RUP/SiRUP tertib, katalog dicek, tender/seleksi tercatat, kontrak elektronik tidak tertinggal, paket non tender dicatat, dan realisasi tidak bolong.`;
}

function buildPanjiRecommendation(data) {
  const profile = data.selectedProfile || data.cityProfile;
  const dimensions = [...(profile.dimensions || [])]
    .map((item) => ({
      ...item,
      percent: item.max > 0 ? (toNumber(item.value) / item.max) * 100 : 0,
      status: getPanjiDashboardStatus(item.value, item.max)
    }))
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3);

  const priorityText = dimensions.map((item, index) => {
    return `${index + 1}. ${item.name} — ${item.status.label}. ${getPanjiIndicatorMeaning(item.name)}`;
  }).join('\n\n');

  return `Rekomendasi PANJI untuk ${profile.name}.\n\nPrioritas perbaikan:\n${priorityText || '-'}\n\nKesimpulan: jangan cuma mengejar angka. Pastikan alur PBJ tertib dari perencanaan, pemilihan metode, transaksi, kontrak, BAST, sampai realisasi.`;
}

function buildPanjiKpiExplanation(label, value, desc, data) {
  const cleanLabel = String(label || '').trim();
  const profile = data.selectedProfile || data.cityProfile;

  if (/itkp/i.test(cleanLabel)) {
    const status = getPanjiDashboardStatus(profile.score, 30);
    return `Ini kartu ${cleanLabel}. Nilainya ${formatScore(profile.score)} dari 30 untuk ${profile.name}. Kategorinya ${status.label}. ${status.text}`;
  }

  if (/pagu/i.test(cleanLabel)) {
    return `Ini kartu Pagu Perencanaan. Nilainya ${value}. Artinya dashboard membaca total pagu paket dari data perencanaan untuk scope ${data.scopeName}. Ini dipakai sebagai pembanding terhadap realisasi.`;
  }

  if (/realisasi/i.test(cleanLabel) && !/paket/i.test(cleanLabel)) {
    const status = getPanjiDashboardStatus(data.realisasiPersen, 100);
    return `Ini kartu Realisasi. Nilainya ${value}, atau ${formatPercent(data.realisasiPersen)} dari pagu. Kategorinya ${status.label}. Kalau rendah, cek paket yang belum jalan, belum kontrak, belum BAST, atau belum tercatat.`;
  }

  if (/paket/i.test(cleanLabel)) {
    return `Ini kartu Paket Realisasi. Nilainya ${value}. PANJI membaca jumlah paket realisasi, paket selesai, dan paket yang masih proses. Kalau banyak yang belum selesai, cek kontrak, BAST, dan pencatatan realisasi.`;
  }

  return `Ini kartu ${cleanLabel}. Nilainya ${value}. ${desc || 'PANJI membaca kartu ini sebagai ringkasan dashboard.'}`;
}

function buildPanjiDimensionExplanationByElement(button, data) {
  const name = button.querySelector('.dim-name span')?.textContent?.trim() || 'Indikator';
  const valueText = button.querySelector('.dim-value')?.textContent?.trim() || '';
  const profile = data.selectedProfile || data.cityProfile;
  const found = (profile.dimensions || []).find((item) => item.name === name);
  const status = found ? getPanjiDashboardStatus(found.value, found.max) : { label: 'Perlu dicek', text: '', tone: 'thinking' };

  return `${name} untuk ${profile.name}: ${valueText}. Kategorinya ${status.label}.\n\n${getPanjiIndicatorMeaning(name)}\n\n${status.text}`;
}

function buildPanjiQuickExplanation(button) {
  const title = button.querySelector('.quick-title')?.textContent?.trim() || 'Menu';
  const text = button.querySelector('.quick-text')?.textContent?.trim() || '';

  return `Ini tombol ${title}. ${text}\n\nKalau diklik, dashboard membuka modul detailnya. PANJI bisa bantu user tahu indikator mana yang harus dicek.`;
}

function injectDashboardPanjiCss() {
  if (document.getElementById('dashboard-panji-css')) return;

  const style = document.createElement('style');
  style.id = 'dashboard-panji-css';
  style.textContent = `
    .dash-panji{position:fixed;right:var(--dash-panji-right,34px);bottom:var(--dash-panji-bottom,86px);left:auto;top:auto;z-index:999999;display:flex;align-items:flex-end;gap:14px;pointer-events:none;transition:left .45s cubic-bezier(.2,.8,.2,1),top .45s cubic-bezier(.2,.8,.2,1),right .45s cubic-bezier(.2,.8,.2,1),bottom .45s cubic-bezier(.2,.8,.2,1),transform .25s ease;}
    .dash-panji *{pointer-events:auto;}
    .dash-panji-bubble{width:370px;min-height:128px;max-height:300px;overflow:auto;padding:16px;border-radius:22px;background:radial-gradient(circle at top left,rgba(59,130,246,.14),transparent 38%),rgba(255,255,255,.97);border:1px solid rgba(219,234,254,.95);box-shadow:0 22px 48px rgba(15,23,42,.18);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);position:relative;animation:dashPanjiBubbleIdle 3.8s ease-in-out infinite;}
    .dash-panji-bubble::after{content:"";position:absolute;right:-10px;bottom:34px;width:20px;height:20px;background:rgba(255,255,255,.97);border-right:1px solid rgba(219,234,254,.95);border-bottom:1px solid rgba(219,234,254,.95);transform:rotate(-45deg);}
    @keyframes dashPanjiBubbleIdle{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
    .dash-panji.dash-panji-minimized .dash-panji-bubble{opacity:0;visibility:hidden;width:0;min-width:0;min-height:0;max-height:0;padding:0;border:0;overflow:hidden;}
    .dash-panji-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}
    .dash-panji-name{display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border-radius:999px;background:linear-gradient(135deg,#123a72,#2563eb);color:#fff;font-size:11px;font-weight:950;letter-spacing:.08em;box-shadow:0 8px 18px rgba(37,99,235,.22);}
    .dash-panji-emote{width:34px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:#eef4fb;font-size:18px;animation:dashPanjiEmote 2s ease-in-out infinite;}
    @keyframes dashPanjiEmote{0%,100%{transform:scale(1);}50%{transform:scale(1.12);}}
    .dash-panji-text{color:#102544;font-size:14px;line-height:1.68;font-weight:750;}
    .dash-panji-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}
    .dash-panji-actions button{border:none;min-height:34px;padding:0 11px;border-radius:11px;cursor:pointer;font-size:11px;font-weight:900;background:#eef4fb;color:#123a72;border:1px solid #dbeafe;transition:.18s ease;}
    .dash-panji-actions button:hover{transform:translateY(-1px);background:#dbeafe;}
    .dash-panji-close{position:absolute;right:-8px;top:-8px;width:28px;height:28px;z-index:5;border:none;border-radius:999px;cursor:pointer;background:#102544;color:#fff;font-size:18px;font-weight:900;box-shadow:0 8px 18px rgba(15,23,42,.22);}
    .dash-panji-character{width:108px;height:138px;position:relative;border:none;background:transparent;cursor:pointer;padding:0;flex-shrink:0;animation:dashPanjiFloat 2.8s ease-in-out infinite,dashPanjiTilt 4.2s ease-in-out infinite;transform-origin:center bottom;}
    @keyframes dashPanjiFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    @keyframes dashPanjiTilt{0%,100%{rotate:0deg;}25%{rotate:-2deg;}75%{rotate:2deg;}}
    .dash-panji-glow{position:absolute;inset:22px 4px 0;border-radius:999px;background:radial-gradient(circle,rgba(37,99,235,.28),transparent 68%);filter:blur(10px);animation:dashPanjiGlow 2.4s ease-in-out infinite;}
    @keyframes dashPanjiGlow{0%,100%{opacity:.65;transform:scale(.96);}50%{opacity:1;transform:scale(1.08);}}
    .dash-panji-head{position:absolute;left:16px;top:8px;width:76px;height:76px;border-radius:28px 28px 25px 25px;background:radial-gradient(circle at 28% 22%,rgba(255,255,255,.95),transparent 18%),linear-gradient(135deg,#f8fbff,#c7ddff);border:2px solid #123a72;box-shadow:0 14px 28px rgba(18,58,114,.20),inset 0 -8px 18px rgba(37,99,235,.10);animation:dashPanjiHead 3.4s ease-in-out infinite;}
    @keyframes dashPanjiHead{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
    .dash-panji-hat{position:absolute;left:9px;top:-14px;width:58px;height:26px;border-radius:12px 12px 8px 8px;background:linear-gradient(135deg,#123a72,#2563eb);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:950;letter-spacing:.08em;box-shadow:0 8px 16px rgba(18,58,114,.22);}
    .dash-panji-eye{position:absolute;top:34px;width:12px;height:16px;border-radius:999px;background:#102544;animation:dashPanjiBlink 4.8s infinite;}
    .dash-panji-eye-left{left:21px;}.dash-panji-eye-right{right:21px;}
    @keyframes dashPanjiBlink{0%,91%,100%{transform:scaleY(1);}94%{transform:scaleY(.12);}96%{transform:scaleY(1);}}
    .dash-panji-mouth{position:absolute;left:31px;bottom:17px;width:16px;height:8px;border-bottom:3px solid #102544;border-radius:0 0 999px 999px;}
    .dash-panji-body{position:absolute;left:24px;top:84px;width:60px;height:45px;border-radius:21px 21px 17px 17px;background:linear-gradient(135deg,#123a72,#2f9a8f);border:2px solid rgba(255,255,255,.88);box-shadow:0 14px 24px rgba(15,23,42,.18);animation:dashPanjiBreath 2.6s ease-in-out infinite;}
    @keyframes dashPanjiBreath{0%,100%{transform:scale(1);}50%{transform:scale(1.025);}}
    .dash-panji-badge{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:999px;background:#fff;color:#123a72;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:950;}
    .dash-panji-hand{position:absolute;top:94px;width:18px;height:34px;border-radius:999px;background:linear-gradient(135deg,#c7ddff,#f8fbff);border:2px solid #123a72;}
    .dash-panji-hand-left{left:8px;transform:rotate(24deg);}.dash-panji-hand-right{right:8px;transform-origin:top center;animation:dashPanjiWave 1.8s ease-in-out infinite;}
    @keyframes dashPanjiWave{0%,100%{transform:rotate(-18deg);}50%{transform:rotate(-46deg);}}
    .dash-panji-talking .dash-panji-mouth{animation:dashPanjiTalk .22s ease-in-out infinite;}
    @keyframes dashPanjiTalk{0%,100%{height:5px;width:15px;left:31px;bottom:17px;border-bottom:3px solid currentColor;border-top:none;border-left:none;border-right:none;border-radius:0 0 999px 999px;background:transparent;}50%{height:15px;width:20px;left:28px;bottom:12px;border:3px solid currentColor;border-radius:999px;background:rgba(15,23,42,.08);}}
    .dash-panji-happy .dash-panji-head{background:radial-gradient(circle at 28% 22%,rgba(255,255,255,.95),transparent 18%),linear-gradient(135deg,#ecfdf5,#bbf7d0);border-color:#16a34a;}
    .dash-panji-happy .dash-panji-eye{height:8px;top:40px;background:transparent;border-bottom:4px solid #166534;animation:none;}
    .dash-panji-sad .dash-panji-head{background:radial-gradient(circle at 28% 22%,rgba(255,255,255,.95),transparent 18%),linear-gradient(135deg,#fff1f2,#fecdd3);border-color:#dc2626;}
    .dash-panji-sad .dash-panji-eye-left::after,.dash-panji-sad .dash-panji-eye-right::after{content:"";position:absolute;left:3px;top:13px;width:6px;height:10px;border-radius:999px;background:linear-gradient(180deg,#93c5fd,#38bdf8);animation:dashPanjiTear 1.1s ease-in-out infinite;}
    @keyframes dashPanjiTear{0%{opacity:0;transform:translateY(-4px) scale(.7);}25%{opacity:1;}100%{opacity:0;transform:translateY(16px) scale(1);}}
    .dash-panji-thinking .dash-panji-character::after{content:"?";position:absolute;right:0;top:0;width:28px;height:28px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:#fef3c7;color:#92400e;font-weight:950;box-shadow:0 8px 18px rgba(15,23,42,.14);animation:dashPanjiQuestion 1.1s ease-in-out infinite;}
    @keyframes dashPanjiQuestion{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-7px) scale(1.08);}}
    .dash-panji-highlight{position:relative;z-index:9999;outline:3px solid rgba(37,99,235,.45);outline-offset:5px;box-shadow:0 0 0 9px rgba(37,99,235,.10),0 18px 42px rgba(37,99,235,.16) !important;}
    @media(max-width:1400px){.dash-panji-bubble{width:320px;max-height:280px;}.dash-panji-character{width:102px;height:132px;}}
  `;
  document.head.appendChild(style);
}

function ensureDashboardPanjiElement() {
  injectDashboardPanjiCss();

  let panji = document.getElementById('dashboardPanji');
  if (!panji) {
    panji = document.createElement('div');
    panji.id = 'dashboardPanji';
    panji.className = 'dash-panji';
    document.body.appendChild(panji);
  }

  panji.innerHTML = `
    <div class="dash-panji-bubble">
      <button type="button" class="dash-panji-close" id="dashPanjiClose">×</button>
      <div class="dash-panji-top">
        <div class="dash-panji-name">PANJI · Pengadaan Jitu</div>
        <div class="dash-panji-emote" id="dashPanjiEmote">🤖</div>
      </div>
      <div class="dash-panji-text" id="dashPanjiText"></div>
      <div class="dash-panji-actions">
        <button type="button" id="dashPanjiExplain">Jelaskan Dashboard</button>
        <button type="button" id="dashPanjiTour">Panduan Elemen</button>
        <button type="button" id="dashPanjiAdvice">Rekomendasi</button>
        <button type="button" id="dashPanjiMini">Minimize</button>
      </div>
    </div>

    <button type="button" class="dash-panji-character" id="dashPanjiCharacter" title="PANJI Pengadaan Jitu">
      <div class="dash-panji-glow"></div>
      <div class="dash-panji-head">
        <div class="dash-panji-hat">PBJ</div>
        <div class="dash-panji-eye dash-panji-eye-left"></div>
        <div class="dash-panji-eye dash-panji-eye-right"></div>
        <div class="dash-panji-mouth"></div>
      </div>
      <div class="dash-panji-body"><div class="dash-panji-badge">PJ</div></div>
      <div class="dash-panji-hand dash-panji-hand-left"></div>
      <div class="dash-panji-hand dash-panji-hand-right"></div>
    </button>
  `;

  return panji;
}

function clearDashboardPanjiHighlight() {
  document.querySelectorAll('.dash-panji-highlight').forEach((item) => {
    item.classList.remove('dash-panji-highlight');
  });
}

function moveDashboardPanjiHome() {
  const panji = document.getElementById('dashboardPanji');
  if (!panji) return;

  panji.style.left = 'auto';
  panji.style.top = 'auto';
  panji.style.right = 'var(--dash-panji-right, 34px)';
  panji.style.bottom = 'var(--dash-panji-bottom, 86px)';
}

function moveDashboardPanjiToElement(target) {
  const panji = document.getElementById('dashboardPanji');

  if (!panji || !target || !target.getBoundingClientRect) {
    moveDashboardPanjiHome();
    return;
  }

  clearDashboardPanjiHighlight();
  target.classList.add('dash-panji-highlight');

  const rect = target.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const assistantWidth = Math.min(530, vw - 40);
  const assistantHeight = 235;
  const gap = 18;

  let left = rect.left > vw / 2
    ? rect.left - assistantWidth - gap
    : rect.right + gap;

  if (left < 18) left = 18;
  if (left + assistantWidth > vw - 18) left = vw - assistantWidth - 18;

  let top = rect.top + (rect.height / 2) - (assistantHeight / 2);

  if (top < 18) top = 18;
  if (top + assistantHeight > vh - 18) top = vh - assistantHeight - 18;

  panji.style.left = `${Math.round(left)}px`;
  panji.style.top = `${Math.round(top)}px`;
  panji.style.right = 'auto';
  panji.style.bottom = 'auto';
}

function dashboardPanjiSpeak(message, mood = 'talking', target = null) {
  const panji = document.getElementById('dashboardPanji');
  const textEl = document.getElementById('dashPanjiText');
  const emote = document.getElementById('dashPanjiEmote');

  if (!panji || !textEl) return;

  panji.classList.remove('dash-panji-minimized', 'dash-panji-happy', 'dash-panji-sad', 'dash-panji-thinking', 'dash-panji-talking');
  panji.classList.add('dash-panji-talking');

  if (mood === 'happy') {
    panji.classList.add('dash-panji-happy');
    if (emote) emote.textContent = '😄';
  } else if (mood === 'sad') {
    panji.classList.add('dash-panji-sad');
    if (emote) emote.textContent = '😢';
  } else if (mood === 'thinking') {
    panji.classList.add('dash-panji-thinking');
    if (emote) emote.textContent = '🤔';
  } else if (emote) {
    emote.textContent = '🤖';
  }

  textEl.innerHTML = escapeHtml(message).replace(/\n/g, '<br>');

  if (target) {
    moveDashboardPanjiToElement(target);
  }

  clearTimeout(panji._talkTimer);
  panji._talkTimer = setTimeout(() => {
    panji.classList.remove('dash-panji-talking');
  }, Math.min(9000, Math.max(2400, String(message).length * 32)));
}

function startDashboardPanjiTour(data) {
  const steps = [
    {
      selector: '.hero-card--dashboard',
      message: 'Ini area pembuka dashboard. Di sini user tahu dashboard sedang membaca profil PBJ Kota Bogor, update data, dan tombol cepat untuk masuk ke modul.',
      mood: 'talking'
    },
    {
      selector: '.dashboard-kpi-grid .stat-card--lux:nth-child(1)',
      message: 'Ini kartu Skor ITKP. PANJI menilai kualitas pemanfaatan sistem dari total 30 poin. Semakin tinggi, semakin baik pemanfaatan SiRUP, katalog, tender, kontrak, dan pencatatan non tender.',
      mood: 'thinking'
    },
    {
      selector: '.procurement-map-card',
      message: 'Ini radar Pemanfaatan Sistem ITKP. Pilih satuan kerja di dropdown, lalu PANJI akan baca nilai per indikator dan menentukan mana yang baik, cukup, atau butuh perhatian.',
      mood: 'talking'
    },
    {
      selector: '.dimensions--clickable',
      message: 'Ini daftar indikator: SiRUP, Toko Daring, e-Purchasing, e-Tendering, e-Kontrak, dan Non Tender. Arahkan mouse ke tiap indikator, PANJI akan jelaskan arti nilainya.',
      mood: 'happy'
    },
    {
      selector: '.money-progress',
      message: 'Ini progress pagu dibanding realisasi. Kalau realisasi masih rendah, perlu cek paket yang belum jalan, belum kontrak, belum BAST, atau belum tercatat realisasinya.',
      mood: 'thinking'
    },
    {
      selector: '.quick-grid',
      message: 'Ini tombol akses cepat. PANJI bisa jelaskan fungsi setiap tombol, lalu user bisa klik untuk masuk ke modul detail.',
      mood: 'happy'
    }
  ];

  let index = 0;

  const runStep = () => {
    const step = steps[index];
    const target = document.querySelector(step.selector);

    if (target) {
      dashboardPanjiSpeak(step.message, step.mood, target);
    }

    index += 1;

    const panji = document.getElementById('dashboardPanji');
    if (!panji) return;

    if (index < steps.length) {
      clearTimeout(panji._tourTimer);
      panji._tourTimer = setTimeout(runStep, 4200);
    } else {
      clearTimeout(panji._tourTimer);
      panji._tourTimer = setTimeout(() => {
        clearDashboardPanjiHighlight();
        moveDashboardPanjiHome();
        dashboardPanjiSpeak('Selesai. Sekarang arahkan mouse ke kartu, indikator, atau tombol mana pun. PANJI akan jelaskan fungsi dan nilainya tanpa mengubah bentuk dashboard.', 'happy');
      }, 4200);
    }
  };

  runStep();
}

function initDashboardPanji(data, fromSelection = false) {
  if (!data || activePageKey !== 'dashboard') return;

  if (typeof dashboardPanjiDestroy === 'function') {
    dashboardPanjiDestroy();
    dashboardPanjiDestroy = null;
  }

  const panji = ensureDashboardPanjiElement();

  const closeBtn = document.getElementById('dashPanjiClose');
  const miniBtn = document.getElementById('dashPanjiMini');
  const characterBtn = document.getElementById('dashPanjiCharacter');
  const explainBtn = document.getElementById('dashPanjiExplain');
  const tourBtn = document.getElementById('dashPanjiTour');
  const adviceBtn = document.getElementById('dashPanjiAdvice');

  const minimize = () => {
    panji.classList.add('dash-panji-minimized');
    clearDashboardPanjiHighlight();
    moveDashboardPanjiHome();
  };

  const show = () => {
    panji.classList.remove('dash-panji-minimized');
  };

  if (closeBtn) closeBtn.addEventListener('click', minimize);
  if (miniBtn) miniBtn.addEventListener('click', minimize);

  if (characterBtn) {
    characterBtn.addEventListener('click', () => {
      show();
      clearDashboardPanjiHighlight();
      moveDashboardPanjiHome();
      dashboardPanjiSpeak(buildPanjiDashboardIntro(data), 'talking');
    });
  }

  if (explainBtn) {
    explainBtn.addEventListener('click', () => {
      show();
      clearDashboardPanjiHighlight();
      moveDashboardPanjiHome();
      dashboardPanjiSpeak(
        buildPanjiFullDashboardAnalysis(data),
        getPanjiDashboardStatus((data.selectedProfile || data.cityProfile).score, 30).tone
      );
    });
  }

  if (tourBtn) {
    tourBtn.addEventListener('click', () => {
      show();
      startDashboardPanjiTour(data);
    });
  }

  if (adviceBtn) {
    adviceBtn.addEventListener('click', () => {
      show();
      clearDashboardPanjiHighlight();
      moveDashboardPanjiHome();
      dashboardPanjiSpeak(buildPanjiRecommendation(data), 'thinking');
    });
  }

  const cleanups = [];

  const bindHover = (el, handler) => {
    let timer = null;
    const enter = () => {
      clearTimeout(timer);
      timer = setTimeout(handler, 280);
    };
    const leave = () => {
      clearTimeout(timer);
    };

    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    el.addEventListener('focus', enter);

    return () => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
      el.removeEventListener('focus', enter);
    };
  };

  contentArea.querySelectorAll('.stat-card--lux').forEach((card) => {
    cleanups.push(bindHover(card, () => {
      const label = card.dataset.panjiKpi || card.querySelector('.label')?.textContent || 'Kartu Dashboard';
      const value = card.dataset.panjiValue || card.querySelector('.value')?.textContent || '';
      const desc = card.dataset.panjiDesc || card.querySelector('.desc')?.textContent || '';
      dashboardPanjiSpeak(buildPanjiKpiExplanation(label, value, desc, data), 'thinking', card);
    }));
  });

  contentArea.querySelectorAll('.dim-row--button').forEach((button) => {
    cleanups.push(bindHover(button, () => {
      const message = buildPanjiDimensionExplanationByElement(button, data);
      const name = button.querySelector('.dim-name span')?.textContent || '';
      const profile = data.selectedProfile || data.cityProfile;
      const item = (profile.dimensions || []).find((dim) => dim.name === name);
      const mood = item ? getPanjiDashboardStatus(item.value, item.max).tone : 'thinking';
      dashboardPanjiSpeak(message, mood, button);
    }));
  });

  contentArea.querySelectorAll('.quick-card').forEach((button) => {
    cleanups.push(bindHover(button, () => {
      dashboardPanjiSpeak(buildPanjiQuickExplanation(button), 'happy', button);
    }));
  });

  const scoreRing = contentArea.querySelector('.score-ring');
  if (scoreRing) {
    cleanups.push(bindHover(scoreRing, () => {
      const profile = data.selectedProfile || data.cityProfile;
      const status = getPanjiDashboardStatus(profile.score, 30);
      dashboardPanjiSpeak(
        `Lingkaran ini menunjukkan skor ITKP ${profile.name}: ${formatScore(profile.score)} dari 30. Kategorinya ${status.label}. ${status.text}`,
        status.tone,
        scoreRing
      );
    }));
  }

  const moneyProgress = contentArea.querySelector('.money-progress');
  if (moneyProgress) {
    cleanups.push(bindHover(moneyProgress, () => {
      const status = getPanjiDashboardStatus(data.realisasiPersen, 100);
      dashboardPanjiSpeak(
        `Panel ini membandingkan pagu dengan realisasi untuk ${data.scopeName}. Persentasenya ${formatPercent(data.realisasiPersen)}, kategori ${status.label}. Kalau rendah, cek paket yang belum kontrak, belum BAST, atau belum tercatat realisasinya.`,
        status.tone,
        moneyProgress
      );
    }));
  }

  contentArea.querySelectorAll('.rank-table').forEach((table, index) => {
    cleanups.push(bindHover(table, () => {
      const message = index === 0
        ? 'Ini ranking nilai ITKP tertinggi. OPD/Sub OPD di sini bisa jadi contoh praktik baik pemanfaatan sistem.'
        : 'Ini ranking nilai ITKP terendah. Bagian ini bukan untuk menyalahkan, tapi menentukan prioritas pembinaan dan perbaikan data.';
      dashboardPanjiSpeak(message, index === 0 ? 'happy' : 'thinking', table);
    }));
  });

  const updatePanjiBottom = () => {
    const footer = document.querySelector('.footer-note');
    const baseBottom = 86;
    const maxBottom = 260;
    let nextBottom = baseBottom;

    if (footer) {
      const rect = footer.getBoundingClientRect();
      const panjiRect = panji.getBoundingClientRect();
      const normalTop = window.innerHeight - baseBottom - panjiRect.height;
      const overlap = rect.bottom - normalTop;

      if (rect.top < window.innerHeight && overlap > 0) {
        nextBottom = Math.min(maxBottom, baseBottom + overlap + 20);
      }
    }

    panji.style.setProperty('--dash-panji-bottom', `${Math.round(nextBottom)}px`);
  };

  window.addEventListener('scroll', updatePanjiBottom, { passive: true });
  window.addEventListener('resize', updatePanjiBottom);
  updatePanjiBottom();

  const firstMessage = fromSelection
    ? buildPanjiFullDashboardAnalysis(data)
    : buildPanjiDashboardIntro(data);
  const firstMood = getPanjiDashboardStatus((data.selectedProfile || data.cityProfile).score, 30).tone;

  clearDashboardPanjiHighlight();
  moveDashboardPanjiHome();
  dashboardPanjiSpeak(firstMessage, fromSelection ? firstMood : 'talking');

  dashboardPanjiDestroy = () => {
    clearTimeout(panji._talkTimer);
    clearTimeout(panji._tourTimer);
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.error(error);
      }
    });
    window.removeEventListener('scroll', updatePanjiBottom);
    window.removeEventListener('resize', updatePanjiBottom);
    clearDashboardPanjiHighlight();
    if (panji && panji.parentNode) {
      panji.remove();
    }
  };
}

function destroyDashboardPanji() {
  if (typeof dashboardPanjiDestroy === 'function') {
    dashboardPanjiDestroy();
    dashboardPanjiDestroy = null;
  }
}

function cleanupDynamicModule() {
  closeFlyout();
  destroyDashboardPanji();

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
    simulasi: 'Simulasi'
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

bindMenu();
loadPage('dashboard');
