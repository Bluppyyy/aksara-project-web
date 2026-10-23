import { useState } from 'react';
import styles from './FilterSidebar.module.css';
import RangeSlider from '../RangeSlider/RangeSlider.jsx';
import iconFilter from '../../assets/explore/icon-filter.svg';
import iconSelect from '../../assets/explore/icon-select.svg';
import iconSearch from '../../assets/explore/icon-search-sm.svg';
import iconTagRemove from '../../assets/explore/icon-tag-remove.svg';
import iconStar from '../../assets/explore/icon-star-sm.svg';
import iconCheck from '../../assets/explore/icon-check-circle.svg';
import { PRODI_FIF } from '../../data/academic';
import { USE_API } from '../../services/api';
import { kategoriOptions } from '../../services/master';
import useAsync from '../../hooks/useAsync';

// Label sesuai Figma → kunci kategori di data
const CATEGORIES = [
  { label: 'Tugas Kuliah & Makalah', key: 'tugas' },
  { label: 'Laporan Magang & PKL', key: 'magang' },
  { label: 'Skripsi & Tugas Akhir', key: 'skripsi' },
  { label: 'Bank Soal', key: 'ujian' },
  { label: 'Riset & Publikasi Paper', key: 'riset' },
  { label: 'Modul Praktikum', key: 'project' },
  { label: 'Misc', key: 'lainnya' },
];
const PRODI = ['Semua Program Studi', ...PRODI_FIF];
const SEMESTERS = ['Smt 1', 'Smt 2', 'Smt 3', 'Smt 4', 'Smt 5', 'Smt 6', 'Smt 7', 'Smt 8+'];
const FORMATS = ['PDF', 'DOC', 'PPT', 'ZIP'];
const smtNum = (s) => parseInt(s.replace(/\D/g, ''), 10);

/** Objek filter (utils/filters.js) → state form sidebar */
function toForm(v = {}) {
  return {
    categories: v.kategori || [], // kunci kategori (mode API: "k:<category_id>")
    prodi: v.prodi || PRODI[0],
    semesters: SEMESTERS.filter((s) => (v.semester || []).includes(smtNum(s))),
    courseQuery: '',
    courses: v.matkul || [],
    formats: v.format || [],
    years: v.tahun || [2010, 2026],
    rating: v.rating || [1, 5],
  };
}

/** State form sidebar → objek filter */
function fromForm(f) {
  return {
    kategori: f.categories,
    prodi: f.prodi === PRODI[0] ? '' : f.prodi,
    semester: f.semesters.map(smtNum),
    matkul: f.courses,
    format: f.formats,
    tahun: f.years,
    rating: f.rating,
  };
}

const toggle = (list, item) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

function SectionTitle({ children }) {
  return <h3 className={styles.sectionTitle}>{children}</h3>;
}

function Select({ id, label, value, options, onChange }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      <div className={styles.selectWrap}>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={styles.select}>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <img src={iconSelect} alt="" className={styles.selectIcon} />
      </div>
    </div>
  );
}

/**
 * Sidebar filter halaman Hasil Eksplorasi (FR-EXP-03).
 * value  : filter aktif (dari URL)  •  onApply(filter) : dipanggil saat "Terapkan Filter" / "Reset Filter"
 */
