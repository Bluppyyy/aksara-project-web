import { useState } from 'react';
import styles from './CollectionPage.module.css';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import ResourceCard from '../components/ResourceCard/ResourceCard.jsx';
import { listBookmarks } from '../services/resources';
import useAsync from '../hooks/useAsync';
import { Loading, ErrorState, Empty } from '../components/Status/Status.jsx';
import { Link } from 'react-router-dom';
import iconSearch from '../assets/koleksi/icon-search.svg';
import iconChevron from '../assets/wawasan/icon-chevron.svg';

const FILTERS = ['Semua', 'Tugas Akhir', 'Praktikum', 'Magang & KP'];
const SORTS = ['Terbaru', 'Terlama', 'Rating Tertinggi'];

export default function CollectionPage() {
  const [filter, setFilter] = useState('Semua');
  const [sort, setSort] = useState('Terbaru');
  const [query, setQuery] = useState('');

  const { data, loading, error, reload, setData } = useAsync(listBookmarks, []);
  const items = (data || []).filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase()));
  // Hapus kartu dari koleksi saat bookmark-nya dilepas
  const handleChange = (id) => (on) => !on && setData((data || []).filter((r) => r.id !== id));

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
            <div className={styles.pills} role="group" aria-label="Filter koleksi">
              {FILTERS.map((f) => (
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
            title={query ? 'Tidak ada yang cocok' : 'Koleksimu masih kosong'}
            description={
              query
                ? 'Coba kata kunci lain.'
                : 'Simpan resource dengan ikon bookmark supaya mudah ditemukan lagi.'
            }
            action={
              !query && (
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
            {items.map((r) => (
              <ResourceCard key={r.id} resource={r} onBookmarkChange={handleChange(r.id)} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
