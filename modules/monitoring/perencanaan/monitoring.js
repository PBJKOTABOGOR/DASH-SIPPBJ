(function () {
  const CONFIG = {
    SHEET_ID: '1ccDgtXNATxSYMZuDgd3polvRiTFNiFnjIGMP7b9qmrU',
    SHEETS: {
      perencanaan: 'D_PERENCANAAN',
      realisasi: 'D_REALISASI'
    }
  };

  window.__moduleInit = function ({ container }) {
    const root = container || document;

    let allRows = [];
    let filteredRows = [];
    let currentPage = 1;
    let sortWaktuAsc = true;
    let groupedRealByKode = {};
    let moduleDestroyed = false;

    const cleanupListeners = [];

    function qs(id) {
      return root.querySelector(`#${id}`) || document.getElementById(id);
    }

    function on(el, eventName, handler) {
      if (!el) return;
      el.addEventListener(eventName, handler);
      cleanupListeners.push(() => el.removeEventListener(eventName, handler));
    }

    function ensurePapaLoaded() {
      return new Promise((resolve, reject) => {
        if (window.Papa) {
          resolve();
          return;
        }

        const existing = document.querySelector('script[data-papa-parse="true"]');
        if (existing) {
          if (existing.dataset.loaded === 'true') {
            resolve();
            return;
          }

          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => reject(new Error('Gagal memuat PapaParse.')), { once: true });
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js';
        script.setAttribute('data-papa-parse', 'true');
        script.dataset.loaded = 'false';

        script.onload = () => {
          script.dataset.loaded = 'true';
          resolve();
        };

        script.onerror = () => reject(new Error('Gagal memuat PapaParse.'));
        document.body.appendChild(script);
      });
    }

    function csvUrlBySheetName(sheetId, sheetName) {
      return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    }

    function fetchSheet(sheetName) {
      return new Promise((resolve, reject) => {
        if (!window.Papa) {
          reject(new Error('Library PapaParse belum tersedia.'));
          return;
        }

        Papa.parse(csvUrlBySheetName(CONFIG.SHEET_ID, sheetName), {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            resolve(results.data || []);
          },
          error: function (err) {
            reject(err);
          }
        });
      });
    }

    function setText(id, val) {
      const el = qs(id);
      if (el) el.innerText = val || '';
    }

    function escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function normalizeHeader(text) {
      return String(text || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');
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

    function parseMoney(value) {
      if (value == null || value === '') return 0;
      if (typeof value === 'number') return value;

      let str = String(value).trim();
      if (!str || str === '-') return 0;

      str = str
        .replace(/rp/gi, '')
        .replace(/\s/g, '')
        .replace(/[^\d.,-]/g, '');

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
          const decimals = parts[1] || '';
          if (decimals.length === 3) {
            str = parts.join('');
          } else {
            str = parts[0] + '.' + decimals;
          }
        }
      } else if (hasDot) {
        const parts = str.split('.');
        if (parts.length > 2) {
          str = parts.join('');
        } else {
          const decimals = parts[1] || '';
          if (decimals.length === 3) {
            str = parts.join('');
          }
        }
      }

      const num = Number(str);
      return Number.isFinite(num) ? num : 0;
    }

    function formatMoney(num) {
      return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Number(num || 0));
    }

    function formatPercent(value) {
      return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(value || 0)) + '%';
    }

    function monthYearLabel(value) {
      const raw = String(value || '').trim();
      return raw || '-';
    }

    function getWaktuOrder(label) {
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

    function isBlankDash(v) {
      const s = String(v || '').trim();
      return s === '' || s === '-';
    }

    function containsAny(text, words) {
      const t = String(text || '').toLowerCase();
      return words.some(w => t.includes(w));
    }

    function buildStatusBadge(v) {
      if (v === 'Selesai') return `<span class="badge b-status-selesai">${escapeHtml(v)}</span>`;
      if (v === 'Selesai Proses Pemilihan') return `<span class="badge b-status-selesai-pemilihan">${escapeHtml(v)}</span>`;
      if (v === 'Berjalan') return `<span class="badge b-status-berjalan">${escapeHtml(v)}</span>`;
      return `<span class="badge b-status-belum">${escapeHtml(v)}</span>`;
    }

    function buildProgresBadge(v) {
      if (v === 'Sesuai Pagu') return `<span class="badge b-progres-sesuai">${escapeHtml(v)}</span>`;
      if (v === 'Melebihi Pagu') return `<span class="badge b-progres-over">${escapeHtml(v)}</span>`;
      return `<span class="badge b-progres-default">-</span>`;
    }

    function buildJadwalBadge(v) {
      if (v === 'Melewati') return `<span class="badge b-jadwal-melewati">${escapeHtml(v)}</span>`;
      if (v === 'Belum') return `<span class="badge b-jadwal-belum">${escapeHtml(v)}</span>`;
      return `<span class="badge b-jadwal-sesuai">${escapeHtml(v)}</span>`;
    }

    function warningCell(v) {
      if (v && v !== 'OK') return `<span class="warn-bad">${escapeHtml(v)}</span>`;
      return `<span class="warn-ok">OK</span>`;
    }

    function analyzePackageStatuses(rows, metodeRup) {
      const summary = {
        total: rows.length,
        selesai: 0,
        berjalan: 0,
        selesaiPemilihan: 0,
        adendum: 0,
        onProcess: 0,
        completed: 0,
        paymentOutsideSystem: 0,
        ringkasanPaket: '-',
        tindakLanjut: 'Tidak ada catatan tambahan.'
      };

      const isEPurchasing = String(metodeRup || '').toLowerCase().includes('e-purchasing');

      rows.forEach(item => {
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

      const parts = [];
      if (summary.selesai > 0) parts.push(summary.selesai + ' paket selesai');
      if (summary.selesaiPemilihan > 0) parts.push(summary.selesaiPemilihan + ' paket selesai proses pemilihan');
      if (summary.berjalan > 0) parts.push(summary.berjalan + ' paket masih berjalan');
      if (summary.adendum > 0) parts.push('sebagian paket ada adendum');

      summary.ringkasanPaket = parts.length ? parts.join(', ') : 'Belum ada paket realisasi';

      const tindakLanjut = [];
      if (summary.adendum > 0) {
        tindakLanjut.push('Perlu perhatian pada paket yang mengalami adendum agar pelaksanaan dan administrasi tetap tertib.');
      }
      if (summary.onProcess > 0) {
        tindakLanjut.push('Masih terdapat paket e-Purchasing berstatus on process.');
      }
      if (summary.selesaiPemilihan > 0) {
        tindakLanjut.push('Terdapat paket yang telah selesai proses pemilihan namun BAST belum terinput.');
      }

      summary.tindakLanjut = tindakLanjut.length ? tindakLanjut.join(' ') : 'Pelaksanaan paket secara umum berjalan baik.';
      return summary;
    }

    function groupRealisasi(realRows) {
      const grouped = {};

      realRows.forEach(r => {
        const kode = String(r.kode_rup || '').trim();
        if (!kode) return;

        if (!grouped[kode]) {
          grouped[kode] = {
            recall_paket: 0,
            total_realisasi: 0,
            rows: [],
            first_order: null
          };
        }

        const nilai = parseMoney(
          r.nilai_realisasi ||
          r['nilai_(rp)'] ||
          r.total_nilai ||
          r['total_nilai_(rp)'] ||
          0
        );

        const waktuOrder = getWaktuOrder(r.waktu_pemilihan || '');

        grouped[kode].recall_paket += 1;
        grouped[kode].total_realisasi += nilai;

        if (waktuOrder > 0) {
          if (!grouped[kode].first_order || waktuOrder < grouped[kode].first_order) {
            grouped[kode].first_order = waktuOrder;
          }
        }

        grouped[kode].rows.push({
          kode_paket: String(r.kode_paket || '').trim(),
          nama_paket: String(r.nama_paket || '').trim(),
          nama_penyedia: String(r.nama_penyedia || '').trim(),
          satuan_kerja: String(r.nama_satuan_kerja || '').trim(),
          metode: String(r.metode_pengadaan || '').trim(),
          status_paket: String(r.status_paket || '').trim(),
          sumber_transaksi: String(r.sumber_transaksi || '').trim(),
          bast: String(r.bast || '').trim(),
          nilai: nilai
        });
      });

      return grouped;
    }

    function buildMonitoringData(perencanaanRows, realisasiRows) {
      const planRows = normalizeRows(perencanaanRows);
      const realRows = normalizeRows(realisasiRows);

      groupedRealByKode = groupRealisasi(realRows);
      const currentOrder = getCurrentMonthOrder();

      return planRows
        .filter(r => String(r.kode_rup || '').trim())
        .map(r => {
          const kodeRup = String(r.kode_rup || '').trim();

          const pagu = parseMoney(
            r.nilai_pagu ||
            r.pagu ||
            r.total_pagu ||
            r.nilai ||
            r.pagu_rup ||
            r['nilai_pagu_(rp)'] ||
            0
          );

          const real = groupedRealByKode[kodeRup] || {
            recall_paket: 0,
            total_realisasi: 0,
            rows: [],
            first_order: null
          };

          const recallPaket = Number(real.recall_paket || 0);
          const totalRealisasi = Number(real.total_realisasi || 0);
          const persentase = pagu > 0 ? (totalRealisasi / pagu) * 100 : 0;
          const sisaPagu = pagu - totalRealisasi;

          const waktuPemilihanLabel = monthYearLabel(r.waktu_pemilihan || '-');
          const waktuPemilihanOrder = getWaktuOrder(waktuPemilihanLabel);

          const detailSummary = analyzePackageStatuses(real.rows || [], r.metode_pengadaan || '');

          let status = 'Belum Berjalan';
          if (recallPaket > 0) {
            if (detailSummary.berjalan > 0) {
              status = 'Berjalan';
            } else if (detailSummary.selesaiPemilihan > 0) {
              status = 'Selesai Proses Pemilihan';
            } else if (detailSummary.selesai > 0) {
              status = 'Selesai';
            }
          }

          let progres = '-';
          if (recallPaket > 0) {
            if (totalRealisasi > pagu) {
              progres = 'Melebihi Pagu';
            } else if (Math.abs(totalRealisasi - pagu) < 1 || persentase >= 99.99) {
              progres = 'Sesuai Pagu';
            }
          }

          let posisiJadwal = 'Belum';
          if (recallPaket > 0) {
            posisiJadwal = 'Sesuai';
          } else {
            posisiJadwal = waktuPemilihanOrder < currentOrder ? 'Melewati' : 'Belum';
          }

          let warning = 'OK';
          if (recallPaket === 0 && posisiJadwal === 'Melewati') {
            warning = 'Belum ada realisasi dan sudah melewati waktu pemilihan.';
          }

          const isEPurchasing = String(r.metode_pengadaan || '').toLowerCase().includes('e-purchasing');
          if (isEPurchasing && persentase >= 99.99 && detailSummary.onProcess > 0) {
            warning = 'Realisasi sudah 100%, namun masih ada paket on process. Perlu tindak lanjut penyelesaian di sistem.';
          }

          let ketJadwal = '-';
          if (recallPaket > 0 && real.first_order && waktuPemilihanOrder > 0) {
            if (real.first_order > waktuPemilihanOrder) {
              ketJadwal = 'Proses pemilihan tidak sesuai jadwal';
            } else if (real.first_order < waktuPemilihanOrder) {
              ketJadwal = 'Proses pemilihan lebih cepat dari jadwal';
            } else {
              ketJadwal = 'Proses pemilihan sesuai jadwal';
            }
          }

          let tindakLanjut = detailSummary.tindakLanjut || 'Tidak ada catatan tambahan.';
          if (ketJadwal !== '-') {
            tindakLanjut = ketJadwal + '. ' + tindakLanjut;
          }

          return {
            kode_rup: kodeRup,
            nama_paket: String(r.nama_paket || '').trim(),
            satuan_kerja: String(r.nama_satuan_kerja || '').trim(),
            pengadaan: String(r.cara_pengadaan || '').trim() || '-',
            jenis: String(r.jenis_pengadaan || '').trim() || '-',
            metode: String(r.metode_pengadaan || '').trim() || '-',
            waktu_pemilihan_label: waktuPemilihanLabel,
            waktu_pemilihan_order: waktuPemilihanOrder,
            pagu: pagu,
            total_realisasi: totalRealisasi,
            persentase: persentase,
            recall_paket: recallPaket,
            sisa_pagu: sisaPagu,
            status: status,
            progres: progres,
            posisi_jadwal: posisiJadwal,
            warning: warning,
            ket_jadwal: ketJadwal,
            tindak_lanjut: tindakLanjut,
            detail_summary: detailSummary
          };
        });
    }

    function fillSelect(id, items) {
      const el = qs(id);
      if (!el) return;

      const oldVal = el.value;
      const firstLabel = el.options[0] ? el.options[0].textContent : 'Semua';
      el.innerHTML = `<option value="">${escapeHtml(firstLabel)}</option>`;

      (items || []).forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        el.appendChild(opt);
      });

      const oldExists = [...el.options].some(opt => opt.value === oldVal);
      if (oldExists) el.value = oldVal;
    }

    function buildFilterOptions(rows) {
      fillSelect('filter_satker', [...new Set(rows.map(r => r.satuan_kerja).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id')));
      fillSelect('filter_pengadaan', [...new Set(rows.map(r => r.pengadaan).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id')));
      fillSelect('filter_metode', [...new Set(rows.map(r => r.metode).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id')));
      fillSelect('filter_jenis', [...new Set(rows.map(r => r.jenis).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id')));
      fillSelect('filter_waktu_pemilihan', [...new Set(rows.map(r => r.waktu_pemilihan_label).filter(Boolean))].sort((a, b) => getWaktuOrder(a) - getWaktuOrder(b)));
    }

    function renderSummary(rows) {
      const sum = {
        total: rows.length,
        belum: 0,
        berjalan: 0,
        selesai: 0,
        selesaiPemilihan: 0,
        over: 0
      };

      rows.forEach(r => {
        if (r.status === 'Belum Berjalan') sum.belum++;
        if (r.status === 'Berjalan') sum.berjalan++;
        if (r.status === 'Selesai') sum.selesai++;
        if (r.status === 'Selesai Proses Pemilihan') sum.selesaiPemilihan++;
        if (r.progres === 'Melebihi Pagu') sum.over++;
      });

      setText('sumTotalRup', String(sum.total));
      setText('sumBelum', String(sum.belum));
      setText('sumBerjalan', String(sum.berjalan));
      setText('sumSelesai', String(sum.selesai));
      setText('sumSelesaiPemilihan', String(sum.selesaiPemilihan));
      setText('sumOver', String(sum.over));
    }

    function renderRows(rows) {
      const tbody = qs('monitoringBody');
      if (!tbody) return;

      tbody.innerHTML = '';

      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="14">Data tidak ditemukan.</td></tr>';
        return;
      }

      rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="bold"><a class="rup-link" href="javascript:void(0)" onclick="openDetailModal('${escapeHtml(row.kode_rup)}')">${escapeHtml(row.kode_rup)}</a></td>
          <td>${escapeHtml(row.nama_paket)}</td>
          <td>${escapeHtml(row.satuan_kerja)}</td>
          <td>${escapeHtml(row.pengadaan)}</td>
          <td>${escapeHtml(row.metode)}</td>
          <td>${escapeHtml(row.waktu_pemilihan_label)}</td>
          <td class="right">${formatMoney(row.pagu)}</td>
          <td class="right">${formatMoney(row.total_realisasi)}</td>
          <td class="right">${formatPercent(row.persentase)}</td>
          <td>${buildStatusBadge(row.status)}</td>
          <td>${buildProgresBadge(row.progres)}</td>
          <td>${buildJadwalBadge(row.posisi_jadwal)}</td>
          <td>${warningCell(row.warning)}</td>
          <td><button class="detail-btn" onclick="openDetailModal('${escapeHtml(row.kode_rup)}')">Detail</button></td>
        `;
        tbody.appendChild(tr);
      });
    }

    function applySort(rows) {
      return [...rows].sort((a, b) => {
        if (sortWaktuAsc) {
          if (a.waktu_pemilihan_order !== b.waktu_pemilihan_order) return a.waktu_pemilihan_order - b.waktu_pemilihan_order;
        } else {
          if (a.waktu_pemilihan_order !== b.waktu_pemilihan_order) return b.waktu_pemilihan_order - a.waktu_pemilihan_order;
        }
        return String(a.satuan_kerja || '').localeCompare(String(b.satuan_kerja || ''), 'id');
      });
    }

    function renderPagination(totalRows) {
      const wrap = qs('pagination');
      const info = qs('paginationInfo');
      if (!wrap || !info) return;

      wrap.innerHTML = '';

      const size = 10;
      const totalPages = Math.max(1, Math.ceil(totalRows / size));

      const start = totalRows === 0 ? 0 : ((currentPage - 1) * size) + 1;
      const end = Math.min(currentPage * size, totalRows);

      info.innerText = `${start}-${end} dari ${totalRows} data • Page ${currentPage} / ${totalPages}`;

      const prevBtn = document.createElement('button');
      prevBtn.className = 'page-btn';
      prevBtn.textContent = 'Prev';
      prevBtn.disabled = currentPage === 1;
      prevBtn.onclick = function () {
        if (currentPage > 1) {
          currentPage--;
          updateTableOnly();
        }
      };
      wrap.appendChild(prevBtn);

      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) endPage = Math.min(totalPages, 5);
      if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);

      for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = function () {
          currentPage = i;
          updateTableOnly();
        };
        wrap.appendChild(btn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.className = 'page-btn';
      nextBtn.textContent = 'Next';
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.onclick = function () {
        if (currentPage < totalPages) {
          currentPage++;
          updateTableOnly();
        }
      };
      wrap.appendChild(nextBtn);
    }

    function updateTableOnly() {
      const size = 10;
      const totalPages = Math.max(1, Math.ceil(filteredRows.length / size));
      if (currentPage > totalPages) currentPage = totalPages;

      const startIndex = (currentPage - 1) * size;
      const endIndex = startIndex + size;
      const rowsToRender = filteredRows.slice(startIndex, endIndex);

      renderRows(rowsToRender);
      renderPagination(filteredRows.length);
      setText('monitoringStatus', `${rowsToRender.length} data tampil.`);
    }

    function toggleSortWaktu() {
      sortWaktuAsc = !sortWaktuAsc;
      setText('sortWaktuLabel', sortWaktuAsc ? 'Terlama → Terbaru' : 'Terbaru → Terlama');
      setText('sortWaktuArrow', sortWaktuAsc ? '↑' : '↓');
      runMonitoring();
    }

    function runMonitoring() {
      const satker = qs('filter_satker')?.value || '';
      const pengadaan = qs('filter_pengadaan')?.value || '';
      const metode = qs('filter_metode')?.value || '';
      const jenis = qs('filter_jenis')?.value || '';
      const status = qs('filter_status')?.value || '';
      const progres = qs('filter_progres')?.value || '';
      const posisiJadwal = qs('filter_posisi_jadwal')?.value || '';
      const waktuPemilihan = qs('filter_waktu_pemilihan')?.value || '';
      const filterWarning = qs('filter_warning')?.value || '';
      const keyword = (qs('filter_koderup')?.value || '').trim().toLowerCase();

      currentPage = 1;

      filteredRows = applySort(allRows).filter(row => {
        if (satker && row.satuan_kerja !== satker) return false;
        if (pengadaan && row.pengadaan !== pengadaan) return false;
        if (metode && row.metode !== metode) return false;
        if (jenis && row.jenis !== jenis) return false;
        if (status && row.status !== status) return false;
        if (progres && row.progres !== progres) return false;
        if (posisiJadwal && row.posisi_jadwal !== posisiJadwal) return false;
        if (waktuPemilihan && row.waktu_pemilihan_label !== waktuPemilihan) return false;

        if (filterWarning === 'OK' && row.warning !== 'OK') return false;
        if (filterWarning === 'PERLU' && row.warning === 'OK') return false;

        if (keyword) {
          const haystack = [
            row.kode_rup,
            row.nama_paket,
            row.satuan_kerja,
            row.pengadaan,
            row.metode
          ].join(' ').toLowerCase();

          if (!haystack.includes(keyword)) return false;
        }

        return true;
      });

      renderSummary(filteredRows);
      updateTableOnly();
    }

    function resetMonitoring() {
      const ids = [
        'filter_satker',
        'filter_pengadaan',
        'filter_metode',
        'filter_jenis',
        'filter_status',
        'filter_progres',
        'filter_posisi_jadwal',
        'filter_waktu_pemilihan',
        'filter_warning',
        'filter_koderup'
      ];

      ids.forEach(id => {
        const el = qs(id);
        if (el) el.value = '';
      });

      runMonitoring();
    }

    function openDetailModal(kodeRup) {
      const row = allRows.find(r => String(r.kode_rup) === String(kodeRup));
      if (!row) return;

      const detailRows = (groupedRealByKode[kodeRup] && groupedRealByKode[kodeRup].rows) ? groupedRealByKode[kodeRup].rows : [];
      const ds = row.detail_summary || {};

      setText('detailTitle', 'Detail Kode RUP ' + row.kode_rup);
      setText('detailKodeRup', row.kode_rup);
      setText('detailNamaPaket', row.nama_paket);
      setText('detailSatker', row.satuan_kerja);
      setText('detailPengadaan', row.pengadaan);
      setText('detailMetode', row.metode);
      setText('detailJenis', row.jenis);
      setText('detailWaktu', row.waktu_pemilihan_label);
      setText('detailStatus', row.status);
      setText('detailProgres', row.progres);
      setText('detailPosisiJadwal', row.posisi_jadwal);
      setText('detailPaguVsRealisasi', `${formatMoney(row.pagu)} / ${formatMoney(row.total_realisasi)} (${formatPercent(row.persentase)})`);
      setText('detailRecall', String(row.recall_paket));
      setText('detailSisaPagu', formatMoney(row.sisa_pagu));
      setText('detailRingkasanPaket', ds.ringkasanPaket || 'Belum ada paket realisasi');
      setText('detailWarning', row.warning || 'OK');
      setText('detailTindakLanjut', row.tindak_lanjut || 'Tidak ada catatan tambahan.');

      const tbody = qs('detailBody');
      const empty = qs('detailEmpty');

      if (!tbody || !empty) return;

      tbody.innerHTML = '';

      if (!detailRows.length) {
        empty.style.display = 'block';
        tbody.innerHTML = '<tr><td colspan="9">Belum ada data realisasi.</td></tr>';
      } else {
        empty.style.display = 'none';

        detailRows.forEach(item => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${escapeHtml(item.kode_paket)}</td>
            <td>${escapeHtml(item.nama_paket)}</td>
            <td>${escapeHtml(item.nama_penyedia)}</td>
            <td>${escapeHtml(item.satuan_kerja)}</td>
            <td>${escapeHtml(item.metode)}</td>
            <td>${escapeHtml(item.status_paket)}</td>
            <td>${escapeHtml(item.sumber_transaksi)}</td>
            <td>${escapeHtml(item.bast || '-')}</td>
            <td class="right">${formatMoney(item.nilai)}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      const modal = qs('detailModal');
      if (modal) modal.classList.add('show');
    }

    function closeDetailModal() {
      const modal = qs('detailModal');
      if (modal) modal.classList.remove('show');
    }

    function handleModalBackdrop(event) {
      if (event.target && event.target.id === 'detailModal') {
        closeDetailModal();
      }
    }

    async function loadMonitoringData() {
      try {
        setText('monitoringStatus', 'Memuat data dari Google Sheet...');

        const [perencanaanRows, realisasiRows] = await Promise.all([
          fetchSheet(CONFIG.SHEETS.perencanaan),
          fetchSheet(CONFIG.SHEETS.realisasi)
        ]);

        if (moduleDestroyed) return;

        allRows = buildMonitoringData(perencanaanRows, realisasiRows);
        buildFilterOptions(allRows);

        setText('sortWaktuLabel', sortWaktuAsc ? 'Terlama → Terbaru' : 'Terbaru → Terlama');
        setText('sortWaktuArrow', sortWaktuAsc ? '↑' : '↓');

        runMonitoring();
      } catch (err) {
        console.error(err);
        setText('monitoringStatus', 'Gagal memuat data monitoring: ' + (err.message || String(err)));
      }
    }

    function bindMonitoringEvents() {
      on(qs('btnSortWaktu'), 'click', toggleSortWaktu);
      on(qs('btnRunMonitoring'), 'click', runMonitoring);
      on(qs('btnResetMonitoring'), 'click', resetMonitoring);
      on(qs('detailModal'), 'click', handleModalBackdrop);
    }

    window.runMonitoring = runMonitoring;
    window.toggleSortWaktu = toggleSortWaktu;
    window.resetMonitoring = resetMonitoring;
    window.openDetailModal = openDetailModal;
    window.closeDetailModal = closeDetailModal;
    window.handleModalBackdrop = handleModalBackdrop;

    bindMonitoringEvents();

    ensurePapaLoaded()
      .then(() => {
        if (!moduleDestroyed) {
          loadMonitoringData();
        }
      })
      .catch((err) => {
        console.error(err);
        setText('monitoringStatus', 'Gagal memuat library PapaParse: ' + (err.message || String(err)));
      });

    return function destroy() {
      moduleDestroyed = true;

      cleanupListeners.forEach(off => {
        try {
          off();
        } catch (err) {
          console.warn('Gagal melepas listener monitoring:', err);
        }
      });

      cleanupListeners.length = 0;

      if (window.runMonitoring === runMonitoring) window.runMonitoring = undefined;
      if (window.toggleSortWaktu === toggleSortWaktu) window.toggleSortWaktu = undefined;
      if (window.resetMonitoring === resetMonitoring) window.resetMonitoring = undefined;
      if (window.openDetailModal === openDetailModal) window.openDetailModal = undefined;
      if (window.closeDetailModal === closeDetailModal) window.closeDetailModal = undefined;
      if (window.handleModalBackdrop === handleModalBackdrop) window.handleModalBackdrop = undefined;
    };
  };
})();