import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import ui from './admin.module.css';
import styles from './AdminDashboard.module.css';
import { useToast, AdminPager } from './shared.jsx';
import {
  dashboardStats,
  monthlyUploads,
  categoryDistribution,
  dashboardQueue,
  dashboardReports,
} from '../../data/admin';

const TONE = {
  primary: { box: styles.icPrimary, badge: ui.tonePrimary },
  secondary: { box: styles.icPrimary, badge: ui.toneSecondary },
  warn: { box: styles.icWarn, badge: ui.toneWarn },
  danger: { box: styles.icDanger, badge: ui.toneDanger },
};

const SERIES = [
  { label: 'Laporan Proyek', color: '#1f5faf' },
  { label: 'Tugas Akhir / TA', color: '#a8c8fc' },
  { label: 'Paper Riset', color: '#ffb598' },
];

const QUEUE_FILTERS = [
  { key: 'all', label: 'Semua (28)' },
  { key: 'proyek', label: 'Laporan Proyek' },
  { key: 'source', label: 'Source Code' },
];

/** Grafik batang SVG murni (tanpa library) */
function UploadChart() {
  const W = 584;
  const H = 230;
  const left = 32;
  const base = 206;
  const scale = (v) => ((v - 0) / 250) * 184;
  const ticks = [250, 180, 100, 40];
  const step = (W - left - 16) / monthlyUploads.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Grafik tren unggahan bulanan 2024">
      {ticks.map((t) => {
        const y = base - scale(t);
        return (
          <g key={t}>
            <line x1={left} x2={W - 16} y1={y} y2={y} stroke="#dce9ff" strokeDasharray="4 4" />
            <text x={left - 8} y={y + 4} textAnchor="end" className={styles.axis}>
              {t}
            </text>
          </g>
        );
      })}
      <line x1={left} x2={W - 16} y1={base} y2={base} stroke="#c2c6d3" />
      {monthlyUploads.map((m, i) => {
        const x0 = left + 13 + i * step;
        return (
          <g key={m.month}>
            {m.values.map((v, s) => (
              <rect key={s} x={x0 + s * 9.8} y={base - scale(v)} width={8} height={scale(v)} rx={1.5} fill={SERIES[s].color}>
                <title>{`${m.month} • ${SERIES[s].label}: ${v} berkas`}</title>
              </rect>
            ))}
            <text
              x={x0 + 13}
              y={base + 20}
              textAnchor="middle"
              className={i === monthlyUploads.length - 1 ? styles.axisActive : styles.axisMonth}
            >
              {m.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [toast, notify] = useToast();
  const [filter, setFilter] = useState('all');
  const queue = useMemo(
    () => (filter === 'all' ? dashboardQueue : dashboardQueue.filter((q) => q.type === filter)),
    [filter]
  );

  return (
    <>
      <div className={ui.pageHead}>
        <div className={ui.pageHeadText}>
          <div className={ui.eyebrow}>
            <span className={ui.pill}>
              <span className={ui.dot} />
              Sistem Repositori Aktif
            </span>
            <span>• Tahun Akademik 2024/2025</span>
          </div>
          <h1 className={ui.title}>Dashboard Administrator</h1>
          <p className={ui.subtitle}>
            Ringkasan statistik, arus kurasi konten, dan antrean moderasi akademik Telkom University.
          </p>
        </div>
        <div className={ui.headActions}>
          <button type="button" className={`${ui.btn} ${ui.btnWhite} ${styles.period}`}>
            <Icon icon="lucide:calendar-days" size={15} color="#00478e" />
            Januari - Desember 2024
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnPrimary}`} onClick={() => notify('Rekap 2024 sedang disiapkan untuk diunduh.')}>
            <Icon icon="lucide:download" size={14} />
            Unduh Rekap
          </button>
        </div>
      </div>

      {/* 6 kartu metrik */}
      <section className={styles.stats} aria-label="Statistik ringkasan">
        {dashboardStats.map((s) => (
          <article key={s.key} className={`${ui.card} ${styles.stat} ${s.highlight ? styles.statHighlight : ''}`}>
            <div className={styles.statTop}>
              <span className={`${styles.statIcon} ${TONE[s.tone].box}`}>
                <Icon icon={s.icon} size={20} />
              </span>
              <span className={`${ui.badge} ${ui.badgeRound} ${TONE[s.tone].badge} ${styles.statBadge}`}>{s.badge}</span>
            </div>
            <div className={styles.statBody}>
              <span className={ui.overline}>{s.label}</span>
              <p className={styles.statValue}>
                <strong className={styles[`val_${s.tone}`]}>{s.value}</strong>
                <span>{s.unit}</span>
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* Grafik & distribusi */}
      <section className={styles.middle}>
        <article className={`${ui.card} ${styles.chartCard}`}>
          <div className={styles.chartHead}>
            <div>
              <h2 className={ui.cardTitle}>
                <Icon icon="lucide:chart-column" size={16} color="#00478e" />
                Tren Unggahan &amp; Kontribusi Bulanan (2024)
              </h2>
              <p className={ui.cardSub}>
                Volumetrik arsip akademik berdasarkan Tugas Akhir, Laporan Proyek IoT, dan Paper Riset
              </p>
            </div>
            <ul className={styles.legend}>
              {SERIES.map((s) => (
                <li key={s.label}>
                  <span style={{ background: s.color }} />
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
          <UploadChart />
          <div className={styles.insight}>
            <p>
              <Icon icon="lucide:trending-up" size={15} color="#00478e" />
              Puncak kontribusi tertinggi terjadi pada periode Sidang Akhir Semester (Juni: 395 berkas).
            </p>
            <Link to="/admin/resource" className={styles.linkSmall}>
              Lihat Detail Log →
            </Link>
          </div>
        </article>

        <article className={`${ui.card} ${styles.distCard}`}>
          <div>
            <div className={styles.distHead}>
              <h2 className={ui.cardTitle}>
                <Icon icon="lucide:chart-pie" size={17} color="#3f5f8e" />
                Distribusi Kategori
              </h2>
              <span className={ui.cardSub}>Total 2.845</span>
            </div>
            <p className={styles.distText}>Proporsi format dan ragam arsip ilmiah yang tersimpan dalam indeks AKSARA.</p>
            <ul className={styles.bars}>
              {categoryDistribution.map((c) => (
                <li key={c.label}>
                  <div className={styles.barLabel}>
                    <span>{c.label}</span>
                    <span style={{ color: c.color }}>{c.detail}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <span style={{ width: `${c.percent}%`, background: c.color }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.sync}>
            <span className={styles.syncIcon}>
              <Icon icon="lucide:users-round" size={14} />
            </span>
            <div>
              <strong>Sinkronisasi Open Tel-U</strong>
              <span>Terakhir diperbarui 5 menit lalu</span>
            </div>
            <button type="button" aria-label="Sinkronkan ulang" onClick={() => notify('Sinkronisasi Open Tel-U diperbarui.')}>
              <Icon icon="lucide:refresh-cw" size={14} />
            </button>
          </div>
        </article>
      </section>

      {/* Antrean moderasi & widget */}
      <section className={styles.bottom}>
        <article className={`${ui.card} ${styles.queueCard}`}>
          <div className={styles.queueHead}>
            <div>
              <h2 className={ui.cardTitle}>
                <Icon icon="lucide:list-checks" size={17} color="#7c310d" />
                Antrean Moderasi Konten Terbaru
              </h2>
              <p className={ui.cardSub}>Verifikasi berkas unggahan mahasiswa sebelum terindeks publik di AKSARA.</p>
            </div>
            <div className={styles.quickFilters} role="group" aria-label="Filter antrean">
              {QUEUE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`${styles.qf} ${filter === f.key ? styles.qfActive : ''}`}
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Judul Konten</th>
                  <th>Kontributor</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q) => (
                  <tr key={q.id}>
                    <td style={{ minWidth: 300 }}>
                      <p className={ui.cellTitle}>
                        <Link to={`/admin/moderasi/${q.id}`}>{q.title}</Link>
                      </p>
                      <p className={`${ui.cellMeta} ${styles.fileMeta}`}>
                        <Icon icon="lucide:paperclip" size={11} />
                        {q.meta}
                      </p>
                    </td>
                    <td style={{ minWidth: 120 }}>
                      <p className={ui.cellStrong}>{q.author}</p>
                      <p className={ui.cellMeta}>{q.authorMeta}</p>
                    </td>
                    <td>
                      <span className={`${ui.badge} ${q.categoryTone === 'warn' ? ui.toneWarn : q.categoryTone === 'secondary' ? ui.toneSecondary : ui.tonePrimary}`}>
                        {q.category}
                      </span>
                    </td>
                    <td className={ui.cellMeta} style={{ whiteSpace: 'nowrap' }}>{q.date}</td>
                    <td>
                      <span className={`${ui.badge} ${ui.badgeRound} ${q.status === 'Menunggu' ? ui.toneWarn : ui.toneSecondary}`}>
                        <span className={ui.dot} />
                        {q.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.rowActions}>
                        <button type="button" className={`${ui.btn} ${ui.btnSm} ${ui.btnSoft}`} onClick={() => navigate(`/admin/moderasi/${q.id}`)}>
                          Tinjau
                        </button>
                        <button type="button" className={styles.iconOk} aria-label={`Setujui ${q.title}`} onClick={() => notify(`"${q.title}" disetujui & dipublikasikan.`)}>
                          <Icon icon="lucide:check" size={14} />
                        </button>
                        <button type="button" className={styles.iconNo} aria-label={`Tolak ${q.title}`} onClick={() => notify(`"${q.title}" ditolak.`, 'error')}>
                          <Icon icon="lucide:x" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPager info={`Menampilkan ${queue.length} dari 28 berkas antrean aktif`} pages={[1]} />
        </article>

        <div className={styles.side}>
          <article className={`${ui.card} ${ui.cardPad} ${styles.reportWidget}`}>
            <div className={styles.widgetHead}>
              <h2 className={ui.cardTitle}>
                <Icon icon="lucide:triangle-alert" size={18} color="#ba1a1a" />
                Laporan Membutuhkan Tindakan
              </h2>
              <span className={`${ui.badge} ${ui.badgeRound} ${ui.toneDanger}`}>7 Isu</span>
            </div>
            <ul className={styles.reportList}>
              {dashboardReports.map((r) => (
                <li key={r.id} className={styles.reportItem}>
                  <div className={styles.reportTop}>
                    <strong>{r.title}</strong>
                    <span className={r.priority === 'Urgen' ? styles.urgent : styles.normal}>{r.priority}</span>
                  </div>
                  <p>{r.text}</p>
                  <div className={styles.reportFoot}>
                    <span>{r.reporter}</span>
                    <Link
                      to={`/admin/laporan/${r.id}`}
                      className={`${styles.reportBtn} ${r.priority === 'Urgen' ? styles.reportBtnDanger : ''}`}
                    >
                      {r.action}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/admin/laporan" className={`${ui.btn} ${ui.btnSoft} ${styles.fullBtn}`}>
              Buka Seluruh Laporan (7)
            </Link>
          </article>

          <article className={`${ui.card} ${ui.cardPad} ${styles.storage}`}>
            <div className={styles.widgetHead}>
              <h2 className={ui.cardTitle}>Penyimpanan Object AKSARA</h2>
              <Icon icon="lucide:database" size={16} color="#00478e" />
            </div>
            <div className={styles.storageRow}>
              <span>Terpakai: 1.42 TB dari 4.00 TB</span>
              <strong>35.5%</strong>
            </div>
            <div className={styles.barTrack}>
              <span style={{ width: '35.5%', background: '#00478e' }} />
            </div>
            <div className={styles.storageGrid}>
              <div>
                <span>Total Unduhan</span>
                <strong>48.209x</strong>
              </div>
              <div>
                <span>Uptime Server</span>
                <strong>99.98%</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
      {toast}
    </>
  );
}
