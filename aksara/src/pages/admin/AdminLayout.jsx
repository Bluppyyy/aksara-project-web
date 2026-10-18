import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
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

/** Breadcrumb di topbar: Beranda & Kelola Resource memakai gaya titik, halaman lain memakai garis miring (sesuai Figma) */
function TopCrumbs({ pathname }) {
  const dotStyle = pathname === '/admin' || pathname.startsWith('/admin/resource');
  if (dotStyle) {
    return (
      <div className={styles.crumbs}>
        <span>Universitas Telkom</span>
        <span className={styles.crumbDot}>•</span>
        <span className={styles.crumbActive}>Direktorat Pascasarjana &amp; Riset</span>
      </div>
    );
  }
  return (
    <nav className={styles.crumbs} aria-label="Lokasi">
      <span>Universitas Telkom</span>
      <span className={styles.crumbSep}>/</span>
      <span>Portal Pascasarjana &amp; Riset</span>
      <span className={styles.crumbSep}>/</span>
      <span className={styles.crumbActive}>Admin AKSARA</span>
    </nav>
  );
}

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
      <aside className={`${styles.aside} ${navOpen ? styles.asideOpen : ''}`} aria-label="Navigasi admin">
        <div className={styles.asideTop}>
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

        <div className={styles.asideBottom}>
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
      {navOpen && <button type="button" className={styles.scrim} aria-label="Tutup menu" onClick={() => setNavOpen(false)} />}

      <div className={styles.main}>
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
          <TopCrumbs pathname={pathname} />
          <div className={styles.topRight}>
            <Link to="/admin/laporan" className={styles.bell} aria-label="Pemberitahuan: ada laporan baru">
              <Icon icon="lucide:bell" size={18} />
              <span className={styles.bellDot} />
            </Link>
            <span className={styles.divider} />
            <Link to="/admin/profil" className={styles.profile}>
              <span className={styles.profileText}>
                <strong>{user?.nama || 'Administrator Repositori'}</strong>
                <span>Superadmin Tel-U</span>
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
