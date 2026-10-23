import { categoryKeyOf, prodiLabel, PRODI_KEY, SEMESTER_KEY } from './master';
// Mengubah bentuk data dari backend ke bentuk yang dipakai komponen frontend.
// Kalau backend menambah field (lihat dokumen review backend), cukup sesuaikan file ini.

const KNOWN_FORMATS = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'ZIP', 'JPG', 'JPEG', 'PNG'];

export function fileFormat(url = '') {
  if (!url) return '';
  const ext = url.split('?')[0].split('.').pop().toUpperCase();
  return KNOWN_FORMATS.includes(ext) ? ext : 'FILE';
}

/** true kalau teks berupa tautan http(s) yang valid */
export function isHttpUrl(text = '') {
  try {
    const u = new URL(String(text).trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Label tombol tautan eksternal sesuai jenis situsnya */
export function externalLinkLabel(url = '') {
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  })();
  if (/github\.com|gitlab\.com/.test(host)) return 'Source Code GitHub';
  if (/drive\.google\.com|docs\.google\.com/.test(host)) return 'Buka di Google Drive';
  if (/kaggle\.com|huggingface\.co/.test(host)) return 'Dataset';
  return 'Tautan Eksternal';
}

/**
 * Keterangan singkat pengguna seperti di Figma: "FIF '24 • Informatika".
 * Angkatan dibaca dari NIM Telkom University (lihat nimYear),
 * karena backend belum mengirim kolom angkatan di data penulis/pengunggah.
 * @param {{ nim?: string, prodi?: string, angkatan?: number|string }} person
 */
/**
 * Dua digit tahun masuk dari NIM Telkom University:
 *  - NIM 12 digit (format baru), mis. 1030124 00202 → digit ke-6 & 7 → '24
 *  - NIM 10 digit (format lama), mis. 1301210156   → digit ke-5 & 6 → '21
 */
function nimYear(nim) {
  if (nim.length === 12) return nim.slice(5, 7);
  if (nim.length === 10) return nim.slice(4, 6);
  return '';
}

export function personMeta(person) {
  if (!person) return 'FIF';
  const nim = String(person.nim || '').replace(/\D/g, '');
  const yy = person.angkatan ? String(person.angkatan).slice(-2) : nimYear(nim);
  const prodi = String(person.prodi || '').replace(/^S1\s+/i, '');
  return [yy ? `FIF '${yy}` : 'FIF', prodi].filter(Boolean).join(' • ');
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * resource backend → data kartu (ResourceCard / ResourceListItem).
 * Field backend: resource_id, judul, deskripsi, sumber, created_at, kategori{category_id,nama_kategori},
 * matkul_id, semester_id, prodi_id, fakultas_id, rating_rata_rata.
 * @param {object} r
 * @param {Record<string,{kode:string,nama:string,semester:any}>} [matkul] hasil matkulMap()
 */
/** Pemilik konten: backend terbaru mengirim "pengguna" ({ nama, nim, prodi }) */
export const ownerOf = (x) => x?.pengguna || x?.pengunggah || x?.penulis || x?.pelapor || null;

export function toResourceCard(r, matkul = {}) {
  const owner = ownerOf(r);
  const authorName = owner?.nama || 'Kontributor AKSARA';
  const mk =
    matkul[String(r.matkul_id)] ||
    (r.mata_kuliah
      ? { kode: r.mata_kuliah.kode_matkul, nama: r.mata_kuliah.nama_matkul, semester: r.semester_id }
      : undefined);
  const kategoriNama = r.kategori?.nama_kategori || (typeof r.kategori === 'string' ? r.kategori : '');
  const semesters = matkul[SEMESTER_KEY] || {};
  const prodis = matkul[PRODI_KEY] || {};
  const semester =
    semesters[String(r.semester_id)] ??
    semesters[String(mk?.semester)] ??
    semesterNumber(r.semester_id ?? mk?.semester);
  const prodi = prodis[String(r.prodi_id)] || prodis[String(mk?.prodiId)] || '';
  const avg = r.rating_rata_rata ?? r.rating_rata;
  // Kategori dari database disimpan sebagai "k:<category_id>" supaya filter & label sama persis dengan data backend;
  // "thumb" tetap memakai kunci frontend terdekat untuk ikon/gambar.
  const categoryId = r.kategori?.category_id ?? r.category_id;
  return {
    id: r.resource_id,
    category: categoryId ? `k:${categoryId}` : 'lainnya',
    thumb: categoryKeyOf(kategoriNama),
    categoryLabel: kategoriNama,
    format: r.format_file && r.format_file !== 'LINK' ? r.format_file : fileFormat(r.link_file),
    course: mk ? `${mk.kode}  ${mk.nama}` : (!isHttpUrl(r.sumber) && r.sumber) || 'Resource Akademik',
    title: r.judul,
    description: r.deskripsi,
    tags: ['FIF', semester ? `Semester ${semester}` : null, kategoriNama || null].filter(Boolean),
    author: {
      initials: initials(authorName),
      name: authorName,
      meta: owner ? personMeta(owner) : personMeta({ prodi }),
    },
    rating: avg != null ? Number(avg).toFixed(1) : '–',
    downloads: r.jumlah_unduhan ?? '–',
    views: r.jumlah_dilihat ?? null,
    bookmarked: Boolean(r.is_bookmarked),
    ownerId: r.user_id ?? null, // untuk menghitung kontribusi milik user yang login
    ownerNim: owner?.nim || '',
    thumbnail: r.thumbnail || r.link_thumbnail || null,
    // Dipakai filter sisi klien (lihat utils/filters.js)
    fakultas: '',
    prodi: prodi || (owner?.prodi ? prodiLabel(owner.prodi) : ''),
    semester,
    matkul: mk?.nama || '',
    year: r.created_at ? new Date(r.created_at).getFullYear() : null,
    createdAt: r.created_at || null,
  };
}

/** semester_id dari database → angka semester (kalau berupa angka 1–14) */
function semesterNumber(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 14 ? n : null;
}

/** rating_review backend → data ulasan (ReviewsSection) */
export function toReview(r) {
  const name = r.pengguna?.nama || 'Mahasiswa';
  return {
    id: r.rating_id,
    userId: r.user_id ?? null,
    initials: initials(name),
    name,
    meta: r.pengguna ? personMeta(r.pengguna) : '',
    rating: Number(r.nilai_rating),
    text: r.isi_review || '',
    time: formatDate(r.created_at),
    helpful: r.jumlah_membantu || 0,
  };
}

/** resource + ulasan backend → data halaman detail */
export function toResourceDetail(r, reviews = [], matkul = {}) {
  const card = toResourceCard(r, matkul);
  const avg = reviews.length ? reviews.reduce((s, x) => s + x.rating, 0) / reviews.length : null;
  return {
    id: card.id,
    title: card.title,
    fileInfo: card.categoryLabel || 'Dokumen',
    hasFile: r.has_file ?? true, // tautan file diminta saat tombol Unduh diklik (GET /resource/:id/file)
    author: card.author,
    date: formatDate(r.created_at),
    downloads: r.jumlah_unduhan ?? '–',
    views: r.jumlah_dilihat ?? '–',
    rating: avg ? avg.toFixed(1) : '–',
    reviewCount: reviews.length,
    abstract: (r.deskripsi || '').split(/\n{2,}/).filter(Boolean),
    keywords: r.kata_kunci || [],
    cover: {
      faculty: 'FAKULTAS INFORMATIKA (FIF)',
      kicker: (card.categoryLabel || 'Dokumen Akademik').toUpperCase(),
      title: card.title,
      purpose: isHttpUrl(r.sumber) ? '' : r.sumber || '',
      author: card.author.name,
      nim: ownerOf(r)?.nim || '',
      place: 'Telkom University',
    },
    totalPages: r.jumlah_halaman || 1,
    reviews,
    // Tautan GitHub / Drive / dataset yang diisi pengunggah di form Unggah (disimpan backend di kolom "sumber")
    externalUrl: isHttpUrl(r.sumber) ? r.sumber.trim() : null,
    meta: {
      course: card.course,
      courseInfo: [card.prodi, card.semester ? `Semester ${card.semester}` : ''].filter(Boolean).join(' • '),
      lecturer: r.dosen || '—',
      lecturerInfo: '',
      semester: card.semester ? String(card.semester) : '—',
      year: r.tahun_akademik || (card.year ? String(card.year) : '—'),
      license: r.lisensi || '—',
      licenseNote: '',
      doi: r.doi || '',
    },
    related: [],
  };
}
