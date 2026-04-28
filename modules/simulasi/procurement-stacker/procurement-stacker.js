(() => {
  const AUTO_NEXT_DELAY_MS = 1800;
  const HINT_PENALTY = 3;
  const LEADERBOARD_API_URL = 'https://script.google.com/macros/s/AKfycbzE0c_eBIooXcKLmiMGm6o6cqtjfRsfIewmD6Hx5BCdmEYZmljquJiDOA0PJh6e9P_mOg/exec';
  const PLAYER_STORAGE_KEY = 'procstack_player_profile_v1';

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
  let panjiUserMinimized = false;
  let panjiIntroAlreadyShown = false;

  let leaderboardModalEl = null;
  let leaderboardRefreshTimer = null;
  let reviewBubbleEl = null;
  let reviewBubbleTimer = null;

  let levelTimer = null;
  let levelTimerStartedAt = 0;

  let tenderRushTimer = null;
  let tenderRushNextTimer = null;
  let tenderRushKeyHandler = null;

  let bonusSnakeTimer = null;
  let bonusSnakeKeyHandler = null;

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
      type: 'tenderRush',
      title: 'Soal 3 — Tender Rush: Pilih Jalur Metode',
      caseTitle: 'Arcade Metode Pengadaan',
      desc: 'Paket akan muncul satu per satu. Masukkan paket ke jalur metode yang paling tepat sebelum waktu habis.',
      budget: 'Simulasi cepat',
      difficulty: 'Level 2 - Arcade',
      timeLimit: 10,
      packages: [
        {
          title: 'Belanja Laptop Pelayanan Publik',
          type: 'Barang',
          pagu: 350000000,
          clue: 'Barang tersedia di e-Katalog dan perlu memperhatikan PDN/TKDN.',
          correct: 'ekatalog',
          explanation: 'Laptop yang tersedia dan sesuai di e-Katalog lebih aman diarahkan ke e-Purchasing. Jangan asal masuk Pengadaan Langsung karena nilainya besar dan kanal katalog tersedia.'
        },
        {
          title: 'Belanja ATK Kegiatan Kantor',
          type: 'Barang',
          pagu: 45000000,
          clue: 'Nilai kecil, kebutuhan sederhana, dan tidak kompleks.',
          correct: 'pengadaanLangsung',
          explanation: 'Paket kecil dan sederhana dapat menggunakan Pengadaan Langsung sepanjang sesuai batas nilai, tidak dipecah, dan administrasinya tertib.'
        },
        {
          title: 'Rehabilitasi Gedung Pelayanan',
          type: 'Pekerjaan Konstruksi',
          pagu: 760000000,
          clue: 'Pekerjaan konstruksi bernilai besar dan butuh proses formal.',
          correct: 'tenderSeleksi',
          explanation: 'Pekerjaan konstruksi bernilai besar tidak tepat dipaksa menjadi Pengadaan Langsung. Gunakan Tender/Seleksi atau mekanisme yang sesuai.'
        },
        {
          title: 'Pelatihan Internal Pegawai oleh Tim OPD',
          type: 'Jasa Lainnya',
          pagu: 95000000,
          clue: 'Kegiatan dilaksanakan sendiri dengan tim persiapan, pelaksana, dan pengawas.',
          correct: 'swakelola',
          explanation: 'Jika kegiatan memenuhi kriteria dan dilaksanakan sendiri/bersama pihak yang sesuai, Swakelola bisa dipilih dengan tim dan pertanggungjawaban yang jelas.'
        },
        {
          title: 'Pembayaran Listrik Kantor',
          type: 'Jasa Lainnya',
          pagu: 300000000,
          clue: 'Layanan utilitas rutin/tertentu.',
          correct: 'dikecualikan',
          explanation: 'Pembayaran utilitas tertentu dapat masuk kategori dikecualikan, tetapi tetap perlu dasar, bukti, dan pencatatan yang tertib.'
        }
      ],
      explanation: 'Tender Rush melatih refleks membaca jenis paket, pagu, ketersediaan katalog, dan kondisi pelaksanaan sebelum memilih metode.'
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
      ideal: ['rup', 'identifikasi', 'konsolidasi', 'kak', 'hps', 'cekKatalog', 'metodeEpurchasing', 'klarifikasi', 'kontrak', 'bast', 'realisasi'],
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


  function getTenderRushTimeLimitByLevel(levelNo) {
    if (levelNo <= 3) return 10;
    if (levelNo <= 6) return 8;
    if (levelNo <= 9) return 7;
    if (levelNo <= 12) return 6;
    return 5;
  }

  function getTenderRushFailLimitByLevel(levelNo) {
    if (levelNo <= 3) return 5;
    if (levelNo <= 6) return 3;
    if (levelNo <= 9) return 2;
    return 1;
  }

  function getCurrentLevelNumber() {
    return Math.max(1, Number(GAME_STATE.index || 0) + 1);
  }

  function cloneTenderRushChallenge(template, levelNo, variantIndex) {
    const variants = [
      {
        title: `Level ${levelNo} — Tender Rush: Pilih Jalur Metode`,
        caseTitle: 'Arcade Metode Pengadaan',
        difficulty: `Level ${levelNo} - Arcade`,
        packages: template.packages
      },
      {
        title: `Level ${levelNo} — Tender Rush: Paket Makin Cepat`,
        caseTitle: 'Arcade Pagu dan Metode',
        difficulty: `Level ${levelNo} - Arcade+`,
        packages: [
          { title: 'Belanja Kendaraan Operasional Katalog', type: 'Barang', pagu: 650000000, clue: 'Barang pabrikan dan tersedia di katalog elektronik.', correct: 'ekatalog', explanation: 'Jika kendaraan tersedia dan sesuai di katalog, e-Purchasing lebih tepat daripada memaksa metode manual.' },
          { title: 'Konsumsi Rapat Koordinasi Kecil', type: 'Jasa Lainnya', pagu: 12000000, clue: 'Nilai kecil, sederhana, dan tidak kompleks.', correct: 'pengadaanLangsung', explanation: 'Konsumsi bernilai kecil dapat menggunakan Pengadaan Langsung sepanjang sesuai batas nilai dan administrasi tertib.' },
          { title: 'Jasa Konsultan DED Gedung', type: 'Jasa Konsultansi', pagu: 420000000, clue: 'Membutuhkan keahlian profesional dan evaluasi teknis.', correct: 'tenderSeleksi', explanation: 'Jasa konsultansi dengan nilai dan kompleksitas tertentu lebih tepat melalui Seleksi, bukan Pengadaan Langsung.' },
          { title: 'Pelatihan Internal oleh Tim OPD', type: 'Jasa Lainnya', pagu: 90000000, clue: 'Dikerjakan sendiri dengan tim pelaksana dan pengawas.', correct: 'swakelola', explanation: 'Kegiatan yang dilaksanakan sendiri dapat menggunakan Swakelola jika tim, rencana, dan pertanggungjawabannya jelas.' },
          { title: 'Pembayaran Air dan Listrik Kantor', type: 'Jasa Lainnya', pagu: 240000000, clue: 'Layanan utilitas rutin/tertentu.', correct: 'dikecualikan', explanation: 'Utilitas tertentu dapat dikecualikan sesuai dasar ketentuan, tetapi tetap wajib tertib bukti dan pencatatan.' }
        ]
      },
      {
        title: `Level ${levelNo} — Tender Rush: Risiko Akhir Tahun`,
        caseTitle: 'Arcade Risiko Metode',
        difficulty: `Level ${levelNo} - Sulit`,
        packages: [
          { title: 'Laptop Pelayanan Publik TKDN Tersedia', type: 'Barang', pagu: 480000000, clue: 'Ada produk katalog dan perlu afirmasi PDN/TKDN.', correct: 'ekatalog', explanation: 'Katalog yang tersedia dan sesuai mendukung e-Purchasing serta afirmasi PDN/TKDN.' },
          { title: 'Souvenir Kegiatan Sosialisasi', type: 'Barang', pagu: 35000000, clue: 'Nilai kecil, sederhana, tidak dipecah dari kebutuhan besar.', correct: 'pengadaanLangsung', explanation: 'Nilai kecil dan sederhana dapat masuk Pengadaan Langsung jika tidak digunakan untuk memecah paket.' },
          { title: 'Pemeliharaan Jalan Lingkungan', type: 'Pekerjaan Konstruksi', pagu: 900000000, clue: 'Konstruksi nilai besar, perlu proses formal.', correct: 'tenderSeleksi', explanation: 'Konstruksi bernilai besar tidak cocok dipaksa ke Pengadaan Langsung. Jalur formal lebih aman.' },
          { title: 'Kajian Data oleh Perguruan Tinggi Negeri', type: 'Jasa Konsultansi', pagu: 250000000, clue: 'Dilaksanakan bersama instansi/perguruan tinggi.', correct: 'swakelola', explanation: 'Kolaborasi dengan instansi/perguruan tinggi dapat masuk Swakelola jika memenuhi ketentuan dan struktur tim jelas.' },
          { title: 'Layanan Pos/Pengiriman Dokumen Resmi', type: 'Jasa Lainnya', pagu: 70000000, clue: 'Layanan tertentu yang memiliki karakter khusus.', correct: 'dikecualikan', explanation: 'Layanan tertentu bisa dikecualikan, namun dasar dan pencatatan tetap wajib rapi.' }
        ]
      }
    ];

    const selected = variants[variantIndex % variants.length];

    return {
      ...template,
      ...selected,
      type: 'tenderRush',
      desc: 'Paket akan muncul satu per satu. Masukkan paket ke jalur metode yang paling tepat sebelum waktu habis. Batas salah makin ketat di level tinggi.',
      budget: 'Simulasi cepat',
      timeLimit: getTenderRushTimeLimitByLevel(levelNo),
      explanation: 'Tender Rush melatih refleks membaca jenis paket, pagu, ketersediaan katalog, dan kondisi pelaksanaan sebelum memilih metode.'
    };
  }

  function expandChallengeFlow(rawList) {
    const rushTemplate = rawList.find(item => item.type === 'tenderRush');
    const baseList = rawList.filter(item => item.type !== 'tenderRush');
    const rushLevels = new Set([3, 6, 9, 12, 15]);
    const expanded = [];
    let baseIndex = 0;
    let rushIndex = 0;
    let levelNo = 1;

    while (baseIndex < baseList.length || (rushTemplate && rushLevels.has(levelNo))) {
      if (rushTemplate && rushLevels.has(levelNo)) {
        expanded.push(cloneTenderRushChallenge(rushTemplate, levelNo, rushIndex));
        rushIndex += 1;
      } else if (baseIndex < baseList.length) {
        expanded.push(baseList[baseIndex]);
        baseIndex += 1;
      }

      levelNo += 1;

      if (levelNo > baseList.length + rushLevels.size + 8) break;
    }

    return expanded;
  }

  function buildChallenge(raw) {
    if (raw.type === 'quiz' || raw.type === 'tenderRush' || raw.type === 'bonusOpenWorld' || raw.type === 'bonusSnake') {
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


  const BONUS_LEVEL_4_OPENWORLD = {
    type: 'bonusOpenWorld',
    title: 'Level 4 — Bonus 3D: PANJI Konsolidasi Quest',
    caseTitle: 'PPK Terjebak di Dunia Konsolidasi 3D',
    desc: 'Bonus level naratif. Kamu ditemani PANJI sebagai ahli pengadaan. Pilihanmu di recruit team, data, pasar, dan evaluasi akan menentukan poin analisa pengadaan.',
    budget: 'Bonus Level 4',
    difficulty: 'Bonus 3D Narrative',
    explanation: 'Bonus ini melatih analisa konsolidasi: tim yang tepat, item sejenis, market sounding, dan evaluasi berbasis data.'
  };

  const BONUS_LEVEL_8_SNAKE = {
    type: 'bonusSnake',
    title: 'Level 8 — Bonus Santuy: PANJI Star Snake',
    caseTitle: 'Snake Bintang Semangat',
    desc: 'Bonus refreshing. Gerakkan ular PANJI, ambil bintang, hindari jebakan revisi. Skor bonus tetap masuk nilai akhir.',
    budget: 'Bonus Level 8',
    difficulty: 'Mood Booster',
    explanation: 'Bonus Snake melatih fokus cepat: ambil item baik, hindari jebakan, dan tetap jaga mood sebelum lanjut analisa PBJ.'
  };

  function buildMainChallengeFlow() {
    const rushTemplate = CHALLENGE_RAW.find(item => item.type === 'tenderRush');
    const miniCompetitionPipeline = CHALLENGE_RAW[20];
    const miniCompetitionQuiz = CHALLENGE_RAW[21];
    const list = [
      CHALLENGE_RAW[0],
      CHALLENGE_RAW[1],
      rushTemplate ? cloneTenderRushChallenge(rushTemplate, 3, 0) : CHALLENGE_RAW[2],
      BONUS_LEVEL_4_OPENWORLD,
      CHALLENGE_RAW[3],
      CHALLENGE_RAW[4],
      CHALLENGE_RAW[5],
      BONUS_LEVEL_8_SNAKE,
      CHALLENGE_RAW[6],
      CHALLENGE_RAW[7],
      rushTemplate ? cloneTenderRushChallenge(rushTemplate, 11, 1) : CHALLENGE_RAW[2],
      miniCompetitionPipeline,
      miniCompetitionQuiz
    ].filter(Boolean);

    return list;
  }

  const CHALLENGES = buildMainChallengeFlow().map(buildChallenge);

  const TENDER_RUSH_METHODS = {
    ekatalog: {
      key: '1',
      label: 'e-Katalog',
      short: 'Katalog',
      icon: '🛒',
      hint: 'Tekan 1 untuk barang/jasa yang tersedia dan sesuai di katalog elektronik.'
    },
    pengadaanLangsung: {
      key: '2',
      label: 'Pengadaan Langsung',
      short: 'PL',
      icon: '🛠️',
      hint: 'Tekan 2 untuk paket kecil/sederhana yang memenuhi batas nilai dan tidak dipecah.'
    },
    tenderSeleksi: {
      key: '3',
      label: 'Tender/Seleksi',
      short: 'Tender',
      icon: '🏗️',
      hint: 'Tekan 3 untuk paket besar/kompleks atau jasa konsultansi yang perlu proses formal.'
    },
    swakelola: {
      key: '4',
      label: 'Swakelola',
      short: 'Swakelola',
      icon: '🤲',
      hint: 'Tekan 4 untuk pekerjaan yang dilaksanakan sendiri/bersama sesuai kriteria swakelola.'
    },
    dikecualikan: {
      key: '5',
      label: 'Dikecualikan',
      short: 'Dikecualikan',
      icon: '⚖️',
      hint: 'Tekan 5 untuk pengadaan yang punya dasar pengecualian, tetap tertib dan tercatat.'
    }
  };

  function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

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
    correct: 0,
    progress: 0,
    logs: [],
    finished: false,
    hintUsed: false,
    hasSeenIntro: false,
    runId: '',
    gameStartedAt: 0,
    scoreSubmitted: false,
    tenderRush: null,
    levelTimeLeft: 0,
    levelTimeLimit: 0,
    stoppedReason: '',
    stoppedLevel: 0,
    pipelineTutorialSeen: false
  };

  const PLAYER_STATE = {
    nama: '',
    instansi: '',
    leaderboard: [],
    loadingLeaderboard: false,
    savingScore: false,
    lastSaveMessage: '',
    feedback: ''
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function readStoredPlayer() {
    try {
      const saved = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) || '{}');
      PLAYER_STATE.nama = String(saved.nama || '').trim();
      PLAYER_STATE.instansi = String(saved.instansi || '').trim();
      PLAYER_STATE.feedback = String(saved.feedback || '').trim();
    } catch (error) {
      PLAYER_STATE.nama = '';
      PLAYER_STATE.instansi = '';
      PLAYER_STATE.feedback = '';
    }
  }

  function hasPlayerProfile() {
    return Boolean(String(PLAYER_STATE.nama || '').trim() && String(PLAYER_STATE.instansi || '').trim());
  }

  function savePlayerProfile(nama, instansi) {
    PLAYER_STATE.nama = String(nama || '').trim();
    PLAYER_STATE.instansi = String(instansi || '').trim();

    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({
      nama: PLAYER_STATE.nama,
      instansi: PLAYER_STATE.instansi,
      feedback: PLAYER_STATE.feedback || '',
      updatedAt: new Date().toISOString()
    }));
  }

  function getCurrentResultSummary() {
    const maxScore = calculateMaxScore();
    const percent = maxScore > 0 ? Math.round((GAME_STATE.score / maxScore) * 100) : 0;
    const totalSoal = CHALLENGES.length;
    const benar = Math.max(0, Math.min(totalSoal, Number(GAME_STATE.correct || 0)));
    const salah = Math.max(0, Number(GAME_STATE.wrong || 0));
    const durasiDetik = GAME_STATE.gameStartedAt
      ? Math.max(0, Math.round((Date.now() - GAME_STATE.gameStartedAt) / 1000))
      : 0;

    const levelDicapai = GAME_STATE.stoppedLevel || Math.min(CHALLENGES.length, GAME_STATE.index + 1);
    const levelSelesai = GAME_STATE.stoppedReason ? Math.max(0, levelDicapai - 1) : (GAME_STATE.finished ? CHALLENGES.length : Math.max(0, levelDicapai - 1));

    return {
      maxScore,
      percent,
      totalSoal,
      benar,
      salah,
      durasiDetik,
      skor: GAME_STATE.score,
      risiko: GAME_STATE.risk,
      levelDicapai,
      levelSelesai
    };
  }

  function formatDuration(seconds) {
    const total = Math.max(0, Number(seconds || 0));
    const minutes = Math.floor(total / 60);
    const rest = total % 60;

    if (minutes <= 0) return `${rest} detik`;
    return `${minutes} menit ${String(rest).padStart(2, '0')} detik`;
  }

  async function fetchLeaderboard() {
    if (!LEADERBOARD_API_URL) return [];

    PLAYER_STATE.loadingLeaderboard = true;
    renderLeaderboardModalContent();

    try {
      const response = await fetch(`${LEADERBOARD_API_URL}?action=leaderboard&v=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });

      const json = await response.json();
      const rows = Array.isArray(json) ? json : Array.isArray(json.leaderboard) ? json.leaderboard : [];
      PLAYER_STATE.leaderboard = sortLeaderboardRows(rows);
      return PLAYER_STATE.leaderboard;
    } catch (error) {
      PLAYER_STATE.lastSaveMessage = `Leaderboard belum bisa dimuat: ${error.message || error}`;
      return [];
    } finally {
      PLAYER_STATE.loadingLeaderboard = false;
      renderLeaderboardModalContent();
    }
  }


  async function fetchReviewRowsForBubble() {
    if (!LEADERBOARD_API_URL) return [];
    try {
      const response = await fetch(`${LEADERBOARD_API_URL}?action=reviews&v=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      const json = await response.json();
      const rows = Array.isArray(json)
        ? json
        : Array.isArray(json.reviews)
          ? json.reviews
          : Array.isArray(json.leaderboard)
            ? json.leaderboard
            : [];
      return rows
        .filter(row => row && getRowReview(row))
        .slice(0, 8);
    } catch (error) {
      return [];
    }
  }

  async function showReviewBubbleOnMenuOpen() {
    if (destroyed || sessionStorage.getItem('procstack_review_bubble_seen_v11') === '1') return;
    const rows = await fetchReviewRowsForBubble();
    if (destroyed || !rows.length) return;

    sessionStorage.setItem('procstack_review_bubble_seen_v11', '1');
    const emojis = ['😄','🔥','⭐','💬','🚀','🧠','🎮','🙌','😂','✨'];
    const pickedRows = rows.slice(0, Math.min(5, rows.length));
    const created = [];

    pickedRows.forEach((row, index) => {
      const bubble = document.createElement('div');
      bubble.className = `ps-review-bubble-pop ps-review-bubble-float review-pos-${index % 6}`;
      bubble.style.setProperty('--review-i', String(index));
      bubble.style.setProperty('--review-delay', `${index * 0.18}s`);
      bubble.style.setProperty('--review-rand', String((index * 37) % 19));
      bubble.innerHTML = `
        <button type="button" class="ps-review-bubble-close" aria-label="Tutup">×</button>
        <div class="ps-review-bubble-head">
          <span>${emojis[index % emojis.length]} Review Pemain</span>
          <b>PANJI baca...</b>
        </div>
        <div class="ps-review-main">
          “${escapeHtml(getRowReview(row))}” ${emojis[(index + 3) % emojis.length]}
          <small>${escapeHtml(row.nama || 'Pemain')} · ${escapeHtml(row.instansi || 'Instansi')}</small>
        </div>
      `;
      document.body.appendChild(bubble);
      created.push(bubble);

      const closeOne = () => {
        bubble.classList.add('closing');
        setTimeout(() => bubble.remove(), 240);
      };
      bubble.querySelector('.ps-review-bubble-close')?.addEventListener('click', closeOne);
      setTimeout(closeOne, 9000 + (index * 900));
    });

    reviewBubbleEl = created[0] || null;
    showPanji('Ini review dari pemain lain. Aku munculin kayak bubble biar suasananya hidup. Baca sebentar, siapa tahu ada pengalaman yang nyambung sama kamu 😄', 'happy');
    reviewBubbleTimer = setTimeout(() => {
      created.forEach(bubble => {
        if (bubble && bubble.parentNode) {
          bubble.classList.add('closing');
          setTimeout(() => bubble.remove(), 240);
        }
      });
      reviewBubbleEl = null;
    }, 12000);
  }

  async function submitFinalScoreToLeaderboard() {
    if (GAME_STATE.scoreSubmitted || PLAYER_STATE.savingScore) return;

    if (!hasPlayerProfile()) {
      PLAYER_STATE.lastSaveMessage = 'Isi nama dan instansi dulu agar skor bisa masuk leaderboard.';
      openLeaderboardModal('player', true);
      return;
    }

    PLAYER_STATE.savingScore = true;
    PLAYER_STATE.lastSaveMessage = 'Menyimpan skor ke leaderboard...';
    renderLeaderboardModalContent();

    const result = getCurrentResultSummary();
    const payload = {
      nama: PLAYER_STATE.nama,
      instansi: PLAYER_STATE.instansi,
      skor: result.skor,
      benar: result.benar,
      salah: result.salah,
      risiko: result.risiko,
      total_soal: result.totalSoal,
      level_dicapai: result.levelDicapai,
      level_selesai: result.levelSelesai,
      durasi_detik: result.durasiDetik,
      analisa_panji: getFinalPanjiAnalysisText(result),
      review: PLAYER_STATE.feedback || '',
      pengalaman_main: PLAYER_STATE.feedback || ''
    };

    try {
      const response = await fetch(LEADERBOARD_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const json = await response.json();

      if (!json.ok) {
        throw new Error(json.message || 'Skor gagal disimpan.');
      }

      GAME_STATE.scoreSubmitted = true;
      PLAYER_STATE.lastSaveMessage = 'Skor berhasil disimpan ke leaderboard.';
      PLAYER_STATE.leaderboard = Array.isArray(json.leaderboard) ? json.leaderboard : PLAYER_STATE.leaderboard;

      if (!PLAYER_STATE.leaderboard.length) {
        await fetchLeaderboard();
      }
    } catch (error) {
      PLAYER_STATE.lastSaveMessage = `Skor belum tersimpan: ${error.message || error}`;
    } finally {
      PLAYER_STATE.savingScore = false;
      renderLeaderboardModalContent();
    }
  }

  function ensureLeaderboardModal() {
    if (leaderboardModalEl && document.body.contains(leaderboardModalEl)) return leaderboardModalEl;

    leaderboardModalEl = document.createElement('div');
    leaderboardModalEl.id = 'procstackLeaderboardModal';
    leaderboardModalEl.className = 'ps-leaderboard-modal ps-hidden';
    leaderboardModalEl.innerHTML = `
      <div class="ps-leaderboard-backdrop" data-leaderboard-close></div>
      <div class="ps-leaderboard-panel">
        <button type="button" class="ps-leaderboard-close" data-leaderboard-close aria-label="Tutup">×</button>
        <div class="ps-leaderboard-content" id="psLeaderboardContent"></div>
      </div>
    `;

    document.body.appendChild(leaderboardModalEl);

    leaderboardModalEl.querySelectorAll('[data-leaderboard-close]').forEach(button => {
      button.addEventListener('click', () => {
        closeLeaderboardModal();
      });
    });

    return leaderboardModalEl;
  }

  function attachPanjiToLeaderboardModal() {
    if (!leaderboardModalEl) return;

    const panel = leaderboardModalEl.querySelector('.ps-leaderboard-panel');
    const panji = document.querySelector('.panji-assistant');

    if (!panel || !panji) return;

    const rect = panel.getBoundingClientRect();

    const right = Math.max(10, window.innerWidth - rect.right - 8);
    const bottom = Math.max(10, window.innerHeight - rect.bottom + 10);

    panji.classList.add('panji-leaderboard-mode');
    panji.style.setProperty('--panji-lb-right', `${right}px`);
    panji.style.setProperty('--panji-lb-bottom', `${bottom}px`);
  }

  function detachPanjiFromLeaderboardModal() {
    const panji = document.querySelector('.panji-assistant');

    if (!panji) return;

    panji.classList.remove('panji-leaderboard-mode');
    panji.style.removeProperty('--panji-lb-right');
    panji.style.removeProperty('--panji-lb-bottom');
  }

  function openLeaderboardModal(tab = 'player', force = false) {
    ensureLeaderboardModal();
    leaderboardModalEl.dataset.activeTab = tab;
    leaderboardModalEl.dataset.force = force ? 'true' : 'false';
    leaderboardModalEl.classList.remove('ps-hidden');
    renderLeaderboardModalContent();

    if (panjiEl) {
      panjiEl.classList.toggle('panji-result-mode', GAME_STATE.stage === 'result' || GAME_STATE.finished);
    }

    setTimeout(() => {
      attachPanjiToLeaderboardModal();

      if (typeof showPanji === 'function') {
        if (GAME_STATE.stage === 'result' || GAME_STATE.finished) {
          const reaction = getPanjiFinalReaction();
          panjiUserMinimized = false;

          if (panjiEl) {
            panjiEl.classList.remove('panji-hidden', 'panji-minimized');
          }

          showPanji(reaction.text, reaction.mood);

          if (panjiEl) {
            panjiEl.classList.remove('panji-celebrate', 'panji-cry');
            void panjiEl.offsetWidth;
            panjiEl.classList.add(reaction.anim);
          }
        } else {
          showPanji(
            'Halo! PANJI di sini. Isi dulu nama dan instansi kamu ya. Setelah selesai main, skor otomatis masuk leaderboard.',
            'happy'
          );
        }

        setTimeout(attachPanjiToLeaderboardModal, 80);
        setTimeout(attachPanjiToLeaderboardModal, 250);
        setTimeout(attachPanjiToLeaderboardModal, 600);
      }
    }, 120);

    if (tab === 'leaderboard' || !PLAYER_STATE.leaderboard.length) {
      fetchLeaderboard();
    }
  }

  function closeLeaderboardModal() {
    if (!leaderboardModalEl) return;
    leaderboardModalEl.classList.add('ps-hidden');
    if (panjiEl) panjiEl.classList.remove('panji-result-mode');
    detachPanjiFromLeaderboardModal();
  }

  function getLeaderboardPanjiMood(result) {
    const score = Number(result && result.percent || 0);
    const risk = Number(result && result.risiko || 0);

    if (score >= 75 && risk <= 45) return 'happy';
    if (score < 55 || risk >= 80) return 'sad';
    return 'thinking';
  }

  function getLeaderboardPanjiNarrative(result) {
    const mood = getLeaderboardPanjiMood(result);
    const levelText = 'Level ' + result.levelDicapai + '/' + result.totalSoal;

    const analysis = getFinalPanjiAnalysisText(result);

    if (mood === 'happy') {
      return 'Mantap! Kamu sampai ' + levelText + ' dengan skor ' + result.skor + '. ' + analysis;
    }

    if (mood === 'sad') {
      return 'Yah, hasilnya masih perlu dibenerin. Kamu sampai ' + levelText + ' dengan skor ' + result.skor + '. ' + analysis;
    }

    return 'Lumayan, kamu sampai ' + levelText + ' dengan skor ' + result.skor + '. ' + analysis;
  }

  function renderLeaderboardModalContent() {
    if (!leaderboardModalEl || leaderboardModalEl.classList.contains('ps-hidden')) return;

    const content = leaderboardModalEl.querySelector('#psLeaderboardContent');
    if (!content) return;

    const activeTab = leaderboardModalEl.dataset.activeTab || 'player';
    const result = getCurrentResultSummary();
    const isResult = GAME_STATE.stage === 'result' || GAME_STATE.finished;

    content.innerHTML = `
      <div class="ps-lb-hero">
        <div>
          <div class="ps-lb-kicker">Procurement Mini Game</div>
          <h3>${isResult ? 'Nilai Akhir & Leaderboard' : 'Masuk Pemain'}</h3>
          <p>${isResult ? 'Skor selesai main otomatis dikirim ke Google Sheet dan ditampilkan di leaderboard.' : 'Isi nama dan instansi dulu. Setelah selesai main, skor otomatis masuk leaderboard.'}</p>
        </div>
        ${isResult ? `<div class="ps-lb-score"><span>Nilai</span><b>${result.percent}%</b></div>` : ''}
      </div>

      <div class="ps-lb-tabs">
        <button type="button" class="${activeTab === 'player' ? 'active' : ''}" data-lb-tab="player">Masuk Pemain</button>
        <button type="button" class="${activeTab === 'leaderboard' ? 'active' : ''}" data-lb-tab="leaderboard">Leaderboard</button>
      </div>

      ${isResult ? `
        <div class="ps-lb-summary">
          <div><span>Pemain</span><b>${escapeHtml(PLAYER_STATE.nama || '-')}</b></div>
          <div><span>Instansi</span><b>${escapeHtml(PLAYER_STATE.instansi || '-')}</b></div>
          <div><span>Skor</span><b>${result.skor}/${result.maxScore}</b></div>
          <div><span>Benar</span><b>${result.benar}/${result.totalSoal}</b></div>
          <div><span>Salah</span><b>${result.salah}</b></div>
          <div><span>Risiko</span><b>${result.risiko}</b></div>
          <div><span>Level Dicapai</span><b>${result.levelDicapai}/${result.totalSoal}</b></div>
          <div><span>Durasi</span><b>${formatDuration(result.durasiDetik)}</b></div>
        </div>
      ` : ''}

      ${isResult && activeTab === 'player' ? renderResultFeedbackBox() : ''}

      <div class="ps-lb-message ${PLAYER_STATE.lastSaveMessage ? '' : 'empty'}">
        ${escapeHtml(PLAYER_STATE.lastSaveMessage || 'Data pemain disimpan di browser ini dan skor akhir disimpan ke Google Sheet.')}
      </div>

      ${activeTab === 'player' ? renderPlayerTab() : renderLeaderboardTab()}
    `;

    content.querySelectorAll('[data-lb-tab]').forEach(button => {
      button.addEventListener('click', () => {
        leaderboardModalEl.dataset.activeTab = button.dataset.lbTab;
        renderLeaderboardModalContent();

        if (button.dataset.lbTab === 'leaderboard') {
          fetchLeaderboard();
        }
      });
    });

    const form = content.querySelector('#psPlayerForm');
    if (form) {
      form.addEventListener('submit', event => {
        event.preventDefault();
        const nama = form.querySelector('[name="nama"]')?.value || '';
        const instansi = form.querySelector('[name="instansi"]')?.value || '';
        const feedback = form.querySelector('[name="feedback"]')?.value || PLAYER_STATE.feedback || '';

        if (!String(nama).trim() || !String(instansi).trim()) {
          PLAYER_STATE.lastSaveMessage = 'Nama dan instansi wajib diisi.';
          renderLeaderboardModalContent();
          return;
        }

        PLAYER_STATE.feedback = String(feedback || '').trim();
        savePlayerProfile(nama, instansi);
        PLAYER_STATE.lastSaveMessage = 'Data pemain tersimpan. Silakan lanjut main.';

        if (GAME_STATE.stage === 'result' || GAME_STATE.finished) {
          PLAYER_STATE.lastSaveMessage = 'Nama pemain tersimpan. Sekarang tulis pengalaman mainmu di kotak bawah, lalu kirim ke leaderboard.';
          renderLeaderboardModalContent();
        } else {
          closeLeaderboardModal();

          if (!GAME_STATE.current || GAME_STATE.stage === 'ready') {
            showPanji('Data pemain sudah tersimpan. Sekarang PANJI mulai perkenalan dulu, lalu kita masuk ke soal pertama.', 'happy');
            setTimeout(() => {
              if (!destroyed) startGame();
            }, 650);
          } else {
            showPanjiHowToPlayAfterPlayerSaved();
          }
        }

        renderLeaderboardModalContent();
      });
    }

    const feedbackForm = content.querySelector('#psFinalFeedbackForm');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', event => {
        event.preventDefault();
        const feedback = feedbackForm.querySelector('[name="finalFeedback"]')?.value || '';
        PLAYER_STATE.feedback = String(feedback || '').trim();
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({
          nama: PLAYER_STATE.nama,
          instansi: PLAYER_STATE.instansi,
          feedback: PLAYER_STATE.feedback,
          updatedAt: new Date().toISOString()
        }));

        if (!hasPlayerProfile()) {
          PLAYER_STATE.lastSaveMessage = 'Isi nama dan instansi dulu di tab Masuk Pemain, baru pengalaman main bisa masuk ke sheet.';
          leaderboardModalEl.dataset.activeTab = 'player';
          renderLeaderboardModalContent();
          return;
        }

        PLAYER_STATE.lastSaveMessage = 'Pengalaman main disimpan. Skor sedang dikirim ke leaderboard...';
        submitFinalScoreToLeaderboard();
        closeLeaderboardModal();
        showToast('Pengalaman tersimpan. Makasih!', 'ok');
      });
    }

    const refreshBtn = content.querySelector('#psRefreshLeaderboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => fetchLeaderboard());
    }
  }

  function renderResultFeedbackBox() {
    return `
      <form class="ps-final-feedback-box" id="psFinalFeedbackForm">
        <div>
          <strong>Ceritain pengalaman mainmu</strong>
          <p>Nanti masuk ke sheet bareng nama, skor, risiko, dan analisa PANJI. Bisa dipakai buat munculin bubble testimoni di halaman game.</p>
        </div>
        <textarea name="finalFeedback" rows="3" placeholder="Contoh: level snake lucu, tapi evaluator battle bikin mikir.">${escapeHtml(PLAYER_STATE.feedback || '')}</textarea>
        <button type="submit" class="ps-btn ps-btn-primary">Kirim Skor & Pengalaman</button>
      </form>
    `;
  }

  function renderPlayerTab() {
    return `
      <form class="ps-player-form" id="psPlayerForm">
        <label>
          <span>Nama Pemain</span>
          <input type="text" name="nama" value="${escapeHtml(PLAYER_STATE.nama)}" placeholder="Contoh: Benni Ramadhan" autocomplete="name" required>
        </label>
        <label>
          <span>Instansi / OPD</span>
          <input type="text" name="instansi" value="${escapeHtml(PLAYER_STATE.instansi)}" placeholder="Contoh: UKPBJ Kota Bogor" required>
        </label>
        <button type="submit" class="ps-btn ps-btn-primary">Simpan & Mulai</button>
      </form>
    `;
  }

  function renderLeaderboardTab() {
    const rows = PLAYER_STATE.leaderboard || [];

    return `
      <div class="ps-lb-toolbar">
        <strong>Top Leaderboard</strong>
        <button type="button" class="ps-btn ps-btn-soft" id="psRefreshLeaderboard" ${PLAYER_STATE.loadingLeaderboard ? 'disabled' : ''}>
          ${PLAYER_STATE.loadingLeaderboard ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      <div class="ps-lb-list">
        ${rows.length ? rows.map(renderLeaderboardRow).join('') : `
          <div class="ps-lb-empty">
            ${PLAYER_STATE.loadingLeaderboard ? 'Memuat leaderboard...' : 'Belum ada skor tersimpan.'}
          </div>
        `}
      </div>
    `;
  }

  function getRowLevelValue(row) {
    return Number(row.level_dicapai || row.level || row.level_tercapai || row.levelReached || row.total_level || row.total_soal || row.benar || 0);
  }

  function sortLeaderboardRows(rows) {
    return [...(rows || [])].sort((a, b) => {
      const scoreDiff = Number(b.skor || 0) - Number(a.skor || 0);
      if (scoreDiff !== 0) return scoreDiff;
      const levelDiff = getRowLevelValue(b) - getRowLevelValue(a);
      if (levelDiff !== 0) return levelDiff;
      return Number(a.risiko || 0) - Number(b.risiko || 0);
    }).map((row, index) => ({ ...row, rank: index + 1 }));
  }

  function getRowReview(row) {
    return String(row.review || row.pengalaman_main || row.feedback || row.masukan || '').trim();
  }

  function renderLeaderboardRow(row) {
    const rank = Number(row.rank || 0);
    const reviewText = getRowReview(row);
    const isMine = hasPlayerProfile()
      && String(row.nama || '').trim().toLowerCase() === PLAYER_STATE.nama.toLowerCase()
      && String(row.instansi || '').trim().toLowerCase() === PLAYER_STATE.instansi.toLowerCase();

    return `
      <div class="ps-lb-row ${isMine ? 'mine' : ''}">
        <div class="ps-lb-rank">${rank || '-'}</div>
        <div class="ps-lb-main">
          <b>${escapeHtml(row.nama || '-')}</b>
          <span>${escapeHtml(row.instansi || '-')}</span>
        </div>
        <div class="ps-lb-meta">
          <b>${Number(row.skor || 0).toLocaleString('id-ID')}</b>
          <span>Level ${getRowLevelValue(row) || '-'} · ${Number(row.benar || 0)}/${Number(row.total_soal || 0)} benar · Risiko ${Number(row.risiko || 0)}</span>
          ${reviewText ? `<em class="ps-lb-feedback">“${escapeHtml(reviewText)}”</em>` : ''}
        </div>
      </div>
    `;
  }

  function shuffleArray(items) {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }


  function prepareQuizRuntimeOptions(challenge) {
    const options = Array.isArray(challenge && challenge.options) ? challenge.options : [];
    const mapped = options.map((text, originalIndex) => ({ text, originalIndex }));
    let shuffled = shuffleArray(mapped);

    if (mapped.length > 1) {
      let guard = 0;
      while (shuffled.findIndex(item => item.originalIndex === challenge.answer) === challenge.answer && guard < 10) {
        shuffled = shuffleArray(mapped);
        guard += 1;
      }
    }

    challenge.runtimeOptions = shuffled;
    challenge.runtimeAnswer = shuffled.findIndex(item => item.originalIndex === challenge.answer);

    if (challenge.runtimeAnswer < 0) {
      challenge.runtimeOptions = mapped;
      challenge.runtimeAnswer = Number(challenge.answer || 0);
    }
  }

  function resetPanjiVisualState() {
    if (!panjiEl) return;

    panjiEl.classList.remove(
      'panji-happy',
      'panji-sad',
      'panji-thinking',
      'panji-intro',
      'panji-talking',
      'panji-celebrate',
      'panji-cry',
      'panji-result-mode'
    );

    panjiEl.classList.add('panji-thinking');

    if (panjiEmoteEl) {
      panjiEmoteEl.textContent = '🤔';
    }
  }

  function setPanjiMoodOnly(mood = 'thinking') {
    if (!panjiEl) return;

    panjiEl.classList.remove(
      'panji-happy',
      'panji-sad',
      'panji-thinking',
      'panji-talking',
      'panji-celebrate',
      'panji-cry'
    );

    panjiEl.classList.add(`panji-${mood}`);

    if (panjiEmoteEl) {
      panjiEmoteEl.textContent =
        mood === 'happy'
          ? '😄'
          : mood === 'sad'
            ? '😭'
            : '🤔';
    }
  }

  function getCurrentChallenge() {
    return GAME_STATE.current;
  }

  function getPlacedCount() {
    return GAME_STATE.placed.filter(Boolean).length;
  }


  function getActiveTenderRushPackage(challenge) {
    const rush = GAME_STATE.tenderRush;
    const list = rush && Array.isArray(rush.packages)
      ? rush.packages
      : Array.isArray(challenge && challenge.packages)
        ? challenge.packages
        : [];

    return list[(rush && Number(rush.currentIndex || 0)) || 0] || null;
  }

  function prepareTenderRushRandomPackages(challenge) {
    const allPackages = Array.isArray(challenge && challenge.packages) ? challenge.packages : [];
    if (!allPackages.length) return [];

    const count = Math.min(Number(challenge.packageCount || allPackages.length || 5), allPackages.length);
    const methodOrder = ['ekatalog', 'pengadaanLangsung', 'tenderSeleksi', 'swakelola', 'dikecualikan'];

    function scorePattern(list) {
      let score = 0;
      for (let i = 0; i < list.length; i += 1) {
        const expectedForward = methodOrder[i % methodOrder.length];
        const expectedReverse = methodOrder[(methodOrder.length - 1 - i) % methodOrder.length];
        if (list[i].correct === expectedForward) score += 2;
        if (list[i].correct === expectedReverse) score += 2;
        if (i > 0 && list[i].correct === list[i - 1].correct) score += 1;
      }
      return score;
    }

    let best = shuffleArray(allPackages).slice(0, count);
    let bestScore = scorePattern(best);

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const candidate = shuffleArray(allPackages).slice(0, count);
      const candidateScore = scorePattern(candidate);
      if (candidateScore < bestScore) {
        best = candidate;
        bestScore = candidateScore;
      }
    }

    return best.map((item, index) => ({
      ...item,
      rushId: `rush-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`
    }));
  }

  function getPanjiCurrentGuideMessage() {
    const challenge = getCurrentChallenge();

    if (!challenge) {
      return 'Hi.. aku balik lagi. Isi dulu nama pemain dan instansi atau OPD kamu, lalu kita mulai latihan PBJ bareng-bareng.';
    }

    if (challenge.type === 'pipeline') {
      const nextEmpty = GAME_STATE.placed.findIndex(item => item === null);

      if (nextEmpty < 0) {
        return 'Hi.. aku balik lagi. Pipeline soal ini sudah selesai. Kamu tinggal klik lanjut untuk masuk ke soal berikutnya.';
      }

      const expectedId = challenge.idealIds?.[nextEmpty];
      const expectedCard = challenge.cards?.find(item => item.id === expectedId);

      if (expectedCard) {
        return `Hi.. aku balik lagi. Sekarang kamu ada di soal Pipeline. Fokus isi slot nomor ${nextEmpty + 1}. Cari kartu "${expectedCard.label}", lalu susun dari kiri ke kanan. Jangan pilih kartu jebakan.`;
      }

      return 'Hi.. aku balik lagi. Sekarang kamu ada di soal Pipeline. Susun tahapan PBJ dari kiri ke kanan secara tertib.';
    }

    if (challenge.type === 'quiz') {
      return `Hi.. aku balik lagi. Sekarang kamu ada di soal ABCD. Baca kasus "${challenge.caseTitle}" pelan-pelan, lalu pilih jawaban yang paling sesuai prinsip PBJ.`;
    }

    if (challenge.type === 'tenderRush') {
      const pkg = getActiveTenderRushPackage(challenge);
      if (pkg) {
        const correctMethod = TENDER_RUSH_METHODS[pkg.correct];
        return `Hi.. aku balik lagi. Ini Tender Rush. Paket aktifnya "${pkg.title}". Perhatikan petunjuknya: ${pkg.clue} Kalau butuh arahan, jalur yang paling aman adalah ${correctMethod ? correctMethod.key + ' - ' + correctMethod.label : 'metode yang sesuai kondisi paket'}.`;
      }

      return 'Hi.. aku balik lagi. Sekarang kamu ada di Tender Rush. Baca paket yang jatuh, lalu tekan 1 untuk e-Katalog, 2 untuk Pengadaan Langsung, 3 untuk Tender/Seleksi, 4 untuk Swakelola, atau 5 untuk Dikecualikan.';
    }

    if (challenge.type === 'bonusOpenWorld') {
      return 'Hi.. aku balik lagi. Ini bonus level 4. Kamu masuk dunia 3D konsolidasi. Cek map quest, pilih tim, rapikan item, datangi pasar, lalu evaluasi. Semua keputusanmu masuk poin analisa pengadaan.';
    }

    if (challenge.type === 'bonusSnake') {
      return 'Hi.. aku balik lagi. Ini bonus level 8: PANJI Star Snake. Ambil bintang sebanyak mungkin, hindari revisi dan berkas numpuk. Ini buat refreshing tapi tetap masuk skor akhir.';
    }

    return 'Hi.. aku balik lagi. Lanjutkan permainan dengan membaca kasus dan memilih langkah PBJ yang paling aman.';
  }

  function getPanjiFinalReaction() {
    const result = getCurrentResultSummary();
    const percent = result.maxScore > 0 ? Math.round((result.skor / result.maxScore) * 100) : 0;
    const levelDicapai = Math.max(1, Number(result.levelDicapai || GAME_STATE.index + 1 || 1));
    const totalLevel = CHALLENGES.length;

    if (percent >= 80 && GAME_STATE.risk <= 35) {
      return {
        mood: 'happy',
        anim: 'panji-celebrate',
        text: `Yeay! Mantap banget. Kamu mencapai level ${levelDicapai}/${totalLevel} dengan skor ${result.skor}. Alur PBJ kamu sudah rapi dan risikonya cukup terkendali. Kalau mau ngejar ranking lebih tinggi, klik tombol "Main Lagi dari Soal 1".`
      };
    }

    if (percent >= 55) {
      return {
        mood: 'thinking',
        anim: 'panji-celebrate',
        text: `Lumayan! Kamu mencapai level ${levelDicapai}/${totalLevel} dengan skor ${result.skor}. Tapi masih ada beberapa bagian yang perlu dirapikan. Coba ulangi lagi, perhatikan urutan pipeline, batas metode, dan jangan buru-buru saat Tender Rush. Klik "Main Lagi dari Soal 1" untuk coba lagi.`
      };
    }

    return {
      mood: 'sad',
      anim: 'panji-cry',
      text: `Aduh, PANJI sedih nih. Kamu baru mencapai level ${levelDicapai}/${totalLevel} dengan skor ${result.skor}. Tidak apa-apa, ini latihan. Coba main lagi dari awal, baca kasus lebih pelan, dan jangan asal pilih metode. Klik "Main Lagi dari Soal 1" ya.`
    };
  }

  function clearTenderRushTimers() {
    if (tenderRushTimer) {
      clearInterval(tenderRushTimer);
      tenderRushTimer = null;
    }

    if (tenderRushNextTimer) {
      clearTimeout(tenderRushNextTimer);
      tenderRushNextTimer = null;
    }
  }

  function enableTenderRushKeyboard() {
    disableTenderRushKeyboard();

    tenderRushKeyHandler = event => {
      const activeTag = String(document.activeElement && document.activeElement.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) return;

      const map = {
        1: 'ekatalog',
        2: 'pengadaanLangsung',
        3: 'tenderSeleksi',
        4: 'swakelola',
        5: 'dikecualikan'
      };

      const method = map[event.key];
      if (!method) return;

      const challenge = getCurrentChallenge();
      if (!challenge || challenge.type !== 'tenderRush') return;

      event.preventDefault();
      answerTenderRush(method);
    };

    document.addEventListener('keydown', tenderRushKeyHandler);
  }

  function disableTenderRushKeyboard() {
    if (!tenderRushKeyHandler) return;
    document.removeEventListener('keydown', tenderRushKeyHandler);
    tenderRushKeyHandler = null;
  }


  function getDefaultLevelTime(challenge) {
    if (!challenge || challenge.type === 'tenderRush') return 0;

    const levelNo = getCurrentLevelNumber();
    const base = challenge.type === 'quiz'
      ? Number(challenge.timeLimit || 45)
      : Number(challenge.timeLimit || 90);

    if (levelNo <= 3) return base;

    const reduction = (levelNo - 3) * (challenge.type === 'quiz' ? 3 : 5);
    const minimum = challenge.type === 'quiz' ? 20 : 45;

    return Math.max(minimum, base - reduction);
  }

  function clearLevelTimer() {
    if (levelTimer) {
      clearInterval(levelTimer);
      levelTimer = null;
    }
  }

  function startLevelTimer(challenge) {
    clearLevelTimer();

    const limit = getDefaultLevelTime(challenge);
    GAME_STATE.levelTimeLimit = limit;
    GAME_STATE.levelTimeLeft = limit;
    levelTimerStartedAt = Date.now();

    if (!limit || GAME_STATE.stage === 'ready' || GAME_STATE.stage === 'result') {
      updateLevelTimerUi();
      return;
    }

    updateLevelTimerUi();

    levelTimer = setInterval(() => {
      if (destroyed || GAME_STATE.finished) return;

      const activeChallenge = getCurrentChallenge();
      if (!activeChallenge || activeChallenge.type === 'tenderRush') return;

      GAME_STATE.levelTimeLeft = Math.max(0, Number(GAME_STATE.levelTimeLeft || 0) - 1);
      updateLevelTimerUi();

      if (GAME_STATE.levelTimeLeft <= 0) {
        stopGameEarly('time');
      }
    }, 1000);
  }

  function updateLevelTimerUi() {
    const text = root && root.querySelector('#psLevelTimeText');
    const bar = root && root.querySelector('#psLevelTimeBar');
    const wrap = root && root.querySelector('.ps-level-time-card');
    const left = Math.max(0, Number(GAME_STATE.levelTimeLeft || 0));
    const limit = Math.max(1, Number(GAME_STATE.levelTimeLimit || 1));
    const percent = Math.max(0, Math.min(100, (left / limit) * 100));

    if (text) text.textContent = left ? `${left}s` : '-';
    if (bar) bar.style.width = percent + '%';

    if (wrap) {
      wrap.classList.toggle('danger', left > 0 && left <= 10);
      wrap.classList.toggle('warning', left > 10 && left <= 25);
    }
  }

  function applyLevelTimePenalty(seconds, reasonText = 'Kesalahan') {
    const challenge = getCurrentChallenge();

    if (!challenge || challenge.type === 'tenderRush') return;
    if (!GAME_STATE.levelTimeLimit || GAME_STATE.stage === 'result' || GAME_STATE.finished) return;

    const penalty = Math.max(1, Number(seconds || 0));
    GAME_STATE.levelTimeLeft = Math.max(0, Number(GAME_STATE.levelTimeLeft || 0) - penalty);
    addLog('bad', reasonText + ': waktu berkurang', 'Waktu level berkurang ' + penalty + ' detik karena pilihan belum tepat.');
    showToast('Waktu -' + penalty + ' detik', 'bad');
    updateLevelTimerUi();

    if (GAME_STATE.levelTimeLeft <= 0) {
      stopGameEarly('time');
    }
  }


  function applyLevelTimeBonus(seconds, reasonText = 'Bonus waktu') {
    const challenge = getCurrentChallenge();

    if (!challenge || challenge.type === 'tenderRush') return;
    if (!GAME_STATE.levelTimeLimit || GAME_STATE.stage === 'result' || GAME_STATE.finished) return;

    const bonus = Math.max(1, Number(seconds || 0));
    GAME_STATE.levelTimeLeft = Math.min(
      Number(GAME_STATE.levelTimeLimit || 0),
      Number(GAME_STATE.levelTimeLeft || 0) + bonus
    );

    addLog('ok', reasonText, 'Waktu level bertambah ' + bonus + ' detik karena jawaban/urutan benar.');
    showToast('Waktu +' + bonus + ' detik', 'ok');
    updateLevelTimerUi();
  }

  function stopGameEarly(reason = 'time') {
    if (GAME_STATE.finished || GAME_STATE.stage === 'result') return;

    clearAutoNextTimer();
    clearLevelTimer();
    clearTenderRushTimers();
    disableTenderRushKeyboard();
    clearBonusSnakeTimers();
    clearPanjiIntroTimers();

    GAME_STATE.finished = true;
    GAME_STATE.stage = 'result';
    GAME_STATE.stoppedReason = reason;
    GAME_STATE.stoppedLevel = GAME_STATE.index + 1;
    GAME_STATE.progress = 100;

    if (reason === 'rushFailed') {
      addLog('bad', 'Tender Rush gagal melewati batas', 'Permainan berhenti karena jumlah salah/timeout sudah melewati batas level Tender Rush ini.');
      showToast('Tender Rush gagal melewati batas. Skor akhir ditampilkan.', 'bad');
      showPanji('Tender Rush gagal melewati batas level ini. Game berhenti dulu ya. Skor akhir dan level terakhir sudah muncul. Coba ulangi dan baca petunjuk paket lebih cepat.', 'sad');
    } else {
      addLog('bad', 'Waktu level habis', `Permainan berhenti di level ${GAME_STATE.stoppedLevel}.`);
      showToast('Waktu habis. Skor akhir ditampilkan.', 'bad');
      showPanji(`Waktu level habis. Kamu berhenti di level ${GAME_STATE.stoppedLevel} dengan skor ${GAME_STATE.score}.`, 'sad');
    }

    renderGame();
    openLeaderboardModal('player', true);
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

      if (challenge.type === 'tenderRush') {
        return total + ((challenge.packages || []).length * 10) + 20;
      }

      if (challenge.type === 'bonusOpenWorld') {
        return total + 140;
      }

      if (challenge.type === 'bonusSnake') {
        return total + 120;
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
    const oldPanji = document.getElementById('panjiAssistant');

    if (oldPanji) {
      panjiEl = oldPanji;
      return;
    }

    const panji = document.createElement('div');
    panji.id = 'panjiAssistant';
    panji.className = 'panji-assistant';
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

    document.body.appendChild(panji);
  }

  function initPanji(scope) {
    ensurePanjiMarkup(scope);

    panjiEl = document.querySelector('#panjiAssistant');
    panjiTextEl = document.querySelector('#panjiText');
    panjiEmoteEl = document.querySelector('#panjiEmote');
    panjiBubbleEl = document.querySelector('#panjiBubble');
    panjiHintBtn = document.querySelector('#panjiHintBtn');
    panjiMiniBtn = document.querySelector('#panjiMiniBtn');
    panjiCharacterBtn = document.querySelector('#panjiCharacter');
    panjiCloseBtn = document.querySelector('#panjiClose');

    if (!panjiEl || !panjiTextEl) return;

    if (panjiHintBtn) {
      panjiHintBtn.addEventListener('click', () => {
        if (panjiEl && panjiEl.classList.contains('panji-result-mode')) return;
        requestHintFromPanji();
      });
    }

    if (panjiMiniBtn) {
      panjiMiniBtn.addEventListener('click', () => {
        panjiUserMinimized = true;
        panjiEl.classList.add('panji-minimized');
      });
    }

    if (panjiCharacterBtn) {
      panjiCharacterBtn.addEventListener('click', () => {
        panjiEl.classList.remove('panji-hidden');

        if (panjiUserMinimized || panjiEl.classList.contains('panji-minimized')) {
          panjiUserMinimized = false;
          panjiEl.classList.remove('panji-minimized');
          showPanji(getPanjiCurrentGuideMessage(), 'thinking');
          return;
        }

        panjiUserMinimized = true;
        panjiEl.classList.add('panji-minimized');
      });
    }

    if (panjiCloseBtn) {
      panjiCloseBtn.addEventListener('click', () => {
        panjiUserMinimized = true;
        panjiEl.classList.add('panji-hidden');
      });
    }

    forceShowPanji();
    initPanjiAutoPosition();
  }

  function forceShowPanji() {
    if (!panjiEl) return;

    if (panjiEl.parentElement !== document.body) {
      document.body.appendChild(panjiEl);
    }

    panjiEl.classList.remove('panji-hidden');
    panjiEl.classList.remove('panji-minimized');

    panjiEl.style.position = 'fixed';
    panjiEl.style.right = '26px';
    panjiEl.style.bottom = 'var(--panji-bottom, 34px)';
    panjiEl.style.top = 'auto';
    panjiEl.style.left = 'auto';
    panjiEl.style.zIndex = '2147483647';
    panjiEl.style.opacity = '1';
    panjiEl.style.visibility = 'visible';
    panjiEl.style.display = 'flex';
    panjiEl.style.transform = 'none';
  }

  function updatePanjiAutoBottom() {
    if (!panjiEl) return;

    const baseBottom = window.innerWidth <= 900 ? 76 : 34;
    const maxBottom = window.innerWidth <= 900 ? 240 : 340;
    const gap = 18;
    let nextBottom = baseBottom;

    const logBox = document.querySelector('.ps-log-box');

    if (logBox) {
      const logRect = logBox.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const panjiRect = panjiEl.getBoundingClientRect();
      const panjiHeight = panjiRect.height || 220;
      const logVisible = logRect.top < viewportHeight && logRect.bottom > 0;

      if (logVisible) {
        const panjiNormalTop = viewportHeight - baseBottom - panjiHeight;
        const overlap = logRect.bottom - panjiNormalTop;

        if (overlap > 0 && logRect.top < viewportHeight - 60) {
          nextBottom = baseBottom + overlap + gap;
        }
      }
    }

    nextBottom = Math.max(baseBottom, Math.min(maxBottom, Math.round(nextBottom)));
    panjiEl.style.setProperty('--panji-bottom', nextBottom + 'px');
  }

  function initPanjiAutoPosition() {
    if (!panjiEl) return;

    if (typeof panjiEl._panjiAutoPositionDestroy === 'function') {
      panjiEl._panjiAutoPositionDestroy();
      panjiEl._panjiAutoPositionDestroy = null;
    }

    let ticking = false;

    const requestUpdate = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        updatePanjiAutoBottom();
      });
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    panjiEl._panjiAutoPositionDestroy = () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };

    requestUpdate();
  }

  function showPanji(message, mood = 'thinking') {
    if (!panjiEl || !panjiTextEl) return;

    if (panjiUserMinimized || panjiEl.classList.contains('panji-minimized')) {
      setPanjiMoodOnly(mood);
      return;
    }

    forceShowPanji();
    clearPanjiTalkTimer();

    panjiEl.classList.remove('panji-hidden');
    panjiEl.classList.remove('panji-minimized');

    panjiEl.classList.remove(
      'panji-happy',
      'panji-sad',
      'panji-thinking',
      'panji-intro',
      'panji-talking',
      'panji-celebrate',
      'panji-cry'
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

    if (challenge.type === 'tenderRush') {
      const pkg = getActiveTenderRushPackage(challenge);

      if (pkg) {
        const correctMethod = TENDER_RUSH_METHODS[pkg.correct];
        return `Hint PANJI: paket aktif adalah "${pkg.title}". Petunjuknya: ${pkg.clue} Jadi jalur paling aman adalah ${correctMethod ? correctMethod.key + ' - ' + correctMethod.label : 'metode yang sesuai'}. Alasannya: ${pkg.explanation}`;
      }

      return 'Hint PANJI: di Tender Rush, lihat 4 kata kunci dulu: pagu, jenis pekerjaan, apakah tersedia katalog, dan apakah pekerjaannya bisa diswakelolakan. Shortcut-nya: 1 e-Katalog, 2 Pengadaan Langsung, 3 Tender/Seleksi, 4 Swakelola, 5 Dikecualikan.';
    }

    if (challenge.type === 'bonusOpenWorld') {
      return 'Hint PANJI: jangan kejar cepat. Di bonus ini lihat alurnya: pilih tim yang bisa analisa, samakan item yang benar-benar sejenis, market sounding ke semua toko, lalu evaluasi berdasarkan data.';
    }

    if (challenge.type === 'bonusSnake') {
      return 'Hint PANJI: di Snake, jangan rakus. Putar arah pelan-pelan, ambil bintang yang aman dulu, dan hindari nabrak jebakan revisi.';
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
      return;
    }

    if (challenge.type === 'tenderRush') {
      showPanji(
        'Ini Tender Rush. Kontrolnya: 1 e-Katalog, 2 Pengadaan Langsung, 3 Tender/Seleksi, 4 Swakelola, 5 Dikecualikan. Paket baru turun setelah klik Mulai.',
        'thinking'
      );
      return;
    }

    if (challenge.type === 'bonusOpenWorld') {
      showPanji(
        'Bonus level 4 dimulai. Aku tetap kelihatan di sini, jadi kamu nggak kehilangan arahan. Cek map quest 3D, pilihanmu akan memengaruhi poin analisa akhir.',
        'thinking'
      );
      return;
    }

    if (challenge.type === 'bonusSnake') {
      showPanji(
        'Bonus level 8: PANJI Star Snake. Ambil bintang, hindari jebakan. Santai, ini buat refreshing sebelum lanjut level akhir.',
        'happy'
      );
      return;
    }

    showPanji(
      'Ini soal ABCD. Baca kata kuncinya pelan-pelan. Pilih jawaban yang paling sesuai prinsip dan tahapan PBJ, bukan yang sekadar paling cepat.',
      'thinking'
    );
  }

  function startGame() {
    clearAutoNextTimer();
    clearTenderRushTimers();
    disableTenderRushKeyboard();
    clearBonusSnakeTimers();
    clearPanjiIntroTimers();

    GAME_STATE.order = CHALLENGES.map((_, index) => index);
    GAME_STATE.index = 0;
    GAME_STATE.score = 0;
    GAME_STATE.risk = 0;
    GAME_STATE.wrong = 0;
    GAME_STATE.correct = 0;
    GAME_STATE.finished = false;
    GAME_STATE.runId = 'run-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    GAME_STATE.gameStartedAt = Date.now();
    GAME_STATE.scoreSubmitted = false;
    GAME_STATE.hasSeenIntro = false;
    GAME_STATE.levelTimeLeft = 0;
    GAME_STATE.levelTimeLimit = 0;
    GAME_STATE.stoppedReason = '';
    GAME_STATE.stoppedLevel = 0;
    GAME_STATE.pipelineCombo = 0;

    resetPanjiVisualState();
    panjiUserMinimized = false;

    if (!panjiIntroAlreadyShown) {
      showPanjiIntro();
      panjiIntroAlreadyShown = true;
    } else {
      showPanji('Game dimulai ulang dari Soal 1. Aku langsung bantu kalau kamu butuh arahan, tanpa perkenalan lagi.', 'thinking');
    }

    loadChallenge();
  }

  function loadChallenge() {
    clearAutoNextTimer();
    clearLevelTimer();
    clearTenderRushTimers();
    disableTenderRushKeyboard();
    clearBonusSnakeTimers();
    clearTenderRushTimers();
    disableTenderRushKeyboard();

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
      GAME_STATE.tenderRush = null;
      GAME_STATE.progress = 0;
      GAME_STATE.pipelineCombo = 0;

      addLog(
        'info',
        'Challenge pipeline dimulai',
        'Susun kartu dari kiri ke kanan. Kartu jebakan akan menaikkan risiko.'
      );
    } else if (challenge.type === 'tenderRush') {
      GAME_STATE.stage = 'tenderRush';
      GAME_STATE.placed = [];
      GAME_STATE.shuffledCards = [];
      GAME_STATE.progress = 0;
      GAME_STATE.tenderRush = {
        started: false,
        currentIndex: 0,
        timeLeft: Number(challenge.timeLimit || 8),
        locked: false,
        lastResult: null,
        correctCount: 0,
        wrongCount: 0,
        packages: prepareTenderRushRandomPackages(challenge)
      };

      addLog(
        'info',
        'Challenge Tender Rush dimulai',
        'Baca tutorial PANJI dulu, lalu pilih jalur metode dengan tombol 1 sampai 5.'
      );
    } else if (challenge.type === 'bonusOpenWorld') {
      GAME_STATE.stage = 'bonusOpenWorld';
      GAME_STATE.placed = [];
      GAME_STATE.shuffledCards = [];
      GAME_STATE.tenderRush = null;
      GAME_STATE.progress = 0;
      GAME_STATE.bonusOpenWorld = createBonusOpenWorldState();

      addLog(
        'info',
        'Bonus Level 4 dimulai',
        'PPK masuk dunia 3D konsolidasi bersama PANJI. Selesaikan semua quest di map bonus.'
      );
    } else if (challenge.type === 'bonusSnake') {
      GAME_STATE.stage = 'bonusSnake';
      GAME_STATE.placed = [];
      GAME_STATE.shuffledCards = [];
      GAME_STATE.tenderRush = null;
      GAME_STATE.progress = 0;
      GAME_STATE.bonusSnake = createBonusSnakeState();

      addLog(
        'info',
        'Bonus Level 8 dimulai',
        'Main Snake, ambil bintang, dan hindari jebakan. Poin bonus masuk nilai akhir.'
      );
    } else {
      GAME_STATE.stage = 'quiz';
      GAME_STATE.placed = [];
      GAME_STATE.shuffledCards = [];
      GAME_STATE.tenderRush = null;
      GAME_STATE.progress = 100;
      prepareQuizRuntimeOptions(challenge);

      addLog(
        'info',
        'Challenge ABCD dimulai',
        'Pilih jawaban yang paling tepat.'
      );
    }

    renderGame();

    const pauseForPipelineTutorial = challenge.type === 'pipeline' && !GAME_STATE.pipelineTutorialSeen && getCurrentLevelNumber() === 1;
    if (challenge.type !== 'tenderRush' && challenge.type !== 'bonusOpenWorld' && challenge.type !== 'bonusSnake' && !pauseForPipelineTutorial) {
      startLevelTimer(challenge);
    } else if (pauseForPipelineTutorial) {
      GAME_STATE.levelTimeLimit = getDefaultLevelTime(challenge);
      GAME_STATE.levelTimeLeft = GAME_STATE.levelTimeLimit;
      updateLevelTimerUi();
      addLog('info', 'Tutorial belum dihitung waktu', 'Santai dulu. Waktu level baru jalan setelah kamu menutup tutorial cara main pipeline.');
    }

    if (GAME_STATE.index === 0 && !GAME_STATE.hasSeenIntro) {
      GAME_STATE.hasSeenIntro = true;
    } else {
      panjiForChallenge(challenge);
    }
  }

  function finishGame() {
    clearAutoNextTimer();
    clearLevelTimer();
    clearTenderRushTimers();
    disableTenderRushKeyboard();
    clearPanjiIntroTimers();

    GAME_STATE.finished = true;
    GAME_STATE.stage = 'result';
    GAME_STATE.current = null;
    GAME_STATE.progress = 100;

    renderGame();
    spawnConfetti();
    const finalResult = getCurrentResultSummary();
    showPanji(getLeaderboardPanjiNarrative(finalResult), getLeaderboardPanjiMood(finalResult));
    showToast('Semua soal selesai. Hasil akhir ditampilkan.', 'ok');
    openLeaderboardModal('player', true);
  }

  function nextChallenge() {
    clearAutoNextTimer();
    clearLevelTimer();
    clearTenderRushTimers();
    disableTenderRushKeyboard();
    clearBonusSnakeTimers();

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
    if (challenge.type === 'tenderRush') return GAME_STATE.progress === 100;
    if (challenge.type === 'bonusOpenWorld') return GAME_STATE.progress === 100;
    if (challenge.type === 'bonusSnake') return GAME_STATE.progress === 100;
    return GAME_STATE.answered;
  }

  function getChallengeTypeLabel(type) {
    if (type === 'pipeline') return 'Pipeline';
    if (type === 'tenderRush') return 'Tender Rush';
    if (type === 'bonusOpenWorld') return 'Bonus 3D';
    if (type === 'bonusSnake') return 'Bonus Snake';
    return 'ABCD';
  }

  function getChallengeTypeName(type) {
    if (type === 'pipeline') return 'Susun Pipeline';
    if (type === 'tenderRush') return 'Arcade Metode';
    if (type === 'bonusOpenWorld') return 'Open World Bonus';
    if (type === 'bonusSnake') return 'Snake Bintang';
    return 'Pilihan ABCD';
  }

  function renderChallengeBody(challenge) {
    if (challenge.type === 'pipeline') return renderPipelineChallenge(challenge);
    if (challenge.type === 'tenderRush') return renderTenderRushChallenge(challenge);
    if (challenge.type === 'bonusOpenWorld') return renderBonusOpenWorldChallenge(challenge);
    if (challenge.type === 'bonusSnake') return renderBonusSnakeChallenge(challenge);
    return renderQuizChallenge(challenge);
  }


  function renderReadyScreen() {
    if (!root) return;

    root.innerHTML = `
      <section class="ps-card ps-ready-card">
        <div class="ps-result-hero">
          <h2>🎮 Procurement Stacker</h2>
          <p>
            Sebelum mulai, PANJI akan kenalan dulu dan minta data pemain. Isi nama serta instansi/OPD agar skor akhir bisa masuk leaderboard.
          </p>
        </div>

        <div class="ps-result-note">
          <strong>Alur game:</strong><br>
          Soal akan bercampur: susun pipeline, pilihan ABCD, dan Tender Rush. Tender Rush memakai tombol 1 sampai 5 untuk memilih metode pengadaan dengan cepat.
        </div>

        <div class="ps-buttons">
          <button type="button" class="ps-btn ps-btn-primary" id="btnOpenPlayerModal">
            Isi Nama & Instansi
          </button>
        </div>
      </section>
    `;

    const btn = root.querySelector('#btnOpenPlayerModal');
    if (btn) {
      btn.addEventListener('click', () => openLeaderboardModal('player', true));
    }

    requestAnimationFrame(updatePanjiAutoBottom);
  }

  function getDisplayChallengeTitle(challenge) {
    const levelNo = GAME_STATE.index + 1;
    const rawTitle = String(challenge && challenge.title ? challenge.title : 'Challenge');
    if (/^(Soal|Level)\s*\d+/i.test(rawTitle)) {
      return rawTitle.replace(/^(Soal|Level)\s*\d+\s*[—-]?\s*/i, 'Level ' + levelNo + ' — ');
    }
    return 'Level ' + levelNo + ' — ' + rawTitle;
  }

  function renderGame() {
    if (!root) return;

    if (GAME_STATE.stage === 'result') {
      root.innerHTML = renderResultScreen();
      bindResultEvents();
      requestAnimationFrame(updatePanjiAutoBottom);
      return;
    }

    const challenge = getCurrentChallenge();

    root.innerHTML = `
      <section class="ps-card">
        <div class="ps-card-head">
          <div>
            <h3>${escapeHtml(getDisplayChallengeTitle(challenge))}</h3>
            <p>${escapeHtml(challenge.desc)}</p>
          </div>

          <div class="ps-pill-row">
            <div class="ps-pill ${challenge.type === 'pipeline' ? 'green' : challenge.type === 'tenderRush' ? 'rush' : ''}">
              ${getChallengeTypeLabel(challenge.type)}
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
            <strong>${getChallengeTypeName(challenge.type)}</strong>
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
          <div class="ps-score-card ps-level-time-card">
            <label>Waktu Level</label>
            <strong id="psLevelTimeText">${(challenge.type === 'tenderRush' || challenge.type === 'bonusOpenWorld' || challenge.type === 'bonusSnake') ? '-' : `${GAME_STATE.levelTimeLeft || getDefaultLevelTime(challenge)}s`}</strong>
            <div class="ps-mini-time-track"><div class="ps-mini-time-bar" id="psLevelTimeBar" style="width:100%"></div></div>
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

        ${renderChallengeBody(challenge)}

        ${renderLogs()}

        <div class="ps-buttons">
          <button type="button" class="ps-btn ps-btn-soft" id="btnRestartGame">Mulai Ulang dari Soal 1</button>
          ${
            challenge.type === 'pipeline' || challenge.type === 'tenderRush'
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
    requestAnimationFrame(updatePanjiAutoBottom);
  }

  function renderPipelineChallenge(challenge) {
    const placedIds = new Set(GAME_STATE.placed.filter(Boolean).map(item => item.id));
    const showPipelineTutorial = !GAME_STATE.pipelineTutorialSeen && getCurrentLevelNumber() === 1;

    return `
      ${showPipelineTutorial ? `
        <div class="ps-pipeline-tutorial">
          <div class="ps-tutorial-panji">PANJI</div>
          <div>
            <h4>Pelan-pelan dulu, ini cara main pipeline.</h4>
            <ol>
              <li><b>Baca kasusnya di panel atas</b>: lihat nama paket, nilai/pagu, dan tingkat kesulitan.</li>
              <li><b>Baca tujuan pipeline</b>: susun kartu proses dari kiri ke kanan.</li>
              <li><b>Cara meletakkan kartu</b>: drag kartu ke slot, atau klik kartu lalu klik slot biru.</li>
              <li><b>Jangan asal taruh</b>: slot harus diisi urut dari kiri. Kartu jebakan bikin risiko naik.</li>
              <li><b>Butuh arahan?</b> klik tombol <b>Tanya PANJI</b> untuk hint, tapi skor berkurang sedikit.</li>
            </ol>
            <button type="button" class="ps-btn ps-btn-primary" id="btnClosePipelineTutorial">Oke, saya paham</button>
          </div>
        </div>
      ` : ''}
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

  function renderTenderRushChallenge(challenge) {
    const rush = GAME_STATE.tenderRush || {
      started: false,
      currentIndex: 0,
      timeLeft: Number(challenge.timeLimit || 8),
      lastResult: null,
      correctCount: 0,
      wrongCount: 0
    };

    const rushPackages = Array.isArray(rush.packages) && rush.packages.length ? rush.packages : (challenge.packages || []);
    const total = rushPackages.length;
    const currentPackage = rushPackages[rush.currentIndex];

    if (!currentPackage && rush.started && GAME_STATE.progress < 100) {
      GAME_STATE.progress = 100;
    }

    const percentTime = Math.max(0, Math.min(100, (Number(rush.timeLeft || 0) / Number(challenge.timeLimit || 8)) * 100));

    if (!rush.started) {
      return `
        <div class="ps-rush-tutorial">
          <div class="ps-rush-tutorial-main">
            <div class="ps-rush-kicker">Tutorial PANJI dulu</div>
            <h3>Jalur Metode Tender Rush</h3>
            <p>
              Di soal ini paket akan muncul satu per satu seperti arcade. Tugas kamu memilih jalur metode yang paling tepat
              sebelum waktu habis. Baca <b>pagu</b>, <b>jenis paket</b>, <b>ketersediaan katalog</b>, dan <b>kondisi pelaksanaan</b>.
              Di level ini batas salah/miss adalah <b>${getTenderRushFailLimitByLevel(getCurrentLevelNumber())} kali</b>; kalau melewati batas, game langsung berhenti.
            </p>
          </div>
          <div class="ps-rush-method-grid">
            ${Object.values(TENDER_RUSH_METHODS).map(method => `
              <div class="ps-rush-method-card">
                <div class="ps-rush-method-key">${method.key}</div>
                <div class="ps-rush-method-icon">${method.icon}</div>
                <strong>${escapeHtml(method.label)}</strong>
                <span>${escapeHtml(method.hint)}</span>
              </div>
            `).join('')}
          </div>
          <div class="ps-buttons">
            <button type="button" class="ps-btn ps-btn-primary" id="btnStartTenderRush">Saya Paham, Mulai Tender Rush</button>
          </div>
        </div>
      `;
    }

    if (!currentPackage && GAME_STATE.progress === 100) {
      return `
        <div class="ps-rush-finished">
          <h3>🏁 Tender Rush selesai</h3>
          <p>${escapeHtml(challenge.explanation)}</p>
          <div class="ps-rush-summary">
            <div><label>Benar</label><strong>${rush.correctCount || 0}</strong></div>
            <div><label>Salah/Miss</label><strong>${rush.wrongCount || 0}</strong></div>
            <div><label>Total Paket</label><strong>${total}</strong></div>
          </div>
        </div>
      `;
    }

    return `
      <div class="ps-rush-arena">
        <div class="ps-rush-hud">
          <div><label>Paket</label><strong>${Math.min(rush.currentIndex + 1, total)} / ${total}</strong></div>
          <div><label>Waktu</label><strong id="psRushTimeText">${rush.timeLeft}</strong></div>
          <div><label>Benar</label><strong>${rush.correctCount || 0}</strong></div>
          <div><label>Salah</label><strong>${rush.wrongCount || 0} / ${getTenderRushFailLimitByLevel(getCurrentLevelNumber())}</strong></div>
        </div>

        <div class="ps-rush-time-track">
          <div class="ps-rush-time-bar" id="psRushTimeBar" style="width:${percentTime}%"></div>
        </div>

        <div class="ps-rush-fall-lane">
          <div class="ps-rush-package ${rush.lastResult ? (rush.lastResult.correct ? 'correct' : 'wrong') : ''}" style="--rush-duration:${Number(challenge.timeLimit || 8)}s">
            <div class="ps-rush-package-top">
              <span>${escapeHtml(currentPackage.type)}</span>
              <b>${formatCurrency(currentPackage.pagu)}</b>
            </div>
            <h3>${escapeHtml(currentPackage.title)}</h3>
            <p>${escapeHtml(currentPackage.clue)}</p>
          </div>
        </div>

        ${rush.lastResult ? `
          <div class="ps-rush-result ${rush.lastResult.correct ? 'ok' : 'bad'}">
            <strong>${rush.lastResult.correct ? 'Benar!' : 'Belum tepat.'}</strong>
            ${escapeHtml(rush.lastResult.message)}
          </div>
        ` : ''}

        <div class="ps-rush-drop-grid">
          ${Object.entries(TENDER_RUSH_METHODS).map(([id, method]) => `
            <button type="button" class="ps-rush-drop" data-rush-method="${id}" ${rush.locked ? 'disabled' : ''}>
              <span class="ps-rush-key">${method.key}</span>
              <span class="ps-rush-icon">${method.icon}</span>
              <strong>${escapeHtml(method.label)}</strong>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }


  function createBonusOpenWorldState() {
    const nodes = [
      {
        id: 'team',
        title: 'Recruit Team',
        icon: '🧑‍💼',
        desc: 'Pilih tim yang bisa bantu analisa data, pasar, dan evaluasi.',
        choices: [
          { id: 'data-eval', text: 'Pilih Analis Data + Evaluator teliti', good: true, panji: 'Pilihan bagus. Data dan evaluasi adalah tulang punggung konsolidasi.' },
          { id: 'cheap-fast', text: 'Pilih tim yang penting murah dan cepat', good: false, panji: 'Ini rawan. Cepat dan murah belum tentu bisa dipertanggungjawabkan.' },
          { id: 'katalog-monitor', text: 'Pilih Spesialis Katalog + Monitoring', good: true, panji: 'Bagus. Implementasi katalog dan monitoring OPD jadi lebih kebaca.' },
          { id: 'langganan', text: 'Pilih orang yang dekat dengan toko langganan', good: false, panji: 'Ini jebakan. Konsolidasi harus berbasis data dan persaingan sehat.' }
        ]
      },
      {
        id: 'nama',
        title: 'Samakan Nama Barang',
        icon: '🧩',
        desc: 'Analisa item mana yang sejenis dan layak digabung.',
        choices: [
          { id: 'hvs-a4', text: 'Gabungkan HVS A4 70 gsm, Kertas A4 70 gram, A4 70 putih', good: true, panji: 'Betul. Nama beda, tapi spesifikasi masih satu keluarga.' },
          { id: 'campur-semua', text: 'Gabungkan HVS A4, HVS F4, tinta printer, dan ballpoint jadi satu paket', good: false, panji: 'Jangan asal gabung. Komoditas beda harus dibaca terpisah.' },
          { id: 'ballpoint', text: 'Gabungkan Bolpoin Gel, Pulpen Gel, dan Gel Pen', good: true, panji: 'Ya, ini bisa distandarkan ke kelompok Ballpoint Gel.' },
          { id: 'spidol-gel', text: 'Masukkan spidol whiteboard ke kelompok ballpoint gel', good: false, panji: 'Mirip alat tulis, tapi jenisnya beda. Jangan dipaksa.' }
        ]
      },
      {
        id: 'pasar',
        title: 'Pasar Penyedia',
        icon: '🏪',
        desc: 'Datangi toko, cek harga, akun Katalog V6, stok, dan distribusi.',
        choices: [
          { id: 'murah-belum-v6', text: 'Pilih harga termurah walau belum punya akun Katalog V6', good: false, panji: 'Harga murah menggoda, tapi kalau belum siap katalog bisa macet saat implementasi.' },
          { id: 'v6-stok', text: 'Pilih toko yang harga masuk akal, akun V6 siap, stok dan distribusi jelas', good: true, panji: 'Nah ini sehat. Murah boleh, tapi kesiapan pasar tetap dicek.' },
          { id: 'langganan-toko', text: 'Pilih toko langganan karena sudah biasa', good: false, panji: 'Kebiasaan bukan dasar evaluasi. Tetap pakai data.' },
          { id: 'market-lengkap', text: 'Catat minimal 3 toko untuk pembanding harga dan kesiapan', good: true, panji: 'Bagus. Market sounding butuh gambaran pasar, bukan satu suara saja.' }
        ]
      },
      {
        id: 'evaluasi',
        title: 'Evaluator Battle',
        icon: '⚔️',
        desc: 'Keputusan awal diuji. Lawan jebakan evaluasi dengan analisa.',
        choices: [
          { id: 'bukti-data', text: 'Kembali ke data kebutuhan, hasil market sounding, dan kesiapan penyedia', good: true, panji: 'Ini jawaban paling aman. Evaluasi harus bisa dijelaskan.' },
          { id: 'tutup-akun', text: 'Tutup mata soal akun katalog karena harganya murah', good: false, panji: 'Jebakan. Katalog V6 jadi pintu implementasi OPD.' },
          { id: 'cek-distribusi', text: 'Cek distribusi ke OPD sebelum menetapkan penyedia', good: true, panji: 'Mantap. Konsolidasi gagal kalau distribusi tidak siap.' },
          { id: 'feeling', text: 'Pilih berdasarkan feeling karena waktunya mepet', good: false, panji: 'Feeling boleh buat curiga, tapi keputusan harus punya bukti.' }
        ]
      }
    ];

    return {
      activeNode: 'team',
      completed: {},
      decisions: {},
      nodes,
      bonusScore: 0
    };
  }

  function getBonusOpenWorldState() {
    if (!GAME_STATE.bonusOpenWorld) {
      GAME_STATE.bonusOpenWorld = createBonusOpenWorldState();
    }
    return GAME_STATE.bonusOpenWorld;
  }

  function renderBonusOpenWorldChallenge() {
    const bonus = getBonusOpenWorldState();
    const order = bonus.nodes.map(node => node.id);
    const active = bonus.nodes.find(node => node.id === bonus.activeNode) || bonus.nodes[0];
    const completedCount = Object.keys(bonus.completed).length;
    const activeIndex = order.indexOf(active.id);
    const shuffledChoices = shuffleArray(active.choices || []);
    const storyLine = active.id === 'team'
      ? 'PPK baru sadar dia terjebak di Dunia Konsolidasi 3D. PANJI bilang, portal pulang akan kebuka kalau timnya tepat.'
      : active.id === 'nama'
        ? 'Setelah tim terbentuk, data OPD mulai muncul acak-acakan. PPK harus membaca mana item yang benar-benar satu keluarga.'
        : active.id === 'pasar'
          ? 'Gerbang pasar terbuka. PPK dan PANJI masuk ke toko-toko buat market sounding, bukan buat langsung milih pemenang.'
          : 'Semua keputusan awal diuji di arena evaluasi. Kalau sejak awal asal pilih, jebakannya makin terasa.';

    return `
      <div class="ps-bonus3d-fullscreen">
        <div class="ps-bonus3d-scene">
          <div class="ps-bonus3d-sky"></div>
          <div class="ps-bonus3d-cloud c1"></div>
          <div class="ps-bonus3d-cloud c2"></div>
          <div class="ps-bonus3d-mountain m1"></div>
          <div class="ps-bonus3d-mountain m2"></div>
          <div class="ps-bonus3d-road"></div>
          <div class="ps-bonus3d-portal ${GAME_STATE.progress >= 100 ? 'open' : ''}">PORTAL</div>
          <div class="ps-bonus3d-player" style="--player-step:${activeIndex}"><span>PPK</span></div>
          <div class="ps-bonus3d-companion" style="--player-step:${activeIndex}"><span>PANJI</span></div>
          <div class="ps-bonus3d-map openworld-map">
            ${bonus.nodes.map((node, index) => {
              const isDone = Boolean(bonus.completed[node.id]);
              const isActive = bonus.activeNode === node.id;
              const isLocked = index > completedCount;
              return `
                <button type="button" class="ps-bonus3d-node ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isLocked ? 'locked' : ''}" data-bonus-node="${node.id}" style="--i:${index}">
                  <span class="ps-bonus3d-orb">${isDone ? '✅' : isLocked ? '🔒' : node.icon}</span>
                  <b>${escapeHtml(node.title)}</b>
                  <small>${isDone ? '✓ Sudah dikunjungi' : isLocked ? 'Terkunci' : isActive ? 'Quest aktif' : 'Berikutnya'}</small>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="ps-bonus3d-panel ps-bonus3d-story-panel">
          <div class="ps-bonus3d-kicker">Bonus Level 4 • Full Screen 3D Quest</div>
          <h3>${escapeHtml(active.title)}</h3>
          <p>${escapeHtml(storyLine)}</p>
          <div class="ps-bonus3d-panji">
            <b>PANJI:</b> ${escapeHtml(active.desc)} Pilihan di bawah ini diacak. Ada yang aman, ada yang jebakan. Jangan asal klik, karena pilihanmu masuk analisa akhir.
          </div>

          <div class="ps-bonus3d-choices">
            ${shuffledChoices.map(choice => `
              <button type="button" class="ps-bonus3d-choice" data-bonus-choice="${active.id}::${choice.id}">
                ${escapeHtml(choice.text)}
              </button>
            `).join('')}
          </div>

          <div class="ps-bonus3d-status">
            <span>Quest: <b>${activeIndex + 1}/${bonus.nodes.length}</b></span>
            <span>Ceklis map: <b>${completedCount}/${bonus.nodes.length}</b></span>
            <span>Bonus poin: <b>${bonus.bonusScore}</b></span>
          </div>
        </div>
      </div>

      ${GAME_STATE.progress >= 100 ? `
        <div class="ps-explanation">
          <strong>Bonus Level 4 selesai:</strong><br>
          PANJI sudah catat gaya analisamu dari tim, data barang, pasar penyedia, dan evaluasi. Nilai bonus ini ikut masuk skor akhir.
        </div>
      ` : ''}
    `;
  }

  function answerBonusOpenWorld(payload, buttonEl) {
    const bonus = getBonusOpenWorldState();
    const [nodeId, choiceId] = String(payload || '').split('::');
    const node = bonus.nodes.find(item => item.id === nodeId);
    const choice = node && node.choices.find(item => item.id === choiceId);
    if (!node || !choice || bonus.completed[nodeId]) return;

    bonus.completed[nodeId] = true;
    bonus.decisions[nodeId] = choice;

    if (choice.good) {
      GAME_STATE.score += 35;
      GAME_STATE.correct += 1;
      bonus.bonusScore += 35;
      addLog('ok', `${node.title} aman`, choice.panji);
      showToast('Pilihan bonus aman. +35', 'ok');
      showPanji(choice.panji, 'happy');
      flashScreen('ok');
      popScore(buttonEl || document.body, '+35', 'ok');
      spawnConfetti();
    } else {
      GAME_STATE.score = Math.max(0, GAME_STATE.score - 5);
      GAME_STATE.risk += 8;
      GAME_STATE.wrong += 1;
      bonus.bonusScore = Math.max(0, bonus.bonusScore - 5);
      addLog('bad', `${node.title} rawan`, choice.panji);
      showToast('Jebakan bonus. Risiko +8', 'bad');
      showPanji(choice.panji, 'sad');
      flashScreen('bad');
      popScore(buttonEl || document.body, '+8 Risiko', 'bad');
    }

    const completedCount = Object.keys(bonus.completed).length;
    GAME_STATE.progress = Math.round((completedCount / bonus.nodes.length) * 100);

    const nextNode = bonus.nodes.find(item => !bonus.completed[item.id]);
    const finishedAll = !nextNode;
    if (nextNode) {
      bonus.activeNode = nextNode.id;
    } else {
      GAME_STATE.progress = 100;
      GAME_STATE.score += 20;
      addLog('ok', 'Bonus level 4 selesai', 'Poin analisa dari bonus open world sudah masuk nilai akhir.');
      showPanji('Evaluator Battle selesai. Aku hitung dulu poin bonus dan gaya analisamu. Portal 3D mulai terbuka.', 'happy');
      showToast('Portal 3D terbuka. Bonus +' + bonus.bonusScore, 'ok');
    }

    renderGame();
    if (finishedAll) {
      setTimeout(() => showBonusOpenWorldCompletePopup(bonus), 80);
    }
  }


  function showBonusOpenWorldCompletePopup(bonus) {
    if (document.getElementById('psBonus4FinishPopup')) return;
    const goodCount = Object.values(bonus.decisions || {}).filter(item => item && item.good).length;
    const total = bonus.nodes.length;
    const analysis = goodCount >= 3
      ? 'Gaya analisamu lumayan aman. Kamu sudah mulai balik ke data, cek pasar, dan tidak terlalu gampang kepancing pilihan murah-cepat.'
      : 'Gaya analisamu masih rawan. Kamu beberapa kali tergoda pilihan cepat atau murah tanpa cukup bukti. Di PBJ, itu bisa bikin risiko naik.';
    const overlay = document.createElement('div');
    overlay.id = 'psBonus4FinishPopup';
    overlay.className = 'ps-bonus4-finish-popup';
    overlay.innerHTML = `
      <div class="ps-bonus4-finish-card">
        <div class="ps-bonus4-finish-orb">🌍</div>
        <h2>Portal Dunia 3D Terbuka!</h2>
        <p><b>Poin Bonus:</b> ${Number(bonus.bonusScore || 0)} · <b>Keputusan aman:</b> ${goodCount}/${total}</p>
        <div class="ps-bonus4-panji-note"><b>PANJI:</b> ${escapeHtml(analysis)} Konsolidasi berhasil diselesaikan, jadi kamu bisa keluar dari dunia 3D.</div>
        <small>Otomatis lanjut ke level berikutnya...</small>
        <button type="button" class="ps-btn ps-btn-primary" id="btnBonus4GoNext">Lanjut sekarang</button>
      </div>
    `;
    document.body.appendChild(overlay);
    const go = () => {
      overlay.remove();
      if (getCurrentChallenge() && getCurrentChallenge().type === 'bonusOpenWorld' && GAME_STATE.progress === 100) {
        nextChallenge();
      }
    };
    document.getElementById('btnBonus4GoNext')?.addEventListener('click', go);
    setTimeout(go, 4200);
  }

  function createBonusSnakeState() {
    return {
      running: false,
      finished: false,
      briefed: false,
      score: 0,
      target: 12,
      hearts: 5,
      grid: 18,
      snake: [{x:8,y:9},{x:7,y:9},{x:6,y:9}],
      dir: {x:1,y:0},
      nextDir: {x:1,y:0},
      star: {x:13,y:9},
      obstacles: [{x:3,y:3},{x:14,y:4},{x:6,y:14},{x:15,y:14},{x:10,y:6}],
      ticks: 0,
      activeTip: 'Kisi-kisi: di PBJ jangan cuma kejar cepat. Cek dulu RUP, kebutuhan, harga, katalog, dan bukti proses.'
    };
  }

  function getBonusSnakeState() {
    if (!GAME_STATE.bonusSnake) GAME_STATE.bonusSnake = createBonusSnakeState();
    return GAME_STATE.bonusSnake;
  }

  function renderBonusSnakeChallenge() {
    const snake = getBonusSnakeState();
    return `
      <div class="ps-snake-wrap ps-snake-wrap-big">
        <div class="ps-snake-info">
          <div class="ps-bonus3d-kicker">Bonus Level 8 • Mood Booster</div>
          <h3>PANJI Star Snake</h3>
          <p>Ambil bintang sebanyak mungkin. Tembus tembok boleh: kanan tembus ke kiri, bawah tembus ke atas. Yang bahaya itu badan sendiri dan jebakan revisi. Pakai tap HP / klik mouse di area game buat belokin ular. Keyboard WASD/arrow tetap bisa. Bonus ini boleh diulang, atau dilewati kalau mau lanjut level berikutnya.</p>
          <div class="ps-snake-score-row">
            <div><label>Bintang</label><b>${snake.score}/${snake.target}</b></div>
            <div><label>Hati</label><b>${'❤️'.repeat(Math.max(0, snake.hearts || 0)) || '0'}</b></div>
            <div><label>Bonus</label><b>${Math.min(120, snake.score * 10)}</b></div>
          </div>
          <div class="ps-bonus3d-panji">
            <b>PANJI:</b> Ini level santai. Fokus ambil ⭐ Bintang Semangat, jangan rakus, dan hindari 🧾 Revisi. Kamu punya 5 hati. Kalau hati habis, level selesai dan langsung bisa lanjut.
          </div>
          <div class="ps-snake-pbj-pop">
            <b>Popup kisi-kisi PBJ:</b> ${escapeHtml(snake.activeTip || 'Jangan asal ambil keputusan. Cek data, harga, katalog, dan bukti proses.')}
          </div>
          ${!snake.briefed && !snake.running && !snake.finished ? `
            <div class="ps-snake-brief-modal">
              <b>Sebelum mulai, baca cepat:</b> ambil bintang sambil tetap baca kisi-kisi PBJ. Ini melatih multitasking: mata lihat arena, otak tetap ingat prinsip PBJ. Jangan rakus, jangan tabrak revisi.
              <button type="button" class="ps-btn ps-btn-primary" id="btnSnakeBriefStart">Paham, mulai Snake</button>
            </div>
          ` : ''}
          <div class="ps-buttons">
            <button type="button" class="ps-btn ps-btn-primary" id="btnStartSnake" ${snake.running ? 'disabled' : ''}>${snake.finished ? 'Main Lagi Snake' : 'Mulai Snake'}</button>
            <button type="button" class="ps-btn ps-btn-soft" id="btnResetSnake">Ulangi Level Bonus</button>
            <button type="button" class="ps-btn ps-btn-soft" id="btnSkipSnake">Lewati Level Bonus</button>
          </div>
        </div>
        <div class="ps-snake-stage ps-snake-stage-big">
          <canvas id="psSnakeCanvas" width="960" height="960" aria-label="PANJI Star Snake"></canvas>
          <div class="ps-snake-arena-tip" style="--tip-x:${22 + ((snake.score * 17) % 58)}%;--tip-y:${16 + ((snake.score * 23) % 54)}%">
            <b>PANJI nyeletuk:</b> ${escapeHtml(snake.activeTip || 'Jangan asal klik. Tetap baca kisi-kisi PBJ sambil main.')}
          </div>
          <div class="ps-snake-caption">⭐ Bintang = poin · 🧾 Revisi = jebakan · Tap/Klik = belok · WASD/Arrow juga bisa</div>
        </div>
      </div>
      ${snake.finished ? `
        <div class="ps-explanation"><strong>Bonus Snake selesai:</strong><br>Kamu mendapat ${snake.score} bintang. Poin bonus masuk skor akhir. Klik <b>Main Lagi Snake</b> kalau mau memperbaiki skor, atau <b>Lanjut Soal Berikutnya</b>.</div>
      ` : ''}
    `;
  }

  function renderQuizChallenge(challenge) {
    const options = Array.isArray(challenge.runtimeOptions) && challenge.runtimeOptions.length
      ? challenge.runtimeOptions
      : (challenge.options || []).map((text, originalIndex) => ({ text, originalIndex }));
    const correctRuntimeIndex = Number.isInteger(challenge.runtimeAnswer) ? challenge.runtimeAnswer : Number(challenge.answer || 0);

    return `
      <div class="ps-quiz-question">
        ${escapeHtml(challenge.question)}
      </div>

      <div class="ps-quiz-options">
        ${options.map((option, index) => {
          let cls = '';

          if (GAME_STATE.answered) {
            if (index === correctRuntimeIndex) cls = 'correct';
            else if (index === GAME_STATE.selectedAnswer) cls = 'wrong';
          }

          return `
            <button
              type="button"
              class="ps-quiz-option ${cls}"
              data-answer-index="${index}"
              ${GAME_STATE.answered ? 'disabled' : ''}
            >
              ${String.fromCharCode(65 + index)}. ${escapeHtml(option.text)}
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
    const stopTitle = GAME_STATE.stoppedReason === 'rushFailed'
      ? 'Game berhenti karena Tender Rush gagal melewati batas level.'
      : GAME_STATE.stoppedReason === 'time'
        ? 'Game berhenti karena waktu level habis.'
        : '';

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

          <div class="ps-result-card">
            <label>Level Dicapai</label>
            <strong>${getCurrentResultSummary().levelDicapai}/${totalQuestions}</strong>
          </div>
        </div>

        ${stopTitle ? `
          <div class="ps-result-note ps-result-stop-note">
            <strong>${escapeHtml(stopTitle)}</strong><br>
            Kamu mencapai <strong>Level ${GAME_STATE.stoppedLevel || (GAME_STATE.index + 1)}</strong> dengan skor <strong>${GAME_STATE.score}</strong> dan risiko <strong>${GAME_STATE.risk}</strong>.
          </div>
        ` : ''}

        <div class="ps-result-note">
          <strong>Ringkasan:</strong><br>
          Kamu sudah menyelesaikan ${totalQuestions} soal/challenge. Level risiko kamu saat ini:
          <strong>${riskLabel}</strong>. Ingat, terlalu sering memakai hint dari PANJI memang membantu,
          tetapi mengurangi skor.
        </div>

        <div class="ps-result-note">
          <strong>Analisa PANJI:</strong><br>
          ${escapeHtml(getFinalPanjiAnalysisText(getCurrentResultSummary()))}
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
          <button type="button" class="ps-btn ps-btn-soft" id="btnOpenLeaderboard">
            Lihat Leaderboard
          </button>
        </div>
      </section>
    `;
  }

  function bindResultEvents() {
    const btnPlayAgain = root.querySelector('#btnPlayAgain');
    const btnOpenLeaderboard = root.querySelector('#btnOpenLeaderboard');
    const btnSaveFeedback = root.querySelector('#btnSaveFeedback');

    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        clearAutoNextTimer();
        startGame();
      });
    }

    if (btnOpenLeaderboard) {
      btnOpenLeaderboard.addEventListener('click', () => {
        openLeaderboardModal('leaderboard', true);
      });
    }

    if (btnSaveFeedback) {
      btnSaveFeedback.addEventListener('click', () => {
        const box = root.querySelector('#psFinalFeedback');
        PLAYER_STATE.feedback = String(box ? box.value || '' : '').trim();
        savePlayerProfile(PLAYER_STATE.nama, PLAYER_STATE.instansi);
        showToast('Masukan disimpan. Terima kasih!', 'ok');
        showPanji('Makasih masukannya. Aku catat buat pengembangan game PBJ berikutnya.', 'happy');
      });
    }
  }


  function maybeStartSnakeFromAnyInput(event) {
    const challenge = getCurrentChallenge && getCurrentChallenge();
    if (!challenge || challenge.type !== 'bonusSnake') return;
    const snake = getBonusSnakeState();
    if (!snake || snake.running || snake.finished) return;
    if (!snake.briefed) snake.briefed = true;
    startBonusSnakeGame();
    if (event) event.preventDefault && event.preventDefault();
  }

  function clearBonusSnakeTimers() {
    if (bonusSnakeTimer) {
      clearInterval(bonusSnakeTimer);
      bonusSnakeTimer = null;
    }
    if (bonusSnakeKeyHandler) {
      document.removeEventListener('keydown', bonusSnakeKeyHandler);
      bonusSnakeKeyHandler = null;
    }
  }

  function setSnakeDirection(dx, dy) {
    const snake = getBonusSnakeState();
    if (!snake || !snake.running || snake.finished) return;
    if (snake.dir.x === -dx && snake.dir.y === -dy) return;
    snake.nextDir = {x: dx, y: dy};
  }

  function steerSnakeFromPointer(event) {
    const canvas = root && root.querySelector('#psSnakeCanvas');
    const snake = getBonusSnakeState();
    if (!canvas || !snake || snake.finished) return;

    if (!snake.running) {
      snake.briefed = true;
      startBonusSnakeGame();
    }

    const rect = canvas.getBoundingClientRect();
    const point = event.touches && event.touches[0] ? event.touches[0] : event;
    const head = snake.snake[0];
    const cellW = rect.width / snake.grid;
    const cellH = rect.height / snake.grid;
    const headX = rect.left + ((head.x + 0.5) * cellW);
    const headY = rect.top + ((head.y + 0.5) * cellH);
    const dx = point.clientX - headX;
    const dy = point.clientY - headY;

    if (Math.abs(dx) > Math.abs(dy)) {
      setSnakeDirection(dx > 0 ? 1 : -1, 0);
    } else {
      setSnakeDirection(0, dy > 0 ? 1 : -1);
    }

    if (event) event.preventDefault && event.preventDefault();
  }

  function drawBonusSnake() {
    const canvas = root && root.querySelector('#psSnakeCanvas');
    if (!canvas) return;
    const snake = getBonusSnakeState();
    const c = canvas.getContext('2d');

    const cssW = Math.max(320, Math.floor(canvas.clientWidth || 960));
    const cssH = Math.max(320, Math.floor(canvas.clientHeight || 720));
    if (canvas.width !== cssW || canvas.height !== cssH) {
      canvas.width = cssW;
      canvas.height = cssH;
    }

    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / snake.grid;
    const cellH = h / snake.grid;
    const radius = Math.max(8, Math.min(cellW, cellH) * .22);

    c.clearRect(0, 0, w, h);
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#071a2e');
    g.addColorStop(.55, '#123a72');
    g.addColorStop(1, '#06111f');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);

    for (let x = 0; x < snake.grid; x += 1) {
      for (let y = 0; y < snake.grid; y += 1) {
        c.fillStyle = (x + y) % 2 === 0 ? 'rgba(255,255,255,.045)' : 'rgba(255,255,255,.018)';
        c.fillRect(x * cellW, y * cellH, cellW, cellH);
      }
    }

    c.fillStyle = 'rgba(255,255,255,.96)';
    c.font = 'bold 22px Arial';
    c.fillText('❤️'.repeat(Math.max(0, snake.hearts || 0)), 18, 34);
    c.font = 'bold 18px Arial';
    c.fillText('⭐ ' + snake.score + '/' + snake.target, Math.max(18, w - 130), 34);

    snake.obstacles.forEach(o => {
      c.fillStyle = '#dc2626';
      c.beginPath();
      c.roundRect(o.x * cellW + 5, o.y * cellH + 5, cellW - 10, cellH - 10, radius);
      c.fill();
      c.font = `${Math.max(20, Math.min(cellW, cellH) * .56)}px Arial`;
      c.fillText('🧾', o.x * cellW + cellW * .24, o.y * cellH + cellH * .68);
    });

    c.font = `${Math.max(22, Math.min(cellW, cellH) * .62)}px Arial`;
    c.fillText('⭐', snake.star.x * cellW + cellW * .20, snake.star.y * cellH + cellH * .70);

    snake.snake.forEach((part, index) => {
      c.fillStyle = index === 0 ? '#f59e0b' : '#22d3ee';
      c.beginPath();
      c.roundRect(part.x * cellW + 4, part.y * cellH + 4, cellW - 8, cellH - 8, radius);
      c.fill();
      if (index === 0) {
        c.fillStyle = '#111827';
        c.font = `bold ${Math.max(12, Math.min(cellW, cellH) * .33)}px Arial`;
        c.fillText('P', part.x * cellW + cellW * .36, part.y * cellH + cellH * .62);
      }
    });
  }

  function randomSnakeCell(snake) {
    let guard = 0;
    while (guard < 300) {
      const cell = { x: Math.floor(Math.random() * snake.grid), y: Math.floor(Math.random() * snake.grid) };
      const occupied = snake.snake.some(p => p.x === cell.x && p.y === cell.y) || snake.obstacles.some(o => o.x === cell.x && o.y === cell.y);
      if (!occupied) return cell;
      guard += 1;
    }
    return {x:1,y:1};
  }

  function startBonusSnakeGame() {
    let snake = getBonusSnakeState();
    if (snake.running) return;
    if (snake.finished) {
      GAME_STATE.bonusSnake = createBonusSnakeState();
      GAME_STATE.progress = 0;
      snake = getBonusSnakeState();
      renderGame();
    }
    clearBonusSnakeTimers();
    snake.running = true;
    showPanji('Gas! Tap atau klik area game buat belokin ular. Ambil bintang, jangan tabrak revisi. Tembok bisa ditembus. Skor bonus tetap dihitung.', 'happy');

    bonusSnakeKeyHandler = event => {
      const key = event.key.toLowerCase();
      if ((key === 'arrowup' || key === 'w') && snake.dir.y !== 1) snake.nextDir = {x:0,y:-1};
      if ((key === 'arrowdown' || key === 's') && snake.dir.y !== -1) snake.nextDir = {x:0,y:1};
      if ((key === 'arrowleft' || key === 'a') && snake.dir.x !== 1) snake.nextDir = {x:-1,y:0};
      if ((key === 'arrowright' || key === 'd') && snake.dir.x !== -1) snake.nextDir = {x:1,y:0};
    };
    document.addEventListener('keydown', bonusSnakeKeyHandler);

    bonusSnakeTimer = setInterval(tickBonusSnake, 230);
    drawBonusSnake();
  }

  function finishBonusSnake(message, crashed = false) {
    const snake = getBonusSnakeState();
    if (snake.finished) return;
    snake.running = false;
    snake.finished = true;
    clearBonusSnakeTimers();
    const bonus = Math.min(120, snake.score * 10);
    GAME_STATE.score += bonus;
    if (crashed) {
      GAME_STATE.risk += 6;
      GAME_STATE.wrong += 1;
      addLog('bad', 'Snake selesai karena tabrakan', message + ' Bonus tetap dihitung dari bintang yang sempat kamu ambil.');
      showPanji(message + ' Hati habis, tapi santai. Ini bonus, jadi aku langsung bantu lanjut ke level berikutnya.', 'sad');
      setTimeout(() => {
        const current = getCurrentChallenge && getCurrentChallenge();
        if (current && current.type === 'bonusSnake' && GAME_STATE.progress === 100) nextChallenge();
      }, 2400);
    } else {
      GAME_STATE.correct += 1;
      addLog('ok', 'Snake selesai', message);
      showPanji(message, 'happy');
      spawnConfetti();
    }
    GAME_STATE.progress = 100;
    renderGame();
  }

  function getSnakePbjTip(score) {
    const tips = [
      'Kisi-kisi: Perencanaan dulu. Jangan langsung belanja kalau kebutuhan, volume, lokasi, dan jadwal belum kebaca.',
      'Kisi-kisi: Di Katalog V6 alurnya cari produk, isi detail pesanan, negosiasi, buat pesanan/kontrak, pembayaran, pengiriman, BAST, baru review.',
      'Kisi-kisi: e-Purchasing tetap perlu cek spek, stok, ongkir, total harga, PDN/TKDN, dan bukti proses. Jangan cuma lihat harga item.',
      'Kisi-kisi: Negosiasi di katalog itu bukan asal minta murah. Yang dicari harga wajar, stok jelas, pengiriman masuk akal, dan bukti rapi.',
      'Kisi-kisi: Mini kompetisi konstruksi dipakai supaya penyedia katalog punya kesempatan yang sama dan prosesnya lebih kompetitif.',
      'Kisi-kisi: Sebelum tetapkan penyedia, cek lagi kebenaran produk, kualifikasi, dan kesesuaian penawaran. Jangan modal percaya.',
      'Kisi-kisi: Swakelola juga ada tahapan. Ada perencanaan, persiapan, pelaksanaan, pengawasan, serah terima, dan pembayaran.',
      'Kisi-kisi: Kontrak jangan cuma dibuat lalu ditinggal. Pantau waktu, mutu, volume, perubahan, dan bukti serah terimanya.',
      'Kisi-kisi: BAST jangan asal tanda tangan. Pastikan barang atau pekerjaan sudah sesuai, lengkap, dan bisa dipakai.',
      'Kisi-kisi: Percepatan PBJ boleh, tapi jangan nabrak prinsip efisien, efektif, transparan, dan akuntabel.',
      'Kisi-kisi: Kalau rencana awal katalog gagal, dokumentasikan hasil cek dulu. Baru evaluasi metode, jangan langsung lompat.',
      'Kisi-kisi: Risiko naik kalau kamu memilih karena biasa, karena cepat, atau karena murah doang. Balik lagi ke data.'
    ];
    return tips[Math.abs(Number(score || 0)) % tips.length];
  }

  function tickBonusSnake() {
    const snake = getBonusSnakeState();
    if (!snake.running || snake.finished) return;
    snake.dir = snake.nextDir;
    const head = snake.snake[0];
    const next = {
      x: (head.x + snake.dir.x + snake.grid) % snake.grid,
      y: (head.y + snake.dir.y + snake.grid) % snake.grid
    };

    const hitSelf = snake.snake.some(p => p.x === next.x && p.y === next.y);
    const hitObs = snake.obstacles.some(o => o.x === next.x && o.y === next.y);
    if (hitSelf || hitObs) {
      snake.hearts = Math.max(0, Number(snake.hearts || 0) - 1);
      addLog('bad', 'Snake kena jebakan', 'PANJI nabrak revisi. Hati tersisa ' + snake.hearts + '.');
      showToast('Aduh nabrak! Hati -1', 'bad');
      showPanji(snake.hearts > 0 ? 'Aduh, kena revisi. Masih ada hati. Kita lanjut pelan-pelan ya.' : 'Hati habis. Tidak apa-apa, level bonus selesai dan kita lanjut.', snake.hearts > 0 ? 'thinking' : 'sad');
      if (snake.hearts <= 0) {
        finishBonusSnake('Hati PANJI habis karena terlalu sering nabrak revisi.', true);
        return;
      }
      snake.snake = [{x:8,y:9},{x:7,y:9},{x:6,y:9}];
      snake.dir = {x:1,y:0};
      snake.nextDir = {x:1,y:0};
      drawBonusSnake();
      return;
    }

    snake.snake.unshift(next);
    if (next.x === snake.star.x && next.y === snake.star.y) {
      snake.score += 1;
      snake.star = randomSnakeCell(snake);
      snake.activeTip = getSnakePbjTip(snake.score);
      showToast('Bintang semangat +1', 'ok');
      showPanji(snake.activeTip.replace('Kisi-kisi:', 'Kisi-kisi PBJ:'), 'talking');
      if (snake.score >= snake.target) {
        finishBonusSnake('Mantap! Semua bintang semangat terkumpul. Mood naik, lanjut analisa PBJ.', false);
        return;
      }
      renderGame();
      setTimeout(drawBonusSnake, 0);
      return;
    }
    snake.snake.pop();
    snake.ticks += 1;
    drawBonusSnake();
  }

  function skipBonusSnake() {
    clearBonusSnakeTimers();
    const snake = getBonusSnakeState();
    if (!snake.finished) {
      snake.running = false;
      snake.finished = true;
      GAME_STATE.progress = 100;
      addLog('info', 'Bonus Snake dilewati', 'User memilih melewati bonus level 8. Skor bonus tidak ditambahkan, tapi game tetap bisa lanjut.');
      showPanji('Oke, level bonus dilewati. Tidak apa-apa, kita lanjut ke level berikutnya.', 'thinking');
      showToast('Bonus level dilewati', 'info');
      renderGame();
    }
  }

  function resetBonusSnake() {
    clearBonusSnakeTimers();
    GAME_STATE.bonusSnake = createBonusSnakeState();
    GAME_STATE.progress = 0;
    renderGame();
    showPanji('Snake direset. Coba ambil bintang dengan lebih santai.', 'thinking');
  }

  function getFinalPanjiAnalysisText(result) {
    const percent = result.maxScore > 0 ? Math.round((result.skor / result.maxScore) * 100) : 0;
    const risk = Number(result.risiko || 0);
    const wrong = Number(result.salah || 0);
    let riskReason = 'Risikonya rendah karena pilihanmu cukup tertib dan jarang kena jebakan.';

    if (risk > 70) {
      riskReason = 'Risikonya tinggi karena kamu beberapa kali kena jebakan: biasanya lompat tahap, terlalu ngejar cepat, atau kurang cek dasar sebelum ambil keputusan.';
    } else if (risk > 45) {
      riskReason = 'Risikonya sedang. Artinya alurmu sudah jalan, tapi masih ada keputusan yang perlu dicek ulang biar nggak jadi catatan.';
    } else if (wrong > 0) {
      riskReason = 'Risikonya masih aman, tapi ada beberapa salah pilih. Pelan-pelan baca kasusnya, jangan cuma lihat kata kunci.';
    }

    if (percent >= 85 && risk <= 30) return 'PANJI bilang: analisamu sudah tajam. Kamu cukup rapi baca kasus, milih metode, dan menjaga tahapan PBJ. ' + riskReason;
    if (percent >= 70) return 'PANJI bilang: hasilmu sudah bagus. Kamu sudah paham arah besarnya, tinggal kurangi keputusan yang keburu-buru. ' + riskReason;
    if (percent >= 55) return 'PANJI bilang: kamu sudah mulai nangkep, tapi masih perlu latihan. Fokus lagi ke RUP, KAK/HPS, katalog, kontrak, BAST, dan jangan gampang ketipu kartu jebakan. ' + riskReason;
    return 'PANJI bilang: belum apa-apa, ini masih latihan. Jangan kejar cepat dulu. Pahami kenapa tahapan itu ada, baru ambil keputusan. ' + riskReason;
  }


  function startTenderRush() {
    const challenge = getCurrentChallenge();
    if (!challenge || challenge.type !== 'tenderRush') return;

    clearPanjiIntroTimers();
    clearLevelTimer();
    clearTenderRushTimers();

    GAME_STATE.tenderRush = {
      started: true,
      currentIndex: 0,
      timeLeft: Number(challenge.timeLimit || 8),
      locked: false,
      lastResult: null,
      correctCount: 0,
      wrongCount: 0,
      packages: prepareTenderRushRandomPackages(challenge)
    };

    enableTenderRushKeyboard();
    beginTenderRushRound();
    showPanji(`Mulai! Paket pertama turun. Ingat: 1 e-Katalog, 2 Pengadaan Langsung, 3 Tender/Seleksi, 4 Swakelola, 5 Dikecualikan. Batas salah level ini ${getTenderRushFailLimitByLevel(getCurrentLevelNumber())} kali.`, 'happy');
  }

  function beginTenderRushRound() {
    const challenge = getCurrentChallenge();
    const rush = GAME_STATE.tenderRush;

    if (!challenge || challenge.type !== 'tenderRush' || !rush) return;

    clearTenderRushTimers();

    const rushPackages = Array.isArray(rush.packages) && rush.packages.length ? rush.packages : (challenge.packages || []);

    if (rush.currentIndex >= rushPackages.length) {
      finishTenderRush();
      return;
    }

    rush.timeLeft = Number(challenge.timeLimit || 8);
    rush.locked = false;
    rush.lastResult = null;
    GAME_STATE.progress = Math.round((rush.currentIndex / Math.max(1, rushPackages.length)) * 100);

    renderGame();

    tenderRushTimer = setInterval(() => {
      if (destroyed) return;

      const activeChallenge = getCurrentChallenge();
      const activeRush = GAME_STATE.tenderRush;

      if (!activeChallenge || activeChallenge.type !== 'tenderRush' || !activeRush || activeRush.locked) return;

      activeRush.timeLeft -= 1;
      updateTenderRushClock();

      if (activeRush.timeLeft <= 0) {
        answerTenderRush(null);
      }
    }, 1000);
  }

  function updateTenderRushClock() {
    const challenge = getCurrentChallenge();
    const rush = GAME_STATE.tenderRush;

    if (!challenge || !rush) return;

    const text = root && root.querySelector('#psRushTimeText');
    const bar = root && root.querySelector('#psRushTimeBar');
    const percent = Math.max(0, Math.min(100, (Number(rush.timeLeft || 0) / Number(challenge.timeLimit || 8)) * 100));

    if (text) text.textContent = String(Math.max(0, rush.timeLeft));
    if (bar) bar.style.width = percent + '%';
  }

  function answerTenderRush(methodId) {
    const challenge = getCurrentChallenge();
    const rush = GAME_STATE.tenderRush;

    if (!challenge || challenge.type !== 'tenderRush' || !rush || !rush.started || rush.locked) return;

    const rushPackages = Array.isArray(rush.packages) && rush.packages.length ? rush.packages : (challenge.packages || []);
    const pkg = rushPackages[rush.currentIndex];
    if (!pkg) return;

    clearTenderRushTimers();
    rush.locked = true;

    const isTimeout = !methodId;
    const isCorrect = methodId === pkg.correct;
    const correctMethod = TENDER_RUSH_METHODS[pkg.correct];
    const chosenMethod = methodId ? TENDER_RUSH_METHODS[methodId] : null;

    if (isCorrect) {
      GAME_STATE.score += 10;
      rush.correctCount += 1;
      addLog('ok', `Tender Rush benar: ${pkg.title}`, pkg.explanation);
      showToast('Jalur benar. +10 skor.', 'ok');
      showPanji(`Betul! ${pkg.explanation}`, 'happy');
      flashScreen('ok');
      spawnConfetti();
      rush.lastResult = {
        correct: true,
        message: `${pkg.title} tepat masuk ${correctMethod.label}. ${pkg.explanation}`
      };
    } else {
      GAME_STATE.risk += isTimeout ? 10 : 8;
      GAME_STATE.wrong += 1;
      GAME_STATE.score = Math.max(0, GAME_STATE.score - 4);
      rush.wrongCount += 1;

      const message = isTimeout
        ? `Waktu habis. Seharusnya masuk ${correctMethod.label}. ${pkg.explanation}`
        : `Kamu memilih ${chosenMethod ? chosenMethod.label : 'jalur lain'}, padahal yang lebih tepat ${correctMethod.label}. ${pkg.explanation}`;

      addLog('bad', `Tender Rush belum tepat: ${pkg.title}`, message);
      showToast(isTimeout ? 'Waktu habis. Risiko naik.' : 'Jalur belum tepat. Risiko naik.', 'bad');
      showPanji(message, 'sad');
      flashScreen('bad');
      rush.lastResult = { correct: false, message };
    }

    GAME_STATE.progress = Math.round(((rush.currentIndex + 1) / Math.max(1, rushPackages.length)) * 100);
    renderGame();

    if (rush.wrongCount >= getTenderRushFailLimitByLevel(getCurrentLevelNumber())) {
      tenderRushNextTimer = setTimeout(() => {
        if (!destroyed) stopGameEarly('rushFailed');
      }, 900);
      return;
    }

    tenderRushNextTimer = setTimeout(() => {
      if (destroyed) return;
      rush.currentIndex += 1;

      if (rush.currentIndex >= rushPackages.length) {
        finishTenderRush();
        return;
      }

      beginTenderRushRound();
    }, 1650);
  }

  function finishTenderRush() {
    const challenge = getCurrentChallenge();
    const rush = GAME_STATE.tenderRush;

    if (!challenge || challenge.type !== 'tenderRush' || !rush) return;

    clearTenderRushTimers();
    disableTenderRushKeyboard();

    rush.started = true;
    const rushPackages = Array.isArray(rush.packages) && rush.packages.length ? rush.packages : (challenge.packages || []);
    rush.currentIndex = rushPackages.length;
    rush.locked = true;
    rush.lastResult = null;
    GAME_STATE.progress = 100;
    GAME_STATE.correct += 1;
    GAME_STATE.score += 20;

    addLog('ok', 'Tender Rush selesai', challenge.explanation);
    renderGame();
    showToast('Tender Rush selesai. Otomatis lanjut...', 'ok');
    showPanji('Mantap! Tender Rush selesai. Ini melatih refleks membaca pagu, jenis paket, katalog, dan kondisi pelaksanaan sebelum memilih metode.', 'happy');
    spawnConfetti();
    scheduleAutoNext('Tender Rush selesai. Otomatis lanjut ke soal berikutnya...');
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

    root.querySelectorAll('[data-rush-method]').forEach(button => {
      button.addEventListener('click', () => {
        answerTenderRush(button.dataset.rushMethod);
      });
    });

    const btnStartTenderRush = root.querySelector('#btnStartTenderRush');
    if (btnStartTenderRush) {
      btnStartTenderRush.addEventListener('click', () => {
        startTenderRush();
      });
    }

    root.querySelectorAll('[data-bonus-node]').forEach(button => {
      button.addEventListener('click', () => {
        const bonus = GAME_STATE.bonusOpenWorld;
        if (!bonus) return;
        const order = bonus.nodes.map(node => node.id);
        const targetId = button.dataset.bonusNode;
        const targetIndex = order.indexOf(targetId);
        const completedCount = Object.keys(bonus.completed).length;
        if (targetIndex > completedCount) {
          showPanji('Belum bisa lompat ke quest itu. Bonus level 4 ini story line, jadi jalannya harus berurutan dulu.', 'sad');
          showToast('Quest masih terkunci', 'bad');
          return;
        }
        bonus.activeNode = targetId;
        renderGame();
        showPanji('Quest dipilih. Baca pilihan pelan-pelan ya, karena opsi diacak dan ada jebakan.', 'thinking');
      });
    });

    root.querySelectorAll('[data-bonus-choice]').forEach(button => {
      button.addEventListener('click', () => {
        answerBonusOpenWorld(button.dataset.bonusChoice, button);
      });
    });

    const btnSnakeBriefStart = root.querySelector('#btnSnakeBriefStart');
    if (btnSnakeBriefStart) {
      btnSnakeBriefStart.addEventListener('click', () => {
        const snake = getBonusSnakeState();
        snake.briefed = true;
        showPanji('Kisi-kisi PBJ aku bacain juga ya: jangan cuma kejar cepat. Tetap cek RUP, kebutuhan, harga, katalog, negosiasi, dan bukti proses. Oke, Snake mulai!', 'talking');
        startBonusSnakeGame();
      });
    }

    const btnStartSnake = root.querySelector('#btnStartSnake');
    if (btnStartSnake) {
      btnStartSnake.addEventListener('click', event => {
        const snake = getBonusSnakeState();
        snake.briefed = true;
        startBonusSnakeGame();
        event.preventDefault();
      });
      setTimeout(drawBonusSnake, 0);
      const snake = getBonusSnakeState();
      if (!snake.running && !snake.finished && !snake._panjiTipShown) {
        snake._panjiTipShown = true;
        setTimeout(() => showPanji('Sebelum mulai Snake, aku kasih kisi-kisi PBJ ya: jangan cuma kejar cepat. Cek RUP, kebutuhan, katalog, harga, negosiasi, dan bukti proses. Klik atau tekan tombol apa saja kalau sudah siap.', 'talking'), 350);
      }
    }

    const snakePageKeyStarter = event => {
      const current = getCurrentChallenge && getCurrentChallenge();
      if (!current || current.type !== 'bonusSnake') return;
      const key = String(event.key || '').toLowerCase();
      if (!['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(key)) return;
      maybeStartSnakeFromAnyInput(event);
    };
    document.removeEventListener('keydown', snakePageKeyStarter);
    document.addEventListener('keydown', snakePageKeyStarter, {once:true});

    const snakeCanvas = root.querySelector('#psSnakeCanvas');
    const snakeStage = root.querySelector('.ps-snake-stage');
    const snakeInputStarter = event => {
      const snake = getBonusSnakeState();
      if (!snake.running && !snake.finished) {
        maybeStartSnakeFromAnyInput(event);
        setTimeout(() => steerSnakeFromPointer(event), 20);
        return;
      }
      steerSnakeFromPointer(event);
    };
    if (snakeCanvas) {
      snakeCanvas.addEventListener('pointerdown', snakeInputStarter);
      snakeCanvas.addEventListener('touchstart', snakeInputStarter, {passive:false});
    }
    if (snakeStage) {
      snakeStage.addEventListener('pointerdown', snakeInputStarter);
    }

    const btnResetSnake = root.querySelector('#btnResetSnake');
    if (btnResetSnake) {
      btnResetSnake.addEventListener('click', () => resetBonusSnake());
    }

    const btnSkipSnake = root.querySelector('#btnSkipSnake');
    if (btnSkipSnake) {
      btnSkipSnake.addEventListener('click', () => skipBonusSnake());
    }

    const btnClosePipelineTutorial = root.querySelector('#btnClosePipelineTutorial');
    if (btnClosePipelineTutorial) {
      btnClosePipelineTutorial.addEventListener('click', () => {
        GAME_STATE.pipelineTutorialSeen = true;
        startLevelTimer(getCurrentChallenge());
        renderGame();
        showPanji('Oke, baru sekarang waktunya jalan. Baca kasus di panel atas, pilih kartu, lalu taruh dari slot kiri ke kanan.', 'happy');
      });
    }

    if (GAME_STATE.current && GAME_STATE.current.type === 'bonusSnake') {
      setTimeout(drawBonusSnake, 0);
    }

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
        clearTenderRushTimers();
        disableTenderRushKeyboard();
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
    GAME_STATE.pipelineCombo = Number(GAME_STATE.pipelineCombo || 0) + 1;
    applyLevelTimeBonus(2, 'Kartu benar: bonus waktu');

    if (GAME_STATE.pipelineCombo > 1 && GAME_STATE.pipelineCombo % 3 === 0) {
      applyLevelTimeBonus(4, 'Combo pipeline: bonus waktu');
      showToast('Combo ' + GAME_STATE.pipelineCombo + 'x! Waktu +4 detik', 'ok');
    }

    addLog('ok', `${item.label} benar`, getCorrectMessage(item.id));

    showToast(`Benar: ${item.label}`, 'ok');
    showPanji(getPanjiReactionMessage(item.id), 'happy');
    flashScreen('ok');
    popScore(slotEl || document.body, '+10', 'ok');

    const completed = GAME_STATE.progress === 100;

    renderGame();
    pulseSlot(slotIndex);

    if (completed) {
      clearLevelTimer();
      GAME_STATE.score += 20;
      GAME_STATE.correct += 1;
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
    GAME_STATE.pipelineCombo = 0;

    addLog('bad', 'Urutan belum tepat', message);

    showToast('Belum tepat. Risiko naik.', 'bad');
    showPanji(getPanjiWrongMessage(cardId, message), 'sad');
    flashScreen('bad');
    applyLevelTimePenalty(2, 'Pipeline salah');

    if (GAME_STATE.stage === 'result') return;

    renderGame();
    shakeCard(cardId);
  }

  function answerQuiz(selectedIndex, buttonEl) {
    clearPanjiIntroTimers();
    clearLevelTimer();

    const challenge = getCurrentChallenge();

    if (!challenge || challenge.type !== 'quiz') return;
    if (GAME_STATE.answered) return;

    GAME_STATE.selectedAnswer = selectedIndex;
    GAME_STATE.answered = true;

    const correctAnswerIndex = Number.isInteger(challenge.runtimeAnswer) ? challenge.runtimeAnswer : Number(challenge.answer || 0);

    if (selectedIndex === correctAnswerIndex) {
      GAME_STATE.score += 20;
      GAME_STATE.correct += 1;

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
      applyLevelTimePenalty(10, 'ABCD salah');

      if (GAME_STATE.stage === 'result') return;

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

    readStoredPlayer();
    ensureLeaderboardModal();
    fetchLeaderboard();
    initPanji(container);
    setTimeout(() => showReviewBubbleOnMenuOpen(), 1200);

    GAME_STATE.stage = 'ready';
    GAME_STATE.current = null;
    renderReadyScreen();
    showPanji('Halo, perkenalkan. Aku PANJI, Pengadaan Jitu. Sebelum main, isi dulu nama pemain dan instansi atau OPD kamu ya.', 'happy');

    setTimeout(() => {
      if (!destroyed) {
        openLeaderboardModal('player', true);
      }
    }, 650);

    leaderboardRefreshTimer = setInterval(() => {
      if (!destroyed && leaderboardModalEl && !leaderboardModalEl.classList.contains('ps-hidden')) {
        fetchLeaderboard();
      }
    }, 60000);

    return function destroy() {
      destroyed = true;

      clearAutoNextTimer();
      clearLevelTimer();
      clearTenderRushTimers();
      disableTenderRushKeyboard();
      clearBonusSnakeTimers();
      clearPanjiIntroTimers();
      clearPanjiTalkTimer();

      if (leaderboardRefreshTimer) {
        clearInterval(leaderboardRefreshTimer);
        leaderboardRefreshTimer = null;
      }

      if (reviewBubbleTimer) {
        clearTimeout(reviewBubbleTimer);
        reviewBubbleTimer = null;
      }

      if (reviewBubbleEl) {
        reviewBubbleEl.remove();
        reviewBubbleEl = null;
      }

      if (leaderboardModalEl) {
        leaderboardModalEl.remove();
        leaderboardModalEl = null;
      }

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
        if (typeof panjiEl._panjiAutoPositionDestroy === 'function') {
          panjiEl._panjiAutoPositionDestroy();
          panjiEl._panjiAutoPositionDestroy = null;
        }

        panjiEl.remove();
        panjiEl = null;
        panjiTextEl = null;
        panjiEmoteEl = null;
        panjiBubbleEl = null;
        panjiHintBtn = null;
        panjiMiniBtn = null;
        panjiCharacterBtn = null;
        panjiCloseBtn = null;
      }

      containerRef = null;
      root = null;
    };
  };
})();
