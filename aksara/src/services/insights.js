// Service layer Wawasan & Pengalaman (experience) — FR-CON-02, FR-QC-01.
// Backend: GET /experience & GET /experience/:id (hanya yang approved; detail menambah jumlah_dibaca),
//          POST /experience (multipart: judul, sub_judul, konten, kategori, tags, sampul), POST /report { experience_id, alasan },
//          GET /rating-review/experience/:id, POST /rating-review { experience_id, nilai_rating, isi_review },
//          POST /bookmark { experience_id }, DELETE /bookmark/:experience_id
import { api, USE_API } from './api';
import { fetchBookmarkRows, invalidateBookmarks } from './bookmarks';
import { articles, articleDetail } from '../data/articles';
import { initials, personMeta, toReview } from './adapters';
import { parseBlocks, stripMarkdown } from '../utils/markdown';

const delay = (v, ms = 250) => new Promise((r) => setTimeout(() => r(v), ms));

const readTime = (text = '') => `${Math.max(1, Math.round(text.split(/\s+/).length / 200))} Menit Baca`;
const excerpt = (raw = '') => {
  const text = stripMarkdown(raw);
  return text.length > 140 ? `${text.slice(0, 140).trim()}…` : text;
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/** Kunci kategori untuk mencocokkan pill di halaman Wawasan dengan kategori tulisan ("Tips Beasiswa", "Karir Portofolio", …) */
export const categoryKey = (label = '') =>
  label
    .replace(/[^\p{L}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(' ')
    .toLowerCase();

/** experience backend → kartu artikel. Field: sub_judul, kategori, tags, sampul, created_at, pengguna { nama, nim, prodi } */
function toArticle(e, i = 0) {
  const style = articles[i % articles.length];
  const writer = e.pengguna || e.penulis;
  const name = writer?.nama || 'Mahasiswa FIF';
  return {
    id: e.experience_id,
    ownerId: e.user_id ?? null,
    ownerNim: writer?.nim || '',
    image: e.sampul || e.sampul_url || style.image,
    hasCover: Boolean(e.sampul || e.sampul_url),
    label: (e.kategori || 'Wawasan').toUpperCase(),
    labelColor: '#0f4c81',
    category: e.kategori || '',
    title: e.judul,
    subtitle: e.sub_judul || '',
    excerpt: excerpt(e.sub_judul || e.konten),
    author: {
      initials: initials(name),
      name,
      bg: '#d2e4ff',
      color: '#001c37',
      meta: writer ? personMeta(writer) : 'Fakultas Informatika',
    },
    readTime: e.menit_baca ? `${e.menit_baca} Menit Baca` : readTime(e.konten),
    date: fmtDate(e.created_at),
    createdAt: e.created_at || null,
    reads: e.jumlah_dibaca ?? e.jumlah_dilihat ?? '–',
    rating: e.rating_rata_rata != null ? Number(e.rating_rata_rata).toFixed(1) : '–',
    reviewCount: e.total_ulasan ?? 0,
    tags: (e.tags || []).map((t) => String(t).replace(/^#/, '')).filter(Boolean),
    konten: e.konten || '',
  };
}

/** id wawasan yang sudah disimpan user (bookmark hanya untuk mahasiswa; admin/tamu → kosong) */
async function savedArticleIds() {
  try {
    const rows = await fetchBookmarkRows();
    return new Set(rows.filter((b) => b.experience_id).map((b) => String(b.experience_id)));
  } catch {
    return new Set();
  }
}

/** GET /experience → hanya tulisan yang sudah disetujui admin */
export async function listArticles() {
  if (!USE_API) return delay(articles);
  const [res, saved] = await Promise.all([api('/experience'), savedArticleIds()]);
  return (res.data || []).map((e, i) => ({ ...toArticle(e, i), bookmarked: saved.has(String(e.experience_id)) }));
}

/**
 * GET /experience/:id menambah jumlah_dibaca setiap dipanggil → permintaan yang berdekatan
 * (mis. React StrictMode saat development) memakai satu request saja supaya tidak terhitung dua kali.
 */
const detailCache = new Map();
function fetchArticle(id) {
  const hit = detailCache.get(id);
  if (hit && Date.now() - hit.at < 3000) return hit.promise;
  const promise = api(`/experience/${id}`).catch((err) => {
    detailCache.delete(id);
    throw err;
  });
  detailCache.set(id, { at: Date.now(), promise });
  return promise;
}

export async function getArticle(id) {
  if (!USE_API) return delay({ ...articleDetail, id });
  let a, reviews, saved;
  try {
    const [res, list, ids] = await Promise.all([fetchArticle(id), listArticleReviews(id), savedArticleIds()]);
    a = toArticle(res.data);
    reviews = list;
    saved = ids.has(String(id));
  } catch (err) {
    if (err.status === 404) throw new Error('Tulisan tidak ditemukan atau belum disetujui admin.');
    throw err;
  }
  return {
    ...articleDetail,
    id,
    title: a.title,
    subtitle: a.subtitle,
    readTime: a.readTime,
    date: a.date,
    reads: a.reads,
    rating: a.rating,
    reviewCount: a.reviewCount || reviews.length,
    reviews,
    bookmarked: saved,
    image: a.image,
    caption: '',
    hasCover: a.hasCover,
    category: a.category,
    author: { initials: a.author.initials, name: a.author.name, meta: a.author.meta },
    keywords: a.tags,
    blocks: parseBlocks(a.konten), // markdown dari toolbar Tulis Wawasan (lihat utils/markdown.js)
  };
}

/** FR-CON-02: kirim wawasan → status "pending" sampai dimoderasi admin. Sampul opsional (gambar, dikompres backend). */
export async function createArticle({ title, subtitle, category, content, tags = [] }, cover) {
  if (!USE_API) return delay({ status: 'pending' }, 600);
  const fd = new FormData();
  fd.append('judul', title.trim());
  fd.append('konten', content.trim());
  if (subtitle?.trim()) fd.append('sub_judul', subtitle.trim());
  if (category) fd.append('kategori', category);
  const cleanTags = tags.map((t) => String(t).replace(/^#/, '').trim()).filter(Boolean);
  if (cleanTags.length) fd.append('tags', JSON.stringify(cleanTags));
  if (cover) fd.append('sampul', cover);
  return api('/experience', { method: 'POST', auth: true, body: fd });
}

/** Ulasan wawasan. Backend: GET /rating-review/experience/:id */
export async function listArticleReviews(id) {
  if (!USE_API) return delay([]);
  try {
    const res = await api(`/rating-review/experience/${id}`);
    return (res.data || []).map(toReview);
  } catch {
    return []; // ulasan gagal dimuat → halaman tetap tampil
  }
}

/** 1 ulasan per mahasiswa per wawasan (kirim ulang = perbarui). nilai_rating bilangan bulat 1–5 */
export async function createArticleReview(id, { rating, text }) {
  if (!USE_API) return delay(null);
  return api('/rating-review', {
    method: 'POST',
    auth: true,
    body: { experience_id: id, nilai_rating: Math.round(Number(rating)), isi_review: text },
  });
}

/** Simpan wawasan ke Koleksi. "Sudah ada" (409) / "tidak ada" (404) dianggap berhasil. */
export async function setArticleBookmark(id, on) {
  if (!USE_API) return delay(null, 100);
  invalidateBookmarks();
  try {
    if (on) return await api('/bookmark', { method: 'POST', auth: true, body: { experience_id: id } });
    return await api(`/bookmark/${id}`, { method: 'DELETE', auth: true });
  } catch (err) {
    if ((on && err.status === 409) || (!on && err.status === 404)) return null;
    throw err;
  }
}

/** Wawasan yang disimpan user (GET /bookmark → item dengan experience) untuk halaman Koleksi */
export async function listArticleBookmarks() {
  if (!USE_API) return delay([]);
  const [rows, all] = await Promise.all([
    fetchBookmarkRows(),
    api('/experience')
      .then((x) => x.data || [])
      .catch(() => []),
  ]);
  // GET /bookmark belum mengirim data penulis & rating → dilengkapi dari GET /experience
  const byId = new Map(all.map((e) => [String(e.experience_id), e]));
  return rows
    .filter((b) => b.experience_id && b.experience)
    .map((b, i) => {
      const full = byId.get(String(b.experience_id)) || {};
      return { ...toArticle({ ...full, experience_id: b.experience_id, ...b.experience }, i), bookmarked: true };
    });
}

/** FR-QC-01: laporkan tulisan */
export async function reportArticle(id, alasan) {
  if (!USE_API) return delay(null);
  return api('/report', { method: 'POST', auth: true, body: { experience_id: id, alasan } });
}
