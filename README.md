# Scratchpad

A fast, block-based note-taking workspace — Astro + Tailwind CSS + Supabase + Tiptap + shadcn/ui-style components + Lucide icons.

This is the **Phase 1 MVP** build: auth, a single workspace per account, note CRUD with autosave, a Tiptap editor with slash commands, nested folders with drag-and-drop, a calendar view, global search, a command menu (⌘K), and settings. The full feature roadmap (advanced editor formatting, database/kanban/math blocks, note templates/locks/reminders, multi-workspace switching) is intentionally out of scope for this phase — see the project's build briefs for what comes next.

## Stack

| Layer | Choice |
|---|---|
| Framework | [Astro](https://astro.build) (server output, React islands) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) via CSS custom properties |
| Backend | [Supabase](https://supabase.com) (Postgres + Auth + Realtime), isolated by Row-Level Security |
| Editor | [Tiptap](https://tiptap.dev) with a custom slash-command extension |
| Components | shadcn/ui-style primitives built on Radix UI, `cmdk` for the command menu, `dnd-kit` for drag-and-drop |
| Icons | [Lucide](https://lucide.dev) |

## Getting started

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Run the schema migrations, in order**, in your Supabase dashboard's SQL editor:
   - `supabase/migrations/0001_init.sql` — `workspaces`, `workspace_members`, `folders`, `notes`, Row-Level Security, and a trigger that auto-creates a personal workspace for every new user.
   - `supabase/migrations/0002_notes_created_by_default.sql` — defaults `notes.created_by` to the authenticated user (fixes note creation on a project created before this fix landed).
   - `supabase/migrations/0003_attachments_storage.sql` — creates the `attachments` storage bucket used by image/file blocks in the editor.
   - `supabase/migrations/0004_pro_features.sql` — adds `workspaces.plan`, `notes.word_goal`, and the `note_versions` table used by the Pro version-history feature.
   - `supabase/migrations/0005_pro_features_2.sql` — adds `notes.is_locked` and `notes.reminder_at`, used by the note-locking and reminder Pro features.
   - `supabase/migrations/0006_pro_features_3.sql` — adds `notes.color`, `notes.description`, `notes.tags`, `notes.expires_at`, and the `note_templates` table used by custom (workspace-saved) templates.
3. **Copy the env file** and fill in your project's credentials (Settings → API in the Supabase dashboard):
   ```sh
   cp .env.example .env
   ```
4. **Install and run**:
   ```sh
   npm install
   npm run dev
   ```
5. Open `http://localhost:4321` for the marketing page, or go straight to `http://localhost:4321/app` to sign up — you'll land in an auto-created workspace.

## Deploying

This project runs in Astro's `server` output mode with the `@astrojs/vercel` adapter (notes are addressed by real, bookmarkable URLs like `/note/:id`, which a purely static build can't pre-render). Deploying to Vercel: import the repo at [vercel.com/new](https://vercel.com/new), set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` under Project Settings → Environment Variables, and deploy — Astro's Vercel preset is auto-detected, no build command overrides needed. Every push to the production branch redeploys automatically; other branches and PRs get their own preview URL. Swap the adapter in `astro.config.mjs` for `@astrojs/node`, `@astrojs/cloudflare`, or `@astrojs/netlify` if deploying elsewhere instead.

**Maintenance mode**: set `PUBLIC_MAINTENANCE_MODE=true` in Vercel's Environment Variables and trigger a redeploy (Deployments → ⋯ → Redeploy, no new commit needed) to lock everyone but the app owner out — see `src/lib/maintenance-mode.ts`. It's a `PUBLIC_`-prefixed var, so it's inlined into the client bundle at build time and always needs a redeploy to take effect either way, in either direction.

**Pausing the project** (Settings → General → Pause Project) stops builds and serves Vercel's own static paused-page instead of the app — that's a platform-level action, not something `PUBLIC_MAINTENANCE_MODE` controls, and there's no way to keep our own maintenance screen showing while paused. Resuming from the same spot brings it back, but the deployment that was active when you paused often can't be redeployed as-is afterward ("This deployment can not be redeployed") — push any new commit (or Deployments → ⋯ → Redeploy on the *newest* one, not the paused-era one) to get a fresh build going again.

## Project structure

```
src/
  components/
    editor/       Tiptap editor, toolbar, slash-command menu, note menu/status
    sidebar/       Folder tree (drag-and-drop), note rows, workspace switcher
    ui/            shadcn-style primitives (Button, Dialog, DropdownMenu, …)
    views/         Route-level views: All Notes, Calendar, Trash, Settings
    Workspace.tsx  Top-level island: auth → workspace → app shell
    AppShell.tsx   Sidebar + routed main content + command menu
    CommandMenu.tsx ⌘K command palette
  lib/
    data/          Supabase-backed hooks (notes, folders, session, workspace, autosave)
    editor/         Tiptap extensions (slash command, callout block)
    workspace-context.tsx  Shared React context for the active workspace
    use-router.ts   Minimal history-API router (no react-router dependency)
  pages/
    index.astro     Static marketing/landing page — the "/" a signed-out visitor sees first
    app/[...path].astro  Catch-all under /app — mounts the app shell for any app route
    s/[token].astro Public read-only view for a shared note link
supabase/
  migrations/  Schema, RLS policies, and the attachments storage bucket
```

## Resale / white-label notes

Every table is scoped to `workspace_id` and enforced via Postgres RLS (`is_workspace_member()`), not just client-side checks — a reseller can run this schema multi-tenant safely. Theme is driven entirely by CSS custom properties in `src/styles/global.css` (`--sp-*` tokens). The `workspaces.theme` JSONB column now carries the first real per-workspace override — `theme.accent`, a Pro feature (Settings → Appearance → Brand color) applied at runtime via `src/lib/brand-color.ts`'s `applyBrandAccent()`, which uses `color-mix()` to derive the accent's soft/ink variants from a single hex rather than hand-picking three colors per brand.

## Plan tiers (Free / Pro)

`workspaces.plan` gates: automatic version history, export (Markdown/PDF), note locking (read-only mode), reminders, the custom brand accent color, note color/description/tags, note expiration (auto-archive), custom workspace-saved templates, the note outline/table-of-contents, focus mode, bulk actions and advanced search on All Notes, and the Insights page. `src/lib/use-plan.ts`'s `useEffectivePlan()` is the single read-path every gate uses. **No payment processor is wired up** — Settings → Billing shows the plan cards read-only ("Billing is temporarily unavailable"); a Stripe integration was built and then disconnected, and `workspaces.stripe_customer_id` / `stripe_subscription_id` / `subscription_status` / `seats` still exist on the table for whenever it's reconnected. Wiring in real billing means adding back the checkout/portal/webhook API routes that write `plan` (and, for Team, `seats`) on that same column; nothing else in the app needs to change.

`useIsPro()` also has a hardcoded owner-account override (an email constant in the same file) that always returns Pro regardless of `workspace.plan` — meant for the app's own creator, independent of any billing state. Swap or remove that constant before reselling this codebase to someone else, since it's currently a real email in source.
