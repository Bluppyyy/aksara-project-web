import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { writeFilters } from '../utils/filters';
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
import {
  relevantResources,
  recentlyViewed,
  facultyResearch,
  favoriteCourses,
  trending,
} from '../data/resources';

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
  const [filters, setFilters] = useState({ fakultas: 'Fakultas Informatika (FIF)' });
  const [sort, setSort] = useState('Paling Relevan');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Alur Figma: Eksplorasi (sebelum pencarian) → Eksplorasi — Hasil Pencarian.
  // Filter dari FilterBar dibawa lewat URL dan dibaca ulang oleh halaman hasil (utils/filters.js).
  const goToResults = ({ q, kategori } = {}) => {
    const f = filters;
    const tahun = f.tahun ? (/ke bawah/.test(f.tahun) ? [2010, parseInt(f.tahun, 10)] : [+f.tahun, +f.tahun]) : undefined;
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

            {view === 'grid' ? (
              <div className={styles.cardGridResults}>
                {relevantResources.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            ) : (
              <div className={styles.list}>
                {relevantResources.map((r) => (
                  <ResourceListItem key={r.id} resource={r} />
                ))}
              </div>
            )}

            <div className={styles.paginationSpacing}>
              <Pagination page={page} totalPages={12} onChange={setPage} />
            </div>
          </div>
        </section>

        {/* Terakhir Dilihat */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <SectionHeader icon={iconHistory} title="Terakhir Dilihat" />
            <div className={styles.list}>
              {recentlyViewed.map((r) => (
                <ResourceListItem key={r.id} resource={r} />
              ))}
            </div>
          </div>
        </section>

        {/* Karya Riset dari Fakultas Kamu */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <SectionHeader
              icon={iconUniversity}
              title="Karya Riset dari Fakultas Kamu"
              to="/eksplorasi/hasil?kategori=riset"
            />
            <span className={styles.facultyBadge}>Fakultas Teknik Elektro &amp; Informatika</span>
            <CardRow items={facultyResearch} />
          </div>
        </section>

        {/* Mata Kuliah Favorit */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <SectionHeader icon={iconStar} title="Mata Kuliah Favorit" />
            <CardRow items={favoriteCourses} />
          </div>
        </section>

        {/* Sedang Trending */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <SectionHeader
              icon={iconTrending}
              title="Sedang Trending di AKSARA"
              to="/eksplorasi/hasil?urut=populer"
            />
            <CardRow items={trending} />
          </div>
        </section>
      </main>

      <div className={styles.footerSpacer} />
      <Footer />
    </div>
  );
}
