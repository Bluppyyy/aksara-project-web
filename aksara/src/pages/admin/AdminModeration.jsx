import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import useAsync from '../../hooks/useAsync';
import { listModeration } from '../../services/admin';
import { moderationTabs } from '../../data/admin';
import ui from './admin.module.css';
import styles from './AdminModeration.module.css';
import { AdminPager } from './shared.jsx';

const STATUS = {
  pending: { label: 'Menunggu Review', tone: ui.toneWarn, dot: true },
  clarify: { label: 'Butuh Klarifikasi', tone: ui.toneWarn, dot: true },
  approved: { label: 'Disetujui', tone: ui.tonePrimary, icon: 'lucide:circle-check' },
  rejected: { label: 'Ditolak', tone: ui.toneDanger, icon: 'lucide:ban' },
  hidden: { label: 'Disembunyikan', tone: ui.toneNeutral, icon: 'lucide:eye-off' },
};

const SOP = [
  { no: '01', title: 'Verifikasi Identitas & Hak Akses', text: 'Pastikan kontributor adalah mahasiswa aktif Telkom University terdaftar SSO dan sesuai dengan program studi terkait.', link: 'Cek Status SSO SSO/iGracias', icon: 'lucide:id-card', tone: 'warn' },
  { no: '02', title: 'Integritas & Keamanan Data', text: 'Pindai berkas dari kredensial tersembunyi (API keys, database password), plagiarisme, serta konten berhak cipta penerbit.', link: 'Scan Kredensial & Similitude', icon: 'lucide:shield-check' },
  { no: '03', title: 'Kelengkapan Metadata', text: 'Abstrak minimal 100 kata dalam Bahasa Indonesia/Inggris baku, format PDF terindeks teks, dan 3–5 kata kunci relevan.', link: 'Standar Dublin Core', icon: 'lucide:list-checks' },
];

