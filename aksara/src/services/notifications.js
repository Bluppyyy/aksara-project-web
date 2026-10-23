// Notifikasi di header (dropdown, tanpa halaman khusus).
// Backend belum punya endpoint notifikasi, jadi mode API menyusunnya dari data yang ada:
//  - resource & wawasan milik user yang sudah disetujui admin
//  - resource & wawasan terbaru dari mahasiswa lain
// Status "sudah dibaca" disimpan per akun di browser.
import { USE_API } from './api';
import { listResources } from './resources';
import { listArticles } from './insights';

const MAX = 8;
const seenKey = (user) => (user?.email ? `aksara.notifSeen.${user.email.toLowerCase()}` : null);

const DEMO = [
  {
    id: 'd1',
    kind: 'approved',
    title: 'Resource kamu disetujui',
    text: '"Implementasi Algoritma A* Pathfinding pada Robot Bergerak" sudah tampil di Eksplorasi.',
    to: '/eksplorasi/hasil',
    at: Date.now() - 2 * 3600e3,
  },
  {
    id: 'd2',
    kind: 'new',
    title: 'Resource baru',
    text: 'Daffa Rizky membagikan "Analisis Sentimen Twitter Menggunakan IndoBERT dan LSTM".',
    to: '/eksplorasi/hasil',
    at: Date.now() - 26 * 3600e3,
  },
  {
    id: 'd3',
    kind: 'insight',
    title: 'Wawasan baru',
    text: 'Rina Melati menulis "Pengalaman Lolos IISMA 2025".',
    to: '/wawasan',
    at: Date.now() - 3 * 86400e3,
  },
];

const isMine = (user, x) => (user?.id && x.ownerId === user.id) || (user?.nim && x.ownerNim === user.nim);
const time = (iso) => (iso ? new Date(iso).getTime() : 0);

/** Daftar notifikasi terbaru (paling baru di atas) */
export async function listNotifications(user) {
  if (!USE_API) return DEMO;
  const [resources, articles] = await Promise.all([listResources().catch(() => []), listArticles().catch(() => [])]);
  const items = [
    ...resources.map((r) =>
      isMine(user, r)
        ? {
            id: `r-${r.id}`,
            kind: 'approved',
            title: 'Resource kamu disetujui',
            text: `"${r.title}" sudah tampil di Eksplorasi.`,
            to: `/resource/${r.id}`,
            at: time(r.createdAt),
          }
        : {
            id: `r-${r.id}`,
            kind: 'new',
            title: 'Resource baru',
            text: `${r.author?.name || 'Mahasiswa FIF'} membagikan "${r.title}".`,
            to: `/resource/${r.id}`,
            at: time(r.createdAt),
          }
    ),
    ...articles.map((a) =>
      isMine(user, a)
        ? {
            id: `e-${a.id}`,
            kind: 'approved',
            title: 'Wawasan kamu disetujui',
            text: `"${a.title}" sudah tampil di Wawasan.`,
            to: `/wawasan/${a.id}`,
            at: time(a.createdAt),
          }
        : {
            id: `e-${a.id}`,
            kind: 'insight',
            title: 'Wawasan baru',
            text: `${a.author?.name || 'Mahasiswa FIF'} menulis "${a.title}".`,
            to: `/wawasan/${a.id}`,
            at: time(a.createdAt),
          }
    ),
  ];
  return items.sort((a, b) => b.at - a.at).slice(0, MAX);
}

/** Waktu terakhir user membuka notifikasi (ms) */
export function getSeenAt(user) {
  try {
    return Number(localStorage.getItem(seenKey(user))) || 0;
  } catch {
    return 0;
  }
}

export function markSeen(user, at = Date.now()) {
  try {
    if (seenKey(user)) localStorage.setItem(seenKey(user), String(at));
  } catch {
    /* penyimpanan diblokir: abaikan */
  }
}

/** "5 menit lalu", "2 jam lalu", "3 hari lalu", atau tanggal */
export function timeAgo(at) {
  if (!at) return '';
  const s = Math.max(0, (Date.now() - at) / 1000);
  if (s < 60) return 'Baru saja';
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} hari lalu`;
  return new Date(at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
