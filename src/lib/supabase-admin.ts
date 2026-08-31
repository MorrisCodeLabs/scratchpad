import { createClient } from "@supabase/supabase-js";

// Server-only — bypasses row-level security with the service role key, so
// this must never be imported from client code. Used exclusively by the
// Stripe API routes, which need to update a workspace's plan on events
// that arrive with no logged-in user session (the webhook) or to look up
// a workspace's Stripe customer before that user's own RLS-scoped session
// would normally be involved (checkout/portal session creation).
const url = import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn("SUPABASE_SERVICE_ROLE_KEY is missing — Stripe API routes will fail until it's set in .env.");
}

export const supabaseAdmin = createClient(url ?? "", serviceRoleKey ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});
