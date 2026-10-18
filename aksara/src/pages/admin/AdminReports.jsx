import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import useAsync from '../../hooks/useAsync';
import { listReports } from '../../services/admin';
import { reportStats } from '../../data/admin';
import ui from './admin.module.css';
import styles from './AdminReports.module.css';
import { useToast, AdminPager } from './shared.jsx';

const STATUS = {
  baru: { label: 'Baru', tone: ui.toneDanger },
  ditinjau: { label: 'Ditinjau', tone: ui.toneWarn },
  selesai: { label: 'Selesai', tone: ui.toneOk },
};

const STATUS_FILTER = [
  { value: 'all', label: 'Semua Status (18)' },
  { value: 'baru', label: 'Baru' },
  { value: 'ditinjau', label: 'Dalam Peninjauan' },
  { value: 'selesai', label: 'Selesai' },
];

const TYPE_FILTER = [
  { value: 'all', label: 'Semua Jenis Konten' },
  { value: 'resource', label: 'Resource Akademik' },
  { value: 'experience', label: 'Pengalaman Mahasiswa' },
];

const TONE = {
  primary: { head: '', box: styles.boxPrimary, value: '' },
  danger: { head: styles.redText, box: styles.boxDanger, value: styles.redText, card: styles.cardDanger },
  warn: { head: styles.warnText, box: styles.boxWarn, value: styles.warnText, card: styles.cardWarn },
  ok: { head: '', box: styles.boxPrimary, value: '' },
};

