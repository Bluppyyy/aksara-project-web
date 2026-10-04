import { api, USE_API } from './api';
import { toResourceCard, toResourceDetail, toReview } from './adapters';
import { searchResults, bookmarkedResources } from '../data/resources';
import { resourceDetail } from '../data/resourceDetail.jsx';

const delay = (v, ms = 250) => new Promise((r) => setTimeout(() => r(v), ms));

/**
 * Daftar resource untuk halaman Eksplorasi.
 * Backend sekarang punya 3 endpoint terpisah (semua, search, filter) tanpa pagination;
 * begitu ada satu endpoint GET /resource?q=&...&page=, cukup fungsi ini yang diubah.
 */
export async function listResources({ q, fakultas_id, prodi_id, semester_id } = {}) {
  if (!USE_API) return delay(searchResults);
  let res;
  if (q) res = await api('/resource/search', { query: { q } });
  else if (fakultas_id || prodi_id || semester_id)
    res = await api('/resource/filter', { query: { fakultas_id, prodi_id, semester_id } });
  else res = await api('/resource');

  // Sementara backend belum menyaring status, frontend hanya menampilkan yang approved
  const items = (res.data || []).filter((r) => !r.status || r.status === 'approved');
  return items.map(toResourceCard);
}

export async function getResource(id) {
  if (!USE_API) return delay(resourceDetail);
  const [res, reviews] = await Promise.all([api(`/resource/${id}`), listReviews(id)]);
  return toResourceDetail(res.data, reviews);
}

export async function listReviews(resourceId) {
  if (!USE_API) return delay(resourceDetail.reviews);
  const res = await api(`/rating-review/${resourceId}`);
  return (res.data || []).map(toReview);
}

export async function createReview(resourceId, { rating, text }) {
  if (!USE_API) return delay(null);
  return api('/rating-review', {
    method: 'POST',
    auth: true,
    body: { resource_id: resourceId, nilai_rating: rating, isi_review: text },
  });
}

export async function reportResource(resourceId, alasan) {
  if (!USE_API) return delay(null);
  return api('/report', { method: 'POST', auth: true, body: { resource_id: resourceId, alasan } });
}

// ---------- Bookmark ----------
export async function listBookmarks() {
  if (!USE_API) return delay(bookmarkedResources);
  const res = await api('/bookmark', { auth: true });
  return (res.data || [])
    .filter((b) => b.resource)
    .map((b) => ({ ...toResourceCard(b.resource), bookmarked: true }));
}

export async function setBookmark(resourceId, on) {
  if (!USE_API) return delay(null, 100);
  if (on) return api('/bookmark', { method: 'POST', auth: true, body: { resource_id: resourceId } });
  return api(`/bookmark/${resourceId}`, { method: 'DELETE', auth: true });
}

// ---------- Unggah ----------
/**
 * Backend: POST /resource (multipart) — judul, deskripsi, sumber wajib; file wajib.
 * Field kategori, mata kuliah, tahun, tag belum diterima backend tapi tetap dikirim.
 */
export async function uploadResource(form, file) {
  if (!USE_API) return delay(null, 600);
  const fd = new FormData();
  fd.append('judul', form.title);
  fd.append('deskripsi', form.abstract);
  fd.append('sumber', form.url || form.matkul || 'Unggahan mahasiswa');
  if (form.semesterId) fd.append('semester_id', form.semesterId);
  if (form.prodiId) fd.append('prodi_id', form.prodiId);
  if (form.fakultasId) fd.append('fakultas_id', form.fakultasId);
  fd.append('kategori', form.kategori);
  fd.append('mata_kuliah', form.matkul);
  fd.append('tahun_akademik', form.tahun);
  fd.append('kata_kunci', JSON.stringify(form.tags));
  if (file) fd.append('file', file);
  return api('/resource', { method: 'POST', auth: true, body: fd });
}
