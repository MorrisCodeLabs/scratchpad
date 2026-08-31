import Stripe from "stripe";

// Server-only — never import this from client code. The secret key must
// never end up in a browser bundle, which is why this isn't PUBLIC_-prefixed
// and this file is only ever imported from src/pages/api/*.
const secretKey = import.meta.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  // eslint-disable-next-line no-console
  console.warn("STRIPE_SECRET_KEY is missing — Stripe API routes will fail until it's set in .env.");
}

export const stripe = new Stripe(secretKey ?? "");

export const STRIPE_PRICE_IDS: Record<"pro" | "team", string> = {
  pro: import.meta.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  team: import.meta.env.STRIPE_PRICE_TEAM_MONTHLY ?? "",
};
