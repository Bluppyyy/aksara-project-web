// Komponen kecil yang dipakai bersama oleh ResourceCard & ResourceListItem
import styles from './shared.module.css';
import { CATEGORIES } from '../../data/resources';
import iconTugas from '../../assets/icon-cat-tugas.svg';
import iconRiset from '../../assets/icon-cat-riset.svg';
import iconMagang from '../../assets/icon-cat-magang.svg';
import iconPdf from '../../assets/icon-format-pdf.svg';
import iconBookmark from '../../assets/icon-bookmark.svg';
import iconBookmarkActive from '../../assets/icon-bookmark-active.svg';

// Kategori yang belum punya ikon tersendiri di komponen Figma memakai ikon terdekat
const CATEGORY_ICONS = {
  tugas: iconTugas,
  project: iconTugas,
  skripsi: iconMagang,
  ujian: iconTugas,
  bank: iconTugas,
  riset: iconRiset,
  magang: iconMagang,
  lainnya: iconTugas,
};

export function CategoryBadge({ category }) {
  if (!CATEGORIES[category]) category = 'lainnya';
  return (
    <span className={styles.category}>
      <img src={CATEGORY_ICONS[category]} alt="" className={styles.categoryIcon} />
      {CATEGORIES[category]}
    </span>
  );
}

export function FormatBadge({ format = 'PDF' }) {
  return (
    <span className={styles.format}>
      <img src={iconPdf} alt="" className={styles.formatIcon} />
      {format}
    </span>
  );
}

/** Foto sampul kartu (kalau ada). Dipasang absolut di belakang badge. */
export function Thumbnail({ src }) {
  if (!src) return null;
  return <img src={src} alt="" className={styles.thumbnail} loading="lazy" />;
}

/** variant: "glass" (di atas foto / gradient biru) | "solid" (abu-abu, dipakai di list item) */
export function BookmarkButton({ active, onToggle, variant = 'glass' }) {
  return (
    <button
      type="button"
      className={`${styles.bookmark} ${variant === 'solid' ? styles.bookmarkSolid : ''}`}
      aria-pressed={active}
      aria-label={active ? 'Hapus bookmark' : 'Simpan ke bookmark'}
      onClick={onToggle}
    >
      <span className={styles.bookmarkIconBox}>
        <img
          src={active ? iconBookmarkActive : iconBookmark}
          alt=""
          className={active ? styles.bookmarkIconActive : styles.bookmarkIcon}
        />
      </span>
    </button>
  );
}
