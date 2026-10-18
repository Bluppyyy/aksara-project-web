// Data contoh panel admin, isinya mengikuti desain Figma "Admin AKSARA".
// Dipakai saat backend belum tersambung (VITE_API_URL kosong).

// ---------- Beranda / Dashboard ----------
export const dashboardStats = [
  { key: 'resource', label: 'Total Resource', value: '2.845', unit: 'berkas', badge: '+12% bln ini', icon: 'lucide:book-open-text', tone: 'primary' },
  { key: 'mahasiswa', label: 'Mahasiswa Terdaftar', value: '8.120', unit: 'FIF & FTE', badge: 'Aktif', icon: 'lucide:users-round', tone: 'secondary' },
  { key: 'moderasi', label: 'Antrean Moderasi', value: '28', unit: 'antrean', badge: 'Perlu Tinjauan', icon: 'lucide:clipboard-clock', tone: 'warn', highlight: true },
  { key: 'laporan', label: 'Laporan Konten', value: '7', unit: 'isu hak cipta/link', badge: '2 Baru', icon: 'lucide:flag', tone: 'danger' },
  { key: 'publikasi', label: 'Terpublikasi', value: '2.610', unit: 'live', badge: '91.7% Rasio', icon: 'lucide:badge-check', tone: 'primary' },
  { key: 'unggahan', label: 'Unggahan Bulan Ini', value: '184', unit: 'karya baru', badge: 'Des 2024', icon: 'lucide:upload', tone: 'primary' },
];

// Tinggi batang (jumlah berkas) per bulan: [Laporan Proyek, Tugas Akhir, Paper Riset]
export const monthlyUploads = [
  { month: 'Jan', values: [105, 85, 65] },
  { month: 'Feb', values: [120, 100, 75] },
  { month: 'Mar', values: [140, 110, 85] },
  { month: 'Apr', values: [150, 125, 90] },
  { month: 'Mei', values: [170, 140, 100] },
  { month: 'Jun', values: [200, 185, 130] },
  { month: 'Jul', values: [160, 145, 110] },
  { month: 'Agu', values: [115, 95, 80] },
  { month: 'Sep', values: [155, 120, 95] },
  { month: 'Okt', values: [165, 135, 105] },
  { month: 'Nov', values: [185, 155, 115] },
  { month: 'Des', values: [192, 170, 125] },
];

export const categoryDistribution = [
  { label: 'Laporan Proyek Mata Kuliah', detail: '38% • 1.081 berkas', percent: 38, color: '#00478e' },
  { label: 'Modul & Catatan Kuliah', detail: '28% • 796 berkas', percent: 28, color: '#3f5f8e' },
  { label: 'Source Code & Dataset IoT', detail: '18% • 512 repositori', percent: 18, color: '#1f5faf' },
  { label: 'Skripsi & Tugas Akhir', detail: '16% • 456 naskah', percent: 16, color: '#9a4823' },
];

export const dashboardQueue = [
  { id: 'MOD-2024-114', title: 'Sistem Monitoring IoT NodeMCU & AWS - IF Tel-U', meta: 'PDF • 14.8 MB + Repo GitHub', author: 'Budi Santoso', authorMeta: "1301210156 • IF '21", category: 'Laporan Proyek', categoryTone: 'primary', date: 'Hari Ini, 09:42', status: 'Menunggu', type: 'proyek' },
  { id: 'MOD-2024-113', title: 'Catatan Kuliah Algoritma Pemrograman II (Lengkap)', meta: 'DOCX • 4.2 MB • 64 Halaman', author: 'Anindya Putri', authorMeta: "1302223041 • SE '22", category: 'Catatan Kuliah', categoryTone: 'secondary', date: 'Kemarin, 16:15', status: 'Menunggu', type: 'catatan' },
  { id: 'MOD-2024-112', title: 'Panduan & Laporan Magang Merdeka Batch 8 di Telkomsel', meta: 'Artikel Wawasan • 6 Menit Baca', author: 'Zulfan Falah', authorMeta: "1101204099 • TT '20", category: 'Wawasan Karir', categoryTone: 'primary', date: '18 Des 2024', status: 'Revisi Minor', type: 'wawasan' },
  { id: 'MOD-2024-111', title: 'Dataset NLP Sentimen Analisis Bahasa Sunda (25K Baris)', meta: 'CSV/JSON • 8.1 MB • CC-BY 4.0', author: 'Fikri Rahmat', authorMeta: "1301194012 • IF '19", category: 'Dataset Riset', categoryTone: 'warn', date: '17 Des 2024', status: 'Menunggu', type: 'source' },
];

