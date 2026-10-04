import styles from './Footer.module.css';
import logo from '../../assets/logo-footer.png';
import iconAkreditasi from '../../assets/icon-akreditasi.svg';
import iconOpenAccess from '../../assets/icon-open-access.svg';

const COLUMNS = [
  {
    title: 'EKSPLORASI',
    links: ['Referensi Tugas', 'Pengalaman Magang', 'Info Beasiswa', 'Terbaru'],
    className: 'colExplore',
  },
  {
    title: 'PLATFORM',
    links: ['Tentang AKSARA', 'Cara Unggah Konten', 'Panduan Bookmark', 'FAQ'],
    className: 'colPlatform',
  },
  {
    title: 'BANTUAN',
    links: ['Pusat Bantuan', 'Laporkan Konten', 'Kebijakan Privasi', 'Kontak Admin'],
    className: 'colHelp',
  },
];

const LEGAL_LINKS = ['Ketentuan Layanan', 'Privasi Data', 'Protokol OAI-PMH'];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <img src={logo} alt="AKSARA" className={styles.logo} />
            <p className={styles.tagline}>
              Wadah berbagi referensi akademik, laporan proyek, tips magang, dan beasiswa terpercaya
              bagi mahasiswa Telkom University.
            </p>
            <div className={styles.badges}>
              <span className={`${styles.badge} ${styles.badgeBlue}`}>
                <img src={iconAkreditasi} alt="" className={styles.badgeIconA} />
                Akreditasi Unggul
              </span>
              <span className={`${styles.badge} ${styles.badgeGreen}`}>
                <img src={iconOpenAccess} alt="" className={styles.badgeIconB} />
                Open Access Registry
              </span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className={`${styles.column} ${styles[col.className]}`}>
              <h3 className={styles.columnTitle}>{col.title}</h3>
              {col.links.map((link) => (
                <a key={link} href="#" className={styles.link}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 AKSARA - Academic Repository. Advanced Software Engineering Laboratory, Telkom
            University.
          </p>
          <div className={styles.legal}>
            {LEGAL_LINKS.map((link) => (
              <a key={link} href="#" className={styles.legalLink}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
