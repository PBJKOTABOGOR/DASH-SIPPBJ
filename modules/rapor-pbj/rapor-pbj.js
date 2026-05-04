(function(){
  'use strict';

  const SHEET_BASE = 'https://docs.google.com/spreadsheets/d/1QbXFJ6A3CWhZUH7el7-ZzpvqhR1s7cZ93bBe4iKMtzA/gviz/tq?tqx=out:csv&sheet=';
  const SHEETS = {
    master:'MASTER_OPD', index:'INDEX_RAPOT', sirup:'SIRUP_STRUKTUR_ANGGARAN'
  };
  const MONTHS = [
    { value:'1', label:'Januari' },{ value:'2', label:'Februari' },{ value:'3', label:'Maret' },{ value:'4', label:'April' },
    { value:'5', label:'Mei' },{ value:'6', label:'Juni' },{ value:'7', label:'Juli' },{ value:'8', label:'Agustus' },
    { value:'9', label:'September' },{ value:'10', label:'Oktober' },{ value:'11', label:'November' },{ value:'12', label:'Desember' }
  ];
  const STATUS = { DRAFT:'Draft', MENUNGGU:'Menunggu', REVISI:'Revisi', OK:'OK' };
  const STEP_META = {
    identitas:{index:1,label:'Identitas',hint:'Lengkapi periode, penginput, dan OPD terlebih dahulu.'},
    sirup:{index:2,label:'SiRUP & Struktur',hint:'Tarik atau lengkapi data SiRUP dan struktur anggaran.'},
    perencanaan:{index:3,label:'Perencanaan',hint:'Pastikan jumlah paket dan pagu sudah sesuai.'},
    realisasi:{index:4,label:'Realisasi',hint:'Isi realisasi paket dan anggaran, lalu cek totalnya.'},
    pelaku:{index:5,label:'Pelaku',hint:'Tambahkan daftar PP / PPK dan dokumen pendukung.'},
    itkp:{index:6,label:'ITKP',hint:'Unggah screenshot ITKP sebagai bukti pendukung.'},
    analisis:{index:7,label:'Analisis Manual',hint:'Tulis kesimpulan progres sebelum kirim ke QC.'}
  };
  const state = { masterRows:[], indexRows:[], sirupRows:[], availability:{}, currentStep:'identitas' };
  let root;
  const q = s => root.querySelector(s);
  const qa = s => Array.from(root.querySelectorAll(s));
  const esc = t => String(t ?? '').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  const norm = t => String(t ?? '').trim().toLowerCase();
  function sheetUrl(name){ return SHEET_BASE + encodeURIComponent(name); }
  function parseCsv(text){const lines=text.replace(/
/g,'').split('
').filter(Boolean);if(!lines.length)return[];const parseLine=l=>{const out=[];let cur='',qq=false;for(let i=0;i<l.length;i++){const c=l[i];if(c==='"'){if(qq&&l[i+1]==='"'){cur+='"';i++;}else qq=!qq;}else if(c===','&&!qq){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;};const headers=parseLine(lines[0]);return lines.slice(1).map(line=>{const vals=parseLine(line);const o={};headers.forEach((h,i)=>o[h.trim()]=vals[i]??'');return o;});}
  async function fetchCsv(url){const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw new Error('Gagal load CSV');return parseCsv(await res.text());}
  function monthLabel(v){const f=MONTHS.find(m=>m.value===String(v));return f?f.label:'-';}
  function makeIdRapot(tahun,bulan,kodeOpd){const yy=String(tahun||'').slice(-2);const mm=String(bulan||'').padStart(2,'0');return `RPBJ${yy}${mm}${String(kodeOpd||'').trim()}`;}
  function buildPicOptions(){const map=new Map();state.masterRows.forEach(r=>{const pic=String(r.nama_pic||'').trim();if(!pic)return;if(!map.has(pic))map.set(pic,{pic,count:0});map.get(pic).count++;});return [...map.values()].sort((a,b)=>a.pic.localeCompare(b.pic,'id'));}
  function renderMonthOptions(){q('#riBulan').innerHTML=MONTHS.map(m=>`<option value="${m.value}">${m.label}</option>`).join('');q('#riBulan').value='3';}
  function renderPicOptions(sel){const el=q('#riPicSelect');const list=buildPicOptions();el.innerHTML='<option value="">-- Pilih Nama PIC --</option>'+list.map(i=>`<option value="${esc(i.pic)}">${esc(i.count>1?`${i.pic} (${i.count} OPD)`:i.pic)}</option>`).join('');if(sel)el.value=sel;}
  function rowsByPic(pic){return state.masterRows.filter(r=>norm(r.nama_pic)===norm(pic));}
  function renderOpdOptions(rows,selected){const el=q('#riOpdSelect');el.innerHTML='<option value="">-- Pilih OPD --</option>'+rows.map(r=>`<option value="${esc(r.nama_opd)}" data-kode="${esc(r.kode_opd)}">${esc(r.nama_opd)}</option>`).join('');if(selected)el.value=selected;if(rows.length===1&&!selected)el.value=rows[0].nama_opd;syncKodeFromOpd();}
  function syncKodeFromOpd(){const el=q('#riOpdSelect');const opt=el.options[el.selectedIndex];q('#riKodeOpd').value=opt?(opt.dataset.kode||''):'';updateSummary();}
  function payload(){return {tahun:String(q('#riTahun').value||'').trim(),bulan:String(q('#riBulan').value||'').trim(),input_by:String(q('#riPicSelect').value||'').trim(),nama_opd:String(q('#riOpdSelect').value||'').trim(),kode_opd:String(q('#riKodeOpd').value||'').trim()};}
  function findExisting(p){const t=norm(p.tahun),b=norm(p.bulan),k=norm(p.kode_opd),n=norm(p.nama_opd);return state.indexRows.find(r=>norm(r.tahun)===t&&norm(r.bulan)===b&&((k&&norm(r.kode_opd)===k)||(n&&norm(r.nama_opd)===n)))||null;}
  function computeAvailability(p){if(!p.tahun||!p.bulan||!p.nama_opd){return {exists:false,ready:false,canEdit:false,canOpen:false,id_rapot:'',status_qc:'',qc_notes:'',message:'Pilih tahun, bulan, dan OPD untuk mengecek apakah rapot sudah ada.'};}const ex=findExisting(p);if(!ex){return {exists:false,ready:true,canEdit:true,canOpen:false,id_rapot:makeIdRapot(p.tahun,p.bulan,p.kode_opd),status_qc:'Draft Baru',qc_notes:'-',message:'Belum ada rapot untuk periode ini. Anda bisa membuat draft baru.'};}const s=String(ex.status_qc||'');const canEdit=s===STATUS.DRAFT||s===STATUS.REVISI;let msg='Rapot untuk periode ini sudah ada.';if(s===STATUS.MENUNGGU)msg='Rapot periode ini sedang menunggu review QC dan belum bisa diedit.';if(s===STATUS.OK)msg='Rapot periode ini sudah final / OK dan tidak bisa diedit.';if(s===STATUS.DRAFT)msg='Rapot draft ditemukan, Anda bisa melanjutkan input.';if(s===STATUS.REVISI)msg='Rapot revisi ditemukan, Anda bisa melanjutkan perbaikan.';return {exists:true,ready:true,canEdit,canOpen:true,id_rapot:ex.id_rapot||makeIdRapot(p.tahun,p.bulan,p.kode_opd),status_qc:s,qc_notes:ex.qc_notes||'-',message:msg};}
  function badge(status){const raw=String(status||'').trim();if(!raw)return '<span class="rp-badge info">Belum dicek</span>';const k=norm(raw);const cls=k==='ok'?'ok':k==='menunggu'?'menunggu':k==='revisi'?'revisi':k==='draft'||k==='draft baru'?'draft':'info';return `<span class="rp-badge ${cls}">${esc(raw)}</span>`;}
  const getVal=id=>{const el=q('#'+id);return el?(el.value||'').trim():'';};
  function setMini(id,val){ const el=q('#'+id); if(el) el.textContent = val || '-'; }
  function fileName(id){ const el=q('#'+id); return el && el.files && el.files[0] ? el.files[0].name : ''; }
  function updateSummary(){
    const p=payload();
    q('#rpPeriodeStat').textContent=p.bulan?`${monthLabel(p.bulan)} ${p.tahun}`:`- ${p.tahun||''}`;
    q('#rpOpdStat').textContent=p.nama_opd||'Belum dipilih';
    setMini('rpMiniYear', p.tahun||'-'); setMini('rpMiniMonth', monthLabel(p.bulan)); setMini('rpMiniKode', p.kode_opd||'-'); setMini('rpMiniNamaOpd', p.nama_opd||'-'); setMini('rpMiniPic', p.input_by||'-');
    q('#rpMiniPeriode').textContent=`Periode: ${p.bulan?monthLabel(p.bulan):'-'} ${p.tahun||''}`; q('#rpMiniOpd').textContent=`OPD: ${p.kode_opd||'-'}`;
    q('#rpOpdStat').textContent=p.nama_opd||'Belum dipilih';
    const ids = ['Penyedia','Swakelola','Total','Struktur','Persen'];
    ids.forEach(key=>setMini('miniSirup'+key, getVal('rpSirup'+key)||'-'));
    setMini('miniSirupFile', fileName('rpSirupFile') || q('#rpSirupFileLabel').textContent || 'Belum ada file');
    [['PlanTenderPkt','PlanTenderPagu'],['PlanPLPkt','PlanPLPagu'],['PlanEcatPkt','PlanEcatPagu'],['PlanDcualPkt','PlanDcualPagu'],['PlanSwakPkt','PlanSwakPagu'],['RealTenderPkt','RealTenderAng'],['RealPLPkt','RealPLAng'],['RealEcatPkt','RealEcatAng'],['RealDcualPkt','RealDcualAng'],['RealSwakPkt','RealSwakAng'],['RealTotalPkt','RealTotalAng']].flat().forEach(id=>setMini('mini'+id, getVal('rp'+id)||'-'));
    setMini('miniActorCount', getVal('rpActorCount')||'-'); setMini('miniActorList', getVal('rpActorList')||'-'); setMini('miniActorDoc', getVal('rpActorDoc')||'Belum ada file');
    setMini('miniItkpValue', getVal('rpItkpValue')||'-'); setMini('miniItkpFile', fileName('rpItkpFile') || q('#rpItkpFileLabel').textContent || 'Belum ada file');
    setMini('miniAnalisisText', getVal('rpAnalisisText')||'-');
  }
  function applyAvailability(av){state.availability=av;q('#riAvailabilityBadge').innerHTML=badge(av.status_qc||'Belum dicek');q('#riAvailabilityMessage').textContent=av.message||'-';q('#riIdRapotLabel').textContent=av.id_rapot||'-';q('#riQcNotes').textContent=av.qc_notes||'-';q('#rpStatusStat').textContent=av.status_qc||'Draft Baru';q('#rpMiniStatus').textContent=`Status: ${av.status_qc||'Draft Baru'}`;q('#rpMiniId').textContent=av.id_rapot||'-';q('#riContinueBtn').disabled=!av.ready||!av.canEdit;q('#riOpenBtn').disabled=!av.exists||!av.canOpen;q('#riSaveBtn').disabled=!av.ready||!av.canEdit;q('#riContinueBtn').textContent=av.exists?(av.canEdit?'Lanjutkan Draft':'Lihat Data'):'Lanjutkan Draft';const lock=av.exists&&!av.canEdit;['#riTahun','#riBulan','#riPicSelect','#riOpdSelect'].forEach(id=>q(id).disabled=lock);}
  function checkExisting(){updateSummary();applyAvailability(computeAvailability(payload()));}
  function saveDraft(){const p=payload();if(!p.tahun||!p.bulan||!p.nama_opd||!p.input_by){q('#riHelperBox').textContent='Lengkapi tahun, bulan, PIC, dan OPD terlebih dahulu.';return;}q('#riHelperBox').textContent=`Draft identitas sementara untuk ${p.nama_opd} siap. Tahap backend live bisa disambungkan setelah layout final.`;}
  function switchStep(step){state.currentStep=step;qa('.rp-step-btn').forEach(b=>b.classList.toggle('active',b.dataset.step===step));qa('.rp-tab').forEach(b=>b.classList.toggle('active',b.dataset.step===step));qa('.rp-panel').forEach(p=>p.classList.toggle('active',p.dataset.stepPanel===step));const meta=STEP_META[step];q('#rpProgressText').textContent=`Step ${meta.index} / 7`;q('#rpProgressLabel').textContent=meta.label;q('#rpProgressHint').textContent=meta.hint;q('#rpProgressBar').style.width=`${(meta.index/7)*100}%`;q('#rpStepStat').textContent=`${meta.index} / 7 Tahap`;}
  function attachLiveSummary(){['#riTahun','#riBulan','#riPicSelect','#riOpdSelect','#rpSirupPenyedia','#rpSirupSwakelola','#rpSirupTotal','#rpSirupStruktur','#rpSirupPersen','#rpPlanTenderPkt','#rpPlanTenderPagu','#rpPlanPLPkt','#rpPlanPLPagu','#rpPlanEcatPkt','#rpPlanEcatPagu','#rpPlanDcualPkt','#rpPlanDcualPagu','#rpPlanSwakPkt','#rpPlanSwakPagu','#rpRealTenderPkt','#rpRealTenderAng','#rpRealPLPkt','#rpRealPLAng','#rpRealEcatPkt','#rpRealEcatAng','#rpRealDcualPkt','#rpRealDcualAng','#rpRealSwakPkt','#rpRealSwakAng','#rpRealTotalPkt','#rpRealTotalAng','#rpActorList','#rpActorCount','#rpActorDoc','#rpItkpValue','#rpAnalisisText'].forEach(sel=>{const el=q(sel); if(el) el.addEventListener('input', updateSummary); if(el && el.tagName==='SELECT') el.addEventListener('change', updateSummary);});
    ['#rpSirupFile','#rpItkpFile'].forEach(sel=>{const el=q(sel); if(el) el.addEventListener('change',()=>{ if(sel==='#rpSirupFile') q('#rpSirupFileLabel').textContent=fileName('rpSirupFile')||'-'; if(sel==='#rpItkpFile') q('#rpItkpFileLabel').textContent=fileName('rpItkpFile')||'-'; updateSummary();});});
  }
  function findSirupRowByCurrent(){ const p=payload(); return state.sirupRows.find(r=>norm(r.tahun)===norm(p.tahun) && norm(r.bulan)===norm(p.bulan) && norm(r.kode_opd)===norm(p.kode_opd)); }
  function pullSirupData(){ const row=findSirupRowByCurrent(); if(!row){ q('#riHelperBox').textContent='Data SiRUP & Struktur belum ditemukan untuk kombinasi tahun, bulan, dan OPD saat ini.'; switchStep('sirup'); return; }
    q('#rpSirupPenyedia').value = row.total_pagu_penyedia || '';
    q('#rpSirupSwakelola').value = row.total_pagu_swakelola || '';
    q('#rpSirupTotal').value = row.total_pagu_sirup || '';
    q('#rpSirupStruktur').value = row.total_struktur_anggaran_rup || '';
    q('#rpSirupPersen').value = row.persentase || '';
    q('#rpSirupFileLabel').textContent = row.file_screenshot || '-';
    const src = row.file_screenshot || 'https://data.inaproc.id/'; q('#rpSirupSource').href = src;
    updateSummary();
  }
  async function init(container){root=container;renderMonthOptions();attachLiveSummary();
    q('#riCheckBtn').addEventListener('click',checkExisting);q('#riSaveBtn').addEventListener('click',saveDraft);q('#riContinueBtn').addEventListener('click',()=>{switchStep('sirup');q('#riHelperBox').textContent='Lanjut ke tahap SiRUP & Struktur. Data identitas tetap tersimpan di form.';});q('#riOpenBtn').addEventListener('click',()=>{q('#riHelperBox').textContent=`Mode lihat data untuk ID ${state.availability.id_rapot||'-'}.`;});
    qa('[data-step]').forEach(btn=>btn.addEventListener('click',()=>switchStep(btn.dataset.step)));
    q('#riPicSelect').addEventListener('change',()=>{const rows=q('#riPicSelect').value?rowsByPic(q('#riPicSelect').value):state.masterRows;renderOpdOptions(rows);updateSummary();applyAvailability({exists:false,ready:false,canEdit:false,canOpen:false,id_rapot:'',status_qc:'',qc_notes:'-',message:'Pilih OPD yang sesuai dengan PIC terpilih.'});});
    q('#riOpdSelect').addEventListener('change',()=>{syncKodeFromOpd(); updateSummary();});
    q('#rpSirupPullBtn').addEventListener('click', pullSirupData); q('#rpSirupToPlanBtn').addEventListener('click', ()=>switchStep('perencanaan'));
    try{
      q('#riHelperBox').textContent='Memuat MASTER_OPD, INDEX_RAPOT, dan SIRUP_STRUKTUR_ANGGARAN dari sheet publik...';
      const [master,index,sirup]=await Promise.all([fetchCsv(sheetUrl(SHEETS.master)),fetchCsv(sheetUrl(SHEETS.index)),fetchCsv(sheetUrl(SHEETS.sirup))]);
      state.masterRows=master; state.indexRows=index; state.sirupRows=sirup;
      renderPicOptions(); renderOpdOptions([]); updateSummary();
      q('#riHelperBox').textContent=`MASTER_OPD ${master.length} baris, INDEX_RAPOT ${index.length} baris, dan SIRUP_STRUKTUR_ANGGARAN ${sirup.length} baris berhasil dimuat.`;
      applyAvailability({exists:false,ready:false,canEdit:false,canOpen:false,id_rapot:'',status_qc:'',qc_notes:'-',message:'Pilih tahun, bulan, dan OPD untuk mengecek apakah rapot sudah ada.'});
    }catch(err){q('#riHelperBox').textContent=`Gagal memuat data: ${err.message||String(err)}`;renderPicOptions();renderOpdOptions([]);}
    switchStep('identitas'); updateSummary();
  }
  window.__moduleInit=function({container}){init(container);return function(){};};
})();