export const dashboardReports = [
  { id: 'LAP-2024-092', date: '20 Des 2024', time: '14:10 WIB', title: 'Klaim Hak Cipta: Modul Praktikum Jaringan', priority: 'Urgen', text: 'Pelapor menyatakan materi modul disalin dari silabus resmi lab tanpa izin.', reporter: 'Pelapor: Lab FTE Tel-U', action: 'Tinjau Isu' },
  { id: 'LAP-2024-081', date: '18 Des 2024', time: '09:05 WIB', title: 'Tautan Rusak: Dataset Citra Satelit', priority: 'Biasa', text: 'File mirror Google Drive berstatus 404/Akses Ditolak sejak 2 hari lalu.', reporter: 'Pelapor: M. Farhan (TA)', action: 'Periksa Link' },
];

// ---------- Kelola Resource ----------
export const resourceStats = [
  { label: 'Total Resource', value: '2.845', note: '+38 minggu ini', noteIcon: 'lucide:trending-up', icon: 'lucide:folder-open', tone: 'primary' },
  { label: 'Menunggu Review', value: '24', note: 'Butuh moderasi', noteIcon: 'lucide:clock-3', icon: 'lucide:file-clock', tone: 'warn' },
  { label: 'Terpublikasi', value: '2.712', note: '95.3% rasio live', noteIcon: 'lucide:circle-check', icon: 'lucide:badge-check', tone: 'primary' },
  { label: 'Ditolak / Review Ulang', value: '109', note: 'Pelanggaran format', noteIcon: 'lucide:circle-x', icon: 'lucide:file-x-2', tone: 'danger' },
];

