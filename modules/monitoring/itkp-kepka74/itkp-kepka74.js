(function(){
  const CFG = {
    spreadsheetId: '1sjrl57Gv9K0Xv_KNcPJSZggGDsFa0tv7DyRSUcc_JAM',
    sheets: {
      rekap: 'ITKP_REKAP_OPD',
      target: 'ITKP_TARGET_OPD',
      kontrol: 'ITKP_KONTROL',
      tanpaRup: 'ITKP_TANPA_RUP',
      master: 'ITKP_MASTER_PAKET',
      raw: 'RAW_REALISASI'
    },
    cacheMs: 300000,
    tablePageSize: 15,
    detailPageSize: 10,
    doubleInputPageSize: 10,
    adminStorageKey: 'sippbj_itkp74_admin_edits_v1',
    adminApiUrl: ''
  };

  const VIEW_META = {
    ringkasan: {title:'ITKP Kepka 74 2026', subtitle:'Ringkasan skor Pemanfaatan Sistem, target berikutnya, dan paket yang perlu ditindaklanjuti.'},
    pengumuman: {title:'Pengumuman RUP', subtitle:'Perbandingan nilai RUP yang diumumkan dengan total belanja PBJ.'},
    penyedia: {title:'RUP Penyedia', subtitle:'Porsi RUP melalui penyedia terhadap seluruh RUP yang diumumkan.'},
    'rup-tp': {title:'RUP e-Tendering + e-Purchasing', subtitle:'Porsi rencana pengadaan melalui e-Tendering dan e-Purchasing.'},
    'realisasi-tp': {title:'Realisasi e-Tendering + e-Purchasing', subtitle:'Nilai realisasi e-Tendering dan e-Purchasing terhadap RUP Penyedia.'},
    pl: {title:'Pengadaan Langsung Transaksional', subtitle:'Realisasi Pengadaan Langsung yang terekam pada Non Tender dan Pencatatan Non Tender.'},
    penunjukan: {title:'Penunjukan Langsung Transaksional', subtitle:'Realisasi Penunjukan Langsung yang terekam pada Non Tender dan Pencatatan Non Tender.'},
    digitalisasi: {title:'Digitalisasi PBJ', subtitle:'Realisasi yang terekam pada sistem pengadaan, termasuk e-Katalog, Toko Daring, Tender, Non Tender, Pencatatan Non Tender, dan Swakelola.'},
    kontrol: {title:'Kontrol Data ITKP', subtitle:'Pemeriksaan Kode RUP, sumber transaksi, dan selisih perhitungan.'}
  };

  const METRICS = {
    pengumuman: {
      label:'Pengumuman RUP', pct:'pctPengumuman', score:'scorePengumuman', maxScore:5,
      numerator:'totalRup', denominator:'totalBelanja', numLabel:'Nilai RUP Diumumkan', denLabel:'Total Belanja PBJ', targetKey:null, gapKey:null,
      thresholds:[['<50%',0],['50–<60%',1],['60–<70%',2],['70–<80%',3],['80–<90%',4],['90–<110%',5],['110–<150%',4],['≥150%',0]]
    },
    penyedia: {
      label:'RUP Penyedia', pct:'pctPenyedia', score:'scorePenyedia', maxScore:2.5,
      numerator:'rupPenyedia', denominator:'totalRup', numLabel:'RUP Penyedia', denLabel:'Total RUP Diumumkan', targetKey:'targetPenyedia', gapKey:'gapPenyedia',
      thresholds:[['<40%',0],['40–<50%',0.5],['50–<60%',1],['60–<70%',1.5],['70–<80%',2],['≥80%',2.5]]
    },
    'rup-tp': {
      label:'RUP e-Tendering + e-Purchasing', pct:'pctRupTp', score:'scoreRupTp', maxScore:2.5,
      numerator:'rupTp', denominator:'rupPenyedia', numLabel:'RUP e-Tendering + e-Purchasing', denLabel:'RUP Penyedia', targetKey:'targetRupTp', gapKey:'gapRupTp',
      thresholds:[['<20%',0],['20–<30%',0.5],['30–<40%',1],['40–<50%',1.5],['50–<60%',2],['≥60%',2.5]]
    },
    'realisasi-tp': {
      label:'Realisasi e-Tendering + e-Purchasing', pct:'pctRealTp', score:'scoreRealTp', maxScore:10,
      numerator:'realTp', denominator:'rupPenyedia', numLabel:'Realisasi e-Tendering + e-Purchasing', denLabel:'RUP Penyedia', targetKey:'targetRealTp', gapKey:'gapRealTp',
      thresholds:[['<20%',0],['20–<30%',2],['30–<40%',4],['40–<50%',6],['50–<60%',8],['≥60%',10]]
    },
    pl: {
      label:'Pengadaan Langsung Transaksional', pct:'pctPl', score:'scorePl', maxScore:2.5,
      numerator:'realPl', denominator:'rupPl', numLabel:'Realisasi PL Transaksional', denLabel:'RUP Pengadaan Langsung', targetKey:'targetPl', gapKey:'gapPl',
      thresholds:[['<10%',0],['10–<20%',0.5],['20–<30%',1],['30–<40%',1.5],['40–<50%',2],['≥50%',2.5]]
    },
    penunjukan: {
      label:'Penunjukan Langsung Transaksional', pct:'pctPenunjukan', score:'scorePenunjukan', maxScore:2.5,
      numerator:'realPenunjukan', denominator:'rupPenunjukan', numLabel:'Realisasi Penunjukan Transaksional', denLabel:'RUP Penunjukan Langsung', targetKey:'targetPenunjukan', gapKey:'gapPenunjukan',
      thresholds:[['<10%',0],['10–<20%',0.5],['20–<30%',1],['30–<40%',1.5],['40–<50%',2],['≥50%',2.5]]
    },
    digitalisasi: {
      label:'Digitalisasi PBJ', pct:'pctDigital', score:'scoreDigital', maxScore:5,
      numerator:'realDigital', denominator:'totalRup', numLabel:'Realisasi Digitalisasi PBJ', denLabel:'Total RUP Diumumkan', targetKey:'targetDigital', gapKey:'gapDigital',
      thresholds:[['<40%',0],['40–<50%',1],['50–<60%',2],['60–<70%',3],['70–<80%',4],['≥80%',5]]
    }
  };

  const DIGITAL_SOURCES = new Set(['E-Katalog Versi 6.0','Toko Daring','Tender','Non Tender','Pencatatan Non Tender','Swakelola']);
  window.__itkp74DataCache = window.__itkp74DataCache || {};

  window.__moduleInit = function({container, route}){
    const root = container.querySelector('.itkp74-page');
    if(!root) return null;

    const view = route?.itkpView || 'ringkasan';
    const state = {
      view,
      rekap:[], target:[], kontrol:[], tanpaRup:[], master:[], raw:[],
      targetByOpd:new Map(),
      selectedOpd:'', search:'', statusFilter:'', page:1, dataPage:1, doubleInputPage:1, doubleInputCollapsed:true, doubleInputModalOpen:false,
      detail:{opd:'',key:'',rows:[],loading:false,error:'',page:1,method:'',subKegiatan:'',status:'',search:''},
      destroyed:false,
      adminEdits:loadAdminEdits(), adminMode:Boolean(window.__sippbjIsAdmin?.())
    };

    const el = {
      title:root.querySelector('#itkp74PageTitle'), subtitle:root.querySelector('#itkp74PageSubtitle'),
      loading:root.querySelector('#itkp74Loading'), loadingTitle:root.querySelector('#itkp74LoadingTitle'), loadingText:root.querySelector('#itkp74LoadingText'), progress:root.querySelector('#itkp74ProgressBar'),
      error:root.querySelector('#itkp74Error'), content:root.querySelector('#itkp74Content'),
      opd:root.querySelector('#itkp74OpdFilter'), status:root.querySelector('#itkp74StatusFilter'), search:root.querySelector('#itkp74Search'),
      reset:root.querySelector('#itkp74Reset'), refresh:root.querySelector('#itkp74Refresh'), exportBtn:root.querySelector('#itkp74Export'), toolbar:root.querySelector('#itkp74Toolbar')
    };

    const listeners=[];
    function on(target,event,handler){if(!target)return;target.addEventListener(event,handler);listeners.push(()=>target.removeEventListener(event,handler));}
    on(window,'sippbj-admin-unlocked',()=>{state.adminMode=true;if(view==='kontrol')render();});
    on(window,'sippbj-admin-locked',()=>{state.adminMode=false;if(view==='kontrol')render();});
    on(document,'keydown',(e)=>{if(e.key==='Escape'&&state.doubleInputModalOpen){state.doubleInputModalOpen=false;render();}});

    const meta=VIEW_META[view]||VIEW_META.ringkasan;
    el.title.textContent=meta.title; el.subtitle.textContent=meta.subtitle;
    if(view==='kontrol') el.toolbar.style.display='none';

    on(el.opd,'change',()=>{state.selectedOpd=el.opd.value;state.page=1;clearDetail();render();});
    on(el.status,'change',()=>{state.statusFilter=el.status.value;state.page=1;clearDetail();render();});
    on(el.search,'input',()=>{state.search=el.search.value.trim().toLowerCase();state.page=1;render();});
    on(el.reset,'click',()=>{state.selectedOpd='';state.search='';state.statusFilter='';state.page=1;clearDetail();el.opd.value='';el.search.value='';el.status.value='';render();});
    on(el.refresh,'click',()=>init(true));
    on(el.exportBtn,'click',()=>exportCurrentView().catch(err=>alert(err.message||'Export XLSX gagal.')));

    init(false);

    return ()=>{state.destroyed=true;listeners.forEach(off=>off());};

    async function init(force){
      setError('');
      showLoading('Memuat data ITKP','Mengambil rekap perangkat daerah.',20);
      try{
        const baseSheets=[CFG.sheets.rekap,CFG.sheets.target];
        if(view==='ringkasan'||view==='kontrol') baseSheets.push(CFG.sheets.kontrol);
        if(view==='kontrol') baseSheets.push(CFG.sheets.tanpaRup,CFG.sheets.raw);
        const results=await Promise.all(baseSheets.map(sheet=>fetchSheet(sheet,force).then(rows=>({sheet,rows}))));
        if(state.destroyed)return;
        results.forEach(({sheet,rows})=>{
          if(sheet===CFG.sheets.rekap) state.rekap=normalizeRekap(rows);
          if(sheet===CFG.sheets.target) state.target=normalizeTarget(rows);
          if(sheet===CFG.sheets.kontrol) state.kontrol=normalizeControl(rows);
          if(sheet===CFG.sheets.tanpaRup) state.tanpaRup=normalizeTanpaRup(rows);
          if(sheet===CFG.sheets.raw) state.raw=normalizeRaw(rows);
        });
        applyAdminEditsToLoadedData();
        state.targetByOpd=new Map(state.target.map(r=>[r.opd,r]));
        buildOpdOptions();
        showLoading('Menyiapkan tampilan','Menyusun rekap dan target.',88);
        render();
        window.setTimeout(hideLoading,80);
      }catch(err){
        console.error(err);hideLoading();setError(`Data ITKP belum bisa dimuat. ${err.message}`);
      }
    }

    function render(){
      if(view==='ringkasan') return renderSummary();
      if(view==='kontrol') return renderControl();
      return renderIndicator(view);
    }

    function filteredRows(){
      return state.rekap.filter(row=>{
        if(state.selectedOpd&&row.opd!==state.selectedOpd)return false;
        if(state.search&&!row.opd.toLowerCase().includes(state.search))return false;
        if(state.statusFilter&&!rowMatchesStatus(row,state.statusFilter))return false;
        return true;
      });
    }

    function rowMatchesStatus(row,status){
      if(view==='ringkasan'){
        if(status==='MAX') return row.totalScore>=30;
        if(status==='NEED') return row.totalScore<30;
        if(status==='ZERO') return row.totalScore<=0;
        if(status==='NA') return false;
        return true;
      }
      const m=METRICS[view]; if(!m)return true;
      const den=metricDenominator(row,view);
      const score=num(row[m.score]);
      if(den<=0&&view==='penunjukan'){
        if(status==='NA') return false;
        if(status==='MAX') return true;
        if(status==='NEED'||status==='ZERO') return false;
        return true;
      }
      if(den<=0&&view==='pl'){
        if(status==='NA') return true;
        if(status==='MAX'||status==='NEED'||status==='ZERO') return false;
        return true;
      }
      if(status==='NA') return false;
      if(status==='MAX') return score>=m.maxScore;
      if(status==='NEED') return score<m.maxScore;
      if(status==='ZERO') return score<=0;
      return true;
    }

    function renderSummary(){
      const rows=filteredRows();
      const avg=rows.length?rows.reduce((a,b)=>a+b.totalScore,0)/rows.length:0;
      const full=rows.filter(r=>r.totalScore>=30).length;
      const low=rows.filter(r=>r.totalScore<15).length;
      const noRup=getControlValue('Transaksi Tanpa Kode RUP');
      const selected=state.selectedOpd?rows[0]:null;
      const pages=Math.max(1,Math.ceil(rows.length/CFG.tablePageSize));state.page=Math.min(state.page,pages);
      const start=(state.page-1)*CFG.tablePageSize;
      const pageRows=rows.slice(start,start+CFG.tablePageSize);

      el.content.innerHTML=`
        <div class="itkp74-stats">
          ${statCard('Perangkat Daerah',fmtInt(rows.length),'sesuai filter aktif','info')}
          ${statCard('Rata-rata Skor',fmtScore(avg)+' / 30','Pemanfaatan Sistem','info')}
          ${statCard('Skor 30',fmtInt(full),'sudah mencapai nilai penuh','good')}
          ${statCard('Skor di bawah 15',fmtInt(low),'perlu ditindaklanjuti','warn')}
          ${statCard('Tanpa Kode RUP',fmtInt(noRup),'transaksi perlu ditelusuri','bad')}
        </div>
        ${selected?renderSelectedAnalysis(selected):''}
        <section class="itkp74-panel itkp74-section-gap">
          <div class="itkp74-panel-head"><div><h3>Rekap Skor Perangkat Daerah</h3><p>Klik nama perangkat daerah untuk melihat rincian capaian dan langkah perbaikannya.</p></div></div>
          <div class="itkp74-table-wrap"><table class="itkp74-table">
            <thead><tr><th>No</th><th>Perangkat Daerah</th><th>Pengumuman</th><th>RUP Penyedia</th><th>RUP TP</th><th>Realisasi TP</th><th>PL</th><th>Penunjukan</th><th>Digitalisasi</th><th>Total</th></tr></thead>
            <tbody>${pageRows.length?pageRows.map((r,i)=>`<tr><td>${start+i+1}</td><td class="opd"><button class="itkp74-btn itkp74-btn-link" data-select-opd="${escAttr(r.opd)}">${esc(r.opd)}</button></td>${scoreTd(r.scorePengumuman,5)}${scoreTd(r.scorePenyedia,2.5)}${scoreTd(r.scoreRupTp,2.5)}${scoreTd(r.scoreRealTp,10)}${scoreTd(r.scorePl,2.5)}${scoreTd(r.scorePenunjukan,2.5)}${scoreTd(r.scoreDigital,5)}<td>${scorePill(r.totalScore,30)}</td></tr>`).join(''):`<tr><td colspan="10" class="itkp74-empty">Tidak ada data yang sesuai filter.</td></tr>`}</tbody>
          </table></div>
          ${paginationHtml(rows.length,state.page,pages)}
        </section>
        ${renderDetailPanel()}
      `;
      bindCommonContentEvents();
    }

    function renderSelectedAnalysis(row){
      const strategies=buildStrategies(row);
      return `<div class="itkp74-grid-2 itkp74-section-gap">
        <section class="itkp74-panel">
          <div class="itkp74-panel-head">
            <div><h3>${esc(row.opd)}</h3><p>Skor saat ini <strong>${fmtScore(row.totalScore)} dari 30</strong>. Nilai dan pagu tiap indikator ditampilkan di bawah.</p></div>
            <button class="itkp74-btn itkp74-btn-soft" type="button" data-show-packages="all" data-opd="${escAttr(row.opd)}">Lihat Semua Paket</button>
          </div>
          <div class="itkp74-indicator-grid">${Object.keys(METRICS).map(key=>indicatorCard(row,key)).join('')}</div>
        </section>
        <section class="itkp74-panel">
          <div class="itkp74-panel-head"><div><h3>Fokus Perbaikan</h3><p>Urutan berdasarkan potensi kenaikan nilai dan kebutuhan rupiah.</p></div></div>
          <div class="itkp74-strategy-list">${strategies.length?strategies.slice(0,6).map((s,i)=>strategyCard(s,i+1)).join(''):'<div class="itkp74-analysis-box"><strong>Belum ada target kenaikan terdekat.</strong> Pertahankan kualitas pencatatan dan cek transaksi yang belum memiliki Kode RUP.</div>'}</div>
        </section>
      </div>`;
    }

    function renderIndicator(key){
      const metric=METRICS[key];const rows=filteredRows();
      const valid=rows.filter(r=>metricDenominator(r,key)>0||key==='penunjukan');
      const avgPct=valid.length?valid.reduce((a,r)=>a+displayMetricPct(r,key),0)/valid.length:0;
      const avgScore=rows.length?rows.reduce((a,r)=>a+num(r[metric.score]),0)/rows.length:0;
      const maxCount=rows.filter(r=>num(r[metric.score])>=metric.maxScore).length;
      const zeroCount=rows.filter(r=>metricDenominator(r,key)>0&&num(r[metric.score])<=0).length;
      const naCount=rows.filter(r=>metricDenominator(r,key)<=0&&(key==='pl'||key==='penunjukan')).length;
      const needCount=rows.filter(r=>metricDenominator(r,key)>0&&num(r[metric.score])<metric.maxScore).length;
      const pages=Math.max(1,Math.ceil(rows.length/CFG.tablePageSize));state.page=Math.min(state.page,pages);
      const start=(state.page-1)*CFG.tablePageSize;const pageRows=rows.slice(start,start+CFG.tablePageSize);
      const selected=state.selectedOpd?rows[0]:null;

      el.content.innerHTML=`
        <div class="itkp74-stats">
          ${statCard('Perangkat Daerah',fmtInt(rows.length),'sesuai filter aktif','info')}
          ${statCard('Rata-rata Persentase',fmtPct(avgPct),'denominator tersedia','info')}
          ${statCard('Rata-rata Nilai',fmtScore(avgScore)+' / '+fmtScore(metric.maxScore),'indikator ini','info')}
          ${statCard('Nilai Maksimal',fmtInt(maxCount),'perangkat daerah','good')}
          ${statCard('Masih Bisa Naik',fmtInt(needCount),'belum mencapai nilai maksimal','warn')}
        </div>
        <div class="itkp74-insights">
          <div class="itkp74-insight-card good"><div class="itkp74-insight-label">Capai Nilai Maksimal</div><div class="itkp74-insight-value">${fmtInt(maxCount)} OPD</div><div class="itkp74-insight-note">Sudah berada pada rentang nilai tertinggi indikator ini.</div></div>
          <div class="itkp74-insight-card warn"><div class="itkp74-insight-label">Nilai Masih 0</div><div class="itkp74-insight-value">${fmtInt(zeroCount)} OPD</div><div class="itkp74-insight-note">Perlu dilihat paket dan transaksi yang belum tercatat.</div></div>
          <div class="itkp74-insight-card ${naCount?'warn':'good'}"><div class="itkp74-insight-label">Tidak Ada Denominator</div><div class="itkp74-insight-value">${fmtInt(naCount)} OPD</div><div class="itkp74-insight-note">Penunjukan tanpa RUP ditampilkan 100%. PL tanpa RUP tetap ditandai N/A.</div></div>
        </div>
        <section class="itkp74-panel itkp74-section-gap">
          <div class="itkp74-panel-head">
            <div><h3>Rekap ${esc(metric.label)} per Perangkat Daerah</h3><p>Nilai, persentase, target berikutnya, dan kebutuhan rupiah.</p></div>
          </div>
          <div class="itkp74-thresholds">${metric.thresholds.map(t=>`<div class="itkp74-threshold"><strong>${esc(t[0])}</strong><span>${fmtScore(t[1])} poin</span></div>`).join('')}</div>
          ${(key==='pl'||key==='penunjukan')?`<div class="itkp74-analysis-box itkp74-section-gap"><strong>Catatan perhitungan:</strong> nilai realisasi memakai transaksi <strong>Non Tender + Pencatatan Non Tender</strong>. Jika satu Kode RUP tercatat pada kedua sumber, paket ditandai <strong>DOUBEL INPUT</strong> agar segera dikoreksi.</div>`:''}
          ${selected?`<div class="itkp74-analysis-box itkp74-section-gap">${analysisForMetric(selected,key)}</div>`:''}
          <div class="itkp74-table-wrap itkp74-section-gap"><table class="itkp74-table">
            <thead><tr><th>No</th><th>Perangkat Daerah</th><th>${esc(metric.numLabel)}</th><th>${esc(metric.denLabel)}</th><th>Persentase</th><th>Nilai ITKP</th><th>Target Berikutnya</th><th>Kekurangan</th><th>Aksi</th></tr></thead>
            <tbody>${pageRows.length?pageRows.map((r,i)=>indicatorRow(r,key,start+i+1)).join(''):`<tr><td colspan="9" class="itkp74-empty">Tidak ada data.</td></tr>`}</tbody>
          </table></div>
          ${paginationHtml(rows.length,state.page,pages)}
        </section>
        ${renderDetailPanel()}
      `;
      bindCommonContentEvents();
    }

    function renderControl(){
      const corrections=adminCorrectionsMap();
      const without=state.tanpaRup.map(r=>({...r,kodeRup:corrections.get(adminCorrectionKey(r))||r.kodeRup||''}));
      const unresolved=without.filter(r=>!String(r.kodeRup||'').trim());
      const pages=Math.max(1,Math.ceil(without.length/CFG.detailPageSize));state.dataPage=Math.min(state.dataPage,pages);
      const start=(state.dataPage-1)*CFG.detailPageSize;const pageRows=without.slice(start,start+CFG.detailPageSize);
      const doubles=buildDoubleInputs();
      const doublePages=Math.max(1,Math.ceil(doubles.length/CFG.doubleInputPageSize));state.doubleInputPage=Math.min(state.doubleInputPage,doublePages);
      const doubleStart=(state.doubleInputPage-1)*CFG.doubleInputPageSize;
      const doubleRows=doubles.slice(doubleStart,doubleStart+CFG.doubleInputPageSize);
      const doubleControl={check:'DOUBEL INPUT Pengadaan Langsung',value:doubles.length,status:doubles.length?'PERLU CEK':'OK',note:'Kode RUP tercatat di Non Tender dan Pencatatan Non Tender sekaligus.'};
      const controlRows=[...state.kontrol,doubleControl];
      const bad=controlRows.filter(r=>/PERLU|SELISIH/i.test(String(r.status)));
      const adminPanel=state.adminMode?renderAdminPanel():`<div class="itkp74-admin-note"><strong></strong></div>`;
      el.content.innerHTML=`
        <div class="itkp74-control-grid">
          ${state.kontrol.slice(0,4).map(r=>`<div class="itkp74-control-card"><div class="label">${esc(r.check)}</div><div class="value">${controlValue(r)}</div><div class="note">${esc(r.note)}</div></div>`).join('')}
          <div class="itkp74-control-card danger itkp74-control-card-action"><div><div class="label">DOUBEL INPUT PL</div><div class="value">${fmtInt(doubles.length)}</div><div class="note">Kode RUP tercatat di Non Tender dan Pencatatan Non Tender.</div></div><button type="button" class="itkp74-btn itkp74-btn-mini" data-open-double-modal ${doubles.length?'':'disabled'}>Lihat Detail</button></div>
        </div>
        ${adminPanel}
        <section class="itkp74-panel itkp74-section-gap"><div class="itkp74-panel-head"><div><h3>Status Pemeriksaan</h3><p>${bad.length?`${bad.length} pemeriksaan masih perlu ditindaklanjuti.`:'Tidak ada selisih perhitungan yang terdeteksi.'}</p></div></div><div class="itkp74-table-wrap"><table class="itkp74-table"><thead><tr><th>Pemeriksaan</th><th>Hasil</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>${controlRows.map(r=>`<tr class="${r===doubleControl&&doubles.length?'row-danger':''}"><td class="strong">${esc(r.check)}</td><td>${controlValue(r)}</td><td>${statusBadge(r.status)}</td><td>${esc(r.note)}${r===doubleControl&&doubles.length?` <button type="button" class="itkp74-link-btn" data-open-double-modal>Lihat detail</button>`:''}</td></tr>`).join('')}</tbody></table></div></section>
        ${renderDoubleInputModal(doubles,doubleRows,doubleStart,doublePages)}
        <section class="itkp74-panel itkp74-section-gap"><div class="itkp74-panel-head"><div><h3>Transaksi Tanpa Kode RUP</h3><p>${fmtInt(unresolved.length)} transaksi masih belum memiliki Kode RUP.</p></div></div><div class="itkp74-table-wrap"><table class="itkp74-table"><thead><tr><th>No</th><th>Perangkat Daerah</th><th>Kode Paket</th><th>Kode RUP</th><th>Metode</th><th>Nama Paket</th><th>Nilai</th><th>Sumber Transaksi</th><th>Status</th>${state.adminMode?'<th>Aksi Admin</th>':''}</tr></thead><tbody>${pageRows.length?pageRows.map((r,i)=>`<tr class="${r.kodeRup?'row-success':'row-danger'}"><td>${start+i+1}</td><td class="opd">${esc(r.opd)}</td><td>${esc(r.kodePaket||'-')}</td><td>${esc(r.kodeRup||'-')}</td><td>${esc(r.metode||'-')}</td><td class="pkg-name">${esc(r.nama||'-')}</td><td class="num">${fmtRp(r.nilai)}</td><td>${esc(r.sumber||'-')}</td><td>${statusBadge(r.kodeRup?'KODE RUP DIISI ADMIN':(r.status||'PERLU CEK KODE RUP'))}</td>${state.adminMode?`<td><button class="itkp74-btn itkp74-btn-mini" data-admin-rup="${escAttr(adminCorrectionKey(r))}">${r.kodeRup?'Ubah':'Isi Kode RUP'}</button></td>`:''}</tr>`).join(''):`<tr><td colspan="${state.adminMode?10:9}" class="itkp74-empty">Tidak ada transaksi tanpa Kode RUP.</td></tr>`}</tbody></table></div>${dataPaginationHtml(without.length,state.dataPage,pages)}</section>
      `;
      bindCommonContentEvents();
      bindAdminEvents(without);
    }

    function renderDoubleInputModal(doubles,doubleRows,doubleStart,doublePages){
      if(!state.doubleInputModalOpen)return '';
      return `<div class="itkp74-modal-overlay" data-double-modal-overlay role="dialog" aria-modal="true" aria-label="DOUBEL INPUT Pengadaan Langsung">
        <div class="itkp74-modal-card">
          <div class="itkp74-modal-head">
            <div><div class="itkp74-modal-kicker">KONTROL DATA</div><h3>DOUBEL INPUT Pengadaan Langsung</h3><p>${fmtInt(doubles.length)} Kode RUP tercatat pada <strong>Non Tender</strong> dan <strong>Pencatatan Non Tender</strong> sekaligus.</p></div>
            <div class="itkp74-modal-head-actions">
              <button type="button" class="itkp74-btn itkp74-btn-primary itkp74-btn-mini" data-export-double-xlsx ${doubles.length?'':'disabled'}>Download XLSX</button>
              <button type="button" class="itkp74-modal-close" data-close-double-modal aria-label="Tutup">×</button>
            </div>
          </div>
          <div class="itkp74-modal-alert">Periksa sumber transaksi sebelum koreksi. Nilai dari dua sumber ditampilkan berdampingan agar mudah dibandingkan.</div>
          <div class="itkp74-table-wrap itkp74-modal-table"><table class="itkp74-table"><thead><tr><th>No</th><th>Perangkat Daerah</th><th>Kode RUP</th><th>Nama Paket</th><th>Non Tender</th><th>Pencatatan Non Tender</th><th>Total</th><th>Status</th></tr></thead><tbody>${doubleRows.length?doubleRows.map((r,i)=>`<tr class="row-danger"><td>${doubleStart+i+1}</td><td class="opd">${esc(r.opd)}</td><td>${esc(r.kodeRup)}</td><td class="pkg-name">${esc(r.nama||'-')}</td><td class="num">${fmtRp(r.nonTender)}</td><td class="num">${fmtRp(r.pencatatan)}</td><td class="num strong">${fmtRp(r.total)}</td><td>${statusBadge('DOUBEL INPUT')}</td></tr>`).join(''):`<tr><td colspan="8" class="itkp74-empty">Tidak ada dobel input Pengadaan Langsung.</td></tr>`}</tbody></table></div>
          ${doublePaginationHtml(doubles.length,state.doubleInputPage,doublePages)}
        </div>
      </div>`;
    }

    function buildDoubleInputs(){
      const groups=new Map();
      state.raw.filter(r=>r.metode==='Pengadaan Langsung'&&r.kodeRup&&['Non Tender','Pencatatan Non Tender'].includes(r.sumber)).forEach(r=>{
        const k=`${r.opd}|${r.kodeRup}`;
        if(!groups.has(k))groups.set(k,{opd:r.opd,kodeRup:r.kodeRup,nama:r.nama||'',nonTender:0,pencatatan:0});
        const g=groups.get(k);if(r.sumber==='Non Tender')g.nonTender+=r.nilai;if(r.sumber==='Pencatatan Non Tender')g.pencatatan+=r.nilai;if(!g.nama&&r.nama)g.nama=r.nama;
      });
      return [...groups.values()].filter(r=>r.nonTender>0&&r.pencatatan>0).map(r=>({...r,total:r.nonTender+r.pencatatan})).sort((a,b)=>b.total-a.total);
    }

    function renderAdminPanel(){
      const entries=state.adminEdits.manual||[];
      return `<section class="itkp74-panel itkp74-admin-panel itkp74-section-gap"><div class="itkp74-panel-head"><div><h3>Koreksi Admin</h3><p>Tambahkan realisasi manual atau koreksi Kode RUP. Perubahan manual tersimpan pada browser admin ini.</p></div><div class="itkp74-admin-actions"><span class="itkp74-admin-badge">ADMIN</span><button type="button" class="itkp74-admin-logout" data-admin-logout>Keluar</button></div></div>
        <form class="itkp74-admin-form" id="itkp74ManualForm">
          <label class="itkp74-field"><span>Perangkat Daerah</span><select name="opd" required><option value="">Pilih Perangkat Daerah</option>${state.rekap.map(r=>`<option value="${escAttr(r.opd)}">${esc(r.opd)}</option>`).join('')}</select></label>
          <label class="itkp74-field"><span>Kode RUP</span><input name="kodeRup" inputmode="numeric" placeholder="Kode RUP"></label>
          <label class="itkp74-field"><span>Nama Paket</span><input name="nama" placeholder="Nama paket" required></label>
          <label class="itkp74-field"><span>Metode</span><select name="metode" required><option value="Pengadaan Langsung">Pengadaan Langsung</option><option value="Penunjukan Langsung">Penunjukan Langsung</option><option value="E-Purchasing">E-Purchasing</option><option value="Tender">Tender</option><option value="Seleksi">Seleksi</option><option value="Swakelola">Swakelola</option></select></label>
          <label class="itkp74-field"><span>Sumber Transaksi</span><select name="sumber" required><option value="Non Tender">Non Tender</option><option value="Pencatatan Non Tender">Pencatatan Non Tender</option><option value="E-Katalog Versi 6.0">E-Katalog Versi 6.0</option><option value="Toko Daring">Toko Daring</option><option value="Tender">Tender</option><option value="Swakelola">Swakelola</option></select></label>
          <label class="itkp74-field"><span>Nilai Realisasi</span><input name="nilai" type="number" min="0" step="1" placeholder="0" required></label>
          <label class="itkp74-field admin-note-field"><span>Catatan</span><input name="catatan" placeholder="Keterangan koreksi"></label>
          <button class="itkp74-btn itkp74-btn-primary" type="submit">Simpan Realisasi Manual</button>
        </form>
        ${entries.length?`<div class="itkp74-admin-list"><strong>Input manual tersimpan: ${fmtInt(entries.length)}</strong><button class="itkp74-btn itkp74-btn-soft" type="button" data-admin-clear-manual>Hapus Semua Input Manual</button></div>`:''}
      </section>`;
    }

    function bindAdminEvents(withoutRows){
      if(!state.adminMode)return;
      root.querySelectorAll('[data-admin-rup]').forEach(btn=>btn.addEventListener('click',()=>{
        const key=btn.dataset.adminRup;const row=withoutRows.find(r=>adminCorrectionKey(r)===key);if(!row)return;
        const current=adminCorrectionsMap().get(key)||'';const kode=window.prompt(`Kode RUP untuk ${row.nama||row.kodePaket||row.opd}`,current);if(kode===null)return;
        const cleaned=String(kode).trim();if(!cleaned)return alert('Kode RUP belum diisi.');
        state.adminEdits.rupCorrections=state.adminEdits.rupCorrections||{};state.adminEdits.rupCorrections[key]=cleaned;saveAdminEdits();render();
      }));
      const form=root.querySelector('#itkp74ManualForm');if(form)form.addEventListener('submit',(e)=>{
        e.preventDefault();const fd=new FormData(form);const item={id:`ADM-${Date.now()}`,time:new Date().toISOString(),opd:String(fd.get('opd')||''),kodeRup:String(fd.get('kodeRup')||'').trim(),nama:String(fd.get('nama')||'').trim(),metode:String(fd.get('metode')||''),sumber:String(fd.get('sumber')||''),nilai:num(fd.get('nilai')),catatan:String(fd.get('catatan')||'').trim()};
        if(!item.opd||!item.nama||!item.metode||!item.sumber||item.nilai<=0)return alert('Lengkapi data realisasi manual.');
        state.adminEdits.manual=state.adminEdits.manual||[];state.adminEdits.manual.push(item);saveAdminEdits();window.location.reload();
      });
      root.querySelector('[data-admin-clear-manual]')?.addEventListener('click',()=>{if(!confirm('Hapus seluruh input realisasi manual pada browser ini?'))return;state.adminEdits.manual=[];saveAdminEdits();window.location.reload();});
      root.querySelector('[data-admin-logout]')?.addEventListener('click',()=>{
        if(!confirm('Keluar dari mode admin?'))return;
        if(typeof window.__sippbjAdminLogout==='function') window.__sippbjAdminLogout();
        else { sessionStorage.removeItem('sippbj_internal_menu_unlocked'); window.dispatchEvent(new CustomEvent('sippbj-admin-locked')); }
      });
    }

    function adminCorrectionKey(r){return `${r.opd}|${r.kodePaket||''}|${r.nama||''}`;}
    function adminCorrectionsMap(){return new Map(Object.entries(state.adminEdits.rupCorrections||{}));}
    function saveAdminEdits(){localStorage.setItem(CFG.adminStorageKey,JSON.stringify(state.adminEdits));}
    function applyAdminEditsToLoadedData(){
      const corr=adminCorrectionsMap();
      if(state.raw.length)state.raw.forEach(r=>{const k=adminCorrectionKey(r);if(!r.kodeRup&&corr.has(k))r.kodeRup=corr.get(k);});
      const manual=state.adminEdits.manual||[];if(!manual.length)return;
      if(state.raw.length&&state.adminMode){manual.forEach(x=>{if(!state.raw.some(r=>r.manual&&r.kodePaket===x.id))state.raw.push({opd:x.opd,kodeRup:x.kodeRup||'',kodePaket:x.id,jenis:'Input Admin',metode:x.metode,nama:x.nama,penyedia:'-',statusPaket:'INPUT MANUAL',nilai:num(x.nilai),sumber:x.sumber,manual:true});});}
      const byOpd=new Map(state.rekap.map(r=>[r.opd,r]));
      manual.forEach(x=>{const r=byOpd.get(x.opd);if(!r)return;const v=num(x.nilai);r.realDigital+=v;if(['E-Katalog Versi 6.0','Toko Daring','Tender'].includes(x.sumber))r.realTp+=v;if(x.metode==='Pengadaan Langsung'&&['Non Tender','Pencatatan Non Tender'].includes(x.sumber))r.realPl+=v;if(x.metode==='Penunjukan Langsung'&&['Non Tender','Pencatatan Non Tender'].includes(x.sumber))r.realPenunjukan+=v;if(x.sumber==='Pencatatan Non Tender')r.pencatatanNt+=v;if(x.sumber==='Swakelola')r.swakelola+=v;if(x.sumber==='Toko Daring'){r.tokoDaring+=v;r.jumlahToko+=1;}});
      state.rekap.forEach(recalcRekapRow);
    }

    function recalcRekapRow(r){
      r.pctRealTp=r.rupPenyedia>0?r.realTp/r.rupPenyedia:0;r.pctPl=r.rupPl>0?r.realPl/r.rupPl:1;r.pctPenunjukan=r.rupPenunjukan>0?r.realPenunjukan/r.rupPenunjukan:1;r.pctDigital=r.totalRup>0?r.realDigital/r.totalRup:0;
      r.scoreRealTp=scoreForPct('realisasi-tp',r.pctRealTp);r.scorePl=scoreForPct('pl',r.pctPl);r.scorePenunjukan=scoreForPct('penunjukan',r.pctPenunjukan);r.scoreDigital=scoreForPct('digitalisasi',r.pctDigital);r.totalScore=r.scorePengumuman+r.scorePenyedia+r.scoreRupTp+r.scoreRealTp+r.scorePl+r.scorePenunjukan+r.scoreDigital;
    }

    function indicatorCard(row,key){
      const m=METRICS[key];const den=metricDenominator(row,key);const rawPct=metricPct(row,key);const pct=(key==='penunjukan'&&den<=0)?1:rawPct;const target=targetFor(row,key);
      const targetText=den<=0&&key==='pl'?'Tidak ada RUP metode ini':den<=0&&key==='penunjukan'?'Tidak ada RUP metode ini • ditampilkan 100%':target.label;
      const displayPct=den>0||key==='penunjukan'?fmtPct(pct):'N/A';
      const tone=metricTone(key,pct,num(row[m.score]),m.maxScore,den);
      return `<div class="itkp74-indicator-card ${key==='realisasi-tp'?'primary ':''}tone-${tone}"><div class="itkp74-indicator-top"><div class="itkp74-indicator-name">${esc(m.label)}</div><div class="itkp74-indicator-score">${fmtScore(row[m.score])} / ${fmtScore(m.maxScore)}</div></div><div class="itkp74-indicator-value"><span class="itkp74-percent-pill ${tone}">${displayPct}</span></div><div class="itkp74-indicator-meta">${fmtRp(num(row[m.numerator]))} dari ${fmtRp(den)}</div><div class="itkp74-indicator-action"><span>${esc(targetText)}${target.gap>0?` • kurang ${fmtRp(target.gap)}`:''}</span><button class="itkp74-btn itkp74-btn-mini" type="button" data-show-packages="${escAttr(key)}" data-opd="${escAttr(row.opd)}">Lihat Paket</button></div></div>`;
    }

    function indicatorRow(row,key,no){
      const m=METRICS[key];const den=metricDenominator(row,key);const target=targetFor(row,key);const pct=(key==='penunjukan'&&den<=0)?1:metricPct(row,key);
      const pctCell=(den>0||key==='penunjukan')?pctBadge(pct):statusBadge('N/A');
      return `<tr><td>${no}</td><td class="opd"><button class="itkp74-btn itkp74-btn-link" data-select-opd="${escAttr(row.opd)}">${esc(row.opd)}</button></td><td class="num strong">${fmtRp(num(row[m.numerator]))}</td><td class="num">${fmtRp(den)}</td><td>${pctCell}</td><td>${scorePill(num(row[m.score]),m.maxScore)}</td><td>${esc(target.label)}</td><td class="num strong">${target.gap>0?fmtRp(target.gap):'-'}</td><td><button class="itkp74-btn itkp74-btn-link" data-show-packages="${escAttr(key)}" data-opd="${escAttr(row.opd)}">Lihat Paket</button></td></tr>`;
    }

    function renderDetailPanel(){
      const d=state.detail;if(!d.opd)return '';
      if(d.loading) return `<section class="itkp74-panel itkp74-section-gap" id="itkp74DetailPanel"><div class="itkp74-panel-head"><div><h3>Detail Paket - ${esc(d.opd)}</h3><p>Menyiapkan daftar paket.</p></div><button class="itkp74-btn itkp74-btn-soft" data-close-detail>Tutup Detail</button></div><div class="itkp74-detail-loading">Memuat detail paket...</div></section>`;
      if(d.error) return `<section class="itkp74-panel itkp74-section-gap" id="itkp74DetailPanel"><div class="itkp74-panel-head"><div><h3>Detail Paket - ${esc(d.opd)}</h3><p>Detail paket belum dapat ditampilkan.</p></div><button class="itkp74-btn itkp74-btn-soft" data-close-detail>Tutup Detail</button></div><div class="itkp74-error">${esc(d.error)}</div></section>`;
      const rows=filteredDetailRows();
      const methods=[...new Set(d.rows.map(r=>r.method).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'id'));
      const subKegiatanList=[...new Set(d.rows.map(r=>r.subKegiatan).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'id'));
      const isNtMetric=d.key==='pl'||d.key==='penunjukan';
      const showNtBreakdown=isNtMetric||(d.key==='all'&&['Pengadaan Langsung','Penunjukan Langsung'].includes(d.method));
      const totalPagu=rows.reduce((a,r)=>a+num(r.pagu),0), totalReal=rows.reduce((a,r)=>a+num(r.realisasi),0), totalSisa=rows.reduce((a,r)=>a+num(r.sisa),0);
      const totalTrans=rows.reduce((a,r)=>a+num(r.realisasiTransaksional),0), totalPenc=rows.reduce((a,r)=>a+num(r.realisasiPencatatan),0);
      const pages=Math.max(1,Math.ceil(rows.length/CFG.detailPageSize));d.page=Math.min(d.page,pages);const start=(d.page-1)*CFG.detailPageSize;const pageRows=rows.slice(start,start+CFG.detailPageSize);
      const metricLabel=d.key==='all'?'Semua Paket':METRICS[d.key]?.label||'Paket';
      const transLabel='Non Tender';
      const summary=showNtBreakdown
        ? `<div class="itkp74-detail-summary nt"><div class="itkp74-detail-mini"><span>Jumlah Paket / Transaksi</span><strong>${fmtInt(rows.length)}</strong></div><div class="itkp74-detail-mini"><span>Total Pagu RUP</span><strong>${fmtRp(totalPagu)}</strong></div><div class="itkp74-detail-mini"><span>${esc(transLabel)}</span><strong>${fmtRp(totalTrans)}</strong></div><div class="itkp74-detail-mini"><span>Pencatatan Non Tender</span><strong>${fmtRp(totalPenc)}</strong></div><div class="itkp74-detail-mini"><span>Total Realisasi</span><strong>${fmtRp(totalReal)}</strong></div></div>`
        : `<div class="itkp74-detail-summary"><div class="itkp74-detail-mini"><span>Jumlah Paket / Transaksi</span><strong>${fmtInt(rows.length)}</strong></div><div class="itkp74-detail-mini"><span>Total Pagu RUP</span><strong>${fmtRp(totalPagu)}</strong></div><div class="itkp74-detail-mini"><span>Total Terekam</span><strong>${fmtRp(totalReal)}</strong></div><div class="itkp74-detail-mini"><span>Sisa Pagu</span><strong>${fmtRp(totalSisa)}</strong></div></div>`;
      const statusOptions=isNtMetric
        ? `<option value="DONE" ${d.status==='DONE'?'selected':''}>Sudah Tercatat</option><option value="DOUBLE" ${d.status==='DOUBLE'?'selected':''}>DOUBEL INPUT</option><option value="TODO" ${d.status==='TODO'?'selected':''}>Belum Tercatat</option><option value="NO_RUP" ${d.status==='NO_RUP'?'selected':''}>Tanpa Kode RUP</option><option value="SISA" ${d.status==='SISA'?'selected':''}>Masih Ada Sisa Pagu</option>`
        : `<option value="DONE" ${d.status==='DONE'?'selected':''}>Sudah Tercatat</option><option value="DOUBLE" ${d.status==='DOUBLE'?'selected':''}>DOUBEL INPUT</option><option value="TODO" ${d.status==='TODO'?'selected':''}>Belum Tercatat</option><option value="NO_RUP" ${d.status==='NO_RUP'?'selected':''}>Tanpa Kode RUP</option><option value="SISA" ${d.status==='SISA'?'selected':''}>Masih Ada Sisa Pagu</option>`;
      const tableHead=isNtMetric
        ? `<tr><th>No</th><th>Kode RUP</th><th>Kode Paket</th><th>Nama Paket</th><th>Program / Kegiatan / Sub Kegiatan</th><th>Metode</th><th>Pagu RUP</th><th>Non Tender</th><th>Pencatatan Non Tender</th><th>Total Realisasi</th><th>Sisa</th><th>Status</th></tr>`
        : `<tr><th>No</th><th>Kode RUP</th><th>Kode Paket</th><th>Nama Paket</th><th>Program / Kegiatan / Sub Kegiatan</th><th>Metode</th><th>Sumber Transaksi</th><th>Pagu RUP</th><th>Realisasi</th><th>Sisa</th><th>Status</th></tr>`;
      const colspan=isNtMetric?12:11;
      return `<section class="itkp74-panel itkp74-section-gap" id="itkp74DetailPanel">
        <div class="itkp74-panel-head"><div><h3>Detail Paket - ${esc(d.opd)}</h3><p>${esc(metricLabel)} • ${fmtInt(rows.length)} paket/transaksi sesuai filter.</p></div><div class="itkp74-panel-actions"><button class="itkp74-btn itkp74-btn-soft" data-close-detail>Tutup Detail</button><button class="itkp74-btn itkp74-btn-primary" data-export-detail>Export Detail XLSX</button></div></div>
        ${isNtMetric?`<div class="itkp74-analysis-box"><strong>Realisasi indikator</strong> merupakan total <strong>Non Tender + Pencatatan Non Tender</strong>. Jika keduanya tercatat pada Kode RUP yang sama, status menjadi <strong>DOUBEL INPUT</strong> dan baris ditandai merah.</div>`:''}
        ${d.key==='all'?`<div class="itkp74-analysis-box"><strong>Catatan:</strong> Detail semua paket menampilkan seluruh nilai yang terekam. Pilih metode <strong>Pengadaan Langsung</strong> atau <strong>Penunjukan Langsung</strong> untuk melihat pemisahan realisasi transaksional dan pencatatan.</div>`:''}
        ${summary}
        <div class="itkp74-detail-filter">
          <label class="itkp74-field"><span>Metode</span><select id="itkp74DetailMethod"><option value="">Semua Metode</option>${methods.map(v=>`<option value="${escAttr(v)}" ${d.method===v?'selected':''}>${esc(v)}</option>`).join('')}</select></label>
          <label class="itkp74-field"><span>Sub Kegiatan</span><select id="itkp74DetailSubKegiatan"><option value="">Semua Sub Kegiatan</option>${subKegiatanList.map(v=>`<option value="${escAttr(v)}" ${d.subKegiatan===v?'selected':''}>${esc(v)}</option>`).join('')}</select></label>
          <label class="itkp74-field"><span>Status Realisasi</span><select id="itkp74DetailStatus"><option value="">Semua Status</option>${statusOptions}</select></label>
          <label class="itkp74-field"><span>Cari Paket / Kode RUP / Program / Kegiatan</span><input id="itkp74DetailSearch" value="${escAttr(d.search)}" placeholder="Ketik paket, kode RUP, program, kegiatan..."></label>
          <button class="itkp74-btn itkp74-btn-soft" data-reset-detail>Reset</button>
        </div>
        <div class="itkp74-table-wrap"><table class="itkp74-table"><thead>${tableHead}</thead><tbody>${pageRows.length?pageRows.map((r,i)=>detailRowHtml(r,start+i+1,d.key)).join(''):`<tr><td colspan="${colspan}" class="itkp74-empty">Tidak ada paket yang sesuai filter detail.</td></tr>`}</tbody></table></div>
        ${detailPaginationHtml(rows.length,d.page,pages)}
      </section>`;
    }

    function planningPathHtml(r){
      if(!r.program&&!r.kegiatan&&!r.subKegiatan)return '<span class="itkp74-muted">-</span>';
      return `<div class="itkp74-planning-path">${r.program?`<div><span>Program</span><strong>${esc(r.program)}</strong></div>`:''}${r.kegiatan?`<div><span>Kegiatan</span><strong>${esc(r.kegiatan)}</strong></div>`:''}${r.subKegiatan?`<div><span>Sub Kegiatan</span><strong>${esc(r.subKegiatan)}</strong></div>`:''}</div>`;
    }

    function detailRowHtml(r,no,key){
      const isNtMetric=key==='pl'||key==='penunjukan';
      if(isNtMetric){
        const trans=num(r.realisasiTransaksional),penc=num(r.realisasiPencatatan),double=(num(r.sourceCount)>1)||(trans>0&&penc>0);
        const rowClass=!r.kodeRup?'row-danger':double?'row-danger':(trans>0||penc>0)?'row-success':'row-warning';
        const status=!r.kodeRup?'PERLU CEK KODE RUP':double?'DOUBEL INPUT':(trans>0||penc>0)?'SUDAH TERCATAT':'BELUM TERCATAT';
        return `<tr class="${rowClass}"><td>${no}</td><td>${esc(r.kodeRup||'-')}</td><td>${esc(r.kodePaket||'-')}</td><td class="pkg-name">${esc(r.name||'-')}</td><td class="planning-cell">${planningPathHtml(r)}</td><td>${esc(r.method||'-')}</td><td class="num">${r.pagu>0?fmtRp(r.pagu):'-'}</td><td class="num strong">${fmtRp(trans)}</td><td class="num">${fmtRp(penc)}</td><td class="num strong">${fmtRp(r.realisasi)}</td><td class="num">${r.pagu>0?fmtRp(r.sisa):'-'}</td><td>${statusBadge(status)}</td></tr>`;
      }
      const double=num(r.sourceCount)>1;
      const rowClass=!r.kodeRup?'row-danger':double?'row-danger':r.realisasi<=0?'row-warning':r.sisa<=0&&r.pagu>0?'row-success':'';
      const status=!r.kodeRup?'PERLU CEK KODE RUP':double?'DOUBEL INPUT':r.realisasi>0?'SUDAH TERCATAT':'BELUM TERCATAT';
      return `<tr class="${rowClass}"><td>${no}</td><td>${esc(r.kodeRup||'-')}</td><td>${esc(r.kodePaket||'-')}</td><td class="pkg-name">${esc(r.name||'-')}</td><td class="planning-cell">${planningPathHtml(r)}</td><td>${esc(r.method||'-')}</td><td>${esc(r.source||'-')}</td><td class="num">${r.pagu>0?fmtRp(r.pagu):'-'}</td><td class="num strong">${fmtRp(r.realisasi)}</td><td class="num">${r.pagu>0?fmtRp(r.sisa):'-'}</td><td>${statusBadge(status)}</td></tr>`;
    }

    function filteredDetailRows(){
      const d=state.detail;const q=d.search.trim().toLowerCase();const isNtMetric=d.key==='pl'||d.key==='penunjukan';
      return d.rows.filter(r=>{
        if(d.method&&r.method!==d.method)return false;
        if(d.subKegiatan&&r.subKegiatan!==d.subKegiatan)return false;
        if(isNtMetric){
          const trans=num(r.realisasiTransaksional),penc=num(r.realisasiPencatatan),double=(num(r.sourceCount)>1)||(trans>0&&penc>0);
          if(d.status==='DONE'&&(!(trans>0||penc>0)||double))return false;
          if(d.status==='DOUBLE'&&!double)return false;
          if(d.status==='TODO'&&!(trans<=0&&penc<=0))return false;
        }else{
          const double=num(r.sourceCount)>1;
          if(d.status==='DONE'&&(r.realisasi<=0||double))return false;
          if(d.status==='DOUBLE'&&!double)return false;
          if(d.status==='TODO'&&r.realisasi>0)return false;
        }
        if(d.status==='NO_RUP'&&r.kodeRup)return false;
        if(d.status==='SISA'&&!(r.sisa>0))return false;
        if(q){const hay=`${r.kodeRup} ${r.kodePaket} ${r.name} ${r.program} ${r.kegiatan} ${r.subKegiatan} ${r.method} ${r.source}`.toLowerCase();if(!hay.includes(q))return false;}
        return true;
      });
    }

    async function openPackages(opd,key){
      if(!opd)return;
      state.detail={opd,key:key||'all',rows:[],loading:true,error:'',page:1,method:'',subKegiatan:'',status:'',search:''};
      render();scrollDetailSoon();
      try{
        const rows=await buildDetailRows(opd,key||'all');
        if(state.destroyed)return;
        state.detail.rows=rows;state.detail.loading=false;render();scrollDetailSoon();
      }catch(err){
        console.error(err);state.detail.loading=false;state.detail.error=`Detail paket gagal dimuat. ${err.message}`;render();scrollDetailSoon();
      }
    }

    async function buildDetailRows(opd,key){
      const planningOnly=['pengumuman','penyedia','rup-tp'].includes(key);
      const isNtMetric=key==='pl'||key==='penunjukan';
      const master=await ensureMaster();
      const masterRows=master.filter(r=>r.opd===opd&&packageMatchesMetric(r,key));
      if(planningOnly){
        return masterRows.map(r=>({kodeRup:r.kodeRup,kodePaket:'',name:r.nama,program:r.program,kegiatan:r.kegiatan,subKegiatan:r.subKegiatan,method:r.metode,source:'RUP',sourceCount:0,pagu:r.pagu,realisasi:r.realisasi,realisasiTransaksional:0,realisasiPencatatan:0,sisa:Math.max(0,r.pagu-r.realisasi)})).sort((a,b)=>b.sisa-a.sisa||b.pagu-a.pagu);
      }
      const raw=await ensureRaw();
      const relRaw=raw.filter(r=>r.opd===opd&&rawMatchesMetric(r,key));
      const masterByKode=new Map(masterRows.filter(r=>r.kodeRup).map(r=>[String(r.kodeRup),r]));
      const grouped=new Map();
      relRaw.forEach((r,idx)=>{
        const k=r.kodeRup?`RUP:${r.kodeRup}`:`NO_RUP:${r.kodePaket||idx}:${idx}`;
        if(!grouped.has(k)) grouped.set(k,{kodeRup:r.kodeRup||'',kodePaket:r.kodePaket||'',name:r.nama||'',method:r.metode||'',source:new Set(),realisasi:0,realisasiTransaksional:0,realisasiPencatatan:0,status:new Set()});
        const g=grouped.get(k);
        g.realisasi+=r.nilai;
        if(r.sumber==='Non Tender')g.realisasiTransaksional+=r.nilai;
        if(r.sumber==='Pencatatan Non Tender')g.realisasiPencatatan+=r.nilai;
        g.source.add(r.sumber||'-');if(r.statusPaket)g.status.add(r.statusPaket);if(!g.name&&r.nama)g.name=r.nama;if(!g.method&&r.metode)g.method=r.metode;
      });
      const out=[];
      grouped.forEach(g=>{
        const m=g.kodeRup?masterByKode.get(String(g.kodeRup)):null;
        const pagu=m?m.pagu:0;
        out.push({kodeRup:g.kodeRup,kodePaket:g.kodePaket,name:g.name||(m?m.nama:''),program:m?m.program:'',kegiatan:m?m.kegiatan:'',subKegiatan:m?m.subKegiatan:'',method:g.method||(m?m.metode:''),source:[...g.source].join(', '),sourceCount:g.source.size,pagu,realisasi:g.realisasi,realisasiTransaksional:g.realisasiTransaksional,realisasiPencatatan:g.realisasiPencatatan,sisa:pagu>0?Math.max(0,pagu-g.realisasi):0});
      });
      const hasCode=new Set(out.filter(r=>r.kodeRup).map(r=>String(r.kodeRup)));
      masterRows.forEach(m=>{
        if(m.kodeRup&&!hasCode.has(String(m.kodeRup))) out.push({kodeRup:m.kodeRup,kodePaket:'',name:m.nama,program:m.program,kegiatan:m.kegiatan,subKegiatan:m.subKegiatan,method:m.metode,source:'-',sourceCount:0,pagu:m.pagu,realisasi:0,realisasiTransaksional:0,realisasiPencatatan:0,sisa:m.pagu});
      });
      return out.sort((a,b)=>{
        if(Boolean(a.kodeRup)!==Boolean(b.kodeRup)) return a.kodeRup?-1:1;
        if(isNtMetric){
          const aState=a.realisasiTransaksional>0?2:a.realisasiPencatatan>0?1:0;
          const bState=b.realisasiTransaksional>0?2:b.realisasiPencatatan>0?1:0;
          if(aState!==bState)return aState-bState;
        }else if((a.realisasi<=0)!==(b.realisasi<=0)) return a.realisasi<=0?-1:1;
        return b.sisa-a.sisa||b.realisasi-a.realisasi;
      });
    }

    async function ensureMaster(){if(state.master.length)return state.master;const rows=await fetchSheet(CFG.sheets.master,false);state.master=normalizeMaster(rows);return state.master;}
    async function ensureRaw(){if(state.raw.length)return state.raw;const rows=await fetchSheet(CFG.sheets.raw,false);state.raw=normalizeRaw(rows);const corr=adminCorrectionsMap();state.raw.forEach(r=>{const k=adminCorrectionKey(r);if(!r.kodeRup&&corr.has(k))r.kodeRup=corr.get(k);});if(state.adminMode){(state.adminEdits.manual||[]).forEach(x=>state.raw.push({opd:x.opd,kodeRup:x.kodeRup||'',kodePaket:x.id,jenis:'Input Admin',metode:x.metode,nama:x.nama,penyedia:'-',statusPaket:'INPUT MANUAL',nilai:num(x.nilai),sumber:x.sumber,manual:true}));}return state.raw;}

    function packageMatchesMetric(r,key){
      const m=(r.metode||'').toLowerCase(), jenis=(r.jenis||'').toLowerCase();
      if(key==='all'||key==='pengumuman'||key==='digitalisasi')return true;
      if(key==='penyedia')return jenis==='penyedia';
      if(key==='rup-tp'||key==='realisasi-tp')return ['e-purchasing','tender','seleksi'].includes(m);
      if(key==='pl')return m==='pengadaan langsung';
      if(key==='penunjukan')return m==='penunjukan langsung';
      return true;
    }

    function rawMatchesMetric(r,key){
      if(key==='realisasi-tp') return ['E-Katalog Versi 6.0','Toko Daring','Tender'].includes(r.sumber);
      if(key==='pl') return r.metode==='Pengadaan Langsung'&&['Non Tender','Pencatatan Non Tender'].includes(r.sumber);
      if(key==='penunjukan') return r.metode==='Penunjukan Langsung'&&['Non Tender','Pencatatan Non Tender'].includes(r.sumber);
      if(key==='digitalisasi') return DIGITAL_SOURCES.has(r.sumber);
      return true;
    }

    function clearDetail(){state.detail={opd:'',key:'',rows:[],loading:false,error:'',page:1,method:'',subKegiatan:'',status:'',search:''};}
    function scrollDetailSoon(){window.setTimeout(()=>root.querySelector('#itkp74DetailPanel')?.scrollIntoView({behavior:'smooth',block:'start'}),50);}

    function buildStrategies(row){
      const items=[];
      Object.keys(METRICS).forEach(key=>{
        const m=METRICS[key],den=metricDenominator(row,key);
        if(den<=0&&(key==='pl'||key==='penunjukan'))return;
        const current=num(row[m.score]),target=targetFor(row,key);if(target.isMax)return;
        const nextScore=scoreForPct(key,target.pct),gain=Math.max(0,nextScore-current);if(gain<=0&&key!=='pengumuman')return;
        items.push({key,label:m.label,gain,gap:target.gap,desc:strategyText(row,key,target,nextScore)});
      });
      return items.sort((a,b)=>b.gain-a.gain||(a.gap||0)-(b.gap||0));
    }

    function strategyCard(item,rank){return `<div class="itkp74-strategy-card"><div class="itkp74-strategy-rank">${rank}</div><div><h4>${esc(item.label)}</h4><p>${esc(item.desc)}</p></div><div class="itkp74-strategy-gain"><strong>${item.gain>0?'+'+fmtScore(item.gain)+' poin':'Cek data'}</strong>${item.gap>0?`<span>${fmtRp(item.gap)}</span>`:''}</div></div>`;}

    function analysisForMetric(row,key){
      const m=METRICS[key],den=metricDenominator(row,key),pct=metricPct(row,key),target=targetFor(row,key),score=num(row[m.score]);
      if(den<=0&&key==='penunjukan') return `<strong>${esc(row.opd)}</strong>: tidak ada RUP Penunjukan Langsung. Persentase ditampilkan <strong>100%</strong>.`;
      if(den<=0&&key==='pl') return `<strong>${esc(row.opd)}</strong>: tidak ada RUP metode ini. Persentase ditampilkan N/A.`;
      if(key==='pengumuman'){
        if(pct>=.9&&pct<1.1)return `<strong>${esc(row.opd)}</strong>: posisi ${fmtPct(pct)} berada pada rentang terbaik 90%–<110%. Pertahankan kesesuaian nilai RUP dengan total belanja PBJ.`;
        if(pct<.9)return `<strong>${esc(row.opd)}</strong>: posisi ${fmtPct(pct)}. Kebutuhan menuju 90% sekitar <strong>${fmtRp(target.gap)}</strong>. Cek paket yang belum diumumkan.`;
        if(pct>=1.5)return `<strong>${esc(row.opd)}</strong>: posisi ${fmtPct(pct)}. Periksa kembali basis belanja dan RUP karena persentase sudah ≥150%.`;
        return `<strong>${esc(row.opd)}</strong>: posisi ${fmtPct(pct)} berada di atas 110%. Periksa kembali kesesuaian nilai RUP dengan total belanja PBJ.`;
      }
      if(target.isMax)return `<strong>${esc(row.opd)}</strong>: nilai ${fmtScore(score)} dari ${fmtScore(m.maxScore)} sudah maksimal.`;
      return `<strong>${esc(row.opd)}</strong>: posisi ${fmtPct(pct)} dengan nilai ${fmtScore(score)}. Target berikutnya ${target.label}; kebutuhan tambahan sekitar <strong>${fmtRp(target.gap)}</strong>.`;
    }

    function strategyText(row,key,target,nextScore){
      const pct=metricPct(row,key);
      if(key==='pengumuman'){
        if(pct<.9)return `Umumkan RUP yang belum tercatat. Kebutuhan menuju 90% sekitar ${fmtRp(target.gap)}.`;
        if(pct>=1.5)return 'Periksa kembali total RUP dan basis belanja PBJ.';
        if(pct>=1.1)return 'Periksa RUP yang berpotensi ganda atau basis belanja yang belum sesuai.';
        return 'Pertahankan kesesuaian RUP dengan total belanja PBJ.';
      }
      const verb=key==='realisasi-tp'?'Dorong realisasi e-Tendering/e-Purchasing':key==='pl'?'Lengkapi realisasi Pengadaan Langsung pada Non Tender atau Pencatatan Non Tender':key==='penunjukan'?'Lengkapi realisasi Penunjukan Langsung pada Non Tender atau Pencatatan Non Tender':key==='digitalisasi'?'Lengkapi pencatatan transaksi pada sistem':key==='rup-tp'?'Arahkan rencana penyedia ke e-Tendering/e-Purchasing yang sesuai':'Lengkapi RUP melalui penyedia';
      return `${verb}. Target ${target.label}, kekurangan sekitar ${fmtRp(target.gap)}; nilai berikutnya ${fmtScore(nextScore)} poin.`;
    }

    function targetFor(row,key){
      if(key==='pengumuman'){
        const pct=metricPct(row,key);
        if(pct<.9){const gap=Math.max(0,.9*num(row.totalBelanja)-num(row.totalRup));return {pct:.9,label:'90%',gap,isMax:false};}
        if(pct>=.9&&pct<1.1)return {pct:pct,label:'Rentang terbaik',gap:0,isMax:true};
        if(pct>=1.5)return {pct:.9,label:'Perlu koreksi data',gap:0,isMax:false};
        return {pct:.9,label:'Kembali ke 90%–<110%',gap:0,isMax:false};
      }
      const m=METRICS[key],t=state.targetByOpd.get(row.opd);if(!t)return {pct:null,label:'-',gap:0,isMax:false};
      const raw=t[m.targetKey],gap=Math.max(0,num(t[m.gapKey]));
      if(String(raw).toUpperCase()==='MAX')return {pct:null,label:'Maksimal',gap:0,isMax:true};
      const pct=num(raw);return {pct,label:fmtPct(pct),gap,isMax:false};
    }

    function metricPct(row,key){return num(row[METRICS[key].pct]);}
    function metricDenominator(row,key){return num(row[METRICS[key].denominator]);}
    function displayMetricPct(row,key){const den=metricDenominator(row,key);return key==='penunjukan'&&den<=0?1:metricPct(row,key);}

    function scoreForPct(key,pct){
      if(pct===null||pct===undefined)return 0;
      if(key==='pengumuman'){if(pct>=1.5)return 0;if(pct>=1.1)return 4;if(pct>=.9)return 5;if(pct>=.8)return 4;if(pct>=.7)return 3;if(pct>=.6)return 2;if(pct>=.5)return 1;return 0;}
      if(key==='penyedia'){if(pct>=.8)return 2.5;if(pct>=.7)return 2;if(pct>=.6)return 1.5;if(pct>=.5)return 1;if(pct>=.4)return .5;return 0;}
      if(key==='rup-tp'){if(pct>=.6)return 2.5;if(pct>=.5)return 2;if(pct>=.4)return 1.5;if(pct>=.3)return 1;if(pct>=.2)return .5;return 0;}
      if(key==='realisasi-tp'){if(pct>=.6)return 10;if(pct>=.5)return 8;if(pct>=.4)return 6;if(pct>=.3)return 4;if(pct>=.2)return 2;return 0;}
      if(key==='pl'||key==='penunjukan'){if(pct>=.5)return 2.5;if(pct>=.4)return 2;if(pct>=.3)return 1.5;if(pct>=.2)return 1;if(pct>=.1)return .5;return 0;}
      if(key==='digitalisasi'){if(pct>=.8)return 5;if(pct>=.7)return 4;if(pct>=.6)return 3;if(pct>=.5)return 2;if(pct>=.4)return 1;return 0;}
      return 0;
    }

    function bindCommonContentEvents(){
      root.querySelectorAll('[data-select-opd]').forEach(btn=>btn.addEventListener('click',()=>{state.selectedOpd=btn.dataset.selectOpd||'';el.opd.value=state.selectedOpd;state.page=1;clearDetail();render();root.querySelector('.itkp74-filter-panel')?.scrollIntoView({behavior:'smooth',block:'start'});}));
      root.querySelectorAll('[data-show-packages]').forEach(btn=>btn.addEventListener('click',()=>openPackages(btn.dataset.opd||state.selectedOpd,btn.dataset.showPackages||'all')));
      root.querySelectorAll('[data-page-dir]').forEach(btn=>btn.addEventListener('click',()=>{state.page=Math.max(1,state.page+num(btn.dataset.pageDir));render();}));
      root.querySelectorAll('[data-data-page-dir]').forEach(btn=>btn.addEventListener('click',()=>{state.dataPage=Math.max(1,state.dataPage+num(btn.dataset.dataPageDir));render();}));
      root.querySelectorAll('[data-double-page-dir]').forEach(btn=>btn.addEventListener('click',()=>{state.doubleInputPage=Math.max(1,state.doubleInputPage+num(btn.dataset.doublePageDir));render();}));
      root.querySelectorAll('[data-open-double-modal]').forEach(btn=>btn.addEventListener('click',()=>{state.doubleInputModalOpen=true;state.doubleInputPage=1;render();}));
      root.querySelectorAll('[data-close-double-modal]').forEach(btn=>btn.addEventListener('click',()=>{state.doubleInputModalOpen=false;render();}));
      root.querySelectorAll('[data-export-double-xlsx]').forEach(btn=>btn.addEventListener('click',()=>exportDoubleInputs().catch(err=>alert(err.message||'Export DOUBEL INPUT gagal.'))));
      const doubleOverlay=root.querySelector('[data-double-modal-overlay]');if(doubleOverlay)doubleOverlay.addEventListener('click',(e)=>{if(e.target===doubleOverlay){state.doubleInputModalOpen=false;render();}});
      root.querySelectorAll('[data-detail-page-dir]').forEach(btn=>btn.addEventListener('click',()=>{state.detail.page=Math.max(1,state.detail.page+num(btn.dataset.detailPageDir));render();scrollDetailSoon();}));
      root.querySelectorAll('[data-close-detail]').forEach(btn=>btn.addEventListener('click',()=>{clearDetail();render();}));
      root.querySelectorAll('[data-reset-detail]').forEach(btn=>btn.addEventListener('click',()=>{state.detail.method='';state.detail.subKegiatan='';state.detail.status='';state.detail.search='';state.detail.page=1;render();scrollDetailSoon();}));
      root.querySelectorAll('[data-export-detail]').forEach(btn=>btn.addEventListener('click',()=>exportDetail().catch(err=>alert(err.message||'Export detail gagal.'))));
      const dm=root.querySelector('#itkp74DetailMethod');if(dm)dm.addEventListener('change',()=>{state.detail.method=dm.value;state.detail.page=1;render();});
      const dsub=root.querySelector('#itkp74DetailSubKegiatan');if(dsub)dsub.addEventListener('change',()=>{state.detail.subKegiatan=dsub.value;state.detail.page=1;render();});
      const ds=root.querySelector('#itkp74DetailStatus');if(ds)ds.addEventListener('change',()=>{state.detail.status=ds.value;state.detail.page=1;render();});
      const dq=root.querySelector('#itkp74DetailSearch');if(dq)dq.addEventListener('input',()=>{state.detail.search=dq.value;state.detail.page=1;render();});
    }

    function buildOpdOptions(){
      const values=[...new Set(state.rekap.map(r=>r.opd).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'id'));
      el.opd.innerHTML='<option value="">Semua Perangkat Daerah</option>'+values.map(v=>`<option value="${escAttr(v)}">${esc(v)}</option>`).join('');
      if(state.selectedOpd)el.opd.value=state.selectedOpd;
    }

    async function exportDoubleInputs(){
      await ensureXlsx();
      const rows=buildDoubleInputs();
      if(!rows.length)throw new Error('Tidak ada data DOUBEL INPUT Pengadaan Langsung.');
      const out=rows.map((r,i)=>({
        'No':i+1,
        'Perangkat Daerah':r.opd||'',
        'Kode RUP':r.kodeRup||'',
        'Nama Paket':r.nama||'',
        'Non Tender':num(r.nonTender),
        'Pencatatan Non Tender':num(r.pencatatan),
        'Total':num(r.total),
        'Status':'DOUBEL INPUT'
      }));
      writeXlsx(out,`DOUBEL_INPUT_Pengadaan_Langsung_${dateStamp()}.xlsx`,'DOUBEL INPUT PL');
    }

    async function exportCurrentView(){
      await ensureXlsx();
      if(view==='kontrol'){
        const doubles=buildDoubleInputs();
        const controlRows=[...state.kontrol,{check:'DOUBEL INPUT Pengadaan Langsung',value:doubles.length,status:doubles.length?'PERLU CEK':'OK',note:'Kode RUP tercatat di Non Tender dan Pencatatan Non Tender sekaligus.'}];
        const rows=controlRows.map(r=>({'Pemeriksaan':r.check,'Hasil':r.value,'Status':r.status,'Keterangan':r.note}));
        writeXlsx(rows,'Kontrol_Data_ITKP.xlsx','Kontrol Data');return;
      }
      const rows=filteredRows();if(!rows.length)throw new Error('Tidak ada data untuk diexport.');
      if(view==='ringkasan'){
        writeXlsx(rows.map(r=>({'Satuan Kerja':r.opd,'Pengumuman RUP':r.scorePengumuman,'RUP Penyedia':r.scorePenyedia,'RUP TP':r.scoreRupTp,'Realisasi TP':r.scoreRealTp,'PL Transaksional':r.scorePl,'Penunjukan Transaksional':r.scorePenunjukan,'Digitalisasi PBJ':r.scoreDigital,'Total Skor ITKP':r.totalScore})),`Ringkasan_ITKP_Kepka74_${dateStamp()}.xlsx`,'Ringkasan');
      }else{
        const m=METRICS[view];
        writeXlsx(rows.map(r=>{const t=targetFor(r,view);return {'Satuan Kerja':r.opd,[m.numLabel]:num(r[m.numerator]),[m.denLabel]:metricDenominator(r,view),'Persentase':(metricDenominator(r,view)>0||view==='penunjukan')?displayMetricPct(r,view):'N/A','Nilai ITKP':num(r[m.score]),'Nilai Maksimal':m.maxScore,'Target Berikutnya':t.label,'Kekurangan':t.gap};}),`${safeFile(m.label)}_${dateStamp()}.xlsx`,'Rekap');
      }
    }

    async function exportDetail(){
      await ensureXlsx();const rows=filteredDetailRows();if(!rows.length)throw new Error('Tidak ada detail untuk diexport.');
      const isNtMetric=state.detail.key==='pl'||state.detail.key==='penunjukan';
      const out=isNtMetric
        ? rows.map((r,i)=>{const trans=num(r.realisasiTransaksional),penc=num(r.realisasiPencatatan),double=(num(r.sourceCount)>1)||(trans>0&&penc>0),status=!r.kodeRup?'PERLU CEK KODE RUP':double?'DOUBEL INPUT':(trans>0||penc>0)?'SUDAH TERCATAT':'BELUM TERCATAT';return {'No':i+1,'Kode RUP':r.kodeRup||'','Kode Paket':r.kodePaket||'','Nama Paket':r.name||'','Program':r.program||'','Kegiatan':r.kegiatan||'','Sub Kegiatan':r.subKegiatan||'','Metode':r.method||'','Pagu RUP':r.pagu||0,'Non Tender':trans,'Pencatatan Non Tender':penc,'Total Realisasi':r.realisasi||0,'Sisa Pagu':r.sisa||0,'Status':status};})
        : rows.map((r,i)=>({'No':i+1,'Kode RUP':r.kodeRup||'','Kode Paket':r.kodePaket||'','Nama Paket':r.name||'','Program':r.program||'','Kegiatan':r.kegiatan||'','Sub Kegiatan':r.subKegiatan||'','Metode':r.method||'','Sumber Transaksi':r.source||'','Pagu RUP':r.pagu||0,'Realisasi':r.realisasi||0,'Sisa Pagu':r.sisa||0,'Status':!r.kodeRup?'PERLU CEK KODE RUP':num(r.sourceCount)>1?'DOUBEL INPUT':'TERHUBUNG'}));
      writeXlsx(out,`${safeFile(state.detail.opd)}_${safeFile(state.detail.key)}_${dateStamp()}.xlsx`,'Detail Paket');
    }

    function writeXlsx(rows,filename,sheetName){
      const ws=window.XLSX.utils.aoa_to_sheet([['Tanggal Export',exportDateTime()],[]]);
      window.XLSX.utils.sheet_add_json(ws,rows,{origin:'A3'});
      const wb=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(wb,ws,sheetName.slice(0,31));autoWidth(ws,rows);window.XLSX.writeFile(wb,filename);
    }
    function autoWidth(ws,rows){if(!rows.length)return;const headers=Object.keys(rows[0]);const cols=headers.map(h=>({wch:Math.min(55,Math.max(12,h.length+2,...rows.map(r=>String(r[h]??'').length+2)))}));cols[0]={wch:Math.max(cols[0]?.wch||12,18)};if(cols[1])cols[1]={wch:Math.max(cols[1].wch||12,24)};ws['!cols']=cols;}
    function exportDateTime(){return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()).replace(/\./g,':');}
    async function ensureXlsx(){if(window.XLSX)return window.XLSX;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=resolve;s.onerror=()=>reject(new Error('Library XLSX gagal dimuat.'));document.head.appendChild(s);});return window.XLSX;}

    function getControlValue(name){const row=state.kontrol.find(r=>r.check.toLowerCase()===name.toLowerCase());return row?num(row.value):0;}
    function showLoading(title,text,pct){el.loading.classList.add('show');if(title)el.loadingTitle.textContent=title;if(text)el.loadingText.textContent=text;el.progress.style.width=`${Math.max(6,Math.min(100,pct||18))}%`;}
    function hideLoading(){el.loading.classList.remove('show');el.progress.style.width='100%';}
    function setError(msg){if(!msg){el.error.hidden=true;el.error.textContent='';return;}el.error.hidden=false;el.error.textContent=msg;}
  };

  function loadAdminEdits(){try{const raw=localStorage.getItem(CFG.adminStorageKey);const data=raw?JSON.parse(raw):{};return {rupCorrections:data.rupCorrections||{},manual:Array.isArray(data.manual)?data.manual:[]};}catch(_){return {rupCorrections:{},manual:[]};}}

  async function fetchSheet(sheet,force){
    const cacheKey=`${CFG.spreadsheetId}|${sheet}`,now=Date.now(),cached=window.__itkp74DataCache[cacheKey];
    if(!force&&cached&&now-cached.time<CFG.cacheMs)return cached.rows;
    const bucket=Math.floor(now/CFG.cacheMs),url=`https://docs.google.com/spreadsheets/d/${CFG.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}&v=${bucket}`;
    const response=await fetch(url,{cache:force?'reload':'default'});if(!response.ok)throw new Error(`${sheet}: HTTP ${response.status}`);
    const text=await response.text();if(/<!doctype html|<html/i.test(text.slice(0,300)))throw new Error(`${sheet}: akses sheet belum terbuka untuk dibaca.`);
    const rows=csvToObjects(text);window.__itkp74DataCache[cacheKey]={time:now,rows};return rows;
  }

  function normalizeRekap(rows){return rows.map(r=>({
    opd:s(r,'Satuan Kerja'),totalRup:n(r,'Total RUP'),rupPenyedia:n(r,'RUP Penyedia'),rupTp:n(r,'RUP e-Tendering + e-Purchasing'),realTp:n(r,'Realisasi e-Tendering + e-Purchasing'),rupPl:n(r,'RUP Pengadaan Langsung'),realPl:n(r,'Realisasi PL Transaksional'),rupPenunjukan:n(r,'RUP Penunjukan Langsung'),realPenunjukan:n(r,'Realisasi Penunjukan Transaksional'),realDigital:n(r,'Realisasi Digitalisasi'),totalBelanja:n(r,'Total Belanja PBJ'),
    pctPengumuman:n(r,'% Pengumuman RUP'),pctPenyedia:n(r,'% RUP Penyedia'),pctRupTp:n(r,'% RUP TP'),pctRealTp:n(r,'% Realisasi TP'),pctPl:n(r,'% PL Transaksional'),pctPenunjukan:n(r,'% Penunjukan Transaksional'),pctDigital:n(r,'% Digitalisasi PBJ'),
    scorePengumuman:n(r,'Nilai Pengumuman RUP'),scorePenyedia:n(r,'Nilai RUP Penyedia'),scoreRupTp:n(r,'Nilai RUP TP'),scoreRealTp:n(r,'Nilai Realisasi TP'),scorePl:n(r,'Nilai PL Transaksional'),scorePenunjukan:n(r,'Nilai Penunjukan Transaksional'),scoreDigital:n(r,'Nilai Digitalisasi PBJ'),
    pencatatanNt:n(r,'Realisasi Pencatatan Non Tender'),swakelola:n(r,'Realisasi Pencatatan Swakelola'),tokoDaring:n(r,'Realisasi Toko Daring'),jumlahToko:n(r,'Jumlah Transaksi Toko Daring'),totalScore:n(r,'TOTAL SKOR ITKP')
  })).filter(r=>r.opd);}

  function normalizeTarget(rows){return rows.map(r=>({opd:s(r,'Satuan Kerja'),score:n(r,'Skor Saat Ini'),targetPenyedia:v(r,'Target RUP Penyedia'),gapPenyedia:n(r,'Kekurangan RUP Penyedia'),targetRupTp:v(r,'Target RUP TP'),gapRupTp:n(r,'Kekurangan RUP TP'),targetRealTp:v(r,'Target Realisasi TP'),gapRealTp:n(r,'Kekurangan Realisasi TP'),targetPl:v(r,'Target PL Transaksional'),gapPl:n(r,'Kekurangan PL Transaksional'),targetPenunjukan:v(r,'Target Penunjukan Transaksional'),gapPenunjukan:n(r,'Kekurangan Penunjukan Transaksional'),targetDigital:v(r,'Target Digitalisasi'),gapDigital:n(r,'Kekurangan Digitalisasi')})).filter(r=>r.opd);}
  function normalizeControl(rows){return rows.map(r=>({check:s(r,'Pemeriksaan'),value:v(r,'Hasil'),status:s(r,'Status'),note:s(r,'Keterangan')})).filter(r=>r.check);}
  function normalizeTanpaRup(rows){return rows.map(r=>({opd:s(r,'Nama Satuan Kerja'),kodeRup:v(r,'Kode RUP'),kodePaket:v(r,'Kode Paket'),jenis:s(r,'Jenis Pengadaan'),metode:s(r,'Metode Pengadaan'),nama:s(r,'Nama Paket'),penyedia:s(r,'Nama Penyedia'),statusPaket:s(r,'Status Paket'),nilai:n(r,'Total Nilai (Rp)'),sumber:s(r,'Sumber Transaksi'),status:s(r,'Status Link RUP')})).filter(r=>r.opd);}
  function normalizeMaster(rows){return rows.map(r=>{const pagu=n(r,'Pagu RUP'),realisasi=n(r,'Total Realisasi');return {opd:s(r,'Satuan Kerja'),kodeRup:String(v(r,'Kode RUP')??'').trim(),nama:s(r,'Nama Paket'),program:s(r,'Program'),kegiatan:s(r,'Kegiatan'),subKegiatan:s(r,'Sub Kegiatan'),jenis:s(r,'Jenis RUP'),metode:s(r,'Metode RUP'),pagu,realisasi,status:s(r,'Status Monitoring')};}).filter(r=>r.opd);}
  function normalizeRaw(rows){return rows.map(r=>({opd:s(r,'Nama Satuan Kerja'),kodeRup:String(v(r,'Kode RUP')??'').trim(),kodePaket:String(v(r,'Kode Paket')??'').trim(),jenis:s(r,'Jenis Pengadaan'),metode:s(r,'Metode Pengadaan'),nama:s(r,'Nama Paket'),penyedia:s(r,'Nama Penyedia'),statusPaket:s(r,'Status Paket'),nilai:n(r,'Total Nilai (Rp)'),sumber:s(r,'Sumber Transaksi')})).filter(r=>r.opd);}

  function csvToObjects(text){const rows=parseCsv(text);if(!rows.length)return[];const headers=rows[0].map(h=>String(h||'').trim());return rows.slice(1).filter(row=>row.some(cell=>String(cell||'').trim()!=='')).map(row=>{const o={};headers.forEach((h,i)=>{if(h)o[h]=row[i]??'';});return o;});}
  function parseCsv(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"'){quoted=false;}else field+=c;}else{if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field);rows.push(row);row=[];field='';}else if(c!=='\r')field+=c;}}if(field!==''||row.length){row.push(field);rows.push(row);}return rows;}

  function statCard(label,value,note,tone=''){return `<div class="itkp74-stat-card ${tone}"><div class="itkp74-stat-label">${esc(label)}</div><div class="itkp74-stat-value">${esc(value)}</div><div class="itkp74-stat-note">${esc(note)}</div></div>`;}
  function scoreTd(v,max){return `<td>${scorePill(v,max)}</td>`;}
  function scorePill(v,max){const value=num(v),ratio=max?value/max:0,cls=ratio>=.99?'good':ratio>=.5?'warn':value>0?'info':'bad';return `<span class="itkp74-score-pill ${cls}">${fmtScore(value)} / ${fmtScore(max)}</span>`;}
  function metricTone(key,pct,score,maxScore,den){if(key==='penunjukan'&&den<=0)return 'good';if(key==='pl'&&den<=0)return 'neutral';if(key==='pengumuman')return pct>=.9&&pct<1.1?'good':pct>=.8&&pct<1.5?'warn':'bad';const ratio=maxScore?score/maxScore:0;return ratio>=.99?'good':ratio>=.6?'info':ratio>0?'warn':'bad';}
  function pctBadge(v){const p=num(v),cls=p>=.8?'good':p>=.5?'info':p>=.3?'warn':'bad';return `<span class="itkp74-badge ${cls}">${fmtPct(p)}</span>`;}
  function statusBadge(v){const t=String(v||'-'),u=t.toUpperCase();const cls=u==='OK'||u.includes('SUDAH')||u.includes('TERHUBUNG')?'good':u.includes('PERLU')||u.includes('SELISIH')||u.includes('DOUBLE')||u.includes('DOUBEL')?'bad':u.includes('BELUM')?'warn':u==='INFO'||u==='N/A'?'info':'neutral';return `<span class="itkp74-badge ${cls}">${esc(t)}</span>`;}
  function paginationHtml(total,page,pages){return `<div class="itkp74-pagination"><span>${fmtInt(total)} perangkat daerah • halaman ${page} dari ${pages}</span><div class="itkp74-pagination-actions"><button class="itkp74-page-btn" data-page-dir="-1" ${page<=1?'disabled':''}>Sebelumnya</button><button class="itkp74-page-btn" data-page-dir="1" ${page>=pages?'disabled':''}>Berikutnya</button></div></div>`;}
  function dataPaginationHtml(total,page,pages){return `<div class="itkp74-pagination"><span>${fmtInt(total)} transaksi • halaman ${page} dari ${pages}</span><div class="itkp74-pagination-actions"><button class="itkp74-page-btn" data-data-page-dir="-1" ${page<=1?'disabled':''}>Sebelumnya</button><button class="itkp74-page-btn" data-data-page-dir="1" ${page>=pages?'disabled':''}>Berikutnya</button></div></div>`;}
  function doublePaginationHtml(total,page,pages){return `<div class="itkp74-pagination"><span>${fmtInt(total)} paket • 10 baris per halaman • halaman ${page} dari ${pages}</span><div class="itkp74-pagination-actions"><button class="itkp74-page-btn" data-double-page-dir="-1" ${page<=1?'disabled':''}>Sebelumnya</button><button class="itkp74-page-btn" data-double-page-dir="1" ${page>=pages?'disabled':''}>Berikutnya</button></div></div>`;}
  function detailPaginationHtml(total,page,pages){return `<div class="itkp74-pagination"><span>${fmtInt(total)} paket/transaksi • halaman ${page} dari ${pages}</span><div class="itkp74-pagination-actions"><button class="itkp74-page-btn" data-detail-page-dir="-1" ${page<=1?'disabled':''}>Sebelumnya</button><button class="itkp74-page-btn" data-detail-page-dir="1" ${page>=pages?'disabled':''}>Berikutnya</button></div></div>`;}
  function controlValue(r){const check=(r.check||'').toLowerCase(),val=num(r.value);if(check.includes('nilai transaksi')||check.includes('selisih realisasi'))return fmtRp(val);return isFiniteNumber(r.value)?fmtInt(val):esc(String(r.value??'-'));}
  function isFiniteNumber(v){return v!==''&&v!==null&&v!==undefined&&Number.isFinite(Number(String(v).replace(/,/g,'')));}
  function fmtRp(v){const x=num(v);if(!Number.isFinite(x))return '-';return 'Rp'+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(x);}
  function fmtInt(v){return new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(num(v));}
  function fmtScore(v){const x=num(v);return new Intl.NumberFormat('id-ID',{minimumFractionDigits:Number.isInteger(x)?0:1,maximumFractionDigits:1}).format(x);}
  function fmtPct(v){return new Intl.NumberFormat('id-ID',{style:'percent',minimumFractionDigits:0,maximumFractionDigits:1}).format(num(v));}
  function num(v){if(typeof v==='number')return Number.isFinite(v)?v:0;let s=String(v??'').trim();if(!s)return 0;const isPercent=/%$/.test(s);s=s.replace(/Rp/gi,'').replace(/%/g,'').replace(/\s/g,'');let normalized=s;const dots=(s.match(/\./g)||[]).length,commas=(s.match(/,/g)||[]).length;if(dots&&commas){if(s.lastIndexOf(',')>s.lastIndexOf('.'))normalized=s.replace(/\./g,'').replace(',', '.');else normalized=s.replace(/,/g,'');}else if(commas){if(commas>1||/^-?\d{1,3}(,\d{3})+$/.test(s))normalized=s.replace(/,/g,'');else normalized=s.replace(',', '.');}else if(dots>1&&/^-?\d{1,3}(\.\d{3})+$/.test(s)){normalized=s.replace(/\./g,'');}const x=Number(normalized);if(!Number.isFinite(x))return 0;return isPercent?x/100:x;}
  function n(row,key){return num(row[key]);}function s(row,key){return String(row[key]??'').trim();}function v(row,key){return row[key]??'';}
  function esc(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function escAttr(value){return esc(value).replace(/`/g,'&#096;');}
  function safeFile(v){return String(v||'ITKP').replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,'_').slice(0,80);}
  function dateStamp(){const d=new Date();return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;}
})();
