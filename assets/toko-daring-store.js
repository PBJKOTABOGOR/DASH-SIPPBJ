(function(){
  'use strict';

  const DATA_KEY = 'sippbj_toko_daring_import_v2';
  const SYNC_URL_KEY = 'sippbj_toko_daring_sync_url_v1';
  const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 45;
  let memoryCache = null;

  function normalizeCode(value){
    return String(value == null ? '' : value).trim().replace(/\.0$/, '');
  }

  function parseMoney(value){
    if(value == null || value === '') return 0;
    if(typeof value === 'number') return Number.isFinite(value) ? value : 0;
    let s=String(value).trim().replace(/Rp/gi,'').replace(/\s/g,'').replace(/[^\d.,-]/g,'');
    if(!s) return 0;
    const dots=(s.match(/\./g)||[]).length, commas=(s.match(/,/g)||[]).length;
    if(dots && commas){
      if(s.lastIndexOf(',') > s.lastIndexOf('.')) s=s.replace(/\./g,'').replace(',', '.');
      else s=s.replace(/,/g,'');
    }else if(commas){
      const p=s.split(',');
      s=(p.length>2 || (p[1]||'').length===3) ? p.join('') : p[0]+'.'+(p[1]||'');
    }else if(dots){
      const p=s.split('.');
      if(p.length>2 || (p[1]||'').length===3) s=p.join('');
    }
    const n=Number(s);
    return Number.isFinite(n)?n:0;
  }

  function normalizeRow(row){
    const r=row||{};
    return {
      rup_no: normalizeCode(r.rup_no ?? r.kode_rup ?? r.kd_rup ?? ''),
      po_id: normalizeCode(r.po_id ?? ''),
      buyer_name: String(r.buyer_name ?? '').trim(),
      seller_name: String(r.seller_name ?? '').trim(),
      purchase_order_no: String(r.purchase_order_no ?? r.no_po ?? '').trim(),
      quotation_no: String(r.quotation_no ?? '').trim(),
      sku_no: String(r.sku_no ?? '').trim(),
      qty: r.qty ?? '',
      title: String(r.title ?? '').trim(),
      reference_no: String(r.reference_no ?? '').trim(),
      notes: String(r.notes ?? '').trim(),
      total: parseMoney(r.total ?? r.nilai_total ?? 0),
      grand_total: parseMoney(r.grand_total ?? r.total_transaksi ?? 0)
    };
  }

  function normalizeRows(rows){
    return (rows||[]).map(normalizeRow).filter(r=>r.rup_no && (r.po_id || r.purchase_order_no || r.total || r.grand_total));
  }

  function groupOrders(rows){
    const byRup={};
    normalizeRows(rows).forEach((r,index)=>{
      const kode=r.rup_no;
      const orderKey=r.po_id || r.purchase_order_no || `${kode}__${index}`;
      if(!byRup[kode]) byRup[kode]={total:0,order_count:0,line_count:0,orders:{},rows:[]};
      const g=byRup[kode];
      if(!g.orders[orderKey]){
        g.orders[orderKey]={
          rup_no:kode, po_id:r.po_id, purchase_order_no:r.purchase_order_no,
          quotation_no:r.quotation_no, buyer_name:r.buyer_name, seller_name:r.seller_name,
          reference_no:r.reference_no, notes:r.notes, grand_total:0, line_total:0,
          realisasi:0, line_count:0, items:[]
        };
      }
      const o=g.orders[orderKey];
      o.line_total += Number(r.total||0);
      if(Number(r.grand_total||0)>0) o.grand_total=Number(r.grand_total||0);
      o.line_count += 1;
      o.items.push({title:r.title,qty:r.qty,total:Number(r.total||0),sku_no:r.sku_no});
      g.line_count += 1;
    });
    Object.values(byRup).forEach(g=>{
      g.rows=Object.values(g.orders).map(o=>{
        o.realisasi=Number(o.grand_total||0)>0?Number(o.grand_total||0):Number(o.line_total||0);
        const titles=[...new Set((o.items||[]).map(x=>x.title).filter(Boolean))];
        o.item_summary=titles.slice(0,3).join(', ')+(titles.length>3?` +${titles.length-3} item`:'');
        return o;
      });
      g.order_count=g.rows.length;
      g.total=g.rows.reduce((s,o)=>s+Number(o.realisasi||0),0);
      delete g.orders;
    });
    return byRup;
  }

  function summarize(rows){
    const normalized=normalizeRows(rows);
    const groups=groupOrders(normalized);
    return {
      rowCount: normalized.length,
      rupCount: Object.keys(groups).length,
      orderCount: Object.values(groups).reduce((s,g)=>s+g.order_count,0),
      total: Object.values(groups).reduce((s,g)=>s+g.total,0)
    };
  }

  function load(){
    if(memoryCache) return memoryCache;
    try{
      const raw=localStorage.getItem(DATA_KEY);
      if(!raw) return null;
      const data=JSON.parse(raw);
      if(!data || !Array.isArray(data.rows)) return null;
      memoryCache=data;
      return data;
    }catch(_){ return null; }
  }

  function save(input){
    const rows=normalizeRows(input?.rows||[]);
    const payload={
      version:2,
      fileName:String(input?.fileName||''),
      importedAt:input?.importedAt||new Date().toISOString(),
      rows,
      summary:summarize(rows)
    };
    localStorage.setItem(DATA_KEY,JSON.stringify(payload));
    memoryCache=payload;
    try{ window.dispatchEvent(new CustomEvent('sippbj-toko-daring-updated',{detail:payload.summary})); }catch(_){}
    return payload;
  }

  function clear(){
    localStorage.removeItem(DATA_KEY);
    memoryCache=null;
    try{ window.dispatchEvent(new CustomEvent('sippbj-toko-daring-updated',{detail:null})); }catch(_){}
  }

  function getRows(){
    const data=load();
    return data?.rows || [];
  }

  function getGroups(){ return groupOrders(getRows()); }
  function getSummary(){ return load()?.summary || summarize([]); }
  function getMeta(){
    const d=load();
    return d?{fileName:d.fileName||'',importedAt:d.importedAt||'',summary:d.summary||summarize(d.rows||[]),stale:Date.now()-new Date(d.importedAt||0).getTime()>MAX_AGE_MS}:null;
  }

  function setSyncUrl(url){ localStorage.setItem(SYNC_URL_KEY,String(url||'').trim()); }
  function getSyncUrl(){ return String(localStorage.getItem(SYNC_URL_KEY)||'').trim(); }

  async function syncToDrive(payload){
    const url=getSyncUrl();
    if(!url) throw new Error('URL sinkronisasi Google Sheet belum diisi.');
    const data=payload||load();
    if(!data?.rows?.length) throw new Error('Belum ada data Toko Daring untuk dikirim.');
    const response=await fetch(url,{
      method:'POST',
      redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'replace_toko_daring',rows:data.rows,fileName:data.fileName||'',importedAt:data.importedAt||new Date().toISOString()})
    });
    if(!response.ok) throw new Error(`Sinkronisasi gagal. HTTP ${response.status}`);
    const text=await response.text();
    let result={ok:true,message:text};
    try{result=JSON.parse(text);}catch(_){}
    if(result && result.ok===false) throw new Error(result.message||'Sinkronisasi gagal.');
    return result;
  }

  window.SippbjTokoDaringStore={
    DATA_KEY, normalizeCode, parseMoney, normalizeRows, groupOrders, summarize,
    load, save, clear, getRows, getGroups, getSummary, getMeta,
    setSyncUrl, getSyncUrl, syncToDrive
  };
})();
