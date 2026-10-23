import { useState } from 'react';
import styles from './CollectionPage.module.css';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import ResourceCard from '../components/ResourceCard/ResourceCard.jsx';
import ArticleCard from '../components/ArticleCard/ArticleCard.jsx';
import { listBookmarks } from '../services/resources';
import { listArticleBookmarks } from '../services/insights';
import useDragScroll from '../hooks/useDragScroll';
import useAsync from '../hooks/useAsync';
import { Loading, ErrorState, Empty } from '../components/Status/Status.jsx';
import { Link } from 'react-router-dom';
import { USE_API } from '../services/api';
import { sortResources } from '../utils/filters';
import iconSearch from '../assets/koleksi/icon-search.svg';
import iconChevron from '../assets/wawasan/icon-chevron.svg';

const FILTERS = ['Semua', 'Tugas Akhir', 'Praktikum', 'Magang & KP'];
// Mode demo: label pill → kunci kategori data contoh
const DEMO_FILTER_KEYS = {
  'Tugas Akhir': ['skripsi', 'riset'],
  Praktikum: ['project', 'tugas'],
  'Magang & KP': ['magang'],
};
const SORTS = ['Terbaru', 'Terlama', 'Rating Tertinggi'];
const WAWASAN = 'Wawasan';

/** Resource + wawasan yang disimpan (GET /bookmark mengirim keduanya) */
const loadCollection = () =>
  Promise.all([listBookmarks(), listArticleBookmarks()]).then(([resources, insights]) => [
    ...resources,
    ...insights.map((a) => ({ ...a, kind: 'wawasan' })),
  ]);

export default function CollectionPage() {
  const [filter, setFilter] = useState('Semua');
  const pillsRef = useDragScroll();
  const [sort, setSort] = useState('Terbaru');
  const [query, setQuery] = useState('');

  const { data, loading, error, reload, setData } = useAsync(loadCollection, []);
  const all = data || [];
  // Mode API: pill = kategori resource yang ada di koleksi (nama dari database) + "Wawasan" kalau ada tulisan tersimpan
  const filters = USE_API
    ? [
        'Semua',
        ...new Set(
          all
            .filter((r) => r.kind !== 'wawasan')
            .map((r) => r.categoryLabel)
            .filter(Boolean)
        ),
        ...(all.some((r) => r.kind === 'wawasan') ? [WAWASAN] : []),
      ]
    : FILTERS;
  const matchFilter = (r) => {
    if (filter === 'Semua') return true;
    if (filter === WAWASAN) return r.kind === 'wawasan';
    if (r.kind === 'wawasan') return false;
    return USE_API ? r.categoryLabel === filter : (DEMO_FILTER_KEYS[filter] || []).includes(r.category);
  };
  const items = sortResources(
    all.filter((r) => matchFilter(r) && r.title.toLowerCase().includes(query.trim().toLowerCase())),
    sort
  );
  // Hapus kartu dari koleksi saat bookmark-nya dilepas
  const handleChange = (item) => (on) => !on && setData(all.filter((r) => r !== item));

  return (
    <div className={styles.page}>
      <Header bookmarkActive />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Koleksi Saya</h1>
          <p className={styles.subtitle}>Simpanan referensi dan wawasan akademik Anda.</p>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.searchWrap}>
            <img src={iconSearch} alt="" className={styles.searchIcon} />
            <span className="visually-hidden">Cari dalam koleksi</span>
            <input
              type="search"
              className={styles.search}
              placeholder="Cari dalam koleksi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <div className={styles.filters}>
            <div ref={pillsRef} className={styles.pills} role="group" aria-label="Filter koleksi">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  className={`${styles.pill} ${filter === f ? styles.pillActive : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <label className={styles.sort}>
              <span>
                Urutkan: <strong>{sort}</strong>
              </span>
              <img src={iconChevron} alt="" className={styles.sortIcon} />
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutkan koleksi">
                {SORTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <Loading label="Memuat koleksi…" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : items.length === 0 ? (
          <Empty
            title={query || filter !== 'Semua' ? 'Tidak ada yang cocok' : 'Koleksimu masih kosong'}
            description={
              query || filter !== 'Semua'
                ? 'Coba kata kunci lain.'
                : 'Simpan resource atau wawasan dengan ikon bookmark supaya mudah ditemukan lagi.'
            }
            action={
              !query &&
              filter === 'Semua' && (
                <Link
                  to="/eksplorasi"
                  className={styles.pillActive}
                  style={{ padding: '8px 16px', borderRadius: 9999, marginTop: 8 }}
                >
                  Mulai Eksplorasi
                </Link>
              )
            }
          />
        ) : (
          <div className={styles.grid}>
            {items.map((r) =>
              r.kind === 'wawasan' ? (
                <ArticleCard key={`w-${r.id}`} article={r} onBookmarkChange={handleChange(r)} />
              ) : (
                <ResourceCard key={`r-${r.id}`} resource={r} onBookmarkChange={handleChange(r)} />
              )
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
