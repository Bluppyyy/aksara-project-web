import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import useAsync from '../../hooks/useAsync';
import { listAdminResources, updateResourceStatus } from '../../services/admin';
import { resourceStats } from '../../data/admin';
import ui from './admin.module.css';
import styles from './AdminResources.module.css';
import { StatusBadge, useToast, AdminPager } from './shared.jsx';

const CATEGORY_OPTIONS = ['Semua Kategori', 'Laporan Proyek', 'Tugas Akhir', 'Source Code', 'Jurnal & Data', 'Catatan Kuliah', 'Materi Kuliah'];
const PRODI_OPTIONS = ['Semua Program Studi', 'S1 Informatika', 'S1 Rekayasa PL', 'S1 Sains Data', 'S1 Teknologi Inf.'];
const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu Review' },
  { value: 'approved', label: 'Dipublikasikan' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'hidden', label: 'Disembunyikan' },
];
const SORTS = ['Terbaru', 'Terlama', 'Judul A-Z'];

const TONE_BOX = { primary: styles.boxPrimary, warn: styles.boxWarn, danger: styles.boxDanger };
const TONE_TEXT = { primary: styles.txtPrimary, warn: styles.txtWarn, danger: styles.txtDanger };

function Select({ label, value, onChange, options }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <span className={ui.select}>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
        <Icon icon="lucide:chevron-down" size={16} />
      </span>
    </label>
  );
}

