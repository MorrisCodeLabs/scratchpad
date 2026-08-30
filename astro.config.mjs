import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Scratchpad is a client-rendered app behind a thin Astro shell (Supabase auth
// and data both happen in the browser), but note/settings/calendar routes are
// real paths users can bookmark and refresh — so this runs in "server" mode
// with a catch-all page instead of trying to pre-render every possible
// /note/:id at build time. Deploys to Vercel — swap for @astrojs/node,
// @astrojs/cloudflare, or @astrojs/netlify if deploying elsewhere instead.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
