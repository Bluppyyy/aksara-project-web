import { Link, useParams } from 'react-router-dom';
import styles from './ResourceDetailPage.module.css';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import ResourceHeader from '../components/detail/ResourceHeader.jsx';
import AbstractCard from '../components/detail/AbstractCard.jsx';
import DocumentPreview from '../components/detail/DocumentPreview.jsx';
import ReviewsSection from '../components/detail/ReviewsSection.jsx';
import MetadataCard from '../components/detail/MetadataCard.jsx';
import RelatedCard from '../components/detail/RelatedCard.jsx';
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
                <DocumentPreview totalPages={r.totalPages} cover={r.cover} />
                <ReviewsSection
                  rating={r.rating}
                  count={r.reviewCount}
                  reviews={r.reviews}
                  onSubmit={(review) => createReview(r.id, review)}
                />
              </div>
              <aside className={styles.right}>
                <MetadataCard meta={r.meta} />
                {r.related.length > 0 && <RelatedCard items={r.related} />}
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
