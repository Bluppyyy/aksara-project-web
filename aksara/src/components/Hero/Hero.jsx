import { useState } from 'react';
import styles from './Hero.module.css';
import heroBg from '../../assets/hero-bg.png';
import iconSearch from '../../assets/icon-search.svg';
import btnSubmitSearch from '../../assets/btn-submit-search.svg';
import btnSubmitSearchAlt from '../../assets/btn-submit-search-alt.svg';
import { QUICK_CATEGORIES } from '../../data/resources';
import { USE_API } from '../../services/api';
import { countResources } from '../../services/resources';
import useAsync from '../../hooks/useAsync';

/**
 * variant:
 *  - "center"  → hero tinggi, judul di tengah (Explore sebelum search)
 *  - "compact" → hero pendek, rata kiri (Explore setelah search)
 */
/**
 * onSearch({ query, category })   dipanggil saat form dikirim
 * onCategoryChange(category)       dipanggil saat chip kategori diklik (category = key atau null untuk "Semua")
 * animate                          animasi masuk (pop-in & fade-in) saat halaman pertama dimuat: judul & search bar
 *                                  lebih dulu, filter bar (children) menyusul 500 ms kemudian
 */
export default function Hero({
  variant = 'center',
  initialQuery = '',
  initialCategory = null,
  onSearch,
  onCategoryChange,
  animate = false,
  children,
}) {
  // Daftar kategori cepat tetap (tidak diganti data GET /kategori) supaya chip tidak berkedip saat halaman dimuat.
  // Di mode API, tiap kunci dicocokkan ke kategori database lewat categoryKeyOf() (services/master.js).
  const quickCategories = QUICK_CATEGORIES;
  // Mode API: jumlah berkas diambil dari database (berkas yang sudah disetujui admin)
  const { data: total } = useAsync(() => countResources().catch(() => null), []);
  // "Terverifikasi" = sudah disetujui admin. Angka baru ditampilkan kalau koleksinya sudah cukup banyak,
  // supaya tidak terbaca janggal seperti "ke 1 berkas".
  const heroLead = !USE_API
    ? 'Akses mandiri ke lebih dari 12.800 berkas terverifikasi'
    : total >= 50
      ? `Akses mandiri ke ${total.toLocaleString('id-ID')} berkas yang sudah diverifikasi admin`
      : 'Akses mandiri ke berkas akademik yang sudah diverifikasi admin';

  const compact = variant === 'compact';
  // Urutan animasi: judul 0 ms → search bar 80 ms → filter bar 580 ms (500 ms setelah search bar)
  const pop = (delay) => (animate ? { className: 'anim-pop-in', style: { '--pop-delay': `${delay}ms` } } : {});
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.({ query: query.trim(), category: activeCategory });
  };

  const handleCategory = (key) => {
    setActiveCategory(key);
    onCategoryChange?.(key, query.trim());
  };

  return (
    <section className={`${styles.hero} ${compact ? styles.compact : ''}`}>
      <img src={heroBg} alt="" className={styles.background} />
      <div className={`${styles.blob} ${styles.blobOrange}`} aria-hidden="true" />
      <div className={`${styles.blob} ${styles.blobBlue}`} aria-hidden="true" />

      <div className={styles.container}>
        <div className={`${styles.heading} ${animate ? 'anim-pop-in' : ''}`}>
          <h1 className={styles.title}>
            Eksplorasi Karya, Riset, &amp; Pengalaman
            <br />
            Belajar
          </h1>
          <p className={styles.description}>
            {heroLead}: Tugas Besar, Laporan PKL, Esai Beasiswa, dan Ringkasan Lab Telkom University.
          </p>
        </div>

        <div className={styles.searchGroup}>
          <form
            className={`${styles.searchCard} ${animate ? 'anim-pop-in' : ''}`}
            style={animate ? { '--pop-delay': '80ms' } : undefined}
            onSubmit={handleSubmit}
            role="search"
          >
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
              {quickCategories.map(({ key, label }) => (
                <button
                  key={label}
                  type="button"
                  className={`${styles.categoryChip} ${key === activeCategory ? styles.categoryChipActive : ''}`}
                  aria-pressed={key === activeCategory}
                  onClick={() => handleCategory(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </form>

          {/* Slot untuk FilterBar, menempel tepat di bawah search bar */}
          {animate && children ? <div {...pop(580)}>{children}</div> : children}
        </div>
      </div>
    </section>
  );
}
