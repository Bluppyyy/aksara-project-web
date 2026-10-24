import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import ui from './admin.module.css';
import styles from './AdminDashboard.module.css';
import { PageHeader, StatCards, StatusBadge } from './shared.jsx';
import { useToast } from './useToast.jsx';
import AdminTable, {
  TitleCell,
  PersonCell,
  TextCell,
  Actions,
  ActionButton,
  ActionText,
  TableChips,
  CategoryBadge,
} from './AdminTable.jsx';
import { dashboardStats, monthlyUploads, categoryDistribution, dashboardQueue } from '../../data/admin';
import { USE_API } from '../../services/api';
import { listModeration, moderate } from '../../services/admin';
import useAsync from '../../hooks/useAsync';

const CHART_SERIES = [
  { label: 'Laporan Proyek', color: '#1f5faf' },
  { label: 'Tugas Akhir / TA', color: '#a8c8fc' },
  { label: 'Paper Riset', color: '#ffb598' },
];

const QUEUE_FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'proyek', label: 'Laporan Proyek' },
  { key: 'catatan', label: 'Catatan Kuliah' },
  { key: 'source', label: 'Source Code & Data' },
];

/** Grafik batang SVG murni (tanpa library) */
function UploadChart() {
  const W = 584;
  const H = 232;
  const left = 32;
  const base = 208;
  const scale = (v) => (v / 250) * 184;
  const ticks = [250, 180, 100, 40];
  const step = (W - left - 16) / monthlyUploads.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Grafik tren unggahan bulanan 2024">
      {ticks.map((t) => {
        const y = base - scale(t);
        return (
          <g key={t}>
            <line x1={left} x2={W - 16} y1={y} y2={y} stroke="#dce9ff" strokeDasharray="4 4" />
            <text x={left - 8} y={y + 4} textAnchor="end" className={styles.chartAxis}>
              {t}
            </text>
          </g>
        );
      })}
      <line x1={left} x2={W - 16} y1={base} y2={base} stroke="#c2c6d3" />
      {monthlyUploads.map((m, i) => {
        const x0 = left + 12 + i * step;
        return (
          <g key={m.month}>
            {m.values.map((v, s) => (
              <rect
                key={s}
                x={x0 + s * 10}
                y={base - scale(v)}
                width={8}
                height={scale(v)}
                rx={2}
                fill={CHART_SERIES[s].color}
              >
                <title>{`${m.month} • ${CHART_SERIES[s].label}: ${v} berkas`}</title>
              </rect>
            ))}
            <text
              x={x0 + 14}
              y={base + 20}
              textAnchor="middle"
              className={i === monthlyUploads.length - 1 ? styles.chartMonthActive : styles.chartMonth}
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
  // Mode API: angka & antrean dihitung dari GET /admin/resource + GET /admin/experience
  const {
    data: items,
    loading,
    error,
    reload,
  } = useAsync(() => (USE_API ? listModeration() : Promise.resolve(null)), []);
  const all = items || [];
  const resources = all.filter((i) => i.type === 'resource');
  const count = (list, st) => list.filter((i) => i.status === st).length;
  const stats = USE_API
    ? [
        {
          label: 'Total Resource',
          value: String(resources.length),
          note: 'Semua status',
          icon: 'lucide:book-open-text',
          tone: 'primary',
        },
        {
          label: 'Terpublikasi',
          value: String(count(resources, 'approved')),
          note: 'Tampil di Eksplorasi',
          icon: 'lucide:badge-check',
          tone: 'ok',
        },
        {
          label: 'Antrean Moderasi',
          value: String(count(all, 'pending')),
          note: 'Resource & wawasan',
          icon: 'lucide:clipboard-clock',
          tone: 'warn',
        },
        {
          label: 'Wawasan Mahasiswa',
          value: String(all.length - resources.length),
          note: `${count(
            all.filter((i) => i.type === 'experience'),
            'approved'
          )} dipublikasikan`,
          icon: 'lucide:newspaper',
          tone: 'primary',
        },
        {
          label: 'Ditolak',
          value: String(count(all, 'rejected')),
          note: 'Resource & wawasan',
          icon: 'lucide:circle-x',
          tone: 'danger',
        },
        {
          label: 'Kategori',
          value: String(new Set(resources.map((r) => r.category)).size),
          note: 'Kategori terpakai',
          icon: 'lucide:layout-grid',
          tone: 'primary',
        },
      ]
    : dashboardStats;
  // Distribusi kategori dari data nyata (mode API)
  const PALETTE = ['#00478e', '#3f5f8e', '#1f5faf', '#9a4823', '#5c7ca8', '#7c310d'];
  const distribution = USE_API
    ? Object.entries(resources.reduce((acc, r) => ({ ...acc, [r.category]: (acc[r.category] || 0) + 1 }), {}))
        .sort((a, b) => b[1] - a[1])
        .map(([label, n], i) => {
          const percent = resources.length ? Math.round((n / resources.length) * 100) : 0;
          return { label, detail: `${percent}% • ${n} berkas`, percent, color: PALETTE[i % PALETTE.length] };
        })
    : categoryDistribution;

  const source = USE_API ? all.filter((i) => i.status === 'pending') : dashboardQueue;
  const queue = filter === 'all' ? source : source.filter((q) => q.type === filter);

  const [handled, setHandled] = useState({});
  const rows = queue.map((q) => (handled[q.id] ? { ...q, status: handled[q.id] } : q));
  const decide = async (q, status) => {
    setHandled((h) => ({ ...h, [q.id]: status }));
    try {
      if (USE_API) await moderate(q.id, status);
      notify(
        status === 'approved' ? `"${q.title}" disetujui & dipublikasikan.` : `"${q.title}" ditolak.`,
        status === 'approved' ? 'success' : 'error'
      );
    } catch (err) {
      // NFR-REL-02: kembalikan status kalau backend gagal
      setHandled((h) => {
        const { [q.id]: _, ...rest } = h;
        return rest;
      });
      notify(err.message || 'Gagal memperbarui status.', 'error');
    }
  };
  const filters = USE_API
    ? [
        { key: 'all', label: 'Semua' },
        { key: 'resource', label: 'Resource' },
        { key: 'experience', label: 'Wawasan' },
      ]
    : QUEUE_FILTERS;

  const columns = [
    {
      key: 'title',
      label: 'Konten',
      render: (q) => (
        <TitleCell
          code={q.code}
          over={q.course}
          title={q.title}
          to={`/admin/moderasi/${q.id}`}
          meta={[{ icon: 'lucide:file-text', text: `${q.format} • ${q.size}` }]}
        />
      ),
    },
    {
      key: 'author',
      label: 'Kontributor',
      width: 230,
      render: (q) => <PersonCell name={q.author} lines={[q.nim && `NIM ${q.nim}`, q.prodi]} />,
    },
    { key: 'category', label: 'Kategori', width: 140, render: (q) => <CategoryBadge>{q.category}</CategoryBadge> },
    {
      key: 'date',
      label: 'Tanggal',
      width: 112,
      render: (q) => <TextCell primary={q.date} secondary={q.time} nowrap />,
    },
    { key: 'status', label: 'Status', width: 156, render: (q) => <StatusBadge status={q.status} /> },
    {
      key: 'actions',
      label: 'Aksi',
      width: 156,
      align: 'right',
      render: (q) => {
        const done = ['approved', 'rejected'].includes(q.status);
        return (
          <Actions>
            <ActionText onClick={() => navigate(`/admin/moderasi/${q.id}`)}>Tinjau</ActionText>
            <ActionButton
              icon="lucide:circle-check"
              tone="ok"
              label={`Setujui ${q.title}`}
              disabled={done}
              onClick={() => decide(q, 'approved')}
            />
            <ActionButton
              icon="lucide:circle-x"
              tone="danger"
              label={`Tolak ${q.title}`}
              disabled={done}
              onClick={() => decide(q, 'rejected')}
            />
          </Actions>
        );
      },
    },
  ];

  return (
    <div className={ui.page}>
      <PageHeader
        crumbs={[{ label: 'Beranda' }]}
        title="Dashboard Administrator"
        subtitle="Ringkasan statistik, kurasi konten, dan antrean moderasi repositori FIF."
        actions={
          <>
            <button
              type="button"
              className={`${ui.btn} ${ui.btnPrimary}`}
              onClick={() => notify('Rekap 2024 sedang disiapkan untuk diunduh.')}
            >
              <Icon icon="lucide:download" size={16} />
              Unduh Rekap
            </button>
          </>
        }
      />

      <StatCards items={stats} />

      {/* ---------- Grafik tren + distribusi kategori ---------- */}
      <section className={styles.splitRow} style={USE_API ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}>
        {/* Grafik tren belum dihitung dari data backend, jadi sementara hanya tampil di mode demo */}
        {!USE_API && (
          <article className={`${ui.card} ${styles.chartCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderText}>
                <h2 className={ui.cardTitle}>
                  <Icon icon="lucide:chart-column" size={16} color="#00478e" />
                  Tren Unggahan Bulanan (2024)
                </h2>
              </div>
              <ul className={styles.chartLegend}>
                {CHART_SERIES.map((s) => (
                  <li key={s.label}>
                    <span className={styles.chartLegendSwatch} style={{ background: s.color }} />
                    {s.label}
                  </li>
                ))}
              </ul>
            </div>
            <UploadChart />
          </article>
        )}

        <article className={`${ui.card} ${styles.categoryCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={ui.cardTitle}>
              <Icon icon="lucide:chart-pie" size={16} color="#00478e" />
              Distribusi Kategori
            </h2>
            <span className={ui.cardSub}>Total {USE_API ? resources.length : '2.845'}</span>
          </div>
          <ul className={styles.categoryList}>
            {USE_API && distribution.length === 0 && <li className={ui.cardSub}>Belum ada resource.</li>}
            {distribution.map((c) => (
              <li key={c.label} className={styles.categoryItem}>
                <div className={styles.categoryLabel}>
                  <span className={styles.categoryName}>{c.label}</span>
                  <span className={styles.categoryDetail} style={{ color: c.color }}>
                    {c.detail}
                  </span>
                </div>
                <div className={styles.progressTrack}>
                  <span className={styles.progressFill} style={{ width: `${c.percent}%`, background: c.color }} />
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* ---------- Antrean moderasi — komponen tabel utama ---------- */}
      <AdminTable
        title="Antrean Moderasi Terbaru"
        headerExtra={<TableChips options={filters} value={filter} onChange={setFilter} label="Filter antrean" />}
        columns={columns}
        rows={rows}
        loading={USE_API && loading}
        error={error}
        onRetry={reload}
        emptyText="Tidak ada antrean pada kategori ini."
        pager={{
          info: (
            <>
              Menampilkan <strong>{rows.length}</strong> dari <strong>{USE_API ? source.length : 28}</strong> antrean
            </>
          ),
          pages: [1],
        }}
      />
      {toast}
    </div>
  );
}
