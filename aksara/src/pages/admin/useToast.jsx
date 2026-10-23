import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon/Icon.jsx';
import ui from './admin.module.css';

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
