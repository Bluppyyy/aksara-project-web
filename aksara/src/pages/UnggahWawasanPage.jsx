import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon/Icon.jsx';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { createArticle } from '../services/wawasan';
import up from './UploadPage.module.css';
import styles from './UnggahWawasanPage.module.css';
import iconShield from '../assets/upload/icon-shield.svg';
import iconCloudCheck from '../assets/upload/icon-cloud-check.svg';
import iconTagRemove from '../assets/upload/icon-tag-remove.svg';

const CATEGORIES = [
  { label: 'Pengalaman Magang & KP', icon: 'lucide:briefcase-business' },
  { label: 'Tips Beasiswa & Exchange', icon: 'lucide:plane' },
  { label: 'Kehidupan Kampus & Hima', icon: 'lucide:graduation-cap' },
  { label: 'Karir, Portofolio & Riset', icon: 'lucide:rocket' },
];

/* Toolbar editor: menyisipkan sintaks Markdown sederhana di posisi kursor */
const TOOLS = [
  { label: 'Tebal', icon: 'lucide:bold', wrap: ['**', '**'] },
  { label: 'Miring', icon: 'lucide:italic', wrap: ['*', '*'] },
  { label: 'Garis bawah', icon: 'lucide:underline', wrap: ['<u>', '</u>'] },
  { label: 'Coret', icon: 'lucide:strikethrough', wrap: ['~~', '~~'], sep: true },
  { label: 'Judul 1', text: 'H1', line: '# ' },
  { label: 'Judul 2', text: 'H2', line: '## ' },
  { label: 'Kutipan', text: '99', line: '> ', sep: true },
  { label: 'Daftar poin', icon: 'lucide:list', line: '- ' },
  { label: 'Daftar nomor', icon: 'lucide:list-ordered', line: '1. ', sep: true },
  { label: 'Tautan', icon: 'lucide:link', wrap: ['[', '](https://)'] },
  { label: 'Gambar', icon: 'lucide:image', wrap: ['![keterangan](', ')'] },
  { label: 'Kode', icon: 'lucide:code', wrap: ['`', '`'] },
];

const DRAFT_KEY = 'aksara.draftWawasan';
const IMG_MAX_MB = 10;

