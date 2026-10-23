// AKSARA khusus Fakultas Informatika (FIF) Telkom University.
// Semua pilihan fakultas/prodi di aplikasi diambil dari sini.
export const FAKULTAS = 'Fakultas Informatika (FIF)';
export const FAKULTAS_SHORT = 'FIF';

export const PRODI_FIF = ['S1 Informatika', 'S1 Rekayasa Perangkat Lunak', 'S1 Teknologi Informasi', 'S1 Sains Data'];

// Kode prodi pada kode kelas Telkom University (contoh: IF-48-12)
export const KODE_PRODI = {
  'S1 Informatika': 'IF',
  'S1 Rekayasa Perangkat Lunak': 'SE',
  'S1 Teknologi Informasi': 'IT',
  'S1 Sains Data': 'DS',
};

// Kode angkatan: 2024 → 48, 2025 → 49, dst. (tahun masuk − 1976)
export const kodeAngkatan = (tahun) => (tahun ? String(Number(tahun) - 1976) : '');

// Pilihan tahun masuk: 8 angkatan terakhir (mahasiswa aktif S1)
export const ANGKATAN = Array.from({ length: 8 }, (_, i) => String(new Date().getFullYear() - i));
