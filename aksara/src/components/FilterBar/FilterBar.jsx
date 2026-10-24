import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './FilterBar.module.css';
import { PRODI_FIF } from '../../data/academic';
import { USE_API } from '../../services/api';
import { listResources } from '../../services/resources';
import useAsync from '../../hooks/useAsync';
import iconFilter from '../../assets/icon-filter.svg';
import iconRemove from '../../assets/icon-filter-remove.svg';
import iconChevron from '../../assets/icon-chevron-down-filter.svg';

// Urutan & label sesuai Figma (Eksplorasi — Sebelum Pencarian)
const FILTER_GROUPS = [
  {
    key: 'prodi',
    label: 'Program Studi',
    options: PRODI_FIF,
  },
  {
    key: 'semester',
    label: 'Semester',
    options: [
      'Semester 1',
      'Semester 2',
      'Semester 3',
      'Semester 4',
      'Semester 5',
      'Semester 6',
      'Semester 7',
      'Semester 8+',
    ],
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
 * @param {Record<string,string|null>} value  nilai terpilih per grup, mis. { prodi: 'S1 Informatika' }
 * @param {(key: string, option: string|null) => void} onChange
 * @param {() => void} onReset
 * @param {boolean} sticky  ikut menempel di bawah header saat halaman di-scroll
 */
/**
 * Mode API: pilihan Mata Kuliah = mata kuliah dari resource yang sudah ada, Format tanpa ZIP (ditolak backend).
 */
function useApiGroups(enabled) {
  const { data: courses } = useAsync(
    () =>
      enabled
        ? listResources({}, { withSamples: true })
            .then((rows) =>
              [...new Set(rows.map((r) => r.matkul).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'))
            )
            .catch(() => [])
        : Promise.resolve(null),
    [enabled]
  );
  if (!enabled) return null;
  return FILTER_GROUPS.map((g) => {
    if (g.key === 'matkul') return { ...g, options: courses || [] };
    if (g.key === 'format') return { ...g, options: g.options.filter((o) => o !== 'ZIP') };
    return g;
  }).filter((g) => g.options.length > 0);
}

export default function FilterBar({ value = {}, onChange, onReset, groups: groupsProp, sticky = false }) {
  const apiGroups = useApiGroups(USE_API && !groupsProp);
  const groups = groupsProp || apiGroups || FILTER_GROUPS;
  const [open, setOpen] = useState(null); // { key, top, left }
  const menuRef = useRef(null);
  const hitboxRef = useRef(null);
  const [stuck, setStuck] = useState(null); // null = tidak menempel, angka = tinggi header (px)

  // Bar asli ada di dalam hero (overflow: hidden), jadi saat sudah lewat di bawah header
  // kita tampilkan salinan yang menempel (fixed) tepat di bawah header.
  useEffect(() => {
    if (!sticky) return undefined;
    const update = () => {
      const el = hitboxRef.current;
      if (!el) return;
      const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      const below = el.getBoundingClientRect().bottom < headerBottom;
      setStuck(below ? Math.max(0, Math.round(headerBottom)) : null);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sticky]);

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

  const bar = (
    <div className={styles.filter}>
      <div className={styles.scroller}>
        <div className={styles.selection}>
          <div className={styles.label}>
            <img src={iconFilter} alt="" className={styles.labelIcon} />
            <span>Filter :</span>
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
  );

  return (
    <div className={styles.hitbox} ref={hitboxRef}>
      {bar}
      {stuck !== null &&
        createPortal(
          <div className={styles.floating} style={{ top: stuck }}>
            <div className={styles.floatingInner}>{bar}</div>
          </div>,
          document.body
        )}

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
