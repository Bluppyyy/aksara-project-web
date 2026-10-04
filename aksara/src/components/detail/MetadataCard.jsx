import { useState } from 'react';
import styles from './SidebarCards.module.css';
import iconMetadata from '../../assets/detail/icon-metadata.svg';
import iconLicense from '../../assets/detail/icon-license.svg';
import iconCopy from '../../assets/detail/icon-copy.svg';

export default function MetadataCard({ meta }) {
  const [copied, setCopied] = useState(false);

  const copyDoi = async () => {
    try {
      await navigator.clipboard.writeText(meta.doi);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  return (
    <section className={styles.card}>
      <h3 className={styles.heading}>
        <img src={iconMetadata} alt="" style={{ width: 22, height: 18 }} />
        Metadata Spesifikasi
      </h3>

      <dl className={styles.metaList}>
        <div className={styles.metaRow}>
          <dt>Mata Kuliah</dt>
          <dd className={styles.metaBig}>{meta.course}</dd>
          <dd className={styles.metaSub}>{meta.courseInfo}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt>Dosen Pengampu / Pembimbing</dt>
          <dd className={styles.metaBold}>{meta.lecturer}</dd>
          <dd className={styles.metaSub}>{meta.lecturerInfo}</dd>
        </div>
        <div className={`${styles.metaRow} ${styles.metaSplit}`}>
          <div>
            <dt>Semester</dt>
            <dd className={styles.metaBold}>{meta.semester}</dd>
          </div>
          <div>
            <dt>Tahun Akademik</dt>
            <dd className={styles.metaBold}>{meta.year}</dd>
          </div>
        </div>
        <div className={styles.metaRow}>
          <dt>Skema Lisensi Distribusi</dt>
          <dd className={styles.license}>
            <img src={iconLicense} alt="" />
            {meta.license}
          </dd>
          <dd className={styles.licenseNote}>{meta.licenseNote}</dd>
        </div>
        <div className={`${styles.metaRow} ${styles.metaLast}`}>
          <dt>Digital Object Identifier (DOI)</dt>
          <dd className={styles.doi}>
            <span>{meta.doi}</span>
            <button
              type="button"
              onClick={copyDoi}
              aria-label="Salin DOI"
              title={copied ? 'Tersalin!' : 'Salin DOI'}
            >
              <img src={iconCopy} alt="" />
            </button>
          </dd>
          {copied && <dd className={styles.copied}>DOI tersalin ✓</dd>}
        </div>
      </dl>
    </section>
  );
}
