import { useState } from "react";
import { Check, Sparkles, Users, Clock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FREE_PLAN_NOTE_LIMIT } from "@/lib/data/use-notes";
import { useEffectivePlan, useIsOwnerAccount } from "@/lib/use-plan";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import { cn } from "@/lib/cn";
import type { WorkspacePlan } from "@/lib/types";

// Only features that actually exist in the app today are listed here — no
// placeholders for work that hasn't shipped. Pro's card starts with
// "Everything in Free" and Team's with "Everything in Pro" rather than
// re-listing the tier below it. Team has no team-only features built yet
// (no shared workspace membership, no seat billing), so its own list is
// intentionally empty until that work lands.
const FREE_FEATURES = [
  `Up to ${FREE_PLAN_NOTE_LIMIT} notes`,
  "Full block editor — headings, lists, tables, callouts, math, footnotes",
  "Folders, tags (with nesting), search, sort, pinning, favorites",
  "Note linking, backlinks, table of contents",
  "Images, files, PDFs, embeds, and basic drawing",
  "Markdown and plain-text export",
  "Basic sharing, with an optional burn-after-read link",
  "Basic web clipping",
  "Basic starter templates",
];

const PRO_FEATURES = [
  "Version history with one-click restore",
  "Offline → cloud synchronization",
  "Automatic recovery of unsynced offline edits",
  "OCR search inside PDFs and images",
  "Semantic search",
  "Advanced filters — status, pinned/favorite, date range",
  "Advanced export — PDF, Word (.docx), HTML, ePub, and JPG",
  "Advanced print layouts",
];

const TEAM_FEATURES: string[] = [];

async function authedFetch(path: string, body: Record<string, unknown>) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("You need to be signed in.");
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data as { url: string };
}

export function BillingSettings() {
  const plan = useEffectivePlan();
  const isOwner = useIsOwnerAccount();
  const { workspace } = useWorkspaceContext();
  const [loadingPlan, setLoadingPlan] = useState<WorkspacePlan | "portal" | null>(null);

  const upgrade = async (target: "pro" | "team") => {
    setLoadingPlan(target);
    try {
      const { url } = await authedFetch("/api/create-checkout-session", { workspaceId: workspace.id, plan: target });
      window.location.href = url;
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Couldn't start checkout.");
      setLoadingPlan(null);
    }
  };

  const manageBilling = async () => {
    setLoadingPlan("portal");
    try {
      const { url } = await authedFetch("/api/create-portal-session", { workspaceId: workspace.id });
      window.location.href = url;
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Couldn't open billing portal.");
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">Plans</p>
        <h2 className="text-xl font-bold tracking-tight text-ink">Choose how you use Scratchpad</h2>
        <p className="mx-auto mt-1.5 max-w-md text-[13px] text-faint">Upgrade or manage your workspace's subscription below.</p>
      </div>

      {isOwner && (
        <div className="mb-5 flex items-center justify-center gap-2 rounded-md bg-accent-soft px-3 py-2 text-xs font-medium text-accent-ink">
          <Crown size={14} />
          You have permanent Team access as the app owner — for life, not tied to billing.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <PlanCard title="Free" tagline="For getting your notes organized." features={FREE_FEATURES} active={plan === "free"} />
        <PlanCard
          title="Pro"
          tagline="For power users who live in their notes."
          features={PRO_FEATURES}
          precedingLabel="Everything in Free, plus:"
          icon={Sparkles}
          popular
          active={plan === "pro"}
          disabled={isOwner}
          loading={loadingPlan === "pro"}
          onSelect={() => upgrade("pro")}
        />
        <PlanCard
          title="Team"
          tagline="For groups sharing a workspace."
          features={TEAM_FEATURES}
          precedingLabel="Everything in Pro."
          icon={Users}
          active={plan === "team"}
          disabled={isOwner}
          loading={loadingPlan === "team"}
          onSelect={() => upgrade("team")}
        />
      </div>

      <div className="mt-5 flex justify-center">
        <Button variant="outline" size="sm" onClick={manageBilling} disabled={loadingPlan === "portal"}>
          {loadingPlan === "portal" ? "Opening…" : "Manage billing"}
        </Button>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-faint">
        <Clock size={12} /> Billed monthly via Stripe. Cancel any time from "Manage billing."
      </p>
    </div>
  );
}

function PlanCard({
  title,
  tagline,
  features,
  precedingLabel,
  icon: Icon,
  popular,
  active,
  disabled,
  loading,
  onSelect,
}: {
  title: string;
  tagline: string;
  features: string[];
  precedingLabel?: string;
  icon?: typeof Sparkles;
  popular?: boolean;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onSelect?: () => void;
}) {
  return (
    <Card className={cn("relative flex flex-col", active && "border-accent shadow-[0_0_0_1px_var(--sp-accent)]")}>
      {active ? (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <Check size={11} /> Current plan
        </Badge>
      ) : (
        popular && (
          <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
            <Sparkles size={11} /> Most popular
          </Badge>
        )
      )}
      <CardHeader className="items-center pb-2 text-center">
        <CardTitle className="flex items-center gap-1.5 text-lg">
          {Icon && <Icon size={16} className="text-accent" />}
          {title}
        </CardTitle>
        <CardDescription>{tagline}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {precedingLabel && <p className="mb-2.5 text-[12px] font-medium text-muted">{precedingLabel}</p>}
        {features.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-muted">
                <Check size={14} className="mt-0.5 shrink-0 text-good" />
                {f}
              </li>
            ))}
          </ul>
        ) : (
          !precedingLabel && <p className="text-[13px] text-faint">No features yet — check back soon.</p>
        )}
      </CardContent>
      <CardFooter>
        {active ? (
          <Button variant="secondary" className="w-full" disabled>
            Current plan
          </Button>
        ) : onSelect ? (
          <Button variant={popular ? "default" : "outline"} className="w-full" onClick={onSelect} disabled={disabled || loading}>
            {loading ? "Redirecting…" : `Upgrade to ${title}`}
          </Button>
        ) : (
          <p className="w-full text-center text-[11px] text-faint">Downgrade any time from "Manage billing" below.</p>
        )}
      </CardFooter>
    </Card>
  );
}
