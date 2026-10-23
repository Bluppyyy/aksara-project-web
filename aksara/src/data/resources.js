// Data contoh sesuai isi desain Figma. Ganti dengan data dari API nanti.

export const CATEGORIES = {
  tugas: 'Tugas Kuliah',
  project: 'Project',
  skripsi: 'Skripsi & Tugas Akhir',
  ujian: 'Ujian & Latihan Soal',
  riset: 'Riset & Publikasi Paper',
  magang: 'Laporan Magang & PKL',
  bank: 'Ujian & Latihan Soal',
  lainnya: 'Lainnya',
};

// Kategori cepat di bawah search bar (urutan sesuai Figma). key = null → "Semua"
export const QUICK_CATEGORIES = [
  { key: null, label: 'Semua' },
  { key: 'tugas', label: 'Tugas Kuliah' },
  { key: 'project', label: 'Project' },
  { key: 'skripsi', label: 'Skripsi & Tugas Akhir' },
  { key: 'ujian', label: 'Ujian & Latihan Soal' },
  { key: 'riset', label: 'Riset & Publikasi Paper' },
  { key: 'lainnya', label: 'Lainnya' },
];

// Foto sampul kartu. Export gambar dari Figma ke src/assets/thumbs/ (lihat README di folder itu).
// File yang belum ada otomatis jatuh ke gradient biru, jadi build tidak error.
const THUMBS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/thumbs/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })
  ).map(([path, url]) => [
    path
      .split('/')
      .pop()
      .replace(/\.\w+$/, ''),
    url,
  ])
);

// Foto default per kategori (dipakai halaman hasil pencarian, koleksi, dll.)
const CATEGORY_FALLBACK = {
  tugas: 'foto-1',
  project: 'foto-2',
  skripsi: 'foto-4',
  ujian: 'foto-5',
  bank: 'foto-5',
  riset: 'foto-3',
  magang: 'foto-4',
  lainnya: 'foto-6',
};

/** Cari foto sampul: nama spesifik dulu, lalu foto default kategori. */
export function thumbnailFor(resource) {
  // thumbnail: false → sengaja tanpa foto (contoh: Koleksi Saya di Figma memakai gradient)
  if (resource.thumbnail === false) return null;
  return (
    resource.thumbnail ||
    THUMBS[resource.thumb] ||
    THUMBS[resource.category] ||
    THUMBS[CATEGORY_FALLBACK[resource.category]] ||
    THUMBS[CATEGORY_FALLBACK[resource.thumb]] ||
    null
  );
}

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
    fakultas: 'Fakultas Informatika (FIF)',
    prodi: 'S1 Rekayasa Perangkat Lunak',
    semester: 3,
    matkul: 'Kecerdasan Buatan',
    year: 2025,
  },
  sentimen: {
    category: 'riset',
    course: 'CCK420 Tugas Akhir',
    title: 'Analisis Sentimen Twitter Menggunakan IndoBERT dan LSTM',
    description:
      'Eksperimen komparasi akurasi arsitektur transformers IndoBERT dengan baseline LSTM pada dataset tweet berbahasa Indonesia.',
    tags: ['Fakultas', 'Prodi', 'Semester'],
    author: AUTHOR_DR,
    fakultas: 'Fakultas Informatika (FIF)',
    prodi: 'S1 Informatika',
    semester: 7,
    matkul: 'Tugas Akhir',
    year: 2024,
  },
  goto: {
    category: 'skripsi',
    course: 'KODE  NamaMata Kuliah',
    title: 'Laporan Magang: Backend Engineer Microservices di GoTo',
    description:
      'Dokumentasi arsitektur Kafka event-driven, optimasi indexing PostgreSQL transaksi, dan monitoring layanan.',
    tags: ['Fakultas', 'Prodi', 'Semester'],
    author: AUTHOR_DR,
    fakultas: 'Fakultas Informatika (FIF)',
    prodi: 'S1 Informatika',
    semester: 7,
    matkul: 'Basis Data',
    year: 2023,
  },
};

const LOREM = {
  course: 'KODE  NamaMata Kuliah',
  title: 'Lorem Ipsum initnya disini judul dokumennya apa gitulah panjang sekali',
  description:
    'Lorem Ipsum basaically disini penjelasan dokumennya ya gitudeh kalo panjang ti...panjang ti...panjang ti...',
  tags: ['Fakultas', 'Prodi', 'Semester'],
  author: AUTHOR_DR,
};

TEMPLATES.elisitasi = {
  ...LOREM,
  category: 'tugas',
  course: 'CCXZFP User Experience',
  title: 'Project 2 : Tugas Membuat Laporan Elisitasi untuk Aplikasi Mobile',
  fakultas: 'Fakultas Informatika (FIF)',
  prodi: 'S1 Rekayasa Perangkat Lunak',
  semester: 5,
  matkul: 'User Experience',
  year: 2026,
  rating: 4.7,
  downloads: '860',
};
TEMPLATES.uts = {
  ...LOREM,
  category: 'ujian',
  course: 'BK125 Basis Data',
  title: '14/02/2026 Soal UTS Basis Data Latihan',
  fakultas: 'Fakultas Informatika (FIF)',
  prodi: 'S1 Informatika',
  semester: 3,
  matkul: 'Basis Data',
  year: 2026,
  rating: 4.6,
  downloads: '2.1k',
};
TEMPLATES.lorem = {
  ...LOREM,
  category: 'magang',
  fakultas: 'Fakultas Informatika (FIF)',
  prodi: 'S1 Teknologi Informasi',
  semester: 6,
  year: 2022,
  rating: 4.5,
  downloads: '640',
};
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

// Foto sampul mengikuti urutan di Figma: baris 1 & 3 pakai foto 1–4, baris 2 pakai foto 5–8
const resultRow = (a, b, c, d) => [
  make('astar', { thumb: `foto-${a}` }),
  make('astar', { thumb: `foto-${b}` }),
  make('sentimen', { bookmarked: true, thumb: `foto-${c}` }),
  make('goto', { thumb: `foto-${d}` }),
];

export const relevantResources = [...resultRow(1, 2, 3, 4), ...resultRow(5, 6, 7, 8), ...resultRow(1, 2, 3, 4)];

// Deskripsi lebih panjang (2 baris) seperti di Figma
const LONG_ASTAR =
  'Laporan tugas besar dilengkapi analisis kompleksitas waktu Big-O, benchmarking, dan evaluasi jalur pada berbagai skenario. Dilengkapi source code, dataset peta uji, dan perbandingan dengan algoritma Dijkstra serta Greedy Best-First Search.';
export const recentlyViewed = [5, 6, 7].map((n) => make('astar', { thumb: `foto-${n}`, description: LONG_ASTAR }));

export const facultyResearch = [
  make('sentimen', { thumb: 'foto-8' }),
  make('goto', { thumb: 'foto-1' }),
  make('astar', { thumb: 'foto-2' }),
  make('sentimen', { thumb: 'foto-3' }),
];

export const favoriteCourses = [4, 5, 6, 7].map((n) => make('sentimen', { thumb: `foto-${n}` }));

export const trending = [
  make('goto', { thumb: 'foto-8' }),
  make('sentimen', { thumb: 'foto-1' }),
  make('astar', { thumb: 'foto-2' }),
  make('goto', { thumb: 'foto-3' }),
];

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
export const bookmarkedResources = Array.from({ length: 6 }, () =>
  make('loremTugas', { bookmarked: true, thumbnail: false })
);
