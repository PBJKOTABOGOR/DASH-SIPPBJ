(function(){
  'use strict';

  const APP_CONFIG = {
    spreadsheetId: '1DYsqMtvwhPn-IEA3te9fFukD_iMMDRqUNPamktuPz2U',
    userSheet: { gid: '1707469433', title: 'USERID' },
    providerSheet: { title: 'PORTAL_PENYEDIA' },
    activeSheet: { title: 'PORTAL_AKTIF' },
    ecatSheet: { title: 'PORTAL_EKATALOG' },
    sessionKey: 'pemenang_pengadaan_login_session_v4',
    pageSize: 10
  };

  const state = {
    session: null,
    activeTab: 'dashboard',
    providerRows: [],
    activeRows: [],
    ecatRows: [],
    providerResults: [],
    activeResults: [],
    ecatResults: [],
    providerPage: 1,
    activePage: 1,
    ecatPage: 1,
    providerQuery: '',
    activeQuery: '',
    ecatQuery: '',
    sortActiveBy: 'deadline',
    loadingData: false,
    dataLoaded: false,
    loadingOverlayVisible: false
  };

  function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function normalize(v){return String(v||'').toLowerCase().replace(/\s+/g,' ').replace(/[^\w\s-]/g,'').trim();}
  function parseCsv(text){const rows=[];let row=[],val='',q=false;for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&q&&n==='"'){val+='"';i++;continue;}if(c==='"'){q=!q;continue;}if(c===','&&!q){row.push(val);val='';continue;}if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&n==='\n')i++;row.push(val);if(row.some(x=>String(x).trim()!==''))rows.push(row);row=[];val='';continue;}val+=c;}row.push(val);if(row.some(x=>String(x).trim()!==''))rows.push(row);return rows;}
  function matrixToRows(matrix){const headers=matrix.shift()||[];return matrix.map(cells=>{const row={},map={};headers.forEach((h,i)=>{const k=String(h||'').trim();const val=String(cells[i]||'').trim();row[k]=val;map[normalize(k)]=val;});row.__normalized=map;return row;}).filter(r=>Object.values(r.__normalized).some(v=>String(v).trim()!==''));}
  function getField(row,cands){const map=row&&row.__normalized?row.__normalized:{};for(const c of cands){const k=normalize(c);if(Object.prototype.hasOwnProperty.call(map,k)) return map[k];}for(const [k,v] of Object.entries(map)){if(cands.some(c=>k.includes(normalize(c)))) return v;}return '';}
  function toNumber(v){if(v===null||v===undefined)return 0;const raw=String(v).trim();if(!raw||raw==='-')return 0;let s=raw.replace(/rp\.?/gi,'').replace(/\s+/g,'').replace(/[^\d,.-]/g,'');if(s.includes(',')&&s.includes('.')) s=s.replace(/\./g,'').replace(',', '.'); else if(s.includes(',')&&!s.includes('.')) { const p=s.split(','); s=(p.length===2&&p[1].length<=2)?`${p[0]}.${p[1]}`:s.replace(/,/g,''); } else if((s.match(/\./g)||[]).length>1) s=s.replace(/\./g,''); const n=Number(s); return Number.isFinite(n)?n:0;}
  function formatNumber(v){return Math.round(toNumber(v)).toLocaleString('id-ID');}
  function formatMoney(v){const n=toNumber(v); if(n>=1e12)return `Rp ${(n/1e12).toLocaleString('id-ID',{maximumFractionDigits:2})} T`; if(n>=1e9)return `Rp ${(n/1e9).toLocaleString('id-ID',{maximumFractionDigits:2})} M`; if(n>=1e6)return `Rp ${(n/1e6).toLocaleString('id-ID',{maximumFractionDigits:2})} Jt`; return `Rp ${formatNumber(n)}`;}
  function formatDateish(v){const s=String(v||'').trim(); return s || '-';}
  function persistSession(session){state.session=session; localStorage.setItem(APP_CONFIG.sessionKey, JSON.stringify(session));}
  function getStoredSession(){try{const raw=localStorage.getItem(APP_CONFIG.sessionKey);return raw?JSON.parse(raw):null;}catch(e){return null;}}
  function clearSession(){state.session=null; localStorage.removeItem(APP_CONFIG.sessionKey);}
  function delay(ms){return new Promise(r=>setTimeout(r,ms));}

  function ensureLoadingStyles(){
    if(document.getElementById('ppLoadingStyle')) return;
    const style=document.createElement('style');
    style.id='ppLoadingStyle';
    style.textContent=`
      .pp-loading-overlay{position:fixed;inset:0;background:rgba(238,243,251,.58);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .22s ease}
      .pp-loading-overlay.show{opacity:1;pointer-events:auto}
      .pp-loading-card{width:min(100%,360px);border-radius:26px;padding:18px;background:linear-gradient(135deg,#102a56 0%, #173d79 48%, #285ea8 78%, #1f8d8f 100%);color:#fff;box-shadow:0 24px 60px rgba(20,54,111,.28);border:1px solid rgba(255,255,255,.16);position:relative;overflow:hidden}
      .pp-loading-card:before{content:'';position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);background-size:22px 22px;pointer-events:none}
      .pp-loading-ring{width:38px;height:38px;border-radius:999px;border:3px solid rgba(255,255,255,.28);border-top-color:#fff;animation:ppSpin .8s linear infinite;margin-bottom:10px}
      .pp-loading-kicker{display:inline-flex;min-height:24px;align-items:center;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
      .pp-loading-title{margin:10px 0 6px;font-size:18px;font-weight:950;line-height:1.12}
      .pp-loading-text{font-size:12px;line-height:1.55;color:rgba(255,255,255,.82)}
      .pp-loading-track{margin-top:12px;height:8px;border-radius:999px;background:rgba(255,255,255,.16);overflow:hidden}
      .pp-loading-bar{height:100%;width:0%;border-radius:inherit;background:linear-gradient(90deg,#fff,#8de8db);box-shadow:0 0 16px rgba(255,255,255,.28);transition:width .22s ease}
      .pp-loading-row{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:8px}
      .pp-loading-percent{font-size:14px;font-weight:950}
      .pp-loading-note{font-size:11px;font-weight:800;color:rgba(255,255,255,.78)}
      @keyframes ppSpin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);
  }
  function getLoadingOverlay(){
    ensureLoadingStyles();
    let el=document.getElementById('ppLoadingOverlay');
    if(el) return el;
    el=document.createElement('div');
    el.id='ppLoadingOverlay';
    el.className='pp-loading-overlay';
    el.innerHTML=`<div class="pp-loading-card"><div class="pp-loading-ring"></div><div class="pp-loading-kicker" id="ppLoadingKicker">Pemenang Pengadaan</div><div class="pp-loading-title" id="ppLoadingTitle">Menyiapkan halaman...</div><div class="pp-loading-text" id="ppLoadingText">Tunggu sebentar, halaman sedang disiapkan.</div><div class="pp-loading-track"><div class="pp-loading-bar" id="ppLoadingBar"></div></div><div class="pp-loading-row"><div class="pp-loading-percent" id="ppLoadingPercent">0%</div><div class="pp-loading-note">Mohon tunggu sebentar</div></div></div>`;
    document.body.appendChild(el);
    return el;
  }
  function setLoading(progress,title,text,kicker='Pemenang Pengadaan'){
    const el=getLoadingOverlay();
    el.querySelector('#ppLoadingKicker').textContent=kicker;
    el.querySelector('#ppLoadingTitle').textContent=title;
    el.querySelector('#ppLoadingText').textContent=text;
    el.querySelector('#ppLoadingBar').style.width=`${Math.max(0,Math.min(100,progress))}%`;
    el.querySelector('#ppLoadingPercent').textContent=`${Math.round(progress)}%`;
  }
  function showLoading(progress,title,text,kicker){ setLoading(progress,title,text,kicker); getLoadingOverlay().classList.add('show'); state.loadingOverlayVisible=true; }
  function hideLoading(){ getLoadingOverlay().classList.remove('show'); state.loadingOverlayVisible=false; }

  async function fetchCsvByGid(cfg){const url=`https://docs.google.com/spreadsheets/d/${APP_CONFIG.spreadsheetId}/gviz/tq?tqx=out:csv&gid=${cfg.gid}&v=${Date.now()}`;const r=await fetch(url,{cache:'no-store'});if(!r.ok) throw new Error(`Gagal mengambil ${cfg.title}. HTTP ${r.status}`);const t=await r.text();if(/googlevisualization|DOCTYPE html|<html/i.test(t.slice(0,300))) throw new Error(`${cfg.title} belum bisa dibaca publik.`);return matrixToRows(parseCsv(t));}
  async function fetchCsvBySheetTitle(cfg){const url=`https://docs.google.com/spreadsheets/d/${APP_CONFIG.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(cfg.title)}&v=${Date.now()}`;const r=await fetch(url,{cache:'no-store'});if(!r.ok) throw new Error(`Gagal mengambil ${cfg.title}. HTTP ${r.status}`);const t=await r.text();if(/googlevisualization|DOCTYPE html|<html/i.test(t.slice(0,300))) throw new Error(`${cfg.title} belum bisa dibaca publik.`);return matrixToRows(parseCsv(t));}

  function mapProviderPortalRows(rows){
    return rows.map(row=>({
      sourceJenis:getField(row,['sumber']).toUpperCase()||'TENDER',
      tahun:getField(row,['tahun']),
      kode:getField(row,['kode_paket','kode paket','kode']),
      namaPaket:getField(row,['nama_paket','nama paket']),
      tahapan:getField(row,['tahap_aktif','tahap aktif']),
      pagu:toNumber(getField(row,['pagu'])),
      hps:toNumber(getField(row,['hps'])),
      urlPemenang:getField(row,['url_pemenang','url pemenang']),
      namaPemenang:getField(row,['nama_pemenang','nama pemenang']),
      npwp:getField(row,['npwp']),
      tanggalMulai:getField(row,['tanggal_mulai','tanggal mulai']),
      tanggalSampai:getField(row,['tanggal_sampai','tanggal sampai']),
      urlJadwal:getField(row,['url_jadwal','url jadwal']),
      urlPengumuman:getField(row,['url_pengumuman','url pengumuman']),
      instansi:getField(row,['instansi']),
      lpse:getField(row,['lpse']),
      alamat:getField(row,['alamat']),
      jenisPengadaan:getField(row,['jenis_pengadaan','jenis pengadaan']),
      tahapPembuatanAktif:getField(row,['tahap_aktif','tahap aktif']),
      satker:'', lokasi:'', peserta:'', metode:'', negosiasi:0, penawaran:0, terkoreksi:0
    }));
  }
  function mapActivePortalRows(rows){
    return rows.map(row=>({
      sourceJenis:getField(row,['sumber']).toUpperCase()||'TENDER',
      tahun:getField(row,['tahun']),
      kode:getField(row,['kode_paket','kode paket','kode']),
      namaPaket:getField(row,['nama_paket','nama paket']),
      tahapan:getField(row,['tahap_aktif','tahap aktif']),
      pagu:toNumber(getField(row,['pagu'])),
      hps:toNumber(getField(row,['hps'])),
      urlPemenang:getField(row,['url_pemenang','url pemenang']),
      namaPemenang:getField(row,['nama_pemenang','nama pemenang']),
      npwp:getField(row,['npwp']),
      tanggalMulai:getField(row,['tanggal_mulai','tanggal mulai']),
      tanggalSampai:getField(row,['tanggal_sampai','tanggal sampai']),
      urlJadwal:getField(row,['url_jadwal','url jadwal']),
      urlPengumuman:getField(row,['url_pengumuman','url pengumuman']),
      instansi:getField(row,['instansi']),
      lpse:getField(row,['lpse']),
      alamat:getField(row,['alamat']),
      jenisPengadaan:getField(row,['jenis_pengadaan','jenis pengadaan']),
      tahapPembuatanAktif:getField(row,['tahap_aktif','tahap aktif']),
      satker:'', lokasi:'', peserta:'', metode:'', negosiasi:0, penawaran:0, terkoreksi:0
    }));
  }
  function mapEcatalogPortalRows(rows){
    return rows.map(row=>({
      sourceJenis:'EKATALOG',
      tahun:getField(row,['tahun']),
      kode:getField(row,['kode_paket','kode paket','kode']),
      namaPaket:getField(row,['nama_paket','nama paket']),
      tahapan:getField(row,['tahap_aktif','tahap aktif']) || 'E-Katalog',
      pagu:toNumber(getField(row,['pagu'])),
      hps:toNumber(getField(row,['hps'])) || toNumber(getField(row,['pagu'])),
      urlPemenang:'',
      namaPemenang:getField(row,['nama_pemenang','nama pemenang']),
      npwp:getField(row,['npwp']),
      tanggalMulai:'',
      tanggalSampai:'',
      urlJadwal:'',
      urlPengumuman:'',
      instansi:getField(row,['instansi']),
      lpse:getField(row,['lpse']) || 'E-Katalog',
      satker:getField(row,['satker']),
      alamat:'',
      jenisPengadaan:getField(row,['jenis_pengadaan','jenis pengadaan']),
      tahapPembuatanAktif:getField(row,['tahap_aktif','tahap aktif']) || 'E-Katalog',
      metode:'', negosiasi:0, penawaran:0, terkoreksi:0
    }));
  }

  function buildUnifiedRows(){ return state.providerRows; }
  function getActiveRows(){ return state.activeRows.filter(r=>String(r.tahapPembuatanAktif||r.tahapan||'').trim()!==''); }
  function buildEcatalogRows(){ return state.ecatRows; }

  async function ensureDataLoaded(force = false){
    if((state.dataLoaded && !force) || state.loadingData) return;
    state.loadingData=true;
    try{
      showLoading(10,'Menyiapkan data...','Sedang membuka data yang dibutuhkan untuk halaman ini.','Memuat Halaman');
      await delay(80);
      setLoading(35,'Menyiapkan daftar penyedia...','Tunggu sebentar, daftar penyedia sedang disiapkan.','Memuat Halaman');
      const providerP = fetchCsvBySheetTitle(APP_CONFIG.providerSheet);
      await delay(100);
      setLoading(62,'Menyiapkan paket aktif...','Daftar paket aktif sedang dirapikan.','Memuat Halaman');
      const activeP = fetchCsvBySheetTitle(APP_CONFIG.activeSheet);
      await delay(100);
      setLoading(82,'Menyiapkan e-katalog...','Daftar paket e-katalog sedang disiapkan.','Memuat Halaman');
      const ecatP = fetchCsvBySheetTitle(APP_CONFIG.ecatSheet);
      const [providerRaw, activeRaw, ecatRaw] = await Promise.all([providerP, activeP, ecatP]);
      state.providerRows = mapProviderPortalRows(providerRaw);
      state.activeRows = mapActivePortalRows(activeRaw);
      state.ecatRows = mapEcatalogPortalRows(ecatRaw);
      state.dataLoaded = true;
      setLoading(100,'Halaman siap','Data berhasil disiapkan dan siap ditampilkan.','Memuat Halaman');
      await delay(140);
    } finally {
      state.loadingData=false;
      hideLoading();
    }
  }

  function renderLogin(){
    return `<div class="pp-login-wrap"><div class="pp-login-card" id="ppLoginCard"><div class="pp-login-brand"><span class="pp-kicker">Pemenang Pengadaan</span><h2>Pemenang Pengadaan</h2><p>Halaman ini dipakai untuk mencari paket penyedia, memantau paket aktif, dan melihat paket e-katalog. Masuk pakai akun yang sudah disiapkan.</p></div><div class="pp-login-form-wrap"><h3>Masuk ke portal</h3><p class="pp-login-copy">Gunakan user id dan password yang sudah disiapkan.</p><form id="ppLoginForm"><label class="pp-field"><span>User ID</span><input class="pp-input" id="ppLoginUser" type="text" placeholder="Masukkan user id" required></label><label class="pp-field"><span>Password</span><input class="pp-input" id="ppLoginPassword" type="password" placeholder="Masukkan password" required></label><button class="pp-login-submit" id="ppLoginSubmit" type="submit">✦ Masuk ke Portal</button><div class="pp-login-error" id="ppLoginError"></div></form><div class="pp-login-note">Kalau gagal masuk, cek lagi user id dan password yang dipakai. Pastikan penulisannya sudah benar.</div></div></div></div>`;
  }
  function setLoginError(root,msg=''){const el=root.querySelector('#ppLoginError'); if(!el) return; el.textContent=msg; el.classList.toggle('show', !!msg);}
  async function handleLoginSubmit(root,e){
    e.preventDefault();
    const userId=root.querySelector('#ppLoginUser').value.trim();
    const password=root.querySelector('#ppLoginPassword').value;
    const btn=root.querySelector('#ppLoginSubmit');
    if(!userId||!password){setLoginError(root,'User ID dan password wajib diisi.'); return;}
    setLoginError(root,''); btn.disabled=true; btn.textContent='Memeriksa akses...';
    try{
      showLoading(15,'Memeriksa akses login...','Sedang memeriksa user id dan password yang Anda masukkan.','Masuk ke Halaman');
      const rows=await fetchCsvByGid(APP_CONFIG.userSheet);
      setLoading(65,'Validasi user...','Sedang memastikan data login sesuai.','Masuk ke Halaman');
      const match=rows.find(row=>String(getField(row,['USERID','user id','user'])).trim()===userId && String(getField(row,['PASSWORD','password','pass'])).trim()===password);
      if(!match) throw new Error('User ID atau password tidak sesuai.');
      persistSession({userId,loginAt:Date.now()});
      setLoading(100,'Login berhasil','Akses diterima, halaman sedang dibuka.','Masuk ke Halaman');
      await delay(150);
      await ensureDataLoaded();
      renderApp(root);
    }catch(err){hideLoading(); setLoginError(root, err.message||'Login gagal.');}
    finally{btn.disabled=false; btn.textContent='✦ Masuk ke Portal';}
  }

  function dashboardCounts(){
    const providerRows=buildUnifiedRows();
    const activeRows=getActiveRows();
    const ecatRows=buildEcatalogRows();
    const lpse=new Set(providerRows.map(r=>r.lpse).filter(Boolean)).size;
    const instansi=new Set(providerRows.map(r=>r.instansi).filter(Boolean)).size;
    return {paket:providerRows.length, lpse, instansi, aktif:activeRows.length, ecat: ecatRows.length};
  }
  function renderDashboardContent(){ const counts=dashboardCounts(); return `<div class="pp-dashboard-header"><div class="pp-dashboard-top"><div><span class="pp-panel-title">Dashboard Akses · Pengguna</span><h3>Pilih panel kerja</h3><p>Silakan pilih menu yang ingin dibuka. Tampilan dibuat ringkas supaya lebih cepat dipakai dan lebih mudah dibaca.</p></div><div class="pp-dashboard-mini"><div class="pp-mini-box"><span>Paket tersedia</span><strong>${formatNumber(counts.paket)}</strong></div><div class="pp-mini-box"><span>Paket aktif</span><strong>${formatNumber(counts.aktif)}</strong></div><div class="pp-mini-box"><span>Instansi</span><strong>${formatNumber(counts.instansi)}</strong></div><div class="pp-mini-box pp-mini-box--purple"><span>E-Katalog</span><strong>${formatNumber(counts.ecat)}</strong></div></div></div></div><div class="pp-feature-grid pp-feature-grid--triple"><button class="pp-feature-card pp-feature-card--blue" data-pp-tab="provider-search"><div class="pp-feature-icon">🔎</div><div class="pp-feature-copy"><span>Menu utama</span><h4>Pencarian Paket Penyedia</h4><p>Telusuri profil penyedia, nilai kontrak, sebaran daerah, LPSE, dan daftar paket pemenang.</p></div><div class="pp-feature-arrow">→</div></button><button class="pp-feature-card pp-feature-card--teal" data-pp-tab="active-packages"><div class="pp-feature-icon">📦</div><div class="pp-feature-copy"><span>Pantauan aktif</span><h4>Paket Pengadaan Aktif</h4><p>Cari paket aktif berdasarkan nama paket, instansi, atau LPSE. Lengkap dengan filter jenis paket dan tahap proses.</p></div><div class="pp-feature-arrow">→</div></button><button class="pp-feature-card pp-feature-card--purple" data-pp-tab="ecatalog-search"><div class="pp-feature-icon">🛒</div><div class="pp-feature-copy"><span>E-Katalog</span><h4>Pencarian Paket E-Katalog</h4><p>Fokus pada paket e-katalog konstruksi yang sudah disiapkan untuk halaman ini.</p></div><div class="pp-feature-arrow">→</div></button></div><div class="pp-disclaimer" id="ppDisclaimer"><button class="pp-disclaimer-toggle" id="ppDisclaimerToggle" type="button"><div class="pp-disclaimer-left"><div class="pp-disclaimer-badge">!</div><div><strong>Informasi Penting</strong><small>Keterangan singkat sebelum memakai menu</small></div></div><div class="pp-disclaimer-caret">⌄</div></button><div class="pp-disclaimer-body"><div class="pp-disclaimer-grid"><div class="pp-disclaimer-box"><h5>Yang perlu diketahui</h5><ul><li>Akses masuk dibatasi untuk pengguna yang sudah terdaftar.</li><li>Menu penyedia dipakai untuk mencari paket berdasarkan nama pemenang.</li><li>Menu paket aktif dipakai untuk memantau paket yang masih berjalan.</li><li>Menu e-katalog fokus pada pekerjaan konstruksi.</li></ul></div><div class="pp-disclaimer-box"><h5>Catatan pemakaian</h5><ul><li>Informasi ditampilkan sesuai data yang tersedia saat halaman dibuka.</li><li>Gunakan kata kunci yang lebih spesifik supaya hasil lebih cepat ditemukan.</li><li>Untuk kebutuhan penting, tetap lakukan pengecekan ulang pada sumber resminya.</li></ul></div></div></div></div>`; }

  function providerMatches(row,term,tahun){const hay=[row.namaPemenang,row.namaPaket,row.instansi,row.lpse,row.kode,row.npwp].join(' ').toLowerCase(); if(tahun&&String(row.tahun)!==String(tahun)) return false; if(!term) return true; return hay.includes(term.toLowerCase());}
  function sortRows(rows,by){const arr=[...rows]; if(by==='nilai') arr.sort((a,b)=>(b.pagu||b.hps)-(a.pagu||a.hps)); else if(by==='nama') arr.sort((a,b)=>String(a.namaPaket).localeCompare(String(b.namaPaket),'id')); else if(by==='instansi') arr.sort((a,b)=>String(a.instansi).localeCompare(String(b.instansi),'id')); else arr.sort((a,b)=>String(a.tanggalSampai||'').localeCompare(String(b.tanggalSampai||''),'id')); return arr;}
  function paginate(rows,page){ const total=rows.length; const start=(page-1)*APP_CONFIG.pageSize; const end=Math.min(start+APP_CONFIG.pageSize,total); return {slice:rows.slice(start,end), start, end, total, pages: Math.max(1,Math.ceil(total/APP_CONFIG.pageSize))}; }
  function renderPagination(type, page, total){ const pages=Math.max(1,Math.ceil(total/APP_CONFIG.pageSize)); if(total<=APP_CONFIG.pageSize) return ''; return `<div class="pp-pagination"><button class="pp-page-btn" type="button" data-pp-page-move="${type}:prev" ${page<=1?'disabled':''}>← Prev</button><div class="pp-page-info">Menampilkan ${(page-1)*APP_CONFIG.pageSize+1}-${Math.min(page*APP_CONFIG.pageSize,total)} dari ${formatNumber(total)} hasil</div><button class="pp-page-btn" type="button" data-pp-page-move="${type}:next" ${page>=pages?'disabled':''}>Next →</button></div>`; }
  function renderQueryInfo(q){ return q ? `<div class="pp-query-info">Hasil pencarian untuk <b>${esc(q)}</b></div>` : ''; }

  function renderProviderSearch(){
    const years=[...new Set(buildUnifiedRows().map(r=>r.tahun).filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a)));
    const all=state.providerResults; const pageData=paginate(all,state.providerPage);
    const tenderCount = buildUnifiedRows().filter(r=>r.sourceJenis==='TENDER').length;
    const nonTenderCount = buildUnifiedRows().filter(r=>r.sourceJenis==='NON TENDER').length;
    return `<div class="pp-section-card"><div class="pp-section-head"><div><span class="pp-panel-title" style="background:#edf4ff;border-color:#dbe4f0;color:#17427d;">Analisis penyedia</span><h3>Pencarian Paket Penyedia</h3><p>Cari nama penyedia, lalu buka rincian paket dan tautan yang dibutuhkan.</p></div><button class="pp-export-btn" type="button" id="ppExportProviderBtn">Export XLSX</button></div><div class="pp-filter-grid"><label class="pp-search-box"><span>Kata kunci penyedia</span><input class="pp-search-input" id="ppProviderKeyword" placeholder="Cari nama penyedia, paket, instansi, LPSE, atau NPWP..." value="${esc(state.providerQuery)}"></label><label class="pp-select-box"><span>Tahun</span><select class="pp-select" id="ppProviderYear"><option value="">Semua tahun</option>${years.map(y=>`<option value="${esc(y)}">${esc(y)}</option>`).join('')}</select></label><div></div><div></div><button class="pp-action-button" id="ppProviderSearchBtn" type="button" ${state.providerQuery.trim()?'':'disabled'}>Cari Penyedia</button></div><div class="pp-summary-strip"><div class="pp-summary-box"><span>Total data tersedia</span><strong>${formatNumber(buildUnifiedRows().length)}</strong></div><div class="pp-summary-box"><span>Data tender</span><strong>${formatNumber(tenderCount)}</strong></div><div class="pp-summary-box"><span>Data non tender</span><strong>${formatNumber(nonTenderCount)}</strong></div><div class="pp-summary-box"><span>Hasil saat ini</span><strong>${formatNumber(all.length)}</strong></div></div>${renderQueryInfo(state.providerQuery)}<div class="pp-result-list">${pageData.total?pageData.slice.map((r,i)=>renderPackageCard(r,pageData.start+i,true)).join(''):`<div class="pp-empty">Masukkan kata kunci penyedia lalu klik <b>Cari Penyedia</b>.</div>`}</div>${renderPagination('provider',state.providerPage,pageData.total)}</div>`;
  }

  function renderActivePackages(){
    const rows=state.activeResults; const pageData=paginate(rows,state.activePage);
    const years=[...new Set(getActiveRows().map(r=>r.tahun).filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a)));
    const phases=[...new Set(getActiveRows().map(r=>r.tahapPembuatanAktif||r.tahapan).filter(Boolean))].sort();
    return `<div class="pp-section-card"><div class="pp-section-head"><div><span class="pp-panel-title" style="background:#ecfffb;border-color:#d1f6ef;color:#0f766e;">Pantauan aktif</span><h3>Paket Pengadaan Aktif</h3><p>Cari paket aktif berdasarkan nama paket, instansi, atau LPSE. Lengkap dengan filter jenis paket, tahap proses, dan tahun.</p></div><button class="pp-export-btn" type="button" id="ppExportActiveBtn">Export XLSX</button></div><div class="pp-filter-grid"><label class="pp-search-box"><span>Pencarian umum</span><input class="pp-search-input" id="ppActiveKeyword" placeholder="Cari nama paket, instansi, atau LPSE..." value="${esc(state.activeQuery)}"></label><label class="pp-select-box"><span>Jenis paket</span><select class="pp-select" id="ppActiveJenis"><option value="">Semua</option><option value="TENDER">Tender</option><option value="NON TENDER">Non Tender</option></select></label><label class="pp-select-box"><span>Tahap proses</span><select class="pp-select" id="ppActivePhase"><option value="">Semua tahap</option>${phases.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('')}</select></label><label class="pp-select-box"><span>Tahun</span><select class="pp-select" id="ppActiveYear"><option value="">Semua tahun</option>${years.map(y=>`<option value="${esc(y)}">${esc(y)}</option>`).join('')}</select></label><button class="pp-action-button" id="ppActiveSearchBtn" type="button">Cari Paket</button></div><div class="pp-summary-strip"><div class="pp-summary-box"><span>Total aktif</span><strong>${formatNumber(getActiveRows().length)}</strong></div><div class="pp-summary-box"><span>Hasil ditemukan</span><strong>${formatNumber(rows.length)}</strong></div><div class="pp-summary-box"><span>Dengan pemenang</span><strong>${formatNumber(rows.filter(r=>r.namaPemenang).length)}</strong></div><div class="pp-summary-box"><span>Nilai pagu</span><strong>${formatMoney(rows.reduce((t,r)=>t+(r.pagu||0),0))}</strong></div></div>${renderQueryInfo(state.activeQuery)}<div class="pp-toolbar"><div class="pp-sort-group"><span>Urutkan</span><button class="pp-sort-btn ${state.sortActiveBy==='deadline'?'active':''}" data-pp-sort="deadline" type="button">Deadline</button><button class="pp-sort-btn ${state.sortActiveBy==='nilai'?'active':''}" data-pp-sort="nilai" type="button">Nilai</button><button class="pp-sort-btn ${state.sortActiveBy==='nama'?'active':''}" data-pp-sort="nama" type="button">Nama</button><button class="pp-sort-btn ${state.sortActiveBy==='instansi'?'active':''}" data-pp-sort="instansi" type="button">Instansi</button></div></div><div class="pp-result-list">${pageData.total?pageData.slice.map((r,i)=>renderPackageCard(r,pageData.start+i,false)).join(''):`<div class="pp-empty">Belum ada hasil. Gunakan filter lalu klik <b>Cari Paket</b>.</div>`}</div>${renderPagination('active',state.activePage,pageData.total)}</div>`;
  }

  function renderEcatalogSearch(){
    const source=buildEcatalogRows(); const years=[...new Set(source.map(r=>r.tahun).filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a))); const all=state.ecatResults; const pageData=paginate(all,state.ecatPage);
    return `<div class="pp-section-card"><div class="pp-section-head"><div><span class="pp-panel-title" style="background:#f3efff;border-color:#e5ddff;color:#6b3fe3;">E-Katalog Konstruksi</span><h3>Pencarian Paket E-Katalog</h3><p>Menampilkan paket e-katalog konstruksi dengan tampilan yang dibedakan dari tender dan non tender.</p></div><button class="pp-export-btn pp-export-btn--purple" type="button" id="ppExportEcatBtn">Export XLSX</button></div><div class="pp-filter-grid"><label class="pp-search-box"><span>Kata kunci e-katalog</span><input class="pp-search-input" id="ppEcatKeyword" placeholder="Cari nama penyedia, paket, instansi, atau LPSE..." value="${esc(state.ecatQuery)}"></label><label class="pp-select-box"><span>Tahun</span><select class="pp-select" id="ppEcatYear"><option value="">Semua tahun</option>${years.map(y=>`<option value="${esc(y)}">${esc(y)}</option>`).join('')}</select></label><div></div><div></div><button class="pp-action-button pp-action-button--purple" id="ppEcatSearchBtn" type="button" ${state.ecatQuery.trim()?'':'disabled'}>Cari E-Katalog</button></div><div class="pp-summary-strip"><div class="pp-summary-box pp-summary-box--purple"><span>Total e-katalog konstruksi</span><strong>${formatNumber(source.length)}</strong></div><div class="pp-summary-box pp-summary-box--purple"><span>Dengan pemenang</span><strong>${formatNumber(source.filter(r=>r.namaPemenang).length)}</strong></div><div class="pp-summary-box pp-summary-box--purple"><span>Instansi</span><strong>${formatNumber(new Set(source.map(r=>r.instansi).filter(Boolean)).size)}</strong></div><div class="pp-summary-box pp-summary-box--purple"><span>Hasil saat ini</span><strong>${formatNumber(all.length)}</strong></div></div>${renderQueryInfo(state.ecatQuery)}<div class="pp-result-list">${pageData.total?pageData.slice.map((r,i)=>renderPackageCard(r,pageData.start+i,true)).join(''):`<div class="pp-empty">Masukkan kata kunci lalu klik <b>Cari E-Katalog</b>.</div>`}</div>${renderPagination('ecat',state.ecatPage,pageData.total)}</div>`;
  }

  function renderLink(label, href, icon){ if(!href) return `<span class="pp-link-pill pp-link-pill--disabled">${icon} ${label}</span>`; return `<a class="pp-link-pill pp-link-pill--active" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${icon} ${label}</a>`; }
  function sourceBadgeClass(source){ if(source==='EKATALOG') return 'pp-badge--purple'; if(source==='NON TENDER') return 'pp-badge--gold'; return 'pp-badge--blue'; }
  function sourceCardClass(source){ if(source==='EKATALOG') return 'pp-package-card--purple'; if(source==='NON TENDER') return 'pp-package-card--gold'; return 'pp-package-card--blue'; }
  function renderPackageCard(row, idx, providerMode){
    const title=row.namaPaket||'-'; const phase=row.tahapPembuatanAktif||row.tahapan||'-'; const detailId=`pp-detail-${providerMode?'p':'a'}-${idx}`;
    return `<article class="pp-package-card ${sourceCardClass(row.sourceJenis)}" data-detail-card="${detailId}"><div class="pp-package-main"><div class="pp-package-top"><div class="pp-package-title-wrap"><div class="pp-badges"><span class="pp-badge ${sourceBadgeClass(row.sourceJenis)}">${esc(row.sourceJenis)}</span>${phase&&phase!=='-'?`<span class="pp-badge pp-badge--teal">${esc(phase)}</span>`:''}${row.namaPemenang?`<span class="pp-badge pp-badge--green">Dengan pemenang</span>`:''}</div><h4 class="pp-package-title">${esc(title)}</h4><div class="pp-package-meta"><span>${esc(row.instansi||'-')}</span>${row.satker?`<span>${esc(row.satker)}</span>`:''}<span>${esc(row.lpse||'-')}</span></div></div><div class="pp-package-side"><div class="pp-side-card"><span>${providerMode?'Nilai HPS':'Nilai Pagu'}</span><strong>${formatMoney(providerMode?(row.hps||row.pagu):(row.pagu||row.hps))}</strong></div></div></div><div class="pp-package-grid"><div class="pp-meta-tile"><span>Pemenang</span><strong>${esc(row.namaPemenang||'-')}</strong></div><div class="pp-meta-tile"><span>NPWP</span><strong>${esc(row.npwp||'-')}</strong></div><div class="pp-meta-tile"><span>Mulai</span><strong>${esc(formatDateish(row.tanggalMulai))}</strong></div><div class="pp-meta-tile"><span>Sampai / Deadline</span><strong>${esc(formatDateish(row.tanggalSampai))}</strong></div></div></div><div class="pp-package-actions"><div class="pp-link-row">${renderLink('Pemenang', row.urlPemenang, '👁')} ${renderLink('Jadwal', row.urlJadwal, '🗓')} ${renderLink('Pengumuman', row.urlPengumuman, '📢')}</div><button class="pp-detail-toggle" type="button" data-detail-toggle="${detailId}">Lihat detail lengkap</button></div><div class="pp-package-detail" id="${detailId}"><div class="pp-detail-grid"><div class="pp-detail-box"><h5>Identitas Paket</h5><div class="pp-detail-list"><span>Kode Paket</span><strong>${esc(row.kode||'-')}</strong><span>Jenis Pengadaan</span><strong>${esc(row.jenisPengadaan||row.sourceJenis||'-')}</strong><span>Instansi</span><strong>${esc(row.instansi||'-')}</strong><span>LPSE</span><strong>${esc(row.lpse||'-')}</strong><span>Tahap Aktif</span><strong>${esc(phase)}</strong></div></div><div class="pp-detail-box"><h5>Profil Pemenang</h5><div class="pp-provider-profile"><strong>${esc(row.namaPemenang||'-')}</strong><div><b>Alamat</b><br>${esc(row.alamat||'-')}</div><div><b>NPWP</b><br>${esc(row.npwp||'-')}</div><div><b>Nilai Penawaran</b><br>${row.penawaran?formatMoney(row.penawaran):'-'}</div><div><b>Nilai Terkoreksi</b><br>${row.terkoreksi?formatMoney(row.terkoreksi):'-'}</div><div><b>Nilai Negosiasi</b><br>${row.negosiasi?formatMoney(row.negosiasi):'-'}</div></div></div></div></div></article>`;
  }

  function exportRowsToCsv(rows, filename){
    if(!rows.length){ alert('Belum ada data untuk diexport.'); return; }
    const headers=['Sumber','Tahun','Kode Paket','Nama Paket','Tahap Aktif','Instansi','LPSE','Pemenang','NPWP','Nilai Pagu','Nilai HPS','Mulai','Deadline'];
    const lines=[headers.join(',')].concat(rows.map(r=>[
      r.sourceJenis,r.tahun,r.kode,r.namaPaket,r.tahapPembuatanAktif||r.tahapan,r.instansi,r.lpse,r.namaPemenang,r.npwp,r.pagu,r.hps,r.tanggalMulai,r.tanggalSampai
    ].map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')));
    const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function renderApp(root){
    const loginView=root.querySelector('#ppLoginView'); const appView=root.querySelector('#ppAppView');
    loginView.classList.add('pp-hidden'); appView.classList.remove('pp-hidden');
    const content = `<div class="pp-shell"><div class="pp-app-topbar"><div class="pp-app-title"><div class="pp-app-logo"></div><div><h2>Pemenang Pengadaan</h2><p>Portal internal pencarian penyedia, paket aktif, dan e-katalog</p></div></div><div class="pp-app-actions"><div class="pp-user-pill">${esc(state.session?.userId||'-')}</div><button class="pp-top-button" type="button" data-pp-tab="dashboard">Dashboard</button><button class="pp-top-button pp-top-button--danger" type="button" id="ppLogoutBtn">Keluar</button></div></div><div class="pp-tabs"><button class="pp-tab ${state.activeTab==='dashboard'?'active':''}" data-pp-tab="dashboard" type="button">Dashboard</button><button class="pp-tab ${state.activeTab==='provider-search'?'active':''}" data-pp-tab="provider-search" type="button">Pencarian Paket Penyedia</button><button class="pp-tab ${state.activeTab==='active-packages'?'active':''}" data-pp-tab="active-packages" type="button">Paket Pengadaan Aktif</button><button class="pp-tab pp-tab--purple ${state.activeTab==='ecatalog-search'?'active':''}" data-pp-tab="ecatalog-search" type="button">Pencarian Paket Ekatalog</button></div><div class="pp-page ${state.activeTab==='dashboard'?'active':''}" data-pp-page="dashboard">${renderDashboardContent()}</div><div class="pp-page ${state.activeTab==='provider-search'?'active':''}" data-pp-page="provider-search">${renderProviderSearch()}</div><div class="pp-page ${state.activeTab==='active-packages'?'active':''}" data-pp-page="active-packages">${renderActivePackages()}</div><div class="pp-page ${state.activeTab==='ecatalog-search'?'active':''}" data-pp-page="ecatalog-search">${renderEcatalogSearch()}</div></div>`;
    appView.innerHTML=content; bindApp(root);
  }

  async function changeTab(root, tab){
    showLoading(20,'Menyiapkan halaman...','Tunggu sebentar, halaman yang dipilih sedang dibuka.','Pindah Menu');
    state.activeTab=tab;
    if(tab!=='dashboard'){ await ensureDataLoaded(); }
    setLoading(82,'Menampilkan halaman...','Halaman sedang dirapikan untuk ditampilkan.','Pindah Menu');
    await delay(100);
    renderApp(root);
    setLoading(100,'Halaman siap','Menu berhasil dibuka.','Pindah Menu');
    await delay(100);
    hideLoading();
  }

  function bindApp(root){
    const appView=root.querySelector('#ppAppView');
    const logoutBtn=appView.querySelector('#ppLogoutBtn');
    if(logoutBtn) logoutBtn.addEventListener('click', ()=>{clearSession(); state.activeTab='dashboard'; state.providerResults=[]; state.activeResults=[]; state.ecatResults=[]; mount(root);});
    appView.querySelectorAll('[data-pp-tab]').forEach(btn=>btn.addEventListener('click', ()=>changeTab(root, btn.dataset.ppTab)));
    const dToggle=appView.querySelector('#ppDisclaimerToggle'); if(dToggle) dToggle.addEventListener('click', ()=>{appView.querySelector('#ppDisclaimer').classList.toggle('open');});

    const pInput=appView.querySelector('#ppProviderKeyword'); const pBtn=appView.querySelector('#ppProviderSearchBtn');
    if(pInput&&pBtn){ pInput.addEventListener('input', ()=>{ state.providerQuery=pInput.value; pBtn.disabled=!pInput.value.trim(); }); pBtn.addEventListener('click', async ()=>{ showLoading(18,'Menyiapkan pencarian penyedia...','Tunggu sebentar, hasil sedang dicari.','Pencarian Penyedia'); const term=pInput.value.trim(); state.providerQuery=term; const tahun=appView.querySelector('#ppProviderYear').value; await ensureDataLoaded(); setLoading(68,'Menyaring hasil...','Sedang mencari data yang cocok dengan kata kunci Anda.','Pencarian Penyedia'); state.providerPage=1; state.providerResults=buildUnifiedRows().filter(r=>providerMatches(r,term,tahun)); await delay(80); renderApp(root); hideLoading(); }); }
    const exportP=appView.querySelector('#ppExportProviderBtn'); if(exportP) exportP.addEventListener('click',()=>exportRowsToCsv(state.providerResults,'pencarian_penyedia.csv'));

    const aBtn=appView.querySelector('#ppActiveSearchBtn'); if(aBtn){ aBtn.addEventListener('click', async ()=>{ showLoading(18,'Menyiapkan pencarian paket aktif...','Tunggu sebentar, hasil sedang dicari.','Paket Aktif'); const kw=appView.querySelector('#ppActiveKeyword').value.trim().toLowerCase(); state.activeQuery=appView.querySelector('#ppActiveKeyword').value.trim(); const jenis=appView.querySelector('#ppActiveJenis').value; const phase=appView.querySelector('#ppActivePhase').value; const tahun=appView.querySelector('#ppActiveYear').value; await ensureDataLoaded(); setLoading(70,'Menyaring hasil...','Sedang mengambil data sesuai filter yang dipilih.','Paket Aktif'); let rows=getActiveRows().filter(r=>{ const hay=[r.namaPaket,r.instansi,r.lpse].join(' ').toLowerCase(); if(kw && !hay.includes(kw)) return false; if(jenis && r.sourceJenis!==jenis) return false; const phaseVal=r.tahapPembuatanAktif||r.tahapan||''; if(phase && phaseVal!==phase) return false; if(tahun && String(r.tahun)!==String(tahun)) return false; return true; }); state.activePage=1; state.activeResults=sortRows(rows,state.sortActiveBy); await delay(80); renderApp(root); hideLoading(); }); }
    const exportA=appView.querySelector('#ppExportActiveBtn'); if(exportA) exportA.addEventListener('click',()=>exportRowsToCsv(state.activeResults,'paket_aktif.csv'));

    const eInput=appView.querySelector('#ppEcatKeyword'); const eBtn=appView.querySelector('#ppEcatSearchBtn');
    if(eInput&&eBtn){ eInput.addEventListener('input', ()=>{ state.ecatQuery=eInput.value; eBtn.disabled=!eInput.value.trim(); }); eBtn.addEventListener('click', async ()=>{ showLoading(18,'Menyiapkan pencarian e-katalog...','Tunggu sebentar, hasil sedang dicari.','Paket E-Katalog'); const kw=eInput.value.trim().toLowerCase(); state.ecatQuery=eInput.value.trim(); const tahun=appView.querySelector('#ppEcatYear').value; await ensureDataLoaded(); setLoading(70,'Menyaring hasil...','Sedang mengambil data e-katalog yang sesuai.','Paket E-Katalog'); state.ecatPage=1; state.ecatResults=buildEcatalogRows().filter(r=>{ const hay=[r.namaPaket,r.instansi,r.satker,r.lpse,r.namaPemenang].join(' ').toLowerCase(); if(kw && !hay.includes(kw)) return false; if(tahun && String(r.tahun)!==String(tahun)) return false; return true; }); await delay(80); renderApp(root); hideLoading(); }); }
    const exportE=appView.querySelector('#ppExportEcatBtn'); if(exportE) exportE.addEventListener('click',()=>exportRowsToCsv(state.ecatResults,'paket_ekatalog.csv'));

    appView.querySelectorAll('[data-pp-sort]').forEach(btn=>btn.addEventListener('click', ()=>{ state.sortActiveBy=btn.dataset.ppSort; state.activeResults=sortRows(state.activeResults,state.sortActiveBy); renderApp(root); }));
    appView.querySelectorAll('[data-detail-toggle]').forEach(btn=>btn.addEventListener('click', ()=>{ const id=btn.dataset.detailToggle; const card=appView.querySelector(`[data-detail-card="${id}"]`); if(card){ card.classList.toggle('open'); btn.textContent=card.classList.contains('open')?'Tutup detail':'Lihat detail lengkap'; } }));
    appView.querySelectorAll('[data-pp-page-move]').forEach(btn=>btn.addEventListener('click', async ()=>{ const [type,dir]=btn.dataset.ppPageMove.split(':'); showLoading(28,'Memindahkan halaman...','Tunggu sebentar, halaman berikutnya sedang dibuka.','Paging'); if(type==='provider'){ state.providerPage=Math.max(1, state.providerPage + (dir==='next'?1:-1)); } if(type==='active'){ state.activePage=Math.max(1, state.activePage + (dir==='next'?1:-1)); } if(type==='ecat'){ state.ecatPage=Math.max(1, state.ecatPage + (dir==='next'?1:-1)); } await delay(80); renderApp(root); hideLoading(); }));
  }

  function mount(root){
    root.querySelector('#ppLoginView').innerHTML=renderLogin(); root.querySelector('#ppAppView').innerHTML=''; root.querySelector('#ppLoginView').classList.remove('pp-hidden'); root.querySelector('#ppAppView').classList.add('pp-hidden');
    const form=root.querySelector('#ppLoginForm'); form.addEventListener('submit', handleLoginSubmit.bind(null,root));
    const session=getStoredSession(); if(session){ state.session=session; showLoading(24,'Menyiapkan halaman...','Tunggu sebentar, halaman terakhir Anda sedang dibuka.','Memuat Halaman'); ensureDataLoaded().finally(()=>{ renderApp(root); hideLoading(); }); }
  }

  window.__moduleInit = function({container}){ const root = container.querySelector('#ppModuleRoot') || container; mount(root); return function destroy(){}; };
})();
