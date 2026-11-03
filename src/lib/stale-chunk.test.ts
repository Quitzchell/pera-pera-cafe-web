import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reloadOnStaleChunk } from '@/lib/stale-chunk';

const preloadError = () => new Event('vite:preloadError', { cancelable: true });

describe('reloadOnStaleChunk', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reloads and swallows the error on the first failure', () => {
    const reload = vi.fn();
    const event = preloadError();
    reloadOnStaleChunk(event, reload);
    expect(reload).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it('lets a repeated failure through instead of reloading in a loop', () => {
    const reload = vi.fn();
    reloadOnStaleChunk(preloadError(), reload);
    const second = preloadError();
    reloadOnStaleChunk(second, reload);
    expect(reload).toHaveBeenCalledOnce();
    expect(second.defaultPrevented).toBe(false);
  });

  it('reloads again for a later deploy', () => {
    const reload = vi.fn();
    reloadOnStaleChunk(preloadError(), reload);
    vi.advanceTimersByTime(10_000);
    reloadOnStaleChunk(preloadError(), reload);
    expect(reload).toHaveBeenCalledTimes(2);
  });
});
