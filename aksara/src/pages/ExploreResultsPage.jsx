import { useState } from 'react';
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

export default function ExploreResultsPage() {
  const [sort, setSort] = useState('Paling Relevan');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const { data: results, loading, error, reload } = useAsync(() => listResources({ q }), [q]);
  const items = results || [];

  return (
    <div className={styles.page}>
      <Header />

      <main>
        <Hero
          key={q}
          variant="compact"
          initialQuery={q}
          onSearch={({ query }) => {
            setParams(query ? { q: query } : {});
            setPage(1);
          }}
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
              {filterOpen ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
            </button>
            <div className={`${styles.sidebarWrap} ${filterOpen ? styles.sidebarOpen : ''}`}>
              <FilterSidebar
                onApply={(f) => {
                  console.log('filter', f);
                  setFilterOpen(false);
                }}
              />
            </div>

            <div className={styles.results}>
              <ResultsToolbar
                title={q ? `Hasil untuk “${q}”` : 'Hasil Eksplorasi'}
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
                      ? `Tidak ada hasil untuk “${q}”. Coba kata kunci lain.`
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
