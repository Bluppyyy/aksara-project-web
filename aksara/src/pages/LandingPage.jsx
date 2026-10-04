import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon/Icon.jsx';
import styles from './LandingPage.module.css';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import iconVerified from '../assets/landing/icon-verified.svg';
import sparkleOrange from '../assets/landing/sparkle-orange.svg';
import sparkleBlue from '../assets/landing/sparkle-blue.svg';
import underline from '../assets/landing/underline.svg';
import dotGrid from '../assets/landing/dot-grid.svg';
import handArrow from '../assets/landing/hand-arrow.svg';
import iconSearch from '../assets/landing/icon-search.svg';
import iconSend from '../assets/landing/icon-send.svg';
import iconArrow from '../assets/landing/icon-arrow.svg';
import iconPlusCircle from '../assets/landing/icon-plus-circle.svg';

const POPULAR = [
  { label: 'Laporan Magang', tone: 'blue' },
  { label: 'Laporan Proyek', tone: 'cream' },
  { label: 'Referensi Jaringan', tone: 'cream' },
  { label: 'Soal UTS', tone: 'peach' },
];

const ARCHIVE = [
  { label: 'Tugas & Proyek Kelas', count: '3.4k', icon: 'lucide:book-open' },
  { label: 'Laporan Magang & PKL', count: '1.1k', icon: 'lucide:briefcase' },
  { label: 'Pengalaman Lomba', count: '820', icon: 'lucide:trophy' },
  { label: 'Info Beasiswa', count: '14', icon: 'lucide:graduation-cap' },
];

const STATS = [
  { value: '500+', label: 'Resource Tersedia', tone: 'dark' },
  { value: '1.200+', label: 'Mahasiswa Bergabung', tone: 'blue' },
  { value: '300+', label: 'Pengalaman Dibagikan', tone: 'orange' },
  { value: '100%', label: 'Akses Gratis via SSO Tel-U', tone: 'green' },
];

