import { useState } from 'react';
import styles from './WawasanPage.module.css';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import ArticleCard from '../components/ArticleCard/ArticleCard.jsx';
import Pagination from '../components/Pagination/Pagination.jsx';
import { articles } from '../data/articles';
import heroBg from '../assets/wawasan/hero-bg.png';
import featuredImg from '../assets/wawasan/featured.png';
import iconEditor from '../assets/wawasan/icon-editor.svg';
import iconSorotan from '../assets/wawasan/icon-sorotan.svg';
import iconUser from '../assets/wawasan/icon-user.svg';
import iconArrow from '../assets/wawasan/icon-arrow-right.svg';
import iconMagang from '../assets/wawasan/icon-cat-magang.svg';
import iconBeasiswa from '../assets/wawasan/icon-cat-beasiswa.svg';
import iconKampus from '../assets/wawasan/icon-cat-kampus.svg';
import iconKarir from '../assets/wawasan/icon-cat-karir.svg';
import iconRiset from '../assets/wawasan/icon-cat-riset.svg';
import iconSearch from '../assets/wawasan/icon-search.svg';
import iconChevron from '../assets/wawasan/icon-chevron.svg';

const CATEGORIES = [
  { label: 'Semua Tulisan' },
  { label: 'Pengalaman Magang & KP', icon: iconMagang, w: 15, h: 14.25 },
  { label: 'Tips Beasiswa & Exchange', icon: iconBeasiswa, w: 15.51, h: 13.613 },
  { label: 'Kehidupan Kampus & Hima', icon: iconKampus, w: 16.5, h: 13.5 },
  { label: 'Karir, Portofolio & Alumni', icon: iconKarir, w: 15.035, h: 15.053 },
  { label: 'Tips Riset & Publikasi Ilmiah', icon: iconRiset, w: 10.5, h: 14.25 },
];
const SORTS = ['Terpopuler', 'Terbaru', 'Paling Banyak Disimpan'];

export default function WawasanPage() {
  const [category, setCategory] = useState('Semua Tulisan');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Terpopuler');
  const [page, setPage] = useState(1);

  const visible = articles.filter((a) => {
    const q = query.trim().toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.author.name.toLowerCase().includes(q);
  });

  return (
    <div className={styles.page}>
      <Header />

      <main>
        {/* Hero + artikel unggulan */}
        <section className={styles.hero}>
          <img src={heroBg} alt="" className={styles.heroBg} />
          <div className={`${styles.blob} ${styles.blobOrange}`} aria-hidden="true" />
          <div className={`${styles.blob} ${styles.blobCream}`} aria-hidden="true" />

          <div className={styles.heroInner}>
            <div className={styles.heading}>
              <h1 className={styles.title}>Wawasan &amp; Pengalaman</h1>
              <p className={styles.description}>
                Ruang berbagi cerita magang industri, rahasia lolos beasiswa internasional, tips riset,
                hingga dinamika kehidupan kampus dari civitas akademika Telkom University.
              </p>
            </div>

            <article className={styles.featured}>
              <div className={styles.featuredMedia}>
                <img src={featuredImg} alt="" className={styles.featuredImg} />
                <span className={styles.editorBadge}>
                  <img src={iconEditor} alt="" />
                  Pilihan Editor
                </span>
              </div>

              <div className={styles.featuredBody}>
                <div className={styles.featuredTop}>
                  <div className={styles.featuredMeta}>
                    <span className={styles.sorotan}>
                      <img src={iconSorotan} alt="" />
                      SOROTAN UTAMA
                    </span>
                    <span className={styles.dot} />
                    <span className={styles.batch}>Batch 8 - 2025</span>
                  </div>
                  <h2 className={styles.featuredTitle}>
                    <a href="#">
                      Panduan Lengkap Lolos Seleksi Magang Merdeka (MSIB) Batch 8 di Top National Tech &amp;
                      BUMN
                    </a>
                  </h2>
                  <p className={styles.featuredExcerpt}>
                    Bedah lengkap tahapan berkas CV ATS, tes kebinekaan, tips wawancara user dan studi kasus
                    nyata dari alumni yang berhasil ditempatkan di Traveloka, GoTo, dan Telkom…
                  </p>
                </div>

                <div className={styles.featuredFooter}>
                  <div className={styles.featuredAuthor}>
                    <span className={styles.featuredAvatar}>
                      <img src={iconUser} alt="" />
                    </span>
                    <div>
                      <p className={styles.featuredName}>Andi Pratama</p>
                      <p className={styles.featuredInfo}>
                        FIF ‘21 • S1 Informatika
                        <br />7 Menit Baca
                      </p>
                    </div>
                  </div>
                  <a href="#" className={styles.readMore}>
                    Baca Selengkapnya
                    <img src={iconArrow} alt="" />
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Daftar tulisan */}
        <section className={styles.content}>
          <div className={styles.toolbar}>
            <div className={styles.pills} role="group" aria-label="Kategori tulisan">
              {CATEGORIES.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  aria-pressed={category === c.label}
                  className={`${styles.pill} ${category === c.label ? styles.pillActive : ''}`}
                  onClick={() => setCategory(c.label)}
                >
                  {c.icon && <img src={c.icon} alt="" style={{ width: c.w, height: c.h }} />}
                  {c.label}
                </button>
              ))}
            </div>

            <div className={styles.controls}>
              <label className={styles.searchWrap}>
                <img src={iconSearch} alt="" className={styles.searchIcon} />
                <span className="visually-hidden">Cari tulisan</span>
                <input
                  type="search"
                  className={styles.search}
                  placeholder="Cari topik atau penulis..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label className={styles.sort}>
                <span className="visually-hidden">Urutkan</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((s) => (
                    <option key={s} value={s}>
                      Urutkan: {s}
                    </option>
                  ))}
                </select>
                <img src={iconChevron} alt="" className={styles.sortIcon} />
              </label>
            </div>
          </div>

          <div className={styles.gridWrap}>
            <div className={styles.gridHeader}>
              <h3>Tulisan Terbaru</h3>
            </div>
            <div className={styles.grid}>
              {visible.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
            {visible.length === 0 && <p className={styles.empty}>Tidak ada tulisan yang cocok.</p>}
          </div>

          <Pagination page={page} totalPages={12} onChange={setPage} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
