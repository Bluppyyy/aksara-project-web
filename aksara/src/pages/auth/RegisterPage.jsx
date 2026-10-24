import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import AuthPanel from '../../components/AuthPanel/AuthPanel.jsx';
import { register, login } from '../../services/auth';
import styles from './RegisterPage.module.css';
import { FAKULTAS as FAKULTAS_FIF, PRODI_FIF, KODE_PRODI, kodeAngkatan, ANGKATAN } from '../../data/academic';

/* ---------------- Data pilihan ---------------- */
// AKSARA khusus Fakultas Informatika (FIF); kode kelas = KODEPRODI-KODEANGKATAN-NOMOR (mis. IF-48-12)
const BIDANG = [
  'Software Engineering',
  'Artificial Intelligence & ML',
  'Web Development',
  'Mobile Development',
  'Data Science & Analytics',
  'Cloud Computing & DevOps',
  'Cybersecurity',
  'Game Development',
  'UI/UX & Product Design',
  'Internet of Things (IoT)',
  'Computer Vision',
  'Natural Language Processing',
  'Big Data Engineering',
  'Basis Data',
  'Jaringan Komputer',
  'Sistem Tertanam (Embedded)',
  'Blockchain & Web3',
  'AR / VR',
  'Robotika',
  'Business Intelligence',
  'Tata Kelola TI & Audit',
  'Competitive Programming',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function passwordStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_LABEL = ['Terlalu Lemah', 'Lemah', 'Sedang', 'Cukup Kuat', 'Kuat (Sesuai Standar)'];

/* ---------------- Komponen kecil ---------------- */
function Field({ label, hint, hintTone, error, children, required = true }) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <span className={styles.label}>
          {label} {required && <span className={styles.req}>*</span>}
        </span>
        {hint && <span className={`${styles.hint} ${hintTone === 'blue' ? styles.hintBlue : ''}`}>{hint}</span>}
      </div>
      {children}
      {error && (
        <p className={styles.error} role="alert">
          <Icon icon="lucide:circle-alert" size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';

function SelectBox({ value, onChange, options, icon, invalid, id, placeholder, disabled }) {
  return (
    <div className={`${styles.selectBox} ${invalid ? styles.invalid : ''}`}>
      <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <Icon icon={icon || 'lucide:chevron-down'} size={16} />
    </div>
  );
}

/* ---------------- Halaman ---------------- */
/**
 * Registrasi mahasiswa (FR-LOGIN-04, FR-LOGIN-05) sesuai Figma ("refister farel"):
 * 1. Data diri (nama, NIM, email, kata sandi)  2. Informasi akademik & minat  3. Layar berhasil.
 * Semua data dikirim ke POST /register dan disimpan backend di tabel "pengguna".
 * Catatan: keunikan NIM belum dicek backend (BUG01 dari QA).
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [customBidang, setCustomBidang] = useState('');
  const [f, setF] = useState({
    name: '',
    nim: '',
    email: '',
    password: '',
    confirm: '',
    agree: false,
    // Data akademik & minat dimulai kosong — isi di Figma hanya contoh demo
    fakultas: FAKULTAS_FIF, // satu-satunya fakultas di AKSARA
    prodi: '',
    angkatan: '',
    kelasNo: '', // 2 digit terakhir kode kelas, diketik sendiri
    bidang: [],
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggleIn = (k, v) =>
    setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  const strength = passwordStrength(f.password);
  const errors = useMemo(
    () => ({
      // Langkah 1
      name: f.name.trim().length < 3 ? 'Nama lengkap minimal 3 huruf.' : '',
      nim: !f.nim ? 'NIM wajib diisi.' : '', // tanpa batasan jumlah digit
      email: !f.email
        ? 'Email wajib diisi.'
        : !EMAIL_RE.test(f.email.trim())
          ? 'Format email belum benar, contoh: nama@gmail.com.'
          : '',
      password:
        f.password.length < 8
          ? 'Kata sandi minimal 8 karakter.'
          : strength < 3
            ? 'Tambahkan huruf besar, angka, atau simbol.'
            : '',
      confirm: !f.confirm ? 'Ulangi kata sandi.' : f.confirm !== f.password ? 'Kata sandi belum sama.' : '',
      agree: !f.agree ? 'Setujui Ketentuan Layanan & Kebijakan Privasi untuk melanjutkan.' : '',
      // Langkah 2
      prodi: !f.prodi ? 'Pilih program studi.' : '',
      angkatan: !f.angkatan ? 'Pilih tahun angkatan.' : '',
      kelasNo: !/^\d{2}$/.test(f.kelasNo) ? 'Isi 2 digit nomor kelas, contoh: 12.' : '',
      bidang: f.bidang.length < 3 ? 'Pilih minimal 3 bidang keilmuan.' : '',
    }),
    [f, strength]
  );
  const STEP_FIELDS = {
    1: ['name', 'nim', 'email', 'password', 'confirm', 'agree'],
    2: ['prodi', 'angkatan', 'kelasNo', 'bidang'],
  };
  // Dua segmen pertama kode kelas otomatis dari prodi & angkatan
  const kodePr = KODE_PRODI[f.prodi] || '';
  const kodeAng = kodeAngkatan(f.angkatan);
  const kelas = kodePr && kodeAng && f.kelasNo.length === 2 ? `${kodePr}-${kodeAng}-${f.kelasNo}` : '';
  const err = (k) => touched[k] && errors[k];

  const next = (e) => {
    e?.preventDefault();
    const keys = STEP_FIELDS[step];
    setTouched((t) => ({ ...t, ...Object.fromEntries(keys.map((k) => [k, true])) }));
    if (keys.some((k) => errors[k])) return;
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  };
  const back = () => {
    setStep((s) => s - 1);
    window.scrollTo(0, 0);
  };

  const submit = async (e) => {
    e.preventDefault();
    const keys = STEP_FIELDS[2];
    setTouched((t) => ({ ...t, ...Object.fromEntries(keys.map((k) => [k, true])) }));
    if (keys.some((k) => errors[k])) return;
    setLoading(true);
    setServerError('');
    try {
      await register({
        name: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
        nim: f.nim,
        fakultas: f.fakultas,
        prodi: f.prodi,
        angkatan: f.angkatan,
        kelas,
        minat: { bidang: f.bidang },
      });
      setStep(3);
      window.scrollTo(0, 0);
    } catch (error) {
      // NFR-REL-02: tampilkan kegagalan, jangan menyatakan berhasil
      setServerError(
        /already registered/i.test(error.message) ? 'Email ini sudah terdaftar. Silakan masuk.' : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const enter = async () => {
    try {
      await login(f.email.trim(), f.password);
      navigate('/eksplorasi', { replace: true });
    } catch {
      navigate('/login', {
        replace: true,
        state: { notice: 'Akun berhasil dibuat. Cek email untuk verifikasi (jika diminta), lalu masuk.' },
      });
    }
  };

  const addCustomBidang = () => {
    const v = customBidang.trim().replace(/\s+/g, ' ');
    if (v && !f.bidang.some((b) => b.toLowerCase() === v.toLowerCase())) set('bidang', [...f.bidang, v]);
    setCustomBidang('');
  };
  const customList = f.bidang.filter((b) => !BIDANG.includes(b));

  const idCard = (
    <div className={styles.idCard}>
      <div className={styles.idTop}>
        <span className={styles.idLogo}>A</span>
        AKSARA ACADEMIC ID
        <span className={styles.idActive}>AKTIF</span>
      </div>
      <div className={styles.idPerson}>
        <span className={styles.initials}>{initialsOf(f.name)}</span>
        <div>
          <strong>{f.name || '—'}</strong>
          <span>NIM: {f.nim || '—'}</span>
        </div>
      </div>
      <dl className={styles.idFacts}>
        <div>
          <dt>Fakultas</dt>
          <dd>FIF</dd>
        </div>
        <div>
          <dt>Program Studi</dt>
          <dd>{f.prodi || '—'}</dd>
        </div>
        <div>
          <dt>Kelas / Angkatan</dt>
          <dd>
            {kelas || '—'} • {f.angkatan || '—'}
          </dd>
        </div>
      </dl>
    </div>
  );

  /* ---------- Langkah 1: Akun ---------- */
  if (step === 1) {
    return (
      <div className={styles.page}>
        <AuthPanel
          title={
            <>
              Bergabung dan mulai
              <br />
              belajar hari ini.
            </>
          }
          description="Daftar gratis dan akses ratusan materi belajar berkualitas, latihan soal dan fitur personalisasi"
        />
        <main className={styles.mainStep1}>
          <form className={`${styles.card} ${styles.cardStep1}`} onSubmit={next} noValidate>
            <h1 className={styles.title}>Registrasi Akun Mahasiswa</h1>

            <div className={styles.grid2}>
              <Field label="Nama Lengkap" hint="Sesuai KTP/Ijazah" error={err('name')}>
                <label className={`${styles.input} ${err('name') ? styles.invalid : ''}`}>
                  <Icon icon="lucide:user-round" size={16} />
                  <input
                    value={f.name}
                    onChange={(e) => set('name', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    placeholder="Zulfan Falah"
                    autoComplete="name"
                  />
                </label>
              </Field>
              <Field label="Nomor Induk Mahasiswa (NIM)" hint="Hanya angka" error={err('nim')}>
                <label className={`${styles.input} ${err('nim') ? styles.invalid : ''}`}>
                  <Icon icon="lucide:id-card" size={16} />
                  <input
                    inputMode="numeric"
                    value={f.nim}
                    onChange={(e) => set('nim', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => setTouched((t) => ({ ...t, nim: true }))}
                    placeholder="1301204099"
                    className={styles.mono}
                  />
                </label>
              </Field>
            </div>

            <Field label="Alamat Email" hint="Email aktif untuk login & verifikasi" error={err('email')}>
              <label className={`${styles.input} ${err('email') ? styles.invalid : ''}`}>
                <Icon icon="lucide:mail" size={16} />
                <input
                  type="email"
                  value={f.email}
                  onChange={(e) => set('email', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="nama@gmail.com"
                  autoComplete="email"
                />
                {!errors.email && <Icon icon="lucide:badge-check" size={18} className={styles.okIcon} />}
              </label>
              {!errors.email && (
                <p className={styles.okText}>
                  <Icon icon="lucide:circle-check" size={14} />
                  Format email valid
                </p>
              )}
            </Field>

            <div className={styles.grid2}>
              <Field label="Kata Sandi" error={err('password')}>
                <label className={`${styles.input} ${err('password') ? styles.invalid : ''}`}>
                  <Icon icon="lucide:lock" size={16} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={f.password}
                    onChange={(e) => set('password', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    placeholder="Min. 8 karakter"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.eye}
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    <Icon icon={showPw ? 'lucide:eye-off' : 'lucide:eye'} size={18} />
                  </button>
                </label>
                <div className={styles.strength}>
                  <div>
                    <span>Kekuatan Kata Sandi:</span>
                    <strong>{f.password ? STRENGTH_LABEL[strength] : '-'}</strong>
                  </div>
                  <div className={styles.bars}>
                    {[1, 2, 3, 4].map((n) => (
                      <span key={n} className={n <= strength ? styles.barOn : ''} />
                    ))}
                  </div>
                </div>
              </Field>
              <Field label="Konfirmasi Kata Sandi" error={err('confirm')}>
                <label className={`${styles.input} ${err('confirm') ? styles.invalid : ''}`}>
                  <Icon icon="lucide:lock-keyhole" size={16} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={f.confirm}
                    onChange={(e) => set('confirm', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                    placeholder="Ulangi kata sandi"
                    autoComplete="new-password"
                  />
                  {f.confirm && f.confirm === f.password && (
                    <Icon icon="lucide:check" size={16} className={styles.okIcon} />
                  )}
                </label>
                {f.confirm && f.confirm === f.password && (
                  <p className={styles.okText}>
                    <Icon icon="lucide:circle-check" size={14} />
                    Kata sandi cocok ✓
                  </p>
                )}
              </Field>
            </div>

            <label className={`${styles.agree} ${err('agree') ? styles.agreeInvalid : ''}`}>
              <input type="checkbox" checked={f.agree} onChange={(e) => set('agree', e.target.checked)} />
              <span>
                Saya menyetujui <a href="#">Ketentuan Layanan</a> dan <a href="#">Kebijakan Privasi</a> Repositori
                Akademik AKSARA Telkom University.
                <small>
                  Termasuk otorisasi sinkronisasi riwayat karya ilmiah, status skripsi, dan meta-analisis perpustakaan
                  digital terpusat.
                </small>
              </span>
            </label>
            {err('agree') && <p className={styles.error}>{errors.agree}</p>}

            <div className={styles.actions}>
              <a href="mailto:helpdesk-aksara@telkomuniversity.ac.id" className={styles.help}>
                <Icon icon="lucide:circle-help" size={16} />
                Bantuan Pendaftaran
              </a>
              <button type="submit" className={styles.primary}>
                Lanjut ke Informasi Akademik
                <Icon icon="lucide:arrow-right" size={18} />
              </button>
            </div>

            <p className={styles.loginBox}>
              Sudah memiliki akun aktif yang terdaftar?
              <Link to="/login">
                Masuk ke AKSARA <Icon icon="lucide:log-in" size={14} />
              </Link>
            </p>
          </form>
        </main>
      </div>
    );
  }

  /* ---------- Langkah 2: Informasi Akademik & Minat ---------- */
  if (step === 2) {
    return (
      <div className={styles.plain}>
        <div className={styles.step2}>
          <form className={`${styles.card} ${styles.cardWide}`} onSubmit={submit} noValidate>
            <div>
              <h1 className={styles.titleSm}>Informasi Akademik Mahasiswa</h1>
              <p className={styles.sub}>Langkah 2 dari 2: Validasi program studi, angkatan, dan kode kelas</p>
            </div>

            <Field label="Program Studi" error={err('prodi')}>
              <SelectBox
                value={f.prodi}
                options={PRODI_FIF}
                placeholder="Pilih Program Studi"
                invalid={err('prodi')}
                onChange={(v) => set('prodi', v)}
              />
            </Field>
            <div className={styles.grid2}>
              <Field label="Angkatan (Tahun Masuk)" error={err('angkatan')}>
                <SelectBox
                  value={f.angkatan}
                  options={ANGKATAN}
                  placeholder="Pilih Angkatan"
                  invalid={err('angkatan')}
                  onChange={(v) => set('angkatan', v)}
                  icon="lucide:calendar-days"
                />
              </Field>
              <Field label="Kode Kelas" error={err('kelasNo')}>
                <div className={`${styles.kelas} ${err('kelasNo') ? styles.invalid : ''}`}>
                  <span
                    className={styles.kelasSeg}
                    title="Kode program studi (otomatis)"
                    aria-label="Kode program studi"
                  >
                    {kodePr || 'XX'}
                  </span>
                  <span className={styles.kelasSep}>-</span>
                  <span className={styles.kelasSeg} title="Kode angkatan (otomatis)" aria-label="Kode angkatan">
                    {kodeAng || '00'}
                  </span>
                  <span className={styles.kelasSep}>-</span>
                  <input
                    className={styles.kelasInput}
                    inputMode="numeric"
                    placeholder="01"
                    aria-label="Nomor kelas (2 digit)"
                    value={f.kelasNo}
                    onChange={(e) => set('kelasNo', e.target.value.replace(/\D/g, '').slice(0, 2))}
                    onBlur={() => setTouched((t) => ({ ...t, kelasNo: true }))}
                  />
                  <Icon icon="lucide:users-round" size={16} />
                </div>
              </Field>
            </div>

            <section className={styles.minat}>
              <div className={styles.secHead}>
                <div>
                  <h2 className={styles.titleSm}>Personalisasi Minat Akademik</h2>
                  <p className={styles.sub}>
                    Pilih preferensi kurikulum dan keilmuan yang ingin Anda eksplorasi di AKSARA. Algoritma kami akan
                    menyesuaikan rekomendasi.
                  </p>
                </div>
                <span className={styles.secNote}>Minimal pilih 3 bidang</span>
              </div>
              <div className={styles.pills}>
                {[...BIDANG, ...customList].map((b) => {
                  const on = f.bidang.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      className={`${styles.pill} ${on ? styles.pillOn : ''}`}
                      aria-pressed={on}
                      onClick={() => toggleIn('bidang', b)}
                    >
                      <Icon icon={on ? 'lucide:circle-check' : 'lucide:plus'} size={16} />
                      {b}
                    </button>
                  );
                })}
              </div>
              <div className={styles.customRow}>
                <label className={`${styles.input} ${styles.inputSoft}`}>
                  <Icon icon="lucide:sparkles" size={16} />
                  <input
                    value={customBidang}
                    maxLength={40}
                    placeholder="Bidang lain? Ketik sendiri, mis. Quantum Computing"
                    onChange={(e) => setCustomBidang(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomBidang();
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={addCustomBidang}
                  disabled={!customBidang.trim()}
                >
                  <Icon icon="lucide:plus" size={16} />
                  Tambah
                </button>
              </div>
              {err('bidang') && <p className={styles.error}>{errors.bidang}</p>}
            </section>

            {serverError && (
              <p className={styles.error} role="alert">
                <Icon icon="lucide:circle-alert" size={13} />
                {serverError}
              </p>
            )}

            <div className={styles.actionsSplit}>
              <button type="button" className={styles.secondary} onClick={back}>
                <Icon icon="lucide:arrow-left" size={18} />
                Kembali
              </button>
              <button type="submit" className={styles.primaryDark} disabled={loading}>
                {loading ? 'Memproses…' : 'Daftar Sekarang'}
                <Icon icon="lucide:arrow-right" size={18} />
              </button>
            </div>
          </form>

          <aside className={styles.side}>
            <section className={styles.sideCard}>
              <h2 className={styles.sideTitle}>
                <Icon icon="lucide:id-card" size={18} />
                Pratinjau : Profil
              </h2>
              {idCard}
            </section>
          </aside>
        </div>
      </div>
    );
  }

  /* ---------- Berhasil ---------- */
  return (
    <div className={styles.plain}>
      <div className={styles.done}>
        <span className={styles.donePill}>
          <span />
          ONBOARDING MAHASISWA SELESAI
        </span>
        <section className={`${styles.doneCard} ${styles.doneCardSlim}`}>
          <div className={styles.shield}>
            <Icon icon="lucide:shield-check" size={34} />
            <span>
              <Icon icon="lucide:graduation-cap" size={12} />
            </span>
          </div>
          <h1 className={styles.titleLg}>Pendaftaran Akun Berhasil!</h1>
          <p className={styles.doneSub}>
            Selamat datang di ekosistem <b>AKSARA</b> Academic Repository Telkom University. Akun Anda telah berhasil
            dibuat.
          </p>
          <div className={styles.doneIdWrap}>{idCard}</div>
          <button type="button" className={styles.primaryDark} onClick={enter}>
            Mulai Eksplorasi
            <Icon icon="lucide:arrow-right" size={18} />
          </button>
        </section>
      </div>
    </div>
  );
}
