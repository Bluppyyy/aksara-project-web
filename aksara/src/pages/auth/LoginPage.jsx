import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../../services/auth';
import AuthShell from './AuthShell.jsx';
import PasswordInput from './PasswordInput.jsx';
import layout from './AuthLayout.module.css';
import styles from './LoginPage.module.css';
import googleIcon from '../../assets/auth/google-g.svg';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.notice;
  const [serverError, setServerError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const errors = {
    email: !form.email ? 'Email wajib diisi.' : !EMAIL_RE.test(form.email) ? 'Format email belum benar.' : '',
    password: !form.password ? 'Kata sandi wajib diisi.' : '',
  };
  const show = (key) => touched[key] && errors[key];

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;
    setLoading(true);
    setServerError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || '/eksplorasi/hasil', { replace: true });
    } catch (err) {
      setServerError(
        /invalid login/i.test(err.message) ? 'Email atau kata sandi salah.' : err.message
      );
      setLoading(false);
    }
  };

  return (
    <AuthShell
      panelTitle={
        <>
          Belajar kapan saja,
          <br />
          di mana saja
        </>
      }
      panelDescription="Raih potensi terbaikmu bersama ribuan materi, latihan soal, dan komunitas pelajar aktif di AKSARA."
    >
      <form className={layout.form} onSubmit={handleSubmit} noValidate>
        <div className={layout.header}>
          <h1 className={layout.title}>Selamat Datang Kembali</h1>
          <p className={layout.subtitle}>Masuk untuk melanjutkan perjalanan belajarmu bersama AKSARA.</p>
        </div>

        {notice && <p className={layout.notice}>{notice}</p>}
        {serverError && (
          <p className={layout.alert} role="alert">
            {serverError}
          </p>
        )}

        <div className={layout.field}>
          <label htmlFor="email" className={layout.label}>
            Alamat Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`${layout.input} ${show('email') ? layout.inputInvalid : ''}`}
            placeholder="contoh@gmail.com"
            value={form.email}
            onChange={update('email')}
            onBlur={blur('email')}
            aria-invalid={!!show('email') || undefined}
            autoFocus
          />
          {show('email') && <p className={layout.error}>{errors.email}</p>}
        </div>

        <div className={layout.field}>
          <div className={layout.labelRow}>
            <label htmlFor="password" className={layout.label}>
              Kata Sandi
            </label>
            <a href="#" className={layout.link}>
              Lupa kata sandi?
            </a>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            value={form.password}
            onChange={update('password')}
            onBlur={blur('password')}
            invalid={!!show('password')}
          />
          {show('password') && <p className={layout.error}>{errors.password}</p>}
        </div>

        <label className={styles.remember}>
          <input type="checkbox" checked={form.remember} onChange={update('remember')} />
          Ingat saya di perangkat ini
        </label>

        <button type="submit" className={layout.primaryButton} disabled={loading}>
          {loading ? 'Memproses…' : 'Masuk'}
        </button>

        <div className={styles.divider}>
          <span>atau</span>
        </div>

        <button type="button" className={styles.googleButton}>
          <img src={googleIcon} alt="" />
          Masuk dengan Google
        </button>

        <p className={layout.footerText}>
          Belum punya akun?
          <Link to="/daftar" className={layout.link}>
            Daftar sekarang
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
