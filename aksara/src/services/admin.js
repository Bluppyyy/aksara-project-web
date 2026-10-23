// Service layer panel admin.
// Mode demo (VITE_API_URL kosong) → data contoh di src/data/admin.js.
// Mode API → endpoint admin backend (semuanya dijaga roleMiddleware('admin') di server):
//   GET  /admin/resource                 daftar semua resource
//   PUT  /admin/resource/:id/status      { status: 'approved' | 'rejected' | 'hidden', alasan_penolakan? }
//   DELETE /admin/resource/:id           hapus resource
//   GET  /admin/report                   daftar laporan
//   GET  /admin/report/:id               detail laporan + konten yang dilaporkan
//   PUT  /admin/report/:id/status        { status: 'baru' | 'ditinjau' | 'selesai', catatan_admin? }
//   GET  /admin/experience               daftar wawasan/pengalaman
//   PUT  /admin/experience/:id/status    { status: 'approved' | 'rejected' }
import { api, USE_API } from './api';
import { fileFormat, initials, ownerOf } from './adapters';
import { masterMaps, PRODI_KEY } from './master';
import { adminResources, adminReports, reportDetail, moderationItems, moderationDetail } from '../data/admin';

const delay = (v, ms = 250) => new Promise((r) => setTimeout(() => r(structuredClone(v)), ms));

/** Status resource yang diterima backend (statusAllowed di server). "clarify" hanya ada di mode demo. */
export const BACKEND_STATUSES = ['approved', 'rejected', 'hidden'];
/** Wawasan (experience) di backend hanya bisa disetujui / ditolak */
export const EXPERIENCE_STATUSES = ['approved', 'rejected'];

// ---------- Resource ----------
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (iso) =>
  iso ? `${new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB` : '';

const fmtSize = (b) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

function toAdminResource(r, matkul = {}) {
  const mk = matkul[String(r.matkul_id)];
  const owner = ownerOf(r);
  return {
    id: r.resource_id,
    code: mk?.kode || '',
    course: mk?.nama || r.sumber || 'Resource Akademik',
    title: r.judul,
    format: (r.format_file && r.format_file !== 'OTHER' ? r.format_file : fileFormat(r.link_file)) || 'FILE',
    size: r.ukuran_file ? fmtSize(r.ukuran_file) : '',
    views: r.jumlah_dilihat ?? '–',
    downloads: r.jumlah_unduhan ?? '–',
    favorites: r.jumlah_ulasan ?? '–',
    author: owner?.nama || 'Mahasiswa FIF',
    nim: owner?.nim || '',
    email: owner?.email || '', // dikirim backend kalau pengguna:user_id ( …, email ) diminta
    category: r.kategori?.nama_kategori || 'Tanpa Kategori',
    prodi: matkul[PRODI_KEY]?.[String(r.prodi_id)] || owner?.prodi || '',
    reason: r.alasan_penolakan || '',
    date: fmtDate(r.created_at),
    time: fmtTime(r.created_at),
    status: r.status || 'pending',
  };
}

/** FR-ADM-01: semua resource (semua status). Backend: GET /admin/resource */
export async function listAdminResources() {
  if (!USE_API) return delay(adminResources);
  const [res, matkul] = await Promise.all([api('/admin/resource', { auth: true }), masterMaps()]);
  return (res.data || []).map((r) => toAdminResource(r, matkul));
}

/** FR-ADM-02: ubah status resource. Backend: PUT /admin/resource/:id/status { status, alasan_penolakan? } */
export async function updateResourceStatus(id, status, alasan) {
  if (!USE_API) return delay({ id, status });
  if (!BACKEND_STATUSES.includes(status)) {
    throw new Error('Status ini belum didukung backend. Pilih Setujui, Tolak, atau Sembunyikan.');
  }
  const body = { status };
  if (status === 'rejected' && alasan?.trim()) body.alasan_penolakan = alasan.trim();
  return api(`/admin/resource/${id}/status`, { method: 'PUT', auth: true, body });
}

