import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon/Icon.jsx';
import { uploadResource } from '../services/resources';
import { getKategori, getMatkul, getProdi, getSemester, semesterNumberOf } from '../services/master';
import useAsync from '../hooks/useAsync';
import { USE_API } from '../services/api';
import styles from './UploadPage.module.css';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import iconCloud from '../assets/upload/icon-cloud.svg';
import iconFile from '../assets/upload/icon-file.svg';
import iconLink from '../assets/upload/icon-link.svg';
import iconInfo from '../assets/upload/icon-info.svg';
import iconSection from '../assets/upload/icon-section.svg';
import iconChevron from '../assets/upload/icon-chevron.svg';
import iconTagRemove from '../assets/upload/icon-tag-remove.svg';
import iconShield from '../assets/upload/icon-shield.svg';
import iconUpload from '../assets/upload/icon-upload.svg';
import { FAKULTAS, PRODI_FIF } from '../data/academic';

// Sesuai aturan backend (multer di POST /resource): PDF, Word, PowerPoint, JPG/PNG/WebP, maks. 10 MB
const EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'webp'];
const ACCEPT = EXTENSIONS.map((e) => `.${e}`).join(',');
const MAX_MB = 10;
const ABSTRACT_MAX = 600;

const OPTIONS = {
  kategori: [
    'Tugas Kuliah & Makalah',
    'Laporan Magang & PKL',
    'Skripsi & Tugas Akhir',
    'Bank Soal',
    'Riset & Publikasi Paper',
    'Modul Praktikum',
  ],
  tahun: ['2025/2026 (Tahun Ini)', '2024/2025', '2023/2024', '2022/2023'],
  // AKSARA khusus Fakultas Informatika (FIF)
  fakultas: [FAKULTAS],
  prodi: PRODI_FIF,
  semester: [
    'Semester 1',
    'Semester 2',
    'Semester 3',
    'Semester 4',
    'Semester 5',
    'Semester 6',
    'Semester 7',
    'Semester 8+',
  ],
  matkul: ['Struktur Data', 'Basis Data', 'Pemrograman Berbasis Objek', 'Kecerdasan Buatan', 'Internet of Things'],
};

