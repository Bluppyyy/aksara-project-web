import { useState } from 'react';
import styles from './AbstractCard.module.css';
import iconAbstract from '../../assets/detail/icon-abstract.svg';
import iconArrowDown from '../../assets/detail/icon-arrow-down.svg';

export default function AbstractCard({ paragraphs, keywords }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className={styles.card}>
      <h2 className={styles.heading}>
        <img src={iconAbstract} alt="" />
        Abstrak &amp; Ringkasan Laporan
      </h2>

      <div
        className={`${styles.body} ${expanded || paragraphs.join(' ').length <= 600 ? styles.expanded : ''}`}
      >
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {!expanded && paragraphs.join(' ').length > 600 && (
          <div className={styles.fade}>
            <button type="button" className={styles.more} onClick={() => setExpanded(true)}>
              Baca Selengkapnya
              <img src={iconArrowDown} alt="" />
            </button>
          </div>
        )}
      </div>

      {keywords.length > 0 && (
        <div className={styles.keywords}>
          <span className={styles.keywordsLabel}>KATA KUNCI:</span>
          {keywords.map((k) => (
            <span key={k} className={styles.keyword}>
              {k}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