/** FR-ADM-03: daftar laporan yang dikirim pengguna */
export default function AdminReports() {
  const { data, loading, error, reload } = useAsync(listReports, []);
  const [toast, notify] = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('Terbaru');
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    let list = data || [];
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((r) => [r.id, r.title, r.reporter, r.reason].join(' ').toLowerCase().includes(term));
    if (status !== 'all') list = list.filter((r) => r.status === status);
    if (type !== 'all') list = list.filter((r) => r.type === type);
    if (sort === 'Terlama') list = [...list].reverse();
    return list;
  }, [data, q, status, type, sort]);

  const resetFilters = () => {
    setQ('');
    setStatus('all');
    setType('all');
    setSort('Terbaru');
  };

  return (
    <>
      <nav className={styles.subCrumbs} aria-label="Breadcrumb">
        <span>Universitas Telkom</span>
        <span>/</span>
        <span>Direktorat Pascasarjana &amp; Riset</span>
        <span>/</span>
        <strong>Kelola Laporan</strong>
      </nav>

      <div className={ui.pageHead}>
        <div className={ui.pageHeadText}>
          <div className={styles.titleRow}>
            <h1 className={ui.title}>Kelola Laporan</h1>
            <span className={`${ui.badge} ${ui.badgeRound} ${ui.toneDanger}`}>
              <span className={ui.dot} style={{ background: '#ba1a1a' }} />5 Butuh Tindakan
            </span>
          </div>
          <p className={ui.subtitle}>
            Kelola dan tinjau laporan konten yang dikirimkan oleh civitas akademika untuk menjaga integritas, keamanan
            data, dan kepatuhan repositori AKSARA Telkom University.
          </p>
        </div>
        <div className={ui.headActions}>
          <button type="button" className={`${ui.btn} ${ui.btnWhite}`} onClick={() => document.getElementById('report-search')?.focus()}>
            <Icon icon="lucide:sliders-horizontal" size={15} />
            Filter Lanjutan
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnBlue}`} onClick={() => notify('Rekap laporan sedang disiapkan untuk diunduh.')}>
            <Icon icon="lucide:download" size={15} />
            Export Rekap Laporan
          </button>
        </div>
      </div>

      <section className={styles.stats}>
        {reportStats.map((s) => (
          <article key={s.label} className={`${ui.card} ${styles.stat} ${TONE[s.tone].card || ''}`}>
            <div className={styles.statHead}>
              <span className={`${styles.statLabel} ${TONE[s.tone].head}`}>{s.label}</span>
              <span className={`${styles.statBox} ${TONE[s.tone].box}`}>
                <Icon icon={s.icon} size={16} />
              </span>
            </div>
            <p className={styles.statValue}>
              <strong className={TONE[s.tone].value}>{s.value}</strong>
              <span className={s.tone === 'danger' ? styles.redSoft : s.tone === 'ok' ? styles.blueText : ''}>{s.unit}</span>
            </p>
            <p className={`${styles.statNote} ${s.tone === 'danger' ? styles.redText : s.tone === 'primary' ? styles.blueText : ''}`}>
              <Icon icon={s.noteIcon} size={12} />
              {s.note}
            </p>
          </article>
        ))}
      </section>

      <section className={`${ui.card} ${styles.filters}`}>
        <label className={`${ui.search} ${styles.search}`}>
          <Icon icon="lucide:search" size={18} />
          <span className="visually-hidden">Cari laporan</span>
          <input
            id="report-search"
            type="search"
            placeholder="Cari ID laporan, judul konten, pelapor, atau alasan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <span className={ui.select}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status laporan">
            {STATUS_FILTER.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Icon icon="lucide:chevron-down" size={16} />
        </span>
        <span className={ui.select}>
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Jenis konten">
            {TYPE_FILTER.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Icon icon="lucide:chevron-down" size={16} />
        </span>
        <span className={ui.select}>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutan">
            <option>Terbaru</option>
            <option>Terlama</option>
          </select>
          <Icon icon="lucide:list-filter" size={16} />
        </span>
        <button type="button" className={styles.resetBtn} onClick={resetFilters} aria-label="Hapus semua filter" title="Hapus semua filter">
          <Icon icon="lucide:funnel-x" size={16} />
        </button>
      </section>

      <section className={`${ui.card} ${styles.tableCard}`}>
        <div className={styles.tableHead}>
          <h2 className={ui.cardTitle}>
            <Icon icon="lucide:clipboard-list" size={18} color="#00478e" />
            Daftar Laporan Pelanggaran Konten
          </h2>
          <span className={ui.cardSub}>
            SRS Ref: <code className={styles.mono}>FR-ADM-03</code>
          </span>
        </div>

        {loading ? (
          <p className={ui.state}>Memuat laporan…</p>
        ) : error ? (
          <p className={ui.state}>
            {error.message} <button type="button" className={styles.link} onClick={reload}>Coba lagi</button>
          </p>
        ) : rows.length === 0 ? (
          <p className={ui.state}>Tidak ada laporan yang cocok dengan filter.</p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={`${ui.table} ${styles.table}`}>
              <thead>
                <tr>
                  <th>
                    ID
                    <br />
                    Laporan
                  </th>
                  <th>Konten Dilaporkan</th>
                  <th>Jenis Konten</th>
                  <th>Pelapor</th>
                  <th>Alasan Laporan</th>
                  <th>Tanggal Laporan</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/admin/laporan/${r.id}`} className={styles.mono}>
                        #{r.id}
                      </Link>
                      {r.flag && <span className={styles.flag}>{r.flag}</span>}
                    </td>
                    <td>
                      <div className={styles.content}>
                        <span className={styles.contentIcon}>
                          <Icon icon={r.icon} size={16} />
                        </span>
                        <div>
                          <p className={styles.contentTitle}>{r.title}</p>
                          <p className={ui.cellMeta}>{r.meta}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.typeBadge} ${r.type === 'experience' ? styles.typeExp : ''}`}>
                        <Icon icon={r.type === 'experience' ? 'lucide:message-circle-heart' : 'lucide:graduation-cap'} size={13} />
                        {r.type === 'experience' ? 'Pengalaman Mahasiswa' : 'Resource Akademik'}
                      </span>
                    </td>
                    <td>
                      <p className={styles.reporter}>{r.reporter}</p>
                      <p className={`${ui.cellMeta} ${styles.mono2}`}>{r.reporterMeta}</p>
                    </td>
                    <td className={styles.reasonCell}>
                      <p className={styles.reason}>
                        <Icon icon={r.reasonIcon} size={12} />
                        {r.reason}
                      </p>
                      <p className={styles.reasonText}>{r.reasonText}</p>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <p className={ui.cellStrong} style={{ fontSize: 11, fontWeight: 600 }}>{r.date}</p>
                      <p className={ui.cellMeta}>{r.time}</p>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`${ui.badge} ${ui.badgeRound} ${STATUS[r.status].tone}`}>{STATUS[r.status].label}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/laporan/${r.id}`} className={`${ui.btn} ${ui.btnSm} ${ui.btnSoft}`}>
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPager
          info={
            <>
              Menampilkan <strong>1–{rows.length}</strong> dari <strong>18</strong> laporan terdaftar
            </>
          }
          page={page}
          pages={[1, 2, 3]}
          onChange={setPage}
        />
      </section>
      {toast}
    </>
  );
}
