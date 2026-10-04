import { Link } from 'react-router-dom';
import styles from './SidebarCards.module.css';
import iconRelated from '../../assets/detail/icon-related.svg';
import iconPerson from '../../assets/detail/icon-person.svg';

export default function RelatedCard({ items }) {
  return (
    <section className={styles.card}>
      <div className={styles.headingRow}>
        <h3 className={styles.heading}>
          <img src={iconRelated} alt="" style={{ width: 22, height: 19.5 }} />
          Resource Terkait
        </h3>
        <Link to="/eksplorasi/hasil" className={styles.seeAll}>
          Lihat Semua
        </Link>
      </div>

      <div className={styles.related}>
        {items.map((it) => (
          <Link key={it.id} to={`/resource/${it.id}`} className={styles.relatedItem}>
            <span className={styles.relatedTop}>
              <span className={styles.relatedCourse}>{it.course}</span>
              <span className={styles.relatedFile}>{it.file}</span>
            </span>
            <span className={styles.relatedTitle}>{it.title}</span>
            <span className={styles.relatedAuthor}>
              <img src={iconPerson} alt="" />
              {it.author}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
