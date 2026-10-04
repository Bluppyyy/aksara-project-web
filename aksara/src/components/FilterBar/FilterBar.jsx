import styles from './FilterBar.module.css';
import iconFilter from '../../assets/icon-filter.svg';
import iconRemove from '../../assets/icon-filter-remove.svg';
import iconChevron from '../../assets/icon-chevron-down-filter.svg';

export const FILTER_DROPDOWNS = ['Program Studi', 'Semester 3 & 5', 'Mata Kuliah', 'Format', 'Tahun Upload', 'Rating'];

/**
 * @param {string[]} activeFilters  filter yang sedang aktif (tampil sebagai chip biru)
 * @param {(label: string) => void} onRemove
 * @param {(label: string) => void} onOpenDropdown
 * @param {() => void} onReset
 */
export default function FilterBar({ activeFilters = [], onRemove, onOpenDropdown, onReset }) {
  return (
    <div className={styles.hitbox}>
      <div className={styles.filter}>
        <div className={styles.scroller}>
          <div className={styles.selection}>
            <div className={styles.label}>
              <img src={iconFilter} alt="" className={styles.labelIcon} />
              <span>FIlter :</span>
            </div>

            <div className={styles.values}>
              {activeFilters.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`${styles.chip} ${styles.chipActive}`}
                  onClick={() => onRemove?.(label)}
                  aria-label={`Hapus filter ${label}`}
                >
                  <span className={styles.dot} />
                  <span>{label}</span>
                  <img src={iconRemove} alt="" className={styles.removeIcon} />
                </button>
              ))}

              {FILTER_DROPDOWNS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={styles.chip}
                  aria-haspopup="listbox"
                  onClick={() => onOpenDropdown?.(label)}
                >
                  <span>{label}</span>
                  <img src={iconChevron} alt="" className={styles.chevron} />
                </button>
              ))}
            </div>
          </div>

          <button type="button" className={styles.reset} onClick={onReset}>
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
}
