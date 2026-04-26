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
      <div class="hero-kicker">SIPPBJ · Kota Bogor Procurement Intelligence</div>
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
          <div class="hero-kicker">SIPPBJ · Kota Bogor Procurement Intelligence</div>
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
    <div class="stat-card stat-card--lux">
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
