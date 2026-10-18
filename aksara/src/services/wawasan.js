// Service layer Wawasan & Pengalaman (experience) — FR-CON-02, FR-QC-01.
// Backend: GET /experience (hanya yang approved), POST /experience { judul, konten }, POST /report { experience_id, alasan }
import { api, USE_API } from './api';
import { articles, articleDetail } from '../data/articles';

const delay = (v, ms = 250) => new Promise((r) => setTimeout(() => r(v), ms));

export async function listArticles() {
  if (!USE_API) return delay(articles);
  const res = await api('/experience');
  return (res.data || []).map((e, i) => ({
    ...articles[i % articles.length],
    id: e.experience_id,
    title: e.judul,
    excerpt: (e.konten || '').slice(0, 140) + '…',
  }));
}

export async function getArticle(id) {
  if (!USE_API) return delay({ ...articleDetail, id });
  // Backend belum punya GET /experience/:id → ambil dari daftar
  const res = await api('/experience');
  const e = (res.data || []).find((x) => String(x.experience_id) === String(id));
  if (!e) throw new Error('Tulisan tidak ditemukan atau belum disetujui admin.');
  return {
    ...articleDetail,
    id,
    title: e.judul,
    blocks: (e.konten || '').split(/\n{2,}/).map((t) => ({ type: 'p', text: t })),
  };
}

/** FR-CON-02: kirim wawasan → status "pending" sampai dimoderasi admin */
export async function createArticle({ title, subtitle, category, content, tags }) {
  if (!USE_API) return delay({ status: 'pending' }, 600);
  return api('/experience', {
    method: 'POST',
    auth: true,
    body: { judul: title, konten: content, subjudul: subtitle, kategori: category, tags },
  });
}

/** FR-QC-01: laporkan tulisan */
export async function reportArticle(id, alasan) {
  if (!USE_API) return delay(null);
  return api('/report', { method: 'POST', auth: true, body: { experience_id: id, alasan } });
}
