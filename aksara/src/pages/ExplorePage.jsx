import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { writeFilters } from '../utils/filters';
import { getRecent } from '../utils/recent';
import { listRelevant, refreshRecent } from '../services/resources';
import { USE_API } from '../services/api';
import useAsync from '../hooks/useAsync';
import { Loading, ErrorState, Empty } from '../components/Status/Status.jsx';
import { sortResources } from '../utils/filters';
import { useAuth } from '../context/useAuth';
import styles from './ExplorePage.module.css';
import Header from '../components/Header/Header.jsx';
import Hero from '../components/Hero/Hero.jsx';
import FilterBar from '../components/FilterBar/FilterBar.jsx';
import ResultsToolbar from '../components/ResultsToolbar/ResultsToolbar.jsx';
import ResourceCard from '../components/ResourceCard/ResourceCard.jsx';
import ResourceListItem from '../components/ResourceListItem/ResourceListItem.jsx';
import Pagination from '../components/Pagination/Pagination.jsx';
import SectionHeader from '../components/SectionHeader/SectionHeader.jsx';
import Footer from '../components/Footer/Footer.jsx';
import iconHistory from '../assets/icon-history.svg';
import iconUniversity from '../assets/icon-university.svg';
import iconStar from '../assets/icon-star-section.svg';
import iconTrending from '../assets/icon-trending-up.svg';
import { facultyResearch, favoriteCourses, trending } from '../data/resources';

const PER_PAGE = 12;
const STAGGER_MS = 45; // jeda antar kartu saat animasi masuk

/** Props animasi masuk: kosong kalau animasi sudah selesai (halaman berikutnya / sortir tidak dianimasikan ulang) */
const popIn = (on, delay) => (on ? { className: 'anim-pop-in', style: { '--pop-delay': `${delay}ms` } } : {});

function CardRow({ items, intro, baseDelay }) {
  return (
    <div className={styles.cardGrid}>
      {items.map((r, i) => {
        const pop = popIn(intro, baseDelay + i * STAGGER_MS);
        return (
          <div key={r.id} className={`${styles.cardItem} ${pop.className || ''}`} style={pop.style}>
            <ResourceCard resource={r} />
          </div>
        );
      })}
    </div>
  );
}

