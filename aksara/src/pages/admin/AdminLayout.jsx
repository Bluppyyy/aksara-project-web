import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import { useAuth } from '../../context/useAuth';
import { logout } from '../../services/auth';
import { initials } from '../../services/adapters';
import logo from '../../assets/logo.png';
import styles from './AdminLayout.module.css';

const MAIN_NAV = [
  { to: '/admin', label: 'Beranda', end: true },
  { to: '/admin/resource', label: 'Kelola Resource' },
  { to: '/admin/laporan', label: 'Kelola Laporan' },
  { to: '/admin/moderasi', label: 'Moderasi Konten' },
];

const SYSTEM_NAV = [
  { to: '/admin/profil', label: 'Profil Admin', icon: 'lucide:user-round' },
  { to: '/admin/pengaturan', label: 'Pengaturan', icon: 'lucide:settings' },
];

/**
 * Kerangka semua halaman admin: sidebar kiri (fixed) + topbar + konten (<Outlet />).
 * Satu web dengan mahasiswa, hanya beda rute (/admin/*).
 */
export default function AdminLayout() {
  const user = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${navOpen ? styles.sidebarOpen : ''}`} aria-label="Navigasi admin">
        <div className={styles.sidebarSection}>
          <Link to="/admin" className={styles.brand} aria-label="AKSARA Admin — Beranda">
            <img src={logo} alt="AKSARA Academic Repository" />
          </Link>
          <p className={styles.navLabel}>Navigasi Utama</p>
          <nav className={styles.nav}>
            {MAIN_NAV.map((item) => (
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
        </div>

        <div className={styles.sidebarSection}>
          <p className={styles.navLabel}>Sistem</p>
          <nav className={styles.nav}>
            {SYSTEM_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <Icon icon={item.icon} size={16} />
                {item.label}
              </NavLink>
            ))}
            <button type="button" className={`${styles.navLink} ${styles.logout}`} onClick={handleLogout}>
              <Icon icon="lucide:log-out" size={16} />
              Keluar
            </button>
          </nav>
        </div>
      </aside>
      {navOpen && (
        <button type="button" className={styles.scrim} aria-label="Tutup menu" onClick={() => setNavOpen(false)} />
      )}

      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Buka menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <Icon icon="lucide:menu" size={20} />
          </button>
          <span className={styles.topSpacer} />
          <div className={styles.topbarActions}>
            <Link to="/admin/profil" className={styles.profile}>
              <span className={styles.profileText}>
                <strong>{user?.nama || 'Administrator Repositori'}</strong>
                <span>Admin FIF</span>
              </span>
              <span className={styles.avatar}>{initials(user?.nama || 'Admin AKSARA')}</span>
            </Link>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
