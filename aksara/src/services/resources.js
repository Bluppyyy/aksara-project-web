import { api, USE_API, getSession } from './api';
import { fetchBookmarkRows, invalidateBookmarks } from './bookmarks';
import { toResourceCard, toResourceDetail, toReview } from './adapters';
import { categoryIdFor, masterMaps } from './master';
import { applyFilters } from '../utils/filters';
import { saveRecent } from '../utils/recent';
import { searchResults, bookmarkedResources, relevantResources } from '../data/resources';
import { resourceDetail } from '../data/resourceDetail.jsx';

const delay = (v, ms = 250) => new Promise((r) => setTimeout(() => r(v), ms));

const FORMAT_TO_API = { PDF: 'pdf', DOC: 'doc', DOCX: 'doc', PPT: 'ppt', PPTX: 'ppt', ZIP: 'zip' };

/**
 * Ubah filter frontend (utils/filters.js) → query GET /resource-relevan.
 * Backend hanya menerima SATU nilai per filter, jadi pilihan ganda tetap disaring di frontend.
 */
async function toRelevantQuery(f) {
  const query = { sort: 'terbaru' };
  if (f.q?.trim()) query.q = f.q.trim();
  if (f.kategori?.length === 1) {
    const id = await categoryIdFor(f.kategori[0]).catch(() => null);
    if (id != null) query.category_id = id;
  }
  if (f.format?.length === 1 && FORMAT_TO_API[f.format[0]]) query.format = FORMAT_TO_API[f.format[0]];
  if (f.tahun && f.tahun[0] === f.tahun[1]) query.tahun = String(f.tahun[0]);
  if (f.rating && (f.rating[0] !== 1 || f.rating[1] !== 5)) {
    query.rating_min = f.rating[0];
    query.rating_max = f.rating[1];
  }
  return query;
}

/** Ambil semua halaman GET /resource-relevan (12 per halaman) */
function fetchAllRelevant(query) {
  // Beberapa komponen di satu halaman (daftar, filter, riwayat) memakai data yang sama → satu request saja
  return once(`relevan:${JSON.stringify(query)}`, 10000, () => loadAllRelevant(query));
}

async function loadAllRelevant(query) {
  const first = await api('/resource-relevan', { query: { ...query, page: 1 } });
  const total = first.pagination?.total_halaman || 1;
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, total - 1) }, (_, i) =>
      api('/resource-relevan', { query: { ...query, page: i + 2 } })
    )
  );
  return [first, ...rest].flatMap((r) => r.data || []);
}

/**
 * GET /resource-relevan (publik) belum menyertakan nama pengunggah, format file, dan jumlah unduhan/dilihat.
 * Kalau user sudah login, data itu diambil dari GET /resource (butuh token) lalu digabung berdasarkan resource_id.
 * Disimpan sebentar (30 detik) supaya beberapa komponen di satu halaman tidak memanggil berulang.
 */
let extraCache = { at: 0, token: null, req: null };
async function resourceExtras() {
  const token = getSession()?.access_token;
  if (!token) return {};
  if (extraCache.req && extraCache.token === token && Date.now() - extraCache.at < 30000) return extraCache.req;
  const req = api('/resource', { auth: true })
    .then((res) => Object.fromEntries((res.data || []).map((r) => [String(r.resource_id), r])))
    .catch(() => ({}));
  extraCache = { at: Date.now(), token, req };
  return req;
}

/** Gabungkan baris /resource-relevan dengan data tambahan dari /resource */
const withExtras = (row, extras) => {
  const x = extras[String(row.resource_id)];
  if (!x) return row;
  return {
    ...row,
    pengguna: row.pengguna || x.pengguna,
    user_id: row.user_id ?? x.user_id,
    format_file: row.format_file || x.format_file,
    jumlah_unduhan: row.jumlah_unduhan ?? x.jumlah_unduhan,
    jumlah_dilihat: row.jumlah_dilihat ?? x.jumlah_dilihat,
    prodi_id: row.prodi_id ?? x.prodi_id,
    semester_id: row.semester_id ?? x.semester_id,
    created_at: row.created_at || x.created_at,
    // GET /bookmark belum mengirim kategori & mata kuliah → dilengkapi dari /resource
    kategori: row.kategori || x.kategori,
    category_id: row.category_id ?? x.category_id,
    matkul_id: row.matkul_id ?? x.matkul_id,
  };
};

/** id resource yang sudah di-bookmark user (untuk menandai ikon simpan di kartu) */
async function bookmarkedIds() {
  if (!getSession()?.access_token) return new Set();
  try {
    const rows = await fetchBookmarkRows();
    return new Set(rows.filter((b) => b.resource_id).map((b) => String(b.resource_id)));
  } catch {
    return new Set(); // admin / gagal → abaikan
  }
}

