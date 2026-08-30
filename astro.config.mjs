import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// Scratchpad is a client-rendered app behind a thin Astro shell (Supabase auth
// and data both happen in the browser), but note/settings/calendar routes are
// real paths users can bookmark and refresh — so this runs in "server" mode
// with a catch-all page instead of trying to pre-render every possible
// /note/:id at build time. Deploys to Cloudflare Pages/Workers, which run on
// the Workers runtime rather than Node.js — swap for @astrojs/node,
// @astrojs/vercel, or @astrojs/netlify if deploying elsewhere instead.
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
