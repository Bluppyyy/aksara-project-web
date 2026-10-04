import styles from './ResultsToolbar.module.css';
import iconChevron from '../../assets/icon-chevron-down-sort.svg';
import iconGrid from '../../assets/icon-view-grid.svg';
import iconList from '../../assets/icon-view-list.svg';

export const SORT_OPTIONS = ['Paling Relevan', 'Terbaru', 'Rating Tertinggi', 'Paling Banyak Diunduh'];

export default function ResultsToolbar({ title, count, sort, onSortChange, view, onViewChange }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.titleGroup}>
        <h2 className={styles.title}>{title}</h2>
        {count != null && <span className={styles.count}>{count} resource ditemukan</span>}
      </div>

      <div className={styles.controls}>
        <label className={styles.sort}>
          <span className={styles.sortLabel}>Urutkan:</span>
          <span className={styles.selectWrap}>
            <select value={sort} onChange={(e) => onSortChange?.(e.target.value)} className={styles.select}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <img src={iconChevron} alt="" className={styles.selectChevron} />
          </span>
        </label>

        <div className={styles.viewToggle} role="group" aria-label="Tampilan">
          <button
            type="button"
            className={`${styles.viewButton} ${view === 'grid' ? styles.viewButtonActive : ''}`}
            aria-pressed={view === 'grid'}
            aria-label="Tampilan grid"
            onClick={() => onViewChange?.('grid')}
          >
            <img src={iconGrid} alt="" className={styles.iconGrid} />
          </button>
          <button
            type="button"
            className={`${styles.viewButton} ${view === 'list' ? styles.viewButtonActive : ''}`}
            aria-pressed={view === 'list'}
            aria-label="Tampilan list"
            onClick={() => onViewChange?.('list')}
          >
            <img src={iconList} alt="" className={styles.iconList} />
          </button>
        </div>
      </div>
    </div>
  );
}
