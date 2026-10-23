import styles from './CoverFrame.module.css';

/**
 * Bingkai sampul berukuran seragam (rasio 16:9).
 * Gambar selalu tampil utuh (tidak dipotong) dan diperbesar/diperkecil supaya pas di bingkai;
 * sisa ruang diisi versi blur dari gambar yang sama, jadi gambar besar, kecil, tegak,
 * maupun lebar terlihat sama rapinya.
 */
export default function CoverFrame({ src, alt, className = '' }) {
  if (!src) return null;
  return (
    <div className={`${styles.frame} ${className}`}>
      <img src={src} alt="" aria-hidden="true" className={styles.backdrop} />
      <img src={src} alt={alt} className={styles.image} />
    </div>
  );
}