/**
 * Tautan file untuk pratinjau di halaman moderasi.
 * 1) GET /admin/resource/:id/file — kalau nanti disediakan backend (bisa untuk semua status)
 * 2) GET /resource/:id/file — saat ini hanya untuk resource yang sudah disetujui
 */
export async function getAdminResourceFileUrl(id, status) {
  if (!USE_API) return null;
  try {
    const res = await api(`/admin/resource/${id}/file`, { auth: true });
    return res.data?.file_url || null;
  } catch (err) {
    if (err.status !== 404) throw err;
  }
  if (status !== 'approved') {
    throw new Error(
      'Pratinjau berkas baru bisa dibuka setelah resource disetujui. Backend belum menyediakan akses berkas untuk resource yang masih menunggu review.'
    );
  }
  const res = await api(`/resource/${id}/file`, { auth: true });
  return res.data?.file_url || null;
}

/** Hapus resource (beserta datanya). Backend: DELETE /admin/resource/:id */
export async function deleteResource(id) {
  if (!USE_API) return delay({ id });
  return api(`/admin/resource/${id}`, { method: 'DELETE', auth: true });
}

// ---------- Laporan ----------
const REPORT_PREFIX = 'LAP-';
const reportKey = (id) => `${REPORT_PREFIX}${id}`;
const reportDbId = (key) => String(key).replace(REPORT_PREFIX, '');

/** Judul konten untuk setiap laporan (dari daftar resource & experience admin) */
async function contentTitles() {
  const [res, exp] = await Promise.all([
    api('/admin/resource', { auth: true }).catch(() => ({ data: [] })),
    api('/admin/experience', { auth: true }).catch(() => ({ data: [] })),
  ]);
  return {
    resource: Object.fromEntries((res.data || []).map((r) => [String(r.resource_id), r])),
    experience: Object.fromEntries((exp.data || []).map((e) => [String(e.experience_id), e])),
  };
}

/** FR-ADM-03: daftar laporan. Backend: GET /admin/report */
export async function listReports() {
  if (!USE_API) return delay(adminReports);
  const res = await api('/admin/report', { auth: true });
  // Backend v2 sudah menyertakan judul konten (r.konten); backend lama → ambil dari daftar admin
  const titles = (res.data || []).some((r) => r.konten === undefined) ? await contentTitles() : null;
  return (res.data || []).map((r) => {
    const isRes = Boolean(r.resource_id);
    const target =
      r.konten !== undefined
        ? r.konten
        : isRes
          ? titles.resource[String(r.resource_id)]
          : titles.experience[String(r.experience_id)];
    return {
      id: reportKey(r.report_id),
      title: target?.judul || (isRes ? 'Resource tidak ditemukan' : 'Tulisan tidak ditemukan'),
      format: isRes ? target?.format_file || fileFormat(target?.link_file) || 'Resource' : 'Artikel',
      size: '',
      type: isRes ? 'resource' : 'experience',
      contentId: isRes ? r.resource_id : r.experience_id,
      reporter: ownerOf(r)?.nama || 'Mahasiswa FIF',
      nim: ownerOf(r)?.nim || '',
      prodi: ownerOf(r)?.prodi || '',
      reason: r.alasan,
      reasonText: '',
      date: fmtDate(r.created_at),
      time: fmtTime(r.created_at),
      status: r.status || 'baru',
    };
  });
}