function Label({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className={styles.label}>
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
}

function SelectField({ id, label, placeholder, options, value, onChange, disabled }) {
  return (
    <div className={styles.field}>
      <Label htmlFor={id} required>
        {label}
      </Label>
      <div className={styles.selectWrap}>
        <select
          id={id}
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={disabled}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) =>
            typeof o === 'string' ? (
              <option key={o}>{o}</option>
            ) : (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            )
          )}
        </select>
        {/* Field terkunci (mis. Fakultas = FIF) tidak perlu panah dropdown */}
        {!disabled && <img src={iconChevron} alt="" className={styles.selectIcon} />}
      </div>
    </div>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [form, setForm] = useState({
    url: '',
    title: '',
    abstract: '',
    kategori: '',
    tahun: '',
    fakultas: FAKULTAS,
    prodi: '',
    semester: '',
    matkul: '',
    tags: [],
    agree: false,
  });
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  // Mode API: pilihan kategori & mata kuliah diambil dari backend (GET /kategori, GET /mata-kuliah)
  const { data: kategoriList } = useAsync(() => getKategori().catch(() => []), []);
  const { data: matkulList } = useAsync(() => getMatkul().catch(() => []), []);
  const matkulLabel = (m) => (m.kode_matkul ? `${m.kode_matkul} – ${m.nama_matkul}` : m.nama_matkul);
  const kategoriOptions = kategoriList?.length ? kategoriList.map((k) => k.nama_kategori) : OPTIONS.kategori;
  // Mode API: nilai option = matkul_id (nama mata kuliah bisa sama di beberapa prodi, mis. "Agama").
  // Label kembar diberi nomor supaya bisa dibedakan.
  // Mode API: Program Studi & Semester dari GET /prodi & GET /semester (nilai option = id-nya)
  const { data: prodiList } = useAsync(() => getProdi().catch(() => []), []);
  const { data: semesterList } = useAsync(() => getSemester().catch(() => []), []);
  const prodiOptions = prodiList?.length
    ? prodiList.map((p) => ({ value: String(p.prodi_id), label: p.nama_prodi }))
    : OPTIONS.prodi;
  const semesterOptions = semesterList?.length
    ? [...semesterList]
        .sort((a, b) => (semesterNumberOf(a.nama_semester) ?? 99) - (semesterNumberOf(b.nama_semester) ?? 99))
        .map((x) => ({ value: String(x.semester_id), label: x.nama_semester }))
    : OPTIONS.semester;
  const isProdiId = prodiList?.some((p) => String(p.prodi_id) === form.prodi);
  const isSemesterId = semesterList?.some((x) => String(x.semester_id) === form.semester);

  // Mata kuliah disaring sesuai prodi & semester yang dipilih (kalau datanya terhubung di database)
  const matkulFiltered = useMemo(() => {
    if (!matkulList?.length) return [];
    const byProdi = isProdiId ? matkulList.filter((m) => String(m.prodi_id) === form.prodi) : matkulList;
    const bySmt = isSemesterId ? byProdi.filter((m) => String(m.semester_id) === form.semester) : byProdi;
    return bySmt.length ? bySmt : byProdi.length ? byProdi : matkulList;
  }, [matkulList, form.prodi, form.semester, isProdiId, isSemesterId]);

  // Pilihan mata kuliah yang tidak lagi cocok dengan prodi/semester → dikosongkan
  useEffect(() => {
    if (form.matkul && matkulFiltered.length && !matkulFiltered.some((m) => String(m.matkul_id) === form.matkul)) {
      setForm((f) => ({ ...f, matkul: '' }));
    }
  }, [matkulFiltered, form.matkul]);

  const matkulOptions = useMemo(() => {
    if (!matkulList?.length) return OPTIONS.matkul;
    const seen = {};
    return [...matkulFiltered]
      .sort(
        (a, b) =>
          (a.nama_matkul || '').localeCompare(b.nama_matkul || '', 'id') ||
          (a.kode_matkul || '').localeCompare(b.kode_matkul || '')
      )
      .map((m) => {
        const base = `${matkulLabel(m)}${m.sks ? ` (${m.sks} SKS)` : ''}`;
        seen[base] = (seen[base] || 0) + 1;
        return { value: String(m.matkul_id), label: seen[base] > 1 ? `${base} #${seen[base]}` : base };
      });
  }, [matkulList, matkulFiltered]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);

  const pickFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!EXTENSIONS.includes(ext))
      return setFileError('Format file tidak didukung. Gunakan PDF, Word, PowerPoint, JPG, PNG, atau WebP.');
    if (f.size > MAX_MB * 1024 * 1024) return setFileError(`Ukuran file melebihi ${MAX_MB}MB.`);
    setFileError('');
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const addTag = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const raw = tagInput.trim().replace(/\s+/g, '');
    if (!raw) return;
    const tag = raw.startsWith('#') ? raw : `#${raw}`;
    if (!form.tags.includes(tag)) set('tags')([...form.tags, tag]);
    setTagInput('');
  };

  // Backend saat ini mewajibkan file; unggah lewat link saja baru bisa setelah backend mendukungnya
  const needsFile = USE_API;
  const missing = [
    !form.title.trim() && 'judul',
    !form.abstract.trim() && 'deskripsi',
    !form.kategori && 'kategori',
    !form.tahun && 'tahun akademik',
    !form.fakultas && 'fakultas',
    !form.prodi && 'program studi',
    !form.semester && 'semester',
    !form.matkul && 'mata kuliah',
    !(file || (!needsFile && form.url.trim())) && 'file',
    !form.agree && 'persetujuan komitmen integritas',
  ].filter(Boolean);
  const canSubmit = missing.length === 0 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      // Cari ID dari nama yang dipilih. prodi_id & semester_id diambil dari data mata kuliah
      // supaya pasti valid (foreign key) di database.
      const kat = kategoriList?.find((k) => k.nama_kategori === form.kategori);
      const mk = matkulList?.find((m) => String(m.matkul_id) === form.matkul || matkulLabel(m) === form.matkul);
      await uploadResource(
        {
          ...form,
          matkul: mk ? matkulLabel(mk) : form.matkul, // dipakai sebagai "sumber" bila tidak ada URL
          categoryId: kat?.category_id,
          matkulId: mk?.matkul_id,
          prodiId: isProdiId ? form.prodi : mk?.prodi_id,
          semesterId: isSemesterId ? form.semester : mk?.semester_id,
        },
        file
      );
      setDone(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setSubmitError(err.message || 'Gagal mengunggah. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className={styles.page}>
        <Header variant="minimal" />
        <main className={styles.main}>
          <div className={`${styles.card} ${styles.success}`}>
            <Icon icon="lucide:circle-check" size={48} className={styles.successIcon} />
            <h1 className={styles.title}>Resource berhasil dikirim!</h1>
            <p className={styles.subtitle}>
              Terima kasih sudah berbagi. Resource-mu akan tampil di Eksplorasi setelah disetujui admin.
            </p>
            <div className={styles.buttons}>
              <Link to="/eksplorasi/hasil" className={styles.cancel}>
                Ke Eksplorasi
              </Link>
              <button
                type="button"
                className={styles.submit}
                onClick={() => {
                  setDone(false);
                  setFile(null);
                  setForm((f) => ({ ...f, title: '', abstract: '', url: '', agree: false }));
                }}
              >
                Unggah Lagi
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header variant="minimal" />

      <main className={styles.main}>
        <div className={`${styles.blob} ${styles.blobBlue}`} aria-hidden="true" />
        <div className={`${styles.blob} ${styles.blobOrange}`} aria-hidden="true" />

        <div className={styles.backRow}>
          <button type="button" className={styles.back} onClick={() => navigate(-1)}>
            <Icon icon="lucide:chevron-left" size={12} />
            Kembali
          </button>
        </div>
        <form className={styles.card} onSubmit={handleSubmit} noValidate={false}>
          <header className={styles.cardHeader}>
            <h1 className={styles.title}>Unggah Resource Akademik</h1>
            <p className={styles.subtitle}>
              Bagikan tugas, laporan, atau modul praktikum untuk membantu mahasiswa lain dan memperkaya khazanah ilmiah
              kampus.
            </p>
          </header>

          {/* SECTION 1: Berkas utama */}
          <section className={styles.section1}>
            <Label htmlFor="file" required>
              Berkas Utama / Naskah Dokumen
            </Label>

            <div
              className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <span className={styles.cloudBox}>
                <img src={iconCloud} alt="" />
              </span>
              <h3 className={styles.dropTitle}>{file ? file.name : 'Tarik & lepas file Anda di sini'}</h3>
              <p className={styles.dropHint}>
                {file ? (
                  `${(file.size / 1024 / 1024).toFixed(1)} MB — siap diunggah`
                ) : (
                  <>
                    Mendukung format <strong>PDF, Word, PowerPoint, JPG, PNG, dan WebP</strong> (Maksimal {MAX_MB}MB per
                    file)
                  </>
                )}
              </p>
              {fileError && (
                <p className={styles.error} role="alert">
                  {fileError}
                </p>
              )}
              <button type="button" className={styles.pickButton} onClick={() => fileInput.current?.click()}>
                <img src={iconFile} alt="" />
                {file ? 'Ganti File' : 'Pilih File dari Komputer'}
              </button>
              <input
                ref={fileInput}
                id="file"
                type="file"
                accept={ACCEPT}
                className="visually-hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </div>

            <div className={styles.orDivider}>
              <span>ATAU</span>
            </div>

            <div className={styles.urlField}>
              <label htmlFor="url" className={styles.smallLabel}>
                Tautkan URL Eksternal (Opsional)
              </label>
              <div className={styles.urlInputWrap}>
                <img src={iconLink} alt="" className={styles.urlIcon} />
                <input
                  id="url"
                  type="url"
                  className={styles.urlInput}
                  placeholder="Masukkan link Google Drive, GitHub, atau Jurnal ilmiah..."
                  value={form.url}
                  onChange={(e) => set('url')(e.target.value)}
                />
              </div>
              <p className={styles.helper}>
                <img src={iconInfo} alt="" />
                Gunakan opsi ini jika dokumen disimpan di Google Drive publik atau repository GitHub.
              </p>
            </div>
          </section>

          {/* SECTION 2: Metadata */}
          <section className={styles.section2}>
            <h2 className={styles.sectionTitle}>
              <img src={iconSection} alt="" />
              Informasi &amp; Metadata Dokumen
            </h2>

            <div className={styles.field}>
              <Label htmlFor="title" required>
                Judul Karya / Dokumen
              </Label>
              <input
                id="title"
                className={styles.input}
                placeholder="Misal: Laporan Praktikum Struktur Data Modul 1 — Implementasi AVL Tree & Binary Search"
                value={form.title}
                onChange={(e) => set('title')(e.target.value)}
                required
              />
            </div>

            <div className={`${styles.field} ${styles.abstractField}`}>
              <div className={styles.labelRow}>
                <Label htmlFor="abstract" required>
                  Deskripsi / Abstrak Ringkas
                </Label>
                <span className={styles.counter}>
                  {form.abstract.length} / {ABSTRACT_MAX}
                </span>
              </div>
              <textarea
                id="abstract"
                className={styles.textarea}
                maxLength={ABSTRACT_MAX}
                placeholder="Tuliskan ringkasan singkat mengenai isi dokumen ini, metodologi, dan tujuan praktikum atau riset..."
                value={form.abstract}
                onChange={(e) => set('abstract')(e.target.value)}
                required
              />
            </div>

            <div className={styles.row}>
              <SelectField
                id="kategori"
                label="Kategori"
                placeholder="Pilih Kategori"
                options={kategoriOptions}
                value={form.kategori}
                onChange={set('kategori')}
              />
              <SelectField
                id="tahun"
                label="Tahun Akademik"
                placeholder="Pilih Tahun Akademik"
                options={OPTIONS.tahun}
                value={form.tahun}
                onChange={set('tahun')}
              />
            </div>
            <div className={styles.row}>
              <SelectField
                id="fakultas"
                label="Fakultas"
                options={OPTIONS.fakultas}
                value={form.fakultas}
                onChange={set('fakultas')}
                disabled
              />
              <SelectField
                id="prodi"
                label="Program Studi"
                placeholder="Pilih Program Studi"
                options={prodiOptions}
                value={form.prodi}
                onChange={set('prodi')}
              />
            </div>
            <div className={styles.row}>
              <SelectField
                id="semester"
                label="Semester"
                placeholder="Pilih Semester"
                options={semesterOptions}
                value={form.semester}
                onChange={set('semester')}
              />
              <SelectField
                id="matkul"
                label="Mata Kuliah"
                placeholder="Pilih Mata Kuliah"
                options={matkulOptions}
                value={form.matkul}
                onChange={set('matkul')}
              />
            </div>

            <div className={styles.tagsField}>
              <label htmlFor="tag-input" className={styles.smallLabel}>
                Kata Kunci / Tag Riset (Tekan Enter untuk menambah)
              </label>
              <div className={styles.tagsBox}>
                {form.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                    <button
                      type="button"
                      aria-label={`Hapus ${t}`}
                      onClick={() => set('tags')(form.tags.filter((x) => x !== t))}
                    >
                      <img src={iconTagRemove} alt="" />
                    </button>
                  </span>
                ))}
                <input
                  id="tag-input"
                  className={styles.tagInput}
                  placeholder="+ Tambah kata kunci..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                />
              </div>
            </div>
          </section>

          {/* SECTION 3: Deklarasi & aksi */}
          <section className={styles.section3}>
            <div className={styles.notice}>
              <img src={iconShield} alt="" className={styles.noticeIcon} />
              <p>
                <span className={styles.noticeBrand}>AKSARA Telkom University</span> menjunjung tinggi etika kejujuran
                akademik. Kontributor dilarang keras mengunggah kunci jawaban resmi ujian tanpa izin dosen, data rahasia
                instansi mitra kerja praktik, atau dokumen yang memicu pelanggaran hak kekayaan intelektual (HAKI).
              </p>
            </div>

            <label className={styles.agree}>
              <input type="checkbox" checked={form.agree} onChange={(e) => set('agree')(e.target.checked)} required />
              <span className={styles.agreeBox} aria-hidden="true" />
              <span>
                <strong>Komitmen Integritas &amp; Orisinalitas:</strong> Saya menyatakan bahwa dokumen ini adalah karya
                orisinal saya atau saya memiliki hak legal untuk membagikannya, dan tidak melanggar etika akademik
                Telkom University (bebas plagiarisme dan mencantumkan sumber rujukan dengan benar).
              </span>
            </label>

            {submitError && (
              <p className={styles.submitError} role="alert">
                {submitError}
              </p>
            )}
            {!canSubmit && !submitting && <p className={styles.helper}>Lengkapi dulu: {missing.join(', ')}.</p>}

            <div className={styles.actions}>
              <span />
              <div className={styles.buttons}>
                <button type="button" className={styles.cancel} onClick={() => navigate(-1)}>
                  Batal
                </button>
                <button type="submit" className={styles.submit} disabled={!canSubmit}>
                  <img src={iconUpload} alt="" />
                  {submitting ? 'Mengunggah…' : 'Unggah Resource'}
                </button>
              </div>
            </div>
          </section>
        </form>
      </main>

      <Footer />
    </div>
  );
}
