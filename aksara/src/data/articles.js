// Data contoh halaman Wawasan, sesuai isi desain Figma.
import img1 from '../assets/wawasan/article-1.png';
import img2 from '../assets/wawasan/article-2.png';
import img3 from '../assets/wawasan/article-3.png';
import img4 from '../assets/wawasan/article-4.png';
import img5 from '../assets/wawasan/article-5.png';
import img6 from '../assets/wawasan/article-6.png';
import heroImg from '../assets/wawasan/detail-hero.jpg';

export const articles = [
  {
    id: 1,
    image: img1,
    label: 'TIPS BEASISWA',
    labelColor: '#5c2003',
    title: 'Trik Menembus IISMA 2025: Strategi Esai, TOEFL ITP 600+, & Wawancara Final',
    excerpt: 'Pengalaman nyata awardee University of Glasgow merangkum formulasi esai kontribusi yang memikat…',
    author: { initials: 'SP', name: 'Siti Putri', bg: '#d2e4ff', color: '#001c37' },
    readTime: '5 min read',
  },
  {
    id: 2,
    image: img2,
    label: 'KARIR & ALUMNI',
    labelColor: '#1261a2',
    title: 'Membangun Portofolio UI/UX yang Dilirik Startup Unicorn Tanpa Pengalaman Kerja',
    excerpt: 'Bagaimana menyusun studi kasus problem-solving, usability metrics, dan design system showcase yang…',
    author: { initials: 'RK', name: 'Reza Kurniawan', bg: '#d2e4ff', color: '#001c37' },
    readTime: '6 min read',
  },
  {
    id: 3,
    image: img3,
    label: 'PENGALAMAN MAGANG',
    labelColor: '#00355f',
    title: 'Lolos Coding Interview FAANG/Top Tech: Roadmap Belajar LeetCode & DSA 3 Bulan',
    excerpt: 'Pola algoritma yang paling sering muncul di tes live-coding teknikal internship, dari BFS/DFS hingga Dynamic Programming.',
    author: { initials: 'DR', name: 'Daffa Rizky', bg: '#7ab7fe', color: '#00477c' },
    readTime: '8 min read',
  },
  {
    id: 4,
    image: img4,
    label: 'TIPS RISET',
    labelColor: '#0f4c81',
    title: 'Panduan Menembus Konferensi Internasional IEEE dari Tugas Akhir S1',
    excerpt: 'Langkah terstruktur menyusun paper berbasis LaTeX, memilih call-for-papers yang tepat, dan mengatasi revisi…',
    author: { initials: 'FA', name: 'Fikri Alamsyah', bg: '#e0e2e9', color: '#42474f' },
    readTime: '10 min read',
  },
  {
    id: 5,
    image: img5,
    label: 'KEHIDUPAN KAMPUS',
    labelColor: '#5c2003',
    title: 'Manajemen Waktu Mahasiswa Tingkat 3: Kuliah, Aslab, Himpunan, dan Side Project',
    excerpt: 'Strategi praktis mengatur prioritas dengan sistem Time Boxing agar IPK tetap aman dan kesehatan mental…',
    author: { initials: 'RM', name: 'Rina Melati', bg: '#ffdbce', color: '#370e00' },
    readTime: '4 min read',
  },
  {
    id: 6,
    image: img6,
    label: 'TIPS BEASISWA & LOMBA',
    labelColor: '#7a3617',
    title: 'Strategi Lolos Pendanaan PKM-KC hingga Tembus PIMNAS: Dari Ide ke Prototype',
    excerpt: 'Rangkuman formulasi proposal inovasi teknologi, pembagian peran tim lintas jurusan, dan tips simulasi…',
    author: { initials: 'HA', name: 'Haikal Akbar', bg: '#9fcaff', color: '#001c37' },
    readTime: '7 min read',
  },
];

// Detail tulisan (halaman Detail Wawasan) — isi sesuai Figma

