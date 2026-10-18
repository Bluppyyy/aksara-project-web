import { Fragment, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import Icon from '../components/Icon/Icon.jsx';
import ReviewsSection from '../components/detail/ReviewsSection.jsx';
import { Loading, ErrorState } from '../components/Status/Status.jsx';
import useAsync from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext.jsx';
import { getArticle, reportArticle } from '../services/wawasan';
import { resourceDetail } from '../data/resourceDetail.jsx';
import styles from './WawasanDetailPage.module.css';

/** Ubah teks sederhana: `kode` → <code>, *miring* → <em> (tanpa dangerouslySetInnerHTML) */
function RichText({ text }) {
  const parts = text.split(/(`[^`]+`|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export default function WawasanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuth();
  const { data: a, loading, error, reload } = useAsync(() => getArticle(id), [id]);
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reportState, setReportState] = useState('idle');
  const [notice, setNotice] = useState('');

  const requireLogin = () => {
    if (user) return true;
    navigate('/login', { state: { from: `/wawasan/${id}` } });
    return false;
  };

  const toggleSave = () => {
    if (!requireLogin()) return;
    setSaved((s) => !s);
    setNotice(saved ? 'Tulisan dihapus dari koleksi.' : 'Tulisan disimpan ke Koleksi Saya.');
  };

  const sendReport = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 5) return;
    setReportState('sending');
    try {
      await reportArticle(a.id, reason.trim());
      setReportState('sent');
      setReason('');
    } catch {
      setReportState('error');
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <nav aria-label="Breadcrumb">
          <Link to="/wawasan" className={styles.back}>
            <Icon icon="lucide:chevron-left" size={12} />
            Kembali
          </Link>
        </nav>

        {loading ? (
          <Loading label="Memuat tulisan…" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : (
          <>
            <section className={styles.hero}>
              <div className={styles.glow} aria-hidden="true" />
              <div className={styles.badges}>
                <span className={styles.badgeDark}>
                  <Icon icon="lucide:clock-3" size={12} />
                  {a.readTime}
                </span>
                <span className={styles.badgeLight}>
                  <Icon icon="lucide:badge-check" size={13} />
                  Terverifikasi
                </span>
              </div>
              <h1 className={styles.title}>{a.title}</h1>
              <p className={styles.subtitle}>{a.subtitle}</p>
              <div className={styles.heroFoot}>
                <div className={styles.metrics}>
                  <span>
                    <Icon icon="lucide:calendar" size={13} />
                    {a.date}
                  </span>
                  <span className={styles.sep}>•</span>
                  <span>
                    <Icon icon="lucide:eye" size={14} />
                    <strong>{a.reads}</strong> Baca
                  </span>
                  <span className={styles.sep}>•</span>
                  <span>
                    <Icon icon="lucide:star" size={13} fill="#e88d67" color="#e88d67" />
                    <strong>{a.rating}</strong>
                    <em>({a.reviewCount} ulasan)</em>
                  </span>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={`${styles.save} ${saved ? styles.saveOn : ''}`} onClick={toggleSave} aria-pressed={saved}>
                    <Icon icon="lucide:bookmark" size={14} fill={saved ? 'currentColor' : undefined} />
                    {saved ? 'Tersimpan di Koleksi' : 'Simpan ke Koleksi'}
                  </button>
                  <button type="button" className={styles.report} onClick={() => requireLogin() && setReportOpen((o) => !o)} aria-expanded={reportOpen}>
                    <Icon icon="lucide:flag" size={12} />
                    Laporkan Konten
                  </button>
                </div>
              </div>
              {notice && (
                <p className={styles.notice} role="status">
                  <Icon icon="lucide:circle-check" size={14} />
                  {notice}
                </p>
              )}
              {reportOpen && (
                <form className={styles.reportForm} onSubmit={sendReport}>
                  {reportState === 'sent' ? (
                    <p className={styles.sent} role="status">
                      <Icon icon="lucide:circle-check" size={16} />
                      Laporan berhasil dikirim. Tim admin akan meninjaunya.
                    </p>
                  ) : (
                    <>
                      <label htmlFor="alasan">Alasan laporan</label>
                      <textarea
                        id="alasan"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Contoh: berisi informasi rahasia perusahaan / tautan rusak / plagiarisme…"
                        maxLength={300}
                      />
                      {reason && reason.trim().length < 5 && <p className={styles.err}>Alasan minimal 5 karakter.</p>}
                      {reportState === 'error' && <p className={styles.err}>Laporan gagal dikirim. Coba lagi.</p>}
                      <div className={styles.reportBtns}>
                        <button type="button" onClick={() => setReportOpen(false)}>
                          Batal
                        </button>
                        <button type="submit" disabled={reportState === 'sending' || reason.trim().length < 5}>
                          {reportState === 'sending' ? 'Mengirim…' : 'Kirim Laporan'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </section>

            <div className={styles.layout}>
              <div className={styles.left}>
                <article className={styles.article}>
                  <figure className={styles.figure}>
                    <img src={a.image} alt="Suasana ruang kerja dan kolaborasi mahasiswa magang di Telkomsel Innovation Lab" />
                    <figcaption>{a.caption}</figcaption>
                  </figure>
                  <div className={styles.body}>
                    {a.blocks.map((b, i) => {
                      if (b.type === 'h2') return <h2 key={i}>{b.text}</h2>;
                      if (b.type === 'quote')
                        return (
                          <blockquote key={i}>
                            <RichText text={b.text} />
                          </blockquote>
                        );
                      return (
                        <p key={i} className={b.type === 'lead' ? styles.lead : ''}>
                          <RichText text={b.text} />
                        </p>
                      );
                    })}
                  </div>
                  <div className={styles.keywords}>
                    <span>Kata Kunci:</span>
                    {a.keywords.map((k) => (
                      <Link key={k} to={`/eksplorasi/hasil?q=${encodeURIComponent(k)}`}>
                        {k}
                      </Link>
                    ))}
                  </div>
                </article>

                <ReviewsSection rating={a.rating} count={a.reviewCount} reviews={resourceDetail.reviews} onSubmit={async () => {}} />
              </div>

              <aside className={styles.right}>
                <section className={styles.authorCard}>
                  <h2>
                    <Icon icon="lucide:graduation-cap" size={18} />
                    Tentang Penulis
                  </h2>
                  <div className={styles.author}>
                    <span>{a.author.initials}</span>
                    <div>
                      <strong>
                        {a.author.name}
                        <Icon icon="lucide:badge-check" size={16} color="#1261a2" />
                      </strong>
                      <em>{a.author.meta}</em>
                    </div>
                  </div>
                  <Link to="/wawasan" className={styles.more}>
                    Koleksi Lainnya
                    <Icon icon="lucide:arrow-right" size={14} />
                  </Link>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
