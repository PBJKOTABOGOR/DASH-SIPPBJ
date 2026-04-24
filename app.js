const APP_ROUTES = {
  dashboard: {
    title: 'Dashboard TRAXPBJ',
    subtitle: 'Ringkasan informasi utama untuk monitoring dan analisis pengadaan.',
    type: 'internal'
  },

  'monitoring-sirup': {
    title: 'Monitoring SiRUP',
    subtitle: 'Monitoring paket perencanaan yang diumumkan di SiRUP serta rekap indikator ITKP.',
    type: 'module',
    html: 'modules/monitoring/itkp-sirup/itkp-sirup.html',
    css: 'modules/monitoring/itkp-sirup/itkp-sirup.css',
    js: 'modules/monitoring/itkp-sirup/itkp-sirup.js'
  },

  'monitoring-ekatalog': {
    title: 'Monitoring eKatalog',
    subtitle: 'Halaman ini sedang disiapkan untuk monitoring indikator pemanfaatan eKatalog.',
    type: 'placeholder'
  },

  'monitoring-etendering': {
    title: 'Monitoring eTendering',
    subtitle: 'Halaman ini sedang disiapkan untuk monitoring indikator pemanfaatan eTendering.',
    type: 'placeholder'
  },

  'monitoring-ekontrak': {
    title: 'Monitoring eKontrak',
    subtitle: 'Halaman ini sedang disiapkan untuk monitoring indikator pemanfaatan eKontrak.',
    type: 'placeholder'
  },

  'monitoring-nontender': {
    title: 'Monitoring Non eTendering/Non ePurchasing',
    subtitle: 'Halaman ini sedang disiapkan untuk monitoring Non eTendering/Non ePurchasing.',
    type: 'placeholder'
  },

  'rapor-pbj': {
    title: 'Rapor PBJ',
    subtitle: 'Portal laporan Rapor PBJ perangkat daerah.',
    type: 'iframe',
    url: 'https://pbjkotabogor.github.io/raporpbj/'
  },

  'monitoring-perencanaan': {
    title: 'Monitoring Realisasi',
    subtitle: 'Pemantauan progres realisasi paket pengadaan perangkat daerah.',
    type: 'module',
    html: 'modules/monitoring/perencanaan/monitoring.html',
    css: 'modules/monitoring/perencanaan/monitoring.css',
    js: 'modules/monitoring/perencanaan/monitoring.js',
    externalScripts: [
      'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js'
    ]
  },

  'monitoring-konsolidasi': {
    title: 'Konsolidasi',
    subtitle: 'Halaman ini sedang disiapkan untuk progres konsolidasi dan monitoring paket konsolidasi.',
    type: 'placeholder'
  },

  'simulasi-timeline': {
    title: 'Simulasi Timeline Pengadaan',
    subtitle: 'Simulasi penyusunan timeline pengadaan barang dan jasa.',
    type: 'module',
    html: 'modules/timeline/simulasi-timeline.html',
    css: 'modules/timeline/simulasi-timeline.css',
    js: 'modules/timeline/simulasi-timeline.js'
  },

  'simulasi-nontender': {
    title: 'Pencatatan Non Tender',
    subtitle: 'Simulasi PPK untuk pencatatan paket non tender.',
    type: 'iframe',
    url: 'https://pbjkotabogor.github.io/SIMPPK/login.html'
  }
};

const contentArea = document.getElementById('contentArea');
const sidebar = document.getElementById('sidebar');
const sidebarToggleButton = document.getElementById('sidebarToggleButton');

let activeModuleCleanup = null;
let activeModuleToken = 0;

function cleanupDynamicModule() {
  if (typeof activeModuleCleanup === 'function') {
    try {
      activeModuleCleanup();
    } catch (error) {
      console.warn('Cleanup module error:', error);
    }
  }

  activeModuleCleanup = null;

  document.querySelectorAll('[data-dynamic-module-css]').forEach((el) => el.remove());
  document.querySelectorAll('[data-dynamic-module-js]').forEach((el) => el.remove());
  document.querySelectorAll('[data-dynamic-external-script]').forEach((el) => el.remove());
}

function loadExternalScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-dynamic-external-script="true"][src^="${src}"]`);

    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Gagal memuat ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.dynamicExternalScript = 'true';
    script.dataset.loaded = 'false';

    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Gagal memuat ${src}`));
    };

    document.body.appendChild(script);
  });
}

