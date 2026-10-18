import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import AuthPanel from '../../components/AuthPanel/AuthPanel.jsx';
import { register, login } from '../../services/auth';
import { initials } from '../../services/adapters';
import styles from './RegisterPage.module.css';
import avatarCard from '../../assets/register/avatar-rian.jpg';
import libraryImg from '../../assets/register/perpustakaan.jpg';
import avatarDone from '../../assets/register/avatar-zulfan.jpg';

/* ---------------- Data pilihan ---------------- */
const FAKULTAS = ['Fakultas Informatika (FIF)', 'Fakultas Teknik Elektro (FTE)', 'Fakultas Rekayasa Industri (FRI)'];
const PRODI = {
  'Fakultas Informatika (FIF)': ['S1 Informatika', 'S1 Rekayasa Perangkat Lunak', 'S1 Teknologi Informasi', 'S1 Sains Data'],
  'Fakultas Teknik Elektro (FTE)': ['S1 Teknik Elektro', 'S1 Teknik Telekomunikasi', 'S1 Teknik Komputer'],
  'Fakultas Rekayasa Industri (FRI)': ['S1 Sistem Informasi', 'S1 Teknik Industri'],
};
const SEMESTER = ['Semester 1 (Ganjil)', 'Semester 2 (Genap)', 'Semester 3 (Ganjil)', 'Semester 4 (Genap)', 'Semester 5 (Ganjil)', 'Semester 6 (Genap)', 'Semester 7 (Ganjil)', 'Semester 8 (Genap)'];
const ANGKATAN = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];
const SARAN_MATKUL = ['Pemrograman Web', 'Jaringan Komputer', 'Rekayasa Perangkat Lunak', 'Keamanan Siber'];
const BIDANG = ['Software Engineering', 'Artificial Intelligence & ML', 'Web Development', 'Cybersecurity', 'Mobile Development', 'Data Science & Analytics', 'Cloud Computing & DevOps', 'UI/UX & Product Design', 'Internet of Things (IoT)', 'Game Development'];
const JENIS = [
  { key: 'proyek', title: 'Laporan Proyek Mata Kuliah', text: 'Dokumen rekayasa sistem, artefak laporan akhir semester, dan presentasi tim.' },
  { key: 'modul', title: 'Modul Praktikum & Cheat Sheet', text: 'Panduan setup environment laboratorium, ringkasan sintaks, dan tutorial teknis.' },
  { key: 'source', title: 'Source Code & Repositori GitHub', text: 'Akses kode sumber berlisensi MIT/Apache yang dapat di-clone langsung.' },
  { key: 'skripsi', title: 'Naskah Tugas Akhir / Skripsi', text: 'Naskah penuh, tinjauan pustaka, dan metodologi karya ilmiah sivitas akademika.' },
  { key: 'soal', title: 'Soal & Pembahasan Ujian (UTS/UAS)', text: 'Kumpulan bank soal tahun-tahun sebelumnya beserta kunci pembahasan asisten lab.' },
];
const TUJUAN = [
  { key: 'referensi', title: 'Mencari referensi tugas besar & proyek kuliah', text: 'Akses instan ke berkas skripsi, tugas akhir terdahulu, repositori kode sumber, dan modul praktikum.', tag: 'Direkomendasikan' },
  { key: 'berbagi', title: 'Membagikan wawasan pengalaman karir & magang', text: 'Publikasi portofolio riset industri, catatan magang bersertifikat, dan artikel telaah ilmiah mandiri.' },
  { key: 'ujian', title: 'Persiapan ujian & arsip materi akademik', text: 'Kumpulan bank soal, rangkuman rumus, materi tutorial asisten laboratorium, dan pembahasan UTS/UAS.' },
];
const WAWASAN = ['Pengalaman Magang (MSIB)', 'Studi Independen', 'Study Exchange (IISMA)', 'Lomba & Hackathon', 'Tips Skripsi'];

const SSO_DOMAIN = /@(student\.)?telkomuniversity\.ac\.id$/i;

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

