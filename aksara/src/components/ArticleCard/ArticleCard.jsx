import { useState } from 'react';
import styles from './ArticleCard.module.css';
import iconBookmark from '../../assets/wawasan/icon-bookmark.svg';

export default function ArticleCard({ article }) {
  const { image, label, labelColor, title, excerpt, author, readTime } = article;
  const [saved, setSaved] = useState(false);

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={image} alt="" className={styles.image} />
        <span className={styles.label} style={{ color: labelColor }}>
          {label}
        </span>
      </div>
      <div className={styles.body}>
        <div className={styles.texts}>
          <h4 className={styles.title}>
            <a href="#">{title}</a>
          </h4>
          <p className={styles.excerpt}>{excerpt}</p>
        </div>
        <div className={styles.footer}>
          <div className={styles.author}>
            <span className={styles.avatar} style={{ background: author.bg, color: author.color }}>
              {author.initials}
            </span>
            <span className={styles.authorName}>{author.name}</span>
            <span className={styles.meta}>•</span>
            <span className={styles.meta}>{readTime}</span>
          </div>
          <button
            type="button"
            className={`${styles.bookmark} ${saved ? styles.bookmarkActive : ''}`}
            aria-pressed={saved}
            aria-label={saved ? 'Hapus dari koleksi' : 'Simpan ke koleksi'}
            onClick={() => setSaved((s) => !s)}
          >
            <img src={iconBookmark} alt="" />
          </button>
        </div>
      </div>
    </article>
  );
}
