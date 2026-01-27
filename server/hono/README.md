# Hono + Drizzle foundation

Scaffold only. Not wired into the running Express app yet.

Next steps when ready to switch:
- Add Hono/Drizzle/PG deps to `server/package.json` and update lockfile.
- Point a new entry (or swap `index.js`) to `server/hono/server.ts`.
- Create migrations and move routes incrementally.
