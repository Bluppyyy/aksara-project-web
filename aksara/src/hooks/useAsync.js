import { useCallback, useEffect, useState } from 'react';

/** Jalankan fungsi async dan simpan status loading / error / data-nya */
export default function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const reload = useCallback(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    run()
      .then((data) => alive && setState({ loading: false, error: null, data }))
      .catch((error) => alive && setState({ loading: false, error, data: null }));
    return () => {
      alive = false;
    };
  }, [run]);

  useEffect(() => reload(), [reload]);

  // setData menerima nilai baru atau fungsi updater (seperti setState)
  const setData = useCallback(
    (next) => setState((s) => ({ ...s, data: typeof next === 'function' ? next(s.data) : next })),
    []
  );

  return { ...state, reload, setData };
}
