import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon/Icon.jsx';
import styles from './ExploreResultsPage.module.css';
import Header from '../components/Header/Header.jsx';
import Hero from '../components/Hero/Hero.jsx';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar.jsx';
import ResultsToolbar from '../components/ResultsToolbar/ResultsToolbar.jsx';
import ResourceCard from '../components/ResourceCard/ResourceCard.jsx';
import ResourceListItem from '../components/ResourceListItem/ResourceListItem.jsx';
import Pagination from '../components/Pagination/Pagination.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { listResources } from '../services/resources';
import useAsync from '../hooks/useAsync';
import { Loading, ErrorState, Empty } from '../components/Status/Status.jsx';
import { readFilters, writeFilters, countActive, sortResources } from '../utils/filters';
import { CATEGORIES } from '../data/resources';

const URUT_TO_SORT = { populer: 'Paling Banyak Diunduh', terbaru: 'Terbaru', rating: 'Rating Tertinggi' };

export default function ExploreResultsPage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);
  const [sort, setSort] = useState(URUT_TO_SORT[filters.urut] || 'Paling Relevan');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const q = filters.q;
  const kategori = filters.kategori.length === 1 ? filters.kategori[0] : null;
  const key = params.toString();
  // Data diambil ulang setiap filter di URL berubah
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { data: results, loading, error, reload } = useAsync(() => listResources(filters), [key]);
  const items = useMemo(() => sortResources(results || [], sort), [results, sort]);
  const active = countActive(filters);

  const updateParams = (next) => {
    setParams(writeFilters({ ...filters, ...next }));
    setPage(1);
  };

  const title = q
    ? `Hasil untuk “${q}”`
    : kategori
      ? `Kategori: ${CATEGORIES[kategori]}`
      : 'Hasil Eksplorasi';

  return (
    <div className={styles.page}>
      <Header />

      <main>
        <Hero
          key={`${q}|${kategori}`}
          variant="compact"
          initialQuery={q}
          initialCategory={kategori}
          onSearch={({ query, category }) => updateParams({ q: query, kategori: category ? [category] : filters.kategori })}
          onCategoryChange={(category) => updateParams({ kategori: category ? [category] : [] })}
        />

        <section className={styles.layout}>
          <div className={styles.inner}>
            {/* Di layar kecil, filter disembunyikan di balik tombol supaya hasil langsung terlihat */}
            <button
              type="button"
              className={styles.filterToggle}
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((o) => !o)}
            >
              <Icon icon="lucide:sliders-horizontal" size={16} />
              {filterOpen ? 'Sembunyikan Filter' : `Tampilkan Filter${active ? ` (${active})` : ''}`}
            </button>
            <div className={`${styles.sidebarWrap} ${filterOpen ? styles.sidebarOpen : ''}`}>
              <FilterSidebar
                key={key}
                value={filters}
                onApply={(f) => {
                  updateParams(f);
                  setFilterOpen(false);
                }}
              />
            </div>

            <div className={styles.results}>
              <ResultsToolbar
                title={title}
                count={loading ? null : items.length}
                sort={sort}
                onSortChange={setSort}
                view={view}
                onViewChange={setView}
              />

              {loading ? (
                <Loading label="Memuat resource…" />
              ) : error ? (
                <ErrorState error={error} onRetry={reload} />
              ) : items.length === 0 ? (
                <Empty
                  title="Resource tidak ditemukan"
                  description={
                    q
                      ? `Tidak ada hasil untuk “${q}”${active ? ' dengan filter yang dipilih' : ''}. Coba kata kunci lain atau reset filter.`
                      : active
                        ? 'Tidak ada resource yang cocok dengan filter. Coba kurangi filter.'
                        : 'Belum ada resource yang tersedia.'
                  }
                />
              ) : view === 'grid' ? (
                <div className={styles.grid}>
                  {items.map((r) => (
                    <ResourceCard key={r.id} resource={r} />
                  ))}
                </div>
              ) : (
                <div className={styles.list}>
                  {items.map((r) => (
                    <ResourceListItem key={r.id} resource={r} />
                  ))}
                </div>
              )}

              {/* Backend belum mendukung pagination; tampil kalau sudah ada meta.total_pages */}
              {!loading && !error && items.length > 0 && (
                <div className={styles.paginationSpacing}>
                  <Pagination page={page} totalPages={12} onChange={setPage} />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
