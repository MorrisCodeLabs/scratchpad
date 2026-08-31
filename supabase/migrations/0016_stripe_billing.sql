-- Stripe billing: fields needed to correlate a workspace with its Stripe
-- customer/subscription and know whether that subscription is actually
-- active. `plan` (added in 0004) stays the source of truth for feature
-- access; these are what the webhook handler updates it from.
alter table workspaces add column if not exists stripe_customer_id text unique;
alter table workspaces add column if not exists stripe_subscription_id text unique;
alter table workspaces add column if not exists subscription_status text;

create index if not exists workspaces_stripe_customer_id_idx on workspaces (stripe_customer_id);
