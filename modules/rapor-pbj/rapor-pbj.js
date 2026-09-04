(function () {
  const CONFIG = {
    SHEET_ID: '1ccDgtXNATxSYMZuDgd3polvRiTFNiFnjIGMP7b9qmrU',
    SHEETS: {
      index: 'INDEX_RAPOT',
      sirup: 'SIRUP_STRUKTUR_ANGGARAN',
      perencanaan: 'PERENCANAAN',
      realisasi: 'REALISASI',
      monitoring: 'MONITORING_JADWAL',
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
    :host{
      --paper:#fffdf7;
      --paper-2:#f7f1e6;
      --paper-3:#eee6d7;
      --ink:#17304f;
      --muted:#6d7c8c;
      --blue:#1e5b96;
      --blue-soft:#e8f1f8;
      --teal:#3f9a95;
      --red:#c84b45;
      --gold:#d2a84d;
      --line:#d9e1e7;
      --shadow:0 18px 45px rgba(34,49,63,.12);
      display:block;
      color:var(--ink);
      font-family:"Inter","Segoe UI",Arial,sans-serif;
    }
    *{box-sizing:border-box}
    a{color:#174f84;text-underline-offset:3px}
    .rp-wrap{
      width:100%;
      max-width:none;
      margin:0;
      padding:8px 10px 28px;
      color:var(--ink);
      background:
        radial-gradient(circle at 18% 0%,rgba(210,168,77,.08),transparent 22%),
        linear-gradient(180deg,#f7f4ee 0%,#f0ede6 100%);
      border-radius:24px;
    }

    /* ===== DASHBOARD COVER / BOOK FRONT ===== */
    .rp-hero{
      position:relative;
      overflow:hidden;
      isolation:isolate;
      color:var(--ink);
      border-radius:22px 22px 18px 18px;
      padding:26px 30px 28px 42px;
      margin-bottom:22px;
      background:
        linear-gradient(90deg,rgba(30,91,150,.12) 0 1px,transparent 1px 100%),
        linear-gradient(180deg,rgba(23,48,79,.045) 0 1px,transparent 1px 100%),
        var(--paper);
      background-size:100% 100%,100% 34px,auto;
      border:1px solid #ddd7cc;
      box-shadow:var(--shadow);
    }
    .rp-hero::before{
      content:"";
      position:absolute;
      left:18px;
      top:0;
      bottom:0;
      width:5px;
      background:linear-gradient(180deg,var(--red),#df776f);
      box-shadow:8px 0 0 rgba(30,91,150,.10);
    }
    .rp-hero::after{
      content:"";
      position:absolute;
      right:26px;
      top:-1px;
      width:152px;
      height:26px;
      background:var(--blue);
      border-radius:0 0 10px 10px;
      box-shadow:0 7px 14px rgba(30,91,150,.14);
    }
    .rp-hero>*{position:relative;z-index:1}
    .rp-kicker{
      display:inline-flex;
      align-items:center;
      min-height:26px;
      padding:0;
      margin:0 0 8px;
      color:var(--red);
      font-size:10px;
      font-weight:900;
      letter-spacing:.16em;
      text-transform:uppercase;
    }
    .rp-hero h1{
      margin:0 0 7px;
      font-family:Georgia,"Times New Roman",serif;
      font-size:40px;
      line-height:1.04;
      font-weight:700;
      letter-spacing:-.035em;
      color:#15375c;
    }
    .rp-hero p{
      margin:0;
      color:#687789;
      line-height:1.7;
      max-width:920px;
      font-size:14px;
    }
    .rp-summary-strip{
      display:grid;
      grid-template-columns:repeat(5,minmax(0,1fr));
      gap:10px;
      margin-top:22px;
      align-items:end;
    }
    .rp-sum-card{
      position:relative;
      overflow:visible;
      min-height:84px;
      background:#fffefa;
      border:1px solid #ded9d0;
      border-radius:10px 10px 14px 14px;
      padding:17px 14px 12px;
      box-shadow:0 7px 18px rgba(40,52,64,.08);
      transition:transform .32s cubic-bezier(.22,.8,.2,1),box-shadow .32s ease;
    }
    .rp-sum-card::before{
      content:"";
      position:absolute;
      left:12px;
      top:-9px;
      width:54%;
      height:10px;
      border-radius:7px 7px 0 0;
      background:var(--blue);
      opacity:.92;
    }
    .rp-sum-card:nth-child(2)::before{background:var(--gold)}
    .rp-sum-card:nth-child(3)::before{background:var(--red)}
    .rp-sum-card:nth-child(4)::before{background:var(--teal)}
    .rp-sum-card:nth-child(5)::before{background:#6b7a8d}
    .rp-sum-card:hover{
      transform:translateY(-4px) rotate(-.18deg);
      box-shadow:0 13px 26px rgba(40,52,64,.13);
    }
    .rp-sum-label{
      font-size:10px;
      letter-spacing:.10em;
      text-transform:uppercase;
      font-weight:900;
      color:#7b8793;
      margin-bottom:6px;
    }
    .rp-sum-value{
      font-family:Georgia,"Times New Roman",serif;
      font-size:29px;
      font-weight:700;
      color:#173a61;
      line-height:1.05;
    }

    /* ===== PAPER PANELS ===== */
    .rp-card{
      position:relative;
      overflow:visible;
      background:var(--paper);
      border:1px solid #ddd8ce;
      border-radius:16px;
      box-shadow:0 12px 30px rgba(40,52,64,.09);
      padding:22px 22px 20px 28px;
      margin-bottom:18px;
    }
    .rp-card::before{
      content:"";
      position:absolute;
      left:8px;
      right:-7px;
      top:7px;
      bottom:-8px;
      z-index:-1;
      border-radius:16px;
      border:1px solid #e6dfd4;
      background:#ece7dd;
      transform:rotate(.12deg);
    }
    .rp-card::after{
      content:"";
      position:absolute;
      left:0;
      top:22px;
      width:4px;
      height:48px;
      background:var(--teal);
      border-radius:0 4px 4px 0;
    }
    .rp-card h2{
      margin:0 0 12px;
      font-family:Georgia,"Times New Roman",serif;
      font-size:23px;
      font-weight:700;
      color:#15375c;
      letter-spacing:-.02em;
    }
    .rp-sub{
      font-size:12.5px;
      color:#788596;
      line-height:1.6;
      margin-top:-5px;
      margin-bottom:14px;
    }
    .rp-grid{display:grid;gap:11px}
    .rp-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}
    .rp-grid-5{grid-template-columns:repeat(5,minmax(0,1fr))}

    label{
      display:block;
      font-size:10px;
      font-weight:900;
      margin-bottom:6px;
      color:#607286;
      text-transform:uppercase;
      letter-spacing:.09em
    }
    input,select,button{
      width:100%;
      padding:11px 13px;
      border-radius:10px;
      border:1px solid #d5dde4;
      font-size:13px;
      font-family:inherit;
      background:#fffefa;
      color:#18324f;
    }
    input:focus,select:focus{
      outline:none;
      border-color:#6d9bc5;
      box-shadow:0 0 0 3px rgba(30,91,150,.10)
    }
    .rp-btn,button{
      border:1px solid #164f84;
      cursor:pointer;
      font-weight:900;
      background:#1e5b96;
      color:#fff;
      box-shadow:0 6px 13px rgba(30,91,150,.16);
      transition:transform .24s cubic-bezier(.22,.8,.2,1),box-shadow .24s ease,background .24s ease;
    }
    .rp-btn:hover,button:hover{
      transform:translateY(-2px);
      box-shadow:0 9px 18px rgba(30,91,150,.20);
      background:#174f84;
    }
    button.secondary,.rp-btn.secondary{
      background:#fffdf8;
      color:#29445f;
      border:1px solid #d5dde4;
      box-shadow:0 4px 12px rgba(36,48,60,.06)
    }
    button.secondary:hover,.rp-btn.secondary:hover{background:#f6f1e8}
    .rp-inline-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
    .rp-inline-actions button{width:auto}
    .rp-status{margin-top:10px;font-weight:800;color:#31577d;line-height:1.6;white-space:pre-wrap}

    /* ===== LEDGER TABLE ===== */
    .rp-table-wrap{
      overflow:auto;
      border:1px solid #d9dfdf;
      border-radius:12px;
      background:#fffefa;
      box-shadow:none
    }
    table{
      width:100%;
      border-collapse:collapse;
      min-width:1000px;
      font-size:13px
    }
    th,td{
      padding:11px 12px;
      border-bottom:1px solid #e1e5e5;
      vertical-align:top;
      text-align:left;
      line-height:1.48
    }
    th{
      background:#eaf1f6;
      color:#214b72;
      font-size:11px;
      font-weight:900;
      letter-spacing:.035em;
      text-transform:uppercase;
      border-bottom:2px solid #c7d7e5;
    }
    tbody tr{transition:background .18s ease}
    tbody tr:hover{background:#fbf7ee}
    .rp-badge-status{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:6px 10px;
      border-radius:7px;
      font-size:11px;
      font-weight:900;
      border:1px solid transparent;
      white-space:nowrap
    }
    .st-draft{background:#fff5dc;color:#8b5c00;border-color:#e8ce91}
    .st-menunggu{background:#edf5fb;color:#225f97;border-color:#bfd4e5}
    .st-revisi{background:#fff0ed;color:#a23b35;border-color:#e7bbb6}
    .st-ok{background:#eaf6f1;color:#27776e;border-color:#bcded5}
    .st-belum{background:#fff0ed;color:#a23b35;border-color:#e7bbb6}
    .st-default{background:#f4f2ed;color:#64717d;border-color:#ddd9d0}
    .rp-btn-link{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:auto;
      min-width:66px;
      padding:8px 11px;
      border-radius:8px;
      font-size:12px;
      font-weight:900;
      cursor:pointer;
      background:#fffdf8;
      color:#24547e;
      border:1px solid #cfd8df;
      text-decoration:none;
      box-shadow:0 3px 8px rgba(40,52,64,.05)
    }
    .rp-btn-link:hover{transform:translateY(-1px);background:#f5f0e6}
    .rp-btn-link.disabled{opacity:.5;cursor:not-allowed;pointer-events:none;filter:grayscale(.1)}
    .rp-pagination-wrap{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px}
    .rp-pagination-info{font-size:12px;color:#748393;font-weight:700}
    .rp-pagination{display:flex;gap:7px;flex-wrap:wrap}
    .rp-page-btn{
      min-width:38px;
      width:auto;
      padding:8px 10px;
      border-radius:8px;
      border:1px solid #d1d9de;
      background:#fffdf8;
      color:#29445f;
      font-weight:900;
      cursor:pointer;
      box-shadow:none
    }
    .rp-page-btn.active{background:#1e5b96;color:#fff;border-color:#1e5b96}
    .rp-page-btn:disabled{opacity:.45;cursor:not-allowed}

    /* ===== REPORT: READING BOOK / DOSSIER ===== */
    .rp-toolbar{
      position:sticky;
      top:8px;
      z-index:30;
      display:flex;
      gap:9px;
      flex-wrap:wrap;
      margin:0 0 18px;
      padding:9px;
      border-radius:12px;
      background:rgba(247,244,238,.88);
      backdrop-filter:blur(10px);
      border:1px solid rgba(211,205,194,.9)
    }
    .rp-toolbar button{width:auto}
    .rp-report-wrap{
      counter-reset:folio;
      width:100%;
      max-width:none;
      margin:0;
      padding:12px 14px 34px;
      background:
        radial-gradient(circle at 10% 0%,rgba(210,168,77,.07),transparent 22%),
        linear-gradient(180deg,#f5f1e9,#ece7de);
      border-radius:22px;
    }
    .rp-report-page{
      counter-increment:folio;
      position:relative;
      background:
        linear-gradient(90deg,transparent 0 52px,rgba(200,75,69,.12) 52px 53px,transparent 53px),
        repeating-linear-gradient(180deg,transparent 0 31px,rgba(60,87,108,.045) 31px 32px),
        var(--paper);
      border-radius:4px 14px 14px 4px;
      margin:0 auto 28px;
      width:min(100%,1380px);
      overflow:visible;
      border:1px solid #d8d1c5;
      box-shadow:0 22px 50px rgba(46,55,63,.13),-9px 8px 0 #e7e0d4;
      page-break-after:always;
      animation:rpPaperIn .48s cubic-bezier(.22,.8,.2,1) both;
      transform-origin:50% 0;
    }
    .rp-report-page:last-child{page-break-after:auto}
    .rp-report-page::before{
      content:"";
      position:absolute;
      left:21px;
      top:34px;
      width:13px;
      height:13px;
      border-radius:50%;
      background:#ebe5da;
      border:1px solid #cfc7b9;
      box-shadow:
        0 90px 0 #ebe5da,0 90px 0 1px #cfc7b9,
        0 180px 0 #ebe5da,0 180px 0 1px #cfc7b9;
      z-index:4;
    }
    .rp-report-page::after{
      content:"0" counter(folio);
      position:absolute;
      right:-1px;
      top:18px;
      min-width:50px;
      height:29px;
      padding:0 11px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:8px 0 0 8px;
      background:#1e5b96;
      color:#fff;
      font-size:10px;
      font-weight:900;
      letter-spacing:.12em;
      box-shadow:-6px 7px 14px rgba(30,91,150,.12);
      transition:transform .28s cubic-bezier(.22,.8,.2,1);
      z-index:8;
    }
    .rp-report-page:hover::after{transform:translateX(4px)}
    @keyframes rpPaperIn{
      from{opacity:0;transform:translateY(16px) scale(.995)}
      to{opacity:1;transform:translateY(0) scale(1)}
    }
    .rp-page-head{
      position:relative;
      background:transparent;
      color:#15375c;
      padding:28px 74px 18px 76px;
      border-bottom:1px solid #d9d4ca;
    }
    .rp-page-head::after{
      content:"";
      position:absolute;
      left:76px;
      right:28px;
      bottom:-1px;
      height:2px;
      background:linear-gradient(90deg,var(--blue),var(--teal),transparent 80%);
    }
    .rp-page-head h1,.rp-page-head h2{margin:0}
    .rp-page-head h2{
      font-family:Georgia,"Times New Roman",serif;
      font-size:24px;
      line-height:1.25;
      letter-spacing:-.02em;
      text-transform:none;
      color:#163c63;
    }
    .rp-page-head h2::before{
      content:"BAGIAN " counter(folio) "  ";
      display:block;
      margin-bottom:6px;
      color:var(--red);
      font-family:"Inter","Segoe UI",Arial,sans-serif;
      font-size:9px;
      font-weight:900;
      letter-spacing:.18em;
    }

    /* Cover */
    .rp-cover{
      min-height:420px;
      display:flex;
      flex-direction:column;
      justify-content:center;
      text-align:left;
      padding:54px 96px 54px 92px;
      background:
        linear-gradient(90deg,#1e5b96 0 18px,transparent 18px),
        linear-gradient(180deg,rgba(63,154,149,.07),transparent 50%);
      border-bottom:none;
    }
    .rp-cover::after{
      left:92px;
      right:92px;
      bottom:42px;
      height:1px;
      background:#c8d4dc;
    }
    .rp-cover-label{
      display:inline-flex;
      align-self:flex-start;
      margin-bottom:26px;
      padding:7px 10px;
      border:1px solid #d7cdbd;
      background:#f2ebde;
      border-radius:4px;
      color:#8b594f;
      font-size:9px;
      font-weight:900;
      letter-spacing:.15em;
      text-transform:uppercase;
    }
    .rp-main-title{
      font-family:Georgia,"Times New Roman",serif;
      font-size:47px;
      font-weight:700;
      line-height:1.04;
      margin-bottom:16px;
      text-transform:none;
      color:#15375c;
      letter-spacing:-.035em;
      max-width:720px;
    }
    .rp-sub-title{
      font-size:21px;
      font-weight:800;
      line-height:1.45;
      text-transform:none;
      color:#334d68;
      max-width:980px;
    }
    .rp-period{
      margin-top:24px;
      font-size:12px;
      font-weight:900;
      letter-spacing:.13em;
      color:var(--red);
      text-transform:uppercase
    }

    .rp-page-body{padding:25px 30px 30px 76px}
    .rp-meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:18px}
    .rp-meta-box,.rp-summary-box,.rp-link-box,.rp-note-box{
      background:rgba(255,254,250,.92);
      border:1px solid #dcd8d0;
      border-radius:10px;
      padding:14px 15px;
      box-shadow:0 3px 9px rgba(39,53,66,.035)
    }
    .rp-meta-label,.rp-summary-box .label{
      font-size:9px;
      color:#728091;
      font-weight:900;
      text-transform:uppercase;
      letter-spacing:.09em;
      margin-bottom:6px
    }
    .rp-meta-value{
      font-family:Georgia,"Times New Roman",serif;
      font-size:18px;
      font-weight:700;
      color:#1d334a;
      word-break:break-word
    }
    .rp-note-line{font-size:12px;color:#687789;margin-top:10px}
    .rp-report-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-bottom:16px}
    .rp-summary-box{position:relative;min-height:76px}
    .rp-summary-box::before{
      content:"";
      position:absolute;
      left:0;top:0;bottom:0;width:3px;
      background:var(--teal);
      border-radius:10px 0 0 10px
    }
    .rp-summary-box:nth-child(2)::before{background:var(--gold)}
    .rp-summary-box:nth-child(3)::before{background:var(--blue)}
    .rp-summary-box .value{
      font-family:Georgia,"Times New Roman",serif;
      font-size:19px;
      font-weight:700;
      color:#1c354f
    }
    .center{text-align:center}.right{text-align:right}.bold{font-weight:800}

    /* Screenshot as pasted evidence */
    .rp-img-box{
      position:relative;
      background:#f4efe5;
      border:1px solid #d9d1c5;
      border-radius:5px;
      padding:22px;
      min-height:120px;
      box-shadow:0 10px 20px rgba(41,50,57,.08);
      transform:rotate(-.08deg)
    }
    .rp-img-box::before,.rp-img-box::after{
      content:"";
      position:absolute;
      top:-9px;
      width:90px;
      height:21px;
      background:rgba(225,211,179,.72);
      border:1px solid rgba(185,167,132,.34);
      transform:rotate(-2deg);
      z-index:2;
    }
    .rp-img-box::before{left:12%}
    .rp-img-box::after{right:12%;transform:rotate(2deg)}
    .rp-img-box img{
      display:block;
      max-width:100%;
      max-height:560px;
      object-fit:contain;
      margin:0 auto;
      border-radius:2px;
      background:#fff;
      border:1px solid #ddd;
      box-shadow:0 5px 14px rgba(40,48,55,.07)
    }
    .rp-link-box,.rp-note-box{word-break:break-word;white-space:pre-wrap;line-height:1.72}
    .rp-bullets{margin:0;padding-left:20px;line-height:1.85;font-size:14px}
    .rp-muted{color:#788596;font-size:12px}
    .rp-narasi-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .rp-head-toggle-btn{
      border:1px solid #cfd8df;
      border-radius:8px;
      padding:8px 12px;
      font-weight:900;
      cursor:pointer;
      background:#fffdf8;
      color:#24547e;
      width:auto;
      box-shadow:none
    }
    .rp-head-toggle-btn:hover{background:#f3eee5;color:#173b60}
    .rp-voice-panel{background:#f4f8fa;border:1px solid #cfdae2;border-radius:10px;padding:14px;margin-top:14px}
    .rp-voice-meta{display:flex;justify-content:space-between;align-items:center;gap:12px;font-weight:800;color:#29445f;margin-bottom:9px}
    .rp-voice-progress{width:100%;height:8px;background:#dbe3e7;border-radius:999px;overflow:hidden}
    .rp-voice-progress-fill{width:0%;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--blue),var(--teal));transition:width .12s linear}
    .rp-hidden{display:none!important}

    @media(max-width:1100px){
      .rp-summary-strip{grid-template-columns:repeat(2,minmax(0,1fr))}
      .rp-grid-5{grid-template-columns:repeat(2,minmax(0,1fr))}
      .rp-report-page{box-shadow:0 15px 34px rgba(46,55,63,.11)}
    }
    @media(max-width:900px){
      .rp-wrap{padding:4px}
      .rp-hero{padding:24px 18px 24px 32px}
      .rp-hero h1{font-size:32px}
      .rp-summary-strip,.rp-grid-5,.rp-grid-2,.rp-meta-grid,.rp-report-summary{grid-template-columns:1fr}
      .rp-inline-actions{flex-direction:column}
      .rp-inline-actions button{width:100%}
      .rp-report-wrap{padding:7px}
      .rp-report-page{border-radius:3px 10px 10px 3px;box-shadow:0 12px 26px rgba(46,55,63,.10)}
      .rp-page-head{padding:24px 58px 16px 48px}
      .rp-page-head::after{left:48px}
      .rp-page-body{padding:22px 18px 26px 48px}
      .rp-cover{padding:48px 42px 52px 52px}
      .rp-main-title{font-size:34px}
      .rp-sub-title{font-size:18px}
      .rp-report-page::before{left:15px}
    }
    @media print{
      :host{--paper:#fff}
      .rp-toolbar,#status{display:none!important}
      .rp-report-wrap{padding:0;background:#fff}
      .rp-report-page{
        width:100%;
        margin:0;
        border:none;
        border-radius:0;
        box-shadow:none;
        background:#fff;
        animation:none;
        break-after:page
      }
      .rp-report-page::before,.rp-report-page::after,.rp-img-box::before,.rp-img-box::after{display:none!important}
      .rp-page-head{padding-left:32px}
      .rp-page-body{padding-left:32px}
      .rp-img-box{transform:none;box-shadow:none}
    }
  `;

  function $(selector) { return shadow ? shadow.querySelector(selector) : null; }
  function $all(selector) { return shadow ? Array.from(shadow.querySelectorAll(selector)) : []; }
  function setText(selector, val) { const el = typeof selector === 'string' ? $(selector) : selector; if (el) el.innerText = (val === undefined || val === null || val === '') ? '-' : val; }
  function setHtml(selector, html) { const el = typeof selector === 'string' ? $(selector) : selector; if (el) el.innerHTML = html || '-'; }
  function esc(v) { return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
  function norm(v) { return String(v || '').trim().toLowerCase().replace(/\s+/g,' '); }

  function csvUrlBySheetName(sheetId, sheetName) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }

  function ensurePapa() {
    return new Promise((resolve, reject) => {
      if (window.Papa && typeof window.Papa.parse === 'function') { resolve(); return; }
      const existing = document.querySelector('script[data-rapor-papa="true"]');
      if (existing) {
        existing.addEventListener('load', resolve, { once:true });
        existing.addEventListener('error', reject, { once:true });
        return;
      }
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
        <div class="rp-hero">\n          <div class="rp-kicker">SIPPBJ / Rapor Pengadaan</div>\n          <h1>Dashboard Rapor PBJ</h1>
          <p>Monitoring perkembangan Rapor PBJ perangkat daerah.</p>
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

  function findMonitoringRow(rows, indexRow) {
    const list = (rows || []).map(normalizeRecordKeys);
    const idRapot = norm(indexRow && indexRow.id_rapot);
    const kode = norm(indexRow && indexRow.kode_opd);
    const nama = norm(indexRow && indexRow.nama_opd);
    return list.find((r) => norm(r.id_rapot) === idRapot)
      || list.find((r) => norm(r.kode_opd) === kode && norm(r.tahun) === norm(indexRow && indexRow.tahun) && norm(r.bulan) === norm(indexRow && indexRow.bulan))
      || list.find((r) => norm(r.nama_opd) === nama && norm(r.tahun) === norm(indexRow && indexRow.tahun) && norm(r.bulan) === norm(indexRow && indexRow.bulan))
      || list.find((r) => norm(r.kode_opd) === kode)
      || list.find((r) => norm(r.nama_opd) === nama)
      || {};
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
  function linkifyText(text) {
    const raw = String(text || '');
    const parts = raw.split(/(https?:\/\/[^\s<>"']+)/g);
    return parts.map((part) => {
      if (/^https?:\/\//i.test(part)) {
        const cleanUrl = part.replace(/[.,;:)]+$/g, '');
        const tail = part.slice(cleanUrl.length);
        return `<a href="${esc(cleanUrl)}" target="_blank" rel="noopener noreferrer">${esc(cleanUrl)}</a>${esc(tail)}`;
      }
      return esc(part);
    }).join('');
  }

  function renderBullets(text) {
    const val = String(text || '').trim(); if (!val || val === '-') return '<div class="rp-note-box rp-muted">Tidak ada analisis manual.</div>';
    const lines = val.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (lines.length <= 1) return `<div class="rp-note-box">${linkifyText(val)}</div>`;
    return `<div class="rp-note-box"><ul class="rp-bullets">${lines.map((line) => `<li>${linkifyText(line.replace(/^[-•]\s*/, ''))}</li>`).join('')}</ul></div>`;
  }

  function renderReportShell(id) {
    shadow.innerHTML = `<style>${STYLE}</style>
      <div class="rp-report-wrap">
        <div class="rp-toolbar"><button class="rp-btn secondary" id="backToDashboardButton" type="button">← Kembali ke Dashboard</button><button class="rp-btn" id="printReportButton" type="button">Print / Save PDF</button></div>
        <div id="status" class="rp-status rp-card">Memuat laporan...</div>
        <div id="content" class="rp-hidden">
          <div class="rp-report-page"><div class="rp-page-head rp-cover"><div class="rp-cover-label">SIPPBJ · Dokumen Rapor Pengadaan</div><div class="rp-main-title">Rapor PBJ OPD</div><div class="rp-sub-title" id="cover_nama_opd">-</div><div class="rp-period" id="cover_periode">PERIODE -</div></div><div class="rp-page-body"><div class="rp-meta-grid"><div class="rp-meta-box"><div class="rp-meta-label">ID Rapor</div><div class="rp-meta-value" id="v_id_rapot">-</div></div><div class="rp-meta-box"><div class="rp-meta-label">Status QC</div><div class="rp-meta-value" id="v_status_qc">-</div></div><div class="rp-meta-box"><div class="rp-meta-label">Kode OPD</div><div class="rp-meta-value" id="v_kode_opd">-</div></div><div class="rp-meta-box"><div class="rp-meta-label">Nama OPD</div><div class="rp-meta-value" id="v_nama_opd">-</div></div></div><div class="rp-note-line" id="metaHeader">-</div></div></div>
          <div class="rp-report-page"><div class="rp-page-head"><h2>STRUKTUR ANGGARAN PBJ PERANGKAT DAERAH</h2></div><div class="rp-page-body"><div class="rp-report-summary"><div class="rp-summary-box"><div class="label">Total Pagu Penyedia</div><div class="value" id="sirup_penyedia">-</div></div><div class="rp-summary-box"><div class="label">Total Pagu Swakelola</div><div class="value" id="sirup_swakelola">-</div></div><div class="rp-summary-box"><div class="label">Total Pagu SiRUP</div><div class="value" id="sirup_total">-</div></div></div><div class="rp-report-summary"><div class="rp-summary-box"><div class="label">Struktur Anggaran RUP</div><div class="value" id="sirup_struktur">-</div></div><div class="rp-summary-box"><div class="label">Prosentase Keterumuman</div><div class="value" id="sirup_persentase">-</div></div><div class="rp-summary-box"><div class="label">Bulan / Tahun</div><div class="value"><span id="v_bulan">-</span> / <span id="v_tahun">-</span></div></div></div><div style="font-size:20px;font-weight:800;color:#0f4c81;text-transform:uppercase;margin:20px 0 18px;">Screenshot Struktur Anggaran</div><div id="img_struktur">-</div></div></div>
          <div class="rp-report-page"><div class="rp-page-head"><h2>PROSENTASE KETERUMUMAN SIRUP</h2></div><div class="rp-page-body"><div class="rp-table-wrap"><table><tbody><tr><th style="width:50%;">Uraian</th><th>Nilai</th></tr><tr><td>Total Pagu Penyedia</td><td id="sirup_penyedia_2" class="right">-</td></tr><tr><td>Total Pagu Swakelola</td><td id="sirup_swakelola_2" class="right">-</td></tr><tr><td>Total Pagu SiRUP</td><td id="sirup_total_2" class="right">-</td></tr><tr><td>Total Struktur Anggaran RUP</td><td id="sirup_struktur_2" class="right">-</td></tr><tr><td class="bold">Prosentase</td><td id="sirup_persentase_2" class="right bold">-</td></tr></tbody></table></div></div></div>
          ${renderPlanningTables()}
          ${renderMonitoringSection()}
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

  function renderMonitoringSection() {
    return `<div class="rp-report-page"><div class="rp-page-head"><h2>MONITORING JADWAL PEMILIHAN</h2></div><div class="rp-page-body"><div class="rp-report-summary"><div class="rp-summary-box"><div class="label">Total Paket</div><div class="value" id="monitoring_total_paket">-</div></div><div class="rp-summary-box"><div class="label">Sedang Berjalan</div><div class="value" id="monitoring_sedang_berjalan">-</div></div><div class="rp-summary-box"><div class="label">Selesai</div><div class="value" id="monitoring_selesai">-</div></div></div><div class="rp-report-summary"><div class="rp-summary-box"><div class="label">Belum Berjalan</div><div class="value" id="monitoring_belum_berjalan">-</div></div><div class="rp-summary-box"><div class="label">Melewati Waktu Pemilihan</div><div class="value" id="monitoring_melewati_waktu_pemilihan">-</div></div><div class="rp-summary-box"><div class="label">Melebihi Target Pemilihan</div><div class="value" id="monitoring_melebihi_target_pemilihan">-</div></div></div><div class="rp-meta-grid"><div class="rp-meta-box"><div class="rp-meta-label">Updated At</div><div class="rp-meta-value" id="monitoring_source_sync_at" style="font-size:15px;">-</div></div><div class="rp-meta-box"><div class="rp-meta-label">Catatan Monitoring</div><div class="rp-meta-value" id="monitoring_catatan" style="font-size:15px;line-height:1.7;">-</div></div></div></div></div>`;
  }

  function renderPlanningTables() {
    return `<div class="rp-report-page"><div class="rp-page-head"><h2>DATA PERENCANAAN PENGADAAN PERANGKAT DAERAH</h2></div><div class="rp-page-body"><div class="rp-table-wrap"><table><thead><tr><th>Cara Pengadaan</th><th>Metode Pemilihan Penyedia</th><th>Jumlah Paket</th><th>Jumlah Anggaran (Rp)</th><th>Prosentase Anggaran (%)</th></tr></thead><tbody>${['Tender & Seleksi','Pengadaan Langsung','E-Purchasing','Dikecualikan','-'].map((m,i)=>`<tr><td class="center">${i===4?'Swakelola':'Penyedia'}</td><td>${m}</td><td id="p_paket_${['tender','non','epur','catat','swak'][i]}" class="center">-</td><td id="p_pagu_${['tender','non','epur','catat','swak'][i]}" class="right">-</td><td id="p_pct_${['tender','non','epur','catat','swak'][i]}" class="center">-</td></tr>`).join('')}<tr><td class="center bold" colspan="2">TOTAL</td><td id="p_total_paket" class="center bold">-</td><td id="p_total_pagu" class="right bold">-</td><td id="p_total_pct" class="center bold">100,00%</td></tr></tbody></table></div></div></div>
    <div class="rp-report-page"><div class="rp-page-head"><h2>REALISASI PELAKSANAAN PBJ DI PERANGKAT DAERAH</h2></div><div class="rp-page-body"><div class="rp-table-wrap"><table><thead><tr><th rowspan="2">Cara Pengadaan</th><th rowspan="2">Metode Pemilihan Penyedia</th><th colspan="2">Rencana Pengadaan</th><th colspan="2">Realisasi</th></tr><tr><th>Jumlah Paket</th><th>Jumlah Anggaran (Rp)</th><th>Jumlah Paket</th><th>Jumlah Anggaran (Rp)</th></tr></thead><tbody>${['Tender & Seleksi','Pengadaan Langsung','E-Purchasing','Dikecualikan','-'].map((m,i)=>`<tr><td class="center">${i===4?'Swakelola':'Penyedia'}</td><td>${m}</td><td id="rp_paket_${['tender','non','epur','catat','swak'][i]}" class="center">-</td><td id="rp_pagu_${['tender','non','epur','catat','swak'][i]}" class="right">-</td><td id="r_paket_${['tender','non','epur','catat','swak'][i]}" class="center">-</td><td id="r_anggaran_${['tender','non','epur','catat','swak'][i]}" class="right">-</td></tr>`).join('')}<tr><td class="center bold" colspan="2">TOTAL</td><td id="rp_total_paket" class="center bold">-</td><td id="rp_total_pagu" class="right bold">-</td><td id="r_total_paket" class="center bold">-</td><td id="r_total_anggaran" class="right bold">-</td></tr></tbody></table></div></div></div>`;
  }

  async function loadReportData(id) {
    renderReportShell(id);
    if (!id) { setText('#status', 'Parameter id kosong.'); return; }
    try {
      const [indexRows,sirupRows,perencanaanRows,realisasiRows,monitoringRows,pelakuRows,itkpRows,analisisRows,aiRows] = await Promise.all([
        fetchSheet(CONFIG.SHEETS.index), fetchSheet(CONFIG.SHEETS.sirup), fetchSheet(CONFIG.SHEETS.perencanaan), fetchSheet(CONFIG.SHEETS.realisasi),
        fetchSheet(CONFIG.SHEETS.monitoring), fetchSheet(CONFIG.SHEETS.pelaku), fetchSheet(CONFIG.SHEETS.itkp), fetchSheet(CONFIG.SHEETS.analisis), fetchSheet(CONFIG.SHEETS.aiReport)
      ]);
      const index = findRowById(indexRows, id);
      const data = {
        index,
        sirup: findRowById(sirupRows, id),
        perencanaan: findRowById(perencanaanRows, id),
        realisasi: findRowById(realisasiRows, id),
        monitoring_jadwal: findMonitoringRow(monitoringRows, index),
        pelaku: findRowById(pelakuRows, id),
        itkp: findRowById(itkpRows, id),
        analisis_manual: findRowById(analisisRows, id),
        ai_report: findRowById(aiRows, id)
      };
      if (!data.index.id_rapot) { setText('#status', 'Data report tidak ditemukan untuk ID: ' + id); return; }
      renderReportData(data);
    } catch (err) {
      console.error(err);
      setText('#status', 'Error server: ' + (err?.message || String(err)));
    }
  }

  function renderReportData(data) {
    const index = data.index || {}, sirup = data.sirup || {}, perencanaan = data.perencanaan || {}, realisasi = data.realisasi || {}, monitoring = data.monitoring_jadwal || {}, pelaku = data.pelaku || {}, itkp = data.itkp || {}, analisis = data.analisis_manual || {}, aiReport = data.ai_report || {};
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

    setText('#monitoring_total_paket', formatInteger(monitoring.total_paket));
    setText('#monitoring_sedang_berjalan', formatInteger(monitoring.sedang_berjalan || monitoring.total_berjalan));
    setText('#monitoring_selesai', formatInteger(monitoring.selesai || monitoring.total_selesai));
    setText('#monitoring_belum_berjalan', formatInteger(monitoring.belum_berjalan || monitoring.total_belum));
    setText('#monitoring_melewati_waktu_pemilihan', formatInteger(monitoring.melewati_waktu_pemilihan || monitoring.total_melewati));
    setText('#monitoring_melebihi_target_pemilihan', formatInteger(monitoring.melebihi_target_pemilihan || monitoring.total_meleibihi || monitoring.total_melebihi || monitoring.melewati_waktu_pe));
    setText('#monitoring_source_sync_at', monitoring.updated_at || monitoring.source_sync_at || '-');
    setText('#monitoring_catatan', monitoring.catatan_monitoring || '-');

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
