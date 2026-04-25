(() => {
  const AUTO_NEXT_DELAY_MS = 1800;
  const HINT_PENALTY = 3;

  let containerRef = null;
  let root = null;
  let destroyed = false;
  let toastEl = null;
  let autoNextTimer = null;
  let panjiIntroTimers = [];
  let panjiTalkTimer = null;

  let panjiEl = null;
  let panjiTextEl = null;
  let panjiEmoteEl = null;
  let panjiBubbleEl = null;
  let panjiHintBtn = null;
  let panjiMiniBtn = null;
  let panjiCharacterBtn = null;
  let panjiCloseBtn = null;

  const CARD_LIBRARY = {
    rup: {
      id: 'rup',
      label: 'Cek RUP',
      icon: '📋',
      note: 'Pastikan paket sudah ada dan sesuai perencanaan.'
    },
    identifikasi: {
      id: 'identifikasi',
      label: 'Identifikasi Kebutuhan',
      icon: '🧠',
      note: 'Validasi kebutuhan, volume, lokasi, dan jadwal.'
    },
    konsolidasi: {
      id: 'konsolidasi',
      label: 'Konsolidasi',
      icon: '🧲',
      note: 'Gabungkan kebutuhan sejenis bila tepat.'
    },
    reviewSpek: {
      id: 'review-spek',
      label: 'Review Spesifikasi',
      icon: '🧐',
      note: 'Cegah spesifikasi mengarah.'
    },
    kak: {
      id: 'kak',
      label: 'KAK / Spesifikasi',
      icon: '🧩',
      note: 'Susun kebutuhan teknis secara jelas dan adil.'
    },
    hps: {
      id: 'hps',
      label: 'HPS / Referensi Harga',
      icon: '💰',
      note: 'Susun harga perkiraan dengan dasar wajar.'
    },
    cekPdn: {
      id: 'cek-pdn',
      label: 'Cek PDN / TKDN',
      icon: '🇮🇩',
      note: 'Perhatikan produk dalam negeri dan TKDN/BMP.'
    },
    cekUmkk: {
      id: 'cek-umkk',
      label: 'Cek UMK/Koperasi',
      icon: '🏪',
      note: 'Perhatikan afirmasi usaha mikro, kecil, dan koperasi.'
    },
    cekKatalog: {
      id: 'cek-katalog',
      label: 'Cek e-Katalog',
      icon: '🔎',
      note: 'Pastikan barang/jasa tersedia dan sesuai.'
    },
    katalogTidakSesuai: {
      id: 'katalog-tidak-sesuai',
      label: 'Katalog Tidak Sesuai',
      icon: '🛑',
      note: 'Produk/penyedia tidak tersedia atau tidak sesuai kebutuhan.'
    },
    dokumentasiGagalKatalog: {
      id: 'dokumentasi-gagal-katalog',
      label: 'Dokumentasi Hasil Cek',
      icon: '📝',
      note: 'Catat bukti hasil pengecekan katalog sebelum ganti metode.'
    },
    evaluasiMetode: {
      id: 'evaluasi-metode',
      label: 'Evaluasi Metode',
      icon: '🧭',
      note: 'Evaluasi metode awal bila kondisi pasar tidak sesuai rencana.'
    },
    pilihMetode: {
      id: 'pilih-metode',
      label: 'Pilih Metode',
      icon: '⚙️',
      note: 'Tentukan metode berdasarkan nilai, jenis, dan kondisi paket.'
    },
    metodePl: {
      id: 'metode-pl',
      label: 'Pengadaan Langsung',
      icon: '🛠️',
      note: 'Digunakan bila nilai dan kondisi paket sesuai.'
    },
    metodeEpurchasing: {
      id: 'metode-epurchasing',
      label: 'e-Purchasing',
      icon: '🛒',
      note: 'Gunakan katalog bila tersedia dan sesuai.'
    },
    miniKompetisi: {
      id: 'mini-kompetisi',
      label: 'Mini Kompetisi',
      icon: '🏁',
      note: 'Kompetisikan penyedia katalog bila diwajibkan/tepat.'
    },
    tender: {
      id: 'tender',
      label: 'Tender',
      icon: '🏗️',
      note: 'Untuk paket yang membutuhkan proses pemilihan formal.'
    },
    seleksi: {
      id: 'seleksi',
      label: 'Seleksi',
      icon: '📐',
      note: 'Umumnya untuk jasa konsultansi.'
    },
    swakelola: {
      id: 'swakelola',
      label: 'Swakelola',
      icon: '🤲',
      note: 'Dipilih bila memenuhi kriteria swakelola.'
    },
    timPersiapan: {
      id: 'tim-persiapan',
      label: 'Tim Persiapan',
      icon: '🧑‍💼',
      note: 'Siapkan rencana, KAK, jadwal, dan kebutuhan swakelola.'
    },
    timPelaksana: {
      id: 'tim-pelaksana',
      label: 'Tim Pelaksana',
      icon: '👷',
      note: 'Laksanakan pekerjaan swakelola.'
    },
    timPengawas: {
      id: 'tim-pengawas',
      label: 'Tim Pengawas',
      icon: '🕵️',
      note: 'Awasi mutu, waktu, dan output swakelola.'
    },
    klarifikasi: {
      id: 'klarifikasi',
      label: 'Klarifikasi / Negosiasi',
      icon: '🤝',
      note: 'Pastikan harga, spek, dan kemampuan pelaksanaan.'
    },
    proses: {
      id: 'proses',
      label: 'Proses Pemilihan',
      icon: '🚦',
      note: 'Laksanakan proses sesuai metode.'
    },
    kontrak: {
      id: 'kontrak',
      label: 'SPK / Kontrak',
      icon: '📑',
      note: 'Ikat hasil proses secara tertulis.'
    },
    monitoringKontrak: {
      id: 'monitoring-kontrak',
      label: 'Monitoring Kontrak',
      icon: '📡',
      note: 'Pantau waktu, mutu, volume, dan kewajiban.'
    },
    uangMuka: {
      id: 'uang-muka',
      label: 'Uang Muka / Jaminan',
      icon: '🧾',
      note: 'Kelola uang muka, jaminan, dan syarat kontraktual.'
    },
    identifikasiPerubahan: {
      id: 'identifikasi-perubahan',
      label: 'Identifikasi Perubahan',
      icon: '🔍',
      note: 'Cek perubahan volume, waktu, spesifikasi, atau kondisi lapangan.'
    },
    kajiKontrak: {
      id: 'kaji-kontrak',
      label: 'Kaji Klausul Kontrak',
      icon: '📖',
      note: 'Pastikan perubahan memungkinkan secara kontraktual.'
    },
    justifikasiTeknis: {
      id: 'justifikasi-teknis',
      label: 'Justifikasi Teknis',
      icon: '🧾',
      note: 'Susun alasan teknis dan administrasi perubahan.'
    },
    negosiasiPerubahan: {
      id: 'negosiasi-perubahan',
      label: 'Negosiasi Perubahan',
      icon: '🤝',
      note: 'Bahas dampak harga, waktu, volume, dan mutu.'
    },
    adendumKontrak: {
      id: 'adendum-kontrak',
      label: 'Adendum Kontrak',
      icon: '✍️',
      note: 'Tuangkan perubahan kontrak secara tertulis.'
    },
    teguran: {
      id: 'teguran',
      label: 'Teguran / Evaluasi',
      icon: '📣',
      note: 'Dilakukan saat ada keterlambatan atau masalah.'
    },
    pemeriksaan: {
      id: 'pemeriksaan',
      label: 'Pemeriksaan Hasil',
      icon: '🔬',
      note: 'Cek kesesuaian sebelum diterima.'
    },
    bast: {
      id: 'bast',
      label: 'BAST',
      icon: '📦',
      note: 'Serah terima setelah barang/jasa sesuai.'
    },
    pembayaran: {
      id: 'pembayaran',
      label: 'Pembayaran',
      icon: '💳',
      note: 'Dilakukan sesuai dokumen pendukung.'
    },
    realisasi: {
      id: 'realisasi',
      label: 'Catat Realisasi',
      icon: '✅',
      note: 'Pastikan realisasi tercatat.'
    },

    kontrakAwal: {
      id: 'kontrak-awal',
      label: 'Kontrak Dulu',
      icon: '🚨',
      note: 'Jebakan: lompat proses.',
      type: 'trap'
    },
    pecahPaket: {
      id: 'pecah-paket',
      label: 'Pecah Paket',
      icon: '💣',
      note: 'Jebakan: rawan menghindari metode.',
      type: 'trap'
    },
    spekMengarah: {
      id: 'spek-mengarah',
      label: 'Spek Mengarah',
      icon: '🚫',
      note: 'Jebakan: persaingan tidak sehat.',
      type: 'trap'
    },
    abaikanKatalog: {
      id: 'abaikan-katalog',
      label: 'Abaikan Katalog',
      icon: '⚠️',
      note: 'Jebakan: tidak cek kanal tersedia.',
      type: 'trap'
    },
    lanjutEpurchasingPaksa: {
      id: 'lanjut-epurchasing-paksa',
      label: 'Paksa e-Purchasing',
      icon: '🚧',
      note: 'Jebakan: tetap memaksa katalog padahal tidak sesuai.',
      type: 'trap'
    },
    gantiMetodeTanpaBukti: {
      id: 'ganti-metode-tanpa-bukti',
      label: 'Ganti Metode Tanpa Bukti',
      icon: '⚡',
      note: 'Jebakan: perubahan metode tanpa dokumentasi hasil cek.',
      type: 'trap'
    },
    lewatiRup: {
      id: 'lewati-rup',
      label: 'Lewati RUP',
      icon: '⛔',
      note: 'Jebakan: proses tanpa cek perencanaan.',
      type: 'trap'
    },
    bastTanpaCek: {
      id: 'bast-tanpa-cek',
      label: 'BAST Tanpa Pemeriksaan',
      icon: '📦',
      note: 'Jebakan: menerima tanpa verifikasi.',
      type: 'trap'
    },
    bayarDulu: {
      id: 'bayar-dulu',
      label: 'Bayar Dulu',
      icon: '💸',
      note: 'Jebakan: pembayaran sebelum bukti memadai.',
      type: 'trap'
    },
    tundaDokumen: {
      id: 'tunda-dokumen',
      label: 'Tunda Dokumen',
      icon: '🧨',
      note: 'Jebakan: risiko administrasi meningkat.',
      type: 'trap'
    },
    metodeAsalCepat: {
      id: 'metode-asal-cepat',
      label: 'Metode Asal Cepat',
      icon: '🏃',
      note: 'Jebakan: cepat belum tentu tepat.',
      type: 'trap'
    },
    realisasiLupa: {
      id: 'realisasi-lupa',
      label: 'Lupakan Realisasi',
      icon: '🕳️',
      note: 'Jebakan: monitoring bolong.',
      type: 'trap'
    },
    adendumTanpaDasar: {
      id: 'adendum-tanpa-dasar',
      label: 'Adendum Tanpa Dasar',
      icon: '🔥',
      note: 'Jebakan: perubahan kontrak tanpa kajian/justifikasi.',
      type: 'trap'
    },
    bayarSebelumAdendum: {
      id: 'bayar-sebelum-adendum',
      label: 'Bayar Sebelum Adendum',
      icon: '💸',
      note: 'Jebakan: pembayaran sebelum perubahan kontrak tertib.',
      type: 'trap'
    },
    swakelolaTanpaTim: {
      id: 'swakelola-tanpa-tim',
      label: 'Swakelola Tanpa Tim',
      icon: '🙈',
      note: 'Jebakan: tim swakelola tidak dibentuk jelas.',
      type: 'trap'
    },
    abaikanPdn: {
      id: 'abaikan-pdn',
      label: 'Abaikan PDN',
      icon: '🚫',
      note: 'Jebakan: tidak memperhatikan afirmasi PDN/TKDN.',
      type: 'trap'
    }
  };

  function card(key) {
    const item = CARD_LIBRARY[key];

    if (!item) return null;

    return {
      ...item,
      type: item.type || 'action'
    };
  }

  const CHALLENGE_RAW = [
    {
      type: 'pipeline',
      title: 'Soal 1 — Susun Pipeline Dasar Pengadaan',
      caseTitle: 'Belanja ATK Kantor',
      desc: 'OPD akan melakukan belanja ATK kantor senilai Rp45 juta. Susun alur pengadaan paling aman dari awal sampai realisasi.',
      budget: 'Rp45.000.000',
      difficulty: 'Level 1 - Pemula',
      ideal: ['rup', 'kak', 'hps', 'metodePl', 'proses', 'kontrak', 'bast', 'realisasi'],
      traps: ['kontrakAwal', 'lewatiRup', 'bayarDulu'],
      explanation: 'Alur dasar dimulai dari cek RUP, penyusunan KAK/spesifikasi, HPS, penentuan metode, proses pengadaan, kontrak, BAST, lalu realisasi.'
    },
    {
      type: 'quiz',
      title: 'Soal 2 — Ruang Lingkup PBJ',
      caseTitle: 'Konsep Dasar PBJ',
      desc: 'Jawab pertanyaan berikut berdasarkan konsep dasar PBJ Pemerintah.',
      question: 'PBJ Pemerintah dimulai dari tahap apa sampai tahap apa?',
      options: [
        'Identifikasi kebutuhan sampai kontrak',
        'Perencanaan sampai pembayaran',
        'Identifikasi kebutuhan sampai serah terima hasil pekerjaan',
        'Penyusunan HPS sampai serah terima'
      ],
      answer: 2,
      hint: 'Fokus pada ruang lingkup PBJ yang paling lengkap, bukan yang berhenti di kontrak.',
      explanation: 'PBJ Pemerintah adalah proses dari identifikasi kebutuhan sampai dengan serah terima hasil pekerjaan.'
    },
    {
      type: 'pipeline',
      title: 'Soal 3 — Susun Pipeline e-Purchasing',
      caseTitle: 'Pengadaan Laptop Pelayanan Publik',
      desc: 'OPD membutuhkan laptop untuk layanan publik. Barang tersedia di e-Katalog dan nilai paket Rp350 juta.',
      budget: 'Rp350.000.000',
      difficulty: 'Level 2 - Pemula+',
      ideal: ['rup', 'kak', 'hps', 'cekPdn', 'cekUmkk', 'cekKatalog', 'metodeEpurchasing', 'klarifikasi', 'kontrak', 'bast', 'realisasi'],
      traps: ['metodePl', 'tender', 'abaikanKatalog', 'kontrakAwal', 'abaikanPdn'],
      explanation: 'Untuk barang tersedia di katalog, alur aman adalah cek RUP, siapkan KAK/HPS, perhatikan PDN/TKDN dan UMK/Koperasi, cek katalog, lakukan e-Purchasing, klarifikasi/negosiasi, kontrak, BAST, realisasi.'
    },
    {
      type: 'quiz',
      title: 'Soal 4 — Tujuan PBJ',
      caseTitle: 'Laptop TKDN + BMP 42%',
      desc: 'PPK membeli laptop melalui katalog elektronik dengan TKDN + BMP 42%.',
      question: 'Tujuan PBJ yang paling didukung oleh kondisi tersebut adalah?',
      options: [
        'Menghasilkan barang sesuai nilai uang',
        'Meningkatkan penggunaan produk dalam negeri',
        'Meningkatkan peran konsultan perencana',
        'Mengurangi jumlah paket pengadaan'
      ],
      answer: 1,
      hint: 'Kata kunci utama ada pada TKDN dan BMP.',
      explanation: 'TKDN/BMP menunjukkan keberpihakan pada produk dalam negeri.'
    },
    {
      type: 'pipeline',
      title: 'Soal 5 — Susun Pipeline Konsolidasi',
      caseTitle: 'Komputer Beberapa Bidang',
      desc: 'Beberapa bidang mengusulkan komputer dengan kebutuhan sejenis. Total nilai Rp650 juta.',
      budget: 'Rp650.000.000',
      difficulty: 'Level 3 - Menengah',
      ideal: ['rup', 'identifikasi', 'konsolidasi', 'kak', 'hps', 'cekKatalog', 'metodeEpurchasing', 'kontrak', 'bast', 'realisasi'],
      traps: ['pecahPaket', 'metodePl', 'metodeAsalCepat', 'kontrakAwal'],
      explanation: 'Kebutuhan sejenis perlu diidentifikasi dan dapat dikonsolidasikan agar tidak terjadi pemecahan paket yang tidak wajar.'
    },
    {
      type: 'quiz',
      title: 'Soal 6 — Pemaketan',
      caseTitle: 'Strategi Pemaketan PBJ',
      desc: 'Jawab pertanyaan tentang dasar pemaketan barang/jasa.',
      question: 'Pemaketan barang/jasa dilakukan dengan mempertimbangkan apa?',
      options: [
        'Keluaran, volume, ketersediaan, kemampuan pelaku usaha, dan anggaran',
        'Keinginan bidang, kecepatan proses, dan kemudahan administrasi',
        'Jumlah penyedia yang dikenal PPK',
        'Nilai paket agar selalu bisa pengadaan langsung'
      ],
      answer: 0,
      hint: 'Pilih jawaban yang paling objektif dan menyangkut kebutuhan + kondisi pasar.',
      explanation: 'Pemaketan perlu mempertimbangkan output, volume, ketersediaan, kemampuan pelaku usaha, dan anggaran.'
    },
    {
      type: 'pipeline',
      title: 'Soal 7 — Susun Pipeline Spek Mengarah',
      caseTitle: 'Laptop dengan Spek Terlalu Spesifik',
      desc: 'Spesifikasi awal mengarah ke merek tertentu. Susun langkah korektif sebelum proses.',
      budget: 'Rp420.000.000',
      difficulty: 'Level 4 - Menengah',
      ideal: ['rup', 'reviewSpek', 'kak', 'hps', 'cekPdn', 'cekKatalog', 'metodeEpurchasing', 'klarifikasi', 'kontrak', 'bast', 'realisasi'],
      traps: ['spekMengarah', 'kontrakAwal', 'abaikanKatalog', 'metodeAsalCepat'],
      explanation: 'Jika spesifikasi mengarah, lakukan review spek dulu agar kebutuhan teknis lebih fair sebelum lanjut HPS dan metode.'
    },
    {
      type: 'quiz',
      title: 'Soal 8 — Spesifikasi Teknis',
      caseTitle: 'Fungsi Spesifikasi',
      desc: 'Jawab pertanyaan tentang fungsi spesifikasi teknis dalam PBJ.',
      question: 'Salah satu fungsi spesifikasi teknis adalah?',
      options: [
        'Menentukan pemenang sebelum proses',
        'Memberikan informasi kebutuhan kepada pelaku usaha',
        'Mengunci merek tertentu agar barang sesuai selera',
        'Menghindari persaingan agar proses cepat'
      ],
      answer: 1,
      hint: 'Spesifikasi teknis seharusnya menjelaskan kebutuhan, bukan mengunci penyedia.',
      explanation: 'Spesifikasi teknis harus memberi informasi kebutuhan kepada pelaku usaha.'
    },
    {
      type: 'pipeline',
      title: 'Soal 9 — Susun Pipeline Jasa Konsultansi',
      caseTitle: 'Kajian Teknis Perencanaan',
      desc: 'OPD akan menyusun kajian teknis perencanaan dengan nilai Rp280 juta.',
      budget: 'Rp280.000.000',
      difficulty: 'Level 5 - Menengah',
      ideal: ['rup', 'identifikasi', 'kak', 'hps', 'seleksi', 'proses', 'kontrak', 'monitoringKontrak', 'bast', 'realisasi'],
      traps: ['metodeEpurchasing', 'metodePl', 'kontrakAwal', 'abaikanKatalog'],
      explanation: 'Jasa konsultansi menggunakan pendekatan KAK, HPS, seleksi, proses, kontrak, monitoring, BAST, dan realisasi.'
    },
    {
      type: 'quiz',
      title: 'Soal 10 — Jenis Pengadaan',
      caseTitle: 'Kajian Teknis / Studi Kelayakan',
      desc: 'Jawab pertanyaan tentang jenis pengadaan.',
      question: 'Penyusunan studi kelayakan/kajian teknis termasuk jenis pengadaan apa?',
      options: [
        'Barang',
        'Pekerjaan konstruksi',
        'Jasa lainnya',
        'Jasa konsultansi'
      ],
      answer: 3,
      hint: 'Perhatikan sifat pekerjaannya: kajian/studi berbasis keahlian.',
      explanation: 'Kajian teknis/studi kelayakan merupakan jasa profesional berbasis keahlian, sehingga termasuk jasa konsultansi.'
    },
    {
      type: 'pipeline',
      title: 'Soal 11 — Susun Pipeline Konstruksi Ringan',
      caseTitle: 'Rehabilitasi Ruang Pelayanan',
      desc: 'Pekerjaan konstruksi ringan dengan nilai Rp760 juta membutuhkan proses formal dan pemeriksaan hasil.',
      budget: 'Rp760.000.000',
      difficulty: 'Level 6 - Sulit',
      ideal: ['rup', 'identifikasi', 'kak', 'hps', 'tender', 'proses', 'kontrak', 'monitoringKontrak', 'pemeriksaan', 'bast', 'realisasi'],
      traps: ['metodePl', 'kontrakAwal', 'bastTanpaCek', 'bayarDulu'],
      explanation: 'Pekerjaan konstruksi membutuhkan dokumen teknis, HPS, pemilihan, kontrak, monitoring, pemeriksaan hasil, BAST, dan realisasi.'
    },
    {
      type: 'quiz',
      title: 'Soal 12 — Prinsip PBJ',
      caseTitle: 'Barang Tidak Sesuai',
      desc: 'Barang/pekerjaan tidak sesuai spesifikasi sehingga tidak dapat digunakan.',
      question: 'Prinsip PBJ yang tidak terpenuhi adalah?',
      options: [
        'Efisien',
        'Efektif',
        'Transparan',
        'Akuntabel'
      ],
      answer: 1,
      hint: 'Kalau hasilnya tidak sesuai kebutuhan, prinsip yang gagal adalah terkait tercapainya tujuan.',
      explanation: 'Efektif berarti barang/jasa harus sesuai kebutuhan dan tujuan.'
    },
    {
      type: 'pipeline',
      title: 'Soal 13 — Susun Pipeline Swakelola',
      caseTitle: 'Pelatihan Internal Pegawai',
      desc: 'OPD akan melaksanakan kegiatan pelatihan internal pegawai. Susun alur yang sesuai untuk skema swakelola.',
      budget: 'Rp95.000.000',
      difficulty: 'Level 7 - Menengah',
      ideal: ['rup', 'identifikasi', 'kak', 'hps', 'timPersiapan', 'timPelaksana', 'timPengawas', 'swakelola', 'bast', 'realisasi'],
      traps: ['metodeEpurchasing', 'tender', 'kontrakAwal', 'swakelolaTanpaTim'],
      explanation: 'Swakelola tetap perlu perencanaan, identifikasi kebutuhan, KAK, anggaran/HPS, tim persiapan/pelaksana/pengawas, pelaksanaan, BAST, dan realisasi.'
    },
    {
      type: 'quiz',
      title: 'Soal 14 — Swakelola',
      caseTitle: 'Kriteria Swakelola',
      desc: 'Jawab pertanyaan tentang penggunaan swakelola.',
      question: 'Ruang lingkup pedoman swakelola meliputi apa?',
      options: [
        'Perencanaan, persiapan, pelaksanaan, pengawasan, dan serah terima hasil pekerjaan',
        'Tender, seleksi, katalog, dan kontrak',
        'Perencanaan, tender, evaluasi harga, dan pembayaran',
        'KAK, HPS, sanggah, kontrak, dan pembayaran'
      ],
      answer: 0,
      hint: 'Swakelola tidak hanya pelaksanaan; ada persiapan, pengawasan, dan serah terima.',
      explanation: 'Ruang lingkup swakelola mencakup perencanaan pengadaan melalui swakelola, persiapan, pelaksanaan, pengawasan, dan serah terima hasil pekerjaan.'
    },
    {
      type: 'pipeline',
      title: 'Soal 15 — Susun Pipeline Penyedia Terlambat',
      caseTitle: 'Penyedia Terlambat Mengirim Barang',
      desc: 'Kontrak sudah berjalan, namun penyedia terlambat mengirim barang. Jangan langsung BAST atau bayar.',
      budget: 'Rp190.000.000',
      difficulty: 'Level 8 - Sulit',
      ideal: ['kontrak', 'monitoringKontrak', 'teguran', 'pemeriksaan', 'bast', 'pembayaran', 'realisasi'],
      traps: ['bastTanpaCek', 'bayarDulu', 'realisasiLupa'],
      explanation: 'Saat kontrak bermasalah, lakukan monitoring kontrak, teguran/evaluasi, pemeriksaan hasil, BAST jika sesuai, pembayaran, dan realisasi.'
    },
    {
      type: 'quiz',
      title: 'Soal 16 — Aspek Hukum Kontrak',
      caseTitle: 'Sengketa Pelaksanaan Kontrak',
      desc: 'PPK dan penyedia berselisih dalam pelaksanaan kontrak.',
      question: 'Perselisihan PPK dan penyedia dalam pelaksanaan kontrak terutama termasuk aspek hukum apa?',
      options: [
        'Hukum pidana',
        'Hukum perdata',
        'Hukum persaingan usaha',
        'Hukum tata negara'
      ],
      answer: 1,
      hint: 'Perhatikan hubungan antara PPK dan penyedia dalam kontrak.',
      explanation: 'Hubungan PPK dan penyedia dalam pelaksanaan kontrak pada dasarnya adalah hubungan perdata.'
    },
    {
      type: 'pipeline',
      title: 'Soal 17 — Susun Pipeline Ganti Metode dari e-Purchasing',
      caseTitle: 'e-Purchasing Tidak Bisa Dilanjutkan',
      desc: 'Paket awalnya direncanakan e-Purchasing, tetapi setelah dicek tidak ada produk/penyedia yang sesuai di katalog. Susun langkah paling aman sebelum mengganti metode.',
      budget: 'Rp480.000.000',
      difficulty: 'Level 9 - Sulit',
      ideal: [
        'rup',
        'kak',
        'hps',
        'cekPdn',
        'cekKatalog',
        'katalogTidakSesuai',
        'dokumentasiGagalKatalog',
        'evaluasiMetode',
        'pilihMetode',
        'proses',
        'kontrak',
        'bast',
        'realisasi'
      ],
      traps: [
        'lanjutEpurchasingPaksa',
        'gantiMetodeTanpaBukti',
        'kontrakAwal',
        'metodeAsalCepat'
      ],
      explanation: 'Jika rencana awal e-Purchasing tidak bisa dilakukan karena tidak ada produk/penyedia sesuai di katalog, PPK perlu mendokumentasikan hasil pengecekan, mengevaluasi metode, lalu memilih metode lain yang sesuai nilai, jenis, dan kondisi paket.'
    },
    {
      type: 'quiz',
      title: 'Soal 18 — Perubahan Metode dari e-Purchasing',
      caseTitle: 'Tidak Ada Penyedia di Katalog',
      desc: 'Rencana awal paket adalah e-Purchasing, namun hasil cek katalog menunjukkan produk/penyedia tidak sesuai kebutuhan.',
      question: 'Langkah paling aman sebelum mengganti metode dari e-Purchasing adalah?',
      options: [
        'Langsung tunjuk penyedia yang dikenal agar cepat',
        'Tetap memaksa e-Purchasing walaupun produk tidak sesuai',
        'Dokumentasikan hasil cek katalog, evaluasi metode, lalu pilih metode yang sesuai',
        'Pecah paket agar bisa memakai metode yang lebih sederhana'
      ],
      answer: 2,
      hint: 'Jangan lompat ganti metode. Harus ada dasar dan dokumentasinya dulu.',
      explanation: 'Perubahan metode harus didasarkan pada hasil cek dan dokumentasi yang jelas. Setelah itu baru dilakukan evaluasi dan pemilihan metode yang sesuai.'
    },
    {
      type: 'pipeline',
      title: 'Soal 19 — Susun Pipeline Adendum Kontrak',
      caseTitle: 'Perubahan Volume dan Waktu Pelaksanaan',
      desc: 'Kontrak sedang berjalan. Terdapat kebutuhan perubahan volume dan penyesuaian waktu pelaksanaan. Susun alur adendum kontrak yang tertib.',
      budget: 'Nilai kontrak berjalan',
      difficulty: 'Level 10 - Expert',
      ideal: [
        'kontrak',
        'monitoringKontrak',
        'identifikasiPerubahan',
        'kajiKontrak',
        'justifikasiTeknis',
        'negosiasiPerubahan',
        'adendumKontrak',
        'pemeriksaan',
        'bast',
        'pembayaran',
        'realisasi'
      ],
      traps: [
        'adendumTanpaDasar',
        'bayarSebelumAdendum',
        'bastTanpaCek',
        'realisasiLupa'
      ],
      explanation: 'Adendum kontrak harus didahului identifikasi perubahan, kajian klausul kontrak, justifikasi teknis/administratif, dan negosiasi dampak perubahan. Setelah adendum tertib, pelaksanaan dapat dilanjutkan sampai pemeriksaan, BAST, pembayaran, dan realisasi.'
    },
    {
      type: 'quiz',
      title: 'Soal 20 — Adendum Kontrak',
      caseTitle: 'Perubahan Kontrak Berjalan',
      desc: 'Dalam pelaksanaan kontrak ditemukan kebutuhan perubahan volume dan waktu.',
      question: 'Apa yang paling tepat dilakukan sebelum membuat adendum kontrak?',
      options: [
        'Membayar dulu agar penyedia tetap bekerja',
        'Membuat justifikasi dan memastikan perubahan sesuai ketentuan/klausul kontrak',
        'Langsung BAST agar pekerjaan cepat selesai',
        'Membiarkan perubahan terjadi tanpa dokumen'
      ],
      answer: 1,
      hint: 'Adendum butuh dasar, bukan sekadar kesepakatan lisan.',
      explanation: 'Adendum kontrak membutuhkan dasar yang jelas, termasuk kajian kontrak dan justifikasi perubahan. Perubahan tidak boleh berjalan tanpa dasar dan dokumen yang tertib.'
    },
    {
      type: 'pipeline',
      title: 'Soal 21 — Katalog Konstruksi dengan Mini Kompetisi',
      caseTitle: 'Produk Konstruksi di Katalog Elektronik',
      desc: 'OPD akan membeli produk sektor konstruksi melalui katalog elektronik. Susun alur yang lebih aman dengan memperhatikan kewajiban mini kompetisi.',
      budget: 'Rp1.200.000.000',
      difficulty: 'Level 11 - Expert',
      ideal: [
        'rup',
        'identifikasi',
        'kak',
        'hps',
        'cekPdn',
        'cekKatalog',
        'miniKompetisi',
        'klarifikasi',
        'kontrak',
        'monitoringKontrak',
        'pemeriksaan',
        'bast',
        'realisasi'
      ],
      traps: [
        'abaikanKatalog',
        'kontrakAwal',
        'metodeAsalCepat',
        'bayarDulu'
      ],
      explanation: 'Untuk produk sektor konstruksi di katalog, perlu memperhatikan tata kelola katalog, persaingan sehat, mini kompetisi bila diwajibkan, kontrak, monitoring, pemeriksaan, BAST, dan realisasi.'
    },
    {
      type: 'quiz',
      title: 'Soal 22 — Afirmasi Belanja',
      caseTitle: 'Belanja Melalui Katalog',
      desc: 'Dalam belanja katalog, pemerintah mendorong afirmasi tertentu.',
      question: 'Afirmasi belanja melalui e-Purchasing terutama diarahkan untuk mendukung apa?',
      options: [
        'Produk dalam negeri serta usaha mikro, kecil, dan koperasi',
        'Penyedia yang paling dekat dengan kantor',
        'Barang impor karena lebih cepat',
        'Pemilihan penyedia tanpa kompetisi'
      ],
      answer: 0,
      hint: 'Ingat kata kunci PDN, UMK, dan koperasi.',
      explanation: 'Afirmasi belanja melalui e-Purchasing diarahkan untuk mendukung produk dalam negeri serta usaha mikro, kecil, dan koperasi.'
    }
  ];

  function buildChallenge(raw) {
    if (raw.type === 'quiz') {
      return raw;
    }

    const idealCards = raw.ideal.map(key => card(key)).filter(Boolean);
    const trapCards = (raw.traps || []).map(key => card(key)).filter(Boolean);

    return {
      ...raw,
      idealIds: idealCards.map(item => item.id),
      cards: [...idealCards, ...trapCards]
    };
  }

  const CHALLENGES = CHALLENGE_RAW.map(buildChallenge);

  const GAME_STATE = {
    order: [],
    index: 0,
    current: null,
    stage: 'ready',
    placed: [],
    shuffledCards: [],
    selectedCardId: null,
    answered: false,
    selectedAnswer: null,
    score: 0,
    risk: 0,
    wrong: 0,
    progress: 0,
    logs: [],
    finished: false,
    hintUsed: false,
    hasSeenIntro: false
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function shuffleArray(items) {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  function getCurrentChallenge() {
    return GAME_STATE.current;
  }

  function getPlacedCount() {
    return GAME_STATE.placed.filter(Boolean).length;
  }

  function clearAutoNextTimer() {
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
    }
  }

  function clearPanjiIntroTimers() {
    panjiIntroTimers.forEach(timer => clearTimeout(timer));
    panjiIntroTimers = [];
  }

  function clearPanjiTalkTimer() {
    if (panjiTalkTimer) {
      clearTimeout(panjiTalkTimer);
      panjiTalkTimer = null;
    }
  }

  function scheduleAutoNext(message, delay = AUTO_NEXT_DELAY_MS) {
    clearAutoNextTimer();

    if (message) {
      showToast(message, 'info');
    }

    autoNextTimer = setTimeout(() => {
      autoNextTimer = null;

      if (destroyed) return;

      nextChallenge();
    }, delay);
  }

  function calculateMaxScore() {
    return CHALLENGES.reduce((total, challenge) => {
      if (challenge.type === 'pipeline') {
        return total + (challenge.idealIds.length * 10) + 20;
      }

      return total + 20;
    }, 0);
  }

  function getResultGrade(percent) {
    if (percent >= 90 && GAME_STATE.risk <= 20) {
      return {
        label: 'Sangat Baik',
        icon: '🏆',
        text: 'Pemahaman alur PBJ sudah kuat. Risiko rendah dan keputusan relatif aman.'
      };
    }

    if (percent >= 75) {
      return {
        label: 'Baik',
        icon: '🥇',
        text: 'Pemahaman sudah baik, tetapi masih ada beberapa risiko yang perlu dikurangi.'
      };
    }

    if (percent >= 60) {
      return {
        label: 'Cukup',
        icon: '🥈',
        text: 'Dasar sudah mulai terbentuk, namun perlu latihan ulang pada studi kasus yang salah.'
      };
    }

    return {
      label: 'Perlu Pembinaan',
      icon: '📚',
      text: 'Disarankan mengulang dari awal agar alur dan prinsip PBJ lebih kuat.'
    };
  }

  function addLog(type, title, text) {
    GAME_STATE.logs.unshift({ type, title, text });
    GAME_STATE.logs = GAME_STATE.logs.slice(0, 8);
  }

  function showToast(message, type = 'info') {
    if (!message) return;

    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'ps-toast';
      document.body.appendChild(toastEl);
    }

    toastEl.textContent = message;
    toastEl.className = `ps-toast ${type}`;

    requestAnimationFrame(() => {
      if (toastEl) {
        toastEl.classList.add('show');
      }
    });

    clearTimeout(toastEl._hideTimer);
    toastEl._hideTimer = setTimeout(() => {
      if (toastEl) {
        toastEl.classList.remove('show');
      }
    }, 1800);
  }

  function flashScreen(type) {
    let flash = document.getElementById('psScreenFlash');

    if (!flash) {
      flash = document.createElement('div');
      flash.id = 'psScreenFlash';
      flash.className = 'ps-screen-flash';
      document.body.appendChild(flash);
    }

    flash.className = `ps-screen-flash ${type}`;

    setTimeout(() => {
      flash.className = 'ps-screen-flash';
    }, 360);
  }

  function popScore(target, text, type = 'info') {
    if (!target || !target.getBoundingClientRect) return;

    const rect = target.getBoundingClientRect();
    const el = document.createElement('div');

    el.className = `ps-floating-score ${type}`;
    el.textContent = text;
    el.style.left = `${rect.left + Math.min(80, rect.width / 2)}px`;
    el.style.top = `${rect.top + 8}px`;

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 850);
  }

  function spawnConfetti() {
    const colors = ['#2563eb', '#22d3ee', '#16a34a', '#f59e0b', '#ef4444'];
    const centerX = window.innerWidth / 2;
    const startY = 90;

    for (let i = 0; i < 36; i += 1) {
      const piece = document.createElement('div');
      piece.className = 'ps-confetti';
      piece.style.left = `${centerX + (Math.random() * 520 - 260)}px`;
      piece.style.top = `${startY + Math.random() * 40}px`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * .18}s`;

      document.body.appendChild(piece);

      setTimeout(() => piece.remove(), 1100);
    }
  }

  function ensurePanjiMarkup(scope) {
    if (scope.querySelector('#panjiAssistant')) return;

    const panji = document.createElement('div');
    panji.id = 'panjiAssistant';
    panji.className = 'panji-assistant panji-hidden';
    panji.innerHTML = `
      <div class="panji-bubble" id="panjiBubble">
        <button type="button" class="panji-close" id="panjiClose" aria-label="Tutup PANJI">×</button>
        <div class="panji-bubble-top">
          <div class="panji-name">PANJI • PENGADAAN JITU</div>
          <div class="panji-emote" id="panjiEmote">🤔</div>
        </div>
        <div class="panji-text" id="panjiText">
          Halo, aku PANJI.
        </div>
        <div class="panji-actions">
          <button type="button" id="panjiHintBtn">Tanya PANJI</button>
          <button type="button" id="panjiMiniBtn">Minimize</button>
        </div>
      </div>

      <button type="button" class="panji-character" id="panjiCharacter" aria-label="PANJI">
        <div class="panji-glow"></div>
        <div class="panji-head">
          <div class="panji-hat">PBJ</div>
          <div class="panji-eye panji-eye-left"></div>
          <div class="panji-eye panji-eye-right"></div>
          <div class="panji-mouth"></div>
        </div>
        <div class="panji-body">
          <div class="panji-badge">PJ</div>
        </div>
        <div class="panji-hand panji-hand-left"></div>
        <div class="panji-hand panji-hand-right"></div>
      </button>
    `;

    scope.appendChild(panji);
  }

  function initPanji(scope) {
    ensurePanjiMarkup(scope);

    panjiEl = scope.querySelector('#panjiAssistant');
    panjiTextEl = scope.querySelector('#panjiText');
    panjiEmoteEl = scope.querySelector('#panjiEmote');
    panjiBubbleEl = scope.querySelector('#panjiBubble');
    panjiHintBtn = scope.querySelector('#panjiHintBtn');
    panjiMiniBtn = scope.querySelector('#panjiMiniBtn');
    panjiCharacterBtn = scope.querySelector('#panjiCharacter');
    panjiCloseBtn = scope.querySelector('#panjiClose');

    if (!panjiEl || !panjiTextEl) return;

    if (panjiHintBtn) {
      panjiHintBtn.addEventListener('click', () => {
        requestHintFromPanji();
      });
    }

    if (panjiMiniBtn) {
      panjiMiniBtn.addEventListener('click', () => {
        panjiEl.classList.add('panji-minimized');
      });
    }

    if (panjiCharacterBtn) {
      panjiCharacterBtn.addEventListener('click', () => {
        panjiEl.classList.remove('panji-hidden');

        if (panjiEl.classList.contains('panji-minimized')) {
          panjiEl.classList.remove('panji-minimized');
          showPanji('Aku balik lagi. Kalau bingung, klik tombol "Tanya PANJI". Tapi ingat, minta hint mengurangi skor ya.', 'thinking');
        } else {
          panjiEl.classList.add('panji-minimized');
        }
      });
    }

    if (panjiCloseBtn) {
      panjiCloseBtn.addEventListener('click', () => {
        panjiEl.classList.add('panji-hidden');
      });
    }
  }

  function showPanji(message, mood = 'thinking') {
    if (!panjiEl || !panjiTextEl) return;

    clearPanjiTalkTimer();

    panjiEl.classList.remove('panji-hidden');
    panjiEl.classList.remove('panji-minimized');

    panjiEl.classList.remove(
      'panji-happy',
      'panji-sad',
      'panji-thinking',
      'panji-intro',
      'panji-talking'
    );

    void panjiEl.offsetWidth;

    panjiEl.classList.add(`panji-${mood}`);
    panjiEl.classList.add('panji-talking');

    if (panjiEmoteEl) {
      panjiEmoteEl.textContent =
        mood === 'happy'
          ? '😄'
          : mood === 'sad'
            ? '😭'
            : '🤔';
    }

    panjiTextEl.textContent = message;

    if (panjiBubbleEl) {
      panjiBubbleEl.classList.remove('burst');
      void panjiBubbleEl.offsetWidth;
      panjiBubbleEl.classList.add('burst');
    }

    const talkDuration = Math.min(
      6200,
      Math.max(1300, String(message || '').length * 34)
    );

    panjiTalkTimer = setTimeout(() => {
      if (!panjiEl) return;

      panjiEl.classList.remove('panji-talking');
      panjiTalkTimer = null;
    }, talkDuration);
  }

  function showPanjiIntro() {
    clearPanjiIntroTimers();

    showPanji(
      'Halo! Perkenalkan, aku PANJI.',
      'happy'
    );

    if (panjiEl) {
      panjiEl.classList.remove('panji-intro');
      void panjiEl.offsetWidth;
      panjiEl.classList.add('panji-intro');
    }

    panjiIntroTimers.push(setTimeout(() => {
      if (destroyed) return;

      showPanji(
        'PANJI itu singkatan dari Pengadaan Jitu. Tugas aku nemenin kamu belajar alur PBJ, mulai dari identifikasi kebutuhan, RUP, KAK, HPS, metode, kontrak, BAST, sampai realisasi.',
        'thinking'
      );
    }, 1700));

    panjiIntroTimers.push(setTimeout(() => {
      if (destroyed) return;

      showPanji(
        `Kalau kamu bingung, klik tombol "Tanya PANJI". Aku kasih hint, tapi skor kamu berkurang ${HINT_PENALTY} poin. Jadi pakai bantuanku seperlunya aja.`,
        'thinking'
      );
    }, 4500));

    panjiIntroTimers.push(setTimeout(() => {
      if (destroyed) return;

      showPanji(
        'Yuk mulai. Jangan cuma cepat, yang penting tertib, ada dasar, ada bukti, dan risikonya rendah.',
        'happy'
      );
    }, 7200));
  }

  function getHintMessage(challenge) {
    if (!challenge) {
      return 'Fokus susun langkah paling tertib ya.';
    }

    if (challenge.type === 'pipeline') {
      const nextEmpty = GAME_STATE.placed.findIndex(item => item === null);
      const expectedId = challenge.idealIds[nextEmpty];
      const expectedCard = challenge.cards.find(item => item.id === expectedId);

      if (!expectedCard) {
        return 'Pipeline hampir selesai. Cek lagi urutan dari kiri ke kanan.';
      }

      if (nextEmpty === 0) {
        return `Hint PANJI: untuk posisi pertama, fokus cari kartu "${expectedCard.label}". Biasanya alur aman dimulai dari dasar perencanaan atau kondisi kontrak yang sedang berjalan.`;
      }

      const prev = GAME_STATE.placed[nextEmpty - 1];

      if (prev) {
        return `Hint PANJI: setelah "${prev.label}", langkah yang lebih aman untuk posisi berikutnya adalah "${expectedCard.label}". Jangan lompat ke tahap akhir sebelum dasarnya siap.`;
      }

      return `Hint PANJI: fokus cari kartu "${expectedCard.label}" untuk posisi ${nextEmpty + 1}.`;
    }

    if (challenge.hint) {
      return `Hint PANJI: ${challenge.hint}`;
    }

    return 'Baca kata kunci soal dan pilih jawaban yang paling sesuai prinsip PBJ: efektif, efisien, transparan, terbuka, bersaing, adil, dan akuntabel.';
  }

  function requestHintFromPanji() {
    clearPanjiIntroTimers();

    const challenge = getCurrentChallenge();

    if (!challenge || GAME_STATE.finished) return;

    if (GAME_STATE.hintUsed) {
      showPanji('Untuk soal ini kamu sudah pakai hint dari PANJI ya. Coba lanjutkan dulu dengan logika alur PBJ.', 'thinking');
      showToast('Hint soal ini sudah dipakai.', 'info');
      return;
    }

    GAME_STATE.hintUsed = true;
    GAME_STATE.score = Math.max(0, GAME_STATE.score - HINT_PENALTY);

    addLog('info', 'Hint PANJI dipakai', `Kamu memakai bantuan PANJI. Skor berkurang ${HINT_PENALTY} poin.`);

    showPanji(getHintMessage(challenge), 'thinking');
    showToast(`Hint dipakai. Skor -${HINT_PENALTY}.`, 'info');

    if (panjiCharacterBtn) {
      popScore(panjiCharacterBtn, `-${HINT_PENALTY}`, 'info');
    }

    renderGame();
  }

  function panjiForChallenge(challenge) {
    if (!challenge) return;

    clearPanjiIntroTimers();

    if (challenge.type === 'pipeline') {
      showPanji(
        'Ini soal pipeline. Susun kartu dari kiri ke kanan secara tertib. Aku akan jelasin setiap langkah benar supaya kamu paham, bukan cuma hafal.',
        'thinking'
      );
    } else {
      showPanji(
        'Ini soal ABCD. Baca kata kuncinya pelan-pelan. Pilih jawaban yang paling sesuai prinsip dan tahapan PBJ, bukan yang sekadar paling cepat.',
        'thinking'
      );
    }
  }

  function startGame() {
    clearAutoNextTimer();
    clearPanjiIntroTimers();

    GAME_STATE.order = CHALLENGES.map((_, index) => index);
    GAME_STATE.index = 0;
    GAME_STATE.score = 0;
    GAME_STATE.risk = 0;
    GAME_STATE.wrong = 0;
    GAME_STATE.finished = false;
    GAME_STATE.hasSeenIntro = false;

    showPanjiIntro();
    loadChallenge();
  }

  function loadChallenge() {
    clearAutoNextTimer();

    const challengeIndex = GAME_STATE.order[GAME_STATE.index];
    const challenge = CHALLENGES[challengeIndex];

    GAME_STATE.current = challenge;
    GAME_STATE.selectedCardId = null;
    GAME_STATE.answered = false;
    GAME_STATE.selectedAnswer = null;
    GAME_STATE.logs = [];
    GAME_STATE.finished = false;
    GAME_STATE.hintUsed = false;

    if (challenge.type === 'pipeline') {
      GAME_STATE.stage = 'pipeline';
      GAME_STATE.placed = Array(challenge.idealIds.length).fill(null);
      GAME_STATE.shuffledCards = shuffleArray(challenge.cards);
      GAME_STATE.progress = 0;

      addLog(
        'info',
        'Challenge pipeline dimulai',
        'Susun kartu dari kiri ke kanan. Kartu jebakan akan menaikkan risiko.'
      );
    } else {
      GAME_STATE.stage = 'quiz';
      GAME_STATE.placed = [];
      GAME_STATE.shuffledCards = [];
      GAME_STATE.progress = 100;

      addLog(
        'info',
        'Challenge ABCD dimulai',
        'Pilih jawaban yang paling tepat.'
      );
    }

    renderGame();

    if (GAME_STATE.index === 0 && !GAME_STATE.hasSeenIntro) {
      GAME_STATE.hasSeenIntro = true;
    } else {
      panjiForChallenge(challenge);
    }
  }

  function finishGame() {
    clearAutoNextTimer();
    clearPanjiIntroTimers();

    GAME_STATE.finished = true;
    GAME_STATE.stage = 'result';
    GAME_STATE.current = null;
    GAME_STATE.progress = 100;

    renderGame();
    spawnConfetti();
    showPanji('Selesai! Hasil akhir kamu sudah keluar. Kalau mau nilai lebih bagus, coba ulangi lagi dan kurangi risiko. PANJI bangga kalau kamu paham alurnya, bukan cuma ngejar cepat.', 'happy');
    showToast('Semua soal selesai. Hasil akhir ditampilkan.', 'ok');
  }

  function nextChallenge() {
    clearAutoNextTimer();

    if (GAME_STATE.index < GAME_STATE.order.length - 1) {
      GAME_STATE.index += 1;
      loadChallenge();
      return;
    }

    finishGame();
  }

  function canGoNext() {
    const challenge = getCurrentChallenge();

    if (!challenge) return false;
    if (challenge.type === 'pipeline') return GAME_STATE.progress === 100;
    return GAME_STATE.answered;
  }

  function renderGame() {
    if (!root) return;

    if (GAME_STATE.stage === 'result') {
      root.innerHTML = renderResultScreen();
      bindResultEvents();
      return;
    }

    const challenge = getCurrentChallenge();

    root.innerHTML = `
      <section class="ps-card">
        <div class="ps-card-head">
          <div>
            <h3>${escapeHtml(challenge.title)}</h3>
            <p>${escapeHtml(challenge.desc)}</p>
          </div>

          <div class="ps-pill-row">
            <div class="ps-pill ${challenge.type === 'pipeline' ? 'green' : ''}">
              ${challenge.type === 'pipeline' ? 'Pipeline' : 'ABCD'}
            </div>
            <div class="ps-pill">Soal ${GAME_STATE.index + 1} / ${GAME_STATE.order.length}</div>
            ${GAME_STATE.selectedCardId ? '<div class="ps-pill warn">Kartu dipilih</div>' : ''}
            ${GAME_STATE.hintUsed ? '<div class="ps-pill warn">Hint PANJI dipakai</div>' : ''}
          </div>
        </div>

        <div class="ps-case-panel">
          <div class="ps-case-box">
            <label>Kasus / Topik</label>
            <strong>${escapeHtml(challenge.caseTitle)}</strong>
            <span>${escapeHtml(challenge.desc)}</span>
          </div>

          <div class="ps-case-box">
            <label>Jenis Soal</label>
            <strong>${challenge.type === 'pipeline' ? 'Susun Pipeline' : 'Pilihan ABCD'}</strong>
          </div>

          <div class="ps-case-box">
            <label>Skor</label>
            <strong>${GAME_STATE.score}</strong>
          </div>

          <div class="ps-case-box">
            <label>Risiko</label>
            <strong>${GAME_STATE.risk}</strong>
          </div>
        </div>

        <div class="ps-score-grid">
          <div class="ps-score-card">
            <label>Progress</label>
            <strong>${GAME_STATE.progress}%</strong>
          </div>
          <div class="ps-score-card">
            <label>Skor</label>
            <strong>${GAME_STATE.score}</strong>
          </div>
          <div class="ps-score-card">
            <label>Risiko</label>
            <strong>${GAME_STATE.risk}</strong>
          </div>
          <div class="ps-score-card">
            <label>Salah</label>
            <strong>${GAME_STATE.wrong}</strong>
          </div>
        </div>

        <div class="ps-progress-track">
          <div class="ps-progress-bar" style="width:${GAME_STATE.progress}%"></div>
        </div>

        <div class="ps-helper-row">
          <div class="ps-helper-note">
            <b>PANJI siap bantu.</b> Kalau klik <b>Tanya PANJI</b>, kamu dapat hint tetapi skor berkurang <b>${HINT_PENALTY}</b>.
          </div>
          <button type="button" class="ps-btn ps-btn-soft" id="btnPanjiHint">
            Tanya PANJI (-${HINT_PENALTY})
          </button>
        </div>

        ${challenge.type === 'pipeline' ? renderPipelineChallenge(challenge) : renderQuizChallenge(challenge)}

        ${renderLogs()}

        <div class="ps-buttons">
          <button type="button" class="ps-btn ps-btn-soft" id="btnRestartGame">Mulai Ulang dari Soal 1</button>
          ${
            challenge.type === 'pipeline'
              ? '<button type="button" class="ps-btn ps-btn-soft" id="btnResetChallenge">Reset Soal Ini</button>'
              : ''
          }
          <button type="button" class="ps-btn ps-btn-primary" id="btnNextChallenge" ${canGoNext() ? '' : 'disabled'}>
            Lanjut Soal Berikutnya
          </button>
        </div>
      </section>
    `;

    bindGameEvents();
  }

  function renderPipelineChallenge(challenge) {
    const placedIds = new Set(GAME_STATE.placed.filter(Boolean).map(item => item.id));

    return `
      <div class="ps-pipeline">
        ${challenge.idealIds.map((_, index) => renderSlot(index)).join('')}
      </div>

      <div class="ps-card-head">
        <div>
          <h3>Kartu Pipeline Acak</h3>
          <p>Drag kartu ke slot, atau klik kartu lalu klik slot biru. Urutan harus dari kiri ke kanan.</p>
        </div>
        <button type="button" class="ps-btn ps-btn-soft" id="btnShuffleCards">
          Acak Kartu
        </button>
      </div>

      <div class="ps-bank">
        ${GAME_STATE.shuffledCards.map(item => renderPipelineCard(item, placedIds.has(item.id))).join('')}
      </div>

      ${
        GAME_STATE.progress === 100
          ? `
            <div class="ps-explanation">
              <strong>Pipeline selesai:</strong><br>
              ${escapeHtml(challenge.explanation)}
            </div>
          `
          : ''
      }
    `;
  }

  function renderSlot(index) {
    const placed = GAME_STATE.placed[index];
    const nextEmpty = GAME_STATE.placed.findIndex(item => item === null);
    const isReady = GAME_STATE.selectedCardId && !placed && index === nextEmpty;

    if (placed) {
      return `
        <div class="ps-slot correct" data-slot-index="${index}">
          <div class="ps-slot-number">${index + 1}</div>
          ${renderPipelineCard(placed, false, true)}
        </div>
      `;
    }

    return `
      <div class="ps-slot ${isReady ? 'click-ready' : ''}" data-slot-index="${index}">
        <div class="ps-slot-number">${index + 1}</div>
        <div class="ps-slot-placeholder">
          ${isReady ? 'Klik untuk pasang kartu' : `Slot ${index + 1}`}
        </div>
      </div>
    `;
  }

  function renderPipelineCard(item, used = false, locked = false) {
    const selected = GAME_STATE.selectedCardId === item.id ? 'selected' : '';
    const trapClass = item.type === 'trap' ? 'trap-card' : '';

    return `
      <div
        class="ps-action-card ${used ? 'used' : ''} ${locked ? 'correct-card' : ''} ${selected} ${trapClass}"
        draggable="${used || locked || GAME_STATE.progress === 100 ? 'false' : 'true'}"
        data-card-id="${escapeHtml(item.id)}"
      >
        <div class="ps-card-icon">${item.icon}</div>
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(item.note)}</span>
      </div>
    `;
  }

  function renderQuizChallenge(challenge) {
    return `
      <div class="ps-quiz-question">
        ${escapeHtml(challenge.question)}
      </div>

      <div class="ps-quiz-options">
        ${challenge.options.map((option, index) => {
          let cls = '';

          if (GAME_STATE.answered) {
            if (index === challenge.answer) cls = 'correct';
            else if (index === GAME_STATE.selectedAnswer) cls = 'wrong';
          }

          return `
            <button
              type="button"
              class="ps-quiz-option ${cls}"
              data-answer-index="${index}"
              ${GAME_STATE.answered ? 'disabled' : ''}
            >
              ${String.fromCharCode(65 + index)}. ${escapeHtml(option)}
            </button>
          `;
        }).join('')}
      </div>

      ${
        GAME_STATE.answered
          ? `
            <div class="ps-explanation">
              <strong>Pembahasan:</strong><br>
              ${escapeHtml(challenge.explanation)}
            </div>
          `
          : ''
      }
    `;
  }

  function renderLogs() {
    if (!GAME_STATE.logs.length) return '';

    return `
      <div class="ps-log-box">
        <strong>Log Pembelajaran</strong>
        <div class="ps-log-list">
          ${GAME_STATE.logs.map(item => `
            <div class="ps-log-item">
              <div class="ps-log-icon ${item.type}">
                ${item.type === 'ok' ? '✓' : item.type === 'bad' ? '!' : 'i'}
              </div>
              <div>
                <div class="ps-log-title">${escapeHtml(item.title)}</div>
                <div class="ps-log-sub">${escapeHtml(item.text)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderResultScreen() {
    const maxScore = calculateMaxScore();
    const percent = maxScore > 0 ? Math.round((GAME_STATE.score / maxScore) * 100) : 0;
    const grade = getResultGrade(percent);
    const totalQuestions = CHALLENGES.length;
    const riskLabel = GAME_STATE.risk <= 20
      ? 'Rendah'
      : GAME_STATE.risk <= 60
        ? 'Sedang'
        : 'Tinggi';

    return `
      <section class="ps-card">
        <div class="ps-result-hero">
          <h2>${grade.icon} ${grade.label}</h2>
          <p>${escapeHtml(grade.text)}</p>
        </div>

        <div class="ps-result-grid">
          <div class="ps-result-card">
            <label>Nilai Akhir</label>
            <strong>${percent}%</strong>
          </div>

          <div class="ps-result-card">
            <label>Skor</label>
            <strong>${GAME_STATE.score}/${maxScore}</strong>
          </div>

          <div class="ps-result-card">
            <label>Risiko</label>
            <strong>${GAME_STATE.risk}</strong>
          </div>

          <div class="ps-result-card">
            <label>Salah</label>
            <strong>${GAME_STATE.wrong}</strong>
          </div>
        </div>

        <div class="ps-result-note">
          <strong>Ringkasan:</strong><br>
          Kamu sudah menyelesaikan ${totalQuestions} soal/challenge. Level risiko kamu saat ini:
          <strong>${riskLabel}</strong>. Ingat, terlalu sering memakai hint dari PANJI memang membantu,
          tetapi mengurangi skor.
        </div>

        <div class="ps-result-note">
          <strong>Catatan pembelajaran:</strong><br>
          Dalam praktik PBJ, keputusan tidak cukup hanya cepat. Harus ada alur yang tertib, bukti yang jelas,
          pemilihan metode yang sesuai, serta dokumentasi saat terjadi perubahan kondisi seperti katalog tidak tersedia
          atau kontrak perlu diadendum.
        </div>

        <div class="ps-buttons">
          <button type="button" class="ps-btn ps-btn-primary" id="btnPlayAgain">
            Main Lagi dari Soal 1
          </button>
        </div>
      </section>
    `;
  }

  function bindResultEvents() {
    const btnPlayAgain = root.querySelector('#btnPlayAgain');

    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        clearAutoNextTimer();
        startGame();
      });
    }
  }

  function bindGameEvents() {
    root.querySelectorAll('.ps-action-card[draggable="true"]').forEach(cardEl => {
      cardEl.addEventListener('dragstart', event => {
        event.dataTransfer.setData('text/plain', cardEl.dataset.cardId);
        event.dataTransfer.effectAllowed = 'move';
        cardEl.classList.add('selected');
      });

      cardEl.addEventListener('dragend', () => {
        cardEl.classList.remove('selected');
      });

      cardEl.addEventListener('click', () => {
        selectCard(cardEl.dataset.cardId);
      });
    });

    root.querySelectorAll('.ps-slot').forEach(slot => {
      slot.addEventListener('dragover', event => {
        event.preventDefault();
        slot.classList.add('drag-over');
      });

      slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
      });

      slot.addEventListener('drop', event => {
        event.preventDefault();
        slot.classList.remove('drag-over');

        const cardId = event.dataTransfer.getData('text/plain');
        const slotIndex = Number(slot.dataset.slotIndex);
        placeCard(cardId, slotIndex, slot);
      });

      slot.addEventListener('click', () => {
        if (!GAME_STATE.selectedCardId) return;

        const slotIndex = Number(slot.dataset.slotIndex);
        placeCard(GAME_STATE.selectedCardId, slotIndex, slot);
      });
    });

    root.querySelectorAll('[data-answer-index]').forEach(button => {
      button.addEventListener('click', () => {
        answerQuiz(Number(button.dataset.answerIndex), button);
      });
    });

    const btnNext = root.querySelector('#btnNextChallenge');
    const btnRestart = root.querySelector('#btnRestartGame');
    const btnReset = root.querySelector('#btnResetChallenge');
    const btnShuffle = root.querySelector('#btnShuffleCards');
    const btnPanjiHint = root.querySelector('#btnPanjiHint');

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        clearAutoNextTimer();
        nextChallenge();
      });
    }

    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        clearAutoNextTimer();
        startGame();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        clearAutoNextTimer();
        loadChallenge();
      });
    }

    if (btnShuffle) {
      btnShuffle.addEventListener('click', () => {
        const challenge = getCurrentChallenge();

        if (!challenge || challenge.type !== 'pipeline') return;

        GAME_STATE.shuffledCards = shuffleArray(challenge.cards);
        GAME_STATE.selectedCardId = null;

        renderGame();
        showToast('Kartu diacak ulang.', 'info');
        showPanji('Kartu sudah diacak ulang. Coba fokus lagi dari urutan yang paling awal.', 'thinking');
      });
    }

    if (btnPanjiHint) {
      btnPanjiHint.addEventListener('click', () => {
        requestHintFromPanji();
      });
    }
  }

  function selectCard(cardId) {
    if (GAME_STATE.progress === 100) return;

    GAME_STATE.selectedCardId = GAME_STATE.selectedCardId === cardId ? null : cardId;

    if (GAME_STATE.selectedCardId) {
      const challenge = getCurrentChallenge();
      const item = challenge.cards.find(cardItem => cardItem.id === cardId);
      showToast(`Kartu dipilih: ${item ? item.label : cardId}. Klik slot biru.`, 'info');
    }

    renderGame();
  }

  function placeCard(cardId, slotIndex, slotEl) {
    clearPanjiIntroTimers();

    const challenge = getCurrentChallenge();

    if (!challenge || challenge.type !== 'pipeline') return;
    if (GAME_STATE.progress === 100) return;

    const expectedId = challenge.idealIds[slotIndex];
    const item = challenge.cards.find(cardItem => cardItem.id === cardId);

    if (!item) return;

    const alreadyPlaced = GAME_STATE.placed.some(placedItem => placedItem && placedItem.id === cardId);
    if (alreadyPlaced) return;

    const nextEmpty = GAME_STATE.placed.findIndex(placedItem => placedItem === null);

    if (slotIndex !== nextEmpty) {
      wrongMove(cardId, `Isi pipeline dari kiri ke kanan. Slot berikutnya adalah nomor ${nextEmpty + 1}.`);
      return;
    }

    if (cardId !== expectedId) {
      const expected = challenge.cards.find(cardItem => cardItem.id === expectedId);
      wrongMove(cardId, `Kamu memilih "${item.label}", posisi ini seharusnya "${expected ? expected.label : expectedId}".`);
      return;
    }

    GAME_STATE.placed[slotIndex] = item;
    GAME_STATE.selectedCardId = null;
    GAME_STATE.progress = Math.round((getPlacedCount() / challenge.idealIds.length) * 100);
    GAME_STATE.score += 10;

    addLog('ok', `${item.label} benar`, getCorrectMessage(item.id));

    showToast(`Benar: ${item.label}`, 'ok');
    showPanji(getPanjiReactionMessage(item.id), 'happy');
    flashScreen('ok');
    popScore(slotEl || document.body, '+10', 'ok');

    const completed = GAME_STATE.progress === 100;

    renderGame();
    pulseSlot(slotIndex);

    if (completed) {
      GAME_STATE.score += 20;
      addLog('ok', 'Pipeline selesai', challenge.explanation);
      showPanji('Mantap! Pipeline ini selesai dengan benar. Kamu sudah menyusun alur PBJ secara tertib. Kita lanjut ke soal berikutnya ya.', 'happy');
      showToast('Pipeline benar 100%. Otomatis lanjut...', 'ok');
      spawnConfetti();

      scheduleAutoNext('Pipeline selesai. Otomatis lanjut ke soal berikutnya...');
    }
  }

  function pulseSlot(slotIndex) {
    requestAnimationFrame(() => {
      const slot = root.querySelector(`.ps-slot[data-slot-index="${slotIndex}"]`);

      if (!slot) return;

      slot.classList.add('fx-correct');

      setTimeout(() => {
        slot.classList.remove('fx-correct');
      }, 520);
    });
  }

  function shakeCard(cardId) {
    requestAnimationFrame(() => {
      const cardEl = root.querySelector(`.ps-action-card[data-card-id="${cardId}"]`);

      if (!cardEl) return;

      cardEl.classList.remove('wrong');
      void cardEl.offsetWidth;
      cardEl.classList.add('wrong');

      setTimeout(() => {
        cardEl.classList.remove('wrong');
      }, 360);
    });
  }

  function wrongMove(cardId, message) {
    clearPanjiIntroTimers();

    GAME_STATE.risk += 10;
    GAME_STATE.wrong += 1;
    GAME_STATE.score = Math.max(0, GAME_STATE.score - 5);
    GAME_STATE.selectedCardId = null;

    addLog('bad', 'Urutan belum tepat', message);

    showToast('Belum tepat. Risiko naik.', 'bad');
    showPanji(getPanjiWrongMessage(cardId, message), 'sad');
    flashScreen('bad');

    renderGame();
    shakeCard(cardId);
  }

  function answerQuiz(selectedIndex, buttonEl) {
    clearPanjiIntroTimers();

    const challenge = getCurrentChallenge();

    if (!challenge || challenge.type !== 'quiz') return;
    if (GAME_STATE.answered) return;

    GAME_STATE.selectedAnswer = selectedIndex;
    GAME_STATE.answered = true;

    if (selectedIndex === challenge.answer) {
      GAME_STATE.score += 20;

      addLog('ok', 'Jawaban benar', challenge.explanation);

      showToast('Jawaban benar. Otomatis lanjut...', 'ok');
      showPanji(`Jawabanmu benar! ${challenge.explanation}`, 'happy');
      flashScreen('ok');
      popScore(buttonEl || document.body, '+20', 'ok');
      spawnConfetti();

      renderGame();
      scheduleAutoNext('Jawaban benar. Otomatis lanjut ke soal berikutnya...');
    } else {
      GAME_STATE.risk += 8;
      GAME_STATE.wrong += 1;
      GAME_STATE.score = Math.max(0, GAME_STATE.score - 5);

      addLog('bad', 'Jawaban belum tepat', challenge.explanation);

      showToast('Jawaban belum tepat. Otomatis lanjut setelah pembahasan.', 'bad');
      showPanji(`Yah, belum tepat. Cek pembahasan ini ya: ${challenge.explanation}`, 'sad');
      flashScreen('bad');
      popScore(buttonEl || document.body, '+8 Risiko', 'bad');

      renderGame();
      scheduleAutoNext('Pembahasan terbuka. Otomatis lanjut ke soal berikutnya...', 2500);
    }
  }

  function getCorrectMessage(cardId) {
    const messages = {
      rup: 'RUP menjadi pintu awal untuk memastikan paket, jadwal, pagu, metode, dan satker.',
      identifikasi: 'Identifikasi kebutuhan mencegah paket tidak relevan, dobel, atau tidak sesuai prioritas.',
      konsolidasi: 'Konsolidasi membantu mengelola kebutuhan sejenis agar tidak terpecah tanpa alasan.',
      kak: 'KAK/spesifikasi harus berbasis kebutuhan dan tidak mengarah.',
      'review-spek': 'Review spesifikasi penting agar persaingan sehat.',
      hps: 'HPS/referensi harga menjadi dasar kewajaran biaya.',
      'cek-pdn': 'PDN/TKDN perlu diperhatikan untuk mendukung produk dalam negeri.',
      'cek-umkk': 'UMK/Koperasi perlu diperhatikan dalam afirmasi belanja pemerintah.',
      'cek-katalog': 'Cek katalog membantu menentukan apakah e-Purchasing dapat digunakan.',
      'katalog-tidak-sesuai': 'Jika katalog tidak menyediakan produk/penyedia sesuai, kondisi itu harus dicatat.',
      'dokumentasi-gagal-katalog': 'Dokumentasi hasil cek katalog menjadi dasar perubahan metode.',
      'evaluasi-metode': 'Evaluasi metode diperlukan agar metode baru sesuai nilai, jenis, dan kondisi paket.',
      'pilih-metode': 'Metode dipilih setelah kebutuhan, nilai, jadwal, dan pasar dipahami.',
      'metode-pl': 'Pengadaan Langsung tepat bila nilai dan kondisi paket sesuai.',
      'metode-epurchasing': 'e-Purchasing tepat jika tersedia di katalog dan sesuai kebutuhan.',
      'mini-kompetisi': 'Mini kompetisi mendukung transparansi dan persaingan sehat pada katalog tertentu.',
      tender: 'Tender dipakai saat karakter paket membutuhkan proses pemilihan formal.',
      seleksi: 'Seleksi relevan untuk jasa konsultansi.',
      swakelola: 'Swakelola dapat dipilih jika memenuhi kriteria.',
      'tim-persiapan': 'Tim persiapan penting dalam penyelenggaraan swakelola.',
      'tim-pelaksana': 'Tim pelaksana menjalankan pekerjaan swakelola.',
      'tim-pengawas': 'Tim pengawas memastikan swakelola terkendali.',
      klarifikasi: 'Klarifikasi/negosiasi memastikan harga, spesifikasi, dan kemampuan pelaksanaan.',
      proses: 'Proses pemilihan dilakukan setelah dokumen dan metode siap.',
      kontrak: 'Kontrak/SPK menjadi dasar pelaksanaan setelah proses pengadaan.',
      'monitoring-kontrak': 'Monitoring kontrak mengendalikan waktu, mutu, volume, dan kewajiban penyedia.',
      'uang-muka': 'Uang muka, jaminan, dan syarat kontrak perlu dikelola tertib.',
      'identifikasi-perubahan': 'Perubahan kontrak harus diawali identifikasi kondisi perubahan.',
      'kaji-kontrak': 'Klausul kontrak perlu dikaji sebelum adendum.',
      'justifikasi-teknis': 'Justifikasi teknis menjadi dasar perubahan kontrak.',
      'negosiasi-perubahan': 'Negosiasi perubahan membahas dampak harga, waktu, dan volume.',
      'adendum-kontrak': 'Adendum dituangkan secara tertulis sebelum perubahan dilaksanakan lebih lanjut.',
      teguran: 'Teguran/evaluasi diperlukan saat penyedia terlambat atau bermasalah.',
      pemeriksaan: 'Pemeriksaan hasil mencegah barang/jasa tidak sesuai langsung diterima.',
      bast: 'BAST dilakukan setelah hasil diperiksa dan sesuai.',
      pembayaran: 'Pembayaran dilakukan setelah dokumen pendukung memadai.',
      realisasi: 'Pencatatan realisasi memastikan data monitoring tidak bolong.'
    };

    return messages[cardId] || 'Langkah ini benar pada posisi pipeline saat ini.';
  }

  function getPanjiReactionMessage(cardId) {
    const messages = {
      rup:
        'Betul. Cek RUP dulu di SiRUP untuk memastikan paket sudah diumumkan, pagu, metode, jadwal, dan satkernya sesuai sebelum proses lanjut. Dari RUP ini kita tahu prosesnya tidak loncat dari perencanaan.',

      identifikasi:
        'Betul. Identifikasi kebutuhan itu pondasi awal. PPK perlu memastikan barang atau jasa memang dibutuhkan, volumenya jelas, lokasinya jelas, waktunya masuk akal, dan tidak dobel dengan paket lain.',

      konsolidasi:
        'Betul. Kalau kebutuhannya sejenis, pikirkan konsolidasi dulu. Ini bisa membantu efisiensi, menguatkan posisi belanja pemerintah, dan mencegah paket dipecah-pecah tanpa alasan yang kuat.',

      'review-spek':
        'Betul. Spesifikasi perlu direview supaya tidak mengarah ke merek atau penyedia tertentu. Spek harus menjelaskan kebutuhan dan standar kinerja, bukan mengunci calon pemenang.',

      kak:
        'Betul. KAK atau spesifikasi menjelaskan kebutuhan secara teknis, ruang lingkup, output, jadwal, lokasi, dan standar yang harus dipenuhi. KAK yang rapi bikin proses berikutnya lebih aman.',

      hps:
        'Betul. Setelah KAK jelas, HPS atau referensi harga disusun sebagai dasar kewajaran harga. Jangan asal ambil angka tanpa survei, pembanding, katalog, pasar, atau dasar yang masuk akal.',

      'cek-pdn':
        'Betul. Cek PDN dan TKDN penting untuk mendukung penggunaan produk dalam negeri. Kalau produk dalam negeri tersedia dan sesuai, jangan langsung lari ke produk impor.',

      'cek-umkk':
        'Betul. Afirmasi UMK dan koperasi perlu diperhatikan. Belanja pemerintah bukan cuma mengejar barang cepat datang, tapi juga mendorong pelaku usaha kecil dan koperasi bila sesuai.',

      'cek-katalog':
        'Betul. Cek e-Katalog dulu untuk melihat apakah barang atau jasa tersedia, spesifikasinya sesuai, penyedianya ada, harganya wajar, TKDN-nya cocok, dan proses e-Purchasing bisa dipertanggungjawabkan.',

      'katalog-tidak-sesuai':
        'Betul. Kalau katalog tidak menyediakan produk atau penyedia yang sesuai, kondisi itu harus dicatat. Jangan memaksakan e-Purchasing kalau barangnya tidak cocok dengan kebutuhan.',

      'dokumentasi-gagal-katalog':
        'Betul. Dokumentasi hasil cek katalog penting sebagai bukti kenapa metode awal tidak bisa dilanjutkan. Simpan dasar pengecekan agar perubahan metode tidak terlihat asal-asalan.',

      'evaluasi-metode':
        'Betul. Setelah ada bukti katalog tidak sesuai, metode perlu dievaluasi ulang berdasarkan nilai paket, jenis pengadaan, kondisi pasar, ketersediaan penyedia, dan ketentuan yang berlaku.',

      'pilih-metode':
        'Betul. Metode dipilih setelah kebutuhan, HPS, kondisi pasar, jenis pengadaan, dan nilai paket jelas. Jangan pilih metode hanya karena paling cepat atau paling gampang.',

      'metode-pl':
        'Betul. Pengadaan Langsung bisa dipakai kalau nilai dan kondisinya sesuai. Kalau nilainya melewati batas atau paketnya kompleks, jangan dipaksa jadi Pengadaan Langsung.',

      'metode-epurchasing':
        'Betul. e-Purchasing tepat kalau barang atau jasa tersedia di katalog, spesifikasinya sesuai, penyedianya ada, dan prosesnya bisa dipertanggungjawabkan.',

      'mini-kompetisi':
        'Betul. Mini kompetisi dipakai untuk memberi kesempatan yang sama kepada penyedia katalog dan menjaga persaingan sehat, terutama pada sektor yang mewajibkan mekanisme tersebut.',

      tender:
        'Betul. Tender dipakai untuk paket yang memerlukan proses pemilihan formal dan kompetitif, terutama jika nilai atau karakter pekerjaannya tidak cocok dengan metode sederhana.',

      seleksi:
        'Betul. Untuk jasa konsultansi, metode seleksi sering digunakan karena yang dinilai bukan cuma harga, tapi juga kualitas keahlian, pengalaman, dan pendekatan teknis.',

      swakelola:
        'Betul. Swakelola digunakan kalau kegiatan memenuhi kriteria swakelola. Tetap harus ada perencanaan, KAK, anggaran, pelaksanaan, pengawasan, dan pertanggungjawaban.',

      'tim-persiapan':
        'Betul. Dalam swakelola, tim persiapan penting untuk menyusun sasaran, rencana kegiatan, KAK, jadwal, dan kebutuhan pelaksanaan secara jelas.',

      'tim-pelaksana':
        'Betul. Tim pelaksana menjalankan pekerjaan swakelola. Jadi tidak cukup cuma niat swakelola, pelaksananya harus jelas.',

      'tim-pengawas':
        'Betul. Tim pengawas menjaga agar pelaksanaan swakelola sesuai rencana, mutu, waktu, dan output yang sudah ditetapkan.',

      klarifikasi:
        'Betul. Klarifikasi atau negosiasi memastikan harga, spesifikasi, jadwal, dan kemampuan pelaksanaan benar-benar masuk akal sebelum kontrak dilakukan.',

      proses:
        'Betul. Proses pemilihan dilakukan setelah dokumen dan metode siap. Jangan lompat ke kontrak sebelum proses pemilihannya tertib dan bisa dipertanggungjawabkan.',

      kontrak:
        'Betul. Kontrak atau SPK menjadi dasar pelaksanaan pekerjaan. Ini dilakukan setelah proses pengadaan selesai dan penyedia atau pelaksana sudah ditetapkan.',

      'monitoring-kontrak':
        'Betul. Setelah kontrak berjalan, PPK wajib memantau waktu, mutu, volume, progres, dan kewajiban penyedia. Jangan baru sadar bermasalah saat mau BAST.',

      'uang-muka':
        'Betul. Kalau ada uang muka atau jaminan, pengelolaannya harus sesuai ketentuan kontrak. Ini bagian penting dari pengendalian risiko pelaksanaan.',

      teguran:
        'Betul. Kalau penyedia terlambat atau tidak sesuai, lakukan teguran atau evaluasi. Masalah kontrak harus dikendalikan, bukan dibiarkan sampai akhir.',

      pemeriksaan:
        'Betul. Pemeriksaan hasil dilakukan sebelum BAST. Barang atau pekerjaan harus dicek dulu kesesuaiannya dengan kontrak, spesifikasi, volume, dan kualitas.',

      bast:
        'Betul. BAST dilakukan setelah hasil pekerjaan atau barang sesuai. Jangan BAST kalau barang belum diperiksa, belum lengkap, atau masih bermasalah.',

      pembayaran:
        'Betul. Pembayaran dilakukan setelah dokumen pendukung lengkap, prestasi pekerjaan sesuai, dan proses serah terima tertib.',

      realisasi:
        'Betul. Realisasi harus dicatat supaya data monitoring tidak bolong, termasuk untuk evaluasi, laporan, dan pemantauan kinerja pengadaan.',

      'identifikasi-perubahan':
        'Betul. Kalau ada perubahan kontrak, mulai dari identifikasi dulu: apa yang berubah, kenapa berubah, dan dampaknya ke volume, waktu, mutu, atau biaya.',

      'kaji-kontrak':
        'Betul. Sebelum adendum, klausul kontrak harus dikaji. Tidak semua perubahan bisa langsung ditulis jadi adendum tanpa dasar kontraktual.',

      'justifikasi-teknis':
        'Betul. Justifikasi teknis menjelaskan alasan perubahan secara tertib. Ini penting supaya adendum tidak terlihat asal mengubah kontrak.',

      'negosiasi-perubahan':
        'Betul. Perubahan kontrak perlu dibahas dampaknya, termasuk harga, waktu, volume, mutu, dan risiko. Jangan sampai perubahan merugikan atau tidak jelas dasarnya.',

      'adendum-kontrak':
        'Betul. Adendum kontrak menuangkan perubahan secara tertulis. Setelah itu pelaksanaan lanjut sesuai perubahan yang sudah disepakati.'
    };

    return messages[cardId] || 'Betul. Langkah itu sudah tepat di posisi pipeline ini. Lanjutkan dengan urutan yang tertib dan jangan lompat proses.';
  }

  function getPanjiWrongMessage(cardId, fallbackMessage) {
    const messages = {
      'kontrak-awal':
        'Aduh, jangan kontrak dulu. Kontrak atau SPK baru aman setelah dokumen siap, metode jelas, proses pemilihan selesai, dan penyedia sudah ditetapkan.',

      'pecah-paket':
        'Waduh, hati-hati. Pecah paket tanpa alasan kuat bisa dianggap menghindari metode yang seharusnya. Kalau kebutuhan sejenis, pikirkan konsolidasi.',

      'spek-mengarah':
        'Jangan pakai spek mengarah. Spesifikasi harus menjelaskan kebutuhan, bukan mengunci merek atau penyedia tertentu.',

      'abaikan-katalog':
        'Jangan abaikan katalog. Untuk barang atau jasa yang berpotensi tersedia di e-Katalog, cek dulu kesesuaian produk, penyedia, harga, TKDN, dan kebutuhan.',

      'lanjut-epurchasing-paksa':
        'Jangan memaksa e-Purchasing kalau produk atau penyedia di katalog tidak sesuai kebutuhan. Dokumentasikan hasil cek dulu, baru evaluasi metode.',

      'ganti-metode-tanpa-bukti':
        'Jangan ganti metode tanpa bukti. Perubahan metode harus punya dasar, misalnya hasil cek katalog tidak sesuai dan dokumentasi pendukungnya jelas.',

      'lewati-rup':
        'Jangan lewati RUP. RUP di SiRUP adalah pintu awal untuk memastikan paket memang sudah direncanakan dan diumumkan.',

      'bast-tanpa-cek':
        'Jangan BAST tanpa pemeriksaan. Barang atau pekerjaan harus dicek dulu kesesuaiannya dengan kontrak, volume, spesifikasi, dan kualitas.',

      'bayar-dulu':
        'Jangan bayar dulu. Pembayaran harus menunggu prestasi pekerjaan, dokumen pendukung, dan serah terima yang tertib.',

      'tunda-dokumen':
        'Jangan tunda dokumen. Dalam PBJ, bukti dan administrasi itu bagian dari akuntabilitas, bukan pelengkap belakangan.',

      'metode-asal-cepat':
        'Jangan pilih metode hanya karena cepat. Metode harus sesuai nilai paket, jenis pengadaan, kondisi pasar, dan ketentuan.',

      'realisasi-lupa':
        'Jangan lupa catat realisasi. Kalau realisasi tidak dicatat, monitoring dan laporan kinerja pengadaan jadi bolong.',

      'adendum-tanpa-dasar':
        'Jangan membuat adendum tanpa dasar. Perubahan kontrak harus diawali identifikasi, kajian klausul, justifikasi teknis, dan kesepakatan yang tertib.',

      'bayar-sebelum-adendum':
        'Jangan bayar sebelum perubahan kontrak tertib. Kalau ada perubahan volume, waktu, atau nilai, rapikan dasar dan adendumnya dulu.',

      'swakelola-tanpa-tim':
        'Jangan swakelola tanpa tim yang jelas. Swakelola perlu tim persiapan, tim pelaksana, dan tim pengawas agar peran dan kontrolnya tertib.',

      'abaikan-pdn':
        'Jangan abaikan PDN/TKDN. Afirmasi produk dalam negeri menjadi bagian penting dalam kebijakan PBJ dan belanja katalog.'
    };

    return messages[cardId] || `Aduh, belum tepat. ${fallbackMessage}`;
  }

  window.__moduleInit = function ({ container }) {
    destroyed = false;
    containerRef = container;
    root = container.querySelector('#procstackRoot');

    if (!root) {
      const wrapper = document.createElement('div');
      wrapper.className = 'procstack-shell';
      wrapper.innerHTML = `
        <section class="procstack-hero">
          <div class="procstack-kicker">TRAXPBJ Academy • Interactive PBJ Challenge</div>
          <h2>Procurement Stacker</h2>
          <p>
            Susun pipeline pengadaan, jawab studi kasus, dan belajar alur PBJ bersama PANJI.
            Game ini melatih logika tahapan: perencanaan, pemilihan, kontrak, serah terima, dan realisasi.
          </p>
        </section>

        <section class="procstack-game-card">
          <div id="procstackRoot"></div>
        </section>
      `;

      container.appendChild(wrapper);
      root = container.querySelector('#procstackRoot');
    }

    initPanji(container);
    startGame();

    return function destroy() {
      destroyed = true;

      clearAutoNextTimer();
      clearPanjiIntroTimers();
      clearPanjiTalkTimer();

      if (toastEl) {
        toastEl.remove();
        toastEl = null;
      }

      const flash = document.getElementById('psScreenFlash');

      if (flash) {
        flash.remove();
      }

      document.querySelectorAll('.ps-confetti, .ps-floating-score').forEach(el => {
        el.remove();
      });

      if (panjiEl) {
        panjiEl.classList.add('panji-hidden');
      }

      containerRef = null;
      root = null;
    };
  };
})();
