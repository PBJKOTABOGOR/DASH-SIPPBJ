(function () {
  const SHEET_CONFIG = {
    spreadsheetId: '1tRYoFQ2obJLoQfIBmZQ_qIw72ZCMV9fKIpBA3DlsIxE',
    rawGid: '0',
    scoreGid: '468989223'
  };

  const MIN_LOADING_MS = 700;
  const PAGE_SIZE_REKAP = 50;
  const PAGE_SIZE_DETAIL = 10;

  window.__moduleInit = function ({ container }) {
    const root = container.querySelector('.itkp-sirup-page') || container;

    const APP_STATE = {
      rawSirup: [],
      scoreSirup: [],
      filteredScore: [],
      filteredRawGlobal: [],
      selectedOpd: '',
      selectedRawRows: [],
      rekapPage: 1,
      detailPage: 1,
      destroyed: false
    };

    let EL = getElements();
    let cleanupResizeHandler = null;
    const cleanupListeners = [];

    function getElements() {
      return {
        loadingBox: root.querySelector('#loadingBox'),
        loadingText: root.querySelector('#loadingText'),
        errorBox: root.querySelector('#errorBox'),
        globalLoadingOverlay: root.querySelector('#globalLoadingOverlay'),
        globalLoadingText: root.querySelector('#globalLoadingText'),

        filterOpd: root.querySelector('#filterOpd'),
        filterMetode: root.querySelector('#filterMetode'),
        filterSumberDana: root.querySelector('#filterSumberDana'),
        filterWaktu: root.querySelector('#filterWaktu'),
        searchPaket: root.querySelector('#searchPaket'),

        rekapTableBody: root.querySelector('#rekapTableBody'),
        rekapPagination: root.querySelector('#rekapPagination'),
        rekapPaginationInfo: root.querySelector('#rekapPaginationInfo'),

        detailContent: root.querySelector('#detailContent'),
        detailTitle: root.querySelector('#detailTitle'),
        detailSubtitle: root.querySelector('#detailSubtitle'),
        detailPagination: root.querySelector('#detailPagination'),
        detailPaginationInfo: root.querySelector('#detailPaginationInfo'),

        btnResetFilter: root.querySelector('#btnResetFilter'),
        btnExportRekap: root.querySelector('#btnExportRekap'),
        btnExportDetail: root.querySelector('#btnExportDetail'),
        btnExportCurrentDetail: root.querySelector('#btnExportCurrentDetail'),
        btnRefresh: root.querySelector('#btnRefresh'),
        btnClearSelected: root.querySelector('#btnClearSelected'),

        statJumlahOpd: root.querySelector('#statJumlahOpd'),
        statJumlahPaket: root.querySelector('#statJumlahPaket'),
        statTotalRup: root.querySelector('#statTotalRup'),
        statTotalKomitmen: root.querySelector('#statTotalKomitmen'),
        statAvgPersen: root.querySelector('#statAvgPersen'),
        statAvgItkp: root.querySelector('#statAvgItkp'),
        statJumlahOpdNote: root.querySelector('#statJumlahOpdNote'),
        statJumlahPaketNote: root.querySelector('#statJumlahPaketNote'),
        statTotalRupNote: root.querySelector('#statTotalRupNote'),
        statTotalKomitmenNote: root.querySelector('#statTotalKomitmenNote'),

        insightTopOpd: root.querySelector('#insightTopOpd'),
        insightTopNote: root.querySelector('#insightTopNote'),
        insightLowOpd: root.querySelector('#insightLowOpd'),
        insightLowNote: root.querySelector('#insightLowNote'),
        insightMetode: root.querySelector('#insightMetode'),
        insightMetodeNote: root.querySelector('#insightMetodeNote')
      };
    }

    function wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function nextPaint() {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    }

    function safeBind(el, eventName, handler) {
      if (!el) return;

      el.addEventListener(eventName, handler);
      cleanupListeners.push(() => {
        el.removeEventListener(eventName, handler);
      });
    }

    function safeSetText(el, value) {
      if (el) el.textContent = value;
    }

    function resetUiState() {
      EL = getElements();

      if (EL.loadingBox) EL.loadingBox.classList.remove('show');
      if (EL.globalLoadingOverlay) EL.globalLoadingOverlay.classList.remove('show');

      if (EL.errorBox) {
        EL.errorBox.textContent = '';
        EL.errorBox.classList.remove('show');
      }
    }

    function buildCsvUrl(gid) {
      return `https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.spreadsheetId}/export?format=csv&gid=${gid}`;
    }

    function setLoading(message, useOverlay = false) {
      safeSetText(EL.loadingText, message);
      safeSetText(EL.globalLoadingText, message);

      if (EL.loadingBox) EL.loadingBox.classList.add('show');
      if (useOverlay && EL.globalLoadingOverlay) EL.globalLoadingOverlay.classList.add('show');

      if (EL.btnRefresh) EL.btnRefresh.disabled = true;
      if (EL.btnExportRekap) EL.btnExportRekap.disabled = true;
      if (EL.btnExportDetail) EL.btnExportDetail.disabled = true;
      if (EL.btnExportCurrentDetail) EL.btnExportCurrentDetail.disabled = true;
    }

    function clearLoading() {
      if (EL.loadingBox) EL.loadingBox.classList.remove('show');
      if (EL.globalLoadingOverlay) EL.globalLoadingOverlay.classList.remove('show');

      if (EL.btnRefresh) EL.btnRefresh.disabled = false;
      if (EL.btnExportRekap) EL.btnExportRekap.disabled = false;
      if (EL.btnExportDetail) EL.btnExportDetail.disabled = false;
      if (EL.btnExportCurrentDetail) EL.btnExportCurrentDetail.disabled = false;
    }

    async function fetchCsv(url, retries = 2) {
      let lastError;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
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
            throw new Error(`Response bukan CSV, kemungkinan akses sheet masih tertutup: ${url}`);
          }

          return text;
        } catch (error) {
          lastError = error;

          if (attempt < retries) {
            await wait(500 + attempt * 700);
          }
        }
      }

      throw lastError;
    }

    function csvToObjects(csvText) {
      const rows = parseCsv(csvText);
      if (!rows.length) return [];

      const headers = rows[0].map(h => normalizeHeader(h));
      const dataRows = rows.slice(1);

      return dataRows
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
        .replace(/[()/%.-]/g, '')
        .replace(/__+/g, '_');
    }

    function pick(obj, keys) {
      for (const key of keys) {
        if (obj[key] != null && String(obj[key]).trim() !== '') {
          return String(obj[key]).trim();
        }
      }

      return '';
    }

    function normalizeRawSirup(rows) {
      return rows.map(row => ({
        satuan_kerja: pick(row, ['satuan_kerja']),
        kode_rup: pick(row, ['kode_rup']),
        program: pick(row, ['program']),
        kegiatan: pick(row, ['kegiatan']),
        sub_kegiatan: pick(row, ['sub_kegiatan']),
        nama_paket: pick(row, ['nama_paket']),
        pagu_anggaran: toNumber(pick(row, ['pagu_anggaran'])),
        cara_pengadaan: pick(row, ['cara_pengadaan']),
        metode_pemilihan: pick(row, ['metode_pemilihan']),
        jenis_pengadaan: pick(row, ['jenis_pengadaan']),
        pdn: pick(row, ['produk_dalam_negeri']),
        sumber_dana: pick(row, ['sumber_dana']),
        waktu_pemilihan: pick(row, ['waktu_pemilihan'])
      }))
      .filter(row => row.satuan_kerja && row.nama_paket);
    }

    function normalizeScoreSirup(rows) {
      return rows.map(row => ({
        satuan_kerja: pick(row, ['satuan_kerja']),
        penyedia_diumumkan: toNumber(pick(row, ['penyedia_diumumkan'])),
        swakelola_diumumkan: toNumber(pick(row, ['swakelola_diumumkan'])),
        total_rup_diumumkan: toNumber(pick(row, ['total_rup_diumumkan'])),
        total_komitmen: toNumber(pick(row, ['total_komitmen'])),
        prosentase: toNumber(pick(row, ['prosentase'])),
        nilai_itkp: toNumber(pick(row, ['nilai_itkp']))
      }))
      .filter(row => row.satuan_kerja);
    }

    function showError(message) {
      if (!EL.errorBox) return;

      EL.errorBox.textContent = message || '';
      EL.errorBox.classList.toggle('show', !!message);
    }

    function buildFilterOptions() {
      populateSelect(
        EL.filterOpd,
        uniqueSorted(APP_STATE.scoreSirup.map(x => x.satuan_kerja)),
        'Semua Satuan Kerja'
      );

      populateSelect(
        EL.filterMetode,
        uniqueSorted(APP_STATE.rawSirup.map(x => x.metode_pemilihan)),
        'Semua Metode'
      );

      populateSelect(
        EL.filterSumberDana,
        uniqueSorted(APP_STATE.rawSirup.map(x => x.sumber_dana)),
        'Semua Sumber Dana'
      );

      populateSelect(
        EL.filterWaktu,
        uniqueSorted(APP_STATE.rawSirup.map(x => x.waktu_pemilihan)),
        'Semua Waktu'
      );
    }

    function populateSelect(selectEl, items, placeholder) {
      if (!selectEl) return;

      const currentValue = selectEl.value;
      selectEl.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;

      items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        selectEl.appendChild(option);
      });

      if (items.includes(currentValue)) {
        selectEl.value = currentValue;
      }
    }

    function applyFilters() {
      const selectedOpdFilter = EL.filterOpd?.value.trim() || '';
      const selectedMetode = EL.filterMetode?.value.trim().toLowerCase() || '';
      const selectedSumberDana = EL.filterSumberDana?.value.trim().toLowerCase() || '';
      const selectedWaktu = EL.filterWaktu?.value.trim().toLowerCase() || '';
      const keyword = EL.searchPaket?.value.trim().toLowerCase() || '';

      APP_STATE.rekapPage = 1;
      APP_STATE.detailPage = 1;

      APP_STATE.filteredRawGlobal = APP_STATE.rawSirup.filter(row => {
        const matchOpd = !selectedOpdFilter || normalizeOpdName(row.satuan_kerja) === normalizeOpdName(selectedOpdFilter);
        const matchMetode = !selectedMetode || row.metode_pemilihan.toLowerCase() === selectedMetode;
        const matchDana = !selectedSumberDana || row.sumber_dana.toLowerCase() === selectedSumberDana;
        const matchWaktu = !selectedWaktu || row.waktu_pemilihan.toLowerCase() === selectedWaktu;

        const searchTarget = [
          row.nama_paket,
          row.program,
          row.kegiatan,
          row.sub_kegiatan,
          row.kode_rup
        ].join(' ').toLowerCase();

        const matchKeyword = !keyword || searchTarget.includes(keyword);

        return matchOpd && matchMetode && matchDana && matchWaktu && matchKeyword;
      });

      const allowedOpdSet = new Set(
        APP_STATE.filteredRawGlobal.map(row => normalizeOpdName(row.satuan_kerja))
      );

      APP_STATE.filteredScore = APP_STATE.scoreSirup.filter(row => {
        const rowOpd = normalizeOpdName(row.satuan_kerja);

        if (selectedOpdFilter && rowOpd !== normalizeOpdName(selectedOpdFilter)) {
          return false;
        }

        if (selectedMetode || selectedSumberDana || selectedWaktu || keyword) {
          return allowedOpdSet.has(rowOpd);
        }

        return true;
      });

      renderStats(APP_STATE.filteredRawGlobal, APP_STATE.filteredScore);
      renderInsights(APP_STATE.filteredRawGlobal, APP_STATE.filteredScore);
      renderRekapTable(APP_STATE.filteredScore);

      if (APP_STATE.selectedOpd) {
        renderDetailForOpd(APP_STATE.selectedOpd);
      } else {
        renderEmptyDetail();
      }
    }

    function renderStats(filteredRaw, filteredScore) {
      const jumlahOpd = filteredScore.length;
      const jumlahPaket = filteredRaw.length;
      const totalRup = sum(filteredScore.map(x => x.total_rup_diumumkan));
      const totalKomitmen = sum(filteredScore.map(x => x.total_komitmen));
      const avgPersen = filteredScore.length
        ? sum(filteredScore.map(x => x.prosentase)) / filteredScore.length
        : 0;
      const avgItkp = filteredScore.length
        ? sum(filteredScore.map(x => x.nilai_itkp)) / filteredScore.length
        : 0;

      safeSetText(EL.statJumlahOpd, formatNumber(jumlahOpd));
      safeSetText(EL.statJumlahPaket, formatNumber(jumlahPaket));
      safeSetText(EL.statTotalRup, formatShortCurrency(totalRup));
      safeSetText(EL.statTotalKomitmen, formatShortCurrency(totalKomitmen));
      safeSetText(EL.statAvgPersen, `${formatPercent(avgPersen)}%`);
      safeSetText(EL.statAvgItkp, formatDecimal(avgItkp));

      safeSetText(EL.statJumlahOpdNote, 'Total satuan kerja pada data rekap');
      safeSetText(EL.statJumlahPaketNote, 'Total paket pada RAW SIRUP');
      safeSetText(EL.statTotalRupNote, formatCurrency(totalRup));
      safeSetText(EL.statTotalKomitmenNote, formatCurrency(totalKomitmen));
    }

    function renderInsights(filteredRaw, filteredScore) {
      if (!filteredScore.length) {
        safeSetText(EL.insightTopOpd, '-');
        safeSetText(EL.insightTopNote, 'Belum ada data');
        safeSetText(EL.insightLowOpd, '-');
        safeSetText(EL.insightLowNote, 'Belum ada data');
        safeSetText(EL.insightMetode, '-');
        safeSetText(EL.insightMetodeNote, 'Belum ada data');
        return;
      }

      const metodeCounts = {};
      filteredRaw.forEach(row => {
        const key = row.metode_pemilihan || '-';
        metodeCounts[key] = (metodeCounts[key] || 0) + 1;
      });

      const dominantEntry = Object.entries(metodeCounts).sort((a, b) => b[1] - a[1])[0];

      if (dominantEntry) {
        safeSetText(EL.insightMetode, dominantEntry[0]);
        safeSetText(EL.insightMetodeNote, `${formatNumber(dominantEntry[1])} paket`);
      } else {
        safeSetText(EL.insightMetode, '-');
        safeSetText(EL.insightMetodeNote, 'Belum ada data');
      }

      const uniqueItkp = [...new Set(filteredScore.map(x => Number(x.nilai_itkp || 0)))];
      const uniquePersen = [...new Set(filteredScore.map(x => Number(x.prosentase || 0)))];

      if (uniqueItkp.length === 1 && uniquePersen.length === 1) {
        safeSetText(EL.insightTopOpd, 'Semua OPD Setara');
        safeSetText(EL.insightTopNote, `Nilai ITKP ${formatDecimal(uniqueItkp[0])} | ${formatPercent(uniquePersen[0])}%`);

        safeSetText(EL.insightLowOpd, 'Semua OPD Setara');
        safeSetText(EL.insightLowNote, `Nilai ITKP ${formatDecimal(uniqueItkp[0])} | ${formatPercent(uniquePersen[0])}%`);
        return;
      }

      const sortedByItkp = [...filteredScore].sort((a, b) => {
        if (b.nilai_itkp !== a.nilai_itkp) return b.nilai_itkp - a.nilai_itkp;
        return b.prosentase - a.prosentase;
      });

      const top = sortedByItkp[0];
      const low = sortedByItkp[sortedByItkp.length - 1];

      safeSetText(EL.insightTopOpd, top.satuan_kerja);
      safeSetText(EL.insightTopNote, `Nilai ITKP ${formatDecimal(top.nilai_itkp)} | ${formatPercent(top.prosentase)}%`);

      safeSetText(EL.insightLowOpd, low.satuan_kerja);
      safeSetText(EL.insightLowNote, `Nilai ITKP ${formatDecimal(low.nilai_itkp)} | ${formatPercent(low.prosentase)}%`);
    }

    function renderRekapTable(rows) {
      const totalRows = rows.length;
      const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE_REKAP));

      if (APP_STATE.rekapPage > totalPages) {
        APP_STATE.rekapPage = totalPages;
      }

      const startIndex = (APP_STATE.rekapPage - 1) * PAGE_SIZE_REKAP;
      const endIndex = startIndex + PAGE_SIZE_REKAP;
      const pageRows = rows.slice(startIndex, endIndex);

      if (!EL.rekapTableBody) return;

      if (!pageRows.length) {
        EL.rekapTableBody.innerHTML = `
          <tr>
            <td colspan="9" class="cell-muted center-cell">
              Tidak ada data rekap yang sesuai filter.
            </td>
          </tr>
        `;

        renderPagination(
          EL.rekapPagination,
          EL.rekapPaginationInfo,
          totalRows,
          APP_STATE.rekapPage,
          PAGE_SIZE_REKAP,
          (page) => {
            APP_STATE.rekapPage = page;
            renderRekapTable(APP_STATE.filteredScore);
          }
        );

        return;
      }

      EL.rekapTableBody.innerHTML = pageRows.map((row, index) => `
        <tr>
          <td>${startIndex + index + 1}</td>
          <td class="cell-strong">${escapeHtml(row.satuan_kerja)}</td>
          <td>${formatTableNumber(row.penyedia_diumumkan)}</td>
          <td>${formatTableNumber(row.swakelola_diumumkan)}</td>
          <td>${formatTableNumber(row.total_rup_diumumkan)}</td>
          <td>${formatTableNumber(row.total_komitmen)}</td>
          <td>${renderPercentBadge(row.prosentase)}</td>
          <td>${renderItkpBadge(row.nilai_itkp)}</td>
          <td>
            <button type="button" class="action-btn" data-opd="${escapeAttr(row.satuan_kerja)}">
              Lihat Paket
            </button>
          </td>
        </tr>
      `).join('');

      EL.rekapTableBody.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          APP_STATE.selectedOpd = btn.getAttribute('data-opd') || '';
          APP_STATE.detailPage = 1;
          renderDetailForOpd(APP_STATE.selectedOpd);
        });
      });

      renderPagination(
        EL.rekapPagination,
        EL.rekapPaginationInfo,
        totalRows,
        APP_STATE.rekapPage,
        PAGE_SIZE_REKAP,
        (page) => {
          APP_STATE.rekapPage = page;
          renderRekapTable(APP_STATE.filteredScore);
        }
      );
    }

    function renderDetailForOpd(opdName) {
      const opdKey = normalizeOpdName(opdName);

      const rows = APP_STATE.filteredRawGlobal.filter(row =>
        normalizeOpdName(row.satuan_kerja) === opdKey
      );

      APP_STATE.selectedRawRows = rows;

      safeSetText(EL.detailTitle, `Detail Paket SIRUP - ${opdName}`);
      safeSetText(EL.detailSubtitle, `${formatNumber(rows.length)} paket ditampilkan sesuai filter aktif.`);

      const totalRows = rows.length;
      const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE_DETAIL));

      if (APP_STATE.detailPage > totalPages) {
        APP_STATE.detailPage = totalPages;
      }

      const startIndex = (APP_STATE.detailPage - 1) * PAGE_SIZE_DETAIL;
      const endIndex = startIndex + PAGE_SIZE_DETAIL;
      const pageRows = rows.slice(startIndex, endIndex);

      if (!EL.detailContent) return;

      if (!pageRows.length) {
        EL.detailContent.innerHTML = `
          <div class="empty-state">
            Tidak ada detail paket untuk OPD ini sesuai filter yang dipilih.
          </div>
        `;

        renderPagination(
          EL.detailPagination,
          EL.detailPaginationInfo,
          totalRows,
          APP_STATE.detailPage,
          PAGE_SIZE_DETAIL,
          (page) => {
            APP_STATE.detailPage = page;
            renderDetailForOpd(APP_STATE.selectedOpd);
          }
        );

        return;
      }

      EL.detailContent.innerHTML = `
        <div class="top-scroll-wrap" id="topScrollWrap">
          <div class="top-scroll-inner" id="topScrollInner"></div>
        </div>

        <div class="detail-content-wrap" id="detailTableWrap">
          <table id="detailTable">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode RUP</th>
                <th>Nama Paket</th>
                <th>Program</th>
                <th>Kegiatan</th>
                <th>Sub Kegiatan</th>
                <th>Pagu</th>
                <th>Cara Pengadaan</th>
                <th>Metode</th>
                <th>Jenis</th>
                <th>PDN</th>
                <th>Sumber Dana</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              ${pageRows.map((row, index) => `
                <tr>
                  <td>${startIndex + index + 1}</td>
                  <td>${escapeHtml(row.kode_rup)}</td>
                  <td class="cell-strong">${escapeHtml(row.nama_paket)}</td>
                  <td class="cell-muted">${escapeHtml(row.program)}</td>
                  <td class="cell-muted">${escapeHtml(row.kegiatan)}</td>
                  <td class="cell-muted">${escapeHtml(row.sub_kegiatan)}</td>
                  <td>${formatTableNumber(row.pagu_anggaran)}</td>
                  <td>${escapeHtml(row.cara_pengadaan)}</td>
                  <td>${renderBlueBadge(row.metode_pemilihan)}</td>
                  <td>${escapeHtml(row.jenis_pengadaan)}</td>
                  <td>${renderPdnBadge(row.pdn)}</td>
                  <td>${escapeHtml(row.sumber_dana)}</td>
                  <td>${escapeHtml(row.waktu_pemilihan)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      setupDetailHorizontalScroll();

      renderPagination(
        EL.detailPagination,
        EL.detailPaginationInfo,
        totalRows,
        APP_STATE.detailPage,
        PAGE_SIZE_DETAIL,
        (page) => {
          APP_STATE.detailPage = page;
          renderDetailForOpd(APP_STATE.selectedOpd);
        }
      );

      const detailSection = root.querySelector('.detail-panel');
      if (detailSection) {
        detailSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }

    function setupDetailHorizontalScroll() {
      const topScrollWrap = root.querySelector('#topScrollWrap');
      const topScrollInner = root.querySelector('#topScrollInner');
      const detailTableWrap = root.querySelector('#detailTableWrap');
      const detailTable = root.querySelector('#detailTable');

      if (!topScrollWrap || !topScrollInner || !detailTableWrap || !detailTable) {
        return;
      }

      const syncWidths = () => {
        topScrollInner.style.width = `${detailTable.scrollWidth}px`;
        topScrollWrap.scrollLeft = detailTableWrap.scrollLeft;
      };

      syncWidths();

      let syncingFromTop = false;
      let syncingFromBottom = false;

      topScrollWrap.addEventListener('scroll', () => {
        if (syncingFromBottom) return;
        syncingFromTop = true;
        detailTableWrap.scrollLeft = topScrollWrap.scrollLeft;
        syncingFromTop = false;
      });

      detailTableWrap.addEventListener('scroll', () => {
        if (syncingFromTop) return;
        syncingFromBottom = true;
        topScrollWrap.scrollLeft = detailTableWrap.scrollLeft;
        syncingFromBottom = false;
      });

      if (cleanupResizeHandler) {
        window.removeEventListener('resize', cleanupResizeHandler);
      }

      cleanupResizeHandler = syncWidths;
      window.addEventListener('resize', cleanupResizeHandler);
      window.requestAnimationFrame(syncWidths);
    }

    function renderEmptyDetail() {
      APP_STATE.selectedRawRows = [];
      APP_STATE.detailPage = 1;

      safeSetText(EL.detailTitle, 'Detail Paket SIRUP');
      safeSetText(EL.detailSubtitle, 'Pilih salah satu OPD pada tabel rekap untuk melihat detail paket.');

      if (EL.detailContent) {
        EL.detailContent.innerHTML = `
          <div class="empty-state">
            Detail paket belum ditampilkan.<br>
            Klik tombol <strong>Lihat Paket</strong> pada salah satu OPD.
          </div>
        `;
      }

      renderPagination(EL.detailPagination, EL.detailPaginationInfo, 0, 1, PAGE_SIZE_DETAIL, () => {});
    }

    function renderPagination(container, infoEl, totalRows, currentPage, pageSize, onPageChange) {
      if (!container || !infoEl) return;

      container.innerHTML = '';

      const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
      const start = totalRows === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
      const end = Math.min(currentPage * pageSize, totalRows);

      infoEl.textContent = `${start}-${end} dari ${totalRows} data • Page ${currentPage} / ${totalPages}`;

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'page-btn';
      prevBtn.textContent = 'Prev';
      prevBtn.disabled = currentPage === 1;
      prevBtn.onclick = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
      };
      container.appendChild(prevBtn);

      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) endPage = Math.min(totalPages, 5);
      if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);

      for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = String(i);
        btn.onclick = () => onPageChange(i);
        container.appendChild(btn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'page-btn';
      nextBtn.textContent = 'Next';
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.onclick = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
      };
      container.appendChild(nextBtn);
    }

    function renderPercentBadge(value) {
      const cls = value >= 100
        ? 'badge badge-green'
        : value >= 80
          ? 'badge badge-yellow'
          : 'badge badge-red';

      return `<span class="${cls}">${formatPercent(value)}%</span>`;
    }

    function renderItkpBadge(value) {
      const cls = value >= 10
        ? 'badge badge-green'
        : value >= 5
          ? 'badge badge-yellow'
          : 'badge badge-red';

      return `<span class="${cls}">${formatDecimal(value)}</span>`;
    }

    function renderBlueBadge(value) {
      return `<span class="badge badge-blue">${escapeHtml(value)}</span>`;
    }

    function renderPdnBadge(value) {
      const yes = String(value).trim().toLowerCase() === 'ya';

      return yes
        ? '<span class="badge badge-green">Ya</span>'
        : '<span class="badge badge-red">Tidak</span>';
    }

    function exportCsv(filename, rows) {
      if (!rows || !rows.length) {
        alert('Tidak ada data untuk diexport.');
        return;
      }

      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(','),
        ...rows.map(row =>
          headers.map(key => {
            const value = row[key] ?? '';
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);
    }

    function handleExportRekap() {
      exportCsv(
        'rekap_itkp_sirup.csv',
        APP_STATE.filteredScore.map(row => ({
          satuan_kerja: row.satuan_kerja,
          penyedia_diumumkan: row.penyedia_diumumkan,
          swakelola_diumumkan: row.swakelola_diumumkan,
          total_rup_diumumkan: row.total_rup_diumumkan,
          total_komitmen: row.total_komitmen,
          prosentase: row.prosentase,
          nilai_itkp: row.nilai_itkp
        }))
      );
    }

    function handleExportDetail() {
      const rows = APP_STATE.selectedOpd
        ? APP_STATE.selectedRawRows
        : APP_STATE.filteredRawGlobal;

      exportCsv('detail_paket_sirup.csv', rows);
    }

    function handleExportCurrentDetail() {
      if (!APP_STATE.selectedOpd || !APP_STATE.selectedRawRows.length) {
        alert('Pilih salah satu OPD terlebih dahulu.');
        return;
      }

      const safeName = APP_STATE.selectedOpd
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '_')
        .replace(/^_+|_+$/g, '');

      exportCsv(`detail_paket_${safeName}.csv`, APP_STATE.selectedRawRows);
    }

    function resetFilters() {
      if (EL.filterOpd) EL.filterOpd.value = '';
      if (EL.filterMetode) EL.filterMetode.value = '';
      if (EL.filterSumberDana) EL.filterSumberDana.value = '';
      if (EL.filterWaktu) EL.filterWaktu.value = '';
      if (EL.searchPaket) EL.searchPaket.value = '';

      APP_STATE.selectedOpd = '';
      APP_STATE.rekapPage = 1;
      APP_STATE.detailPage = 1;

      applyFilters();
    }

    function toNumber(value) {
      if (value == null || value === '') return 0;

      let str = String(value).trim();
      if (!str) return 0;

      str = str.replace(/[^\d.,-]/g, '').replace(/\s/g, '');

      const hasDot = str.includes('.');
      const hasComma = str.includes(',');

      if (hasDot && hasComma) {
        const lastDot = str.lastIndexOf('.');
        const lastComma = str.lastIndexOf(',');

        if (lastComma > lastDot) {
          str = str.replace(/\./g, '').replace(',', '.');
        } else {
          str = str.replace(/,/g, '');
        }
      } else if (hasComma) {
        const parts = str.split(',');

        if (parts.length > 2) {
          str = parts.join('');
        } else {
          const tail = parts[1] || '';

          if (tail.length === 3) {
            str = parts.join('');
          } else {
            str = parts[0] + '.' + tail;
          }
        }
      } else if (hasDot) {
        const parts = str.split('.');

        if (parts.length > 2) {
          str = parts.join('');
        } else {
          const tail = parts[1] || '';

          if (tail.length === 3) {
            str = parts.join('');
          }
        }
      }

      const parsed = Number(str);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    function sum(arr) {
      return arr.reduce((acc, val) => acc + Number(val || 0), 0);
    }

    function uniqueSorted(arr) {
      return [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'));
    }

    function formatNumber(value) {
      return Number(value || 0).toLocaleString('id-ID');
    }

    function formatTableNumber(value) {
      return Number(value || 0).toLocaleString('id-ID');
    }

    function formatCurrency(value) {
      return 'Rp' + Number(value || 0).toLocaleString('id-ID');
    }

    function formatShortCurrency(value) {
      const num = Number(value || 0);

      if (num >= 1_000_000_000_000) {
        return 'Rp' + (num / 1_000_000_000_000).toLocaleString('id-ID', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }) + ' T';
      }

      if (num >= 1_000_000_000) {
        return 'Rp' + (num / 1_000_000_000).toLocaleString('id-ID', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }) + ' M';
      }

      if (num >= 1_000_000) {
        return 'Rp' + (num / 1_000_000).toLocaleString('id-ID', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }) + ' Jt';
      }

      return 'Rp' + num.toLocaleString('id-ID');
    }

    function formatPercent(value) {
      return Number(value || 0).toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function formatDecimal(value) {
      return Number(value || 0).toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    }

    function normalizeOpdName(value) {
      return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '');
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function escapeAttr(value) {
      return escapeHtml(value);
    }

    async function initMonitoringSirup() {
      const startedAt = Date.now();

      try {
        EL = getElements();
        resetUiState();
        showError('');
        setLoading('Menghubungkan ke Google Sheet...', true);

        await nextPaint();

        const rawUrl = buildCsvUrl(SHEET_CONFIG.rawGid);
        const scoreUrl = buildCsvUrl(SHEET_CONFIG.scoreGid);

        setLoading('Mengambil data RAW_SIRUP dan SCORE_ITKP_SIRUP...', true);

        await nextPaint();

        const [rawResult, scoreResult] = await Promise.allSettled([
          fetchCsv(rawUrl, 2),
          fetchCsv(scoreUrl, 2)
        ]);

        if (APP_STATE.destroyed) return;

        let rawRows = [];
        let scoreRows = [];
        const errors = [];

        if (rawResult.status === 'fulfilled') {
          rawRows = csvToObjects(rawResult.value);
        } else {
          errors.push('RAW_SIRUP gagal dimuat');
          console.error('RAW_SIRUP error:', rawResult.reason);
        }

        if (scoreResult.status === 'fulfilled') {
          scoreRows = csvToObjects(scoreResult.value);
        } else {
          errors.push('SCORE_ITKP_SIRUP gagal dimuat');
          console.error('SCORE_ITKP_SIRUP error:', scoreResult.reason);
        }

        setLoading('Menyesuaikan header dan format data...', true);

        await nextPaint();

        APP_STATE.rawSirup = normalizeRawSirup(rawRows);
        APP_STATE.scoreSirup = normalizeScoreSirup(scoreRows);
        APP_STATE.rekapPage = 1;
        APP_STATE.detailPage = 1;

        if (APP_STATE.selectedOpd) {
          const stillExists = APP_STATE.scoreSirup.some(row =>
            normalizeOpdName(row.satuan_kerja) === normalizeOpdName(APP_STATE.selectedOpd)
          );

          if (!stillExists) {
            APP_STATE.selectedOpd = '';
            APP_STATE.selectedRawRows = [];
          }
        }

        setLoading('Menyusun filter dan tabel...', true);

        await nextPaint();

        buildFilterOptions();
        applyFilters();

        if (errors.length) {
          showError(errors.join(' + ') + '. Sebagian data berhasil dimuat, sebagian gagal.');
        }
      } catch (error) {
        console.error('initMonitoringSirup error:', error);
        showError(`Data gagal dimuat. Detail: ${error.message}`);
      } finally {
        const elapsed = Date.now() - startedAt;

        if (elapsed < MIN_LOADING_MS) {
          await wait(MIN_LOADING_MS - elapsed);
        }

        if (!APP_STATE.destroyed) {
          clearLoading();
        }
      }
    }

    function bindEvents() {
      safeBind(EL.filterOpd, 'change', applyFilters);
      safeBind(EL.filterMetode, 'change', applyFilters);
      safeBind(EL.filterSumberDana, 'change', applyFilters);
      safeBind(EL.filterWaktu, 'change', applyFilters);
      safeBind(EL.searchPaket, 'input', applyFilters);

      safeBind(EL.btnResetFilter, 'click', resetFilters);
      safeBind(EL.btnExportRekap, 'click', handleExportRekap);
      safeBind(EL.btnExportDetail, 'click', handleExportDetail);
      safeBind(EL.btnExportCurrentDetail, 'click', handleExportCurrentDetail);

      safeBind(EL.btnClearSelected, 'click', () => {
        APP_STATE.selectedOpd = '';
        APP_STATE.selectedRawRows = [];
        APP_STATE.detailPage = 1;
        renderEmptyDetail();
      });

      safeBind(EL.btnRefresh, 'click', () => {
        initMonitoringSirup();
      });
    }

    function destroyModule() {
      APP_STATE.destroyed = true;

      cleanupListeners.forEach(off => {
        try {
          off();
        } catch (err) {
          console.warn('Gagal melepas listener SiRUP:', err);
        }
      });

      cleanupListeners.length = 0;

      if (cleanupResizeHandler) {
        window.removeEventListener('resize', cleanupResizeHandler);
        cleanupResizeHandler = null;
      }

      clearLoading();
    }

    EL = getElements();
    bindEvents();
    initMonitoringSirup();

    return destroyModule;
  };
})();