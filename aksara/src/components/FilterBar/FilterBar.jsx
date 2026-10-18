import { useEffect, useRef, useState } from 'react';
import styles from './FilterBar.module.css';
import iconFilter from '../../assets/icon-filter.svg';
import iconRemove from '../../assets/icon-filter-remove.svg';
import iconChevron from '../../assets/icon-chevron-down-filter.svg';

// Urutan & label sesuai Figma (Eksplorasi — Sebelum Pencarian)
export const FILTER_GROUPS = [
  {
    key: 'fakultas',
    label: 'Fakultas',
    options: [
      'Fakultas Informatika (FIF)',
      'Fakultas Teknik Elektro (FTE)',
      'Fakultas Rekayasa Industri (FRI)',
      'Fakultas Ekonomi & Bisnis (FEB)',
      'Fakultas Komunikasi & Ilmu Sosial (FKS)',
      'Fakultas Industri Kreatif (FIK)',
      'Fakultas Ilmu Terapan (FIT)',
    ],
  },
  {
    key: 'prodi',
    label: 'Program Studi',
    options: ['S1 Informatika', 'S1 Rekayasa Perangkat Lunak', 'S1 Teknologi Informasi', 'S1 Data Sains'],
  },
  {
    key: 'semester',
    label: 'Semester 3 & 5',
    options: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8+'],
  },
  {
    key: 'matkul',
    label: 'Mata Kuliah',
    options: ['Kecerdasan Buatan', 'Basis Data', 'Pemrograman Berbasis Objek', 'User Experience', 'Tugas Akhir'],
  },
  { key: 'format', label: 'Format', options: ['PDF', 'DOC', 'PPT', 'ZIP'] },
  { key: 'tahun', label: 'Tahun Upload', options: ['2026', '2025', '2024', '2023', '2022 ke bawah'] },
  { key: 'rating', label: 'Rating', options: ['★ 4.5 ke atas', '★ 4 ke atas', '★ 3 ke atas'] },
];

/**
 * @param {Record<string,string|null>} value  nilai terpilih per grup, mis. { fakultas: 'Fakultas Informatika (FIF)' }
 * @param {(key: string, option: string|null) => void} onChange
 * @param {() => void} onReset
 */
export default function FilterBar({ value = {}, onChange, onReset, groups = FILTER_GROUPS }) {
  const [open, setOpen] = useState(null); // { key, top, left }
  const menuRef = useRef(null);

  // Tutup menu saat klik di luar, tekan Esc, scroll, atau resize
  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(null);
    const onDown = (e) => {
      if (!menuRef.current?.contains(e.target) && !e.target.closest?.('[data-filter-trigger]')) close();
    };
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const toggleMenu = (key, e) => {
    if (open?.key === key) return setOpen(null);
    const r = e.currentTarget.getBoundingClientRect();
    setOpen({ key, top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - 248) });
  };

  const choose = (key, option) => {
    onChange?.(key, option);
    setOpen(null);
  };

  const openGroup = groups.find((g) => g.key === open?.key);

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
              {groups.map((g) => {
                const selected = value[g.key];
                const isOpen = open?.key === g.key;
                return selected ? (
                  <span key={g.key} className={`${styles.chip} ${styles.chipActive}`}>
                    <button
                      type="button"
                      className={styles.chipMain}
                      data-filter-trigger
                      aria-haspopup="listbox"
                      aria-expanded={isOpen}
                      onClick={(e) => toggleMenu(g.key, e)}
                    >
                      <span className={styles.dot} />
                      <span>{selected}</span>
                    </button>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => choose(g.key, null)}
                      aria-label={`Hapus filter ${selected}`}
                    >
                      <img src={iconRemove} alt="" className={styles.removeIcon} />
                    </button>
                  </span>
                ) : (
                  <button
                    key={g.key}
                    type="button"
                    className={`${styles.chip} ${isOpen ? styles.chipOpen : ''}`}
                    data-filter-trigger
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    onClick={(e) => toggleMenu(g.key, e)}
                  >
                    <span>{g.label}</span>
                    <img src={iconChevron} alt="" className={styles.chevron} />
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" className={styles.reset} onClick={onReset}>
            Reset Filter
          </button>
        </div>
      </div>

      {openGroup && (
        <ul
          ref={menuRef}
          className={styles.menu}
          role="listbox"
          aria-label={openGroup.label}
          style={{ top: open.top, left: open.left }}
        >
          {openGroup.options.map((opt) => {
            const active = value[openGroup.key] === opt;
            return (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`${styles.option} ${active ? styles.optionActive : ''}`}
                  onClick={() => choose(openGroup.key, active ? null : opt)}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
