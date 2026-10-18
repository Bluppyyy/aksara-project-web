import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import Icon from '../components/Icon/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { initials } from '../services/adapters';
import styles from './KomunitasPage.module.css';
import avatarMe from '../assets/komunitas/avatar-me.jpg';
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

const PREFS = [
  { label: 'Basis Data (CSG2H3)', color: '#0f4c81' },
  { label: 'Pemrograman Berorientasi Objek (CSG2J3)', color: '#0f4c81' },
  { label: 'Kecerdasan Buatan (CSI2A3)', color: '#7a3617' },
  { label: 'Sistem Terdistribusi (CSG3B3)', color: '#7ab7fe' },
];

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
  file: withFile ? { title: 'Laporan Praktikum Basis Data: Modul 3 - Optimasi Query & Indeksasi B-Tree', code: 'CSG2H3', pages: '32 Halaman', size: '4.8 MB', link: '/resource/1' } : null,
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
  { no: '01', title: 'Panduan Tugas Akhir & Template LaTeX 2024', by: 'Tim TA Tel-U', rating: '4.9', views: '2.4k views', link: '/resource/1' },
  { no: '02', title: 'Cheatsheet Algoritma Dijkstra & Bellman-Ford', by: 'Fajar Alfian', rating: '4.8', views: '1.8k views', link: '/resource/2' },
  { no: '03', title: 'Kompilasi Soal Seleksi Asisten Lab Praktikum 2024', by: 'Lab Daspro FIF', rating: '4.9', views: '1.5k views', link: '/resource/3' },
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

/**
 * Beranda mahasiswa setelah login (frame Figma "Page / Aktivitas Komunitas").
 * Data masih contoh; posting baru hanya tersimpan di tampilan (belum ada endpoint feed di backend).
 */
