import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAsync from '../../hooks/useAsync';
import { listModeration } from '../../services/admin';
import { moderationTabs } from '../../data/admin';
import { USE_API } from '../../services/api';
import ui from './admin.module.css';
import { PageHeader, AdminFilters, StatusBadge } from './shared.jsx';
import AdminTable, {
  TitleCell,
  PersonCell,
  TextCell,
  Actions,
  ActionText,
  TableChips,
  CategoryBadge,
} from './AdminTable.jsx';

const TYPE_LABEL = { resource: 'Resource Akademik', experience: 'Wawasan Mahasiswa' };

/** FR-ADM-05: daftar konten untuk moderasi dasar */
export default function AdminModeration() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(listModeration, []);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('Paling Baru');
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    let list = data || [];
    // Tab "Menunggu Review" ikut menampilkan konten yang butuh klarifikasi
    if (tab === 'pending') list = list.filter((r) => ['pending', 'clarify'].includes(r.status));
    else if (tab !== 'all') list = list.filter((r) => r.status === tab);
    const term = q.trim().toLowerCase();
    if (term)
      list = list.filter((r) => [r.title, r.author, r.course, r.category].join(' ').toLowerCase().includes(term));
    if (type !== 'all') list = list.filter((r) => r.type === type);
    if (category !== 'all') list = list.filter((r) => r.category === category);
    if (sort === 'Paling Lama') list = [...list].reverse();
    return list;
  }, [data, tab, q, type, category, sort]);

  const categories = [...new Set((data || []).map((r) => r.category))];

  const resetFilters = () => {
    setQ('');
    setType('all');
    setCategory('all');
    setSort('Paling Baru');
  };

  const columns = [
    {
      key: 'title',
      label: 'Konten',
      render: (r) => (
        <TitleCell
          code={r.code}
          over={r.course || TYPE_LABEL[r.type]}
          title={r.title}
          to={`/admin/moderasi/${r.id}`}
          meta={[{ icon: 'lucide:file-text', text: [r.format, r.size].filter(Boolean).join(' • ') }]}
        />
      ),
    },
    {
      key: 'author',
      label: 'Kontributor',
      width: 230,
      render: (r) => <PersonCell name={r.author} lines={[r.nim && `NIM ${r.nim}`, r.prodi]} />,
    },
    { key: 'category', label: 'Kategori', width: 140, render: (r) => <CategoryBadge>{r.category}</CategoryBadge> },
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
      width: 104,
      align: 'right',
      render: (r) => (
        <Actions>
          <ActionText onClick={() => navigate(`/admin/moderasi/${r.id}`)}>
            {['pending', 'clarify'].includes(r.status) ? 'Tinjau' : 'Detail'}
          </ActionText>
        </Actions>
      ),
    },
  ];

  return (
    <div className={ui.page}>
      <PageHeader
        crumbs={[{ label: 'Moderasi Konten' }]}
        title="Moderasi Konten"
        subtitle="Tinjau resource dan wawasan mahasiswa sebelum dipublikasikan di AKSARA."
      />

      <AdminFilters
        search={{ value: q, onChange: setQ, placeholder: 'Cari judul, kontributor, matkul…' }}
        selects={[
          {
            label: 'Jenis konten',
            value: type,
            onChange: setType,
            options: [
              { value: 'all', label: 'Semua Jenis' },
              { value: 'resource', label: 'Resource Akademik' },
              { value: 'experience', label: 'Wawasan Mahasiswa' },
            ],
          },
          {
            label: 'Kategori',
            value: category,
            onChange: setCategory,
            options: [{ value: 'all', label: 'Semua Kategori' }, ...categories.map((c) => ({ value: c, label: c }))],
          },
          { label: 'Urutan', value: sort, onChange: setSort, options: ['Paling Baru', 'Paling Lama'] },
        ]}
        onReset={resetFilters}
      />

      <AdminTable
        headerExtra={
          <TableChips
            label="Status moderasi"
            options={
              USE_API
                ? moderationTabs.map((t) => ({
                    ...t,
                    count: (data || []).filter((r) =>
                      t.key === 'all'
                        ? true
                        : t.key === 'pending'
                          ? ['pending', 'clarify'].includes(r.status)
                          : r.status === t.key
                    ).length,
                  }))
                : moderationTabs
            }
            value={tab}
            onChange={(k) => {
              setTab(k);
              setPage(1);
            }}
          />
        }
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyText="Tidak ada konten pada status ini."
        pager={{
          info: (
            <>
              Menampilkan <strong>{rows.length}</strong> dari <strong>{USE_API ? (data || []).length : 28}</strong>{' '}
              konten
            </>
          ),
          page,
          pages: USE_API ? [1] : [1, 2, 3],
          last: USE_API ? undefined : 6,
          onChange: setPage,
        }}
      />
    </div>
  );
}
