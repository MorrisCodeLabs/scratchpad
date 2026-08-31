import type { APIRoute } from "astro";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe-server";
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

  let body: { workspaceId?: string; plan?: "pro" | "team" };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request." }), { status: 400 });
  }
  const { workspaceId, plan } = body;
  if (!workspaceId || (plan !== "pro" && plan !== "team")) {
    return new Response(JSON.stringify({ error: "Missing workspaceId or plan." }), { status: 400 });
  }

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    return new Response(JSON.stringify({ error: `No Stripe price configured for the ${plan} plan.` }), { status: 500 });
  }

  // Confirm the caller is actually a member of this workspace before letting
  // them start a checkout for it.
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
    .select("id, name, stripe_customer_id")
    .eq("id", workspaceId)
    .single();
  if (!workspace) {
    return new Response(JSON.stringify({ error: "Workspace not found." }), { status: 404 });
  }

  let customerId = workspace.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData.user.email ?? undefined,
      name: workspace.name,
      metadata: { workspace_id: workspaceId },
    });
    customerId = customer.id;
    await supabaseAdmin.from("workspaces").update({ stripe_customer_id: customerId }).eq("id", workspaceId);
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings/billing?checkout=success`,
    cancel_url: `${origin}/settings/billing?checkout=canceled`,
    metadata: { workspace_id: workspaceId, plan },
    subscription_data: { metadata: { workspace_id: workspaceId, plan } },
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
