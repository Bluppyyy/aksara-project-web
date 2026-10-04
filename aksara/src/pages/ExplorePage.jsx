import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [activeFilters, setActiveFilters] = useState(['Fakultas Informatika (FIF)']);
  const [sort, setSort] = useState('Paling Relevan');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Header />

      <main>
        <Hero
          onSearch={({ query }) =>
            navigate(query ? `/eksplorasi/hasil?q=${encodeURIComponent(query)}` : '/eksplorasi/hasil')
          }
        >
          <FilterBar
            activeFilters={activeFilters}
            onRemove={(label) => setActiveFilters((f) => f.filter((x) => x !== label))}
            onOpenDropdown={(label) => console.log('open dropdown', label)}
            onReset={() => setActiveFilters([])}
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
            <SectionHeader icon={iconUniversity} title="Karya Riset dari Fakultas Kamu" />
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
            <SectionHeader icon={iconTrending} title="Sedang Trending di AKSARA" />
            <CardRow items={trending} />
          </div>
        </section>
      </main>

      <div className={styles.footerSpacer} />
      <Footer />
    </div>
  );
}