export const adminResources = [
  {
    id: 1, code: 'CS13B3', course: 'Internet of Things',
    title: 'Rancang Bangun Sistem Monitoring Kualitas Udara Berbasis IoT & Machine Learning',
    file: 'PDF (14.2 MB)', fileIcon: 'lucide:file-text', stats: ['1.240 pembaca', '4.9 (42)'],
    author: 'Budi Santoso', initials: 'BS', idLabel: 'NIM 1301210080', cohort: 'Angkatan 2021',
    category: 'Laporan Proyek', prodi: 'S1 Informatika', date: '18 Des 2024', time: '14:22 WIB', status: 'approved',
  },
  {
    id: 2, code: 'CS13B3', course: 'Internet of Things',
    title: 'Implementasi Protokol CoAP pada Jaringan Smart Energy Metering Gedung Kuliah',
    file: 'PDF (9.2 MB)', fileIcon: 'lucide:file-text', stats: ['842 pembaca'],
    author: 'Anindya Putri', initials: 'AP', idLabel: 'NIM 1301213044', cohort: 'Angkatan 2021',
    category: 'Tugas Akhir', prodi: 'S1 Informatika', date: '16 Des 2024', time: '09:15 WIB', status: 'approved',
  },
  {
    id: 3, code: 'SE2102', course: 'Konstruksi PL Lanjut',
    title: 'Source Code RESTful API Golang Microservices E-Commerce',
    file: 'ZIP + Git (18.6 MB)', fileIcon: 'lucide:code', warning: 'Verifikasi lisensi diperlukan',
    author: 'Fajar Nugraha', initials: 'FN', idLabel: 'NIM 1301204011', cohort: 'Angkatan 2020',
    category: 'Source Code', prodi: 'S1 Rekayasa PL', date: '15 Des 2024', time: '18:40 WIB', status: 'pending',
  },
  {
    id: 4, code: 'DS301', course: 'Pemrosesan Bahasa Alami',
    title: 'Dataset Audio Speech Recognition Aksara Sunda Wav2Vec',
    file: 'TAR.GZ (142.5 MB)', fileIcon: 'lucide:archive', stats: ['310 unduhan', 'DOI Terverifikasi'],
    author: 'Siti Rahmawati', initials: 'SR', idLabel: 'NIM 1301211109', cohort: 'Angkatan 2021',
    category: 'Jurnal & Data', prodi: 'S1 Sains Data', date: '14 Des 2024', time: '11:05 WIB', status: 'approved',
  },
  {
    id: 5, code: 'CS22A1', course: 'Jaringan Komputer',
    title: 'Laporan Praktikum Jaringan Komputer Wireshark Packet Analysis',
    rejectReason: 'Alasan penolakan: Format lembar pengesahan dan template Tel-U belum lengkap',
    author: 'Dimas Arya', initials: 'DA', idLabel: 'NIM 1301220199', cohort: 'Angkatan 2022',
    category: 'Catatan Kuliah', prodi: 'S1 Teknologi Inf.', date: '12 Des 2024', time: '08:20 WIB', status: 'rejected',
  },
  {
    id: 6, code: 'IF4001', course: 'Kapita Selekta Informatika',
    title: 'Bahan Perkuliahan & Bank Soal UTS Semester Ganjil 2024',
    hiddenNote: 'Disembunyikan oleh instruktur pengampu hingga jadwal ujian berakhir',
    author: 'Dr. Hendra Kusuma', initials: 'HK', idLabel: 'NIP 09760041', idHighlight: true, cohort: 'Dosen Tetap KK SI',
    category: 'Materi Kuliah', prodi: 'S1 Informatika', date: '10 Des 2024', time: '16:00 WIB', status: 'hidden',
  },
];

// ---------- Kelola Laporan ----------
export const reportStats = [
  { label: 'Total Laporan', value: '18', unit: 'Laporan Masuk', note: 'Semester Ganjil 2024/2025', noteIcon: 'lucide:chart-column', icon: 'lucide:flag', tone: 'primary' },
  { label: 'Laporan Baru', value: '5', unit: 'Perlu Respon < 24 Jam', note: 'Prioritas Tinggi: Kredensial & Hak Cipta', noteIcon: 'lucide:triangle-alert', icon: 'lucide:bell-ring', tone: 'danger' },
  { label: 'Dalam Peninjauan', value: '4', unit: 'Sedang Ditinjau Kurator', note: 'Rerata waktu: 1.4 Hari', noteIcon: 'lucide:clock-3', icon: 'lucide:hourglass', tone: 'warn' },
  { label: 'Laporan Selesai', value: '9', unit: 'Terselesaikan (50%)', note: 'Arsip audit diperbarui', noteIcon: 'lucide:badge-check', icon: 'lucide:circle-check', tone: 'ok' },
];

