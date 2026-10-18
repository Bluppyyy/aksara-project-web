// Service layer panel admin.
// Mode demo (VITE_API_URL kosong) → data contoh di src/data/admin.js.
// Mode API → endpoint admin backend (semuanya dijaga roleMiddleware('admin') di server):
//   GET  /admin/resource                 daftar semua resource
//   PUT  /admin/resource/:id/status      { status: 'approved' | 'rejected' }
//   GET  /admin/report                   daftar laporan
//   GET  /admin/experience               daftar wawasan/pengalaman
//   PUT  /admin/experience/:id/status    { status: 'approved' | 'rejected' }
import { api, USE_API } from './api';
import {
  adminResources,
  adminReports,
  reportDetail,
  moderationItems,
  moderationDetail,
} from '../data/admin';

const delay = (v, ms = 250) => new Promise((r) => setTimeout(() => r(structuredClone(v)), ms));

/** Status yang bisa diproses backend saat ini. "hidden" & "clarify" baru ada di mode demo. */
export const BACKEND_STATUSES = ['approved', 'rejected'];

// ---------- Resource ----------
function toAdminResource(r) {
  return {
    id: r.resource_id,
    code: r.mata_kuliah?.kode || '—',
    course: r.mata_kuliah?.nama || r.sumber || 'Resource Akademik',
    title: r.judul,
    file: r.link_file ? r.link_file.split('?')[0].split('.').pop().toUpperCase() : 'FILE',
    fileIcon: 'lucide:file-text',
    author: r.pengunggah?.nama || 'Kontributor AKSARA',
    initials: (r.pengunggah?.nama || 'KA').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
    idLabel: r.pengunggah?.nim ? `NIM ${r.pengunggah.nim}` : '',
    cohort: r.pengunggah?.angkatan ? `Angkatan ${r.pengunggah.angkatan}` : '',
    category: r.kategori || 'Resource',
    prodi: r.prodi || (r.prodi_id ? `Prodi #${r.prodi_id}` : '—'),
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
    time: '',
    status: r.status || 'pending',
  };
}

export async function listAdminResources() {
  if (!USE_API) return delay(adminResources);
  const res = await api('/admin/resource', { auth: true });
  return (res.data || []).map(toAdminResource);
}

/** FR-ADM-02: ubah status resource */
export async function updateResourceStatus(id, status) {
  if (!USE_API) return delay({ id, status });
  if (!BACKEND_STATUSES.includes(status)) {
    throw new Error('Status ini belum didukung backend. Saat ini hanya "Setujui" dan "Tolak".');
  }
  return api(`/admin/resource/${id}/status`, { method: 'PUT', auth: true, body: { status } });
}

// ---------- Laporan ----------
export async function listReports() {
  if (!USE_API) return delay(adminReports);
  const res = await api('/admin/report', { auth: true });
  return (res.data || []).map((r) => ({
    id: `LAP-${r.report_id}`,
    title: r.resource_id ? `Resource #${r.resource_id}` : `Wawasan #${r.experience_id}`,
    meta: r.resource_id ? 'Resource Akademik' : 'Pengalaman Mahasiswa',
    icon: r.resource_id ? 'lucide:file-text' : 'lucide:user-round-pen',
    type: r.resource_id ? 'resource' : 'experience',
    reporter: 'Mahasiswa',
    reporterMeta: r.user_id?.slice(0, 8) || '',
    reason: r.alasan,
    reasonIcon: 'lucide:flag',
    reasonText: '',
    status: 'baru',
  }));
}

/** FR-ADM-04: detail laporan + konten yang dilaporkan (backend belum punya endpoint detail) */
export async function getReport(id) {
  if (!USE_API) return delay({ ...reportDetail, id });
  const list = await listReports();
  const found = list.find((r) => r.id === id);
  if (!found) throw new Error('Laporan tidak ditemukan.');
  return { ...reportDetail, id, title: found.reason, classification: found.reason };
}

// ---------- Moderasi (resource + wawasan) ----------
export async function listModeration() {
  if (!USE_API) return delay(moderationItems);
  const [res, exp] = await Promise.all([
    api('/admin/resource', { auth: true }),
    api('/admin/experience', { auth: true }),
  ]);
  const resources = (res.data || []).map((r) => ({
    ...toAdminResource(r),
    id: `R-${r.resource_id}`,
    icon: 'lucide:file-text',
    type: 'resource',
    nim: '',
    sub: '',
  }));
  const experiences = (exp.data || []).map((e) => ({
    id: `E-${e.experience_id}`,
    title: e.judul,
    icon: 'lucide:newspaper',
    file: 'Artikel Wawasan',
    type: 'experience',
    author: 'Mahasiswa',
    nim: '',
    prodi: '',
    category: 'Wawasan',
    sub: '',
    date: '—',
    time: '',
    status: e.status || 'pending',
  }));
  return [...resources, ...experiences];
}

export async function getModeration(id) {
  if (!USE_API) return delay({ ...moderationDetail, id });
  const list = await listModeration();
  const found = list.find((m) => m.id === id);
  if (!found) throw new Error('Konten tidak ditemukan.');
  return { ...moderationDetail, id, title: found.title, status: found.status };
}

/** FR-ADM-05: tindakan moderasi (setujui / tolak / sembunyikan) */
export async function moderate(id, status) {
  if (!USE_API) return delay({ id, status });
  if (!BACKEND_STATUSES.includes(status)) {
    throw new Error('Tindakan ini belum didukung backend. Saat ini hanya "Setujui" dan "Tolak".');
  }
  const [kind, realId] = String(id).split('-');
  const path = kind === 'E' ? `/admin/experience/${realId}/status` : `/admin/resource/${realId}/status`;
  return api(path, { method: 'PUT', auth: true, body: { status } });
}
