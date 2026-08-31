-- Team plan is billed per seat (STRIPE_PRICE_TEAM_MONTHLY is a per-unit
-- price; Stripe subscription quantity is the seat count). This column is
-- the read side for the UI — kept in sync by the checkout session's
-- quantity (create-checkout-session.ts) and by the webhook whenever the
-- subscription's quantity changes (stripe-webhook.ts).
alter table workspaces add column if not exists seats integer not null default 1 check (seats >= 1);