export const adminReports = [
  { id: 'LAP-2024-092', date: '20 Des 2024', time: '14:10 WIB', flag: 'URGENT', title: 'Modul Praktikum Jaringan Komputer Wireshark', meta: 'Berkas: PDF Modul Lab • 14.2 MB', icon: 'lucide:book-open-text', type: 'resource', reporter: 'Muhammad Farhan', reporterMeta: '1301210045 • S1 IF-45-02', reason: 'Pelanggaran Hak Cipta', reasonIcon: 'lucide:copyright', reasonText: 'Materi berlisensi lab internal disebarkan tanpa izin', status: 'baru' },
  { id: 'LAP-2024-089', date: '20 Des 2024', time: '11:45 WIB', flag: 'SECURITY', title: 'Source Code RESTful API Golang Microservices', meta: 'Repositori / ZIP Code • 3.8 MB', icon: 'lucide:code', type: 'resource', reporter: 'Siti Nurhaliza', reporterMeta: '1301213011 • S1 IF-45-08', reason: 'Kredensial & PII Bocor', reasonIcon: 'lucide:lock-keyhole-open', reasonText: 'API Key & DB Password tertulis di file .env', status: 'baru' },
  { id: 'LAP-2024-085', date: '19 Des 2024', time: '16:20 WIB', title: 'Panduan Lolos Magang Merdeka di Startup Unicorn', meta: 'Artikel Pengalaman • 8 Menit Baca', icon: 'lucide:user-round-pen', type: 'experience', reporter: 'Arya Pratama', reporterMeta: '1302210088 • S1 SE-45-01', reason: 'Pelanggaran NDA Mitra', reasonIcon: 'lucide:shield-alert', reasonText: 'Mencantumkan arsitektur internal perusahaan mitra', status: 'ditinjau' },
  { id: 'LAP-2024-081', date: '18 Des 2024', time: '09:05 WIB', title: 'Dataset Audio Speech Recognition Aksara Sunda', meta: 'Dataset / Audio TAR.GZ • 1.2 GB', icon: 'lucide:layout-grid', type: 'resource', reporter: 'Fikri Maulana', reporterMeta: '1301194012 • Alumni IF', reason: 'Tautan Berkas Rusak (404)', reasonIcon: 'lucide:link-2-off', reasonText: 'Akses Google Drive eksternal ditolak', status: 'ditinjau' },
  { id: 'LAP-2024-074', date: '15 Des 2024', time: '13:30 WIB', title: 'Laporan Capstone Smart IoT Greenhouse', meta: 'Dokumen Akhir • PDF 8.7 MB', icon: 'lucide:file-text', type: 'resource', reporter: 'Dosen KK Telematika', reporterMeta: 'NIDN 0418058201', reason: 'Plagiasi Tugas Akhir', reasonIcon: 'lucide:file-search', reasonText: 'Similarity Turnitin > 35% tanpa sitasi', status: 'selesai' },
  { id: 'LAP-2024-068', date: '12 Des 2024', time: '10:15 WIB', title: 'Tips Lolos IISMA UK S1 Informatika', meta: 'Artikel Pengalaman • 5 Menit Baca', icon: 'lucide:user-round-pen', type: 'experience', reporter: 'Zahra Amalia', reporterMeta: '1301202189 • Mahasiswa Aktif', reason: 'Tautan Eksternal Kadaluarsa', reasonIcon: 'lucide:link-2-off', reasonText: 'Lampiran silabus kursus host university tidak bisa dibuka', status: 'selesai' },
];

