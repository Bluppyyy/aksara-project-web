import { Link } from 'react-router-dom';
import styles from './AuthPanel.module.css';
import ellipse1 from '../../assets/auth/ellipse-1.svg';
import ellipse2 from '../../assets/auth/ellipse-2.svg';
import ellipse3 from '../../assets/auth/ellipse-3.svg';
import aksaraIcon from '../../assets/auth/aksara-icon.svg';
import graduationCap from '../../assets/auth/graduation-cap.svg';

/** Panel biru di sisi kiri halaman Login & Register (disembunyikan di layar < 960px) */
export default function AuthPanel({ title, description }) {
  return (
    <aside className={styles.panel}>
      <img src={ellipse1} alt="" className={styles.ellipse1} />
      <img src={ellipse3} alt="" className={styles.ellipse3} />
      <div className={styles.orb} aria-hidden="true">
        <img src={ellipse2} alt="" className={styles.orbBg} />
        <img src={graduationCap} alt="" className={styles.cap} />
      </div>

      <Link to="/" className={styles.logo} aria-label="AKSARA — kembali ke Beranda">
        <span className={styles.logoIconBox}>
          <img src={aksaraIcon} alt="" className={styles.logoIcon} />
        </span>
        <span className={styles.logoText}>
          <span className={styles.logoName}>AKSARA</span>
          <span className={styles.logoTagline}>ACADEMIC REPOSITORY</span>
        </span>
      </Link>

      <div className={styles.copy}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </aside>
  );
}