export default function UnggahWawasanPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const editorRef = useRef(null);
  const [cover, setCover] = useState(null); // { file, url }
  const [coverError, setCoverError] = useState('');
  const [form, setForm] = useState(() => {
    const empty = { title: '', subtitle: '', category: '', content: '', tags: ['#DataStructure', '#Algorithms', '#TelU2025'], agree: false };
    try {
      return { ...empty, ...(JSON.parse(localStorage.getItem(DRAFT_KEY)) || {}), agree: false };
    } catch {
      return empty;
    }
  });
  const [tagInput, setTagInput] = useState('');
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState('2 menit lalu');

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  // Simpan draft otomatis (per browser) — hanya kenyamanan, bukan penyimpanan utama
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        setSavedAt('baru saja');
      } catch {
        /* abaikan */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [form]);

  useEffect(() => () => cover && URL.revokeObjectURL(cover.url), [cover]);

  const pickCover = (file) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return setCoverError('Format harus PNG, JPG, atau WEBP.');
    if (file.size > IMG_MAX_MB * 1024 * 1024) return setCoverError(`Ukuran maksimal ${IMG_MAX_MB}MB.`);
    setCoverError('');
    setCover({ file, url: URL.createObjectURL(file) });
  };

  const applyTool = (tool) => {
    const el = editorRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    let next;
    let cursor;
    if (tool.wrap) {
      const sel = value.slice(s, e) || tool.label.toLowerCase();
      next = value.slice(0, s) + tool.wrap[0] + sel + tool.wrap[1] + value.slice(e);
      cursor = s + tool.wrap[0].length + sel.length;
    } else {
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      next = value.slice(0, lineStart) + tool.line + value.slice(lineStart);
      cursor = s + tool.line.length;
    }
    set('content')(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
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

  // NFR-USE-01: pesan validasi saat data belum lengkap
  const errors = {
    cover: !cover ? 'Tambahkan foto sampul.' : '',
    title: form.title.trim().length < 10 ? 'Judul minimal 10 karakter.' : '',
    category: !form.category ? 'Pilih salah satu kategori.' : '',
    content: form.content.trim().length < 100 ? `Isi tulisan minimal 100 karakter (sekarang ${form.content.trim().length}).` : '',
    agree: !form.agree ? 'Centang komitmen integritas & orisinalitas.' : '',
  };
  const invalid = Object.values(errors).some(Boolean);
  const show = (k) => touched && errors[k];

  const publish = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (invalid) {
      setError('Lengkapi dulu bagian yang ditandai merah.');
      return;
    }
    setState('sending');
    setError('');
    try {
      await createArticle(form);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* abaikan */
      }
      setState('done');
      window.scrollTo(0, 0);
    } catch (err) {
      setState('error');
      setError(err.message || 'Tulisan gagal dikirim. Coba lagi.');
    }
  };

  if (state === 'done') {
    return (
      <div className={up.page}>
        <Header variant="minimal" />
        <main className={up.main}>
          <div className={`${up.card} ${up.success}`}>
            <Icon icon="lucide:circle-check" size={48} className={up.successIcon} />
            <h1 className={up.title}>Wawasan berhasil dikirim!</h1>
            <p className={up.subtitle}>
              Tulisanmu sedang menunggu moderasi admin dan akan tampil di halaman Wawasan setelah disetujui.
            </p>
            <div className={up.buttons}>
              <Link to="/wawasan" className={up.cancel}>
                Ke Wawasan
              </Link>
              <button type="button" className={up.submit} onClick={() => navigate('/')}>
                Ke Beranda
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={up.page}>
      <Header variant="minimal" />
      <main className={up.main}>
        <div className={`${up.blob} ${up.blobBlue}`} aria-hidden="true" />
        <div className={`${up.blob} ${up.blobOrange}`} aria-hidden="true" />

        <div className={styles.wrap}>
          <button type="button" className={styles.back} onClick={() => navigate(-1)}>
            <Icon icon="lucide:chevron-left" size={12} />
            Kembali
          </button>

          <form className={`${up.card} ${styles.card}`} onSubmit={publish} noValidate>
            <header className={`${up.cardHeader} ${styles.header}`}>
              <h1 className={up.title}>Publikasikan Wawasan Baru</h1>
              <p className={up.subtitle}>
                Tuangkan wawasan seputar dunia kampus, pengembangan diri, dan karier untuk membangun ekosistem belajar yang
                saling mendukung.
              </p>
            </header>

            <section className={styles.section}>
              <span className={up.label}>
                Berkas Utama / Naskah Dokumen<span className={up.required}>*</span>
              </span>
              <div
                className={`${up.dropzone} ${styles.drop} ${show('cover') ? styles.invalid : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pickCover(e.dataTransfer.files?.[0]);
                }}
              >
                {cover ? (
                  <img src={cover.url} alt="Pratinjau foto sampul" className={styles.preview} />
                ) : (
                  <span className={styles.imgIcon}>
                    <Icon icon="lucide:image-plus" size={22} />
                  </span>
                )}
                <h3 className={up.dropTitle}>{cover ? cover.file.name : 'Tambahkan Foto Sampul'}</h3>
                <p className={up.dropHint}>
                  Rekomendasi rasio 21:9 atau resolusi minimal 1200 x 514 px
                  <br />
                  Mendukung format <strong>PNG, JPG, WEBP</strong> (Maks 10MB)
                </p>
                {(coverError || show('cover')) && <p className={up.error}>{coverError || errors.cover}</p>}
                <button type="button" className={up.pickButton} onClick={() => fileRef.current?.click()}>
                  <Icon icon="lucide:file-image" size={15} />
                  {cover ? 'Ganti Foto' : 'Pilih File dari Komputer'}
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="visually-hidden" onChange={(e) => pickCover(e.target.files?.[0])} />
              </div>
            </section>

            <section className={styles.section}>
              <label htmlFor="judul" className="visually-hidden">
                Judul wawasan
              </label>
              <textarea
                id="judul"
                rows={2}
                className={`${styles.bigTitle} ${show('title') ? styles.textInvalid : ''}`}
                placeholder="Ketik Judul Wawasan atau Topik yang Kamu Mau disini…"
                value={form.title}
                maxLength={150}
                onChange={(e) => set('title')(e.target.value)}
              />
              {show('title') && <p className={up.error}>{errors.title}</p>}
              <label htmlFor="subjudul" className="visually-hidden">
                Sub-judul
              </label>
              <input
                id="subjudul"
                className={styles.subTitle}
                placeholder="Ketik Sub-Judul Wawasan disini..."
                value={form.subtitle}
                maxLength={200}
                onChange={(e) => set('subtitle')(e.target.value)}
              />
            </section>

            <section className={styles.section}>
              <h2 className={styles.catTitle}>
                <Icon icon="lucide:list-filter" size={18} />
                Pilih Kategori<span className={up.required}>*</span>
              </h2>
              <div className={styles.cats} role="radiogroup" aria-label="Kategori">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    role="radio"
                    aria-checked={form.category === c.label}
                    className={`${styles.cat} ${form.category === c.label ? styles.catOn : ''}`}
                    onClick={() => set('category')(c.label)}
                  >
                    <Icon icon={c.icon} size={15} />
                    {c.label}
                  </button>
                ))}
              </div>
              {show('category') && <p className={up.error}>{errors.category}</p>}
            </section>

            <section className={styles.editorSection}>
              <div className={styles.toolbar} role="toolbar" aria-label="Format teks">
                {TOOLS.map((t) => (
                  <span key={t.label} className={t.sep ? styles.sepAfter : ''}>
                    <button type="button" title={t.label} aria-label={t.label} onClick={() => applyTool(t)}>
                      {t.icon ? <Icon icon={t.icon} size={15} /> : <strong>{t.text}</strong>}
                    </button>
                  </span>
                ))}
              </div>
              <label htmlFor="isi" className="visually-hidden">
                Isi wawasan
              </label>
              <textarea
                id="isi"
                ref={editorRef}
                className={`${styles.editor} ${show('content') ? styles.invalid : ''}`}
                placeholder="Ceritakan Wawasanmu Disini..."
                value={form.content}
                onChange={(e) => set('content')(e.target.value)}
              />
              {show('content') && <p className={up.error}>{errors.content}</p>}
            </section>

            <section className={styles.section}>
              <label htmlFor="tag-w" className={up.smallLabel}>
                Kata Kunci / Tag Riset (Tekan Enter untuk menambah)
              </label>
              <div className={up.tagsBox}>
                {form.tags.map((t) => (
                  <span key={t} className={up.tag}>
                    {t}
                    <button type="button" aria-label={`Hapus ${t}`} onClick={() => set('tags')(form.tags.filter((x) => x !== t))}>
                      <img src={iconTagRemove} alt="" />
                    </button>
                  </span>
                ))}
                <input id="tag-w" className={up.tagInput} placeholder="+ Tambah kata kunci..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} />
              </div>
            </section>

            <section className={`${up.section3} ${styles.last}`}>
              <div className={up.notice}>
                <img src={iconShield} alt="" className={up.noticeIcon} />
                <p>
                  <span className={up.noticeBrand}>AKSARA Telkom University</span> menjunjung tinggi etika kejujuran
                  akademik. Kontributor dilarang keras mengunggah kunci jawaban resmi ujian tanpa izin dosen, data rahasia
                  instansi mitra kerja praktik, atau dokumen yang memicu pelanggaran hak kekayaan intelektual (HAKI).
                </p>
              </div>
              <label className={up.agree}>
                <input type="checkbox" checked={form.agree} onChange={(e) => set('agree')(e.target.checked)} />
                <span className={up.agreeBox} aria-hidden="true" />
                <span>
                  <strong>Komitmen Integritas &amp; Orisinalitas:</strong> Saya menyatakan bahwa tulisan ini adalah karya
                  orisinal saya atau saya memiliki hak legal untuk membagikannya, dan tidak melanggar etika akademik Telkom
                  University (bebas plagiarisme &amp; diverifikasi Turnitin).
                </span>
              </label>
              {show('agree') && <p className={up.error}>{errors.agree}</p>}
              {error && (
                <p className={up.submitError} role="alert">
                  {error}
                </p>
              )}
              <div className={up.actions}>
                <p className={up.autosave}>
                  <img src={iconCloudCheck} alt="" />
                  Draft tersimpan otomatis {savedAt}
                </p>
                <div className={up.buttons}>
                  <button
                    type="button"
                    className={up.cancel}
                    onClick={() => {
                      try {
                        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
                      } catch {
                        /* abaikan */
                      }
                      setSavedAt('baru saja');
                    }}
                  >
                    Simpan Draft
                  </button>
                  <button type="submit" className={up.submit} disabled={state === 'sending'}>
                    <Icon icon="lucide:upload" size={15} />
                    {state === 'sending' ? 'Mengirim…' : 'Publikasikan'}
                  </button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