export const reportDetail = {
  id: 'LAP-2024-092',
  status: 'baru',
  priority: 'Tinggi',
  title: 'Laporan Dugaan Pelanggaran Hak Cipta & Materi Lab',
  submittedAt: '20 Desember 2024, 14:10 WIB',
  category: 'Pelanggaran IP / Silabus Tertutup',
  sla: '< 24 Jam (Tersisa 18 Jam)',
  reporter: {
    name: 'Muhammad Farhan',
    initials: 'MF',
    status: 'Mahasiswa Aktif',
    detail: 'S1 Informatika • Angkatan 2021 • Fakultas Informatika (FIF)',
    nim: '1301210045',
    email: 'mfarhan@student.telkomuniversity.ac.id',
    role: 'Peran Akademik Terkait: Asisten Praktikum Lab Jaringan Komputer',
  },
  classification: 'Pelanggaran Hak Cipta / Penggunaan Modul Lab Tanpa Izin',
  statement:
    'Berkas yang diunggah berisi soal tugas praktikum dan modul praktikum resmi Laboratorium Jaringan & Sistem Terdistribusi Fakultas Informatika tahun 2024 yang sifatnya tertutup dan dilindungi hak cipta laboratorium. Modul belum diizinkan untuk dipublikasikan secara umum di repositori publik.',
  evidence: { name: 'Perbandingan-Silabus-LabNet-2024-Versi-Final.pdf', size: '1.2 MB', format: 'Acrobat PDF', checksum: 'SHA-256 Valid' },
  timeline: [
    { actor: 'Admin Utama (Sistem Notifikasi)', time: '20 Des 2024, 14:10 WIB', text: 'Tiket aduan resmi dibuat oleh pelapor melalui formulir publik AKSARA dengan melampirkan berkas bukti. Status diset otomatis ke BARU.', tone: 'primary' },
    { actor: 'Auto-Scanner Hak Cipta (Sistem AI AKSARA)', time: '20 Des 2024, 14:15 WIB', text: 'Analisis Kemiripan Teks menunjukkan kemiripan 78.4% dengan indeks arsip tertutup modul internal Lab Netcentric 2023/2024.', tone: 'secondary' },
    { actor: 'Administrator Repositori (Anda)', time: 'Baru saja dibuka', text: 'Sedang meninjau berkas perbandingan dan modul yang dilaporkan sebelum tindakan moderasi diberlakukan.', tone: 'warn', italic: true },
  ],
  content: {
    title: 'Modul Praktikum & Laporan Jaringan Komputer Wireshark Packet Analysis',
    type: 'Resource Akademik (Modul)',
    course: 'CS22A1 - Jaringan Komputer',
    prodi: 'S1 Informatika (Smtr 4)',
    format: 'PDF • 4.2 MB (32 Hal)',
    contributor: 'Dimas',
    contributorNim: '1301220199',
    uploaded: 'Diunggah 12 Des 2024',
    resourceId: 5,
  },
};

// ---------- Moderasi Konten ----------
export const moderationTabs = [
  { key: 'all', label: 'Semua Konten', count: 28 },
  { key: 'pending', label: 'Menunggu Review', count: 12 },
  { key: 'approved', label: 'Disetujui', count: 14 },
  { key: 'rejected', label: 'Ditolak', count: 2 },
  { key: 'hidden', label: 'Disembunyikan', count: 0 },
];

export const moderationItems = [
  { id: 'MOD-2024-114', title: 'Implementasi Algoritma YOLOv8 untuk Deteksi Sampah Kampus', icon: 'lucide:file-text', file: 'PDF • 14.2 MB', tag: 'Pengolahan Citra Digital (CSG3H3)', type: 'resource', author: 'Zulfa Fawwaz', nim: '1301204010', prodi: 'S1 Informatika', category: 'Laporan Proyek', sub: 'Tingkat 3 (Semester 6)', date: '20 Des 2024', time: '09:30 WIB', status: 'pending' },
  { id: 'MOD-2024-110', title: 'Panduan Lolos Magang MSIB di Startup Unicorn', icon: 'lucide:newspaper', file: 'Artikel Naratif • 7 Menit Baca', tag: 'Karir & Profesional', type: 'experience', author: 'Zulfan Falah', nim: '1101204099', prodi: 'S1 Teknik Telekomunikasi', category: 'Pengalaman Magang', sub: 'MSIB Kampus Merdeka', date: '18 Des 2024', time: '14:15 WIB', status: 'approved' },
  { id: 'MOD-2024-107', title: 'Modul Praktikum Jaringan Komputer Wireshark', icon: 'lucide:flag', iconTone: 'danger', flag: '1 Laporan Hak Cipta', file: 'DOCX • 3.8 MB', tag: 'Jaringan Komputer (ITG2C3)', type: 'resource', author: 'Dimas Arya', nim: '1301220199', prodi: 'S1 Teknologi Informasi', category: 'Catatan Kuliah', sub: 'Praktikum Lab', date: '12 Des 2024', time: '11:05 WIB', status: 'clarify' },
  { id: 'MOD-2024-103', title: 'Source Code RESTful API Golang Microservices', icon: 'lucide:code', reason: 'Alasan: Terdeteksi kredensial API .env hardcoded', file: 'ZIP • 2.1 MB', type: 'resource', author: 'Fajar Nugraha', nim: '1301204011', prodi: 'S1 Rekayasa Perangkat Lunak', category: 'Source Code', sub: 'Arsitektur Backend', date: '15 Des 2024', time: '16:40 WIB', status: 'rejected' },
  { id: 'MOD-2024-101', title: 'Pengalaman Study Exchange IISMA di Inggris', icon: 'lucide:globe', file: 'Panduan & Esai • 12 Halaman', tag: 'Pertukaran Mahasiswa Internasional', type: 'experience', author: 'Siti Sarah', nim: '1301211109', prodi: 'S1 Informatika', category: 'Study Exchange', sub: 'IISMA Kemendikbudristek', date: '14 Des 2024', time: '10:12 WIB', status: 'approved' },
];

