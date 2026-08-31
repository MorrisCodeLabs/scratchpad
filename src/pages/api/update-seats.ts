import type { APIRoute } from "astro";
import { stripe } from "@/lib/stripe-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const prerender = false;

// Changes the seat quantity on a workspace's existing Team subscription,
// with Stripe prorating the difference — used by the "Update seats"
// control on an already-Team workspace, as opposed to
// create-checkout-session.ts which sets the initial seat count at signup.
export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return new Response(JSON.stringify({ error: "Not signed in." }), { status: 401 });

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: "Not signed in." }), { status: 401 });
  }

  let body: { workspaceId?: string; seats?: number };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request." }), { status: 400 });
  }
  const { workspaceId } = body;
  const seats = Math.trunc(body.seats ?? NaN);
  if (!workspaceId || !Number.isFinite(seats) || seats < 1 || seats > 100) {
    return new Response(JSON.stringify({ error: "Missing workspaceId or invalid seat count." }), { status: 400 });
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
    .select("plan, stripe_subscription_id")
    .eq("id", workspaceId)
    .single();
  if (!workspace?.stripe_subscription_id || workspace.plan !== "team") {
    return new Response(JSON.stringify({ error: "This workspace doesn't have an active Team subscription." }), { status: 400 });
  }

  const subscription = await stripe.subscriptions.retrieve(workspace.stripe_subscription_id);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) {
    return new Response(JSON.stringify({ error: "Couldn't find the subscription's billing item." }), { status: 500 });
  }

  await stripe.subscriptions.update(workspace.stripe_subscription_id, {
    items: [{ id: itemId, quantity: seats }],
    proration_behavior: "create_prorations",
  });

  // The webhook (customer.subscription.updated) will also sync this once
  // it arrives, but updating here means the UI reflects it immediately.
  await supabaseAdmin.from("workspaces").update({ seats }).eq("id", workspaceId);

  return new Response(JSON.stringify({ seats }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
