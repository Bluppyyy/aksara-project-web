// Data contoh sesuai isi desain Figma. Ganti dengan data dari API nanti.

export const CATEGORIES = {
  tugas: 'Tugas Kuliah',
  riset: 'Riset & Publikasi Paper',
  magang: 'Laporan Magang & PKL',
  bank: 'Bank Soal',
};

const AUTHOR_ZF = { initials: 'ZF', name: 'Zulfan Falah', meta: "RPL '24 • Informatika" };
const AUTHOR_DR = { initials: 'DR', name: 'Daffa Rizky', meta: "FIF '21 • Informatika" };

const TEMPLATES = {
  astar: {
    category: 'tugas',
    course: 'CSI2A3 Kecerdasan Buatan',
    title: 'Implementasi Algoritma A* Pathfinding pada Robot Bergerak',
    description:
      'Laporan tugas besar dilengkapi analisis kompleksitas waktu Big-O, benchmarking, dan evaluasi jalur pada berbagai skenario.',
    tags: ['Informatika', 'S1 RPL', 'Semester 3'],
    author: AUTHOR_ZF,
  },
  sentimen: {
    category: 'riset',
    course: 'CCK420 Tugas Akhir',
    title: 'Analisis Sentimen Twitter Menggunakan IndoBERT dan LSTM',
    description:
      'Eksperimen komparasi akurasi arsitektur transformers IndoBERT dengan baseline LSTM pada dataset tweet berbahasa Indonesia.',
    tags: ['Fakultas', 'Prodi', 'Semester'],
    author: AUTHOR_DR,
  },
  goto: {
    category: 'magang',
    course: 'KODE  NamaMata Kuliah',
    title: 'Laporan Magang: Backend Engineer Microservices di GoTo',
    description:
      'Dokumentasi arsitektur Kafka event-driven, optimasi indexing PostgreSQL transaksi, dan monitoring layanan.',
    tags: ['Fakultas', 'Prodi', 'Semester'],
    author: AUTHOR_DR,
  },
};

const LOREM = {
  course: 'KODE  NamaMata Kuliah',
  title: 'Lorem Ipsum initnya disini judul dokumennya apa gitulah panjang sekali',
  description: 'Lorem Ipsum basaically disini penjelasan dokumennya ya gitudeh kalo panjang ti...panjang ti...panjang ti...',
  tags: ['Fakultas', 'Prodi', 'Semester'],
  author: AUTHOR_DR,
};

TEMPLATES.elisitasi = {
  ...LOREM,
  category: 'tugas',
  course: 'CCXZFP User Experience',
  title: 'Project 2 : Tugas Membuat Laporan Elisitasi untuk Aplikasi Mobile',
};
TEMPLATES.uts = {
  ...LOREM,
  category: 'bank',
  course: 'BK125 Basis Data',
  title: '14/02/2026 Soal UTS Basis Data Latihan',
};
TEMPLATES.lorem = { ...LOREM, category: 'magang' };
TEMPLATES.loremTugas = {
  ...LOREM,
  category: 'tugas',
  title: 'Lorem Ipsum initnya disini judul disini kaya lreom akkbaegkaegakegaekg',
};

let nextId = 1;
const make = (key, overrides = {}) => ({
  id: nextId++,
  format: 'PDF',
  rating: 4.9,
  downloads: '1.2k',
  bookmarked: false,
  ...TEMPLATES[key],
  ...overrides,
});

const resultRow = () => [
  make('astar'),
  make('astar'),
  make('sentimen', { bookmarked: true }),
  make('goto'),
];

export const relevantResources = [...resultRow(), ...resultRow(), ...resultRow()];

export const recentlyViewed = [make('astar'), make('astar'), make('astar')];

export const facultyResearch = [
  make('sentimen'),
  make('goto'),
  make('astar'),
  make('sentimen'),
];

export const favoriteCourses = [
  make('sentimen'),
  make('sentimen'),
  make('sentimen'),
  make('sentimen'),
];

export const trending = [make('goto'), make('sentimen'), make('astar'), make('goto')];

// Halaman hasil eksplorasi (setelah search)
const searchRow = () => [make('astar'), make('sentimen', { bookmarked: true }), make('goto')];
export const searchResults = [
  ...searchRow(),
  ...searchRow(),
  ...searchRow(),
  make('elisitasi'),
  make('uts', { bookmarked: true }),
  make('lorem'),
];

// Halaman Koleksi Saya (semua sudah di-bookmark)
export const bookmarkedResources = Array.from({ length: 6 }, () => make('loremTugas', { bookmarked: true }));
