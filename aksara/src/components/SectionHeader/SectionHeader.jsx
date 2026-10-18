import { Link } from 'react-router-dom';
import styles from './SectionHeader.module.css';

export default function SectionHeader({ icon, title, linkLabel = 'Lihat Semua', to = '/eksplorasi/hasil' }) {
  return (
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        <span className={styles.iconBox}>
          <img src={icon} alt="" className={styles.icon} />
        </span>
        <h2 className={styles.title}>{title}</h2>
      </div>
      {to && (
        <Link to={to} className={styles.link}>
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
