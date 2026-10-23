import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import useAsync from '../../hooks/useAsync';
import { listAdminResources, updateResourceStatus, deleteResource } from '../../services/admin';
import { resourceStats } from '../../data/admin';
import { USE_API } from '../../services/api';
import { PRODI_FIF } from '../../data/academic';
import ui from './admin.module.css';
import { PageHeader, StatCards, AdminFilters, StatusBadge } from './shared.jsx';
import { useToast } from './useToast.jsx';
import AdminTable, {
  TitleCell,
  PersonCell,
  TextCell,
  Actions,
  ActionButton,
  BulkButton,
  CategoryBadge,
} from './AdminTable.jsx';

const ALL_CAT = 'Semua Kategori';
const ALL_PRODI = 'Semua Prodi';
const CATEGORY_OPTIONS = [
  ALL_CAT,
  'Laporan Proyek',
  'Tugas Akhir',
  'Source Code',
  'Jurnal & Data',
  'Catatan Kuliah',
  'Materi Kuliah',
];
const PRODI_OPTIONS = [ALL_PRODI, ...PRODI_FIF];
const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu Review' },
  { value: 'approved', label: 'Dipublikasikan' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'hidden', label: 'Disembunyikan' },
];
const SORTS = ['Terbaru', 'Terlama', 'Judul A-Z'];

/** Meta yang SAMA untuk setiap baris: format, dilihat, unduhan, favorit */
const resourceMeta = (r) => [
  { icon: 'lucide:file-text', text: [r.format, r.size].filter(Boolean).join(' • ') || 'FILE' },
  { icon: 'lucide:eye', text: r.views ?? '0', label: 'Dilihat' },
  { icon: 'lucide:download', text: r.downloads ?? '0', label: 'Diunduh' },
  { icon: 'lucide:bookmark', text: r.favorites ?? '0', label: 'Favorit' },
];

