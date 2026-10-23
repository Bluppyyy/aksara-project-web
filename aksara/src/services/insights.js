// Service layer Wawasan & Pengalaman (experience) — FR-CON-02, FR-QC-01.
// Backend: GET /experience & GET /experience/:id (hanya yang approved),
//          POST /experience (multipart: judul, sub_judul, konten, kategori, tags, sampul), POST /report { experience_id, alasan }
import { api, USE_API } from './api';
import { articles, articleDetail } from '../data/articles';
import { initials, personMeta } from './adapters';

const delay = (v, ms = 250) => new Promise((r) => setTimeout(() => r(v), ms));

const readTime = (text = '') => `${Math.max(1, Math.round(text.split(/\s+/).length / 200))} Menit Baca`;
const excerpt = (text = '') => (text.length > 140 ? `${text.slice(0, 140).trim()}…` : text);

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
    reads: e.jumlah_dilihat ?? '–',
    tags: (e.tags || []).map((t) => String(t).replace(/^#/, '')).filter(Boolean),
    konten: e.konten || '',
  };
}

/** GET /experience → hanya tulisan yang sudah disetujui admin */
export async function listArticles() {
  if (!USE_API) return delay(articles);
  const res = await api('/experience');
  return (res.data || []).map(toArticle);
}

export async function getArticle(id) {
  if (!USE_API) return delay({ ...articleDetail, id });
  let a;
  try {
    const res = await api(`/experience/${id}`);
    a = toArticle(res.data);
  } catch (err) {
    if (err.status === 404) throw new Error('Tulisan tidak ditemukan atau belum disetujui admin.');
    throw err;
  }
  const paragraphs = a.konten
    .split(/\n{2,}|\n/)
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    ...articleDetail,
    id,
    title: a.title,
    subtitle: a.subtitle,
    readTime: a.readTime,
    date: a.date,
    reads: a.reads,
    rating: '–', // ulasan untuk wawasan belum ada di SRS/backend
    reviewCount: 0,
    image: a.image,
    caption: '',
    hasCover: a.hasCover,
    category: a.category,
    author: { initials: a.author.initials, name: a.author.name, meta: a.author.meta },
    keywords: a.tags,
    blocks: paragraphs.map((text, i) => {
      const h = text.match(/^#{1,3}\s+(.*)$/);
      if (h) return { type: 'h2', text: h[1] };
      if (text.startsWith('>')) return { type: 'quote', text: text.replace(/^>\s*/, '') };
      return { type: i === 0 ? 'lead' : 'p', text };
    }),
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

/** FR-QC-01: laporkan tulisan */
export async function reportArticle(id, alasan) {
  if (!USE_API) return delay(null);
  return api('/report', { method: 'POST', auth: true, body: { experience_id: id, alasan } });
}