function renderDashboard() {
  contentArea.innerHTML = `
    <section class="hero-card">
      <h3>Selamat datang di TRAXPBJ</h3>
      <p>Ringkasan utama untuk monitoring, analisis, simulasi, dan pelaporan pengadaan barang/jasa.</p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">ITKP</div>
          <div class="value">86,42%</div>
          <div class="desc">Tingkat kematangan PBJ</div>
        </div>
        <div class="stat-card">
          <div class="label">Konsolidasi</div>
          <div class="value">128</div>
          <div class="desc">Paket terkonsolidasi</div>
        </div>
        <div class="stat-card">
          <div class="label">Paket Belum Berjalan</div>
          <div class="value">6.666</div>
          <div class="desc">Breakdown realisasi paket</div>
        </div>
        <div class="stat-card">
          <div class="label">Rapor PBJ</div>
          <div class="value">44</div>
          <div class="desc">Laporan rapor tersedia</div>
        </div>
      </div>
    </section>

    <section class="grid-main">
      <div class="card">
        <h3>Ringkasan Dashboard</h3>
        <div class="summary-panels">
          <div class="mini-card">
            <h4>Skor ITKP</h4>
            <div class="big-number">86,42%</div>
            <div class="progress-track">
              <div class="progress-bar" style="width:86.42%"></div>
            </div>
            <div class="dimensions">
              ${renderDimension('SiRUP', 92.10)}
              ${renderDimension('eKatalog', 84.33)}
              ${renderDimension('eTendering', 83.21)}
              ${renderDimension('eKontrak', 79.45)}
              ${renderDimension('Non Tender', 88.60)}
            </div>
          </div>

          <div class="mini-card">
            <h4>Belum Berjalan per Metode</h4>
            <div class="table-lite">
              <div class="table-row table-head"><div>Metode</div><div>Jumlah</div></div>
              <div class="table-row"><div>Pengadaan Langsung</div><div>3.821</div></div>
              <div class="table-row"><div>e-Purchasing</div><div>1.744</div></div>
              <div class="table-row"><div>Tender</div><div>633</div></div>
              <div class="table-row"><div>Seleksi</div><div>214</div></div>
              <div class="table-row"><div>Lainnya</div><div>254</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Aktivitas / Informasi</h3>
        <div class="activities">
          ${renderActivity('#2ab56f', '✓', 'Rapor PBJ Bulan April 2026 telah tersedia', 'Laporan rapor untuk 10 OPD telah berhasil dibuat.', '2 jam lalu')}
          ${renderActivity('#4c7df2', '📊', 'Update Dashboard ITKP', 'Data monitoring ITKP diperbarui pada portal.', '3 jam lalu')}
          ${renderActivity('#8e61e9', '📦', 'Monitoring Realisasi diperbarui', 'Sinkronisasi data realisasi paket berhasil dimuat.', '5 jam lalu')}
          ${renderActivity('#ef8d21', '🧾', 'Konsolidasi sedang disiapkan', 'Menu konsolidasi masih dalam proses pengembangan.', '1 hari lalu')}
          ${renderActivity('#12a8a1', '📝', 'Rapor PBJ aktif', 'Portal rapor PBJ tetap dapat diakses.', '1 hari lalu')}
        </div>
      </div>
    </section>

    <section class="quick-grid">
      ${renderQuickCard('📊', 'linear-gradient(135deg,#2665df,#3a8bff)', 'ITKP - SiRUP', 'Lihat monitoring indikator ITKP dari modul SiRUP.', 'monitoring-sirup')}
      ${renderQuickCard('📝', 'linear-gradient(135deg,#11a6a2,#4cc7bc)', 'Rapor PBJ', 'Lihat dan unduh laporan rapor kinerja PBJ.', 'rapor-pbj')}
      ${renderQuickCard('📦', 'linear-gradient(135deg,#7c54e9,#a075f3)', 'Monitoring Realisasi', 'Pantau progres realisasi paket perangkat daerah.', 'monitoring-perencanaan')}
      ${renderQuickCard('🗓️', 'linear-gradient(135deg,#ef8d21,#f8b14c)', 'Simulasi Timeline', 'Simulasikan jadwal pengadaan secara terstruktur.', 'simulasi-timeline')}
    </section>

    <div class="footer-note">© 2026 TRAXPBJ - Simulasi & Monitoring Pengadaan Barang/Jasa</div>
  `;

  contentArea.querySelectorAll('[data-quick]').forEach((item) => {
    item.addEventListener('click', () => loadPage(item.dataset.quick));
  });
}

function renderIframePage(page) {
  contentArea.innerHTML = `
    <section class="embed-card">
      <h3>${page.title}</h3>
      <div class="page-note">Halaman dimuat dari project/modul yang sudah ada.</div>
      <div class="embed-frame-wrap">
        <iframe
          class="embed-frame"
          src="${page.url}"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </section>
  `;
}

