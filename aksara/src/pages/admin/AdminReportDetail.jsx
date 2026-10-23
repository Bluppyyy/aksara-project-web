import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import useAsync from '../../hooks/useAsync';
import { getReport, updateReportStatus } from '../../services/admin';
import { USE_API } from '../../services/api';
import ui from './admin.module.css';
import styles from './AdminReportDetail.module.css';
import { Breadcrumbs } from './shared.jsx';
import { useToast } from './useToast.jsx';

const TIMELINE_TONE = { primary: '#00478e', secondary: '#3f5f8e', warn: '#9a4823' };

/** FR-ADM-04: detail laporan beserta konten yang dilaporkan */
export default function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, notify] = useToast();
  const { data: r, loading, error, reload } = useAsync(() => getReport(id), [id]);
  const [memo, setMemo] = useState('');
  const [memos, setMemos] = useState([]);
  const [statusOverride, setStatusOverride] = useState(null);
  const [saving, setSaving] = useState(false);

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

  // Status laporan dari backend: baru → ditinjau → selesai (PUT /admin/report/:id/status)
  const status = statusOverride || r.status || 'baru';
  const resolved = status === 'selesai';
  const STATUS_TEXT = {
    baru: 'Baru (Butuh Penanganan Segera)',
    ditinjau: 'Sedang Ditinjau',
    selesai: 'Selesai (Ditandai)',
  };

  /** Simpan status (+ catatan admin) ke backend; mode demo hanya mengubah tampilan */
  const saveStatus = async (next, catatan, message) => {
    setSaving(true);
    try {
      await updateReportStatus(r.id, next, catatan);
      setStatusOverride(next);
      if (message) notify(message);
      return true;
    } catch (err) {
      notify(err.message || 'Gagal menyimpan status laporan.', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveMemo = async (e) => {
    e.preventDefault();
    if (!memo.trim()) {
      notify('Tulis catatan dulu sebelum menyimpan.', 'error');
      return;
    }
    // Backend menyimpan satu catatan_admin per laporan; menulis memo = laporan sedang ditinjau
    const next = status === 'baru' ? 'ditinjau' : status;
    if (!(await saveStatus(next, memo, 'Memo investigasi tersimpan.'))) return;
    setMemos((m) => [...m, { text: memo.trim(), time: 'Baru saja' }]);
    setMemo('');
  };

  return (
    <>
      <div className={styles.topRow}>
        <Breadcrumbs
          items={[
            { label: 'Admin', to: '/admin' },
            { label: 'Kelola Laporan', to: '/admin/laporan' },
            { label: `#${r.id}` },
          ]}
        />
        <div className={ui.headActions}>
          <button type="button" className={`${ui.btn} ${ui.btnWhite}`} onClick={() => window.print()}>
            <Icon icon="lucide:printer" size={16} />
            Cetak
          </button>
        </div>
      </div>

      {/* Header laporan */}
      <section className={`${ui.card} ${styles.hero}`}>
        <div className={styles.heroMain}>
          <div className={styles.tags}>
            <span className={styles.idTag}>#{r.id}</span>
            <span
              className={`${ui.badge} ${ui.badgeRound} ${resolved ? ui.toneOk : status === 'ditinjau' ? ui.tonePrimary : ui.toneDanger}`}
            >
              <span className={ui.dot} />
              {STATUS_TEXT[status] || status}
            </span>
            {!USE_API && <span className={`${ui.badge} ${ui.tonePrimary}`}>Tingkat Prioritas: {r.priority}</span>}
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
          {!USE_API && (
            <p className={styles.sla}>
              <Icon icon="lucide:timer" size={14} />
              SLA: <strong>{r.sla}</strong>
            </p>
          )}
        </div>
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
                Akun Terverifikasi
              </span>
            </div>
            <div className={styles.person}>
              <span className={styles.personAvatar}>{r.reporter.initials}</span>
              <div className={styles.personBody}>
                <div className={styles.personTop}>
                  <strong>{r.reporter.name}</strong>
                  {!USE_API && <span className={`${ui.badge} ${ui.tonePrimary}`}>{r.reporter.status}</span>}
                </div>
                <p>{r.reporter.detail}</p>
                <p className={styles.personIds}>
                  <span>
                    <Icon icon="lucide:id-card" size={12} />
                    NIM: <strong>{r.reporter.nim}</strong>
                  </span>
                  <span>
                    <Icon icon="lucide:mail" size={12} />
                    {r.reporter.email || '—'}
                  </span>
                </p>
              </div>
            </div>
            {/* Peran & rekam jejak pelapor belum ada di backend → hanya mode demo */}
            {!USE_API && (
              <div className={styles.roleRow}>
                <p>
                  <Icon icon="lucide:shield" size={14} />
                  {r.reporter.role}
                </p>
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => notify('Rekam jejak pelapor: 3 laporan valid, 0 laporan palsu.')}
                >
                  Periksa Rekam Jejak Pelapor
                </button>
              </div>
            )}
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
            {r.evidence && (
              <>
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
                  <button
                    type="button"
                    className={`${ui.btn} ${ui.btnWhite} ${ui.btnSm}`}
                    onClick={() => notify('Bukti pendukung diunduh.')}
                  >
                    Unduh Bukti
                  </button>
                  <button
                    type="button"
                    className={styles.eye}
                    aria-label="Pratinjau bukti"
                    onClick={() => notify('Pratinjau bukti dibuka.')}
                  >
                    <Icon icon="lucide:eye" size={16} />
                  </button>
                </div>
              </>
            )}
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
              {[
                ...r.timeline,
                ...memos.map((m) => ({
                  actor: 'Administrator Repositori (Anda)',
                  time: m.time,
                  text: m.text,
                  tone: 'warn',
                })),
              ].map((t, i) => (
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
                <button type="submit" className={`${ui.btn} ${ui.btnSoft}`} disabled={saving}>
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
            {r.content.excerpt !== undefined ? (
              <>
                <p className={styles.label}>Cuplikan Konten</p>
                <p className={styles.excerpt}>{r.content.excerpt || 'Konten tidak memiliki deskripsi.'}</p>
              </>
            ) : (
              <>
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
              </>
            )}
            <Link
              to={r.content.resourceId ? `/resource/${r.content.resourceId}` : `/wawasan/${r.content.experienceId}`}
              className={`${ui.btn} ${ui.btnSoft} ${styles.full}`}
            >
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
              </div>
            </div>
            <p className={styles.decisionText}>
              Lakukan audit penegakan hak kekayaan intelektual. Memindahkan laporan ini ke moderasi konten akan membuka
              alur takedown berkas, sanksi kontributor, atau permintaan izin publikasi resmi.
            </p>
            <button
              type="button"
              className={`${ui.btn} ${ui.btnBlue} ${styles.full} ${styles.bigAction}`}
              onClick={async () => {
                if (USE_API && status === 'baru') await saveStatus('ditinjau');
                navigate(r.moderationId || '/admin/moderasi/MOD-2024-107');
              }}
            >
              <Icon icon="lucide:list-checks" size={18} />
              Tinjau di Moderasi Konten
            </button>
            {/* Tombol kontak tampil kalau email pelapor tersedia (mode API: perlu email di data pengguna) */}
            {r.reporter.email && (
              <div className={styles.twoBtns}>
                <a href={`mailto:${r.reporter.email}`} className={`${ui.btn} ${ui.btnSoft} ${styles.grayBtn}`}>
                  <Icon icon="lucide:contact" size={15} />
                  Hubungi Pelapor
                </a>
                {USE_API ? (
                  r.content.contributorEmail && (
                    <a
                      href={`mailto:${r.content.contributorEmail}`}
                      className={`${ui.btn} ${ui.btnSoft} ${styles.grayBtn}`}
                    >
                      <Icon icon="lucide:file-user" size={15} />
                      Kontak Kontributor
                    </a>
                  )
                ) : (
                  <button
                    type="button"
                    className={`${ui.btn} ${ui.btnSoft} ${styles.grayBtn}`}
                    onClick={() => notify('Pesan klarifikasi dikirim ke kontributor.')}
                  >
                    <Icon icon="lucide:file-user" size={15} />
                    Kontak Kontributor
                  </button>
                )}
              </div>
            )}
            <button
              type="button"
              className={styles.dismiss}
              disabled={resolved || saving}
              onClick={() => saveStatus('selesai', memo, 'Laporan ditandai selesai.')}
            >
              <Icon icon="lucide:ban" size={15} />
              Tandai Selesai (Laporan Palsu / Diabaikan)
            </button>
          </section>
        </div>
      </div>
      {toast}
    </>
  );
}