export default function AdminResources() {
  const { data, loading, error, reload, setData } = useAsync(listAdminResources, []);
  const [toast, notify] = useToast();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState(ALL_CAT);
  const [prodi, setProdi] = useState(ALL_PRODI);
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState(SORTS[0]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    let list = data || [];
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((r) => [r.title, r.course, r.code, r.author].join(' ').toLowerCase().includes(term));
    if (category !== ALL_CAT) list = list.filter((r) => r.category === category);
    if (prodi !== ALL_PRODI) list = list.filter((r) => r.prodi === prodi);
    if (status !== 'all') list = list.filter((r) => r.status === status);
    if (sort === 'Terlama') list = [...list].reverse();
    if (sort === 'Judul A-Z') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [data, q, category, prodi, status, sort]);

  const resetFilters = () => {
    setQ('');
    setCategory(ALL_CAT);
    setProdi(ALL_PRODI);
    setStatus('all');
    setSort(SORTS[0]);
  };

  /** FR-ADM-02: perbarui status (optimistic update, dibatalkan kalau gagal — NFR-REL-02) */
  const changeStatus = async (ids, next, message) => {
    const before = data;
    setData((list) => list.map((r) => (ids.includes(r.id) ? { ...r, status: next } : r)));
    try {
      await Promise.all(ids.map((id) => updateResourceStatus(id, next)));
      notify(message);
      setSelected([]);
    } catch (err) {
      setData(before);
      notify(err.message || 'Gagal memperbarui status. Data tidak berubah.', 'error');
    }
  };

  /** Hapus resource permanen (DELETE /admin/resource/:id) */
  const remove = async (r) => {
    if (!window.confirm(`Hapus "${r.title}" secara permanen? Tindakan ini tidak bisa dibatalkan.`)) return;
    const before = data;
    setData((list) => list.filter((x) => x.id !== r.id));
    try {
      await deleteResource(r.id);
      notify(`"${r.title}" dihapus.`);
      setSelected((s) => s.filter((id) => id !== r.id));
    } catch (err) {
      setData(before);
      notify(err.message || 'Gagal menghapus resource.', 'error');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Resource',
      render: (r) => (
        <TitleCell code={r.code} over={r.course} title={r.title} to={`/resource/${r.id}`} meta={resourceMeta(r)} />
      ),
    },
    {
      key: 'author',
      label: 'Kontributor',
      width: 196,
      render: (r) => <PersonCell name={r.author} lines={[r.nim && `NIM ${r.nim}`, r.prodi]} />,
    },
    {
      key: 'category',
      label: 'Kategori',
      width: 128,
      render: (r) => <CategoryBadge>{r.category}</CategoryBadge>,
    },
    {
      key: 'date',
      label: 'Tanggal',
      width: 112,
      render: (r) => <TextCell primary={r.date} secondary={r.time} nowrap />,
    },
    { key: 'status', label: 'Status', width: 156, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Aksi',
      width: 168,
      align: 'right',
      render: (r) => (
        <Actions>
          <ActionButton
            icon="lucide:circle-check"
            tone="ok"
            label={`Setujui ${r.title}`}
            disabled={r.status === 'approved'}
            onClick={() => changeStatus([r.id], 'approved', `"${r.title}" dipublikasikan.`)}
          />
          <ActionButton
            icon="lucide:eye-off"
            label={`Sembunyikan ${r.title}`}
            disabled={r.status === 'hidden'}
            onClick={() => changeStatus([r.id], 'hidden', `"${r.title}" disembunyikan dari publik.`)}
          />
          <ActionButton
            icon="lucide:circle-x"
            tone="danger"
            label={`Tolak ${r.title}`}
            disabled={r.status === 'rejected'}
            onClick={() => changeStatus([r.id], 'rejected', `"${r.title}" ditolak.`)}
          />
          <ActionButton icon="lucide:trash-2" tone="danger" label={`Hapus ${r.title}`} onClick={() => remove(r)} />
        </Actions>
      ),
    },
  ];

  return (
    <div className={ui.page}>
      <PageHeader
        crumbs={[{ label: 'Kelola Resource' }]}
        title="Kelola Resource"
        subtitle="Kelola berkas dokumen, source code, dan materi akademik yang diunggah mahasiswa FIF."
        actions={
          <>
            <button
              type="button"
              className={`${ui.btn} ${ui.btnWhite}`}
              onClick={() => notify('Rekap CSV sedang disiapkan.')}
            >
              <Icon icon="lucide:download" size={16} />
              Export CSV
            </button>
            <Link to="/unggah" className={`${ui.btn} ${ui.btnPrimary}`}>
              <Icon icon="lucide:plus" size={16} />
              Tambah Resource
            </Link>
          </>
        }
      />

      <StatCards
        items={
          USE_API
            ? [
                {
                  label: 'Total Resource',
                  value: String((data || []).length),
                  note: 'Semua status',
                  icon: 'lucide:folder-open',
                  tone: 'primary',
                },
                {
                  label: 'Menunggu Review',
                  value: String((data || []).filter((r) => r.status === 'pending').length),
                  note: 'Perlu moderasi',
                  icon: 'lucide:file-clock',
                  tone: 'warn',
                },
                {
                  label: 'Terpublikasi',
                  value: String((data || []).filter((r) => r.status === 'approved').length),
                  note: 'Tampil di Eksplorasi',
                  icon: 'lucide:badge-check',
                  tone: 'ok',
                },
                {
                  label: 'Ditolak',
                  value: String((data || []).filter((r) => r.status === 'rejected').length),
                  note: 'Tidak sesuai ketentuan',
                  icon: 'lucide:file-x-2',
                  tone: 'danger',
                },
              ]
            : resourceStats
        }
      />

      <AdminFilters
        search={{ value: q, onChange: setQ, placeholder: 'Cari judul, matkul, kontributor…' }}
        selects={[
          { label: 'Kategori', value: category, onChange: setCategory, options: CATEGORY_OPTIONS },
          { label: 'Program studi', value: prodi, onChange: setProdi, options: PRODI_OPTIONS },
          { label: 'Status', value: status, onChange: setStatus, options: STATUS_OPTIONS },
          { label: 'Urutan', value: sort, onChange: setSort, options: SORTS },
        ]}
        onReset={resetFilters}
      />

      {/* Tabel resource (FR-ADM-01) — komponen tabel utama */}
      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyText="Tidak ada resource yang cocok dengan filter."
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        bulkActions={
          <>
            <BulkButton
              icon="lucide:circle-check"
              disabled={!selected.length}
              onClick={() => changeStatus(selected, 'approved', `${selected.length} resource dipublikasikan.`)}
            >
              Setujui
            </BulkButton>
            <BulkButton
              icon="lucide:archive"
              danger
              disabled={!selected.length}
              onClick={() => changeStatus(selected, 'hidden', `${selected.length} resource diarsipkan.`)}
            >
              Arsipkan
            </BulkButton>
          </>
        }
        pager={{
          info: (
            <>
              Menampilkan <strong>{rows.length}</strong> dari <strong>{USE_API ? (data || []).length : '2.845'}</strong>{' '}
              resource
            </>
          ),
          page,
          pages: USE_API ? [1] : [1, 2, 3],
          last: USE_API ? undefined : 285,
          onChange: setPage,
        }}
      />
      {toast}
    </div>
  );
}
