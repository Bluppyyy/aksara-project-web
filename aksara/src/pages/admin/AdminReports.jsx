import { useMemo, useState } from 'react';
import Icon from '../../components/Icon/Icon.jsx';
import useAsync from '../../hooks/useAsync';
import { listReports, updateReportStatus } from '../../services/admin';
import { reportStats } from '../../data/admin';
import { USE_API } from '../../services/api';
import ui from './admin.module.css';
import { PageHeader, StatCards, AdminFilters } from './shared.jsx';
import { useToast } from './useToast.jsx';
import AdminTable, { TitleCell, PersonCell, TextCell, Actions, ActionButton } from './AdminTable.jsx';

const REPORT_STATUS = {
  baru: { label: 'Baru', tone: ui.toneDanger },
  ditinjau: { label: 'Ditinjau', tone: ui.toneWarn },
  selesai: { label: 'Selesai', tone: ui.toneOk },
};

const STATUS_FILTER = [
  { value: 'all', label: 'Semua Status' },
  { value: 'baru', label: 'Baru' },
  { value: 'ditinjau', label: 'Ditinjau' },
  { value: 'selesai', label: 'Selesai' },
];

const TYPE_FILTER = [
  { value: 'all', label: 'Semua Jenis' },
  { value: 'resource', label: 'Resource Akademik' },
  { value: 'experience', label: 'Wawasan Mahasiswa' },
];

const TYPE_LABEL = { resource: 'Resource Akademik', experience: 'Wawasan Mahasiswa' };

/** FR-ADM-03: daftar laporan yang dikirim pengguna */
export default function AdminReports() {
  const { data, loading, error, reload, setData } = useAsync(listReports, []);
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

  /** PUT /admin/report/:id/status (optimistic, dibatalkan kalau gagal) */
  const setReportStatus = async (r, next) => {
    const before = data;
    setData((list) => list.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
    try {
      await updateReportStatus(r.id, next);
      notify(next === 'selesai' ? `Laporan #${r.id} ditandai selesai.` : `Laporan #${r.id} sedang ditinjau.`);
    } catch (err) {
      setData(before);
      notify(err.message || 'Gagal memperbarui status laporan.', 'error');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Konten Dilaporkan',
      render: (r) => (
        <TitleCell
          code={`#${r.id}`}
          over={TYPE_LABEL[r.type]}
          title={r.title}
          to={`/admin/laporan/${r.id}`}
          meta={[{ icon: 'lucide:file-text', text: [r.format, r.size].filter(Boolean).join(' • ') }]}
        />
      ),
    },
    {
      key: 'reporter',
      label: 'Pelapor',
      width: 230,
      render: (r) => <PersonCell name={r.reporter} lines={[r.nim && `NIM ${r.nim}`, r.prodi]} />,
    },
    {
      key: 'reason',
      label: 'Alasan',
      width: 200,
      render: (r) => <TextCell primary={r.reason} secondary={r.reasonText} clamp />,
    },
    {
      key: 'date',
      label: 'Tanggal',
      width: 112,
      render: (r) => <TextCell primary={r.date} secondary={r.time} nowrap />,
    },
    {
      key: 'status',
      label: 'Status',
      width: 120,
      render: (r) => (
        <span className={`${ui.badge} ${ui.badgeRound} ${REPORT_STATUS[r.status].tone}`}>
          <span className={ui.dot} />
          {REPORT_STATUS[r.status].label}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      width: 104,
      align: 'right',
      render: (r) => (
        <Actions>
          <ActionButton
            icon="lucide:hourglass"
            label="Tandai sedang ditinjau"
            disabled={r.status !== 'baru'}
            onClick={() => setReportStatus(r, 'ditinjau')}
          />
          <ActionButton
            icon="lucide:circle-check"
            tone="ok"
            label="Tandai selesai"
            disabled={r.status === 'selesai'}
            onClick={() => setReportStatus(r, 'selesai')}
          />
        </Actions>
      ),
    },
  ];

  return (
    <div className={ui.page}>
      <PageHeader
        crumbs={[{ label: 'Kelola Laporan' }]}
        title="Kelola Laporan"
        subtitle="Tinjau laporan konten dari mahasiswa untuk menjaga integritas dan keamanan repositori."
        actions={
          <button
            type="button"
            className={`${ui.btn} ${ui.btnPrimary}`}
            onClick={() => notify('Rekap laporan sedang disiapkan untuk diunduh.')}
          >
            <Icon icon="lucide:download" size={16} />
            Export Rekap
          </button>
        }
      />

      <StatCards
        items={
          USE_API
            ? [
                {
                  label: 'Total Laporan',
                  value: String((data || []).length),
                  note: 'Semua laporan masuk',
                  icon: 'lucide:flag',
                  tone: 'primary',
                },
                {
                  label: 'Laporan Baru',
                  value: String((data || []).filter((r) => r.status === 'baru').length),
                  note: 'Belum ditinjau',
                  icon: 'lucide:bell-ring',
                  tone: 'danger',
                },
                {
                  label: 'Dalam Peninjauan',
                  value: String((data || []).filter((r) => r.status === 'ditinjau').length),
                  note: 'Sedang ditinjau',
                  icon: 'lucide:hourglass',
                  tone: 'warn',
                },
                {
                  label: 'Selesai',
                  value: String((data || []).filter((r) => r.status === 'selesai').length),
                  note: 'Sudah ditangani',
                  icon: 'lucide:circle-check',
                  tone: 'ok',
                },
              ]
            : reportStats
        }
      />

      <AdminFilters
        search={{ value: q, onChange: setQ, placeholder: 'Cari ID laporan, judul konten, pelapor, atau alasan…' }}
        selects={[
          { label: 'Status laporan', value: status, onChange: setStatus, options: STATUS_FILTER },
          { label: 'Jenis konten', value: type, onChange: setType, options: TYPE_FILTER },
          { label: 'Urutan', value: sort, onChange: setSort, options: ['Terbaru', 'Terlama'] },
        ]}
        onReset={resetFilters}
      />

      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyText="Tidak ada laporan yang cocok dengan filter."
        pager={{
          info: (
            <>
              Menampilkan <strong>{rows.length}</strong> dari <strong>{USE_API ? (data || []).length : 18}</strong>{' '}
              laporan
            </>
          ),
          page,
          pages: USE_API ? [1] : [1, 2, 3],
          onChange: setPage,
        }}
      />
      {toast}
    </div>
  );
}
