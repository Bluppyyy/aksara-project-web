import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon/Icon.jsx';
import ui from './admin.module.css';

/** Label & warna status moderasi (dipakai di semua tabel admin) */
export const STATUS_META = {
  pending: { label: 'Menunggu Review', tone: ui.toneWarn },
  clarify: { label: 'Butuh Klarifikasi', tone: ui.toneWarn },
  approved: { label: 'Dipublikasikan', tone: ui.toneOk },
  rejected: { label: 'Ditolak', tone: ui.toneDanger },
  hidden: { label: 'Disembunyikan', tone: ui.toneNeutral },
};

export function StatusBadge({ status, label }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`${ui.badge} ${ui.badgeRound} ${meta.tone}`}>
      <span className={ui.dot} />
      {label || meta.label}
    </span>
  );
}

/** Notifikasi kecil di pojok kanan bawah. Pemakaian: const [toast, notify] = useToast(); */
export function useToast() {
  const [state, setState] = useState(null);
  const timer = useRef();
  const notify = useCallback((message, type = 'success') => {
    clearTimeout(timer.current);
    setState({ message, type });
    timer.current = setTimeout(() => setState(null), 3200);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const el = state ? (
    <div className={`${ui.toast} ${state.type === 'error' ? ui.toastError : ''}`} role="status">
      <Icon icon={state.type === 'error' ? 'lucide:circle-alert' : 'lucide:circle-check'} size={18} />
      {state.message}
    </div>
  ) : null;
  return [el, notify];
}

/** Paginasi sederhana bergaya admin */
export function AdminPager({ info, page = 1, pages = [1, 2, 3], last, onChange }) {
  return (
    <div className={ui.pager}>
      <span>{info}</span>
      <div className={ui.pagerButtons}>
        <button type="button" className={ui.pageBtn} disabled={page <= 1} onClick={() => onChange?.(page - 1)} aria-label="Sebelumnya">
          <Icon icon="lucide:chevron-left" size={14} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`${ui.pageBtn} ${p === page ? ui.pageBtnActive : ''}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange?.(p)}
          >
            {p}
          </button>
        ))}
        {last && (
          <>
            <span>…</span>
            <button type="button" className={`${ui.pageBtn} ${last === page ? ui.pageBtnActive : ''}`} onClick={() => onChange?.(last)}>
              {last}
            </button>
          </>
        )}
        <button
          type="button"
          className={ui.pageBtn}
          disabled={page >= (last || pages[pages.length - 1])}
          onClick={() => onChange?.(page + 1)}
          aria-label="Berikutnya"
        >
          <Icon icon="lucide:chevron-right" size={14} />
        </button>
      </div>
    </div>
  );
}
