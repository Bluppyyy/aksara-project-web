import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import Icon from '../components/Icon/Icon.jsx';
import { useAuth } from '../context/useAuth';
import { initials } from '../services/adapters';
import { USE_API } from '../services/api';
import { listResources, listBookmarks, setBookmark } from '../services/resources';
import { listArticles } from '../services/insights';
import useAsync from '../hooks/useAsync';
import styles from './CommunityPage.module.css';
import avatarRina from '../assets/komunitas/avatar-rina.jpg';
import avatarAndi from '../assets/komunitas/avatar-andi.jpg';
import avatarSiti from '../assets/komunitas/avatar-siti.jpg';
import avatarReza from '../assets/komunitas/avatar-reza.jpg';
import avatarDaffa from '../assets/komunitas/avatar-daffa.jpg';
import sampulIisma from '../assets/komunitas/sampul-iisma.jpg';

const TABS = [
  { key: 'all', label: 'Semua Aktivitas' },
  { key: 'wawasan', label: 'Wawasan' },
  { key: 'resource', label: 'Eksplorasi' },
  { key: 'following', label: 'Yang Anda Ikuti' },
];

const PREF_COLORS = ['#0f4c81', '#1261a2', '#7a3617', '#7ab7fe'];

const IISMA = {
  type: 'wawasan',
  author: 'Rina Melati',
  avatar: avatarRina,
  action: 'membagikan wawasan baru',
  time: '5 jam lalu',
  title: 'Pengalaman Lolos IISMA 2025: Strategi Esai, TOEFL ITP 600+, & Tips Wawancara Kebangsaan',
  text: 'Banyak rekan-rekan yang bertanya bagaimana cara merumuskan personal statement yang tidak klise dan menonjolkan kontribusi nyata untuk Indonesia pasca-kembali dari studi luar negeri. Berikut kompilasi draft teruji, matriks persiapan 3 bulan, dan template bank pertanyaan wawancara yang saya terapkan...',
  image: sampulIisma,
  imageLabel: 'Panduan Studi Global • 8 Menit Baca',
  tags: ['#IISMA2025', '#ScholarshipTips', '#TelkomGlobal'],
  likes: 84,
  comments: 19,
  saves: 42,
  following: true,
  link: '/wawasan/1',
};

const ANDI_TEXT =
  'Baru selesai menyusun laporan praktikum modul 3 query optimization & normalisasi database PostgreSQL. Semoga bermanfaat buat rekan-rekan yang ambil lab minggu ini! Disertai skrip SQL benchmarking.';
const ANDI = (withFile) => ({
  type: 'resource',
  author: 'Andi Pratama',
  avatar: avatarAndi,
  action: 'mengunggah resource baru',
  time: '2 jam lalu',
  text: ANDI_TEXT,
  file: withFile
    ? {
        title: 'Laporan Praktikum Basis Data: Modul 3 - Optimasi Query & Indeksasi B-Tree',
        code: 'CSG2H3',
        pages: '32 Halaman',
        size: '4.8 MB',
        link: '/resource/1',
      }
    : null,
  likes: 28,
  comments: 7,
  saves: 12,
});

// Urutan feed sesuai Figma
const INITIAL_FEED = [IISMA, ANDI(true), ANDI(true), ANDI(false), IISMA, ANDI(true), ANDI(false)].map((p, i) => ({
  ...p,
  id: i + 1,
  liked: false,
  saved: false,
}));

const POPULAR = [
  {
    no: '01',
    title: 'Panduan Tugas Akhir & Template LaTeX 2024',
    by: 'Tim TA Tel-U',
    rating: '4.9',
    views: '2.4k views',
    link: '/resource/1',
  },
  {
    no: '02',
    title: 'Cheatsheet Algoritma Dijkstra & Bellman-Ford',
    by: 'Fajar Alfian',
    rating: '4.8',
    views: '1.8k views',
    link: '/resource/2',
  },
  {
    no: '03',
    title: 'Kompilasi Soal Seleksi Asisten Lab Praktikum 2024',
    by: 'Lab Daspro FIF',
    rating: '4.9',
    views: '1.5k views',
    link: '/resource/3',
  },
];

