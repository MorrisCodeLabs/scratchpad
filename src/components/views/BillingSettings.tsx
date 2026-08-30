import { useState, type ReactNode } from "react";
import { Check, Sparkles, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useIsOwnerAccount } from "@/lib/use-plan";
import { setWorkspacePlan } from "@/lib/plan-actions";
import { cn } from "@/lib/cn";
import type { WorkspacePlan } from "@/lib/types";

const FREE_FEATURES = [
  "Unlimited notes and folders",
  "Full block editor with formatting, uploads, and math",
  "Note locking, reminders, color/tags/description",
  "Bulk select, archive, and edit metadata",
  "Note outline, focus mode, section zoom",
  "Note linking and in-note find & replace",
  "Folder colors, Markdown export",
];
const PRO_FEATURES = [
  "Everything in Free",
  "Version history with restore",
  "PDF export with title page",
  "Custom note templates",
  "Note expiration and custom trash retention",
  "Bulk trash and bulk note import",
  "Date-range search filtering",
  "Custom sidebar note ordering",
  "Custom brand color",
  "Public share links, including burn-after-read",
  "Note comments and linked mentions",
  "Citation manager and bibliography",
  "Flashcard study mode",
  "Database/table blocks",
  "Encrypted notes",
  "Split-screen editing",
];
const TEAM_FEATURES = ["Everything in Pro", "Multiple seats billed per workspace", "Shared team billing (one invoice, not per-person)"];

export function BillingSettings() {
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const isOwner = useIsOwnerAccount();
  const [loading, setLoading] = useState(false);
  const plan = workspace.plan;

  const setPlan = async (next: WorkspacePlan) => {
    setLoading(true);
    const ok = await setWorkspacePlan(workspace.id, next);
    if (ok) await refreshWorkspace();
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">Plans</p>
        <h2 className="text-xl font-bold tracking-tight text-ink">Choose how you use Scratchpad</h2>
        <p className="mx-auto mt-1.5 max-w-md text-[13px] text-faint">
          Every note lives in one workspace — upgrade any time to unlock the Pro feature set below.
        </p>
      </div>

      {isOwner && (
        <div className="mb-5 flex items-center justify-center gap-2 rounded-md bg-accent-soft px-3 py-2 text-xs font-medium text-accent-ink">
          <Crown size={14} />
          You have permanent Pro access as the app owner — this doesn't depend on the plan below.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <PlanCard
          title="Free"
          tagline="For getting your notes organized."
          features={FREE_FEATURES}
          active={plan === "free"}
          cta={
            <Button
              variant={plan === "free" ? "secondary" : "outline"}
              className="w-full"
              disabled={loading || plan === "free" || isOwner}
              onClick={() => setPlan("free")}
            >
              {plan === "free" ? "Current plan" : loading ? "Working…" : "Downgrade to Free"}
            </Button>
          }
        />
        <PlanCard
          title="Pro"
          tagline="For power users who live in their notes."
          features={PRO_FEATURES}
          active={plan === "pro"}
          icon={Sparkles}
          popular
          cta={
            <Button
              variant={plan === "pro" ? "secondary" : "default"}
              className="w-full"
              disabled={loading || plan === "pro" || isOwner}
              onClick={() => setPlan("pro")}
            >
              {plan === "pro" ? "Current plan" : loading ? "Working…" : "Upgrade to Pro"}
            </Button>
          }
        />
        <PlanCard
          title="Team"
          tagline="For groups sharing a workspace."
          features={TEAM_FEATURES}
          active={plan === "team"}
          icon={Users}
          cta={
            <Button
              variant={plan === "team" ? "secondary" : "outline"}
              className="w-full"
              disabled={loading || plan === "team" || isOwner}
              onClick={() => setPlan("team")}
            >
              {plan === "team" ? "Current plan" : loading ? "Working…" : "Switch to Team"}
            </Button>
          }
        />
      </div>

      {plan === "team" && (
        <p className="mt-4 rounded-md bg-warn-soft px-3 py-2 text-center text-[11px] text-warn">
          Team billing is set up, but inviting a second person into this workspace needs a data-model change
          (shared access, membership roles) that hasn't shipped yet — for now this plan reflects billing tier only.
        </p>
      )}

      <p className="mt-5 text-center text-[11px] text-faint">
        Demo build — no payment processor is wired up, so the buttons above flip the plan directly. In production
        this is where a Stripe checkout (or similar) would land before setting the same flag.
      </p>
    </div>
  );
}

function PlanCard({
  title,
  tagline,
  features,
  active,
  icon: Icon,
  popular,
  cta,
}: {
  title: string;
  tagline: string;
  features: string[];
  active: boolean;
  icon?: typeof Sparkles;
  popular?: boolean;
  cta: ReactNode;
}) {
  return (
    <Card className={cn("relative flex flex-col", active ? "border-accent shadow-[0_0_0_1px_var(--sp-accent)]" : undefined)}>
      {popular && (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <Sparkles size={11} /> Most popular
        </Badge>
      )}
      <CardHeader className="items-center pb-2 text-center">
        <CardTitle className="flex items-center gap-1.5 text-lg">
          {Icon && <Icon size={16} className="text-accent" />}
          {title}
        </CardTitle>
        <CardDescription>{tagline}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="flex flex-col gap-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] text-muted">
              <Check size={14} className="mt-0.5 shrink-0 text-good" />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t-0 pt-0">{cta}</CardFooter>
    </Card>
  );
}
