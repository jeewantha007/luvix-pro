## Supabase Integration Guide

This document captures everything added to integrate Supabase into the app: environment setup, backend routes, frontend auth, database schema, RLS policies, and how to run locally and in production. It also includes concrete code snippets for quick reference.

### Features added
- Frontend Supabase client in `data/supabaseClient.ts` (email/password auth, data fetch)
- Auth screens: `src/components/Auth/Auth.tsx`, `src/components/Auth/ResetPassword.tsx`
- App state wired to Supabase session in `src/context/AppContext.tsx`
- Reads chat data from table `public.chat_msgsaveto_app`
- Express backend at `server/server.js` with `/api/auth/check-email` for UX-friendly email checks
- Vite proxy (`vite.config.ts`) to forward `/api` → `http://localhost:4000`

---

## 1) Create Supabase project
1. Create a project at `https://app.supabase.com`.
2. Copy your Project URL and keys (Anon public, Service role).

---

## 2) Environment variables

Frontend (Vite) expects a `.env.local` file at the project root:
```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Backend (Node/Express) expects environment variables (Service Role key is server-only):
```
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

Windows PowerShell example for one session:
```powershell
$env:SUPABASE_URL="https://xxxxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi...serviceRole..."
npm run server
```

---

## 3) Database schema

Table name: `public.chat_msgsaveto_app`

Suggested schema to match the app’s mapping in `AppContext.tsx`:
```sql
create table if not exists public.chat_msgsaveto_app (
  id text not null,
  profile_name jsonb,
  created_at timestamptz default now(),
  user_message jsonb,
  bot_message jsonb
);

-- Optional index for faster ordering by time
create index if not exists chat_msgsaveto_app_created_at_idx
  on public.chat_msgsaveto_app (created_at);
```

---

## 4) RLS and policies

Enable Row Level Security:
```sql
alter table public.chat_msgsaveto_app enable row level security;
```

Option A: allow a specific user (replace with the user’s email and UUID)
```sql
-- Get UUID
select id from auth.users where email = 'USER_EMAIL_HERE';

create policy "read chat_msgsaveto_app for specific user"
on public.chat_msgsaveto_app
for select
using (auth.uid() = 'PASTE-USER-UUID-HERE'::uuid);
```

Option B: allow all authenticated users
```sql
create policy "read chat_msgsaveto_app for authenticated users"
on public.chat_msgsaveto_app
for select
using (auth.role() = 'authenticated');
```

---

## 5) Backend route

`server/server.js` exposes:
- `POST /api/auth/check-email` → checks if an email exists using Supabase Admin API. In development, if server env credentials are missing, it gracefully returns `{ exists: true }` instead of 500.

Minimal example from `server/server.js`:
```js
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

app.post('/api/auth/check-email', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ exists: true });
    }
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (error && error.message?.includes('User not found')) return res.json({ exists: false });
    if (error) return res.status(500).json({ error: error.message || 'Failed to check email' });
    return res.json({ exists: !!data?.user });
  } catch {
    return res.status(500).json({ error: 'Unexpected error' });
  }
});
```

---

## 6) Frontend wiring

Supabase client (`data/supabaseClient.ts`):
```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
```

Vite proxy (`vite.config.ts`) to talk to the local API server:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { exclude: ['lucide-react'] },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
```

Auth screen (`src/components/Auth/Auth.tsx`) – key parts:
```ts
// Forgot password flow
const checkRes = await fetch('/api/auth/check-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
});
const { exists } = checkRes.ok ? await checkRes.json() : { exists: true };
if (!exists) { setError('No account found with that email'); return; }
await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' });

// Login
await fetch('/api/auth/check-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

// Signup
const { error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: window.location.origin }
});
```

App state and data load (`src/context/AppContext.tsx`) – essentials:
```ts
// Map session user → app user
supabase.auth.getSession().then(({ data }) => { mapAndSetUser(data?.session?.user ?? null); });
supabase.auth.onAuthStateChange((_event, session) => { mapAndSetUser(session?.user ?? null); });

// Load chat data
const { data: records, error } = await supabase
  .from('chat_msgsaveto_app')
  .select('*')
  .order('created_at', { ascending: true });
```

---

## 7) Dev server & proxy

- `vite.config.ts` proxies `/api` to `http://localhost:4000`
- Run servers in two terminals:
```bash
# Terminal 1 (backend)
# PowerShell example: ensure env vars, then
npm run server

# Terminal 2 (frontend)
npm run dev
```

---

## 8) Production notes

- Set environment variables in your host (never ship service role key to the client)
- Build frontend: `npm run build`
- Serve backend with your process manager (e.g., PM2) and host the `dist` folder via a static server or the same Express app (if you integrate serving static files).


---

## 9) Troubleshooting

- 500 on `/api/auth/check-email` in dev: fixed to return `{ exists: true }` when server creds are missing. To perform real checks, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` before running `npm run server`.
- No rows returned: confirm RLS policy, ensure you are authenticated, and that table has data. Test with:
```sql
select count(*) from public.chat_msgsaveto_app;
```
- CORS: server allows `http://localhost:5173` and `http://127.0.0.1:5173`.

---

## 10) File map

- `data/supabaseClient.ts` – Supabase client
- `src/context/AppContext.tsx` – session mapping, data loading, dev-only logs
- `src/components/Auth/Auth.tsx` – login/signup, reset password
- `src/components/Auth/ResetPassword.tsx` – handle reset
- `server/server.js` – Express API, `/api/auth/check-email`, messages endpoints
- `vite.config.ts` – proxy `/api` → `http://localhost:4000`

---

## 11) Quick start checklist

1. Create Supabase project; get URL, Anon, Service Role
2. Add `.env.local` with VITE keys
3. Export `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in backend terminal
4. Create table and RLS policy (Option A or B)
5. Run `npm run server` and `npm run dev`
6. Sign up / login and verify chats load from `chat_msgsaveto_app`


