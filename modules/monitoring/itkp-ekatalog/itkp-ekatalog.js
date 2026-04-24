(function(){
  const MODULE_KEY = '__ITKP_EKATALOG_MODULE__';

  if (window[MODULE_KEY] && typeof window[MODULE_KEY].cleanup === 'function') {
    try {
      window[MODULE_KEY].cleanup();
    } catch (e) {
      console.warn('Cleanup modul lama eKatalog gagal:', e);
    }
  }

  function ensurePapaLoaded() {
    return new Promise((resolve, reject) => {
      if (window.Papa) {
        resolve();
        return;
      }

      const existing = document.querySelector('script[data-papa-parse="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once:true });
        existing.addEventListener('error', () => reject(new Error('Gagal memuat PapaParse.')), { once:true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js';
      script.setAttribute('data-papa-parse', 'true');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Gagal memuat PapaParse.'));
      document.body.appendChild(script);
    });
  }

  const CONFIG = {
    SHEET_ID: '1tRYoFQ2obJLoQfIBmZQ_qIw72ZCMV9fKIpBA3DlsIxE',
    SHEETS: {
      raw: 'RAW_ECAT',
      score: 'SCORE_ITKP_ECAT'
    },
    REKAP_PAGE_SIZE: 10,
    DETAIL_PAGE_SIZE: 50
  };

  const APP_STATE = {
    rawRows: [],
    scoreRows: [],
    filteredScoreRows: [],
    selectedOpd: '',
    selectedDetailRows: [],
    rekapPage: 1,
    detailPage: 1,
    initialized: false
  };

  const EL = {
    errorBox: document.getElementById('errorBox'),
    loadingBox: document.getElementById('loadingBox'),
    loadingText: document.getElementById('loadingText'),
    globalLoadingOverlay: document.getElementById('globalLoadingOverlay'),
    globalLoadingText: document.getElementById('globalLoadingText'),

    filterOpd: document.getElementById('filterOpd'),
    filterStatus: document.getElementById('filterStatus'),
    filterBulan: document.getElementById('filterBulan'),
    filterTahun: document.getElementById('filterTahun'),
    searchPaket: document.getElementById('searchPaket'),

    btnResetFilter: document.getElementById('btnResetFilter'),
    btnRefresh: document.getElementById('btnRefresh'),
    btnExportRekap: document.getElementById('btnExportRekap'),
    btnExportDetail: document.getElementById('btnExportDetail'),
    btnExportCurrentDetail: document.getElementById('btnExportCurrentDetail'),
    btnClearSelected: document.getElementById('btnClearSelected'),

    statJumlahOpd: document.getElementById('statJumlahOpd'),
    statJumlahPaket: document.getElementById('statJumlahPaket'),
    statTotalPagu: document.getElementById('statTotalPagu'),
    statPaketAktif: document.getElementById('statPaketAktif'),
    statPaketSelesai: document.getElementById('statPaketSelesai'),
    statAvgItkp: document.getElementById('statAvgItkp'),

    insightTopOpd: document.getElementById('insightTopOpd'),
    insightTopNote: document.getElementById('insightTopNote'),
    insightLowOpd: document.getElementById('insightLowOpd'),
    insightLowNote: document.getElementById('insightLowNote'),
    insightStatus: document.getElementById('insightStatus'),
    insightStatusNote: document.getElementById('insightStatusNote'),

    rekapTableBody: document.getElementById('rekapTableBody'),
    rekapCountInfo: document.getElementById('rekapCountInfo'),
    rekapPaginationInfo: document.getElementById('rekapPaginationInfo'),
    rekapPagination: document.getElementById('rekapPagination'),

    detailTitle: document.getElementById('detailTitle'),
    detailSubtitle: document.getElementById('detailSubtitle'),
    detailContent: document.getElementById('detailContent')
  };

  const listeners = [];

  function addListener(el, event, handler) {
    if (!el) return;
    el.addEventListener(event, handler);
    listeners.push(() => el.removeEventListener(event, handler));
  }

  function cleanup() {
    listeners.forEach(off => off());
    listeners.length = 0;
  }

  function showError(message) {
    if (!EL.errorBox) return;
    EL.errorBox.textContent = message || '';
    EL.errorBox.classList.toggle('show', Boolean(message));
  }

  function showLoading(message) {
    if (EL.loadingBox) EL.loadingBox.classList.add('show');
    if (EL.loadingText) EL.loadingText.textContent = message || 'Memuat data...';
  }

  function hideLoading() {
    if (EL.loadingBox) EL.loadingBox.classList.remove('show');
  }

  function showGlobalLoading(message) {
    if (EL.globalLoadingOverlay) EL.globalLoadingOverlay.classList.add('show');
    if (EL.globalLoadingText) EL.globalLoadingText.textContent = message || 'Memuat data...';
  }

  function hideGlobalLoading() {
    if (EL.globalLoadingOverlay) EL.globalLoadingOverlay.classList.remove('show');
  }

  function csvUrlBySheetName(sheetId, sheetName) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }

  function fetchSheet(sheetName) {
    return new Promise((resolve, reject) => {
      Papa.parse(csvUrlBySheetName(CONFIG.SHEET_ID, sheetName), {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete(results) {
          resolve(results.data || []);
        },
        error(err) {
          reject(err);
        }
      });
    });
  }

  function normalizeHeader(text) {
    return String(text || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function normalizeRows(rawRows) {
    return (rawRows || []).map(row => {
      const out = {};
      Object.keys(row || {}).forEach(key => {
        out[normalizeHeader(key)] = row[key];
      });
      return out;
    });
  }

  function normalizeOpdName(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  function parseMoney(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;

    let str = String(value).trim();
    if (!str || str === '-') return 0;

    str = str
      .replace(/Rp/gi, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .replace(/[^\d.-]/g, '');

    const num = parseFloat(str);
    return Number.isNaN(num) ? 0 : num;
  }

  function parseInteger(value) {
    return Math.round(parseMoney(value));
  }

  function formatMoney(value) {
    return 'Rp' + Number(value || 0).toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function formatPercent(value) {
    return Number(value || 0).toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }) + '%';
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function monthNameFromDate(value) {
    if (!value) return '';
    const str = String(value).trim();

    const monthMap = {
      january: 'Januari',
      february: 'Februari',
      march: 'Maret',
      april: 'April',
      may: 'Mei',
      june: 'Juni',
      july: 'Juli',
      august: 'Agustus',
      september: 'September',
      october: 'Oktober',
      november: 'November',
      december: 'Desember'
    };

    const matchMonthName = str.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i);
    if (matchMonthName) {
      return monthMap[matchMonthName[1].toLowerCase()] || matchMonthName[1];
    }

    const matchNumeric = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (matchNumeric) {
      const monthIndex = Number(matchNumeric[2]);
      const names = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return names[monthIndex] || '';
    }

    return '';
  }

  function yearFromDate(value) {
    if (!value) return '';
    const str = String(value).trim();
    const yearMatch = str.match(/(20\d{2}|19\d{2})/);
    return yearMatch ? yearMatch[1] : '';
  }

  function normalizeRawRows(rows) {
    return normalizeRows(rows).map((row, index) => ({
      row_no: index + 1,
      satuan_kerja: String(
        row.satuan_kerja ||
        row.nama_satker ||
        row.satker ||
        ''
      ).trim(),
      satuan_kerja_norm: normalizeOpdName(
        row.satuan_kerja ||
        row.nama_satker ||
        row.satker ||
        ''
      ),
      nomor_paket: String(
        row.nomor_paket ||
        row.kode_paket ||
        row.no_paket ||
        ''
      ).trim(),
      nama_paket: String(
        row.nama_paket ||
        row.paket ||
        ''
      ).trim(),
      pagu: parseMoney(
        row.pagu ||
        row.nilai_pagu ||
        0
      ),
      status_paket: String(
        row.status_paket ||
        row.status ||
        ''
      ).trim(),
      tanggal_buat_paket: String(
        row.tanggal_buat_paket ||
        row.tanggal_buat ||
        row.tanggal ||
        ''
      ).trim(),
      bulan_buat: monthNameFromDate(
        row.tanggal_buat_paket ||
        row.tanggal_buat ||
        row.tanggal ||
        ''
      ),
      tahun_buat: yearFromDate(
        row.tanggal_buat_paket ||
        row.tanggal_buat ||
        row.tanggal ||
        ''
      )
    }));
  }

  function normalizeScoreRows(rows) {
    return normalizeRows(rows).map((row, index) => ({
      row_no: index + 1,
      satuan_kerja: String(
        row.satuan_kerja ||
        row.nama_satker ||
        row.satker ||
        ''
      ).trim(),
      satuan_kerja_norm: normalizeOpdName(
        row.satuan_kerja ||
        row.nama_satker ||
        row.satker ||
        ''
      ),
      paket_aktif: parseInteger(row.paket_aktif || 0),
      paket_selesai: parseInteger(row.paket_selesai || 0),
      prosentase: parseMoney(row.prosentase || 0),
      nilai_itkp: parseMoney(
        row.nilai_itkp ||
        row.nilai ||
        0
      )
    }));
  }

  function getFilteredRawRows() {
    const opd = EL.filterOpd?.value || '';
    const status = EL.filterStatus?.value || '';
    const bulan = EL.filterBulan?.value || '';
    const tahun = EL.filterTahun?.value || '';
    const keyword = (EL.searchPaket?.value || '').trim().toLowerCase();

    return APP_STATE.rawRows.filter(row => {
      if (opd && row.satuan_kerja_norm !== opd) return false;
      if (status && row.status_paket !== status) return false;
      if (bulan && row.bulan_buat !== bulan) return false;
      if (tahun && row.tahun_buat !== tahun) return false;

      if (keyword) {
        const haystack = [
          row.satuan_kerja,
          row.nomor_paket,
          row.nama_paket,
          row.status_paket,
          row.tanggal_buat_paket
        ].join(' ').toLowerCase();

        if (!haystack.includes(keyword)) return false;
      }

      return true;
    });
  }

  function getFilteredScoreRows() {
    const opd = EL.filterOpd?.value || '';
    if (!opd) return [...APP_STATE.scoreRows];
    return APP_STATE.scoreRows.filter(row => row.satuan_kerja_norm === opd);
  }

  function fillSelect(selectEl, items, placeholder) {
    if (!selectEl) return;
    const oldVal = selectEl.value;
    selectEl.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;

    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.value;
      opt.textContent = item.label;
      selectEl.appendChild(opt);
    });

    const stillExists = [...selectEl.options].some(opt => opt.value === oldVal);
    if (stillExists) selectEl.value = oldVal;
  }

  function buildFilterOptions() {
    const opdItems = [...new Map(
      APP_STATE.scoreRows
        .filter(r => r.satuan_kerja_norm)
        .map(r => [r.satuan_kerja_norm, { value: r.satuan_kerja_norm, label: r.satuan_kerja }])
    ).values()].sort((a,b) => a.label.localeCompare(b.label, 'id'));

    const statusItems = [...new Set(APP_STATE.rawRows.map(r => r.status_paket).filter(Boolean))]
      .sort((a,b) => a.localeCompare(b, 'id'))
      .map(v => ({ value: v, label: v }));

    const bulanOrder = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    const bulanItems = [...new Set(APP_STATE.rawRows.map(r => r.bulan_buat).filter(Boolean))]
      .sort((a,b) => bulanOrder.indexOf(a) - bulanOrder.indexOf(b))
      .map(v => ({ value: v, label: v }));

    const tahunItems = [...new Set(APP_STATE.rawRows.map(r => r.tahun_buat).filter(Boolean))]
      .sort((a,b) => Number(a) - Number(b))
      .map(v => ({ value: v, label: v }));

    fillSelect(EL.filterOpd, opdItems, 'Semua Satuan Kerja');
    fillSelect(EL.filterStatus, statusItems, 'Semua Status');
    fillSelect(EL.filterBulan, bulanItems, 'Semua Bulan');
    fillSelect(EL.filterTahun, tahunItems, 'Semua Tahun');
  }

  function getStatusBadge(status) {
    const val = String(status || '').trim().toUpperCase();

    if (val.includes('COMPLETE')) {
      return `<span class="badge b-green">${escapeHtml(status)}</span>`;
    }

    if (val.includes('PAYMENT')) {
      return `<span class="badge b-blue">${escapeHtml(status)}</span>`;
    }

    if (val.includes('PROCESS')) {
      return `<span class="badge b-yellow">${escapeHtml(status)}</span>`;
    }

    if (!status) {
      return `<span class="badge b-red">-</span>`;
    }

    return `<span class="badge b-blue">${escapeHtml(status)}</span>`;
  }

  function renderStatsAndInsights() {
    const filteredRaw = getFilteredRawRows();
    const filteredScore = getFilteredScoreRows();

    const jumlahOpd = filteredScore.length;
    const jumlahPaket = filteredRaw.length;
    const totalPagu = filteredRaw.reduce((sum, row) => sum + row.pagu, 0);
    const paketAktif = filteredScore.reduce((sum, row) => sum + row.paket_aktif, 0);
    const paketSelesai = filteredScore.reduce((sum, row) => sum + row.paket_selesai, 0);
    const avgItkp = filteredScore.length
      ? filteredScore.reduce((sum, row) => sum + row.nilai_itkp, 0) / filteredScore.length
      : 0;

    EL.statJumlahOpd.textContent = formatNumber(jumlahOpd);
    EL.statJumlahPaket.textContent = formatNumber(jumlahPaket);
    EL.statTotalPagu.textContent = formatMoney(totalPagu);
    EL.statPaketAktif.textContent = formatNumber(paketAktif);
    EL.statPaketSelesai.textContent = formatNumber(paketSelesai);
    EL.statAvgItkp.textContent = formatNumber(avgItkp);

    const maxTargetRows = filteredScore.filter(row => Number(row.nilai_itkp) >= 4);
    const zeroScoreRows = filteredScore.filter(row => Number(row.nilai_itkp) === 0);

    if (maxTargetRows.length) {
      EL.insightTopOpd.textContent = `${formatNumber(maxTargetRows.length)} OPD`;
      EL.insightTopNote.innerHTML = maxTargetRows
        .map(row => escapeHtml(row.satuan_kerja))
        .join('<br>');
    } else {
      EL.insightTopOpd.textContent = '0 OPD';
      EL.insightTopNote.textContent = 'Belum ada OPD yang mencapai target maksimal.';
    }

    if (zeroScoreRows.length) {
      EL.insightLowOpd.textContent = `${formatNumber(zeroScoreRows.length)} OPD`;
      EL.insightLowNote.innerHTML = zeroScoreRows
        .map(row => escapeHtml(row.satuan_kerja))
        .join('<br>');
    } else {
      EL.insightLowOpd.textContent = '0 OPD';
      EL.insightLowNote.textContent = 'Belum ada OPD dengan skor 0.';
    }

    if (filteredRaw.length) {
      const statusMap = {};
      filteredRaw.forEach(row => {
        const key = row.status_paket || '(Kosong)';
        statusMap[key] = (statusMap[key] || 0) + 1;
      });

      const dominant = Object.entries(statusMap).sort((a,b) => b[1] - a[1])[0];
      EL.insightStatus.textContent = dominant ? dominant[0] : '-';
      EL.insightStatusNote.textContent = dominant ? `${formatNumber(dominant[1])} paket` : 'Belum ada data';
    } else {
      EL.insightStatus.textContent = '-';
      EL.insightStatusNote.textContent = 'Belum ada data';
    }
  }

  function renderRekapTable() {
    APP_STATE.filteredScoreRows = getFilteredScoreRows();
    const rows = APP_STATE.filteredScoreRows;
    const tbody = EL.rekapTableBody;

    tbody.innerHTML = '';

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="cell-muted center-cell">Belum ada data.</td></tr>';
      EL.rekapCountInfo.textContent = '0 data';
      renderRekapPagination();
      return;
    }

    const startIndex = (APP_STATE.rekapPage - 1) * CONFIG.REKAP_PAGE_SIZE;
    const pageRows = rows.slice(startIndex, startIndex + CONFIG.REKAP_PAGE_SIZE);

    pageRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${startIndex + idx + 1}</td>
        <td>${escapeHtml(row.satuan_kerja)}</td>
        <td class="cell-right">${formatNumber(row.paket_aktif)}</td>
        <td class="cell-right">${formatNumber(row.paket_selesai)}</td>
        <td class="cell-right">${formatPercent(row.prosentase)}</td>
        <td class="cell-right">${formatNumber(row.nilai_itkp)}</td>
        <td>
          <button class="action-btn" type="button" data-opd="${escapeHtml(row.satuan_kerja_norm)}">
            Lihat Paket
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    EL.rekapCountInfo.textContent = `${formatNumber(rows.length)} data`;

    tbody.querySelectorAll('[data-opd]').forEach(btn => {
      addListener(btn, 'click', () => {
        APP_STATE.selectedOpd = btn.getAttribute('data-opd') || '';
        APP_STATE.detailPage = 1;
        renderDetailSection();
      });
    });

    renderRekapPagination();
  }

  function renderRekapPagination() {
    const totalRows = APP_STATE.filteredScoreRows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / CONFIG.REKAP_PAGE_SIZE));

    if (APP_STATE.rekapPage > totalPages) APP_STATE.rekapPage = totalPages;

    EL.rekapPaginationInfo.textContent = `Halaman ${APP_STATE.rekapPage} dari ${totalPages}`;
    EL.rekapPagination.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = 'Prev';
    prevBtn.disabled = APP_STATE.rekapPage === 1;
    addListener(prevBtn, 'click', () => {
      if (APP_STATE.rekapPage > 1) {
        APP_STATE.rekapPage -= 1;
        renderRekapTable();
      }
    });
    EL.rekapPagination.appendChild(prevBtn);

    const start = Math.max(1, APP_STATE.rekapPage - 2);
    const end = Math.min(totalPages, APP_STATE.rekapPage + 2);

    for (let i = start; i <= end; i++) {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (i === APP_STATE.rekapPage ? ' active' : '');
      btn.textContent = String(i);
      addListener(btn, 'click', () => {
        APP_STATE.rekapPage = i;
        renderRekapTable();
      });
      EL.rekapPagination.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = APP_STATE.rekapPage === totalPages;
    addListener(nextBtn, 'click', () => {
      if (APP_STATE.rekapPage < totalPages) {
        APP_STATE.rekapPage += 1;
        renderRekapTable();
      }
    });
    EL.rekapPagination.appendChild(nextBtn);
  }

  function renderEmptyDetail() {
    EL.detailTitle.textContent = 'Detail Paket eKatalog';
    EL.detailSubtitle.textContent = 'Pilih salah satu OPD pada tabel rekap untuk melihat detail paket.';
    EL.detailContent.innerHTML = `
      <div class="empty-state">
        Detail paket belum ditampilkan.<br>
        Klik tombol <strong>Lihat Paket</strong> pada salah satu OPD.
      </div>
    `;
  }

  function buildDetailRowsForSelectedOpd() {
    const filteredRaw = getFilteredRawRows();
    if (!APP_STATE.selectedOpd) return [];
    return filteredRaw.filter(row => row.satuan_kerja_norm === APP_STATE.selectedOpd);
  }

  function renderDetailSection() {
    if (!APP_STATE.selectedOpd) {
      renderEmptyDetail();
      return;
    }

    APP_STATE.selectedDetailRows = buildDetailRowsForSelectedOpd();
    const rows = APP_STATE.selectedDetailRows;

    const selectedScore = APP_STATE.scoreRows.find(row => row.satuan_kerja_norm === APP_STATE.selectedOpd);
    const opdLabel = selectedScore ? selectedScore.satuan_kerja : (rows[0]?.satuan_kerja || '-');

    EL.detailTitle.textContent = `Detail Paket eKatalog - ${opdLabel}`;
    EL.detailSubtitle.textContent = `${formatNumber(rows.length)} paket ditampilkan sesuai filter aktif.`;

    if (!rows.length) {
      EL.detailContent.innerHTML = `
        <div class="empty-state">
          Tidak ada detail paket untuk OPD ini sesuai filter yang dipilih.
        </div>
      `;
      return;
    }

    const totalPages = Math.max(1, Math.ceil(rows.length / CONFIG.DETAIL_PAGE_SIZE));
    if (APP_STATE.detailPage > totalPages) APP_STATE.detailPage = totalPages;

    const startIndex = (APP_STATE.detailPage - 1) * CONFIG.DETAIL_PAGE_SIZE;
    const pageRows = rows.slice(startIndex, startIndex + CONFIG.DETAIL_PAGE_SIZE);

    EL.detailContent.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="min-width:60px;">No</th>
              <th style="min-width:180px;">Nomor Paket</th>
              <th style="min-width:320px;">Nama Paket</th>
              <th>Pagu</th>
              <th>Status Paket</th>
              <th>Tanggal Buat Paket</th>
            </tr>
          </thead>
          <tbody id="detailTableBody"></tbody>
        </table>
      </div>
      <div class="pagination-bar">
        <div class="pagination-info" id="detailPaginationInfo"></div>
        <div class="pagination-actions" id="detailPagination"></div>
      </div>
    `;

    const tbody = document.getElementById('detailTableBody');
    pageRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${startIndex + idx + 1}</td>
        <td>${escapeHtml(row.nomor_paket)}</td>
        <td>${escapeHtml(row.nama_paket)}</td>
        <td class="cell-right">${formatMoney(row.pagu)}</td>
        <td>${getStatusBadge(row.status_paket)}</td>
        <td>${escapeHtml(row.tanggal_buat_paket || '-')}</td>
      `;
      tbody.appendChild(tr);
    });

    const info = document.getElementById('detailPaginationInfo');
    const wrap = document.getElementById('detailPagination');

    info.textContent = `${startIndex + 1}-${Math.min(startIndex + CONFIG.DETAIL_PAGE_SIZE, rows.length)} dari ${rows.length} data • Page ${APP_STATE.detailPage} / ${totalPages}`;
    wrap.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = 'Prev';
    prevBtn.disabled = APP_STATE.detailPage === 1;
    addListener(prevBtn, 'click', () => {
      if (APP_STATE.detailPage > 1) {
        APP_STATE.detailPage -= 1;
        renderDetailSection();
      }
    });
    wrap.appendChild(prevBtn);

    const start = Math.max(1, APP_STATE.detailPage - 2);
    const end = Math.min(totalPages, APP_STATE.detailPage + 2);

    for (let i = start; i <= end; i++) {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (i === APP_STATE.detailPage ? ' active' : '');
      btn.textContent = String(i);
      addListener(btn, 'click', () => {
        APP_STATE.detailPage = i;
        renderDetailSection();
      });
      wrap.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = APP_STATE.detailPage === totalPages;
    addListener(nextBtn, 'click', () => {
      if (APP_STATE.detailPage < totalPages) {
        APP_STATE.detailPage += 1;
        renderDetailSection();
      }
    });
    wrap.appendChild(nextBtn);
  }

  function toCsv(rows) {
    return Papa.unparse(rows);
  }

  function downloadCsv(filename, rows) {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleExportRekap() {
    const rows = APP_STATE.filteredScoreRows.map((row, idx) => ({
      No: idx + 1,
      'Satuan Kerja': row.satuan_kerja,
      'Paket Aktif': row.paket_aktif,
      'Paket Selesai': row.paket_selesai,
      'Prosentase': row.prosentase,
      'Nilai ITKP': row.nilai_itkp
    }));

    downloadCsv('rekap-itkp-ekatalog.csv', rows);
  }

  function handleExportDetail() {
    const rows = getFilteredRawRows().map((row, idx) => ({
      No: idx + 1,
      'Satuan Kerja': row.satuan_kerja,
      'Nomor Paket': row.nomor_paket,
      'Nama Paket': row.nama_paket,
      'Pagu': row.pagu,
      'Status Paket': row.status_paket,
      'Tanggal Buat Paket': row.tanggal_buat_paket
    }));

    downloadCsv('detail-paket-ekatalog.csv', rows);
  }

  function handleExportCurrentDetail() {
    if (!APP_STATE.selectedOpd) return;

    const selectedScore = APP_STATE.scoreRows.find(row => row.satuan_kerja_norm === APP_STATE.selectedOpd);
    const opdLabel = (selectedScore?.satuan_kerja || 'detail-ekatalog')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const rows = APP_STATE.selectedDetailRows.map((row, idx) => ({
      No: idx + 1,
      'Satuan Kerja': row.satuan_kerja,
      'Nomor Paket': row.nomor_paket,
      'Nama Paket': row.nama_paket,
      'Pagu': row.pagu,
      'Status Paket': row.status_paket,
      'Tanggal Buat Paket': row.tanggal_buat_paket
    }));

    downloadCsv(`detail-ekatalog-${opdLabel}.csv`, rows);
  }

  function resetFilters() {
    if (EL.filterOpd) EL.filterOpd.value = '';
    if (EL.filterStatus) EL.filterStatus.value = '';
    if (EL.filterBulan) EL.filterBulan.value = '';
    if (EL.filterTahun) EL.filterTahun.value = '';
    if (EL.searchPaket) EL.searchPaket.value = '';

    APP_STATE.rekapPage = 1;
    APP_STATE.detailPage = 1;
    APP_STATE.selectedOpd = '';

    renderAll();
  }

  function applyFilters() {
    APP_STATE.rekapPage = 1;
    APP_STATE.detailPage = 1;

    if (APP_STATE.selectedOpd) {
      const stillExists = getFilteredRawRows().some(row => row.satuan_kerja_norm === APP_STATE.selectedOpd);
      if (!stillExists) {
        APP_STATE.selectedOpd = '';
      }
    }

    renderAll();
  }

  function renderAll() {
    renderStatsAndInsights();
    renderRekapTable();
    renderDetailSection();
  }

  async function initMonitoringEkatalog() {
    try {
      showError('');
      showLoading('Memuat data Google Sheet...');
      showGlobalLoading('Menyiapkan permintaan data...');

      await ensurePapaLoaded();

      const [rawRows, scoreRows] = await Promise.all([
        fetchSheet(CONFIG.SHEETS.raw),
        fetchSheet(CONFIG.SHEETS.score)
      ]);

      APP_STATE.rawRows = normalizeRawRows(rawRows);
      APP_STATE.scoreRows = normalizeScoreRows(scoreRows);
      APP_STATE.rekapPage = 1;
      APP_STATE.detailPage = 1;
      APP_STATE.selectedOpd = '';

      buildFilterOptions();
      renderAll();
      APP_STATE.initialized = true;
    } catch (error) {
      console.error(error);
      showError('Gagal memuat data monitoring eKatalog: ' + (error.message || String(error)));
    } finally {
      hideLoading();
      hideGlobalLoading();
    }
  }

  addListener(EL.filterOpd, 'change', applyFilters);
  addListener(EL.filterStatus, 'change', applyFilters);
  addListener(EL.filterBulan, 'change', applyFilters);
  addListener(EL.filterTahun, 'change', applyFilters);
  addListener(EL.searchPaket, 'input', applyFilters);

  addListener(EL.btnResetFilter, 'click', resetFilters);
  addListener(EL.btnRefresh, 'click', initMonitoringEkatalog);
  addListener(EL.btnExportRekap, 'click', handleExportRekap);
  addListener(EL.btnExportDetail, 'click', handleExportDetail);
  addListener(EL.btnExportCurrentDetail, 'click', handleExportCurrentDetail);
  addListener(EL.btnClearSelected, 'click', () => {
    APP_STATE.selectedOpd = '';
    APP_STATE.detailPage = 1;
    renderDetailSection();
  });

  initMonitoringEkatalog();

  window[MODULE_KEY] = { cleanup };
  window.__moduleInit = function() {
    return cleanup;
  };
})();
