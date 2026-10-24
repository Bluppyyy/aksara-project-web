import { Link } from 'react-router-dom';
import useBookmark from '../../hooks/useBookmark';
import { USE_API } from '../../services/api';
import { addRecent } from '../../utils/recent';
import { thumbnailFor } from '../../data/resources';
import styles from './ResourceCard.module.css';
import { CategoryBadge, FormatBadge, BookmarkButton, Thumbnail } from './shared.jsx';
import iconCourse from '../../assets/icon-course.svg';
import iconStar from '../../assets/icon-star-card.svg';
import iconDownload from '../../assets/icon-download-card.svg';

export default function ResourceCard({ resource, onBookmarkChange }) {
  const { id, category, format, course, title, description, tags, author, rating, downloads } = resource;
  const thumb = thumbnailFor(resource);
  const [bookmarked, toggleBookmark] = useBookmark(resource.id, resource.bookmarked, onBookmarkChange);

  return (
    <article className={styles.card}>
      <div className={styles.preview}>
        <Thumbnail src={thumb} />
        {!thumb && <div className={styles.previewGlow} aria-hidden="true" />}
        <div className={styles.previewTop}>
          <CategoryBadge category={category} label={resource.categoryLabel} thumb={resource.thumb} />
        </div>
        <div className={styles.previewBottom}>
          <FormatBadge format={format} />
          {/* Mode API: resource contoh (katalog lokal) tidak ada di database, jadi tidak bisa disimpan */}
          <BookmarkButton active={bookmarked} onToggle={toggleBookmark} disabled={USE_API && resource.sample} />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.info}>
          <div className={styles.course}>
            <img src={iconCourse} alt="" className={styles.courseIcon} />
            <span title={course}>{course}</span>
          </div>
          <div className={styles.texts}>
            <h3 className={styles.title}>
              <Link to={`/resource/${id}`} onClick={() => addRecent(resource)}>
                {title}
              </Link>
            </h3>
            <p className={styles.description}>{description}</p>
          </div>
        </div>

        <ul className={styles.tags}>
          {tags.map((tag) => (
            <li key={tag} className={styles.tag} title={tag}>
              {tag}
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <div className={styles.author}>
            <span className={styles.avatar}>{author.initials}</span>
            <div className={styles.authorText}>
              <span className={styles.authorName} title={author.name}>
                {author.name}
              </span>
              <span className={styles.authorMeta} title={author.meta}>
                {author.meta}
              </span>
            </div>
          </div>
          <div className={styles.stats}>
            <span className={styles.rating}>
              <img src={iconStar} alt="" className={styles.starIcon} />
              {rating}
            </span>
            <span className={styles.downloads}>
              <img src={iconDownload} alt="" className={styles.downloadIcon} />
              {downloads}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
