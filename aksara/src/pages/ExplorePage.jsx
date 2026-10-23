import { useState } from 'react';
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

function CardRow({ items }) {
  return (
    <div className={styles.cardGrid}>
      {items.map((r) => (
        <ResourceCard key={r.id} resource={r} />
      ))}
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
  // GET /resource-relevan (publik) — halaman pertama, 12 resource terbaru yang sudah disetujui
  const {
    data: relevantData,
    loading: relevantLoading,
    error: relevantError,
    reload: reloadRelevant,
  } = useAsync(listRelevant, []);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('Paling Relevan');
  const [view, setView] = useState('grid');
  const relevant = sortResources(relevantData || [], sort);

  // Mode API: bagian di bawah diisi dari resource asli (bukan data contoh); bagian kosong disembunyikan
  const live = relevantData || [];
  const byRating = (list) => [...list].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
  const research = USE_API
    ? live.filter((r) => ['riset', 'skripsi'].includes(r.thumb || r.category)).slice(0, 4)
    : facultyResearch;
  const courses = USE_API ? byRating(live.filter((r) => r.matkul)).slice(0, 4) : favoriteCourses;
  const trendingItems = USE_API ? byRating(live).slice(0, 4) : trending;
  const [page, setPage] = useState(1);
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
        <section className={styles.results}>
          <div className={styles.resultsInner}>
            <ResultsToolbar
              title="Resource Relevan untuk Kamu"
              sort={sort}
              onSortChange={setSort}
              view={view}
              onViewChange={setView}
            />

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
                {relevant.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            ) : (
              <div className={styles.list}>
                {relevant.map((r) => (
                  <ResourceListItem key={r.id} resource={r} />
                ))}
              </div>
            )}

            {/* Halaman berikutnya ada di Hasil Eksplorasi (semua resource) */}
            {relevant.length > 0 && (
              <div className={styles.paginationSpacing}>
                <Pagination page={page} totalPages={USE_API ? 1 : 12} onChange={setPage} />
              </div>
            )}
          </div>
        </section>

        {/* Terakhir Dilihat — hanya untuk yang sudah login & pernah membuka resource */}
        {recent.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionInner}>
              <SectionHeader icon={iconHistory} title="Terakhir Dilihat" />
              <div className={styles.list}>
                {recent.map((r) => (
                  <ResourceListItem key={r.id} resource={r} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Karya Riset Fakultas Informatika */}
        {research.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionInner}>
              <SectionHeader
                icon={iconUniversity}
                title="Karya Riset Fakultas Informatika"
                to="/eksplorasi/hasil?kategori=riset"
              />
              <CardRow items={research} />
            </div>
          </section>
        )}

        {/* Mata Kuliah Favorit */}
        {courses.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionInner}>
              <SectionHeader icon={iconStar} title="Mata Kuliah Favorit" />
              <CardRow items={courses} />
            </div>
          </section>
        )}

        {/* Sedang Trending */}
        {trendingItems.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionInner}>
              <SectionHeader
                icon={iconTrending}
                title="Sedang Trending di AKSARA"
                to="/eksplorasi/hasil?urut=populer"
              />
              <CardRow items={trendingItems} />
            </div>
          </section>
        )}
      </main>

      <div className={styles.footerSpacer} />
      <Footer />
    </div>
  );
}
