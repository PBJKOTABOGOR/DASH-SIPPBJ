const APP_ROUTES = {
  dashboard: {
    title: 'Dashboard SIPPBJ',
    subtitle: 'Ringkasan profil pengadaan barang/jasa Kota Bogor.',
    type: 'internal'
  },

  'monitoring-sirup': {
    title: 'Monitoring SiRUP',
    subtitle: 'Monitoring indikator pemanfaatan SiRUP dalam capaian ITKP Perangkat Daerah.',
    type: 'module',
    html: 'modules/monitoring/itkp-sirup/itkp-sirup.html',
    css: 'modules/monitoring/itkp-sirup/itkp-sirup.css',
    js: 'modules/monitoring/itkp-sirup/itkp-sirup.js'
  },

  'monitoring-ekatalog': {
    title: 'Monitoring eKatalog',
    subtitle: 'Monitoring indikator pemanfaatan eKatalog dalam capaian ITKP Perangkat Daerah.',
    type: 'module',
    html: 'modules/monitoring/itkp-ekatalog/itkp-ekatalog.html',
    css: 'modules/monitoring/itkp-ekatalog/itkp-ekatalog.css',
    js: 'modules/monitoring/itkp-ekatalog/itkp-ekatalog.js'
  },

  'monitoring-etendering': {
    title: 'Monitoring eTendering',
    subtitle: 'Monitoring indikator pemanfaatan eTendering dalam capaian ITKP Perangkat Daerah.',
    type: 'module',
    html: 'modules/monitoring/itkp-etendering/itkp-etendering.html',
    css: 'modules/monitoring/itkp-etendering/itkp-etendering.css',
    js: 'modules/monitoring/itkp-etendering/itkp-etendering.js'
  },

  'monitoring-ekontrak': {
    title: 'Monitoring eKontrak',
    subtitle: 'Monitoring indikator pemanfaatan eKontrak dalam capaian ITKP Perangkat Daerah.',
    type: 'module',
    html: 'modules/monitoring/itkp-ekontrak/itkp-ekontrak.html',
    css: 'modules/monitoring/itkp-ekontrak/itkp-ekontrak.css',
    js: 'modules/monitoring/itkp-ekontrak/itkp-ekontrak.js'
  },

  'monitoring-nontender': {
    title: 'Non eTendering/Non ePurchasing',
    subtitle: 'Halaman ini disiapkan untuk monitoring Non eTendering/Non ePurchasing.',
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
    subtitle: 'Monitoring paket konsolidasi dan informasi konsolidasi pengadaan.',
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

let activeModuleToken = 0;
let currentModuleDestroy = null;
let activeFlyout = null;
let activePageKey = '';
let loadingPageKey = '';

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cacheBust(url) {
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}v=${Date.now()}`;
}

function showModuleLoading(title = 'Memuat modul...') {
  contentArea.innerHTML = `
    <section class="card">
      <h3>${escapeHtml(title)}</h3>
      <p>Mohon tunggu sebentar, sistem sedang menyiapkan tampilan dan data.</p>
    </section>
  `;
}

function renderDashboard() {
  contentArea.innerHTML = `
    <section class="hero-card">
      <h3>Selamat datang di SIPPBJ</h3>
      <p>Ringkasan utama profil pengadaan barang/jasa Kota Bogor, pemanfaatan sistem, realisasi paket, konsolidasi, dan Rapor PBJ.</p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">Skor ITKP</div>
          <div class="value">86,42%</div>
          <div class="desc">Indikator pemanfaatan sistem pengadaan</div>
        </div>
        <div class="stat-card">
          <div class="label">Konsolidasi</div>
          <div class="value">128</div>
          <div class="desc">Paket terindikasi/termonitor konsolidasi</div>
        </div>
        <div class="stat-card">
          <div class="label">Paket Belum Berjalan</div>
          <div class="value">6.666</div>
          <div class="desc">Breakdown per metode pengadaan</div>
        </div>
        <div class="stat-card">
          <div class="label">Rapor PBJ</div>
          <div class="value">44</div>
          <div class="desc">Laporan rapor perangkat daerah</div>
        </div>
      </div>
    </section>

    <section class="grid-main">
      <div class="card">
        <h3>Profil Pengadaan Barang/Jasa Kota Bogor</h3>
        <div class="summary-panels">
          <div class="mini-card">
            <h4>Skor ITKP</h4>
            <div class="big-number">86,42%</div>
            <div class="progress-scale">
              <div class="progress-track">
                <div class="progress-bar" style="width:86.42%"></div>
              </div>
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
            <h4>Paket Belum Berjalan per Metode</h4>
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
          ${renderActivity('#2ab56f', '✓', 'Rapor PBJ Bulan April 2026 telah tersedia', 'Laporan rapor untuk perangkat daerah telah berhasil dibuat.', '2 jam lalu')}
          ${renderActivity('#4c7df2', '📊', 'Update Dashboard ITKP', 'Data monitoring ITKP diperbarui pada portal.', '3 jam lalu')}
          ${renderActivity('#8e61e9', '🧾', 'Monitoring Realisasi diperbarui', 'Sinkronisasi data realisasi paket berhasil dimuat.', '5 jam lalu')}
          ${renderActivity('#ef8d21', '📜', 'Konsolidasi sedang disiapkan', 'Menu konsolidasi masih dalam proses pengembangan.', '1 hari lalu')}
          ${renderActivity('#12a8a1', '📝', 'Rapor PBJ aktif', 'Portal rapor PBJ tetap dapat diakses.', '1 hari lalu')}
        </div>
      </div>
    </section>

    <section class="quick-grid">
      ${renderQuickCard('📊', 'linear-gradient(135deg,#2665df,#3a8bff)', 'ITKP - SiRUP', 'Lihat monitoring indikator ITKP dari modul SiRUP.', 'monitoring-sirup')}
      ${renderQuickCard('🧾', 'linear-gradient(135deg,#11a6a2,#4cc7bc)', 'Rapor PBJ', 'Lihat dan unduh laporan rapor kinerja PBJ.', 'rapor-pbj')}
      ${renderQuickCard('📦', 'linear-gradient(135deg,#7c54e9,#a075f3)', 'Monitoring Realisasi', 'Pantau progres realisasi paket perangkat daerah.', 'monitoring-perencanaan')}
      ${renderQuickCard('🗓️', 'linear-gradient(135deg,#ef8d21,#f8b14c)', 'Simulasi Timeline', 'Simulasikan jadwal pengadaan secara terstruktur.', 'simulasi-timeline')}
    </section>

    <div class="footer-note">© BenRama 2026 SIPPBJ - Simulasi & Monitoring Pengadaan Barang/Jasa</div>
  `;

  contentArea.querySelectorAll('[data-quick]').forEach((item) => {
    item.addEventListener('click', () => loadPage(item.dataset.quick));
  });
}

function renderIframePage(page) {
  contentArea.innerHTML = `
    <section class="embed-card">
      <h3>${escapeHtml(page.title)}</h3>
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
      <h3>${escapeHtml(page.title)}</h3>
      <div class="placeholder-grid">
        <div class="placeholder-box">
          <h4>Modul belum dihubungkan</h4>
          <p>Halaman ini sudah disiapkan di portal utama. Nanti saat project GitHub/halaman monitoring selesai, tinggal isi URL atau module path di file <b>app.js</b>.</p>
        </div>
        <div class="placeholder-box">
          <h4>Langkah berikutnya</h4>
          <p>Cari route <b>${escapeHtml(pageKey)}</b> pada objek <b>APP_ROUTES</b>, lalu ubah <b>type</b> menjadi <b>iframe</b> atau <b>module</b>.</p>
        </div>
      </div>
    </section>
  `;
}

function renderDimension(name, value) {
  return `
    <div class="dim-row">
      <div>${escapeHtml(name)}</div>
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
        <div class="activity-title">${escapeHtml(title)}</div>
        <div class="activity-text">${escapeHtml(text)}</div>
      </div>
      <div class="activity-time">${escapeHtml(time)}</div>
    </div>
  `;
}

function renderQuickCard(icon, bg, title, text, route) {
  return `
    <button class="quick-card" type="button" data-quick="${escapeHtml(route)}">
      <div class="quick-icon" style="background:${bg}">${icon}</div>
      <div>
        <div class="quick-title">${escapeHtml(title)}</div>
        <div class="quick-text">${escapeHtml(text)}</div>
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
    if (group) group.classList.add('open');
  }
}

