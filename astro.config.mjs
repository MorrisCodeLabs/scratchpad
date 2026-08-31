import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// Scratchpad is a client-rendered app behind a thin Astro shell (Supabase auth
// and data both happen in the browser), but note/settings/calendar routes are
// real paths users can bookmark and refresh — so this runs in "server" mode
// with a catch-all page instead of trying to pre-render every possible
// /note/:id at build time. Swap the node adapter for @astrojs/vercel,
// @astrojs/cloudflare, or @astrojs/netlify if deploying to those platforms.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  // Astro's default CSRF protection rejects any non-GET request whose
  // Origin header doesn't match the site's own host — which is exactly how
  // Stripe's webhook arrives (a server-to-server POST with no Origin header
  // at all). Every API route here already authenticates itself properly
  // (Bearer token for checkout/portal, Stripe's own signature for the
  // webhook), so this extra layer is redundant and, for the webhook,
  // actively breaks things.
  security: {
    checkOrigin: false,
  },
});
