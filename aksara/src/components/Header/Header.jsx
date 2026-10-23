import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../Icon/Icon.jsx';
import { useAuth } from '../../context/useAuth';
import { logout, isAdmin } from '../../services/auth';
import styles from './Header.module.css';
import logo from '../../assets/logo.png';
import iconLogin from '../../assets/icon-login.svg';
import iconCirclePlus from '../../assets/header/icon-circle-plus.svg';
import iconBookmark from '../../assets/header/icon-bookmark.svg';
import iconBookmarkActive from '../../assets/header/icon-bookmark-active.svg';

const NAV_ITEMS = [
  { label: 'Beranda', to: '/', end: true },
  { label: 'Eksplorasi', to: '/eksplorasi' },
  { label: 'Wawasan', to: '/wawasan' },
];

/**
 * Tampilan header otomatis mengikuti status login:
 *  - belum login → nav + tombol Login
 *  - sudah login → nav + Kontribusi, bookmark, notifikasi, avatar (klik → Keluar)
 *  - minimal     → hanya logo (halaman Unggah), lewat prop variant="minimal"
 */
export default function Header({ variant: forced, bookmarkActive = false }) {
  const user = useAuth();
  const variant = forced === 'minimal' ? 'minimal' : user ? 'user' : 'guest';
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [contribOpen, setContribOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    setContribOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={`${styles.brand} ${variant === 'user' ? styles.brandWide : ''}`}>
          <Link to="/" aria-label="AKSARA — Beranda">
            <img src={logo} alt="AKSARA Academic Repository" className={styles.logo} />
          </Link>
        </div>

        {variant !== 'minimal' && (
          <nav className={styles.nav} aria-label="Navigasi utama">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {variant === 'guest' && (
          <div className={styles.actions}>
            <Link to="/login" className={styles.loginButton}>
              <img src={iconLogin} alt="" className={styles.loginIcon} />
              <span>Login</span>
            </Link>
          </div>
        )}

        {variant === 'user' && (
          <div className={styles.userActions}>
            <div className={styles.account}>
              <button
                type="button"
                className={styles.contributeButton}
                aria-label="Kontribusi"
                title="Kontribusi"
                aria-haspopup="menu"
                aria-expanded={contribOpen}
                onClick={() => {
                  setContribOpen((o) => !o);
                  setAccountOpen(false);
                }}
              >
                <span className={styles.circlePlusBox}>
                  <img src={iconCirclePlus} alt="" className={styles.circlePlus} />
                </span>
                <span>Kontribusi</span>
              </button>
              {contribOpen && (
                <div className={styles.accountMenu} role="menu">
                  <Link to="/unggah" className={styles.accountItem} role="menuitem">
                    <Icon icon="lucide:file-up" size={15} /> Unggah Resource
                  </Link>
                  <Link to="/wawasan/tulis" className={styles.accountItem} role="menuitem">
                    <Icon icon="lucide:pen-line" size={15} /> Tulis Wawasan
                  </Link>
                </div>
              )}
            </div>
            <Link
              to="/koleksi"
              className={`${styles.iconLink} ${bookmarkActive ? styles.iconLinkActive : ''}`}
              aria-label="Koleksi Saya"
            >
              <img src={bookmarkActive ? iconBookmarkActive : iconBookmark} alt="" className={styles.bookmarkIcon} />
            </Link>
            <div className={styles.account}>
              <button
                type="button"
                className={styles.avatar}
                aria-label="Menu akun"
                aria-expanded={accountOpen}
                onClick={() => {
                  setAccountOpen((o) => !o);
                  setContribOpen(false);
                }}
              >
                {user.initials}
              </button>
              {accountOpen && (
                <div className={styles.accountMenu}>
                  <p className={styles.accountName}>{user.nama || user.email}</p>
                  <p className={styles.accountEmail}>{user.email}</p>
                  <Link to="/koleksi" className={styles.accountItem}>
                    Koleksi Saya
                  </Link>
                  {isAdmin(user) && (
                    <Link to="/admin" className={styles.accountItem}>
                      Panel Admin
                    </Link>
                  )}
                  <button type="button" className={styles.accountItem} onClick={handleLogout}>
                    <Icon icon="lucide:log-out" size={15} /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {variant !== 'minimal' && (
          <button
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <Icon icon="lucide:x" size={22} /> : <Icon icon="lucide:menu" size={22} />}
          </button>
        )}
      </div>

      {menuOpen && (
        <nav className={styles.mobileMenu} aria-label="Menu">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          {variant === 'user' ? (
            <>
              <NavLink to="/koleksi" className={styles.mobileLink}>
                Koleksi Saya
              </NavLink>
              <button type="button" className={styles.mobileLink} onClick={handleLogout}>
                Keluar
              </button>
              <NavLink to="/wawasan/tulis" className={styles.mobileLink}>
                Tulis Wawasan
              </NavLink>
              <Link to="/unggah" className={styles.mobileCta}>
                Unggah Resource
              </Link>
            </>
          ) : (
            <Link to="/login" className={styles.mobileCta}>
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
