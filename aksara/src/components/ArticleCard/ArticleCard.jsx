import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import styles from './ArticleCard.module.css';
import iconBookmark from '../../assets/wawasan/icon-bookmark.svg';

export default function ArticleCard({ article }) {
  const { id, image, label, labelColor, title, excerpt, author, readTime } = article;
  const [saved, setSaved] = useState(false);
  const user = useAuth();
  const navigate = useNavigate();

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
            <Link to={`/wawasan/${id}`}>{title}</Link>
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
            onClick={() =>
              user
                ? setSaved((s) => !s)
                : navigate('/login', {
                    state: { from: '/wawasan', notice: 'Masuk dulu untuk menyimpan artikel ke koleksi.' },
                  })
            }
          >
            <img src={iconBookmark} alt="" />
          </button>
        </div>
      </div>
    </article>
  );
}
