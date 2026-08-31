import type { APIRoute } from "astro";
import { stripe } from "@/lib/stripe-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return new Response(JSON.stringify({ error: "Not signed in." }), { status: 401 });

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: "Not signed in." }), { status: 401 });
  }

  let body: { workspaceId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request." }), { status: 400 });
  }
  const { workspaceId } = body;
  if (!workspaceId) {
    return new Response(JSON.stringify({ error: "Missing workspaceId." }), { status: 400 });
  }

  const { data: membership } = await supabaseAdmin
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!membership) {
    return new Response(JSON.stringify({ error: "You don't have access to this workspace." }), { status: 403 });
  }

  const { data: workspace } = await supabaseAdmin
    .from("workspaces")
    .select("stripe_customer_id")
    .eq("id", workspaceId)
    .single();
  if (!workspace?.stripe_customer_id) {
    return new Response(JSON.stringify({ error: "This workspace has no billing account yet." }), { status: 400 });
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripe_customer_id,
    return_url: `${origin}/settings/billing`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
