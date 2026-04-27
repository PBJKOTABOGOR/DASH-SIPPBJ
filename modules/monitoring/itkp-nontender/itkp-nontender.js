(function () {
  'use strict';

  const NONTENDER_SHEET_CONFIG = {
    spreadsheetId: '1ToEDE9uugH2x44iOJCiTRtHH6BkcFZj4iAwYyI-rC5I',
    rawSheetName: 'M_Pencatatan',
    scoreSheetName: 'SCORE_ITKP_NONT'
  };

  const NONTENDER_MIN_LOADING_MS = 700;
  const NONTENDER_PAGE_SIZE = 20;
  const NONTENDER_DETAIL_PAGE_SIZE = 10;
  const NONTENDER_MAX_ITKP = 5;

  window.__moduleInit = function ({ container }) {
    const root = container.querySelector('.itkp-nontender-page');
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
      filterMetode: root.querySelector('#filterMetode'),
      filterStatus: root.querySelector('#filterStatus'),
      filterItkp: root.querySelector('#filterItkp'),
      searchKeyword: root.querySelector('#searchKeyword'),

      btnResetFilter: root.querySelector('#btnResetFilter'),
      btnRefresh: root.querySelector('#btnRefresh'),
      btnExportDetail: root.querySelector('#btnExportDetail'),
      btnExportCurrentDetail: root.querySelector('#btnExportCurrentDetail'),
      btnClearDetail: root.querySelector('#btnClearDetail'),

      statJumlahOpd: root.querySelector('#statJumlahOpd'),
      statJumlahPaket: root.querySelector('#statJumlahPaket'),
      statTotalPagu: root.querySelector('#statTotalPagu'),
      statTotalRealisasi: root.querySelector('#statTotalRealisasi'),
      statDobelRealisasi: root.querySelector('#statDobelRealisasi'),
      statAvgItkp: root.querySelector('#statAvgItkp'),

      maxCount: root.querySelector('#maxCount'),
      zeroCount: root.querySelector('#zeroCount'),
      doubleCount: root.querySelector('#doubleCount'),
      btnShowMaxList: root.querySelector('#btnShowMaxList'),
      btnShowZeroList: root.querySelector('#btnShowZeroList'),
      btnShowDoubleList: root.querySelector('#btnShowDoubleList'),

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

    on(EL.filterOpd, 'change', () => {
      state.selectedOpd = EL.filterOpd.value;
      state.rekapPage = 1;
      state.detailPage = 1;
      applyFilters();
    });

    on(EL.filterMetode, 'change', () => {
      state.rekapPage = 1;
      state.detailPage = 1;
      applyFilters();
    });

    on(EL.filterStatus, 'change', () => {
      state.rekapPage = 1;
      state.detailPage = 1;
      applyFilters();
    });

    on(EL.filterItkp, 'change', () => {
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
      if (EL.filterOpd) EL.filterOpd.value = '';
      if (EL.filterMetode) EL.filterMetode.value = '';
      if (EL.filterStatus) EL.filterStatus.value = '';
      if (EL.filterItkp) EL.filterItkp.value = '';
      if (EL.searchKeyword) EL.searchKeyword.value = '';

      state.selectedOpd = '';
      state.rekapPage = 1;
      state.detailPage = 1;
      applyFilters();
    });

    on(EL.btnRefresh, 'click', () => initMonitoring(true));

    on(EL.btnExportDetail, 'click', () => {
      exportRows(getFilteredRawRows(), 'detail-nontender-semua-filter.xlsx');
    });

    on(EL.btnExportCurrentDetail, 'click', () => {
      exportRows(
        state.selectedDetailRows,
        `detail-nontender-${slugify(state.selectedOpd || 'semua-opd')}.xlsx`
      );
    });

    on(EL.btnClearDetail, 'click', () => {
      state.selectedOpd = '';
      state.selectedDetailRows = getFilteredRawRows();
      state.detailPage = 1;

      if (EL.filterOpd) EL.filterOpd.value = '';

      applyFilters();
    });

    on(EL.btnShowMaxList, 'click', () => {
      const items = state.filteredRekap
        .filter(row => row.nilai_itkp >= NONTENDER_MAX_ITKP)
        .map(row => row.satuan_kerja);

      openModal(
        'Daftar OPD Capai Target Max',
        `OPD yang sudah mencapai nilai ITKP maksimal Non Tender yaitu ${NONTENDER_MAX_ITKP} poin.`,
        items,
        'OPD'
      );
    });

    on(EL.btnShowZeroList, 'click', () => {
      const items = state.filteredRekap
        .filter(row => row.nilai_itkp <= 0)
        .map(row => row.satuan_kerja);

      openModal(
        'Daftar OPD Skor ITKP 0',
        'OPD yang indikator Non Tender-nya masih 0.',
        items,
        'OPD'
      );
    });

    on(EL.btnShowDoubleList, 'click', () => {
      const items = getFilteredRawRows()
        .filter(row => row.is_double_realization)
        .map(row => `${row.kode_rup || '-'} • ${row.satuan_kerja} • ${row.nama_paket}`);

      openModal(
        'Daftar Paket Dobel Realisasi',
        'Paket yang memiliki nilai Realisasi Pencatatan dan Realisasi eKontrak sekaligus. Ini perlu dicek karena 1 paket tidak seharusnya dicatat di dua jenis realisasi.',
        items,
        'Paket',
        true
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

      listeners.forEach(off => {
        try {
          off();
        } catch (err) {
          console.warn('Gagal melepas listener Non Tender:', err);
        }
      });

      closeModal();
      clearLoading();
    };

    async function initMonitoring(useOverlay = false) {
      const startedAt = Date.now();

      try {
        showError('');
        setLoading('Menghubungkan ke Google Sheet...', useOverlay);

        const [rawResult, scoreResult] = await Promise.allSettled([
          fetchCsv(buildCsvUrlBySheetName(NONTENDER_SHEET_CONFIG.rawSheetName)),
          fetchCsv(buildCsvUrlBySheetName(NONTENDER_SHEET_CONFIG.scoreSheetName))
        ]);

        if (state.destroyed) return;

        let rawRows = [];
        let scoreRows = [];
        const errors = [];

        if (rawResult.status === 'fulfilled') {
          rawRows = csvToObjects(rawResult.value);
        } else {
          errors.push('M_Pencatatan gagal dimuat');
          console.error(rawResult.reason);
        }

        if (scoreResult.status === 'fulfilled') {
          scoreRows = csvToObjects(scoreResult.value);
        } else {
          errors.push('SCORE_ITKP_NONT gagal dimuat');
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
        showError(`Data Non Tender gagal dimuat. Detail: ${error.message}. Pastikan sheet bisa diakses publik.`);
      } finally {
        const elapsed = Date.now() - startedAt;

        if (elapsed < NONTENDER_MIN_LOADING_MS) {
          await wait(NONTENDER_MIN_LOADING_MS - elapsed);
        }

        if (!state.destroyed) {
          clearLoading();
        }
      }
    }

    function applyFilters() {
      const opdValue = normalizeText(EL.filterOpd?.value || '');
      const metodeValue = normalizeText(EL.filterMetode?.value || '');
      const statusValue = EL.filterStatus?.value || '';
      const itkpValue = EL.filterItkp?.value || '';
      const keyword = normalizeText(EL.searchKeyword?.value || '');

      state.filteredRekap = state.scoreRows.filter(row => {
        const rowOpd = normalizeText(row.satuan_kerja);

        if (opdValue && rowOpd !== opdValue) return false;

        if (itkpValue === 'MAX' && row.nilai_itkp < NONTENDER_MAX_ITKP) return false;
        if (itkpValue === 'ZERO' && row.nilai_itkp > 0) return false;

        const relatedRaw = state.rawRows.filter(item => normalizeText(item.satuan_kerja) === rowOpd);

        if (metodeValue) {
          const hasMetode = relatedRaw.some(item => normalizeText(item.metode) === metodeValue);
          if (!hasMetode) return false;
        }

        if (statusValue) {
          const hasStatus = relatedRaw.some(item => getRowStatus(item) === statusValue);
          if (!hasStatus) return false;
        }

        if (keyword) {
          const inOpd = rowOpd.includes(keyword);
          const rawMatch = relatedRaw.some(item => {
            const hay = normalizeText(`${item.kode_rup} ${item.satuan_kerja} ${item.program} ${item.kegiatan} ${item.sub_kegiatan} ${item.nama_paket} ${item.metode}`);
            return hay.includes(keyword);
          });

          if (!inOpd && !rawMatch) return false;
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
      fillSelect(EL.filterOpd, state.scoreRows.map(row => row.satuan_kerja), 'Semua OPD');
      fillSelect(EL.filterMetode, state.rawRows.map(row => row.metode), 'Semua Metode');
    }

    function renderSummaryStats() {
      const visibleRaw = getFilteredRawRows();
      const doubleRows = visibleRaw.filter(row => row.is_double_realization);
      const avgItkp = average(state.filteredRekap.map(row => row.nilai_itkp));

      if (EL.statJumlahOpd) EL.statJumlahOpd.textContent = formatInt(state.filteredRekap.length);
      if (EL.statJumlahPaket) EL.statJumlahPaket.textContent = formatInt(visibleRaw.length);
      if (EL.statTotalPagu) EL.statTotalPagu.textContent = formatCurrency(sum(visibleRaw.map(row => row.pagu)));
      if (EL.statTotalRealisasi) EL.statTotalRealisasi.textContent = formatCurrency(sum(visibleRaw.map(row => row.total_realisasi)));
      if (EL.statDobelRealisasi) EL.statDobelRealisasi.textContent = formatInt(doubleRows.length);
      if (EL.statAvgItkp) EL.statAvgItkp.textContent = formatDecimal(avgItkp, 2);
    }

    function renderInsights() {
      const maxItems = state.filteredRekap
        .filter(row => row.nilai_itkp >= NONTENDER_MAX_ITKP)
        .map(row => row.satuan_kerja);

      const zeroItems = state.filteredRekap
        .filter(row => row.nilai_itkp <= 0)
        .map(row => row.satuan_kerja);

      const doubleRows = getFilteredRawRows().filter(row => row.is_double_realization);

      if (EL.maxCount) EL.maxCount.textContent = formatInt(maxItems.length);
      if (EL.zeroCount) EL.zeroCount.textContent = formatInt(zeroItems.length);
      if (EL.doubleCount) EL.doubleCount.textContent = formatInt(doubleRows.length);
    }

    function renderRekapTable() {
      const rows = state.filteredRekap.slice();
      const totalItems = rows.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / NONTENDER_PAGE_SIZE));
      state.rekapPage = Math.min(state.rekapPage, totalPages);

      const start = (state.rekapPage - 1) * NONTENDER_PAGE_SIZE;
      const end = start + NONTENDER_PAGE_SIZE;
      const pageRows = rows.slice(start, end);

      if (!EL.rekapTableBody) return;

      if (!pageRows.length) {
        EL.rekapTableBody.innerHTML = `<tr><td class="center-cell" colspan="7">Tidak ada data rekap yang sesuai filter.</td></tr>`;
      } else {
        EL.rekapTableBody.innerHTML = pageRows.map((row, index) => `
          <tr>
            <td>${start + index + 1}</td>
            <td class="cell-strong">${escapeHtml(row.satuan_kerja)}</td>
            <td>${formatCurrency(row.total_pagu)}</td>
            <td>${formatCurrency(row.total_realisasi)}</td>
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

            root.querySelector('.detail-panel')?.scrollIntoView({
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
      const totalPages = Math.max(1, Math.ceil(totalItems / NONTENDER_DETAIL_PAGE_SIZE));
      state.detailPage = Math.min(state.detailPage, totalPages);

      const start = (state.detailPage - 1) * NONTENDER_DETAIL_PAGE_SIZE;
      const end = start + NONTENDER_DETAIL_PAGE_SIZE;
      const pageRows = rows.slice(start, end);

      if (EL.detailTitle) {
        EL.detailTitle.textContent = state.selectedOpd
          ? `Detail Paket Non Tender - ${state.selectedOpd}`
          : 'Detail Paket Non Tender';
      }

      if (EL.detailSubtitle) {
        EL.detailSubtitle.textContent = state.selectedOpd
          ? `Menampilkan ${formatInt(totalItems)} paket pada OPD terpilih.`
          : 'Pilih OPD pada tabel rekap untuk melihat daftar paket.';
      }

      if (!EL.detailTableBody) return;

      if (!pageRows.length) {
        EL.detailTableBody.innerHTML = `<tr><td class="center-cell" colspan="11">Belum ada detail paket untuk ditampilkan.</td></tr>`;
      } else {
        EL.detailTableBody.innerHTML = pageRows.map((row, index) => `
          <tr class="${row.is_double_realization ? 'row-danger' : ''}">
            <td>${start + index + 1}</td>
            <td>${escapeHtml(row.kode_rup)}</td>
            <td class="cell-strong">${escapeHtml(row.satuan_kerja)}</td>
            <td class="cell-strong">${escapeHtml(row.nama_paket)}</td>
            <td>${renderMethodBadge(row.metode)}</td>
            <td>${formatCurrency(row.pagu)}</td>
            <td>${formatCurrency(row.realisasi_pencatatan)}</td>
            <td>${formatCurrency(row.realisasi_ekontrak)}</td>
            <td>${formatCurrency(row.total_realisasi)}</td>
            <td>${renderSelisih(row.selisih)}</td>
            <td>${renderRowStatus(row)}</td>
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
      const opdValue = normalizeText(EL.filterOpd?.value || '');
      const metodeValue = normalizeText(EL.filterMetode?.value || '');
      const statusValue = EL.filterStatus?.value || '';
      const keyword = normalizeText(EL.searchKeyword?.value || '');

      return state.rawRows.filter(row => {
        const rowOpd = normalizeText(row.satuan_kerja);

        if (state.selectedOpd && row.satuan_kerja !== state.selectedOpd) return false;
        if (!state.selectedOpd && opdValue && rowOpd !== opdValue) return false;
        if (metodeValue && normalizeText(row.metode) !== metodeValue) return false;
        if (statusValue && getRowStatus(row) !== statusValue) return false;

        if (keyword) {
          const hay = normalizeText(`${row.kode_rup} ${row.satuan_kerja} ${row.program} ${row.kegiatan} ${row.sub_kegiatan} ${row.nama_paket} ${row.metode}`);
          if (!hay.includes(keyword)) return false;
        }

        return true;
      });
    }

    function openModal(title, subtitle, items, unitLabel = 'data', danger = false) {
      if (!EL.opdModal) return;

      const safeItems = Array.isArray(items) ? items : [];

      if (EL.modalTitle) EL.modalTitle.textContent = title || 'Daftar Data';
      if (EL.modalSubtitle) EL.modalSubtitle.textContent = subtitle || '-';
      if (EL.modalCount) EL.modalCount.textContent = `${formatInt(safeItems.length)} ${unitLabel}`;

      if (EL.modalList) {
        EL.modalList.innerHTML = safeItems.length
          ? safeItems.map(item => `<div class="modal-item${danger ? ' danger' : ''}">${escapeHtml(item)}</div>`).join('')
          : `<div class="modal-item">Belum ada data.</div>`;
      }

      EL.opdModal.hidden = false;
      EL.opdModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (EL.opdModal) {
        EL.opdModal.classList.remove('show');
        EL.opdModal.hidden = true;
      }

      document.body.style.overflow = '';
    }

    function setLoading(message, useOverlay = false) {
      if (EL.loadingText) EL.loadingText.textContent = message;
      if (EL.globalLoadingText) EL.globalLoadingText.textContent = message;
      if (EL.loadingBox) EL.loadingBox.classList.add('show');
      if (useOverlay && EL.globalLoadingOverlay) EL.globalLoadingOverlay.classList.add('show');

      if (EL.btnRefresh) EL.btnRefresh.disabled = true;
      if (EL.btnExportDetail) EL.btnExportDetail.disabled = true;
      if (EL.btnExportCurrentDetail) EL.btnExportCurrentDetail.disabled = true;
    }

    function clearLoading() {
      if (EL.loadingBox) EL.loadingBox.classList.remove('show');
      if (EL.globalLoadingOverlay) EL.globalLoadingOverlay.classList.remove('show');

      if (EL.btnRefresh) EL.btnRefresh.disabled = false;
      if (EL.btnExportDetail) EL.btnExportDetail.disabled = false;
      if (EL.btnExportCurrentDetail) EL.btnExportCurrentDetail.disabled = false;
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

  function buildCsvUrlBySheetName(sheetName) {
    return `https://docs.google.com/spreadsheets/d/${NONTENDER_SHEET_CONFIG.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }

  async function fetchCsv(url) {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} saat mengambil ${url}`);
    }

    const text = await response.text();

    if (!text || !text.trim()) {
      throw new Error(`CSV kosong dari ${url}`);
    }

    if (/<!doctype html>|<html/i.test(text)) {
      throw new Error(`Response bukan CSV. Kemungkinan sheet masih belum public: ${url}`);
    }

    return text;
  }

  function csvToObjects(csvText) {
    const rows = parseCsv(csvText);
    if (!rows.length) return [];

    const headers = rows[0].map((h, index) => {
      const normalized = normalizeHeader(h);
      return normalized || `_skip_empty_header_${index}`;
    });

    return rows.slice(1)
      .filter(row => row.some(cell => String(cell || '').trim() !== ''))
      .map(row => {
        const obj = {};

        headers.forEach((header, index) => {
          if (header.startsWith('_skip_empty_header_')) return;
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
      if (row[key] != null && String(row[key]).trim() !== '') {
        return String(row[key]).trim();
      }
    }

    return '';
  }

  function normalizeRawRows(rows) {
    return rows.map(row => {
      const realisasiPencatatan = toNumber(pick(row, [
        'realisasi_pencatatan',
        'realisasi_pencatatan_',
        'realisasi_pencatatan_rp'
      ]));

      const realisasiEkontrak = toNumber(pick(row, [
        'realisasi_ekontrak',
        'realisasi_ekontrak_',
        'realisasi_ekontrak_rp'
      ]));

      const totalRealisasiFromSheet = toNumber(pick(row, [
        'total_realisasi',
        'total_realisasi_rp'
      ]));

      const totalRealisasi = totalRealisasiFromSheet || (realisasiPencatatan + realisasiEkontrak);
      const pagu = toNumber(pick(row, ['pagu', 'nilai_pagu']));
      const selisihFromSheet = pick(row, ['selisih']);
      const selisih = selisihFromSheet !== '' ? toNumber(selisihFromSheet) : (totalRealisasi - pagu);

      return {
        kode_rup: pick(row, ['kode_rup', 'kd_rup']),
        satuan_kerja: pick(row, ['nama_perangkat_daerah', 'satuan_kerja', 'satker', 'opd']),
        program: pick(row, ['program']),
        kegiatan: pick(row, ['kegiatan']),
        sub_kegiatan: pick(row, ['sub_kegiatan']),
        nama_paket: pick(row, ['nama_paket', 'paket']),
        metode: pick(row, ['metode', 'metode_pemilihan', 'mtd_pemilihan']),
        pagu,
        realisasi_pencatatan: realisasiPencatatan,
        realisasi_ekontrak: realisasiEkontrak,
        total_realisasi: totalRealisasi,
        selisih,
        is_double_realization: realisasiPencatatan > 0 && realisasiEkontrak > 0
      };
    }).filter(row => row.satuan_kerja && row.nama_paket);
  }

  function normalizeScoreRows(rows) {
    return rows.map(row => ({
      satuan_kerja: pick(row, ['satuan_kerja', 'nama_perangkat_daerah', 'satker', 'opd']),
      total_pagu: toNumber(pick(row, ['total_pagu', 'pagu'])),
      total_realisasi: toNumber(pick(row, ['total_realisasi', 'realisasi'])),
      prosentase: toNumber(pick(row, ['prosentase', 'persentase'])),
      nilai_itkp: toNumber(pick(row, ['nilai_itkp']))
    })).filter(row => row.satuan_kerja);
  }

  function getRowStatus(row) {
    if (row.is_double_realization) return 'DOBEL_REALISASI';
    if (Number(row.total_realisasi || 0) > 0) return 'SUDAH_REALISASI';
    return 'BELUM_REALISASI';
  }

  function renderRowStatus(row) {
    const status = getRowStatus(row);

    if (status === 'DOBEL_REALISASI') {
      return `<span class="badge badge-red">Dobel Realisasi</span>`;
    }

    if (status === 'SUDAH_REALISASI') {
      return `<span class="badge badge-green">Sudah Realisasi</span>`;
    }

    return `<span class="badge badge-muted">Belum Realisasi</span>`;
  }

  function renderSelisih(value) {
    const number = Number(value || 0);

    if (number < 0) {
      return `<span class="badge badge-yellow">${formatCurrency(number)}</span>`;
    }

    if (number > 0) {
      return `<span class="badge badge-red">${formatCurrency(number)}</span>`;
    }

    return `<span class="badge badge-green">Rp0</span>`;
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
    const klass = value >= NONTENDER_MAX_ITKP ? 'badge-green' : value > 0 ? 'badge-yellow' : 'badge-red';
    return `<span class="badge ${klass}">${formatDecimal(value, 0)}</span>`;
  }

  function renderMethodBadge(value) {
    return `<span class="badge badge-blue">${escapeHtml(value || '-')}</span>`;
  }

  function exportRows(rows, filename) {
    if (!Array.isArray(rows) || !rows.length) {
      alert('Tidak ada data yang bisa diexport.');
      return;
    }

    if (!window.XLSX) {
      alert('Library XLSX belum dimuat. Pastikan xlsx.full.min.js sudah ditambahkan di index.html sebelum app.js.');
      return;
    }

    const safeFilename = String(filename || 'export-data.xlsx')
      .replace(/\.csv$/i, '.xlsx')
      .replace(/\.xls$/i, '.xlsx');

    const cleanRows = rows.map(row => {
      const obj = {};

      Object.keys(row || {}).forEach(key => {
        obj[key] = row[key] == null ? '' : row[key];
      });

      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(cleanRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    const colWidths = [];

    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxLength = 10;

      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];

        if (cell && cell.v != null) {
          maxLength = Math.max(maxLength, String(cell.v).length);
        }
      }

      colWidths.push({ wch: Math.min(maxLength + 2, 45) });
    }

    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, safeFilename);
  }

  function toNumber(value) {
    let clean = String(value == null ? '' : value)
      .replace(/rp/gi, '')
      .replace(/%/g, '')
      .replace(/\s/g, '')
      .replace(/[^\d.,-]/g, '');

    const hasDot = clean.includes('.');
    const hasComma = clean.includes(',');

    if (hasDot && hasComma) {
      const lastDot = clean.lastIndexOf('.');
      const lastComma = clean.lastIndexOf(',');

      if (lastComma > lastDot) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
    } else if (hasComma) {
      const parts = clean.split(',');

      if (parts.length > 2) {
        clean = parts.join('');
      } else {
        const tail = parts[1] || '';

        if (tail.length === 3) {
          clean = parts.join('');
        } else {
          clean = parts[0] + '.' + tail;
        }
      }
    } else if (hasDot) {
      const parts = clean.split('.');

      if (parts.length > 2) {
        clean = parts.join('');
      } else {
        const tail = parts[1] || '';

        if (tail.length === 3) {
          clean = parts.join('');
        }
      }
    }

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

  function normalizeText(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
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
