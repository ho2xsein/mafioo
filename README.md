# Mafioo

A real backend + unified React frontend built to replace the static scraped
snapshots in `scraped/` (54 pages captured from an existing browser mafia
game, kept only as reference for field names/mechanics — not served).

See `PLAN.md`-equivalent context in the original planning session for the
full build order. Status: core loop (auth, city/street crime actions, bank,
inventory, messages, friends, standings, crime log) is implemented and
verified end-to-end. Remaining feature areas (school/fitness training,
jail, hospital, market, contrabandist, bars, rackets, skills, quests,
tasks, polls) are scaffolded as routed pages and will be built out next.

## Layout

```
/backend   Node + Express + TypeScript + Prisma (PostgreSQL) + JWT auth
/frontend  React + TypeScript + Vite + React Router + design-system
/shared    TS types shared between backend and frontend
/scraped   Original scraped HTML snapshots, kept for reference only
```

## Local setup

Requires Node 22+ and PostgreSQL running locally.

```bash
npm install

# create the database (adjust user/db as needed)
createdb mafioo
# or: sudo -u postgres psql -c "CREATE USER mafioo WITH PASSWORD 'mafioo' CREATEDB;"
#     sudo -u postgres psql -c "CREATE DATABASE mafioo OWNER mafioo;"

cp backend/.env.example backend/.env
# edit backend/.env if your DATABASE_URL differs

cd backend
npx prisma migrate dev
npm run seed
cd ..

npm run dev   # runs backend (:4000) and frontend (:5173) together
```

Open http://localhost:5173, register an account, and play.

## Scripts

- `npm run dev` — run backend + frontend in watch mode
- `npm run build` — build shared, backend, frontend
- `npm run typecheck` — typecheck backend + frontend
- `npm run seed` (in `backend/`) — seed skills, map spots, item catalog, extras
