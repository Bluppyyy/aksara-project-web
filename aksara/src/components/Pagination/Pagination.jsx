import styles from './Pagination.module.css';
import iconPrev from '../../assets/icon-prev.svg';
import iconNext from '../../assets/icon-next.svg';

// Menghasilkan daftar halaman seperti di desain: 1 2 3 … 12
function getPages(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, '…', total];
  if (current >= total - 2) return [1, '…', total - 2, total - 1, total];
  return [1, '…', current, '…', total];
}

export default function Pagination({ page, totalPages, onChange }) {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={`${styles.stepButton} ${styles.prev}`}
        disabled={isFirst}
        onClick={() => onChange(page - 1)}
      >
        <img src={iconPrev} alt="" className={styles.arrow} />
        <span>Sebelumnya</span>
      </button>

      {getPages(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className={styles.ellipsis}>
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`${styles.pageButton} ${p === page ? styles.pageButtonActive : ''}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className={`${styles.stepButton} ${styles.next}`}
        disabled={isLast}
        onClick={() => onChange(page + 1)}
      >
        <span>Selanjutnya</span>
        <img src={iconNext} alt="" className={styles.arrow} />
      </button>
    </nav>
  );
}
