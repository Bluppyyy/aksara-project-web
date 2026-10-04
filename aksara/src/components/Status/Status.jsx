import Icon from '../Icon/Icon.jsx';
import styles from './Status.module.css';

/** Tampilan saat data sedang dimuat */
export function Loading({ label = 'Memuat data…' }) {
  return (
    <div className={styles.box} role="status">
      <Icon icon="lucide:loader-circle" size={28} className={styles.spin} />
      <p>{label}</p>
    </div>
  );
}

/** Tampilan saat gagal memuat, dengan tombol coba lagi */
export function ErrorState({ error, onRetry }) {
  return (
    <div className={`${styles.box} ${styles.error}`} role="alert">
      <Icon icon="lucide:circle-alert" size={28} />
      <p>{error?.message || 'Terjadi kesalahan.'}</p>
      {onRetry && (
        <button type="button" className={styles.button} onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  );
}

/** Tampilan saat data kosong */
export function Empty({ title = 'Belum ada data', description, action }) {
  return (
    <div className={styles.box}>
      <Icon icon="lucide:inbox" size={32} />
      <p className={styles.title}>{title}</p>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
