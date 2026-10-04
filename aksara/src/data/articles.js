// Data contoh halaman Wawasan, sesuai isi desain Figma.
import img1 from '../assets/wawasan/article-1.png';
import img2 from '../assets/wawasan/article-2.png';
import img3 from '../assets/wawasan/article-3.png';
import img4 from '../assets/wawasan/article-4.png';
import img5 from '../assets/wawasan/article-5.png';
import img6 from '../assets/wawasan/article-6.png';

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
