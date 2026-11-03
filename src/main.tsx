import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, createPath, RouterProvider } from 'react-router-dom';

import './index.css';
import { AuthProvider } from '@/auth/AuthProvider';
import { reloadOnStaleChunk } from '@/lib/stale-chunk';
import { routes } from '@/router';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

const router = createBrowserRouter(routes);

window.addEventListener('vite:preloadError', (event) =>
  reloadOnStaleChunk(event, () => {
    // Load the page the user was navigating to; the URL still shows the one they were leaving.
    const next = router.state.navigation.location;
    if (next) window.location.assign(createPath(next));
    else window.location.reload();
  }),
);

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