/** FR-ADM-04: detail laporan + konten yang dilaporkan. Backend: GET /admin/report/:id */
export async function getReport(id) {
  if (!USE_API) return delay({ ...reportDetail, id });
  const res = await api(`/admin/report/${reportDbId(id)}`, { auth: true });
  const r = res.data;
  const k = r.konten_dilaporkan;
  const isRes = Boolean(r.resource_id);
  const reporterInfo = ownerOf(r);
  const pelapor = reporterInfo?.nama || 'Mahasiswa FIF';
  const owner = ownerOf(k);
  return {
    ...reportDetail,
    id,
    status: r.status || 'baru',
    adminNote: r.catatan_admin || '',
    priority: 'Normal',
    title: `Laporan: ${r.alasan}`,
    submittedAt: fmtDate(r.created_at),
    category: isRes ? 'Resource Akademik' : 'Wawasan Mahasiswa',
    sla: '—',
    reporter: {
      ...reportDetail.reporter,
      name: pelapor,
      initials: initials(pelapor),
      detail: reporterInfo?.prodi || 'Fakultas Informatika (FIF)',
      nim: reporterInfo?.nim || '—',
      email: reporterInfo?.email || '',
      role: '',
    },
    classification: r.alasan,
    statement: r.alasan,
    evidence: null,
    timeline: [
      {
        actor: 'Sistem AKSARA',
        time: fmtDate(r.created_at),
        text: 'Laporan dikirim oleh pengguna melalui tombol Laporkan.',
        tone: 'primary',
      },
      ...(r.catatan_admin
        ? [
            {
              actor: 'Administrator Repositori',
              time: r.status ? `Status: ${r.status}` : '',
              text: r.catatan_admin,
              tone: 'secondary',
            },
          ]
        : []),
      ...(r.laporan_lain?.length
        ? [
            {
              actor: 'Sistem AKSARA',
              time: '',
              text: `Konten ini juga dilaporkan ${r.laporan_lain.length} kali oleh pengguna lain.`,
              tone: 'warn',
            },
          ]
        : []),
    ],
    moderationId: `/admin/moderasi/${isRes ? 'R' : 'E'}-${isRes ? r.resource_id : r.experience_id}`,
    content: {
      ...reportDetail.content,
      title: k?.judul || 'Konten tidak ditemukan',
      type: isRes ? 'Resource Akademik' : 'Wawasan Mahasiswa',
      course: k?.mata_kuliah?.nama_matkul || k?.sumber || '—',
      prodi: k?.prodi || owner?.prodi || 'Fakultas Informatika',
      format:
        [k?.format_file && k.format_file !== 'OTHER' ? k.format_file : '', k?.status ? `Status: ${k.status}` : '']
          .filter(Boolean)
          .join(' • ') || '—',
      contributor: owner?.nama || 'Mahasiswa FIF',
      contributorNim: owner?.nim || '—',
      contributorEmail: owner?.email || '',
      uploaded: fmtDate(k?.created_at),
      resourceId: isRes ? r.resource_id : null,
      experienceId: isRes ? null : r.experience_id,
      excerpt: (k?.deskripsi || k?.konten || '').slice(0, 280),
    },
  };
}

/** Status laporan di backend */
export const REPORT_STATUSES = ['baru', 'ditinjau', 'selesai'];

/** Ubah status laporan. Backend: PUT /admin/report/:id/status { status, catatan_admin? } */
export async function updateReportStatus(id, status, catatan) {
  if (!USE_API) return delay({ id, status });
  if (!REPORT_STATUSES.includes(status)) throw new Error('Status laporan harus baru, ditinjau, atau selesai.');
  const body = { status };
  if (catatan?.trim()) body.catatan_admin = catatan.trim();
  return api(`/admin/report/${reportDbId(id)}/status`, { method: 'PUT', auth: true, body });
}

// ---------- Moderasi (resource + wawasan) ----------
const expOwner = (e) => {
  const o = ownerOf(e);
  return { author: o?.nama || 'Mahasiswa FIF', nim: o?.nim || '', prodi: o?.prodi || '', email: o?.email || '' };
};
export async function listModeration() {
  if (!USE_API) return delay(moderationItems);
  const [res, exp, matkul] = await Promise.all([
    api('/admin/resource', { auth: true }),
    api('/admin/experience', { auth: true }),
    masterMaps(),
  ]);
  const resources = (res.data || []).map((r) => ({
    ...toAdminResource(r, matkul),
    id: `R-${r.resource_id}`,
    type: 'resource',
    size: '',
    abstract: r.deskripsi || '',
    source: r.sumber || '',
  }));
  const experiences = (exp.data || []).map((e) => ({
    ...expOwner(e),
    id: `E-${e.experience_id}`,
    type: 'experience',
    code: '',
    course: '',
    title: e.judul,
    format: 'Artikel',
    size: '',
    category: e.kategori || 'Wawasan',
    subtitle: e.sub_judul || '',
    tags: e.tags || [],
    cover: e.sampul || null,
    reason: e.alasan_penolakan || '',
    date: fmtDate(e.created_at),
    time: fmtTime(e.created_at),
    status: e.status || 'pending',
    abstract: e.konten || '',
  }));
  return [...resources, ...experiences];
}