const CATEGORIES = [
  {
    title: 'Referensi Tugas Kuliah',
    desc: 'Kumpulan template LaTeX Tel-U resmi, panduan sitasi IEEE/APA, dan formulir bebas plagiarisme.',
  },
  {
    title: 'Pengalaman Magang / Kerja',
    desc: 'abcd lorem ipusm abcd lorem ipusm abcd lorem ipusm abcd lorem ipusm abcd lorem ipusm',
  },
  {
    title: 'Panduan Beasiswa',
    desc: 'Lorem piusm Lorem piusm Lorem piusm Lorem piusm Lorem piusm Lorem piusm Lorem piusm',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [hotSaved, setHotSaved] = useState([false, true]);

  const search = (e) => {
    e.preventDefault();
    navigate('/eksplorasi/hasil');
  };

  return (
    <div className={styles.page}>
      <div className={styles.glowTop} aria-hidden="true" />
      <Header />

      <main>
        {/* ===== Hero ===== */}
        <section className={styles.hero}>
          <img src={dotGrid} alt="" className={styles.dotGrid} />
          <div className={styles.heroContent}>
            <div className={styles.heroHeader}>
              <p className={styles.community}>
                12.000+ Mahasiswa &amp; Dosen Tel-U
                <img src={iconVerified} alt="" />
              </p>

              <div className={styles.headlineWrap}>
                <img src={sparkleOrange} alt="" className={styles.sparkleOrange} />
                <img src={sparkleBlue} alt="" className={styles.sparkleBlue} />
                <h1 className={styles.headline}>
                  Satu Tempat untuk Berbagi
                  <br />
                  <span className={`${styles.pill} ${styles.pillOrange}`}>referensi</span>
                  <span className={styles.comma}>,</span>{' '}
                  <span className={`${styles.pill} ${styles.pillBlue}`}>pengalaman</span>
                  <span className={styles.dan}>, dan</span>
                  <br />
                  <span className={styles.inspirasi}>
                    inspirasi
                    <img src={underline} alt="" className={styles.underline} />
                  </span>
                  <span className={styles.dot}>.</span>
                </h1>
              </div>
            </div>

            <p className={styles.subtitle}>
              Temukan referensi tugas, laporan proyek, tips lolos magang, hingga info beasiswa dari sesama
              mahasiswa Telkom University. Berhenti mencari di tempat yang terpencar, temukan semuanya di sini.
            </p>

            <div className={styles.searchArea}>
              <div className={styles.handwrite} aria-hidden="true">
                <span>
                  100% kurasi
                  <br />
                  mahasiswa Tel-U
                </span>
                <img src={handArrow} alt="" />
              </div>

              <form className={styles.search} onSubmit={search} role="search">
                <div className={styles.searchRow}>
                  <img src={iconSearch} alt="" className={styles.searchIcon} />
                  <input
                    type="search"
                    aria-label="Cari resource"
                    placeholder="Cari judul referensi, nama mata kuliah, atau laporan magang..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button type="submit" className={styles.send} aria-label="Cari">
                    <img src={iconSend} alt="" />
                  </button>
                </div>
                <div className={styles.popular}>
                  <span className={styles.popularLabel}>Pencarian Populer:</span>
                  {POPULAR.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      className={`${styles.popularChip} ${styles[p.tone]}`}
                      onClick={() => setQuery(p.label)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            <div className={styles.ctaRow}>
              <Link to="/eksplorasi" className={styles.btnPrimary}>
                Mulai Eksplorasi
                <img src={iconArrow} alt="" />
              </Link>
              <Link to="/unggah" className={styles.btnSecondary}>
                <img src={iconPlusCircle} alt="" />
                Bagikan Pengalaman
              </Link>
            </div>
          </div>
        </section>

        {/* ===== Mockup workspace ===== */}
        <section className={styles.mockupSection}>
          <div className={styles.browser}>
            <div className={styles.browserBar}>
              <div className={styles.browserLeft}>
                <span className={styles.dots}>
                  <i />
                  <i />
                  <i />
                </span>
                <span className={styles.url}>
                  <Icon icon="lucide:lock" size={11} strokeWidth={2.2} />
                  aksara.telkomuniversity.ac.id/workspace
                </span>
              </div>
              <span className={styles.sso}>
                SSO Terhubung <i />
              </span>
            </div>

            <div className={styles.workspace}>
              <aside className={styles.wsAside}>
                <div className={styles.org}>
                  <span className={styles.orgLogo}>TU</span>
                  <div>
                    <p className={styles.orgName}>Telkom University Hub</p>
                    <p className={styles.orgSub}>
                      Semester Ganjil
                      <br />
                      2024/2025
                    </p>
                  </div>
                </div>

                <p className={styles.wsLabel}>KATEGORI ARSIP</p>
                <ul className={styles.archive}>
                  {ARCHIVE.map(({ label, count, icon }, i) => (
                    <li key={label}>
                      <Link to="/eksplorasi" className={`${styles.archiveItem} ${i === 0 ? styles.archiveActive : ''}`}>
                        <span className={styles.archiveName}>
                          <Icon icon={icon} size={15} strokeWidth={1.9} />
                          {label}
                        </span>
                        <span className={styles.archiveCount}>{count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className={styles.note}>
                  <p className={styles.noteTitle}>
                    <Icon icon="lucide:circle-check" size={13} strokeWidth={2} />
                    Kurasi Pekan Ini
                  </p>
                  <p>Semua berkas proposal skripsi &amp; logbook telah diverifikasi lolos cek orisinalitas Turnitin &lt; 15%.</p>
                </div>
              </aside>

              <div className={styles.wsMain}>
                <div className={styles.wsHeader}>
                  <h2>
                    Sedang Hangat Dibicarakan <span className={styles.updated}>Updated</span>
                  </h2>
                  <Link to="/wawasan" className={styles.wsLink}>
                    Lihat Semua
                    <Icon icon="lucide:chevron-right" size={12} strokeWidth={2.4} />
                  </Link>
                </div>

                <article className={styles.doc}>
                  <div className={styles.docTop}>
                    <span>
                      <span className={`${styles.docChip} ${styles.docChipBlue}`}>Informatika</span>
                      <span className={styles.docCat}>• Proyek Kelas</span>
                    </span>
                    <button
                      type="button"
                      className={styles.docSave}
                      aria-pressed={hotSaved[0]}
                      aria-label="Simpan"
                      onClick={() => setHotSaved(([a, b]) => [!a, b])}
                    >
                      <Icon icon="lucide:bookmark" size={15} strokeWidth={2} fill={hotSaved[0] ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <h3 className={styles.docTitle}>
                    Laporan Proyek Akhir: Aplikasi Prediksi Cuaca Berbasis Machine
                    <br />
                    Learning
                  </h3>
                  <p className={styles.docDesc}>
                    Referensi lengkap beserta rancangan database dan UI/UX untuk mata kuliah Pemrogramar Berbasis
                    Objek.
                  </p>
                  <div className={styles.docFooter}>
                    <span className={styles.docMeta}>
                      <strong>Oleh Budi Santoso • Informatika</strong>
                      <span className={styles.docRating}>
                        <Icon icon="lucide:star" size={13} fill="currentColor" strokeWidth={0} /> <b>4.9</b>
                      </span>
                      <span>
                        <Icon icon="lucide:eye" size={14} strokeWidth={1.8} /> 1.2k views
                      </span>
                    </span>
                    <Link to="/resource/iot-aqi" className={styles.docAction}>
                      Buka Berkas <Icon icon="lucide:arrow-right" size={12} strokeWidth={2.4} />
                    </Link>
                  </div>
                </article>

                <article className={styles.doc}>
                  <div className={styles.docTop}>
                    <span>
                      <span className={`${styles.docChip} ${styles.docChipOrange}`}>Pengalaman Magang</span>
                      <span className={styles.docCat}>• Tech &amp; Startup</span>
                    </span>
                    <button
                      type="button"
                      className={styles.docSave}
                      aria-pressed={hotSaved[1]}
                      aria-label="Simpan"
                      onClick={() => setHotSaved(([a, b]) => [a, !b])}
                    >
                      <Icon icon="lucide:bookmark" size={15} strokeWidth={2} fill={hotSaved[1] ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <h3 className={styles.docTitle}>Tips Lolos Magang UI/UX Designer di Tokopedia (Batch 2025)</h3>
                  <p className={styles.docDesc}>
                    Proses wawancara, tes studi kasus, dan timeline pendaftaran dari awal sampai diterima.
                  </p>
                  <div className={styles.docFooter}>
                    <span className={styles.docMeta}>
                      <strong>Oleh Rina Agustina • Sistem Informasi</strong>
                      <span className={styles.docRating}>
                        <Icon icon="lucide:star" size={13} fill="currentColor" strokeWidth={0} /> <b>5.0</b>
                      </span>
                      <span>
                        <Icon icon="lucide:bookmark" size={13} strokeWidth={1.8} /> 840 tersimpan
                      </span>
                    </span>
                    <Link to="/wawasan" className={styles.docAction}>
                      Baca Insight <Icon icon="lucide:arrow-right" size={12} strokeWidth={2.4} />
                    </Link>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Statistik ===== */}
        <section className={styles.stats}>
          <div className={styles.statsBand}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={`${styles.statValue} ${styles[`stat_${s.tone}`]}`}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Mengapa AKSARA ===== */}
        <section className={styles.why}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Mengapa AKSARA?</h2>
            <div className={styles.whyGrid}>
              <article className={`${styles.whyCard} ${styles.whyA}`}>
                <h3>Pencarian &amp; Filter Mudah</h3>
                <p>Cari materi berdasarkan Fakultas, Program Studi, Mata Kuliah, hingga Semester dengan cepat.</p>
                <div className={styles.filterDemo}>
                  <span className={styles.demoChip}>
                    <Icon icon="lucide:graduation-cap" size={15} className={styles.iconBlue} /> Fakultas Informatika
                  </span>
                  <span className={styles.demoChip}>
                    <Icon icon="lucide:calendar" size={14} className={styles.iconOrange} /> Semester 1 - 8
                  </span>
                  <span className={styles.demoChip}>
                    <Icon icon="lucide:list-filter" size={14} className={styles.iconBlue} /> Filter Mata Kuliah
                  </span>
                </div>
              </article>

              <article className={`${styles.whyCard} ${styles.whyB}`}>
                <h3>Resource &amp; Pengalaman Nyata</h3>
                <p>Bukan sekadar teori. Dapatkan referensi tugas nyata langsung dari mahasiswa</p>
                <div className={styles.quoteDemo}>
                  <p className={styles.quote}>
                    <Icon icon="lucide:quote" size={11} fill="currentColor" strokeWidth={0} />
                    &ldquo;Tips interview &amp; lolos seleksi magang terbukti&rdquo;
                  </p>
                  <div className={styles.quoteFooter}>
                    <span>85+ Logbook Semester Ini</span>
                    <Link to="/wawasan">
                      Baca <Icon icon="lucide:arrow-right" size={12} strokeWidth={2.2} />
                    </Link>
                  </div>
                </div>
              </article>

              <article className={`${styles.whyCard} ${styles.whyC}`}>
                <h3>Gatau belum kepikiran</h3>
                <p className={styles.loremText}>
                  b;albalbalalbb;albalbalalbb;albalbalalbb;albalbalalbb;albalbalalbb;albalbalalbb;albalbalalb
                </p>
              </article>

              <article className={`${styles.whyCard} ${styles.whyD}`}>
                <h3>Aman &amp; Terpercaya</h3>
                <p>
                  Login mudah dan aman menggunakan akun SSO Telkom University. Tersedia fitur pelaporan untuk menjaga
                  kualitas konten.
                </p>
                <div className={styles.trustRow}>
                  <span className={styles.trustChip}>
                    <Icon icon="lucide:circle-check" size={14} className={styles.iconGreen} /> OAuth SSO Tel-U
                  </span>
                  <span className={styles.trustChip}>
                    <Icon icon="lucide:circle-alert" size={14} className={styles.iconOrange} /> Fitur Lapor Konten
                  </span>
                  <span className={styles.trustChip}>
                    <Icon icon="lucide:lock" size={13} className={styles.iconGray} /> Privasi Terjaga
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ===== Kategori ===== */}
        <section className={styles.categories}>
          <div className={styles.container}>
            <div className={styles.catHeader}>
              <h2>Jelajahi Berdasarkan Kategori</h2>
              <Link to="/eksplorasi">
                Lihat Semua Vault <Icon icon="lucide:arrow-right" size={13} strokeWidth={2.2} />
              </Link>
            </div>
            <div className={styles.catGrid}>
              {CATEGORIES.map((c) => (
                <Link key={c.title} to="/eksplorasi" className={styles.catCard}>
                  <Icon icon="lucide:file-text" size={20} fill="#000" color="#fff" strokeWidth={1.6} className={styles.catIcon} />
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <Icon icon="lucide:circle-arrow-right" size={26} fill="#0f4c81" color="#fff" strokeWidth={1.8} className={styles.catArrow} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className={styles.cta}>
          <div className={styles.ctaGlowA} aria-hidden="true" />
          <div className={styles.ctaGlowB} aria-hidden="true" />
          <div className={styles.ctaGlowC} aria-hidden="true" />
          <div className={styles.ctaInner}>
            <h2>Dari Telyutizen, Untuk Telyutizen.</h2>
            <p className={styles.ctaText}>
              Bergabunglah sekarang. Temukan kemudahan mencari referensi tugas dan jadikan pengalamanmu bermanfaat
              bagi orang lain.
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/login" className={styles.ctaPrimary}>
                <Icon icon="lucide:log-in" size={15} strokeWidth={2.2} />
                Masuk dengan SSO Tel-U
              </Link>
              <Link to="/eksplorasi" className={styles.ctaSecondary}>
                Pelajari Fitur AKSARA <Icon icon="lucide:chevron-right" size={14} strokeWidth={2.4} />
              </Link>
            </div>
          </div>
          <p className={styles.ctaFoot}>*Akses terbuka bagi seluruh mahasiswa aktif, dosen, dan alumni Telkom University.</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
