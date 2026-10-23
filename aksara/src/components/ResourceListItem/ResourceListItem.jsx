import { Link } from 'react-router-dom';
import useBookmark from '../../hooks/useBookmark';
import { addRecent } from '../../utils/recent';
import { thumbnailFor } from '../../data/resources';
import styles from './ResourceListItem.module.css';
import { CategoryBadge, FormatBadge, BookmarkButton, Thumbnail } from '../ResourceCard/shared.jsx';
import previewAccent from '../../assets/list-preview-accent.svg';
import iconBookOpen from '../../assets/icon-book-open.svg';
import iconStar from '../../assets/icon-star-list.svg';
import iconDownload from '../../assets/icon-download-list.svg';

export default function ResourceListItem({ resource, onBookmarkChange }) {
  const { id, category, format, course, title, description, tags, author, rating, downloads } = resource;
  const thumb = thumbnailFor(resource);
  const [bookmarked, toggleBookmark] = useBookmark(resource.id, resource.bookmarked, onBookmarkChange);

  return (
    <article className={styles.item}>
      <div className={styles.preview}>
        <Thumbnail src={thumb} />
        {!thumb && <img src={previewAccent} alt="" className={styles.accent} />}
        <div className={styles.previewTop}>
          <CategoryBadge category={category} label={resource.categoryLabel} thumb={resource.thumb} />
        </div>
        <FormatBadge format={format} />
      </div>

      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.heading}>
            <div className={styles.titleBlock}>
              <div className={styles.course}>
                <img src={iconBookOpen} alt="" className={styles.courseIcon} />
                <span>{course}</span>
              </div>
              <h3 className={styles.title}>
                <Link to={`/resource/${id}`} onClick={() => addRecent(resource)}>
                  {title}
                </Link>
              </h3>
            </div>
            <BookmarkButton variant="solid" active={bookmarked} onToggle={toggleBookmark} />
          </div>

          <p className={styles.description}>{description}</p>

          <ul className={styles.tags}>
            {tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footer}>
          <div className={styles.author}>
            <span className={styles.avatar}>{author.initials}</span>
            <div className={styles.authorText}>
              <span className={styles.authorName}>{author.name}</span>
              <span className={styles.authorMeta}>{author.meta}</span>
            </div>
          </div>
          <div className={styles.engagement}>
            <span className={styles.rating}>
              <img src={iconStar} alt="" className={styles.statIcon} />
              {rating}
            </span>
            <span className={styles.downloads}>
              <img src={iconDownload} alt="" className={styles.statIcon} />
              {downloads}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
