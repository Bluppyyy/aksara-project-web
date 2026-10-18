import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import useAsync from '../../hooks/useAsync';
import { getReport } from '../../services/admin';
import ui from './admin.module.css';
import styles from './AdminReportDetail.module.css';
import { useToast } from './shared.jsx';

const TIMELINE_TONE = { primary: '#00478e', secondary: '#3f5f8e', warn: '#9a4823' };

/** FR-ADM-04: detail laporan beserta konten yang dilaporkan */
export default function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, notify] = useToast();
  const { data: r, loading, error, reload } = useAsync(() => getReport(id), [id]);
  const [memo, setMemo] = useState('');
  const [memos, setMemos] = useState([]);
  const [resolved, setResolved] = useState(false);

  if (loading) return <p className={ui.state}>Memuat detail laporan…</p>;
  if (error)
    return (
      <p className={ui.state}>
        {error.message}{' '}
        <button type="button" className={styles.link} onClick={reload}>
          Coba lagi
        </button>
      </p>
    );

  const saveMemo = (e) => {
    e.preventDefault();
    if (!memo.trim()) {
      notify('Tulis catatan dulu sebelum menyimpan.', 'error');
      return;
    }
    setMemos((m) => [...m, { text: memo.trim(), time: 'Baru saja' }]);
    setMemo('');
    notify('Memo investigasi tersimpan.');
  };

  return (
    <>
      <div className={styles.topRow}>
        <div className={styles.topLeft}>
          <Link to="/admin/laporan" className={`${ui.btn} ${ui.btnWhite} ${styles.back}`}>
            <Icon icon="lucide:arrow-left" size={14} />
            Kembali ke Daftar Laporan
          </Link>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <span>Universitas Telkom</span>/<span>Kelola Laporan</span>/<strong>#{r.id}</strong>
          </nav>
        </div>
        <div className={ui.headActions}>
          <button type="button" className={`${ui.btn} ${ui.btnWhite} ${styles.small}`} onClick={() => window.print()}>
            <Icon icon="lucide:printer" size={14} />
            Cetak Berita Acara
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnWhite} ${styles.small}`} onClick={() => notify('Tautan laporan disalin untuk tim lab.')}>
            <Icon icon="lucide:share-2" size={14} />
            Bagikan ke Tim Lab
          </button>
        </div>
      </div>

      {/* Header laporan */}
      <section className={`${ui.card} ${styles.hero}`}>
        <div className={styles.heroMain}>
          <div className={styles.tags}>
            <span className={styles.idTag}>#{r.id}</span>
            <span className={`${ui.badge} ${ui.badgeRound} ${resolved ? ui.toneOk : ui.toneDanger}`}>
              <span className={ui.dot} />
              {resolved ? 'Selesai (Ditandai)' : 'Baru (Butuh Penanganan Segera)'}
            </span>
            <span className={`${ui.badge} ${ui.tonePrimary}`}>Tingkat Prioritas: {r.priority}</span>
          </div>
          <h1 className={styles.heroTitle}>{r.title}</h1>
          <div className={styles.heroMeta}>
            <span>
              <Icon icon="lucide:clock-3" size={14} />
              Diajukan: <strong>{r.submittedAt}</strong>
            </span>
            <span className={styles.metaDot}>•</span>
            <span>
              <Icon icon="lucide:shapes" size={14} />
              Kategori: <strong>{r.category}</strong>
            </span>
          </div>
          <p className={styles.sla}>
            <Icon icon="lucide:timer" size={14} />
            SLA: <strong>{r.sla}</strong>
          </p>
        </div>
        <aside className={styles.compliance}>
          <span className={styles.complianceIcon}>
            <Icon icon="lucide:shield-check" size={20} />
          </span>
          <div>
            <span className={ui.overline}>Kepatuhan Regulasi</span>
            <strong>SK Rektor No. 042/2023</strong>
            <span>Integritas Repositori Digital</span>
          </div>
        </aside>
      </section>

      <div className={styles.grid}>
        <div className={styles.col}>
          {/* Pelapor */}
          <section className={`${ui.card} ${ui.cardPad}`}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>
                  <Icon icon="lucide:contact-round" size={16} />
                </span>
                Identitas &amp; Profil Pelapor
              </h2>
              <span className={`${ui.badge} ${ui.tonePrimary}`}>
                <Icon icon="lucide:badge-check" size={12} />
                SSO Telkom University Terverifikasi
              </span>
            </div>
            <div className={styles.person}>
              <span className={styles.personAvatar}>{r.reporter.initials}</span>
              <div className={styles.personBody}>
                <div className={styles.personTop}>
                  <strong>{r.reporter.name}</strong>
                  <span className={`${ui.badge} ${ui.tonePrimary}`}>{r.reporter.status}</span>
                </div>
                <p>{r.reporter.detail}</p>
                <p className={styles.personIds}>
                  <span>
                    <Icon icon="lucide:id-card" size={12} />
                    NIM: <strong>{r.reporter.nim}</strong>
                  </span>
                  <span>
                    <Icon icon="lucide:mail" size={12} />
                    {r.reporter.email}
                  </span>
                </p>
              </div>
            </div>
            <div className={styles.roleRow}>
              <p>
                <Icon icon="lucide:shield" size={14} />
                {r.reporter.role}
              </p>
              <button type="button" className={styles.link} onClick={() => notify('Rekam jejak pelapor: 3 laporan valid, 0 laporan palsu.')}>
                Periksa Rekam Jejak Pelapor
              </button>
            </div>
          </section>

          {/* Substansi */}
          <section className={`${ui.card} ${ui.cardPad}`}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>
                  <Icon icon="lucide:circle-alert" size={16} />
                </span>
                Substansi &amp; Alasan Aduan
              </h2>
            </div>
            <p className={styles.label}>Klasifikasi Pelanggaran</p>
            <p className={styles.violation}>
              <Icon icon="lucide:copyright" size={13} />
              {r.classification}
            </p>
            <p className={styles.label}>Uraian &amp; Kesaksian Pelapor</p>
            <blockquote className={styles.quote}>“{r.statement}”</blockquote>
            <p className={styles.label}>Lampiran Bukti Pendukung</p>
            <div className={styles.evidence}>
              <span className={styles.pdfIcon}>
                <Icon icon="lucide:file-text" size={22} />
              </span>
              <div className={styles.evidenceBody}>
                <strong title={r.evidence.name}>{r.evidence.name}</strong>
                <div className={styles.evidenceMeta}>
                  <span>
                    Ukuran: <b>{r.evidence.size}</b>
                  </span>
                  <span>
                    Format: <b>{r.evidence.format}</b>
                  </span>
                  <span className={styles.blue}>Checksum {r.evidence.checksum}</span>
                </div>
              </div>
              <button type="button" className={`${ui.btn} ${ui.btnWhite} ${ui.btnSm}`} onClick={() => notify('Bukti pendukung diunduh.')}>
                Unduh Bukti
              </button>
              <button type="button" className={styles.eye} aria-label="Pratinjau bukti" onClick={() => notify('Pratinjau bukti dibuka.')}>
                <Icon icon="lucide:eye" size={16} />
              </button>
            </div>
          </section>

          {/* Catatan investigasi */}
          <section className={`${ui.card} ${ui.cardPad}`}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>
                  <Icon icon="lucide:notebook-pen" size={16} />
                </span>
                Catatan Investigasi Internal Repositori
              </h2>
              <span className={ui.cardSub}>{r.timeline.length + memos.length} Aktivitas Tercatat</span>
            </div>
            <ol className={styles.timeline}>
              {[...r.timeline, ...memos.map((m) => ({ actor: 'Administrator Repositori (Anda)', time: m.time, text: m.text, tone: 'warn' }))].map((t, i) => (
                <li key={i}>
                  <span className={styles.tlDot} style={{ background: TIMELINE_TONE[t.tone] }} />
                  <p className={styles.tlHead}>
                    <strong>{t.actor}</strong> • <span>{t.time}</span>
                  </p>
                  <p className={`${styles.tlText} ${t.italic ? styles.tlItalic : ''}`}>{t.text}</p>
                </li>
              ))}
            </ol>
            <form className={styles.memo} onSubmit={saveMemo}>
              <label htmlFor="memo" className={styles.memoLabel}>
                Tambahkan Memo Investigasi Internal:
              </label>
              <div className={styles.memoRow}>
                <input
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Tuliskan catatan analisis awal..."
                  maxLength={300}
                />
                <button type="submit" className={`${ui.btn} ${ui.btnSoft}`}>
                  Simpan Memo
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className={styles.col}>
          {/* Konten yang dilaporkan */}
          <section className={`${ui.card} ${ui.cardPad}`}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>
                  <Icon icon="lucide:folder-open" size={16} />
                </span>
                Konten yang Dilaporkan
              </h2>
              <span className={`${ui.badge} ${ui.badgeRound} ${ui.tonePrimary}`}>
                <span className={ui.dot} />
                Aktif di Repositori
              </span>
            </div>
            <p className={styles.label}>Judul Resource:</p>
            <p className={styles.contentTitle}>{r.content.title}</p>
            <dl className={styles.facts}>
              <div>
                <dt>Jenis Konten:</dt>
                <dd>{r.content.type}</dd>
              </div>
              <div>
                <dt>Mata Kuliah:</dt>
                <dd>{r.content.course}</dd>
              </div>
              <div>
                <dt>Program Studi:</dt>
                <dd>{r.content.prodi}</dd>
              </div>
              <div>
                <dt>Format &amp; Halaman:</dt>
                <dd>{r.content.format}</dd>
              </div>
            </dl>
            <div className={styles.contributor}>
              <span className={styles.personAvatarSm}>DA</span>
              <p>
                Kontributor Asli:
                <br />
                <strong>{r.content.contributor}</strong> ({r.content.contributorNim})
              </p>
              <span>{r.content.uploaded}</span>
            </div>
            <p className={styles.label}>Pratinjau Ringkas Dokumen</p>
            <div className={styles.preview}>
              <div className={styles.previewHead}>
                <span>
                  <Icon icon="lucide:book-open" size={14} />
                  Halaman 1 dari 32
                </span>
                <span className={`${ui.badge} ${ui.toneWarn}`}>Tersuspek Lab Copy</span>
              </div>
              <span className={styles.skeleton} style={{ width: '75%' }} />
              <span className={styles.skeleton} />
              <span className={styles.skeleton} style={{ width: '83%' }} />
              <span className={styles.skeleton} style={{ width: '66%' }} />
              <p className={styles.watermark}>
                <Icon icon="lucide:triangle-alert" size={13} />
                Ditemukan watermark: &quot;Laboratorium Jarkom FIF Telkom Univ - Hak Cipta Dilindungi&quot;
              </p>
            </div>
            <Link to={`/resource/${r.content.resourceId}`} className={`${ui.btn} ${ui.btnSoft} ${styles.full}`}>
              <Icon icon="lucide:external-link" size={15} />
              Lihat Konten yang Dilaporkan
            </Link>
          </section>

          {/* Keputusan */}
          <section className={`${ui.card} ${ui.cardPad}`}>
            <div className={styles.decisionHead}>
              <span className={styles.gavel}>
                <Icon icon="lucide:gavel" size={18} />
              </span>
              <div>
                <h2 className={styles.sectionTitle}>Keputusan &amp; Moderasi</h2>
                <p className={ui.cardSub}>Kewenangan Administrator Sesuai FR-ADM-04</p>
              </div>
            </div>
            <p className={styles.decisionText}>
              Lakukan audit penegakan hak kekayaan intelektual. Memindahkan laporan ini ke moderasi konten akan membuka
              alur takedown berkas, sanksi kontributor, atau permintaan izin publikasi resmi.
            </p>
            <button type="button" className={`${ui.btn} ${ui.btnBlue} ${styles.full} ${styles.bigAction}`} onClick={() => navigate('/admin/moderasi/MOD-2024-107')}>
              <Icon icon="lucide:list-checks" size={18} />
              Tinjau di Moderasi Konten
            </button>
            <div className={styles.twoBtns}>
              <a href={`mailto:${r.reporter.email}`} className={`${ui.btn} ${ui.btnSoft} ${styles.grayBtn}`}>
                <Icon icon="lucide:contact" size={15} />
                Hubungi Pelapor
              </a>
              <button type="button" className={`${ui.btn} ${ui.btnSoft} ${styles.grayBtn}`} onClick={() => notify('Pesan klarifikasi dikirim ke kontributor.')}>
                <Icon icon="lucide:file-user" size={15} />
                Kontak Kontributor
              </button>
            </div>
            <button
              type="button"
              className={styles.dismiss}
              disabled={resolved}
              onClick={() => {
                setResolved(true);
                notify('Laporan ditandai selesai (laporan palsu / diabaikan).');
              }}
            >
              <Icon icon="lucide:ban" size={15} />
              Tandai Selesai (Laporan Palsu / Diabaikan)
            </button>
            <p className={styles.audit}>
              <Icon icon="lucide:lock-keyhole" size={15} />
              Seluruh tindakan keputusan tercatat secara permanen di Audit Log Telkom University untuk kepatuhan
              akreditasi BAN-PT &amp; perpustakaan digital.
            </p>
          </section>
        </div>
      </div>
      {toast}
    </>
  );
}
