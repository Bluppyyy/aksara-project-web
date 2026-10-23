import ui from './admin.module.css';

/** Label & warna status moderasi (dipakai di semua tabel admin) */
export const STATUS_META = {
  pending: { label: 'Menunggu Review', tone: ui.toneWarn },
  clarify: { label: 'Butuh Klarifikasi', tone: ui.toneWarn },
  approved: { label: 'Dipublikasikan', tone: ui.toneOk },
  rejected: { label: 'Ditolak', tone: ui.toneDanger },
  hidden: { label: 'Disembunyikan', tone: ui.toneNeutral },
};
