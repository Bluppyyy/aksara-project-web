// Halaman "Profil Admin" & "Pengaturan".
// Belum ada desain khusus di Figma, jadi dibuat sederhana dengan gaya panel admin.
import { useState } from 'react';
import Icon from '../../components/Icon/Icon.jsx';
import { useAuth } from '../../context/useAuth';
import { initials } from '../../services/adapters';
import ui from './admin.module.css';
import styles from './AdminAccount.module.css';
import { PageHeader } from './shared.jsx';
import { useToast } from './useToast.jsx';

export function AdminProfile() {
  const user = useAuth();
  const name = user?.nama || 'Administrator Repositori';
  return (
    <div className={ui.page}>
      <PageHeader
        crumbs={[{ label: 'Profil Admin' }]}
        title="Profil Admin"
        subtitle="Informasi akun administrator yang sedang masuk."
      />
      <section className={`${ui.card} ${ui.cardPad} ${styles.profile}`}>
        <span className={styles.avatar}>{initials(name)}</span>
        <div className={styles.info}>
          <strong>{name}</strong>
          <span>{user?.email}</span>
          <span className={`${ui.badge} ${ui.tonePrimary}`}>
            <Icon icon="lucide:shield-check" size={12} />
            Peran: Admin (Admin FIF)
          </span>
        </div>
      </section>
      <section className={`${ui.card} ${ui.cardPad} ${styles.rights}`}>
        <h2 className={ui.cardTitle}>Hak Akses</h2>
        <ul>
          <li>
            <Icon icon="lucide:circle-check" size={16} /> Mengelola resource (FR-ADM-01, FR-ADM-02)
          </li>
          <li>
            <Icon icon="lucide:circle-check" size={16} /> Mengelola laporan pengguna (FR-ADM-03, FR-ADM-04)
          </li>
          <li>
            <Icon icon="lucide:circle-check" size={16} /> Moderasi dasar konten (FR-ADM-05)
          </li>
        </ul>
      </section>
    </div>
  );
}

const SETTINGS = [
  { key: 'notifReport', label: 'Notifikasi laporan baru', note: 'Kirim pemberitahuan saat ada laporan konten masuk.' },
  {
    key: 'notifQueue',
    label: 'Ringkasan antrean harian',
    note: 'Email ringkasan antrean moderasi setiap pukul 08.00 WIB.',
  },
  { key: 'autoScan', label: 'Pemindaian otomatis', note: 'Jalankan cek kredensial & kemiripan saat berkas diunggah.' },
];

export function AdminSettings() {
  const [toast, notify] = useToast();
  const [values, setValues] = useState({ notifReport: true, notifQueue: false, autoScan: true });
  return (
    <div className={ui.page}>
      <PageHeader
        crumbs={[{ label: 'Pengaturan' }]}
        title="Pengaturan"
        subtitle="Preferensi notifikasi dan otomasi panel admin."
      />
      <section className={`${ui.card} ${styles.settings}`}>
        {SETTINGS.map((s) => (
          <label key={s.key} className={styles.row}>
            <span>
              <strong>{s.label}</strong>
              {s.note}
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={values[s.key]}
              onChange={() => setValues((v) => ({ ...v, [s.key]: !v[s.key] }))}
            />
          </label>
        ))}
        <div className={styles.footer}>
          <button
            type="button"
            className={`${ui.btn} ${ui.btnPrimary}`}
            onClick={() => notify('Pengaturan tersimpan.')}
          >
            Simpan Pengaturan
          </button>
        </div>
      </section>
      {toast}
    </div>
  );
}
