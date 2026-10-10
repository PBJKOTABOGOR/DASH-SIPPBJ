(function(){
  'use strict';

  window.__moduleInit=function({container}){
    const root=container.querySelector('.td-admin-page');
    if(!root) return null;
    if(!window.__sippbjIsAdmin?.()){
      root.innerHTML='<section class="td-admin-card"><h3>Akses admin diperlukan</h3><p>Masuk melalui akses internal terlebih dahulu.</p></section>';
      return null;
    }

    const Store=window.SippbjTokoDaringStore;
    if(!Store){
      root.innerHTML='<section class="td-admin-card"><h3>Store Toko Daring belum tersedia</h3><p>Pastikan assets/toko-daring-store.js termuat.</p></section>';
      return null;
    }

    const q=(id)=>root.querySelector('#'+id);
    const fileInput=q('tdAdminFile'),preview=q('tdAdminPreview'),drop=root.querySelector('.td-admin-drop');
    const errBox=q('tdAdminError'),okBox=q('tdAdminSuccess');
    let parsedRows=[];let parsedFileName='';let destroyed=false;

    function rupiah(v){return 'Rp'+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v||0));}
    function int(v){return new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v||0));}
    function notify(type,msg){
      errBox.hidden=true;okBox.hidden=true;
      const box=type==='error'?errBox:okBox;box.textContent=msg;box.hidden=false;
    }
    function clearNotice(){errBox.hidden=true;okBox.hidden=true;}

    function renderCurrent(){
      const meta=Store.getMeta();
      const empty=q('tdAdminCurrentEmpty'),wrap=q('tdAdminCurrent');
      if(!meta){empty.hidden=false;wrap.hidden=true;}
      else{
        empty.hidden=true;wrap.hidden=false;
        q('tdAdminCurrentName').textContent=meta.fileName||'Import Toko Daring';
        q('tdAdminCurrentTime').textContent='Terakhir import: '+new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(meta.importedAt));
        q('tdAdminCurrentRows').textContent=int(meta.summary.rowCount);
        q('tdAdminCurrentRup').textContent=int(meta.summary.rupCount);
        q('tdAdminCurrentOrders').textContent=int(meta.summary.orderCount);
        q('tdAdminCurrentTotal').textContent=rupiah(meta.summary.total);
      }
      const url=Store.getSyncUrl();q('tdAdminSyncUrl').value=url;
      const badge=q('tdAdminSyncBadge');badge.textContent=url?'SIAP SYNC':'BELUM DISET';badge.classList.toggle('ready',Boolean(url));
      q('tdAdminSyncDrive').disabled=!meta||!url;
    }

    function normalizeWorkbookRows(rows){
      return Store.normalizeRows((rows||[]).map(row=>{
        const out={};Object.keys(row||{}).forEach(key=>{
          const k=String(key||'').trim().toLowerCase().replace(/\s+/g,'_');out[k]=row[key];
        });return out;
      }));
    }


    async function ensureXlsx(){
      if(window.XLSX)return window.XLSX;
      await new Promise((resolve,reject)=>{
        const existing=document.querySelector('script[data-xlsx-lib="true"]');
        if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(new Error('Library XLSX gagal dimuat.')),{once:true});return;}
        const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';script.setAttribute('data-xlsx-lib','true');script.onload=resolve;script.onerror=()=>reject(new Error('Library XLSX gagal dimuat.'));document.head.appendChild(script);
      });
      return window.XLSX;
    }

    async function parseFile(file){
      if(!file) return;
      clearNotice();
      drop.classList.add('td-admin-busy');
      try{
        await ensureXlsx();
        const buffer=await file.arrayBuffer();
        if(destroyed)return;
        const wb=XLSX.read(buffer,{type:'array',cellDates:false});
        const ws=wb.Sheets[wb.SheetNames[0]];
        if(!ws) throw new Error('Sheet pertama pada file tidak ditemukan.');
        const rows=XLSX.utils.sheet_to_json(ws,{defval:'',raw:true});
        const normalized=normalizeWorkbookRows(rows);
        if(!normalized.length) throw new Error('Tidak ada data yang bisa dibaca. Pastikan file mempunyai kolom rup_no.');
        const summary=Store.summarize(normalized);
        parsedRows=normalized;parsedFileName=file.name||'data-toko-daring.xlsx';
        q('tdAdminFileName').textContent=parsedFileName;
        q('tdAdminRows').textContent=int(summary.rowCount);
        q('tdAdminRup').textContent=int(summary.rupCount);
        q('tdAdminOrders').textContent=int(summary.orderCount);
        q('tdAdminTotal').textContent=rupiah(summary.total);
        preview.hidden=false;drop.style.display='none';
      }catch(err){parsedRows=[];preview.hidden=true;drop.style.display='flex';notify('error',err.message||String(err));}
      finally{drop.classList.remove('td-admin-busy');}
    }

    fileInput.addEventListener('change',()=>parseFile(fileInput.files?.[0]));
    q('tdAdminResetFile').addEventListener('click',()=>{parsedRows=[];parsedFileName='';fileInput.value='';preview.hidden=true;drop.style.display='flex';clearNotice();});
    q('tdAdminSave').addEventListener('click',()=>{
      if(!parsedRows.length)return notify('error','Pilih file Toko Daring terlebih dahulu.');
      const saved=Store.save({rows:parsedRows,fileName:parsedFileName,importedAt:new Date().toISOString()});
      notify('success',`${int(saved.summary.orderCount)} pesanan dari ${int(saved.summary.rupCount)} Kode RUP sudah aktif di monitoring.`);
      renderCurrent();
    });
    q('tdAdminDelete').addEventListener('click',()=>{
      if(!confirm('Hapus cache import Toko Daring dari browser ini?'))return;
      Store.clear();renderCurrent();notify('success','Cache import Toko Daring sudah dihapus.');
    });
    q('tdAdminSaveSyncUrl').addEventListener('click',()=>{
      Store.setSyncUrl(q('tdAdminSyncUrl').value);renderCurrent();notify('success','URL sinkronisasi disimpan di browser admin ini.');
    });
    q('tdAdminSyncDrive').addEventListener('click',async()=>{
      const btn=q('tdAdminSyncDrive');btn.disabled=true;btn.classList.add('td-admin-busy');clearNotice();
      try{const result=await Store.syncToDrive();notify('success',result?.message||'Data sudah dikirim ke sheet TOKO_DARING.');}
      catch(err){notify('error',err.message||String(err));}
      finally{btn.classList.remove('td-admin-busy');renderCurrent();}
    });
    q('tdAdminOpenMonitoring').addEventListener('click',()=>window.__sippbjLoadPage?.('monitoring-perencanaan'));
    q('tdAdminOpenItkp').addEventListener('click',()=>window.__sippbjLoadPage?.('itkp74-realisasi-tp'));

    renderCurrent();
    return ()=>{destroyed=true;};
  };
})();
