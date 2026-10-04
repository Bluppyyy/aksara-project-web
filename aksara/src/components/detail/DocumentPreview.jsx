import { useState } from 'react';
import styles from './DocumentPreview.module.css';
import iconPreview from '../../assets/detail/icon-preview.svg';
import iconPrev from '../../assets/detail/icon-page-prev.svg';
import iconNext from '../../assets/detail/icon-page-next.svg';
import iconZoom from '../../assets/detail/icon-zoom.svg';
import iconFullscreen from '../../assets/detail/icon-fullscreen.svg';
import iconEmblem from '../../assets/detail/icon-emblem.svg';
import iconWatermark from '../../assets/detail/icon-watermark.svg';

const CHAPTERS = [
  'Halaman Sampul',
  'Kata Pengantar',
  'Arsitektur Hardware',
  'Evaluasi Akurasi',
  'Daftar Pustaka',
];

export default function DocumentPreview({ totalPages = 48, cover }) {
  const [page, setPage] = useState(1);
  const [zoomed, setZoomed] = useState(false);

  return (
    <section className={styles.card}>
      <div className={styles.top}>
        <div className={styles.titleGroup}>
          <img src={iconPreview} alt="" className={styles.titleIcon} />
          <h2 className={styles.title}>Pratinjau Dokumen</h2>
          <span className={styles.pageBadge}>
            Halaman {page} dari {totalPages}
          </span>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            aria-label="Halaman sebelumnya"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <img src={iconPrev} alt="" style={{ width: 5.55, height: 9 }} />
          </button>
          <span className={styles.pageCount}>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            aria-label="Halaman berikutnya"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <img src={iconNext} alt="" style={{ width: 5.55, height: 9 }} />
          </button>
          <span className={styles.divider} />
          <button
            type="button"
            aria-label="Perbesar"
            aria-pressed={zoomed}
            onClick={() => setZoomed((z) => !z)}
          >
            <img src={iconZoom} alt="" style={{ width: 13.5, height: 13.5 }} />
          </button>
          <button type="button" aria-label="Layar penuh">
            <img src={iconFullscreen} alt="" style={{ width: 13.5, height: 13.5 }} />
          </button>
        </div>
      </div>

      <div className={styles.canvas}>
        <div className={`${styles.paper} ${zoomed ? styles.paperZoomed : ''}`}>
          <div className={styles.paperTop}>
            <span className={styles.emblem}>
              <img src={iconEmblem} alt="" />
            </span>
            <p className={styles.university}>TELKOM UNIVERSITY</p>
            <p className={styles.faculty}>{cover.faculty}</p>
          </div>

          <div className={styles.paperTitle}>
            <p className={styles.kicker}>{cover.kicker}</p>
            <h3>{cover.title}</h3>
            <span className={styles.rule} />
            <p className={styles.purpose}>{cover.purpose}</p>
          </div>

          <div className={styles.paperBottom}>
            <p className={styles.signName}>{cover.author}</p>
            <p className={styles.signNim}>{cover.nim}</p>
            <p className={styles.signPlace}>{cover.place}</p>
          </div>

          <span className={styles.watermark}>
            <img src={iconWatermark} alt="" />
            AKSARA DIGITAL REPOSITORY
          </span>
        </div>
      </div>

      <div className={styles.jump}>
        <span className={styles.jumpLabel}>Lompat Bab:</span>
        {CHAPTERS.map((c) => (
          <button key={c} type="button" className={styles.jumpButton}>
            {c}
          </button>
        ))}
      </div>
    </section>
  );
}