const TOP = [
  { rank: 1, name: 'Siti Putri', meta: '18 resource • 1.4k apresiasi', avatar: avatarSiti },
  { rank: 2, name: 'Reza Kurniawan', meta: '14 resource • 980 apresiasi', avatar: avatarReza },
  { rank: 3, name: 'Daffa Rizky', meta: '12 resource • 840 apresiasi', avatar: avatarDaffa },
];

function Avatar({ src, name, size = 44 }) {
  return src ? (
    <img src={src} alt="" className={styles.avatar} style={{ width: size, height: size }} />
  ) : (
    <span className={styles.avatarText} style={{ width: size, height: size }}>
      {initials(name)}
    </span>
  );
}

/** "5 menit lalu", "2 jam lalu", "3 hari lalu", lalu tanggal */
function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Baru saja';
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const GENERIC_NAMES = ['Kontributor AKSARA', 'Mahasiswa FIF'];

/** Mode API: feed disusun dari resource yang sudah disetujui + tulisan wawasan (selang-seling, terbaru dulu) */
function buildFeed(resources, articles) {
  const res = [...resources]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .map((r) => ({
      id: `r-${r.id}`,
      type: 'resource',
      resourceId: r.id,
      author: r.author?.name || 'Kontributor AKSARA',
      avatar: null,
      action: 'mengunggah resource baru',
      time: timeAgo(r.createdAt),
      text: r.description,
      link: `/resource/${r.id}`,
      file: {
        title: r.title,
        code: r.course,
        pages: r.categoryLabel || 'Resource Akademik',
        size: r.format || 'Dokumen',
        format: r.format || 'FILE',
        link: `/resource/${r.id}`,
      },
      saved: Boolean(r.bookmarked),
    }));
  const art = articles.map((a) => ({
    id: `w-${a.id}`,
    type: 'wawasan',
    author: a.author?.name || 'Mahasiswa FIF',
    avatar: null,
    action: 'membagikan wawasan',
    time: a.date || '',
    title: a.title,
    text: a.excerpt,
    image: a.image,
    imageLabel: [a.category, a.readTime].filter(Boolean).join(' • '),
    tags: (a.tags || []).map((t) => `#${t}`),
    link: `/wawasan/${a.id}`,
  }));
  const out = [];
  for (let i = 0; i < Math.max(res.length, art.length); i += 1) {
    if (res[i]) out.push(res[i]);
    if (art[i]) out.push(art[i]);
  }
  return out;
}

/**
 * Beranda mahasiswa setelah login (frame Figma "Page / Aktivitas Komunitas").
 * Mode API: feed, Populer, dan Top Kontributor diisi dari resource & wawasan asli (GET /resource-relevan, GET /experience).
 * Bagian yang belum punya data di backend (suka, komentar, reputasi, ikuti) disembunyikan.
 * Mode demo: data contoh sesuai Figma.
 */
