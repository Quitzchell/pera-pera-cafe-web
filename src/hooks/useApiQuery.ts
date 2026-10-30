import { useCallback, useEffect, useState } from 'react';

type QueryState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'error'; data?: undefined; error: unknown }
  | { status: 'success'; data: T; error?: undefined };

/** Runs `load` on mount and whenever `key` changes. */
export function useApiQuery<T>(load: () => Promise<T>, key: string, initialData?: T) {
  const [state, setState] = useState<QueryState<T>>(
    initialData === undefined ? { status: 'loading' } : { status: 'success', data: initialData },
  );
  const [attempt, setAttempt] = useState(0);
  const skipFirst = initialData !== undefined;

  useEffect(() => {
    if (skipFirst && attempt === 0) return;
    let ignore = false;
    setState((current) => (current.status === 'success' ? current : { status: 'loading' }));
    load().then(
      (data) => !ignore && setState({ status: 'success', data }),
      (error: unknown) => !ignore && setState({ status: 'error', error }),
    );
    return () => {
      ignore = true;
    };
    // `load` is recreated every render; `key` says when the request changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt, skipFirst]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const setData = useCallback((data: T) => setState({ status: 'success', data }), []);

  return { ...state, reload, setData };
}
