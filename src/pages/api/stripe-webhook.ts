import type { APIRoute } from "astro";
import type Stripe from "stripe";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const prerender = false;

const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

function planForPriceId(priceId: string | undefined): "pro" | "team" | null {
  if (!priceId) return null;
  if (priceId === STRIPE_PRICE_IDS.pro) return "pro";
  if (priceId === STRIPE_PRICE_IDS.team) return "team";
  return null;
}

async function setWorkspacePlanByCustomer(customerId: string, patch: Record<string, unknown>) {
  const { error } = await supabaseAdmin.from("workspaces").update(patch).eq("stripe_customer_id", customerId);
  if (error) console.error("Failed to update workspace from Stripe webhook:", error);
}

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret.", { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return new Response("Invalid signature.", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspace_id;
      const plan = session.metadata?.plan;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (workspaceId && plan && customerId) {
        await supabaseAdmin
          .from("workspaces")
          .update({
            plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
            subscription_status: "active",
          })
          .eq("id", workspaceId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = planForPriceId(priceId);
      const active = subscription.status === "active" || subscription.status === "trialing";
      await setWorkspacePlanByCustomer(customerId, {
        ...(active && plan ? { plan } : {}),
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        ...(!active ? { plan: "free" } : {}),
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      await setWorkspacePlanByCustomer(customerId, {
        plan: "free",
        stripe_subscription_id: null,
        subscription_status: "canceled",
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (customerId) {
        await setWorkspacePlanByCustomer(customerId, { subscription_status: "past_due" });
      }
      break;
    }

    default:
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