export default function CommunityPage() {
  const user = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [feed, setFeed] = useState(USE_API ? [] : INITIAL_FEED);
  const { data: live, loading: liveLoading } = useAsync(
    () =>
      USE_API
        ? Promise.all([
            listResources().catch(() => []),
            listArticles().catch(() => []),
            listBookmarks().catch(() => []),
          ])
        : Promise.resolve(null),
    []
  );
  const [liveResources, liveArticles, liveBookmarks] = live || [[], [], []];
  // Kontribusi = resource + wawasan milik user ini yang sudah disetujui admin
  const isMine = (x) => (user?.id && x.ownerId === user.id) || (user?.nim && x.ownerNim === user.nim);
  const contributions = liveResources.filter(isMine).length + liveArticles.filter(isMine).length;
  useEffect(() => {
    if (live) setFeed(buildFeed(live[0], live[1]));
  }, [live]);

  // Populer: rating tertinggi. Top Kontributor: jumlah resource per pengunggah (hanya kalau backend mengirim nama)
  const popular = USE_API
    ? [...liveResources]
        .filter((r) => r.rating !== '–')
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, 3)
        .map((r, i) => ({
          no: String(i + 1).padStart(2, '0'),
          title: r.title,
          by: r.author?.name,
          rating: r.rating,
          views: r.categoryLabel || r.course,
          link: `/resource/${r.id}`,
        }))
    : POPULAR;
  const top = USE_API
    ? Object.entries(
        liveResources.reduce((acc, r) => {
          const n = r.author?.name;
          if (n && !GENERIC_NAMES.includes(n)) acc[n] = (acc[n] || 0) + 1;
          return acc;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, n], i) => ({ rank: i + 1, name, meta: `${n} resource`, avatar: null }))
    : TOP;
  const [draft, setDraft] = useState('');
  // Preferensi diambil dari minat saat registrasi; akun baru mulai kosong
  const [prefs, setPrefs] = useState(() =>
    (user?.minat || []).map((label, i) => ({ label, color: PREF_COLORS[i % PREF_COLORS.length] }))
  );
  const [prefInput, setPrefInput] = useState('');
  const [addingPref, setAddingPref] = useState(false);
  const [followed, setFollowed] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState('');

  const name = user?.nama || user?.email?.split('@')[0] || 'Mahasiswa';
  const akademik = [user?.fakultas?.match(/\((\w+)\)/)?.[1], user?.angkatan && `‘${String(user.angkatan).slice(-2)}`]
    .filter(Boolean)
    .join(' ');
  const profilLine = [akademik, user?.prodi].filter(Boolean).join(' • ') || 'Mahasiswa Telkom University';
  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2500);
  };

  const visible = useMemo(() => {
    if (tab === 'wawasan') return feed.filter((p) => p.type === 'wawasan');
    if (tab === 'resource') return feed.filter((p) => p.type === 'resource');
    if (tab === 'following') return feed.filter((p) => p.following || p.mine);
    return feed;
  }, [feed, tab]);

  const update = (id, fn) => setFeed((f) => f.map((p) => (p.id === id ? fn(p) : p)));

  const post = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (text.length < 3) return;
    // Mode API: belum ada endpoint status → tulisan dilanjutkan di halaman Tulis Wawasan (POST /experience)
    if (USE_API) {
      navigate('/wawasan/tulis', { state: { content: text } });
      return;
    }
    setFeed((f) => [
      {
        id: Date.now(),
        type: 'status',
        mine: true,
        author: name,
        avatar: null,
        action: 'membagikan status',
        time: 'Baru saja',
        text,
        likes: 0,
        comments: 0,
        saves: 0,
        liked: false,
        saved: false,
      },
      ...f,
    ]);
    setDraft('');
    notify('Status dibagikan ke komunitas.');
  };

  const addPref = (e) => {
    e.preventDefault();
    const v = prefInput.trim();
    if (v)
      setPrefs((p) =>
        p.some((x) => x.label === v) ? p : [...p, { label: v, color: PREF_COLORS[p.length % PREF_COLORS.length] }]
      );
    setPrefInput('');
    setAddingPref(false);
  };

  const share = async (p) => {
    const url = `${window.location.origin}${p.link || p.file?.link || '/'}`;
    try {
      await navigator.clipboard.writeText(url);
      notify('Tautan disalin.');
    } catch {
      notify(url);
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.layout}>
        {/* ---------- Kolom kiri ---------- */}
        <aside className={styles.left}>
          <section className={styles.profile}>
            <div className={styles.cover} />
            <div className={styles.profileBody}>
              <div className={styles.profilePhoto}>
                <Avatar name={name} size={64} />
                <span className={styles.verified}>
                  <Icon icon="lucide:badge-check" size={12} />
                </span>
              </div>
              <strong>{name}</strong>
              <span>{profilLine}</span>
              <div className={styles.stats}>
                <Link to="/koleksi">
                  <b>{USE_API ? liveBookmarks.length : 0}</b>
                  Disimpan
                </Link>
                <span title="Resource & wawasan kamu yang sudah disetujui admin">
                  <b>{USE_API ? contributions : 0}</b>
                  Kontribusi
                </span>
                {/* Reputasi belum ada datanya di backend → hanya tampil di mode demo */}
                {!USE_API && (
                  <span>
                    <b className={styles.rep}>0</b>
                    Reputasi
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2>Preferensi Anda</h2>
              <Icon icon="lucide:graduation-cap" size={18} color="#0f4c81" />
            </div>
            {prefs.length === 0 && (
              <p className={styles.prefEmpty}>Belum ada preferensi. Tambahkan mata kuliah yang ingin Anda ikuti.</p>
            )}
            <ul className={styles.prefs}>
              {prefs.map((p) => (
                <li key={p.label}>
                  <Link to={`/eksplorasi/hasil?q=${encodeURIComponent(p.label.replace(/\s*\(.*\)/, ''))}`}>
                    <span style={{ background: p.color }} />
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
            {addingPref ? (
              <form onSubmit={addPref} className={styles.prefForm}>
                <input
                  autoFocus
                  value={prefInput}
                  onChange={(e) => setPrefInput(e.target.value)}
                  placeholder="Nama mata kuliah…"
                  aria-label="Preferensi baru"
                />
                <button type="submit">Tambah</button>
              </form>
            ) : (
              <button type="button" className={styles.linkBtn} onClick={() => setAddingPref(true)}>
                <Icon icon="lucide:plus" size={12} />
                Tambah Preferensi
              </button>
            )}
          </section>
        </aside>

        {/* ---------- Feed ---------- */}
        <section className={styles.feed} aria-label="Aktivitas komunitas">
          <form className={styles.composer} onSubmit={post}>
            {/* Mode API: tulisan diteruskan ke halaman Tulis Wawasan (lihat post()) */}
            <div className={styles.composerTop}>
              <Avatar name={name} size={40} />
              <label className={styles.composerInput}>
                <span className="visually-hidden">Bagikan yang ada dipikiranmu</span>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Bagikan yang ada dipikiranmu..."
                  maxLength={280}
                />
                <button
                  type="submit"
                  aria-label={USE_API ? 'Lanjutkan menulis wawasan' : 'Kirim'}
                  disabled={draft.trim().length < 3}
                >
                  <EditNoteIcon />
                </button>
              </label>
            </div>
            <div className={styles.composerActions}>
              <Link to="/unggah" className={styles.attachBlue}>
                <PdfStackIcon />
                Unggah File
              </Link>
              <Link to="/wawasan/tulis" className={styles.attachOrange}>
                <AttachBoxIcon />
                Attach Kontribusimu
              </Link>
            </div>
          </form>

          <div className={styles.tabs} role="tablist" aria-label="Filter aktivitas">
            {TABS.filter((t) => !(USE_API && t.key === 'following')).map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`${styles.tab} ${tab === t.key ? styles.tabOn : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {USE_API && liveLoading && <p className={styles.empty}>Memuat aktivitas…</p>}
          {!(USE_API && liveLoading) && visible.length === 0 && (
            <p className={styles.empty}>Belum ada aktivitas di tab ini.</p>
          )}

          {visible.map((p) => (
            <article key={p.id} className={styles.post}>
              <header className={styles.postHead}>
                <Avatar src={p.avatar} name={p.author} />
                <div>
                  <p>
                    <strong>{p.author}</strong> <span>{p.action}</span>
                  </p>
                  <time>{p.time}</time>
                </div>
                <div className={styles.menuWrap}>
                  <button
                    type="button"
                    className={styles.more}
                    aria-label="Opsi lainnya"
                    aria-expanded={openMenu === p.id}
                    onClick={() => setOpenMenu((m) => (m === p.id ? null : p.id))}
                  >
                    <Icon icon="lucide:ellipsis" size={18} />
                  </button>
                  {openMenu === p.id && (
                    <div className={styles.menu} role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenMenu(null);
                          share(p);
                        }}
                      >
                        <Icon icon="lucide:link" size={14} /> Salin tautan
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.danger}
                        onClick={() => {
                          setOpenMenu(null);
                          // Mode API: laporan dikirim dari halaman detail (form alasan + POST /report)
                          if (USE_API && p.link) navigate(p.link);
                          else notify('Laporan terkirim. Admin akan meninjau konten ini.');
                        }}
                      >
                        <Icon icon="lucide:flag" size={14} /> Laporkan
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {p.title && (
                <h2 className={styles.postTitle}>
                  <Link to={p.link}>{p.title}</Link>
                </h2>
              )}
              <p className={styles.postText}>{p.text}</p>

              {p.image && (
                <Link to={p.link} className={styles.cover2}>
                  <img src={p.image} alt="" />
                  <span>{p.imageLabel}</span>
                </Link>
              )}
              {p.tags && (
                <div className={styles.tagRow}>
                  <div>
                    {p.tags.map((t) => (
                      <Link
                        key={t}
                        to={`/eksplorasi/hasil?q=${encodeURIComponent(t.slice(1))}`}
                        className={styles.hashtag}
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                  <Link to={p.link} className={styles.readMore}>
                    Baca selengkapnya <Icon icon="lucide:arrow-right" size={14} />
                  </Link>
                </div>
              )}
              {p.file && (
                <div className={styles.file}>
                  <span className={styles.pdf}>
                    <Icon icon="lucide:file" size={26} />
                    <b>{p.file.format || 'PDF'}</b>
                  </span>
                  <div>
                    <strong>{p.file.title}</strong>
                    <span>
                      <em>{p.file.code}</em> {p.file.pages} • {p.file.size}
                    </span>
                  </div>
                  <button type="button" onClick={() => navigate(p.file.link)} className={styles.view}>
                    Lihat
                  </button>
                </div>
              )}

              <footer className={styles.postFoot}>
                {USE_API ? (
                  <div>
                    {/* Suka & komentar belum ada di backend; simpan = bookmark asli */}
                    {p.type === 'resource' && (
                      <button
                        type="button"
                        aria-pressed={p.saved}
                        className={p.saved ? styles.on : ''}
                        onClick={async () => {
                          const next = !p.saved;
                          update(p.id, (x) => ({ ...x, saved: next }));
                          try {
                            await setBookmark(p.resourceId, next);
                            notify(next ? 'Disimpan ke Koleksi Saya.' : 'Dihapus dari koleksi.');
                          } catch (err) {
                            update(p.id, (x) => ({ ...x, saved: !next }));
                            notify(err.message || 'Gagal menyimpan.');
                          }
                        }}
                      >
                        <Icon icon="lucide:bookmark-plus" size={16} fill={p.saved ? 'currentColor' : undefined} />
                        {p.saved ? 'Tersimpan' : 'Simpan'}
                      </button>
                    )}
                    <button type="button" onClick={() => navigate(p.link)}>
                      <Icon icon="lucide:arrow-up-right" size={16} />
                      Buka
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      aria-pressed={p.liked}
                      className={p.liked ? styles.on : ''}
                      onClick={() =>
                        update(p.id, (x) => ({ ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }))
                      }
                    >
                      <Icon
                        icon={p.type === 'wawasan' ? 'lucide:heart' : 'lucide:thumbs-up'}
                        size={16}
                        fill={p.liked ? 'currentColor' : undefined}
                      />
                      {p.likes}
                    </button>
                    <button
                      type="button"
                      onClick={() => (p.link ? navigate(p.link) : notify('Kolom komentar segera hadir.'))}
                    >
                      <Icon icon="lucide:message-square" size={16} />
                      {p.comments}
                    </button>
                    <button
                      type="button"
                      aria-pressed={p.saved}
                      className={p.saved ? styles.on : ''}
                      onClick={() => {
                        update(p.id, (x) => ({ ...x, saved: !x.saved, saves: x.saves + (x.saved ? -1 : 1) }));
                        notify(p.saved ? 'Dihapus dari koleksi.' : 'Disimpan ke Koleksi Saya.');
                      }}
                    >
                      <Icon icon="lucide:bookmark-plus" size={16} fill={p.saved ? 'currentColor' : undefined} />
                      {p.saves}
                    </button>
                  </div>
                )}
                <button type="button" aria-label="Bagikan" onClick={() => share(p)}>
                  <Icon icon="lucide:share-2" size={16} />
                </button>
              </footer>
            </article>
          ))}
        </section>

        {/* ---------- Kolom kanan ---------- */}
        <aside className={styles.right}>
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2>
                <Icon icon="lucide:flame" size={18} color="#0f4c81" />
                Populer Minggu Ini
              </h2>
              <Link to="/eksplorasi/hasil?urut=populer" className={styles.smallLink}>
                Lihat Tren
              </Link>
            </div>
            {popular.length === 0 && <p className={styles.prefEmpty}>Belum ada resource yang dinilai.</p>}
            <ol className={styles.popular}>
              {popular.map((p) => (
                <li key={p.no}>
                  <span className={styles.no}>{p.no}</span>
                  <Link to={p.link}>
                    <strong>{p.title}</strong>
                    <span>
                      {p.by && <>{p.by} • </>}
                      <b>★{p.rating}</b>
                      {p.views && <> • {p.views}</>}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {top.length > 0 && (
            <section className={styles.card}>
              <div className={styles.cardHead}>
                <h2>
                  <Icon icon="lucide:trophy" size={16} color="#0f4c81" />
                  Top Kontributor Bulan Ini
                </h2>
              </div>
              <ul className={styles.top}>
                {top.map((t) => {
                  const on = followed.includes(t.name);
                  return (
                    <li key={t.name}>
                      <span className={styles.topAvatar}>
                        {t.avatar ? <img src={t.avatar} alt="" /> : <Avatar name={t.name} size={40} />}
                        <b className={t.rank === 3 ? styles.bronze : ''}>{t.rank}</b>
                      </span>
                      <div>
                        <strong>{t.name}</strong>
                        <span>{t.meta}</span>
                      </div>
                      {!USE_API && (
                        <button
                          type="button"
                          className={on ? styles.followOn : ''}
                          aria-pressed={on}
                          aria-label={on ? `Berhenti mengikuti ${t.name}` : `Ikuti ${t.name}`}
                          onClick={() => setFollowed((f) => (on ? f.filter((x) => x !== t.name) : [...f, t.name]))}
                        >
                          <Icon icon={on ? 'lucide:user-check' : 'lucide:user-plus'} size={16} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              {!USE_API && (
                <Link to="/wawasan" className={styles.smallLink}>
                  Jelajahi Papan Peringkat Reputasi →
                </Link>
              )}
            </section>
          )}

          <nav className={styles.mini} aria-label="Tautan bantuan">
            <a href="#">Pedoman Repositori</a> • <a href="#">Integritas Akademik</a> •{' '}
            <a href="#">Hak Cipta &amp; Orisinalitas</a> • <a href="#">Bantuan AKSARA</a>
            <p>
              <Icon icon="lucide:badge-check" size={12} />
              Open Access Telkom University © 2025
            </p>
          </nav>
        </aside>
      </main>
      {toast && (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      )}
      <Footer />
    </div>
  );
}

// Ikon composer sesuai Figma (Beranda mahasiswa)
function EditNoteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 10h11v2H3v-2zm0-2h11V6H3v2zm0 8h7v-2H3v2zm15.01-3.13.71-.71a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1 0 1.41l-.71.71-2.12-2.12zm-.71.71-5.3 5.3V21h2.12l5.3-5.3-2.12-2.12z" />
    </svg>
  );
}

function PdfStackIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="7" y="2.5" width="14.5" height="14.5" rx="2" />
      <path d="M3 7v12a2 2 0 0 0 2 2h12" />
      <text
        x="14.25"
        y="12.3"
        textAnchor="middle"
        fontSize="5.6"
        fontWeight="800"
        fill="currentColor"
        stroke="none"
        fontFamily="Arial, sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}

function AttachBoxIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8" />
      <path d="m17 4-7.5 7.5a1.77 1.77 0 0 0 2.5 2.5L19.5 6.5a3.18 3.18 0 0 0-4.5-4.5L7.5 9.5a4.6 4.6 0 0 0 6.5 6.5L19 11" />
    </svg>
  );
}