function closeFlyout() {
  if (activeFlyout) {
    activeFlyout.remove();
    activeFlyout = null;
  }
}

function cleanupDynamicModule() {
  closeFlyout();

  if (typeof currentModuleDestroy === 'function') {
    try {
      currentModuleDestroy();
    } catch (err) {
      console.warn('Cleanup module lama gagal:', err);
    }
  }

  currentModuleDestroy = null;

  try {
    delete window.__moduleInit;
  } catch (err) {
    window.__moduleInit = undefined;
  }

  document.querySelectorAll('[data-dynamic-module-css]').forEach((el) => el.remove());
  document.querySelectorAll('[data-dynamic-module-js]').forEach((el) => el.remove());
}

function loadExternalScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-external-src="${src}"]`);

    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Gagal memuat external script: ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.externalSrc = src;
    script.dataset.loaded = 'false';

    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };

    script.onerror = () => reject(new Error(`Gagal memuat external script: ${src}`));
    document.body.appendChild(script);
  });
}

function loadModuleCss(href) {
  return new Promise((resolve, reject) => {
    if (!href) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cacheBust(href);
    link.setAttribute('data-dynamic-module-css', 'true');

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Gagal memuat CSS: ${href}`));

    document.head.appendChild(link);
  });
}

function loadModuleJs(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = cacheBust(src);
    script.async = false;
    script.setAttribute('data-dynamic-module-js', 'true');

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Gagal memuat JS: ${src}`));

    document.body.appendChild(script);
  });
}

async function fetchModuleHtml(path) {
  const response = await fetch(cacheBust(path), { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} saat memuat HTML: ${path}`);
  }

  return response.text();
}

