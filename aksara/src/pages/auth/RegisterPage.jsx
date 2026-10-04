import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/auth';
import AuthShell from './AuthShell.jsx';
import PasswordInput from './PasswordInput.jsx';
import layout from './AuthLayout.module.css';
import styles from './RegisterPage.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f) {
  return {
    name: f.name.trim().length < 3 ? 'Nama minimal 3 huruf.' : '',
    email: !EMAIL_RE.test(f.email) ? 'Masukkan email yang valid.' : '',
    phone: !/^8\d{7,12}$/.test(f.phone) ? 'Nomor diawali 8, 8–13 digit (tanpa 0 di depan).' : '',
    password: f.password.length < 8 ? 'Minimal 8 karakter.' : '',
    confirm: !f.confirm ? 'Ulangi kata sandi.' : f.confirm !== f.password ? 'Kata sandi belum sama.' : '',
  };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const errors = validate(form);
  const show = (key) => touched[key] && errors[key];

  const update = (key) => (e) => {
    const value = key === 'phone' ? e.target.value.replace(/\D/g, '').replace(/^0+/, '') : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, password: true, confirm: true });
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    setServerError('');
    try {
      await register({ ...form, email: form.email.trim() });
      navigate('/login', {
        state: { notice: 'Akun berhasil dibuat. Cek email untuk verifikasi (jika diminta), lalu masuk.' },
      });
    } catch (err) {
      setServerError(/already registered/i.test(err.message) ? 'Email ini sudah terdaftar.' : err.message);
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: update(key),
    onBlur: blur(key),
  });

  return (
    <AuthShell
      panelTitle={
        <>
          Bergabung dan mulai
          <br />
          belajar hari ini.
        </>
      }
      panelDescription="Daftar gratis dan akses ratusan materi belajar berkualitas, latihan soal, dan fitur personalisasi."
    >
      <form className={layout.form} onSubmit={handleSubmit} noValidate>
        <div className={layout.header}>
          <h1 className={layout.title}>Buat Akun AKSARA</h1>
          <p className={layout.subtitle}>Mulai perjalanan belajarmu dan kembangkan kemampuanmu bersama AKSARA.</p>
        </div>

        {serverError && (
          <p className={layout.alert} role="alert">
            {serverError}
          </p>
        )}

        <div className={layout.field}>
          <label htmlFor="name" className={layout.label}>
            Nama Lengkap
          </label>
          <input
            id="name"
            autoComplete="name"
            className={`${layout.input} ${show('name') ? layout.inputInvalid : ''}`}
            placeholder="Masukkan nama lengkap"
            {...field('name')}
            autoFocus
          />
          {show('name') && <p className={layout.error}>{errors.name}</p>}
        </div>

        <div className={layout.field}>
          <label htmlFor="reg-email" className={layout.label}>
            Alamat Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            className={`${layout.input} ${show('email') ? layout.inputInvalid : ''}`}
            placeholder="contoh@gmail.com"
            {...field('email')}
          />
          {show('email') && <p className={layout.error}>{errors.email}</p>}
        </div>

        <div className={layout.field}>
          <label htmlFor="phone" className={layout.label}>
            Nomor Telepon
          </label>
          <div className={`${layout.inputGroup} ${show('phone') ? layout.inputInvalid : ''}`}>
            <span className={layout.prefix}>+62</span>
            <input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="812 3456 7890" {...field('phone')} />
          </div>
          {show('phone') && <p className={layout.error}>{errors.phone}</p>}
        </div>

        <div className={styles.passwordRow}>
          <div className={layout.field}>
            <label htmlFor="password" className={layout.label}>
              Kata Sandi
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Min. 8 karakter"
              invalid={!!show('password')}
              {...field('password')}
            />
            {show('password') ? (
              <p className={layout.error}>{errors.password}</p>
            ) : (
              <p className={layout.helper}>Minimal 8 karakter</p>
            )}
          </div>
          <div className={layout.field}>
            <label htmlFor="confirm" className={layout.label}>
              Konfirmasi
            </label>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              placeholder="Ulangi kata sandi"
              invalid={!!show('confirm')}
              {...field('confirm')}
            />
            {show('confirm') && <p className={layout.error}>{errors.confirm}</p>}
          </div>
        </div>

        <button type="submit" className={layout.primaryButton} disabled={loading}>
          {loading ? 'Membuat akun…' : 'Buat Akun'}
        </button>

        <p className={layout.footerText}>
          Sudah punya akun?
          <Link to="/login" className={layout.link}>
            Masuk
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
