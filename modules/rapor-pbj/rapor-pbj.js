(function () {
  const CONFIG = {
    SHEET_ID: '1ccDgtXNATxSYMZuDgd3polvRiTFNiFnjIGMP7b9qmrU',
    SHEETS: {
      index: 'INDEX_RAPOT',
      sirup: 'SIRUP_STRUKTUR_ANGGARAN',
      perencanaan: 'PERENCANAAN',
      realisasi: 'REALISASI',
      pelaku: 'PELAKU',
      itkp: 'ITKP',
      analisis: 'ANALISIS_MANUAL',
      aiReport: 'AI_REPORT'
    }
  };

  const CURRENT_YEAR = new Date().getFullYear();
  const MONTH_MAP = {
    '1':'Januari','2':'Februari','3':'Maret','4':'April','5':'Mei','6':'Juni',
    '7':'Juli','8':'Agustus','9':'September','10':'Oktober','11':'November','12':'Desember'
  };
  const MONTH_MAP_UPPER = Object.fromEntries(Object.entries(MONTH_MAP).map(([k, v]) => [k, v.toUpperCase()]));

  let shadow = null;
  let host = null;
  let destroyed = false;
  let allRows = [];
  let filteredRows = [];
  let currentPage = 1;
  let aiVoiceText = '';
  let currentUtterance = null;
  let voiceProgressTimer = null;
  let voiceDurationEstimateMs = 0;
  let voiceElapsedBeforePauseMs = 0;
  let voiceStartedAtMs = 0;

  const STYLE = `
    :host{display:block;color:#122033;font-family:"Inter","Segoe UI",Arial,sans-serif;}
    *{box-sizing:border-box}
    a{color:#123a72}
    .rp-wrap{
  width:100%;
  max-width:none;
  margin:0;
  padding:0 0 22px;
  color:#122033;
}
    .rp-hero{position:relative;overflow:hidden;isolation:isolate;background:radial-gradient(circle at top right,rgba(34,211,238,.22),transparent 28%),radial-gradient(circle at left top,rgba(255,255,255,.10),transparent 22%),linear-gradient(135deg,#102544 0%,#123a72 48%,#245a9b 78%,#0f766e 100%);color:#fff;border-radius:30px;padding:28px 28px 30px;box-shadow:0 22px 58px rgba(18,58,114,.20);margin-bottom:18px;border:1px solid rgba(255,255,255,.20)}
    .rp-hero::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(135deg,rgba(0,0,0,.88),transparent 86%);opacity:.8}
    .rp-hero::after{content:"";position:absolute;top:-70%;left:-42%;width:34%;height:240%;z-index:0;pointer-events:none;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.06) 18%,rgba(255,255,255,.34) 48%,rgba(34,211,238,.16) 62%,transparent 100%);transform:rotate(24deg) translateX(-120%);animation:rpHeroReflex 5.2s ease-in-out infinite}
    @keyframes rpHeroReflex{0%,36%{transform:rotate(24deg) translateX(-145%);opacity:0}48%{opacity:.95}68%,100%{transform:rotate(24deg) translateX(460%);opacity:0}}
    .rp-hero>*{position:relative;z-index:1}.rp-hero h1{margin:14px 0 8px;font-size:42px;line-height:1.05;font-weight:950;letter-spacing:-.04em}.rp-hero p{margin:0;color:rgba(255,255,255,.88);line-height:1.75;max-width:920px;font-size:15px}
    .rp-kicker{display:inline-flex;align-items:center;min-height:30px;padding:0 12px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);color:#dbeafe;font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
    .rp-summary-strip{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:22px}.rp-sum-card{position:relative;overflow:hidden;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.18);border-radius:18px;padding:14px}.rp-sum-card::before{content:"";position:absolute;left:14px;right:14px;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),rgba(34,211,238,.35),transparent)}.rp-sum-label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;color:rgba(255,255,255,.78);margin-bottom:8px}.rp-sum-value{font-size:28px;font-weight:950;color:#fff;line-height:1.1}
    .rp-card{position:relative;overflow:hidden;background:rgba(255,255,255,.88);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.6);border-radius:28px;box-shadow:0 18px 40px rgba(15,23,42,.10);padding:18px;margin-bottom:16px}.rp-card::before{content:"";position:absolute;left:0;top:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(37,99,235,.45),rgba(34,211,238,.45),transparent);z-index:2}.rp-card h2{margin:0 0 14px;font-size:22px;font-weight:900;color:#102544}.rp-sub{font-size:13px;color:#64748b;line-height:1.6;margin-top:-6px;margin-bottom:12px}.rp-grid{display:grid;gap:12px}.rp-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.rp-grid-5{grid-template-columns:repeat(5,minmax(0,1fr))}
    label{display:block;font-size:12px;font-weight:800;margin-bottom:7px;color:#334155;text-transform:uppercase;letter-spacing:.04em}input,select,button{width:100%;padding:12px 14px;border-radius:14px;border:1px solid #dbe5f0;font-size:14px;font-family:inherit;background:#fff}.rp-btn,button{border:none;cursor:pointer;font-weight:900;background:linear-gradient(135deg,#123a72 0%,#245a9b 100%);color:#fff;box-shadow:0 12px 22px rgba(18,58,114,.18);transition:.18s ease}.rp-btn:hover,button:hover{transform:translateY(-1px)}button.secondary,.rp-btn.secondary{background:linear-gradient(180deg,#fff 0%,#edf3fb 100%);color:#18324f;border:1px solid #dbe5f0;box-shadow:0 6px 18px rgba(15,23,42,.06)}.rp-inline-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.rp-inline-actions button{width:auto}.rp-status{margin-top:10px;font-weight:800;color:#153b68;line-height:1.6;white-space:pre-wrap}
    .rp-table-wrap{overflow:auto;border:1px solid #dbe5f0;border-radius:18px;background:#fff;box-shadow:0 6px 18px rgba(15,23,42,.06)}table{width:100%;border-collapse:collapse;min-width:1000px;font-size:14px}th,td{padding:11px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;text-align:left;line-height:1.5}th{background:linear-gradient(135deg,#123a72 0%,#245a9b 100%);color:#fff;font-size:13px;font-weight:800}.rp-badge-status{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;border-radius:999px;font-size:12px;font-weight:900;border:1px solid transparent;white-space:nowrap}.st-draft{background:#fff8ea;color:#9a6100;border-color:#f2cf83}.st-menunggu{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe}.st-revisi{background:#fff1f2;color:#b91c1c;border-color:#fecdd3}.st-ok{background:#ecfdf5;color:#0f766e;border-color:#bbf7d0}.st-belum{background:#fff1f2;color:#b91c1c;border-color:#fecdd3}.st-default{background:#f8fafc;color:#475569;border-color:#e2e8f0}.rp-btn-link{display:inline-flex;align-items:center;justify-content:center;width:auto;min-width:68px;padding:9px 12px;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;background:linear-gradient(180deg,#fff 0%,#edf3fb 100%);color:#16324f;border:1px solid #dbe5f0;text-decoration:none;box-shadow:0 6px 18px rgba(15,23,42,.06)}.rp-btn-link.disabled{opacity:.55;cursor:not-allowed;pointer-events:none;filter:grayscale(.1)}
    .rp-pagination-wrap{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px}.rp-pagination-info{font-size:13px;color:#64748b;font-weight:700}.rp-pagination{display:flex;gap:8px;flex-wrap:wrap}.rp-page-btn{min-width:42px;width:auto;padding:10px 12px;border-radius:12px;border:1px solid #dbe5f0;background:#fff;color:#18324f;font-weight:800;cursor:pointer;box-shadow:0 6px 18px rgba(15,23,42,.06)}.rp-page-btn.active{background:linear-gradient(135deg,#123a72 0%,#245a9b 100%);color:#fff;border-color:transparent}.rp-page-btn:disabled{opacity:.5;cursor:not-allowed}
    .rp-toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}
    .rp-report-wrap{
  width:100%;
  max-width:none;
  margin:0;
}
.rp-report-page{background:#fff;border-radius:18px;margin-bottom:24px;overflow:hidden;box-shadow:0 4px 18px rgba(15,23,42,.08);page-break-after:always}.rp-report-page:last-child{page-break-after:auto}.rp-page-head{background:linear-gradient(135deg,#0f4c81,#1f6aa5);color:#fff;padding:28px 32px}.rp-page-head h1,.rp-page-head h2{margin:0}.rp-cover{min-height:420px;display:flex;flex-direction:column;justify-content:center;text-align:center}.rp-main-title{font-size:40px;font-weight:800;line-height:1.2;margin-bottom:18px;text-transform:uppercase}.rp-sub-title{font-size:26px;font-weight:700;line-height:1.4;text-transform:uppercase}.rp-period{margin-top:22px;font-size:22px;font-weight:700;text-transform:uppercase}.rp-page-body{padding:24px 28px 28px}.rp-meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:18px}.rp-meta-box,.rp-summary-box,.rp-link-box,.rp-note-box{background:#f8fafc;border:1px solid #dbe4ee;border-radius:14px;padding:14px 16px}.rp-meta-label,.rp-summary-box .label{font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:6px}.rp-meta-value{font-size:18px;font-weight:700;word-break:break-word}.rp-note-line{font-size:14px;color:#475569;margin-top:10px}.rp-report-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:18px}.rp-summary-box .value{font-size:18px;font-weight:800;color:#0f172a}.center{text-align:center}.right{text-align:right}.bold{font-weight:700}.rp-img-box{background:#f8fafc;border:1px solid #dbe4ee;border-radius:14px;padding:14px;min-height:120px}.rp-img-box img{display:block;max-width:100%;max-height:520px;object-fit:contain;margin:0 auto;border-radius:10px;background:#fff}.rp-link-box,.rp-note-box{word-break:break-word;white-space:pre-wrap;line-height:1.7}.rp-bullets{margin:0;padding-left:20px;line-height:1.8;font-size:15px}.rp-muted{color:#64748b;font-size:13px}.rp-narasi-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.rp-head-toggle-btn{border:none;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;background:rgba(255,255,255,.18);color:#fff;backdrop-filter:blur(4px);width:auto}.rp-voice-panel{background:#f8fbff;border:1px solid #dbeafe;border-radius:14px;padding:14px;margin-top:14px}.rp-voice-meta{display:flex;justify-content:space-between;align-items:center;gap:12px;font-weight:700;color:#0f172a;margin-bottom:10px}.rp-voice-progress{width:100%;height:10px;background:#dbe4ee;border-radius:999px;overflow:hidden}.rp-voice-progress-fill{width:0%;height:100%;border-radius:999px;background:linear-gradient(90deg,#0f4c81,#2f7cc2);transition:width .12s linear}.rp-hidden{display:none!important}
    @media(max-width:1100px){.rp-summary-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.rp-grid-5{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:900px){.rp-hero{padding:24px 20px}.rp-hero h1{font-size:34px}.rp-summary-strip,.rp-grid-5,.rp-grid-2,.rp-meta-grid,.rp-report-summary{grid-template-columns:1fr}.rp-inline-actions{flex-direction:column}.rp-inline-actions button{width:100%}.rp-main-title{font-size:30px}.rp-sub-title{font-size:21px}.rp-period{font-size:18px}}
  `;

  function $(selector) { return shadow ? shadow.querySelector(selector) : null; }
  function $all(selector) { return shadow ? Array.from(shadow.querySelectorAll(selector)) : []; }
  function setText(selector, val) { const el = typeof selector === 'string' ? $(selector) : selector; if (el) el.innerText = (val === undefined || val === null || val === '') ? '-' : val; }
  function setHtml(selector, html) { const el = typeof selector === 'string' ? $(selector) : selector; if (el) el.innerHTML = html || '-'; }
  function esc(v) { return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

  function csvUrlBySheetName(sheetId, sheetName) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }

  function ensurePapa() {
    return new Promise((resolve, reject) => {
      if (window.Papa && typeof window.Papa.parse === 'function') { resolve(); return; }
      const existing = document.querySelector('script[data-rapor-papa="true"]');
      if (existing) { existing.addEventListener('load', resolve, { once:true }); existing.addEventListener('error', reject, { once:true }); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js';
      script.dataset.raporPapa = 'true';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Gagal memuat PapaParse'));
      document.body.appendChild(script);
    });
  }

  function fetchSheet(sheetName) {
    return ensurePapa().then(() => new Promise((resolve, reject) => {
      window.Papa.parse(csvUrlBySheetName(CONFIG.SHEET_ID, sheetName), {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data || []),
        error: reject
      });
    }));
  }

  function normalizeStatusKey(status) {
    const raw = String(status || '').trim().toLowerCase();
    if (raw === 'draft') return 'draft';
    if (raw === 'menunggu') return 'menunggu';
    if (raw === 'revisi') return 'revisi';
    if (raw === 'ok') return 'ok';
    if (raw === 'belum') return 'belum';
    return 'default';
  }

  function renderStatusBadge(status) {
    const raw = String(status || '').trim();
    return `<span class="rp-badge-status st-${normalizeStatusKey(raw)}">${esc(raw || '-')}</span>`;
  }

  function canOpenDashboardReport(statusQc) {
    return String(statusQc || '').trim().toUpperCase() === 'OK';
  }

  function renderDashboardActionButton(idRapot, statusQc) {
    if (!canOpenDashboardReport(statusQc)) {
      return `<span class="rp-btn-link disabled" title="Report hanya bisa dibuka jika status QC sudah OK">Lihat</span>`;
    }
    return `<button class="rp-btn-link" type="button" data-report-id="${esc(idRapot || '')}">Lihat</button>`;
  }

  function mapCsvRow(row) {
    return {
      id_rapot: String(row.id_rapot || '').trim(),
      tahun: String(row.tahun || '').trim(),
      bulan: String(row.bulan || '').trim(),
      kode_opd: String(row.kode_opd || '').trim(),
      nama_opd: String(row.nama_opd || '').trim(),
      input_by: String(row.input_by || '').trim(),
      created_at: String(row.created_at || '').trim(),
      updated_at: String(row.updated_at || '').trim(),
      status_qc: String(row.status_qc || '').trim(),
      status_pimpinan: String(row.status_pimpinan || '').trim(),
      qc_by: String(row.qc_by || '').trim(),
      qc_at: String(row.qc_at || '').trim(),
      qc_notes: String(row.qc_notes || '').trim()
    };
  }

  function fillSelect(selector, items) {
    const el = $(selector);
    if (!el) return;
    const oldVal = el.value;
    const firstLabel = el.options[0] ? el.options[0].textContent : 'Semua';
    el.innerHTML = `<option value="">${esc(firstLabel)}</option>`;
    (items || []).forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      el.appendChild(opt);
    });
    if (Array.from(el.options).some((opt) => opt.value === oldVal)) el.value = oldVal;
  }

  function buildFilterOptions(rows) {
    const years = [...new Set(rows.map((r) => String(r.tahun || '')).filter(Boolean))].sort((a,b) => Number(b) - Number(a));
    const opds = [...new Set(rows.map((r) => String(r.nama_opd || '')).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'id'));
    fillSelect('#filter_tahun', years);
    fillSelect('#filter_opd', opds);
    const yearNow = String(CURRENT_YEAR);
    const yearExists = Array.from($('#filter_tahun').options).some((opt) => opt.value === yearNow);
    if (yearExists) $('#filter_tahun').value = yearNow;
  }

  function getFilterPayload() {
    return {
      tahun: $('#filter_tahun')?.value || '',
      bulan: $('#filter_bulan')?.value || '',
      nama_opd: $('#filter_opd')?.value || '',
      status_qc: $('#filter_status_qc')?.value || '',
      keyword: String($('#filter_keyword')?.value || '').trim().toLowerCase(),
      page_size: $('#filter_page_size')?.value || '10'
    };
  }

  function renderRows(rows) {
    const tbody = $('#dashboardBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!rows || !rows.length) {
      tbody.innerHTML = '<tr><td colspan="7">Data tidak ditemukan.</td></tr>';
      return;
    }
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(row.id_rapot || '-')}</td>
        <td>${esc((MONTH_MAP[String(row.bulan)] || row.bulan || '-') + ' ' + (row.tahun || '-'))}</td>
        <td>${esc(row.nama_opd || '-')}</td>
        <td>${esc(row.input_by || '-')}</td>
        <td>${renderStatusBadge(row.status_qc || '-')}</td>
        <td>${esc(row.updated_at || '-')}</td>
        <td>${renderDashboardActionButton(row.id_rapot, row.status_qc)}</td>`;
      tbody.appendChild(tr);
    });
  }

  function setSummary(rows) {
    const summary = { draft:0, menunggu:0, revisi:0, ok:0, total:rows.length };
    rows.forEach((row) => {
      const key = normalizeStatusKey(row.status_qc);
      if (key === 'draft') summary.draft++;
      else if (key === 'menunggu') summary.menunggu++;
      else if (key === 'revisi') summary.revisi++;
      else if (key === 'ok') summary.ok++;
    });
    setText('#sumDraft', summary.draft);
    setText('#sumMenunggu', summary.menunggu);
    setText('#sumRevisi', summary.revisi);
    setText('#sumOk', summary.ok);
    setText('#sumTotal', summary.total);
  }

  function renderPagination(totalRows, pageSize) {
    const wrap = $('#pagination');
    const info = $('#paginationInfo');
    if (!wrap || !info) return;
    wrap.innerHTML = '';
    if (pageSize === 'all') { info.innerText = `${totalRows} data tampil`; return; }
    const size = Number(pageSize || 10);
    const totalPages = Math.max(1, Math.ceil(totalRows / size));
    const start = totalRows === 0 ? 0 : ((currentPage - 1) * size) + 1;
    const end = Math.min(currentPage * size, totalRows);
    info.innerText = `${start}-${end} dari ${totalRows} data • Page ${currentPage} / ${totalPages}`;

    const makeBtn = (text, disabled, active, fn) => {
      const btn = document.createElement('button');
      btn.className = 'rp-page-btn' + (active ? ' active' : '');
      btn.textContent = text;
      btn.disabled = disabled;
      btn.addEventListener('click', fn);
      wrap.appendChild(btn);
    };
    makeBtn('Prev', currentPage === 1, false, () => { if (currentPage > 1) { currentPage--; updateTableOnly(); } });
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 3) endPage = Math.min(totalPages, 5);
    if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);
    for (let i = startPage; i <= endPage; i++) makeBtn(String(i), false, i === currentPage, () => { currentPage = i; updateTableOnly(); });
    makeBtn('Next', currentPage === totalPages, false, () => { if (currentPage < totalPages) { currentPage++; updateTableOnly(); } });
  }

  function updateTableOnly() {
    const pageSize = $('#filter_page_size')?.value || '10';
    let rowsToRender = filteredRows;
    if (pageSize !== 'all') {
      const size = Number(pageSize || 10);
      const totalPages = Math.max(1, Math.ceil(filteredRows.length / size));
      if (currentPage > totalPages) currentPage = totalPages;
      rowsToRender = filteredRows.slice((currentPage - 1) * size, ((currentPage - 1) * size) + size);
    }
    renderRows(rowsToRender);
    renderPagination(filteredRows.length, pageSize);
    setText('#dashboardStatus', `${rowsToRender.length} data tampil.`);
    bindReportButtons();
  }

  function runDashboard() {
    const payload = getFilterPayload();
    currentPage = 1;
    filteredRows = allRows.filter((row) => {
      if (payload.tahun && String(row.tahun) !== String(payload.tahun)) return false;
      if (payload.bulan && String(row.bulan) !== String(payload.bulan)) return false;
      if (payload.nama_opd && String(row.nama_opd) !== String(payload.nama_opd)) return false;
      if (payload.status_qc && String(row.status_qc) !== String(payload.status_qc)) return false;
      if (payload.keyword) {
        const haystack = [row.id_rapot,row.nama_opd,row.input_by,row.tahun,row.bulan].join(' ').toLowerCase();
        if (!haystack.includes(payload.keyword)) return false;
      }
      return true;
    });
    filteredRows.sort((a,b) => {
      const y = Number(b.tahun || 0) - Number(a.tahun || 0); if (y !== 0) return y;
      const m = Number(b.bulan || 0) - Number(a.bulan || 0); if (m !== 0) return m;
      return String(a.nama_opd || '').localeCompare(String(b.nama_opd || ''), 'id');
    });
    setSummary(filteredRows);
    updateTableOnly();
  }

  function resetDashboard() {
    if ($('#filter_bulan')) $('#filter_bulan').value = '';
    if ($('#filter_opd')) $('#filter_opd').value = '';
    if ($('#filter_status_qc')) $('#filter_status_qc').value = '';
    if ($('#filter_keyword')) $('#filter_keyword').value = '';
    if ($('#filter_page_size')) $('#filter_page_size').value = '10';
    const yearNow = String(CURRENT_YEAR);
    const yearExists = Array.from($('#filter_tahun')?.options || []).some((opt) => opt.value === yearNow);
    if ($('#filter_tahun')) $('#filter_tahun').value = yearExists ? yearNow : '';
    runDashboard();
  }

  function renderDashboardShell() {
    shadow.innerHTML = `<style>${STYLE}</style>
      <div class="rp-wrap">
        <div class="rp-hero">
          <div class="rp-kicker">TRAXPBJ · Rapor PBJ</div>
          <h1>Dashboard Rapor PBJ</h1>
          <p>Dashboard monitoring untuk melihat perkembangan Rapor PBJ perangkat daerah. Halaman ini sudah menjadi module native, bukan iframe.</p>
          <div class="rp-summary-strip">
            <div class="rp-sum-card"><div class="rp-sum-label">Draft</div><div class="rp-sum-value" id="sumDraft">0</div></div>
            <div class="rp-sum-card"><div class="rp-sum-label">Menunggu</div><div class="rp-sum-value" id="sumMenunggu">0</div></div>
            <div class="rp-sum-card"><div class="rp-sum-label">Revisi</div><div class="rp-sum-value" id="sumRevisi">0</div></div>
            <div class="rp-sum-card"><div class="rp-sum-label">OK</div><div class="rp-sum-value" id="sumOk">0</div></div>
            <div class="rp-sum-card"><div class="rp-sum-label">Total</div><div class="rp-sum-value" id="sumTotal">0</div></div>
          </div>
        </div>
        <div class="rp-card">
          <h2>Filter Dashboard</h2><div class="rp-sub">Default tahun otomatis tahun berjalan. Data tampil 10 per halaman.</div>
          <div class="rp-grid rp-grid-5">
            <div><label>Tahun</label><select id="filter_tahun"><option value="">Semua</option></select></div>
            <div><label>Bulan</label><select id="filter_bulan"><option value="">Semua</option>${Object.entries(MONTH_MAP).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
            <div><label>OPD</label><select id="filter_opd"><option value="">Semua</option></select></div>
            <div><label>Status QC</label><select id="filter_status_qc"><option value="">Semua</option><option value="Draft">Draft</option><option value="Menunggu">Menunggu</option><option value="Revisi">Revisi</option><option value="OK">OK</option></select></div>
            <div><label>Maks Data</label><select id="filter_page_size"><option value="10">10</option><option value="20">20</option><option value="all">Semua</option></select></div>
          </div>
          <div class="rp-grid rp-grid-2" style="margin-top:12px;"><div><label>Kata Kunci</label><input type="text" id="filter_keyword" placeholder="Cari ID Rapot / OPD / PIC"></div></div>
          <div class="rp-inline-actions"><button id="runDashboardButton">Tampilkan</button><button class="secondary" id="resetDashboardButton">Reset</button></div>
          <div id="dashboardStatus" class="rp-status"></div>
        </div>
        <div class="rp-card">
          <h2>Daftar Rapor</h2><div class="rp-sub">Klik Lihat untuk membuka halaman report per rapor. Tombol aktif hanya jika status QC sudah OK.</div>
          <div class="rp-table-wrap"><table><thead><tr><th>ID Rapor</th><th>Periode</th><th>Nama OPD</th><th>Input By</th><th>Status QC</th><th>Updated</th><th>Aksi</th></tr></thead><tbody id="dashboardBody"><tr><td colspan="7">Belum ada data.</td></tr></tbody></table></div>
          <div class="rp-pagination-wrap"><div id="paginationInfo" class="rp-pagination-info">0 data tampil</div><div id="pagination" class="rp-pagination"></div></div>
        </div>
      </div>`;
    $('#runDashboardButton')?.addEventListener('click', runDashboard);
    $('#resetDashboardButton')?.addEventListener('click', resetDashboard);
  }

  async function loadDashboardData() {
    setText('#dashboardStatus', 'Memuat data dashboard...');
    try {
      const rows = (await fetchSheet(CONFIG.SHEETS.index)).map(mapCsvRow).filter((row) => row.id_rapot);
      if (destroyed) return;
      allRows = rows;
      buildFilterOptions(allRows);
      runDashboard();
    } catch (err) {
      console.error(err);
      setText('#dashboardStatus', 'Gagal memuat data dashboard. Pastikan sheet publik bisa diakses umum.');
      renderRows([]);
      setSummary([]);
      setHtml('#pagination', '');
      setText('#paginationInfo', '0 data tampil');
    }
  }

  function bindReportButtons() {
    $all('[data-report-id]').forEach((btn) => {
      btn.addEventListener('click', () => loadReportData(btn.dataset.reportId));
    });
  }

  function normalizeRecordKeys(row) {
    const out = {};
    Object.keys(row || {}).forEach((key) => {
      const normalized = String(key || '').trim().toLowerCase().replace(/\s+/g, '_');
      out[normalized] = row[key];
    });
    return out;
  }

  function findRowById(rows, idRapot) {
    return (rows || []).map(normalizeRecordKeys).find((r) => String(r.id_rapot || '').trim() === String(idRapot || '').trim()) || {};
  }

  function parseMoney(value) {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    let str = String(value).trim();
    if (!str || str === '-') return 0;
    str = str.replace(/Rp/gi,'').replace(/\s/g,'').replace(/\./g,'').replace(/,/g,'.').replace(/[^\d.-]/g,'');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  }
  function parseInteger(value) { const cleaned = String(value ?? '').replace(/[^\d-]/g,''); const num = parseInt(cleaned,10); return isNaN(num) ? 0 : num; }
  function formatMoney(num) { return new Intl.NumberFormat('id-ID',{minimumFractionDigits:0,maximumFractionDigits:0}).format(parseMoney(num)); }
  function formatInteger(num) { return new Intl.NumberFormat('id-ID',{minimumFractionDigits:0,maximumFractionDigits:0}).format(parseInteger(num)); }
  function parsePercentNumber(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;
    let str = String(value).trim().replace('%','').trim();
    if (!str || str === '-') return 0;
    const hasDot = str.includes('.'); const hasComma = str.includes(',');
    if (hasDot && hasComma) str = str.replace(/\./g,'').replace(',', '.'); else if (hasComma) str = str.replace(',', '.');
    const num = parseFloat(str); return isNaN(num) ? 0 : num;
  }
  function formatPercentFixed2(value) { return new Intl.NumberFormat('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2}).format(parsePercentNumber(value)) + '%'; }
  function monthLabel(bulan) { return MONTH_MAP_UPPER[String(bulan)] || String(bulan || '-'); }

  function extractDriveFileId(url) {
    const val = String(url || '').trim(); if (!val) return '';
    const patterns = [/\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/, /^([a-zA-Z0-9_-]{20,})$/];
    for (const p of patterns) { const m = val.match(p); if (m && m[1]) return m[1]; }
    const generic = val.match(/[-\w]{25,}/); return generic ? generic[0] : '';
  }
  function driveImageUrl(url) { const fileId = extractDriveFileId(url); return fileId ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600` : ''; }
  function isImageLike(url) { const val = String(url || '').toLowerCase().trim(); return !!val && (val.includes('.png') || val.includes('.jpg') || val.includes('.jpeg') || val.includes('.webp') || val.includes('drive.google.com')); }
  function renderImageOrLink(url, label) {
    const val = String(url || '').trim(); if (!val) return '<div class="rp-muted">Tidak ada file.</div>';
    if (isImageLike(val)) {
      const imgSrc = driveImageUrl(val) || val;
      return `<div class="rp-img-box"><img src="${esc(imgSrc)}" alt="${esc(label)}" /></div><div class="rp-muted" style="margin-top:8px;"><a href="${esc(val)}" target="_blank" rel="noopener noreferrer">Buka file asli</a></div>`;
    }
    return `<div class="rp-link-box"><a href="${esc(val)}" target="_blank" rel="noopener noreferrer">Buka file ${esc(label)}</a></div>`;
  }
  function renderLinkOnly(url, label) { const val = String(url || '').trim(); return val ? `<div class="rp-link-box"><a href="${esc(val)}" target="_blank" rel="noopener noreferrer">Buka file ${esc(label)}</a></div>` : '<div class="rp-muted">Tidak ada file.</div>'; }
  function renderBullets(text) {
    const val = String(text || '').trim(); if (!val || val === '-') return '<div class="rp-note-box rp-muted">Tidak ada analisis manual.</div>';
    const lines = val.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (lines.length <= 1) return `<div class="rp-note-box">${esc(val)}</div>`;
    return `<div class="rp-note-box"><ul class="rp-bullets">${lines.map((line) => `<li>${esc(line.replace(/^[-•]\s*/, ''))}</li>`).join('')}</ul></div>`;
  }

  function renderReportShell(id) {
    shadow.innerHTML = `<style>${STYLE}</style>
      <div class="rp-report-wrap">
        <div class="rp-toolbar"><button class="rp-btn secondary" id="backToDashboardButton" type="button">← Kembali ke Dashboard</button><button class="rp-btn" id="printReportButton" type="button">Print / Save PDF</button></div>
        <div id="status" class="rp-status rp-card">Memuat laporan...</div>
        <div id="content" class="rp-hidden">
          <div class="rp-report-page"><div class="rp-page-head rp-cover"><div class="rp-main-title">RAPOR PBJ OPD</div><div class="rp-sub-title" id="cover_nama_opd">-</div><div class="rp-period" id="cover_periode">PERIODE -</div></div><div class="rp-page-body"><div class="rp-meta-grid"><div class="rp-meta-box"><div class="rp-meta-label">ID Rapor</div><div class="rp-meta-value" id="v_id_rapot">-</div></div><div class="rp-meta-box"><div class="rp-meta-label">Status QC</div><div class="rp-meta-value" id="v_status_qc">-</div></div><div class="rp-meta-box"><div class="rp-meta-label">Kode OPD</div><div class="rp-meta-value" id="v_kode_opd">-</div></div><div class="rp-meta-box"><div class="rp-meta-label">Nama OPD</div><div class="rp-meta-value" id="v_nama_opd">-</div></div></div><div class="rp-note-line" id="metaHeader">-</div></div></div>
          <div class="rp-report-page"><div class="rp-page-head"><h2>STRUKTUR ANGGARAN PBJ PERANGKAT DAERAH</h2></div><div class="rp-page-body"><div class="rp-report-summary"><div class="rp-summary-box"><div class="label">Total Pagu Penyedia</div><div class="value" id="sirup_penyedia">-</div></div><div class="rp-summary-box"><div class="label">Total Pagu Swakelola</div><div class="value" id="sirup_swakelola">-</div></div><div class="rp-summary-box"><div class="label">Total Pagu SiRUP</div><div class="value" id="sirup_total">-</div></div></div><div class="rp-report-summary"><div class="rp-summary-box"><div class="label">Struktur Anggaran RUP</div><div class="value" id="sirup_struktur">-</div></div><div class="rp-summary-box"><div class="label">Prosentase Keterumuman</div><div class="value" id="sirup_persentase">-</div></div><div class="rp-summary-box"><div class="label">Bulan / Tahun</div><div class="value"><span id="v_bulan">-</span> / <span id="v_tahun">-</span></div></div></div><div style="font-size:20px;font-weight:800;color:#0f4c81;text-transform:uppercase;margin:20px 0 18px;">Screenshot Struktur Anggaran</div><div id="img_struktur">-</div></div></div>
          <div class="rp-report-page"><div class="rp-page-head"><h2>PROSENTASE KETERUMUMAN SIRUP</h2></div><div class="rp-page-body"><div class="rp-table-wrap"><table><tbody><tr><th style="width:50%;">Uraian</th><th>Nilai</th></tr><tr><td>Total Pagu Penyedia</td><td id="sirup_penyedia_2" class="right">-</td></tr><tr><td>Total Pagu Swakelola</td><td id="sirup_swakelola_2" class="right">-</td></tr><tr><td>Total Pagu SiRUP</td><td id="sirup_total_2" class="right">-</td></tr><tr><td>Total Struktur Anggaran RUP</td><td id="sirup_struktur_2" class="right">-</td></tr><tr><td class="bold">Prosentase</td><td id="sirup_persentase_2" class="right bold">-</td></tr></tbody></table></div></div></div>
          ${renderPlanningTables()}
          <div class="rp-report-page"><div class="rp-page-head"><h2>PELAKU PENGADAAN DI PERANGKAT DAERAH</h2></div><div class="rp-page-body"><div class="rp-meta-grid"><div class="rp-meta-box"><div class="rp-meta-label">Jumlah PP&PPK</div><div class="rp-meta-value" id="pelaku_jumlah">-</div></div><div class="rp-meta-box"><div class="rp-meta-label">Daftar PP&PPK</div><div class="rp-meta-value" id="pelaku_daftar" style="font-size:14px;font-weight:600;">-</div></div></div><div class="rp-meta-box"><div class="rp-meta-label">Dokumen Pendukung</div><div id="pelaku_file" class="rp-meta-value" style="font-size:14px;font-weight:600;">-</div></div></div></div>
          <div class="rp-report-page"><div class="rp-page-head"><h2>ITKP OPD INDIKATOR PEMANFAATAN SISTEM PENGADAAN</h2></div><div class="rp-page-body"><div id="img_itkp">-</div></div></div>
          <div class="rp-report-page"><div class="rp-page-head"><h2>KESIMPULAN DAN SARAN</h2></div><div class="rp-page-body"><div id="analisis_manual">-</div></div></div>
          <div class="rp-report-page" id="narasi_ai_section"><div class="rp-page-head rp-narasi-head"><h2>Analisa AI</h2><button class="rp-head-toggle-btn" type="button" id="narasi_toggle_btn">Tampilkan</button></div><div class="rp-page-body rp-hidden" id="narasi_ai_body"><div id="narasi_ai_box" class="rp-note-box">Belum ada Analisa AI.</div><div style="height:14px;"></div><div id="voice_status_box" class="rp-link-box">Klik Play untuk membacakan analisa.</div><div class="rp-voice-panel"><div class="rp-voice-meta"><div id="voice_current_label">00:00</div><div id="voice_total_label">00:00</div></div><div class="rp-voice-progress"><div id="voice_progress_fill" class="rp-voice-progress-fill"></div></div></div><div class="rp-inline-actions"><button id="playNarasiButton" type="button">Play</button><button class="secondary" id="stopNarasiButton" type="button">Stop</button></div></div></div>
        </div>
      </div>`;
    $('#backToDashboardButton')?.addEventListener('click', () => { stopNarasiAI(); renderDashboardShell(); loadDashboardData(); });
    $('#printReportButton')?.addEventListener('click', () => window.print());
    $('#narasi_toggle_btn')?.addEventListener('click', toggleNarasiSection);
    $('#playNarasiButton')?.addEventListener('click', playNarasiAI);
    $('#stopNarasiButton')?.addEventListener('click', stopNarasiAI);
  }

  function renderPlanningTables() {
    return `<div class="rp-report-page"><div class="rp-page-head"><h2>DATA PERENCANAAN PENGADAAN PERANGKAT DAERAH</h2></div><div class="rp-page-body"><div class="rp-table-wrap"><table><thead><tr><th>Cara Pengadaan</th><th>Metode Pemilihan Penyedia</th><th>Jumlah Paket</th><th>Jumlah Anggaran (Rp)</th><th>Prosentase Anggaran (%)</th></tr></thead><tbody>${['Tender & Seleksi','Pengadaan Langsung','E-Purchasing','Dikecualikan','-'].map((m,i)=>`<tr><td class="center">${i===4?'Swakelola':'Penyedia'}</td><td>${m}</td><td id="p_paket_${['tender','non','epur','catat','swak'][i]}" class="center">-</td><td id="p_pagu_${['tender','non','epur','catat','swak'][i]}" class="right">-</td><td id="p_pct_${['tender','non','epur','catat','swak'][i]}" class="center">-</td></tr>`).join('')}<tr><td class="center bold" colspan="2">TOTAL</td><td id="p_total_paket" class="center bold">-</td><td id="p_total_pagu" class="right bold">-</td><td id="p_total_pct" class="center bold">100,00%</td></tr></tbody></table></div></div></div>
    <div class="rp-report-page"><div class="rp-page-head"><h2>REALISASI PELAKSANAAN PBJ DI PERANGKAT DAERAH</h2></div><div class="rp-page-body"><div class="rp-table-wrap"><table><thead><tr><th rowspan="2">Cara Pengadaan</th><th rowspan="2">Metode Pemilihan Penyedia</th><th colspan="2">Rencana Pengadaan</th><th colspan="2">Realisasi</th></tr><tr><th>Jumlah Paket</th><th>Jumlah Anggaran (Rp)</th><th>Jumlah Paket</th><th>Jumlah Anggaran (Rp)</th></tr></thead><tbody>${['Tender & Seleksi','Pengadaan Langsung','E-Purchasing','Dikecualikan','-'].map((m,i)=>`<tr><td class="center">${i===4?'Swakelola':'Penyedia'}</td><td>${m}</td><td id="rp_paket_${['tender','non','epur','catat','swak'][i]}" class="center">-</td><td id="rp_pagu_${['tender','non','epur','catat','swak'][i]}" class="right">-</td><td id="r_paket_${['tender','non','epur','catat','swak'][i]}" class="center">-</td><td id="r_anggaran_${['tender','non','epur','catat','swak'][i]}" class="right">-</td></tr>`).join('')}<tr><td class="center bold" colspan="2">TOTAL</td><td id="rp_total_paket" class="center bold">-</td><td id="rp_total_pagu" class="right bold">-</td><td id="r_total_paket" class="center bold">-</td><td id="r_total_anggaran" class="right bold">-</td></tr></tbody></table></div></div></div>`;
  }

  async function loadReportData(id) {
    renderReportShell(id);
    if (!id) { setText('#status', 'Parameter id kosong.'); return; }
    try {
      const [indexRows,sirupRows,perencanaanRows,realisasiRows,pelakuRows,itkpRows,analisisRows,aiRows] = await Promise.all([
        fetchSheet(CONFIG.SHEETS.index), fetchSheet(CONFIG.SHEETS.sirup), fetchSheet(CONFIG.SHEETS.perencanaan), fetchSheet(CONFIG.SHEETS.realisasi),
        fetchSheet(CONFIG.SHEETS.pelaku), fetchSheet(CONFIG.SHEETS.itkp), fetchSheet(CONFIG.SHEETS.analisis), fetchSheet(CONFIG.SHEETS.aiReport)
      ]);
      const data = {
        index: findRowById(indexRows, id), sirup: findRowById(sirupRows, id), perencanaan: findRowById(perencanaanRows, id),
        realisasi: findRowById(realisasiRows, id), pelaku: findRowById(pelakuRows, id), itkp: findRowById(itkpRows, id),
        analisis_manual: findRowById(analisisRows, id), ai_report: findRowById(aiRows, id)
      };
      if (!data.index.id_rapot) { setText('#status', 'Data report tidak ditemukan untuk ID: ' + id); return; }
      renderReportData(data);
    } catch (err) {
      console.error(err);
      setText('#status', 'Error server: ' + (err?.message || String(err)));
    }
  }

  function renderReportData(data) {
    const index = data.index || {}, sirup = data.sirup || {}, perencanaan = data.perencanaan || {}, realisasi = data.realisasi || {}, pelaku = data.pelaku || {}, itkp = data.itkp || {}, analisis = data.analisis_manual || {}, aiReport = data.ai_report || {};
    $('#status')?.classList.add('rp-hidden'); $('#content')?.classList.remove('rp-hidden');
    const bulanText = monthLabel(index.bulan); const tahunText = index.tahun || '-';
    setText('#v_id_rapot', index.id_rapot || '-'); setText('#v_tahun', tahunText); setText('#v_bulan', index.bulan || '-'); setText('#v_status_qc', index.status_qc || '-'); setText('#v_kode_opd', index.kode_opd || '-'); setText('#v_nama_opd', index.nama_opd || '-');
    setText('#cover_nama_opd', index.nama_opd || '-'); setText('#cover_periode', 'PERIODE ' + bulanText + ' ' + tahunText);
    setText('#metaHeader', `OPD: ${index.nama_opd || '-'} | Input By: ${index.input_by || '-'} | Updated At: ${index.updated_at || '-'}`);
    ['#sirup_penyedia','#sirup_penyedia_2'].forEach((s)=>setText(s, formatMoney(sirup.total_pagu_penyedia)));
    ['#sirup_swakelola','#sirup_swakelola_2'].forEach((s)=>setText(s, formatMoney(sirup.total_pagu_swakelola)));
    ['#sirup_total','#sirup_total_2'].forEach((s)=>setText(s, formatMoney(sirup.total_pagu_sirup)));
    ['#sirup_struktur','#sirup_struktur_2'].forEach((s)=>setText(s, formatMoney(sirup.total_struktur_anggaran_rup)));
    ['#sirup_persentase','#sirup_persentase_2'].forEach((s)=>setText(s, formatPercentFixed2(sirup.persentase)));
    setHtml('#img_struktur', renderImageOrLink(sirup.file_screenshot || sirup.file_screenshot_struktur_anggaran || sirup.link_screenshot_struktur || '', 'Struktur Anggaran'));

    const keys = ['tender','non','epur','catat','swak'];
    const pPaket = [perencanaan.paket_tender_seleksi, perencanaan.paket_non_tender, perencanaan.paket_epurchasing, perencanaan.paket_pencatatan, perencanaan.paket_swakelola].map(parseInteger);
    const pPagu = [perencanaan.pagu_tender_seleksi, perencanaan.pagu_non_tender, perencanaan.pagu_epurchasing, perencanaan.pagu_pencatatan, perencanaan.pagu_swakelola].map(parseMoney);
    const totalPaket = pPaket.reduce((a,b)=>a+b,0); const totalPagu = pPagu.reduce((a,b)=>a+b,0);
    keys.forEach((k,i)=>{ setText(`#p_paket_${k}`, formatInteger(pPaket[i])); setText(`#p_pagu_${k}`, formatMoney(pPagu[i])); setText(`#p_pct_${k}`, totalPagu ? formatPercentFixed2((pPagu[i]/totalPagu)*100) : '0,00%'); setText(`#rp_paket_${k}`, formatInteger(pPaket[i])); setText(`#rp_pagu_${k}`, formatMoney(pPagu[i])); });
    setText('#p_total_paket', formatInteger(totalPaket)); setText('#p_total_pagu', formatMoney(totalPagu)); setText('#p_total_pct', formatPercentFixed2(100)); setText('#rp_total_paket', formatInteger(totalPaket)); setText('#rp_total_pagu', formatMoney(totalPagu));

    const rPaket = [realisasi.realisasi_paket_tender_seleksi, realisasi.realisasi_paket_non_tender, realisasi.realisasi_paket_epurchasing, realisasi.realisasi_paket_pencatatan, realisasi.realisasi_paket_swakelola].map(parseInteger);
    const rAng = [realisasi.realisasi_tender_seleksi, realisasi.realisasi_non_tender, realisasi.realisasi_epurchasing, realisasi.realisasi_pencatatan, realisasi.realisasi_swakelola].map(parseMoney);
    keys.forEach((k,i)=>{ setText(`#r_paket_${k}`, formatInteger(rPaket[i])); setText(`#r_anggaran_${k}`, formatMoney(rAng[i])); });
    setText('#r_total_paket', formatInteger(rPaket.reduce((a,b)=>a+b,0))); setText('#r_total_anggaran', formatMoney(rAng.reduce((a,b)=>a+b,0)));
    setText('#pelaku_jumlah', pelaku.jumlah_pp_ppk || '-'); setText('#pelaku_daftar', pelaku.daftar_pp_ppk || '-'); setHtml('#pelaku_file', renderLinkOnly(pelaku.link_dokumen_pendukung || pelaku.file_url || '', 'Dokumen Pendukung'));
    setHtml('#img_itkp', renderImageOrLink(itkp.file_screenshot || itkp.file_screenshot_itkp || itkp.file_url || '', 'ITKP'));
    setHtml('#analisis_manual', renderBullets(analisis.kesimpulan_progres || '-'));
    const narasiAi = String(aiReport.narasi_ai || '').trim(); const narasiAiVoice = String(aiReport.narasi_ai_voice || '').trim();
    setText('#narasi_ai_box', narasiAi || 'Belum ada Analisa AI.'); aiVoiceText = narasiAiVoice || narasiAi || ''; setText('#voice_status_box', aiVoiceText ? 'Klik Play untuk membacakan analisa.' : 'Analisa AI belum tersedia untuk dibacakan.'); resetVoiceProgress(0); prepareVoices();
  }

  function formatVoiceTime(ms) { const s = Math.max(0, Math.floor(Number(ms||0)/1000)); return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); }
  function setVoiceProgress(elapsedMs,totalMs){ const total=Math.max(0,Number(totalMs||0)); const elapsed=Math.min(Math.max(0,Number(elapsedMs||0)), total || Number(elapsedMs||0)); const pct=total>0?Math.min(100,(elapsed/total)*100):0; const fill=$('#voice_progress_fill'); if(fill) fill.style.width=pct+'%'; setText('#voice_current_label',formatVoiceTime(elapsed)); setText('#voice_total_label',formatVoiceTime(total)); }
  function estimateSpeechDurationMs(text,rate){ const wc=String(text||'').trim().split(/\s+/).filter(Boolean).length; const wpm=165*Math.max(.7,Number(rate||1)); return Math.max(4000,Math.round((wc/Math.max(1,wpm))*60000)); }
  function clearVoiceProgressTimer(){ if(voiceProgressTimer){ clearInterval(voiceProgressTimer); voiceProgressTimer=null; } }
  function resetVoiceProgress(totalMs){ clearVoiceProgressTimer(); voiceDurationEstimateMs=Number(totalMs||0); voiceElapsedBeforePauseMs=0; voiceStartedAtMs=0; setVoiceProgress(0,voiceDurationEstimateMs); }
  function startVoiceProgress(totalMs){ voiceDurationEstimateMs=Number(totalMs||0); voiceElapsedBeforePauseMs=0; voiceStartedAtMs=Date.now(); setVoiceProgress(0,voiceDurationEstimateMs); clearVoiceProgressTimer(); voiceProgressTimer=setInterval(()=>{ setVoiceProgress(voiceElapsedBeforePauseMs + Math.max(0, Date.now()-voiceStartedAtMs), voiceDurationEstimateMs); },120); }
  function stopVoiceProgress(){ resetVoiceProgress(0); }
  function completeVoiceProgress(){ clearVoiceProgressTimer(); setVoiceProgress(voiceDurationEstimateMs, voiceDurationEstimateMs); }
  function prepareVoices(){ if(!('speechSynthesis' in window)){ setText('#voice_status_box','Browser ini tidak mendukung suara AI bawaan.'); return; } window.speechSynthesis.getVoices(); }
  function getPreferredVoice(){ if(!('speechSynthesis' in window)) return null; const voices=window.speechSynthesis.getVoices()||[]; return voices.find(v=>String(v.lang||'').toLowerCase()==='id-id') || voices.find(v=>String(v.lang||'').toLowerCase().startsWith('id')) || voices.find(v=>String(v.lang||'').toLowerCase().startsWith('en')) || null; }
  function playNarasiAI(){ if(!('speechSynthesis' in window)){ setText('#voice_status_box','Browser ini tidak mendukung suara AI bawaan.'); return; } const text=String(aiVoiceText || $('#narasi_ai_box')?.innerText || '').trim(); if(!text || text==='Belum ada Analisa AI.'){ setText('#voice_status_box','Analisa AI belum tersedia untuk dibacakan.'); return; } const rate=1.08; window.speechSynthesis.cancel(); currentUtterance=new SpeechSynthesisUtterance(text); currentUtterance.lang='id-ID'; currentUtterance.rate=rate; currentUtterance.pitch=1; currentUtterance.volume=1; const voice=getPreferredVoice(); if(voice) currentUtterance.voice=voice; const estimated=estimateSpeechDurationMs(text,rate); currentUtterance.onstart=()=>{ startVoiceProgress(estimated); setText('#voice_status_box','Sedang membacakan Analisa AI...'); }; currentUtterance.onend=()=>{ currentUtterance=null; completeVoiceProgress(); setText('#voice_status_box','Selesai membacakan Analisa AI.'); }; currentUtterance.onerror=(e)=>{ currentUtterance=null; stopVoiceProgress(); setText('#voice_status_box','Gagal memutar suara AI: '+(e&&e.error?e.error:'unknown error')); }; setTimeout(()=>window.speechSynthesis.speak(currentUtterance),150); }
  function stopNarasiAI(){ if(!('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); currentUtterance=null; stopVoiceProgress(); setText('#voice_status_box','Suara dihentikan.'); }
  function toggleNarasiSection(){ const body=$('#narasi_ai_body'); const btn=$('#narasi_toggle_btn'); if(!body||!btn) return; const hidden=body.classList.contains('rp-hidden'); body.classList.toggle('rp-hidden',!hidden); btn.innerText=hidden?'Minimize':'Tampilkan'; }

  window.__moduleInit = function ({ container }) {
    destroyed = false;
    host = container.querySelector('#raporPbjModuleRoot') || container;
    shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
    renderDashboardShell();
    loadDashboardData();
    return function destroy() {
      destroyed = true;
      stopNarasiAI();
      clearVoiceProgressTimer();
      if (shadow) shadow.innerHTML = '';
    };
  };
})();