/**
 * Daftar resource untuk halaman Hasil Eksplorasi (FR-EXP-01..03).
 * Backend: GET /resource-relevan?q=&category_id=&format=&tahun=&rating_min=&rating_max=&sort=&page=
 * (hanya resource berstatus approved). Filter yang belum bisa dikirim ke backend
 * (pilihan ganda, prodi, semester, mata kuliah per nama) diterapkan lewat applyFilters().
 */
export async function listResources(filters = {}) {
  const f = { kategori: [], semester: [], matkul: [], format: [], tahun: [2010, 2026], rating: [1, 5], ...filters };
  if (!USE_API) return applyFilters(await delay(searchResults), f);

  const [rows, matkul, saved, extras] = await Promise.all([
    fetchAllRelevant(await toRelevantQuery(f)),
    masterMaps(),
    bookmarkedIds(),
    resourceExtras(),
  ]);
  const items = rows.map((r) => ({
    ...toResourceCard(withExtras(r, extras), matkul),
    bookmarked: r.is_bookmarked || saved.has(String(r.resource_id)),
  }));
  // q sudah disaring backend; sisanya disaring di sini
  return applyFilters(items, { ...f, q: '' });
}

/** Jumlah resource yang sudah disetujui (pagination.total_data dari GET /resource-relevan). Mode demo: null */
export async function countResources() {
  if (!USE_API) return null;
  const res = await api('/resource-relevan', { query: { page: 1 } });
  return res.pagination?.total_data ?? (res.data || []).length;
}

/** "Resource Relevan untuk Kamu" di halaman Eksplorasi: halaman pertama /resource-relevan */
export async function listRelevant() {
  if (!USE_API) return delay(relevantResources);
  const [res, matkul, saved, extras] = await Promise.all([
    api('/resource-relevan', { query: { sort: 'terbaru', page: 1 } }),
    masterMaps(),
    bookmarkedIds(),
    resourceExtras(),
  ]);
  return (res.data || []).map((r) => ({
    ...toResourceCard(withExtras(r, extras), matkul),
    bookmarked: r.is_bookmarked || saved.has(String(r.resource_id)),
  }));
}

/**
 * Permintaan yang sama dalam waktu berdekatan memakai satu request saja.
 * Penting karena GET /resource/:id menambah jumlah_dilihat dan GET /resource/:id/file menambah
 * jumlah_unduhan — tanpa ini satu kali buka bisa terhitung dua kali (mis. React StrictMode saat development).
 */
const shared = new Map();
function once(key, ttlMs, fn) {
  const hit = shared.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.promise;
  const promise = fn().catch((err) => {
    shared.delete(key);
    throw err;
  });
  shared.set(key, { at: Date.now(), promise });
  return promise;
}

export async function getResource(id) {
  if (!USE_API) return delay(resourceDetail);
  return once(`detail:${id}`, 3000, () => loadResource(id));
}

async function loadResource(id) {
  const [res, reviews, matkul, saved] = await Promise.all([
    api(`/resource/${id}`, { auth: true }),
    listReviews(id),
    masterMaps(),
    bookmarkedIds(),
  ]);
  const detail = toResourceDetail(res.data, reviews, matkul);
  // Jumlah dilihat sudah bertambah karena GET /resource/:id → data kartu (/resource) perlu diambil ulang
  extraCache = { at: 0, token: null, req: null };
  detail.related = await relatedResources(res.data, matkul).catch(() => []);
  const catId = res.data.kategori?.category_id ?? res.data.category_id;
  detail.relatedLink = catId ? `/eksplorasi/hasil?kategori=${encodeURIComponent(`k:${catId}`)}` : '/eksplorasi/hasil';
  return { ...detail, bookmarked: res.data.is_bookmarked || saved.has(String(id)) };
}

/**
 * "Resource Terkait": resource lain dengan kategori yang sama (GET /resource-relevan?category_id=),
 * ditambah resource terbaru bila kurang dari 3. Backend belum punya endpoint khusus resource terkait.
 */
async function relatedResources(r, matkul) {
  const categoryId = r.kategori?.category_id ?? r.category_id;
  const [same, latest, extras] = await Promise.all([
    categoryId
      ? api('/resource-relevan', { query: { category_id: categoryId, page: 1 } }).then((x) => x.data || [])
      : [],
    api('/resource-relevan', { query: { sort: 'terbaru', page: 1 } }).then((x) => x.data || []),
    resourceExtras(),
  ]);
  const seen = new Set([String(r.resource_id)]);
  const picked = [];
  for (const it of [...same, ...latest]) {
    if (picked.length >= 3 || seen.has(String(it.resource_id))) continue;
    seen.add(String(it.resource_id));
    const c = toResourceCard(withExtras(it, extras), matkul);
    picked.push({
      id: c.id,
      course: c.categoryLabel || c.course,
      file: c.format || '',
      title: c.title,
      author: [c.author.name, c.year].filter(Boolean).join(' • '),
    });
  }
  return picked;
}

