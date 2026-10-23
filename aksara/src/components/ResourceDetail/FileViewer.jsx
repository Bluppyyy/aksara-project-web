import styles from './DocumentPreview.module.css';

/** Area pratinjau berdasarkan hasil useFilePreview() */
export default function FileViewer({ state, title }) {
  return (
    <div className={styles.live}>
      {state.status === 'loading' && <p className={styles.liveNote}>Memuat pratinjau dokumen…</p>}
      {state.status === 'error' && <p className={styles.liveNote}>{state.message}</p>}
      {state.status === 'ready' && (state.kind === 'pdf' || state.kind === 'office') && (
        <iframe src={state.src} title={`Pratinjau ${title || 'dokumen'}`} className={styles.liveFrame} />
      )}
      {state.status === 'ready' && state.kind === 'image' && (
        <img src={state.src} alt={title || 'Pratinjau dokumen'} className={styles.liveImg} />
      )}
      {state.status === 'ready' && state.kind === 'other' && (
        <p className={styles.liveNote}>
          Pratinjau belum tersedia untuk format .{state.ext}. Gunakan tombol &ldquo;Buka di tab baru&rdquo;.
        </p>
      )}
    </div>
  );
}