export const articleDetail = {
  id: 'msib-telkomsel',
  readTime: '6 Menit Baca',
  title: 'Panduan Lengkap Lolos Seleksi Magang Merdeka (MSIB) Batch 8 di Telkomsel',
  subtitle:
    'Catatan retrospektif, bedah berkas portofolio berstandar industri, serta strategi taktis menghadapi wawancara studi kasus teknis dan budaya korporat BUMN Telekomunikasi.',
  date: '18 Des 2024',
  reads: '1.240',
  rating: 4.9,
  reviewCount: 42,
  image: heroImg,
  caption: 'Dokumentasi: Ruang kerja kolaboratif dan suasana orientasi hari pertama mahasiswa magang di Innovation Lab Telkomsel Smart Office.',
  author: { initials: 'ZP', name: 'Zulfan Falah', meta: "FIF '21 • RPL" },
  keywords: ['Internet of Things', 'Air Quality Index', 'ESP32', 'Random Forest', 'AWS Cloud'],
  // Blok isi artikel. Teks dengan `code`, *miring* didukung oleh renderer sederhana di halaman.
  blocks: [
    { type: 'lead', text: 'Bagi mahasiswa Telkom University, kabar dibukanya pendaftaran Magang dan Studi Independen Bersertifikat (MSIB) selalu membawa denyut antusiasme sekaligus ujian mental tersendiri. Pada Batch 8 lalu, kompetisi untuk menempati posisi *Software Engineer Intern* di PT Telkomsel menembus angka lebih dari 15.000 pendaftar nasional. Dengan kuota per divisi yang dirancang sangat selektif, mengandalkan Indeks Prestasi Kumulatif (IPK) tinggi saja terbukti tidak mencukupi tanpa artikulasi portofolio yang dapat diuji nyata oleh tim rekruter industri.' },
    { type: 'p', text: 'Dalam tulisan retrospektif ini, saya merangkum seluruh catatan perjalanan sejak persiapan berkas, bedah filter sistem pelacak pelamar, hingga taktik wawancara berbasis budaya kerja BUMN yang mengantarkan saya lolos di unit Core Platform.' },
    { type: 'h2', text: '1. Persiapan Dokumen CV & Portfolio ATS-Friendly' },
    { type: 'p', text: 'Sistem seleksi awal di perusahaan telekomunikasi berskala besar menerapkan sistem *Applicant Tracking System (ATS)* yang ketat. Mesin menyaring kata kunci teknis yang selaras dengan tech stack mereka, mulai dari `RESTful API`, `CI/CD Pipelines`, hingga `Microservices` dan arsitektur awan (GCP).' },
    { type: 'quote', text: '“Jangan pernah mengunggah portofolio yang hanya berisi daftar tautan GitHub mati. Rekruter industri mencari quantitive impact — seberapa besar efisiensi komputasi atau reduksi latensi yang berhasil kamu capai pada tugas besar kampus.”' },
    { type: 'h2', text: '2. Menaklukkan Asesmen Teknis & Algoritma' },
    { type: 'p', text: 'Tahap coding assessment dilaksanakan melalui platform HackerRank dengan durasi 90 menit untuk memecahkan tiga studi kasus algoritma serta serangkaian pertanyaan konsep rekayasa perangkat lunak.' },
    { type: 'h2', text: '3. Tahap Wawancara Pengguna & Keselarasan Budaya' },
    { type: 'p', text: 'Wawancara dengan Engineering Manager tidak ditujukan untuk menjebak kandidat dengan detail sintaksis teoretis, melainkan menilai kerangka penalaran logis saat berhadapan dengan masalah nyata. Susun narasi menggunakan struktur STAR (*Situation, Task, Action, Result*).' },
    { type: 'h2', text: 'Refleksi & Langkah Selanjutnya' },
    { type: 'p', text: 'Persaingan magang industri bukanlah perlombaan siapa yang paling pintar di kelas, melainkan siapa yang paling persisten menyiapkan rekam jejak karyanya secara jujur, terukur, dan berdampak. Mulai audit portofolio Anda hari ini, dan jangan ragu berdiskusi dengan kakak tingkat serta pembimbing akademik di kampus.' },
  ],
};