export async function getModeration(id) {
  if (!USE_API) return delay({ ...moderationDetail, id });
  const list = await listModeration();
  const found = list.find((m) => m.id === id);
  if (!found) throw new Error('Konten tidak ditemukan.');
  return {
    ...moderationDetail,
    id,
    title: found.title,
    status: found.status,
    type: found.type === 'experience' ? 'Wawasan Mahasiswa' : 'Resource Akademik',
    category: found.category,
    submittedAt: [found.date, found.time].filter(Boolean).join(', '),
    author: {
      ...moderationDetail.author,
      name: found.author,
      initials: initials(found.author),
      detail: [found.nim && `NIM ${found.nim}`, found.prodi || 'Fakultas Informatika (FIF)']
        .filter(Boolean)
        .join(' • '),
      email: found.email || '',
      advisor: '—',
      advisorGroup: '',
    },
    abstract: [found.subtitle, found.abstract].filter(Boolean).join('\n\n') || '—',
    subtitle: found.subtitle || '',
    content: found.abstract || '',
    kind: found.type,
    keywords: found.tags || [],
    cover: found.cover || null,
    files: [],
    format: found.format,
    size: found.size,
    similarity: '—',
    license: '', // belum ada di backend
    faculty: 'Fakultas Informatika (FIF)',
    log: [{ title: 'Pengajuan diterima ke antrean moderasi', meta: submittedMeta(found) }],
    resourceId: found.type === 'resource' ? String(id).slice(2) : null,
    reason: found.reason,
  };
}

const submittedMeta = (m) => [m.date, m.time].filter(Boolean).join(', ') || 'Waktu pengajuan belum dicatat backend';

/** Status yang bisa dikirim untuk item moderasi ("R-…" resource, "E-…" wawasan) */
export const allowedStatuses = (id) => (String(id).startsWith('E') ? EXPERIENCE_STATUSES : BACKEND_STATUSES);

/** FR-ADM-05: tindakan moderasi (setujui / tolak / sembunyikan). alasan → alasan_penolakan (khusus resource) */
export async function moderate(id, status, alasan) {
  if (!USE_API) return delay({ id, status });
  const kind = String(id).slice(0, 1);
  const realId = String(id).slice(2); // id bisa UUID yang juga mengandung "-"
  if (kind !== 'E') return updateResourceStatus(realId, status, alasan);
  if (!EXPERIENCE_STATUSES.includes(status)) {
    throw new Error('Wawasan hanya bisa disetujui atau ditolak.');
  }
  return api(`/admin/experience/${realId}/status`, { method: 'PUT', auth: true, body: { status } });
}

// ---------- Ringkasan dashboard ----------
/** Angka ringkasan & antrean untuk Beranda admin (mode API) */
export async function adminSummary() {
  const [items, reports] = await Promise.all([
    listModeration(),
    api('/admin/report', { auth: true }).then((r) => r.data || []),
  ]);
  const res = items.filter((i) => i.type === 'resource');
  const count = (list, st) => list.filter((i) => i.status === st).length;
  return {
    totalResource: res.length,
    publishedResource: count(res, 'approved'),
    pending: items.filter((i) => i.status === 'pending').length,
    reports: reports.length,
    experiences: items.length - res.length,
    queue: items.filter((i) => i.status === 'pending'),
  };
}
