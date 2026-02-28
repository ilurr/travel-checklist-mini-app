# Travel Packing List (Mini App)

A simple packing checklist for travel (e.g. Umroh, Mecca, holidays). You can create multiple **trips**, each with a **destination** and **date**, and each trip has its own packing list.

- **Personal use**: Data stays in your browser (localStorage). No login, no server.
- **Share for 7 days**: Optional "Share for 7 days" creates a secret link for the current trip (destination, date, and list); the snapshot is stored in Supabase and expires after 7 days.

## Tech

- Vue 3 + Vite + Tailwind CSS
- Netlify (hosting + serverless functions)
- Supabase (free tier, for temporary shares only)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Deploy (Netlify)

1. Push this repo to GitHub and connect it in Netlify.
2. Set environment variables in Netlify:
   - `SUPABASE_URL` – your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key (for server-side only)
3. Build command: `npm run build`; Publish directory: `dist`; Functions: `netlify/functions`.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In SQL Editor, run:

```sql
create table shared_lists (
  id uuid primary key,
  token_hash text not null,
  data jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

3. In Project Settings > API, copy **Project URL** and **service_role** key into Netlify env.

## Docs

- [Architecture](docs/architecture.md) – data model, API, flows
- [Usage](docs/usage.md) – how to use the app and sharing
