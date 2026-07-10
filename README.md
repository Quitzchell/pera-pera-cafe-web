# Pera Pera Cafe — Web

Frontend for **Pera Pera Cafe**, a realtime web app for practicing a language with friends through a shared card game. One person hosts a session, others join from their phones by scanning a QR code, and everyone drills vocabulary and questions together in realtime. Backend lives in a separate repo: [pera-pera-cafe-api](https://github.com/Quitzchell/pera-pera-cafe-api) (NestJS).

## What it does

The app is a guided flow rather than a single screen:

1. **Onboarding** — pick your native language, then the language you want to practice and your level(s). Japanese uses JLPT (N5–N1) and everything else uses CEFR (A1–C2); JLPT levels are mapped to CEFR before hitting the API, so the backend only ever deals in one scheme.
2. **Host or join** — a host names a session and gets a QR code / share link. Guests open that link, enter a name, and pick their side of the language pair.
3. **Waiting room** — everyone sees the live participant list update as people connect and drop.
4. **Play** — the host starts the game. Turns rotate through a "dealer": the dealer picks a participant and draws a card, the card (with romanization and a native-language gloss) shows for the dealer and observers, the target only sees a "you're being asked" prompt, and the dealer can skip the card or pass the turn. All of this is pushed over WebSocket, so every screen stays in sync without polling.

UI/UX decisions worth calling out: the target deliberately does **not** see the card text (they answer by listening); host controls like *End session* are intentionally low-emphasis; and every socket-backed action is disabled while disconnected so nobody fires a move into a dead connection.

## Tech stack

- **React 19** + **TypeScript**, built with **Vite 8**. Leans on React 19 form primitives — `useActionState` drives the create/join forms with built-in pending and error states, no form library needed.
- **React Router 7** for routing, with guard routes (`RequireNativeLanguage`, `RequireTargetLanguage`, `SessionRoute`) that redirect out anyone who skips a step or lands on a session without a membership.
- **socket.io-client** for realtime gameplay.
- **Tailwind CSS 4** + **shadcn/ui** (new-york, Radix primitives, lucide icons) for the component layer. `qrcode.react` renders the join QR.
- Path alias `@` → `src/`.

## Architecture

State is split across two contexts, each backed by `sessionStorage` so a refresh mid-session doesn't lose you:

- **`OnboardingProvider`** — holds native/target language and levels through the pre-session flow.
- **`SessionProvider`** — mounted per-session by `SessionRoute`. It reads the stored membership, opens the socket, and owns all live game state (participants, connection status, session status, current dealer, current card). Components read it through `useSession()` and never touch the socket directly.

The socket is opened with `path: '/api/socket.io/'` and an auth handshake carrying `{ sessionId, participantId }`. Inbound events (`presence:list`, `participant:joined/left`, `session:status/started/ended`, `game:state`, `card:drawn`, `turn:passed`) reduce into context state; outbound actions (`session:start/end`, `card:draw/skip`, `turn:pass`) go through a small `emitAck` helper that wraps socket acknowledgements in a promise so the UI gets a clean `{ ok, error }` result to react to.

REST calls (create session, join, fetch session/participant) live in `src/api/session.ts` against `VITE_API_URL`, with a typed `httpError` so callers can branch on status (e.g. a 404 on the host check means "not the host").

## Running locally

Requires the [API](https://github.com/Quitzchell/pera-pera-cafe-api) running and reachable.

```bash
cp .env.example .env      # set VITE_API_URL to the API's base URL
npm install
npm run dev               # Vite dev server on http://localhost:5173
```

Or with Docker (the `Makefile` wraps compose):

```bash
make up      # build + start on :5173
make logs    # tail
make down    # stop
```

Scripts: `npm run build` (typecheck + Vite build), `npm run lint`, `npm run format`.