function extractModuleBody(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  if (doc.body && doc.body.innerHTML.trim()) {
    return doc.body.innerHTML;
  }

  return rawHtml;
}

async function renderModulePage(page) {
  const token = ++activeModuleToken;

  cleanupDynamicModule();
  showModuleLoading(page.title || 'Memuat modul...');

  try {
    if (Array.isArray(page.externalScripts) && page.externalScripts.length) {
      for (const src of page.externalScripts) {
        await loadExternalScriptOnce(src);
        if (token !== activeModuleToken) return false;
      }
    }

    const rawHtml = await fetchModuleHtml(page.html);
    if (token !== activeModuleToken) return false;

    await loadModuleCss(page.css);
    if (token !== activeModuleToken) return false;

    const moduleContent = extractModuleBody(rawHtml);

    contentArea.innerHTML = `
      <section class="module-page module-page--native">
        ${moduleContent}
      </section>
    `;

    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (token !== activeModuleToken) return false;

    await loadModuleJs(page.js);
    if (token !== activeModuleToken) return false;

    const moduleContainer = contentArea.querySelector('.module-page--native') || contentArea;

    if (typeof window.__moduleInit === 'function') {
      const destroyFn = window.__moduleInit({
        container: moduleContainer,
        route: page
      });

      currentModuleDestroy = typeof destroyFn === 'function' ? destroyFn : null;
    } else {
      currentModuleDestroy = null;
    }

    return true;
  } catch (error) {
    console.error('Gagal memuat module:', error);

    if (token !== activeModuleToken) return false;

    contentArea.innerHTML = `
      <section class="card">
        <h3>Gagal memuat modul</h3>
        <p>File modul tidak bisa dimuat atau script modul gagal dijalankan.</p>
        <p><b>Detail:</b> ${escapeHtml(error.message)}</p>
      </section>
    `;

    return false;
  }
}

