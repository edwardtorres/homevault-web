# HomeVault

A simple, portfolio-focused **home inventory dashboard**. Organize your belongings by
room and category, track estimated values, attach one photo per item, search your
inventory, and export a CSV — useful for insurance records and peace of mind.

HomeVault is the web version of an original native iOS app of the same name. This
version is intentionally streamlined: no payments, no App Store features, no complex
reporting — just a clean, complete, employer-friendly project.

> **Try it without an account.** From the login screen, click **View Demo** to explore
> the whole app with realistic sample data. Nothing in demo mode is saved to a server.

## Features

- **Public demo mode** — explore rooms, categories, items, search, and CSV export with
  sample data, no sign-up required.
- **Accounts** — email/password auth via Supabase; each user's data is private.
- **Rooms → Categories → Items** — full create / edit / delete at every level.
- **One photo per item** — upload, replace, or remove; downscaled in the browser before
  upload and stored privately in Supabase Storage.
- **Dashboard** — totals for rooms, categories, items, and estimated value, plus recent
  items and a room overview.
- **Search** — across item name, room, category, serial number, and notes.
- **CSV export** — download a spreadsheet of your full inventory.
- **Responsive** — works on phone (bottom tab nav) and desktop (top nav).

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (Postgres, Auth, Storage)
- React Router (HashRouter, for static hosting)
- Deployable as a static site to GitHub Pages

## Design

A bold, editorial "brutalist" look: oversized grotesque type (Archivo), thick black
rules, underline-style form fields, and a "color per room" system where each room — and
everything inside it — floods the screen with its own color. Inspired by the original
iOS app's concept, reimagined for the web.

## Screenshots

_Add screenshots here (e.g. `docs/dashboard.png`, `docs/room.png`)._

## Project structure

```
homevault-web/
  index.html
  vite.config.ts            # base path for GitHub Pages
  supabase/schema.sql       # tables, RLS, triggers, storage bucket + policies
  src/
    components/             # reusable UI (Button, Card, Modal, PhotoUpload, …)
    context/                # SessionContext (auth/demo) + InventoryContext (data)
    lib/                    # supabaseClient, csvExport, formatters, demoData, …
    pages/                  # Login, Dashboard, Rooms, RoomDetail, CategoryDetail, …
    types/inventory.ts      # Room, Category, Item, DashboardStats
    App.tsx, main.tsx
```

## Demo mode

Demo mode lets employers/reviewers explore the project without creating an account:

- A **Demo Mode** banner is always visible so it's clear the data is sample data.
- All features work: dashboard, rooms, categories, items, search, and CSV export.
- You can add / edit / delete sample data during the session (kept in `localStorage`),
  but **nothing is written to Supabase**.
- Item photos in demo mode are previewed locally (never uploaded).
- Exit demo mode any time from the header or the Settings page.

The app runs in demo-only mode automatically when no Supabase environment variables are
set — convenient for a public GitHub Pages deployment.

## Local development

```bash
cd homevault-web
npm install
cp .env.example .env     # optional — leave blank for demo-only mode
npm run dev
```

Open the printed local URL. Without Supabase configured, sign-in is disabled and
**View Demo** is the way in.

## Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `rooms`,
   `categories`, and `items` tables, the `updated_at` triggers, Row Level Security
   policies, indexes, the `item-photos` storage bucket, and the storage access policies.
3. Confirm **Storage** now has a private bucket named `item-photos`.
4. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
5. Put them in `.env`:

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

> The anon key is **meant to be public** in a frontend app. Security is enforced by Row
> Level Security and Storage policies (every row and every photo is scoped to its owner),
> not by hiding this key.

By default Supabase requires email confirmation on sign-up. For quick local testing you
can disable that under **Authentication → Providers → Email**.

## Deployment (GitHub Pages)

This is a static site. The included script publishes the built `dist/` to a `gh-pages`
branch using the `gh-pages` package.

1. Set the base path. `vite.config.ts` defaults to `/homevault-web/` (matching a repo
   named `homevault-web`). If your repo has a different name, build with
   `VITE_BASE=/your-repo/`. For a user/organization page or a custom domain, use
   `VITE_BASE=/`.
2. Provide the Supabase env vars at build time (or commit a `.env`, since the anon key is
   public). To deploy a **demo-only** site, leave them unset.
3. Build and deploy:

   ```bash
   npm run deploy
   ```

4. In the repo's **Settings → Pages**, set the source to the `gh-pages` branch.

Routing uses `HashRouter`, so deep links (e.g. `/#/rooms`) work on GitHub Pages without
any server-side rewrite rules.

## Portfolio notes

HomeVault is a deliberately focused project meant to demonstrate clean, readable React +
TypeScript, a sensible Supabase data layer with Row Level Security, and a cohesive design
system — without over-engineering. It looks complete even with empty data (every screen
has a thoughtful empty state) and can be fully explored via demo mode.

## Future improvements

Intentionally **not** built in this version:

- Multiple photos per item
- Receipt uploads and barcode scanning
- Shared household access
- PDF export and insurance report templates
- Charts / analytics and dark mode
- Mobile camera-capture optimization
- Advanced backup / restore
