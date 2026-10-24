import { useState } from 'react';
import { Link } from 'react-router-dom';
import useBookmark from '../../hooks/useBookmark';
import { useAuth } from '../../context/useAuth';
import { reportResource, getResourceFileUrl } from '../../services/resources';
import { USE_API } from '../../services/api';
import { externalLinkLabel } from '../../services/adapters';
import styles from './ResourceHeader.module.css';
import iconPdf from '../../assets/detail/icon-pdf.svg';
import iconVerified from '../../assets/detail/icon-verified.svg';
import iconLock from '../../assets/detail/icon-lock.svg';
import iconVerifiedBlue from '../../assets/detail/icon-verified-blue.svg';
import iconCalendar from '../../assets/detail/icon-calendar.svg';
import iconCloudDownload from '../../assets/detail/icon-cloud-download.svg';
import iconStar from '../../assets/detail/icon-star.svg';
import iconDownload from '../../assets/detail/icon-download.svg';
import iconCode from '../../assets/detail/icon-code.svg';
import iconExternal from '../../assets/detail/icon-external.svg';
import iconBookmark from '../../assets/detail/icon-bookmark.svg';
import iconFlag from '../../assets/detail/icon-flag.svg';

export default function ResourceHeader({ resource }) {
  const { id, title, fileInfo, author, date, downloads, rating, reviewCount, linkFile, externalUrl } = resource;
  // Resource contoh (katalog lokal) di mode API: tidak ada di database → unduh, simpan, dan lapor dinonaktifkan
  const readOnly = Boolean(resource.readOnly);
  const [saved, toggleSaved] = useBookmark(id, resource.bookmarked);
  const user = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reportState, setReportState] = useState('idle'); // idle | sending | sent | error
  const [downloadState, setDownloadState] = useState('idle'); // idle | loading | error

  // Mode API: tautan file bersifat sementara (signed URL 60 detik), jadi diminta saat tombol diklik
  const download = async (e) => {
    if (!USE_API) return;
    e.preventDefault();
    setDownloadState('loading');
    // Tab dibuka langsung saat klik supaya tidak diblokir popup blocker, lalu diisi tautannya
    const tab = window.open('about:blank', '_blank');
    try {
      const url = await getResourceFileUrl(id);
      if (!url) throw new Error('File tidak tersedia');
      if (tab) tab.location.href = url;
      else window.location.href = url;
      setDownloadState('idle');
    } catch {
      tab?.close();
      setDownloadState('error');
    }
  };

  const sendReport = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setReportState('sending');
    try {
      await reportResource(id, reason.trim());
      setReportState('sent');
      setReason('');
    } catch {
      setReportState('error');
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.badges}>
          <span className={styles.badgeFile}>
            <img src={iconPdf} alt="" style={{ width: 11.667, height: 11.667 }} />
            {fileInfo}
          </span>
          {/* "Terverifikasi" = sudah disetujui admin; resource contoh belum pernah dimoderasi */}
          {!readOnly && (
            <span className={styles.badgeVerified}>
              <img src={iconVerified} alt="" style={{ width: 13.75, height: 13.125 }} />
              Terverifikasi
            </span>
          )}
          <span className={styles.badgeOpen}>
            <img src={iconLock} alt="" style={{ width: 9.333, height: 12.25 }} />
            Open Access
          </span>
        </div>

        <h1 className={styles.title}>{title}</h1>

        <div className={styles.strip}>
          <div className={styles.author}>
            <span className={styles.avatar}>{author.initials}</span>
            <div>
              <p className={styles.authorName}>
                {author.name}
                <img src={iconVerifiedBlue} alt="Kontributor terverifikasi" />
              </p>
              <p className={styles.authorMeta}>{author.meta}</p>
            </div>
          </div>

          <div className={styles.metrics}>
            <span className={styles.metric}>
              <img src={iconCalendar} alt="" style={{ width: 13.5, height: 15 }} />
              {date}
            </span>
            <span className={styles.sep}>•</span>
            <span className={styles.metric}>
              <img src={iconCloudDownload} alt="" style={{ width: 16.5, height: 11.925 }} />
              <strong>{downloads}</strong> unduhan
            </span>
            <span className={styles.sep}>•</span>
            <span className={styles.metric}>
              <img src={iconStar} alt="" style={{ width: 15, height: 14.25 }} />
              <strong>{rating}</strong>
              <span className={styles.muted}>({reviewCount} ulasan)</span>
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.actionGroup}>
            <a
              href={linkFile || '#'}
              target="_blank"
              rel="noreferrer"
              download
              onClick={readOnly ? (e) => e.preventDefault() : download}
              aria-busy={downloadState === 'loading'}
              aria-disabled={readOnly || undefined}
              className={`${styles.primary} ${readOnly ? styles.disabled : ''}`}
            >
              <img src={iconDownload} alt="" style={{ width: 12, height: 12 }} />
              {downloadState === 'loading'
                ? 'Menyiapkan file…'
                : downloadState === 'error'
                  ? 'Gagal, coba lagi'
                  : 'Unduh Dokumen'}
            </a>
            {/* Tampil kalau pengunggah mengisi tautan GitHub / Drive / dataset (kolom "sumber" di backend) */}
            {(!USE_API || externalUrl) && (
              <a
                href={externalUrl || '#'}
                className={styles.secondary}
                target="_blank"
                rel="noopener noreferrer"
                title={externalUrl || undefined}
              >
                <img src={iconCode} alt="" style={{ width: 15, height: 9 }} />
                {externalUrl ? externalLinkLabel(externalUrl) : 'Source Code GitHub / Dataset'}
                <img src={iconExternal} alt="" style={{ width: 10.5, height: 10.5 }} />
              </a>
            )}
            <button
              type="button"
              className={`${styles.save} ${saved ? styles.saveActive : ''}`}
              aria-pressed={saved}
              onClick={toggleSaved}
              disabled={readOnly}
            >
              <img src={iconBookmark} alt="" style={{ width: 10.5, height: 13.5 }} />
              {saved ? 'Tersimpan di Koleksi' : 'Simpan ke Koleksi'}
            </button>
          </div>
          <button
            type="button"
            className={styles.report}
            aria-expanded={reportOpen}
            disabled={readOnly}
            onClick={() => {
              setReportOpen((o) => !o);
              setReportState('idle');
            }}
          >
            <img src={iconFlag} alt="" style={{ width: 10, height: 11.333 }} />
            Laporkan Konten
          </button>
        </div>

        {readOnly && (
          <p className={styles.sampleNote} role="note">
            Ini resource contoh dari katalog AKSARA, belum tersimpan di database. Unduh, simpan ke koleksi, lapor, dan
            ulasan tersedia untuk resource yang diunggah mahasiswa.
          </p>
        )}

        {reportOpen && (
          <div className={styles.reportBox}>
            {!user ? (
              <p>
                <Link to="/login">Masuk</Link> dulu untuk melaporkan konten.
              </p>
            ) : reportState === 'sent' ? (
              <p className={styles.reportOk}>Terima kasih, laporanmu sudah dikirim ke admin.</p>
            ) : (
              <form onSubmit={sendReport}>
                <label htmlFor="report-reason">Kenapa konten ini perlu ditinjau?</label>
                <textarea
                  id="report-reason"
                  rows={3}
                  placeholder="Contoh: berisi kunci jawaban ujian, plagiat, atau data rahasia instansi."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                {reportState === 'error' && <p className={styles.reportErr}>Gagal mengirim laporan. Coba lagi.</p>}
                <div className={styles.reportActions}>
                  <button type="button" onClick={() => setReportOpen(false)}>
                    Batal
                  </button>
                  <button type="submit" disabled={!reason.trim() || reportState === 'sending'}>
                    {reportState === 'sending' ? 'Mengirim…' : 'Kirim Laporan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
