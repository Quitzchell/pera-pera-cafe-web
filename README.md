# Pera Pera Cafe — Web

Web app of the **Pera Pera Cafe conjugation trainer**: learners drill Japanese verb conjugation (泳ぐ → te-form → 泳いで), get instant feedback with the rule behind each form, and weak rule groups come back more often. There is no public sign-up; an admin invites every user.

The API lives in a separate repo: [pera-pera-cafe-api](https://github.com/Quitzchell/pera-pera-cafe-api) (NestJS). Its `docs/frontend-brief.md` is the contract for every endpoint, payload, error, the session cookie and CSRF.

## Tech stack

- **React 19** + **TypeScript**, built with **Vite 8**; route-level code splitting via React Router 7 `lazy` routes.
- **Tailwind CSS 4** with a few local shadcn-style components (no UI kit). Light and dark mode follow the system setting; Japanese uses the system Japanese font stack, so no web fonts are downloaded.
- **WanaKana** for optional romaji → kana input.
- **vite-plugin-pwa**: manifest, icons and a service worker that precaches the app shell only. `/api` is never cached.
- **Vitest** + Testing Library for component tests, **Playwright** for e2e tests.

## Environment variables

| Variable            | Default                 | Purpose                                                                                                                        |
| ------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_API_BASE_URL` | empty                   | Origin of the API, without `/api`. Leave empty when the API is served under `/api` on the same origin. Baked in at build time. |
| `API_PROXY_TARGET`  | `http://localhost:3000` | Dev server only: where Vite proxies `/api`.                                                                                    |

Copy `.env.example` to `.env` to override them locally.

## Running locally against the backend

1. Start the API (see its README). It listens on `http://localhost:3000` with `COOKIE_SECURE=false` in its `docker-compose.yml`, and its `FRONTEND_ORIGIN` defaults to `http://localhost:5173`, which is where invite and reset links point.
2. Create an admin in the API repo with its `create-admin` CLI.
3. Start this app:

   ```bash
   npm install
   npm run dev          # http://localhost:5173
   ```

   Or in Docker (`make up`, `make logs`, `make down`). The container proxies `/api` to `host.docker.internal:3000`.

The Vite dev server proxies `/api` to the API, so the browser sees one origin and the session cookie just works.

## Scripts

| Script                            |                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                     | Dev server with the `/api` proxy                                                                             |
| `npm run build`                   | Type-check and production build to `dist/`                                                                   |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                            |
| `npm test`                        | Component tests (Vitest)                                                                                     |
| `npm run test:e2e`                | Playwright e2e tests (starts its own dev server, mocks the API). Run `npx playwright install chromium` once. |
