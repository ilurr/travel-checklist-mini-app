# Travel Packing List (Mini App)

A simple packing checklist for travel (e.g. Umroh, Mecca, holidays). You can create multiple **trips**, each with a **destination** and **date**, and each trip has its own packing list.

- **Personal use**: Data stays in your browser (localStorage). No login, no server.
- **Share for 7 days**: One **stable link** per trip. First share creates it; later shares **update** the same link so it always shows the latest version. Both you and the person you shared with can edit and "save" by sharing again (last-write-wins). Rolling 7-day expiry.

## Tech

- Vue 3 + Vite + Tailwind CSS
- Netlify (hosting + serverless functions)
- Supabase (free tier, for shared trip snapshots; one row per shared trip, updated on each Share)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Deploy (Netlify)

1. Push this repo to GitHub and connect it in Netlify.
2. Set environment variables in Netlify (Site settings → Environment variables → Add a variable):
   - **`SUPABASE_URL`** – Your Supabase project URL, e.g. `https://abcdefgh.supabase.co` (no trailing slash). Find it in Supabase dashboard → Project Settings → API → Project URL.
   - **`SUPABASE_SERVICE_ROLE_KEY`** – The **service_role** key (not anon) from Supabase → Project Settings → API → Project API keys → `service_role`. Keep it secret.
   Redeploy the site after adding or changing these so the functions see the new values.
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

## Troubleshooting

- **502 when sharing**: The Netlify function may have crashed. Ensure in Netlify → Site → Environment variables that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. Ensure the Supabase table `shared_lists` exists with columns: `id` (uuid), `token_hash` (text), `data` (jsonb), `expires_at` (timestamptz), `created_at`, `updated_at`. Redeploy after changing env vars. To test locally with functions, run `netlify dev` instead of `npm run dev`.
- **"Failed to create share"**: The app now shows the server’s error details when possible. Check the alert message and Netlify function logs (Netlify dashboard → Functions → share-create).

## Docs

- [Architecture](docs/architecture.md) – data model, API, flows
- [Usage](docs/usage.md) – how to use the app and sharing
