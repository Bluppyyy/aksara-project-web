// Logika filter & urutan hasil eksplorasi (FR-EXP-01, FR-EXP-02, FR-EXP-03).
// Filter disimpan di URL (?q=&kategori=&fakultas=…) supaya bisa dibagikan, di-refresh,
// dan dibawa dari halaman Eksplorasi ke halaman Hasil.

export const CATEGORY_KEYS = ['tugas', 'project', 'skripsi', 'ujian', 'riset', 'magang', 'lainnya'];

/** URLSearchParams → objek filter */
export function readFilters(params) {
  const list = (k) =>
    (params.get(k) || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  const range = (k, def) => {
    const [a, b] = (params.get(k) || '').split('-').map(Number);
    return [Number.isFinite(a) && a ? a : def[0], Number.isFinite(b) && b ? b : def[1]];
  };
  return {
    q: params.get('q') || '',
    kategori: list('kategori'),
    fakultas: params.get('fakultas') || '',
    prodi: params.get('prodi') || '',
    semester: list('semester').map(Number).filter(Boolean),
    matkul: list('matkul'),
    format: list('format').map((s) => s.toUpperCase()),
    tahun: range('tahun', [2010, 2026]),
    rating: range('rating', [1, 5]),
    urut: params.get('urut') || '',
  };
}

/** objek filter → query string (nilai default tidak ditulis) */
export function writeFilters(f) {
  const out = {};
  if (f.q) out.q = f.q;
  if (f.kategori?.length) out.kategori = f.kategori.join(',');
  if (f.fakultas) out.fakultas = f.fakultas;
  if (f.prodi) out.prodi = f.prodi;
  if (f.semester?.length) out.semester = f.semester.join(',');
  if (f.matkul?.length) out.matkul = f.matkul.join(',');
  if (f.format?.length) out.format = f.format.join(',');
  if (f.tahun && (f.tahun[0] !== 2010 || f.tahun[1] !== 2026)) out.tahun = f.tahun.join('-');
  if (f.rating && (f.rating[0] !== 1 || f.rating[1] !== 5)) out.rating = f.rating.join('-');
  if (f.urut) out.urut = f.urut;
  return out;
}

export function countActive(f) {
  return (
    f.kategori.length +
    (f.fakultas ? 1 : 0) +
    (f.prodi ? 1 : 0) +
    f.semester.length +
    f.matkul.length +
    f.format.length +
    (f.tahun[0] !== 2010 || f.tahun[1] !== 2026 ? 1 : 0) +
    (f.rating[0] !== 1 || f.rating[1] !== 5 ? 1 : 0)
  );
}

const norm = (s = '') => String(s).toLowerCase();

/** Saring daftar resource di sisi klien. Field yang tidak tersedia pada data tidak ikut menyaring. */
export function applyFilters(items, f) {
  const q = norm(f.q).trim();
  return items.filter((r) => {
    if (q && !norm(`${r.title} ${r.description} ${r.course}`).includes(q)) return false;
    if (f.kategori.length && !f.kategori.includes(r.category)) return false;
    if (f.fakultas && r.fakultas && r.fakultas !== f.fakultas) return false;
    if (f.prodi && r.prodi && r.prodi !== f.prodi) return false;
    if (f.semester.length && r.semester && !f.semester.includes(Number(r.semester))) return false;
    if (f.matkul.length && r.matkul && !f.matkul.some((m) => norm(r.matkul).includes(norm(m)))) return false;
    if (f.format.length && r.format && !f.format.includes(String(r.format).toUpperCase())) return false;
    if (r.year && (r.year < f.tahun[0] || r.year > f.tahun[1])) return false;
    const rating = Number(r.rating);
    if (Number.isFinite(rating) && (rating < f.rating[0] || rating > f.rating[1])) return false;
    return true;
  });
}

const downloadsNum = (d) => {
  const s = String(d || '0').toLowerCase();
  return s.endsWith('k') ? parseFloat(s) * 1000 : parseFloat(s) || 0;
};

export function sortResources(items, sort) {
  const list = [...items];
  const time = (r) => (r.createdAt ? new Date(r.createdAt).getTime() : (r.year || 0) * 1e10);
  if (sort === 'Terbaru') return list.sort((a, b) => time(b) - time(a) || (b.id > a.id ? 1 : -1));
  if (sort === 'Terlama') return list.sort((a, b) => time(a) - time(b) || (a.id > b.id ? 1 : -1));
  if (sort === 'Rating Tertinggi') return list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
  if (sort === 'Paling Banyak Diunduh')
    return list.sort((a, b) => downloadsNum(b.downloads) - downloadsNum(a.downloads));
  return list; // Paling Relevan = urutan dari server / pencarian
}
