import styles from './RangeSlider.module.css';

/** Slider dua ujung (min–max) dari dua input range yang ditumpuk */
export default function RangeSlider({ min, max, step = 1, value, onChange, label }) {
  const [lo, hi] = value;
  const frac = (v) => (v - min) / (max - min);

  return (
    <div className={styles.track} style={{ '--lo': frac(lo), '--hi': frac(hi) }}>
      <div className={styles.base} />
      <div className={styles.range} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={lo}
        aria-label={`${label} minimum`}
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={hi}
        aria-label={`${label} maksimum`}
        onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
      />
    </div>
  );
}