function renderPlaceholderPage(pageKey, page) {
  contentArea.innerHTML = `
    <section class="card">
      <h3>${page.title}</h3>
      <div class="placeholder-grid">
        <div class="placeholder-box">
          <h4>Modul belum dihubungkan</h4>
          <p>Halaman ini sudah disiapkan di portal utama. Nanti saat modulnya selesai, tinggal isi route-nya di file <b>app.js</b>.</p>
        </div>
        <div class="placeholder-box">
          <h4>Route aktif</h4>
          <p>Key route saat ini adalah <b>${pageKey}</b>. Type halaman masih <b>${page.type}</b>.</p>
        </div>
      </div>
    </section>
  `;
}

async function renderModulePage(page) {
  const token = ++activeModuleToken;
  cleanupDynamicModule();

  try {
    if (Array.isArray(page.externalScripts) && page.externalScripts.length) {
      for (const src of page.externalScripts) {
        await loadExternalScriptOnce(src);
      }
    }

    const response = await fetch(`${page.html}?v=${Date.now()}`, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} saat memuat ${page.html}`);
    }

    const rawHtml = await response.text();
    if (token !== activeModuleToken) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    const moduleContent = doc.body && doc.body.innerHTML.trim()
      ? doc.body.innerHTML
      : rawHtml;

    contentArea.innerHTML = `
      <section class="module-page module-page--native">
        ${moduleContent}
      </section>
    `;

    if (page.css) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${page.css}?v=${Date.now()}`;
      link.setAttribute('data-dynamic-module-css', 'true');
      document.head.appendChild(link);
    }

    if (page.js) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${page.js}?v=${Date.now()}`;
        script.async = false;
        script.setAttribute('data-dynamic-module-js', 'true');

        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Gagal memuat ${page.js}`));

        document.body.appendChild(script);
      });
    }

    if (typeof window.__moduleInit === 'function') {
      activeModuleCleanup = window.__moduleInit() || null;
    }
  } catch (error) {
    console.error('Gagal memuat module:', error);
    contentArea.innerHTML = `
      <section class="card">
        <h3>Gagal memuat modul</h3>
        <p>File modul tidak bisa dimuat. Cek path HTML, CSS, JS, atau script eksternal pada <b>APP_ROUTES</b>.</p>
        <p><b>Detail:</b> ${error.message}</p>
      </section>
    `;
  }
}

function renderDimension(name, value) {
  return `
    <div class="dim-row">
      <div>${name}</div>
      <div class="bar"><span style="width:${value}%"></span></div>
      <div>${value.toFixed(2).replace('.', ',')}%</div>
    </div>
  `;
}

function renderActivity(color, icon, title, text, time) {
  return `
    <div class="activity-item">
      <div class="activity-icon" style="background:${color}">${icon}</div>
      <div>
        <div class="activity-title">${title}</div>
        <div class="activity-text">${text}</div>
      </div>
      <div class="activity-time">${time}</div>
    </div>
  `;
}

function renderQuickCard(icon, bg, title, text, route) {
  return `
    <button class="quick-card" type="button" data-quick="${route}">
      <div class="quick-icon" style="background:${bg}">${icon}</div>
      <div>
        <div class="quick-title">${title}</div>
        <div class="quick-text">${text}</div>
      </div>
      <div class="quick-arrow">›</div>
    </button>
  `;
}

function updateActiveMenu(key) {
  document.querySelectorAll('.nav-link, .submenu-link').forEach((el) => {
    el.classList.remove('active');
  });

  const directButton = document.querySelector(`.nav-link[data-page="${key}"]`);
  const subButton = document.querySelector(`.submenu-link[data-page="${key}"]`);

  if (directButton) {
    directButton.classList.add('active');
  }

  if (subButton) {
    subButton.classList.add('active');
    const group = subButton.closest('.nav-group');
    if (group) {
      group.classList.add('open');
    }
  }
}

async function loadPage(key) {
  const page = APP_ROUTES[key] || APP_ROUTES.dashboard;

  updateActiveMenu(key);

  if (page.type !== 'module') {
    cleanupDynamicModule();
  }

  if (page.type === 'iframe') {
    renderIframePage(page);
  } else if (page.type === 'module') {
    await renderModulePage(page);
  } else if (page.type === 'placeholder') {
    renderPlaceholderPage(key, page);
  } else {
    renderDashboard();
  }

  if (window.innerWidth <= 980 && sidebar) {
    sidebar.classList.remove('mobile-open');
  }
}

function bindMenu() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => loadPage(button.dataset.page));
  });

  document.querySelectorAll('[data-toggle-group]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = document.querySelector(`.nav-group[data-group="${button.dataset.toggleGroup}"]`);
      if (group) {
        group.classList.toggle('open');
      }
    });
  });

  if (sidebarToggleButton && sidebar) {
    sidebarToggleButton.addEventListener('click', () => {
      if (window.innerWidth <= 980) {
        sidebar.classList.toggle('mobile-open');
      } else {
        sidebar.classList.toggle('collapsed');
      }
    });
  }
}

bindMenu();
loadPage('dashboard');
