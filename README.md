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
3. **Copy the env file** and fill in your project's credentials (Settings → API in the Supabase dashboard):
   ```sh
   cp .env.example .env
   ```
4. **Install and run**:
   ```sh
   npm install
   npm run dev
   ```
5. Open `http://localhost:4321`, sign up, and you'll land in an auto-created workspace.

## Deploying

This project runs in Astro's `server` output mode with the `@astrojs/node` adapter (notes are addressed by real, bookmarkable URLs like `/note/:id`, which a purely static build can't pre-render). Swap `@astrojs/node` in `astro.config.mjs` for `@astrojs/vercel` or `@astrojs/netlify` if deploying to those platforms — no application code needs to change.

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
    [...path].astro Single catch-all page — mounts the app shell for any route
supabase/
  migrations/  Schema, RLS policies, and the attachments storage bucket
```

## Resale / white-label notes

Every table is scoped to `workspace_id` and enforced via Postgres RLS (`is_workspace_member()`), not just client-side checks — a reseller can run this schema multi-tenant safely. Theme is driven entirely by CSS custom properties in `src/styles/global.css` (`--sp-*` tokens); the `workspaces.theme` JSONB column is reserved for per-workspace brand overrides once white-labeling is wired up in a later phase.

## Plan tiers (Free / Pro)

`workspaces.plan` gates two features: automatic version history (Settings → Billing shows the toggle; `src/lib/use-plan.ts` is the single read-path every gate uses) and export (Markdown/PDF). **No payment processor is wired up** — Settings → Billing flips the flag directly. Swapping in real billing means replacing `src/lib/plan-actions.ts`'s `setWorkspacePlan` with a Stripe checkout (or similar) that lands on the same column; nothing else in the app needs to change.