export default function KomunitasPage() {
  const user = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [feed, setFeed] = useState(INITIAL_FEED);
  const [draft, setDraft] = useState('');
  const [prefs, setPrefs] = useState(PREFS);
  const [prefInput, setPrefInput] = useState('');
  const [addingPref, setAddingPref] = useState(false);
  const [followed, setFollowed] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState('');

  const name = user?.nama || 'Zulfan Falah';
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
    setFeed((f) => [
      { id: Date.now(), type: 'status', mine: true, author: name, avatar: user ? null : avatarMe, action: 'membagikan status', time: 'Baru saja', text, likes: 0, comments: 0, saves: 0, liked: false, saved: false },
      ...f,
    ]);
    setDraft('');
    notify('Status dibagikan ke komunitas.');
  };

  const addPref = (e) => {
    e.preventDefault();
    const v = prefInput.trim();
    if (v) setPrefs((p) => [...p, { label: v, color: '#1261a2' }]);
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
                <Avatar src={avatarMe} name={name} size={64} />
                <span className={styles.verified}>
                  <Icon icon="lucide:badge-check" size={12} />
                </span>
              </div>
              <strong>{name}</strong>
              <span>FiF ‘24 • S1 Rekayasa Perangkat Lunak</span>
              <div className={styles.stats}>
                <Link to="/koleksi">
                  <b>14</b>
                  Disimpan
                </Link>
                <Link to="/unggah">
                  <b>4</b>
                  Kontribusi
                </Link>
                <span>
                  <b className={styles.rep}>248</b>
                  Reputasi
                </span>
              </div>
              <Link to="/unggah" className={styles.primaryBtn}>
                Kontribusi Anda
              </Link>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2>Preferensi Anda</h2>
              <Icon icon="lucide:graduation-cap" size={18} color="#0f4c81" />
            </div>
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
                <input autoFocus value={prefInput} onChange={(e) => setPrefInput(e.target.value)} placeholder="Nama mata kuliah…" aria-label="Preferensi baru" />
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
            <div className={styles.composerTop}>
              <Avatar src={avatarMe} name={name} size={40} />
              <label className={styles.composerInput}>
                <span className="visually-hidden">Bagikan status</span>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Bagikan yang ada dipikiranmu..." maxLength={280} />
                <button type="submit" aria-label="Kirim" disabled={draft.trim().length < 3}>
                  <Icon icon="lucide:send-horizontal" size={16} />
                </button>
              </label>
            </div>
            <div className={styles.composerActions}>
              <Link to="/unggah" className={styles.attachBlue}>
                <Icon icon="lucide:file-up" size={15} />
                Unggah File
              </Link>
              <Link to="/wawasan/tulis" className={styles.attachOrange}>
                <Icon icon="lucide:paperclip" size={15} />
                Attach Kontribusimu
              </Link>
            </div>
          </form>

          <div className={styles.tabs} role="tablist" aria-label="Filter aktivitas">
            {TABS.map((t) => (
              <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`${styles.tab} ${tab === t.key ? styles.tabOn : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {visible.length === 0 && <p className={styles.empty}>Belum ada aktivitas di tab ini.</p>}

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
                  <button type="button" className={styles.more} aria-label="Opsi lainnya" aria-expanded={openMenu === p.id} onClick={() => setOpenMenu((m) => (m === p.id ? null : p.id))}>
                    <Icon icon="lucide:ellipsis" size={18} />
                  </button>
                  {openMenu === p.id && (
                    <div className={styles.menu} role="menu">
                      <button type="button" role="menuitem" onClick={() => { setOpenMenu(null); share(p); }}>
                        <Icon icon="lucide:link" size={14} /> Salin tautan
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.danger}
                        onClick={() => {
                          setOpenMenu(null);
                          notify('Laporan terkirim. Admin akan meninjau konten ini.');
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
                      <Link key={t} to={`/eksplorasi/hasil?q=${encodeURIComponent(t.slice(1))}`} className={styles.hashtag}>
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
                    <b>PDF</b>
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
                <div>
                  <button
                    type="button"
                    aria-pressed={p.liked}
                    className={p.liked ? styles.on : ''}
                    onClick={() => update(p.id, (x) => ({ ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }))}
                  >
                    <Icon icon={p.type === 'wawasan' ? 'lucide:heart' : 'lucide:thumbs-up'} size={16} fill={p.liked ? 'currentColor' : undefined} />
                    {p.likes}
                  </button>
                  <button type="button" onClick={() => (p.link ? navigate(p.link) : notify('Kolom komentar segera hadir.'))}>
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
            <ol className={styles.popular}>
              {POPULAR.map((p) => (
                <li key={p.no}>
                  <span className={styles.no}>{p.no}</span>
                  <Link to={p.link}>
                    <strong>{p.title}</strong>
                    <span>
                      {p.by} • <b>★{p.rating}</b> • {p.views}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2>
                <Icon icon="lucide:trophy" size={16} color="#0f4c81" />
                Top Kontributor Bulan Ini
              </h2>
            </div>
            <ul className={styles.top}>
              {TOP.map((t) => {
                const on = followed.includes(t.name);
                return (
                  <li key={t.name}>
                    <span className={styles.topAvatar}>
                      <img src={t.avatar} alt="" />
                      <b className={t.rank === 3 ? styles.bronze : ''}>{t.rank}</b>
                    </span>
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.meta}</span>
                    </div>
                    <button
                      type="button"
                      className={on ? styles.followOn : ''}
                      aria-pressed={on}
                      aria-label={on ? `Berhenti mengikuti ${t.name}` : `Ikuti ${t.name}`}
                      onClick={() => setFollowed((f) => (on ? f.filter((x) => x !== t.name) : [...f, t.name]))}
                    >
                      <Icon icon={on ? 'lucide:user-check' : 'lucide:user-plus'} size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
            <Link to="/wawasan" className={styles.smallLink}>
              Jelajahi Papan Peringkat Reputasi →
            </Link>
          </section>

          <nav className={styles.mini} aria-label="Tautan bantuan">
            <a href="#">Pedoman Repositori</a> • <a href="#">Integritas Akademik</a> • <a href="#">Hak Cipta &amp; Turnitin</a> • <a href="#">Bantuan AKSARA</a>
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
