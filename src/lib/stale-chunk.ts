const LAST_RELOAD_KEY = 'stale-chunk-reload-at';
const MIN_RELOAD_INTERVAL_MS = 10_000;

// A tab from before a deploy asks for a chunk the deploy removed: reload once to get the new version.
// A second failure within the interval is a real error, so it is left to the error page.
export function reloadOnStaleChunk(event: Event, reload = () => window.location.reload()) {
  const lastReload = Number(sessionStorage.getItem(LAST_RELOAD_KEY));
  if (Date.now() - lastReload < MIN_RELOAD_INTERVAL_MS) return;
  sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()));
  event.preventDefault();
  reload();
}
