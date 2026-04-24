(function () {
const EKATALOG_SHEET_CONFIG = {
  spreadsheetId: '1tRYoFQ2obJLoQfIBmZQ_qIw72ZCMV9fKIpBA3DlsIxE',
  rawGid: '230159837',
  scoreGid: '208380252'
};

const EKATALOG_MIN_LOADING_MS = 700;
const EKATALOG_PAGE_SIZE = 50;
const EKATALOG_DETAIL_PAGE_SIZE = 10;

window.__moduleInit = function ({ container }) {
  const root = container.querySelector('.itkp-ekatalog-page');
  if (!root) return null;

  const state = {
    rawRows: [],
    scoreRows: [],
    filteredRekap: [],
    selectedOpd: '',
    selectedDetailRows: [],
    rekapPage: 1,
    detailPage: 1,
    destroyed: false
  };

  const EL = {
    root,
    loadingBox: root.querySelector('#loadingBox'),
    loadingText: root.querySelector('#loadingText'),
    errorBox: root.querySelector('#errorBox'),
    globalLoadingOverlay: root.querySelector('#globalLoadingOverlay'),
    globalLoadingText: root.querySelector('#globalLoadingText'),
    filterOpd: root.querySelector('#filterOpd'),
    filterStatus: root.querySelector('#filterStatus'),
    searchKeyword: root.querySelector('#searchKeyword'),
    btnResetFilter: root.querySelector('#btnResetFilter'),
    btnRefresh: root.querySelector('#btnRefresh'),
    btnExportDetail: root.querySelector('#btnExportDetail'),
    btnExportCurrentDetail: root.querySelector('#btnExportCurrentDetail'),
    statJumlahOpd: root.querySelector('#statJumlahOpd'),
    statJumlahPaket: root.querySelector('#statJumlahPaket'),
    statTotalPagu: root.querySelector('#statTotalPagu'),
    statPaketAktif: root.querySelector('#statPaketAktif'),
    statPaketSelesai: root.querySelector('#statPaketSelesai'),
    statAvgItkp: root.querySelector('#statAvgItkp'),
    maxCount: root.querySelector('#maxCount'),
    zeroCount: root.querySelector('#zeroCount'),
    dominantStatus: root.querySelector('#dominantStatus'),
    dominantStatusNote: root.querySelector('#dominantStatusNote'),
    btnShowMaxList: root.querySelector('#btnShowMaxList'),
    btnShowZeroList: root.querySelector('#btnShowZeroList'),
    rekapTableBody: root.querySelector('#rekapTableBody'),
    rekapPaginationInfo: root.querySelector('#rekapPaginationInfo'),
    rekapPagination: root.querySelector('#rekapPagination'),
    detailTitle: root.querySelector('#detailTitle'),
    detailSubtitle: root.querySelector('#detailSubtitle'),
    detailTableBody: root.querySelector('#detailTableBody'),
    detailPaginationInfo: root.querySelector('#detailPaginationInfo'),
    detailPagination: root.querySelector('#detailPagination'),
    opdModal: root.querySelector('#opdModal'),
    modalTitle: root.querySelector('#modalTitle'),
    modalSubtitle: root.querySelector('#modalSubtitle'),
    modalCount: root.querySelector('#modalCount'),
    modalList: root.querySelector('#modalList'),
    btnCloseModal: root.querySelector('#btnCloseModal')
  };

  const listeners = [];

  const on = (target, event, handler) => {
    if (!target) return;
    target.addEventListener(event, handler);
    listeners.push(() => target.removeEventListener(event, handler));
  };

  setSummaryCardLabels();

  on(EL.filterOpd, 'change', () => {
    state.selectedOpd = EL.filterOpd.value;
    state.rekapPage = 1;
    state.detailPage = 1;
    applyFilters();
  });

  on(EL.filterStatus, 'change', () => {
    state.rekapPage = 1;
    state.detailPage = 1;
    applyFilters();
  });

  on(EL.searchKeyword, 'input', () => {
    state.rekapPage = 1;
    state.detailPage = 1;
    applyFilters();
  });

  on(EL.btnResetFilter, 'click', () => {
    EL.filterOpd.value = '';
    EL.filterStatus.value = '';
    EL.searchKeyword.value = '';
    state.selectedOpd = '';
    state.rekapPage = 1;
    state.detailPage = 1;
    applyFilters();
  });

  on(EL.btnRefresh, 'click', () => initMonitoring(true));
  on(EL.btnExportDetail, 'click', () => exportRows(getFilteredRawRows(), 'detail-ekatalog-semua-filter.csv'));
  on(EL.btnExportCurrentDetail, 'click', () => exportRows(state.selectedDetailRows, `detail-ekatalog-${slugify(state.selectedOpd || 'semua-opd')}.csv`));

  on(EL.btnShowMaxList, 'click', () => {
    const items = state.filteredRekap
      .filter(row => row.nilai_itkp >= 4)
      .map(row => row.satuan_kerja);

    openModal(
      'Daftar OPD Capai Target Max',
      'OPD yang sudah mencapai nilai ITKP maksimal eKatalog yaitu 4 poin.',
      items
    );
  });

  on(EL.btnShowZeroList, 'click', () => {
    const items = state.filteredRekap
      .filter(row => row.nilai_itkp <= 0)
      .map(row => row.satuan_kerja);

    openModal(
      'Daftar OPD Skor ITKP 0',
      'OPD yang indikator pemanfaatan eKatalog-nya masih 0.',
      items
    );
  });

  on(EL.btnCloseModal, 'click', closeModal);

  on(EL.opdModal, 'click', (event) => {
    if (event.target === EL.opdModal) closeModal();
  });

  on(document, 'keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  initMonitoring(true);

  return () => {
    state.destroyed = true;
    listeners.forEach(off => off());
    closeModal();
    clearLoading();
  };

  async function initMonitoring(useOverlay = false) {
    const startedAt = Date.now();

    try {
      showError('');
      setLoading('Menghubungkan ke Google Sheet...', useOverlay);

      const [rawResult, scoreResult] = await Promise.allSettled([
        fetchCsv(buildCsvUrl(EKATALOG_SHEET_CONFIG.rawGid)),
        fetchCsv(buildCsvUrl(EKATALOG_SHEET_CONFIG.scoreGid))
      ]);

      if (state.destroyed) return;

      let rawRows = [];
      let scoreRows = [];
      const errors = [];

      if (rawResult.status === 'fulfilled') {
        rawRows = csvToObjects(rawResult.value);
      } else {
        errors.push('RAW_ECAT gagal dimuat');
        console.error(rawResult.reason);
      }

      if (scoreResult.status === 'fulfilled') {
        scoreRows = csvToObjects(scoreResult.value);
      } else {
        errors.push('SCORE_ITKP_ECAT gagal dimuat');
        console.error(scoreResult.reason);
      }

      state.rawRows = normalizeRawRows(rawRows);
      state.scoreRows = normalizeScoreRows(scoreRows);
      state.rekapPage = 1;
      state.detailPage = 1;

      buildFilterOptions();
      applyFilters();

      if (errors.length) {
        showError(errors.join(' + ') + '. Sebagian data berhasil dimuat, sebagian gagal.');
      }
    } catch (error) {
      console.error(error);
      showError(`Data eKatalog gagal dimuat. Detail: ${error.message}. Pastikan sheet bisa diakses publik.`);
    } finally {
      const elapsed = Date.now() - startedAt;

      if (elapsed < EKATALOG_MIN_LOADING_MS) {
        await wait(EKATALOG_MIN_LOADING_MS - elapsed);
      }

      if (!state.destroyed) {
        clearLoading();
      }
    }
  }

  function setSummaryCardLabels() {
    const activeCard = EL.statPaketAktif?.closest('.stat-card');
    if (activeCard) {
      const label = activeCard.querySelector('.stat-label');
      const note = activeCard.querySelector('.stat-note');
      if (label) label.textContent = 'Sisa Paket Aktif';
      if (note) note.textContent = 'Dihitung dari status ON_PROCESS dan ON_ADDENDUM pada RAW_ECAT.';
    }

    const selesaiCard = EL.statPaketSelesai?.closest('.stat-card');
    if (selesaiCard) {
      const note = selesaiCard.querySelector('.stat-note');
      if (note) note.textContent = 'Status selesai dihitung dari paket selesai / payment out pada RAW_ECAT.';
    }
  }

  function applyFilters() {
    const opdValue = (EL.filterOpd.value || '').trim().toLowerCase();
    const statusValue = normalizeStatus(EL.filterStatus.value || '');
    const keyword = (EL.searchKeyword.value || '').trim().toLowerCase();

    state.filteredRekap = state.scoreRows.filter(row => {
      if (opdValue && row.satuan_kerja.toLowerCase() !== opdValue) return false;

      if (keyword) {
        const inOpd = row.satuan_kerja.toLowerCase().includes(keyword);
        const rawMatch = state.rawRows.some(item =>
          item.satuan_kerja === row.satuan_kerja &&
          (
            item.nama_paket.toLowerCase().includes(keyword) ||
            item.nomor_paket.toLowerCase().includes(keyword)
          )
        );

        if (!inOpd && !rawMatch) return false;
      }

      if (statusValue) {
        const hasStatus = state.rawRows.some(item =>
          item.satuan_kerja === row.satuan_kerja &&
          item.status_normalized === statusValue
        );

        if (!hasStatus) return false;
      }

      return true;
    });

    if (state.selectedOpd && !state.filteredRekap.some(row => row.satuan_kerja === state.selectedOpd)) {
      state.selectedOpd = '';
    }

    if (!state.selectedOpd && state.filteredRekap.length === 1) {
      state.selectedOpd = state.filteredRekap[0].satuan_kerja;
    }

    state.selectedDetailRows = getFilteredRawRows();

    renderSummaryStats();
    renderInsights();
    renderRekapTable();
    renderDetailTable();
  }

  function buildFilterOptions() {
    fillSelect(
      EL.filterOpd,
      state.scoreRows.map(row => row.satuan_kerja),
      'Semua OPD'
    );

    fillSelect(
      EL.filterStatus,
      getUniqueStatuses(state.rawRows),
      'Semua Status'
    );
  }

  function renderSummaryStats() {
    const visibleRaw = getFilteredRawRows();
    const sisaMasihAktif = visibleRaw.filter(row => isStillActiveStatus(row.status_normalized)).length;
    const paketSelesaiRaw = visibleRaw.filter(row => isFinishedStatus(row.status_normalized)).length;
    const avgItkp = average(state.filteredRekap.map(row => row.nilai_itkp));

    if (EL.statJumlahOpd) EL.statJumlahOpd.textContent = formatInt(state.filteredRekap.length);
    if (EL.statJumlahPaket) EL.statJumlahPaket.textContent = formatInt(visibleRaw.length);
    if (EL.statTotalPagu) EL.statTotalPagu.textContent = formatCurrency(sum(visibleRaw.map(row => row.pagu)));
    if (EL.statPaketAktif) EL.statPaketAktif.textContent = formatInt(sisaMasihAktif);
    if (EL.statPaketSelesai) EL.statPaketSelesai.textContent = formatInt(paketSelesaiRaw);
    if (EL.statAvgItkp) EL.statAvgItkp.textContent = formatDecimal(avgItkp, 2);
  }

  function renderInsights() {
    const maxItems = state.filteredRekap
      .filter(row => row.nilai_itkp >= 4)
      .map(row => row.satuan_kerja);

    const zeroItems = state.filteredRekap
      .filter(row => row.nilai_itkp <= 0)
      .map(row => row.satuan_kerja);

    if (EL.maxCount) EL.maxCount.textContent = formatInt(maxItems.length);
    if (EL.zeroCount) EL.zeroCount.textContent = formatInt(zeroItems.length);

    const dominant = getDominantStatus(getFilteredRawRows());
    if (EL.dominantStatus) EL.dominantStatus.textContent = dominant ? dominant.status : '-';
    if (EL.dominantStatusNote) EL.dominantStatusNote.textContent = dominant ? `${formatInt(dominant.count)} paket` : 'Belum ada data';
  }

  function renderRekapTable() {
    const rows = state.filteredRekap.slice();
    const totalItems = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / EKATALOG_PAGE_SIZE));
    state.rekapPage = Math.min(state.rekapPage, totalPages);

    const start = (state.rekapPage - 1) * EKATALOG_PAGE_SIZE;
    const end = start + EKATALOG_PAGE_SIZE;
    const pageRows = rows.slice(start, end);

    if (!EL.rekapTableBody) return;

    if (!pageRows.length) {
      EL.rekapTableBody.innerHTML = `<tr><td class="center-cell" colspan="7">Tidak ada data rekap yang sesuai filter.</td></tr>`;
    } else {
      EL.rekapTableBody.innerHTML = pageRows.map((row, index) => `
        <tr>
          <td>${start + index + 1}</td>
          <td class="cell-strong">${escapeHtml(row.satuan_kerja)}</td>
          <td>${formatInt(row.paket_aktif)}</td>
          <td>${formatInt(row.paket_selesai)}</td>
          <td>${renderPercentBadge(row.prosentase)}</td>
          <td>${renderItkpBadge(row.nilai_itkp)}</td>
          <td>
            <button class="action-btn" type="button" data-opd="${escapeAttr(row.satuan_kerja)}">
              Lihat Paket
            </button>
          </td>
        </tr>
      `).join('');

      EL.rekapTableBody.querySelectorAll('[data-opd]').forEach(btn => {
        on(btn, 'click', () => {
          state.selectedOpd = btn.dataset.opd;

          if (EL.filterOpd) {
            EL.filterOpd.value = btn.dataset.opd;
          }

          state.detailPage = 1;
          applyFilters();

          root.querySelector('.detail-content-wrap')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        });
      });
    }

    const from = totalItems ? start + 1 : 0;
    const to = totalItems ? Math.min(end, totalItems) : 0;

    if (EL.rekapPaginationInfo) {
      EL.rekapPaginationInfo.textContent = `${from}-${to} dari ${totalItems} data • Page ${state.rekapPage} / ${totalPages}`;
    }

    renderPagination(EL.rekapPagination, state.rekapPage, totalPages, (page) => {
      state.rekapPage = page;
      renderRekapTable();
    });
  }

  function renderDetailTable() {
    const rows = state.selectedDetailRows.slice();
    const totalItems = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / EKATALOG_DETAIL_PAGE_SIZE));
    state.detailPage = Math.min(state.detailPage, totalPages);

    const start = (state.detailPage - 1) * EKATALOG_DETAIL_PAGE_SIZE;
    const end = start + EKATALOG_DETAIL_PAGE_SIZE;
    const pageRows = rows.slice(start, end);

    if (EL.detailTitle) {
      EL.detailTitle.textContent = state.selectedOpd
        ? `Detail Paket eKatalog - ${state.selectedOpd}`
        : 'Detail Paket eKatalog';
    }

    if (EL.detailSubtitle) {
      EL.detailSubtitle.textContent = state.selectedOpd
        ? `Menampilkan ${formatInt(totalItems)} paket pada OPD terpilih.`
        : 'Pilih OPD pada tabel rekap untuk melihat daftar paket.';
    }

    if (!EL.detailTableBody) return;

    if (!pageRows.length) {
      EL.detailTableBody.innerHTML = `<tr><td class="center-cell" colspan="7">Belum ada detail paket untuk ditampilkan.</td></tr>`;
    } else {
      EL.detailTableBody.innerHTML = pageRows.map((row, index) => `
        <tr>
          <td>${start + index + 1}</td>
          <td class="cell-strong">${escapeHtml(row.satuan_kerja)}</td>
          <td>${escapeHtml(row.nomor_paket)}</td>
          <td>${escapeHtml(row.nama_paket)}</td>
          <td>${formatCurrency(row.pagu)}</td>
          <td>${renderStatusBadge(row.status_normalized)}</td>
          <td>${escapeHtml(row.tanggal_buat_paket || '-')}</td>
        </tr>
      `).join('');
    }

    const from = totalItems ? start + 1 : 0;
    const to = totalItems ? Math.min(end, totalItems) : 0;

    if (EL.detailPaginationInfo) {
      EL.detailPaginationInfo.textContent = totalItems
        ? `${from}-${to} dari ${totalItems} paket • Page ${state.detailPage} / ${totalPages}`
        : 'Belum ada data detail.';
    }

    renderPagination(EL.detailPagination, state.detailPage, totalPages, (page) => {
      state.detailPage = page;
      renderDetailTable();
    });
  }

  function getFilteredRawRows() {
    const opdValue = (EL.filterOpd.value || '').trim().toLowerCase();
    const statusValue = normalizeStatus(EL.filterStatus.value || '');
    const keyword = (EL.searchKeyword.value || '').trim().toLowerCase();

    return state.rawRows.filter(row => {
      if (state.selectedOpd && row.satuan_kerja !== state.selectedOpd) return false;
      if (!state.selectedOpd && opdValue && row.satuan_kerja.toLowerCase() !== opdValue) return false;
      if (statusValue && row.status_normalized !== statusValue) return false;

      if (keyword) {
        const hay = `${row.satuan_kerja} ${row.nama_paket} ${row.nomor_paket}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }

      return true;
    });
  }

  function openModal(title, subtitle, items) {
    if (!EL.opdModal) return;

    if (EL.modalTitle) EL.modalTitle.textContent = title;
    if (EL.modalSubtitle) EL.modalSubtitle.textContent = subtitle;
    if (EL.modalCount) EL.modalCount.textContent = `${formatInt(items.length)} OPD`;

    if (EL.modalList) {
      EL.modalList.innerHTML = items.length
        ? items.map(item => `<div class="modal-item">${escapeHtml(item)}</div>`).join('')
        : `<div class="modal-item">Belum ada OPD.</div>`;
    }

    EL.opdModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (EL.opdModal) {
      EL.opdModal.hidden = true;
    }

    document.body.style.overflow = '';
  }

  function setLoading(message, useOverlay = false) {
    if (EL.loadingText) EL.loadingText.textContent = message;
    if (EL.globalLoadingText) EL.globalLoadingText.textContent = message;
    if (EL.loadingBox) EL.loadingBox.classList.add('show');
    if (useOverlay && EL.globalLoadingOverlay) EL.globalLoadingOverlay.classList.add('show');
  }

  function clearLoading() {
    if (EL.loadingBox) EL.loadingBox.classList.remove('show');
    if (EL.globalLoadingOverlay) EL.globalLoadingOverlay.classList.remove('show');
  }

  function showError(message) {
    if (!EL.errorBox) return;

    if (message) {
      EL.errorBox.textContent = message;
      EL.errorBox.classList.add('show');
    } else {
      EL.errorBox.textContent = '';
      EL.errorBox.classList.remove('show');
    }
  }
};

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${EKATALOG_SHEET_CONFIG.spreadsheetId}/export?format=csv&gid=${gid}`;
}

async function fetchCsv(url) {
  const response = await fetch(url, { method: 'GET', cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status} saat mengambil ${url}`);

  const text = await response.text();
  if (!text || !text.trim()) throw new Error(`CSV kosong dari ${url}`);
  if (/<!doctype html>|<html/i.test(text)) throw new Error(`Response bukan CSV. Kemungkinan sheet masih belum public: ${url}`);

  return text;
}

function csvToObjects(csvText) {
  const rows = parseCsv(csvText);
  if (!rows.length) return [];

  const headers = rows[0].map(h => normalizeHeader(h));

  return rows.slice(1)
    .filter(row => row.some(cell => String(cell || '').trim() !== ''))
    .map(row => {
      const obj = {};

      headers.forEach((header, index) => {
        obj[header] = row[index] != null ? String(row[index]).trim() : '';
      });

      return obj;
    });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(header) {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[()%./-]/g, '')
    .replace(/__+/g, '_');
}

function pick(row, keys) {
  for (const key of keys) {
    if (row[key] != null && String(row[key]).trim() !== '') return String(row[key]).trim();
  }

  return '';
}

function normalizeRawRows(rows) {
  return rows.map(row => {
    const status = pick(row, ['status_paket', 'status']);

    return {
      satuan_kerja: pick(row, ['satuan_kerja', 'satker']),
      nomor_paket: pick(row, ['nomor_paket', 'kode_paket', 'nomor']),
      nama_paket: pick(row, ['nama_paket', 'paket']),
      pagu: toNumber(pick(row, ['pagu', 'nilai_pagu'])),
      status_paket: status,
      status_normalized: normalizeStatus(status),
      tanggal_buat_paket: pick(row, ['tanggal_buat_paket', 'tgl_buat_paket', 'tanggal_buat'])
    };
  }).filter(row => row.satuan_kerja && row.nama_paket);
}

function normalizeScoreRows(rows) {
  return rows.map(row => ({
    satuan_kerja: pick(row, ['satuan_kerja', 'satker']),
    paket_aktif: toNumber(pick(row, ['paket_aktif'])),
    paket_selesai: toNumber(pick(row, ['paket_selesai'])),
    prosentase: toNumber(pick(row, ['prosentase', 'persentase'])),
    nilai_itkp: toNumber(pick(row, ['nilai_itkp']))
  })).filter(row => row.satuan_kerja);
}

function normalizeStatus(status) {
  const value = String(status || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');

  if (!value) return '';
  if (value.includes('PAYMENT_OUTSIDE_SYSTEM')) return 'PAYMENT_OUTSIDE_SYSTEM';
  if (value.includes('PAYMENT_OUT')) return 'PAYMENT_OUT';
  if (value.includes('COMPLETED')) return 'COMPLETED';
  if (value.includes('ON_ADDENDUM')) return 'ON_ADDENDUM';
  if (value.includes('ON_PROCESS')) return 'ON_PROCESS';
  if (value.includes('FAILED') || value.includes('GAGAL')) return 'FAILED';
  if (value.includes('DRAFT')) return 'DRAFT';

  return value;
}

function isStillActiveStatus(status) {
  return status === 'ON_PROCESS' || status === 'ON_ADDENDUM';
}

function isFinishedStatus(status) {
  return ['PAYMENT_OUTSIDE_SYSTEM', 'PAYMENT_OUT', 'COMPLETED', 'SELESAI', 'FINISHED', 'DONE'].includes(status);
}

function getUniqueStatuses(rows) {
  return Array.from(new Set(rows.map(row => row.status_normalized).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'id'));
}

function getDominantStatus(rows) {
  const map = new Map();

  rows.forEach(row => {
    const key = row.status_normalized || 'LAINNYA';
    map.set(key, (map.get(key) || 0) + 1);
  });

  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return null;

  return {
    status: sorted[0][0],
    count: sorted[0][1]
  };
}

function renderPagination(container, currentPage, totalPages, onChange) {
  if (!container) return;

  container.innerHTML = '';
  if (totalPages <= 1) return;

  container.appendChild(makePageButton('«', currentPage > 1, () => onChange(1)));
  container.appendChild(makePageButton('‹', currentPage > 1, () => onChange(currentPage - 1)));

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = Array.from(pages).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  let last = 0;

  sorted.forEach(page => {
    if (page - last > 1) {
      const gap = document.createElement('span');
      gap.className = 'page-btn';
      gap.textContent = '...';
      gap.style.pointerEvents = 'none';
      container.appendChild(gap);
    }

    container.appendChild(makePageButton(String(page), true, () => onChange(page), page === currentPage));
    last = page;
  });

  container.appendChild(makePageButton('›', currentPage < totalPages, () => onChange(currentPage + 1)));
  container.appendChild(makePageButton('»', currentPage < totalPages, () => onChange(totalPages)));

  function makePageButton(label, enabled, handler, active = false) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `page-btn${active ? ' active' : ''}`;
    btn.textContent = label;
    btn.disabled = !enabled;
    btn.addEventListener('click', handler);
    return btn;
  }
}

function fillSelect(select, items, placeholder) {
  if (!select) return;

  const currentValue = select.value;
  const uniqueItems = Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'id'));

  select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>` + uniqueItems
    .map(item => `<option value="${escapeAttr(item)}">${escapeHtml(item)}</option>`)
    .join('');

  if (uniqueItems.includes(currentValue)) select.value = currentValue;
}

function renderPercentBadge(value) {
  const klass = value >= 100 ? 'badge-green' : value > 0 ? 'badge-yellow' : 'badge-red';
  return `<span class="badge ${klass}">${formatDecimal(value, 2)}%</span>`;
}

function renderItkpBadge(value) {
  const klass = value >= 4 ? 'badge-green' : value > 0 ? 'badge-yellow' : 'badge-red';
  return `<span class="badge ${klass}">${formatDecimal(value, 0)}</span>`;
}

function renderStatusBadge(status) {
  const label = status || '-';
  let klass = 'badge-blue';

  if (status === 'ON_PROCESS' || status === 'ON_ADDENDUM') klass = 'badge-blue';
  else if (isFinishedStatus(status)) klass = 'badge-green';
  else if (status === 'FAILED' || status === 'DRAFT') klass = 'badge-red';
  else klass = 'badge-yellow';

  return `<span class="badge ${klass}">${escapeHtml(label)}</span>`;
}

function exportRows(rows, filename) {
  if (!Array.isArray(rows) || !rows.length) {
    alert('Tidak ada data yang bisa diexport.');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(',')]
    .concat(rows.map(row => headers.map(key => csvEscape(row[key])).join(',')))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(value) {
  const str = String(value == null ? '' : value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toNumber(value) {
  const clean = String(value == null ? '' : value)
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '');

  const num = parseFloat(clean);
  return Number.isFinite(num) ? num : 0;
}

function formatInt(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function formatCurrency(value) {
  return `Rp${Number(value || 0).toLocaleString('id-ID')}`;
}

function formatDecimal(value, digits = 2) {
  return Number(value || 0).toLocaleString('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function sum(values) {
  return values.reduce((acc, value) => acc + Number(value || 0), 0);
}

function average(values) {
  if (!values.length) return 0;
  return sum(values) / values.length;
}

function slugify(text) {
  return String(text || 'data')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'data';
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}
})();