/** FR-ADM-05: daftar konten untuk moderasi dasar */
export default function AdminModeration() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(listModeration, []);
  // Default "Semua Konten" supaya 5 contoh di Figma tampil; tab lain benar-benar menyaring status
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
    if (term) list = list.filter((r) => [r.title, r.author, r.tag, r.category].join(' ').toLowerCase().includes(term));
    if (type !== 'all') list = list.filter((r) => r.type === type);
    if (category !== 'all') list = list.filter((r) => r.category === category);
    // Data contoh sudah urut terbaru → "Paling Lama Menunggu" dibalik
    if (sort === 'Paling Lama Menunggu') list = [...list].reverse();
    return list;
  }, [data, tab, q, type, category, sort]);

  const visible = rows;
  const categories = [...new Set((data || []).map((r) => r.category))];

  return (
    <>
      <div className={styles.topRow}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <span>Universitas Telkom</span>/<span>Direktorat Pascasarjana &amp; Riset</span>/<strong>Moderasi Konten</strong>
        </nav>
        <span className={styles.queuePill}>
          <span className={styles.queueDot} />
          12 Antrean Tertunda
          <span>• SLA &lt; 24 Jam</span>
        </span>
      </div>

      <div className={`${ui.pageHead} ${styles.head}`}>
        <div className={ui.pageHeadText}>
          <span className={styles.srs}>FR-ADM-05 Modul Pengawasan Repositori</span>
          <h1 className={ui.title}>Moderasi Konten</h1>
          <p className={ui.subtitle}>
            Tinjau dan kelola konten mahasiswa untuk menjaga kualitas informasi, orisinalitas, dan integritas repositori
            di AKSARA.
          </p>
        </div>
        <div className={styles.kpis}>
          <div className={`${ui.card} ${styles.kpi}`}>
            <span className={styles.kpiIcon}>
              <Icon icon="lucide:badge-check" size={18} />
            </span>
            <div>
              <strong>92.8%</strong>
              <span>Tingkat Kelolosan</span>
            </div>
          </div>
          <div className={`${ui.card} ${styles.kpi}`}>
            <span className={`${styles.kpiIcon} ${styles.kpiWarn}`}>
              <Icon icon="lucide:timer" size={18} />
            </span>
            <div>
              <strong>4.2 Jam</strong>
              <span>Rata-rata Respon</span>
            </div>
          </div>
        </div>
      </div>

      <section className={`${ui.card} ${styles.panel}`}>
        <div className={styles.tabs} role="tablist" aria-label="Status moderasi">
          {moderationTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
            >
              {tab === t.key && <span className={styles.tabDot} />}
              {t.label}
              <span className={`${styles.count} ${t.key === 'rejected' ? styles.countRed : ''}`}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.filters}>
          <label className={`${ui.search} ${styles.search}`}>
            <Icon icon="lucide:search" size={18} />
            <span className="visually-hidden">Cari konten</span>
            <input
              type="search"
              placeholder="Cari judul konten, nama kontributor, atau kata kunci..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <span className={`${ui.select} ${styles.sel}`}>
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Jenis konten">
              <option value="all">Semua Jenis Konten</option>
              <option value="resource">Resource Akademik</option>
              <option value="experience">Pengalaman Mahasiswa</option>
            </select>
            <Icon icon="lucide:chevron-down" size={14} />
          </span>
          <span className={`${ui.select} ${styles.sel} ${styles.selWide}`}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Kategori">
              <option value="all">Semua Kategori (Tugas Akhir, Proyek, …)</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <Icon icon="lucide:chevron-down" size={14} />
          </span>
          <span className={`${ui.select} ${styles.sel}`}>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutan">
              <option>Paling Baru</option>
              <option>Paling Lama Menunggu</option>
            </select>
            <Icon icon="lucide:list-filter" size={14} />
          </span>
        </div>

        {loading ? (
          <p className={ui.state}>Memuat antrean moderasi…</p>
        ) : error ? (
          <p className={ui.state}>
            {error.message}{' '}
            <button type="button" className={styles.link} onClick={reload}>
              Coba lagi
            </button>
          </p>
        ) : visible.length === 0 ? (
          <p className={ui.state}>Tidak ada konten pada status ini.</p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={`${ui.table} ${styles.table}`}>
              <thead>
                <tr>
                  <th>
                    Judul Konten &amp; Tag Mata
                    <br />
                    Kuliah
                  </th>
                  <th>Jenis</th>
                  <th>Kontributor</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const st = STATUS[r.status] || STATUS.pending;
                  const needsReview = ['pending', 'clarify'].includes(r.status);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className={styles.titleCell}>
                          <span className={`${styles.docIcon} ${r.iconTone === 'danger' ? styles.docDanger : ''}`}>
                            <Icon icon={r.icon} size={16} />
                          </span>
                          <div className={styles.titleBody}>
                            <Link to={`/admin/moderasi/${r.id}`} className={styles.title} title={r.title}>
                              {r.title}
                            </Link>
                            {r.flag && (
                              <span className={styles.flag}>
                                <Icon icon="lucide:triangle-alert" size={12} />
                                {r.flag}
                              </span>
                            )}
                            {r.reason && <span className={styles.flag}>{r.reason}</span>}
                            <span className={styles.chip}>{r.file}</span>
                            {r.tag && <span className={styles.tag}>{r.tag}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.type} ${r.type === 'experience' ? styles.typeExp : ''}`}>
                          <Icon icon={r.type === 'experience' ? 'lucide:message-circle-heart' : 'lucide:graduation-cap'} size={13} />
                          {r.type === 'experience' ? 'Pengalaman Mhs' : 'Resource Akademik'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.person}>
                          <strong>{r.author}</strong>
                          {r.nim && <span className={styles.nim}>NIM {r.nim}</span>}
                          <span className={ui.cellMeta}>{r.prodi}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.cat}>
                          <span>{r.category}</span>
                          <span className={ui.cellMeta}>{r.sub}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.date}>
                          <strong>{r.date}</strong>
                          <span className={ui.cellMeta}>{r.time}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${ui.badge} ${ui.badgeRound} ${st.tone} ${styles.status}`}>
                          {st.dot ? <span className={ui.dot} /> : <Icon icon={st.icon} size={12} />}
                          {st.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {needsReview ? (
                          <button type="button" className={`${ui.btn} ${ui.btnSm} ${ui.btnPrimary}`} onClick={() => navigate(`/admin/moderasi/${r.id}`)}>
                            Tinjau {r.status === 'clarify' ? <strong>!</strong> : <Icon icon="lucide:chevron-right" size={13} />}
                          </button>
                        ) : r.status === 'rejected' ? (
                          <button type="button" className={`${ui.btn} ${ui.btnSm} ${ui.btnWhite}`} onClick={() => navigate(`/admin/moderasi/${r.id}`)}>
                            Catatan <Icon icon="lucide:notebook-pen" size={13} />
                          </button>
                        ) : (
                          <button type="button" className={`${ui.btn} ${ui.btnSm} ${ui.btnWhite}`} onClick={() => navigate(`/admin/moderasi/${r.id}`)}>
                            Detail <Icon icon="lucide:eye" size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <AdminPager
          info={
            <>
              Menampilkan <strong>1 - {visible.length}</strong> dari <strong>28</strong> berkas moderasi
            </>
          }
          page={page}
          pages={[1, 2, 3]}
          last={6}
          onChange={setPage}
        />
      </section>

      {/* SOP & bantuan */}
      <section className={styles.bottom}>
        <article className={`${ui.card} ${ui.cardPad}`}>
          <div className={styles.sopHead}>
            <span className={styles.sopIcon}>
              <Icon icon="lucide:gavel" size={16} />
            </span>
            <div>
              <h2 className={ui.cardTitle}>Panduan Ringkas SOP Moderasi Kurator</h2>
              <p className={ui.cardSub}>Standar Verifikasi Mutu Akademik Universitas Telkom 2024</p>
            </div>
            <span className={`${ui.badge} ${ui.tonePrimary}`}>SK Rektor No. 114/2023</span>
          </div>
          <div className={styles.sopGrid}>
            {SOP.map((s) => (
              <div key={s.no} className={styles.sopCard}>
                <span className={`${styles.sopNo} ${s.tone === 'warn' ? styles.sopNoWarn : ''}`}>{s.no}</span>
                <strong>{s.title}</strong>
                <p>{s.text}</p>
                <span className={styles.sopLink}>
                  <Icon icon={s.icon} size={13} />
                  {s.link}
                </span>
              </div>
            ))}
          </div>
          <p className={styles.escalate}>
            <Icon icon="lucide:circle-help" size={13} />
            Ditemukan potensi plagiarisme mayor? Langsung eskalasikan ke Komite Etik Riset Fakultas.
          </p>
          <a href="#" className={styles.download} onClick={(e) => e.preventDefault()}>
            Unduh Panduan PDF Lengkap <Icon icon="lucide:download" size={12} />
          </a>
        </article>

        <article className={`${ui.card} ${ui.cardPad} ${styles.help}`}>
          <div className={styles.helpHead}>
            <span className={styles.helpLogo}>
              <Icon icon="lucide:shield" size={22} />
            </span>
            <div>
              <span className={ui.overline}>Bantuan Kurator</span>
              <h2 className={ui.cardTitle}>Helpdesk Pascasarjana</h2>
            </div>
          </div>
          <p className={styles.helpText}>
            Butuh konfirmasi pembimbing tugas akhir atau persetujuan kaprodi untuk karya inovasi berskala nasional?
          </p>
          <a className={styles.contact} href="mailto:moderasi-aksara@telkomuniversity.ac.id">
            <Icon icon="lucide:mail" size={18} />
            <span>moderasi-aksara@telkomuniversity.ac.id</span>
            <small>Email</small>
          </a>
          <a className={styles.contact} href="tel:+62227564108">
            <Icon icon="lucide:phone" size={18} />
            <span>Ext. 2091 (Gedung Damar Lt. 3)</span>
            <small>Internal</small>
          </a>
          <div className={styles.detector}>
            <span>
              <span className={styles.queueDot} />
              Sistem Deteksi Otomatis
            </span>
            <strong>Aktif v2.4</strong>
          </div>
        </article>
      </section>
    </>
  );
}
