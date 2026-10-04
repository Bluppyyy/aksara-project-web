import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './ReviewsSection.module.css';
import iconReviews from '../../assets/detail/icon-reviews.svg';
import iconStarMd from '../../assets/detail/icon-star-md.svg';
import iconStarPicker from '../../assets/detail/icon-star-picker.svg';
import iconLock from '../../assets/detail/icon-lock-sm.svg';
import iconStarXs from '../../assets/detail/icon-star-xs.svg';
import iconStarHalf from '../../assets/detail/icon-star-half.svg';
import iconThumb from '../../assets/detail/icon-thumb.svg';

function Stars({ value }) {
  return (
    <span className={styles.stars} aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <img
          key={i}
          src={value >= i ? iconStarXs : iconStarHalf}
          alt=""
          className={value >= i - 0.5 ? '' : styles.starEmpty}
        />
      ))}
    </span>
  );
}

export default function ReviewsSection({ rating, count, reviews: initial, onSubmit }) {
  const user = useAuth();
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [reviews, setReviews] = useState(initial);
  const [score, setScore] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [helpful, setHelpful] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setSubmitError('');
    try {
      await onSubmit?.({ rating: score, text: text.trim() });
      setReviews((r) => [
        {
          id: Date.now(),
          initials: user?.initials || 'A',
          name: user?.nama || 'Kamu',
          meta: '',
          rating: score,
          text: text.trim(),
          time: 'Baru saja',
          helpful: 0,
        },
        ...r,
      ]);
      setText('');
    } catch (err) {
      setSubmitError(err.message || 'Gagal mengirim ulasan.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.top}>
        <h2 className={styles.heading}>
          <img src={iconReviews} alt="" />
          Rating &amp; Ulasan Mahasiswa
        </h2>
        <div className={styles.summary}>
          <span className={styles.score}>{rating}</span>
          <span className={styles.summaryStars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <img key={i} src={iconStarMd} alt="" />
            ))}
          </span>
          <span className={styles.count}>({count} mahasiswa)</span>
        </div>
      </div>

      {!user ? (
        <div className={styles.form}>
          <p className={styles.formTitle}>
            <Link to="/login" style={{ color: 'var(--color-primary)' }}>
              Masuk
            </Link>
            &nbsp;untuk menulis ulasan dan memberi rating.
          </p>
        </div>
      ) : (
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formTop}>
            <div className={styles.formTitle}>
              <span className={styles.formAvatar}>{user.initials}</span>
              Tulis Ulasan Anda sebagai Mahasiswa
            </div>
            <div className={styles.picker} role="radiogroup" aria-label="Beri skor">
              <span className={styles.pickerLabel}>Beri Skor:</span>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={score === i}
                  aria-label={`${i} bintang`}
                  className={(hover || score) >= i ? '' : styles.pickerOff}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setScore(i)}
                >
                  <img src={iconStarPicker} alt="" />
                </button>
              ))}
            </div>
          </div>

          <textarea
            className={styles.textarea}
            placeholder="Beri ulasan untuk membantu mahasiswa lain mengetahui kualitas referensi ini... (contoh: kejelasan skema rangkaian, kelengkapan kode, atau metodologi)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Ulasan"
          />

          <div className={styles.formBottom}>
            <p className={styles.note}>
              <img src={iconLock} alt="" />
              Komentar akan diposting menggunakan akun SSO Anda.
            </p>
            <button type="submit" className={styles.submit} disabled={!text.trim() || sending}>
              {sending ? 'Mengirim…' : 'Kirim Ulasan'}
            </button>
          </div>
          {submitError && (
            <p className={styles.submitError} role="alert">
              {submitError}
            </p>
          )}
        </form>
      )}

      {reviews.length === 0 && <p className={styles.count}>Belum ada ulasan. Jadilah yang pertama!</p>}
      <ul className={styles.list}>
        {reviews.map((r) => (
          <li key={r.id} className={styles.review}>
            <div className={styles.reviewTop}>
              <div className={styles.reviewer}>
                <span className={styles.reviewAvatar}>{r.initials}</span>
                <div>
                  <p className={styles.reviewName}>{r.name}</p>
                  <p className={styles.reviewMeta}>{r.meta}</p>
                </div>
              </div>
              <Stars value={r.rating} />
            </div>
            <p className={styles.reviewText}>{r.text}</p>
            <div className={styles.reviewFooter}>
              <span>{r.time}</span>
              <span>•</span>
              <button
                type="button"
                className={`${styles.helpful} ${helpful[r.id] ? styles.helpfulActive : ''}`}
                aria-pressed={!!helpful[r.id]}
                onClick={() => setHelpful((h) => ({ ...h, [r.id]: !h[r.id] }))}
              >
                <img src={iconThumb} alt="" />
                Membantu ({r.helpful + (helpful[r.id] ? 1 : 0)})
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