async function loadPage(key) {
  const page = APP_ROUTES[key] || APP_ROUTES.dashboard;

  /*
    FIX UTAMA:
    - Kalau menu yang sama sedang loading, klik kedua diabaikan.
    - Kalau menu yang sama sudah aktif, klik lagi tidak reset modul.
    - activeModuleToken TIDAK dinaikkan dobel untuk module.
  */
  if (loadingPageKey === key) {
    return;
  }

  if (activePageKey === key) {
    updateActiveMenu(key);
    return;
  }

  loadingPageKey = key;
  updateActiveMenu(key);

  try {
    let success = true;

    if (page.type !== 'module') {
      activeModuleToken++;
      cleanupDynamicModule();
      contentArea.classList.remove('module-mode');
    } else {
      contentArea.classList.add('module-mode');
    }

    if (page.type === 'iframe') {
      renderIframePage(page);
    } else if (page.type === 'module') {
      success = await renderModulePage(page);
    } else if (page.type === 'placeholder') {
      renderPlaceholderPage(key, page);
    } else {
      renderDashboard();
    }

    if (success) {
      activePageKey = key;
    }

    if (window.innerWidth <= 980 && sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  } finally {
    if (loadingPageKey === key) {
      loadingPageKey = '';
    }
  }
}

function bindMenu() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const pageKey = button.dataset.page;
      if (!pageKey) return;
      loadPage(pageKey);
    });
  });

  document.querySelectorAll('[data-toggle-group]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const groupName = button.dataset.toggleGroup;
      const group = document.querySelector(`.nav-group[data-group="${groupName}"]`);
      if (!group) return;

      if (sidebar && sidebar.classList.contains('collapsed') && window.innerWidth > 980) {
        event.preventDefault();
        toggleFlyout(button, groupName);
        return;
      }

      group.classList.toggle('open');
    });
  });

  if (sidebarToggleButton && sidebar) {
    sidebarToggleButton.addEventListener('click', () => {
      if (window.innerWidth <= 980) {
        sidebar.classList.toggle('mobile-open');
      } else {
        sidebar.classList.toggle('collapsed');
        closeFlyout();
      }
    });
  }

  document.addEventListener('click', (event) => {
    if (!activeFlyout) return;

    const clickedInsideFlyout = activeFlyout.contains(event.target);
    const clickedToggle = event.target.closest('[data-toggle-group]');

    if (!clickedInsideFlyout && !clickedToggle) {
      closeFlyout();
    }
  });

  window.addEventListener('resize', () => {
    closeFlyout();

    if (window.innerWidth > 980 && sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  });
}

function toggleFlyout(toggleButton, groupName) {
  if (!toggleButton) return;

  if (activeFlyout && activeFlyout.dataset.group === groupName) {
    closeFlyout();
    return;
  }

  closeFlyout();

  const group = document.querySelector(`.nav-group[data-group="${groupName}"]`);
  if (!group) return;

  const submenuLinks = group.querySelectorAll('.submenu-link');
  if (!submenuLinks.length) return;

  const flyout = document.createElement('div');
  flyout.className = 'sidebar-flyout';
  flyout.dataset.group = groupName;

  const titleMap = {
    itkp: 'ITKP',
    realisasi: 'Realisasi Paket',
    simulasi: 'Simulasi'
  };

  flyout.innerHTML = `
    <div class="sidebar-flyout-title">${escapeHtml(titleMap[groupName] || 'Menu')}</div>
    ${Array.from(submenuLinks).map((link) => {
      const isActive = link.classList.contains('active') ? ' active' : '';
      return `
        <button class="flyout-link${isActive}" type="button" data-page="${escapeHtml(link.dataset.page)}">
          ${escapeHtml(link.textContent)}
        </button>
      `;
    }).join('')}
  `;

  document.body.appendChild(flyout);

  const rect = toggleButton.getBoundingClientRect();
  flyout.style.top = `${rect.top}px`;
  flyout.style.left = `${rect.right + 12}px`;

  flyout.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeFlyout();
      loadPage(btn.dataset.page);
    });
  });

  activeFlyout = flyout;
}

bindMenu();
loadPage('dashboard');
