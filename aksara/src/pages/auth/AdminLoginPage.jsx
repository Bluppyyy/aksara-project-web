import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import AuthPanel from '../../components/AuthPanel/AuthPanel.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { login, logout, homeFor, isAdmin } from '../../services/auth';
import styles from './AdminLoginPage.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// NFR-SEC-03: pesan gagal tidak menyebut bagian kredensial mana yang salah
const GENERIC_ERROR = 'Email atau kata sandi tidak sesuai dengan akun yang terdaftar.';

/**
 * Halaman masuk sesuai frame Figma "login admin" (/admin/login).
 * FR-LOGIN-01..03: form email + kata sandi → autentikasi → peran dikenali otomatis.
 * Admin diarahkan ke /admin, mahasiswa ke beranda.
 */
export default function AdminLoginPage() {
  const user = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [touched, setTouched] = useState({});
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={homeFor(user)} replace />;

  const errors = {
    email: !form.email ? 'Email wajib diisi.' : !EMAIL_RE.test(form.email) ? 'Format email belum benar.' : '',
    password: !form.password ? 'Kata sandi wajib diisi.' : '',
  };
  const fieldError = (k) => touched[k] && errors[k];
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;
    setLoading(true);
    setError('');
    try {
      const u = await login(form.email.trim(), form.password);
      const from = location.state?.from;
      navigate(isAdmin(u) && from?.startsWith('/admin') ? from : homeFor(u), { replace: true });
    } catch (err) {
      logout();
      setError(/invalid login|credentials/i.test(err.message) ? GENERIC_ERROR : err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <AuthPanel
        title={
          <>
            Belajar kapan saja,
            <br />
            di mana saja
          </>
        }
        description="Raih potensi terbaikmu bersama ribuan materi, latihan soal, dan komunitas pelajar aktif di AKSARA."
      />
      <main className={styles.main}>
        <form className={styles.card} onSubmit={submit} noValidate>
          <div>
            <h1 className={styles.title}>Masuk ke Akun</h1>
            <p className={styles.subtitle}>Gunakan email dan kata sandi akun AKSARA Anda.</p>
          </div>

          {error && (
            <p className={styles.alert} role="alert">
              <Icon icon="lucide:circle-alert" size={16} />
              {error}
            </p>
          )}

          <div className={styles.field}>
            <label htmlFor="admin-email">
              Email Institusi / Akun AKSARA <span>*</span>
            </label>
            <div className={`${styles.input} ${fieldError('email') ? styles.invalid : ''}`}>
              <Icon icon="lucide:mail" size={16} />
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="nama@telkomuniversity.ac.id"
                value={form.email}
                onChange={update('email')}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!fieldError('email') || undefined}
              />
              <Icon icon="lucide:circle-check" size={15} className={EMAIL_RE.test(form.email) ? styles.valid : styles.muted} />
            </div>
            {fieldError('email') && <p className={styles.error}>{errors.email}</p>}
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="admin-password">
                Kata Sandi <span>*</span>
              </label>
              <a href="mailto:helpdesk-aksara@telkomuniversity.ac.id" className={styles.link}>
                Lupa Kata Sandi?
              </a>
            </div>
            <div className={`${styles.input} ${fieldError('password') ? styles.invalid : ''}`}>
              <Icon icon="lucide:lock" size={16} />
              <input
                id="admin-password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                value={form.password}
                onChange={update('password')}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                aria-invalid={!!fieldError('password') || undefined}
              />
              <button type="button" className={styles.eye} onClick={() => setShow((s) => !s)} aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                <Icon icon={show ? 'lucide:eye-off' : 'lucide:eye'} size={17} />
              </button>
            </div>
            {fieldError('password') && <p className={styles.error}>{errors.password}</p>}
          </div>

          <div className={styles.helpers}>
            <label className={styles.remember}>
              <input type="checkbox" checked={form.remember} onChange={update('remember')} />
              Ingat saya di perangkat ini
            </label>
            <button type="button" className={styles.simulate} onClick={() => setError(GENERIC_ERROR)}>
              Simulasi Galat
            </button>
          </div>

          <button type="submit" className={styles.submit} disabled={loading}>
            <Icon icon="lucide:log-in" size={15} />
            {loading ? 'Memproses…' : 'Masuk'}
          </button>

          <p className={styles.note}>
            <Icon icon="lucide:info" size={15} />
            <span>
              <strong>Penentuan Peran Otomatis:</strong> Sistem akan secara otomatis mengenali peran Anda (Mahasiswa
              atau Administrator) setelah autentikasi berhasil.
            </span>
          </p>
        </form>
      </main>
    </div>
  );
}