export default function FilterSidebar({ value, onApply }) {
  const [f, setF] = useState(() => toForm(value));
  // Mode API: daftar kategori sama dengan database (GET /kategori)
  const { data: dbCats } = useAsync(() => (USE_API ? kategoriOptions().catch(() => null) : Promise.resolve(null)), []);
  const categoryList = dbCats?.length ? dbCats : CATEGORIES;
  const set = (key, value) => setF((prev) => ({ ...prev, [key]: value }));

  const addCourse = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const name = f.courseQuery.trim();
    if (name && !f.courses.includes(name)) setF((p) => ({ ...p, courses: [...p.courses, name], courseQuery: '' }));
    else setF((p) => ({ ...p, courseQuery: '' }));
  };

  return (
    <aside className={styles.sidebar} aria-label="Filter hasil">
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <img src={iconFilter} alt="" className={styles.headerIcon} />
          <h2>Filter</h2>
        </div>
        <button
          type="button"
          className={styles.reset}
          onClick={() => {
            const empty = toForm({});
            setF(empty);
            onApply?.(fromForm(empty));
          }}
        >
          Reset Filter
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.group}>
          <section className={styles.section}>
            <SectionTitle>KATEGORI BERKAS</SectionTitle>
            <div className={styles.checkList}>
              {categoryList.map(({ label, key }) => (
                <label key={key} className={styles.check}>
                  <input
                    type="checkbox"
                    checked={f.categories.includes(key)}
                    onChange={() => set('categories', toggle(f.categories, key))}
                  />
                  <span className={styles.checkBox} aria-hidden="true" />
                  {label}
                </label>
              ))}
            </div>
          </section>

          {/* Prodi & semester: dicocokkan dari prodi_id / semester_id resource (GET /prodi, GET /semester) */}
          <section className={styles.section}>
            <SectionTitle>PROGRAM STUDI</SectionTitle>
            <div className={styles.fields}>
              <Select
                id="f-prodi"
                label="Program Studi"
                value={f.prodi}
                options={PRODI}
                onChange={(v) => set('prodi', v)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle>SEMESTER PERKULIAHAN</SectionTitle>
            <div className={styles.semesterGrid}>
              {SEMESTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={f.semesters.includes(s)}
                  className={`${styles.chip} ${f.semesters.includes(s) ? styles.chipActive : ''}`}
                  onClick={() => set('semesters', toggle(f.semesters, s))}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.courseSection}`}>
            <SectionTitle>CARI MATA KULIAH</SectionTitle>
            <div className={styles.searchWrap}>
              <img src={iconSearch} alt="" className={styles.searchIcon} />
              <input
                className={styles.search}
                placeholder="Cth: Pemrograman Web..."
                value={f.courseQuery}
                onChange={(e) => set('courseQuery', e.target.value)}
                onKeyDown={addCourse}
                aria-label="Cari mata kuliah (Enter untuk menambah)"
              />
            </div>
            {f.courses.length > 0 && (
              <div className={styles.tags}>
                {f.courses.map((c) => (
                  <span key={c} className={styles.tag}>
                    {c}
                    <button
                      type="button"
                      aria-label={`Hapus ${c}`}
                      onClick={() =>
                        set(
                          'courses',
                          f.courses.filter((x) => x !== c)
                        )
                      }
                    >
                      <img src={iconTagRemove} alt="" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className={styles.group}>
          <section className={styles.section}>
            <SectionTitle>FORMAT</SectionTitle>
            <div className={styles.formatList}>
              {FORMATS.filter((fm) => !(USE_API && fm === 'ZIP')).map((fm) => (
                <button
                  key={fm}
                  type="button"
                  aria-pressed={f.formats.includes(fm)}
                  className={`${styles.chip} ${styles.formatChip} ${f.formats.includes(fm) ? styles.chipActive : ''}`}
                  onClick={() => set('formats', toggle(f.formats, fm))}
                >
                  {fm}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle>TAHUN UPLOAD</SectionTitle>
            <div className={styles.sliderRow}>
              <span className={styles.sliderValue}>{f.years[0]}</span>
              <RangeSlider
                label="Tahun upload"
                min={2010}
                max={2026}
                value={f.years}
                onChange={(v) => set('years', v)}
              />
              <span className={styles.sliderValue}>{f.years[1]}</span>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle>RATING</SectionTitle>
            <div className={styles.sliderRow}>
              <span className={styles.ratingValue}>
                {f.rating[0]} <img src={iconStar} alt="bintang" />
              </span>
              <RangeSlider label="Rating" min={1} max={5} value={f.rating} onChange={(v) => set('rating', v)} />
              <span className={styles.ratingValue}>
                {f.rating[1]} <img src={iconStar} alt="bintang" />
              </span>
            </div>
          </section>
        </div>
      </div>

      <button type="button" className={styles.apply} onClick={() => onApply?.(fromForm(f))}>
        <img src={iconCheck} alt="" />
        Terapkan Filter
      </button>
    </aside>
  );
}