function SelectBox({ value, onChange, options, icon, invalid, id }) {
  return (
    <div className={`${styles.selectBox} ${invalid ? styles.invalid : ''}`}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
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
 * Registrasi 4 langkah sesuai Figma ("refister farel"):
 * 1. Akun  2. Informasi Akademik  3. Minat Akademik  4. Tinjau & Konfirmasi  → layar berhasil.
 * Backend saat ini baru menyimpan email + password; data lain ikut dikirim supaya
 * langsung tersimpan begitu backend menambah kolomnya.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [matkulQuery, setMatkulQuery] = useState('');
  const [f, setF] = useState({
    name: '',
    nim: '',
    email: '',
    password: '',
    confirm: '',
    agree: false,
    fakultas: FAKULTAS[0],
    prodi: PRODI[FAKULTAS[0]][0],
    angkatan: '2024',
    semester: SEMESTER[2],
    kelas: '',
    matkul: ['Algoritma & Pemrograman (CS1A3)', 'Struktur Data (CS2B3)', 'Basis Data (CS2A3)', 'Interaksi Manusia & Komputer (CS3A3)'],
    bidang: ['Software Engineering', 'Artificial Intelligence & ML', 'Web Development'],
    jenis: ['proyek', 'modul', 'source'],
    tujuan: 'referensi',
    wawasan: ['Pengalaman Magang (MSIB)', 'Studi Independen', 'Lomba & Hackathon'],
    bio: '',
    declare: false,
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggleIn = (k, v) => setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  const strength = passwordStrength(f.password);
  const errors = useMemo(
    () => ({
      // Langkah 1
      name: f.name.trim().length < 3 ? 'Nama lengkap minimal 3 huruf.' : '',
      nim: !/^\d{10}$/.test(f.nim) ? 'NIM harus 10 digit angka.' : '',
      email: !f.email ? 'Email wajib diisi.' : !SSO_DOMAIN.test(f.email.trim()) ? 'Gunakan email SSO @student.telkomuniversity.ac.id.' : '',
      password: f.password.length < 8 ? 'Kata sandi minimal 8 karakter.' : strength < 3 ? 'Tambahkan huruf besar, angka, atau simbol.' : '',
      confirm: !f.confirm ? 'Ulangi kata sandi.' : f.confirm !== f.password ? 'Kata sandi belum sama.' : '',
      agree: !f.agree ? 'Setujui Ketentuan Layanan & Kebijakan Privasi untuk melanjutkan.' : '',
      // Langkah 2
      kelas: !/^[A-Z]{2,3}-\d{2}-\d{2}$/i.test(f.kelas.trim()) ? 'Format kode kelas contoh: IF-45-02.' : '',
      // Langkah 3
      bidang: f.bidang.length < 3 ? 'Pilih minimal 3 bidang keilmuan.' : '',
      jenis: f.jenis.length < 1 ? 'Pilih minimal 1 jenis resource.' : '',
      // Langkah 4
      declare: !f.declare ? 'Centang pernyataan kebenaran data sebelum mendaftar.' : '',
    }),
    [f, strength]
  );
  const STEP_FIELDS = { 1: ['name', 'nim', 'email', 'password', 'confirm', 'agree'], 2: ['kelas'], 3: ['bidang', 'jenis'], 4: ['declare'] };
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
    setTouched((t) => ({ ...t, declare: true }));
    if (errors.declare) return;
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
        semester: f.semester,
        kelas: f.kelas.toUpperCase(),
        minat: { matkul: f.matkul, bidang: f.bidang, jenis: f.jenis, tujuan: f.tujuan, wawasan: f.wawasan, bio: f.bio },
      });
      setStep(5);
      window.scrollTo(0, 0);
    } catch (error) {
      // NFR-REL-02: tampilkan kegagalan, jangan menyatakan berhasil
      setServerError(/already registered/i.test(error.message) ? 'Email ini sudah terdaftar. Silakan masuk.' : error.message);
    } finally {
      setLoading(false);
    }
  };

  const enter = async () => {
    try {
      await login(f.email.trim(), f.password);
      navigate('/eksplorasi', { replace: true });
    } catch {
      navigate('/login', { replace: true, state: { notice: 'Akun berhasil dibuat. Cek email untuk verifikasi (jika diminta), lalu masuk.' } });
    }
  };

  const addMatkul = (name) => {
    const v = name.trim();
    if (v && !f.matkul.includes(v)) set('matkul', [...f.matkul, v]);
    setMatkulQuery('');
  };

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
                  <input value={f.name} onChange={(e) => set('name', e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))} placeholder="Zulfan Falah" autoComplete="name" />
                </label>
              </Field>
              <Field label="Nomor Induk Mahasiswa (NIM)" hint="10 digit angka" error={err('nim')}>
                <label className={`${styles.input} ${err('nim') ? styles.invalid : ''}`}>
                  <Icon icon="lucide:id-card" size={16} />
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    value={f.nim}
                    onChange={(e) => set('nim', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => setTouched((t) => ({ ...t, nim: true }))}
                    placeholder="1301204099"
                    className={styles.mono}
                  />
                </label>
              </Field>
            </div>

            <Field label="Alamat Email Mahasiswa SSO" hint="Domain Resmi Tel-U" hintTone="blue" error={err('email')}>
              <label className={`${styles.input} ${err('email') ? styles.invalid : ''}`}>
                <Icon icon="lucide:mail" size={16} />
                <input
                  type="email"
                  value={f.email}
                  onChange={(e) => set('email', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="nama@student.telkomuniversity.ac.id"
                  autoComplete="email"
                />
                {!errors.email && <Icon icon="lucide:badge-check" size={18} className={styles.okIcon} />}
              </label>
              {!errors.email && (
                <p className={styles.okText}>
                  <Icon icon="lucide:circle-check" size={14} />
                  Format domain @student.telkomuniversity.ac.id terverifikasi valid
                </p>
              )}
            </Field>

            <div className={styles.grid2}>
              <Field label="Kata Sandi SSO AKSARA" error={err('password')}>
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
                  <button type="button" className={styles.eye} onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
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
                  {f.confirm && f.confirm === f.password && <Icon icon="lucide:check" size={16} className={styles.okIcon} />}
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
                Saya menyetujui <a href="#">Ketentuan Layanan</a> dan <a href="#">Kebijakan Privasi</a> Repositori Akademik AKSARA
                Telkom University.
                <small>Termasuk otorisasi sinkronisasi riwayat karya ilmiah, status skripsi, dan meta-analisis perpustakaan digital terpusat.</small>
              </span>
            </label>
            {err('agree') && <p className={styles.error}>{errors.agree}</p>}

            <div className={styles.actions}>
              <a href="mailto:helpdesk-aksara@telkomuniversity.ac.id" className={styles.help}>
                <Icon icon="lucide:circle-help" size={16} />
                Bantuan Pendaftaran SSO
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

  /* ---------- Langkah 2: Informasi Akademik ---------- */
  if (step === 2) {
    const kodeProdi = f.prodi.includes('Informatika') ? 'S1 Informatika' : f.prodi;
    return (
      <div className={styles.plain}>
        <div className={styles.step2}>
          <form className={`${styles.card} ${styles.cardWide}`} onSubmit={next} noValidate>
            <div className={styles.cardHead}>
              <div>
                <h1 className={styles.titleSm}>Informasi Akademik Mahasiswa</h1>
                <p className={styles.sub}>Langkah 2 dari 4: Validasi data fakultas, program studi, dan kurikulum aktif</p>
              </div>
              <span className={styles.badge}>Tahap 2 dari 4</span>
            </div>

            <div className={styles.infoBox}>
              <span className={styles.infoIcon}>
                <Icon icon="lucide:info" size={18} />
              </span>
              <div>
                <strong>SINKRONISASI OTOMATIS I-GRACIAS</strong>
                <p>
                  Data akademik digunakan untuk mempersonalisasi kurasi mata kuliah, modul lab, dan bank soal di fitur{' '}
                  <b>Eksplorasi Saya</b>.
                </p>
              </div>
            </div>

            <Field label="Perguruan Tinggi / Universitas" required={false}>
              <div className={`${styles.input} ${styles.locked}`}>
                <Icon icon="lucide:landmark" size={16} />
                <span>Telkom University (Bandung)</span>
                <span className={styles.verified}>
                  <Icon icon="lucide:badge-check" size={14} />
                  Terverifikasi
                </span>
              </div>
              <p className={styles.lockNote}>
                <Icon icon="lucide:lock" size={12} />
                Afiliasi institusi dikunci melalui domain SSO @student.telkomuniversity.ac.id
              </p>
            </Field>

            <div className={styles.grid2}>
              <Field label="Fakultas">
                <SelectBox
                  value={f.fakultas}
                  options={FAKULTAS}
                  onChange={(v) => setF((s) => ({ ...s, fakultas: v, prodi: PRODI[v][0] }))}
                />
              </Field>
              <Field label="Program Studi">
                <SelectBox value={f.prodi} options={PRODI[f.fakultas]} onChange={(v) => set('prodi', v)} />
              </Field>
            </div>
            <div className={styles.grid3}>
              <Field label="Angkatan (Tahun Masuk)">
                <SelectBox value={f.angkatan} options={ANGKATAN} onChange={(v) => set('angkatan', v)} icon="lucide:calendar-days" />
              </Field>
              <Field label="Semester Saat Ini">
                <SelectBox value={f.semester} options={SEMESTER} onChange={(v) => set('semester', v)} icon="lucide:trending-up" />
              </Field>
              <Field label="Kode Kelas" error={err('kelas')}>
                <label className={`${styles.input} ${styles.inputSoft} ${err('kelas') ? styles.invalid : ''}`}>
                  <input
                    value={f.kelas}
                    onChange={(e) => set('kelas', e.target.value.toUpperCase())}
                    onBlur={() => setTouched((t) => ({ ...t, kelas: true }))}
                    placeholder="IF-45-02"
                  />
                  <Icon icon="lucide:users-round" size={16} />
                </label>
              </Field>
            </div>

            <div className={styles.curriculum}>
              <span className={styles.curIcon}>
                <Icon icon="lucide:badge-check" size={16} />
              </span>
              <p>
                <strong>
                  Kurikulum Terpasang: <span>Kurikulum 2020 OBE</span>
                </strong>
                Penyesuaian otomatis untuk {kodeProdi} angkatan {f.angkatan}
              </p>
              <span className={styles.badgeSm}>Sesuai BAAK</span>
            </div>

            <div className={styles.actionsSplit}>
              <button type="button" className={styles.secondary} onClick={back}>
                <Icon icon="lucide:arrow-left" size={18} />
                Kembali
              </button>
              <button type="submit" className={styles.primaryDark}>
                Lanjut ke Minat Akademik
                <Icon icon="lucide:arrow-right" size={18} />
              </button>
            </div>
          </form>

          <aside className={styles.side}>
            <section className={styles.sideCard}>
              <h2 className={styles.sideTitle}>
                <Icon icon="lucide:id-card" size={18} />
                Pratinjau Kartu Mahasiswa
              </h2>
              <div className={styles.idCard}>
                <div className={styles.idTop}>
                  <span className={styles.idLogo}>A</span>
                  AKSARA ACADEMIC ID
                  <span className={styles.idActive}>AKTIF</span>
                </div>
                <div className={styles.idPerson}>
                  <img src={avatarCard} alt="" />
                  <div>
                    <strong>{f.name || 'Rian Maulana Pratama'}</strong>
                    <span>NIM: {f.nim || '1301213044'}</span>
                  </div>
                </div>
                <dl className={styles.idFacts}>
                  <div>
                    <dt>Fakultas</dt>
                    <dd>{f.fakultas.match(/\((\w+)\)/)?.[1]}</dd>
                  </div>
                  <div>
                    <dt>Program Studi</dt>
                    <dd>{f.prodi}</dd>
                  </div>
                  <div>
                    <dt>Kelas / Angkatan</dt>
                    <dd>
                      {f.kelas || 'IF-45-02'} • {f.angkatan}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
            <section className={styles.sideCard}>
              <h2 className={styles.sideTitle}>
                <Icon icon="lucide:book-open-text" size={18} />
                Akses Repositori yang Terbuka
              </h2>
              <p className={styles.sideText}>Berdasarkan jenjang {f.prodi}, Anda akan mendapatkan hak akses prioritas untuk:</p>
              <ul className={styles.checkList}>
                <li><Icon icon="lucide:circle-check" size={16} />4.820+ Skripsi &amp; Tugas Akhir Bidang AI, Data Science &amp; SE</li>
                <li><Icon icon="lucide:circle-check" size={16} />Modul Laboratorium Komputasi &amp; Jaringan Terapan</li>
                <li><Icon icon="lucide:circle-check" size={16} />Dataset Penelitian Terbuka Telkom University</li>
              </ul>
              <img src={libraryImg} alt="Perpustakaan Telkom University" className={styles.sideImg} />
            </section>
            <section className={styles.sideNote}>
              <strong>
                <Icon icon="lucide:badge-check" size={16} />
                Dukungan Helpdesk BAAK
              </strong>
              Jika pilihan Program Studi tidak sesuai dengan Kartu Rencana Studi (KRS) aktif, silakan laporkan ke Direktorat
              Pascasarjana &amp; Riset.
            </section>
          </aside>
        </div>
      </div>
    );
  }

  /* ---------- Langkah 3: Minat Akademik ---------- */
  if (step === 3) {
    return (
      <div className={styles.plain}>
        <form className={`${styles.card} ${styles.cardStep3}`} onSubmit={next} noValidate>
          <span className={styles.pillTop}>
            <Icon icon="lucide:graduation-cap" size={14} />
            Konfigurasi Rekomendasi Pintar
          </span>
          <h1 className={styles.titleLg}>Personalisasi Minat Akademik</h1>
          <p className={styles.sub}>
            Langkah 3 dari 4: Pilih preferensi kurikulum dan keilmuan yang ingin Anda eksplorasi di AKSARA. Algoritma kami
            akan menyesuaikan feed publikasi, berkas praktikum, dan materi penunjang tugas akhir Anda.
          </p>

          <section className={styles.matkulBox}>
            <div className={styles.secHead}>
              <div>
                <h2 className={styles.secTitle}>
                  <Icon icon="lucide:bookmark" size={18} />
                  Mata Kuliah Prioritas &amp; Favorit
                </h2>
                <p className={styles.secSub}>Pilih atau cari kode mata kuliah untuk menerima notifikasi materi kuliah, rangkuman, dan arsip proyek.</p>
              </div>
              <span className={styles.badgeSm}>{f.matkul.length} Terpilih</span>
            </div>
            <div className={styles.tagInput}>
              {f.matkul.map((m) => (
                <span key={m} className={styles.tagChip}>
                  {m}
                  <button type="button" aria-label={`Hapus ${m}`} onClick={() => toggleIn('matkul', m)}>
                    <Icon icon="lucide:x" size={14} />
                  </button>
                </span>
              ))}
              <label className={styles.tagSearch}>
                <Icon icon="lucide:search" size={16} />
                <input
                  value={matkulQuery}
                  onChange={(e) => setMatkulQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMatkul(matkulQuery);
                    }
                  }}
                  placeholder="Ketik nama atau kode mata kuliah lain..."
                />
              </label>
            </div>
            <div className={styles.suggest}>
              <span>Saran Kurikulum:</span>
              {SARAN_MATKUL.filter((s) => !f.matkul.includes(s)).map((s) => (
                <button key={s} type="button" onClick={() => addMatkul(s)}>
                  <Icon icon="lucide:plus" size={12} />
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className={styles.secHead}>
              <h2 className={styles.secTitle}>
                <Icon icon="lucide:network" size={20} />
                Bidang Keilmuan &amp; Ranah Penelitian
              </h2>
              <span className={styles.secNote}>Minimal pilih 3 bidang</span>
            </div>
            <p className={styles.secSub}>Tentukan rumpun riset yang paling sesuai dengan target proyek mandiri, laboratorium riset, atau kompetisi PKM.</p>
            <div className={styles.pills}>
              {BIDANG.map((b) => {
                const on = f.bidang.includes(b);
                return (
                  <button key={b} type="button" className={`${styles.pill} ${on ? styles.pillOn : ''}`} aria-pressed={on} onClick={() => toggleIn('bidang', b)}>
                    <Icon icon={on ? 'lucide:circle-check' : 'lucide:plus'} size={16} />
                    {b}
                  </button>
                );
              })}
            </div>
            {err('bidang') && <p className={styles.error}>{errors.bidang}</p>}
          </section>

          <section>
            <div className={styles.secHead}>
              <h2 className={styles.secTitle}>
                <Icon icon="lucide:layout-grid" size={18} />
                Jenis Resource &amp; Repositori Prioritas
              </h2>
              <span className={styles.secNoteBlue}>Bisa memilih lebih dari satu</span>
            </div>
            <p className={styles.secSub}>Bantu repositori menyusun prioritas unduhan langsung, format berkas, serta indeks pencarian cepat pada dashboard Anda.</p>
            <div className={styles.jenisGrid}>
              {JENIS.map((j) => {
                const on = f.jenis.includes(j.key);
                return (
                  <label key={j.key} className={`${styles.jenis} ${on ? styles.jenisOn : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => toggleIn('jenis', j.key)} />
                    <span>
                      <strong>{j.title}</strong>
                      {j.text}
                    </span>
                  </label>
                );
              })}
            </div>
            {err('jenis') && <p className={styles.error}>{errors.jenis}</p>}
          </section>

          <div className={styles.actionsSplit}>
            <button type="button" className={styles.secondary} onClick={back}>
              <Icon icon="lucide:arrow-left" size={18} />
              Kembali ke Step 2
            </button>
            <button type="submit" className={styles.primary}>
              Lanjut ke Konfirmasi
              <Icon icon="lucide:arrow-right" size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ---------- Langkah 4: Tinjau ---------- */
  if (step === 4) {
    const bidangShort = f.bidang.map((b) => b.replace('Artificial Intelligence & ML', 'AI / ML').replace('Software Engineering', 'Software Eng'));
    return (
      <div className={styles.plain}>
        <form className={styles.step4} onSubmit={submit} noValidate>
          <div className={styles.step4Head}>
            <span className={styles.pillTop}>
              <Icon icon="lucide:badge-check" size={14} />
              TAHAP AKHIR PENDAFTARAN
            </span>
            <h1 className={styles.titleLg}>Tinjau Data &amp; Preferensi Eksplorasi</h1>
            <p className={styles.sub}>
              Langkah 4 dari 4: Konfirmasi ringkasan data registrasi dan tentukan fokus pembelajaran untuk personalisasi
              dashboard repositori ilmiah Anda.
            </p>
          </div>

          <div className={styles.step4Grid}>
            <div className={styles.step4Col}>
              <section className={styles.card}>
                <div className={styles.qHead}>
                  <span className={styles.qIcon}><Icon icon="lucide:target" size={16} /></span>
                  <div>
                    <h2>1. Tujuan Utama Menggunakan AKSARA</h2>
                    <p>Pilih fokus aktivitas harian Anda di dalam ekosistem riset</p>
                  </div>
                  <span className={styles.qTag}>Wajib</span>
                </div>
                <div className={styles.radios}>
                  {TUJUAN.map((t) => (
                    <label key={t.key} className={`${styles.radio} ${f.tujuan === t.key ? styles.radioOn : ''}`}>
                      <input type="radio" name="tujuan" checked={f.tujuan === t.key} onChange={() => set('tujuan', t.key)} />
                      <span>
                        <strong>
                          {t.title} {t.tag && <em>{t.tag}</em>}
                        </strong>
                        {t.text}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.qHead}>
                  <span className={styles.qIcon}><Icon icon="lucide:shapes" size={16} /></span>
                  <div>
                    <h2>2. Jenis Konten Wawasan Tambahan</h2>
                    <p>Klik tag untuk menambahkan atau mengurangi rekomendasi umpan beranda</p>
                  </div>
                  <span className={styles.qCount}>{f.wawasan.length} Dipilih</span>
                </div>
                <div className={styles.pills}>
                  {WAWASAN.map((w) => {
                    const on = f.wawasan.includes(w);
                    return (
                      <button key={w} type="button" className={`${styles.pillSm} ${on ? styles.pillSmOn : ''}`} aria-pressed={on} onClick={() => toggleIn('wawasan', w)}>
                        <Icon icon={on ? 'lucide:check' : 'lucide:plus'} size={14} />
                        {w}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.qHead}>
                  <span className={styles.qIcon}><Icon icon="lucide:id-card" size={16} /></span>
                  <div>
                    <h2>3. Bio Singkat Mahasiswa</h2>
                    <p>Deskripsikan latar belakang dan minat riset untuk profil publik repositori</p>
                  </div>
                  <span className={styles.qCount}>Opsional</span>
                </div>
                <textarea
                  className={styles.bio}
                  maxLength={250}
                  value={f.bio}
                  onChange={(e) => set('bio', e.target.value)}
                  placeholder={`Mahasiswa ${f.prodi} Tel-U dengan minat pada AI/ML, sistem terdistribusi, dan riset open-source software.`}
                />
                <div className={styles.bioFoot}>
                  <span>Bio ini akan ditampilkan pada halaman kontribusi &amp; profil Anda.</span>
                  <span>{f.bio.length}/250 karakter</span>
                </div>
              </section>
            </div>

            <aside className={`${styles.card} ${styles.summary}`}>
              <div className={styles.sumHead}>
                <h2>
                  <Icon icon="lucide:clipboard-check" size={20} />
                  Ringkasan Registrasi
                </h2>
                <span className={styles.badgeSm}>Terverifikasi</span>
              </div>
              <div className={styles.sumBox}>
                <div className={styles.sumPerson}>
                  <span className={styles.sumAvatar}>{initials(f.name)}</span>
                  <div>
                    <strong>{f.name}</strong>
                    <span>NIM: {f.nim}</span>
                  </div>
                  <button type="button" className={styles.edit} onClick={() => setStep(1)}>
                    <Icon icon="lucide:pencil" size={12} />
                    Ubah
                  </button>
                </div>
                <p className={styles.sumEmail}>
                  <Icon icon="lucide:mail" size={14} />
                  {f.email}
                </p>
              </div>
              <div className={styles.sumBox}>
                <div className={styles.sumRow}>
                  <span className={styles.over}>Profil Akademik</span>
                  <button type="button" className={styles.edit} onClick={() => setStep(2)}>
                    <Icon icon="lucide:pencil" size={12} />
                    Ubah
                  </button>
                </div>
                <strong className={styles.uni}>
                  <span />
                  Telkom University
                </strong>
                <p className={styles.sumText}>
                  {f.fakultas.replace(/ \(\w+\)/, '')} • {f.prodi}
                </p>
                <div className={styles.miniTags}>
                  <span>Angkatan {f.angkatan}</span>
                  <span>
                    {f.semester.split(' (')[0]} ({f.kelas})
                  </span>
                  <span className={styles.miniBlue}>Status: Aktif</span>
                </div>
              </div>
              <div className={styles.sumBox}>
                <div className={styles.sumRow}>
                  <span className={styles.over}>Kategori Minat Terpilih</span>
                  <button type="button" className={styles.edit} onClick={() => setStep(3)}>
                    <Icon icon="lucide:pencil" size={12} />
                    Ubah
                  </button>
                </div>
                <p className={styles.sumSmall}>{f.bidang.length} Bidang Minat Utama:</p>
                <div className={styles.miniTags}>
                  {bidangShort.map((b) => (
                    <span key={b} className={styles.miniBlue}>{b}</span>
                  ))}
                </div>
                <p className={styles.sumSmall} style={{ marginTop: 12 }}>Mata Kuliah Favorit:</p>
                <p className={styles.sumText}>{f.matkul.length} Mata Kuliah Favorit terindeks pada kurikulum 2020-2024</p>
              </div>
              <div className={styles.access}>
                <span className={styles.accessIcon}><Icon icon="lucide:graduation-cap" size={20} /></span>
                <div>
                  <span>Hak Akses Repositori</span>
                  <strong>Akses Penuh Sivitas</strong>
                </div>
                <Icon icon="lucide:lock-keyhole-open" size={24} />
              </div>
              <label className={`${styles.declare} ${err('declare') ? styles.agreeInvalid : ''}`}>
                <input type="checkbox" checked={f.declare} onChange={(e) => set('declare', e.target.checked)} />
                <span>
                  Saya menyatakan bahwa seluruh data di atas adalah benar dan sah sebagai civitas akademika Telkom University,
                  serta bersedia mematuhi <a href="#">Kode Etik &amp; Integritas Ilmiah Repositori AKSARA</a>.
                </span>
              </label>
              {err('declare') && <p className={styles.error}>{errors.declare}</p>}
              {serverError && (
                <p className={styles.serverError} role="alert">
                  <Icon icon="lucide:circle-alert" size={15} />
                  {serverError}
                </p>
              )}
              <div className={styles.finalActions}>
                <button type="button" className={styles.secondary} onClick={back}>
                  <Icon icon="lucide:arrow-left" size={16} />
                  Kembali
                </button>
                <button type="submit" className={styles.primaryDark} disabled={loading}>
                  <Icon icon="lucide:circle-check" size={20} />
                  {loading ? 'Memproses…' : 'Daftar Sekarang & Aktivasi Akun'}
                </button>
              </div>
              <p className={styles.ssoNote}>
                <Icon icon="lucide:lock" size={12} />
                Aktivasi akun diverifikasi instan via Tel-U SSO Central
              </p>
            </aside>
          </div>
          <p className={styles.afterNote}>
            <Icon icon="lucide:info" size={16} />
            Setelah aktivasi berhasil, tautan konfirmasi repositori akan diteruskan ke kotak masuk email mahasiswa Telkom University Anda.
          </p>
        </form>
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
        <section className={styles.doneCard}>
          <div className={styles.shield}>
            <Icon icon="lucide:shield-check" size={34} />
            <span>
              <Icon icon="lucide:graduation-cap" size={12} />
            </span>
          </div>
          <h1 className={styles.titleLg}>Pendaftaran Akun Berhasil!</h1>
          <p className={styles.doneSub}>
            Selamat datang di ekosistem <b>AKSARA</b> Academic Repository Telkom University. Identitas SSO Anda telah
            tersinkronisasi sempurna.
          </p>
          <div className={styles.doneGrid}>
            <div className={styles.doneId}>
              <div className={styles.doneIdHead}>
                <span>
                  <Icon icon="lucide:id-card" size={16} />
                  KARTU TANDA MAHASISWA DIGITAL
                </span>
                <em>• Aktif &amp; Terverifikasi</em>
              </div>
              <div className={styles.donePerson}>
                <img src={avatarDone} alt="" />
                <div>
                  <strong>{f.name}</strong>
                  <code>NIM: {f.nim}</code>
                  <span>Angkatan {f.angkatan} • Reguler</span>
                </div>
              </div>
              <span className={styles.over}>Fakultas &amp; Program Studi</span>
              <strong className={styles.doneProdi}>{f.prodi}</strong>
              <span className={styles.sumText}>{f.fakultas}</span>
              <p className={styles.doneEmail}>
                <span>@ {f.email}</span>
                <Icon icon="lucide:lock" size={14} />
              </p>
            </div>
            <div className={styles.doneAccess}>
              <span className={styles.over}>
                <Icon icon="lucide:key-round" size={14} /> HAK AKSES REPOSITORI
              </span>
              {[
                ['lucide:book-open-text', 'Repositori Ilmiah Lengkap', 'Akses ribuan berkas tugas akhir, tesis, & repositori kode laboratorium.'],
                ['lucide:sparkles', 'Rekomendasi Pintar', `Personalisasi otomatis berdasarkan ${f.matkul.length} mata kuliah pilihan Anda semester ini.`],
                ['lucide:file-up', 'Kontributor Mahasiswa', 'Siap membagikan modul proyek open-source dan wawasan karier riset.'],
              ].map(([icon, t, d]) => (
                <div key={t} className={styles.accessItem}>
                  <span><Icon icon={icon} size={16} /></span>
                  <p>
                    <strong>{t}</strong>
                    {d}
                  </p>
                </div>
              ))}
              <span className={styles.level}>
                <Icon icon="lucide:badge-check" size={12} />
                Hak akses level: Scholar Standard
              </span>
            </div>
          </div>
          <div className={styles.doneActions}>
            <button type="button" className={styles.primaryDark} onClick={enter}>
              Masuk ke AKSARA (Mulai Eksplorasi)
              <Icon icon="lucide:arrow-right" size={18} />
            </button>
            <button type="button" className={styles.softBtn} onClick={() => window.print()}>
              <Icon icon="lucide:download" size={16} />
              Unduh Ringkasan Akun PDF
            </button>
          </div>
          <p className={styles.doneNote}>
            <Icon icon="lucide:info" size={13} />
            Tautan verifikasi cadangan dan kode akses autentikator telah dikirimkan ke email SSO student Anda.
          </p>
        </section>
        <div className={styles.doneStats}>
          {[
            ['lucide:library-big', '18,400+ Naskah', 'Tugas Akhir, Tesis & Jurnal'],
            ['lucide:square-terminal', '3,200+ Repository', 'Dataset & Kode Komputasi'],
            ['lucide:shield-check', 'ISO 27001 Teruji', 'Perlindungan Hak Cipta Riset'],
          ].map(([icon, t, d]) => (
            <div key={t}>
              <span><Icon icon={icon} size={20} /></span>
              <p>
                <strong>{t}</strong>
                {d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