export const moderationDetail = {
  id: 'MOD-2024-114',
  status: 'pending',
  submittedAt: '20 Des 2024, 09:30 WIB',
  title: 'Implementasi Algoritma YOLOv8 untuk Deteksi Sampah Kampus',
  type: 'Resource Akademik',
  category: 'Laporan Proyek Visi Komputer',
  faculty: 'Fakultas Informatika, Telkom University',
  similarity: '8%',
  author: {
    name: 'Zulfa Fawwaz',
    initials: 'ZF',
    detail: 'NIM 1301204010 • S1 Informatika (Angkatan 2020)',
    email: 'zulfafawwaz@students.telkomuniversity.ac.id',
    advisor: 'Dr. Hendra Kusuma, M.T.',
    advisorGroup: 'KK Visi Komputer & Robotika',
  },
  license: 'CC BY-NC 4.0',
  abstract:
    'Laporan tugas besar Visi Komputer & Machine Learning beserta dataset citra 1.500 gambar beranotasi format YOLO dan skrip notebook training model. Telah diuji pada lingkungan kampus Telkom University dengan akurasi mAP50 91.4%. Arsitektur memanfaatkan deteksi waktu-nyata untuk memetakan volume tumpukan botol plastik, gelas kemasan, dan kardus guna integrasi smart-waste management.',
  keywords: ['YOLOv8', 'Deep Learning', 'Klasifikasi Sampah', 'Computer Vision', 'Smart Campus Tel-U'],
  files: [
    { name: 'Laporan_YOLOv8_Final.pdf', meta: '14.2 MB • Dokumen Lengkap', icon: 'lucide:file-text', action: 'Buka Pratinjau PDF', actionIcon: 'lucide:eye' },
    { name: 'training_yolov8.ipynb', meta: '2.8 MB • Google Colab Ready', icon: 'lucide:file-code-2', action: 'Unduh Skrip (.ipynb)', actionIcon: 'lucide:download' },
    { name: 'yolov8-campus-waste', meta: 'GitHub Repository Publik', icon: 'lucide:network', action: 'Kunjungi GitHub', actionIcon: 'lucide:external-link', tone: 'blue' },
  ],
  checklist: [
    { label: 'Bebas Data Sensitif / Rahasia', note: 'Tidak ada kunci API, credential, atau data pribadi civitas.' },
    { label: 'Kesesuaian Format & Template', note: 'Memenuhi kaidah layout standar Tel-U Open Library.' },
    { label: 'Orisinalitas Terverifikasi', note: 'Indeks Turnitin 8% (di bawah batas toleransi 20%).' },
  ],
  log: [
    { title: 'Pengajuan Diterima ke Antrean Moderasi', meta: '20 Des 2024, 09:30:14 WIB • Sistem Otomatis AKSARA' },
    { title: 'Pemindaian Turnitin Selesai', meta: '20 Des 2024, 09:33:02 WIB • Hasil: 8% Match (Pass)' },
    { title: 'Tinjauan Dibuka oleh Admin', meta: '20 Des 2024, 10:15:20 WIB • Admin Repositori Tel-U' },
  ],
};
