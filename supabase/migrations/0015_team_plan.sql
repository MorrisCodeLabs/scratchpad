-- Widen the workspace plan check constraint to allow "team" alongside
-- "free"/"pro" (0004_pro_features.sql). Team-plan workspaces get the same
-- feature set as Pro for now; the constraint just needs to accept the
-- value so the Billing page's plan switch can set it.
alter table workspaces drop constraint if exists workspaces_plan_check;
alter table workspaces add constraint workspaces_plan_check check (plan in ('free', 'pro', 'team'));