/**
 * Tautan file sementara (signed URL, berlaku 60 detik). Backend: GET /resource/:id/file → { data: { file_url } }
 * - unduh   → ?action=download (backend menambah jumlah_unduhan)
 * - preview → ?action=preview (tidak dihitung sebagai unduhan), dipakai ulang selama 50 detik
 */
export async function getResourceFileUrl(id, { preview = false } = {}) {
  if (!USE_API) return null;
  const load = () =>
    api(`/resource/${id}/file`, { auth: true, query: { action: preview ? 'preview' : 'download' } }).then(
      (res) => res.data?.file_url || null
    );
  return preview ? once(`preview:${id}`, 50000, load) : load();
}

/**
 * "Terakhir Dilihat" disimpan di browser sebagai salinan kartu saat dibuka, jadi angkanya bisa ketinggalan.
 * Mode API: perbarui dengan data terbaru dari backend; resource yang sudah tidak tersedia disembunyikan.
 */
export async function refreshRecent(items = []) {
  if (!USE_API || !items.length) return items;
  const latest = await listResources().catch(() => null);
  if (!latest) return items;
  const byId = new Map(latest.map((r) => [String(r.id), r]));
  const fresh = items.map((r) => byId.get(String(r.id))).filter(Boolean);
  saveRecent(fresh); // simpan versi terbaru supaya resource yang sudah tidak ada tidak muncul lagi
  return fresh;
}

export async function listReviews(resourceId) {
  if (!USE_API) return delay(resourceDetail.reviews);
  try {
    const res = await api(`/rating-review/${resourceId}`);
    return (res.data || []).map(toReview);
  } catch {
    return []; // ulasan gagal dimuat → detail resource tetap tampil
  }
}

/** Backend menyimpan 1 ulasan per user per resource (upsert); nilai_rating wajib bilangan bulat 1–5 */
export async function createReview(resourceId, { rating, text }) {
  if (!USE_API) return delay(null);
  return api('/rating-review', {
    method: 'POST',
    auth: true,
    body: { resource_id: resourceId, nilai_rating: Math.round(Number(rating)), isi_review: text },
  });
}

export async function reportResource(resourceId, alasan) {
  if (!USE_API) return delay(null);
  return api('/report', { method: 'POST', auth: true, body: { resource_id: resourceId, alasan } });
}

// ---------- Bookmark ----------
export async function listBookmarks() {
  if (!USE_API) return delay(bookmarkedResources);
  const [rows, matkul, extras] = await Promise.all([fetchBookmarkRows(), masterMaps(), resourceExtras()]);
  return rows
    .filter((b) => b.resource)
    .map((b) => ({
      ...toResourceCard(withExtras({ resource_id: b.resource_id, ...b.resource }, extras), matkul),
      bookmarked: true,
    }));
}

/** POST /bookmark { resource_id } · DELETE /bookmark/:resource_id. "Sudah ada" (409) dianggap berhasil. */
export async function setBookmark(resourceId, on) {
  if (!USE_API) return delay(null, 100);
  invalidateBookmarks();
  try {
    if (on) return await api('/bookmark', { method: 'POST', auth: true, body: { resource_id: resourceId } });
    return await api(`/bookmark/${resourceId}`, { method: 'DELETE', auth: true });
  } catch (err) {
    if ((on && err.status === 409) || (!on && err.status === 404)) return null;
    throw err;
  }
}

// ---------- Unggah ----------
/**
 * Backend: POST /resource (multipart/form-data, khusus mahasiswa)
 *   wajib: judul, deskripsi, sumber, file (PDF/Word/PowerPoint/JPG/PNG/WebP, maks. 10 MB)
 *   opsional: category_id, matkul_id, semester_id, prodi_id, fakultas_id
 * Resource masuk dengan status "pending" sampai disetujui admin.
 */
export async function uploadResource(form, file) {
  if (!USE_API) return delay(null, 600);
  const fd = new FormData();
  fd.append('judul', form.title.trim());
  fd.append('deskripsi', form.abstract.trim());
  fd.append('sumber', form.url?.trim() || form.matkul || 'Unggahan mahasiswa');
  const optional = {
    category_id: form.categoryId,
    matkul_id: form.matkulId,
    semester_id: form.semesterId,
    prodi_id: form.prodiId,
  };
  Object.entries(optional).forEach(([k, v]) => v != null && v !== '' && fd.append(k, v));
  if (file) fd.append('file', file);
  return api('/resource', { method: 'POST', auth: true, body: fd });
}
