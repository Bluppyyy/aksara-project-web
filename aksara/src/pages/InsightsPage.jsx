import { useState } from 'react';
import useDragScroll from '../hooks/useDragScroll';
import { Link } from 'react-router-dom';
import styles from './InsightsPage.module.css';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import ArticleCard from '../components/ArticleCard/ArticleCard.jsx';
import Pagination from '../components/Pagination/Pagination.jsx';
import { articles } from '../data/articles';
import { listArticles, categoryKey } from '../services/insights';
import { USE_API } from '../services/api';
import useAsync from '../hooks/useAsync';
import { Loading, ErrorState } from '../components/Status/Status.jsx';
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

// 3 sorotan utama di hero (carousel)
const FEATURED = [
  {
    to: '/wawasan/msib-telkomsel',
    image: featuredImg,
    tag: 'Batch 8 - 2025',
    title: 'Panduan Lengkap Lolos Seleksi Magang Merdeka (MSIB) Batch 8 di Top National Tech & BUMN',
    excerpt:
      'Bedah lengkap tahapan berkas CV ATS, tes kebinekaan, tips wawancara user dan studi kasus nyata dari alumni yang berhasil ditempatkan di Traveloka, GoTo, dan Telkom…',
    author: 'Andi Pratama',
    info: 'FIF ‘21 • S1 Informatika',
    readTime: '7 Menit Baca',
  },
  ...[articles[0], articles[2]].map((a) => ({
    to: `/wawasan/${a.id}`,
    image: a.image,
    tag: a.label.charAt(0) + a.label.slice(1).toLowerCase(),
    title: a.title,
    excerpt: a.excerpt,
    author: a.author.name,
    info: 'FIF • S1 Informatika',
    readTime: a.readTime.replace('min read', 'Menit Baca'),
  })),
];

export default function InsightsPage() {
  const [category, setCategory] = useState('Semua Tulisan');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Terpopuler');
  const [page, setPage] = useState(1);
  const [slide, setSlide] = useState(0);
  const [carouselReady, setCarouselReady] = useState(false);
  const trackRef = useDragScroll({ paged: true, ready: carouselReady });
  const pillsRef = useDragScroll();
  const goTo = (i) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: el.children[i].offsetLeft - el.children[0].offsetLeft, behavior: 'smooth' });
  };

  // Mode API: daftar dari GET /experience (yang sudah disetujui); mode demo: data contoh
  const { data: list, loading, error, reload } = useAsync(listArticles, []);
  const all = list || [];
  const featured = USE_API
    ? all.slice(0, 3).map((a) => ({
        to: `/wawasan/${a.id}`,
        image: a.image,
        tag: a.category || a.readTime,
        title: a.title,
        excerpt: a.excerpt,
        author: a.author.name,
        info: a.author.meta || 'Fakultas Informatika',
        readTime: a.readTime,
      }))
    : FEATURED;
  if (featured.length > 0 && !carouselReady) setCarouselReady(true);
  const visible = all.filter((a) => {
    const q = query.trim().toLowerCase();
    // Pill kategori menyaring berdasarkan kolom kategori dari GET /experience (mode demo: tidak menyaring)
    if (USE_API && category !== 'Semua Tulisan' && categoryKey(a.category || '') !== categoryKey(category))
      return false;
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
                Ruang berbagi cerita magang industri, rahasia lolos beasiswa internasional, tips riset, hingga dinamika
                kehidupan kampus dari civitas akademika Telkom University.
              </p>
            </div>

            {/* Sorotan utama: carousel 3 artikel, bisa digeser kiri-kanan */}
            {featured.length > 0 && (
              <div className={styles.carousel}>
                <div
                  ref={trackRef}
                  className={styles.track}
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    if (el.children.length < 2) return;
                    const page = el.children[1].offsetLeft - el.children[0].offsetLeft;
                    setSlide(Math.round(el.scrollLeft / page));
                  }}
                  aria-roledescription="carousel"
                  aria-label="Sorotan utama"
                >
                  {featured.map((f, i) => (
                    <article
                      key={f.to}
                      className={styles.featured}
                      aria-roledescription="slide"
                      aria-label={`${i + 1} dari ${featured.length}`}
                    >
                      <div className={styles.featuredMedia}>
                        <img src={f.image} alt="" className={styles.featuredImg} draggable="false" />
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
                            <span className={styles.batch}>{f.tag}</span>
                          </div>
                          <h2 className={styles.featuredTitle}>
                            <Link to={f.to} draggable="false">
                              {f.title}
                            </Link>
                          </h2>
                          <p className={styles.featuredExcerpt}>{f.excerpt}</p>
                        </div>

                        <div className={styles.featuredFooter}>
                          <div className={styles.featuredAuthor}>
                            <span className={styles.featuredAvatar}>
                              <img src={iconUser} alt="" />
                            </span>
                            <div>
                              <p className={styles.featuredName}>{f.author}</p>
                              <p className={styles.featuredInfo}>
                                {f.info}
                                <br />
                                {f.readTime}
                              </p>
                            </div>
                          </div>
                          <Link to={f.to} className={styles.readMore} draggable="false">
                            Baca Selengkapnya
                            <img src={iconArrow} alt="" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className={styles.dots} role="tablist" aria-label="Pilih sorotan">
                  {featured.map((f, i) => (
                    <button
                      key={f.to}
                      type="button"
                      role="tab"
                      aria-selected={slide === i}
                      aria-label={`Sorotan ${i + 1}`}
                      className={`${styles.dotBtn} ${slide === i ? styles.dotBtnOn : ''}`}
                      onClick={() => goTo(i)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Daftar tulisan */}
        <section className={styles.content}>
          <div className={styles.toolbar}>
            <div ref={pillsRef} className={styles.pills} role="group" aria-label="Kategori tulisan">
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
            {loading ? (
              <Loading label="Memuat tulisan…" />
            ) : error ? (
              <ErrorState error={error} onRetry={reload} />
            ) : (
              <>
                <div className={styles.grid}>
                  {visible.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
                {visible.length === 0 && (
                  <p className={styles.empty}>
                    {all.length ? 'Tidak ada tulisan yang cocok.' : 'Belum ada tulisan yang dipublikasikan.'}
                  </p>
                )}
              </>
            )}
          </div>

          {visible.length > 0 && <Pagination page={page} totalPages={USE_API ? 1 : 12} onChange={setPage} />}
        </section>
      </main>

      <Footer />
    </div>
  );
}
