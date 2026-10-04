import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { setBookmark } from '../services/resources';

/** State bookmark untuk satu resource: optimistic update + kembalikan jika API gagal */
export default function useBookmark(resourceId, initial, onChange) {
  const [saved, setSaved] = useState(Boolean(initial));
  const [busy, setBusy] = useState(false);
  const user = useAuth();
  const navigate = useNavigate();

  const toggle = async () => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname, notice: 'Masuk dulu untuk menyimpan resource ke koleksi.' } });
      return;
    }
    if (busy) return;
    const next = !saved;
    setSaved(next);
    setBusy(true);
    try {
      await setBookmark(resourceId, next);
      onChange?.(next);
    } catch {
      setSaved(!next); // kembalikan kalau gagal
    } finally {
      setBusy(false);
    }
  };

  return [saved, toggle];
}