export default function ExplorePage() {
  const user = useAuth();
  const savedRecent = user ? getRecent(user) : [];
  // Mode API: riwayat baru ditampilkan setelah dicocokkan dengan data backend terbaru,
  // supaya resource yang sudah dihapus/disembunyikan tidak sempat muncul lalu hilang.
  const { data: freshRecent } = useAsync(() => refreshRecent(savedRecent), [user?.email]);
  const recent = USE_API ? freshRecent || [] : savedRecent;
  // Semua resource yang sudah disetujui (GET /resource-relevan) + katalog contoh, dipaginasi 12 per halaman
  const {
    data: relevantData,
    loading: relevantLoading,
    error: relevantError,
    reload: reloadRelevant,
  } = useAsync(listRelevant, []);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('Paling Relevan');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const relevant = sortResources(relevantData || [], sort);
  const totalPages = Math.max(1, Math.ceil(relevant.length / PER_PAGE));
  const pageItems = relevant.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Animasi masuk hanya saat halaman pertama dimuat. Kartu menyusul setelah filter bar (±620 ms sejak halaman
  // tampil); kalau data datang lebih lambat, jedanya dikurangi supaya kartu tidak menunggu terlalu lama.
  const mountedAt = useRef(performance.now());
  const [intro, setIntro] = useState(true);
  const [cardBase, setCardBase] = useState(620);
  useEffect(() => {
    if (relevantLoading) return undefined;
    setCardBase(Math.max(0, 620 - Math.round(performance.now() - mountedAt.current)));
    const t = setTimeout(() => setIntro(false), 2600); // 1 s animasi + jeda stagger terakhir
    return () => clearTimeout(t);
  }, [relevantLoading]);

  const goToPage = (n) => {
    setPage(n);
    document.getElementById('relevant-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const changeSort = (value) => {
    setSort(value);
    setPage(1); // urutan berubah → kembali ke halaman 1
  };

  // Bagian di bawah diisi dari daftar yang sama (data backend + katalog contoh); data contoh lama hanya cadangan
  const live = relevantData || [];
  const byRating = (list) => [...list].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
  const pick = (list, fallback) => (list.length ? list : USE_API ? [] : fallback);
  const research = pick(
    live.filter((r) => ['riset', 'skripsi'].includes(r.thumb || r.category)).slice(0, 4),
    facultyResearch
  );
  const courses = pick(byRating(live.filter((r) => r.matkul)).slice(0, 4), favoriteCourses);
  // Trending = paling banyak diunduh (sama dengan tautan "Lihat Semua" → urut=populer)
  const trendingItems = pick(sortResources(live, 'Paling Banyak Diunduh').slice(0, 4), trending);
  const navigate = useNavigate();

  // Alur Figma: Eksplorasi (sebelum pencarian) → Eksplorasi — Hasil Pencarian.
  // Filter dari FilterBar dibawa lewat URL dan dibaca ulang oleh halaman hasil (utils/filters.js).
  const goToResults = ({ q, kategori } = {}) => {
    const f = filters;
    const tahun = f.tahun
      ? /ke bawah/.test(f.tahun)
        ? [2010, parseInt(f.tahun, 10)]
        : [+f.tahun, +f.tahun]
      : undefined;
    const rating = f.rating ? [parseFloat(f.rating.replace(/[^\d.]/g, '')), 5] : undefined;
    const search = new URLSearchParams(
      writeFilters({
        q,
        kategori: kategori ? [kategori] : [],
        fakultas: f.fakultas,
        prodi: f.prodi,
        semester: f.semester ? [parseInt(f.semester.replace(/\D/g, ''), 10)] : [],
        matkul: f.matkul ? [f.matkul] : [],
        format: f.format ? [f.format] : [],
        tahun,
        rating,
      })
    ).toString();
    navigate(search ? `/eksplorasi/hasil?${search}` : '/eksplorasi/hasil');
  };

  return (
    <div className={styles.page}>
      <Header />

      <main>
        <Hero
          animate
          onSearch={({ query, category }) => goToResults({ q: query, kategori: category })}
          onCategoryChange={(category, query) => {
            // "Semua" tetap di halaman ini; kategori lain langsung menampilkan hasil eksplorasi
            if (category) goToResults({ q: query, kategori: category });
          }}
        >
          <FilterBar
            sticky
            value={filters}
            onChange={(key, option) => setFilters((f) => ({ ...f, [key]: option }))}
            onReset={() => setFilters({})}
          />
        </Hero>

        {/* Resource Relevan untuk Kamu */}
        <section id="relevant-results" className={styles.results}>
          <div className={styles.resultsInner}>
            <div {...popIn(intro, 620)}>
              <ResultsToolbar
                title="Resource Relevan untuk Kamu"
                sort={sort}
                onSortChange={changeSort}
                view={view}
                onViewChange={setView}
              />
            </div>

            {relevantLoading ? (
              <Loading label="Memuat resource…" />
            ) : relevantError ? (
              <ErrorState error={relevantError} onRetry={reloadRelevant} />
            ) : relevant.length === 0 ? (
              <Empty
                title="Belum ada resource"
                description="Resource yang sudah disetujui admin akan muncul di sini."
              />
            ) : view === 'grid' ? (
              <div className={styles.cardGridResults}>
                {pageItems.map((r, i) => {
                  const pop = popIn(intro, cardBase + i * STAGGER_MS);
                  return (
                    <div key={r.id} className={`${styles.cardItem} ${pop.className || ''}`} style={pop.style}>
                      <ResourceCard resource={r} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.list}>
                {pageItems.map((r, i) => (
                  <div key={r.id} {...popIn(intro, cardBase + i * STAGGER_MS)}>
                    <ResourceListItem resource={r} />
                  </div>
                ))}
              </div>
            )}

            {!relevantLoading && !relevantError && totalPages > 1 && (
              <div className={styles.paginationSpacing}>
                <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
              </div>
            )}
          </div>
        </section>

        {/* Terakhir Dilihat — hanya untuk yang sudah login & pernah membuka resource */}
        {recent.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionInner}>
              <div {...popIn(intro, cardBase + 250)}>
                <SectionHeader icon={iconHistory} title="Terakhir Dilihat" />
              </div>
              <div className={styles.list}>
                {recent.map((r, i) => (
                  <div key={r.id} {...popIn(intro, cardBase + 280 + i * STAGGER_MS)}>
                    <ResourceListItem resource={r} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Karya Riset Fakultas Informatika */}
        {research.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionInner}>
              <div {...popIn(intro, cardBase + 300)}>
                <SectionHeader
                  icon={iconUniversity}
                  title="Karya Riset Fakultas Informatika"
                  to="/eksplorasi/hasil?kategori=riset"
                />
              </div>
              <CardRow items={research} intro={intro} baseDelay={cardBase + 300} />
            </div>
          </section>
        )}

        {/* Mata Kuliah Favorit */}
        {courses.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionInner}>
              <div {...popIn(intro, cardBase + 400)}>
                <SectionHeader icon={iconStar} title="Mata Kuliah Favorit" />
              </div>
              <CardRow items={courses} intro={intro} baseDelay={cardBase + 400} />
            </div>
          </section>
        )}

        {/* Sedang Trending */}
        {trendingItems.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionInner}>
              <div {...popIn(intro, cardBase + 500)}>
                <SectionHeader
                  icon={iconTrending}
                  title="Sedang Trending di AKSARA"
                  to="/eksplorasi/hasil?urut=populer"
                />
              </div>
              <CardRow items={trendingItems} intro={intro} baseDelay={cardBase + 500} />
            </div>
          </section>
        )}
      </main>

      <div className={styles.footerSpacer} />
      <Footer />
    </div>
  );
}