export default function AdminResources() {
  const { data, loading, error, reload, setData } = useAsync(listAdminResources, []);
  const [toast, notify] = useToast();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [prodi, setProdi] = useState(PRODI_OPTIONS[0]);
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState(SORTS[0]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    let list = data || [];
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((r) => [r.title, r.course, r.code, r.author].join(' ').toLowerCase().includes(term));
    if (category !== CATEGORY_OPTIONS[0]) list = list.filter((r) => r.category === category);
    if (prodi !== PRODI_OPTIONS[0]) list = list.filter((r) => r.prodi === prodi);
    if (status !== 'all') list = list.filter((r) => r.status === status);
    if (sort === 'Terlama') list = [...list].reverse();
    if (sort === 'Judul A-Z') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [data, q, category, prodi, status, sort]);

  const activeFilters = [
    status !== 'all' && { key: 'status', label: `Status: ${STATUS_OPTIONS.find((s) => s.value === status).label}`, clear: () => setStatus('all') },
    category !== CATEGORY_OPTIONS[0] && { key: 'cat', label: `Kategori: ${category}`, clear: () => setCategory(CATEGORY_OPTIONS[0]) },
    prodi !== PRODI_OPTIONS[0] && { key: 'prodi', label: `Prodi: ${prodi}`, clear: () => setProdi(PRODI_OPTIONS[0]) },
    { key: 'tahun', label: 'Tahun Akademik: 2024/2025', clear: null },
  ].filter(Boolean);

  const clearAll = () => {
    setQ('');
    setCategory(CATEGORY_OPTIONS[0]);
    setProdi(PRODI_OPTIONS[0]);
    setStatus('all');
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

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const toggleAll = () => setSelected(allChecked ? [] : rows.map((r) => r.id));
  const toggleOne = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <div className={ui.pageHead}>
        <div className={ui.pageHeadText} style={{ maxWidth: 620 }}>
          <div className={ui.eyebrow}>
            <span className={`${ui.pill} ${styles.pillLight}`}>Tel-U Open Repository System</span>
            <span className={styles.sep}>•</span>
            <span className={styles.live}>
              <span className={styles.liveDot} />
              Sinkronisasi Realtime
            </span>
          </div>
          <h1 className={ui.title}>Kelola Resource Repository</h1>
          <p className={ui.subtitle}>
            Manajemen komprehensif berkas dokumen, source code, dan materi akademik yang diunggah mahasiswa dan dosen
            Universitas Telkom.
          </p>
        </div>
        <div className={ui.headActions}>
          <button type="button" className={`${ui.btn} ${ui.btnWhite} ${styles.bigBtn}`} onClick={() => notify('Rekap CSV sedang disiapkan.')}>
            <Icon icon="lucide:download" size={14} color="#3f5f8e" />
            Export CSV / Rekap
          </button>
          <Link to="/unggah" className={`${ui.btn} ${ui.btnPrimary} ${styles.bigBtn}`}>
            <Icon icon="lucide:circle-plus" size={16} />
            + Tambah Resource Admin
          </Link>
        </div>
      </div>

      <section className={styles.stats}>
        {resourceStats.map((s) => (
          <article key={s.label} className={`${ui.card} ${styles.stat}`}>
            <div>
              <span className={ui.overline}>{s.label}</span>
              <strong className={`${styles.statValue} ${s.tone !== 'primary' ? TONE_TEXT[s.tone] : ''}`}>{s.value}</strong>
              <span className={`${styles.statNote} ${TONE_TEXT[s.tone]}`}>
                <Icon icon={s.noteIcon} size={12} />
                {s.note}
              </span>
            </div>
            <span className={`${styles.statBox} ${TONE_BOX[s.tone]}`}>
              <Icon icon={s.icon} size={20} />
            </span>
          </article>
        ))}
      </section>

      {/* Pencarian & filter */}
      <section className={`${ui.card} ${styles.filters}`}>
        <div className={styles.filterTop}>
          <label className={`${ui.search} ${styles.searchBox}`}>
            <Icon icon="lucide:search" size={18} />
            <span className="visually-hidden">Cari resource</span>
            <input
              type="search"
              placeholder="Cari judul, kata kunci, nama mahasiswa, atau mata kuliah..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <button type="button" className={styles.chipBtn}>
            <Icon icon="lucide:calendar-days" size={15} />1 Okt 2024 - 31 Des 2024
            <Icon icon="lucide:chevron-down" size={12} />
          </button>
          <label className={styles.chipBtn}>
            <Icon icon="lucide:list-filter" size={15} />
            <strong>Urutan:</strong>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutan">
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.refresh} aria-label="Muat ulang data" onClick={reload}>
            <Icon icon="lucide:rotate-cw" size={16} />
          </button>
        </div>
        <div className={styles.filterGrid}>
          <Select label="Kategori Konten" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
          <Select label="Program Studi" value={prodi} onChange={setProdi} options={PRODI_OPTIONS} />
          <Select label="Status Moderasi" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </div>
        <div className={styles.activeRow}>
          <span className={styles.activeLabel}>Filter Aktif:</span>
          {activeFilters.map((f) => (
            <span key={f.key} className={styles.activeChip}>
              {f.label}
              {f.clear && (
                <button type="button" aria-label={`Hapus ${f.label}`} onClick={f.clear}>
                  <Icon icon="lucide:x" size={12} />
                </button>
              )}
            </span>
          ))}
          <button type="button" className={styles.clearAll} onClick={clearAll}>
            Bersihkan Semua
          </button>
        </div>
      </section>

      {/* Tabel resource (FR-ADM-01) */}
      <section className={`${ui.card} ${styles.tableCard}`}>
        <div className={styles.massBar}>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            Pilih Semua Dokumen ({rows.length})
          </label>
          <div className={styles.massActions}>
            <span>Aksi Massal:</span>
            <button
              type="button"
              disabled={!selected.length}
              onClick={() => changeStatus(selected, 'approved', `${selected.length} resource disetujui & dipublikasikan.`)}
            >
              <Icon icon="lucide:circle-check" size={13} />
              Setujui Publikasi
            </button>
            <button
              type="button"
              className={styles.danger}
              disabled={!selected.length}
              onClick={() => changeStatus(selected, 'hidden', `${selected.length} resource diarsipkan.`)}
            >
              <Icon icon="lucide:archive" size={13} />
              Arsipkan
            </button>
          </div>
        </div>

        {loading ? (
          <p className={ui.state}>Memuat resource…</p>
        ) : error ? (
          <p className={ui.state}>
            {error.message} <button type="button" className={styles.clearAll} onClick={reload}>Coba lagi</button>
          </p>
        ) : rows.length === 0 ? (
          <p className={ui.state}>Tidak ada resource yang cocok dengan filter.</p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={`${ui.table} ${styles.table}`}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>#</th>
                  <th>Judul Resource &amp; Mata Kuliah</th>
                  <th>Kontributor &amp; Identitas</th>
                  <th>Kategori</th>
                  <th>Program Studi</th>
                  <th>
                    Tanggal
                    <br />
                    Unggah
                  </th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={selected.includes(r.id) ? styles.rowSelected : ''}>
                    <td>
                      <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)} aria-label={`Pilih ${r.title}`} />
                    </td>
                    <td className={styles.titleCell}>
                      <div className={styles.courseRow}>
                        <span className={styles.code}>{r.code}</span>
                        <span>{r.course}</span>
                      </div>
                      <p className={styles.resTitle}>
                        <Link to={`/resource/${r.id}`}>{r.title}</Link>
                      </p>
                      {r.rejectReason ? (
                        <p className={styles.reject}>
                          <Icon icon="lucide:circle-alert" size={12} />
                          {r.rejectReason}
                        </p>
                      ) : r.hiddenNote ? (
                        <p className={styles.hiddenNote}>
                          <Icon icon="lucide:eye-off" size={12} />
                          {r.hiddenNote}
                        </p>
                      ) : (
                        <p className={styles.fileRow}>
                          <span>
                            <Icon icon={r.fileIcon} size={12} />
                            {r.file}
                          </span>
                          {r.warning && (
                            <span className={styles.warning}>
                              <Icon icon="lucide:bell" size={12} />
                              {r.warning}
                            </span>
                          )}
                          {(r.stats || []).map((s) => (
                            <span key={s}>
                              <Icon icon={/pembaca/.test(s) ? 'lucide:eye' : /unduhan/.test(s) ? 'lucide:download' : /DOI/.test(s) ? 'lucide:circle-check' : 'lucide:star'} size={12} />
                              {s}
                            </span>
                          ))}
                        </p>
                      )}
                    </td>
                    <td>
                      <div className={styles.person}>
                        <span className={styles.avatar}>{r.initials}</span>
                        <div>
                          <p className={ui.cellStrong} style={{ fontWeight: 600 }}>{r.author}</p>
                          <p className={`${ui.cellMeta} ${r.idHighlight ? styles.txtPrimary : ''}`}>{r.idLabel}</p>
                          <p className={ui.cellMeta}>{r.cohort}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${ui.badge} ${ui.tonePrimary}`}>{r.category}</span>
                    </td>
                    <td>
                      <p className={ui.cellStrong}>{r.prodi}</p>
                      <p className={ui.cellMeta}>Fakultas Informatika</p>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <p className={ui.cellStrong}>{r.date}</p>
                      <p className={ui.cellMeta}>{r.time}</p>
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link to={`/resource/${r.id}`} className={styles.iconBtn} title="Lihat detail" aria-label={`Lihat ${r.title}`}>
                          <Icon icon="lucide:eye" size={16} />
                        </Link>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.ok}`}
                          title="Setujui & publikasikan"
                          aria-label={`Setujui ${r.title}`}
                          disabled={r.status === 'approved'}
                          onClick={() => changeStatus([r.id], 'approved', `"${r.title}" dipublikasikan.`)}
                        >
                          <Icon icon="lucide:circle-check" size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title="Sembunyikan dari publik"
                          aria-label={`Sembunyikan ${r.title}`}
                          disabled={r.status === 'hidden'}
                          onClick={() => changeStatus([r.id], 'hidden', `"${r.title}" disembunyikan dari publik.`)}
                        >
                          <Icon icon="lucide:eye-off" size={16} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.no}`}
                          title="Tolak"
                          aria-label={`Tolak ${r.title}`}
                          disabled={r.status === 'rejected'}
                          onClick={() => changeStatus([r.id], 'rejected', `"${r.title}" ditolak.`)}
                        >
                          <Icon icon="lucide:circle-x" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.footer}>
          <span>
            Menampilkan <strong>1 - {rows.length}</strong> dari <strong>2.845 data</strong>
            <span className={styles.perPage}>
              Baris per halaman: <span>10</span>
            </span>
          </span>
          <AdminPager page={page} pages={[1, 2, 3]} last={285} onChange={setPage} />
        </div>
      </section>
      {toast}
    </>
  );
}
