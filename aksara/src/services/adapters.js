// Mengubah bentuk data dari backend ke bentuk yang dipakai komponen frontend.
// Kalau backend menambah field (lihat dokumen review backend), cukup sesuaikan file ini.

const KNOWN_FORMATS = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'ZIP', 'JPG', 'JPEG', 'PNG'];

export function fileFormat(url = '') {
  const ext = url.split('?')[0].split('.').pop().toUpperCase();
  return KNOWN_FORMATS.includes(ext) ? ext : 'FILE';
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

/** resource backend → data kartu (ResourceCard / ResourceListItem) */
export function toResourceCard(r) {
  const authorName = r.pengunggah?.nama || 'Kontributor AKSARA';
  return {
    id: r.resource_id,
    category: r.kategori || 'tugas',
    format: fileFormat(r.link_file),
    course: r.mata_kuliah ? `${r.mata_kuliah.kode}  ${r.mata_kuliah.nama}` : r.sumber || 'Resource Akademik',
    title: r.judul,
    description: r.deskripsi,
    tags: [r.fakultas, r.prodi, r.semester ? `Semester ${r.semester}` : null].filter(Boolean),
    author: { initials: initials(authorName), name: authorName, meta: r.pengunggah?.angkatan || '' },
    rating: r.rating_rata ?? '–',
    downloads: r.jumlah_unduhan ?? '–',
    bookmarked: Boolean(r.is_bookmarked),
    linkFile: r.link_file,
  };
}

/** rating_review backend → data ulasan (ReviewsSection) */
export function toReview(r) {
  const name = r.pengguna?.nama || 'Mahasiswa';
  return {
    id: r.rating_id,
    initials: initials(name),
    name,
    meta: r.pengguna?.prodi || '',
    rating: Number(r.nilai_rating),
    text: r.isi_review || '',
    time: formatDate(r.created_at),
    helpful: r.jumlah_membantu || 0,
  };
}

/** resource + ulasan backend → data halaman detail */
export function toResourceDetail(r, reviews = []) {
  const card = toResourceCard(r);
  const avg = reviews.length ? reviews.reduce((s, x) => s + x.rating, 0) / reviews.length : null;
  return {
    id: card.id,
    title: card.title,
    fileInfo: card.format,
    linkFile: r.link_file,
    author: card.author,
    date: formatDate(r.created_at),
    downloads: r.jumlah_unduhan ?? '–',
    rating: avg ? avg.toFixed(1) : '–',
    reviewCount: reviews.length,
    abstract: (r.deskripsi || '').split(/\n{2,}/).filter(Boolean),
    keywords: r.kata_kunci || [],
    cover: {
      faculty: [r.fakultas, r.prodi].filter(Boolean).join(' • ').toUpperCase(),
      kicker: 'DOKUMEN AKADEMIK',
      title: card.title,
      purpose: r.sumber || '',
      author: card.author.name,
      nim: '',
      place: '',
    },
    totalPages: r.jumlah_halaman || 1,
    reviews,
    meta: {
      course: card.course,
      courseInfo: '',
      lecturer: r.dosen || '—',
      lecturerInfo: '',
      semester: r.semester ? String(r.semester) : '—',
      year: r.tahun_akademik || '—',
      license: r.lisensi || '—',
      licenseNote: '',
      doi: r.doi || '',
    },
    related: [],
  };
}
