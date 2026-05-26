# Build Plan

Phased plan for building the multiplayer game. The guiding principle: structure the client so the game logic lives in a **pure reducer** separate from the UI from day one. Going multiplayer later then becomes a wiring change, not a rewrite.

Each phase ends with something you can actually run and see.

---

## Phase 1 — Static UI with hardcoded state

Build the game screens with mock data baked in. No state changes yet, just render. Goal: validate the layout, decide what the player sees. No backend, no logic.

**Deliverable:** every screen renders with fake data.

## Phase 2 — Local reducer, single player

Define `GameState` and `GameAction` types. Write a pure `reduce(state, action) => state` function. Drive the UI with `useReducer`. The game now works locally end-to-end, but only for one person on one tab.

**Deliverable:** you can play a full game alone in one browser tab.

**Why this matters:** this reducer is the exact thing your server will run. Same types, same function — that's why it stays portable.

## Phase 3 — Server bootstrap, no game logic yet

Write `server/src/index.ts`. Goal is just the _plumbing_: a ws server that accepts connections, parses messages, echoes back. No game yet. Open two browser tabs and verify they can both talk to it.

**Deliverable:** ws connect / disconnect / send / receive works.

## Phase 4 — Rooms + server-side reducer

Port your `reduce` function from the client into the server (copy-paste for now; we'll talk about sharing later). Add a room registry. Client sends `action`, server runs reducer, broadcasts new state.

**Deliverable:** two tabs joined to the same room see the same state.

## Phase 5 — Make client follow server

Rip out the client's local reducer. The client now just _sends actions_ and _renders whatever state the server pushes_. This is the moment it becomes truly multiplayer.

**Deliverable:** actions from tab A appear in tab B in real time.

## Phase 6 — Identity & reconnect

Stable `playerId` in localStorage. On reconnect, rejoin by id and get current state. Handle the dropped-connection cases.

**Deliverable:** refreshing a tab puts you back in the same game.

## Phase 7 — Lobby & room creation

Until now you've probably been hardcoding `roomId: "test"`. Add a way to create rooms and join existing ones. A tiny HTTP endpoint (`POST /rooms`) is cleaner than doing this over ws.

**Deliverable:** real users can start games with each other.

## Phase 8 — Persistence

Add the database. Save: users, completed games, maybe periodic snapshots of in-progress rooms. Live game state stays in memory.

## Phase 9 — Polish, edge cases, deployment

---

## Why this order

Between Phase 2 and Phase 5, **the UI never changes**. You build the game once, then move where the reducer runs. No throwaway work.
