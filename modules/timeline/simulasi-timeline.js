(function () {
const METHOD_RULES = {
  "Tender Cepat": { default: 3, min: 3, max: 14, prep: 7 },
  "Tender": { default: 61, min: 30, max: 180, prep: 14 },
  "Seleksi": { default: 40, min: 30, max: 120, prep: 14 },
  "Pengadaan Langsung / ePL": { default: 7, min: 1, max: 30, prep: 7 },
  "Penunjukan Langsung": { default: 7, min: 3, max: 30, prep: 7 },
  "e-Purchasing": { default: 3, min: 1, max: 14, prep: 3 }
};

const TIMELINE_MONTHS = [
  { label: "September", yearOffset: -1, month: 8 },
  { label: "Oktober", yearOffset: -1, month: 9 },
  { label: "November", yearOffset: -1, month: 10 },
  { label: "Desember", yearOffset: -1, month: 11 },
  { label: "Januari", yearOffset: 0, month: 0 },
  { label: "Februari", yearOffset: 0, month: 1 },
  { label: "Maret", yearOffset: 0, month: 2 },
  { label: "April", yearOffset: 0, month: 3 },
  { label: "Mei", yearOffset: 0, month: 4 },
  { label: "Juni", yearOffset: 0, month: 5 },
  { label: "Juli", yearOffset: 0, month: 6 },
  { label: "Agustus", yearOffset: 0, month: 7 },
  { label: "September", yearOffset: 0, month: 8 },
  { label: "Oktober", yearOffset: 0, month: 9 },
  { label: "November", yearOffset: 0, month: 10 },
  { label: "Desember", yearOffset: 0, month: 11 }
];

window.__moduleInit = function ({ container }) {
  const root = container.querySelector('.timeline-module') || container;

  let el = {};
  let methodExplanationCache = "";
  let moduleDestroyed = false;
  const cleanupListeners = [];

  function getElements() {
    return {
      tahunAnggaran: root.querySelector("#tahunAnggaran"),
      jenisKontrak: root.querySelector("#jenisKontrak"),
      jenisPengadaan: root.querySelector("#jenisPengadaan"),
      paguPaket: root.querySelector("#paguPaket"),
      tersediaKatalog: root.querySelector("#tersediaKatalog"),
      metodePemilihan: root.querySelector("#metodePemilihan"),
      durasiPemilihan: root.querySelector("#durasiPemilihan"),
      waktuPersiapanAwal: root.querySelector("#waktuPersiapanAwal"),
      durasiPekerjaan: root.querySelector("#durasiPekerjaan"),
      mulaiPelaksanaan: root.querySelector("#mulaiPelaksanaan"),

      helpMetode: root.querySelector("#helpMetode"),
      helpDurasiPemilihan: root.querySelector("#helpDurasiPemilihan"),
      infoRule: root.querySelector("#infoRule"),

      btnWhyMethod: root.querySelector("#btnWhyMethod"),
      whyMethodBox: root.querySelector("#whyMethodBox"),
      whyMethodText: root.querySelector("#whyMethodText"),

      btnSimulasikan: root.querySelector("#btnSimulasikan"),
      btnReset: root.querySelector("#btnReset"),
      btnExportPdf: root.querySelector("#btnExportPdf"),
      btnExportPdfTop: root.querySelector("#btnExportPdfTop"),

      badgeMetode: root.querySelector("#badgeMetode"),

      outPaguPaket: root.querySelector("#outPaguPaket"),
      outMulaiPersiapan: root.querySelector("#outMulaiPersiapan"),
      outMulaiPemilihan: root.querySelector("#outMulaiPemilihan"),
      outSelesaiPemilihan: root.querySelector("#outSelesaiPemilihan"),
      outMulaiKontrak: root.querySelector("#outMulaiKontrak"),
      outSelesaiPelaksanaan: root.querySelector("#outSelesaiPelaksanaan"),
      outDurasiTotal: root.querySelector("#outDurasiTotal"),
      outStatusMetode: root.querySelector("#outStatusMetode"),
      outSaranMetode: root.querySelector("#outSaranMetode"),
      outStatusJadwal: root.querySelector("#outStatusJadwal"),
      outSaranSistem: root.querySelector("#outSaranSistem"),

      statusBox: root.querySelector("#statusBox"),

      timelineSuperHeader: root.querySelector("#timelineSuperHeader"),
      timelineHeader: root.querySelector("#timelineHeader"),
      rowPersiapan: root.querySelector("#rowPersiapan"),
      rowPemilihan: root.querySelector("#rowPemilihan"),
      rowPelaksanaan: root.querySelector("#rowPelaksanaan"),
      rowAkhir: root.querySelector("#rowAkhir"),

      detailTahun: root.querySelector("#detailTahun"),
      detailJenisPengadaan: root.querySelector("#detailJenisPengadaan"),
      detailPaguPaket: root.querySelector("#detailPaguPaket"),
      detailKatalog: root.querySelector("#detailKatalog"),
      detailMetode: root.querySelector("#detailMetode"),
      detailJenisKontrak: root.querySelector("#detailJenisKontrak"),
      detailDurasiPemilihan: root.querySelector("#detailDurasiPemilihan"),
      detailWaktuPersiapanAwal: root.querySelector("#detailWaktuPersiapanAwal"),
      detailDurasiPekerjaan: root.querySelector("#detailDurasiPekerjaan"),
      detailMulaiPelaksanaan: root.querySelector("#detailMulaiPelaksanaan"),
      detailKesimpulan: root.querySelector("#detailKesimpulan"),
      catatanTambahan: root.querySelector("#catatanTambahan")
    };
  }

  function safeBind(element, eventName, handler) {
    if (!element) return;

    element.addEventListener(eventName, handler);
    cleanupListeners.push(() => element.removeEventListener(eventName, handler));
  }

  function parseLocalDate(dateString) {
    if (!dateString) return null;

    const parts = dateString.split("-");
    if (parts.length !== 3) return null;

    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function formatDateID(date) {
    if (!(date instanceof Date) || isNaN(date)) return "-";

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function addMonths(date, months) {
    const d = new Date(date);
    const originalDate = d.getDate();

    d.setMonth(d.getMonth() + months);

    if (d.getDate() < originalDate) {
      d.setDate(0);
    }

    return d;
  }

  function diffDays(start, end) {
    const ms = end.getTime() - start.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  }

  function formatRupiah(number) {
    return `Rp${Number(number || 0).toLocaleString("id-ID")}`;
  }

  function parseNumberInput(value) {
    if (!value) return 0;

    const cleaned = String(value).replace(/[^\d]/g, "");
    return Number(cleaned || 0);
  }

  function formatPaguInput() {
    if (!el.paguPaket) return;

    const value = parseNumberInput(el.paguPaket.value);
    el.paguPaket.value = value ? value.toLocaleString("id-ID") : "";
  }

  function getTimelineMonthRange(tahunAnggaran, timelineItem) {
    const year = tahunAnggaran + timelineItem.yearOffset;
    const start = new Date(year, timelineItem.month, 1);
    const end = new Date(year, timelineItem.month + 1, 0);

    return { start, end };
  }

  function isOverlap(rangeStart, rangeEnd, monthStart, monthEnd) {
    return rangeStart <= monthEnd && rangeEnd >= monthStart;
  }

  function buildHeader() {
    if (!el.timelineSuperHeader || !el.timelineHeader) return;

    el.timelineSuperHeader.innerHTML = "";
    el.timelineHeader.innerHTML = "";

    const superSpacer = document.createElement("div");
    superSpacer.className = "timeline-super-spacer";
    el.timelineSuperHeader.appendChild(superSpacer);

    const prevHeader = document.createElement("div");
    prevHeader.className = "timeline-super-cell timeline-super-prev";
    prevHeader.textContent = "TAHUN ANGGARAN SEBELUMNYA";
    el.timelineSuperHeader.appendChild(prevHeader);

    const currentHeader = document.createElement("div");
    currentHeader.className = "timeline-super-cell timeline-super-current";
    currentHeader.textContent = "TAHUN ANGGARAN BERKENAAN";
    el.timelineSuperHeader.appendChild(currentHeader);

    const spacer = document.createElement("div");
    spacer.className = "timeline-spacer";
    el.timelineHeader.appendChild(spacer);

    TIMELINE_MONTHS.forEach((item) => {
      const div = document.createElement("div");
      div.className = "timeline-month";
      div.textContent = item.label;
      el.timelineHeader.appendChild(div);
    });
  }

  function buildEmptyTrack(container) {
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < TIMELINE_MONTHS.length; i++) {
      const cell = document.createElement("div");
      cell.className = "timeline-cell";
      cell.textContent = "";
      container.appendChild(cell);
    }
  }

  function fillTrackByRange(container, tahunAnggaran, startDate, endDate, fillClass, label) {
    if (!container) return;

    buildEmptyTrack(container);

    for (let i = 0; i < TIMELINE_MONTHS.length; i++) {
      const timelineItem = TIMELINE_MONTHS[i];
      const monthRange = getTimelineMonthRange(tahunAnggaran, timelineItem);
      const cell = container.children[i];

      if (cell && isOverlap(startDate, endDate, monthRange.start, monthRange.end)) {
        cell.classList.add(fillClass);
        cell.textContent = label || "";
      }
    }
  }

  function buildTimeline(tahunAnggaran, ranges) {
    buildHeader();

    fillTrackByRange(el.rowPersiapan, tahunAnggaran, ranges.persiapan.start, ranges.persiapan.end, "fill-persiapan", "Persiapan");
    fillTrackByRange(el.rowPemilihan, tahunAnggaran, ranges.pemilihan.start, ranges.pemilihan.end, "fill-pemilihan", "Pilih");
    fillTrackByRange(el.rowPelaksanaan, tahunAnggaran, ranges.pelaksanaan.start, ranges.pelaksanaan.end, "fill-pelaksanaan", "Kerja");
    fillTrackByRange(el.rowAkhir, tahunAnggaran, ranges.akhir.start, ranges.akhir.end, "fill-akhir", "Buffer");
  }

  function getMethodOptions(jenisPengadaan, pagu, katalog) {
    const isKatalog = katalog === "ya";
    const allowed = [];
    const hidden = [];
    let ruleText = "";

    function allow(method) {
      if (!allowed.includes(method)) allowed.push(method);
    }

    function hide(method, reason) {
      hidden.push({ method, reason });
    }

    if (jenisPengadaan === "Barang" || jenisPengadaan === "Jasa Lainnya") {
      if (isKatalog) {
        allow("e-Purchasing");
      } else {
        hide("e-Purchasing", "Tidak dimunculkan karena paket ditandai tidak tersedia di katalog.");
      }

      if (pagu <= 200000000) {
        allow("Pengadaan Langsung / ePL");
        allow("Tender Cepat");
        allow("Tender");
        hide("Seleksi", "Seleksi tidak digunakan untuk Barang/Jasa Lainnya.");
        ruleText = "Untuk Barang/Jasa Lainnya sampai Rp200 juta, Pengadaan Langsung masih dimungkinkan.";
      } else {
        hide("Pengadaan Langsung / ePL", "Tidak dimunculkan karena Pengadaan Langsung untuk Barang/Jasa Lainnya dibatasi sampai Rp200 juta.");
        allow("Tender Cepat");
        allow("Tender");
        hide("Seleksi", "Seleksi tidak digunakan untuk Barang/Jasa Lainnya.");
        ruleText = "Untuk Barang/Jasa Lainnya di atas Rp200 juta, arahkan ke Tender atau E-purchasing bila tersedia di katalog.";
      }

      hide("Penunjukan Langsung", "Penunjukan Langsung tidak dimunculkan sebagai opsi normal simulasi ini karena hanya untuk kondisi tertentu.");
    }

    if (jenisPengadaan === "Pekerjaan Konstruksi") {
      if (isKatalog) {
        allow("e-Purchasing");
      } else {
        hide("e-Purchasing", "Tidak dimunculkan karena paket ditandai tidak tersedia di katalog.");
      }

      if (pagu <= 400000000) {
        allow("Pengadaan Langsung / ePL");
        allow("Tender Cepat");
        allow("Tender");
        hide("Seleksi", "Seleksi tidak digunakan untuk Pekerjaan Konstruksi.");
        ruleText = "Untuk Pekerjaan Konstruksi sampai Rp400 juta, Pengadaan Langsung masih dimungkinkan.";
      } else {
        hide("Pengadaan Langsung / ePL", "Tidak dimunculkan karena Pengadaan Langsung untuk Pekerjaan Konstruksi dibatasi sampai Rp400 juta.");
        allow("Tender Cepat");
        allow("Tender");
        hide("Seleksi", "Seleksi tidak digunakan untuk Pekerjaan Konstruksi.");
        ruleText = "Untuk Pekerjaan Konstruksi di atas Rp400 juta, arahkan ke Tender atau E-purchasing bila tersedia di katalog.";
      }

      hide("Penunjukan Langsung", "Penunjukan Langsung tidak dimunculkan sebagai opsi normal simulasi ini karena hanya untuk kondisi tertentu.");
    }

    if (jenisPengadaan === "Jasa Konsultansi") {
      if (isKatalog) {
        allow("e-Purchasing");
      } else {
        hide("e-Purchasing", "Tidak dimunculkan karena paket ditandai tidak tersedia di katalog.");
      }

      if (pagu <= 100000000) {
        allow("Pengadaan Langsung / ePL");
        allow("Seleksi");
        hide("Tender Cepat", "Tender Cepat tidak digunakan untuk Jasa Konsultansi.");
        hide("Tender", "Tender tidak digunakan sebagai metode lazim untuk Jasa Konsultansi.");
        ruleText = "Untuk Jasa Konsultansi sampai Rp100 juta, Pengadaan Langsung masih dimungkinkan.";
      } else {
        hide("Pengadaan Langsung / ePL", "Tidak dimunculkan karena Pengadaan Langsung untuk Jasa Konsultansi dibatasi sampai Rp100 juta.");
        allow("Seleksi");
        hide("Tender Cepat", "Tender Cepat tidak digunakan untuk Jasa Konsultansi.");
        hide("Tender", "Tender tidak digunakan sebagai metode lazim untuk Jasa Konsultansi.");
        ruleText = "Untuk Jasa Konsultansi di atas Rp100 juta, metode yang lebih sesuai adalah Seleksi, atau E-purchasing bila tersedia di katalog.";
      }

      hide("Penunjukan Langsung", "Penunjukan Langsung tidak dimunculkan sebagai opsi normal simulasi ini karena hanya untuk kondisi tertentu.");
    }

    return { allowed, hidden, ruleText };
  }

  function buildWhyMethodText(jenisPengadaan, pagu, katalog, hiddenMethods) {
    const lines = [];

    lines.push(`Jenis Pengadaan: ${jenisPengadaan}`);
    lines.push(`Pagu Paket: ${formatRupiah(pagu)}`);
    lines.push(`Tersedia di Katalog: ${katalog === "ya" ? "Ya" : "Tidak"}`);
    lines.push("");
    lines.push("Metode yang tidak ditampilkan:");

    if (!hiddenMethods.length) {
      lines.push("- Semua metode utama yang relevan sudah ditampilkan.");
    } else {
      hiddenMethods.forEach((item) => {
        lines.push(`- ${item.method}: ${item.reason}`);
      });
    }

    return lines.join("<br>");
  }

  function populateMethodOptions() {
    if (!el.jenisPengadaan || !el.paguPaket || !el.tersediaKatalog || !el.metodePemilihan) return;

    const jenisPengadaan = el.jenisPengadaan.value;
    const pagu = parseNumberInput(el.paguPaket.value);
    const katalog = el.tersediaKatalog.value;
    const currentValue = el.metodePemilihan.value;

    const { allowed, hidden, ruleText } = getMethodOptions(jenisPengadaan, pagu, katalog);

    el.metodePemilihan.innerHTML = "";

    allowed.forEach((method) => {
      const option = document.createElement("option");
      option.value = method;
      option.textContent = method;
      el.metodePemilihan.appendChild(option);
    });

    if (allowed.includes(currentValue)) {
      el.metodePemilihan.value = currentValue;
    } else {
      el.metodePemilihan.value = allowed[0] || "";
    }

    if (el.infoRule) {
      el.infoRule.innerHTML = ruleText || "Pilih jenis pengadaan, pagu, dan katalog untuk melihat metode yang sesuai.";
    }

    if (el.helpMetode) {
      el.helpMetode.textContent = "Dropdown metode hanya menampilkan opsi yang lolos rule simulasi.";
    }

    methodExplanationCache = buildWhyMethodText(jenisPengadaan, pagu, katalog, hidden);

    if (el.whyMethodText) {
      el.whyMethodText.innerHTML = methodExplanationCache;
    }

    updateMethodDefaults();
  }

  function updateMethodDefaults() {
    if (!el.metodePemilihan || !el.durasiPemilihan || !el.waktuPersiapanAwal || !el.helpDurasiPemilihan) return;

    const method = el.metodePemilihan.value;
    const rule = METHOD_RULES[method];

    if (!rule) return;

    el.durasiPemilihan.value = rule.default;
    el.waktuPersiapanAwal.value = rule.prep;

    let helpText = `Default durasi untuk ${method} adalah ${rule.default} hari.`;

    if (method === "Tender" || method === "Seleksi") {
      helpText += " Anda masih bisa mengubah manual, tetapi sistem akan memberi warning jika terlalu pendek atau terlalu panjang.";
    }

    if (method === "Tender Cepat") {
      helpText += " Metode ini cocok untuk proses yang sangat singkat.";
    }

    el.helpDurasiPemilihan.textContent = helpText;
  }

  function evaluateMethodSuitability(jenisPengadaan, pagu, katalog, metode) {
    const { allowed } = getMethodOptions(jenisPengadaan, pagu, katalog);

    if (!allowed.includes(metode)) {
      return {
        status: "Belum cocok",
        advice: "Metode ini tidak termasuk opsi yang lolos rule simulasi. Pilih metode yang disediakan sistem."
      };
    }

    if (metode === "e-Purchasing") {
      return {
        status: "Sesuai",
        advice: "E-purchasing dipilih karena paket ditandai tersedia di katalog."
      };
    }

    return {
      status: "Sesuai",
      advice: "Metode yang dipilih masih sesuai dengan rule simulasi ini."
    };
  }

  function evaluateDuration(method, duration) {
    const rule = METHOD_RULES[method];

    if (!rule) {
      return {
        type: "warning",
        text: "Durasi belum memiliki rule khusus. Cek kembali secara manual."
      };
    }

    if (duration < rule.min) {
      return {
        type: "warning",
        text: `Durasi ${method} terlalu singkat. Minimal kewajaran simulasi untuk metode ini adalah ${rule.min} hari.`
      };
    }

    if (duration > rule.max) {
      return {
        type: "warning",
        text: `Durasi ${method} cukup panjang. Batas kewajaran simulasi untuk metode ini adalah ${rule.max} hari. Pastikan sesuai kompleksitas paket.`
      };
    }

    return {
      type: "valid",
      text: `Durasi ${method} masih dalam rentang kewajaran simulasi.`
    };
  }

  function setStatus(type, html) {
    if (!el.statusBox) return;

    el.statusBox.className = "status-box";

    if (type === "valid") {
      el.statusBox.classList.add("status-valid");
    } else if (type === "invalid") {
      el.statusBox.classList.add("status-invalid");
    } else {
      el.statusBox.classList.add("status-warning");
    }

    el.statusBox.innerHTML = html;
  }

  function renderSimulation() {
    if (
      !el.tahunAnggaran ||
      !el.jenisKontrak ||
      !el.jenisPengadaan ||
      !el.paguPaket ||
      !el.tersediaKatalog ||
      !el.metodePemilihan ||
      !el.durasiPemilihan ||
      !el.waktuPersiapanAwal ||
      !el.durasiPekerjaan ||
      !el.mulaiPelaksanaan
    ) {
      return;
    }

    const tahun = Number(el.tahunAnggaran.value || 0);
    const jenisKontrak = el.jenisKontrak.value;
    const jenisPengadaan = el.jenisPengadaan.value;
    const pagu = parseNumberInput(el.paguPaket.value);
    const katalog = el.tersediaKatalog.value;
    const metode = el.metodePemilihan.value;
    const durasiPemilihanHari = Number(el.durasiPemilihan.value || 0);
    const waktuPersiapanAwalHari = Number(el.waktuPersiapanAwal.value || 0);
    const durasiPekerjaanBulan = Number(el.durasiPekerjaan.value || 0);
    const mulaiPelaksanaan = parseLocalDate(el.mulaiPelaksanaan.value);

    if (!tahun || !mulaiPelaksanaan || !pagu || durasiPemilihanHari < 1 || durasiPekerjaanBulan < 1 || waktuPersiapanAwalHari < 0) {
      setStatus("warning", "Input belum lengkap atau belum valid. Pastikan tahun, pagu, metode, durasi, dan target mulai pelaksanaan sudah terisi.");
      return;
    }

    const methodCheck = evaluateMethodSuitability(jenisPengadaan, pagu, katalog, metode);
    const durationCheck = evaluateDuration(metode, durasiPemilihanHari);

    const mulaiKontrak = new Date(mulaiPelaksanaan);
    const selesaiPelaksanaan = addDays(addMonths(mulaiPelaksanaan, durasiPekerjaanBulan), -1);
    const selesaiPemilihan = addDays(mulaiPelaksanaan, -1);
    const mulaiPemilihan = addDays(selesaiPemilihan, -(durasiPemilihanHari - 1));
    const mulaiPersiapan = addDays(mulaiPemilihan, -waktuPersiapanAwalHari);

    const akhirTahunAnggaran = new Date(tahun, 11, 31);
    const awalPraTahun = new Date(tahun - 1, 8, 1);
    const totalDurasiHari = diffDays(mulaiPersiapan, selesaiPelaksanaan) + 1;

    let statusType = "valid";
    let statusJadwal = "";
    let kesimpulan = "";
    let saran = "";
    let catatan = "";

    if (jenisKontrak === "single") {
      if (selesaiPelaksanaan > akhirTahunAnggaran) {
        statusType = "invalid";
        statusJadwal = "Belum cocok";
        kesimpulan = "Jadwal belum cocok untuk kontrak tahunan";
        saran = "Pertimbangkan memajukan jadwal atau menggunakan kontrak jamak.";
        catatan = `Jadwal ini melewati batas tahun anggaran <strong>${tahun}</strong>. Untuk kontrak tahunan, pekerjaan seharusnya selesai paling lambat 31 Desember ${tahun}.`;
      } else if (mulaiPersiapan < awalPraTahun) {
        statusType = "warning";
        statusJadwal = "Terlalu awal";
        kesimpulan = "Paket sebaiknya disiapkan jauh sebelum periode simulasi";
        saran = "Durasi paket cukup panjang. Disarankan penyusunan dokumen dimulai lebih awal lagi.";
        catatan = `Jadwal persiapan ideal dimulai sebelum <strong>September ${tahun - 1}</strong>. Ini menunjukkan paket berdurasi panjang dan perlu perhatian khusus sejak awal.`;
      } else {
        const sisaHari = diffDays(selesaiPelaksanaan, akhirTahunAnggaran);

        if (mulaiPersiapan.getFullYear() < tahun) {
          statusType = "warning";
          statusJadwal = "Mulai lebih awal";
          kesimpulan = "Sebaiknya disiapkan sejak akhir tahun sebelumnya";
          saran = "Agar aman, proses persiapan dan pemilihan jangan menunggu tahun anggaran berjalan.";
          catatan = `Paket ini masih bisa selesai dalam tahun anggaran <strong>${tahun}</strong>, namun jadwal ideal menunjukkan bahwa persiapan sebaiknya sudah dimulai sejak akhir tahun sebelumnya.`;
        } else if (sisaHari <= 30) {
          statusType = "warning";
          statusJadwal = "Mepet";
          kesimpulan = "Jadwal cukup mepet akhir tahun";
          saran = "Disarankan memajukan persiapan atau pemilihan agar pelaksanaan tidak menumpuk di akhir tahun.";
          catatan = `Jadwal masih berada dalam tahun anggaran <strong>${tahun}</strong>, tetapi waktu penyelesaian cukup mepet dengan akhir tahun.`;
        } else {
          statusType = "valid";
          statusJadwal = "Aman";
          kesimpulan = "Jadwal masih aman";
          saran = "Paket dapat diproses pada tahun anggaran berjalan sesuai simulasi ini.";
          catatan = `Jadwal masih aman dalam tahun anggaran <strong>${tahun}</strong>. Pelaksanaan diperkirakan selesai sebelum 31 Desember ${tahun}.`;
        }
      }
    } else {
      if (mulaiPersiapan < awalPraTahun) {
        statusType = "warning";
        statusJadwal = "Panjang";
        kesimpulan = "Paket berdurasi panjang";
        saran = "Karena paket cukup panjang, penyusunan dokumen dan kesiapan internal sebaiknya dimulai lebih awal.";
        catatan = `Untuk kontrak jamak, jadwal ini masih memungkinkan, namun persiapan ideal dimulai sebelum periode simulasi yang ditampilkan.`;
      } else if (mulaiPersiapan.getFullYear() < tahun) {
        statusType = "valid";
        statusJadwal = "Aman";
        kesimpulan = "Cocok untuk kontrak jamak";
        saran = "Paket dapat disiapkan sejak akhir tahun sebelumnya agar pelaksanaan lebih rapi.";
        catatan = `Jadwal dapat dilaksanakan sebagai <strong>kontrak jamak</strong>, dan persiapan sejak akhir tahun sebelumnya justru membantu pelaksanaan lebih tertib.`;
      } else {
        statusType = "valid";
        statusJadwal = "Aman";
        kesimpulan = "Cocok untuk kontrak jamak";
        saran = "Paket dapat dilanjutkan sesuai simulasi, dengan tetap memperhatikan kesiapan dokumen dan anggaran.";
        catatan = `Jadwal dapat dilaksanakan sebagai <strong>kontrak jamak</strong>, dengan catatan tetap menyesuaikan ketentuan penganggaran dan kontrak yang berlaku.`;
      }
    }

    let statusHtmlType = statusType;
    const extraWarnings = [];

    if (methodCheck.status !== "Sesuai") {
      statusHtmlType = "warning";
      extraWarnings.push(methodCheck.advice);
    }

    if (durationCheck.type === "warning") {
      statusHtmlType = "warning";
      extraWarnings.push(durationCheck.text);
    }

    if (el.badgeMetode) el.badgeMetode.textContent = metode;
    if (el.outPaguPaket) el.outPaguPaket.textContent = formatRupiah(pagu);
    if (el.outMulaiPersiapan) el.outMulaiPersiapan.textContent = formatDateID(mulaiPersiapan);
    if (el.outMulaiPemilihan) el.outMulaiPemilihan.textContent = formatDateID(mulaiPemilihan);
    if (el.outSelesaiPemilihan) el.outSelesaiPemilihan.textContent = formatDateID(selesaiPemilihan);
    if (el.outMulaiKontrak) el.outMulaiKontrak.textContent = formatDateID(mulaiKontrak);
    if (el.outSelesaiPelaksanaan) el.outSelesaiPelaksanaan.textContent = formatDateID(selesaiPelaksanaan);
    if (el.outDurasiTotal) el.outDurasiTotal.textContent = `${totalDurasiHari.toLocaleString("id-ID")} Hari`;
    if (el.outStatusMetode) el.outStatusMetode.textContent = methodCheck.status;
    if (el.outSaranMetode) el.outSaranMetode.textContent = methodCheck.advice;
    if (el.outStatusJadwal) el.outStatusJadwal.textContent = statusJadwal;
    if (el.outSaranSistem) el.outSaranSistem.textContent = saran;

    let combinedHtml = `<strong>${kesimpulan}</strong><br>${catatan}`;

    if (extraWarnings.length) {
      combinedHtml += `<br><br><strong>Catatan tambahan:</strong><br>${extraWarnings.map((x) => `• ${x}`).join("<br>")}`;
    }

    setStatus(statusHtmlType, combinedHtml);

    if (el.detailTahun) el.detailTahun.textContent = tahun;
    if (el.detailJenisPengadaan) el.detailJenisPengadaan.textContent = jenisPengadaan;
    if (el.detailPaguPaket) el.detailPaguPaket.textContent = formatRupiah(pagu);
    if (el.detailKatalog) el.detailKatalog.textContent = katalog === "ya" ? "Ya" : "Tidak";
    if (el.detailMetode) el.detailMetode.textContent = metode;
    if (el.detailJenisKontrak) el.detailJenisKontrak.textContent = jenisKontrak === "single" ? "Kontrak Tahunan (Single Year)" : "Kontrak Jamak (Multi Year)";
    if (el.detailDurasiPemilihan) el.detailDurasiPemilihan.textContent = `${durasiPemilihanHari} Hari`;
    if (el.detailWaktuPersiapanAwal) el.detailWaktuPersiapanAwal.textContent = `${waktuPersiapanAwalHari} Hari`;
    if (el.detailDurasiPekerjaan) el.detailDurasiPekerjaan.textContent = `${durasiPekerjaanBulan} Bulan`;
    if (el.detailMulaiPelaksanaan) el.detailMulaiPelaksanaan.textContent = formatDateID(mulaiPelaksanaan);
    if (el.detailKesimpulan) el.detailKesimpulan.innerHTML = `<strong>${kesimpulan}</strong>`;
    if (el.catatanTambahan) el.catatanTambahan.innerHTML = combinedHtml;

    const bufferStart = selesaiPelaksanaan <= akhirTahunAnggaran ? addDays(selesaiPelaksanaan, 1) : new Date(tahun, 11, 31);

    const ranges = {
      persiapan: {
        start: mulaiPersiapan,
        end: addDays(mulaiPemilihan, -1)
      },
      pemilihan: {
        start: mulaiPemilihan,
        end: selesaiPemilihan
      },
      pelaksanaan: {
        start: mulaiPelaksanaan,
        end: selesaiPelaksanaan
      },
      akhir: {
        start: bufferStart,
        end: akhirTahunAnggaran
      }
    };

    buildTimeline(tahun, ranges);
  }

  function resetForm() {
    if (el.tahunAnggaran) el.tahunAnggaran.value = "2026";
    if (el.jenisKontrak) el.jenisKontrak.value = "single";
    if (el.jenisPengadaan) el.jenisPengadaan.value = "Barang";
    if (el.paguPaket) el.paguPaket.value = "150.000.000";
    if (el.tersediaKatalog) el.tersediaKatalog.value = "tidak";

    populateMethodOptions();

    if (el.durasiPekerjaan) el.durasiPekerjaan.value = "12";
    if (el.mulaiPelaksanaan) el.mulaiPelaksanaan.value = "2026-04-01";
    if (el.whyMethodBox) el.whyMethodBox.style.display = "none";

    renderSimulation();
  }

  function exportPdf() {
    window.print();
  }

  function toggleWhyMethod() {
    if (!el.whyMethodBox || !el.whyMethodText) return;

    const isHidden = el.whyMethodBox.style.display === "none" || !el.whyMethodBox.style.display;
    el.whyMethodBox.style.display = isHidden ? "block" : "none";
    el.whyMethodText.innerHTML = methodExplanationCache || "-";
  }

  function bindEvents() {
    safeBind(el.paguPaket, "input", () => {
      formatPaguInput();
      populateMethodOptions();
    });

    safeBind(el.jenisPengadaan, "change", populateMethodOptions);
    safeBind(el.tersediaKatalog, "change", populateMethodOptions);
    safeBind(el.metodePemilihan, "change", updateMethodDefaults);

    safeBind(el.btnWhyMethod, "click", toggleWhyMethod);
    safeBind(el.btnSimulasikan, "click", renderSimulation);
    safeBind(el.btnReset, "click", resetForm);
    safeBind(el.btnExportPdf, "click", exportPdf);
    safeBind(el.btnExportPdfTop, "click", exportPdf);
  }

  function initTimelineModule() {
    if (moduleDestroyed) return;

    el = getElements();
    formatPaguInput();
    populateMethodOptions();
    renderSimulation();
  }

  function destroyModule() {
    moduleDestroyed = true;

    cleanupListeners.forEach(off => {
      try {
        off();
      } catch (err) {
        console.warn('Gagal melepas listener timeline:', err);
      }
    });

    cleanupListeners.length = 0;
  }

  el = getElements();
  bindEvents();
  initTimelineModule();

  return destroyModule;
};
})();