import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon/Icon.jsx';
import { uploadResource } from '../services/resources';
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
import iconCloudCheck from '../assets/upload/icon-cloud-check.svg';
import iconUpload from '../assets/upload/icon-upload.svg';

const ACCEPT = '.pdf,.docx,.pptx,.zip';
const MAX_MB = 50;
const ABSTRACT_MAX = 600;

const OPTIONS = {
  kategori: ['Tugas Kuliah & Makalah', 'Laporan Magang & PKL', 'Skripsi & Tugas Akhir', 'Bank Soal', 'Riset & Publikasi Paper', 'Modul Praktikum'],
  tahun: ['2025/2026 (Tahun Ini)', '2024/2025', '2023/2024', '2022/2023'],
  fakultas: ['Fakultas Informatika (FIF)', 'Fakultas Teknik Elektro (FTE)', 'Fakultas Rekayasa Industri (FRI)'],
  prodi: ['S1 Informatika', 'S1 Rekayasa Perangkat Lunak', 'S1 Teknologi Informasi', 'S1 Data Sains'],
  semester: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8+'],
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

function SelectField({ id, label, placeholder, options, value, onChange }) {
  return (
    <div className={styles.field}>
      <Label htmlFor={id} required>
        {label}
      </Label>
      <div className={styles.selectWrap}>
        <select id={id} className={styles.select} value={value} onChange={(e) => onChange(e.target.value)} required>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <img src={iconChevron} alt="" className={styles.selectIcon} />
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
    tahun: OPTIONS.tahun[0],
    fakultas: '',
    prodi: '',
    semester: '',
    matkul: '',
    tags: ['#DataStructure', '#Algorithms', '#TelU2025'],
    agree: false,
  });
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);

  const pickFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'pptx', 'zip'].includes(ext)) return setFileError('Format file tidak didukung.');
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
      await uploadResource(form, file);
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

        <form className={styles.card} onSubmit={handleSubmit} noValidate={false}>
          <header className={styles.cardHeader}>
            <h1 className={styles.title}>Unggah Resource Akademik</h1>
            <p className={styles.subtitle}>
              Bagikan tugas, laporan, atau modul praktikum untuk membantu mahasiswa lain dan memperkaya
              khazanah ilmiah kampus.
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
                    Mendukung format <strong>PDF, DOCX, PPTX, dan ZIP</strong> (Maksimal 50MB per file)
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
              <SelectField id="kategori" label="Kategori" placeholder="Pilih Kategori" options={OPTIONS.kategori} value={form.kategori} onChange={set('kategori')} />
              <SelectField id="tahun" label="Tahun Akademik" options={OPTIONS.tahun} value={form.tahun} onChange={set('tahun')} />
            </div>
            <div className={styles.row}>
              <SelectField id="fakultas" label="Fakultas" placeholder="Pilih Fakultas" options={OPTIONS.fakultas} value={form.fakultas} onChange={set('fakultas')} />
              <SelectField id="prodi" label="Program Studi" placeholder="Pilih Program Studi" options={OPTIONS.prodi} value={form.prodi} onChange={set('prodi')} />
            </div>
            <div className={styles.row}>
              <SelectField id="semester" label="Semester" placeholder="Pilih Semester" options={OPTIONS.semester} value={form.semester} onChange={set('semester')} />
              <SelectField id="matkul" label="Mata Kuliah" placeholder="Pilih Mata Kuliah" options={OPTIONS.matkul} value={form.matkul} onChange={set('matkul')} />
            </div>

            <div className={styles.tagsField}>
              <label htmlFor="tag-input" className={styles.smallLabel}>
                Kata Kunci / Tag Riset (Tekan Enter untuk menambah)
              </label>
              <div className={styles.tagsBox}>
                {form.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                    <button type="button" aria-label={`Hapus ${t}`} onClick={() => set('tags')(form.tags.filter((x) => x !== t))}>
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
                <span className={styles.noticeBrand}>AKSARA Telkom University</span> menjunjung tinggi etika
                kejujuran akademik. Kontributor dilarang keras mengunggah kunci jawaban resmi ujian tanpa izin
                dosen, data rahasia instansi mitra kerja praktik, atau dokumen yang memicu pelanggaran hak
                kekayaan intelektual (HAKI).
              </p>
            </div>

            <label className={styles.agree}>
              <input type="checkbox" checked={form.agree} onChange={(e) => set('agree')(e.target.checked)} required />
              <span className={styles.agreeBox} aria-hidden="true" />
              <span>
                <strong>Komitmen Integritas &amp; Orisinalitas:</strong> Saya menyatakan bahwa dokumen ini
                adalah karya orisinal saya atau saya memiliki hak legal untuk membagikannya, dan tidak
                melanggar etika akademik Telkom University (bebas plagiarisme &amp; diverifikasi Turnitin).
              </span>
            </label>

            {submitError && (
              <p className={styles.submitError} role="alert">
                {submitError}
              </p>
            )}
            {!canSubmit && !submitting && (
              <p className={styles.helper}>Lengkapi dulu: {missing.join(', ')}.</p>
            )}

            <div className={styles.actions}>
              <p className={styles.autosave}>
                <img src={iconCloudCheck} alt="" />
                Draft tersimpan otomatis 2 menit lalu
              </p>
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
