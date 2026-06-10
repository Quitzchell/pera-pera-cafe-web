import { useState } from 'react';

export function useAsync<Targs extends unknown[], TResults>(
  fn: (...args: Targs) => Promise<TResults>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function run(...args: Targs): Promise<TResults | undefined> {
    setLoading(true);
    setError(null);
    try {
      return await fn(...args);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return undefined;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, run };
}
