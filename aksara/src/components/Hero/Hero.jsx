import { useState } from 'react';
import styles from './Hero.module.css';
import heroBg from '../../assets/hero-bg.png';
import iconSearch from '../../assets/icon-search.svg';
import btnSubmitSearch from '../../assets/btn-submit-search.svg';
import btnSubmitSearchAlt from '../../assets/btn-submit-search-alt.svg';

const QUICK_CATEGORIES = [
  'Semua',
  'Tugas Kuliah & Makalah',
  'Laporan Magang & PKL',
  'Skripsi & Tugas Akhir',
  'Bank Soal',
  'Riset & Publikasi Paper',
  'Modul Praktikum',
  'Lainnya',
];

/**
 * variant:
 *  - "center"  → hero tinggi, judul di tengah (Explore sebelum search)
 *  - "compact" → hero pendek, rata kiri (Explore setelah search)
 */
export default function Hero({ variant = 'center', initialQuery = '', onSearch, children }) {
  const compact = variant === 'compact';
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('Semua');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.({ query: query.trim(), category: activeCategory });
  };

  return (
    <section className={`${styles.hero} ${compact ? styles.compact : ''}`}>
      <img src={heroBg} alt="" className={styles.background} />
      <div className={`${styles.blob} ${styles.blobOrange}`} aria-hidden="true" />
      <div className={`${styles.blob} ${styles.blobBlue}`} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.heading}>
          <h1 className={styles.title}>
            Eksplorasi Karya, Riset, &amp; Pengalaman
            <br />
            Belajar
          </h1>
          <p className={styles.description}>
            Akses mandiri ke lebih dari 12.800 berkas terverifikasi: Tugas Besar, Laporan PKL, Esai
            Beasiswa, dan Ringkasan Lab Telkom University.
          </p>
        </div>

        <div className={styles.searchGroup}>
          <form className={styles.searchCard} onSubmit={handleSubmit} role="search">
            <div className={styles.searchRow}>
              <label className={styles.searchInput}>
                <img src={iconSearch} alt="" className={styles.searchIcon} />
                <span className="visually-hidden">Cari resource</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari judul referensi, nama mata kuliah, atau laporan magang..."
                />
              </label>
              <button type="submit" className={styles.submitButton} aria-label="Cari">
                <img src={compact ? btnSubmitSearchAlt : btnSubmitSearch} alt="" />
              </button>
            </div>

            <div className={styles.categories} role="group" aria-label="Kategori cepat">
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.categoryChip} ${cat === activeCategory ? styles.categoryChipActive : ''}`}
                  aria-pressed={cat === activeCategory}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </form>

          {/* Slot untuk FilterBar, menempel tepat di bawah search bar */}
          {children}
        </div>
      </div>
    </section>
  );
}
