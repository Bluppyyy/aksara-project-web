import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import AuthPanel from '../../components/AuthPanel/AuthPanel.jsx';
import layout from './AuthLayout.module.css';
import logo from '../../assets/logo.png';

/** Kerangka halaman auth: panel kiri + kartu form di kanan */
export default function AuthShell({ panelTitle, panelDescription, children }) {
  return (
    <div className={layout.page}>
      <AuthPanel title={panelTitle} description={panelDescription} />
      <main className={layout.main}>
        <Link to="/" className={layout.backLink}>
          <Icon icon="lucide:arrow-left" size={15} />
          Kembali ke Beranda
        </Link>
        <div className={layout.card}>
          <Link to="/" className={layout.mobileLogo} aria-label="AKSARA">
            <img src={logo} alt="AKSARA Academic Repository" />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
