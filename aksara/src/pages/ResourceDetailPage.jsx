import { Link, useParams } from 'react-router-dom';
import styles from './ResourceDetailPage.module.css';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import ResourceHeader from '../components/ResourceDetail/ResourceHeader.jsx';
import AbstractCard from '../components/ResourceDetail/AbstractCard.jsx';
import DocumentPreview from '../components/ResourceDetail/DocumentPreview.jsx';
import ReviewsSection from '../components/ResourceDetail/ReviewsSection.jsx';
import MetadataCard from '../components/ResourceDetail/MetadataCard.jsx';
import RelatedCard from '../components/ResourceDetail/RelatedCard.jsx';
import { Loading, ErrorState } from '../components/Status/Status.jsx';
import { getResource, createReview } from '../services/resources';
import useAsync from '../hooks/useAsync';
import iconBack from '../assets/detail/icon-back.svg';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const { data: r, loading, error, reload } = useAsync(() => getResource(id), [id]);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link to="/eksplorasi/hasil">
            <img src={iconBack} alt="" />
            Kembali ke Eksplorasi
          </Link>
        </nav>

        {loading ? (
          <Loading label="Memuat resource…" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : (
          <>
            <ResourceHeader resource={r} />

            <div className={styles.layout}>
              <div className={styles.left}>
                <AbstractCard paragraphs={r.abstract} keywords={r.keywords} />
                {/* Resource contoh tidak punya berkas di Storage → pratinjau sampul tiruan */}
                <DocumentPreview
                  totalPages={r.totalPages}
                  cover={r.cover}
                  resourceId={r.isSample ? null : r.id}
                  title={r.title}
                />
                <ReviewsSection
                  rating={r.rating}
                  count={r.reviewCount}
                  reviews={r.reviews}
                  onSubmit={(review) => createReview(r.id, review)}
                  disabledNote={r.readOnly ? 'Ulasan belum tersedia untuk resource contoh.' : ''}
                />
              </div>
              <aside className={styles.right}>
                <MetadataCard meta={r.meta} />
                {r.related.length > 0 && <RelatedCard items={r.related} seeAllTo={r.relatedLink} />}
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
