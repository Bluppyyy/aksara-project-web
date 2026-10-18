import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import useAsync from '../../hooks/useAsync';
import { getModeration, moderate } from '../../services/admin';
import ui from './admin.module.css';
import styles from './AdminModerationDetail.module.css';
import { STATUS_META, useToast } from './shared.jsx';

const MAX_NOTE = 500;

/** FR-ADM-05: detail konten + panel keputusan moderasi */
export default function AdminModerationDetail() {
  const { id } = useParams();
  const [toast, notify] = useToast();
  const { data: m, loading, error, reload, setData } = useAsync(() => getModeration(id), [id]);
  const [checks, setChecks] = useState([true, true, true]);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [zoom, setZoom] = useState(100);

  if (loading) return <p className={ui.state}>Memuat konten…</p>;
  if (error)
    return (
      <p className={ui.state}>
        {error.message}{' '}
        <button type="button" className={styles.link} onClick={reload}>
          Coba lagi
        </button>
      </p>
    );

  const status = STATUS_META[m.status] || STATUS_META.pending;

  const act = async (next, label) => {
    // NFR-USE-01: alasan wajib diisi saat menolak
    if (next === 'rejected' && note.trim().length < 10) {
      setNoteError('Tuliskan alasan penolakan minimal 10 karakter supaya kontributor tahu yang perlu diperbaiki.');
      return;
    }
    if (next === 'approved' && !checks.every(Boolean)) {
      notify('Centang semua daftar uji kepatuhan sebelum menyetujui.', 'error');
      return;
    }
    setNoteError('');
    setBusy(true);
    try {
      await moderate(m.id, next);
      setData((d) => ({ ...d, status: next }));
      setLog((l) => [
        ...l,
        { title: label, meta: `Baru saja • Administrator Repositori${note.trim() ? ` • Catatan: ${note.trim()}` : ''}` },
      ]);
      notify(`Konten ${label.toLowerCase()}.`);
    } catch (err) {
      // NFR-REL-02: jangan menyatakan berhasil kalau gagal
      notify(err.message || 'Tindakan gagal disimpan. Coba lagi.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className={styles.topRow}>
        <Link to="/admin/moderasi" className={styles.back}>
          <Icon icon="lucide:arrow-left" size={14} />
          Kembali ke Moderasi Konten
        </Link>
        <span className={styles.queue}>
          <span className={styles.dot} />
          Sistem Antrean Prioritas Repositori Pascasarjana &amp; Riset
        </span>
      </div>

      <section className={`${ui.card} ${styles.hero}`}>
        <div className={styles.heroMain}>
          <div className={styles.heroMeta}>
            <span className={`${ui.badge} ${status.tone} ${styles.statusTag}`}>
              <Icon icon="lucide:hourglass" size={12} />
              {status.label}
            </span>
            <span>• Antrean #{m.id}</span>
            <span>• Diajukan: {m.submittedAt}</span>
          </div>
          <h1 className={styles.title}>{m.title}</h1>
          <p className={styles.path}>
            <span className={styles.pathType}>
              <Icon icon="lucide:folder-open" size={14} />
              {m.type}
            </span>
            <span>/</span>
            {m.category}
            <span>/</span>
            {m.faculty}
          </p>
        </div>
        <div className={styles.turnitin}>
          <div>
            <span>Skor Kesamaan Turnitin</span>
            <strong>
              {m.similarity} <Icon icon="lucide:badge-check" size={16} />
            </strong>
            <span>Ambang Aman (&lt;20%)</span>
          </div>
          <span className={styles.scan}>
            <Icon icon="lucide:scan-text" size={24} />
          </span>
        </div>
      </section>

      <div className={styles.grid}>
        <div className={styles.col}>
          <section className={`${ui.card} ${styles.author}`}>
            <span className={styles.avatar}>{m.author.initials}</span>
            <div className={styles.authorBody}>
              <p>
                <strong>{m.author.name}</strong>
                <span className={`${ui.badge} ${ui.tonePrimary}`}>Mahasiswa Terverifikasi</span>
              </p>
              <span>{m.author.detail}</span>
              <span>Email SSO: {m.author.email}</span>
            </div>
            <div className={styles.advisor}>
              <span className={ui.overline}>Pembimbing Proyek</span>
              <strong>{m.author.advisor}</strong>
              <span>{m.author.advisorGroup}</span>
            </div>
          </section>

          <section className={`${ui.card} ${styles.block}`}>
            <div className={styles.blockHead}>
              <h2 className={ui.cardTitle}>
                <Icon icon="lucide:book-open-text" size={18} color="#00478e" />
                Abstrak &amp; Ruang Lingkup Riset
              </h2>
              <span className={`${ui.badge} ${ui.toneNeutral}`}>Lisensi: {m.license}</span>
            </div>
            <div className={styles.blockBody}>
              <p className={styles.abstract}>{m.abstract}</p>
              <div className={styles.keywords}>
                <span>Kata Kunci:</span>
                {m.keywords.map((k) => (
                  <span key={k} className={`${ui.badge} ${ui.tonePrimary}`}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className={`${ui.card} ${ui.cardPad}`}>
            <div className={styles.filesHead}>
              <h2 className={ui.cardTitle}>Berkas Lampiran &amp; Sumber Daya</h2>
              <span className={ui.cardSub}>{m.files.length} Item Terlampir</span>
            </div>
            <div className={styles.files}>
              {m.files.map((f) => (
                <div key={f.name} className={styles.file}>
                  <div className={styles.fileTop}>
                    <span className={`${styles.fileIcon} ${f.tone === 'blue' ? styles.fileBlue : ''}`}>
                      <Icon icon={f.icon} size={18} />
                    </span>
                    <div>
                      <strong title={f.name}>{f.name}</strong>
                      <span>{f.meta}</span>
                    </div>
                  </div>
                  <button type="button" className={styles.fileBtn} onClick={() => notify(`${f.action}: ${f.name}`)}>
                    <Icon icon={f.actionIcon} size={13} />
                    {f.action}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className={`${ui.card} ${ui.cardPad}`}>
            <div className={styles.previewHead}>
              <h2 className={ui.cardTitle}>
                <Icon icon="lucide:file-search" size={18} color="#00478e" />
                Pratinjau Lembar Dokumen &amp; Evaluasi Model
              </h2>
              <div className={styles.zoom}>
                <button type="button" aria-label="Perkecil" onClick={() => setZoom((z) => Math.max(50, z - 10))}>
                  <Icon icon="lucide:zoom-out" size={15} />
                </button>
                <span>{zoom}%</span>
                <button type="button" aria-label="Perbesar" onClick={() => setZoom((z) => Math.min(150, z + 10))}>
                  <Icon icon="lucide:zoom-in" size={15} />
                </button>
                <span className={styles.pageInfo}>Halaman 1 dari 48</span>
              </div>
            </div>
            <div className={styles.paperWrap}>
              <article className={styles.paper} style={{ fontSize: `${zoom}%` }}>
                <div className={styles.paperTop}>
                  <div>
                    <strong>TELKOM UNIVERSITY • FAKULTAS INFORMATIKA</strong>
                    <span>Laboratorium Sistem Tertanam &amp; Visi Komputer</span>
                  </div>
                  <span className={`${ui.badge} ${ui.tonePrimary}`}>DRAFT FINAL</span>
                </div>
                <h3 className={styles.paperTitle}>IMPLEMENTASI ALGORITMA YOLOV8 UNTUK DETEKSI SAMPAH KAMPUS SECARA REAL-TIME</h3>
                <p className={styles.paperAuthor}>Zulfa Fawwaz (1301204010), Pembimbing: Dr. Hendra Kusuma, M.T.</p>
                <figure className={styles.graph}>
                  <figcaption>
                    <span>Hasil Validasi Presisi Model (mAP@0.5 vs Epochs)</span>
                    <strong>mAP50: 91.4%</strong>
                  </figcaption>
                  <svg viewBox="0 0 440 130" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 125 C 60 120, 90 90, 140 70 S 260 45, 330 38 S 410 30, 438 28" fill="none" stroke="#1f5faf" strokeWidth="2.5" />
                    <circle cx="436" cy="28" r="3.5" fill="#1f5faf" />
                    <line x1="436" y1="28" x2="436" y2="130" stroke="#c2c6d3" />
                    <line x1="0" y1="129" x2="440" y2="129" stroke="#c2c6d3" />
                  </svg>
                  <div className={styles.graphAxis}>
                    <span>Epoch 0 (mAP 32.1%)</span>
                    <span>Epoch 50 (mAP 74.8%)</span>
                    <strong>Epoch 100 (Final 91.4%)</strong>
                  </div>
                </figure>
                <p className={styles.summaryLabel}>Ringkasan Eksekutif</p>
                <p className={styles.summary}>
                  Riset ini mengeksplorasi efektivitas varian arsitektur YOLOv8n (nano) hingga YOLOv8s (small) yang
                  dioptimasi untuk edge deployment menggunakan board Raspberry Pi 4 dan Coral USB Accelerator. Objek
                  deteksi terbagi atas 4 kelas utama: Botol PET, Cup Kopi Plastik, Kertas, dan Residu Organik.
                </p>
              </article>
            </div>
          </section>
        </div>

        <div className={styles.col}>
          <section className={`${ui.card} ${styles.panel}`}>
            <div className={styles.panelHead}>
              <h2 className={ui.cardTitle}>
                <Icon icon="lucide:gavel" size={18} color="#00478e" />
                Panel Keputusan Kurator
              </h2>
              <span className={styles.dot} />
            </div>
            <div className={styles.panelBody}>
              <p className={ui.overline}>Daftar Uji Kepatuhan Repositori (SRS FR-ADM-05)</p>
              <ul className={styles.checks}>
                {m.checklist.map((c, i) => (
                  <li key={c.label}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checks[i]}
                        onChange={() => setChecks((arr) => arr.map((v, j) => (j === i ? !v : v)))}
                      />
                      <span>
                        <strong>{c.label}</strong>
                        {c.note}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className={styles.noteHead}>
                <label htmlFor="note">Catatan Kurasi / Alasan Moderasi</label>
                <span>
                  {note.length} / {MAX_NOTE}
                </span>
              </div>
              <textarea
                id="note"
                className={`${ui.textarea} ${noteError ? styles.invalid : ''}`}
                maxLength={MAX_NOTE}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  if (noteError) setNoteError('');
                }}
                placeholder="Tuliskan catatan apresiasi kurator atau cantumkan alasan perbaikan secara komprehensif bila pengajuan ditolak..."
                aria-invalid={!!noteError || undefined}
              />
              {noteError ? (
                <p className={styles.error} role="alert">
                  {noteError}
                </p>
              ) : (
                <p className={styles.hint}>*Catatan akan dikirimkan otomatis ke notifikasi &amp; email civitas terkait.</p>
              )}

              <button type="button" className={`${styles.decision} ${styles.approve}`} disabled={busy || m.status === 'approved'} onClick={() => act('approved', 'Disetujui & Dipublikasikan')}>
                <Icon icon="lucide:circle-check" size={20} />
                <span>Setujui &amp; Publikasikan Konten</span>
              </button>
              <button type="button" className={`${styles.decision} ${styles.reject}`} disabled={busy || m.status === 'rejected'} onClick={() => act('rejected', 'Ditolak (Minta Revisi)')}>
                <Icon icon="lucide:circle-x" size={20} />
                <span>Tolak Pengajuan (Minta Revisi)</span>
              </button>
              <button type="button" className={styles.hide} disabled={busy || m.status === 'hidden'} onClick={() => act('hidden', 'Disembunyikan dari Publik')}>
                <Icon icon="lucide:eye-off" size={18} />
                Sembunyikan dari Publik
              </button>
              <p className={styles.info}>
                <Icon icon="lucide:info" size={16} />
                Aksi persetujuan langsung mengindeks konten ke repositori publik AKSARA dan membuka akses sitasi bagi
                komunitas civitas akademika Tel-U.
              </p>
            </div>
          </section>

          <section className={`${ui.card} ${ui.cardPad}`}>
            <div className={styles.filesHead}>
              <h2 className={ui.cardTitle}>Riwayat Aktivitas &amp; Log Audit</h2>
              <Icon icon="lucide:history" size={16} color="#424751" />
            </div>
            <ol className={styles.log}>
              {[...m.log, ...log].map((l, i) => (
                <li key={i}>
                  <strong>{l.title}</strong>
                  <span>{l.meta}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
      {toast}
    </>
  );
}
